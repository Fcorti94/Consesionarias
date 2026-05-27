'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { CartItem, Product } from '@/lib/types'

interface CartCtx {
  items: CartItem[]
  add: (product: Product, variant?: string) => void
  remove: (id: string, variant?: string) => void
  updateQty: (id: string, qty: number, variant?: string) => void
  clear: () => void
  total: number
  count: number
}

const CartContext = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('eap_cart')
    if (saved) setItems(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('eap_cart', JSON.stringify(items))
  }, [items])

  const key = (id: string, variant?: string) => `${id}__${variant ?? ''}`

  function add(product: Product, variant?: string) {
    setItems((prev) => {
      const k = key(product.id, variant)
      const existing = prev.find((i) => key(i.id, i.selectedVariant) === k)
      if (existing) {
        return prev.map((i) =>
          key(i.id, i.selectedVariant) === k
            ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) }
            : i
        )
      }
      return [...prev, { ...product, quantity: 1, selectedVariant: variant }]
    })
  }

  function remove(id: string, variant?: string) {
    setItems((prev) => prev.filter((i) => key(i.id, i.selectedVariant) !== key(id, variant)))
  }

  function updateQty(id: string, qty: number, variant?: string) {
    if (qty <= 0) { remove(id, variant); return }
    setItems((prev) =>
      prev.map((i) =>
        key(i.id, i.selectedVariant) === key(id, variant) ? { ...i, quantity: qty } : i
      )
    )
  }

  function clear() { setItems([]) }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
