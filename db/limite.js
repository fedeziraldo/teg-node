const mongodb = require('./mongodb')
const {Schema, model} = mongodb;

const limiteSchema = new Schema({
    pais1: { type: Schema.Types.ObjectId, ref: 'usuarios' },
    pais2: { type: Schema.Types.ObjectId, ref: 'usuarios' },
})

const Limite = model('limites', limiteSchema)

module.exports = Limite