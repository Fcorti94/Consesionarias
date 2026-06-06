export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSiteConfig } from '@/lib/config-actions'
import HeaderWrapper from '@/components/HeaderWrapper'
import ProductCard from '@/components/ProductCard'
import BrandsCarousel from '@/components/BrandsCarousel'
import {
  DEFAULT_TRUST_ITEMS,
  DEFAULT_HERO_STATS,
  DEFAULT_BRANDS,
  DEFAULT_CATEGORIES,
  DEFAULT_SECTION_ORDER,
} from '@/lib/types'
import type { Product } from '@/lib/types'

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products').select('*')
      .eq('featured', true).eq('active', true)
      .order('created_at', { ascending: false }).limit(8)
    return data ?? []
  } catch {
    return []
  }
}

function fmt(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export default async function HomePage() {
  let featured: Product[] = []
  let config = (await import('@/lib/types')).DEFAULT_CONFIG

  try {
    const results = await Promise.all([getFeaturedProducts(), getSiteConfig()])
    featured = results[0]
    config = results[1]
  } catch (err) {
    console.error('[HomePage] Error loading data:', err)
  }

  const heroImage = config.hero_image_url ||
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1600&q=80&auto=format&fit=crop'

  const promoImage = config.promo_image_url ||
    'https://images.unsplash.com/photo-1632286338908-ab1b765e6b56?w=1200&q=80&auto=format&fit=crop'

  const contactHref = config.whatsapp
    ? `https://wa.me/${config.whatsapp.replace(/\D/g, '')}`
    : config.phone ? `tel:${config.phone}` : '#'

  const instagramHref = config.instagram
    ? (config.instagram.startsWith('http') ? config.instagram : `https://instagram.com/${config.instagram.replace('@', '')}`)
    : '#'

  const trustItems  = Array.isArray(config.trust_items)  ? config.trust_items  : DEFAULT_TRUST_ITEMS
  const heroStats   = Array.isArray(config.hero_stats)   ? config.hero_stats   : DEFAULT_HERO_STATS
  const brands      = Array.isArray(config.brands)       ? config.brands       : DEFAULT_BRANDS
  const categories  = Array.isArray(config.categories)   ? config.categories   : DEFAULT_CATEGORIES
  const sectionOrder = Array.isArray(config.section_order) ? config.section_order : DEFAULT_SECTION_ORDER

  function renderSection(id: string) {
    switch (id) {
      case 'brands':
        return config.show_brands && brands.length > 0 ? (
          <section key="brands" className="bg-white border-b border-slate-100 py-10">
            <div className="max-w-7xl mx-auto px-4">
              <p className="text-center text-slate-400 text-sm font-medium uppercase tracking-widest mb-7">
                Trabajamos con las mejores marcas
              </p>
              <BrandsCarousel brands={brands} />
            </div>
          </section>
        ) : null

      case 'promo':
        return config.show_promo && config.promo_title ? (
          <section key="promo" className="max-w-7xl mx-auto px-4 py-14">
            <div className="relative rounded-3xl overflow-hidden">
              <img src={promoImage} alt="Promo" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-transparent" />
              <div className="relative px-6 md:px-14 py-10 md:py-20 max-w-lg">
                <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white mb-4" style={{ backgroundColor: 'var(--primary)' }}>
                  {config.promo_badge_text || 'Oferta especial'}
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
                  {config.promo_title}
                </h2>
                <p className="text-slate-400 mb-7">{config.promo_subtitle}</p>
                <Link
                  href={config.promo_cta_link || '/productos'}
                  className="inline-block font-bold px-7 py-3.5 rounded-xl text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {config.promo_cta_text || 'Ver oferta'}
                </Link>
              </div>
            </div>
          </section>
        ) : null

      case 'hero':
        return config.show_hero ? (
          <section key="hero" className="relative min-h-[580px] md:min-h-[680px] flex items-center overflow-hidden">
            <div className="absolute inset-0">
              <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-transparent" />
            </div>
            <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-32 w-full">
              <div className="max-w-2xl">
                {config.hero_badge_text && (
                  <div className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 text-white border border-white/20 bg-white/10 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    {config.hero_badge_text}
                  </div>
                )}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight mb-5">
                  {config.hero_title}
                </h1>
                <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-xl">
                  {config.hero_subtitle}
                </p>
                <div className="flex flex-wrap gap-3 mb-10">
                  <Link
                    href="/productos"
                    className="text-white font-bold px-7 py-3.5 rounded-xl transition-opacity hover:opacity-90 shadow-lg"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    {config.hero_cta_text || 'Ver todos los productos'}
                  </Link>
                  <Link
                    href="/productos?oferta=1"
                    className="border-2 border-white/40 hover:bg-white/10 text-white font-semibold px-7 py-3.5 rounded-xl transition"
                  >
                    Ver oportunidades
                  </Link>
                </div>
                {heroStats.length > 0 && (
                  <div className="flex flex-wrap gap-6 pt-6 border-t border-white/15">
                    {heroStats.map((s) => (
                      <div key={s.label}>
                        <p className="text-2xl font-black text-white">{s.value}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null

      case 'trust_bar':
        return config.show_trust_bar && trustItems.length > 0 ? (
          <section key="trust_bar" className="bg-white border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 py-5">
              <div className="grid grid-cols-2 md:flex md:items-center md:justify-between gap-4">
                {trustItems.map((item) => (
                  <div key={item.title} className="flex items-center gap-3">
                    {item.emoji && (
                      <div
                        className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, white)' }}
                      >
                        {item.emoji}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-800 text-sm leading-tight">{item.title}</p>
                      <p className="text-slate-400 text-xs leading-snug">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null

      case 'categories':
        return config.show_categories ? (
          <section key="categories" className="max-w-7xl mx-auto px-4 py-14">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">Encontrá lo que necesitás</h2>
                <p className="text-slate-500 mt-1">Navegá por categoría y encontrá el repuesto exacto</p>
              </div>
              <Link href="/productos" className="hidden sm:block text-sm font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                Ver todo →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/productos?categoria=${cat.slug}`}
                  className="cat-card relative rounded-2xl overflow-hidden aspect-[4/3] group shadow-sm hover:shadow-lg transition-shadow bg-slate-100"
                >
                  {cat.image && (
                    <img src={cat.image} alt={cat.label} className="cat-card-img absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-bold text-sm leading-tight">{cat.label}</p>
                    {cat.sub && <p className="text-white/60 text-xs mt-0.5">{cat.sub}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null

      case 'featured':
        return config.show_featured && featured.length > 0 ? (
          <section key="featured" className="bg-slate-50 py-14">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900">Productos destacados</h2>
                  <p className="text-slate-500 mt-1">Los más vendidos y mejor valorados</p>
                </div>
                <Link href="/productos" className="hidden sm:flex items-center gap-1 text-sm font-semibold border border-slate-200 hover:border-slate-300 bg-white px-4 py-2 rounded-full transition">
                  Ver todos
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {featured.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  showLowStockBadge={config.show_low_stock_badge}
                  showCart={config.show_cart}
                  whatsapp={config.whatsapp}
                />
              ))}
              </div>
            </div>
          </section>
        ) : null


      default:
        return null
    }
  }

  return (
    <>
      <HeaderWrapper />

      <main>
        {sectionOrder.map(renderSection)}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 pt-14 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

            {/* Marca */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                    <path d="M6 20 L10 12 L16 16 L22 10 L26 20 Z" fill="white"/>
                    <circle cx="10" cy="22" r="2.5" fill="white"/>
                    <circle cx="22" cy="22" r="2.5" fill="white"/>
                  </svg>
                </div>
                <span className="font-black text-white">{config.brand_name}</span>
              </div>
              <p className="text-sm leading-relaxed mb-5">
                {config.footer_text || 'Repuestos y accesorios de calidad. Más de 15 años de experiencia.'}
              </p>
              <div className="flex gap-3">
                {[
                  { label: 'Instagram', href: instagramHref, path: 'M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.265.07 1.645.07 4.849s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.265.058-1.645.07-4.85.07s-3.584-.012-4.849-.07c-1.366-.062-2.633-.334-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.849c.062-1.366.334-2.633 1.308-3.608C4.516 2.568 5.783 2.297 7.149 2.234 8.414 2.176 8.794 2.163 12 2.163m0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                  { label: 'Facebook', href: '#', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                  { label: 'WhatsApp', href: config.whatsapp ? `https://wa.me/${config.whatsapp.replace(/\D/g, '')}` : '#', path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413zM12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.528 5.857L.057 23.882l6.195-1.623A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.893 9.893 0 01-5.031-1.368l-.361-.214-3.741.981.999-3.648-.235-.374A9.861 9.861 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106S21.894 6.58 21.894 12 17.42 21.894 12 21.894z' },
                ].map(({ label, href, path }) => (
                  <a key={label} href={href} target={href !== '#' ? '_blank' : undefined} rel={href !== '#' ? 'noopener noreferrer' : undefined} aria-label={label} className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={path}/></svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Productos */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Productos</h4>
              <ul className="space-y-2.5">
                {categories.slice(0, 6).map((cat) => (
                  <li key={cat.slug}>
                    <Link href={`/productos?categoria=${cat.slug}`} className="text-sm hover:text-white transition">{cat.label}</Link>
                  </li>
                ))}
                <li>
                  <Link href="/productos" className="text-sm font-semibold hover:text-white transition" style={{ color: 'var(--primary)' }}>Ver todos →</Link>
                </li>
              </ul>
            </div>

            {/* Información */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Información</h4>
              <ul className="space-y-2.5 text-sm">
                {['Quiénes somos', 'Cómo comprar', 'Métodos de pago', 'Envíos y plazos', 'Política de devolución', 'Preguntas frecuentes'].map((item) => (
                  <li key={item}><a href="#" className="hover:text-white transition">{item}</a></li>
                ))}
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Contacto</h4>
              <ul className="space-y-3 text-sm">
                {config.phone && (
                  <li className="flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006 6l1.51-1.51a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>
                    <a href={`tel:${config.phone}`} className="hover:text-white transition">{config.phone}</a>
                  </li>
                )}
                {config.email && (
                  <li className="flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <a href={`mailto:${config.email}`} className="hover:text-white transition">{config.email}</a>
                  </li>
                )}
                {config.address && (
                  <li className="flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>{config.address}</span>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>Lun–Vie 9:00 – 18:00</span>
                </li>
              </ul>
              {config.whatsapp && (
                <a
                  href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413zM12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.528 5.857L.057 23.882l6.195-1.623A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.893 9.893 0 01-5.031-1.368l-.361-.214-3.741.981.999-3.648-.235-.374A9.861 9.861 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106S21.894 6.58 21.894 12 17.42 21.894 12 21.894z"/></svg>
                  Consultar por WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p>© {new Date().getFullYear()} {config.brand_name}. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition">Privacidad</a>
              <a href="#" className="hover:text-white transition">Términos</a>
              <a href="#" className="hover:text-white transition">Defensa del Consumidor</a>
            </div>
            <div className="flex items-center gap-2">
              <span>Aceptamos:</span>
              {['VISA', 'MC', 'MP', 'AMEX'].map((p) => (
                <span key={p} className="bg-slate-800 border border-slate-700 text-slate-300 font-bold px-2 py-0.5 rounded text-xs">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
