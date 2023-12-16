# Local Cloud Drive

## Descripción

Local Cloud Drive es una aplicación de almacenamiento en la nube personal que permite a los usuarios gestionar archivos y directorios en un servidor local. Ofrece funcionalidades para subir, descargar, eliminar archivos, así como crear y eliminar directorios.

## Características

- Subida de archivos al servidor local.
- Descarga de archivos del servidor.
- Eliminación de archivos y directorios.
- Creación de nuevos directorios.
- Navegación entre directorios y visualización de su contenido.
- Interfaz de usuario web para la gestión de archivos.

## Tecnologías Utilizadas

- **Frontend**: HTML, CSS, JavaScript.
- **Backend**: Node.js, Express.js.
- **Manejo de archivos**: Biblioteca `fs` de Node.js.
- **Compresión de archivos**: Biblioteca `archiver`.

## Estructura del Proyecto

El proyecto se divide en dos partes principales: el frontend y el backend.

### Frontend

El frontend se encuentra en la carpeta `FrontEnd` y contiene los siguientes archivos:

- `index.html`: El archivo HTML principal de la aplicación.
- `styles.css`: Hoja de estilos CSS para la interfaz de usuario.
- `script.js`: Scripts de JavaScript para manejar la lógica del lado del cliente.

### Backend

El backend se encuentra en la carpeta `Backend` y contiene los siguientes archivos:

- `api.js`: El servidor principal de Node.js que maneja las solicitudes HTTP.

## Instalación

Instrucciones para instalar y ejecutar el proyecto:

1. Clona el repositorio en tu máquina local.
2. Navega a la carpeta del proyecto desde la terminal.
3. Ejecuta `npm install` para instalar todas las dependencias. (Opcional Ya que se incluye la carpeta node_modules)
4. Inicia el servidor con `node Backend/api.js`.

## Uso

Una vez que el servidor está en ejecución, abre tu navegador y ve a `http://localhost:3000` para acceder a la interfaz de usuario de Local Cloud Drive.

## Endpoints del Backend

Descripción de los principales endpoints de la API:

- `GET /getFiles`: Obtiene una lista de todos los archivos y directorios en el directorio raíz.
- `POST /uploadFile`: Sube un archivo al servidor en el directorio especificado.
- `GET /download/:fileName`: Descarga el archivo especificado.
- `DELETE /deleteFile/:fileName`: Elimina el archivo especificado.
- `POST /createDir`: Crea un nuevo directorio.
- `DELETE /deleteDir/:dirName`: Elimina el directorio especificado y su contenido.

