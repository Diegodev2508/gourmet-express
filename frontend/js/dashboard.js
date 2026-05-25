document.addEventListener('DOMContentLoaded', async () => {
    // Fecha actual
    document.getElementById('fecha-actual').textContent =
        new Date().toLocaleDateString('es-CO', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

    try {
        const [resP, resProd, resA, resL] = await Promise.all([
            fetch('http://localhost:3000/api/proveedores'),
            fetch('http://localhost:3000/api/productos'),
            fetch('http://localhost:3000/api/almacenes'),
            fetch('http://localhost:3000/api/lotes')
        ]);

        const [proveedores, productos, almacenes, lotes] = await Promise.all([
            resP.json(), resProd.json(), resA.json(), resL.json()
        ]);

        const lotesData    = lotes.data      || [];
        const productosData = productos.data || [];
        const almacenesData = almacenes.data || [];

        // ── MÉTRICAS ──────────────────────────────────────────
        animarContador('metric-proveedores', proveedores.total || 0);
        animarContador('metric-productos',   productos.total   || 0);
        animarContador('metric-almacenes',   almacenes.total   || 0);
        animarContador('metric-lotes',       lotes.total       || 0);

        // ── ALERTAS ───────────────────────────────────────────
        const hoy = new Date();
        const proximosVencer = lotesData.filter(l => {
            if (!l.fecha_vencimiento) return false;
            const diff = Math.ceil((new Date(l.fecha_vencimiento) - hoy) / 86400000);
            return diff >= 0 && diff <= 30;
        });

        const alertasSeccion    = document.getElementById('alertas-seccion');
        const contenedorAlertas = document.getElementById('contenedor-alertas');

        if (proximosVencer.length > 0) {
            alertasSeccion.style.display = 'block';
            contenedorAlertas.innerHTML = proximosVencer.map(lote => {
                const diff = Math.ceil((new Date(lote.fecha_vencimiento) - hoy) / 86400000);
                const color = diff <= 7 ? '#ff4d4d' : '#ff9f43';
                return `
                    <div style="display:flex; justify-content:space-between; align-items:center;
                        background:rgba(255,77,77,0.08); border-left:3px solid ${color};
                        padding:0.7rem 1rem; border-radius:4px; margin-bottom:0.5rem;">
                        <span style="color:white;">
                            <strong>Lote #${lote.id_lote}</strong> —
                            <em>${lote.nombre_producto}</em> en ${lote.nombre_almacen}
                        </span>
                        <span style="color:${color}; font-weight:bold; white-space:nowrap; margin-left:1rem;">
                            ⏳ Vence en ${diff} día${diff !== 1 ? 's' : ''}
                            (${new Date(lote.fecha_vencimiento).toLocaleDateString('es-CO')})
                        </span>
                    </div>`;
            }).join('');
        } else {
            alertasSeccion.style.display = 'block';
            contenedorAlertas.innerHTML = `<p style="color:#2ecc71; margin:0;">✅ Todos los lotes tienen un margen seguro mayor a 30 días.</p>`;
        }

        // ── GRÁFICA: STOCK POR PRODUCTO ───────────────────────
        const stockPorProducto = {};
        lotesData.forEach(l => {
            stockPorProducto[l.nombre_producto] = (stockPorProducto[l.nombre_producto] || 0) + l.cantidad;
        });

        new Chart(document.getElementById('grafica-stock'), {
            type: 'bar',
            data: {
                labels: Object.keys(stockPorProducto),
                datasets: [{
                    label: 'Unidades',
                    data: Object.values(stockPorProducto),
                    backgroundColor: ['#ff9f43','#4ecdc4','#a29bfe','#2ecc71','#ff4d4d','#74b9ff'],
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: '#8a8a98' }, grid: { color: '#2c2c35' } },
                    y: { ticks: { color: '#8a8a98' }, grid: { color: '#2c2c35' }, beginAtZero: true }
                }
            }
        });

        // ── GRÁFICA: LOTES POR ALMACÉN ────────────────────────
        const lotesPorAlmacen = {};
        lotesData.forEach(l => {
            lotesPorAlmacen[l.nombre_almacen] = (lotesPorAlmacen[l.nombre_almacen] || 0) + 1;
        });

        new Chart(document.getElementById('grafica-almacenes'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(lotesPorAlmacen),
                datasets: [{
                    data: Object.values(lotesPorAlmacen),
                    backgroundColor: ['#ff9f43','#4ecdc4','#a29bfe','#2ecc71','#ff4d4d','#74b9ff'],
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#8a8a98', padding: 12, font: { size: 11 } }
                    }
                }
            }
        });

        // ── TABLA INVENTARIO ──────────────────────────────────
        const tabla = document.getElementById('tabla-inventario');
        tabla.innerHTML = lotesData.map(l => {
            const diff = l.fecha_vencimiento
                ? Math.ceil((new Date(l.fecha_vencimiento) - hoy) / 86400000)
                : null;

            let estadoColor = '#2ecc71';
            let estadoTexto = 'Estable';
            if (diff === null)    { estadoColor = '#8a8a98'; estadoTexto = 'Sin fecha'; }
            else if (diff <= 0)   { estadoColor = '#ff4d4d'; estadoTexto = '⚠️ Vencido'; }
            else if (diff <= 30)  { estadoColor = '#ff9f43'; estadoTexto = '⏳ Por vencer'; }

            return `
                <tr style="border-bottom:1px solid #2c2c35;">
                    <td style="padding:0.8rem; color:#ff9f43; font-weight:bold;">LT-${l.id_lote}</td>
                    <td style="padding:0.8rem; color:white;">${l.nombre_producto}</td>
                    <td style="padding:0.8rem; color:#8a8a98;">${l.nombre_almacen}</td>
                    <td style="padding:0.8rem; color:white; font-weight:bold;">${l.cantidad} uds</td>
                    <td style="padding:0.8rem; color:#8a8a98;">
                        ${l.fecha_vencimiento ? new Date(l.fecha_vencimiento).toLocaleDateString('es-CO') : '—'}
                    </td>
                    <td style="padding:0.8rem;">
                        <span style="color:${estadoColor}; font-weight:bold;">${estadoTexto}</span>
                    </td>
                </tr>`;
        }).join('');

    } catch (error) {
        console.error('Error cargando dashboard:', error);
    }
});

// ── ANIMACIÓN CONTADORES ──────────────────────────────────
function animarContador(id, objetivo) {
    const el = document.getElementById(id);
    let actual = 0;
    const paso = Math.ceil(objetivo / 30);
    const intervalo = setInterval(() => {
        actual = Math.min(actual + paso, objetivo);
        el.textContent = actual;
        if (actual >= objetivo) clearInterval(intervalo);
    }, 40);
}