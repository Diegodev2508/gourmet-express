-- ============================================================
-- GOURMET EXPRESS — Archivo de Pruebas para Clase
-- Ejecutar en MySQL Workbench con la BD gourmet_express activa
-- ============================================================

USE gourmet_express;

-- ============================================================
-- 1. CRUD COMPLETO — PROVEEDORES
-- ============================================================

-- READ: Ver todos los proveedores
SELECT * FROM proveedores;

-- READ: Ver proveedor específico
SELECT * FROM proveedores WHERE id_proveedor = 1;

-- INSERT: Crear nuevo proveedor
INSERT INTO proveedores (nombre, contacto, telefono, ciudad, direccion)
VALUES ('Panadería La Espiga', 'María Torres', '3204567890', 'Medellín', 'Calle 50 #30-10');

-- UPDATE: Actualizar proveedor
UPDATE proveedores
SET telefono = '3001112233', ciudad = 'Bogotá'
WHERE id_proveedor = 1;

-- DELETE: Eliminar proveedor (activa el trigger de auditoría)
DELETE FROM proveedores WHERE id_proveedor = 4;

-- Verificar auditoría del proveedor eliminado
SELECT * FROM auditoria_proveedores;

-- ============================================================
-- 2. CRUD COMPLETO — PRODUCTOS
-- ============================================================

-- READ: Ver todos los productos con su proveedor
SELECT
    p.id_producto,
    p.nombre AS producto,
    p.descripcion,
    p.precio,
    pr.nombre AS proveedor
FROM productos p
LEFT JOIN proveedores pr USING (id_proveedor)
ORDER BY p.nombre;

-- INSERT: Crear nuevo producto
INSERT INTO productos (nombre, descripcion, precio, id_proveedor)
VALUES ('Mantequilla Premium', 'Mantequilla sin sal para repostería', 8500.00, 3);

-- UPDATE: Actualizar precio de producto
UPDATE productos
SET precio = 5000.00
WHERE nombre = 'Harina de Trigo Premium';

-- DELETE: Eliminar producto
DELETE FROM productos WHERE nombre = 'Mantequilla Premium';

-- ============================================================
-- 3. CRUD COMPLETO — LOTES
-- ============================================================

-- READ: Ver todos los lotes con info completa
SELECT
    l.id_lote,
    p.nombre AS producto,
    a.nombre AS almacen,
    l.cantidad,
    l.fecha_ingreso,
    l.fecha_vencimiento,
    DATEDIFF(l.fecha_vencimiento, CURDATE()) AS dias_para_vencer
FROM lotes l
JOIN productos p USING (id_producto)
JOIN almacenes a USING (id_almacen)
ORDER BY l.fecha_vencimiento;

-- INSERT: Crear lote directamente
INSERT INTO lotes (id_producto, id_almacen, cantidad, fecha_ingreso, fecha_vencimiento)
VALUES (1, 2, 50, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 45 DAY));

-- UPDATE: Actualizar cantidad de un lote
UPDATE lotes SET cantidad = 200 WHERE id_lote = 1;

-- DELETE: Eliminar un lote
DELETE FROM lotes WHERE id_lote = 6;

-- ============================================================
-- 4. TRIGGER — validar_cantidad_lote
-- Prueba: intentar insertar cantidad <= 0 (debe fallar)
-- ============================================================

-- Esta inserción DEBE dar error: La cantidad del lote debe ser mayor a cero
INSERT INTO lotes (id_producto, id_almacen, cantidad, fecha_ingreso, fecha_vencimiento)
VALUES (1, 1, -10, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY));

-- ============================================================
-- 5. TRIGGER — validar_precio_producto
-- Prueba: intentar insertar precio negativo (debe fallar)
-- ============================================================

-- Esta inserción DEBE dar error: El precio del producto no puede ser negativo
INSERT INTO productos (nombre, descripcion, precio, id_proveedor)
VALUES ('Producto Inválido', 'Test', -500.00, 1);

-- ============================================================
-- 6. TRIGGER — before_lote_insert
-- Prueba: insertar lote sin fecha_ingreso (se asigna automáticamente)
-- ============================================================

-- fecha_ingreso se asignará automáticamente con CURDATE()
INSERT INTO lotes (id_producto, id_almacen, cantidad, fecha_vencimiento)
VALUES (2, 3, 30, DATE_ADD(CURDATE(), INTERVAL 60 DAY));

-- Verificar que se asignó la fecha
SELECT * FROM lotes ORDER BY id_lote DESC LIMIT 1;

-- ============================================================
-- 7. TRIGGER — after_proveedor_delete (Auditoría)
-- Prueba: eliminar proveedor y verificar registro en auditoría
-- ============================================================

-- Primero insertamos uno de prueba
INSERT INTO proveedores (nombre, contacto, telefono, ciudad, direccion)
VALUES ('Proveedor Temporal', 'Test User', '3000000000', 'Cali', 'Calle Test #1');

-- Lo eliminamos
DELETE FROM proveedores WHERE nombre = 'Proveedor Temporal';

-- Verificar que quedó registrado en auditoría
SELECT * FROM auditoria_proveedores;

-- ============================================================
-- 8. FUNCIÓN — obtener_stock_total()
-- Retorna el total de unidades de un producto en todos los lotes
-- ============================================================

-- Stock total del producto 1 (Harina de Trigo Premium)
SELECT obtener_stock_total(1) AS stock_harina;

-- Stock total del producto 2 (Queso Mozzarella)
SELECT obtener_stock_total(2) AS stock_queso;

-- Ver stock de TODOS los productos usando la función
SELECT
    p.id_producto,
    p.nombre AS producto,
    obtener_stock_total(p.id_producto) AS stock_total
FROM productos p
ORDER BY stock_total DESC;

-- ============================================================
-- 9. PROCEDIMIENTO — registrar_lote_seguro()
-- Inserta un lote calculando fecha_ingreso automáticamente
-- ============================================================

-- Registrar lote de Harina en Sede Central con vencimiento en 3 meses
CALL registrar_lote_seguro(1, 1, 100, DATE_ADD(CURDATE(), INTERVAL 90 DAY));

-- Registrar lote de Queso próximo a vencer (para probar alertas)
CALL registrar_lote_seguro(2, 2, 25, DATE_ADD(CURDATE(), INTERVAL 15 DAY));

-- Verificar que se crearon correctamente
SELECT
    l.id_lote,
    p.nombre AS producto,
    a.nombre AS almacen,
    l.cantidad,
    l.fecha_ingreso,
    l.fecha_vencimiento,
    DATEDIFF(l.fecha_vencimiento, CURDATE()) AS dias_para_vencer
FROM lotes l
JOIN productos p USING (id_producto)
JOIN almacenes a USING (id_almacen)
ORDER BY l.id_lote DESC
LIMIT 5;

-- ============================================================
-- 10. CONSULTAS AVANZADAS PARA DEMOSTRAR EN CLASE
-- ============================================================

-- Lotes próximos a vencer en los próximos 30 días
SELECT
    l.id_lote,
    p.nombre AS producto,
    a.nombre AS almacen,
    l.cantidad,
    l.fecha_vencimiento,
    DATEDIFF(l.fecha_vencimiento, CURDATE()) AS dias_restantes
FROM lotes l
JOIN productos p USING (id_producto)
JOIN almacenes a USING (id_almacen)
WHERE l.fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
ORDER BY l.fecha_vencimiento;

-- Total de unidades por almacén
SELECT
    a.nombre AS almacen,
    COUNT(l.id_lote) AS total_lotes,
    SUM(l.cantidad) AS total_unidades
FROM almacenes a
LEFT JOIN lotes l USING (id_almacen)
GROUP BY a.id_almacen, a.nombre
ORDER BY total_unidades DESC;

-- Productos con su stock total y proveedor
SELECT
    p.nombre AS producto,
    pr.nombre AS proveedor,
    p.precio,
    obtener_stock_total(p.id_producto) AS stock_total
FROM productos p
LEFT JOIN proveedores pr USING (id_proveedor)
ORDER BY stock_total DESC;

-- Resumen general del sistema
SELECT 'proveedores' AS tabla, COUNT(*) AS registros FROM proveedores
UNION ALL
SELECT 'productos',  COUNT(*) FROM productos
UNION ALL
SELECT 'almacenes',  COUNT(*) FROM almacenes
UNION ALL
SELECT 'lotes',      COUNT(*) FROM lotes;
