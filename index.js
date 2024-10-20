const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { sendMessage } = require('./handles/sendMessage');
const helpCommand = require('./commands/help');

const app = express();
app.use(bodyParser.json());

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

// Define the handleMessage function
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
          handleMessage(event, PAGE_ACCESS_TOKEN);  // Call handleMessage for incoming messages
        } else if (event.postback) {
          handlePostback(event, PAGE_ACCESS_TOKEN); // Call handlePostback for postbacks
        }
      });
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
      
