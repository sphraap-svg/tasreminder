import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const err = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password);

    setLoading(false);

    if (err) {
      setError(err);
    } else if (mode === 'signup') {
      setSuccessMsg('ثبت‌نام انجام شد. ایمیل تأیید را بررسی کنید.');
    } else {
      navigate('/workspace', { replace: true });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #100a20 0%, #1a0840 55%, #200a32 100%)'}}>
      {/* Blobs matching calendar dark palette */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl" style={{background: 'rgba(120,60,230,0.38)'}} />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-3xl" style={{background: 'rgba(200,80,60,0.30)'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl" style={{background: 'rgba(150,60,220,0.24)'}} />
      </div>

      {/* Card */}
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden"
        style={{
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          background: 'rgba(255,255,255,0.10)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
          border: '1px solid rgba(255,255,255,0.18)',
        }}
      >
        {/* Gradient border overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{
            background: 'linear-gradient(142deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.02) 100%)',
            WebkitMaskImage: 'linear-gradient(#fff 0 0)',
            maskImage: 'linear-gradient(#fff 0 0)',
            padding: '1.5px',
          }}
          aria-hidden
        />

        <div className="relative px-8 py-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg mb-3" style={{background: 'linear-gradient(135deg, #1848F5 0%, #0A2ACC 100%)'}}>
              ی
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">میزکار تیمی</h1>
            <p className="text-sm text-white/60 mt-1">
              {mode === 'login' ? 'وارد حساب کاربری شو' : 'ساخت حساب جدید'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-2xl bg-white/10 p-1 mb-6 gap-1">
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  mode === m
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {m === 'login' ? 'ورود' : 'ثبت‌نام'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">ایمیل</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                dir="ltr"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">رمز عبور</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                dir="ltr"
                placeholder="••••••••"
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-sm">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg transition-all duration-200 active:scale-95 hover:opacity-90"
            style={{background: 'linear-gradient(135deg, #1848F5 0%, #0A2ACC 100%)', boxShadow: '0 4px 20px rgba(24,72,245,0.40)'}}
            >
              {loading ? 'در حال پردازش...' : mode === 'login' ? 'ورود' : 'ثبت‌نام'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
