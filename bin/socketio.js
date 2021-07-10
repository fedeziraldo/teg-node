const { Server } = require("socket.io")
const jwt = require('jsonwebtoken')
const Mensaje = require("../db/mensaje")
const Usuario = require("../db/usuario")

let io;

const usuariosLogueados = {};

const socketio = (server) => {
    io = new Server(server, { cors: { origin: '*'} });
    
    io.on('connection', socket => {
        console.log(`${socket.id} connected`)
        socket.on('disconnect', () => {
            if (usuariosLogueados[socket.id]) {
                console.log(`${usuariosLogueados[socket.id].usuario.email} disconnected`)
                delete usuariosLogueados[socket.id]
            } else {
                console.log(`${socket.id} disconnected`)
            }
        })

        socket.on('validacion', async token => {
            console.log(token)
            try {
                const decoded = jwt.verify(token, process.env.SECRET_KEY)
                const usuario = await Usuario.findById(decoded.id).exec()
                console.log(token, usuario)
                usuariosLogueados[socket.id] = {
                    socket,
                    usuario,
                }
                socket.emit('loginCorrecto', usuario)
            } catch (e) {
                socket.emit('loginIncorrecto')
            }
        })

        socket.on('texto', texto => {
            if (usuariosLogueados[socket.id]) {
                console.log(texto)
                socket.broadcast.emit('texto', texto)
                new Mensaje({
                    mensaje: texto,
                    usuario: usuariosLogueados[socket.id].usuario,
                }).save()
            }
        })
    });

}


module.exports = socketio