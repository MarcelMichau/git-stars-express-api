const express = require('express');
const fetch = require('node-fetch');
const app = express();

const API_BASE = 'https://api.github.com/';

const headers = {
    'Accept': 'application/vnd.github.v3.star+json'
};

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/repos/:username/:pageCount', async (req, res) => {
    const { username, pageCount } = req.params;
    const response = await fetch(`${API_BASE}users/${username}/starred?page=${pageCount}`, {headers})
    const data = await response.json();
    res.json(data);
});

app.get('/avatar/:username/', async (req, res) => {
    const { username } = req.params;
    const response = await fetch(`${API_BASE}users/${username}`);
    const data = await response.json();
    res.json(data);
});

app.listen(3001, () => console.log('git-stars-express-api listening on port 3001'));