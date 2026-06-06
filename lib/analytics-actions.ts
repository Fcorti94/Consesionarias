'use server'

import { createClient } from '@/lib/supabase/server'

export async function trackWhatsappClick(
  productId: string,
  productName: string,
  source: 'card' | 'modal' | 'detail'
) {
  try {
    const supabase = await createClient()
    await supabase.from('whatsapp_clicks').insert({
      product_id: productId,
      product_name: productName,
      source,
    })
  } catch {
    // Silently fail — never block user navigation
  }
}

export async function trackProductView(productId: string, productName: string) {
  try {
    const supabase = await createClient()
    await supabase.from('product_views').insert({
      product_id: productId,
      product_name: productName,
    })
  } catch {
    // Silently fail
  }
}
