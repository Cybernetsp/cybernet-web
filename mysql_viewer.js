window.tablaMySQLActual = "netflix";
let searchTimeoutMySQL = null;

// =========================================================================
// 👁️ APERTURA Y CONTROL DEL PANEL MYSQL
// =========================================================================
window.toggleMysqlPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("mysqlOverlay");
  if (!overlay) return;

  if (overlay.classList.contains("open") || overlay.style.display === "flex") {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    if (typeof cerrarTodasLasVentanas === "function") cerrarTodasLasVentanas();
    overlay.classList.add("open");
    overlay.style.setProperty("display", "flex", "important");
    overlay.style.setProperty("align-items", "center", "important");
    overlay.style.setProperty("justify-content", "center", "important");

    const usuarioActivoObj = JSON.parse(
      sessionStorage.getItem("usuario_activo") || "{}",
    );
    const usuarioNombre = (
      usuarioActivoObj.nombre ||
      sessionStorage.getItem("active_staff") ||
      ""
    ).toUpperCase();
    const esSuperAdmin =
      usuarioActivoObj.rol === "superadmin" || usuarioNombre === "CAMILO";

    const btnAdd = document.getElementById("btnAgregarMySQL");
    if (btnAdd) {
      btnAdd.style.display = esSuperAdmin ? "inline-flex" : "none";
    }

    cargarDatosMySQL();
  }
};

// Evaluar sesión y rol del usuario
const usuarioActivoObj = JSON.parse(
  sessionStorage.getItem("usuario_activo") || "{}",
);
const usuarioNombre = (
  usuarioActivoObj.nombre ||
  sessionStorage.getItem("active_staff") ||
  ""
).toUpperCase();
const esSuperAdmin =
  usuarioActivoObj.rol === "superadmin" || usuarioNombre === "CAMILO";

document.addEventListener("DOMContentLoaded", () => {
  if (esSuperAdmin) {
    const btnAdd = document.getElementById("btnAgregarMySQL");
    if (btnAdd) {
      btnAdd.style.display = "inline-flex";
    }
  }
});

function cambiarTablaMySQL(nombreTabla, btnElement) {
  if (typeof haptic === "function") haptic();
  window.tablaMySQLActual = nombreTabla;

  document
    .querySelectorAll(".mysql-tab-btn")
    .forEach((b) => b.classList.remove("active"));
  if (btnElement) {
    btnElement.classList.add("active");
  }

  cargarDatosMySQL();
}

function filtrarMySQL() {
  clearTimeout(searchTimeoutMySQL);
  searchTimeoutMySQL = setTimeout(() => {
    cargarDatosMySQL();
  }, 300);
}

function cargarDatosMySQL() {
  const thead = document.getElementById("tablaMySQLCabecera");
  const tbody = document.getElementById("tablaMySQLCuerpo");
  if (!tbody || !thead) return;

  const tableNode = thead.closest("table");
  if (tableNode && tableNode.parentElement) {
    tableNode.parentElement.style.overflowX = "auto";
  }

  // 🛡️ INYECCIÓN DE ESTILOS: TABLE-LAYOUT FIXED CON TRUNCADO INTELIGENTE
  if (!document.getElementById("css-sticky-hover-mysql")) {
    const styleSticky = document.createElement("style");
    styleSticky.id = "css-sticky-hover-mysql";
    styleSticky.innerHTML = `
      #tablaMySQLCabecera th { position: sticky !important; top: 0 !important; z-index: 100 !important; background-color: #121317 !important; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.8) !important; white-space: nowrap !important; }
      .tr-mysql-row { background-color: #111216 !important; transition: background 0.2s ease !important; }
      .tr-mysql-row:hover { background-color: rgba(255, 255, 255, 0.04) !important; }
      .tr-mysql-row.tr-caida { background-color: rgba(255, 0, 0, 0.12) !important; }
      .tr-mysql-row.tr-caida:hover { background-color: rgba(255, 0, 0, 0.22) !important; }
      table { border-collapse: separate !important; border-spacing: 0 !important; table-layout: fixed !important; width: 100% !important; min-width: 1100px !important; background-color: #111216 !important; }
      th, td { white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
    `;
    document.head.appendChild(styleSticky);
  }

  const tablaLower = window.tablaMySQLActual.toLowerCase();
  const esNetflix = tablaLower === "netflix";
  const esGarantias = tablaLower === "garantias";
  const esVentas = tablaLower === "registro_ventas";

  let totalColumnas = 10;
  if (esNetflix) totalColumnas = 12;

  const thBase =
    "padding: 12px 8px; font-weight: 800; text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;";

  // 1. DIBUJAR ENCABEZADOS CON PROPORCIONES ESTRICTAS
  if (esNetflix) {
    thead.innerHTML = `
      <tr>
        <th style="${thBase} width: 6%;">FECHA</th>
        <th style="${thBase} width: 18%;">CORREO / USUARIO</th>
        <th style="${thBase} width: 10%;">CONTRASEÑA</th>
        <th style="${thBase} width: 4%; text-align: center;">PERFIL</th>
        <th style="${thBase} width: 4%; text-align: center;">PIN</th>
        <th style="${thBase} width: 10%;">VENCIMIENTO</th>
        <th style="${thBase} width: 10%;">CLIENTE</th>
        <th style="${thBase} width: 10%;">TELÉFONO</th>
        <th style="${thBase} width: 7%;">FECHA PAGO</th>
        <th style="${thBase} width: 6%;">VALOR</th>
        <th style="${thBase} width: 7%;">PAGO</th>
        <th style="${thBase} width: 8%; text-align: center;">ACCIÓN</th>
      </tr>
    `;
  } else if (esVentas) {
    thead.innerHTML = `
      <tr>
        <th style="${thBase} width: 8%;">FECHA</th>
        <th style="${thBase} width: 18%;">CLIENTE / TELÉFONO</th>
        <th style="${thBase} width: 28%;">PLATAFORMAS</th>
        <th style="${thBase} width: 10%; color: #30d158;">PAGO</th>
        <th style="${thBase} width: 10%;">MÉTODO</th>
        <th style="${thBase} width: 10%; text-align: center;">TIPO</th>
        <th style="${thBase} width: 16%; text-align: right; padding-right: 15px;">ACCIÓN</th>
      </tr>
    `;
  } else if (esGarantias) {
    thead.innerHTML = `
      <tr>
        <th style="${thBase} width: 15%; text-align: center;">PLATAFORMA</th>
        <th style="${thBase} width: 10%; color: #ff9f0a;">PROV</th>
        <th style="${thBase} width: 8%;">FECHA</th>
        <th style="${thBase} width: 22%;">CORREO / USUARIO</th>
        <th style="${thBase} width: 15%;">CONTRASEÑA</th>
        <th style="${thBase} width: 30%; text-align: right; padding-right: 15px;">ACCIÓN</th>
      </tr>
    `;
  } else {
    // DEMÁS PLATAFORMAS
    thead.innerHTML = `
      <tr>
        <th style="${thBase} width: 7%; color: #ff9f0a;">PROV</th>
        <th style="${thBase} width: 6%;">FECHA</th>
        <th style="${thBase} width: 18%;">CORREO / USUARIO</th>
        <th style="${thBase} width: 10%;">CONTRASEÑA</th>
        <th style="${thBase} width: 4%; text-align: center;">PERFIL</th>
        <th style="${thBase} width: 4%; text-align: center;">PIN</th>
        <th style="${thBase} width: 10%;">CLIENTE</th>
        <th style="${thBase} width: 9%;">TELÉFONO</th>
        <th style="${thBase} width: 32%; text-align: right; padding-right: 15px;">ACCIÓN</th>
      </tr>
    `;
  }

  const busquedaInput = document.getElementById("inputSearchMySQL");
  const busqueda = busquedaInput ? busquedaInput.value.trim() : "";

  tbody.innerHTML = `
    <tr>
      <td colspan="${totalColumnas}" style="text-align: center; padding: 40px; color: var(--text-secondary);">
        <svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:8px; vertical-align:middle;">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        </svg>
        Consultando MySQL...
      </td>
    </tr>
  `;

  fetch(
    `https://api.cybernetsp.com/obtener_tabla_mysql.php?tabla=${encodeURIComponent(window.tablaMySQLActual)}&busqueda=${encodeURIComponent(busqueda)}`,
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        let html = "";
        if (!data.data || data.data.length === 0) {
          html = `<tr><td colspan="${totalColumnas}" style="text-align: center; padding: 40px; color: var(--ios-red); font-weight: 600;">No se encontraron registros en esta tabla.</td></tr>`;
        } else {
          let fechaGrupoActual = null;

          data.data.forEach((fila, idx) => {
            let diaVal = fila.dia || fila.fecha || "-";
            let provVal = fila.proveedor || "-";
            let correoVal = fila.correo || fila.usuario || "-";
            let claveVal = fila.clave || fila.contrasena || "-";
            let perfilVal = fila.perfil || "-";
            let pinVal = fila.pin || "-";
            let vencVal = fila.vencimiento || "-";
            let clienteVal = fila.nombre || fila.cliente || "-";
            let numeroVal = fila.numero || fila.telefono || "-";
            let fechaPagoVal = fila.fecha || "-";
            let valorVal = fila.valor || "-";
            let pagoVal = fila.pago || "-";

            const esFilaPar = idx % 2 === 0;
            const colorFondoFila = esFilaPar
              ? "rgba(255, 255, 255, 0.015)"
              : "transparent";

            // GRUPO DE FECHA EN LA CABECERA
            if (
              !esVentas &&
              !esGarantias &&
              diaVal !== fechaGrupoActual &&
              diaVal !== "-"
            ) {
              fechaGrupoActual = diaVal;

              let btnBorrarFecha = "";
              if (esSuperAdmin) {
                btnBorrarFecha = `
                  <button onclick="eliminarFechaMySQL('${encodeURIComponent(diaVal)}')" style="background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.3); color: #ff453a; padding: 4px 12px; border-radius: 8px; font-size: 0.7rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 6px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Borrar Fecha
                  </button>
                `;
              }

              html += `
                <tr style="background: rgba(10, 132, 255, 0.05);">
                  <td colspan="${totalColumnas}" style="padding: 8px 16px; border-top: 1px solid rgba(10, 132, 255, 0.2); border-bottom: 1px solid rgba(10, 132, 255, 0.2); color: #0a84ff; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                      <span>📅 CUENTAS DEL: ${diaVal.toUpperCase()}</span>
                      ${btnBorrarFecha}
                    </div>
                  </td>
                </tr>
              `;
            }

            // TEXTO COMPLETO PARA FICHA
            let textoCopiarFicha = `📺 ${window.tablaMySQLActual.toUpperCase()}\n📧 Correo: ${correoVal}\n🔑 Clave: ${claveVal}\n👤 Perfil: ${perfilVal}\n📍 PIN: ${pinVal}`;
            if (esNetflix) {
              textoCopiarFicha += `\n📅 Vence: ${vencVal}`;
            } else if (provVal !== "-") {
              textoCopiarFicha = `📺 ${window.tablaMySQLActual.toUpperCase()}\n👤 Proveedor: ${provVal}\n📧 Correo: ${correoVal}\n🔑 Clave: ${claveVal}\n👤 Perfil: ${perfilVal}\n📍 PIN: ${pinVal}\n📅 Vence: ${vencVal}`;
            }

            let textoEscapadoFicha = encodeURIComponent(textoCopiarFicha);
            let filaJsonEscapada = encodeURIComponent(JSON.stringify(fila));

            // CELDAS CON LÍMITE RÍGIDO DE ANCHO Y RECORTE CON '...'
            let celdaCorreo =
              correoVal !== "-"
                ? `<span onclick="copiarTextoUnico(this, '${encodeURIComponent(correoVal)}')" style="color: #0a84ff; font-family: monospace; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; display: inline-block; vertical-align: middle; cursor: pointer; transition: color 0.15s ease;" title="${correoVal}">${correoVal}</span>`
                : '<span style="color: #a1a1aa;">-</span>';

            let celdaClave =
              claveVal !== "-"
                ? `<span onclick="copiarTextoUnico(this, '${encodeURIComponent(claveVal)}')" style="color: #30d158; font-family: monospace; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; display: inline-block; vertical-align: middle; cursor: pointer; transition: color 0.15s ease;" title="${claveVal}">${claveVal}</span>`
                : '<span style="color: #a1a1aa;">-</span>';

            let celdaPin =
              pinVal !== "-"
                ? `<span onclick="copiarTextoUnico(this, '${encodeURIComponent(pinVal)}')" style="color: #ffd60a; font-weight: 700; font-family: monospace; cursor: pointer; display: inline-block;" title="Clic para copiar PIN">${pinVal}</span>`
                : '<span style="color: #a1a1aa;">-</span>';

            let celdaTelefono =
              numeroVal !== "-" && numeroVal.trim() !== ""
                ? `<span onclick="copiarTextoUnico(this, '${encodeURIComponent(numeroVal)}')" style="font-family: monospace; color: #ffffff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px; display: inline-block; vertical-align: middle; cursor: pointer; transition: color 0.15s ease;" title="${numeroVal}">${numeroVal}</span>`
                : esSuperAdmin
                  ? `<button onclick="abrirModalEditarMySQL('${filaJsonEscapada}')" title="Agregar Teléfono" style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: var(--ios-green); padding: 4px 10px; border-radius: 8px; cursor: pointer; font-weight: 800; font-size: 0.8rem; display: inline-flex; align-items: center;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>`
                  : '<span style="color: #a1a1aa;">-</span>';

            const tdBase =
              "padding: 10px 8px; font-size: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.03); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;";

            // ─────────────────────────────────────────────────────────────
            // VISTA NETFLIX
            // ─────────────────────────────────────────────────────────────
            if (esNetflix) {
              let botonesAccionNetflix = `
                <div style="display: flex; gap: 5px; align-items: center; justify-content: flex-end; white-space: nowrap;">
              `;

              if (esSuperAdmin) {
                botonesAccionNetflix += `
                  <button onclick="abrirModalEditarMySQL('${filaJsonEscapada}')" title="Editar Datos" style="background: rgba(10, 132, 255, 0.1); border: 1px solid rgba(10, 132, 255, 0.2); border-radius: 6px; padding: 5px; color: #0a84ff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button onclick="eliminarRegistroMySQL(${fila.id}, '${encodeURIComponent(correoVal)}')" title="Eliminar Registro" style="background: rgba(255, 69, 58, 0.1); border: 1px solid rgba(255, 69, 58, 0.2); border-radius: 6px; padding: 5px; color: #ff453a; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                `;
              }

              // BOTÓN COPIAR COMPACTO (SVG SOLAMENTE)
              botonesAccionNetflix += `
                <button onclick="copiarAccesoMySQL(this, '${textoEscapadoFicha}')" title="Copiar Ficha Completa" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; padding: 5px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              `;

              // BOTÓN HOY COMPACTO (SVG SOLAMENTE)
              if (esSuperAdmin) {
                botonesAccionNetflix += `
                  <button onclick="window.pasarRegistroAHoyMySQL(${fila.id}, '${encodeURIComponent(correoVal)}')" title="Pasar registro a hoy" style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; padding: 5px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </button>
                `;
              }

              botonesAccionNetflix += `</div>`;

              html += `
                <tr style="background: ${colorFondoFila}; transition: background 0.2s ease;">
                  <td style="${tdBase} color: #a1a1aa;">${diaVal}</td>
                  <td style="${tdBase}">${celdaCorreo}</td>
                  <td style="${tdBase}">${celdaClave}</td>
                  <td style="${tdBase} text-align: center; color: #ffffff; font-weight: 600;">${perfilVal}</td>
                  <td style="${tdBase} text-align: center;">${celdaPin}</td>
                  <td style="${tdBase} font-weight: 800; color: #ff9f0a;">${vencVal}</td>
                  <td style="${tdBase} color: #e4e4e7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${clienteVal}">${clienteVal}</td>
                  <td style="${tdBase}">${celdaTelefono}</td>
                  <td style="${tdBase} color: #a1a1aa;">${fechaPagoVal}</td>
                  <td style="${tdBase} color: #30d158; font-weight: bold;">${valorVal}</td>
                  <td style="${tdBase} max-width: 100px; overflow: hidden;">
                    <span style="background: rgba(255,255,255,0.08); padding: 4px 8px; border-radius: 6px; font-size: 0.72rem; border: 1px solid rgba(255,255,255,0.1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: inline-block; max-width: 90px; vertical-align: middle; color: #bf5af2; font-weight: 700;" title="${pagoVal}">${pagoVal}</span>
                  </td>
                  <td style="${tdBase} text-align: center;">${botonesAccionNetflix}</td>
                </tr>
              `;
            }
            // ─────────────────────────────────────────────────────────────
            // DEMÁS PLATAFORMAS
            // ─────────────────────────────────────────────────────────────
            else if (!esVentas && !esGarantias) {
              let botonesAccionDemas = `
                <div style="display: flex; gap: 5px; align-items: center; justify-content: flex-end; white-space: nowrap;">
              `;

              if (esSuperAdmin) {
                botonesAccionDemas += `
                  <button onclick="abrirModalEditarMySQL('${filaJsonEscapada}')" title="Editar Datos" style="background: rgba(10, 132, 255, 0.1); border: 1px solid rgba(10, 132, 255, 0.2); border-radius: 6px; padding: 5px; color: #0a84ff; cursor: pointer; display: inline-flex; align-items: center;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button onclick="eliminarRegistroMySQL(${fila.id}, '${encodeURIComponent(correoVal)}')" title="Eliminar Registro" style="background: rgba(255, 69, 58, 0.1); border: 1px solid rgba(255, 69, 58, 0.2); border-radius: 6px; padding: 5px; color: #ff453a; cursor: pointer; display: inline-flex; align-items: center;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                `;
              }

              botonesAccionDemas += `
                <button onclick="copiarAccesoMySQL(this, '${textoEscapadoFicha}')" title="Copiar Ficha Completa" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; padding: 5px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
                <button onclick="window.generarTemp(this, ${fila.id})" style="background: rgba(255, 159, 10, 0.15); border: 1px solid rgba(255, 159, 10, 0.3); color: #ff9f0a; padding: 5px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">
                  ⏳ Temp
                </button>
                <button onclick="window.marcarComoGarantia(${fila.id}, '${encodeURIComponent(correoVal)}', '${encodeURIComponent(claveVal)}', '${encodeURIComponent(provVal)}', '${encodeURIComponent(diaVal)}')" style="background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.3); color: #ff453a; padding: 5px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">
                  🚨 Reportar
                </button>
              </div>`;

              html += `
                <tr style="background: ${colorFondoFila}; transition: background 0.2s ease;">
                  <td style="${tdBase} color: #ff9f0a; font-weight: 800; text-transform: uppercase;">${provVal}</td>
                  <td style="${tdBase} color: #a1a1aa;">${diaVal}</td>
                  <td style="${tdBase}">${celdaCorreo}</td>
                  <td style="${tdBase}">${celdaClave}</td>
                  <td style="${tdBase} text-align: center; color: #ffffff; font-weight: 600;">${perfilVal}</td>
                  <td style="${tdBase} text-align: center;">${celdaPin}</td>
                  <td style="${tdBase} color: #e4e4e7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${clienteVal}">${clienteVal}</td>
                  <td style="${tdBase}">${celdaTelefono}</td>
                  <td style="${tdBase} text-align: right; padding-right: 15px;">${botonesAccionDemas}</td>
                </tr>
              `;
            }
          });
        }
        tbody.innerHTML = html;
      } else if (data.status === "empty") {
        tbody.innerHTML = `<tr><td colspan="${totalColumnas}" style="text-align: center; padding: 40px; color: var(--text-secondary);">${data.message}</td></tr>`;
      } else {
        tbody.innerHTML = `<tr><td colspan="${totalColumnas}" style="text-align: center; padding: 40px; color: var(--ios-red); font-weight: 600;">Error: ${data.message}</td></tr>`;
      }
    })
    .catch((err) => {
      tbody.innerHTML = `<tr><td colspan="${totalColumnas}" style="text-align: center; padding: 40px; color: var(--ios-red); font-weight: 600;">❌ Error de conexión al consultar MySQL.</td></tr>`;
      console.error(err);
    });
}

function eliminarFechaMySQL(diaEscapado) {
  const diaValor = decodeURIComponent(diaEscapado);
  if (
    !confirm(
      `⚠️ ¿Estás seguro de que deseas eliminar TODOS los registros del día '${diaValor}' en la tabla '${window.tablaMySQLActual}'?`,
    )
  )
    return;

  if (typeof haptic === "function") haptic();

  const formData = new FormData();
  formData.append("accion", "eliminar_fecha");
  formData.append("tabla", window.tablaMySQLActual);
  formData.append("dia_valor", diaValor);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        cargarDatosMySQL();
      } else {
        alert("❌ " + data.message);
      }
    })
    .catch((err) => alert("❌ Error al procesar la eliminación por fecha."));
}

function abrirModalAgregarMySQL() {
  if (typeof haptic === "function") haptic();
  document.getElementById("formAgregarMySQL").reset();

  const selectPlat = document.getElementById("addMySQLPlataforma");
  if (selectPlat) {
    selectPlat.value = window.tablaMySQLActual;
  }

  document.getElementById("modalAgregarMySQL").style.display = "flex";
  document.getElementById("addMySQLBloque").focus();
}

function cerrarModalAgregarMySQL() {
  if (typeof haptic === "function") haptic();
  document.getElementById("modalAgregarMySQL").style.display = "none";
}

function guardarNuevoRegistroMySQL(e) {
  e.preventDefault();
  if (typeof haptic === "function") haptic();

  const btn = document.getElementById("btnGuardarAddMySQL");
  const plataforma = document.getElementById("addMySQLPlataforma").value;
  const bloque = document.getElementById("addMySQLBloque").value.trim();

  if (!bloque) {
    alert("⚠️ Pega primero los datos de Google Sheets en el recuadro.");
    return;
  }

  btn.disabled = true;
  btn.innerText = "Subiendo...";

  const formData = new FormData();
  formData.append("accion", "agregar");
  formData.append("tabla", plataforma);
  formData.append("bloque_cuentas", bloque);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      btn.disabled = false;
      btn.innerText = "Subir a MySQL";

      if (data.status === "success") {
        cerrarModalAgregarMySQL();
        if (
          plataforma.toLowerCase() === window.tablaMySQLActual.toLowerCase()
        ) {
          cargarDatosMySQL();
        } else {
          window.tablaMySQLActual = plataforma;
          document
            .querySelectorAll(".mysql-tab-btn")
            .forEach((b) => b.classList.remove("active"));
          cargarDatosMySQL();
        }
      } else {
        alert("❌ " + data.message);
      }
    })
    .catch((err) => {
      btn.disabled = false;
      btn.innerText = "Subir a MySQL";
      alert("❌ Error al conectar con el servidor.");
    });
}

function abrirModalEditarMySQL(filaEscapada) {
  if (typeof haptic === "function") haptic();
  const fila = JSON.parse(decodeURIComponent(filaEscapada));

  document.getElementById("editMySQLId").value = fila.id;
  document.getElementById("editMySQLCorreo").value =
    fila.correo || fila.usuario || "";
  document.getElementById("editMySQLClave").value =
    fila.clave || fila.contrasena || "";
  document.getElementById("editMySQLPerfil").value = fila.perfil || "";
  document.getElementById("editMySQLPin").value = fila.pin || "";
  document.getElementById("editMySQLVencimiento").value =
    fila.vencimiento || "";
  document.getElementById("editMySQLNombre").value =
    fila.nombre || fila.cliente || "";
  document.getElementById("editMySQLNumero").value =
    fila.numero || fila.telefono || "";

  document.getElementById("modalEditarMySQL").style.display = "flex";
}

function cerrarModalEditarMySQL() {
  if (typeof haptic === "function") haptic();
  document.getElementById("modalEditarMySQL").style.display = "none";
}

function guardarEdicionMySQL(e) {
  e.preventDefault();
  if (typeof haptic === "function") haptic();

  const btn = document.getElementById("btnGuardarEditMySQL");
  btn.disabled = true;
  btn.innerText = "Guardando...";

  const formData = new FormData();
  formData.append("accion", "editar");
  formData.append("tabla", window.tablaMySQLActual);
  formData.append("id", document.getElementById("editMySQLId").value);
  formData.append("correo", document.getElementById("editMySQLCorreo").value);
  formData.append("clave", document.getElementById("editMySQLClave").value);
  formData.append("perfil", document.getElementById("editMySQLPerfil").value);
  formData.append("pin", document.getElementById("editMySQLPin").value);
  formData.append(
    "vencimiento",
    document.getElementById("editMySQLVencimiento").value,
  );
  formData.append("nombre", document.getElementById("editMySQLNombre").value);
  formData.append("numero", document.getElementById("editMySQLNumero").value);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      btn.disabled = false;
      btn.innerText = "Guardar";

      if (data.status === "success") {
        cerrarModalEditarMySQL();
        cargarDatosMySQL();
      } else {
        alert("❌ " + data.message);
      }
    })
    .catch((err) => {
      btn.disabled = false;
      btn.innerText = "Guardar";
      alert("❌ Error al actualizar el registro.");
    });
}

function eliminarRegistroMySQL(id) {
  if (
    !confirm("⚠️ ¿Estás seguro de que deseas eliminar este registro de MySQL?")
  )
    return;
  if (typeof haptic === "function") haptic();

  const formData = new FormData();
  formData.append("accion", "eliminar");
  formData.append("tabla", window.tablaMySQLActual);
  formData.append("id", id);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        cargarDatosMySQL();
      } else {
        alert("❌ " + data.message);
      }
    })
    .catch((err) => alert("❌ Error al eliminar el registro."));
}

// COPIADO DIRECTO AL HACER CLIC SOBRE EL TEXTO
function copiarTextoUnico(element, textoEscapado) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(textoEscapado);

  const copiarAccion = () => {
    const colorOriginal = element.style.color;
    element.style.color = "#30d158";

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>¡Copiado al portapapeles!</span></div>`,
      );
    }

    setTimeout(() => {
      element.style.color = colorOriginal;
    }, 1000);
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(texto)
      .then(copiarAccion)
      .catch(() => {
        fallbackCopiar(texto, copiarAccion);
      });
  } else {
    fallbackCopiar(texto, copiarAccion);
  }
}

function fallbackCopiar(texto, callback) {
  const textarea = document.createElement("textarea");
  textarea.value = texto;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
    callback();
  } catch (err) {
    alert("Tu navegador no permitió copiar el texto automáticamente.");
  }
  document.body.removeChild(textarea);
}

// COPIAR FICHA COMPLETA CON ANIMACIÓN DE CHECK
function copiarAccesoMySQL(btn, textoEscapado) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(textoEscapado);

  navigator.clipboard.writeText(texto).then(() => {
    let oldHtml = btn.innerHTML;
    let oldBg = btn.style.background;

    // Cambia el ícono SVG por un Checkmark verde sutil
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#30d158" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    btn.style.background = "rgba(48, 209, 88, 0.2)";

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Ficha copiada al portapapeles</span></div>`,
      );
    }

    setTimeout(() => {
      btn.innerHTML = oldHtml;
      btn.style.background = oldBg;
    }, 1500);
  });
}

window.generarTemp = function (btn, id) {
  if (typeof haptic === "function") haptic();

  const urlPHP = `https://api.cybernetsp.com/obtener_tabla_mysql.php?tabla=${encodeURIComponent(window.tablaMySQLActual)}`;
  fetch(urlPHP)
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success" && data.data) {
        let filaEncontrada = data.data.find(
          (f) => parseInt(f.id) === parseInt(id),
        );

        if (filaEncontrada) {
          let cuenta = filaEncontrada;
          let perfilTxt =
            cuenta.perfil && cuenta.perfil !== "N/A" && cuenta.perfil !== ""
              ? `\n👤 *Perfil:* ${cuenta.perfil}`
              : "";
          let pinTxt =
            cuenta.pin &&
            cuenta.pin !== "N/A" &&
            cuenta.pin !== "-" &&
            cuenta.pin !== ""
              ? `\n📍 *PIN:* ${cuenta.pin}`
              : "";
          let platNorm = window.tablaMySQLActual
            .toUpperCase()
            .replace(/_/g, " ");

          let mensajeTemporal = `🌟 *¡Hola! Lamentamos los inconvenientes con tu servicio.*\n\nMientras nuestro equipo técnico repara tu cuenta principal, te hemos habilitado un *acceso temporal* para que no pares de disfrutar tu programación favorita 🍿🎬:\n\n📺 *${platNorm} (TEMPORAL)*\n────────────────────\n📧 *Correo:* ${cuenta.correo || cuenta.usuario}\n🔐 *Clave:* ${cuenta.clave || cuenta.contrasena}${perfilTxt}${pinTxt}\n────────────────────\n_Te avisaremos por este medio apenas tu cuenta original esté solucionada. ¡Gracias por tu paciencia!_ ✨`;

          navigator.clipboard.writeText(mensajeTemporal).then(() => {
            if (btn) {
              let oldText = btn.innerHTML;
              btn.innerHTML = `✅ Copiado`;
              btn.style.setProperty("background", "#30d158", "important");
              btn.style.setProperty("color", "#000000", "important");
              btn.style.setProperty("border-color", "transparent", "important");

              setTimeout(() => {
                btn.innerHTML = oldText;
                btn.style.setProperty(
                  "background",
                  "rgba(255, 159, 10, 0.15)",
                  "important",
                );
                btn.style.setProperty("color", "#ff9f0a", "important");
                btn.style.setProperty(
                  "border-color",
                  "rgba(255, 159, 10, 0.3)",
                  "important",
                );
              }, 1500);
            }

            if (typeof triggerToast === "function")
              triggerToast(
                `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Cuenta temporal copiada al portapapeles</span></div>`,
              );
          });
        }
      }
    });
};

window.marcarComoGarantia = function (
  id,
  correoEscapado,
  claveEscapada,
  provEscapado,
  diaEscapado = "",
) {
  if (
    !confirm(
      "⚠️ ¿Estás seguro de enviar esta cuenta a Garantías? Toda la cuenta se marcará como caída (rojo).",
    )
  )
    return;
  if (typeof haptic === "function") haptic();

  const correo = decodeURIComponent(correoEscapado);
  const clave = decodeURIComponent(claveEscapada);
  const prov = decodeURIComponent(provEscapado);
  const dia = diaEscapado ? decodeURIComponent(diaEscapado) : "";

  const formData = new FormData();
  formData.append("accion", "reportar_garantia");
  formData.append("tabla", window.tablaMySQLActual);
  formData.append("id", id);
  formData.append("correo", correo);
  formData.append("clave", clave);
  formData.append("proveedor", prov);
  formData.append("fecha_compra", dia);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then(async (res) => {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (errParse) {
        throw new Error("Respuesta inválida del servidor PHP: " + text);
      }
    })
    .then((data) => {
      if (data.status === "success") {
        window.cargarDatosMySQL();
        if (typeof triggerToast === "function")
          triggerToast("🚨 " + data.message);
      } else {
        alert("❌ Error: " + data.message);
      }
    })
    .catch((err) => {
      console.error(err);
      alert("❌ Error de comunicación: \n" + err.message);
    });
};

window.pasarRegistroAHoyMySQL = function (id, correoEscapado = "") {
  if (typeof haptic === "function") haptic();
  const correo = correoEscapado ? decodeURIComponent(correoEscapado) : "";

  const formData = new FormData();
  formData.append("accion", "pasar_a_hoy");
  formData.append("tabla", window.tablaMySQLActual);
  formData.append("id", id);
  formData.append("correo", correo);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        window.cargarDatosMySQL();
        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>${data.message}</span></div>`,
          );
        }
      } else {
        alert("❌ Error: " + data.message);
      }
    })
    .catch((err) => {
      console.error(err);
      alert("❌ Error de comunicación al mover la fecha.");
    });
};
