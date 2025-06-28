import React, { useState, useEffect, useCallback, use } from "react";
import { useNavigate } from "react-router-dom";
import PodioFinal from "./PodioFinal"; // Importa el componente del podio final

export default function ParticipantesDomino({ esAdmin = true }) {
  const navigate = useNavigate();
  const [mesas, setMesas] = useState([]);
  const [ganadores, setGanadores] = useState({});
  const [notificacion, setNotificacion] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [faseFinalActiva, setFaseFinalActiva] = useState(false);
  const [mostrarConfirmacionRonda, setMostrarConfirmacionRonda] = useState(false);
  const [podioFinal, setPodioFinal] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [points, setPoints] = useState({});
  const [torneoFinalizado, setTorneoFinalizado] = useState(false);

  useEffect(() => {
    const csvValidado = localStorage.getItem("csvValidado");
    if (!csvValidado) {
      navigate("/");
    }
  }, []);

  
  const mostrarNotificacion = useCallback((mensaje, tipo = "success") => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  }, []);

  const isFinalPhase = (data = mesas) => {
    const total = data.reduce((sum, m) => sum + m.jugadores.length, 0);
    return total > 0 && total <= 12;
  };

  const initPoints = (data) => {
    const p = {};
    data.forEach((mesa) => {
      mesa.jugadores.forEach((j) => {
        p[j.idParticipante] = { 1: 0 };
      });
    });
    setPoints(p);
    setCurrentRound(1);
  };

  const fetchMesas = useCallback(async (fase) => {
    try {
      const res = await fetch(`https://dominochampion-v2.onrender.com/api/torneo/partidas?fase=${fase}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const { partidas } = await res.json();
      setMesas(partidas || []);
      if (!isFinalPhase(partidas)) setFaseFinalActiva(false);
    } catch (err) {
      console.error('fetchMesas error:', err);
      mostrarNotificacion(`No se pudo cargar fase ${fase}`, "error");
    }
  }, [mostrarNotificacion]);

  useEffect(() => {
    fetchMesas(1);

  }, [fetchMesas]);

  const iniciarSiguienteFase = () => {
    if (isFinalPhase(mesas)) {
      const finalPhase = currentPhase + 1;
      fetchMesas(finalPhase);
      setCurrentPhase(finalPhase);
      setFaseFinalActiva(true);
      setGanadores({});
      mostrarNotificacion("Iniciar Partida Final", "success");
    } else {
      const next = currentPhase + 1;
      fetchMesas(next);
      setCurrentPhase(next);
      setGanadores({});
      mostrarNotificacion(`Fase ${next} iniciada`, "success");
    }
  };

  const iniciarSiguienteRonda = () => {
    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);
    setPoints((prev) => {
      const updated = {};
      Object.entries(prev).forEach(([id, rounds]) => {
        updated[id] = { ...rounds, [nextRound]: 0 };
      });
      return updated;
    });
    mostrarNotificacion(`Ronda ${nextRound} iniciada`, "success");
  };

  const terminarFase = async () => {
    const confirm = window.confirm("¿Terminar fase final? Los puntos actuales serán registrados y se mostrará el podio.");
    if (!confirm) return;

    // Arma los puntos actuales de la ronda activa
    const puntosActuales = Object.entries(points).map(([id, rondas]) => {
      const jugador = mesas.flatMap(m => m.jugadores).find(j => j.idParticipante === id);
      return {
        idParticipante: id,
        nombre: jugador?.nombre || '',
        puntos: rondas[currentRound] || 0
      };
    });

    try {
      const res = await fetch("https://dominochampion-v2.onrender.com/api/torneo/final/cerrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ronda: currentRound, puntos: puntosActuales })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFaseFinalActiva(false);
      setPodioFinal(data.podio);
      mostrarNotificacion("Fase final terminada. ¡Mostrando podio! 🎉", "success");
    } catch (error) {
      console.error("Error al cerrar fase:", error);
      mostrarNotificacion("Error al cerrar la fase final", "error");
    }
  };


  const updatePoints = (id, round, value) => {
    setPoints((prev) => ({
      ...prev,
      [id]: { ...prev[id], [round]: parseInt(value) || 0 }
    }));
  };

  const confirmarYRegistrar = (mesaId, player) => {
    if (window.confirm(`¿Ganador Mesa ${mesaId}? ${player.nombre} (ID: ${player.idParticipante})?`)) {
      fetch(`https://dominochampion-v2.onrender.com/api/torneo/ganador/${mesaId}?fase=${currentPhase}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idParticipanteGanador: player.idParticipante })
      })
        .then((res) => {
          if (!res.ok) throw new Error();
          setGanadores((g) => ({ ...g, [mesaId]: player.idParticipante }));
          mostrarNotificacion("Ganador registrado", "success");
        })
        .catch(() => mostrarNotificacion("Error al registrar ganador", "error"));
    } else {
      mostrarNotificacion("Selección cancelada", "warning");
    }
  };

  const handleConfirmarRonda = async () => {
    const puntosActuales = Object.entries(points).map(([id, rondas]) => {
      const jugador = mesas.flatMap(m => m.jugadores).find(j => j.idParticipante === id);
      return {
        idParticipante: id,
        nombre: jugador?.nombre || '',
        puntos: rondas[currentRound] || 0
      };
    });
    try {
      const res = await fetch("http://localhost:3001/api/torneo/final/ronda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puntos: puntosActuales, ronda: currentRound })
      })
      if (!res.ok) throw new Error(`Error al registrar puntos: ${res.status}`);

      iniciarSiguienteRonda(); // Solo avanza si todo sale bien
      setMostrarConfirmacionRonda(false);
    } catch (error) {
      console.error("Error al registrar puntos:", error);
      mostrarNotificacion("Error al registrar puntos", "error");
    }
  };

  if (torneoFinalizado) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-900 via-blue-900 to-red-900 bg-[length:200%_200%] animate-gradient-move-slow bg-[position:0%_0%] p-6 text-white text-center">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-10 max-w-xl w-full">
          <h1 className="text-5xl font-bold mb-6 uppercase">🎉 Torneo Finalizado 🎉</h1>
          <p className="text-lg mb-8 text-white/90">
            ¡Gracias por participar! Esperamos que hayas disfrutado del torneo de dominó.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem("csvValidado");
              window.location.reload();}}
            className="px-6 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold shadow-md transition"
          >
            Volver a iniciar el torneo
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-blue-900 to-red-900 bg-[length:200%_200%] animate-gradient-move-slow bg-[position:0%_0%] p-6 text-white">
      {notificacion && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-2xl shadow-lg text-white z-50 ${notificacion.tipo === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {notificacion.mensaje}
        </div>
      )}

      {mostrarConfirmacionRonda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white text-black rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-300">
            <h2 className="text-xl font-bold mb-3">¿Confirmar nueva ronda?</h2>
            <p className="text-sm text-gray-700 mb-6">
              Una vez iniciada la siguiente ronda, los puntos de la ronda actual <strong>ya no podrán ser modificados</strong>. ¿Deseas continuar?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setMostrarConfirmacionRonda(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarRonda}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-8 uppercase">Participantes Dominó</h1>

        {esAdmin && !faseFinalActiva && (
          <div className="flex justify-center mb-6">
            <button
              onClick={iniciarSiguienteFase}
              className={`px-6 py-3 rounded-2xl shadow-lg font-bold uppercase hover:scale-105 transition ${isFinalPhase() ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white" : "bg-gradient-to-r from-red-700 via-red-900 to-black text-white"}`}
            >
              {isFinalPhase() ? "Iniciar Partida Final" : `Iniciar Fase ${currentPhase + 1}`}
            </button>
          </div>
        )}

        {faseFinalActiva ? (
          <div className="space-y-6">
            {esAdmin && (
              <div className="flex justify-center gap-4 mb-4">
                <button
                  onClick={() => setMostrarConfirmacionRonda(true)}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-2xl text-white font-bold transition"
                >
                  Iniciar siguiente ronda
                </button>
                <button
                  onClick={terminarFase}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-2xl text-white font-bold transition"
                >
                  Terminar Fase
                </button>
              </div>
            )}
            <div className="overflow-x-auto bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/20">
              <table className="min-w-full text-white">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Jugador (ID)</th>
                    {Array.from({ length: currentRound }).map((_, i) => (
                      <th key={i} className="px-4 py-2 text-center">Puntos Ronda {i + 1}</th>
                    ))}
                    <th className="px-4 py-2 text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {mesas.flatMap((m) => m.jugadores)
                    .sort((a, b) => a.nombre.localeCompare(b.nombre))
                    .map((jugador) => {
                      const rounds = points[jugador.idParticipante] || {};
                      const total = Object.values(rounds).reduce((s, v) => s + v, 0);
                      return (
                        <tr key={jugador.idParticipante} className="border-b border-white/20">
                          <td className="px-4 py-2">
                            {jugador.nombre} ({jugador.idParticipante})
                          </td>
                          {Array.from({ length: currentRound }).map((_, i) => (
                            <td key={i} className="px-4 py-2 text-center">
                              {esAdmin ? (
                                <input
                                  type="number"
                                  min="0"
                                  value={rounds[i + 1] ?? 0}
                                  disabled={i + 1 !== currentRound}
                                  onChange={(e) =>
                                    updatePoints(jugador.idParticipante, i + 1, e.target.value)
                                  }
                                  className={`w-16 p-1 border rounded text-center focus:outline-none ${i + 1 !== currentRound
                                    ? "bg-gray-600/40 text-white/50 cursor-not-allowed"
                                    : "bg-black/30 border-white/20"
                                    }`}
                                />
                              ) : (
                                rounds[i + 1] ?? 0
                              )}
                            </td>
                          ))}
                          <td className="px-4 py-2 text-center font-bold">{total}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid gap-10">
            {mesas.map((mesa) => (
              <div
                key={mesa.partida}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/20"
              >
                <h2 className="text-3xl font-semibold mb-4 text-center">Mesa {mesa.partida}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mesa.jugadores.map((p) => {
                    const isWinner = ganadores[mesa.partida] === p.idParticipante;
                    return (
                      <div
                        key={p.idParticipante}
                        className={`p-4 rounded-xl border shadow-sm cursor-pointer transition ${isWinner ? "border-green-400 bg-green-800/30" : "border-white/10 bg-black/30"}`}
                        onClick={() => esAdmin && confirmarYRegistrar(mesa.partida, p)}
                      >
                        <p className="font-semibold text-red-300">
                          ID: <span className="text-white">{p.idParticipante}</span>
                        </p>
                        <p>
                          <span className="font-semibold text-red-400">Nombre:</span> {p.nombre}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {podioFinal && (
        <PodioFinal podio={podioFinal} onCerrar={() => {
          setPodioFinal(null);
          setTorneoFinalizado(true);
        }} />

      )}

    </div>
  );
}
