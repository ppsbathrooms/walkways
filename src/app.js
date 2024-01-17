"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)(); // creates app for server's client
app.set('views', path_1.default.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
app.use(body_parser_1.default.json()); // Express modules / packages
app.use(body_parser_1.default.urlencoded({
    extended: true
})); // Express modules / packages
app.use(express_1.default.static('views'));
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.render('html/home');
    }
    catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
}));
//404 keep at end of redirects
app.get('*', (req, res) => {
    res.status(404).render('html/404.html', {});
});
app.route('/reqtypes')
    .get((req, res) => {
    res.send('Get');
})
    .post((req, res) => {
    res.send('Post');
})
    .put((req, res) => {
    res.send('Put');
});
const PORT = process.env.PORT || 42069;
// thing that works but nobody knows how PLZ DONT TOUCH PLZZZZ
// i touched it... sorry :(
// NOOOOOOO
app.listen(42069, '0.0.0.0', () => {
    console.log(`server started on port ${42069}`);
});
