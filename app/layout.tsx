import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HabitFlow — Командный трекер привычек',
  description: 'Отслеживайте привычки, работайте в команде и достигайте целей вместе',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
