import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ThemeMode } from '../types';
import {
  requestNotificationPermission,
  getNotificationPermission,
  isNotificationSupported,
  sendTestNotification,
} from '../utils/notifications';
import { clearAllData } from '../utils/storage';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'light', label: 'روشن',  icon: '☀️' },
  { value: 'dark',  label: 'تاریک', icon: '🌙' },
  { value: 'system',label: 'سیستم', icon: '⚙️' },
];

function SettingCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-surface rounded-2xl p-5">
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">
      {children}
    </h2>
  );
}

// ─── Notification status pill ─────────────────────────────────────────────────

const PERM_LABEL: Record<NotificationPermission, string> = {
  granted: 'فعال است',
  denied:  'غیرفعال / رد شده',
  default: 'درخواست نشده',
};

const PERM_COLOR: Record<NotificationPermission, string> = {
  granted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  denied:  'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  default: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { seedTasks, clearAll } = useTasks();
  const { addToast } = useToast();

  const supported = isNotificationSupported();

  const [permission,     setPermission]     = useState<NotificationPermission>(getNotificationPermission());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSeedConfirm,  setShowSeedConfirm]  = useState(false);
  const [requestingPerm,   setRequestingPerm]   = useState(false);

  async function handleRequestPermission() {
    setRequestingPerm(true);
    const result = await requestNotificationPermission();
    setPermission(result);
    setRequestingPerm(false);
    if (result === 'granted') {
      addToast('یادآوری‌های مرورگر فعال شدند 🔔', 'success');
    } else if (result === 'denied') {
      addToast('دسترسی رد شد — از تنظیمات مرورگر فعال کنید', 'error');
    }
  }

  function handleTestNotification() {
    sendTestNotification();
    addToast('اعلان آزمایشی ارسال شد 🔔', 'info');
  }

  function handleClearAll() {
    clearAll();
    clearAllData();
    setShowClearConfirm(false);
    addToast('همه داده‌ها پاک شدند', 'info');
  }

  function handleSeed() {
    seedTasks();
    setShowSeedConfirm(false);
    addToast('داده‌های نمونه بارگذاری شدند ✓', 'success');
  }

  return (
    <div className="flex flex-col gap-6">
      <Header title="تنظیمات" />

      {/* ── Theme ──────────────────────────────────────────────────── */}
      <div>
        <SectionTitle>ظاهر</SectionTitle>
        <SettingCard>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">حالت نمایش</p>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-medium transition-colors
                  ${theme === opt.value
                    ? 'border-violet-400 bg-white/70 dark:bg-violet-900/25 text-violet-700 dark:text-violet-300'
                    : 'border-white/50 dark:border-violet-900/30 text-gray-600 dark:text-gray-300 hover:border-white/80 dark:hover:border-violet-700/40'}`}
              >
                <span className="text-lg">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </SettingCard>
      </div>

      {/* ── Notifications ──────────────────────────────────────────── */}
      <div>
        <SectionTitle>اعلان‌ها و یادآوری</SectionTitle>
        <SettingCard>
          {!supported ? (
            /* Unsupported browser */
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">🔕</span>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  اعلان‌ها پشتیبانی نمی‌شوند
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  مرورگر شما از Web Notification API پشتیبانی نمی‌کند.
                  از Chrome، Firefox یا Safari به‌روز استفاده کنید.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Status row */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {permission === 'granted' ? '🔔' : permission === 'denied' ? '🔕' : '🔔'}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      اعلان‌های مرورگر
                    </p>
                    <span className={`inline-block mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${PERM_COLOR[permission]}`}>
                      {PERM_LABEL[permission]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {permission === 'default' && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleRequestPermission}
                  loading={requestingPerm}
                  className="w-full justify-center"
                >
                  فعال‌سازی اعلان‌ها 🔔
                </Button>
              )}

              {permission === 'granted' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleTestNotification}
                  className="w-full justify-center"
                >
                  ارسال اعلان آزمایشی
                </Button>
              )}

              {permission === 'denied' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  دسترسی رد شده است. برای فعال‌سازی:<br />
                  <span className="font-semibold">تنظیمات مرورگر ← حریم خصوصی و امنیت ← اعلان‌های سایت</span>
                </div>
              )}

              {/* Limitation notice */}
              <div className="mt-4 pt-4 border-t border-white/50 dark:border-violet-900/30 space-y-1.5">
                <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
                  ⚠️ <span className="font-medium">محدودیت:</span> یادآوری‌ها تا زمانی که برنامه در مرورگر باز باشد کار می‌کنند.
                  برای یادآوری در پس‌زمینه، برنامه را به عنوان PWA نصب کنید.
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-600 leading-relaxed">
                  برای اعلان‌های قابل اعتماد روی موبایل (حتی در پس‌زمینه)، نسخه آینده از Firebase Cloud Messaging پشتیبانی خواهد کرد.
                </p>
              </div>
            </>
          )}
        </SettingCard>
      </div>

      {/* ── PWA install ────────────────────────────────────────────── */}
      <div>
        <SectionTitle>نصب برنامه</SectionTitle>
        <SettingCard>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            نصب به عنوان اپلیکیشن
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
            این برنامه از PWA پشتیبانی می‌کند. در مرورگر روی گزینه «افزودن به صفحه اصلی» یا «نصب» کلیک کنید تا مثل یک اپ روی گوشی یا دسکتاپ شما باشد.
          </p>
        </SettingCard>
      </div>

      {/* ── Data management ────────────────────────────────────────── */}
      <div>
        <SectionTitle>مدیریت داده</SectionTitle>
        <SettingCard>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  بارگذاری داده‌های نمونه
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  وظایف نمونه فارسی برای آزمایش
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setShowSeedConfirm(true)}>
                بارگذاری
              </Button>
            </div>

            <div className="border-t border-white/50 dark:border-violet-900/30 pt-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  پاک کردن همه داده‌ها
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  این عمل قابل بازگشت نیست
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={() => setShowClearConfirm(true)}>
                پاک کردن
              </Button>
            </div>
          </div>
        </SettingCard>
      </div>

      {/* App version */}
      <div className="text-center py-2 text-xs text-gray-400 dark:text-gray-600">
        یادآور — نسخه ۱.۰.۰ · ساخته‌شده با ❤️
      </div>

      <ConfirmDialog
        open={showClearConfirm}
        title="پاک کردن همه داده‌ها"
        message="همه وظایف، تنظیمات و داده‌های ذخیره‌شده پاک می‌شوند. این کار قابل بازگشت نیست."
        confirmLabel="بله، پاک کن"
        danger
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />
      <ConfirmDialog
        open={showSeedConfirm}
        title="جایگزینی با داده‌های نمونه"
        message="داده‌های فعلی با وظایف نمونه جایگزین می‌شوند. ادامه می‌دهید؟"
        confirmLabel="جایگزین کن"
        onConfirm={handleSeed}
        onCancel={() => setShowSeedConfirm(false)}
      />
    </div>
  );
}
