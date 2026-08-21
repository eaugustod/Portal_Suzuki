# Graph Report - .  (2026-08-21)

## Corpus Check
- 42 files · ~79,130 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 227 nodes · 525 edges · 9 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App Shell & Navigation
- Dealer Management & Modals
- Build Config & Dev Dependencies
- Runtime Dependencies & Packages
- Hayabusa EPC Diagrams Data
- TypeScript Config & DOM Types
- Parts Catalog EPC & Cart
- Exploded Diagram Components

## God Nodes (most connected - your core abstractions)
1. `DealershipScope` - 21 edges
2. `DealershipFullProfile` - 20 edges
3. `compilerOptions` - 15 edges
4. `NavTab` - 12 edges
5. `PurchaseModel` - 12 edges
6. `PartsDiagramGroup` - 11 edges
7. `MontadoraDashboardViewProps` - 9 edges
8. `OrderApprovalDocument` - 9 edges
9. `FactoryOrder` - 9 edges
10. `InventoryItem` - 9 edges

## Surprising Connections (you probably didn't know these)
- `App()` --references--> `react`  [EXTRACTED]
  src/App.tsx → package.json
- `DealershipOrderDetailModal()` --references--> `react`  [EXTRACTED]
  src/components/DealershipOrderDetailModal.tsx → package.json
- `DealershipManagementViewProps` --references--> `DealershipFullProfile`  [EXTRACTED]
  src/components/DealershipManagementView.tsx → src/types.ts
- `ModelCatalogManagementModalProps` --references--> `PurchaseModel`  [EXTRACTED]
  src/components/ModelCatalogManagementModal.tsx → src/types.ts
- `ModelTechnicalSpecsModalProps` --references--> `PurchaseModel`  [EXTRACTED]
  src/components/ModelTechnicalSpecsModal.tsx → src/types.ts

## Import Cycles
- None detected.

## Communities (9 total, 0 thin omitted)

### Community 0 - "App Shell & Navigation"
Cohesion: 0.10
Nodes (41): DashboardView(), DashboardViewProps, DealershipManagementViewProps, Header(), HeaderProps, InventoryView(), InventoryViewProps, MontadoraDashboardView() (+33 more)

### Community 1 - "Dealer Management & Modals"
Cohesion: 0.09
Nodes (37): DealershipManagementView(), ModelCatalogManagementModal(), ModelCatalogManagementModalProps, ModelTechnicalSpecsModal(), ModelTechnicalSpecsModalProps, MonthlyCommitmentView(), MonthlyCommitmentViewProps, OrderApprovalDocumentView() (+29 more)

### Community 2 - "Build Config & Dev Dependencies"
Cohesion: 0.07
Nodes (28): autoprefixer, esbuild, vite, devDependencies, autoprefixer, esbuild, tailwindcss, tsx (+20 more)

### Community 3 - "Runtime Dependencies & Packages"
Cohesion: 0.10
Nodes (21): dotenv, express, @google/genai, lucide-react, motion, dependencies, dotenv, express (+13 more)

### Community 4 - "Hayabusa EPC Diagrams Data"
Cohesion: 0.14
Nodes (14): DIAGRAM_401A_FRAME, DIAGRAM_406A_HOLDER, DIAGRAM_407A_STAND, DIAGRAM_412A_CARRIER, DIAGRAM_415A_FOOTREST, DIAGRAM_417A_PILLION, DIAGRAM_420A_FUEL_TANK, DIAGRAM_423A_TANK_COVER (+6 more)

### Community 5 - "TypeScript Config & DOM Types"
Cohesion: 0.11
Nodes (18): DOM, DOM.Iterable, ES2022, compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules (+10 more)

### Community 6 - "Parts Catalog EPC & Cart"
Cohesion: 0.20
Nodes (15): DealershipOrderDetailModalProps, PartsCartDrawer(), PartsCartDrawerProps, PartsCatalogView(), PartsCatalogViewProps, PartsOrderMirrorModal(), PartsOrderMirrorModalProps, MOCK_HAYABUSA_DIAGRAMS (+7 more)

### Community 7 - "Exploded Diagram Components"
Cohesion: 0.21
Nodes (13): PartsDiagramCarousel(), PartsDiagramCarouselProps, PartsExplodedDiagram(), PartsExplodedDiagramProps, PartsTable(), PartsTableProps, PartsDiagramGroup, PartsItem (+5 more)

## Knowledge Gaps
- **56 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+51 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Runtime Dependencies & Packages` to `Build Config & Dev Dependencies`?**
  _High betweenness centrality (0.309) - this node is a cross-community bridge._
- **Why does `App()` connect `Runtime Dependencies & Packages` to `App Shell & Navigation`?**
  _High betweenness centrality (0.195) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _56 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Shell & Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.09696969696969697 - nodes in this community are weakly interconnected._
- **Should `Dealer Management & Modals` be split into smaller, more focused modules?**
  _Cohesion score 0.0927536231884058 - nodes in this community are weakly interconnected._
- **Should `Build Config & Dev Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `Runtime Dependencies & Packages` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._