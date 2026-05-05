import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { EntryForm } from "@/components/EntryForm";
import { EntryCard } from "@/components/EntryCard";
import { logout } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function DiaryPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const user = await db.user.findUnique({ where: { id: session.userId } });
  const entries = await db.entry.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#0e0c0a] text-stone-100">
      {/* Ambient background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-stone-900/0 to-transparent pointer-events-none" />

      <div className="relative max-w-xl mx-auto px-4 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-stone-100">мой дневник</h1>
            <p className="text-xs text-stone-500 mt-0.5">{user?.name ?? user?.email}</p>
          </div>
          <form action={logout}>
            <button className="text-xs text-stone-600 hover:text-stone-400 transition">выйти</button>
          </form>
        </header>

        <EntryForm />

        <section className="space-y-4">
          {entries.length === 0 && (
            <p className="text-center text-stone-600 text-sm py-10">Здесь пока тихо. Напиши что-нибудь ✨</p>
          )}
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </section>
      </div>
    </main>
  );
}
