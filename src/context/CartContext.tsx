'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { CartItem } from '@/types'

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'cartId'>) => void
  removeItem: (cartId: string) => void
  updateQty: (cartId: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem('nedel-cart')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('nedel-cart', JSON.stringify(items))
  }, [items])

  const addItem = useCallback((item: Omit<CartItem, 'cartId'>) => {
    const cartId = `${item.productId}-${Date.now()}-${Math.random()}`
    setItems(prev => [...prev, { ...item, cartId }])
  }, [])

  const removeItem = useCallback((cartId: string) => {
    setItems(prev => prev.filter(i => i.cartId !== cartId))
  }, [])

  const updateQty = useCallback((cartId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.cartId !== cartId))
    } else {
      setItems(prev => prev.map(i => i.cartId === cartId ? { ...i, quantity } : i))
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, itemCount, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
