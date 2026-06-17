import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav, SideNav } from './BottomNav';
import { ToastContainer } from '../ui/Toast';
import { useReminderPoller } from '../../hooks/useReminderPoller';

export function AppLayout() {
  useReminderPoller();

  return (
    <div className="pinboard-paper min-h-screen flex flex-row-reverse">
      {/* Desktop sidebar (right side in RTL) */}
      <SideNav />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 px-4 sm:px-6 pb-24 md:pb-8 max-w-2xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
