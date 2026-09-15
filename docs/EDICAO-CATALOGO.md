# Como editar o catálogo

A fonte oficial dos dados é `data/catalog.json`.

Cada produto possui:

- `id`
- `slug`
- `name`
- `category`
- `description`
- `image`
- `badge`
- `options`
- `flavors` quando aplicável
- `consultPrice` quando o valor não deve ser exibido

Depois de alterar o JSON, execute:

```bash
python scripts/build_catalog.py
python scripts/build_product_pages.py
python scripts/validate_site.py
```

Não edite manualmente `assets/js/catalog-data.js`, pois ele é gerado automaticamente.
