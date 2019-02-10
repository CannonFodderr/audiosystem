const router = require('express').Router();
const Room = require('../models/Room');
const User = require('../models/User');
const Book = require('../models/Books');
const {isLoggedIn, isAdmin} = require('../middleware/auth');
const passport = require('passport');
const fs = require('fs');

// AUTHENTICATION
router.post('/login', passport.authenticate('local'), (req, res) => {
    if(!req.user){
        return res.json({err: "Username or Password are incorrect"})
    }
    return res.json({room: req.user});
});

router.post('/logout', (req, res) => {
    res.send("logout");
});

// ROOMS
// Get all rooms
router.get('/rooms', isAdmin, (req, res) => {
    Room.find().populate('currentUser').populate('currentBook').exec()
    .then((allRooms) => {
        res.json(allRooms);
    });
});

// Get Room Data
router.get('/rooms/:roomId', isLoggedIn, (req, res) => {
    Room.findById(req.params.roomId)
    .then(foundRoom => {
        res.json(foundRoom);
    })
    .catch(err => {
        console.log(err)
    })
});
router.put(`/rooms/:roomId`, isAdmin, (req, res) => {
    Room.findOneAndUpdate({_id: req.params.roomId}, req.body)
    .then(updatedRoom => {
        updatedRoom.save();
        res.json(updatedRoom);
    })
    .catch(err => console.log(err));
})

// USER
router.get('/users', isAdmin, (req, res) =>{
    User.find()
    .then(allUsers => {
        res.json(allUsers)
    })
    .catch(err => console.log(err));
});
// Find user by id
router.get('/users/:userId',isLoggedIn, (req, res) => {
    User.findById(req.params.userId)
    .then(foundUser => {
        res.json(foundUser)
    })
    .catch(err => console.log(err));
});

// BOOKS
router.get('/books', isLoggedIn, (req, res) =>{
    Book.find()
    .then(allBooks => {
        res.json(allBooks)
    })
    .catch(err => console.log(err));
});

// Find book by id
router.get('/books/:bookId', (req, res) => {
    Book.findById(req.params.userId)
    .then(foundBook => {
        res.json(foundBook)
    })
    .catch(err => console.log(err));
});


router.get('/audio', (req, res) => {
    console.log("Get file request")
        const path = `server/public/test.mp3`;
        const state = fs.statSync(path);
        const fileSize = state.size;
        const range = req.headers.range;
        if(range){
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = (end-start)+1;
            const file = fs.createReadStream(path, {start, end});
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'audio/mp3',
            }
            console.log("Streaming...")
            res.writeHead(206, head);
            file.pipe(res);
        }else{
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'audio/mp3',
            }
            console.log("Streaming first part")
            res.writeHead(200, head)
            fs.createReadStream(path).pipe(res)
        }
});

module.exports = router;