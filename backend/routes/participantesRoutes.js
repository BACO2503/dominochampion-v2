// backend/routes/participantesRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const { obtenerParticipantes } = require('../controllers/participantesController');

// Asegura que exista la carpeta /data
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Configura Multer para guardar el archivo como participantes.csv
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dataDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'participantes.csv'); // Siempre sobrescribe
  }
});
const upload = multer({ storage: storage });

// GET - obtener participantes
router.get('/participantes', obtenerParticipantes);

// POST - subir participantes y validar encabezados
router.post('/upload', upload.single('archivo'), (req, res) => {
  const filePath = path.join(dataDir, 'participantes.csv');
  const expectedHeaders = ['idParticipante', 'ap_p', 'ap_m', 'nombre'];

  if (!fs.existsSync(filePath)) {
    return res.status(400).json({ error: "El archivo no fue encontrado tras la carga." });
  }

  let validated = false;
  let errorMsg = '';

  const stream = fs.createReadStream(filePath)
    .pipe(csv())
    .on('headers', (headers) => {
      if (
        headers.length !== expectedHeaders.length ||
        !headers.every((h, i) => h === expectedHeaders[i])
      ) {
        validated = false;
        errorMsg = `Encabezados inválidos. Se esperaban: ${expectedHeaders.join(', ')}`;
        stream.destroy();
      } else {
        validated = true;
        stream.destroy();
      }
    })
    .on('close', () => {
      if (!validated) {
        fs.unlinkSync(filePath); // Borra archivo inválido
        return res.status(400).json({ error: errorMsg });
      }
      return res.json({ mensaje: 'Archivo CSV subido y validado correctamente' });
    })
    .on('error', (err) => {
      console.error("Error al procesar CSV:", err);
      return res.status(500).json({ error: "Error al procesar el archivo CSV" });
    });
});

module.exports = router;
