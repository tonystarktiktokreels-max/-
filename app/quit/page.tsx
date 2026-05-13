'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import { formatDistanceToNow, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { ru } from 'date-fns/locale';
import { QuitHabit } from '@/types';

const QUIT_ICONS = ['🚬', '🍺', '🍫', '📱', '🍮', '🔫', '🍸', '🎮', '💸', '📊', '☕', '🛍️'];
const QUIT_COLORS = ['#ef4444', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#06b6d4'];

const TRIGGERS = [
  'Стресс', 'Скука', 'Социальное давление', 'Усталость', 'Грусть', 'Привычка', 'Одиночество', 'Другое'
];

const MILESTONES = [
  { days: 1, label: '24 часа', icon: '⚡', color: '#06b6d4' },
  { days: 3, label: '3 дня', icon: '🌱', color: '#10b981' },
  { days: 7, label: 'Неделя', icon: '🔥', color: '#f59e0b' },
  { days: 14, label: '2 недели', icon: '⭐', color: '#a855f7' },
  { days: 30, label: 'Месяц', icon: '🏆', color: '#3b82f6' },
  { days: 90, label: '3 месяца', icon: '💎', color: '#7c3aed' },
  { days: 180, label: 'Полгода', icon: '👑', color: '#ec4899' },
  { days: 365, label: 'Год', icon: '🌟', color: '#eab308' },
];

function AddQuitModal({ onClose }: { onClose: () => void }) {
  const { addQuitHabit } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState('');
  const [motivation, setMotivation] = useState('');
  const [color, setColor] = useState(QUIT_COLORS[0]);
  const [icon, setIcon] = useState(QUIT_ICONS[0]);
  const [category, setCategory] = useState('Здоровье');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addQuitHabit({ name, description, trigger, motivation, color, icon, category });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-elevated rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Отказаться от привычки</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-2">Что хочу бросить?</label>
            <input className="input-field" placeholder="Например: Курение" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">Почему я хочу бросить?</label>
            <textarea className="input-field resize-none" rows={2} placeholder="Моя мотивация..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">Что обычно триггерит?</label>
            <div className="flex flex-wrap gap-2">
              {TRIGGERS.map(t => (
                <button key={t} type="button" onClick={() => setTrigger(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                    trigger === t ? 'bg-red-500/20 border border-red-500/50 text-red-300' : 'text-slate-400 hover:text-white'
                  }`} style={{ background: trigger === t ? undefined : 'rgba(255,255,255,0.05)' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">Моя мотивация</label>
            <input className="input-field" placeholder="Зачем мне это нужно?" value={motivation} onChange={e => setMotivation(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">Иконка</label>
            <div className="flex flex-wrap gap-2">
              {QUIT_ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    icon === ic ? 'border-2 border-red-500 scale-110' : 'hover:scale-105'
                  }`} style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">Цвет</label>
            <div className="flex gap-2">
              {QUIT_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${color === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
          <button type="submit" className="w-full py-3 rounded-xl font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)' }}>
            Заносить в трекер
          </button>
        </form>
      </div>
    </div>
  );
}

function QuitCard({ habit }: { habit: QuitHabit }) {
  const { relapse, deleteQuitHabit } = useStore();
  const [confirmRelapse, setConfirmRelapse] = useState(false);

  const startDate = new Date(habit.startDate);
  const days = differenceInDays(new Date(), startDate);
  const hours = differenceInHours(new Date(), startDate) % 24;
  const minutes = differenceInMinutes(new Date(), startDate) % 60;
  const totalDays = Math.floor((Date.now() - startDate.getTime()) / 86400000);

  const nextMilestone = MILESTONES.find(m => m.days > totalDays);
  const lastMilestone = [...MILESTONES].reverse().find(m => m.days <= totalDays);
  const progressToNext = nextMilestone
    ? ((totalDays - (lastMilestone?.days || 0)) / (nextMilestone.days - (lastMilestone?.days || 0))) * 100
    : 100;

  const handleRelapse = () => {
    relapse(habit.id);
    setConfirmRelapse(false);
  };

  return (
    <div className="card relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: habit.color }} />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: `${habit.color}20`, border: `1px solid ${habit.color}40` }}>
            {habit.icon}
          </div>
          <div>
            <h3 className="text-white font-bold">{habit.name}</h3>
            {habit.description && <p className="text-slate-500 text-xs mt-0.5">{habit.description}</p>}
          </div>
        </div>
        <button onClick={() => deleteQuitHabit(habit.id)} className="text-slate-600 hover:text-red-400 text-sm transition-colors">×</button>
      </div>

      {/* Timer */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[{ val: days, label: 'дней' }, { val: hours, label: 'часов' }, { val: minutes, label: 'минут' }].map(t => (
          <div key={t.label} className="text-center p-3 rounded-xl" style={{ background: `${habit.color}10` }}>
            <div className="text-2xl font-black text-white">{t.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{t.label}</div>
          </div>
        ))}
      </div>

      {/* Progress to next milestone */}
      {nextMilestone && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">До {nextMilestone.label} {nextMilestone.icon}</span>
            <span style={{ color: habit.color }}>{Math.round(progressToNext)}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressToNext}%`, background: `linear-gradient(90deg, ${habit.color}, ${habit.color}80)` }} />
          </div>
        </div>
      )}

      {/* Milestones row */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        {MILESTONES.map(m => (
          <div key={m.days} className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl text-xs ${
            totalDays >= m.days ? 'text-white' : 'text-slate-600'
          }`} style={{ background: totalDays >= m.days ? `${m.color}20` : 'rgba(255,255,255,0.03)' }}>
            <span className={totalDays < m.days ? 'grayscale opacity-40' : ''}>{m.icon}</span>
            <span>{m.label}</span>
          </div>
        ))}
      </div>

      {/* Trigger + motivation */}
      {habit.trigger && (
        <div className="text-xs text-slate-500 mb-1">⚠️ Триггер: {habit.trigger}</div>
      )}
      {habit.motivation && (
        <div className="text-xs text-slate-400 italic mb-3">«{habit.motivation}»</div>
      )}

      {/* Relapses */}
      {habit.relapses.length > 0 && (
        <div className="text-xs text-slate-600 mb-3">Срывов: {habit.relapses.length}</div>
      )}

      {/* Relapse button */}
      {confirmRelapse ? (
        <div className="flex gap-2">
          <button onClick={handleRelapse} className="flex-1 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)' }}>
            Да, был срыв
          </button>
          <button onClick={() => setConfirmRelapse(false)} className="flex-1 py-2 rounded-xl text-sm text-slate-400"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            Отмена
          </button>
        </div>
      ) : (
        <button onClick={() => setConfirmRelapse(true)}
          className="w-full py-2 rounded-xl text-xs text-slate-600 hover:text-red-400 transition-colors"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          Зафиксировать срыв
        </button>
      )}
    </div>
  );
}

const TIPS = [
  'Помни: желание длится 20 минут. Пережди, и оно пройдёт.',
  'Найди замену: прогуляйтесь, пейте воду, позвоните другу.',
  'Вспомните, почему вы начали. Ваша цель сильнее временного желания.',
  'Каждый час без привычки — это победа. Собирайте их.',
  'Срыв — это не провал. Это урок. Встаньте и продолжайте.',
];

export default function QuitPage() {
  const { currentUser, quitHabits } = useStore();
  const [showAdd, setShowAdd] = useState(false);

  const myQuitHabits = quitHabits.filter(h => h.userId === currentUser?.id);
  const tip = TIPS[new Date().getDay() % TIPS.length];

  const totalDaysClean = myQuitHabits.reduce((sum, h) => {
    return sum + Math.floor((Date.now() - new Date(h.startDate).getTime()) / 86400000);
  }, 0);

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Navigation />
        <main className="flex-1 lg:ml-64 pb-24 lg:pb-0">
          <div className="max-w-4xl mx-auto px-4 py-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Отказ от привычек</h1>
                <p className="text-slate-500 text-sm mt-1">Следи за стриком без срывов</p>
              </div>
              <button onClick={() => setShowAdd(true)} className="btn-primary text-sm px-4 py-2"
                style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)' }}>
                + Добавить
              </button>
            </div>

            {/* Tip banner */}
            <div className="card mb-6 flex items-start gap-4"
              style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(245,158,11,0.05))' }}>
              <span className="text-2xl">💡</span>
              <div>
                <div className="text-xs text-orange-400 font-medium mb-1">Совет дня</div>
                <p className="text-slate-300 text-sm">{tip}</p>
              </div>
            </div>

            {/* Summary */}
            {myQuitHabits.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="card text-center">
                  <div className="text-3xl font-black text-white">{myQuitHabits.length}</div>
                  <div className="text-xs text-slate-500 mt-1">активных целей</div>
                </div>
                <div className="card text-center">
                  <div className="text-3xl font-black text-gradient">{totalDaysClean}</div>
                  <div className="text-xs text-slate-500 mt-1">дней всего</div>
                </div>
                <div className="card text-center col-span-2 sm:col-span-1">
                  <div className="text-3xl">{myQuitHabits.reduce((s, h) => s + h.relapses.length, 0) === 0 ? '🥇' : '💪'}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {myQuitHabits.reduce((s, h) => s + h.relapses.length, 0) === 0 ? 'Ни одного срыва!' : `Срывов: ${myQuitHabits.reduce((s, h) => s + h.relapses.length, 0)}`}
                  </div>
                </div>
              </div>
            )}

            {/* Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {myQuitHabits.length === 0 ? (
                <div className="sm:col-span-2 card text-center py-16">
                  <p className="text-4xl mb-4">🦋</p>
                  <p className="text-slate-400 mb-2">Нет активных целей</p>
                  <p className="text-slate-600 text-sm mb-4">Добавьте привычку, от которой хотите избавиться</p>
                  <button onClick={() => setShowAdd(true)} className="btn-primary text-sm px-6"
                    style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)' }}>
                    Начать борьбу
                  </button>
                </div>
              ) : myQuitHabits.map(h => <QuitCard key={h.id} habit={h} />)}
            </div>
          </div>
        </main>
      </div>
      {showAdd && <AddQuitModal onClose={() => setShowAdd(false)} />}
    </AuthGuard>
  );
}
