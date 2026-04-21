# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

This repo contains a single-file Telegram bot (`bot-1.py`) built with [aiogram](https://docs.aiogram.dev/) 3.x. On `/start` it replies with a greeting and an inline-keyboard button linking to an external storefront (`https://hollyboyzz-style-hub.vercel.app`). There is no package manifest, test suite, or lint config — treat any additions to those areas as net-new setup.

## Running the bot

```bash
pip install aiogram
python bot-1.py
```

The bot uses long polling (`dp.start_polling(bot)`), so no webhook or public URL is needed — it runs against Telegram's servers directly.

## Architecture notes

- **Single-module layout.** Bot, Dispatcher, and handlers all live in `bot-1.py`. If you add more handlers, follow aiogram 3.x conventions: register them on `dp` with decorators like `@dp.message(...)`, and keep the `asyncio.run(main())` entry point intact.
- **User-facing strings are Russian.** Preserve the language when editing greetings/button labels unless explicitly asked to translate.

## Security caveat

`BOT_TOKEN` is currently hardcoded in `bot-1.py` and has been committed to git history. If you are asked to rotate or move it to an env var (`os.environ["BOT_TOKEN"]` or similar), remind the user that the existing token must be revoked via @BotFather since rewriting git history does not invalidate exposed secrets.
