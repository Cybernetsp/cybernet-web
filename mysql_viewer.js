/* ==========================================================================
   🗄️ CYBERNET OS - VISOR MAESTRO DE MYSQL Y GESTIÓN DE DATOS (mysql_viewer.js)
   ========================================================================== */

window.tablaMySQLActual = "netflix";
let searchTimeoutMySQL = null;

// =========================================================================
// 👁️ APERTURA Y CONTROL DEL PANEL MYSQL
// =========================================================================
const oldToggleMysqlPanel = window.toggleMysqlPanel;
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

    // Verificar si es superadmin para habilitar el botón de agregar
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

    window.cargarDatosMySQL();
  }
};

window.cambiarTablaMySQL = function (nombreTabla, btnElement) {
  if (typeof haptic === "function") haptic();
  window.tablaMySQLActual = nombreTabla;

  document
    .querySelectorAll(".mysql-tab-btn")
    .forEach((b) => b.classList.remove("active"));
  if (btnElement) {
    btnElement.classList.add("active");
  }

  window.cargarDatosMySQL();
};

window.filtrarMySQL = function () {
  clearTimeout(searchTimeoutMySQL);
  searchTimeoutMySQL = setTimeout(() => {
    window.cargarDatosMySQL();
  }, 300);
};

// =========================================================================
// 🗄️ RENDERIZADO VISUAL ESTILO CYBERNET (TABLA MAESTRA)
// =========================================================================
window.cargarDatosMySQL = function () {
  const thead = document.getElementById("tablaMySQLCabecera");
  const tbody = document.getElementById("tablaMySQLCuerpo");
  if (!tbody || !thead) return;

  const tableNode = thead.closest("table");
  if (tableNode && tableNode.parentElement) {
    tableNode.parentElement.style.overflowX = "auto";
  }

  // 🛡️ INYECCIÓN DE ESTILOS: PALETA DE COLORES EXACTA
  if (!document.getElementById("css-sticky-hover-mysql")) {
    const styleSticky = document.createElement("style");
    styleSticky.id = "css-sticky-hover-mysql";
    styleSticky.innerHTML = `
      #tablaMySQLCabecera th { position: sticky !important; top: 0 !important; z-index: 100 !important; background-color: #121317 !important; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.8) !important; white-space: nowrap !important; }
      .tr-mysql-row { background-color: #111216 !important; transition: background 0.2s ease !important; }
      .tr-mysql-row:hover { background-color: rgba(255, 255, 255, 0.04) !important; }
      .tr-mysql-row.tr-caida { background-color: rgba(255, 0, 0, 0.12) !important; }
      .tr-mysql-row.tr-caida:hover { background-color: rgba(255, 0, 0, 0.22) !important; }
      table { border-collapse: separate !important; border-spacing: 0 !important; table-layout: fixed !important; width: 100% !important; min-width: 1350px !important; background-color: #111216 !important; }
    `;
    document.head.appendChild(styleSticky);
  }

  const thBase =
    "padding: 12px 10px; font-weight: 800; text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.5px;";
  const tablaActualLower = (window.tablaMySQLActual || "").toLowerCase();
  const esVentas = tablaActualLower === "registro_ventas";
  const esGarantias = tablaActualLower === "garantias";
  const esNetflix = tablaActualLower === "netflix";

  // ENCABEZADOS CON ANCHOS ESTRICTOS
  if (esVentas) {
    thead.innerHTML = `
      <tr>
        <th style="${thBase} width: 10%; color: #a1a1aa;">FECHA</th>
        <th style="${thBase} width: 18%; color: #a1a1aa;">CLIENTE / TELÉFONO</th>
        <th style="${thBase} width: 30%; color: #a1a1aa;">PLATAFORMAS</th>
        <th style="${thBase} width: 12%; color: #30d158;">PAGO</th>
        <th style="${thBase} width: 10%; color: #a1a1aa;">MÉTODO</th>
        <th style="${thBase} width: 10%; color: #a1a1aa; text-align: center;">TIPO</th>
        <th style="${thBase} width: 10%; color: #a1a1aa; text-align: right; padding-right: 15px;">ACCIÓN</th>
      </tr>
    `;
  } else if (esGarantias) {
    thead.innerHTML = `
      <tr>
        <th style="${thBase} width: 15%; color: #a1a1aa; text-align: center;">PLATAFORMA</th>
        <th style="${thBase} width: 12%; color: #ff9f0a;">PROV</th>
        <th style="${thBase} width: 8%; color: #a1a1aa;">FECHA</th>
        <th style="${thBase} width: 25%; color: #a1a1aa;">CORREO / USUARIO</th>
        <th style="${thBase} width: 15%; color: #a1a1aa;">CONTRASEÑA</th>
        <th style="${thBase} width: 25%; color: #a1a1aa; text-align: right; padding-right: 15px;">ACCIÓN</th>
      </tr>
    `;
  } else if (esNetflix) {
    thead.innerHTML = `
      <tr>
        <th style="${thBase} width: 5%; color: #a1a1aa;">DÍA</th>
        <th style="${thBase} width: 17%; color: #a1a1aa;">CORREO / USUARIO</th>
        <th style="${thBase} width: 9%; color: #a1a1aa;">CONTRASEÑA</th>
        <th style="${thBase} width: 4%; color: #a1a1aa; text-align: center;">PERFIL</th>
        <th style="${thBase} width: 4%; color: #a1a1aa; text-align: center;">PIN</th>
        <th style="${thBase} width: 10%; color: #ff9500;">VENCIMIENTO</th>
        <th style="${thBase} width: 10%; color: #a1a1aa;">CLIENTE</th>
        <th style="${thBase} width: 9%; color: #a1a1aa;">TELÉFONO</th>
        <th style="${thBase} width: 6%; color: #a1a1aa;">F. PAGO</th>
        <th style="${thBase} width: 7%; color: #30d158;">VALOR</th>
        <th style="${thBase} width: 10%; color: #bf5af2;">MÉTODO</th>
        <th style="${thBase} width: 9%; color: #a1a1aa; text-align: right; padding-right: 10px;">ACCIÓN</th>
      </tr>
    `;
  } else {
    thead.innerHTML = `
      <tr>
        <th style="${thBase} width: 8%; color: #ff9f0a;">PROV</th>
        <th style="${thBase} width: 6%; color: #a1a1aa;">FECHA</th>
        <th style="${thBase} width: 18%; color: #a1a1aa;">CORREO / USUARIO</th>
        <th style="${thBase} width: 10%; color: #a1a1aa;">CONTRASEÑA</th>
        <th style="${thBase} width: 6%; color: #a1a1aa; text-align: center;">PERFIL</th>
        <th style="${thBase} width: 5%; color: #a1a1aa; text-align: center;">PIN</th>
        <th style="${thBase} width: 12%; color: #a1a1aa;">CLIENTE</th>
        <th style="${thBase} width: 10%; color: #a1a1aa;">TELÉFONO</th>
        <th style="${thBase} width: 25%; color: #a1a1aa; text-align: right; padding-right: 15px;">ACCIÓN</th>
      </tr>
    `;
  }

  const busquedaInput = document.getElementById("inputSearchMySQL");
  const busqueda = busquedaInput ? busquedaInput.value.trim() : "";

  tbody.innerHTML = `
    <tr>
      <td colspan="12" style="text-align: center; padding: 40px; color: #a1a1aa; background: #111216;">
        <svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:8px; vertical-align:middle;">
          <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        </svg> Consultando BD...
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
          if (esGarantias) {
            html = `<tr><td colspan="12" style="text-align: center; padding: 60px; color: #30d158; font-weight: 800; background: #111216;">🎉 ¡Excelente! No hay cuentas en garantía pendientes.</td></tr>`;
          } else {
            html = `<tr><td colspan="12" style="text-align: center; padding: 60px; color: #a1a1aa; font-weight: 500; background: #111216;">No hay datos para mostrar en esta vista.</td></tr>`;
          }
        } else {
          let dataOrdenada = data.data;
          let fechaGrupoActual = null;

          const svgCopyIcon = (datoEscapado) => {
            return `
              <button onclick="window.copiarTextoUnico(this, '${datoEscapado}')" style="background: transparent; border: none; color: #71717a; cursor: pointer; padding: 2px 4px; display: inline-flex; align-items: center; transition: color 0.2s ease; flex-shrink: 0;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#71717a'" title="Copiar al portapapeles">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            `;
          };

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

          dataOrdenada.forEach((fila) => {
            let diaVal = fila.dia || fila.fecha || "-";
            let provVal = fila.proveedor || "-";
            let correoVal = fila.correo || fila.usuario || "-";
            let claveVal = fila.clave || fila.contrasena || "-";

            let perfilVal = fila.perfil || fila.perfiles || "";
            if (!perfilVal || perfilVal.trim() === "" || perfilVal === "-") {
              perfilVal =
                correoVal.includes("VTA:") || correoVal.includes("RENO:")
                  ? "1"
                  : "-";
            }

            let pinVal = fila.pin || "-";
            let vencVal = fila.vencimiento || "-";
            let clienteVal =
              fila.nombre &&
              fila.nombre !== "Sin Nombre" &&
              fila.nombre.trim() !== ""
                ? fila.nombre
                : fila.cliente &&
                    fila.cliente !== "Sin Nombre" &&
                    fila.cliente.trim() !== ""
                  ? fila.cliente
                  : "-";
            let numeroVal = fila.numero || fila.telefono || "-";

            let fechaPagoVal = fila.fecha || "-";
            let valorVal = fila.valor || "-";
            let pagoVal = fila.pago || "-";

            let isCaida = fila.estado === "caida" || fila.es_caida == 1;

            if (
              !esVentas &&
              !esGarantias &&
              diaVal !== fechaGrupoActual &&
              diaVal !== "-"
            ) {
              fechaGrupoActual = diaVal;
              html += `
                <tr style="background: #0e1a2b !important; border-top: 1px solid rgba(10, 132, 255, 0.3); border-bottom: 1px solid rgba(10, 132, 255, 0.3);">
                  <td colspan="12" style="padding: 7px 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                      <div style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">🗓️ CUENTAS DEL: ${diaVal}</div>
                      ${esSuperAdmin ? `<button onclick="window.eliminarFechaMySQL('${encodeURIComponent(diaVal)}')" style="background: rgba(255, 69, 58, 0.12); border: 1px solid rgba(255, 69, 58, 0.25); color: #ff453a; padding: 4px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease;">🗑️ Borrar Fecha</button>` : ""}
                    </div>
                  </td>
                </tr>
              `;
            }

            let platFormat = window.tablaMySQLActual
              .toUpperCase()
              .replace(/_/g, "-");
            let nombreClienteFicha =
              clienteVal !== "-" &&
              clienteVal !== "Sin Nombre" &&
              clienteVal !== ""
                ? " " + clienteVal
                : "";
            let textoCopiarFicha = `🌟 *¡Hola${nombreClienteFicha}!*\n\nTu pedido ha sido procesado con éxito. Aquí tienes tus accesos:\n\n🎬 *DETALLES DE ${platFormat.replace(/-/g, " ")}* ✅\n────────────────────\n`;

            if (platFormat === "NETFLIX")
              textoCopiarFicha += `⚠️ *Para iniciar sesión:* Cuando te pida un código, selecciona *Obtener ayuda* y después *Usar contraseña*.\n\n`;

            let etiquetaUser =
              platFormat === "IPTV" || platFormat === "EMBY"
                ? "Usuario"
                : "Correo";
            let etiquetaPerfil =
              platFormat === "IPTV"
                ? "URL"
                : platFormat === "EMBY"
                  ? "Servidor"
                  : "Perfil";

            textoCopiarFicha += `👤 *${etiquetaUser}:* ${correoVal}\n🔐 *Contraseña:* ${claveVal}\n`;

            if (
              platFormat === "IPTV" ||
              platFormat === "EMBY" ||
              (perfilVal !== "-" && perfilVal !== "")
            )
              textoCopiarFicha += `🌐 *${etiquetaPerfil}:* ${perfilVal}\n`;
            if (platFormat === "EMBY")
              textoCopiarFicha += `🔌 *Puerto:* Dejar vacío\n`;
            if (pinVal !== "-" && pinVal !== "")
              textoCopiarFicha += `📍 *PIN:* ${pinVal}\n`;
            if (vencVal !== "-" && vencVal !== "")
              textoCopiarFicha += `📅 *Vence:* ${vencVal}\n\n🤖 *¿NECESITAS UN CÓDIGO?* Puedes usar nuestra pagina para codigos disponible 24/7: www.cybernetsp.com/\n`;

            textoCopiarFicha += `\n📢 *INFORMACIÓN IMPORTANTE:* \n────────────────────\n⚠️ *Garantía activa:* Tu servicio cuenta con respaldo total durante su vigencia. \n🆘 *Soporte:* Si presentas algún inconveniente, *infórmanos de inmediato* para brindarte una solución rápida.\n\n💎 *Disfruta tu servicio.*\n✨ *¡Gracias por elegirnos!* ✨`;
            let textoEscapadoFicha = encodeURIComponent(textoCopiarFicha);

            let filaJsonEscapada = encodeURIComponent(
              JSON.stringify(fila),
            ).replace(/'/g, "%27");

            let celdaCorreo =
              correoVal !== "-"
                ? `<div style="display: flex; align-items: center; justify-content: flex-start; gap: 6px; width: 100%;"><span style="color: #ffffff; font-family: monospace; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;" title="${correoVal}">${correoVal}</span>${svgCopyIcon(encodeURIComponent(correoVal))}</div>`
                : '<span style="color: #a1a1aa;">-</span>';
            let celdaClave =
              claveVal !== "-"
                ? `<div style="display: flex; align-items: center; justify-content: flex-start; gap: 6px; width: 100%;"><span style="color: #30d158; font-family: monospace; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;" title="${claveVal}">${claveVal}</span>${svgCopyIcon(encodeURIComponent(claveVal))}</div>`
                : '<span style="color: #30d158; font-weight: 700;">-</span>';
            let celdaVencimiento =
              vencVal !== "-"
                ? `<span style="color: #ff9500; font-weight: 800; font-family: monospace; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;" title="${vencVal}">${vencVal}</span>`
                : '<span style="color: #a1a1aa;">-</span>';

            let celdaTelefonoContent = "";
            if (numeroVal === "-" || numeroVal.trim() === "") {
              celdaTelefonoContent = `<button onclick="window.abrirModalEditarMySQL('${filaJsonEscapada}')" title="Agregar Teléfono" style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: var(--ios-green); padding: 4px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>`;
            } else {
              celdaTelefonoContent = `<span style="font-family: monospace; color: #ffffff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;" title="${numeroVal}">${numeroVal}</span>`;
            }

            let botonesEdicionIzquierda = "";
            if (numeroVal !== "-" && numeroVal.trim() !== "") {
              botonesEdicionIzquierda = `
                <button onclick="window.abrirModalEditarMySQL('${filaJsonEscapada}')" title="Editar" style="background: rgba(10, 132, 255, 0.12); border: 1px solid rgba(10, 132, 255, 0.25); border-radius: 6px; padding: 5px; color: #0a84ff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                <button onclick="window.eliminarRegistroMySQL(${fila.id}, '${encodeURIComponent(correoVal)}')" title="Eliminar" style="background: rgba(255, 69, 58, 0.12); border: 1px solid rgba(255, 69, 58, 0.25); border-radius: 6px; padding: 5px; color: #ff453a; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
              `;
            }

            let botonCopiar = `<button onclick="window.copiarAccesoMySQL(this, '${textoEscapadoFicha}')" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; padding: 5px 12px; border-radius: 8px; font-size: 0.72rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">📋 Copiar</button>`;

            let botonPasarHoy = esSuperAdmin
              ? `<button onclick="window.pasarRegistroAHoyMySQL(${fila.id}, '${encodeURIComponent(correoVal)}')" title="Pasar a hoy" style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; padding: 5px 8px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">📅 Hoy</button>`
              : "";

            let tdBase = "padding: 10px 10px; font-size: 0.8rem;";
            let styleExtra = isCaida
              ? "border-bottom: 1px solid rgba(255, 69, 58, 0.3);"
              : "border-bottom: 1px solid rgba(255, 255, 255, 0.03);";

            if (esNetflix) {
              html += `
                <tr class="tr-mysql-row ${isCaida ? "tr-caida" : ""}" style="${styleExtra}">
                  <td style="${tdBase} color: #a1a1aa; font-weight: 600;"><span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">${diaVal}</span></td>
                  <td style="${tdBase}">${celdaCorreo}</td>
                  <td style="${tdBase}">${celdaClave}</td>
                  <td style="${tdBase} text-align: center; color: #ffffff; font-weight: 700;">${perfilVal}</td>
                  <td style="${tdBase} text-align: center; color: #a1a1aa;">${pinVal}</td>
                  <td style="${tdBase}">${celdaVencimiento}</td>
                  <td style="${tdBase} color: #a1a1aa;"><span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;" title="${clienteVal}">${clienteVal}</span></td>
                  <td style="${tdBase}">${celdaTelefonoContent}</td>
                  <td style="${tdBase} color: #a1a1aa; font-family: monospace;">${fechaPagoVal}</td>
                  <td style="${tdBase} color: #30d158; font-weight: 800; font-family: monospace;">${valorVal}</td>
                  <td style="${tdBase} color: #bf5af2; font-weight: 700;"><span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;" title="${pagoVal}">${pagoVal}</span></td>
                  <td style="${tdBase} text-align: right; padding-right: 10px;">
                    <div style="display: flex; gap: 4px; justify-content: flex-end; align-items: center; min-width: 110px;">
                      ${botonesEdicionIzquierda}
                      ${botonCopiar}
                      ${botonPasarHoy}
                    </div>
                  </td>
                </tr>
              `;
            } else if (!esVentas && !esGarantias) {
              let botonTemp = !isCaida
                ? `<button onclick="window.generarTemp(this, ${fila.id})" style="background: rgba(255, 159, 10, 0.15); border: 1px solid rgba(255, 159, 10, 0.3); color: #ff9f0a; padding: 5px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">⏳ Temp</button>`
                : "";

              let botonEstado = isCaida
                ? `<button onclick="window.abrirModalResolverGarantia('${fila.id}', '${encodeURIComponent(correoVal)}', '${window.tablaMySQLActual}')" style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; padding: 5px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">✔️ Resolver</button>`
                : `<button onclick="window.marcarComoGarantia(${fila.id}, '${encodeURIComponent(correoVal)}', '${encodeURIComponent(claveVal)}', '${encodeURIComponent(provVal)}', '${encodeURIComponent(diaVal)}')" style="background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.3); color: #ff453a; padding: 5px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">🚨 Reportar</button>`;

              html += `
                <tr class="tr-mysql-row ${isCaida ? "tr-caida" : ""}" style="${styleExtra}">
                  <td style="${tdBase} color: #ff9f0a; font-weight: 800; text-transform: uppercase;"><span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;" title="${provVal}">${provVal}</span></td>
                  <td style="${tdBase} color: #a1a1aa; font-weight: 600;"><span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">${diaVal}</span></td>
                  <td style="${tdBase}">${celdaCorreo}</td>
                  <td style="${tdBase}">${celdaClave}</td>
                  <td style="${tdBase} text-align: center; color: #ffffff; font-weight: 700;">${perfilVal}</td>
                  <td style="${tdBase} text-align: center; color: #a1a1aa;">${pinVal}</td>
                  <td style="${tdBase} color: #a1a1aa;"><span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;" title="${clienteVal}">${clienteVal}</span></td>
                  <td style="${tdBase}">${celdaTelefonoContent}</td>
                  <td style="${tdBase} text-align: right; padding-right: 15px;">
                    <div style="display: flex; gap: 6px; justify-content: flex-end; align-items: center;">
                      ${botonesEdicionIzquierda}
                      ${botonCopiar}
                      ${botonPasarHoy}
                      ${botonTemp}
                      ${botonEstado}
                    </div>
                  </td>
                </tr>
              `;
            }
          });
        }
        tbody.innerHTML = html;
      } else {
        tbody.innerHTML = `<tr><td colspan="12" style="text-align: center; padding: 40px; color: var(--ios-red); font-weight: 600; background: #111216;">Error: ${data.message}</td></tr>`;
      }
    })
    .catch((err) => {
      tbody.innerHTML = `<tr><td colspan="12" style="text-align: center; padding: 40px; color: var(--ios-red); font-weight: 600; background: #111216;">❌ Error de conexión al consultar MySQL.</td></tr>`;
      console.error(err);
    });
};

// =========================================================================
// 📋 UTILIDADES DE COPIADO EN MYSQL
// =========================================================================
window.copiarAccesoMySQL = function (btn, textoEscapado) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(textoEscapado);

  navigator.clipboard.writeText(texto).then(() => {
    let oldText = btn.innerHTML;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copiado`;
    btn.style.setProperty("background", "var(--ios-green)", "important");
    btn.style.setProperty("color", "#ffffff", "important");
    btn.style.setProperty("border-color", "transparent", "important");

    if (typeof triggerToast === "function")
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Copiado al portapapeles</span></div>`,
      );

    setTimeout(() => {
      btn.innerHTML = oldText;
      btn.style.setProperty(
        "background",
        "rgba(255, 255, 255, 0.08)",
        "important",
      );
      btn.style.setProperty("color", "#ffffff", "important");
      btn.style.setProperty(
        "border-color",
        "rgba(255, 255, 255, 0.15)",
        "important",
      );
    }, 1500);
  });
};

window.copiarTextoUnico = function (btn, textoEscapado) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(textoEscapado);

  navigator.clipboard.writeText(texto).then(() => {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#30d158" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    if (typeof triggerToast === "function")
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Dato copiado al portapapeles</span></div>`,
      );

    setTimeout(() => {
      btn.innerHTML = originalHTML;
    }, 1500);
  });
};

// =========================================================================
// ⏳ CUENTA TEMPORAL
// =========================================================================
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

// =========================================================================
// ✏️ EDICIÓN, CREACIÓN Y ELIMINACIÓN
// =========================================================================
window.abrirModalEditarMySQL = function (filaEscapada) {
  try {
    if (typeof haptic === "function") haptic();
    const fila = JSON.parse(decodeURIComponent(filaEscapada));

    const iCorreo = document.getElementById("editMySQLCorreo");
    const iClave = document.getElementById("editMySQLClave");
    const iPerfil = document.getElementById("editMySQLPerfil");
    const iPin = document.getElementById("editMySQLPin");
    const iVenc = document.getElementById("editMySQLVencimiento");
    const iNombre = document.getElementById("editMySQLNombre");
    const iNumero = document.getElementById("editMySQLNumero");
    const iId = document.getElementById("editMySQLId");

    if (iId) iId.value = fila.id || "";

    let idCorreoAnterior = document.getElementById("editMySQLCorreoAnterior");
    if (!idCorreoAnterior) {
      idCorreoAnterior = document.createElement("input");
      idCorreoAnterior.type = "hidden";
      idCorreoAnterior.id = "editMySQLCorreoAnterior";
      const targetForm =
        document.getElementById("formEditarMySQL") ||
        document.getElementById("modalEditarMySQL");
      if (targetForm) targetForm.appendChild(idCorreoAnterior);
    }
    if (idCorreoAnterior)
      idCorreoAnterior.value = fila.correo || fila.usuario || "";

    if (iCorreo) iCorreo.value = fila.correo || fila.usuario || "";
    if (iClave) iClave.value = fila.clave || fila.contrasena || "";
    if (iPerfil) iPerfil.value = fila.perfil || "";
    if (iPin) iPin.value = fila.pin || "";
    if (iVenc) iVenc.value = fila.vencimiento || "";
    if (iNombre) iNombre.value = fila.nombre || fila.cliente || "";
    if (iNumero) iNumero.value = fila.numero || fila.telefono || "";

    // CAMPOS DE PAGO
    let contenedorCamposPago = document.getElementById(
      "editMySQLExtraPagoFields",
    );
    if (!contenedorCamposPago) {
      contenedorCamposPago = document.createElement("div");
      contenedorCamposPago.id = "editMySQLExtraPagoFields";
      contenedorCamposPago.style.cssText =
        "display: flex; flex-direction: column; gap: 10px; margin-top: 10px; margin-bottom: 12px; width: 100%;";
      contenedorCamposPago.innerHTML = `
        <div style="display: flex; gap: 10px; width: 100%;">
          <div style="flex: 1;">
            <label style="font-size: 0.72rem; color: #a1a1aa; font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 4px;">F. PAGO</label>
            <input type="text" id="editMySQLFechaPago" class="input-ios" style="width: 100%; box-sizing: border-box;" placeholder="Ej: 14-ago" />
          </div>
          <div style="flex: 1;">
            <label style="font-size: 0.72rem; color: #a1a1aa; font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 4px;">VALOR</label>
            <input type="text" id="editMySQLValor" class="input-ios" style="width: 100%; box-sizing: border-box;" placeholder="Ej: $15.000" />
          </div>
        </div>
        <div style="width: 100%;">
          <label style="font-size: 0.72rem; color: #a1a1aa; font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 4px;">MÉTODO / BANCO</label>
          <input type="text" id="editMySQLPago" class="input-ios" style="width: 100%; box-sizing: border-box;" placeholder="Ej: Bre-B, Nequi, Saldo Distri" />
        </div>
      `;
    }

    const formTarget =
      document.getElementById("formEditarMySQL") ||
      document.getElementById("modalEditarMySQL");
    if (formTarget) {
      const btnSubmit =
        document.getElementById("btnGuardarEditarMySQL") ||
        formTarget.querySelector("button[type='submit']");
      let filaBotones = btnSubmit ? btnSubmit.parentElement : null;

      if (
        filaBotones &&
        filaBotones !== formTarget &&
        filaBotones.contains(btnSubmit)
      ) {
        formTarget.insertBefore(contenedorCamposPago, filaBotones);
      } else if (btnSubmit) {
        formTarget.insertBefore(contenedorCamposPago, btnSubmit);
      } else {
        formTarget.appendChild(contenedorCamposPago);
      }
    }

    const elFechaPago = document.getElementById("editMySQLFechaPago");
    const elValor = document.getElementById("editMySQLValor");
    const elPago = document.getElementById("editMySQLPago");

    if (elFechaPago) elFechaPago.value = fila.fecha || "";
    if (elValor) elValor.value = fila.valor || "";
    if (elPago) elPago.value = fila.pago || "";

    const tablaActual = (window.tablaMySQLActual || "").toLowerCase();
    if (tablaActual === "netflix" || tablaActual === "registro_ventas") {
      contenedorCamposPago.style.display = "flex";
    } else {
      contenedorCamposPago.style.display = "none";
    }

    const modal = document.getElementById("modalEditarMySQL");
    if (modal) {
      modal.style.display = "flex";
      modal.classList.add("open");
    }
  } catch (err) {
    console.error("Error al abrir modal de edición:", err);
    alert("❌ Error al abrir modal: " + err.message);
  }
};

window.cerrarModalEditarMySQL = function () {
  if (typeof haptic === "function") haptic();
  const modal = document.getElementById("modalEditarMySQL");
  if (modal) modal.style.display = "none";
};

window.guardarEdicionMySQL = function (e) {
  if (e) e.preventDefault();
  if (typeof haptic === "function") haptic();

  const btn =
    document.getElementById("btnGuardarEditarMySQL") ||
    document.querySelector("#modalEditarMySQL button[type='submit']");
  if (btn) btn.disabled = true;

  const correoAnteriorInput = document.getElementById(
    "editMySQLCorreoAnterior",
  );
  const iFechaPago = document.getElementById("editMySQLFechaPago");
  const iValor = document.getElementById("editMySQLValor");
  const iPago = document.getElementById("editMySQLPago");

  const formData = new FormData();
  formData.append("accion", "editar");
  formData.append("tabla", window.tablaMySQLActual);
  formData.append("id", document.getElementById("editMySQLId").value);
  formData.append(
    "correo_anterior",
    correoAnteriorInput ? correoAnteriorInput.value : "",
  );
  formData.append(
    "correo",
    document.getElementById("editMySQLCorreo").value.trim(),
  );
  formData.append(
    "clave",
    document.getElementById("editMySQLClave").value.trim(),
  );
  formData.append(
    "perfil",
    document.getElementById("editMySQLPerfil").value.trim(),
  );
  formData.append("pin", document.getElementById("editMySQLPin").value.trim());
  formData.append(
    "vencimiento",
    document.getElementById("editMySQLVencimiento").value.trim(),
  );
  formData.append(
    "nombre",
    document.getElementById("editMySQLNombre").value.trim(),
  );
  formData.append(
    "numero",
    document.getElementById("editMySQLNumero").value.trim(),
  );
  formData.append("fecha", iFechaPago ? iFechaPago.value.trim() : "");
  formData.append("valor", iValor ? iValor.value.trim() : "");
  formData.append("pago", iPago ? iPago.value.trim() : "");

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (btn) btn.disabled = false;
      if (data.status === "success") {
        window.cerrarModalEditarMySQL();
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
      if (btn) btn.disabled = false;
      console.error(err);
      alert("❌ Error al guardar edición.");
    });
};

window.abrirModalAgregarMySQL = function () {
  if (typeof haptic === "function") haptic();
  const form = document.getElementById("formAgregarMySQL");
  if (form) form.reset();

  const selectPlat = document.getElementById("addMySQLPlataforma");
  if (selectPlat) selectPlat.value = window.tablaMySQLActual;

  const modal = document.getElementById("modalAgregarMySQL");
  if (modal) {
    modal.style.display = "flex";
    const area = document.getElementById("addMySQLBloque");
    if (area) area.focus();
  }
};

window.cerrarModalAgregarMySQL = function () {
  if (typeof haptic === "function") haptic();
  const modal = document.getElementById("modalAgregarMySQL");
  if (modal) modal.style.display = "none";
};

window.guardarNuevoRegistroMySQL = function (e) {
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
        window.cerrarModalAgregarMySQL();
        if (
          plataforma.toLowerCase() === window.tablaMySQLActual.toLowerCase()
        ) {
          window.cargarDatosMySQL();
        } else {
          window.tablaMySQLActual = plataforma;
          document
            .querySelectorAll(".mysql-tab-btn")
            .forEach((b) => b.classList.remove("active"));
          window.cargarDatosMySQL();
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
};

window.eliminarRegistroMySQL = function (id, correoEscapado = "") {
  if (
    !confirm(
      "⚠️ ¿Estás seguro de borrar esta cuenta?\n\nSe eliminarán TODOS los perfiles asociados a este mismo correo en la tabla.",
    )
  )
    return;
  if (typeof haptic === "function") haptic();

  const correo = correoEscapado ? decodeURIComponent(correoEscapado) : "";
  const formData = new FormData();
  formData.append("accion", "eliminar");
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
        if (typeof triggerToast === "function")
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>${data.message}</span></div>`,
          );
      } else {
        alert("❌ Error: " + data.message);
      }
    })
    .catch((err) => {
      console.error(err);
      alert("❌ Error de comunicación al intentar eliminar.");
    });
};

window.eliminarFechaMySQL = function (diaEscapado) {
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
        window.cargarDatosMySQL();
      } else {
        alert("❌ " + data.message);
      }
    })
    .catch((err) => alert("❌ Error al procesar la eliminación por fecha."));
};

// =========================================================================
// 🚨 GESTIÓN DE GARANTÍAS
// =========================================================================
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

window.abrirModalResolverGarantia = function (
  id,
  correoViejoEscapado,
  plataforma,
) {
  if (typeof haptic === "function") haptic();
  const correoViejo = decodeURIComponent(correoViejoEscapado);

  document.getElementById("resolverMySQLId").value = id;
  document.getElementById("resolverMySQLCorreoViejo").value = correoViejo;
  document.getElementById("resolverMySQLPlataforma").value = plataforma;
  document.getElementById("resolverMySQLCorreoNuevo").value = correoViejo;
  document.getElementById("resolverMySQLClaveNueva").value = "";

  const modal = document.getElementById("modalResolverMySQL");
  if (modal) modal.style.display = "flex";
};

window.cerrarModalResolverMySQL = function () {
  if (typeof haptic === "function") haptic();
  const modal = document.getElementById("modalResolverMySQL");
  if (modal) modal.style.display = "none";
};

window.guardarResolucionMySQL = function (e) {
  e.preventDefault();
  if (typeof haptic === "function") haptic();

  const btn = document.getElementById("btnGuardarResolverMySQL");
  btn.disabled = true;
  btn.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Resolviendo...`;

  const idFila = document.getElementById("resolverMySQLId").value;
  const platOriginal = document.getElementById("resolverMySQLPlataforma").value;
  const correoViejo = document.getElementById("resolverMySQLCorreoViejo").value;
  const correoNuevo = document
    .getElementById("resolverMySQLCorreoNuevo")
    .value.trim();
  const claveNueva = document
    .getElementById("resolverMySQLClaveNueva")
    .value.trim();

  const formData = new FormData();
  formData.append("accion", "resolver_garantia");
  formData.append("id", idFila);
  formData.append("tabla", platOriginal);
  formData.append("correo_viejo", correoViejo);
  formData.append("correo_nuevo", correoNuevo);
  formData.append("clave_nueva", claveNueva);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then(async (res) => {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (errParse) {
        throw new Error("Respuesta inválida del servidor PHP: \n\n" + text);
      }
    })
    .then((data) => {
      btn.disabled = false;
      btn.innerHTML = "Guardar y Resolver";

      if (data.status === "success") {
        window.cerrarModalResolverMySQL();
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
      btn.disabled = false;
      btn.innerHTML = "Guardar y Resolver";
      console.error(err);
      alert("❌ " + err.message);
    });
};

// =========================================================================
// 📅 MOVER REGISTRO/CUENTA AL DÍA DE HOY (SUPERADMIN)
// =========================================================================
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
