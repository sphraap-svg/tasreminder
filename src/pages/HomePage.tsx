import React from 'react';
import { CalendarCard } from '../components/ui/CalendarCard';
import { ClockCard } from '../components/home/ClockCard';
import { NextTaskCard } from '../components/home/NextTaskCard';
import { TodaySummaryCard } from '../components/home/TodaySummaryCard';

export function HomePage() {
  return (
    <div className="home-page-bg flex flex-col gap-3 pt-2 pb-4">
      {/* Greeting */}
      <div className="home-card-enter" style={{ animationDelay: '0ms' }}>
        <h1 className="text-xl font-black text-gray-900 dark:text-gray-50 tracking-tight px-1">
          سلام 👋
        </h1>
      </div>

      {/* Full-width calendar */}
      <div className="home-card-enter" style={{ animationDelay: '60ms' }}>
        <CalendarCard />
      </div>

      {/* Clock + Next task — side by side */}
      <div className="grid grid-cols-2 gap-3 home-card-enter" style={{ animationDelay: '120ms' }}>
        <ClockCard />
        <NextTaskCard />
      </div>

      {/* Today summary — full width */}
      <div className="home-card-enter" style={{ animationDelay: '180ms' }}>
        <TodaySummaryCard />
      </div>
    </div>
  );
}
