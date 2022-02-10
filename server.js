const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const {
  getTweets,
  createTweet,
  getUserByUsername,
  getTweetsByUsername
} = require('./services/database');

const { authenticate } = require('./middleware');

const port = 3333;
const secret = 'mysecret1234';

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send({ message: 'Hello from Twitter API!' })
});

app.get('/tweets', async (req, res) => {
  const tweets = await getTweets();
  res.send(tweets);
});

app.get('/tweets/:username', async (req, res) => {
  const { username } = req.params;
  const tweets = await getTweetsByUsername(username);
  res.send(tweets);
});

app.post('/tweets', async (req, res) => {
  const { message } = req.body;
  const token = req.headers['x-auth-token'];

  try {
    const payload = jwt.verify(
      token,
      Buffer.from(secret, 'base64')
    );

    const newTweet = await createTweet(message, payload.id);
    res.send(newTweet);
  } catch (error) {
    res.status(401).send({
      error: 'Unable to authenticate - please use a valid token'
    });
  }
});

app.get('/session', authenticate, (req, res) => {
  const { username } = req.user;
  
  res.status(200).send({
    message: `You are authenticated as ${username}`
  });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await getUserByUsername(username);

    if (!user) {
      return res.status(401).send({ error: 'Unknown user' });
    }

    if (user.password !== password) {
      return res.status(401).send({ error: 'Wrong password' });
    }

    const token = jwt.sign({
      id: user.id,
      username: user.username,
      name: user.name,
    }, Buffer.from(secret, 'base64'));

    res.send({
      token: token
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Twitter API listening on port ${port}`)
});