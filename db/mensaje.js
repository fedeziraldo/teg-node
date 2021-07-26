const mongodb = require('./mongodb')
const Schema = mongodb.Schema

const MensajeSchema = new Schema({
    usuario: { type: Schema.Types.ObjectId, ref: 'usuarios' },
    mensaje: String
})

const Mensaje = mongodb.model('mensajes', MensajeSchema)

module.exports = Mensaje