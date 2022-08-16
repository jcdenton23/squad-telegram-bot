const TelegramApi = require('node-telegram-bot-api');
const { gameOptions } = require('./options');

const token = '5670120429:AAE8uSveZVhew3BlS8v_P_3kiqy-ZxfBdp8';

const bot = new TelegramApi(token, { polling: true });

const chats = {};
const initialMessage = `
🏆 Игра 📍 Место 🕖 Время
`;

require('http')
  .createServer()
  .listen(process.env.PORT || 5000)
  .on('request', function (req, res) {
    res.end('');
  });

const changeGameSettings = async (settingsText, chatId) => {
  const [gameName = 'КвизПлиз', place = 'Friends', time = '19:15'] = settingsText.split(',');
  let newMessage = chats[chatId]?.initialMessage.replace('Игра', `${gameName.trim()}`);
  newMessage = newMessage.replace('Место', place.trim());
  newMessage = newMessage.replace('Время', time.trim());
  chats[chatId] = { ...chats[chatId], initialMessage: newMessage };
  await bot.editMessageText(newMessage, {
    chat_id: chatId,
    message_id: chats[chatId]?.messageId,
  });
};

const startSquad = async (chatId) => {
  const { message_id: initialMessageId } = await bot.sendMessage(chatId, initialMessage);
  squad = [];
  chats[chatId] = { initialMessage: initialMessage, messageId: initialMessageId };
  await bot.pinChatMessage(chatId, initialMessageId);
  await bot.sendMessage(chatId, 'Выберите игру', gameOptions);
};

const start = async () => {
  bot.setMyCommands([
    { command: '/start', description: 'Начать сбор' },
    { command: '/add', description: 'Добавить себя' },
    { command: '/addfriend', description: 'Добавить друга' },
    { command: '/remove', description: 'Удалить себя' },
    { command: '/removefriend', description: 'Удалить друга' },
  ]);

  bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    if (text === '/start' || text === '/start@FifaxQuizSquadBot') {
      return await startSquad(chatId);
    }
    if (text === '/add' || text === '/add@FifaxQuizSquadBot') {
      const oldMessage = chats[chatId]?.initialMessage;
      const msgFrom = msg.from.first_name;
      const newMessage = oldMessage + `\n${msgFrom} ✅`;
      chats[chatId] = { ...chats[chatId], initialMessage: newMessage };
      return await bot.editMessageText(newMessage, {
        chat_id: chatId,
        message_id: chats[chatId]?.messageId,
      });
    }
    if (text === '/remove' || text === '/remove@FifaxQuizSquadBot') {
      const oldMessage = chats[chatId]?.initialMessage;
      const msgFrom = msg.from.first_name;
      const newMessage = oldMessage.replace(`\n${msgFrom} ✅`, '');
      chats[chatId] = { ...chats[chatId], initialMessage: newMessage };
      return await bot.editMessageText(newMessage, {
        chat_id: chatId,
        message_id: chats[chatId]?.messageId,
      });
    }
    if (text === '/changeSettings') {
      const { message_id: gameSettingsMessageId } = await bot.sendMessage(
        chatId,
        'Напишите название игры, место и время.'
      );

      return await bot.onReplyToMessage(chatId, gameSettingsMessageId, async (msg) => {
        await changeGameSettings(msg.text, chatId);
      });
    }
    if (text === '/addfriend' || text === '/addfriend@FifaxQuizSquadBot') {
      const { message_id: friendNameMessageId } = await bot.sendMessage(
        chatId,
        'Напишите имя друга, которого вы хотите добавить'
      );
      return await bot.onReplyToMessage(chatId, friendNameMessageId, async (msg) => {
        const oldMessage = chats[chatId]?.initialMessage;
        const friendName = msg.text;
        const newMessage = oldMessage + `\n${friendName} ✅`;
        chats[chatId] = { ...chats[chatId], initialMessage: newMessage };
        await bot.editMessageText(newMessage, {
          chat_id: chatId,
          message_id: chats[chatId]?.messageId,
        });
      });
    }
    if (text === '/removefriend' || text === '/removefriend@FifaxQuizSquadBot') {
      const { message_id: friendNameMessageId } = await bot.sendMessage(
        chatId,
        'Напишите имя друга, которого вы хотите удалить'
      );
      return await bot.onReplyToMessage(chatId, friendNameMessageId, async (msg) => {
        const oldMessage = chats[chatId]?.initialMessage;
        const friendName = msg.text;
        const newMessage = oldMessage.replace(`\n${friendName} ✅`, '');
        chats[chatId] = { ...chats[chatId], initialMessage: newMessage };
        await bot.editMessageText(newMessage, {
          chat_id: chatId,
          message_id: chats[chatId]?.messageId,
        });
      });
    }
  });

  bot.on('callback_query', async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    if (data === '/quizplease') {
      let newMessage = initialMessage.replace('Игра', 'Квиз Плиз!');
      newMessage = newMessage.replace('Место', 'Friends');
      newMessage = newMessage.replace('Время', '19:15');
      chats[chatId] = { ...chats[chatId], initialMessage: newMessage };
      await bot.editMessageText(newMessage, {
        chat_id: chatId,
        message_id: chats[chatId]?.messageId,
      });
    }
    if (data === '/einstein') {
      let newMessage = initialMessage.replace('Игра', 'Эйнштейн Party');
      newMessage = newMessage.replace('Место', 'Наш бар');
      newMessage = newMessage.replace('Время', '19-15');
      chats[chatId] = { ...chats[chatId], initialMessage: newMessage };
      await bot.editMessageText(newMessage, {
        chat_id: chatId,
        message_id: chats[chatId]?.messageId,
      });
    }
  });
};

start();
