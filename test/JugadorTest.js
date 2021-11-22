const assert = require('assert');
const Jugador = require('../modelo/Jugador')
const Pais = require('../modelo/Pais')

/**
 * 
 */
const testCrearJugador = () => {
    const jugador = new Jugador("fede", "blue")
    assert.deepEqual(jugador.nombre, "fede")
    assert.deepEqual(jugador.color, "blue")
}
testCrearJugador()

/**
 * 
 */
const testAtacar = () => {
    const jugadorO = new Jugador("fede", "blue")
    const jugadorD = new Jugador("diego", "yellow")

    const paisO = new Pais()
    paisO.jugador(jugadorO)

    const paisD = new Pais()
    paisD.jugador(jugadorD)
}
 