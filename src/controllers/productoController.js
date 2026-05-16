// src/controllers/productoController.js
const { pool } = require('../config/db');

// GET /api/productos — Listar con nombre del proveedor
async function getAll(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.id_producto,
        p.nombre_producto,
        p.descripcion,
        p.precio_unitario,
        p.id_proveedor,
        pr.nombre_proveedor
      FROM producto p
      JOIN proveedor pr USING (id_proveedor)
      ORDER BY p.nombre_producto
    `);
    res.json({ total: rows.length, data: rows });
  } catch (err) { next(err); }
}

// GET /api/productos/:id
async function getById(req, res, next) {
  try {
    const [[row]] = await pool.query(`
      SELECT p.*, pr.nombre_proveedor
      FROM producto p
      JOIN proveedor pr USING (id_proveedor)
      WHERE p.id_producto = ?
    `, [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(row);
  } catch (err) { next(err); }
}

// POST /api/productos
async function create(req, res, next) {
  try {
    const { nombre_producto, descripcion, precio_unitario, id_proveedor } = req.body;

    if (!nombre_producto || precio_unitario == null || !id_proveedor) {
      return res.status(400).json({ error: 'nombre_producto, precio_unitario e id_proveedor son obligatorios' });
    }

    const [result] = await pool.query(
      'INSERT INTO producto (nombre_producto, descripcion, precio_unitario, id_proveedor) VALUES (?, ?, ?, ?)',
      [nombre_producto, descripcion || null, precio_unitario, id_proveedor]
    );
    res.status(201).json({ message: 'Producto creado', id_producto: result.insertId });
  } catch (err) { next(err); }
}

// PUT /api/productos/:id
async function update(req, res, next) {
  try {
    const { nombre_producto, descripcion, precio_unitario, id_proveedor } = req.body;
    await pool.query(
      `UPDATE producto SET
        nombre_producto = COALESCE(?, nombre_producto),
        descripcion     = COALESCE(?, descripcion),
        precio_unitario = COALESCE(?, precio_unitario),
        id_proveedor    = COALESCE(?, id_proveedor)
       WHERE id_producto = ?`,
      [nombre_producto, descripcion, precio_unitario, id_proveedor, req.params.id]
    );
    res.json({ message: 'Producto actualizado' });
  } catch (err) { next(err); }
}

// DELETE /api/productos/:id
async function remove(req, res, next) {
  try {
    await pool.query('DELETE FROM producto WHERE id_producto = ?', [req.params.id]);
    res.json({ message: 'Producto eliminado' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, remove };
