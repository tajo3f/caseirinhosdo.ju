# Auditoria V6 — Caseirinhos do Ju

## Correções aplicadas

- Coca-Cola 1,5L substituída pela imagem exata enviada no último pedido e recomprimida para WebP.
- Checkout de entrega agora valida rua, número, bairro e cidade.
- Máscaras de telefone e CEP adicionadas.
- Service Worker corrigido para não usar `index.html` como fallback de imagens/arquivos offline.
- Cache atualizado para V6, evitando conteúdo antigo preso no navegador.
- DOM crítico tornou-se mais tolerante a elementos opcionais.
- Schema de produtos deixou de afirmar disponibilidade em estoque sem confirmação.
- Páginas individuais de produto adicionadas para SEO e navegação.
- Sitemap passa a incluir todos os produtos no build de produção.
- 404 é ajustada no build para funcionar em subpastas do GitHub Pages.
- Validador passou a detectar IDs duplicados, anchors quebrados, slugs duplicados, imagens ausentes e preços inválidos.
- GitHub Actions agora verifica sintaxe JavaScript e executa todos os testes antes do deploy.

## Quality gate

O projeto só deve ser considerado pronto quando os seguintes comandos terminarem sem erro:

```bash
python scripts/build_catalog.py
python scripts/build_product_pages.py
python scripts/validate_site.py
node --check assets/js/catalog-data.js
node --check assets/js/app.js
node --check sw.js
python -m unittest discover -s tests -v
```
