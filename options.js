module.exports = {
  gameOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: 'КвизПлиз!', callback_data: '/quizplease' },
          { text: 'Эйнштейн Party', callback_data: '/einstein' },
        ],
      ],
    }),
  },
};
