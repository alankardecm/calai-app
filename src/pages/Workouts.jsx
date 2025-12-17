import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { workouts } from '../data';

const Workouts = () => {
    const navigate = useNavigate();
    const [isStarting, setIsStarting] = useState(false);

    // Calcular a semana atual e datas dinamicamente
    const { currentWeek, weekDays, dates, todayDayIndex } = useMemo(() => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda...
        const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Converter para 0 = segunda

        // Calcular o início da semana (segunda-feira)
        const monday = new Date(today);
        monday.setDate(today.getDate() - todayIndex);

        // Gerar as datas da semana
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            weekDates.push(d.getDate());
        }

        // Calcular número da semana do mês
        const weekNum = Math.ceil(today.getDate() / 7);

        return {
            currentWeek: weekNum,
            weekDays: ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'],
            dates: weekDates,
            todayDayIndex: todayIndex
        };
    }, []);

    const [selectedDay, setSelectedDay] = useState(todayDayIndex);

    // Mapear treinos por índice de dia
    const workoutsByDay = {
        0: workouts.find(w => w.id === 'push'),
        1: workouts.find(w => w.id === 'pull'),
        2: workouts.find(w => w.id === 'rest1'),
        3: workouts.find(w => w.id === 'legs'),
        4: workouts.find(w => w.id === 'fullbody'),
        5: workouts.find(w => w.id === 'fullbody'),
        6: null // Domingo - Descanso total
    };

    const todayWorkout = workoutsByDay[selectedDay];

    // Categorizar exercícios
    const warmupExercises = todayWorkout?.exercises?.slice(0, 1) || [];
    const mainExercises = todayWorkout?.exercises?.slice(1) || [];

    // Calcular próximos dias dinamicamente
    const upcomingDays = useMemo(() => {
        const upcoming = [];
        for (let i = 1; i <= 2; i++) {
            const nextDayIndex = (selectedDay + i) % 7;
            const nextWorkout = workoutsByDay[nextDayIndex];
            if (nextWorkout) {
                upcoming.push({
                    id: nextWorkout.id,
                    name: nextWorkout.title,
                    exercises: nextWorkout.exercises?.length || 0,
                    duration: nextWorkout.duration || 45,
                    dayLabel: weekDays[nextDayIndex]
                });
            } else {
                upcoming.push({
                    id: 'rest',
                    name: 'Descanso Ativo',
                    description: 'Mobilidade & Cardio Leve',
                    dayLabel: weekDays[nextDayIndex]
                });
            }
        }
        return upcoming;
    }, [selectedDay]);

    // Handler para iniciar treino
    const handleStartWorkout = () => {
        setIsStarting(true);
        // Simular início do treino
        setTimeout(() => {
            alert(`🏋️ Treino "${todayWorkout?.title}" iniciado!\n\nEm breve: cronômetro, tracking de séries e mais!`);
            setIsStarting(false);
        }, 500);
    };

    const getWorkoutTagColor = (title) => {
        if (title?.includes('Push')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        if (title?.includes('Pull')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        if (title?.includes('Legs')) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        if (title?.includes('Full')) return 'bg-primary/20 text-primary border-primary/30';
        return 'bg-text-muted/20 text-text-muted border-text-muted/30';
    };

    return (
        <div className="min-h-screen bg-background-dark pb-24">
            {/* Header com Semana */}
            <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <span className="text-primary text-xs font-bold uppercase tracking-wider">Semana {currentWeek}</span>
                        <h1 className="text-2xl font-bold text-white mt-1">Seu Plano AI</h1>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-surface-dark flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">refresh</span>
                    </button>
                </div>

                {/* Calendário Semanal */}
                <div className="flex justify-between">
                    {weekDays.map((day, index) => {
                        const isSelected = selectedDay === index;
                        const isToday = index === todayDayIndex;
                        const isCompleted = index < todayDayIndex;

                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(index)}
                                className="flex flex-col items-center gap-1"
                            >
                                <span className={`text-xs font-medium ${isSelected ? 'text-primary' : isToday ? 'text-white' : 'text-text-muted'
                                    }`}>
                                    {day}
                                </span>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSelected
                                    ? 'bg-primary text-background-dark font-bold'
                                    : isCompleted
                                        ? 'bg-surface-dark text-primary border border-primary/30'
                                        : isToday
                                            ? 'bg-surface-dark text-white border-2 border-primary'
                                            : 'bg-surface-dark text-white'
                                    }`}>
                                    {isCompleted && !isSelected ? (
                                        <span className="material-symbols-outlined text-sm">check</span>
                                    ) : (
                                        dates[index]
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* AI Insight Card */}
            <div className="px-6 mb-6">
                <div className="bg-gradient-to-r from-blue-500/10 to-primary/10 rounded-xl p-4 border border-blue-500/20">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-blue-400">auto_awesome</span>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                                Insight da IA
                            </h4>
                            <p className="text-text-secondary text-sm mt-1 leading-relaxed">
                                Detectamos fadiga muscular no treino anterior. O volume de pernas hoje foi ajustado (-10%) para otimizar sua recuperação sem perder intensidade.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Treino de Hoje */}
            {todayWorkout && todayWorkout.id !== 'rest1' ? (
                <div className="px-6">
                    <h2 className="text-xl font-bold text-white mb-4">Treino de Hoje</h2>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getWorkoutTagColor(todayWorkout.title)}`}>
                            <span className="material-symbols-outlined text-sm mr-1 align-middle">fitness_center</span>
                            {todayWorkout.title?.split('(')[0]?.trim()}
                        </span>
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface-dark text-text-secondary border border-white/10">
                            <span className="material-symbols-outlined text-sm mr-1 align-middle">schedule</span>
                            55 min
                        </span>
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            <span className="material-symbols-outlined text-sm mr-1 align-middle">local_fire_department</span>
                            Alta intensidade
                        </span>
                    </div>

                    {/* Aquecimento */}
                    {warmupExercises.length > 0 && (
                        <div className="mb-4">
                            <span className="text-text-muted text-xs uppercase tracking-wider mb-3 block text-center">Aquecimento</span>
                            {warmupExercises.map((exercise, index) => (
                                <ExerciseCard key={index} exercise={exercise} index={index} isWarmup />
                            ))}
                        </div>
                    )}

                    {/* Principal */}
                    <div className="mb-6">
                        <span className="text-primary text-xs uppercase tracking-wider mb-3 block text-center">Principal</span>
                        {mainExercises.map((exercise, index) => (
                            <ExerciseCard
                                key={index}
                                exercise={exercise}
                                index={index}
                                badge={index === 0 ? 'PESADO' : index === mainExercises.length - 1 ? 'DROP-SET' : null}
                            />
                        ))}
                    </div>

                    {/* Botão Iniciar Treino */}
                    <button
                        onClick={handleStartWorkout}
                        disabled={isStarting}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-glow mb-8 ${isStarting ? 'bg-primary/50 text-background-dark/50' : 'bg-primary hover:bg-primary-dark text-background-dark'}`}
                    >
                        {isStarting ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">sync</span>
                                INICIANDO...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">play_arrow</span>
                                INICIAR TREINO
                            </>
                        )}
                    </button>
                </div>
            ) : (
                /* Dia de Descanso */
                <div className="px-6">
                    <div className="bg-surface-dark rounded-2xl p-8 text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-4xl">self_improvement</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Dia de Descanso Ativo</h2>
                        <p className="text-text-secondary mb-6">
                            Hoje é dia de recuperação! Faça uma caminhada leve ou alongamentos para manter o corpo ativo.
                        </p>
                        <button className="px-6 py-3 bg-primary/10 text-primary rounded-xl font-medium border border-primary/30">
                            Ver Sugestões de Mobilidade
                        </button>
                    </div>
                </div>
            )}

            {/* Próximos Dias */}
            <div className="px-6 mt-8">
                <h3 className="text-lg font-bold text-white mb-4">Próximos Dias</h3>
                <div className="space-y-3">
                    {upcomingDays.map((day, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedDay((selectedDay + index + 1) % 7)}
                            className="w-full flex items-center justify-between p-4 bg-surface-dark rounded-xl hover:bg-surface-light transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                    {day.dayLabel}
                                </div>
                                <div className="text-left">
                                    <h4 className="text-white font-medium text-sm">{day.name}</h4>
                                    <p className="text-text-secondary text-xs">
                                        {day.exercises ? `${day.exercises} exercícios • ${day.duration} min` : day.description}
                                    </p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-primary">chevron_right</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Componente de Card de Exercício
const ExerciseCard = ({ exercise, index, isWarmup = false, badge = null }) => {
    const getBadgeColor = (badge) => {
        switch (badge) {
            case 'PESADO': return 'bg-red-500/20 text-red-400';
            case 'DROP-SET': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-primary/20 text-primary';
        }
    };

    return (
        <div className="flex items-center gap-4 p-4 bg-surface-dark rounded-xl mb-3 relative">
            {/* Imagem placeholder */}
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${isWarmup ? 'bg-yellow-500/10' : 'bg-primary/10'
                }`}>
                <span className={`material-symbols-outlined text-2xl ${isWarmup ? 'text-yellow-500' : 'text-primary'
                    }`}>
                    {isWarmup ? 'exercise' : 'fitness_center'}
                </span>
            </div>

            {/* Info */}
            <div className="flex-1">
                <h4 className="text-white font-medium">{exercise.name}</h4>
                <p className="text-text-muted text-sm">
                    {exercise.sets} séries x {exercise.reps}
                    {badge && (
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor(badge)}`}>
                            {badge}
                        </span>
                    )}
                </p>
            </div>

            {/* Info button */}
            <button className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-sm">info</span>
            </button>
        </div>
    );
};

export default Workouts;
