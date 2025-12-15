import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastSystem';

const Profile = () => {
    const { user, signOut } = useAuth();
    const toast = useToast();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        weight_kg: '',
        height_cm: '',
        daily_calorie_goal: 2400,
        daily_protein_goal: 180,
        daily_carbs_goal: 250,
        daily_fat_goal: 60,
    });

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setProfile(data);
                setFormData({
                    full_name: data.full_name || '',
                    weight_kg: data.weight_kg || '',
                    height_cm: data.height_cm || '',
                    daily_calorie_goal: data.daily_calorie_goal || 2400,
                    daily_protein_goal: data.daily_protein_goal || 180,
                    daily_carbs_goal: data.daily_carbs_goal || 250,
                    daily_fat_goal: data.daily_fat_goal || 60,
                });
            }
        } catch (err) {
            console.error('Erro ao buscar perfil:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert([{
                    id: user.id,
                    ...formData,
                    updated_at: new Date().toISOString()
                }]);

            if (error) throw error;

            toast.success('✅ Perfil atualizado com sucesso!');
            setEditing(false);
            fetchProfile();
        } catch (err) {
            console.error('Erro ao salvar:', err);
            toast.error('❌ Erro ao atualizar perfil');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        if (confirm('Tem certeza que deseja sair?')) {
            await signOut();
        }
    };

    if (loading) {
        return <ProfileSkeleton />;
    }

    return (
        <div className="flex flex-col gap-6 animate-slide-up">
            {/* Profile Header */}
            <section className="flex flex-col items-center pt-2 pb-6">
                {/* Avatar with Glow */}
                <div className="relative mb-4 group cursor-pointer">
                    <div
                        className="absolute -inset-1 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"
                        style={{
                            background: 'linear-gradient(135deg, #4cdf20 0%, #2d8a16 100%)'
                        }}
                    />
                    <div className="relative w-28 h-28 rounded-full bg-background-dark ring-2 ring-primary/20 p-1">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                            <span className="text-4xl font-bold text-surface-dark">
                                {formData.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                    </div>
                    {/* Edit Badge */}
                    <button
                        onClick={() => setEditing(!editing)}
                        className="absolute bottom-1 right-1 bg-primary text-surface-dark p-2 rounded-full border-2 border-background-dark shadow-lg hover:scale-110 transition-transform"
                    >
                        <span className="material-symbols-outlined text-sm font-bold">
                            {editing ? 'close' : 'edit'}
                        </span>
                    </button>
                </div>

                <h1 className="text-2xl font-bold text-white text-center mb-1">
                    {formData.full_name || 'Atleta'}
                </h1>
                <p className="text-text-secondary text-sm font-medium mb-3">
                    {user?.email}
                </p>

                {/* Level Badge */}
                <div className="badge badge-primary">
                    <span className="material-symbols-outlined text-sm">fitness_center</span>
                    <span>Nível: Iniciante</span>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="grid grid-cols-3 gap-3">
                <StatCard
                    label="Peso"
                    value={formData.weight_kg || '--'}
                    unit="kg"
                    editing={editing}
                    onChange={(val) => setFormData({ ...formData, weight_kg: val })}
                />
                <StatCard
                    label="Altura"
                    value={formData.height_cm || '--'}
                    unit="cm"
                    editing={editing}
                    onChange={(val) => setFormData({ ...formData, height_cm: val })}
                />
                <StatCard
                    label="IMC"
                    value={calculateBMI(formData.weight_kg, formData.height_cm)}
                    unit=""
                    editing={false}
                />
            </section>

            {/* AI Insight */}
            <section className="ai-insight">
                <div className="flex items-center gap-2 mb-3 relative z-10">
                    <div className="p-1.5 rounded-lg bg-primary/20 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-primary text-xl">psychology</span>
                    </div>
                    <h3 className="text-primary font-bold text-sm tracking-wider uppercase">
                        Insight da IA
                    </h3>
                </div>
                <p className="text-white text-base font-medium leading-relaxed mb-4 relative z-10">
                    "Sua consistência melhorou <span className="text-primary font-bold">20%</span> esta semana.
                    Continue hidratado para otimizar a recuperação muscular."
                </p>
                <div className="flex items-center justify-between text-xs text-text-secondary border-t border-white/10 pt-3 relative z-10">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span>Sincronizado via n8n</span>
                    </div>
                    <span>Hoje, 08:30</span>
                </div>
            </section>

            {/* Weekly Goals */}
            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Metas Diárias</h3>
                    {editing && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
                        >
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    )}
                </div>

                <GoalCard
                    icon="local_fire_department"
                    iconColor="text-orange-500"
                    iconBg="bg-orange-500/10"
                    label="Calorias Diárias"
                    value={formData.daily_calorie_goal}
                    unit="kcal"
                    editing={editing}
                    onChange={(val) => setFormData({ ...formData, daily_calorie_goal: parseInt(val) || 0 })}
                    progress={60}
                    progressColor="bg-orange-500"
                />
                <GoalCard
                    icon="fitness_center"
                    iconColor="text-primary"
                    iconBg="bg-primary/10"
                    label="Meta de Proteína"
                    value={formData.daily_protein_goal}
                    unit="g"
                    editing={editing}
                    onChange={(val) => setFormData({ ...formData, daily_protein_goal: parseInt(val) || 0 })}
                    progress={75}
                    progressColor="bg-primary"
                />
                <GoalCard
                    icon="bolt"
                    iconColor="text-blue-400"
                    iconBg="bg-blue-500/10"
                    label="Carboidratos"
                    value={formData.daily_carbs_goal}
                    unit="g"
                    editing={editing}
                    onChange={(val) => setFormData({ ...formData, daily_carbs_goal: parseInt(val) || 0 })}
                    progress={45}
                    progressColor="bg-blue-400"
                />
            </section>

            {/* Settings Menu */}
            <section className="flex flex-col gap-2">
                <MenuItem icon="person" label="Dados Pessoais" onClick={() => toast.info('Em breve!')} />
                <MenuItem icon="notifications" label="Notificações" onClick={() => toast.info('Em breve!')} />
                <MenuItem icon="lock" label="Privacidade e Dados" onClick={() => toast.info('Em breve!')} />
            </section>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="text-red-400 font-semibold text-sm hover:underline py-4"
            >
                Sair da Conta
            </button>

            {/* App Version */}
            <div className="text-center text-text-muted text-xs py-4">
                <p>FitAI Pro v1.0.0</p>
                <p>AM Consultoria © 2024</p>
            </div>
        </div>
    );
};

// Helper function
const calculateBMI = (weight, height) => {
    if (!weight || !height) return '--';
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    return bmi.toFixed(1);
};

// Sub-components
const StatCard = ({ label, value, unit, editing, onChange }) => (
    <div className="card flex flex-col items-center justify-center py-4">
        <p className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-1">
            {label}
        </p>
        {editing && onChange ? (
            <input
                type="number"
                value={value === '--' ? '' : value}
                onChange={(e) => onChange(e.target.value)}
                className="w-16 text-center bg-transparent text-xl font-bold text-white border-b border-primary focus:outline-none"
                placeholder="--"
            />
        ) : (
            <p className="text-xl font-bold text-white">
                {value} <span className="text-sm font-normal text-text-secondary">{unit}</span>
            </p>
        )}
    </div>
);

const GoalCard = ({ icon, iconColor, iconBg, label, value, unit, editing, onChange, progress, progressColor }) => (
    <div className="card flex items-center gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}>
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm text-white">{label}</span>
                {editing ? (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-20 text-right bg-transparent text-xs font-bold text-primary border-b border-primary focus:outline-none"
                    />
                ) : (
                    <span className="text-xs font-bold text-text-secondary">{value} {unit}</span>
                )}
            </div>
            <div className="progress-bar">
                <div
                    className={`progress-bar-fill ${progressColor}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    </div>
);

const MenuItem = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="card flex items-center w-full p-4 hover:border-primary/30 transition-colors group"
    >
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:text-surface-dark transition-colors">
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="flex-1 text-left ml-4">
            <p className="font-medium text-sm text-white">{label}</p>
        </div>
        <span className="material-symbols-outlined text-text-muted">chevron_right</span>
    </button>
);

const ProfileSkeleton = () => (
    <div className="flex flex-col gap-6 animate-pulse">
        <div className="flex flex-col items-center pt-2 pb-6">
            <div className="w-28 h-28 rounded-full skeleton mb-4" />
            <div className="h-6 w-32 skeleton rounded mb-2" />
            <div className="h-4 w-48 skeleton rounded" />
        </div>
        <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 skeleton rounded-xl" />)}
        </div>
        <div className="h-32 skeleton rounded-xl" />
        <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
        </div>
    </div>
);

export default Profile;
