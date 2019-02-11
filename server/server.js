const env = require('dotenv').config();
const express = require('express');
const http = require('https');
const https = require('https');
const port = process.env.PORT || 8080;
const host = process.env.HOST;
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const ExpressPeerServer = require('peer').ExpressPeerServer;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = express();

const apiRoutes = require('./routes/api');

app.set('view engine', 'ejs');
// app.use(express.static(path.join(__dirname, 'semantic')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.resolve(__dirname, '../', 'build')))
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(require('express-session')({
    secret: 'kornishon',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


require('./db/connect');

// CONFIG PASSPORT
const Room = require('./models/Room');
passport.use(new LocalStrategy(Room.authenticate()));
passport.serializeUser(Room.serializeUser());
passport.deserializeUser(Room.deserializeUser());

const server = https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app).listen(port, host, () => {
    console.log(`Serving on ${host}:${port}`);
})

const options = {
    debug: true
}

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname});
});
// CONFIG PEER SERVER
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
