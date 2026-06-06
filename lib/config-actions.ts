'use server'

import { createClient } from '@/lib/supabase/server'
import {
  DEFAULT_CONFIG,
  DEFAULT_TRUST_ITEMS,
  DEFAULT_HERO_STATS,
  DEFAULT_BRANDS,
  DEFAULT_CATEGORIES,
  DEFAULT_FAQ_ITEMS,
  DEFAULT_SECTION_ORDER,
} from '@/lib/types'
import type { SiteConfig, FaqItem } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('site_config').select('*').single()
    if (!data) return DEFAULT_CONFIG
    return {
      ...DEFAULT_CONFIG,
      ...data,
      trust_items: Array.isArray(data.trust_items) ? data.trust_items : DEFAULT_TRUST_ITEMS,
      hero_stats:  Array.isArray(data.hero_stats)  ? data.hero_stats  : DEFAULT_HERO_STATS,
      brands:      Array.isArray(data.brands)      ? data.brands      : DEFAULT_BRANDS,
      categories:  Array.isArray(data.categories)  ? data.categories  : DEFAULT_CATEGORIES,
      faq_items:   Array.isArray(data.faq_items)   ? data.faq_items   : DEFAULT_FAQ_ITEMS,
      dark_mode:   typeof data.dark_mode === 'boolean' ? data.dark_mode : false,
      show_hero:        typeof data.show_hero === 'boolean' ? data.show_hero : true,
      show_trust_bar:   typeof data.show_trust_bar === 'boolean' ? data.show_trust_bar : true,
      show_promo:       typeof data.show_promo === 'boolean' ? data.show_promo : true,
      show_categories:  typeof data.show_categories === 'boolean' ? data.show_categories : true,
      show_brands:      typeof data.show_brands === 'boolean' ? data.show_brands : true,
      show_featured:       typeof data.show_featured === 'boolean' ? data.show_featured : true,
      show_low_stock_badge:   typeof data.show_low_stock_badge   === 'boolean' ? data.show_low_stock_badge   : true,
      show_quantity_selector: typeof data.show_quantity_selector === 'boolean' ? data.show_quantity_selector : true,
      promo_badge_text: typeof data.promo_badge_text === 'string' ? data.promo_badge_text : DEFAULT_CONFIG.promo_badge_text,
      section_order: Array.isArray(data.section_order) ? data.section_order : DEFAULT_SECTION_ORDER,
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

export async function updateSiteConfig(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  // Parse trust items (5 slots)
  const trust_items = Array.from({ length: 5 }, (_, i) => ({
    emoji: (formData.get(`trust_${i}_emoji`) as string ?? '').trim(),
    title: (formData.get(`trust_${i}_title`) as string ?? '').trim(),
    sub:   (formData.get(`trust_${i}_sub`)   as string ?? '').trim(),
  })).filter(item => item.title)

  // Parse hero stats (3 slots)
  const hero_stats = Array.from({ length: 3 }, (_, i) => ({
    value: (formData.get(`stat_${i}_value`) as string ?? '').trim(),
    label: (formData.get(`stat_${i}_label`) as string ?? '').trim(),
  })).filter(s => s.value)

  // Parse brands (12 slots, skip empty names)
  const brands = Array.from({ length: 12 }, (_, i) => ({
    name:     (formData.get(`brand_${i}_name`)     as string ?? '').trim(),
    logo_url: (formData.get(`brand_${i}_logo_url`) as string ?? '').trim(),
  })).filter(b => b.name)

  const { error } = await supabase
    .from('site_config')
    .update({
      brand_name:          formData.get('brand_name') as string,
      brand_tagline:       formData.get('brand_tagline') as string,
      brand_logo_url:      formData.get('brand_logo_url') as string,
      primary_color:       formData.get('primary_color') as string,
      primary_hover_color: formData.get('primary_hover_color') as string,
      phone:               formData.get('phone') as string,
      whatsapp:            formData.get('whatsapp') as string,
      instagram:           formData.get('instagram') as string,
      email:               formData.get('email') as string,
      address:             formData.get('address') as string,
      hero_title:          formData.get('hero_title') as string,
      hero_subtitle:       formData.get('hero_subtitle') as string,
      hero_image_url:      formData.get('hero_image_url') as string,
      hero_badge_text:     formData.get('hero_badge_text') as string,
      hero_cta_text:       formData.get('hero_cta_text') as string,
      hero_stats,
      trust_items,
      promo_title:         formData.get('promo_title') as string,
      promo_subtitle:      formData.get('promo_subtitle') as string,
      promo_image_url:     formData.get('promo_image_url') as string,
      promo_cta_text:      formData.get('promo_cta_text') as string,
      promo_cta_link:      formData.get('promo_cta_link') as string,
      brands,
      shipping_free_from:  parseInt(formData.get('shipping_free_from') as string) || 0,
      installments:        parseInt(formData.get('installments') as string) || 12,
      footer_text:         formData.get('footer_text') as string,
      dark_mode:           formData.get('dark_mode') === 'on',
      show_hero:        formData.get('show_hero') === 'on',
      show_trust_bar:   formData.get('show_trust_bar') === 'on',
      show_promo:       formData.get('show_promo') === 'on',
      show_categories:  formData.get('show_categories') === 'on',
      show_brands:      formData.get('show_brands') === 'on',
      show_featured:        formData.get('show_featured') === 'on',
      show_low_stock_badge:   formData.get('show_low_stock_badge')   === 'on',
      show_quantity_selector: formData.get('show_quantity_selector') === 'on',
      promo_badge_text:     formData.get('promo_badge_text') as string,
      section_order: (() => {
        try {
          const raw = formData.get('section_order') as string
          const parsed = JSON.parse(raw)
          return Array.isArray(parsed) ? parsed : DEFAULT_SECTION_ORDER
        } catch {
          return DEFAULT_SECTION_ORDER
        }
      })(),
      updated_at:          new Date().toISOString(),
    })
    .eq('id', 1)

  if (error) throw new Error(error.message)

  revalidatePath('/', 'layout')
}

export async function saveCategories(items: import('@/lib/types').ConfigCategory[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { error } = await supabase
    .from('site_config')
    .update({ categories: items, updated_at: new Date().toISOString() })
    .eq('id', 1)

  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function getFaqItems(): Promise<FaqItem[]> {
  const config = await getSiteConfig()
  return config.faq_items ?? DEFAULT_FAQ_ITEMS
}

export async function saveFaqItems(items: FaqItem[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { error } = await supabase
    .from('site_config')
    .update({ faq_items: items, updated_at: new Date().toISOString() })
    .eq('id', 1)

  if (error) throw new Error(error.message)
  revalidatePath('/faq')
  revalidatePath('/admin/faq')
}
