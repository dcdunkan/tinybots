<samp>
> CAN'T BE USED YET, WIP.

#### TODO:

- Move to a separate repository.

# i18N Bot

A service bot for registering a language as user's language so it can be
accessed by other bots which uses this service. The idea is to be a public and
centralised solution for the locale settings of user.

- User sets a language in this bot.
- Other bot does <GET /:user_id> to this server.
- The language set by the user is returned. If the user haven't set any, the
  'ok' response parameter will be false.
- Other bot starts to message to the user in that language.

I prefer the "Other bot" to have a language setting in itself so if the user
need to change the language for that bot alone, it can be done.

(Will write more about this later.)

### Environment Variables (1)

- `BOT_TOKEN`: Get one from <https://t.me/BotFather>.

</samp>
