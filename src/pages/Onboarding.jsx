import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

// URL do webhook N8N - Generate Plan
const N8N_GENERATE_PLAN_URL = import.meta.env.VITE_N8N_GENERATE_PLAN_URL || 'https://n8n.srv1121163.hstgr.cloud/webhook/generate-plan';

const Onboarding = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [generatingPlan, setGeneratingPlan] = useState(false);
    const [step, setStep] = useState(1); // 1: dados, 2: gerando plano

    // Form state
    const [formData, setFormData] = useState({
        gender: 'masculino',
        age: 25,
        weight: 70,
        height: 175,
        activityLevel: 'moderado',
        goal: 'gordura'
    });

    const activityLevels = [
        { id: 'sedentario', label: 'Sedentário', description: 'Pouco ou nenhum exercício' },
        { id: 'leve', label: 'Leve', description: 'Exercício leve 1-2 dias/semana' },
        { id: 'moderado', label: 'Moderado', description: 'Exercício moderado 3-5 dias/semana' },
        { id: 'intenso', label: 'Intenso', description: 'Exercício intenso 6-7 dias/semana' },
        { id: 'atleta', label: 'Atleta', description: 'Treino intenso + trabalho físico' }
    ];

    const goals = [
        { id: 'gordura', label: 'Perder Gordura', description: 'Foco em déficit calórico e definição.', icon: 'local_fire_department' },
        { id: 'massa', label: 'Ganhar Massa', description: 'Ganho de massa muscular e força.', icon: 'fitness_center' },
        { id: 'manter', label: 'Manter', description: 'Manter peso e composição atual.', icon: 'balance' }
    ];

    const handleSubmit = async () => {
        setLoading(true);
        setStep(2);
        setGeneratingPlan(true);

        try {
            // 1. Salvar perfil básico no Supabase primeiro
            console.log('Salvando perfil para user:', user?.id);

            const profileData = {
                id: user.id,
                gender: formData.gender,
                age: formData.age,
                weight: formData.weight,
                height: formData.height,
                weight_kg: formData.weight, // Compatibilidade com schema antigo
                height_cm: formData.height, // Compatibilidade com schema antigo
                activity_level: formData.activityLevel,
                goal: formData.goal,
                onboarding_completed: false,
                updated_at: new Date().toISOString()
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(profileData);

            if (profileError) {
                console.error('Erro Supabase ao salvar perfil:', profileError);
                // Se for erro de coluna faltando, tentar com menos campos
                if (profileError.message?.includes('column') || profileError.code === '42703') {
                    console.log('Tentando com campos mínimos...');
                    const minimalData = {
                        id: user.id,
                        daily_calorie_goal: 2000,
                        daily_protein_goal: 150,
                        daily_carbs_goal: 200,
                        daily_fat_goal: 60,
                        updated_at: new Date().toISOString()
                    };
                    const { error: minimalError } = await supabase
                        .from('profiles')
                        .upsert(minimalData);

                    if (minimalError) {
                        throw new Error(`Erro ao salvar: ${minimalError.message}`);
                    }
                } else {
                    throw new Error(`Erro ao salvar: ${profileError.message}`);
                }
            }

            // 2. Calcular plano localmente (fallback principal)
            let planData = calculateLocalPlan(formData);

            // 3. Tentar N8N para plano mais detalhado (opcional)
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

                const response = await fetch(N8N_GENERATE_PLAN_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.id,
                        gender: formData.gender,
                        age: formData.age,
                        weight: formData.weight,
                        height: formData.height,
                        activity_level: formData.activityLevel,
                        goal: formData.goal
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const aiPlan = await response.json();
                    if (aiPlan && aiPlan.calculations) {
                        planData = aiPlan;
                        console.log('Plano IA gerado:', planData);
                    }
                }
            } catch (n8nError) {
                console.warn('N8N não disponível, usando cálculos locais:', n8nError.message);
                // Continua com o planData local calculado acima
            }

            // 4. Atualizar perfil com metas calculadas
            const updateData = {
                daily_calorie_goal: planData.calculations?.calorieTarget || 2000,
                daily_protein_goal: planData.calculations?.proteinTarget || 150,
                daily_carbs_goal: planData.calculations?.carbsTarget || 200,
                daily_fat_goal: planData.calculations?.fatTarget || 60,
                updated_at: new Date().toISOString()
            };

            // Tentar adicionar campos extras se possível
            try {
                updateData.onboarding_completed = true;
                if (planData.plan) {
                    updateData.generated_plan = planData.plan;
                }
            } catch (e) {
                console.warn('Campos extras não suportados');
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', user.id);

            if (updateError) {
                console.warn('Erro ao atualizar metas (continuando):', updateError.message);
                // Não bloqueia - continua para o dashboard
            }

            // 5. Sucesso! Navegar para o Dashboard
            console.log('Onboarding completo! Redirecionando...');
            setTimeout(() => {
                navigate('/');
            }, 1500);

        } catch (error) {
            console.error('Erro no onboarding:', error);
            alert(`Erro: ${error.message || 'Tente novamente.'}`);
            setStep(1);
        } finally {
            setLoading(false);
            setGeneratingPlan(false);
        }
    };

    // Cálculo local de fallback (sem IA)
    const calculateLocalPlan = (data) => {
        // TMB - Mifflin-St Jeor
        let tmb;
        if (data.gender === 'masculino') {
            tmb = (10 * data.weight) + (6.25 * data.height) - (5 * data.age) + 5;
        } else {
            tmb = (10 * data.weight) + (6.25 * data.height) - (5 * data.age) - 161;
        }

        const activityFactors = {
            'sedentario': 1.2,
            'leve': 1.375,
            'moderado': 1.55,
            'intenso': 1.725,
            'atleta': 1.9
        };

        const tdee = Math.round(tmb * (activityFactors[data.activityLevel] || 1.55));

        let calorieTarget, proteinTarget, carbsTarget, fatTarget;

        switch (data.goal) {
            case 'gordura':
                calorieTarget = Math.round(tdee * 0.8);
                proteinTarget = Math.round(data.weight * 2.2);
                fatTarget = Math.round(data.weight * 0.8);
                carbsTarget = Math.round((calorieTarget - (proteinTarget * 4) - (fatTarget * 9)) / 4);
                break;
            case 'massa':
                calorieTarget = Math.round(tdee * 1.15);
                proteinTarget = Math.round(data.weight * 2.0);
                fatTarget = Math.round(data.weight * 1.0);
                carbsTarget = Math.round((calorieTarget - (proteinTarget * 4) - (fatTarget * 9)) / 4);
                break;
            default:
                calorieTarget = tdee;
                proteinTarget = Math.round(data.weight * 1.8);
                fatTarget = Math.round(data.weight * 0.9);
                carbsTarget = Math.round((calorieTarget - (proteinTarget * 4) - (fatTarget * 9)) / 4);
        }

        return {
            success: true,
            calculations: {
                tmb,
                tdee,
                calorieTarget,
                proteinTarget,
                carbsTarget,
                fatTarget,
                goal: data.goal
            },
            plan: null // Sem plano detalhado no fallback
        };
    };

    const selectedActivity = activityLevels.find(a => a.id === formData.activityLevel);

    // Tela de geração do plano
    if (step === 2) {
        return (
            <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6">
                <div className="text-center space-y-6">
                    {/* Animated Icon */}
                    <div className="relative mx-auto w-24 h-24">
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-4xl animate-pulse">
                                auto_awesome
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">
                            Gerando seu plano personalizado
                        </h2>
                        <p className="text-text-secondary">
                            Nossa IA está calculando as melhores<br />metas para você...
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="space-y-3 text-left max-w-xs mx-auto">
                        <ProgressItem text="Calculando metabolismo basal" done={true} />
                        <ProgressItem text="Definindo metas de macros" done={generatingPlan} />
                        <ProgressItem text="Criando plano de treino" done={false} />
                        <ProgressItem text="Personalizando dieta" done={false} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2">
                    <span className="material-symbols-outlined text-white">arrow_back</span>
                </button>
                <h1 className="text-white font-semibold">CONFIGURAÇÃO INICIAL</h1>
                <button className="p-2 -mr-2 opacity-50">
                    <span className="material-symbols-outlined text-white">help_outline</span>
                </button>
            </header>

            {/* Content */}
            <div className="px-6 py-8 pb-32 space-y-8">
                {/* Title */}
                <div>
                    <h2 className="text-3xl font-bold text-white">
                        Configure seu <span className="text-primary">Treinador IA</span>
                    </h2>
                    <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                        Precisamos de alguns dados vitais para que nossa IA calcule suas necessidades metabólicas com precisão.
                    </p>
                </div>

                {/* Dados Pessoais */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person</span>
                        <h3 className="text-white font-semibold">Dados Pessoais</h3>
                    </div>

                    {/* Gender Toggle */}
                    <div className="flex bg-surface-dark rounded-xl p-1.5 gap-2">
                        {['masculino', 'feminino'].map((gender) => (
                            <button
                                key={gender}
                                onClick={() => setFormData({ ...formData, gender })}
                                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${formData.gender === gender
                                    ? 'bg-primary text-background-dark'
                                    : 'bg-transparent text-text-muted hover:text-white'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {gender === 'masculino' ? 'male' : 'female'}
                                </span>
                                {gender.charAt(0).toUpperCase() + gender.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Age, Weight, Height */}
                    <div className="grid grid-cols-3 gap-3">
                        {/* Age */}
                        <div className="bg-surface-dark rounded-xl p-4 text-center">
                            <span className="text-text-muted text-xs uppercase tracking-wider">Idade</span>
                            <div className="flex items-baseline justify-center gap-1 mt-2">
                                <input
                                    type="number"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                                    className="w-12 bg-transparent text-white text-2xl font-bold text-center focus:outline-none"
                                />
                                <span className="text-text-muted text-sm">anos</span>
                            </div>
                        </div>

                        {/* Weight */}
                        <div className="bg-surface-dark rounded-xl p-4 text-center">
                            <span className="text-text-muted text-xs uppercase tracking-wider">Peso</span>
                            <div className="flex items-baseline justify-center gap-1 mt-2">
                                <input
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
                                    className="w-12 bg-transparent text-white text-2xl font-bold text-center focus:outline-none"
                                />
                                <span className="text-text-muted text-sm">kg</span>
                            </div>
                        </div>

                        {/* Height */}
                        <div className="bg-surface-dark rounded-xl p-4 text-center">
                            <span className="text-text-muted text-xs uppercase tracking-wider">Altura</span>
                            <div className="flex items-baseline justify-center gap-1 mt-2">
                                <input
                                    type="number"
                                    value={formData.height}
                                    onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 0 })}
                                    className="w-12 bg-transparent text-white text-2xl font-bold text-center focus:outline-none"
                                />
                                <span className="text-text-muted text-sm">cm</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Nível de Atividade */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">directions_run</span>
                            <h3 className="text-white font-semibold">Nível de Atividade</h3>
                        </div>
                        <span className="text-primary text-sm font-medium px-3 py-1 bg-primary/10 rounded-full border border-primary/30">
                            {selectedActivity?.label}
                        </span>
                    </div>

                    {/* Activity Slider */}
                    <div className="bg-surface-dark rounded-xl p-6">
                        <div className="relative">
                            <input
                                type="range"
                                min="0"
                                max="4"
                                value={activityLevels.findIndex(a => a.id === formData.activityLevel)}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    activityLevel: activityLevels[parseInt(e.target.value)].id
                                })}
                                className="activity-slider w-full"
                            />
                        </div>
                        <p className="text-text-secondary text-sm text-center mt-4">
                            {selectedActivity?.description}
                        </p>
                    </div>
                </section>

                {/* Objetivo Principal */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">flag</span>
                        <h3 className="text-white font-semibold">Objetivo Principal</h3>
                    </div>

                    <div className="space-y-3">
                        {goals.map((goal) => (
                            <button
                                key={goal.id}
                                onClick={() => setFormData({ ...formData, goal: goal.id })}
                                className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 ${formData.goal === goal.id
                                    ? 'bg-primary/10 border-2 border-primary'
                                    : 'bg-surface-dark border-2 border-transparent'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.goal === goal.id ? 'bg-primary/20' : 'bg-surface-light'
                                    }`}>
                                    <span className={`material-symbols-outlined text-2xl ${formData.goal === goal.id ? 'text-primary' : 'text-text-muted'
                                        }`}>
                                        {goal.icon}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-semibold ${formData.goal === goal.id ? 'text-white' : 'text-text-secondary'
                                        }`}>
                                        {goal.label}
                                    </h4>
                                    <p className="text-text-muted text-sm">{goal.description}</p>
                                </div>
                                {formData.goal === goal.id && (
                                    <span className="material-symbols-outlined text-primary">check_circle</span>
                                )}
                            </button>
                        ))}
                    </div>
                </section>
            </div>

            {/* Fixed Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 pb-8 bg-gradient-to-t from-background-dark via-background-dark/95 to-transparent z-50">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-5 bg-primary hover:bg-primary-dark rounded-2xl font-bold text-background-dark text-lg flex items-center justify-center gap-3 transition-all shadow-glow disabled:opacity-50"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-3 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                            Gerar Plano com IA
                        </>
                    )}
                </button>
            </div>

            {/* Custom Slider Styles */}
            <style>{`
                .activity-slider {
                    -webkit-appearance: none;
                    appearance: none;
                    height: 6px;
                    background: linear-gradient(to right, #4cdf20 0%, #4cdf20 ${(activityLevels.findIndex(a => a.id === formData.activityLevel) / 4) * 100
                }%, rgba(255,255,255,0.1) ${(activityLevels.findIndex(a => a.id === formData.activityLevel) / 4) * 100
                }%, rgba(255,255,255,0.1) 100%);
                    border-radius: 100px;
                    outline: none;
                }
                .activity-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    background: #4cdf20;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 15px rgba(76, 223, 32, 0.5);
                }
                .activity-slider::-moz-range-thumb {
                    width: 24px;
                    height: 24px;
                    background: #4cdf20;
                    border-radius: 50%;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 0 15px rgba(76, 223, 32, 0.5);
                }
            `}</style>
        </div>
    );
};

// Progress Item Component
const ProgressItem = ({ text, done }) => (
    <div className="flex items-center gap-3">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${done ? 'bg-primary' : 'bg-surface-dark border border-white/20'
            }`}>
            {done ? (
                <span className="material-symbols-outlined text-background-dark text-sm">check</span>
            ) : (
                <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
            )}
        </div>
        <span className={`text-sm ${done ? 'text-white' : 'text-text-muted'}`}>
            {text}
        </span>
    </div>
);

export default Onboarding;
