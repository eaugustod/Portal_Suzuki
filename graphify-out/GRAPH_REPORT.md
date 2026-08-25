# Graph Report - Portal Suzuki  (2026-08-25)

## Corpus Check
- 72 files · ~1,389,756 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 339 nodes · 690 edges · 35 communities (13 shown, 22 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `52e90bf7`
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
- mockPartsData.ts
- scripts
- package.json
- MOCK_GSX_8R_M6_DIAGRAMS
- MOCK_GSX_8S_M5_DIAGRAMS
- MOCK_GSX_8S_M6_DIAGRAMS
- MOCK_GSX_S1000_M5_DIAGRAMS
- MOCK_GSX_S1000_M6_DIAGRAMS
- MOCK_GSX_S1000GT_M5_DIAGRAMS
- MOCK_GSX_S1000GX_M5_DIAGRAMS
- MOCK_HAOJUE_DL160_DIAGRAMS
- MOCK_HAYABUSA_M5_DIAGRAMS
- MOCK_HAYABUSA_M6_DIAGRAMS
- MOCK_MASTER_RIDE_P5_DIAGRAMS
- MOCK_VSTROM800_DIAGRAMS
- MOCK_VSTROM_1050_M5_DIAGRAMS
- MOCK_VSTROM_1050_M6_DIAGRAMS
- MOCK_VSTROM_650XT_M5_DIAGRAMS
- MOCK_VSTROM_650XT_M6_DIAGRAMS
- MOCK_VSTROM_800_M5_DIAGRAMS
- MOCK_VSTROM_800DE_M6_DIAGRAMS
- MOCK_ZONTES_368G_DIAGRAMS
- MOCK_ZONTES_T501_DIAGRAMS

## God Nodes (most connected - your core abstractions)
1. `PartsDiagramGroup` - 35 edges
2. `DealershipScope` - 21 edges
3. `DealershipFullProfile` - 20 edges
4. `compilerOptions` - 15 edges
5. `NavTab` - 12 edges
6. `PurchaseModel` - 12 edges
7. `MontadoraDashboardViewProps` - 9 edges
8. `OrderApprovalDocument` - 9 edges
9. `FactoryOrder` - 9 edges
10. `InventoryItem` - 9 edges

## Surprising Connections (you probably didn't know these)
- `App()` --references--> `react`  [EXTRACTED]
  src/App.tsx → package.json
- `DealershipOrderDetailModal()` --references--> `react`  [EXTRACTED]
  src/components/DealershipOrderDetailModal.tsx → package.json
- `PartsDiagramCarouselProps` --references--> `PartsDiagramGroup`  [EXTRACTED]
  src/components/parts/PartsDiagramCarousel.tsx → src/types.ts
- `DealershipManagementViewProps` --references--> `DealershipFullProfile`  [EXTRACTED]
  src/components/DealershipManagementView.tsx → src/types.ts
- `DealershipOrderDetailModalProps` --references--> `DealershipFullProfile`  [EXTRACTED]
  src/components/DealershipOrderDetailModal.tsx → src/types.ts

## Import Cycles
- None detected.

## Communities (35 total, 22 thin omitted)

### Community 0 - "App Shell & Navigation"
Cohesion: 0.10
Nodes (41): DashboardView(), DashboardViewProps, DealershipManagementView(), DealershipManagementViewProps, Header(), HeaderProps, InventoryView(), InventoryViewProps (+33 more)

### Community 1 - "Dealer Management & Modals"
Cohesion: 0.09
Nodes (39): DealershipOrderDetailModalProps, ModelCatalogManagementModal(), ModelCatalogManagementModalProps, ModelTechnicalSpecsModal(), ModelTechnicalSpecsModalProps, MonthlyCommitmentView(), MonthlyCommitmentViewProps, OrderApprovalDocumentView() (+31 more)

### Community 2 - "Build Config & Dev Dependencies"
Cohesion: 0.06
Nodes (31): autoprefixer, esbuild, vite, devDependencies, autoprefixer, esbuild, tailwindcss, tsx (+23 more)

### Community 3 - "Runtime Dependencies & Packages"
Cohesion: 0.08
Nodes (25): cors, dotenv, express, @google/genai, lucide-react, motion, mssql, dependencies (+17 more)

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
Cohesion: 0.18
Nodes (16): PartsCartDrawer(), PartsCartDrawerProps, PartsCatalogView(), PartsCatalogViewProps, PartsDiagramCarousel(), PartsDiagramCarouselProps, PartsOrderMirrorModal(), PartsOrderMirrorModalProps (+8 more)

### Community 9 - "Skill: Catálogo EPC & Peças Genuínas (Portal Suzuki)"
Cohesion: 0.50
Nodes (3): Estrutura dos Componentes EPC, Regras de Negócio e Hotspots, Skill: Catálogo EPC & Peças Genuínas (Portal Suzuki)

### Community 12 - "mockPartsData.ts"
Cohesion: 0.07
Nodes (28): PartsCatalogUploadModalProps, PartsExplodedDiagramProps, PartsTableProps, GSX_8R_M6_CONVERTED_DIAGRAMS, GSX_8S_M5_CONVERTED_DIAGRAMS, GSX_8S_M6_CONVERTED_DIAGRAMS, GSX_S1000_M5_CONVERTED_DIAGRAMS, GSX_S1000_M6_CONVERTED_DIAGRAMS (+20 more)

### Community 13 - "scripts"
Cohesion: 0.33
Nodes (10): PartsCatalogUploadModal(), PartsExplodedDiagram(), PartsItem, PartsPinHotspot, autoDetectHotspotsFromImage(), generateFallbackHotspots(), deleteDiagramImage(), getDiagramImage() (+2 more)

### Community 14 - "package.json"
Cohesion: 0.29
Nodes (6): dbConfig, getDbPool(), app, __dirname, distPath, __filename

## Knowledge Gaps
- **104 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+99 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Runtime Dependencies & Packages` to `Build Config & Dev Dependencies`?**
  _High betweenness centrality (0.208) - this node is a cross-community bridge._
- **Why does `App()` connect `Runtime Dependencies & Packages` to `App Shell & Navigation`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _104 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Shell & Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.09696969696969697 - nodes in this community are weakly interconnected._
- **Should `Dealer Management & Modals` be split into smaller, more focused modules?**
  _Cohesion score 0.08653061224489796 - nodes in this community are weakly interconnected._
- **Should `Build Config & Dev Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._
- **Should `Runtime Dependencies & Packages` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._