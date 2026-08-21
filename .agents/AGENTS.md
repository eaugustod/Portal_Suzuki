# Portal Suzuki — Regras e Contexto do Agente

## Visão Geral do Projeto

O **Portal Suzuki** é um portal web B2B construído em **React + TypeScript + Vite + TailwindCSS**,
voltado para a gestão de concessionárias, pedidos de fábrica, catálogo EPC de peças genuínas
e integração com o ERP Protheus (SQL Server).

- **Stack principal:** React 18, TypeScript, Vite 6, TailwindCSS 3, Lucide React
- **Dados:** Mock data em `src/data/` (migração para SQL Server planejada)
- **ERP:** Integração futura com Totvs Protheus via SQL Server views/queries
- **Marcas geridas:** Suzuki, Haojue, Zontes, Hisun, Kymco

---

## Regra Obrigatória: Graphify Knowledge Graph

Este projeto possui um **knowledge graph** gerado pelo graphify em `graphify-out/`.

**ANTES de qualquer tarefa sobre a arquitetura, componentes, ou relações de código:**

1. Verifique se `graphify-out/graph.json` existe
2. Se existir, use `graphify query "<pergunta>"` para buscar contexto antes de ler arquivos raw
3. Use `graphify path "<ComponenteA>" "<ComponenteB>"` para entender relações entre módulos
4. Use `graphify explain "<Conceito>"` para entender um tipo, componente ou função específica
5. Após modificar arquivos `.ts` ou `.tsx`, execute `graphify update .` para manter o grafo atualizado

```bash
# Exemplos de uso
graphify query "como funciona o fluxo de pedido de peças EPC"
graphify path "PartsCatalogView" "PartsExplodedDiagram"
graphify explain "DealershipScope"
graphify update .
```

---

## Arquitetura do Projeto

### Visões Principais (Views)
- **`DashboardView`** — Cockpit da concessionária (KPIs, pedidos recentes)
- **`MontadoraDashboardView`** — Visão exclusiva da Suzuki/Montadora
- **`PurchasePortalView`** — Portal de pedidos de motos para fábrica
- **`DealershipManagementView`** — Gestão de concessionárias da rede
- **`PartsCatalogView`** (`src/components/parts/`) — Catálogo EPC com diagrama explodido interativo
- **`InventoryView`** — Gestão de estoque da rede
- **`MonthlyCommitmentView`** — Compromissos mensais e metas
- **`SalesCrmView`** — Vendas e CRM da rede

### Componentes de Peças EPC (src/components/parts/)
- **`PartsCatalogView`** — Seleção de modelo, navegação entre diagramas, carrinho
- **`PartsExplodedDiagram`** — Diagrama interativo com hotspots clicáveis/hoverable
- **`PartsTable`** — Tabela de peças com preços, estoque, e ações de compra
- **`PartsCartDrawer`** — Carrinho lateral de peças
- **`PartsDiagramCarousel`** — Carrossel de ilustrações técnicas

### Dados (src/data/)
- **`mockPartsModels.ts`** — 33 modelos de moto (Suzuki, Haojue, Zontes, Hisun, Kymco)
  - Imagens: `https://suzukimotos.com.br/storage/images/uploads/modelos/`
- **`hayabusaDetailedDiagrams.ts`** — 77 diagramas EPC com hotspots e peças genuínas
- **`mockPartsOrders.ts`** — Pedidos mockados de peças

### Tipos Centrais (src/types.ts)
- **`DealershipScope`** — God node principal (degree 21): controla permissões e visão
- **`DealershipFullProfile`** — Perfil completo da concessionária (degree 20)
- **`PurchaseModel`** — Modelo de moto para compra (degree 12)
- **`PartsDiagramGroup`** — Grupo de diagrama EPC com hotspots e peças (degree 11)
- **`NavTab`** — Controla navegação do portal (degree 12)

---

## Convenções de Código

### Tema (Light/Dark Mode)
- O tema é controlado por `isDarkMode` state no `App.tsx`
- Sempre use classes condicionais: `isDarkMode ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900'`
- Nunca use classes hardcoded como `bg-white` ou `text-black` sem considerar o dark mode
- O toggle de tema é exibido no `Sidebar.tsx` e no `Header.tsx`

### Componentes
- Props tipadas com interfaces TypeScript sempre
- Componentes funcionais com `React.FC<Props>`
- Estados locais com `useState`, sem Context API (projeto simples)
- Ícones: usar apenas `lucide-react`

### Hotspots no Diagrama EPC
- Cada hotspot tem um `id` único (ex: `hs-401-3a`, `hs-401-3b`) e um `ref` (número da peça)
- A mesma REF pode ter múltiplos hotspots em posições diferentes no diagrama
- O tooltip/popover usa `hoveredHotspotId` (id exato) para garantir apenas 1 card por hover
- Nunca usar `hoveredRef` (ref do número) para controlar visibilidade do popover — isso causa duplicatas

### Imagens dos Modelos
- Base URL: `https://suzukimotos.com.br/storage/images/uploads/modelos/`
- Definidas em `src/data/mockPartsModels.ts` com constante `BASE_IMG`
- Não usar Unsplash ou imagens genéricas para modelos de moto

---

## Padrões de Integração Futura (SQL Server / Protheus)

### Banco de Dados Planejado
- SQL Server dedicado para o Portal Suzuki
- Views de integração com banco do ERP Protheus (tabelas SA1, SB1, SC5, SC6, etc.)
- Conectividade via API REST (Node.js/Express) com pool de conexão `mssql`

### Tabelas Principais Planejadas
- `portal.Concessionarias` — Cadastro de dealers
- `portal.PedidosFabrica` — Pedidos de motos para fábrica
- `portal.PedidosPecas` — Pedidos do catálogo EPC
- `portal.EstoqueRede` — Estoque consolidado da rede
- Views: `vw_ClientesProtheus`, `vw_ProdutosProtheus`, `vw_PedidosProtheus`

---

## Git e Deploy

- Repositório: `github.com/eaugustod/Portal_Suzuki`
- Branch principal: `main`
- Após mudanças significativas, sempre executar: `git add -A && git commit -m "..." && git push`
- Atualizar graphify após mudanças de código: `graphify update .`
