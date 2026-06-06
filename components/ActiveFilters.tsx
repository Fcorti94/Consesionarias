'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { ConfigCategory, Brand } from '@/lib/types'

const ORDEN_LABELS: Record<string, string> = {
  precio_asc:  'Precio: menor a mayor',
  precio_desc: 'Precio: mayor a menor',
  nombre_asc:  'Nombre A–Z',
  mas_vendidos: 'Más valorados',
}

function fmt(n: string) {
  return Number(n).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export default function ActiveFilters({
  categories,
  brands = [],
}: {
  categories: ConfigCategory[]
  brands?: Brand[]
}) {
  const router = useRouter()
  const sp = useSearchParams()

  const categoria  = sp.get('categoria')
  const marca      = sp.get('marca')
  const buscar     = sp.get('buscar')
  const precioMin  = sp.get('precio_min')
  const precioMax  = sp.get('precio_max')
  const stock      = sp.get('stock')
  const oferta     = sp.get('oferta')
  const orden      = sp.get('orden')

  const chips = [
    categoria && {
      key: 'categoria',
      label: categories.find((c) => c.slug === categoria)?.label ?? categoria,
      icon: '📂',
    },
    marca && { key: 'marca', label: marca, icon: '🏷️' },
    buscar && { key: 'buscar', label: `"${buscar}"`, icon: '🔍' },
    (precioMin || precioMax) && {
      key: '__precio',
      label: precioMin && precioMax
        ? `${fmt(precioMin)} – ${fmt(precioMax)}`
        : precioMin
        ? `Desde ${fmt(precioMin)}`
        : `Hasta ${fmt(precioMax!)}`,
      icon: '💲',
    },
    stock  && { key: 'stock',  label: 'Con stock',      icon: '✅' },
    oferta && { key: 'oferta', label: 'Oportunidades',  icon: '⭐' },
    orden  && { key: 'orden',  label: ORDEN_LABELS[orden] ?? orden, icon: '↕️' },
  ].filter(Boolean) as { key: string; label: string; icon: string }[]

  if (chips.length === 0) return null

  function removeChip(key: string) {
    const params = new URLSearchParams(sp.toString())
    if (key === '__precio') {
      params.delete('precio_min')
      params.delete('precio_max')
    } else {
      params.delete(key)
    }
    router.push(`/productos?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5 pb-4 border-b border-slate-100">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">
        Filtros activos:
      </span>

      {chips.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => removeChip(key)}
          className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full text-xs font-semibold text-white transition hover:opacity-80 active:scale-95"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <span>{icon}</span>
          <span>{label}</span>
          <span className="ml-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-white/25">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </span>
        </button>
      ))}

      <button
        onClick={() => router.push('/productos')}
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition"
      >
        Limpiar todo
      </button>
    </div>
  )
}
