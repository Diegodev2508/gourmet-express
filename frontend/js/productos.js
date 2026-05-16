document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-producto');
    const tablaBody = document.getElementById('tabla-productos-body');

    // Datos simulados temporales para el Catálogo (Core de Metodología)
    let productosPrueba = [
        { id_producto: 101, descripcion: "Harina de Trigo Premium", precio: 4500 },
        { id_producto: 102, descripcion: "Queso Mozzarella Bloque", precio: 28000 },
        { id_producto: 103, descripcion: "Salsa de Tomate Artesanal", precio: 12500 }
    ];

    // Función para renderizar la tabla
    function renderizarProductos() {
        tablaBody.innerHTML = '';
        
        if (productosPrueba.length === 0) {
            tablaBody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:2rem; color:#8a8a98;">No hay productos en el catálogo.</td></tr>`;
            return;
        }

        productosPrueba.forEach(p => {
            const fila = document.createElement('tr');
            fila.style.borderBottom = '1px solid #2c2c35';
            fila.innerHTML = `
                <td style="padding: 0.8rem; color: #ff9f43; font-weight: bold;">#${p.id_producto}</td>
                <td style="padding: 0.8rem; color: white;">${p.descripcion}</td>
                <td style="padding: 0.8rem; color: #8a8a98;">$${p.precio.toLocaleString()} COP</td>
            `;
            tablaBody.appendChild(fila);
        });
    }

    // Escuchar el envío del formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nuevoProducto = {
            id_producto: productosPrueba.length > 0 ? productosPrueba[productosPrueba.length - 1].id_producto + 1 : 101,
            descripcion: document.getElementById('descripcion').value.trim(),
            precio: parseFloat(document.getElementById('precio').value)
        };

        // Insertar en nuestro arreglo temporal de simulación
        productosPrueba.push(nuevoProducto);
        form.reset();
        renderizarProductos();
    });

    // Carga inicial
    renderizarProductos();
});