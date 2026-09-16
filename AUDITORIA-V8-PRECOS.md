# Auditoria V8 — preços fáceis

- 12 produtos carregados e validados.
- 15 testes automatizados aprovados.
- JavaScript principal, catálogo, VFX e Service Worker validados por sintaxe.
- `data/precos.json` integrado ao build do catálogo, páginas individuais e API local.
- GitHub Actions continua gerando e publicando o site automaticamente.
- Testes não travam futuras alterações de preços: validam consistência com `precos.json`.
- Service Worker V8 usa estratégia network-first para `catalog-data.js` para reduzir risco de preço antigo no cache do celular.
- Valores atuais: Amanteigados/Casadinhos 200g R$15, 500g R$26, 1kg R$53; Pães Doce e Sal/Cebola R$15/un.; combos e Coca-Cola mantidos.
