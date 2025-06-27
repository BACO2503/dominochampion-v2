// server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Rutas
const torneoRoutes = require('./routes/torneoRoutes');
app.use('/api/torneo', torneoRoutes);

// Puerto
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
