// backend/routes/torneoRoutes.js
const express = require('express');
const {
  getPartidasGeneradas,
  registrarGanador,
  consultarAcumuladoFinal,
  registrarPuntosFinal,
  exportarPodioFinalCSV
} = require('../controllers/torneoController');

const router = express.Router();

// Genera o devuelve las partidas de la fase N (lee CSV de ganadores_faseN-1 si no existe JSON)
router.get('/partidas', getPartidasGeneradas);

// Registra ganador, ahora recibiendo ?fase=N para saber en qué CSV escribir
router.put('/ganador/:idGrupo', registrarGanador);

// Endpoints de la final
router.get('/final/puntos', consultarAcumuladoFinal);
router.post('/final/ronda', registrarPuntosFinal);
router.get('/final/podio-csv', exportarPodioFinalCSV);

module.exports = router;
