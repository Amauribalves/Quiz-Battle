-- =====================================================
-- SISTEMA DE DESAFIOS X - ESTRUTURA DO BANCO DE DADOS
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA PRINCIPAL DE DESAFIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('daily', 'weekly', 'special')),
    requirement_type VARCHAR(50) NOT NULL,
    requirement_value INTEGER NOT NULL,
    requirement_category VARCHAR(100),
    reward_type VARCHAR(20) NOT NULL DEFAULT 'money',
    reward_value DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA DE PROGRESSO DOS USUÁRIOS NOS DESAFIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_challenge_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    is_claimed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir que um usuário só pode ter um progresso por desafio
    UNIQUE(user_id, challenge_id)
);

-- =====================================================
-- TABELA DE HISTÓRICO DE RECOMPENSAS RECLAMADAS
-- =====================================================
CREATE TABLE IF NOT EXISTS challenge_rewards_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    reward_type VARCHAR(20) NOT NULL,
    reward_value DECIMAL(10,2) NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Referência ao progresso do usuário
    user_challenge_progress_id UUID REFERENCES user_challenge_progress(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE ESTATÍSTICAS DE DESAFIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS challenge_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_challenges_completed INTEGER DEFAULT 0,
    total_rewards_claimed INTEGER DEFAULT 0,
    total_reward_value DECIMAL(10,2) DEFAULT 0,
    current_daily_streak INTEGER DEFAULT 0,
    current_weekly_streak INTEGER DEFAULT 0,
    best_daily_streak INTEGER DEFAULT 0,
    best_weekly_streak INTEGER DEFAULT 0,
    last_challenge_completed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =====================================================
-- TABELA DE LOGS DE ATIVIDADES DOS DESAFIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS challenge_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'started', 'progress_updated', 'completed', 'reward_claimed'
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para desafios
CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(type);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_challenges_expires_at ON challenges(expires_at);

-- Índices para progresso do usuário
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_user_id ON user_challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_challenge_id ON user_challenge_progress(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_completed ON user_challenge_progress(is_completed);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_claimed ON user_challenge_progress(is_claimed);

-- Índices para histórico de recompensas
CREATE INDEX IF NOT EXISTS idx_challenge_rewards_history_user_id ON challenge_rewards_history(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_rewards_history_challenge_id ON challenge_rewards_history(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_rewards_history_claimed_at ON challenge_rewards_history(claimed_at);

-- Índices para estatísticas
CREATE INDEX IF NOT EXISTS idx_challenge_stats_user_id ON challenge_stats(user_id);

-- Índices para logs de atividade
CREATE INDEX IF NOT EXISTS idx_challenge_activity_logs_user_id ON challenge_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_activity_logs_created_at ON challenge_activity_logs(created_at);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar timestamp de atualização
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar timestamps
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_challenge_progress_updated_at BEFORE UPDATE ON user_challenge_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenge_stats_updated_at BEFORE UPDATE ON challenge_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar estatísticas automaticamente para novos usuários
CREATE OR REPLACE FUNCTION create_user_challenge_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO challenge_stats (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para criar estatísticas quando um usuário é criado
CREATE TRIGGER create_user_challenge_stats_trigger
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_user_challenge_stats();

-- =====================================================
-- DADOS INICIAIS - DESAFIOS PADRÃO
-- =====================================================

-- Inserir desafios diários padrão
INSERT INTO challenges (title, description, type, requirement_type, requirement_value, requirement_category, reward_type, reward_value, expires_at) VALUES
('Vencedor do Dia', 'Vence 5 partidas hoje', 'daily', 'wins', 5, NULL, 'money', 1.00, NOW() + INTERVAL '1 day'),
('Sequência Vitoriosa', 'Mantenha uma sequência de 3 vitórias', 'daily', 'streak', 3, NULL, 'money', 2.00, NOW() + INTERVAL '1 day'),
('Mestre da Matemática', 'Acerte 20 questões de matemática', 'daily', 'category_wins', 20, 'math', 'money', 3.00, NOW() + INTERVAL '1 day'),
('Culto e Sabido', 'Acerte 15 questões de cultura geral', 'daily', 'category_wins', 15, 'culture', 'money', 2.50, NOW() + INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Inserir missões semanais padrão
INSERT INTO challenges (title, description, type, requirement_type, requirement_value, requirement_category, reward_type, reward_value, expires_at) VALUES
('Guerreiro Semanal', 'Vence 25 partidas esta semana', 'weekly', 'wins', 25, NULL, 'money', 10.00, NOW() + INTERVAL '7 days'),
('Especialista em Cultura', 'Acerte 50 questões de cultura geral', 'weekly', 'category_wins', 50, 'culture', 'money', 15.00, NOW() + INTERVAL '7 days'),
('Matemático Profissional', 'Acerte 60 questões de matemática', 'weekly', 'category_wins', 60, 'math', 'money', 20.00, NOW() + INTERVAL '7 days'),
('Mestre da Sequência', 'Mantenha uma sequência de 10 vitórias', 'weekly', 'streak', 10, NULL, 'money', 25.00, NOW() + INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- =====================================================
-- VIEWS ÚTEIS PARA CONSULTAS
-- =====================================================

-- View para desafios ativos com contagem de usuários
CREATE OR REPLACE VIEW active_challenges_stats AS
SELECT 
    c.*,
    COUNT(ucp.user_id) as total_participants,
    COUNT(CASE WHEN ucp.is_completed = true THEN 1 END) as total_completed,
    COUNT(CASE WHEN ucp.is_claimed = true THEN 1 END) as total_claimed
FROM challenges c
LEFT JOIN user_challenge_progress ucp ON c.id = ucp.challenge_id
WHERE c.is_active = true AND c.expires_at > NOW()
GROUP BY c.id;

-- View para progresso geral dos usuários
CREATE OR REPLACE VIEW user_challenge_overview AS
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    COUNT(ucp.challenge_id) as total_challenges,
    COUNT(CASE WHEN ucp.is_completed = true THEN 1 END) as completed_challenges,
    COUNT(CASE WHEN ucp.is_claimed = true THEN 1 END) as claimed_rewards,
    COALESCE(SUM(cr.reward_value), 0) as total_rewards_value
FROM users u
LEFT JOIN user_challenge_progress ucp ON u.id = ucp.user_id
LEFT JOIN challenge_rewards_history cr ON u.id = cr.user_id
GROUP BY u.id, u.username, u.email;

-- =====================================================
-- POLÍTICAS DE SEGURANÇA (RLS - Row Level Security)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_rewards_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_activity_logs ENABLE ROW LEVEL SECURITY;

-- Política para desafios (todos podem ler desafios ativos)
CREATE POLICY "Desafios visíveis para todos" ON challenges
    FOR SELECT USING (is_active = true);

-- Política para progresso do usuário (usuário só vê seu próprio progresso)
CREATE POLICY "Usuário vê apenas seu progresso" ON user_challenge_progress
    FOR ALL USING (auth.uid() = user_id);

-- Política para histórico de recompensas (usuário só vê suas recompensas)
CREATE POLICY "Usuário vê apenas suas recompensas" ON challenge_rewards_history
    FOR ALL USING (auth.uid() = user_id);

-- Política para estatísticas (usuário só vê suas estatísticas)
CREATE POLICY "Usuário vê apenas suas estatísticas" ON challenge_stats
    FOR ALL USING (auth.uid() = user_id);

-- Política para logs de atividade (usuário só vê seus logs)
CREATE POLICY "Usuário vê apenas seus logs" ON challenge_activity_logs
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- COMENTÁRIOS DAS TABELAS
-- =====================================================

COMMENT ON TABLE challenges IS 'Tabela principal de desafios e missões disponíveis';
COMMENT ON TABLE user_challenge_progress IS 'Progresso de cada usuário em cada desafio';
COMMENT ON TABLE challenge_rewards_history IS 'Histórico de recompensas reclamadas pelos usuários';
COMMENT ON TABLE challenge_stats IS 'Estatísticas gerais de desafios de cada usuário';
COMMENT ON TABLE challenge_activity_logs IS 'Logs de todas as atividades relacionadas aos desafios';

COMMENT ON COLUMN challenges.requirement_type IS 'Tipo de requisito: wins, streak, category_wins, games_played, correct_answers';
COMMENT ON COLUMN challenges.reward_type IS 'Tipo de recompensa: money, bonus, experience';
COMMENT ON COLUMN user_challenge_progress.progress IS 'Progresso atual do usuário (0 até requirement_value)';
COMMENT ON COLUMN challenge_stats.current_daily_streak IS 'Sequência atual de desafios diários completados';
COMMENT ON COLUMN challenge_stats.current_weekly_streak IS 'Sequência atual de missões semanais completadas';
