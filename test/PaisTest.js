const assert = require('assert');
const Pais = require('../modelo/Pais')
const Jugador = require('../modelo/Jugador');

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
  })
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
  })
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
  })

  pais.venderMisil()
  assert.deepEqual(pais.fichas, 12)
  assert.deepEqual(pais.misiles, 0)

  assert.throws(() => pais.venderMisil(), {
    name: 'Error',
    message: Pais.NO_HAY_MISILES,
  })
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
  })

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
  })
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
  })

  paisO.agregarFichas(5)
  paisD.agregarFichas(5)
  assert.throws(() => paisO.atacar(paisD), {
    name: 'Error',
    message: Pais.NO_LIMITA,
  })

  paisO.agregarLimite(paisD)

  assert.throws(() => paisO.atacar(paisD), {
    name: 'Error',
    message: Pais.MISMO_JUGADOR,
  })

  paisO.jugador = new Jugador("fede", "blue")
  paisD.jugador = new Jugador("diego", "yellow")

  assert(!paisO.atacar(paisD))
  assert(paisO.fichas >= 3 && paisO.fichas <= 6)
  assert(paisD.fichas >= 3 && paisD.fichas <= 6)
  assert.deepEqual(paisO.fichas + paisD.fichas, 9)
}
testAtacar()

/**
 * 
 */
const testCapturarPais = () => {
  const paisO = new Pais()
  const paisD = new Pais()

  paisO.jugador = new Jugador("fede", "blue")
  paisD.jugador = new Jugador("diego", "yellow")

  paisO.agregarFichas(5)

  paisO.agregarLimite(paisD)

  if (paisO.atacar(paisD)) {
    assert(paisD.jugador == paisO.jugador)
    assert.deepEqual(paisD.fichas, 1)
  } else {
    assert(paisD.jugador != paisO.jugador)
  }
}
testCapturarPais()

/**
 * 
 */
const testDistancia = () => {
  const paisO = new Pais()
  const paisD = new Pais()

  paisO.agregarLimite(paisD)

  assert.deepEqual(paisO.distancia(paisD), 1)
  assert.deepEqual(paisD.distancia(paisO), 1)
}
testDistancia()

/**
 * 
 */
 const testBloqueado = () => {
  const paisO = new Pais()
  const paisD = new Pais()

  paisO.agregarLimite(paisD)

  assert(!paisO.estaBloqueado())
  assert(!paisD.estaBloqueado())
}
testBloqueado()