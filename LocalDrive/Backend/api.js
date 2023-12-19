const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload')
const path = require('path');
const endpoints = require('./endpoints');
const PORT = 3000;
const app = express();

app.use(express.json());
app.use(fileUpload());
app.use(cors());
app.use(express.static(path.join(__dirname, '../FrontEnd')));



//obtener archivos 
app.get('/getFiles', endpoints.getFiles);


app.post('/uploadFile', endpoints.uploadFile);

//crear carpeta 
app.post('/createDir', endpoints.createDir);

// obtener contenido del directorio 
app.get('/getDirectoryContent', endpoints.getDirectoryContent);

// descargar archivo
app.get('/download/*', endpoints.downloadFile);

// descargar directorio
app.get('/downloadDir/*', endpoints.downloadDir);

// eliminar directorio
app.delete('/deleteDir/*', endpoints.deleteDir);

// eliminar archivo
app.delete('/deleteFile/*', endpoints.deleteFile);


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Arrancando API en http://192.168.100.5:${PORT}`);

})