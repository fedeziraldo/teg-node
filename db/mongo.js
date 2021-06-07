const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
    console.log('were connected!')
})

const kittySchema = new mongoose.Schema({
    nombreCompleto: String,
    email: String
});

const Kitten = mongoose.model('usuarios', kittySchema);

Kitten.find(function (err, kittens) {
    if (err) return console.error(err);
    console.log(kittens);
})

module.exports = mongoose