const { Server } = require("socket.io")
const jwt = require('jsonwebtoken')
const Mensaje = require("../db/mensaje")
const Usuario = require("../db/usuario")
const User = require("./User")
const Sala = require("./Sala")
const Teg = require("../modelo/Teg")
const Jugador = require("../modelo/Jugador")

let io;
const SIN_SALA = 'sin sala'

const jugadoresSala = {}
const salas = {}
const jugadoresMapa = {}
const juegos = {}

const salirSala = (socket, jugador, ioSala) => {
    if (salas[jugador.nombreSala]) {
        salas[jugador.nombreSala].participantes.splice(jugador, 1)
        console.log(`usuario ${jugador.usuario.email} salio de la sala ${jugador.nombreSala}`)
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
        console.log(`usuario ${jugador.usuario.email} elimino su sala`)
    }
}

const encontrarJugadorJuego = (socket, usuario) => {
    for (let juego in juegos) {
        const jugador = juegos[juego].jugadores.find(j => j.nombre === usuario.email)
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
            const jugador = jugadoresSala[socket.id]
            if (jugador) {
                console.log(`${jugador.usuario.email} disconnected`)
                delete jugadoresSala[socket.id]
                ioSala.emit("jugadores", Object.keys(jugadoresSala).map(j => jugadoresSala[j].usuario.email))

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
                    const user = new User(socket.id, usuario, SIN_SALA)
                    jugadoresSala[socket.id] = user
                    socket.join(SIN_SALA)
                    socket.emit('loginCorrecto', user)
                    socket.emit("salas", Object.keys(salas))
                    ioSala.emit("usuarios", Object.keys(jugadoresSala).map(j => jugadoresSala[j].usuario.email))
                }
            } catch (e) {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('texto', texto => {
            const jugador = jugadoresSala[socket.id]
            if (jugador) {
                console.log(texto)
                ioSala.to(jugador.nombreSala).emit('texto', `${jugador.nombreSala} ${jugador.usuario.email}: ${texto}`)
                new Mensaje({
                    mensaje: texto,
                    usuario: jugador.usuario,
                }).save()
            } else {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('crearSala', () => {
            const jugador = jugadoresSala[socket.id]
            if (jugador) {
                if (!salas[jugador.usuario.id]) {
                    salas[jugador.usuario.email] = new Sala(jugador, [jugador])
                    jugador.nombreSala = jugador.usuario.email
                    socket.leave(SIN_SALA)
                    socket.join(jugador.usuario.email)
                    ioSala.emit("salas", Object.keys(salas))
                    socket.emit("jugador", jugador)
                    console.log(`usuario ${jugador.usuario.email} creo sala`)
                }
            } else {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('unirseSala', sala => {
            const jugador = jugadoresSala[socket.id]
            if (jugador) {
                if (salas[sala]) {
                    salas[sala].participantes.push(jugador)
                    jugador.nombreSala = sala
                    socket.leave(SIN_SALA)
                    socket.join(sala)
                    ioSala.emit("salas", Object.keys(salas))
                    socket.emit("jugador", jugador)
                    console.log(`usuario ${jugador.usuario.email} se unio a sala ${sala}`)
                }
            } else {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('salirSala', () => {
            const jugador = jugadoresSala[socket.id]
            if (jugador) {
                salirSala(socket, jugador, ioSala)
            } else {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('eliminarSala', () => {
            const jugador = jugadoresSala[socket.id]
            if (jugador) {
                eliminarSala(ioSala, jugador)
            } else {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('iniciarJuego', () => {
            const jugador = jugadoresSala[socket.id]
            if (jugador) {
                const sala = salas[jugador.nombreSala]
                if (sala) {
                    let i = 0
                    for (let part of sala.participantes) {
                        part.socketId = null
                        part.numero = i
                        i++
                    }
                    const jugadores = sala.participantes.map(p => new Jugador(p.usuario.email, p.numero, p.nombreSala, socket.id))
                    juegos[jugador.nombreSala] = new Teg(jugadores)
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
            const jugador = jugadoresMapa[socket.id]
            if (jugador) {
                console.log(`${jugador.nombre} disconnected`)
                const juego = juegos[jugador.nombreSala]
                for (let j of juego.jugadores){
                    delete jugadoresMapa[j.socketId]
                }
                delete juegos[jugador.nombreSala]
                ioSala.to(jugador.nombreSala).emit('jugadaInvalida', "Salio")
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
                    const jugador = encontrarJugadorJuego(socket, usuario)
                    if (!jugador.socketId) throw new Error("no esta en ningun juego")
                    socket.emit('loginCorrecto', jugador)
                    const juego = juegos[jugador.nombreSala]
                    jugadoresMapa[socket.id] = jugador 
                    if (juego) {
                        juego.conectados++
                        if (juego.conectados == juego.jugadores.length){
                            await juego.iniciar()
                            ioMapa.to(jugador.nombreSala).emit("iniciarJuego", juego)
                        }
                    } else {
                        socket.emit('loginIncorrecto')
                    }
                }
            } catch (e) {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('accionSimple', (numeroPais, misil) => {
            const jugador = jugadoresMapa[socket.id]
            try {
                const juego = juegos[jugador.nombreSala]
                juego.accionSimple(jugador, numeroPais, misil)
                socket.emit('loginCorrecto', jugador)
                ioMapa.to(jugador.nombreSala).emit("juego", juego)
            } catch (e) {
                socket.emit('jugadaInvalida', e.message)
            }
        })

        socket.on('accionDoble', (numeroPaisO, numeroPaisD) => {
            const jugador = jugadoresMapa[socket.id]
            try {
                const juego = juegos[jugador.nombreSala]
                juego.accionDoble(jugador, numeroPaisO, numeroPaisD)
                ioMapa.to(jugador.nombreSala).emit("juego", juego)
            } catch (e) {
                socket.emit('jugadaInvalida', e.message)
            }
        })

        socket.on('accionTerminarTurno', () => {
            const jugador = jugadoresMapa[socket.id]
            try {
                const juego = juegos[jugador.nombreSala]
                juego.accionTerminarTurno(jugador)
                ioMapa.to(jugador.nombreSala).emit("juego", juego)
            } catch (e) {
                socket.emit('jugadaInvalida', e.message)
            }
        })

        socket.on('texto', texto => {
            const jugador = jugadoresSala[socket.id]
            if (jugador) {
                console.log(texto)
                ioMapa.to(jugador.nombreSala).emit('texto', `${jugador.nombreSala} ${jugador.usuario.email}: ${texto}`)
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