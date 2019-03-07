const mongoose = require('mongoose');
const env = require('dotenv').config();

module.exports = mongoose.connect(process.env.DEV_DB_URL, { useNewUrlParser: true })
.then(() => {
    console.log(`Connected to db`);
    return true;
})
.catch((err) => {
    console.log(err);
    return false;
});
mongoose.set('useCreateIndex', true);