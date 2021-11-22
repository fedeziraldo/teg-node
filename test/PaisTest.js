const assert = require('assert');
const Pais = require('../modelo/Pais')

/**
 * 
 */
const testCrearPaisCon1Ficha0Misiles = () => {
  const pais = new Pais()
  assert.deepEqual(pais.fichas, 1)
  assert.deepEqual(pais.misiles, 0)
}
testCrearPaisCon1Ficha0Misiles()

/**
 * 
 */
const testBasicoFichas = () => {
  const pais = new Pais()
  pais.agregarFichas(4)
  assert.deepEqual(pais.fichas, 5)

  pais.agregarFichas(-3)
  assert.deepEqual(pais.fichas, 2)

  assert.throws(() => pais.agregarFichas(-2), {
    name: 'Error',
    message: Pais.NO_HAY_SUFUCIENTES_FICHAS,
  }
  )
}
testBasicoFichas()

/**
 * 
 */
const testBasicoMisiles = () => {
  const pais = new Pais()
  pais.agregarMisil()
  assert.deepEqual(pais.misiles, 1)

  pais.usarMisil()
  assert.deepEqual(pais.misiles, 0)

  assert.throws(() => pais.usarMisil(), {
    name: 'Error',
    message: Pais.NO_HAY_MISILES,
  }
  )
}
testBasicoMisiles()

/**
 * 
 */
const testComprarMisilesFichas = () => {
  const pais = new Pais()
  pais.agregarFichas(11)
  pais.comprarMisil()

  assert.deepEqual(pais.fichas, 6)
  assert.deepEqual(pais.misiles, 1)

  assert.throws(() => pais.comprarMisil(), {
    name: 'Error',
    message: Pais.NO_HAY_SUFUCIENTES_FICHAS,
  }
  )

  pais.venderMisil()
  assert.deepEqual(pais.fichas, 12)
  assert.deepEqual(pais.misiles, 0)

  assert.throws(() => pais.venderMisil(), {
    name: 'Error',
    message: Pais.NO_HAY_MISILES,
  }
  )
}
testComprarMisilesFichas()

/**
 * 
 */
const testTransferirFichas = () => {
  const paisO = new Pais()
  paisO.agregarFichas(9)

  const paisD = new Pais()
  paisD.agregarFichas(9)

  assert.throws(() => paisO.transferirFichas(10, paisD), {
    name: 'Error',
    message: Pais.NO_HAY_SUFUCIENTES_FICHAS,
  }
  )

  paisO.transferirFichas(5, paisD)
  assert.deepEqual(paisO.fichas, 5)
  assert.deepEqual(paisD.fichas, 15)

  paisD.transferirFichas(4, paisO)
  assert.deepEqual(paisO.fichas, 9);
  assert.deepEqual(paisD.fichas, 11);
}
testTransferirFichas()

/**
 * 
 */
const testTransferirMisiles = () => {
  const paisO = new Pais()
  paisO.agregarMisil()

  const paisD = new Pais()

  paisO.transferirMisil(paisD)
  assert.deepEqual(paisO.misiles, 0)
  assert.deepEqual(paisD.misiles, 1)

  assert.throws(() => paisO.transferirMisil(paisD), {
    name: 'Error',
    message: Pais.NO_HAY_MISILES,
  }
  )
}
testTransferirMisiles()

/**
 * 
 */
const testLimita = () => {
  const paisO = new Pais()
  const paisD = new Pais()

  paisO.agregarLimite(paisD)

  assert(paisO.limita(paisD))
  assert(paisD.limita(paisO))
}
testLimita()

/**
 * 
 */
const testAtacar = () => {
  const paisO = new Pais()
  const paisD = new Pais()

  assert.throws(() => paisO.atacar(paisD), {
    name: 'Error',
    message: Pais.NO_HAY_SUFUCIENTES_FICHAS,
  }
  )

  paisO.agregarFichas(5)
  assert.throws(() => paisO.atacar(paisD), {
    name: 'Error',
    message: Pais.NO_LIMITAN,
  }
  )

  paisO.agregarLimite(paisD)

  
}
testAtacar()