@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This is a custom ordering website for **Confeitaria Nedel** — a bakery in Porto Alegre, RS, Brazil (client project, girlfriend's mom's business). The existing WhatsApp Business catalog had a broken UX where "Add to Cart" added an entire category instead of a specific item with no way to pick size, filling, or flavor.

**The solution:** A mobile-first web app where customers browse the full menu, configure each item (size, filling, flavor, bulk quantity), add to cart, fill in their info, and tap one button to send the complete pre-filled order to the business WhatsApp.

All UI text is in **Portuguese**. Prices are in **BRL (R$)**.

**Business WhatsApp:** +55 51 997508060
**PIX key:** 51997508060

## Commands

```bash
npm run dev      # dev server at localhost:3000
npm run build    # production build
npx tsc --noEmit # type check (no test suite yet)
npm run lint     # eslint
```

## Architecture

**Data flow:** `src/data/menu.ts` → `src/app/page.tsx` (catalog) → `ProductModal` (item configuration) → `CartContext` (state) → `CartSidebar` → `src/app/checkout/page.tsx` → WhatsApp `wa.me` link with pre-filled message.

No backend. No database. No external payment API. Everything is client-side; checkout generates a formatted WhatsApp message the customer sends manually.

### Key files

- **`src/data/menu.ts`** — The entire menu as typed data. Single source of truth for all products, prices, sizes, fillings, flavors, and bulk tiers. Edit here to change the menu.
- **`src/types/index.ts`** — `ProductType` union drives which UI the modal renders.
- **`src/context/CartContext.tsx`** — Cart state (items, total, sidebar open/close). Wraps the whole app via `layout.tsx`.
- **`src/components/ProductModal.tsx`** — Most complex component. Renders different UIs based on `product.type`: size grid → filling/flavor list → qty stepper → bulk tier picker.
- **`src/app/checkout/page.tsx`** — Checkout form + `buildWhatsAppMessage()` which formats the full order into a pre-filled `wa.me` URL.

### Product types and modal UX

| Type | Modal shows |
|------|-------------|
| `simple` | Price + qty stepper |
| `kit` | Description + price (fixed combo, no choices) |
| `kit-with-cake` | Description + filling picker (kit includes a mini cake) |
| `cake` | Size grid (price per size) + filling OR flavor list |
| `bulk` | Tier selector (per unit / 50un / 100un) + lot qty stepper |
| `per-unit` | Unit price + qty stepper; `product.flavors` adds flavor picker |

### Menu categories (14 total in `src/data/menu.ts`)

- **Kits** — fixed combos (Kit 1, Kit 2, Kit Vegetariano, Kit 1/2 com Torta)
- **Tortas Tradicionais** — 8 sizes × 16 recheios
- **Tortas Especiais** — 8 sizes × 6 sabores (pricier tier)
- **Tortas Sobremesa** — 3 sizes × 7 sabores (cheesecake, banoffe, red velvet, etc.)
- **Torta Fria** — R$85/unit
- **Quiches** — 4 flavors, R$70 (15 fatias)
- **Salgados Tradicionais** — ~20 items, Assados/Fritos subcategories, bulk pricing
- **Salgados Especiais** — mini pizzas, kibes, empadinhas francesas, bulk pricing
- **Salgados Diferenciados** — canapés, mini croissants, pastéis suíços, bulk pricing
- **Salgados Lanche** — per-unit lanche items
- **Doces Gourmet** — 5 flavors, R$2,50/unit
- **Doces Tradicionais** — brigadeiro, branquinho, etc., bulk pricing
- **Doces Especiais** — panelinhas, mini trufas, brownies, R$3/unit with flavor picker
- **Bolos Caseiros Especiais** — R$34,90 / 10 fatias
- **Bolos Tradicionais** — R$29,90 / 10 fatias

### Payment options (client-side only, no processor)

1. **PIX** — shows PIX key `51997508060`; customer pays and sends proof via WhatsApp
2. **Cartão na Retirada** — card at store pickup
3. **Cartão na Entrega** — card to delivery driver

### Deployment

Vercel MCP configured at user level (`~/.claude-jonas/.claude.json`, transport: HTTP, URL: `https://mcp.vercel.com`). Use `/mcp` to connect, then deploy via MCP tools. Fallback: `npx vercel --yes`.

## What's not built yet

- Real PIX payment processing (just shows the key today)
- Order management dashboard for the business owner
- Delivery fee calculation
- Product photos
