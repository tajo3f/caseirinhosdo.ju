# Hotfix V6.1 — Modal de checkout

## Problema corrigido
O seletor `.modal { display:grid }` podia sobrescrever o estado HTML `hidden`, fazendo o checkout aparecer já na abertura da página.

## Correções
- regra global `[hidden]{display:none!important}`;
- estado inicial defensivo no JavaScript;
- botão de fechar do modal agora permanece visível ao rolar;
- scroll interno do checkout é resetado sempre que abre/fecha;
- foco do primeiro campo usa `preventScroll`;
- uso de `100dvh` para melhor comportamento em telas móveis;
- cache do Service Worker atualizado para forçar a versão corrigida.
