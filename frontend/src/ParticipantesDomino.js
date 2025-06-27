import React, { useState, useEffect, useCallback } from "react";

export default function ParticipantesDomino({ esAdmin = true }) {
  const [mesas, setMesas] = useState([]);
  const [ganadores, setGanadores] = useState({});
  const [notificacion, setNotificacion] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(1);

  // 1. Mensajes de notificación memoizados
  const mostrarNotificacion = useCallback((mensaje, tipo = "success") => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  }, []);

  // 2. Función memoizada para cargar mesas de la fase indicada
  const fetchMesasDesdeAPI = useCallback(async (fase) => {
    try {
      const res = await fetch(
        `https://dominochampion-v2.onrender.com/api/torneo/partidas?fase=${fase}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar mesas");
      setMesas(data.partidas || []);
    } catch (err) {
      console.error("Error al obtener mesas:", err);
      mostrarNotificacion(`Error al cargar fase ${fase}`, "error");
    }
  }, [mostrarNotificacion]);

  // 3. Al montar, cargamos la fase 1 (sin warnings de Hooks)
  useEffect(() => {
    fetchMesasDesdeAPI(1);
  }, [fetchMesasDesdeAPI]);

  // 4. Avanzar a la siguiente fase
  const iniciarSiguienteFase = () => {
    const siguiente = currentPhase + 1;
    fetchMesasDesdeAPI(siguiente);
    setCurrentPhase(siguiente);
    setGanadores({});
    mostrarNotificacion(`Fase ${siguiente} iniciada`, "success");
  };

  // 5. Confirmación antes de registrar ganador
  const confirmarYRegistrar = (idMesa, participante) => {
    if (
      !window.confirm(
        `¿Seguro que el ganador de la Mesa ${idMesa} es:\n\n${participante.nombre} (ID: ${participante.idParticipante})?`
      )
    ) {
      mostrarNotificacion("Selección cancelada", "warning");
      return;
    }
    registrarGanador(idMesa, participante.idParticipante);
  };

  // 6. Registro de ganador, incluyendo fase en la consulta
  const registrarGanador = (idMesa, idParticipante) => {
    setGanadores((prev) => ({ ...prev, [idMesa]: idParticipante }));
    fetch(
      `https://dominochampion-v2.onrender.com/api/torneo/ganador/${idMesa}?fase=${currentPhase}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idParticipanteGanador: idParticipante }),
      }
    )
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Respuesta no exitosa");
        mostrarNotificacion("Ganador registrado correctamente", "success");
      })
      .catch((error) => {
        console.error("❌ Error al registrar el ganador:", error);
        mostrarNotificacion("Error al registrar el ganador", "error");
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 p-6 text-white relative">
      {notificacion && (
        <div
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-2xl shadow-lg text-center text-white z-50 ${
            notificacion.tipo === "success"
              ? "bg-green-600"
              : notificacion.tipo === "error"
              ? "bg-red-600"
              : "bg-yellow-500"
          }`}
        >
          {notificacion.mensaje}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-6 uppercase">
          Participantes del Torneo de Dominó
        </h1>

        {esAdmin && (
          <div className="flex justify-center mb-8">
            <button
              onClick={iniciarSiguienteFase}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-700 via-red-900 to-black shadow-lg font-bold uppercase hover:scale-105 transition"
            >
              Iniciar Fase {currentPhase + 1}
            </button>
          </div>
        )}

        <div className="grid gap-10">
          {mesas.map((mesa) => (
            <div
              key={mesa.partida}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow border border-white/20"
            >
              <h2 className="text-3xl font-semibold mb-4 text-center">
                Mesa {mesa.partida}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mesa.jugadores.map((p) => {
                  const esGanador =
                    ganadores[mesa.partida] === p.idParticipante;
                  return (
                    <div
                      key={p.idParticipante}
                      className={`p-4 rounded-xl border shadow-sm cursor-pointer transition ${
                        esGanador
                          ? "border-green-400 bg-green-800/30"
                          : "border-white/10 bg-black/30"
                      }`}
                      onClick={() =>
                        esAdmin && confirmarYRegistrar(mesa.partida, p)
                      }
                    >
                      <p className="font-semibold text-red-300">
                        ID: <span className="text-white">{p.idParticipante}</span>
                      </p>
                      <p>
                        <span className="font-semibold text-red-400">
                          Nombre:
                        </span>{" "}
                        {p.nombre}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
