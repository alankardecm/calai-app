import React, { useState, useEffect } from 'react';
import {
    Apple, Plus, Trash2, Save, FileText, CheckCircle, XCircle,
    AlertTriangle, Upload, Loader2, Sparkles, Target, ChevronDown,
    ChevronUp, Edit3, X
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastSystem';

const Diet = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [diet, setDiet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [showAddMeal, setShowAddMeal] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [compliance, setCompliance] = useState(null);

    // Form state para nova dieta
    const [dietForm, setDietForm] = useState({
        nutritionist_name: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        goal: 'emagrecimento', // emagrecimento, fortalecimento, manutencao
        notes: '',
        daily_targets: {
            calories: 2000,
            protein: 150,
            carbs: 200,
            fat: 65
        },
        meals: []
    });

    // Template de refeição
    const mealTemplate = {
        name: '',
        time: '',
        foods: [],
        target_calories: 0,
        target_protein: 0,
        target_carbs: 0,
        target_fat: 0
    };

    useEffect(() => {
        if (user) {
            fetchDiet();
        }
    }, [user]);

    const fetchDiet = async () => {
        try {
            const { data, error } = await supabase
                .from('diets')
                .select('*')
                .eq('user_id', user.id)
                .eq('active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setDiet(data);
                setDietForm({
                    nutritionist_name: data.nutritionist_name || '',
                    start_date: data.start_date || '',
                    end_date: data.end_date || '',
                    goal: data.goal || 'emagrecimento',
                    notes: data.notes || '',
                    daily_targets: data.daily_targets || { calories: 2000, protein: 150, carbs: 200, fat: 65 },
                    meals: data.meals || []
                });
                // Buscar compliance
                fetchCompliance(data.id);
            }
        } catch (err) {
            console.error('Erro ao buscar dieta:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompliance = async (dietId) => {
        try {
            // Buscar refeições dos últimos 7 dias
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            const { data: meals, error } = await supabase
                .from('meals')
                .select('*')
                .eq('user_id', user.id)
                .gte('created_at', weekAgo.toISOString());

            if (error) throw error;

            // Calcular compliance
            const complianceData = calculateCompliance(meals || [], dietForm);
            setCompliance(complianceData);
        } catch (err) {
            console.error('Erro ao calcular compliance:', err);
        }
    };

    const calculateCompliance = (meals, dietData) => {
        if (!meals.length || !dietData.daily_targets) {
            return { score: 0, details: {} };
        }

        const totals = meals.reduce((acc, meal) => ({
            calories: acc.calories + (meal.calories || 0),
            protein: acc.protein + (meal.protein || 0),
            carbs: acc.carbs + (meal.carbs || 0),
            fat: acc.fat + (meal.fat || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        const days = 7;
        const avgDaily = {
            calories: Math.round(totals.calories / days),
            protein: Math.round(totals.protein / days),
            carbs: Math.round(totals.carbs / days),
            fat: Math.round(totals.fat / days)
        };

        const targets = dietData.daily_targets;

        // Calcular % de aderência para cada macro
        const calorieCompliance = Math.min(100, Math.round((avgDaily.calories / targets.calories) * 100));
        const proteinCompliance = Math.min(100, Math.round((avgDaily.protein / targets.protein) * 100));
        const carbsCompliance = Math.min(100, Math.round((avgDaily.carbs / targets.carbs) * 100));
        const fatCompliance = Math.min(100, Math.round((avgDaily.fat / targets.fat) * 100));

        // Score geral (média ponderada)
        const score = Math.round((calorieCompliance * 0.3 + proteinCompliance * 0.35 + carbsCompliance * 0.2 + fatCompliance * 0.15));

        return {
            score,
            avgDaily,
            details: {
                calories: { current: avgDaily.calories, target: targets.calories, compliance: calorieCompliance },
                protein: { current: avgDaily.protein, target: targets.protein, compliance: proteinCompliance },
                carbs: { current: avgDaily.carbs, target: targets.carbs, compliance: carbsCompliance },
                fat: { current: avgDaily.fat, target: targets.fat, compliance: fatCompliance }
            }
        };
    };

    const saveDiet = async () => {
        setSaving(true);
        try {
            const dietData = {
                user_id: user.id,
                nutritionist_name: dietForm.nutritionist_name,
                start_date: dietForm.start_date,
                end_date: dietForm.end_date || null,
                goal: dietForm.goal,
                notes: dietForm.notes,
                daily_targets: dietForm.daily_targets,
                meals: dietForm.meals,
                active: true,
                updated_at: new Date().toISOString()
            };

            if (diet?.id) {
                // Update
                const { error } = await supabase
                    .from('diets')
                    .update(dietData)
                    .eq('id', diet.id);

                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from('diets')
                    .insert([dietData]);

                if (error) throw error;
            }

            toast.success('✅ Dieta salva com sucesso!');
            setEditing(false);
            fetchDiet();
        } catch (err) {
            console.error('Erro ao salvar dieta:', err);
            toast.error('❌ Erro ao salvar dieta');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingFile(true);

        try {
            // Upload do arquivo PDF/imagem da dieta
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/diet-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('diet-files')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('diet-files')
                .getPublicUrl(fileName);

            // TODO: Enviar para N8N processar o PDF/imagem e extrair a dieta
            // Por enquanto, salvar referência do arquivo
            toast.success('📄 Arquivo enviado! Em breve a IA irá processar.');

        } catch (err) {
            console.error('Erro ao fazer upload:', err);
            toast.error('❌ Erro ao enviar arquivo');
        } finally {
            setUploadingFile(false);
        }
    };

    const addMealToDiet = () => {
        setDietForm({
            ...dietForm,
            meals: [...dietForm.meals, { ...mealTemplate, id: Date.now() }]
        });
    };

    const updateMeal = (index, field, value) => {
        const updatedMeals = [...dietForm.meals];
        updatedMeals[index] = { ...updatedMeals[index], [field]: value };
        setDietForm({ ...dietForm, meals: updatedMeals });
    };

    const removeMeal = (index) => {
        const updatedMeals = dietForm.meals.filter((_, i) => i !== index);
        setDietForm({ ...dietForm, meals: updatedMeals });
    };

    const addFoodToMeal = (mealIndex) => {
        const updatedMeals = [...dietForm.meals];
        updatedMeals[mealIndex].foods.push({
            name: '',
            portion: '',
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
        });
        setDietForm({ ...dietForm, meals: updatedMeals });
    };

    const updateFood = (mealIndex, foodIndex, field, value) => {
        const updatedMeals = [...dietForm.meals];
        updatedMeals[mealIndex].foods[foodIndex] = {
            ...updatedMeals[mealIndex].foods[foodIndex],
            [field]: value
        };
        setDietForm({ ...dietForm, meals: updatedMeals });
    };

    const removeFood = (mealIndex, foodIndex) => {
        const updatedMeals = [...dietForm.meals];
        updatedMeals[mealIndex].foods = updatedMeals[mealIndex].foods.filter((_, i) => i !== foodIndex);
        setDietForm({ ...dietForm, meals: updatedMeals });
    };

    if (loading) {
        return <DietSkeleton />;
    }

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            {/* Header */}
            <div className="text-center space-y-3 pt-2">
                <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-bold">
                    <Apple size={16} />
                    <span>Plano Alimentar</span>
                </div>
                <h2 className="text-4xl font-black text-primary leading-tight">
                    Sua Dieta
                </h2>
                <p className="text-muted text-base font-medium">
                    Cadastre a dieta do seu nutricionista
                </p>
            </div>

            {/* Compliance Card */}
            {diet && compliance && (
                <ComplianceCard compliance={compliance} goal={diet.goal} />
            )}

            {/* Upload Diet File */}
            {!diet && (
                <div className="card rounded-xl shadow-md">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                            <FileText size={24} className="text-accent" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-primary">Importar Dieta</h3>
                            <p className="text-sm text-muted">Envie PDF ou foto da sua dieta</p>
                        </div>
                    </div>

                    <label className="btn btn-outline w-full py-4 cursor-pointer">
                        <input
                            type="file"
                            accept=".pdf,image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                        {uploadingFile ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>Enviando...</span>
                            </>
                        ) : (
                            <>
                                <Upload size={20} />
                                <span>Escolher Arquivo</span>
                            </>
                        )}
                    </label>

                    <div className="flex items-center gap-4 my-4">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted font-bold">OU</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    <button
                        onClick={() => setEditing(true)}
                        className="btn btn-primary w-full py-4"
                    >
                        <Edit3 size={20} />
                        <span>Cadastrar Manualmente</span>
                    </button>
                </div>
            )}

            {/* Diet Form */}
            {(editing || diet) && (
                <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="card rounded-xl shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                                <Target size={20} />
                                Informações da Dieta
                            </h3>
                            {diet && !editing && (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="btn btn-ghost p-2"
                                >
                                    <Edit3 size={18} className="text-muted" />
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-muted mb-2 block">
                                    Nutricionista
                                </label>
                                <input
                                    type="text"
                                    value={dietForm.nutritionist_name}
                                    onChange={(e) => setDietForm({ ...dietForm, nutritionist_name: e.target.value })}
                                    disabled={!editing}
                                    className="w-full px-4 py-3 bg-secondary rounded-xl font-medium text-primary disabled:opacity-60"
                                    placeholder="Nome do nutricionista"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-muted mb-2 block">
                                    Objetivo
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: 'emagrecimento', label: '🔥 Emagrecer' },
                                        { value: 'fortalecimento', label: '💪 Fortalecer' },
                                        { value: 'manutencao', label: '⚖️ Manter' }
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => editing && setDietForm({ ...dietForm, goal: opt.value })}
                                            disabled={!editing}
                                            className={`py-3 px-2 rounded-xl font-bold text-sm transition-all ${dietForm.goal === opt.value
                                                    ? 'bg-primary text-white shadow-lg'
                                                    : 'bg-secondary text-muted'
                                                } disabled:opacity-60`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted mb-2 block">
                                        Início
                                    </label>
                                    <input
                                        type="date"
                                        value={dietForm.start_date}
                                        onChange={(e) => setDietForm({ ...dietForm, start_date: e.target.value })}
                                        disabled={!editing}
                                        className="w-full px-4 py-3 bg-secondary rounded-xl font-medium text-primary disabled:opacity-60"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted mb-2 block">
                                        Fim (opcional)
                                    </label>
                                    <input
                                        type="date"
                                        value={dietForm.end_date}
                                        onChange={(e) => setDietForm({ ...dietForm, end_date: e.target.value })}
                                        disabled={!editing}
                                        className="w-full px-4 py-3 bg-secondary rounded-xl font-medium text-primary disabled:opacity-60"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Daily Targets */}
                    <div className="card rounded-xl shadow-md">
                        <h3 className="font-bold text-lg text-primary mb-4">
                            📊 Metas Diárias
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            <TargetInput
                                label="Calorias"
                                value={dietForm.daily_targets.calories}
                                onChange={(val) => setDietForm({
                                    ...dietForm,
                                    daily_targets: { ...dietForm.daily_targets, calories: parseInt(val) || 0 }
                                })}
                                unit="kcal"
                                editing={editing}
                                color="from-orange-500 to-red-500"
                            />
                            <TargetInput
                                label="Proteínas"
                                value={dietForm.daily_targets.protein}
                                onChange={(val) => setDietForm({
                                    ...dietForm,
                                    daily_targets: { ...dietForm.daily_targets, protein: parseInt(val) || 0 }
                                })}
                                unit="g"
                                editing={editing}
                                color="from-blue-500 to-cyan-500"
                            />
                            <TargetInput
                                label="Carboidratos"
                                value={dietForm.daily_targets.carbs}
                                onChange={(val) => setDietForm({
                                    ...dietForm,
                                    daily_targets: { ...dietForm.daily_targets, carbs: parseInt(val) || 0 }
                                })}
                                unit="g"
                                editing={editing}
                                color="from-yellow-500 to-amber-500"
                            />
                            <TargetInput
                                label="Gorduras"
                                value={dietForm.daily_targets.fat}
                                onChange={(val) => setDietForm({
                                    ...dietForm,
                                    daily_targets: { ...dietForm.daily_targets, fat: parseInt(val) || 0 }
                                })}
                                unit="g"
                                editing={editing}
                                color="from-purple-500 to-pink-500"
                            />
                        </div>
                    </div>

                    {/* Meals Plan */}
                    <div className="card rounded-xl shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-primary">
                                🍽️ Refeições Planejadas
                            </h3>
                            {editing && (
                                <button
                                    onClick={addMealToDiet}
                                    className="btn btn-ghost p-2 text-accent"
                                >
                                    <Plus size={20} />
                                </button>
                            )}
                        </div>

                        {dietForm.meals.length === 0 ? (
                            <div className="text-center py-8 text-muted">
                                <Apple size={48} className="mx-auto mb-3 opacity-30" />
                                <p className="font-medium">Nenhuma refeição cadastrada</p>
                                {editing && (
                                    <button
                                        onClick={addMealToDiet}
                                        className="btn btn-outline mt-4"
                                    >
                                        <Plus size={18} />
                                        Adicionar Refeição
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {dietForm.meals.map((meal, mealIndex) => (
                                    <MealCard
                                        key={meal.id || mealIndex}
                                        meal={meal}
                                        mealIndex={mealIndex}
                                        editing={editing}
                                        onUpdate={updateMeal}
                                        onRemove={removeMeal}
                                        onAddFood={addFoodToMeal}
                                        onUpdateFood={updateFood}
                                        onRemoveFood={removeFood}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="card rounded-xl shadow-md">
                        <h3 className="font-bold text-lg text-primary mb-4">
                            📝 Observações
                        </h3>
                        <textarea
                            value={dietForm.notes}
                            onChange={(e) => setDietForm({ ...dietForm, notes: e.target.value })}
                            disabled={!editing}
                            className="w-full px-4 py-3 bg-secondary rounded-xl font-medium text-primary resize-none h-24 disabled:opacity-60"
                            placeholder="Anotações do nutricionista, restrições alimentares, etc."
                        />
                    </div>

                    {/* Action Buttons */}
                    {editing && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setEditing(false);
                                    if (diet) {
                                        setDietForm({
                                            nutritionist_name: diet.nutritionist_name || '',
                                            start_date: diet.start_date || '',
                                            end_date: diet.end_date || '',
                                            goal: diet.goal || 'emagrecimento',
                                            notes: diet.notes || '',
                                            daily_targets: diet.daily_targets || { calories: 2000, protein: 150, carbs: 200, fat: 65 },
                                            meals: diet.meals || []
                                        });
                                    }
                                }}
                                className="btn btn-outline flex-1 py-4"
                            >
                                <X size={20} />
                                Cancelar
                            </button>
                            <button
                                onClick={saveDiet}
                                disabled={saving}
                                className="btn btn-accent flex-1 py-4 shadow-xl"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Salvar Dieta
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ========================================
// SUB-COMPONENTS
// ========================================

const ComplianceCard = ({ compliance, goal }) => {
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreIcon = (score) => {
        if (score >= 80) return <CheckCircle size={24} className="text-green-500" />;
        if (score >= 60) return <AlertTriangle size={24} className="text-yellow-500" />;
        return <XCircle size={24} className="text-red-500" />;
    };

    const getScoreMessage = (score, goal) => {
        if (score >= 80) {
            return goal === 'emagrecimento'
                ? '🎉 Excelente! Você está no caminho certo para emagrecer!'
                : goal === 'fortalecimento'
                    ? '💪 Ótimo trabalho! Seus músculos agradecem!'
                    : '⚖️ Perfeito! Mantendo o equilíbrio!';
        }
        if (score >= 60) {
            return '⚠️ Quase lá! Ajuste algumas refeições para melhorar.';
        }
        return '📊 Suas refeições estão distantes do plano. Vamos ajustar?';
    };

    return (
        <div className="card rounded-xl shadow-lg bg-gradient-to-br from-primary to-primary-hover text-white overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-white/70 text-sm font-medium">Aderência à Dieta</p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-5xl font-black ${getScoreColor(compliance.score)}`}>
                            {compliance.score}%
                        </span>
                        {getScoreIcon(compliance.score)}
                    </div>
                </div>
                <div className="w-16 h-16 relative">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="6"
                            fill="none"
                        />
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#10B981"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${compliance.score * 1.76} 176`}
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
            </div>

            <p className="text-sm font-medium text-white/90 mb-4">
                {getScoreMessage(compliance.score, goal)}
            </p>

            {/* Macro Breakdown */}
            <div className="grid grid-cols-4 gap-2">
                {Object.entries(compliance.details).map(([key, data]) => (
                    <div key={key} className="bg-white/10 backdrop-blur rounded-xl p-2 text-center">
                        <p className="text-white/60 text-[9px] font-bold uppercase">
                            {key === 'calories' ? 'Cal' : key === 'protein' ? 'Prot' : key === 'carbs' ? 'Carb' : 'Gord'}
                        </p>
                        <p className="text-sm font-black">{data.current}/{data.target}</p>
                        <div className="w-full h-1 bg-white/20 rounded-full mt-1">
                            <div
                                className="h-full bg-accent rounded-full"
                                style={{ width: `${Math.min(100, data.compliance)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TargetInput = ({ label, value, onChange, unit, editing, color }) => (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${color} ${!editing ? 'opacity-80' : ''}`}>
        <label className="text-white/80 text-xs font-bold uppercase mb-1 block">
            {label}
        </label>
        {editing ? (
            <div className="flex items-center gap-1">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-white/20 text-white font-black text-xl rounded-lg px-2 py-1 placeholder-white/50"
                />
                <span className="text-white/70 text-sm font-bold">{unit}</span>
            </div>
        ) : (
            <p className="text-white font-black text-2xl">
                {value} <span className="text-sm font-bold opacity-70">{unit}</span>
            </p>
        )}
    </div>
);

const MealCard = ({ meal, mealIndex, editing, onUpdate, onRemove, onAddFood, onUpdateFood, onRemoveFood }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-secondary rounded-xl overflow-hidden">
            {/* Meal Header */}
            <div
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-lg">🍽️</span>
                    </div>
                    <div>
                        {editing ? (
                            <input
                                type="text"
                                value={meal.name}
                                onChange={(e) => onUpdate(mealIndex, 'name', e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="font-bold text-primary bg-transparent border-b border-primary/20 focus:border-accent outline-none"
                                placeholder="Nome da refeição"
                            />
                        ) : (
                            <p className="font-bold text-primary">{meal.name || 'Refeição'}</p>
                        )}
                        <p className="text-xs text-muted">
                            {meal.foods?.length || 0} alimentos • {meal.time || 'Horário não definido'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {editing && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(mealIndex);
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                    {expanded ? <ChevronUp size={20} className="text-muted" /> : <ChevronDown size={20} className="text-muted" />}
                </div>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="px-4 pb-4 space-y-3 animate-slide-up">
                    {/* Time */}
                    {editing && (
                        <div>
                            <label className="text-xs font-bold text-muted block mb-1">Horário</label>
                            <input
                                type="time"
                                value={meal.time}
                                onChange={(e) => onUpdate(mealIndex, 'time', e.target.value)}
                                className="px-3 py-2 bg-white rounded-lg font-medium"
                            />
                        </div>
                    )}

                    {/* Foods List */}
                    <div className="space-y-2">
                        {meal.foods?.map((food, foodIndex) => (
                            <div key={foodIndex} className="bg-white p-3 rounded-xl flex items-center gap-3">
                                {editing ? (
                                    <>
                                        <input
                                            type="text"
                                            value={food.name}
                                            onChange={(e) => onUpdateFood(mealIndex, foodIndex, 'name', e.target.value)}
                                            className="flex-1 font-medium bg-transparent outline-none"
                                            placeholder="Nome do alimento"
                                        />
                                        <input
                                            type="text"
                                            value={food.portion}
                                            onChange={(e) => onUpdateFood(mealIndex, foodIndex, 'portion', e.target.value)}
                                            className="w-20 text-sm text-muted bg-transparent outline-none"
                                            placeholder="Porção"
                                        />
                                        <button
                                            onClick={() => onRemoveFood(mealIndex, foodIndex)}
                                            className="p-1 text-red-500"
                                        >
                                            <X size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex-1 font-medium">{food.name}</span>
                                        <span className="text-sm text-muted">{food.portion}</span>
                                    </>
                                )}
                            </div>
                        ))}

                        {editing && (
                            <button
                                onClick={() => onAddFood(mealIndex)}
                                className="w-full py-2 border-2 border-dashed border-muted/30 rounded-xl text-muted text-sm font-medium flex items-center justify-center gap-2 hover:border-accent hover:text-accent transition-colors"
                            >
                                <Plus size={16} />
                                Adicionar Alimento
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const DietSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-secondary rounded-lg mx-auto" />
        <div className="h-40 bg-secondary rounded-xl" />
        <div className="h-60 bg-secondary rounded-xl" />
    </div>
);

export default Diet;
