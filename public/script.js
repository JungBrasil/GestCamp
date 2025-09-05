// Sistema de Gestão de Acampamentos Católicos
// Armazenamento local usando localStorage

// Controle de acampamento ativo
let acampamentoAtivo = null;

// Estrutura de dados
let appData = {
    acampamentos: [],
    modalidades: [
        { id: 'jovens', nome: 'Jovens', descricao: 'Acampamentos para jovens' },
        { id: 'casais', nome: 'Casais', descricao: 'Acampamentos para casais' },
        { id: 'familias', nome: 'Famílias', descricao: 'Acampamentos para famílias' },
        { id: 'criancas', nome: 'Crianças', descricao: 'Acampamentos para crianças' },
        { id: 'adolescentes', nome: 'Adolescentes', descricao: 'Acampamentos para adolescentes' }
    ],
    setores: [
        { id: 'cozinha', nome: 'Cozinha', descricao: 'Preparo de refeições', cor: '#ff6b6b', membros: [] },
        { id: 'liturgia', nome: 'Liturgia', descricao: 'Celebrações e orações', cor: '#4ecdc4', membros: [] },
        { id: 'acolhida', nome: 'Acolhida', descricao: 'Recepção dos campistas', cor: '#45b7d1', membros: [] },
        { id: 'limpeza', nome: 'Limpeza', descricao: 'Manutenção e higiene', cor: '#96ceb4', membros: [] },
        { id: 'seguranca', nome: 'Segurança', descricao: 'Segurança do acampamento', cor: '#feca57', membros: [] },
        { id: 'animacao', nome: 'Animação', descricao: 'Atividades recreativas', cor: '#ff9ff3', membros: [] }
    ],
    tribos: [],
    campistas: [],
    equipe: [],
    financeiro: {
        pagamentos: [],
        despesas: []
    },
    configuracoes: {
        versao: '1.0.0',
        ultimaAtualizacao: new Date().toISOString()
    },
    // Associações entre setores/tribos globais e acampamentos específicos
    acampamentoSetores: [], // { acampamentoId, setorId }
    acampamentoTribos: [],   // { acampamentoId, triboId }
    // Sistema de perguntas personalizadas
    perguntasPersonalizadas: [] // { id, pergunta, tipo, opcoes, obrigatoria, categoria, ativa, criadaEm }
};

// Funções de Autenticação
function showAuthTab(tabName) {
    // Remover classe active de todas as abas
    document.querySelectorAll('.auth-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    // Ativar aba selecionada
    event.target.classList.add('active');
    document.getElementById(tabName + '-form').classList.add('active');
}

function showForgotPassword() {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.getElementById('forgot-password-form').classList.add('active');
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showToast('Por favor, preencha todos os campos', 'error');
        return;
    }
    
    try {
        await AuthManager.signIn(email, password);
    } catch (error) {
        console.error('Erro no login:', error);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (!name || !email || !password || !confirmPassword) {
        showToast('Por favor, preencha todos os campos', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('As senhas não coincidem', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('A senha deve ter pelo menos 6 caracteres', 'error');
        return;
    }
    
    try {
        await AuthManager.signUp(email, password, { full_name: name });
    } catch (error) {
        console.error('Erro no registro:', error);
    }
}

async function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgot-email').value;
    
    if (!email) {
        showToast('Por favor, informe seu email', 'error');
        return;
    }
    
    try {
        await AuthManager.resetPassword(email);
        showAuthTab('login');
    } catch (error) {
        console.error('Erro ao resetar senha:', error);
    }
}

// Inicialização do aplicativo
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeApp();
    updateDashboard();
    
    // Inicializar Supabase se disponível
    if (typeof initSupabase === 'function') {
        initSupabase();
        updateCloudButtons();
    }
});

// Carregamento de dados do localStorage
function loadData() {
    const savedData = localStorage.getItem('acampamentosCatolicos');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            appData = { ...appData, ...parsedData };
            console.log('Dados carregados com sucesso');
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            showToast('Erro ao carregar dados salvos', 'error');
        }
    }
}

// Salvamento de dados no localStorage
function saveData() {
    try {
        appData.configuracoes.ultimaAtualizacao = new Date().toISOString();
        localStorage.setItem('acampamentosCatolicos', JSON.stringify(appData));
        console.log('Dados salvos com sucesso');
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        showToast('Erro ao salvar dados', 'error');
    }
}

// Gerenciamento de roles de usuário (apenas para admins)
function showUserManagement() {
    if (!PermissionManager.hasPermission('manage_users')) {
        showToast('Você não tem permissão para gerenciar usuários', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Gerenciar Usuários</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="user-management">
                    <div class="search-section">
                        <input type="email" id="user-email-search" placeholder="Email do usuário" class="form-control">
                        <button onclick="searchUser()" class="btn btn-primary">Buscar</button>
                    </div>
                    <div id="user-search-result"></div>
                    <div class="role-assignment">
                        <h4>Atribuir Role</h4>
                        <select id="role-select" class="form-control">
                            <option value="volunteer">Voluntário</option>
                            <option value="leader">Líder</option>
                            <option value="coordinator">Coordenador</option>
                            <option value="admin">Administrador</option>
                        </select>
                        <button onclick="assignRole()" class="btn btn-success">Atribuir Role</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function searchUser() {
    const email = document.getElementById('user-email-search').value;
    const resultDiv = document.getElementById('user-search-result');
    
    if (!email) {
        resultDiv.innerHTML = '<p class="error">Digite um email válido</p>';
        return;
    }
    
    // Simular busca de usuário (em produção, seria uma consulta ao banco)
    resultDiv.innerHTML = `
        <div class="user-result">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Role atual:</strong> <span id="current-role">Carregando...</span></p>
        </div>
    `;
    
    // Aqui você faria uma consulta real ao Supabase para buscar o usuário
    setTimeout(() => {
        document.getElementById('current-role').textContent = 'volunteer';
    }, 500);
}

function assignRole() {
    const email = document.getElementById('user-email-search').value;
    const role = document.getElementById('role-select').value;
    
    if (!email) {
        showToast('Digite um email válido', 'error');
        return;
    }
    
    // Aqui você faria a atualização real no Supabase
    PermissionManager.updateUserRole(email, role)
        .then(() => {
            showToast(`Role ${role} atribuído com sucesso para ${email}`, 'success');
            document.getElementById('current-role').textContent = role;
        })
        .catch(error => {
            showToast('Erro ao atribuir role: ' + error.message, 'error');
        });
}

// Inicialização da aplicação
function initializeApp() {
    // Carregar acampamento ativo do localStorage
    acampamentoAtivo = localStorage.getItem('acampamentoAtivo');
    
    // Configurar navegação por abas
    setupTabNavigation();
    
    // Carregar dados iniciais
    loadAcampamentos();
    updateAcampamentoSelector();
    loadSetores();
    loadTribos();
    loadCampistas();
    loadEquipe();
    loadFinanceiro();
    
    // Atualizar filtros
    updateEquipeFilters();
    updateModalidadeFilters();
    
    // Configurar eventos
    setupEventListeners();
    
    showToast('Sistema carregado com sucesso!', 'success');
}

function updateEquipeFilters() {
    const setorFilter = document.getElementById('equipe-setor-filter');
    if (setorFilter) {
        // Limpar opções existentes (exceto a primeira)
        while (setorFilter.children.length > 1) {
            setorFilter.removeChild(setorFilter.lastChild);
        }
        
        // Adicionar setores
        appData.setores.forEach(setor => {
            const option = document.createElement('option');
            option.value = setor.id;
            option.textContent = setor.nome;
            setorFilter.appendChild(option);
        });
    }
}

// Configuração da navegação por abas
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('onclick').match(/'([^']+)'/)[1];
            showTab(targetTab);
        });
    });
}

// Mostrar aba específica
function showTab(tabName) {
    // Remover classe active de todas as abas
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Ativar aba selecionada
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    // Controlar visibilidade do seletor de acampamento
    const campSelector = document.getElementById('campSelector');
    if (tabName === 'acampamentos' || tabName === 'dashboard') {
        campSelector.style.display = 'none';
    } else {
        campSelector.style.display = 'flex';
    }
    
    // Atualizar conteúdo da aba
    switch(tabName) {
        case 'acampamentos':
            loadAcampamentos();
            break;
        case 'setores':
            loadSetores();
            break;
        case 'tribos':
            loadTribos();
            break;
        case 'campistas':
            loadCampistas();
            break;
        case 'equipe':
            loadEquipe();
            break;
        case 'financeiro':
            loadFinanceiro();
            break;
        case 'organizacao':
            loadOrganizacao();
            break;
        case 'dashboard':
            updateDashboard();
            break;
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Modal
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
    
    // Tecla ESC para fechar modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// === GESTÃO DE ACAMPAMENTOS ===
function loadAcampamentos() {
    const container = document.getElementById('acampamentos-list');
    container.innerHTML = '';
    
    if (appData.acampamentos.length === 0) {
        container.innerHTML = '<div class="text-center p-4"><p>Nenhum acampamento cadastrado ainda.</p></div>';
        return;
    }
    
    appData.acampamentos.forEach(acampamento => {
        const acampamentoCard = createAcampamentoCard(acampamento);
        container.appendChild(acampamentoCard);
    });
}

function createAcampamentoCard(acampamento) {
    const card = document.createElement('div');
    card.className = 'data-item';
    card.innerHTML = `
        <div class="d-flex justify-between items-center mb-3">
            <h3>${acampamento.nome}</h3>
            <span class="badge badge-${getStatusColor(acampamento.status)}">${acampamento.status}</span>
        </div>
        <div class="form-row mb-2">
            <div><strong>Modalidade:</strong> ${acampamento.modalidade}</div>
            <div><strong>Data:</strong> ${formatDate(acampamento.dataInicio)} - ${formatDate(acampamento.dataFim)}</div>
        </div>
        <div class="form-row mb-2">
            <div><strong>Local:</strong> ${acampamento.local}</div>
            <div><strong>Vagas:</strong> ${acampamento.vagas}</div>
        </div>
        <p class="mb-3">${acampamento.descricao}</p>
        <div class="d-flex gap-2">
            <button class="btn btn-primary" onclick="editAcampamento('${acampamento.id}')">
                <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-danger" onclick="deleteAcampamento('${acampamento.id}')">
                <i class="fas fa-trash"></i> Excluir
            </button>
            <button class="btn btn-info" onclick="viewAcampamentoDetails('${acampamento.id}')">
                <i class="fas fa-eye"></i> Detalhes
            </button>
        </div>
    `;
    return card;
}

function openModal(formType) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    let formHTML = '';
    
    switch(formType) {
        case 'acampamento-form':
            formHTML = getAcampamentoForm();
            break;
        case 'setor-form':
            formHTML = getSetorForm();
            break;
        case 'tribo-form':
            formHTML = getTriboForm();
            break;
        case 'campista-form':
            formHTML = getCampistaForm();
            break;
        case 'equipe-form':
            formHTML = getEquipeForm();
            break;
        case 'pagamento-form':
            formHTML = getPagamentoForm();
            break;
        case 'despesa-form':
            formHTML = getDespesaForm();
            break;
    }
    
    modalBody.innerHTML = formHTML;
    modal.classList.add('show');
    
    // Configura máscara de moeda para campos de valor
    setTimeout(() => {
        if (formType === 'acampamento-form' || formType === 'pagamento-form' || formType === 'despesa-form') {
            setupCurrencyInput('valor');
        }
    }, 100);
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('show');
}

function getAcampamentoForm(acampamento = null) {
    const isEdit = acampamento !== null;
    return `
        <h2>${isEdit ? 'Editar' : 'Novo'} Acampamento</h2>
        <form onsubmit="saveAcampamento(event, ${isEdit ? "'" + acampamento.id + "'" : 'null'})">
            <div class="form-group">
                <label for="nome">Nome do Acampamento *</label>
                <input type="text" id="nome" name="nome" required value="${isEdit ? acampamento.nome : ''}">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="modalidade">Modalidade *</label>
                    <select id="modalidade" name="modalidade" required>
                        <option value="">Selecione...</option>
                        ${appData.modalidades.map(m => 
                            `<option value="${m.id}" ${isEdit && acampamento.modalidade === m.id ? 'selected' : ''}>${m.nome}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="vagas">Número de Vagas *</label>
                    <input type="number" id="vagas" name="vagas" required min="1" value="${isEdit ? acampamento.vagas : ''}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="dataInicio">Data de Início *</label>
                    <input type="date" id="dataInicio" name="dataInicio" required value="${isEdit ? acampamento.dataInicio : ''}">
                </div>
                
                <div class="form-group">
                    <label for="dataFim">Data de Término *</label>
                    <input type="date" id="dataFim" name="dataFim" required value="${isEdit ? acampamento.dataFim : ''}">
                </div>
            </div>
            
            <div class="form-group">
                <label for="local">Local *</label>
                <input type="text" id="local" name="local" required value="${isEdit ? acampamento.local : ''}">
            </div>
            
            <div class="form-group">
                <label for="valor">Valor da Inscrição (R$)</label>
                <input type="text" id="valor" name="valor" value="${isEdit ? (acampamento.valor ? 'R$ ' + parseFloat(acampamento.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '') : ''}">
            </div>
            
            <div class="form-group">
                <label for="descricao">Descrição</label>
                <textarea id="descricao" name="descricao" rows="3">${isEdit ? acampamento.descricao || '' : ''}</textarea>
            </div>
            
            <div class="form-group">
                <label for="status">Status</label>
                <select id="status" name="status">
                    <option value="planejamento" ${isEdit && acampamento.status === 'planejamento' ? 'selected' : ''}>Planejamento</option>
                    <option value="inscricoes-abertas" ${isEdit && acampamento.status === 'inscricoes-abertas' ? 'selected' : ''}>Inscrições Abertas</option>
                    <option value="em-andamento" ${isEdit && acampamento.status === 'em-andamento' ? 'selected' : ''}>Em Andamento</option>
                    <option value="concluido" ${isEdit && acampamento.status === 'concluido' ? 'selected' : ''}>Concluído</option>
                </select>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar' : 'Salvar'}</button>
            </div>
        </form>
    `;
}

function saveAcampamento(event, id = null) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const acampamento = {
        id: id || generateId(),
        nome: formData.get('nome'),
        modalidade: formData.get('modalidade'),
        vagas: parseInt(formData.get('vagas')),
        dataInicio: formData.get('dataInicio'),
        dataFim: formData.get('dataFim'),
        local: formData.get('local'),
        valor: getCurrencyValue(formData.get('valor')) || 0,
        descricao: formData.get('descricao'),
        status: formData.get('status') || 'planejamento',
        criadoEm: id ? appData.acampamentos.find(a => a.id === id).criadoEm : new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
    };
    
    if (id) {
        // Editar acampamento existente
        const index = appData.acampamentos.findIndex(a => a.id === id);
        appData.acampamentos[index] = acampamento;
        showToast('Acampamento atualizado com sucesso!', 'success');
    } else {
        // Novo acampamento
        appData.acampamentos.push(acampamento);
        showToast('Acampamento criado com sucesso!', 'success');
    }
    
    saveData();
    loadAcampamentos();
    closeModal();
    updateDashboard();
}

function editAcampamento(id) {
    const acampamento = appData.acampamentos.find(a => a.id === id);
    if (acampamento) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = getAcampamentoForm(acampamento);
        modal.classList.add('show');
        
        // Aplicar formatação de moeda após renderizar o formulário
        setTimeout(() => {
            setupCurrencyInput('valor');
        }, 100);
    }
}

function deleteAcampamento(id) {
    if (confirm('Tem certeza que deseja excluir este acampamento?')) {
        appData.acampamentos = appData.acampamentos.filter(a => a.id !== id);
        saveData();
        loadAcampamentos();
        updateDashboard();
        showToast('Acampamento excluído com sucesso!', 'success');
    }
}

// === GESTÃO DE SETORES ===
function loadSetores() {
    updateSetoresGrid();
    updateSetoresList();
}

function getSetoresByAcampamento() {
    if (!acampamentoAtivo) return [];
    // Retorna setores associados ao acampamento ativo
    const setoresAssociados = appData.acampamentoSetores
        .filter(assoc => assoc.acampamentoId === acampamentoAtivo)
        .map(assoc => assoc.setorId);
    return appData.setores.filter(setor => setoresAssociados.includes(setor.id));
}

function updateSetoresGrid() {
    const setoresGrid = document.querySelector('.setores-grid');
    if (!setoresGrid) return;
    
    // Limpar grid atual
    setoresGrid.innerHTML = '';
    
    // Se não há setores cadastrados, mostrar mensagem
    if (appData.setores.length === 0) {
        setoresGrid.innerHTML = '<div class="text-center p-4"><p>Nenhum setor cadastrado ainda.</p></div>';
        return;
    }
    
    // Renderizar cards dos setores cadastrados
    appData.setores.forEach(setor => {
        const setorCard = document.createElement('div');
        setorCard.className = 'setor-card';
        setorCard.setAttribute('data-setor', setor.id);
        setorCard.onclick = (e) => {
            // Verificar se o clique não foi no botão de edição
            if (!e.target.closest('.setor-edit-btn')) {
                abrirDetalhesSetor(setor.id);
            }
        };
        
        const icon = getSetorIcon(setor.id);
        
        setorCard.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <h3>${setor.nome}</h3>
            <span class="setor-count">${setor.membros.length} pessoas</span>
            <button class="setor-edit-btn" onclick="event.stopPropagation(); editSetor('${setor.id}')" title="Editar Setor">
                <i class="fas fa-edit"></i>
            </button>
        `;
        
        setoresGrid.appendChild(setorCard);
    });
}

// Função para abrir detalhes do setor
function abrirDetalhesSetor(setorId) {
    const setor = appData.setores.find(s => s.id === setorId);
    if (!setor) {
        showToast('Setor não encontrado', 'error');
        return;
    }
    
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    const membrosHtml = setor.membros.length > 0 ? 
        setor.membros.map(membro => `
            <div class="membro-item">
                <div class="membro-info">
                    <strong>${membro.nome}</strong><br>
                    <small>${membro.funcao || 'Função não definida'}</small>
                </div>
                <div class="membro-contato">
                    ${membro.telefone ? `<i class="fas fa-phone"></i> ${membro.telefone}` : ''}
                    ${membro.email ? `<br><i class="fas fa-envelope"></i> ${membro.email}` : ''}
                </div>
            </div>
        `).join('') : 
        '<p class="text-muted">Nenhum membro alocado neste setor</p>';
    
    modalBody.innerHTML = `
        <div class="setor-detalhes">
            <div class="setor-header">
                <div class="setor-icon" style="color: ${setor.cor}">
                    <i class="fas fa-${getSetorIcon(setorId)}"></i>
                </div>
                <div class="setor-info">
                    <h2 style="color: ${setor.cor}">${setor.nome}</h2>
                    <p class="setor-descricao">${setor.descricao || 'Sem descrição'}</p>
                    <span class="badge badge-primary">${setor.membros.length} membros</span>
                </div>
            </div>
            
            <div class="setor-content">
                <h3>Membros da Equipe</h3>
                <div class="membros-lista">
                    ${membrosHtml}
                </div>
            </div>
            
            <div class="setor-actions">
                <button class="btn btn-primary" onclick="editSetor('${setor.id}'); closeModal();">
                    <i class="fas fa-edit"></i> Editar Setor
                </button>
                <button class="btn btn-info" onclick="gerenciarMembrosSetor('${setor.id}')">
                    <i class="fas fa-users"></i> Gerenciar Membros
                </button>
                <button class="btn btn-success" onclick="gerarRelatorioSetor('${setor.id}')">
                    <i class="fas fa-file-alt"></i> Relatório
                </button>
            </div>
        </div>
        
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Fechar</button>
        </div>
    `;
    
    modal.classList.add('show');
}

// Função auxiliar para obter ícone do setor
function getSetorIcon(setorId) {
    const setorNome = setorId.toLowerCase();
    const icons = {
        'cozinha': 'utensils',
        'liturgia': 'pray',
        'acolhida': 'handshake',
        'limpeza': 'broom',
        'seguranca': 'shield-alt',
        'segurança': 'shield-alt',
        'sentinela': 'eye',
        'animacao': 'music',
        'animação': 'music',
        'capela': 'church',
        'manutencao': 'tools',
        'manutenção': 'tools',
        'recreacao': 'gamepad',
        'recreação': 'gamepad',
        'secretaria': 'file-alt',
        'enfermaria': 'medkit',
        'som': 'volume-up',
        'decoracao': 'palette',
        'decoração': 'palette'
    };
    return icons[setorNome] || 'cog';
}

// Função para gerar relatório do setor
function gerarRelatorioSetor(setorId) {
    const setor = appData.setores.find(s => s.id === setorId);
    if (!setor) return;
    
    const relatorio = {
        setor: setor.nome,
        descricao: setor.descricao,
        totalMembros: setor.membros.length,
        membros: setor.membros.map(m => ({
            nome: m.nome,
            funcao: m.funcao,
            telefone: m.telefone,
            email: m.email
        })),
        dataGeracao: new Date().toLocaleDateString('pt-BR')
    };
    
    const blob = new Blob([JSON.stringify(relatorio, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${setor.nome.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Relatório gerado com sucesso!', 'success');
}

function updateSetoresList() {
    const container = document.getElementById('setores-list');
    container.innerHTML = '';
    
    // Mostrar todos os setores globais
    appData.setores.forEach(setor => {
        const setorCard = createSetorCard(setor);
        container.appendChild(setorCard);
    });
}

function createSetorCard(setor) {
    const card = document.createElement('div');
    card.className = 'data-item';
    card.innerHTML = `
        <div class="d-flex justify-between items-center mb-3">
            <h3 style="color: ${setor.cor}">${setor.nome}</h3>
            <span class="badge">${setor.membros.length} membros</span>
        </div>
        <p class="mb-3">${setor.descricao}</p>
        <div class="mb-3">
            <strong>Membros:</strong>
            ${setor.membros.length > 0 ? 
                setor.membros.map(membro => `<span class="badge badge-secondary">${membro.nome}</span>`).join(' ') : 
                '<span class="text-muted">Nenhum membro alocado</span>'
            }
        </div>
        <div class="d-flex gap-2">
            <button class="btn btn-primary" onclick="editSetor('${setor.id}')">
                <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-danger" onclick="deleteSetor('${setor.id}')">
                <i class="fas fa-trash"></i> Excluir
            </button>
            <button class="btn btn-info" onclick="gerenciarMembrosSetor('${setor.id}')">
                <i class="fas fa-users"></i> Gerenciar Membros
            </button>
        </div>
    `;
    return card;
}

function getSetorForm(setor = null) {
    const isEdit = setor !== null;
    return `
        <h2>${isEdit ? 'Editar' : 'Novo'} Setor</h2>
        <form onsubmit="saveSetor(event, ${isEdit ? "'" + setor.id + "'" : 'null'}); return false;">
            <div class="form-group">
                <label for="nome">Nome do Setor *</label>
                <input type="text" id="nome" name="nome" required value="${isEdit ? setor.nome : ''}">
            </div>
            
            <div class="form-group">
                <label for="descricao">Descrição *</label>
                <textarea id="descricao" name="descricao" rows="3" required>${isEdit ? setor.descricao || '' : ''}</textarea>
            </div>
            
            <div class="form-group">
                <label for="cor">Cor do Setor *</label>
                <input type="color" id="cor" name="cor" required value="${isEdit ? setor.cor : '#4ecdc4'}">
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar' : 'Salvar'} Setor</button>
            </div>
        </form>
    `;
}

function saveSetor(event, id = null) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const formData = new FormData(event.target);
    const setorData = {
        nome: formData.get('nome'),
        descricao: formData.get('descricao'),
        cor: formData.get('cor'),
        membros: []
    };
    
    if (id) {
        // Editar setor existente
        const setorIndex = appData.setores.findIndex(s => s.id === id);
        if (setorIndex !== -1) {
            // Manter membros existentes
            setorData.membros = appData.setores[setorIndex].membros;
            setorData.id = id;
            appData.setores[setorIndex] = setorData;
            showToast('Setor atualizado com sucesso!', 'success');
        }
    } else {
        // Criar novo setor
        setorData.id = generateId();
        appData.setores.push(setorData);
        showToast('Setor criado com sucesso!', 'success');
    }
    
    saveData();
    loadSetores();
    updateEquipeFilters();
    closeModal();
    
    return false;
}

function editSetor(id) {
    const setor = appData.setores.find(s => s.id === id);
    if (setor) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = getSetorForm(setor);
        modal.classList.add('show');
    }
}

function deleteSetor(id) {
    if (confirm('Tem certeza que deseja excluir este setor? Esta ação não pode ser desfeita.')) {
        const setorIndex = appData.setores.findIndex(s => s.id === id);
        if (setorIndex !== -1) {
            // Remover setor da equipe
            appData.equipe.forEach(membro => {
                if (membro.setorId === id) {
                    delete membro.setorId;
                }
            });
            
            appData.setores.splice(setorIndex, 1);
            saveData();
            loadSetores();
            loadEquipe();
            updateEquipeFilters();
            showToast('Setor excluído com sucesso!', 'success');
        }
    }
}

// Função para gerenciar membros de um setor
function gerenciarMembrosSetor(setorId) {
    const setor = appData.setores.find(s => s.id === setorId);
    if (!setor) {
        showToast('Setor não encontrado', 'error');
        return;
    }
    
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    // Obter membros da equipe que podem ser alocados
    const membrosDisponiveis = appData.equipe.filter(membro => !membro.setorId || membro.setorId === setorId);
    const membrosDoSetor = appData.equipe.filter(membro => membro.setorId === setorId);
    const membrosNaoAlocados = appData.equipe.filter(membro => !membro.setorId);
    
    modalBody.innerHTML = `
        <h2>Gerenciar Membros - ${setor.nome}</h2>
        
        <div class="mb-4">
            <h3>Membros Atuais (${membrosDoSetor.length})</h3>
            <div class="membros-atuais">
                ${membrosDoSetor.length > 0 ? 
                    membrosDoSetor.map(membro => `
                        <div class="membro-item-gerenciar">
                            <div class="membro-info">
                                <strong>${membro.nome}</strong><br>
                                <small>${membro.funcao} • ${membro.telefone}</small>
                            </div>
                            <button class="btn btn-sm btn-danger" onclick="removerMembroSetor('${membro.id}', '${setorId}')">
                                <i class="fas fa-times"></i> Remover
                            </button>
                        </div>
                    `).join('') : 
                    '<p class="text-muted">Nenhum membro alocado neste setor</p>'
                }
            </div>
        </div>
        
        <div class="mb-4">
            <h3>Adicionar Membros (${membrosNaoAlocados.length} disponíveis)</h3>
            <div class="membros-disponiveis">
                ${membrosNaoAlocados.length > 0 ? 
                    membrosNaoAlocados.map(membro => `
                        <div class="membro-item-gerenciar">
                            <div class="membro-info">
                                <strong>${membro.nome}</strong><br>
                                <small>${membro.funcao} • ${membro.telefone}</small>
                            </div>
                            <button class="btn btn-sm btn-primary" onclick="adicionarMembroSetor('${membro.id}', '${setorId}')">
                                <i class="fas fa-plus"></i> Adicionar
                            </button>
                        </div>
                    `).join('') : 
                    '<p class="text-muted">Todos os membros já estão alocados</p>'
                }
            </div>
        </div>
        
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Fechar</button>
        </div>
    `;
    
    modal.classList.add('show');
}

// Função para adicionar membro ao setor
function adicionarMembroSetor(membroId, setorId) {
    const membro = appData.equipe.find(m => m.id === membroId);
    const setor = appData.setores.find(s => s.id === setorId);
    
    if (!membro || !setor) {
        showToast('Erro ao adicionar membro ao setor', 'error');
        return;
    }
    
    // Atualizar membro
    membro.setorId = setorId;
    
    // Atualizar lista de membros do setor
    if (!setor.membros) setor.membros = [];
    if (!setor.membros.find(m => m.id === membroId)) {
        setor.membros.push({
            id: membro.id,
            nome: membro.nome,
            funcao: membro.funcao,
            telefone: membro.telefone,
            email: membro.email
        });
    }
    
    saveData();
    loadSetores();
    loadEquipe();
    updateDashboard();
    
    // Recarregar modal
    gerenciarMembrosSetor(setorId);
    showToast(`${membro.nome} adicionado ao setor ${setor.nome}`, 'success');
}

// Função para remover membro do setor
function removerMembroSetor(membroId, setorId) {
    const membro = appData.equipe.find(m => m.id === membroId);
    const setor = appData.setores.find(s => s.id === setorId);
    
    if (!membro || !setor) {
        showToast('Erro ao remover membro do setor', 'error');
        return;
    }
    
    // Remover setorId do membro
    delete membro.setorId;
    
    // Remover da lista de membros do setor
    if (setor.membros) {
        setor.membros = setor.membros.filter(m => m.id !== membroId);
    }
    
    saveData();
    loadSetores();
    loadEquipe();
    updateDashboard();
    
    // Recarregar modal
    gerenciarMembrosSetor(setorId);
    showToast(`${membro.nome} removido do setor ${setor.nome}`, 'success');
}

function gerenciarModalidades() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <h2>Gerenciar Modalidades</h2>
        <div class="mb-3">
            <button class="btn btn-primary" onclick="adicionarModalidade()">
                <i class="fas fa-plus"></i> Nova Modalidade
            </button>
        </div>
        
        <div class="modalidades-list">
            ${appData.modalidades.map(modalidade => `
                <div class="data-item">
                    <div class="d-flex justify-between items-center">
                        <div>
                            <h4>${modalidade.nome}</h4>
                            <p class="text-muted">${modalidade.descricao}</p>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-primary" onclick="editarModalidade('${modalidade.id}')">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="excluirModalidade('${modalidade.id}')">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="form-actions mt-3">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Fechar</button>
        </div>
    `;
    
    modal.classList.add('show');
}

function adicionarModalidade() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = getModalidadeForm();
}

function getModalidadeForm(modalidade = null) {
    const isEdit = modalidade !== null;
    return `
        <h2>${isEdit ? 'Editar' : 'Nova'} Modalidade</h2>
        <form onsubmit="salvarModalidade(event, ${isEdit ? "'" + modalidade.id + "'" : 'null'})">
            <div class="form-group">
                <label for="nome">Nome da Modalidade *</label>
                <input type="text" id="nome" name="nome" required value="${isEdit ? modalidade.nome : ''}">
            </div>
            
            <div class="form-group">
                <label for="descricao">Descrição</label>
                <textarea id="descricao" name="descricao" rows="3">${isEdit ? modalidade.descricao || '' : ''}</textarea>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="gerenciarModalidades()">Voltar</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar' : 'Salvar'} Modalidade</button>
            </div>
        </form>
    `;
}

function salvarModalidade(event, id = null) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const modalidadeData = {
        nome: formData.get('nome'),
        descricao: formData.get('descricao')
    };
    
    if (id) {
        // Editar modalidade existente
        const modalidadeIndex = appData.modalidades.findIndex(m => m.id === id);
        if (modalidadeIndex !== -1) {
            modalidadeData.id = id;
            appData.modalidades[modalidadeIndex] = modalidadeData;
            showToast('Modalidade atualizada com sucesso!', 'success');
        }
    } else {
        // Criar nova modalidade
        modalidadeData.id = generateId();
        appData.modalidades.push(modalidadeData);
        showToast('Modalidade criada com sucesso!', 'success');
    }
    
    saveData();
    updateModalidadeFilters();
    gerenciarModalidades();
}

function editarModalidade(id) {
    const modalidade = appData.modalidades.find(m => m.id === id);
    if (modalidade) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = getModalidadeForm(modalidade);
    }
}

function excluirModalidade(id) {
    // Verificar se a modalidade está sendo usada
    const acampamentosUsando = appData.acampamentos.filter(a => a.modalidade === id);
    
    if (acampamentosUsando.length > 0) {
        showToast(`Não é possível excluir esta modalidade. Ela está sendo usada por ${acampamentosUsando.length} acampamento(s).`, 'error');
        return;
    }
    
    if (confirm('Tem certeza que deseja excluir esta modalidade? Esta ação não pode ser desfeita.')) {
        const modalidadeIndex = appData.modalidades.findIndex(m => m.id === id);
        if (modalidadeIndex !== -1) {
            appData.modalidades.splice(modalidadeIndex, 1);
            saveData();
            updateModalidadeFilters();
            gerenciarModalidades();
            showToast('Modalidade excluída com sucesso!', 'success');
        }
    }
}

function updateModalidadeFilters() {
    const modalidadeFilter = document.getElementById('acampamento-modalidade-filter');
    if (modalidadeFilter) {
        // Limpar opções existentes (exceto a primeira)
        while (modalidadeFilter.children.length > 1) {
            modalidadeFilter.removeChild(modalidadeFilter.lastChild);
        }
        
        // Adicionar modalidades
        appData.modalidades.forEach(modalidade => {
            const option = document.createElement('option');
            option.value = modalidade.id;
            option.textContent = modalidade.nome;
            modalidadeFilter.appendChild(option);
        });
    }
}

// === GESTÃO DE ACAMPAMENTO ATIVO ===
function updateAcampamentoSelector() {
    // Lista de todos os seletores de acampamento
    const selectorIds = [
        'acampamentoSelect',
        'setores-acampamento-select',
        'tribos-acampamento-select',
        'campistas-acampamento-select',
        'equipe-acampamento-select',
        'financeiro-acampamento-select'
    ];
    
    selectorIds.forEach(selectorId => {
        const acampamentoSelect = document.getElementById(selectorId);
        if (!acampamentoSelect) return;
        
        // Limpar opções existentes
        acampamentoSelect.innerHTML = '<option value="">Selecione um acampamento...</option>';
        
        // Adicionar acampamentos disponíveis
        appData.acampamentos.forEach(acampamento => {
            const option = document.createElement('option');
            option.value = acampamento.id;
            option.textContent = `${acampamento.nome} - ${formatDate(acampamento.dataInicio)}`;
            acampamentoSelect.appendChild(option);
        });
        
        // Selecionar acampamento ativo se existir
        if (acampamentoAtivo) {
            acampamentoSelect.value = acampamentoAtivo;
        }
    });
}

function selecionarAcampamento(acampamentoId) {
    acampamentoAtivo = acampamentoId || null;
    
    // Salvar no localStorage
    if (acampamentoAtivo) {
        localStorage.setItem('acampamentoAtivo', acampamentoAtivo);
    } else {
        localStorage.removeItem('acampamentoAtivo');
    }
    
    // Recarregar dados das abas que dependem do acampamento
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        const tabName = activeTab.getAttribute('onclick').match(/showTab\('(.+)'\)/)[1];
        if (tabName !== 'acampamentos' && tabName !== 'dashboard') {
            showTab(tabName);
        }
    }
    
    showToast(acampamentoAtivo ? 'Acampamento selecionado!' : 'Seleção de acampamento removida', 'info');
}

function getAcampamentoAtivo() {
    return acampamentoAtivo;
}

function requireAcampamentoAtivo() {
    if (!acampamentoAtivo) {
        showToast('Selecione um acampamento primeiro!', 'warning');
        return false;
    }
    return true;
}

// === GESTÃO DE ASSOCIAÇÕES SETOR-ACAMPAMENTO ===
function associarSetorAcampamento(setorId, acampamentoId) {
    const associacaoExiste = appData.acampamentoSetores.some(
        assoc => assoc.setorId === setorId && assoc.acampamentoId === acampamentoId
    );
    
    if (!associacaoExiste) {
        appData.acampamentoSetores.push({ setorId, acampamentoId });
        saveData();
    }
}

function desassociarSetorAcampamento(setorId, acampamentoId) {
    appData.acampamentoSetores = appData.acampamentoSetores.filter(
        assoc => !(assoc.setorId === setorId && assoc.acampamentoId === acampamentoId)
    );
    saveData();
}

function getSetoresDisponiveis(acampamentoId) {
    const setoresAssociados = appData.acampamentoSetores
        .filter(assoc => assoc.acampamentoId === acampamentoId)
        .map(assoc => assoc.setorId);
    return appData.setores.filter(setor => !setoresAssociados.includes(setor.id));
}

// === GESTÃO DE ASSOCIAÇÕES TRIBO-ACAMPAMENTO ===
function associarTriboAcampamento(triboId, acampamentoId) {
    const associacaoExiste = appData.acampamentoTribos.some(
        assoc => assoc.triboId === triboId && assoc.acampamentoId === acampamentoId
    );
    
    if (!associacaoExiste) {
        appData.acampamentoTribos.push({ triboId, acampamentoId });
        saveData();
    }
}

function desassociarTriboAcampamento(triboId, acampamentoId) {
    appData.acampamentoTribos = appData.acampamentoTribos.filter(
        assoc => !(assoc.triboId === triboId && assoc.acampamentoId === acampamentoId)
    );
    saveData();
}

function getTribosDisponiveis(acampamentoId) {
    const tribosAssociadas = appData.acampamentoTribos
        .filter(assoc => assoc.acampamentoId === acampamentoId)
        .map(assoc => assoc.triboId);
    return appData.tribos.filter(tribo => !tribosAssociadas.includes(tribo.id));
}

// === INTERFACE DE GESTÃO DE ASSOCIAÇÕES ===
function gerenciarSetoresAcampamento() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    const acampamentosOptions = appData.acampamentos.map(a => 
        `<option value="${a.id}">${a.nome}</option>`
    ).join('');
    
    modalBody.innerHTML = `
        <h2>Associar Setores a Acampamentos</h2>
        <div class="form-group">
            <label for="acampamento-associacao">Selecione o Acampamento:</label>
            <select id="acampamento-associacao" onchange="carregarAssociacaoSetores(this.value)">
                <option value="">Selecione um acampamento...</option>
                ${acampamentosOptions}
            </select>
        </div>
        
        <div id="associacao-setores-container" style="display: none;">
            <h3>Setores Disponíveis</h3>
            <div id="setores-disponiveis" class="association-list"></div>
            
            <h3>Setores Associados</h3>
            <div id="setores-associados" class="association-list"></div>
        </div>
        
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Fechar</button>
        </div>
    `;
    
    modal.classList.add('show');
}

function carregarAssociacaoSetores(acampamentoId) {
    if (!acampamentoId) {
        document.getElementById('associacao-setores-container').style.display = 'none';
        return;
    }
    
    document.getElementById('associacao-setores-container').style.display = 'block';
    
    const setoresAssociados = getSetoresByAcampamento();
    const setoresDisponiveis = getSetoresDisponiveis(acampamentoId);
    
    // Renderizar setores disponíveis
    const containerDisponiveis = document.getElementById('setores-disponiveis');
    containerDisponiveis.innerHTML = setoresDisponiveis.length === 0 ? 
        '<p class="text-muted">Todos os setores já estão associados</p>' :
        setoresDisponiveis.map(setor => `
            <div class="association-item">
                <span>${setor.nome}</span>
                <button class="btn btn-sm btn-primary" onclick="associarSetorAcampamento('${setor.id}', '${acampamentoId}'); carregarAssociacaoSetores('${acampamentoId}')">
                    <i class="fas fa-plus"></i> Associar
                </button>
            </div>
        `).join('');
    
    // Renderizar setores associados
    const containerAssociados = document.getElementById('setores-associados');
    containerAssociados.innerHTML = setoresAssociados.length === 0 ? 
        '<p class="text-muted">Nenhum setor associado ainda</p>' :
        setoresAssociados.map(setor => `
            <div class="association-item">
                <span>${setor.nome}</span>
                <button class="btn btn-sm btn-danger" onclick="desassociarSetorAcampamento('${setor.id}', '${acampamentoId}'); carregarAssociacaoSetores('${acampamentoId}')">
                    <i class="fas fa-times"></i> Remover
                </button>
            </div>
        `).join('');
}

function gerenciarTribosAcampamento() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    const acampamentosOptions = appData.acampamentos.map(a => 
        `<option value="${a.id}">${a.nome}</option>`
    ).join('');
    
    modalBody.innerHTML = `
        <h2>Associar Tribos a Acampamentos</h2>
        <div class="form-group">
            <label for="acampamento-associacao-tribos">Selecione o Acampamento:</label>
            <select id="acampamento-associacao-tribos" onchange="carregarAssociacaoTribos(this.value)">
                <option value="">Selecione um acampamento...</option>
                ${acampamentosOptions}
            </select>
        </div>
        
        <div id="associacao-tribos-container" style="display: none;">
            <h3>Tribos Disponíveis</h3>
            <div id="tribos-disponiveis" class="association-list"></div>
            
            <h3>Tribos Associadas</h3>
            <div id="tribos-associadas" class="association-list"></div>
        </div>
        
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Fechar</button>
        </div>
    `;
    
    modal.classList.add('show');
}

function carregarAssociacaoTribos(acampamentoId) {
    if (!acampamentoId) {
        document.getElementById('associacao-tribos-container').style.display = 'none';
        return;
    }
    
    document.getElementById('associacao-tribos-container').style.display = 'block';
    
    const tribosAssociadas = appData.acampamentoTribos
        .filter(assoc => assoc.acampamentoId === acampamentoId)
        .map(assoc => appData.tribos.find(t => t.id === assoc.triboId))
        .filter(t => t); // Remove undefined
    const tribosDisponiveis = getTribosDisponiveis(acampamentoId);
    
    // Renderizar tribos disponíveis
    const containerDisponiveis = document.getElementById('tribos-disponiveis');
    containerDisponiveis.innerHTML = tribosDisponiveis.length === 0 ? 
        '<p class="text-muted">Todas as tribos já estão associadas</p>' :
        tribosDisponiveis.map(tribo => `
            <div class="association-item">
                <span>${tribo.nome}</span>
                <button class="btn btn-sm btn-primary" onclick="associarTriboAcampamento('${tribo.id}', '${acampamentoId}'); carregarAssociacaoTribos('${acampamentoId}')">
                    <i class="fas fa-plus"></i> Associar
                </button>
            </div>
        `).join('');
    
    // Renderizar tribos associadas
    const containerAssociadas = document.getElementById('tribos-associadas');
    containerAssociadas.innerHTML = tribosAssociadas.length === 0 ? 
        '<p class="text-muted">Nenhuma tribo associada ainda</p>' :
        tribosAssociadas.map(tribo => `
            <div class="association-item">
                <span>${tribo.nome}</span>
                <button class="btn btn-sm btn-danger" onclick="desassociarTriboAcampamento('${tribo.id}', '${acampamentoId}'); carregarAssociacaoTribos('${acampamentoId}')">
                    <i class="fas fa-times"></i> Remover
                </button>
            </div>
        `).join('');
}

// === GESTÃO DE TRIBOS ===
function loadTribos() {
    const container = document.getElementById('tribos-grid');
    if (container) {
        container.innerHTML = '';
        
        // Mostrar todas as tribos globais
        if (appData.tribos.length === 0) {
            container.innerHTML = '<div class="text-center p-4"><p>Nenhuma tribo cadastrada ainda.</p></div>';
        } else {
            appData.tribos.forEach(tribo => {
                const triboCard = createTriboCard(tribo);
                container.appendChild(triboCard);
            });
        }
    }
    
    // Atualizar seletor de tribo na interface de campistas
    loadTribeSelector();
}

function loadTribeSelector() {
    const tribeSelector = document.getElementById('tribe-selector');
    if (!tribeSelector) return;
    
    // Limpar opções existentes
    tribeSelector.innerHTML = '<option value="">Selecione uma tribo...</option>';
    
    // Adicionar tribos do acampamento ativo
    const tribosDoAcampamento = getTribosByAcampamento();
    tribosDoAcampamento.forEach(tribo => {
        const option = document.createElement('option');
        option.value = tribo.id;
        option.textContent = tribo.nome;
        tribeSelector.appendChild(option);
    });
    
    // Atualizar informações de seleção quando a tribo mudar
    tribeSelector.onchange = updateSelectionInfo;
}

function getTribosByAcampamento() {
    if (!acampamentoAtivo) return [];
    // Retorna tribos associadas ao acampamento ativo
    const tribosAssociadas = appData.acampamentoTribos
        .filter(assoc => assoc.acampamentoId === acampamentoAtivo)
        .map(assoc => assoc.triboId);
    return appData.tribos.filter(tribo => tribosAssociadas.includes(tribo.id));
}

function createTriboCard(tribo) {
    const card = document.createElement('div');
    card.className = 'tribo-card';
    card.style.setProperty('--tribo-color', tribo.cor);
    card.innerHTML = `
        <div class="d-flex justify-between items-center mb-3">
            <h3>${tribo.nome}</h3>
            <div class="d-flex items-center gap-2">
                <div style="width: 20px; height: 20px; background: ${tribo.cor}; border-radius: 50%;"></div>
                <span class="badge">${tribo.membros ? tribo.membros.length : 0} membros</span>
            </div>
        </div>
        <div class="mb-2"><strong>Líder:</strong> ${tribo.lider || 'Não definido'}</div>
        <div class="mb-2"><strong>Acampamento:</strong> ${getAcampamentoNome(tribo.acampamentoId)}</div>
        <div class="mb-3"><strong>Grito de Guerra:</strong> ${tribo.gritoGuerra || 'Não definido'}</div>
        <div class="d-flex gap-2">
            <button class="btn btn-primary" onclick="editTribo('${tribo.id}')">
                <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-danger" onclick="deleteTribo('${tribo.id}')">
                <i class="fas fa-trash"></i> Excluir
            </button>
            <button class="btn btn-info" onclick="gerenciarMembrosTribo('${tribo.id}')">
                <i class="fas fa-users"></i> Membros
            </button>
        </div>
    `;
    return card;
}

function getTriboForm(tribo = null) {
    const isEdit = tribo !== null;
    
    return `
        <h2>${isEdit ? 'Editar' : 'Nova'} Tribo</h2>
        <form onsubmit="saveTribo(event, ${isEdit ? "'" + tribo.id + "'" : 'null'})">
            <div class="form-group">
                <label for="nome">Nome da Tribo *</label>
                <input type="text" id="nome" name="nome" required value="${isEdit ? tribo.nome : ''}">
            </div>
            
            <div class="form-group">
                <label for="cor">Cor da Tribo *</label>
                <input type="color" id="cor" name="cor" required value="${isEdit ? tribo.cor : '#667eea'}">
            </div>
            
            <div class="form-group">
                <label for="lider">Líder da Tribo</label>
                <input type="text" id="lider" name="lider" value="${isEdit ? tribo.lider || '' : ''}">
            </div>
            
            <div class="form-group">
                <label for="gritoGuerra">Grito de Guerra</label>
                <textarea id="gritoGuerra" name="gritoGuerra" rows="2">${isEdit ? tribo.gritoGuerra || '' : ''}</textarea>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar' : 'Salvar'}</button>
            </div>
        </form>
    `;
}

function saveTribo(event, id = null) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const tribo = {
        id: id || generateId(),
        nome: formData.get('nome'),
        cor: formData.get('cor'),
        lider: formData.get('lider'),
        gritoGuerra: formData.get('gritoGuerra'),
        membros: id ? appData.tribos.find(t => t.id === id).membros || [] : [],
        criadoEm: id ? appData.tribos.find(t => t.id === id).criadoEm : new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
    };
    
    if (id) {
        const index = appData.tribos.findIndex(t => t.id === id);
        appData.tribos[index] = tribo;
        showToast('Tribo atualizada com sucesso!', 'success');
    } else {
        appData.tribos.push(tribo);
        showToast('Tribo criada com sucesso!', 'success');
    }
    
    saveData();
    loadTribos();
    closeModal();
}

function editTribo(id) {
    const tribo = appData.tribos.find(t => t.id === id);
    if (tribo) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = getTriboForm(tribo);
        modal.classList.add('show');
    }
}

function deleteTribo(id) {
    if (confirm('Tem certeza que deseja excluir esta tribo?')) {
        appData.tribos = appData.tribos.filter(t => t.id !== id);
        saveData();
        loadTribos();
        showToast('Tribo excluída com sucesso!', 'success');
    }
}

function gerenciarMembrosTribo(triboId) {
    const tribo = appData.tribos.find(t => t.id === triboId);
    if (!tribo) return;
    
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    const campistasDisponiveis = appData.campistas.filter(c => 
        c.acampamentoId === tribo.acampamentoId && (!c.triboId || c.triboId === triboId)
    );
    
    const membrosAtuais = appData.campistas.filter(c => c.triboId === triboId);
    
    modalBody.innerHTML = `
        <h2>Gerenciar Membros - ${tribo.nome}</h2>
        <div class="row">
            <div class="col-md-6">
                <h3>Membros Atuais (${membrosAtuais.length})</h3>
                <div id="membros-atuais" class="members-list">
                    ${membrosAtuais.length === 0 ? 
                        '<p class="text-muted">Nenhum membro na tribo ainda.</p>' :
                        membrosAtuais.map(m => `
                            <div class="member-item d-flex justify-between items-center">
                                <span>${m.nome}</span>
                                <button class="btn btn-sm btn-danger" onclick="removerMembroTribo('${m.id}', '${triboId}')">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
            <div class="col-md-6">
                <h3>Campistas Disponíveis</h3>
                <div id="campistas-disponiveis" class="members-list">
                    ${campistasDisponiveis.filter(c => !c.triboId).length === 0 ? 
                        '<p class="text-muted">Todos os campistas já estão em tribos.</p>' :
                        campistasDisponiveis.filter(c => !c.triboId).map(c => `
                            <div class="member-item d-flex justify-between items-center">
                                <span>${c.nome}</span>
                                <button class="btn btn-sm btn-success" onclick="adicionarMembroTribo('${c.id}', '${triboId}')">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        </div>
        <div class="form-actions mt-4">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Fechar</button>
        </div>
    `;
    
    modal.classList.add('show');
}

function adicionarMembroTribo(campistaId, triboId) {
    const campista = appData.campistas.find(c => c.id === campistaId);
    const tribo = appData.tribos.find(t => t.id === triboId);
    
    if (campista && tribo) {
        campista.triboId = triboId;
        
        // Atualizar lista de membros da tribo
        if (!tribo.membros) tribo.membros = [];
        if (!tribo.membros.includes(campistaId)) {
            tribo.membros.push(campistaId);
        }
        
        saveData();
        gerenciarMembrosTribo(triboId); // Recarregar modal
        loadTribos(); // Atualizar contadores
        showToast(`${campista.nome} adicionado à tribo ${tribo.nome}!`, 'success');
    }
}

function removerMembroTribo(campistaId, triboId) {
    const campista = appData.campistas.find(c => c.id === campistaId);
    const tribo = appData.tribos.find(t => t.id === triboId);
    
    if (campista && tribo) {
        campista.triboId = null;
        
        // Remover da lista de membros da tribo
        if (tribo.membros) {
            tribo.membros = tribo.membros.filter(id => id !== campistaId);
        }
        
        saveData();
        gerenciarMembrosTribo(triboId); // Recarregar modal
        loadTribos(); // Atualizar contadores
        showToast(`${campista.nome} removido da tribo ${tribo.nome}!`, 'success');
    }
}

// === GESTÃO DE CAMPISTAS ===
function loadCampistas() {
    const container = document.getElementById('campistas-list');
    container.innerHTML = '';
    
    const campistasFiltrados = getCampistasByAcampamento();
    
    if (campistasFiltrados.length === 0) {
        container.innerHTML = '<div class="text-center p-4"><p>Nenhum campista cadastrado para este acampamento.</p></div>';
        // Atualizar informações de seleção mesmo quando não há campistas
        setTimeout(updateSelectionInfo, 100);
        return;
    }
    
    campistasFiltrados.forEach(campista => {
        const campistaCard = createCampistaCard(campista);
        container.appendChild(campistaCard);
    });
    
    // Atualizar informações de seleção após carregar os campistas
    setTimeout(updateSelectionInfo, 100);
}

function getCampistasByAcampamento() {
    if (!acampamentoAtivo) return [];
    return appData.campistas.filter(campista => campista.acampamentoId === acampamentoAtivo);
}

function createCampistaCard(campista) {
    const card = document.createElement('div');
    card.className = 'data-item';
    card.innerHTML = `
        <div class="d-flex justify-between items-center mb-3">
            <div class="d-flex align-items-center gap-3">
                <input type="checkbox" class="campista-checkbox" data-campista-id="${campista.id}" onchange="updateSelectionInfo()" style="transform: scale(1.2);">
                <h3 style="margin: 0;">${campista.nome}</h3>
            </div>
            <span class="badge badge-${getStatusColor(campista.status)}">${campista.status}</span>
        </div>
        <div class="form-row mb-2">
            <div><strong>Idade:</strong> ${campista.idade} anos</div>
            <div><strong>Telefone:</strong> ${campista.telefone}</div>
        </div>
        <div class="form-row mb-2">
            <div><strong>Acampamento:</strong> ${getAcampamentoNome(campista.acampamentoId)}</div>
            <div><strong>Tribo:</strong> ${getTriboNome(campista.triboId)}</div>
        </div>
        <div class="mb-2"><strong>Paróquia:</strong> ${campista.paroquia || 'Não informado'}</div>
        <div class="d-flex gap-2">
            <button class="btn btn-primary" onclick="editCampista('${campista.id}')">
                <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-danger" onclick="deleteCampista('${campista.id}')">
                <i class="fas fa-trash"></i> Excluir
            </button>
            <button class="btn btn-info" onclick="viewCampistaDetails('${campista.id}')">
                <i class="fas fa-eye"></i> Detalhes
            </button>
        </div>
    `;
    return card;
}

// === FUNÇÕES DE ATRIBUIÇÃO DE TRIBO ===
function updateSelectionInfo() {
    const checkboxes = document.querySelectorAll('.campista-checkbox');
    const selectedCheckboxes = document.querySelectorAll('.campista-checkbox:checked');
    const selectedCount = selectedCheckboxes.length;
    const totalCount = checkboxes.length;
    
    const infoElement = document.getElementById('selection-info');
    const selectAllBtn = document.getElementById('select-all-btn');
    const assignBtn = document.getElementById('assign-tribe-btn');
    const removeBtn = document.getElementById('remove-tribe-btn');
    const tribeSelector = document.getElementById('tribe-selector');
    
    // Atualizar informações de seleção
    if (selectedCount > 0) {
        infoElement.textContent = `${selectedCount} de ${totalCount} campistas selecionados`;
        infoElement.style.color = '#007bff';
    } else {
        infoElement.textContent = `${totalCount} campistas disponíveis`;
        infoElement.style.color = '#6c757d';
    }
    
    // Atualizar estado dos botões
    const hasSelection = selectedCount > 0;
    const hasTribeSelected = tribeSelector.value !== '';
    
    selectAllBtn.disabled = totalCount === 0;
    assignBtn.disabled = !hasSelection || !hasTribeSelected;
    removeBtn.disabled = !hasSelection;
    
    // Atualizar texto do botão selecionar todos
    if (selectedCount === totalCount && totalCount > 0) {
        selectAllBtn.innerHTML = '<i class="fas fa-square"></i> Desmarcar Todos';
    } else {
        selectAllBtn.innerHTML = '<i class="fas fa-check-square"></i> Selecionar Todos';
    }
}

function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('.campista-checkbox');
    const selectedCheckboxes = document.querySelectorAll('.campista-checkbox:checked');
    const shouldSelect = selectedCheckboxes.length !== checkboxes.length;
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = shouldSelect;
    });
    
    updateSelectionInfo();
}

function assignSelectedToTribe() {
    const selectedCheckboxes = document.querySelectorAll('.campista-checkbox:checked');
    const tribeSelector = document.getElementById('tribe-selector');
    const selectedTribeId = tribeSelector.value;
    
    if (!selectedTribeId) {
        showToast('Selecione uma tribo primeiro', 'warning');
        return;
    }
    
    if (selectedCheckboxes.length === 0) {
        showToast('Selecione pelo menos um campista', 'warning');
        return;
    }
    
    const tribo = appData.tribos.find(t => t.id === selectedTribeId);
    if (!tribo) {
        showToast('Tribo não encontrada', 'error');
        return;
    }
    
    let assignedCount = 0;
    selectedCheckboxes.forEach(checkbox => {
        const campistaId = checkbox.getAttribute('data-campista-id');
        const campista = appData.campistas.find(c => c.id === campistaId);
        
        if (campista) {
            // Remover da tribo anterior se existir
            if (campista.triboId) {
                const oldTribo = appData.tribos.find(t => t.id === campista.triboId);
                if (oldTribo && oldTribo.membros) {
                    oldTribo.membros = oldTribo.membros.filter(id => id !== campistaId);
                }
            }
            
            // Atribuir à nova tribo
            campista.triboId = selectedTribeId;
            
            // Adicionar à lista de membros da tribo
            if (!tribo.membros) tribo.membros = [];
            if (!tribo.membros.includes(campistaId)) {
                tribo.membros.push(campistaId);
            }
            
            assignedCount++;
        }
    });
    
    if (assignedCount > 0) {
        saveData();
        loadCampistas(); // Recarregar lista para mostrar as mudanças
        loadTribos(); // Atualizar contadores das tribos
        
        // Limpar seleções
        document.querySelectorAll('.campista-checkbox').forEach(cb => cb.checked = false);
        updateSelectionInfo();
        
        showToast(`${assignedCount} campista(s) atribuído(s) à tribo ${tribo.nome}!`, 'success');
    }
}

function removeSelectedFromTribe() {
    const selectedCheckboxes = document.querySelectorAll('.campista-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        showToast('Selecione pelo menos um campista', 'warning');
        return;
    }
    
    let removedCount = 0;
    selectedCheckboxes.forEach(checkbox => {
        const campistaId = checkbox.getAttribute('data-campista-id');
        const campista = appData.campistas.find(c => c.id === campistaId);
        
        if (campista && campista.triboId) {
            // Remover da tribo atual
            const tribo = appData.tribos.find(t => t.id === campista.triboId);
            if (tribo && tribo.membros) {
                tribo.membros = tribo.membros.filter(id => id !== campistaId);
            }
            
            campista.triboId = null;
            removedCount++;
        }
    });
    
    if (removedCount > 0) {
        saveData();
        loadCampistas(); // Recarregar lista para mostrar as mudanças
        loadTribos(); // Atualizar contadores das tribos
        
        // Limpar seleções
        document.querySelectorAll('.campista-checkbox').forEach(cb => cb.checked = false);
        updateSelectionInfo();
        
        showToast(`${removedCount} campista(s) removido(s) das tribos!`, 'success');
    } else {
        showToast('Nenhum campista selecionado possui tribo para remover', 'info');
    }
}

function getCampistaForm(campista = null) {
    const isEdit = campista !== null;
    const acampamentosOptions = appData.acampamentos.map(a => 
        `<option value="${a.id}" ${isEdit && campista.acampamentoId === a.id ? 'selected' : ''}>${a.nome}</option>`
    ).join('');
    
    return `
        <h2>${isEdit ? 'Editar' : 'Novo'} Campista</h2>
        <form onsubmit="saveCampista(event, ${isEdit ? "'" + campista.id + "'" : 'null'})">
            <div class="form-group">
                <label for="nome">Nome Completo *</label>
                <input type="text" id="nome" name="nome" required value="${isEdit ? campista.nome : ''}">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="idade">Idade *</label>
                    <input type="number" id="idade" name="idade" required min="1" max="120" value="${isEdit ? campista.idade : ''}">
                </div>
                
                <div class="form-group">
                    <label for="sexo">Sexo *</label>
                    <select id="sexo" name="sexo" required>
                        <option value="">Selecione...</option>
                        <option value="masculino" ${isEdit && campista.sexo === 'masculino' ? 'selected' : ''}>Masculino</option>
                        <option value="feminino" ${isEdit && campista.sexo === 'feminino' ? 'selected' : ''}>Feminino</option>
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="telefone">Telefone *</label>
                    <input type="tel" id="telefone" name="telefone" required value="${isEdit ? campista.telefone : ''}">
                </div>
                
                <div class="form-group">
                    <label for="email">E-mail</label>
                    <input type="email" id="email" name="email" value="${isEdit ? campista.email || '' : ''}">
                </div>
            </div>
            
            <div class="form-group">
                <label for="endereco">Endereço Completo</label>
                <textarea id="endereco" name="endereco" rows="2">${isEdit ? campista.endereco || '' : ''}</textarea>
            </div>
            
            <div class="form-group">
                <label for="acampamentoId">Acampamento *</label>
                <select id="acampamentoId" name="acampamentoId" required>
                    <option value="">Selecione...</option>
                    ${acampamentosOptions}
                </select>
            </div>
            
            <!-- Dados Católicos -->
            <h3 class="section-title">Dados Católicos</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="paroquia">Paróquia *</label>
                    <input type="text" id="paroquia" name="paroquia" required value="${isEdit ? campista.paroquia || '' : ''}">
                </div>
                
                <div class="form-group">
                    <label for="pastoral">Pastoral/Movimento</label>
                    <input type="text" id="pastoral" name="pastoral" value="${isEdit ? campista.pastoral || '' : ''}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="batizado">Batizado *</label>
                    <select id="batizado" name="batizado" required>
                        <option value="">Selecione...</option>
                        <option value="sim" ${isEdit && campista.batizado === 'sim' ? 'selected' : ''}>Sim</option>
                        <option value="nao" ${isEdit && campista.batizado === 'nao' ? 'selected' : ''}>Não</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="crismado">Crismado</label>
                    <select id="crismado" name="crismado">
                        <option value="">Selecione...</option>
                        <option value="sim" ${isEdit && campista.crismado === 'sim' ? 'selected' : ''}>Sim</option>
                        <option value="nao" ${isEdit && campista.crismado === 'nao' ? 'selected' : ''}>Não</option>
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="primeiraEucaristia">Primeira Eucaristia</label>
                    <select id="primeiraEucaristia" name="primeiraEucaristia">
                        <option value="">Selecione...</option>
                        <option value="sim" ${isEdit && campista.primeiraEucaristia === 'sim' ? 'selected' : ''}>Sim</option>
                        <option value="nao" ${isEdit && campista.primeiraEucaristia === 'nao' ? 'selected' : ''}>Não</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="experienciaAcampamento">Já participou de acampamento?</label>
                    <select id="experienciaAcampamento" name="experienciaAcampamento">
                        <option value="">Selecione...</option>
                        <option value="primeira-vez" ${isEdit && campista.experienciaAcampamento === 'primeira-vez' ? 'selected' : ''}>Primeira vez</option>
                        <option value="1-3-vezes" ${isEdit && campista.experienciaAcampamento === '1-3-vezes' ? 'selected' : ''}>1 a 3 vezes</option>
                        <option value="mais-3-vezes" ${isEdit && campista.experienciaAcampamento === 'mais-3-vezes' ? 'selected' : ''}>Mais de 3 vezes</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label for="motivacao">Por que deseja participar do acampamento?</label>
                <textarea id="motivacao" name="motivacao" rows="2" placeholder="Conte-nos sua motivação...">${isEdit ? campista.motivacao || '' : ''}</textarea>
            </div>
            
            <!-- Dados Médicos -->
            <h3 class="section-title">Informações Médicas</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="tipoSanguineo">Tipo Sanguíneo</label>
                    <select id="tipoSanguineo" name="tipoSanguineo">
                        <option value="">Selecione...</option>
                        <option value="A+" ${isEdit && campista.tipoSanguineo === 'A+' ? 'selected' : ''}>A+</option>
                        <option value="A-" ${isEdit && campista.tipoSanguineo === 'A-' ? 'selected' : ''}>A-</option>
                        <option value="B+" ${isEdit && campista.tipoSanguineo === 'B+' ? 'selected' : ''}>B+</option>
                        <option value="B-" ${isEdit && campista.tipoSanguineo === 'B-' ? 'selected' : ''}>B-</option>
                        <option value="AB+" ${isEdit && campista.tipoSanguineo === 'AB+' ? 'selected' : ''}>AB+</option>
                        <option value="AB-" ${isEdit && campista.tipoSanguineo === 'AB-' ? 'selected' : ''}>AB-</option>
                        <option value="O+" ${isEdit && campista.tipoSanguineo === 'O+' ? 'selected' : ''}>O+</option>
                        <option value="O-" ${isEdit && campista.tipoSanguineo === 'O-' ? 'selected' : ''}>O-</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="planoSaude">Plano de Saúde</label>
                    <input type="text" id="planoSaude" name="planoSaude" placeholder="Nome do plano e número" value="${isEdit ? campista.planoSaude || '' : ''}">
                </div>
            </div>
            
            <div class="form-group">
                <label for="alergias">Alergias</label>
                <textarea id="alergias" name="alergias" rows="2" placeholder="Descreva todas as alergias conhecidas">${isEdit ? campista.alergias || '' : ''}</textarea>
            </div>
            
            <div class="form-group">
                <label for="medicamentos">Medicamentos de Uso Contínuo</label>
                <textarea id="medicamentos" name="medicamentos" rows="2" placeholder="Liste medicamentos, dosagem e horários">${isEdit ? campista.medicamentos || '' : ''}</textarea>
            </div>
            
            <div class="form-group">
                <label for="restricoesAlimentares">Restrições Alimentares</label>
                <textarea id="restricoesAlimentares" name="restricoesAlimentares" rows="2" placeholder="Vegetariano, intolerâncias, etc.">${isEdit ? campista.restricoesAlimentares || '' : ''}</textarea>
            </div>
            
            <div class="form-group">
                <label for="observacoesMedicas">Outras Observações Médicas</label>
                <textarea id="observacoesMedicas" name="observacoesMedicas" rows="3" placeholder="Condições médicas, limitações físicas, etc.">${isEdit ? campista.observacoesMedicas || '' : ''}</textarea>
            </div>
            
            <!-- Contatos de Emergência -->
            <h3 class="section-title">Contatos de Emergência</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="nomeEmergencia1">Nome do Contato 1 *</label>
                    <input type="text" id="nomeEmergencia1" name="nomeEmergencia1" required placeholder="Ex: Maria Silva" value="${isEdit ? campista.nomeEmergencia1 || '' : ''}">
                </div>
                
                <div class="form-group">
                    <label for="telefoneEmergencia1">Telefone do Contato 1 *</label>
                    <input type="tel" id="telefoneEmergencia1" name="telefoneEmergencia1" required placeholder="Ex: (11) 99999-9999" value="${isEdit ? campista.telefoneEmergencia1 || '' : ''}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="parentesco1">Parentesco *</label>
                    <input type="text" id="parentesco1" name="parentesco1" required placeholder="Ex: Mãe, Pai, Irmão" value="${isEdit ? campista.parentesco1 || '' : ''}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="nomeEmergencia2">Nome do Contato 2</label>
                    <input type="text" id="nomeEmergencia2" name="nomeEmergencia2" placeholder="Ex: João Silva" value="${isEdit ? campista.nomeEmergencia2 || '' : ''}">
                </div>
                
                <div class="form-group">
                    <label for="telefoneEmergencia2">Telefone do Contato 2</label>
                    <input type="tel" id="telefoneEmergencia2" name="telefoneEmergencia2" placeholder="Ex: (11) 88888-8888" value="${isEdit ? campista.telefoneEmergencia2 || '' : ''}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="parentesco2">Parentesco</label>
                    <input type="text" id="parentesco2" name="parentesco2" placeholder="Ex: Tio, Avó" value="${isEdit ? campista.parentesco2 || '' : ''}">
                </div>
            </div>
            
            <div class="form-group">
                <label for="status">Status</label>
                <select id="status" name="status">
                    <option value="inscrito" ${isEdit && campista.status === 'inscrito' ? 'selected' : ''}>Inscrito</option>
                    <option value="confirmado" ${isEdit && campista.status === 'confirmado' ? 'selected' : ''}>Confirmado</option>
                    <option value="presente" ${isEdit && campista.status === 'presente' ? 'selected' : ''}>Presente</option>
                </select>
            </div>
            
            <!-- Perguntas Personalizadas -->
            ${getPerguntasPersonalizadas('campista', campista)}
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar' : 'Salvar'}</button>
            </div>
        </form>
    `;
}

function saveCampista(event, id = null) {
    event.preventDefault();
    
    if (!requireAcampamentoAtivo()) return;
    
    const formData = new FormData(event.target);
    const campista = {
        id: id || generateId(),
        nome: formData.get('nome'),
        idade: parseInt(formData.get('idade')),
        sexo: formData.get('sexo'),
        telefone: formData.get('telefone'),
        email: formData.get('email'),
        endereco: formData.get('endereco'),
        acampamentoId: acampamentoAtivo,
        triboId: formData.get('triboId') || null,
        
        // Dados Católicos
        paroquia: formData.get('paroquia'),
        pastoral: formData.get('pastoral'),
        batizado: formData.get('batizado'),
        crismado: formData.get('crismado'),
        primeiraEucaristia: formData.get('primeiraEucaristia'),
        experienciaAcampamento: formData.get('experienciaAcampamento'),
        motivacao: formData.get('motivacao'),
        
        // Dados Médicos
        tipoSanguineo: formData.get('tipoSanguineo'),
        planoSaude: formData.get('planoSaude'),
        alergias: formData.get('alergias'),
        medicamentos: formData.get('medicamentos'),
        restricoesAlimentares: formData.get('restricoesAlimentares'),
        observacoesMedicas: formData.get('observacoesMedicas'),
        
        // Contatos de Emergência
        nomeEmergencia1: formData.get('nomeEmergencia1'),
        telefoneEmergencia1: formData.get('telefoneEmergencia1'),
        parentesco1: formData.get('parentesco1'),
        nomeEmergencia2: formData.get('nomeEmergencia2'),
        telefoneEmergencia2: formData.get('telefoneEmergencia2'),
        parentesco2: formData.get('parentesco2'),
        
        status: formData.get('status') || 'inscrito',
        criadoEm: id ? appData.campistas.find(c => c.id === id).criadoEm : new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
    };
    
    // Salvar respostas das perguntas personalizadas
    const perguntasCampista = appData.perguntasPersonalizadas.campista || [];
    campista.perguntasPersonalizadas = {};
    perguntasCampista.forEach(pergunta => {
        const valor = formData.get(`pergunta_${pergunta.id}`);
        if (valor !== null && valor !== '') {
            campista.perguntasPersonalizadas[pergunta.id] = valor;
        }
    });
    
    if (id) {
        const index = appData.campistas.findIndex(c => c.id === id);
        appData.campistas[index] = campista;
        showToast('Campista atualizado com sucesso!', 'success');
        saveData();
        loadCampistas();
        closeModal();
        updateDashboard();
    } else {
        appData.campistas.push(campista);
        showToast('Campista cadastrado com sucesso!', 'success');
        saveData();
        loadCampistas();
        updateDashboard();
        
        // Abrir novo formulário de cadastro após salvar
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = getCampistaForm();
        modal.classList.add('show');
    }
}

function editCampista(id) {
    const campista = appData.campistas.find(c => c.id === id);
    if (campista) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = getCampistaForm(campista);
        modal.classList.add('show');
    }
}

function deleteCampista(id) {
    if (confirm('Tem certeza que deseja excluir este campista?')) {
        appData.campistas = appData.campistas.filter(c => c.id !== id);
        saveData();
        loadCampistas();
        updateDashboard();
        showToast('Campista excluído com sucesso!', 'success');
    }
}

function viewAcampamentoDetails(id) {
    const acampamento = appData.acampamentos.find(a => a.id === id);
    if (!acampamento) return;
    
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    // Obter estatísticas do acampamento
    const campistas = appData.campistas.filter(c => c.acampamentoId === id);
    const equipe = appData.equipe.filter(e => e.acampamentoId === id);
    const pagamentos = appData.financeiro.pagamentos.filter(p => p.acampamentoId === id);
    const despesas = appData.financeiro.despesas.filter(d => d.acampamentoId === id);
    
    const totalReceitas = pagamentos.reduce((sum, p) => sum + parseFloat(p.valor || 0), 0);
    const totalDespesas = despesas.reduce((sum, d) => sum + parseFloat(d.valor || 0), 0);
    const saldoAtual = totalReceitas - totalDespesas;
    
    // Obter setores e tribos associados
    const setoresAssociados = appData.acampamentoSetores
        .filter(as => as.acampamentoId === id)
        .map(as => appData.setores.find(s => s.id === as.setorId))
        .filter(s => s);
    
    const tribosAssociadas = appData.acampamentoTribos
        .filter(at => at.acampamentoId === id)
        .map(at => appData.tribos.find(t => t.id === at.triboId))
        .filter(t => t);
    
    modalBody.innerHTML = `
        <h2>Detalhes do Acampamento</h2>
        <div class="acampamento-details">
            <div class="detail-section">
                <h3>Informações Gerais</h3>
                <div class="detail-grid">
                    <div><strong>Nome:</strong> ${acampamento.nome}</div>
                    <div><strong>Status:</strong> <span class="badge badge-${getStatusColor(acampamento.status)}">${acampamento.status}</span></div>
                    <div><strong>Modalidade:</strong> ${acampamento.modalidade}</div>
                    <div><strong>Local:</strong> ${acampamento.local}</div>
                    <div><strong>Data de Início:</strong> ${formatDate(acampamento.dataInicio)}</div>
                    <div><strong>Data de Fim:</strong> ${formatDate(acampamento.dataFim)}</div>
                    <div><strong>Vagas:</strong> ${acampamento.vagas}</div>
                    <div><strong>Valor:</strong> ${formatCurrency(acampamento.valor)}</div>
                </div>
                ${acampamento.descricao ? `<div class="mt-3"><strong>Descrição:</strong><br>${acampamento.descricao}</div>` : ''}
            </div>
            
            <div class="detail-section">
                <h3>Estatísticas</h3>
                <div class="detail-grid">
                    <div><strong>Campistas Inscritos:</strong> ${campistas.length}</div>
                    <div><strong>Vagas Disponíveis:</strong> ${acampamento.vagas - campistas.length}</div>
                    <div><strong>Membros da Equipe:</strong> ${equipe.length}</div>
                    <div><strong>Taxa de Ocupação:</strong> ${((campistas.length / acampamento.vagas) * 100).toFixed(1)}%</div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Resumo Financeiro</h3>
                <div class="detail-grid">
                    <div><strong>Total de Receitas:</strong> <span class="text-success">${formatCurrency(totalReceitas)}</span></div>
                    <div><strong>Total de Despesas:</strong> <span class="text-danger">${formatCurrency(totalDespesas)}</span></div>
                    <div><strong>Saldo Atual:</strong> <span class="${saldoAtual >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(saldoAtual)}</span></div>
                    <div><strong>Número de Pagamentos:</strong> ${pagamentos.length}</div>
                </div>
            </div>
            
            ${setoresAssociados.length > 0 ? `
            <div class="detail-section">
                <h3>Setores Associados (${setoresAssociados.length})</h3>
                <div class="setores-list">
                    ${setoresAssociados.map(setor => `
                        <span class="badge" style="background-color: ${setor.cor}; color: white; margin-right: 8px; margin-bottom: 4px;">
                            ${setor.nome}
                        </span>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${tribosAssociadas.length > 0 ? `
            <div class="detail-section">
                <h3>Tribos Associadas (${tribosAssociadas.length})</h3>
                <div class="tribos-list">
                    ${tribosAssociadas.map(tribo => `
                        <span class="badge" style="background-color: ${tribo.cor}; color: white; margin-right: 8px; margin-bottom: 4px;">
                            ${tribo.nome} (${appData.campistas.filter(c => c.triboId === tribo.id).length} campistas)
                        </span>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <div class="detail-section">
                <h3>Informações do Sistema</h3>
                <div class="detail-grid">
                    <div><strong>Criado em:</strong> ${formatDate(acampamento.criadoEm)}</div>
                    <div><strong>Última atualização:</strong> ${formatDate(acampamento.atualizadoEm)}</div>
                </div>
            </div>
        </div>
        
        <div class="form-actions mt-4">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Fechar</button>
            <button type="button" class="btn btn-primary" onclick="editAcampamento('${acampamento.id}'); closeModal();">
                <i class="fas fa-edit"></i> Editar
            </button>
            <button type="button" class="btn btn-success" onclick="selecionarAcampamento('${acampamento.id}'); closeModal(); showTab('campistas');">
                <i class="fas fa-users"></i> Ver Campistas
            </button>
        </div>
    `;
    
    modal.classList.add('show');
}

function viewCampistaDetails(id) {
    const campista = appData.campistas.find(c => c.id === id);
    if (!campista) return;
    
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <h2>Detalhes do Campista</h2>
        <div class="campista-details">
            <div class="detail-section">
                <h3>Dados Pessoais</h3>
                <div class="detail-grid">
                    <div><strong>Nome:</strong> ${campista.nome}</div>
                    <div><strong>Idade:</strong> ${campista.idade} anos</div>
                    <div><strong>Sexo:</strong> ${campista.sexo}</div>
                    <div><strong>Telefone:</strong> ${campista.telefone}</div>
                    <div><strong>E-mail:</strong> ${campista.email || 'Não informado'}</div>
                    <div><strong>Endereço:</strong> ${campista.endereco || 'Não informado'}</div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Dados do Acampamento</h3>
                <div class="detail-grid">
                    <div><strong>Acampamento:</strong> ${getAcampamentoNome(campista.acampamentoId)}</div>
                    <div><strong>Tribo:</strong> ${getTriboNome(campista.triboId)}</div>
                    <div><strong>Status:</strong> <span class="badge badge-${getStatusColor(campista.status)}">${campista.status}</span></div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Dados Católicos</h3>
                <div class="detail-grid">
                    <div><strong>Paróquia:</strong> ${campista.paroquia || 'Não informado'}</div>
                    <div><strong>Pastoral/Movimento:</strong> ${campista.pastoral || 'Não informado'}</div>
                    <div><strong>Batizado:</strong> ${campista.batizado === 'sim' ? 'Sim' : campista.batizado === 'nao' ? 'Não' : 'Não informado'}</div>
                    <div><strong>Crismado:</strong> ${campista.crismado === 'sim' ? 'Sim' : campista.crismado === 'nao' ? 'Não' : 'Não informado'}</div>
                    <div><strong>Primeira Eucaristia:</strong> ${campista.primeiraEucaristia === 'sim' ? 'Sim' : campista.primeiraEucaristia === 'nao' ? 'Não' : 'Não informado'}</div>
                    <div><strong>Experiência:</strong> ${campista.experienciaAcampamento || 'Não informado'}</div>
                </div>
                ${campista.motivacao ? `<div class="mt-3"><strong>Motivação:</strong><br>${campista.motivacao}</div>` : ''}
            </div>
            
            <div class="detail-section">
                <h3>Informações Médicas</h3>
                <div class="detail-grid">
                    <div><strong>Tipo Sanguíneo:</strong> ${campista.tipoSanguineo || 'Não informado'}</div>
                    <div><strong>Plano de Saúde:</strong> ${campista.planoSaude || 'Não informado'}</div>
                </div>
                ${campista.alergias ? `<div class="mt-2"><strong>Alergias:</strong><br>${campista.alergias}</div>` : ''}
                ${campista.medicamentos ? `<div class="mt-2"><strong>Medicamentos:</strong><br>${campista.medicamentos}</div>` : ''}
                ${campista.restricoesAlimentares ? `<div class="mt-2"><strong>Restrições Alimentares:</strong><br>${campista.restricoesAlimentares}</div>` : ''}
                ${campista.observacoesMedicas ? `<div class="mt-2"><strong>Outras Observações:</strong><br>${campista.observacoesMedicas}</div>` : ''}
            </div>
            
            <div class="detail-section">
                <h3>Contatos de Emergência</h3>
                <div class="detail-grid">
                    <div><strong>Nome do Contato 1:</strong> ${campista.nomeEmergencia1 || 'Não informado'}</div>
                    <div><strong>Telefone do Contato 1:</strong> ${campista.telefoneEmergencia1 || 'Não informado'}</div>
                    <div><strong>Parentesco:</strong> ${campista.parentesco1 || 'Não informado'}</div>
                    ${campista.nomeEmergencia2 ? `<div><strong>Nome do Contato 2:</strong> ${campista.nomeEmergencia2}</div>` : ''}
                    ${campista.telefoneEmergencia2 ? `<div><strong>Telefone do Contato 2:</strong> ${campista.telefoneEmergencia2}</div>` : ''}
                    ${campista.parentesco2 ? `<div><strong>Parentesco:</strong> ${campista.parentesco2}</div>` : ''}
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Informações do Sistema</h3>
                <div class="detail-grid">
                    <div><strong>Cadastrado em:</strong> ${formatDate(campista.criadoEm)}</div>
                    <div><strong>Última atualização:</strong> ${formatDate(campista.atualizadoEm)}</div>
                </div>
            </div>
        </div>
        
        <div class="form-actions mt-4">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Fechar</button>
            <button type="button" class="btn btn-primary" onclick="editCampista('${campista.id}'); closeModal();">
                <i class="fas fa-edit"></i> Editar
            </button>
            <button type="button" class="btn btn-info" onclick="imprimirCampistaDetails('${campista.id}')">
                <i class="fas fa-print"></i> Imprimir
            </button>
            <button type="button" class="btn btn-success" onclick="exportarCampistaWord('${campista.id}')">
                <i class="fas fa-file-word"></i> Exportar Word
            </button>
        </div>
    `;
    
    modal.classList.add('show');
}

function imprimirCampistaDetails(id) {
    const campista = appData.campistas.find(c => c.id === id);
    if (!campista) return;
    
    const conteudo = `
        <h1>Detalhes do Campista</h1>
        <div style="margin: 20px 0;">
            <h2>Dados Pessoais</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Nome:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.nome}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Idade:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.idade} anos</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Sexo:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.sexo}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Telefone:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.telefone}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">E-mail:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.email || 'Não informado'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Endereço:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.endereco || 'Não informado'}</td></tr>
            </table>
            
            <h2>Dados do Acampamento</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Acampamento:</td><td style="padding: 8px; border: 1px solid #ddd;">${getAcampamentoNome(campista.acampamentoId)}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Status:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.status}</td></tr>
            </table>
            
            <h2>Dados Católicos</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Paróquia:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.paroquia || 'Não informado'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Pastoral:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.pastoral || 'Não informado'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Batizado:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.batizado === 'sim' ? 'Sim' : campista.batizado === 'nao' ? 'Não' : 'Não informado'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Crismado:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.crismado === 'sim' ? 'Sim' : campista.crismado === 'nao' ? 'Não' : 'Não informado'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Primeira Eucaristia:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.primeiraEucaristia === 'sim' ? 'Sim' : campista.primeiraEucaristia === 'nao' ? 'Não' : 'Não informado'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Experiência:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.experienciaAcampamento || 'Não informado'}</td></tr>
            </table>
            ${campista.motivacao ? `<p><strong>Motivação:</strong><br>${campista.motivacao}</p>` : ''}
            
            <h2>Informações Médicas</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Tipo Sanguíneo:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.tipoSanguineo || 'Não informado'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Plano de Saúde:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.planoSaude || 'Não informado'}</td></tr>
            </table>
            ${campista.alergias ? `<p><strong>Alergias:</strong><br>${campista.alergias}</p>` : ''}
            ${campista.medicamentos ? `<p><strong>Medicamentos:</strong><br>${campista.medicamentos}</p>` : ''}
            ${campista.restricoesAlimentares ? `<p><strong>Restrições Alimentares:</strong><br>${campista.restricoesAlimentares}</p>` : ''}
            ${campista.observacoesMedicas ? `<p><strong>Outras Observações:</strong><br>${campista.observacoesMedicas}</p>` : ''}
            
            <h2>Contatos de Emergência</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Nome do Contato 1:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.nomeEmergencia1 || 'Não informado'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Telefone do Contato 1:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.telefoneEmergencia1 || 'Não informado'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Parentesco:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.parentesco1 || 'Não informado'}</td></tr>
                ${campista.nomeEmergencia2 ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Nome do Contato 2:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.nomeEmergencia2}</td></tr>` : ''}
                ${campista.telefoneEmergencia2 ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Telefone do Contato 2:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.telefoneEmergencia2}</td></tr>` : ''}
                ${campista.parentesco2 ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Parentesco:</td><td style="padding: 8px; border: 1px solid #ddd;">${campista.parentesco2}</td></tr>` : ''}
            </table>
            
            <h2>Informações do Sistema</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Cadastrado em:</td><td style="padding: 8px; border: 1px solid #ddd;">${formatDate(campista.criadoEm)}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Última atualização:</td><td style="padding: 8px; border: 1px solid #ddd;">${formatDate(campista.atualizadoEm)}</td></tr>
            </table>
        </div>
    `;
    
    abrirJanelaPDF(conteudo, `Detalhes do Campista - ${campista.nome}`);
}

function exportarCampistaWord(id) {
    const campista = appData.campistas.find(c => c.id === id);
    if (!campista) return;
    
    // Criar conteúdo HTML estruturado para conversão
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Detalhes do Campista - ${campista.nome}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                h2 { color: #34495e; margin-top: 25px; margin-bottom: 15px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                td { padding: 8px; border: 1px solid #ddd; }
                .label { font-weight: bold; background-color: #f8f9fa; width: 30%; }
                .value { background-color: #ffffff; }
                p { margin: 10px 0; line-height: 1.5; }
            </style>
        </head>
        <body>
            <h1>Detalhes do Campista</h1>
            
            <h2>Dados Pessoais</h2>
            <table>
                <tr><td class="label">Nome:</td><td class="value">${campista.nome}</td></tr>
                <tr><td class="label">Idade:</td><td class="value">${campista.idade} anos</td></tr>
                <tr><td class="label">Sexo:</td><td class="value">${campista.sexo}</td></tr>
                <tr><td class="label">Telefone:</td><td class="value">${campista.telefone}</td></tr>
                <tr><td class="label">E-mail:</td><td class="value">${campista.email || 'Não informado'}</td></tr>
                <tr><td class="label">Endereço:</td><td class="value">${campista.endereco || 'Não informado'}</td></tr>
            </table>
            
            <h2>Dados do Acampamento</h2>
            <table>
                <tr><td class="label">Acampamento:</td><td class="value">${getAcampamentoNome(campista.acampamentoId)}</td></tr>
                <tr><td class="label">Status:</td><td class="value">${campista.status}</td></tr>
            </table>
            
            <h2>Dados Católicos</h2>
            <table>
                <tr><td class="label">Paróquia:</td><td class="value">${campista.paroquia || 'Não informado'}</td></tr>
                <tr><td class="label">Pastoral:</td><td class="value">${campista.pastoral || 'Não informado'}</td></tr>
                <tr><td class="label">Batizado:</td><td class="value">${campista.batizado === 'sim' ? 'Sim' : campista.batizado === 'nao' ? 'Não' : 'Não informado'}</td></tr>
                <tr><td class="label">Crismado:</td><td class="value">${campista.crismado === 'sim' ? 'Sim' : campista.crismado === 'nao' ? 'Não' : 'Não informado'}</td></tr>
                <tr><td class="label">Primeira Eucaristia:</td><td class="value">${campista.primeiraEucaristia === 'sim' ? 'Sim' : campista.primeiraEucaristia === 'nao' ? 'Não' : 'Não informado'}</td></tr>
                <tr><td class="label">Experiência:</td><td class="value">${campista.experienciaAcampamento || 'Não informado'}</td></tr>
            </table>
            ${campista.motivacao ? `<p><strong>Motivação:</strong><br>${campista.motivacao}</p>` : ''}
            
            <h2>Informações Médicas</h2>
            <table>
                <tr><td class="label">Tipo Sanguíneo:</td><td class="value">${campista.tipoSanguineo || 'Não informado'}</td></tr>
                <tr><td class="label">Plano de Saúde:</td><td class="value">${campista.planoSaude || 'Não informado'}</td></tr>
            </table>
            ${campista.alergias ? `<p><strong>Alergias:</strong><br>${campista.alergias}</p>` : ''}
            ${campista.medicamentos ? `<p><strong>Medicamentos:</strong><br>${campista.medicamentos}</p>` : ''}
            ${campista.restricoesAlimentares ? `<p><strong>Restrições Alimentares:</strong><br>${campista.restricoesAlimentares}</p>` : ''}
            ${campista.observacoesMedicas ? `<p><strong>Outras Observações:</strong><br>${campista.observacoesMedicas}</p>` : ''}
            
            <h2>Contatos de Emergência</h2>
            <table>
                <tr><td class="label">Nome do Contato 1:</td><td class="value">${campista.nomeEmergencia1 || 'Não informado'}</td></tr>
                <tr><td class="label">Telefone do Contato 1:</td><td class="value">${campista.telefoneEmergencia1 || 'Não informado'}</td></tr>
                <tr><td class="label">Parentesco:</td><td class="value">${campista.parentesco1 || 'Não informado'}</td></tr>
                ${campista.nomeEmergencia2 ? `<tr><td class="label">Nome do Contato 2:</td><td class="value">${campista.nomeEmergencia2}</td></tr>` : ''}
                ${campista.telefoneEmergencia2 ? `<tr><td class="label">Telefone do Contato 2:</td><td class="value">${campista.telefoneEmergencia2}</td></tr>` : ''}
                ${campista.parentesco2 ? `<tr><td class="label">Parentesco:</td><td class="value">${campista.parentesco2}</td></tr>` : ''}
            </table>
            
            <h2>Informações do Sistema</h2>
            <table>
                <tr><td class="label">Cadastrado em:</td><td class="value">${formatDate(campista.criadoEm)}</td></tr>
                <tr><td class="label">Última atualização:</td><td class="value">${formatDate(campista.atualizadoEm)}</td></tr>
            </table>
        </body>
        </html>
    `;
    
    // Criar blob e fazer download
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Detalhes_Campista_${campista.nome.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Arquivo Word exportado com sucesso!', 'success');
}

// === GESTÃO DE EQUIPE ===
function loadEquipe() {
    const container = document.getElementById('equipe-list');
    container.innerHTML = '';
    
    const equipeFiltrada = getEquipeByAcampamento();
    
    if (equipeFiltrada.length === 0) {
        container.innerHTML = '<div class="text-center p-4"><p>Nenhum membro da equipe cadastrado para este acampamento.</p></div>';
        return;
    }
    
    equipeFiltrada.forEach(membro => {
        const membroCard = createMembroCard(membro);
        container.appendChild(membroCard);
    });
}

function getEquipeByAcampamento() {
    if (!acampamentoAtivo) return [];
    return appData.equipe.filter(membro => membro.acampamentoId === acampamentoAtivo);
}

function createMembroCard(membro) {
    const card = document.createElement('div');
    card.className = 'data-item';
    card.innerHTML = `
        <div class="d-flex justify-between items-center mb-3">
            <h3>${membro.nome}</h3>
            <span class="badge badge-${getFuncaoColor(membro.funcao)}">${membro.funcao}</span>
        </div>
        <div class="form-row mb-2">
            <div><strong>Setor:</strong> ${getSetorNome(membro.setorId)}</div>
            <div><strong>Telefone:</strong> ${membro.telefone}</div>
        </div>
        <div class="mb-2"><strong>E-mail:</strong> ${membro.email || 'Não informado'}</div>
        <div class="d-flex gap-2">
            <button class="btn btn-primary" onclick="editMembro('${membro.id}')">
                <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-danger" onclick="deleteMembro('${membro.id}')">
                <i class="fas fa-trash"></i> Excluir
            </button>
        </div>
    `;
    return card;
}

function getEquipeForm(membro = null) {
    const isEdit = membro !== null;
    const setoresOptions = appData.setores.map(s => 
        `<option value="${s.id}" ${isEdit && membro.setorId === s.id ? 'selected' : ''}>${s.nome}</option>`
    ).join('');
    
    return `
        <h2>${isEdit ? 'Editar' : 'Novo'} Membro da Equipe</h2>
        <form onsubmit="saveMembro(event, ${isEdit ? "'" + membro.id + "'" : 'null'})">
            <div class="form-group">
                <label for="nome">Nome Completo *</label>
                <input type="text" id="nome" name="nome" required value="${isEdit ? membro.nome : ''}">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="funcao">Função *</label>
                    <select id="funcao" name="funcao" required>
                        <option value="">Selecione...</option>
                        <option value="coordenador" ${isEdit && membro.funcao === 'coordenador' ? 'selected' : ''}>Coordenador</option>
                        <option value="lider" ${isEdit && membro.funcao === 'lider' ? 'selected' : ''}>Líder</option>
                        <option value="auxiliar" ${isEdit && membro.funcao === 'auxiliar' ? 'selected' : ''}>Auxiliar</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="setorId">Setor *</label>
                    <select id="setorId" name="setorId" required>
                        <option value="">Selecione...</option>
                        ${setoresOptions}
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="telefone">Telefone *</label>
                    <input type="tel" id="telefone" name="telefone" required value="${isEdit ? membro.telefone : ''}">
                </div>
                
                <div class="form-group">
                    <label for="email">E-mail</label>
                    <input type="email" id="email" name="email" value="${isEdit ? membro.email || '' : ''}">
                </div>
            </div>
            
            <div class="form-group">
                <label for="experiencia">Experiência/Observações</label>
                <textarea id="experiencia" name="experiencia" rows="3">${isEdit ? membro.experiencia || '' : ''}</textarea>
            </div>
            
            <!-- Perguntas Personalizadas -->
            ${getPerguntasPersonalizadas('equipe', membro)}
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar' : 'Salvar'}</button>
            </div>
        </form>
    `;
}

function saveMembro(event, id = null) {
    event.preventDefault();
    
    if (!requireAcampamentoAtivo()) return;
    
    const formData = new FormData(event.target);
    const membro = {
        id: id || generateId(),
        nome: formData.get('nome'),
        funcao: formData.get('funcao'),
        setorId: formData.get('setorId'),
        telefone: formData.get('telefone'),
        email: formData.get('email'),
        experiencia: formData.get('experiencia'),
        acampamentoId: acampamentoAtivo,
        criadoEm: id ? appData.equipe.find(m => m.id === id).criadoEm : new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
    };
    
    // Salvar respostas das perguntas personalizadas
    const perguntasEquipe = appData.perguntasPersonalizadas.equipe || [];
    membro.perguntasPersonalizadas = {};
    perguntasEquipe.forEach(pergunta => {
        const valor = formData.get(`pergunta_${pergunta.id}`);
        if (valor !== null && valor !== '') {
            membro.perguntasPersonalizadas[pergunta.id] = valor;
        }
    });
    
    if (id) {
        const index = appData.equipe.findIndex(m => m.id === id);
        appData.equipe[index] = membro;
        showToast('Membro atualizado com sucesso!', 'success');
    } else {
        appData.equipe.push(membro);
        showToast('Membro cadastrado com sucesso!', 'success');
    }
    
    // Atualizar setor
    const setor = appData.setores.find(s => s.id === membro.setorId);
    if (setor) {
        setor.membros = setor.membros.filter(m => m.id !== membro.id);
        setor.membros.push({ id: membro.id, nome: membro.nome, funcao: membro.funcao });
    }
    
    saveData();
    loadEquipe();
    loadSetores();
    closeModal();
    updateDashboard();
}

function editMembro(id) {
    const membro = appData.equipe.find(m => m.id === id);
    if (membro) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = getEquipeForm(membro);
        modal.classList.add('show');
    }
}

function deleteMembro(id) {
    if (confirm('Tem certeza que deseja excluir este membro da equipe?')) {
        const membro = appData.equipe.find(m => m.id === id);
        if (membro) {
            // Remover do setor
            const setor = appData.setores.find(s => s.id === membro.setorId);
            if (setor) {
                setor.membros = setor.membros.filter(m => m.id !== id);
            }
        }
        
        appData.equipe = appData.equipe.filter(m => m.id !== id);
        saveData();
        loadEquipe();
        loadSetores();
        updateDashboard();
        showToast('Membro excluído com sucesso!', 'success');
    }
}

function filterEquipe() {
    const searchTerm = document.getElementById('equipe-search').value.toLowerCase();
    const setorFilter = document.getElementById('equipe-setor-filter').value;
    const funcaoFilter = document.getElementById('equipe-funcao-filter').value;
    
    const container = document.getElementById('equipe-list');
    container.innerHTML = '';
    
    let filteredEquipe = appData.equipe.filter(membro => {
        const matchesSearch = membro.nome.toLowerCase().includes(searchTerm) ||
                            membro.email?.toLowerCase().includes(searchTerm) ||
                            membro.telefone.includes(searchTerm);
        
        const matchesSetor = !setorFilter || membro.setorId === setorFilter;
        const matchesFuncao = !funcaoFilter || membro.funcao === funcaoFilter;
        
        return matchesSearch && matchesSetor && matchesFuncao;
    });
    
    if (filteredEquipe.length === 0) {
        container.innerHTML = '<div class="text-center p-4"><p>Nenhum membro encontrado com os filtros aplicados.</p></div>';
        return;
    }
    
    filteredEquipe.forEach(membro => {
        const membroCard = createMembroCard(membro);
        container.appendChild(membroCard);
    });
}

// === GESTÃO FINANCEIRA ===
function loadFinanceiro() {
    updateFinancialSummary();
    loadPagamentos();
    loadDespesas();
    loadLivroCaixa();
}

function updateFinancialSummary() {
    const pagamentos = getPagamentosByAcampamento();
    const despesas = getDespesasByAcampamento();
    
    const totalReceitas = pagamentos.reduce((sum, p) => sum + p.valor, 0);
    const totalDespesas = despesas.reduce((sum, d) => sum + d.valor, 0);
    const saldo = totalReceitas - totalDespesas;
    
    document.getElementById('total-receitas').textContent = formatCurrency(totalReceitas);
    document.getElementById('total-despesas').textContent = formatCurrency(totalDespesas);
    document.getElementById('saldo-total').textContent = formatCurrency(saldo);
    
    // Atualizar cor do saldo
    const saldoElement = document.getElementById('saldo-total');
    saldoElement.style.color = saldo >= 0 ? '#28a745' : '#dc3545';
}

function showFinancialTab(tabName) {
    // Remover classe active de todas as abas financeiras
    document.querySelectorAll('.financial-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.financial-tab-content').forEach(content => content.classList.remove('active'));
    
    // Ativar aba selecionada
    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function getPagamentosByAcampamento() {
    return appData.financeiro.pagamentos.filter(pagamento => pagamento.acampamentoId === acampamentoAtivo);
}

function loadPagamentos() {
    const container = document.getElementById('pagamentos-list');
    container.innerHTML = '';
    
    const pagamentos = getPagamentosByAcampamento();
    
    if (pagamentos.length === 0) {
        container.innerHTML = '<div class="text-center p-4"><p>Nenhum pagamento registrado ainda.</p></div>';
        return;
    }
    
    pagamentos.forEach(pagamento => {
        const pagamentoCard = createPagamentoCard(pagamento);
        container.appendChild(pagamentoCard);
    });
}

function createPagamentoCard(pagamento) {
    const card = document.createElement('div');
    card.className = 'data-item';
    card.innerHTML = `
        <div class="d-flex justify-between items-center mb-3">
            <h3>${pagamento.descricao}</h3>
            <span class="badge badge-success">${formatCurrency(pagamento.valor)}</span>
        </div>
        <div class="form-row mb-2">
            <div><strong>Data:</strong> ${formatDate(pagamento.data)}</div>
            <div><strong>Forma:</strong> ${pagamento.formaPagamento}</div>
        </div>
        <div class="mb-2"><strong>Campista:</strong> ${getCampistaNome(pagamento.campistaId)}</div>
        <div class="d-flex gap-2">
            <button class="btn btn-primary" onclick="editPagamento('${pagamento.id}')">
                <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-danger" onclick="deletePagamento('${pagamento.id}')">
                <i class="fas fa-trash"></i> Excluir
            </button>
        </div>
    `;
    return card;
}

function getPagamentoForm(pagamento = null) {
    const isEdit = pagamento !== null;
    const campistasOptions = appData.campistas.map(c => 
        `<option value="${c.id}" ${isEdit && pagamento.campistaId === c.id ? 'selected' : ''}>${c.nome}</option>`
    ).join('');
    
    return `
        <h2>${isEdit ? 'Editar' : 'Novo'} Pagamento</h2>
        <form onsubmit="savePagamento(event, ${isEdit ? "'" + pagamento.id + "'" : 'null'})">
            <div class="form-group">
                <label for="descricao">Descrição *</label>
                <input type="text" id="descricao" name="descricao" required value="${isEdit ? pagamento.descricao : ''}">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="valor">Valor (R$) *</label>
                    <input type="text" id="valor" name="valor" required value="${isEdit ? (pagamento.valor ? 'R$ ' + parseFloat(pagamento.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '') : ''}">
                </div>
                
                <div class="form-group">
                    <label for="data">Data *</label>
                    <input type="date" id="data" name="data" required value="${isEdit ? pagamento.data : new Date().toISOString().split('T')[0]}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="formaPagamento">Forma de Pagamento *</label>
                    <select id="formaPagamento" name="formaPagamento" required>
                        <option value="">Selecione...</option>
                        <option value="dinheiro" ${isEdit && pagamento.formaPagamento === 'dinheiro' ? 'selected' : ''}>Dinheiro</option>
                        <option value="pix" ${isEdit && pagamento.formaPagamento === 'pix' ? 'selected' : ''}>PIX</option>
                        <option value="cartao" ${isEdit && pagamento.formaPagamento === 'cartao' ? 'selected' : ''}>Cartão</option>
                        <option value="transferencia" ${isEdit && pagamento.formaPagamento === 'transferencia' ? 'selected' : ''}>Transferência</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="campistaId">Campista</label>
                    <select id="campistaId" name="campistaId">
                        <option value="">Selecione...</option>
                        ${campistasOptions}
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label for="observacoes">Observações</label>
                <textarea id="observacoes" name="observacoes" rows="2">${isEdit ? pagamento.observacoes || '' : ''}</textarea>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar' : 'Salvar'}</button>
            </div>
        </form>
    `;
}

function savePagamento(event, id = null) {
    event.preventDefault();
    
    if (!requireAcampamentoAtivo()) return;
    
    const formData = new FormData(event.target);
    const pagamento = {
        id: id || generateId(),
        descricao: formData.get('descricao'),
        valor: getCurrencyValue(formData.get('valor')),
        data: formData.get('data'),
        formaPagamento: formData.get('formaPagamento'),
        campistaId: formData.get('campistaId') || null,
        observacoes: formData.get('observacoes'),
        acampamentoId: acampamentoAtivo,
        criadoEm: id ? appData.financeiro.pagamentos.find(p => p.id === id).criadoEm : new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
    };
    
    if (id) {
        const index = appData.financeiro.pagamentos.findIndex(p => p.id === id);
        appData.financeiro.pagamentos[index] = pagamento;
        showToast('Pagamento atualizado com sucesso!', 'success');
    } else {
        appData.financeiro.pagamentos.push(pagamento);
        showToast('Pagamento registrado com sucesso!', 'success');
    }
    
    saveData();
    loadFinanceiro();
    closeModal();
}

function editPagamento(id) {
    const pagamento = appData.financeiro.pagamentos.find(p => p.id === id);
    if (pagamento) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = getPagamentoForm(pagamento);
        modal.classList.add('show');
        
        // Aplicar formatação de moeda após renderizar o formulário
        setTimeout(() => {
            setupCurrencyInput('valor');
        }, 100);
    }
}

function deletePagamento(id) {
    if (confirm('Tem certeza que deseja excluir este pagamento?')) {
        appData.financeiro.pagamentos = appData.financeiro.pagamentos.filter(p => p.id !== id);
        saveData();
        loadFinanceiro();
        showToast('Pagamento excluído com sucesso!', 'success');
    }
}

// === GESTÃO DE DESPESAS ===
function getDespesasByAcampamento() {
    return appData.financeiro.despesas.filter(despesa => despesa.acampamentoId === acampamentoAtivo);
}

function loadDespesas() {
    const container = document.getElementById('despesas-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    const despesas = getDespesasByAcampamento();
    
    if (despesas.length === 0) {
        container.innerHTML = '<div class="text-center p-4"><p>Nenhuma despesa registrada ainda.</p></div>';
        return;
    }
    
    despesas.forEach(despesa => {
        const despesaCard = createDespesaCard(despesa);
        container.appendChild(despesaCard);
    });
}

function createDespesaCard(despesa) {
    const card = document.createElement('div');
    card.className = 'data-item';
    card.innerHTML = `
        <div class="d-flex justify-between items-center mb-3">
            <h3>${despesa.descricao}</h3>
            <span class="badge badge-danger">${formatCurrency(despesa.valor)}</span>
        </div>
        <div class="form-row mb-2">
            <div><strong>Data:</strong> ${formatDate(despesa.data)}</div>
            <div><strong>Categoria:</strong> ${despesa.categoria}</div>
        </div>
        <div class="mb-2"><strong>Fornecedor:</strong> ${despesa.fornecedor || 'Não informado'}</div>
        <div class="d-flex gap-2">
            <button class="btn btn-primary" onclick="editDespesa('${despesa.id}')">
                <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-danger" onclick="deleteDespesa('${despesa.id}')">
                <i class="fas fa-trash"></i> Excluir
            </button>
        </div>
    `;
    return card;
}

function getDespesaForm(despesa = null) {
    const isEdit = despesa !== null;
    
    return `
        <h2>${isEdit ? 'Editar' : 'Nova'} Despesa</h2>
        <form onsubmit="saveDespesa(event, ${isEdit ? "'" + despesa.id + "'" : 'null'})">
            <div class="form-group">
                <label for="descricao">Descrição *</label>
                <input type="text" id="descricao" name="descricao" required value="${isEdit ? despesa.descricao : ''}">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="valor">Valor (R$) *</label>
                    <input type="text" id="valor" name="valor" required value="${isEdit ? (despesa.valor ? 'R$ ' + parseFloat(despesa.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '') : ''}">
                </div>
                
                <div class="form-group">
                    <label for="data">Data *</label>
                    <input type="date" id="data" name="data" required value="${isEdit ? despesa.data : new Date().toISOString().split('T')[0]}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="categoria">Categoria *</label>
                    <select id="categoria" name="categoria" required>
                        <option value="">Selecione...</option>
                        <option value="alimentacao" ${isEdit && despesa.categoria === 'alimentacao' ? 'selected' : ''}>Alimentação</option>
                        <option value="transporte" ${isEdit && despesa.categoria === 'transporte' ? 'selected' : ''}>Transporte</option>
                        <option value="material" ${isEdit && despesa.categoria === 'material' ? 'selected' : ''}>Material</option>
                        <option value="equipamento" ${isEdit && despesa.categoria === 'equipamento' ? 'selected' : ''}>Equipamento</option>
                        <option value="servicos" ${isEdit && despesa.categoria === 'servicos' ? 'selected' : ''}>Serviços</option>
                        <option value="outros" ${isEdit && despesa.categoria === 'outros' ? 'selected' : ''}>Outros</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="fornecedor">Fornecedor</label>
                    <input type="text" id="fornecedor" name="fornecedor" value="${isEdit ? despesa.fornecedor || '' : ''}">
                </div>
            </div>
            
            <div class="form-group">
                <label for="observacoes">Observações</label>
                <textarea id="observacoes" name="observacoes" rows="2">${isEdit ? despesa.observacoes || '' : ''}</textarea>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar' : 'Salvar'}</button>
            </div>
        </form>
    `;
}

function saveDespesa(event, id = null) {
    event.preventDefault();
    
    if (!requireAcampamentoAtivo()) return;
    
    const formData = new FormData(event.target);
    const despesa = {
        id: id || generateId(),
        descricao: formData.get('descricao'),
        valor: getCurrencyValue(formData.get('valor')),
        data: formData.get('data'),
        categoria: formData.get('categoria'),
        fornecedor: formData.get('fornecedor'),
        observacoes: formData.get('observacoes'),
        acampamentoId: acampamentoAtivo,
        criadoEm: id ? appData.financeiro.despesas.find(d => d.id === id).criadoEm : new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
    };
    
    if (id) {
        const index = appData.financeiro.despesas.findIndex(d => d.id === id);
        appData.financeiro.despesas[index] = despesa;
        showToast('Despesa atualizada com sucesso!', 'success');
    } else {
        appData.financeiro.despesas.push(despesa);
        showToast('Despesa registrada com sucesso!', 'success');
    }
    
    saveData();
    loadFinanceiro();
    closeModal();
}

function editDespesa(id) {
    const despesa = appData.financeiro.despesas.find(d => d.id === id);
    if (despesa) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = getDespesaForm(despesa);
        modal.classList.add('show');
        
        // Aplicar formatação de moeda no campo valor
        setTimeout(() => {
            setupCurrencyInput('valor');
        }, 100);
    }
}

function deleteDespesa(id) {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
        appData.financeiro.despesas = appData.financeiro.despesas.filter(d => d.id !== id);
        saveData();
        loadFinanceiro();
        showToast('Despesa excluída com sucesso!', 'success');
    }
}

// === LIVRO CAIXA ===
function loadLivroCaixa() {
    const container = document.getElementById('livro-caixa');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Combinar pagamentos e despesas
    const transacoes = [];
    
    appData.financeiro.pagamentos.forEach(p => {
        transacoes.push({
            ...p,
            tipo: 'receita',
            valor: p.valor
        });
    });
    
    appData.financeiro.despesas.forEach(d => {
        transacoes.push({
            ...d,
            tipo: 'despesa',
            valor: -d.valor
        });
    });
    
    // Ordenar por data
    transacoes.sort((a, b) => new Date(a.data) - new Date(b.data));
    
    if (transacoes.length === 0) {
        container.innerHTML = '<div class="text-center p-4"><p>Nenhuma transação registrada ainda.</p></div>';
        return;
    }
    
    let saldoAcumulado = 0;
    
    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Saldo</th>
            </tr>
        </thead>
        <tbody>
            ${transacoes.map(t => {
                saldoAcumulado += t.valor;
                return `
                    <tr>
                        <td>${formatDate(t.data)}</td>
                        <td>${t.descricao}</td>
                        <td><span class="badge badge-${t.tipo === 'receita' ? 'success' : 'danger'}">${t.tipo}</span></td>
                        <td style="color: ${t.valor >= 0 ? '#28a745' : '#dc3545'}">${formatCurrency(Math.abs(t.valor))}</td>
                        <td style="color: ${saldoAcumulado >= 0 ? '#28a745' : '#dc3545'}">${formatCurrency(saldoAcumulado)}</td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    `;
    
    container.appendChild(table);
}

// === FUNÇÕES DE UTILIDADE ===
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Função para aplicar máscara de moeda em tempo real
function applyCurrencyMask(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value === '') {
        input.value = '';
        return;
    }
    
    // Converte para centavos
    value = parseInt(value);
    
    // Formata como moeda
    const formatted = (value / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    input.value = 'R$ ' + formatted;
}

// Função para remover máscara e obter valor numérico
function getCurrencyValue(maskedValue) {
    if (!maskedValue) return 0;
    
    // Remove 'R$', espaços e substitui vírgula por ponto
    const cleanValue = maskedValue
        .replace(/R\$\s?/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
    
    return parseFloat(cleanValue) || 0;
}

// Função para configurar máscara de moeda em um campo
function setupCurrencyInput(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    // Remove atributos de number para permitir formatação
    input.type = 'text';
    input.removeAttribute('step');
    input.removeAttribute('min');
    
    // Aplica máscara ao digitar
    input.addEventListener('input', function() {
        applyCurrencyMask(this);
    });
    
    // Aplica máscara ao colar
    input.addEventListener('paste', function() {
        setTimeout(() => {
            applyCurrencyMask(this);
        }, 10);
    });
    
    // Se já tem valor, aplica a máscara
    if (input.value) {
        // Se o valor já está formatado, não reformata
        if (!input.value.includes('R$')) {
            const numericValue = parseFloat(input.value);
            if (!isNaN(numericValue)) {
                input.value = 'R$ ' + numericValue.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }
        }
    }
}

function getStatusColor(status) {
    const colors = {
        'planejamento': 'warning',
        'inscricoes-abertas': 'info',
        'em-andamento': 'primary',
        'concluido': 'success',
        'inscrito': 'warning',
        'confirmado': 'info',
        'presente': 'success'
    };
    return colors[status] || 'secondary';
}

function getFuncaoColor(funcao) {
    const colors = {
        'coordenador': 'primary',
        'lider': 'info',
        'auxiliar': 'secondary'
    };
    return colors[funcao] || 'secondary';
}

function getAcampamentoNome(id) {
    if (!id) return 'Não definido';
    const acampamento = appData.acampamentos.find(a => a.id === id);
    return acampamento ? acampamento.nome : 'Acampamento não encontrado';
}

function getTriboNome(id) {
    if (!id) return 'Não definido';
    const tribo = appData.tribos.find(t => t.id === id);
    return tribo ? tribo.nome : 'Tribo não encontrada';
}

function getSetorNome(id) {
    if (!id) return 'Não definido';
    const setor = appData.setores.find(s => s.id === id);
    return setor ? setor.nome : 'Setor não encontrado';
}

function getCampistaNome(id) {
    if (!id) return 'Não definido';
    const campista = appData.campistas.find(c => c.id === id);
    return campista ? campista.nome : 'Campista não encontrado';
}

// === DASHBOARD ===
function updateDashboard() {
    // Estatísticas gerais
    document.getElementById('total-acampamentos').textContent = appData.acampamentos.length;
    document.getElementById('total-campistas').textContent = appData.campistas.length;
    document.getElementById('total-equipe').textContent = appData.equipe.length;
    
    // Próximos acampamentos
    updateProximosAcampamentos();
    
    // Gerar gráficos do dashboard
    gerarGraficoDashboard();
    
    // Alertas e notificações
    updateAlertas();
}

function gerarGraficoDashboard() {
    // Gráfico de distribuição por modalidade
    const modalidades = {};
    if (appData.acampamentos && appData.acampamentos.length > 0) {
        appData.acampamentos.forEach(a => {
            modalidades[a.modalidade] = (modalidades[a.modalidade] || 0) + 1;
        });
    }
    
    const graficoModalidades = document.getElementById('grafico-modalidades');
    if (graficoModalidades) {
        const total = Object.values(modalidades).reduce((sum, val) => sum + val, 0);
        graficoModalidades.innerHTML = Object.entries(modalidades).map(([modalidade, count]) => {
            const porcentagem = total > 0 ? (count / total * 100).toFixed(1) : 0;
            return `
                <div class="grafico-item">
                    <div class="grafico-label">${modalidade}</div>
                    <div class="grafico-barra">
                        <div class="grafico-preenchimento" style="width: ${porcentagem}%"></div>
                    </div>
                    <div class="grafico-valor">${count} (${porcentagem}%)</div>
                </div>
            `;
        }).join('');
    }
    
    // Gráfico de distribuição etária
    const faixasEtarias = {
        '0-12': 0,
        '13-17': 0,
        '18-25': 0,
        '26-35': 0,
        '36-50': 0,
        '50+': 0
    };
    
    if (appData.campistas && appData.campistas.length > 0) {
        appData.campistas.forEach(c => {
            const idade = parseInt(c.idade);
            if (idade <= 12) faixasEtarias['0-12']++;
            else if (idade <= 17) faixasEtarias['13-17']++;
            else if (idade <= 25) faixasEtarias['18-25']++;
            else if (idade <= 35) faixasEtarias['26-35']++;
            else if (idade <= 50) faixasEtarias['36-50']++;
            else faixasEtarias['50+']++;
        });
    }
    
    const graficoIdades = document.getElementById('grafico-idades');
    if (graficoIdades) {
        const totalCampistas = appData.campistas.length;
        graficoIdades.innerHTML = Object.entries(faixasEtarias).map(([faixa, count]) => {
            const porcentagem = totalCampistas > 0 ? (count / totalCampistas * 100).toFixed(1) : 0;
            return `
                <div class="grafico-item">
                    <div class="grafico-label">${faixa} anos</div>
                    <div class="grafico-barra">
                        <div class="grafico-preenchimento" style="width: ${porcentagem}%"></div>
                    </div>
                    <div class="grafico-valor">${count} (${porcentagem}%)</div>
                </div>
            `;
        }).join('');
    }
    
    // Gráfico financeiro mensal
    const dadosFinanceiros = {};
    const hoje = new Date();
    
    // Últimos 6 meses
    for (let i = 5; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        dadosFinanceiros[chave] = { receitas: 0, despesas: 0 };
    }
    
    // Somar receitas
    if (appData.pagamentos && appData.pagamentos.length > 0) {
        appData.pagamentos.forEach(p => {
            const data = new Date(p.data);
            const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
            if (dadosFinanceiros[chave]) {
                dadosFinanceiros[chave].receitas += parseFloat(p.valor);
            }
        });
    }
    
    // Somar despesas
    if (appData.despesas && appData.despesas.length > 0) {
        appData.despesas.forEach(d => {
            const data = new Date(d.data);
            const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
            if (dadosFinanceiros[chave]) {
                dadosFinanceiros[chave].despesas += parseFloat(d.valor);
            }
        });
    }
    
    const graficoFinanceiro = document.getElementById('grafico-financeiro');
    if (graficoFinanceiro) {
        const maxValor = Math.max(
            ...Object.values(dadosFinanceiros).map(d => Math.max(d.receitas, d.despesas))
        );
        
        graficoFinanceiro.innerHTML = Object.entries(dadosFinanceiros).map(([mes, dados]) => {
            const [ano, mesNum] = mes.split('-');
            const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const nomeMes = nomesMeses[parseInt(mesNum) - 1];
            
            const alturaReceitas = maxValor > 0 ? (dados.receitas / maxValor * 100) : 0;
            const alturaDespesas = maxValor > 0 ? (dados.despesas / maxValor * 100) : 0;
            
            return `
                <div class="grafico-financeiro-mes">
                    <div class="grafico-financeiro-barras">
                        <div class="barra-receita" style="height: ${alturaReceitas}%" title="Receitas: R$ ${dados.receitas.toFixed(2)}"></div>
                        <div class="barra-despesa" style="height: ${alturaDespesas}%" title="Despesas: R$ ${dados.despesas.toFixed(2)}"></div>
                    </div>
                    <div class="grafico-financeiro-label">${nomeMes}</div>
                </div>
            `;
        }).join('');
    }
}

function updateProximosAcampamentos() {
    const container = document.getElementById('proximos-acampamentos');
    const hoje = new Date();
    const proximosAcampamentos = appData.acampamentos
        .filter(a => new Date(a.dataInicio) >= hoje)
        .sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio))
        .slice(0, 3);
    
    if (proximosAcampamentos.length === 0) {
        container.innerHTML = '<p class="text-muted">Nenhum acampamento próximo</p>';
        return;
    }
    
    container.innerHTML = proximosAcampamentos.map(acampamento => `
        <div class="mb-2 p-2 border rounded">
            <strong>${acampamento.nome}</strong><br>
            <small>${formatDate(acampamento.dataInicio)} - ${acampamento.modalidade}</small>
        </div>
    `).join('');
}

function updateAlertas() {
    const container = document.getElementById('alertas-notificacoes');
    const alertas = [];
    
    // Verificar acampamentos sem campistas
    const acampamentosSemCampistas = appData.acampamentos.filter(a => {
        const campistas = appData.campistas.filter(c => c.acampamentoId === a.id);
        return campistas.length === 0;
    });
    
    if (acampamentosSemCampistas.length > 0) {
        alertas.push({
            tipo: 'warning',
            mensagem: `${acampamentosSemCampistas.length} acampamento(s) sem campistas cadastrados`
        });
    }
    
    // Verificar tribos sem membros
    const tribosSemMembros = appData.tribos.filter(t => !t.membros || t.membros.length === 0);
    if (tribosSemMembros.length > 0) {
        alertas.push({
            tipo: 'info',
            mensagem: `${tribosSemMembros.length} tribo(s) sem membros`
        });
    }
    
    // Verificar setores com poucos membros
    const setoresComPoucosMembros = appData.setores.filter(s => s.membros && s.membros.length < 2);
    if (setoresComPoucosMembros.length > 0) {
        alertas.push({
            tipo: 'warning',
            mensagem: `${setoresComPoucosMembros.length} setor(es) com poucos membros`
        });
    }
    
    // Verificar campistas não organizados
    const campistasNaoOrganizados = appData.campistas.filter(c => !c.triboId);
    if (campistasNaoOrganizados.length > 0) {
        alertas.push({
            tipo: 'info',
            mensagem: `${campistasNaoOrganizados.length} campista(s) não organizados em tribos`
        });
    }
    
    // Verificar equipe não alocada
    const equipeNaoAlocada = appData.equipe.filter(e => !e.setorId);
    if (equipeNaoAlocada.length > 0) {
        alertas.push({
            tipo: 'info',
            mensagem: `${equipeNaoAlocada.length} membro(s) da equipe não alocados`
        });
    }
    
    if (alertas.length === 0) {
        container.innerHTML = '<p class="text-muted">Nenhum alerta no momento</p>';
        return;
    }
    
    container.innerHTML = alertas.map(alerta => `
        <div class="alert alert-${alerta.tipo} mb-2">
            <i class="fas fa-${alerta.tipo === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            ${alerta.mensagem}
        </div>
    `).join('');
}

function gerarRelatorioGeral() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    const acampamentosOptions = appData.acampamentos.map(a => 
        `<option value="${a.id}">${a.nome}</option>`
    ).join('');
    
    modalBody.innerHTML = `
        <h2>Gerar Relatório Geral</h2>
        
        <div class="form-group">
            <label for="acampamentoRelatorio">Acampamento:</label>
            <select id="acampamentoRelatorio">
                <option value="todos">Todos os Acampamentos</option>
                ${acampamentosOptions}
            </select>
        </div>
        
        <div class="form-group">
            <label>Incluir no Relatório:</label>
            <div class="checkbox-group">
                <label><input type="checkbox" id="incluirCampistas" checked> Campistas</label>
                <label><input type="checkbox" id="incluirEquipe" checked> Equipe</label>
                <label><input type="checkbox" id="incluirTribos" checked> Tribos</label>
                <label><input type="checkbox" id="incluirSetores" checked> Setores</label>
                <label><input type="checkbox" id="incluirFinanceiro"> Resumo Financeiro</label>
            </div>
        </div>
        
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="executarRelatorioGeral()">Gerar Relatório</button>
        </div>
    `;
    
    modal.classList.add('show');
}

function executarRelatorioGeral() {
    const acampamentoId = document.getElementById('acampamentoRelatorio').value;
    const incluirCampistas = document.getElementById('incluirCampistas').checked;
    const incluirEquipe = document.getElementById('incluirEquipe').checked;
    const incluirTribos = document.getElementById('incluirTribos').checked;
    const incluirSetores = document.getElementById('incluirSetores').checked;
    const incluirFinanceiro = document.getElementById('incluirFinanceiro').checked;
    
    let conteudo = '<h1>Relatório Geral do Sistema</h1>';
    conteudo += `<p><strong>Data de Geração:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>`;
    
    if (acampamentoId !== 'todos') {
        const acampamento = appData.acampamentos.find(a => a.id === acampamentoId);
        conteudo += `<p><strong>Acampamento:</strong> ${acampamento.nome}</p>`;
    }
    
    // Estatísticas Gerais
    conteudo += '<h2>Estatísticas Gerais</h2>';
    conteudo += '<table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';
    conteudo += '<tr><th style="padding: 10px;">Item</th><th style="padding: 10px;">Quantidade</th></tr>';
    
    if (acampamentoId === 'todos') {
        conteudo += `<tr><td style="padding: 10px;">Total de Acampamentos</td><td style="padding: 10px;">${appData.acampamentos.length}</td></tr>`;
        conteudo += `<tr><td style="padding: 10px;">Total de Campistas</td><td style="padding: 10px;">${appData.campistas.length}</td></tr>`;
    } else {
        const campistas = appData.campistas.filter(c => c.acampamentoId === acampamentoId);
        conteudo += `<tr><td style="padding: 10px;">Campistas do Acampamento</td><td style="padding: 10px;">${campistas.length}</td></tr>`;
    }
    
    conteudo += `<tr><td style="padding: 10px;">Total da Equipe</td><td style="padding: 10px;">${appData.equipe.length}</td></tr>`;
    conteudo += `<tr><td style="padding: 10px;">Total de Tribos</td><td style="padding: 10px;">${appData.tribos.length}</td></tr>`;
    conteudo += `<tr><td style="padding: 10px;">Total de Setores</td><td style="padding: 10px;">${appData.setores.length}</td></tr>`;
    conteudo += '</table>';
    
    // Campistas
    if (incluirCampistas) {
        const campistas = acampamentoId === 'todos' ? 
            appData.campistas : 
            appData.campistas.filter(c => c.acampamentoId === acampamentoId);
        
        conteudo += '<h2>Campistas</h2>';
        conteudo += '<table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';
        conteudo += '<tr><th style="padding: 8px;">Nome</th><th style="padding: 8px;">Idade</th><th style="padding: 8px;">Acampamento</th><th style="padding: 8px;">Tribo</th></tr>';
        
        campistas.forEach(c => {
            conteudo += `<tr>
                <td style="padding: 8px;">${c.nome}</td>
                <td style="padding: 8px;">${c.idade}</td>
                <td style="padding: 8px;">${getAcampamentoNome(c.acampamentoId)}</td>
                <td style="padding: 8px;">${getTriboNome(c.triboId) || 'Não organizado'}</td>
            </tr>`;
        });
        
        conteudo += '</table>';
    }
    
    // Equipe
    if (incluirEquipe) {
        conteudo += '<h2>Equipe de Trabalho</h2>';
        conteudo += '<table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';
        conteudo += '<tr><th style="padding: 8px;">Nome</th><th style="padding: 8px;">Função</th><th style="padding: 8px;">Setor</th><th style="padding: 8px;">Contato</th></tr>';
        
        appData.equipe.forEach(e => {
            conteudo += `<tr>
                <td style="padding: 8px;">${e.nome}</td>
                <td style="padding: 8px;">${e.funcao}</td>
                <td style="padding: 8px;">${getSetorNome(e.setorId) || 'Não alocado'}</td>
                <td style="padding: 8px;">${e.telefone || 'N/A'}</td>
            </tr>`;
        });
        
        conteudo += '</table>';
    }
    
    // Resumo Financeiro
    if (incluirFinanceiro) {
        const totalReceitas = appData.pagamentos.reduce((sum, p) => sum + parseFloat(p.valor), 0);
        const totalDespesas = appData.despesas.reduce((sum, d) => sum + parseFloat(d.valor), 0);
        const saldo = totalReceitas - totalDespesas;
        
        conteudo += '<h2>Resumo Financeiro</h2>';
        conteudo += '<table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';
        conteudo += '<tr><th style="padding: 10px;">Item</th><th style="padding: 10px;">Valor</th></tr>';
        conteudo += `<tr><td style="padding: 10px;">Total de Receitas</td><td style="padding: 10px;">R$ ${totalReceitas.toFixed(2)}</td></tr>`;
        conteudo += `<tr><td style="padding: 10px;">Total de Despesas</td><td style="padding: 10px;">R$ ${totalDespesas.toFixed(2)}</td></tr>`;
        conteudo += `<tr><td style="padding: 10px;"><strong>Saldo</strong></td><td style="padding: 10px; color: ${saldo >= 0 ? 'green' : 'red'};"><strong>R$ ${saldo.toFixed(2)}</strong></td></tr>`;
        conteudo += '</table>';
    }
    
    // Abrir em nova janela
    const novaJanela = window.open('', '_blank');
    novaJanela.document.write(`
        <html>
            <head>
                <title>Relatório Geral</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; text-align: center; }
                    h2 { color: #666; margin-top: 30px; }
                    table { page-break-inside: avoid; }
                    @media print {
                        body { margin: 0; }
                        h2 { page-break-before: always; }
                    }
                </style>
            </head>
            <body>
                ${conteudo}
            </body>
        </html>
    `);
    novaJanela.document.close();
    
    closeModal();
    showToast('Relatório geral gerado com sucesso!', 'success');
}

function gerarRelatorioFinanceiro() {
    let conteudo = '<h1>Relatório Financeiro Detalhado</h1>';
    conteudo += `<p><strong>Data de Geração:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>`;
    
    // Resumo Financeiro
    const totalReceitas = appData.pagamentos.reduce((sum, p) => sum + parseFloat(p.valor), 0);
    const totalDespesas = appData.despesas.reduce((sum, d) => sum + parseFloat(d.valor), 0);
    const saldo = totalReceitas - totalDespesas;
    
    conteudo += '<h2>Resumo Geral</h2>';
    conteudo += '<table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">';
    conteudo += '<tr><th style="padding: 15px; background-color: #f5f5f5;">Item</th><th style="padding: 15px; background-color: #f5f5f5;">Valor</th></tr>';
    conteudo += `<tr><td style="padding: 12px;">Total de Receitas</td><td style="padding: 12px; color: green;">R$ ${totalReceitas.toFixed(2)}</td></tr>`;
    conteudo += `<tr><td style="padding: 12px;">Total de Despesas</td><td style="padding: 12px; color: red;">R$ ${totalDespesas.toFixed(2)}</td></tr>`;
    conteudo += `<tr><td style="padding: 12px; font-weight: bold;">Saldo Final</td><td style="padding: 12px; font-weight: bold; color: ${saldo >= 0 ? 'green' : 'red'};">R$ ${saldo.toFixed(2)}</td></tr>`;
    conteudo += '</table>';
    
    // Detalhamento de Receitas
    if (appData.pagamentos.length > 0) {
        conteudo += '<h2>Detalhamento de Receitas</h2>';
        conteudo += '<table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">';
        conteudo += '<tr><th style="padding: 10px; background-color: #f5f5f5;">Data</th><th style="padding: 10px; background-color: #f5f5f5;">Descrição</th><th style="padding: 10px; background-color: #f5f5f5;">Campista</th><th style="padding: 10px; background-color: #f5f5f5;">Forma de Pagamento</th><th style="padding: 10px; background-color: #f5f5f5;">Valor</th></tr>';
        
        appData.pagamentos.forEach(p => {
            conteudo += `<tr>
                <td style="padding: 8px;">${formatDate(p.data)}</td>
                <td style="padding: 8px;">${p.descricao}</td>
                <td style="padding: 8px;">${getCampistaNome(p.campistaId)}</td>
                <td style="padding: 8px;">${p.formaPagamento}</td>
                <td style="padding: 8px; color: green;">R$ ${parseFloat(p.valor).toFixed(2)}</td>
            </tr>`;
        });
        
        conteudo += '</table>';
    }
    
    // Detalhamento de Despesas
    if (appData.despesas.length > 0) {
        conteudo += '<h2>Detalhamento de Despesas</h2>';
        conteudo += '<table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">';
        conteudo += '<tr><th style="padding: 10px; background-color: #f5f5f5;">Data</th><th style="padding: 10px; background-color: #f5f5f5;">Descrição</th><th style="padding: 10px; background-color: #f5f5f5;">Categoria</th><th style="padding: 10px; background-color: #f5f5f5;">Fornecedor</th><th style="padding: 10px; background-color: #f5f5f5;">Valor</th></tr>';
        
        appData.despesas.forEach(d => {
            conteudo += `<tr>
                <td style="padding: 8px;">${formatDate(d.data)}</td>
                <td style="padding: 8px;">${d.descricao}</td>
                <td style="padding: 8px;">${d.categoria}</td>
                <td style="padding: 8px;">${d.fornecedor || 'N/A'}</td>
                <td style="padding: 8px; color: red;">R$ ${parseFloat(d.valor).toFixed(2)}</td>
            </tr>`;
        });
        
        conteudo += '</table>';
    }
    
    // Abrir em nova janela
    const novaJanela = window.open('', '_blank');
    novaJanela.document.write(`
        <html>
            <head>
                <title>Relatório Financeiro</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; text-align: center; }
                    h2 { color: #666; margin-top: 30px; }
                    table { page-break-inside: avoid; }
                    @media print {
                        body { margin: 0; }
                        h2 { page-break-before: always; }
                    }
                </style>
            </head>
            <body>
                ${conteudo}
            </body>
        </html>
    `);
    novaJanela.document.close();
    
    showToast('Relatório financeiro gerado com sucesso!', 'success');
}

function gerarRelatorioPresenca() {
    // Reutilizar a função já existente
    gerarListaPresenca();
}

// === EXPORTAÇÃO E IMPORTAÇÃO DE DADOS ===
function exportarDados() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <h2>Exportar Dados</h2>
        
        <div class="form-group">
            <label>Formato de Exportação:</label>
            <div class="radio-group">
                <label><input type="radio" name="formatoExport" value="json" checked> JSON (Backup Completo)</label>
                <label><input type="radio" name="formatoExport" value="excel"> Excel (.xlsx)</label>
                <label><input type="radio" name="formatoExport" value="csv"> CSV</label>
            </div>
        </div>
        
        <div class="form-group">
            <label>Dados para Exportar:</label>
            <div class="checkbox-group">
                <label><input type="checkbox" id="exportAcampamentos" checked> Acampamentos</label>
                <label><input type="checkbox" id="exportCampistas" checked> Campistas</label>
                <label><input type="checkbox" id="exportEquipe" checked> Equipe</label>
                <label><input type="checkbox" id="exportTribos" checked> Tribos</label>
                <label><input type="checkbox" id="exportSetores" checked> Setores</label>
                <label><input type="checkbox" id="exportPagamentos" checked> Pagamentos</label>
                <label><input type="checkbox" id="exportDespesas" checked> Despesas</label>
            </div>
        </div>
        
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="executarExportacao()">Exportar</button>
        </div>
    `;
    
    modal.classList.add('show');
}

function executarExportacao() {
    const formato = document.querySelector('input[name="formatoExport"]:checked').value;
    const dadosParaExportar = {};
    
    // Coletar dados selecionados
    if (document.getElementById('exportAcampamentos').checked) {
        dadosParaExportar.acampamentos = appData.acampamentos;
    }
    if (document.getElementById('exportCampistas').checked) {
        dadosParaExportar.campistas = appData.campistas;
    }
    if (document.getElementById('exportEquipe').checked) {
        dadosParaExportar.equipe = appData.equipe;
    }
    if (document.getElementById('exportTribos').checked) {
        dadosParaExportar.tribos = appData.tribos;
    }
    if (document.getElementById('exportSetores').checked) {
        dadosParaExportar.setores = appData.setores;
    }
    if (document.getElementById('exportPagamentos').checked) {
        dadosParaExportar.pagamentos = appData.pagamentos;
    }
    if (document.getElementById('exportDespesas').checked) {
        dadosParaExportar.despesas = appData.despesas;
    }
    
    try {
        switch (formato) {
            case 'json':
                exportarJSON(dadosParaExportar);
                break;
            case 'excel':
                exportarExcel(dadosParaExportar);
                break;
            case 'csv':
                exportarCSV(dadosParaExportar);
                break;
        }
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        showToast('Erro ao exportar dados', 'error');
    }
    
    closeModal();
}

function exportarJSON(dados) {
    const dataStr = JSON.stringify(dados, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `siscom-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showToast('Dados exportados em JSON com sucesso!', 'success');
}

function exportarExcel(dados) {
    // Simular exportação Excel usando CSV com separador de abas
    let conteudo = '';
    
    Object.keys(dados).forEach(tabela => {
        conteudo += `\n=== ${tabela.toUpperCase()} ===\n`;
        
        if (dados[tabela].length > 0) {
            // Cabeçalhos
            const headers = Object.keys(dados[tabela][0]);
            conteudo += headers.join('\t') + '\n';
            
            // Dados
            dados[tabela].forEach(item => {
                const valores = headers.map(header => {
                    let valor = item[header];
                    if (typeof valor === 'object' && valor !== null) {
                        valor = JSON.stringify(valor);
                    }
                    return valor || '';
                });
                conteudo += valores.join('\t') + '\n';
            });
        }
        conteudo += '\n';
    });
    
    const dataBlob = new Blob([conteudo], {type: 'text/tab-separated-values'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `siscom-dados-${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    
    showToast('Dados exportados em Excel com sucesso!', 'success');
}

function exportarCSV(dados) {
    Object.keys(dados).forEach(tabela => {
        if (dados[tabela].length > 0) {
            let csvContent = '';
            
            // Cabeçalhos
            const headers = Object.keys(dados[tabela][0]);
            csvContent += headers.join(',') + '\n';
            
            // Dados
            dados[tabela].forEach(item => {
                const valores = headers.map(header => {
                    let valor = item[header];
                    if (typeof valor === 'object' && valor !== null) {
                        valor = JSON.stringify(valor);
                    }
                    // Escapar aspas e adicionar aspas se necessário
                    if (valor && valor.toString().includes(',')) {
                        valor = `"${valor.toString().replace(/"/g, '""')}"`;
                    }
                    return valor || '';
                });
                csvContent += valores.join(',') + '\n';
            });
            
            const dataBlob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `siscom-${tabela}-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        }
    });
    
    showToast('Dados exportados em CSV com sucesso!', 'success');
}

function importarDados() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (confirm('Tem certeza que deseja importar os dados? Isso substituirá todos os dados atuais.')) {
                    // Fazer backup dos dados atuais
                    const backup = JSON.stringify(appData);
                    localStorage.setItem('acampamentosCatolicos_backup', backup);
                    
                    // Importar novos dados
                    appData = { ...appData, ...importedData };
                    saveData();
                    
                    // Recarregar interface
                    initializeApp();
                    
                    showToast('Dados importados com sucesso!', 'success');
                }
            } catch (error) {
                console.error('Erro ao importar dados:', error);
                showToast('Erro ao importar dados. Verifique se o arquivo é válido.', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function exportarPDF() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    const acampamentosOptions = appData.acampamentos.map(a => 
        `<option value="${a.id}">${a.nome}</option>`
    ).join('');
    
    modalBody.innerHTML = `
        <h2>Exportar PDF</h2>
        
        <div class="form-group">
            <label for="tipoRelatorioPDF">Tipo de Relatório:</label>
            <select id="tipoRelatorioPDF">
                <option value="geral">Relatório Geral</option>
                <option value="campistas">Lista de Campistas</option>
                <option value="equipe">Lista da Equipe</option>
                <option value="financeiro">Relatório Financeiro</option>
                <option value="presenca">Lista de Presença</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="acampamentoPDF">Acampamento:</label>
            <select id="acampamentoPDF">
                <option value="todos">Todos os Acampamentos</option>
                ${acampamentosOptions}
            </select>
        </div>
        
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="executarExportacaoPDF()">Gerar PDF</button>
        </div>
    `;
    
    modal.classList.add('show');
}

function executarExportacaoPDF() {
    const tipoRelatorio = document.getElementById('tipoRelatorioPDF').value;
    const acampamentoId = document.getElementById('acampamentoPDF').value;
    
    switch (tipoRelatorio) {
        case 'geral':
            // Simular clique no relatório geral existente
            document.getElementById('acampamentoRelatorio').value = acampamentoId;
            executarRelatorioGeral();
            break;
        case 'financeiro':
            gerarRelatorioFinanceiro();
            break;
        case 'presenca':
            gerarListaPresenca();
            break;
        case 'campistas':
            gerarListaCampistas(acampamentoId);
            break;
        case 'equipe':
            gerarListaEquipe();
            break;
    }
    
    closeModal();
    showToast('PDF gerado com sucesso! Use Ctrl+P para imprimir.', 'success');
}

function gerarListaCampistas(acampamentoId) {
    const campistas = acampamentoId === 'todos' ? 
        appData.campistas : 
        appData.campistas.filter(c => c.acampamentoId === acampamentoId);
    
    let conteudo = '<h1>Lista de Campistas</h1>';
    conteudo += `<p><strong>Data de Geração:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>`;
    
    if (acampamentoId !== 'todos') {
        const acampamento = appData.acampamentos.find(a => a.id === acampamentoId);
        conteudo += `<p><strong>Acampamento:</strong> ${acampamento.nome}</p>`;
    }
    
    conteudo += '<table border="1" style="width: 100%; border-collapse: collapse;">';
    conteudo += '<tr><th style="padding: 10px;">Nome</th><th style="padding: 10px;">Idade</th><th style="padding: 10px;">Telefone</th><th style="padding: 10px;">Acampamento</th><th style="padding: 10px;">Tribo</th></tr>';
    
    campistas.forEach(c => {
        conteudo += `<tr>
            <td style="padding: 8px;">${c.nome}</td>
            <td style="padding: 8px;">${c.idade}</td>
            <td style="padding: 8px;">${c.telefone || 'N/A'}</td>
            <td style="padding: 8px;">${getAcampamentoNome(c.acampamentoId)}</td>
            <td style="padding: 8px;">${getTriboNome(c.triboId) || 'Não organizado'}</td>
        </tr>`;
    });
    
    conteudo += '</table>';
    
    abrirJanelaPDF(conteudo, 'Lista de Campistas');
}

function gerarListaEquipe() {
    let conteudo = '<h1>Lista da Equipe de Trabalho</h1>';
    conteudo += `<p><strong>Data de Geração:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>`;
    
    conteudo += '<table border="1" style="width: 100%; border-collapse: collapse;">';
    conteudo += '<tr><th style="padding: 10px;">Nome</th><th style="padding: 10px;">Função</th><th style="padding: 10px;">Setor</th><th style="padding: 10px;">Telefone</th><th style="padding: 10px;">Email</th></tr>';
    
    appData.equipe.forEach(e => {
        conteudo += `<tr>
            <td style="padding: 8px;">${e.nome}</td>
            <td style="padding: 8px;">${e.funcao}</td>
            <td style="padding: 8px;">${getSetorNome(e.setorId) || 'Não alocado'}</td>
            <td style="padding: 8px;">${e.telefone || 'N/A'}</td>
            <td style="padding: 8px;">${e.email || 'N/A'}</td>
        </tr>`;
    });
    
    conteudo += '</table>';
    
    abrirJanelaPDF(conteudo, 'Lista da Equipe');
}

function abrirJanelaPDF(conteudo, titulo) {
    const novaJanela = window.open('', '_blank');
    novaJanela.document.write(`
        <html>
            <head>
                <title>${titulo}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; text-align: center; }
                    table { page-break-inside: avoid; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="no-print" style="margin-bottom: 20px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Imprimir PDF</button>
                </div>
                ${conteudo}
            </body>
        </html>
    `);
    novaJanela.document.close();
}

function visualizarHistorico() {
    const backup = localStorage.getItem('acampamentosCatolicos_backup');
    if (!backup) {
        showToast('Nenhum backup encontrado', 'info');
        return;
    }
    
    try {
        const backupData = JSON.parse(backup);
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        
        modalBody.innerHTML = `
            <h2>Histórico de Backup</h2>
            <div class="mb-3">
                <p><strong>Última atualização do backup:</strong> ${formatDate(backupData.configuracoes?.ultimaAtualizacao)}</p>
                <p><strong>Acampamentos:</strong> ${backupData.acampamentos?.length || 0}</p>
                <p><strong>Campistas:</strong> ${backupData.campistas?.length || 0}</p>
                <p><strong>Equipe:</strong> ${backupData.equipe?.length || 0}</p>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Fechar</button>
                <button type="button" class="btn btn-warning" onclick="restaurarBackup()">Restaurar Backup</button>
            </div>
        `;
        
        modal.classList.add('show');
    } catch (error) {
        showToast('Erro ao visualizar histórico', 'error');
    }
}

function restaurarBackup() {
    if (confirm('Tem certeza que deseja restaurar o backup? Os dados atuais serão perdidos.')) {
        const backup = localStorage.getItem('acampamentosCatolicos_backup');
        if (backup) {
            try {
                appData = JSON.parse(backup);
                saveData();
                initializeApp();
                closeModal();
                showToast('Backup restaurado com sucesso!', 'success');
            } catch (error) {
                showToast('Erro ao restaurar backup', 'error');
            }
        }
    }
}

// === SISTEMA DE NOTIFICAÇÕES ===
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Mostrar toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remover toast após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

function getToastIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// === FUNÇÕES DE BUSCA E FILTRO ===
function filtrarDados(tipo, termo) {
    const termoBusca = termo.toLowerCase();
    let dados = [];
    
    switch(tipo) {
        case 'acampamentos':
            dados = appData.acampamentos.filter(item => 
                item.nome.toLowerCase().includes(termoBusca) ||
                item.modalidade.toLowerCase().includes(termoBusca) ||
                item.local.toLowerCase().includes(termoBusca)
            );
            break;
        case 'campistas':
            dados = appData.campistas.filter(item => 
                item.nome.toLowerCase().includes(termoBusca) ||
                item.telefone.includes(termoBusca) ||
                (item.paroquia && item.paroquia.toLowerCase().includes(termoBusca))
            );
            break;
        case 'equipe':
            dados = appData.equipe.filter(item => 
                item.nome.toLowerCase().includes(termoBusca) ||
                item.funcao.toLowerCase().includes(termoBusca) ||
                item.telefone.includes(termoBusca)
            );
            break;
    }
    
    return dados;
}

// === ORGANIZAÇÃO PÓS-CADASTRO ===
function loadOrganizacao() {
    updateOrganizacaoStats();
    loadCampistasNaoOrganizados();
    loadEquipeNaoAlocada();
}

function updateOrganizacaoStats() {
    const campistasNaoOrganizados = appData.campistas.filter(c => !c.triboId).length;
    const equipeNaoAlocada = appData.equipe.filter(e => !e.setorId).length;
    
    document.getElementById('campistas-nao-organizados').textContent = campistasNaoOrganizados;
    document.getElementById('equipe-nao-alocada').textContent = equipeNaoAlocada;
}

function loadCampistasNaoOrganizados() {
    const container = document.getElementById('campistas-nao-organizados-list');
    const campistasNaoOrganizados = appData.campistas.filter(c => !c.triboId);
    
    if (campistasNaoOrganizados.length === 0) {
        container.innerHTML = '<p class="text-muted">Todos os campistas estão organizados em tribos</p>';
        return;
    }
    
    container.innerHTML = campistasNaoOrganizados.map(campista => `
        <div class="organization-item">
            <div class="d-flex justify-between items-center">
                <div>
                    <strong>${campista.nome}</strong><br>
                    <small>${campista.idade} anos - ${getAcampamentoNome(campista.acampamentoId)}</small>
                </div>
                <button class="btn btn-sm btn-primary" onclick="alocarCampistaTribo('${campista.id}')">
                    Alocar em Tribo
                </button>
            </div>
        </div>
    `).join('');
}

function loadEquipeNaoAlocada() {
    const container = document.getElementById('equipe-nao-alocada-list');
    const equipeNaoAlocada = appData.equipe.filter(e => !e.setorId);
    
    if (equipeNaoAlocada.length === 0) {
        container.innerHTML = '<p class="text-muted">Toda a equipe está alocada em setores</p>';
        return;
    }
    
    container.innerHTML = equipeNaoAlocada.map(membro => `
        <div class="organization-item">
            <div class="d-flex justify-between items-center">
                <div>
                    <strong>${membro.nome}</strong><br>
                    <small>${membro.funcao}</small>
                </div>
                <button class="btn btn-sm btn-primary" onclick="alocarMembroSetor('${membro.id}')">
                    Alocar em Setor
                </button>
            </div>
        </div>
    `).join('');
}

function alocarCampistaTribo(campistaId) {
    const campista = appData.campistas.find(c => c.id === campistaId);
    if (!campista) return;
    
    // Buscar tribos associadas ao acampamento do campista
    const tribosAssociadas = appData.acampamentoTribos
        .filter(assoc => assoc.acampamentoId === campista.acampamentoId)
        .map(assoc => assoc.triboId);
    const tribosDisponiveis = appData.tribos.filter(tribo => tribosAssociadas.includes(tribo.id));
    
    if (tribosDisponiveis.length === 0) {
        showToast('Nenhuma tribo associada a este acampamento', 'warning');
        return;
    }
    
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    const tribosOptions = tribosDisponiveis.map(t => 
        `<option value="${t.id}">${t.nome}</option>`
    ).join('');
    
    modalBody.innerHTML = `
        <h2>Alocar Campista em Tribo</h2>
        <p><strong>Campista:</strong> ${campista.nome}</p>
        <form onsubmit="salvarAlocacaoTribo(event, '${campistaId}')">
            <div class="form-group">
                <label for="triboId">Selecione a Tribo:</label>
                <select id="triboId" name="triboId" required>
                    <option value="">Selecione...</option>
                    ${tribosOptions}
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">Alocar</button>
            </div>
        </form>
    `;
    
    modal.classList.add('show');
}

function salvarAlocacaoTribo(event, campistaId) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const triboId = formData.get('triboId');
    
    // Atualizar campista
    const campistaIndex = appData.campistas.findIndex(c => c.id === campistaId);
    appData.campistas[campistaIndex].triboId = triboId;
    
    // Atualizar tribo
    const tribo = appData.tribos.find(t => t.id === triboId);
    if (tribo) {
        if (!tribo.membros) tribo.membros = [];
        tribo.membros.push({
            id: campistaId,
            nome: appData.campistas[campistaIndex].nome,
            tipo: 'campista'
        });
    }
    
    saveData();
    loadOrganizacao();
    loadTribos();
    closeModal();
    showToast('Campista alocado com sucesso!', 'success');
}

function openDistribuirTribos() {
    const campistasNaoOrganizados = appData.campistas.filter(c => !c.triboId);
    
    if (campistasNaoOrganizados.length === 0) {
        showToast('Todos os campistas já estão organizados em tribos', 'info');
        return;
    }
    
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <h2>Distribuir Campistas em Tribos</h2>
        <p>Campistas não organizados: <strong>${campistasNaoOrganizados.length}</strong></p>
        
        <div class="form-group">
            <label>Método de Distribuição:</label>
            <div class="radio-group">
                <label><input type="radio" name="metodo" value="automatico" checked> Automático (por idade)</label>
                <label><input type="radio" name="metodo" value="equilibrado"> Equilibrado (por quantidade)</label>
                <label><input type="radio" name="metodo" value="aleatorio"> Aleatório</label>
            </div>
        </div>
        
        <div class="campistas-preview">
            <h4>Campistas a serem distribuídos:</h4>
            <div class="campistas-list">
                ${campistasNaoOrganizados.map(c => `
                    <div class="campista-item">
                        <span>${c.nome} (${c.idade} anos)</span>
                        <small>${getAcampamentoNome(c.acampamentoId)}</small>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="executarDistribuicaoTribos()">Distribuir</button>
        </div>
    `;
    
    modal.classList.add('show');
}

function executarDistribuicaoTribos() {
    const metodo = document.querySelector('input[name="metodo"]:checked').value;
    const campistasNaoOrganizados = appData.campistas.filter(c => !c.triboId);
    
    // Agrupar por acampamento
    const campistasPorAcampamento = {};
    campistasNaoOrganizados.forEach(campista => {
        if (!campistasPorAcampamento[campista.acampamentoId]) {
            campistasPorAcampamento[campista.acampamentoId] = [];
        }
        campistasPorAcampamento[campista.acampamentoId].push(campista);
    });
    
    let distribuidos = 0;
    
    Object.keys(campistasPorAcampamento).forEach(acampamentoId => {
        const campistas = campistasPorAcampamento[acampamentoId];
        // Buscar tribos associadas ao acampamento
        const tribosAssociadas = appData.acampamentoTribos
            .filter(assoc => assoc.acampamentoId === acampamentoId)
            .map(assoc => assoc.triboId);
        const tribosDisponiveis = appData.tribos.filter(tribo => tribosAssociadas.includes(tribo.id));
        
        if (tribosDisponiveis.length === 0) return;
        
        if (metodo === 'automatico') {
            // Ordenar por idade
            campistas.sort((a, b) => a.idade - b.idade);
        } else if (metodo === 'aleatorio') {
            // Embaralhar array
            for (let i = campistas.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [campistas[i], campistas[j]] = [campistas[j], campistas[i]];
            }
        }
        
        // Distribuir campistas
        campistas.forEach((campista, index) => {
            const triboIndex = index % tribosDisponiveis.length;
            const tribo = tribosDisponiveis[triboIndex];
            
            // Atualizar campista
            campista.triboId = tribo.id;
            
            // Atualizar tribo
            if (!tribo.membros) tribo.membros = [];
            if (!tribo.membros.includes(campista.id)) {
                tribo.membros.push(campista.id);
            }
            
            distribuidos++;
        });
    });
    
    saveData();
    loadOrganizacao();
    loadTribos();
    closeModal();
    showToast(`${distribuidos} campistas distribuídos com sucesso!`, 'success');
}

function openAlocarSetores() {
    const equipeNaoAlocada = appData.equipe.filter(e => !e.setorId);
    
    if (equipeNaoAlocada.length === 0) {
        showToast('Toda a equipe já está alocada em setores', 'info');
        return;
    }
    
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    const setoresOptions = appData.setores.map(s => 
        `<option value="${s.id}">${s.nome}</option>`
    ).join('');
    
    modalBody.innerHTML = `
        <h2>Alocar Equipe em Setores</h2>
        <p>Membros não alocados: <strong>${equipeNaoAlocada.length}</strong></p>
        
        <div class="alocacao-list">
            ${equipeNaoAlocada.map(membro => `
                <div class="alocacao-item">
                    <div class="membro-info">
                        <strong>${membro.nome}</strong><br>
                        <small>${membro.funcao}</small>
                    </div>
                    <select class="setor-select" data-membro-id="${membro.id}">
                        <option value="">Selecionar setor...</option>
                        ${setoresOptions}
                    </select>
                </div>
            `).join('')}
        </div>
        
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="executarAlocacaoSetores()">Alocar</button>
        </div>
    `;
    
    modal.classList.add('show');
}

function executarAlocacaoSetores() {
    const selects = document.querySelectorAll('.setor-select');
    let alocados = 0;
    
    selects.forEach(select => {
        const membroId = select.dataset.membroId;
        const setorId = select.value;
        
        if (setorId) {
            const membro = appData.equipe.find(e => e.id === membroId);
            if (membro) {
                membro.setorId = setorId;
                alocados++;
            }
        }
    });
    
    saveData();
    loadOrganizacao();
    loadEquipe();
    closeModal();
    showToast(`${alocados} membros alocados com sucesso!`, 'success');
}

function gerarListaPresenca() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    const acampamentosOptions = appData.acampamentos.map(a => 
        `<option value="${a.id}">${a.nome}</option>`
    ).join('');
    
    modalBody.innerHTML = `
        <h2>Gerar Lista de Presença</h2>
        
        <div class="form-group">
            <label for="tipoLista">Tipo de Lista:</label>
            <select id="tipoLista" onchange="updateListaOptions()">
                <option value="tribos">Por Tribos</option>
                <option value="setores">Por Setores</option>
                <option value="geral">Geral do Acampamento</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="acampamentoLista">Acampamento:</label>
            <select id="acampamentoLista" onchange="updateListaOptions()">
                <option value="">Selecione...</option>
                ${acampamentosOptions}
            </select>
        </div>
        
        <div id="opcoes-especificas"></div>
        
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="executarGeracaoLista()">Gerar Lista</button>
        </div>
    `;
    
    modal.classList.add('show');
}

function updateListaOptions() {
    const tipo = document.getElementById('tipoLista').value;
    const acampamentoId = document.getElementById('acampamentoLista').value;
    const container = document.getElementById('opcoes-especificas');
    
    if (!acampamentoId) {
        container.innerHTML = '';
        return;
    }
    
    if (tipo === 'tribos') {
        const tribos = appData.tribos.filter(t => t.acampamentoId === acampamentoId);
        const tribosOptions = tribos.map(t => 
            `<option value="${t.id}">${t.nome}</option>`
        ).join('');
        
        container.innerHTML = `
            <div class="form-group">
                <label for="triboEspecifica">Tribo Específica (opcional):</label>
                <select id="triboEspecifica">
                    <option value="">Todas as tribos</option>
                    ${tribosOptions}
                </select>
            </div>
        `;
    } else if (tipo === 'setores') {
        const setoresOptions = appData.setores.map(s => 
            `<option value="${s.id}">${s.nome}</option>`
        ).join('');
        
        container.innerHTML = `
            <div class="form-group">
                <label for="setorEspecifico">Setor Específico (opcional):</label>
                <select id="setorEspecifico">
                    <option value="">Todos os setores</option>
                    ${setoresOptions}
                </select>
            </div>
        `;
    } else {
        container.innerHTML = '';
    }
}

function executarGeracaoLista() {
    const tipo = document.getElementById('tipoLista').value;
    const acampamentoId = document.getElementById('acampamentoLista').value;
    
    if (!acampamentoId) {
        showToast('Selecione um acampamento', 'warning');
        return;
    }
    
    let conteudo = '';
    const acampamento = appData.acampamentos.find(a => a.id === acampamentoId);
    
    if (tipo === 'tribos') {
        const triboEspecifica = document.getElementById('triboEspecifica')?.value;
        const tribos = triboEspecifica ? 
            [appData.tribos.find(t => t.id === triboEspecifica)] :
            appData.tribos.filter(t => t.acampamentoId === acampamentoId);
        
        conteudo = `<h1>Lista de Presença - ${acampamento.nome}</h1>`;
        
        tribos.forEach(tribo => {
            const campistas = appData.campistas.filter(c => c.triboId === tribo.id);
            conteudo += `
                <h2>Tribo: ${tribo.nome}</h2>
                <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <thead>
                        <tr>
                            <th style="padding: 10px;">Nome</th>
                            <th style="padding: 10px;">Idade</th>
                            <th style="padding: 10px;">Presença</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${campistas.map(c => `
                            <tr>
                                <td style="padding: 10px;">${c.nome}</td>
                                <td style="padding: 10px;">${c.idade}</td>
                                <td style="padding: 10px; width: 100px;">☐</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        });
    } else if (tipo === 'setores') {
        const setorEspecifico = document.getElementById('setorEspecifico')?.value;
        const setores = setorEspecifico ? 
            [appData.setores.find(s => s.id === setorEspecifico)] :
            appData.setores;
        
        conteudo = `<h1>Lista de Presença - Equipe - ${acampamento.nome}</h1>`;
        
        setores.forEach(setor => {
            const equipe = appData.equipe.filter(e => e.setorId === setor.id);
            if (equipe.length > 0) {
                conteudo += `
                    <h2>Setor: ${setor.nome}</h2>
                    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                        <thead>
                            <tr>
                                <th style="padding: 10px;">Nome</th>
                                <th style="padding: 10px;">Função</th>
                                <th style="padding: 10px;">Presença</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${equipe.map(e => `
                                <tr>
                                    <td style="padding: 10px;">${e.nome}</td>
                                    <td style="padding: 10px;">${e.funcao}</td>
                                    <td style="padding: 10px; width: 100px;">☐</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        });
    } else {
        const campistas = appData.campistas.filter(c => c.acampamentoId === acampamentoId);
        conteudo = `
            <h1>Lista de Presença Geral - ${acampamento.nome}</h1>
            <table border="1" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="padding: 10px;">Nome</th>
                        <th style="padding: 10px;">Idade</th>
                        <th style="padding: 10px;">Tribo</th>
                        <th style="padding: 10px;">Presença</th>
                    </tr>
                </thead>
                <tbody>
                    ${campistas.map(c => `
                        <tr>
                            <td style="padding: 10px;">${c.nome}</td>
                            <td style="padding: 10px;">${c.idade}</td>
                            <td style="padding: 10px;">${getTriboNome(c.triboId)}</td>
                            <td style="padding: 10px; width: 100px;">☐</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    // Abrir em nova janela para impressão
    const novaJanela = window.open('', '_blank');
    novaJanela.document.write(`
        <html>
            <head>
                <title>Lista de Presença</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; text-align: center; }
                    h2 { color: #666; margin-top: 30px; }
                    table { page-break-inside: avoid; }
                    @media print {
                        body { margin: 0; }
                        h2 { page-break-before: always; }
                    }
                </style>
            </head>
            <body>
                ${conteudo}
            </body>
        </html>
    `);
    novaJanela.document.close();
    
    closeModal();
    showToast('Lista de presença gerada com sucesso!', 'success');
}

// ===== SISTEMA DE PERGUNTAS PERSONALIZADAS =====

function gerenciarPerguntasPersonalizadas() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <div class="perguntas-management">
            <div class="section-header">
                <h2>Gerenciar Perguntas Personalizadas</h2>
                <button class="btn btn-primary" onclick="adicionarPerguntaPersonalizada()">
                    <i class="fas fa-plus"></i> Nova Pergunta
                </button>
            </div>
            
            <div class="perguntas-categories">
                <div class="category-section">
                    <h3>Perguntas para Campistas</h3>
                    <div id="perguntas-campistas" class="perguntas-list">
                        ${renderPerguntasList('campista')}
                    </div>
                </div>
                
                <div class="category-section">
                    <h3>Perguntas para Equipe</h3>
                    <div id="perguntas-equipe" class="perguntas-list">
                        ${renderPerguntasList('equipe')}
                    </div>
                </div>
            </div>
            
            <div class="form-actions mt-4">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Fechar</button>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}

function renderPerguntasList(categoria) {
    const perguntas = appData.perguntasPersonalizadas.filter(p => p.categoria === categoria && p.ativa);
    
    if (perguntas.length === 0) {
        return '<p class="text-muted">Nenhuma pergunta cadastrada para esta categoria.</p>';
    }
    
    return perguntas.map(pergunta => `
        <div class="pergunta-item">
            <div class="pergunta-content">
                <div class="pergunta-header">
                    <strong>${pergunta.pergunta}</strong>
                    <span class="badge badge-${pergunta.obrigatoria ? 'danger' : 'secondary'}">
                        ${pergunta.obrigatoria ? 'Obrigatória' : 'Opcional'}
                    </span>
                </div>
                <div class="pergunta-details">
                    <small class="text-muted">Tipo: ${getTipoLabel(pergunta.tipo)}</small>
                    ${pergunta.opcoes ? `<br><small class="text-muted">Opções: ${pergunta.opcoes.join(', ')}</small>` : ''}
                </div>
            </div>
            <div class="pergunta-actions">
                <button class="btn btn-sm btn-primary" onclick="editarPerguntaPersonalizada('${pergunta.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="excluirPerguntaPersonalizada('${pergunta.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function getTipoLabel(tipo) {
    const tipos = {
        'texto': 'Texto',
        'textarea': 'Texto Longo',
        'select': 'Seleção',
        'radio': 'Múltipla Escolha',
        'checkbox': 'Caixas de Seleção',
        'date': 'Data',
        'number': 'Número',
        'email': 'E-mail',
        'tel': 'Telefone'
    };
    return tipos[tipo] || tipo;
}

function adicionarPerguntaPersonalizada() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = getPerguntaPersonalizadaForm();
    modal.classList.add('show');
}

function getPerguntaPersonalizadaForm(pergunta = null) {
    const isEdit = pergunta !== null;
    
    return `
        <h2>${isEdit ? 'Editar' : 'Nova'} Pergunta Personalizada</h2>
        <form onsubmit="salvarPerguntaPersonalizada(event, ${isEdit ? "'" + pergunta.id + "'" : 'null'}); return false;">
            <div class="form-group">
                <label for="pergunta">Pergunta *</label>
                <input type="text" id="pergunta" name="pergunta" required 
                       value="${isEdit ? pergunta.pergunta : ''}" 
                       placeholder="Digite a pergunta...">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="categoria">Categoria *</label>
                    <select id="categoria" name="categoria" required>
                        <option value="">Selecione...</option>
                        <option value="campista" ${isEdit && pergunta.categoria === 'campista' ? 'selected' : ''}>Campista</option>
                        <option value="equipe" ${isEdit && pergunta.categoria === 'equipe' ? 'selected' : ''}>Equipe</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="tipo">Tipo de Campo *</label>
                    <select id="tipo" name="tipo" required onchange="toggleOpcoes()">
                        <option value="">Selecione...</option>
                        <option value="texto" ${isEdit && pergunta.tipo === 'texto' ? 'selected' : ''}>Texto</option>
                        <option value="textarea" ${isEdit && pergunta.tipo === 'textarea' ? 'selected' : ''}>Texto Longo</option>
                        <option value="select" ${isEdit && pergunta.tipo === 'select' ? 'selected' : ''}>Seleção</option>
                        <option value="radio" ${isEdit && pergunta.tipo === 'radio' ? 'selected' : ''}>Múltipla Escolha</option>
                        <option value="checkbox" ${isEdit && pergunta.tipo === 'checkbox' ? 'selected' : ''}>Caixas de Seleção</option>
                        <option value="date" ${isEdit && pergunta.tipo === 'date' ? 'selected' : ''}>Data</option>
                        <option value="number" ${isEdit && pergunta.tipo === 'number' ? 'selected' : ''}>Número</option>
                        <option value="email" ${isEdit && pergunta.tipo === 'email' ? 'selected' : ''}>E-mail</option>
                        <option value="tel" ${isEdit && pergunta.tipo === 'tel' ? 'selected' : ''}>Telefone</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group" id="opcoes-group" style="display: ${isEdit && ['select', 'radio', 'checkbox'].includes(pergunta.tipo) ? 'block' : 'none'}">
                <label for="opcoes">Opções (uma por linha)</label>
                <textarea id="opcoes" name="opcoes" rows="4" 
                          placeholder="Opção 1\nOpção 2\nOpção 3">${isEdit && pergunta.opcoes ? pergunta.opcoes.join('\n') : ''}</textarea>
                <small class="text-muted">Necessário apenas para campos de seleção, múltipla escolha e caixas de seleção.</small>
            </div>
            
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="obrigatoria" name="obrigatoria" 
                           ${isEdit && pergunta.obrigatoria ? 'checked' : ''}>
                    Campo obrigatório
                </label>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="gerenciarPerguntasPersonalizadas()">Voltar</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar' : 'Salvar'}</button>
            </div>
        </form>
        
        <script>
            function toggleOpcoes() {
                const tipo = document.getElementById('tipo').value;
                const opcoesGroup = document.getElementById('opcoes-group');
                const needsOptions = ['select', 'radio', 'checkbox'].includes(tipo);
                opcoesGroup.style.display = needsOptions ? 'block' : 'none';
            }
        </script>
    `;
}

function salvarPerguntaPersonalizada(event, id = null) {
    event.preventDefault();
    event.stopPropagation();
    
    const formData = new FormData(event.target);
    const tipo = formData.get('tipo');
    const opcoesText = formData.get('opcoes');
    
    const pergunta = {
        id: id || generateId(),
        pergunta: formData.get('pergunta'),
        tipo: tipo,
        opcoes: ['select', 'radio', 'checkbox'].includes(tipo) && opcoesText ? 
                opcoesText.split('\n').filter(o => o.trim()) : null,
        obrigatoria: formData.get('obrigatoria') === 'on',
        categoria: formData.get('categoria'),
        ativa: true,
        criadaEm: id ? appData.perguntasPersonalizadas.find(p => p.id === id).criadaEm : new Date().toISOString()
    };
    
    if (id) {
        const index = appData.perguntasPersonalizadas.findIndex(p => p.id === id);
        appData.perguntasPersonalizadas[index] = pergunta;
        showToast('Pergunta atualizada com sucesso!', 'success');
    } else {
        appData.perguntasPersonalizadas.push(pergunta);
        showToast('Pergunta cadastrada com sucesso!', 'success');
    }
    
    saveData();
    gerenciarPerguntasPersonalizadas();
    return false;
}

function editarPerguntaPersonalizada(id) {
    const pergunta = appData.perguntasPersonalizadas.find(p => p.id === id);
    if (pergunta) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = getPerguntaPersonalizadaForm(pergunta);
        modal.classList.add('show');
    }
}

function excluirPerguntaPersonalizada(id) {
    if (confirm('Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.')) {
        const pergunta = appData.perguntasPersonalizadas.find(p => p.id === id);
        if (pergunta) {
            pergunta.ativa = false;
            saveData();
            gerenciarPerguntasPersonalizadas();
            showToast('Pergunta excluída com sucesso!', 'success');
        }
    }
}

function getPerguntasPersonalizadas(categoria) {
    return appData.perguntasPersonalizadas.filter(p => p.categoria === categoria && p.ativa);
}

function renderPerguntaPersonalizada(pergunta, valor = '') {
    const required = pergunta.obrigatoria ? 'required' : '';
    const fieldName = `pergunta_${pergunta.id}`;
    
    switch (pergunta.tipo) {
        case 'texto':
        case 'email':
        case 'tel':
        case 'number':
        case 'date':
            return `
                <div class="form-group">
                    <label for="${fieldName}">${pergunta.pergunta} ${pergunta.obrigatoria ? '*' : ''}</label>
                    <input type="${pergunta.tipo}" id="${fieldName}" name="${fieldName}" 
                           value="${valor}" ${required}>
                </div>
            `;
            
        case 'textarea':
            return `
                <div class="form-group">
                    <label for="${fieldName}">${pergunta.pergunta} ${pergunta.obrigatoria ? '*' : ''}</label>
                    <textarea id="${fieldName}" name="${fieldName}" rows="3" ${required}>${valor}</textarea>
                </div>
            `;
            
        case 'select':
            return `
                <div class="form-group">
                    <label for="${fieldName}">${pergunta.pergunta} ${pergunta.obrigatoria ? '*' : ''}</label>
                    <select id="${fieldName}" name="${fieldName}" ${required}>
                        <option value="">Selecione...</option>
                        ${pergunta.opcoes.map(opcao => 
                            `<option value="${opcao}" ${valor === opcao ? 'selected' : ''}>${opcao}</option>`
                        ).join('')}
                    </select>
                </div>
            `;
            
        case 'radio':
            return `
                <div class="form-group">
                    <label>${pergunta.pergunta} ${pergunta.obrigatoria ? '*' : ''}</label>
                    <div class="radio-group">
                        ${pergunta.opcoes.map(opcao => `
                            <label class="radio-label">
                                <input type="radio" name="${fieldName}" value="${opcao}" 
                                       ${valor === opcao ? 'checked' : ''} ${required}>
                                ${opcao}
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
            
        case 'checkbox':
            const valores = Array.isArray(valor) ? valor : (valor ? [valor] : []);
            return `
                <div class="form-group">
                    <label>${pergunta.pergunta} ${pergunta.obrigatoria ? '*' : ''}</label>
                    <div class="checkbox-group">
                        ${pergunta.opcoes.map(opcao => `
                            <label class="checkbox-label">
                                <input type="checkbox" name="${fieldName}[]" value="${opcao}" 
                                       ${valores.includes(opcao) ? 'checked' : ''}>
                                ${opcao}
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
            
        default:
            return '';
    }
}

// === INICIALIZAÇÃO FINAL ===
// Garantir que o sistema seja inicializado quando a página carregar
// Funções de integração com Supabase
function updateCloudButtons() {
    const isConnected = checkSupabaseConnection();
    const configBtn = document.getElementById('configSupabaseBtn');
    const syncBtn = document.getElementById('syncBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    
    if (isConnected) {
        configBtn.innerHTML = '<i class="fas fa-cloud"></i> Conectado';
        configBtn.style.background = 'linear-gradient(135deg, #00d2d3 0%, #54a0ff 100%)';
        syncBtn.style.display = 'inline-flex';
        uploadBtn.style.display = 'inline-flex';
    } else {
        configBtn.innerHTML = '<i class="fas fa-cog"></i> Configurar Nuvem';
        configBtn.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
        syncBtn.style.display = 'none';
        uploadBtn.style.display = 'none';
    }
}

function configSupabase() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <h2><i class="fas fa-cloud"></i> Configurar Supabase</h2>
        <form onsubmit="saveSupabaseConfig(event)">
            <div class="form-group">
                <label for="supabaseUrl">URL do Projeto Supabase:</label>
                <input type="url" id="supabaseUrl" placeholder="https://seu-projeto.supabase.co" required>
                <small>Encontre no painel do Supabase > Settings > API</small>
            </div>
            <div class="form-group">
                <label for="supabaseKey">Chave Anônima (anon key):</label>
                <input type="text" id="supabaseKey" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." required>
                <small>Chave pública segura para acesso anônimo</small>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Salvar Configuração
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
        </form>
        <div class="config-help">
            <h3><i class="fas fa-info-circle"></i> Como configurar:</h3>
            <ol>
                <li>Acesse <a href="https://supabase.com" target="_blank">supabase.com</a></li>
                <li>Crie uma conta e um novo projeto</li>
                <li>Vá em Settings > API</li>
                <li>Copie a URL e a chave anônima</li>
                <li>Cole aqui e clique em Salvar</li>
            </ol>
        </div>
    `;
    
    modal.classList.add('show');
}

function saveSupabaseConfig(event) {
    console.log('saveSupabaseConfig chamada');
    event.preventDefault();
    
    try {
        const url = document.getElementById('supabaseUrl').value.trim();
        const key = document.getElementById('supabaseKey').value.trim();
        
        console.log('URL:', url);
        console.log('Key:', key ? 'Preenchida' : 'Vazia');
        
        if (!url || !key) {
            showToast('Por favor, preencha todos os campos', 'error');
            return;
        }
        
        console.log('Chamando configureSupabase...');
        if (configureSupabase(url, key)) {
            console.log('Configuração bem-sucedida, salvando...');
            // Salvar configuração localmente
            localStorage.setItem('supabaseConfig', JSON.stringify({ url, key }));
            updateCloudButtons();
            closeModal();
            showToast('Configuração salva com sucesso!', 'success');
        } else {
            console.log('Falha na configuração do Supabase');
            showToast('Falha ao configurar Supabase. Verifique os dados.', 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar configuração:', error);
        showToast('Erro ao salvar configuração. Verifique os dados e tente novamente.', 'error');
    }
}

function syncWithCloud() {
    if (!checkSupabaseConnection()) {
        showToast('Configure o Supabase primeiro', 'error');
        return;
    }
    
    SupabaseSync.syncAllData();
}

function uploadToCloud() {
    if (!checkSupabaseConnection()) {
        showToast('Configure o Supabase primeiro', 'error');
        return;
    }
    
    SupabaseSync.uploadLocalData();
}

// Carregar configuração salva do Supabase
function loadSupabaseConfig() {
    const savedConfig = localStorage.getItem('supabaseConfig');
    if (savedConfig) {
        try {
            const { url, key } = JSON.parse(savedConfig);
            configureSupabase(url, key);
        } catch (error) {
            console.error('Erro ao carregar configuração do Supabase:', error);
        }
    }
}

// Flag para controlar recursão
let isSyncing = false;

// Modificar função saveData para sincronizar com nuvem
const originalSaveData = saveData;
function saveData(skipSync = false) {
    originalSaveData();
    
    // Evitar recursão infinita
    if (skipSync || isSyncing) {
        return;
    }
    
    // Sincronizar automaticamente se conectado
    if (checkSupabaseConnection()) {
        // Debounce para evitar muitas chamadas
        clearTimeout(window.syncTimeout);
        window.syncTimeout = setTimeout(() => {
            isSyncing = true;
            SupabaseSync.uploadLocalData()
                .catch(console.error)
                .finally(() => {
                    isSyncing = false;
                });
        }, 2000);
    }
}

// Função para atualizar status de conexão
function updateConnectionStatus(connected = true) {
    const statusElement = document.getElementById('connection-status');
    const iconElement = document.getElementById('status-icon');
    const textElement = document.getElementById('status-text');
    
    if (statusElement && iconElement && textElement) {
        if (connected) {
            statusElement.classList.remove('disconnected');
            textElement.textContent = 'Conectado';
        } else {
            statusElement.classList.add('disconnected');
            textElement.textContent = 'Desconectado';
        }
    }
}

// Função de logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        // Limpar dados de sessão se necessário
        localStorage.removeItem('supabase_session');
        
        // Fazer logout do Supabase se estiver configurado
        if (window.supabase) {
            window.supabase.auth.signOut();
        }
        
        // Recarregar a página para mostrar tela de login
        window.location.reload();
    }
}

// Verificar conexão periodicamente
setInterval(() => {
    if (window.supabase) {
        checkSupabaseConnection().then(connected => {
            updateConnectionStatus(connected);
        }).catch(() => {
            updateConnectionStatus(false);
        });
    } else {
        updateConnectionStatus(false);
    }
}, 30000); // Verificar a cada 30 segundos

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initializeApp();
        loadSupabaseConfig();
        updateConnectionStatus(true); // Status inicial
    });
} else {
    initializeApp();
    loadSupabaseConfig();
    updateConnectionStatus(true); // Status inicial
}