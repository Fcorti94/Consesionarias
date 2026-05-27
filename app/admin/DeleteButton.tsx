'use client'

import { useTransition } from 'react'
import { deleteProduct } from '@/lib/actions'

export default function DeleteButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    startTransition(() => deleteProduct(id))
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-40 transition p-1.5 rounded-lg"
      title="Eliminar"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v6M14 11v6"/>
        <path d="M9 6V4h6v2"/>
      </svg>
    </button>
  )
}
