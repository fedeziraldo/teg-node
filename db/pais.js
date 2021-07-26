const mongodb = require('./mongodb')
const Schema = mongodb.Schema;

const paisSchema = new Schema({
    numero: {type: Number, unique: true},
    nombre: String,
    archivo: String,
    posX: Number,
    posY: Number,
    continente: { type: Schema.Types.ObjectId, ref: 'continentes' },
    escudo: { type: Schema.Types.ObjectId, ref: 'escudos' },
})

paisSchema.methods.limita = function (pais) {
    return this.limites.indexOf(pais) != -1
}

paisSchema.methods.distancia = function (pais) {
    if (this == pais) return 0
    if (this.limita(pais)) return 1
    for (let lim of this.limites) {
        if (lim.limita(pais)) return 2
    }
    for (let lim of this.limites) {
        for (let limlim of lim.limites) {
            if (limlim.limita(pais)) return 3
        }
    }
    throw ("muy lejos")
}

const Pais = mongodb.model('paises', paisSchema)
module.exports = Pais