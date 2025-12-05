-- ============================================
-- NUTRISNAP - Schema Supabase
-- App de Monitoramento Nutricional com IA
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: profiles
-- Perfil do usuário com metas nutricionais
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    
    -- Metas diárias
    daily_calorie_goal INTEGER DEFAULT 2000,
    daily_protein_goal INTEGER DEFAULT 150,
    daily_carbs_goal INTEGER DEFAULT 250,
    daily_fat_goal INTEGER DEFAULT 70,
    
    -- Informações adicionais
    weight_kg DECIMAL(5,2),
    height_cm INTEGER,
    birth_date DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: diets
-- Dietas cadastradas pelo nutricionista
-- ============================================
CREATE TABLE IF NOT EXISTS diets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Informações da dieta
    nutritionist_name TEXT,
    start_date DATE,
    end_date DATE,
    goal TEXT CHECK (goal IN ('emagrecimento', 'fortalecimento', 'manutencao')) DEFAULT 'manutencao',
    notes TEXT,
    
    -- Metas diárias específicas da dieta
    daily_targets JSONB DEFAULT '{"calories": 2000, "protein": 150, "carbs": 200, "fat": 65}'::jsonb,
    
    -- Refeições planejadas (JSONB para flexibilidade)
    meals JSONB DEFAULT '[]'::jsonb,
    /*
    Estrutura de meals:
    [
        {
            "id": 1,
            "name": "Café da Manhã",
            "time": "07:00",
            "target_calories": 400,
            "target_protein": 30,
            "target_carbs": 50,
            "target_fat": 15,
            "foods": [
                { "name": "Ovos", "portion": "2 unidades", "calories": 140, "protein": 12, "carbs": 1, "fat": 10 },
                { "name": "Pão integral", "portion": "2 fatias", "calories": 120, "protein": 4, "carbs": 24, "fat": 2 }
            ]
        }
    ]
    */
    
    -- Status
    active BOOLEAN DEFAULT true,
    
    -- Arquivo original (PDF/imagem da dieta)
    original_file_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: meals
-- Refeições registradas pelo usuário
-- ============================================
CREATE TABLE IF NOT EXISTS meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Imagem da refeição
    image_url TEXT,
    
    -- Dados da análise de IA
    food_name TEXT NOT NULL,
    classification TEXT, -- "Refeição Saudável", "Refeição Energética", etc.
    
    -- Macronutrientes
    calories INTEGER DEFAULT 0,
    protein DECIMAL(6,2) DEFAULT 0,
    carbs DECIMAL(6,2) DEFAULT 0,
    fat DECIMAL(6,2) DEFAULT 0,
    fiber DECIMAL(6,2) DEFAULT 0,
    sodium DECIMAL(8,2) DEFAULT 0,
    
    -- Porção
    portion_grams INTEGER,
    portion_description TEXT,
    
    -- Confiança da IA
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    
    -- Alimentos detectados individualmente
    foods_detected JSONB DEFAULT '[]'::jsonb,
    /*
    [
        { "nome": "Frango grelhado", "porcao": "150g", "calorias": 250, "proteina": 38 },
        { "nome": "Arroz integral", "porcao": "100g", "calorias": 130, "proteina": 3 }
    ]
    */
    
    -- Compliance com a dieta
    diet_compliance TEXT CHECK (diet_compliance IN ('good', 'warning', 'bad')),
    
    -- Observações da IA
    notes TEXT,
    ai_suggestions JSONB DEFAULT '[]'::jsonb,
    
    -- Tipo de refeição (opcional)
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'other')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: daily_summaries
-- Resumo diário de nutrientes
-- ============================================
CREATE TABLE IF NOT EXISTS daily_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    
    -- Totais do dia
    total_calories INTEGER DEFAULT 0,
    total_protein DECIMAL(8,2) DEFAULT 0,
    total_carbs DECIMAL(8,2) DEFAULT 0,
    total_fat DECIMAL(8,2) DEFAULT 0,
    total_fiber DECIMAL(8,2) DEFAULT 0,
    
    -- Metas do dia
    goal_calories INTEGER,
    goal_protein INTEGER,
    goal_carbs INTEGER,
    goal_fat INTEGER,
    
    -- Compliance
    compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
    
    -- Número de refeições
    meals_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_created_at ON meals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_diets_user_id ON diets(user_id);
CREATE INDEX IF NOT EXISTS idx_diets_active ON diets(user_id, active);

CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON daily_summaries(user_id, date DESC);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diets_updated_at
    BEFORE UPDATE ON diets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meals_updated_at
    BEFORE UPDATE ON meals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger para criar perfil ao registrar
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Função para atualizar resumo diário
CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER AS $$
DECLARE
    meal_date DATE;
    user_profile RECORD;
BEGIN
    meal_date := DATE(COALESCE(NEW.created_at, OLD.created_at));
    
    -- Buscar metas do usuário
    SELECT * INTO user_profile FROM profiles WHERE id = COALESCE(NEW.user_id, OLD.user_id);
    
    -- Atualizar ou inserir resumo
    INSERT INTO daily_summaries (
        user_id, date,
        total_calories, total_protein, total_carbs, total_fat, total_fiber,
        goal_calories, goal_protein, goal_carbs, goal_fat,
        meals_count
    )
    SELECT 
        COALESCE(NEW.user_id, OLD.user_id),
        meal_date,
        COALESCE(SUM(calories), 0),
        COALESCE(SUM(protein), 0),
        COALESCE(SUM(carbs), 0),
        COALESCE(SUM(fat), 0),
        COALESCE(SUM(fiber), 0),
        user_profile.daily_calorie_goal,
        user_profile.daily_protein_goal,
        user_profile.daily_carbs_goal,
        user_profile.daily_fat_goal,
        COUNT(*)
    FROM meals
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
      AND DATE(created_at) = meal_date
    ON CONFLICT (user_id, date) DO UPDATE SET
        total_calories = EXCLUDED.total_calories,
        total_protein = EXCLUDED.total_protein,
        total_carbs = EXCLUDED.total_carbs,
        total_fat = EXCLUDED.total_fat,
        total_fiber = EXCLUDED.total_fiber,
        meals_count = EXCLUDED.meals_count,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_daily_summary_on_meal
    AFTER INSERT OR UPDATE OR DELETE ON meals
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_summary();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diets ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Políticas para diets
CREATE POLICY "Users can view own diets"
    ON diets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diets"
    ON diets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diets"
    ON diets FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diets"
    ON diets FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para meals
CREATE POLICY "Users can view own meals"
    ON meals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
    ON meals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
    ON meals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
    ON meals FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para daily_summaries
CREATE POLICY "Users can view own summaries"
    ON daily_summaries FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Executar via Dashboard Supabase ou API

-- Criar bucket para imagens de refeições
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('meal-images', 'meal-images', true);

-- Criar bucket para arquivos de dieta
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('diet-files', 'diet-files', false);

-- Políticas de storage (executar no Dashboard)
/*
-- meal-images
CREATE POLICY "Users can upload meal images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'meal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view meal images"
ON storage.objects FOR SELECT
USING (bucket_id = 'meal-images');

CREATE POLICY "Users can delete own meal images"
ON storage.objects FOR DELETE
USING (bucket_id = 'meal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- diet-files
CREATE POLICY "Users can upload diet files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'diet-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own diet files"
ON storage.objects FOR SELECT
USING (bucket_id = 'diet-files' AND auth.uid()::text = (storage.foldername(name))[1]);
*/

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Estatísticas semanais
CREATE OR REPLACE VIEW weekly_stats AS
SELECT 
    user_id,
    DATE_TRUNC('week', date) as week_start,
    AVG(total_calories) as avg_calories,
    AVG(total_protein) as avg_protein,
    AVG(total_carbs) as avg_carbs,
    AVG(total_fat) as avg_fat,
    SUM(meals_count) as total_meals,
    AVG(compliance_score) as avg_compliance
FROM daily_summaries
GROUP BY user_id, DATE_TRUNC('week', date)
ORDER BY week_start DESC;

-- View: Compliance mensal
CREATE OR REPLACE VIEW monthly_compliance AS
SELECT 
    user_id,
    DATE_TRUNC('month', date) as month,
    COUNT(*) as days_tracked,
    AVG(compliance_score) as avg_compliance,
    COUNT(CASE WHEN compliance_score >= 80 THEN 1 END) as good_days,
    COUNT(CASE WHEN compliance_score < 50 THEN 1 END) as bad_days
FROM daily_summaries
GROUP BY user_id, DATE_TRUNC('month', date)
ORDER BY month DESC;

-- ============================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ============================================

-- Descomente para inserir dados de teste
/*
-- Criar usuário de teste primeiro via Dashboard

-- Inserir dieta exemplo
INSERT INTO diets (user_id, nutritionist_name, goal, daily_targets, meals, active)
VALUES (
    'SEU_USER_ID_AQUI',
    'Dra. Maria Santos',
    'emagrecimento',
    '{"calories": 1800, "protein": 130, "carbs": 180, "fat": 55}'::jsonb,
    '[
        {"id": 1, "name": "Café da Manhã", "time": "07:00", "target_calories": 350, "foods": [{"name": "Ovos mexidos", "portion": "2 unidades"}]},
        {"id": 2, "name": "Almoço", "time": "12:00", "target_calories": 500, "foods": [{"name": "Frango grelhado", "portion": "150g"}]},
        {"id": 3, "name": "Jantar", "time": "19:00", "target_calories": 400, "foods": [{"name": "Salada com atum", "portion": "1 prato"}]}
    ]'::jsonb,
    true
);
*/

-- ============================================
-- FIM DO SCHEMA
-- ============================================
