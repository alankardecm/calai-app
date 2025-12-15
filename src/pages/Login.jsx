import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const { error } = await signIn({ email, password });
                if (error) throw error;
                navigate('/');
            } else {
                const { error } = await signUp({ email, password });
                if (error) throw error;
                setError('✅ Verifique seu email para confirmar o cadastro!');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background-dark">
            {/* Background Glow Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
            </div>

            <div className="w-full max-w-sm relative z-10">
                {/* Logo & Title */}
                <div className="text-center mb-10">
                    <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative"
                        style={{
                            background: 'linear-gradient(135deg, #4cdf20 0%, #2d8a16 100%)',
                            boxShadow: '0 0 40px rgba(76, 223, 32, 0.4)'
                        }}
                    >
                        <span className="material-symbols-outlined text-4xl text-surface-dark">
                            fitness_center
                        </span>
                        {/* Pulse ring */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-primary animate-ping opacity-20" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
                        FitAI Pro
                    </h1>
                    <p className="text-text-secondary font-medium">
                        Seu Treinador Pessoal com IA
                    </p>
                </div>

                {/* Card */}
                <div className="card p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-white">
                            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
                        </h2>
                        <p className="text-text-secondary text-sm mt-1">
                            {isLogin ? 'Entre para continuar' : 'Comece sua jornada fitness'}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className={`p-3 rounded-xl mb-4 text-sm font-medium ${error.includes('✅')
                                ? 'bg-primary/20 text-primary'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                                    <span className="material-symbols-outlined text-xl">mail</span>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pl-12"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1">
                                Senha
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                                    <span className="material-symbols-outlined text-xl">lock</span>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pl-12"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary btn-block btn-lg mt-6"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-surface-dark/30 border-t-surface-dark rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Entrar' : 'Criar Conta'}
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="text-sm font-bold text-text-secondary hover:text-primary transition-colors"
                        >
                            {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
                            <span className="text-primary">
                                {isLogin ? 'Crie agora' : 'Entre aqui'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-text-muted text-xs">
                        Ao continuar, você concorda com nossos
                    </p>
                    <p className="text-text-secondary text-xs font-medium mt-1">
                        Termos de Uso e Política de Privacidade
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
