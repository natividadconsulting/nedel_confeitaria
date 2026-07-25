export type ProductType =
  | 'kit'
  | 'kit-with-cake'
  | 'cake'
  | 'bulk'
  | 'per-unit'
  | 'simple'

export interface SizeOption {
  label: string
  slices: number
  price: number
}

export interface BulkOption {
  label: string
  quantity: number
  price: number
}

export interface Product {
  id: string
  name: string
  description?: string
  type: ProductType
  price?: number
  priceNote?: string
  sizes?: SizeOption[]
  fillings?: string[]
  flavors?: string[]
  subcategory?: string
  bulkOptions?: BulkOption[]
  unitPrice?: number
  items?: string[]
  pelotine?: 'sem-com' | 'com-only'
}

export interface Category {
  id: string
  name: string
  emoji: string
  description?: string
  products: Product[]
}

export interface CartItem {
  cartId: string
  productId: string
  categoryId: string
  name: string
  size?: string
  filling?: string
  flavor?: string
  bulkLabel?: string
  quantity: number
  unitPrice: number
  notes?: string
}

export interface CheckoutData {
  name: string
  phone: string
  deliveryType: 'retirada' | 'entrega'
  address?: string
  paymentMethod: 'pix' | 'cartao-retirada' | 'cartao-entrega'
  notes?: string
  preferredTime?: string
}
