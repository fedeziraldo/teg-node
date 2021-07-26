const mongodb = require('./mongodb')
const Schema = mongodb.Schema;

const cartaGlobalSchema = new Schema({
    tipo: String,
    cantidad: Number,
    defensa: Number,
    ataque: Number,
    fronteraAbierta: Boolean,
    fronteraCerrada: Boolean,
    crisis: Boolean,
    refuerzosExtra: Boolean,
    color: String
})

const CartaGlobal = mongodb.model('cartaglobales', cartaGlobalSchema)

module.exports = CartaGlobal