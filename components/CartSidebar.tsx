'use client'

import { useCart } from './CartContext'
import { useRouter } from 'next/navigation'

interface Props {
  open: boolean
  onClose: () => void
  shippingFreeFrom?: number
}

export default function CartSidebar({ open, onClose, shippingFreeFrom = 50000 }: Props) {
  const { items, remove, updateQty, total, count } = useCart()
  const router = useRouter()

  if (!open) return null

  function fmt(n: number) {
    return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
  }

  const remaining = Math.max(0, shippingFreeFrom - total)
  const progressPct = Math.min(100, Math.round((total / shippingFreeFrom) * 100))
  const freeShipping = total >= shippingFreeFrom

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <aside className="cart-sidebar-enter fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--primary)' }}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <h2 className="font-bold text-slate-800 text-base">
              Mi carrito
              {count > 0 && (
                <span className="ml-2 text-xs font-normal text-slate-400">
                  {count} {count === 1 ? 'ítem' : 'ítems'}
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Free shipping progress */}
        {items.length > 0 && (
          <div className={`px-5 py-3 ${freeShipping ? 'bg-emerald-50' : 'bg-slate-50'} border-b border-slate-100`}>
            {freeShipping ? (
              <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                ¡Tenés envío gratis!
              </p>
            ) : (
              <>
                <p className="text-xs text-slate-500 mb-2">
                  Te faltan <span className="font-bold text-slate-700">{fmt(remaining)}</span> para envío gratis
                </p>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="shipping-bar-fill h-full rounded-full"
                    style={{ width: `${progressPct}%`, backgroundColor: 'var(--primary)' }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto cart-items px-4 py-3 space-y-2.5">
          {items.length === 0 ? (
            <div className="text-center text-slate-400 mt-20 px-6">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </div>
              <p className="font-semibold text-slate-600 mb-1">Tu carrito está vacío</p>
              <p className="text-xs">Agregá productos para continuar</p>
              <button
                onClick={onClose}
                className="mt-5 px-5 py-2.5 rounded-full text-white text-sm font-semibold transition hover:opacity-90"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Ver productos
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.id}-${item.selectedVariant}`}
                className="flex gap-3 bg-slate-50 hover:bg-slate-100 rounded-xl p-3 transition"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 bg-slate-200 rounded-lg shrink-0 flex items-center justify-center text-slate-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="m21 15-5-5L5 21"/>
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">{item.name}</p>
                  {item.selectedVariant && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.selectedVariant}</p>
                  )}
                  <p className="font-bold text-sm mt-1" style={{ color: 'var(--primary)' }}>
                    {fmt(item.price)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1, item.selectedVariant)}
                      className="w-6 h-6 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:border-slate-400 hover:bg-slate-100 text-slate-600 text-sm leading-none transition"
                    >−</button>
                    <span className="text-sm font-bold w-5 text-center text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1, item.selectedVariant)}
                      className="w-6 h-6 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:border-slate-400 hover:bg-slate-100 text-slate-600 text-sm leading-none transition"
                    >+</button>
                    <button
                      onClick={() => remove(item.id, item.selectedVariant)}
                      className="ml-auto text-slate-300 hover:text-red-400 transition p-1"
                      aria-label="Eliminar"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-slate-100 bg-white">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-500">Subtotal</span>
              <span className="text-xl font-black text-slate-900">{fmt(total)}</span>
            </div>
            {freeShipping ? (
              <p className="text-xs text-emerald-600 font-medium mb-4">+ Envío gratis incluido</p>
            ) : (
              <p className="text-xs text-slate-400 mb-4">Envío a calcular en el checkout</p>
            )}
            <button
              onClick={() => { onClose(); router.push('/checkout') }}
              className="w-full text-white font-semibold py-3.5 rounded-xl transition hover:opacity-90 text-sm"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Finalizar compra →
            </button>
            <button
              onClick={onClose}
              className="w-full mt-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-medium py-2 text-sm transition rounded-xl"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
