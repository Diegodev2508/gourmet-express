# 🍽️ Gourmet Express — API REST

Sistema de gestión de cadena de suministro para **Gourmet Express**.  
Proyecto universitario — Sistemas de Gestión de Datos, EAFIT 2026.

---

## 📁 Estructura del proyecto

```
gourmet-express/
├── sql/
│   └── schema.sql              # Creación de tablas + datos de prueba
├── src/
│   ├── app.js                  # Punto de entrada
│   ├── config/
│   │   └── db.js               # Conexión al pool MySQL
│   ├── middleware/
│   │   └── errorHandler.js     # Manejo global de errores
│   ├── controllers/
│   │   ├── proveedorController.js
│   │   ├── productoController.js
│   │   ├── almacenController.js
│   │   └── loteController.js
│   └── routes/
│       ├── proveedorRoutes.js
│       ├── productoRoutes.js
│       ├── almacenRoutes.js
│       └── loteRoutes.js
├── .env.example                # Plantilla de variables de entorno
├── package.json
└── README.md
```

---

## ⚙️ Instalación y configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Crear el archivo .env
```bash
cp .env.example .env
```
Editar `.env` y completar los datos sensibles:
```
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql
```

### 3. Crear la base de datos
```bash
mysql -u tu_usuario -p < sql/schema.sql
```

### 4. Iniciar el servidor
```bash
# Producción
npm start

# Desarrollo (con recarga automática)
npm run dev
```

---

## 🌐 Endpoints de la API

**Base URL:** `http://localhost:3000/api`

### Salud del servidor
| Método | Ruta         | Descripción              |
|--------|--------------|--------------------------|
| GET    | `/health`    | Verificar que la API corre |

---

### 📦 Proveedores `/api/proveedores`

| Método | Ruta    | Descripción                        |
|--------|---------|------------------------------------|
| GET    | `/`     | Listar todos con teléfonos         |
| GET    | `/:id`  | Obtener uno con detalle            |
| POST   | `/`     | Crear proveedor                    |
| PUT    | `/:id`  | Actualizar proveedor               |
| DELETE | `/:id`  | Eliminar proveedor                 |

**Cuerpo POST/PUT:**
```json
{
  "nombre_proveedor": "Importadora ABC",
  "dir_ciudad": "Medellín",
  "dir_calle": "Cra 50 #10-20",
  "telefonos": ["604-1234567", "3001112233"]
}
```

---

### 🥫 Productos `/api/productos`

| Método | Ruta    | Descripción                        |
|--------|---------|------------------------------------|
| GET    | `/`     | Listar con nombre del proveedor    |
| GET    | `/:id`  | Obtener uno                        |
| POST   | `/`     | Crear producto                     |
| PUT    | `/:id`  | Actualizar producto                |
| DELETE | `/:id`  | Eliminar producto                  |

**Cuerpo POST/PUT:**
```json
{
  "nombre_producto": "Caviar Beluga",
  "descripcion": "Caviar de esturión beluga, 50g",
  "precio_unitario": 450000,
  "id_proveedor": 1
}
```

---

### 🏭 Almacenes `/api/almacenes`

| Método | Ruta    | Descripción                        |
|--------|---------|------------------------------------|
| GET    | `/`     | Listar con total de lotes          |
| GET    | `/:id`  | Obtener con lotes asociados        |
| POST   | `/`     | Crear almacén                      |
| PUT    | `/:id`  | Actualizar almacén                 |
| DELETE | `/:id`  | Eliminar almacén                   |

**Cuerpo POST/PUT:**
```json
{
  "nombre_almacen": "Bodega Sur",
  "capacidad_m3": 150.5
}
```

---

### 📋 Lotes `/api/lotes`

| Método | Ruta                            | Descripción                          |
|--------|---------------------------------|--------------------------------------|
| GET    | `/`                             | Listar todos                         |
| GET    | `/?id_producto=1`               | Filtrar por producto                 |
| GET    | `/?id_almacen=2`                | Filtrar por almacén                  |
| GET    | `/?vencidos=true`               | Solo lotes vencidos                  |
| GET    | `/?vencidos=false`              | Solo lotes vigentes                  |
| GET    | `/proximos-vencer?dias=30`      | Lotes que vencen en N días           |
| GET    | `/:id`                          | Obtener uno con detalle              |
| POST   | `/`                             | Crear lote                           |
| PUT    | `/:id`                          | Actualizar lote                      |
| DELETE | `/:id`                          | Eliminar lote                        |

**Cuerpo POST/PUT:**
```json
{
  "fecha_ingreso": "2026-05-01",
  "fecha_vencimiento": "2026-11-30",
  "id_producto": 1,
  "id_almacen": 2
}
```

> ⚠️ `dias_para_vencer` es un atributo **derivado**: lo calcula MySQL automáticamente,  
> **no** se debe enviar en el cuerpo de la petición.

---

## 🔒 Seguridad

- Las credenciales de BD viven **únicamente** en el archivo `.env`
- El archivo `.env` **nunca** debe subirse a repositorios
- Agregar `.env` al `.gitignore`

---

## 👥 Integrantes

- Diego Andrés Caballero Fernández  
- Juan Esteban Palacio Betancur  
- Thomas Alejandro Serna Saldarriaga  

**EAFIT — Sistemas de Gestión de Datos, 2026**
