# 🚀 Guia Passo a Passo: Deploy GestCamp no Vercel

## ✅ Status Atual
- ✅ Código enviado para GitHub: https://github.com/JungBrasil/GestCamp.git
- ✅ Servidor local funcionando: http://localhost:8081/
- ⏳ **PRÓXIMO PASSO**: Deploy no Vercel

---

## 📋 PASSO 1: Acessar o Vercel

1. **Abra seu navegador** e acesse: https://vercel.com
2. **Clique em "Sign Up"** (se não tem conta) ou **"Log In"** (se já tem)
3. **Escolha "Continue with GitHub"**
4. **Autorize o Vercel** a acessar seus repositórios GitHub

---

## 📋 PASSO 2: Criar Novo Projeto

1. **No dashboard do Vercel**, clique no botão **"New Project"**
2. **Encontre o repositório** `gestcamp` na lista
3. **Clique em "Import"** ao lado do repositório

---

## 📋 PASSO 3: Configurar o Projeto

### 3.1 Configurações Básicas
- **Project Name**: `gestcamp` (pode manter ou alterar)
- **Framework Preset**: Selecione **"Other"**
- **Root Directory**: `./` (manter padrão)
- **Build Command**: Deixar **VAZIO**
- **Output Directory**: `./` (manter padrão)
- **Install Command**: Deixar **VAZIO**

### 3.2 ⚠️ NÃO CLIQUE EM "DEPLOY" AINDA!

---

## 📋 PASSO 4: Configurar Variáveis de Ambiente do Supabase

### 4.1 Expandir "Environment Variables"
1. **Clique na seta** ao lado de "Environment Variables"
2. **Adicione as seguintes variáveis:**

### 4.2 Primeira Variável
- **Name**: `SUPABASE_URL`
- **Value**: `https://ymislcrrkcroahikwcm.supabase.co`
- **Environment**: Selecione **todas** (Production, Preview, Development)
- **Clique em "Add"**

### 4.3 Segunda Variável
- **Name**: `SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltaXNsY3Jya2Nyb2VhaGlrd2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwODMwMzMsImV4cCI6MjA3MjY1OTAzM30.3usCMB-JMaHNgzhNW7Tolp2oOz8BzqV5yDLA69BFV_Q`
- **Environment**: Selecione **todas** (Production, Preview, Development)
- **Clique em "Add"**

---

## 📋 PASSO 5: Fazer o Deploy

1. **Agora clique em "Deploy"**
2. **Aguarde o processo** (pode levar 1-3 minutos)
3. **Você verá logs do deploy** em tempo real

---

## 📋 PASSO 6: Verificar o Deploy

### 6.1 Deploy Concluído
Quando aparecer **"Your project has been deployed"**:

1. **Clique em "Visit"** para abrir sua aplicação
2. **Sua URL será algo como**: `https://gestcamp-abc123.vercel.app`

### 6.2 Testar a Aplicação
1. **Teste o botão "Salvar Configuração"**
2. **Verifique se os dados sincronizam**
3. **Teste criar um acampamento**

---

## 📋 PASSO 7: Configurar Domínio Personalizado (Opcional)

### 7.1 Adicionar Domínio
1. **No dashboard do projeto**, vá em **"Settings"**
2. **Clique em "Domains"**
3. **Digite**: `gestcamp.vercel.app`
4. **Clique em "Add"**

### 7.2 Resultado
Sua aplicação ficará disponível em: **https://gestcamp.vercel.app**

---

## 🎯 RESUMO DAS URLs

- **Repositório GitHub**: https://github.com/JungBrasil/GestCamp.git
- **URL Temporária**: `https://gestcamp-[codigo].vercel.app`
- **URL Final Desejada**: https://gestcamp.vercel.app
- **Servidor Local**: http://localhost:8081/ (ainda funcionando)

---

## 🔄 Atualizações Futuras

Para atualizar a aplicação no futuro:

```bash
# Na pasta EventManager, execute:
git add .
git commit -m "Descrição da alteração"
git push
```

O Vercel fará **deploy automático** a cada push para o GitHub!

---

## ❓ Problemas Comuns

### Erro 404
- Verifique se os arquivos estão na raiz do repositório
- Confirme que o `index.html` está presente

### Erro de Supabase
- Verifique se as variáveis de ambiente foram configuradas corretamente
- Confirme se as URLs e chaves estão corretas

### Deploy Falhou
- Verifique os logs do deploy no Vercel
- Confirme se não há erros de sintaxe nos arquivos

---

## 🎉 Próximos Passos

Após o deploy bem-sucedido:
1. ✅ Compartilhe a URL com sua equipe
2. ✅ Teste todas as funcionalidades online
3. ✅ Configure backups regulares dos dados
4. ✅ Monitore o uso e performance

**Boa sorte com seu deploy! 🚀**