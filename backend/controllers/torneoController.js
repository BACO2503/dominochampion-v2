// backend/controllers/torneoController.js
const fs = require('fs');
const path = require('path');
const { formarPartidas } = require('../services/Logica');
const {
  guardarGanadorEnCSV,
  leerPartidasDeJSON,
  guardarPartidasEnJSON,
  obtenerAcumuladoFinal,
  guardarRondaFinal,
  generarPodioFinalCSV
} = require('../services/csvService');


// Carga los participantes desde un JSON
exports.cargarParticipantesdesdeJSON = (req, res) => {
  const { participantes } = req.body;
   if (!Array.isArray(participantes)) {
    return res.status(400).json({ error: 'Participantes debe ser un arreglo' });
  }

  const encabezado = 'idParticipante,ap_p,ap_m,nombre\n';
  const contenido = participantes.map(p =>
    `${p.idParticipante},${p.ap_p},${p.ap_m},${p.nombre}`
  ).join('\n');

  const csvCompleto = encabezado + contenido + '\n';
  const filePath = path.join(__dirname, '../data/participantes.csv');

  fs.writeFileSync(filePath, csvCompleto, 'utf-8');

  return res.status(200).json({ mensaje: 'CSV guardado desde JSON exitosamente' });
};

/**
 * 1️⃣ Recibe el CSV de participantes y lo guarda como data/participantes.csv
 */
exports.uploadParticipantes = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo.' });
  }
  const tmpPath = req.file.path; // ejemplo: data/abcd1234
  const destPath = path.join(__dirname, '../data/participantes.csv');

  fs.rename(tmpPath, destPath, (err) => {
    if (err) {
      console.error('Error moviendo CSV de participantes:', err);
      return res.status(500).json({ error: 'No se pudo guardar el CSV.' });
    }
    res.json({ mensaje: 'CSV de participantes subido correctamente.' });
  });
};


/**
 * 2️⃣ Genera (o lee) las partidas para la fase N
 */
exports.getPartidasGeneradas = async (req, res) => {
  try {
    const numFase = Number(req.query.fase) || 1;
    let partidas = leerPartidasDeJSON(numFase);

    if (!partidas) {
      const archivoFuente = numFase > 1
        ? `ganadores_fase${numFase - 1}.csv`
        : 'participantes.csv';
      partidas = await formarPartidas(archivoFuente);
      guardarPartidasEnJSON(partidas, numFase);
    }

    res.json({ partidas });
  } catch (error) {
    console.error('Error al generar partidas:', error);
    res.status(500).json({ error: 'No se pudieron generar las partidas' });
  }
};


/**
 * 3️⃣ Registra un ganador en el CSV de ganadores de la fase
 */
exports.registrarGanador = async (req, res) => {
  const { idGrupo } = req.params;
  const { idParticipanteGanador } = req.body;
  const fase = Number(req.query.fase) || 1;

  if (!idParticipanteGanador) {
    return res.status(400).json({ error: 'ID del ganador es requerido' });
  }

  try {
    const partidas = leerPartidasDeJSON(fase);
    if (!partidas) {
      return res.status(404).json({ error: 'No se han generado las partidas de esta fase.' });
    }
    const partida = partidas.find(p => p.partida == idGrupo);
    if (!partida) {
      return res.status(404).json({ error: 'Partida no encontrada' });
    }

    const ganador = partida.jugadores.find(j => j.idParticipante === idParticipanteGanador);
    if (!ganador) {
      return res.status(404).json({ error: 'Participante no encontrado en el grupo' });
    }

    ganador.grupo = idGrupo;
    guardarGanadorEnCSV(ganador, fase);

    res.json({ mensaje: 'Ganador registrado correctamente', grupo: idGrupo, ganador });
  } catch (error) {
    console.error('Error al registrar el ganador:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};


/**
 * 4️⃣ Controladores de la final (sin cambios)
 */
exports.consultarAcumuladoFinal = (req, res) => {
  try {
    const acumulado = obtenerAcumuladoFinal();
    res.json({ ranking: acumulado });
  } catch (error) {
    console.error('Error al consultar el acumulado final:', error);
    res.status(500).json({ error: 'No se pudo obtener el acumulado final.' });
  }
};

exports.registrarPuntosFinal = (req, res) => {
  const { ronda, puntos } = req.body;
  if (!ronda || !Array.isArray(puntos) || puntos.length === 0) {
    return res.status(400).json({ error: 'Datos de ronda o puntos incompletos.' });
  }
  try {
    guardarRondaFinal(ronda, puntos);
    res.json({ mensaje: 'Puntos registrados correctamente para la ronda final.', ronda, puntos });
  } catch (error) {
    console.error('Error al registrar los puntos de la final:', error);
    res.status(500).json({ error: 'No se pudieron registrar los puntos.' });
  }
};

exports.exportarPodioFinalCSV = (req, res) => {
  try {
    const podio = generarPodioFinalCSV();
    res.json({ mensaje: 'Podio generado correctamente en podio_final.csv', podio });
  } catch (error) {
    console.error('Error al generar el CSV del podio:', error);
    res.status(500).json({ error: 'No se pudo generar el archivo CSV del podio.' });
  }
};

exports.cerrarFaseFinal = (req, res) => {
  const { ronda, puntos } = req.body;

  if (!ronda || !Array.isArray(puntos) || puntos.length === 0) {
    return res.status(400).json({ error: 'Datos incompletos para cerrar la fase final.' });
  }

  try {
    // Guarda la última ronda (por si no se había guardado aún)
    guardarRondaFinal(ronda, puntos);

    // Genera y devuelve el podio (top 3)
    const podio = generarPodioFinalCSV();

    res.json({
      mensaje: 'Fase final cerrada y podio generado correctamente.',
      podio
    });
  } catch (error) {
    console.error('Error al cerrar la fase final:', error);
    res.status(500).json({ error: 'No se pudo cerrar la fase final.' });
  }
};
