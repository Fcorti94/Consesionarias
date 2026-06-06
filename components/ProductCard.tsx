'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/lib/types'
import ProductModal from './ProductModal'

export default function ProductCard({
  product,
  showLowStockBadge = true,
  showQuantitySelector = true,
  whatsapp = '',
}: {
  product: Product
  showLowStockBadge?: boolean
  showQuantitySelector?: boolean
  whatsapp?: string
}) {
  const [modalOpen, setModalOpen] = useState(false)

  const waMessage = encodeURIComponent(`Hola, me interesa consultar sobre: ${product.name}`)
  const waUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${waMessage}`
    : '#'

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  function fmt(n: number) {
    return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
  }

  return (
    <>
      <div className="product-card bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 flex flex-col group">

        {/* Image */}
        <div
          className="relative aspect-square overflow-hidden cursor-pointer bg-slate-50"
          onClick={() => setModalOpen(true)}
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://placehold.co/400x400/f1f5f9/64748b?text=Producto'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-200">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="m21 15-5-5L5 21"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
              </svg>
            </div>
          )}

          {/* Hover overlay */}
          <div className="product-quick-add absolute inset-0 bg-[var(--navy)]/60 flex items-center justify-center gap-2 p-3">
            <Link
              href={`/productos/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-white text-slate-900 font-semibold text-xs py-2.5 rounded-xl hover:bg-slate-100 transition text-center"
            >
              Ver detalle
            </Link>
            {product.stock > 0 && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-green-600 text-white font-semibold text-xs py-2.5 rounded-xl hover:bg-green-700 transition text-center"
              >
                Consultar
              </a>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount && discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
            {product.badge === 'Nuevo' && (
              <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Nuevo
              </span>
            )}
          </div>

          {showLowStockBadge && product.stock <= 2 && product.stock > 0 && (
            <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              ¡Últimas!
            </span>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
              <span className="bg-white text-slate-700 font-bold px-4 py-2 rounded-full text-sm shadow">
                Sin stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3.5 flex flex-col flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 capitalize line-clamp-1" style={{ color: 'var(--primary)' }}>
            {(product.categories?.length ? product.categories : [product.category]).join(' · ')}
          </p>
          <h3
            className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 cursor-pointer hover:opacity-70 transition mb-2"
            onClick={() => setModalOpen(true)}
          >
            {product.name}
          </h3>

          <div className="mt-auto">
            {product.original_price && (
              <p className="text-slate-400 line-through text-xs leading-none mb-0.5">
                {fmt(product.original_price)}
              </p>
            )}
            <p className="text-lg font-black text-slate-900 leading-none">{fmt(product.price)}</p>
          </div>

          {product.stock === 0 ? (
            <div className="mt-3 w-full bg-slate-200 text-slate-400 font-semibold py-2.5 rounded-xl text-sm text-center">
              Sin stock
            </div>
          ) : (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition text-sm text-center block"
            >
              Contactar vendedor
            </a>
          )}
        </div>
      </div>

      <ProductModal
        product={product}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        whatsapp={whatsapp}
        showLowStockBadge={showLowStockBadge}
        showQuantitySelector={showQuantitySelector}
      />
    </>
  )
}
