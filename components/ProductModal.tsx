'use client'

import { useState, useEffect } from 'react'
import { normalizeVariant } from '@/lib/types'
import type { Product, ProductVariant } from '@/lib/types'
import { useCart } from './CartContext'

interface Props {
  product: Product
  open: boolean
  onClose: () => void
  whatsapp?: string
  showLowStockBadge?: boolean
  showCart?: boolean
}

export default function ProductModal({
  product, open, onClose,
  whatsapp = '', showLowStockBadge = true, showCart = true,
}: Props) {
  const { add } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const variants: ProductVariant[] = (product.variants ?? []).map(normalizeVariant)

  useEffect(() => {
    if (open) {
      setSelectedVariant(variants[0] ?? undefined)
      setQty(1)
      setAdded(false)
    }
  }, [open, product])

  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!open) return null

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  function fmt(n: number) {
    return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
  }

  const waMessage = encodeURIComponent(`Hola, me interesa consultar sobre: ${product.name}`)
  const waUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${waMessage}`
    : '#'

  function handleAdd() {
    for (let i = 0; i < qty; i++) {
      add(product, selectedVariant?.name)
    }
    setAdded(true)
    setTimeout(() => { setAdded(false); onClose() }, 1500)
  }

  return (
    <>
      <div className="cart-overlay z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
          <div className="flex flex-col md:flex-row">

            {/* Image */}
            <div className="md:w-1/2 relative">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full aspect-square object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://placehold.co/400x400/f1f5f9/64748b?text=Producto'
                  }}
                />
              ) : (
                <div className="w-full aspect-square bg-slate-100 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none flex items-center justify-center text-slate-200">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="m21 15-5-5L5 21"/>
                  </svg>
                </div>
              )}
              {discount && discount > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Content */}
            <div className="md:w-1/2 p-6 flex flex-col">
              <button
                onClick={onClose}
                className="self-end w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition mb-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>

              <p className="text-xs font-semibold uppercase tracking-wider capitalize mb-1" style={{ color: 'var(--primary)' }}>
                {(product.categories?.length ? product.categories : [product.category]).join(' · ')}
              </p>
              <h2 className="text-xl font-bold text-slate-800 mb-2 leading-snug">{product.name}</h2>

              {product.description && (
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{product.description}</p>
              )}

              {/* Price */}
              <div className="mb-4">
                {product.original_price && (
                  <p className="text-slate-400 line-through text-sm">{fmt(product.original_price)}</p>
                )}
                <p className="text-3xl font-black text-slate-900">{fmt(product.price)}</p>
                {discount && discount > 0 && (
                  <p className="text-emerald-600 text-sm font-medium mt-0.5">
                    Ahorrás {fmt(product.original_price! - product.price)}
                  </p>
                )}
              </div>

              {/* Stock indicator */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2 h-2 rounded-full ${
                  effectiveStock > 5 ? 'bg-emerald-500' : effectiveStock > 0 ? 'bg-amber-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-slate-600">
                  {effectiveStock === 0
                    ? 'Sin stock'
                    : showLowStockBadge && effectiveStock <= 5
                    ? `Últimas ${effectiveStock} unidades`
                    : 'Disponible'}
                </span>
              </div>

              {/* Variants */}
              {variants.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Variante:</p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => {
                      const isActive = selectedVariant?.name === v.name
                      const outOfStock = v.stock === 0
                      return (
                        <button
                          key={v.name}
                          onClick={() => setSelectedVariant(v)}
                          disabled={outOfStock}
                          className="px-3 py-1.5 rounded-lg text-sm border-2 font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                          style={isActive
                            ? { borderColor: 'var(--primary)', backgroundColor: 'color-mix(in srgb, var(--primary) 8%, white)', color: 'var(--primary)' }
                            : { borderColor: '#e2e8f0', color: '#475569' }
                          }
                        >
                          {v.name}
                          {outOfStock && <span className="ml-1 text-xs opacity-60">(sin stock)</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Qty — only in cart mode */}
              {showCart && effectiveStock > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-semibold text-slate-700">Cantidad:</span>
                  <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-1.5 hover:bg-slate-50 text-lg text-slate-600 transition">−</button>
                    <span className="px-4 py-1.5 font-bold text-slate-800 min-w-[3rem] text-center">{qty}</span>
                    <button onClick={() => setQty(Math.min(effectiveStock, qty + 1))} className="px-3 py-1.5 hover:bg-slate-50 text-lg text-slate-600 transition">+</button>
                  </div>
                </div>
              )}

              {effectiveStock === 0 ? (
                <div className="w-full py-3.5 rounded-xl font-semibold text-slate-400 bg-slate-200 text-sm text-center">
                  Sin stock
                </div>
              ) : showCart ? (
                <button
                  onClick={handleAdd}
                  className="w-full py-3.5 rounded-xl font-semibold text-white text-sm text-center flex items-center justify-center gap-2 transition hover:opacity-90"
                  style={{ backgroundColor: added ? '#16a34a' : 'var(--primary)' }}
                >
                  {added ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      ¡Agregado al carrito!
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 01-8 0"/>
                      </svg>
                      Agregar al carrito
                    </>
                  )}
                </button>
              ) : (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl font-semibold text-white text-sm text-center flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 transition"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413zM12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.528 5.857L.057 23.882l6.195-1.623A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.893 9.893 0 01-5.031-1.368l-.361-.214-3.741.981.999-3.648-.235-.374A9.861 9.861 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106S21.894 6.58 21.894 12 17.42 21.894 12 21.894z"/>
                  </svg>
                  Contactar vendedor
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
