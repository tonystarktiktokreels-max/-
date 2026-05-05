"use server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { generateImage, generateVideo } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

export async function createEntry(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Не авторизован" };

  const text = formData.get("text") as string;
  const mood = formData.get("mood") as string;
  if (!text?.trim()) return { error: "Текст не может быть пустым" };

  const entry = await db.entry.create({
    data: { text, mood, userId: session.userId },
  });

  // Generate media in background (non-blocking for UX)
  generateImage(text).then(async (imageUrl) => {
    if (imageUrl) await db.entry.update({ where: { id: entry.id }, data: { imageUrl } });
  });

  generateVideo(text).then(async (videoUrl) => {
    if (videoUrl) await db.entry.update({ where: { id: entry.id }, data: { videoUrl } });
  });

  revalidatePath("/diary");
}

export async function getEntries() {
  const session = await getSession();
  if (!session) return [];
  return db.entry.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });
}
