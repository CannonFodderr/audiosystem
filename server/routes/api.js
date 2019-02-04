const router = require('express').Router();
const Room = require('../models/Room');
const {isLoggedIn, isAdmin} = require('../middleware/auth');


// AUTHENTICATION
router.post('/api/login', (req, res) => {
    res.send("Post login");
})

router.get('/api/post', (req, res) => {
    res.send("logout");
})

// ROOMS
// Get all rooms
router.get('/api/rooms', isAdmin, (req, res) => {
    Room.find()
    .then((allRooms) => {
        console.log(allRooms);
        res.json(allRooms);
    })
});

// Get Room Data
router.get('/api/rooms/:roomId', isLoggedIn, (req, res) => {
    Room.findById(req.params.roomId)
    .then(foundRoom => {
        res.json(foundRoom);
    })
    .catch(err => {
        console.log(err)
    })
});

module.exports = router;