'use client'

import { useState, useEffect, useTransition } from 'react'
import { getFaqItems, saveFaqItems } from '@/lib/config-actions'
import type { FaqItem } from '@/lib/types'

const SUGGESTED_GROUPS = ['Envíos', 'Pagos', 'Garantías', 'Productos', 'General']

export default function AdminFaqPage() {
  const [items, setItems] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    getFaqItems().then((data) => { setItems(data); setLoading(false) })
  }, [])

  function update(index: number, field: keyof FaqItem, value: string) {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
    setSaved(false)
  }

  function addItem(group = 'General') {
    setItems((prev) => [...prev, { question: '', answer: '', group }])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
    setSaved(false)
  }

  function moveItem(index: number, direction: -1 | 1) {
    const next = index + direction
    if (next < 0 || next >= items.length) return
    const arr = [...items]
    ;[arr[index], arr[next]] = [arr[next], arr[index]]
    setItems(arr)
    setSaved(false)
  }

  function handleSave() {
    const clean = items.filter((i) => i.question.trim() && i.answer.trim())
    startTransition(async () => {
      await saveFaqItems(clean)
      setSaved(true)
    })
  }

  const groups = Array.from(new Set(items.map((i) => i.group).filter(Boolean)))

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-slate-400">
        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        Cargando preguntas...
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl">

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Preguntas frecuentes</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Editá, reordenás y agrupás las preguntas que aparecen en la página /faq.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={pending}
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl text-sm transition hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {pending ? (
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : saved ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
          )}
          {saved ? 'Guardado' : 'Guardar'}
        </button>
      </div>

      {/* Items agrupados */}
      {groups.length === 0 && items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
          <p className="mb-3">No hay preguntas todavía.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(groups.length > 0 ? groups : ['']).map((group) => {
            const groupItems = items.map((item, i) => ({ item, i })).filter(({ item }) => item.group === group || (!group && true))
            if (group && groupItems.length === 0) return null
            return (
              <div key={group || 'all'} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {group && (
                  <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{group}</span>
                    <span className="text-xs text-slate-400">({groupItems.length})</span>
                  </div>
                )}
                <div className="divide-y divide-slate-50">
                  {groupItems.map(({ item, i }) => (
                    <div key={i} className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        {/* Drag handle / order */}
                        <div className="flex flex-col gap-0.5 mt-1 shrink-0">
                          <button onClick={() => moveItem(i, -1)} disabled={i === 0}
                            className="text-slate-300 hover:text-slate-500 disabled:opacity-20 transition">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                          </button>
                          <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1}
                            className="text-slate-300 hover:text-slate-500 disabled:opacity-20 transition">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                          </button>
                        </div>
                        <div className="flex-1 space-y-2">
                          <input
                            value={item.question}
                            onChange={(e) => update(i, 'question', e.target.value)}
                            placeholder="Pregunta..."
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus-primary"
                          />
                          <textarea
                            value={item.answer}
                            onChange={(e) => update(i, 'answer', e.target.value)}
                            placeholder="Respuesta..."
                            rows={2}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 resize-none focus-primary"
                          />
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-slate-500 shrink-0">Grupo:</label>
                            <input
                              list={`groups-${i}`}
                              value={item.group}
                              onChange={(e) => update(i, 'group', e.target.value)}
                              placeholder="ej: Envíos"
                              className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus-primary"
                            />
                            <datalist id={`groups-${i}`}>
                              {SUGGESTED_GROUPS.map((g) => <option key={g} value={g} />)}
                              {groups.map((g) => <option key={g} value={g} />)}
                            </datalist>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(i)}
                          className="shrink-0 mt-1 w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14H6L5 6"/>
                            <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add buttons */}
      <div className="mt-5 flex flex-wrap gap-2">
        {SUGGESTED_GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => addItem(g)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 border border-dashed border-slate-300 rounded-xl hover:border-slate-400 hover:bg-white transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            {g}
          </button>
        ))}
      </div>

    </div>
  )
}
