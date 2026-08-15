/* ==========================================================================
   👥 CYBERNET OS - MÓDULO DE PERSONAL / CALENDARIO MYSQL (FINAL Y CORREGIDO)
   ========================================================================== */

window.URL_OBTENER_HORAS = "https://api.cybernetsp.com/obtener_horas.php";
window.URL_MODIFICAR_TURNO = "https://api.cybernetsp.com/modificar_turno.php";
window.URL_ELIMINAR_TURNO = "https://api.cybernetsp.com/eliminar_turno.php";

window.currentHorasStock = [];

// Filtros globales del calendario
window.filtroMesTurnos = new Date().getMonth();
window.filtroAnioTurnos = new Date().getFullYear();
window.filtroQuincenaTurnos = new Date().getDate() <= 15 ? 1 : 2;
window.asistenteSeleccionadoAdmin = "TODOS";

// 👁️ ABRIR / CERRAR PANEL
window.toggleShiftsPanel = function () {
  try {
    if (typeof haptic === "function") haptic();
  } catch (e) {}

  const overlay = document.getElementById("shiftsOverlay");
  if (!overlay) {
    alert("⚠️ Error: No se encontró el modal #shiftsOverlay en la página.");
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

    window.cargarHorasDesdeMySQL();
  }
};

window.cargarHorasDesdeMySQL = function () {
  const container = document.getElementById("shiftsScrollArea");
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center; padding:45px; color:#0a84ff;">
      <div style="display:flex; flex-direction:column; align-items:center; gap:12px;">
        <svg class="spin-anim" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
        <span style="font-weight:700; font-size:0.9rem;">Sincronizando calendario con MySQL...</span>
      </div>
    </div>`;

  fetch(window.URL_OBTENER_HORAS)
    .then(async (res) => {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error("Respuesta basura de PHP:", text);
        return {
          status: "error",
          message:
            "Formato inválido de PHP: <br><span style='color:white; font-family:monospace; background:rgba(0,0,0,0.5); padding:4px; display:block; margin-top:8px; font-size:12px;'>" +
            text.substring(0, 150) +
            "...</span>",
        };
      }
    })
    .then((res) => {
      if (res && res.status === "success") {
        window.currentHorasStock = res.data || [];
        window.renderizarHorasEnPantalla();
      } else {
        container.innerHTML = `<div style="text-align:center; padding:30px; color:#ff453a; font-weight:700;">❌ ${res ? res.message : "Fallo al consultar la base de datos."}</div>`;
      }
    })
    .catch((err) => {
      console.error("Error al cargar horas:", err);
      container.innerHTML = `<div style="text-align:center; padding:30px; color:#ff453a; font-weight:700;">❌ Error de Red: ${err.message}</div>`;
    });
};

// 📅 PARSEADOR DE FECHA COMPATIBLE CON FORMATOS CON HORA (Ej: 14/08/2026 12:05 AM)
function parsearFechaTurno(fechaRaw) {
  if (!fechaRaw) return new Date();
  if (fechaRaw instanceof Date) return fechaRaw;

  let str = String(fechaRaw).trim().split(" ")[0];
  let parts = str.includes("/") ? str.split("/") : str.split("-");

  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10),
      );
    } else {
      return new Date(
        parseInt(parts[2], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[0], 10),
      );
    }
  }
  return new Date();
}

// 🗓️ ACCIONES DE FILTRO
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

// 🎨 RENDERIZADOR CALENDARIO CON ADELANTOS UNIFICADOS Y BOTONES SVG SUPERADMIN
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

  // 1. FILTRADO DE PRIVACIDAD POR USUARIO
  let todosLosRegistros = window.currentHorasStock;
  let asistentesDisponibles = new Set();

  todosLosRegistros.forEach((item) => {
    let v = (item.vendedor || "STAFF").toUpperCase().trim();
    if (v) asistentesDisponibles.add(v);
  });

  let listaAsistentes = Array.from(asistentesDisponibles).sort();

  let datosFiltrados = todosLosRegistros.filter((item) => {
    let vendedorItem = (item.vendedor || "STAFF").toUpperCase().trim();
    let d = parsearFechaTurno(item.fecha);

    if (d.getMonth() !== dMes || d.getFullYear() !== dAnio) return false;
    let dia = d.getDate();
    if (esQ1 && dia > 15) return false;
    if (!esQ1 && dia <= 15) return false;

    if (!esSuperAdmin) {
      return vendedorItem === activeStaff;
    } else {
      if (window.asistenteSeleccionadoAdmin !== "TODOS") {
        return vendedorItem === window.asistenteSeleccionadoAdmin;
      }
      return true;
    }
  });

  // 2. BARRA DE CONTROLES
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
        <button class="btn-ios" type="button" style="padding: 10px 14px; border-radius: 12px; font-size: 0.82rem; font-weight: 800; ${btnQ1Style}" onclick="cambiarQuincenaTurnos(1)">Q1 (1-15)</button>
        <button class="btn-ios" type="button" style="padding: 10px 14px; border-radius: 12px; font-size: 0.82rem; font-weight: 800; ${btnQ2Style}" onclick="cambiarQuincenaTurnos(2)">Q2 (16-Fin)</button>
      </div>
      ${selectorAsistentesAdmin}
    </div>`;

  // 3. AGRUPAR REGISTROS
  let mapaAsistentes = {};

  datosFiltrados.forEach((item) => {
    let asist = (item.vendedor || "STAFF").toUpperCase().trim();
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
        📌 No hay turnos o registros para este periodo.
      </div>`;
    return;
  }

  let htmlCuerpo = htmlControles;

  // 4. CONSTRUIR CALENDARIO
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
            if (p.length >= 2) {
              totalHorasSegundos +=
                (parseInt(p[0], 10) || 0) * 3600 +
                (parseInt(p[1], 10) || 0) * 60;
            }
          }
        }
      });

      // RENDERIZAR TURNOS NORMALES
      turnosPuros.forEach((reg) => {
        let valorAbsolutoFormateado = Math.abs(
          Math.round(reg.total),
        ).toLocaleString("es-CO");

        let btnSuperAdmin = "";
        if (esSuperAdmin) {
          btnSuperAdmin = `
            <div style="display:flex; justify-content:center; gap:8px; margin-top:4px;">
              <button onclick="window.modificarTurnoSuperAdmin('${reg.id}', '${asistente}', '${reg.fecha}', '${reg.tiempo_trabajado}')" title="Modificar Turno" style="background:transparent; border:none; padding:0; cursor:pointer;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--ios-blue)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.8; transition:0.2s;" onmouseover="this.style.opacity='1'; this.style.transform='scale(1.1)'" onmouseout="this.style.opacity='0.8'; this.style.transform='scale(1)'">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button onclick="window.eliminarTurnoSuperAdmin('${reg.id}')" title="Eliminar Turno" style="background:transparent; border:none; padding:0; cursor:pointer;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--ios-red)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.8; transition:0.2s;" onmouseover="this.style.opacity='1'; this.style.transform='scale(1.1)'" onmouseout="this.style.opacity='0.8'; this.style.transform='scale(1)'">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>`;
        }

        htmlRegistros += `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; width: 100%; margin-top: 4px;">
            <span style="font-size: 0.72rem; font-weight: 800; color: #0a84ff; font-family: monospace;">${reg.tiempo_trabajado !== "00:00:00" ? reg.tiempo_trabajado : "Turno"}</span>
            <span style="font-size: 0.78rem; font-weight: 900; color: #30d158; font-family: monospace;">$${valorAbsolutoFormateado}</span>
            ${btnSuperAdmin}
          </div>`;
      });

      // RENDERIZAR ADELANTOS UNIFICADOS
      if (adelantosPuros.length > 0) {
        let valorUnificadoMonto = Math.abs(
          Math.round(sumaAdelantos),
        ).toLocaleString("es-CO");
        let idUnificadosStr = idsAdelantosArray.join(",");

        let botonBorrarAdelantos = "";
        if (esSuperAdmin) {
          botonBorrarAdelantos = `
            <div style="display:flex; justify-content:center; margin-top:4px;">
              <button onclick="window.eliminarMultiplesTurnosSuperAdmin('${idUnificadosStr}')" title="Eliminar Adelantos de este día" style="background:transparent; border:none; padding:0; cursor:pointer;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--ios-red)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.8; transition:0.2s;" onmouseover="this.style.opacity='1'; this.style.transform='scale(1.1)'" onmouseout="this.style.opacity='0.8'; this.style.transform='scale(1)'">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>`;
        }

        htmlRegistros += `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; width: 100%; margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(255, 69, 58, 0.3);">
            <span style="font-size: 0.65rem; font-weight: 800; color: #ff453a; text-transform: uppercase;">Adelanto Total</span>
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

      // 🔥 FIX DE ESPACIO: min-height incrementado a 110px para que los botones y textos no se escondan
      celdasCalendario += `
        <div style="background: ${bgCelda}; border: ${borderCelda}; border-radius: 12px; padding: 6px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-height: 110px; box-sizing: border-box; overflow: visible;">
          <span style="font-size: 0.75rem; font-weight: 800; color: ${tieneTurno ? "#ffffff" : "#71717a"}; align-self: flex-start; margin-bottom: auto;">${dia}</span>
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

// ✏️ MODIFICACIÓN DE TIEMPO (SUPERADMIN CAMILO)
window.modificarTurnoSuperAdmin = function (
  idTurno,
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
      "⛔ Acceso Denegado: Solo el Superadmin (CAMILO) tiene permisos para modificar turnos.",
    );
    return;
  }

  try {
    if (typeof haptic === "function") haptic();
  } catch (e) {}

  let nuevoTiempo = prompt(
    `[SUPERADMIN] Modificar tiempo para ${vendedor} (${fecha}):\nPuedes ingresar horas simples (ej: 3) o formato completo (ej: 03:00:00)`,
    tiempoActual,
  );
  if (nuevoTiempo === null || nuevoTiempo.trim() === "") return;

  // Llama a PHP (que ya está programado para calcular el dinero en el servidor si envias tiempo)
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
        throw new Error("Respuesta inválida del servidor PHP.");
      }
    })
    .then((res) => {
      if (res && res.status === "success") {
        if (typeof triggerToast === "function")
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"></path></svg><span>Turno guardado y recalculado</span></div>`,
          );
        window.cargarHorasDesdeMySQL();
      } else {
        alert("⚠️ Error: " + (res ? res.message : "Desconocido."));
      }
    })
    .catch((err) => alert("❌ " + err.message));
};

// 🗑️ ELIMINACIÓN DE TURNO (SUPERADMIN CAMILO)
window.eliminarTurnoSuperAdmin = function (idTurno) {
  if (
    !confirm(
      "⚠️ ¿Estás seguro de eliminar este turno? Esta acción es irreversible.",
    )
  )
    return;
  try {
    if (typeof haptic === "function") haptic();
  } catch (e) {}

  fetch(window.URL_ELIMINAR_TURNO, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${encodeURIComponent(idTurno)}`,
  })
    .then((res) => res.json())
    .then((res) => {
      if (res && res.status === "success") {
        if (typeof triggerToast === "function")
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-red);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg><span>Turno eliminado</span></div>`,
          );
        window.cargarHorasDesdeMySQL();
      } else {
        alert("Error al eliminar: " + res.message);
      }
    })
    .catch((err) => console.error("Error al eliminar:", err));
};

// 🗑️ ELIMINAR TODOS LOS ADELANTOS UNIFICADOS DE UN DÍA (SUPERADMIN CAMILO)
window.eliminarMultiplesTurnosSuperAdmin = function (idsStr) {
  if (!confirm("⚠️ ¿Estás seguro de eliminar TODOS los adelantos de este día?"))
    return;
  try {
    if (typeof haptic === "function") haptic();
  } catch (e) {}

  let idsArray = idsStr.split(",");
  let peticiones = idsArray.map((id) =>
    fetch(window.URL_ELIMINAR_TURNO, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `id=${encodeURIComponent(id)}`,
    }).then((res) => res.json()),
  );

  Promise.all(peticiones).then((resultados) => {
    if (typeof triggerToast === "function")
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-red);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg><span>Adelantos eliminados</span></div>`,
      );
    window.cargarHorasDesdeMySQL();
  });
};

// 🔍 FILTRO DE BÚSQUEDA
window.filtrarHorasInternas = function () {
  window.renderizarHorasEnPantalla();
};
