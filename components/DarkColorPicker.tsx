'use client'

import { useState } from 'react'

const PRESETS = [
  { label: 'Pizarrón',   color: '#0f172a' },
  { label: 'Marino',     color: '#0a1628' },
  { label: 'Medianoche', color: '#020617' },
  { label: 'Índigo',     color: '#1e1b4b' },
  { label: 'Carbón',     color: '#1c1c1e' },
  { label: 'Grafito',    color: '#1f2937' },
  { label: 'Café',       color: '#1c1917' },
  { label: 'Bosque',     color: '#052e16' },
  { label: 'Cazador',    color: '#14532d' },
  { label: 'Petróleo',   color: '#083344' },
  { label: 'Burdeos',    color: '#4c0519' },
  { label: 'Ciruela',    color: '#3b0764' },
]

export default function DarkColorPicker({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue ?? '')
  const isPreset = PRESETS.some(p => p.color === value)
  const isCustomDark = !!value && !isPreset

  return (
    <>
      <input type="hidden" name="dark_color" value={value} />

      {/* Light mode option */}
      <button
        type="button"
        onClick={() => setValue('')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition ${
          !value
            ? 'border-orange-400 bg-orange-50 text-orange-700'
            : 'border-slate-200 text-slate-500 hover:border-slate-300'
        }`}
      >
        <span className="w-5 h-5 rounded-full border border-slate-200 bg-white shrink-0" />
        Modo claro
      </button>

      {/* Dark presets grid */}
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4 mb-2">
        Colores oscuros predefinidos
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {PRESETS.map(({ label, color }) => (
          <button
            key={color}
            type="button"
            onClick={() => setValue(color)}
            title={label}
            className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition ${
              value === color
                ? 'border-orange-400'
                : 'border-transparent hover:border-slate-200'
            }`}
          >
            <span
              className="w-8 h-8 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: color }}
            />
            <span className="text-[10px] text-slate-500 leading-tight text-center">{label}</span>
            {value === color && (
              <span className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-orange-400 flex items-center justify-center">
                <svg width="7" height="7" viewBox="0 0 10 10" fill="white">
                  <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Custom color picker */}
      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700 shrink-0">Color personalizado:</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={isCustomDark ? value : '#1a1a2e'}
            onChange={e => setValue(e.target.value)}
            className="h-9 w-14 rounded-lg border border-slate-200 cursor-pointer bg-white p-0.5"
          />
          {isCustomDark && (
            <span className="text-sm text-slate-500 font-mono">{value}</span>
          )}
          <button
            type="button"
            onClick={() => setValue(isCustomDark ? value : '#1a1a2e')}
            className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium ${
              isCustomDark
                ? 'border-orange-400 bg-orange-50 text-orange-700'
                : 'border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            {isCustomDark ? 'Usando personalizado' : 'Usar este color'}
          </button>
        </div>
      </div>

      {/* Preview */}
      {value && (
        <div
          className="mt-4 rounded-xl p-4 flex items-center gap-3"
          style={{ backgroundColor: value }}
        >
          <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
          <div>
            <p className="text-white text-sm font-semibold">Vista previa del fondo</p>
            <p className="text-white/50 text-xs">{value}</p>
          </div>
        </div>
      )}
    </>
  )
}
