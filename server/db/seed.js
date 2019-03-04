const mongoose = require('mongoose');
const User = require('../models/User');
const Room = require('../models/Room');
const Book = require('../models/Books');
const fs = require('fs');
const path = require('path');

const admin = {
    firstName: "Admin",
    lastName: "istrator",
    isAdmin: true,
    email: "admin@admin.com"
}
const firstUser = {
    firstName: "User",
    lastName: "Doe",
    email: "user@doe.com"
}
// Create Admin and First User
// ***************************
User.find().then(allUsers => {
    if(allUsers.length <= 0){
        User.create(admin).then((createAdmin) =>{
            console.log("Created Admin:", createAdmin);
            User.create(firstUser).then((createdUser) => {
                console.log("Created Admin:", createdUser);
            });
        })
    }
})
.then(() => {
    Room.find().then((allRooms) => {
        if(allRooms.length <= 0){
            Room.register(new Room({username: "admin"}), "admin").then((createdLobby) => {
            console.log("CreatedLobby:" , createdLobby)
            createdLobby.isAdmin = true;
            createdLobby.save();
            for(let i = 0; i <= 4; i++){
                let password = `Room${i}`
                Room.register(new Room({username: `Room ${i}`}), password)
                .then((createdRoom) => {
                    console.log(createdRoom)
                })
            }
        })
        }
    })
})
.then(() => {
    Book.find().then((allBooks) => {
        if(allBooks.length <= 0){
            const folderPath = path.join(__dirname, '../assets/books');
            const booksFolder = fs.readdirSync(folderPath);
            booksFolder.forEach((bookName) => {
                const bookPath = `${folderPath}/${bookName}`
                const bookFiles = fs.readdirSync(bookPath);
                console.log(bookFiles);
                Book.create({
                    name: bookName,
                    parts: bookFiles,
                })
                .then((createdBook) => console.log("Created Book:", createdBook))
            });
        }
    })
})
.catch((err) => console.error(err));


// Create Rooms
// ************



// Create Books
// ************

