# 🏕️ GestCamp

Sistema completo de gestão de acampamentos e eventos com sincronização em nuvem.

## 🚀 Demo Online

**URL da Aplicação:** [https://gestcamp.vercel.app](https://gestcamp.vercel.app)

## ✨ Funcionalidades

### 📊 Gerenciamento Completo
- **Acampamentos**: Cadastro e controle de eventos
- **Setores**: Organização por áreas
- **Tribos**: Grupos e equipes
- **Campistas**: Registro de participantes
- **Equipe**: Gestão de colaboradores
- **Financeiro**: Controle de receitas e despesas

### ☁️ Sincronização em Nuvem
- **Supabase Integration**: Banco de dados em tempo real
- **Sync Automático**: Dados sempre atualizados
- **Offline First**: Funciona sem internet
- **Multi-dispositivo**: Acesse de qualquer lugar

### 🎨 Interface Moderna
- **Design Responsivo**: Funciona em desktop, tablet e mobile
- **UI Intuitiva**: Fácil de usar
- **Tema Moderno**: Interface limpa e profissional
- **Feedback Visual**: Notificações e confirmações

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Supabase (PostgreSQL)
- **Deploy**: Vercel
- **Versionamento**: Git/GitHub

## 📱 Como Usar

### 1. Configuração Inicial
1. Acesse a aplicação
2. Clique em "Configurar Supabase"
3. Insira sua URL e chave do Supabase
4. Clique em "Salvar Configuração"

### 2. Gerenciamento de Dados
1. **Acampamentos**: Crie e gerencie seus eventos
2. **Setores**: Organize por áreas (ex: Alimentação, Recreação)
3. **Tribos**: Cadastre grupos e equipes
4. **Campistas**: Registre participantes
5. **Equipe**: Gerencie colaboradores
6. **Financeiro**: Controle receitas e despesas

### 3. Sincronização
- Clique em "Sincronizar" para enviar/receber dados da nuvem
- Os dados são automaticamente salvos localmente
- Funciona offline e sincroniza quando conectar

## 🔧 Configuração do Supabase

### 1. Criar Projeto
1. Acesse [Supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Clique em "New Project"
4. Configure nome, senha e região

### 2. Executar Schema
1. Vá em "SQL Editor" no Supabase
2. Cole o conteúdo do arquivo `supabase-schema.sql`
3. Execute o script

### 3. Obter Credenciais
1. Vá em "Settings" > "API"
2. Copie a "URL" e "anon public key"
3. Use na configuração da aplicação

## 📋 Instalação Local

```bash
# Clonar repositório
git clone https://github.com/SEU_USUARIO/gestcamp.git

# Entrar na pasta
cd gestcamp

# Abrir no navegador
# Abra o arquivo index.html
```

## 🚀 Deploy

Este projeto está configurado para deploy automático no Vercel:

1. Conecte seu repositório GitHub ao Vercel
2. O deploy acontece automaticamente a cada push
3. URL de produção gerada automaticamente

## 📁 Estrutura do Projeto

```
gestcamp/
├── index.html              # Página principal
├── script.js               # Lógica da aplicação
├── styles.css              # Estilos CSS
├── supabase-config.js      # Configuração Supabase
├── supabase-schema.sql     # Schema do banco
├── package.json            # Configuração do projeto
├── README.md               # Documentação
├── DEPLOY-VERCEL-GUIA.md   # Guia de deploy
└── GUIA-PASSO-A-PASSO.md   # Guia de uso
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma [Issue](https://github.com/SEU_USUARIO/gestcamp/issues)
- Entre em contato: seu@email.com

---

**Desenvolvido com ❤️ para facilitar a gestão de acampamentos e eventos**