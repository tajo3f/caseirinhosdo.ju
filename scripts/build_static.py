#!/usr/bin/env python3
from __future__ import annotations

import os
import shutil
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"


def ensure_trailing_slash(url: str) -> str:
    return url if url.endswith("/") else url + "/"


def patch_root_html(path: Path, site_url: str) -> None:
    html = path.read_text(encoding="utf-8")
    html = html.replace('<link rel="canonical" href="./">', f'<link rel="canonical" href="{site_url}">')
    if '<meta property="og:url"' not in html:
        html = html.replace('<meta property="og:type" content="website">', f'<meta property="og:type" content="website">\n  <meta property="og:url" content="{site_url}">')
    html = html.replace('content="assets/images/og-caseirinhos.jpg"', f'content="{urljoin(site_url, "assets/images/og-caseirinhos.jpg")}"')
    path.write_text(html, encoding="utf-8")


def patch_404(path: Path, site_url: str) -> None:
    html = path.read_text(encoding="utf-8")
    html = html.replace('src="assets/images/logo.webp"', f'src="{urljoin(site_url, "assets/images/logo.webp")}"')
    html = html.replace('href="./"', f'href="{site_url}"')
    path.write_text(html, encoding="utf-8")


def main() -> None:
    from build_catalog import main as build_catalog
    from build_product_pages import main as build_product_pages

    site_url = ensure_trailing_slash(os.getenv("SITE_URL", "http://localhost:8000/"))
    build_catalog()
    build_product_pages(site_url)

    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)

    for name in ["index.html", "404.html", "offline.html", "manifest.webmanifest", "sw.js", ".nojekyll"]:
        shutil.copy2(ROOT / name, DIST / name)
    shutil.copytree(ROOT / "assets", DIST / "assets")
    # Source/reference originals are kept in the project but are not needed by visitors.
    shutil.rmtree(DIST / "assets" / "source", ignore_errors=True)
    shutil.copytree(ROOT / "produtos", DIST / "produtos")

    patch_root_html(DIST / "index.html", site_url)
    patch_404(DIST / "404.html", site_url)

    (DIST / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\nSitemap: {urljoin(site_url, 'sitemap.xml')}\n",
        encoding="utf-8",
    )

    product_urls = []
    for page in sorted((DIST / "produtos").glob("*/index.html")):
        slug = page.parent.name
        product_urls.append(urljoin(site_url, f"produtos/{slug}/"))

    sitemap_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        f"  <url><loc>{site_url}</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>",
    ]
    sitemap_lines += [f"  <url><loc>{url}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>" for url in product_urls]
    sitemap_lines.append("</urlset>")
    (DIST / "sitemap.xml").write_text("\n".join(sitemap_lines) + "\n", encoding="utf-8")

    print(f"static build ready at {DIST} for {site_url} with {len(product_urls)} product pages")


if __name__ == "__main__":
    main()
