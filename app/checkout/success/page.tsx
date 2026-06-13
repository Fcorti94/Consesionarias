import Link from 'next/link'
import HeaderWrapper from '@/components/HeaderWrapper'
import CheckoutSuccessClear from './CheckoutSuccessClear'
import { processPayment } from '@/lib/process-payment'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_id?: string; status?: string }>
}) {
  const params    = await searchParams
  const paymentId = params.payment_id

  if (paymentId) {
    try {
      await processPayment(paymentId)
    } catch (err) {
      console.error('[CheckoutSuccess] processPayment failed:', err)
    }
  }

  return (
    <>
      <HeaderWrapper />
      <CheckoutSuccessClear />
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">¡Pago aprobado!</h1>
        <p className="text-slate-500 max-w-sm mb-8">
          Tu pedido fue procesado correctamente. Te enviaremos un email con los detalles de tu compra.
        </p>
        <Link
          href="/productos"
          className="px-8 py-3 text-white font-semibold rounded-xl text-sm transition hover:opacity-90"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Seguir comprando
        </Link>
      </div>
    </>
  )
}
