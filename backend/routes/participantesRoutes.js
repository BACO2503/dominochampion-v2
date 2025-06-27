// backend/routes/participantesRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerParticipantes } = require('../controllers/participantesController');

router.get('/participantes', obtenerParticipantes);

module.exports = router;
