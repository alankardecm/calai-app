-- ============================================
-- MIGRAÇÃO: Adicionar colunas para Onboarding
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Adicionar colunas que faltam na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS goal TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS generated_plan JSONB;

-- Atualizar constraint de gender para aceitar valores em português
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_gender_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_gender_check 
    CHECK (gender IN ('male', 'female', 'other', 'masculino', 'feminino'));

-- Atualizar constraint de activity_level para aceitar valores em português
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_activity_level_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_activity_level_check 
    CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active', 
                               'sedentario', 'leve', 'moderado', 'intenso', 'atleta'));

-- Garantir que RLS permite UPSERT
DROP POLICY IF EXISTS "Users can upsert own profile" ON profiles;
CREATE POLICY "Users can upsert own profile"
    ON profiles FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================
-- IMPORTANTE: Execute no Supabase Dashboard
-- Database > SQL Editor > New Query > Cole isso
-- ============================================
