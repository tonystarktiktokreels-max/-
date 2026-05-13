import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Team, Habit, QuitHabit, TeamTask, Achievement, ChatMessage } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_habit', name: 'Первый шаг', description: 'Создайте свою первую привычку', icon: '🌱', points: 50, category: 'habits', condition: 'habits_count_1', rarity: 'common' },
  { id: 'week_streak', name: 'Неделя силы', description: '7 дней подряд выполняйте привычку', icon: '🔥', points: 100, category: 'streak', condition: 'streak_7', rarity: 'common' },
  { id: 'month_streak', name: 'Месяц победы', description: '30 дней подряд без пропусков', icon: '💎', points: 500, category: 'streak', condition: 'streak_30', rarity: 'epic' },
  { id: 'quit_start', name: 'Новое начало', description: 'Начните бороться с вредной привычкой', icon: '🚫', points: 75, category: 'quit', condition: 'quit_count_1', rarity: 'common' },
  { id: 'quit_week', name: '7 дней свободы', description: '7 дней без вредной привычки', icon: '🦋', points: 150, category: 'quit', condition: 'quit_streak_7', rarity: 'rare' },
  { id: 'team_join', name: 'Командный игрок', description: 'Вступите в команду', icon: '🤝', points: 50, category: 'social', condition: 'team_count_1', rarity: 'common' },
  { id: 'team_task', name: 'На задание!', description: 'Выполните командное задание', icon: '⚡', points: 100, category: 'team', condition: 'team_task_1', rarity: 'common' },
  { id: 'five_habits', name: 'Мастер привычек', description: 'Создайте 5 привычек', icon: '🏆', points: 200, category: 'habits', condition: 'habits_count_5', rarity: 'rare' },
  { id: 'hundred_days', name: 'Легенда', description: '100 дней без вредной привычки', icon: '👑', points: 2000, category: 'quit', condition: 'quit_streak_100', rarity: 'legendary' },
  { id: 'perfect_week', name: 'Идеальная неделя', description: 'Выполните все привычки за 7 дней', icon: '✨', points: 300, category: 'habits', condition: 'perfect_week', rarity: 'rare' },
];

const AVATARS = ['🦊', '🐺', '🦁', '🐯', '🦅', '🐉', '🦄', '🐻', '🦋', '🌟'];

interface AppState {
  currentUser: User | null;
  users: User[];
  teams: Team[];
  habits: Habit[];
  quitHabits: QuitHabit[];
  unlockedAchievements: Record<string, string[]>; // userId -> achievementIds

  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (username: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateUserPoints: (userId: string, points: number) => void;

  createTeam: (name: string, description: string, color: string, emoji: string) => Team;
  joinTeam: (inviteCode: string) => { success: boolean; team?: Team; error?: string };
  leaveTeam: (teamId: string) => void;
  sendMessage: (teamId: string, text: string) => void;
  completeTask: (teamId: string, taskId: string) => void;
  addTeamTask: (teamId: string, task: Omit<TeamTask, 'id' | 'teamId' | 'completedBy' | 'createdAt'>) => void;

  addHabit: (habit: Omit<Habit, 'id' | 'userId' | 'completions' | 'createdAt'>) => void;
  completeHabit: (habitId: string, date: string) => void;
  uncompleteHabit: (habitId: string, date: string) => void;
  deleteHabit: (habitId: string) => void;

  addQuitHabit: (habit: Omit<QuitHabit, 'id' | 'userId' | 'relapses' | 'startDate'>) => void;
  relapse: (quitHabitId: string) => void;
  deleteQuitHabit: (id: string) => void;

  checkAndUnlockAchievements: (userId: string) => void;
  getUnlockedAchievements: (userId: string) => Achievement[];
  getAllAchievements: () => Achievement[];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      teams: [],
      habits: [],
      quitHabits: [],
      unlockedAchievements: {},

      login: (email, password) => {
        const user = get().users.find(u => u.email === email && u.password === password);
        if (!user) return { success: false, error: 'Неверный email или пароль' };
        set({ currentUser: user });
        return { success: true };
      },

      register: (username, email, password) => {
        const exists = get().users.find(u => u.email === email);
        if (exists) return { success: false, error: 'Email уже используется' };
        const newUser: User = {
          id: generateId(),
          username,
          email,
          password,
          avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
          teamIds: [],
          points: 0,
          level: 1,
          createdAt: new Date().toISOString(),
        };
        set(s => ({ users: [...s.users, newUser], currentUser: newUser }));
        return { success: true };
      },

      logout: () => set({ currentUser: null }),

      updateUserPoints: (userId, points) => {
        set(s => ({
          users: s.users.map(u => u.id === userId
            ? { ...u, points: u.points + points, level: Math.floor((u.points + points) / 500) + 1 }
            : u
          ),
          currentUser: s.currentUser?.id === userId
            ? { ...s.currentUser, points: s.currentUser.points + points, level: Math.floor((s.currentUser.points + points) / 500) + 1 }
            : s.currentUser,
        }));
      },

      createTeam: (name, description, color, emoji) => {
        const user = get().currentUser;
        if (!user) throw new Error('Not logged in');
        const team: Team = {
          id: generateId(),
          name,
          description,
          inviteCode: generateCode(),
          memberIds: [user.id],
          adminId: user.id,
          createdAt: new Date().toISOString(),
          messages: [],
          tasks: [
            {
              id: generateId(),
              teamId: '',
              title: 'Знакомство команды',
              description: 'Напишите в чате команды приветствие и расскажите о своей главной привычке',
              points: 30,
              deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
              completedBy: [],
              type: 'individual',
              category: 'social',
              createdAt: new Date().toISOString(),
              icon: '👋',
            },
            {
              id: generateId(),
              teamId: '',
              title: 'Спринт недели',
              description: 'Всей командой выполните привычки 5 дней подряд',
              points: 150,
              deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
              completedBy: [],
              type: 'team',
              category: 'habits',
              createdAt: new Date().toISOString(),
              icon: '⚡',
            },
          ],
          color,
          emoji,
        };
        team.tasks = team.tasks.map(t => ({ ...t, teamId: team.id }));
        set(s => ({
          teams: [...s.teams, team],
          users: s.users.map(u => u.id === user.id ? { ...u, teamIds: [...u.teamIds, team.id] } : u),
          currentUser: { ...user, teamIds: [...user.teamIds, team.id] },
        }));
        get().checkAndUnlockAchievements(user.id);
        return team;
      },

      joinTeam: (inviteCode) => {
        const user = get().currentUser;
        if (!user) return { success: false, error: 'Не авторизован' };
        const team = get().teams.find(t => t.inviteCode === inviteCode.toUpperCase());
        if (!team) return { success: false, error: 'Команда не найдена' };
        if (team.memberIds.includes(user.id)) return { success: false, error: 'Вы уже в этой команде' };
        set(s => ({
          teams: s.teams.map(t => t.id === team.id ? { ...t, memberIds: [...t.memberIds, user.id] } : t),
          users: s.users.map(u => u.id === user.id ? { ...u, teamIds: [...u.teamIds, team.id] } : u),
          currentUser: { ...user, teamIds: [...user.teamIds, team.id] },
        }));
        get().checkAndUnlockAchievements(user.id);
        return { success: true, team };
      },

      leaveTeam: (teamId) => {
        const user = get().currentUser;
        if (!user) return;
        set(s => ({
          teams: s.teams.map(t => t.id === teamId ? { ...t, memberIds: t.memberIds.filter(id => id !== user.id) } : t),
          users: s.users.map(u => u.id === user.id ? { ...u, teamIds: u.teamIds.filter(id => id !== teamId) } : u),
          currentUser: { ...user, teamIds: user.teamIds.filter(id => id !== teamId) },
        }));
      },

      sendMessage: (teamId, text) => {
        const user = get().currentUser;
        if (!user) return;
        const message: ChatMessage = {
          id: generateId(),
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
          text,
          createdAt: new Date().toISOString(),
        };
        set(s => ({ teams: s.teams.map(t => t.id === teamId ? { ...t, messages: [...t.messages, message] } : t) }));
      },

      completeTask: (teamId, taskId) => {
        const user = get().currentUser;
        if (!user) return;
        const team = get().teams.find(t => t.id === teamId);
        const task = team?.tasks.find(t => t.id === taskId);
        if (!task || task.completedBy.includes(user.id)) return;
        set(s => ({
          teams: s.teams.map(t => t.id === teamId
            ? { ...t, tasks: t.tasks.map(task => task.id === taskId ? { ...task, completedBy: [...task.completedBy, user.id] } : task) }
            : t
          ),
        }));
        get().updateUserPoints(user.id, task.points);
        get().checkAndUnlockAchievements(user.id);
      },

      addTeamTask: (teamId, taskData) => {
        const task: TeamTask = {
          ...taskData,
          id: generateId(),
          teamId,
          completedBy: [],
          createdAt: new Date().toISOString(),
        };
        set(s => ({ teams: s.teams.map(t => t.id === teamId ? { ...t, tasks: [...t.tasks, task] } : t) }));
      },

      addHabit: (habitData) => {
        const user = get().currentUser;
        if (!user) return;
        const habit: Habit = {
          ...habitData,
          id: generateId(),
          userId: user.id,
          completions: {},
          createdAt: new Date().toISOString(),
        };
        set(s => ({ habits: [...s.habits, habit] }));
        get().updateUserPoints(user.id, 20);
        get().checkAndUnlockAchievements(user.id);
      },

      completeHabit: (habitId, date) => {
        const user = get().currentUser;
        if (!user) return;
        set(s => ({ habits: s.habits.map(h => h.id === habitId ? { ...h, completions: { ...h.completions, [date]: true } } : h) }));
        get().updateUserPoints(user.id, 10);
        get().checkAndUnlockAchievements(user.id);
      },

      uncompleteHabit: (habitId, date) => {
        set(s => ({ habits: s.habits.map(h => h.id === habitId ? { ...h, completions: { ...h.completions, [date]: false } } : h) }));
      },

      deleteHabit: (habitId) => {
        set(s => ({ habits: s.habits.filter(h => h.id !== habitId) }));
      },

      addQuitHabit: (habitData) => {
        const user = get().currentUser;
        if (!user) return;
        const habit: QuitHabit = {
          ...habitData,
          id: generateId(),
          userId: user.id,
          relapses: [],
          startDate: new Date().toISOString(),
        };
        set(s => ({ quitHabits: [...s.quitHabits, habit] }));
        get().updateUserPoints(user.id, 50);
        get().checkAndUnlockAchievements(user.id);
      },

      relapse: (quitHabitId) => {
        set(s => ({
          quitHabits: s.quitHabits.map(h => h.id === quitHabitId
            ? { ...h, relapses: [...h.relapses, new Date().toISOString()], startDate: new Date().toISOString() }
            : h
          ),
        }));
      },

      deleteQuitHabit: (id) => {
        set(s => ({ quitHabits: s.quitHabits.filter(h => h.id !== id) }));
      },

      checkAndUnlockAchievements: (userId) => {
        const state = get();
        const userHabits = state.habits.filter(h => h.userId === userId);
        const userQuitHabits = state.quitHabits.filter(h => h.userId === userId);
        const user = state.users.find(u => u.id === userId);
        if (!user) return;

        const unlocked = state.unlockedAchievements[userId] || [];
        const newUnlocked: string[] = [...unlocked];
        let pointsToAdd = 0;

        const checkAndAdd = (achievementId: string, condition: boolean) => {
          if (condition && !unlocked.includes(achievementId)) {
            newUnlocked.push(achievementId);
            const ach = ACHIEVEMENTS.find(a => a.id === achievementId);
            if (ach) pointsToAdd += ach.points;
          }
        };

        checkAndAdd('first_habit', userHabits.length >= 1);
        checkAndAdd('five_habits', userHabits.length >= 5);
        checkAndAdd('quit_start', userQuitHabits.length >= 1);
        checkAndAdd('team_join', user.teamIds.length >= 1);

        // Check quit streaks
        userQuitHabits.forEach(qh => {
          const start = new Date(qh.startDate);
          const days = Math.floor((Date.now() - start.getTime()) / 86400000);
          checkAndAdd('quit_week', days >= 7);
          checkAndAdd('hundred_days', days >= 100);
        });

        // Check habit streaks
        userHabits.forEach(h => {
          let streak = 0;
          for (let i = 0; i < 60; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            if (h.completions[key]) streak++;
            else break;
          }
          checkAndAdd('week_streak', streak >= 7);
          checkAndAdd('month_streak', streak >= 30);
        });

        if (newUnlocked.length !== unlocked.length) {
          set(s => ({ unlockedAchievements: { ...s.unlockedAchievements, [userId]: newUnlocked } }));
          if (pointsToAdd > 0) get().updateUserPoints(userId, pointsToAdd);
        }
      },

      getUnlockedAchievements: (userId) => {
        const ids = get().unlockedAchievements[userId] || [];
        return ACHIEVEMENTS.filter(a => ids.includes(a.id));
      },

      getAllAchievements: () => ACHIEVEMENTS,
    }),
    {
      name: 'habit-tracker-store',
      partialize: (state) => ({
        users: state.users,
        teams: state.teams,
        habits: state.habits,
        quitHabits: state.quitHabits,
        currentUser: state.currentUser,
        unlockedAchievements: state.unlockedAchievements,
      }),
    }
  )
);
