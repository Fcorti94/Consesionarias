'use client'

import { useRef, useCallback } from 'react'
import Link from 'next/link'

type Brand = { name: string; logo_url: string }

export default function BrandsCarousel({ brands }: { brands: Brand[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  const startScroll = useCallback((direction: 'left' | 'right') => {
    const step = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft += direction === 'right' ? 1.5 : -1.5
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }, [])

  const stopScroll = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  if (brands.length === 0) return null

  return (
    <div className="relative px-8 sm:px-10">
      {/* Left arrow */}
      <button
        onMouseEnter={() => startScroll('left')}
        onMouseLeave={stopScroll}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-md transition"
        aria-label="Anterior"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-hidden"
        style={{ scrollBehavior: 'auto' }}
      >
        {brands.map((brand) => (
          <Link
            key={brand.name}
            href={`/productos?buscar=${encodeURIComponent(brand.name)}`}
            className="flex-shrink-0 w-32 sm:w-44 flex flex-col items-center group"
          >
            <div className="w-full h-20 sm:h-28 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center transition group-hover:border-[var(--primary)] group-hover:shadow-md">
              {brand.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="w-full h-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <span className="font-bold text-slate-500 text-sm text-center px-2 leading-tight group-hover:text-[var(--primary)] transition">
                  {brand.name}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 font-semibold mt-2 text-center w-full truncate px-1 group-hover:text-[var(--primary)] transition">
              {brand.name}
            </p>
          </Link>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onMouseEnter={() => startScroll('right')}
        onMouseLeave={stopScroll}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-md transition"
        aria-label="Siguiente"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}
