import Link from 'next/link'
import HeaderWrapper from '@/components/HeaderWrapper'

export default function CheckoutPendingPage() {
  return (
    <>
      <HeaderWrapper />
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Pago pendiente</h1>
        <p className="text-slate-500 max-w-sm mb-8">
          Tu pago está siendo procesado. Te notificaremos por email cuando se confirme.
        </p>
        <Link
          href="/productos"
          className="px-8 py-3 text-white font-semibold rounded-xl text-sm transition hover:opacity-90"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Volver al inicio
        </Link>
      </div>
    </>
  )
}
