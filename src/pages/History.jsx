import React, { useEffect, useState } from 'react';
import { Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const History = () => {
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchHistory();
    }, [user]);

    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('meals')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMeals(data || []);
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        if (isToday) {
            return `Hoje • ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        }
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-20">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-extrabold">Histórico</h2>
                <button className="btn btn-outline p-2 rounded-full border-0 bg-secondary">
                    <Calendar size={20} />
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-primary" size={32} />
                </div>
            ) : meals.length === 0 ? (
                <div className="text-center py-10 text-muted">
                    <p>Nenhuma refeição registrada ainda.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {meals.map((item) => (
                        <div key={item.id} className="bg-card p-4 rounded-[20px] flex items-center justify-between group cursor-pointer shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-secondary rounded-xl overflow-hidden flex-shrink-0">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.food_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xl">🥗</div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight mb-1">{item.food_name}</h3>
                                    <p className="text-xs text-muted font-bold uppercase tracking-wide">{formatDate(item.created_at)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-extrabold text-primary text-lg">{item.calories} <span className="text-xs text-muted font-normal">kcal</span></span>
                                <ChevronRight size={20} className="text-muted/50 group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
