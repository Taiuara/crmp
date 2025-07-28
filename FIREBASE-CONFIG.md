# 🔧 Configuração Firebase Console - IMPORTANTE!

## ⚠️ PROBLEMAS IDENTIFICADOS E SOLUÇÕES

Os erros de **"Erro ao carregar dados"** e **"Adiciona nova informação e não salva"** podem ser causados por configurações incorretas no Firebase Console.

## 🚀 PASSOS OBRIGATÓRIOS PARA FUNCIONAR

### 1. **Configurar Regras do Firestore** ⚙️

Acesse o [Firebase Console](https://console.firebase.google.com/project/crm-pingdesk/firestore/rules) e cole estas regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para usuários
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Regras para propostas
    match /proposals/{proposalId} {
      allow read, write: if request.auth != null;
    }
    
    // Regras para leads
    match /leads/{leadId} {
      allow read, write: if request.auth != null;
    }
    
    // Regras para reuniões
    match /meetings/{meetingId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. **Verificar Authentication** 🔐

1. Vá em **Authentication** → **Sign-in method**
2. Certifique-se que **Email/Password** está **HABILITADO**
3. Se não estiver, clique em **Email/Password** → **Enable** → **Save**

### 3. **Verificar Database** 💾

1. Vá em **Firestore Database**
2. Se ainda não criou, clique **"Create database"**
3. Escolha **"Start in test mode"** (temporário)
4. Selecione localização **"southamerica-east1"** (São Paulo)

### 4. **Recriar Dados Limpos** 🧹

Se ainda houver problemas, execute localmente:

```bash
node scripts/seed-data.js
```

Isso recriará todos os dados com a estrutura correta.

### 5. **Verificar Credenciais** 🔑

Certifique-se que está usando as credenciais corretas:

```
Admin: admin@pingdesk.com.br
Vendedores: 
- douglas@pingdesk.com.br
- joice@pingdesk.com.br
- mariaeduarda@pingdesk.com.br
- ramon@pingdesk.com.br
```

## 🚨 **CHECKLIST DE PROBLEMAS COMUNS**

- [ ] ✅ **Firestore Rules** configuradas corretamente
- [ ] ✅ **Authentication Email/Password** habilitado
- [ ] ✅ **Database criado** em modo test
- [ ] ✅ **Usuários existem** na coleção "users"
- [ ] ✅ **Dados com estrutura correta** (executar seed-data.js)

## 📱 **COMO TESTAR**

1. **Acesse**: http://localhost:3000 (local) ou sua URL do Vercel
2. **Faça login** com qualquer credencial acima
3. **Teste cada seção**:
   - Dashboard (deve carregar métricas)
   - Leads (deve listar leads existentes)
   - Propostas (deve listar propostas)
   - Agenda (deve carregar reuniões)

## 🆘 **SE AINDA HOUVER PROBLEMAS**

1. **Abra o Console do navegador** (F12)
2. **Vá na aba Console** e procure por erros em vermelho
3. **Tire print** dos erros e me envie

Os erros mais comuns são:
- `Permission denied` → Regras do Firestore
- `Auth errors` → Authentication não configurado
- `Collection not found` → Database não criado

## 🎯 **RESULTADO ESPERADO**

Após seguir todos os passos:
- ✅ Login funciona sem erros
- ✅ Dashboard carrega dados
- ✅ Leads carregam e podem ser criados/editados
- ✅ Propostas carregam e podem ser criadas/editadas  
- ✅ Agenda carrega reuniões
- ✅ Dados salvam corretamente

---

**⚡ DICA**: Se for para produção, depois mude as regras do Firestore para serem mais restritivas, limitando acesso apenas aos dados do próprio usuário.
