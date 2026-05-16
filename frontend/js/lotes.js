document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-lote');
    const selectProducto = document.getElementById('select-producto');
    const selectAlmacen = document.getElementById('select-almacen');
    const tablaBody = document.getElementById('tabla-lotes-body');
    const contenedorAlertas = document.getElementById('contenedor-alertas');

    // 1. Datos simulados de dependencias (para emular llaves foráneas)
    const productos = [
        { id: 101, desc: "Harina de Trigo Premium" },
        { id: 102, desc: "Queso Mozzarella Bloque" },
        { id: 103, desc: "Salsa de Tomate Artesanal" }
    ];

    const almacenes = [
        { id: 1, nombre: "Sede Central - El Poblado" },
        { id: 2, nombre: "Planta de Producción - Laureles" },
        { id: 3, nombre: "Centro de Distribución - Envigado" }
    ];

    // Generamos unas fechas dinámicas relativas para las pruebas
    const hoy = new Date();
    const fechaCercana = new Date(hoy.getTime() + (10 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]; // Vence en 10 días
    const fechaLejana = new Date(hoy.getTime() + (90 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];  // Vence en 90 días

    // 2. Datos simulados de la tabla Lotes
    let lotesPrueba = [
        { id_lote: 5001, producto: "Queso Mozzarella Bloque", almacen: "Sede Central - El Poblado", cantidad: 45, fecha_vence: fechaCercana },
        { id_lote: 5002, producto: "Harina de Trigo Premium", almacen: "Centro de Distribución - Envigado", cantidad: 120, fecha_vence: fechaLejana }
    ];

    // 3. Poblar selectores desplegables
    function inicializarSelectores() {
        selectProducto.innerHTML = productos.map(p => `<option value="${p.desc}">${p.desc}</option>`).join('');
        selectAlmacen.innerHTML = almacenes.map(a => `<option value="${a.nombre}">${a.nombre}</option>`).join('');
    }

    // 4. Calcular alertas y renderizar tablas
    function procesarInventario() {
        tablaBody.innerHTML = '';
        contenedorAlertas.innerHTML = '';
        let alertasHTML = '';

        lotesPrueba.forEach(l => {
            // Calcular diferencia de días
            const fVence = new Date(l.fecha_vence);
            const fHoy = new Date(hoy.toISOString().split('T')[0]); // Sin horas
            const diferenciaTiempo = fVence.getTime() - fHoy.getTime();
            const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

            let estadoTexto = 'Estable';
            let estadoColor = '#28a745';

            if (diferenciaDias <= 0) {
                estadoTexto = '⚠️ VENCIDO';
                estadoColor = '#dc3545';
            } else if (diferenciaDias <= 30) {
                estadoTexto = '⏳ Próximo a vencer';
                estadoColor = '#ff9f43';

                // Inyectar tarjeta en el bloque de alertas superiores
                alertasHTML += `
                    <div style="background: rgba(255, 159, 67, 0.1); border-left: 4px solid #ff9f43; padding: 0.8rem; margin-bottom: 0.5rem; border-radius: 4px; display: flex; justify-content: space-between; color: white;">
                        <span><strong>${l.producto}</strong> en <em>${l.almacen}</em> (Lote #${l.id_lote})</span>
                        <span style="color: #ff9f43; font-weight: bold;">¡Vence en ${diferenciaDias} días! (${l.fecha_vence})</span>
                    </div>`;
            }

            // Pintar fila en la tabla general
            const fila = document.createElement('tr');
            fila.style.borderBottom = '1px solid #2c2c35';
            fila.innerHTML = `
                <td style="padding: 0.8rem; color: #ff9f43; font-weight: bold;">LT-${l.id_lote}</td>
                <td style="padding: 0.8rem; color: white; font-weight: bold;">${l.producto}</td>
                <td style="padding: 0.8rem; color: #8a8a98;">${l.almacen}</td>
                <td style="padding: 0.8rem; color: white;">${l.cantidad} unidades</td>
                <td style="padding: 0.8rem; color: #8a8a98;">${l.fecha_vence}</td>
                <td style="padding: 0.8rem;"><span style="color: ${estadoColor}; font-weight: bold;">${estadoTexto}</span></td>
            `;
            tablaBody.appendChild(fila);
        });

        // Si no hay alertas críticas, poner mensaje de tranquilidad
        contenedorAlertas.innerHTML = alertasHTML || `<p style="color: #8a8a98; font-size: 0.95rem; margin: 0;">✅ Todos los lotes vigentes cuentan con un margen seguro de consumo mayor a 30 días.</p>`;
    }

    // 5. Capturar formulario de nuevo lote
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nuevoLote = {
            id_lote: lotesPrueba.length > 0 ? lotesPrueba[lotesPrueba.length - 1].id_lote + 1 : 5001,
            producto: selectProducto.value,
            almacen: selectAlmacen.value,
            cantidad: parseInt(document.getElementById('cantidad').value),
            fecha_vence: document.getElementById('fecha-vencimiento').value
        };

        lotesPrueba.push(nuevoLote);
        form.reset();
        procesarInventario();
    });

    // Carga Inicial
    inicializarSelectores();
    procesarInventario();
});