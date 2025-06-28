// backend/routes/participantesRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerParticipantes } = require('../controllers/participantesController');

// Si quieres exponer este endpoint para ver todos los participantes desde el CSV:
router.get('/participantes', obtenerParticipantes);

module.exports = router;
