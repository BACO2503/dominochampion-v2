// backend/controllers/participantesController.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const obtenerParticipantes = async (req, res) => {
  const fase = parseInt(req.query.fase || "1");
  let filePath;

  if (fase === 1) {
    filePath = path.join(__dirname, '../data/participantes.csv');
  } else {
    filePath = path.join(__dirname, `../data/ganadores_fase${fase - 1}.csv`);
  }

  const participantes = [];

  try {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        participantes.push(row);
      })
      .on('end', () => {
        res.json({ participantes });
      });
  } catch (error) {
    console.error('Error al leer el CSV:', error);
    res.status(500).json({ error: 'Error al obtener los participantes' });
  }
};

module.exports = { obtenerParticipantes };
