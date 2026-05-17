-- ============================================================
-- GOURMET EXPRESS — Script completo de base de datos
-- Ejecutar en MySQL Workbench como usuario root
-- ============================================================

DROP DATABASE IF EXISTS gourmet_express;
CREATE DATABASE gourmet_express CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gourmet_express;

-- ============================================================
-- TABLAS
-- ============================================================

CREATE TABLE proveedores (
    id_proveedor   INT          NOT NULL AUTO_INCREMENT,
    nombre         VARCHAR(100) NOT NULL,
    contacto       VARCHAR(100) NOT NULL,
    telefono       VARCHAR(20)  NOT NULL,
    ciudad         VARCHAR(100),
    direccion      VARCHAR(255),
    created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_proveedor)
);

CREATE TABLE productos (
    id_producto    INT            NOT NULL AUTO_INCREMENT,
    nombre         VARCHAR(100)   NOT NULL,
    descripcion    TEXT,
    precio         DECIMAL(10,2)  NOT NULL,
    id_proveedor   INT,
    created_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_producto),
    CONSTRAINT fk_productos_proveedor
        FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor)
        ON DELETE SET NULL
);

CREATE TABLE almacenes (
    id_almacen     INT            NOT NULL AUTO_INCREMENT,
    nombre         VARCHAR(100)   NOT NULL,
    ubicacion      VARCHAR(255)   NOT NULL,
    capacidad_m3   DECIMAL(10,2),
    created_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_almacen)
);

CREATE TABLE lotes (
    id_lote           INT   NOT NULL AUTO_INCREMENT,
    id_producto       INT   NOT NULL,
    id_almacen        INT   NOT NULL,
    cantidad          INT   NOT NULL,
    fecha_ingreso     DATE  NOT NULL,
    fecha_vencimiento DATE,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_lote),
    CONSTRAINT fk_lotes_producto
        FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
        ON DELETE RESTRICT,
    CONSTRAINT fk_lotes_almacen
        FOREIGN KEY (id_almacen) REFERENCES almacenes(id_almacen)
        ON DELETE RESTRICT
);

CREATE TABLE auditoria_proveedores (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    id_proveedor INT,
    nombre       VARCHAR(100),
    accion       VARCHAR(50),
    fecha        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TRIGGERS
-- ============================================================

DELIMITER //

-- Trigger 1: Asignar fecha_ingreso automáticamente si no se envía
CREATE TRIGGER before_lote_insert
BEFORE INSERT ON lotes
FOR EACH ROW
BEGIN
    IF NEW.fecha_ingreso IS NULL THEN
        SET NEW.fecha_ingreso = CURDATE();
    END IF;
END//

-- Trigger 2: Validar que la cantidad sea mayor a cero
CREATE TRIGGER validar_cantidad_lote
BEFORE INSERT ON lotes
FOR EACH ROW
BEGIN
    IF NEW.cantidad <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: La cantidad del lote debe ser mayor a cero';
    END IF;
END//

-- Trigger 3: Validar que el precio del producto no sea negativo
CREATE TRIGGER validar_precio_producto
BEFORE INSERT ON productos
FOR EACH ROW
BEGIN
    IF NEW.precio < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El precio del producto no puede ser negativo';
    END IF;
END//

-- Trigger 4: Auditoría — registrar proveedores eliminados
CREATE TRIGGER after_proveedor_delete
AFTER DELETE ON proveedores
FOR EACH ROW
BEGIN
    INSERT INTO auditoria_proveedores (id_proveedor, nombre, accion)
    VALUES (OLD.id_proveedor, OLD.nombre, 'ELIMINADO');
END//

DELIMITER ;

-- ============================================================
-- DATOS DE PRUEBA
-- ============================================================

INSERT INTO proveedores (nombre, contacto, telefono, ciudad, direccion) VALUES
('Distribuidores Gourmet Co.', 'Carlos Mendoza',  '3001234567', 'Medellín', 'Cra 43A #1-50'),
('Carnes y Cárnicos SAS',      'Andrés Restrepo', '3159876543', 'Medellín', 'Calle 30 #70-20'),
('Lácteos del Norte',          'Pedro Gómez',     '3109876543', 'Bogotá',   'Cra 15 #45-20');

INSERT INTO productos (nombre, descripcion, precio, id_proveedor) VALUES
('Harina de Trigo Premium', 'Harina para panadería y repostería', 4500.00,  1),
('Queso Mozzarella',        'Queso bloque para pizza y pastas',   28000.00, 3),
('Salsa de Tomate',         'Salsa artesanal para cocina',        12500.00, 1),
('Aceite de Oliva',         'Aceite virgen extra importado',      35000.00, 2),
('Azúcar Refinada',         'Azúcar blanca 50kg',                  3200.00, 1);

INSERT INTO almacenes (nombre, ubicacion, capacidad_m3) VALUES
('Sede Central - El Poblado',         'Carrera 43A #9-12',      500.00),
('Planta de Producción - Laureles',   'Avenida Nutibara #74-25',800.00),
('Centro de Distribución - Envigado', 'Calle 38 Sur #41-10',    650.00),
('Centro Logístico - Itagüí',         'Calle 80 #45-10',        400.00);

INSERT INTO lotes (id_producto, id_almacen, cantidad, fecha_ingreso, fecha_vencimiento) VALUES
(1, 1, 120, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 90 DAY)),
(2, 1,  45, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 20 DAY)),
(3, 2,  80, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY)),
(4, 3,  30, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 180 DAY)),
(5, 4, 200, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 365 DAY));

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================

SELECT 'proveedores' AS tabla, COUNT(*) AS registros FROM proveedores
UNION ALL
SELECT 'productos',  COUNT(*) FROM productos
UNION ALL
SELECT 'almacenes',  COUNT(*) FROM almacenes
UNION ALL
SELECT 'lotes',      COUNT(*) FROM lotes;