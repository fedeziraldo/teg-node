var express = require('express');
var router = express.Router();
const usuarios = require('../controllers/usuarios')

/* GET users listing. */
router.get('/', usuarios.getAll);

router.get('/:email', usuarios.get);

module.exports = router;
