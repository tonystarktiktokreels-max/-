'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TEAM_COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444', '#8b5cf6'];
const TEAM_EMOJIS = ['🚀', '🔥', '⚡', '🌟', '🏆', '👥', '🌱', '💪', '🦁', '🎨'];

function CreateTeamModal({ onClose }: { onClose: () => void }) {
  const { createTeam } = useStore();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(TEAM_COLORS[0]);
  const [emoji, setEmoji] = useState(TEAM_EMOJIS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const team = createTeam(name, description, color, emoji);
    onClose();
    router.push(`/team/${team.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-elevated rounded-3xl p-6 w-full max-w-md fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Создать команду</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-2">Название команды</label>
            <input className="input-field" placeholder="Например: Бицепс бригада" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">Описание</label>
            <textarea className="input-field resize-none" rows={2} placeholder="О чём ваша команда?" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">Эмодзи</label>
            <div className="flex flex-wrap gap-2">
              {TEAM_EMOJIS.map(em => (
                <button key={em} type="button" onClick={() => setEmoji(em)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    emoji === em ? 'border-2 border-purple-500 scale-110' : 'hover:scale-105'
                  }`} style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {em}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">Цвет</label>
            <div className="flex gap-2">
              {TEAM_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${color === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">Создать</button>
        </form>
      </div>
    </div>
  );
}

function JoinTeamModal({ onClose }: { onClose: () => void }) {
  const { joinTeam } = useStore();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = joinTeam(code.trim());
    if (!result.success) { setError(result.error || ''); return; }
    onClose();
    if (result.team) router.push(`/team/${result.team.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-elevated rounded-3xl p-6 w-full max-w-sm fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Вступить в команду</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-2">Код приглашения</label>
            <input className="input-field text-center text-xl font-bold tracking-widest" placeholder="ABCD12"
              value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={6} required />
          </div>
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          <button type="submit" className="btn-primary w-full">Войти</button>
        </form>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const { currentUser, teams, habits, users } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const myTeams = teams.filter(t => t.memberIds.includes(currentUser?.id || ''));

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Navigation />
        <main className="flex-1 lg:ml-64 pb-24 lg:pb-0">
          <div className="max-w-4xl mx-auto px-4 py-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Команды</h1>
                <p className="text-slate-500 text-sm mt-1">{myTeams.length} активных</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowJoin(true)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 transition-all hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Войти
                </button>
                <button onClick={() => setShowCreate(true)} className="btn-primary text-sm px-4 py-2">+ Создать</button>
              </div>
            </div>

            {myTeams.length === 0 ? (
              <div className="card text-center py-20">
                <p className="text-5xl mb-4">👥</p>
                <h3 className="text-white text-lg font-semibold mb-2">У вас пока нет команд</h3>
                <p className="text-slate-500 text-sm mb-6">Создайте свою или присоединитесь по коду</p>
                <div className="flex justify-center gap-3">
                  <button onClick={() => setShowJoin(true)} className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-300"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Войти по коду
                  </button>
                  <button onClick={() => setShowCreate(true)} className="btn-primary text-sm px-6">Создать</button>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {myTeams.map(team => {
                  const memberUsers = team.memberIds.map(id => users.find(u => u.id === id)).filter(Boolean);
                  const totalTasks = team.tasks.length;
                  const completedTasks = team.tasks.filter(t => t.completedBy.includes(currentUser?.id || '')).length;

                  return (
                    <Link key={team.id} href={`/team/${team.id}`}
                      className="card block hover:scale-[1.01] transition-transform relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none"
                        style={{ background: team.color }} />
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                          style={{ background: `${team.color}20`, border: `1px solid ${team.color}30` }}>
                          {team.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold truncate">{team.name}</h3>
                          {team.description && <p className="text-slate-500 text-xs mt-0.5 truncate">{team.description}</p>}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-slate-500">{team.memberIds.length} участников</span>
                            <span className="text-xs" style={{ color: team.color }}>Код: {team.inviteCode}</span>
                          </div>
                        </div>
                        {team.adminId === currentUser?.id && (
                          <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: `${team.color}20`, color: team.color }}>Админ</span>
                        )}
                      </div>

                      {/* Member avatars */}
                      <div className="flex items-center gap-1.5 mb-4">
                        {memberUsers.slice(0, 5).map(u => u && (
                          <div key={u.id} className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                            style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}>
                            {u.avatar}
                          </div>
                        ))}
                        {team.memberIds.length > 5 && (
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-slate-400"
                            style={{ background: 'rgba(255,255,255,0.05)' }}>
                            +{team.memberIds.length - 5}
                          </div>
                        )}
                      </div>

                      {/* Task progress */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Мои задания</span>
                          <span style={{ color: team.color }}>{completedTasks}/{totalTasks}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: totalTasks ? `${(completedTasks / totalTasks) * 100}%` : '0%', background: team.color }} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
      {showCreate && <CreateTeamModal onClose={() => setShowCreate(false)} />}
      {showJoin && <JoinTeamModal onClose={() => setShowJoin(false)} />}
    </AuthGuard>
  );
}
