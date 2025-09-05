// Configuração do Supabase
let SUPABASE_URL = 'https://ymislcrrkcroahikwcm.supabase.co';
let SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltaXNsY3Jya2Nyb2VhaGlrd2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwODMwMzMsImV4cCI6MjA3MjY1OTAzM30.3usCMB-JMaHNgzhNW7Tolp2oOz8BzqV5yDLA69BFV_Q';

// Inicializar cliente Supabase
let supabase;

// Função para inicializar Supabase
function initSupabase() {
    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase inicializado com sucesso');
        return true;
    } else {
        console.error('Biblioteca Supabase não carregada');
        return false;
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
            
            // Salvar localmente como backup
            saveData();
            
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

// Carregar configuração salva ao inicializar
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        loadSupabaseConfig();
    });
}