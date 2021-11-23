const assert = require('assert');
const tirarDado = require('../modelo/Dado')

/**
 * 
 */
const testTirarDado = () => {
    const tirada = tirarDado()
    assert(tirada >= 1 && tirada <= 6)
}
testTirarDado()