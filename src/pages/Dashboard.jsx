import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Target, Calendar } from 'lucide-react';
import { userProfile, workouts, dietPlan } from '../data';

const Dashboard = () => {
    const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
    const dayMap = {
        'segunda-feira': 'Segunda',
        'terça-feira': 'Terça',
        'quarta-feira': 'Quarta',
        'quinta-feira': 'Quinta',
        'sexta-feira': 'Sexta/Sábado',
        'sábado': 'Sexta/Sábado',
        'domingo': 'Descanso'
    };

    const currentDayKey = dayMap[today.toLowerCase()] || 'Segunda';
    const todaysWorkout = workouts.find(w => w.day.includes(currentDayKey)) || workouts[0];

    return (
        <div className="flex flex-col gap-8">
            <section className="text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">Olá, {userProfile.name} 👋</h2>
                <p className="text-muted">Vamos esmagar as metas de hoje!</p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={<Target className="text-secondary" />}
                    label="Meta de Peso"
                    value={userProfile.stats.goalWeight}
                    sub="Atual: 100-110kg"
                />
                <StatCard
                    icon={<Flame className="text-primary" />}
                    label="Calorias Diárias"
                    value={dietPlan.macros.calories}
                    sub={`Proteína: ${dietPlan.macros.protein}`}
                />
                <StatCard
                    icon={<Calendar className="text-orange-500" />}
                    label="Semana"
                    value="1 de 12"
                    sub="Foco Total"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Today's Workout */}
                <div className="bg-card p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="w-2 h-8 bg-primary rounded-full"></span>
                            Treino de Hoje
                        </h3>
                        <span className="text-sm text-muted uppercase tracking-wider">{currentDayKey}</span>
                    </div>

                    <div className="py-4">
                        <h4 className="text-2xl font-bold text-white mb-1">{todaysWorkout.title}</h4>
                        <p className="text-muted">{todaysWorkout.exercises.length} Exercícios</p>
                    </div>

                    <Link to="/workouts" className="btn btn-primary mt-auto">
                        Ver Treino Completo <ArrowRight size={18} />
                    </Link>
                </div>

                {/* Next Meal */}
                <div className="bg-card p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="w-2 h-8 bg-secondary rounded-full"></span>
                            Próxima Refeição
                        </h3>
                    </div>

                    <div className="py-4">
                        <h4 className="text-2xl font-bold text-white mb-1">{dietPlan.meals[0].name}</h4>
                        <p className="text-muted">{dietPlan.meals[0].calories}</p>
                        <ul className="mt-2 text-sm text-muted list-disc list-inside">
                            {dietPlan.meals[0].items.slice(0, 2).map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <Link to="/nutrition" className="btn btn-outline mt-auto">
                        Ver Dieta <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, sub }) => (
    <div className="bg-card p-4 flex items-center gap-4">
        <div className="p-3 bg-white/5 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-muted">{label}</p>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted opacity-70">{sub}</p>
        </div>
    </div>
);

export default Dashboard;
