# Action Items — Nedel Confeitaria

## Menu Data

### Doces Gourmet e Doces Especiais — Bulk pricing
Confirm 50-unit and 100-unit prices with Roseli for both Doces Gourmet and Doces Especiais. Once confirmed, add bulk options and "Montar Sua Caixa" to these two categories.

## Features

### Salgados Tradicionais — Mix & Match bulk pricing
Customers can mix types within Salgados Tradicionais and still hit the 50 or 100 unit bulk price tiers. E.g. 20 Empadinha + 20 Cachorrinho + 20 Risoles de Frango + 20 Risoles de Carne + 20 Pastel = 100 units at the R$1,20/un price. If the total is 30, they pay the per-unit price of R$1,35.

**Current behavior:** Each item is ordered individually with its own bulk tier selection — no cross-item totaling.

**Desired behavior:** Customer picks how many of each type they want (qty steppers per item), and the price per unit is determined by the combined total across all selected items (≥100 → R$1,20/un · ≥50 → R$1,35/un · <50 → R$1,35/un).

**Design options to consider:**
1. **New "Bandeja" modal** — a single multi-item picker where you build a tray: add qty for each salgado type, see a running total and price tier, then add the whole tray as one cart item.
2. **Cart-level totaling** — add items individually as today, but at checkout detect when the combined qty of all Salgados Tradicionais hits a tier and apply the discount automatically.
3. **Category-level order** — replace the per-product cards with a single "Montar Bandeja" button that opens a bulk builder for the whole category.

Option 1 (bandeja modal) is likely the clearest UX for the customer.

