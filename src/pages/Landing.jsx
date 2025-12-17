import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    const [isVisible, setIsVisible] = useState({});
    const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                }
                return { hours: 23, minutes: 59, seconds: 59 };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Intersection observer for animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const features = [
        {
            icon: 'photo_camera',
            title: 'Registre com Uma Foto',
            description: 'Aponte para sua refeição e nossa IA ajuda a identificar os alimentos e estimar as calorias.'
        },
        {
            icon: 'psychology',
            title: 'Planejamento Personalizado',
            description: 'Receba sugestões de plano alimentar adaptadas ao seu perfil, rotina e objetivos.'
        },
        {
            icon: 'chat',
            title: 'Assistente 24 Horas',
            description: 'Tire dúvidas e receba orientações do assistente virtual a qualquer momento.'
        },
        {
            icon: 'trending_up',
            title: 'Acompanhe seu Progresso',
            description: 'Visualize seu histórico com gráficos detalhados e mantenha-se no caminho certo.'
        }
    ];

    const testimonials = [
        {
            name: 'Carolina M.',
            location: 'São Paulo, SP',
            text: 'Finalmente consigo acompanhar minha alimentação de verdade! Tirar foto é muito mais prático do que ficar pesando e anotando tudo.',
            avatar: 'C',
            rating: 5,
            result: 'Praticidade'
        },
        {
            name: 'Rafael S.',
            location: 'Rio de Janeiro, RJ',
            text: 'O app me ajuda a manter o foco. Ver os gráficos e receber as dicas do coach faz toda diferença na minha rotina.',
            avatar: 'R',
            rating: 5,
            result: 'Consistência'
        },
        {
            name: 'Amanda L.',
            location: 'Belo Horizonte, MG',
            text: 'Adoro a praticidade! Antes eu desistia de anotar minhas refeições, agora é só tirar foto e pronto.',
            avatar: 'A',
            rating: 5,
            result: 'Organização'
        }
    ];

    const painPoints = [
        { icon: 'schedule', text: 'Não tem tempo para anotar suas refeições?' },
        { icon: 'restaurant', text: 'Quer mais organização na sua alimentação?' },
        { icon: 'analytics', text: 'Gostaria de entender melhor seus hábitos?' },
        { icon: 'psychology', text: 'Precisa de ajuda para se manter no foco?' }
    ];

    const benefits = [
        'Identificação de alimentos por foto com IA',
        'Plano alimentar 100% personalizado',
        'Plano de treino adaptado ao seu objetivo',
        'Coach motivacional disponível 24 horas',
        'Acompanhamento de macros e calorias',
        'Histórico completo de refeições',
        'Análise de progresso com gráficos',
        'Acesso ilimitado a todas as funcionalidades'
    ];

    const faqs = [
        {
            question: 'A IA realmente reconhece os alimentos pela foto?',
            answer: 'Sim! Usamos a tecnologia GPT-4 Vision da OpenAI, a mais avançada do mundo. Ela identifica alimentos, porções e calcula os macronutrientes com precisão de até 95%.'
        },
        {
            question: 'Posso cancelar quando quiser?',
            answer: 'Absolutamente! Você pode cancelar sua assinatura a qualquer momento, sem multa ou burocracia. Basta acessar seu perfil e cancelar com 2 cliques.'
        },
        {
            question: 'O plano é realmente personalizado?',
            answer: 'Sim! Nossa IA considera seu peso, altura, idade, nível de atividade e objetivo para calcular suas necessidades calóricas usando a fórmula Mifflin-St Jeor, a mais precisa cientificamente.'
        },
        {
            question: 'O coach é uma pessoa real?',
            answer: 'O coach é uma IA avançada treinada por nutricionistas e personal trainers. Ele está disponível 24h, nunca se cansa e conhece seu histórico completo para dar orientações precisas.'
        },
        {
            question: 'Funciona para qualquer objetivo?',
            answer: 'Sim! Seja para perder gordura, ganhar massa muscular ou manter o peso, o NutriSnap adapta o plano ao seu objetivo específico.'
        }
    ];

    const [openFaq, setOpenFaq] = useState(null);

    return (
        <div className="min-h-screen bg-[#0a0f08] text-white overflow-x-hidden">
            {/* Floating CTA Mobile */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0f08] via-[#0a0f08] to-transparent z-50 md:hidden">
                <a
                    href="#pricing"
                    className="block w-full py-4 bg-[#4cdf20] hover:bg-[#3bb818] text-[#0a0f08] font-bold text-lg rounded-2xl text-center transition-all shadow-[0_0_30px_rgba(76,223,32,0.4)]"
                >
                    COMEÇAR AGORA →
                </a>
            </div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-[#0a0f08]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4cdf20] to-[#2d8a16] flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xl">restaurant</span>
                        </div>
                        <span className="text-xl font-bold text-white">NutriSnap</span>
                    </div>
                    <a
                        href="#pricing"
                        className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-[#4cdf20] hover:bg-[#3bb818] text-[#0a0f08] font-bold rounded-full transition-all"
                    >
                        Começar Agora
                    </a>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-20 pb-32 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4cdf20]/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#4cdf20]/10 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left - Text */}
                    <div className="text-center lg:text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4cdf20]/10 border border-[#4cdf20]/30 mb-6">
                            <span className="w-2 h-2 bg-[#4cdf20] rounded-full animate-pulse"></span>
                            <span className="text-[#4cdf20] text-sm font-medium">+2.500 usuários ativos</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                            Sua Alimentação
                            <span className="block text-[#4cdf20]">Mais Organizada</span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
                            Acompanhe suas refeições com praticidade. Tire uma foto, e a IA ajuda a registrar calorias e nutrientes
                            <span className="text-white font-semibold"> de forma simples e rápida</span>.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                            <a
                                href="#pricing"
                                className="group px-8 py-4 bg-[#4cdf20] hover:bg-[#3bb818] text-[#0a0f08] font-bold text-lg rounded-2xl transition-all shadow-[0_0_30px_rgba(76,223,32,0.3)] hover:shadow-[0_0_40px_rgba(76,223,32,0.5)] flex items-center justify-center gap-2"
                            >
                                <span>COMEÇAR AGORA</span>
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </a>
                            <a
                                href="#demo"
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[#4cdf20]">play_circle</span>
                                <span>Ver Demo</span>
                            </a>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#4cdf20] text-lg">verified</span>
                                <span>Garantia 7 dias</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#4cdf20] text-lg">lock</span>
                                <span>Pagamento seguro</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#4cdf20] text-lg">support</span>
                                <span>Suporte 24h</span>
                            </div>
                        </div>
                    </div>

                    {/* Right - Phone Mockup */}
                    <div className="relative flex justify-center lg:justify-end">
                        <div className="relative">
                            {/* Phone Frame */}
                            <div className="relative w-72 md:w-80 h-[580px] md:h-[640px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-3 shadow-2xl">
                                <div className="w-full h-full bg-[#152111] rounded-[2.5rem] overflow-hidden relative">
                                    {/* Status Bar */}
                                    <div className="flex items-center justify-between px-6 py-3 text-xs text-white/60">
                                        <span>9:41</span>
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">signal_cellular_alt</span>
                                            <span className="material-symbols-outlined text-sm">wifi</span>
                                            <span className="material-symbols-outlined text-sm">battery_full</span>
                                        </div>
                                    </div>

                                    {/* App Content Preview */}
                                    <div className="px-4 py-2 space-y-4">
                                        {/* Header */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white/60 text-xs">Boa tarde,</p>
                                                <p className="text-white font-bold">Atleta 💪</p>
                                            </div>
                                            <div className="flex items-center gap-1 px-2 py-1 bg-[#1e2b1a] rounded-full">
                                                <span className="material-symbols-outlined text-orange-500 text-sm">local_fire_department</span>
                                                <span className="text-white text-xs font-bold">12</span>
                                            </div>
                                        </div>

                                        {/* Calorie Ring */}
                                        <div className="bg-[#1e2b1a] rounded-2xl p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-20 h-20">
                                                    <svg className="w-20 h-20 -rotate-90">
                                                        <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
                                                        <circle cx="40" cy="40" r="36" stroke="#4cdf20" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="226" strokeDashoffset="68" />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="text-white font-bold text-lg">1.680</span>
                                                        <span className="text-white/50 text-[10px]">kcal</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div>
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-white/60">Proteína</span>
                                                            <span className="text-[#4cdf20] font-bold">112g</span>
                                                        </div>
                                                        <div className="h-1.5 bg-white/10 rounded-full">
                                                            <div className="h-full w-3/4 bg-[#4cdf20] rounded-full"></div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-white/60">Carboidratos</span>
                                                            <span className="text-blue-400 font-bold">180g</span>
                                                        </div>
                                                        <div className="h-1.5 bg-white/10 rounded-full">
                                                            <div className="h-full w-1/2 bg-blue-400 rounded-full"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Insight */}
                                        <div className="bg-gradient-to-r from-[#1e2b1a] to-[#4cdf20]/10 rounded-2xl p-4 border border-[#4cdf20]/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="material-symbols-outlined text-[#4cdf20] text-lg">psychology</span>
                                                <span className="text-[#4cdf20] text-xs font-bold">INSIGHT DA IA</span>
                                            </div>
                                            <p className="text-white text-sm leading-relaxed">
                                                "Você está <span className="text-[#4cdf20] font-bold">20%</span> mais consistente esta semana! Continue assim 🔥"
                                            </p>
                                        </div>

                                        {/* Recent Meal */}
                                        <div className="bg-[#1e2b1a] rounded-2xl p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                                                    <span className="text-2xl">🍗</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-white font-semibold text-sm">Frango Grelhado</p>
                                                    <p className="text-white/50 text-xs">Almoço • 420 kcal</p>
                                                </div>
                                                <span className="material-symbols-outlined text-[#4cdf20]">check_circle</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Nav */}
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="bg-[#253320]/90 backdrop-blur-xl rounded-full p-2 flex items-center justify-between">
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-[#4cdf20]">
                                                <span className="material-symbols-outlined">grid_view</span>
                                            </div>
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white/40">
                                                <span className="material-symbols-outlined">fitness_center</span>
                                            </div>
                                            <div className="w-14 h-14 -mt-6 rounded-full bg-[#4cdf20] flex items-center justify-center shadow-[0_0_20px_rgba(76,223,32,0.4)]">
                                                <span className="material-symbols-outlined text-[#152111] text-2xl">qr_code_scanner</span>
                                            </div>
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white/40">
                                                <span className="material-symbols-outlined">calendar_month</span>
                                            </div>
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white/40">
                                                <span className="material-symbols-outlined">person</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -left-8 top-1/4 bg-[#1e2b1a] rounded-2xl p-3 shadow-xl border border-white/10 animate-bounce" style={{ animationDuration: '3s' }}>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🎯</span>
                                    <div>
                                        <p className="text-white font-bold text-sm">Meta atingida!</p>
                                        <p className="text-[#4cdf20] text-xs">+150 proteína</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -right-4 bottom-1/3 bg-[#1e2b1a] rounded-2xl p-3 shadow-xl border border-white/10 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">📸</span>
                                    <div>
                                        <p className="text-white font-bold text-sm">Foto analisada</p>
                                        <p className="text-white/60 text-xs">420 kcal detectadas</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
                    <span className="text-xs tracking-widest">SCROLL</span>
                    <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2">
                        <div className="w-1.5 h-3 bg-[#4cdf20] rounded-full animate-bounce"></div>
                    </div>
                </div>
            </section>

            {/* Pain Points Section */}
            <section className="py-20 bg-[#0d1209]">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Você se identifica com algum desses problemas?
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {painPoints.map((point, index) => (
                            <div
                                key={index}
                                className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-center hover:bg-red-500/10 transition-all"
                            >
                                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-red-400 text-2xl">{point.icon}</span>
                                </div>
                                <p className="text-gray-300 font-medium">{point.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-2xl md:text-3xl font-bold text-white">
                            O <span className="text-[#4cdf20]">NutriSnap</span> pode te ajudar com <span className="underline decoration-[#4cdf20]">tudo isso</span>.
                        </p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="demo" className="py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-[#4cdf20] font-bold text-sm tracking-widest mb-4 block">COMO FUNCIONA</span>
                        <h2 className="text-3xl md:text-4xl font-bold">
                            Simples assim: 3 passos
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: '01', icon: 'photo_camera', title: 'Tire uma foto', desc: 'Aponte para sua refeição e deixe a IA ajudar no registro.' },
                            { step: '02', icon: 'auto_awesome', title: 'IA registra tudo', desc: 'Em segundos, identifica alimentos e estima os nutrientes.' },
                            { step: '03', icon: 'emoji_events', title: 'Acompanhe seu dia', desc: 'Visualize seu consumo e mantenha-se organizado.' }
                        ].map((item, index) => (
                            <div key={index} className="relative">
                                <div className="bg-[#152111] rounded-3xl p-8 border border-white/5 hover:border-[#4cdf20]/30 transition-all group">
                                    <span className="text-7xl font-black text-[#4cdf20]/10 absolute top-4 right-6">{item.step}</span>
                                    <div className="w-16 h-16 rounded-2xl bg-[#4cdf20]/10 flex items-center justify-center mb-6 group-hover:bg-[#4cdf20]/20 transition-all">
                                        <span className="material-symbols-outlined text-[#4cdf20] text-3xl">{item.icon}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                    <p className="text-gray-400">{item.desc}</p>
                                </div>
                                {index < 2 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#4cdf20]/50 to-transparent"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-[#0d1209]">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-[#4cdf20] font-bold text-sm tracking-widest mb-4 block">FUNCIONALIDADES</span>
                        <h2 className="text-3xl md:text-4xl font-bold">
                            Tudo que você precisa em um só app
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-[#152111] rounded-2xl p-6 border border-white/5 hover:border-[#4cdf20]/30 transition-all group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-[#4cdf20]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#4cdf20]/20 transition-all">
                                        <span className="material-symbols-outlined text-[#4cdf20] text-2xl">{feature.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                                        <p className="text-gray-400">{feature.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-[#4cdf20] font-bold text-sm tracking-widest mb-4 block">DEPOIMENTOS</span>
                        <h2 className="text-3xl md:text-4xl font-bold">
                            O que nossos usuários dizem
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="bg-[#152111] rounded-2xl p-6 border border-white/5"
                            >
                                {/* Stars */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <span key={i} className="material-symbols-outlined text-yellow-500 text-lg">star</span>
                                    ))}
                                </div>

                                {/* Quote */}
                                <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>

                                {/* Author */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4cdf20] to-[#2d8a16] flex items-center justify-center text-white font-bold">
                                            {testimonial.avatar}
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold">{testimonial.name}</p>
                                            <p className="text-gray-500 text-sm">{testimonial.location}</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 bg-[#4cdf20]/10 rounded-full">
                                        <span className="text-[#4cdf20] font-bold text-sm">{testimonial.result}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 bg-[#0d1209]">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-[#4cdf20] font-bold text-sm tracking-widest mb-4 block">EXPERIMENTE</span>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Comece a se organizar hoje
                        </h2>

                        {/* Countdown */}
                        <div className="inline-flex items-center gap-4 bg-red-500/10 border border-red-500/30 rounded-full px-6 py-3">
                            <span className="material-symbols-outlined text-red-400">timer</span>
                            <span className="text-red-400 font-medium">Oferta expira em:</span>
                            <div className="flex items-center gap-2 font-mono font-bold text-white">
                                <span className="bg-red-500/20 px-3 py-1 rounded-lg">{String(timeLeft.hours).padStart(2, '0')}</span>
                                <span className="text-red-400">:</span>
                                <span className="bg-red-500/20 px-3 py-1 rounded-lg">{String(timeLeft.minutes).padStart(2, '0')}</span>
                                <span className="text-red-400">:</span>
                                <span className="bg-red-500/20 px-3 py-1 rounded-lg">{String(timeLeft.seconds).padStart(2, '0')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Card */}
                    <div className="relative bg-gradient-to-b from-[#152111] to-[#1e2b1a] rounded-3xl p-8 md:p-12 border-2 border-[#4cdf20]/30 overflow-hidden">
                        {/* Glow Effect */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#4cdf20]/20 rounded-full blur-[80px]"></div>

                        {/* Most Popular Badge */}
                        <div className="absolute top-0 right-8 bg-[#4cdf20] text-[#0a0f08] font-bold text-sm px-4 py-2 rounded-b-xl">
                            MAIS POPULAR
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            {/* Left - Price */}
                            <div className="text-center md:text-left">
                                <h3 className="text-2xl font-bold text-white mb-2">Plano Mensal</h3>
                                <p className="text-gray-400 mb-6">Acesso completo a todas as funcionalidades</p>

                                <div className="mb-6">
                                    <span className="text-gray-500 line-through text-xl">R$ 97,00</span>
                                    <div className="flex items-baseline gap-2 justify-center md:justify-start">
                                        <span className="text-5xl md:text-6xl font-black text-white">R$ X</span>
                                        <span className="text-gray-400">/mês</span>
                                    </div>
                                    <p className="text-[#4cdf20] font-medium mt-2">
                                        💰 Economize R$ XX por mês (preço a definir)
                                    </p>
                                </div>

                                <a
                                    href="https://pay.kirvano.com/seu-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full md:w-auto md:inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#4cdf20] hover:bg-[#3bb818] text-[#0a0f08] font-bold text-lg rounded-2xl transition-all shadow-[0_0_30px_rgba(76,223,32,0.4)]"
                                >
                                    QUERO COMEÇAR AGORA
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </a>

                                <p className="text-gray-500 text-sm mt-4 flex items-center justify-center md:justify-start gap-2">
                                    <span className="material-symbols-outlined text-[#4cdf20] text-lg">verified</span>
                                    Garantia de 7 dias ou seu dinheiro de volta
                                </p>
                            </div>

                            {/* Right - Benefits */}
                            <div className="space-y-3">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[#4cdf20]">check_circle</span>
                                        <span className="text-gray-300">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="flex items-center justify-center gap-6 mt-8 text-gray-500">
                        <span className="text-sm">Pagamento seguro via:</span>
                        <div className="flex items-center gap-4">
                            <span className="font-bold">PIX</span>
                            <span className="font-bold">Cartão</span>
                            <span className="font-bold">Boleto</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold">
                            NutriSnap vs. Nutricionista Tradicional
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Traditional */}
                        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-red-400 text-3xl">close</span>
                                <h3 className="text-xl font-bold text-white">Nutricionista</h3>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-gray-400">
                                    <span className="material-symbols-outlined text-red-400 text-lg">close</span>
                                    R$ 300-500 por consulta
                                </li>
                                <li className="flex items-center gap-3 text-gray-400">
                                    <span className="material-symbols-outlined text-red-400 text-lg">close</span>
                                    Disponível apenas em horário comercial
                                </li>
                                <li className="flex items-center gap-3 text-gray-400">
                                    <span className="material-symbols-outlined text-red-400 text-lg">close</span>
                                    Precisa agendar consulta
                                </li>
                                <li className="flex items-center gap-3 text-gray-400">
                                    <span className="material-symbols-outlined text-red-400 text-lg">close</span>
                                    Contagem manual de calorias
                                </li>
                                <li className="flex items-center gap-3 text-gray-400">
                                    <span className="material-symbols-outlined text-red-400 text-lg">close</span>
                                    Sem acompanhamento diário
                                </li>
                            </ul>
                        </div>

                        {/* NutriSnap */}
                        <div className="bg-[#4cdf20]/5 border border-[#4cdf20]/30 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-[#4cdf20] text-3xl">check_circle</span>
                                <h3 className="text-xl font-bold text-white">NutriSnap</h3>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-gray-300">
                                    <span className="material-symbols-outlined text-[#4cdf20] text-lg">check</span>
                                    Fração do preço mensal
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <span className="material-symbols-outlined text-[#4cdf20] text-lg">check</span>
                                    Disponível 24 horas por dia
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <span className="material-symbols-outlined text-[#4cdf20] text-lg">check</span>
                                    Respostas instantâneas
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <span className="material-symbols-outlined text-[#4cdf20] text-lg">check</span>
                                    IA conta calorias por você
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <span className="material-symbols-outlined text-[#4cdf20] text-lg">check</span>
                                    Acompanhamento em tempo real
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-[#0d1209]">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-[#4cdf20] font-bold text-sm tracking-widest mb-4 block">DÚVIDAS FREQUENTES</span>
                        <h2 className="text-3xl md:text-4xl font-bold">
                            Perguntas Frequentes
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-[#152111] rounded-2xl border border-white/5 overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full flex items-center justify-between p-6 text-left"
                                >
                                    <span className="font-semibold text-white pr-4">{faq.question}</span>
                                    <span className={`material-symbols-outlined text-[#4cdf20] transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>
                                        expand_more
                                    </span>
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 pb-6">
                                        <p className="text-gray-400">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#4cdf20]/10 rounded-full blur-[150px]"></div>
                </div>

                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        Pronto para se organizar?
                    </h2>
                    <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                        Junte-se a milhares de pessoas que já estão acompanhando sua alimentação com o NutriSnap.
                    </p>
                    <a
                        href="#pricing"
                        className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-[#4cdf20] hover:bg-[#3bb818] text-[#0a0f08] font-bold text-xl rounded-2xl transition-all shadow-[0_0_40px_rgba(76,223,32,0.4)]"
                    >
                        QUERO EXPERIMENTAR
                        <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                    </a>
                    <p className="text-gray-500 mt-6">
                        🔒 Pagamento 100% seguro • Garantia de 7 dias
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4cdf20] to-[#2d8a16] flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-xl">restaurant</span>
                            </div>
                            <span className="text-xl font-bold text-white">NutriSnap</span>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
                            <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
                            <a href="#" className="hover:text-white transition-colors">Suporte</a>
                        </div>

                        <p className="text-gray-500 text-sm">
                            © 2024 NutriSnap. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Bottom Padding for Mobile CTA */}
            <div className="h-24 md:hidden"></div>
        </div>
    );
};

export default Landing;
