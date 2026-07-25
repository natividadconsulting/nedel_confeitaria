'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { CheckoutData } from '@/types'

const WHATSAPP_NUMBER = '5551997508060'
const PIX_KEY = '51997508060'

function formatPrice(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function itemLabel(item: ReturnType<typeof useCart>['items'][0]) {
  const parts: string[] = []
  if (item.size) parts.push(item.size)
  if (item.filling) parts.push(item.filling.split('—')[0].trim())
  if (item.flavor) parts.push(item.flavor.split('—')[0].trim())
  if (item.bulkLabel) parts.push(item.bulkLabel)
  return parts.filter(Boolean).join(' · ')
}

function buildWhatsAppMessage(items: ReturnType<typeof useCart>['items'], total: number, data: CheckoutData): string {
  const lines: string[] = [
    '🎂 *Pedido - Confeitaria Nedel*',
    '',
    `👤 *Nome:* ${data.name}`,
    `📞 *Telefone:* ${data.phone}`,
  ]

  if (data.deliveryType === 'entrega') {
    lines.push(`🚚 *Entrega:* ${data.address}`)
  } else {
    lines.push(`🏪 *Retirada no local*`)
  }

  const paymentLabels = {
    'pix': '💸 PIX (antecipado)',
    'cartao-retirada': '💳 Cartão na Retirada',
    'cartao-entrega': '💳 Cartão na Entrega',
  }
  lines.push(`💳 *Pagamento:* ${paymentLabels[data.paymentMethod]}`)

  if (data.preferredTime) {
    lines.push(`⏰ *Horário preferido:* ${data.preferredTime}`)
  }

  lines.push('', '*── ITENS DO PEDIDO ──*', '')

  items.forEach(item => {
    const detail = itemLabel(item)
    const lineTotal = formatPrice(item.unitPrice * item.quantity)
    if (detail) {
      lines.push(`• ${item.name}`)
      lines.push(`  ↳ ${detail}`)
      lines.push(`  ↳ ${item.quantity}x ${formatPrice(item.unitPrice)} = ${lineTotal}`)
    } else {
      lines.push(`• ${item.name} — ${item.quantity}x ${formatPrice(item.unitPrice)} = ${lineTotal}`)
    }
    if (item.notes) lines.push(`  📝 ${item.notes}`)
    lines.push('')
  })

  lines.push(`*TOTAL: ${formatPrice(total)}*`)

  if (data.paymentMethod === 'pix') {
    lines.push('', `_Chave PIX: ${PIX_KEY}_`)
    lines.push('_Favor enviar comprovante após o pagamento._')
  }

  if (data.notes) {
    lines.push('', `📝 *Observações:* ${data.notes}`)
  }

  return lines.join('\n')
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()

  const [form, setForm] = useState<CheckoutData>({
    name: '',
    phone: '',
    deliveryType: 'retirada',
    address: '',
    paymentMethod: 'pix',
    notes: '',
    preferredTime: '',
  })
  const [order, setOrder] = useState<{ waUrl: string; total: number } | null>(null)

  if (items.length === 0 && !order) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex flex-col items-center justify-center p-8 text-center">
        <span className="text-6xl mb-4">🛒</span>
        <h2 className="text-xl font-bold text-stone-800 mb-2">Nenhum item no pedido</h2>
        <p className="text-stone-500 mb-6">Adicione itens antes de finalizar.</p>
        <button onClick={() => router.push('/')} className="bg-amber-600 text-white px-6 py-3 rounded-xl font-medium">
          Voltar ao Cardápio
        </button>
      </div>
    )
  }

  if (order) {

    return (
      <div className="min-h-screen bg-[#FDF8F0] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-sm w-full">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Pedido pronto!</h2>
          <p className="text-stone-600 mb-2">
            Clique no botão abaixo para enviar seu pedido direto para o WhatsApp da Confeitaria Nedel.
          </p>
          <p className="text-xs text-stone-400 mb-6">
            Seu pedido já estará digitado — é só apertar Enviar.
          </p>

          <a
            href={order.waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { clearCart(); setTimeout(() => router.push('/'), 1000) }}
            className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-5 rounded-2xl text-lg transition-colors shadow-lg"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Enviar Pedido pelo WhatsApp
          </a>

          <p className="text-xs text-stone-400 mt-4">
            Total: <strong className="text-stone-600">{formatPrice(order.total)}</strong>
            {form.paymentMethod === 'pix' && <> · Chave PIX: <strong>{PIX_KEY}</strong></>}
          </p>
        </div>
      </div>
    )
  }

  const isValid = form.name.trim() && form.phone.trim() && (form.deliveryType === 'retirada' || form.address?.trim())

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <header className="sticky top-0 z-10 bg-[#FDF8F0] border-b border-amber-100 shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-stone-500 hover:text-stone-700 text-2xl leading-none">←</button>
          <h1 className="text-lg font-bold text-stone-800">Finalizar Pedido</h1>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-5 space-y-5 pb-32">
        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
            <h2 className="font-semibold text-stone-800">Resumo do Pedido</h2>
          </div>
          <div className="divide-y divide-stone-50">
            {items.map(item => (
              <div key={item.cartId} className="px-4 py-3 flex justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800">{item.name}</p>
                  {itemLabel(item) && (
                    <p className="text-xs text-stone-500 mt-0.5">{itemLabel(item)}</p>
                  )}
                  {item.notes && <p className="text-xs text-amber-600 mt-0.5 italic">{item.notes}</p>}
                  <p className="text-xs text-stone-400 mt-0.5">{item.quantity}x {formatPrice(item.unitPrice)}</p>
                </div>
                <p className="text-sm font-semibold text-amber-800 shrink-0">{formatPrice(item.unitPrice * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-stone-100 flex justify-between items-center bg-stone-50">
            <span className="font-semibold text-stone-700">Total</span>
            <span className="text-xl font-bold text-amber-800">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Customer info */}
        <div className="bg-white rounded-2xl border border-stone-100 p-4 space-y-4">
          <h2 className="font-semibold text-stone-800">Seus Dados</h2>

          <div>
            <label className="text-sm font-medium text-stone-600 block mb-1">Nome completo *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Seu nome"
              className="w-full border-2 border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-stone-600 block mb-1">WhatsApp *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="(51) 99999-9999"
              className="w-full border-2 border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-stone-600 block mb-1">Horário preferido</label>
            <input
              type="text"
              value={form.preferredTime}
              onChange={e => setForm(f => ({ ...f, preferredTime: e.target.value }))}
              placeholder="Ex: sábado às 18h"
              className="w-full border-2 border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Delivery type */}
        <div className="bg-white rounded-2xl border border-stone-100 p-4 space-y-3">
          <h2 className="font-semibold text-stone-800">Retirada ou Entrega?</h2>
          <div className="grid grid-cols-2 gap-2">
            {(['retirada', 'entrega'] as const).map(type => (
              <button
                key={type}
                onClick={() => setForm(f => ({ ...f, deliveryType: type }))}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  form.deliveryType === type
                    ? 'border-amber-500 bg-amber-50 text-amber-800'
                    : 'border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                {type === 'retirada' ? '🏪 Retirar no local' : '🚚 Entrega em casa'}
              </button>
            ))}
          </div>

          {form.deliveryType === 'entrega' && (
            <div>
              <label className="text-sm font-medium text-stone-600 block mb-1">Endereço de entrega *</label>
              <textarea
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Rua, número, bairro, complemento..."
                rows={2}
                className="w-full border-2 border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
          )}
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-2xl border border-stone-100 p-4 space-y-3">
          <h2 className="font-semibold text-stone-800">Forma de Pagamento</h2>
          <div className="space-y-2">
            {[
              { value: 'pix', label: '💸 PIX (pagar agora)', desc: `Chave PIX: ${PIX_KEY}` },
              { value: 'cartao-retirada', label: '💳 Cartão na Retirada', desc: 'Pague ao buscar o pedido' },
              { value: 'cartao-entrega', label: '💳 Cartão na Entrega', desc: 'Pague ao receber em casa' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setForm(f => ({ ...f, paymentMethod: opt.value as CheckoutData['paymentMethod'] }))}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                  form.paymentMethod === opt.value
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <p className="text-sm font-semibold text-stone-800">{opt.label}</p>
                <p className="text-xs text-stone-500 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>

          {form.paymentMethod === 'pix' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800">
              <p className="font-semibold mb-1">Chave PIX (Telefone)</p>
              <p className="font-mono text-lg font-bold tracking-wide">{PIX_KEY}</p>
              <p className="text-xs text-green-600 mt-1">Envie o comprovante junto com seu pedido no WhatsApp.</p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-stone-100 p-4">
          <label className="text-sm font-semibold text-stone-800 block mb-2">Observações gerais (opcional)</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Alguma observação para o pedido?"
            rows={2}
            className="w-full border-2 border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 resize-none"
          />
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FDF8F0] border-t border-amber-100">
        <div className="max-w-xl mx-auto">
          <button
            onClick={() => {
                console.log('CHECKOUT DEBUG items:', JSON.stringify(items), 'total:', total)
                const msg = buildWhatsAppMessage(items, total, form)
                setOrder({ waUrl: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, total })
              }}
            disabled={!isValid}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-base transition-colors flex items-center justify-between px-5"
          >
            <span>Confirmar Pedido</span>
            <span>{formatPrice(total)}</span>
          </button>
          {!isValid && (
            <p className="text-xs text-center text-stone-400 mt-2">Preencha seu nome e telefone para continuar</p>
          )}
        </div>
      </div>
    </div>
  )
}
