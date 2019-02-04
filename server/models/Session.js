const mongoose = require('mongoose');


const SessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: mongoose.Schema.Types.Date,
        default: Date.now()
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    part: {
        type: String,
        required: true
    }
});



const Session = mongoose.model('Session', SessionSchema);
module.exports = Session;