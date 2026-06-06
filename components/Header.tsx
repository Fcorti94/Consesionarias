'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCart } from './CartContext'
import type { ConfigCategory } from '@/lib/types'
import CartSidebar from './CartSidebar'

interface HeaderProps {
  brandName?:        string
  brandTagline?:     string
  brandLogoUrl?:     string
  phone?:            string
  whatsapp?:         string
  instagram?:        string
  shippingFreeFrom?: number
  categories?:       ConfigCategory[]
}

export default function Header({
  brandName        = 'Mi Tienda',
  brandTagline     = '',
  brandLogoUrl     = '',
  phone            = '',
  whatsapp         = '',
  instagram        = '',
  shippingFreeFrom = 50000,
  categories       = [],
}: HeaderProps) {
  const { count } = useCart()
  const [cartOpen, setCartOpen]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [catOpen,  setCatOpen]    = useState(false)
  const [search,   setSearch]     = useState('')
  const router       = useRouter()
  const searchParams = useSearchParams()
  const inputRef     = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSearch(searchParams.get('buscar') ?? '')
  }, [searchParams])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = search.trim()
    if (q) router.push(`/productos?buscar=${encodeURIComponent(q)}`)
  }

  const fmt = (n: number) =>
    n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

  const contactHref = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}`
    : phone ? `tel:${phone}` : null

  const instagramHref = instagram
    ? (instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`)
    : null

  return (
    <>
      {/* ── Main header ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">

        {/* ── Mobile: dos filas ── */}
        <div className="md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              {brandLogoUrl ? (
                <img src={brandLogoUrl} alt={brandName} className="w-9 h-9 rounded-xl object-contain shadow-sm bg-white border border-slate-100" />
              ) : (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: 'var(--primary)' }}>
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                    <path d="M6 20 L10 12 L16 16 L22 10 L26 20 Z" fill="white"/>
                    <circle cx="10" cy="22" r="2.5" fill="white"/>
                    <circle cx="22" cy="22" r="2.5" fill="white"/>
                  </svg>
                </div>
              )}
              <div className="leading-none">
                <div className="font-black text-slate-900 text-sm tracking-tight">{brandName}</div>
                {brandTagline && <div className="text-slate-400 text-[11px] mt-0.5">{brandTagline}</div>}
              </div>
            </Link>

            {/* Acciones mobile */}
            <div className="flex items-center gap-2">
              {instagramHref && (
                <a href={instagramHref} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-pink-500 transition">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
              )}
              <button onClick={() => setCartOpen(true)}
                className="relative w-10 h-10 flex items-center justify-center text-white rounded-full transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--primary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                    {count}
                  </span>
                )}
              </button>
              <button className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-slate-100 transition"
                onClick={() => { setMenuOpen(!menuOpen); setCatOpen(false) }} aria-label="Menú">
                <span className={`block w-5 h-0.5 bg-slate-700 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}/>
                <span className={`block w-5 h-0.5 bg-slate-700 transition-all ${menuOpen ? 'opacity-0' : ''}`}/>
                <span className={`block w-5 h-0.5 bg-slate-700 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}/>
              </button>
            </div>
          </div>

          {/* Búsqueda mobile (fila 2) */}
          <div className="px-4 pb-3">
            <form onSubmit={handleSearch}>
              <div className="flex items-center bg-slate-50 border-2 border-slate-200 rounded-full overflow-hidden focus-within:border-[var(--primary)] focus-within:bg-white transition-all duration-200">
                <input
                  ref={inputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm outline-none bg-transparent placeholder:text-slate-400"
                  placeholder="Buscar por marca, modelo, repuesto..."
                />
                <button type="submit" className="m-1 px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-1.5 transition-opacity hover:opacity-90" style={{ backgroundColor: 'var(--primary)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  Buscar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Desktop: una fila ── */}
        <div className="hidden md:block">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 shrink-0">
              {brandLogoUrl ? (
                <img src={brandLogoUrl} alt={brandName} className="w-10 h-10 rounded-xl object-contain shadow-sm bg-white border border-slate-100" />
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: 'var(--primary)' }}>
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                    <path d="M6 20 L10 12 L16 16 L22 10 L26 20 Z" fill="white" strokeWidth="1" strokeLinejoin="round"/>
                    <circle cx="10" cy="22" r="2.5" fill="white"/>
                    <circle cx="22" cy="22" r="2.5" fill="white"/>
                  </svg>
                </div>
              )}
              <div className="leading-none">
                <div className="font-black text-slate-900 text-base tracking-tight">{brandName}</div>
                {brandTagline && <div className="text-slate-400 text-xs mt-0.5 font-normal">{brandTagline}</div>}
              </div>
            </Link>
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
              <div className="flex items-center bg-slate-50 border-2 border-slate-200 rounded-full overflow-hidden focus-within:border-[var(--primary)] focus-within:bg-white transition-all duration-200">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 px-5 py-2.5 text-sm outline-none bg-transparent placeholder:text-slate-400"
                  placeholder="Buscar por marca, modelo, repuesto..."
                />
                <button type="submit" className="m-1 px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-1.5 transition-opacity hover:opacity-90" style={{ backgroundColor: 'var(--primary)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  Buscar
                </button>
              </div>
            </form>
            <div className="flex items-center gap-2 shrink-0">
              {contactHref && (
                <a href={contactHref} target={whatsapp ? '_blank' : undefined} rel={whatsapp ? 'noopener noreferrer' : undefined}
                  className="hidden lg:flex items-center gap-2 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-full px-4 py-2.5 text-sm font-medium transition">
                  {whatsapp ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.528 5.857L.057 23.882l6.195-1.623A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.893 9.893 0 01-5.031-1.368l-.361-.214-3.741.981.999-3.648-.235-.374A9.861 9.861 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106S21.894 6.58 21.894 12 17.42 21.894 12 21.894z"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.4 1.18 2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006 6l1.51-1.51a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                    </svg>
                  )}
                  Contacto
                </a>
              )}
              {instagramHref && (
                <a href={instagramHref} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  className="w-11 h-11 flex items-center justify-center rounded-full border border-slate-200 hover:border-pink-300 text-slate-500 hover:text-pink-500 transition">
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
              )}
              <button onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-2 text-white rounded-full px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--primary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                Carrito
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold leading-none">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav className={`border-t border-slate-100 ${menuOpen ? 'block' : 'hidden md:block'}`}>
          <div className="max-w-7xl mx-auto px-4 py-1 flex flex-col md:flex-row md:items-center md:justify-between">

            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-3 md:py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition border-b border-slate-50 md:border-none"
            >
              Inicio
            </Link>

            {/* Categorías — CSS hover en desktop, click en mobile */}
            <div className="nav-dropdown md:relative">
              <button
                onClick={() => setCatOpen(!catOpen)}
                className="w-full md:w-auto flex items-center justify-between md:justify-start gap-1 px-3 py-3 md:py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition border-b border-slate-50 md:border-none"
              >
                Categorías
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  className={`transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {/* Mobile: lista inline */}
              {catOpen && (
                <div className="md:hidden grid grid-cols-2 gap-0.5 px-2 pb-2 bg-slate-50 rounded-xl mx-2 mb-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/productos?categoria=${cat.slug}`}
                      onClick={() => { setMenuOpen(false); setCatOpen(false) }}
                      className="px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-white hover:text-slate-900 transition font-medium"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Desktop: dropdown CSS hover */}
              <div className="nav-dropdown-menu absolute top-full left-0 pt-2 z-50">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 w-56">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/productos?categoria=${cat.slug}`}
                      className="block px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition font-medium"
                    >
                      {cat.label}
                      {cat.sub && <span className="block text-xs text-slate-400 font-normal">{cat.sub}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/productos"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-3 md:py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition border-b border-slate-50 md:border-none"
            >
              Todos los productos
            </Link>
            <Link
              href="/productos?oferta=1"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-3 md:py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition border-b border-slate-50 md:border-none"
            >
              Oportunidades
            </Link>
            <Link
              href="/faq"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-3 md:py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition border-b border-slate-50 md:border-none"
            >
              Preguntas frecuentes
            </Link>
          </div>
        </nav>
      </header>

      <CartSidebar
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        shippingFreeFrom={shippingFreeFrom}
      />
    </>
  )
}
