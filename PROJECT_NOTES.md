# Project Notes — Nedel Confeitaria

## Deployment Notes

### Vercel Project
The active Vercel project is **nedel-confeitaria-pedidos** (connected to GitHub repo `natividadconsulting/nedel_confeitaria`). Always deploy via `git push origin main` — Vercel auto-builds from GitHub. The `.vercel/project.json` is updated to point to this project.

### Vercel Hobby Plan — Image Warning
All pages are fully static (no serverless functions), so function invocation/CPU limits are not a concern. The only limit at risk is **100 GB bandwidth/month**. When product photos are added later:
- Compress images before uploading (target <100 KB each)
- Consider serving images from Cloudflare or another CDN rather than Vercel directly
- Unoptimized images are the fastest path to hitting the bandwidth cap on Hobby

## UI / Terminology Decisions

### Tortas: "Recheio" → "Sabor"
Both Tortas Tradicionais and Tortas Especiais use **Sabor** as the picker label (not Recheio). In the data, both use the `flavors` field so the modal renders the "Sabor" heading consistently across torta categories.

### Tortas Tradicionais & Especiais — Card Structure
Each torta/sabor is its own top-level product card (18 cards for Tradicionais, 8 for Especiais). Clicking a card opens the modal with a grouped size picker labeled **"Tipo e Tamanho"**, showing three shape groups: Torta Redonda, Torta Retangular (Chapinha), Torta Quadrada. No flavor picker inside — the flavor IS the product.

Previous approach (single product with flavor picker) was changed because customers pick the torta type first, then size.

### Tortas Sobremesa — Card Structure
Each dessert type is its own product card (Cheesecake, Pudim Inteiro, Quindão Inteiro, Banoffe, etc.). All share the same 3 sizes (Mini/Pequena/Média). The Cheesecake card has a flavor picker with 3 options: Ninho, Nutella, Doce de Leite.

### Category Descriptions
All category descriptions are purely descriptive — no prices. Prices are visible on individual product cards, so repeating them in the category header was inconsistent and redundant.

## Menu Data Confirmations (from image scan)

### Stikadinho com Morango — Tortas Especiais
Confirmed via product photos in the catalog: "Stikadinho com Morango — leite ninho com morango e stikadinho" belongs in Tortas Especiais. Keeps its entry in `TORTAS_ESPECIAIS_SABORES`.

### Cachorrinho de Nata vs Cachorrinho de Massinha
Both exist as separate items in Salgados Tradicionais. "Cachorrinho de Meta" was a typo — correct name is **Cachorrinho de Nata**.

### Mini Cachorro Quente & Mini Hambúrguer
These belong in **Salgados Especiais** under the "Especialidades" subcategory, sold per unit only (no 50un/100un bulk options). Not in Salgados Lanche.

## Salgados Especiais — Subcategories
Four subcategories: Mini Pizzas, Kibes, Empadinhas Francesas, Especialidades. The Especialidades section contains per-unit only items (Mini Cachorro Quente, Mini Hambúrguer) that don't follow the bulk pricing tiers.

## Kit Compositions

### Kit Torta 1 & 2 — Pelotine
Confirmed with Roseli: Kit Torta 1 (50 unidades) only comes com pelotine — no sem option. Kit Torta 2 (100 unidades) offers the choice. Rule: whenever a kit has 100 units, the customer can pick sem or com pelotine.

### Kit Torta 1 — Salgado Breakdown
Confirmed with Roseli: Kit Torta 1 uses the same salgados as Kit Torta 2, but 10 of each instead of 20.
- 10 Empadinha Folhada • 10 Cachorrinho Folhado • 10 Pastel de Calabresa • 10 Risoles de Frango • 10 Risoles de Carne

## Pricing Confirmations

### Salgado Kit 1, Kit 2, Kit 3 — Pelotine Pricing
Confirmed with Roseli: the prices shown in the WhatsApp catalog images are the **sem pelotine** prices.
The **com pelotine** option is available for all three kits and costs R$5,00 more.

| Option | Price |
|--------|-------|
| Sem pelotine | R$120,00 |
| Com pelotine | R$125,00 |

### Kit Salgado Vegetariano — Pelotine
Only available com pelotine — no sem option.
