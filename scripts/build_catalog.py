#!/usr/bin/env python3

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

CATALOG = ROOT / "data" / "catalog.json"
PRICES = ROOT / "data" / "precos.json"
OUT = ROOT / "assets" / "js" / "catalog-data.js"


def load_json(path: Path) -> dict:
    if not path.exists():
        raise SystemExit(f"Arquivo não encontrado: {path}")

    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise SystemExit(
            f"JSON inválido em {path.name}: linha {exc.lineno}, coluna {exc.colno}"
        )


def apply_prices(payload: dict, price_book: dict) -> None:
    products = payload.get("products")

    if not isinstance(products, list) or not products:
        raise SystemExit(
            "catalog.json deve possuir uma lista de produtos."
        )

    catalog_slugs = {
        product.get("slug")
        for product in products
        if product.get("slug")
    }

    unknown_slugs = set(price_book.keys()) - catalog_slugs

    if unknown_slugs:
        raise SystemExit(
            "Produtos em precos.json que não existem em catalog.json: "
            + ", ".join(sorted(unknown_slugs))
        )

    for product in products:
        slug = product.get("slug")

        if slug not in price_book:
            continue

        product_prices = price_book[slug]

        if not isinstance(product_prices, dict) or not product_prices:
            raise SystemExit(
                f"Preço inválido para o produto: {slug}"
            )

        options = []

        for label, price in product_prices.items():

            if not isinstance(price, (int, float)):
                raise SystemExit(
                    f"Preço inválido em {slug} / {label}"
                )

            if price < 0:
                raise SystemExit(
                    f"O preço não pode ser negativo: {slug} / {label}"
                )

            options.append(
                {
                    "label": str(label),
                    "price": float(price)
                }
            )

        product["options"] = options

        # Se existe preço cadastrado, deixa de ser "sob consulta".
        product.pop("consultPrice", None)


def validate_products(payload: dict) -> None:
    products = payload["products"]

    ids = [product.get("id") for product in products]

    if len(ids) != len(set(ids)):
        raise SystemExit(
            "Existem IDs de produtos duplicados."
        )

    slugs = [product.get("slug") for product in products]

    if len(slugs) != len(set(slugs)):
        raise SystemExit(
            "Existem slugs de produtos duplicados."
        )


def main() -> None:

    payload = load_json(CATALOG)
    price_book = load_json(PRICES)

    apply_prices(payload, price_book)
    validate_products(payload)

    # Atualiza catalog.json durante o build.
    # Isso faz as páginas individuais usarem os mesmos preços.
    CATALOG.write_text(
        json.dumps(
            payload,
            ensure_ascii=False,
            indent=2
        ) + "\n",
        encoding="utf-8"
    )

    js = (
        "// AUTO-GENERATED. NÃO EDITE MANUALMENTE.\n"
        "// Preços: data/precos.json\n"
        "window.CASEIRINHOS_CATALOG = "
        + json.dumps(
            payload,
            ensure_ascii=False,
            separators=(",", ":")
        )
        + ";\n"
    )

    OUT.write_text(
        js,
        encoding="utf-8"
    )

    print(
        f"Catálogo atualizado com {len(payload['products'])} produtos."
    )

    print(
        "Preços carregados de data/precos.json"
    )


if __name__ == "__main__":
    main()