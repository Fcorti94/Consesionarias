import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getSiteConfig } from '@/lib/config-actions'
import HeaderWrapper from '@/components/HeaderWrapper'
import ProductCard from '@/components/ProductCard'
import Filters from '@/components/Filters'
import ActiveFilters from '@/components/ActiveFilters'
import { DEFAULT_CATEGORIES, DEFAULT_BRANDS } from '@/lib/types'
import type { Product } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface SearchParams {
  categoria?: string
  marca?: string
  buscar?: string
  precio_min?: string
  precio_max?: string
  stock?: string
  oferta?: string
  orden?: string
}

async function getProducts(params: SearchParams): Promise<Product[]> {
  const supabase = await createClient()
  let query = supabase.from('products').select('*').eq('active', true)

  if (params.categoria) query = query.or(`category.eq.${params.categoria},categories.cs.{${params.categoria}}`)
  if (params.stock === '1') query = query.gt('stock', 0)
  if (params.oferta === '1') query = query.not('original_price', 'is', null)
  if (params.precio_min) query = query.gte('price', parseFloat(params.precio_min))
  if (params.precio_max) query = query.lte('price', parseFloat(params.precio_max))
  if (params.buscar) query = query.ilike('name', `%${params.buscar}%`)
  if (params.marca)  query = query.or(`name.ilike.%${params.marca}%,description.ilike.%${params.marca}%`)

  switch (params.orden) {
    case 'precio_asc':   query = query.order('price', { ascending: true });  break
    case 'precio_desc':  query = query.order('price', { ascending: false }); break
    case 'nombre_asc':   query = query.order('name',  { ascending: true });  break
    case 'mas_vendidos': query = query.order('rating', { ascending: false }); break
    default:             query = query.order('featured', { ascending: false }).order('created_at', { ascending: false })
  }

  const { data } = await query
  return data ?? []
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [products, config] = await Promise.all([getProducts(params), getSiteConfig()])
  const categories = Array.isArray(config.categories) ? config.categories : DEFAULT_CATEGORIES
  const brands     = Array.isArray(config.brands)     ? config.brands.filter(b => b.name) : DEFAULT_BRANDS

  const activeCat = categories.find((c) => c.slug === params.categoria)

  const title = params.buscar
    ? `Resultados para "${params.buscar}"`
    : activeCat
    ? activeCat.label
    : params.oferta === '1'
    ? 'Oportunidades'
    : params.stock === '1'
    ? 'Con stock disponible'
    : 'Todos los productos'

  const subtitle = activeCat?.sub ?? null

  return (
    <>
      <HeaderWrapper />

      {/* Page hero bar */}
      <div className="bg-[var(--navy)] text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
            <a href="/" className="hover:text-white transition">Inicio</a>
            <span>/</span>
            <span className="text-slate-300">Productos</span>
            {activeCat && (
              <>
                <span>/</span>
                <span className="text-slate-300">{activeCat.label}</span>
              </>
            )}
          </nav>
          <h1 className="text-2xl font-black tracking-tight">{title}</h1>
          {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
          <p className="text-slate-400 text-sm mt-1">
            {products.length} {products.length === 1 ? 'producto encontrado' : 'productos encontrados'}
          </p>
        </div>
      </div>

      <main className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-56 md:shrink-0 md:sticky md:top-6">
            <Suspense>
              <Filters categories={categories} brands={brands} />
            </Suspense>
          </div>

          <div className="flex-1 min-w-0 min-h-[500px]">
            <Suspense>
              <ActiveFilters categories={categories} brands={brands} />
            </Suspense>
            {products.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    <path d="M8 11h6M11 8v6" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-lg font-bold text-slate-700 mb-1">No encontramos productos</p>
                <p className="text-sm text-slate-400 mb-6">Probá con otros filtros o palabras clave.</p>
                <a
                  href="/productos"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  Ver todos los productos
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    showLowStockBadge={config.show_low_stock_badge}
                    showCart={config.show_cart}
                    whatsapp={config.whatsapp}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

    </>
  )
}
