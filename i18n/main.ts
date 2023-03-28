import {
  Bot,
  Context,
  MemorySessionStorage,
  session,
  SessionFlavor,
} from "https://deno.land/x/grammy@v1.15.3/mod.ts";
import {
  I18n,
  I18nFlavor,
} from "https://deno.land/x/grammy_i18n@v1.0.1/mod.ts";
import { serve } from "https://deno.land/std@0.181.0/http/server.ts";

const TOKEN = Deno.env.get("BOT_TOKEN");
if (!TOKEN) throw new Error("No BOT_TOKEN set.");

type MyContext = Context & I18nFlavor & SessionFlavor<{ language?: string }>;

const bot = new Bot<MyContext>(TOKEN);

const storage = new MemorySessionStorage(); // Gotta change later.

bot.use(session({
  initial: () => ({ language: undefined }),
  storage,
}));

const i18n = new I18n<MyContext>({
  useSession: false,
  defaultLocale: "en",
  localeNegotiator: (ctx) =>
    ctx.session.language ?? ctx.from?.language_code ?? "en",
});

await i18n.loadLocalesDir("locales");

bot.use(i18n);

bot.command("start", async (ctx) => {
  await ctx.reply(ctx.t("start-message"));
});

bot.start();
