'use client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'Главная' },
  { href: '/habits', icon: '✅', label: 'Привычки' },
  { href: '/quit', icon: '🚫', label: 'Отказ' },
  { href: '/team', icon: '👥', label: 'Команда' },
  { href: '/bonuses', icon: '🏆', label: 'Бонусы' },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const levelProgress = currentUser ? ((currentUser.points % 500) / 500) * 100 : 0;

  return (
    <>
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-purple-900/30 fixed left-0 top-0 z-40"
        style={{ background: 'rgba(8,8,24,0.95)', backdropFilter: 'blur(20px)' }}>
        {/* Logo */}
        <div className="p-6 border-b border-purple-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>⚡</div>
            <div>
              <div className="font-bold text-white text-lg leading-none">HabitFlow</div>
              <div className="text-xs text-slate-500 mt-0.5">командный трекер</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`nav-item ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}>
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User */}
        {currentUser && (
          <div className="p-4 border-t border-purple-900/20">
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Уровень {currentUser.level}</span>
                <span className="text-purple-400">{currentUser.points} очков</span>
              </div>
              <div className="h-1.5 bg-purple-900/30 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${levelProgress}%`, background: 'linear-gradient(90deg, #7c3aed, #3b82f6)' }} />
              </div>
            </div>
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-purple-900/20 transition-all">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))' }}>
                  {currentUser.avatar}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-white text-sm font-medium truncate">{currentUser.username}</div>
                  <div className="text-slate-500 text-xs truncate">{currentUser.email}</div>
                </div>
                <span className="text-slate-500 text-xs">▾</span>
              </button>
              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 glass-elevated rounded-xl p-2 shadow-2xl">
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all">
                    <span>🚪</span> Выйти
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Bottom nav - mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-purple-900/30"
        style={{ background: 'rgba(8,8,24,0.97)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                pathname === item.href ? 'text-white' : 'text-slate-500'
              }`}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
