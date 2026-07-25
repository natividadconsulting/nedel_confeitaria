'use client'

import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'

function formatPrice(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function itemLabel(item: ReturnType<typeof useCart>['items'][0]) {
  const parts: string[] = []
  if (item.size) parts.push(item.size)
  if (item.filling) parts.push(item.filling.split('—')[0].trim())
  if (item.flavor) parts.push(item.flavor.split('—')[0].trim())
  if (item.bulkLabel) parts.push(item.bulkLabel)
  return parts.join(' · ')
}

export default function CartSidebar() {
  const { items, removeItem, updateQty, total, isOpen, setIsOpen } = useCart()
  const router = useRouter()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/40" onClick={() => setIsOpen(false)} />
      <div className="w-full max-w-sm bg-white flex flex-col h-full shadow-2xl">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-800">Meu Pedido</h2>
          <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-600 text-2xl leading-none">×</button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <span className="text-5xl mb-4">🛒</span>
            <p className="text-stone-500">Seu pedido está vazio</p>
            <p className="text-sm text-stone-400 mt-1">Adicione itens do cardápio</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {items.map(item => (
              <div key={item.cartId} className="bg-stone-50 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 leading-tight">{item.name}</p>
                    {itemLabel(item) && (
                      <p className="text-xs text-stone-500 mt-0.5 leading-tight">{itemLabel(item)}</p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-amber-600 mt-0.5 italic">{item.notes}</p>
                    )}
                  </div>
                  <button onClick={() => removeItem(item.cartId)} className="text-stone-300 hover:text-red-400 text-lg leading-none shrink-0">×</button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.cartId, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:border-amber-400 text-sm"
                    >−</button>
                    <span className="text-sm font-medium text-stone-700 w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.cartId, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:border-amber-400 text-sm"
                    >+</button>
                  </div>
                  <span className="text-sm font-semibold text-amber-800">{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-5 py-4 border-t border-stone-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-stone-600 font-medium">Total</span>
            <span className="text-xl font-bold text-amber-800">{formatPrice(total)}</span>
          </div>
          <button
            onClick={() => { setIsOpen(false); router.push('/checkout') }}
            disabled={items.length === 0}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white font-semibold py-4 rounded-xl transition-colors"
          >
            Finalizar Pedido
          </button>
        </div>
      </div>
    </div>
  )
}
