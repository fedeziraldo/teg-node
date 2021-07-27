const mongodb = require('./mongodb')
const {Schema, model} = mongodb;

const MensajeSchema = new Schema({
    usuario: { type: Schema.Types.ObjectId, ref: 'usuarios' },
    mensaje: String
})

const Mensaje = model('mensajes', MensajeSchema)

module.exports = Mensaje