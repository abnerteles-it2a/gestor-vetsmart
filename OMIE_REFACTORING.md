# OMIE UI REFACTORING — Gestor VetPro
> Documento de referência para replicar fielmente o padrão visual Omie ERP no Gestor VetPro.
> Atualizado: 2026-05-13

---

## 1. SISTEMA DE CORES

### Paleta Base Omie (tokens CSS em `index.css`)
```
--color-omie-midnight: #001e2c   → Topbar background
--color-omie-sidebar:  #020617   → Sidebar background (quase preto)
--color-omie-orange:   #FF9F1C   → Primary action / accent
--color-omie-blue:     #00B4D8   → Secondary accent
--color-omie-bg:       #F4F7F9   → Content area background
--color-omie-border:   #E0E7EF   → Card borders
--color-omie-text:     #1A1A2E   → Primary text
--color-omie-muted:    #64748b   → Muted/secondary text
```

### Cores de Status
```
Sucesso:   #10B981 (emerald-500)
Erro:      #EF4444 (rose-500)
Alerta:    #FF9F1C (orange)
Info:      #00B4D8 (blue)
Neutro:    #94A3B8 (slate-400)
```

### Cores por Módulo (HomeModule + Sidebar ativa)
```
dashboard:       #1565C0  (azul escuro)
agenda:          #6A1B9A  (roxo)
patients:        #C2185B  (rosa/magenta)
clinical:        #00695C  (verde escuro)
hospitalization: #B71C1C  (vermelho)
surgery:         #4527A0  (índigo escuro)
telemedicine:    #00838F  (ciano escuro)
advanced-ai:     #1A237E  (azul marinha)
inventory:       #0097A7  (ciano)
sales:           #E65100  (laranja escuro)
campaigns:       #FF8F00  (âmbar)
financial:       #2E7D32  (verde)
plans:           #D81B60  (rosa)
reports:         #37474F  (cinza azulado)
tutor-app:       #020617  (quase preto)
calculator:      #3949AB  (indigo)
```

---

## 2. TIPOGRAFIA

### Fonte Principal
```css
font-family: 'Inter', -apple-system, sans-serif;
-webkit-font-smoothing: antialiased;
```

### Escala Tipográfica (Enterprise High-Density)
```
html base: clamp(12.5px, 0.45vw + 8.5px, 15px)  /* fluid */

Label caps:     9-10px, font-black (900), UPPERCASE, tracking-[0.1em]
Data primary:   tabular-nums, font-semibold, tracking-tight
KPI value:      text-xl/2xl, font-black, UPPERCASE, tracking-tight
Section title:  text-[11px], font-black, UPPERCASE, tracking-[0.2em]
Body text:      text-xs/sm, font-medium, text-slate-500
Table header:   10px, font-black, UPPERCASE, tracking-widest
Table cell:     text-sm, font-medium, color #020617, tabular-nums
Button text:    11px, font-black, UPPERCASE, tracking-widest
```

---

## 3. ESTRUTURA DE LAYOUT

### Shell Geral
```
┌─────────────────────────────────────────────┐
│  TOPBAR (height: 48px, bg: #001e2c)         │
├────────────────────────────────────────────-│
│         │  MODULE BAR (height: 40px)         │
│ SIDEBAR │──────────────────────────────────  │
│  60px   │  MAIN CONTENT (bg: #F4F7F9)        │
│ #020617 │  padding: 32px (p-8)               │
│         │                                    │
└─────────────────────────────────────────────┘
```

### Regras de Layout
- **Home** (`activeTab === 'home'`): sem sidebar, sem module bar, p-0
- **Todos os outros módulos**: sidebar visível, module bar visível, p-8

---

## 4. TOPBAR

### Especificações
```
height:      48px (h-12 via class omie-topbar)
background:  #001e2c
z-index:     1000
padding:     0 16px
```

### Elementos Left
```
Logo "omie":    font-size 14px, font-black, tracking-tighter, color white
Separator:      border-right white/10
User name:      10px, font-bold, UPPERCASE, tracking-widest, white/90
Badge "(TRIAL)": 8px, font-black, UPPERCASE, white/30
```

### Elementos Right (ícones)
```
Ícones:        font-size 16px, color white/50, hover → white
Gap:           24px entre ícones
Ticket icon:   color #FF9F1C (destaque)
Badge ticket:  bg #FF9F1C, text #020617, 7px, font-black, w-3.5 h-3.5, rounded-full
Avatar:        w-7 h-7, rounded-full, bg white/10, border white/10
```

---

## 5. SIDEBAR

### Especificações
```css
.omie-sidebar {
  width: 60px;
  background: #020617;
  flex-direction: column;
  height: 100%;
  z-index: 500;
}
```

### Item Normal
```css
.omie-sidebar-item {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.5);
  flex-direction: column;
  gap: 4px;
}
icon-size: 18px
label: 7px, font-black (900), UPPERCASE, opacity 0.6
```

### Estados
```
hover:  bg rgba(255,255,255,0.05), color white
active: bg #FF9F1C, color white
```

### Topo da Sidebar
```
Header area: h-12, border-b white/5, ícone fa-bars, white/40
```

### Item Logout (bottom)
```
height: 64px (h-16)
border-t: white/5
icon: fa-power-off, color rose-500
```

---

## 6. MODULE BAR (Barra de Abas dos Módulos)

### Especificações
```css
.omie-module-bar {
  height: 40px;
  background: white;
  border-bottom: 2px solid #FF9F1C;  /* SEMPRE laranja */
  padding: 0 16px;
  z-index: 900;
}
```

### Tab Ativa
```css
.omie-module-tab {
  height: 100%;
  padding: 0 16px;
  background: #FF9F1C;         /* cor laranja padrão */
  color: white;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 4px 4px 0 0;
}
```

> **PENDÊNCIA DE REFATORAÇÃO**: A tab deve usar a COR DO MÓDULO (`getModuleColor()`)
> em vez de sempre ser laranja. Cada módulo tem sua própria cor definida em App.tsx.

### Como deve ficar:
```tsx
// Tab deve herdar a cor do módulo ativo
<div
  className="omie-module-tab"
  style={{ background: getModuleColor() }}
>
  {getTitle()}
</div>
```

---

## 7. KPI CARDS

### Estrutura Atual (`KpiCard.tsx`)
```
omie-card + border-l-[6px] (accent left border com a cor do módulo)
padding: p-5
layout: flex justify-between items-center
hover: shadow-lg, transition 300ms
```

### Especificações Visuais
```
Left section:
  - Title: 10px, font-black, UPPERCASE, tracking-[0.2em], slate-400
  - Value: text-xl, font-black, #020617, tracking-tight, UPPERCASE
  - Subtext: 9px, font-black, UPPERCASE, tracking-widest, cor variável

Right section (icon box):
  - Size: w-12 h-12
  - Background: bg-slate-50
  - Border: border border-slate-100
  - Border-radius: rounded-xl
  - Shadow: shadow-inner
  - Icon: scale-125, opacity-30 → scale-110 opacity-100 on group hover
```

---

## 8. CARDS GENÉRICOS

```css
.omie-card {
  background: white;
  border: 1px solid #E0E7EF;
  border-radius: 12px (rounded-xl);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  overflow: hidden;
}

.omie-card-header {
  padding: 20px 24px (px-5 py-4);
  border-bottom: 1px solid #E0E7EF;
  background: rgba(248,250,252,0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

---

## 9. TABELAS

```css
.omie-table-container {
  background: white;
  border: 1px solid #E0E7EF;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

thead tr:
  background: white
  border-bottom: 1px solid #F1F5F9

th:
  padding: 16px 24px
  font-size: 10px
  font-weight: 900 (black)
  color: slate-400
  UPPERCASE
  letter-spacing: widest
  whitespace: nowrap
  decorators: ::before "« ", ::after " »" (opacity 30%)

tbody tr:
  border-bottom: 1px solid #F8FAFC
  hover: background #F8FAFC/50
  transition: colors

td:
  padding: 16px 24px
  font-size: text-sm
  font-weight: 500 (medium)
  color: #020617
  tabular-nums

.omie-table-summary (footer):
  background: slate-50/50
  padding: 12px 24px
  border-top: 1px solid #F1F5F9
  justify-content: flex-end
  gap: 40px
```

---

## 10. MODAIS

```css
.omie-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(2,6,23,0.4);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.4s ease-out;
}

.omie-modal-content {
  background: white;
  border-radius: 16px (rounded-2xl);
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  width: 100%;
  max-width: 56rem (max-w-4xl);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: portalEnter 0.3s cubic-bezier(0.4,0,0.2,1);
}

.omie-modal-header:
  padding: 32px (p-8)
  border-bottom: 1px solid #F1F5F9
  flex justify-between items-center

.omie-modal-title:
  font-size: text-2xl
  font-weight: black
  color: #FF9F1C
  UPPERCASE
  tracking-tight

.omie-modal-body:
  padding: 40px (p-10)
  overflow-y: auto

.omie-modal-footer:
  padding: 32px (p-8)
  border-top: 1px solid #F1F5F9
  background: slate-50/50
  justify-content: flex-end
  gap: 16px
```

---

## 11. BOTÕES

### Primary
```css
.omie-btn-primary {
  padding: 10px 32px;
  font-size: 11px;
  font-weight: 900;
  UPPERCASE;
  letter-spacing: widest;
  color: white;
  background: #FF9F1C;
  border-radius: 9999px (rounded-full);
  box-shadow: md;
  border: none;
  cursor: pointer;
  transition: all;
}
hover: background #f39200
```

### Secondary
```css
.omie-btn-secondary {
  padding: 10px 32px;
  font-size: 11px;
  font-weight: 900;
  UPPERCASE;
  color: #FF9F1C;
  background: white;
  border: 1px solid #FF9F1C;
  border-radius: 9999px;
  hover: background orange-50;
}
```

---

## 12. FORMULÁRIOS / INPUTS

```css
.omie-input {
  width: 100%;
  padding: 12px 20px;
  border-radius: 12px (rounded-xl);
  border: 1px solid slate-200;
  background: white;
  color: slate-700;
  font-size: text-sm;
  outline: none;
  focus: ring-2 ring-[#FF9F1C]/20, border-[#FF9F1C];
  transition: all;
}

.omie-label {
  display: block;
  font-size: 10px;
  font-weight: 900;
  color: slate-400;
  UPPERCASE;
  margin-bottom: 8px;
  letter-spacing: widest;
}
```

---

## 13. HOME / LAUNCHPAD

### Container
```
background-image: foto veterinária (Unsplash)
background-size: cover
background-position: center
height: 100%
padding: 40px
```

### Overlay gradiente
```
background: linear-gradient(to right, rgba(2,6,23,0.95) 30%, rgba(2,6,23,0.4) 100%)
```

### Grid de Módulos
```
display: grid
grid-template-columns: repeat(auto-fill, minmax(130px, 1fr))
grid-auto-rows: 130px
gap: 12px
```

### Card de Módulo
```
background: cor do módulo (ver seção 1)
border-radius: 12px
padding: 20px
cursor: pointer
border: 1px solid rgba(255,255,255,0.1)
box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1)
transition: all 0.3s cubic-bezier(0.4,0,0.2,1)

large modules (size='large'): grid-column span 2

icon: 28px, white, opacity 0.9
      hover: scale-110 (group-hover)

label: 11px, font-black (900), white, UPPERCASE, letter-spacing 0.08em
       position: bottom
```

### Promo Card (direita)
```
width: 320px
background: rgba(255,255,255,0.03)
backdrop-filter: blur(10px)
border: 1px solid rgba(255,255,255,0.1)
border-radius: 16px
padding: 32px
```

---

## 14. ABAS INTERNAS (sub-tabs dos módulos)

### Padrão "Pill" (FinancialModule, etc.)
```
container: omie-card p-1, flex, bg-white
tab normal:  flex-1, py-3.5, rounded-lg, text-slate-400, hover: text-slate-600
tab ativa:   bg-[#020617], text-[#FF9F1C], shadow-lg
icon:        text-sm, fa-*
label:       11px, font-black, UPPERCASE, tracking-widest
```

### Padrão "Underline" (PatientsModule - prontuário)
```
container: flex, border-b border-slate-50, px-10, gap-8, bg-white
tab normal:  py-6, 11px, font-black, UPPERCASE, tracking-widest
             border-b-2 border-transparent, text-slate-300
             hover: text-slate-500
tab ativa:   border-b-2 border-[#FF9F1C], text-[#020617]
```

---

## 15. ANIMAÇÕES

```css
@keyframes fadeIn {
  from: opacity 0, translateY(10px)
  to:   opacity 1, translateY(0)
  duration: 0.4s ease-out
}

@keyframes portalEnter {
  from: opacity 0, scale(0.98)
  to:   opacity 1, scale(1)
  duration: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
}

.animate-fade-in      → módulos ao aparecer
.animate-portal-enter → transições de módulo/modal
```

---

## 16. SCROLLBAR CUSTOMIZADA

```css
/* Aplicar com: className="custom-scrollbar" */
::-webkit-scrollbar        { width: 6px; height: 6px }
::-webkit-scrollbar-track  { background: transparent }
::-webkit-scrollbar-thumb  { background: rgba(0,0,0,0.1); border-radius: 10px }
::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2) }
```

---

## 17. PADRÕES ESPECIAIS — CARD ESCURO (Dark Card)

Usado em: Dashboard status operacional, AI cards, prontuário do paciente.

```
background: #020617
border: none
text: white
accent: #FF9F1C
blob decorativo: w-32 h-32, bg-[#FF9F1C]/10, rounded-full, blur-[80px]
                 position: absolute, -mr-16 -mt-16 (canto superior direito)
```

---

## 18. PENDÊNCIAS DE REFATORAÇÃO

### P0 — ✅ Resolvido (module-tab com cor do módulo)
```
SOLUÇÃO: style={{ background: getModuleColor() }} em App.tsx
```

### P1 — ✅ Resolvido (sidebar item com cor do módulo ativo)
```
SOLUÇÃO: moduleColor prop aplicada via style no Sidebar.tsx
```

### P2 — ✅ Resolvido (breadcrumb no module bar)
```
SOLUÇÃO: window.__setModuleBreadcrumb() chamado em cada módulo
         Agenda, Sales, Inventory, Hospitalization, Surgery, Clinical,
         Financial, Reports já implementados
```

### P3 — ✅ Resolvido (KPI com cor de módulo)
```
SOLUÇÃO: Cada módulo define MODULE_COLOR e passa color={MODULE_COLOR}
         para seus KpiCards. Sales corrigido (#E65100).
```

### P4 — ✅ Resolvido (sub-tabs com cor de módulo)
```
SOLUÇÃO: AgendaModule usa style={{ background: MODULE_COLOR }} nas tabs
         FinancialModule usa MODULE_COLOR nas tabs
         SurgeryModule usa MODULE_COLOR no border-b das tabs
```

---

## 19. MAPA DE COMPONENTES vs ARQUIVO

| Componente            | Arquivo                        | Status        |
|-----------------------|-------------------------------|---------------|
| Shell / Layout        | `App.tsx`                     | ✅ Feito      |
| Topbar                | `App.tsx` (inline)            | ✅ Feito      |
| Sidebar               | `Sidebar.tsx`                 | ✅ Feito      |
| Module Tab Bar        | `App.tsx` (inline)            | ✅ Cor do módulo |
| Home Launchpad        | `HomeModule.tsx`              | ✅ Feito      |
| KPI Card              | `KpiCard.tsx`                 | ✅ Feito      |
| Dashboard             | `Dashboard.tsx`               | ✅ Feito      |
| Financeiro            | `FinancialModule.tsx`         | ✅ Feito      |
| Pacientes             | `PatientsModule.tsx`          | ✅ Feito      |
| Agenda                | `AgendaModule.tsx`            | ✅ Feito      |
| Clínica               | `ClinicalModule.tsx`          | ✅ Feito      |
| Internação            | `HospitalizationModule.tsx`   | ✅ Feito      |
| Cirurgia              | `SurgeryModule.tsx`           | ✅ Feito      |
| Estoque               | `InventoryModule.tsx`         | ✅ Feito      |
| Vendas                | `SalesModule.tsx`             | ✅ Feito      |
| Global CSS            | `index.css`                   | ✅ Feito      |

---

## 20. CHECKLIST DE IMPLEMENTAÇÃO (por módulo)

Para cada módulo garantir:
- [x] Header com h1 label (11px, slate-400) + h2 título (2xl, black, #020617)
- [x] Botão de ação primário no header (omie-btn-primary)
- [x] Conteúdo em omie-card com padding p-8 ou p-10
- [x] Tabelas usando omie-table + omie-table-container
- [x] Modais usando omie-modal-overlay + omie-modal-content
- [x] Sub-tabs com padrão (cor do módulo via style)
- [x] animate-portal-enter na div raiz do módulo
- [x] Cor do módulo aplicada no module-tab e sidebar item ativo
- [x] Breadcrumb via window.__setModuleBreadcrumb() em todos os módulos

---

## 22. FIXES REALIZADOS — BACKEND & TYPESCRIPT

### Autenticação (2026-05-13)
```
PROBLEMA: Login com admin@vetsmart.com falhava
CAUSA:    ensureSchema criava usuário com email 'admin@vetpro.com'
SOLUÇÃO: Corrigido em server.js linha 501 + upsert no banco via upsert-admin.mjs
CREDENCIAIS: admin@vetsmart.com / 123456
```

### Rotas Backend Adicionadas
```
GET /api/medications?search=<term>  → Bulário veterinário (15 meds seed)
GET /api/search?query=<term>        → Busca global: pets + tutores + produtos
```

### Tabela medications (Neon)
```sql
CREATE TABLE medications (
  id, name, active_ingredient, category,
  concentration_mg_ml, dosage_mg_kg_dog, dosage_mg_kg_cat,
  notes, created_at
);
-- 15 medicamentos seed inseridos
```

### Erros TypeScript corrigidos
```
TS2339 - apiService.globalSearch     → Adicionado em api.ts
TS2339 - apiService.getMedications   → Adicionado em api.ts
TS2339 - import.meta.env             → Adicionado: /// <reference types="vite/client" />
TS2741 - Surgery.room missing        → Adicionado room: s.room || 'Sala 1'
TS2304 - handleQuickAction not found → Função definida em TutorApp.tsx
```

### Login Demo Button
```
Login.tsx: Botão "Demo: admin@vetsmart.com / 123456"
Ao clicar: preenche email + senha automaticamente
```
