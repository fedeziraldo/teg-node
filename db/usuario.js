const bcrypt = require('bcrypt')
const mongodb = require('./mongodb')

const UsuarioSchema = new mongodb.Schema({
    nombre: String,
    email: {type: String, unique: true},
    password: String
})

UsuarioSchema.pre('save', function(next){
    this.password = bcrypt.hashSync(this.password, 10)
    next()
})

const Usuario = mongodb.model('usuarios', UsuarioSchema)

module.exports = Usuario