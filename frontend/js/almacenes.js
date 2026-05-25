document.addEventListener('DOMContentLoaded', () => {
    const tablaBody      = document.getElementById('tabla-almacenes-body');
    const form           = document.getElementById('form-almacen');
    const formTitulo     = document.getElementById('form-titulo');
    const inputId        = document.getElementById('id-almacen-editar');
    const inputNombre    = document.getElementById('nombre-almacen');
    const inputUbicacion = document.getElementById('ubicacion-almacen');
    const inputCapacidad = document.getElementById('capacidad-almacen');
    const btnCancelar    = document.getElementById('btn-cancelar');

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

    // ── CARGAR ALMACENES ──────────────────────────────────────
    async function cargarAlmacenes() {
        try {
            const res  = await fetch('http://localhost:3000/api/almacenes');
            if (!res.ok) throw new Error('Error al conectar con el servidor');
            const json = await res.json();
            const almacenes = json.data || json;

            tablaBody.innerHTML = '';

            if (!almacenes || almacenes.length === 0) {
                tablaBody.innerHTML = `<tr><td colspan="5" style="color:#8a8a98; padding:1rem; text-align:center;">No hay almacenes registrados.</td></tr>`;
                return;
            }

            almacenes.forEach(a => {
                const fila = document.createElement('tr');
                fila.style.borderBottom = '1px solid #2c2c35';
                fila.innerHTML = `
                    <td style="padding:0.8rem; color:#ff9f43; font-weight:bold;">${a.id_almacen}</td>
                    <td style="padding:0.8rem; color:white; font-weight:bold;">${a.nombre}</td>
                    <td style="padding:0.8rem; color:#8a8a98;">${a.ubicacion || '—'}</td>
                    <td style="padding:0.8rem; color:#8a8a98;">${a.capacidad_m3 ? a.capacidad_m3 + ' m³' : '—'}</td>
                    <td style="padding:0.8rem; text-align:center; display:flex; gap:0.5rem; justify-content:center;">
                        <button class="btn-editar" data-id="${a.id_almacen}"
                            data-nombre="${a.nombre}"
                            data-ubicacion="${a.ubicacion || ''}"
                            data-capacidad="${a.capacidad_m3 || ''}"
                            style="background:transparent; border:1px solid #ff9f43; color:#ff9f43; padding:0.3rem 0.6rem; border-radius:4px; cursor:pointer; font-size:0.85rem;">
                            Editar
                        </button>
                        <button class="btn-eliminar" data-id="${a.id_almacen}"
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
                    inputId.value             = btn.dataset.id;
                    inputNombre.value         = btn.dataset.nombre;
                    inputUbicacion.value      = btn.dataset.ubicacion;
                    inputCapacidad.value      = btn.dataset.capacidad;
                    formTitulo.textContent    = `Editando Almacén #${btn.dataset.id}`;
                    btnCancelar.style.display = 'inline-block';
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
                        const res  = await fetch(`http://localhost:3000/api/almacenes/${id}`, { method: 'DELETE' });
                        const data = await res.json();

                        if (!res.ok) {
                            mostrarNotificacion(data.error, 'error');
                            return;
                        }

                        mostrarNotificacion('Almacén eliminado correctamente', 'exito');
                        cargarAlmacenes();

                    } catch (error) {
                        mostrarNotificacion('Error de conexión con el servidor', 'error');
                    }
                });
            });

        } catch (error) {
            console.error('❌ Error cargando almacenes:', error);
            tablaBody.innerHTML = `<tr><td colspan="5" style="color:#ff3333; padding:1rem; text-align:center;">Error al cargar datos desde MySQL.</td></tr>`;
        }
    }

    // ── GUARDAR (CREAR O ACTUALIZAR) ──────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            nombre:       inputNombre.value.trim(),
            ubicacion:    inputUbicacion.value.trim(),
            capacidad_m3: inputCapacidad.value ? parseFloat(inputCapacidad.value) : null
        };

        if (!payload.nombre || !payload.ubicacion) {
            mostrarNotificacion('Por favor completa nombre y ubicación.', 'error');
            return;
        }

        const id = inputId.value;

        try {
            const url    = id ? `http://localhost:3000/api/almacenes/${id}` : 'http://localhost:3000/api/almacenes';
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

            mostrarNotificacion(id ? 'Almacén actualizado correctamente' : 'Almacén registrado con éxito', 'exito');
            resetForm();
            cargarAlmacenes();

        } catch (error) {
            console.error('Error guardando almacén:', error);
            mostrarNotificacion('Error de conexión con el servidor', 'error');
        }
    });

    // ── CANCELAR EDICIÓN ──────────────────────────────────────
    btnCancelar.addEventListener('click', resetForm);

    function resetForm() {
        form.reset();
        inputId.value             = '';
        formTitulo.textContent    = 'Registrar Nuevo Almacén';
        btnCancelar.style.display = 'none';
    }

    cargarAlmacenes();
});