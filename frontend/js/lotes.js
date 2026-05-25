document.addEventListener('DOMContentLoaded', () => {
    const form               = document.getElementById('form-lote');
    const formTitulo         = document.getElementById('form-titulo');
    const selectProducto     = document.getElementById('select-producto');
    const selectAlmacen      = document.getElementById('select-almacen');
    const tablaBody          = document.getElementById('tabla-lotes-body');
    const contenedorAlertas  = document.getElementById('contenedor-alertas');
    const inputId            = document.getElementById('id-lote-editar');
    const inputCantidad      = document.getElementById('cantidad');
    const inputFechaVenc     = document.getElementById('fecha-vencimiento');
    const btnCancelar        = document.getElementById('btn-cancelar');

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

    // ── SELECTORES ────────────────────────────────────────────
    async function inicializarSelectores() {
        try {
            const [resP, resA] = await Promise.all([
                fetch('http://localhost:3000/api/productos'),
                fetch('http://localhost:3000/api/almacenes')
            ]);
            const productos = (await resP.json()).data || [];
            const almacenes = (await resA.json()).data || [];

            selectProducto.innerHTML = productos.map(p =>
                `<option value="${p.id_producto}">${p.nombre}</option>`
            ).join('');

            selectAlmacen.innerHTML = almacenes.map(a =>
                `<option value="${a.id_almacen}">${a.nombre}</option>`
            ).join('');
        } catch (error) {
            console.error('Error cargando selectores:', error);
        }
    }

    // ── CARGAR LOTES ──────────────────────────────────────────
    async function cargarLotes() {
        try {
            const res = await fetch('http://localhost:3000/api/lotes');
            if (!res.ok) throw new Error('Error al conectar');
            const lotes = (await res.json()).data || [];

            tablaBody.innerHTML = '';
            contenedorAlertas.innerHTML = '';
            let alertasHTML = '';
            const hoy = new Date();

            if (!lotes.length) {
                tablaBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:#8a8a98;">No hay lotes registrados.</td></tr>`;
                contenedorAlertas.innerHTML = `<p style="color:#8a8a98; margin:0;">✅ No hay lotes registrados aún.</p>`;
                return;
            }

            lotes.forEach(l => {
                let estadoTexto = 'Estable';
                let estadoColor = '#28a745';
                let diasTexto = '—';

                if (l.fecha_vencimiento) {
                    const fVence = new Date(l.fecha_vencimiento);
                    const diff = Math.ceil((fVence - hoy) / (1000 * 60 * 60 * 24));
                    diasTexto = new Date(l.fecha_vencimiento).toISOString().split('T')[0];

                    if (diff <= 0) {
                        estadoTexto = '⚠️ VENCIDO';
                        estadoColor = '#dc3545';
                    } else if (diff <= 30) {
                        estadoTexto = '⏳ Próximo a vencer';
                        estadoColor = '#ff9f43';
                        alertasHTML += `
                            <div style="background:rgba(255,159,67,0.1); border-left:4px solid #ff9f43; padding:0.8rem; margin-bottom:0.5rem; border-radius:4px; display:flex; justify-content:space-between; color:white;">
                                <span><strong>${l.nombre_producto}</strong> en <em>${l.nombre_almacen}</em> (Lote #${l.id_lote})</span>
                                <span style="color:#ff9f43; font-weight:bold;">¡Vence en ${diff} días! (${diasTexto})</span>
                            </div>`;
                    }
                }

                const fila = document.createElement('tr');
                fila.style.borderBottom = '1px solid #2c2c35';
                fila.innerHTML = `
                    <td style="padding:0.8rem; color:#ff9f43; font-weight:bold;">LT-${l.id_lote}</td>
                    <td style="padding:0.8rem; color:white; font-weight:bold;">${l.nombre_producto}</td>
                    <td style="padding:0.8rem; color:#8a8a98;">${l.nombre_almacen}</td>
                    <td style="padding:0.8rem; color:white;">${l.cantidad} unidades</td>
                    <td style="padding:0.8rem; color:#8a8a98;">${diasTexto}</td>
                    <td style="padding:0.8rem;"><span style="color:${estadoColor}; font-weight:bold;">${estadoTexto}</span></td>
                    <td style="padding:0.8rem; text-align:center; display:flex; gap:0.5rem; justify-content:center;">
                        <button class="btn-editar"
                            data-id="${l.id_lote}"
                            data-producto="${l.id_producto}"
                            data-almacen="${l.id_almacen}"
                            data-cantidad="${l.cantidad}"
                            data-fecha="${diasTexto}"
                            style="background:transparent; border:1px solid #ff9f43; color:#ff9f43; padding:0.3rem 0.6rem; border-radius:4px; cursor:pointer; font-size:0.85rem;">
                            Editar
                        </button>
                        <button class="btn-eliminar" data-id="${l.id_lote}"
                            style="background:transparent; border:1px solid #ff4d4d; color:#ff4d4d; padding:0.3rem 0.6rem; border-radius:4px; cursor:pointer; font-size:0.85rem;">
                            Eliminar
                        </button>
                    </td>
                `;
                tablaBody.appendChild(fila);
            });

            contenedorAlertas.innerHTML = alertasHTML ||
                `<p style="color:#8a8a98; font-size:0.95rem; margin:0;">✅ Todos los lotes vigentes tienen un margen seguro mayor a 30 días.</p>`;

            // Botones editar
            document.querySelectorAll('.btn-editar').forEach(btn => {
                btn.addEventListener('click', () => {
                    inputId.value                    = btn.dataset.id;
                    selectProducto.value             = btn.dataset.producto;
                    selectAlmacen.value              = btn.dataset.almacen;
                    inputCantidad.value              = btn.dataset.cantidad;
                    inputFechaVenc.value             = btn.dataset.fecha;
                    formTitulo.textContent           = `Editando Lote #${btn.dataset.id}`;
                    btnCancelar.style.display        = 'inline-block';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            });

            // Botones eliminar
            document.querySelectorAll('.btn-eliminar').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.dataset.id;
                    if (!confirm(`¿Estás seguro que deseas eliminar el Lote #${id}?`)) return;

                    try {
                        const res  = await fetch(`http://localhost:3000/api/lotes/${id}`, { method: 'DELETE' });
                        const data = await res.json();

                        if (!res.ok) {
                            mostrarNotificacion(data.error, 'error');
                            return;
                        }

                        mostrarNotificacion('Lote eliminado correctamente', 'exito');
                        cargarLotes();
                    } catch (error) {
                        mostrarNotificacion('Error de conexión con el servidor', 'error');
                    }
                });
            });

        } catch (error) {
            console.error('Error cargando lotes:', error);
            tablaBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:#ff3333;">Error al cargar lotes desde MySQL.</td></tr>`;
        }
    }

    // ── GUARDAR (CREAR O ACTUALIZAR) ──────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = inputId.value;
        const payload = {
            id_producto:       parseInt(selectProducto.value),
            id_almacen:        parseInt(selectAlmacen.value),
            cantidad:          parseInt(inputCantidad.value),
            fecha_vencimiento: inputFechaVenc.value
        };

        if (!payload.id_producto || !payload.id_almacen || !payload.cantidad || !payload.fecha_vencimiento) {
            mostrarNotificacion('Por favor completa todos los campos.', 'error');
            return;
        }

        try {
            const url    = id ? `http://localhost:3000/api/lotes/${id}` : 'http://localhost:3000/api/lotes';
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

            mostrarNotificacion(id ? 'Lote actualizado correctamente' : 'Lote ingresado con éxito', 'exito');
            resetForm();
            await inicializarSelectores();
            cargarLotes();

        } catch (error) {
            console.error('Error guardando lote:', error);
            mostrarNotificacion('Error de conexión con el servidor', 'error');
        }
    });

    // ── CANCELAR EDICIÓN ──────────────────────────────────────
    btnCancelar.addEventListener('click', resetForm);

    function resetForm() {
        form.reset();
        inputId.value          = '';
        formTitulo.textContent = 'Registrar Entrada de Nuevo Lote';
        btnCancelar.style.display = 'none';
    }

    inicializarSelectores();
    cargarLotes();
});