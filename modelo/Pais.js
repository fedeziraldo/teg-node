const {atacar} = require('./Ataque')

/**
 * 
 */
class Pais {
    constructor(pais) {
        this.pais = pais
        this.fichas = 1
        this.misiles = 0
        this.fichasMoviles = this.fichas
        this.misilesMoviles = this.misiles
        this.jugador = null
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
        if (this.jugador != paisD.jugador) throw new Error(Pais.NO_MISMO_JUGADOR)
        this.agregarFichas(-fichas)
        paisD.agregarFichas(fichas)
    }

    transferirMisil(paisD) {
        if (this.jugador != paisD.jugador) throw new Error(Pais.NO_MISMO_JUGADOR)
        this.usarMisil()
        paisD.agregarMisil()
    }

    limites(limites) {
        return limites.filter(l => l.pais1 === this).map(l => l.pais2)
    }

    limita(limites, pais) {
        return this.limites(limites).includes(pais)
    }

    atacar(limites, pais) {
        if (this.fichas <= 1) throw new Error(Pais.NO_HAY_SUFUCIENTES_FICHAS)
        if (!this.limita(limites, pais)) throw new Error(Pais.NO_LIMITA)
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

    distancia(limites, pais) {
        if (this == pais) return 0
        if (this.limita(limites, pais)) return 1
        for (let lim of this.limites(limites)) 
            if (lim.limita(limites, pais)) return 2
        for (let lim of this.limites(limites)) 
            for (let limlim of lim.limites(limites)) 
                if (limlim.limita(limites, pais)) return 3
        throw new Error("muy lejos")
    }
    
    lanzarMisil(limites, pais) {
        if (this.misiles <= pais.misiles) throw new Error(Pais.NO_HAY_MISILES)
        const danoMisil = Pais.DANO_MAXIMO_MISIL - this.distancia(limites, pais) + 1

        pais.agregarFichas(-danoMisil)
        this.usarMisil()
    }

    estaBloqueado(limites) {
        const thisLimites = this.limites(limites)
        const jugadorBloqueante = thisLimites[0].jugador
        if (thisLimites.length < 3 || this.jugador == jugadorBloqueante) {
            return false
        }
        for (let limite of thisLimites) {
            if (limite.fichas < 2 || limite.jugador != jugadorBloqueante) {
                return false
            }
        }
        return true
    }

}

Pais.CAMBIO_MISIL_FICHAS = 6
Pais.NO_HAY_MISILES = 'No hay misiles'
Pais.NO_HAY_SUFUCIENTES_FICHAS = 'No hay suficientes fichas'
Pais.NO_LIMITA = 'No limita'
Pais.MISMO_JUGADOR = 'Mismo jugador'
Pais.NO_MISMO_JUGADOR = 'No son del mismo jugador'
Pais.DANO_MAXIMO_MISIL = 3

module.exports = Pais
