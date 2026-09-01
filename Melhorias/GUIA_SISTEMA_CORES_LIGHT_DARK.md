# Guia do Sistema de Cores & Alternância Light / Dark Mode (SuzukiDealerHub)

Este documento contém a **especificação completa do sistema de cores**, **tokens de design**, **regras de alternância Light/Dark Mode** e **combinações de componentes** utilizadas no **SuzukiDealerHub**. 

Você pode copiar e colar este arquivo `.md` diretamente em outro projeto React/TailwindCSS para replicar com precisão idêntica a identidade visual, contraste e alternância de temas.

---

## 1. Configuração do Tailwind CSS (`tailwind.config.js`)

Para garantir as cores institucionais da marca, adicione a extensão de cores no seu arquivo de configuração do Tailwind CSS:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Habilita a alternância de modo escuro via classe 'dark' no elemento raiz
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        suzuki: {
          blue: '#003399',  // Azul Institucional Suzuki
          red: '#E2001A',   // Vermelho Institucional Suzuki / JTA
          dark: '#0b1120'   // Tom escuro profundo para overlays/fundo
        }
      }
    },
  },
  plugins: [],
}
```

---

## 2. Estilos Globais e Scrollbar (`src/index.css`)

Adicione ao seu arquivo CSS principal para padronizar a seleção de texto e a barra de rolagem customizada em ambos os temas:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    /* Cor de seleção de texto padronizada */
    @apply selection:bg-blue-600 selection:text-white;
  }
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.4); /* slate-400 com 40% opacidade */
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.7); /* slate-500 com 70% opacidade */
}
```

---

## 3. Mecanismo de Alternância do Tema (Light / Dark Mode)

O tema é controlado por um estado booleano (`isDarkMode`) no nível raiz da aplicação ou via Context API/Redux/Zustand. A classe CSS `dark` deve ser aplicada condicionalmente no container pai principal (`<div className="...">` ou `<html>`/`<body>`).

### Exemplo de Estrutura do App (`App.tsx`)

```tsx
import React, { useState } from 'react';

export const App = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  return (
    <div className={`min-h-screen flex transition-colors duration-200 ${
      isDarkMode 
        ? 'dark bg-neutral-950 text-slate-100' 
        : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Conteúdo da aplicação */}
    </div>
  );
};
```

---

## 4. Matriz Comparativa de Cores: Modo Claro vs Modo Escuro

| Elemento / Seção | Modo Claro (Light Mode) | Modo Escuro (Dark Mode) | Código Hex / Equivalência Tailwind |
| :--- | :--- | :--- | :--- |
| **Fundo Principal (Root)** | `bg-slate-50` | `bg-neutral-950` | `#f8fafc` vs `#0a0a0a` |
| **Texto Base Principal** | `text-slate-900` | `text-slate-100` | `#0f172a` vs `#f1f5f9` |
| **Superfície Sidebar / Header**| `bg-white` | `bg-neutral-900` | `#ffffff` vs `#171717` |
| **Bordas Estruturais** | `border-slate-200` | `dark:border-neutral-800` | `#e2e8f0` vs `#262626` |
| **Cards & Painéis Principais**| `bg-white border-slate-200 shadow-sm` | `bg-neutral-900 border-neutral-800` | Superfície elevada com borda suave |
| **Sub-painéis / Linhas Tabela**| `bg-slate-50 border-slate-100` | `bg-neutral-800/60 border-neutral-800` | Linhas zebradas / containers internos |
| **Texto Primário (Títulos)** | `text-slate-900` | `dark:text-white` | Maior contraste para legibilidade |
| **Texto Secundário (Subtítulos)**| `text-slate-600` / `text-slate-700` | `dark:text-slate-300` / `dark:text-slate-200` | Leitura intermediária |
| **Texto Terciário / Muted** | `text-slate-400` / `text-slate-500` | `dark:text-slate-400` / `dark:text-neutral-500` | Captions e metadados |

---

## 5. Mapeamento de Componentes & Interatividade

### A. Sidebar & Menu de Navegação

- **Logo Gradient Badge:** `bg-gradient-to-tr from-blue-700 to-red-600 text-white shadow-md shadow-blue-500/20`
- **Destaque do Título:** `Suzuki` (`text-slate-900 dark:text-white`), `DealerHub` (`text-red-600 dark:text-red-500`)
- **Item de Menu Ativo:** `bg-blue-600 text-white shadow-sm shadow-blue-600/30`
- **Item de Menu Inativo:** 
  - Normal: `text-slate-600 dark:text-slate-300`
  - Hover: `hover:bg-slate-100 dark:hover:bg-neutral-800/80 hover:text-slate-900 dark:hover:text-white`
- **Botão Alternador de Tema:**
  - Normal: `border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300`
  - Hover: `hover:bg-slate-100 dark:hover:bg-neutral-800`
  - Ícone Sol (Dark): `text-amber-400`
  - Ícone Lua (Light): `text-slate-600`

### B. Header & Inputs de Busca

- **Campo de Busca (`<input>`):**
  - Light: `bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white`
  - Dark: `bg-neutral-800 border-neutral-700 text-white placeholder-slate-400 focus:border-blue-500`
- **Seletor de Empresa (Pill Selector):**
  - Base Container: `bg-slate-100 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700`
  - Opção Selecionada (Consolidado): `bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900`
  - Opção Selecionada (JTA 01): `bg-blue-600 text-white`
  - Opção Selecionada (JTZ 10): `bg-red-600 text-white`
  - Opção Inativa: `text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white`

### C. Cards de KPI e Métricas Executivas

Cada card de KPI utiliza um ícone com container translúcido para identificação de categoria:

```tsx
/* Card de KPI Padrão */
<div className={`p-5 rounded-2xl border transition-all ${
  isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200 shadow-sm'
}`}>
  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase mb-2">
    <span>Faturamento Realizado</span>
    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
      <TrendingUp className="w-4 h-4" />
    </div>
  </div>
  <p className="text-2xl font-black text-slate-900 dark:text-white">540 motos</p>
</div>
```

#### Paleta de Acentos de KPI:
- **Azul (Vendas / Estoque):** Icon bg `bg-blue-500/10`, Text `text-blue-600 dark:text-blue-400`
- **Verde / Esmeralda (Bônus / Faturamento / Concluído):** Icon bg `bg-emerald-500/10`, Text `text-emerald-600 dark:text-emerald-400`
- **Âmbar / Amarelo (Pendente / Bloqueio BIN / Análise):** Icon bg `bg-amber-500/10`, Text `text-amber-600 dark:text-amber-400`
- **Roxo (Locadoras / Frotas):** Icon bg `bg-purple-500/10`, Text `text-purple-600 dark:text-purple-400`
- **Vermelho (Empresa / Erro / Bloqueado):** Icon bg `bg-red-500/10`, Text `text-red-600 dark:text-red-400`
- **Índigo (Metas 100%):** Icon bg `bg-indigo-500/10`, Text `text-indigo-600 dark:text-indigo-400`

---

## 6. Badges de Status, Progresso e Tabelas

### Badges de Status

| Status | Estilização Light Mode | Estilização Dark Mode |
| :--- | :--- | :--- |
| **Liberado / Sucesso / Ativo** | `bg-emerald-100 text-emerald-700` | `dark:bg-emerald-950 dark:text-emerald-400` |
| **Aviso / Bloqueado BIN / Análise** | `bg-amber-100 text-amber-700` | `dark:bg-amber-950 dark:text-amber-400` |
| **Erro / Reprovado / Cancelado** | `bg-red-100 text-red-700` | `dark:bg-red-950 dark:text-red-400` |
| **Informativo / Marca / Protheus** | `bg-blue-100 text-blue-700` | `dark:bg-blue-950 dark:text-blue-400` |
| **Locadora / Categoria Especial** | `bg-purple-100 text-purple-700` | `dark:bg-purple-950 dark:text-purple-400` |
| **Consórcio / Categoria Secundária** | `bg-indigo-100 text-indigo-700` | `dark:bg-indigo-950 dark:text-indigo-400` |

### Barras de Progresso e Gradientes

- **Progresso Concluído (≥ 100%):** `bg-emerald-500`
- **Progresso Regular (80% a 99%):** `bg-blue-500`
- **Progresso Inicial (< 80%):** `bg-amber-500`
- **Gradiente de Produção Ativa:** `bg-gradient-to-r from-emerald-500 to-teal-400`
- **Trilhos/Track da Barra de Progresso:** `bg-slate-100 dark:bg-neutral-800` ou `bg-slate-200 dark:bg-neutral-700`

### Linhas e Divisores de Tabela

- **Cabeçalho de Tabela:** `border-b border-slate-100 dark:border-neutral-800 text-slate-400`
- **Divisor de Linhas Body:** `divide-y divide-slate-100 dark:divide-neutral-800/60`
- **Hover na Linha de Tabela:** `hover:bg-slate-50 dark:hover:bg-neutral-800/50`
- **Linha Selecionada/Ativa:** `bg-blue-50/50 dark:bg-blue-950/30`

---

## 7. Resumo Rápido de Injeção de Código

Se você precisa apenas copiar os valores Hex diretos para CSS clássico ou CSS Variables:

```css
:root {
  /* Marca */
  --suzuki-blue: #003399;
  --suzuki-red: #E2001A;
  --suzuki-dark: #0b1120;

  /* Modo Claro */
  --bg-main: #f8fafc;
  --bg-surface: #ffffff;
  --bg-subsurface: #f1f5f9;
  --border-color: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;
}

.dark {
  /* Modo Escuro */
  --bg-main: #0a0a0a;
  --bg-surface: #171717;
  --bg-subsurface: #262626;
  --border-color: #262626;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
}
```

---

*Arquivo gerado a partir da análise da arquitetura visual do SuzukiDealerHub.*
