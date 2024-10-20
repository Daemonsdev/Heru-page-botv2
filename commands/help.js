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

      // Check if command.name exists, otherwise provide a default value
      const commandName = command.name ? command.name : 'Unknown Command';

      return {
        content_type: "text",
        title: commandName,
        payload: `COMMAND_${commandName.toUpperCase()}`
      };
    });

    const helpMessage = `❐ Available Commands:\nPlease choose a command:`;
    
    sendMessage(senderId, {
      text: helpMessage,
      quick_replies: quickReplies
    }, pageAccessToken);
  }
};
