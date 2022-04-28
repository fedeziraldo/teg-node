const mongodb = require('./mongodb')
const {Schema, model} = mongodb;

const paisSchema = new Schema({
    numero: {type: Number, unique: true},
    nombre: String,
    archivo: String,
    posX: Number,
    posY: Number,
    width: Number,
    height: Number,
    continente: { type: Schema.Types.ObjectId, ref: 'continentes' },
    escudo: { type: Schema.Types.ObjectId, ref: 'escudos' },
})

const pais = model('paises', paisSchema)
module.exports = pais