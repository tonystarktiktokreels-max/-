'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, register, currentUser } = useStore();

  useEffect(() => {
    if (currentUser) router.push('/dashboard');
  }, [currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    if (tab === 'login') {
      const result = login(email, password);
      if (!result.success) setError(result.error || '');
      else router.push('/dashboard');
    } else {
      if (!username.trim()) { setError('Введите имя пользователя'); setLoading(false); return; }
      const result = register(username, email, password);
      if (!result.success) setError(result.error || '');
      else router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'radial-gradient(ellipse at top left, rgba(124,58,237,0.15) 0%, #080818 50%, rgba(59,130,246,0.08) 100%)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center flex-1 px-16 py-12">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>⚡</div>
            <span className="text-2xl font-bold text-white">HabitFlow</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            Стройте
            <span className="text-gradient block">привычки вместе</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            Создавайте команды, отслеживайте прогресс, соревнуйтесь и поддерживайте друг друга на пути к лучшей версии себя.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '📊', title: 'Диаграммы прогресса', desc: 'Визуализация ваших достижений' },
              { icon: '👥', title: 'Командный чат', desc: 'Общайтесь и мотивируйте' },
              { icon: '🚫', title: 'Отказ от привычек', desc: 'Трекер стрика без срывов' },
              { icon: '🏆', title: 'Бонусы и задания', desc: 'Зарабатывайте очки вместе' },
            ].map(f => (
              <div key={f.title} className="card p-4">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="text-white font-semibold text-sm">{f.title}</div>
                <div className="text-slate-500 text-xs mt-1">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="glass-elevated rounded-3xl p-8 fade-in">
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>⚡</div>
              <span className="text-xl font-bold text-white">HabitFlow</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {tab === 'login' ? 'Добро пожаловать!' : 'Создать аккаунт'}
            </h2>
            <p className="text-slate-400 text-sm mb-8">
              {tab === 'login' ? 'Войдите в свой аккаунт' : 'Начните свой путь к лучшим привычкам'}
            </p>

            {/* Tabs */}
            <div className="flex bg-black/30 rounded-xl p-1 mb-6">
              {(['login', 'register'] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); setError(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    tab === t ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}>
                  {t === 'login' ? 'Войти' : 'Регистрация'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Имя пользователя</label>
                  <input className="input-field" placeholder="@username" value={username}
                    onChange={e => setUsername(e.target.value)} required />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Email</label>
                <input className="input-field" type="email" placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Пароль</label>
                <input className="input-field" type="password" placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="btn-primary w-full mt-2 flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : null}
                {loading ? 'Загрузка...' : tab === 'login' ? 'Войти' : 'Создать аккаунт'}
              </button>
            </form>
          </div>

          <p className="text-center text-slate-600 text-xs mt-6">
            Ваши данные хранятся локально в браузере
          </p>
        </div>
      </div>
    </div>
  );
}
