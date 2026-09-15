from __future__ import annotations

import json
import threading
import unittest
from urllib.request import urlopen

from server import make_server


class PythonServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = make_server("127.0.0.1", 0)
        cls.port = cls.server.server_address[1]
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)

    def get(self, path: str):
        with urlopen(f"http://127.0.0.1:{self.port}{path}", timeout=3) as response:
            return response.status, response.read(), response.headers.get("Content-Type", "")

    def test_home(self):
        status, body, _ = self.get("/")
        self.assertEqual(status, 200)
        self.assertIn(b"Caseirinhos do Ju", body)

    def test_health(self):
        status, body, content_type = self.get("/api/health")
        self.assertEqual(status, 200)
        self.assertIn("application/json", content_type)
        self.assertTrue(json.loads(body)["ok"])

    def test_catalog(self):
        status, body, _ = self.get("/api/catalog")
        self.assertEqual(status, 200)
        self.assertGreaterEqual(len(json.loads(body)["products"]), 12)

    def test_product_page(self):
        status, body, content_type = self.get("/produtos/coca-cola-1-5l/")
        self.assertEqual(status, 200)
        self.assertIn("text/html", content_type)
        self.assertIn("Coca-Cola 1,5L".encode("utf-8"), body)

    def test_product_image(self):
        status, body, content_type = self.get("/assets/images/coca-cola-1-5l.webp")
        self.assertEqual(status, 200)
        self.assertGreater(len(body), 50_000)
        self.assertIn("image/webp", content_type)


if __name__ == "__main__":
    unittest.main()
