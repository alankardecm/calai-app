import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastSystem';

const History = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [meals, setMeals] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedDay, setExpandedDay] = useState(null);

    useEffect(() => {
        if (user) {
            fetchMeals();
        }
    }, [user]);

    const fetchMeals = async () => {
        try {
            const { data, error } = await supabase
                .from('meals')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            const grouped = groupMealsByDate(data || []);
            setMeals(grouped);

            // Expandir o dia mais recente
            if (Object.keys(grouped).length > 0) {
                setExpandedDay(Object.keys(grouped)[0]);
            }
        } catch (err) {
            console.error('Erro ao buscar refeições:', err);
            toast.error('Erro ao carregar histórico');
        } finally {
            setLoading(false);
        }
    };

    const groupMealsByDate = (mealsData) => {
        const grouped = {};
        mealsData.forEach(meal => {
            const date = new Date(meal.created_at).toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'short'
            });
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(meal);
        });
        return grouped;
    };

    const calculateDayTotals = (dayMeals) => {
        return dayMeals.reduce((acc, meal) => ({
            calories: acc.calories + (meal.calories || 0),
            protein: acc.protein + (meal.protein || 0),
            carbs: acc.carbs + (meal.carbs || 0),
            fat: acc.fat + (meal.fat || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    };

    const deleteMeal = async (mealId) => {
        if (!confirm('Remover esta refeição?')) return;

        try {
            const { error } = await supabase
                .from('meals')
                .delete()
                .eq('id', mealId);

            if (error) throw error;

            toast.success('Refeição removida!');
            fetchMeals();
        } catch (err) {
            console.error('Erro ao deletar:', err);
            toast.error('Erro ao remover');
        }
    };

    if (loading) {
        return <HistorySkeleton />;
    }

    const dates = Object.keys(meals);

    return (
        <div className="flex flex-col gap-6 animate-slide-up">
            {/* Header */}
            <section className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Histórico</h1>
                    <p className="text-text-secondary text-sm font-medium">
                        Suas refeições registradas
                    </p>
                </div>
                <div className="badge badge-primary">
                    <span className="material-symbols-outlined text-sm">restaurant</span>
                    <span>{dates.reduce((acc, date) => acc + meals[date].length, 0)} refeições</span>
                </div>
            </section>

            {/* Empty State */}
            {dates.length === 0 ? (
                <EmptyHistory />
            ) : (
                <div className="flex flex-col gap-4">
                    {dates.map((date, index) => {
                        const dayMeals = meals[date];
                        const totals = calculateDayTotals(dayMeals);
                        const isToday = index === 0;
                        const isExpanded = expandedDay === date;

                        return (
                            <section key={date} className="flex flex-col gap-3">
                                {/* Day Header */}
                                <button
                                    onClick={() => setExpandedDay(isExpanded ? null : date)}
                                    className="flex items-center justify-between p-4 rounded-xl bg-surface-dark/50 border border-white/5 hover:border-primary/30 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isToday ? 'bg-primary text-surface-dark' : 'bg-white/5 text-white'}`}>
                                            <span className="material-symbols-outlined">
                                                {isToday ? 'today' : 'calendar_month'}
                                            </span>
                                        </div>
                                        <div className="text-left">
                                            <p className={`font-bold text-sm ${isToday ? 'text-primary' : 'text-white'}`}>
                                                {isToday ? 'Hoje' : date}
                                            </p>
                                            <p className="text-text-secondary text-xs">
                                                {dayMeals.length} {dayMeals.length === 1 ? 'refeição' : 'refeições'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Day Totals */}
                                        <div className="flex gap-3 text-xs font-bold">
                                            <span className="text-orange-400">{totals.calories} kcal</span>
                                            <span className="text-primary">{totals.protein}g P</span>
                                        </div>
                                        <span className={`material-symbols-outlined text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                            expand_more
                                        </span>
                                    </div>
                                </button>

                                {/* Meals List */}
                                {isExpanded && (
                                    <div className="flex flex-col gap-3 animate-fade-in pl-2">
                                        {dayMeals.map((meal) => (
                                            <MealCard
                                                key={meal.id}
                                                meal={meal}
                                                onDelete={() => deleteMeal(meal.id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Meal Card Component
const MealCard = ({ meal, onDelete }) => {
    const time = new Date(meal.created_at).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const getComplianceColor = (compliance) => {
        switch (compliance) {
            case 'good': return 'bg-primary/20 text-primary border-primary/30';
            case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'bad': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-white/5 text-text-secondary border-white/10';
        }
    };

    return (
        <div className="card flex gap-4 group">
            {/* Image */}
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-surface-darker shrink-0">
                {meal.image_url ? (
                    <img
                        src={meal.image_url}
                        alt={meal.food_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-text-muted">restaurant</span>
                    </div>
                )}
                {meal.confidence && (
                    <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                        {Math.round(meal.confidence * 100)}%
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold text-sm leading-tight truncate">
                            {meal.food_name}
                        </h4>
                        <p className="text-text-secondary text-xs mt-0.5">
                            {time} • {meal.portion_grams || '--'}g
                        </p>
                    </div>
                    <button
                        onClick={onDelete}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 transition-all"
                    >
                        <span className="material-symbols-outlined text-lg text-red-400">delete</span>
                    </button>
                </div>

                {/* Macros */}
                <div className="flex items-center gap-3">
                    <MacroBadge value={meal.calories} unit="kcal" color="text-orange-400" />
                    <MacroBadge value={meal.protein} unit="P" color="text-primary" />
                    <MacroBadge value={meal.carbs} unit="C" color="text-blue-400" />
                    <MacroBadge value={meal.fat} unit="G" color="text-yellow-400" />
                </div>

                {/* Compliance Tag */}
                {meal.diet_compliance && (
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-2 border ${getComplianceColor(meal.diet_compliance)}`}>
                        <span className="material-symbols-outlined text-[12px]">
                            {meal.diet_compliance === 'good' ? 'check_circle' :
                                meal.diet_compliance === 'warning' ? 'warning' : 'cancel'}
                        </span>
                        {meal.diet_compliance === 'good' ? 'Na meta' :
                            meal.diet_compliance === 'warning' ? 'Atenção' : 'Fora da meta'}
                    </div>
                )}
            </div>
        </div>
    );
};

const MacroBadge = ({ value, unit, color }) => (
    <span className={`text-xs font-bold ${color}`}>
        {value || 0}{unit}
    </span>
);

// Empty State
const EmptyHistory = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-surface-dark flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-4xl text-text-muted">history</span>
        </div>
        <h3 className="text-white font-bold text-lg mb-2">Nenhuma refeição</h3>
        <p className="text-text-secondary text-sm max-w-[250px]">
            Comece tirando uma foto da sua primeira refeição para acompanhar seu progresso.
        </p>
    </div>
);

// Skeleton
const HistorySkeleton = () => (
    <div className="flex flex-col gap-6 animate-pulse">
        <div className="flex justify-between">
            <div className="h-8 w-32 skeleton rounded" />
            <div className="h-6 w-24 skeleton rounded-full" />
        </div>
        {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
                <div className="h-16 skeleton rounded-xl" />
                <div className="h-24 skeleton rounded-xl ml-2" />
            </div>
        ))}
    </div>
);

export default History;
