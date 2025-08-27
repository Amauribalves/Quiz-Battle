-- =====================================================
-- INTEGRAÇÃO COMPLETA DO SISTEMA QUIZ BATTLE
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ATUALIZAÇÃO DA TABELA GAMES (QUESTÕES)
-- =====================================================

-- Adicionar campos de relacionamento à tabela games
ALTER TABLE games ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
ALTER TABLE games ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE games ADD COLUMN IF NOT EXISTS difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5);
ALTER TABLE games ADD COLUMN IF NOT EXISTS times_used INTEGER DEFAULT 0;
ALTER TABLE games ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE games ADD COLUMN IF NOT EXISTS last_used TIMESTAMP WITH TIME ZONE;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);
CREATE INDEX IF NOT EXISTS idx_games_difficulty ON games(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_games_active ON games(is_active);

-- =====================================================
-- ATUALIZAÇÃO DA TABELA BETS
-- =====================================================

-- Adicionar campos de relacionamento à tabela bets
ALTER TABLE bets ADD COLUMN IF NOT EXISTS game_id INTEGER REFERENCES games(id);
ALTER TABLE bets ADD COLUMN IF NOT EXISTS bet_type VARCHAR(20) DEFAULT 'match' CHECK (bet_type IN ('match', 'question', 'challenge'));
ALTER TABLE bets ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled'));
ALTER TABLE bets ADD COLUMN IF NOT EXISTS odds DECIMAL(5,2) DEFAULT 1.00;
ALTER TABLE bets ADD COLUMN IF NOT EXISTS potential_winnings DECIMAL(10,2);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_match_id ON bets(match_id);
CREATE INDEX IF NOT EXISTS idx_bets_game_id ON bets(game_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);

-- =====================================================
-- ATUALIZAÇÃO DA TABELA WITHDRAWS
-- =====================================================

-- Adicionar campos de relacionamento à tabela withdraws
ALTER TABLE withdraws ADD COLUMN IF NOT EXISTS processed_by UUID REFERENCES users(id);
ALTER TABLE withdraws ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100);
ALTER TABLE withdraws ADD COLUMN IF NOT EXISTS fee_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE withdraws ADD COLUMN IF NOT EXISTS net_amount DECIMAL(10,2);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_withdraws_user_id ON withdraws(user_id);
CREATE INDEX IF NOT EXISTS idx_withdraws_status ON withdraws(status);
CREATE INDEX IF NOT EXISTS idx_withdraws_requested_at ON withdraws(requested_at);

-- =====================================================
-- NOVA TABELA: USER_QUESTION_STATS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_question_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    answered_correctly BOOLEAN NOT NULL,
    time_taken_seconds DECIMAL(5,2),
    category VARCHAR(100),
    difficulty_level INTEGER,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, question_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_question_stats_user_id ON user_question_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_question_stats_question_id ON user_question_stats(question_id);
CREATE INDEX IF NOT EXISTS idx_user_question_stats_category ON user_question_stats(category);

-- =====================================================
-- NOVA TABELA: GAME_SESSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('solo', 'multiplayer', 'practice')),
    category VARCHAR(100),
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT false
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_type ON game_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_game_sessions_started_at ON game_sessions(started_at);

-- =====================================================
-- NOVA TABELA: USER_CATEGORY_PERFORMANCE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_category_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    average_time_seconds DECIMAL(5,2) DEFAULT 0,
    last_played TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, category)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_category_performance_user_id ON user_category_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_user_category_performance_category ON user_category_performance(category);

-- =====================================================
-- NOVA TABELA: ACHIEVEMENTS_PROGRESS
-- =====================================================

CREATE TABLE IF NOT EXISTS achievements_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    current_progress INTEGER DEFAULT 0,
    required_progress INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, achievement_type)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_achievements_progress_user_id ON achievements_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_progress_type ON achievements_progress(achievement_type);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar estatísticas de questões
CREATE OR REPLACE FUNCTION update_question_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar estatísticas da questão
    UPDATE games 
    SET 
        times_used = times_used + 1,
        success_rate = (
            SELECT ROUND(
                (COUNT(CASE WHEN answered_correctly = true THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2
            )
            FROM user_question_stats 
            WHERE question_id = NEW.question_id
        ),
        last_used = NOW()
    WHERE id = NEW.question_id;
    
    -- Atualizar estatísticas de categoria do usuário
    INSERT INTO user_category_performance (user_id, category, questions_answered, correct_answers, total_score, last_played)
    VALUES (
        NEW.user_id, 
        NEW.category, 
        1, 
        CASE WHEN NEW.answered_correctly THEN 1 ELSE 0 END,
        CASE WHEN NEW.answered_correctly THEN 10 ELSE 0 END,
        NOW()
    )
    ON CONFLICT (user_id, category) 
    DO UPDATE SET
        questions_answered = user_category_performance.questions_answered + 1,
        correct_answers = user_category_performance.correct_answers + CASE WHEN NEW.answered_correctly THEN 1 ELSE 0 END,
        total_score = user_category_performance.total_score + CASE WHEN NEW.answered_correctly THEN 10 ELSE 0 END,
        best_score = GREATEST(user_category_performance.best_score, CASE WHEN NEW.answered_correctly THEN 10 ELSE 0 END),
        average_time_seconds = (user_category_performance.average_time_seconds * user_category_performance.questions_answered + COALESCE(NEW.time_taken_seconds, 0)) / (user_category_performance.questions_answered + 1),
        last_played = NOW(),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estatísticas quando uma questão é respondida
CREATE TRIGGER trigger_update_question_stats
    AFTER INSERT ON user_question_stats
    FOR EACH ROW EXECUTE FUNCTION update_question_stats();

-- Função para calcular ganhos de apostas
CREATE OR REPLACE FUNCTION calculate_bet_winnings()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('won', 'lost') AND OLD.status = 'pending' THEN
        IF NEW.status = 'won' THEN
            NEW.potential_winnings = NEW.amount * NEW.odds;
        ELSE
            NEW.potential_winnings = 0;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular ganhos de apostas
CREATE TRIGGER trigger_calculate_bet_winnings
    BEFORE UPDATE ON bets
    FOR EACH ROW EXECUTE FUNCTION calculate_bet_winnings();

-- Função para atualizar saldo do usuário após aposta
CREATE OR REPLACE FUNCTION update_user_balance_after_bet()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('won', 'lost') AND OLD.status = 'pending' THEN
        IF NEW.status = 'won' THEN
            -- Adicionar ganhos ao saldo
            UPDATE users 
            SET balance = balance + NEW.potential_winnings
            WHERE id = NEW.user_id;
        END IF;
        -- O valor da aposta já foi deduzido quando foi criada
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar saldo após aposta
CREATE TRIGGER trigger_update_user_balance_after_bet
    AFTER UPDATE ON bets
    FOR EACH ROW EXECUTE FUNCTION update_user_balance_after_bet();

-- Função para calcular taxa de saque
CREATE OR REPLACE FUNCTION calculate_withdrawal_fee()
RETURNS TRIGGER AS $$
BEGIN
    -- Taxa de 2% para saques
    NEW.fee_amount = NEW.amount * 0.02;
    NEW.net_amount = NEW.amount - NEW.fee_amount;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular taxa de saque
CREATE TRIGGER trigger_calculate_withdrawal_fee
    BEFORE INSERT ON withdraws
    FOR EACH ROW EXECUTE FUNCTION calculate_withdrawal_fee();

-- =====================================================
-- VIEWS PARA ANALYTICS
-- =====================================================

-- View para estatísticas gerais dos usuários
CREATE OR REPLACE VIEW user_comprehensive_stats AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.balance,
    u.wins,
    u.losses,
    COUNT(DISTINCT gs.id) as total_sessions,
    COUNT(DISTINCT uqs.id) as total_questions_answered,
    COUNT(DISTINCT CASE WHEN uqs.answered_correctly THEN uqs.id END) as correct_answers,
    ROUND(
        (COUNT(CASE WHEN uqs.answered_correctly THEN uqs.id END)::DECIMAL / 
         GREATEST(COUNT(uqs.id), 1)::DECIMAL) * 100, 2
    ) as accuracy_percentage,
    COALESCE(SUM(b.amount), 0) as total_bets,
    COALESCE(SUM(CASE WHEN b.status = 'won' THEN b.potential_winnings ELSE 0 END), 0) as total_winnings,
    COALESCE(SUM(w.amount), 0) as total_withdrawals,
    u.created_at
FROM users u
LEFT JOIN game_sessions gs ON u.id = gs.user_id
LEFT JOIN user_question_stats uqs ON u.id = uqs.user_id
LEFT JOIN bets b ON u.id = b.user_id
LEFT JOIN withdraws w ON u.id = w.user_id
GROUP BY u.id, u.username, u.email, u.balance, u.wins, u.losses, u.created_at;

-- View para performance por categoria
CREATE OR REPLACE VIEW category_performance_overview AS
SELECT 
    ucp.category,
    COUNT(DISTINCT ucp.user_id) as total_players,
    AVG(ucp.correct_answers::DECIMAL / GREATEST(ucp.questions_answered, 1)) * 100 as avg_accuracy,
    AVG(ucp.average_time_seconds) as avg_time_per_question,
    SUM(ucp.questions_answered) as total_questions_answered,
    SUM(ucp.correct_answers) as total_correct_answers
FROM user_category_performance ucp
GROUP BY ucp.category
ORDER BY total_players DESC;

-- View para questões mais populares
CREATE OR REPLACE VIEW popular_questions AS
SELECT 
    g.id,
    g.question,
    g.category,
    g.difficulty_level,
    g.times_used,
    g.success_rate,
    COUNT(uqs.id) as total_attempts,
    COUNT(CASE WHEN uqs.answered_correctly THEN 1 END) as correct_attempts,
    ROUND(
        (COUNT(CASE WHEN uqs.answered_correctly THEN 1 END)::DECIMAL / 
         GREATEST(COUNT(uqs.id), 1)::DECIMAL) * 100, 2
    ) as user_accuracy
FROM games g
LEFT JOIN user_question_stats uqs ON g.id = uqs.question_id
WHERE g.is_active = true
GROUP BY g.id, g.question, g.category, g.difficulty_level, g.times_used, g.success_rate
ORDER BY g.times_used DESC, g.success_rate DESC;

-- View para histórico de apostas detalhado
CREATE OR REPLACE VIEW detailed_betting_history AS
SELECT 
    b.id,
    b.user_id,
    u.username,
    b.amount,
    b.bet_type,
    b.status,
    b.odds,
    b.potential_winnings,
    b.created_at,
    CASE 
        WHEN b.bet_type = 'match' THEN m.category
        WHEN b.bet_type = 'question' THEN g.category
        ELSE NULL
    END as category,
    CASE 
        WHEN b.bet_type = 'match' THEN CONCAT(u1.username, ' vs ', u2.username)
        WHEN b.bet_type = 'question' THEN g.question
        ELSE NULL
    END as bet_target
FROM bets b
JOIN users u ON b.user_id = u.id
LEFT JOIN matches m ON b.match_id = m.id
LEFT JOIN games g ON b.game_id = g.id
LEFT JOIN users u1 ON m.player1_id = u1.id
LEFT JOIN users u2 ON m.player2_id = u2.id
ORDER BY b.created_at DESC;

-- =====================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- =====================================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE user_question_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_category_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements_progress ENABLE ROW LEVEL SECURITY;

-- Políticas para user_question_stats
CREATE POLICY "Usuário vê apenas suas estatísticas de questões" ON user_question_stats
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para game_sessions
CREATE POLICY "Usuário vê apenas suas sessões de jogo" ON game_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_category_performance
CREATE POLICY "Usuário vê apenas seu desempenho por categoria" ON user_category_performance
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para achievements_progress
CREATE POLICY "Usuário vê apenas seu progresso de conquistas" ON achievements_progress
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- DADOS DE EXEMPLO
-- =====================================================

-- Inserir algumas questões de exemplo se não existirem
INSERT INTO games (question, option_a, option_b, option_c, option_d, correct_option, category, difficulty_level) VALUES
('Qual é a capital do Brasil?', 'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'c', 'geography', 1),
('2 + 2 x 3 = ?', '8', '10', '12', '6', 'a', 'math', 2),
('Quem pintou a Mona Lisa?', 'Van Gogh', 'Da Vinci', 'Picasso', 'Monet', 'b', 'art', 2),
('Qual é o maior planeta do sistema solar?', 'Terra', 'Marte', 'Júpiter', 'Saturno', 'c', 'science', 1)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTÁRIOS DAS NOVAS TABELAS
-- =====================================================

COMMENT ON TABLE user_question_stats IS 'Estatísticas detalhadas de cada questão respondida pelos usuários';
COMMENT ON TABLE game_sessions IS 'Sessões de jogo dos usuários (solo, multiplayer, prática)';
COMMENT ON TABLE user_category_performance IS 'Performance dos usuários por categoria de questão';
COMMENT ON TABLE achievements_progress IS 'Progresso dos usuários em conquistas e metas';

COMMENT ON COLUMN user_question_stats.time_taken_seconds IS 'Tempo gasto para responder a questão em segundos';
COMMENT ON COLUMN game_sessions.session_type IS 'Tipo de sessão: solo, multiplayer ou prática';
COMMENT ON COLUMN user_category_performance.best_score IS 'Melhor pontuação do usuário na categoria';
COMMENT ON COLUMN achievements_progress.achievement_type IS 'Tipo de conquista: wins, questions, categories, etc.';

-- =====================================================
-- FUNÇÕES DE UTILIDADE
-- =====================================================

-- Função para obter ranking de usuários por categoria
CREATE OR REPLACE FUNCTION get_user_ranking_by_category(category_name VARCHAR)
RETURNS TABLE (
    rank_position BIGINT,
    user_id UUID,
    username VARCHAR,
    correct_answers INTEGER,
    total_questions INTEGER,
    accuracy_percentage DECIMAL(5,2),
    best_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY ucp.correct_answers DESC, ucp.best_score DESC) as rank_position,
        ucp.user_id,
        u.username,
        ucp.correct_answers,
        ucp.questions_answered,
        ROUND((ucp.correct_answers::DECIMAL / GREATEST(ucp.questions_answered, 1)) * 100, 2) as accuracy_percentage,
        ucp.best_score
    FROM user_category_performance ucp
    JOIN users u ON ucp.user_id = u.id
    WHERE ucp.category = category_name
    ORDER BY ucp.correct_answers DESC, ucp.best_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas de uma sessão de jogo
CREATE OR REPLACE FUNCTION get_session_stats(session_id UUID)
RETURNS TABLE (
    total_questions INTEGER,
    correct_answers INTEGER,
    accuracy_percentage DECIMAL(5,2),
    total_score INTEGER,
    time_spent_minutes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gs.questions_answered,
        gs.correct_answers,
        ROUND((gs.correct_answers::DECIMAL / GREATEST(gs.questions_answered, 1)) * 100, 2) as accuracy_percentage,
        gs.total_score,
        (gs.time_spent_seconds / 60)::INTEGER as time_spent_minutes
    FROM game_sessions gs
    WHERE gs.id = session_id;
END;
$$ LANGUAGE plpgsql;
