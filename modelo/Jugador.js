class Jugador {
    constructor(nombre, color) {
        this.nombre = nombre
        this.color = color
        this.tarjetasPais = []
        this.tarjetasContinente = []
        this.cantCanjes = 0
        this.paisesCapturadosRonda = 0
    }

    canjear(tarjetas) {

    }

    puedeSacarTarjeta() {
        return this.paisesCapturadosRonda > 1 || this.canjes < 3 && this.paisesCapturadosRonda > 0
    }

    puedeCanjear(tarjetas) {
        for (var tarjeta of tarjetas) {
            if (!this.tarjetas.includes(tarjeta)) throw new Error("Tarjetas son no del jugador")
        }

        const escudos = tarjetas.map(t => t.escudo)

        return escudos.map(e => e.valor).reduce((v,acc) => v+acc, 0)
    }

    getCantFichasCanje() {
        return this.canjes == 0 ? 6 : this.canjes*5
    }
}

module.exports = Jugador

