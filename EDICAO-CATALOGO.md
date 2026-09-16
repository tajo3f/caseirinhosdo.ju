# Como editar o catálogo

## Alterar preços pelo celular

Para mudanças rotineiras de valores, edite somente:

```text
data/precos.json
```

Cada produto é identificado pelo `slug`. Dentro dele, altere apenas o número do preço.

Exemplo:

```json
"amanteigado-goiabinha": {
  "200g": 15,
  "500g": 26,
  "1kg": 53
}
```

No GitHub pelo celular: abra `data/precos.json` → toque no lápis → altere → `Commit changes`.
O workflow do GitHub Pages executa o build e publica os novos valores automaticamente.

## Alterar produto, texto, imagem ou categoria

Use:

```text
data/catalog.json
```

Não edite manualmente `assets/js/catalog-data.js`: ele é gerado automaticamente.

## Build local

```bash
python scripts/build_catalog.py
python scripts/build_product_pages.py
python scripts/validate_site.py
```
