import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Scan, Clock, BarChart2, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
    const { signOut } = useAuth();
    const location = useLocation();

    const navItems = [
        { path: '/', icon: Scan, label: 'Scanner' },
        { path: '/history', icon: Clock, label: 'Histórico' },
        { path: '/stats', icon: BarChart2, label: 'Estatísticas' },
        { path: '/profile', icon: User, label: 'Perfil' },
    ];

    return (
        <div className="min-h-screen bg-[#F2F2F7] font-sans text-slate-900">
            {/* Mobile Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                        C
                    </div>
                    <span className="font-bold text-lg tracking-tight">CalAI</span>
                </div>
                <button onClick={signOut} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <LogOut size={20} />
                </button>
            </header>

            {/* Main Content */}
            <main className="max-w-md mx-auto w-full p-6 pb-32 animate-fade-in">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 pb-6 z-30 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-black scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <div className={`p-1.5 rounded-xl ${isActive ? 'bg-black/5' : 'bg-transparent'}`}>
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
};

export default Layout;
