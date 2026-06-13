'use server'

import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createClient } from '@/lib/supabase/server'

export interface MPItem {
  id: string
  title: string
  quantity: number
  unit_price: number
  image_url?: string
}

export interface MPPayer {
  name: string
  surname: string
  email: string
  phone: string
}

export async function createMPPreference(items: MPItem[], payer: MPPayer) {
  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) throw new Error('MP_ACCESS_TOKEN no configurado')

  const client = new MercadoPagoConfig({ accessToken })
  const preference = new Preference(client)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'

  try {
    const result = await preference.create({
      body: {
        items: items.map((i) => ({
          id: i.id,
          title: i.title.slice(0, 256),
          quantity: i.quantity,
          unit_price: Math.round(i.unit_price),
          currency_id: 'ARS',
          ...(i.image_url ? { picture_url: i.image_url } : {}),
        })),
        payer: {
          name: payer.name,
          surname: payer.surname,
          email: payer.email,
          ...(payer.phone ? { phone: { area_code: '54', number: payer.phone } } : {}),
        },
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        back_urls: {
          success: `${baseUrl}/checkout/success`,
          failure: `${baseUrl}/checkout/failure`,
          pending: `${baseUrl}/checkout/pending`,
        },
        ...(baseUrl.startsWith('http://localhost') ? {} : { auto_return: 'approved' as const }),
      },
    })

    if (!result.init_point) throw new Error('No se pudo crear la preferencia de pago')
    return { init_point: result.init_point, preference_id: String(result.id ?? '') }

  } catch (err: unknown) {
    // Log full error server-side for debugging
    console.error('[MP Error]', JSON.stringify(err, null, 2))

    // Extract readable message from MP SDK error
    if (err && typeof err === 'object') {
      const mpErr = err as Record<string, unknown>
      if (mpErr.message) throw new Error(String(mpErr.message))
      if (mpErr.cause) {
        const causes = mpErr.cause as Array<{ description?: string }>
        const desc = Array.isArray(causes) ? causes.map(c => c.description).join(', ') : String(mpErr.cause)
        throw new Error(`Error de Mercado Pago: ${desc}`)
      }
    }
    throw new Error('No se pudo conectar con Mercado Pago. Revisá las credenciales.')
  }
}

export async function startCheckout(items: MPItem[], payer: MPPayer) {
  const { init_point, preference_id } = await createMPPreference(items, payer)

  const total = items.reduce((s, i) => s + Math.round(i.unit_price) * i.quantity, 0)

  try {
    const supabase = await createClient()
    await supabase.from('orders').insert({
      mp_preference_id: preference_id,
      status: 'pending',
      buyer_name:    payer.name    || null,
      buyer_surname: payer.surname || null,
      buyer_email:   payer.email   || null,
      buyer_phone:   payer.phone   || null,
      items: items.map(i => ({ id: i.id, title: i.title, quantity: i.quantity, unit_price: i.unit_price })),
      total,
    })
  } catch (err) {
    // Non-fatal: log and continue — buyer can still pay
    console.error('[startCheckout] DB insert failed', err)
  }

  return { init_point }
}
