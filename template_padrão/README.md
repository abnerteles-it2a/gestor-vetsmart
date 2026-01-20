# Template Padrão – Ecossistema Gestor

Este diretório contém o **modelo oficial de UI/UX** para todos os apps do ecossistema Gestor (Gestor Vetsmart, Gestor de Obras, Gestor Financeiro, etc).

A ideia é: sempre que você criar um novo app Gestor, use estes arquivos como base para garantir que **toda a identidade visual** (layout, cores, tipografia, ícones, botões, modais, tabelas, toasts, header, footer e sidebar) fique padronizada.

---

## Estrutura principal do template

- [AppTemplate.tsx](./AppTemplate.tsx)  
  Casca principal do app:
  - Aplica o `ToastProvider`.
  - Usa a `SidebarTemplate` fixa à esquerda.
  - Header com:
    - Título da seção (por tab).
    - Subtítulo com “Ecossistema Gestor”.
    - Bloco de usuário logado (nome + iniciais em avatar redondo).
  - Main com padding e largura máxima (`max-w-6xl`).
  - Footer padrão com marca “Gestor Template • By IT2A Ecosystem © 2026”.

- [components/SidebarTemplate.tsx](./components/SidebarTemplate.tsx)  
  Sidebar padrão de todos os apps:
  - Largura fixa `w-[260px]`, fundo `bg-slate-900`, texto `text-slate-300`.
  - Logo `logo_white.png` (mesmo asset usado nos outros apps).
  - Título “Gestor Template” e subtítulo “By IT2A Ecosystem”.
  - Menu de navegação com ícones Font Awesome e highlight azul quando ativo.
  - Botão **Sair** no rodapé da sidebar com ícone padrão.

- [components/DashboardTemplate.tsx](./components/DashboardTemplate.tsx)  
  Modelo de dashboard:
  - Primeira linha com 3 cards de KPI brancos + 1 card escuro de “Advisor de IA”.
  - Segunda linha com:
    - Card grande de “pipeline principal do app”.
    - Card de “atividades recentes”.
  - Mesma linguagem visual dos dashboards do Gestor Vetsmart e Gestor Academias.

- [components/RecordsModuleTemplate.tsx](./components/RecordsModuleTemplate.tsx)  
  Modelo oficial de módulo de cadastros:
  - Header com título, descrição e dois botões:
    - `Exportar` (secundário).
    - `Novo registro` (primário, abre modal).
  - Tabela padrão com:
    - Cabeçalho em `bg-slate-50`.
    - Linhas com `hover:bg-slate-50/50`.
    - Colunas para nome, categoria, status, responsável, data e ações.
  - Botões de ação (editar/excluir) utilizando ícones Font Awesome.

- [components/NewRecordModal.tsx](./components/NewRecordModal.tsx)  
  Modelo de modal de cadastro:
  - Overlay escuro com blur.
  - Card branco centralizado, com título, botão de fechar e conteúdo rolável.
  - Inputs com borda `border-slate-200`, radius `rounded-xl` e foco azul.
  - Rodapé com:
    - Botão **Cancelar** (secundário cinza).
    - Botão **Salvar registro** (primário azul).
  - Integração com toasts para aviso/erro/sucesso.

Este conjunto define o “esqueleto visual” mínimo que todo app Gestor deve seguir.

---

## Dependências de identidade visual

Estas configurações já existem na raiz do projeto e devem ser replicadas em qualquer novo app Gestor:

- [index.html](../index.html)  
  - Importa Tailwind via CDN.
  - Importa Font Awesome 6.
  - Importa fonte **Inter** via Google Fonts.
  - Define `body { font-family: 'Inter', sans-serif; }`.

- Pasta de logos em [public/](../public)  
  - `logo_white.png` e variações que a sidebar e outros componentes utilizam.

- Contexto de toasts em [context/ToastContext.tsx](../context/ToastContext.tsx)  
  - `ToastProvider` para envolver o app.
  - `useToast` para exibir:
    - Sucesso (verde).
    - Erro (vermelho).
    - Aviso (amarelo).
    - Info (azul).
  - Posição fixa no topo à direita, mesmo padrão visual para todos os apps.

Sempre que criar um novo app, garanta que:

1. O `index.html` tenha as mesmas importações de Tailwind, Font Awesome e Inter.  
2. A estrutura de pastas inclua `public/logo_white.png` ou outro logo com o mesmo padrão.  
3. O contexto de toasts seja copiado ou reaproveitado.

---

## Padrões visuais que devem ser clonados

### Layout geral

- Fundo padrão: `bg-slate-50`.
- App sempre em `min-h-screen`.
- Layout dividido em:
  - Sidebar fixa (esquerda).
  - Conteúdo com header fixo, main scrollável e footer.

### Header

- Altura fixa (`h-16`), fundo branco, borda inferior.
- Título com `text-lg font-bold text-slate-800`.
- Subtítulo em caixa alta, cinza claro, com `tracking-[0.16em]`.
- Bloco de usuário logado:
  - Nome e cargo à direita.
  - Avatar circular (`w-10 h-10 rounded-full`) com fundo azul claro e iniciais em azul.

### Footer

- Fundo branco, borda superior, texto centralizado.
- Texto em `text-[11px] text-slate-400 font-medium uppercase tracking-[0.16em]`.
- Formato: `NOME DO APP • By IT2A Ecosystem © ANO`.

### Sidebar

- Largura: `w-[260px]`.
- Fundo: `bg-slate-900`.
- Texto: `text-slate-300`.
- Logo branca (`logo_white.png`) + nome do app + subtítulo “Ecossistema Gestor / By IT2A Ecosystem”.
- Itens de menu:
  - Botão full width, ícone à esquerda, label à direita.
  - Estado ativo: `bg-blue-600 text-white shadow-lg`.
  - Hover: `hover:bg-slate-800 hover:text-white`.
- Botão **Sair** no rodapé, com ícone `fa-sign-out-alt`.

### Botões (padrão)

- Primário (ações principais, “Novo”, “Salvar”):
  - Fundo `bg-blue-600`.
  - Texto branco.
  - `rounded-xl`, `font-bold` ou `font-semibold`.
  - Hover: `hover:bg-blue-700`.
  - Pode possuir `shadow-md` ou `shadow-lg shadow-blue-200`.

- Secundário (cancelar, exportar, ações neutras):
  - Fundo branco.
  - Borda `border-slate-200`.
  - Texto `text-slate-600`.
  - Hover: `hover:bg-slate-50` ou `hover:bg-slate-100`.

- Ícones:
  - Usar Font Awesome (`fas`, `fa-...`).
  - Ícone à esquerda, texto à direita (`mr-2`).

### Modais

- Fundo escuro semitransparente `bg-black/50` com blur `backdrop-blur-sm`.
- Card central `bg-white`, `rounded-2xl`, `shadow-2xl`, largura máxima `max-w-lg`.
- Header do modal:
  - Título forte à esquerda.
  - Botão de fechar (`X`) à direita com `text-slate-400 hover:text-slate-600`.
- Conteúdo:
  - Padding interno (`p-6`), `space-y-4`.
  - `max-h-[70vh] overflow-y-auto` para telas menores.
- Footer:
  - Alinhado à direita, com botões Cancelar + Salvar (padrão descrito acima).

### Tabelas

- Wrapper: card branco `bg-white rounded-2xl border border-slate-100 shadow-sm`.
- Cabeçalho:
  - Linha única com `bg-slate-50`.
  - Texto em `text-slate-500 text-xs font-bold uppercase tracking-wider`.
- Linhas:
  - `tbody` com `divide-y divide-slate-50`.
  - `tr` com `hover:bg-slate-50/50 transition-all`.
- Células:
  - Padding `px-6 py-4`.
  - Títulos em `font-semibold text-slate-800`.
  - Sub-informações em `text-xs text-slate-400`.

### Badges / Status

- Status “positivo/ativo”: `bg-emerald-50 text-emerald-600`.
- Status “atenção”: `bg-amber-50 text-amber-600`.
- Status “neutro/inativo”: `bg-slate-100 text-slate-500`.
- Sempre com:
  - `px-2 py-1`.
  - `rounded-full`.
  - `text-[10px] font-bold uppercase`.

### Toasts

- Posição: topo direito (`fixed top-4 right-4`).
- Card com:
  - `rounded-xl`, `shadow-lg`, `border`, ícone à esquerda e botão de fechar à direita.
  - Cores variando por tipo (`success`, `error`, `warning`, `info`).

---

## Como criar um novo app Gestor usando este template

1. Copie a pasta `template_padrão` para o novo projeto (ou use como referência direta).  
2. Copie também, obrigatoriamente, da raiz deste repositório para o novo projeto:
   - A pasta `context/` (especialmente `context/ToastContext.tsx`, para manter o mesmo visual de toasts).
   - A pasta `public/` com as imagens (`logo_white.png` e demais variações usadas na sidebar/header).
   - O arquivo `index.html` com as importações de Tailwind, Font Awesome e fonte Inter.
3. Renomeie `AppTemplate.tsx` para `App.tsx` no novo app e ajuste:
   - Título/subtítulo do header.
   - Nome do app no footer (ex.: Gestor Financeiro, Gestor de Obras).
   - Tabs e módulos específicos do domínio.
4. Reaproveite a `SidebarTemplate` e apenas troque:
   - Nome do app.
   - Ícones e labels de menu, se necessário.
5. Use o `RecordsModuleTemplate` como base para qualquer tela de cadastro:
   - Adapte as colunas da tabela.
   - Adapte os campos do `NewRecordModal` conforme o tipo de registro (clientes, obras, lançamentos, etc.).
6. Sempre respeite:
   - As classes Tailwind definidas aqui.
   - O padrão de ícones e botões.
   - O contexto de toasts para qualquer feedback visual.

Seguindo estes arquivos e orientações, você garante que **toda a parte visual** de novos apps do ecossistema Gestor esteja completamente alinhada ao padrão já usado no Gestor Vetsmart e nos demais projetos.
