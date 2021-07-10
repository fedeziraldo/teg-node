const Usuario = require('../db/usuario');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

(async  () => {
    try {
        let usu = new Usuario({
            nombre: "fede",
            email: "fede",
            password: "Fede",
        })
        console.log(await usu.save())
        usu = new Usuario({
            nombre: "diego",
            email: "diego",
            password: "Diego",
        })
        console.log(await usu.save())
        usu = new Usuario({
            nombre: "rafa",
            email: "rafa",
            password: "Rafa",
        })
        console.log(await usu.save())
    } catch (e) {
        console.log(e.message)
    }
})()

module.exports = {
    getAll: async function (req, res, next) {
        try {
            var usuarios = await Usuario.find()
            res.status(200).json(usuarios)
        } catch (e) {
            console.log(e)
            next(e)
        }
    },

    get: async function (req, res, next) {
        try {
            const usuario = await Usuario.findOne({ email: req.params.email })
            res.status(200).json(usuario)
        } catch (e) {
            console.log(e)
            next(e)
        }
    },

    login: async function (req, res, next) {
        try {
            const usu = await Usuario.findOne({ email: req.body.email })
            if (usu) {
                if (bcrypt.compareSync(req.body.password, usu.password)) {
                    const token = jwt.sign({ id: usu._id }, process.env.SECRET_KEY)
                    res.status(200).json({ user: usu, token: token })
                } else {
                    res.status(400).json("password invalida")
                }
            } else {
                res.status(400).json("usuario no encontrado")
            }
        } catch (e) {
            console.log(e)
            next(e)
        }
    }
}