# Task: Branding and UI/UX Alignment (it2a Ecosystem)

Status: ✅ Completed
Priority: High
Owner: @frontend-specialist

## Overview
Ajustar a interface do **Gestor Vetsmart** para refletir o branding "Enterprise" do ecossistema **it2a**, utilizando como referência o projeto `gestorfinanceiro`.

## Design Goals
- **Colors**: Indigo Corporate (#4f6484) como primária, Slate Matte para fundos.
- **Typography**: Escala Executiva Compacta (clamp 12.5px - 15px).
- **Aesthetic**: "Portal Feel" com sombras sutis, Mesh Grid e micro-interações.
- **Consistency**: Paridade visual total com o ecossistema Gestor.

## Tasks

### Phase 1: Foundation (CSS & Config)
- [x] Sync `index.css` with it2a design tokens (Indigo, Slate, Typography Scale)
- [x] Add `bg-mesh-grid` and `transition-glass` utilities
- [x] Update `tailwind.config.js` if necessary (mostly handled in CSS v4)

### Phase 2: Master Layout
- [x] Update `components/Sidebar.tsx` (Colors, Branding, Hover states)
- [x] Update `App.tsx` (Header styles, Layout background)

### Phase 3: Components & Dashboard
- [x] Sync `components/Dashboard.tsx` (KPI Cards, Shadows, Spacing)
- [x] Update general button and input styles to match it2a standards

### Phase 4: Auth & Polish
- [x] Update `components/Login.tsx` layout and colors
- [x] Final visual audit and accessibility check

## Verification Criteria
- [x] Primary color is Indigo Corporate throughout the app
- [x] Typography scale is compact and legible (Executive Scale)
- [x] Dashboard cards use the new shadow system
- [x] Dark/Light mode transitions are smooth and consistent
