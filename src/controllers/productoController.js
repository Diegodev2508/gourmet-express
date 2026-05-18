// src/controllers/productoController.js
const { pool } = require('../config/db');

// GET /api/productos
async function getAll(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id_producto, p.nombre, p.descripcion, p.precio,
        p.id_proveedor, pr.nombre AS nombre_proveedor,
        p.created_at
      FROM productos p
      LEFT JOIN proveedores pr USING (id_proveedor)
      ORDER BY p.nombre
    `);

    res.json({ total: rows.length, data: rows });
  } catch (err) { next(err); }
}

// GET /api/productos/:id
async function getById(req, res, next) {
  try {
    const [[row]] = await pool.query(`

        SELECT p.*, pr.nombre AS nombre_proveedor
        FROM productos p
        LEFT JOIN proveedores pr USING (id_proveedor)
        WHERE p.id_producto = ?`,

        [req.params.id]);

    if (!row) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(row);
  } catch (err) { next(err); }
}

// POST /api/productos
async function create(req, res, next) {
  try {
    const { nombre, descripcion, precio, id_proveedor } = req.body;
    if (!nombre || precio == null) {
      return res.status(400).json({ error: 'nombre y precio son obligatorios' });
    }
    const [result] = await pool.query(

      'INSERT INTO productos (nombre, descripcion, precio, id_proveedor) VALUES (?, ?, ?, ?)',

      [nombre, descripcion || null, precio, id_proveedor || null]
    );
    res.status(201).json({ message: 'Producto creado', id_producto: result.insertId });
  } catch (err) { next(err); }
}

// PUT /api/productos/:id
async function update(req, res, next) {
  try {
    const { nombre, descripcion, precio, id_proveedor } = req.body;
    await pool.query(

      `UPDATE productos SET
        nombre       = COALESCE(?, nombre),
        descripcion  = COALESCE(?, descripcion),
        precio       = COALESCE(?, precio),
        id_proveedor = COALESCE(?, id_proveedor)
       WHERE id_producto = ?`,

      [nombre, descripcion, precio, id_proveedor, req.params.id]
    );
    res.json({ message: 'Producto actualizado' });
  } catch (err) { next(err); }
}

// DELETE /api/productos/:id
async function remove(req, res, next) {
  try {
    await pool.query('DELETE FROM productos WHERE id_producto = ?', [req.params.id]);
    res.json({ message: 'Producto eliminado' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, remove };