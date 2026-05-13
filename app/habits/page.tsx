'use client';
import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import { format, subDays, startOfMonth, eachDayOfInterval, endOfMonth, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Habit, HabitCategory } from '@/types';

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444'];
const ICONS = ['💪', '📚', '🧘', '🎽', '💧', '😴', '🌿', '🎵', '✍️', '💊', '🥦', '🚀', '💚', '🤖', '☕', '🐶'];
const CATEGORIES: { value: HabitCategory; label: string; icon: string }[] = [
  { value: 'health', label: 'Здоровье', icon: '💚' },
  { value: 'fitness', label: 'Спорт', icon: '🎽' },
  { value: 'learning', label: 'Обучение', icon: '📚' },
  { value: 'productivity', label: 'Продуктивность', icon: '🚀' },
  { value: 'mindfulness', label: 'Осознанность', icon: '🧘' },
  { value: 'social', label: 'Общение', icon: '🤝' },
  { value: 'other', label: 'Другое', icon: '✨' },
];

function AddHabitModal({ onClose }: { onClose: () => void }) {
  const { addHabit } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('health');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addHabit({ name, description, category, frequency, color: selectedColor, icon: selectedIcon, targetDaysPerWeek: 7 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-elevated rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Новая привычка</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-2">Название</label>
            <input className="input-field" placeholder="Например: Утренняя зарядка" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">Описание</label>
            <textarea className="input-field resize-none" rows={2} placeholder="Зачем эта привычка?" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">Категория</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(c => (
                <button key={c.value} type="button" onClick={() => setCategory(c.value)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-sm transition-all ${
                    category === c.value ? 'border border-purple-500 text-white' : 'text-slate-400 hover:text-white'
                  }`} style={{ background: category === c.value ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)' }}>
                  <span>{c.icon}</span> {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">Иконка</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button key={icon} type="button" onClick={() => setSelectedIcon(icon)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    selectedIcon === icon ? 'border-2 border-purple-500 scale-110' : 'hover:scale-105'
                  }`} style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">Цвет</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setSelectedColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${selectedColor === c ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-transparent' : 'hover:scale-110'}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">Периодичность</label>
            <div className="flex gap-2">
              {(['daily', 'weekly'] as const).map(f => (
                <button key={f} type="button" onClick={() => setFrequency(f)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    frequency === f ? 'text-white' : 'text-slate-400'
                  }`} style={{ background: frequency === f ? 'linear-gradient(135deg, #7c3aed, #3b82f6)' : 'rgba(255,255,255,0.05)' }}>
                  {f === 'daily' ? 'Ежедневно' : 'Еженедельно'}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary w-full mt-2">Добавить привычку</button>
        </form>
      </div>
    </div>
  );
}

function HabitStreak({ habit }: { habit: Habit }) {
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = subDays(new Date(), i);
    const key = format(d, 'yyyy-MM-dd');
    if (habit.completions[key]) streak++;
    else break;
  }
  return <span>{streak}</span>;
}

export default function HabitsPage() {
  const { currentUser, habits, completeHabit, uncompleteHabit, deleteHabit } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const today = format(new Date(), 'yyyy-MM-dd');
  const myHabits = habits.filter(h => h.userId === currentUser?.id);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return { date: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE', { locale: ru }), isToday: isSameDay(d, new Date()) };
  });

  const weekChartData = useMemo(() => {
    return weekDays.map(d => ({
      day: d.label,
      done: myHabits.filter(h => h.completions[d.date]).length,
    }));
  }, [myHabits, weekDays]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return eachDayOfInterval({ start, end });
  }, []);

  const selected = myHabits.find(h => h.id === selectedHabit);

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Navigation />
        <main className="flex-1 lg:ml-64 pb-24 lg:pb-0">
          <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Привычки</h1>
                <p className="text-slate-500 text-sm mt-1">{myHabits.length} активных</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-black/30 rounded-xl p-1">
                  {(['list', 'calendar'] as const).map(v => (
                    <button key={v} onClick={() => setView(v)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        view === v ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}>
                      {v === 'list' ? 'Лист' : 'Календарь'}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowAdd(true)} className="btn-primary text-sm px-4 py-2">
                  + Добавить
                </button>
              </div>
            </div>

            {/* Week summary chart */}
            <div className="card mb-6">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Недельная активность</h3>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={weekChartData} barSize={32}>
                  <defs>
                    <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" />
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#13132e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12 }} />
                  <Bar dataKey="done" name="Выполнено" fill="url(#barG)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {view === 'list' ? (
              <div className="space-y-3">
                {myHabits.length === 0 ? (
                  <div className="card text-center py-16">
                    <p className="text-4xl mb-4">🌱</p>
                    <p className="text-slate-400">Привычек пока нет</p>
                    <button onClick={() => setShowAdd(true)} className="btn-primary mt-4 text-sm px-6">Добавить первую</button>
                  </div>
                ) : myHabits.map(h => (
                  <div key={h.id} className="card p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: `${h.color}20`, border: `1px solid ${h.color}40` }}>
                        {h.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-semibold">{h.name}</h3>
                            {h.description && <p className="text-slate-500 text-xs mt-0.5">{h.description}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${h.color}20`, color: h.color }}>
                              {h.frequency === 'daily' ? 'Ежедневно' : 'Еженедельно'}
                            </span>
                            <button onClick={() => deleteHabit(h.id)} className="text-slate-600 hover:text-red-400 text-xs transition-colors">×</button>
                          </div>
                        </div>
                        {/* Week dots */}
                        <div className="flex items-center gap-1.5 mt-3">
                          {weekDays.map(d => (
                            <button key={d.date}
                              onClick={() => h.completions[d.date] ? uncompleteHabit(h.id, d.date) : completeHabit(h.id, d.date)}
                              title={d.label}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                                d.isToday ? 'ring-1 ring-white/30' : ''
                              }`}
                              style={{
                                background: h.completions[d.date] ? h.color : 'rgba(255,255,255,0.05)',
                                color: h.completions[d.date] ? 'white' : '#64748b',
                              }}>
                              {h.completions[d.date] ? '✓' : d.label[0]}
                            </button>
                          ))}
                          <span className="ml-2 text-xs text-slate-500">🔥 <HabitStreak habit={h} /></span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Calendar view */
              <div className="space-y-6">
                {myHabits.map(h => (
                  <div key={h.id} className="card">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{h.icon}</span>
                      <div>
                        <h3 className="text-white font-semibold">{h.name}</h3>
                        <p className="text-xs text-slate-500">Календарь за месяц</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => (
                        <div key={d} className="text-center text-xs text-slate-600 py-1">{d}</div>
                      ))}
                      {/* Offset for first day */}
                      {Array.from({ length: (monthDays[0].getDay() + 6) % 7 }).map((_, i) => (
                        <div key={`off-${i}`} />
                      ))}
                      {monthDays.map(d => {
                        const key = format(d, 'yyyy-MM-dd');
                        const done = h.completions[key];
                        const isToday = isSameDay(d, new Date());
                        return (
                          <button key={key}
                            onClick={() => done ? uncompleteHabit(h.id, key) : completeHabit(h.id, key)}
                            className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                              isToday ? 'ring-1 ring-white/40' : ''
                            }`}
                            style={{ background: done ? h.color : 'rgba(255,255,255,0.04)', color: done ? 'white' : '#64748b' }}>
                            {d.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {myHabits.length === 0 && (
                  <div className="card text-center py-12">
                    <p className="text-slate-400">Добавьте привычки для просмотра календаря</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      {showAdd && <AddHabitModal onClose={() => setShowAdd(false)} />}
    </AuthGuard>
  );
}
