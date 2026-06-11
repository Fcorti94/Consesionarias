'use client'

import { useState } from 'react'
import { GOOGLE_FONTS, FONT_SIZES } from '@/lib/types'
import type { SectionStyle } from '@/lib/types'

interface Props {
  label: string
  name: string
  defaultValue?: string
  defaultStyle?: SectionStyle
  placeholder?: string
  type?: string
  required?: boolean
  className?: string
}

export default function StyledTextField({
  label, name, defaultValue, defaultStyle, placeholder, type, required, className,
}: Props) {
  const [style, setStyle] = useState<SectionStyle>(defaultStyle ?? {})

  const update = (key: keyof SectionStyle, value: string) =>
    setStyle(prev => {
      const next = { ...prev }
      if (value) next[key] = value
      else delete next[key]
      return next
    })

  const hasStyle = !!(style.fontFamily || style.fontSize || style.textColor)

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}{required && ' *'}
      </label>
      <div className="flex flex-wrap items-center gap-1.5">
        <input
          type={type ?? 'text'}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          className="flex-1 min-w-36 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <select
          value={style.fontFamily ?? ''}
          onChange={e => update('fontFamily', e.target.value)}
          title="Tipografía"
          className="w-28 shrink-0 text-xs px-1.5 py-2 rounded-lg border border-slate-200 text-slate-500 bg-white focus:outline-none focus:ring-1 focus:ring-orange-300 cursor-pointer"
        >
          <option value="">Tipografía</option>
          {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select
          value={style.fontSize ?? ''}
          onChange={e => update('fontSize', e.target.value)}
          title="Tamaño de letra"
          className="w-20 shrink-0 text-xs px-1.5 py-2 rounded-lg border border-slate-200 text-slate-500 bg-white focus:outline-none focus:ring-1 focus:ring-orange-300 cursor-pointer"
        >
          <option value="">Tam.</option>
          {FONT_SIZES.map(s => <option key={s.value} value={s.value}>{s.value}</option>)}
        </select>
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="color"
            value={style.textColor ?? '#000000'}
            onChange={e => update('textColor', e.target.value)}
            className="h-[34px] w-9 rounded-lg border border-slate-200 cursor-pointer p-0.5 shrink-0"
            title="Color del texto"
          />
          {style.textColor && (
            <button
              type="button"
              onClick={() => update('textColor', '')}
              className="text-slate-400 hover:text-red-400 text-xs leading-none"
              title="Quitar color"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <input
        type="hidden"
        name={`ts_${name}`}
        value={hasStyle ? JSON.stringify({ fontFamily: style.fontFamily, fontSize: style.fontSize, textColor: style.textColor }) : ''}
      />
    </div>
  )
}
