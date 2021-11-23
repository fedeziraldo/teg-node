const CARAS = 6

/**
 * 
 * @returns numero entre 1 y CARAS
 */
const tirarDado = () => {
    return Math.ceil(Math.random()*CARAS)
}

module.exports = tirarDado