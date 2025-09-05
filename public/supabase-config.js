// Configuração do Supabase
// IMPORTANTE: Verifique se estas credenciais estão corretas no seu projeto Supabase
let SUPABASE_URL = 'https://ymislcrrkcroeahikwcm.supabase.co';
let SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltaXNsY3Jya2Nyb2VhaGlrd2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwODMwMzMsImV4cCI6MjA3MjY1OTAzM30.3usCMB-JMaHNgzhNW7Tolp2oOz8BzqV5yDLA69BFV_Q';

// Função para validar credenciais
function validateSupabaseCredentials() {
    console.log('🔍 Validando credenciais do Supabase...');
    
    if (!SUPABASE_URL || !SUPABASE_URL.includes('supabase.co')) {
        console.error('❌ URL do Supabase inválida:', SUPABASE_URL);
        return false;
    }
    
    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.length < 100) {
        console.error('❌ Chave anônima do Supabase inválida');
        return false;
    }
    
    console.log('✅ Credenciais do Supabase parecem válidas');
    return true;
}

// Configurações adicionais para debug
const SUPABASE_OPTIONS = {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    },
    global: {
        headers: {
            'X-Client-Info': 'eventmanager-web'
        }
    }
};

// Inicializar cliente Supabase
let supabase;

// Função para inicializar Supabase
function initSupabase() {
    try {
        console.log('🚀 Iniciando inicialização do Supabase...');
        
        // Verificar se a biblioteca Supabase está disponível
        if (typeof window.supabase === 'undefined') {
            console.error('❌ Biblioteca Supabase não carregada. Verifique se o script está incluído.');
            showToast('Erro: Biblioteca Supabase não carregada', 'error');
            return false;
        }
        
        // Verificar se a função createClient está disponível
        if (typeof window.supabase.createClient !== 'function') {
            console.error('❌ Função createClient não encontrada na biblioteca Supabase.');
            showToast('Erro: Função createClient não encontrada', 'error');
            return false;
        }
        
        console.log('✅ Biblioteca Supabase carregada corretamente');
        
        // Validar credenciais
        if (!validateSupabaseCredentials()) {
            showToast('Erro: Credenciais do Supabase inválidas', 'error');
            return false;
        }
        
        // Criar cliente Supabase com opções
        console.log('🔧 Criando cliente Supabase...');
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_OPTIONS);
        
        if (!supabase) {
            console.error('❌ Falha ao criar cliente Supabase');
            showToast('Erro: Falha ao criar cliente Supabase', 'error');
            return false;
        }
        
        // Expor cliente globalmente para acesso em outras partes da aplicação
        window.supabase = supabase;
        
        console.log('✅ Cliente Supabase criado com sucesso');
        console.log('📍 URL:', SUPABASE_URL);
        console.log('⚙️ Opções:', SUPABASE_OPTIONS);
        
        // Testar conexão
        testSupabaseConnection();
        
        return true;
    } catch (error) {
        console.error('Erro ao inicializar Supabase:', error);
        return false;
    }
}

// Função para testar conexão com Supabase
async function testSupabaseConnection() {
    try {
        console.log('Testando conexão com Supabase...');
        
        // Teste simples de conectividade
        const { data, error } = await supabase.from('acampamentos').select('count').limit(1);
        
        if (error) {
            console.warn('⚠️ Problema na conexão Supabase:', error.message);
            console.warn('Código:', error.code);
            console.warn('Detalhes:', error.details);
            
            // Verificar se é erro de rede ou configuração
            if (error.message.includes('fetch')) {
                console.warn('🌐 Problema de conectividade de rede detectado');
                showToast('Modo offline ativado - dados salvos localmente', 'warning');
            } else if (error.message.includes('JWT') || error.message.includes('auth')) {
                console.error('🔑 Problema de autenticação detectado');
                showToast('Erro de autenticação - verifique as credenciais', 'error');
            }
        } else {
            console.log('✅ Conexão com Supabase testada com sucesso');
            showToast('Conectado ao servidor', 'success');
        }
    } catch (error) {
        console.error('❌ Erro crítico ao testar conexão Supabase:', error);
        console.error('Stack:', error.stack);
        showToast('Modo offline - dados salvos localmente', 'info');
    }
}

// Estrutura das tabelas no Supabase
const TABLES = {
    acampamentos: 'acampamentos',
    modalidades: 'modalidades', 
    setores: 'setores',
    tribos: 'tribos',
    campistas: 'campistas',
    equipe: 'equipe',
    pagamentos: 'pagamentos',
    despesas: 'despesas',
    acampamento_setores: 'acampamento_setores',
    acampamento_tribos: 'acampamento_tribos',
    perguntas_personalizadas: 'perguntas_personalizadas'
};

// Funções de sincronização com Supabase
class SupabaseSync {
    static async saveToCloud(table, data) {
        try {
            const { data: result, error } = await supabase
                .from(table)
                .upsert(data)
                .select();
            
            if (error) throw error;
            console.log(`Dados salvos na nuvem (${table}):`, result);
            return result;
        } catch (error) {
            console.error(`Erro ao salvar na nuvem (${table}):`, error);
            throw error;
        }
    }

    static async loadFromCloud(table) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*');
            
            if (error) throw error;
            console.log(`Dados carregados da nuvem (${table}):`, data);
            return data || [];
        } catch (error) {
            console.error(`Erro ao carregar da nuvem (${table}):`, error);
            return [];
        }
    }

    static async deleteFromCloud(table, id) {
        try {
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            console.log(`Item deletado da nuvem (${table}):`, id);
        } catch (error) {
            console.error(`Erro ao deletar da nuvem (${table}):`, error);
            throw error;
        }
    }
    
    // Carregar dados específicos do usuário
    static async loadUserData(table, userId) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('user_id', userId);
            
            if (error) throw error;
            console.log(`Dados do usuário carregados (${table}):`, data);
            return data || [];
        } catch (error) {
            console.error(`Erro ao carregar dados do usuário (${table}):`, error);
            return [];
        }
    }
    
    // Salvar dados com ID do usuário
    static async saveUserData(table, data, userId) {
        try {
            // Adicionar user_id aos dados
            const dataWithUserId = Array.isArray(data) 
                ? data.map(item => ({ ...item, user_id: userId }))
                : { ...data, user_id: userId };
            
            const { data: result, error } = await supabase
                .from(table)
                .upsert(dataWithUserId)
                .select();
            
            if (error) throw error;
            console.log(`Dados do usuário salvos (${table}):`, result);
            return result;
        } catch (error) {
            console.error(`Erro ao salvar dados do usuário (${table}):`, error);
            throw error;
        }
    }

    // Sincronização completa dos dados
    static async syncAllData() {
        try {
            showToast('Sincronizando dados com a nuvem...', 'info');
            
            // Carregar dados da nuvem
            const cloudData = {
                acampamentos: await this.loadFromCloud(TABLES.acampamentos),
                modalidades: await this.loadFromCloud(TABLES.modalidades),
                setores: await this.loadFromCloud(TABLES.setores),
                tribos: await this.loadFromCloud(TABLES.tribos),
                campistas: await this.loadFromCloud(TABLES.campistas),
                equipe: await this.loadFromCloud(TABLES.equipe),
                pagamentos: await this.loadFromCloud(TABLES.pagamentos),
                despesas: await this.loadFromCloud(TABLES.despesas),
                acampamentoSetores: await this.loadFromCloud(TABLES.acampamento_setores),
                acampamentoTribos: await this.loadFromCloud(TABLES.acampamento_tribos),
                perguntasPersonalizadas: await this.loadFromCloud(TABLES.perguntas_personalizadas)
            };

            // Mesclar com dados locais
            appData = { ...appData, ...cloudData };
            
            // Salvar localmente como backup (sem sincronizar para evitar loop)
            saveData(true);
            
            // Atualizar interface
            loadAcampamentos();
            loadSetores();
            loadTribos();
            loadCampistas();
            loadEquipe();
            loadFinanceiro();
            updateDashboard();
            
            showToast('Dados sincronizados com sucesso!', 'success');
        } catch (error) {
            console.error('Erro na sincronização:', error);
            showToast('Erro ao sincronizar dados', 'error');
        }
    }

    // Salvar dados locais na nuvem
    static async uploadLocalData() {
        try {
            showToast('Enviando dados para a nuvem...', 'info');
            
            // Enviar cada tipo de dado
            if (appData.acampamentos?.length) {
                await this.saveToCloud(TABLES.acampamentos, appData.acampamentos);
            }
            if (appData.modalidades?.length) {
                await this.saveToCloud(TABLES.modalidades, appData.modalidades);
            }
            if (appData.setores?.length) {
                await this.saveToCloud(TABLES.setores, appData.setores);
            }
            if (appData.tribos?.length) {
                await this.saveToCloud(TABLES.tribos, appData.tribos);
            }
            if (appData.campistas?.length) {
                await this.saveToCloud(TABLES.campistas, appData.campistas);
            }
            if (appData.equipe?.length) {
                await this.saveToCloud(TABLES.equipe, appData.equipe);
            }
            if (appData.financeiro?.pagamentos?.length) {
                await this.saveToCloud(TABLES.pagamentos, appData.financeiro.pagamentos);
            }
            if (appData.financeiro?.despesas?.length) {
                await this.saveToCloud(TABLES.despesas, appData.financeiro.despesas);
            }
            if (appData.acampamentoSetores?.length) {
                await this.saveToCloud(TABLES.acampamento_setores, appData.acampamentoSetores);
            }
            if (appData.acampamentoTribos?.length) {
                await this.saveToCloud(TABLES.acampamento_tribos, appData.acampamentoTribos);
            }
            if (appData.perguntasPersonalizadas?.length) {
                await this.saveToCloud(TABLES.perguntas_personalizadas, appData.perguntasPersonalizadas);
            }
            
            showToast('Dados enviados para a nuvem com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao enviar dados:', error);
            showToast('Erro ao enviar dados para a nuvem', 'error');
        }
    }
}

// Verificar status da conexão
function checkSupabaseConnection() {
    return supabase && SUPABASE_URL !== 'https://your-project-url.supabase.co';
}

// Função para configurar Supabase (chamada pelo usuário)
function loadSupabaseConfig() {
    const config = localStorage.getItem('supabaseConfig');
    if (config) {
        try {
            const { url, key } = JSON.parse(config);
            SUPABASE_URL = url;
            SUPABASE_ANON_KEY = key;
            initSupabase();
            return true;
        } catch (error) {
            console.error('Erro ao carregar configuração do Supabase:', error);
        }
    }
    return false;
}

function configureSupabase(url, key) {
    if (!url || !key) {
        showToast('URL e chave do Supabase são obrigatórios', 'error');
        return false;
    }
    
    // Atualizar configurações
    SUPABASE_URL = url;
    SUPABASE_ANON_KEY = key;
    
    // Reinicializar cliente
    if (initSupabase()) {
        showToast('Supabase configurado com sucesso!', 'success');
        return true;
    }
    
    return false;
}

// Sistema de Autenticação
class AuthManager {
    static currentUser = null;
    
    // Registrar novo usuário
    static async signUp(email, password, userData = {}) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: userData
                }
            });
            
            if (error) throw error;
            
            showToast('Usuário registrado com sucesso! Verifique seu email.', 'success');
            return data;
        } catch (error) {
            console.error('Erro no registro:', error);
            showToast(error.message, 'error');
            throw error;
        }
    }
    
    // Login do usuário
    static async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) throw error;
            
            this.currentUser = data.user;
            showToast('Login realizado com sucesso!', 'success');
            this.updateAuthUI();
            return data;
        } catch (error) {
            console.error('Erro no login:', error);
            showToast(error.message, 'error');
            throw error;
        }
    }
    
    // Logout do usuário
    static async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            this.currentUser = null;
            this.clearUserData();
            showToast('Logout realizado com sucesso!', 'success');
            this.updateAuthUI();
        } catch (error) {
            console.error('Erro no logout:', error);
            showToast(error.message, 'error');
        }
    }
    
    // Verificar usuário atual
    static async getCurrentUser() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            this.currentUser = user;
            return user;
        } catch (error) {
            console.error('Erro ao obter usuário:', error);
            return null;
        }
    }
    
    // Resetar senha
    static async resetPassword(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
            
            showToast('Email de recuperação enviado!', 'success');
        } catch (error) {
            console.error('Erro ao resetar senha:', error);
            showToast(error.message, 'error');
        }
    }
    
    // Atualizar interface de autenticação
    static updateAuthUI() {
        const authSection = document.getElementById('auth-section');
        const mainContent = document.getElementById('main-app');
        const userInfo = document.getElementById('user-info');
        
        if (this.currentUser) {
            if (authSection) authSection.style.display = 'none';
            if (mainContent) mainContent.style.display = 'block';
            if (userInfo) {
                const role = PermissionManager.getUserRole();
                const roleNames = {
                    admin: 'Administrador',
                    coordinator: 'Coordenador',
                    leader: 'Líder',
                    volunteer: 'Voluntário'
                };
                
                userInfo.innerHTML = `
                    <div class="user-details">
                        <span class="user-email">${this.currentUser.email}</span>
                        <span class="user-role" id="user-role-display">${roleNames[role] || 'Usuário'}</span>
                    </div>
                    <button class="btn btn-secondary" onclick="AuthManager.signOut()">
                        <i class="fas fa-sign-out-alt"></i> Sair
                    </button>
                `;
            }
            
            // Aplicar restrições de permissão na interface
            setTimeout(() => {
                PermissionManager.applyUIRestrictions();
            }, 100);
        } else {
            if (authSection) authSection.style.display = 'block';
            if (mainContent) mainContent.style.display = 'none';
            if (userInfo) userInfo.innerHTML = '';
        }
    }
    
    // Verificar se usuário está autenticado
    static isAuthenticated() {
        return this.currentUser !== null;
    }
    
    // Controle de Sessões
    static initializeSession() {
        // Verificar se há uma sessão ativa
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                this.currentUser = session.user;
                this.updateAuthUI();
                this.loadUserData();
            }
        });
    }
    
    // Carregar dados específicos do usuário
    static async loadUserData() {
        if (!this.currentUser) return;
        
        try {
            // Filtrar dados por usuário logado
            const userId = this.currentUser.id;
            
            // Carregar apenas dados do usuário atual
            const userAcampamentos = await SupabaseSync.loadUserData('acampamentos', userId);
            const userCampistas = await SupabaseSync.loadUserData('campistas', userId);
            const userEquipe = await SupabaseSync.loadUserData('equipe', userId);
            const userPagamentos = await SupabaseSync.loadUserData('pagamentos', userId);
            const userDespesas = await SupabaseSync.loadUserData('despesas', userId);
            
            // Atualizar dados locais com dados do usuário
            if (userAcampamentos.length > 0) appData.acampamentos = userAcampamentos;
            if (userCampistas.length > 0) appData.campistas = userCampistas;
            if (userEquipe.length > 0) appData.equipe = userEquipe;
            if (userPagamentos.length > 0) appData.financeiro.pagamentos = userPagamentos;
            if (userDespesas.length > 0) appData.financeiro.despesas = userDespesas;
            
            // Salvar localmente (sem sincronizar para evitar loop)
            saveData(true);
            
            // Atualizar interface
            if (typeof loadAcampamentos === 'function') loadAcampamentos();
            if (typeof loadCampistas === 'function') loadCampistas();
            if (typeof loadEquipe === 'function') loadEquipe();
            if (typeof loadFinanceiro === 'function') loadFinanceiro();
            if (typeof updateDashboard === 'function') updateDashboard();
            
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
    }
    
    // Limpar dados locais no logout
    static clearUserData() {
        // Resetar dados para estrutura padrão
        appData = {
            acampamentos: [],
            modalidades: appData.modalidades, // Manter modalidades padrão
            setores: appData.setores, // Manter setores padrão
            tribos: [],
            campistas: [],
            equipe: [],
            financeiro: { pagamentos: [], despesas: [] },
            configuracoes: appData.configuracoes,
            acampamentoSetores: [],
            acampamentoTribos: [],
            perguntasPersonalizadas: []
        };
        
        // Limpar localStorage
        localStorage.removeItem('acampamentosCatolicos');
        localStorage.removeItem('acampamentoAtivo');
        
        // Atualizar interface
        if (typeof loadAcampamentos === 'function') loadAcampamentos();
        if (typeof loadCampistas === 'function') loadCampistas();
        if (typeof loadEquipe === 'function') loadEquipe();
        if (typeof loadFinanceiro === 'function') loadFinanceiro();
        if (typeof updateDashboard === 'function') updateDashboard();
     }
}

// Sistema de Permissões
class PermissionManager {
    static permissions = {
        CREATE_CAMP: 'create_camp',
        EDIT_CAMP: 'edit_camp',
        DELETE_CAMP: 'delete_camp',
        MANAGE_CAMPERS: 'manage_campers',
        MANAGE_TEAM: 'manage_team',
        MANAGE_FINANCES: 'manage_finances',
        VIEW_REPORTS: 'view_reports',
        ADMIN: 'admin'
    };
    
    static userRoles = {
        ADMIN: 'admin',
        COORDINATOR: 'coordinator',
        LEADER: 'leader',
        VOLUNTEER: 'volunteer'
    };
    
    static rolePermissions = {
        admin: [
            'create_camp', 'edit_camp', 'delete_camp', 
            'manage_campers', 'manage_team', 'manage_finances', 
            'view_reports', 'admin'
        ],
        coordinator: [
            'create_camp', 'edit_camp', 'manage_campers', 
            'manage_team', 'manage_finances', 'view_reports'
        ],
        leader: [
            'edit_camp', 'manage_campers', 'view_reports'
        ],
        volunteer: [
            'view_reports'
        ]
    };
    
    // Verificar se usuário tem permissão
    static hasPermission(permission) {
        if (!AuthManager.currentUser) return false;
        
        const userRole = AuthManager.currentUser.user_metadata?.role || 'volunteer';
        const userPermissions = this.rolePermissions[userRole] || [];
        
        return userPermissions.includes(permission);
    }
    
    // Verificar se usuário é admin
    static isAdmin() {
        return this.hasPermission(this.permissions.ADMIN);
    }
    
    // Obter role do usuário
    static getUserRole() {
        if (!AuthManager.currentUser) return null;
        return AuthManager.currentUser.user_metadata?.role || 'volunteer';
    }
    
    // Atualizar role do usuário (apenas admins)
    static async updateUserRole(userId, newRole) {
        if (!this.isAdmin()) {
            showToast('Você não tem permissão para alterar roles', 'error');
            return false;
        }
        
        try {
            // Atualizar no Supabase (requer função RPC no backend)
            const { error } = await supabase.rpc('update_user_role', {
                user_id: userId,
                new_role: newRole
            });
            
            if (error) throw error;
            
            showToast('Role atualizada com sucesso!', 'success');
            return true;
        } catch (error) {
            console.error('Erro ao atualizar role:', error);
            showToast('Erro ao atualizar role do usuário', 'error');
            return false;
        }
    }
    
    // Aplicar restrições na interface
    static applyUIRestrictions() {
        const userRole = this.getUserRole();
        const permissions = this.rolePermissions[userRole] || [];
        
        // Elementos que requerem permissões específicas
        const restrictedElements = {
            'manage_camps': ['.camp-management', '#add-camp-btn'],
            'manage_sectors': ['.sector-management', '#add-sector-btn'],
            'manage_tribes': ['.tribe-management', '#add-tribe-btn'],
            'manage_participants': ['.participant-management', '#add-participant-btn'],
            'manage_team': ['.team-management', '#add-team-btn'],
            'manage_finances': ['.finance-management', '#add-finance-btn'],
            'export_data': ['#export-btn'],
            'sync_data': ['#sync-btn'],
            'manage_users': ['#user-management-btn']
        };
        
        // Aplicar restrições
        Object.keys(restrictedElements).forEach(permission => {
            const hasPermission = permissions.includes(permission);
            const elements = restrictedElements[permission];
            
            elements.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                    if (hasPermission) {
                        element.classList.remove('permission-restricted', 'permission-hidden');
                        element.style.display = '';
                    } else {
                        // Ocultar completamente para usuários sem permissão
                        element.classList.add('permission-hidden');
                        element.style.display = 'none';
                    }
                }
            });
        });
        
        // Ocultar botões baseado em permissões (método antigo para compatibilidade)
        const restrictedElementsOld = [
            { selector: '[data-permission="create_camp"]', permission: this.permissions.CREATE_CAMP },
            { selector: '[data-permission="edit_camp"]', permission: this.permissions.EDIT_CAMP },
            { selector: '[data-permission="delete_camp"]', permission: this.permissions.DELETE_CAMP },
            { selector: '[data-permission="manage_campers"]', permission: this.permissions.MANAGE_CAMPERS },
            { selector: '[data-permission="manage_team"]', permission: this.permissions.MANAGE_TEAM },
            { selector: '[data-permission="manage_finances"]', permission: this.permissions.MANAGE_FINANCES },
            { selector: '[data-permission="admin"]', permission: this.permissions.ADMIN }
        ];
        
        restrictedElementsOld.forEach(({ selector, permission }) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (this.hasPermission(permission)) {
                    element.style.display = '';
                } else {
                    element.style.display = 'none';
                }
            });
        });
        
        // Aplicar classe de role no body para estilos específicos
        document.body.className = document.body.className.replace(/role-\w+/g, '');
        document.body.classList.add(`role-${userRole}`);
        
        // Mostrar role do usuário
        const roleDisplay = document.getElementById('user-role-display');
        if (roleDisplay) {
            const role = this.getUserRole();
            const roleNames = {
                admin: 'Administrador',
                coordinator: 'Coordenador',
                leader: 'Líder',
                volunteer: 'Voluntário'
            };
            roleDisplay.textContent = roleNames[role] || 'Usuário';
            roleDisplay.className = `user-role role-${userRole}`;
        }
    }
}

// Função para inicializar tudo
function initializeSupabase() {
    console.log('🚀 Iniciando configuração do Supabase...');
    
    try {
        // Tentar carregar configuração salva
        if (loadSupabaseConfig()) {
            console.log('📁 Configuração do Supabase carregada do localStorage');
        } else {
            console.log('⚙️ Usando configuração padrão do Supabase');
            
            if (initSupabase()) {
                setupAuthentication();
            } else {
                console.error('❌ Falha ao inicializar Supabase');
                enableOfflineMode();
            }
        }
    } catch (error) {
        console.error('💥 Erro crítico na inicialização:', error);
        enableOfflineMode();
    }
}

// Função para ativar modo offline
function enableOfflineMode() {
    console.log('📴 Ativando modo offline...');
    showToast('Aplicação funcionando em modo offline', 'info');
    
    // Criar um objeto supabase mock para evitar erros
    window.supabaseOffline = true;
    
    // Inicializar autenticação local
    if (typeof AuthManager !== 'undefined') {
        AuthManager.initializeSession();
        AuthManager.updateAuthUI();
    }
}

// Configurar autenticação
function setupAuthentication() {
    try {
        AuthManager.initializeSession();
        
        // Escutar mudanças no estado de autenticação
        supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            AuthManager.currentUser = session?.user || null;
            
            if (event === 'SIGNED_IN') {
                AuthManager.loadUserData();
            } else if (event === 'SIGNED_OUT') {
                AuthManager.clearUserData();
            }
            
            AuthManager.updateAuthUI();
        });
        
        console.log('Sistema de autenticação configurado');
    } catch (error) {
        console.error('Erro ao configurar autenticação:', error);
    }
}

// Carregar configuração salva ao inicializar
if (typeof document !== 'undefined') {
    // Evento de carregamento da página
    document.addEventListener('DOMContentLoaded', function() {
        // Aguardar um pouco para garantir que o Supabase foi carregado
        setTimeout(() => {
            initializeSupabase();
        }, 100);
    });
    
    // Fallback: tentar inicializar quando a janela carregar
    window.addEventListener('load', function() {
        if (!supabase) {
            console.log('Tentativa de inicialização via window.load');
            initializeSupabase();
        }
    });
}