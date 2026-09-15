from __future__ import annotations

import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class GeneratedProductPagesTests(unittest.TestCase):
    def test_every_product_has_a_page(self):
        payload = json.loads((ROOT / "data" / "catalog.json").read_text(encoding="utf-8"))
        for product in payload["products"]:
            page = ROOT / "produtos" / product["slug"] / "index.html"
            self.assertTrue(page.is_file(), str(page))
            html = page.read_text(encoding="utf-8")
            self.assertIn(product["name"], html)
            self.assertIn("application/ld+json", html)
            self.assertIn("Pedir pelo WhatsApp", html)


if __name__ == "__main__":
    unittest.main()
