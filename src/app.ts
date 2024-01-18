const express = require('express');
const passport = require('passport')
require('./auth');

const session = require('express-session')

function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}

const app = express();
app.use(session({
  secret: 'cat',
}));

app.use(passport.initialize());
app.use(passport.session());


app.get('/', (req, res) => {
    res.send('<a href="/auth/google">google login</a>');
});

app.get('/auth/google', 
    passport.authenticate('google', { scope: ['email', 'profile']})
);

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/account',
        failureRedirect: '/auth/failure'
    })
);

app.get('/auth/failure', (req, res) => {
    res.send('something went wrong')
});

app.get('/account', isLoggedIn, (req, res) => {
    res.send(`<p>${req.user.displayName}'s account</p>`)
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


const PORT = 42069;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});