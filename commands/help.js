const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'help',
  description: 'Show available commands',
  author: 'System',
  execute(senderId, args, pageAccessToken, sendMessage) {
    const commandsDir = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    const quickReplies = commandFiles.map(file => {
      const command = require(path.join(commandsDir, file));
      return {
        content_type: "text",
        title: command.name,
        payload: `COMMAND_${command.name.toUpperCase()}`
      };
    });

    const helpMessage = `❐ Available Commands:\nPlease choose a command:`;
    
    sendMessage(senderId, {
      text: helpMessage,
      quick_replies: quickReplies
    }, pageAccessToken);
  }
};