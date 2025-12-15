/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary - Verde Neon
                primary: {
                    DEFAULT: '#4cdf20',
                    hover: '#3bb818',
                    dark: '#2d8a16',
                },
                // Background
                background: {
                    light: '#f6f8f6',
                    dark: '#152111',
                },
                // Surface (cards, elementos)
                surface: {
                    light: '#ffffff',
                    dark: '#1e2b1a',
                    darker: '#1a2517',
                },
                // Text
                text: {
                    primary: '#ffffff',
                    secondary: '#a4b79e',
                    muted: '#6b7d65',
                },
                // Semantic Colors
                success: '#4cdf20',
                warning: '#f59e0b',
                error: '#ef4444',
                info: '#3b82f6',
                // Macro Colors
                protein: '#4cdf20',  // Verde
                carbs: '#3b82f6',    // Azul
                fat: '#f59e0b',       // Laranja
                calories: '#ef4444',  // Vermelho
            },
            fontFamily: {
                display: ['Manrope', 'sans-serif'],
                sans: ['Manrope', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '1rem',
                lg: '1.5rem',
                xl: '2rem',
                '2xl': '2.5rem',
                '3xl': '3rem',
                full: '9999px',
            },
            boxShadow: {
                'neon': '0 0 15px rgba(76, 223, 32, 0.3)',
                'neon-lg': '0 0 30px rgba(76, 223, 32, 0.4)',
                'card': '0 4px 24px rgba(0, 0, 0, 0.1)',
                'card-dark': '0 4px 24px rgba(0, 0, 0, 0.3)',
            },
            animation: {
                'bounce-slow': 'bounce 1.5s infinite',
                'pulse-slow': 'pulse 3s infinite',
                'scan': 'scan 2s linear infinite',
                'slide-up': 'slideUp 0.5s ease-out',
                'fade-in': 'fadeIn 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
            },
            keyframes: {
                scan: {
                    '0%': { top: '0%', opacity: '0' },
                    '10%': { opacity: '1' },
                    '90%': { opacity: '1' },
                    '100%': { top: '100%', opacity: '0' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
