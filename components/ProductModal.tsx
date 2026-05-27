'use client'

import { useState, useEffect } from 'react'
import { normalizeVariant } from '@/lib/types'
import type { Product, ProductVariant } from '@/lib/types'
import { useCart } from './CartContext'

interface Props {
  product: Product
  open: boolean
  onClose: () => void
}

export default function ProductModal({ product, open, onClose }: Props) {
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

  const stars = '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating))

  function handleAdd() {
    for (let i = 0; i < qty; i++) add(product, selectedVariant?.name)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
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

              <div className="flex items-center gap-2 mb-3">
                <span className="stars text-sm">{stars}</span>
                <span className="text-sm text-slate-400">{product.rating} ({product.reviews} opiniones)</span>
              </div>

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
                  {effectiveStock > 5
                    ? 'En stock'
                    : effectiveStock > 0
                    ? `Últimas ${effectiveStock} unidades`
                    : 'Sin stock'}
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

              {/* Qty */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-sm font-semibold text-slate-700">Cantidad:</span>
                <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-1.5 hover:bg-slate-50 text-lg text-slate-600 transition"
                  >−</button>
                  <span className="px-4 py-1.5 font-bold text-slate-800 min-w-[3rem] text-center">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(effectiveStock, qty + 1))}
                    className="px-3 py-1.5 hover:bg-slate-50 text-lg text-slate-600 transition"
                  >+</button>
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={effectiveStock === 0}
                className="w-full py-3.5 rounded-xl font-semibold text-white transition text-sm disabled:bg-slate-200 disabled:text-slate-400 hover:opacity-90"
                style={effectiveStock === 0 ? {} : added ? { backgroundColor: '#10b981' } : { backgroundColor: 'var(--primary)' }}
              >
                {added ? '✓ Agregado al carrito' : effectiveStock === 0 ? 'Sin stock' : 'Agregar al carrito'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
