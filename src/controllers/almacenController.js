// src/controllers/almacenController.js
const { pool } = require('../config/db');

// GET /api/almacenes — Con conteo de lotes activos
async function getAll(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT
        a.id_almacen,
        a.nombre,
        a.ubicacion,
        COUNT(l.id_lote) AS total_lotes
      FROM almacenes a
      LEFT JOIN lotes l USING (id_almacen)
      GROUP BY a.id_almacen
      ORDER BY a.nombre
    `);
    res.json({ total: rows.length, data: rows });
  } catch (err) { next(err); }
}

// GET /api/almacenes/:id — Con detalle de lotes
async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const [[almacen]] = await pool.query(
      'SELECT * FROM almacenes WHERE id_almacen = ?', [id]
    );
    if (!almacen) return res.status(404).json({ error: 'Almacén no encontrado' });

    const [lotes] = await pool.query(`
      SELECT l.id_lote, l.fecha_ingreso, l.fecha_vencimiento,
             l.dias_para_vencer, p.nombre AS nombre_producto
      FROM lotes l
      JOIN productos p USING (id_producto)
      WHERE l.id_almacen = ?
      ORDER BY l.fecha_vencimiento
    `, [id]);

    res.json({ ...almacen, lotes });
  } catch (err) { next(err); }
}

// POST /api/almacenes
async function create(req, res, next) {
  try {
    const { nombre, ubicacion } = req.body;
    if (!nombre || !ubicacion) {
      return res.status(400).json({ error: 'nombre y ubicacion son obligatorios' });
    }
    const [result] = await pool.query(
      'INSERT INTO almacenes (nombre, ubicacion) VALUES (?, ?)',
      [nombre, ubicacion]
    );
    res.status(201).json({ message: 'Almacén creado', id_almacen: result.insertId });
  } catch (err) { next(err); }
}

// PUT /api/almacenes/:id
async function update(req, res, next) {
  try {
    const { nombre, ubicacion } = req.body;
    await pool.query(
      `UPDATE almacenes SET
        nombre    = COALESCE(?, nombre),
        ubicacion = COALESCE(?, ubicacion)
       WHERE id_almacen = ?`,
      [nombre, ubicacion, req.params.id]
    );
    res.json({ message: 'Almacén actualizado' });
  } catch (err) { next(err); }
}

// DELETE /api/almacenes/:id
async function remove(req, res, next) {
  try {
    await pool.query('DELETE FROM almacenes WHERE id_almacen = ?', [req.params.id]);
    res.json({ message: 'Almacén eliminado' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, remove };