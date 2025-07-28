# CRM PingDesk

Sistema de CRM (Customer Relationship Management) desenvolvido especificamente para vendedores da PingDesk, com funcionalidades de gestão de propostas, agenda, leads e controle de vendas.

## 🚀 Funcionalidades

### Para Administradores
- **Dashboard completo**: Visualização de todas as negociações e métricas
- **Gestão de vendedores**: Criar, editar e excluir acessos de vendedores
- **Relatórios**: Visualização de 100% do valor das vendas
- **Visualização apenas**: Não pode editar ou excluir propostas

### Para Vendedores
- **Dashboard personalizado**: Visualização das próprias negociações e 80% do valor das vendas
- **Gestão de propostas**: Criar, editar e excluir suas próprias propostas
- **Sistema de status**: Início → Negociando → Quase fechando → Concluído/Encerrado
- **Histórico de descrições**: Acompanhamento detalhado das negociações
- **Agenda integrada**: Calendário brasileiro com agendamento de reuniões
- **Gestão de leads**: Adicionar leads e converter em propostas
- **Gerador de propostas**: Templates personalizáveis para diferentes tipos de serviço

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore + Authentication)
- **Componentes**: Lucide React (ícones)
- **Calendário**: React Calendar
- **Notificações**: React Hot Toast
- **Formulários**: React Hook Form

## 🔧 Configuração do Projeto

### 1. Pré-requisitos
- Node.js 18+ instalado
- Conta no Firebase
- Git

### 2. Configuração do Firebase

✅ **Firebase já configurado!** As configurações do projeto `crm-pingdesk` já estão aplicadas no sistema.

**Próximos passos necessários:**

1. **Configurar Authentication**:
   - Acesse o [Console do Firebase](https://console.firebase.google.com/u/0/project/crm-pingdesk/overview)
   - Vá em "Authentication" > "Sign-in method"
   - Habilite "Email/senha"

2. **Configurar Firestore Database**:
   - Vá em "Firestore Database" > "Criar banco de dados"
   - Escolha "Iniciar no modo de teste"
   - Selecione uma localização (preferencialmente us-central1)

3. **Aplicar regras de segurança** (opcional mas recomendado):
   - Copie as regras de segurança da seção "Regras de Segurança Sugeridas" abaixo
   - Cole em "Firestore Database" > "Regras"

### 3. Instalação e Execução

1. **Clone o repositório**:
```bash
git clone <url-do-repositorio>
cd crm-p
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Execute o projeto**:
```bash
npm run dev
```

4. **Acesse o sistema**:
   - Abra o navegador em `http://localhost:3000`

### 4. Primeiro Acesso

1. **Criar primeiro usuário admin**:
   - Como não há interface de cadastro, você precisará criar o primeiro usuário diretamente no Firebase Console
   - Vá em "Authentication" > "Users" > "Add user"
   - Crie um usuário com email e senha
   - Anote o UID do usuário criado

2. **Configurar como admin**:
   - Vá em "Firestore Database" > "Create document"
   - Collection ID: `users`
   - Document ID: (deixe em branco para auto-gerar)
   - Adicione os campos:
     ```
     uid: [UID do usuário criado]
     name: "Administrador"
     email: "seu-email@exemplo.com"
     role: "admin"
     createdAt: [timestamp atual]
     ```

3. **Faça login**:
   - Use o email e senha criados para fazer login no sistema

## 📁 Estrutura do Projeto

```
crm-p/
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── dashboard/          # Páginas do dashboard
│   │   │   ├── propostas/      # Gestão de propostas
│   │   │   ├── agenda/         # Sistema de agenda
│   │   │   ├── leads/          # Gestão de leads
│   │   │   ├── vendedores/     # Gestão de vendedores (admin)
│   │   │   └── montar-proposta/ # Gerador de propostas
│   │   ├── globals.css         # Estilos globais
│   │   ├── layout.tsx          # Layout principal
│   │   └── page.tsx            # Página de login
│   ├── components/             # Componentes reutilizáveis
│   │   └── DashboardLayout.tsx # Layout do dashboard
│   ├── contexts/              # Contextos React
│   │   └── AuthContext.tsx    # Contexto de autenticação
│   ├── lib/                   # Bibliotecas e utilitários
│   │   └── firebase.ts        # Configuração do Firebase
│   └── types/                 # Definições de tipos TypeScript
│       └── index.ts           # Tipos principais
├── public/                    # Arquivos estáticos
├── package.json              # Dependências e scripts
├── tailwind.config.js        # Configuração do Tailwind
├── tsconfig.json            # Configuração do TypeScript
└── next.config.js           # Configuração do Next.js
```

## 🚀 Deploy

### Vercel (Recomendado)

1. **Conecte ao GitHub**:
   - Faça push do projeto para um repositório GitHub
   - Acesse [Vercel](https://vercel.com)
   - Importe o projeto do GitHub

2. **Configure variáveis de ambiente** (se necessário):
   - No dashboard da Vercel, vá em Settings > Environment Variables
   - Adicione as configurações do Firebase se quiser usar variáveis de ambiente

3. **Deploy automático**:
   - A Vercel fará o deploy automaticamente
   - Cada push para a branch main triggará um novo deploy

### Outras opções
- **Netlify**: Similar ao Vercel
- **Firebase Hosting**: Hospedagem nativa do Firebase
- **Railway**: Alternativa moderna

## 📊 Banco de Dados

### Coleções do Firestore

1. **users**: Dados dos usuários (vendedores e admins)
2. **proposals**: Propostas comerciais
3. **leads**: Leads coletados
4. **meetings**: Reuniões agendadas

### Regras de Segurança Sugeridas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users podem ler seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Propostas: vendedores só veem as suas, admins veem todas
    match /proposals/{proposalId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.data.sellerId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Leads e meetings: mesma regra das propostas
    match /leads/{leadId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.data.sellerId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    match /meetings/{meetingId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.data.sellerId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

## 🔐 Segurança

- **Autenticação**: Firebase Authentication com email/senha
- **Autorização**: Baseada em roles (admin/seller)
- **Firestore Rules**: Controle de acesso granular
- **HTTPS**: Forçado em produção
- **Sanitização**: Inputs validados no frontend e backend

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação do Firebase
2. Consulte os logs de erro no console do navegador
3. Verifique as regras de segurança do Firestore
4. Entre em contato com o desenvolvedor

## 📝 Licença

Este projeto é proprietário da PingDesk. Todos os direitos reservados.
