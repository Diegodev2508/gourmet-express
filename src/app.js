// src/app.js — Punto de entrada principal
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});
const express      = require('express');
const cors         = require('cors');
const { testConnection } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Rutas
const proveedorRoutes = require('./routes/proveedorRoutes');
const productoRoutes  = require('./routes/productoRoutes');
const almacenRoutes   = require('./routes/almacenRoutes');
const loteRoutes      = require('./routes/loteRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares globales ─────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Rutas de la API ──────────────────────────────────────────
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/productos',   productoRoutes);
app.use('/api/almacenes',   almacenRoutes);
app.use('/api/lotes',       loteRoutes);

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Ruta raíz → sirve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Health check
app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// 404
app.use((req, res) =>
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada` })
);

// Manejador global de errores (siempre al final)
app.use(errorHandler);

// ── Iniciar servidor ─────────────────────────────────────────
async function start() {
  try {
    await testConnection(); // Si falla, entra al catch
    app.listen(PORT, () => {
      console.log(`Gourmet Express API corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la BD. Servidor no iniciado.', error);
    process.exit(1); // Para el proceso limpiamente
  }
}

start();
