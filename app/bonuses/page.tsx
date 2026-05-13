'use client';
import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import { Achievement } from '@/types';
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const RARITY_CONFIG = {
  common: { label: 'Обычная', color: '#94a3b8', gradient: 'from-slate-600 to-slate-500' },
  rare: { label: 'Редкая', color: '#3b82f6', gradient: 'from-blue-600 to-blue-400' },
  epic: { label: 'Эпическая', color: '#7c3aed', gradient: 'from-purple-600 to-violet-400' },
  legendary: { label: 'Легендарная', color: '#eab308', gradient: 'from-yellow-500 to-orange-400' },
};

function AchievementCard({ achievement, unlocked }: { achievement: Achievement; unlocked: boolean }) {
  const cfg = RARITY_CONFIG[achievement.rarity];
  return (
    <div className={`card relative overflow-hidden transition-all duration-300 ${
      unlocked ? 'hover:scale-[1.02]' : 'opacity-50 grayscale'
    }`}>
      {unlocked && (
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20 pointer-events-none"
          style={{ background: cfg.color }} />
      )}
      {unlocked && achievement.rarity === 'legendary' && (
        <div className="absolute inset-0 rounded-[20px] pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.05), transparent)' }} />
      )}
      <div className="flex items-start gap-3">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
          unlocked ? '' : 'grayscale'
        }`} style={{
          background: unlocked
            ? `linear-gradient(135deg, ${cfg.color}30, ${cfg.color}10)`
            : 'rgba(255,255,255,0.05)',
          border: `1px solid ${unlocked ? cfg.color + '40' : 'rgba(255,255,255,0.05)'}`,
        }}>
          {unlocked ? achievement.icon : '🔒'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-bold text-sm ${unlocked ? 'text-white' : 'text-slate-500'}`}>
              {unlocked ? achievement.name : '???'}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full badge-${achievement.rarity}`}
              style={{ color: cfg.color }}>
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {unlocked ? achievement.description : 'Не разблокировано'}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs font-bold" style={{ color: unlocked ? cfg.color : '#475569' }}>+{achievement.points}</span>
            <span className="text-xs text-slate-600">очков</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BonusesPage() {
  const { currentUser, users, teams, getUnlockedAchievements, getAllAchievements, habits, quitHabits } = useStore();
  if (!currentUser) return null;

  const allAchievements = getAllAchievements();
  const unlockedAchievements = getUnlockedAchievements(currentUser.id);
  const unlockedIds = new Set(unlockedAchievements.map(a => a.id));

  const levelProgress = (currentUser.points % 500) / 500 * 100;
  const nextLevelPoints = (currentUser.level) * 500;
  const currentLevelPoints = currentUser.points % 500;

  // Achievements by category
  const categories = [
    { key: 'habits', label: 'Привычки', icon: '✅' },
    { key: 'quit', label: 'Отказ', icon: '🚫' },
    { key: 'streak', label: 'Стрики', icon: '🔥' },
    { key: 'team', label: 'Команда', icon: '👥' },
    { key: 'social', label: 'Социальное', icon: '🤝' },
  ];

  // Global leaderboard
  const leaderboard = useMemo(() => {
    return [...users]
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
      .map((u, i) => ({ ...u, rank: i + 1 }));
  }, [users]);

  // Pie chart data
  const pieData = useMemo(() => {
    const byRarity = { common: 0, rare: 0, epic: 0, legendary: 0 };
    unlockedAchievements.forEach(a => byRarity[a.rarity]++);
    return Object.entries(byRarity)
      .filter(([, v]) => v > 0)
      .map(([key, val]) => ({ name: RARITY_CONFIG[key as keyof typeof RARITY_CONFIG].label, value: val, color: RARITY_CONFIG[key as keyof typeof RARITY_CONFIG].color }));
  }, [unlockedAchievements]);

  const myTeams = teams.filter(t => t.memberIds.includes(currentUser.id));

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Navigation />
        <main className="flex-1 lg:ml-64 pb-24 lg:pb-0">
          <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8">
            <h1 className="text-2xl font-bold text-white mb-6">Бонусы и достижения</h1>

            {/* Profile & level card */}
            <div className="card mb-6 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.08))' }}>
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
              <div className="flex items-start gap-6 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
                    style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))', border: '2px solid rgba(124,58,237,0.4)' }}>
                    {currentUser.avatar}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">{currentUser.username}</h2>
                    <div className="text-gradient text-2xl font-black">{currentUser.points} очков</div>
                    <div className="text-slate-400 text-sm">Уровень {currentUser.level}</div>
                  </div>
                </div>
                <div className="flex-1 min-w-48">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400">Прогресс до ур. {currentUser.level + 1}</span>
                    <span className="text-purple-400">{currentLevelPoints} / {nextLevelPoints}</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${levelProgress}%`, background: 'linear-gradient(90deg, #7c3aed, #3b82f6, #06b6d4)' }} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{unlockedAchievements.length}</div>
                      <div className="text-xs text-slate-500">ачивментов</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{habits.filter(h => h.userId === currentUser.id).length}</div>
                      <div className="text-xs text-slate-500">привычек</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{myTeams.length}</div>
                      <div className="text-xs text-slate-500">команд</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Achievements donut */}
              <div className="card">
                <h3 className="text-sm font-medium text-slate-400 mb-4">Мои достижения</h3>
                {pieData.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width={140} height={140}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                          dataKey="value" stroke="none">
                          {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#13132e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 10 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {pieData.map(d => (
                        <div key={d.name} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                          <span className="text-xs text-slate-400">{d.name}</span>
                          <span className="text-xs font-bold text-white ml-auto">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm">Выполняйте действия, чтобы получить достижения</p>
                  </div>
                )}
              </div>

              {/* Leaderboard */}
              <div className="card">
                <h3 className="text-sm font-medium text-slate-400 mb-4">🏆 Лидерборд</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {leaderboard.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">Зарегистрируйтесь для участия</p>
                  ) : leaderboard.map(u => (
                    <div key={u.id} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                      u.id === currentUser.id ? 'ring-1 ring-purple-500/40' : ''
                    }`} style={{ background: u.id === currentUser.id ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.03)' }}>
                      <span className={`w-6 text-center text-sm font-bold ${
                        u.rank === 1 ? 'text-yellow-400' : u.rank === 2 ? 'text-slate-300' : u.rank === 3 ? 'text-orange-400' : 'text-slate-600'
                      }`}>
                        {u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : u.rank === 3 ? '🥉' : u.rank}
                      </span>
                      <span className="text-lg">{u.avatar}</span>
                      <span className="flex-1 text-sm text-white font-medium truncate">{u.username}</span>
                      <span className="text-sm font-bold text-gradient">{u.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* All achievements by category */}
            {categories.map(cat => {
              const catAchievements = allAchievements.filter(a => a.category === cat.key);
              if (catAchievements.length === 0) return null;
              return (
                <div key={cat.key} className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <span>{cat.icon}</span> {cat.label}
                    <span className="text-xs text-slate-600">
                      ({catAchievements.filter(a => unlockedIds.has(a.id)).length}/{catAchievements.length})
                    </span>
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {catAchievements.map(a => (
                      <AchievementCard key={a.id} achievement={a} unlocked={unlockedIds.has(a.id)} />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Team bonuses */}
            {myTeams.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <span>⚡</span> Командные задания
                </h3>
                <div className="space-y-3">
                  {myTeams.flatMap(team =>
                    team.tasks.map(task => {
                      const done = task.completedBy.includes(currentUser.id);
                      return (
                        <div key={task.id} className="card flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                            style={{ background: done ? 'rgba(16,185,129,0.2)' : `${team.color}15` }}>
                            {task.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium ${done ? 'line-through text-slate-500' : 'text-white'}`}>
                              {task.title}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">{team.emoji} {team.name}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-sm" style={{ color: done ? '#10b981' : team.color }}>+{task.points}</div>
                            {done && <div className="text-xs text-green-500">Выполнено ✓</div>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
