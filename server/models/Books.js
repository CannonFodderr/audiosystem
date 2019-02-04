const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    author: {
        type: String
    },
    parts: {
        type: [String]
    },
    path: String
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;