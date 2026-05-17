document.addEventListener('DOMContentLoaded', () => {
  const tablaBody = document.getElementById('tabla-almacenes-body');

  async function cargarAlmacenes() {
    try {
      const respuesta = await fetch('http://localhost:3000/api/almacenes');

      if (!respuesta.ok) {
        throw new Error('Error al conectar con el servidor backend');
      }

      const json = await respuesta.json();
      // La API devuelve { total, data: [...] }
      const almacenesReal = json.data || json;

      tablaBody.innerHTML = '';

      if (almacenesReal.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="3" style="color: #8a8a98; padding: 1rem; text-align: center;">No hay almacenes registrados</td></tr>';
        return;
      }

      almacenesReal.forEach(a => {
        const fila = document.createElement('tr');
        fila.style.borderBottom = '1px solid #2c2c35';

        fila.innerHTML = `
          <td style="padding: 0.8rem; color: #ff9f43; font-weight: bold;">00${a.id_almacen}</td>
          <td style="padding: 0.8rem; color: white; font-weight: bold;">${a.nombre}</td>
          <td style="padding: 0.8rem; color: #8a8a98;">${a.ubicacion || 'Sin dirección'}</td>
        `;

        tablaBody.appendChild(fila);
      });

    } catch (error) {
      console.error('❌ Error en el fetch de almacenes:', error);
      tablaBody.innerHTML = `<tr><td colspan="3" style="color: #ff3333; padding: 1rem; text-align: center;">Error al cargar datos reales desde MySQL.</td></tr>`;
    }
  }

  cargarAlmacenes();
});