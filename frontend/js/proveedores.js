document.addEventListener('DOMContentLoaded', () => {
    const contenedorTelefonos = document.getElementById('contenedor-telefonos');
    // const btnAgregarTelefono  = document.getElementById('btn-agregar-telefono');
    const btnCancelar         = document.getElementById('btn-cancelar');
    const formTitulo          = document.getElementById('form-titulo');
    const tablaBody           = document.getElementById('tabla-proveedores-body');
    const inputId             = document.getElementById('id-proveedor-editar');
    const inputNombre         = document.getElementById('nombre');
    const inputCiudad         = document.getElementById('ciudad');
    const inputCalle          = document.getElementById('calle');

    // ── NOTIFICACIONES ────────────────────────────────────────
    function mostrarNotificacion(mensaje, tipo) {
        const anterior = document.getElementById('notificacion');
        if (anterior) anterior.remove();

        const div = document.createElement('div');
        div.id = 'notificacion';
        div.textContent = mensaje;
        div.style.cssText = `
            position: fixed;
            top: 1.5rem;
            right: 1.5rem;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-size: 0.95rem;
            font-weight: 500;
            z-index: 9999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
            transition: opacity 0.5s ease;
            background: ${tipo === 'error' ? '#3d1a1a' : '#1a3d2b'};
            border: 1px solid ${tipo === 'error' ? '#ff4d4d' : '#2ecc71'};
            color: ${tipo === 'error' ? '#ff4d4d' : '#2ecc71'};
        `;
        document.body.appendChild(div);

        setTimeout(() => {
            div.style.opacity = '0';
            setTimeout(() => div.remove(), 500);
        }, 4000);
    }

    // ── TELÉFONOS DINÁMICOS ───────────────────────────────────
    /*
    btnAgregarTelefono.addEventListener('click', () => {
        const nuevoInput = document.createElement('div');
        nuevoInput.style.display = 'flex';
        nuevoInput.style.gap = '0.5rem';
        nuevoInput.innerHTML = `
            <input type="text" class="input-telefono" placeholder="Otro teléfono"
                style="flex:1; padding:0.6rem; background:#2c2c35; border:none; color:white; border-radius:4px;">
            <button type="button" class="btn-remover-tel"
                style="background:#ff4d4d; color:white; border:none; padding:0 0.8rem; border-radius:4px; cursor:pointer;">❌</button>
        `;
        contenedorTelefonos.appendChild(nuevoInput);
        nuevoInput.querySelector('.btn-remover-tel').addEventListener('click', () => nuevoInput.remove());
    });

     */

    // ── CARGAR PROVEEDORES ────────────────────────────────────
    async function cargarProveedores() {
        try {
            const res = await fetch('http://localhost:3000/api/proveedores');
            if (!res.ok) throw new Error('Error al conectar con el servidor');
            const proveedores = (await res.json()).data || [];

            tablaBody.innerHTML = '';

            if (!proveedores.length) {
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
                    <td style="padding:0.8rem; text-align:center; display:flex; gap:0.5rem; justify-content:center;">
                        <button class="btn-editar"
                            data-id="${p.id_proveedor}"
                            data-nombre="${p.nombre}"
                            data-ciudad="${p.ciudad || ''}"
                            data-direccion="${p.direccion || ''}"
                            data-telefono="${p.telefono || ''}"
                            style="background:transparent; border:1px solid #ff9f43; color:#ff9f43; padding:0.3rem 0.6rem; border-radius:4px; cursor:pointer; font-size:0.85rem;">
                            Editar
                        </button>
                        <button class="btn-eliminar" data-id="${p.id_proveedor}"
                            style="background:transparent; border:1px solid #ff4d4d; color:#ff4d4d; padding:0.3rem 0.6rem; border-radius:4px; cursor:pointer; font-size:0.85rem;">
                            Eliminar
                        </button>
                    </td>
                `;
                tablaBody.appendChild(fila);
            });

            // Botones editar
            document.querySelectorAll('.btn-editar').forEach(btn => {
                btn.addEventListener('click', () => {
                    inputId.value          = btn.dataset.id;
                    inputNombre.value      = btn.dataset.nombre;
                    inputCiudad.value      = btn.dataset.ciudad;
                    inputCalle.value       = btn.dataset.direccion;
                    formTitulo.textContent = `Editando Proveedor #${btn.dataset.id}`;
                    btnCancelar.style.display = 'inline-block';

                    // Restaurar teléfono en el campo
                    contenedorTelefonos.innerHTML = `
                        <input type="text" class="input-telefono" required placeholder="Ej: 3001234567"
                            value="${btn.dataset.telefono}"
                            style="width:100%; padding:0.6rem; background:#2c2c35; border:none; color:white; border-radius:4px;">
                    `;
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            });

            // Botones eliminar
            document.querySelectorAll('.btn-eliminar').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.dataset.id;
                    const nombre = btn.closest('tr').querySelector('td:nth-child(2)').textContent;

                    if (!confirm(`¿Estás seguro que deseas eliminar "${nombre}"?`)) return;

                    try {
                        const res  = await fetch(`http://localhost:3000/api/proveedores/${id}`, { method: 'DELETE' });
                        const data = await res.json();

                        if (!res.ok) {
                            mostrarNotificacion(data.error, 'error');
                            return;
                        }

                        mostrarNotificacion('Proveedor eliminado correctamente', 'exito');
                        cargarProveedores();
                    } catch (error) {
                        mostrarNotificacion('Error de conexión con el servidor', 'error');
                    }
                });
            });

        } catch (error) {
            console.error('Error cargando proveedores:', error);
            tablaBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:#ff3333;">Error al cargar proveedores.</td></tr>`;
        }
    }

    // ── GUARDAR (CREAR O ACTUALIZAR) ──────────────────────────
    document.getElementById('form-proveedor').addEventListener('submit', async (e) => {
        e.preventDefault();

        const primerTel = document.querySelector('.input-telefono');
        const id = inputId.value;

        const payload = {
            nombre:    inputNombre.value.trim(),
            contacto:  inputNombre.value.trim(),
            ciudad:    inputCiudad.value.trim(),
            direccion: inputCalle.value.trim(),
            telefono:  primerTel ? primerTel.value.trim() : ''
        };

        if (!payload.nombre || !payload.ciudad || !payload.direccion || !payload.telefono) {
            mostrarNotificacion('Por favor completa todos los campos obligatorios.', 'error');
            return;
        }

        try {
            const url    = id ? `http://localhost:3000/api/proveedores/${id}` : 'http://localhost:3000/api/proveedores';
            const method = id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                mostrarNotificacion('Error: ' + err.error, 'error');
                return;
            }

            mostrarNotificacion(id ? 'Proveedor actualizado correctamente' : 'Proveedor registrado con éxito', 'exito');
            resetForm();
            cargarProveedores();

        } catch (error) {
            console.error('Error guardando proveedor:', error);
            mostrarNotificacion('Error de conexión con el servidor', 'error');
        }
    });

    // ── CANCELAR EDICIÓN ──────────────────────────────────────
    btnCancelar.addEventListener('click', resetForm);

    function resetForm() {
        document.getElementById('form-proveedor').reset();
        inputId.value          = '';
        formTitulo.textContent = 'Registrar Nuevo Proveedor';
        btnCancelar.style.display = 'none';
        contenedorTelefonos.innerHTML = `
            <input type="text" class="input-telefono" required placeholder="Ej: 3001234567"
                style="width:100%; padding:0.6rem; background:#2c2c35; border:none; color:white; border-radius:4px;">
        `;
    }

    cargarProveedores();
});