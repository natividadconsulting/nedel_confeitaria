'use client'

import { createContext, useContext, useState, useCallback, useSyncExternalStore, ReactNode } from 'react'
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
  loaded: boolean
}

const CartContext = createContext<CartContextType | null>(null)

// The cart lives in localStorage. Reading it through useSyncExternalStore lets the server
// and the first client render agree (empty cart), then shows the saved cart right after,
// with no hydration mismatch (React error #418 when it was read during render).
const STORAGE_KEY = 'nedel-cart'
const EMPTY: CartItem[] = []
const listeners = new Set<() => void>()
let cachedRaw: string | null = null
let cachedItems: CartItem[] = EMPTY

function readCart(): CartItem[] {
  let raw: string | null = null
  try { raw = localStorage.getItem(STORAGE_KEY) } catch {}
  if (raw !== cachedRaw) {
    cachedRaw = raw
    try { cachedItems = raw ? JSON.parse(raw) : EMPTY } catch { cachedItems = EMPTY }
  }
  return cachedItems
}

function writeCart(next: CartItem[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  cachedRaw = null
  cachedItems = next
  listeners.forEach(l => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => { if (e.key === STORAGE_KEY) listener() }
  window.addEventListener('storage', onStorage)
  return () => { listeners.delete(listener); window.removeEventListener('storage', onStorage) }
}

const noopSubscribe = () => () => {}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, readCart, () => EMPTY)
  const loaded = useSyncExternalStore(noopSubscribe, () => true, () => false)
  const [isOpen, setIsOpen] = useState(false)

  const setItems = useCallback((update: (prev: CartItem[]) => CartItem[]) => {
    writeCart(update(readCart()))
  }, [])

  const addItem = useCallback((item: Omit<CartItem, 'cartId'>) => {
    const cartId = `${item.productId}-${Date.now()}-${Math.random()}`
    setItems(prev => [...prev, { ...item, cartId }])
  }, [setItems])

  const removeItem = useCallback((cartId: string) => {
    setItems(prev => prev.filter(i => i.cartId !== cartId))
  }, [setItems])

  const updateQty = useCallback((cartId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.cartId !== cartId))
    } else {
      setItems(prev => prev.map(i => i.cartId === cartId ? { ...i, quantity } : i))
    }
  }, [setItems])

  const clearCart = useCallback(() => setItems(() => []), [setItems])

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, itemCount, isOpen, setIsOpen, loaded }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
