const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
    console.log('were connected!')
})

const UsuarioSchema = new mongoose.Schema({
    nombreCompleto: String,
    email: String
});

const Usuario = mongoose.model('usuarios', UsuarioSchema);

module.exports = Usuario