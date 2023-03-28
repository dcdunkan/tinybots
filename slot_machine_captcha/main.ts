import { Bot, InlineKeyboard } from "https://deno.land/x/grammy@v1.15.3/mod.ts";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN");
if (!BOT_TOKEN) throw new Error("No BOT_TOKEN env var found");

const bot = new Bot(BOT_TOKEN);

const SLOT_EMOJIS = ["🔤", "🫐", "🍋", "7️⃣"];

function resolveDice(value: number) {
  return [0, 1, 2].map((i) => ((value - 1) >> (i * 2)) & 0x03);
}

bot.on("chat_member", (ctx) => {
  const { old_chat_member, new_chat_member: member, from } = ctx.chatMember;
  if (from.is_bot) return;
  if (member.status !== "member") return;
  if (
    old_chat_member.status !== "left" &&
    old_chat_member.status !== "kicked"
  ) return;
});

bot.command("captcha", async (ctx) => {
  const { dice: { value }, message_id } = await ctx.replyWithDice("🎰");

  const optionValues = [value];
  while (optionValues.length < 4) {
    const randomValue = Math.floor(Math.random() * 64) + 1;
    if (randomValue !== value) optionValues.push(randomValue);
  }
  const options = optionValues.sort((v) => v > 32 ? -1 : 1).map((value) =>
    resolveDice(value).map((i) => SLOT_EMOJIS[i]).join(" ")
  );

  const keyboard = new InlineKeyboard();
  for (let i = 0; i < options.length; i++) {
    keyboard.row().text(options[i], `choose:${i}`);
    // if (i !== 0 && i % 2 === 0) keyboard.row();
  }

  await ctx.reply(`What do you see?`, {
    parse_mode: "HTML",
    reply_to_message_id: message_id,
    reply_markup: keyboard,
  });
});

bot.callbackQuery(/choose:(\d)/, async (ctx) => {
  if (!ctx.match) return ctx.answerCallbackQuery("Weird 1.");
  const [_, index] = ctx.match;
  const value = ctx.callbackQuery.message?.reply_to_message?.dice?.value;
  if (value === undefined) return ctx.answerCallbackQuery("Weird 2.");
  const correct = resolveDice(value).map((i) => SLOT_EMOJIS[i]).join(" ");
  const keyboard = ctx.callbackQuery.message?.reply_markup?.inline_keyboard
    ?.[Number(index)]?.[0];
  if (!keyboard) return ctx.answerCallbackQuery("Weird 3.");
  await ctx.answerCallbackQuery(
    keyboard.text === correct
      ? "Captcha cleared successfully"
      : "You missed it, sorry.",
  );
  await ctx.deleteMessage();
  await ctx.api.deleteMessage(
    ctx.chat?.id!,
    ctx.callbackQuery.message?.reply_to_message?.message_id!,
  );
});

bot.catch(console.error);

bot.start();

// bot.start({ allowed_updates: ["callback_query", "chat_member"] });
