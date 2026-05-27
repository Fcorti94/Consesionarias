'use client'

import { useState } from 'react'
import type { FaqItem } from '@/lib/types'

export default function FaqClient({ items }: { items: FaqItem[] }) {
  const groups = Array.from(new Set(items.map((i) => i.group)))
  const [activeGroup, setActiveGroup] = useState<string>('all')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const filtered = activeGroup === 'all' ? items : items.filter((i) => i.group === activeGroup)

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <div className="bg-[var(--navy)] text-white py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 bg-white/10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
              <path d="M12 17h.01"/>
            </svg>
          </div>
          <h1 className="text-3xl font-black mb-3 tracking-tight">Preguntas frecuentes</h1>
          <p className="text-slate-300 text-base leading-relaxed">
            Encontrá respuestas a las dudas más comunes sobre envíos, pagos, productos y garantías.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Group filter pills */}
        {groups.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => { setActiveGroup('all'); setOpenIndex(null) }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                activeGroup === 'all'
                  ? 'text-white border-transparent'
                  : 'text-slate-600 border-slate-200 bg-white hover:border-slate-300'
              }`}
              style={activeGroup === 'all' ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
            >
              Todas
            </button>
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => { setActiveGroup(g); setOpenIndex(null) }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                  activeGroup === g
                    ? 'text-white border-transparent'
                    : 'text-slate-600 border-slate-200 bg-white hover:border-slate-300'
                }`}
                style={activeGroup === g ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {/* Accordion */}
        {filtered.length === 0 ? (
          <p className="text-slate-400 text-center py-12">No hay preguntas en esta categoría.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, i) => {
              const isOpen = openIndex === i
              return (
                <div
                  key={i}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen ? 'border-[var(--primary)] shadow-md' : 'border-slate-100 shadow-sm hover:border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
                  >
                    <span className={`font-semibold text-sm leading-snug transition-colors ${isOpen ? '' : 'text-slate-700'}`}
                      style={isOpen ? { color: 'var(--primary)' } : {}}>
                      {item.question}
                    </span>
                    <span
                      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
                      style={isOpen
                        ? { backgroundColor: 'var(--primary)', color: 'white', transform: 'rotate(45deg)' }
                        : { backgroundColor: '#f1f5f9', color: '#64748b' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </span>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: isOpen ? '500px' : '0px' }}
                  >
                    <p className="px-6 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-50 pt-3">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
          <p className="font-semibold text-slate-700 mb-1">¿No encontraste lo que buscabas?</p>
          <p className="text-sm text-slate-400 mb-5">Nuestro equipo está disponible para ayudarte.</p>
          <a
            href="/productos"
            className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl text-sm transition hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Contactarnos
          </a>
        </div>

      </div>
    </div>
  )
}
