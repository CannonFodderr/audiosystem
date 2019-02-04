const mongoose = require('mongoose');
const User = require('../models/User');
const Room = require('../models/Room');
const Book = require('../models/Books');
const fs = require('fs');
const path = require('path');
// const bcryptFuncs = require('../utils/bcryptFuncs');

// Create Admin and First User
// ***************************

// User.create(Admin).then((createAdmin) =>{
//     console.log("Created Admin:", createAdmin);
//     User.create(firstUser).then((createdUser) => {
//         console.log("Created Admin:", createdUser);
//     });
// })
// .catch((err) => console.error(err));

// Create Rooms
// ************
// Room.register(new Room({username: "lobby"}), "koren1234").then((createdLobby) => {
//     console.log("CreatedLobby:" , createdLobby)
//     createdLobby.isAdmin = true;
//     createdLobby.save();
//     for(let i = 0; i <= 4; i++){
//         let password = `Room${i}`
//         Room.register(new Room({username: `Room ${i}`}), password)
//         .then((createdRoom) => {
//             console.log(createdRoom)
//         })
//     }
// }).catch((err) => console.error(err));


// Create Books
// ************

// const folderPath = path.join(__dirname, '../assets/books');
// const booksFolder = fs.readdirSync(folderPath);
// booksFolder.forEach((bookName) => {
//     const bookPath = `${folderPath}/${bookName}`
//     const bookFiles = fs.readdirSync(bookPath);
//     console.log(bookFiles);
//     Book.create({
//         name: bookName,
//         parts: bookFiles,
//     })
//     .then((createdBook) => console.log("Created Book:", createdBook))
//     .catch((err) => console.error(err));
// });