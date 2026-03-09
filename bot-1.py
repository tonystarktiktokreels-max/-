import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

# ============================
# 🔑 Вставь сюда токен бота
# ============================
BOT_TOKEN = "7989179282:AAFdwTMEPXxM9Yl1vgVpb9o9Vf6urUWRjvw"

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


@dp.message(CommandStart())
async def start_handler(message: types.Message):
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🛍️ Открыть магазин",
                    url="https://hollyboyzz-style-hub.vercel.app"
                )
            ]
        ]
    )

    await message.answer(
        text="👋 Привет, ты попал в наш магазин. Приятных покупок!",
        reply_markup=keyboard
    )


async def main():
    print("🤖 Бот запущен...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
