document.addEventListener('DOMContentLoaded', () => {
    const tablaBody = document.getElementById('tabla-almacenes-body');

    // Datos simulados fijos que representan las sedes físicas de la cadena
    const almacenesPrueba = [
        { id_almacen: 1, nombre: "Sede Central - El Poblado", direccion: "Carrera 43A #9-12" },
        { id_almacen: 2, nombre: "Planta de Producción - Laureles", direccion: "Avenida Nutibara #74-25" },
        { id_almacen: 3, nombre: "Centro de Distribución - Envigado", direccion: "Calle 38 Sur #41-10" }
    ];

    function cargarAlmacenes() {
        tablaBody.innerHTML = '';

        almacenesPrueba.forEach(a => {
            const fila = document.createElement('tr');
            fila.style.borderBottom = '1px solid #2c2c35';
            fila.innerHTML = `
                <td style="padding: 0.8rem; color: #ff9f43; font-weight: bold;">00${a.id_almacen}</td>
                <td style="padding: 0.8rem; color: white; font-weight: bold;">${a.nombre}</td>
                <td style="padding: 0.8rem; color: #8a8a98;">${a.direccion}</td>
            `;
            tablaBody.appendChild(fila);
        });
    }

    // Carga inicial
    cargarAlmacenes();
});