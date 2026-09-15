# Auditoria técnica — Caseirinhos do Ju V5

## Problemas encontrados na versão anterior

1. **Imagens quebradas no catálogo**: o JavaScript apontava para `assets/images/thumb/...`, porém a estrutura entregue não possuía a pasta `thumb`. Isso fazia vários cards perderem suas imagens.
2. **Estrutura pequena para manutenção**: produtos, preços, interface e regras estavam muito concentrados em poucos arquivos.
3. **Dimensionamento pouco previsível**: imagens com formatos diferentes precisavam de containers com proporção e `object-fit` consistentes para não deformar cards.
4. **Python sem estratégia para GitHub Pages**: GitHub Pages não executa backend Python, então a arquitetura precisava separar claramente site estático e camada Python.
5. **SEO dependente de domínio ainda não definido**: canonical e sitemap precisam da URL final de publicação.

## Correções aplicadas

- Novo catálogo com todas as imagens em caminhos existentes e validados.
- Imagens comerciais convertidas para WebP e carregamento tardio onde faz sentido.
- A imagem nova da Coca-Cola 1,5L foi usada diretamente como fonte da versão otimizada do produto.
- UI/UX reconstruída com hero, vitrine editorial, combos, sabores, filtros, busca, carrinho, checkout, FAQ e CTA final.
- Componentes responsivos com breakpoints para 390, 600, 820 e 1100 px, sem depender de frameworks.
- Scroll personalizado, barra de progresso, reveal por IntersectionObserver e suporte a `prefers-reduced-motion`.
- Carrinho persistente em LocalStorage, total automático e mensagem estruturada para WhatsApp.
- `data/catalog.json` virou a fonte única de produtos e preços.
- Python gera `assets/js/catalog-data.js`, valida o projeto e cria uma pasta `dist/` pronta para publicação.
- Servidor Python opcional usa apenas biblioteca padrão, evitando dependência de Flask ou internet para instalar pacotes.
- GitHub Actions incluído para CI e publicação automática no GitHub Pages.
- Canonical, robots e sitemap são gerados com a URL correta durante o build no GitHub Actions.

## Testes executados

- `node --check assets/js/app.js`
- `python scripts/validate_site.py`
- `python -m py_compile app.py server.py`
- `python -m unittest discover -s tests -v`

Resultado: **6 testes aprovados**, incluindo página inicial, API de saúde, API de catálogo, integridade do catálogo e existência da imagem da Coca-Cola.

## Observação sobre GitHub + Python

O código Python pode ficar normalmente no GitHub e pode rodar no **GitHub Actions**. O **GitHub Pages**, porém, publica apenas os arquivos estáticos gerados. Para executar o servidor Python em produção, use uma hospedagem que suporte processos Python. O site não depende desse servidor para vender: carrinho e WhatsApp continuam funcionando na versão estática.
