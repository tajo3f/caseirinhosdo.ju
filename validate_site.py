#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import urlparse

from catalog_loader import load_catalog

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
CATALOG = ROOT / "data" / "catalog.json"


def fail(message: str) -> None:
    print(f"ERROR: {message}")
    raise SystemExit(1)


def local_ref(value: str) -> bool:
    return bool(value) and not value.startswith(("http:", "https:", "#", "mailto:", "tel:", "data:"))


def main() -> None:
    html = INDEX.read_text(encoding="utf-8")
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    products = catalog.get("products", [])
    if len(products) < 12:
        fail("catalog should contain at least 12 products")

    ids = [int(p["id"]) for p in products]
    slugs = [str(p.get("slug", "")).strip() for p in products]
    if len(ids) != len(set(ids)):
        fail("duplicate product ids")
    if any(not slug for slug in slugs) or len(slugs) != len(set(slugs)):
        fail("empty or duplicate product slugs")

    for product in products:
        for key in ["id", "slug", "name", "category", "description", "image"]:
            if key not in product or product[key] in (None, ""):
                fail(f"missing {key} in product: {product.get('name', product.get('id'))}")
        image = ROOT / product["image"]
        if not image.is_file():
            fail(f"missing product image: {product['image']}")
        if image.stat().st_size <= 1_000:
            fail(f"suspiciously small product image: {product['image']}")
        if product.get("consultPrice"):
            continue
        options = product.get("options", [])
        if not options:
            fail(f"product has no options: {product['name']}")
        for option in options:
            try:
                price = float(option["price"])
            except (KeyError, TypeError, ValueError):
                fail(f"invalid price in product: {product['name']}")
            if price <= 0:
                fail(f"non-positive price in product: {product['name']}")

    refs = set(re.findall(r'(?:src|href)="([^"?]+)', html))
    for ref in sorted(refs):
        if ref == "./" or not local_ref(ref):
            continue
        target = ROOT / ref
        if not target.exists():
            fail(f"missing HTML reference: {ref}")

    html_ids = re.findall(r'(?<![-\w])id="([^"]+)"', html)
    duplicates = sorted({i for i in html_ids if html_ids.count(i) > 1})
    if duplicates:
        fail(f"duplicate HTML ids: {duplicates}")
    id_set = set(html_ids)
    for anchor in re.findall(r'href="#([^"]+)"', html):
        if anchor not in id_set:
            fail(f"anchor target does not exist: #{anchor}")

    required_ids = [
        "productsGrid", "categoryTabs", "searchInput", "cartDrawer", "checkoutForm",
        "comboModal", "scrollProgress", "headerCartButton", "checkoutButton", "toast"
    ]
    for element_id in required_ids:
        if element_id not in id_set:
            fail(f"required element missing: #{element_id}")

    for rel in [
        "assets/css/style.css", "assets/js/app.js", "assets/js/catalog-data.js",
        "assets/images/coca-cola-1-5l.webp", "assets/source/coca-cola-original.png",
        "manifest.webmanifest", "sw.js", "offline.html", ".github/workflows/pages.yml"
    ]:
        if not (ROOT / rel).is_file():
            fail(f"required project file missing: {rel}")

    manifest = json.loads((ROOT / "manifest.webmanifest").read_text(encoding="utf-8"))
    for icon in manifest.get("icons", []):
        if not (ROOT / icon["src"]).is_file():
            fail(f"missing manifest icon: {icon['src']}")

    print(f"OK: {len(products)} products, {len(refs)} refs, {len(html_ids)} unique DOM ids checked")


if __name__ == "__main__":
    main()
