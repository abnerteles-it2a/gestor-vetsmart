# 🐾 Gestor VetPro

> Sistema Inteligente de Gestão Veterinária com IA integrada.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.x-cyan)
![Tailwind](https://img.shields.io/badge/tailwind-3.x-38bdf8)
![Status](https://img.shields.io/badge/status-MVP%20Complete-green)

O **Gestor VetPro** é uma solução completa para clínicas veterinárias, integrando gestão de pacientes, agendamentos, financeiro e estoque com recursos avançados de Inteligência Artificial para auxílio diagnóstico e previsão de demanda.

---

## 🚀 Funcionalidades Principais

### 🧠 Inteligência Artificial (Veterinary AI)
- **Assistente Clínico**: Gera rascunhos de prontuários baseados em notas breves.
- **Planos de Cuidado**: Cria cronogramas personalizados de vacinação e check-ups.
- **Previsão de Estoque**: Alerta sobre itens críticos antes que acabem.

### 🏥 Gestão Clínica
- **Prontuário Eletrônico**: Histórico completo do pet.
- **Agenda Inteligente**: Visualização clara de compromissos e status.
- **Telemedicina**: Módulo integrado para consultas remotas.

### 💼 Gestão Administrativa
- **Dashboard Executivo**: KPIs em tempo real (Faturamento, Novos Clientes, NPS).
- **Controle de Estoque**: Gestão de produtos, validade e fornecedores.
- **Frente de Caixa (PDV)**: Registro rápido de vendas e serviços.

### 📱 Experiência do Usuário
- **App do Tutor (PWA)**: Interface mobile para tutores acompanharem seus pets.
- **Modo Escuro**: Suporte nativo a temas claro e escuro.
- **Responsividade**: Funciona em desktops, tablets e celulares.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React.js, TypeScript, Vite
- **Estilização**: Tailwind CSS
- **Ícones**: FontAwesome
- **Gerenciamento de Estado**: Context API (Auth, Toast)
- **Dados**: MockDataService (Simulação de Backend em Memória)
- **IA**: Integração com Google Gemini (Vertex AI simulation)

---

## ⚡ Como Executar

### Pré-requisitos
- Node.js (v16 ou superior)

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/gestor-vetsmart.git
   cd gestor-vetpro
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure a IA (Opcional)**
   - Crie um arquivo `.env.local` na raiz.
   - Adicione sua chave: `VITE_GEMINI_API_KEY=sua_chave_aqui`.
   - *Nota: O sistema funciona em modo de fallback (simulação) sem a chave.*

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**
   - Abra `http://localhost:3020` (ou a porta indicada no terminal).
   - **Login de Demonstração**:
     - Email: `admin@vetpro.com` (ou qualquer email)
     - Senha: `admin` (ou qualquer senha)

---

## 📂 Estrutura do Projeto

```
/src
  ├── components/       # Módulos do sistema (Agenda, Clinical, Sales, etc.)
  ├── context/          # Gerenciamento de estado global (Auth, Toast)
  ├── services/         # Camada de serviços (API Mock, Gemini)
  ├── App.tsx           # Componente raiz e roteamento
  └── main.tsx          # Ponto de entrada
```

## 📝 Status do Projeto
