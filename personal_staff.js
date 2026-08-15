/* ==========================================================================
   👥 MÓDULO CONTROL DE PERSONAL / HORAS (CONEXIÓN DIRECTA A MYSQL)
   ========================================================================== */

window.currentHorasStock = [];

// 👁️ APERTURA Y CONTROL DEL PANEL DE PERSONAL
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

    window.cargarHorasDesdeMySQL();
  }
};

// 🔄 OBTENER REGISTROS DESDE obtener_horas.php
window.cargarHorasDesdeMySQL = function () {
  const container = document.getElementById("shiftsScrollArea");
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center; padding:40px; color:#0a84ff;">
      <div style="display:flex; flex-direction:column; align-items:center; gap:12px;">
        <svg class="spin-anim" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
        <span style="font-weight:700; font-size:0.9rem;">Cargando turnos desde MySQL...</span>
      </div>
    </div>`;

  // APUNTA DIRECTAMENTE A obtener_horas.php
  fetch("obtener_horas.php")
    .then((res) => res.json())
    .then((res) => {
      if (res && res.status === "success") {
        window.currentHorasStock = res.data || [];
        window.renderizarHorasEnPantalla();
      } else {
        container.innerHTML = `<div style="text-align:center; padding:30px; color:#ff453a; font-weight:700;">❌ Error: ${res ? res.message : "Fallo al consultar la base de datos."}</div>`;
      }
    })
    .catch((err) => {
      console.error("Error al cargar horas:", err);
      container.innerHTML = `<div style="text-align:center; padding:30px; color:#ff453a; font-weight:700;">❌ Error de conexión al consultar obtener_horas.php</div>`;
    });
};

// 🎨 RENDERIZADO DE LA LISTA DE PERSONAL Y TURNOS
window.renderizarHorasEnPantalla = function () {
  const container = document.getElementById("shiftsScrollArea");
  const inputSearch = document.getElementById("searchShiftsInput");
  const filtro = inputSearch ? inputSearch.value.toLowerCase().trim() : "";

  if (!container) return;

  let datos = window.currentHorasStock;

  if (filtro !== "") {
    datos = datos.filter((item) => {
      return (
        (item.vendedor || "").toLowerCase().includes(filtro) ||
        (item.fecha || "").toLowerCase().includes(filtro) ||
        (item.estado || "").toLowerCase().includes(filtro)
      );
    });
  }

  if (!datos || datos.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:#a1a1aa; font-weight:600; background:rgba(255,255,255,0.02); border-radius:18px; border:1px dashed rgba(255,255,255,0.08);">
        📌 No se encontraron turnos o registros de personal.
      </div>`;
    return;
  }

  let html = `<div style="display:flex; flex-direction:column; gap:10px; width:100%;">`;

  datos.forEach((item) => {
    let vendedor = (item.vendedor || "STAFF").toUpperCase();
    let fecha = item.fecha || "-";
    let tiempo = item.tiempo_trabajado || "00:00:00";
    let total = (item.total || 0).toLocaleString("es-CO");
    let salida = item.hora_salida || "-";
    let estado = item.estado || "Completado";

    let colorEstado =
      estado.toLowerCase().includes("inactivo") ||
      estado.toLowerCase().includes("cerrado")
        ? "#ff453a"
        : "#30d158";
    let bgEstado =
      estado.toLowerCase().includes("inactivo") ||
      estado.toLowerCase().includes("cerrado")
        ? "rgba(255,69,58,0.15)"
        : "rgba(48,209,88,0.15)";

    html += `
      <div style="background: rgba(255, 255, 255, 0.025); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; transition: all 0.2s ease;">
        
        <!-- VENDEDOR Y FECHA -->
        <div style="display: flex; flex-direction: column; gap: 4px; flex: 1; overflow: hidden;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(10, 132, 255, 0.15); border: 1px solid rgba(10, 132, 255, 0.3); color: #0a84ff; font-weight: 900; font-size: 0.85rem; display: flex; align-items: center; justify-content: center;">
              ${vendedor.charAt(0)}
            </div>
            <span style="font-weight: 800; font-size: 0.95rem; color: #ffffff;">${vendedor}</span>
            <span style="background: ${bgEstado}; color: ${colorEstado}; font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 6px; text-transform: uppercase;">${estado}</span>
          </div>
          <span style="font-size: 0.75rem; color: #a1a1aa; font-family: monospace;">📅 ${fecha} | Salida: ${salida}</span>
        </div>

        <!-- TIEMPO TRABAJADO Y TOTAL GANADO -->
        <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
          <div style="text-align: right;">
            <span style="display: block; font-size: 0.72rem; color: #a1a1aa; font-weight: 700; text-transform: uppercase;">Tiempo</span>
            <span style="font-size: 0.92rem; font-weight: 800; color: #0a84ff; font-family: monospace;">${tiempo}</span>
          </div>

          <div style="background: rgba(48, 209, 88, 0.12); border: 1px solid rgba(48, 209, 88, 0.3); padding: 6px 12px; border-radius: 10px; text-align: right;">
            <span style="display: block; font-size: 0.65rem; color: #a1a1aa; font-weight: 700; text-transform: uppercase;">Total</span>
            <span style="font-size: 1rem; font-weight: 900; color: #30d158; font-family: monospace;">$${total}</span>
          </div>
        </div>

      </div>`;
  });

  html += `</div>`;
  container.innerHTML = html;
};

// 🔍 FILTRAR REGISTROS
window.filtrarHorasInternas = function () {
  window.renderizarHorasEnPantalla();
};
