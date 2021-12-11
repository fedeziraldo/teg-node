class Turno {
    constructor() {
        this.turno = 0
    }

    jugadorActual(jugadores) {
        return jugadores[turno % this.jugadores.length]
    }

    validarJugador(jugador, jugadores) {
        return jugador == this.jugadorActual(jugadores)
    }
}

module.exports = Turno