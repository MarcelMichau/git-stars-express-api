const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
var GitHubApi = require('github');
const app = express();

const API_BASE = 'https://api.github.com/';

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const headers = {
    'Accept': 'application/vnd.github.v3.star+json'
};

app.use(cors());

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/auth', (req, res) => res.redirect(`https://github.com/login/oauth/authorize?client_id=${clientID}`));

app.get('/callback', async (req, res) => {
    const code = req.query.code;
    console.log('Callback code param: ' + code);

    const accessTokenResponse = await fetch(`https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${code}`, { method: 'POST', headers: {'Accept' : 'application/json'} });

    const token = await accessTokenResponse.json();
    console.log(token);

    res.json({message: token})     
});

app.get('/starredRepos/:username/:page', (req, res) => {
    const { username, page } = req.params;
    var github = new GitHubApi({
        headers
    });
    github.activity.getStarredReposForUser({username, page}, (err, response) => res.json(response));
});

app.get('/repos/:username/:pageCount', async (req, res) => {
    const { username, pageCount } = req.params;
    const response = await fetch(`${API_BASE}users/${username}/starred?page=${pageCount}`, { headers })
    const data = await response.json();
    res.json(data);
});

app.get('/avatar/:username/', async (req, res) => {
    const { username } = req.params;
    const response = await fetch(`${API_BASE}users/${username}`);
    const data = await response.json();
    res.json(data);
});

app.get('/creds', (req, res) => res.json({
    clientID,
    clientSecret
}))

app.listen(3001, () => console.log('git-stars-express-api listening on port 3001'));