import React, { useState, useEffect } from 'react';

function fmtTime(): string {
  return new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

function fmtDate(): string {
  return new Intl.DateTimeFormat('fa-IR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
}

export function ClockCard() {
  const [time, setTime] = useState(fmtTime);
  const [date, setDate] = useState(fmtDate);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(fmtTime());
      setDate(fmtDate());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="home-card p-5 flex flex-col justify-between min-h-[130px]">
      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-wide">ساعت</span>
      <div>
        <div
          className="text-4xl font-black tracking-tight text-gray-900 dark:text-gray-50 tabular-nums leading-none"
          dir="ltr"
        >
          {time}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 leading-snug">{date}</p>
      </div>
      {/* Decorative gradient ring */}
      <div
        className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
        aria-hidden
      />
    </div>
  );
}
