const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        unique: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    currentRoom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        default: null
    },
    currentBook: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        default: null
    },
    lastChapter: {
        type: String,
    },
    bookList: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'BookList'
    },
    sessions: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Sessions'
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;