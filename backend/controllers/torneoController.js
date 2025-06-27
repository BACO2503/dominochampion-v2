// controllers/torneoController.js

const path = require('path'); // ← IMPORTAR path AQUÍ
const { formarPartidas } = require('../services/Logica');
const {
  guardarGanadorEnCSV,
  leerPartidasDeJSON,
  guardarPartidasEnJSON,
  obtenerAcumuladoFinal,
  guardarRondaFinal,
  generarPodioFinalCSV
} = require('../services/csvService');

const registrarGanador = async (req, res) => {
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

const getPartidasGeneradas = async (req, res) => {
  try {
    const numFase = Number(req.query.fase) || 1;
    let partidas = leerPartidasDeJSON(numFase);

    if (!partidas) {
      // Solo el NOMBRE del CSV, no ruta absoluta
      const archivoFuente =
        numFase > 1
          ? `ganadores_fase${numFase - 1}.csv`
          : 'participantes.csv';

      // formamos la ruta interna dentro de tu servicio Logica
      partidas = await formarPartidas(archivoFuente);
      guardarPartidasEnJSON(partidas, numFase);
    }

    res.json({ partidas });
  } catch (error) {
    console.error('Error al generar partidas:', error);
    res.status(500).json({ error: 'No se pudieron generar las partidas' });
  }
};


const consultarAcumuladoFinal = (req, res) => {
  try {
    const acumulado = obtenerAcumuladoFinal();
    res.json({ ranking: acumulado });
  } catch (error) {
    console.error('Error al consultar el acumulado final:', error);
    res.status(500).json({ error: 'No se pudo obtener el acumulado final.' });
  }
};

const registrarPuntosFinal = (req, res) => {
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

const exportarPodioFinalCSV = (req, res) => {
  try {
    const podio = generarPodioFinalCSV();
    res.json({ mensaje: 'Podio generado correctamente en podio_final.csv', podio });
  } catch (error) {
    console.error('Error al generar el CSV del podio:', error);
    res.status(500).json({ error: 'No se pudo generar el archivo CSV del podio.' });
  }
};

module.exports = {
  getPartidasGeneradas,
  registrarGanador,
  consultarAcumuladoFinal,
  registrarPuntosFinal,
  exportarPodioFinalCSV
};
