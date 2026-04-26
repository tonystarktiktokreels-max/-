import asyncio
import logging
from datetime import datetime

import gspread
from aiogram import Bot, Dispatcher, F
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import Message
from google.oauth2.service_account import Credentials

# ============================
# Настройки — впиши свои значения
# ============================
BOT_TOKEN = "ВСТАВЬ_ТОКЕН_БОТА"

# Путь к JSON-файлу сервисного аккаунта Google
# (Google Cloud Console -> IAM -> Service Accounts -> Keys -> Add key)
GOOGLE_CREDS_FILE = "credentials.json"

# Название Google-таблицы (создай её и расшарь на email сервисного аккаунта
# с правами "Редактор")
SPREADSHEET_NAME = "Опрос бота"

# file_id видео в Telegram. Чтобы его получить:
# 1) запусти бота
# 2) отправь ему любое видео
# 3) бот пришлёт file_id — вставь сюда
VIDEO_FILE_ID = "ВСТАВЬ_FILE_ID_ВИДЕО"

# ============================
logging.basicConfig(level=logging.INFO)

scopes = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]
creds = Credentials.from_service_account_file(GOOGLE_CREDS_FILE, scopes=scopes)
gc = gspread.authorize(creds)
sheet = gc.open(SPREADSHEET_NAME).sheet1

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher(storage=MemoryStorage())


class Survey(StatesGroup):
    name = State()
    age = State()
    city = State()
    feedback = State()


@dp.message(Command("start"))
async def cmd_start(message: Message, state: FSMContext):
    await state.clear()
    await message.answer(
        "Привет! Давай пройдём небольшой опрос — это займёт меньше минуты.\n\n"
        "Как тебя зовут?"
    )
    await state.set_state(Survey.name)


@dp.message(Survey.name)
async def q_name(message: Message, state: FSMContext):
    await state.update_data(name=message.text)
    await message.answer("Сколько тебе лет?")
    await state.set_state(Survey.age)


@dp.message(Survey.age)
async def q_age(message: Message, state: FSMContext):
    await state.update_data(age=message.text)
    await message.answer("Из какого ты города?")
    await state.set_state(Survey.city)


@dp.message(Survey.city)
async def q_city(message: Message, state: FSMContext):
    await state.update_data(city=message.text)
    await message.answer("Что ты ожидаешь от нас? Напиши пару слов.")
    await state.set_state(Survey.feedback)


@dp.message(Survey.feedback)
async def q_feedback(message: Message, state: FSMContext):
    await state.update_data(feedback=message.text)
    data = await state.get_data()

    sheet.append_row([
        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        message.from_user.id,
        message.from_user.username or "",
        data.get("name", ""),
        data.get("age", ""),
        data.get("city", ""),
        data.get("feedback", ""),
    ])

    await message.answer("Спасибо за ответы! Держи обещанное видео.")
    await message.answer_video(VIDEO_FILE_ID)
    await state.clear()


@dp.message(F.video)
async def get_video_id(message: Message):
    await message.answer(
        f"file_id этого видео:\n<code>{message.video.file_id}</code>\n\n"
        "Скопируй его в переменную VIDEO_FILE_ID в коде бота.",
        parse_mode="HTML",
    )


async def main():
    print("Бот запущен...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
