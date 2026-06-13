import { NextRequest, NextResponse } from 'next/server'
import { processPayment } from '@/lib/process-payment'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[MP Webhook] received:', JSON.stringify({ type: body.type, id: body.data?.id }))

    if (body.type !== 'payment' || !body.data?.id) {
      return NextResponse.json({ ok: true })
    }

    await processPayment(String(body.data.id))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[MP Webhook] error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
