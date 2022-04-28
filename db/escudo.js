const mongodb = require('./mongodb')
const Schema = mongodb.Schema

const EscudoSchema = new Schema({
    numero: {type: Number, unique: true},
    tipo: {type: String, unique: true},
    valor: Array
})

const escudo = mongodb.model('escudos', EscudoSchema)

module.exports = escudo