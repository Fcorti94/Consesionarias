'use client'

import { useEffect } from 'react'
import { useCart } from '@/components/CartContext'

export default function CheckoutSuccessClear() {
  const { clear } = useCart()
  useEffect(() => { clear() }, [])
  return null
}
