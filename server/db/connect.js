const mongoose = require('mongoose');

module.exports = mongoose.connect("mongodb://localhost/audiosystem", { useNewUrlParser: true })
.then(() => {
    console.log(`Connected to db`);
    return true;
})
.catch((err) => {
    console.log(err);
    return false;
});
mongoose.set('useCreateIndex', true);