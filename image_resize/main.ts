import {
  Bot,
  Context,
  InputFile,
  MemorySessionStorage,
  NextFunction,
  session,
  SessionFlavor,
} from "https://deno.land/x/grammy@v1.15.3/mod.ts";
import { Message } from "https://deno.land/x/grammy@v1.15.3/types.ts";
import {
  Conversation,
  ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations@v1.1.1/mod.ts";
import {
  ImageMagick,
  initializeImageMagick,
  MagickGeometry,
} from "https://deno.land/x/imagemagick_deno@0.0.19/mod.ts";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN");
if (!BOT_TOKEN) throw new Error("Invalid BOT_TOKEN");

await initializeImageMagick();

interface SessionData {
  image_file_id: string;
}

interface CustomContextFlavor {
  alert(text: string): Promise<true>;
  edit(id: Message | number, text: string): Promise<Message | true>;
  delete(id: Message | number): Promise<true>;
}

type MyContext =
  & Context
  & CustomContextFlavor
  & ConversationFlavor
  & SessionFlavor<SessionData>;
type MyConversation = Conversation<MyContext>;

const bot = new Bot<MyContext>(BOT_TOKEN);
bot.use(enhanceContext);
bot.use(
  session({
    storage: new MemorySessionStorage(),
    initial: () => ({ image_file_id: "" }),
  }),
);
bot.use(conversations());
bot.use(createConversation(resize));
bot.catch(console.error);

const privateChat = bot.chatType("private");

privateChat.on("message:photo", async (ctx) => {
  if (ctx.session.image_file_id) return await ctx.reply("Ongoing another job");
  const photo = ctx.message.photo[ctx.message.photo.length - 1];
  // make sure it is downloadable.
  if (!photo || photo.file_size === undefined) {
    return await ctx.reply("File size is unknown. Can't proceed :(");
  } else if (photo.file_size > 20 * 1024 * 1024) {
    return await ctx.reply("File is too large to download. Max 20MB");
  }

  await ctx.reply(`\
Width: ${photo.width}px\nHeight: ${photo.height}px
Use /cancel to cancel the job.`);
  ctx.session = { image_file_id: photo.file_id };
  await ctx.conversation.enter("resize");
});

privateChat.command("start", async (ctx) => {
  if (Object.keys(await ctx.conversation.active()).length) return;
  await ctx.reply("Hi there. Send me an image to resize.");
});

privateChat.command("cancel", async (ctx) => {
  if (!Object.keys(await ctx.conversation.active()).length) {
    return await ctx.reply("Nothing to cancel.");
  }
  await ctx.conversation.exit("resize");
  ctx.session.image_file_id = "";
  await ctx.reply("Cancelled ongoing resizing");
});

bot.start({
  onStart: (info) => {
    console.log("Running @" + info.username);
  },
});

async function resize(conversation: MyConversation, ctx: MyContext) {
  if (ctx.chat?.type !== "private") return; // Just for the types.

  await ctx.reply("Width of the output (in px)?");
  const width = await conversation.form.number((ctx) => ctx.deleteMessage());
  if (width <= 0) return await ctx.reply("Invalid input.");

  await ctx.reply("Height of the output (in px)?");
  const height = await conversation.form.number((ctx) => ctx.deleteMessage());
  if (height <= 0) return await ctx.reply("Invalid input.");

  const status = await ctx.reply("Downloading photo...");
  const { file_path } = await ctx.getFile();
  if (file_path === undefined) {
    return await ctx.edit(status, "Failed to get file download URL");
  }
  const url = `https://api.telegram.org/file/bot${bot.token}/${file_path}`;
  const buffer = await conversation.external(async () => {
    const response = await fetch(url);
    if (!response.ok) return;
    return await response.arrayBuffer();
  });
  if (buffer === undefined) return await ctx.edit(status, "Failed to download");
  const input = new Uint8Array(buffer);
  await ctx.edit(status, "Resizing...");

  const output = await conversation.external(() => {
    // https://deno.com/blog/build-image-resizing-api
    const sizingData = new MagickGeometry(width, height);
    sizingData.ignoreAspectRatio = true;
    return new Promise<Uint8Array>((resolve) => {
      ImageMagick.read(input, (image) => {
        image.resize(sizingData);
        image.write((data) => resolve(data));
      });
    });
  });

  await ctx.edit(status, "Uploading...");
  const now = new Date();
  const filename =
    `${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}.jpg`;
  await ctx.replyWithDocument(new InputFile(output, filename));
  await ctx.delete(status);
}

// Install custom methods.
async function enhanceContext(ctx: MyContext, next: NextFunction) {
  ctx.alert = (text) => ctx.answerCallbackQuery({ text, show_alert: true });
  ctx.edit = (id, text) => {
    const message = typeof id === "number" ? id : id.message_id;
    return ctx.api.editMessageText(ctx.chat?.id!, message, text);
  };
  ctx.delete = (id) => {
    const message = typeof id === "number" ? id : id.message_id;
    return ctx.api.deleteMessage(ctx.chat?.id!, message);
  };
  await next();
}
