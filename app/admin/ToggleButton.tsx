'use client'

import { useTransition } from 'react'
import { toggleProductActive } from '@/lib/actions'

export default function ToggleButton({ id, active }: { id: string; active: boolean }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => toggleProductActive(id, !active))}
      disabled={pending}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
        active ? 'bg-green-500' : 'bg-slate-300'
      } ${pending ? 'opacity-50' : ''}`}
      title={active ? 'Desactivar' : 'Activar'}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
          active ? 'translate-x-4.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
