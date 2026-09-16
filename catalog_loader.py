#!/usr/bin/env python3
"""Shared catalog loader with a simple price override file.

Edit only data/precos.json for routine price changes. Product structure, copy,
images and metadata remain in data/catalog.json.
"""
from __future__ import annotations

import copy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "data" / "catalog.json"
PRICES_PATH = ROOT / "data" / "precos.json"


def _read_json(path: Path) -> dict:
    if not path.is_file():
        raise SystemExit(f"arquivo não encontrado: {path.relative_to(ROOT)}")
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise SystemExit(
            f"JSON inválido em {path.relative_to(ROOT)}: linha {exc.lineno}, coluna {exc.colno}"
        ) from exc


def load_catalog() -> dict:
    """Return catalog.json merged with prices from precos.json."""
    payload = copy.deepcopy(_read_json(CATALOG_PATH))
    price_book = _read_json(PRICES_PATH)
    products = payload.get("products")

    if not isinstance(products, list) or not products:
        raise SystemExit("data/catalog.json deve conter uma lista products não vazia")
    if not isinstance(price_book, dict):
        raise SystemExit("data/precos.json deve ser um objeto JSON")

    by_slug = {str(p.get("slug", "")): p for p in products if p.get("slug")}
    unknown = sorted(set(price_book) - set(by_slug))
    if unknown:
        raise SystemExit("slugs desconhecidos em data/precos.json: " + ", ".join(unknown))

    for slug, options_map in price_book.items():
        if not isinstance(options_map, dict) or not options_map:
            raise SystemExit(f"preços inválidos para {slug}: use um objeto com opção: valor")

        product = by_slug[slug]
        options = []
        for label, raw_price in options_map.items():
            if isinstance(raw_price, bool) or not isinstance(raw_price, (int, float)):
                raise SystemExit(f"preço inválido em {slug} / {label}")
            price = float(raw_price)
            if price <= 0:
                raise SystemExit(f"preço deve ser maior que zero em {slug} / {label}")
            options.append({"label": str(label), "price": price})

        product["options"] = options
        product.pop("consultPrice", None)

    return payload


if __name__ == "__main__":
    data = load_catalog()
    print(f"OK: {len(data['products'])} produtos; preços carregados de data/precos.json")
