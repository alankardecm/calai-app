import React from 'react';
import { dietPlan } from '../data';
import { PieChart } from 'lucide-react';
import FoodRecognition from '../components/FoodRecognition';

const Nutrition = () => {
    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-bold">Plano Alimentar</h2>

            <FoodRecognition />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MacroCard label="Proteína" value={dietPlan.macros.protein} color="text-primary" />
                <MacroCard label="Carboidratos" value={dietPlan.macros.carbs} color="text-secondary" />
                <MacroCard label="Gorduras" value={dietPlan.macros.fats} color="text-orange-500" />
                <MacroCard label="Calorias" value={dietPlan.macros.calories} color="text-white" />
            </div>

            <div className="space-y-6 mt-4">
                {dietPlan.meals.map((meal) => (
                    <div key={meal.id} className="bg-card p-6 rounded-xl border border-border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">{meal.name}</h3>
                            <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium">{meal.calories}</span>
                        </div>
                        <ul className="space-y-3">
                            {meal.items.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-muted">
                                    <span className="w-1.5 h-1.5 mt-2 bg-primary rounded-full flex-shrink-0"></span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="p-6 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl border border-primary/20">
                <h3 className="font-bold text-lg mb-2 text-white">Regras de Ouro</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
                    <li>Beba 4–5 L de água por dia.</li>
                    <li>Zero refrigerante, álcool, doces, frituras (90% do tempo).</li>
                    <li>Pese-se toda segunda de manhã em jejum.</li>
                </ul>
            </div>
        </div>
    );
};

const MacroCard = ({ label, value, color }) => (
    <div className="bg-card p-4 flex flex-col items-center justify-center text-center gap-1">
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
        <span className="text-xs text-muted uppercase tracking-wider">{label}</span>
    </div>
);

export default Nutrition;
