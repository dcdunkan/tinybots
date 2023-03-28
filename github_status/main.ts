import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { Bot } from "https://deno.land/x/grammy@v1.15.3/mod.ts";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN");
const CHAT_ID = Number(Deno.env.get("CHAT_ID"));
const SECRET = Deno.env.get("SECRET"); // to avoid others from posting.
if (!BOT_TOKEN || isNaN(CHAT_ID) || !SECRET) {
  throw new Error("Where are the vars?");
}

const bot = new Bot(BOT_TOKEN);
const redirect = Response.redirect("https://t.me/status_gh");

serve(async (req) => {
  const { pathname } = new URL(req.url);
  if (pathname !== `/${SECRET}`) return redirect;

  const payload = await req.json() as Payload;
  if ("component" in payload) {
    const { component: { name, description }, component_update } = payload;

    const message = [
      `<b>${escape(name)}</b>`,
      `${component_update.old_status} → ${component_update.new_status}`,
      `${escape(description)}`,
      // `${new Date(component_update.created_at).toLocaleString()}`,
    ].join("\n");

    await send(message);
  } else {
    const { name, incident_updates, id } = payload.incident;
    const update = incident_updates[0];

    const message = [
      `<b>${escape(name)}</b>`,
      ...(incident_updates.length === 1 // if its the first one.
        ? [`https://githubstatus.com/incidents/${id}`]
        : []),
      `${update.status[0].toUpperCase() + update.status.substring(1)}`,
      `${escape(update.body) ?? ""}`,
      `${new Date(update.created_at).toLocaleString()}`,
    ].join("\n");

    await send(message);
  }

  return new Response();
}, {
  onError: (err) => {
    console.error(err);
    return new Response();
  },
});

function send(text: string) {
  return bot.api.sendMessage(CHAT_ID, text, {
    disable_web_page_preview: true,
    parse_mode: "HTML",
  });
}

function escape(str: string) {
  return str.replace("<", "&lt;").replace(">", "&gt;").replace("&", "&amp;");
}

// Documentation of the webhook payload:
// https://support.atlassian.com/statuspage/docs/enable-webhook-notifications/
type Payload =
  & ({
    incident: {
      name: string;
      id: string;
      incident_updates: {
        status: string;
        body: string;
        created_at: string;
      }[];
    };
  } | {
    component: {
      name: string;
      description: string;
    };
    component_update: {
      created_at: string;
      old_status: string;
      new_status: string;
    };
  })
  & { page: { status_description: string } };
