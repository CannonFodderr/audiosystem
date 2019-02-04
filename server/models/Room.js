const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const roomSchema = new mongoose.Schema({
    password: {
        type: String,
    },
    username: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    currentUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    currentBook: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        default: null
    },
    currentPart: {
        type: String,
        default: null
    }
});

roomSchema.plugin(passportLocalMongoose);

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
