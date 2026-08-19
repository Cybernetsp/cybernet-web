/* ==========================================================================
   🛠️ REPARACIÓN DE SCROLL AUTOMÁTICO Y ALTURA MÁXIMA EN VISOR MYSQL
   ========================================================================== */
(function repararScrollVisorMySQL() {
  if (document.getElementById("css-fix-scroll-mysql")) return;
  const style = document.createElement("style");
  style.id = "css-fix-scroll-mysql";
  style.innerHTML = `
    /* Contenedor principal de la tabla */
    #contenedorTablaMySQL, 
    .tabla-container, 
    .visor-mysql-body {
      max-height: calc(100vh - 180px) !important;
      overflow-y: auto !important;
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch !important;
      border-radius: 12px !important;
    }

    /* Personalización de la barra de desplazamiento macOS / iOS */
    #contenedorTablaMySQL::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    #contenedorTablaMySQL::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
    }
    #contenedorTablaMySQL::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.18);
      border-radius: 10px;
    }
    #contenedorTablaMySQL::-webkit-scrollbar-thumb:hover {
      background: rgba(10, 132, 255, 0.5);
    }
  `;
  document.head.appendChild(style);
})();

window.tablaMySQLActual = "netflix";
window.lastSelectedTab = "netflix";
let searchTimeoutMySQL = null;

// Lista de todas las tablas de MySQL para la búsqueda global inteligente
const LISTA_TABLAS_GLOBALES = [
  "netflix",
  "amazon_prime_video",
  "disney_premium",
  "disney_estandar",
  "hbo_max",
  "crunchyroll",
  "vix",
  "plex",
  "paramount",
  "apple_tv",
  "youtube",
  "spotify",
  "directv_go",
  "iptv",
  "flujo_tv",
  "emby",
  "metegol",
  "canva",
  "capcut",
  "deezer",
  "mubi",
];

// 🎨 CONSTRUCTOR OFICIAL DE FICHAS Y MENSAJES DE ACCESO
function construirMensajeFicha(
  platNombre,
  correo,
  clave,
  perfil,
  pin,
  vencimiento,
  cliente,
) {
  let platNorm = (platNombre || "").toUpperCase().replace(/_/g, "-");
  let esNet = platNorm === "NETFLIX";

  let tieneNombreReal =
    cliente &&
    cliente !== "-" &&
    cliente.trim() !== "" &&
    cliente.trim().toLowerCase() !== "sin nombre";

  let saludoNombre = tieneNombreReal ? " " + cliente.trim() : "";

  let msg = `🌟 *¡Hola${saludoNombre}!*\n\nTu pedido ha sido procesado con éxito. Aquí tienes tus accesos:\n\n🎬 *DETALLES DE ${platNorm}* ✅\n────────────────────\n`;

  if (esNet) {
    msg += `⚠️ *Para iniciar sesión:* Cuando te pida un código, selecciona *Obtener ayuda* y después *Usar contraseña*.\n\n`;
  }

  let etiquetaUser =
    platNorm === "IPTV" || platNorm === "EMBY" ? "Usuario" : "Correo";
  let etiquetaPerfil =
    platNorm === "IPTV" ? "URL" : platNorm === "EMBY" ? "Servidor" : "Perfil";

  msg += `👤 *${etiquetaUser}:* ${correo || "-"}\n🔐 *Contraseña:* ${clave || "-"}\n`;

  if (perfil && perfil !== "-" && perfil !== "") {
    msg += `🌐 *${etiquetaPerfil}:* ${perfil}\n`;
  }
  if (platNorm === "EMBY") {
    msg += `🔌 *Puerto:* Dejar vacío\n`;
  }
  if (pin && pin !== "-" && pin !== "" && pin !== "N/A") {
    msg += `📍 *PIN:* ${pin}\n`;
  }
  if (vencimiento && vencimiento !== "-" && vencimiento !== "") {
    msg += `📅 *Vence:* ${vencimiento}\n`;
  }

  if (esNet) {
    msg += `\n🤖 *¿NECESITAS UN CÓDIGO?* Puedes usar nuestra pagina para codigos disponible 24/7: www.cybernetsp.com/\n`;
  }

  msg += `\n📢 *INFORMACIÓN IMPORTANTE:* \n────────────────────\n⚠️ *Garantía activa:* Tu servicio cuenta con respaldo total durante su vigencia. \n🆘 *Soporte:* Si presentas algún inconveniente, *infórmanos de inmediato* para brindarte una solución rápida.\n\n💎 *Disfruta tu servicio.*\n✨ *¡Gracias por elegirnos!* ✨`;

  return msg;
}

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
  cargarDatosMySQL();
});

function cambiarTablaMySQL(nombreTabla, btnElement) {
  if (typeof haptic === "function") haptic();
  window.tablaMySQLActual = nombreTabla;
  window.lastSelectedTab = nombreTabla;

  const busquedaInput = document.getElementById("inputSearchMySQL");
  if (busquedaInput) busquedaInput.value = "";
  actualizarBotonBorrarBusquedaMySQL();

  document
    .querySelectorAll(".mysql-tab-btn")
    .forEach((b) => b.classList.remove("active"));
  if (btnElement) {
    btnElement.classList.add("active");
  }

  cargarDatosMySQL();
}

function actualizarBotonBorrarBusquedaMySQL() {
  const input = document.getElementById("inputSearchMySQL");
  if (!input) return;

  let btnClear = document.getElementById("btnBorrarSearchMySQL");
  let measurer = document.getElementById("measurerSearchMySQL");

  if (!measurer) {
    measurer = document.createElement("span");
    measurer.id = "measurerSearchMySQL";
    measurer.style.cssText = `
      position: absolute;
      visibility: hidden;
      height: 0;
      white-space: pre;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      letter-spacing: inherit;
    `;
    document.body.appendChild(measurer);
  }

  if (!btnClear && input.parentElement) {
    const container = input.parentElement;
    container.style.position = "relative";

    btnClear = document.createElement("button");
    btnClear.id = "btnBorrarSearchMySQL";
    btnClear.type = "button";
    btnClear.title = "Borrar texto";
    btnClear.innerHTML = "✕ Borrar";
    btnClear.style.cssText = `
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 69, 58, 0.2);
      border: 1px solid rgba(255, 69, 58, 0.4);
      color: #ff453a;
      padding: 3px 10px;
      border-radius: 8px;
      cursor: pointer;
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 0.72rem;
      font-weight: 800;
      transition: background 0.2s ease, border-color 0.2s ease;
      z-index: 10;
      white-space: nowrap;
    `;
    btnClear.onclick = window.borrarBusquedaMySQL;
    container.appendChild(btnClear);
  }

  const val = input.value;
  if (val.length > 0 && btnClear) {
    const style = window.getComputedStyle(input);
    measurer.style.fontFamily = style.fontFamily;
    measurer.style.fontSize = style.fontSize;
    measurer.style.fontWeight = style.fontWeight;
    measurer.style.letterSpacing = style.letterSpacing;
    measurer.textContent = val;

    const paddingLeft = parseFloat(style.paddingLeft) || 35;
    const textWidth = measurer.offsetWidth;
    const maxLeft = input.offsetWidth - 85;
    const calculatedLeft = Math.min(paddingLeft + textWidth + 12, maxLeft);

    btnClear.style.left = `${calculatedLeft}px`;
    btnClear.style.display = "inline-flex";
  } else if (btnClear) {
    btnClear.style.display = "none";
  }
}

window.borrarBusquedaMySQL = function () {
  if (typeof haptic === "function") haptic();
  const input = document.getElementById("inputSearchMySQL");
  if (input) input.value = "";

  actualizarBotonBorrarBusquedaMySQL();

  window.tablaMySQLActual = window.lastSelectedTab || "netflix";
  document.querySelectorAll(".mysql-tab-btn").forEach((b) => {
    const onclickAttr = b.getAttribute("onclick") || "";
    if (onclickAttr.includes(`'${window.tablaMySQLActual}'`)) {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });

  cargarDatosMySQL();
};

function filtrarMySQL() {
  actualizarBotonBorrarBusquedaMySQL();
  clearTimeout(searchTimeoutMySQL);
  searchTimeoutMySQL = setTimeout(() => {
    const busquedaInput = document.getElementById("inputSearchMySQL");
    const busqueda = busquedaInput ? busquedaInput.value.trim() : "";

    if (busqueda !== "") {
      document
        .querySelectorAll(".mysql-tab-btn")
        .forEach((b) => b.classList.remove("active"));
      window.tablaMySQLActual = "todas";
    } else {
      window.tablaMySQLActual = window.lastSelectedTab || "netflix";
      document.querySelectorAll(".mysql-tab-btn").forEach((b) => {
        const onclickAttr = b.getAttribute("onclick") || "";
        if (onclickAttr.includes(`'${window.tablaMySQLActual}'`)) {
          b.classList.add("active");
        } else {
          b.classList.remove("active");
        }
      });
    }

    cargarDatosMySQL();
  }, 300);
}

// 🗓️ FORMATEADOR DE FECHA CORTA
function formatearFechaCorta(fStr) {
  if (!fStr || fStr === "-") return "-";

  const mesesAbrev = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];

  if (fStr instanceof Date) {
    return `${fStr.getDate()}-${mesesAbrev[fStr.getMonth()]}`;
  }

  let str = String(fStr).trim();
  if (str.toLowerCase() === "hoy") {
    const hoyObj = new Date();
    return `${hoyObj.getDate()}-${mesesAbrev[hoyObj.getMonth()]}`;
  }

  if (/^\d{1,2}-[a-z]{3}$/i.test(str)) return str;

  let fechaPart = str.split(" ")[0];
  let partes = fechaPart.includes("/")
    ? fechaPart.split("/")
    : fechaPart.split("-");

  let dia, mesNum;
  if (partes.length === 3) {
    if (partes[0].length === 4) {
      dia = parseInt(partes[2], 10);
      mesNum = parseInt(partes[1], 10) - 1;
    } else {
      dia = parseInt(partes[0], 10);
      mesNum = parseInt(partes[1], 10) - 1;
    }
    if (!isNaN(dia) && !isNaN(mesNum) && mesesAbrev[mesNum]) {
      return `${dia}-${mesesAbrev[mesNum]}`;
    }
  }
  return fechaPart;
}

function formatearMontoMoneda(vStr) {
  if (!vStr || vStr === "-") return "-";
  let str = String(vStr).trim();
  if (str.startsWith("$")) return str;
  let num = parseFloat(str.replace(/\D/g, ""));
  if (isNaN(num) || num === 0) return str;
  return "$" + num.toLocaleString("es-CO");
}

function cargarDatosMySQL() {
  actualizarBotonBorrarBusquedaMySQL();

  const thead = document.getElementById("tablaMySQLCabecera");
  const tbody = document.getElementById("tablaMySQLCuerpo");
  if (!tbody || !thead) return;

  const tableNode = thead.closest("table");
  if (tableNode && tableNode.parentElement) {
    tableNode.parentElement.style.overflowX = "auto";
  }

  if (!document.getElementById("css-sticky-hover-mysql")) {
    const styleSticky = document.createElement("style");
    styleSticky.id = "css-sticky-hover-mysql";
    styleSticky.innerHTML = `
      .mysql-table-wrapper {
        max-height: calc(90vh - 120px) !important;
        overflow-y: auto !important;
        overflow-x: auto !important;
      }
      #tablaMySQLCabecera th { 
        position: sticky !important; 
        top: 0 !important; 
        z-index: 100 !important; 
        background-color: #111216 !important; 
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.9) !important; 
        white-space: nowrap !important; 
      }
      .tr-mysql-row { background-color: #111216 !important; transition: background 0.2s ease !important; }
      .tr-mysql-row:hover { background-color: rgba(255, 255, 255, 0.04) !important; }
      .tr-mysql-row.tr-caida { background-color: rgba(255, 69, 58, 0.18) !important; }
      .tr-mysql-row.tr-caida:hover { background-color: rgba(255, 69, 58, 0.28) !important; }
      table { border-collapse: separate !important; border-spacing: 0 !important; table-layout: fixed !important; width: 100% !important; min-width: 1100px !important; background-color: #111216 !important; }
      th, td { white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
    `;
    document.head.appendChild(styleSticky);
  }

  const busquedaInput = document.getElementById("inputSearchMySQL");
  const busqueda = busquedaInput ? busquedaInput.value.trim() : "";
  const esBusquedaGlobal =
    window.tablaMySQLActual === "todas" || busqueda !== "";

  const thBase =
    "padding: 12px 8px; font-weight: 800; text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;";

  if (esBusquedaGlobal) {
    thead.innerHTML = `
      <tr>
        <th style="${thBase} width: 10%; color: #0a84ff;">PLATAFORMA</th>
        <th style="${thBase} width: 6%;">FECHA</th>
        <th style="${thBase} width: 18%;">CORREO / USUARIO</th>
        <th style="${thBase} width: 10%;">CONTRASEÑA</th>
        <th style="${thBase} width: 4%; text-align: center;">PERFIL</th>
        <th style="${thBase} width: 4%; text-align: center;">PIN</th>
        <th style="${thBase} width: 10%;">VENCIMIENTO</th>
        <th style="${thBase} width: 11%;">CLIENTE</th>
        <th style="${thBase} width: 10%;">TELÉFONO</th>
        <th style="${thBase} width: 17%; text-align: right; padding-right: 15px;">ACCIÓN</th>
      </tr>
    `;
  } else {
    const tablaLower = window.tablaMySQLActual.toLowerCase();
    const esNetflix = tablaLower === "netflix";
    const esGarantias = tablaLower === "garantias";
    const esVentas = tablaLower === "registro_ventas";

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
  }

  const totalColumnas = thead.querySelectorAll("th").length;

  tbody.innerHTML = `
    <tr>
      <td colspan="${totalColumnas}" style="text-align: center; padding: 40px; color: var(--text-secondary);">
        <svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:8px; vertical-align:middle;">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        </svg>
        ${esBusquedaGlobal ? "🔍 Buscando en todas las plataformas..." : "Consultando datos..."}
      </td>
    </tr>
  `;

  if (esBusquedaGlobal) {
    const queryLower = busqueda.toLowerCase().trim();
    const queryDigits = busqueda.replace(/\D/g, "");

    let busquedaAPI = busqueda;
    if (queryDigits.length >= 3 && /^[\d\s\+\-\(\)]+$/.test(busqueda)) {
      busquedaAPI =
        queryDigits.length === 12 && queryDigits.startsWith("57")
          ? queryDigits.substring(2)
          : queryDigits;
    }

    const promesas = LISTA_TABLAS_GLOBALES.map((tb) =>
      fetch(
        `https://api.cybernetsp.com/obtener_tabla_mysql.php?tabla=${tb}&busqueda=${encodeURIComponent(busquedaAPI)}`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.status === "success" && data.data) {
            return data.data.map((row) => ({ ...row, _tablaOrigen: tb }));
          }
          return [];
        })
        .catch(() => []),
    );

    Promise.all(promesas).then((resultadosArrays) => {
      let todosResultados = [].concat(...resultadosArrays);

      let filtradosFinales = todosResultados.filter((fila) => {
        let numValRaw = String(fila.numero || fila.telefono || "").trim();
        let numValDigits = numValRaw.replace(/\D/g, "");

        if (queryDigits.length >= 3) {
          let searchDigits = queryDigits;
          if (searchDigits.length === 12 && searchDigits.startsWith("57")) {
            searchDigits = searchDigits.substring(2);
          }
          if (
            numValDigits.includes(searchDigits) ||
            searchDigits.includes(numValDigits)
          ) {
            return true;
          }
        }

        let correoVal = String(fila.correo || fila.usuario || "").toLowerCase();
        let clienteVal = String(
          fila.nombre || fila.cliente || "",
        ).toLowerCase();
        let claveVal = String(
          fila.clave || fila.contrasena || "",
        ).toLowerCase();
        let perfilVal = String(fila.perfil || "").toLowerCase();
        let pinVal = String(fila.pin || "").toLowerCase();

        return (
          correoVal.includes(queryLower) ||
          clienteVal.includes(queryLower) ||
          claveVal.includes(queryLower) ||
          perfilVal.includes(queryLower) ||
          pinVal.includes(queryLower) ||
          numValRaw.toLowerCase().includes(queryLower)
        );
      });

      if (filtradosFinales.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${totalColumnas}" style="text-align: center; padding: 40px; color: var(--ios-red); font-weight: 600;">No se encontraron cuentas asociadas a "${busqueda}" en ninguna plataforma.</td></tr>`;
        return;
      }

      let html = "";
      filtradosFinales.forEach((fila, idx) => {
        let tablaOrigen = fila._tablaOrigen || "netflix";
        let platNombreUI = tablaOrigen.toUpperCase().replace(/_/g, " ");

        let diaVal = fila.dia || fila.fecha || "-";
        let provVal = fila.proveedor || "-";
        let correoVal = fila.correo || fila.usuario || "-";
        let claveVal = fila.clave || fila.contrasena || "-";
        let perfilVal = fila.perfil || "-";
        let pinVal = fila.pin || "-";
        let vencVal = fila.vencimiento || "-";
        let clienteVal = fila.nombre || fila.cliente || "-";
        let numeroVal = fila.numero || fila.telefono || "-";

        let isCaida = fila.estado === "caida" || fila.es_caida == 1;
        const colorFondoFila = isCaida
          ? "rgba(255, 69, 58, 0.15)"
          : idx % 2 === 0
            ? "rgba(255, 255, 255, 0.015)"
            : "transparent";

        let celdaCorreo =
          correoVal !== "-"
            ? `<span onclick="copiarTextoUnico(this, '${encodeURIComponent(correoVal)}')" style="color: #0a84ff; font-family: monospace; font-weight: 600; cursor: pointer;" title="${correoVal}">${correoVal}</span>`
            : "-";
        let celdaClave =
          claveVal !== "-"
            ? `<span onclick="copiarTextoUnico(this, '${encodeURIComponent(claveVal)}')" style="color: #30d158; font-family: monospace; font-weight: 600; cursor: pointer;" title="${claveVal}">${claveVal}</span>`
            : "-";
        let celdaPin =
          pinVal !== "-"
            ? `<span onclick="copiarTextoUnico(this, '${encodeURIComponent(pinVal)}')" style="color: #ffd60a; font-weight: 700; font-family: monospace; cursor: pointer;">${pinVal}</span>`
            : "-";
        let celdaTel =
          numeroVal !== "-" && numeroVal.trim() !== ""
            ? `<span onclick="copiarTextoUnico(this, '${encodeURIComponent(numeroVal)}')" style="font-family: monospace; color: #ffffff; font-weight: 600; cursor: pointer;">${numeroVal}</span>`
            : "-";

        let textoCopiarFicha = construirMensajeFicha(
          tablaOrigen,
          correoVal,
          claveVal,
          perfilVal,
          pinVal,
          vencVal,
          clienteVal,
        );
        let textoEscapadoFicha = encodeURIComponent(textoCopiarFicha);
        let filaJsonEscapada = encodeURIComponent(JSON.stringify(fila));

        let botonesAccion = `
          <div style="display: flex; gap: 5px; align-items: center; justify-content: flex-end; white-space: nowrap;">
            <button onclick="window.tablaMySQLActual='${tablaOrigen}'; abrirModalEditarMySQL('${filaJsonEscapada}')" title="Editar Datos" style="background: rgba(10, 132, 255, 0.1); border: 1px solid rgba(10, 132, 255, 0.2); border-radius: 6px; padding: 5px; color: #0a84ff; cursor: pointer;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
            <button onclick="copiarAccesoMySQL(this, '${textoEscapadoFicha}')" title="Copiar Ficha Completa" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; padding: 5px; border-radius: 6px; cursor: pointer;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
            <button onclick="window.tablaMySQLActual='${tablaOrigen}'; window.generarTemp(this, ${fila.id})" style="background: rgba(255, 159, 10, 0.15); border: 1px solid rgba(255, 159, 10, 0.3); color: #ff9f0a; padding: 5px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 800; cursor: pointer;">⏳ Temp</button>
            <button onclick="window.tablaMySQLActual='${tablaOrigen}'; window.marcarComoGarantia(${fila.id}, '${encodeURIComponent(correoVal)}', '${encodeURIComponent(claveVal)}', '${encodeURIComponent(provVal)}', '${encodeURIComponent(diaVal)}', ${isCaida})" style="background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.3); color: #ff453a; padding: 5px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 800; cursor: pointer;">🚨 Reportar</button>
          </div>
        `;

        const tdBase =
          "padding: 10px 8px; font-size: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.03); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;";

        html += `
          <tr style="background: ${colorFondoFila}; transition: background 0.2s ease;">
            <td style="${tdBase}">
              <span style="background: rgba(10, 132, 255, 0.15); border: 1px solid rgba(10, 132, 255, 0.3); color: #0a84ff; padding: 3px 8px; border-radius: 6px; font-weight: 800; font-size: 0.68rem; text-transform: uppercase;">${platNombreUI}</span>
            </td>
            <td style="${tdBase} color: #a1a1aa;">${formatearFechaCorta(diaVal)}</td>
            <td style="${tdBase}">${celdaCorreo}</td>
            <td style="${tdBase}">${celdaClave}</td>
            <td style="${tdBase} text-align: center; color: #ffffff; font-weight: 600;">${perfilVal}</td>
            <td style="${tdBase} text-align: center;">${celdaPin}</td>
            <td style="${tdBase} font-weight: 800; color: #ff9f0a;">${vencVal}</td>
            <td style="${tdBase} color: #e4e4e7;" title="${clienteVal}">${clienteVal}</td>
            <td style="${tdBase}">${celdaTel}</td>
            <td style="${tdBase} text-align: right; padding-right: 15px;">${botonesAccion}</td>
          </tr>
        `;
      });

      tbody.innerHTML = html;
    });

    return;
  }

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
          const tablaLower = window.tablaMySQLActual.toLowerCase();
          const esNetflix = tablaLower === "netflix";
          const esGarantias = tablaLower === "garantias";
          const esVentas = tablaLower === "registro_ventas";

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

            let valorValRaw =
              fila.pago_total ||
              fila.valor ||
              fila.monto_cobrado ||
              fila.monto ||
              "-";
            let valorVal = formatearMontoMoneda(valorValRaw);
            let pagoVal = fila.pago || fila.metodo || fila.banco || "-";

            let isCaida = fila.estado === "caida" || fila.es_caida == 1;
            const colorFondoFila = isCaida
              ? "rgba(255, 69, 58, 0.15)"
              : idx % 2 === 0
                ? "rgba(255, 255, 255, 0.015)"
                : "transparent";

            if (
              !esVentas &&
              !esGarantias &&
              diaVal !== fechaGrupoActual &&
              diaVal !== "-"
            ) {
              fechaGrupoActual = diaVal;
              let btnAnadirNet = esNetflix
                ? `<button onclick="window.abrirModalAnadirUnPerfilNet('${encodeURIComponent(diaVal)}')" title="Añadir Registro" style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; padding: 4px 8px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>`
                : "";
              let btnBorrarFecha = esSuperAdmin
                ? `<button onclick="eliminarFechaMySQL('${encodeURIComponent(diaVal)}')" style="background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.3); color: #ff453a; padding: 4px 12px; border-radius: 8px; font-size: 0.7rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Borrar Fecha</button>`
                : "";

              html += `
                <tr style="background: rgba(10, 132, 255, 0.05);">
                  <td colspan="${totalColumnas}" style="padding: 8px 16px; border-top: 1px solid rgba(10, 132, 255, 0.2); border-bottom: 1px solid rgba(10, 132, 255, 0.2); color: #0a84ff; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                      <span>📅 CUENTAS DEL: ${diaVal.toUpperCase()}</span>
                      <div style="display: flex; align-items: center;">${btnAnadirNet}${btnBorrarFecha}</div>
                    </div>
                  </td>
                </tr>
              `;
            }

            let textoCopiarFicha = construirMensajeFicha(
              window.tablaMySQLActual,
              correoVal,
              claveVal,
              perfilVal,
              pinVal,
              vencVal,
              clienteVal,
            );
            let textoEscapadoFicha = encodeURIComponent(textoCopiarFicha);
            let filaJsonEscapada = encodeURIComponent(JSON.stringify(fila));

            let celdaCorreo =
              correoVal !== "-"
                ? `<span onclick="copiarTextoUnico(this, '${encodeURIComponent(correoVal)}')" style="color: #0a84ff; font-family: monospace; font-weight: 600; cursor: pointer;" title="${correoVal}">${correoVal}</span>`
                : "-";
            let celdaClave =
              claveVal !== "-"
                ? `<span onclick="copiarTextoUnico(this, '${encodeURIComponent(claveVal)}')" style="color: #30d158; font-family: monospace; font-weight: 600; cursor: pointer;" title="${claveVal}">${claveVal}</span>`
                : "-";
            let celdaPin =
              pinVal !== "-"
                ? `<span onclick="copiarTextoUnico(this, '${encodeURIComponent(pinVal)}')" style="color: #ffd60a; font-weight: 700; font-family: monospace; cursor: pointer;">${pinVal}</span>`
                : "-";
            let celdaTelefono =
              numeroVal !== "-" && numeroVal.trim() !== ""
                ? `<span onclick="copiarTextoUnico(this, '${encodeURIComponent(numeroVal)}')" style="font-family: monospace; color: #ffffff; font-weight: 600; cursor: pointer;">${numeroVal}</span>`
                : `<button onclick="abrirModalEditarMySQL('${filaJsonEscapada}')" title="Agregar Teléfono" style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: var(--ios-green); padding: 4px 10px; border-radius: 8px; cursor: pointer; font-weight: 800; font-size: 0.8rem;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>`;

            const tdBase =
              "padding: 10px 8px; font-size: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.03); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;";

            if (esNetflix) {
              let botonesAccionNetflix = `
                <div style="display: flex; gap: 5px; align-items: center; justify-content: flex-end;">
                  <button onclick="abrirModalEditarMySQL('${filaJsonEscapada}')" title="Editar Datos" style="background: rgba(10, 132, 255, 0.1); border: 1px solid rgba(10, 132, 255, 0.2); border-radius: 6px; padding: 5px; color: #0a84ff; cursor: pointer;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                  ${esSuperAdmin ? `<button onclick="eliminarRegistroMySQL(${fila.id}, '${encodeURIComponent(correoVal)}')" title="Eliminar Registro" style="background: rgba(255, 69, 58, 0.1); border: 1px solid rgba(255, 69, 58, 0.2); border-radius: 6px; padding: 5px; color: #ff453a; cursor: pointer;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>` : ""}
                  <button onclick="copiarAccesoMySQL(this, '${textoEscapadoFicha}')" title="Copiar Ficha Completa" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; padding: 5px; border-radius: 6px; cursor: pointer;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                  ${esSuperAdmin ? `<button onclick="window.pasarRegistroAHoyMySQL(${fila.id}, '${encodeURIComponent(correoVal)}')" title="Pasar registro a hoy" style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; padding: 5px; border-radius: 6px; cursor: pointer;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></button>` : ""}
                </div>
              `;

              html += `
                <tr style="background: ${colorFondoFila};">
                  <td style="${tdBase} color: #a1a1aa;">${formatearFechaCorta(diaVal)}</td>
                  <td style="${tdBase}">${celdaCorreo}</td>
                  <td style="${tdBase}">${celdaClave}</td>
                  <td style="${tdBase} text-align: center; color: #ffffff; font-weight: 600;">${perfilVal}</td>
                  <td style="${tdBase} text-align: center;">${celdaPin}</td>
                  <td style="${tdBase} font-weight: 800; color: #ff9f0a;">${vencVal}</td>
                  <td style="${tdBase} color: #e4e4e7;" title="${clienteVal}">${clienteVal}</td>
                  <td style="${tdBase}">${celdaTelefono}</td>
                  <td style="${tdBase} color: #a1a1aa;">${formatearFechaCorta(fechaPagoVal)}</td>
                  <td style="${tdBase} color: #30d158; font-weight: bold;">${valorVal}</td>
                  <td style="${tdBase}"><span style="background: rgba(255,255,255,0.08); padding: 4px 8px; border-radius: 6px; font-size: 0.72rem; color: #bf5af2; font-weight: 700;">${pagoVal}</span></td>
                  <td style="${tdBase} text-align: center;">${botonesAccionNetflix}</td>
                </tr>
              `;
            } else if (esVentas) {
              let platVta = fila.plataformas || fila.descripcion || "-";
              let tipoVta = fila.tipo || "Venta";

              html += `
                <tr style="background: ${colorFondoFila};">
                  <td style="${tdBase} color: #a1a1aa;">${formatearFechaCorta(diaVal)}</td>
                  <td style="${tdBase}"><div style="display:flex; flex-direction:column;"><span style="color:#fff; font-weight:700;">${clienteVal}</span><span style="color:#a1a1aa; font-size:0.75rem;">${numeroVal}</span></div></td>
                  <td style="${tdBase} color: #ffffff; font-weight: 600;" title="${platVta}">${platVta}</td>
                  <td style="${tdBase} color: #30d158; font-weight: bold;">${valorVal}</td>
                  <td style="${tdBase} color: #bf5af2; font-weight: 700;">${pagoVal}</td>
                  <td style="${tdBase} text-align: center; color: #a1a1aa;">${tipoVta}</td>
                  <td style="${tdBase} text-align: right; padding-right: 15px;">
                    <button onclick="abrirModalEditarMySQL('${filaJsonEscapada}')" style="background: rgba(10, 132, 255, 0.1); border: 1px solid rgba(10, 132, 255, 0.2); border-radius: 6px; padding: 5px; color: #0a84ff; cursor: pointer;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                  </td>
                </tr>
              `;
            } else if (esGarantias) {
              let platGar = (fila.plataforma || "-").toUpperCase();
              let fechaGarRaw =
                fila.fecha_compra || fila.fecha || fila.dia || "-";
              let fechaGar =
                fechaGarRaw === "-" || fechaGarRaw.toLowerCase() === "hoy"
                  ? formatearFechaCorta(new Date())
                  : formatearFechaCorta(fechaGarRaw);

              let celdaCorreoGar =
                correoVal !== "-"
                  ? `<span onclick="copiarTextoUnico(this, '${encodeURIComponent(correoVal)}')" style="color: #0a84ff; font-family: monospace; font-weight: 600; cursor: pointer;" title="${correoVal}">${correoVal}</span>`
                  : "-";

              let celdaClaveGar =
                claveVal !== "-"
                  ? `<span onclick="copiarTextoUnico(this, '${encodeURIComponent(claveVal)}')" style="color: #30d158; font-family: monospace; font-weight: 600; cursor: pointer;" title="${claveVal}">${claveVal}</span>`
                  : "-";

              let textoReporteGar = `🚨 *REPORTE DE PROBLEMA*\n📺 *Plataforma:* ${platGar}\n📧 *Correo:* ${correoVal}\n🔑 *Clave:* ${claveVal}\n👤 *Proveedor:* ${provVal}\n📅 *Fecha Compra:* ${fechaGar}`;
              let textoEscapadoReporteGar = encodeURIComponent(textoReporteGar);

              let botonesAccionGarantias = `
                <div style="display: flex; gap: 6px; align-items: center; justify-content: flex-end; white-space: nowrap;">
                  <button onclick="copiarAccesoMySQL(this, '${textoEscapadoReporteGar}')" title="Copiar Reporte de Garantía" style="background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.3); color: #ff453a; padding: 5px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                    📋 Copiar Reporte
                  </button>
                  <button onclick="window.abrirModalResolverGarantia('${fila.id}', '${encodeURIComponent(correoVal)}', '${platGar.toLowerCase()}')" style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; padding: 5px 12px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                    ✔️ Resolver
                  </button>
              `;

              if (esSuperAdmin) {
                botonesAccionGarantias += `
                  <button onclick="eliminarRegistroMySQL(${fila.id}, '${encodeURIComponent(correoVal)}')" title="Eliminar" style="background: rgba(255, 69, 58, 0.1); border: 1px solid rgba(255, 69, 58, 0.2); border-radius: 6px; padding: 5px; color: #ff453a; cursor: pointer;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                `;
              }
              botonesAccionGarantias += `</div>`;

              html += `
                <tr style="background: rgba(255, 69, 58, 0.12); border-bottom: 1px solid rgba(255, 69, 58, 0.25);">
                  <td style="${tdBase} text-align: center; color: #ff453a; font-weight: 800;">${platGar}</td>
                  <td style="${tdBase} color: #ff9f0a; font-weight: 800;">${provVal}</td>
                  <td style="${tdBase} color: #a1a1aa;">${fechaGar}</td>
                  <td style="${tdBase}">${celdaCorreoGar}</td>
                  <td style="${tdBase}">${celdaClaveGar}</td>
                  <td style="${tdBase} text-align: right; padding-right: 15px;">${botonesAccionGarantias}</td>
                </tr>
              `;
            } else {
              let btnReporteOResolver = isCaida
                ? `<button onclick="window.abrirModalResolverGarantia('${fila.id}', '${encodeURIComponent(correoVal)}', '${window.tablaMySQLActual}')" style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; padding: 5px 12px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">✔️ Resolver</button>`
                : `<button onclick="window.marcarComoGarantia(${fila.id}, '${encodeURIComponent(correoVal)}', '${encodeURIComponent(claveVal)}', '${encodeURIComponent(provVal)}', '${encodeURIComponent(diaVal)}', ${isCaida})" style="background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.3); color: #ff453a; padding: 5px 8px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer;">🚨 Reportar</button>`;

              let botonesAccionDemas = `
                <div style="display: flex; gap: 5px; align-items: center; justify-content: flex-end;">
                  <button onclick="abrirModalEditarMySQL('${filaJsonEscapada}')" title="Editar Datos" style="background: rgba(10, 132, 255, 0.1); border: 1px solid rgba(10, 132, 255, 0.2); border-radius: 6px; padding: 5px; color: #0a84ff; cursor: pointer;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                  ${esSuperAdmin ? `<button onclick="eliminarRegistroMySQL(${fila.id}, '${encodeURIComponent(correoVal)}')" title="Eliminar Registro" style="background: rgba(255, 69, 58, 0.1); border: 1px solid rgba(255, 69, 58, 0.2); border-radius: 6px; padding: 5px; color: #ff453a; cursor: pointer;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>` : ""}
                  <button onclick="copiarAccesoMySQL(this, '${textoEscapadoFicha}')" title="Copiar Ficha Completa" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; padding: 5px; border-radius: 6px; cursor: pointer;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                  <button onclick="window.generarTemp(this, ${fila.id})" style="background: rgba(255, 159, 10, 0.15); border: 1px solid rgba(255, 159, 10, 0.3); color: #ff9f0a; padding: 5px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 800; cursor: pointer;">⏳ Temp</button>
                  ${btnReporteOResolver}
                </div>
              `;

              html += `
                <tr style="background: ${colorFondoFila};">
                  <td style="${tdBase} color: #ff9f0a; font-weight: 800; text-transform: uppercase;">${provVal}</td>
                  <td style="${tdBase} color: #a1a1aa;">${formatearFechaCorta(diaVal)}</td>
                  <td style="${tdBase}">${celdaCorreo}</td>
                  <td style="${tdBase}">${celdaClave}</td>
                  <td style="${tdBase} text-align: center; color: #ffffff; font-weight: 600;">${perfilVal}</td>
                  <td style="${tdBase} text-align: center;">${celdaPin}</td>
                  <td style="${tdBase} color: #e4e4e7;" title="${clienteVal}">${clienteVal}</td>
                  <td style="${tdBase}">${celdaTelefono}</td>
                  <td style="${tdBase} text-align: right; padding-right: 15px;">${botonesAccionDemas}</td>
                </tr>
              `;
            }
          });
        }
        tbody.innerHTML = html;
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

  const usuarioActivoObj = JSON.parse(
    sessionStorage.getItem("usuario_activo") || "{}",
  );
  const usuarioNombre = (
    usuarioActivoObj.nombre ||
    sessionStorage.getItem("active_staff") ||
    ""
  ).toUpperCase();

  const esCamilo = usuarioNombre === "CAMILO";
  const esSuperAdminLocal = usuarioActivoObj.rol === "superadmin" || esCamilo;

  const iId = document.getElementById("editMySQLId");
  const iDia = document.getElementById("editMySQLDia");
  const iCorreo = document.getElementById("editMySQLCorreo");
  const iClave = document.getElementById("editMySQLClave");
  const iPerfil = document.getElementById("editMySQLPerfil");
  const iPin = document.getElementById("editMySQLPin");
  const iVenc = document.getElementById("editMySQLVencimiento");
  const iNombre = document.getElementById("editMySQLNombre");
  const iNumero = document.getElementById("editMySQLNumero");
  const iFechaPago = document.getElementById("editMySQLFechaPago");
  const iValor = document.getElementById("editMySQLValor");
  const iPago = document.getElementById("editMySQLPago");

  if (iId) iId.value = fila.id || "";

  if (iDia) {
    iDia.value = fila.dia || "";
    iDia.readOnly = !esCamilo;
    iDia.style.opacity = esCamilo ? "1" : "0.6";
    iDia.style.cursor = esCamilo ? "text" : "not-allowed";
  }

  if (iCorreo) {
    const correoActual = fila.correo || fila.usuario || "";
    iCorreo.value = correoActual;
    iCorreo.dataset.correoAnterior = correoActual;
    iCorreo.readOnly = !esSuperAdminLocal;
    iCorreo.style.opacity = esSuperAdminLocal ? "1" : "0.6";
    iCorreo.style.cursor = esSuperAdminLocal ? "text" : "not-allowed";
  }
  if (iClave) iClave.value = fila.clave || fila.contrasena || "";
  if (iPerfil) iPerfil.value = fila.perfil || "";
  if (iPin) iPin.value = fila.pin || "";
  if (iVenc) iVenc.value = fila.vencimiento || "";
  if (iNombre) iNombre.value = fila.nombre || fila.cliente || "";
  if (iNumero) iNumero.value = fila.numero || fila.telefono || "";
  if (iFechaPago) iFechaPago.value = fila.fecha || "";
  if (iValor)
    iValor.value =
      fila.pago_total || fila.valor || fila.monto_cobrado || fila.monto || "";
  if (iPago)
    iPago.value =
      fila.pago || fila.metodo || fila.banco || fila.medio_pago || "";

  const modal = document.getElementById("modalEditarMySQL");
  if (modal) modal.style.display = "flex";
}

function guardarEdicionMySQL(e) {
  e.preventDefault();
  if (typeof haptic === "function") haptic();

  const btn = document.getElementById("btnGuardarEditMySQL");
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Guardando...";
  }

  const iDia = document.getElementById("editMySQLDia");
  const iCorreo = document.getElementById("editMySQLCorreo");
  const iFechaPago = document.getElementById("editMySQLFechaPago");
  const iValor = document.getElementById("editMySQLValor");
  const iPago = document.getElementById("editMySQLPago");

  const formData = new FormData();
  formData.append("accion", "editar");
  formData.append("tabla", window.tablaMySQLActual);
  formData.append("id", document.getElementById("editMySQLId").value);
  formData.append("dia", iDia ? iDia.value.trim() : "");
  formData.append(
    "correo_anterior",
    iCorreo ? iCorreo.dataset.correoAnterior || "" : "",
  );
  formData.append("correo", iCorreo ? iCorreo.value.trim() : "");
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
      if (btn) {
        btn.disabled = false;
        btn.innerText = "Guardar Cambios";
      }

      if (data.status === "success") {
        cerrarModalEditarMySQL();
        cargarDatosMySQL();
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
      if (btn) {
        btn.disabled = false;
        btn.innerText = "Guardar Cambios";
      }
      alert("❌ Error al actualizar el registro.");
    });
}

function cerrarModalEditarMySQL() {
  if (typeof haptic === "function") haptic();
  const modal = document.getElementById("modalEditarMySQL");
  if (modal) modal.style.display = "none";
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

function copiarAccesoMySQL(btn, textoEscapado) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(textoEscapado);

  navigator.clipboard.writeText(texto).then(() => {
    let oldHtml = btn.innerHTML;
    let oldBg = btn.style.background;

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
  esCaida = false,
) {
  const correo = decodeURIComponent(correoEscapado);
  const clave = decodeURIComponent(claveEscapada);
  const prov = decodeURIComponent(provEscapado);
  let dia = diaEscapado ? decodeURIComponent(diaEscapado) : "";

  if (!dia || dia.toLowerCase() === "hoy" || dia === "-") {
    dia = formatearFechaCorta(new Date());
  } else {
    dia = formatearFechaCorta(dia);
  }

  let platNorm = window.tablaMySQLActual.toUpperCase().replace(/_/g, "-");
  let textoReporte = `🚨 *REPORTE DE PROBLEMA*\n📺 *Plataforma:* ${platNorm}\n📧 *Correo:* ${correo}\n🔑 *Clave:* ${clave}\n👤 *Proveedor:* ${prov}\n📅 *Fecha Compra:* ${dia}`;

  navigator.clipboard
    .writeText(textoReporte)
    .then(() => {
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>¡Reporte copiado al portapapeles!</span></div>`,
        );
      }
    })
    .catch(() => {
      fallbackCopiar(textoReporte, () => {});
    });

  if (esCaida) {
    alert("⚠️ Esta cuenta ya fue reportada anteriormente en Garantías.");
    return;
  }

  if (
    !confirm(
      "⚠️ ¿Estás seguro de enviar esta cuenta a Garantías? Toda la cuenta se marcará como caída (rojo).",
    )
  )
    return;

  if (typeof haptic === "function") haptic();

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

  const iId = document.getElementById("resolverMySQLId");
  const iPlat = document.getElementById("resolverMySQLPlataforma");
  const iCorreoViejo = document.getElementById("resolverMySQLCorreoViejo");
  const iCorreoNuevo = document.getElementById("resolverMySQLCorreoNuevo");
  const iClaveNueva = document.getElementById("resolverMySQLClaveNueva");

  if (iId) iId.value = id;
  if (iPlat) iPlat.value = plataforma;
  if (iCorreoViejo) iCorreoViejo.value = correoViejo;
  if (iCorreoNuevo) iCorreoNuevo.value = correoViejo;
  if (iClaveNueva) iClaveNueva.value = "";

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
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Guardando...";
  }

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
      if (btn) {
        btn.disabled = false;
        btn.innerText = "Guardar y Resolver";
      }

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
      if (btn) {
        btn.disabled = false;
        btn.innerText = "Guardar y Resolver";
      }
      console.error(err);
      alert("❌ " + err.message);
    });
};

window.pasarRegistroAHoyMySQL = function (id, correoEscapado = "") {
  if (typeof haptic === "function") haptic();
  const correo = decodeURIComponent(correoEscapado);

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

// =========================================================================
// 💸 FORMATEADOR EN VIVO DE PESOS COLOMBIANOS (COP)
// =========================================================================
window.formatearMontoCOP = function (input) {
  let num = input.value.replace(/\D/g, "");
  if (!num) {
    input.value = "";
    return;
  }
  input.value = "$" + parseInt(num, 10).toLocaleString("es-CO");
};

// =========================================================================
// ➕ VENTANA MODAL DE REGISTRO ÚNICO
// =========================================================================
window.abrirModalAnadirUnPerfilNet = function (fechaEscapada) {
  if (typeof haptic === "function") haptic();
  const fechaContable = decodeURIComponent(fechaEscapada);

  const existingModal = document.getElementById(
    "modalAnadirUnPerfilNetOverlay",
  );
  if (existingModal) existingModal.remove();

  const hoy = new Date();
  hoy.setDate(hoy.getDate() + 30);
  const mesesMayus = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];
  const vencDefault = hoy.getDate() + "DE" + mesesMayus[hoy.getMonth()];

  const modalHtml = `
    <div class="overlay-ios open" id="modalAnadirUnPerfilNetOverlay" style="display: flex !important; z-index: 9999999 !important; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px); align-items: center; justify-content: center;">
      <div style="width: 92%; max-width: 500px; background: #0c0d12; border: 1px solid #1a4980; box-shadow: 0 0 25px rgba(10, 132, 255, 0.25); border-radius: 20px; padding: 22px 24px; box-sizing: border-box; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.1rem;">✏️</span>
            <h3 style="margin: 0; color: #0a84ff; font-size: 1.15rem; font-weight: 800; letter-spacing: -0.3px;">Añadir Registro Netflix</h3>
          </div>
          <button type="button" onclick="document.getElementById('modalAnadirUnPerfilNetOverlay').remove()" style="background: rgba(255,255,255,0.08); border: none; color: #8e8e93; width: 26px; height: 26px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: bold; transition: background 0.2s;">✕</button>
        </div>

        <!-- Formulario -->
        <form onsubmit="window.guardarRegistroUnicoMySQL(event, '${fechaContable}')" style="display: flex; flex-direction: column; gap: 12px; margin: 0;">
          
          <!-- Fila 1: Correo / Contraseña -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="display: block; font-size: 0.68rem; font-weight: 800; color: #a1a1aa; margin-bottom: 6px; letter-spacing: 0.5px;">CORREO / USUARIO</label>
              <!-- 💡 AQUÍ SE CAMBIÓ A type="text" -->
              <input type="text" id="addNetCorreoUnico" required style="width: 100%; box-sizing: border-box; background: #000000; border: 1px solid #27272a; color: #ffffff; padding: 10px 12px; border-radius: 10px; font-size: 0.85rem; font-family: monospace; outline: none;">
            </div>
            <div>
              <label style="display: block; font-size: 0.68rem; font-weight: 800; color: #a1a1aa; margin-bottom: 6px; letter-spacing: 0.5px;">CONTRASEÑA</label>
              <input type="text" id="addNetClaveUnico" required style="width: 100%; box-sizing: border-box; background: #000000; border: 1px solid #27272a; color: #ffffff; padding: 10px 12px; border-radius: 10px; font-size: 0.85rem; font-family: monospace; outline: none;">
            </div>
          </div>

          <!-- Fila 2: Perfil / Pin / Vencimiento -->
          <div style="display: grid; grid-template-columns: 0.8fr 1fr 1.4fr; gap: 10px;">
            <div>
              <label style="display: block; font-size: 0.68rem; font-weight: 800; color: #a1a1aa; margin-bottom: 6px; letter-spacing: 0.5px;">PERFIL</label>
              <input type="text" id="addNetPerfilUnico" value="1" style="width: 100%; box-sizing: border-box; background: #000000; border: 1px solid #27272a; color: #ffffff; padding: 10px 12px; border-radius: 10px; font-size: 0.85rem; outline: none;">
            </div>
            <div>
              <label style="display: block; font-size: 0.68rem; font-weight: 800; color: #a1a1aa; margin-bottom: 6px; letter-spacing: 0.5px;">PIN</label>
              <input type="text" id="addNetPinUnico" value="" placeholder="" style="width: 100%; box-sizing: border-box; background: #000000; border: 1px solid #27272a; color: #ffffff; padding: 10px 12px; border-radius: 10px; font-size: 0.85rem; font-family: monospace; outline: none;">
            </div>
            <div>
              <label style="display: block; font-size: 0.68rem; font-weight: 800; color: #a1a1aa; margin-bottom: 6px; letter-spacing: 0.5px;">VENCIMIENTO</label>
              <input type="text" id="addNetVencimientoUnico" value="${vencDefault}" style="width: 100%; box-sizing: border-box; background: #000000; border: 1px solid #27272a; color: #ffffff; padding: 10px 12px; border-radius: 10px; font-size: 0.8rem; font-family: monospace; outline: none;">
            </div>
          </div>

          <!-- Fila 3: Cliente / Teléfono -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="display: block; font-size: 0.68rem; font-weight: 800; color: #a1a1aa; margin-bottom: 6px; letter-spacing: 0.5px;">CLIENTE</label>
              <input type="text" id="addNetClienteUnico" value="Sin Nombre" style="width: 100%; box-sizing: border-box; background: #000000; border: 1px solid #27272a; color: #ffffff; padding: 10px 12px; border-radius: 10px; font-size: 0.85rem; outline: none;">
            </div>
            <div>
              <label style="display: block; font-size: 0.68rem; font-weight: 800; color: #a1a1aa; margin-bottom: 6px; letter-spacing: 0.5px;">TELÉFONO</label>
              <input type="text" id="addNetTelefonoUnico" value="" placeholder="" style="width: 100%; box-sizing: border-box; background: #000000; border: 1px solid #27272a; color: #ffffff; padding: 10px 12px; border-radius: 10px; font-size: 0.85rem; font-family: monospace; outline: none;">
            </div>
          </div>

          <!-- Fila 4: Fecha Pago / Valor / Método Pago -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
            <div>
              <label style="display: block; font-size: 0.68rem; font-weight: 800; color: #a1a1aa; margin-bottom: 6px; letter-spacing: 0.5px;">FECHA PAGO</label>
              <input type="text" id="addNetFechaPagoUnico" value="${fechaContable}" style="width: 100%; box-sizing: border-box; background: #000000; border: 1px solid #27272a; color: #ffffff; padding: 10px 12px; border-radius: 10px; font-size: 0.85rem; font-family: monospace; outline: none;">
            </div>
            <div>
              <label style="display: block; font-size: 0.68rem; font-weight: 800; color: #a1a1aa; margin-bottom: 6px; letter-spacing: 0.5px;">VALOR</label>
              <input type="text" id="addNetValorUnico" value="" placeholder="" oninput="window.formatearMontoCOP(this)" style="width: 100%; box-sizing: border-box; background: #000000; border: 1px solid #27272a; color: #30d158; padding: 10px 12px; border-radius: 10px; font-size: 0.85rem; font-family: monospace; font-weight: bold; outline: none;">
            </div>
            <div>
              <label style="display: block; font-size: 0.68rem; font-weight: 800; color: #a1a1aa; margin-bottom: 6px; letter-spacing: 0.5px;">MÉTODO PAGO</label>
              <select id="addNetMetodoPagoUnico" style="width: 100%; height: 38px; box-sizing: border-box; background: #000000; border: 1px solid #27272a; color: #ffffff; padding: 8px 10px; border-radius: 10px; font-size: 0.85rem; outline: none; cursor: pointer;">
                <option value="">-</option>
                <option value="Nequi">Nequi</option>
                <option value="Daviplata">Daviplata</option>
                <option value="Bancolombia">Bancolombia</option>
                <option value="Bre-B">Bre-B</option>
                <option value="Dale">Dale</option>
                <option value="Efectivo">Efectivo</option>
              </select>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 12px; margin-top: 10px;">
            <button type="button" onclick="document.getElementById('modalAnadirUnPerfilNetOverlay').remove()" style="background: #2b2c30; border: none; color: #ffffff; padding: 12px; border-radius: 12px; font-weight: 800; font-size: 0.9rem; cursor: pointer; transition: background 0.2s;">Cancelar</button>
            <button type="submit" id="btnSubmitAnadirUnicoNet" style="background: #ffffff; border: none; color: #000000; padding: 12px; border-radius: 12px; font-weight: 900; font-size: 0.9rem; cursor: pointer; box-shadow: 0 4px 15px rgba(255,255,255,0.25); transition: opacity 0.2s;">Guardar Cambios</button>
          </div>

        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
  setTimeout(() => {
    document.getElementById("addNetCorreoUnico").focus();
  }, 100);
};

window.guardarRegistroUnicoMySQL = function (e, fechaContable) {
  e.preventDefault();
  if (typeof haptic === "function") haptic();

  const btn = document.getElementById("btnSubmitAnadirUnicoNet");
  const correo = document.getElementById("addNetCorreoUnico").value.trim();
  const clave = document.getElementById("addNetClaveUnico").value.trim();
  const perfil = document.getElementById("addNetPerfilUnico").value.trim();
  const pin = document.getElementById("addNetPinUnico").value.trim();
  const vencimiento = document
    .getElementById("addNetVencimientoUnico")
    .value.trim();
  const cliente = document.getElementById("addNetClienteUnico").value.trim();
  const telefono = document.getElementById("addNetTelefonoUnico").value.trim();
  const fechaPago = document
    .getElementById("addNetFechaPagoUnico")
    .value.trim();
  const valor = document.getElementById("addNetValorUnico").value.trim();
  const metodoPago = document
    .getElementById("addNetMetodoPagoUnico")
    .value.trim();

  if (!correo || !clave) return;

  btn.disabled = true;
  btn.innerText = "Guardando...";

  const formData = new FormData();
  formData.append("accion", "agregar_registro_unico_netflix");
  formData.append("correo", correo);
  formData.append("clave", clave);
  formData.append("perfil", perfil);
  formData.append("pin", pin);
  formData.append("vencimiento", vencimiento);
  formData.append("nombre", cliente);
  formData.append("numero", telefono);
  formData.append("fecha", fechaPago);
  formData.append("valor", valor);
  formData.append("pago", metodoPago);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((r) => r.json())
    .then((data) => {
      btn.disabled = false;
      btn.innerText = "Guardar Cambios";

      if (data.status === "success") {
        const modal = document.getElementById("modalAnadirUnPerfilNetOverlay");
        if (modal) modal.remove();

        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><span>✅ Perfil añadido correctamente</span></div>`,
          );
        }
        cargarDatosMySQL();
      } else {
        alert("❌ Error: " + data.message);
      }
    })
    .catch((err) => {
      btn.disabled = false;
      btn.innerText = "Guardar Cambios";
      alert("❌ Error de red al registrar en MySQL.");
    });
};
