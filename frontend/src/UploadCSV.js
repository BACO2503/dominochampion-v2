// src/UploadParticipantes.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UploadParticipantes() {
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!archivo) {
      setMensaje("Por favor selecciona un archivo CSV.");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivo);

    try {
      const res = await fetch("https://dominochampion-v2.onrender.com/api/participantes/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.mensaje === "Archivo CSV subido y validado correctamente") {
        setMensaje("Archivo subido correctamente");
        localStorage.setItem("csvValidado", "true");
        navigate("/torneo");
      } else {
        setMensaje(data.error || "Error al subir el archivo.");
      }
    } catch (error) {
      console.error("Error al subir:", error);
      setMensaje("Error de red al subir el archivo.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-blue-900 to-red-900 bg-[length:200%_200%] animate-gradient-move-slow bg-[position:0%_0%] p-6 text-white flex flex-col items-center justify-center text-center">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-10 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 uppercase">Subir participantes del torneo</h1>

        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="mb-4 block w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />

        <button
          onClick={handleUpload}
          className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full shadow transition"
        >
          Subir archivo
        </button>

        {mensaje && (
          <p className="mt-4 text-red-400">{mensaje}</p>
        )}
      </div>
    </div>
  );

}
