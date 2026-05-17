document.addEventListener('DOMContentLoaded', () => {
    const contenedorTelefonos = document.getElementById('contenedor-telefonos');
    const btnAgregarTelefono = document.getElementById('btn-agregar-telefono');
    const tablaBody = document.getElementById('tabla-proveedores-body');

    // Inputs dinámicos para teléfonos adicionales
    btnAgregarTelefono.addEventListener('click', () => {
        const nuevoInput = document.createElement('div');
        nuevoInput.style.display = 'flex';
        nuevoInput.style.gap = '0.5rem';
        nuevoInput.innerHTML = `
            <input type="text" class="input-telefono" placeholder="Otro teléfono" style="flex:1; padding:0.6rem; background:#2c2c35; border:none; color:white; border-radius:4px;">
            <button type="button" class="btn-remover-tel" style="background:#ff4d4d; color:white; border:none; padding:0 0.8rem; border-radius:4px; cursor:pointer;">❌</button>
        `;
        contenedorTelefonos.appendChild(nuevoInput);
        nuevoInput.querySelector('.btn-remover-tel').addEventListener('click', () => nuevoInput.remove());
    });

    // Cargar proveedores desde la API
    async function cargarProveedores() {
        try {
            const res = await fetch('http://localhost:3000/api/proveedores');
            if (!res.ok) throw new Error('Error al conectar con el servidor');
            const json = await res.json();
            const proveedores = json.data || json;

            tablaBody.innerHTML = '';

            if (!proveedores || proveedores.length === 0) {
                tablaBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:#8a8a98;">No hay proveedores registrados aún.</td></tr>`;
                return;
            }

            proveedores.forEach(p => {
                const fila = document.createElement('tr');
                fila.style.borderBottom = '1px solid #2c2c35';
                fila.innerHTML = `
                    <td style="padding:0.8rem; color:#ff9f43; font-weight:bold;">${p.id_proveedor}</td>
                    <td style="padding:0.8rem; font-weight:bold; color:white;">${p.nombre}</td>
                    <td style="padding:0.8rem; color:#8a8a98;">${p.ciudad || ''}, ${p.direccion || ''}</td>
                    <td style="padding:0.8rem;">
                        <span style="background:#2c2c35; padding:0.2rem 0.5rem; border-radius:4px; font-size:0.9rem; color:#ff9f43;">
                            📞 ${p.telefono || 'Sin teléfono'}
                        </span>
                    </td>
                    <td style="padding:0.8rem; text-align:center;">
                        <button class="btn-eliminar" data-id="${p.id_proveedor}" style="background:transparent; border:1px solid #ff4d4d; color:#ff4d4d; padding:0.3rem 0.6rem; border-radius:4px; cursor:pointer; font-size:0.85rem;">Eliminar</button>
                    </td>
                `;
                tablaBody.appendChild(fila);
            });

            document.querySelectorAll('.btn-eliminar').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    if (confirm(`¿Eliminar proveedor #${id}?`)) {
                        await fetch(`http://localhost:3000/api/proveedores/${id}`, { method: 'DELETE' });
                        cargarProveedores();
                    }
                });
            });

        } catch (error) {
            console.error('Error cargando proveedores:', error);
            tablaBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:#ff3333;">Error al cargar proveedores.</td></tr>`;
        }
    }

    // Guardar nuevo proveedor
    document.getElementById('form-proveedor').addEventListener('submit', async (e) => {
        e.preventDefault();

        const primerTel = document.querySelector('.input-telefono');

        const payload = {
            nombre:    document.getElementById('nombre').value.trim(),
            contacto:  document.getElementById('nombre').value.trim(), // mismo nombre como contacto por defecto
            ciudad:    document.getElementById('ciudad').value.trim(),
            direccion: document.getElementById('calle').value.trim(),
            telefono:  primerTel ? primerTel.value.trim() : ''
        };

        if (!payload.nombre || !payload.ciudad || !payload.direccion || !payload.telefono) {
            alert('Por favor completa todos los campos obligatorios.');
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/api/proveedores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                alert('Error: ' + err.error);
                return;
            }

            e.target.reset();
            contenedorTelefonos.innerHTML = `<input type="text" class="input-telefono" required placeholder="Ej: 3001234567" style="width:100%; padding:0.6rem; background:#2c2c35; border:none; color:white; border-radius:4px;">`;
            cargarProveedores();

        } catch (error) {
            console.error('Error guardando proveedor:', error);
        }
    });

    cargarProveedores();
});