import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@/lib/supabase/server'
import { getSiteConfig } from '@/lib/config-actions'
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.type !== 'payment' || !body.data?.id) {
      return NextResponse.json({ ok: true })
    }

    const paymentId = String(body.data.id)

    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
    const paymentApi = new Payment(client)
    const payment = await paymentApi.get({ id: paymentId })

    const status = payment.status ?? 'pending'

    const payer = (payment.payer ?? {}) as unknown as Record<string, unknown>
    const buyerName    = (payer.first_name as string)  ?? null
    const buyerSurname = (payer.last_name  as string)  ?? null
    const buyerEmail   = (payer.email      as string)  ?? null
    const buyerPhone   = ((payer.phone as Record<string,unknown>)?.number as string) ?? null

    const items = (payment.additional_info?.items ?? []).map((i: Record<string,unknown>) => ({
      id:         String(i.id ?? ''),
      title:      String(i.title ?? ''),
      quantity:   Number(i.quantity ?? 1),
      unit_price: Number(i.unit_price ?? 0),
    }))

    const total          = Number(payment.transaction_amount ?? 0)
    const p              = payment as unknown as Record<string, unknown>
    const paymentMethod  = String(p.payment_method_id ?? '')
    const installments   = Number(p.installments ?? 1)
    const preferenceId   = String(p.preference_id ?? '')

    const supabase = await createClient()

    // Look up existing order by payment ID first, then by preference ID (pre-inserted at checkout)
    let { data: existing } = await supabase
      .from('orders')
      .select('id, buyer_email, status, items')
      .eq('mp_payment_id', paymentId)
      .maybeSingle()

    if (!existing && preferenceId) {
      const { data } = await supabase
        .from('orders')
        .select('id, buyer_email, status, items')
        .eq('mp_preference_id', preferenceId)
        .maybeSingle()
      existing = data
    }

    // Prefer the email the user typed in the form (pre-inserted); fall back to MP payer email
    const confirmedBuyerEmail = existing?.buyer_email ?? buyerEmail

    if (existing) {
      await supabase
        .from('orders')
        .update({
          mp_payment_id: paymentId,
          status,
          buyer_name:    buyerName,
          buyer_surname: buyerSurname,
          // Keep the form email — don't overwrite with MP account email
          buyer_phone:   buyerPhone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('orders').insert({
        mp_payment_id:    paymentId,
        mp_preference_id: preferenceId,
        status,
        buyer_name:    buyerName,
        buyer_surname: buyerSurname,
        buyer_email:   buyerEmail,
        buyer_phone:   buyerPhone,
        items,
        total,
      })
    }

    const wasAlreadyApproved = existing?.status === 'approved'

    if (status === 'approved' && !wasAlreadyApproved) {
      // Decrement stock atomically for each purchased item
      const itemsToDecrement = (existing?.items ?? items) as { id: string; quantity: number }[]
      await Promise.all(
        itemsToDecrement
          .filter(i => i.id)
          .map(i => supabase.rpc('decrement_product_stock', { p_id: i.id, p_qty: i.quantity }))
      )

      try {
        const config = await getSiteConfig()
        const ses = buildSesClient()
        if (ses) {
          const emailData = {
            paymentId, buyerName, buyerSurname, buyerEmail,
            items, total, paymentMethod, installments,
          }
          if (config.email) {
            await sendEmail(ses, {
              from:    buildFromAddress(config.brand_name),
              to:      config.email,
              subject: buildStoreSubject(total, buyerName, buyerSurname),
              html:    buildStoreHtml(emailData, config),
            })
          }
          if (confirmedBuyerEmail) {
            await sendEmail(ses, {
              from:    buildFromAddress(config.brand_name),
              to:      confirmedBuyerEmail,
              subject: `Tu pedido en ${config.brand_name} fue confirmado`,
              html:    buildBuyerHtml({ ...emailData, buyerEmail: confirmedBuyerEmail }, config),
            })
          }
        }
      } catch (emailErr) {
        // Email failure must not block order processing
        console.error('[Webhook MP] SES error:', emailErr)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Webhook MP]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

/* ── SES helpers ── */

function buildSesClient() {
  const key    = process.env.AWS_SES_ACCESS_KEY_ID
  const secret = process.env.AWS_SES_SECRET_ACCESS_KEY
  const region = process.env.AWS_SES_REGION ?? 'us-east-1'
  if (!key || !secret) return null
  return new SESv2Client({
    region,
    credentials: { accessKeyId: key, secretAccessKey: secret },
  })
}

async function sendEmail(ses: SESv2Client, {
  from, to, subject, html,
}: { from: string; to: string; subject: string; html: string }) {
  await ses.send(new SendEmailCommand({
    FromEmailAddress: from,
    Destination: { ToAddresses: [to] },
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body:    { Html: { Data: html, Charset: 'UTF-8' } },
      },
    },
  }))
}

function buildFromAddress(brandName: string) {
  const from = process.env.AWS_SES_FROM_EMAIL!
  return `${brandName} <${from}>`
}

/* ── Template helpers ── */

function fmt(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

function buildStoreSubject(total: number, name: string | null, surname: string | null) {
  return `Nuevo pedido — ${fmt(total)} — ${[name, surname].filter(Boolean).join(' ')}`.trim()
}

function itemsTable(items: { title: string; quantity: number; unit_price: number }[]) {
  const rows = items.map(i => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9">${i.title}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;text-align:center">${i.quantity}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;text-align:right">${fmt(i.unit_price)}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600">${fmt(i.unit_price * i.quantity)}</td>
    </tr>`).join('')

  return `
    <table style="width:100%;border-collapse:collapse;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;margin:16px 0">
      <thead>
        <tr style="background:#f8fafc">
          <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;color:#64748b;font-weight:600">Producto</th>
          <th style="padding:10px 14px;text-align:center;font-size:11px;text-transform:uppercase;color:#64748b;font-weight:600">Cant.</th>
          <th style="padding:10px 14px;text-align:right;font-size:11px;text-transform:uppercase;color:#64748b;font-weight:600">P. Unit.</th>
          <th style="padding:10px 14px;text-align:right;font-size:11px;text-transform:uppercase;color:#64748b;font-weight:600">Subtotal</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`
}

function paymentLabel(method: string, installments: number) {
  const map: Record<string, string> = {
    credit_card: 'Tarjeta de crédito',
    debit_card:  'Tarjeta de débito',
    account_money: 'Dinero en cuenta MP',
    pix: 'PIX',
    bank_transfer: 'Transferencia bancaria',
  }
  const label = map[method] ?? method
  return installments > 1 ? `${label} — ${installments} cuotas` : label
}

function wrapper(primaryColor: string, content: string) {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:580px;margin:0 auto;color:#1e293b;background:#f8fafc;padding:24px">
      <div style="background:${primaryColor};padding:20px 28px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:18px;font-weight:700">EcoAutoparts</h1>
      </div>
      <div style="background:#ffffff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
        ${content}
      </div>
      <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:20px">
        Este es un mensaje automático, por favor no respondas a este email.
      </p>
    </div>`
}

type EmailData = {
  paymentId: string
  buyerName: string | null
  buyerSurname: string | null
  buyerEmail: string | null
  items: { title: string; quantity: number; unit_price: number }[]
  total: number
  paymentMethod: string
  installments: number
}

function buildStoreHtml(d: EmailData, config: { primary_color: string; brand_name: string }) {
  const content = `
    <h2 style="margin:0 0 20px;font-size:20px">🛒 Nuevo pedido recibido</h2>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin-bottom:20px;font-size:14px;color:#166534">
      ✅ Pago aprobado · ID <strong>#${d.paymentId}</strong>
    </div>

    <table style="width:100%;font-size:14px;border-collapse:collapse">
      <tr><td style="padding:4px 0;color:#64748b;width:130px">Comprador</td><td><strong>${[d.buyerName, d.buyerSurname].filter(Boolean).join(' ') || '—'}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#64748b">Email</td><td>${d.buyerEmail ?? '—'}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b">Método de pago</td><td>${paymentLabel(d.paymentMethod, d.installments)}</td></tr>
    </table>

    ${itemsTable(d.items)}

    <div style="text-align:right;font-size:22px;font-weight:800;color:#0f172a;margin-top:8px">
      Total: ${fmt(d.total)}
    </div>

    <div style="margin-top:24px;padding-top:20px;border-top:1px solid #f1f5f9;font-size:13px;color:#64748b">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/admin/ordenes" style="display:inline-block;background:${config.primary_color};color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px">
        Ver pedido en el panel →
      </a>
    </div>`

  return wrapper(config.primary_color, content)
}

function buildBuyerHtml(d: EmailData, config: { primary_color: string; brand_name: string; phone: string; whatsapp: string; email: string }) {
  const contactLine = config.whatsapp
    ? `<a href="https://wa.me/${config.whatsapp.replace(/\D/g,'')}" style="color:${config.primary_color}">WhatsApp</a>`
    : config.email ? `<a href="mailto:${config.email}" style="color:${config.primary_color}">${config.email}</a>` : ''

  const content = `
    <h2 style="margin:0 0 8px;font-size:20px">¡Gracias por tu compra!</h2>
    <p style="color:#64748b;margin:0 0 24px;font-size:15px">
      Hola${d.buyerName ? ` ${d.buyerName}` : ''}, tu pago fue procesado correctamente.
    </p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin-bottom:20px;font-size:14px;color:#166534">
      ✅ Pago aprobado · ID <strong>#${d.paymentId}</strong>
    </div>

    <p style="font-size:13px;color:#64748b;margin:0 0 4px">Método de pago</p>
    <p style="font-size:14px;font-weight:600;margin:0 0 20px">${paymentLabel(d.paymentMethod, d.installments)}</p>

    <p style="font-size:13px;color:#64748b;margin:0 0 4px">Detalle del pedido</p>
    ${itemsTable(d.items)}

    <div style="text-align:right;font-size:20px;font-weight:800;color:#0f172a;margin-top:8px">
      Total pagado: ${fmt(d.total)}
    </div>

    ${contactLine ? `
    <div style="margin-top:28px;padding:16px;background:#f8fafc;border-radius:8px;font-size:13px;color:#475569">
      ¿Tenés alguna consulta sobre tu pedido? Contactanos por ${contactLine}.
    </div>` : ''}
  `

  return wrapper(config.primary_color, content)
}
