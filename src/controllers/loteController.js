// src/controllers/loteController.js
const { pool } = require('../config/db');

// GET /api/lotes — Con info de producto y almacén
async function getAll(req, res, next) {
  try {
    // Filtros opcionales por query string: ?id_producto=1 | ?id_almacen=2 | ?vencidos=true
    const { id_producto, id_almacen, vencidos } = req.query;
    let sql = `
      SELECT
        l.id_lote,
        l.fecha_ingreso,
        l.fecha_vencimiento,
        l.dias_para_vencer,
        l.id_producto,
        p.nombre_producto,
        l.id_almacen,
        a.nombre_almacen
      FROM lote l
      JOIN producto p USING (id_producto)
      JOIN almacen  a USING (id_almacen)
      WHERE 1=1
    `;
    const params = [];

    if (id_producto) { sql += ' AND l.id_producto = ?'; params.push(id_producto); }
    if (id_almacen)  { sql += ' AND l.id_almacen  = ?'; params.push(id_almacen);  }
    if (vencidos === 'true') {
      sql += ' AND l.fecha_vencimiento < CURDATE()';
    } else if (vencidos === 'false') {
      sql += ' AND l.fecha_vencimiento >= CURDATE()';
    }

    sql += ' ORDER BY l.fecha_vencimiento';

    const [rows] = await pool.query(sql, params);
    res.json({ total: rows.length, data: rows });
  } catch (err) { next(err); }
}

// GET /api/lotes/:id
async function getById(req, res, next) {
  try {
    const [[row]] = await pool.query(`
      SELECT l.*, p.nombre_producto, a.nombre_almacen
      FROM lote l
      JOIN producto p USING (id_producto)
      JOIN almacen  a USING (id_almacen)
      WHERE l.id_lote = ?
    `, [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Lote no encontrado' });
    res.json(row);
  } catch (err) { next(err); }
}

// GET /api/lotes/proximos-vencer — Lotes que vencen en los próximos N días
async function proximosVencer(req, res, next) {
  try {
    const dias = parseInt(req.query.dias) || 30;
    const [rows] = await pool.query(`
      SELECT l.*, p.nombre_producto, a.nombre_almacen
      FROM lote l
      JOIN producto p USING (id_producto)
      JOIN almacen  a USING (id_almacen)
      WHERE l.fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY l.fecha_vencimiento
    `, [dias]);
    res.json({ dias_consultados: dias, total: rows.length, data: rows });
  } catch (err) { next(err); }
}

// POST /api/lotes
async function create(req, res, next) {
  try {
    const { fecha_ingreso, fecha_vencimiento, id_producto, id_almacen } = req.body;
    if (!fecha_ingreso || !fecha_vencimiento || !id_producto || !id_almacen) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    if (new Date(fecha_vencimiento) < new Date(fecha_ingreso)) {
      return res.status(400).json({ error: 'La fecha de vencimiento no puede ser anterior a la de ingreso' });
    }
    const [result] = await pool.query(
      'INSERT INTO lote (fecha_ingreso, fecha_vencimiento, id_producto, id_almacen) VALUES (?, ?, ?, ?)',
      [fecha_ingreso, fecha_vencimiento, id_producto, id_almacen]
    );
    res.status(201).json({ message: 'Lote creado', id_lote: result.insertId });
  } catch (err) { next(err); }
}

// PUT /api/lotes/:id
async function update(req, res, next) {
  try {
    const { fecha_ingreso, fecha_vencimiento, id_producto, id_almacen } = req.body;
    await pool.query(
      `UPDATE lote SET
        fecha_ingreso     = COALESCE(?, fecha_ingreso),
        fecha_vencimiento = COALESCE(?, fecha_vencimiento),
        id_producto       = COALESCE(?, id_producto),
        id_almacen        = COALESCE(?, id_almacen)
       WHERE id_lote = ?`,
      [fecha_ingreso, fecha_vencimiento, id_producto, id_almacen, req.params.id]
    );
    res.json({ message: 'Lote actualizado' });
  } catch (err) { next(err); }
}

// DELETE /api/lotes/:id
async function remove(req, res, next) {
  try {
    await pool.query('DELETE FROM lote WHERE id_lote = ?', [req.params.id]);
    res.json({ message: 'Lote eliminado' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, remove, proximosVencer };
