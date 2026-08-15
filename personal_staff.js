/* ==========================================================================
   👥 CYBERNET OS - MÓDULO CONTROL DE PERSONAL / CALENDARIO GOOGLE SHEETS
   ========================================================================== */

// URL Central de tu Google Apps Script
if (typeof GOOGLE_SCRIPT_URL === "undefined") {
  var GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxqKpMcC5BI0H6PHnImu5Lkw3ryiuFO0fW0KJAhQ_45kzglYn9CpN1O2fCjezXM5oMi/exec";
}

window.currentHorasStock = [];

// Filtros por defecto del Calendario
window.filtroMesTurnos = new Date().getMonth();
window.filtroAnioTurnos = new Date().getFullYear();
window.filtroQuincenaTurnos = new Date().getDate() <= 15 ? 1 : 2;
window.asistenteSeleccionadoAdmin = "TODOS";

// 👁️ APERTURA Y CONTROL DEL PANEL
window.toggleShiftsPanel = function () {
  try {
    if (typeof haptic === "function") haptic();
  } catch (e) {}

  const overlay = document.getElementById("shiftsOverlay");
  if (!overlay) {
    alert("⚠️ Error: No se encontró el modal #shiftsOverlay en el HTML.");
    return;
  }

  const estaAbierto =
    overlay.classList.contains("open") || overlay.style.display === "flex";

  if (estaAbierto) {
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

    window.cargarHorasDesdeSheets();
  }
};

// 🔄 OBTENER REGISTROS DE HORAS DESDE GOOGLE APPS SCRIPT (JSONP)
window.cargarHorasDesdeSheets = function () {
  const container = document.getElementById("shiftsScrollArea");
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center; padding:40px; color:#0a84ff;">
      <div style="display:flex; flex-direction:column; align-items:center; gap:12px;">
        <svg class="spin-anim" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
        <span style="font-weight:700; font-size:0.9rem;">Sincronizando turnos desde Google Sheets...</span>
      </div>
    </div>`;

  const oldScript = document.getElementById("node_get_horas_script");
  if (oldScript) oldScript.remove();

  const cbName = "cb_get_horas_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_get_horas_script");
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      window.currentHorasStock = res.data || [];
      window.renderizarHorasEnPantalla();
    } else {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:#ff453a; font-weight:700;">❌ Error: ${res ? res.message : "Fallo al consultar la base de datos."}</div>`;
    }
  };

  const script = document.createElement("script");
  script.id = "node_get_horas_script";
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerHoras&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// 📅 HELPER PARSEADOR DE FECHA DE SHEETS ("DD/MM/YYYY hh:mm a" o "DD/MM/YYYY")
function parsearFechaTurno(fechaRaw) {
  if (!fechaRaw) return new Date();
  if (fechaRaw instanceof Date) return fechaRaw;

  let str = String(fechaRaw).trim().split(" ")[0]; // Extrae solo la parte DD/MM/YYYY
  let parts = str.includes("/") ? str.split("/") : str.split("-");

  if (parts.length === 3) {
    // Formato DD/MM/YYYY
    if (parts[0].length <= 2 && parts[2].length === 4) {
      return new Date(
        parseInt(parts[2], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[0], 10),
      );
    }
    // Formato YYYY-MM-DD
    else if (parts[0].length === 4) {
      return new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10),
      );
    }
  }
  return new Date();
}

// 🗓️ CONTROLES DEL CALENDARIO
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

// 🎨 RENDERIZADOR CALENDARIO TIPO IPADOS CON PRIVACIDAD Y EDICIÓN SUPERADMIN
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
  const esSuperAdmin = activeStaff === "CAMILO";

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

  // 1. Detección de asistentes disponibles en los datos
  let todosLosRegistros = window.currentHorasStock;
  let asistentesDisponibles = new Set();

  todosLosRegistros.forEach((item) => {
    let v = (item.vendedor || "STAFF")
      .toUpperCase()
      .replace(" (INGRESO MANUAL)", "")
      .trim();
    if (v === "PABLO") v = "MANUP";
    if (v) asistentesDisponibles.add(v);
  });

  let listaAsistentes = Array.from(asistentesDisponibles).sort();

  // 2. Filtrar datos según el rol y selección
  let datosFiltrados = todosLosRegistros.filter((item) => {
    let vendedorItem = (item.vendedor || "STAFF")
      .toUpperCase()
      .replace(" (INGRESO MANUAL)", "")
      .trim();
    if (vendedorItem === "PABLO") vendedorItem = "MANUP";

    let d = parsearFechaTurno(item.fecha);

    if (d.getMonth() !== dMes || d.getFullYear() !== dAnio) return false;
    let dia = d.getDate();
    if (esQ1 && dia > 15) return false;
    if (!esQ1 && dia <= 15) return false;

    // PRIVACIDAD: Si no es Camilo, fuerza filtrado único por su nombre
    if (!esSuperAdmin) {
      return vendedorItem === activeStaff;
    } else {
      if (window.asistenteSeleccionadoAdmin !== "TODOS") {
        return vendedorItem === window.asistenteSeleccionadoAdmin;
      }
      return true;
    }
  });

  // 3. Barra de Controles
  let opcionesMes = mesesNombres
    .map(
      (m, idx) =>
        `<option value="${idx}" ${idx === dMes ? "selected" : ""}>${m} ${dAnio}</option>`,
    )
    .join("");

  let selectorAsistentesAdmin = "";
  if (esSuperAdmin) {
    let optsAsistentes = `<option value="TODOS" ${window.asistenteSeleccionadoAdmin === "TODOS" ? "selected" : ""}>👥 Todos los Asistentes</option>`;
    listaAsistentes.forEach((asist) => {
      optsAsistentes += `<option value="${asist}" ${window.asistenteSeleccionadoAdmin === asist ? "selected" : ""}>👤 ${asist}</option>`;
    });

    selectorAsistentesAdmin = `
      <select class="input-ios" style="margin:0; padding:10px 14px; border-radius:12px; font-weight:800; font-size:0.85rem; color:#0a84ff; background:#18181c; border:1px solid rgba(10,132,255,0.3);" onchange="cambiarAsistenteAdmin(this.value)">
        ${optsAsistentes}
      </select>`;
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
        <select class="input-ios" style="margin:0; padding:10px 14px; border-radius:12px; font-weight:800; font-size:0.85rem; color:#ffffff; background:#18181c; border:1px solid rgba(255,255,255,0.15);" onchange="cambiarMesTurnos(this.value)">
          ${opcionesMes}
        </select>
        <button class="btn-ios" style="padding: 10px 14px; border-radius: 12px; font-size: 0.82rem; font-weight: 800; ${btnQ1Style}" onclick="cambiarQuincenaTurnos(1)">Q1 (1-15)</button>
        <button class="btn-ios" style="padding: 10px 14px; border-radius: 12px; font-size: 0.82rem; font-weight: 800; ${btnQ2Style}" onclick="cambiarQuincenaTurnos(2)">Q2 (16-Fin)</button>
      </div>
      ${selectorAsistentesAdmin}
    </div>`;

  // 4. Agrupar Registros por Asistente y Día
  let mapaAsistentes = {};

  datosFiltrados.forEach((item) => {
    let asist = (item.vendedor || "STAFF")
      .toUpperCase()
      .replace(" (INGRESO MANUAL)", "")
      .trim();
    if (asist === "PABLO") asist = "MANUP";

    let d = parsearFechaTurno(item.fecha);
    let diaNum = d.getDate();

    if (!mapaAsistentes[asist]) mapaAsistentes[asist] = {};
    if (!mapaAsistentes[asist][diaNum]) mapaAsistentes[asist][diaNum] = [];

    mapaAsistentes[asist][diaNum].push(item);
  });

  let asistentesAMostrar = Object.keys(mapaAsistentes);

  if (!esSuperAdmin && !mapaAsistentes[activeStaff]) {
    asistentesAMostrar = [activeStaff];
    mapaAsistentes[activeStaff] = {};
  }

  if (asistentesAMostrar.length === 0) {
    container.innerHTML =
      htmlControles +
      `
      <div style="text-align:center; padding:40px; color:#a1a1aa; font-weight:600; background:rgba(255,255,255,0.02); border-radius:18px; border:1px dashed rgba(255,255,255,0.08);">
        📌 No se encontraron turnos registrados para este periodo.
      </div>`;
    return;
  }

  let htmlCuerpo = htmlControles;

  // 5. Construir Calendario para cada Asistente
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

    for (let o = 0; o < offsetDias; o++) {
      celdasCalendario += `<div style="background: transparent;"></div>`;
    }

    for (let dia = inicioDia; dia <= finDia; dia++) {
      let registrosDia = turnosPorDia[dia] || [];
      let tieneTurno = registrosDia.length > 0;
      let htmlRegistros = "";

      registrosDia.forEach((reg) => {
        let pagoNum =
          parseFloat(String(reg.pagoTurno || "0").replace(/[^0-9.-]/g, "")) ||
          0;
        totalPagoAsistente += pagoNum;

        let tiempoStr = String(reg.tiempo || "00:00:00").trim();
        let esTiempoValido = tiempoStr !== "00:00:00" && tiempoStr !== "";

        if (esTiempoValido) {
          let p = tiempoStr.split(":");
          if (p.length >= 2) {
            totalHorasSegundos +=
              (parseInt(p[0], 10) || 0) * 3600 + (parseInt(p[1], 10) || 0) * 60;
          }
        }

        let esDescuento = pagoNum < 0;
        let colorMonto = esDescuento ? "#ff453a" : "#30d158";
        let textoEtiquetaTiempo = esTiempoValido
          ? tiempoStr
          : esDescuento
            ? "Adelanto/Desc"
            : "Turno";

        // BOTÓN MODIFICAR EXCLUSIVO SUPERADMIN (CAMILO)
        let btnEditarSuperAdmin = "";
        if (esSuperAdmin) {
          btnEditarSuperAdmin = `
            <button type="button" onclick="window.modificarTurnoSuperAdmin('${reg.filaIndex || ""}', '${asistente}', '${reg.fecha}', '${tiempoStr}')" title="Modificar Turno (Superadmin)" style="background: rgba(10, 132, 255, 0.2); border: 1px solid rgba(10, 132, 255, 0.4); color: #0a84ff; padding: 2px 6px; border-radius: 6px; font-size: 0.65rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; margin-top: 4px;">
              ✏️ Modificar
            </button>`;
        }

        htmlRegistros += `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; width: 100%; margin-top: 4px;">
            <span style="font-size: 0.72rem; font-weight: 800; color: #0a84ff; font-family: monospace;">${textoEtiquetaTiempo}</span>
            <span style="font-size: 0.75rem; font-weight: 900; color: ${colorMonto}; font-family: monospace;">$${Math.round(pagoNum).toLocaleString("es-CO")}</span>
            ${btnEditarSuperAdmin}
          </div>`;
      });

      let bgCelda = tieneTurno
        ? "rgba(255, 255, 255, 0.04)"
        : "rgba(0,0,0,0.2)";
      let borderCelda = tieneTurno
        ? "1px solid rgba(10, 132, 255, 0.3)"
        : "1px solid rgba(255, 255, 255, 0.05)";

      celdasCalendario += `
        <div style="background: ${bgCelda}; border: ${borderCelda}; border-radius: 12px; padding: 6px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; min-height: 74px; box-sizing: border-box;">
          <span style="font-size: 0.75rem; font-weight: 800; color: ${tieneTurno ? "#ffffff" : "#71717a"}; align-self: flex-start;">${dia}</span>
          ${htmlRegistros}
        </div>`;
    }

    let tHoras = Math.floor(totalHorasSegundos / 3600);
    let tMins = Math.floor((totalHorasSegundos % 3600) / 60);
    let tiempoFormateadoTotal = `${String(tHoras).padStart(2, "0")}h ${String(tMins).padStart(2, "0")}m`;
    let pagoFormateadoTotal =
      "$" + Math.round(totalPagoAsistente).toLocaleString("es-CO");

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
              <span style="font-weight: 900; color: #30d158; font-size: 1.1rem; font-family: monospace;">${pagoFormateadoTotal}</span>
            </div>
          </div>
        </div>

        <div style="width: 100%; overflow-x: auto;">
          <div style="min-width: 440px; display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;">
            ${celdasCalendario}
          </div>
        </div>
      </div>`;
  });

  container.innerHTML = htmlCuerpo;
};

// ✏️ EDICIÓN VÍA APPS SCRIPT PARA SUPERADMIN
window.modificarTurnoSuperAdmin = function (
  filaIndex,
  vendedor,
  fecha,
  tiempoActual,
) {
  const activeStaff = (
    sessionStorage.getItem("active_staff") ||
    localStorage.getItem("cyber_saved_staff") ||
    ""
  )
    .toUpperCase()
    .trim();
  if (activeStaff !== "CAMILO") {
    alert(
      "⛔ Acceso Denegado: Solo el Superadmin (CAMILO) puede modificar turnos.",
    );
    return;
  }

  if (typeof haptic === "function") haptic();

  let nuevasHoras = prompt(
    `[SUPERADMIN] Modificar tiempo trabajado para ${vendedor} (${fecha}):\nFormato: HH:MM:SS`,
    tiempoActual || "08:00:00",
  );
  if (!nuevasHoras || nuevasHoras.trim() === "") return;

  nuevasHoras = nuevasHoras.trim();

  const cbName = "cb_edit_shift_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"></path></svg><span>Turno modificado correctamente</span></div>`,
        );
      }
      window.cargarHorasDesdeSheets();
    } else {
      alert(
        "❌ Error: " +
          (res
            ? res.message
            : "Fallo al actualizar el turno en Google Sheets."),
      );
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=editarTurnoGlobal&filas=${encodeURIComponent(filaIndex)}&vendedor=${encodeURIComponent(vendedor)}&fecha=${encodeURIComponent(fecha)}&nuevasHoras=${encodeURIComponent(nuevasHoras)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// 🔍 FILTRO DE BÚSQUEDA
window.filtrarHorasInternas = function () {
  window.renderizarHorasEnPantalla();
};
