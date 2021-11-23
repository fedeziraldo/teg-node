const assert = require('assert');
const {victorias, atacar} = require('../modelo/Ataque')

/**
 * 
 */
const testVictorias = () => {
    assert.deepEqual(victorias([1], [1]), { cantVictorias: 0, cantBatallas: 1 })
    assert.deepEqual(victorias([2], [1]), { cantVictorias: 1, cantBatallas: 1 })
    assert.deepEqual(victorias([1, 2], [1]), { cantVictorias: 1, cantBatallas: 1 })
    assert.deepEqual(victorias([1, 2], [1, 2]), { cantVictorias: 0, cantBatallas: 2 })
    assert.deepEqual(victorias([1, 3, 1], [1, 2]), { cantVictorias: 1, cantBatallas: 2 })
    assert.deepEqual(victorias([2], [1, 2]), { cantVictorias: 0, cantBatallas: 1 })
}
testVictorias()

/**
 * 
 */
const testAtaques = () => {
    const {cantVictorias, cantBatallas} = atacar(8, 8)

    assert(cantVictorias >= 0 && cantVictorias <= 3)
    assert.deepEqual(cantBatallas, 3)
}
testAtaques()