import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

// ============================================
// TOAST CONTEXT
// ============================================

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

// ============================================
// TOAST PROVIDER
// ============================================

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, duration }]);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const success = useCallback((message, duration) => {
        return addToast(message, 'success', duration);
    }, [addToast]);

    const error = useCallback((message, duration) => {
        return addToast(message, 'error', duration);
    }, [addToast]);

    const info = useCallback((message, duration) => {
        return addToast(message, 'info', duration);
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ success, error, info, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

// ============================================
// TOAST CONTAINER
// ============================================

const ToastContainer = ({ toasts, onRemove }) => {
    return (
        <div className="fixed bottom-24 left-0 right-0 z-[9999] flex flex-col items-center gap-3 px-6 pointer-events-none">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => onRemove(toast.id)}
                />
            ))}
        </div>
    );
};

// ============================================
// TOAST COMPONENT
// ============================================

const Toast = ({ message, type, onClose }) => {
    const config = {
        success: {
            icon: CheckCircle,
            className: 'toast-success',
            bgColor: 'bg-accent/10',
            textColor: 'text-accent',
            iconColor: 'text-accent'
        },
        error: {
            icon: AlertCircle,
            className: 'toast-error',
            bgColor: 'bg-red-50',
            textColor: 'text-red-900',
            iconColor: 'text-red-500'
        },
        info: {
            icon: Info,
            className: 'toast-info',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-900',
            iconColor: 'text-blue-500'
        }
    };

    const { icon: Icon, className, bgColor, textColor, iconColor } = config[type] || config.info;

    return (
        <div
            className={`
                glass-card ${className} ${bgColor}
                pointer-events-auto
                max-w-md w-full
                px-5 py-4
                flex items-center gap-4
                animate-slide-up
                shadow-xl
            `}
        >
            <div className={`shrink-0 ${iconColor}`}>
                <Icon size={22} strokeWidth={2.5} />
            </div>

            <p className={`flex-1 font-semibold text-sm ${textColor} leading-relaxed`}>
                {message}
            </p>

            <button
                onClick={onClose}
                className="shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors"
            >
                <X size={18} className="text-muted" />
            </button>
        </div>
    );
};

// ============================================
// USAGE EXAMPLE
// ============================================

/*
// 1. Wrap your app with ToastProvider
import { ToastProvider } from './components/ToastSystem';

function App() {
    return (
        <ToastProvider>
            <YourApp />
        </ToastProvider>
    );
}

// 2. Use in any component
import { useToast } from './components/ToastSystem';

function MyComponent() {
    const toast = useToast();
    
    const handleSuccess = () => {
        toast.success('Refeição salva com sucesso!');
    };
    
    const handleError = () => {
        toast.error('Erro ao processar imagem');
    };
    
    const handleInfo = () => {
        toast.info('Analisando alimento...', 5000); // custom duration
    };
    
    return (
        <button onClick={handleSuccess}>
            Salvar
        </button>
    );
}
*/
