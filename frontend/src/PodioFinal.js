import React from "react";

export default function PodioFinal({ podio, onCerrar }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl p-8 rounded-t-3xl bg-gradient-to-br from-black via-red-900 to-blue-900 animate-gradient-move-slow bg-[length:200%_200%] shadow-xl text-white">
        <h2 className="text-3xl font-bold text-center mb-8 uppercase">🏆 Podio Final del Torneo 🏆</h2>

        <div className="grid grid-cols-3 gap-6 items-end justify-items-center">
          {/* Segundo lugar */}
          <div className="flex flex-col items-center animate-rise-up delay-200">
            <div className="h-36 w-28 bg-blue-600 rounded-t-xl flex flex-col items-center justify-center shadow-lg p-2">
              <span className="text-xl font-bold text-white text-center">{podio[1]?.nombre || "---"}</span>
              <span className="text-sm text-blue-100 font-semibold mt-1">{podio[1]?.total ?? 0} pts</span>
            </div>
            <span className="mt-2 font-semibold text-blue-300">2º Lugar</span>
          </div>

          {/* Primer lugar */}
          <div className="flex flex-col items-center animate-rise-up delay-100">
            <div className="h-48 w-32 bg-green-600 rounded-t-xl flex flex-col items-center justify-center shadow-lg p-2">
              <span className="text-2xl font-bold text-white text-center">{podio[0]?.nombre || "---"}</span>
              <span className="text-base text-green-100 font-semibold mt-1">{podio[0]?.total ?? 0} pts</span>
            </div>
            <span className="mt-2 font-semibold text-green-300">1º Lugar</span>
          </div>

          {/* Tercer lugar */}
          <div className="flex flex-col items-center animate-rise-up delay-300">
            <div className="h-28 w-24 bg-orange-500 rounded-t-xl flex flex-col items-center justify-center shadow-lg p-2">
              <span className="text-lg font-bold text-white text-center">{podio[2]?.nombre || "---"}</span>
              <span className="text-sm text-orange-100 font-semibold mt-1">{podio[2]?.total ?? 0} pts</span>
            </div>
            <span className="mt-2 font-semibold text-orange-300">3º Lugar</span>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={onCerrar}
            className="px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition"
          >
            Cerrar podio
          </button>
        </div>
      </div>
    </div>
  );
}
