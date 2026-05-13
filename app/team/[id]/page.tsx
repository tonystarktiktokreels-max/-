'use client';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function AddTaskModal({ teamId, onClose }: { teamId: string; onClose: () => void }) {
  const { addTeamTask } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(50);
  const [type, setType] = useState<'individual' | 'team'>('individual');
  const [icon, setIcon] = useState('🎯');
  const ICONS = ['🎯', '💪', '📚', '🧘', '🎽', '🔥', '⚡', '🌟', '🏆', '🤝'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTeamTask(teamId, {
      title, description, points, type,
      deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
      category: 'general', icon,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-elevated rounded-3xl p-6 w-full max-w-md fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Новое задание</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Название</label>
            <input className="input-field" placeholder="Название задания" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Описание</label>
            <textarea className="input-field resize-none" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">Очки</label>
              <input className="input-field" type="number" min={5} max={1000} value={points} onChange={e => setPoints(+e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">Тип</label>
              <div className="flex gap-1">
                {(['individual', 'team'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setType(t)}
                    className={`flex-1 py-3 rounded-xl text-xs font-medium transition-all ${
                      type === t ? 'bg-purple-600 text-white' : 'text-slate-400'
                    }`} style={{ background: type === t ? undefined : 'rgba(255,255,255,0.05)' }}>
                    {t === 'individual' ? 'Личное' : 'Командное'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Иконка</label>
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                    icon === ic ? 'border-2 border-purple-500 scale-110' : ''
                  }`} style={{ background: 'rgba(255,255,255,0.05)' }}>{ic}</button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">Добавить задание</button>
        </form>
      </div>
    </div>
  );
}

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;
  const { currentUser, teams, users, habits, sendMessage, completeTask, leaveTeam } = useStore();
  const [tab, setTab] = useState<'chat' | 'tasks' | 'members' | 'stats'>('chat');
  const [message, setMessage] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const team = teams.find(t => t.id === teamId);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [team?.messages.length]);

  if (!team) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen">
          <Navigation />
          <main className="flex-1 lg:ml-64 flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-400 mb-4">Команда не найдена</p>
              <Link href="/team" className="btn-primary text-sm px-6">Назад</Link>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  const memberUsers = team.memberIds.map(id => users.find(u => u.id === id)).filter(Boolean);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage(teamId, message.trim());
    setMessage('');
  };

  const handleLeave = () => {
    if (confirm('Вы уверены, что хотите покинуть команду?')) {
      leaveTeam(teamId);
      router.push('/team');
    }
  };

  // Stats data
  const memberStatsData = memberUsers.map(u => {
    if (!u) return null;
    const userHabits = habits.filter(h => h.userId === u.id);
    const today = format(new Date(), 'yyyy-MM-dd');
    const completed = userHabits.filter(h => h.completions[today]).length;
    const tasksCompleted = team.tasks.filter(t => t.completedBy.includes(u.id)).length;
    return {
      name: u.username.slice(0, 8),
      avatar: u.avatar,
      id: u.id,
      points: u.points,
      habits: completed,
      tasks: tasksCompleted,
    };
  }).filter(Boolean);

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Navigation />
        <main className="flex-1 lg:ml-64 pb-24 lg:pb-0 flex flex-col">
          {/* Team header */}
          <div className="border-b border-purple-900/20 px-4 py-4 lg:px-8"
            style={{ background: `linear-gradient(135deg, ${team.color}08, transparent)` }}>
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/team" className="text-slate-400 hover:text-white">←</Link>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: `${team.color}20` }}>{team.emoji}</div>
                <div>
                  <h1 className="text-xl font-bold text-white">{team.name}</h1>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{team.memberIds.length} участников</span>
                    <span>Код: <span className="font-mono font-bold" style={{ color: team.color }}>{team.inviteCode}</span></span>
                  </div>
                </div>
              </div>
              <button onClick={handleLeave} className="text-xs text-slate-600 hover:text-red-400 transition-colors">Покинуть</button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-purple-900/20 px-4 lg:px-8">
            <div className="max-w-4xl mx-auto flex gap-1 py-2">
              {(['chat', 'tasks', 'members', 'stats'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    tab === t ? 'text-white' : 'text-slate-500 hover:text-white'
                  }`} style={{ background: tab === t ? `${team.color}25` : 'transparent', color: tab === t ? team.color : undefined }}>
                  {t === 'chat' ? '💬 Чат' : t === 'tasks' ? '⚡ Задания' : t === 'members' ? '👥 Участники' : '📊 Статистика'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="max-w-4xl mx-auto h-full px-4 lg:px-8 py-4">

              {/* Chat */}
              {tab === 'chat' && (
                <div className="flex flex-col h-[calc(100vh-280px)] lg:h-[calc(100vh-220px)]">
                  <div ref={chatRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {team.messages.length === 0 && (
                      <div className="text-center py-12 text-slate-500">
                        <p className="text-4xl mb-3">💬</p>
                        <p className="text-sm">Напишите первое сообщение!</p>
                      </div>
                    )}
                    {team.messages.map(msg => {
                      const isMe = msg.userId === currentUser?.id;
                      return (
                        <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-lg"
                            style={{ background: 'rgba(124,58,237,0.2)' }}>{msg.avatar}</div>
                          <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                            {!isMe && <span className="text-xs text-slate-500 px-1">{msg.username}</span>}
                            <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                              isMe ? 'rounded-tr-sm text-white' : 'rounded-tl-sm text-slate-200'
                            }`} style={{
                              background: isMe
                                ? `linear-gradient(135deg, ${team.color}, ${team.color}bb)`
                                : 'rgba(255,255,255,0.07)',
                            }}>
                              {msg.text}
                            </div>
                            <span className="text-[10px] text-slate-600 px-1">
                              {format(new Date(msg.createdAt), 'HH:mm')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <form onSubmit={handleSend} className="flex gap-2 mt-3">
                    <input className="input-field flex-1" placeholder="Сообщение..." value={message}
                      onChange={e => setMessage(e.target.value)} />
                    <button type="submit" className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-all hover:scale-105"
                      style={{ background: `linear-gradient(135deg, ${team.color}, ${team.color}90)` }}>
                      ➤
                    </button>
                  </form>
                </div>
              )}

              {/* Tasks */}
              {tab === 'tasks' && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button onClick={() => setShowAddTask(true)} className="btn-primary text-sm px-4 py-2">+ Задание</button>
                  </div>
                  {team.tasks.map(task => {
                    const done = task.completedBy.includes(currentUser?.id || '');
                    const doneCount = task.completedBy.length;
                    const teamProgress = team.memberIds.length > 0 ? (doneCount / team.memberIds.length) * 100 : 0;
                    return (
                      <div key={task.id} className="card flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                          style={{ background: done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)' }}>
                          {task.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className={`font-semibold ${done ? 'line-through text-slate-500' : 'text-white'}`}>{task.title}</h4>
                              {task.description && <p className="text-slate-500 text-xs mt-0.5">{task.description}</p>}
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <div className="text-gradient font-bold text-sm">+{task.points}</div>
                              <div className="text-xs text-slate-500">очков</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: task.type === 'team' ? 'rgba(59,130,246,0.15)' : 'rgba(124,58,237,0.15)',
                                color: task.type === 'team' ? '#3b82f6' : '#a855f7' }}>
                              {task.type === 'team' ? 'Командное' : 'Личное'}
                            </span>
                            {task.type === 'team' && (
                              <span className="text-xs text-slate-500">{doneCount}/{team.memberIds.length} выполнили</span>
                            )}
                          </div>
                          {task.type === 'team' && (
                            <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${teamProgress}%`, background: team.color }} />
                            </div>
                          )}
                        </div>
                        {!done && (
                          <button onClick={() => completeTask(teamId, task.id)}
                            className="px-3 py-2 rounded-xl text-xs font-medium text-white flex-shrink-0 transition-all hover:scale-105"
                            style={{ background: `linear-gradient(135deg, ${team.color}, ${team.color}90)` }}>
                            Выполнить
                          </button>
                        )}
                        {done && <span className="text-green-400 text-xl flex-shrink-0">✓</span>}
                      </div>
                    );
                  })}
                  {team.tasks.length === 0 && (
                    <div className="card text-center py-12">
                      <p className="text-slate-500">Заданий пока нет</p>
                    </div>
                  )}
                </div>
              )}

              {/* Members */}
              {tab === 'members' && (
                <div className="space-y-3">
                  {memberUsers.map(u => u && (
                    <div key={u.id} className="card flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ background: 'rgba(124,58,237,0.15)' }}>{u.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">{u.username}</span>
                          {team.adminId === u.id && (
                            <span className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: `${team.color}20`, color: team.color }}>Админ</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">Ур. {u.level} • {u.points} очков</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold" style={{ color: team.color }}>
                          {team.tasks.filter(t => t.completedBy.includes(u.id)).length}
                        </div>
                        <div className="text-xs text-slate-500">заданий</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats */}
              {tab === 'stats' && (
                <div className="space-y-6">
                  <div className="card">
                    <h3 className="text-sm font-medium text-slate-400 mb-4">Лидерборд по очкам</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={memberStatsData} layout="vertical">
                        <defs>
                          <linearGradient id="memberGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={team.color} />
                            <stop offset="100%" stopColor={`${team.color}60`} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" />
                        <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
                        <Tooltip contentStyle={{ background: '#13132e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12 }} />
                        <Bar dataKey="points" name="Очки" fill="url(#memberGrad)" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="card text-center">
                      <div className="text-2xl font-black text-white">{team.tasks.length}</div>
                      <div className="text-xs text-slate-500 mt-1">Всего задач</div>
                    </div>
                    <div className="card text-center">
                      <div className="text-2xl font-black text-gradient">{team.messages.length}</div>
                      <div className="text-xs text-slate-500 mt-1">Сообщений</div>
                    </div>
                    <div className="card text-center col-span-2 sm:col-span-1">
                      <div className="text-2xl font-black" style={{ color: team.color }}>{team.memberIds.length}</div>
                      <div className="text-xs text-slate-500 mt-1">Участников</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      {showAddTask && <AddTaskModal teamId={teamId} onClose={() => setShowAddTask(false)} />}
    </AuthGuard>
  );
}
