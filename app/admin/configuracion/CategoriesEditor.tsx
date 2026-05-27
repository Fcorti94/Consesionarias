'use client'

import { useState, useTransition } from 'react'
import { saveCategories } from '@/lib/config-actions'
import ImageInput from '@/components/ImageInput'
import type { ConfigCategory } from '@/lib/types'

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function CategoriesEditor({ initialCategories }: { initialCategories: ConfigCategory[] }) {
  const [categories, setCategories] = useState<ConfigCategory[]>(initialCategories)
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update(index: number, field: keyof ConfigCategory, value: string) {
    setCategories(prev => prev.map((cat, i) => {
      if (i !== index) return cat
      const updated = { ...cat, [field]: value }
      if (field === 'label') updated.slug = slugify(value)
      return updated
    }))
  }

  function add() {
    setCategories(prev => [...prev, { slug: '', label: '', emoji: '', sub: '', image: '' }])
  }

  function remove(index: number) {
    setCategories(prev => prev.filter((_, i) => i !== index))
  }

  function save() {
    setError(null)
    setSaved(false)
    const valid = categories.filter(c => c.label.trim() && c.slug.trim())
    startTransition(async () => {
      try {
        await saveCategories(valid)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al guardar')
      }
    })
  }

  return (
    <div className="space-y-3">
      {categories.map((cat, i) => (
        <div key={i} className="border border-slate-100 rounded-xl p-4 bg-white space-y-3">
          <div className="flex gap-3 items-start">
              {/* Campos */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Nombre *</label>
                <input
                  value={cat.label}
                  onChange={(e) => update(i, 'label', e.target.value)}
                  placeholder="Camperas"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Slug (URL)
                  <span className="ml-1 text-slate-300 font-normal">auto</span>
                </label>
                <input
                  value={cat.slug}
                  onChange={(e) => update(i, 'slug', slugify(e.target.value))}
                  placeholder="camperas"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-500 focus-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Descripción corta</label>
                <input
                  value={cat.sub}
                  onChange={(e) => update(i, 'sub', e.target.value)}
                  placeholder="Remeras, buzos..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus-primary"
                />
              </div>
              <div>
                <ImageInput
                  value={cat.image}
                  onChange={(url) => update(i, 'image', url)}
                  label="Imagen"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Eliminar */}
            <button
              type="button"
              onClick={() => remove(i)}
              title="Eliminar categoría"
              className="shrink-0 w-8 h-8 mt-5 rounded-full flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        </div>
      ))}

      {/* Agregar */}
      <button
        type="button"
        onClick={add}
        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-400 hover:border-slate-300 hover:text-slate-600 transition font-medium"
      >
        + Agregar categoría
      </button>

      {/* Guardar */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {pending ? 'Guardando...' : 'Guardar categorías'}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Guardado
          </span>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  )
}
