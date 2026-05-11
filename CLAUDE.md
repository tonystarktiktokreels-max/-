# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

A minimal Telegram storefront bot written in Python using [aiogram](https://docs.aiogram.dev/) 3.x. The bot has a single handler: on `/start` it sends a Russian-language greeting with an inline keyboard button that opens an external Vercel storefront. The repo has no package manifest, test suite, build system, or lint config — treat additions to those areas as net-new setup.

**Files:**
| File | Purpose |
|------|---------|
| `bot-1.py` | The entire bot — token, bot/dispatcher instances, handler, and entry point |
| `CLAUDE.md` | AI assistant guidance (this file) |
| `README.md` | Placeholder only (`# -`) |

## Running the bot

```bash
pip install aiogram
python bot-1.py
```

The bot uses long polling (`dp.start_polling(bot)`), so no webhook, public URL, or server is needed. It connects directly to Telegram's servers. On startup it prints `🤖 Бот запущен...`.

## Code structure (`bot-1.py`)

```
imports           aiogram Bot, Dispatcher, types, CommandStart filter,
                  InlineKeyboardMarkup/Button; asyncio

BOT_TOKEN         Hardcoded string — see Security caveat below

bot / dp          Module-level Bot and Dispatcher singletons

start_handler()   @dp.message(CommandStart()) — sends greeting + inline keyboard
                  Button text : "🛍️ Открыть магазин"
                  Button URL  : https://hollyboyzz-style-hub.vercel.app
                  Reply text  : "👋 Привет, ты попал в наш магазин. Приятных покупок!"

main()            Awaits dp.start_polling(bot)

__main__ guard    asyncio.run(main())
```

## Development conventions

- **Single-module layout.** Keep all logic in `bot-1.py` unless the user explicitly requests a multi-file restructure. If you add handlers, register them on `dp` with aiogram 3.x decorators (`@dp.message(...)`, `@dp.callback_query(...)`, etc.) and place them above `main()`.
- **User-facing strings are Russian.** Preserve Russian for all greeting text, button labels, and console output unless explicitly asked to translate.
- **No requirements file exists.** The only runtime dependency is `aiogram`. If you add dependencies, also create a `requirements.txt`.
- **No tests or linting.** There is no test suite or linter configuration. Manual testing via a real Telegram bot token is the only verification method.
- **Entry point must stay intact.** Always preserve the `if __name__ == "__main__": asyncio.run(main())` pattern and the `async def main()` function.

## Adding new handlers (pattern)

```python
from aiogram.filters import Command   # or other filters

@dp.message(Command("mycommand"))
async def my_handler(message: types.Message):
    await message.answer("Ответ на русском")
```

For callback queries from inline keyboards:
```python
@dp.callback_query(lambda c: c.data == "my_action")
async def my_callback(callback: types.CallbackQuery):
    await callback.answer()
    await callback.message.answer("...")
```

## Security caveat

`BOT_TOKEN` is hardcoded in `bot-1.py` at line 9 and has been committed to git history. Two important notes:

1. **Token is already exposed.** Rewriting git history does not invalidate the token — the only safe remediation is to revoke it via [@BotFather](https://t.me/BotFather) and issue a new one.
2. **Moving to an env var** (`os.environ["BOT_TOKEN"]`) prevents future exposure but does not fix the existing leak. Always remind the user of step 1 when asked to migrate the token.

Recommended migration pattern if requested:
```python
import os
BOT_TOKEN = os.environ["BOT_TOKEN"]
```
