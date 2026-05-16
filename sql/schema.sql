-- ============================================================
--  GOURMET EXPRESS — Script de creación de Base de Datos
--  Motor: MySQL 8.0+
--  Ejecutar: mysql -u tu_usuario -p < sql/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS gourmet_express
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gourmet_express;

-- ─────────────────────────────────────────
--  PROVEEDOR
--  Dirección es atributo compuesto (ciudad + calle)
--  Teléfono es multivalorado → tabla separada
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proveedor (
  id_proveedor      INT           AUTO_INCREMENT PRIMARY KEY,
  nombre_proveedor  VARCHAR(150)  NOT NULL,
  dir_ciudad        VARCHAR(100)  NOT NULL,
  dir_calle         VARCHAR(200)  NOT NULL
);

-- Tabla para teléfonos multivalorados del proveedor
CREATE TABLE IF NOT EXISTS proveedor_telefono (
  id_telefono   INT           AUTO_INCREMENT PRIMARY KEY,
  id_proveedor  INT           NOT NULL,
  telefono      VARCHAR(20)   NOT NULL,
  CONSTRAINT fk_tel_proveedor
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- ─────────────────────────────────────────
--  PRODUCTO
--  descripcion puede ser NULL (según el modelo ER)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS producto (
  id_producto       INT             AUTO_INCREMENT PRIMARY KEY,
  nombre_producto   VARCHAR(150)    NOT NULL,
  descripcion       TEXT            NULL,
  precio_unitario   DECIMAL(10,2)   NOT NULL CHECK (precio_unitario >= 0),
  id_proveedor      INT             NOT NULL,
  CONSTRAINT fk_prod_proveedor
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

-- ─────────────────────────────────────────
--  ALMACEN
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS almacen (
  id_almacen      INT           AUTO_INCREMENT PRIMARY KEY,
  nombre_almacen  VARCHAR(150)  NOT NULL,
  capacidad_m3    DECIMAL(10,2) NOT NULL CHECK (capacidad_m3 > 0)
);

-- ─────────────────────────────────────────
--  LOTE
--  dias_para_vencer es atributo DERIVADO → columna generada automáticamente
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lote (
  id_lote           INT   AUTO_INCREMENT PRIMARY KEY,
  fecha_ingreso     DATE  NOT NULL,
  fecha_vencimiento DATE  NOT NULL,
  -- Atributo derivado: calculado automáticamente por MySQL
  dias_para_vencer  INT   GENERATED ALWAYS AS (DATEDIFF(fecha_vencimiento, CURDATE())) VIRTUAL,
  id_producto       INT   NOT NULL,
  id_almacen        INT   NOT NULL,
  CONSTRAINT fk_lote_producto
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_lote_almacen
    FOREIGN KEY (id_almacen)  REFERENCES almacen(id_almacen)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT chk_fechas
    CHECK (fecha_vencimiento >= fecha_ingreso)
);

-- ─────────────────────────────────────────
--  DATOS DE PRUEBA
-- ─────────────────────────────────────────
INSERT INTO proveedor (nombre_proveedor, dir_ciudad, dir_calle) VALUES
  ('Delicatessen Italia S.A.',  'Medellín', 'Cra 43A #1-50'),
  ('Gourmet France LTDA',       'Bogotá',   'Cll 72 #10-21'),
  ('Ibérica Imports',           'Medellín', 'Av El Poblado #15-80');

INSERT INTO proveedor_telefono (id_proveedor, telefono) VALUES
  (1, '604-3001234'), (1, '3152223344'),
  (2, '601-7008899'),
  (3, '604-4445566'), (3, '3209998877');

INSERT INTO producto (nombre_producto, descripcion, precio_unitario, id_proveedor) VALUES
  ('Trufa Negra Périgord',  'Tuber melanosporum, temporada invierno', 185000.00, 1),
  ('Aceite de Oliva EVOO',  'Extra virgen, denominación de origen Toscana', 62000.00, 1),
  ('Foie Gras de Pato',     'Bloc de foie gras con trufas, 200g',  98000.00, 2),
  ('Jamón Ibérico 5J',      'Bellota 100%, curación 48 meses',     320000.00, 3),
  ('Queso Manchego Viejo',  NULL,                                    45000.00, 3);

INSERT INTO almacen (nombre_almacen, capacidad_m3) VALUES
  ('Bodega Central Medellín', 500.00),
  ('Almacén Frío Bogotá',     200.00),
  ('Depósito Seco Norte',     350.00);

INSERT INTO lote (fecha_ingreso, fecha_vencimiento, id_producto, id_almacen) VALUES
  ('2026-01-10', '2026-12-31', 1, 1),
  ('2026-02-15', '2026-08-15', 2, 1),
  ('2026-03-01', '2026-06-01', 3, 2),
  ('2026-01-20', '2027-01-20', 4, 3),
  ('2026-04-05', '2026-10-05', 5, 3);
