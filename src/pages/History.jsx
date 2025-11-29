import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Flame, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const History = () => {
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupedMeals, setGroupedMeals] = useState({});
    const { user } = useAuth();

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
                .order('created_at', { ascending: false });

            if (error) throw error;

            setMeals(data || []);
            groupMealsByDate(data || []);
        } catch (err) {
            console.error('Erro ao buscar refeições:', err);
        } finally {
            setLoading(false);
        }
    };

    const groupMealsByDate = (mealsData) => {
        const grouped = mealsData.reduce((acc, meal) => {
            const date = new Date(meal.created_at).toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(meal);
            return acc;
        }, {});

        setGroupedMeals(grouped);
    };

    const calculateDayTotals = (dayMeals) => {
        return dayMeals.reduce((totals, meal) => ({
            calories: totals.calories + (meal.calories || 0),
            protein: totals.protein + (meal.protein || 0),
            carbs: totals.carbs + (meal.carbs || 0),
            fat: totals.fat + (meal.fat || 0),
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    };

    const deleteMeal = async (mealId) => {
        if (!confirm('Tem certeza que deseja excluir esta refeição?')) return;

        try {
            const { error } = await supabase
                .from('meals')
                .delete()
                .eq('id', mealId);

            if (error) throw error;

            // Atualizar estado local
            const updatedMeals = meals.filter(m => m.id !== mealId);
            setMeals(updatedMeals);
            groupMealsByDate(updatedMeals);

        } catch (err) {
            console.error('Erro ao deletar:', err);
            alert('Erro ao excluir refeição');
        }
    };

    if (loading) {
        return <HistorySkeleton />;
    }

    if (meals.length === 0) {
        return <EmptyHistory />;
    }

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="text-center space-y-3 pt-2">
                <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full text-sm font-bold">
                    <Calendar size={16} />
                    <span>Seu Histórico</span>
                </div>
                <h2 className="text-4xl font-black text-primary leading-tight">
                    Refeições Registradas
                </h2>
                <p className="text-muted text-base font-medium">
                    {meals.length} {meals.length === 1 ? 'refeição rastreada' : 'refeições rastreadas'}
                </p>
            </div>

            {/* Grouped Timeline */}
            <div className="space-y-8">
                {Object.entries(groupedMeals).map(([date, dayMeals]) => {
                    const totals = calculateDayTotals(dayMeals);
                    const isToday = date.includes(new Date().toLocaleDateString('pt-BR', { day: 'numeric' }));

                    return (
                        <DaySection
                            key={date}
                            date={date}
                            isToday={isToday}
                            meals={dayMeals}
                            totals={totals}
                            onDelete={deleteMeal}
                        />
                    );
                })}
            </div>
        </div>
    );
};

// ========================================
// SUB-COMPONENTS
// ========================================

const DaySection = ({ date, isToday, meals, totals, onDelete }) => {
    const [expanded, setExpanded] = useState(isToday);

    return (
        <div className="space-y-4">
            {/* Day Header */}
            <div className="card rounded-xl shadow-md p-5 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isToday ? 'bg-accent animate-pulse' : 'bg-muted/30'}`} />
                        <div>
                            <h3 className="font-black text-lg text-primary capitalize">
                                {isToday ? 'Hoje' : date.split(',')[0]}
                            </h3>
                            <p className="text-xs text-muted font-semibold">
                                {!isToday && date.split(',').slice(1).join(',')}
                                {' • '}
                                {meals.length} {meals.length === 1 ? 'refeição' : 'refeições'}
                            </p>
                        </div>
                    </div>
                    <ChevronDown
                        size={20}
                        className={`text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                </div>

                {/* Day Totals */}
                <div className="grid grid-cols-4 gap-2">
                    <DayTotalBadge icon={Flame} value={totals.calories} label="kcal" />
                    <DayTotalBadge value={totals.carbs} label="Carb" unit="g" />
                    <DayTotalBadge value={totals.protein} label="Prot" unit="g" />
                    <DayTotalBadge value={totals.fat} label="Gord" unit="g" />
                </div>
            </div>

            {/* Meals List */}
            {expanded && (
                <div className="space-y-3 pl-4 animate-slide-up">
                    {meals.map((meal) => (
                        <MealCard key={meal.id} meal={meal} onDelete={onDelete} />
                    ))}
                </div>
            )}
        </div>
    );
};

const DayTotalBadge = ({ icon: Icon, value, label, unit }) => (
    <div className="flex flex-col items-center p-3 bg-secondary rounded-xl">
        <div className="flex items-center gap-1 mb-1">
            {Icon && <Icon size={14} className="text-accent" />}
            <span className="text-lg font-black text-primary">
                {Math.round(value)}
            </span>
        </div>
        <span className="text-[9px] text-muted font-bold uppercase tracking-wider">
            {label}
        </span>
    </div>
);

const MealCard = ({ meal, onDelete }) => {
    const [showActions, setShowActions] = useState(false);
    const time = new Date(meal.created_at).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div
            className="card rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
            onClick={() => setShowActions(!showActions)}
        >
            <div className="flex gap-4">
                {/* Image Thumbnail */}
                {meal.image_url && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary shrink-0">
                        <img
                            src={meal.image_url}
                            alt={meal.food_name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-primary truncate">
                                {meal.food_name}
                            </h4>
                            <p className="text-xs text-muted font-semibold">
                                {time}
                            </p>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                            <div className="text-lg font-black text-primary">
                                {meal.calories}
                            </div>
                            <div className="text-[9px] text-muted font-bold uppercase">
                                kcal
                            </div>
                        </div>
                    </div>

                    {/* Macros Mini */}
                    <div className="flex gap-3 text-xs">
                        <MacroMini label="C" value={meal.carbs} />
                        <MacroMini label="P" value={meal.protein} />
                        <MacroMini label="G" value={meal.fat} />
                    </div>
                </div>
            </div>

            {/* Actions Overlay */}
            {showActions && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center gap-3 animate-scale-in">
                    <button
                        className="btn btn-ghost p-3 rounded-xl hover:bg-secondary"
                        onClick={(e) => {
                            e.stopPropagation();
                            alert('Funcionalidade de edição em desenvolvimento');
                        }}
                    >
                        <Edit2 size={20} className="text-primary" />
                    </button>
                    <button
                        className="btn btn-ghost p-3 rounded-xl hover:bg-red-50"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(meal.id);
                        }}
                    >
                        <Trash2 size={20} className="text-red-500" />
                    </button>
                </div>
            )}
        </div>
    );
};

const MacroMini = ({ label, value }) => (
    <div className="flex items-center gap-1 text-muted font-semibold">
        <span className="text-[10px] uppercase">{label}</span>
        <span className="font-black text-primary">{Math.round(value)}g</span>
    </div>
);

const EmptyHistory = () => (
    <div className="empty-state animate-fade-in">
        <div className="empty-state-icon">
            <Calendar size={40} strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-bold text-primary mb-2">
            Nenhuma refeição ainda
        </h3>
        <p className="text-muted max-w-[280px] mx-auto leading-relaxed">
            Comece a rastrear suas refeições usando a câmera no scanner
        </p>
    </div>
);

const HistorySkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-32 skeleton rounded-xl" />
        {[1, 2, 3].map(i => (
            <div key={i} className="space-y-3">
                <div className="h-24 skeleton rounded-xl" />
                <div className="h-20 skeleton rounded-xl ml-4" />
            </div>
        ))}
    </div>
);

export default History;
