const assert = require('assert');
const Jugador = require('../modelo/Jugador')

/**
 * 
 */
const testCrearJugador = () => {
    const jugador = new Jugador("fede", "green")
    assert.deepEqual(jugador.nombre, "fede")
    assert.deepEqual(jugador.color, "green")
}
testCrearJugador()
 