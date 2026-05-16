const API_BASE_URL = 'http://localhost:3000/api';

const API = {
    // ==================== PROVEEDORES ====================
    async getProveedores() {
        const res = await fetch(`${API_BASE_URL}/proveedores`);
        return await res.json();
    },

    async createProveedor(data) {
        // CORREGIDO: Se cambiaron las comillas simples por comillas invertidas (backticks)
        const res = await fetch(`${API_BASE_URL}/proveedores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    },

    async deleteProveedor(id) {
        // CORREGIDO: Se cambiaron las comillas simples por comillas invertidas (backticks)
        const res = await fetch(`${API_BASE_URL}/proveedores/${id}`, { 
            method: 'DELETE' 
        });
        return await res.json();
    },

    // ==================== PRODUCTOS ====================
    async getProductos() {
        const res = await fetch(`${API_BASE_URL}/productos`);
        return await res.json();
    },

    async createProducto(data) {
        // CORREGIDO: Se cambiaron las comillas simples por comillas invertidas
        const res = await fetch(`${API_BASE_URL}/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    },

    // ==================== ALMACENES ====================
    async getAlmacenes() {
        const res = await fetch(`${API_BASE_URL}/almacenes`);
        return await res.json();
    },

    // ==================== LOTES Y VENCIMIENTOS ====================
    async getLotes(filtros = {}) {
        const params = new URLSearchParams(filtros).toString();
        const res = await fetch(`${API_BASE_URL}/lotes?${params}`);
        return await res.json();
    },

    async getProximosVencer(dias = 30) {
        const res = await fetch(`${API_BASE_URL}/lotes/proximos-vencer?dias=${dias}`);
        return await res.json();
    },

    async createLote(data) {
        const res = await fetch(`${API_BASE_URL}/lotes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    }
};