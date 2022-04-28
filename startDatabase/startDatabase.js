require('dotenv').config();
require('jsonc-require');
const bcrypt = require('bcrypt');
const mongodb = require('../db/mongodb')
let escudos = require("./escudos.json")
let continentes = require("./continentes.json")
let paises = require("./paises.json")
let limites = require("./limites.jsonc")
const cartas = require("./cartasGlobales.json")
const objetivos = require("./objetivos.json")
const usuario = require('../db/usuario')
const escudo = require("../db/escudo")
const pais = require("../db/pais")
const limite = require("../db/limite")
const continente = require("../db/continente")
const objetivo = require("../db/objetivo")
const cartaGlobal = require("../db/cartaGlobal");


(async () => {
    try {
        await Promise.all([
            usuario.deleteMany({}),
            limite.deleteMany(),
            escudo.deleteMany({}),
            continente.deleteMany({}),
            pais.deleteMany({}),
            cartaGlobal.deleteMany({}),
            objetivo.deleteMany({}),
        ])

        const fede = new usuario({
            nombre: "fede",
            email: "fede",
            password: bcrypt.hashSync(process.env.PASS_FEDE, 10),
        })
        const diego = new usuario({
            nombre: "diego",
            email: "diego",
            password: bcrypt.hashSync(process.env.PASS_DIEGO, 10),
        })
        const rafa = new usuario({
            nombre: "rafa",
            email: "rafa",
            password: bcrypt.hashSync(process.env.PASS_RAFA, 10),
        })
        const negro = new usuario({
            nombre: "negro",
            email: "negro",
            password: bcrypt.hashSync(process.env.PASS_NEGRO, 10),
        })
        const lau = new usuario({
            nombre: "lau",
            email: "lau",
            password: bcrypt.hashSync(process.env.PASS_LAU, 10),
        })
        escudos = await escudo.insertMany(escudos)
        continentes.forEach(continente => {
            continente.escudo = escudos.find(e => e.numero == continente.escudo)
        })
        continentes = await continente.insertMany(continentes)

        paises.forEach(pais => {
            pais.escudo = escudos.find(e => e.numero == pais.escudo)
            pais.continente = continentes.find(c => c.numero == pais.continente)
        })
        paises = await pais.insertMany(paises)

        const limitesBase= []
        for (let limite of limites) {
            const pais1 = paises[limite[0]-1]
            const pais2 = paises[limite[1]-1]
            limitesBase.push({ pais1, pais2 })
            limitesBase.push({ pais1: pais2, pais2: pais1 })
        }

        await Promise.all([
            usuario.insertMany([fede, diego, rafa, negro, lau]),
            limite.insertMany(limitesBase),
            cartaGlobal.insertMany(cartas),
            objetivo.insertMany(objetivos),
        ])
        console.log("terminado OK")
    } catch (e) {
        console.log(e)
    }
    mongodb.connection.close()
})()