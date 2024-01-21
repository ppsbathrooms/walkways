import path from "path";
import express from 'express';
import passport from 'passport'
require('./auth');
import * as dotenv from 'dotenv';
dotenv.config();

const session = require('express-session')

function isLoggedIn(req, res, next) {
    next();
    // req.user ? next() : res.redirect('/auth/google');
}

const app = express();
app.use(session({
  secret: process.env.SESSION_SECRET,
}));

app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'views', 'public')));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    const data = {
        isAuthenticated: req.isAuthenticated(),
        user: req.user ? { displayName: req.user.displayName, email: req.user.email, photo: req.user.photos[0].value } : null
    };
    res.render('html/home', { data: JSON.stringify(data) });
});


app.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile']})
);

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/auth/failure'
    })
);

app.get('/auth/failure', (req, res) => {
    res.send('something went wrong')
});

app.get('/account', isLoggedIn, (req, res) => {
    res.render(`html/account`)
});

app.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }

        req.session.destroy(() => {
            res.redirect('/');
        });
    });
});


// API REQUESTS

app.get('/api/brdata', (req, res) => {
    // get data from da server
    const brData = {
        chs: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
        fhs: [0,1,0,0,0,1,1,0,0,1,0,0,1,0,0,0,1,1,1,1,0,1,0,0,1,0,1,0,1,0],
        ihs: [1,0,0,1,1,1,0,0,1,0,1,0,1,1,0]
    }
    
    res.json(brData);
});

const PORT = 42069;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});