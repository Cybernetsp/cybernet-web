const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzWdHzqlwlAWcCuXngcurIIrZVCHl5QEhRUkHTL90dhNqfm1iXnvSvDli5G_r6zlmHY/exec";

let timerInterval = null;
let autoRefreshCodesInterval = null;
let isFetchingCodes = false;
window.currentCodesStock = [];

let isFetchingHoras = false;
window.currentHorasStock = [];

let isFetchingAccounts = false;
window.currentSearchStock = [];

let temporizadorInactividad = null;
let temporizadorCierreTotal = null;
let isTimerPaused = false;

const INACTIVITY_LOGOUT_LIMIT = 30 * 60 * 1000;

// 🔥 CEREBRO DE COMBOS: Guarda los meses y los replica en cascada
window.ultimoMesesSeleccionado = "1";

function actualizarMesesGlobal(valor) {
  window.ultimoMesesSeleccionado = valor;

  // Si cambias los meses de una, cambia automáticamente todas las que ya tengas marcadas
  const checkboxes = document.getElementsByName("platformCheckVenta");
  checkboxes.forEach((cb) => {
    if (cb.checked && cb.value !== "SALDO") {
      const elM = document.getElementById(`meses_${cb.value}`);
      if (elM) elM.value = valor;
    }
  });
}

window.pendingUser = "";
window.pendingOldPass = "";
window.pendingRemember = false;
window.isForcedChange = false;

function haptic() {
  if (navigator.vibrate) {
    navigator.vibrate(15);
  }
}

const listaPlataformasVenta = [
  {
    id: "NETFLIX",
    nombre: "NETFLIX",
    permitePantallas: true,
    permiteRenovacion: true,
  },
  {
    id: "AMAZON",
    nombre: "AMAZON",
    permitePantallas: true,
    permiteRenovacion: false,
  },
  {
    id: "DISNEY-PREMIUM",
    nombre: "DISNEY PREMIUM",
    permitePantallas: true,
    permiteRenovacion: false,
  },
  {
    id: "DISNEY-ESTANDAR",
    nombre: "DISNEY ESTANDAR",
    permitePantallas: true,
    permiteRenovacion: false,
  },
  {
    id: "HBO-MAX",
    nombre: "HBO MAX",
    permitePantallas: true,
    permiteRenovacion: false,
  },
  {
    id: "CRUNCHYROLL",
    nombre: "CRUNCHYROLL",
    permitePantallas: true,
    permiteRenovacion: false,
  },
  {
    id: "VIX",
    nombre: "VIX",
    permitePantallas: true,
    permiteRenovacion: false,
  },
  {
    id: "PLEX",
    nombre: "PLEX",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "PARAMOUNT",
    nombre: "PARAMOUNT",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "APPLE-TV",
    nombre: "APPLE TV",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "YOUTUBE",
    nombre: "YOUTUBE",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "SPOTIFY",
    nombre: "SPOTIFY",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "IPTV",
    nombre: "IPTV",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "SALDO",
    nombre: "SALDO",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "CANVA",
    nombre: "CANVA",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "CAPCUT",
    nombre: "CAPCUT",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "METEGOL",
    nombre: "METEGOL",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "UNIVERSAL",
    nombre: "UNIVERSAL",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "DEEZER",
    nombre: "DEEZER",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "MUBI",
    nombre: "MUBI",
    permitePantallas: false,
    permiteRenovacion: false,
  },
];

function toggleVentasPanel() {
  haptic();
  const overlay = document.getElementById("ventasOverlay");
  overlay.classList.toggle("open");
  if (overlay.classList.contains("open")) {
    document.getElementById("buscarPlataformaVenta").value = "";
    filtrarPlataformasVenta();
    document.getElementById("ventaNombre").focus();

    // LÍNEAS NUEVAS: Identificar al empleado activo
    const optNomina = document.getElementById("optPagoNomina");
    if (optNomina) {
      const staffActivo = sessionStorage.getItem("active_staff") || "STAFF";
      optNomina.value = "NÓMINA: " + staffActivo.toUpperCase();
    }
  }
}
// =========================================================================
// 📥 MÓDULO INTEGRADO: CARGA EN LOTE Y GESTIÓN DE PROVEEDORES
// =========================================================================
function toggleCargarPanel() {
  haptic();
  const overlay = document.getElementById("cargarOverlay");
  overlay.classList.toggle("open");

  // Cada vez que se abra, sincroniza el estatus de salud de los proveedores
  if (overlay.classList.contains("open")) {
    cargarResumenProveedores();
  }
}

function comprobarProveedorDinamico() {
  const selectProv = document.getElementById("loadProveedor").value;
  const wrapperManual = document.getElementById("wrapperProveedorManual");
  const inputManual = document.getElementById("loadProveedorManual");

  if (selectProv === "OTRO") {
    wrapperManual.style.setProperty("display", "flex", "important");
    inputManual.required = true;
    inputManual.focus();
  } else {
    wrapperManual.style.setProperty("display", "none", "important");
    inputManual.required = false;
    inputManual.value = "";
  }
}

function ejecutarCargaLote(e) {
  e.preventDefault();
  // Si tienes una función haptic() definida en tu JS, déjala; si no, coméntala.
  if (typeof haptic === "function") haptic();

  const btnSubmit = document.getElementById("btnSubmitCarga");
  const plataforma = document.getElementById("loadPlataforma").value;
  const selectProv = document.getElementById("loadProveedor").value;
  const proveedorManual = document
    .getElementById("loadProveedorManual")
    .value.trim();
  const bloqueCuentas = document.getElementById("loadCuentasBloque").value;

  let listaCuentasExtraidas = [];

  // =========================================================================
  // 1. NUEVA LÓGICA: Detección de Bloques Detallados (Cuenta: ... Contraseña: ...)
  // =========================================================================
  const esBloqueDetallado =
    /(?:Cuenta|Correo|Email):\s*([^\n\r]+)/i.test(bloqueCuentas) &&
    /(?:Contraseña|Clave|Password):\s*([^\n\r]+)/i.test(bloqueCuentas);

  if (esBloqueDetallado) {
    const regexCuenta = /(?:Cuenta|Correo|Email):\s*([^\s\n\r]+)/gi;
    const regexClave = /(?:Contraseña|Clave|Password):\s*([^\s\n\r]+)/gi;

    let cuentas = [];
    let matchC;
    while ((matchC = regexCuenta.exec(bloqueCuentas)) !== null) {
      cuentas.push(matchC[1].trim());
    }

    let claves = [];
    let matchP;
    while ((matchP = regexClave.exec(bloqueCuentas)) !== null) {
      claves.push(matchP[1].trim());
    }

    // Emparejamos los correos con sus respectivas contraseñas
    const limite = Math.min(cuentas.length, claves.length);
    for (let i = 0; i < limite; i++) {
      if (cuentas[i] && claves[i]) {
        listaCuentasExtraidas.push(cuentas[i] + " " + claves[i]);
      }
    }
  }
  // =========================================================================
  // 2. LÓGICA CLÁSICA: Extracción Tradicional (correo:clave o correo clave)
  // =========================================================================
  else {
    const regexEmailPass =
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})[:\s|]+([^\s\n\r]+)/g;
    let matches;

    while ((matches = regexEmailPass.exec(bloqueCuentas)) !== null) {
      let user = matches[1].trim();
      let pass = matches[2].trim();
      if (
        user &&
        pass &&
        pass.length > 1 &&
        !pass.toLowerCase().includes("valor") &&
        !pass.toLowerCase().includes("subtotal")
      ) {
        listaCuentasExtraidas.push(user + " " + pass);
      }
    }

    // Modo rescate extremo línea por línea si falla el Regex
    if (listaCuentasExtraidas.length === 0) {
      let lineas = bloqueCuentas.split("\n");
      listaCuentasExtraidas = lineas
        .map((linea) => {
          let l = linea.trim();
          if (l.includes(":") && !l.includes("|") && !l.includes(" ")) {
            return l.replace(":", " ");
          }
          return l;
        })
        .filter((l) => l.length > 0 && l.includes("@")); // Nos aseguramos que al menos tenga un @
    }
  }

  const bloqueCuentasFinal = listaCuentasExtraidas.join("\n");
  const proveedorFinal = selectProv === "OTRO" ? proveedorManual : selectProv;

  // Validación de extracción vacía
  if (bloqueCuentasFinal.trim() === "") {
    triggerToast(
      `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-red);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> <span>No se detectaron credenciales válidas.</span></div>`,
    );
    return;
  }

  // Validación de proveedor manual
  if (selectProv === "OTRO" && proveedorFinal === "") {
    triggerToast(
      `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-orange);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> <span>Escribe el nombre del nuevo proveedor.</span></div>`,
    );
    return;
  }

  // Interfaz de carga
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:8px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Inyectando en Sheets...`;

  const oldScript = document.getElementById("cyber_cargamasiva_node");
  if (oldScript) oldScript.remove();

  // Función de retorno desde Apps Script
  window.procesarCargaLoteSheets = function (res) {
    const scriptNode = document.getElementById("cyber_cargamasiva_node");
    if (scriptNode) scriptNode.remove();

    btnSubmit.disabled = false;
    btnSubmit.innerText = "Cargar Cuentas en Lote";

    if (res && res.status === "success") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>${res.message || "Lote cargado con éxito."}</span></div>`,
      );

      let cacheTurno = JSON.parse(
        sessionStorage.getItem("cyber_history_cargas") || "[]",
      );

      listaCuentasExtraidas.forEach((linea) => {
        let fragmentos = linea.trim().split(/\s+/);
        if (fragmentos.length >= 2) {
          let correoUser = fragmentos[0];
          let claveUser = fragmentos[1];

          cacheTurno.push({
            plataforma: plataforma,
            proveedor: proveedorFinal,
            correo: correoUser,
            clave: claveUser,
          });

          // Si tienes esta función, la llamamos para actualizar la UI
          if (typeof renderizarTarjetaHistorial === "function") {
            renderizarTarjetaHistorial(
              plataforma,
              proveedorFinal,
              correoUser,
              claveUser,
            );
          }
        }
      });

      sessionStorage.setItem(
        "cyber_history_cargas",
        JSON.stringify(cacheTurno),
      );
      document.getElementById("formCargarCuentas").reset();
      document.getElementById("wrapperProveedorManual").style.display = "none";

      // Actualizamos UI
      if (typeof cargarResumenProveedores === "function")
        cargarResumenProveedores();
    } else {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-red);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> <span>Error: ${res ? res.message : "Fallo de comunicación."}</span></div>`,
      );
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_cargamasiva_node";
  let queryParams = `?action=cargarCuentasMasivo&plataforma=${encodeURIComponent(plataforma)}&proveedor=${encodeURIComponent(proveedorFinal)}&bloqueCuentas=${encodeURIComponent(bloqueCuentasFinal)}&callback=procesarCargaLoteSheets&_ts=${Date.now()}`;
  scriptElement.src = GOOGLE_SCRIPT_URL + queryParams; // Asegúrate de tener GOOGLE_SCRIPT_URL definida en tu JS
  document.body.appendChild(scriptElement);
}

function cargarResumenProveedores() {
  const tbody = document.getElementById("tablaResumenProveedores");
  if (!tbody) return;

  const oldScript = document.getElementById("cyber_prov_summary_node");
  if (oldScript) oldScript.remove();

  tbody.innerHTML =
    '<tr><td colspan="3" style="text-align: center; padding: 15px; color: var(--text-secondary);"><svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle; margin-right:6px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Sincronizando métricas...</td></tr>';

  window.procesarResumenProveedores = function (res) {
    const scriptNode = document.getElementById("cyber_prov_summary_node");
    if (scriptNode) scriptNode.remove();

    if (res && res.status === "success") {
      const data = res.data;
      const conteo = { ANA: 0, CHAYO: 0, FABIAN: 0, "OTROS / MANUAL": 0 };

      data.forEach((item) => {
        let prov = String(item.proveedor || "")
          .toUpperCase()
          .trim();
        if (conteo[prov] !== undefined) {
          conteo[prov]++;
        } else if (prov !== "") {
          conteo["OTROS / MANUAL"]++;
        }
      });

      let html = "";
      for (let prov in conteo) {
        let cant = conteo[prov];
        let alarmaTexto = "Estable";
        let alarmaColor = "var(--ios-green)";

        if (cant > 4) {
          alarmaTexto = "Crítico";
          alarmaColor = "var(--ios-red)";
        } else if (cant > 0) {
          alarmaTexto = "Riesgo";
          alarmaColor = "var(--ios-orange)";
        }

        html += `
                        <tr>
                            <td style="padding: 10px 5px; border-bottom: 0.5px solid rgba(255,255,255,0.05);"><strong>${prov}</strong></td>
                            <td style="padding: 10px 5px; border-bottom: 0.5px solid rgba(255,255,255,0.05); text-align: center; font-family: monospace; font-weight: bold; font-size: 1rem; color: ${cant > 0 ? "var(--ios-red)" : "var(--text-secondary)"};">${cant}</td>
                            <td style="padding: 10px 5px; border-bottom: 0.5px solid rgba(255,255,255,0.05); text-align: right; font-weight: 600; color: ${alarmaColor};">${alarmaTexto}</td>
                        </tr>`;
      }
      tbody.innerHTML = html;
    } else {
      tbody.innerHTML =
        '<tr><td colspan="3" style="text-align: center; color: var(--ios-red);">Error al sincronizar.</td></tr>';
    }
    delete window.procesarResumenProveedores;
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_prov_summary_node";
  scriptElement.src =
    GOOGLE_SCRIPT_URL +
    "?action=obtenerGarantias&callback=procesarResumenProveedores&_ts=" +
    Date.now();
  document.body.appendChild(scriptElement);
}

function renderizarTarjetaHistorial(plataforma, proveedor, correo, clave) {
  const msgVacio = document.getElementById("msgHistorialVacio");
  if (msgVacio) msgVacio.remove();

  const cajaHistorial = document.getElementById("contenedorHistorialSesion");
  if (!cajaHistorial) return;

  const tarjetaLog = document.createElement("div");
  tarjetaLog.className = "card-ios";
  tarjetaLog.style.padding = "10px 12px";
  tarjetaLog.style.background = "rgba(255, 255, 255, 0.02)";
  tarjetaLog.style.display = "flex";
  tarjetaLog.style.flexDirection = "column";
  tarjetaLog.style.gap = "6px";
  tarjetaLog.style.marginBottom = "0";

  tarjetaLog.innerHTML = `
                <div class="flex-row-between" style="border-bottom: 0.5px solid rgba(255,255,255,0.06); padding-bottom: 4px;">
                    <span class="badge-ios badge-blue" style="font-size: 0.68rem; padding: 1px 6px;">${plataforma.toUpperCase()}</span>
                    <span class="text-secondary" style="font-size: 0.75rem; font-weight: 600;">Prov: <b style="color:var(--text-primary);">${proveedor.toUpperCase()}</b></span>
                </div>
                <div class="flex-row-between" style="font-size: 0.82rem;">
                    <span style="color: var(--text-primary); font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 70%;">${correo}</span>
                    <button class="btn-ios btn-secondary" style="padding: 3px 8px; font-size: 0.7rem; width: auto; margin: 0;" onclick="copiarTextoRapido(this, '${correo}')">Copiar</button>
                </div>
                <div class="flex-row-between" style="font-size: 0.82rem;">
                    <span style="color: var(--ios-green); font-family: monospace; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 70%;">${clave}</span>
                    <button class="btn-ios btn-secondary" style="padding: 3px 8px; font-size: 0.7rem; width: auto; margin: 0;" onclick="copiarTextoRapido(this, '${clave}')">Copiar</button>
                </div>
            `;
  cajaHistorial.insertBefore(tarjetaLog, cajaHistorial.firstChild);
}

// ✂️ LÓGICA DEL TALLER NETFLIX: CORTES
function volverMenuNetflix() {
  haptic();
  document.getElementById("netflixPanelCortes").style.display = "none";
  document.getElementById("netflixMenuPrincipal").style.display = "flex";
}

// 🔄 Función para re-escanear cortes desde Sheets en vivo
function refrescarCortesEnVivo(btn) {
  haptic();
  let oldText = btn.innerHTML;
  btn.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Buscando...`;
  btn.disabled = true;

  abrirPanelCortesNet();

  setTimeout(() => {
    btn.innerHTML = oldText;
    btn.disabled = false;
  }, 1000);
}

// Generador de clave fácil para TV
function generarClaveNetflixTV() {
  const palabras = [
    "luna",
    "nova",
    "star",
    "cielo",
    "lobo",
    "rayo",
    "neon",
    "sol",
    "mar",
    "azul",
    "rojo",
    "rey",
  ];
  const p = palabras[Math.floor(Math.random() * palabras.length)];
  const n = Math.floor(Math.random() * 90) + 10;
  return p + n + "@@";
}

function abrirPanelCortesNet() {
  haptic();
  document.getElementById("netflixMenuPrincipal").style.display = "none";
  document.getElementById("netflixPanelCortes").style.display = "flex";

  const contenedor = document.getElementById("listaCuentasCorte");
  contenedor.innerHTML =
    '<div style="text-align:center; padding:30px; color:var(--text-secondary); font-size:0.9rem;"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:10px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg><br>Buscando perfiles vencidos en Sheets...</div>';

  const cbName = "cb_cortes_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    contenedor.innerHTML = "";

    if (res && res.status === "success") {
      if (res.data.length === 0) {
        contenedor.innerHTML =
          '<div style="text-align:center; padding:30px; color:var(--ios-green); font-weight:bold;">¡Todo limpio! No hay perfiles vencidos.</div>';
        return;
      }

      res.data.forEach((cuenta, index) => {
        let claveNuevaSugerida = generarClaveNetflixTV();
        let perfilesTexto = cuenta.perfilesVencidos.join(", ");
        let perfilesOcultosSeguros = cuenta.perfilesVencidos.join("|||");

        let div = document.createElement("div");
        div.className = "card-ios";
        div.style.padding = "18px";
        div.style.display = "flex";
        div.style.flexDirection = "column";
        div.style.gap = "12px";

        div.innerHTML = `
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 12px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="width: 10px; height: 10px; border-radius: 50%; background: #E50914; box-shadow: 0 0 10px #E50914;"></div>
                                    <span style="font-size: 0.75rem; font-weight: 800; color: #E50914; text-transform: uppercase; letter-spacing: 0.5px;">Corte Requerido</span>
                                </div>
                                <div style="background: rgba(255, 159, 10, 0.15); color: var(--ios-orange); padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 800; border: 1px solid rgba(255, 159, 10, 0.3);">
                                    PERFILES: ${perfilesTexto}
                                </div>
                            </div>

                            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 10px 14px; border-radius: 14px;">
                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: 0.65rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Correo de la Cuenta</span>
                                    <span style="font-size: 0.95rem; color: var(--text-primary); font-weight: 700;">${cuenta.correo}</span>
                                </div>
                                <button style="background: rgba(10, 132, 255, 0.15); border: none; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; color: var(--ios-blue); cursor: pointer; transition: all 0.2s ease; flex-shrink: 0;" onclick="copiarTextoRapido(this, '${cuenta.correo}')" title="Copiar Correo">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                </button>
                            </div>

                            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 69, 58, 0.05); border: 1px solid rgba(255, 69, 58, 0.15); padding: 10px 14px; border-radius: 14px;">
                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: 0.65rem; color: var(--ios-red); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Clave Actual (Vencida)</span>
                                    <span style="font-size: 1.1rem; color: var(--ios-red); font-weight: bold; font-family: monospace; letter-spacing: 1px;">${cuenta.claveActual}</span>
                                </div>
                                <button style="background: rgba(255, 69, 58, 0.15); border: none; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; color: var(--ios-red); cursor: pointer; transition: all 0.2s ease; flex-shrink: 0;" onclick="copiarTextoRapido(this, '${cuenta.claveActual}')" title="Copiar Clave">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                </button>
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 6px;">
                                <span style="font-size: 0.7rem; color: var(--ios-green); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding-left: 4px;">Generar Nueva Clave</span>
                                <div style="display: flex; gap: 8px; align-items: stretch;">
                                    <input type="text" class="input-ios" id="nueva_clave_${index}" style="margin-bottom: 0; flex: 1; font-family: monospace; font-size: 1.1rem; font-weight: 800; color: var(--ios-green); background: rgba(48, 209, 88, 0.06); border-color: rgba(48, 209, 88, 0.3);" value="${claveNuevaSugerida}">
                                    <button style="background: var(--ios-green); border: none; border-radius: 12px; color: #fff; cursor: pointer; padding: 0 16px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(48, 209, 88, 0.3);" onclick="copiarInputRapido(this, 'nueva_clave_${index}')" title="Copiar Nueva Clave">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                    </button>
                                </div>
                            </div>
                            
                            <button class="btn-ios" style="margin-top: 4px; width: 100%; background: rgba(10, 132, 255, 0.1); border: 1px solid var(--ios-blue); color: var(--ios-blue); font-weight: 700; padding: 14px; border-radius: 14px; transition: all 0.3s ease;" onclick="procesarCorteReal(this, '${cuenta.correo}', '${perfilesOcultosSeguros}', 'nueva_clave_${index}')">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: bottom;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                Procesar Corte y Subir a Hoy
                            </button>
                        `;
        contenedor.appendChild(div);
      });
    } else {
      contenedor.innerHTML = `<div style="color:var(--ios-red); text-align:center;">Error: ${res ? res.message : "Fallo de conexión"}</div>`;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerCortesNetflix&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

// Sistema de Toast Nativo (Reemplazo moderno de notificaciones)
function triggerToast(msgHTML) {
  const toast = document.getElementById("appleToast");
  toast.innerHTML = msgHTML;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function copiarTextoRapido(btn, texto) {
  haptic();
  navigator.clipboard.writeText(texto).then(() => {
    let oldBg = btn.style.background;
    let oldColor = btn.style.color;

    btn.style.background = "var(--ios-green)";
    btn.style.color = "#ffffff";
    btn.style.transform = "scale(1.15)";

    triggerToast(
      `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Copiado al portapapeles</span></div>`,
    );

    setTimeout(() => {
      btn.style.background = oldBg;
      btn.style.color = oldColor;
      btn.style.transform = "scale(1)";
    }, 800);
  });
}

function copiarInputRapido(btn, idInput) {
  haptic();
  let texto = document.getElementById(idInput).value;
  navigator.clipboard.writeText(texto).then(() => {
    let oldBg = btn.style.background;
    let oldColor = btn.style.color;

    btn.style.background = "var(--ios-green)";
    btn.style.color = "#ffffff";
    btn.style.transform = "scale(1.1)";

    triggerToast(
      `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Nueva clave copiada</span></div>`,
    );

    setTimeout(() => {
      btn.style.background = oldBg;
      btn.style.color = oldColor;
      btn.style.transform = "scale(1)";
    }, 800);
  });
}

window.clientesSalvadosCorte = [];

function procesarCorteReal(btn, correo, perfilesCortados, idInputNuevaClave) {
  haptic();
  const nuevaClave = document.getElementById(idInputNuevaClave).value;

  btn.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Operando en Sheets...`;
  btn.disabled = true;
  btn.style.opacity = "0.7";

  const cbName = "cb_proc_corte_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      btn.innerHTML = "¡Completado!";
      btn.style.background = "var(--ios-green)";
      btn.style.color = "white";
      btn.closest(".card-ios").style.opacity = "0.4";
      btn.closest(".card-ios").style.pointerEvents = "none";

      mostrarResultadoCortes(res.clientes);
    } else {
      alert("Error: " + res.message);
      btn.innerHTML = "Reintentar";
      btn.disabled = false;
      btn.style.opacity = "1";
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=procesarCorteNetflix&correo=${encodeURIComponent(correo)}&nuevaClave=${encodeURIComponent(nuevaClave)}&perfilesCortados=${encodeURIComponent(perfilesCortados)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

function mostrarResultadoCortes(clientes) {
  window.clientesSalvadosCorte = clientes;
  const contenedor = document.getElementById("listaClientesSalvados");
  contenedor.innerHTML = "";

  if (clientes.length === 0) {
    contenedor.innerHTML =
      "<div style='color:var(--text-secondary); text-align:center; padding: 15px; font-size:0.85rem;'>Ningún cliente quedó activo en esta cuenta.</div>";
  } else {
    clientes.forEach((cli, idx) => {
      let div = document.createElement("div");
      div.style.padding = "10px 12px";
      div.style.background = "rgba(255,255,255,0.02)";
      div.style.border = "1px solid rgba(255,255,255,0.05)";
      div.style.borderRadius = "12px";
      div.style.display = "flex";
      div.style.justifyContent = "space-between";
      div.style.alignItems = "center";

      let pinTexto = cli.pin ? ` | PIN: ${cli.pin}` : "";
      let nombreTexto = cli.nombre ? ` • ${cli.nombre}` : "";

      div.innerHTML = `
                        <div style="display:flex; flex-direction:column; gap:1px;">
                            <span style="font-weight:700; color:var(--text-primary); font-size:0.9rem;">${cli.telefono}</span>
                            <span style="font-size:0.72rem; color:var(--text-secondary);">Perfil ${cli.perfil}${nombreTexto}${pinTexto}</span>
                        </div>
                        <button style="background: rgba(48, 209, 88, 0.1); border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--ios-green); cursor: pointer; transition: all 0.2s ease; flex-shrink: 0;" onclick="copiarTextoRapido(this, decodeURIComponent('${cli.mensaje}'))" title="Copiar Mensaje">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                    `;
      contenedor.appendChild(div);
    });
  }
  document.getElementById("resultadoCortesOverlay").classList.add("open");
}

function copiarBloqueNumerosCorte(btn) {
  haptic();
  let texto = "";
  window.clientesSalvadosCorte.forEach((cli, idx) => {
    texto += `${idx + 1}. wa.me/57${cli.telefono}\n`;
  });

  navigator.clipboard.writeText(texto).then(() => {
    let oldBg = btn.style.background;
    let oldColor = btn.style.color;
    let oldBorder = btn.style.borderColor;

    btn.style.background = "var(--ios-green)";
    btn.style.color = "#ffffff";
    btn.style.borderColor = "transparent";
    btn.style.transform = "scale(1.03)";

    triggerToast(
      `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Bloque copiado</span></div>`,
    );

    setTimeout(() => {
      btn.style.background = oldBg;
      btn.style.color = oldColor;
      btn.style.borderColor = oldBorder;
      btn.style.transform = "scale(1)";
    }, 800);
  });
}

function toggleNetflixManagerPanel() {
  haptic();
  const overlay = document.getElementById("netflixManagerOverlay");
  overlay.classList.toggle("open");
}

function renderizarPlataformasVenta() {
  const contenedor = document.getElementById("contenedorPlataformasVenta");
  if (!contenedor) return;

  let html = "";
  listaPlataformasVenta.forEach((plat) => {
    let selectorPantallas = "";
    if (plat.permitePantallas) {
      selectorPantallas = `
                        <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                            <span style="font-size: 0.68rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">Pantallas</span>
                            <select class="input-ios" id="pantallas_${plat.id}" name="ventaPantallas" style="padding: 6px; font-size:0.8rem;" disabled>
                                <option value="1" selected>1 Pantalla</option>
                                <option value="2">2 Pantallas</option>
                                <option value="3">3 Pantallas</option>
                                <option value="4">4 Pantallas</option>
                                <option value="5">5 Pantallas</option>
                            </select>
                        </div>
                    `;
    }

    let selectorDinamicoDerecho = "";
    if (plat.id === "SALDO") {
      selectorDinamicoDerecho = `
                        <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                            <span style="font-size: 0.68rem; color: #ff9500; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">Bono %</span>
                            <select class="input-ios" id="bono_${plat.id}" name="ventaBonos" style="padding: 6px; font-size:0.8rem; border-color: rgba(255,149,0,0.3);" disabled>
                                <option value="0" selected>0% Bono</option>
                                <option value="5">5% Bono</option>
                                <option value="10">10% Bono</option>
                                <option value="15">15% Bono</option>
                                <option value="20">20% Bono</option>
                                <option value="25">25% Bono</option>
                                <option value="30">30% Bono</option>
                            </select>
                        </div>
                    `;
    } else {
      selectorDinamicoDerecho = `
                        <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                            <span style="font-size: 0.68rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">Meses</span>
                            <select class="input-ios" id="meses_${plat.id}" name="ventaMeses" style="padding: 6px; font-size:0.8rem;" onchange="actualizarMesesGlobal(this.value)" disabled>
                                <option value="1" selected>1 Mes</option>
                                <option value="2">2 Meses</option>
                                <option value="3">3 Meses</option>
                                <option value="4">4 Meses</option>
                                <option value="5">5 Meses</option>
                            </select>
                        </div>
                    `;
    }

    let selectorTipo = "";
    if (plat.permiteRenovacion) {
      if (plat.id === "NETFLIX") {
        selectorTipo = `
                            <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                                <span style="font-size: 0.68rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">Tipo</span>
                                <select class="input-ios" id="tipo_${plat.id}" name="ventaTipo" style="padding: 6px; font-size:0.8rem;" onchange="comprobarTipoVentaNetflix(this, '${plat.id}')" disabled>
                                    <option value="Nueva" selected>Nueva Cuenta</option>
                                    <option value="Reno (Historial)" id="opt_historial_net" style="display: none; background: rgba(10, 132, 255, 0.2);">Reno (Elegir)</option>
                                </select>
                            </div>
                        `;
      } else {
        selectorTipo = `
                            <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                                <span style="font-size: 0.68rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">Tipo</span>
                                <select class="input-ios" id="tipo_${plat.id}" name="ventaTipo" style="padding: 6px; font-size:0.8rem;" onchange="comprobarTipoVentaNetflix(this, '${plat.id}')" disabled>
                                    <option value="Nueva" selected>Nueva</option>
                                    <option value="Reno">Reno</option>
                                </select>
                            </div>
                        `;
      }
    }

    let campoCorreoReno = "";
    if (plat.id === "NETFLIX") {
      campoCorreoReno = `
                        <div id="wrapper_correo_reno_${plat.id}" style="display: none; flex-direction: column; gap: 5px; width: 100%; margin-top: 8px;">
                            <span style="font-size: 0.68rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">Correo Seleccionado</span>
                            <input type="email" id="correo_reno_${plat.id}" class="input-ios" style="margin-bottom: 0; padding: 10px 12px; border-radius: 10px;" placeholder="ejemplo@correo.com">
                        </div>
                    `;
    }

    html += `
                    <div class="card-ios" id="card_plat_${plat.id}" data-nombre="${plat.nombre.toLowerCase()}" style="display: none; padding: 15px; gap:10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                            <label style="display: flex; align-items: center; gap: 10px; font-size: 1rem; font-weight: 700; color: var(--text-primary); cursor: pointer; user-select: none;">
                                <input type="checkbox" name="platformCheckVenta" value="${plat.id}" style="accent-color: var(--ios-blue); width: 18px; height: 18px;" onchange="comprobarDesbloqueoVentaPill(this, '${plat.id}')"> 
                                ${plat.nombre}
                            </label>
                            <span id="badge_status_${plat.id}" style="width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.15); transition: all 0.3s ease;"></span>
                        </div>
                        <div style="display: flex; gap: 10px; width: 100%;">
                            ${selectorPantallas}
                            ${selectorDinamicoDerecho}
                            ${selectorTipo}
                        </div>
                        ${campoCorreoReno}
                    </div>
                `;
  });

  contenedor.innerHTML = html;
}

function filtrarPlataformasVenta() {
  const query = document
    .getElementById("buscarPlataformaVenta")
    .value.toLowerCase()
    .trim();
  const filas = document.querySelectorAll(
    "#contenedorPlataformasVenta .card-ios",
  );

  filas.forEach((fila) => {
    const nombrePlat = fila.getAttribute("data-nombre");
    const checkbox = fila.querySelector('input[type="checkbox"]');

    if (query === "") {
      fila.style.display = checkbox.checked ? "flex" : "none";
    } else {
      if (nombrePlat.includes(query) || checkbox.checked) {
        fila.style.display = "flex";
      } else {
        fila.style.display = "none";
      }
    }
  });
}

function comprobarDesbloqueoVentaPill(checkbox, id) {
  haptic();
  const elPantallas = document.getElementById(`pantallas_${id}`);
  const elMeses = document.getElementById(`meses_${id}`);
  const elBono = document.getElementById(`bono_${id}`);
  const elTipo = document.getElementById(`tipo_${id}`);
  const card = document.getElementById(`card_plat_${id}`);
  const badge = document.getElementById(`badge_status_${id}`);

  if (checkbox.checked) {
    if (elPantallas) elPantallas.disabled = false;
    if (elMeses) {
      elMeses.disabled = false;
      // 🔥 Copia automáticamente los meses que seleccionaste en la primera plataforma
      elMeses.value = window.ultimoMesesSeleccionado || "1";
    }
    if (elBono) elBono.disabled = false;
    if (elTipo) elTipo.disabled = false;

    if (card) {
      card.style.background = "rgba(255, 255, 255, 0.06)";
      card.style.borderColor = "rgba(10, 132, 255, 0.35)";
    }
    if (badge) {
      badge.style.background = "var(--ios-blue)";
      badge.style.boxShadow = "0 0 8px var(--ios-blue)";
    }
  } else {
    if (elPantallas) {
      elPantallas.disabled = true;
      elPantallas.value = "1";
    }
    if (elMeses) {
      elMeses.disabled = true;
      elMeses.value = "1";
    }
    if (elBono) {
      elBono.disabled = true;
      elBono.value = "0";
    }
    if (elTipo) {
      elTipo.disabled = true;
      elTipo.value = "Nueva";
    }

    if (card) {
      card.style.background = "var(--glass-bg)";
      card.style.borderColor = "var(--glass-border)";
    }
    if (badge) {
      badge.style.background = "rgba(255, 255, 255, 0.15)";
      badge.style.boxShadow = "none";
    }

    const wrapperReno = document.getElementById(`wrapper_correo_reno_${id}`);
    if (wrapperReno) wrapperReno.style.display = "none";

    const query = document.getElementById("buscarPlataformaVenta").value.trim();
    if (query === "") card.style.display = "none";
  }
}

function ajustarInterfazPorMetodoPago() {
  const canalPago = document.getElementById("ventaBanco").value;
  const esOperacionRecargaSaldo = canalPago === "Saldo Distribuidor";

  listaPlataformasVenta.forEach((plat) => {
    const wrapperMeses = document.getElementById(`wrapper_meses_${plat.id}`);
    const wrapperBono = document.getElementById(`wrapper_bono_${plat.id}`);
    const checkbox = document.querySelector(
      `#card_plat_${plat.id} input[type="checkbox"]`,
    );

    if (!wrapperMeses || !wrapperBono) return;

    if (esOperacionRecargaSaldo) {
      wrapperMeses.style.display = "none";
      wrapperBono.style.display = "flex";
      if (checkbox && checkbox.checked) {
        if (document.getElementById(`bono_${plat.id}`))
          document.getElementById(`bono_${plat.id}`).disabled = false;
        if (document.getElementById(`meses_${plat.id}`))
          document.getElementById(`meses_${plat.id}`).disabled = true;
      }
    } else {
      wrapperMeses.style.display = "flex";
      wrapperBono.style.display = "none";
      if (checkbox && checkbox.checked) {
        if (document.getElementById(`meses_${plat.id}`))
          document.getElementById(`meses_${plat.id}`).disabled = false;
        if (document.getElementById(`bono_${plat.id}`))
          document.getElementById(`bono_${plat.id}`).disabled = true;
      }
    }
  });
}

window.cuentasNetflixClienteActivo = [];
let timeoutBusquedaNet = null;

function buscarHistorialNetflixEnVenta(telefono) {
  let telLimpio = telefono.replace(/\D/g, "");
  if (telLimpio.length < 8) return;

  clearTimeout(timeoutBusquedaNet);
  timeoutBusquedaNet = setTimeout(() => {
    const optHistorial = document.getElementById("opt_historial_net");
    const inputTipo = document.getElementById("tipo_NETFLIX");
    const labelWrapper = inputTipo ? inputTipo.previousElementSibling : null;

    if (optHistorial && inputTipo) {
      if (labelWrapper) labelWrapper.style.color = "var(--ios-orange)";

      const cbName = "cb_net_search_" + Date.now();
      window[cbName] = function (res) {
        if (labelWrapper) labelWrapper.style.color = "var(--text-secondary)";
        const scriptNode = document.getElementById("node_" + cbName);
        if (scriptNode) scriptNode.remove();
        delete window[cbName];

        optHistorial.style.display = "none";
        window.cuentasNetflixClienteActivo = [];

        if (inputTipo.value === "Reno (Historial)") {
          inputTipo.value = "Nueva";
          comprobarTipoVentaNetflix(inputTipo, "NETFLIX");
        }

        if (res && res.status === "success" && res.data.length > 0) {
          let cuentasFiltradas = res.data.filter((cuenta) =>
            cuenta.correo.toLowerCase().endsWith("@cybernetsp.com"),
          );

          if (cuentasFiltradas.length > 0) {
            if (labelWrapper) labelWrapper.style.color = "var(--ios-green)";
            optHistorial.style.display = "block";
            window.cuentasNetflixClienteActivo = cuentasFiltradas;
          }
        }
      };

      const script = document.createElement("script");
      script.id = "node_" + cbName;
      script.src = `${GOOGLE_SCRIPT_URL}?action=buscarRenovacionNetflix&tel=${encodeURIComponent(telLimpio)}&callback=${cbName}&_ts=${Date.now()}`;
      document.body.appendChild(script);
    }
  }, 800);
}

function comprobarTipoVentaNetflix(element, id) {
  if (id === "NETFLIX") {
    const wrapperCorreo = document.getElementById(`wrapper_correo_reno_${id}`);
    const inputReno = document.getElementById(`correo_reno_${id}`);

    let val = element.value;

    if (val === "Reno (Manual)") {
      if (wrapperCorreo) wrapperCorreo.style.display = "flex";
      if (inputReno) {
        inputReno.required = true;
        inputReno.value = "";
        inputReno.readOnly = false;
        inputReno.focus();
      }
    } else if (val === "Reno (Historial)") {
      if (wrapperCorreo) wrapperCorreo.style.display = "flex";
      if (inputReno) {
        inputReno.required = true;
        inputReno.readOnly = true;
      }
      abrirModalRenovacionNet();
    } else {
      if (wrapperCorreo) wrapperCorreo.style.display = "none";
      if (inputReno) {
        inputReno.required = false;
        inputReno.value = "";
        inputReno.readOnly = false;
      }
    }
  }
}

function abrirModalRenovacionNet() {
  haptic();
  const modal = document.getElementById("modalRenovacionFlotante");
  const contenedor = document.getElementById("listaCuentasModalReno");
  const buscador = document.getElementById("buscadorModalReno");

  buscador.value = "";
  contenedor.innerHTML = "";

  window.cuentasNetflixClienteActivo.forEach((cuenta) => {
    let div = document.createElement("div");
    div.className = "card-ios item-reno-modal";
    div.style.padding = "15px";
    div.style.cursor = "pointer";
    div.style.background = "var(--glass-bg)";
    div.setAttribute(
      "data-search",
      cuenta.correo.toLowerCase() +
        " " +
        cuenta.perfil.toLowerCase() +
        " " +
        cuenta.cliente.toLowerCase(),
    );

    div.innerHTML = `
                    <div style="color: var(--text-primary); font-weight: 700; font-size: 1rem; margin-bottom: 6px;">
                        ${cuenta.correo}
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary);">
                        <span>Perfil: <b style="color: var(--ios-blue);">${cuenta.perfil}</b></span>
                        <span>Cliente: <b>${cuenta.cliente}</b></span>
                    </div>
                `;

    div.onclick = function () {
      seleccionarCuentaModalNet(cuenta.correo, cuenta.perfil, cuenta.cliente);
    };
    contenedor.appendChild(div);
  });

  modal.classList.add("open");
  buscador.focus();
}

function cerrarModalRenovacionNet() {
  haptic();
  document.getElementById("modalRenovacionFlotante").classList.remove("open");

  const inputReno = document.getElementById("correo_reno_NETFLIX");
  if (inputReno && inputReno.value === "") {
    const inputTipo = document.getElementById("tipo_NETFLIX");
    if (inputTipo) {
      inputTipo.value = "Nueva";
      comprobarTipoVentaNetflix(inputTipo, "NETFLIX");
    }
  }
}

function seleccionarCuentaModalNet(correo, perfil, cliente) {
  haptic();
  const inputReno = document.getElementById("correo_reno_NETFLIX");
  const inputNombre = document.getElementById("ventaNombre");

  if (inputReno) {
    inputReno.value = correo + " | Perfil: " + perfil;
  }
  if (inputNombre && inputNombre.value.trim() === "" && cliente !== "N/A") {
    inputNombre.value = cliente;
  }

  document.getElementById("modalRenovacionFlotante").classList.remove("open");
}

function filtrarModalRenovacionNet() {
  const query = document
    .getElementById("buscadorModalReno")
    .value.toLowerCase()
    .trim();
  const items = document.querySelectorAll(".item-reno-modal");

  items.forEach((item) => {
    const searchData = item.getAttribute("data-search");
    if (searchData.includes(query)) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
}

function formatearMontoEnVivoCOP(input) {
  let valor = input.value.replace(/\D/g, "");

  if (valor === "") {
    input.value = "";
    return;
  }

  valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  input.value = "$" + valor;
}

window.textoSaldoRevendedorGlobal = "";

function ejecutarCreacionVentaLocal(e) {
  e.preventDefault();
  haptic();

  const nombre = document.getElementById("ventaNombre").value.trim();
  const telefono = document
    .getElementById("ventaTelefono")
    .value.replace(/\s+/g, "")
    .trim();
  const cantidadRaw = document
    .getElementById("ventaCantidad")
    .value.replace(/\D/g, "");
  const cantidad = parseFloat(cantidadRaw) || 0;
  const banco = document.getElementById("ventaBanco").value;

  const recargaSaldoChequeada = document.querySelector(
    'input[name="platformCheckVenta"][value="SALDO"]',
  )?.checked;

  const btnSubmit = document.querySelector(
    '#formGenerarVenta button[type="submit"]',
  );

  // 💼 CASO A: RECARGA DE SALDO DISTRIBUIDOR
  if (recargaSaldoChequeada) {
    const bonoElegido = document.getElementById("bono_SALDO").value;

    let avisoRecarga =
      `❓ ¿CONFIRMAR INYECCIÓN DE SALDO? 💼\n\n` +
      `👤 Distribuidor: ${nombre || telefono}\n` +
      `🏦 Cuenta Origen: ${banco}\n` +
      `💰 Monto Recarga: $${cantidad.toLocaleString("es-CO")}\n` +
      `🎁 Bono Aplicado: ${bonoElegido}%\n\n` +
      `¿Estás seguro de que los datos son correctos?`;

    if (!confirm(avisoRecarga)) return;

    // Deshabilitamos el botón y ponemos el spinner de carga en la misma ventana
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Inyectando saldo...`;

    const callbackName = "cb_recarga_" + Date.now();
    window[callbackName] = function (res) {
      btnSubmit.disabled = false;
      btnSubmit.innerText = "REGISTRAR VENTA COMPLETA";

      const scriptNode = document.getElementById("node_" + callbackName);
      if (scriptNode) scriptNode.remove();
      delete window[callbackName];

      if (res && res.status === "success") {
        let Richmond = `🔔 *NOTIFICACIÓN DE RECARGA CYBERNET* 🚀\n────────────────────\n👤 *Distribuidor:* ${res.revendedor}\n💰 *Monto Inyectado:* $${Math.round(res.recargadoBase).toLocaleString("es-CO")}\n🎁 *Bono Otorgado:* ${res.bonoAplicado}%\n📈 *Saldo de Regalo:* +$${Math.round(res.regaloAdicional).toLocaleString("es-CO")}\n💵 *Nuevo Saldo Total:* $${Math.round(res.nuevoSaldo).toLocaleString("es-CO")}\n────────────────────\n✨ _¡Tu saldo acumulado ya se encuentra disponible para compras!_`;

        // =========================================================================
        // 🔥 SOLUCIÓN AQUÍ: Sincronizamos la variable global y mostramos el botón
        // =========================================================================
        window.textoSaldoRevendedorGlobal = Richmond;
        let btnSaldo = document.getElementById("btnCopiarSaldoRevendedor");
        if (btnSaldo) btnSaldo.style.display = "flex";
        // =========================================================================

        // Solo ahora que fue exitoso, cerramos y abrimos la ficha
        document.getElementById("ventasOverlay").classList.remove("open");
        document.getElementById("outputTextoVentaFicha").value = Richmond;
        document
          .getElementById("ventaGeneradaModalOverlay")
          .classList.add("open");
        document.getElementById("formGenerarVenta").reset();
        cargarResumenProveedores();
      } else {
        alert("❌ Error: " + (res ? res.message : "Fallo al inyectar saldo."));
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + callbackName;
    script.src = `${GOOGLE_SCRIPT_URL}?action=recargarSaldo&revendedor=${encodeURIComponent(telefono !== "" ? telefono : nombre)}&totalRecarga=${encodeURIComponent(cantidad)}&bono=${encodeURIComponent(bonoElegido)}&banco=${encodeURIComponent(banco)}&callback=${callbackName}`;
    document.body.appendChild(script);
    return;
  }

  // 🎬 CASO B: VENTAS DE PANTALLAS TRADICIONALES
  const checkboxes = document.getElementsByName("platformCheckVenta");
  let plataformasAdquiridas = false;
  let descripcionSheetsArray = [];
  let resumenConfirmarArray = [];
  let correoNetflixReno = "";
  let esR = false;
  let memoriaMeses = {};

  for (let i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      plataformasAdquiridas = true;
      const idPlat = checkboxes[i].value;

      let numPantallas = document.getElementById(`pantallas_${idPlat}`)
        ? document.getElementById(`pantallas_${idPlat}`).value
        : "1";
      let numMeses = document.getElementById(`meses_${idPlat}`)
        ? document.getElementById(`meses_${idPlat}`).value
        : "1";
      let elTipo = document.getElementById(`tipo_${idPlat}`)
        ? document.getElementById(`tipo_${idPlat}`).value
        : "Nueva";

      let esRenovacionActiva =
        elTipo === "Reno (Manual)" || elTipo === "Reno (Historial)";
      let prefixSheets = esRenovacionActiva ? "RENO: " : "";
      if (esRenovacionActiva) esR = true;

      if (idPlat === "NETFLIX" && esRenovacionActiva) {
        const inputReno = document.getElementById(`correo_reno_${idPlat}`);
        if (inputReno && inputReno.value.trim() !== "") {
          correoNetflixReno = inputReno.value.trim();
        } else {
          alert(
            "⚠️ Error: Por favor toca una de las cuentas del historial para renovarla, o escríbela en modo Manual.",
          );
          return;
        }
      }

      memoriaMeses[idPlat] = numMeses;
      let platNombreScript =
        idPlat === "AMAZON" ? "AMAZON-PRIME-VIDEO" : idPlat;
      descripcionSheetsArray.push(
        `${prefixSheets}${numPantallas} ${platNombreScript}`,
      );
      resumenConfirmarArray.push(
        `    •  ${numPantallas}x ${platNombreScript} ➔ [${numMeses} Mes(es) / ${elTipo}]`,
      );
    }
  }

  if (!plataformasAdquiridas) {
    alert("⚠️ Selecciona al menos una plataforma para registrar la venta.");
    return;
  }

  const descripcionFinalSheets = descripcionSheetsArray.join(" + ");

  let mensajeVenta =
    `❓ ¿CONFIRMAR REGISTRO DE VENTA? 🍿\n` +
    `────────────────────────────\n` +
    `👤 Cliente: ${nombre || "No especificado"}\n` +
    `📞 Celular: ${telefono}\n` +
    `🏦 Recibe: ${banco}\n` +
    `💰 Valor Cobrado: $${cantidad.toLocaleString("es-CO")}\n\n` +
    `📺 Cuentas a entregar:\n` +
    resumenConfirmarArray.join("\n") +
    `\n` +
    `────────────────────────────\n` +
    `¿Estás seguro de que los datos ingresados son correctos?`;

  if (!confirm(mensajeVenta)) return;

  // Cambiamos el estado del botón en la misma ventana sin cerrarla
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Conectando con Sheets...`;

  const callbackName = "cb_venta_" + Date.now();
  window[callbackName] = function (res) {
    btnSubmit.disabled = false;
    btnSubmit.innerText = "REGISTRAR VENTA COMPLETA";

    const scriptNode = document.getElementById("node_" + callbackName);
    if (scriptNode) scriptNode.remove();
    delete window[callbackName];

    if (res && res.status === "success") {
      let bloques = res.bloques || [];
      blocks = bloques.sort((a, b) => {
        if (a.id === "NETFLIX") return -1;
        if (b.id === "NETFLIX") return 1;
        return 0;
      });

      const nombreCliente = nombre !== "" ? nombre : "";
      let intro = `🌟 *¡Hola ${nombreCliente}!*\n\n`;
      intro += esR
        ? `Tu servicio ha sido *RENOVADO* con éxito. Mantienes tus mismos accesos:`
        : `Tu pedido ha sido procesado con éxito. Aquí tienes tus accesos:`;

      let cuerpo = "";
      bloques.forEach((b) => {
        let etiquetaUser = b.id === "IPTV" ? "Usuario" : "Correo";
        let etiquetaPerfil = b.id === "IPTV" ? "URL" : "Perfil";
        let mesesComprados = memoriaMeses[b.id] || "1";
        let textoMeses = mesesComprados > 1 ? ` (${mesesComprados} Meses)` : "";

        cuerpo += `\n\n🎬 *DETALLES DE ${b.id.replace(/-/g, " ").toUpperCase()}*${textoMeses} ✅\n────────────────────\n👤 *${etiquetaUser}:* ${b.correo}\n🔐 *Contraseña:* ${b.clave}\n`;
        if (
          b.id === "IPTV" ||
          (b.perfil && b.perfil !== "" && b.perfil !== "N/A")
        )
          cuerpo += `🌐 *${etiquetaPerfil}:* ${b.perfil}\n`;
        if (b.pin && b.pin !== "") cuerpo += `📍 *Pin:* ${b.pin}\n`;
        cuerpo += `📅 *Vence:* ${b.venc}\n`;

        if (b.id === "NETFLIX") {
          cuerpo += `🤖 *¿NECESITAS CÓDIGO DE ACCESO?*\nObtenlo al instante de forma automática 24/7 sin esperar soporte ingresando a nuestra web:\n🌐 https://www.cybernetsp.com/\n`;
        }
      });

      let soporte = `\n\n📢 *INFORMACIÓN IMPORTANTE:* \n────────────────────\n⚠️ *Garantía activa:* Tu servicio cuenta con respaldo total durante su vigencia. \n🆘 *Soporte:* Si presentas algún inconveniente, *infórmanos de inmediato* para brindarte una solución rápida.`;
      const mensajeFinalFicha =
        intro +
        cuerpo +
        soporte +
        `\n\n💎 *Disfruta tu servicio.*\n✨ *¡Gracias por elegirnos!* ✨`;

      let btnSaldo = document.getElementById("btnCopiarSaldoRevendedor");
      if (res.esRevendedor) {
        let montoDescontado = res.valorCobrado || 0;
        let distribuidorNombre = res.nombreRevendedor || telefono;
        window.textoSaldoRevendedorGlobal = `🔔 *NOTIFICACIÓN DE SALDO CYBERNET* 🚀\n────────────────────\n👤 *Distribuidor:* ${distribuidorNombre}\n📉 *Débito por compra:* -$${Math.round(montoDescontado).toLocaleString("es-CO")}\n💰 *Saldo Disponible:* $${Math.round(res.saldoQuedante).toLocaleString("es-CO")}\n────────────────────\n✨ _¡Gracias por tu compra mayorista en Cybernet!_`;
        if (btnSaldo) btnSaldo.style.display = "flex";
      } else {
        window.textoSaldoRevendedorGlobal = "";
        if (btnSaldo) btnSaldo.style.display = "none";
      }

      document.getElementById("ventasOverlay").classList.remove("open");
      document.getElementById("outputTextoVentaFicha").value =
        mensajeFinalFicha;
      document
        .getElementById("ventaGeneradaModalOverlay")
        .classList.add("open");

      document.getElementById("formGenerarVenta").reset();
      const checksABorrar = document.getElementsByName("platformCheckVenta");
      for (let c = 0; c < checksABorrar.length; c++) {
        checksABorrar[c].checked = false;
        comprobarDesbloqueoVentaPill(checksABorrar[c], checksABorrar[c].value);
      }
      if (document.getElementById("buscarPlataformaVenta"))
        document.getElementById("buscarPlataformaVenta").value = "";

      if (res.alertasStock && res.alertasStock.length > 0) {
        let avisoTexto =
          "⚠️ ¡ALERTA DE INVENTARIO CRÍTICO! ⚠️\n───────────────────────────\n";
        res.alertasStock.forEach((a) => {
          avisoTexto += `🚨 Plataforma: ${a.plat} ➔ ¡Solo quedan ${a.cant} perfiles libres!\n`;
        });
        setTimeout(() => {
          alert(avisoTexto);
        }, 600);
      }
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de comunicación."));
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + callbackName;
  const mesesParam = encodeURIComponent(JSON.stringify(memoriaMeses));
  script.src = `${GOOGLE_SCRIPT_URL}?action=registrarVentaDirectaV13&nombre=${encodeURIComponent(nombre)}&telefono=${encodeURIComponent(telefono)}&descripcion=${encodeURIComponent(descripcionFinalSheets)}&correoReno=${encodeURIComponent(correoNetflixReno)}&cantidad=${encodeURIComponent(cantidad)}&banco=${encodeURIComponent(banco)}&meses=${mesesParam}&callback=${callbackName}`;
  document.body.appendChild(script);
}

function copiarTextoSaldoRevendedorDefinitiva() {
  haptic();
  const btn = document.getElementById("btnCopiarSaldoRevendedor");
  navigator.clipboard
    .writeText(window.textoSaldoRevendedorGlobal)
    .then(function () {
      const originalText = btn.innerHTML;
      btn.innerHTML = "¡SALDO COPIADO CON ÉXITO!";
      btn.style.background = "var(--ios-green)";

      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Saldo copiado</span></div>`,
      );

      setTimeout(function () {
        btn.innerHTML = originalText;
        btn.style.background =
          "linear-gradient(135deg, #ff9500 0%, #ff5e00 100%)";
      }, 1500);
    });
}

function copiarTextoFichaVentaDefinitiva() {
  haptic();
  const texto = document.getElementById("outputTextoVentaFicha").value;
  const btn = document.getElementById("btnCopiarFichaVenta");

  navigator.clipboard
    .writeText(texto)
    .then(function () {
      const originalText = btn.innerHTML;
      btn.innerHTML = "¡FICHA COPIADA!";
      btn.style.background = "var(--ios-green)";

      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Ficha enviada al portapapeles</span></div>`,
      );

      setTimeout(function () {
        btn.innerHTML = originalText;
        btn.style.background = "";
      }, 1500);
    })
    .catch(function () {
      const textarea = document.createElement("textarea");
      textarea.value = texto;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();

      const originalText = btn.innerHTML;
      btn.innerHTML = "¡FICHA COPIADA!";
      btn.style.background = "var(--ios-green)";

      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Ficha enviada al portapapeles</span></div>`,
      );

      setTimeout(function () {
        btn.innerHTML = originalText;
        btn.style.background = "";
      }, 1500);
    });
}

function cerrarModalVentaGenerada() {
  haptic();
  document.getElementById("ventaGeneradaModalOverlay").classList.remove("open");
}

function actualizarBadgeGarantias() {
  const oldScript = document.getElementById("cyber_badge_garantias_node");
  if (oldScript) oldScript.remove();

  window.procesarBadgeGarantias = function (res) {
    const scriptNode = document.getElementById("cyber_badge_garantias_node");
    if (scriptNode) scriptNode.remove();

    let badge = document.getElementById("badgeGarantiasCount");

    if (res && res.status === "success" && badge) {
      const count = res.data.length;
      if (count > 0) {
        badge.innerText = count;
        badge.style.display = "flex";
      } else {
        badge.style.display = "none";
      }
    }
    delete window.procesarBadgeGarantias;
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_badge_garantias_node";
  scriptElement.src =
    GOOGLE_SCRIPT_URL +
    "?action=obtenerGarantias&callback=procesarBadgeGarantias&_ts=" +
    Date.now();
  document.body.appendChild(scriptElement);
}

function toggleTheme() {
  haptic();
  const currentTheme = document.documentElement.getAttribute("data-theme");
  let newTheme = "";

  if (currentTheme === "light") {
    newTheme = "dark";
  } else {
    newTheme = "light";
  }

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("cyber_theme", newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  // Mantenido por si decides agregar el botón de tema luego
}

function toggleSearchAccountPanel() {
  haptic();
  const overlay = document.getElementById("searchAccountOverlay");
  overlay.classList.toggle("open");
  if (overlay.classList.contains("open")) {
    document.getElementById("inputSearchAccount").focus();
  }
}

function ejecutarBusquedaCuentas() {
  haptic();
  const query = document.getElementById("inputSearchAccount").value.trim();
  const container = document.getElementById("searchAccountScrollArea");

  if (query === "") {
    container.innerHTML =
      '<div style="text-align:center; padding:30px; color:var(--text-secondary); font-size:0.9rem;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><br>Por favor ingresa un número celular o nombre para buscar.</div>';
    return;
  }

  container.innerHTML =
    '<div style="text-align:center; padding:30px; color:var(--ios-blue); font-size:0.9rem;"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg><br>Escaneando base de datos de 18 plataformas en vivo...</div>';

  const oldScript = document.getElementById("cyber_search_node");
  if (oldScript) {
    oldScript.remove();
  }

  window.procesarBusquedaCuentasSheets = function (res) {
    const scriptNode = document.getElementById("cyber_search_node");
    if (scriptNode) scriptNode.remove();

    const container = document.getElementById("searchAccountScrollArea");

    if (res && res.status === "success") {
      window.currentSearchStock = res.data;
      const data = res.data;

      if (data.length === 0) {
        const query = document
          .getElementById("inputSearchAccount")
          .value.trim();
        container.innerHTML =
          '<div style="text-align:center; padding:30px; color:var(--text-secondary); font-weight:600; line-height:1.4;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg><br>No se encontraron cuentas activas asociadas a "' +
          query +
          '".</div>';
        return;
      }

      let htmlCards = "";
      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        htmlCards += `
                          <div class="card-ios mb-1" style="padding: 15px; gap: 8px;">
                              <div class="flex-row-between" style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
                                  <span style="color:var(--ios-blue); font-weight:700; font-size:0.9rem; text-transform: uppercase;">${item.plataforma}</span>
                                  
                                  <span style="color:var(--text-secondary); font-size:0.8rem; display:flex; align-items:center; gap:6px;">
                                      Vence: <b style="color:var(--text-primary);">${item.vencimiento}</b>
                                      <button type="button" style="background:rgba(10,132,255,0.15); color:var(--ios-blue); border:none; border-radius:6px; padding:2px 8px; font-size:0.8rem; cursor:pointer;" onclick="window.abrirModalEditarVencimiento('${item.plataforma}', '${item.correo}', '${item.vencimiento}')">✎</button>
                                  </span>
                              </div>
                              <div style="font-size:0.85rem; color:var(--text-secondary);">Cliente: <span style="color:var(--text-primary); font-weight:600;">${item.cliente}</span></div>
                              <div style="font-size:0.85rem; color:var(--text-secondary);">Teléfono: <span style="color:var(--text-primary); font-weight:600;">${item.telefono}</span></div>
                              
                              <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:6px;">Correo: <span style="color:var(--ios-green); font-weight:700; user-select:all; cursor:pointer;" title="Clic para copiar solo el correo" onclick="copiarDatoAislado(this, '${item.correo}')">${item.correo}</span></div>
                              
                              <div style="font-size:0.85rem; color:var(--text-secondary);">Clave: <span style="color:var(--ios-red); font-weight:700; user-select:all; cursor:pointer;" title="Clic para copiar solo la clave" onclick="copiarDatoAislado(this, '${item.clave}')">${item.clave}</span></div>
                              
                              <div style="font-size:0.85rem; color:var(--text-secondary);">Perfil: <span style="color:var(--text-primary); font-weight:700;">${item.perfil}</span> | PIN: <span style="color:var(--text-primary); font-weight:700;">${item.pin}</span></div>
                              
                              <button class="btn-ios btn-secondary mt-1 w-100" style="display:flex; align-items:center; justify-content:center; gap:6px;" onclick="copiarCuentaCompleta(this, ${i})">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                COPIAR DATOS
                              </button>
                          </div>
                        `;
      }
      container.innerHTML = htmlCards;
    } else {
      let errMsg = "Error al buscar cuentas en el sistema.";
      if (res && res.message) errMsg = res.message;
      container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--ios-red); font-weight:600; line-height:1.4;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg><br>${errMsg}</div>`;
    }
  };

  // 🔥 FUNCIONES LÓGICAS GLOBALES DEL LÁPIZ 🔥
  window.abrirModalEditarVencimiento = function (plat, correo, vencActual) {
    haptic();
    var modal = document.getElementById("editVencOverlay");
    if (!modal) {
      alert("⚠️ Error: No se encontró la ventana del Lápiz. Revisa el Paso 1.");
      return;
    }
    document.getElementById("editVencPlataforma").value = plat;
    document.getElementById("editVencCorreo").value = correo;
    document.getElementById("editVencDisplay").value = plat + " ➔ " + correo;
    document.getElementById("editVencNuevo").value = vencActual;
    modal.classList.add("open");
    document.getElementById("editVencNuevo").focus();
  };

  window.ejecutarEdicionVencimiento = function (e) {
    e.preventDefault();
    haptic();
    const btn = document.getElementById("btnSubmitEditVenc");
    const plat = document.getElementById("editVencPlataforma").value;
    const correo = document.getElementById("editVencCorreo").value;
    const nuevoVenc = document.getElementById("editVencNuevo").value.trim();

    btn.disabled = true;
    btn.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Actualizando...`;

    const cbName = "cb_edit_venc_" + Date.now();
    window[cbName] = function (res) {
      btn.disabled = false;
      btn.innerHTML = "Guardar Corrección";
      const node = document.getElementById("node_" + cbName);
      if (node) node.remove();
      delete window[cbName];

      if (res && res.status === "success") {
        document.getElementById("editVencOverlay").classList.remove("open");

        const d = res.data;
        let perfilTexto = d.perfil ? `\n🌐 *Perfil:* ${d.perfil}` : "";
        let pinTexto = d.pin ? `\n📍 *Pin:* ${d.pin}` : "";

        // 🔥 FICHA ELEGANTE 🔥
        let ficha = `🌟 *¡Hola! El tiempo de tu cuenta ha sido actualizado.*\n\n🎬 *DETALLES DE ${d.plataforma}* ✅\n────────────────────\n👤 *Correo:* ${d.correo}\n🔐 *Contraseña:* ${d.clave}${perfilTexto}${pinTexto}\n📅 *Nuevo Vencimiento:* ${d.vencimiento}\n────────────────────\n✨ _¡Disfruta tu servicio!_`;

        let btnSaldo = document.getElementById("btnCopiarSaldoRevendedor");
        if (btnSaldo) btnSaldo.style.display = "none";

        document.getElementById("outputTextoVentaFicha").value = ficha;
        const modalExito = document.getElementById("ventaGeneradaModalOverlay");
        modalExito.querySelector(".card-title").innerText =
          "Tiempo Actualizado";
        document.getElementById("btnCopiarFichaVenta").innerHTML =
          `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar Ficha de Actualización`;

        modalExito.classList.add("open");
        ejecutarBusquedaCuentas();
      } else {
        alert("❌ Error: " + (res ? res.message : "Fallo de conexión"));
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbName;
    script.src = `${GOOGLE_SCRIPT_URL}?action=editarVencimiento&plataforma=${encodeURIComponent(plat)}&correo=${encodeURIComponent(correo)}&nuevoVencimiento=${encodeURIComponent(nuevoVenc)}&callback=${cbName}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  };

  // Funciones Lógicas del Lápiz
  function abrirModalEditarVencimiento(plat, correo, vencActual) {
    haptic();
    document.getElementById("editVencPlataforma").value = plat;
    document.getElementById("editVencCorreo").value = correo;
    document.getElementById("editVencDisplay").value = plat + " ➔ " + correo;
    document.getElementById("editVencNuevo").value = vencActual;
    document.getElementById("editVencOverlay").classList.add("open");
    document.getElementById("editVencNuevo").focus();
  }

  function ejecutarEdicionVencimiento(e) {
    e.preventDefault();
    haptic();
    const btn = document.getElementById("btnSubmitEditVenc");
    const plat = document.getElementById("editVencPlataforma").value;
    const correo = document.getElementById("editVencCorreo").value;
    const nuevoVenc = document.getElementById("editVencNuevo").value.trim();

    btn.disabled = true;
    btn.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Actualizando...`;

    const cbName = "cb_edit_venc_" + Date.now();
    window[cbName] = function (res) {
      btn.disabled = false;
      btn.innerHTML = "Guardar Corrección";
      const node = document.getElementById("node_" + cbName);
      if (node) node.remove();
      delete window[cbName];

      if (res && res.status === "success") {
        document.getElementById("editVencOverlay").classList.remove("open");

        const d = res.data;
        let perfilTexto = d.perfil ? `\n🌐 *Perfil:* ${d.perfil}` : "";
        let pinTexto = d.pin ? `\n📍 *Pin:* ${d.pin}` : "";

        // 🔥 SE ARMA LA FICHA ELEGANTE ESTILO VENTA 🔥
        let ficha = `🌟 *¡Hola! El tiempo de tu cuenta ha sido actualizado.*\n\n🎬 *DETALLES DE ${d.plataforma}* ✅\n────────────────────\n👤 *Correo:* ${d.correo}\n🔐 *Contraseña:* ${d.clave}${perfilTexto}${pinTexto}\n📅 *Nuevo Vencimiento:* ${d.vencimiento}\n────────────────────\n✨ _¡Disfruta tu servicio!_`;

        // Se oculta el botón de saldo porque esto es una edición, no una venta nueva
        let btnSaldo = document.getElementById("btnCopiarSaldoRevendedor");
        if (btnSaldo) btnSaldo.style.display = "none";

        // Lanzamos la ventana de Ficha
        document.getElementById("outputTextoVentaFicha").value = ficha;
        const modalExito = document.getElementById("ventaGeneradaModalOverlay");
        modalExito.querySelector(".card-title").innerText =
          "Tiempo Actualizado";
        document.getElementById("btnCopiarFichaVenta").innerHTML =
          `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar Ficha de Actualización`;

        modalExito.classList.add("open");
        ejecutarBusquedaCuentas(); // Refresca la tabla de atrás para que veas el mes nuevo
      } else {
        alert("❌ Error: " + (res ? res.message : "Fallo de conexión"));
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbName;
    script.src = `${GOOGLE_SCRIPT_URL}?action=editarVencimiento&plataforma=${encodeURIComponent(plat)}&correo=${encodeURIComponent(correo)}&nuevoVencimiento=${encodeURIComponent(nuevoVenc)}&callback=${cbName}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  }

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_search_node";
  let queryParams =
    "?action=buscarCuentaGlobal&query=" +
    encodeURIComponent(query) +
    "&callback=procesarBusquedaCuentasSheets&_ts=" +
    Date.now();
  scriptElement.src = GOOGLE_SCRIPT_URL + queryParams;
  document.body.appendChild(scriptElement);
}

function copiarDatoAislado(elemento, texto) {
  haptic();
  navigator.clipboard
    .writeText(texto)
    .then(function () {
      let originalText = elemento.innerText;
      elemento.innerText = "¡COPIADO!";
      elemento.style.opacity = "0.7";
      setTimeout(function () {
        elemento.innerText = originalText;
        elemento.style.opacity = "1";
      }, 1000);
    })
    .catch(function () {
      const textarea = document.createElement("textarea");
      textarea.value = texto;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();

      let originalText = elemento.innerText;
      elemento.innerText = "¡COPIADO!";
      elemento.style.opacity = "0.7";
      setTimeout(function () {
        elemento.innerText = originalText;
        elemento.style.opacity = "1";
      }, 1000);
    });
}

function copiarCuentaCompleta(btn, index) {
  haptic();
  let item = window.currentSearchStock[index];
  if (!item) return;

  let textoCompleto = `📺 Plataforma: ${item.plataforma}\n👤 Cliente: ${item.cliente}\n📱 Teléfono: ${item.telefono}\n\n📧 Correo: ${item.correo}\n🔑 Clave: ${item.clave}\n👤 Perfil: ${item.perfil} | 📌 PIN: ${item.pin}\n⌛ Vence: ${item.vencimiento}`;

  navigator.clipboard
    .writeText(textoCompleto)
    .then(function () {
      let originalText = btn.innerHTML;
      btn.innerHTML = "¡COPIADO CON ÉXITO!";
      btn.style.background = "var(--ios-green)";
      btn.style.color = "white";
      btn.style.borderColor = "transparent";

      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Datos copiados</span></div>`,
      );

      setTimeout(function () {
        btn.innerHTML = originalText;
        btn.style.background = "";
        btn.style.color = "";
        btn.style.borderColor = "";
      }, 1500);
    })
    .catch(function () {
      const textarea = document.createElement("textarea");
      textarea.value = textoCompleto;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();

      let originalText = btn.innerHTML;
      btn.innerHTML = "¡COPIADO CON ÉXITO!";
      btn.style.background = "var(--ios-green)";
      btn.style.color = "white";
      btn.style.borderColor = "transparent";

      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Datos copiados</span></div>`,
      );

      setTimeout(function () {
        btn.innerHTML = originalText;
        btn.style.background = "";
        btn.style.color = "";
        btn.style.borderColor = "";
      }, 1500);
    });
}

// =========================================================================
// MÓDULO DE TURNOS: APERTURA Y GESTIÓN DE EDICIONES
// =========================================================================
function toggleShiftsPanel() {
  haptic();
  const overlay = document.getElementById("shiftsOverlay");
  overlay.classList.toggle("open");

  if (overlay.classList.contains("open")) {
    document.getElementById("searchShiftsInput").value = "";
    document.getElementById("formularioIngresoHoras").style.display = "none";

    const userActivo = sessionStorage.getItem("active_staff") || "";
    const inpVendedor = document.getElementById("inputVendedorShift");

    if (userActivo.toUpperCase() === "CAMILO") {
      inpVendedor.disabled = false;
      inpVendedor.value = "";
    } else {
      inpVendedor.disabled = true;
      inpVendedor.value = userActivo.toUpperCase();
    }

    document.getElementById("inputFechaShift").valueAsDate = new Date();

    if (window.currentHorasStock && window.currentHorasStock.length > 0) {
      renderizarHorasEnPantalla("");
      cargarHorasDesdeSheets();
    } else {
      forzarRefrescoDeHoras();
    }
  }
}

function toggleFormularioHoras() {
  haptic();
  const form = document.getElementById("formularioIngresoHoras");
  if (form.style.display === "none") {
    form.style.display = "flex";
    document.getElementById("inputHorasShift").focus();
  } else {
    form.style.display = "none";
  }
}

function ejecutarGuardadoHorasManual() {
  haptic();
  const vendedor = document
    .getElementById("inputVendedorShift")
    .value.toUpperCase()
    .trim();
  let horasStr = document.getElementById("inputHorasShift").value.trim();
  const fechaInput = document.getElementById("inputFechaShift").value;

  if (!vendedor || !horasStr || !fechaInput) {
    triggerToast(
      `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-orange);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> <span>Completa todos los campos.</span></div>`,
    );
    return;
  }

  if (!horasStr.includes(":")) {
    horasStr = horasStr + ":00:00";
  } else if (horasStr.split(":").length === 2) {
    horasStr = horasStr + ":00";
  }

  const btn = document.getElementById("btnGuardarShiftManual");
  btn.disabled = true;
  btn.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Guardando...`;

  const partsF = fechaInput.split("-");
  const fechaObj = new Date(partsF[0], partsF[1] - 1, partsF[2], 12, 0, 0);
  const fechaSheets =
    String(fechaObj.getDate()).padStart(2, "0") +
    "/" +
    String(fechaObj.getMonth() + 1).padStart(2, "0") +
    "/" +
    fechaObj.getFullYear() +
    " 12:00 PM";

  let paramObj = {
    action: "notificarCorreo",
    user: vendedor + " (Ingreso Manual)",
    tipo: "cierre",
    tiempoTrabajado: horasStr,
  };

  fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paramObj),
  })
    .then(function () {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Las horas se han ingresado correctamente.</span></div>`,
      );
      btn.disabled = false;
      btn.innerText = "Guardar Horas en Sheets";
      document.getElementById("inputHorasShift").value = "";
      document.getElementById("formularioIngresoHoras").style.display = "none";
      forzarRefrescoDeHoras();
    })
    .catch(function (e) {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-red);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> <span>Ocurrió un error. Verifica tu conexión.</span></div>`,
      );
      btn.disabled = false;
      btn.innerText = "Guardar Horas en Sheets";
    });
}

function abrirEdicionHoras(
  vendedor,
  fechaDisplay,
  fechaReal,
  horasActuales,
  filasStr,
) {
  haptic();
  document.getElementById("editShiftFilas").value = filasStr;
  document.getElementById("editShiftVendedor").value = vendedor;
  document.getElementById("editShiftFechaReal").value = fechaReal;

  document.getElementById("editShiftDisplayInfo").value =
    vendedor + " | " + fechaDisplay;
  document.getElementById("editShiftInputHoras").value = horasActuales;

  document.getElementById("editShiftModalOverlay").classList.add("open");
  document.getElementById("editShiftInputHoras").focus();
}

function cerrarEdicionHoras() {
  haptic();
  document.getElementById("editShiftModalOverlay").classList.remove("open");
  document.getElementById("editShiftForm").reset();
}

function ejecutarEdicionHoras(e) {
  e.preventDefault();
  haptic();

  const btnSubmit = document.getElementById("btnSubmitEditShift");
  let filasStr = document.getElementById("editShiftFilas").value;
  let vendedor = document.getElementById("editShiftVendedor").value;
  let fechaReal = document.getElementById("editShiftFechaReal").value;
  let nuevasHoras = document.getElementById("editShiftInputHoras").value.trim();

  if (!nuevasHoras.includes(":")) {
    nuevasHoras = nuevasHoras + ":00:00";
  } else if (nuevasHoras.split(":").length === 2) {
    nuevasHoras = nuevasHoras + ":00";
  }

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Guardando...`;

  const oldScript = document.getElementById("cyber_edit_shift_node");
  if (oldScript) oldScript.remove();

  window.procesarEdicionSheets = function (res) {
    btnSubmit.disabled = false;
    btnSubmit.innerText = "Guardar Nueva Hora";

    const scriptNode = document.getElementById("cyber_edit_shift_node");
    if (scriptNode) scriptNode.remove();

    if (res && res.status === "success") {
      cerrarEdicionHoras();
      forzarRefrescoDeHoras();
    } else {
      let errMsg = "No se pudo editar el turno.";
      if (res && res.message) errMsg = res.message;
      alert("❌ Error: " + errMsg);
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_edit_shift_node";
  let queryParams =
    "?action=editarTurnoGlobal&filas=" +
    encodeURIComponent(filasStr) +
    "&vendedor=" +
    encodeURIComponent(vendedor) +
    "&fecha=" +
    encodeURIComponent(fechaReal) +
    "&nuevasHoras=" +
    encodeURIComponent(nuevasHoras) +
    "&callback=procesarEdicionSheets&_ts=" +
    Date.now();
  scriptElement.src = GOOGLE_SCRIPT_URL + queryParams;
  document.body.appendChild(scriptElement);
}

function forzarRefrescoDeHoras() {
  haptic();
  document.getElementById("shiftsScrollArea").innerHTML =
    '<div style="text-align:center; padding:30px; color:var(--ios-blue); font-size:0.9rem;"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg><br>Sincronizando Base de Horas...</div>';
  cargarHorasDesdeSheets();
}

function cargarHorasDesdeSheets() {
  if (isFetchingHoras) {
    return;
  }
  isFetchingHoras = true;

  const oldScript = document.getElementById("cyber_shifts_node");
  if (oldScript) {
    oldScript.remove();
  }

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_shifts_node";
  scriptElement.src =
    GOOGLE_SCRIPT_URL +
    "?action=obtenerHoras&callback=procesarHorasSheets&_ts=" +
    Date.now();
  document.body.appendChild(scriptElement);
}

window.procesarHorasSheets = function (res) {
  isFetchingHoras = false;

  const oldScript = document.getElementById("cyber_shifts_node");
  if (oldScript) {
    oldScript.remove();
  }

  const container = document.getElementById("shiftsScrollArea");
  const nominaOverlay = document.getElementById("nominaOverlay");

  if (res && res.status === "success") {
    window.currentHorasStock = res.data;

    // Recarga la tabla de turnos si está abierta
    if (document.getElementById("shiftsOverlay").classList.contains("open")) {
      renderizarHorasEnPantalla(
        document.getElementById("searchShiftsInput").value.toLowerCase(),
      );
    }
  } else {
    if (container) {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-secondary); font-weight:600; line-height:1.4;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg><br>No se pudo cargar los turnos.</div>`;
    }
    if (nominaOverlay && nominaOverlay.classList.contains("open")) {
      document.getElementById("nominaContentArea").innerHTML =
        "<div class='empty-log-msg' style='color:var(--ios-red);'>❌ Error de sincronización. Intenta de nuevo.</div>";
    }
  }
};

// =========================================================================
// 🛡️ MÓDULO INTEGRADO: CENTRO DE OPERACIONES DE GARANTÍAS (COMPLETO)
// =========================================================================
let isFetchingGarantias = false;

function toggleGarantiasPanel() {
  haptic();
  const overlay = document.getElementById("garantiasOverlay");
  overlay.classList.toggle("open");

  if (overlay.classList.contains("open")) {
    cargarGarantias();
  }
}

function verificarTipoProblema() {
  const select = document.getElementById("repTipoProblema");
  const textarea = document.getElementById("repDesc");

  if (select.value === "OTRA") {
    textarea.style.setProperty("display", "block", "important");
    textarea.setAttribute("required", "true");
    textarea.focus();
  } else {
    textarea.style.setProperty("display", "none", "important");
    textarea.removeAttribute("required");
    textarea.value = "";
  }
}

function ejecutarReporte(e) {
  e.preventDefault();
  haptic();

  const btnSubmit = document.getElementById("btnSubmitReporte");
  const plataforma = document.getElementById("repPlataforma").value;
  const correo = document.getElementById("repCorreo").value;
  const clave = document.getElementById("repClave").value;
  const tipoProblema = document.getElementById("repTipoProblema").value;
  let descripcion = tipoProblema;

  if (tipoProblema === "OTRA") {
    descripcion = document.getElementById("repDesc").value.trim();
  }

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Enviando...`;

  const oldScript = document.getElementById("cyber_reporte_node");
  if (oldScript) oldScript.remove();

  window.procesarReporteSheets = function (res) {
    const scriptNode = document.getElementById("cyber_reporte_node");
    if (scriptNode) scriptNode.remove();

    btnSubmit.disabled = false;
    btnSubmit.innerText = "Enviar a Garantía";

    if (res && res.status === "success") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Reporte ingresado correctamente.</span></div>`,
      );
      document.getElementById("formReportar").reset();
      verificarTipoProblema();
      cargarGarantias();
      if (typeof actualizarBadgeGarantias === "function")
        actualizarBadgeGarantias();
    } else {
      alert("❌ Error: " + (res ? res.message : "Desconocido"));
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_reporte_node";
  let queryParams = `?action=reportarGarantia&plataforma=${encodeURIComponent(plataforma)}&correo=${encodeURIComponent(correo)}&clave=${encodeURIComponent(clave)}&descripcion=${encodeURIComponent(descripcion)}&callback=procesarReporteSheets&_ts=${Date.now()}`;
  scriptElement.src = GOOGLE_SCRIPT_URL + queryParams;
  document.body.appendChild(scriptElement);
}

function cargarGarantias() {
  if (isFetchingGarantias) return;
  isFetchingGarantias = true;
  const container = document.getElementById("listaGarantias");
  container.innerHTML =
    '<div style="text-align:center; padding:20px; color:var(--text-secondary); font-size:0.85rem;"><svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: middle; margin-right: 6px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg><br>Sincronizando tickets...</div>';

  if (document.getElementById("cyber_getgarantias_node"))
    document.getElementById("cyber_getgarantias_node").remove();

  window.procesarListaGarantiasSheets = function (res) {
    isFetchingGarantias = false;
    if (document.getElementById("cyber_getgarantias_node"))
      document.getElementById("cyber_getgarantias_node").remove();
    if (res && res.status === "success") {
      renderizarListaGarantiasDefinitiva(res.data);
    } else {
      container.innerHTML =
        '<div style="text-align:center; padding:20px; color:var(--ios-red); font-weight:600; font-size:0.85rem;">❌ Error al sincronizar base de datos.</div>';
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_getgarantias_node";
  let queryParams = `?action=obtenerGarantias&callback=procesarListaGarantiasSheets&_ts=${Date.now()}`;
  scriptElement.src = GOOGLE_SCRIPT_URL + queryParams;
  document.body.appendChild(scriptElement);
}

function renderizarListaGarantiasDefinitiva(data) {
  const container = document.getElementById("listaGarantias");

  if (!data || data.length === 0) {
    container.innerHTML =
      '<div style="text-align:center; padding:30px; color:var(--ios-green); font-weight:600; font-size:0.9rem;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:10px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><br>¡Excelente! No hay tickets pendientes.</div>';
    return;
  }

  let html = "";
  data.forEach((item) => {
    const textoReporte = `🚨 *REPORTE DE PROBLEMA*\n📺 *Plataforma:* ${item.plataforma}\n📧 *Correo:* ${item.correo}\n🔑 *Clave:* ${item.clave}\n👤 *Proveedor:* ${item.proveedor}\n📅 *Fecha de Compra:* ${item.fechaCompra || "No Registrada"}\n💬 *Motivo:* ${item.desc}`;
    const safeReporte = encodeURIComponent(textoReporte);
    html += `
                <div class="card-ios" style="padding: 12px; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.04); display: flex; flex-direction: column; gap: 6px; margin-bottom:0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 0.5px solid rgba(255,255,255,0.06); padding-bottom: 4px;">
                        <span style="color:var(--ios-blue); font-weight:800; font-size:0.9rem;">${item.plataforma}</span>
                        <div style="font-size: 0.68rem; color: var(--text-secondary); text-align: right; line-height: 1.2;">Reporte: <b>${item.fecha}</b></div>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">
                        <div>📧 Correo: <span style="color:var(--text-primary); user-select:all;">${item.correo}</span></div>
                        <div>🔐 Clave: <span style="color:var(--text-primary); user-select:all;">${item.clave}</span></div>
                        <div>👤 Proveedor: <span style="color:var(--ios-orange); font-weight:600;">${item.proveedor || "Desconocido"}</span></div>
                    </div>
                    <div style="font-size: 0.78rem; background: rgba(0, 0, 0, 0.15); padding: 6px 10px; border-radius: 8px;">💬 ${item.desc}</div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-ios btn-secondary" style="flex:1; padding: 6px; font-size:0.75rem; margin-bottom:0; display:flex; align-items:center; justify-content:center; gap:4px;" onclick="copiarTextoRapido(this, decodeURIComponent('${safeReporte}'))">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar Ficha
                        </button>
                        <button class="btn-ios btn-success" style="flex:1; padding: 6px; font-size:0.75rem; margin-bottom:0; display:flex; align-items:center; justify-content:center; gap:4px;" onclick="abrirModalResolverGarantia('${item.filaIndex}', '${item.correo}', '${item.plataforma}')">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Resolver
                        </button>
                    </div>
                </div>`;
  });
  container.innerHTML = html;
}

function abrirModalResolverGarantia(fila, correo, plataforma) {
  haptic();
  document.getElementById("resolverFila").value = fila;
  document.getElementById("resolverCorreoViejo").value = correo;
  document.getElementById("resolverPlataforma").value = plataforma;
  document.getElementById("resNuevoCorreo").value = correo;
  document.getElementById("resolverGarantiaOverlay").classList.add("open");
}

function cerrarModalResolver() {
  haptic();
  const overlay = document.getElementById("resolverGarantiaOverlay");
  if (overlay) overlay.classList.remove("open");
  const form = document.getElementById("formResolverGarantia");
  if (form) form.reset();
}

function ejecutarResolverGarantia(e) {
  if (e) e.preventDefault();
  haptic();

  const btnSubmit = document.getElementById("btnSubmitResolver");
  const fila = document.getElementById("resolverFila").value;
  const plat = document.getElementById("resolverPlataforma").value;
  const correoViejo = document.getElementById("resolverCorreoViejo").value;
  const nuevoCorreo = document.getElementById("resNuevoCorreo").value;
  const nuevaClave = document.getElementById("resNuevaClave").value;

  if (!fila || !plat) {
    alert("⚠️ Error técnico: No se detectaron los datos del ticket original.");
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Guardando Solución...`;

  const oldScript = document.getElementById("cyber_resolver_node");
  if (oldScript) oldScript.remove();

  window.procesarResolucionSheets = function (res) {
    const scriptNode = document.getElementById("cyber_resolver_node");
    if (scriptNode) scriptNode.remove();

    btnSubmit.disabled = false;
    btnSubmit.innerText = "Guardar y Resolver";

    if (res && res.status === "success") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>¡Ticket solucionado con éxito!</span></div>`,
      );
      cerrarModalResolver();
      cargarGarantias();
    } else {
      alert(
        "❌ Error en Sheets: " +
          (res ? res.message : "No se pudo actualizar el registro."),
      );
    }
    delete window.procesarResolucionSheets;
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_resolver_node";
  scriptElement.src =
    GOOGLE_SCRIPT_URL +
    `?action=resolverGarantia&filaIndex=${encodeURIComponent(fila)}&plataforma=${encodeURIComponent(plat)}&correoViejo=${encodeURIComponent(correoViejo)}&nuevoCorreo=${encodeURIComponent(nuevoCorreo)}&nuevaClave=${encodeURIComponent(nuevaClave)}&callback=procesarResolucionSheets&_ts=${Date.now()}`;
  document.body.appendChild(scriptElement);
}

const observadorModalesScroll = new MutationObserver(() => {
  const algunModalAbierto = document.querySelector(".overlay-ios.open");
  if (algunModalAbierto) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".overlay-ios").forEach((modal) => {
    observadorModalesScroll.observe(modal, {
      attributes: true,
      attributeFilter: ["class"],
    });
  });
});

function parseDate(fechaStr) {
  let stringLimpio = String(fechaStr || "").trim();
  if (!stringLimpio) return new Date();

  let parts = stringLimpio.split(" ");
  let basePart = parts[0];

  let dateParts = basePart.split("/");
  if (dateParts.length === 3) {
    return new Date(
      parseInt(dateParts[2], 10),
      parseInt(dateParts[1], 10) - 1,
      parseInt(dateParts[0], 10),
    );
  }

  let datePartsDash = basePart.split("-");
  if (datePartsDash.length === 3) {
    if (datePartsDash[0].length === 4) {
      return new Date(
        parseInt(datePartsDash[0], 10),
        parseInt(datePartsDash[1], 10) - 1,
        parseInt(datePartsDash[2], 10),
      );
    } else {
      return new Date(
        parseInt(datePartsDash[2], 10),
        parseInt(datePartsDash[1], 10) - 1,
        parseInt(datePartsDash[0], 10),
      );
    }
  }
  return new Date();
}

function esMismaQuincena(fechaStr) {
  let d = parseDate(fechaStr);
  let hoy = new Date();

  let diaHoy = hoy.getDate();
  let dDia = d.getDate();
  let dMes = d.getMonth();
  let dAnio = d.getFullYear();

  if (dMes !== hoy.getMonth() || dAnio !== hoy.getFullYear()) {
    return false;
  }

  if (diaHoy <= 15) {
    return dDia >= 1 && dDia <= 15;
  } else {
    return dDia >= 16;
  }
}

function renderizarHorasEnPantalla(filtroBusqueda = "") {
  const container = document.getElementById("shiftsScrollArea");
  if (!container) return;

  const userActivo = sessionStorage.getItem("active_staff");
  let userFinal = userActivo ? userActivo.toUpperCase() : "";

  let misHoras = [];
  for (let index = 0; index < window.currentHorasStock.length; index++) {
    let item = window.currentHorasStock[index];

    let coincideFiltro = false;
    if (filtroBusqueda === "") {
      coincideFiltro = true;
    } else if (
      item.vendedor.toLowerCase().includes(filtroBusqueda) ||
      item.fecha.toLowerCase().includes(filtroBusqueda)
    ) {
      coincideFiltro = true;
    }

    if (userFinal === "CAMILO") {
      if (esMismaQuincena(item.fecha) && coincideFiltro) {
        misHoras.push(item);
      }
    } else {
      if (
        item.vendedor.toUpperCase().includes(userFinal) &&
        esMismaQuincena(item.fecha) &&
        coincideFiltro
      ) {
        misHoras.push(item);
      }
    }
  }

  if (misHoras.length === 0) {
    container.innerHTML =
      '<div style="text-align:center; padding:30px; color:var(--text-secondary); font-weight:600; line-height:1.4;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><br>No hay turnos que coincidan con la búsqueda actual.</div>';
    return;
  }

  let resumenDiario = {};

  for (let i = 0; i < misHoras.length; i++) {
    let item = misHoras[i];
    let d = parseDate(item.fecha);

    let dayNum = String(d.getDate()).padStart(2, "0");
    let monthNum = String(d.getMonth() + 1).padStart(2, "0");
    let dateKey = dayNum + "/" + monthNum;
    let dayOfWeek = d.getDay();

    let vendedorReal = item.vendedor
      .toUpperCase()
      .replace(" (INGRESO MANUAL)", "");
    let groupKey = dateKey + "_" + vendedorReal;

    if (!resumenDiario[groupKey]) {
      resumenDiario[groupKey] = {
        dateObj: d,
        dayOfWeek: dayOfWeek,
        totalSeconds: 0,
        vendedor: vendedorReal,
        fechaText: dateKey,
        fechaExactaOrigen: item.fecha,
        filasAsociadas: [],
      };
    }

    let timeParts = String(item.tiempo || "").split(":");
    let totalSec = 0;
    let esTiempoValido = false;

    if (timeParts.length === 3) {
      totalSec =
        (parseInt(timeParts[0], 10) || 0) * 3600 +
        (parseInt(timeParts[1], 10) || 0) * 60 +
        (parseInt(timeParts[2], 10) || 0);
      esTiempoValido = true;
    } else if (timeParts.length === 2) {
      totalSec =
        (parseInt(timeParts[0], 10) || 0) * 3600 +
        (parseInt(timeParts[1], 10) || 0) * 60;
      esTiempoValido = true;
    } else {
      let numeroPuro = parseFloat(String(item.tiempo || "").replace(",", "."));
      if (!isNaN(numeroPuro) && numeroPuro > 0) {
        totalSec = Math.floor(numeroPuro * 3600);
        esTiempoValido = true;
      }
    }

    if (esTiempoValido) {
      resumenDiario[groupKey].totalSeconds += totalSec;
      if (item.filaIndex) {
        resumenDiario[groupKey].filasAsociadas.push(item.filaIndex);
      }
    }
  }

  let keysArray = Object.keys(resumenDiario);
  let diasArray = [];

  for (let k = 0; k < keysArray.length; k++) {
    let kStr = keysArray[k];
    let r = resumenDiario[kStr];

    let h = Math.floor(r.totalSeconds / 3600);
    let m = Math.floor((r.totalSeconds % 3600) / 60);
    let s = r.totalSeconds % 60;

    let hStr = String(h).padStart(2, "0");
    let mStr = String(m).padStart(2, "0");
    let sStr = String(s).padStart(2, "0");
    let fmtTime = hStr + ":" + mStr + ":" + sStr;

    let arrayDiasSemana = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    diasArray.push({
      groupKey: kStr,
      fechaText: r.fechaText,
      fechaExactaOrigen: r.fechaExactaOrigen,
      vendedor: r.vendedor,
      dateObj: r.dateObj,
      diaNombre: arrayDiasSemana[r.dayOfWeek],
      hoursFmt: fmtTime,
      filasAsociadas: r.filasAsociadas,
    });
  }

  diasArray.sort(function (a, b) {
    if (a.dateObj.getTime() !== b.dateObj.getTime()) {
      return a.dateObj - b.dateObj;
    } else {
      return a.vendedor.localeCompare(b.vendedor);
    }
  });

  let totalSecs = 0;
  for (let p = 0; p < diasArray.length; p++) {
    totalSecs += resumenDiario[diasArray[p].groupKey].totalSeconds;
  }

  let tH = Math.floor(totalSecs / 3600);
  let tM = Math.floor((totalSecs % 3600) / 60);
  let tFmt =
    String(tH).padStart(2, "0") + "h " + String(tM).padStart(2, "0") + "m";

  let tituloPanel =
    userFinal === "CAMILO" ? "Quincena Global" : "Tu Quincena Actual";
  if (filtroBusqueda !== "") tituloPanel = "Resultados de Búsqueda";

  let html = `
              <div class="card-ios" style="padding:15px 10px;">
                  <h4 style="text-align:center; color:var(--ios-blue); font-size:1.1rem; margin-bottom:15px;">${tituloPanel}</h4>
                  <table style="width: 100%; border-collapse: collapse;">
                      <thead>
                          <tr>
                              <th style="padding: 12px 10px; text-align: left; border-bottom: 0.5px solid rgba(255,255,255,0.1); font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase;">Día</th>
                              <th style="padding: 12px 10px; text-align: right; border-bottom: 0.5px solid rgba(255,255,255,0.1); font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase;">Horas</th>
                          </tr>
                      </thead>
                      <tbody>
            `;

  let btnLiquidarHTML = "";
  let filasArrayGlobal = [];

  for (let f = 0; f < diasArray.length; f++) {
    let dInfo = diasArray[f];
    let vendedorLabel =
      userFinal === "CAMILO"
        ? `<br><span style="color:var(--ios-blue); font-size:0.75rem; font-weight:bold;">${dInfo.vendedor}</span>`
        : "";

    let puedeEditar = userFinal === "CAMILO" || dInfo.vendedor === userFinal;
    let btnEditarIndividual = "";
    let btnLiquidarIndividual = "";

    if (dInfo.filasAsociadas && dInfo.filasAsociadas.length > 0) {
      let filasStrInd = dInfo.filasAsociadas.join(",");
      if (puedeEditar) {
        btnEditarIndividual = `
                        <button style="background: transparent; border: none; color: var(--ios-blue); cursor: pointer; padding: 5px; border-radius: 8px; vertical-align: middle; margin-left: 8px;" onclick="abrirEdicionHoras('${dInfo.vendedor}', '${dInfo.fechaText}', '${dInfo.fechaExactaOrigen}', '${dInfo.hoursFmt}', '${filasStrInd}')" title="Editar tiempo">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>`;
      }
      if (userFinal === "CAMILO") {
        let targetInd = dInfo.vendedor + " el " + dInfo.fechaText;
        btnLiquidarIndividual = `<span style="cursor:pointer; font-size:1.1rem; margin-left:4px; vertical-align:middle; color:var(--ios-green);" onclick="ejecutarLiquidacion('${targetInd}', '${filasStrInd}')" title="Liquidar y Borrar este día"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="12" y1="1" x2="12" y2="23"></line><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H6"></path></svg></span>`;
      }
    }

    html += `
                          <tr>
                              <td style="padding: 12px 10px; text-align: left; border-bottom: 0.5px solid rgba(255,255,255,0.1); font-size: 0.95rem; color: var(--text-primary);"><strong>${dInfo.diaNombre}</strong>${vendedorLabel}<br><span style="font-size:0.7rem; color:var(--text-secondary);">${dInfo.fechaText}</span></td>
                              <td style="padding: 12px 10px; text-align: right; border-bottom: 0.5px solid rgba(255,255,255,0.1); font-size: 0.95rem; color: var(--text-primary); color:var(--ios-green); font-family:monospace; font-weight:bold;">
                                  ${dInfo.hoursFmt} 
                                  ${btnEditarIndividual} 
                                  ${btnLiquidarIndividual}
                              </td>
                          </tr>
                `;
  }

  if (userFinal === "CAMILO") {
    let targetName =
      filtroBusqueda !== "" ? filtroBusqueda.toUpperCase() : "TODOS (GLOBAL)";
    for (let i = 0; i < misHoras.length; i++) {
      if (misHoras[i].filaIndex) filasArrayGlobal.push(misHoras[i].filaIndex);
    }
    let filasStr = filasArrayGlobal.join(",");
    if (filasArrayGlobal.length > 0) {
      btnLiquidarHTML = `
                    <div style="margin-top:20px; text-align:center;">
                        <button class="btn-ios btn-danger w-100" style="display:flex; justify-content:center; align-items:center; gap:8px;" onclick="ejecutarLiquidacion('${targetName}', '${filasStr}')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="12" y1="1" x2="12" y2="23"></line><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H6"></path></svg>
                            LIQUIDAR PAGO (${targetName})
                        </button>
                    </div>`;
    }
  }

  html += `
                      </tbody>
                  </table>
                  <div style="margin-top:15px; padding:15px 10px 0 10px; border-top:1px solid rgba(255,255,255,0.15); display:flex; justify-content:space-between; align-items:center;">
                      <span style="font-size:0.8rem; color:var(--text-secondary);">Total Horas:</span>
                      <span style="font-weight:bold; color:var(--text-primary); font-size:1.1rem;">${tFmt}</span>
                  </div>
                  ${btnLiquidarHTML}
              </div>
            `;
  container.innerHTML = html;
}
window.ejecutarLiquidacion = function (nombreObjetivo, filasStr) {
  if (!filasStr) return;
  let count = filasStr.split(",").length;

  if (
    !confirm(
      `ATENCIÓN CAMILO: Estás a punto de LIQUIDAR y BORRAR DEFINITIVAMENTE ${count} turnos de ${nombreObjetivo}.\n\n¿Deseas continuar?`,
    )
  ) {
    return;
  }

  haptic();
  const container = document.getElementById("shiftsScrollArea");
  container.innerHTML =
    '<div style="text-align:center; padding:30px; color:var(--text-secondary); font-size:0.9rem;"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:10px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg><br>Liquidando y borrando turnos en Sheets...</div>';

  const oldScript = document.getElementById("cyber_liquidar_node");
  if (oldScript) oldScript.remove();

  window.procesarLiquidacionSheets = function (res) {
    const scriptNode = document.getElementById("cyber_liquidar_node");
    if (scriptNode) scriptNode.remove();

    if (res && res.status === "success") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Liquidación exitosa. Se borraron ${res.eliminadas} registros.</span></div>`,
      );
      forzarRefrescoDeHoras();
    } else {
      let errMsg = "Error al liquidar.";
      if (res && res.message) errMsg = res.message;
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-red);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> <span>${errMsg}</span></div>`,
      );
      forzarRefrescoDeHoras();
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_liquidar_node";
  let queryParams =
    "?action=liquidarTurnos&filas=" +
    encodeURIComponent(filasStr) +
    "&callback=procesarLiquidacionSheets&_ts=" +
    Date.now();
  scriptElement.src = GOOGLE_SCRIPT_URL + queryParams;
  document.body.appendChild(scriptElement);
};

function filtrarHorasInternas() {
  const query = document
    .getElementById("searchShiftsInput")
    .value.toLowerCase();
  renderizarHorasEnPantalla(query);
}

function toggleCodesPanel() {
  haptic();
  const overlay = document.getElementById("codesOverlay");
  overlay.classList.toggle("open");

  if (overlay.classList.contains("open")) {
    if (window.currentCodesStock && window.currentCodesStock.length > 0) {
      renderizarCodigosEnPantalla();
      cargarCodigosDesdeGmail(true);
    } else {
      forzarRefrescoDeCodigos();
    }

    autoRefreshCodesInterval = setInterval(function () {
      cargarCodigosDesdeGmail(true);
    }, 12000);
  } else {
    if (autoRefreshCodesInterval) {
      clearInterval(autoRefreshCodesInterval);
      autoRefreshCodesInterval = null;
    }
  }
}

function togglePasswordModal() {
  haptic();
  const overlay = document.getElementById("passwordOverlay");

  if (overlay.classList.contains("open")) {
    overlay.classList.remove("open");
  } else {
    window.isForcedChange = false;
    document.getElementById("passwordModalTitle").innerHTML =
      `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Actualización Obligatoria`;
    document.getElementById("passwordModalDesc").innerText =
      "Actualiza tu clave personal de acceso al sistema.";
    document.getElementById("oldPasswordForzado").style.display = "block";
    document.getElementById("btnSubmitPasswordForzado").innerText =
      "Guardar en Google Sheets";
    document.getElementById("btnCancelPasswordForzado").innerText = "Cancelar";

    document.getElementById("passwordForm").reset();
    overlay.classList.add("open");
    document.getElementById("oldPasswordForzado").focus();
  }
}

function forzarRefrescoDeCodigos() {
  haptic();
  document.getElementById("codesScrollArea").innerHTML =
    '<div style="text-align:center; padding:30px; color:var(--text-secondary); font-size:0.9rem;"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg><br>Sincronizando bandeja de Gmail...</div>';
  cargarCodigosDesdeSheets(false);
}

function cargarCodigosDesdeSheets(silencioso = false) {
  if (isFetchingCodes) return;
  isFetchingCodes = true;

  if (!silencioso && window.cyberCodesTimeout) {
    clearTimeout(window.cyberCodesTimeout);
  }

  if (!silencioso) {
    window.cyberCodesTimeout = setTimeout(function () {
      const container = document.getElementById("codesScrollArea");
      if (container && container.innerHTML.includes("Sincronizando")) {
        container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-secondary); font-weight:600; line-height:1.4;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg><br>No hay códigos disponibles en este momento.</div>`;
      }
      isFetchingCodes = false;
    }, 12000);
  }

  const oldScript = document.getElementById("cyber_jsonp_node");
  if (oldScript) oldScript.remove();

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_jsonp_node";
  scriptElement.setAttribute("data-cfasync", "false");
  scriptElement.src =
    GOOGLE_SCRIPT_URL +
    "?action=obtenerCodigos&callback=procesarCodigosSheets&_ts=" +
    Date.now();
  document.body.appendChild(scriptElement);
}

window.procesarCodigosSheets = function (res) {
  isFetchingCodes = false;
  if (window.cyberCodesTimeout) clearTimeout(window.cyberCodesTimeout);

  const oldScript = document.getElementById("cyber_jsonp_node");
  if (oldScript) oldScript.remove();

  const container = document.getElementById("codesScrollArea");
  if (res && res.status === "success") {
    window.currentCodesStock = res.data;
    if (document.getElementById("codesOverlay").classList.contains("open")) {
      renderizarCodigosEnPantalla();
    }
  } else {
    if (
      container &&
      (container.innerHTML.includes("Sincronizando") ||
        container.children.length === 0)
    ) {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-secondary); font-weight:600; line-height:1.4;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg><br>No hay códigos disponibles en este momento.</div>`;
    }
  }
};

function renderizarCodigosEnPantalla() {
  const container = document.getElementById("codesScrollArea");
  if (!container) return;

  if (window.currentCodesStock.length === 0) {
    container.innerHTML =
      '<div style="text-align:center; padding:30px; color:var(--text-secondary); font-weight:600; line-height:1.4;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg><br>No hay códigos disponibles en este momento.</div>';
    return;
  }

  let htmlCards = "";
  for (let i = 0; i < window.currentCodesStock.length; i++) {
    let item = window.currentCodesStock[i];
    let colColor = item.colorText || "var(--ios-blue)";

    htmlCards += `
                  <div class="card-ios mb-1" style="padding: 15px; gap: 8px;">
                      <div class="flex-row-between" style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
                          <span style="color:${colColor}; font-weight:700; font-size:0.85rem; text-transform: uppercase;">${item.plataforma}</span>
                          <span style="font-size:0.75rem; color:var(--text-secondary); font-family: monospace; display:flex; align-items:center; gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${item.hora}</span>
                      </div>
                      <div style="font-size:0.85rem; color:var(--text-secondary);">Cliente: <span style="color:var(--text-primary); font-weight:600;">${item.correo}</span></div>
                      <div style="font-size:0.85rem; color:var(--text-secondary);">Acción: <span style="color:var(--text-primary); font-weight:600;">${item.accion}</span></div>
                      <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:6px;">Código / Enlace: <span style="color:var(--ios-blue); font-weight:700; word-break: break-all;">${item.codigoLink}</span></div>
                      <button class="btn-ios btn-secondary w-100" style="display:flex; justify-content:center; align-items:center; gap:8px;" onclick="copiarMensajeRapidoGmail(this, ${i})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        COPIAR MENSAJE
                      </button>
                  </div>
                `;
  }
  container.innerHTML = htmlCards;
  filtrarCodigosInternos();
}

function copiarMensajeRapidoGmail(btn, index) {
  haptic();
  const item = window.currentCodesStock[index];
  if (!item) return;

  navigator.clipboard
    .writeText(item.copiadoRapido)
    .then(function () {
      const originalText = btn.innerHTML;
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> ¡COPIADO CON ÉXITO!`;
      btn.style.background = "var(--ios-green)";
      btn.style.color = "white";
      btn.style.borderColor = "transparent";

      setTimeout(function () {
        btn.innerHTML = originalText;
        btn.style.background = "";
        btn.style.color = "";
        btn.style.borderColor = "";
      }, 1500);
    })
    .catch(function () {
      const textarea = document.createElement("textarea");
      textarea.value = item.copiadoRapido;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();

      const originalText = btn.innerHTML;
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> ¡COPIADO CON ÉXITO!`;
      btn.style.background = "var(--ios-green)";
      btn.style.color = "white";
      btn.style.borderColor = "transparent";

      setTimeout(function () {
        btn.innerHTML = originalText;
        btn.style.background = "";
        btn.style.color = "";
        btn.style.borderColor = "";
      }, 1500);
    });
}

function filtrarCodigosInternos() {
  const query = document.getElementById("searchCodesInput").value.toLowerCase();
  const cards = document.querySelectorAll("#codesScrollArea .card-ios");
  for (let i = 0; i < cards.length; i++) {
    let card = cards[i];
    card.style.display = card.innerText.toLowerCase().includes(query)
      ? ""
      : "none";
  }
}

function resetearInactividad() {
  if (!sessionStorage.getItem("active_staff")) return;
  window.cyberUltimaActividad = Date.now();
}

function iniciarControlInactividad() {
  window.cyberUltimaActividad = Date.now();

  window.addEventListener("mousemove", resetearInactividad);
  window.addEventListener("keypress", resetearInactividad);
  window.addEventListener("click", resetearInactividad);
  window.addEventListener("scroll", resetearInactividad);
  window.addEventListener("touchstart", resetearInactividad);
  resetearInactividad();

  setInterval(function () {
    if (!sessionStorage.getItem("active_staff")) return;
    if (sessionStorage.getItem("active_staff").toUpperCase() === "CAMILO")
      return;

    let ahora = Date.now();
    let tiempoInactivo = ahora - window.cyberUltimaActividad;

    if (tiempoInactivo > 30 * 60 * 1000) {
      cerrarSesionStaffPorInactividadGrave();
      return;
    }
  }, 5000);
}

function cerrarSesionStaffPorInactividadGrave() {
  let lastSync =
    parseInt(sessionStorage.getItem("cyber_last_sync_time"), 10) || Date.now();
  let msUtiles = window.cyberUltimaActividad - lastSync;
  if (msUtiles < 0 || isNaN(msUtiles)) msUtiles = 0;

  function finalizarCierreLimpio() {
    sessionStorage.clear();
    localStorage.removeItem("cyber_saved_staff");
    window.location.reload();
  }

  if (msUtiles > 0) {
    let totalSeconds = Math.floor(msUtiles / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;
    let tiempoFormateado =
      String(hours).padStart(2, "0") +
      ":" +
      String(minutes).padStart(2, "0") +
      ":" +
      String(seconds).padStart(2, "0");
    const activeUser = sessionStorage.getItem("active_staff") || "Vendedor";

    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "notificarCorreo",
        tipo: "pulso",
        user: activeUser,
        tiempoTrabajado: tiempoFormateado,
      }),
    })
      .then(finalizarCierreLimpio)
      .catch(finalizarCierreLimpio);
  } else {
    finalizarCierreLimpio();
  }
}

function startShiftTimer() {
  if (!sessionStorage.getItem("cyber_shift_start_time")) {
    sessionStorage.setItem("cyber_shift_start_time", Date.now());
  }
  if (!sessionStorage.getItem("cyber_shift_accumulated_time")) {
    sessionStorage.setItem("cyber_shift_accumulated_time", 0);
  }
  if (!sessionStorage.getItem("cyber_last_sync_time")) {
    sessionStorage.setItem("cyber_last_sync_time", Date.now());
  }

  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(function () {
    if (isTimerPaused) return;

    let startTime = parseInt(sessionStorage.getItem("cyber_shift_start_time"));
    let accumulated = parseInt(
      sessionStorage.getItem("cyber_shift_accumulated_time"),
    );
    if (isNaN(accumulated)) accumulated = 0;

    let elapsed = Date.now() - startTime;
    let totalMs = accumulated + elapsed;

    let totalSeconds = Math.floor(totalMs / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    let hStr = String(hours).padStart(2, "0");
    let mStr = String(minutes).padStart(2, "0");
    let sStr = String(seconds).padStart(2, "0");

    let stElement = document.getElementById("shiftTimer");
    if (stElement) stElement.innerText = hStr + ":" + mStr + ":" + sStr;

    let lastSync = parseInt(sessionStorage.getItem("cyber_last_sync_time"), 10);
    if (Date.now() - lastSync >= 600000) {
      ejecutarAutoPulsoTiempo();
    }
  }, 1000);
}

function obtenerTiempoFinalFormateado() {
  let startTime = parseInt(sessionStorage.getItem("cyber_shift_start_time"));
  let accumulated = parseInt(
    sessionStorage.getItem("cyber_shift_accumulated_time"),
  );
  if (isNaN(accumulated)) accumulated = 0;
  let totalMs = accumulated;
  if (!isTimerPaused) {
    totalMs += Date.now() - startTime;
  }
  let totalSeconds = Math.floor(totalMs / 1000);
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds % 3600) / 60);
  let seconds = totalSeconds % 60;
  return (
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0")
  );
}

function ejecutarNotificacionDeCorreo(
  vendedor,
  tipoAccion,
  tiempoTrabajado,
  callbackFinal,
) {
  if (!GOOGLE_SCRIPT_URL) {
    if (callbackFinal) callbackFinal();
    return;
  }
  let paramObj = {
    action: "notificarCorreo",
    user: vendedor,
    tipo: tipoAccion,
    tiempoTrabajado: tiempoTrabajado,
  };
  fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paramObj),
  })
    .then(function () {
      if (callbackFinal) callbackFinal();
    })
    .catch(function () {
      if (callbackFinal) callbackFinal();
    });
}

function validateStaffAccess(e) {
  if (e) e.preventDefault();
  haptic();
  const userElement = document.getElementById("staffUser");
  const passElement = document.getElementById("staffPass");
  const remElement = document.getElementById("rememberMe");
  const userInput = userElement.value.toUpperCase().trim();
  const passInput = passElement.value.trim();
  const rememberMe = remElement.checked;
  const errorToast = document.getElementById("error-login-toast");
  const submitBtn = document.querySelector('#loginForm button[type="submit"]');

  if (!userInput || !passInput) return;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Verificando...`;

  const oldScript = document.getElementById("cyber_login_node");
  if (oldScript) oldScript.remove();

  window.procesarLoginSheets = function (res) {
    submitBtn.disabled = false;
    submitBtn.innerText = "Verificar Identidad";
    const scriptNode = document.getElementById("cyber_login_node");
    if (scriptNode) scriptNode.remove();

    if (res && res.status === "success") {
      errorToast.style.display = "none";
      userElement.blur();
      passElement.blur();
      entrarAlSistema(userInput, rememberMe);
    } else {
      let errMsg = "Credenciales incorrectas en la base de datos.";
      if (res && res.message) errMsg = res.message;

      errorToast.innerHTML = `<div style="display:flex; align-items:center; gap:8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> <span>${errMsg}</span></div>`;
      errorToast.style.display = "block";
      passElement.value = "";
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_login_node";
  let queryParams =
    "?action=verificarLogin&user=" +
    encodeURIComponent(userInput) +
    "&pass=" +
    encodeURIComponent(passInput) +
    "&callback=procesarLoginSheets&_ts=" +
    Date.now();
  scriptElement.src = GOOGLE_SCRIPT_URL + queryParams;
  document.body.appendChild(scriptElement);
}

function entrarAlSistema(userInput, rememberMe, isAutoLogin = false) {
  if (!isAutoLogin && userInput.toUpperCase().trim() !== "CAMILO") {
    ejecutarNotificacionDeCorreo(userInput, "inicio", "00:00:00");
  }
  document.getElementById("loginOverlay").classList.remove("open");
  document.getElementById("mainWorkspace").style.display = "flex";
  document.getElementById("globalHeader").style.display = "flex";
  document.getElementById("controlPanel").style.display = "flex";
  let sessionNameEl = document.getElementById("staffSessionName");
  if (sessionNameEl) sessionNameEl.innerText = userInput;
  sessionStorage.setItem("active_staff", userInput);
  if (rememberMe) localStorage.setItem("cyber_saved_staff", userInput);

  const currentOperator = userInput.toUpperCase().trim();
  const shiftTimer = document.getElementById("shiftTimer");
  const cajaBtn = document.getElementById("btnCajaFinanzas");
  const btnRegistro = document.getElementById("btnRegistroVentas");

  // El botón de Registros lo ven TODOS
  if (btnRegistro)
    btnRegistro.style.setProperty("display", "flex", "important");

  if (currentOperator === "CAMILO") {
    if (shiftTimer && shiftTimer.parentElement)
      shiftTimer.parentElement.style.setProperty(
        "display",
        "none",
        "important",
      );
    if (cajaBtn) cajaBtn.style.setProperty("display", "flex", "important");
  } else {
    if (shiftTimer && shiftTimer.parentElement)
      shiftTimer.parentElement.style.setProperty(
        "display",
        "inline-flex",
        "important",
      );
    if (cajaBtn) cajaBtn.style.setProperty("display", "none", "important");
  }
  inicializarWorkspace();
}

function inicializarWorkspace() {
  cargarPlantillasDesdeSheets(); // 👈 Descarga los mensajes en vivo al entrar
  startShiftTimer();
  iniciarControlInactividad();
  cargarHorasDesdeSheets();
}

function cerrarSesionStaff() {
  haptic();
  let usuarioActivo = sessionStorage.getItem("active_staff") || "STAFF";

  function finalizarCierre() {
    sessionStorage.removeItem("active_staff");
    localStorage.removeItem("cyber_saved_staff");
    sessionStorage.removeItem("cyber_shift_start_time");
    location.reload();
  }

  if (usuarioActivo.toUpperCase().trim() === "CAMILO") {
    finalizarCierre();
  } else {
    if (
      confirm(
        "¿Estás seguro de que deseas cerrar tu sesión e informar tu turno?",
      )
    ) {
      let lastSync =
        parseInt(sessionStorage.getItem("cyber_last_sync_time"), 10) ||
        Date.now();
      let ahora = Date.now();
      let deltaMs = ahora - lastSync;
      if (deltaMs < 0 || isNaN(deltaMs)) deltaMs = 0;

      let totalSeconds = Math.floor(deltaMs / 1000);
      let hours = Math.floor(totalSeconds / 3600);
      let minutes = Math.floor((totalSeconds % 3600) / 60);
      let seconds = totalSeconds % 60;
      let tiempoTexto =
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

      ejecutarNotificacionDeCorreo(
        usuarioActivo,
        "cierre",
        tiempoTexto,
        finalizarCierre,
      );
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  let savedTheme = localStorage.getItem("cyber_theme");
  if (!savedTheme) {
    savedTheme = "dark";
  }
  actualizarBadgeGarantias();
  setInterval(actualizarBadgeGarantias, 60000);

  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  let cacheTurno = JSON.parse(
    sessionStorage.getItem("cyber_history_cargas") || "[]",
  );
  cacheTurno.forEach((item) => {
    renderizarTarjetaHistorial(
      item.plataforma,
      item.proveedor,
      item.correo,
      item.clave,
    );
  });

  let sessionStaff = sessionStorage.getItem("active_staff");
  let localStaff = localStorage.getItem("cyber_saved_staff");

  if (sessionStaff || localStaff) {
    let user = sessionStaff;
    if (!user) {
      user = localStaff;
    }

    sessionStorage.setItem("active_staff", user);
    entrarAlSistema(user, false, true);
  } else {
    document.getElementById("loginOverlay").classList.add("open");
  }
});

const qrPrincipal = {
  titulo: "PAGOS",
  imagenUrl: "https://i.postimg.cc/ydfJzvp8/unnamed.png",
  texto: `Te comparto nuestra llave para el pago de tu servicio desde cualquier entidad bancaria:\n\n📌 *Llave:* 0090878219\n👤 *Verificar nombre:* REF CYBERNET\n\n⚠️ *Nota:* Esta llave es exclusiva para pagos mediante Bre-B desde cualquier banco.\n\n*Pasos para activar tu servicio:* 1️⃣ Realiza la transferencia.\n2️⃣ Envía el comprobante de pago por este medio.\n3️⃣ ¡Recibe tu acceso y empieza a disfrutar! 🚀🎬`,
};

const elementosGrid = [
  {
    titulo: "ADS",
    texto: `¡Hola! 👋 ¡Bienvenido a Cybernet! 🎬\n\nAprovecha nuestra *SUPER PROMO* de hoy:\n\n🔥 *2 PLATAFORMAS POR SOLO $9.900:*\n_(Disney+ estandar, Hbo Max, Paramount+, Vix+, Crunchyroll o Plex)._\n\n🥳 *AMAZON PRIME VIDEO:* por hoy a tan solo $ 9.900\n\n🎁 *OFERTA DE BIENVENIDA:*\n📺 *NETFLIX PREMIUM:* Solo por hoy a $12.500.\n\n¿Cuál te activo ahora mismo?`,
  },
  {
    titulo: "NEQUI",
    texto: `💳 *_Realiza tu pago rápido, fácil y seguro_* ⚡\n\n📲 *_Métodos disponibles y confiables:_*\n\n💜 *_Nequi o Daviplata:_* 3015156037\n\n📸 Envía la captura del comprobante y tu servicio quedará activo al instante 🚀`,
  },
  {
    titulo: "COMBOS",
    texto: `💻 ¡Arma tu combo streaming a tu medida con *_NETFLIX PREMIUM!_* 🎉📺\n\n🔥 *_Plataformas disponibles para escoger:_*\nAmazon Prime Video - Disney Estándar – Hbo Max – Paramount – Vix – Plex – Crunchyroll - Apple TV\n\n0️⃣ Netflix solo → 💰 *_$14.500_* 😔 _(Opción Tradicional)_\n\n1️⃣ Netflix + 1 plataforma → 💰 *_$20.000_* _¡TOP VENTAS!_ 🔥🏆\n2️⃣ Netflix + 2 plataformas → 💰 *_$24.000_* _AHORRO TOTAL_ 🚀✨\n3️⃣ Netflix + 3 plataformas → 💰 *_$27.000_* _VIP GOLD_ 👑💎\n\n4️⃣ Netflix + Disney Premium → 💰 *_$25.000_* 💠 _(Dúo Premium)_\n5️⃣ Netflix + Disney Premium + 1 plataforma → 💰 *_$29.000_* ⭐ _(Combo Pro)_\n6️⃣ Netflix + Disney Premium + 2 plataformas → 💰 *_$32.000_* 🎬 _(Cine Total)_\n7️⃣ Netflix + Disney Premium + 3 plataformas → 💰 *_$35.000_* 👑 _(EL REY DEL STREAMING)_\n\n*Netflix* cuenta con una página de códigos disponible las 24 horas, los 7 días de la semana.`,
  },
  {
    titulo: "COMBOS SIN NETFLIX",
    texto: `💻 ¡Arma tu combo streaming a tu medida con *_Sin Netflix!_* 🎉📺\n\n🔥 *_Plataformas disponibles para escoger:_*\nAmazon Prime Video - Disney Estándar – Hbo Max – Paramount – Vix – Plex – Crunchyroll - Apple TV\n \n1️⃣ 2 Plataformas = 💰 *_$13.000_* 😱 \n2️⃣ 3 Plataformas = 💰 *_$16.000_* 😱 \n3️⃣ 4 Plataformas = 💰 *_$18.000_* 😱 \n\n4️⃣ Disney Premium + 1 plataforma =  💰 *_$20.000_* 😱\n5️⃣ Disney Premium + 2 plataformas =  💰 *_$22.000_* 😱\n6️⃣ Disney Premium + 3 plataformas =  💰 *_$24.000_* 😱`,
  },
  {
    titulo: "INDIVIDUALES",
    texto: `💻✨ *Plataformas Individuales – Cybernet* 🚀🎬  \n📍 *Netflix Colombia:* 1️⃣ 1 Pantalla → *$14.500* 🎥 *Otras plataformas disponibles:* ✨ Disney+ Premium → *$15.000* 🍿 Prime Video → *$10.500* 🎭 Disney Estándar → *$8.500* 🎬 Max → *$8.500* 📺 Apple TV → *$8.500* 🎞️ Paramount+ → *$8.500* 🎞️ MUBI → *$8.500* 🎮 Plex → *$8.500* 🌸 Crunchyroll → *$8.500* 📡 Vix → *$8.500*\n⚽ Metegol → *$15.000* 🎨 Canva Pro (1 mes) → *$20.000*\n🎶 Spotify (1 mes) → *$14.000* 🎶 YouTube Premium (1 mes) → *$14.000*\n🎶 Deezer (1 mes) → *$12.000* 🎬 *Diferencias Disney+* 💙  \n👉 Estándar →  📺 Con anuncios, sin ESPN\n👉 Premium →  🚫 Sin anuncios · 🏆 ESPN incluido · 🔒 Bloqueo de perfil\n\n💜 *En Cybernet no hay trucos,* solo entretenimiento real y herramientas para tu día a día 🍿✨`,
  },
  {
    titulo: "GRACIAS",
    texto: `¡De nada! Es un verdadero gusto atenderte. 😊🙌\n\nSolo paso a recordarte que, ante cualquier duda ❓ o inconveniente ⚠️ que presentes con tu servicio, ¡no dudes en escribirme de inmediato! 📲⚡ Estoy aquí para darte una solución rápida 🛠️ y que sigas disfrutando de toda tu programación favorita sin interrupciones. 📺🍿🎬`,
  },
  {
    titulo: "DIFERENCIAS DISNEY",
    texto: `🎬 *_Diferencias de Disney+_* 💙✨\n👉 *_Estándar_*\n- 📺 Incluye anuncios\n- 🚫 No tiene ESPN\n\n👉 *_Premium_*\n- 🚫 Sin anuncios\n- 🏆 ESPN incluido\n- 🔒 Bloqueo de perfil disponible\n\n📲 Tú decides cómo disfrutar tu Disney+ favorito 🍿🌟`,
  },
  {
    titulo: "SIGNIFICADO NETFLIX PREMIUM",
    texto: `🍿 *NETFLIX PREMIUM* 🎬\n\n💎 *Máxima Calidad:* Resolución 4K Ultra HD + HDR.\n🎧 *Audio Espacial:* Sound omnipresente tipo cine.\n📥 *Descargas:* Mira tus series favoritas sin internet.\n🚫 *Sin Anuncios:* Disfruta todo el catálogo sin cortes.\n\n¡La experiencia completa de Netflix en tus manos! ✨🚀`,
  },
  {
    titulo: "COOKIES",
    texto: `📲 *Instrucciones para acceder a la cuenta Netflix* 🎬✨\n1️⃣ Ingresa este enlace en el navegador de tu preferencia 👉 https://netflix.com/clearcookies\n2️⃣ Cuando cargue la página, escribe el correo en el campo Email ✉️\n3️⃣ Luego pulsa en *Comenzar* ▶️\n4️⃣ Después ingresa la contraseña de la cuenta 🔑\n5️⃣ Finalmente, dale en *Iniciar sesión* ✅ … ¡y listo! 🍿📺`,
  },
  {
    titulo: "PROBLEMAS",
    texto: `🔄📺 *¿Tu Smart TV no carga bien o falla?* 😅  \n¡No te preocupes! Aquí tienes dos formas rápidas de solucionarlo 💪✨\n\n⚙️ *Opción 1: Reinicio rápido* 1️⃣ Desconéctala por 1 minuto 🔌  \n2️⃣ Con el TV apagado, presiona Power 5 seg 🔘  \n(Si no tiene botón, déjala desconectada 3 min)  \n3️⃣ Conéctala y enciéndela ✨  \n4️⃣ Intenta acceder a tu cuenta 📲  \n✅ Soluciona problemas de carga o inicio 🛠️\n\n🌐 *Opción 2: Reinicio de red* 1️⃣ Apaga tu Smart TV 📴  \n2️⃣ Desconecta módem y router por 30 seg ⏱️  \n3️⃣ Conecta el modem y espera 💡  \n4️⃣ Luego el router and espera 🔁  \n5️⃣ Enciende el TV y prueba 🌟  \n✅ Mejora conexión y evita errores de red 📶\n\n💜 *Si el problema persiste, escríbeme y te guío paso a paso* 🚀🎬`,
  },
  {
    titulo: "PAG PARA CODIGOS",
    texto: `🎬 *¡TUTORIAL RÁPIDO: Cómo usar nuestro Centro de Códigos!* 🚀\n\nHola!!!! te enseño a usar nuestra nueva herramienta para que obtengas tus códigos al instante y sin esperas.\n\n🌐 _*LINK OFICIAL:*_ www.cybernetsp.com\n\n_*PASOS PARA TU SOLICITUD:_*\n\n1️⃣ _*Ingresa tu número:*_ Al entrar, la página te pedirá el celular con el que realizaste la compra (por ejemplo, este número desde el que me escribes). Dale a "Continuar".\n\n2️⃣ _*Elige tu Plataforma:*_ Selecciona Netflix 🔴 o Disney Premium 🔵.\n\n3️⃣ Si eliges _*NETFLIX*_, tienes 3 opciones:\n\n🔑 Código de Inicio de Sesión: Para entrar por primera vez.\n\n✈️ Código 'Estoy de Viaje': Para saltar el bloqueo de hogar.\n\n📧 Enlace de Inicio (Aprobación): Para aprobar el acceso vía link.\n\n4️⃣ *_Busca tu cuenta:_*\nIngresa el correo de la cuenta (debe terminar en @cybernetsp.com).\nDale clic en "Buscar en el sistema".\n\n✅ ¡Y LISTO! En segundos el sistema te entrega el código o el link de acceso en pantalla. ⚡\n\n_*PARA DISNEY PREMIUM*_: Es aún más directo. Eliges Disney, pones el correo terminado en @cybernetsp.com y ¡listo! Tienes tu código de inmediato.\n\nCualquier duda, el botón de Soporte está integrado en la web. ¡A sacarle el máximo provecho! 🔥🎬`,
  },
  {
    titulo: "INSTALAR PAG",
    texto: `🌐 *Cómo instalar Cybernet en tu celular (como una App)*\n\nSi quieres acceder rápidamente a tus servicios de Cybernet sin tener que abrir el navegador cada vez, sigue estos sencillos pasos:\n\n🤖 *Para usuarios de Android (Google Chrome)*\nAbre el navegador Chrome and entra a: www.cybernetsp.com\n\n1️⃣ Toca los tres puntos verticales (⋮) en la esquina superior derecha.\n2️⃣ Selecciona la opción: *"Instalar aplicación"* o *"Agregar a la pantalla principal".*\n*IMPORTANTE:* Cuando te pida el nombre, escribe *"Cybernet Códigos"*.\n3️⃣ Confirma tocando en "Instalar" o "Agregar".\n\n🍎 *Para usuarios de iPhone (Safari)*\nAbre el navegador Safari and entra a: www.cybernetsp.com\n\n1️⃣ Toca el icono de Compartir (el cuadrado con una flecha hacia arriba) en la parte inferior.\n2️⃣ Desliza hacia arriba y selecciona: *"Agregar al inicio".*\n*IMPORTANTE:* Verás un cuadro de texto para el nombre; bórralo y escribe *"Cybernet Códigos"*.\n3️⃣ Presiona *"Agregar"* en la esquina superior derecha.\n\n✨ *¿Por qué instalarla así?*\n*Ahorro de espacio:* No ocupa memoria extra en tu teléfono como una app tradicional.\n*Comodidad:* Entras directamente con un toque desde tu pantalla de inicio.\n\n*Tip:* Coloca el icono en tu pantalla principal para que siempre tengas tus códigos a la mano cuando los necesites.`,
  },
  {
    titulo: "PRECIO NETFLIX",
    texto: `🎬✨ *NETFLIX PREMIUM* 💙🍿  \n📺 Disfruta tus series y pelis favoritas 🔥  \n\n1️⃣ 👉 1 Pantalla 💻 → 💵 $14.500  \n2️⃣ 👉 2 Pantallas 📱💻 → 💵 $26.000  \n3️⃣ 👉 3 Pantallas 📱💻📺 → 💵 $36.000  \n4️⃣ 👉 4 Pantallas 📱💻📺🖥️ → 💵 $46.000  \n5️⃣ 👉 5 Pantallas 📱💻📺🖥️📲 → 💵 $55.000  \n\n🚀 Sin cortes, sin límites, ¡solo diversión! 🎉`,
  },
  {
    titulo: "PRECIO DISNEY",
    texto: `🎬 *Disney+ disponible* 💙  \n👉 *Estándar* → $8.500  \n📺 Con anuncios, sin ESPN\n\n👉 *Premium* → $15.000  \n🚫 Sin anuncios · 🏆 ESPN incluido · 🔒 Bloqueo de perfil\n\n📲 *Tú eliges cómo disfrutar tu Disney+ favorito* 🍿✨`,
  },
  {
    titulo: "IPTV",
    texto: `📺✨ Servicio IPTV – Cybernet\n\nEl servicio de IPTV te ofrece más de 5.000 canales de TV en vivo, incluyendo contenido deportivo como ESPN, WIN Sports y mucho más 🏆🎬\n\nPara disfrutarlo sin interrupciones, asegúrate de contar con mínimo 10 Mb de internet estables 🌐⚡\n\n📌 Pasos para configurar tu IPTV, amig@:\n1️⃣ Play List Name: ingresa el Any Name que te proporcionamos.\n2️⃣ Usuario: escribe el usuario que recibiste.\n3️⃣ Clave/Contraseña: introduce la contraseña asignada.\n4️⃣ URL: copia y pega la URL exactamente como te la enviamos.\n5️⃣ Confirmar: presiona Enter para acceder.\n6️⃣ ¡Listo! Disfruta de TV en vivo, películas y series al instante 📡🍿\n\n📱 Instalación según tu dispositivo:\n📲 Android\nDescarga la app IPTV Smarters Pro desde este enlace:\n👉 Descargar aquí\n\n🍎 iOS (iPhone / iPad)\n👉 Descargar aquí\n\n💻 PC (Windows)\n👉 Descargar aquí\n\n📺 Smart TV\nTe recomendamos instalar IPTV Smarters Pro para una mejor experiencia visual y estabilidad 👌\n\n💜 Gracias por elegir Cybernet, amig@.\nTu acceso directo al entretenimiento sin límites 🚀📡✨`,
  },
  {
    titulo: "ANUNCIO",
    texto: `💬 *¡Tranquil@, amig@!* 😎  \nEse mensaje es solo una notificación temporal 📲  \nNo hay nada de qué preocuparse 😉\n\n✅ Toca *ACEPTAR* o *AHORA NO* y listo  \n🚀 Tu cuenta seguirá funcionando sin interrupciones 🎬\n\n💜 *Relájate y disfruta* En Cybernet todo fluye sin estrés ni complicaciones 🙌🍿`,
  },
  {
    titulo: "DISTRIBUIDORES",
    texto: `💼✨ *¡Precios nuevos para distribuidores!* 🚀 Aumenta tus ganancias y lleva tu negocio al siguiente nivel 💰\n\n📢 *Info clave:* 1️⃣ Recarga mínima: *$50.000* 💵  \n2️⃣ El saldo se descuenta por cada venta 📲  \n3️⃣ Identifica cada cuenta con el nombre del cliente 📋\n\n🌟 *Planes de 1 pantalla:* 🎬 Netflix – $10.000  \n🎭 Max – $3.000  \n📺 Apple TV – $3.000  \n🏰 Disney+ Premium – $10.000  \n🎥 Disney+ Estándar – $4.000  \n🍿 Prime Video Original – $5.000  \n🌸 Crunchyroll – $3.000  \n🎮 Plex – $3.000  \n🎞️ Paramount+ – $3.000  \n🎞️ MUBI – $3.000  \n⚽ Metegol – $12.000  \n📡 Vix – $3.000  \n📺 IPTV – $7.000  \n📺 YouTube (1 mes) – $10.000  \n🎶 Spotify (1 mes) – $14.000 \n🎶 YouTube Premium (1 mes) – $14.000\n🎶 Spotify (1 mes Distris) – $10.000\n🎶 Deezer (1 mes) – $8.000\n\n📌 *Aclaraciones:* 🏆 Disney+ Premium incluye Star+ y ESPN  \n👀 Disney+ Estándar incluye Star+, sin ESPN\n\n🔥💸 *Aprovecha estos precios preferenciales y multiplica tus ingresos* 📲 Ajusta tus valores de venta y obtén excelentes beneficios 🚀`,
  },
  {
    titulo: "FOTO DEL PROBLEMA",
    texto: `💬 *Amig@*, para ayudarte rápido solo necesito esto 👇\n\n📸 *Una foto o captura del error* (para ver qué aparece en tu pantalla)  \n📧 *El correo que usas en tu cuenta* (así la identifico fácil)\n\n👉 *¿No puedes enviar imagen?* No pasa nada: descríbeme con tus palabras lo que ves en pantalla 📝\n\n🔧 Con eso ya puedo revisar el problema y darte una solución rápida 🚀🙌  \n🎬 ¡Estoy aquí para que todo funcione sin complicaciones!`,
  },
  {
    titulo: "TV NETFLIX",
    texto: `📺 *¿Necesitas actualizar Netflix en tu TV?* 😄  \nSigue estos pasos sencillos para que todo funcione perfecto 👇\n\n1️⃣ En tu televisor selecciona *Usar teléfono* 2️⃣ Envíame el *código de 8 dígitos* 📝 (escrito, no en captura)  \n3️⃣ Mantén la pantalla encendida mientras activamos tu acceso 🔓\n\n⚠️ *Importante:* solo un dispositivo a la vez para evitar bloqueos o desconexiones 🚫\n\n✅ ¡Y listo! Tu cuenta quedará activa en segundos 🍿🚀`,
  },
  {
    titulo: "ESTOY DE VIAJE NETFLIX",
    texto: `🔓 *Acceso a Netflix en tu TV* 🎬📺\n\nEl mensaje que ves es parte de la nueva verificación de Netflix. No es un error de tu cuenta, solo sigue estos pasos para activarla:\n\n1️⃣ Selecciona: *ESTA ES MI CUENTA*\n2️⃣ Pulsa en: *ESTOY DE VIAJE*\n3️⃣ Gestión: Después de eso envíame el correo o la cuenta\n4️⃣ Finaliza: Dale a *ENVIAR CÓDIGO* y avísame de inmediato para entregártelo.\n\n💡 *Tip: ¡Hazlo tú mismo 24/7!* Si prefieres no esperar, usa nuestro bot disponible a cualquier hora:\n\n👉 www.cybernetsp.com _(Selecciona la opción: Estoy de viaje. Solo disponible para correos @cybernetsp.com)_`,
  },
  {
    titulo: "ACTUALIZAR HOGAR NETFLIX",
    texto: `🏠 *Actualizar Hogar Netflix* 🎬📺\n\nSi te aparece el mensaje de *"Este televisor no forma parte de tu hogar"*, no te preocupes. Sigue estos pasos para sincronizarlo de inmediato:\n\n1️⃣ Selecciona *ESTA ES MI CUENTA.*\n2️⃣ Pulsa en *ACTUALIZAR HOGAR.*\n3️⃣ Despues de eso *ME ENVIAS CORREO.* 4️⃣ Dale a *ENVIAR* y avísame de inmediato para actualizarlo.\n\n🍿 ¡Listo! Once actualizado, podrás seguir disfrutando en tu TV sin bloqueos.`,
  },
  {
    titulo: "FUERA DE CASA DISNEY",
    texto: `🔓 *Acceso a Disney+ en tu TV* 🎬✨\n\nSi te aparece el mensaje de verificación en tu televisor, no te preocupes. Sigue estos pasos rápidos para entrar:\n\n1️⃣ Selecciona *ESTA ES MI CUENTA.*\n2️⃣ Pulsa en *ESTOY FUERA DE CASA.*\n3️⃣ Despues de eso ME ENVÍAS LA CUENTA.\n4️⃣ Dale a *ENVIAR CÓDIGO* y avísame de inmediato para entregártelo.\n\n💡 *Nota:* Ten el televisor encendido en la pantalla del código, ya que estos accesos expiran rápido.\n\n💙 ¡Listo! Once ingresado, podrás seguir disfrutando de todo el contenido.`,
  },
  {
    titulo: "CAMBIO DE HOGAR DISNEY",
    texto: `🏠 *Cambiar de Hogar Disney+* 🎬✨\n\nSi te aparece el mensaje de *"Este televisor no forma parte del hogar"*, no te preocupes. Sigue estos pasos para sincronizarlo de inmediato:\n\n1️⃣ Selecciona *ESTA ES MI CUENTA.*\n2️⃣ Pulsa en *CAMBIAR DE HOGAR.*\n3️⃣ Despues de eso *ME ENVÍAS LA CUENTA.*\n4️⃣ Dale a *ENVIAR CÓDIGO* y avísame de inmediato para entregártelo.\n\n💡 *Nota:* Mantente en esa pantalla para que el código no expire y puedas ingresarlo apenas te lo envíe.\n\n💙 ¡Listo! Una vez cambiado el hogar, podrás seguir disfrutando de todo el contenido sin bloqueos.`,
  },
  {
    titulo: "SINCRONIZAR DISNEY",
    texto: `✨ Activa Disney+ en tu TV fácilmente 📺\n\nElige uno de los dos métodos para iniciar sesión:\n\n▶️ *MÉTODO 1:* Por código _(El más recomendado)_ 💻📱\n1️⃣ En tu televisor abre la aplicación de Disney+ y dale clic a "Iniciar sesión".\n👀 Te aparecerá un código de 8 dígitos en la pantalla.\n2️⃣ Desde tu celular o computador entra al navegador (Chrome o Safari) e ingresa a:\n🌐 www.disneyplus.com/es-419/begin\n3️⃣ Escribe el código del TV en la página, dale a "Continuar" e inicia sesión con el correo y contraseña que te entregamos 📧.\n\n▶️ *MÉTODO 2:* Por Red Wi-Fi _(Sincronización automática)_ 📶\n1️⃣ Asegúrate de que tu celular y tu televisor estén conectados exactamente a la misma red Wi-Fi de la casa.\n2️⃣ Abre la aplicación de Disney+ en tu celular e inicia sesión con los datos que te entregamos.\n3️⃣ Abre la aplicación de Disney+ en tu televisor y dale a "Iniciar sesión".\n4️⃣ Te saldrá un aviso automático en la pantalla de tu celular preguntando si deseas permitir el acceso. Dale a "Permitir" o "Iniciar sesión" ¡y listo!\n\n✅ En segundos tu televisor se actualizará solo y podrás disfrutar de todas tus películas y series favoritas 🍿🎬`,
  },
  {
    titulo: "SINCRONIZAR AMAZON",
    texto: `✨ *Sincroniza Amazon Prime Video en tu TV* 📺\n\n1️⃣ Desde tu celular o computador entra a:  \n🌐 www.primevideo.com/region/eu/ontv/code/ref=atv_set_rd_reg\n\n2️⃣ Ingresa los datos de la cuenta que te proporcionamos 📧  \n3️⃣ En tu TV, abre la app de Prime Video y selecciona *Identificarse* 4️⃣ Verás un código en pantalla → escríbelo en la página y pulsa *Continuar*\n\n✅ ¡Listo! Tu TV quedará sincronizado y podrás disfrutar tus series y pelis favoritas 🍿🎬`,
  },
  {
    titulo: "CAMBIO DE CLAVE NETFLIX",
    texto: `🔒✨ *Notificación de seguridad – Netflix* Hola 👋 amig@, tu contraseña de Netflix fue actualizada por motivos de seguridad 🔐.  \n\n📲 Por favor revisa que puedas ingresar sin problema desde tus dispositivos 💻📱📺  \ny confírmame por este medio ✅  \n\n💡 Esto pendiente para ayudarte con cualquier duda o ajuste adicional 🚀🙌`,
  },
  {
    titulo: "CAMBIO DE CLAVE DISNEY+",
    texto: `🔒✨ *Notificación de seguridad – Disney Premium* Hola 👋 amig@, tu contraseña de Disney Premium fue actualizada por motivos de seguridad 🔐.  \n\n📲 Por favor revisa que puedas ingresar sin problema desde tus dispositivos 💻📱📺  \ny confírmame por este medio ✅  \n\n💡 Esto pendiente para ayudarte con cualquier duda o ajuste adicional 🚀🙌`,
  },
  {
    titulo: "CEL PC NETFLIX",
    texto: `🎬✨ *Accede a tu cuenta de Netflix en segundos 📺*\n\n1️⃣ Abre: La app o página de Netflix.\n2️⃣ Selecciona: La opción *Usar código de inicio* 💻\n3️⃣ Ingresa: El correo de tu cuenta 📧\n4️⃣ Confirma: Haz clic en *Enviar código* 🔐\n5️⃣ Gestión: Reenvíame el correo que solicita el código.\n6️⃣ Finaliza: Avísame apenas tu dispositivo te pida el código para entregártelo.\n\n💡 *Tip: ¡Hazlo tú mismo 24/7!*\nSi prefieres no esperar, usa nuestro bot disponible a cualquier hora:\n👉 www.cybernetsp.com _(Selecciona la opción: Código de inicio sesión. Solo disponible para correos @cybernetsp.com)_`,
  },
  {
    titulo: "CAMBIAR PLAN",
    texto: `📺 *Mensaje en pantalla:* _"Hay demasiadas personas usando la cuenta en este momento"_\n\n😎 ¡No te preocupes! La solución es muy sencilla 👇\n\n1️⃣ Haz clic en *Cambiar* 2️⃣ Luego selecciona *Cambiar o Confirmar* 3️⃣ 🎉 ¡Listo! Todo vuelve a la normalidad y puedes seguir disfrutando sin problema 🍿\n\n👉 Si este aviso vuelve a aparecer, repite los mismos pasos sin necesidad de escribirme 🚀`,
  },
  {
    titulo: "SOPORTE",
    texto: `🧰 *Tu cuenta está en revisión técnica* 🧩⚙️  \n\n⏳ Por favor espera entre *10 a 15 minutos* y luego vuelve a ingresar para confirmar que todo quedó funcionando 📺✨  \n\n🙌 ¡Tranquil@! En pocos minutos todo estará listo  \npara que sigas disfrutando sin interrupciones 🍿🚀`,
  },
  {
    titulo: "REEMPLAZOS",
    texto: `📢 *Importante sobre tu cuenta de Netflix*\nHola 👋 Solo para aclararte: con los nuevos métodos de activación, el sistema de Netflix no conserva el historial anterior ni los perfiles personalizados. Esto es completamente normal y parte del proceso técnico que usamos para garantizar acceso estable.\n✅ ¿Por qué se hace así?\nEste método evita que Netflix active la función de “actualizar hogar”, que puede bloquear el acceso o limitar el uso en differentes dispositivos. Al usar activaciones temporales o por código, protegemos tu acceso continuo sin interrupciones.\n🎬 Aunque el historial se reinicia, puedes seguir disfrutando tus series películas favoritas sin problemas. Si necesitas ayuda para volver a encontrar lo que estaba viendo, con gusto te ayudo`,
  },
  {
    titulo: "ENLACE INICIO DE SESION",
    texto: `✨ *¡Activa tu pantalla en segundos!* 🎬\n\nPara vincular tu dispositivo, sigue estos pasos:\n\n1️⃣ En tu TV: Selecciona la opción *“Enviar enlace de inicio de sesión”*\n2️⃣ Confirma: Pulsa en el botón *“Enviar”* que aparece en pantalla\n3️⃣ Gestión: Reenvíame el correo que recibas con la solicitud del código\n4️⃣ Finaliza: Avísame en cuanto tu dispositivo te pida la aprobación\n\n🚀 *¡Ahorra tiempo!* Hazlo tú mismo 24/7 Si no quieres esperar, puedes obtener tu código al instante en nuestra web:\n\n👉 www.cybernetsp.com _(Selecciona la opción: Solicitud de inicio. Solo disponible para correos @cybernetsp.com)_`,
  },
  {
    titulo: "GARANTIA",
    texto: `✨ *¡Hola!* 😊  \nTe entrego la *garantía de tu cuenta* 🙌  \n\n📺 Por favor ingresa y cuéntame qué tal te fue 💬  \n💪 Estoy pendiente por si necesitas apoyo o alguna revisión adicional ✨  \n\n🍿 ¡Disfruta tu servicio sin preocupaciones!`,
  },
  {
    titulo: "VERIFICACION",
    texto: `¡Recibido! ✅ Procedemos a verificar tu pago en el sistema.\n\nPor favor, confírmame el nombre del titular de la cuenta desde la cual realizaste la transferencia. 📝\n\nEn un momento validamos y te hacemos la entrega activa de tu servicio. ¡Gracias por elegirnos! 🚀`,
  },
  {
    titulo: "INICIO DE SESION",
    texto: `🔒✨ *Actualización de Netflix*\n\nAl ingresar al sistema se solicitará un código. Seleccione *Obtener ayuda* y luego *Usar contraseña* para introducir la clave de su cuenta.`,
  },
];

const gridContainer = document.getElementById("grid-container");
const headerContainer = document.getElementById("header-container");

headerContainer.innerHTML = `
          <div class="card-ios w-100" style="max-width: 440px;">
            <h2 class="card-title text-center" style="justify-content:center;">${qrPrincipal.titulo}</h2>
            <img src="${qrPrincipal.imagenUrl}" alt="QR" style="max-width:210px; width:100%; border-radius:16px; border:var(--glass-border); box-shadow:var(--glass-shadow); padding:5px; background:white; margin:0 auto;" onerror="this.style.display='none'; this.nextElementSibling.innerText='Error cargando la llave QR. Revisa la conexión.'; this.nextElementSibling.style.color='var(--ios-red)';">
            <span class="text-secondary text-center" style="font-size:0.75rem; margin-top:-8px; font-weight:500;">(Mantén presionado o clic derecho para copiar imagen)</span>
            <button class="btn-ios btn-secondary copy-text-btn mt-1 w-100" data-clipboard-text="${qrPrincipal.texto.replace(/"/g, "&quot;").replace(/'/g, "&#39;")}">COPIAR TEXTO</button>
          </div>
        `;

function renderGrid(filtro = "") {
  gridContainer.innerHTML = "";
  let filtrados = [];

  for (let index = 0; index < elementosGrid.length; index++) {
    let item = elementosGrid[index];
    if (item.titulo.toLowerCase().includes(filtro.toLowerCase())) {
      filtrados.push(item);
    }
  }

  for (let f = 0; f < filtrados.length; f++) {
    let currentItem = filtrados[f];
    const card = document.createElement("div");
    card.className = "card-ios";
    card.innerHTML = `
                  <h2 class="card-title" style="justify-content:center;">${currentItem.titulo}</h2>
                  <button class="btn-ios btn-secondary copy-text-btn mt-1 w-100" data-clipboard-text="${currentItem.texto.replace(/"/g, "&quot;").replace(/'/g, "&#39;")}">COPIAR TEXTO</button>
                `;
    gridContainer.appendChild(card);
  }
}

document.getElementById("searchInput").addEventListener("input", function (e) {
  renderGrid(e.target.value);
});

const clipboard = new ClipboardJS(".copy-text-btn");

clipboard.on("success", function (e) {
  haptic();
  const btn = e.trigger;
  const card = btn.closest(".card-ios");
  const originalText = btn.textContent;

  btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡COPIADO!`;
  btn.classList.remove("btn-secondary");
  btn.classList.add("btn-danger");
  card.style.borderColor = "var(--ios-red)";
  card.style.boxShadow = "0 0 20px rgba(255, 69, 58, 0.25)";

  setTimeout(function () {
    btn.textContent = originalText;
    btn.classList.remove("btn-danger");
    btn.classList.add("btn-secondary");
    card.style.borderColor = "var(--glass-border)";
    card.style.boxShadow = "var(--glass-shadow)";
  }, 1500);
});

function actualizarPerfilesLibres(manual = false) {
  if (manual) haptic();

  const container = document.getElementById("contenedorPlataformasLibres");

  const callbackName = "cb_libres_" + Date.now();
  window[callbackName] = function (res) {
    if (res && res.status === "success" && container) {
      let htmlPildoras = "";

      if (res.data.length === 0) {
        htmlPildoras =
          '<span class="badge-ios badge-danger">Sin inventario</span>';
        container.innerHTML = htmlPildoras;
      } else {
        res.data.forEach((item) => {
          let colorBg, colorTxt, borderCol;

          if (item.libres > 2) {
            colorBg = "rgba(10, 132, 255, 0.15)";
            colorTxt = "#64d2ff";
            borderCol = "rgba(10, 132, 255, 0.3)";
          } else if (item.libres === 2) {
            colorBg = "rgba(255, 149, 0, 0.15)";
            colorTxt = "#ff9f0a";
            borderCol = "rgba(255, 149, 0, 0.4)";
          } else {
            colorBg = "rgba(255, 69, 58, 0.15)";
            colorTxt = "#ff453a";
            borderCol = "rgba(255, 69, 58, 0.4)";
          }

          htmlPildoras += `
                            <div style="background: ${colorBg}; color: ${colorTxt}; padding: 4px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; border: 1px solid ${borderCol}; display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                                <span style="text-transform: uppercase; letter-spacing: 0.5px;">${item.plat}</span>
                                <span style="font-size: 0.95rem; color: #ffffff;">${item.libres}</span>
                            </div>
                        `;
        });

        // DUPLICAR PARA QUE EL CARRUSEL SEA INFINITO (SEAMLESS LOOP)
        container.innerHTML = htmlPildoras + htmlPildoras;
      }
    }

    delete window[callbackName];
    const scriptNode = document.getElementById("node_" + callbackName);
    if (scriptNode) scriptNode.remove();
  };

  const script = document.createElement("script");
  script.id = "node_" + callbackName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerPerfilesLibres&callback=${callbackName}`;
  document.body.appendChild(script);
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    actualizarPerfilesLibres(false);
  }, 1000);

  setInterval(() => {
    actualizarPerfilesLibres(false);
  }, 300000);

  renderizarPlataformasVenta();
});

// =========================================================================
// VIGILANTE EN VIVO ULTRA COMPATIBLE CON iOS (INYECCIÓN DE DOM)
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const inputTelefonoVenta = document.getElementById("ventaTelefono");
  const selectBanco = document.getElementById("ventaBanco");
  const optNomina = document.getElementById("optPagoNomina");

  // Clonamos y guardamos la opción en la memoria antes de borrarla del menú
  let copiaOptNomina = null;
  if (optNomina) {
    copiaOptNomina = optNomina.cloneNode(true);
    optNomina.remove(); // La sacamos del menú de inmediato al cargar la página
  }

  if (inputTelefonoVenta && selectBanco && copiaOptNomina) {
    inputTelefonoVenta.addEventListener("input", function () {
      // Limpiamos el número quitando espacios, guiones o letras
      const telLimpio = this.value.replace(/\D/g, "").trim();

      // Los 4 números oficiales de tu staff
      const empleadosNumeros = [
        "3205386975",
        "3126117630",
        "3107137371",
        "3015156037",
      ];

      // Verificamos si la opción ya está metida en el select actual
      const yaExisteEnMenu = document.getElementById("optPagoNomina");

      if (empleadosNumeros.includes(telLimpio)) {
        if (!yaExisteEnMenu) {
          // Si el número coincide y no está en el menú, la inyectamos al final
          selectBanco.appendChild(copiaOptNomina);
          triggerToast(
            "✨ Teléfono de Staff detectado. Opción Nómina habilitada.",
          );
        }
      } else {
        if (yaExisteEnMenu) {
          // Si el número cambia a uno normal y la opción estaba puesta, la destruimos
          if (selectBanco.value === "NÓMINA") {
            selectBanco.selectedIndex = 0; // Reseteamos la selección
          }
          yaExisteEnMenu.remove(); // La borramos físicamente de la pantalla
        }
      }
    });
  }
});

function ejecutarAutoPulsoTiempo() {
  let lastSync =
    parseInt(sessionStorage.getItem("cyber_last_sync_time"), 10) || Date.now();
  let ahora = Date.now();
  let deltaMs = ahora - lastSync;

  let totalSeconds = Math.floor(deltaMs / 1000);
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds % 3600) / 60);
  let seconds = totalSeconds % 60;

  let tiempoTexto =
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0");
  const activeUser = sessionStorage.getItem("active_staff") || "Vendedor";

  sessionStorage.setItem("cyber_last_sync_time", ahora);

  fetch(
    "https://script.google.com/macros/s/AKfycbzWdHzqlwlAWcCuXngcurIIrZVCHl5QEhRUkHTL90dhNqfm1iXnvSvDli5G_r6zlmHY/exec",
    {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "notificarCorreo",
        tipo: "pulso",
        user: activeUser,
        tiempoTrabajado: tiempoTexto,
      }),
    },
  )
    .then(() =>
      console.log(
        "✅ Auto-Guardado: Bloque de " + tiempoTexto + " salvado en la nube.",
      ),
    )
    .catch(() => sessionStorage.setItem("cyber_last_sync_time", lastSync));
}

function ejecutarCierreSesionDefinitivo() {
  if (
    confirm("¿Estás seguro de que deseas cerrar tu sesión e informar tu turno?")
  ) {
    let lastSync =
      parseInt(sessionStorage.getItem("cyber_last_sync_time"), 10) ||
      Date.now();
    let ahora = Date.now();
    let deltaMs = ahora - lastSync;

    let totalSeconds = Math.floor(deltaMs / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    let tiempoTexto =
      String(hours).padStart(2, "0") +
      ":" +
      String(minutes).padStart(2, "0") +
      ":" +
      String(seconds).padStart(2, "0");
    const activeUser = sessionStorage.getItem("active_staff") || "Vendedor";

    fetch(
      "https://script.google.com/macros/s/AKfycbzWdHzqlwlAWcCuXngcurIIrZVCHl5QEhRUkHTL90dhNqfm1iXnvSvDli5G_r6zlmHY/exec",
      {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "notificarCorreo",
          tipo: "cierre",
          user: activeUser,
          tiempoTrabajado: tiempoTexto,
        }),
      },
    ).then(() => {
      sessionStorage.clear();
      window.location.reload();
    });
  }
}
// =========================================================================
// LÓGICA: VENTANA "TOTAL NÓMINA" (CONEXIÓN DIRECTA A SHEETS)
// =========================================================================
function abrirTotalNomina() {
  haptic();
  document.getElementById("nominaOverlay").classList.add("open");
  const btn = document.querySelector("#nominaOverlay .btn-ios.btn-secondary");
  refrescarTotalNominaEnVivo(btn);
}

function cerrarTotalNomina() {
  haptic();
  document.getElementById("nominaOverlay").classList.remove("open");
}

function refrescarTotalNominaEnVivo(btn) {
  if (btn) {
    haptic();
    btn.dataset.oldText = btn.innerHTML;
    btn.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Buscando...`;
    btn.disabled = true;
  }

  // Pone la pantalla en modo carga
  document.getElementById("nominaContentArea").innerHTML =
    "<div class='empty-log-msg'><svg class='spin-anim' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' style='vertical-align:middle; margin-right:6px;'><line x1='12' y1='2' x2='12' y2='6'></line><line x1='12' y1='18' x2='12' y2='22'></line><line x1='4.93' y1='4.93' x2='7.76' y2='7.76'></line><line x1='16.24' y1='16.24' x2='19.07' y2='19.07'></line><line x1='2' y1='12' x2='6' y2='12'></line><line x1='18' y1='12' x2='22' y2='12'></line><line x1='4.93' y1='19.07' x2='7.76' y2='16.24'></line><line x1='16.24' y1='7.76' x2='19.07' y2='4.93'></line></svg> Descargando datos de Sheets...</div>";

  // Va a buscar la info fresca a Google Apps Script
  const cbName = "cb_get_nomina_" + Date.now();
  window[cbName] = function (res) {
    if (btn) {
      btn.innerHTML = btn.dataset.oldText || "Refrescar";
      btn.disabled = false;
    }
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      renderizarTotalNomina(res.data, res.detalles);
    } else {
      document.getElementById("nominaContentArea").innerHTML =
        "<div class='empty-log-msg' style='color:var(--ios-red);'>❌ Error al conectar con Sheets.</div>";
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerNomina&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

function renderizarTotalNomina(listaNomina, detalles) {
  const userActivo = (sessionStorage.getItem("active_staff") || "")
    .toUpperCase()
    .trim();
  const isCamilo = userActivo === "CAMILO";

  if (isCamilo) {
    document.getElementById("formDescuentoCamilo").style.display = "flex";
  } else {
    document.getElementById("formDescuentoCamilo").style.display = "none";
  }

  if (!listaNomina || listaNomina.length === 0) {
    document.getElementById("nominaContentArea").innerHTML =
      "<div class='empty-log-msg'>No hay registros de nómina en Sheets.</div>";
    return;
  }

  // 🏦 DICCIONARIO DE CUENTAS NEQUI DEL STAFF
  const numerosNequi = {
    KATHERINE: "3126117630",
    MANUEL: "3205386975",
    PABLO: "3153991383",
    MANUP: "3153991383", // Por si está registrado como MANUP
    ANGELICA: "3015156037",
  };

  let html = "";
  listaNomina.forEach((empData) => {
    // Si no es Camilo, ocultar a los demás
    if (!isCamilo && empData.empleado !== userActivo) return;

    let ganado = parseFloat(empData.ganado) || 0;
    let desc = parseFloat(empData.descontado) || 0;
    let neto = parseFloat(empData.neto) || 0;
    let colorNeto = neto >= 0 ? "var(--ios-blue)" : "var(--ios-red)";

    // 💳 HTML DEL NÚMERO NEQUI (Se muestra si existe en el diccionario)
    let nequiNum = numerosNequi[empData.empleado];
    let nequiHtml = "";
    if (nequiNum) {
      nequiHtml = `
                    <div style="display:flex; align-items:center; gap:6px;">
                       <span style="background:rgba(224, 0, 150, 0.15); color:#ff37a6; padding:2px 6px; border-radius:6px; font-size:0.65rem; font-weight:800; border: 1px solid rgba(224, 0, 150, 0.3);">NEQUI</span>
                       <span style="color:var(--text-primary); font-size:0.8rem; font-family:monospace; font-weight:bold; letter-spacing: 0.5px;">${nequiNum}</span>
                       <button style="background:rgba(10, 132, 255, 0.15); border:none; border-radius:6px; width:26px; height:26px; display:flex; align-items:center; justify-content:center; color:var(--ios-blue); cursor:pointer; transition:all 0.2s;" onclick="copiarTextoRapido(this, '${nequiNum}')" title="Copiar Nequi">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                       </button>
                    </div>
                 `;
    }

    // 🔥 BOTÓN EXCLUSIVO PARA CAMILO
    let btnPagar = "";
    if (isCamilo && neto > 0) {
      btnPagar = `
                    <button class="btn-ios btn-success w-100" style="margin-top:10px; font-weight:800; font-size:0.85rem; padding:10px; display:flex; justify-content:center; align-items:center; gap:6px;" onclick="pagarNominaEmpleado('${empData.empleado}', ${neto})">
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="12" y1="1" x2="12" y2="23"></line></svg>
                       PAGAR NÓMINA
                    </button>
                 `;
    }

    html += `
               <div style="background:var(--glass-bg); border:1px solid var(--glass-border); border-left:3px solid var(--ios-blue); border-radius:10px; padding:10px 12px; margin-bottom:8px;">
                  
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;">
                      <h4 style="margin:0; font-size:0.9rem; color:var(--text-primary); text-transform:uppercase;">${empData.empleado}</h4>
                      ${nequiHtml}
                  </div>

                  <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:2px;">
                     <span style="color:var(--text-secondary);">Horas Trabajadas:</span>
                     <span style="color:var(--ios-green); font-weight:700;">$${Math.round(ganado).toLocaleString("es-CO")}</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:2px;">
                     <span style="color:var(--text-secondary);">Cuentas Consumidas:</span>
                     <span style="color:var(--ios-red); font-weight:700;">-$${Math.round(desc).toLocaleString("es-CO")}</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-top:6px; border-top:1px solid rgba(255,255,255,0.06); padding-top:6px;">
                     <span style="color:var(--text-primary); font-weight:800;">NETO A PAGAR:</span>
                     <span style="color:${colorNeto}; font-weight:800; font-size:1.1rem;">$${Math.round(neto).toLocaleString("es-CO")}</span>
                  </div>
                  ${btnPagar}
               </div>
             `;
  });

  if (html === "") {
    html = "<div class='empty-log-msg'>No se encontraron tus registros.</div>";
  }

  let detallesFiltrados = (detalles || []).filter(
    (d) => isCamilo || d.empleado === userActivo,
  );
  if (detallesFiltrados.length > 0) {
    html += `<h4 style="margin:12px 0 6px 0; color:var(--ios-orange); font-size:0.8rem;">Detalle de Descuentos</h4>`;
    detallesFiltrados.forEach((d) => {
      html += `
                    <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.04); padding:6px 10px; border-radius:8px; margin-bottom:4px; font-size:0.7rem; display:flex; justify-content:space-between; align-items:center;">
                       <div style="display:flex; flex-direction:column;">
                          <strong style="color:var(--text-primary);">${isCamilo ? d.empleado : d.detalle.split("-")[0].trim()}</strong>
                          <span style="color:var(--text-secondary); font-size:0.65rem;">${d.fecha} | ${d.detalle.includes("-") ? d.detalle.split("-")[1].trim() : ""}</span>
                       </div>
                       <strong style="color:var(--ios-red); font-size:0.85rem;">-$${Math.round(d.monto).toLocaleString("es-CO")}</strong>
                    </div>
                 `;
    });
  }

  document.getElementById("nominaContentArea").innerHTML = html;
}

// 🔥 LÓGICA QUE SE EJECUTA AL DARLE CLIC A "PAGAR NÓMINA"
window.pagarNominaEmpleado = function (empleado, netoAPagar) {
  if (
    !confirm(
      `ATENCIÓN CAMILO:\n\n¿Estás seguro de liquidar y PAGAR a ${empleado} la suma de $${Math.round(netoAPagar).toLocaleString("es-CO")}?\n\nEsto borrará todos sus turnos y descuentos de la quincena actual y lo registrará en Finanzas.`,
    )
  )
    return;

  haptic();
  const btnRef = document.querySelector(
    "#nominaOverlay .btn-ios.btn-secondary",
  );
  if (btnRef) btnRef.innerHTML = "Pagando...";

  const cbName = "cb_pagar_nom_" + Date.now();
  window[cbName] = function (res) {
    const node = document.getElementById("node_" + cbName);
    if (node) node.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Nómina pagada a ${empleado}</span></div>`,
      );
      refrescarTotalNominaEnVivo(btnRef);
      forzarRefrescoDeHoras(); // Refresca la tabla de atrás también
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de red"));
      if (btnRef) btnRef.innerHTML = "Refrescar";
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=pagarNominaEmpleado&empleado=${encodeURIComponent(empleado)}&monto=${encodeURIComponent(netoAPagar)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// =========================================================================
// 💸 APLICAR ADELANTOS O DESCUENTOS A LA NÓMINA DE UN EMPLEADO
// =========================================================================
function ejecutarDescuentoNominaManual(e) {
  e.preventDefault();
  if (typeof haptic === "function") haptic();

  const empleado = document.getElementById("descNomEmpleado").value;
  const tipo = document.getElementById("descNomTipo").value; // Extrae si es ADELANTO o DESCUENTO
  const montoRaw = document.getElementById("descNomMonto").value;
  let concepto = document.getElementById("descNomConcepto").value;

  // Limpiamos el formato de moneda para enviar solo el número al backend
  const monto = parseFloat(montoRaw.replace(/[^0-9]/g, ""));

  if (!empleado || isNaN(monto) || monto <= 0 || concepto.trim() === "") {
    alert("⚠️ Por favor completa todos los campos correctamente.");
    return;
  }

  // Unimos el tipo con el concepto para que en tu Excel se lea claro: "ADELANTO - Préstamo"
  const conceptoFinal = `${tipo} - ${concepto.trim()}`;

  const btn = document.getElementById("btnSubmitDescNom");
  const originalText = btn.innerHTML;
  btn.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:6px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg> Aplicando...`;
  btn.disabled = true;

  const scriptNode = document.createElement("script");
  const callbackName = "cbDescNom_" + Date.now();

  window[callbackName] = function (res) {
    btn.innerHTML = originalText;
    btn.disabled = false;
    delete window[callbackName];
    scriptNode.remove();

    if (res && res.status === "success") {
      alert(
        `✅ ${tipo} de $${monto.toLocaleString("es-CO")} aplicado correctamente a ${empleado}.\n\nSe descontará automáticamente de su nómina.`,
      );

      // Limpiar campos
      document.getElementById("descNomMonto").value = "";
      document.getElementById("descNomConcepto").value = "";

      // 🔥 Si tienes la función para refrescar la nómina, la llamamos aquí
      if (typeof refrescarTotalNominaEnVivo === "function") {
        const refreshBtn = document.querySelector(
          "#nominaOverlay .btn-secondary",
        );
        if (refreshBtn) refrescarTotalNominaEnVivo(refreshBtn);
      }
    } else {
      alert("❌ ERROR:\n\n" + (res ? res.message : "Desconocido"));
    }
  };

  scriptNode.id = "script_desc_nom";
  scriptNode.src =
    GOOGLE_SCRIPT_URL +
    "?action=agregarDescuentoNomina&empleado=" +
    encodeURIComponent(empleado) +
    "&monto=" +
    encodeURIComponent(monto) +
    "&concepto=" +
    encodeURIComponent(conceptoFinal) +
    "&callback=" +
    callbackName +
    "&_ts=" +
    Date.now();
  document.body.appendChild(scriptNode);
}
// =========================================================================
// LÓGICA: CAMBIO DE CUENTA INTERACTIVO (CELULAR OBLIGATORIO)
// =========================================================================
function toggleCambioPanel() {
  haptic();
  document.getElementById("cambioCuentaOverlay").classList.toggle("open");
}

// =========================================================================
// MOTOR DINÁMICO: CAMBIOS MÚLTIPLES
// =========================================================================
function agregarBloqueCambioNuevo() {
  haptic();
  const contenedor = document.getElementById("contenedorListaCambios");
  const numero = contenedor.children.length + 1;

  const div = document.createElement("div");
  div.className = "card-ios bloque-cambio-item";
  div.style =
    "padding:12px; border-left: 4px solid var(--ios-blue); background: rgba(10, 132, 255, 0.03); margin-bottom:0; position:relative;";

  div.innerHTML = `
           <button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:8px; right:8px; background:var(--ios-red); color:white; border:none; border-radius:50%; width:20px; height:20px; font-size:10px; font-weight:bold;">✕</button>
           <div class="flex-row-between mb-1">
              <span style="font-size:0.7rem; font-weight:800; color:var(--ios-blue);">PLATAFORMA #${numero}</span>
           </div>
           <select class="input-ios sel-plat-vieja" style="margin-bottom:8px;" required>
              <option value="" disabled selected>Devolver plataforma...</option>
              <option value="NETFLIX">NETFLIX</option>
              <option value="AMAZON-PRIME-VIDEO">AMAZON</option>
              <option value="DISNEY-PREMIUM">DISNEY PREMIUM</option>
              <option value="HBO-MAX">MAX</option>
              <option value="DISNEY-ESTANDAR">DISNEY ESTÁNDAR</option>
              <option value="PARAMOUNT">PARAMOUNT</option>
              <option value="VIX">VIX</option>
              <option value="CRUNCHYROLL">CRUNCHYROLL</option>
              <option value="PLEX">PLEX</option>
           </select>
           <input type="email" class="input-ios inp-correo-viejo" style="margin-bottom:8px;" placeholder="Correo actual de la cuenta" required>
           <select class="input-ios sel-plat-nueva" style="margin-bottom:0;" required>
              <option value="" disabled selected>Nueva plataforma a entregar...</option>
              <option value="NETFLIX">NETFLIX</option>
              <option value="AMAZON-PRIME-VIDEO">AMAZON</option>
              <option value="DISNEY-PREMIUM">DISNEY PREMIUM</option>
              <option value="HBO-MAX">MAX</option>
              <option value="DISNEY-ESTANDAR">DISNEY ESTÁNDAR</option>
              <option value="PARAMOUNT">PARAMOUNT</option>
              <option value="VIX">VIX</option>
              <option value="CRUNCHYROLL">CRUNCHYROLL</option>
              <option value="PLEX">PLEX</option>
           </select>
        `;
  contenedor.appendChild(div);
}

function ejecutarCambioCuenta(e) {
  e.preventDefault();
  haptic();

  const btn = document.getElementById("btnProcesarCambio");
  const telCliente = document.getElementById("cambioTelCliente").value.trim();
  const nombreCliente = document
    .getElementById("cambioNombreCliente")
    .value.trim();

  // Recolectar todos los bloques de cambio
  const bloques = document.querySelectorAll(".bloque-cambio-item");
  let cambiosArray = [];

  bloques.forEach((bloque) => {
    cambiosArray.push({
      platVieja: bloque.querySelector(".sel-plat-vieja").value,
      correoViejo: bloque.querySelector(".inp-correo-viejo").value.trim(),
      platNueva: bloque.querySelector(".sel-plat-nueva").value,
    });
  });

  if (cambiosArray.length === 0) return;

  if (
    !confirm(
      `¿Confirmas el procesamiento de ${cambiosArray.length} cambio(s) para el cliente ${telCliente}?`,
    )
  )
    return;

  btn.disabled = true;
  btn.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Procesando...`;

  const cbName = "cb_lote_" + Date.now();
  window[cbName] = function (res) {
    btn.disabled = false;
    btn.innerText = "PROCESAR CAMBIOS EN LOTE";
    const node = document.getElementById("node_" + cbName);
    if (node) node.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      // 🔥 ENCABEZADO IDÉNTICO A TU NUEVA PLANTILLA 🔥
      let nombreSaludo = nombreCliente ? " " + nombreCliente : "";
      let fichaFinal = `🌟 ¡Hola${nombreSaludo}!\n\nTu pedido ha sido procesado con éxito. Aquí tienes tus accesos:`;

      res.data.forEach((d) => {
        let perfilTexto = d.perfil ? `\n🌐 Perfil: ${d.perfil}` : "";
        if (d.pin) {
          perfilTexto += ` | PIN: ${d.pin}`; // Si tiene PIN se anota de una vez en la misma línea
        }

        // Bloque dinámico por cada plataforma del cambio
        fichaFinal += `\n\n🎬 DETALLES DE ${d.plataforma} ✅\n────────────────────\n👤 Correo: ${d.correo}\n🔐 Contraseña: ${d.clave}${perfilTexto}\n📅 Vence: ${d.vencimiento}`;
      });

      // 🔥 TEXTO DE GARANTÍA E INFO IMPORTANTE AL FINAL 🔥
      fichaFinal += `\n\n📢 INFORMACIÓN IMPORTANTE: \n────────────────────\n⚠️ Garantía activa: Tu servicio cuenta con respaldo total durante su vigencia. \n🆘 Soporte: Si presentas algún inconveniente, infórmanos de inmediato para brindarte una solución rápida.\n\n💎 Disfruta tu servicio.\n✨ ¡Gracias por elegirnos! ✨`;

      document.getElementById("cambioCuentaOverlay").classList.remove("open");
      document.getElementById("outputTextoVentaFicha").value = fichaFinal;

      const modalExito = document.getElementById("ventaGeneradaModalOverlay");
      modalExito.querySelector(".card-title").innerText = "Cambio Exitoso";
      document.getElementById("btnCopiarFichaVenta").innerHTML =
        `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar Ficha Completa`;

      let btnSaldo = document.getElementById("btnCopiarSaldoRevendedor");
      if (btnSaldo) btnSaldo.style.display = "none";

      modalExito.classList.add("open");

      // Resetear el formulario a su estado original
      document.getElementById("contenedorListaCambios").innerHTML = `
                <div class="card-ios bloque-cambio-item" style="padding:12px; border-left: 4px solid var(--ios-orange); background: rgba(255, 149, 0, 0.03); margin-bottom:0;">
                   <div class="flex-row-between mb-1"><span style="font-size:0.7rem; font-weight:800; color:var(--ios-orange);">PLATAFORMA #1</span></div>
                   <select class="input-ios sel-plat-vieja" style="margin-bottom:8px;" required><option value="" disabled selected>Devolver plataforma...</option><option value="NETFLIX">NETFLIX</option><option value="AMAZON-PRIME-VIDEO">AMAZON</option><option value="DISNEY-PREMIUM">DISNEY PREMIUM</option><option value="HBO-MAX">MAX</option><option value="DISNEY-ESTANDAR">DISNEY ESTÁNDAR</option><option value="PARAMOUNT">PARAMOUNT</option><option value="VIX">VIX</option><option value="CRUNCHYROLL">CRUNCHYROLL</option><option value="PLEX">PLEX</option></select>
                   <input type="email" class="input-ios inp-correo-viejo" style="margin-bottom:8px;" placeholder="Correo actual de la cuenta" required>
                   <select class="input-ios sel-plat-nueva" style="margin-bottom:0;" required><option value="" disabled selected>Nueva plataforma a entregar...</option><option value="NETFLIX">NETFLIX</option><option value="AMAZON-PRIME-VIDEO">AMAZON</option><option value="DISNEY-PREMIUM">DISNEY PREMIUM</option><option value="HBO-MAX">MAX</option><option value="DISNEY-ESTANDAR">DISNEY ESTÁNDAR</option><option value="PARAMOUNT">PARAMOUNT</option><option value="VIX">VIX</option><option value="CRUNCHYROLL">CRUNCHYROLL</option><option value="PLEX">PLEX</option></select>
                </div>`;
      document.getElementById("cambioTelCliente").value = "";
      document.getElementById("cambioNombreCliente").value = "";
    } else {
      alert(
        "❌ Error: " +
          (res
            ? res.message
            : "Fallo de conexión. No se pudo procesar el lote."),
      );
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=cambiarCuenta&telCliente=${encodeURIComponent(telCliente)}&nombreCliente=${encodeURIComponent(nombreCliente)}&cambiosJSON=${encodeURIComponent(JSON.stringify(cambiosArray))}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}
// =========================================================================
// 📊 LÓGICA FRONTEND: REGISTRO DE VENTAS (SEGURIDAD Y RENDERIZADO)
// =========================================================================

// ⚠️ IMPORTANTE: Aquí debes leer tu variable global que almacena la sesión actual.
// Modifica esto si tu login usa localStorage, por ejemplo: localStorage.getItem("usuarioActual")
const usuarioSesionActual = "camilo";

// 🔒 CANDADO 1: Mostrar el botón SOLO si la sesión es de "camilo"
document.addEventListener("DOMContentLoaded", function () {
  if (usuarioSesionActual.trim().toLowerCase() === "camilo") {
    const btnRegistro = document.getElementById("btnRegistroVentas");
    if (btnRegistro) btnRegistro.style.display = "flex"; // <-- Cambiado a "flex" para mantener el diseño
  }
});

// =========================================================================
// 📊 LÓGICA FRONTEND: REGISTRO DE VENTAS (LIBRE) Y BUSCADOR AVANZADO
// =========================================================================

function abrirModalRegistroVentas() {
  if (typeof haptic === "function") haptic();

  document.getElementById("modalRegistroVentas").classList.add("open");
  document.getElementById("buscadorRegistroVentas").value = ""; // Limpiar buscador
  const tbody = document.getElementById("tablaRegistroVentasBody");

  tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color: var(--text-secondary);">Cargando registros de ventas... <svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:bottom; margin-left:8px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg></td></tr>`;

  const cbName = "cb_ventas_" + Date.now();
  window[cbName] = function (res) {
    const node = document.getElementById("node_" + cbName);
    if (node) node.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      let rowsHtml = "";
      res.data.reverse(); // Ventas nuevas arriba

      res.data.forEach((row) => {
        let fechaHoraStr = row[0] || "";
        let fecha = fechaHoraStr;
        let hora = "";

        let partes = fechaHoraStr.split(" ");
        if (partes.length >= 2) {
          fecha = partes[0];
          hora = partes.slice(1).join(" ");
        }

        let nombre = row[1] || "";
        let numero = row[2] || "";
        let desc = row[3] || "";
        let valor = row[4] || "";
        let banco = row[5] || "";
        let tipo = row[6] || "";

        rowsHtml += `
                          <tr class="fila-registro-venta" style="border-bottom: 1px solid rgba(0,0,0,0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.02)'" onmouseout="this.style.background='transparent'">
                              <td class="col-fecha" style="padding: 10px 8px; color: var(--text-secondary);">${fecha}</td>
                              <td style="padding: 10px 8px; color: var(--text-secondary);">${hora}</td>
                              <td class="col-nombre" style="padding: 10px 8px; color: var(--text-primary);">${nombre}</td>
                              <td class="col-numero" style="padding: 10px 8px; color: var(--text-primary);">${numero}</td>
                              <td style="padding: 10px 8px; color: var(--ios-blue);">${desc}</td>
                              <td style="padding: 10px 8px; color: var(--ios-green);">${valor}</td>
                              <td style="padding: 10px 8px; color: var(--text-primary);">${banco}</td>
                              <td style="padding: 10px 8px; color: var(--text-secondary);">${tipo}</td>
                          </tr>
                      `;
      });

      if (res.data.length === 0) {
        rowsHtml = `<tr><td colspan="8" style="text-align:center; padding: 40px; color: var(--text-secondary);">No hay ventas registradas en la base de datos.</td></tr>`;
      }

      tbody.innerHTML = rowsHtml;
    } else {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color:var(--ios-red);">❌ Error: ${res ? res.message : "Fallo de conexión."}</td></tr>`;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerRegistroVentas&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

// 🔥 FUNCIÓN DEL BUSCADOR EN TIEMPO REAL (POR NOMBRE, NÚMERO O FECHA) 🔥
function filtrarRegistroVentas() {
  const query = document
    .getElementById("buscadorRegistroVentas")
    .value.toLowerCase()
    .trim();
  const filas = document.querySelectorAll(".fila-registro-venta");

  filas.forEach((fila) => {
    const fecha = fila.querySelector(".col-fecha").innerText.toLowerCase();
    const nombre = fila.querySelector(".col-nombre").innerText.toLowerCase();
    const numero = fila.querySelector(".col-numero").innerText.toLowerCase();

    if (
      nombre.includes(query) ||
      numero.includes(query) ||
      fecha.includes(query)
    ) {
      fila.style.display = "";
    } else {
      fila.style.display = "none";
    }
  });
}
// =========================================================================
// 🔥 LÓGICA FRONTEND: CREACIÓN AUTOMATIZADA DE CUENTAS NETFLIX 🔥
// =========================================================================

function iniciarCreacionCuentaNetflix(btn) {
  // 🛠️ FILTRO DE SEGURIDAD PREVIO: Pregunta antes de gastar recursos
  let preConfirmacion = confirm(
    "❓ ¿Estás seguro de que deseas CREAR UNA CUENTA NUEVA de Netflix en este momento?\n\n(Esto procesará un PIN de Refácil e iniciará la creación del correo)",
  );

  // Si el usuario presiona "Cancelar", la función se corta aquí y no hace nada
  if (!preConfirmacion) return;

  // Si presionó "Aceptar", continúa con el flujo normal:
  if (typeof haptic === "function") haptic();

  const contenidoOriginal = btn.innerHTML;
  btn.style.pointerEvents = "none";
  btn.innerHTML = `<div style="text-align:center; width:100%; padding: 14px;"><svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ios-blue)" stroke-width="2.5" style="margin-right:8px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> <span style="color:var(--ios-blue); font-weight:bold;">Generando credenciales...</span></div>`;

  const cbName = "cb_gen_cta_" + Date.now();
  window[cbName] = function (res) {
    btn.style.pointerEvents = "auto";
    btn.innerHTML = contenidoOriginal;

    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success" && res.data) {
      const d = res.data;

      // Inyectar datos principales en el modal
      document.getElementById("displayCtaCorreo").innerText = d.correo;
      document.getElementById("displayCtaClave").innerText = d.clave;
      document.getElementById("displayCtaPinRecarga").innerText = d.pinRecarga;

      // Construir las pildoras de los 5 pines de perfil
      let htmlPerfiles = "";
      for (let p = 1; p <= 5; p++) {
        htmlPerfiles += `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:5px 8px; border-radius:6px;">
                  <span style="color:var(--text-secondary); font-size:0.75rem;">Perfil ${p}: <b style="color:#ffffff;">${d.pinesPerfiles[p]}</b></span>
                  <span style="color:var(--ios-blue); font-size:0.7rem; cursor:pointer; font-weight:bold;" onclick="copiarTextoAisladoDirecto(this, '${d.pinesPerfiles[p]}')">Copiar</span>
                </div>`;
      }
      document.getElementById("displayCtaPinesPerfiles").innerHTML =
        htmlPerfiles;

      // Condicional de guardado: Al darle al botón verde, salta el aviso obligatorio de verificación
      const btnGuardar = document.getElementById("btnGuardarMaestroNetflix");
      btnGuardar.onclick = function () {
        let advertencia =
          "⚠️ ¡RECORDATORIO OBLIGATORIO DE SEGURIDAD! ⚠️\n\n" +
          "Debes ingresar al correo para verificar la cuenta y asegurar el acceso antes de guardarla.\n\n" +
          "¿Ya verificaste el correo de la cuenta correctamente y deseas continuar con el guardado maestro?";

        if (confirm(advertencia)) {
          document
            .getElementById("cuentaGeneradaModalOverlay")
            .classList.remove("open");
          guardarCuentaConfirmadaNetflix(btn, contenidoOriginal, d);
        }
      };

      // Desplegar el modal en pantalla
      document
        .getElementById("cuentaGeneradaModalOverlay")
        .classList.add("open");
    } else {
      alert(
        "❌ Error del Servidor: " +
          (res ? res.message : "Fallo desconocido al crear los datos."),
      );
    }
  };

  // Detector de creador para la columna L de PINESMES
  const empleadoActivo =
    typeof usuarioGlobal !== "undefined"
      ? usuarioGlobal
      : typeof userLogueado !== "undefined"
        ? userLogueado
        : "Admin/Camilo";

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=generarNuevaCuenta&user=${encodeURIComponent(empleadoActivo)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

function guardarCuentaConfirmadaNetflix(btn, contenidoOriginal, datosCuenta) {
  if (typeof haptic === "function") haptic();
  btn.style.pointerEvents = "none";
  btn.innerHTML = `<div style="text-align:center; width:100%; padding: 14px;"><svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ios-green)" stroke-width="2.5" style="margin-right:8px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> <span style="color:var(--ios-green); font-weight:bold;">Guardando en Sheets...</span></div>`;

  const cbName = "cb_save_cta_" + Date.now();
  window[cbName] = function (res) {
    btn.style.pointerEvents = "auto";
    btn.innerHTML = contenidoOriginal;

    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Cuenta inyectada al maestro.</span></div>`,
        );
      } else {
        alert("✅ Cuenta inyectada al maestro exitosamente.");
      }
    } else {
      alert("❌ Error al guardar: " + (res ? res.message : "Fallo en Sheets."));
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  const urlParams =
    `?action=confirmarGuardadoNetflix` +
    `&correo=${encodeURIComponent(datosCuenta.correo)}` +
    `&clave=${encodeURIComponent(datosCuenta.clave)}` +
    `&pinesPerfiles=${encodeURIComponent(JSON.stringify(datosCuenta.pinesPerfiles))}` +
    `&callback=${cbName}&_ts=${Date.now()}`;
  script.src = GOOGLE_SCRIPT_URL + urlParams;
  document.body.appendChild(script);
}

function copiarDatoCuentaNueva(btn, idElemento) {
  if (typeof haptic === "function") haptic();
  let texto = document.getElementById(idElemento).innerText;
  navigator.clipboard.writeText(texto).then(function () {
    let originalText = btn.innerHTML;
    btn.innerHTML = "¡Listo!";
    btn.style.background = "var(--ios-green)";
    btn.style.color = "#ffffff";
    setTimeout(function () {
      btn.innerHTML = originalText;
      btn.style.background = "";
      btn.style.color = "";
    }, 1000);
  });
}

function copiarTextoAisladoDirecto(elemento, texto) {
  if (typeof haptic === "function") haptic();
  navigator.clipboard.writeText(texto).then(function () {
    let originalText = elemento.innerText;
    elemento.innerText = "¡Copiado!";
    elemento.style.color = "var(--ios-green)";
    setTimeout(function () {
      elemento.innerText = originalText;
      elemento.style.color = "var(--ios-blue)";
    }, 1000);
  });
}

// =========================================================================
// MÓDULO WEB INTEGRADO: MOTOR DE PROMOCIONES MASIVAS
// =========================================================================
let isFetchingPromo = false;
let globalContactsPromo = [];
let currentBlockIndexPromo = 0;
const CHUNK_SIZE_PROMO = 10;

function togglePromoPanel() {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("promoOverlay");
  if (overlay) overlay.classList.toggle("open");
}

function iniciarSincronizacionPromo() {
  if (isFetchingPromo) return;

  if (typeof haptic === "function") haptic();
  isFetchingPromo = true;
  globalContactsPromo = [];
  currentBlockIndexPromo = 0;

  const btn = document.getElementById("btnFetchContacts");
  const badge = document.getElementById("badgeTotalClients");
  const blockContainer = document.getElementById("blockButtonsContainer");
  const gridContainer = document.getElementById("promoGridContainer");

  btn.disabled = true;
  btn.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 8px; vertical-align: middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Generando Promo...`;

  blockContainer.innerHTML = "";

  // 🔥 Carga centrada al 100% 🔥
  gridContainer.innerHTML = `
        <div class="status-empty" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--ios-blue); grid-column: 1 / -1; min-height: 200px;">
            <svg class="spin-anim" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
            <span style="font-weight: 600;">Extrayendo clientes...</span>
        </div>`;
  badge.innerText = "0 clientes";

  const oldScript = document.getElementById("cyber_promo_node");
  if (oldScript) oldScript.remove();

  window.procesarSincronizacionPromo = function (res) {
    isFetchingPromo = false;
    btn.disabled = false;
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 6px; vertical-align: middle;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> Generar Promo 60/40`;

    const scriptNode = document.getElementById("cyber_promo_node");
    if (scriptNode) scriptNode.remove();

    if (res && res.status === "success") {
      let data = res.data;
      if (!data || data.length === 0) {
        gridContainer.innerHTML = `<div class="status-empty" style="color:var(--ios-orange); font-weight: 600; grid-column: 1 / -1; min-height: 200px;">No quedan clientes disponibles en el Histórico.</div>`;
        return;
      }

      let uniqueMap = new Map();
      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        let tel = String(item.tel || "");
        if (tel.trim() !== "" && !uniqueMap.has(tel.trim())) {
          uniqueMap.set(tel.trim(), item);
        }
      }

      globalContactsPromo = Array.from(uniqueMap.values()).slice(0, 20);

      if (globalContactsPromo.length === 0) {
        gridContainer.innerHTML = `<div class="status-empty" style="color:var(--ios-red); font-weight: 600; grid-column: 1 / -1; min-height: 200px;">Registros inválidos en la base de datos.</div>`;
        return;
      }

      badge.innerText = `${globalContactsPromo.length} clientes`;
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Se prepararon ${globalContactsPromo.length} contactos.</span></div>`,
        );
      }

      crearBotonesBloquesPromo();
    } else {
      let errMsg = res && res.message ? res.message : "Error de conexión.";
      gridContainer.innerHTML = `<div class="status-empty" style="color:var(--ios-red); font-weight: 600; grid-column: 1 / -1; min-height: 200px;">${errMsg}</div>`;
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_promo_node";
  scriptElement.src =
    GOOGLE_SCRIPT_URL +
    "?action=generarPromosWeb&callback=procesarSincronizacionPromo&_ts=" +
    Date.now();
  document.body.appendChild(scriptElement);
}

function crearBotonesBloquesPromo() {
  const blockContainer = document.getElementById("blockButtonsContainer");
  blockContainer.innerHTML = "";

  // Contenedor en columna para los botones
  blockContainer.style.display = "flex";
  blockContainer.style.flexDirection = "column";
  blockContainer.style.gap = "8px";

  const totalBlocks = Math.ceil(globalContactsPromo.length / CHUNK_SIZE_PROMO);

  for (let i = 0; i < totalBlocks; i++) {
    let start = i * CHUNK_SIZE_PROMO + 1;
    let end = Math.min((i + 1) * CHUNK_SIZE_PROMO, globalContactsPromo.length);

    // 🔥 BOTÓN ÚNICO FUSIONADO (Muestra y Copia al mismo tiempo) 🔥
    const btn = document.createElement("button");
    btn.className = "btn-ios btn-secondary";
    btn.style.width = "100%";
    btn.style.padding = "14px";
    btn.style.margin = "0";
    btn.style.background = "rgba(10, 132, 255, 0.1)";
    btn.style.color = "var(--ios-blue)";
    btn.style.borderColor = "rgba(10, 132, 255, 0.2)";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.gap = "8px";
    btn.style.fontSize = "0.95rem";
    btn.style.fontWeight = "700";

    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar Nums Wa.me (${start}-${end})`;

    btn.onclick = function () {
      mostrarBloquePromo(i); // Actualiza la lista en pantalla
      copiarBloqueNumerosPromoIndex(this, i); // Copia al portapapeles con animación
    };

    blockContainer.appendChild(btn);
  }
  mostrarBloquePromo(0);
}

function mostrarBloquePromo(blockIndex) {
  if (typeof haptic === "function") haptic();
  currentBlockIndexPromo = blockIndex;

  const allBtns = document.querySelectorAll(
    "#blockButtonsContainer .btn-block",
  );
  allBtns.forEach((b) => b.classList.remove("active"));
  const activeBtn = document.getElementById(`btnBlockPromo_${blockIndex}`);
  if (activeBtn) activeBtn.classList.add("active");

  const startIndex = blockIndex * CHUNK_SIZE_PROMO;
  const endIndex = startIndex + CHUNK_SIZE_PROMO;
  const loteActual = globalContactsPromo.slice(startIndex, endIndex);

  const gridContainer = document.getElementById("promoGridContainer");
  gridContainer.innerHTML = "";

  loteActual.forEach((item, localIndex) => {
    const absoluteIndex = startIndex + localIndex;
    const visualIndex = absoluteIndex + 1;

    // 🔥 Uso de String() para evitar crasheos silenciosos por formatos de Google Sheets 🔥
    let telSeguro = String(item.tel || "");

    const card = document.createElement("div");
    card.className = "contact-card";
    card.style.padding = "10px 14px";
    card.innerHTML = `
            <div class="contact-left">
                <div class="index-badge" style="width:26px; height:26px; font-size:0.8rem;">${visualIndex}</div>
                <div class="phone-text" id="phone_text_promo_${absoluteIndex}" style="font-size:0.95rem;">${telSeguro}</div>
            </div>
            <div class="contact-right">
                <button class="btn-icon" title="Copiar Mensaje de Promo" onclick="copiarMensajePromoIndividual(this, ${absoluteIndex})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
            </div>
        `;
    gridContainer.appendChild(card);
  });
}

// 🔥 FUNCIÓN: Copia el mensaje individual usando la variable en memoria para evitar fallos de salto de línea
function copiarMensajePromoIndividual(btnElement, index) {
  if (typeof haptic === "function") haptic();
  let item = globalContactsPromo[index];
  if (!item) return;

  let textoToCopy = String(item.mensaje || "");

  navigator.clipboard
    .writeText(textoToCopy)
    .then(() => {
      efectoBotonExitoPromo(btnElement);
      marcarNumeroComoEnviadoPromo(index);
    })
    .catch(() => {
      const textarea = document.createElement("textarea");
      textarea.value = textoToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();

      efectoBotonExitoPromo(btnElement);
      marcarNumeroComoEnviadoPromo(index);
    });
}

// 🔥 FUNCIÓN: Copia el bloque de Wa.me completo según el índice que tocaste
function copiarBloqueNumerosPromoIndex(btn, blockIndex) {
  if (typeof haptic === "function") haptic();
  if (!globalContactsPromo || globalContactsPromo.length === 0) return;

  const startIndex = blockIndex * CHUNK_SIZE_PROMO;
  const endIndex = startIndex + CHUNK_SIZE_PROMO;
  const loteActual = globalContactsPromo.slice(startIndex, endIndex);

  let texto = "";
  loteActual.forEach((item, idx) => {
    let telStr = String(item.tel || "");
    let telLimpio = telStr.replace(/\D/g, "");
    if (telLimpio !== "" && !telLimpio.startsWith("57"))
      telLimpio = "57" + telLimpio;

    texto += `${startIndex + idx + 1}. wa.me/${telLimpio}\n`;
  });

  navigator.clipboard
    .writeText(texto)
    .then(() => {
      let originalHTML = btn.innerHTML;
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡COPIADO!`;
      btn.style.background = "var(--ios-green)";
      btn.style.color = "white";
      btn.style.borderColor = "transparent";

      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Bloque ${blockIndex + 1} copiado</span></div>`,
        );
      }

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = "rgba(10, 132, 255, 0.1)";
        btn.style.color = "var(--ios-blue)";
        btn.style.borderColor = "rgba(10, 132, 255, 0.2)";
      }, 1500);
    })
    .catch((err) => alert("Error al copiar bloque."));
}

function marcarNumeroComoEnviadoPromo(index) {
  const phoneEl = document.getElementById("phone_text_promo_" + index);
  if (phoneEl) phoneEl.classList.add("crossed-out");
}

function efectoBotonExitoPromo(btn) {
  const originalHTML = btn.innerHTML;
  btn.classList.add("success");
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px; height:18px;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  setTimeout(() => {
    btn.classList.remove("success");
    btn.innerHTML = originalHTML;
  }, 1500);
}
// =========================================================================
// MÓDULO WEB INTEGRADO: RECORDATORIOS DE PAGO (W1 & W2)
// =========================================================================
window.estadoW1 = { data: [], tachados: new Set(), periodo: "hoy" };
window.estadoW2 = { data: [], tachados: new Set(), periodo: "tres_dias" };

function toggleRecordatoriosPanel() {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("recordatoriosOverlay");
  if (overlay) overlay.classList.toggle("open");
}

function guardarEstadoRecordatorios(refName) {
  let estado = refName === "W1" ? window.estadoW1 : window.estadoW2;
  let obj = {
    data: estado.data,
    tachados: Array.from(estado.tachados),
    periodo: document.getElementById("periodo" + refName).value,
  };
  localStorage.setItem("cyber_reminders_" + refName, JSON.stringify(obj));
}

function cargarEstadoRecordatorios() {
  ["W1", "W2"].forEach((refName) => {
    let guardado = localStorage.getItem("cyber_reminders_" + refName);
    if (guardado) {
      let parsed = JSON.parse(guardado);
      let estado = refName === "W1" ? window.estadoW1 : window.estadoW2;
      estado.data = parsed.data || [];
      estado.tachados = new Set(parsed.tachados || []);
      estado.periodo =
        parsed.periodo || (refName === "W1" ? "hoy" : "tres_dias");

      let selectEl = document.getElementById("periodo" + refName);
      if (selectEl) selectEl.value = estado.periodo;

      if (estado.data.length > 0) {
        document.getElementById("contador" + refName).innerText =
          `${estado.data.length} clientes`;
        renderizarBloquesRecordatorios(
          estado.data,
          "bloques" + refName,
          refName,
        );
        renderizarListaRecordatorios(
          estado,
          "listaIndividual" + refName,
          refName,
        );
      }
    }
  });
}

// Cargar el historial guardado cuando se cargue la página
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    cargarEstadoRecordatorios();
  }, 500);
});

function sincronizarW1() {
  if (typeof haptic === "function") haptic();
  const containerLista = document.getElementById("listaIndividualW1");
  const containerBloques = document.getElementById("bloquesW1");
  const periodo = document.getElementById("periodoW1").value;

  // Se le añade grid-column: 1 / -1; para centrarlo en la nueva rejilla
  containerLista.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-secondary); grid-column: 1 / -1;"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg><br>Escaneando Sheets...</div>`;
  containerBloques.innerHTML = `<div style="text-align:center; padding:15px; color:var(--text-secondary); font-size:0.85rem; grid-column: span 2;">Procesando...</div>`;

  const oldScript = document.getElementById("cyber_rem_w1");
  if (oldScript) oldScript.remove();

  window.cbRespuestaW1 = function (res) {
    const scriptNode = document.getElementById("cyber_rem_w1");
    if (scriptNode) scriptNode.remove();

    if (res && res.status === "success") {
      window.estadoW1.data = res.data;
      window.estadoW1.tachados = new Set();
      window.estadoW1.periodo = periodo;
      guardarEstadoRecordatorios("W1");

      document.getElementById("contadorW1").innerText =
        `${res.data.length} clientes`;

      if (res.data.length === 0) {
        containerLista.innerHTML = `<div style="text-align:center; padding:20px; color:var(--ios-green); font-weight:bold; grid-column: 1 / -1;">Todo limpio para W1.</div>`;
        containerBloques.innerHTML = "";
        return;
      }

      renderizarBloquesRecordatorios(window.estadoW1.data, "bloquesW1", "W1");
      renderizarListaRecordatorios(window.estadoW1, "listaIndividualW1", "W1");
    } else {
      containerLista.innerHTML = `<div style="text-align:center; padding:20px; color:var(--ios-red); grid-column: 1 / -1;">Error de conexión</div>`;
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_rem_w1";
  scriptElement.src = `${GOOGLE_SCRIPT_URL}?action=obtenerRecordatorios&periodo=${encodeURIComponent(periodo)}&callback=cbRespuestaW1&_ts=${Date.now()}`;
  document.body.appendChild(scriptElement);
}

function sincronizarW2() {
  if (typeof haptic === "function") haptic();
  const containerLista = document.getElementById("listaIndividualW2");
  const containerBloques = document.getElementById("bloquesW2");
  const periodo = document.getElementById("periodoW2").value;

  containerLista.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-secondary); grid-column: 1 / -1;"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg><br>Escaneando Sheets...</div>`;
  containerBloques.innerHTML = `<div style="text-align:center; padding:15px; color:var(--text-secondary); font-size:0.85rem; grid-column: span 2;">Procesando...</div>`;

  const oldScript = document.getElementById("cyber_rem_w2");
  if (oldScript) oldScript.remove();

  window.cbRespuestaW2 = function (res) {
    const scriptNode = document.getElementById("cyber_rem_w2");
    if (scriptNode) scriptNode.remove();

    if (res && res.status === "success") {
      window.estadoW2.data = res.data;
      window.estadoW2.tachados = new Set();
      window.estadoW2.periodo = periodo;
      guardarEstadoRecordatorios("W2");

      document.getElementById("contadorW2").innerText =
        `${res.data.length} clientes`;

      if (res.data.length === 0) {
        containerLista.innerHTML = `<div style="text-align:center; padding:20px; color:var(--ios-green); font-weight:bold; grid-column: 1 / -1;">Todo limpio para W2.</div>`;
        containerBloques.innerHTML = "";
        return;
      }

      renderizarBloquesRecordatorios(window.estadoW2.data, "bloquesW2", "W2");
      renderizarListaRecordatorios(window.estadoW2, "listaIndividualW2", "W2");
    } else {
      containerLista.innerHTML = `<div style="text-align:center; padding:20px; color:var(--ios-red); grid-column: 1 / -1;">Error de conexión</div>`;
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_rem_w2";
  scriptElement.src = `${GOOGLE_SCRIPT_URL}?action=obtenerRecordatorios&periodo=${encodeURIComponent(periodo)}&callback=cbRespuestaW2&_ts=${Date.now()}`;
  document.body.appendChild(scriptElement);
}
function renderizarBloquesRecordatorios(dataArray, contenedorId, refName) {
  const container = document.getElementById(contenedorId);
  container.innerHTML = "";

  let total = dataArray.length;
  let tamanoBloque = 20;
  let totalBloques = Math.ceil(total / tamanoBloque);

  for (let b = 0; b < totalBloques; b++) {
    let inicio = b * tamanoBloque + 1;
    let fin = Math.min((b + 1) * tamanoBloque, total);

    let btn = document.createElement("button");
    btn.className = "btn-ios btn-secondary";
    btn.style.fontSize = "0.85rem";
    btn.style.padding = "10px";
    let defaultClass =
      refName === "W1" ? "var(--ios-purple)" : "var(--ios-green)";

    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${defaultClass}" stroke-width="2.5" style="margin-right:4px; vertical-align:middle;"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Bloque (${inicio}-${fin})`;

    btn.onclick = function () {
      if (typeof haptic === "function") haptic();
      let bloqueTexto = "";
      for (let i = b * tamanoBloque; i < fin; i++) {
        bloqueTexto += `${i + 1}. wa.me/${dataArray[i].tel}\n`;
      }

      navigator.clipboard.writeText(bloqueTexto.trim()).then(() => {
        let originalHTML = btn.innerHTML;
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:4px; vertical-align:middle;"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡Copiado!`;
        btn.style.background = defaultClass;
        btn.style.color = "white";
        btn.style.borderColor = "transparent";

        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:${defaultClass};"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Bloque copiado</span></div>`,
          );
        }

        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.background = "";
          btn.style.color = "";
          btn.style.borderColor = "";
        }, 1200);
      });
    };
    container.appendChild(btn);
  }
}

function renderizarListaRecordatorios(estadoObj, contenedorId, refName) {
  const container = document.getElementById(contenedorId);
  let html = "";
  let defaultColor =
    refName === "W1" ? "var(--ios-purple)" : "var(--ios-green)";

  estadoObj.data.forEach((item, index) => {
    let msgEscaped = encodeURIComponent(item.mensaje);
    let rowId = `row-${refName}-${index}`;
    let isTachado = estadoObj.tachados.has(index);

    let bgRow = isTachado ? "rgba(48, 209, 88, 0.05)" : "var(--input-bg)";
    let borderRow = isTachado ? "var(--ios-green)" : "var(--glass-border)";
    let opacityRow = isTachado ? "0.5" : "1";
    let colorNum = isTachado ? "white" : "var(--text-secondary)";
    let bgNum = isTachado ? "var(--ios-green)" : "rgba(118, 118, 128, 0.15)";
    let textDecor = isTachado ? "line-through" : "none";
    let colorText = isTachado ? "var(--text-secondary)" : defaultColor;

    html += `
            <div id="${rowId}" style="background: ${bgRow}; border: 1px solid ${borderRow}; border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; opacity: ${opacityRow}; transition: all 0.3s ease;">
                <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                    <div style="font-size: 0.85rem; font-weight: 800; color: ${colorNum}; background: ${bgNum}; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">${index + 1}</div>
                    <div style="font-size: 0.95rem; font-family: monospace; font-weight: bold; color: ${colorText}; text-decoration: ${textDecor}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: all 0.3s ease;">${item.tel}</div>
                </div>
                <button class="btn-ios btn-secondary" style="padding: 8px 12px; color: ${defaultColor}; margin: 0;" onclick="copiarMsgRecordatorio(this, '${msgEscaped}', '${rowId}', '${refName}', ${index})">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
            </div>`;
  });
  container.innerHTML = html;
}

function copiarMsgRecordatorio(btn, msgEncoded, rowId, refName, indexObj) {
  if (typeof haptic === "function") haptic();
  const mensajeFinal = decodeURIComponent(msgEncoded);

  navigator.clipboard
    .writeText(mensajeFinal)
    .then(() => {
      marcarTachadoRecordatorio(btn, rowId, refName, indexObj);
    })
    .catch(() => {
      const textarea = document.createElement("textarea");
      textarea.value = mensajeFinal;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      marcarTachadoRecordatorio(btn, rowId, refName, indexObj);
    });
}

function marcarTachadoRecordatorio(btn, rowId, refName, indexObj) {
  if (refName === "W1") {
    window.estadoW1.tachados.add(indexObj);
    guardarEstadoRecordatorios("W1");
  }
  if (refName === "W2") {
    window.estadoW2.tachados.add(indexObj);
    guardarEstadoRecordatorios("W2");
  }

  const row = document.getElementById(rowId);
  if (row) {
    row.style.background = "rgba(48, 209, 88, 0.05)";
    row.style.borderColor = "var(--ios-green)";
    row.style.opacity = "0.5";
    row.children[0].children[0].style.background = "var(--ios-green)";
    row.children[0].children[0].style.color = "white";
    row.children[0].children[1].style.textDecoration = "line-through";
    row.children[0].children[1].style.color = "var(--text-secondary)";
  }

  const originalHTML = btn.innerHTML;
  btn.style.background = "var(--ios-green)";
  btn.style.color = "white";
  btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  setTimeout(() => {
    btn.style.background = "";
    btn.style.color = "";
    btn.innerHTML = originalHTML;
  }, 1500);
}
// =========================================================================
// MÓDULO WEB INTEGRADO: SALDOS DE DISTRIBUIDORES (SOLO LECTURA)
// =========================================================================
function toggleDistrisPanel() {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("distrisOverlay");
  if (overlay) {
    overlay.classList.toggle("open");
    // Sincroniza al instante cuando se abre el panel
    if (overlay.classList.contains("open")) {
      cargarDistribuidores();
    }
  }
}

function formatearMonedaDistris(valorStr) {
  let valorNum = parseFloat(String(valorStr).replace(/[^\d.-]/g, ""));
  if (isNaN(valorNum)) return "$0";
  if (valorNum > 0 && valorNum < 1000) valorNum = valorNum * 1000;
  return "$" + valorNum.toLocaleString("es-CO");
}

function copiarSaldoDistri(btn, nombre, saldoFormateado) {
  if (typeof haptic === "function") haptic();
  const textoWhatsApp = `*CYBERNET STREAMING* 🚀\n\nEstimado(a) *${nombre}*,\n\nTe informamos que tu saldo disponible actual en el sistema es de: *${saldoFormateado}* 💵\n\n¡Gracias por tu confianza y preferencia! ✨`;

  navigator.clipboard.writeText(textoWhatsApp).then(() => {
    let originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    btn.style.color = "var(--ios-green)";
    btn.style.background = "rgba(48, 209, 88, 0.15)";
    btn.style.borderColor = "rgba(48, 209, 88, 0.3)";

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Saldo copiado</span></div>`,
      );
    }

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.color = "";
      btn.style.background = "";
      btn.style.borderColor = "";
    }, 1500);
  });
}

function cargarDistribuidores() {
  const tbody = document.getElementById("tablaDistribuidores");
  tbody.innerHTML =
    '<tr><td colspan="2" style="text-align: center; padding: 20px; color: var(--text-secondary);"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg><br>Sincronizando saldos...</td></tr>';

  const oldScript = document.getElementById("script_get_distris_view");
  if (oldScript) oldScript.remove();

  window.procesarDistribuidoresView = function (res) {
    const scriptNode = document.getElementById("script_get_distris_view");
    if (scriptNode) scriptNode.remove();
    delete window.procesarDistribuidoresView;

    if (res && res.status === "success") {
      let data = res.data;
      if (data.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="2" style="text-align: center; padding: 20px; color: var(--text-secondary);">No hay distribuidores registrados.</td></tr>';
        return;
      }

      // Ordena de mayor a menor saldo
      data.sort(function (a, b) {
        let saldoA = parseFloat(String(a.saldo).replace(/[^\d.-]/g, "")) || 0;
        let saldoB = parseFloat(String(b.saldo).replace(/[^\d.-]/g, "")) || 0;
        if (saldoA > 0 && saldoA < 1000) saldoA = saldoA * 1000;
        if (saldoB > 0 && saldoB < 1000) saldoB = saldoB * 1000;
        return saldoB - saldoA;
      });

      let html = "";
      for (let i = 0; i < data.length; i++) {
        let d = data[i];
        let saldoLimpio =
          parseFloat(String(d.saldo).replace(/[^\d.-]/g, "")) || 0;
        if (saldoLimpio > 0 && saldoLimpio < 1000)
          saldoLimpio = saldoLimpio * 1000;

        let colorSaldo =
          saldoLimpio > 5000 ? "var(--ios-green)" : "var(--ios-red)";
        let saldoTexto = formatearMonedaDistris(d.saldo);
        let nombreLimpioParaClick = d.nombre.replace(/'/g, "\\'");

        html += `
                    <tr class="distri-row" style="border-bottom: 0.5px solid rgba(255,255,255,0.05); transition: background 0.2s;">
                        <td style="padding: 12px 10px;">
                            <strong style="color: var(--text-primary); font-size: 0.95rem;">${d.nombre}</strong><br>
                            <span style="color:var(--text-secondary); font-size:0.8rem; font-family: monospace;">${d.telefono}</span>
                        </td>
                        <td style="padding: 12px 10px; font-family: monospace; font-size: 1.05rem; font-weight: bold; color: ${colorSaldo}; white-space: nowrap; display: flex; align-items: center; justify-content: space-between;">
                            ${saldoTexto}
                            <button class="btn-ios btn-secondary" style="padding: 6px 10px; font-size: 0.75rem; margin: 0; display: flex; align-items: center; justify-content: center;" onclick="copiarSaldoDistri(this, '${nombreLimpioParaClick}', '${saldoTexto}')" title="Copiar reporte de saldo">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            </button>
                        </td>
                    </tr>`;
      }
      tbody.innerHTML = html;
    } else {
      tbody.innerHTML = `<tr><td colspan="2" style="text-align: center; padding: 20px; color: var(--ios-red);">❌ Error al cargar datos.</td></tr>`;
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "script_get_distris_view";
  scriptElement.src =
    GOOGLE_SCRIPT_URL +
    "?action=obtenerDistribuidores&callback=procesarDistribuidoresView&_ts=" +
    Date.now();
  document.body.appendChild(scriptElement);
}

function filtrarTablaRevendedores() {
  const query = document
    .getElementById("searchTablaDistris")
    .value.toLowerCase();
  const rows = document.querySelectorAll(".distri-row");
  for (let i = 0; i < rows.length; i++) {
    rows[i].style.display = rows[i].innerText.toLowerCase().includes(query)
      ? ""
      : "none";
  }
}

// =========================================================================
// 📈 MÓDULO FINANCIERO INTEGRADO (SPA) - RESTAURADO
// =========================================================================

let globalFinanzasData = null;
let activePeriod = "mes";
let isWorking = false;
let activeQueryId = 0;
let activeRentabilidadQueryId = 0;
let currentMiGananciaBruta = 0;
const mesesArray = [
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

function toggleFinanzasPanel() {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("finanzasOverlay");
  if (overlay) {
    overlay.classList.toggle("open");
    if (overlay.classList.contains("open")) {
      construirSelectores();
      cargarDashboardFinanzas();
    }
  }
}

function filtrarHoy() {
  const hoy = new Date();
  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");
  if (mSelect && dSelect) {
    mSelect.value = mesesArray[hoy.getMonth()];
    dSelect.value = hoy.getDate();
    actualizarFiltrosUI();
  }
}

function filtrarAyer() {
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");
  if (mSelect && dSelect) {
    mSelect.value = mesesArray[ayer.getMonth()];
    dSelect.value = ayer.getDate();
    actualizarFiltrosUI();
  }
}
function filtrarMes() {
  if (typeof haptic === "function") haptic();
  const hoy = new Date();
  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");
  if (mSelect && dSelect) {
    mSelect.value = mesesArray[hoy.getMonth()];
    dSelect.value = "TODOS"; // Fuerza el selector a "Todo el mes"
    actualizarFiltrosUI();
  }
}

function formatMoneda(v) {
  return (
    "$" +
    parseFloat(v || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })
  );
}

function construirSelectores() {
  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");

  if (mSelect.options.length > 0) return;

  mSelect.innerHTML = "";
  mesesArray.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.innerText = m.charAt(0) + m.slice(1).toLowerCase();
    mSelect.appendChild(opt);
  });

  dSelect.innerHTML = '<option value="TODOS">Todo el mes</option>';
  for (let i = 1; i <= 31; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.innerText = "Día " + i;
    dSelect.appendChild(opt);
  }
  mSelect.selectedIndex = new Date().getMonth();
}

function actualizarFiltrosUI() {
  const mes = document.getElementById("appleMonthSelect").value;
  const dia = document.getElementById("appleDaySelect").value;
  activePeriod = dia === "TODOS" ? "mes" : "dia";

  document.getElementById("txtPeriodoLabel").innerText =
    activePeriod === "mes" ? "Caja Real Mensual" : "Caja Real del Día";
  document.getElementById("txtLibroHeader").innerText = "Libro de " + mes;

  cargarDashboardFinanzas();
}

// 💥 AQUÍ SE RESTAURA EL DISEÑO DE LAS BARRAS DE RENTABILIDAD
function cargarRentabilidadPlataformas() {
  const container = document.getElementById("rankingPlataformasVentas");
  if (!container) return;
  container.innerHTML =
    '<div class="empty-log-msg">Calculando rentabilidad...</div>';

  const mes = document.getElementById("appleMonthSelect").value || "MAYO";
  const currentQueryId = ++activeRentabilidadQueryId;
  const callbackName = `renderRentCallback_${currentQueryId}`;

  document
    .querySelectorAll(".rent-engine-node")
    .forEach((node) => node.remove());

  window[callbackName] = function (res) {
    delete window[callbackName];
    if (currentQueryId !== activeRentabilidadQueryId) return;

    if (res.status === "success") {
      let html = "";
      let data = res.data;

      if (data.length === 0) {
        container.innerHTML =
          '<div class="empty-log-msg">No hay ventas registradas.</div>';
        return;
      }

      let maxGanancia =
        Math.max(...data.map((d) => Math.abs(d.gananciaNeta))) || 1;
      let colors = [
        "var(--ios-purple)",
        "var(--ios-blue)",
        "var(--ios-orange)",
        "var(--ios-green)",
        "#ff453a",
      ];

      data.forEach((r, idx) => {
        let color =
          r.gananciaNeta < 0 ? "var(--ios-red)" : colors[idx % colors.length];
        let pctBar = Math.round((Math.abs(r.gananciaNeta) / maxGanancia) * 100);

        html += `
                    <div class="bar-row">
                        <div class="bar-meta">
                        <span style="color:var(--text-primary); font-weight:700;">${r.plataforma} <span style="color:var(--text-secondary); font-size:0.75rem; font-weight:500;">(${r.ventas} ventas)</span></span>
                        <div style="display:flex; flex-direction:column; text-align:right;">
                            <span style="color:${color}; font-weight:800; font-size:1.05rem;">${formatMoneda(r.gananciaNeta)} <span style="font-size:0.7rem; color:var(--text-secondary);">NETO</span></span>
                            <span style="font-size:0.7rem; color:var(--text-secondary);">Bruto: ${formatMoneda(r.ingresoBruto)}</span>
                        </div>
                        </div>
                        <div class="bar-track" style="height: 8px; background: rgba(255,255,255,0.05); margin-top:2px;">
                        <div class="bar-fill" style="width: ${pctBar}%; background: ${color}; box-shadow: 0 0 10px ${color};"></div>
                        </div>
                    </div>
                `;
      });
      container.innerHTML = html;
    }
  };

  const script = document.createElement("script");
  script.classList.add("rent-engine-node");
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerRentabilidad&mes=${mes}&callback=${callbackName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

function cargarDashboardFinanzas() {
  const container = document.getElementById("listaDesgloseGastos");
  container.innerHTML =
    '<div class="empty-log-msg">Conectando con Google Cloud Contable...</div>';

  const mes = document.getElementById("appleMonthSelect").value || "MAYO";
  const dia = document.getElementById("appleDaySelect").value || "TODOS";
  const currentQueryId = ++activeQueryId;
  const callbackName = `renderCallback_${currentQueryId}`;

  cargarRentabilidadPlataformas();
  document
    .querySelectorAll(".fin-engine-node")
    .forEach((node) => node.remove());

  window[callbackName] = function (res) {
    delete window[callbackName];
    if (currentQueryId !== activeQueryId) return;

    if (res.status === "success") {
      globalFinanzasData = res.data;
      renderDashboard();
    } else {
      container.innerHTML = `<div class="empty-log-msg" style="color:var(--ios-red);">Error al actualizar balances.</div>`;
    }
  };

  const script = document.createElement("script");
  script.classList.add("fin-engine-node");
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerDashboardFinanzas&mes=${mes}&dia=${dia}&callback=${callbackName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

function calcularDescuentoDeuda() {
  const modo = document.getElementById("modoDescuentoDeuda").value;
  const deudaInput = document
    .getElementById("valDeudaTotal")
    .value.replace(/\D/g, "");
  const deuda = parseFloat(deudaInput) || 0;

  document.getElementById("divDiasDeuda").style.display =
    modo === "dias" ? "block" : "none";

  let descuento = 0;
  if (deuda > 0) {
    if (modo === "90") {
      descuento = Math.round(currentMiGananciaBruta * 0.9);
      if (descuento > deuda) descuento = deuda;
    } else {
      let dias = parseInt(document.getElementById("inputDiasDeuda").value) || 1;
      descuento = Math.round(deuda / dias);
    }
  }
  document.getElementById("valDescuentoHoy").innerText =
    formatMoneda(descuento);
}

function renderDashboard() {
  if (!globalFinanzasData) return;
  const d = globalFinanzasData[activePeriod];
  if (!d) return;

  document.getElementById("valDeudaTotal").value = formatMoneda(
    globalFinanzasData.deudaActual || 0,
  );

  const netEl = document.getElementById("val_neto");
  netEl.innerText = formatMoneda(d.neto);
  netEl.style.color = d.neto >= 0 ? "var(--ios-green)" : "var(--ios-red)";

  let sumaIngresoExtra = 0,
    sumaJeisson = 0,
    sumaAngelica = 0;
  const itemsTemp = globalFinanzasData.listaDetallada || [];

  itemsTemp.forEach((item) => {
    const cat = (item.categoria || "").toLowerCase();
    const det = (item.detalle || "").toLowerCase();
    if (item.tipo === "INGRESO") {
      let val = parseFloat(item.monto) || 0;
      if (cat.includes("angelica") || det.includes("angelica"))
        sumaAngelica += val;
      else if (
        cat.includes("ingreso extra") ||
        det.includes("jeisson") ||
        cat.includes("jeisson")
      ) {
        sumaIngresoExtra += val;
        if (det.includes("jeisson") || cat.includes("jeisson"))
          sumaJeisson += val;
      }
    }
  });

  document.getElementById("valProyJeisson").innerText =
    formatMoneda(sumaJeisson);
  let ventasBrutasReales = Math.max(
    0,
    (d.ingresos || 0) - sumaIngresoExtra - sumaAngelica,
  );

  document.getElementById("val_ingresos").innerText =
    formatMoneda(ventasBrutasReales);
  document.getElementById("val_gastos").innerText = formatMoneda(d.gastos);
  document.getElementById("val_inversiones").innerText = formatMoneda(
    d.inversiones,
  );
  document.getElementById("val_nomina").innerText = formatMoneda(d.nomina);

  let pM = 28,
    pNom = 17,
    pNeg = 55;
  const m = document.getElementById("appleMonthSelect").value;
  const dia = document.getElementById("appleDaySelect").value;

  if (m === "MAYO") {
    if (dia !== "TODOS" && parseInt(dia) <= 15) {
      pM = 30;
      pNom = 15;
    } else if (dia === "TODOS") {
      pM = 29;
      pNom = 16;
    }
  }

  document.getElementById("lblPorcMio").innerText = pM;
  document.getElementById("lblPorcNegocio").innerText = pNeg;
  document.getElementById("lblPorcNomina").innerText = pNom;

  let base = ventasBrutasReales;
  let miGananciaNeta =
    Math.round(base * (pM / 100)) + (sumaIngresoExtra - sumaJeisson);

  document.getElementById("valProyMio").innerText =
    formatMoneda(miGananciaNeta);
  document.getElementById("valProyNegocio").innerText = formatMoneda(
    Math.round(base * (pNeg / 100)),
  );
  document.getElementById("valProyNomina").innerText = formatMoneda(
    Math.round(base * (pNom / 100)),
  );

  currentMiGananciaBruta = miGananciaNeta + sumaJeisson;
  document.getElementById("valProyMioMasJeisson").innerText = formatMoneda(
    currentMiGananciaBruta,
  );

  const totalFlujo = ventasBrutasReales + d.gastos + d.inversiones + d.nomina;
  let pctIn =
    totalFlujo > 0 ? Math.round((ventasBrutasReales / totalFlujo) * 100) : 0;
  let pctOut =
    totalFlujo > 0
      ? Math.round(((d.gastos + d.inversiones + d.nomina) / totalFlujo) * 100)
      : 0;

  document.getElementById("txtBarPorcIngresos").innerText = pctIn + "%";
  document.getElementById("barFillIngresos").style.width = pctIn + "%";
  document.getElementById("txtBarPorcGastos").innerText = pctOut + "%";
  document.getElementById("barFillGastos").style.width = pctOut + "%";

  const circVentas = 251.3;
  const strokeDashoffsetVentas = circVentas - (pctIn / 100) * circVentas;
  const ringVentas = document.getElementById("appleRingVentas");
  if (ringVentas) {
    ringVentas.style.strokeDasharray = circVentas;
    ringVentas.style.strokeDashoffset = strokeDashoffsetVentas;
  }

  const circGastos = 163.3;
  const strokeDashoffsetGastos = circGastos - (pctOut / 100) * circGastos;
  const ringGastos = document.getElementById("appleRingGastos");
  if (ringGastos) {
    ringGastos.style.strokeDasharray = circGastos;
    ringGastos.style.strokeDashoffset = strokeDashoffsetGastos;
  }

  // 💥 AQUÍ SE RESTAURA EL DISEÑO APPLE LIST PARA LAS TRANSACCIONES
  const container = document.getElementById("listaDesgloseGastos");
  if (itemsTemp.length === 0) {
    container.innerHTML =
      '<div class="empty-log-msg">No hay movimientos.</div>';
    calcularDescuentoDeuda();
    return;
  }

  let htmlBuffer = "";
  itemsTemp.forEach((item) => {
    const priceColor =
      item.tipo === "INGRESO" ? "var(--ios-green)" : "var(--ios-red)";
    htmlBuffer += `
            <div class="apple-list-row">
                <span class="td-cell td-date">${item.fecha}</span>
                <span class="td-cell td-price" style="color: ${priceColor} !important;">${formatMoneda(item.monto)}</span>
                <span class="td-cell td-desc" title="${item.detalle}">${item.detalle}</span>
                <span class="td-cell td-cat">${item.categoria}</span>
            </div>
        `;
  });
  container.innerHTML = htmlBuffer;
  calcularDescuentoDeuda();
}

function guardarTransaccion(e) {
  e.preventDefault();
  if (isWorking) return;

  const catVal = encodeURIComponent(
    document.getElementById("finCategoria").value,
  );
  const montoRaw = document.getElementById("finMonto").value.replace(/\D/g, "");

  if (!montoRaw || parseInt(montoRaw) <= 0) {
    alert("Ingresa un monto válido.");
    return;
  }

  isWorking = true;
  const btn = document.getElementById("btnSubmit");
  const originalText = btn.innerText;
  btn.innerText = "Procesando...";
  btn.disabled = true;

  window.saveCallbackFinanzas = function (res) {
    isWorking = false;
    btn.innerText = originalText;
    btn.disabled = false;
    delete window.saveCallbackFinanzas;

    if (res.status === "success") {
      document.getElementById("formFinanzas").reset();
      cargarDashboardFinanzas();
    } else {
      alert("Error: " + res.message);
    }
  };

  const script = document.createElement("script");
  script.src = `${GOOGLE_SCRIPT_URL}?action=registrarTransaccionFinanciera&categoria=${catVal}&monto=${montoRaw}&detalle=${encodeURIComponent(document.getElementById("finDetalle").value)}&callback=saveCallbackFinanzas&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

function exportarExcelEmpresarial() {
  if (!globalFinanzasData) {
    alert("Espera que carguen los datos primero.");
    return;
  }
  // Lógica rápida de exportación CSV basada en globalFinanzasData.listaDetallada
  let csvContent =
    "data:text/csv;charset=utf-8,FECHA,MONTO,DETALLE,CATEGORIA,TIPO\n";
  globalFinanzasData.listaDetallada.forEach((row) => {
    csvContent += `${row.fecha},${row.monto},"${row.detalle}","${row.categoria}",${row.tipo}\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `Finanzas_Cybernet_${document.getElementById("appleMonthSelect").value}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// =========================================================================
// 🚀 MOTOR DINÁMICO: CARGAR TEXTOS Y MENSAJES DESDE GOOGLE SHEETS
// =========================================================================
window.currentGridStock = []; // Memoria global para las plantillas descargadas

function cargarPlantillasDesdeSheets() {
  const container = document.getElementById("grid-container");
  if (container)
    container.innerHTML =
      '<div class="empty-log-msg">Sincronizando mensajes desde Sheets...</div>';

  const cbName = "cb_plantillas_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      const data = res.data;
      window.currentGridStock = [];

      data.forEach((item) => {
        // Si el título es PAGOS, se renderiza de forma especial en la parte del QR
        if (item.titulo.toUpperCase() === "PAGOS") {
          const headerContainer = document.getElementById("header-container");
          if (headerContainer) {
            headerContainer.innerHTML = `
              <div class="card-ios w-100" style="max-width: 440px;">
                <h2 class="card-title text-center" style="justify-content:center;">${item.titulo}</h2>
                <img src="${item.imagenUrl}" alt="QR" style="max-width:210px; width:100%; border-radius:16px; border:var(--glass-border); box-shadow:var(--glass-shadow); padding:5px; background:white; margin:0 auto;">
                <span class="text-secondary text-center" style="font-size:0.75rem; margin-top:-8px; font-weight:500;">(Mantén presionado o clic derecho para copiar imagen)</span>
                <button class="btn-ios btn-secondary copy-text-btn mt-1 w-100" data-clipboard-text="${item.texto.replace(/"/g, "&quot;").replace(/'/g, "&#39;")}">COPIAR TEXTO</button>
              </div>
            `;
          }
        } else {
          // Si es cualquier otro mensaje, va para las tarjetas del buscador inferior
          window.currentGridStock.push(item);
        }
      });

      // Una vez distribuidos, pintamos el catálogo en pantalla
      renderGrid("");
    } else {
      if (container)
        container.innerHTML =
          '<div class="empty-log-msg" style="color:var(--ios-red);">❌ Error al descargar mensajes.</div>';
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerPlantillas&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

// Reemplazo de tu antigua función renderGrid por una que lea la memoria de Sheets
function renderGrid(filtro = "") {
  const gridContainer = document.getElementById("grid-container");
  if (!gridContainer || !window.currentGridStock) return;
  gridContainer.innerHTML = "";

  // Filtramos las tarjetas según lo que escribas en el buscador superior
  let filtrados = window.currentGridStock.filter((item) =>
    item.titulo.toLowerCase().includes(filtro.toLowerCase()),
  );

  if (filtrados.length === 0) {
    gridContainer.innerHTML =
      '<div class="empty-log-msg">No se encontraron plantillas con ese nombre.</div>';
    return;
  }

  filtrados.forEach((currentItem) => {
    const card = document.createElement("div");
    card.className = "card-ios";
    card.innerHTML = `
      <h2 class="card-title" style="justify-content:center;">${currentItem.titulo}</h2>
      <button class="btn-ios btn-secondary copy-text-btn mt-1 w-100" data-clipboard-text="${currentItem.texto.replace(/"/g, "&quot;").replace(/'/g, "&#39;")}">COPIAR TEXTO</button>
    `;
    gridContainer.appendChild(card);
  });
}
