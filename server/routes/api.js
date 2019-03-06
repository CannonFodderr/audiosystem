const router = require('express').Router();
const Room = require('../models/Room');
const User = require('../models/User');
const Book = require('../models/Books');
const {isLoggedIn, isAdmin} = require('../middleware/auth');
const passport = require('passport');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

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
router.put(`/rooms/:roomId`, isLoggedIn, (req, res) => {
    Room.findOneAndUpdate({_id: req.params.roomId}, req.body)
    .then(updatedRoom => {
        res.json(updatedRoom);
    })
    .catch(err => console.log(err));
})

// USER
router.get('/users', isLoggedIn, (req, res) =>{
    User.find()
    .then(allUsers => {
        res.json(allUsers)
    })
    .catch(err => console.log(err));
});

router.post('/users', isLoggedIn, (req, res) => {
    let newUser = req.body
    User.findOne({email: newUser.email})
    .then((foundUser) => {
        if(!foundUser){
            User.create(newUser)
            .then(() => {res.send({msg: "Created User"})})
        } else {
            res.json({msg: "E-mail already registered"})
        }
    })
    .catch((err) => {
        console.log(err);
        res.json({msg: "Error", data: err});
    })
});

// Find user by id
router.get('/users/:userId',isLoggedIn, (req, res) => {
    User.findById(req.params.userId)
    .then(foundUser => {
        res.json(foundUser)
    })
    .catch(err => console.log(err));
});

router.delete('/users/:userId',isLoggedIn, (req, res) => {
    User.findOneAndDelete({_id: req.params.userId}).then((deletedUser) => {
        console.log("Deleted:" ,deletedUser);
        res.json({msg: "Deleted User", data: deletedUser})
    })
    .catch(() => {
        console.log(err);
        res.json({msg: "Error", data: err})
    })
});

// BOOKS
router.get('/books', isLoggedIn, (req, res) =>{
    Book.find()
    .then(allBooks => {
        res.json(allBooks)
    })
    .catch(err => console.log(err));
});

router.post('/books', isLoggedIn, (req, res) => {
    let bookData = { parts: []}
    let newBookFolder;
    let form = new formidable.IncomingForm()
    let assetsFolder = path.join(__dirname, "../assets/")
    if(!fs.existsSync(assetsFolder)) fs.mkdirSync(assetsFolder);
    let booksFolder = path.join(assetsFolder, '/books');
    if(!fs.existsSync(booksFolder)) fs.mkdirSync(booksFolder);
    let tempFolder = path.join(assetsFolder, "/books/temp");
    if(!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder);
    form.uploadDir = path.join(tempFolder);
    form.multiples = true;
    form.on('field', function(field, value) {
        bookData[field] = value;
    })
    form.on('file', function(field, file) {
        let fileType = file.name.split('.').pop();
        if(fileType === "mp3" || fileType === "wav"){
            fs.renameSync(file.path, form.uploadDir + "/" + file.name);
            bookData.parts.push(file.name);
        } else {
            fs.unlinkSync(file.path)
            console.log("Not an audio file: ", file.name);
        }
    })
    form.on('end', function() {
        if(bookData.parts.length < 1){
            fs.rmdirSync(tempFolder);
            res.json({})
        } else {
            fs.renameSync(tempFolder, booksFolder + "/" + bookData.name);
                Book.create(bookData)
                .then(createdBook => {
                    res.send({msg: "Created book", data: createdBook});
                })
                .catch(err => {
                    console.log(err);
                    res.send({msg: "Error", err});
                })
        }
    });
    form.parse(req, (err, fields, files) => {
        newBookFolder = path.join(booksFolder, fields.name)
        if(!fs.existsSync(newBookFolder)) fs.mkdirSync(newBookFolder);
    });
})


// Find book by id
router.get('/books/:bookId', (req, res) => {
    Book.findById(req.params.userId)
    .then(foundBook => {
        res.json(foundBook)
    })
    .catch(err => console.log(err));
});

router.delete('/books/:bookId',isLoggedIn, (req, res) => {
    Book.findOneAndDelete({_id: req.params.bookId}).then((deletedBook) => {
        let deleteFolerPath = path.join(__dirname, '../assets/books/', deletedBook.name)
        if(fs.existsSync(deleteFolerPath)){
            let files = fs.readdirSync(deleteFolerPath)
            files.forEach(file => {
                fs.unlinkSync(path.join(deleteFolerPath, file))
            });
            fs.rmdirSync(deleteFolerPath);
        }
        res.json({msg: "Deleted Book", data: deletedBook})
    })
    .catch(err => {
        console.log(err);
        res.json({msg: "Error", data: err})
    })
});


router.get('/audio', (req, res) => {
    console.log("Get file request from:", req.user);
    Room.findById(req.user._id).populate('currentBook').populate('currentUser').exec().then((foundRoom) => {
        if(!foundRoom || !foundRoom.currentBook.name || !foundRoom.currentPart){
            console.log("Missing path data")
            res.send("missin data")
        } else {
            // SEND FILE TO ROOM
            const bookPath = path.join(__dirname, `../assets/books/${foundRoom.currentBook.name}/${foundRoom.currentPart}`);
            console.log(bookPath)
            const state = fs.statSync(bookPath);
            const fileSize = state.size;
            const range = req.headers.range;
            if(range){
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunkSize = (end-start)+1;
                const file = fs.createReadStream(bookPath, {start, end});
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
                fs.createReadStream(bookPath).pipe(res)
            }
        }
    })
    
});

module.exports = router;