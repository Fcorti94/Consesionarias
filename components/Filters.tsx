'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { ConfigCategory, Brand } from '@/lib/types'

export default function Filters({ categories, brands = [] }: { categories: ConfigCategory[]; brands?: Brand[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/productos?${params.toString()}`)
  }

  function toggle(key: string) {
    const current = searchParams.get(key)
    update(key, current ? null : '1')
  }

  function toggleCategory(slug: string) {
    const current = searchParams.get('categoria')
    update('categoria', current === slug ? null : slug)
  }

  const activeCategory = searchParams.get('categoria')
  const activeBrand    = searchParams.get('marca')
  const inStock = searchParams.get('stock') === '1'
  const onSale = searchParams.get('oferta') === '1'
  const sort = searchParams.get('orden') ?? ''
  const hasFilters = !!(activeCategory || activeBrand || inStock || onSale || sort || searchParams.get('buscar'))

  return (
    <aside className="w-full space-y-6">

      {/* Sort */}
      <div>
        <h3 className="font-bold text-slate-800 mb-2.5 text-sm uppercase tracking-wide">Ordenar por</h3>
        <select
          value={sort}
          onChange={(e) => update('orden', e.target.value || null)}
          className="focus-primary w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-white"
        >
          <option value="">Relevancia</option>
          <option value="precio_asc">Precio: menor a mayor</option>
          <option value="precio_desc">Precio: mayor a menor</option>
          <option value="nombre_asc">Nombre A–Z</option>
          <option value="mas_vendidos">Más valorados</option>
        </select>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-bold text-slate-800 mb-2.5 text-sm uppercase tracking-wide">Categoría</h3>
        <div className="space-y-0.5">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug
            return (
              <button
                key={cat.slug}
                onClick={() => toggleCategory(cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                style={isActive ? {
                  backgroundColor: 'color-mix(in srgb, var(--primary) 12%, white)',
                  color: 'var(--primary)',
                } : {}}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <h3 className="font-bold text-slate-800 mb-2.5 text-sm uppercase tracking-wide">Marca</h3>
          <div className="space-y-0.5">
            {brands.map((brand) => {
              const isActive = activeBrand === brand.name
              return (
                <button
                  key={brand.name}
                  onClick={() => update('marca', isActive ? null : brand.name)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  style={isActive ? {
                    backgroundColor: 'color-mix(in srgb, var(--primary) 12%, white)',
                    color: 'var(--primary)',
                  } : {}}
                >
                  {brand.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Price range */}
      <div>
        <h3 className="font-bold text-slate-800 mb-2.5 text-sm uppercase tracking-wide">Precio</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Mín"
            defaultValue={searchParams.get('precio_min') ?? ''}
            onBlur={(e) => update('precio_min', e.target.value || null)}
            className="focus-primary w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
          />
          <input
            type="number"
            placeholder="Máx"
            defaultValue={searchParams.get('precio_max') ?? ''}
            onBlur={(e) => update('precio_max', e.target.value || null)}
            className="focus-primary w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={() => toggle('stock')}
            className="accent-primary w-4 h-4 rounded"
          />
          <span className="text-sm text-slate-700">Solo con stock</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={onSale}
            onChange={() => toggle('oferta')}
            className="accent-primary w-4 h-4 rounded"
          />
          <span className="text-sm text-slate-700">Solo ofertas</span>
        </label>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={() => router.push('/productos')}
          className="w-full text-sm font-semibold py-2.5 rounded-xl border-2 transition hover:bg-slate-50"
          style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
        >
          Limpiar filtros
        </button>
      )}
    </aside>
  )
}
