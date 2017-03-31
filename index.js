const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const GitHubApi = require('github');
const passport = require('passport');

const GitHubStrategy = require('passport-github').Strategy;

const app = express();

const API_BASE = 'https://api.github.com/';

passport.use(new GitHubStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3001/callback"
},
    function (accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }
));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

const headers = {
    'Accept': 'application/vnd.github.v3.star+json'
};

app.use(cors());

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/auth', passport.authenticate('github'));

app.get('/login', (req, res) => res.send('You need to login'));

app.get('/callback', passport.authenticate('github', { successRedirect: '/', failureRedirect: '/login' }));

app.get('/starredRepos/:page', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
    const { page } = req.params;

    const github = new GitHubApi({
        headers
    });

    github.activity.getStarredReposForUser({ page, username: req.user.username }, (err, response) => {
        if (err)
            return res.json(err);
        res.json(response)
    });
});

app.get('/avatar/:username/', async (req, res) => {
    const { username } = req.params;
    const response = await fetch(`${API_BASE}users/${username}`);
    const data = await response.json();
    res.json(data);
});

app.get('/creds', (req, res) => res.json({
    clientID: process.env.CLIENT_ID
}));

app.get('/currentUser', (req, res) => res.json(req.user));

app.listen(3001, () => console.log('git-stars-express-api listening on port 3001'));