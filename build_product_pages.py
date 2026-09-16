#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import os
import shutil
from pathlib import Path
from urllib.parse import quote, urljoin

from catalog_loader import load_catalog

ROOT = Path(__file__).resolve().parents[1]
PRODUCTS_DIR = ROOT / "produtos"
WHATSAPP = "5527996511588"
COMPANY = "Caseirinhos do Ju"


def money(value: float) -> str:
    return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def absolute_or_relative(site_url: str, relative: str, local_relative: str) -> str:
    return urljoin(site_url, relative) if site_url else local_relative


def render_product(product: dict, site_url: str = "") -> str:
    slug = product["slug"]
    name = html.escape(product["name"])
    description = html.escape(product.get("description", ""))
    category = html.escape(product.get("category", ""))
    image_rel = product["image"]
    page_url = urljoin(site_url, f"produtos/{slug}/") if site_url else "./"
    og_image = urljoin(site_url, image_rel) if site_url else f"../../{image_rel}"
    image_src = f"../../{image_rel}"
    options = product.get("options", [])
    consult = bool(product.get("consultPrice"))

    if consult:
        price_html = '<span class="price-consult">Valor sob consulta</span>'
        options_html = '<li>Consulte valor e disponibilidade pelo WhatsApp.</li>'
    else:
        options_html = "".join(
            f'<li><span>{html.escape(str(opt.get("label") or "Opção"))}</span><strong>{money(float(opt["price"]))}</strong></li>'
            for opt in options
        )
        prices = [float(opt["price"]) for opt in options]
        price_html = f'<span class="price-from">a partir de</span><strong>{money(min(prices))}</strong>' if len(prices) > 1 else f'<strong>{money(prices[0])}</strong>'

    flavors = product.get("flavors", [])
    flavors_html = ""
    if flavors:
        flavors_html = '<div class="flavors"><h2>Sabores disponíveis</h2><ul>' + "".join(f'<li>{html.escape(f)}</li>' for f in flavors) + '</ul></div>'

    message = f"Olá! Vim pelo site do {COMPANY} e gostaria de pedir {product['name']}."
    wa = f"https://wa.me/{WHATSAPP}?text={quote(message)}"

    offer_schema = []
    if not consult:
        offer_schema = [
            {
                "@type": "Offer",
                "priceCurrency": "BRL",
                "price": f"{float(opt['price']):.2f}",
                "description": opt.get("label") or product["name"],
                "url": page_url,
            }
            for opt in options
        ]

    schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product["name"],
        "description": product.get("description", ""),
        "image": og_image,
        "brand": {"@type": "Brand", "name": COMPANY},
        "category": product.get("category", ""),
        "url": page_url,
    }
    if offer_schema:
        schema["offers"] = offer_schema

    breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": COMPANY, "item": urljoin(site_url, "") if site_url else "../../index.html"},
            {"@type": "ListItem", "position": 2, "name": product["name"], "item": page_url},
        ],
    }

    structured = json.dumps([schema, breadcrumb], ensure_ascii=False, separators=(",", ":"))
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#6a2b12">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <title>{name} | {COMPANY}</title>
  <meta name="description" content="{description}">
  <link rel="canonical" href="{page_url}">
  <meta property="og:type" content="product">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="{COMPANY}">
  <meta property="og:title" content="{name} | {COMPANY}">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="{page_url}">
  <meta property="og:image" content="{og_image}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" href="../../assets/icons/icon-32.png">
  <link rel="stylesheet" href="../../assets/css/style.css">
  <link rel="stylesheet" href="../../assets/css/vfx.css">
  <style>
    .product-page{{min-height:100vh;background:var(--cream-50)}}
    .product-page__header{{border-bottom:1px solid var(--line);background:rgba(255,250,240,.94);backdrop-filter:blur(16px);position:sticky;top:0;z-index:20}}
    .product-page__header .shell{{min-height:78px;display:flex;align-items:center;justify-content:space-between;gap:18px}}
    .product-page__brand{{display:flex;align-items:center;gap:12px;color:var(--brown-950);text-decoration:none;font-weight:900}}
    .product-page__brand img{{width:54px;height:54px;border-radius:50%;object-fit:cover}}
    .product-page__back{{font-size:.82rem;color:var(--brown-700);font-weight:800;text-decoration:none}}
    .product-page__main{{padding:clamp(40px,7vw,90px) 0}}
    .product-page__grid{{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(320px,.95fr);gap:clamp(30px,6vw,82px);align-items:start}}
    .product-page__media{{margin:0;border-radius:32px;overflow:hidden;background:#fff;box-shadow:var(--shadow-lg);aspect-ratio:1/1;position:sticky;top:110px}}
    .product-page__media img{{width:100%;height:100%;object-fit:cover;display:block}}
    .product-page__copy{{padding-top:10px}}
    .product-page__copy .kicker{{margin-bottom:12px}}
    .product-page__copy h1{{font-family:var(--font-display);font-size:clamp(3rem,7vw,6.6rem);line-height:.88;letter-spacing:-.055em;margin:0 0 22px;color:var(--brown-950)}}
    .product-page__copy>p{{font-size:1.05rem;line-height:1.75;color:var(--muted);max-width:58ch}}
    .product-page__price{{display:flex;align-items:baseline;gap:10px;margin:28px 0 20px;color:var(--brown-950)}}
    .product-page__price strong{{font-size:2.1rem}}.price-from,.price-consult{{font-size:.82rem;font-weight:800;color:var(--muted)}}
    .product-page__options{{list-style:none;padding:0;margin:0 0 26px;border-top:1px solid var(--line)}}
    .product-page__options li{{display:flex;justify-content:space-between;gap:16px;padding:14px 0;border-bottom:1px solid var(--line)}}
    .product-page__options span{{color:var(--muted)}}
    .product-page__actions{{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}}
    .product-page__actions .btn{{text-decoration:none}}
    .flavors{{margin-top:34px;padding-top:24px;border-top:1px solid var(--line)}}.flavors h2{{font-size:1.15rem;margin:0 0 14px}}.flavors ul{{display:flex;flex-wrap:wrap;gap:8px;list-style:none;padding:0}}.flavors li{{padding:9px 12px;border-radius:999px;background:#fff;border:1px solid var(--line);font-size:.78rem;font-weight:750}}
    .product-page__note{{margin-top:24px;padding:16px 18px;border-radius:18px;background:var(--cream-100);font-size:.78rem;color:var(--muted);line-height:1.6}}
    @media(max-width:800px){{.product-page__grid{{grid-template-columns:1fr}}.product-page__media{{position:relative;top:auto;aspect-ratio:4/3}}.product-page__copy h1{{font-size:clamp(3rem,14vw,5rem)}}}}
  </style>
  <script type="application/ld+json">{structured}</script>
</head>
<body class="product-page">
  <header class="product-page__header"><div class="shell"><a class="product-page__brand" href="../../index.html"><img src="../../assets/images/logo.webp" alt="{COMPANY}" width="54" height="54"><span>{COMPANY}</span></a><span class="product-page__credit" aria-label="Site desenvolvido pela TAJO Digital 3F"><span>site desenvolvido por</span><strong>TAJO Digital 3F</strong></span><a class="product-page__back" href="../../index.html#cardapio">← Voltar ao cardápio</a></div></header>
  <main class="product-page__main"><div class="shell product-page__grid">
    <figure class="product-page__media" data-vfx-glare><img src="{image_src}" alt="{name} - {COMPANY}" width="1000" height="1000" fetchpriority="high"></figure>
    <section class="product-page__copy"><span class="kicker">{category}</span><h1>{name}</h1><p>{description}</p><div class="product-page__price">{price_html}</div><ul class="product-page__options">{options_html}</ul>{flavors_html}<div class="product-page__actions"><a class="btn btn--primary" href="{wa}" target="_blank" rel="noopener">Pedir pelo WhatsApp →</a><a class="btn btn--secondary" href="../../index.html#cardapio">Continuar escolhendo</a></div><p class="product-page__note">A disponibilidade, retirada, entrega e eventual taxa são confirmadas diretamente pelo atendimento no WhatsApp.</p></section>
  </div></main>
  <script src="../../assets/js/vfx.js" defer></script>
</body>
</html>'''


def main(site_url: str | None = None) -> None:
    payload = load_catalog()
    site_url = (site_url if site_url is not None else os.getenv("SITE_URL", "")).strip()
    if site_url and not site_url.endswith("/"):
        site_url += "/"
    if PRODUCTS_DIR.exists():
        shutil.rmtree(PRODUCTS_DIR)
    for product in payload["products"]:
        directory = PRODUCTS_DIR / product["slug"]
        directory.mkdir(parents=True, exist_ok=True)
        (directory / "index.html").write_text(render_product(product, site_url), encoding="utf-8")
    print(f"generated {len(payload['products'])} product pages")


if __name__ == "__main__":
    main()
