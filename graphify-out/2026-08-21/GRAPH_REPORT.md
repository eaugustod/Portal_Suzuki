# Graph Report - Portal Suzuki  (2026-08-21)

## Corpus Check
- 50 files · ~98,503,251 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 270 nodes · 592 edges · 12 communities (10 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5f1f44a5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App Shell & Navigation
- Dealer Management & Modals
- Build Config & Dev Dependencies
- Runtime Dependencies & Packages
- Hayabusa EPC Diagrams Data
- TypeScript Config & DOM Types
- Parts Catalog EPC & Cart
- Exploded Diagram Components
- Skill: Catálogo EPC & Peças Genuínas (Portal Suzuki)
- Skill: Tema Light / Dark Mode
- graphify.md

## God Nodes (most connected - your core abstractions)
1. `DealershipScope` - 21 edges
2. `DealershipFullProfile` - 20 edges
3. `PartsDiagramGroup` - 16 edges
4. `compilerOptions` - 15 edges
5. `NavTab` - 12 edges
6. `PurchaseModel` - 12 edges
7. `MontadoraDashboardViewProps` - 9 edges
8. `OrderApprovalDocument` - 9 edges
9. `FactoryOrder` - 9 edges
10. `InventoryItem` - 9 edges

## Surprising Connections (you probably didn't know these)
- `DealershipOrderDetailModal()` --references--> `react`  [EXTRACTED]
  src/components/DealershipOrderDetailModal.tsx → package.json
- `App()` --references--> `react`  [EXTRACTED]
  src/App.tsx → package.json
- `PartsCatalogUploadModal()` --references--> `xlsx`  [EXTRACTED]
  src/components/parts/PartsCatalogUploadModal.tsx → package.json
- `DealershipManagementViewProps` --references--> `DealershipFullProfile`  [EXTRACTED]
  src/components/DealershipManagementView.tsx → src/types.ts
- `ModelCatalogManagementModalProps` --references--> `PurchaseModel`  [EXTRACTED]
  src/components/ModelCatalogManagementModal.tsx → src/types.ts

## Import Cycles
- None detected.

## Communities (12 total, 2 thin omitted)

### Community 0 - "App Shell & Navigation"
Cohesion: 0.10
Nodes (40): DashboardView(), DashboardViewProps, DealershipManagementViewProps, Header(), HeaderProps, InventoryView(), InventoryViewProps, MontadoraDashboardView() (+32 more)

### Community 1 - "Dealer Management & Modals"
Cohesion: 0.09
Nodes (42): DealershipManagementView(), DealershipOrderDetailModal(), DealershipOrderDetailModalProps, ModelCatalogManagementModal(), ModelCatalogManagementModalProps, ModelTechnicalSpecsModal(), ModelTechnicalSpecsModalProps, MonthlyCommitmentView() (+34 more)

### Community 2 - "Build Config & Dev Dependencies"
Cohesion: 0.07
Nodes (28): autoprefixer, esbuild, vite, devDependencies, autoprefixer, esbuild, tailwindcss, tsx (+20 more)

### Community 3 - "Runtime Dependencies & Packages"
Cohesion: 0.10
Nodes (20): dotenv, express, @google/genai, lucide-react, motion, dependencies, dotenv, express (+12 more)

### Community 4 - "Hayabusa EPC Diagrams Data"
Cohesion: 0.15
Nodes (12): DIAGRAM_401A_FRAME, DIAGRAM_406A_HOLDER, DIAGRAM_407A_STAND, DIAGRAM_412A_CARRIER, DIAGRAM_415A_FOOTREST, DIAGRAM_417A_PILLION, DIAGRAM_420A_FUEL_TANK, DIAGRAM_423A_TANK_COVER (+4 more)

### Community 5 - "TypeScript Config & DOM Types"
Cohesion: 0.11
Nodes (18): DOM, DOM.Iterable, ES2022, compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules (+10 more)

### Community 6 - "Parts Catalog EPC & Cart"
Cohesion: 0.11
Nodes (17): Arquitetura do Projeto, Banco de Dados Planejado, Componentes, Componentes de Peças EPC (src/components/parts/), Convenções de Código, Dados (src/data/), Git e Deploy, Hotspots no Diagrama EPC (+9 more)

### Community 7 - "Exploded Diagram Components"
Cohesion: 0.08
Nodes (38): xlsx, PartsCartDrawer(), PartsCartDrawerProps, PartsCatalogUploadModal(), PartsCatalogUploadModalProps, PartsCatalogView(), PartsCatalogViewProps, PartsDiagramCarousel() (+30 more)

### Community 9 - "Skill: Catálogo EPC & Peças Genuínas (Portal Suzuki)"
Cohesion: 0.50
Nodes (3): Estrutura dos Componentes EPC, Regras de Negócio e Hotspots, Skill: Catálogo EPC & Peças Genuínas (Portal Suzuki)

## Knowledge Gaps
- **76 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+71 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Runtime Dependencies & Packages` to `Build Config & Dev Dependencies`, `Exploded Diagram Components`?**
  _High betweenness centrality (0.238) - this node is a cross-community bridge._
- **Why does `react` connect `Runtime Dependencies & Packages` to `Dealer Management & Modals`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Why does `App()` connect `Runtime Dependencies & Packages` to `App Shell & Navigation`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _76 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Shell & Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.09993011879804332 - nodes in this community are weakly interconnected._
- **Should `Dealer Management & Modals` be split into smaller, more focused modules?**
  _Cohesion score 0.08635703918722787 - nodes in this community are weakly interconnected._
- **Should `Build Config & Dev Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._