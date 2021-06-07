const Usuario = require('../db/mongo')

module.exports = {
    getAll: async function (req, res, next) {
        try {
            var usus = await Usuario.find()
            res.status(200).json({ usuarios: usus })
        } catch (e) {
            console.log(e)
            next(e)
        }
    },

    get: async function (req, res, next) {
        try {
            const usu = await Usuario.findOne({ email: req.params.email })
            res.status(200).json({ usuario: usu })
        } catch (e) {
            console.log(e)
            next(e)
        }
    },

}