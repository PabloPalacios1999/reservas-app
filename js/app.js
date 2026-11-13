// =========================================================================
// CONSTANTES GLOBALES
// =========================================================================
const STORAGE_KEY = 'reservas_cancha_sintetica';
const KEY_INSTITUCION_SELECCIONADA = 'klo_institucion_elegida';

// =========================================================================
// 1. FUNCIÓN GLOBAL PARA EL BOTÓN DE main.html
// =========================================================================
function irAReservar() {
  const selectInstitucionMain = document.getElementById('selectInstitucionMain');
  const elegida = selectInstitucionMain ? selectInstitucionMain.value.trim() : '';

  if (elegida) {
    sessionStorage.setItem(KEY_INSTITUCION_SELECCIONADA, elegida);
  } else {
    sessionStorage.removeItem(KEY_INSTITUCION_SELECCIONADA);
  }

  window.location.href = 'reservas.html';
}

// =========================================================================
// 2. MÉTODOS CRUD CON LOCALSTORAGE
// =========================================================================
function obtenerReservas() {
  const datos = localStorage.getItem(STORAGE_KEY);
  const lista = datos ? JSON.parse(datos) : [];

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
    const reservasFiltradas = reservas.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservasFiltradas));
    ejecutarLogicaSegunPantalla();
  }
}

// =========================================================================
// 3. CONTROLADORES DE RENDERIZADO PARA CADA PANTALLA
// =========================================================================
function ejecutarLogicaSegunPantalla() {
  const reservas = obtenerReservas();

  const tablaReservas = document.getElementById('tablaReservas');
  if (tablaReservas) {
    renderizarPantallaRegistro(reservas, tablaReservas);
    return;
  }

  const tablaConsultas = document.getElementById('tablaConsultas');
  if (tablaConsultas) {
    renderizarPantallaConsultas(reservas, tablaConsultas);
  }
}

function renderizarPantallaRegistro(reservas, contenedorTabla) {
  contenedorTabla.innerHTML = '';
  const filtroFecha = document.getElementById('filtroFecha');

  let listaFiltrada = reservas;
  if (filtroFecha && filtroFecha.value) {
    listaFiltrada = reservas.filter((item) => item.fecha === filtroFecha.value);
  }

  if (listaFiltrada.length === 0) {
    contenedorTabla.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted py-4">No hay reservas programadas.</td>
      </tr>`;
    return;
  }

  listaFiltrada.forEach((reserva) => {
    const fila = document.createElement('tr');
    const fechaFormateada = reserva.fecha.split('-').reverse().join('/');
    const institucionTexto = reserva.institucion || 'Sin institución';

    fila.innerHTML = `
      <td>
        <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 text-wrap text-start">
          ${institucionTexto}
        </span>
      </td>
      <td>
        <div class="fw-bold text-dark">${reserva.profesor}</div>
        ${reserva.notas ? `<small class="text-muted d-block text-truncate" style="max-width: 160px;">📝 ${reserva.notas}</small>` : ''}
      </td>
      <td><span class="badge bg-secondary-subtle text-secondary-emphasis">${reserva.materia}</span></td>
      <td>
        <div class="small fw-semibold text-success">${fechaFormateada}</div>
        <div class="small text-muted">${reserva.horaInicio} - ${reserva.horaFin}</div>
      </td>
      <td>
        <button class="btn btn-sm btn-outline-danger" onclick="eliminarReserva('${reserva.id}')" title="Eliminar">🗑️</button>
      </td>
    `;
    contenedorTabla.appendChild(fila);
  });
}

function renderizarPantallaConsultas(reservas, contenedorTabla) {
  contenedorTabla.innerHTML = '';

  const filtroInstitucion = document.getElementById('filtroInstitucion');
  const filtroProfesor = document.getElementById('filtroProfesor');
  const filtroFecha = document.querySelector('#filtroForm #filtroFecha');
  const totalReservasBadge = document.getElementById('totalReservasBadge');

  let listaFiltrada = reservas;

  if (filtroInstitucion && filtroInstitucion.value !== '') {
    listaFiltrada = listaFiltrada.filter((item) => item.institucion === filtroInstitucion.value);
  }

  if (filtroProfesor && filtroProfesor.value.trim() !== '') {
    const busqueda = filtroProfesor.value.toLowerCase();
    listaFiltrada = listaFiltrada.filter((item) =>
      item.profesor.toLowerCase().includes(busqueda)
    );
  }

  if (filtroFecha && filtroFecha.value) {
    listaFiltrada = listaFiltrada.filter((item) => item.fecha === filtroFecha.value);
  }

  if (totalReservasBadge) {
    totalReservasBadge.textContent = `${listaFiltrada.length} ${listaFiltrada.length === 1 ? 'Reserva' : 'Reservas'}`;
  }

  if (listaFiltrada.length === 0) {
    contenedorTabla.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted py-4">
          🔍 No se encontraron coincidencias en el sistema de reservas.
        </td>
      </tr>`;
    return;
  }

  listaFiltrada.forEach((reserva) => {
    const fila = document.createElement('tr');
    const fechaFormateada = reserva.fecha.split('-').reverse().join('/');
    const institucionTexto = reserva.institucion || 'No especificada';

    fila.innerHTML = `
      <td>
        <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 text-wrap text-start">
          ${institucionTexto}
        </span>
      </td>
      <td class="fw-bold text-dark">${reserva.profesor}</td>
      <td><span class="badge bg-secondary-subtle text-secondary-emphasis">${reserva.materia}</span></td>
      <td class="text-secondary fw-semibold">${fechaFormateada}</td>
      <td class="text-muted small">${reserva.horaInicio} - ${reserva.horaFin}</td>
      <td class="text-muted fst-italic">${reserva.notas ? `📋 ${reserva.notas}` : '<span>-</span>'}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger py-1 px-2" onclick="eliminarReserva('${reserva.id}')" title="Cancelar Reserva">
          🗑️ Cancelar
        </button>
      </td>
    `;
    contenedorTabla.appendChild(fila);
  });
}

// =========================================================================
// 4. INICIALIZACIÓN DE EVENTOS AL CARGAR EL DOM
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // --- A. LOGIN (index.html) ---
  const loginForm = document.getElementById('loginForm');
  const alertBox = document.getElementById('alertBox');

  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      event.stopPropagation();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      if (!email || !password) {
        loginForm.classList.add('was-validated');
        if (alertBox) {
          alertBox.className = 'alert alert-danger mt-3 d-block';
          alertBox.textContent = 'Por favor completa todos los campos.';
        }
        return;
      }

      if ((email === '1234' && password === '1234') || (email === 'admin@gmail.com' && password === '1234')) {
        if (alertBox) {
          alertBox.className = 'alert alert-success mt-3 d-block';
          alertBox.textContent = '¡Inicio de sesión exitoso! Redirigiendo...';
        }
        setTimeout(() => {
          window.location.href = 'main.html';
        }, 500);
      } else {
        if (alertBox) {
          alertBox.className = 'alert alert-danger mt-3 d-block';
          alertBox.textContent = 'Correo o contraseña incorrectos.';
        }
      }
    });
  }

  // --- B. SELECTOR DE INSTITUCIÓN EN reservas.html ---
  const bloqueFijo = document.getElementById('bloqueInstitucionFija');
  const bloqueSelect = document.getElementById('bloqueInstitucionSelect');
  const inputFijo = document.getElementById('institucionFijaInput');
  const selectForm = document.getElementById('institucionSelect');
  const btnCambiar = document.getElementById('btnCambiarInstitucionForm');

  if (bloqueFijo && bloqueSelect) {
    const institucionGuardada = sessionStorage.getItem(KEY_INSTITUCION_SELECCIONADA);

    if (institucionGuardada) {
      if (inputFijo) inputFijo.value = institucionGuardada;
      bloqueFijo.classList.remove('d-none');
      bloqueSelect.classList.add('d-none');
      if (selectForm) selectForm.removeAttribute('required');
    } else {
      bloqueFijo.classList.add('d-none');
      bloqueSelect.classList.remove('d-none');
      if (selectForm) selectForm.setAttribute('required', 'required');
    }

    if (btnCambiar) {
      btnCambiar.addEventListener('click', () => {
        sessionStorage.removeItem(KEY_INSTITUCION_SELECCIONADA);
        bloqueFijo.classList.add('d-none');
        bloqueSelect.classList.remove('d-none');
        if (selectForm) {
          if (inputFijo) selectForm.value = inputFijo.value;
          selectForm.setAttribute('required', 'required');
          selectForm.focus();
        }
      });
    }
  }

 // --- C. FORMULARIO DE RESERVA (reservas.html) ---
  const reservaForm = document.getElementById('reservaForm');
  const fechaInput = document.getElementById('fecha');

  // Obtener la fecha actual en formato local YYYY-MM-DD
  function obtenerFechaHoyLocal() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  // Bloquear días anteriores directamente en el selector de fecha del navegador
  if (fechaInput) {
    fechaInput.setAttribute('min', obtenerFechaHoyLocal());
  }


  if (reservaForm) {
    reservaForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fechaSeleccionada = document.getElementById('fecha').value;
      const horaInicio = document.getElementById('horaInicio').value;
      const horaFin = document.getElementById('horaFin').value;
      const hoy = obtenerFechaHoyLocal();

      // Obtener institución (cuadro fijo o select) antes de validar
      let institucionFinal = '';
      if (bloqueFijo && !bloqueFijo.classList.contains('d-none') && inputFijo) {
        institucionFinal = inputFijo.value;
      } else if (selectForm) {
        institucionFinal = selectForm.value;
      }

      // 1. Validar que la fecha no sea anterior a hoy
      if (fechaSeleccionada < hoy) {
        alert('⚠️ No puedes reservar en una fecha anterior al día de hoy.');
        return;
      }

      // 2. Validar que la hora de fin sea posterior a la hora de inicio
      if (horaFin <= horaInicio) {
        alert('⚠️ La hora de finalización debe ser posterior a la hora de inicio.');
        return;
      }

      // 3. Validar que el horario no se cruce en la MISMA institución y fecha
      const reservasExistentes = obtenerReservas();
      const reservaCruzada = reservasExistentes.find((r) => {
        if (r.institucion !== institucionFinal) return false; // Permite reservar si es otra institución
        if (r.fecha !== fechaSeleccionada) return false;
        return horaInicio < r.horaFin && horaFin > r.horaInicio;
      });

      if (reservaCruzada) {
        alert(
          `⚠️ Este horario ya está ocupado en ${institucionFinal}.\n` +
          `Reserva existente: ${reservaCruzada.horaInicio} a ${reservaCruzada.horaFin} ` +
          `(${reservaCruzada.profesor} - ${reservaCruzada.materia}).`
        );
        return;
      }

      const nuevaReserva = {
        id: Date.now().toString(),
        institucion: institucionFinal,
        profesor: document.getElementById('profesor').value.trim(),
        materia: document.getElementById('materia').value.trim(),
        fecha: fechaSeleccionada,
        horaInicio: horaInicio,
        horaFin: horaFin,
        notas: document.getElementById('notas').value.trim(),
      };

      guardarReserva(nuevaReserva);
      reservaForm.reset();

      // Volver a aplicar la fecha mínima y la institución fija tras limpiar
      if (fechaInput) fechaInput.setAttribute('min', obtenerFechaHoyLocal());
      const instActual = sessionStorage.getItem(KEY_INSTITUCION_SELECCIONADA);
      if (instActual && inputFijo) {
        inputFijo.value = instActual;
      }

      ejecutarLogicaSegunPantalla();
    });
  }



// --- D. FILTROS EN RESERVAS Y CONSULTAS ---
const filtroFechaPrincipal = document.getElementById('filtroFecha');
if (filtroFechaPrincipal) {
filtroFechaPrincipal.addEventListener('change', ejecutarLogicaSegunPantalla);
}
const filtroInstitucion = document.getElementById('filtroInstitucion');
if (filtroInstitucion) {
filtroInstitucion.addEventListener('change', ejecutarLogicaSegunPantalla);
}
const filtroProfesor = document.getElementById('filtroProfesor');
if (filtroProfesor) {
filtroProfesor.addEventListener('input', ejecutarLogicaSegunPantalla);
}
const filtroFechaConsulta = document.querySelector('#filtroForm #filtroFecha');
if (filtroFechaConsulta) {
filtroFechaConsulta.addEventListener('change', ejecutarLogicaSegunPantalla);
}
const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');
if (btnLimpiarFiltros) {
btnLimpiarFiltros.addEventListener('click', () => {
if (filtroInstitucion) filtroInstitucion.value = '';
if (filtroProfesor) filtroProfesor.value = '';
if (filtroFechaConsulta) filtroFechaConsulta.value = '';
ejecutarLogicaSegunPantalla();
});
}
// Renderizado inicial de tablas
ejecutarLogicaSegunPantalla();
});
