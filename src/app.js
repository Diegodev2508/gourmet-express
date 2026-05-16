// src/app.js — Punto de entrada principal
require('dotenv').config();
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
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀  Gourmet Express API corriendo en http://localhost:${PORT}`);
    console.log(`📋  Endpoints disponibles:`);
    console.log(`    GET  /api/health`);
    console.log(`    CRUD /api/proveedores`);
    console.log(`    CRUD /api/productos`);
    console.log(`    CRUD /api/almacenes`);
    console.log(`    CRUD /api/lotes`);
    console.log(`    GET  /api/lotes/proximos-vencer?dias=30`);
  });
}

start();
