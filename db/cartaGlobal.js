const mongodb = require('./mongodb')
const {Schema, model} = mongodb;

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

const CartaGlobal = model('cartaglobales', cartaGlobalSchema)

module.exports = CartaGlobal