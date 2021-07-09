const express = require('express')
const router = express.Router()

const usuario = require('../controllers/usuarios')

router.post("/register", () => null)
router.post("/login", usuario.login)

module.exports = router