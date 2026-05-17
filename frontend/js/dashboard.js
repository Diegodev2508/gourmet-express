document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Cargar métricas en paralelo
        const [resP, resProd, resA, resL] = await Promise.all([
            fetch('http://localhost:3000/api/proveedores'),
            fetch('http://localhost:3000/api/productos'),
            fetch('http://localhost:3000/api/almacenes'),
            fetch('http://localhost:3000/api/lotes')
        ]);

        const [proveedores, productos, almacenes, lotes] = await Promise.all([
            resP.json(), resProd.json(), resA.json(), resL.json()
        ]);

        // 2. Inyectar cantidades — la API devuelve { total, data }
        document.getElementById('metric-proveedores').textContent = proveedores.total || 0;
        document.getElementById('metric-productos').textContent   = productos.total  || 0;
        document.getElementById('metric-almacenes').textContent   = almacenes.total  || 0;
        document.getElementById('metric-lotes').textContent       = lotes.total      || 0;

        // 3. Calcular alertas de vencimiento desde los lotes cargados
        const hoy = new Date();
        const lotesData = lotes.data || [];
        const proximosVencer = lotesData.filter(l => {
            if (!l.fecha_vencimiento) return false;
            const fVence = new Date(l.fecha_vencimiento);
            const diff = Math.ceil((fVence - hoy) / (1000 * 60 * 60 * 24));
            return diff >= 0 && diff <= 30;
        });

        const contenedorAlertas = document.getElementById('contenedor-alertas');
        const alertasSeccion = document.getElementById('alertas-seccion');

        if (proximosVencer.length > 0) {
            if (alertasSeccion) alertasSeccion.style.display = 'block';
            contenedorAlertas.innerHTML = '';

            proximosVencer.forEach(lote => {
                const fVence = new Date(lote.fecha_vencimiento);
                const diff = Math.ceil((fVence - hoy) / (1000 * 60 * 60 * 24));
                const alerta = document.createElement('div');
                alerta.className = 'alert-box';
                alerta.innerHTML = `
                    <strong>Lote #${lote.id_lote}</strong> - Producto: <em>${lote.nombre_producto}</em>
                    está a solo <strong>${diff} días</strong> de vencer.
                    (Vence el: ${fVence.toLocaleDateString('es-CO')})
                `;
                contenedorAlertas.appendChild(alerta);
            });
        } else {
            if (contenedorAlertas) {
                contenedorAlertas.innerHTML = `<p style="color:#8a8a98; margin:0;">✅ Todos los lotes tienen un margen seguro mayor a 30 días.</p>`;
            }
        }

    } catch (error) {
        console.error('Error cargando los datos del dashboard:', error);
    }
});