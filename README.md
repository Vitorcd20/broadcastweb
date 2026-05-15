# Broadcast

SaaS de disparo de mensagens agendadas com React, TypeScript e Firebase.

---

## Estrutura

```
broadcast/
├── web/                        # Frontend (Vite + React + MUI + Tailwind)
│   └── src/
│       ├── components/
│       │   ├── auth/           # LoginForm, RegisterForm
│       │   ├── connections/    # ConnectionsList, ConnectionFormDialog
│       │   ├── contacts/       # ContactsList, ContactFormDialog, CsvImportDialog
│       │   ├── dashboard/      # DashboardMetrics
│       │   ├── messages/       # MessagesList, MessageFormDialog, MessagePreviewDialog
│       │   └── shared/         # ConfirmDialog, EmptyState, PageLoader
│       ├── hooks/              # useAuth, useConnections, useContacts, useMessages
│       │                       # useMessageScheduler, useDashboardStats
│       ├── lib/                # firebase.ts, theme-provider.tsx, security.ts
│       ├── pages/              # AuthPage, DashboardPage
│       ├── services/           # auth, connections, contacts, messages, csv-import
│       └── types/              # Interfaces globais
├── functions/                  # Cloud Functions (não obrigatório — ver Scheduler)
│   └── src/index.ts
├── firebase.json
├── firestore.rules
└── firestore.indexes.json
```

---

## Pré-requisitos

- Node.js 20+
- Firebase CLI: `npm install -g firebase-tools`

---

## Configuração

### 1. Criar projeto Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um novo projeto
3. Ative **Authentication** → E-mail/Senha
4. Ative **Firestore** → modo produção

> **Obs:** Firebase Functions **não é obrigatório**. O agendamento de mensagens roda no cliente (ver seção Scheduler abaixo).

### 2. Variáveis de ambiente

```bash
cp web/.env.example web/.env
```

Preencha `web/.env` com as credenciais do seu projeto Firebase
(disponíveis em Configurações do Projeto → Seus apps → SDK):

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_GROQ_API_KEY=...
```

### 3. Instalar dependências

```bash
npm install
```

### 4. Rodar localmente

```bash
npm run dev
```

---

## Deploy (Firebase Hosting)

```bash
# Build do frontend
npm run build

# Login e seleção do projeto
firebase login
firebase use <seu-project-id>

# Deploy hosting + regras + índices
firebase deploy --only hosting,firestore
```

O Firebase disponibilizará a aplicação em:

```
https://<seu-project-id>.web.app
```

---

## Arquitetura

### SaaS e isolamento de dados

Todos os documentos no Firestore possuem o campo `userId`.
As **Firestore Security Rules** garantem que cada usuário só lê e escreve
seus próprios documentos — nenhum cliente acessa dados de outro.

### Coleções (sem subcoleções)

| Coleção       | Campos principais                                                                       |
|---------------|-----------------------------------------------------------------------------------------|
| `connections` | `userId`, `name`                                                                        |
| `contacts`    | `userId`, `connectionId`, `name`, `phone`                                               |
| `messages`    | `userId`, `connectionId`, `contactIds[]`, `content`, `status`, `scheduledAt`, `sentAt` |

### Tempo real

Todos os hooks (`useConnections`, `useContacts`, `useMessages`) usam
`onSnapshot` do Firestore, mantendo a UI sempre sincronizada.

### Scheduler (sem Cloud Functions)

O hook `useMessageScheduler` roda no cliente a cada **1 minuto**.
Busca mensagens com `status == 'scheduled'` cujo `scheduledAt` já passou
e atualiza o status para `'sent'` via `writeBatch`. Não requer plano Blaze.

### Segurança

| Camada | Implementação |
|--------|---------------|
| Isolamento de dados | `userId` em todos os documentos + Firestore Rules |
| XSS | `sanitizeField()` em todos os inputs antes de salvar |
| Validação de campos | Tamanho máximo e formato validados no service e nas Rules |
| Rate limiting | `checkRateLimit()` por operação — máx. N chamadas por minuto |
| HTTP Headers | CSP, X-Frame-Options, HSTS, X-XSS-Protection via `firebase.json` |
| Firestore Rules | Validação de tipo, tamanho e campos permitidos no servidor |

---

## Features

- ✅ Login e cadastro com Firebase Auth
- ✅ CRUD de conexões, contatos e mensagens
- ✅ Agendamento de mensagens com seleção de contatos
- ✅ Filtro de mensagens por status (todas / agendadas / enviadas)
- ✅ Mudança automática de status no horário do disparo
- ✅ Dashboard com métricas em tempo real
- ✅ Importação de contatos via CSV
- ✅ Busca e ordenação de contatos e mensagens
- ✅ Pré-visualização de mensagem por contato
- ✅ Dark mode com persistência no localStorage
- ✅ Layout responsivo (mobile, tablet e desktop)
- ✅ Proteção contra XSS, rate limiting e headers de segurança
- ✅ Inteligência artificial integrada para uma melhor experiência
- ✅ Funcionalide de troca de senha

---

## Stack

| Camada     | Tecnologia                       |
|------------|----------------------------------|
| Frontend   | React 18, TypeScript, Vite 5     |
| UI         | Material UI v5 + Tailwind CSS v3 |
| Backend    | Firebase Auth + Firestore        |
| Scheduler  | Hook client-side (sem Functions) |
| Segurança  | Firestore Rules + CSP + sanitização |
| Paradigma  | Funcional (sem classes)          |
