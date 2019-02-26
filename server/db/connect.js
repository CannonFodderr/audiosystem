const mongoose = require('mongoose');

module.exports = mongoose.connect("mongodb://localhost/audiosystem", { useNewUrlParser: true })
.then(() => console.log(`Connected to db`))
.catch((err) => console.error(err));