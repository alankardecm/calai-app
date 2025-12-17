import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

// URL do webhook N8N - Coach Chat
const N8N_COACH_URL = import.meta.env.VITE_N8N_COACH_URL || 'https://n8n.srv1121163.hstgr.cloud/webhook/chat-coach';

const Coach = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const messagesEndRef = useRef(null);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'coach',
            text: 'Olá! 👋 Sou seu Coach Motivacional. Estou aqui para te ajudar a alcançar seus objetivos! Me conta: como você está se sentindo hoje?',
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
    ]);

    // Buscar perfil do usuário
    useEffect(() => {
        if (user) {
            fetchUserProfile();
        }
    }, [user]);

    const fetchUserProfile = async () => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setUserProfile(data);
            }
        } catch (err) {
            console.error('Erro ao buscar perfil:', err);
        }
    };

    // Scroll para última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Respostas de fallback caso N8N não esteja disponível
    const fallbackResponses = [
        "Eu entendo perfeitamente. Mas lembre-se do porquê você começou! 💪",
        "Um treino de 15 minutos é melhor que zero. Que tal um HIIT rápido para energizar sem tomar muito tempo?",
        "Ótima atitude! Vamos focar em exercícios compostos para máxima eficiência hoje.",
        "Excelente progresso! Continue assim e vamos alcançar suas metas em breve. 🎯",
        "Lembre-se: descanso também é parte do treino. Cuide do seu corpo! 😴",
        "Que tal adicionar 10g de proteína na próxima refeição? Isso vai ajudar na recuperação muscular.",
        "Seu corpo está se adaptando. É hora de aumentar a intensidade! 🔥",
        "Cada pequeno passo conta! Você está no caminho certo. 🏃‍♂️",
        "A consistência é mais importante que a perfeição. Continue firme! 💯"
    ];

    const handleSend = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: inputMessage,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        const currentMessages = [...messages, userMessage];
        setMessages(currentMessages);
        setInputMessage('');
        setIsTyping(true);

        try {
            // Preparar payload para N8N
            const payload = {
                message: inputMessage,
                user_id: user?.id,
                user_name: user?.email?.split('@')[0] || 'Atleta',
                user_goal: userProfile?.goal || 'melhorar saúde',
                user_stats: userProfile ? {
                    weight: userProfile.weight,
                    height: userProfile.height,
                    activity_level: userProfile.activity_level
                } : null,
                conversation_history: currentMessages.slice(-6).map(m => ({
                    type: m.type,
                    text: m.text
                }))
            };

            // Tentar enviar para N8N
            let responseText;

            try {
                const response = await fetch(N8N_COACH_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error('N8N não disponível');
                }

                const data = await response.json();
                responseText = data.response || data.text || fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
            } catch (n8nError) {
                console.warn('N8N não disponível, usando fallback:', n8nError);
                // Delay para simular processamento
                await new Promise(resolve => setTimeout(resolve, 1000));
                responseText = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
            }

            const coachMessage = {
                id: Date.now() + 1,
                type: 'coach',
                text: responseText,
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, coachMessage]);

        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            // Mensagem de erro amigável
            const errorMessage = {
                id: Date.now() + 1,
                type: 'coach',
                text: 'Desculpe, estou com dificuldades técnicas no momento. Mas não desista! 💪 Tente novamente em instantes.',
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Quick actions / sugestões
    const quickActions = [
        "Preciso de motivação",
        "Me dê 3 exercícios para casa",
        "Dicas para emagrecer",
        "Não estou conseguindo treinar"
    ];

    const handleQuickAction = (action) => {
        setInputMessage(action);
    };

    return (
        <div className="min-h-screen bg-background-dark flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-surface-dark/50 backdrop-blur-sm">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2">
                    <span className="material-symbols-outlined text-white">arrow_back</span>
                </button>

                <div className="flex items-center gap-3">
                    {/* Coach Avatar */}
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center overflow-hidden">
                            <span className="material-symbols-outlined text-white text-xl">psychology</span>
                        </div>
                        {/* Online indicator */}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-surface-dark"></div>
                    </div>
                    <div>
                        <h1 className="text-white font-semibold">Coach IA</h1>
                        <p className="text-primary text-xs">Powered by GPT-4</p>
                    </div>
                </div>

                <button className="p-2 -mr-2">
                    <span className="material-symbols-outlined text-white">more_vert</span>
                </button>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {/* Date Separator */}
                <div className="flex justify-center">
                    <span className="text-text-muted text-xs bg-surface-dark/50 px-4 py-1 rounded-full">
                        Hoje
                    </span>
                </div>

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex gap-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                            {/* Coach Avatar (only for coach messages) */}
                            {message.type === 'coach' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-auto">
                                    <span className="material-symbols-outlined text-primary text-sm">psychology</span>
                                </div>
                            )}

                            <div>
                                {/* Sender Label */}
                                {message.type === 'coach' && (
                                    <span className="text-text-muted text-xs ml-1 mb-1 block">Coach</span>
                                )}

                                {/* Message Bubble */}
                                <div
                                    className={`px-4 py-3 rounded-2xl ${message.type === 'user'
                                        ? 'bg-primary text-background-dark rounded-br-md'
                                        : 'bg-white text-gray-900 rounded-bl-md'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                                </div>

                                {/* Time */}
                                <span className={`text-text-muted text-xs mt-1 block ${message.type === 'user' ? 'text-right mr-1' : 'ml-1'
                                    }`}>
                                    {message.time}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="flex gap-2 max-w-[85%]">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-auto">
                                <span className="material-symbols-outlined text-primary text-sm">psychology</span>
                            </div>
                            <div>
                                <span className="text-text-muted text-xs ml-1 mb-1 block">Coach</span>
                                <div className="bg-surface-light px-4 py-3 rounded-2xl rounded-bl-md">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
                <div className="px-4 pb-2">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuickAction(action)}
                                className="flex-shrink-0 px-4 py-2 bg-surface-dark border border-primary/30 rounded-full text-sm text-primary hover:bg-primary/10 transition-colors"
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-surface-dark/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    {/* Camera Button */}
                    <button className="p-3 rounded-full bg-surface-light text-text-secondary hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">photo_camera</span>
                    </button>

                    {/* Input */}
                    <div className="flex-1 bg-surface-light rounded-full px-4 py-3 flex items-center">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Pergunte algo ao Coach..."
                            className="flex-1 bg-transparent text-white text-sm placeholder:text-text-muted focus:outline-none"
                        />
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={handleSend}
                        disabled={!inputMessage.trim() || isTyping}
                        className={`p-3 rounded-full transition-all ${inputMessage.trim() && !isTyping
                            ? 'bg-primary text-background-dark shadow-glow'
                            : 'bg-surface-light text-text-muted'
                            }`}
                    >
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Coach;
