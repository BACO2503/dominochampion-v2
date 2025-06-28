// services/logica.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

async function formarPartidas(nombreArchivo = 'participantes.csv') {
  const filePath = path.join(__dirname, '../data/', nombreArchivo);
  const participantes = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Mapea los campos, compatible con ambos tipos de archivo:
        let id =
          (row['Número de expediente'] && /^\d+$/.test(row['Número de expediente']))
            ? row['Número de expediente']
            : row['idParticipante'] || '--';
        let nombre = row['NOMBRE'] || row['nombre'] || '';
        // Solo agrega si hay nombre e id
        if (id && nombre) {
          participantes.push({
            idParticipante: id,
            nombre: nombre
          });
        }
      })
      .on('end', () => {
        // Mezclar aleatoriamente
        for (let i = participantes.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [participantes[i], participantes[j]] = [participantes[j], participantes[i]];
        }
        // Agrupar en partidas de 4
        const partidas = [];
        let numeroPartida = 1;
        let i = 0;

        while (i + 4 <= participantes.length) {
          const grupo = participantes.slice(i, i + 4);
          partidas.push({
            partida: numeroPartida++,
            jugadores: grupo
          });
          i += 4;
        }

        // Casos para 1, 2, o 3 participantes restantes
        const restantes = participantes.length - i;
        if (restantes > 0) {
          const grupo = participantes.slice(i, i + restantes);
          partidas.push({
            partida: numeroPartida++,
            jugadores: grupo
          });
        }

        resolve(partidas);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}



module.exports = {
  formarPartidas
};
