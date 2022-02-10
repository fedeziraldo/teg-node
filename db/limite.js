const mongodb = require('./mongodb')
const { Schema, model } = mongodb;

const limiteSchema = new Schema({
    pais1: { type: Schema.Types.ObjectId, ref: 'paises' },
    pais2: { type: Schema.Types.ObjectId, ref: 'paises' }
})

const Limite = model('limites', limiteSchema)

module.exports = Limite