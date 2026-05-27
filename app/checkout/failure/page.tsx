import Link from 'next/link'
import HeaderWrapper from '@/components/HeaderWrapper'

export default function CheckoutFailurePage() {
  return (
    <>
      <HeaderWrapper />
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">El pago no se procesó</h1>
        <p className="text-slate-500 max-w-sm mb-8">
          Hubo un problema con el pago. Podés intentarlo nuevamente o elegir otro método de pago.
        </p>
        <div className="flex gap-3">
          <Link
            href="/checkout"
            className="px-8 py-3 text-white font-semibold rounded-xl text-sm transition hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Reintentar pago
          </Link>
          <Link
            href="/productos"
            className="px-8 py-3 text-slate-600 font-semibold rounded-xl text-sm transition hover:bg-slate-100 border border-slate-200"
          >
            Ver productos
          </Link>
        </div>
      </div>
    </>
  )
}
