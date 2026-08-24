# Graph Report - Portal Suzuki  (2026-08-24)

## Corpus Check
- 104 files · ~118,680,036 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 403 nodes · 796 edges · 45 communities (22 shown, 23 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `47f5444c`
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
- react
- vite
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
- pin_locator.py
- Pin Locator — EPS / PDF / PNG
- node_detect_vision.js
- apply_vision_all_catalogs.py

## God Nodes (most connected - your core abstractions)
1. `PartsDiagramGroup` - 35 edges
2. `DealershipScope` - 21 edges
3. `DealershipFullProfile` - 20 edges
4. `compilerOptions` - 15 edges
5. `NavTab` - 12 edges
6. `PurchaseModel` - 12 edges
7. `process()` - 10 edges
8. `MontadoraDashboardViewProps` - 9 edges
9. `OrderApprovalDocument` - 9 edges
10. `FactoryOrder` - 9 edges

## Surprising Connections (you probably didn't know these)
- `App()` --references--> `react`  [EXTRACTED]
  src/App.tsx → package.json
- `DealershipOrderDetailModal()` --references--> `react`  [EXTRACTED]
  src/components/DealershipOrderDetailModal.tsx → package.json
- `PartsCatalogUploadModal()` --references--> `xlsx`  [EXTRACTED]
  src/components/parts/PartsCatalogUploadModal.tsx → package.json
- `PartsExplodedDiagramProps` --references--> `PartsDiagramGroup`  [EXTRACTED]
  src/components/parts/PartsExplodedDiagram.tsx → src/types.ts
- `DealershipManagementViewProps` --references--> `DealershipFullProfile`  [EXTRACTED]
  src/components/DealershipManagementView.tsx → src/types.ts

## Import Cycles
- None detected.

## Communities (45 total, 23 thin omitted)

### Community 0 - "App Shell & Navigation"
Cohesion: 0.09
Nodes (42): DashboardView(), DashboardViewProps, DealershipManagementViewProps, Header(), HeaderProps, InventoryView(), InventoryViewProps, MontadoraDashboardView() (+34 more)

### Community 1 - "Dealer Management & Modals"
Cohesion: 0.09
Nodes (38): DealershipManagementView(), DealershipOrderDetailModalProps, ModelCatalogManagementModal(), ModelCatalogManagementModalProps, ModelTechnicalSpecsModal(), ModelTechnicalSpecsModalProps, MonthlyCommitmentViewProps, OrderApprovalDocumentView() (+30 more)

### Community 2 - "Build Config & Dev Dependencies"
Cohesion: 0.13
Nodes (15): autoprefixer, esbuild, devDependencies, autoprefixer, esbuild, tailwindcss, tsx, @types/express (+7 more)

### Community 3 - "Runtime Dependencies & Packages"
Cohesion: 0.12
Nodes (17): dotenv, express, @google/genai, lucide-react, motion, dependencies, dotenv, express (+9 more)

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
Cohesion: 0.11
Nodes (30): xlsx, PartsCartDrawer(), PartsCartDrawerProps, PartsCatalogUploadModal(), PartsCatalogUploadModalProps, PartsCatalogView(), PartsCatalogViewProps, PartsExplodedDiagram() (+22 more)

### Community 9 - "Skill: Catálogo EPC & Peças Genuínas (Portal Suzuki)"
Cohesion: 0.50
Nodes (3): Estrutura dos Componentes EPC, Regras de Negócio e Hotspots, Skill: Catálogo EPC & Peças Genuínas (Portal Suzuki)

### Community 12 - "mockPartsData.ts"
Cohesion: 0.07
Nodes (26): PartsDiagramCarousel(), PartsDiagramCarouselProps, GSX_8R_M6_CONVERTED_DIAGRAMS, GSX_8S_M5_CONVERTED_DIAGRAMS, GSX_8S_M6_CONVERTED_DIAGRAMS, GSX_S1000_M5_CONVERTED_DIAGRAMS, GSX_S1000_M6_CONVERTED_DIAGRAMS, GSX_S1000GT_M5_CONVERTED_DIAGRAMS (+18 more)

### Community 13 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, clean, dev, lint, preview

### Community 14 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 15 - "react"
Cohesion: 0.50
Nodes (4): react, react, App(), DealershipOrderDetailModal()

### Community 16 - "vite"
Cohesion: 0.67
Nodes (3): vite, vite, vite

### Community 37 - "pin_locator.py"
Cohesion: 0.07
Nodes (44): Path, convert_eps_to_pdf(), dedupe(), eps_vector_labels(), infer_pins(), Label, labels_from_image(), labels_from_pdf() (+36 more)

### Community 38 - "Pin Locator — EPS / PDF / PNG"
Cohesion: 0.25
Nodes (7): Entrada, Instalação, Integração com seu catálogo, Observação importante, Pin Locator — EPS / PDF / PNG, Saída, Uso

### Community 42 - "node_detect_vision.js"
Cohesion: 0.50
Nodes (3): { createCanvas, loadImage }, fs, path

## Knowledge Gaps
- **105 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+100 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Runtime Dependencies & Packages` to `vite`, `Exploded Diagram Components`, `package.json`, `react`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `Runtime Dependencies & Packages`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `App()` connect `react` to `App Shell & Navigation`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `Path` (e.g. with `process_all()` and `process_single_eps()`) actually correct?**
  _`Path` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _105 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Shell & Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.09210526315789473 - nodes in this community are weakly interconnected._
- **Should `Dealer Management & Modals` be split into smaller, more focused modules?**
  _Cohesion score 0.09131205673758866 - nodes in this community are weakly interconnected._