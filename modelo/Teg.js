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
            if (Math.floor(Math.random()*2) == 0 ) {
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
    }

    async iniciar() {
        const [continentes, paises, limites, cartasGlobales, objetivos] = await Promise.all([
            continente.find().populate('escudo'),
            pais.find().populate('escudo').populate('continente'),
            limite.find().populate('pais1').populate('pais2'),
            cartaGlobal.find(),
            objetivo.find(),
        ])
                
        this.paises = paises.map(p => new Pais(p))
        this.cartasGlobales = cartasGlobales
        this.cartaActual = cartasGlobales.pop()
        this.limites = limites.map(l => ({pais1: this.paises[l.pais1.numero -1], 
                                        pais2: this.paises[l.pais2.numero - 1]}))

        this.continentes = continentes.map(c => new Continente(c))

        this.mazo = [...this.paises]
        desordenar(this.mazo)
        desordenar(this.cartasGlobales)
        desordenar(objetivos)

        this.cartaActual = this.cartasGlobales[0]
        for (let i = 0; i < this.mazo.length; i++) {
            this.mazo[i].jugador = this.jugadores[i % this.jugadores.length]
        }

        for (let jugador of this.jugadores) {
            jugador.objetivo = objetivos.pop()
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
            if (this.turno.faseRefuerzos && pais.estaBloqueado(this.limites)) throw new Error("Esta bloqueado")
            pais.agregarFichas(1)
            jugador.fichasRestantes--
        }
        
    }

    accionDoble(jugador, numeroPaisO, numeroPaisD, misil) {
        const paisO = this.paises[numeroPaisO-1]
        const paisD = this.paises[numeroPaisD-1]
        if (!this.turno.validarJugador(jugador, this.jugadores)) throw new Error("No es turno del jugador")
        if (paisO.jugador != jugador) throw new Error("no es tu pais")
        if (this.turno.faseJuego) {
            if (misil){
                paisO.lanzarMisil(this.limites, paisD)
            } else {
                if (paisO.atacar(this.limites, paisD)) {
                    jugador.cumpleObjetivo()
                    jugador.paisesCapturadosRonda++
                } 
            }
        }
        if (this.turno.faseReagrupe) {
            if (misil){
                paisO.transferirMisil(paisD)
            } else {
                paisO.transferirFichas(1, paisD)
            }
        }
    }

    accionCanje(jugador, tarjetas) {
        if (!this.turno.validarJugador(jugador, this.jugadores)) throw new Error("No es turno del jugador")
        if (!jugador.puedeCanjear(tarjetas)) throw new Error("no se puede hacer el canje")
        if (!this.turno.faseRefuerzos) throw new Error("no se puede hacer el canje ahora")
        jugador.canjear(tarjetas)
    }

    accionTerminarTurno(jugador) {
        if (!this.turno.validarJugador(jugador, this.jugadores)) throw new Error("No es turno del jugador")
        if (jugador.fichasRestantes != 0) throw new Error("No pusiste todas las fichas")
        this.turno.avanzarTurno(this.jugadores)
        if (this.turno.fase8) {
            jugador.fichasRestantes = 8
        } else if (this.turno.fase4) {
            jugador.fichasRestantes = 4
        } else if (this.turno.faseRefuerzos) {
            jugador.fichasRestantes = Math.floor(cartasdelJugador(jugador).length / 2)
            jugador.puedeSacarTarjeta() && jugador.tarjetasPais.push(this.mazo.pop())
            jugador.paisesCapturadosRonda = 0
        } else {
            jugador.fichasRestantes = 0
        }
    }

    cartasDelJugador(jugador) {
        return this.paises.filter(p => p.jugador == jugador).length
    }
}

module.exports = Teg