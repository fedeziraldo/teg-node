const mongodb = require('./mongodb')
const Schema = mongodb.Schema

const EscudoSchema = new Schema({
    tipo: {type: String, unique: true},
    valor: Array
})

const Escudo = mongodb.model('escudos', EscudoSchema)

module.exports = Escudo