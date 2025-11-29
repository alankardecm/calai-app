import React, { useState } from 'react';
import { workouts } from '../data';
import { ChevronDown, ChevronUp, PlayCircle } from 'lucide-react';

const Workouts = () => {
    const [expandedId, setExpandedId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-bold">Plano de Treino</h2>
            <p className="text-muted">Estrutura: Push/Pull/Legs + 1 dia Full Body</p>

            <div className="flex flex-col gap-4">
                {workouts.map((workout) => (
                    <div key={workout.id} className="bg-card overflow-hidden">
                        <button
                            onClick={() => toggleExpand(workout.id)}
                            className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                        >
                            <div>
                                <span className="text-primary text-sm font-bold uppercase tracking-wider">{workout.day}</span>
                                <h3 className="text-xl font-bold mt-1">{workout.title}</h3>
                            </div>
                            {expandedId === workout.id ? <ChevronUp /> : <ChevronDown />}
                        </button>

                        {expandedId === workout.id && (
                            <div className="p-6 pt-0 border-t border-border/50 animate-fade-in">
                                <div className="mt-4 grid gap-4">
                                    {workout.exercises.map((ex, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold">{ex.name}</p>
                                                    <p className="text-sm text-muted">{ex.sets} séries x {ex.reps}</p>
                                                </div>
                                            </div>
                                            {/* Placeholder for video button */}
                                            <button className="p-2 hover:text-primary transition-colors" title="Ver Vídeo">
                                                <PlayCircle size={24} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                                    <p className="text-sm text-secondary">
                                        <strong>Dica:</strong> Mantenha o descanso entre séries de 60-90 segundos para hipertrofia.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Workouts;
