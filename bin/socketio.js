const { Server } = require("socket.io")
const jwt = require('jsonwebtoken')
const Mensaje = require("../db/mensaje")
const Usuario = require("../db/usuario")
const Jugador = require("./Jugador")

let io;
const SIN_SALA = 'sin sala'

const jugadores = {}
const salas = {}
const juegos = {}

const salirSala = (socket, jugador) => {
    if (salas[jugador.nombreSala]) {
        salas[jugador.nombreSala].participantes.splice(jugador, 1)
        console.log(`usuario ${jugador.usuario.id} salio de la sala ${jugador.nombreSala}`)
        socket.leave(jugador.nombreSala)
        socket.join(SIN_SALA)
        jugador.nombreSala = SIN_SALA
    }
}

const eliminarSala = (ioSala, jugador) => {
    const sala = salas[jugador.nombreSala]
    if (sala) {
        delete salas[jugador.nombreSala]
        sala.participantes.forEach(j => {
            const socket = ioSala.sockets.get(j.socketId)
            if (socket){
                socket.leave(socket.id)
                socket.join(SIN_SALA)
            }
            j.nombreSala = SIN_SALA
        })
        ioSala.emit("salas", Object.keys(salas))
        console.log(`usuario ${jugador.usuario.id} elimino su sala`)
    }
}

const socketio = (server) => {
    io = new Server(server, { cors: { origin: '*' } })

    const ioSala = io.of('/sala')

    ioSala.on('connection', socket => {
        console.log(`${socket.id} connected`)

        socket.on('disconnect', () => {
            const jugador = jugadores[socket.id]
            if (jugador) {
                console.log(`${jugador.usuario.id} disconnected`)
                delete jugadores[socket.id]
                ioSala.emit("jugadores", Object.keys(jugadores).map(j => jugadores[j].usuario.id))

                // eliminar sala
                eliminarSala(ioSala, jugador)
                salirSala(socket, jugador)
            } else {
                console.log(`${socket.id} disconnected`)
            }
        })

        socket.on('validacion', async token => {
            console.log(token)
            try {
                const decoded = jwt.verify(token, process.env.SECRET_KEY)
                const usuario = await Usuario.findById(decoded.id).exec()
                console.log(usuario)
                if (!usuario) {
                    socket.emit('loginIncorrecto')
                } else {
                    jugadores[socket.id] = new Jugador(socket.id, usuario, SIN_SALA)
                    socket.join(SIN_SALA)
                    socket.emit('loginCorrecto', usuario)
                    socket.emit("salas", Object.keys(salas))
                    ioSala.emit("usuarios", Object.keys(jugadores).map(j => jugadores[j].usuario.id))
                }
            } catch (e) {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('texto', texto => {
            const jugador = jugadores[socket.id]
            if (jugador) {
                console.log(texto)
                ioSala.to(jugador.nombreSala).emit('texto', `${jugador.nombreSala} ${jugador.usuario.id}: ${texto}`)
                new Mensaje({
                    mensaje: texto,
                    usuario: jugador.usuario,
                }).save()
            } else {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('crearSala', () => {
            const jugador = jugadores[socket.id]
            if (jugador) {
                if (!salas[jugador.usuario.id]) {
                    salas[jugador.usuario.id] = {
                        creador: jugador,
                        participantes: [jugador]
                    }
                    jugador.nombreSala = jugador.usuario.id
                    socket.leave(SIN_SALA)
                    socket.join(jugador.usuario.id)
                    ioSala.emit("salas", Object.keys(salas))
                    console.log(`usuario ${jugador.usuario.id} creo sala`)
                }
            } else {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('unirseSala', sala => {
            const jugador = jugadores[socket.id]
            if (jugador) {
                if (!salas[sala]) {
                    salas[sala].participantes.push(jugador)
                    jugador.nombreSala = sala
                    socket.leave(SIN_SALA)
                    socket.join(sala)
                    ioSala.emit("salas", Object.keys(salas))
                    console.log(`usuario ${jugador.usuario.id} se unio a sala ${sala}`)
                }
            } else {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('salirSala', () => {
            const jugador = jugadores[socket.id]
            if (jugador) {
                salirSala(socket, jugador)
            } else {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('eliminarSala', () => {
            const jugador = jugadores[socket.id]
            if (jugador) {
                eliminarSala(ioSala, jugador)
            } else {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('iniciarJuego', () => {
            const jugador = jugadores[socket.id]
            if (jugador) {
                ioSala.to(jugador.nombreSala).emit('iniciarJuego')
            } else {
                socket.emit('loginIncorrecto')
            }
        })
    });

    const ioMapa = io.of('/mapa')

    ioMapa.on('connection', socket => {
        console.log(`${socket.id} connected`)

        socket.on('disconnect', () => {
            console.log(`${socket.id} disconnected`)   
        })

        socket.on('validacion', async token => {
            console.log(token)
            try {
                const decoded = jwt.verify(token, process.env.SECRET_KEY)
                const usuario = await Usuario.findById(decoded.id).exec()
                console.log(usuario)
                if (!usuario) {
                    socket.emit('loginIncorrecto')
                } else {
                    if (Object.keys(salas).includes(usuario.id)){
                        
                    }
                    jugadores[socket.id] = new Jugador(socket.id, usuario, SIN_SALA)
                    socket.join(SIN_SALA)
                    socket.emit('loginCorrecto', usuario)
                }
            } catch (e) {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('texto', texto => {
            const jugador = jugadores[socket.id]
            if (jugador) {
                console.log(texto)
                ioMapa.to(jugador.nombreSala).emit('texto', `${jugador.nombreSala} ${jugador.usuario.id}: ${texto}`)
                new Mensaje({
                    mensaje: texto,
                    usuario: jugador.usuario,
                }).save()
            } else {
                socket.emit('loginIncorrecto')
            }
        })
    });

}

module.exports = socketio