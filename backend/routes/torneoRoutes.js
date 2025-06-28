// backend/routes/torneoRoutes.js
const express = require('express');
const {
  getPartidasGeneradas,
  registrarGanador,
  consultarAcumuladoFinal,
  registrarPuntosFinal,
  exportarPodioFinalCSV,
  cerrarFaseFinal,
  limpiarData
} = require('../controllers/torneoController');

const router = express.Router();

// 1) Rutas ya existentes, usando la BD ya estática

//    GET  /api/torneo/partidas?fase=N
router.get('/partidas', getPartidasGeneradas);

//    PUT  /api/torneo/ganador/:idGrupo?fase=N
router.put('/ganador/:idGrupo', registrarGanador);

//    Endpoints de la final
router.get('/final/puntos', consultarAcumuladoFinal);
router.post('/final/ronda', registrarPuntosFinal);
router.get('/final/podio-csv', exportarPodioFinalCSV);
router.post('/final/cerrar', cerrarFaseFinal);
router.post('/limpiar-datos', limpiarData);

module.exports = router;
