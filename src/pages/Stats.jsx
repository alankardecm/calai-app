import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Flame, Activity, Calendar, Award } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const Stats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('week'); // week, month, year
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user, period]);

    const fetchStats = async () => {
        try {
            const { data: meals, error } = await supabase
                .from('meals')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Calcular estatísticas
            const computed = computeStats(meals || [], period);
            setStats(computed);
        } catch (err) {
            console.error('Erro ao buscar stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const computeStats = (meals, periodType) => {
        if (meals.length === 0) return null;

        const now = new Date();
        const periodStart = new Date();

        switch (periodType) {
            case 'week':
                periodStart.setDate(now.getDate() - 7);
                break;
            case 'month':
                periodStart.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                periodStart.setFullYear(now.getFullYear() - 1);
                break;
        }

        const periodMeals = meals.filter(m => new Date(m.created_at) >= periodStart);

        const totals = periodMeals.reduce((acc, meal) => ({
            calories: acc.calories + (meal.calories || 0),
            protein: acc.protein + (meal.protein || 0),
            carbs: acc.carbs + (meal.carbs || 0),
            fat: acc.fat + (meal.fat || 0),
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        const avgPerDay = {
            calories: Math.round(totals.calories / 7),
            protein: Math.round(totals.protein / 7),
            carbs: Math.round(totals.carbs / 7),
            fat: Math.round(totals.fat / 7),
        };

        // Streak calculation (dias consecutivos)
        const streak = calculateStreak(meals);

        return {
            totalMeals: periodMeals.length,
            totals,
            avgPerDay,
            streak,
            topFood: findTopFood(periodMeals),
            healthScore: calculateHealthScore(periodMeals),
        };
    };

    const calculateStreak = (meals) => {
        if (meals.length === 0) return 0;

        let streak = 1;
        const today = new Date().toDateString();

        for (let i = 0; i < meals.length - 1; i++) {
            const current = new Date(meals[i].created_at).toDateString();
            const next = new Date(meals[i + 1].created_at).toDateString();

            if (current === today || current === next) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    };

    const findTopFood = (meals) => {
        const foodCount = meals.reduce((acc, meal) => {
            acc[meal.food_name] = (acc[meal.food_name] || 0) + 1;
            return acc;
        }, {});

        const sorted = Object.entries(foodCount).sort((a, b) => b[1] - a[1]);
        return sorted[0]?.[0] || 'Nenhum';
    };

    const calculateHealthScore = (meals) => {
        // Score simples baseado em proteína e calorias balanceadas
        if (meals.length === 0) return 0;

        const avgProtein = meals.reduce((sum, m) => sum + m.protein, 0) / meals.length;
        const avgCalories = meals.reduce((sum, m) => sum + m.calories, 0) / meals.length;

        const proteinScore = Math.min(avgProtein / 30, 1); // Ideal: 30g+
        const calorieScore = avgCalories > 200 && avgCalories < 600 ? 1 : 0.5;

        return Math.round((proteinScore + calorieScore) / 2 * 100);
    };

    if (loading) {
        return <StatsSkeleton />;
    }

    if (!stats) {
        return <EmptyStats />;
    }

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="text-center space-y-3 pt-2">
                <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-bold">
                    <Activity size={16} />
                    <span>Seus Insights</span>
                </div>
                <h2 className="text-4xl font-black text-primary leading-tight">
                    Estatísticas
                </h2>
            </div>

            {/* Period Selector */}
            <div className="flex gap-2 p-1 bg-secondary rounded-2xl">
                {[
                    { value: 'week', label: '7 Dias' },
                    { value: 'month', label: '30 Dias' },
                    { value: 'year', label: '1 Ano' }
                ].map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => setPeriod(value)}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${period === value
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-muted hover:text-primary'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <MetricCard
                    icon={Flame}
                    label="Calorias Totais"
                    value={stats.totals.calories.toLocaleString()}
                    unit="kcal"
                    gradient="from-orange-500 to-red-500"
                />
                <MetricCard
                    icon={Target}
                    label="Refeições"
                    value={stats.totalMeals}
                    unit="rastreadas"
                    gradient="from-accent to-emerald-600"
                />
                <MetricCard
                    icon={Award}
                    label="Sequência"
                    value={stats.streak}
                    unit="dias"
                    gradient="from-purple-500 to-pink-500"
                />
                <MetricCard
                    icon={Activity}
                    label="Health Score"
                    value={stats.healthScore}
                    unit="%"
                    gradient="from-blue-500 to-cyan-500"
                />
            </div>

            {/* Daily Averages */}
            <div className="card rounded-xl shadow-md">
                <h3 className="text-xl font-black text-primary mb-4 flex items-center gap-2">
                    <Calendar size={22} />
                    Média Diária
                </h3>
                <div className="space-y-4">
                    <MacroBar
                        label="Calorias"
                        value={stats.avgPerDay.calories}
                        max={2000}
                        unit="kcal"
                        color="bg-gradient-to-r from-orange-500 to-red-500"
                    />
                    <MacroBar
                        label="Proteínas"
                        value={stats.avgPerDay.protein}
                        max={150}
                        unit="g"
                        color="bg-gradient-to-r from-blue-500 to-cyan-500"
                    />
                    <MacroBar
                        label="Carboidratos"
                        value={stats.avgPerDay.carbs}
                        max={250}
                        unit="g"
                        color="bg-gradient-to-r from-yellow-500 to-amber-500"
                    />
                    <MacroBar
                        label="Gorduras"
                        value={stats.avgPerDay.fat}
                        max={70}
                        unit="g"
                        color="bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                </div>
            </div>

            {/* Insights */}
            <div className="card rounded-xl shadow-md bg-gradient-to-br from-primary to-primary-hover text-white">
                <h3 className="text-xl font-black mb-3 flex items-center gap-2">
                    <TrendingUp size={22} />
                    Insights
                </h3>
                <div className="space-y-3">
                    <InsightItem
                        text={`Você rastreou ${stats.totalMeals} refeições nos últimos ${period === 'week' ? '7 dias' : period === 'month' ? '30 dias' : 'ano'}`}
                    />
                    <InsightItem
                        text={`Seu alimento mais consumido: ${stats.topFood}`}
                    />
                    <InsightItem
                        text={`Sequência atual: ${stats.streak} ${stats.streak === 1 ? 'dia' : 'dias'} consecutivos 🔥`}
                    />
                    {stats.healthScore >= 70 && (
                        <InsightItem
                            text="Excelente! Suas escolhas estão muito saudáveis ✨"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// ========================================
// SUB-COMPONENTS
// ========================================

const MetricCard = ({ icon: Icon, label, value, unit, gradient }) => (
    <div className="card rounded-xl shadow-md overflow-hidden relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-lg`}>
                <Icon size={24} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="text-3xl font-black text-primary mb-1">
                {value}
            </div>
            <div className="text-xs text-muted font-bold uppercase tracking-wider">
                {label}
            </div>
            {unit && (
                <div className="text-[10px] text-muted/60 font-semibold mt-0.5">
                    {unit}
                </div>
            )}
        </div>
    </div>
);

const MacroBar = ({ label, value, max, unit, color }) => {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-primary">{label}</span>
                <span className="text-sm font-black text-primary">
                    {value}{unit}
                </span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

const InsightItem = ({ text }) => (
    <div className="flex items-start gap-3 text-white/90">
        <div className="w-1.5 h-1.5 bg-white/70 rounded-full mt-2 shrink-0" />
        <p className="text-sm leading-relaxed font-medium">{text}</p>
    </div>
);

const EmptyStats = () => (
    <div className="empty-state animate-fade-in">
        <div className="empty-state-icon">
            <Activity size={40} strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-bold text-primary mb-2">
            Dados insuficientes
        </h3>
        <p className="text-muted max-w-[280px] mx-auto leading-relaxed">
            Rastreie mais refeições para ver suas estatísticas e insights
        </p>
    </div>
);

const StatsSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-32 skeleton rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 skeleton rounded-xl" />
            ))}
        </div>
        <div className="h-64 skeleton rounded-xl" />
    </div>
);

export default Stats;
