from __future__ import annotations

import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class StaticProjectTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.payload = json.loads((ROOT / "data" / "catalog.json").read_text(encoding="utf-8"))
        cls.products = cls.payload["products"]

    def test_catalog_has_unique_ids_and_slugs(self):
        ids = [item["id"] for item in self.products]
        slugs = [item["slug"] for item in self.products]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(len(slugs), len(set(slugs)))

    def test_requested_prices(self):
        by_slug = {p["slug"]: p for p in self.products}
        self.assertEqual(by_slug["casadinho-maracuja-puro"]["options"][0]["price"], 26.0)
        self.assertEqual(by_slug["casadinho-maracuja-chocolate"]["options"][0]["price"], 27.0)
        combo = by_slug["combos-esfirras-abertas"]["options"]
        self.assertEqual([x["price"] for x in combo], [28.0, 52.0, 65.0, 85.0])
        self.assertEqual(by_slug["coca-cola-1-5l"]["options"][0]["price"], 12.0)

    def test_requested_esfirra_flavors(self):
        combo = next(p for p in self.products if p["slug"] == "combos-esfirras-abertas")
        self.assertEqual(combo["flavors"], [
            "Queijo e Presunto",
            "Queijo e Manjericão",
            "Carne Temperada com Cheddar",
        ])

    def test_product_images_exist(self):
        for item in self.products:
            self.assertTrue((ROOT / item["image"]).is_file(), item["image"])

    def test_coca_cola_source_and_optimized_image_exist(self):
        self.assertTrue((ROOT / "assets/source/coca-cola-original.png").is_file())
        self.assertTrue((ROOT / "assets/images/coca-cola-1-5l.webp").is_file())

    def test_core_files_exist(self):
        for rel in [
            "index.html", "offline.html", "assets/css/style.css", "assets/js/app.js",
            "assets/js/catalog-data.js", "app.py", "scripts/build_product_pages.py",
            ".github/workflows/pages.yml"
        ]:
            self.assertTrue((ROOT / rel).is_file(), rel)


if __name__ == "__main__":
    unittest.main()
