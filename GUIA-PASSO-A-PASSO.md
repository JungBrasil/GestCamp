# 📋 Guia Passo a Passo - EventManager com Supabase

## 🎯 Objetivo
Este guia te ajudará a configurar e usar a integração do EventManager com o Supabase para sincronização de dados na nuvem.

---

## 📝 PASSO 1: Criar Conta no Supabase

### 1.1 Acesse o Supabase
- Vá para: https://supabase.com
- Clique em "Start your project"
- Faça login com GitHub, Google ou crie uma conta

### 1.2 Criar Novo Projeto
- Clique em "New Project"
- Escolha sua organização
- Preencha:
  - **Nome do Projeto**: `EventManager`
  - **Database Password**: Crie uma senha forte (anote!)
  - **Região**: South America (São Paulo)
- Clique em "Create new project"
- ⏳ Aguarde 2-3 minutos para o projeto ser criado

---

## 🗄️ PASSO 2: Configurar o Banco de Dados

### 2.1 Acessar o SQL Editor
- No painel do Supabase, clique em "SQL Editor" (ícone de código)
- Clique em "New query"

### 2.2 Executar o Schema
- Abra o arquivo `supabase-schema.sql` (está na pasta do EventManager)
- Copie TODO o conteúdo do arquivo
- Cole no SQL Editor do Supabase
- Clique em "Run" (ou Ctrl+Enter)
- ✅ Verifique se apareceu "Success. No rows returned"

### 2.3 Verificar Tabelas Criadas
- Clique em "Table Editor" no menu lateral
- Você deve ver as tabelas:
  - `acampamentos`
  - `modalidades`
  - `setores`
  - `tribos`
  - `campistas`
  - `equipe`
  - `pagamentos`
  - `despesas`
  - E outras...

---

## 🔑 PASSO 3: Obter as Credenciais

### 3.1 Acessar Configurações
- Clique em "Settings" (ícone de engrenagem)
- Clique em "API"

### 3.2 Copiar Credenciais
📋 **Anote estas informações:**
- **Project URL**: `https://[seu-projeto].supabase.co`
- **API Key (anon/public)**: `eyJ...` (chave longa)

⚠️ **IMPORTANTE**: Guarde essas informações em local seguro!

---

## ⚙️ PASSO 4: Configurar o EventManager

### 4.1 Abrir o EventManager
- Abra o arquivo `index.html` no navegador
- Ou use o servidor local: http://localhost:8081/

### 4.2 Configurar Conexão
- Clique no botão **"⚙️ Configurar Nuvem"** (no topo da tela)
- Preencha o formulário:
  - **URL do Supabase**: Cole a Project URL
  - **Chave da API**: Cole a API Key
- Clique em **"Salvar Configuração"**
- ✅ Deve aparecer: "Configuração salva com sucesso!"

---

## 🔄 PASSO 5: Testar a Sincronização

### 5.1 Primeiro Teste
- Clique em **"🔄 Sincronizar"**
- Deve aparecer: "Dados sincronizados com sucesso!"
- Os botões devem ficar verdes (conectado)

### 5.2 Enviar Dados Existentes
- Se você já tem dados no EventManager:
- Clique em **"☁️ Enviar para Nuvem"**
- Aguarde a confirmação

### 5.3 Verificar no Supabase
- Volte ao Supabase → Table Editor
- Clique em uma tabela (ex: `acampamentos`)
- Você deve ver seus dados lá!

---

## 📱 PASSO 6: Usar em Múltiplos Dispositivos

### 6.1 Segundo Dispositivo
- Abra o EventManager em outro computador/tablet
- Configure com as MESMAS credenciais do Passo 4.2
- Clique em "🔄 Sincronizar"
- Seus dados aparecerão automaticamente!

### 6.2 Sincronização Automática
- O EventManager sincroniza automaticamente quando você:
  - Adiciona novos dados
  - Edita informações
  - Faz alterações importantes

---

## 🎨 PASSO 7: Entender os Botões

### Botões de Nuvem (no topo):
- **⚙️ Configurar Nuvem**: Configurar credenciais do Supabase
- **🔄 Sincronizar**: Baixar dados mais recentes da nuvem
- **☁️ Enviar para Nuvem**: Forçar envio dos dados locais

### Cores dos Botões:
- 🟢 **Verde**: Conectado e funcionando
- 🔴 **Vermelho**: Erro de conexão
- 🟡 **Amarelo**: Não configurado

---

## ❗ SOLUÇÃO DE PROBLEMAS

### Problema: "Erro de conexão"
**Soluções:**
1. Verifique sua internet
2. Confirme se as credenciais estão corretas
3. Tente "Configurar Nuvem" novamente

### Problema: "Dados não aparecem"
**Soluções:**
1. Clique em "🔄 Sincronizar"
2. Aguarde alguns segundos
3. Recarregue a página (F5)

### Problema: "Botões vermelhos"
**Soluções:**
1. Reconfigure as credenciais
2. Verifique se o projeto Supabase está ativo
3. Teste a conexão com internet

---

## 🎉 PRONTO!

Agora você tem:
- ✅ EventManager conectado à nuvem
- ✅ Dados sincronizados automaticamente
- ✅ Acesso de múltiplos dispositivos
- ✅ Backup automático na nuvem
- ✅ Colaboração em tempo real

---

## 📞 Suporte

Se precisar de ajuda:
1. Consulte o arquivo `SUPABASE-SETUP.md` para detalhes técnicos
2. Verifique se seguiu todos os passos corretamente
3. Teste em um navegador diferente

**Dica**: Mantenha suas credenciais do Supabase em local seguro para futuras configurações!

---

*Última atualização: Janeiro 2025*