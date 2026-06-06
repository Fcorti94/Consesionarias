import { createClient } from '@/lib/supabase/server'
import { getSiteConfig } from '@/lib/config-actions'

export const dynamic = 'force-dynamic'

function fmt(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-800">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const config = await getSiteConfig()

  // WhatsApp clicks
  const { data: rawClicks, error: clicksError } = await supabase
    .from('whatsapp_clicks')
    .select('source, product_name, created_at')
    .order('created_at', { ascending: false })

  const clicks = rawClicks ?? []
  const tableReady = !clicksError

  // Date ranges (server time)
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - 6)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const todayClicks  = clicks.filter(c => new Date(c.created_at) >= todayStart).length
  const weekClicks   = clicks.filter(c => new Date(c.created_at) >= weekStart).length
  const monthClicks  = clicks.filter(c => new Date(c.created_at) >= monthStart).length
  const totalClicks  = clicks.length

  const sourceLabels: Record<string, string> = {
    card:   'Tarjeta de producto',
    modal:  'Vista rápida (modal)',
    detail: 'Página de detalle',
  }

  const bySource = clicks.reduce((acc, c) => {
    const k = c.source ?? 'card'
    acc[k] = (acc[k] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const byProduct = clicks.reduce((acc, c) => {
    const k = c.product_name || '(sin nombre)'
    acc[k] = (acc[k] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topProducts = Object.entries(byProduct)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)

  // Product views
  const { data: rawViews, error: viewsError } = await supabase
    .from('product_views')
    .select('product_name, created_at')
    .order('created_at', { ascending: false })

  const views = rawViews ?? []
  const viewsTableReady = !viewsError

  const todayViews  = views.filter(v => new Date(v.created_at) >= todayStart).length
  const weekViews   = views.filter(v => new Date(v.created_at) >= weekStart).length
  const monthViews  = views.filter(v => new Date(v.created_at) >= monthStart).length
  const totalViews  = views.length

  const viewsByProduct = views.reduce((acc, v) => {
    const k = v.product_name || '(sin nombre)'
    acc[k] = (acc[k] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topViewedProducts = Object.entries(viewsByProduct)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)

  // Orders (only if show_cart)
  const { data: ordersRaw } = config.show_cart
    ? await supabase.from('orders').select('status, total, created_at')
    : { data: [] as { status: string; total: number; created_at: string }[] }
  const orders = ordersRaw ?? []

  const approvedOrders = orders.filter(o => o.status === 'approved')
  const pendingOrders  = orders.filter(o => o.status === 'pending')
  const totalRevenue   = approvedOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
  const monthOrders    = approvedOrders.filter(o => new Date(o.created_at) >= monthStart)
  const monthRevenue   = monthOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Métricas de consultas y ventas</p>
      </div>

      {/* ── WhatsApp ── */}
      <section className="mb-10">
        <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#16a34a">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413zM12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.528 5.857L.057 23.882l6.195-1.623A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.893 9.893 0 01-5.031-1.368l-.361-.214-3.741.981.999-3.648-.235-.374A9.861 9.861 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106S21.894 6.58 21.894 12 17.42 21.894 12 21.894z"/>
            </svg>
          </span>
          Consultas por WhatsApp
        </h2>

        {!tableReady ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-800 text-sm">
            <p className="font-semibold mb-1">Tabla no configurada</p>
            <p>Ejecutá el SQL de <code className="bg-amber-100 px-1 rounded">schema.sql</code> en Supabase para habilitar el tracking de WhatsApp.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <StatCard label="Hoy" value={todayClicks} />
              <StatCard label="Esta semana" value={weekClicks} />
              <StatCard label="Este mes" value={monthClicks} />
              <StatCard label="Total histórico" value={totalClicks} />
            </div>

            {totalClicks === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-400">
                <svg className="mx-auto mb-3 opacity-30" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                <p className="text-sm">Todavía no hay consultas registradas.</p>
                <p className="text-xs mt-1">Los clicks en "Contactar vendedor" aparecerán aquí.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* By source */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                  <h3 className="font-semibold text-slate-700 text-sm mb-4">Por origen</h3>
                  <div className="space-y-3">
                    {Object.entries(bySource).sort(([, a], [, b]) => b - a).map(([src, count]) => {
                      const pct = Math.round((count / totalClicks) * 100)
                      return (
                        <div key={src}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">{sourceLabels[src] ?? src}</span>
                            <span className="font-semibold text-slate-800">{count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-green-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Top products */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                  <h3 className="font-semibold text-slate-700 text-sm mb-4">Productos más consultados</h3>
                  <ol className="space-y-2.5">
                    {topProducts.map(([name, count], i) => (
                      <li key={name} className="flex items-center gap-3 text-sm">
                        <span className="text-slate-400 font-bold w-5 text-right shrink-0">{i + 1}</span>
                        <span className="flex-1 text-slate-700 truncate">{name}</span>
                        <span className="font-semibold text-slate-800 shrink-0">{count}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Productos más visitados ── */}
      <section className="mb-10">
        <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-violet-100">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </span>
          Productos más visitados
        </h2>

        {!viewsTableReady ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-800 text-sm">
            <p className="font-semibold mb-1">Tabla no configurada</p>
            <p>Ejecutá el SQL de <code className="bg-amber-100 px-1 rounded">schema.sql</code> en Supabase para habilitar el tracking de visitas.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <StatCard label="Hoy" value={todayViews} />
              <StatCard label="Esta semana" value={weekViews} />
              <StatCard label="Este mes" value={monthViews} />
              <StatCard label="Total histórico" value={totalViews} />
            </div>

            {totalViews === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-400">
                <svg className="mx-auto mb-3 opacity-30" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <p className="text-sm">Todavía no hay visitas registradas.</p>
                <p className="text-xs mt-1">Se registran cuando alguien abre la página de detalle de un producto.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <ol className="divide-y divide-slate-50">
                  {topViewedProducts.map(([name, count], i) => {
                    const pct = Math.round((count / totalViews) * 100)
                    return (
                      <li key={name} className="flex items-center gap-4 py-3">
                        <span className="text-slate-400 font-bold w-6 text-right shrink-0 text-sm">{i + 1}</span>
                        <span className="flex-1 text-slate-700 text-sm truncate">{name}</span>
                        <div className="hidden sm:flex w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                          <div className="h-full rounded-full bg-violet-400" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-semibold text-slate-800 text-sm shrink-0 w-20 text-right">
                          {count} <span className="text-slate-400 font-normal text-xs">({pct}%)</span>
                        </span>
                      </li>
                    )
                  })}
                </ol>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Ventas (solo si show_cart) ── */}
      {config.show_cart && (
        <section className="mb-10">
          <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </span>
            Ventas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <StatCard label="Ingresos totales" value={fmt(totalRevenue)} sub="Pedidos aprobados" />
            <StatCard label="Ingresos este mes" value={fmt(monthRevenue)} />
            <StatCard label="Pedidos aprobados" value={approvedOrders.length} />
            <StatCard label="Pedidos pendientes" value={pendingOrders.length} />
          </div>
          <p className="text-xs text-slate-400">
            Ver detalle completo en{' '}
            <a href="/admin/ordenes" className="underline hover:text-slate-600">Órdenes</a>
          </p>
        </section>
      )}

      {/* ── Tráfico web (Vercel) ── */}
      <section>
        <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
            </svg>
          </span>
          Tráfico web (Vercel Analytics)
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center text-center">
          <p className="text-slate-600 text-sm mb-1">
            El tracking ya está activo en el sitio (<code className="bg-slate-100 px-1 rounded text-xs">@vercel/analytics</code>).
            Vercel recolecta visitas, páginas vistas y Web Vitals automáticamente.
          </p>
          <p className="text-slate-400 text-xs mb-5">
            Podés ver esos datos en el dashboard de Vercel. Para integrarlos directamente acá necesitás la Analytics API, disponible en el plan Pro.
          </p>
          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
          >
            Ver en Vercel Analytics
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </section>
    </div>
  )
}
