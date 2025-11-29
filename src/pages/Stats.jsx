import React from 'react';
import { TrendingUp, Activity } from 'lucide-react';

const Stats = () => {
    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-extrabold">Estatísticas</h2>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-card p-5 rounded-2xl flex flex-col gap-2">
                    <span className="text-muted text-sm font-bold uppercase">Média Diária</span>
                    <span className="text-3xl font-extrabold">1.850</span>
                    <span className="text-xs text-muted">kcal / dia</span>
                </div>
                <div className="bg-card p-5 rounded-2xl flex flex-col gap-2">
                    <span className="text-muted text-sm font-bold uppercase">Meta</span>
                    <span className="text-3xl font-extrabold text-accent">2.000</span>
                    <span className="text-xs text-muted">kcal / dia</span>
                </div>
            </div>

            <div className="bg-card p-6 rounded-2xl h-64 flex flex-col items-center justify-center text-muted gap-4 border-dashed border-2 border-border">
                <Activity size={48} className="opacity-20" />
                <p>Gráfico de consumo semanal em breve</p>
            </div>
        </div>
    );
};

export default Stats;
