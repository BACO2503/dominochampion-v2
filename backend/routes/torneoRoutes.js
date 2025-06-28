// backend/routes/torneoRoutes.js
const express = require('express');
const multer = require('multer');
const {
  uploadParticipantes,
  getPartidasGeneradas,
  registrarGanador,
  consultarAcumuladoFinal,
  registrarPuntosFinal,
  exportarPodioFinalCSV,
  cerrarFaseFinal
} = require('../controllers/torneoController');

const router = express.Router();

// 1) Configura multer para que deje el archivo bajo /backend/data/
const upload = multer({ dest: 'data/' });

router.post('/cargar', require('../controllers/torneoController').cargarParticipantesdesdeJSON);

// 2) Ruta para subir el CSV de participantes
//    -> POST http://localhost:3001/api/torneo/participantes
router.post(
  '/participantes',
  upload.single('file'),
  uploadParticipantes
);

// 3) Rutas ya existentes
//    GET  /api/torneo/partidas?fase=N
router.get('/partidas', getPartidasGeneradas);

//    PUT  /api/torneo/ganador/:idGrupo?fase=N
router.put('/ganador/:idGrupo', registrarGanador);

//    Resto de endpoints de la final
router.get('/final/puntos', consultarAcumuladoFinal);
router.post('/final/ronda', registrarPuntosFinal);
router.get('/final/podio-csv', exportarPodioFinalCSV);
router.post('/final/cerrar', cerrarFaseFinal);

module.exports = router;
