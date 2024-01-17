import bodyParser from 'body-parser';
import path from 'path';
import express, { Request, Response } from 'express';

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
    res.render('html/home');
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
  .get((req: Request, res: Response) => {
    res.send('Get');
  })
  .post((req: Request, res: Response) => {
    res.send('Post');
  })
  .put((req: Request, res: Response) => {
    res.send('Put');
  });

const PORT = process.env.PORT || 42069;

// thing that works but nobody knows how PLZ DONT TOUCH PLZZZZ
// i touched it... sorry :(
// NOOOOOOO
app.listen(42069, '0.0.0.0', () => {
  console.log(`server started on port ${42069}`);
});