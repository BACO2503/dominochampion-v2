const path = require('path');
const { leerPartidasDeJSON, guardarGanadorEnCSV } = require('../services/csvService');

const fase = 3; // Cambia el número de fase si lo necesitas

const partidas = leerPartidasDeJSON(fase);

if (!partidas) {
  console.error('No hay partidas generadas para la fase', fase);
  process.exit(1);
}

partidas.forEach(partida => {
  // Selecciona automáticamente al primer jugador como ganador
  const ganador = partida.jugadores[0];
  ganador.grupo = partida.partida;
  guardarGanadorEnCSV(ganador, fase);
});

console.log('Ganadores registrados automáticamente para todas las partidas de la fase', fase);
