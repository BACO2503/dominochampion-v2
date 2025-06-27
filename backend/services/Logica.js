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
        participantes.push(row);
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
            jugadores: grupo.map(p => ({
               idParticipante: p.idParticipante,
                ap_p: p.ap_p,
                ap_m: p.ap_m,
                nombre: p.nombre
            }))
          });
          i += 4;
        }

        const restantes = participantes.length - i;

if (restantes === 1) {
  // Tomamos 2 jugadores de una partida de 4 para formar una de 3 con el sobrante
  const partidaAjustada = partidas.find(p => p.jugadores.length === 4);
  if (partidaAjustada) {
    // Extraemos 2 jugadores
    const extraidos = partidaAjustada.jugadores.splice(0, 2);
    // Creamos la partida de 3 (2 extraídos + el sobrante)
    partidas.push({
      partida: numeroPartida++,
      jugadores: [
        ...extraidos,
        {
          idParticipante: participantes[i].idParticipante,
          ap_p: participantes[i].ap_p,
          ap_m: participantes[i].ap_m,
          nombre: participantes[i].nombre
        }
      ]
    });
  } else {
    // Como último recurso, partida de 1 (solo debe pasar si hay 1 participante total)
    partidas.push({
      partida: numeroPartida++,
      jugadores: [{
        idParticipante: participantes[i].idParticipante,
          ap_p: participantes[i].ap_p,
          ap_m: participantes[i].ap_m,
          nombre: participantes[i].nombre
      }]
    });
  }
} else if (restantes === 2) {
  // Formamos una partida de 2
  const grupo = participantes.slice(i, i + 2);
  partidas.push({
    partida: numeroPartida++,
    jugadores: grupo.map(p => ({
      idParticipante: p.idParticipante,
      ap_p: p.ap_p,
      ap_m: p.ap_m,
      nombre: p.nombre
    }))
  });
} else if (restantes === 3) {
  // Formamos una partida de 3
  const grupo = participantes.slice(i, i + 3);
  partidas.push({
    partida: numeroPartida++,
    jugadores: grupo.map(p => ({
      idParticipante: p.idParticipante,
      ap_p: p.ap_p,
      ap_m: p.ap_m,
      nombre: p.nombre
    }))

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
