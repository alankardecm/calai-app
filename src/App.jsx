import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/ToastSystem';

// Layout
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FoodRecognition from './components/FoodRecognition';
import History from './pages/History';
import Diet from './pages/Diet';
import Workouts from './pages/Workouts';
import Profile from './pages/Profile';
import Stats from './pages/Stats';
import Onboarding from './pages/Onboarding';
import Coach from './pages/Coach';
import Landing from './pages/Landing';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-text-secondary font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-background-dark">
          <Routes>
            {/* Public Routes */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Standalone Protected Routes (sem Layout) */}
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />

            <Route path="/coach" element={
              <ProtectedRoute>
                <Coach />
              </ProtectedRoute>
            } />

            {/* Protected Routes with Layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Dashboard is the home */}
              <Route index element={<Dashboard />} />

              {/* Scanner - Botão central FAB */}
              <Route path="scan" element={<FoodRecognition />} />

              {/* Histórico de refeições */}
              <Route path="history" element={<History />} />

              {/* Dieta */}
              <Route path="diet" element={<Diet />} />

              {/* Treinos */}
              <Route path="workouts" element={<Workouts />} />

              {/* Perfil */}
              <Route path="profile" element={<Profile />} />

              {/* Stats (pode ser acessado do Dashboard) */}
              <Route path="stats" element={<Stats />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
