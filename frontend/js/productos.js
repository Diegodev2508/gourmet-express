document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-producto');
    const tablaBody = document.getElementById('tabla-productos-body');

    async function cargarProductos() {
        try {
            const res = await fetch('http://localhost:3000/api/productos');
            if (!res.ok) throw new Error('Error al conectar con el servidor');
            const json = await res.json();
            const productos = json.data || json;

            tablaBody.innerHTML = '';

            if (!productos || productos.length === 0) {
                tablaBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:#8a8a98;">No hay productos en el catálogo.</td></tr>`;
                return;
            }

            productos.forEach(p => {
                const fila = document.createElement('tr');
                fila.style.borderBottom = '1px solid #2c2c35';
                fila.innerHTML = `
                    <td style="padding:0.8rem; color:#ff9f43; font-weight:bold;">#${p.id_producto}</td>
                    <td style="padding:0.8rem; color:white; font-weight:bold;">${p.nombre}</td>
                    <td style="padding:0.8rem; color:#8a8a98;">${p.descripcion || '—'}</td>
                    <td style="padding:0.8rem; color:#4ecdc4;">$${parseFloat(p.precio).toLocaleString('es-CO')} COP</td>
                    <td style="padding:0.8rem; text-align:center;">
                        <button class="btn-eliminar" data-id="${p.id_producto}" style="background:transparent; border:1px solid #ff4d4d; color:#ff4d4d; padding:0.3rem 0.6rem; border-radius:4px; cursor:pointer; font-size:0.85rem;">Eliminar</button>
                    </td>
                `;
                tablaBody.appendChild(fila);
            });

            document.querySelectorAll('.btn-eliminar').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    if (confirm(`¿Eliminar producto #${id}?`)) {
                        await fetch(`http://localhost:3000/api/productos/${id}`, { method: 'DELETE' });
                        cargarProductos();
                    }
                });
            });

        } catch (error) {
            console.error('Error cargando productos:', error);
            tablaBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:#ff3333;">Error al cargar productos desde MySQL.</td></tr>`;
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            nombre:      document.getElementById('nombre').value.trim(),
            descripcion: document.getElementById('descripcion').value.trim(),
            precio:      parseFloat(document.getElementById('precio').value)
        };

        if (!payload.nombre || isNaN(payload.precio)) {
            alert('Por favor completa nombre y precio.');
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/api/productos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                alert('Error: ' + err.error);
                return;
            }

            form.reset();
            cargarProductos();

        } catch (error) {
            console.error('Error guardando producto:', error);
        }
    });

    cargarProductos();
});