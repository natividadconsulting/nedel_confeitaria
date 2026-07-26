'use client'

import { useState, useMemo } from 'react'
import { Product } from '@/types'
import { useCart } from '@/context/CartContext'

function formatPrice(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface Props {
  products: Product[]
  categoryId: string
  categoryName: string
  onClose: () => void
}

function roundUp25(n: number) {
  return Math.ceil(n * 4) / 4
}

export default function BandejaModal({ products, categoryId, categoryName, onClose }: Props) {
  const { addItem } = useCart()
  const [bandejaSize, setBandejaSize] = useState<50 | 100>(100)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [withPelotine, setWithPelotine] = useState(false)

  const tiers = useMemo(() => {
    const opts = products[0]?.bulkOptions ?? []
    const t50 = opts.find(o => o.quantity === 50)
    const t100 = opts.find(o => o.quantity === 100)
    return { 50: t50?.price ?? 67.50, 100: t100?.price ?? 120 }
  }, [products])

  const total = Object.values(quantities).reduce((s, q) => s + q, 0)
  const remaining = bandejaSize - total

  const showPelotine = categoryId === 'salgados-tradicionais' && bandejaSize === 100
  const tierPrice = showPelotine && withPelotine
    ? roundUp25(tiers[100] * 1.04)
    : tiers[bandejaSize]

  const grouped = products.reduce<Record<string, Product[]>>((acc, p) => {
    const key = p.subcategory ?? ''
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})

  function setQty(productId: string, qty: number) {
    if (qty < 0) return
    const otherTotal = total - (quantities[productId] ?? 0)
    if (otherTotal + qty > bandejaSize) return
    setQuantities(prev => ({ ...prev, [productId]: qty }))
  }

  function handleAdd() {
    const breakdown = products
      .filter(p => (quantities[p.id] ?? 0) > 0)
      .map(p => ({ name: p.name, quantity: quantities[p.id] }))
    const pelotineLabel = showPelotine ? ` • ${withPelotine ? 'com' : 'sem'} pelotine` : ''
    addItem({
      productId: `caixa-${categoryId}`,
      categoryId,
      name: `Caixa de ${categoryName}`,
      quantity: 1,
      unitPrice: tierPrice,
      bulkLabel: `${bandejaSize} unidades${pelotineLabel}`,
      breakdown,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-stone-800">Montar Sua Caixa</h2>
            <p className="text-xs text-stone-500">{categoryName}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-2xl leading-none">×</button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Tier selector */}
          <div>
            <p className="text-sm font-semibold text-stone-700 mb-2">Tamanho da caixa</p>
            <div className="grid grid-cols-2 gap-2">
              {([50, 100] as const).map(size => (
                <button
                  key={size}
                  onClick={() => { setBandejaSize(size); setQuantities({}); setWithPelotine(false) }}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    bandejaSize === size ? 'border-amber-500 bg-amber-50' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <p className="text-sm font-bold text-stone-800">{size} unidades</p>
                  <p className="text-sm font-bold text-amber-700">{formatPrice(tiers[size])}</p>
                  <p className="text-xs text-stone-400">{formatPrice(tiers[size] / size)}/un</p>
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className={`rounded-xl p-3 flex items-center justify-between ${
            remaining === 0 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-100'
          }`}>
            <span className="text-sm font-medium text-stone-700">
              {remaining === 0 ? '✅ Caixa completa!' : `Faltam ${remaining} salgados`}
            </span>
            <span className={`text-lg font-bold ${remaining === 0 ? 'text-green-700' : 'text-amber-700'}`}>
              {total}/{bandejaSize}
            </span>
          </div>

          {/* Pelotine toggle (salgados-tradicionais, 100 units only) */}
          {showPelotine && (
            <div>
              <p className="text-sm font-semibold text-stone-700 mb-2">Pelotine</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setWithPelotine(false)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    !withPelotine
                      ? 'border-amber-500 bg-amber-50 text-amber-800'
                      : 'border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  Sem Pelotine
                </button>
                <button
                  onClick={() => setWithPelotine(true)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    withPelotine
                      ? 'border-amber-500 bg-amber-50 text-amber-800'
                      : 'border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  Com Pelotine <span className="text-xs font-normal">({formatPrice(roundUp25(tiers[100] * 1.04))})</span>
                </button>
              </div>
            </div>
          )}

          {/* Items by subcategory */}
          {Object.entries(grouped).map(([subcat, prods]) => (
            <div key={subcat}>
              {subcat && (
                <h3 className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-3">{subcat}</h3>
              )}
              <div className="space-y-1">
                {prods.map(product => {
                  const qty = quantities[product.id] ?? 0
                  return (
                    <div key={product.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-stone-50 last:border-0">
                      <span className="text-sm text-stone-700 flex-1 leading-tight">{product.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setQty(product.id, qty - 1)}
                          disabled={qty === 0}
                          className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-amber-100 disabled:opacity-30 font-bold"
                        >−</button>
                        <input
                          type="number"
                          min={0}
                          max={bandejaSize}
                          value={qty === 0 ? '' : qty}
                          onChange={e => {
                            const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10)
                            if (!isNaN(val)) setQty(product.id, val)
                          }}
                          onBlur={e => { if (e.target.value === '') setQty(product.id, 0) }}
                          className="w-10 text-sm font-semibold text-stone-800 text-center border border-stone-200 rounded-lg py-1 focus:outline-none focus:border-amber-400"
                        />
                        <button
                          onClick={() => setQty(product.id, qty + 1)}
                          disabled={remaining === 0}
                          className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-amber-100 disabled:opacity-30 font-bold"
                        >+</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-stone-100 shrink-0">
          <button
            onClick={handleAdd}
            disabled={remaining !== 0}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-between px-2"
          >
            <span>Adicionar ao Pedido</span>
            <span>{formatPrice(tierPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
