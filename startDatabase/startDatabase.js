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
const Usuario = require('../db/usuario')
const Escudo = require("../db/escudo")
const Pais = require("../db/pais")
const Limite = require("../db/limite")
const Continente = require("../db/continente")
const Objetivo = require("../db/objetivo")
const CartaGlobal = require("../db/cartaGlobal");


(async () => {
    try {
        await Promise.all([
            Usuario.deleteMany({}),
            Limite.deleteMany(),
            Escudo.deleteMany({}),
            Continente.deleteMany({}),
            Pais.deleteMany({}),
            CartaGlobal.deleteMany({}),
            Objetivo.deleteMany({}),
        ])

        const fede = new Usuario({
            nombre: "fede",
            email: "fede",
            password: bcrypt.hashSync(process.env.PASS_FEDE, 10),
        })
        const diego = new Usuario({
            nombre: "diego",
            email: "diego",
            password: bcrypt.hashSync(process.env.PASS_DIEGO, 10),
        })
        const rafa = new Usuario({
            nombre: "rafa",
            email: "rafa",
            password: bcrypt.hashSync(process.env.PASS_RAFA, 10),
        })
        const negro = new Usuario({
            nombre: "negro",
            email: "negro",
            password: bcrypt.hashSync(process.env.PASS_NEGRO, 10),
        })
        const lau = new Usuario({
            nombre: "lau",
            email: "lau",
            password: bcrypt.hashSync(process.env.PASS_LAU, 10),
        })
        escudos = await Escudo.insertMany(escudos)
        continentes.forEach(continente => {
            continente.escudo = escudos.find(e => e.numero == continente.escudo)
        })
        continentes = await Continente.insertMany(continentes)

        paises.forEach(pais => {
            pais.escudo = escudos.find(e => e.numero == pais.escudo)
            pais.continente = continentes.find(c => c.numero == pais.continente)
        })
        paises = await Pais.insertMany(paises)

        const limitesBase= []
        for (let limite of limites) {
            const pais1 = paises[limite[0]-1]
            const pais2 = paises[limite[1]-1]
            limitesBase.push({ pais1, pais2 })
            limitesBase.push({ pais1: pais2, pais2: pais1 })
        }

        await Promise.all([
            Usuario.insertMany([fede, diego, rafa, negro, lau]),
            Limite.insertMany(limitesBase),
            CartaGlobal.insertMany(cartas),
            Objetivo.insertMany(objetivos),
        ])
        console.log("terminado OK")
    } catch (e) {
        console.log(e)
    }
    mongodb.connection.close()
})()