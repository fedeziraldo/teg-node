const { Server } = require("socket.io")
const jwt = require('jsonwebtoken')
const Mensaje = require("../db/mensaje")
const Usuario = require("../db/usuario")
const Jugador = require("./Jugador")

let io;
const SIN_SALA = 'sin sala'

const usuariosLogueados = {}
const salas = {}

const socketio = (server) => {
    io = new Server(server, { cors: { origin: '*' } })

    io.on('connection', socket => {
        console.log(`${socket.id} connected`)

        socket.on('disconnect', () => {
            if (usuariosLogueados[socket.id]) {
                console.log(`${usuariosLogueados[socket.id].usuario.email} disconnected`)
                delete usuariosLogueados[socket.id]

                if (salas[sala]) {
                    salas[sala].participantes.splice(socket, 1)
                    socket.leave(socket.id)
                    socket.join(SIN_SALA)
                    console.log(`usuario ${usuariosLogueados[socket.id].usuario._id} salio de la sala ${sala}`)
                }

                // eliminar sala
                if (salas[socket.id]) {
                    salas[socket.id].participantes.forEach(s => {
                        s.leave(socket.id)
                        s.join(SIN_SALA)
                    })
                    salas[socket.id].participantes.splice(usuario, 1)
                    socket.leave(socket.id)
                    socket.join(SIN_SALA)
                    console.log(`usuario ${usuariosLogueados[socket.id].usuario._id} elimino su sala`)
                }
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
                if (!usuario) socket.emit('loginIncorrecto')
                usuariosLogueados[socket.id] = new Jugador(socket, usuario, SIN_SALA)
                socket.join(SIN_SALA)
                socket.emit('loginCorrecto', {usuario, salas: Object.keys(salas), usuarios: Object.keys(usuariosLogueados)})
            } catch (e) {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('texto', texto => {
            if (usuariosLogueados[socket.id]) {
                const jugador = usuariosLogueados[socket.id]
                console.log(texto)
                socket.to(jugador.nombreSala).emit('texto', `${usuario.nombre}: ${texto}`)
                new Mensaje({
                    mensaje: texto,
                    usuario: usuariosLogueados[socket.id].usuario,
                }).save()
            } else {
                socket.emit('loginIncorrecto') 
            }
        })

        socket.on('crearSala', () => {
            if (usuariosLogueados[socket.id]) {
                const jugador = usuariosLogueados[socket.id]
                if (!salas[socket.id]) {
                    salas[socket.id] = {
                        creador: jugador,
                        participantes: []
                    }
                    jugador.nombreSala = socket.id
                    socket.leave(SIN_SALA)
                    socket.join(socket.id)
                    socket.emit
                    console.log(`usuario ${usuariosLogueados[socket.id].usuario._id} creo sala`)
                }
            }
        })

        socket.on('unirseSala', sala => {
            if (usuariosLogueados[socket.id]) {
                if (!salas[sala]) {
                    salas[sala].participantes.push(socket)
                    jugador.nombreSala = sala
                    socket.leave(SIN_SALA)
                    socket.join(sala)
                    console.log(`usuario ${usuariosLogueados[socket.id].usuario._id} se unio a sala ${sala}`)
                }
            }
        })

        socket.on('salirSala', sala => {
            if (usuariosLogueados[socket.id]) {
                const jugador = usuariosLogueados[socket.id]
                if (salas[sala]) {
                    salas[sala].participantes.splice(socket, 1)
                    socket.leave(jugador.nombreSala)
                    socket.join(SIN_SALA)
                    console.log(`usuario ${usuariosLogueados[socket.id].usuario._id} salio de la sala ${sala}`)
                }
            }
        })

        socket.on('eliminarSala', () => {
            if (usuariosLogueados[socket.id]) {
                if (salas[socket.id]) {
                    salas[socket.id].participantes.forEach(s => {
                        s.leave(socket.id)
                        s.join(SIN_SALA)
                    })
                    salas[socket.id].participantes.splice(usuario, 1)
                    socket.leave(socket.id)
                    socket.join(SIN_SALA)
                    console.log(`usuario ${usuariosLogueados[socket.id].usuario._id} elimino su sala`)
                }
            }
        })
    });

}


module.exports = socketio