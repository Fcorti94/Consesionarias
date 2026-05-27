'use client'

import { useState } from 'react'
import { CATEGORIES } from '@/lib/types'
import type { AttributeDefinition } from '@/lib/types'

interface Props {
  attribute?: AttributeDefinition
  onSubmit: (formData: FormData) => Promise<void>
}

const FIELD_TYPES = [
  { value: 'text',        label: 'Texto libre' },
  { value: 'number',      label: 'Número' },
  { value: 'textarea',    label: 'Área de texto (descripción larga)' },
  { value: 'select',      label: 'Selección única (lista de opciones)' },
  { value: 'multiselect', label: 'Selección múltiple (varias opciones)' },
]

export default function AttributeForm({ attribute, onSubmit }: Props) {
  const [saving, setSaving] = useState(false)
  const [fieldType, setFieldType] = useState<string>(attribute?.field_type ?? 'text')
  const [optionsInput, setOptionsInput] = useState(attribute?.options?.join(', ') ?? '')

  const needsOptions = fieldType === 'select' || fieldType === 'multiselect'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit(new FormData(e.currentTarget))
    } catch {
      alert('Error guardando el atributo.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nombre del atributo <span className="text-red-400">*</span>
          </label>
          <input
            name="name"
            defaultValue={attribute?.name}
            required
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            placeholder="Ej: Compatibilidad, Marca, Material"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tipo de campo <span className="text-red-400">*</span>
          </label>
          <select
            name="field_type"
            value={fieldType}
            onChange={(e) => setFieldType(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-white"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Opciones — solo para select/multiselect */}
      {needsOptions && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Opciones <span className="text-red-400">*</span>{' '}
            <span className="text-slate-400 font-normal">(separadas por coma)</span>
          </label>
          <input
            name="options"
            value={optionsInput}
            onChange={(e) => setOptionsInput(e.target.value)}
            required={needsOptions}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            placeholder="Ej: Eje delantero, Eje trasero, Ambos"
          />
          {optionsInput && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {optionsInput.split(',').map((o) => o.trim()).filter(Boolean).map((o) => (
                <span key={o} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{o}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Categoría aplicable</label>
          <select
            name="category"
            defaultValue={attribute?.category ?? ''}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-white"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.emoji} {c.label}</option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            Si seleccionás una categoría, el atributo solo aparece para productos de esa categoría.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Orden de aparición</label>
          <input
            name="sort_order"
            type="number"
            min="0"
            defaultValue={attribute?.sort_order ?? 0}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400"
          />
          <p className="text-xs text-slate-400 mt-1">Número menor = aparece primero.</p>
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            name="is_required"
            type="checkbox"
            value="true"
            defaultChecked={attribute?.is_required}
            className="accent-orange-500 w-4 h-4"
          />
          <span className="text-sm text-slate-700">Campo requerido</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            name="active"
            type="checkbox"
            value="true"
            defaultChecked={attribute?.active ?? true}
            className="accent-orange-500 w-4 h-4"
          />
          <span className="text-sm text-slate-700">Activo</span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <a href="/admin/atributos" className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition">
          Cancelar
        </a>
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition text-sm"
        >
          {saving ? 'Guardando...' : 'Guardar atributo'}
        </button>
      </div>
    </form>
  )
}
