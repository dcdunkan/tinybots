> INCOMPLETE. WIP

# cc (carbon-copy) Bot

Just /start the bot. If anyone in a chat where the bot is also a member /cc some
users to/in a message, they will get notifications about it. To be more
specific, they'll get a carbon-copy of the message. Mentioned users doesn't need
to be in the group - that's a goal.

@pinging is enough, of course. But it doesn't work for the users that are not in
the group.

**Example message**:

```
Seems like a possible fix for the issue.
/cc @user1 text_mention_of_user2.
```

(Or you can /cc as a reply message.)

**NOTE**: CCs are only send to the mentioned ones in the same line as the /cc
command.

### Environment Variables (1)

- `BOT_TOKEN`: Get one from https://t.me/BotFather.
