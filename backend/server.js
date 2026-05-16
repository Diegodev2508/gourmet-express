// =====================================================
// Gourmet Express - API REST (Node.js + Express)
// Base de datos: MySQL
// Puerto: 3000
// =====================================================

// ===== IMPORTACIONES =====
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// ===== RUTAS =====
const proveedorRoutes = require('../src/routes/proveedorRoutes');
const productoRoutes  = require('../src/routes/productoRoutes');
const almacenRoutes   = require('../src/routes/almacenRoutes');
const loteRoutes      = require('../src/routes/loteRoutes');

// ===== APP =====
const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// ===== RUTAS API =====
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/almacenes', almacenRoutes);
app.use('/api/lotes', loteRoutes);

// ===== RUTA PRINCIPAL =====
app.get('/', (req, res) => {
  res.json({
    mensaje: 'Gourmet Express API funcionando ✅',
    version: '1.0.0'
  });
});

// ===== INICIAR SERVIDOR =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});