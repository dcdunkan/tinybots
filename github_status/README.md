# GitHub Status

Bot for posting real-time status updates of GitHub systems in a Telegram chat. A
webhook must be configured at <https://githubstatus.com> pointing to
`<your-app-domain>/<$SECRET>`.

Running instance: <https://t.me/status_gh>

### Environment variables (3)

- `BOT_TOKEN`: Get one from <https://t.me/BotFather>.
- `CHAT_ID`: ID of the chat where the bot should post. If its not a private
  chat, make sure the bot has enough permissions to send a message.
- `SECRET`: Any string just for making sure that anyone else other than
  githubstatus.com can POST to server.
