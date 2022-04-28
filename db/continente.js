const mongodb = require('./mongodb')
const {Schema, model} = mongodb;

const continenteSchema = new Schema({
    numero: {type: Number, unique: true},
    nombre: String,
    fichas: Number,
    escudo: { type: Schema.Types.ObjectId, ref: 'escudos' }
})

const continente = model('continentes', continenteSchema)
module.exports = continente