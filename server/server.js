const env = require('dotenv').config();
const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const ExpressPeerServer = require('peer').ExpressPeerServer;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = express();
const cors = require('cors');

const apiRoutes = require('./routes/api');

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.resolve(__dirname, '../', 'build')))
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

app.use(require('express-session')({
    secret: 'kornishon',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

let dbConnection = require('./db/connect');

// CONFIG PASSPORT
const Room = require('./models/Room');
passport.use(new LocalStrategy(Room.authenticate()));
passport.serializeUser(Room.serializeUser());
passport.deserializeUser(Room.deserializeUser());

let rootPath = path.join(__dirname, '../');
let dirPath = path.join(__dirname + '/');

const server = https.createServer({
    key: fs.readFileSync(rootPath + 'server.key'),
    cert: fs.readFileSync(rootPath + 'server.cert')
}, app);

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname});
});
app.get('/status', (req, res)=> {
    res.sendFile(dirPath + 'index.html');
})
// CONFIG PEER SERVER
const options = {
    debug: true
}
const peerserver = ExpressPeerServer(server, options);

peerserver.on('connection', (id) => {
    console.log("Connected: ", id);
    peerserver.emit({cmd: "connection", user: id});
});

peerserver.on('disconnect', (id) => {
    console.log("Disconnected: ", id);
});

app.use('/peerjs', peerserver);


require('./db/seed');

module.exports = server;
