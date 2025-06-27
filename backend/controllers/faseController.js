// backend/controllers/faseController.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const formarPartidasFaseUno = async (req, res) => {
  const filePath = path.join(__dirname, '../data/participantes.csv');
  const participantes = [];

  try {
    // Leer el CSV
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        participantes.push(row);
      })
      .on('end', () => {
        // Mezclar participantes aleatoriamente
        for (let i = participantes.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [participantes[i], participantes[j]] = [participantes[j], participantes[i]];
        }

        // Agrupar en partidas de 4
        const partidas = [];
        for (let i = 0; i < participantes.length; i += 4) {
          const jugadores = participantes.slice(i, i + 4).map(p => p.nombre);
          partidas.push({ partida: partidas.length + 1, jugadores });
        }

        res.json({ mensaje: 'Partidas formadas correctamente', partidas });
      });
  } catch (error) {
    console.error('Error al formar partidas:', error);
    res.status(500).json({ error: 'Error al formar partidas' });
  }
};

module.exports = { formarPartidasFaseUno };
