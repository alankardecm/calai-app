import React, { useState, useEffect } from 'react';
import { User, Target, Settings, LogOut, ChevronRight, Save, Edit3 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastSystem';

const Profile = () => {
    const { user, signOut } = useAuth();
    const toast = useToast();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        daily_calorie_goal: 2000,
        daily_protein_goal: 150,
        daily_carbs_goal: 250,
        daily_fat_goal: 70,
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
                    daily_calorie_goal: data.daily_calorie_goal || 2000,
                    daily_protein_goal: data.daily_protein_goal || 150,
                    daily_carbs_goal: data.daily_carbs_goal || 250,
                    daily_fat_goal: data.daily_fat_goal || 70,
                });
            }
        } catch (err) {
            console.error('Erro ao buscar perfil:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert([
                    {
                        id: user.id,
                        ...formData,
                        updated_at: new Date().toISOString()
                    }
                ]);

            if (error) throw error;

            toast.success('✅ Perfil atualizado com sucesso!');
            setEditing(false);
            fetchProfile();
        } catch (err) {
            console.error('Erro ao salvar:', err);
            toast.error('❌ Erro ao atualizar perfil');
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
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="text-center space-y-3 pt-2">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-primary-hover rounded-3xl flex items-center justify-center text-white shadow-2xl">
                    <User size={48} strokeWidth={2} />
                </div>
                <h2 className="text-3xl font-black text-primary">
                    {formData.full_name || 'Seu Perfil'}
                </h2>
                <p className="text-muted font-medium">
                    {user.email}
                </p>
            </div>

            {/* Goals Section */}
            <div className="card rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-primary flex items-center gap-2">
                        <Target size={22} />
                        Metas Diárias
                    </h3>
                    <button
                        onClick={() => setEditing(!editing)}
                        className="btn btn-ghost p-2 rounded-xl"
                    >
                        {editing ? (
                            <Save size={20} onClick={handleSave} className="text-accent" />
                        ) : (
                            <Edit3 size={20} className="text-muted" />
                        )}
                    </button>
                </div>

                <div className="space-y-5">
                    <GoalInput
                        label="Calorias"
                        value={formData.daily_calorie_goal}
                        onChange={(val) => setFormData({ ...formData, daily_calorie_goal: val })}
                        unit="kcal"
                        editing={editing}
                        color="from-orange-500 to-red-500"
                    />
                    <GoalInput
                        label="Proteínas"
                        value={formData.daily_protein_goal}
                        onChange={(val) => setFormData({ ...formData, daily_protein_goal: val })}
                        unit="g"
                        editing={editing}
                        color="from-blue-500 to-cyan-500"
                    />
                    <GoalInput
                        label="Carboidratos"
                        value={formData.daily_carbs_goal}
                        onChange={(val) => setFormData({ ...formData, daily_carbs_goal: val })}
                        unit="g"
                        editing={editing}
                        color="from-yellow-500 to-amber-500"
                    />
                    <GoalInput
                        label="Gorduras"
                        value={formData.daily_fat_goal}
                        onChange={(val) => setFormData({ ...formData, daily_fat_goal: val })}
                        unit="g"
                        editing={editing}
                        color="from-purple-500 to-pink-500"
                    />
                </div>

                {editing && (
                    <button
                        onClick={handleSave}
                        className="btn btn-accent w-full mt-6 py-4 shadow-xl"
                    >
                        <Save size={20} strokeWidth={2.5} />
                        Salvar Alterações
                    </button>
                )}
            </div>

            {/* Personal Info */}
            <div className="card rounded-xl shadow-md">
                <h3 className="text-xl font-black text-primary mb-5 flex items-center gap-2">
                    <User size={22} />
                    Informações Pessoais
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted mb-2 block">
                            Nome Completo
                        </label>
                        {editing ? (
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full px-4 py-3 bg-secondary rounded-xl font-medium text-primary"
                                placeholder="Seu nome completo"
                            />
                        ) : (
                            <div className="px-4 py-3 bg-secondary rounded-xl font-bold text-primary">
                                {formData.full_name || 'Não informado'}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted mb-2 block">
                            Email
                        </label>
                        <div className="px-4 py-3 bg-secondary/50 rounded-xl font-medium text-muted">
                            {user.email}
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Menu */}
            <div className="card rounded-xl shadow-md">
                <h3 className="text-xl font-black text-primary mb-5 flex items-center gap-2">
                    <Settings size={22} />
                    Configurações
                </h3>
                <div className="space-y-3">
                    <MenuOption
                        label="Notificações"
                        onClick={() => toast.info('Em desenvolvimento')}
                    />
                    <MenuOption
                        label="Privacidade"
                        onClick={() => toast.info('Em desenvolvimento')}
                    />
                    <MenuOption
                        label="Ajuda e Suporte"
                        onClick={() => toast.info('Em desenvolvimento')}
                    />
                    <MenuOption
                        label="Sobre o App"
                        onClick={() => toast.info('CalAI v1.0.0')}
                    />
                </div>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="btn btn-outline w-full py-4 text-red-500 border-red-200 hover:bg-red-50"
            >
                <LogOut size={20} />
                Sair da Conta
            </button>

            {/* App Info */}
            <div className="text-center text-xs text-muted font-medium space-y-1 py-4">
                <p>CalAI Premium v1.0.0</p>
                <p>Desenvolvido por AM Consultoria</p>
            </div>
        </div>
    );
};

// ========================================
// SUB-COMPONENTS
// ========================================

const GoalInput = ({ label, value, onChange, unit, editing, color }) => (
    <div>
        <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-primary">{label}</label>
            <div className="flex items-baseline gap-1">
                {editing ? (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                        className="w-20 px-3 py-2 bg-secondary rounded-xl font-black text-primary text-right"
                    />
                ) : (
                    <span className="text-2xl font-black text-primary">{value}</span>
                )}
                <span className="text-sm text-muted font-semibold">{unit}</span>
            </div>
        </div>

        {!editing && (
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${color} rounded-full`}
                    style={{ width: '75%' }} // Simulação de progresso
                />
            </div>
        )}
    </div>
);

const MenuOption = ({ label, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-secondary transition-all group"
    >
        <span className="font-semibold text-primary">{label}</span>
        <ChevronRight
            size={20}
            className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all"
        />
    </button>
);

const ProfileSkeleton = () => (
    <div className="space-y-6 animate-pulse pb-20">
        <div className="w-24 h-24 mx-auto skeleton rounded-3xl" />
        <div className="h-8 skeleton rounded-xl mx-auto w-48" />
        <div className="h-64 skeleton rounded-xl" />
        <div className="h-48 skeleton rounded-xl" />
    </div>
);

export default Profile;
