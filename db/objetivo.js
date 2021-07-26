const mongodb = require('./mongodb')
const Schema = mongodb.Schema;

const objetivos = [europaAmSur, amNorteOceania6Africa, asiaAmCentral,europaAmSur, 
    amNorteOceania6Africa, asiaAmCentral,europaAmSur, amNorteOceania6Africa, 
    asiaAmCentral,europaAmSur, amNorteOceania6Africa, asiaAmCentral,europaAmSur, 
    amNorteOceania6Africa, asiaAmCentral,europaAmSur, amNorteOceania6Africa, 
    asiaAmCentral,europaAmSur, amNorteOceania6Africa, asiaAmCentral]

const objetivoSchema = new Schema({
    id: {
        type: Number,
        required: true
    },
    nombre: {
        type: String,
        trim: true,
        required: true
    }
})

objetivoSchema.methods.cumpleObjetivo = function (jugadorA, jugadorD, paisesDto, continentesDto) {
    return objetivos[this.id - 1](jugadorA, jugadorD, paisesDto, continentesDto)
}

const Objetivo = mongodb.model('objetivos', objetivoSchema)
module.exports = Objetivo

function europaAmSur(jugadorA, jugadorD, paisesDto, continentesDto) {
    if (jugadorA.conquistaContinente(paisesDto, continentesDto[5]) &&
            jugadorA.conquistaContinente(paisesDto, continentesDto[3])) {
        return true
    }
    return false
}

function amNorteOceania6Africa(jugadorA, jugadorD, paisesDto, continentesDto) {
    if (jugadorA.conquistaContinente(paisesDto, continentesDto[2]) &&
            jugadorA.conquistaContinente(paisesDto, continentesDto[6]) &&
            jugadorA.paisesContinente(paisesDto, continentesDto[0]) >= 6) {
        return true
    }
    return false
}

function asiaAmCentral(jugadorA, jugadorD, paisesDto, continentesDto) {
    if (jugadorA.conquistaContinente(paisesDto, continentesDto[4]) &&
            jugadorA.conquistaContinente(paisesDto, continentesDto[1])) {
        return true
    }
    return false
}