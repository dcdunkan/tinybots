import { Bot } from "https://deno.land/x/grammy@v1.15.3/mod.ts";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN");
if (!BOT_TOKEN) throw new Error("No token.");

const bot = new Bot(BOT_TOKEN);

bot.on(
  "message:text",
  (ctx) => console.log(ctx.entities(["mention", "text_mention"])),
);

bot.start();

/* bot.on("::bot_command").filter((ctx) => {
  return ctx.entities("bot_command").some((entity) => entity.text === "/cc") &&
    ctx.entities(["mention", "text_mention"]).length !== 0;
}, (ctx) => {
  const ccCommand = ctx.entities("bot_command")
    .find((e) => e.text === "/cc");
  if (!ccCommand) return;
  const textAfter = (ctx.msg.text ?? ctx.msg.caption)
    ?.slice(ccCommand.offset + ccCommand.length).split("\n")[0];
  if (!textAfter) return;
  const mentions = ctx.entities(["mention", "text_mention"]);
  const afterMentions = mentions.map((e) => {

  });
});*/
