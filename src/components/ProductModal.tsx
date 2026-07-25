'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types'
import { useCart } from '@/context/CartContext'

interface Props {
  product: Product
  categoryId: string
  categoryName: string
  onClose: () => void
}

function formatPrice(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function roundUp25(n: number) {
  return Math.ceil(n * 4) / 4
}

export default function ProductModal({ product, categoryId, categoryName, onClose }: Props) {
  const { addItem } = useCart()
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? null)
  const [selectedFilling, setSelectedFilling] = useState(product.fillings?.[0] ?? null)
  const [selectedFlavor, setSelectedFlavor] = useState(product.flavors?.[0] ?? null)
  const [selectedBulk, setSelectedBulk] = useState(product.bulkOptions?.[0] ?? null)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [withPelotine, setWithPelotine] = useState(false)

  const isSalgadoBulk = product.type === 'bulk' && categoryId.startsWith('salgados-') && categoryId !== 'salgados-lanche'
  const showPelotine = (isSalgadoBulk && selectedBulk?.quantity === 100) || product.pelotine === 'sem-com'
  const comOnlyPelotine = product.pelotine === 'com-only'

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function getUnitPrice() {
    if (product.type === 'cake') return selectedSize?.price ?? 0
    if (product.type === 'bulk') {
      const base = selectedBulk?.price ?? 0
      return showPelotine && withPelotine ? roundUp25(base * 1.04) : base
    }
    if (product.type === 'per-unit') return product.unitPrice ?? 0
    const base = product.price ?? 0
    return showPelotine && withPelotine ? roundUp25(base * 1.04) : base
  }

  function getItemTotal() {
    return getUnitPrice() * quantity
  }

  function handleAdd() {
    const filling = selectedFilling ?? undefined
    const flavor = selectedFlavor ?? undefined
    const size = selectedSize?.label ?? undefined
    const rawBulkLabel = selectedBulk?.label ?? undefined
    const bulkLabel = rawBulkLabel && showPelotine
      ? `${rawBulkLabel} • ${withPelotine ? 'com' : 'sem'} pelotine`
      : rawBulkLabel

    let name = product.name
    if (product.type === 'kit-with-cake') {
      name = `${product.name} (recheio: ${filling})`
    } else if (product.pelotine === 'sem-com') {
      name = `${product.name} (${withPelotine ? 'com' : 'sem'} pelotine)`
    }

    addItem({
      productId: product.id,
      categoryId,
      name,
      size,
      filling: product.type !== 'kit-with-cake' ? filling ?? undefined : undefined,
      flavor: flavor ?? undefined,
      bulkLabel,
      quantity,
      unitPrice: getUnitPrice(),
      notes: notes || undefined,
    })
    onClose()
  }

  const canAdd = () => {
    if (product.type === 'cake') {
      if (!selectedSize) return false
      if (product.fillings && !selectedFilling) return false
      if (product.flavors && !selectedFlavor) return false
    }
    if (product.type === 'per-unit' && (product.fillings || product.flavors)) {
      if (product.flavors && !selectedFlavor) return false
    }
    return true
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-100 px-5 py-4 flex items-start justify-between">
          <div>
            <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">{categoryName}</p>
            <h2 className="text-lg font-semibold text-stone-800">{product.name}</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-2xl leading-none ml-4">×</button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Description */}
          {product.description && (
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-sm text-stone-600 whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {/* Simple / Kit price */}
          {(product.type === 'simple' || product.type === 'kit' || product.type === 'kit-with-cake') && product.price && (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-800">{formatPrice(product.pelotine === 'sem-com' ? getUnitPrice() : product.price)}</span>
              {product.priceNote && <span className="text-sm text-stone-500">{product.priceNote}</span>}
            </div>
          )}

          {/* Cake: size picker */}
          {product.type === 'cake' && product.sizes && (
            <div>
              <p className="text-sm font-semibold text-stone-700 mb-2">Tamanho</p>
              <div className="grid grid-cols-2 gap-2">
                {product.sizes.map(s => (
                  <button
                    key={s.label}
                    onClick={() => setSelectedSize(s)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      selectedSize?.label === s.label
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <p className="text-sm font-medium text-stone-800">{s.label}</p>
                    <p className="text-xs text-stone-500">{s.slices} fatias</p>
                    <p className="text-sm font-bold text-amber-700 mt-1">{formatPrice(s.price)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cake: filling picker */}
          {(product.type === 'cake' || product.type === 'kit-with-cake') && product.fillings && (
            <div>
              <p className="text-sm font-semibold text-stone-700 mb-2">Recheio</p>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {product.fillings.map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedFilling(f)}
                    className={`w-full p-3 rounded-xl border-2 text-left text-sm transition-all ${
                      selectedFilling === f
                        ? 'border-amber-500 bg-amber-50 text-stone-800'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cake: flavor picker */}
          {product.type === 'cake' && product.flavors && (
            <div>
              <p className="text-sm font-semibold text-stone-700 mb-2">Sabor</p>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {product.flavors.map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedFlavor(f)}
                    className={`w-full p-3 rounded-xl border-2 text-left text-sm transition-all ${
                      selectedFlavor === f
                        ? 'border-amber-500 bg-amber-50 text-stone-800'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Doces Especiais: flavor picker (per-unit with flavors) */}
          {product.type === 'per-unit' && product.flavors && (
            <div>
              <p className="text-sm font-semibold text-stone-700 mb-2">Sabor</p>
              <div className="grid grid-cols-2 gap-2">
                {product.flavors.map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedFlavor(f)}
                    className={`p-3 rounded-xl border-2 text-left text-sm transition-all ${
                      selectedFlavor === f
                        ? 'border-amber-500 bg-amber-50 text-stone-800'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bulk: tier picker */}
          {product.type === 'bulk' && product.bulkOptions && (
            <div>
              <p className="text-sm font-semibold text-stone-700 mb-2">Quantidade</p>
              <div className="space-y-2">
                {product.bulkOptions.map(o => (
                  <button
                    key={o.label}
                    onClick={() => { setSelectedBulk(o); setQuantity(1) }}
                    className={`w-full p-3 rounded-xl border-2 flex items-center justify-between transition-all ${
                      selectedBulk?.label === o.label
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span className="text-sm font-medium text-stone-800">{o.label}</span>
                    <div className="text-right">
                      {isSalgadoBulk && o.quantity !== 100 && (
                        <p className="text-xs text-stone-400">com pelotine</p>
                      )}
                      <span className="text-sm font-bold text-amber-700">
                        {formatPrice(isSalgadoBulk && o.quantity === 100 && withPelotine ? roundUp25(o.price * 1.04) : o.price)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pelotine — com only (no choice) */}
          {comOnlyPelotine && (
            <div>
              <p className="text-sm font-semibold text-stone-700 mb-2">Pelotine (coperinha)</p>
              <div className="p-3 rounded-xl border-2 border-amber-500 bg-amber-50 text-sm font-medium text-amber-800">
                Este kit já vem com pelotine — única opção disponível
              </div>
            </div>
          )}

          {/* Pelotine toggle */}
          {showPelotine && (
            <div>
              <p className="text-sm font-semibold text-stone-700 mb-2">Pelotine (coperinha)</p>
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
                  Com Pelotine
                </button>
              </div>
            </div>
          )}

          {/* Per-unit price */}
          {product.type === 'per-unit' && !product.flavors && (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-800">{formatPrice(product.unitPrice ?? 0)}</span>
              <span className="text-sm text-stone-500">por unidade</span>
            </div>
          )}
          {product.type === 'per-unit' && product.flavors && (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-800">{formatPrice(product.unitPrice ?? 0)}</span>
              <span className="text-sm text-stone-500">por unidade</span>
            </div>
          )}

          {/* Quantity stepper (for non-bulk simple/kit/per-unit/cake) */}
          {product.type !== 'bulk' && (
            <div>
              <p className="text-sm font-semibold text-stone-700 mb-2">
                {product.type === 'per-unit' ? 'Quantas unidades?' : 'Quantidade'}
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-full border-2 border-stone-200 flex items-center justify-center text-stone-600 hover:border-amber-400 hover:bg-amber-50 text-xl"
                >−</button>
                <span className="text-xl font-semibold text-stone-800 w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 rounded-full border-2 border-stone-200 flex items-center justify-center text-stone-600 hover:border-amber-400 hover:bg-amber-50 text-xl"
                >+</button>
              </div>
            </div>
          )}


          {/* Bulk: units */}
          {product.type === 'bulk' && selectedBulk && selectedBulk.quantity === 1 && (
            <div>
              <p className="text-sm font-semibold text-stone-700 mb-2">Quantas unidades?</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-full border-2 border-stone-200 flex items-center justify-center text-stone-600 hover:border-amber-400 hover:bg-amber-50 text-xl"
                >−</button>
                <span className="text-xl font-semibold text-stone-800 w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 rounded-full border-2 border-stone-200 flex items-center justify-center text-stone-600 hover:border-amber-400 hover:bg-amber-50 text-xl"
                >+</button>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <p className="text-sm font-semibold text-stone-700 mb-2">
              {product.type === 'bulk' && selectedBulk && selectedBulk.quantity > 1
                ? 'Composição do lote (opcional)'
                : 'Observações (opcional)'}
            </p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={
                product.type === 'bulk' && selectedBulk && selectedBulk.quantity > 1
                  ? `Ex: 40 coxinha, 10 risoles de frango...`
                  : 'Ex: sem glúten, alergia a nozes...'
              }
              rows={2}
              className="w-full rounded-xl border-2 border-stone-200 p-3 text-sm text-stone-700 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-stone-100 px-5 py-4">
          <button
            onClick={handleAdd}
            disabled={!canAdd()}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl flex items-center justify-between px-5 transition-colors"
          >
            <span>Adicionar ao pedido</span>
            <span>{formatPrice(getItemTotal())}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
