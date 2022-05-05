class User {
    constructor(socketId, usuario, nombreSala) {
        this.socketId = socketId
        this.usuario = usuario
        this.nombreSala = nombreSala
        this.numero = 0
        this.juegos = null
    }
}

module.exports = User