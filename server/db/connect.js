const mongoose = require('mongoose');

module.exports = mongoose.connect(process.env.DEV_DB_URL, { useNewUrlParser: true })
.then(() => console.log(`Connected to db`))
.catch((err) => console.error(err));