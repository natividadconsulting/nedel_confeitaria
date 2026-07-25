'use client'

import { useState } from 'react'
import { categories } from '@/data/menu'
import { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import ProductModal from '@/components/ProductModal'
import CartSidebar from '@/components/CartSidebar'
import BandejaModal from '@/components/BandejaModal'

function formatPrice(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getDisplayPrice(product: Product): string {
  if (product.price) return formatPrice(product.price)
  if (product.unitPrice) return `${formatPrice(product.unitPrice)}/un`
  if (product.sizes) return `a partir de ${formatPrice(product.sizes[0].price)}`
  if (product.bulkOptions) return `a partir de ${formatPrice(product.bulkOptions[0].price)}`
  return ''
}

export default function Home() {
  const { itemCount, total, setIsOpen } = useCart()
  const [activeCategory, setActiveCategory] = useState(categories[0].id)
  const [selectedProduct, setSelectedProduct] = useState<{ product: Product; categoryId: string; categoryName: string } | null>(null)
  const [showBandeja, setShowBandeja] = useState(false)

  const activeCat = categories.find(c => c.id === activeCategory)!

  const grouped = activeCat.products.reduce<Record<string, Product[]>>((acc, p) => {
    const key = p.subcategory ?? ''
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FDF8F0] border-b border-amber-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-amber-900 leading-tight">Confeitaria Nedel</h1>
            <p className="text-xs text-stone-500">Excelência em Sabores</p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            <span>🛒</span>
            {itemCount > 0 ? (
              <>
                <span>{formatPrice(total)}</span>
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              </>
            ) : (
              <span>Pedido</span>
            )}
          </button>
        </div>

        {/* Category tabs */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1.5 px-4 pb-3 min-w-max">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white text-stone-600 hover:bg-amber-50 border border-stone-200'
                }`}
              >
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Category header */}
      <div className="max-w-2xl mx-auto px-4 pt-5 pb-2">
        <h2 className="text-2xl font-bold text-stone-800">{activeCat.emoji} {activeCat.name}</h2>
        {activeCat.description && (
          <p className="text-sm text-stone-500 mt-0.5">{activeCat.description}</p>
        )}
      </div>

      {/* Products */}
      <main className="max-w-2xl mx-auto px-4 pb-28 space-y-6 mt-2">
        {/* Bandeja banner for Salgados Tradicionais */}
        {activeCat.id === 'salgados-tradicionais' && (
          <button
            onClick={() => setShowBandeja(true)}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-2xl p-4 text-left transition-colors"
          >
            <p className="font-bold text-base">🥟 Montar Bandeja</p>
            <p className="text-sm text-amber-100 mt-0.5">Mix de salgados à sua escolha — 50un ou 100un</p>
            <div className="flex gap-4 mt-2 text-xs text-amber-200">
              <span>50un · R$67,50</span>
              <span>100un · R$120,00</span>
            </div>
          </button>
        )}

        {Object.entries(grouped).map(([subcat, products]) => (
          <div key={subcat}>
            {subcat && (
              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-3 mt-2">{subcat}</h3>
            )}
            <div className="space-y-2">
              {products.map(product => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct({ product, categoryId: activeCat.id, categoryName: activeCat.name })}
                  className="w-full bg-white rounded-2xl p-4 flex items-center justify-between gap-3 hover:shadow-md hover:border-amber-200 border border-stone-100 transition-all text-left active:scale-[0.99]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800 leading-tight">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">
                        {product.description.split('\n')[0]}
                      </p>
                    )}
                    {product.sizes && (
                      <p className="text-xs text-stone-400 mt-1">{product.sizes.length} tamanhos disponíveis</p>
                    )}
                    {product.bulkOptions && (
                      <p className="text-xs text-stone-400 mt-1">unidade · 50un · 100un</p>
                    )}
                    {product.type === 'per-unit' && product.flavors && (
                      <p className="text-xs text-stone-400 mt-1">{product.flavors.length} sabores</p>
                    )}
                    {product.fillings && product.type === 'cake' && (
                      <p className="text-xs text-stone-400 mt-1">{product.fillings.length} recheios</p>
                    )}
                    {product.flavors && product.type === 'cake' && (
                      <p className="text-xs text-stone-400 mt-1">{product.flavors.length} sabores</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-amber-700">{getDisplayPrice(product)}</p>
                    <span className="inline-block mt-1.5 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                      Adicionar
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </main>

      {/* Floating cart CTA */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#FDF8F0] via-[#FDF8F0]/80 to-transparent pointer-events-none z-20">
          <button
            onClick={() => setIsOpen(true)}
            className="pointer-events-auto w-full max-w-2xl mx-auto flex bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 rounded-2xl shadow-lg items-center justify-between px-5 transition-colors"
          >
            <span className="bg-amber-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">{itemCount}</span>
            <span>Ver Pedido</span>
            <span className="font-bold">{formatPrice(total)}</span>
          </button>
        </div>
      )}

      {showBandeja && (
        <BandejaModal
          products={activeCat.products}
          onClose={() => setShowBandeja(false)}
        />
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct.product}
          categoryId={selectedProduct.categoryId}
          categoryName={selectedProduct.categoryName}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <CartSidebar />
    </div>
  )
}
