const { Server } = require("socket.io")
const jwt = require('jsonwebtoken')
const Mensaje = require("../db/mensaje")
const Usuario = require("../db/usuario")

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
                if (usuario) {
                    console.log(token, usuario)
                    usuariosLogueados[socket.id] = {
                        socket,
                        usuario,
                    }
                    socket.join(SIN_SALA)
                    socket.emit('loginCorrecto', usuario)
                } else {
                    socket.emit('loginIncorrecto')
                }
            } catch (e) {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('texto', texto => {
            if (usuariosLogueados[socket.id]) {
                const { usuario } = usuariosLogueados[socket.id]
                console.log(texto)
                socket.to(SIN_SALA).emit('texto', `${usuario.nombre}: ${texto}`)
                new Mensaje({
                    mensaje: texto,
                    usuario: usuariosLogueados[socket.id].usuario,
                }).save()
            }
        })

        socket.on('crearSala', () => {
            if (usuariosLogueados[socket.id]) {
                if (!salas[socket.id]) {
                    const { usuario } = usuariosLogueados[socket.id]
                    salas[socket.id] = {
                        creador: usuario,
                        participantes: []
                    }
                    socket.leave(SIN_SALA)
                    socket.join(socket.id)
                    socket.emit
                    console.log(`usuario ${usuariosLogueados[socket.id].usuario._id} creo sala`)
                }
            }
        })

        socket.on('unirseSala', sala => {
            if (usuariosLogueados[socket.id]) {
                if (salas[sala]) {
                    salas[socket.id].participantes.push(socket)
                    socket.leave(SIN_SALA)
                    socket.join(socket.id)
                    console.log(`usuario ${usuariosLogueados[socket.id].usuario._id} se unio a sala ${sala}`)
                }
            }
        })

        socket.on('salirSala', sala => {
            if (usuariosLogueados[socket.id]) {
                if (salas[sala]) {
                    salas[sala].participantes.splice(socket, 1)
                    socket.leave(socket.id)
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