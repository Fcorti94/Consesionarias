'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/components/CartContext'
import { normalizeVariant } from '@/lib/types'
import type { Product, ProductVariant } from '@/lib/types'

interface Props {
  product: Product
  relatedProducts: Product[]
  categoryLabel: string
  shippingFreeFrom: number
  installments: number
}

export default function ProductDetailClient({ product, relatedProducts, categoryLabel, shippingFreeFrom, installments }: Props) {
  const { add } = useCart()
  const variants: ProductVariant[] = (product.variants ?? []).map(normalizeVariant)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    variants[0] ?? undefined
  )
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock

  const allImages = (product.image_urls && product.image_urls.length > 0)
    ? product.image_urls
    : product.image_url ? [product.image_url] : []
  const [activeImg, setActiveImg] = useState(allImages[0] ?? '')

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  function fmt(n: number) {
    return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
  }

  function handleAdd() {
    for (let i = 0; i < qty; i++) add(product, selectedVariant?.name)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const stars = '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating))

  const hasAttributes = product.attributes && Object.keys(product.attributes).length > 0

  return (
    <>
      {/* ── Producto principal ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Galería */}
          <div className="flex flex-col">
            {/* Imagen principal */}
            <div className="relative bg-slate-50 aspect-square lg:aspect-auto lg:min-h-[380px]">
              {activeImg ? (
                <img
                  src={activeImg}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/f1f5f9/64748b?text=Producto'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200">
                  <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="m21 15-5-5L5 21"/>
                  </svg>
                </div>
              )}
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discount && discount > 0 && (
                  <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
                    -{discount}%
                  </span>
                )}
                {product.badge === 'Nuevo' && (
                  <span className="bg-emerald-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
                    Nuevo
                  </span>
                )}
                {effectiveStock === 0 && (
                  <span className="bg-slate-700 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
                    Sin stock
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto bg-slate-50 border-t border-slate-100">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(img)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImg === img
                        ? 'border-[var(--primary)] opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-100 hover:border-slate-300'
                    }`}
                  >
                    <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 lg:p-8 flex flex-col">
            {/* Categorías */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(product.categories?.length ? product.categories : [product.category]).map((cat) => (
                <a
                  key={cat}
                  href={`/productos?categoria=${cat}`}
                  className="text-xs font-bold uppercase tracking-widest capitalize px-2 py-0.5 rounded-full hover:opacity-80 transition"
                  style={{ color: 'var(--primary)', backgroundColor: 'color-mix(in srgb, var(--primary) 10%, white)' }}
                >
                  {cat}
                </a>
              ))}
            </div>

            {/* Nombre */}
            <h1 className="text-2xl lg:text-3xl font-black text-slate-800 leading-snug mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            {product.reviews > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="stars text-base">{stars}</span>
                <span className="text-sm text-slate-500">{product.rating} ({product.reviews} opiniones)</span>
              </div>
            )}

            {/* Precio */}
            <div className="mb-5">
              {product.original_price && (
                <p className="text-slate-400 line-through text-base mb-0.5">{fmt(product.original_price)}</p>
              )}
              <p className="text-4xl font-black text-slate-900">{fmt(product.price)}</p>
              {discount && discount > 0 && (
                <p className="text-emerald-600 font-semibold text-sm mt-1">
                  Ahorrás {fmt(product.original_price! - product.price)}
                </p>
              )}
              <p className="text-slate-400 text-xs mt-1">
                {installments}x {fmt(product.price / installments)} sin interés
              </p>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-5">
              <div className={`w-2.5 h-2.5 rounded-full ${
                effectiveStock > 5 ? 'bg-emerald-500' : effectiveStock > 0 ? 'bg-amber-500' : 'bg-red-400'
              }`} />
              <span className="text-sm text-slate-600">
                {effectiveStock > 5
                  ? 'En stock'
                  : effectiveStock > 0
                  ? `Últimas ${effectiveStock} unidades`
                  : 'Sin stock'}
              </span>
            </div>

            {/* Variantes */}
            {variants.length > 0 && (
              <div className="mb-5">
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
                        className="px-4 py-2 rounded-xl text-sm border-2 font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                        style={isActive
                          ? { borderColor: 'var(--primary)', backgroundColor: 'color-mix(in srgb, var(--primary) 10%, white)', color: 'var(--primary)' }
                          : { borderColor: '#e2e8f0', color: '#475569' }}
                      >
                        {v.name}
                        {outOfStock && <span className="ml-1 text-xs opacity-60">(sin stock)</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Cantidad + Agregar */}
            {effectiveStock > 0 && (
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-2.5 hover:bg-slate-50 text-slate-600 font-bold transition text-lg"
                  >−</button>
                  <span className="px-4 py-2.5 font-bold text-slate-800 min-w-[3rem] text-center">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(effectiveStock, qty + 1))}
                    className="px-3 py-2.5 hover:bg-slate-50 text-slate-600 font-bold transition text-lg"
                  >+</button>
                </div>
                <button
                  onClick={handleAdd}
                  className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: added ? '#10b981' : 'var(--primary)' }}
                >
                  {added ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      ¡Agregado!
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 01-8 0"/>
                      </svg>
                      Agregar al carrito
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100">
              {[
                { icon: '🚚', text: `Envío gratis +${fmt(shippingFreeFrom)}` },
                { icon: '🛡️', text: 'Productos originales' },
                { icon: '🔄', text: '30 días de garantía' },
                { icon: '💳', text: `${installments} cuotas sin interés` },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="text-base">{b.icon}</span>
                  {b.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Descripción + Especificaciones ── */}
      {(product.description || hasAttributes) && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          {product.description && (
            <div className={hasAttributes ? 'mb-6 pb-6 border-b border-slate-100' : ''}>
              <h2 className="font-bold text-slate-700 mb-3">Descripción</h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {hasAttributes && (
            <div>
              <h2 className="font-bold text-slate-700 mb-3">Especificaciones</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 rounded-xl overflow-hidden border border-slate-100">
                {Object.entries(product.attributes!).filter(([, v]) => v && v !== '' && !(Array.isArray(v) && v.length === 0)).map(([key, value], i) => (
                  <div key={key} className={`flex px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                    <span className="text-slate-500 w-36 shrink-0 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-slate-700 font-medium">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Productos relacionados ── */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="font-bold text-slate-700 text-lg mb-4">Productos relacionados</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <Link key={p.id} href={`/productos/${p.id}`}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition group"
              >
                <div className="aspect-square bg-slate-50 overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <path d="m21 15-5-5L5 21"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-slate-700 line-clamp-2 mb-1">{p.name}</p>
                  <p className="font-black text-slate-900">
                    {p.price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
