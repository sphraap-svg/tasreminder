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
} from '../utils/notifications';
import { clearAllData } from '../utils/storage';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'light', label: 'روشن', icon: '☀️' },
  { value: 'dark', label: 'تاریک', icon: '🌙' },
  { value: 'system', label: 'سیستم', icon: '⚙️' },
];

function SettingCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
      {children}
    </h2>
  );
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { seedTasks, clearAll } = useTasks();
  const { addToast } = useToast();

  const [permission, setPermission] = useState<NotificationPermission>(
    getNotificationPermission()
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);
  const [requestingPerm, setRequestingPerm] = useState(false);

  async function handleRequestPermission() {
    setRequestingPerm(true);
    const result = await requestNotificationPermission();
    setPermission(result);
    setRequestingPerm(false);
    if (result === 'granted') {
      addToast('یادآوری‌های مرورگر فعال شدند 🔔', 'success');
    } else if (result === 'denied') {
      addToast('دسترسی رد شد. از تنظیمات مرورگر فعال کنید', 'error');
    }
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

  const permissionLabel: Record<NotificationPermission, string> = {
    granted: 'فعال است ✓',
    denied: 'غیرفعال / رد شده',
    default: 'درخواست نشده',
  };

  const permissionColor: Record<NotificationPermission, string> = {
    granted: 'text-emerald-600 dark:text-emerald-400',
    denied: 'text-red-500 dark:text-red-400',
    default: 'text-amber-600 dark:text-amber-400',
  };

  return (
    <div className="flex flex-col gap-6">
      <Header title="تنظیمات" />

      {/* Theme */}
      <div>
        <SectionTitle>ظاهر</SectionTitle>
        <SettingCard>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            حالت نمایش
          </p>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`
                  flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-medium transition-colors
                  ${theme === opt.value
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }
                `}
              >
                <span className="text-lg">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </SettingCard>
      </div>

      {/* Notifications */}
      <div>
        <SectionTitle>یادآوری</SectionTitle>
        <SettingCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                اعلان‌های مرورگر
              </p>
              <p className={`text-xs mt-0.5 ${permissionColor[permission]}`}>
                {permissionLabel[permission]}
              </p>
            </div>
            {permission !== 'granted' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleRequestPermission}
                loading={requestingPerm}
                disabled={permission === 'denied'}
              >
                {permission === 'denied' ? 'رد شده' : 'فعال‌سازی'}
              </Button>
            )}
          </div>

          {permission === 'denied' && (
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-xs text-amber-700 dark:text-amber-400">
              دسترسی توسط شما رد شده است. برای فعال‌سازی به تنظیمات مرورگر → اعلان‌های سایت بروید.
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
              ⚠️ یادآوری‌ها تا زمانی که این برنامه در مرورگر باز باشد کار می‌کنند.
              برای یادآوری‌های پایدار در پس‌زمینه، برنامه را به عنوان PWA نصب کنید.
              یادآوری‌های واقعی بدون سرور و push notification پشتیبانی نمی‌شوند.
            </p>
          </div>
        </SettingCard>
      </div>

      {/* PWA install hint */}
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

      {/* Data management */}
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

            <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex items-center justify-between">
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

      {/* App info */}
      <div className="text-center py-2 text-xs text-gray-400 dark:text-gray-600">
        یادآور — نسخه ۱.۰.۰ · ساخته‌شده با ❤️
      </div>

      {/* Confirm dialogs */}
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
