// Clave única para el almacenamiento de reservas en localStorage
const STORAGE_KEY = 'reservas_cancha_sintetica';

// --- 1. MÉTODOS CRUD CON LOCALSTORAGE ---
function obtenerReservas() {
    const datos = localStorage.getItem(STORAGE_KEY);
    const lista = datos ? JSON.parse(datos) : [];
    
    // Ordenamos cronológicamente por fecha y hora de inicio
    return lista.sort((a, b) => {
        if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
        return a.horaInicio.localeCompare(b.horaInicio);
    });
}

function guardarReserva(nuevaReserva) {
    const reservas = obtenerReservas();
    reservas.push(nuevaReserva);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
}

function eliminarReserva(id) {
    if (confirm('¿Está seguro de que desea eliminar esta reserva?')) {
        const reservas = obtenerReservas();
        const reservasFiltradas = reservas.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reservasFiltradas));
        
        // Refrescar la pantalla que corresponda
        ejecutarLogicaSegunPantalla();
    }
}

// --- 2. CONTROLADORES DE RENDERIZADO PARA CADA PANTALLA ---

// Orquestador principal que identifica la página web activa en el navegador
function ejecutarLogicaSegunPantalla() {
    const reservas = obtenerReservas();

    // Comprobamos si estamos en la Pantalla 1 (Maneja Formulario de Reservas)
    const tablaReservas = document.getElementById('tablaReservas');
    if (tablaReservas) {
        renderizarPantallaRegistro(reservas, tablaReservas);
        return;
    }

    // Comprobamos si estamos en la Pantalla 2 (Maneja Consultas y Filtros)
    const tablaConsultas = document.getElementById('tablaConsultas');
    if (tablaConsultas) {
        renderizarPantallaConsultas(reservas, tablaConsultas);
    }
}

// Renderizado específico para la tabla lateral de 'reservas.html' / 'index.html'
function renderizarPantallaRegistro(reservas, contenedorTabla) {
    contenedorTabla.innerHTML = '';
    const filtroFecha = document.getElementById('filtroFecha');
    
    let listaFiltrada = reservas;
    if (filtroFecha && filtroFecha.value) {
        listaFiltrada = reservas.filter(item => item.fecha === filtroFecha.value);
    }

    if (listaFiltrada.length === 0) {
        contenedorTabla.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-3">No hay reservas programadas.</td>
            </tr>`;
        return;
    }

    listaFiltrada.forEach(reserva => {
        const fila = document.createElement('tr');
        const fechaFormateada = reserva.fecha.split('-').reverse().join('/');
        
        fila.innerHTML = `
            <td>
                <div class="fw-bold">${reserva.profesor}</div>
                ${reserva.notas ? `<small class="text-muted d-block text-truncate" style="max-width: 180px;">📝 \ ${reserva.notas}</small>` : ''}
            </td>
            <td><span class="badge bg-secondary-subtle text-secondary-emphasis">${reserva.materia}</span></td>
            <td>
                <div class="small fw-semibold text-success">${fechaFormateada}</div>
                <div class="small text-muted">${reserva.horaInicio} - ${reserva.horaFin}</div>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarReserva('${reserva.id}')">🗑️</button>
            </td>
        `;
        contenedorTabla.appendChild(fila);
    });
}

// Renderizado detallado para la tabla ancha de 'consultas.html'
function renderizarPantallaConsultas(reservas, contenedorTabla) {
    contenedorTabla.innerHTML = '';
    
    const filtroProfesor = document.getElementById('filtroProfesor');
    const filtroFecha = document.querySelector('#filtroForm #filtroFecha');
    const totalReservasBadge = document.getElementById('totalReservasBadge');

    let listaFiltrada = reservas;

    // Filtro por nombre de Profesor (Búsqueda flexible en tiempo real)
    if (filtroProfesor && filtroProfesor.value.trim() !== '') {
        const busqueda = filtroProfesor.value.toLowerCase();
        listaFiltrada = listaFiltrada.filter(item => item.profesor.toLowerCase().includes(busqueda));
    }

    // Filtro por Fecha específica
    if (filtroFecha && filtroFecha.value) {
        listaFiltrada = listaFiltrada.filter(item => item.fecha === filtroFecha.value);
    }

    // Actualizamos el contador dinámico del badge de Bootstrap
    if (totalReservasBadge) {
        totalReservasBadge.textContent = `${listaFiltrada.length} ${listaFiltrada.length === 1 ? 'Reserva' : 'Reservas'}`;
    }

    if (listaFiltrada.length === 0) {
        contenedorTabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    🔍 No se encontraron coincidencias en el sistema de reservas.
                </td>
            </tr>`;
        return;
    }

    // Dibujamos la tabla ancha mapeando de forma exacta tus columnas del HTML
    listaFiltrada.forEach(reserva => {
        const fila = document.createElement('tr');
        const fechaFormateada = reserva.fecha.split('-').reverse().join('/');
        
        fila.innerHTML = `
            <td class="fw-bold text-dark">${reserva.profesor}</td>
            <td><span class="badge bg-success-subtle text-success-emphasis px-2.5">${reserva.materia}</span></td>
            <td class="text-secondary fw-semibold">${fechaFormateada}</td>
            <td class="text-muted small">${reserva.horaInicio} - ${reserva.horaFin}</td>
            <td class="text-muted italic">${reserva.notas ? `📋 \ ${reserva.notas}` : '<span class="text-light-emphasis">-</span>'}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger py-1 px-2" onclick="eliminarReserva('${reserva.id}')" title="Cancelar Reserva">
                    🗑️ Cancelar
                </button>
            </td>
        `;
        contenedorTabla.appendChild(fila);
    });
}

// --- 3. INICIALIZACIÓN DE EVENTOS AL CARGAR LA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Captura de elementos DOM de la Pantalla de Registro
    const reservaForm = document.getElementById('reservaForm');
    const filtroFechaPrincipal = document.getElementById('filtroFecha');
    
    // Captura de elementos DOM de la Pantalla de Consultas
    const filtroProfesor = document.getElementById('filtroProfesor');
    const filtroFechaConsulta = document.querySelector('#filtroForm #filtroFecha');
    const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');

    // Inicializar eventos de la Pantalla 1
    if (reservaForm) {
        reservaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nuevaReserva = {
                id: 'res_' + Date.now() + Math.random().toString(36).substr(2, 4), // ID alfanumérico seguro
                profesor: document.getElementById('profesor').value.trim(),
                materia: document.getElementById('materia').value.trim(),
                fecha: document.getElementById('fecha').value,
                horaInicio: document.getElementById('horaInicio').value,
                horaFin: document.getElementById('horaFin').value,
                notas: document.getElementById('notas').value.trim()
            };
            
            guardarReserva(nuevaReserva);
            reservaForm.reset();
            if (filtroFechaPrincipal) filtroFechaPrincipal.value = nuevaReserva.fecha;
            ejecutarLogicaSegunPantalla();
        });
    }
    if (filtroFechaPrincipal) {
        filtroFechaPrincipal.addEventListener('input', ejecutarLogicaSegunPantalla);
    }

    // Inicializar eventos de la Pantalla 2 (Filtros instantáneos)
    if (filtroProfesor) {
        filtroProfesor.addEventListener('input', ejecutarLogicaSegunPantalla);
    }
    if (filtroFechaConsulta) {
        filtroFechaConsulta.addEventListener('input', ejecutarLogicaSegunPantalla);
    }
    if (btnLimpiarFiltros) {
        btnLimpiarFiltros.addEventListener('click', () => {
            const filtroForm = document.getElementById('filtroForm');
            if (filtroForm) filtroForm.reset(); // Restablece los campos de texto y fecha
            ejecutarLogicaSegunPantalla(); // Vuelve a mostrar todo el listado completo
        });
    }

    // Ejecución inicial para dibujar los datos guardados de inmediato
    ejecutarLogicaSegunPantalla();
});
