import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Scan, Clock, User, BarChart2 } from 'lucide-react';

const Layout = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen flex flex-col bg-bg-main text-text-main pb-24 md:pb-0">
            {/* Desktop Header */}
            <header className="hidden md:flex items-center justify-between p-6 bg-bg-main border-b border-border sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">C</div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Cal<span className="text-muted">AI</span></h1>
                </div>
                <nav className="flex gap-8">
                    <NavLink to="/" icon={<Scan size={20} />} label="Scanner" active={isActive('/')} />
                    <NavLink to="/history" icon={<Clock size={20} />} label="Histórico" active={isActive('/history')} />
                    <NavLink to="/stats" icon={<BarChart2 size={20} />} label="Estatísticas" active={isActive('/stats')} />
                    <NavLink to="/profile" icon={<User size={20} />} label="Perfil" active={isActive('/profile')} />
                </nav>
            </header>

            {/* Mobile Header */}
            <header className="md:hidden p-4 flex items-center justify-center bg-bg-main sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-white/80">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">C</div>
                    <h1 className="text-xl font-extrabold tracking-tight">Cal<span className="text-muted">AI</span></h1>
                </div>
            </header>

            <main className="flex-1 container py-6 animate-fade-in">
                <Outlet />
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-lg border border-border/50 shadow-lg rounded-full flex justify-around p-4 z-50">
                <MobileNavLink to="/" icon={<Scan size={24} />} label="Scan" active={isActive('/')} />
                <MobileNavLink to="/history" icon={<Clock size={24} />} label="Histórico" active={isActive('/history')} />
                <MobileNavLink to="/stats" icon={<BarChart2 size={24} />} label="Stats" active={isActive('/stats')} />
                <MobileNavLink to="/profile" icon={<User size={24} />} label="Perfil" active={isActive('/profile')} />
            </nav>
        </div>
    );
};

const NavLink = ({ to, icon, label, active }) => (
    <Link
        to={to}
        className={`flex items-center gap-2 font-bold transition-colors hover:text-primary ${active ? 'text-primary' : 'text-muted'}`}
    >
        {icon}
        <span>{label}</span>
    </Link>
);

const MobileNavLink = ({ to, icon, label, active }) => (
    <Link
        to={to}
        className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${active ? 'text-primary scale-110' : 'text-muted'}`}
    >
        {icon}
        {/* <span>{label}</span> */}
    </Link>
);

export default Layout;
