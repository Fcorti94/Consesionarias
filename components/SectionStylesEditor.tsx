'use client'

import { useState } from 'react'
import { GOOGLE_FONTS, FONT_SIZES, HOME_SECTIONS_CONFIG } from '@/lib/types'
import type { SectionStyle } from '@/lib/types'

interface Props {
  defaultValue: Record<string, SectionStyle>
}

export default function SectionStylesEditor({ defaultValue }: Props) {
  const [styles, setStyles] = useState<Record<string, SectionStyle>>(defaultValue)
  const [open, setOpen] = useState<string | null>(null)

  function update(id: string, key: keyof SectionStyle, value: string) {
    setStyles(prev => ({ ...prev, [id]: { ...prev[id], [key]: value } }))
  }

  function clear(id: string, key: keyof SectionStyle) {
    setStyles(prev => {
      const next = { ...prev[id] }
      delete next[key]
      return { ...prev, [id]: next }
    })
  }

  function reset(id: string) {
    setStyles(prev => ({ ...prev, [id]: {} }))
  }

  function hasChanges(id: string) {
    const s = styles[id] ?? {}
    return !!(s.fontFamily || s.fontSize || s.bgColor || s.textColor)
  }

  return (
    <>
      <input type="hidden" name="section_styles" value={JSON.stringify(styles)} />

      <div className="space-y-2">
        {HOME_SECTIONS_CONFIG.map(({ id, label }) => {
          const s = styles[id] ?? {}
          const isOpen = open === id
          const changed = hasChanges(id)

          return (
            <div key={id} className="border border-slate-200 rounded-xl overflow-hidden">
              {/* Header */}
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                  {changed && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                      Personalizado
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {/* Color preview chips */}
                  {s.bgColor && (
                    <span className="w-4 h-4 rounded-full border border-slate-200 shrink-0" style={{ backgroundColor: s.bgColor }} title="Color de fondo" />
                  )}
                  {s.textColor && (
                    <span className="w-4 h-4 rounded-full border border-slate-200 shrink-0" style={{ backgroundColor: s.textColor }} title="Color de texto" />
                  )}
                  {s.fontFamily && (
                    <span className="text-xs text-slate-400">{s.fontFamily}</span>
                  )}
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </button>

              {/* Controls */}
              {isOpen && (
                <div className="px-4 py-4 bg-slate-50 border-t border-slate-100 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Font family */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                        Tipografía
                      </label>
                      <select
                        value={s.fontFamily ?? ''}
                        onChange={e => e.target.value ? update(id, 'fontFamily', e.target.value) : clear(id, 'fontFamily')}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                        style={s.fontFamily ? { fontFamily: `'${s.fontFamily}', sans-serif` } : {}}
                      >
                        <option value="">Sin cambios (heredar)</option>
                        {GOOGLE_FONTS.map(f => (
                          <option key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>{f}</option>
                        ))}
                      </select>
                    </div>

                    {/* Font size */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                        Tamaño de letra
                      </label>
                      <select
                        value={s.fontSize ?? ''}
                        onChange={e => e.target.value ? update(id, 'fontSize', e.target.value) : clear(id, 'fontSize')}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                      >
                        <option value="">Sin cambios (heredar)</option>
                        {FONT_SIZES.map(f => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Bg color */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                        Color de fondo
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={s.bgColor || '#ffffff'}
                          onChange={e => update(id, 'bgColor', e.target.value)}
                          className="h-9 w-14 rounded-lg border border-slate-200 cursor-pointer bg-white p-0.5"
                        />
                        <span className="text-sm text-slate-500 flex-1">{s.bgColor || 'Sin cambios'}</span>
                        {s.bgColor && (
                          <button
                            type="button"
                            onClick={() => clear(id, 'bgColor')}
                            className="text-xs text-slate-400 hover:text-red-500 transition px-2 py-1 rounded hover:bg-red-50"
                          >
                            Quitar
                          </button>
                        )}
                      </div>
                      {id === 'hero' || id === 'promo' ? (
                        <p className="text-xs text-slate-400 mt-1">Nota: sección con imagen de fondo, el color puede no ser visible.</p>
                      ) : null}
                    </div>

                    {/* Text color */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                        Color de texto
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={s.textColor || '#000000'}
                          onChange={e => update(id, 'textColor', e.target.value)}
                          className="h-9 w-14 rounded-lg border border-slate-200 cursor-pointer bg-white p-0.5"
                        />
                        <span className="text-sm text-slate-500 flex-1">{s.textColor || 'Sin cambios'}</span>
                        {s.textColor && (
                          <button
                            type="button"
                            onClick={() => clear(id, 'textColor')}
                            className="text-xs text-slate-400 hover:text-red-500 transition px-2 py-1 rounded hover:bg-red-50"
                          >
                            Quitar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {changed && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => reset(id)}
                        className="text-xs text-slate-400 hover:text-red-500 transition"
                      >
                        Restablecer sección
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
