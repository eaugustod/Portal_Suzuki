---
name: portal-suzuki-theme
description: Diretrizes de temas Light/Dark mode e padronização visual do Portal Suzuki
---

# Skill: Tema Light / Dark Mode

## Padrões de Cores e Temas

O projeto utiliza um alternador global de tema em `App.tsx` via variável `isDarkMode`.

- **Dark Mode (Default):** Fundos `bg-neutral-950`, `bg-neutral-900`, textos `text-white`, `text-neutral-300`, acentos `text-amber-400`.
- **Light Mode:** Fundos `bg-slate-50`, `bg-white`, textos `text-neutral-900`, `text-neutral-700`, bordas `border-slate-200`.

Sempre utilize estilização dinâmica/condicional no JSX ao adicionar novos elementos ou visões.
