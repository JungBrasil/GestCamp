# Configuração do Supabase para EventManager

Este guia explica como configurar o Supabase para sincronizar os dados do EventManager na nuvem.

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- EventManager funcionando localmente

## 🚀 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha uma organização
5. Preencha:
   - **Name**: `EventManager` (ou nome de sua preferência)
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a região mais próxima
6. Clique em "Create new project"
7. Aguarde a criação (pode levar alguns minutos)

### 2. Configurar o Banco de Dados

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em "New query"
3. Copie todo o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor SQL
5. Clique em "Run" para executar
6. Verifique se todas as tabelas foram criadas em **Table Editor**

### 3. Obter Credenciais de API

1. Vá para **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL**: `https://seu-projeto-id.supabase.co`
   - **anon public key**: Chave que começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 4. Configurar no EventManager

1. Abra o EventManager no navegador
2. Clique no botão **"Configurar Nuvem"** no header
3. Preencha:
   - **URL do Projeto Supabase**: Cole a Project URL
   - **Chave Anônima**: Cole a anon public key
4. Clique em **"Salvar Configuração"**
5. O botão deve mudar para **"Conectado"** e aparecer os botões de sincronização

## 🔄 Como Usar a Sincronização

### Botões Disponíveis

- **🔧 Configurar Nuvem**: Configurar credenciais do Supabase
- **🔄 Sincronizar**: Baixar dados da nuvem e mesclar com dados locais
- **☁️ Enviar para Nuvem**: Enviar dados locais para a nuvem

### Sincronização Automática

- Os dados são automaticamente enviados para a nuvem sempre que você faz alterações
- Há um delay de 2 segundos para evitar muitas chamadas
- Os dados locais continuam funcionando mesmo sem internet

### Sincronização Manual

1. **Enviar dados locais**: Clique em "Enviar para Nuvem"
2. **Baixar dados da nuvem**: Clique em "Sincronizar"
3. **Primeira sincronização**: Recomendado usar "Enviar para Nuvem" primeiro

## 📊 Estrutura do Banco

### Tabelas Criadas

- `acampamentos` - Dados dos acampamentos
- `modalidades` - Tipos de acampamento
- `setores` - Setores de trabalho
- `tribos` - Grupos de campistas
- `campistas` - Participantes
- `equipe` - Membros da equipe
- `pagamentos` - Controle financeiro
- `despesas` - Gastos dos acampamentos
- `acampamento_setores` - Associações
- `acampamento_tribos` - Associações
- `perguntas_personalizadas` - Formulários customizados

### Dados Padrão Inseridos

- **Modalidades**: Jovens, Casais, Famílias, Crianças, Adolescentes
- **Setores**: Cozinha, Liturgia, Acolhida, Limpeza, Segurança, Animação

## 🔒 Segurança

### Row Level Security (RLS)

- Todas as tabelas têm RLS habilitado
- Atualmente configurado para acesso público
- **Recomendação**: Implementar autenticação para produção

### Políticas de Acesso

```sql
-- Exemplo de política mais restritiva (para implementar futuramente)
CREATE POLICY "Usuários autenticados" ON acampamentos 
FOR ALL USING (auth.role() = 'authenticated');
```

## 🚨 Solução de Problemas

### Erro de Conexão

1. Verifique se a URL e chave estão corretas
2. Confirme se o projeto Supabase está ativo
3. Verifique a conexão com internet

### Dados Não Sincronizam

1. Abra o Console do navegador (F12)
2. Verifique se há erros na aba Console
3. Tente "Enviar para Nuvem" manualmente
4. Verifique se as tabelas existem no Supabase

### Dados Duplicados

1. Use "Sincronizar" para baixar dados da nuvem
2. Os dados são mesclados automaticamente
3. IDs únicos previnem duplicação real

## 📱 Acesso Multi-Dispositivo

### Como Funciona

1. **Dispositivo A**: Configura Supabase e envia dados
2. **Dispositivo B**: Configura mesmo Supabase e sincroniza
3. **Resultado**: Ambos têm os mesmos dados

### Fluxo Recomendado

1. Configure o Supabase no primeiro dispositivo
2. Use "Enviar para Nuvem" para upload inicial
3. Em outros dispositivos, configure e use "Sincronizar"
4. Sempre sincronize antes de fazer alterações importantes

## 🔧 Configurações Avançadas

### Backup Automático

- Os dados locais continuam sendo salvos no localStorage
- Funciona como backup offline
- Sincronização não substitui dados locais, apenas mescla

### Performance

- Índices criados para consultas rápidas
- Triggers automáticos para `updated_at`
- Políticas RLS otimizadas

## 📞 Suporte

### Logs de Debug

- Abra Console do navegador (F12)
- Procure por mensagens do Supabase
- Erros aparecem em vermelho

### Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase Dashboard](https://app.supabase.com)
- [Status Supabase](https://status.supabase.com)

---

✅ **Pronto!** Agora seus dados do EventManager estão sincronizados na nuvem e acessíveis de qualquer dispositivo.