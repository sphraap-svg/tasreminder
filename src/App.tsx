import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { TodayPage } from './pages/TodayPage';
import { WeekPage } from './pages/WeekPage';
import { ArchivePage } from './pages/ArchivePage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <ToastProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<Navigate to="/today" replace />} />
              <Route element={<AppLayout />}>
                <Route path="/today" element={<TodayPage />} />
                <Route path="/week" element={<WeekPage />} />
                <Route path="/archive" element={<ArchivePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/today" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </TaskProvider>
    </ThemeProvider>
  );
}
