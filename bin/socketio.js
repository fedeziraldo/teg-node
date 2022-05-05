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

const usersSala = {}
const salas = {}
const jugadoresMapa = {}
const juegos = {}

const salirSala = (socket, user, ioSala) => {
    if (salas[user.nombreSala]) {
        salas[user.nombreSala].participantes.splice(user, 1)
        console.log(`usuario ${user.usuario.email} salio de la sala ${user.nombreSala}`)
        socket.leave(user.nombreSala)
        socket.join(SIN_SALA)
        user.nombreSala = SIN_SALA
        socket.emit("user", user)
        ioSala.emit("salas", salas)
    }
}

const eliminarSala = (ioSala, user) => {
    const sala = salas[user.nombreSala]
    if (sala) {
        delete salas[user.nombreSala]
        sala.participantes.forEach(u => {
            const socket = ioSala.sockets.get(u.socketId)
            if (socket){
                socket.leave(socket.id)
                socket.join(SIN_SALA)
                u.nombreSala = SIN_SALA
                socket.emit("user", u)
            }
        })
        ioSala.emit("salas", salas)
        console.log(`usuario ${user.usuario.email} elimino su sala`)
    }
}

const socketio = server => {
    io = new Server(server, { cors: { origin: '*' } })

    const ioSala = io.of('/sala')

    ioSala.on('connection', socket => {
        console.log(`${socket.id} connected`)

        socket.on('disconnect', () => {
            const user = usersSala[socket.id]
            if (user) {
                console.log(`${user.usuario.email} disconnected`)
                delete usersSala[socket.id]
                ioSala.emit("usuarios", Object.keys(usersSala).map(j => usersSala[j].usuario.email))

                // eliminar sala
                eliminarSala(ioSala, user)
                salirSala(socket, user)
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
                    usersSala[socket.id] = user
                    user.juegos = Object.keys(juegos).filter(j => juegos[j].jugadores.map(ju => ju.nombre).includes(user.usuario.email))
                    socket.join(SIN_SALA)
                    socket.emit('loginCorrecto', user)
                    socket.emit("salas", salas)
                    ioSala.emit("usuarios", Object.keys(usersSala).map(j => usersSala[j].usuario.email))
                }
            } catch (e) {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('texto', texto => {
            const user = usersSala[socket.id]
            if (user) {
                console.log(texto)
                ioSala.to(user.nombreSala).emit('texto', `${user.nombreSala} ${user.usuario.email}: ${texto}`)
                new Mensaje({
                    mensaje: texto,
                    usuario: user.usuario,
                }).save()
            } else {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('crearSala', () => {
            const user = usersSala[socket.id]
            if (user) {
                if (!salas[user.usuario.email] && !juegos[user.usuario.email]) {
                    salas[user.usuario.email] = new Sala(user, [user])
                    user.nombreSala = user.usuario.email
                    socket.leave(SIN_SALA)
                    socket.join(user.usuario.email)
                    ioSala.emit("salas", salas)
                    socket.emit("user", user)
                    console.log(`usuario ${user.usuario.email} creo sala`)
                }
            } else {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('unirseSala', nombreSala => {
            const user = usersSala[socket.id]
            if (user) {
                if (salas[nombreSala] && user.nombreSala == SIN_SALA) {
                    salas[nombreSala].participantes.push(user)
                    user.nombreSala = nombreSala
                    socket.leave(SIN_SALA)
                    socket.join(nombreSala)
                    ioSala.emit("salas", salas)
                    socket.emit("user", user)
                    console.log(`usuario ${user.usuario.email} se unio a sala ${nombreSala}`)
                }
            } else {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('salirSala', () => {
            const user = usersSala[socket.id]
            if (user) {
                salirSala(socket, user, ioSala)
            } else {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('eliminarSala', () => {
            const user = usersSala[socket.id]
            if (user) {
                eliminarSala(ioSala, user)
            } else {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('crearJuego', async () => {
            const user = usersSala[socket.id]
            if (user) {
                const sala = salas[user.nombreSala]
                if (sala) {
                    let i = 0
                    for (let part of sala.participantes) {
                        part.numero = i
                        i++
                    }
                    const jugadores = sala.participantes.map(p => new Jugador(p.usuario.email, p.numero, p.nombreSala, socket.id))
                    const juego = new Teg(jugadores)
                    await juego.iniciar()
                    juegos[user.nombreSala] = juego
                    for (let part of sala.participantes) {
                        part.juegos.push(user.nombreSala)
                        socket.emit("user", part)
                    }
                    eliminarSala(ioSala, user)
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
                delete jugadoresMapa[socket.id]
                console.log(`${jugador.nombre} disconnected`)
            } else {
                console.log(`${socket.id} disconnected`)
            }
        })

        socket.on('validacion', async (token, nombrejuego) => {
            console.log(token)
            try {
                const decoded = jwt.verify(token, process.env.SECRET_KEY)
                const usuario = await Usuario.findById(decoded.id).exec()
                console.log(usuario)
                if (!usuario) {
                    socket.emit('loginIncorrecto')
                } else {
                    const juego = juegos[nombrejuego]
                    if (!juego) throw new Error(`no existe este juego ${nombrejuego}`)
                    const jugador = juego.jugadores.find(j => j.nombre === usuario.email)
                    if (!jugador) throw new Error(`no esta en este juego ${nombrejuego}`)
                    jugador.socketId = socket.id
                    socket.emit('loginCorrecto', jugador)
                    socket.join(jugador.nombreSala)
                    jugadoresMapa[socket.id] = jugador 
                    socket.emit("juego", juego)

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
                socket.emit('loginCorrecto', jugador)
                ioMapa.to(jugador.nombreSala).emit("juego", juego)
            } catch (e) {
                socket.emit('jugadaInvalida', e.message)
            }
        })

        socket.on('botonEmpate', nombreJuego => {
            const jugador = jugadoresMapa[socket.id]
            try {
                const juego = juegos[nombreJuego]
                if (!juego) throw new Error("no existe juego")
                delete juegos[jugador.nombreSala]
                ioMapa.to(jugador.nombreSala).emit('loginIncorrecto')
            } catch (e) {
                socket.emit('jugadaInvalida', e.message)
            }
        })

        socket.on('texto', texto => {
            const jugador = jugadoresMapa[socket.id]
            if (jugador) {
                console.log(texto)
                ioMapa.to(jugador.nombreSala).emit('texto', `${jugador.nombreSala} ${jugador.nombre}: ${texto}`)
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