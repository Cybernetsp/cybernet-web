/* ==========================================================================
   👥 CYBERNET OS - MÓDULO DE PERSONAL, NÓMINA Y CALENDARIO MYSQL
   ========================================================================== */

// 🌐 RUTAS ABSOLUTAS A LA BASE DE DATOS MYSQL
window.URL_OBTENER_HORAS = "https://api.cybernetsp.com/obtener_horas.php";
window.URL_MODIFICAR_TURNO = "https://api.cybernetsp.com/modificar_turno.php";
window.URL_ELIMINAR_TURNO = "https://api.cybernetsp.com/eliminar_turno.php";
window.URL_GUARDAR_ADELANTO = "https://api.cybernetsp.com/guardar_adelanto.php";
window.URL_GUARDAR_HORAS_MANUAL =
  "https://api.cybernetsp.com/guardar_horas_manual.php";
window.URL_OBTENER_USUARIOS = "https://api.cybernetsp.com/obtener_usuarios.php"; // ¡Ruta Corregida!

window.ASISTENTES_BASE = [
  "ANGELICA",
  "KATHERINE",
  "LAURA",
  "MANUEL",
  "MANUP",
  "PABLO",
];
window.currentHorasStock = [];
window.usuariosCache = [];

window.filtroMesTurnos = new Date().getMonth();
window.filtroAnioTurnos = new Date().getFullYear();
window.filtroQuincenaTurnos = new Date().getDate() <= 15 ? 1 : 2;
window.asistenteSeleccionadoAdmin = "TODOS";

// OBTENER LISTA COMPLETA
function obtenerTodosLosAsistentes() {
  let setAsistentes = new Set(window.ASISTENTES_BASE);
  if (Array.isArray(window.usuariosCache)) {
    window.usuariosCache.forEach((u) => {
      let nom = (u.nombre || "").toUpperCase().trim();
      if (nom && nom !== "STAFF") setAsistentes.add(nom);
    });
  }
  if (Array.isArray(window.currentHorasStock)) {
    window.currentHorasStock.forEach((item) => {
      let v = (item.vendedor || "").toUpperCase().trim();
      if (v && v !== "STAFF") setAsistentes.add(v);
    });
  }
  return Array.from(setAsistentes).sort();
}

// VERIFICAR SUPERADMIN
function verificarSiEsSuperAdmin() {
  let user =
    sessionStorage.getItem("active_staff") ||
    localStorage.getItem("cyber_saved_staff") ||
    "STAFF";
  return user.toUpperCase().trim() === "CAMILO";
}

// 🔄 CARGAR USUARIOS DESDE MYSQL (NEQUI/TELÉFONOS)
window.cargarUsuariosBaseMySQL = async function () {
  try {
    let res = await fetch(window.URL_OBTENER_USUARIOS);
    let data = await res.json();
    if (data && data.status === "success") {
      window.usuariosCache = data.data_completa || [];
      if (Array.isArray(data.data) && data.data.length > 0) {
        window.ASISTENTES_BASE = data.data;
      }
    }
  } catch (e) {
    console.error("Error cargando usuarios (Nequi) desde MySQL:", e);
  }
};

// 👁️ ABRIR / CERRAR PANEL DE TURNOS
window.toggleShiftsPanel = function () {
  try {
    if (typeof haptic === "function") haptic();
  } catch (e) {}
  const overlay = document.getElementById("shiftsOverlay");
  if (!overlay) return;

  if (overlay.classList.contains("open") || overlay.style.display === "flex") {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    if (typeof cerrarTodasLasVentanas === "function") {
      try {
        cerrarTodasLasVentanas();
      } catch (e) {}
    }
    overlay.classList.add("open");
    overlay.style.setProperty("display", "flex", "important");
    overlay.style.setProperty("align-items", "center", "important");
    overlay.style.setProperty("justify-content", "center", "important");

    const esSuperAdmin = verificarSiEsSuperAdmin();
    const btnAde = document.getElementById("btnAdelantoCamilo");
    const btnNom = document.getElementById("btnNominaCamilo");

    if (esSuperAdmin) {
      if (btnAde)
        btnAde.style.setProperty("display", "inline-flex", "important");
      if (btnNom)
        btnNom.style.setProperty("display", "inline-flex", "important");
    } else {
      if (btnAde) btnAde.style.setProperty("display", "none", "important");
      if (btnNom) btnNom.style.setProperty("display", "none", "important");
    }

    window.cargarHorasDesdeMySQL();
  }
};

window.cargarHorasDesdeMySQL = function () {
  const container = document.getElementById("shiftsScrollArea");
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center; padding:45px; color:#0a84ff;">
      <div style="display:flex; flex-direction:column; align-items:center; gap:12px;">
        <svg class="spin-anim" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg>
        <span style="font-weight:700; font-size:0.9rem;">Sincronizando con MySQL...</span>
      </div>
    </div>`;

  fetch(window.URL_OBTENER_HORAS)
    .then(async (res) => {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        throw new Error("Formato inválido de PHP");
      }
    })
    .then((res) => {
      if (res && res.status === "success") {
        window.currentHorasStock = res.data || [];
        window.renderizarHorasEnPantalla();
      } else {
        container.innerHTML = `<div style="text-align:center; padding:30px; color:#ff453a; font-weight:700;">❌ ${res ? res.message : "Fallo de BD"}</div>`;
      }
    })
    .catch((err) => {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:#ff453a; font-weight:700;">❌ Error de Red</div>`;
    });
};

function parsearFechaTurno(fechaRaw) {
  if (!fechaRaw) return new Date();
  if (fechaRaw instanceof Date) return fechaRaw;
  let str = String(fechaRaw).trim().split(" ")[0];
  let parts = str.includes("/") ? str.split("/") : str.split("-");
  if (parts.length === 3) {
    if (parts[0].length === 4)
      return new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10),
      );
    else
      return new Date(
        parseInt(parts[2], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[0], 10),
      );
  }
  return new Date();
}

window.cambiarMesTurnos = function (mesIndex) {
  try {
    if (typeof haptic === "function") haptic();
  } catch (e) {}
  window.filtroMesTurnos = parseInt(mesIndex, 10);
  window.renderizarHorasEnPantalla();
};

window.cambiarQuincenaTurnos = function (quincena) {
  try {
    if (typeof haptic === "function") haptic();
  } catch (e) {}
  window.filtroQuincenaTurnos = quincena;
  window.renderizarHorasEnPantalla();
};

window.cambiarAsistenteAdmin = function (vendedor) {
  try {
    if (typeof haptic === "function") haptic();
  } catch (e) {}
  window.asistenteSeleccionadoAdmin = vendedor;
  window.renderizarHorasEnPantalla();
};

// 🎨 RENDERIZADOR PRINCIPAL CALENDARIO
window.renderizarHorasEnPantalla = function () {
  const container = document.getElementById("shiftsScrollArea");
  if (!container) return;

  const activeStaff = (
    sessionStorage.getItem("active_staff") ||
    localStorage.getItem("cyber_saved_staff") ||
    "STAFF"
  )
    .toUpperCase()
    .trim();
  const esSuperAdmin = verificarSiEsSuperAdmin();

  const dMes = window.filtroMesTurnos;
  const dAnio = window.filtroAnioTurnos;
  const esQ1 = window.filtroQuincenaTurnos === 1;

  const inicioDia = esQ1 ? 1 : 16;
  const finDia = esQ1 ? 15 : new Date(dAnio, dMes + 1, 0).getDate();
  const mesesNombres = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  let listaTodosAsistentes = obtenerTodosLosAsistentes();
  let todosLosRegistros = window.currentHorasStock;

  let datosFiltrados = todosLosRegistros.filter((item) => {
    let vendedorItem = (item.vendedor || "STAFF").toUpperCase().trim();
    let d = parsearFechaTurno(item.fecha);

    if (d.getMonth() !== dMes || d.getFullYear() !== dAnio) return false;
    let dia = d.getDate();
    if (esQ1 && dia > 15) return false;
    if (!esQ1 && dia <= 15) return false;

    if (!esSuperAdmin) return vendedorItem === activeStaff;
    else
      return (
        window.asistenteSeleccionadoAdmin === "TODOS" ||
        vendedorItem === window.asistenteSeleccionadoAdmin
      );
  });

  let opcionesMes = mesesNombres
    .map(
      (m, idx) =>
        `<option value="${idx}" ${idx === dMes ? "selected" : ""}>${m} ${dAnio}</option>`,
    )
    .join("");
  let selectorAsistentesAdmin = "";
  if (esSuperAdmin) {
    let optsAsistentes = `<option value="TODOS" ${window.asistenteSeleccionadoAdmin === "TODOS" ? "selected" : ""}>👥 Todos los Asistentes</option>`;
    listaTodosAsistentes.forEach((asist) => {
      optsAsistentes += `<option value="${asist}" ${window.asistenteSeleccionadoAdmin === asist ? "selected" : ""}>👤 ${asist}</option>`;
    });
    selectorAsistentesAdmin = `<select class="input-ios" style="margin:0; padding:10px 14px; border-radius:12px; font-weight:800; font-size:0.85rem; color:#0a84ff; background:#18181c; border:1px solid rgba(10,132,255,0.3);" onchange="cambiarAsistenteAdmin(this.value)">${optsAsistentes}</select>`;
  }

  let btnQ1Style = esQ1
    ? "background: #0a84ff; color: #fff;"
    : "background: rgba(10,132,255,0.12); color: #0a84ff; border: 1px solid rgba(10,132,255,0.3);";
  let btnQ2Style = !esQ1
    ? "background: #0a84ff; color: #fff;"
    : "background: rgba(10,132,255,0.12); color: #0a84ff; border: 1px solid rgba(10,132,255,0.3);";

  let htmlControles = `
    <div style="background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.08); padding: 14px; border-radius: 20px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: space-between; margin-bottom: 18px;">
      <div style="display: flex; gap: 8px; flex-wrap: wrap; flex: 1;">
        <select class="input-ios" style="margin:0; padding:10px 14px; border-radius:12px; font-weight:800; font-size:0.85rem; color:#ffffff; background:#18181c; border:1px solid rgba(255,255,255,0.15);" onchange="cambiarMesTurnos(this.value)">${opcionesMes}</select>
        <button class="btn-ios" type="button" style="padding: 10px 14px; border-radius: 12px; font-size: 0.82rem; font-weight: 800; ${btnQ1Style}" onclick="cambiarQuincenaTurnos(1)">Q1 (1-15)</button>
        <button class="btn-ios" type="button" style="padding: 10px 14px; border-radius: 12px; font-size: 0.82rem; font-weight: 800; ${btnQ2Style}" onclick="cambiarQuincenaTurnos(2)">Q2 (16-Fin)</button>
      </div>
      ${selectorAsistentesAdmin}
    </div>`;

  let mapaAsistentes = {};
  datosFiltrados.forEach((item) => {
    let asist = (item.vendedor || "STAFF").toUpperCase().trim();
    let d = parsearFechaTurno(item.fecha);
    let diaNum = d.getDate();
    if (!mapaAsistentes[asist]) mapaAsistentes[asist] = {};
    if (!mapaAsistentes[asist][diaNum]) mapaAsistentes[asist][diaNum] = [];
    mapaAsistentes[asist][diaNum].push(item);
  });

  let asistentesAMostrar = [];
  if (!esSuperAdmin) {
    asistentesAMostrar = [activeStaff];
  } else {
    if (window.asistenteSeleccionadoAdmin !== "TODOS")
      asistentesAMostrar = [window.asistenteSeleccionadoAdmin];
    else {
      let conRegistros = Object.keys(mapaAsistentes);
      asistentesAMostrar =
        conRegistros.length > 0 ? conRegistros : listaTodosAsistentes;
    }
  }

  let htmlCuerpo = htmlControles;

  asistentesAMostrar.forEach((asistente) => {
    let turnosPorDia = mapaAsistentes[asistente] || {};
    let totalPagoAsistente = 0;
    let totalHorasSegundos = 0;

    let primerDiaFecha = new Date(dAnio, dMes, inicioDia);
    let offsetDias = primerDiaFecha.getDay();

    let celdasCalendario = diasSemana
      .map(
        (d) =>
          `<div style="text-align: center; font-size: 0.68rem; font-weight: 800; color: #8e8e93; text-transform: uppercase; padding-bottom: 6px;">${d}</div>`,
      )
      .join("");

    for (let o = 0; o < offsetDias; o++)
      celdasCalendario += `<div style="background: transparent;"></div>`;

    for (let dia = inicioDia; dia <= finDia; dia++) {
      let registrosDia = turnosPorDia[dia] || [];
      let tieneTurno = registrosDia.length > 0;
      let htmlRegistros = "";
      let sumaAdelantos = 0;
      let idsAdelantosArray = [];
      let turnosPuros = [];
      let adelantosPuros = [];

      registrosDia.forEach((reg) => {
        let totalMonto = parseFloat(reg.total) || 0;
        totalPagoAsistente += totalMonto;
        let tipoBadge = reg.estado || "Completado";
        let esDescuento =
          totalMonto < 0 || tipoBadge.toUpperCase().includes("ADELANTO");

        if (esDescuento) {
          adelantosPuros.push(reg);
          sumaAdelantos += totalMonto;
          idsAdelantosArray.push(reg.id);
        } else {
          turnosPuros.push(reg);
          let tStr = reg.tiempo_trabajado || "00:00:00";
          if (tStr !== "00:00:00") {
            let p = tStr.split(":");
            if (p.length >= 2)
              totalHorasSegundos +=
                (parseInt(p[0], 10) || 0) * 3600 +
                (parseInt(p[1], 10) || 0) * 60;
          }
        }
      });

      turnosPuros.forEach((reg) => {
        let valorAbsolutoFormateado = Math.abs(
          Math.round(reg.total),
        ).toLocaleString("es-CO");
        let btnSuperAdmin = "";
        if (esSuperAdmin) {
          btnSuperAdmin = `
            <div style="display: flex !important; justify-content: center !important; align-items: center !important; gap: 6px !important; margin-top: 6px !important; width: 100% !important;">
              <button type="button" onclick="window.modificarTurnoSuperAdmin('${reg.id}', '${asistente}', '${reg.fecha}', '${reg.tiempo_trabajado}')" style="background: rgba(10, 132, 255, 0.25) !important; border: 1px solid #0a84ff !important; border-radius: 8px !important; padding: 4px 8px !important; cursor: pointer !important; display: inline-flex !important; align-items: center !important;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0a84ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block !important;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button type="button" onclick="window.eliminarTurnoSuperAdmin('${reg.id}')" style="background: rgba(255, 69, 58, 0.25) !important; border: 1px solid #ff453a !important; border-radius: 8px !important; padding: 4px 8px !important; cursor: pointer !important; display: inline-flex !important; align-items: center !important;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#ff453a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block !important;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>`;
        }

        htmlRegistros += `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; width: 100%; margin-top: 4px;">
            <span style="font-size: 0.75rem; font-weight: 800; color: #0a84ff; font-family: monospace;">${reg.tiempo_trabajado !== "00:00:00" ? reg.tiempo_trabajado : "Turno"}</span>
            <span style="font-size: 0.8rem; font-weight: 900; color: #30d158; font-family: monospace;">$${valorAbsolutoFormateado}</span>
            ${btnSuperAdmin}
          </div>`;
      });

      if (adelantosPuros.length > 0) {
        let valorUnificadoMonto = Math.abs(
          Math.round(sumaAdelantos),
        ).toLocaleString("es-CO");
        let botonBorrarAdelantos = "";
        if (esSuperAdmin) {
          botonBorrarAdelantos = `
            <div style="display: flex !important; justify-content: center !important; margin-top: 4px !important; width: 100% !important;">
              <button type="button" onclick="window.eliminarMultiplesTurnosSuperAdmin('${idsAdelantosArray.join(",")}')" style="background: rgba(255, 69, 58, 0.25) !important; border: 1px solid #ff453a !important; border-radius: 8px !important; padding: 4px 8px !important; cursor: pointer !important; display: inline-flex !important; align-items: center !important;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#ff453a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block !important;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>`;
        }

        htmlRegistros += `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; width: 100%; margin-top: 8px; padding-top: 6px; border-top: 1px dashed rgba(255, 69, 58, 0.3);">
            <span style="font-size: 0.65rem; font-weight: 800; color: #ff453a; text-transform: uppercase;">Adelanto</span>
            <span style="font-size: 0.78rem; font-weight: 900; color: #ff453a; font-family: monospace;">-$${valorUnificadoMonto}</span>
            ${botonBorrarAdelantos}
          </div>`;
      }

      let bgCelda = tieneTurno
        ? "rgba(255, 255, 255, 0.04)"
        : "rgba(0,0,0,0.2)";
      let borderCelda = tieneTurno
        ? "1px solid rgba(10, 132, 255, 0.3)"
        : "1px solid rgba(255, 255, 255, 0.05)";

      celdasCalendario += `
        <div style="background: ${bgCelda} !important; border: ${borderCelda} !important; border-radius: 12px !important; padding: 6px !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: flex-start !important; min-height: 115px !important; box-sizing: border-box !important; position: relative !important;">
          <span style="font-size: 0.75rem !important; font-weight: 800 !important; color: ${tieneTurno ? "#ffffff" : "#71717a"} !important; align-self: flex-start !important; margin-bottom: 4px !important;">${dia}</span>
          ${htmlRegistros}
        </div>`;
    }

    let tHoras = Math.floor(totalHorasSegundos / 3600);
    let tMins = Math.floor((totalHorasSegundos % 3600) / 60);
    let tiempoFormateadoTotal = `${String(tHoras).padStart(2, "0")}h ${String(tMins).padStart(2, "0")}m`;
    let pagoFormateadoTotal =
      "$" + Math.round(totalPagoAsistente).toLocaleString("es-CO");
    let colorNetoTotal = totalPagoAsistente < 0 ? "#ff453a" : "#30d158";

    htmlCuerpo += `
      <div class="card-ios" style="padding: 20px; margin-bottom: 20px; border-radius: 24px; background: rgba(255, 255, 255, 0.025); border: 1px solid rgba(255, 255, 255, 0.08);">
        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; margin-bottom: 14px; border-bottom: 1px dashed rgba(255, 255, 255, 0.1);">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(10, 132, 255, 0.15); border: 1px solid rgba(10, 132, 255, 0.3); color: #0a84ff; font-weight: 900; font-size: 1.1rem; display: flex; align-items: center; justify-content: center;">
              ${asistente.charAt(0)}
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-weight: 800; font-size: 1.05rem; color: #ffffff;">${asistente}</span>
              <span style="font-size: 0.72rem; color: #a1a1aa;">Calendario de Turnos · ${esQ1 ? "Q1" : "Q2"} ${mesesNombres[dMes]}</span>
            </div>
          </div>
          <div style="display: flex; gap: 16px; text-align: right;">
            <div>
              <span style="display: block; font-size: 0.68rem; color: #a1a1aa; font-weight: 800; text-transform: uppercase;">Horas</span>
              <span style="font-weight: 800; color: #0a84ff; font-size: 1.1rem; font-family: monospace;">${tiempoFormateadoTotal}</span>
            </div>
            <div>
              <span style="display: block; font-size: 0.68rem; color: #a1a1aa; font-weight: 800; text-transform: uppercase;">Total Pago</span>
              <span style="font-weight: 900; color: ${colorNetoTotal}; font-size: 1.1rem; font-family: monospace;">${pagoFormateadoTotal}</span>
            </div>
          </div>
        </div>
        <div style="width: 100%; overflow-x: auto; padding-bottom: 10px;">
          <div style="min-width: 440px; display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;">
            ${celdasCalendario}
          </div>
        </div>
      </div>`;
  });

  container.innerHTML = htmlCuerpo;
};

// ==========================================
// MÓDULO: MODIFICAR / ELIMINAR / AGREGAR / ADELANTO
// ==========================================
window.toggleFormularioHoras = function () {
  try {
    if (typeof haptic === "function") haptic();
  } catch (e) {}
  const overlay = document.getElementById("addHoursOverlay");
  if (!overlay) return;

  if (overlay.classList.contains("open") || overlay.style.display === "flex") {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    overlay.classList.add("open");
    overlay.style.setProperty("display", "flex", "important");
    overlay.style.setProperty("align-items", "center", "important");
    overlay.style.setProperty("justify-content", "center", "important");

    const selectVendedor = document.getElementById("inputVendedorShift");
    if (selectVendedor) {
      let opts =
        '<option value="" disabled selected>Selecciona un asistente...</option>';
      obtenerTodosLosAsistentes().forEach((asist) => {
        opts += `<option value="${asist}">${asist}</option>`;
      });
      selectVendedor.innerHTML = opts;
    }
  }
};

window.toggleModalAdelanto = function (abrir) {
  try {
    if (typeof haptic === "function") haptic();
  } catch (e) {}
  const overlay = document.getElementById("adelantoShiftOverlay");
  if (!overlay) return;

  if (abrir) {
    overlay.classList.add("open");
    overlay.style.setProperty("display", "flex", "important");
    overlay.style.setProperty("align-items", "center", "important");
    overlay.style.setProperty("justify-content", "center", "important");

    const selectAde = document.getElementById("adeEmpleado");
    if (selectAde) {
      let opts =
        '<option value="" disabled selected>Selecciona un asistente...</option>';
      obtenerTodosLosAsistentes().forEach((asist) => {
        opts += `<option value="${asist}">${asist}</option>`;
      });
      selectAde.innerHTML = opts;
    }
  } else {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  }
};

window.ejecutarAdelantoDesdeShift = function (e) {
  if (e) e.preventDefault();
  const empleado = document.getElementById("adeEmpleado")
    ? document.getElementById("adeEmpleado").value
    : "";
  const montoInput = document.getElementById("adeMonto")
    ? document.getElementById("adeMonto").value
    : "";
  const monto = parseFloat(String(montoInput).replace(/\D/g, "")) || 0;

  if (!empleado || monto <= 0) {
    alert("⚠️ Selecciona un trabajador e ingresa un monto válido.");
    return;
  }

  const btn = document.getElementById("btnSubmitAdeShift");
  const originalText = btn ? btn.innerHTML : "Aplicar";
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = "Procesando...";
  }

  fetch(window.URL_GUARDAR_ADELANTO, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `vendedor=${encodeURIComponent(empleado)}&monto=${encodeURIComponent(monto)}`,
  })
    .then(async (res) => {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (err) {
        throw new Error("Error del servidor: " + text.substring(0, 100));
      }
    })
    .then((res) => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
      if (res && res.status === "success") {
        if (typeof triggerToast === "function")
          triggerToast(
            `<div style="color:var(--ios-green);">✅ Adelanto aplicado a ${empleado}</div>`,
          );
        window.toggleModalAdelanto(false);
        window.cargarHorasDesdeMySQL();
      } else {
        alert("❌ Error: " + (res ? res.message : "Fallo guardando"));
      }
    })
    .catch((err) => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
      alert("❌ Error: " + err.message);
    });
};

window.ejecutarGuardadoHorasManual = function (e) {
  if (e) e.preventDefault();
  const vendedor = document.getElementById("inputVendedorShift")
    ? document.getElementById("inputVendedorShift").value
    : "";
  const tiempo = document.getElementById("inputHorasShift")
    ? document.getElementById("inputHorasShift").value.trim()
    : "";
  const fecha = document.getElementById("inputFechaShift")
    ? document.getElementById("inputFechaShift").value
    : "";

  if (!vendedor || !tiempo || !fecha) {
    alert("⚠️ Completa los campos.");
    return;
  }

  const btn = document.getElementById("btnGuardarShiftManual");
  const originalText = btn ? btn.innerHTML : "Guardar";
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = "Guardando...";
  }

  fetch(window.URL_GUARDAR_HORAS_MANUAL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `vendedor=${encodeURIComponent(vendedor)}&tiempo=${encodeURIComponent(tiempo)}&fecha=${encodeURIComponent(fecha)}`,
  })
    .then(async (res) => {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (err) {
        throw new Error("Error del servidor: " + text.substring(0, 100));
      }
    })
    .then((res) => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
      if (res && res.status === "success") {
        if (typeof triggerToast === "function")
          triggerToast(
            `<div style="color:var(--ios-green);">✅ Horas guardadas</div>`,
          );
        window.toggleFormularioHoras();
        window.cargarHorasDesdeMySQL();
      } else {
        alert("❌ Error: " + (res ? res.message : "Fallo"));
      }
    })
    .catch((err) => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
      alert("❌ Error: " + err.message);
    });
};

window.modificarTurnoSuperAdmin = function (
  idTurno,
  vendedor,
  fecha,
  tiempoActual,
) {
  if (!verificarSiEsSuperAdmin()) {
    alert("⛔ Acceso Denegado");
    return;
  }
  let nuevoTiempo = prompt(
    `[SUPERADMIN] Modificar tiempo para ${vendedor} (${fecha}):`,
    tiempoActual,
  );
  if (nuevoTiempo === null || nuevoTiempo.trim() === "") return;

  fetch(window.URL_MODIFICAR_TURNO, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${encodeURIComponent(idTurno)}&tiempo=${encodeURIComponent(nuevoTiempo.trim())}`,
  })
    .then(async (res) => {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        throw new Error("Error del servidor");
      }
    })
    .then((res) => {
      if (res && res.status === "success") {
        if (typeof triggerToast === "function")
          triggerToast(
            `<div style="color:var(--ios-green);">✅ Turno guardado</div>`,
          );
        window.cargarHorasDesdeMySQL();
      } else alert("⚠️ Error: " + (res ? res.message : ""));
    })
    .catch((err) => alert("❌ " + err.message));
};

window.eliminarTurnoSuperAdmin = function (idTurno) {
  if (
    !verificarSiEsSuperAdmin() ||
    !confirm("⚠️ ¿Estás seguro de eliminar este turno?")
  )
    return;
  fetch(window.URL_ELIMINAR_TURNO, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${encodeURIComponent(idTurno)}`,
  })
    .then((res) => res.json())
    .then((res) => {
      if (res && res.status === "success") window.cargarHorasDesdeMySQL();
    });
};

window.eliminarMultiplesTurnosSuperAdmin = function (idsStr) {
  if (
    !verificarSiEsSuperAdmin() ||
    !confirm("⚠️ ¿Estás seguro de eliminar TODOS los adelantos de este día?")
  )
    return;
  let idsArray = idsStr.split(",");
  let peticiones = idsArray.map((id) =>
    fetch(window.URL_ELIMINAR_TURNO, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `id=${encodeURIComponent(id)}`,
    }).then((res) => res.json()),
  );
  Promise.all(peticiones).then(() => window.cargarHorasDesdeMySQL());
};

// ==========================================
// 📊 MÓDULO NÓMINA (BENTO GLASS)
// ==========================================
window.abrirTotalNomina = function () {
  const overlay = document.getElementById("nominaOverlay");
  if (!overlay) return;
  overlay.classList.add("open");
  overlay.style.setProperty("display", "flex", "important");
  overlay.style.setProperty("align-items", "center", "important");
  overlay.style.setProperty("justify-content", "center", "important");
  window.refrescarTotalNominaEnVivo();
};

window.cerrarTotalNomina = function () {
  const overlay = document.getElementById("nominaOverlay");
  if (overlay) {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  }
};

window.refrescarTotalNominaEnVivo = async function (btn) {
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Calculando...`;
  }

  const container = document.getElementById("nominaContentArea");
  if (container) {
    container.innerHTML = `<div style="text-align:center; padding:45px; color:#30d158;">Calculando Nómina desde BD...</div>`;
  }

  // Asegurar que la caché de Nequis/Teléfonos está llena
  if (window.usuariosCache.length === 0) {
    await window.cargarUsuariosBaseMySQL();
  }

  // Siempre forzar lectura de MySQL para NÓMINA para estar seguros
  try {
    let res = await fetch(window.URL_OBTENER_HORAS);
    let data = await res.json();
    if (data && data.status === "success") {
      window.currentHorasStock = data.data || [];
    }
  } catch (e) {
    console.error("Error leyendo turnos para nómina:", e);
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = "Refrescar";
  }

  window.renderizarTotalNomina();
};

// 🎨 RENDERIZADOR BENTO DE NÓMINA OPTIMIZADO (GRID FLEXBOX)
window.renderizarTotalNomina = function () {
  const container = document.getElementById("nominaContentArea");
  if (!container) return;

  const activeStaff = (
    sessionStorage.getItem("active_staff") ||
    localStorage.getItem("cyber_saved_staff") ||
    "STAFF"
  )
    .toUpperCase()
    .trim();
  const esSuperAdmin = verificarSiEsSuperAdmin();

  const dMes = window.filtroMesTurnos;
  const dAnio = window.filtroAnioTurnos;
  const esQ1 = window.filtroQuincenaTurnos === 1;

  // Cruzar la lista de teléfonos/Nequi/Bre-B de MySQL
  let mapaTelefonos = {};
  window.usuariosCache.forEach((u) => {
    let nom = (u.nombre || "").toUpperCase().trim();
    let num = (u.numero || u.telefono || "").trim();
    if (nom) mapaTelefonos[nom] = num;
  });

  let todosLosRegistros = window.currentHorasStock || [];
  let mapaNomina = {};

  // Buscar, Sumar y Restar en la Base de Datos
  todosLosRegistros.forEach((item) => {
    let d = parsearFechaTurno(item.fecha);
    if (d.getMonth() !== dMes || d.getFullYear() !== dAnio) return;

    let dia = d.getDate();
    if (esQ1 && dia > 15) return;
    if (!esQ1 && dia <= 15) return;

    let asist = (item.vendedor || "STAFF").toUpperCase().trim();

    if (!mapaNomina[asist]) {
      mapaNomina[asist] = { ganado: 0, descontado: 0, neto: 0 };
    }

    let monto = parseFloat(item.total) || 0;
    let esAdelanto =
      monto < 0 || (item.estado || "").toUpperCase().includes("ADELANTO");

    if (esAdelanto) {
      mapaNomina[asist].descontado += Math.abs(monto);
    } else {
      mapaNomina[asist].ganado += monto;
    }
  });

  let listaProcesar = obtenerTodosLosAsistentes();
  if (!esSuperAdmin) {
    listaProcesar = [activeStaff];
  }

  let totalGlobalGanado = 0;
  let totalGlobalDescontado = 0;
  let totalGlobalNeto = 0;
  let htmlFilas = "";

  listaProcesar.forEach((asistente) => {
    let datosUser = mapaNomina[asistente] || {
      ganado: 0,
      descontado: 0,
      neto: 0,
    };
    let ganado = datosUser.ganado;
    let descontado = datosUser.descontado;
    let neto = ganado - descontado; // 🔥 CÁLCULO DEL TOTAL EXACTO A PAGAR

    totalGlobalGanado += ganado;
    totalGlobalDescontado += descontado;
    totalGlobalNeto += neto;

    let telefonoNum = mapaTelefonos[asistente] || "Sin Nequi";
    let colorNeto = neto < 0 ? "#ff453a" : "#30d158";

    // Botón de copiado
    let btnCopiarTel = "";
    if (telefonoNum !== "Sin Nequi") {
      btnCopiarTel = `
        <button onclick="navigator.clipboard.writeText('${telefonoNum}'); this.style.color='#30d158'; setTimeout(()=>this.style.color='#0a84ff', 1000);" title="Copiar Nequi/Bre-B" style="background: rgba(10, 132, 255, 0.15); border: 1px solid rgba(10, 132, 255, 0.3); color: #0a84ff; padding: 4px 8px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-size: 0.72rem; font-weight: 800; font-family: monospace; transition: 0.2s;">
          <span>${telefonoNum}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>`;
    } else {
      btnCopiarTel = `<span style="font-size:0.75rem; color:#71717a; padding-left:2px;">Sin Nequi</span>`;
    }

    // 🏆 DISEÑO FLEXBOX FLUIDO PARA CADA FILA (No es Tabla)
    htmlFilas += `
      <div style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 16px 14px; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s; flex-wrap: wrap; gap: 10px;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
        
        <!-- Bloque Izquierdo: Avatar, Nombre y Nequi -->
        <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 140px;">
          <div style="width: 36px; height: 36px; border-radius: 12px; background: rgba(10, 132, 255, 0.15); border: 1px solid rgba(10, 132, 255, 0.3); color: #0a84ff; font-weight: 900; font-size: 1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${asistente.charAt(0)}
          </div>
          <div style="display: flex; flex-direction: column; gap: 3px; justify-content: center;">
            <span style="font-weight: 800; color: #ffffff; font-size: 0.95rem; line-height: 1;">${asistente}</span>
            ${btnCopiarTel}
          </div>
        </div>

        <!-- Bloque Central: Ganado y Adelanto -->
        <div style="display: flex; flex-direction: row; justify-content: flex-end; align-items: center; gap: 20px; flex: 1; min-width: 160px;">
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
            <span style="font-size: 0.65rem; font-weight: 800; color: #a1a1aa; text-transform: uppercase;">Turnos (+)</span>
            <span style="font-family: monospace; font-weight: 700; color: #30d158; font-size: 0.95rem;">+$${Math.round(ganado).toLocaleString("es-CO")}</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
            <span style="font-size: 0.65rem; font-weight: 800; color: #a1a1aa; text-transform: uppercase;">Adelantos (-)</span>
            <span style="font-family: monospace; font-weight: 700; color: #ff453a; font-size: 0.95rem;">-$${Math.round(descontado).toLocaleString("es-CO")}</span>
          </div>
        </div>

        <!-- Bloque Derecho: Sueldo Neto Exacto -->
        <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center; flex: 0.5; min-width: 100px; padding-left: 10px; border-left: 1px solid rgba(255,255,255,0.08);">
          <span style="font-size: 0.68rem; font-weight: 800; color: #a1a1aa; text-transform: uppercase;">Total a Pagar</span>
          <span style="font-family: monospace; font-weight: 900; color: ${colorNeto}; font-size: 1.2rem;">$${Math.round(neto).toLocaleString("es-CO")}</span>
        </div>

      </div>`;
  });

  // Tarjetas Resumen Globales
  let htmlResumenGlobal = "";
  if (esSuperAdmin) {
    htmlResumenGlobal = `
      <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; width: 100%;">
        <div style="flex: 1; min-width: 130px; background: rgba(48, 209, 88, 0.08); border: 1px solid rgba(48, 209, 88, 0.2); padding: 16px; border-radius: 20px; display: flex; flex-direction: column; gap: 6px;">
          <span style="font-size: 0.72rem; font-weight: 800; color: #30d158; text-transform: uppercase;">Total Bruto (+)</span>
          <span style="font-size: 1.3rem; font-weight: 900; color: #30d158; font-family: monospace;">$${Math.round(totalGlobalGanado).toLocaleString("es-CO")}</span>
        </div>
        <div style="flex: 1; min-width: 130px; background: rgba(255, 69, 58, 0.08); border: 1px solid rgba(255, 69, 58, 0.2); padding: 16px; border-radius: 20px; display: flex; flex-direction: column; gap: 6px;">
          <span style="font-size: 0.72rem; font-weight: 800; color: #ff453a; text-transform: uppercase;">Adelantos (-)</span>
          <span style="font-size: 1.3rem; font-weight: 900; color: #ff453a; font-family: monospace;">-$${Math.round(totalGlobalDescontado).toLocaleString("es-CO")}</span>
        </div>
        <div style="flex: 1; min-width: 140px; background: rgba(10, 132, 255, 0.12); border: 1px solid rgba(10, 132, 255, 0.3); padding: 16px; border-radius: 20px; display: flex; flex-direction: column; gap: 6px;">
          <span style="font-size: 0.72rem; font-weight: 800; color: #0a84ff; text-transform: uppercase;">Nómina Total Neta</span>
          <span style="font-size: 1.4rem; font-weight: 900; color: #ffffff; font-family: monospace;">$${Math.round(totalGlobalNeto).toLocaleString("es-CO")}</span>
        </div>
      </div>`;
  }

  // 📦 INYECCIÓN FINAL
  let htmlFinal = `
    <div style="display: flex; flex-direction: column; width: 100%;">
      ${htmlResumenGlobal}
      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; overflow: hidden; width: 100%;">
        <div style="display: flex; flex-direction: column; width: 100%;">
          ${htmlFilas}
        </div>
      </div>
    </div>`;

  container.innerHTML = htmlFinal;
};

// FILTRO DE BÚSQUEDA
window.filtrarHorasInternas = function () {
  window.renderizarHorasEnPantalla();
};

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(window.cargarUsuariosBaseMySQL, 1500);
});
/* ==========================================================================
   ⏱️ WIDGET FLOTANTE: RASTREADOR DE TURNO (CADA 5 MINUTOS)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const widgetHTML = `
    <div id="cyberTracker" style="position: fixed; bottom: 25px; right: 25px; z-index: 20000; background: rgba(15,15,18,0.85); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.1); border-radius: 50px; padding: 10px 18px; display: flex; align-items: center; gap: 14px; box-shadow: 0 15px 35px rgba(0,0,0,0.6); transition: 0.3s;">
      <div id="trackerDot" style="width: 10px; height: 10px; border-radius: 50%; background: #ff453a; box-shadow: 0 0 8px #ff453a; transition: 0.3s;"></div>
      <span id="trackerTime" style="color: #fff; font-family: monospace; font-size: 1.15rem; font-weight: 800; letter-spacing: 1px; min-width: 75px; text-align: center;">00:00:00</span>
      <button id="btnTrackerPlay" onclick="toggleTrackerShift()" style="background: #30d158; border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s;">
        <svg id="iconPlay" viewBox="0 0 24 24" width="16" height="16" fill="white" style="margin-left: 2px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        <svg id="iconPause" viewBox="0 0 24 24" width="14" height="14" fill="white" style="display: none;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
      </button>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", widgetHTML);
});

let secCronometro = 0;
let uiInterval = null;
let syncInterval = null;
let turnoActivo = false;

window.toggleTrackerShift = function () {
  if (turnoActivo) detenerTurno();
  else iniciarTurno();
};

function iniciarTurno() {
  const activeStaff = (
    sessionStorage.getItem("active_staff") ||
    localStorage.getItem("cyber_saved_staff") ||
    ""
  )
    .toUpperCase()
    .trim();
  if (!activeStaff || activeStaff === "STAFF" || activeStaff === "CAMILO") {
    alert(
      "⚠️ Inicia sesión con el nombre de un Asistente para rastrear tu propio tiempo.",
    );
    return;
  }

  turnoActivo = true;
  document.getElementById("trackerDot").style.background = "#30d158";
  document.getElementById("trackerDot").style.boxShadow = "0 0 12px #30d158";
  document.getElementById("btnTrackerPlay").style.background = "#ff453a";
  document.getElementById("iconPlay").style.display = "none";
  document.getElementById("iconPause").style.display = "block";

  // 1. Cronómetro visual (Suma 1 segundo cada 1000ms)
  uiInterval = setInterval(() => {
    secCronometro++;
    document.getElementById("trackerTime").innerText =
      formatoSegundos(secCronometro);
  }, 1000);

  // 2. BACKUP MYSQL: Enviar 5 minutos de tiempo cada 300,000ms (5 min exactos)
  syncInterval = setInterval(() => {
    enviarTiempoTrackerAMySQL(activeStaff, "00:05:00");
  }, 300000);

  if (typeof triggerToast === "function")
    triggerToast(
      `<div style="color:var(--ios-green);">▶ Turno iniciado. Se hará copia a la BD cada 5 min.</div>`,
    );
}

function detenerTurno() {
  turnoActivo = false;
  clearInterval(uiInterval);
  clearInterval(syncInterval);

  document.getElementById("trackerDot").style.background = "#ff453a";
  document.getElementById("trackerDot").style.boxShadow = "0 0 8px #ff453a";
  document.getElementById("btnTrackerPlay").style.background = "#30d158";
  document.getElementById("iconPlay").style.display = "block";
  document.getElementById("iconPause").style.display = "none";

  // Calcular segundos que quedaron sobrando que aún no se habían guardado en el ciclo de 5min
  let segundosSobrantes = secCronometro % 300;
  if (segundosSobrantes > 0) {
    const activeStaff = (
      sessionStorage.getItem("active_staff") ||
      localStorage.getItem("cyber_saved_staff") ||
      ""
    )
      .toUpperCase()
      .trim();
    enviarTiempoTrackerAMySQL(activeStaff, formatoSegundos(segundosSobrantes));
  }

  if (typeof triggerToast === "function")
    triggerToast(
      `<div style="color:var(--ios-orange);">⏸ Turno finalizado y tiempo guardado en BD.</div>`,
    );
}

function enviarTiempoTrackerAMySQL(asistente, tiempoStr) {
  fetch(window.URL_GUARDAR_HORAS_MANUAL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `vendedor=${encodeURIComponent(asistente)}&tiempo=${encodeURIComponent(tiempoStr)}&fecha=hoy`,
  })
    .then((res) => res.json())
    .then((res) => {
      // Si la BD se actualiza bien, forzamos un refresco visual si el modal está abierto
      if (
        res.status === "success" &&
        typeof window.cargarHorasDesdeMySQL === "function"
      ) {
        window.cargarHorasDesdeMySQL();
      }
    })
    .catch((e) => console.error("Error guardando ciclo de tiempo:", e));
}

function formatoSegundos(totalSeg) {
  let h = Math.floor(totalSeg / 3600);
  let m = Math.floor((totalSeg % 3600) / 60);
  let s = totalSeg % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
