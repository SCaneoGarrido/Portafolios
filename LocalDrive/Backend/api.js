const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload')
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const PORT = 3000;
const app = express();

app.use(express.json());
app.use(fileUpload());
app.use(cors());

app.use(express.static(path.join(__dirname, '../FrontEnd')));

function readDirectory(directoryPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(directoryPath, { withFileTypes: true }, (err, items) => {
            if (err) {
                return reject(err);
            }

            let results = [];
            let promises = [];

            items.forEach((item) => {
                let fullPath = path.join(directoryPath, item.name);

                if (item.isDirectory()) {
                    // Si es un directorio, lee su contenido recursivamente
                    promises.push(readDirectory(fullPath).then(contents => {
                        return { name: item.name, type: 'directory', contents: contents };
                    }));
                } else {
                    results.push({ name: item.name, type: 'file' });
                }
            });

            Promise.all(promises).then(directories => {
                resolve(results.concat(directories));
            });
        });
    });
}

//obtener archivos 
app.get('/getFiles', (req, res) => {
    const directoryPath = path.join(__dirname, '../Files');


    readDirectory(directoryPath)
        .then(fileInfo => {
            if (fileInfo.length === 0) {
                res.status(200).send('Directorio de archivos vacío');
            } else {
                res.status(200).send(fileInfo);
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Error al leer el directorio' });
        });
});


app.post('/uploadFile', (req, res) => {
    console.log(req.files.file);
    console.log(req.body);
    let file = req.files.file;
    let directory = req.body.directory || '';
    file.mv(path.join(__dirname, `../Files/${directory}/${file.name}`), err => {
        if (err) return res.status(500).send({ message: err });
        return res.status(200).send({ message: 'Archivo cargado' });
    });
});

//crear carpeta 
app.post('/createDir', (req, res) => {
    let dirName = req.body.name;
    let parentDirectory = req.body.directory;

    if (!parentDirectory) {
        parentDirectory = path.join(__dirname, '../Files');
    } else {
        parentDirectory = path.join(__dirname, '../Files', parentDirectory);
    }

    const fullPath = path.join(parentDirectory, dirName);

    fs.mkdir(fullPath, { recursive: true }, (err) => {
        if (err) {
            res.status(400).json({ message: "Error al crear el directorio" });
        } else {
            res.status(201).json({ message: "Directorio creado con éxito" });
        }
    });
});


app.get('/getDirectoryContent', (req, res) => {
    const dirName = req.query.name;
    const directoryPath = path.join(__dirname, '../Files', dirName);

    console.log("Directorio solicitado:", directoryPath);

    fs.readdir(directoryPath, { withFileTypes: true }, (err, items) => {
        // Verifica si hay un error y si es específicamente 'ENOENT'
        if (err && err.code === 'ENOENT') {
            console.error("Directorio no encontrado:", directoryPath);
            res.status(404).send('Directorio no encontrado');
            return;
        } else if (err) {

            console.error("Error al leer el directorio:", err);
            res.status(500).send('Error al leer el directorio');
            return;
        }

        // No hay error, procesa los elementos normalmente
        let results = [];
        items.forEach(item => {
            results.push({
                name: item.name,
                type: item.isDirectory() ? 'directory' : 'file'
            });
        });

        res.status(200).json(results);
    });
});
app.get('/download/*', (req, res) => {
    const filePath = path.join(__dirname, '../Files', req.params[0]);
    res.download(filePath, (err) => {
        if (err) {
            res.status(404).send('No se pudo encontrar el archivo.');
        }
    });

});

app.get('/downloadDir/*', (req, res) => {
    const dirPath = path.join(__dirname, '../Files', req.params[0]);
    const dirName = path.basename(dirPath);

    if (!fs.existsSync(dirPath)) {
        return res.status(404).send('Directorio no encontrado');
    }
    const zipFileName = `${dirName}.zip`;
    res.attachment(zipFileName);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    archive.pipe(res);
    archive.directory(dirPath, false);

    archive.finalize();
})


app.delete('/deleteDir/*', (req, res) => {
    const dirPath = path.join(__dirname, '../Files', req.params[0]);
    console.log("Directorio a eliminar: ", dirPath);
    if (!fs.existsSync(dirPath)) {
        return res.status(404).send('Directorio no encontrado');
    }
    fs.rm(dirPath, { recursive: true }, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error al eliminar directiorio');
        } else {
            res.status(200).send('Directorio eliminado');
        }
    })
})

app.delete('/deleteFile/*', (req, res) => {
    const filePath = path.join(__dirname, '../Files', req.params[0]);
    console.log(filePath)
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Archivo no encontrado');
    }

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error al eliminar el archivo');
        } else {
            res.status(200).send('Archivo eliminado');
        }
    });
});


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Arrancando API en http://192.168.100.5:${PORT}`);

})
