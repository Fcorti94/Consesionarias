'use client'

import { useState } from 'react'
import type { NavLink } from '@/lib/types'

interface Props {
  defaultValue: NavLink[]
}

export default function NavLinksEditor({ defaultValue }: Props) {
  const [links, setLinks] = useState<NavLink[]>(defaultValue)

  const update = (i: number, field: keyof NavLink, value: string | boolean) =>
    setLinks(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l))

  const remove = (i: number) =>
    setLinks(prev => prev.filter((_, idx) => idx !== i))

  const add = () =>
    setLinks(prev => [...prev, { label: '', href: '', enabled: true }])

  const move = (i: number, dir: -1 | 1) =>
    setLinks(prev => {
      const next = [...prev]
      const j = i + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  const isCategories = (href: string) => href === '__categories__'

  return (
    <>
      <input type="hidden" name="nav_links" value={JSON.stringify(links)} />

      <p className="text-xs text-slate-400 mb-3">
        El ítem <span className="font-medium text-slate-500">Categorías</span> despliega el menú de categorías configuradas. Los demás pueden ser cualquier URL del sitio o externa.
      </p>

      <div className="space-y-2">
        {links.map((link, i) => (
          <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            {/* Enable toggle */}
            <input
              type="checkbox"
              checked={link.enabled}
              onChange={e => update(i, 'enabled', e.target.checked)}
              title={link.enabled ? 'Visible' : 'Oculto'}
              className="w-4 h-4 rounded accent-orange-500 shrink-0 cursor-pointer"
            />

            {/* Label */}
            <input
              type="text"
              value={link.label}
              onChange={e => update(i, 'label', e.target.value)}
              placeholder="Nombre"
              className="w-36 shrink-0 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-300"
            />

            {/* URL / badge for special items */}
            {isCategories(link.href) ? (
              <span className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-400 font-mono">
                menú de categorías (automático)
              </span>
            ) : (
              <input
                type="text"
                value={link.href}
                onChange={e => update(i, 'href', e.target.value)}
                placeholder="/ruta o https://..."
                className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-orange-300"
              />
            )}

            {/* Move up/down */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="w-6 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-25 rounded transition"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === links.length - 1}
                className="w-6 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-25 rounded transition"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>

            {/* Delete (never for __categories__) */}
            {!isCategories(link.href) && (
              <button
                type="button"
                onClick={() => remove(i)}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                title="Eliminar"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
              </button>
            )}
            {isCategories(link.href) && <div className="w-7 shrink-0" />}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="mt-3 flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium transition"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Agregar enlace
      </button>
    </>
  )
}
