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

    atacar() {
        
    }
}

Pais.CAMBIO_MISIL_FICHAS = 6
Pais.NO_HAY_MISILES = 'No hay misiles'
Pais.NO_HAY_SUFUCIENTES_FICHAS = 'No hay suficientes fichas'

module.exports = Pais
