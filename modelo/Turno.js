class Turno {
    constructor() {
        this.turno = 0
    }

    jugadorActual(jugadores) {
        return jugadores[turno % this.jugadores.length]
    }
}

module.exports = Turno