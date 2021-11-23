const tirarDado = require('./Dado')

const MAX_BATALLAS = 3

/**
 * ordena descendente
 * @param {*} a 
 * @param {*} b 
 * @returns 
 */
const ordenar = (a, b) => {
    return b - a
}

/**
 * 
 * @param {*} arrayO 
 * @param {*} arrayD 
 * @returns cantidad de victorias y de batallas
 */
const victorias = (arrayO, arrayD) => {
    let cantVictorias = 0

    arrayO.sort(ordenar)
    arrayD.sort(ordenar)

    const cantBatallas = Math.min(arrayD.length, arrayO.length, MAX_BATALLAS)

    for (var batalla = 0; batalla < cantBatallas; batalla++) {
        if (arrayO[batalla] > arrayD[batalla]) {
            cantVictorias++
        }
    }

    return {
        cantVictorias,
        cantBatallas,
    }
}

const atacar = (fichasO, fichasD) => {
    const arrayO = []
    const arrayD = []

    for(var i=0; i<Math.min(fichasO-1, MAX_BATALLAS); i++) {
        arrayO.push(tirarDado)
    }

    for(var i=0; i<Math.min(fichasD, MAX_BATALLAS); i++) {
        arrayD.push(tirarDado)
    }

    return victorias(arrayO, arrayD)
}

module.exports = {
    victorias,
    atacar
}