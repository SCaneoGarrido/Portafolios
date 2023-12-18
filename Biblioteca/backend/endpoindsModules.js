const bookSchema = require('./schemas/bookSchema');



const endpoints = {
    gBook: async (req, res) => {
        const libro = await bookSchema.findOne({ titulo: req.body.titulo });
        if (libro) {
            res.status(200).send(libro);
        } else {
            res.status(404).send('Not Found 404');
        }
    },
    //gBook (obtener info de un libro) (usuario y administrador)

    

   

    cBook: async (req, res) => {
        console.log(req.body);
        const newBook = new bookSchema({
            titulo: req.body.titulo,
            autor: req.body.autor,
            fecha: req.body.fecha,
            descripcion: req.body.descripcion,
            cantidad: req.body.cantidad,
            seccion: req.body.seccion,
            genero: req.body.genero,
            estado: req.body.estado,
            imagenUrl: req.file ? req.file.filename : null
        })

        try {
            await newBook.save();
            res.status(201).send();
        } catch (error) {
            console.error('Error al guardar el libro ', error);
            res.status(500).send('Error al guardar el libro en la base de datos');
        }
    }, //cBook (guardar libro)

    uploadBook: async (req, res) => {

        if (req.body) {
            res.status(200).send('Libro pdf cargado');
        } else {
            res.status(400).send('Error al cargar el pdf libro');
        }
    },





}//endpoints

module.exports = endpoints;
