# Action Items — Nedel Confeitaria

## Menu Data

### Bolos Tradicionais
- Some items in the catalog don't have visible labels in the photos — need to manually identify and add the missing product names to `src/data/menu.ts`.

### Tortas Doces
- No category exists yet for "Tortas Doces" (currently there is Tortas Tradicionais, Tortas Especiais, and Tortas Sobremesa — clarify if Tortas Doces is a separate section or an alias for one of these).

### Tortas Especiais
- Not all cake flavors/varieties are currently listed — review the full catalog and add missing items to the `tortas-especiais` category in `src/data/menu.ts`.

### Salgados Diferenciados — 100un Pelotine
- **Open question:** For the 100 unidades option (R$160), is that already the *com pelotine* price (no sem option), or is R$160 the *sem pelotine* base price (and com pelotine would calculate to ~R$166,50 via ×1.04)?
  - The catalog image shows "Cem unidades (com pelotine) R$160,00" — if this is the com price, the modal currently shows the wrong price for com pelotine (~R$166,50) and there should be no sem option for 100un in Salgados Diferenciados.
  - Decision needed before this can be fixed in code.

## Possible Bugs / Investigations

- **404 error** seen on deployed app — investigate root cause if it persists after redeployment.
