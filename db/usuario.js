const bcrypt = require('bcrypt')
const mongodb = require('./mongodb')
const {Schema, model} = mongodb;

const UsuarioSchema = new Schema({
    nombre: String,
    email: {type: String, unique: true},
    password: String
})

UsuarioSchema.pre('save', function(next){
    this.password = bcrypt.hashSync(this.password, 10)
    next()
})

const usuario = model('usuarios', UsuarioSchema)

module.exports = usuario