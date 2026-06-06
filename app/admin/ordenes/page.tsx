import { createClient } from '@/lib/supabase/server'
import { getSiteConfig } from '@/lib/config-actions'
import type { Order } from '@/lib/types'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, { label: string; classes: string }> = {
  approved:  { label: 'Aprobado',   classes: 'bg-emerald-100 text-emerald-700' },
  pending:   { label: 'Pendiente',  classes: 'bg-amber-100 text-amber-700'     },
  rejected:  { label: 'Rechazado',  classes: 'bg-red-100 text-red-700'         },
  cancelled: { label: 'Cancelado',  classes: 'bg-slate-100 text-slate-500'     },
  refunded:  { label: 'Devuelto',   classes: 'bg-purple-100 text-purple-700'   },
}

function fmt(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

function fmtDate(s: string) {
  return new Date(s).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function OrdenesPage() {
  const supabase = await createClient()
  const config = await getSiteConfig()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const rows = (orders ?? []) as Order[]

  const totalApproved = rows
    .filter((o) => o.status === 'approved')
    .reduce((s, o) => s + Number(o.total), 0)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Órdenes</h1>
        <p className="text-slate-400 text-sm mt-0.5">Pedidos recibidos a través de Mercado Pago.</p>
      </div>

      {!config.show_cart && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-amber-800 text-sm flex items-start gap-3">
          <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>El carrito de compras está desactivado. Las nuevas órdenes solo se generan cuando el carrito está habilitado. Podés activarlo desde <a href="/admin/configuracion" className="font-semibold underline">Configuración</a>.</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total ventas" value={fmt(totalApproved)} color="emerald" />
        <StatCard label="Pedidos aprobados" value={String(rows.filter((o) => o.status === 'approved').length)} color="blue" />
        <StatCard label="Pendientes" value={String(rows.filter((o) => o.status === 'pending').length)} color="amber" />
        <StatCard label="Total pedidos" value={String(rows.length)} color="slate" />
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center text-slate-400">
          <svg className="mx-auto mb-4 text-slate-200" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p className="font-medium text-slate-500 mb-1">Todavía no hay pedidos</p>
          <p className="text-sm">Los pedidos aparecerán aquí cuando se completen pagos con Mercado Pago.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Comprador</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Productos</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((order) => {
                const st = STATUS_LABEL[order.status] ?? STATUS_LABEL.pending
                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {fmtDate(order.created_at)}
                      {order.mp_payment_id && (
                        <p className="text-slate-300 mt-0.5 font-mono">#{order.mp_payment_id}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-700">
                        {[order.buyer_name, order.buyer_surname].filter(Boolean).join(' ') || '—'}
                      </p>
                      {order.buyer_email && (
                        <p className="text-xs text-slate-400 mt-0.5">{order.buyer_email}</p>
                      )}
                      {order.buyer_phone && (
                        <p className="text-xs text-slate-400">{order.buyer_phone}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="space-y-0.5">
                        {order.items.map((item, i) => (
                          <p key={i} className="text-xs text-slate-600">
                            <span className="font-medium">{item.quantity}×</span> {item.title}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-slate-800 whitespace-nowrap">
                      {fmt(Number(order.total))}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${st.classes}`}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700',
    blue:    'bg-blue-50 text-blue-700',
    amber:   'bg-amber-50 text-amber-700',
    slate:   'bg-slate-100 text-slate-600',
  }
  return (
    <div className={`rounded-2xl p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  )
}
