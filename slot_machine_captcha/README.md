> DON'T USE THIS YET, ITS A WORK IN PROGRESS.

#### TODO(2):

- Make use of chat_join_request feature.
- Host a public version of the bot.

# Slot-Machine Captcha Bot

So, Telegram has this cool dice thing. You can roll a die or throw a dart or
kick a football, etc. with their corresponding emojis. They'll generate a random
value server-side and the output will be based on that random value. For example
in the case of a die roll, the value can be any from 1 to 6.

One of the "dice" is a slot-machine, yes, the gambling device. You can pull the
lever, so a random value from 1 to 64 is generated, which reflects the outcome.

This bot uses this slot-machine feature as a CAPTCHA. When a user is joined to a
supergroup, bot prompts the user to complete the CAPTCHA. A slot machine and a
button set is sent. Each button is a possible outcome. Only one of them is the
correct one, which is identical to what they can see in the slot machine emoji.
If the user select the right one, they are allowed to talk. Otherwise they are
kicked.

PROS(1):

It is awesome. Simple yet powerful.

CONS(1):

WEBK and WEBZ doesn't support dice feature currently, even though they are two
major OFFICIAL clients. But we can also consider this as an ultimate CAPTCHA
which forces them to use/install a supported client just to clear the CAPTCHA :P

### Environment Variables (1)

- BOT_TOKEN: Get one from <https://t.me/BotFather>.
