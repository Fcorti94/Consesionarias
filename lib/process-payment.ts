'use server'

import { MercadoPagoConfig, Payment } from 'mercadopago'
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSiteConfig } from '@/lib/config-actions'

/* ── Entry point ── */

export async function processPayment(paymentId: string) {
  const supabase = createAdminClient()

  const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
  const paymentApi = new Payment(client)
  const payment = await paymentApi.get({ id: paymentId })

  const status       = payment.status ?? 'pending'
  const p            = payment as unknown as Record<string, unknown>
  const preferenceId = String(p.preference_id ?? '')
  const paymentMethod = String(p.payment_method_id ?? '')
  const installments  = Number(p.installments ?? 1)
  const total         = Number(payment.transaction_amount ?? 0)

  const payer        = (payment.payer ?? {}) as unknown as Record<string, unknown>
  const buyerName    = (payer.first_name as string) ?? null
  const buyerSurname = (payer.last_name  as string) ?? null
  const buyerEmail   = (payer.email      as string) ?? null
  const buyerPhone   = ((payer.phone as Record<string, unknown>)?.number as string) ?? null

  const items = (payment.additional_info?.items ?? []).map((i: Record<string, unknown>) => ({
    id:         String(i.id ?? ''),
    title:      String(i.title ?? ''),
    quantity:   Number(i.quantity ?? 1),
    unit_price: Number(i.unit_price ?? 0),
  }))

  // Find existing order — by payment ID first, then by preference ID
  let { data: existing } = await supabase
    .from('orders')
    .select('id, buyer_email, status, items, order_number')
    .eq('mp_payment_id', paymentId)
    .maybeSingle()

  if (!existing && preferenceId) {
    const { data } = await supabase
      .from('orders')
      .select('id, buyer_email, status, items, order_number')
      .eq('mp_preference_id', preferenceId)
      .maybeSingle()
    existing = data
  }

  const confirmedBuyerEmail = existing?.buyer_email ?? buyerEmail
  const wasAlreadyApproved  = existing?.status === 'approved'

  // Upsert order
  if (existing) {
    await supabase
      .from('orders')
      .update({ mp_payment_id: paymentId, status, buyer_name: buyerName, buyer_surname: buyerSurname, buyer_phone: buyerPhone, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    await supabase.from('orders').insert({
      mp_payment_id: paymentId, mp_preference_id: preferenceId, status,
      buyer_name: buyerName, buyer_surname: buyerSurname, buyer_email: buyerEmail, buyer_phone: buyerPhone,
      items, total,
    })
  }

  console.log('[processPayment]', paymentId, '| status:', status, '| wasAlreadyApproved:', wasAlreadyApproved)

  if (status === 'approved' && !wasAlreadyApproved) {
    // Decrement stock
    const itemsToDecrement = (existing?.items ?? items) as { id: string; quantity: number }[]
    await Promise.all(
      itemsToDecrement
        .filter(i => i.id)
        .map(i => supabase.rpc('decrement_product_stock', { p_id: i.id, p_qty: i.quantity }))
    )

    // Send emails
    try {
      const config = await getSiteConfig()
      const ses = buildSesClient()
      if (ses) {
        const orderNumber = existing?.order_number ?? null
        const emailData = { paymentId, orderNumber, buyerName, buyerSurname, buyerEmail: confirmedBuyerEmail, items, total, paymentMethod, installments }
        if (config.email) {
          await sendEmail(ses, {
            from:    `${config.brand_name} <${process.env.AWS_SES_FROM_EMAIL!}>`,
            to:      config.email,
            subject: `Nuevo pedido ${fmtNum(orderNumber)} — ${fmt(total)} — ${[buyerName, buyerSurname].filter(Boolean).join(' ')}`.trim(),
            html:    buildStoreHtml(emailData, config),
          })
        }
        if (confirmedBuyerEmail) {
          await sendEmail(ses, {
            from:    `${config.brand_name} <${process.env.AWS_SES_FROM_EMAIL!}>`,
            to:      confirmedBuyerEmail,
            subject: `Tu pedido ${fmtNum(orderNumber)} en ${config.brand_name} fue confirmado`.trim(),
            html:    buildBuyerHtml(emailData, config),
          })
        }
      }
    } catch (err) {
      console.error('[processPayment] email error:', err)
    }
  }

  return { status, orderNumber: existing?.order_number ?? null }
}

/* ── Helpers ── */

function buildSesClient() {
  const key = process.env.AWS_SES_ACCESS_KEY_ID
  const secret = process.env.AWS_SES_SECRET_ACCESS_KEY
  if (!key || !secret) return null
  return new SESv2Client({ region: process.env.AWS_SES_REGION ?? 'us-east-1', credentials: { accessKeyId: key, secretAccessKey: secret } })
}

async function sendEmail(ses: SESv2Client, { from, to, subject, html }: { from: string; to: string; subject: string; html: string }) {
  await ses.send(new SendEmailCommand({
    FromEmailAddress: from,
    Destination: { ToAddresses: [to] },
    Content: { Simple: { Subject: { Data: subject, Charset: 'UTF-8' }, Body: { Html: { Data: html, Charset: 'UTF-8' } } } },
  }))
}

function fmt(n: number) { return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }) }
function fmtNum(n: number | null) { return n ? `#${String(n).padStart(4, '0')}` : '' }

function paymentLabel(method: string, installments: number) {
  const map: Record<string, string> = { credit_card: 'Tarjeta de crédito', debit_card: 'Tarjeta de débito', account_money: 'Dinero en cuenta MP', pix: 'PIX', bank_transfer: 'Transferencia bancaria' }
  const label = map[method] ?? method
  return installments > 1 ? `${label} — ${installments} cuotas` : label
}

function itemsTable(items: { title: string; quantity: number; unit_price: number }[]) {
  const rows = items.map(i => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9">${i.title}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;text-align:center">${i.quantity}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;text-align:right">${fmt(i.unit_price)}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600">${fmt(i.unit_price * i.quantity)}</td>
    </tr>`).join('')
  return `<table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;margin:16px 0">
    <thead><tr style="background:#f8fafc">
      <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;color:#64748b;font-weight:600">Producto</th>
      <th style="padding:10px 14px;text-align:center;font-size:11px;text-transform:uppercase;color:#64748b;font-weight:600">Cant.</th>
      <th style="padding:10px 14px;text-align:right;font-size:11px;text-transform:uppercase;color:#64748b;font-weight:600">P. Unit.</th>
      <th style="padding:10px 14px;text-align:right;font-size:11px;text-transform:uppercase;color:#64748b;font-weight:600">Subtotal</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`
}

type EmailData = { paymentId: string; orderNumber: number | null; buyerName: string | null; buyerSurname: string | null; buyerEmail: string | null; items: { title: string; quantity: number; unit_price: number }[]; total: number; paymentMethod: string; installments: number }

function wrapper(color: string, content: string) {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:580px;margin:0 auto;color:#1e293b;background:#f8fafc;padding:24px">
    <div style="background:${color};padding:20px 28px;border-radius:12px 12px 0 0"><h1 style="color:white;margin:0;font-size:18px;font-weight:700">EcoAutoparts</h1></div>
    <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">${content}</div>
    <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:20px">Este es un mensaje automático, por favor no respondas a este email.</p>
  </div>`
}

function buildStoreHtml(d: EmailData, config: { primary_color: string; brand_name: string }) {
  return wrapper(config.primary_color, `
    <h2 style="margin:0 0 20px;font-size:20px">🛒 Nuevo pedido recibido</h2>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin-bottom:20px;font-size:14px;color:#166534">
      ✅ Pago aprobado${d.orderNumber ? ` · Pedido <strong>${fmtNum(d.orderNumber)}</strong>` : ` · MP <strong>#${d.paymentId}</strong>`}
    </div>
    <table style="width:100%;font-size:14px;border-collapse:collapse">
      <tr><td style="padding:4px 0;color:#64748b;width:130px">Comprador</td><td><strong>${[d.buyerName, d.buyerSurname].filter(Boolean).join(' ') || '—'}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#64748b">Email</td><td>${d.buyerEmail ?? '—'}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b">Método de pago</td><td>${paymentLabel(d.paymentMethod, d.installments)}</td></tr>
    </table>
    ${itemsTable(d.items)}
    <div style="text-align:right;font-size:22px;font-weight:800;color:#0f172a;margin-top:8px">Total: ${fmt(d.total)}</div>
    <div style="margin-top:24px;padding-top:20px;border-top:1px solid #f1f5f9">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/admin/ordenes" style="display:inline-block;background:${config.primary_color};color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px">Ver pedido en el panel →</a>
    </div>`)
}

function buildBuyerHtml(d: EmailData, config: { primary_color: string; brand_name: string; whatsapp: string; email: string }) {
  const contactLine = config.whatsapp
    ? `<a href="https://wa.me/${config.whatsapp.replace(/\D/g, '')}" style="color:${config.primary_color}">WhatsApp</a>`
    : config.email ? `<a href="mailto:${config.email}" style="color:${config.primary_color}">${config.email}</a>` : ''
  return wrapper(config.primary_color, `
    <h2 style="margin:0 0 8px;font-size:20px">¡Gracias por tu compra!</h2>
    <p style="color:#64748b;margin:0 0 24px;font-size:15px">Hola${d.buyerName ? ` ${d.buyerName}` : ''}, tu pago fue procesado correctamente.</p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin-bottom:20px;font-size:14px;color:#166534">
      ✅ Pago aprobado${d.orderNumber ? ` · Pedido <strong>${fmtNum(d.orderNumber)}</strong>` : ''}
    </div>
    <p style="font-size:13px;color:#64748b;margin:0 0 4px">Método de pago</p>
    <p style="font-size:14px;font-weight:600;margin:0 0 20px">${paymentLabel(d.paymentMethod, d.installments)}</p>
    <p style="font-size:13px;color:#64748b;margin:0 0 4px">Detalle del pedido</p>
    ${itemsTable(d.items)}
    <div style="text-align:right;font-size:20px;font-weight:800;color:#0f172a;margin-top:8px">Total pagado: ${fmt(d.total)}</div>
    ${contactLine ? `<div style="margin-top:28px;padding:16px;background:#f8fafc;border-radius:8px;font-size:13px;color:#475569">¿Tenés alguna consulta? Contactanos por ${contactLine}.</div>` : ''}`)
}
