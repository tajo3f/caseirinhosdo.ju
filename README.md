# Caseirinhos do Ju — Premium V8 · Preços Fáceis

Versão baseada na V7 ULTRA, com os novos valores aplicados e edição simplificada por `data/precos.json`, preservando UI/UX, VFX, catálogo, carrinho, WhatsApp e compatibilidade com GitHub Pages.

## O que mudou na V8

- novos valores aplicados aos Amanteigados, Casadinhos e Pães Caseiros;
- novo arquivo `data/precos.json` para alterar somente preços pelo celular;
- build do catálogo e páginas de produto passa a ler `precos.json`;
- API local `/api/catalog` usa os mesmos preços do site;
- Service Worker atualizado para evitar preço antigo preso no cache do celular;
- testes atualizados para conferir os novos valores.

## O que mudou na V7

- nova camada visual `assets/css/vfx.css`, separada do CSS principal;
- nova camada de interação `assets/js/vfx.js`, sem bibliotecas externas;
- imagens novas e aproximadas das esfirras, sem textos sobrepostos;
- efeitos de profundidade no hero, glare controlado, partículas discretas, ribbon artesanal, microinterações e feedback do carrinho;
- `prefers-reduced-motion` respeitado e efeitos de tilt desativados em telas touch;
- assinatura **“Site desenvolvido por TAJO Digital 3F” apenas no cabeçalho**;
- páginas de produto continuam geradas automaticamente;
- GitHub Pages continua sendo caminho oficial de deploy;
- cache do Service Worker atualizado para `caseirinhos-v7-ultra`;
- foco de teclado preso dentro de modais/carrinho quando abertos;
- testes automatizados ampliados para validar a camada ULTRA e os novos assets.

## Arquitetura

Site estático em HTML5 + CSS3 + JavaScript Vanilla, com Python apenas para build, validação e servidor local opcional. Não há React, Next.js ou bundler obrigatório.

## Documentação anterior / instruções de uso

Catálogo digital mobile-first para **Pães & Biscoitos**, com identidade visual própria, carrinho persistente, combos de esfirras, checkout via WhatsApp, SEO técnico, páginas individuais de produto, PWA e publicação automatizada no GitHub Pages.

## Principais melhorias da V6

- A imagem enviada da **Coca-Cola 1,5L** foi incorporada como fonte original e convertida para WebP otimizado sem alterar o conteúdo.
- Estrutura responsiva revisada para 320px até desktop/ultrawide.
- Imagens com proporção controlada e `object-fit`, sem deformação.
- Carrinho persistente em `localStorage`, com total automático e controle de quantidades.
- Checkout reforçado: valida nome/telefone e exige endereço mínimo quando o cliente escolhe **Entrega**.
- Máscara de telefone e CEP no checkout.
- Combos de esfirras com seletor de sabor.
- Busca e filtros do catálogo.
- Scroll personalizado, indicador de progresso, botão de voltar ao topo e animações respeitando `prefers-reduced-motion`.
- PWA com service worker corrigido: navegação offline usa página própria e não devolve HTML no lugar de imagens.
- SEO técnico com Organization, ItemList, FAQ e páginas individuais de produtos com Product + BreadcrumbList.
- `sitemap.xml` gerado com a página inicial e todas as páginas de produtos.
- GitHub Actions com validação de estrutura, JavaScript, preços, imagens e testes antes do deploy.
- Compatível com GitHub Pages, Netlify, Vercel e hospedagem estática comum.
- Camada Python opcional para servir localmente e expor `/api/health` e `/api/catalog`.

## Produtos e valores cadastrados

- Amanteigados e Casadinhos — **200g R$ 15,00 · 500g R$ 26,00 · 1kg R$ 53,00**
- Pão Caseiro Doce — **R$ 15,00/unidade**
- Pão Caseiro de Sal e Cebola — **R$ 15,00/unidade**
- Pão de Hambúrguer Caseiro — **sob consulta**
- Combo Esfirra — 6 un. — **R$ 28,00**
- Combo Casal — 12 un. — **R$ 52,00**
- Combo Família — 15 un. — **R$ 65,00**
- Combo Festa — 18 un. — **R$ 85,00**
- Coca-Cola 1,5L — **R$ 12,00**

Sabores de esfirra:

- Queijo e Presunto
- Queijo e Manjericão
- Carne Temperada com Cheddar

## Abrir localmente

### Sem instalar nada

Abra `index.html` no navegador. O catálogo e o carrinho funcionam localmente.

### Com Python

```bash
python server.py
```

Depois acesse `http://localhost:5000`.

## Editar preços pelo celular

Edite somente:

```text
data/precos.json
```

No GitHub: abra o arquivo → lápis → altere os números → `Commit changes`. O GitHub Actions faz o build e publica automaticamente.

Para alterar nome, descrição, categoria, imagem ou estrutura do produto, use `data/catalog.json`.

## Testar antes de publicar

```bash
python scripts/build_catalog.py
python scripts/build_product_pages.py
python scripts/validate_site.py
node --check assets/js/catalog-data.js
node --check assets/js/app.js
node --check sw.js
python -m unittest discover -s tests -v
```

## GitHub Pages

1. Crie um repositório.
2. Envie **todo o conteúdo desta pasta** para a raiz do repositório.
3. Em `Settings > Pages`, escolha **GitHub Actions** como Source.
4. Faça push na branch `main` ou `master`.
5. O workflow valida, gera as páginas de produto, ajusta canonical/sitemap para a URL do repositório e publica automaticamente.

Veja `docs/GITHUB-PAGES.md` para o passo a passo completo.

## Estrutura

```text
.
├── index.html
├── 404.html
├── offline.html
├── assets/
│   ├── css/style.css
│   ├── js/app.js
│   ├── js/catalog-data.js
│   ├── images/
│   ├── icons/
│   └── source/coca-cola-original.png
├── data/
│   ├── catalog.json
│   └── precos.json
├── produtos/<slug>/index.html
├── scripts/
│   ├── catalog_loader.py
│   ├── build_catalog.py
│   ├── build_product_pages.py
│   ├── build_static.py
│   └── validate_site.py
├── tests/
├── docs/
├── .github/workflows/
├── manifest.webmanifest
├── sw.js
├── robots.txt
├── sitemap.xml
├── server.py
└── app.py
```

## Observação comercial

O site **não confirma disponibilidade, entrega ou taxa automaticamente**. O pedido é montado no navegador e enviado ao WhatsApp para confirmação pelo atendimento.