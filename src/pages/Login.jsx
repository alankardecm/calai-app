import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await signUp({ email, password });
                if (error) throw error;
                alert('Verifique seu email para confirmar o cadastro!');
            } else {
                const { error } = await signIn({ email, password });
                if (error) throw error;
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-main p-4">
            <div className="w-full max-w-md bg-card p-8 rounded-[32px] shadow-xl border border-border">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">C</div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Cal<span className="text-muted">AI</span></h1>
                    <p className="text-muted mt-2">Entre para continuar sua jornada</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2 ml-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 rounded-xl bg-secondary border border-transparent focus:border-primary focus:bg-white transition-all outline-none"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 ml-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 rounded-xl bg-secondary border border-transparent focus:border-primary focus:bg-white transition-all outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full py-4 text-lg shadow-lg mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Criar Conta' : 'Entrar')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm text-muted hover:text-primary font-bold transition-colors"
                    >
                        {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Crie agora'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
