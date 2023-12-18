const multer = require('multer');
const path = require('path');
const sharp = require('sharp');

const pdfStorage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, 'pdfLibros');
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.').pop();
        cb(null, file.originalname.toLowerCase());
    }
})
const pdfUpload = multer({ storage: pdfStorage }).single('pdf')

module.exports = pdfUpload;
