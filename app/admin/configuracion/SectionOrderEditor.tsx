'use client'

import { useState, useRef } from 'react'

const SECTION_LABELS: Record<string, string> = {
  brands:      'Marcas',
  promo:       'Banner promocional',
  hero:        'Hero principal',
  trust_bar:   'Barra de confianza',
  categories:  'Categorías',
  featured:    'Productos destacados',
}

const SECTION_ICONS: Record<string, string> = {
  brands:      '🏷️',
  promo:       '🎯',
  hero:        '🖼️',
  trust_bar:   '🛡️',
  categories:  '📂',
  featured:    '⭐',
}

interface Props {
  initialOrder: string[]
  initialVisibility: Record<string, boolean>
}

export default function SectionOrderEditor({ initialOrder, initialVisibility }: Props) {
  const [order, setOrder] = useState(initialOrder)
  const [visibility, setVisibility] = useState(initialVisibility)
  const dragIndex = useRef<number | null>(null)

  function move(from: number, to: number) {
    const next = [...order]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setOrder(next)
  }

  function handleDragStart(i: number) {
    dragIndex.current = i
  }

  function handleDragOver(e: React.DragEvent, i: number) {
    e.preventDefault()
    if (dragIndex.current === null || dragIndex.current === i) return
    move(dragIndex.current, i)
    dragIndex.current = i
  }

  function handleDragEnd() {
    dragIndex.current = null
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-3">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Orden de secciones</h2>
          <p className="text-xs text-slate-400 mt-0.5">Arrastrá para reordenar. El toggle controla la visibilidad en la tienda.</p>
        </div>
      </div>

      <div className="space-y-2">
        {order.map((id, i) => (
          <div
            key={id}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDragEnd={handleDragEnd}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 cursor-grab active:cursor-grabbing select-none"
          >
            {/* drag handle */}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-slate-300">
              <circle cx="4" cy="3" r="1.2" fill="currentColor"/>
              <circle cx="4" cy="7" r="1.2" fill="currentColor"/>
              <circle cx="4" cy="11" r="1.2" fill="currentColor"/>
              <circle cx="10" cy="3" r="1.2" fill="currentColor"/>
              <circle cx="10" cy="7" r="1.2" fill="currentColor"/>
              <circle cx="10" cy="11" r="1.2" fill="currentColor"/>
            </svg>

            <span className="text-lg leading-none">{SECTION_ICONS[id] ?? '▪️'}</span>
            <span className="flex-1 text-sm font-medium text-slate-700">{SECTION_LABELS[id] ?? id}</span>

            {/* up/down buttons for mobile */}
            <div className="flex gap-1 sm:hidden">
              <button
                type="button"
                disabled={i === 0}
                onClick={() => move(i, i - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30"
                aria-label="Subir"
              >
                ▲
              </button>
              <button
                type="button"
                disabled={i === order.length - 1}
                onClick={() => move(i, i + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30"
                aria-label="Bajar"
              >
                ▼
              </button>
            </div>

            {/* visibility toggle */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={visibility[id] ?? true}
                onChange={(e) => setVisibility(prev => ({ ...prev, [id]: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 rounded-full peer
                peer-checked:after:translate-x-4 peer-checked:after:border-white
                after:content-[''] after:absolute after:top-0.5 after:left-0.5
                after:bg-white after:border-slate-300 after:border after:rounded-full
                after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--primary)]"
              />
            </label>
          </div>
        ))}
      </div>

      {/* hidden inputs that submit to the server action */}
      <input type="hidden" name="section_order" value={JSON.stringify(order)} />
      {order.map((id) => (
        <input
          key={id}
          type="hidden"
          name={`show_${id}`}
          value={visibility[id] ?? true ? 'on' : ''}
        />
      ))}
    </div>
  )
}
