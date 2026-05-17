// src/controllers/proveedorController.js
const { pool } = require('../config/db');

// GET /api/proveedores
async function getAll(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT id_proveedor, nombre, contacto, telefono, ciudad, direccion, created_at
      FROM proveedores
      ORDER BY nombre
    `);
    res.json({ total: rows.length, data: rows });
  } catch (err) { next(err); }
}

// GET /api/proveedores/:id
async function getById(req, res, next) {
  try {
    const [[proveedor]] = await pool.query(
      'SELECT * FROM proveedores WHERE id_proveedor = ?', [req.params.id]
    );
    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(proveedor);
  } catch (err) { next(err); }
}

// POST /api/proveedores
async function create(req, res, next) {
  try {
    const { nombre, contacto, telefono, ciudad, direccion } = req.body;
    if (!nombre || !telefono) {
      return res.status(400).json({ error: 'nombre y telefono son obligatorios' });
    }
    const [result] = await pool.query(
      'INSERT INTO proveedores (nombre, contacto, telefono, ciudad, direccion) VALUES (?, ?, ?, ?, ?)',
      [nombre, contacto || nombre, telefono, ciudad || null, direccion || null]
    );
    res.status(201).json({ message: 'Proveedor creado', id_proveedor: result.insertId });
  } catch (err) { next(err); }
}

// PUT /api/proveedores/:id
async function update(req, res, next) {
  try {
    const { nombre, contacto, telefono, ciudad, direccion } = req.body;
    await pool.query(
      `UPDATE proveedores SET
        nombre    = COALESCE(?, nombre),
        contacto  = COALESCE(?, contacto),
        telefono  = COALESCE(?, telefono),
        ciudad    = COALESCE(?, ciudad),
        direccion = COALESCE(?, direccion)
       WHERE id_proveedor = ?`,
      [nombre, contacto, telefono, ciudad, direccion, req.params.id]
    );
    res.json({ message: 'Proveedor actualizado' });
  } catch (err) { next(err); }
}

// DELETE /api/proveedores/:id
async function remove(req, res, next) {
  try {
    await pool.query('DELETE FROM proveedores WHERE id_proveedor = ?', [req.params.id]);
    res.json({ message: 'Proveedor eliminado' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, remove };