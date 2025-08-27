-- =====================================================
-- SISTEMA DE PERFIL COMPLETO - SUPABASE INTEGRATION
-- =====================================================

-- Adicionar novas colunas à tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS telefone VARCHAR(20),
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS pais VARCHAR(100),
ADD COLUMN IF NOT EXISTS cidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS estado VARCHAR(100),
ADD COLUMN IF NOT EXISTS cep VARCHAR(10),
ADD COLUMN IF NOT EXISTS preferencias JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar tabela para estatísticas do perfil
CREATE TABLE IF NOT EXISTS user_profile_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_games INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    average_score DECIMAL(8,2) DEFAULT 0.00,
    best_score INTEGER DEFAULT 0,
    total_play_time INTEGER DEFAULT 0, -- em segundos
    favorite_category VARCHAR(50),
    total_achievements INTEGER DEFAULT 0,
    total_challenges_completed INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    total_withdrawals DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Criar tabela para logs de atividade do perfil
CREATE TABLE IF NOT EXISTS profile_activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para configurações de privacidade
CREATE TABLE IF NOT EXISTS user_privacy_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
    show_balance BOOLEAN DEFAULT false,
    show_statistics BOOLEAN DEFAULT true,
    show_activities BOOLEAN DEFAULT true,
    allow_friend_requests BOOLEAN DEFAULT true,
    allow_messages BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Criar tabela para preferências do usuário
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language VARCHAR(10) DEFAULT 'pt-BR' CHECK (language IN ('pt-BR', 'en-US', 'es-ES')),
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sound_enabled BOOLEAN DEFAULT true,
    vibration_enabled BOOLEAN DEFAULT true,
    auto_save BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Criar tabela para histórico de mudanças de perfil
CREATE TABLE IF NOT EXISTS profile_change_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    field_name VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL -- para mudanças feitas por admins
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_profile_stats_user_id ON user_profile_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_activity_logs_user_id ON profile_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_activity_logs_created_at ON profile_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_privacy_settings_user_id ON user_privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_change_history_user_id ON profile_change_history(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_change_history_changed_at ON profile_change_history(changed_at);

-- Criar função para atualizar estatísticas do perfil automaticamente
CREATE OR REPLACE FUNCTION update_profile_stats_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar estatísticas quando houver mudanças relevantes
    INSERT INTO user_profile_stats (user_id, updated_at)
    VALUES (NEW.id, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estatísticas quando usuário é criado/atualizado
CREATE TRIGGER trigger_update_profile_stats
    AFTER INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_profile_stats_trigger();

-- Função para logar mudanças no perfil
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Logar mudanças em campos específicos
    IF OLD.username IS DISTINCT FROM NEW.username THEN
        INSERT INTO profile_change_history (user_id, field_name, old_value, new_value)
        VALUES (NEW.id, 'username', OLD.username, NEW.username);
    END IF;
    
    IF OLD.idade IS DISTINCT FROM NEW.idade THEN
        INSERT INTO profile_change_history (user_id, field_name, old_value, new_value)
        VALUES (NEW.id, 'idade', OLD.idade::TEXT, NEW.idade::TEXT);
    END IF;
    
    IF OLD.sexo IS DISTINCT FROM NEW.sexo THEN
        INSERT INTO profile_change_history (user_id, field_name, old_value, new_value)
        VALUES (NEW.id, 'sexo', OLD.sexo, NEW.sexo);
    END IF;
    
    IF OLD.avatar IS DISTINCT FROM NEW.avatar THEN
        INSERT INTO profile_change_history (user_id, field_name, old_value, new_value)
        VALUES (NEW.id, 'avatar', OLD.avatar::TEXT, NEW.avatar::TEXT);
    END IF;
    
    -- Atualizar timestamp
    NEW.updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para logar mudanças no perfil
CREATE TRIGGER trigger_log_profile_changes
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION log_profile_changes();

-- Função para calcular estatísticas completas do perfil
CREATE OR REPLACE FUNCTION calculate_complete_profile_stats(user_uuid UUID)
RETURNS TABLE (
    total_games INTEGER,
    win_rate DECIMAL(5,2),
    average_score DECIMAL(8,2),
    best_score INTEGER,
    total_play_time INTEGER,
    favorite_category VARCHAR(50),
    total_earnings DECIMAL(10,2),
    total_withdrawals DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH game_stats AS (
        SELECT 
            COUNT(*) as total_games,
            ROUND(
                (COUNT(CASE WHEN answered_correctly = true THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2
            ) as win_rate,
            ROUND(AVG(score), 2) as avg_score,
            MAX(score) as max_score,
            SUM(COALESCE(time_taken_seconds, 0)) as total_time,
            MODE() WITHIN GROUP (ORDER BY category) as fav_category
        FROM user_question_stats 
        WHERE user_id = user_uuid
    ),
    bet_stats AS (
        SELECT 
            COALESCE(SUM(CASE WHEN status = 'won' THEN potential_winnings ELSE 0 END), 0) as total_earnings
        FROM bets 
        WHERE user_id = user_uuid
    ),
    withdrawal_stats AS (
        SELECT 
            COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_withdrawals
        FROM withdraws 
        WHERE user_id = user_uuid
    )
    SELECT 
        gs.total_games,
        gs.win_rate,
        gs.avg_score,
        gs.max_score,
        gs.total_time,
        gs.fav_category,
        bs.total_earnings,
        ws.total_withdrawals
    FROM game_stats gs
    CROSS JOIN bet_stats bs
    CROSS JOIN withdrawal_stats ws;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar usuários similares
CREATE OR REPLACE FUNCTION find_similar_users(user_uuid UUID, limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
    user_id UUID,
    username VARCHAR(255),
    avatar INTEGER,
    wins INTEGER,
    losses INTEGER,
    similarity_score DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH user_categories AS (
        SELECT category, correct_answers
        FROM user_category_performance 
        WHERE user_id = user_uuid
        ORDER BY correct_answers DESC
        LIMIT 3
    ),
    similar_users AS (
        SELECT 
            ucp.user_id,
            u.username,
            u.avatar,
            u.wins,
            u.losses,
            COUNT(ucp.category) as common_categories,
            AVG(ucp.correct_answers) as avg_performance
        FROM user_category_performance ucp
        JOIN users u ON ucp.user_id = u.id
        JOIN user_categories uc ON ucp.category = uc.category
        WHERE ucp.user_id != user_uuid
        GROUP BY ucp.user_id, u.username, u.avatar, u.wins, u.losses
        HAVING COUNT(ucp.category) > 0
        ORDER BY common_categories DESC, avg_performance DESC
        LIMIT limit_count
    )
    SELECT 
        su.user_id,
        su.username,
        su.avatar,
        su.wins,
        su.losses,
        (su.common_categories * 0.6 + (su.avg_performance / 100) * 0.4)::DECIMAL(5,2) as similarity_score
    FROM similar_users su
    ORDER BY similarity_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar logs antigos (manter apenas últimos 90 dias)
CREATE OR REPLACE FUNCTION cleanup_old_profile_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM profile_activity_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    DELETE FROM profile_change_history 
    WHERE changed_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Criar view para perfil público (respeitando configurações de privacidade)
CREATE OR REPLACE VIEW public_user_profiles AS
SELECT 
    u.id,
    u.username,
    u.avatar,
    u.wins,
    u.losses,
    u.created_at as member_since,
    ups.favorite_category,
    ups.total_games,
    ups.win_rate,
    ups.best_score,
    CASE 
        WHEN ups.total_play_time > 0 THEN 
            CONCAT(
                FLOOR(ups.total_play_time / 3600), 'h ',
                FLOOR((ups.total_play_time % 3600) / 60), 'm'
            )
        ELSE '0m'
    END as total_play_time_formatted,
    CASE 
        WHEN u.priv.show_balance THEN u.balance 
        ELSE NULL 
    END as balance,
    u.priv.profile_visibility,
    u.priv.allow_friend_requests,
    u.priv.allow_messages
FROM users u
LEFT JOIN user_profile_stats ups ON u.id = ups.user_id
LEFT JOIN user_privacy_settings u.priv ON u.id = u.priv.user_id
WHERE u.priv.profile_visibility = 'public';

-- Inserir configurações padrão para usuários existentes
INSERT INTO user_privacy_settings (user_id, profile_visibility, show_balance, show_statistics, show_activities, allow_friend_requests, allow_messages)
SELECT 
    id, 
    'public', 
    false, 
    true, 
    true, 
    true, 
    true
FROM users 
WHERE id NOT IN (SELECT user_id FROM user_privacy_settings)
ON CONFLICT DO NOTHING;

-- Inserir preferências padrão para usuários existentes
INSERT INTO user_preferences (user_id, theme, language, notifications_enabled, email_notifications, push_notifications, sound_enabled, vibration_enabled, auto_save)
SELECT 
    id, 
    'light', 
    'pt-BR', 
    true, 
    true, 
    true, 
    true, 
    true, 
    true
FROM users 
WHERE id NOT IN (SELECT user_id FROM user_preferences)
ON CONFLICT DO NOTHING;

-- Criar RLS (Row Level Security) policies
ALTER TABLE user_profile_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_change_history ENABLE ROW LEVEL SECURITY;

-- Policy para user_profile_stats
CREATE POLICY "Users can view their own profile stats" ON user_profile_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile stats" ON user_profile_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy para profile_activity_logs
CREATE POLICY "Users can view their own activity logs" ON profile_activity_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs" ON profile_activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy para user_privacy_settings
CREATE POLICY "Users can view their own privacy settings" ON user_privacy_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own privacy settings" ON user_privacy_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy para user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy para profile_change_history
CREATE POLICY "Users can view their own change history" ON profile_change_history
    FOR SELECT USING (auth.uid() = user_id);

-- Função para atualizar estatísticas em lote (útil para manutenção)
CREATE OR REPLACE FUNCTION refresh_all_profile_stats()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM users LOOP
        -- Calcular e atualizar estatísticas para cada usuário
        INSERT INTO user_profile_stats (
            user_id, 
            total_games, 
            win_rate, 
            average_score, 
            best_score, 
            total_play_time, 
            favorite_category,
            total_earnings,
            total_withdrawals,
            updated_at
        )
        SELECT 
            user_record.id,
            stats.total_games,
            stats.win_rate,
            stats.average_score,
            stats.best_score,
            stats.total_play_time,
            stats.favorite_category,
            stats.total_earnings,
            stats.total_withdrawals,
            NOW()
        FROM calculate_complete_profile_stats(user_record.id) stats
        ON CONFLICT (user_id) 
        DO UPDATE SET
            total_games = EXCLUDED.total_games,
            win_rate = EXCLUDED.win_rate,
            average_score = EXCLUDED.average_score,
            best_score = EXCLUDED.best_score,
            total_play_time = EXCLUDED.total_play_time,
            favorite_category = EXCLUDED.favorite_category,
            total_earnings = EXCLUDED.total_earnings,
            total_withdrawals = EXCLUDED.total_withdrawals,
            updated_at = NOW();
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE user_profile_stats IS 'Estatísticas detalhadas do perfil do usuário';
COMMENT ON TABLE profile_activity_logs IS 'Log de todas as atividades do usuário no perfil';
COMMENT ON TABLE user_privacy_settings IS 'Configurações de privacidade do usuário';
COMMENT ON TABLE user_preferences IS 'Preferências e configurações do usuário';
COMMENT ON TABLE profile_change_history IS 'Histórico de mudanças no perfil do usuário';
COMMENT ON FUNCTION calculate_complete_profile_stats IS 'Calcula estatísticas completas do perfil do usuário';
COMMENT ON FUNCTION find_similar_users IS 'Encontra usuários com interesses similares';
COMMENT ON FUNCTION cleanup_old_profile_logs IS 'Remove logs antigos para manter performance';
COMMENT ON FUNCTION refresh_all_profile_stats IS 'Atualiza estatísticas de todos os usuários';

-- =====================================================
-- FIM DO SCRIPT DE INTEGRAÇÃO DO PERFIL
-- =====================================================
