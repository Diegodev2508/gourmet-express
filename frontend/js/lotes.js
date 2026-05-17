document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-lote');
    const selectProducto = document.getElementById('select-producto');
    const selectAlmacen = document.getElementById('select-almacen');
    const tablaBody = document.getElementById('tabla-lotes-body');
    const contenedorAlertas = document.getElementById('contenedor-alertas');

    // Cargar productos y almacenes en los selectores desde MySQL
    async function inicializarSelectores() {
        try {
            const [resP, resA] = await Promise.all([
                fetch('http://localhost:3000/api/productos'),
                fetch('http://localhost:3000/api/almacenes')
            ]);
            const jsonP = await resP.json();
            const jsonA = await resA.json();
            const productos = jsonP.data || jsonP;
            const almacenes = jsonA.data || jsonA;

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

    // Cargar lotes desde MySQL
    async function cargarLotes() {
        try {
            const res = await fetch('http://localhost:3000/api/lotes');
            if (!res.ok) throw new Error('Error al conectar');
            const json = await res.json();
            const lotes = json.data || json;

            tablaBody.innerHTML = '';
            contenedorAlertas.innerHTML = '';
            let alertasHTML = '';
            const hoy = new Date();

            if (!lotes || lotes.length === 0) {
                tablaBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:#8a8a98;">No hay lotes registrados.</td></tr>`;
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
                    diasTexto = l.fecha_vencimiento ? new Date(l.fecha_vencimiento).toISOString().split("T")[0] : "—";

                    if (diff <= 0) {
                        estadoTexto = '⚠️ VENCIDO';
                        estadoColor = '#dc3545';
                    } else if (diff <= 30) {
                        estadoTexto = '⏳ Próximo a vencer';
                        estadoColor = '#ff9f43';
                        alertasHTML += `
                            <div style="background:rgba(255,159,67,0.1); border-left:4px solid #ff9f43; padding:0.8rem; margin-bottom:0.5rem; border-radius:4px; display:flex; justify-content:space-between; color:white;">
                                <span><strong>${l.nombre_producto}</strong> en <em>${l.nombre_almacen}</em> (Lote #${l.id_lote})</span>
                                <span style="color:#ff9f43; font-weight:bold;">¡Vence en ${diff} días! (${new Date(l.fecha_vencimiento).toISOString().split("T")[0]})</span>
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
                `;
                tablaBody.appendChild(fila);
            });

            contenedorAlertas.innerHTML = alertasHTML ||
                `<p style="color:#8a8a98; font-size:0.95rem; margin:0;">✅ Todos los lotes vigentes tienen un margen seguro mayor a 30 días.</p>`;

        } catch (error) {
            console.error('Error cargando lotes:', error);
            tablaBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:#ff3333;">Error al cargar lotes desde MySQL.</td></tr>`;
        }
    }

    // Guardar nuevo lote en MySQL
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            id_producto:       parseInt(selectProducto.value),
            id_almacen:        parseInt(selectAlmacen.value),
            cantidad:          parseInt(document.getElementById('cantidad').value),
            fecha_ingreso:     new Date().toISOString().split('T')[0],
            fecha_vencimiento: document.getElementById('fecha-vencimiento').value
        };

        if (!payload.id_producto || !payload.id_almacen || !payload.cantidad || !payload.fecha_vencimiento) {
            alert('Por favor completa todos los campos.');
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/api/lotes', {
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
            await inicializarSelectores();
            cargarLotes();

        } catch (error) {
            console.error('Error guardando lote:', error);
        }
    });

    inicializarSelectores();
    cargarLotes();
});