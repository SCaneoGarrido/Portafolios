const content = document.querySelector('.folder-list');
let currentFileName = null;
var currentPath = [];

// obtener los elementos desde la API
async function fetchFiles() {
    console.log("Ruta actual:", currentPath.join('/'));
    try {
        const response = await fetch('http://192.168.100.5:3000/getFiles');
        if (!response.ok) {
            throw new Error('Error al obtener contenido');
        }
        const data = await response.json();
        data.forEach(file => {
            const fileCard = createFileCard(file);
            content.append(fileCard);
        });
    } catch (error) {
        console.error('Error: ', error);
    }
}

// Cargar el contenido de un directorio
function loadDirectoryContent(directoryPath) {
    console.log("Ruta actual:", directoryPath);
    fetch(`http://192.168.100.5:3000/getDirectoryContent?name=${encodeURIComponent(directoryPath)}`)
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Directorio no encontrado');
                } else {
                    throw new Error('Error al cargar el directorio');
                }
            }
            return response.json();
        })
        .then(data => {
            content.innerHTML = '';
            data.forEach(file => {
                const fileCard = createFileCard(file);
                content.append(fileCard);
            })
        })
        .catch(error => {
            if (error.message.includes('Directorio no encontrado')) {
                alert('Directorio no encontrado. Redirigiendo al directorio raíz.');
                currentPath = [];
                fetchFiles();
            } else {
                console.error('Error: ', error);
            }
        });
}

function loadDirectory(dirName) {
    if (currentPath[currentPath.length - 1] !== dirName) {
        currentPath.push(dirName);
    }
    loadDirectoryContent(currentPath.join('/'));
}
// Crear el contenido dinámico de los archivos y directorios
function createFileCard(file) {
    const fileContainer = document.createElement('div');
    fileContainer.classList.add('file-container');

    const fileCard = document.createElement('div');
    fileCard.classList.add('file-card');

    const fileFront = document.createElement('div');
    fileFront.classList.add('file-front');
    fileFront.style.display = 'flex';
    fileFront.style.flexDirection = 'column';
    fileFront.style.alignItems = 'center';
    fileFront.style.justifyContent = 'center';

    const fileImage = document.createElement('img');

    if (file.type === 'file') {
        fileImage.src = './img/archivo.png';
        if (file.name.endsWith('.txt')) {
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.classList.add('edit-link');
            editBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                cargarArchivoParaEditar(`${currentPath.join('/')}/${file.name}`);
            });
            fileFront.appendChild(editBtn);
        }

        if (file.name.endsWith('.pdf')) {
            const toPdf = document.createElement('button');
            toPdf.textContent = 'Ver';
            toPdf.classList.add('view-link');
            toPdf.addEventListener('click', (event) => {
                event.stopPropagation();
                cargarPdf(`${currentPath.join('/')}/${file.name}`)
            })

            fileFront.appendChild(toPdf);
        }
        const downloadLink = document.createElement('a');
        const fullPathToFile = `${currentPath.join('/')}/${file.name}`;
        downloadLink.href = `http://192.168.100.5:3000/download/${encodeURIComponent(fullPathToFile)}`;
        downloadLink.textContent = 'Descargar';
        downloadLink.classList.add('download-link');

        downloadLink.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        downloadLink.setAttribute('download', '');
        fileFront.appendChild(downloadLink);

        const deleteFileBtn = document.createElement('button');
        deleteFileBtn.textContent = 'Eliminar';
        deleteFileBtn.classList.add('delete-link');

        deleteFileBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (confirm("¿Estás segurx que deseas eliminar este archivo?")) {
                fetch(`http://192.168.100.5:3000/deleteFile/${encodeURIComponent(fullPathToFile)}`, {
                    method: 'DELETE'

                })
                    .then(response => response.text())
                    .then(data => {
                        console.log(data);
                        location.reload();
                    })
                    .catch(err => console.error('Error: ', err));
            }
        })
        fileFront.appendChild(deleteFileBtn);

    } else {
        fileImage.src = './img/directorio.png';
        fileContainer.addEventListener('click', () => {
            loadDirectory(file.name);
        })
        if (currentPath.length === 0) {
            const deleteDirBtn = document.createElement('button');
            deleteDirBtn.textContent = 'Eliminar Carpeta';
            deleteDirBtn.classList.add('delete-link');

            deleteDirBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();

                // El nombre del directorio a eliminar
                const directoryToDelete = file.name;

                if (confirm("¿Estás segurx que deseas eliminar esta carpeta y todo su contenido?")) {
                    fetch(`http://192.168.100.5:3000/deleteDir/${encodeURIComponent(directoryToDelete)}`, {
                        method: 'DELETE'
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Error al eliminar el directorio');
                            }
                            return response.text();
                        })
                        .then(data => {
                            console.log(data);
                            location.reload(); // Recargar la página para reflejar los cambios
                        })
                        .catch(err => console.error('Error: ', err));
                }
            });

            fileFront.appendChild(deleteDirBtn);
        }

        // boton de descarga
        const downloadDirBtn = document.createElement('a');
        downloadDirBtn.textContent = 'Descargar';
        downloadDirBtn.classList.add('download-link');
        downloadDirBtn.href = `http://192.168.100.5:3000/downloadDir/${encodeURIComponent(file.name)}`;
        downloadDirBtn.addEventListener('click', (event) => event.stopPropagation());
        downloadDirBtn.setAttribute('download', '');
        downloadDirBtn.style.margin = '5px 0';
        fileFront.appendChild(downloadDirBtn);


    }
    fileImage.style.height = '70px';
    fileImage.style.width = '70px';
    const fileName = document.createElement('p');
    fileName.innerText = file.name;
    fileName.style.padding = '5px 0';
    fileFront.appendChild(fileImage);
    fileFront.appendChild(fileName);

    fileCard.appendChild(fileFront);
    fileContainer.appendChild(fileCard);

    return fileContainer;
}

// ir un directorio atras
function goBack() {
    if (currentPath.length > 0) {
        currentPath.pop(); // Elimina el último elemento de currentPath
        const newPath = currentPath.join('/');
        loadDirectoryContent(newPath);
    }
}

// muestra el editor de texto
function mostrarEditor() {
    document.getElementById('editor-container').style.display = 'block';
}

// cancela la edicion del archivo de txt
function cancelarEdicion() {

    document.getElementById('editor').value = '';
    document.getElementById('editor-container').style.display = 'none';
}


// obtenie el pdf desde la api
function cargarPdf(filePath) {
    currentFileName = filePath;
    fetch(`http://192.168.100.5:3000/viewPdf/${encodeURIComponent(filePath)}`)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        })
        .catch(error => console.error('Error al obtener PDF; ', error));
}


// funcion cargar archivos inclu CSS (Funcion larga)
function cargarArchivoParaEditar(filePath) {
    fetch(`http://192.168.100.5:3000/readFile/${encodeURIComponent(filePath)}`)
        .then(response => response.text())
        .then(data => {
            const editorWindow = window.open('', '_blank');
            if (editorWindow) {
                editorWindow.document.write(`
                    <html>
                    <head>
                        <title>Editor</title>
                        <style>
                            body {
                                background-color: #1e1e1e;
                                color: #f5f5f5;
                                font-family: Arial, sans-serif;
                                margin: 0;
                                padding: 20px;
                            }
                            textarea {
                                width: 100%;
                                height: 80vh;
                                background-color: #333;
                                color: #fff;
                                border: none;
                                padding: 10px;
                                border-radius: 4px;
                                font-family: monospace;
                            }
                            button {
                                background-color: #4CAF50;
                                color: white;
                                padding: 10px 15px;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                                margin-top: 10px;
                            }
                            button:hover {
                                background-color: #45a049;
                            }
                        </style>
                    </head>
                    <body>
                        <textarea id="editor">${data}</textarea>
                        <button onclick="window.opener.guardarCambios('${filePath}', document.getElementById('editor').value, window)">Guardar Cambios</button>
                        <button onclick="window.close()">Cancelar</button>
                    </body>
                    </html>
                `);
            }
        })
        .catch(error => console.error('Error: ', error));
}


// Guarda los cambios del archivo de txt
function guardarCambios(filePath, updatedContent, editorWindow) {
    fetch(`http://192.168.100.5:3000/writeFile/${encodeURIComponent(filePath)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: updatedContent
    })
        .then(response => {
            if (response.ok) {
                alert('Archivo guardado');
                editorWindow.close(); // Cierra la ventana de edición
            } else {
                alert('Error al guardar el archivo');
            }
        })
        .catch(error => {
            console.error('Error: ', error);
            alert('Error al guardar el archivo');
        });
}



document.addEventListener('DOMContentLoaded', () => {

    const savedPath = localStorage.getItem('currentPath');
    if (savedPath) {
        currentPath = savedPath.split('/');
        loadDirectoryContent(savedPath);
    } else {
        currentPath = [];
        fetchFiles();
    }
    // Cargar archivos
    const form = document.getElementById('files-form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData();
        const fileInput = document.getElementById('file-input');
        formData.append("file", fileInput.files[0]);
        formData.append("directory", currentPath.join('/'));

        fetch('http://192.168.100.5:3000/uploadFile', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                document.getElementById('message').innerText = 'Archivo subido con éxito: ' + data.message;
                localStorage.setItem('currentPath', currentPath.join('/'));
                location.reload();
                //localStorage.clear('currentPath')
            })
            .catch(error => {
                document.getElementById('message').innerText = 'Error al subir el archivo: ' + error;
            });
    });

    // Crear nuevo directorio
    const createDirButton = document.getElementById('create-dir-button');
    const submitDirButton = document.getElementById('submit-dir');

    createDirButton.addEventListener('click', function () {
        document.getElementById('new-dir-form').style.display = 'block';
        document.getElementById('new-dir-form').style.padding = '10px';
    });

    submitDirButton.addEventListener('click', function (event) {
        event.preventDefault();
        const dirName = document.getElementById('new-dir-name').value;

        fetch('http://192.168.100.5:3000/createDir', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: dirName, directory: currentPath.join('/') })
        })
            .then(response => response.json())
            .then(data => {
                console.log('Carpeta creada:', data);
                localStorage.setItem('currentPath', currentPath.join('/'));
                location.reload();
                //localStorage.clear('currentPath')

            })
            .catch(error => console.error('Error:', error));
    });
});


window.onload = () => {
    localStorage.clear('currentPath');
}
