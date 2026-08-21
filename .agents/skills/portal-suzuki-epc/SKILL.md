---
name: portal-suzuki-epc
description: Guia de desenvolvimento e arquitetura do Catálogo EPC de Peças e Diagramas do Portal Suzuki
---

# Skill: Catálogo EPC & Peças Genuínas (Portal Suzuki)

## Estrutura dos Componentes EPC

- `src/components/parts/PartsCatalogView.tsx`: Container principal do catálogo EPC.
- `src/components/parts/PartsExplodedDiagram.tsx`: Renderizador visual interativo com pan, zoom, upload de imagem customizada e hotspots.
- `src/components/parts/PartsTable.tsx`: Tabela de peças correspondente às ilustrações do diagrama.
- `src/components/parts/PartsCartDrawer.tsx`: Carrinho de compra rápida de peças genuínas.

## Regras de Negócio e Hotspots
- Cada peça tem um número de referência (`ref`).
- Um mesmo `ref` pode possuir múltiplos hotspots posicionados no diagrama PNG (`hs-401-3a`, `hs-401-3b`, etc.).
- **Regra de Renderização de Popover:** Para evitar cards duplicados empilhados, o estado de hover no popover deve utilizar `hoveredHotspotId` (ID único do hotspot) ao invés do `hoveredRef` (número da peça).
