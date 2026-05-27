'use client'

import { useFormStatus } from 'react-dom'

export default function ConfigSubmitButton() {
  const { pending } = useFormStatus()

  return (
    <div className="flex justify-end pt-2">
      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-2 px-8 py-3 text-white font-semibold rounded-xl transition hover:opacity-90 disabled:opacity-60 text-sm"
        style={{ backgroundColor: 'var(--primary)' }}
      >
        {pending && (
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        )}
        {pending ? 'Guardando...' : 'Guardar configuración'}
      </button>
    </div>
  )
}
