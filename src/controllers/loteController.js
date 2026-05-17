// src/controllers/loteController.js
const { pool } = require('../config/db');

// GET /api/lotes
async function getAll(req, res, next) {
  try {
    const { id_producto, id_almacen } = req.query;
    let sql = `
      SELECT
        l.id_lote, l.cantidad, l.fecha_ingreso, l.fecha_vencimiento,
        DATEDIFF(l.fecha_vencimiento, CURDATE()) AS dias_para_vencer,
        l.id_producto, p.nombre AS nombre_producto,
        l.id_almacen, a.nombre AS nombre_almacen
      FROM lotes l
      JOIN productos p USING (id_producto)
      JOIN almacenes a USING (id_almacen)
      WHERE 1=1
    `;
    const params = [];
    if (id_producto) { sql += ' AND l.id_producto = ?'; params.push(id_producto); }
    if (id_almacen)  { sql += ' AND l.id_almacen = ?';  params.push(id_almacen); }
    sql += ' ORDER BY l.fecha_ingreso DESC';

    const [rows] = await pool.query(sql, params);
    res.json({ total: rows.length, data: rows });
  } catch (err) { next(err); }
}

// GET /api/lotes/:id
async function getById(req, res, next) {
  try {
    const [[row]] = await pool.query(`
      SELECT l.*,
        DATEDIFF(l.fecha_vencimiento, CURDATE()) AS dias_para_vencer,
        p.nombre AS nombre_producto,
        a.nombre AS nombre_almacen
      FROM lotes l
      JOIN productos p USING (id_producto)
      JOIN almacenes a USING (id_almacen)
      WHERE l.id_lote = ?
    `, [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Lote no encontrado' });
    res.json(row);
  } catch (err) { next(err); }
}

// POST /api/lotes
async function create(req, res, next) {
  try {
    const { fecha_ingreso, fecha_vencimiento, id_producto, id_almacen, cantidad } = req.body;
    if (!id_producto || !id_almacen || !cantidad) {
      return res.status(400).json({ error: 'id_producto, id_almacen y cantidad son obligatorios' });
    }
    const [result] = await pool.query(
      'INSERT INTO lotes (fecha_ingreso, fecha_vencimiento, id_producto, id_almacen, cantidad) VALUES (?, ?, ?, ?, ?)',
      [fecha_ingreso || new Date().toISOString().split('T')[0], fecha_vencimiento || null, id_producto, id_almacen, cantidad]
    );
    res.status(201).json({ message: 'Lote creado', id_lote: result.insertId });
  } catch (err) { next(err); }
}

// PUT /api/lotes/:id
async function update(req, res, next) {
  try {
    const { fecha_ingreso, fecha_vencimiento, id_producto, id_almacen, cantidad } = req.body;
    await pool.query(
      `UPDATE lotes SET
        fecha_ingreso     = COALESCE(?, fecha_ingreso),
        fecha_vencimiento = COALESCE(?, fecha_vencimiento),
        id_producto       = COALESCE(?, id_producto),
        id_almacen        = COALESCE(?, id_almacen),
        cantidad          = COALESCE(?, cantidad)
       WHERE id_lote = ?`,
      [fecha_ingreso, fecha_vencimiento, id_producto, id_almacen, cantidad, req.params.id]
    );
    res.json({ message: 'Lote actualizado' });
  } catch (err) { next(err); }
}

// DELETE /api/lotes/:id
async function remove(req, res, next) {
  try {
    await pool.query('DELETE FROM lotes WHERE id_lote = ?', [req.params.id]);
    res.json({ message: 'Lote eliminado' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, remove };