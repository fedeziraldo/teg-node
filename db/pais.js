const mongodb = require('./mongodb')
const {Schema, model} = mongodb;

const paisSchema = new Schema({
    numero: {type: Number, unique: true},
    nombre: String,
    archivo: String,
    posX: Number,
    posY: Number,
    continente: { type: Schema.Types.ObjectId, ref: 'continentes' },
    escudo: { type: Schema.Types.ObjectId, ref: 'escudos' },
})

const Pais = model('paises', paisSchema)
module.exports = Pais