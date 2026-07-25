# Action Items — Nedel Confeitaria

## Menu Data

### Bolos Tradicionais
- Some items in the catalog don't have visible labels in the photos — need to manually identify and add the missing product names to `src/data/menu.ts`.

### Tortas Doces
- No category exists yet for "Tortas Doces" (currently there is Tortas Tradicionais, Tortas Especiais, and Tortas Sobremesa — clarify if Tortas Doces is a separate section or an alias for one of these).

### Tortas Especiais
- Sabor options are somewhat incorrect and need to be reviewed and fixed in `src/data/menu.ts`.

### Salgados Especiais — Pelotine
- The catalog image shows "com pelotine" pricing only (no sem option visible). Confirm with Roseli: is Salgados Especiais com pelotine only (like Kit Vegetariano), or does it offer sem/com choice? If com-only, add `pelotine: 'com-only'` to those products.

### Salgados Diferenciados — 100un Pelotine
- **Open question:** For the 100 unidades option (R$160), is that already the *com pelotine* price (no sem option), or is R$160 the *sem pelotine* base price (and com pelotine would calculate to ~R$166,50 via ×1.04)?
  - The catalog image shows "Cem unidades (com pelotine) R$160,00" — if this is the com price, the modal currently shows the wrong price for com pelotine (~R$166,50) and there should be no sem option for 100un in Salgados Diferenciados.
  - Decision needed before this can be fixed in code.

