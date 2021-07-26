const mongodb = require('./mongodb')
const Schema = mongodb.Schema;

const continenteSchema = new Schema({
    id: Number,
    nombre: String,
    fichas: Number,
    escudo: { type: Schema.Types.ObjectId, ref: 'escudos' }
})

const Continente = mongodb.model('continentes', continenteSchema)
module.exports = Continente