import express from 'express';
import bodyParser from 'body-parser';

import routesHandler from './routes/handler'

const app = express();
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());
app.use('/', routesHandler)

const PORT = 42068;

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})