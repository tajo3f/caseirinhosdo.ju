# Auditoria V7 ULTRA — Caseirinhos do Ju

## Escopo

Evolução incremental da V6.1 com foco em identidade, UI/UX, efeitos visuais controlados, performance, acessibilidade, GitHub Pages e qualidade do catálogo.

## Melhorias aplicadas

- **Identidade:** acabamento em creme, caramelo e marrom, textura de papel por CSS e assinatura da TAJO Digital 3F somente no cabeçalho.
- **Esfirras:** três novos close-ups em WebP 1200×1200, sem lettering ou preço dentro da fotografia.
- **Hero:** profundidade por ponteiro em desktop, halo quente, spotlight e partículas discretas.
- **Catálogo:** cards com depth/tilt leve, glare controlado, feedback visual de carrinho e animação de entrada curta.
- **UX:** modais continuam fechados no carregamento, ESC fecha, clique fora fecha e Tab permanece dentro do contexto aberto.
- **Acessibilidade:** `prefers-reduced-motion` desativa movimento não essencial; tilt/glare são desativados em dispositivos touch.
- **Performance:** WebP, sem bibliotecas JS externas, VFX em transform/opacity, arquivos visuais separados e cache atualizado.
- **Deploy:** workflow de GitHub Pages valida Python, JavaScript, catálogo e build antes de publicar.

## Portões de qualidade

1. Estratégia: aprovado — pedido via WhatsApp é a ação primária.
2. UX: aprovado — busca, filtros, carrinho, combos e checkout permanecem claros.
3. UI: aprovado — camada visual específica da marca e das categorias.
4. Engenharia: aprovado — Vanilla JS, build estático e configuração centralizada.
5. Performance + acessibilidade: aprovado — imagens otimizadas e motion fallback.
6. SEO + conversão: aprovado — páginas de produto, schema, sitemap e CTAs contextuais.
7. QA: aprovado por validação automatizada e testes unitários do projeto.

## Observação

A camada VFX foi deliberadamente mantida sem dependências externas para não sacrificar velocidade, manutenção ou compatibilidade com GitHub Pages.
