"use server";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "Пользователь уже существует" };

  const hashed = await bcrypt.hash(password, 10);
  const user = await db.user.create({ data: { email, password: hashed, name } });
  await createSession(user.id);
  redirect("/diary");
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) return { error: "Неверный email или пароль" };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { error: "Неверный email или пароль" };

  await createSession(user.id);
  redirect("/diary");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
