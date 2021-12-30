const { Server } = require("socket.io")
const jwt = require('jsonwebtoken')
const Mensaje = require("../db/mensaje")
const Usuario = require("../db/usuario")
const Jugador = require("./Jugador")

let io;
const SIN_SALA = 'sin sala'

const jugadores = {}
const salas = {}

const salirSala = (socket, jugador) => {
    if (salas[jugador.nombreSala]) {
        salas[jugador.nombreSala].participantes.splice(jugador, 1)
        console.log(`usuario ${jugador.usuario._id} salio de la sala ${jugador.nombreSala}`)
        socket.leave(jugador.nombreSala)
        socket.join(SIN_SALA)
        jugador.nombreSala = SIN_SALA
    }
}

const eliminarSala = (io, jugador) => {
    const sala = salas[jugador.nombreSala]
    if (sala) {
        delete salas[jugador.nombreSala]
        sala.participantes.forEach(j => {
            const socket = io.sockets.sockets[j.socketId]
            if (socket){
                socket.leave(socket.id)
                socket.join(SIN_SALA)
            }
            j.nombreSala = SIN_SALA
        })
        io.emit("salas", Object.keys(salas))
        console.log(`usuario ${jugador.usuario._id} elimino su sala`)
    }
}

const socketio = (server) => {
    io = new Server(server, { cors: { origin: '*' } })

    io.on('connection', socket => {
        console.log(`${socket.id} connected`)

        socket.on('disconnect', () => {
            const jugador = jugadores[socket.id]
            if (jugador) {
                console.log(`${jugador.usuario._id} disconnected`)
                delete jugadores[socket.id]
                io.emit("jugadores", Object.keys(jugadores).map(j => jugadores[j].usuario._id))

                // eliminar sala
                eliminarSala(io, jugador)
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
                    io.emit("usuarios", Object.keys(jugadores).map(j => jugadores[j].usuario._id))
                }
            } catch (e) {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('texto', texto => {
            const jugador = jugadores[socket.id]
            if (jugador) {
                console.log(texto)
                io.to(jugador.nombreSala).emit('texto', `${jugador.nombreSala} ${jugador.usuario._id}: ${texto}`)
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
                if (!salas[jugador.usuario._id]) {
                    salas[jugador.usuario._id] = {
                        creador: jugador,
                        participantes: [jugador]
                    }
                    jugador.nombreSala = jugador.usuario._id
                    socket.leave(SIN_SALA)
                    socket.join(jugador.usuario._id)
                    io.emit("salas", Object.keys(salas))
                    console.log(`usuario ${jugador.usuario._id} creo sala`)
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
                    io.emit("salas", Object.keys(salas))
                    console.log(`usuario ${jugador.usuario._id} se unio a sala ${sala}`)
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
                eliminarSala(io, jugador)
            } else {
                socket.emit('loginIncorrecto')
            }
        })
    });

}

module.exports = socketio