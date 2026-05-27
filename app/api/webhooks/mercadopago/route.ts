import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@/lib/supabase/server'
import { getSiteConfig } from '@/lib/config-actions'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // MP envía distintos tipos de notificaciones; solo nos interesan los pagos
    if (body.type !== 'payment' || !body.data?.id) {
      return NextResponse.json({ ok: true })
    }

    const paymentId = String(body.data.id)

    // Consultar el pago en la API de MP
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
    const paymentApi = new Payment(client)
    const payment = await paymentApi.get({ id: paymentId })

    const status = payment.status ?? 'pending'

    // Datos del comprador
    const payer = payment.payer ?? {}
    const buyerName    = (payer as Record<string,unknown>).first_name as string ?? null
    const buyerSurname = (payer as Record<string,unknown>).last_name  as string ?? null
    const buyerEmail   = (payer as Record<string,unknown>).email       as string ?? null
    const buyerPhone   = ((payer as Record<string,unknown>).phone as Record<string,unknown>)?.number as string ?? null

    // Items del pago
    const items = (payment.additional_info?.items ?? []).map((i: Record<string,unknown>) => ({
      id:         String(i.id ?? ''),
      title:      String(i.title ?? ''),
      quantity:   Number(i.quantity ?? 1),
      unit_price: Number(i.unit_price ?? 0),
    }))

    const total = Number(payment.transaction_amount ?? 0)

    // Guardar / actualizar la orden en Supabase
    const supabase = await createClient()
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('mp_payment_id', paymentId)
      .single()

    if (existing) {
      await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('mp_payment_id', paymentId)
    } else {
      await supabase.from('orders').insert({
        mp_payment_id:    paymentId,
        mp_preference_id: String(payment.order?.id ?? ''),
        status,
        buyer_name:    buyerName,
        buyer_surname: buyerSurname,
        buyer_email:   buyerEmail,
        buyer_phone:   buyerPhone,
        items,
        total,
      })
    }

    // Enviar email solo cuando el pago se aprueba por primera vez
    if (status === 'approved' && !existing) {
      await sendOrderEmail({ paymentId, buyerName, buyerSurname, buyerEmail, items, total })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Webhook MP]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

async function sendOrderEmail({
  paymentId, buyerName, buyerSurname, buyerEmail, items, total,
}: {
  paymentId: string
  buyerName: string | null
  buyerSurname: string | null
  buyerEmail: string | null
  items: { title: string; quantity: number; unit_price: number }[]
  total: number
}) {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return

  const config = await getSiteConfig()
  const toEmail = config.email
  if (!toEmail) return

  const fmt = (n: number) =>
    n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

  const itemsHtml = items.map((i) =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">${i.title}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right">${fmt(i.unit_price * i.quantity)}</td>
    </tr>`
  ).join('')

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
      <div style="background:${config.primary_color};padding:24px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:20px">🎉 Nuevo pedido recibido</h1>
      </div>
      <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">
        <p style="margin:0 0 16px"><strong>Comprador:</strong> ${buyerName ?? ''} ${buyerSurname ?? ''}</p>
        <p style="margin:0 0 16px"><strong>Email:</strong> ${buyerEmail ?? '-'}</p>
        <p style="margin:0 0 20px"><strong>Pago MP:</strong> #${paymentId}</p>

        <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0">
          <thead>
            <tr style="background:#f1f5f9">
              <th style="padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#64748b">Producto</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;text-transform:uppercase;color:#64748b">Cant.</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;text-transform:uppercase;color:#64748b">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:12px;font-weight:bold">Total</td>
              <td style="padding:12px;font-weight:bold;text-align:right;font-size:18px">${fmt(total)}</td>
            </tr>
          </tfoot>
        </table>

        <p style="margin:20px 0 0;font-size:13px;color:#64748b">
          Podés ver todos los pedidos en tu
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/ordenes" style="color:${config.primary_color}">panel de administración</a>.
        </p>
      </div>
    </div>
  `

  const resend = new Resend(resendKey)
  await resend.emails.send({
    from: `${config.brand_name} <onboarding@resend.dev>`,
    to:   [toEmail],
    subject: `Nuevo pedido — ${fmt(total)} — ${buyerName ?? ''} ${buyerSurname ?? ''}`.trim(),
    html,
  })
}
