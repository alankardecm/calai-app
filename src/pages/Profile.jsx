import React from 'react';
import { userProfile } from '../data';
import { User, Ruler, Weight, TrendingUp } from 'lucide-react';

const Profile = () => {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-black">
                    <User size={48} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold">{userProfile.name}</h2>
                    <p className="text-muted">Focado em Transformação</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Ruler className="text-primary" size={20} /> Medidas Atuais
                    </h3>
                    <div className="space-y-3">
                        <StatRow label="Idade" value={userProfile.stats.age} />
                        <StatRow label="Altura" value={userProfile.stats.height} />
                        <StatRow label="Peso" value={userProfile.stats.weight} />
                        <StatRow label="Gordura" value={userProfile.stats.bodyFat} />
                    </div>
                </div>

                <div className="bg-card p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <TargetIcon className="text-secondary" size={20} /> Metas
                    </h3>
                    <div className="space-y-3">
                        <StatRow label="Peso Meta" value={userProfile.stats.goalWeight} highlight />
                        <StatRow label="Gordura Meta" value={userProfile.stats.goalBodyFat} highlight />
                    </div>
                </div>

                <div className="bg-card p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="text-orange-500" size={20} /> Objetivos
                    </h3>
                    <ul className="space-y-3">
                        {userProfile.goals.map((goal, i) => (
                            <li key={i} className="text-sm text-muted flex gap-2">
                                <span className="text-primary">•</span> {goal}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const StatRow = ({ label, value, highlight }) => (
    <div className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
        <span className="text-muted text-sm">{label}</span>
        <span className={`font-bold ${highlight ? 'text-primary' : 'text-white'}`}>{value}</span>
    </div>
);

const TargetIcon = ({ className, size }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
    </svg>
);

export default Profile;
