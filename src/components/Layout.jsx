import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
    const { user } = useAuth();
    const location = useLocation();

    // Navegação items
    const navItems = [
        { path: '/', icon: 'grid_view', label: 'Home' },
        { path: '/history', icon: 'calendar_month', label: 'Histórico' },
        { path: '/scan', icon: 'qr_code_scanner', label: 'Scan', isFab: true },
        { path: '/diet', icon: 'restaurant', label: 'Dieta' },
        { path: '/profile', icon: 'person', label: 'Perfil' },
    ];

    // Determinar se estamos na tela de scan (para esconder nav se necessário)
    const isScanner = location.pathname === '/scan' || location.pathname === '/';

    return (
        <div className="app-container bg-background-dark min-h-screen">
            {/* Header */}
            <header className="app-header">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                        <div
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg border-2 border-primary"
                            style={{
                                boxShadow: '0 0 15px rgba(76, 223, 32, 0.3)'
                            }}
                        >
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background-dark"></div>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-white text-xl font-bold leading-tight">
                            {getGreeting()}, {user?.email?.split('@')[0] || 'Atleta'}
                        </h2>
                        <p className="text-text-secondary text-sm font-medium">
                            Vamos esmagar as metas hoje! 💪
                        </p>
                    </div>
                </div>

                {/* Streak Badge */}
                <div className="streak-badge">
                    <span className="material-symbols-outlined text-orange-500 text-xl">
                        local_fire_department
                    </span>
                    <p className="text-white text-sm font-bold">12 Dias</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="app-main">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <div className="bottom-nav-inner">
                    {navItems.map((item) => (
                        item.isFab ? (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className="fab"
                            >
                                <span className="material-symbols-outlined text-3xl">
                                    {item.icon}
                                </span>
                            </NavLink>
                        ) : (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `nav-button ${isActive ? 'active' : ''}`
                                }
                            >
                                <span className="material-symbols-outlined text-[28px]">
                                    {item.icon}
                                </span>
                            </NavLink>
                        )
                    ))}
                </div>
            </nav>
        </div>
    );
};

// Helper function para saudação baseada na hora
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
};

export default Layout;
