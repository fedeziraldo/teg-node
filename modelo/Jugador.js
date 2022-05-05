const sum = (v,acc) => v+acc

class Jugador {
    constructor(nombre, numero, nombreSala, socketId) {
        this.nombre = nombre
        this.numero = numero
        this.nombreSala = nombreSala
        this.socketId = socketId
        this.tarjetasPais = []
        this.tarjetasContinente = []
        this.cantCanjes = 0
        this.paisesCapturadosRonda = 0
        this.fichasRestantes = 0
        this.objetivo = null
    }

    puedeSacarTarjeta() {
        return this.paisesCapturadosRonda > 1 || this.canjes < 3 && this.paisesCapturadosRonda > 0
    }

    puedeCanjear(tarjetasPais, tarjetasContinente) {
        for (var tarjeta of tarjetasPais) {
            if (!this.tarjetasPais.includes(tarjeta)) throw new Error("Tarjetas son no del jugador")
        }
        for (var tarjeta of tarjetasContinente) {
            if (!this.tarjetasContinente.includes(tarjeta)) throw new Error("Tarjetas son no del jugador")
        }

        const valores = [...tarjetasPais.map(t => t.escudo.valor), ...tarjetasContinente.map(t => t.escudo.valor)]

        return valores.length == 3 && valores[0] == valores[1] && valores[0] == valores[2]
                || valores.length < 4 && valores.reduce(sum, 0) == 7
    }

    canjear(tarjetas) {
        this.fichasRestantes += this.getCantFichasCanje()
        this.cantCanjes++
    }

    getCantFichasCanje() {
        return this.canjes == 0 ? 6 : this.canjes*5
    }

    cumpleObjetivo(paises) {
        return paises.map(p => p.jugador == this).length >= 45
    }
}

module.exports = Jugador

