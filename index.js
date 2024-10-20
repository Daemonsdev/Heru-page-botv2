const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const { sendMessage } = require('./handles/sendMessage');
const helpCommand = require('./commands/help');

const app = express();
app.use(bodyParser.json());

const loadMenuCommands = async () => {
  try {
    const commandsDir = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    const commandsList = commandFiles.map(file => {
      const command = require(path.join(commandsDir, file));
      return { name: command.name, description: command.description || 'No description available' };
    });

    const loadCmd = await axios.post(`https://graph.facebook.com/v21.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`, {
      commands: [
        {
          locale: "default",
          commands: commandsList
        }
      ]
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (loadCmd.data.result === "success") {
      console.log("Commands loaded!");
    } else {
      console.log("Failed to load commands");
    }
  } catch (error) {
    console.error('Error loading commands:', error);
  }
};

async function sendQuickReplies(senderId, pageAccessToken) {
  const quickReplies = [
    {
      content_type: "text",
      title: "Get Help",
      payload: "GET_HELP",
    },
    {
      content_type: "text",
      title: "Ask AI",
      payload: "ASK_AI",
    },
  ];

  await sendMessage(senderId, {
    text: "What would you like to do?",
    quick_replies: quickReplies,
  }, pageAccessToken);
}

function handlePostback(event, pageAccessToken) {
  const senderId = event.sender.id;
  const payload = event.postback.payload;

  if (payload === 'GET_STARTED') {
    sendQuickReplies(senderId, pageAccessToken);
  } else if (payload === 'GET_HELP') {
    helpCommand.execute(senderId, [], pageAccessToken, sendMessage);
  } else {
    sendMessage(senderId, { text: `You sent a postback with payload: ${payload}` }, pageAccessToken);
  }
}

const VERIFY_TOKEN = 'pagebot';
const PAGE_ACCESS_TOKEN = fs.readFileSync('token.txt', 'utf8');

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      entry.messaging.forEach(event => {
        if (event.message) {
          handleMessage(event, PAGE_ACCESS_TOKEN);
        } else if (event.postback) {
          handlePostback(event, PAGE_ACCESS_TOKEN);
        }
      });
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

loadMenuCommands();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
