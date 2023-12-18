const mongoose = require('mongoose');

const schemaBook = mongoose.Schema({
    titulo: String,
    autor: String,
    editorial: String,
    fecha: String,
    descripcion: String,
    paginas: Number,
    genero: String,
    imagenUrl: String,
})

module.exports = mongoose.model('schemaBook', schemaBook);