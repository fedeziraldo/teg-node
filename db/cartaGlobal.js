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

const cartaGlobal = model('cartaglobales', cartaGlobalSchema)

module.exports = cartaGlobal