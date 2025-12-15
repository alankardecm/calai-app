import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [todayStats, setTodayStats] = useState({
        calories: 1200,
        protein: 120,
        carbs: 200,
        fat: 45,
        mealsCount: 3
    });
    const [goals, setGoals] = useState({
        calories: 2400,
        protein: 180,
        carbs: 250,
        fat: 60
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchTodayStats();
        }
    }, [user]);

    const fetchTodayStats = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];

            // Buscar resumo do dia
            const { data: summary } = await supabase
                .from('daily_summaries')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', today)
                .single();

            if (summary) {
                setTodayStats({
                    calories: summary.total_calories || 0,
                    protein: summary.total_protein || 0,
                    carbs: summary.total_carbs || 0,
                    fat: summary.total_fat || 0,
                    mealsCount: summary.meals_count || 0
                });
            }

            // Buscar metas do perfil
            const { data: profile } = await supabase
                .from('profiles')
                .select('daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal')
                .eq('id', user.id)
                .single();

            if (profile) {
                setGoals({
                    calories: profile.daily_calorie_goal || 2400,
                    protein: profile.daily_protein_goal || 180,
                    carbs: profile.daily_carbs_goal || 250,
                    fat: profile.daily_fat_goal || 60
                });
            }
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const remainingCalories = Math.max(0, goals.calories - todayStats.calories);
    const caloriesProgress = Math.min(100, (todayStats.calories / goals.calories) * 100);

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="flex flex-col gap-6 animate-slide-up">
            {/* Calories Circular Progress */}
            <section className="flex flex-col items-center justify-center py-4">
                <div className="relative w-56 h-56">
                    {/* SVG Circular Progress */}
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        {/* Background Circle */}
                        <path
                            className="text-white/5"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        />
                        {/* Progress Circle */}
                        <path
                            className="text-primary"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray="100"
                            strokeDashoffset={100 - caloriesProgress}
                            style={{
                                filter: 'drop-shadow(0 0 6px rgba(76, 223, 32, 0.6))',
                                transition: 'stroke-dashoffset 0.6s ease-out'
                            }}
                        />
                    </svg>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-text-secondary text-sm font-medium mb-1">Restantes</span>
                        <span className="text-4xl font-extrabold tracking-tighter text-white">
                            {remainingCalories.toLocaleString('pt-BR')}
                        </span>
                        <span className="text-text-secondary text-xs font-bold uppercase tracking-widest mt-1">
                            kcal
                        </span>
                    </div>
                </div>
                <div className="flex gap-2 mt-4 text-sm font-medium">
                    <span className="text-text-secondary">
                        Meta Diária: <span className="text-white">{goals.calories.toLocaleString('pt-BR')}</span>
                    </span>
                </div>
            </section>

            {/* Macros Stats */}
            <section className="grid grid-cols-3 gap-3">
                <MacroCard
                    label="Proteína"
                    current={todayStats.protein}
                    goal={goals.protein}
                    color="protein"
                />
                <MacroCard
                    label="Carbo"
                    current={todayStats.carbs}
                    goal={goals.carbs}
                    color="carbs"
                />
                <MacroCard
                    label="Gordura"
                    current={todayStats.fat}
                    goal={goals.fat}
                    color="fat"
                />
            </section>

            {/* Today's Workout Card */}
            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Missão de Hoje</h3>
                    <Link to="/stats" className="text-primary text-sm font-bold hover:underline">
                        Ver Plano
                    </Link>
                </div>
                <WorkoutCard />
            </section>

            {/* AI Insight Message */}
            <section className="flex flex-col gap-3">
                <h3 className="text-lg font-bold text-white">Coach IA</h3>
                <AIInsightCard />
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-2 gap-3">
                <Link to="/scan" className="card card-hover flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">photo_camera</span>
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">Registrar Refeição</p>
                        <p className="text-text-secondary text-xs">Tire uma foto</p>
                    </div>
                </Link>
                <Link to="/diet" className="card card-hover flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-400">menu_book</span>
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">Minha Dieta</p>
                        <p className="text-text-secondary text-xs">Ver planejamento</p>
                    </div>
                </Link>
            </section>
        </div>
    );
};

// Macro Card Component
const MacroCard = ({ label, current, goal, color }) => {
    const percentage = Math.min(100, (current / goal) * 100);

    const colorClasses = {
        protein: 'bg-primary',
        carbs: 'bg-blue-400',
        fat: 'bg-orange-400'
    };

    return (
        <div className="card flex flex-col gap-3">
            <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">
                {label}
            </p>
            <div className="flex items-end gap-1">
                <p className="text-white text-xl font-bold leading-none">{current}</p>
                <p className="text-text-secondary text-xs font-medium mb-0.5">/ {goal}g</p>
            </div>
            <div className="progress-bar">
                <div
                    className={`progress-bar-fill ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

// Workout Card Component
const WorkoutCard = () => {
    return (
        <div className="card overflow-hidden p-0">
            {/* Image */}
            <div
                className="h-40 w-full bg-cover bg-center relative"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80")'
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/90 to-transparent" />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                    <span className="text-white text-xs font-bold uppercase">Força</span>
                </div>
            </div>
            {/* Content */}
            <div className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="text-white text-xl font-bold leading-tight">Membros Superiores</h4>
                        <p className="text-text-secondary text-sm mt-1">Supino, Elevação Lateral...</p>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 text-text-secondary">
                        <span className="material-symbols-outlined text-lg">schedule</span>
                        <span className="text-sm font-medium">45 min</span>
                    </div>
                    <button className="btn btn-primary text-sm py-2.5 px-6">
                        Iniciar Treino
                    </button>
                </div>
            </div>
        </div>
    );
};

// AI Insight Card Component
const AIInsightCard = () => {
    return (
        <div className="ai-insight">
            <div className="flex items-end gap-3 relative z-10">
                <div
                    className="w-10 h-10 rounded-full bg-cover bg-center shrink-0 border border-white/10"
                    style={{
                        backgroundImage: 'url("https://api.dicebear.com/7.x/bottts/svg?seed=coach&backgroundColor=1e2b1a")'
                    }}
                />
                <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between w-full items-center">
                        <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">
                            Insight Diário
                        </p>
                        <span className="text-text-muted text-[10px]">10:30</span>
                    </div>
                    <div className="chat-bubble-bot">
                        Ótimo trabalho batendo sua meta de proteína ontem! Para hoje, sugiro focar em
                        carboidratos complexos no almoço para ter energia no treino. 🥦⚡
                    </div>
                </div>
            </div>
        </div>
    );
};

// Skeleton Loader
const DashboardSkeleton = () => {
    return (
        <div className="flex flex-col gap-6 animate-pulse">
            {/* Circular Progress Skeleton */}
            <div className="flex justify-center py-4">
                <div className="w-56 h-56 rounded-full skeleton" />
            </div>

            {/* Macros Skeleton */}
            <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="card h-24 skeleton" />
                ))}
            </div>

            {/* Workout Skeleton */}
            <div className="card h-64 skeleton" />

            {/* AI Insight Skeleton */}
            <div className="card h-32 skeleton" />
        </div>
    );
};

export default Dashboard;
