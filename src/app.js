// #region Imports & Setup
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const fs = require('fs');

const app = express(); // creates app for server's client

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use(bodyParser.json()); // Express modules / packages
app.use(bodyParser.urlencoded({
  extended: true
})); // Express modules / packages

app.get('/', async (req, res) => {
  try {
    dataToSendToClient = null;
    res.render('html/home', { data: dataToSendToClient });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

//404 keep at end of redirects
app.get('*', (req, res) => {
  res.status(404).render('html/404.html', {});
});

app.route('/reqtypes')
  .get(function(req, res) {
    res.send('Get');
  })
  .post(function(req, res) {
    res.send('Post');
  })
  .put(function(req, res) {
    res.send('Put');
  });

const PORT = process.env.PORT || 42069;

// thing that works but nobody knows how PLZ DONT TOUCH PLZZZZ
// i touched it... sorry :(
// NOOOOOOO
app.listen(PORT, '0.0.0.0', () => {
  console.log(`server started on port ${PORT}`);
});

