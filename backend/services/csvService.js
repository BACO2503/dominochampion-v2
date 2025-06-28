// backend/services/csvService.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Guarda partidas en un archivo JSON para la fase indicada
function guardarPartidasEnJSON(partidas, fase) {
  const archivo = path.join(__dirname, `../data/partidas_fase${fase}.json`);
  fs.writeFileSync(archivo, JSON.stringify(partidas, null, 2), 'utf-8');
}

// Lee partidas desde el archivo JSON para la fase indicada
function leerPartidasDeJSON(fase) {
  const archivo = path.join(__dirname, `../data/partidas_fase${fase}.json`);
  if (fs.existsSync(archivo)) {
    const data = fs.readFileSync(archivo, 'utf-8');
    return JSON.parse(data);
  }
  return null;
}

function guardarGanadorEnCSV(ganador, fase = 1) {
  const archivo = path.join(__dirname, `../data/ganadores_fase${fase}.csv`);
  const encabezado = 'idParticipante,nombre,grupo\n';
  let ganadores = [];

  if (fs.existsSync(archivo)) {
    const contenido = fs.readFileSync(archivo, 'utf-8').split('\n').filter(line => line.trim() !== '');
    ganadores = contenido
      .slice(1)
      .map(l => l.split(','))
      .filter(arr => arr.length >= 3 && arr[2] !== String(ganador.grupo));
  }

  ganadores.push([
    ganador.idParticipante,
    ganador.nombre,
    ganador.grupo
  ]);

  const filas = ganadores.map(arr => arr.join(','));
  const csvCompleto = [encabezado.trim(), ...filas].join('\n') + '\n';
  fs.writeFileSync(archivo, csvCompleto, 'utf-8');
}


function obtenerAcumuladoFinal() {
  const archivo = path.join(__dirname, '../data/final.json');
  if (!fs.existsSync(archivo)) return [];

  const data = JSON.parse(fs.readFileSync(archivo, 'utf-8'));
  const acumulado = {};

  // Suma puntos por idParticipante
  data.rondas.forEach(ronda => {
    ronda.puntos.forEach(jugador => {
      const id = jugador.idParticipante;
      if (!acumulado[id]) {
        acumulado[id] = {
          idParticipante: id,
          nombre: jugador.nombre,
          total: 0
        };
      }
      acumulado[id].total += Number(jugador.puntos);
    });
  });

  // Devuelve un array ordenado de mayor a menor
  return Object.values(acumulado).sort((a, b) => b.total - a.total);
}

/*
 * Guarda o actualiza los puntos de una ronda de la final en final.json.
 * Si la ronda ya existe, la sobreescribe; si no, la agrega.
 * @param {number} ronda - El número de la ronda (ejemplo: 1, 2, 3, ...)
 * @param {Array} puntos - Array de objetos {idParticipante, nombre, puntos}
 */
function guardarRondaFinal(ronda, puntos) {
  const archivo = path.join(__dirname, '../data/final.json');
  let data = { rondas: [] };

  // Si ya existe el archivo, lo leemos
  if (fs.existsSync(archivo)) {
    data = JSON.parse(fs.readFileSync(archivo, 'utf-8'));
  }

  // Buscar si ya existe la ronda (para sobreescribir)
  const idx = data.rondas.findIndex(r => r.numero === ronda);
  if (idx !== -1) {
    data.rondas[idx] = { numero: ronda, puntos };
  } else {
    data.rondas.push({ numero: ronda, puntos });
  }

  // Guardar archivo actualizado
  fs.writeFileSync(archivo, JSON.stringify(data, null, 2), 'utf-8');
}

function generarPodioFinalCSV() {
  const path = require('path');
  const fs = require('fs');
  const archivoCSV = path.join(__dirname, '../data/podio_final.csv');

  // Usamos tu función de acumulado final
  const ranking = obtenerAcumuladoFinal();

  // Nos quedamos con top 3
  const podio = ranking.slice(0, 3);

  // Armamos el contenido del CSV
  let contenido = 'Lugar,ID,Nombre,Puntos\n';
  podio.forEach((jugador, idx) => {
    contenido += `${idx + 1},${jugador.idParticipante},${jugador.nombre},${jugador.total}\n`;
  });

  // Guardamos el archivo
  fs.writeFileSync(archivoCSV, contenido, 'utf-8');
  return podio; // Por si quieres devolver el top 3 en el endpoint
}

function reiniciarFinalJSON() {
  const archivo = path.join(__dirname, '../data/final.json');
  const dataVacia = { rondas: [] };
  fs.writeFileSync(archivo, JSON.stringify(dataVacia, null, 2), 'utf-8');
}


module.exports = 
{ leerPartidasDeJSON, 
  guardarPartidasEnJSON,
  guardarGanadorEnCSV,
  obtenerAcumuladoFinal,
  guardarRondaFinal,
  generarPodioFinalCSV,
  reiniciarFinalJSON};
