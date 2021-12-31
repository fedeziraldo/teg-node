const { Server } = require("socket.io")
const jwt = require('jsonwebtoken')
const Mensaje = require("../db/mensaje")
const Usuario = require("../db/usuario")
const Jugador = require("./Jugador")
const Sala = require("./Sala")
const Teg = require("../modelo/Teg")

let io;
const SIN_SALA = 'sin sala'

const jugadores = {}
const salas = {}
const juegos = {}

const salirSala = (socket, jugador, ioSala) => {
    if (salas[jugador.nombreSala]) {
        salas[jugador.nombreSala].participantes.splice(jugador, 1)
        console.log(`usuario ${jugador.usuario.id} salio de la sala ${jugador.nombreSala}`)
        socket.leave(jugador.nombreSala)
        socket.join(SIN_SALA)
        jugador.nombreSala = SIN_SALA
        socket.emit("jugador", jugador)
        ioSala.emit("salas", Object.keys(salas))
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
                j.nombreSala = SIN_SALA
                socket.emit("jugador", j)
            }
        })
        ioSala.emit("salas", Object.keys(salas))
        console.log(`usuario ${jugador.usuario.id} elimino su sala`)
    }
}

const encontrarJugadorJuego = (socket, usuario) => {
    for (let juego in juegos) {
        const jugador = juegos[juego].jugadores.find(j => j.usuario.id === usuario.id)
        if (jugador) {
            jugador.socketId = socket.id
            socket.join(jugador.nombreSala)
            return jugador
        }
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
                    const jugador = new Jugador(socket.id, usuario, SIN_SALA)
                    jugadores[socket.id] = jugador
                    socket.join(SIN_SALA)
                    socket.emit('loginCorrecto', jugador)
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
                    salas[jugador.usuario.id] = new Sala(jugador, [jugador])
                    jugador.nombreSala = jugador.usuario.id
                    socket.leave(SIN_SALA)
                    socket.join(jugador.usuario.id)
                    ioSala.emit("salas", Object.keys(salas))
                    socket.emit("jugador", jugador)
                    console.log(`usuario ${jugador.usuario.id} creo sala`)
                }
            } else {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('unirseSala', sala => {
            const jugador = jugadores[socket.id]
            if (jugador) {
                if (salas[sala]) {
                    salas[sala].participantes.push(jugador)
                    jugador.nombreSala = sala
                    socket.leave(SIN_SALA)
                    socket.join(sala)
                    ioSala.emit("salas", Object.keys(salas))
                    socket.emit("jugador", jugador)
                    console.log(`usuario ${jugador.usuario.id} se unio a sala ${sala}`)
                }
            } else {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('salirSala', () => {
            const jugador = jugadores[socket.id]
            if (jugador) {
                salirSala(socket, jugador, ioSala)
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
                const sala = salas[jugador.nombreSala]
                if (sala) {
                    for (let part of sala.participantes) {
                        part.socketId = null
                    }
                    juegos[jugador.nombreSala] = new Teg(sala.participantes)
                    ioSala.to(jugador.nombreSala).emit('iniciarJuego')
                }
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
                    const jugador = encontrarJugadorJuego(socket, usuario)
                    if (!jugador.socketId) throw new Error("no esta en ningun juego")
                    socket.emit('loginCorrecto', jugador)
                    const juego = juegos[jugador.nombreSala]
                    if (juego) {
                        juego.conectados++
                        if (juego.conectados == juego.jugadores.length){
                            ioMapa.to(jugador.nombreSala).emit("iniciarJuego")
                            juego.iniciar()
                        }
                    }
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