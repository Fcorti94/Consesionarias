import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSiteConfig } from '@/lib/config-actions'
import LogoutButton from './LogoutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <>{children}</>

  const [{ data: profile }, config] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', user.id).single(),
    getSiteConfig(),
  ])
  const role = profile?.role ?? 'admin'
  const isAdmin = role === 'admin'

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-700">
          {config.brand_logo_url ? (
            <img
              src={config.brand_logo_url}
              alt={config.brand_name}
              className="h-8 object-contain object-left mb-1"
            />
          ) : (
            <div className="font-bold text-lg text-white">{config.brand_name}</div>
          )}
          <p className="text-slate-400 text-xs mt-0.5">
            {isAdmin ? 'Panel Admin' : 'Panel Vendedor'}
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {isAdmin && (
            <>
              <p className="px-3 pt-2 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Catálogo</p>
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white text-sm transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
                Productos
              </Link>
              <Link
                href="/admin/productos/nuevo"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white text-sm transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
                </svg>
                Nuevo producto
              </Link>
              <Link
                href="/admin/productos/importar"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white text-sm transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Importar CSV
              </Link>
              <Link
                href="/admin/atributos"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white text-sm transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                  <path d="M9 12h6M9 16h4"/>
                </svg>
                Atributos
              </Link>
            </>
          )}

          <p className="px-3 pt-4 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ventas</p>
          <Link
            href="/admin/ordenes"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white text-sm transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Órdenes
          </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white text-sm transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Analytics
          </Link>

          {isAdmin && (
            <>
              <p className="px-3 pt-4 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sitio</p>
              <Link
                href="/admin/faq"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white text-sm transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
                  <path d="M12 17h.01"/>
                </svg>
                Preguntas frecuentes
              </Link>
              <Link
                href="/admin/configuracion"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white text-sm transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
                Configuración
              </Link>
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white text-sm transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Ver tienda
              </Link>
            </>
          )}
        </nav>

        <div className="p-3 border-t border-slate-700">
          <p className="text-xs text-slate-500 truncate mb-2 px-3">{user.email}</p>
          <LogoutButton />
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
