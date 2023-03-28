start-message =
  Hi there. This is a service bot for registering your language so it
  can be accessed by other bots and give you a better localized
  experience. See the documentation here if you are also a developer.

prompt-from-language-code =
  From the updates I've been recieving from your Telegram client, I
  see that the interface language is set to { $language }. If its right,
  would you like to set it as your language?

  .confirm = Yes
  .decline = No

set-language =
  Okay, choose your language from the following list:

  .done =
    Language have been set! You should be recieving messages in the
    language you have set in the bots using this service.
  
  .already-set =
    Language was already the same! Click the button below to change
    the language to another if you want to.
