'use client';
import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import { ru } from 'date-fns/locale';

function CircularProgress({ value, size = 80, strokeWidth = 8, color = '#7c3aed' }: {
  value: number; size?: number; strokeWidth?: number; color?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <defs>
        <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#pg)" strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
    </svg>
  );
}

export default function Dashboard() {
  const { currentUser, habits, quitHabits, teams } = useStore();

  const today = format(new Date(), 'yyyy-MM-dd');
  const myHabits = habits.filter(h => h.userId === currentUser?.id);
  const myQuitHabits = quitHabits.filter(h => h.userId === currentUser?.id);
  const myTeams = teams.filter(t => t.memberIds.includes(currentUser?.id || ''));

  const todayHabits = myHabits.filter(h => h.frequency === 'daily');
  const todayCompleted = todayHabits.filter(h => h.completions[today]);
  const completionRate = todayHabits.length > 0 ? Math.round((todayCompleted.length / todayHabits.length) * 100) : 0;

  // Weekly completion data
  const weekData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const key = format(d, 'yyyy-MM-dd');
      const total = myHabits.filter(h => h.frequency === 'daily').length;
      const done = myHabits.filter(h => h.frequency === 'daily' && h.completions[key]).length;
      return {
        day: format(d, 'EEE', { locale: ru }),
        done,
        total,
        rate: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    });
  }, [myHabits]);

  // Points history (mock based on completions)
  const pointsData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const key = format(d, 'yyyy-MM-dd');
      const pts = myHabits.filter(h => h.completions[key]).length * 10;
      return { day: format(d, 'EEE', { locale: ru }), points: pts };
    });
  }, [myHabits]);

  // Best streak
  const bestStreak = useMemo(() => {
    let best = 0;
    myHabits.forEach(h => {
      let streak = 0;
      for (let i = 0; i < 365; i++) {
        const d = subDays(new Date(), i);
        const key = format(d, 'yyyy-MM-dd');
        if (h.completions[key]) streak++;
        else break;
      }
      if (streak > best) best = streak;
    });
    return best;
  }, [myHabits]);

  const longestQuitStreak = useMemo(() => {
    return myQuitHabits.reduce((best, h) => {
      const start = new Date(h.startDate);
      const days = Math.floor((Date.now() - start.getTime()) / 86400000);
      return days > best ? days : best;
    }, 0);
  }, [myQuitHabits]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass-elevated rounded-xl p-3 text-sm">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}{p.name === 'Выполнено' ? '%' : ''}</p>
        ))}
      </div>
    );
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Navigation />
        <main className="flex-1 lg:ml-64 pb-24 lg:pb-0">
          <div className="max-w-6xl mx-auto px-4 py-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">
                    Привет, {currentUser?.avatar} {currentUser?.username}!
                  </h1>
                  <p className="text-slate-400 mt-1">{format(new Date(), 'd MMMM yyyy', { locale: ru })}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gradient">{currentUser?.points}</div>
                  <div className="text-xs text-slate-500">очков</div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Сегодня', value: `${todayCompleted.length}/${todayHabits.length}`, sub: 'привычек', color: '#7c3aed', icon: '✅' },
                { label: 'Лучший стрик', value: bestStreak, sub: 'дней', color: '#f59e0b', icon: '🔥' },
                { label: 'Без вред. прив.', value: longestQuitStreak, sub: 'дней', color: '#10b981', icon: '🦋' },
                { label: 'Команды', value: myTeams.length, sub: 'активных', color: '#3b82f6', icon: '👥' },
              ].map(s => (
                <div key={s.label} className="card fade-in">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">{s.label}</div>
                      <div className="text-2xl font-bold text-white">{s.value}</div>
                      <div className="text-xs mt-0.5" style={{ color: s.color }}>{s.sub}</div>
                    </div>
                    <span className="text-2xl">{s.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              {/* Today's progress */}
              <div className="card lg:col-span-1 flex flex-col items-center justify-center py-6">
                <h3 className="text-sm font-medium text-slate-400 mb-4">Прогресс сегодня</h3>
                <div className="relative mb-4">
                  <CircularProgress value={completionRate} size={120} strokeWidth={10} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{completionRate}%</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm text-center">
                  {todayCompleted.length === todayHabits.length && todayHabits.length > 0
                    ? '🎉 Все выполнено!'
                    : `Осталось ${todayHabits.length - todayCompleted.length} привычек`}
                </p>
                {todayHabits.length === 0 && (
                  <Link href="/habits" className="mt-3 text-xs text-purple-400 hover:text-purple-300">
                    + Добавить привычки
                  </Link>
                )}
              </div>

              {/* Weekly chart */}
              <div className="card lg:col-span-2">
                <h3 className="text-sm font-medium text-slate-400 mb-4">Выполнение за неделю (%)</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={weekData}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="rate" name="Выполнено" stroke="#7c3aed" fill="url(#areaGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Points chart + Today habits */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div className="card">
                <h3 className="text-sm font-medium text-slate-400 mb-4">Очки за неделю</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={pointsData}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="points" name="Очки" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Today habits quick list */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-400">Сегодня</h3>
                  <Link href="/habits" className="text-xs text-purple-400 hover:text-purple-300">все →</Link>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {todayHabits.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-slate-500 text-sm">Нет привычек</p>
                      <Link href="/habits" className="text-purple-400 text-xs mt-2 block">+ Добавить</Link>
                    </div>
                  ) : todayHabits.map(h => (
                    <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                      style={{ background: h.completions[today] ? `${h.color}15` : 'rgba(255,255,255,0.03)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: `${h.color}20` }}>{h.icon}</div>
                      <span className={`text-sm flex-1 ${h.completions[today] ? 'line-through text-slate-500' : 'text-white'}`}>
                        {h.name}
                      </span>
                      {h.completions[today] && <span className="text-green-400 text-sm">✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Teams quick view */}
            {myTeams.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-400">Мои команды</h3>
                  <Link href="/team" className="text-xs text-purple-400 hover:text-purple-300">все →</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {myTeams.slice(0, 3).map(t => (
                    <Link key={t.id} href={`/team/${t.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-900/10 transition-all"
                      style={{ background: `${t.color}08`, border: `1px solid ${t.color}20` }}>
                      <span className="text-2xl">{t.emoji}</span>
                      <div className="min-w-0">
                        <div className="text-white text-sm font-medium truncate">{t.name}</div>
                        <div className="text-slate-500 text-xs">{t.memberIds.length} участников</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
