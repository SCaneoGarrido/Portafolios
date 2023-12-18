const express = require('express');
const cors = require('cors');
//const mongoose = require('mongoose');
const endpoints = require('../backend/endpoindsModules');
const upload = require('./middlewares/multerConfig');
const pdfLoader = require('./middlewares/pdfLoader');
const app = express();
const port = 3000;
app.use(express.json());

//conexion con la base de datos
//mongoose.connect('mongodb+srv://Sebastian:Sakromc403@biblioteca.gvdgo6y.mongodb.net/?retryWrites=true&w=majority');
app.use(cors());
app.use(express.static('portadasLibros'));

//gBook = get Book (obtener info del libro) "solo obtiene un libro" 
app.get('/gBook', endpoints.gBook);

//gaBook = get all book (obtener info de toda la coleccion) "obtiene todos los libros"
app.get('/gaBook', endpoints.gaBook);


//cBook = create Book 
app.post('/cBook', upload.single('file'), endpoints.cBook);

// subir el pdf de un libro
app.post('/uploadBook', pdfLoader, endpoints.uploadBook);

app.listen(port, () => {
    console.log(`Arrancando API en http://localhost:${port}`);

})