# Scripts Úteis para o CRM PingDesk

## Desenvolvimento
```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar versão de produção
npm start

# Verificar linting
npm run lint
```

## Firebase
```bash
# Instalar Firebase CLI (global)
npm install -g firebase-tools

# Login no Firebase
firebase login

# Inicializar projeto Firebase (opcional)
firebase init

# Deploy para Firebase Hosting (se configurado)
firebase deploy
```

## Git
```bash
# Inicializar repositório
git init
git add .
git commit -m "Initial commit: CRM PingDesk"

# Adicionar remote do GitHub
git remote add origin <url-do-seu-repositorio>
git push -u origin main
```

## Vercel (Deploy)
```bash
# Instalar Vercel CLI (opcional)
npm install -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

## Comandos Úteis

### Limpar cache do Next.js
```bash
rm -rf .next
npm run dev
```

### Reinstalar dependências
```bash
rm -rf node_modules package-lock.json
npm install
```

### Verificar tipos TypeScript
```bash
npx tsc --noEmit
```

### Atualizar dependências
```bash
npm update
```
