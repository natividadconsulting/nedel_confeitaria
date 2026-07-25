# Project Notes — Nedel Confeitaria

## Deployment Notes

### Vercel Hobby Plan — Image Warning
All pages are fully static (no serverless functions), so function invocation/CPU limits are not a concern. The only limit at risk is **100 GB bandwidth/month**. When product photos are added later:
- Compress images before uploading (target <100 KB each)
- Consider serving images from Cloudflare or another CDN rather than Vercel directly
- Unoptimized images are the fastest path to hitting the bandwidth cap on Hobby

## UI / Terminology Decisions

### Tortas: "Recheio" → "Sabor"
Both Tortas Tradicionais and Tortas Especiais use **Sabor** as the picker label (not Recheio). In the data, both use the `flavors` field so the modal renders the "Sabor" heading consistently across torta categories.

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
