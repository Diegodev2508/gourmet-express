// src/controllers/proveedorController.js
const { pool } = require('../config/db');

// GET /api/proveedores — Listar todos con sus teléfonos
async function getAll(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.id_proveedor,
        p.nombre_proveedor,
        p.dir_ciudad,
        p.dir_calle,
        GROUP_CONCAT(t.telefono ORDER BY t.id_telefono SEPARATOR ', ') AS telefonos
      FROM proveedor p
      LEFT JOIN proveedor_telefono t USING (id_proveedor)
      GROUP BY p.id_proveedor
      ORDER BY p.nombre_proveedor
    `);
    res.json({ total: rows.length, data: rows });
  } catch (err) { next(err); }
}

// GET /api/proveedores/:id
async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const [[proveedor]] = await pool.query(
      'SELECT * FROM proveedor WHERE id_proveedor = ?', [id]
    );
    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });

    const [telefonos] = await pool.query(
      'SELECT id_telefono, telefono FROM proveedor_telefono WHERE id_proveedor = ?', [id]
    );
    res.json({ ...proveedor, telefonos });
  } catch (err) { next(err); }
}

// POST /api/proveedores — Crear proveedor + teléfonos
async function create(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { nombre_proveedor, dir_ciudad, dir_calle, telefonos = [] } = req.body;

    if (!nombre_proveedor || !dir_ciudad || !dir_calle) {
      return res.status(400).json({ error: 'nombre_proveedor, dir_ciudad y dir_calle son obligatorios' });
    }

    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO proveedor (nombre_proveedor, dir_ciudad, dir_calle) VALUES (?, ?, ?)',
      [nombre_proveedor, dir_ciudad, dir_calle]
    );
    const id_proveedor = result.insertId;

    // Insertar teléfonos multivalorados
    if (telefonos.length > 0) {
      const values = telefonos.map(t => [id_proveedor, t]);
      await conn.query('INSERT INTO proveedor_telefono (id_proveedor, telefono) VALUES ?', [values]);
    }

    await conn.commit();
    res.status(201).json({ message: 'Proveedor creado', id_proveedor });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

// PUT /api/proveedores/:id — Actualizar proveedor y reemplazar teléfonos
async function update(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const { nombre_proveedor, dir_ciudad, dir_calle, telefonos } = req.body;

    await conn.beginTransaction();

    await conn.query(
      `UPDATE proveedor SET
        nombre_proveedor = COALESCE(?, nombre_proveedor),
        dir_ciudad       = COALESCE(?, dir_ciudad),
        dir_calle        = COALESCE(?, dir_calle)
       WHERE id_proveedor = ?`,
      [nombre_proveedor, dir_ciudad, dir_calle, id]
    );

    // Reemplazar teléfonos si se enviaron
    if (Array.isArray(telefonos)) {
      await conn.query('DELETE FROM proveedor_telefono WHERE id_proveedor = ?', [id]);
      if (telefonos.length > 0) {
        const values = telefonos.map(t => [id, t]);
        await conn.query('INSERT INTO proveedor_telefono (id_proveedor, telefono) VALUES ?', [values]);
      }
    }

    await conn.commit();
    res.json({ message: 'Proveedor actualizado' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

// DELETE /api/proveedores/:id
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM proveedor WHERE id_proveedor = ?', [id]);
    res.json({ message: 'Proveedor eliminado' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, remove };
