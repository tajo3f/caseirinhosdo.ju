# Publicação no GitHub Pages

## 1. Criar o repositório

Crie um repositório no GitHub e envie os arquivos da pasta V6 para a raiz.

## 2. Ativar Pages

No repositório:

`Settings > Pages > Build and deployment > Source > GitHub Actions`

## 3. Publicar

Faça push na branch `main` ou `master`. O workflow `.github/workflows/pages.yml` executa:

1. geração do catálogo JavaScript;
2. geração das páginas individuais de produto;
3. validação de arquivos, IDs, anchors, imagens e preços;
4. validação de sintaxe JavaScript;
5. testes automatizados;
6. geração de canonical, Open Graph, robots e sitemap com a URL correta do repositório;
7. deploy do diretório `dist/`.

## 4. Domínio próprio

Se usar domínio próprio, configure o domínio em `Settings > Pages > Custom domain` e depois adapte o `SITE_URL` do workflow ou faça o build local:

```bash
SITE_URL=https://seudominio.com.br/ python scripts/build_static.py
```

No PowerShell:

```powershell
$env:SITE_URL="https://seudominio.com.br/"
python scripts/build_static.py
```

## Importante

GitHub Pages é hospedagem estática. A camada Python não roda no Pages; ela existe para testes locais e hospedagens compatíveis com Python. Todo o catálogo principal funciona sem backend.
