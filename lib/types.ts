export interface ProductVariant {
  name: string
  stock: number
}

export function normalizeVariant(v: unknown): ProductVariant {
  if (v && typeof v === 'object' && 'name' in v) return v as ProductVariant
  if (typeof v === 'string') {
    try {
      const p = JSON.parse(v)
      if (p && typeof p === 'object' && 'name' in p) return p as ProductVariant
    } catch {}
    return { name: v, stock: 0 }
  }
  return { name: String(v), stock: 0 }
}

export interface Product {
  id: string
  name: string
  category: string
  categories: string[]
  price: number
  original_price: number | null
  image_url: string | null
  image_urls: string[] | null
  description: string | null
  stock: number
  badge: 'Oferta' | 'Nuevo' | null
  variants: ProductVariant[] | null
  attributes: Record<string, string | string[]> | null
  rating: number
  reviews: number
  featured: boolean
  active: boolean
  created_at: string
  updated_at: string
}

export interface CartItem extends Product {
  quantity: number
  selectedVariant?: string
}

export interface TrustItem {
  emoji: string
  title: string
  sub: string
}

export interface HeroStat {
  value: string
  label: string
}

export interface Brand {
  name: string
  logo_url: string
}

export interface ConfigCategory {
  slug: string
  label: string
  emoji: string
  sub: string
  image: string
}

export interface SiteConfig {
  id: number
  brand_name: string
  brand_tagline: string
  brand_logo_url: string
  primary_color: string
  primary_hover_color: string
  phone: string
  whatsapp: string
  instagram: string
  facebook: string
  email: string
  address: string
  // Hero
  hero_title: string
  hero_subtitle: string
  hero_image_url: string
  hero_badge_text: string
  hero_cta_text: string
  hero_stats: HeroStat[] | null
  // Trust bar
  trust_items: TrustItem[] | null
  // Promo banner
  promo_badge_text: string
  promo_title: string
  promo_subtitle: string
  promo_image_url: string
  promo_cta_text: string
  promo_cta_link: string
  // Brands
  brands: Brand[] | null
  // Categories (home grid)
  categories: ConfigCategory[] | null
  // Commerce
  shipping_free_from: number
  installments: number
  footer_text: string
  // FAQ
  faq_items: FaqItem[] | null
  // Appearance
  dark_mode: boolean
  show_hero: boolean
  show_trust_bar: boolean
  show_promo: boolean
  show_categories: boolean
  show_brands: boolean
  show_featured: boolean
  show_low_stock_badge: boolean
  show_quantity_selector: boolean
  show_cart: boolean
  section_order: string[]
  updated_at: string
}

export interface OrderItem {
  id: string
  title: string
  quantity: number
  unit_price: number
}

export interface Order {
  id: string
  mp_payment_id: string | null
  mp_preference_id: string | null
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded'
  buyer_name: string | null
  buyer_surname: string | null
  buyer_email: string | null
  buyer_phone: string | null
  items: OrderItem[]
  total: number
  created_at: string
  updated_at: string
}

export interface FaqItem {
  question: string
  answer: string
  group: string
}

export interface AttributeDefinition {
  id: string
  name: string
  slug: string
  field_type: 'text' | 'number' | 'textarea' | 'select' | 'multiselect'
  options: string[]
  category: string | null
  is_required: boolean
  sort_order: number
  active: boolean
  created_at: string
}

export const CATEGORIES = [
  { slug: 'frenos',       label: 'Frenos',           emoji: '🔴', sub: 'Pastillas, discos, bombas',      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&auto=format&fit=crop' },
  { slug: 'motor',        label: 'Motor',             emoji: '⚙️', sub: 'Bujías, correas, bombas',        image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80&auto=format&fit=crop' },
  { slug: 'suspension',   label: 'Suspensión',        emoji: '🔩', sub: 'Amortiguadores, resortes, bujes', image: 'https://images.unsplash.com/photo-1600706975631-8fec2ee1e40b?w=600&q=80&auto=format&fit=crop' },
  { slug: 'electricidad', label: 'Electricidad',      emoji: '⚡', sub: 'Baterías, sensores, fusibles',    image: 'https://images.unsplash.com/photo-1609175332497-a00a85b5b1ef?w=600&q=80&auto=format&fit=crop' },
  { slug: 'filtros',      label: 'Filtros',           emoji: '🔵', sub: 'Aceite, aire, nafta, habitáculo', image: 'https://images.unsplash.com/photo-1590765849552-c558e3bfd2a8?w=600&q=80&auto=format&fit=crop' },
  { slug: 'aceites',      label: 'Aceites y Fluidos', emoji: '🟡', sub: 'Motor, caja, refrigerante',       image: 'https://images.unsplash.com/photo-1632823471565-1ecdf5c6da3e?w=600&q=80&auto=format&fit=crop' },
  { slug: 'iluminacion',  label: 'Iluminación',       emoji: '💡', sub: 'Faros LED, bulbos, sirenas',      image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80&auto=format&fit=crop' },
  { slug: 'carroceria',   label: 'Carrocería',        emoji: '🚗', sub: 'Paragolpes, espejos, molduras',   image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80&auto=format&fit=crop' },
] as const

export type CategorySlug = typeof CATEGORIES[number]['slug']

export const DEFAULT_CATEGORIES: ConfigCategory[] = CATEGORIES.map((c) => ({
  slug:  c.slug,
  label: c.label,
  emoji: c.emoji,
  sub:   c.sub,
  image: c.image,
}))

export const DEFAULT_TRUST_ITEMS: TrustItem[] = [
  { emoji: '🚚', title: 'Envío express',          sub: '24 a 48 horas'      },
  { emoji: '🛡️', title: 'Productos originales',   sub: 'Certificados'       },
  { emoji: '🔄', title: '30 días de garantía',    sub: 'Sin preguntas'      },
  { emoji: '💳', title: '12 cuotas sin interés',  sub: 'Todas las tarjetas' },
  { emoji: '💬', title: 'Atención personalizada', sub: 'Lun–Vie 9 a 18 hs' },
]

export const DEFAULT_HERO_STATS: HeroStat[] = [
  { value: '5.000+',       label: 'Productos'            },
  { value: '98%',          label: 'Clientes satisfechos' },
  { value: 'Todo el país', label: 'Envíos'               },
]

export const DEFAULT_BRANDS: Brand[] = [
  { name: 'Brembo', logo_url: '' },
  { name: 'Monroe', logo_url: '' },
  { name: 'NGK',    logo_url: '' },
  { name: 'Bosch',  logo_url: '' },
  { name: 'Gates',  logo_url: '' },
  { name: 'Mahle',  logo_url: '' },
  { name: 'Moura',  logo_url: '' },
  { name: 'SKF',    logo_url: '' },
]

export const DEFAULT_FAQ_ITEMS: FaqItem[] = [
  { group: 'Envíos',    question: '¿Cuánto tarda el envío?',                   answer: 'Los envíos se realizan en 24 a 48 horas hábiles a todo el país mediante correo o transporte.' },
  { group: 'Envíos',    question: '¿Hacen envíos a todo el país?',             answer: 'Sí, enviamos a toda la Argentina. En compras superiores al mínimo el envío es sin cargo.' },
  { group: 'Pagos',     question: '¿Qué medios de pago aceptan?',              answer: 'Aceptamos todas las tarjetas de crédito y débito, transferencia bancaria y Mercado Pago.' },
  { group: 'Pagos',     question: '¿Puedo pagar en cuotas?',                   answer: 'Sí, ofrecemos hasta 12 cuotas sin interés con las principales tarjetas de crédito.' },
  { group: 'Garantías', question: '¿Los productos tienen garantía?',           answer: 'Todos nuestros productos tienen garantía de 30 días contra defectos de fabricación.' },
  { group: 'Garantías', question: '¿Cómo hago un cambio o devolución?',       answer: 'Contactanos por WhatsApp o email dentro de los 30 días con el comprobante de compra.' },
  { group: 'Productos', question: '¿Los repuestos son originales?',            answer: 'Trabajamos con marcas líderes del mercado. Todos los productos son originales o de primera marca.' },
  { group: 'Productos', question: '¿Cómo sé si el repuesto es para mi auto?', answer: 'Podés consultarnos por WhatsApp indicando marca, modelo y año de tu vehículo.' },
]

export const DEFAULT_CONFIG: SiteConfig = {
  id: 1,
  brand_name:          'Mi Tienda',
  brand_tagline:       'Tu tienda de confianza',
  brand_logo_url:      '',
  primary_color:       '#f97316',
  primary_hover_color: '#ea580c',
  phone:     '',
  whatsapp:  '',
  instagram: '',
  facebook:  '',
  email:     '',
  address:   '',
  hero_title:      'Todo lo que necesitás',
  hero_subtitle:   'Más de 5.000 productos originales y de primera marca. Motores, frenos, suspensión y más.',
  hero_image_url:  '',
  hero_badge_text: '⚡ Envíos en 24–48 hs a todo el país',
  hero_cta_text:   'Ver todos los productos',
  hero_stats:      DEFAULT_HERO_STATS,
  trust_items:     DEFAULT_TRUST_ITEMS,
  promo_badge_text: 'Oferta especial',
  promo_title:     'Hasta 30% OFF en frenos y suspensión',
  promo_subtitle:  'Por tiempo limitado. Stock sujeto a disponibilidad.',
  promo_image_url: 'https://images.unsplash.com/photo-1632286338908-ab1b765e6b56?w=1200&q=80&auto=format&fit=crop',
  promo_cta_text:  'Aprovechar oferta',
  promo_cta_link:  '/productos?categoria=frenos',
  brands:          DEFAULT_BRANDS,
  categories:      DEFAULT_CATEGORIES,
  shipping_free_from: 50000,
  installments:       12,
  footer_text:        '',
  faq_items:          DEFAULT_FAQ_ITEMS,
  dark_mode:          false,
  show_hero:        true,
  show_trust_bar:   true,
  show_promo:       true,
  show_categories:  true,
  show_brands:      true,
  show_featured:          true,
  show_low_stock_badge:   true,
  show_quantity_selector: true,
  show_cart:              true,
  section_order:    ['brands', 'promo', 'hero', 'trust_bar', 'categories', 'featured'],
  updated_at: new Date().toISOString(),
}

export const DEFAULT_SECTION_ORDER = ['brands', 'promo', 'hero', 'trust_bar', 'categories', 'featured']
