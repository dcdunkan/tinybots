import { serve } from "https://deno.land/std@0.188.0/http/server.ts";
import { Bot } from "https://deno.land/x/grammy@v1.16.1/mod.ts";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN");
const CHAT_ID = Number(Deno.env.get("CHAT_ID"));
const SECRET = Deno.env.get("SECRET");

if (!BOT_TOKEN || isNaN(CHAT_ID) || !SECRET) {
  throw new Error("Missing or invalid environment variables.");
}

const STATUS_PAGE_ROOT = "https://www.githubstatus.com/incidents";

// Documentation of the webhook payload (for future references):
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

const bot = new Bot(BOT_TOKEN);
const redirect = Response.redirect("https://t.me/status_gh");

function send(text: string, disable_notification: boolean) {
  return bot.api.sendMessage(CHAT_ID, text, {
    disable_notification,
    disable_web_page_preview: true,
    parse_mode: "HTML",
  });
}

function escape(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

serve(async (req) => {
  const { pathname } = new URL(req.url);
  if (pathname !== `/${SECRET}`) return redirect;

  const payload = await req.json() as Payload;

  if ("component" in payload) {
    const {
      component: { name, description },
      component_update: update,
    } = payload;

    const message = `\
<b>${escape(name)}</b>
${update.old_status} → ${update.new_status}\n
${escape(description)}
<i>${escape(new Date(update.created_at).toUTCString())}</i>`;

    const disableNotification = update.old_status !== "operational" &&
      update.new_status !== "operational";
    await send(message, disableNotification);
  } else if ("incident" in payload) {
    const { name, incident_updates, id } = payload.incident;
    const { status, body, created_at } = incident_updates[0];

    const message = `\
<b><a href="${STATUS_PAGE_ROOT}/${id}">${escape(name)}</a></b>
${status[0].toUpperCase() + status.substring(1)}\n
${escape(body) ?? ""}
${escape(new Date(created_at).toUTCString())}`;

    const isFirstUpdate = incident_updates.length == 1; // the very first update.
    const disableNotification = !isFirstUpdate && status !== "resolved";
    await send(message, disableNotification);
  }

  return new Response();
}, {
  onError: (err) => {
    console.error(err);
    return new Response("Something went wrong.", { status: 500 });
  },
});
