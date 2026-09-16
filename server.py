"""Optional zero-dependency Python server for Caseirinhos do Ju.

The storefront remains fully static for GitHub Pages. This server is useful
for local testing or Python-capable hosting and also exposes two small APIs.
"""
from __future__ import annotations

import json
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from scripts.catalog_loader import load_catalog

ROOT = Path(__file__).resolve().parent


class CaseirinhosHandler(SimpleHTTPRequestHandler):
    def _json(self, payload: object, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802 - required by BaseHTTPRequestHandler
        path = urlparse(self.path).path
        if path == "/api/health":
            self._json({"ok": True, "service": "caseirinhos-do-ju"})
            return
        if path == "/api/catalog":
            self._json(load_catalog())
            return
        super().do_GET()

    def end_headers(self) -> None:
        if self.path.startswith("/assets/"):
            self.send_header("Cache-Control", "public, max-age=86400")
        super().end_headers()


def make_server(host: str = "0.0.0.0", port: int = 5000) -> ThreadingHTTPServer:
    handler = partial(CaseirinhosHandler, directory=str(ROOT))
    return ThreadingHTTPServer((host, port), handler)


def main() -> None:
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "5000"))
    server = make_server(host, port)
    print(f"Caseirinhos do Ju: http://127.0.0.1:{server.server_address[1]}")
    print("APIs: /api/health and /api/catalog")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
