class Usuario {
    constructor(socket, usuario, nombreSala) {
        this.socket = socket
        this.usuario = usuario
        this.nombreSala = nombreSala
    }
}

module.exports = Usuario