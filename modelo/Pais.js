const {atacar} = require('./Ataque')

/**
 * 
 */
class Pais {
    constructor() {
        this.fichas = 1
        this.misiles = 0
        this.limites = []
    }

    agregarFichas(fichas) {
        if (this.fichas <= -fichas) throw new Error(Pais.NO_HAY_SUFUCIENTES_FICHAS)
        this.fichas += fichas
    }

    agregarMisil() {
        this.misiles++
    }

    usarMisil() {
        if (this.misiles == 0) throw new Error(Pais.NO_HAY_MISILES)
        this.misiles--
    }

    comprarMisil() {
        this.agregarFichas(-Pais.CAMBIO_MISIL_FICHAS)
        this.agregarMisil()
    }

    venderMisil() {
        this.usarMisil()
        this.agregarFichas(Pais.CAMBIO_MISIL_FICHAS)
    }

    transferirFichas(fichas, paisD) {
        this.agregarFichas(-fichas)
        paisD.agregarFichas(fichas)
    }

    transferirMisil(paisD) {
        this.usarMisil()
        paisD.agregarMisil()
    }

    agregarLimite(pais) {
        this.limites.push(pais)
        pais.limites.push(this)
    }

    limita(pais) {
        return this.limites.includes(pais)
    }

    atacar(pais) {
        if (this.fichas <= 1) throw new Error(Pais.NO_HAY_SUFUCIENTES_FICHAS)
        if (!this.limita(pais)) throw new Error(Pais.NO_LIMITA)
        if (this.jugador == pais.jugador) throw new Error(Pais.MISMO_JUGADOR)

        const {cantVictorias, cantBatallas} = atacar(this.fichas, pais.fichas)

        this.agregarFichas(cantVictorias-cantBatallas)
        return this.capturarPais(cantVictorias, pais)
    }

    capturarPais(cantVictorias, pais) {
        try {
            pais.agregarFichas(-cantVictorias)
            return false
        } catch (e) {
            // captura
            pais.fichas = 0
            pais.jugador = this.jugador
            this.transferirFichas(1, pais)
            return true
        }
    }

    distancia(pais) {
        if (this == pais) return 0
        else if (this.limita(pais)) return 1
        else for (let lim of this.limites) 
            if (lim.limita(pais)) return 2
        else for (let lim of this.limites) 
            for (let limlim of lim.limites) 
                if (limlim.limita(pais)) return 3
        throw new Error("muy lejos")
    }
    
    lanzarMisil(pais) {
        if (this.misiles <= pais.misiles) throw new Error(Pais.NO_HAY_MISILES)
        const danoMisil = Pais.DANO_MAXIMO_MISIL - this.distancia(pais) + 1

        pais.agregarFichas(-danoMisil)
        this.usarMisil()
    }
}

Pais.CAMBIO_MISIL_FICHAS = 6
Pais.NO_HAY_MISILES = 'No hay misiles'
Pais.NO_HAY_SUFUCIENTES_FICHAS = 'No hay suficientes fichas'
Pais.NO_LIMITA = 'No limita'
Pais.MISMO_JUGADOR = 'Mismo jugador'
Pais.DANO_MAXIMO_MISIL = 3

module.exports = Pais
