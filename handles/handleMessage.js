// handles/handleMessage.js
const { sendMessage } = require('./sendMessage');
const helpCommand = require('../commands/help');

function handleMessage(event, pageAccessToken) {
  const senderId = event.sender.id;
  const message = event.message.text;

  // Basic response or logic to process the message
  if (message.toLowerCase() === 'help') {
    helpCommand.execute(senderId, [], pageAccessToken, sendMessage);
  } else {
    sendMessage(senderId, { text: `You said: ${message}` }, pageAccessToken);
  }
}

module.exports = { handleMessage };
