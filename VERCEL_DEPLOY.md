# Guia de Implantação Fullstack na Vercel

Este guia descreve o processo para implantar o **Gestor Vetsmart** completo (Frontend + Backend) na Vercel.

## Visão Geral

O projeto foi configurado como um monorepo híbrido:
- **Frontend:** React + Vite (SPA)
- **Backend:** Express (Serverless Function via `api/`)

Quando implantado na Vercel:
- Rotas `/api/*` serão processadas pelo Backend (Express).
- Todas as outras rotas serão servidas pelo Frontend.

## Pré-requisitos

1. Conta na [Vercel](https://vercel.com).
2. Conta no GitHub.
3. Banco de Dados PostgreSQL (Recomendado: Vercel Postgres, Neon ou Supabase).

## Passo a Passo

### 1. Configurar Banco de Dados (PostgreSQL)

Antes do deploy, você precisa de um banco de dados acessível publicamente.

1. Crie um banco Postgres (ex: no painel da Vercel em "Storage" -> "Postgres").
2. Obtenha a string de conexão (`postgres://user:password@host:port/database?sslmode=require`).
3. Salve essa string para usar como variável de ambiente `DATABASE_URL`.

### 2. Importar Projeto na Vercel

1. Acesse o dashboard da Vercel e clique em **"Add New..."** -> **"Project"**.
2. Selecione o repositório `gestor-vetsmart`.
3. A Vercel detectará automaticamente o framework `Vite`.
4. Mantenha as configurações de build padrão (`npm run build`, `dist`).

### 3. Variáveis de Ambiente

Configure as seguintes variáveis no painel da Vercel (Settings -> Environment Variables):

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | Conexão com o Postgres | `postgres://...` |
| `JWT_SECRET` | Segredo para tokens de autenticação | `sua-chave-secreta-forte` |
| `GOOGLE_CLOUD_PROJECT` | ID do projeto Google Cloud (para IA) | `meu-projeto-id` |
| `GOOGLE_CREDENTIALS_JSON` | Conteúdo do JSON da Service Account (Google Cloud) | `{ "type": "service_account", ... }` |
| `GOOGLE_VERTEX_LOCATION` | Região da Vertex AI | `us-central1` |

> **Dica:** Para `GOOGLE_CREDENTIALS_JSON`, remova quebras de linha se possível, ou cole o conteúdo completo do arquivo JSON.

### 4. Deploy

1. Clique em **"Deploy"**.
2. A Vercel irá:
   - Instalar dependências (Frontend e Backend unificados na raiz).
   - Construir o Frontend.
   - Criar as Serverless Functions para o Backend em `/api`.

### 5. Validação Pós-Deploy

1. Acesse a URL do projeto (ex: `https://gestor-vetsmart.vercel.app`).
2. Tente fazer Login. O frontend tentará conectar em `/api/login`.
   - Se o banco estiver configurado e as tabelas criadas (o backend tenta criar tabelas ao iniciar), funcionará.
3. Se o backend falhar (erro 500 ou timeout), o frontend usará o **Modo Fallback (Mock)** automaticamente, permitindo testar a interface mesmo sem banco.

## Solução de Problemas

- **Erro de Conexão com Banco:** Verifique se `DATABASE_URL` está correto e se o banco aceita conexões SSL (o backend força SSL em produção).
- **Dependências:** Todas as dependências do backend foram adicionadas ao `package.json` da raiz para garantir que a Vercel as encontre.
- **Logs:** Use a aba "Logs" no dashboard da Vercel para ver erros do backend (filtros: "Functions").
