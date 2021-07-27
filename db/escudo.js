const mongodb = require('./mongodb')
const Schema = mongodb.Schema

const EscudoSchema = new Schema({
    numero: {type: Number, unique: true},
    tipo: {type: String, unique: true},
    valor: Array
})

const Escudo = mongodb.model('escudos', EscudoSchema)

module.exports = Escudo