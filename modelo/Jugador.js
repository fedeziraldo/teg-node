const sum = (v,acc) => v+acc

class Jugador {
    constructor(nombre, color) {
        this.nombre = nombre
        this.color = color
        this.tarjetasPais = []
        this.tarjetasContinente = []
        this.cantCanjes = 0
        this.paisesCapturadosRonda = 0
        this.fichasRestantes = 8
    }

    puedeSacarTarjeta() {
        return this.paisesCapturadosRonda > 1 || this.canjes < 3 && this.paisesCapturadosRonda > 0
    }

    puedeCanjear(tarjetas) {
        for (var tarjeta of tarjetas) {
            if (!this.tarjetas.includes(tarjeta)) throw new Error("Tarjetas son no del jugador")
        }

        const valores = tarjetas.map(t => t.escudo.valor)

        return valores.length < 4 && valores.reduce(sum, 0) == 7
    }

    getCantFichasCanje() {
        return this.canjes == 0 ? 6 : this.canjes*5
    }

    cumpleObjetivo(paises) {
        return paises.map(p => p.jugador == this).length >= 45
    }
}

module.exports = Jugador

