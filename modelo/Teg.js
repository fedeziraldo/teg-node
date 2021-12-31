const Turno = require("./Turno")
const pais = require("../db/pais")
const cartas = require("../db/cartaGlobal")

class Teg {

    constructor(jugadores) {
        this.jugadores = jugadores
        this.turno = new Turno()
        this.paises = []//convertToModel(pais.find())
        this.cartas = []//convertToModel(cartas.find())
        this.cartaActual = this.cartas[0]
        this.conectados = 0
    }

    iniciar() {
        for (let i = 0; i < this.paises.length; i++) {
            this.paises[i].jugador = this.jugadores[i % this.jugadores.lenth]
        }
    }

    accionSimple(jugador, pais) {
        if (!this.turno.validarJugador(jugador, this.jugadores)) throw new Error("No es turno del jugador")
        if (!this.turno.fase8 && !this.turno.fase4 && !this.turno.faseRefuerzos) ;//ver detalle pais;
        if (pais.jugador != jugador) throw new Error("no es tu pais")
        if (jugador.fichasRestantes == 0) throw new Error("no hay fichas")
        pais.agregarFichas(1)
        jugador.fichasRestantes--
        
    }

    accionDoble(jugador, paisO, paisD) {
        if (this.turno.validarJugador(jugador, this.jugadores)) throw new Error("No es turno del jugador")
        if (paisO.jugador != jugador) throw new Error("no es tu pais")
        if (this.turno.faseJuego) {
            if (paisO.atacar(paisD)) jugador.cumpleObjetivo()
        }
        if (this.turno.faseReagrupe) {
            paisO.transferirFichas(1, paisD)
        }
    }

    accionCanje(jugador, tarjetas) {
        if (this.turno.validarJugador(jugador, this.jugadores)) throw new Error("No es turno del jugador")
        if (!jugador.puedeCanjear(tarjetas)) throw new Error("no se puede hacer el canje")
        if (!this.turno.faseRefuerzos) throw new Error("no se puede hacer el canje ahora")
        jugador.fichasRestantes += jugador.getCantFichasCanje()
    }

    accionTerminarTurno(jugador) {
        if (this.turno.validarJugador(jugador, this.jugadores)) throw new Error("No es turno del jugador")
        this.turno.terminarTurno(this.jugadores)
    }
}

module.exports = Teg