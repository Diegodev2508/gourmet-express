document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-proveedor');
    const contenedorTelefonos = document.getElementById('contenedor-telefonos');
    const btnAgregarTelefono = document.getElementById('btn-agregar-telefono');
    const tablaBody = document.getElementById('tabla-proveedores-body');

    // Manejo de Inputs Dinámicos para Atributos Multivalorados (Teléfonos)
    btnAgregarTelefono.addEventListener('click', () => {
        const nuevoInput = document.createElement('div');
        nuevoInput.style.display = 'flex';
        nuevoInput.style.gap = '0.5rem';
        nuevoInput.innerHTML = `
            <input type="text" class="input-telefono" required placeholder="Otro teléfono" style="flex:1; padding:0.6rem; background:#2c2c35; border:none; color:white; border-radius:4px;">
            <button type="button" class="btn-remover-tel" style="background:#ff4d4d; color:white; border:none; padding:0 0.8rem; border-radius:4px; cursor:pointer;">❌</button>
        `;
        contenedorTelefonos.appendChild(nuevoInput);

        nuevoInput.querySelector('.btn-remover-tel').addEventListener('click', () => {
            nuevoInput.remove();
        });
    });

    // Cargar los proveedores consumiendo el endpoint de la API
    async function cargarProveedores() {
        try {
            // Suponiendo que tu api.js ya tiene implementado el método para traer proveedores
            const proveedores = await API.getProveedores(); 
            tablaBody.innerHTML = '';

            if (!proveedores || proveedores.length === 0) {
                tablaBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:#8a8a98;">No hay proveedores registrados aún.</td></tr>`;
                return;
            }

            proveedores.forEach(p => {
                const fila = document.createElement('tr');
                fila.style.borderBottom = '1px solid #2c2c35';
                
                // Mapeo de la información estructurada
                const tels = Array.isArray(p.telefonos) ? p.telefonos.join(', ') : (p.telefonos || 'Sin teléfono');

                fila.innerHTML = `
                    <td style="padding: 0.8rem;">${p.id_proveedor}</td>
                    <td style="padding: 0.8rem; font-weight:bold; color:white;">${p.nombre_proveedor}</td>
                    <td style="padding: 0.8rem; color:#8a8a98;">${p.ciudad}, ${p.calle}</td>
                    <td style="padding: 0.8rem;"><span style="background:#2c2c35; padding:0.2rem 0.5rem; border-radius:4px; font-size:0.9rem; color:#ff9f43;">📞 ${tels}</span></td>
                    <td style="padding: 0.8rem; text-align: center;">
                        <button class="btn-eliminar" data-id="${p.id_proveedor}" style="background:transparent; border:1px solid #ff4d4d; color:#ff4d4d; padding:0.3rem 0.6rem; border-radius:4px; cursor:pointer; font-size:0.85rem;">Eliminar</button>
                    </td>
                `;
                tablaBody.appendChild(fila);
            });

            // Añadir manejadores para el botón eliminar
            document.querySelectorAll('.btn-eliminar').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    if (confirm(`¿Estás seguro de eliminar el proveedor con ID #${id}?`)) {
                        await API.deleteProveedor(id);
                        cargarProveedores();
                    }
                });
            });

        } catch (error) {
            console.error('Error cargando proveedores:', error);
        }
    }

    // Manejar el submit del formulario pasándole la estructura limpia al backend
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const inputsTel = document.querySelectorAll('.input-telefono');
        const listaTelefonos = Array.from(inputsTel).map(input => input.value.trim()).filter(val => val !== '');

        const payload = {
            nombre_proveedor: document.getElementById('nombre').value.trim(),
            ciudad: document.getElementById('ciudad').value.trim(),
            calle: document.getElementById('calle').value.trim(),
            telefonos: listaTelefonos // Enviado como arreglo para procesamiento relacional
        };

        try {
            await API.createProveedor(payload);
            form.reset();
            contenedorTelefonos.innerHTML = `<input type="text" class="input-telefono" required placeholder="Ej: 3001234567" style="width:100%; padding:0.6rem; background:#2c2c35; border:none; color:white; border-radius:4px;">`;
            cargarProveedores();
        } catch (error) {
            console.error('Error guardando proveedor:', error);
        }
    });

    // Inicializar los datos de la tabla al cargar la vista
    cargarProveedores();
});