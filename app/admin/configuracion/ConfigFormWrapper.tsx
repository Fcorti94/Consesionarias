'use client'

import { useActionState, useEffect, useRef } from 'react'
import { updateSiteConfig } from '@/lib/config-actions'

type State = { success: true } | { error: string } | null

export default function ConfigFormWrapper({ children }: { children: React.ReactNode }) {
  const [state, action] = useActionState(
    async (_: State, formData: FormData): Promise<State> => {
      try {
        await updateSiteConfig(formData)
        return { success: true }
      } catch (e) {
        return { error: e instanceof Error ? e.message : 'Error al guardar' }
      }
    },
    null
  )

  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (state && 'success' in state) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [state])

  return (
    <form action={action} className="space-y-8">

      {/* Toast de éxito */}
      {state && 'success' in state && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-medium">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Configuración guardada correctamente. Los cambios ya se reflejan en la tienda.
        </div>
      )}

      {/* Toast de error */}
      {state && 'error' in state && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          {state.error}
        </div>
      )}

      {children}
    </form>
  )
}
