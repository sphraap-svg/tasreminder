import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { TodayPage } from './pages/TodayPage';
import { ArchivePage } from './pages/ArchivePage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { CalendarPage } from './pages/CalendarPage';
import { DeskPage } from './pages/DeskPage';
import { isSupabaseConfigured } from './lib/supabase';
import { useAuth } from './context/AuthContext';

function WorkspaceRoute() {
  const { user, loading } = useAuth();
  if (!isSupabaseConfigured) return <Navigate to="/home" replace />;
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <WorkspacePage />;
}

function LoginRoute() {
  const { user, loading } = useAuth();
  if (!isSupabaseConfigured) return <Navigate to="/home" replace />;
  if (loading) return null;
  if (user) return <Navigate to="/workspace" replace />;
  return <LoginPage />;
}

export default function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <ToastProvider>
          <AuthProvider>
            <WorkspaceProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                  <Route path="/" element={<Navigate to="/home" replace />} />
                  <Route path="/login" element={<LoginRoute />} />
                  <Route element={<AppLayout />}>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/today" element={<TodayPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/desk" element={<DeskPage />} />
                    <Route path="/archive" element={<ArchivePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/workspace" element={<WorkspaceRoute />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
              </BrowserRouter>
            </WorkspaceProvider>
          </AuthProvider>
        </ToastProvider>
      </TaskProvider>
    </ThemeProvider>
  );
}
