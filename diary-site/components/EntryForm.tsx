"use client";
import { useActionState } from "react";
import { createEntry } from "@/app/actions/entries";

const moods = ["✨ вдохновение", "🌧 грусть", "☕ спокойствие", "🔥 энергия", "🌙 ночные мысли"];

export function EntryForm() {
  const [, action, pending] = useActionState(createEntry as (state: unknown, formData: FormData) => Promise<unknown>, null);

  return (
    <form action={action} className="bg-stone-900/60 backdrop-blur rounded-2xl p-6 border border-stone-700/40 space-y-4">
      <textarea
        name="text"
        rows={4}
        placeholder="Что у тебя сегодня на душе..."
        className="w-full bg-transparent text-stone-200 placeholder-stone-500 resize-none outline-none text-sm leading-relaxed"
        required
      />
      <div className="flex flex-wrap gap-2">
        {moods.map((m) => (
          <label key={m} className="cursor-pointer">
            <input type="radio" name="mood" value={m} className="sr-only peer" />
            <span className="text-xs px-3 py-1 rounded-full border border-stone-600 text-stone-400 peer-checked:border-amber-500/60 peer-checked:text-amber-300 transition-colors">
              {m}
            </span>
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full py-2 rounded-xl bg-amber-500/20 text-amber-300 text-sm border border-amber-500/30 hover:bg-amber-500/30 transition disabled:opacity-50"
      >
        {pending ? "Сохраняю..." : "Записать в дневник"}
      </button>
    </form>
  );
}
