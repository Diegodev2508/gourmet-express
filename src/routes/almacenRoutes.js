// src/routes/almacenRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET - Obtener todos los almacenes
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM almacenes ORDER BY nombre');
    res.json({ total: rows.length, data: rows });
  } catch (error) {
    console.error('Error al obtener almacenes:', error);
    res.status(500).json({ error: 'Error en la base de datos' });
  }
});

// POST - Registrar nuevo almacén
router.post('/', async (req, res) => {
  const { nombre, ubicacion, capacidad_m3 } = req.body;
  if (!nombre || !ubicacion) {
    return res.status(400).json({ error: 'nombre y ubicacion son obligatorios' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO almacenes (nombre, ubicacion, capacidad_m3) VALUES (?, ?, ?)',
      [nombre, ubicacion, capacidad_m3 || null]
    );
    res.status(201).json({
      id_almacen: result.insertId,
      nombre,
      ubicacion,
      capacidad_m3,
      message: 'Almacén registrado con éxito'
    });
  } catch (error) {
    console.error('Error al registrar almacén:', error);
    res.status(500).json({ error: 'Error al guardar en la base de datos' });
  }
});

// PUT - Actualizar almacén
router.put('/:id', async (req, res) => {
  const { nombre, ubicacion, capacidad_m3 } = req.body;
  try {
    await pool.query(
      'UPDATE almacenes SET nombre = COALESCE(?, nombre), ubicacion = COALESCE(?, ubicacion), capacidad_m3 = ? WHERE id_almacen = ?',
      [nombre, ubicacion, capacidad_m3 ?? null, req.params.id]
    );
    res.json({ message: 'Almacén actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

// DELETE - Eliminar almacén
router.delete('/:id', async (req, res) => {
  try {
    // Verificar si tiene lotes asociados
    const [lotes] = await pool.query(
      'SELECT COUNT(*) AS total FROM lotes WHERE id_almacen = ?', 
      [req.params.id]
    );

    if (lotes[0].total > 0) {
      return res.status(400).json({ 
        error: `No se puede eliminar: este almacén tiene ${lotes[0].total} lote(s) asociado(s). Elimina los lotes primero.` 
      });
    }

    await pool.query('DELETE FROM almacenes WHERE id_almacen = ?', [req.params.id]);
    res.json({ message: 'Almacén eliminado' });
  } catch (error) {
    console.error('Error al eliminar almacén:', error);
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

module.exports = router;