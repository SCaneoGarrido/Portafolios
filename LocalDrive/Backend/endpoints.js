const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
// ======= FUNCIONES =========== //
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
// ============================= //


const endpoints = {
    getFiles: (req, res) => {
        const directoryPath = path.join(__dirname, '../Files');
        console.log(directoryPath)
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
    }, // getFiles

    uploadFile: (req, res) => {
        console.log(req.files.file);
        console.log(req.body);
        let file = req.files.file;
        let directory = req.body.directory || '';
        file.mv(path.join(__dirname, `../Files/${directory}/${file.name}`), err => {
            if (err) return res.status(500).send({ message: err });
            return res.status(200).send({ message: 'Archivo cargado' });
        });
    }, // uploadFile

    createDir: (req, res) => {
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
    }, // createDir

    getDirectoryContent: (req, res) => {
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
            let results = [];
            items.forEach(item => {
                results.push({
                    name: item.name,
                    type: item.isDirectory() ? 'directory' : 'file'
                });
            });
            res.status(200).json(results);
        });
    }, //getDirectoryContent

    downloadFile: (req, res) => {
        const filePath = path.join(__dirname, '../Files', req.params[0]);
        res.download(filePath, (err) => {
            if (err) {
                res.status(404).send('No se pudo encontrar el archivo.');
            }
        });
    }, //downloadFile

    downloadDir: (req, res) => {
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
    }, // downloadDir

    deleteDir: (req, res) => {
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
    }, // deleteDir

    deleteFile: (req, res) => {
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
    }, // deleteFile

    readFile: (req, res) => {
        const fileName = req.params.fileName;
        const filePath = path.join(__dirname, '../Files', fileName);

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Error al leer el archivo');
            } else {
                res.status(200).send(data);
            }
        });
    }, // readFile

    writeFile: (req, res) => {
        const fileName = req.params.fileName;
        const filePath = path.join(__dirname, '../Files', fileName);

        fs.writeFile(filePath, req.body, 'utf8', err => {
            if (err) {
                res.status(500).send('Error al escribir en el archivo');
            } else {
                res.status(200).send('Archivo actualizado');
            }
        });
    }, // writeFile

    viewPdf: (req, res) => {
        const pdfName = req.params.filename;
        const pdfPath = path.join(__dirname, '../Files', pdfName);
        console.log(pdfPath)

        fs.readFile(pdfPath, (err, data) => {
            if (err) {
                res.status(500).send('Error al previsualizar el PDF');
            } else {
                //res.status(200).send(data);
                res.setHeader('Content-Type', 'application/pdf');
                res.send(data)
            }
        })
    }, // viewPdf
} // Enpoints

module.exports = endpoints;