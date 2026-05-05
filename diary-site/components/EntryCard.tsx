import { Entry } from "@prisma/client";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  }).format(new Date(date));
}

export function EntryCard({ entry }: { entry: Entry }) {
  return (
    <article className="bg-stone-900/50 border border-stone-700/30 rounded-2xl p-5 space-y-3 backdrop-blur">
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>{formatDate(entry.createdAt)}</span>
        {entry.mood && <span>{entry.mood}</span>}
      </div>
      <p className="text-stone-200 text-sm leading-relaxed whitespace-pre-wrap">{entry.text}</p>
      {entry.imageUrl && (
        <img
          src={entry.imageUrl}
          alt="AI illustration"
          className="w-full rounded-xl object-cover max-h-72"
        />
      )}
      {entry.videoUrl && (
        <video
          src={entry.videoUrl}
          controls
          loop
          muted
          className="w-full rounded-xl max-h-72"
        />
      )}
      {!entry.imageUrl && !entry.videoUrl && (
        <p className="text-xs text-stone-600 italic">Генерирую медиа...</p>
      )}
    </article>
  );
}
