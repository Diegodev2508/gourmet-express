document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Cargar métricas en paralelo llamando a la API centralizada
        const [proveedores, productos, almacenes, lotes] = await Promise.all([
            API.getProveedores(),
            API.getProductos(),
            API.getAlmacenes(),
            API.getLotes()
        ]);

        // 2. Inyectar las cantidades en el HTML (asumiendo que la API retorna un Array)
        document.getElementById('metric-proveedores').textContent = proveedores.length || 0;
        document.getElementById('metric-productos').textContent = productos.length || 0;
        document.getElementById('metric-almacenes').textContent = almacenes.length || 0;
        document.getElementById('metric-lotes').textContent = lotes.length || 0;

        // 3. Cargar alertas de vencimiento (Próximos 30 días)
        const proximosVencer = await API.getProximosVencer(30);
        const contenedorAlertas = document.getElementById('contenedor-alertas');
        const alertasSeccion = document.getElementById('alertas-seccion');

        if (proximosVencer && proximosVencer.length > 0) {
            alertasSeccion.style.display = 'block'; // Mostrar la sección si hay alertas
            contenedorAlertas.innerHTML = ''; // Limpiar previo

            proximosVencer.forEach(lote => {
                const alerta = document.createElement('div');
                alerta.className = 'alert-box';
                // Mostramos el nombre del producto y cuántos días le quedan calculados por MySQL
                alerta.innerHTML = `
                    <strong>Lote #${lote.id_lote}</strong> - Producto: <em>${lote.nombre_producto}</em> 
                    está a solo <strong>${lote.dias_para_vencer} días</strong> de vencer. 
                    (Vence el: ${new Date(lote.fecha_vencimiento).toLocaleDateString()})
                `;
                contenedorAlertas.appendChild(alerta);
            });
        }

    } catch (error) {
        console.error('Error cargando los datos del dashboard:', error);
    }
});