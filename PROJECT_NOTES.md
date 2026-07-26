# Project Notes — Nedel Confeitaria

## Overview

Custom ordering site for Confeitaria Nedel (Porto Alegre, RS, Brazil). Customers browse the menu, configure items, add to cart, fill in their info, and tap one button to send a pre-filled WhatsApp message to the bakery. No backend, no database, no payment processing (PIX is manual — customer sends proof via WhatsApp).

**Business WhatsApp:** +55 51 997508060  
**PIX key:** 51997508060 (phone number)  
**Live site:** nedel-confeitaria-pedidos.vercel.app

---

## Architecture

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Vercel

**Data flow:**
```
src/data/menu.ts
  → src/app/page.tsx (catalog + category tabs)
    → ProductModal or BandejaModal (item configuration)
      → CartContext (in-memory + localStorage)
        → CartSidebar (review)
          → src/app/checkout/page.tsx
            → buildWhatsAppMessage() → wa.me URL
```

Everything is client-side. There are no API routes, no server actions, no database calls. The entire menu lives in `src/data/menu.ts`.

---

## Product Types

Six product types defined in `src/types/index.ts`. The `type` field on each product drives which UI the modal renders.

| Type | Modal shows | Example |
|------|-------------|---------|
| `simple` | Price + qty stepper | Torta Fria, Quiches, Bolos |
| `kit` | Description + fixed price + qty stepper | Kit Salgado 1, 2, 3, Vegetariano |
| `kit-with-cake` | Description + filling picker + price | Kit Torta 1, Kit Torta 2 |
| `cake` | Grouped size grid + optional filling/flavor picker | All Tortas |
| `bulk` | Tier selector (per unit / 50un / 100un) + optional qty stepper + optional pelotine toggle | All Salgados bulk, Doces Tradicionais |
| `per-unit` | Unit price + qty stepper + optional flavor picker | Doces Especiais, Salgados Lanche, Salgados Especiais (Especialidades) |

### `cake` — size picker detail
When product has `sizes` with a `group` field, the modal renders a grouped picker labeled **"Tipo e Tamanho"** with sections for each group (Torta Redonda, Torta Retangular (Chapinha), Torta Quadrada). Without groups (Tortas Sobremesa), it renders a plain 2-column grid.

The size stored in the cart includes the group name when present: `"Torta Quadrada · Pequena"` — not just `"Pequena"` — to avoid ambiguity in the WhatsApp message.

### `bulk` — quantity stepper logic
- If the selected tier has `quantity === 1` (Por unidade), a qty stepper appears so the customer can pick how many individual units they want.
- If the selected tier has `quantity > 1` (50un or 100un), no stepper — they're buying one lot. The notes textarea label changes to **"Composição do lote"** as a prompt for composition details.
- Switching tiers resets quantity to 1.

---

## Cart Items

Each item added to the cart (`CartItem` type) has these fields:

| Field | Set by | Shows in WhatsApp |
|-------|--------|-------------------|
| `name` | Product name (sometimes modified to embed filling/pelotine) | Yes — item header |
| `size` | Selected size label (+ group for grouped cakes) | Yes — as detail line |
| `filling` | Selected filling (not set for `kit-with-cake`, embedded in name instead) | Yes |
| `flavor` | Selected flavor | Yes |
| `bulkLabel` | Tier label + optional pelotine suffix | Yes |
| `quantity` | Number of units / lots | Yes — `Nx R$X = R$Y` |
| `unitPrice` | Price per unit/lot (adjusted for pelotine if applicable) | Yes |
| `notes` | Free-text from the textarea | Yes — with 📝 prefix |
| `breakdown` | `[{ name, quantity }]` array from BandejaModal | Yes — each line indented |

---

## WhatsApp Message Format

`buildWhatsAppMessage()` in `src/app/checkout/page.tsx` builds the message string. Structure:

```
🎂 *Pedido - Confeitaria Nedel*

👤 *Nome:* [name]
📞 *Telefone:* [phone]
🏪 *Retirada no local*  OR  🚚 *Entrega:* [address]
💳 *Pagamento:* [method]
⏰ *Data/Horário preferido:* [date + time]  (only if filled)

*── ITENS DO PEDIDO ──*

• [item name]
  ↳ [size · filling · flavor · bulkLabel]
  ↳ [breakdown lines if BandejaModal item]
  ↳ Nx R$X,XX = R$Y,YY
  📝 [notes if any]

*TOTAL: R$X,XX*

_Chave PIX: 51997508060_  (only if PIX selected)
_Favor enviar comprovante após o pagamento._

📝 *Observações:* [general notes]  (only if filled)
```

Items with no size/filling/flavor/bulkLabel use the compact format: `• [name] — Nx R$X = R$Y`

---

## Montar Sua Caixa (BandejaModal)

A multi-item bulk builder shown as a banner at the top of eligible categories. Available for: Salgados Tradicionais, Salgados Especiais, Salgados Diferenciados, Doces Tradicionais.

**How it works:**
1. Customer picks box size: 50 or 100 units
2. A progress counter tracks total across all item steppers — you can't exceed the chosen size
3. Customer distributes units across products using `−` / `+` buttons or typing directly
4. "Adicionar ao Pedido" is disabled until the box is exactly full
5. The cart item stores: `name = "Caixa de [Category]"`, `bulkLabel = "100 unidades • sem pelotine"`, `breakdown = [{ name, quantity }]`

**Pelotine in BandejaModal:**
- Only shown for **Salgados Tradicionais at 100 unidades** (matches the same rule as the individual product modal)
- Switches between Sem Pelotine (R$120) and Com Pelotine (R$125 — 4% surcharge rounded up to nearest R$0,25)
- Switching to 50 units hides the toggle and resets to sem pelotine

**Tier prices per category:**
| Category | Per unit | 50un | 100un |
|----------|----------|------|-------|
| Salgados Tradicionais | R$1,35 | R$67,50 | R$120 (sem) / R$125 (com) |
| Salgados Especiais | R$1,50 | R$75,00 | R$135,00 |
| Salgados Diferenciados | R$1,90 | R$95,00 | R$160,00 |
| Doces Tradicionais | R$1,50 | R$75,00 | R$120,00 |

---

## Pelotine Rules

Pelotine is a chocolate coating applied to salgados and doces. The `pelotine` field on a product controls behavior:

| `pelotine` value | Behavior |
|-----------------|----------|
| `undefined` | Pelotine toggle shown only for salgados bulk at 100 units (Salgados Tradicionais). Price: +4% rounded up to nearest R$0,25. |
| `'sem-com'` | Toggle always shown regardless of quantity or type. Used on Kit Torta 2 and individual Kit Salgados 1/2/3. |
| `'com-only'` | Always com pelotine — no toggle. Price shown is already the com pelotine price. |

**Category-level pelotine:**
- **Salgados Tradicionais:** sem/com toggle at 100un only
- **Salgados Especiais:** all items `com-only`
- **Salgados Diferenciados:** all items `com-only`
- **Doces Tradicionais:** all items `com-only`
- **Kits 1/2/3:** `sem-com` toggle (sem = R$120, com = R$125)
- **Kit Vegetariano:** `com-only` (always R$138,75)
- **Kit Torta 1:** `com-only` (always R$162,50)
- **Kit Torta 2:** `sem-com` (sem = R$300, com = R$305)

---

## Checkout Form

Fields collected at checkout:

| Field | Required | Notes |
|-------|----------|-------|
| Nome completo | Yes | |
| WhatsApp | Yes | |
| Data preferida | No | Date input |
| Horário preferido | No | Time input, stacked below date on mobile |
| Retirada / Entrega | Yes | If Entrega, address is required |
| Endereço | If entrega | Free text |
| Forma de pagamento | Yes | PIX / Cartão na Retirada / Cartão na Entrega |
| Observações gerais | No | Appended at end of message |

"Confirmar Pedido" button is disabled until name + phone are filled and (if entrega) address is filled. Tapping it builds the WhatsApp URL and shows a confirmation screen with a green "Enviar pelo WhatsApp" button. Tapping that opens WhatsApp, clears the cart, and redirects to the catalog after 1 second.

---

## Deployment

**Vercel project:** nedel-confeitaria-pedidos  
**GitHub repo:** natividadconsulting/nedel_confeitaria  
**Deploy:** Push to `main` → Vercel auto-builds. No CLI needed.  
**Vercel CLI:** Not installed locally. Use MCP tools (`mcp__vercel__*`) for deployment inspection.

**Vercel Analytics:** Enabled. `@vercel/analytics` installed, `<Analytics />` added to `layout.tsx`. Data appears in the Vercel dashboard → Analytics tab.

**Vercel Hobby Plan note:** All pages are fully static (no serverless functions). The only limit at risk is 100 GB bandwidth/month. When product photos are added: compress to <100 KB each, consider Cloudflare CDN to avoid hitting bandwidth cap.

---

## UI / Terminology Decisions

- **"Recheio" vs "Sabor":** Tortas Tradicionais and Tortas Especiais use **Sabor** as the picker label (products have `flavors` field, not `fillings`). The flavor IS the product — no generic "Torta Tradicional" with a filling picker.
- **Tortas Tradicionais & Especiais structure:** Each torta/sabor is its own top-level product card. Clicking opens a grouped size picker. 18 cards for Tradicionais, 8 for Especiais.
- **Tortas Sobremesa:** Each dessert type is its own card (Cheesecake, Pudim, etc.). All share 3 sizes (Mini/Pequena/Média). Cheesecake has a flavor picker (Ninho, Nutella, Doce de Leite).
- **Pelotine label:** Just "Pelotine" — no "(coperinha)" clarification.
- **Bandeja → Caixa:** User-facing text uses "Caixa" and "Montar Sua Caixa". Internal component is still named `BandejaModal`.

---

## Menu Data Confirmations

### Tortas Tradicionais — No filling picker
Each torta is its own product (Torta da Casa, Torta Delicata, etc.). There is no generic "Torta Tradicional" with a list of 16 recheios to pick from. CLAUDE.md's mention of "16 recheios" referred to the WhatsApp catalog, not the app structure.

### Stikadinho com Morango — Tortas Especiais
Confirmed via product photos: belongs in Tortas Especiais.

### Cachorrinho de Nata vs Cachorrinho de Massinha
Both exist as separate items in Salgados Tradicionais. "Cachorrinho de Meta" was a typo — correct name is **Cachorrinho de Nata**.

### Mini Cachorro Quente & Mini Hambúrguer
Belong in **Salgados Especiais** under "Especialidades" subcategory, per-unit only. Not in Salgados Lanche.

### Risoles Pricing
All Risoles use standard Salgados Tradicionais pricing (R$1,35/un · R$67,50/50un · R$120/100un). A separate RISOLES_BULK at R$1,25 was incorrect and removed.

### Salgados Tradicionais — Fritos Order
Confirmed order: Risoles de Presunto e Queijo → Enroladinho de Salsicha → Bolinha de Queijo → Croquete de Frango com Requeijão → Croquete de Carne com Requeijão.

### Bolos category order
Bolos Tradicionais appears before Bolos Caseiros Especiais in the category tabs (ascending price: R$29,90 → R$34,90).

### Bolos Tradicionais
Seven items: Cenoura, Chocolate, Milho com Goiabada, Português de Creme, Português de Nozes, Laranja, Limão. All R$29,90 / 10 fatias. Bolo de Limão confirmed by Thaisa (2026-07-26).

### Bolos Caseiros Especiais
Four items: Ninho, Oreo, Paçoquinha, Churros. All R$34,90 / 10 fatias.

### Doces — No bulk pricing
Doces Gourmet and Doces Especiais do not have 50un/100un bulk pricing. They are sold per unit only.

---

## Kit Compositions

### Kit Torta 1 — Filling Options
Fillings: Branquinho e Brigadeiro, Marta Rocha.

### Kit Torta 1 — Salgado Breakdown
10 Empadinha Folhada · 10 Cachorrinho Folhado · 10 Pastel de Calabresa · 10 Risoles de Frango · 10 Risoles de Carne (50 total). Only comes **com pelotine**.

### Kit Torta 2 — Salgado Breakdown
20 Empadinha Folhada · 20 Cachorrinho Folhado · 20 Pastel de Calabresa · 20 Risoles de Frango · 20 Risoles de Carne (100 total). Sem or com pelotine.

---

## Pricing Confirmations

| Item | Price |
|------|-------|
| Kit Salgado 1 / 2 / 3 — sem pelotine | R$120,00 (100 un) |
| Kit Salgado 1 / 2 / 3 — com pelotine | R$125,00 (100 un) |
| Kit Salgado Vegetariano — com pelotine | R$138,75 (100 un) |
| Kit Torta 1 — com pelotine | R$162,50 |
| Kit Torta 2 — sem pelotine | R$300,00 |
| Kit Torta 2 — com pelotine | R$305,00 |
| Salgados Lanche (all except pizza) | R$12,00/un |
| Pizza Brotinho | R$15,00/un |
| Doces Gourmet | R$2,50/un |
| Doces Especiais (panelinhas, trufas, etc.) | R$3,00/un |
| Mini Cupcake | R$4,50/un |
| Mini Quindim | R$2,00/un |
| Bolos Tradicionais (all 7) | R$29,90 / 10 fatias |
| Bolos Caseiros Especiais (all 4) | R$34,90 / 10 fatias |
| Quiches | R$70,00 / 15 fatias |
| Torta Fria (all flavors) | R$85,00/un |

---

## QA Status

Sections reviewed and confirmed accurate as of 2026-07-25:

- ✅ Kits
- ✅ Tortas Tradicionais
- ⬜ Tortas Especiais
- ✅ Tortas Sobremesa
- ✅ Torta Fria
- ✅ Quiches
- ✅ Salgados Tradicionais
- ✅ Salgados Especiais
- ✅ Salgados Diferenciados
- ✅ Salgados Lanche
- ✅ Doces Tradicionais
- ✅ Doces Gourmet
- ✅ Doces Especiais
- ✅ Bolos Caseiros Especiais
- ✅ Bolos Tradicionais

---

## What's Not Built

- Real payment processing (PIX is manual; card options are face-to-face)
- Order management dashboard for Roseli
- Delivery fee calculation
- Product photos (bandwidth note: compress to <100 KB when added)
- WhatsApp Business API for server-side order notifications (orders still sent by the customer manually)
