# یادآور — مدیریت وظایف روزانه

یک وب‌اپ شخصی برای مدیریت و یادآوری وظایف روزانه، ساخته‌شده با React + Vite + TypeScript + Tailwind CSS.

## ویژگی‌ها

- ✅ ایجاد، ویرایش و حذف وظیفه
- 📅 نمای امروز و نمای هفتگی (شنبه تا جمعه)
- 🔁 وظایف تکراری (روزانه / هفتگی / ماهانه)
- 🔔 یادآوری در مرورگر (Browser Notification API)
- 🌙 حالت تاریک / روشن / سیستم
- 📦 ذخیره‌سازی محلی (localStorage)
- 📲 قابل نصب به عنوان PWA
- 🔍 جستجو و فیلتر وظایف
- 🗄️ آرشیو وظایف تکمیل‌شده
- 🇮🇷 رابط کاربری فارسی (RTL) با تاریخ شمسی

## تکنولوژی

| ابزار | نسخه |
|---|---|
| React | 18 |
| Vite | 5 |
| TypeScript | 5 (strict) |
| Tailwind CSS | 3 |
| React Router | 6 |
| dayjs | 1.11 |
| vite-plugin-pwa | 0.20 |

## راه‌اندازی

```bash
# نصب وابستگی‌ها
npm install

# اجرا در حالت توسعه
npm run dev

# ساخت نسخه نهایی
npm run build

# پیش‌نمایش نسخه نهایی
npm run preview
```

برنامه روی `http://localhost:5173` اجرا می‌شود.

## ساختار پروژه

```
src/
├── types/          # تعریف TypeScript types
├── data/           # داده‌های نمونه اولیه
├── utils/          # توابع کمکی (تاریخ، storage، یادآوری، تکرار)
├── context/        # مدیریت state (Task، Theme، Toast)
├── hooks/          # هوک یادآوری (polling هر ۶۰ ثانیه)
├── components/
│   ├── layout/     # AppLayout، Header، BottomNav، SideNav
│   ├── ui/         # Button، Modal، Toast، EmptyState، Badge
│   ├── tasks/      # TaskItem، TaskList، TaskForm، QuickAddTask
│   └── filters/    # SearchBar، FilterBar
└── pages/          # TodayPage، WeekPage، ArchivePage، SettingsPage
```

## منطق یادآوری

یادآوری‌ها تا زمانی که برنامه در مرورگر باز است کار می‌کنند:

1. هر ۶۰ ثانیه وظایف بررسی می‌شوند
2. اگر وظیفه‌ای `reminderEnabled = true` داشته باشد و ساعت آن گذشته باشد (در بازه ۶۰ دقیقه گذشته) و `reminderSentAt` خالی باشد → یادآوری اجرا می‌شود
3. پس از ارسال، `reminderSentAt` ثبت می‌شود تا دوباره تکرار نشود
4. یادآوری‌های واقعی در پس‌زمینه نیاز به backend و push notification دارند

## محدودیت‌ها

- یادآوری‌ها فقط در زمان باز بودن برنامه کار می‌کنند
- آیکون‌های PWA نمونه هستند — برای انتشار واقعی با ابزار `pwa-asset-generator` آیکون اصلی بسازید
- ورودی تاریخ با تقویم میلادی است (محدودیت مرورگر)

## لایسنس

MIT
