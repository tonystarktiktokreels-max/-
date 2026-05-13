export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  teamIds: string[];
  points: number;
  level: number;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  inviteCode: string;
  memberIds: string[];
  adminId: string;
  createdAt: string;
  messages: ChatMessage[];
  tasks: TeamTask[];
  color: string;
  emoji: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  createdAt: string;
}

export type HabitCategory = 'health' | 'fitness' | 'learning' | 'productivity' | 'mindfulness' | 'social' | 'other';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: HabitCategory;
  frequency: 'daily' | 'weekly';
  color: string;
  icon: string;
  completions: Record<string, boolean>;
  targetDaysPerWeek: number;
  createdAt: string;
}

export interface QuitHabit {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  startDate: string;
  relapses: string[];
  color: string;
  icon: string;
  trigger: string;
  motivation: string;
}

export interface TeamTask {
  id: string;
  teamId: string;
  title: string;
  description: string;
  points: number;
  deadline: string;
  completedBy: string[];
  type: 'individual' | 'team';
  category: string;
  createdAt: string;
  icon: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt?: string;
  category: 'habits' | 'quit' | 'team' | 'streak' | 'social';
  condition: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
