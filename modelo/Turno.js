class Turno {
    constructor() {
        this.turno = 0
        this.faseInicial = true
        this.fase8 = false
        this.fase4 = false
        this.faseJuego = false
        this.faseReagrupar = false
        this.faseRefuerzos = false
    }

    jugadorActual(jugadores) {
        return jugadores[this.turno % jugadores.length]
    }

    avanzarTurno(jugadores) {
        const ultimo = this.turno % jugadores.length == jugadores.length - 1

        if (this.faseJuego) {
            this.faseJuego = false
            this.faseReagrupar = true
            return
        }

        if (!ultimo && this.faseReagrupar) {
            this.faseReagrupar = false
            this.faseJuego = true
            turno++
            return
        }

        if (ultimo) {
            if (this.faseInicial) {
                this.faseInicial = false
                this.fase8 = true
                turno++
                return
            }
            if (this.fase8) {
                this.fase8 = false
                this.fase4 = true
                turno++
                return
            }
            if (this.fase4) {
                this.fase4 = false
                this.faseJuego = true
                turno++
                return
            }
            if (this.faseReagrupar) {
                this.faseReagrupar = false
                this.faseRefuerzos = true
                turno++
                return
            }
            if (this.faseRefuerzos) {
                this.faseRefuerzos = false
                this.faseJuego = true
                turno++
                jugadores.push(jugadores.unshift())
                return
            }
        }
        turno++

    }

    validarJugador(jugador, jugadores) {
        return jugador == this.jugadorActual(jugadores)
    }
}

module.exports = Turno