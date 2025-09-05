-- SCHEMA COMPLETO DO SUPABASE PARA EVENTMANAGER
-- Execute este script no SQL Editor do Supabase

-- Extensão pgcrypto já está habilitada por padrão no Supabase
-- gen_random_uuid() é uma função nativa do PostgreSQL 13+

-- CRIAÇÃO DAS TABELAS PRINCIPAIS

-- Tabela de Modalidades (deve ser criada primeiro)
CREATE TABLE IF NOT EXISTS modalidades (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    idade_minima INTEGER,
    idade_maxima INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Acampamentos
CREATE TABLE IF NOT EXISTS acampamentos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome VARCHAR(255) NOT NULL,
    modalidade_id TEXT NOT NULL REFERENCES modalidades(id),
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    local VARCHAR(255),
    vagas INTEGER DEFAULT 0,
    valor DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'planejamento',
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Setores
CREATE TABLE IF NOT EXISTS setores (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#007bff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Tribos
CREATE TABLE IF NOT EXISTS tribos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome VARCHAR(100) NOT NULL,
    acampamento_id TEXT NOT NULL REFERENCES acampamentos(id) ON DELETE CASCADE,
    lider VARCHAR(255),
    grito_guerra TEXT,
    cor VARCHAR(7) DEFAULT '#007bff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Campistas
CREATE TABLE IF NOT EXISTS campistas (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    data_nascimento DATE,
    endereco TEXT,
    responsavel VARCHAR(255),
    telefone_responsavel VARCHAR(20),
    modalidade_id TEXT REFERENCES modalidades(id),
    tribo_id TEXT REFERENCES tribos(id),
    acampamento_id TEXT REFERENCES acampamentos(id) ON DELETE CASCADE,
    observacoes TEXT,
    status VARCHAR(50) DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Equipe
CREATE TABLE IF NOT EXISTS equipe (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    funcao VARCHAR(255),
    setor_id TEXT REFERENCES setores(id),
    acampamento_id TEXT REFERENCES acampamentos(id) ON DELETE CASCADE,
    observacoes TEXT,
    status VARCHAR(50) DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    campista_id TEXT REFERENCES campistas(id) ON DELETE CASCADE,
    acampamento_id TEXT REFERENCES acampamentos(id) ON DELETE CASCADE,
    valor DECIMAL(10,2) NOT NULL,
    data_pagamento DATE NOT NULL,
    forma_pagamento VARCHAR(100),
    observacoes TEXT,
    status VARCHAR(50) DEFAULT 'confirmado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Despesas
CREATE TABLE IF NOT EXISTS despesas (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    acampamento_id TEXT REFERENCES acampamentos(id) ON DELETE CASCADE,
    descricao VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    valor DECIMAL(10,2) NOT NULL,
    data_despesa DATE NOT NULL,
    responsavel VARCHAR(255),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Atividades
CREATE TABLE IF NOT EXISTS atividades (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    acampamento_id TEXT REFERENCES acampamentos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_atividade DATE,
    hora_inicio TIME,
    hora_fim TIME,
    local VARCHAR(255),
    responsavel VARCHAR(255),
    modalidades TEXT[], -- Array de modalidades participantes
    status VARCHAR(50) DEFAULT 'planejada',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Materiais
CREATE TABLE IF NOT EXISTS materiais (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    acampamento_id TEXT REFERENCES acampamentos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    quantidade INTEGER DEFAULT 0,
    unidade VARCHAR(50),
    valor_unitario DECIMAL(10,2),
    fornecedor VARCHAR(255),
    observacoes TEXT,
    status VARCHAR(50) DEFAULT 'disponivel',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INSERÇÃO DE DADOS PADRÃO

-- Modalidades padrão
INSERT INTO modalidades (nome, descricao, idade_minima, idade_maxima) 
SELECT nome, descricao, idade_minima, idade_maxima FROM (
    VALUES 
    ('Lobinho', 'Crianças de 6 a 10 anos', 6, 10),
    ('Escoteiro', 'Jovens de 11 a 14 anos', 11, 14),
    ('Sênior', 'Adolescentes de 15 a 17 anos', 15, 17),
    ('Pioneiro', 'Jovens de 18 a 21 anos', 18, 21),
    ('Adulto', 'Adultos acima de 21 anos', 21, 100)
) AS v(nome, descricao, idade_minima, idade_maxima)
WHERE NOT EXISTS (SELECT 1 FROM modalidades WHERE modalidades.nome = v.nome);

-- Acampamentos de exemplo
INSERT INTO acampamentos (nome, modalidade_id, data_inicio, data_fim, local, vagas, valor, status, descricao) 
SELECT * FROM (
    VALUES 
        ('Acampamento de Jovens 2024', (SELECT id FROM modalidades WHERE nome = 'Pioneiro' LIMIT 1), DATE '2024-07-15', DATE '2024-07-21', 'Sítio São Francisco', 50, 250.00, 'inscricoes-abertas', 'Acampamento voltado para jovens de 18 a 21 anos'),
        ('Acampamento de Famílias 2024', (SELECT id FROM modalidades WHERE nome = 'Adulto' LIMIT 1), DATE '2024-08-10', DATE '2024-08-15', 'Chácara Nossa Senhora', 30, 180.00, 'planejamento', 'Acampamento para toda a família')
) AS t(nome, modalidade_id, data_inicio, data_fim, local, vagas, valor, status, descricao)
WHERE NOT EXISTS (SELECT 1 FROM acampamentos WHERE nome = t.nome);

-- Setores padrão
INSERT INTO setores (nome, descricao, cor) 
SELECT * FROM (
    VALUES 
    ('Administração', 'Setor administrativo e financeiro', '#007bff'),
    ('Programa', 'Atividades e programação', '#28a745'),
    ('Intendência', 'Alimentação e materiais', '#ffc107'),
    ('Saúde', 'Primeiros socorros e saúde', '#dc3545'),
    ('Segurança', 'Segurança e proteção', '#6c757d')
) AS v(nome, descricao, cor)
WHERE NOT EXISTS (SELECT 1 FROM setores WHERE setores.nome = v.nome);

-- HABILITAÇÃO DO ROW LEVEL SECURITY (RLS)

ALTER TABLE acampamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE modalidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE setores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribos ENABLE ROW LEVEL SECURITY;
ALTER TABLE campistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiais ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso público (para desenvolvimento)
-- IMPORTANTE: Em produção, substitua por políticas mais restritivas

-- Acampamentos
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'acampamentos' AND policyname = 'Permitir acesso público') THEN
        CREATE POLICY "Permitir acesso público" ON acampamentos FOR ALL USING (true);
    END IF;
END $$;

-- Modalidades
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'modalidades' AND policyname = 'Permitir acesso público') THEN
        CREATE POLICY "Permitir acesso público" ON modalidades FOR ALL USING (true);
    END IF;
END $$;

-- Setores
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'setores' AND policyname = 'Permitir acesso público') THEN
        CREATE POLICY "Permitir acesso público" ON setores FOR ALL USING (true);
    END IF;
END $$;

-- Tribos
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tribos' AND policyname = 'Permitir acesso público') THEN
        CREATE POLICY "Permitir acesso público" ON tribos FOR ALL USING (true);
    END IF;
END $$;

-- Campistas
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campistas' AND policyname = 'Permitir acesso público') THEN
        CREATE POLICY "Permitir acesso público" ON campistas FOR ALL USING (true);
    END IF;
END $$;

-- Equipe
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'equipe' AND policyname = 'Permitir acesso público') THEN
        CREATE POLICY "Permitir acesso público" ON equipe FOR ALL USING (true);
    END IF;
END $$;

-- Pagamentos
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pagamentos' AND policyname = 'Permitir acesso público') THEN
        CREATE POLICY "Permitir acesso público" ON pagamentos FOR ALL USING (true);
    END IF;
END $$;

-- Despesas
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'despesas' AND policyname = 'Permitir acesso público') THEN
        CREATE POLICY "Permitir acesso público" ON despesas FOR ALL USING (true);
    END IF;
END $$;

-- Atividades
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'atividades' AND policyname = 'Permitir acesso público') THEN
        CREATE POLICY "Permitir acesso público" ON atividades FOR ALL USING (true);
    END IF;
END $$;

-- Materiais
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'materiais' AND policyname = 'Permitir acesso público') THEN
        CREATE POLICY "Permitir acesso público" ON materiais FOR ALL USING (true);
    END IF;
END $$;

-- FUNÇÃO PARA ATUALIZAR updated_at

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- TRIGGERS PARA ATUALIZAR updated_at

-- Acampamentos
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_acampamentos_updated_at') THEN
        CREATE TRIGGER update_acampamentos_updated_at
            BEFORE UPDATE ON acampamentos
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Modalidades
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_modalidades_updated_at') THEN
        CREATE TRIGGER update_modalidades_updated_at
            BEFORE UPDATE ON modalidades
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Setores
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_setores_updated_at') THEN
        CREATE TRIGGER update_setores_updated_at
            BEFORE UPDATE ON setores
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Tribos
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tribos_updated_at') THEN
        CREATE TRIGGER update_tribos_updated_at
            BEFORE UPDATE ON tribos
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Campistas
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_campistas_updated_at') THEN
        CREATE TRIGGER update_campistas_updated_at
            BEFORE UPDATE ON campistas
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Equipe
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_equipe_updated_at') THEN
        CREATE TRIGGER update_equipe_updated_at
            BEFORE UPDATE ON equipe
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Pagamentos
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pagamentos_updated_at') THEN
        CREATE TRIGGER update_pagamentos_updated_at
            BEFORE UPDATE ON pagamentos
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Despesas
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_despesas_updated_at') THEN
        CREATE TRIGGER update_despesas_updated_at
            BEFORE UPDATE ON despesas
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Atividades
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_atividades_updated_at') THEN
        CREATE TRIGGER update_atividades_updated_at
            BEFORE UPDATE ON atividades
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Materiais
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_materiais_updated_at') THEN
        CREATE TRIGGER update_materiais_updated_at
            BEFORE UPDATE ON materiais
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Tribos de exemplo (vinculadas ao primeiro acampamento)
INSERT INTO tribos (nome, acampamento_id, lider, grito_guerra, cor) 
SELECT * FROM (
    VALUES 
        ('Tribo Águia', (SELECT id FROM acampamentos LIMIT 1), 'João Silva', 'Águia voa alto!', '#ff6b6b'),
        ('Tribo Leão', (SELECT id FROM acampamentos LIMIT 1), 'Maria Santos', 'Força do leão!', '#4ecdc4')
) AS t(nome, acampamento_id, lider, grito_guerra, cor)
WHERE EXISTS (SELECT 1 FROM acampamentos) 
AND NOT EXISTS (SELECT 1 FROM tribos WHERE nome = t.nome);

-- Índices para relacionamentos
CREATE INDEX IF NOT EXISTS idx_tribos_acampamento_id ON tribos(acampamento_id);
CREATE INDEX IF NOT EXISTS idx_campistas_modalidade_id ON campistas(modalidade_id);
CREATE INDEX IF NOT EXISTS idx_campistas_tribo_id ON campistas(tribo_id);
CREATE INDEX IF NOT EXISTS idx_campistas_acampamento_id ON campistas(acampamento_id);
CREATE INDEX IF NOT EXISTS idx_equipe_setor_id ON equipe(setor_id);
CREATE INDEX IF NOT EXISTS idx_equipe_acampamento_id ON equipe(acampamento_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_campista_id ON pagamentos(campista_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_acampamento_id ON pagamentos(acampamento_id);
CREATE INDEX IF NOT EXISTS idx_despesas_acampamento_id ON despesas(acampamento_id);
CREATE INDEX IF NOT EXISTS idx_atividades_acampamento_id ON atividades(acampamento_id);
CREATE INDEX IF NOT EXISTS idx_materiais_acampamento_id ON materiais(acampamento_id);

-- Índices para consultas comuns
CREATE INDEX IF NOT EXISTS idx_campistas_status ON campistas(status);
CREATE INDEX IF NOT EXISTS idx_equipe_status ON equipe(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_atividades_status ON atividades(status);
CREATE INDEX IF NOT EXISTS idx_materiais_status ON materiais(status);

-- Índices para datas
CREATE INDEX IF NOT EXISTS idx_acampamentos_data_inicio ON acampamentos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data_pagamento ON pagamentos(data_pagamento);
CREATE INDEX IF NOT EXISTS idx_despesas_data_despesa ON despesas(data_despesa);
CREATE INDEX IF NOT EXISTS idx_atividades_data_atividade ON atividades(data_atividade);

COMMENT ON TABLE acampamentos IS 'Tabela principal de acampamentos/eventos';
COMMENT ON TABLE modalidades IS 'Categorias de idade dos participantes';
COMMENT ON TABLE setores IS 'Setores organizacionais do acampamento';
COMMENT ON TABLE tribos IS 'Grupos de campistas dentro de cada setor';
COMMENT ON TABLE campistas IS 'Participantes inscritos nos acampamentos';
COMMENT ON TABLE equipe IS 'Membros da equipe organizadora';
COMMENT ON TABLE pagamentos IS 'Controle financeiro de pagamentos';
COMMENT ON TABLE despesas IS 'Controle de gastos do acampamento';
COMMENT ON TABLE atividades IS 'Programação de atividades';
COMMENT ON TABLE materiais IS 'Controle de materiais e equipamentos';

-- Verificar se todas as tabelas foram criadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'acampamentos', 'modalidades', 'setores', 'tribos', 
    'campistas', 'equipe', 'pagamentos', 'despesas', 
    'atividades', 'materiais'
)
ORDER BY tablename;

-- Mensagem de sucesso
SELECT 'Schema do EventManager criado com sucesso! ✅' AS status;