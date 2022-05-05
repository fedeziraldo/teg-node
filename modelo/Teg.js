const Turno = require("./Turno")
require("../db/escudo")
const pais = require("../db/pais")
const continente = require("../db/continente")
const cartaGlobal = require("../db/cartaGlobal")
const limite = require("../db/limite")
const objetivo = require("../db/objetivo")
const Pais = require("../modelo/Pais")
const Continente = require("../modelo/Continente")

const desordenar = (array) => {
    for (let i=0; i< array.length; i++) {
        for (let j=0; j<array.length; j++) {
            if (Math.round(Math.random() == 0)) {
                const aux = array[i]
                array[i] = array[j]
                array[j] = aux
            }
        }
    }
}

class Teg {
    constructor(jugadores) {
        this.jugadores = jugadores
        this.turno = new Turno()
        this.paises = null
        this.mazo = null
        this.continentes = null
        this.cartasGlobales = null
        this.cartaActual = null
        this.limites = null
        this.objetivos = null
    }

    async iniciar() {
        const continentes = await continente.find().populate('escudo')
        const paises = await pais.find()
                .populate('escudo')
                .populate('continente')
                
        this.paises = paises.map(p => new Pais(p))
        this.cartasGlobales = await cartaGlobal.find()
        const limites = await limite.find()
        this.limites = limites.map(l => ({pais1: this.paises.find(p => p.pais == l.pais1), 
                                        pais2: this.paises.find(p => p.pais == l.pais2)}))

        this.objetivos = await objetivo.find()

        this.continentes = continentes.map(c => new Continente(c))

        this.mazo = [...this.paises]
        desordenar(this.mazo)
        desordenar(this.cartasGlobales)
        desordenar(this.objetivos)

        this.cartaActual = this.cartasGlobales[0]
        for (let i = 0; i < this.paises.length; i++) {
            this.paises[i].jugador = this.jugadores[i % this.jugadores.length]
        }
    }

    accionSimple(jugador, numeroPais, misil) {
        const pais = this.paises[numeroPais-1]
        if (!this.turno.validarJugador(jugador, this.jugadores)) throw new Error("No es turno del jugador")
        if (!this.turno.fase8 && !this.turno.fase4 && !this.turno.faseRefuerzos) throw new Error("no se puede hacer eso")
        if (pais.jugador != jugador) throw new Error("no es tu pais")
        if (misil) {
            pais.comprarMisil()
        } else {
            if (jugador.fichasRestantes == 0) throw new Error("no hay fichas")
            pais.agregarFichas(1)
            jugador.fichasRestantes--
        }
        
    }

    accionDoble(jugador, numeroPaisO, numeroPaisD) {
        const paisO = this.paises[numeroPaisO-1]
        const paisD = this.paises[numeroPaisD-1]
        if (!this.turno.validarJugador(jugador, this.jugadores)) throw new Error("No es turno del jugador")
        if (paisO.jugador != jugador) throw new Error("no es tu pais")
        if (this.turno.faseJuego) {
            if (paisO.atacar(this.limites, paisD)) jugador.cumpleObjetivo()
        }
        if (this.turno.faseReagrupe) {
            paisO.transferirFichas(1, paisD)
        }
    }

    accionCanje(jugador, tarjetas) {
        if (!this.turno.validarJugador(jugador, this.jugadores)) throw new Error("No es turno del jugador")
        if (!jugador.puedeCanjear(tarjetas)) throw new Error("no se puede hacer el canje")
        if (!this.turno.faseRefuerzos) throw new Error("no se puede hacer el canje ahora")
        jugador.fichasRestantes += jugador.getCantFichasCanje()
    }

    accionTerminarTurno(jugador) {
        if (!this.turno.validarJugador(jugador, this.jugadores)) throw new Error("No es turno del jugador")
        this.turno.avanzarTurno(this.jugadores)
        if (this.turno.fase8) {
            jugador.fichasRestantes = 8
        } else if (this.turno.fase4) {
            jugador.fichasRestantes = 4
        } else if (this.turno.faseRefuerzos) {
            jugador.fichasRestantes = Math.floor(this.paises.filter(p => p.jugador == jugador).length / 2)
        } else {
            jugador.fichasRestantes = 0
        }
    }
}

module.exports = Teg