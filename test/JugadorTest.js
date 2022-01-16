const assert = require('assert');
const Jugador = require('../modelo/Jugador')
const Pais = require('../modelo/Pais')

/**
 * 
 */
const testCrearJugador = () => {
    const jugador = new Jugador("fede", 0)
    assert.deepEqual(jugador.nombre, "fede")
    assert.deepEqual(jugador.numero, 0)
}
testCrearJugador()

/**
 * 
 */
const testAtacar = () => {
    const jugadorO = new Jugador("fede", 0)
    const jugadorD = new Jugador("diego", 1)

    const paisO = new Pais()
    paisO.jugador = jugadorO

    const paisD = new Pais()
    paisD.jugador = jugadorD
}
testAtacar()
 