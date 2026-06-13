'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/CartContext'
import { startCheckout } from '@/lib/mp-actions'

export default function CheckoutForm() {
  const { items, total } = useCart()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
  })

  function fmt(n: number) {
    return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (items.length === 0) {
      setError('Tu carrito está vacío.')
      return
    }

    startTransition(async () => {
      try {
        const mpItems = items.map((i) => ({
          id: i.id,
          title: i.name,
          quantity: i.quantity,
          unit_price: i.price,
          image_url: i.image_url ?? undefined,
        }))
        const { init_point } = await startCheckout(mpItems, form)
        window.location.href = init_point
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al procesar el pago. Intentá de nuevo.')
      }
    })
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-700 mb-2">Tu carrito está vacío</h2>
        <p className="text-slate-400 text-sm mb-6">Agregá productos antes de continuar con el pago.</p>
        <button
          onClick={() => router.push('/productos')}
          className="px-6 py-3 text-white font-semibold rounded-xl text-sm transition hover:opacity-90"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Ver productos
        </button>
      </div>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Finalizar compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6 order-2 lg:order-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-700 mb-4">Datos del comprador</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Juan"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Apellido *</label>
                <input
                  name="surname"
                  value={form.surname}
                  onChange={handleChange}
                  required
                  placeholder="Pérez"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="juan@email.com"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus-primary"
                />
                <p className="text-xs text-slate-400 mt-1">Te enviaremos la confirmación de compra a este email.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="3510000000"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus-primary"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-4 rounded-xl font-bold text-white text-base transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            style={{ backgroundColor: '#009ee3' }}
          >
            {pending ? (
              <>
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Redirigiendo a Mercado Pago...
              </>
            ) : (
              <>
                <MPLogo />
                Pagar con Mercado Pago
              </>
            )}
          </button>

          <p className="text-xs text-slate-400 text-center">
            Serás redirigido al sitio seguro de Mercado Pago para completar el pago.
          </p>
        </form>

        {/* Resumen del pedido */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:sticky lg:top-4">
            <h2 className="font-semibold text-slate-700 mb-4">
              Resumen del pedido
              <span className="ml-2 text-xs font-normal text-slate-400">
                ({items.reduce((s, i) => s + i.quantity, 0)} ítems)
              </span>
            </h2>

            <div className="space-y-3 mb-5">
              {items.map((item) => (
                <div key={`${item.id}-${item.selectedVariant}`} className="flex gap-3">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg shrink-0 border border-slate-100"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 rounded-lg shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 line-clamp-2 leading-snug">{item.name}</p>
                    {item.selectedVariant && (
                      <p className="text-[11px] text-slate-400">{item.selectedVariant}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 shrink-0">
                    {fmt(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>{fmt(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Envío</span>
                <span className="text-emerald-600 font-medium">A calcular</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 text-base pt-1 border-t border-slate-100">
                <span>Total</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}

function MPLogo() {
  return (
    <svg width="22" height="15" viewBox="0 0 22 15" fill="none">
      <rect width="22" height="15" rx="3" fill="#009ee3"/>
      <path d="M3.5 10.5c1-2 2.5-3.5 4-4s3 0 3.5 1.5 0 3.5-2 4.5-4 .5-5.5-2z" fill="white" opacity=".9"/>
      <path d="M11 10.5c.5-2 2-3.5 3.5-4s2.5 0 3 1.5 0 3.5-1.5 4.5-3.5.5-5-2z" fill="white" opacity=".7"/>
    </svg>
  )
}
