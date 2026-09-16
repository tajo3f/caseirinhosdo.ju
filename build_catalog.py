#!/usr/bin/env python3
"""Generate the browser catalog from catalog.json + precos.json."""
from __future__ import annotations

import json
from pathlib import Path

from catalog_loader import load_catalog

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "js" / "catalog-data.js"


def main() -> None:
    payload = load_catalog()
    products = payload["products"]

    ids = [item.get("id") for item in products]
    slugs = [item.get("slug") for item in products]
    if len(ids) != len(set(ids)):
        raise SystemExit("IDs de produtos duplicados")
    if len(slugs) != len(set(slugs)):
        raise SystemExit("slugs de produtos duplicados")

    js = (
        "// AUTO-GENERATED. NÃO EDITE ESTE ARQUIVO.\n"
        "// Produtos: data/catalog.json | Preços: data/precos.json\n"
        "window.CASEIRINHOS_CATALOG = "
        + json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        + ";\n"
    )
    OUT.write_text(js, encoding="utf-8")
    print(f"gerado {OUT.relative_to(ROOT)} com {len(products)} produtos")


if __name__ == "__main__":
    main()
