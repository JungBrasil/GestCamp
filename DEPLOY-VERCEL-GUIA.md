# 🚀 Guia Completo de Deploy do GestCamp no Vercel

## 📋 Pré-requisitos
- Conta no GitHub (gratuita)
- Conta no Vercel (gratuita)
- Projeto Supabase já configurado

## 🔧 Passo 1: Preparar o Repositório GitHub

### 1.1 Criar repositório no GitHub
1. Acesse [GitHub.com](https://github.com)
2. Clique em "New repository"
3. Nome: `gestcamp` (ou outro de sua escolha)
4. Marque como "Public" ou "Private"
5. Clique em "Create repository"

### 1.2 Subir arquivos para o GitHub
1. Abra o PowerShell na pasta EventManager
2. Execute os comandos:

```bash
# Inicializar Git
git init

# Adicionar arquivos
git add .

# Fazer primeiro commit
git commit -m "Initial commit - EventManager"

# Conectar ao repositório remoto (substitua SEU_USUARIO pelo seu usuário GitHub)
git remote add origin https://github.com/SEU_USUARIO/gestcamp.git

# Enviar para GitHub
git push -u origin main
```

## 🌐 Passo 2: Deploy no Vercel

### 2.1 Criar conta no Vercel
1. Acesse [Vercel.com](https://vercel.com)
2. Clique em "Sign Up"
3. Escolha "Continue with GitHub"
4. Autorize o Vercel a acessar seus repositórios

### 2.2 Fazer Deploy
1. No dashboard do Vercel, clique em "New Project"
2. Encontre seu repositório `gestcamp`
3. Clique em "Import"
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (deixe vazio)
   - **Output Directory**: ./
5. Clique em "Deploy"

## ⚙️ Passo 3: Configurar Variáveis de Ambiente (Opcional)

Se quiser pré-configurar o Supabase:

1. No dashboard do projeto no Vercel
2. Vá em "Settings" > "Environment Variables"
3. Adicione:
   - `SUPABASE_URL`: sua URL do Supabase
   - `SUPABASE_ANON_KEY`: sua chave anônima do Supabase

## 🎯 Passo 4: Testar a Aplicação

1. Após o deploy, o Vercel fornecerá uma URL (ex: `https://gestcamp-abc123.vercel.app`)
2. Acesse a URL
3. Teste todas as funcionalidades:
   - Configuração do Supabase
   - Cadastro de acampamentos
   - Sincronização de dados

## 🔄 Passo 5: Atualizações Futuras

Para atualizar a aplicação:

```bash
# Fazer alterações nos arquivos
# Depois executar:
git add .
git commit -m "Descrição da alteração"
git push
```

O Vercel fará deploy automático a cada push!

## 📱 Passo 6: Compartilhar a Aplicação

### URL de Produção
Sua aplicação estará disponível em:
`https://SEU-PROJETO.vercel.app`

### Domínio Personalizado (Opcional)
1. No Vercel, vá em "Settings" > "Domains"
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

## 🛠️ Comandos Úteis

### Verificar status do Git
```bash
git status
```

### Ver histórico de commits
```bash
git log --oneline
```

### Criar nova branch para testes
```bash
git checkout -b nova-funcionalidade
```

## 🆘 Solução de Problemas

### Erro de Build
- Verifique se todos os arquivos estão no repositório
- Confirme que não há erros de sintaxe no código

### Erro de Supabase
- Verifique se as URLs e chaves estão corretas
- Confirme se o projeto Supabase está ativo

### Erro de Git
- Verifique se o Git está instalado: `git --version`
- Configure usuário: `git config --global user.name "Seu Nome"`
- Configure email: `git config --global user.email "seu@email.com"`

## ✅ Checklist Final

- [ ] Repositório GitHub criado
- [ ] Código enviado para GitHub
- [ ] Deploy no Vercel realizado
- [ ] URL de produção funcionando
- [ ] Supabase configurado
- [ ] Todas as funcionalidades testadas
- [ ] URL compartilhada com usuários

---

**🎉 Parabéns! Seu GestCamp está online e pronto para uso!**

URL da aplicação: `https://gestcamp.vercel.app`