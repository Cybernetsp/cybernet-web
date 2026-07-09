// 👑 LÍNEA 1: INTERCEPTOR ULTRA INTELIGENTE FUSIONADO (LOCAL & WEB)
(function () {
  let sessionStaff = sessionStorage.getItem("active_staff");
  let localStaff = localStorage.getItem("cyber_saved_staff");
  let user = sessionStaff || localStaff;

  // Esperamos a que el HTML cargue por completo para manipular las ventanas
  window.addEventListener("DOMContentLoaded", () => {
    let savedTheme = localStorage.getItem("cyber_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    const loginOverlay = document.getElementById("loginOverlay");
    const workspace = document.getElementById("mainWorkspace");
    const header = document.getElementById("globalHeader");
    const controlPanel = document.getElementById("controlPanel");
    const controlRight = document.getElementById("macControlCenterRight"); // 🔥 Esquina derecha

    // Si NO hay usuario logueado, forzamos a abrir el Login integrado
    if (!user) {
      if (loginOverlay) {
        loginOverlay.classList.add("open");
        loginOverlay.style.setProperty("display", "flex", "important");
      }
      // Apagamos TODOS los componentes del admin por seguridad
      if (workspace) workspace.style.display = "none";
      if (header) header.style.display = "none";
      if (controlPanel) controlPanel.style.display = "none";
      if (controlRight) controlRight.style.display = "none"; // Desaparece "Camilo" y el reloj
    }
    // Si SÍ hay usuario logueado, entra directo al sistema
    else {
      if (loginOverlay) {
        loginOverlay.classList.remove("open");
        loginOverlay.style.setProperty("display", "none", "important");
      }
      if (controlRight) controlRight.style.display = "flex";
      entrarAlSistema(user);
    }
  });
})();
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxk_T98sS1lL5lbXVq_XKOpB6ZCNQ1DSCgPhc_a6vmE_ai16YbSYO_eHkmeu0ZjM5aq/exec";

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

// =========================================================================
// 🔊 MOTOR ACÚSTICO APPLE VIP V2 (AUTOMATIZACIÓN TOTAL DE CLICS Y ALERTAS)
// =========================================================================
window.CyberSonidos = {
  play: function (tipo) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!window.audioCtx) window.audioCtx = new AudioContext();
      if (window.audioCtx.state === "suspended") window.audioCtx.resume();

      const now = window.audioCtx.currentTime;

      // 📱 1. SONIDO: CLICK NATIVO DE KEYBOARD/BOTÓN IPHONE ("TOCK")
      if (tipo === "pop" || tipo === "click") {
        const osc = window.audioCtx.createOscillator();
        const gain = window.audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(850, now); // Frecuencia seca de madera/tock

        gain.gain.setValueAtTime(0.06, now); // Volumen calibrado cómodo
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02); // Caída ultra rápida (20ms) para el golpe seco

        osc.connect(gain);
        gain.connect(window.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.03);
      }

      // 🔔 2. SONIDO: NOTIFICACIÓN PREMIUM DE IOS ("CHIME / NOTE")
      else if (tipo === "exito" || tipo === "notif") {
        // Función interna para crear armónicos puros de campana
        const crearNotaChime = (frecuencia, inicio, duracion) => {
          const oscNode = window.audioCtx.createOscillator();
          const gainNode = window.audioCtx.createGain();

          oscNode.type = "sine";
          oscNode.frequency.setValueAtTime(frecuencia, inicio);

          gainNode.gain.setValueAtTime(0.12, inicio);
          gainNode.gain.exponentialRampToValueAtTime(0.001, inicio + duracion);

          oscNode.connect(gainNode);
          gainNode.connect(window.audioCtx.destination);
          oscNode.start(inicio);
          oscNode.stop(inicio + duracion);
        };

        // Recreación del icónico tono doble de Apple Pay / Notificación
        crearNotaChime(1050, now, 0.12); // Primer pulso agudo corto
        crearNotaChime(1320, now + 0.06, 0.25); // Segundo pulso resonante elegante
      }
    } catch (e) {
      console.log(
        "AudioContext bloqueado por seguridad del navegador hasta el primer clic.",
      );
    }
  },
};

// Función de vibración háptica compacta de Cybernet
window.haptic = function () {
  if (navigator.vibrate) {
    navigator.vibrate(10); // Vibración sutil de pantalla táctil
  }
  window.CyberSonidos.play("click");
};

// =========================================================================
// 🎯 RADAR DE CAPTURA GLOBAL: ASIGNA AUDIO A CUALQUIER ELEMENTO INTERACTIVO
// =========================================================================
document.addEventListener(
  "click",
  (e) => {
    // Filtro inteligente para capturar clics en botones, menús, dock, checkboxes, etc.
    const elementoInteractivo = e.target.closest(
      "button, .mac-menu-item, .mac-dock-icon, .btn-ios, .btn-close-circle, .mobile-menu-trigger, input[type='submit'], input[type='checkbox'], select",
    );

    if (elementoInteractivo) {
      window.CyberSonidos.play("click");
      if (navigator.vibrate) navigator.vibrate(10);
    }
  },
  true,
); // Usamos 'true' para interceptar el evento antes de que lo detenga otro script

const listaPlataformasVenta = [
  {
    id: "NETFLIX",
    nombre: "NETFLIX",
    permitePantallas: true,
    permiteRenovacion: true,
  },
  {
    id: "DIRECTV-GO",
    nombre: "DIRECTV GO",
    permitePantallas: true,
    permiteRenovacion: false,
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
    permitePantallas: true,
    permiteRenovacion: false,
  },
  {
    id: "PARAMOUNT",
    nombre: "PARAMOUNT",
    permitePantallas: true,
    permiteRenovacion: false,
  },
  {
    id: "APPLE-TV",
    nombre: "APPLE TV",
    permitePantallas: true,
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
  {
    id: "FLUJO",
    nombre: "FLUJO TV",
    permitePantallas: true,
    permiteRenovacion: false,
  },
  {
    id: "EMBY",
    nombre: "EMBY",
    permitePantallas: true,
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

    // 🔥 FIX CRÍTICO: Formatear la memoria de meses al abrir la ventana
    // Evita que el sistema recuerde si la venta anterior fue de 2 o más meses.
    window.ultimoMesesSeleccionado = "1";

    // LÍNEAS NUEVAS: Identificar al empleado activo
    const optNomina = document.getElementById("optPagoNomina");
    if (optNomina) {
      const staffActivo = sessionStorage.getItem("active_staff") || "STAFF";
      optNomina.value = "NÓMINA: " + staffActivo.toUpperCase();
    }
  }
}
window.toggleCargarPanel = function () {
  const panel = document.getElementById("cargarOverlay");
  if (!panel) return;

  if (panel.classList.contains("open")) {
    panel.classList.remove("open");
  } else {
    if (typeof cerrarTodasLasAppsActivas === "function") {
      cerrarTodasLasAppsActivas(); // 🔥 Evita que se monte encima de Finanzas, Distris, etc.
    }
    panel.classList.add("open");
  }
};

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
  // Reemplazar la función de retorno existente dentro de ejecutarCargaLote
  window.procesarCargaLoteSheets = function (res) {
    const scriptNode = document.getElementById("cyber_cargamasiva_node");
    if (scriptNode) scriptNode.remove();

    btnSubmit.disabled = false;
    btnSubmit.innerText = "Cargar Cuentas en Lote";

    if (res && res.status === "success") {
      // 1. Toast de éxito general para las que SÍ pasaron
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>${res.message}</span></div>`,
      );

      // (Aquí mantenemos tu lógica de actualizar la caché local y renderizar el historial de la sesión)
      let cacheTurno = JSON.parse(
        sessionStorage.getItem("cyber_history_cargas") || "[]",
      );
      listaCuentasExtraidas.forEach((linea) => {
        let fragmentos = linea.trim().split(/\s+/);
        if (fragmentos.length >= 2) {
          let correoUser = fragmentos[0];
          let claveUser = fragmentos[1];
          // Solo guardamos en historial visual si NO está en la lista de repetidas (si la hay)
          let esRepetida =
            res.repetidas &&
            res.repetidas.some(
              (r) => r.correo.toLowerCase() === correoUser.toLowerCase(),
            );
          if (!esRepetida) {
            cacheTurno.push({
              plataforma: plataforma,
              proveedor: proveedorFinal,
              correo: correoUser,
              clave: claveUser,
            });
            if (typeof renderizarTarjetaHistorial === "function") {
              renderizarTarjetaHistorial(
                plataforma,
                proveedorFinal,
                correoUser,
                claveUser,
              );
            }
          }
        }
      });
      sessionStorage.setItem(
        "cyber_history_cargas",
        JSON.stringify(cacheTurno),
      );
      document.getElementById("formCargarCuentas").reset();
      document.getElementById("wrapperProveedorManual").style.display = "none";
      if (typeof cargarResumenProveedores === "function")
        cargarResumenProveedores();

      // 2. Revisamos si hubo cuentas repetidas para abrir el Modal
      if (res.repetidas && res.repetidas.length > 0) {
        mostrarModalRepetidasCybernet(res.repetidas);
      }
    } else {
      // Si el status fue error, puede ser porque TODAS estaban repetidas o hubo un error de red
      if (res && res.repetidas && res.repetidas.length > 0) {
        mostrarModalRepetidasCybernet(res.repetidas);
      } else {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-red);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> <span>Error: ${res ? res.message : "Fallo de comunicación."}</span></div>`,
        );
      }
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
window.refrescarCortesEnVivo = function (btn) {
  if (typeof haptic === "function") haptic();
  let oldText = btn.innerHTML;
  btn.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Buscando...`;
  btn.disabled = true;

  // 🔥 MAGIA AQUÍ: Forzamos el borrado de la memoria local de cortes
  // Esto obliga al navegador a mostrarte todos los cortes pendientes desde cero
  sessionStorage.removeItem("cyber_cortes_recientes");

  window.abrirPanelCortesNet();

  setTimeout(() => {
    btn.innerHTML = oldText;
    btn.disabled = false;
  }, 1000);
};

// Generador de clave fácil para TV (Panel de Cortes)
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
    "fuego",
    "agua",
    "aire",
    "tierra",
    "nube",
    "rio",
    "lago",
    "flor",
    "roca",
    "astro",
    "cometa",
    "mundo",
    "luz",
    "onda",
    "pico",
    "ruta",
    "sur",
    "norte",
    "este",
    "oeste",
    "nieve",
    "hoja",
    "leon",
    "tigre",
    "oso",
    "zorro",
    "puma",
    "gato",
    "perro",
    "ave",
    "pez",
    "toro",
    "rana",
    "mono",
    "pato",
    "cisne",
    "buho",
    "foca",
    "mula",
    "oro",
    "jade",
    "rubi",
    "gris",
    "rosa",
    "verde",
    "blanco",
    "negro",
    "plata",
    "coral",
    "ambar",
    "mago",
    "jefe",
    "eco",
    "alfa",
    "beta",
    "omega",
    "cyber",
    "red",
    "top",
    "max",
    "pro",
    "vip",
    "cine",
    "paz",
    "amor",
    "vida",
    "faro",
    "cima",
    "meta",
    "arte",
    "mito",
    "fase",
    "nota",
    "zen",
    "zoom",
    "play",
    "game",
    "run",
    "fast",
    "cool",
    "flash",
    "jazz",
    "rock",
    "pop",
    "soul",
    "lord",
    "lady",
    "duque",
    "conde",
    "ninja",
    "dragon",
    "fenix",
    "titan",
    "heroe",
    "dios",
  ];
  const p = palabras[Math.floor(Math.random() * palabras.length)];
  const n = Math.floor(Math.random() * 90) + 10;
  return p + n + "@@";
}

// =========================================================================
// 🚀 UPGRADE: ISLA DINÁMICA INTELIGENTE (Efecto Apple Morphic)
// =========================================================================
function triggerToast(mensajeHtml) {
  const isla = document.getElementById("appleToast");
  if (!isla) return;

  // 1. Limpiar estados anteriores de golpe
  isla.classList.remove("island-active");
  isla.innerHTML = "";

  // 2. Pequeño delay para permitir el reinicio físico y brote elástico
  setTimeout(() => {
    // Envolvemos el texto en el contenedor de animación suave
    isla.innerHTML = `<div class="island-content-fade">${mensajeHtml}</div>`;
    isla.classList.add("island-active");

    // Sonido pop sutil si el motor de audio está activo
    if (typeof CyberSonidos !== "undefined") CyberSonidos.play("pop");
  }, 40);

  // 3. Temporizador de Auto-Cierre (Regresa a su estado compacto y se desvanece)
  clearTimeout(window.islandTimer);
  window.islandTimer = setTimeout(() => {
    isla.classList.remove("island-active");
    // Esperamos a que termine de encogerse para limpiar el texto por dentro
    setTimeout(() => {
      isla.innerHTML = "";
    }, 400);
  }, 3500);
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

// =========================================================================
// 🍿 CONTROLADOR DEL TALLER NETFLIX (BYPASS DIRECTO A CORTES)
// =========================================================================
window.toggleNetflixManagerPanel = window.toggleNetflixPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("netflixManagerOverlay");
  if (overlay) {
    overlay.classList.toggle("open");

    // 🔄 AUTO-LANZAMIENTO: Al abrir el panel de Netflix, va directo a escanear los cortes
    if (overlay.classList.contains("open")) {
      window.abrirPanelCortesNet();
    }
  }
};

// =========================================================================
// 🍿 REESCANEO Y RENDERIZADO BENTO DE CORTES NETFLIX
// =========================================================================
window.abrirPanelCortesNet = function () {
  if (typeof haptic === "function") haptic();

  const contenedor = document.getElementById("listaCuentasCorte");
  if (!contenedor) return;

  // Cargador de diseño corporativo elegante
  contenedor.innerHTML = `
    <div style="text-align:center; padding:30px 20px; color:var(--text-secondary); font-size:0.9rem;">
      <svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e50914" stroke-width="2.5" style="margin-bottom:12px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
      <br><span style="color:#e50914; font-weight:700; letter-spacing:0.3px;">Escaneando perfiles vencidos en Sheets...</span>
    </div>`;

  const cbName = "cb_cortes_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    contenedor.innerHTML = "";

    if (res && res.status === "success") {
      let cortadosLocales = JSON.parse(
        sessionStorage.getItem("cyber_cortes_recientes") || "[]",
      );

      let cuentasValidas = res.data.filter((cuenta) => {
        if (!cuenta.correo || cuenta.correo.includes("#ERROR")) return false;
        if (cuenta.fecha !== undefined && cuenta.fecha.trim() === "")
          return false;
        if (
          cuenta.vencimiento !== undefined &&
          cuenta.vencimiento.trim() === ""
        )
          return false;
        if (!cuenta.perfilesVencidos || cuenta.perfilesVencidos.length === 0)
          return false;
        if (cortadosLocales.includes(cuenta.correo)) return false;
        return true;
      });

      if (cuentasValidas.length === 0) {
        contenedor.innerHTML =
          '<div style="text-align:center; padding:30px 20px; color:var(--ios-green); font-weight:bold; font-size:1rem;">🎉 ¡Todo limpio! No quedan perfiles vencidos.</div>';
        return;
      }

      cuentasValidas.forEach((cuenta, index) => {
        let claveNuevaSugerida = generarClaveNetflixTV();
        let perfilesTexto = cuenta.perfilesVencidos.join(", ");
        let perfilesOcultosSeguros = cuenta.perfilesVencidos.join("|||");

        let div = document.createElement("div");
        div.className = "widget-ipad account-cut-card";
        div.style.cssText =
          "padding: 16px !important; margin-bottom: 12px !important; gap: 14px !important; border-left: 4px solid #e50914 !important;";

        div.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; width: 100%;">
            <div style="display: flex; flex-direction: column; gap: 4px; overflow: hidden; flex-grow: 1;">
              <span style="font-size: 0.65rem; color: #e50914; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; display: flex; align-items: center; gap: 6px;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #e50914; box-shadow: 0 0 8px #e50914;"></span> Corte Requerido
              </span>
              <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
                <span style="font-size: 1rem; color: var(--text-primary); font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 82%; font-family: monospace;">${cuenta.correo}</span>
                <button style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 4px 6px; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center;" onclick="window.copiarCorreoNetflixCorte(this, '${cuenta.correo}')">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            </div>
            <div style="background: rgba(229, 9, 20, 0.12); color: #ff453a; padding: 5px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; border: 1px solid rgba(229, 9, 20, 0.2); white-space: nowrap;">
              Perfiles: ${perfilesTexto}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05);">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 0.65rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Clave Vencida</span>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                <span style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 600; font-family: monospace; text-decoration: line-through; opacity: 0.5;">${cuenta.claveActual}</span>
                <button style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; padding: 2px;" onclick="copiarTextoRapido(this, '${cuenta.claveActual}')">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px; border-left: 1px solid rgba(255,255,255,0.06); padding-left: 12px;">
              <span style="font-size: 0.65rem; color: var(--ios-green); font-weight: 800; text-transform: uppercase;">Nueva Clave TV</span>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                <input type="text" id="nueva_clave_${index}" style="background: transparent !important; border: none !important; color: var(--ios-green); font-size: 0.9rem; font-weight: 800; font-family: monospace; width: 100%; outline: none; padding: 0; box-shadow: none !important;" value="${claveNuevaSugerida}">
                <button style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.2); border-radius: 6px; padding: 3px 6px; color: var(--ios-green); cursor: pointer; font-size: 0.7rem; font-weight: bold;" onclick="copiarInputRapido(this, 'nueva_clave_${index}')">Copiar</button>
              </div>
            </div>
          </div>

          <button class="btn-ios" style="background: #e50914 !important; color: white !important; padding: 12px; font-size: 0.88rem; font-weight: 800; border-radius: 12px; width: 100%; margin: 0; border: none; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(229, 9, 20, 0.25);" onclick="window.procesarCorteReal(this, '${cuenta.correo}', '${perfilesOcultosSeguros}', 'nueva_clave_${index}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Procesar Corte y Subir a Hoy
          </button>
        `;
        contenedor.appendChild(div);
      });
    } else {
      contenedor.innerHTML = `<div style="color:var(--ios-red); text-align:center; padding:20px; font-weight:700;">Error: ${res ? res.message : "Fallo de conexión"}</div>`;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerCortesNetflix&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};
window.procesarCorteReal = function (
  btn,
  correo,
  perfilesCortados,
  idInputNuevaClave,
) {
  if (typeof haptic === "function") haptic();
  const nuevaClave = document.getElementById(idInputNuevaClave).value;

  btn.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Operando...`;
  btn.disabled = true;

  const cbName = "cb_proc_corte_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      // 👇 MEMORIA: Guarda el correo para bloquearlo y que no vuelva a salir si refrescas
      let cortadosLocales = JSON.parse(
        sessionStorage.getItem("cyber_cortes_recientes") || "[]",
      );
      cortadosLocales.push(correo);
      sessionStorage.setItem(
        "cyber_cortes_recientes",
        JSON.stringify(cortadosLocales),
      );

      btn.innerHTML = "¡Completado!";
      btn.style.background = "var(--ios-green)";
      btn.style.color = "white";

      // ⚡ EXTINCIÓN DOM: Animación elástica reduciendo tamaño y borrado completo
      const tarjetaCard = btn.closest(".account-cut-card, .card-ios");
      if (tarjetaCard) {
        tarjetaCard.style.transform = "scale(0.9) translateY(-15px)";
        tarjetaCard.style.opacity = "0";

        setTimeout(() => {
          tarjetaCard.remove();

          // Verificación de bandeja vacía en caliente
          const contenedor = document.getElementById("listaCuentasCorte");
          if (
            contenedor &&
            contenedor.querySelectorAll(".account-cut-card, .card-ios")
              .length === 0
          ) {
            contenedor.innerHTML =
              '<div style="text-align:center; padding:40px; color:var(--ios-green); font-weight:bold; font-size:1rem;">🎉 ¡Todo limpio! No quedan perfiles vencidos.</div>';
          }
        }, 350);
      }

      mostrarResultadoCortes(res.clientes);
    } else {
      alert("Error: " + res.message);
      btn.innerHTML = "Reintentar";
      btn.disabled = false;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=procesarCorteNetflix&correo=${encodeURIComponent(correo)}&nuevaClave=${encodeURIComponent(nuevaClave)}&perfilesCortados=${encodeURIComponent(perfilesCortados)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

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
      // 🔥 MODIFICACIÓN: Si el buscador está vacío, SOLO se muestran las seleccionadas.
      // Al inicio, como ninguna está marcada, la lista estará 100% oculta.
      if (checkbox && checkbox.checked) {
        fila.style.setProperty("display", "flex", "important");
      } else {
        fila.style.setProperty("display", "none", "important");
      }
    } else {
      // Si el usuario escribe, se muestran las que coincidan con la búsqueda o las ya seleccionadas
      if (nombrePlat.includes(query) || (checkbox && checkbox.checked)) {
        fila.style.setProperty("display", "flex", "important");
      } else {
        fila.style.setProperty("display", "none", "important");
      }
    }
  });
}

function comprobarDesbloqueoVentaPill(checkbox, id) {
  if (typeof haptic === "function") haptic();

  const elPantallas = document.getElementById(`pantallas_${id}`);
  const elMeses = document.getElementById(`meses_${id}`);
  const elBono = document.getElementById(`bono_${id}`);
  const elTipo = document.getElementById(`tipo_${id}`);
  const card = document.getElementById(`card_plat_${id}`);
  const badge = document.getElementById(`badge_status_${id}`);

  if (checkbox.checked) {
    // Activar los campos internos de esta plataforma
    if (elPantallas) elPantallas.disabled = false;
    if (elMeses) {
      elMeses.disabled = false;
      elMeses.value = window.ultimoMesesSeleccionado || "1";
    }
    if (elBono) elBono.disabled = false;
    if (elTipo) elTipo.disabled = false;

    // Estilos visuales de "seleccionado"
    if (card) {
      card.style.background = "rgba(255, 255, 255, 0.06)";
      card.style.borderColor = "rgba(10, 132, 255, 0.35)";
    }
    if (badge) {
      badge.style.background = "var(--ios-blue)";
      badge.style.boxShadow = "0 0 8px var(--ios-blue)";
    }

    // 🔥 NUEVA LÓGICA DE LIMPIEZA AUTOMÁTICA 🔥
    // Borramos solo la barra de búsqueda de plataformas y devolvemos el cursor ahí
    const buscadorPlat = document.getElementById("buscarPlataformaVenta");
    if (buscadorPlat && buscadorPlat.value !== "") {
      buscadorPlat.value = "";
      buscadorPlat.focus(); // Deja el teclado listo para escribir la siguiente
    }
  } else {
    // Si la desmarcamos, apagamos los controles
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

    // Quitamos los estilos de "seleccionado"
    if (card) {
      card.style.background = "var(--glass-bg)";
      card.style.borderColor = "var(--glass-border)";
    }
    if (badge) {
      badge.style.background = "rgba(255, 255, 255, 0.15)";
      badge.style.boxShadow = "none";
    }

    // Ocultar campo de renovación si estaba abierto
    const wrapperReno = document.getElementById(`wrapper_correo_reno_${id}`);
    if (wrapperReno) wrapperReno.style.display = "none";
  }

  // Refrescar la lista visual de plataformas al final (oculta las no marcadas si el buscador está vacío)
  filtrarPlataformasVenta();
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
  const optHistorial = document.getElementById("opt_historial_net");
  const inputTipo = document.getElementById("tipo_NETFLIX");
  const cardNetflix = document.getElementById("card_plat_NETFLIX");

  let alertaEEl = document.getElementById("alerta_reno_texto_NETFLIX");

  if (telLimpio.length < 8) {
    window.cuentasNetflixClienteActivo = [];
    if (optHistorial) optHistorial.style.display = "none";
    if (alertaEEl) alertaEEl.style.display = "none";
    const badge = document.getElementById("badge_status_NETFLIX");
    if (badge) {
      badge.style.background = "rgba(255,255,255,0.15)";
      badge.style.boxShadow = "none";
    }
    return;
  }

  clearTimeout(timeoutBusquedaNet);
  timeoutBusquedaNet = setTimeout(() => {
    const badge = document.getElementById("badge_status_NETFLIX");
    if (badge && cardNetflix && !cardNetflix.querySelector("input").checked) {
      badge.style.background = "var(--ios-orange)";
      badge.style.boxShadow = "0 0 8px var(--ios-orange)";
    }

    const cbName = "cb_net_search_" + Date.now();
    window[cbName] = function (res) {
      const scriptNode = document.getElementById("node_" + cbName);
      if (scriptNode) scriptNode.remove();
      delete window[cbName];

      window.cuentasNetflixClienteActivo = [];

      if (res && res.status === "success" && res.data.length > 0) {
        window.cuentasNetflixClienteActivo = res.data;

        // Mantiene la opción de renovación siempre disponible en el select
        if (optHistorial) optHistorial.style.display = "block";

        // Crea o muestra la alerta naranja de renovación disponible
        if (!alertaEEl && cardNetflix) {
          alertaEEl = document.createElement("div");
          alertaEEl.id = "alerta_reno_texto_NETFLIX";
          alertaEEl.style.cssText =
            "font-size: 0.72rem; color: var(--ios-orange); font-weight: 800; background: rgba(255, 159, 10, 0.08); padding: 4px 6px; border-radius: 8px; border: 1px solid rgba(255, 159, 10, 0.2); margin-top: 6px; text-align: center; display: block; width: 100%;";
          alertaEEl.innerText = "✨ ¡Renovación Disponible para este Cliente!";
          cardNetflix.appendChild(alertaEEl);
        }
        if (alertaEEl) alertaEEl.style.display = "block";

        if (
          badge &&
          cardNetflix &&
          !cardNetflix.querySelector("input").checked
        ) {
          badge.style.background = "var(--ios-green)";
          badge.style.boxShadow = "0 0 8px var(--ios-green)";
        }
      } else {
        if (optHistorial) optHistorial.style.display = "none";
        if (alertaEEl) alertaEEl.style.display = "none";
        if (
          badge &&
          cardNetflix &&
          !cardNetflix.querySelector("input").checked
        ) {
          badge.style.background = "rgba(255, 255, 255, 0.15)";
          badge.style.boxShadow = "none";
        }
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbName;
    script.src = `${GOOGLE_SCRIPT_URL}?action=buscarRenovacionNetflix&tel=${encodeURIComponent(telLimpio)}&callback=${cbName}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  }, 800);
}

window.comprobarTipoVentaNetflix = function (element, id) {
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
      // 🔥 FORZAR APERTURA: Ejecuta el modal con la lista de cuentas del cliente de inmediato
      if (typeof abrirModalRenovacionNet === "function") {
        abrirModalRenovacionNet();
      }
    } else {
      if (wrapperCorreo) wrapperCorreo.style.display = "none";
      if (inputReno) {
        inputReno.required = false;
        inputReno.value = "";
        inputReno.readOnly = false;
      }
    }
  }
};

function comprobarDesbloqueoVentaPill(checkbox, id) {
  if (typeof haptic === "function") haptic();

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

    // 🏎️ AUTO-LIMPIEZA FLUIDA: Borra el buscador y despliega todo el stock al instante
    const buscadorPlat = document.getElementById("buscarPlataformaVenta");
    if (buscadorPlat) {
      buscadorPlat.value = "";
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
      if (id === "NETFLIX" && window.cuentasNetflixClienteActivo.length > 0) {
        badge.style.background = "var(--ios-green)";
        badge.style.boxShadow = "0 0 8px var(--ios-green)";
      } else {
        badge.style.background = "rgba(255, 255, 255, 0.15)";
        badge.style.boxShadow = "none";
      }
    }

    const wrapperReno = document.getElementById(`wrapper_correo_reno_${id}`);
    if (wrapperReno) wrapperReno.style.display = "none";
  }

  // Refresca la vista para que todo sea scaneable de nuevo
  filtrarPlataformasVenta();
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

        // 🔥 FIX CRÍTICO: Formatear la memoria justo después de terminar
        window.ultimoMesesSeleccionado = "1";

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
      let blocks = bloques.sort((a, b) => {
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
        let etiquetaUser =
          b.id === "IPTV" || b.id === "EMBY" ? "Usuario" : "Correo";
        let etiquetaPerfil =
          b.id === "IPTV" ? "URL" : b.id === "EMBY" ? "Servidor" : "Perfil";
        let mesesComprados = memoriaMeses[b.id] || "1";
        let textoMeses = mesesComprados > 1 ? ` (${mesesComprados} Meses)` : "";

        cuerpo += `\n\n🎬 *DETALLES DE ${b.id.replace(/-/g, " ").toUpperCase()}*${textoMeses} ✅\n────────────────────\n`;

        // ⚠️ ADVERTENCIA ARRIBA (SOLO NETFLIX)
        if (b.id === "NETFLIX") {
          cuerpo += `⚠️ *Para iniciar sesión:* Cuando te pida un código, selecciona *Obtener ayuda* y después *Usar contraseña*.\n\n`;
        }

        // DATOS EN NEGRITA
        cuerpo += `👤 *${etiquetaUser}:* ${b.correo}\n🔐 *Contraseña:* ${b.clave}\n`;

        if (
          b.id === "IPTV" ||
          (b.perfil && b.perfil !== "" && b.perfil !== "N/A")
        ) {
          cuerpo += `🌐 *${etiquetaPerfil}:* ${b.perfil}\n`;
        }

        if (b.id === "EMBY") {
          cuerpo += `🔌 *Puerto:* Dejar vacío\n`;
        }

        if (b.pin && b.pin !== "") cuerpo += `📍 *PIN:* ${b.pin}\n`;
        cuerpo += `📅 *Vence:* ${b.venc}\n`;

        // 🤖 BOT DE CÓDIGOS ABAJO (SOLO NETFLIX)
        if (b.id === "NETFLIX") {
          cuerpo += `\n🤖 *¿NECESITAS UN CÓDIGO?* Puedes usar nuestra pagina para codigos disponible 24/7: www.cybernetsp.com/`;
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

      // 🔥 FIX CRÍTICO: Formatear la memoria justo después de terminar la venta
      window.ultimoMesesSeleccionado = "1";

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
// 👥 GESTOR DE TURNOS: INTERCEPTOR DE SEGURIDAD ESTRICTO PARA CAMILO
// =========================================================================
function toggleShiftsPanel() {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("shiftsOverlay");
  overlay.classList.toggle("open");

  if (overlay.classList.contains("open")) {
    if (document.getElementById("searchShiftsInput")) {
      document.getElementById("searchShiftsInput").value = "";
    }

    // Identificamos con total autoridad quién está operando el sistema
    const userActivo = (sessionStorage.getItem("active_staff") || "")
      .toUpperCase()
      .trim();
    const inpVendedor = document.getElementById("inputVendedorShift");
    const btnAde = document.getElementById("btnAdelantoCamilo");
    const btnNom = document.getElementById("btnNominaCamilo"); // 👈 Captura el botón de Nómina

    if (userActivo === "CAMILO") {
      // 🔓 ACCESO TOTAL: Camilo puede alterar nombres y ve las herramientas financieras
      if (inpVendedor) {
        inpVendedor.disabled = false;
        inpVendedor.value = "";
      }
      if (btnAde)
        btnAde.style.setProperty("display", "inline-flex", "important");
      if (btnNom)
        btnNom.style.setProperty("display", "inline-flex", "important"); // 🔥 Se revela solo para ti
    } else {
      // 🔒 RESTRICCIÓN: Los empleados solo ven sus horas y tienen bloqueados los botones
      if (inpVendedor) {
        inpVendedor.disabled = true;
        inpVendedor.value = userActivo;
      }
      if (btnAde) btnAde.style.setProperty("display", "none", "important");
      if (btnNom) btnNom.style.setProperty("display", "none", "important"); // 🛡️ Ocultado absoluto contra personal
    }

    sincronizarTachadosConNube(() => {
      if (window.currentHorasStock && window.currentHorasStock.length > 0) {
        renderizarHorasEnPantalla("");
        cargarHorasDesdeSheets();
      } else {
        forzarRefrescoDeHoras();
      }
    });
  }
}

// Modificar el disparador para abrir el nuevo modal independiente
// =========================================================================
// ⏰ CONTROLADOR DE APERTURA: POPUP FLOTANTE DE HORAS EXTRAS
// =========================================================================
function toggleFormularioHoras() {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("addHoursOverlay");

  if (overlay) {
    // Si está oculto, lo mostramos con flex con máxima prioridad
    if (overlay.style.display === "none" || overlay.style.display === "") {
      overlay.style.setProperty("display", "flex", "important");
      overlay.classList.add("open");

      // 🛡️ CONTROL DE SEGURIDAD INTERNO PARA EL POPUP
      const userActivo = (sessionStorage.getItem("active_staff") || "")
        .toUpperCase()
        .trim();
      const inpVendedor = document.getElementById("inputVendedorShift");

      if (inpVendedor) {
        if (userActivo === "CAMILO") {
          inpVendedor.disabled = false;
          inpVendedor.value = "";
          inpVendedor.placeholder = "Nombre del vendedor...";
        } else {
          inpVendedor.disabled = true;
          inpVendedor.value = userActivo;
        }
      }

      // Pone el cursor automáticamente en la caja de texto del tiempo
      setTimeout(() => {
        const input = document.getElementById("inputHorasShift");
        if (input) input.focus();
      }, 50);
    } else {
      // Si ya estaba abierto, lo ocultamos limpiamente
      overlay.style.setProperty("display", "none", "important");
      overlay.classList.remove("open");
    }
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
  }).then(function () {
    triggerToast(
      `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Las horas se han ingresado correctamente.</span></div>`,
    );
    btn.disabled = false;
    btn.innerText = "Guardar Horas en Sheets";
    document.getElementById("inputHorasShift").value = "";

    // 🔒 AUTO-CIERRE SEGURO CON APAGADO DE DISPLAY
    const popHoras = document.getElementById("addHoursOverlay");
    if (popHoras) {
      popHoras.style.setProperty("display", "none", "important");
      popHoras.classList.remove("open");
    }

    forzarRefrescoDeHoras();
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

  // 🔥 MODIFICACIÓN: Actualiza tanto las horas como las tachaduras al refrescar
  sincronizarTachadosConNube(() => {
    cargarHorasDesdeSheets();
  });
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
  if (typeof haptic === "function") haptic();

  const btnSubmit = document.getElementById("btnSubmitReporte");
  const plataforma = document.getElementById("repPlataforma").value;
  const correo = document.getElementById("repCorreo").value;
  const clave = document.getElementById("repClave").value;
  const tipoProblema = document.getElementById("repTipoProblema").value;
  let descripcion = tipoProblema;

  if (tipoProblema === "OTRA") {
    descripcion = document.getElementById("repDesc").value.trim();
  }

  // Activamos el estado de carga simple
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Enviando...`;

  const oldScript = document.getElementById("cyber_reporte_node");
  if (oldScript) oldScript.remove();

  // Receptor de respuesta rápida de Google Sheets
  window.procesarReporteSheets = function (res) {
    const scriptNode = document.getElementById("cyber_reporte_node");
    if (scriptNode) scriptNode.remove();

    btnSubmit.disabled = false;
    btnSubmit.innerText = "Enviar a Garantía";

    if (res && res.status === "success") {
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path></svg> <span>Reporte enviado con éxito.</span></div>`,
        );
      }
      document.getElementById("formReportar").reset();
      verificarTipoProblema();
      cargarGarantias(); // Refresca tu lista de tickets abajo
      if (typeof actualizarBadgeGarantias === "function")
        actualizarBadgeGarantias();
    } else {
      alert("❌ Error: " + (res ? res.message : "Desconocido"));
    }
  };

  // Inyección limpia mediante JSONP (doGet) SIN PARÁMETRO DE IMAGEN
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
    '<div style="text-align:center; padding:20px; color:var(--text-secondary); font-size:0.85rem;"><svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: middle; margin-right: 6px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg><br>Sincronizando tickets...</div>';

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
        '<div style="text-align:center; padding:20px; color:var(--ios-red); font-weight:600; font-size:0.85rem;">❌ Error al sincronizar.</div>';
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_getgarantias_node";
  scriptElement.src = `${GOOGLE_SCRIPT_URL}?action=obtenerGarantias&callback=procesarListaGarantiasSheets&_ts=${Date.now()}`;
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
  data.forEach((item, index) => {
    // 🔥 CORRECCIÓN AQUÍ: Se añade la Fecha de Compra al texto que se va al portapapeles
    const textoReporte = `🚨 *REPORTE DE PROBLEMA*\n📺 *Plataforma:* ${item.plataforma}\n📧 *Correo:* ${item.correo}\n🔑 *Clave:* ${item.clave}\n👤 *Proveedor:* ${item.proveedor}\n📅 *Fecha Compra:* ${item.fechaCompra || "No Registrada"}\n💬 *Motivo:* ${item.desc}`;
    const safeReporte = encodeURIComponent(textoReporte);

    let imagenHtml = "";
    let btnCopiarFoto = "";

    // 📸 DETECTOR INTELIGENTE DE EVIDENCIAS DRIVE V2
    if (item.imagen && String(item.imagen).trim().length > 10) {
      let imgId = `img_garantia_${index}`;
      let srcLimpio = String(item.imagen).trim();
      let urlOriginalParaAbrir = srcLimpio;

      if (srcLimpio.includes("drive.google.com")) {
        let idMatch =
          srcLimpio.match(/file\/d\/([a-zA-Z0-9_-]+)/) ||
          srcLimpio.match(/id=([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
          let fileId = idMatch[1];
          srcLimpio = `https://drive.google.com/thumbnail?sz=w400&id=${fileId}`;
        }
      } else if (
        !srcLimpio.includes("data:image") &&
        !srcLimpio.includes("http")
      ) {
        srcLimpio = `data:image/jpeg;base64,${srcLimpio}`;
      }

      imagenHtml = `
          <div style="margin-top: 8px; text-align: center; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 8px; border: 1px solid var(--glass-border);">
              <span style="display:block; font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 4px; text-transform: uppercase;">Evidencia Adjunta (Clic para ampliar)</span>
              <a href="${urlOriginalParaAbrir}" target="_blank" style="text-decoration: none; display: inline-block; max-width: 100%;">
                  <img id="${imgId}" src="${srcLimpio}" data-original="${urlOriginalParaAbrir}" style="max-height: 130px; max-width: 100%; border-radius: 6px; box-shadow: var(--glass-shadow); object-fit: contain; cursor: pointer;" title="Clic para abrir en alta resolución">
              </a>
          </div>
        `;

      btnCopiarFoto = `
          <button class="btn-ios btn-secondary" style="flex: 1; padding: 8px; font-size: 0.75rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 4px;" onclick="copiarImagenPortapapeles('${imgId}', this)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg> Foto
          </button>
        `;
    }

    html += `
          <div class="card-ios" style="padding: 16px; display: flex; flex-direction: column; gap: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border);">
              
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                      <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--ios-red);"></div>
                      <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.5px;">${item.plataforma}</span>
                  </div>
                  <div style="font-size: 0.65rem; color: var(--text-secondary); text-align: right; text-transform: uppercase; font-weight: 600;">
                      Reporte: ${item.fecha}
                  </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: var(--input-bg); padding: 12px; border-radius: 8px; border: 1px solid var(--glass-border);">
                  <div style="display: flex; flex-direction: column; gap: 2px;">
                      <span style="font-size: 0.65rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Correo</span>
                      <span style="font-size: 0.85rem; color: var(--text-primary); font-weight: 600; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.correo}">${item.correo}</span>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 2px; border-left: 1px solid var(--glass-border); padding-left: 10px;">
                      <span style="font-size: 0.65rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Clave</span>
                      <span style="font-size: 0.85rem; color: var(--text-primary); font-weight: 600; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.clave}">${item.clave}</span>
                  </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 4px; padding: 0 2px;">
                  <div style="font-size: 0.75rem; color: var(--text-secondary); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px;">
                      <span>Proveedor: <b style="color: var(--ios-orange);">${item.proveedor || "Desconocido"}</b></span>
                      <span>Compra: <b style="color: var(--text-primary);">${item.fechaCompra || "No Registrada"}</b></span>
                  </div>
                  <div style="font-size: 0.8rem; color: var(--text-primary); background: rgba(255,255,255,0.03); padding: 8px 10px; border-radius: 8px; border: 1px dashed var(--glass-border); margin-top: 4px;">
                      <span style="color: var(--text-secondary); font-size: 0.7rem; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 2px;">Falla reportada</span>
                      ${item.desc}
                  </div>
              </div>
              
              ${imagenHtml}

              <div style="display: flex; gap: 8px; margin-top: 4px;">
                  <button class="btn-ios btn-secondary" style="flex: 1; padding: 8px; font-size: 0.75rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 4px;" onclick="copiarTextoRapido(this, decodeURIComponent('${safeReporte}'))">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Texto
                  </button>
                  ${btnCopiarFoto}
                  <button class="btn-ios" style="flex: 1; padding: 8px; font-size: 0.75rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 4px; background: rgba(245, 158, 11, 0.1); color: var(--ios-orange); border: 1px solid rgba(245, 158, 11, 0.2); font-weight: 600;" onclick="solicitarCuentaTemporal(this, '${item.plataforma}', '${item.correo}')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Temp
                  </button>
                  <button class="btn-ios btn-success" style="flex: 1; padding: 8px; font-size: 0.75rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 4px;" onclick="abrirModalResolverGarantia('${item.filaIndex}', '${item.correo}', '${item.plataforma}')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Resolver
                  </button>
              </div>
          </div>`;
  });
  container.innerHTML = html;
}

// Función auxiliar estética para pintar el éxito estilo iOS
function mostrarExitoCopiadoDefinitivo(btn, originalHtml) {
  btn.innerHTML = "¡Copiada!";
  btn.style.background = "var(--ios-green)";
  btn.style.color = "white";
  btn.style.borderColor = "transparent";

  if (typeof triggerToast === "function") {
    triggerToast(
      `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>¡Foto copiada! Ya puedes pegarla en WhatsApp (Ctrl + V)</span></div>`,
    );
  }

  setTimeout(() => {
    btn.innerHTML = originalHtml;
    btn.style.background = "";
    btn.style.color = "";
    btn.style.borderColor = "";
    btn.disabled = false;
  }, 1500);
}

function restaurarBotonError(btn, originalHtml) {
  btn.innerHTML = "Error ✕";
  btn.style.background = "var(--ios-red)";
  btn.style.color = "white";
  setTimeout(() => {
    btn.innerHTML = originalHtml;
    btn.style.background = "";
    btn.style.color = "";
    btn.disabled = false;
  }, 1500);
}

// Función auxiliar para pintar el éxito visual del botón
function finalizarCopiadoExitoso(btn, originalHtml) {
  btn.innerHTML = "¡Copiada!";
  btn.style.background = "var(--ios-green)";
  btn.style.color = "white";
  btn.style.borderColor = "transparent";

  if (typeof triggerToast === "function") {
    triggerToast(
      `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>¡Foto copiada! Presiona Ctrl + V en WhatsApp</span></div>`,
    );
  }

  setTimeout(() => {
    btn.innerHTML = originalHtml;
    btn.style.background = "";
    btn.style.color = "";
    btn.style.borderColor = "";
    btn.disabled = false;
  }, 1500);
}

// =========================================================================
// 🚑 FUNCIÓN PARA SOLICITAR CUENTA TEMPORAL DESDE GARANTÍAS
// =========================================================================
window.solicitarCuentaTemporal = function (btn, plataforma, correoDanado) {
  if (typeof haptic === "function") haptic();

  // Cambiamos el estado del botón
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Buscando...`;

  const cbName = "cb_temp_" + Date.now();

  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    btn.disabled = false;

    if (res && res.status === "success") {
      let cta = res.data;
      let perfilTxt =
        cta.perfil && cta.perfil !== "N/A" && cta.perfil !== ""
          ? `\n👤 *Perfil:* ${cta.perfil}`
          : "";
      let pinTxt =
        cta.pin && cta.pin !== "N/A" && cta.pin !== ""
          ? `\n📍 *PIN:* ${cta.pin}`
          : "";

      // Ficha de cortesía para el cliente
      let mensajeTemporal = `🌟 *¡Hola! Lamentamos los inconvenientes con tu servicio.*\n\nMientras nuestro equipo técnico repara tu cuenta principal, te hemos habilitado un *acceso temporal* para que no pares de disfrutar tu programación favorita 🍿🎬:\n\n📺 *${plataforma} (TEMPORAL)*\n────────────────────\n📧 *Correo:* ${cta.correo}\n🔐 *Clave:* ${cta.clave}${perfilTxt}${pinTxt}\n────────────────────\n_Te avisaremos por este medio apenas tu cuenta original esté solucionada. ¡Gracias por tu paciencia!_ ✨`;

      // Copiar al portapapeles
      navigator.clipboard.writeText(mensajeTemporal).then(() => {
        btn.innerHTML = `✅ ¡Entregada!`;
        btn.style.background = "var(--ios-green)";
        btn.style.color = "white";
        btn.style.borderColor = "transparent";

        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Cuenta temporal copiada al portapapeles</span></div>`,
          );
        }

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = "rgba(255, 149, 0, 0.15)";
          btn.style.color = "var(--ios-orange)";
          btn.style.borderColor = "rgba(255, 149, 0, 0.3)";
        }, 2000);
      });
    } else {
      btn.innerHTML = originalText;
      let errMsg = res && res.message ? res.message : "Error de conexión.";
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-red);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg><span>${errMsg}</span></div>`,
        );
      } else {
        alert("❌ " + errMsg);
      }
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "node_" + cbName;
  scriptElement.src = `${GOOGLE_SCRIPT_URL}?action=obtenerCuentaTemporal&plataforma=${encodeURIComponent(plataforma)}&correoDanado=${encodeURIComponent(correoDanado)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(scriptElement);
};

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

// =========================================================================
// 📐 CYBERNET OS: GESTOR ESTRICTO DE VISIBILIDAD DEL DOCK (ANTI-CLICS FANTASMA)
// =========================================================================
function actualizarVisibilidadDock() {
  // 🔍 Escaneo robusto: Busca si hay modales con la clase 'open' O que tengan display activo
  const algunModalAbierto = Array.from(
    document.querySelectorAll(".overlay-ios"),
  ).some((modal) => {
    return (
      modal.classList.contains("open") ||
      (modal.style.display && modal.style.display !== "none")
    );
  });

  const dockWrapper = document.querySelector(".macos-dock-wrapper");
  if (!dockWrapper) return;

  if (algunModalAbierto) {
    // 🔒 CASO: Ventana abierta -> Desactivación física y reubicación total fuera de la pantalla
    document.body.style.overflow = "hidden";
    dockWrapper.style.setProperty("opacity", "0", "important");
    dockWrapper.style.setProperty("pointer-events", "none", "important");
    dockWrapper.style.setProperty(
      "visibility",
      "hidden",
      "important",
    ); /* 👈 Mata la interactividad en el navegador */
    dockWrapper.style.setProperty(
      "transform",
      "translateY(120px)",
      "important",
    ); /* 👈 Lo expulsa del área clickeable */
    dockWrapper.style.setProperty(
      "transition",
      "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
      "important",
    );
  } else {
    // 🏠 CASO: Escritorio limpio -> El Dock regresa flotando a su posición original con sus clics
    document.body.style.overflow = "";
    dockWrapper.style.setProperty("opacity", "1", "important");
    dockWrapper.style.setProperty("pointer-events", "auto", "important");
    dockWrapper.style.setProperty("visibility", "visible", "important");
    dockWrapper.style.setProperty("transform", "translateY(0)", "important");
    dockWrapper.style.setProperty(
      "transition",
      "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
      "important",
    );
  }
}

// Inicializador y limpiador del Vigilante automático (MutationObserver)
if (window.observadorModalesScroll) window.observadorModalesScroll.disconnect();

window.observadorModalesScroll = new MutationObserver(() => {
  actualizarVisibilidadDock();
});

// Unificación de inicializadores al cargar el ecosistema del DOM
document.addEventListener("DOMContentLoaded", () => {
  window.observadorModalesScroll.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: [
      "class",
      "style",
    ] /* 💡 🔥 CLAVE: Ahora también vigila cambios de estilos en línea */,
  });

  // Ejecución preventiva inicial y vinculación al redimensionamiento
  actualizarVisibilidadDock();
  window.addEventListener("resize", actualizarVisibilidadDock);
});

// Inicializador automático del radar
document.addEventListener("DOMContentLoaded", () => {
  observadorModalesScroll.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ["class"],
  });

  // Si el usuario cambia el tamaño del navegador o gira la pantalla, recalculamos
  window.addEventListener("resize", actualizarVisibilidadDock); // 👈 Nombre corregido
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

// =========================================================================
// 🎛️ FUNCIONES DE CONTROL DE CALENDARIO (Añadir en cualquier parte)
// =========================================================================
window.filtroMesHoras = new Date().getMonth();
window.filtroAnioHoras = new Date().getFullYear();
window.filtroQuincenaHoras = new Date().getDate() <= 15 ? 1 : 2;

window.cambiarMesHoras = function (mesIndex) {
  if (typeof haptic === "function") haptic();
  window.filtroMesHoras = parseInt(mesIndex, 10);
  let query = document.getElementById("searchShiftsInput")
    ? document.getElementById("searchShiftsInput").value.toLowerCase()
    : "";
  renderizarHorasEnPantalla(query);
};

window.cambiarQuincenaHoras = function (quincena) {
  if (typeof haptic === "function") haptic();
  window.filtroQuincenaHoras = quincena;
  let query = document.getElementById("searchShiftsInput")
    ? document.getElementById("searchShiftsInput").value.toLowerCase()
    : "";
  renderizarHorasEnPantalla(query);
};

// =========================================================================
// 📅 RENDERIZADOR DE CALENDARIO Y TURNOS (VERSION ULTRA CON TOTAL NÓMINA GLOBAL)
// =========================================================================
function renderizarHorasEnPantalla(filtroBusqueda = "") {
  const container = document.getElementById("shiftsScrollArea");
  if (!container) return;

  const userActivo = sessionStorage.getItem("active_staff");
  let userFinal = userActivo ? userActivo.toUpperCase() : "";
  const isCamilo = userFinal === "CAMILO";

  // 🏦 DICCIONARIO DE CUENTAS NEQUI DEL STAFF
  const numerosNequi = {
    KATHERINE: "3126117630",
    MANUEL: "3205386975",
    PABLO: "3153991383",
    MANUP: "3153991383",
    ANGELICA: "3015156037",
    LAURA: "3126350623",
  };

  // 📅 VARIABLES DE TIEMPO CONTROLADAS POR LOS BOTONES
  const dMes = window.filtroMesHoras;
  const dAnio = window.filtroAnioHoras;
  const esPrimeraQuincena = window.filtroQuincenaHoras === 1;

  const inicioDia = esPrimeraQuincena ? 1 : 16;
  const finDia = esPrimeraQuincena
    ? 15
    : new Date(dAnio, dMes + 1, 0).getDate();

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
  const mesesAbrev = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // 🚫 LEER TURNOS TACHADOS VISUALMENTE DESDE LA MEMORIA DEL NAVEGADOR
  let tachadosMemoria = JSON.parse(
    localStorage.getItem("cyber_turnos_tachados") || "{}",
  );

  // 🗃️ Agrupador de datos
  let datosAgrupados = {};
  let vendedoresSet = new Set();

  for (let index = 0; index < window.currentHorasStock.length; index++) {
    let item = window.currentHorasStock[index];
    let d = parseDate(item.fecha);

    if (
      !d ||
      isNaN(d.getTime()) ||
      d.getMonth() !== dMes ||
      d.getFullYear() !== dAnio
    )
      continue;
    let dDia = d.getDate();
    if (esPrimeraQuincena && dDia > 15) continue;
    if (!esPrimeraQuincena && dDia <= 15) continue;

    let vendedorReal = item.vendedor
      .toUpperCase()
      .replace(" (INGRESO MANUAL)", "")
      .trim();
    if (vendedorReal === "PABLO") vendedorReal = "MANUP";

    if (!isCamilo && vendedorReal !== userFinal) continue;

    if (
      filtroBusqueda !== "" &&
      !vendedorReal.includes(filtroBusqueda.toUpperCase()) &&
      !item.fecha.toLowerCase().includes(filtroBusqueda)
    ) {
      continue;
    }

    vendedoresSet.add(vendedorReal);

    if (!datosAgrupados[vendedorReal]) datosAgrupados[vendedorReal] = {};
    if (!datosAgrupados[vendedorReal][dDia]) {
      datosAgrupados[vendedorReal][dDia] = {
        totalSeconds: 0,
        totalPago: 0,
        filasAsociadas: [],
        fechaExactaOrigen: item.fecha,
      };
    }

    let timeParts = String(item.tiempo || "").split(":");
    let totalSec = 0;
    let esTiempoValido = false;

    if (timeParts.length >= 2) {
      totalSec =
        (parseInt(timeParts[0], 10) || 0) * 3600 +
        (parseInt(timeParts[1], 10) || 0) * 60 +
        (timeParts[2] ? parseInt(timeParts[2], 10) || 0 : 0);
      esTiempoValido = true;
    } else {
      let numPuro = parseFloat(String(item.tiempo || "").replace(",", "."));
      if (!isNaN(numPuro) && numPuro > 0) {
        totalSec = Math.floor(numPuro * 3600);
        esTiempoValido = true;
      }
    }

    let pagoStr = String(item.pagoTurno || "0");
    let strLimpioPago = pagoStr
      .replace(/\$|\s/g, "")
      .split(",")[0]
      .replace(/\./g, "");
    let pagoNum = parseInt(strLimpioPago, 10) || 0;

    if (esTiempoValido) {
      datosAgrupados[vendedorReal][dDia].totalSeconds += totalSec;
      datosAgrupados[vendedorReal][dDia].totalPago += pagoNum;
      if (item.filaIndex) {
        datosAgrupados[vendedorReal][dDia].filasAsociadas.push(item.filaIndex);
      }
    }
  }

  let vendedoresArray = Array.from(vendedoresSet).sort();

  // 🎛️ GENERADOR DE MENÚ DE CONTROLES DE FECHA
  let opcionesMes = "";
  mesesNombres.forEach((m, idx) => {
    let selected = idx === dMes ? "selected" : "";
    opcionesMes += `<option value="${idx}" ${selected}>${m} ${dAnio}</option>`;
  });

  let btnQ1Style = esPrimeraQuincena
    ? "background: var(--ios-blue); color: white; border: 1px solid var(--ios-blue);"
    : "background: rgba(10, 132, 255, 0.1); color: var(--ios-blue); border: 1px solid rgba(10, 132, 255, 0.3);";

  let btnQ2Style = !esPrimeraQuincena
    ? "background: var(--ios-blue); color: white; border: 1px solid var(--ios-blue);"
    : "background: rgba(10, 132, 255, 0.1); color: var(--ios-blue); border: 1px solid rgba(10, 132, 255, 0.3);";

  let htmlControles = `
      <div style="background: rgba(0,0,0,0.2); padding: 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: center;">
        <select class="input-ios" style="margin: 0; flex: 1; min-width: 140px; padding: 12px 16px; border-radius: 14px; font-weight: 800; font-size: 0.95rem; color: var(--ios-blue);" onchange="cambiarMesHoras(this.value)">
          ${opcionesMes}
        </select>
        <div style="display: flex; gap: 8px; flex: 2; min-width: 220px;">
          <button class="btn-ios" style="flex: 1; padding: 12px; border-radius: 14px; font-size: 0.85rem; font-weight: 800; transition: all 0.2s; ${btnQ1Style}" onclick="cambiarQuincenaHoras(1)">Quincena 1 (1 - 15)</button>
          <button class="btn-ios" style="flex: 1; padding: 12px; border-radius: 14px; font-size: 0.85rem; font-weight: 800; transition: all 0.2s; ${btnQ2Style}" onclick="cambiarQuincenaHoras(2)">Quincena 2 (16 - Fin)</button>
        </div>
      </div>
    `;

  if (vendedoresArray.length === 0 && filtroBusqueda === "") {
    if (!isCamilo && userFinal !== "") {
      vendedoresArray.push(userFinal);
      datosAgrupados[userFinal] = {};
    } else {
      container.innerHTML =
        htmlControles +
        '<div style="text-align:center; padding:30px; color:var(--text-secondary); font-weight:600; line-height:1.4;">No hay turnos registrados en este periodo.</div>';
      return;
    }
  } else if (vendedoresArray.length === 0) {
    container.innerHTML =
      htmlControles +
      '<div style="text-align:center; padding:30px; color:var(--text-secondary); font-weight:600; line-height:1.4;">No hay turnos que coincidan con la búsqueda.</div>';
    return;
  }

  let tituloPanel = isCamilo
    ? `Reporte Global (${inicioDia} al ${finDia} de ${mesesAbrev[dMes]})`
    : `Mi Reporte (${inicioDia} al ${finDia} de ${mesesAbrev[dMes]})`;
  if (filtroBusqueda !== "") tituloPanel = "Resultados de Búsqueda";

  let html =
    htmlControles +
    `<h4 style="text-align:center; color:var(--text-primary); font-size:1.05rem; margin-bottom:15px; font-weight: 800; letter-spacing: -0.3px;">${tituloPanel}</h4>`;

  // 💰 ACUMULADOR DE NÓMINA TOTAL GLOBAL
  let totalNominaGlobal = 0;

  // 🏗️ CONSTRUCCIÓN DEL LAYOUT TIPO CALENDARIO POR VENDEDOR
  for (let v = 0; v < vendedoresArray.length; v++) {
    let vendedor = vendedoresArray[v];
    let dataVendedor = datosAgrupados[vendedor];
    let totalSegundosVendedor = 0;
    let totalPagoVendedor = 0;
    let filasVendedorGlobal = [];

    let primerDiaFecha = new Date(dAnio, dMes, inicioDia);
    let offsetDias = primerDiaFecha.getDay();

    let celdasHtml = diasSemana
      .map(
        (d) =>
          `<div style="text-align: center; font-size: 0.7rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; padding-bottom: 8px;">${d}</div>`,
      )
      .join("");

    for (let o = 0; o < offsetDias; o++) {
      celdasHtml += `<div style="background: transparent;"></div>`;
    }

    for (let dia = inicioDia; dia <= finDia; dia++) {
      let worked = dataVendedor ? dataVendedor[dia] : null;
      let timeStr = "";
      let btnAcciones = "";
      let hasWorked = false;

      let llaveTachado = `${vendedor}_${dia}_${dMes}_${dAnio}`;
      let estaTachado = tachadosMemoria[llaveTachado] === true;

      if (worked && worked.totalSeconds > 0) {
        hasWorked = true;

        if (!estaTachado) {
          totalSegundosVendedor += worked.totalSeconds;
          totalPagoVendedor += worked.totalPago;
        }

        let h = Math.floor(worked.totalSeconds / 3600);
        let m = Math.floor((worked.totalSeconds % 3600) / 60);
        timeStr =
          String(h).padStart(2, "0") + "h " + String(m).padStart(2, "0") + "m";

        let filasStrInd = worked.filasAsociadas.join(",");
        filasVendedorGlobal.push(...worked.filasAsociadas);

        let puedeEditar = isCamilo;

        if (puedeEditar) {
          btnAcciones += `
              <button style="background: rgba(10, 132, 255, 0.15); border: none; color: var(--ios-blue); cursor: pointer; padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex: 1; transition: all 0.2s;" onclick="abrirEdicionHoras('${vendedor}', '${dia} de ${mesesAbrev[dMes]}', '${worked.fechaExactaOrigen}', '${timeStr}', '${filasStrInd}')" title="Editar tiempo">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>`;
        }

        if (isCamilo) {
          let colorTachar = estaTachado
            ? "var(--ios-green)"
            : "var(--ios-orange)";
          let iconTachar = estaTachado
            ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`
            : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M2 12h20M12 2v20"></path><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>`;

          btnAcciones += `
              <button style="background: rgba(255, 159, 10, 0.15); border: none; color: ${colorTachar}; cursor: pointer; padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex: 1; transition: all 0.2s;" onclick="toggleTacharTurno('${llaveTachado}')" title="${estaTachado ? "Restaurar Pago" : "Tachar y Restar"}">
                ${iconTachar}
              </button>`;

          let targetInd = `${vendedor} el ${dia} de ${mesesAbrev[dMes]}`;
          btnAcciones += `
              <button style="background: rgba(255, 69, 58, 0.15); border: none; color: var(--ios-red); cursor: pointer; padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex: 1; transition: all 0.2s;" onclick="ejecutarLiquidacion('${targetInd}', '${filasStrInd}')" title="Borrar este día de la base de datos">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>
              </button>`;
        }
      }

      let bgCell = hasWorked ? "rgba(48, 209, 88, 0.08)" : "rgba(0,0,0,0.2)";
      let borderCell = hasWorked
        ? "1px solid rgba(48, 209, 88, 0.3)"
        : "1px solid rgba(255,255,255,0.05)";
      let opacityCell = "1";

      if (estaTachado) {
        bgCell = "rgba(255, 159, 10, 0.08)";
        borderCell = "1px solid rgba(255, 159, 10, 0.3)";
        opacityCell = "0.5";
      }

      let numColor = hasWorked
        ? "var(--text-primary)"
        : "var(--text-secondary)";
      let decoracionTexto = estaTachado
        ? "text-decoration: line-through; opacity: 0.6;"
        : "";

      let contenidoCentral = hasWorked
        ? `
          <div style="font-family: monospace; font-size: 0.8rem; font-weight: 800; color: var(--ios-green); margin-top: 6px; ${decoracionTexto}">${timeStr}</div>
          <div style="font-size: 0.7rem; font-weight: 800; color: var(--text-primary); margin-top: 2px; ${decoracionTexto}">$${Math.round(worked.totalPago).toLocaleString("es-CO")}</div>
          <div style="display: flex; gap: 4px; justify-content: center; width: 100%; margin-top: 6px;">${btnAcciones}</div>
        `
        : ``;

      celdasHtml += `
          <div style="position: relative; background: ${bgCell}; border: ${borderCell}; border-radius: 12px; padding: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70px; opacity: ${opacityCell}; transition: all 0.3s ease;">
              <span style="position: absolute; top: 4px; left: 6px; font-size: 0.75rem; font-weight: 800; color: ${numColor};">${dia}</span>
              ${contenidoCentral}
          </div>
        `;
    }

    // ➕ AGREGAMOS EL DINERO REAL DE ESTE VENDEDOR AL TOTAL GLOBAL
    totalNominaGlobal += totalPagoVendedor;

    let tH = Math.floor(totalSegundosVendedor / 3600);
    let tM = Math.floor((totalSegundosVendedor % 3600) / 60);
    let totalFmt =
      String(tH).padStart(2, "0") + "h " + String(tM).padStart(2, "0") + "m";
    let pagoTotalFmt =
      "$" + Math.round(totalPagoVendedor).toLocaleString("es-CO");

    let btnLiquidarTodo = "";
    if (isCamilo && filasVendedorGlobal.length > 0) {
      btnLiquidarTodo = `
          <div style="margin-top:20px;">
            <button class="btn-ios btn-success w-100" style="display:flex; justify-content:center; align-items:center; gap:8px; border-radius: 16px; padding: 14px; font-weight: 800;" onclick="ejecutarLiquidacion('${vendedor}', '${filasVendedorGlobal.join(",")}')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="12" y1="1" x2="12" y2="23"></line><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H6"></path></svg>
              LIQUIDAR PERIODO EN PANTALLA DE ${vendedor}
            </button>
          </div>`;
    }

    let nequiNum = numerosNequi[vendedor];
    let nequiHtml = nequiNum
      ? `
          <div style="display:flex; align-items:center; gap:6px; margin-top: 4px;">
            <span style="background:rgba(224, 0, 150, 0.15); color:#ff37a6; padding:2px 6px; border-radius:6px; font-size:0.65rem; font-weight:800; border: 1px solid rgba(224, 0, 150, 0.3);">NEQUI</span>
            <span style="color:var(--text-primary); font-size:0.85rem; font-family:monospace; font-weight:bold; letter-spacing: 0.5px;">${nequiNum}</span>
            <button style="background:rgba(10, 132, 255, 0.15); border:none; border-radius:6px; width:24px; height:24px; display:flex; align-items:center; justify-content:center; color:var(--ios-blue); cursor:pointer; transition:all 0.2s;" onclick="copiarTextoRapido(this, '${nequiNum}')" title="Copiar Nequi">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
          </div>
        `
      : `<span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; margin-top: 4px;">Sin Nequi Registrado</span>`;

    html += `
        <div class="card-ios" style="padding: 24px; margin-bottom: 24px; border-radius: 28px; border: 1px solid rgba(255,255,255,0.08);">
          <div class="flex-row-between" style="padding-bottom: 16px; border-bottom: 1px dashed rgba(255,255,255,0.15); margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="background: rgba(10, 132, 255, 0.15); color: var(--ios-blue); width: 42px; height: 42px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: 800; font-size: 1.2rem; border: 1px solid rgba(10, 132, 255, 0.2);">
                ${vendedor.charAt(0)}
              </div>
              <div style="display: flex; flex-direction: column;">
                  <span style="font-weight: 800; font-size: 1.15rem; color: var(--text-primary); text-transform: uppercase;">${vendedor}</span>
                  ${nequiHtml}
              </div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">Total Horas</span><br>
              <span style="font-weight: 800; color: var(--ios-blue); font-size: 1.3rem;">${totalFmt}</span><br>
              <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; margin-top: 6px; display: inline-block;">Total a Pagar</span><br>
              <span style="font-weight: 800; color: var(--ios-green); font-size: 1.25rem; transition: all 0.3s ease;">${pagoTotalFmt}</span>
            </div>
          </div>
          
          <div style="width: 100%; overflow-x: auto; padding-bottom: 8px;">
              <div style="min-width: 420px; display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;">
                  ${celdasHtml}
              </div>
          </div>
          
          ${btnLiquidarTodo}
        </div>
      `;
  }

  container.innerHTML = html;

  // =========================================================================
  // 👑 FILTRO DE SEGURIDAD MÁSTER: INYECCIÓN DE TOTAL QUINCENA PARA CAMILO
  // =========================================================================
  if (isCamilo) {
    // Buscamos el botón "+ Agregar" dentro del modal de turnos
    const btnAgregar = [...document.querySelectorAll("button")].find((b) =>
      b.textContent.includes("Agregar"),
    );

    if (btnAgregar) {
      // Limpiamos selectores viejos para evitar duplicados al cambiar de periodo
      const indicadorViejo = document.getElementById("indicadorTotalQuincena");
      if (indicadorViejo) indicadorViejo.remove();

      // Creamos la píldora financiera con los estilos iOS nativos de tu plataforma
      const badgeTotal = document.createElement("span");
      badgeTotal.id = "indicadorTotalQuincena";
      badgeTotal.style.cssText = `
        background: rgba(10, 132, 255, 0.12);
        color: var(--ios-blue);
        padding: 8px 14px;
        border-radius: 12px;
        font-weight: 800;
        font-size: 0.85rem;
        margin-right: 12px;
        border: 1px solid rgba(10, 132, 255, 0.25);
        display: inline-flex;
        align-items: center;
        vertical-align: middle;
      `;

      const totalFormateado =
        "$" + Math.round(totalNominaGlobal).toLocaleString("es-CO");
      badgeTotal.innerHTML = `📊 Total Quincena: <strong style="margin-left: 6px; color: #ffffff;">${totalFormateado}</strong>`;

      // Colocamos el indicador exactamente al lado izquierdo del botón "+ Agregar"
      btnAgregar.parentNode.insertBefore(badgeTotal, btnAgregar);
    }
  }
}
// 🚫 REVOLUCIÓN CLOUD: Tacha el turno visualmente y asienta el pago en la base de datos global
window.toggleTacharTurno = function (llave) {
  if (typeof haptic === "function") haptic();

  // Cambiamos el texto del acumulador temporalmente para indicar carga en red
  const btnTachar = event?.currentTarget;
  if (btnTachar) btnTachar.style.opacity = "0.4";

  const cbName = "cb_tachar_" + Date.now();
  window[cbName] = function (res) {
    const node = document.getElementById("node_" + cbName);
    if (node) node.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      // Guardamos la respuesta global actualizada en el caché local para renderizado instantáneo
      localStorage.setItem("cyber_turnos_tachados", JSON.stringify(res.data));

      let query = document.getElementById("searchShiftsInput")
        ? document.getElementById("searchShiftsInput").value.toLowerCase()
        : "";
      renderizarHorasEnPantalla(query);
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=toggleTacharBackend&llave=${encodeURIComponent(llave)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};
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

// =========================================================================
// 🌐 HELPER GLOBAL DE COPIADO CON RESPUESTA TOAST (CYBERNET SECURITY)
// =========================================================================
if (!window.copiarTextoBandeja) {
  window.copiarTextoBandeja = function (texto, mensajeExito) {
    if (typeof haptic === "function") haptic();

    navigator.clipboard
      .writeText(texto)
      .then(() => {
        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green); font-weight:700;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> 
            <span>${mensajeExito}</span>
           </div>`,
          );
        }
      })
      .catch((err) => {
        console.error("Error crítico al copiar: ", err);
      });
  };
}

// =========================================================================
// 🔑 CORE BANDEJA: RENDERIZADOR DINÁMICO DE TARJETAS DE CÓDIGOS
// =========================================================================
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

    // 🔍 ANALIZADOR INTELIGENTE ANTI-DESBORDAMIENTO
    let textoLimpio = (item.codigoLink || "").trim();
    // Escapamos comillas simples para evitar roturas en el atributo onclick de HTML
    let textoEscapado = textoLimpio.replace(/'/g, "\\'");

    // Filtro: Detecta si el valor es un enlace web válido
    const esURL =
      /^(http|https):\/\/[^ "]+$/.test(textoLimpio) ||
      textoLimpio.toLowerCase().includes("www.");

    let renderCodigoOEnlace = "";

    if (esURL) {
      // 🔗 CASO URL: Oculta por completo el link largo y dibuja un botón compacto Apple Style
      renderCodigoOEnlace = `
        <button class="btn-ios" style="padding: 6px 14px; font-size: 0.82rem; border-radius: 10px; margin: 0; background: rgba(10, 132, 255, 0.1) !important; color: var(--ios-blue) !important; border: 1px solid rgba(10, 132, 255, 0.2); font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;" 
                onclick="window.copiarTextoBandeja('${textoEscapado}', 'Enlace de acceso copiado')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          Copiar Enlace
        </button>
      `;
    } else {
      // 🔢 CASO CÓDIGO NUMÉRICO/PIN: Se mantiene 100% visible, destacado y clickeable para copiar
      renderCodigoOEnlace = `
        <span style="font-size: 1.15rem; color: ${colColor}; font-weight: 800; font-family: monospace; background: rgba(255, 255, 255, 0.03); padding: 4px 14px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.06); letter-spacing: 0.5px; cursor: pointer; display: inline-block; transition: transform 0.1s; text-shadow: 0 0 10px rgba(255,255,255,0.05);" 
              onclick="window.copiarTextoBandeja('${textoEscapado}', 'Código copiado al portapapeles')"
              onmousedown="this.style.transform='scale(0.96)'"
              onmouseup="this.style.transform='scale(1)'"
              title="Haz clic para copiar código">
          ${textoLimpio}
        </span>
      `;
    }

    htmlCards += `
        <div class="card-ios mb-1" style="padding: 16px; background: rgba(255, 255, 255, 0.015); border: 1px solid var(--glass-border); border-radius: 16px; display: flex; flex-direction: column; gap: 12px; box-shadow: var(--glass-shadow);">
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: ${colColor}; box-shadow: 0 0 10px ${colColor};"></span>
                    <span style="font-size: 0.95rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.3px; text-transform: uppercase;">${item.plataforma}</span>
                </div>
                <span style="font-size: 0.75rem; color: var(--text-secondary); font-family: monospace; font-weight: 600; opacity: 0.8;">${item.hora}</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px; padding: 2px 0;">
                <div style="display: flex; align-items: baseline; gap: 8px;">
                    <span style="font-size: 0.78rem; color: var(--text-secondary); min-width: 105px; flex-shrink: 0; text-transform: uppercase; font-weight: 600; letter-spacing: 0.3px;">Cliente:</span>
                    <span style="font-size: 0.88rem; color: var(--text-primary); font-weight: 600; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.correo}">${item.correo}</span>
                </div>
                <div style="display: flex; align-items: baseline; gap: 8px;">
                    <span style="font-size: 0.78rem; color: var(--text-secondary); min-width: 105px; flex-shrink: 0; text-transform: uppercase; font-weight: 600; letter-spacing: 0.3px;">Acción:</span>
                    <span style="font-size: 0.85rem; color: var(--text-primary); font-weight: 500; opacity: 0.95; line-height: 1.3;">${item.accion}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                    <span style="font-size: 0.78rem; color: var(--text-secondary); min-width: 105px; flex-shrink: 0; text-transform: uppercase; font-weight: 600; letter-spacing: 0.3px;">Código / Enlace:</span>
                    ${renderCodigoOEnlace}
                </div>
            </div>

            <button class="btn-ios btn-secondary w-100" style="display: flex; justify-content: center; align-items: center; gap: 8px; padding: 12px; font-weight: 700; font-size: 0.85rem; border-radius: 12px; margin: 0; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border); transition: all 0.2s;" onclick="copiarMensajeRapidoGmail(this, ${i})">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
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

// =========================================================================
// 🔐 MÓDULO DE ACCESO (LOGIN & WORKSPACE) - VERSIÓN LIMPIA
// =========================================================================

function validateStaffAccess(e) {
  if (e) e.preventDefault();
  if (typeof haptic === "function") haptic();

  const userElement = document.getElementById("staffUser");
  const passElement = document.getElementById("staffPass");
  const remElement = document.getElementById("rememberMe");

  const userInput = userElement ? userElement.value.toUpperCase().trim() : "";
  const passInput = passElement ? passElement.value.trim() : "";
  const rememberMe = remElement ? remElement.checked : false;
  const errorToast = document.getElementById("error-login-toast");
  const submitBtn = document.querySelector('#loginForm button[type="submit"]');

  if (!userInput || !passInput) return;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Verificando...`;
  }

  const oldScript = document.getElementById("cyber_login_node");
  if (oldScript) oldScript.remove();

  window.procesarLoginSheets = function (res) {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Verificar Identidad";
    }
    const scriptNode = document.getElementById("cyber_login_node");
    if (scriptNode) scriptNode.remove();

    if (res && res.status === "need_email") {
      // Falta correo: Oculta login, muestra registro de email
      window.tempAuthUser = userInput; // Memoria temporal
      document.getElementById("loginOverlay").style.display = "none";
      document.getElementById("emailRegisterOverlay").style.display = "flex";
      setTimeout(() => document.getElementById("staffNewEmail").focus(), 200);
    } else if (res && res.status === "need_code") {
      // Tiene correo y despachó OTP: Muestra ventana 6 dígitos y arranca reloj
      window.tempAuthUser = userInput;
      document.getElementById("lblMaskedEmail").innerText = res.emailMasked;
      document.getElementById("loginOverlay").style.display = "none";
      document.getElementById("emailRegisterOverlay").style.display = "none";
      document.getElementById("otpVerificationOverlay").style.display = "flex";

      iniciarRelojOTP(300); // 300 segundos = 5 min
      setTimeout(() => document.getElementById("staffOtpCode").focus(), 200);
    } else if (res && res.status === "success") {
      // Esto ocurrirá solo para excepciones o si apagas el 2FA en el futuro
      sessionStorage.setItem("active_staff", userInput);
      if (rememberMe) localStorage.setItem("cyber_saved_staff", userInput);
      document.getElementById("loginOverlay").style.display = "none";
      const controlRight = document.getElementById("macControlCenterRight");
      if (controlRight) controlRight.style.display = "flex";
      entrarAlSistema(userInput);
    } else {
      let errMsg = res ? res.message : "Credenciales incorrectas.";
      if (errorToast) {
        errorToast.innerHTML = `<div style="display:flex; align-items:center; gap:8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> <span>${errMsg}</span></div>`;
        errorToast.style.display = "block";
      }
      if (passElement) passElement.value = "";
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_login_node";

  // 🔥 SEGURO ANTI-CONGELAMIENTO: Restaura el botón si Google bloquea la conexión
  scriptElement.onerror = function () {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Verificar Identidad";
    }
    if (errorToast) {
      errorToast.innerHTML = `<div style="display:flex; align-items:center; gap:8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> <span>Error de conexión. Revisa los permisos de Google.</span></div>`;
      errorToast.style.display = "block";
    }
    scriptElement.remove();
  };

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

function entrarAlSistema(userInput) {
  // 🔥 1. LIMPIEZA MAESTRA: Destruimos rastros de ventanas de Login y 2FA
  ["loginOverlay", "emailRegisterOverlay", "otpVerificationOverlay"].forEach(
    (id) => {
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.remove("open"); // <-- ESTE ERA EL CULPABLE
        modal.style.setProperty("display", "none", "important");
      }
    },
  );

  // 🔒 2. SELLAR USUARIO EN MEMORIA (Previene el error de "Vendedor")
  sessionStorage.setItem("active_staff", userInput.toUpperCase().trim());

  if (userInput.toUpperCase().trim() !== "CAMILO") {
    ejecutarNotificacionDeCorreo(userInput, "inicio", "00:00:00");
  }

  // 🖥️ 3. ENCENDEMOS LA INTERFAZ PRINCIPAL
  const workspace = document.getElementById("mainWorkspace");
  if (workspace) workspace.style.display = "flex";

  const globalHeader = document.getElementById("globalHeader");
  if (globalHeader) globalHeader.style.display = "flex";

  const controlPanel = document.getElementById("controlPanel");
  if (controlPanel) controlPanel.style.display = "flex";

  let sessionNameEl = document.getElementById("staffSessionName");
  if (sessionNameEl) sessionNameEl.innerText = userInput;

  const currentOperator = userInput.toUpperCase().trim();
  const shiftTimer = document.getElementById("shiftTimer");
  const cajaBtn = document.getElementById("btnCajaFinanzas");
  const btnRegistro = document.getElementById("btnRegistroVentas");

  if (btnRegistro)
    btnRegistro.style.setProperty("display", "flex", "important");

  // 🍎 PROTECCIÓN DE CONTROLES
  if (currentOperator === "CAMILO") {
    if (shiftTimer)
      shiftTimer.style.setProperty("display", "none", "important");
    if (cajaBtn) cajaBtn.style.setProperty("display", "flex", "important");
  } else {
    if (shiftTimer)
      shiftTimer.style.setProperty("display", "inline-flex", "important");
    if (cajaBtn) cajaBtn.style.setProperty("display", "none", "important");
  }

  // 🚀 4. FORZAR LA APARICIÓN DEL DOCK AL INSTANTE
  if (typeof actualizarVisibilidadDock === "function") {
    actualizarVisibilidadDock();
  }

  // ⚙️ 5. INICIALIZAR EL ESCRITORIO Y EL MOTOR FANTASMA
  inicializarWorkspace();
}

function inicializarWorkspace() {
  cargarPlantillasDesdeSheets(); // 👈 Llama a Google Sheets por los mensajes
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

// Reemplaza el fragmento de inicialización por este:
window.addEventListener("DOMContentLoaded", () => {
  let savedTheme = localStorage.getItem("cyber_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  let sessionStaff = sessionStorage.getItem("active_staff");
  let localStaff = localStorage.getItem("cyber_saved_staff");
  let user = sessionStaff || localStaff;

  if (user) {
    // Si está en la página de login pero ya está autenticado, mandarlo al admin
    if (window.location.pathname.includes("login.html")) {
      window.location.href = "admin.html";
      return;
    }
    entrarAlSistema(user, false, true);
  }
});

const qrPrincipal = {
  titulo: "PAGOS",
  imagenUrl:
    "https://i.postimg.cc/9Fb55dGq/Whats-App-Image-2026-07-02-at-4-18-01-PM.jpg",
  texto: `Te comparto nuestra llave para el pago de tu servicio desde cualquier entidad bancaria:\n\n📌 *Llave:* 0090878219\n👤 *Verificar nombre:* REF CYBERNET\n\n⚠️ *Nota:* Esta llave es exclusiva para pagos mediante Bre-B desde cualquier banco.\n\n*Pasos para activar tu servicio:* 1️⃣ Realiza la transferencia.\n2️⃣ Envía el comprobante de pago por este medio.\n3️⃣ ¡Recibe tu acceso y empieza a disfrutar! 🚀🎬`,
};

// 🔥 BLINDAJE: Solo ejecutamos esto si estamos en admin.html (donde existe el headerContainer)
document.addEventListener("DOMContentLoaded", () => {
  const headerContainer = document.getElementById("header-container");
  if (headerContainer && typeof qrPrincipal !== "undefined") {
    headerContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%;">
          <span style="font-size: 0.9rem; color: rgba(255,255,255,0.8); font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">
            💳 ${qrPrincipal.titulo}
          </span>
          
          <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <img src="${qrPrincipal.imagenUrl}" alt="QR" style="width: 160px; height: 160px; border-radius: 12px; padding: 6px; background: white; object-fit: contain;">
          </div>
          
          <span style="font-size: 0.75rem; color: var(--text-secondary); text-align: center; margin-top: -4px;">
            (Mantén presionado para copiar imagen)
          </span>

          <button class="btn-ios btn-secondary copy-text-btn w-100" style="padding: 14px; font-size: 0.85rem; font-weight: 700; border-radius: 12px; background: rgba(10, 132, 255, 0.15); color: var(--ios-blue); border: 1px solid rgba(10, 132, 255, 0.2);" data-clipboard-text="${qrPrincipal.texto.replace(/"/g, "&quot;").replace(/'/g, "&#39;")}">
            Copiar Datos de Pago
          </button>
        </div>
      `;
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      renderGrid(e.target.value);
    });
  }
});

// Envolvemos el Clipboard para que espere a que la página cargue por completo
document.addEventListener("DOMContentLoaded", () => {
  if (typeof ClipboardJS !== "undefined") {
    const clipboard = new ClipboardJS(".copy-text-btn");

    clipboard.on("success", function (e) {
      if (typeof haptic === "function") haptic();
      const btn = e.trigger;
      const card = btn.closest(".card-ios");
      const originalText = btn.textContent;

      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡COPIADO!`;
      btn.classList.remove("btn-secondary");
      btn.classList.add("btn-danger");

      if (card) {
        card.style.borderColor = "var(--ios-red)";
        card.style.boxShadow = "0 0 20px rgba(255, 69, 58, 0.25)";
      }

      setTimeout(function () {
        btn.textContent = originalText;
        btn.classList.remove("btn-danger");
        btn.classList.add("btn-secondary");
        if (card) {
          card.style.borderColor = "var(--glass-border)";
          card.style.boxShadow = "var(--glass-shadow)";
        }
      }, 1500);
    });
  }
});

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
        "3126350623",
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
  const activeUser =
    sessionStorage.getItem("active_staff") ||
    localStorage.getItem("cyber_saved_staff") ||
    "Vendedor";

  sessionStorage.setItem("cyber_last_sync_time", ahora);

  fetch(
    "https://script.google.com/macros/s/AKfycbxk_T98sS1lL5lbXVq_XKOpB6ZCNQ1DSCgPhc_a6vmE_ai16YbSYO_eHkmeu0ZjM5aq/exec",
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
    const activeUser =
      sessionStorage.getItem("active_staff") ||
      localStorage.getItem("cyber_saved_staff") ||
      "Vendedor";

    fetch(
      "https://script.google.com/macros/s/AKfycbxk_T98sS1lL5lbXVq_XKOpB6ZCNQ1DSCgPhc_a6vmE_ai16YbSYO_eHkmeu0ZjM5aq/exec",
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

// =========================================================================
// LÓGICA: VENTANA "TOTAL NÓMINA" (VERSIÓN TABLA MINIMALISTA ENTERPRISE)
// =========================================================================
function renderizarTotalNomina(listaNomina, detalles) {
  const userActivo = (sessionStorage.getItem("active_staff") || "")
    .toUpperCase()
    .trim();
  const isCamilo = userActivo === "CAMILO";

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
    MANUP: "3153991383",
    ANGELICA: "3015156037",
    LAURA: "3126350623",
  };

  // 1. ABRIMOS EL CONTENEDOR DE LA TABLA (Sin la columna Acción)
  let html = `
    <div style="background: var(--card-bg); border: var(--glass-border); border-radius: 12px; overflow: hidden; width: 100%;">
      <div style="width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; min-width: 450px;">
          <thead>
            <tr style="background: rgba(255, 255, 255, 0.02); border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <th style="padding: 14px 16px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Operador</th>
              <th style="padding: 14px 16px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Balance</th>
              <th style="padding: 14px 16px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Total Neto</th>
            </tr>
          </thead>
          <tbody>
  `;

  let empleadosMostrados = 0;
  let sumatoriaTotalNeto = 0; // 🔥 NUEVO: Acumulador del Total a Pagar

  // 2. LLENAMOS LAS FILAS DE LA TABLA
  listaNomina.forEach((empData) => {
    // Filtro de seguridad: Si no es Camilo, solo ve su propia fila
    if (!isCamilo && empData.empleado !== userActivo) return;
    empleadosMostrados++;

    let ganado = parseFloat(empData.ganado) || 0;
    let desc = parseFloat(empData.descontado) || 0;
    let neto = parseFloat(empData.neto) || 0;
    let colorNeto = neto >= 0 ? "var(--text-primary)" : "var(--ios-red)";

    // Sumamos al total global de la quincena (solo valores positivos)
    if (neto > 0) {
      sumatoriaTotalNeto += neto;
    }

    // 💳 Botón de Nequi Compacto
    let nequiNum = numerosNequi[empData.empleado];
    let nequiHtml = "";
    if (nequiNum) {
      nequiHtml = `
        <div style="display:inline-flex; align-items:center; gap:4px; margin-top: 4px; background:rgba(224, 0, 150, 0.1); padding:2px 6px; border-radius:6px; border: 1px solid rgba(224, 0, 150, 0.2);">
          <span style="color:#ff37a6; font-size:0.6rem; font-weight:800;">NEQUI</span>
          <span style="color:var(--text-primary); font-size:0.75rem; font-family:monospace; font-weight:bold;">${nequiNum}</span>
          <button style="background:transparent; border:none; padding:0; color:var(--text-secondary); cursor:pointer;" onclick="copiarTextoRapido(this, '${nequiNum}')" title="Copiar Nequi">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
        </div>
      `;
    }

    html += `
      <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.03); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
        <td style="padding: 16px;">
          <div style="font-weight: 800; color: var(--text-primary); font-size: 0.95rem; text-transform: uppercase;">${empData.empleado}</div>
          ${nequiHtml}
        </td>
        <td style="padding: 16px; font-family: monospace;">
          <div style="color: var(--ios-green); font-weight: 700; font-size: 0.85rem;">+$${Math.round(ganado).toLocaleString("es-CO")}</div>
          <div style="color: var(--ios-red); font-weight: 700; font-size: 0.85rem;">-$${Math.round(desc).toLocaleString("es-CO")}</div>
        </td>
        <td style="padding: 16px; color: ${colorNeto}; font-weight: 800; font-size: 1.15rem; font-family: monospace;">
          $${Math.round(neto).toLocaleString("es-CO")}
        </td>
      </tr>
    `;
  });

  // 🔥 NUEVO: Fila final con la SUMA TOTAL de todo lo que se debe pagar
  if (isCamilo && empleadosMostrados > 0) {
    html += `
      <tr style="background: rgba(0, 0, 0, 0.2); border-top: 2px solid rgba(255, 255, 255, 0.1);">
        <td colspan="2" style="padding: 16px; text-align: right; color: var(--text-secondary); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
          Total Nómina a Pagar:
        </td>
        <td style="padding: 16px; color: var(--ios-green); font-weight: 900; font-size: 1.3rem; font-family: monospace;">
          $${Math.round(sumatoriaTotalNeto).toLocaleString("es-CO")}
        </td>
      </tr>
    `;
  }

  html += `
          </tbody>
        </table>
      </div>
    </div>
  `;

  if (empleadosMostrados === 0) {
    html =
      "<div class='empty-log-msg'>No se encontraron tus registros de nómina.</div>";
  }

  // 3. AGREGAMOS EL DETALLE DE LOS DESCUENTOS
  let detallesFiltrados = (detalles || []).filter(
    (d) => isCamilo || d.empleado === userActivo,
  );

  if (detallesFiltrados.length > 0) {
    html += `
      <div style="margin-top: 20px;">
        <h4 style="color: var(--ios-orange); font-size: 0.85rem; margin-bottom: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Historial de Descuentos</h4>
        <div style="display: flex; flex-direction: column; gap: 6px;">
    `;
    detallesFiltrados.forEach((d) => {
      html += `
        <div style="background: rgba(255, 159, 10, 0.05); border: 1px solid rgba(255, 159, 10, 0.15); padding: 10px 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; flex-direction: column;">
            <strong style="color: var(--text-primary); font-size: 0.85rem;">${isCamilo ? d.empleado : d.detalle.split("-")[0].trim()}</strong>
            <span style="color: var(--text-secondary); font-size: 0.7rem;">${d.fecha} | ${d.detalle.includes("-") ? d.detalle.split("-")[1].trim() : ""}</span>
          </div>
          <strong style="color: var(--ios-red); font-size: 0.95rem; font-family: monospace;">-$${Math.round(d.monto).toLocaleString("es-CO")}</strong>
        </div>
      `;
    });
    html += `</div></div>`;
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
      let fichaFinal = `🌟 *¡Hola${nombreSaludo}!*\n\nTu pedido ha sido procesado con éxito. Aquí tienes tus accesos:`;

      res.data.forEach((d) => {
        let perfilTexto = d.perfil ? `\n🌐 *Perfil:* ${d.perfil}` : "";
        if (d.pin) {
          perfilTexto += ` | *PIN:* ${d.pin}`;
        }

        fichaFinal += `\n\n🎬 *DETALLES DE ${d.plataforma}* ✅\n────────────────────\n`;

        // ⚠️ ADVERTENCIA ARRIBA (SOLO NETFLIX)
        if (d.plataforma === "NETFLIX") {
          fichaFinal += `⚠️ *Para iniciar sesión:* Cuando te pida un código, selecciona *Obtener ayuda* y después *Usar contraseña*.\n\n`;
        }

        // DATOS EN NEGRITA
        fichaFinal += `👤 *Correo:* ${d.correo}\n🔐 *Contraseña:* ${d.clave}${perfilTexto}\n📅 *Vence:* ${d.vencimiento}\n`;

        // 🤖 BOT DE CÓDIGOS ABAJO (SOLO NETFLIX)
        if (d.plataforma === "NETFLIX") {
          fichaFinal += `\n🤖 *¿NECESITAS UN CÓDIGO?* Puedes usar nuestra pagina para codigos disponible 24/7: www.cybernetsp.com/`;
        }
      });

      fichaFinal += `\n\n📢 *INFORMACIÓN IMPORTANTE:* \n────────────────────\n⚠️ *Garantía activa:* Tu servicio cuenta con respaldo total durante su vigencia. \n🆘 *Soporte:* Si presentas algún inconveniente, *infórmanos de inmediato* para brindarte una solución rápida.\n\n💎 *Disfruta tu servicio.*\n✨ *¡Gracias por elegirnos!* ✨`;
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

// Variable máster de control para el loop del radar de verificación
window.verificationLinkInterval = null;

function iniciarCreacionCuentaNetflix(btn) {
  if (typeof haptic === "function") haptic();
  const contenidoOriginal = btn.innerHTML;

  // 🛡️ REVISAR SI HAY UNA CUENTA PENDIENTE EN MEMORIA
  let pendienteGuardada = localStorage.getItem("cyber_netflix_pendiente");
  if (pendienteGuardada) {
    let d = JSON.parse(pendienteGuardada);

    // Ponemos el botón en modo de escaneo
    btn.style.pointerEvents = "none";
    btn.innerHTML = `<div style="text-align:center; width:100%; padding: 14px;"><svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ios-orange)" stroke-width="2.5" style="margin-right:8px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> <span style="color:var(--ios-orange); font-weight:bold;">Verificando estado en la base...</span></div>`;

    const cbCheck = "cb_check_" + Date.now();
    window[cbCheck] = function (res) {
      btn.style.pointerEvents = "auto";
      btn.innerHTML = contenidoOriginal;

      const node = document.getElementById("node_" + cbCheck);
      if (node) node.remove();
      delete window[cbCheck];

      if (res && res.status === "success" && res.existe) {
        // La cuenta sigue en el Excel: Forzamos a terminar de guardarla
        alert(
          "⚠️ Se ha detectado una cuenta de Netflix previamente generada que NO fue guardada en el inventario maestro.\n\nEl sistema la recuperará obligatoriamente para que finalices el proceso.",
        );
        restaurarInterfazCuentaGenerada(d, btn);
      } else {
        // 🧹 MAGIA AQUÍ: La cuenta ya no existe en Sheets (la borraste). Limpiamos la caché y creamos una nueva libremente.
        localStorage.removeItem("cyber_netflix_pendiente");
        ejecutarGeneracionNuevaCuenta(btn, contenidoOriginal);
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbCheck;
    script.src = `${GOOGLE_SCRIPT_URL}?action=verificarCuentaPines&correo=${encodeURIComponent(d.correo)}&callback=${cbCheck}&_ts=${Date.now()}`;
    document.body.appendChild(script);
    return;
  }

  // Si no hay nada en memoria, va directo a crear la nueva
  ejecutarGeneracionNuevaCuenta(btn, contenidoOriginal);
}

// Sub-función que aísla la carga de la cuenta (Mantiene el código limpio)
function ejecutarGeneracionNuevaCuenta(btn, contenidoOriginal) {
  let preConfirmacion = confirm(
    "❓ ¿Estás seguro de que deseas CREAR UNA CUENTA NUEVA de Netflix en este momento?\n\n(Esto procesará un PIN de Refácil e iniciará la creación del correo)",
  );

  if (!preConfirmacion) return;

  btn.style.pointerEvents = "none";
  btn.innerHTML = `<div style="text-align:center; width:100%; padding: 14px;"><svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ios-blue)" stroke-width="2.5" style="margin-right:8px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> <span style="color:var(--ios-blue); font-weight:bold;">Generando credenciales...</span></div>`;

  // 🔒 RESET DE RADAR E INVENTARIO
  document
    .getElementById("radarVerificacionContenedor")
    .style.setProperty("display", "flex", "important");
  document
    .getElementById("radarVerificacionSpinner")
    .style.setProperty("display", "flex", "important");
  document.getElementById("radarVerificacionSpinner").innerHTML =
    `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Sincronizando con Gmail... Esperando correo de Netflix`;
  document
    .getElementById("btnLinkVerificarGmail")
    .style.setProperty("display", "none", "important");
  document
    .getElementById("btnGuardarMaestroNetflix")
    .style.setProperty("display", "none", "important");

  if (window.verificationLinkInterval)
    clearInterval(window.verificationLinkInterval);

  const cbName = "cb_gen_cta_" + Date.now();
  window[cbName] = function (res) {
    btn.style.pointerEvents = "auto";
    btn.innerHTML = contenidoOriginal;

    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success" && res.data) {
      const d = res.data;

      if (d.pinRecarga && d.pinRecarga.includes("Sin PIN")) {
        alert(
          "❌ ERROR: No hay PINES de activación disponibles en la base de datos.",
        );
        return;
      }

      // 🔥 GUARDAR EN MEMORIA LOCAL PARA QUE NUNCA SE PIERDA
      localStorage.setItem("cyber_netflix_pendiente", JSON.stringify(d));

      restaurarInterfazCuentaGenerada(d, btn);
    } else {
      alert(
        "❌ Error del Servidor: " + (res ? res.message : "Fallo desconocido."),
      );
    }
  };

  const empleadoActivo =
    sessionStorage.getItem("active_staff") || "Admin/Camilo";

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=generarNuevaCuenta&user=${encodeURIComponent(empleadoActivo)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

// 🔥 FUNCIÓN MÁSTER: Pinta la pantalla tanto al crear como al restaurar
function restaurarInterfazCuentaGenerada(d, btnOrigen) {
  document.getElementById("displayCtaCorreo").innerText = d.correo;
  document.getElementById("displayCtaClave").innerText = d.clave;
  document.getElementById("displayCtaPinRecarga").innerText = d.pinRecarga;

  // 📡 EL RADAR INICIA AUTOMÁTICAMENTE
  window.lanzarRadarEspiaVerificacionGmail(d.correo);

  const btnGuardar = document.getElementById("btnGuardarMaestroNetflix");
  btnGuardar.onclick = function () {
    guardarCuentaConfirmadaNetflix(
      btnGuardar,
      "Guardar en Inventario Maestro",
      d,
    );
  };

  const modal =
    document.getElementById("cuentaGeneradaModalOverlay") ||
    document.getElementById("cuentaGeneratedModalOverlay");
  if (modal) modal.classList.add("open");
}

window.lanzarRadarEspiaVerificacionGmail = function (correoTarget) {
  window.verificationLinkInterval = setInterval(function () {
    const cbRadarName = "cb_radar_verify_" + Date.now();

    window[cbRadarName] = function (res) {
      const node = document.getElementById("node_" + cbRadarName);
      if (node) node.remove();
      delete window[cbRadarName];

      if (res && res.status === "success" && res.link) {
        if (
          res.correoOriginal &&
          res.correoOriginal.toLowerCase() !== correoTarget.toLowerCase()
        ) {
          console.log(
            "Se detectó un link, pero es de otro correo. Ignorando...",
          );
          return;
        }

        clearInterval(window.verificationLinkInterval);

        if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");

        document
          .getElementById("radarVerificacionSpinner")
          .style.setProperty("display", "none", "important");

        const btnLink = document.getElementById("btnLinkVerificarGmail");
        btnLink.href = res.link;
        btnLink.style.setProperty("display", "inline-flex", "important");

        // 🎯 CANDADO MAESTRO INVERTIDO: Muestra el botón de Guardar
        btnLink.onclick = function () {
          if (typeof haptic === "function") haptic();
          document
            .getElementById("btnGuardarMaestroNetflix")
            .style.setProperty("display", "block", "important");
        };

        const contenedor = document.getElementById(
          "radarVerificacionContenedor",
        );
        contenedor.style.background = "rgba(48, 209, 88, 0.06)";
        contenedor.style.borderColor = "rgba(48, 209, 88, 0.35)";
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbRadarName;
    script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerLinkVerificacion&correo=${encodeURIComponent(correoTarget)}&callback=${cbRadarName}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  }, 4000);
};

function guardarCuentaConfirmadaNetflix(btn, contenidoOriginal, datosCuenta) {
  btn.disabled = true;
  btn.style.pointerEvents = "none";
  btn.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Guardando en Sheets...`;

  const cbName = "cb_save_cta_" + Date.now();
  window[cbName] = function (res) {
    btn.disabled = false;
    btn.style.pointerEvents = "auto";
    btn.innerHTML = "¡Guardado con Éxito!";
    btn.style.background = "var(--ios-green)";

    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      // 🔥 LIBERACIÓN DE MEMORIA: Al guardar con éxito borramos el bloqueo
      localStorage.removeItem("cyber_netflix_pendiente");

      // Cerramos la ventana forzosamente ahora que ya cumplió su deber
      window.cerrarModalCreacionNetflixTotalmente();

      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path></svg> <span>Cuenta inyectada al maestro.</span></div>`,
        );
      }
    } else {
      alert(
        "❌ Error al guardar en Sheets: " +
          (res
            ? res.message
            : "Fallo de comunicación. Intenta darle al botón Guardar de nuevo."),
      );
      btn.innerHTML = contenidoOriginal;
      btn.style.background = "";
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

window.cerrarModalCreacionNetflixTotalmente = function () {
  if (typeof haptic === "function") haptic();
  if (window.verificationLinkInterval)
    clearInterval(window.verificationLinkInterval);

  const modal =
    document.getElementById("cuentaGeneradaModalOverlay") ||
    document.getElementById("cuentaGeneratedModalOverlay");
  if (modal) modal.classList.remove("open");
};

window.lanzarRadarEspiaVerificacionGmail = function (correoTarget) {
  window.verificationLinkInterval = setInterval(function () {
    const cbRadarName = "cb_radar_verify_" + Date.now();

    window[cbRadarName] = function (res) {
      const node = document.getElementById("node_" + cbRadarName);
      if (node) node.remove();
      delete window[cbRadarName];

      if (res && res.status === "success" && res.link) {
        // 👇 BLINDAJE EXTRA: Validar si la respuesta de Google Sheets nos devolvió
        // explícitamente el correo al que pertenece el link (si tu backend lo envía).
        // Si tu backend no envía "res.correoOriginal", igual lo dejará pasar, pero si lo envía, será estricto.
        if (
          res.correoOriginal &&
          res.correoOriginal.toLowerCase() !== correoTarget.toLowerCase()
        ) {
          console.log(
            "Se detectó un link, pero es de otro correo. Ignorando...",
          );
          return; // Ignora este link y sigue buscando en el próximo ciclo
        }

        clearInterval(window.verificationLinkInterval); // Apaga el bucle de búsqueda

        if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");

        document
          .getElementById("radarVerificacionSpinner")
          .style.setProperty("display", "none", "important");

        const btnLink = document.getElementById("btnLinkVerificarGmail");
        btnLink.href = res.link;
        btnLink.style.setProperty("display", "inline-flex", "important");

        // 🎯 CANDADO MAESTRO INVERTIDO
        btnLink.onclick = function () {
          if (typeof haptic === "function") haptic();
          document
            .getElementById("btnGuardarMaestroNetflix")
            .style.setProperty("display", "block", "important");
        };

        const contenedor = document.getElementById(
          "radarVerificacionContenedor",
        );
        contenedor.style.background = "rgba(48, 209, 88, 0.06)";
        contenedor.style.borderColor = "rgba(48, 209, 88, 0.35)";
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbRadarName;
    // Mandamos el correo al backend para que busque ese en específico
    script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerLinkVerificacion&correo=${encodeURIComponent(correoTarget)}&callback=${cbRadarName}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  }, 4000); // Rastreando la bandeja cada 4 segundos
};

window.cerrarModalCreacionNetflixTotalmente = function () {
  if (typeof haptic === "function") haptic();
  if (window.verificationLinkInterval)
    clearInterval(window.verificationLinkInterval);

  const modal =
    document.getElementById("cuentaGeneratedModalOverlay") ||
    document.getElementById("cuentaGeneradaModalOverlay");
  if (modal) modal.classList.remove("open");
};

window.cerrarModalCreacionNetflixTotalmente = function () {
  if (typeof haptic === "function") haptic();
  if (window.verificationLinkInterval)
    clearInterval(window.verificationLinkInterval);

  const modal =
    document.getElementById("cuentaGeneratedModalOverlay") ||
    document.getElementById("cuentaGeneradaModalOverlay");
  if (modal) modal.classList.remove("open");
};

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

    // 🔥 NUEVA LÓGICA: Si lo que se copió fue el correo, abre la limpieza de cookies
    if (idElemento === "displayCtaCorreo") {
      window.open("https://netflix.com/clearcookies", "_blank");
    }
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
  // Limpiamos signos de dólar, espacios y puntos de miles. Si hay coma de centavos, tomamos solo la parte entera.
  let strLimpio = String(valorStr)
    .replace(/\$|\s/g, "")
    .split(",")[0]
    .replace(/\./g, "");
  let valorNum = parseInt(strLimpio, 10);

  if (isNaN(valorNum)) return "$0";

  // Regla de autocompletado (si alguien escribió "50" por accidente, se vuelve "50000")
  if (Math.abs(valorNum) > 0 && Math.abs(valorNum) < 1000) {
    valorNum = valorNum * 1000;
  }

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

      // 🔥 FIX: Nuevo motor de ordenamiento que no se confunde con los millones
      data.sort(function (a, b) {
        let strA = String(a.saldo)
          .replace(/\$|\s/g, "")
          .split(",")[0]
          .replace(/\./g, "");
        let strB = String(b.saldo)
          .replace(/\$|\s/g, "")
          .split(",")[0]
          .replace(/\./g, "");

        let saldoA = parseInt(strA, 10) || 0;
        let saldoB = parseInt(strB, 10) || 0;

        if (Math.abs(saldoA) > 0 && Math.abs(saldoA) < 1000) saldoA *= 1000;
        if (Math.abs(saldoB) > 0 && Math.abs(saldoB) < 1000) saldoB *= 1000;

        return saldoB - saldoA;
      });

      let html = "";
      for (let i = 0; i < data.length; i++) {
        let d = data[i];

        // 🔥 FIX: Evaluación de color y lógica con el número limpio
        let strLimpioItem = String(d.saldo)
          .replace(/\$|\s/g, "")
          .split(",")[0]
          .replace(/\./g, "");
        let saldoLimpio = parseInt(strLimpioItem, 10) || 0;

        if (Math.abs(saldoLimpio) > 0 && Math.abs(saldoLimpio) < 1000) {
          saldoLimpio *= 1000;
        }

        let colorSaldo =
          saldoLimpio >= 5000 ? "var(--ios-green)" : "var(--ios-red)";
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

// =========================================================================
// 📈 RENDERIZADOR CONTABLE BENTO ACTUALIZADO CON AISLAMIENTO PERSONAL
// =========================================================================
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

  // ─────────────── ESCÁNER MÁSTER DE CATEGORÍAS ───────────────
  let sumaIngresoExtra = 0,
    sumaJeisson = 0,
    sumaAngelica = 0,
    sumaPersonalIngreso = 0, // Separador de flujos personales
    sumaPersonalEgreso = 0;

  const itemsTemp = globalFinanzasData.listaDetallada || [];

  itemsTemp.forEach((item) => {
    const cat = (item.categoria || "").toLowerCase();
    const det = (item.detalle || "").toLowerCase();
    let val = parseFloat(item.monto) || 0;

    if (item.tipo === "INGRESO") {
      if (cat.includes("angelica") || det.includes("angelica")) {
        sumaAngelica += val;
      } else if (cat === "personal" || det.includes("personal")) {
        sumaPersonalIngreso += val; // Aísla el ingreso personal
      } else if (
        cat.includes("ingreso extra") ||
        det.includes("jeisson") ||
        cat.includes("jeisson")
      ) {
        sumaIngresoExtra += val;
        if (det.includes("jeisson") || cat.includes("jeisson")) {
          sumaJeisson += val;
        }
      }
    } else {
      // Es un egreso, inversión, gasto o salida de caja
      if (cat === "personal" || det.includes("personal")) {
        sumaPersonalEgreso += val; // Aísla el gasto personal
      }
    }
  });

  // Pintar el balance neto de tu flujo personal en la nueva tarjeta Bento
  const personalDisplay = document.getElementById("valProyPersonal");
  if (personalDisplay) {
    personalDisplay.innerText = formatMoneda(
      sumaPersonalIngreso - sumaPersonalEgreso,
    );
  }

  document.getElementById("valProyJeisson").innerText =
    formatMoneda(sumaJeisson);

  // 🔥 SOLUCIÓN CRÍTICA: Restamos el ingreso personal para obtener las Ventas Reales del Negocio
  let ventasBrutasReales = Math.max(
    0,
    (d.ingresos || 0) - sumaIngresoExtra - sumaAngelica - sumaPersonalIngreso,
  );

  // 🔥 SOLUCIÓN CRÍTICA: Restamos los egresos personales para limpiar los Gastos del Negocio
  let gastosNegocioLimpios = Math.max(0, (d.gastos || 0) - sumaPersonalEgreso);

  document.getElementById("val_ingresos").innerText =
    formatMoneda(ventasBrutasReales);
  document.getElementById("val_gastos").innerText =
    formatMoneda(gastosNegocioLimpios);
  document.getElementById("val_inversiones").innerText = formatMoneda(
    d.inversiones,
  );
  document.getElementById("val_nomina").innerText = formatMoneda(d.nomina);

  // ─────────────── CONFIGURACIÓN DE PORCENTAJES DINÁMICOS ───────────────
  let pM = 28,
    pNom = 17,
    pNeg = 55;
  const m = document.getElementById("appleMonthSelect").value;
  const dia = document.getElementById("appleDaySelect").value;

  if (m === "MAYO") {
    if (dia !== "TODOS" && parseInt(dia) <= 15) {
      pM = 30;
      pNom = 15;
      pNeg = 55;
    } else if (dia === "TODOS") {
      pM = 29;
      pNom = 16;
      pNeg = 55;
    }
  } else if (
    [
      "JULIO",
      "AGOSTO",
      "SEPTIEMBRE",
      "OCTUBRE",
      "NOVIEMBRE",
      "DICIEMBRE",
    ].includes(m)
  ) {
    pM = 30;
    pNeg = 54;
    pNom = 16;
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

  // 🔥 RECALIBRACIÓN GRÁFICA: Las barras de carga ahora ignoran los flujos personales
  const totalFlujo =
    ventasBrutasReales + gastosNegocioLimpios + d.inversiones + d.nomina;
  let pctIn =
    totalFlujo > 0 ? Math.round((ventasBrutasReales / totalFlujo) * 100) : 0;
  let pctOut =
    totalFlujo > 0
      ? Math.round(
          ((gastosNegocioLimpios + d.inversiones + d.nomina) / totalFlujo) *
            100,
        )
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

  const container = document.getElementById("listaDesgloseGastos");
  if (itemsTemp.length === 0) {
    container.innerHTML =
      '<div class="empty-log-msg" style="padding: 20px;">No hay movimientos registrados en este periodo.</div>';
    return;
  }

  let categoriasAgrupadas = {};
  let totalGastadoEnPeriodo = 0;
  let totalIngresadoEnPeriodo = 0;

  itemsTemp.forEach((item) => {
    let cat = item.categoria || "OTROS";
    if (!categoriasAgrupadas[cat]) {
      categoriasAgrupadas[cat] = { gastosPuros: 0, ingresosPuros: 0 };
    }
    let montoNum = parseFloat(item.monto) || 0;
    if (item.tipo === "INGRESO") {
      categoriasAgrupadas[cat].ingresosPuros += montoNum;
      totalIngresadoEnPeriodo += montoNum;
    } else {
      categoriasAgrupadas[cat].gastosPuros += montoNum;
      totalGastadoEnPeriodo += montoNum;
    }
  });

  let htmlBuffer = "";

  // Bloque 1: Resumen de Gastos por Categoría
  if (totalGastadoEnPeriodo > 0) {
    htmlBuffer += `
        <div style="margin-bottom: 20px;">
          <h4 style="margin: 0 0 12px 0; color: var(--ios-red); font-size: 0.88rem; font-weight: 800; display: flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.3px;">
            🔴 Resumen de Egresos por Categoría
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
      `;
    let catArrayGastos = Object.keys(categoriasAgrupadas).filter(
      (c) => (sorted = categoriasAgrupadas[c].gastosPuros > 0),
    );
    catArrayGastos.sort(
      (a, b) =>
        categoriasAgrupadas[b].gastosPuros - categoriasAgrupadas[a].gastosPuros,
    );
    catArrayGastos.forEach((cat) => {
      htmlBuffer += `
          <div style="background: rgba(255, 69, 58, 0.04); border: 1px solid rgba(255, 69, 58, 0.15); padding: 10px; border-radius: 12px;">
            <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${cat}">${cat}</span>
            <span style="color: var(--ios-red); font-weight: 800; font-size: 1.05rem; font-family: monospace;">${formatMoneda(categoriasAgrupadas[cat].gastosPuros)}</span>
          </div>`;
    });
    htmlBuffer += `</div></div>`;
  }

  // Bloque 2: Resumen de Ingresos por Categoría
  if (totalIngresadoEnPeriodo > 0) {
    htmlBuffer += `
        <div style="margin-bottom: 20px;">
          <h4 style="margin: 0 0 12px 0; color: var(--ios-green); font-size: 0.88rem; font-weight: 800; display: flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.3px;">
            🟢 Resumen de Ingresos Extra
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px;">
      `;
    let catArrayIngresos = Object.keys(categoriasAgrupadas).filter(
      (c) => categoriasAgrupadas[c].ingresosPuros > 0,
    );
    catArrayIngresos.sort(
      (a, b) =>
        categoriasAgrupadas[b].ingresosPuros -
        categoriasAgrupadas[a].ingresosPuros,
    );
    catArrayIngresos.forEach((cat) => {
      htmlBuffer += `
          <div style="background: rgba(48, 209, 88, 0.04); border: 1px solid rgba(48, 209, 88, 0.15); padding: 10px; border-radius: 12px;">
            <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${cat}">${cat}</span>
            <span style="color: var(--ios-green); font-weight: 800; font-size: 1.05rem; font-family: monospace;">${formatMoneda(categoriasAgrupadas[cat].ingresosPuros)}</span>
          </div>`;
    });
    htmlBuffer += `</div></div>`;
  }

  // 📋 HISTORIAL CRONOLÓGICO DE SALIDAS DETALLADAS (LIBRO)
  htmlBuffer += `
      <div style="margin-top: 10px; width: 100%;">
        <h4 style="margin: 0 0 12px 0; color: var(--text-primary); font-size: 0.88rem; font-weight: 800; display: flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.3px;">
          📋 Historial Detallado de Salidas (Libro)
        </h4>
        <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
    `;

  for (let i = itemsTemp.length - 1; i >= 0; i--) {
    let item = itemsTemp[i];

    if (item.tipo !== "INGRESO") {
      let montoMovimiento = parseFloat(item.monto) || 0;
      htmlBuffer += `
          <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); padding: 10px 14px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 10px;">
            <div style="display: flex; flex-direction: column; gap: 2px; overflow: hidden; padding-right: 5px;">
              <span style="font-size: 0.88rem; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.detalle || "Sin nota"}">${item.detalle || "Sin nota"}</span>
              <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600;">${item.fecha || ""} | ${item.categoria || "Otros"}</span>
            </div>
            <strong style="color: var(--ios-red); font-size: 0.95rem; font-family: monospace; flex-shrink: 0;">-${formatMoneda(montoMovimiento)}</strong>
          </div>`;
    }
  }

  htmlBuffer += `</div></div>`;

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
  let filtrados = window.currentGridStock.filter(
    (item) =>
      item.titulo && item.titulo.toLowerCase().includes(filtro.toLowerCase()),
  );

  if (filtrados.length === 0) {
    gridContainer.innerHTML =
      '<div class="empty-log-msg">No se encontraron plantillas con ese nombre.</div>';
    return;
  }

  filtrados.forEach((currentItem) => {
    const card = document.createElement("div");
    card.className = "card-ios";

    // 🔥 Validación por si algún texto de Google Sheets viene vacío o nulo
    let textoSeguro = currentItem.texto
      ? String(currentItem.texto).replace(/"/g, "&quot;").replace(/'/g, "&#39;")
      : "";
    let tituloSeguro = currentItem.titulo || "Sin título";

    card.innerHTML = `
        <h2 class="card-title" style="justify-content:center;">${tituloSeguro}</h2>
        <button class="btn-ios btn-secondary copy-text-btn mt-1 w-100" data-clipboard-text="${textoSeguro}">COPIAR TEXTO</button>
      `;
    gridContainer.appendChild(card);
  });
}
let ultimoAvisoStock = 0;

function verificarStockCritico(data) {
  if (!sessionStorage.getItem("active_staff")) return;

  let ahora = Date.now();
  if (ahora - ultimoAvisoStock < 600000) return;

  const umbrales = {
    NETFLIX: { limite: 2, accion: "Cortar o crear" },
    AMAZON: { limite: 5, accion: "Comprar" },
    HBOMAX: { limite: 5, accion: "Comprar" },
    DISNEYPREMIUM: { limite: 1, accion: "Crear" },
    DISNEYESTANDAR: { limite: 1, accion: "Comprar" },
    CRUNCHYROLL: { limite: 1, accion: "Comprar" },
    PLEX: { limite: 1, accion: "Comprar" },
    APPLETV: { limite: 1, accion: "Comprar" },
  };

  let itemsCriticos = [];

  data.forEach((item) => {
    let config = umbrales[item.plat];
    if (config && item.libres <= config.limite) {
      itemsCriticos.push({
        plat: item.plat,
        cant: item.libres,
        accion: config.accion,
      });
    }
  });

  if (itemsCriticos.length > 0) {
    ultimoAvisoStock = ahora;
    mostrarAlertaInventarioToast(itemsCriticos);
  }
}

function mostrarAlertaInventarioToast(listaPlataformas) {
  const toastCenter = document.getElementById("cyber-toast-center");
  if (!toastCenter) return;

  const toastId = `toast_stock_${Date.now()}`;
  const toastDiv = document.createElement("div");
  toastDiv.id = toastId;
  toastDiv.className = "cyber-notification";

  let listadoHtml = "";
  listaPlataformas.forEach((item) => {
    listadoHtml += `
        <li style="margin-bottom: 5px; list-style: none; display: flex; justify-content: space-between; gap: 10px;">
          <span>• <b>${item.plat}</b> (Quedan ${item.cant})</span>
          <span style="color: var(--ios-orange); font-weight: 700;">👉 ${item.accion}</span>
        </li>`;
  });

  toastDiv.innerHTML = `
      <div class="cyber-notif-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ios-orange)" stroke-width="2.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span style="font-weight: 800; font-size: 0.88rem; color: #ffffff;">Inventario Crítico</span>
        <button class="cyber-notif-close" onclick="closeNotificationById('${toastId}')">&times;</button>
      </div>
      <div class="cyber-notif-body">
        <div style="font-size: 0.78rem; margin-bottom: 8px; color: #e1e1e6;">Acción sugerida para evitar escasez:</div>
        <ul style="padding: 0; margin: 0;">${listadoHtml}</ul>
      </div>
    `;

  toastCenter.appendChild(toastDiv);

  setTimeout(() => {
    toastDiv.classList.add("show");
    if (typeof haptic === "function") haptic();
  }, 20);
}

window.closeNotificationById = function (id) {
  const toast = document.getElementById(id);
  if (toast) {
    toast.classList.remove("show");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 400);
  }
};

function mostrarNotificacionStock(contenido) {
  let toastViejo = document.getElementById("stockAlertToast");

  // Si existe un aviso viejo, lo destruimos
  if (toastViejo) {
    toastViejo.remove();
  }

  // Creamos el aviso. NOTA: Le quitamos el "pointer-events: none" para poder darle clic a la X
  let toast = document.createElement("div");
  toast.id = "stockAlertToast";
  toast.style.cssText =
    "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.8); opacity: 0; background: var(--sheet-modal-bg, rgba(30, 30, 30, 0.95)); border: 1px solid rgba(255, 159, 10, 0.3); color: var(--text-primary, white); padding: 32px 24px; border-radius: 32px; z-index: 99999; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7); backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px); transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1); font-size: 0.9rem; width: 90%; max-width: 400px; text-align: center;";

  toast.innerHTML = `
          <button onclick="cerrarNotificacionStock()" style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.1); border: none; color: var(--text-secondary, #aaa); width: 32px; height: 32px; border-radius: 50%; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">
              &times;
          </button>

          <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; padding-top: 10px;">
              <div style="background: rgba(255, 159, 10, 0.15); color: var(--ios-orange, #ff9f0a); padding: 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; border: 1px solid rgba(255, 159, 10, 0.2);">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
              </div>
              <h3 style="margin: 0; font-size: 1.35rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.3px;">Inventario Crítico</h3>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 4px 0 0 0;">Acción sugerida para evitar escasez:</p>
          </div>

          <div style="line-height: 1.6; text-align: left; background: rgba(0,0,0,0.2); padding: 16px 20px; border-radius: 20px; border: 1px dashed rgba(255,255,255,0.1);">
              ${contenido}
          </div>

          <button onclick="cerrarNotificacionStock()" class="btn-ios btn-secondary w-100" style="margin-top: 20px; padding: 14px; border-radius: 50px; font-weight: 700; width: 100%;">
              Entendido
          </button>
      `;

  document.body.appendChild(toast);

  // Animación de entrada (Pop-In)
  setTimeout(() => {
    toast.style.transform = "translate(-50%, -50%) scale(1)";
    toast.style.opacity = "1";
  }, 50);

  // ⛔ Se eliminó el setTimeout que la cerraba automáticamente
}

// Función encargada de cerrar la alerta con la animación inversa
window.cerrarNotificacionStock = function () {
  let toast = document.getElementById("stockAlertToast");
  if (toast) {
    // Animación de salida
    toast.style.transform = "translate(-50%, -50%) scale(0.8)";
    toast.style.opacity = "0";

    // Destruir el HTML después de que termine la animación
    setTimeout(() => {
      toast.remove();
    }, 400);
  }
};
// =========================================================================
// ⌨️ CONTROL MAESTRO DE NAVEGACIÓN Y ATAJOS (ANTI-AMONTONAMIENTO RECALIBRADO)
// =========================================================================

// 1. Evitar que se amontonen las ventanas principales (Solo aplica a lanzadores oficiales)
document.addEventListener(
  "click",
  function (e) {
    // 🔒 BLINDAJE ESTRICTO: Solo se activa si el clic viene del Dock o de la Barra Superior
    let launcher = e.target.closest(".mac-dock-icon, .mac-menu-item");

    if (launcher) {
      let onclickCode = launcher.getAttribute("onclick") || "";

      // 🎯 SINCRO PERFECTA: Mapeo maestro de botones y sus contenedores reales (Overlays)
      let mapaPaneles = {
        toggleFinanzasPanel: "finanzasOverlay",
        toggleNetflixManagerPanel: "netflixManagerOverlay",
        toggleCodesPanel: "codesOverlay",
        toggleVentasPanel: "ventasOverlay",
        toggleCambioPanel: "cambioCuentaOverlay",
        toggleCargarPanel: "cargarOverlay",
        toggleShiftsPanel: "shiftsOverlay",
        toggleSearchAccountPanel: "searchAccountOverlay",
        toggleDistrisPanel: "distrisOverlay",
        toggleGarantiasPanel: "garantiasOverlay",
        togglePromoPanel: "promoOverlay",
        toggleRecordatoriosPanel: "recordatoriosOverlay",
        abrirCalculadoraCombos: "comboCalcOverlay",
        abrirTotalNomina: "nominaOverlay",
        toggleAnaCodesPanel: "anaCodesOverlay", // 🟣 Conectado
        toggleYopmailPanel: "yopmailOverlay", // 🟡 Conectado
        toggleChayoPanel: "chayoOverlay",
        toggleGmailPanel: "gmailOverlay", // 🔴 Conectado
      };

      let panelAIgnorar = null;
      for (let funcion in mapaPaneles) {
        if (onclickCode.includes(funcion)) {
          panelAIgnorar = mapaPaneles[funcion];
          break;
        }
      }

      // 🛡️ CONDICIONAL DE SEGURIDAD: Cierra cualquier otra app abierta al cambiar de módulo
      if (panelAIgnorar) {
        document.querySelectorAll(".overlay-ios").forEach((panel) => {
          if (
            panel.id !== "loginOverlay" &&
            panel.id !== "passwordOverlay" &&
            panel.id !== panelAIgnorar
          ) {
            panel.classList.remove("open");
            if (
              panel.style.display === "flex" ||
              panel.style.display === "block"
            ) {
              panel.style.setProperty("display", "none", "important");
            }
          }
        });
      }
    }
  },
  true,
);

// 2. Atajos de Teclado con protección anti-amontonamiento
document.addEventListener("keydown", function (e) {
  const limpiarPantalla = () => {
    document.querySelectorAll(".overlay-ios").forEach((panel) => {
      if (panel.id !== "loginOverlay" && panel.id !== "passwordOverlay") {
        panel.classList.remove("open");
        if (panel.style.display === "flex" || panel.style.display === "block") {
          panel.style.setProperty("display", "none", "important");
        }
      }
    });
  };

  // 🛑 Tecla ESC: Limpieza total
  if (e.key === "Escape") {
    // 🛡️ RESTRICCIÓN MÁSTER: Si la ventana de creación de Netflix está abierta, bloqueamos el escape
    const modalCritico = document.getElementById("cuentaGeneradaModalOverlay");
    if (modalCritico && modalCritico.classList.contains("open")) {
      e.preventDefault();
      return; // Aborta por completo el cierre de la pantalla
    }

    if (typeof haptic === "function") haptic();
    limpiarPantalla();
  }

  // 🛒 Alt + V: Abrir Ventas
  if (e.altKey && (e.key === "v" || e.key === "V")) {
    e.preventDefault();
    limpiarPantalla();
    if (typeof toggleVentasPanel === "function") toggleVentasPanel();
  }

  // 🔑 Alt + C: Abrir Códigos
  if (e.altKey && (e.key === "c" || e.key === "C")) {
    e.preventDefault();
    limpiarPantalla();
    if (typeof toggleCodesPanel === "function") toggleCodesPanel();
  }

  // 🔍 Alt + B: Bóveda de Cuentas
  if (e.altKey && (e.key === "b" || e.key === "B")) {
    e.preventDefault();
    limpiarPantalla();
    if (typeof toggleSearchAccountPanel === "function")
      toggleSearchAccountPanel();
  }
});

// =========================================================================
// 🧮 CEREBRO DEL COTIZADOR AUTOMÁTICO DE COMBOS CYBERNET (ALGORITMO MAX-BASE)
// =========================================================================

function abrirCalculadoraCombos() {
  if (typeof haptic === "function") haptic();

  const container = document.getElementById("contenedorPlataformasCotizador");

  // 🔥 1. INYECTAR IPTV SI NO EXISTE EN EL HTML ORIGINAL
  if (container && !document.querySelector('.chk-cotizar-plat[value="IPTV"]')) {
    const iptvRow = document.createElement("div");
    iptvRow.className = "row-cotizar-plat";
    iptvRow.setAttribute("data-nombre", "iptv smarters");
    iptvRow.style.cssText =
      "border-bottom: 0.5px solid rgba(255, 255, 255, 0.06);";
    iptvRow.innerHTML = `
      <label style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; cursor: pointer; width: 100%;">
          <span style="font-size: 0.9rem; font-weight: 600; color: #30d158">IPTV Smarters ($7k)</span>
          <input type="checkbox" class="chk-cotizar-plat" value="IPTV" data-tipo="herramienta" onchange="controlarDisneyMutuo(this); calcularPreciosSistemaCotizador();" style="accent-color: var(--ios-blue); width: 18px; height: 18px;" />
      </label>
    `;
    container.appendChild(iptvRow);
  }

  // 🔥 2. INYECTAR DIRECTV GO SI NO EXISTE EN EL HTML ORIGINAL
  if (
    container &&
    !document.querySelector('.chk-cotizar-plat[value="DIRECTV-GO"]')
  ) {
    const dgoRow = document.createElement("div");
    dgoRow.className = "row-cotizar-plat";
    dgoRow.setAttribute("data-nombre", "directv go dgo");
    dgoRow.style.cssText =
      "border-bottom: 0.5px solid rgba(255, 255, 255, 0.06);";
    dgoRow.innerHTML = `
      <label style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; cursor: pointer; width: 100%;">
          <span style="font-size: 0.9rem; font-weight: 600; color: #00bfff">Directv Go ($30k)</span>
          <input type="checkbox" class="chk-cotizar-plat" value="DIRECTV-GO" data-tipo="herramienta" onchange="controlarDisneyMutuo(this); calcularPreciosSistemaCotizador();" style="accent-color: var(--ios-blue); width: 18px; height: 18px;" />
      </label>
    `;
    container.appendChild(dgoRow);
  }

  // 🔥 3. ACTUALIZAR ETIQUETAS VISUALES AL NUEVO PRECIO INDIVIDUAL AL ABRIR
  document.querySelectorAll(".row-cotizar-plat label span").forEach((span) => {
    if (span.innerText.includes("Spotify")) span.innerText = "Spotify ($14k)";
    if (span.innerText.includes("Deezer")) span.innerText = "Deezer ($12k)";
    if (span.innerText.includes("Metegol")) span.innerText = "Metegol ($15k)";
    if (span.innerText.includes("YouTube"))
      span.innerText = "YouTube Premium ($14k)";
  });

  // 🔥 4. INYECTAR SELECTOR DE HASTA 5 PANTALLAS EN TODAS LAS PLATAFORMAS (AUTOMÁTICO)
  document.querySelectorAll(".row-cotizar-plat").forEach((row) => {
    if (!row.querySelector(".cotizador-pantallas-wrapper")) {
      let wrapper = document.createElement("div");
      wrapper.className = "cotizador-pantallas-wrapper";
      wrapper.style.display = "none";
      wrapper.style.padding = "0 14px 12px 14px";
      wrapper.style.justifyContent = "flex-end";

      wrapper.innerHTML = `
          <select class="input-ios sel-pantallas-cotizador" style="width: auto; padding: 6px 12px; font-size: 0.8rem; margin:0; border-radius: 8px; background: rgba(0,0,0,0.3); color: var(--text-primary); border: 1px solid rgba(255,255,255,0.1);" onchange="calcularPreciosSistemaCotizador()">
              <option value="1">1 Pantalla</option>
              <option value="2">2 Pantallas</option>
              <option value="3">3 Pantallas</option>
              <option value="4">4 Pantallas</option>
              <option value="5">5 Pantallas (Cuenta Completa)</option>
          </select>
      `;
      row.appendChild(wrapper);
    }
  });

  // Desmarcar todos los checks y ocultar selects
  document.querySelectorAll(".chk-cotizar-plat").forEach((cb) => {
    cb.checked = false;
    controlarDisneyMutuo(cb);
  });

  document.getElementById("buscarPlataformaCotizador").value = "";
  document.getElementById("calcMonths").value = "1";
  document.getElementById("calcFidelidad").checked = false;

  document.getElementById("calcBasePriceDisplay").value = "$0";
  document.getElementById("calcSubtotal").innerText = "$0";
  document.getElementById("calcDiscount").innerText = "-$0";
  document.getElementById("rowCalcDescFiel").style.display = "none";
  document.getElementById("calcTotal").innerText = "$0";

  filtrarPlataformasCotizador();
  document.getElementById("comboCalcOverlay").classList.add("open");

  setTimeout(() => {
    document.getElementById("buscarPlataformaCotizador").focus();
  }, 120);
}

function cerrarCalculadoraCombos() {
  if (typeof haptic === "function") haptic();
  document.getElementById("comboCalcOverlay").classList.remove("open");
}

window.controlarDisneyMutuo = function (checkbox) {
  const tipo = checkbox.getAttribute("data-tipo");

  if (checkbox.checked) {
    if (tipo === "disneypre") {
      const de = document.querySelector(
        '.chk-cotizar-plat[data-tipo="disneyest"]',
      );
      if (de && de.checked) {
        de.checked = false;
        controlarDisneyMutuo(de);
      }
    } else if (tipo === "disneyest") {
      const dp = document.querySelector(
        '.chk-cotizar-plat[data-tipo="disneypre"]',
      );
      if (dp && dp.checked) {
        dp.checked = false;
        controlarDisneyMutuo(dp);
      }
    }

    const buscador = document.getElementById("buscarPlataformaCotizador");
    if (buscador && buscador.value !== "") {
      buscador.value = "";
      if (typeof filtrarPlataformasCotizador === "function") {
        filtrarPlataformasCotizador();
      }
    }
  }

  const row = checkbox.closest(".row-cotizar-plat");
  if (row) {
    let selectWrapper = row.querySelector(".cotizador-pantallas-wrapper");
    if (selectWrapper) {
      selectWrapper.style.display = checkbox.checked ? "flex" : "none";
      if (!checkbox.checked) {
        selectWrapper.querySelector("select").value = "1";
      }
    }
  }
};

window.filtrarPlataformasCotizador = function () {
  const query = document
    .getElementById("buscarPlataformaCotizador")
    .value.toLowerCase()
    .trim();
  const filas = document.querySelectorAll(
    "#contenedorPlataformasCotizador .row-cotizar-plat",
  );

  filas.forEach((fila) => {
    const nombrePlat = fila.getAttribute("data-nombre");
    const checkbox = fila.querySelector('input[type="checkbox"]');

    if (query === "") {
      fila.style.display = checkbox.checked ? "block" : "none";
    } else {
      if (nombrePlat.includes(query) || checkbox.checked) {
        fila.style.display = "block";
      } else {
        fila.style.display = "none";
      }
    }
  });
};

// =========================================================================
// 🧮 CEREBRO DEL COTIZADOR AUTOMÁTICO DE COMBOS CYBERNET (ALGORITMO MAX-BASE)
// =========================================================================

window.calcularPreciosSistemaCotizador = function () {
  // DICCIONARIO MAESTRO DE PRECIOS EXACTOS (INDIVIDUAL VS COMBO)
  const mapValores = {
    "DISNEY-PREMIUM": { indiv: 15000, combo: 10000, isTier: false },
    "Amazon Prime": { indiv: 10500, combo: 5000, isTier: true },
    "Disney Estándar": { indiv: 8500, combo: 4000, isTier: true },
    Max: { id: "MAX", indiv: 8500, combo: 3000, isTier: true },
    "Apple TV": { indiv: 8500, combo: 3000, isTier: true },
    Crunchyroll: { indiv: 8500, combo: 3000, isTier: true },
    Plex: { indiv: 8500, combo: 3000, isTier: true },
    "Universal+": { indiv: 8500, combo: 3000, isTier: true },
    Vix: { indiv: 8500, combo: 3000, isTier: true },
    // Herramientas Add-ons y Otras Cuentas
    "DIRECTV-GO": { indiv: 30000, combo: 25000, isTier: false }, // 🔥 CORREGIDO: $30k individual / $25k combo
    "Paramount+": { indiv: 15000, combo: 13000, isTier: false },
    Metegol: { indiv: 15000, combo: 12000, isTier: false },
    Spotify: { indiv: 14000, combo: 10000, isTier: false },
    "YouTube Premium": { indiv: 14000, combo: 14000, isTier: false },
    Deezer: { indiv: 12000, combo: 8000, isTier: false },
    "Canva Pro": { indiv: 20000, combo: 20000, isTier: false },
    IPTV: { indiv: 7000, combo: 7000, isTier: false },
  };

  let precioBaseUnMes = 0;
  let tieneNetflix = false;
  let costoNetflixCalculado = 0;

  let allOtherScreens = [];
  let countDisneyPremium = 0;
  let countTierEligible = 0;
  let arrayAddonsDirectosYExtras = [];

  // 1. Escaneo de las plataformas y recolección de pantallas marcadas
  document.querySelectorAll(".row-cotizar-plat").forEach((row) => {
    const cb = row.querySelector(".chk-cotizar-plat");
    if (cb && cb.checked) {
      const val = cb.value;
      const selectPantallas = row.querySelector(".sel-pantallas-cotizador");
      const pantallas = selectPantallas
        ? parseInt(selectPantallas.value) || 1
        : 1;

      if (val === "NETFLIX") {
        tieneNetflix = true;
        if (pantallas === 1) costoNetflixCalculado = 14500;
        else if (pantallas === 2) costoNetflixCalculado = 26000;
        else if (pantallas === 3) costoNetflixCalculado = 36000;
        else if (pantallas === 4) costoNetflixCalculado = 46000;
        else if (pantallas >= 5) costoNetflixCalculado = 55000;
      } else {
        if (mapValores[val]) {
          for (let i = 0; i < pantallas; i++) {
            allOtherScreens.push(val);
          }

          if (val === "DISNEY-PREMIUM") {
            countDisneyPremium += pantallas;
          } else if (mapValores[val].isTier) {
            countTierEligible++;
            for (let i = 1; i < pantallas; i++) {
              arrayAddonsDirectosYExtras.push(val);
            }
          } else {
            for (let i = 0; i < pantallas; i++) {
              arrayAddonsDirectosYExtras.push(val);
            }
          }
        }
      }
    }
  });

  // 2. Aplicación de la Facturación
  if (tieneNetflix) {
    precioBaseUnMes = costoNetflixCalculado;

    // Lógica de Tiers del Combo de Netflix
    if (countDisneyPremium > 0) {
      if (countTierEligible === 0)
        precioBaseUnMes += 10500; // Combo Dúo Premium -> Total: $25.000
      else if (countTierEligible === 1)
        precioBaseUnMes += 14500; // Combo Pro -> Total: $29.000
      else if (countTierEligible === 2)
        precioBaseUnMes += 17500; // Combo Cine Total -> Total: $32.000
      else if (countTierEligible >= 3)
        precioBaseUnMes += 20500 + (countTierEligible - 3) * 3000; // El Rey -> Total: $35.000

      precioBaseUnMes +=
        (countDisneyPremium - 1) * mapValores["DISNEY-PREMIUM"].combo;
    } else {
      if (countTierEligible === 0)
        precioBaseUnMes += 0; // Solo Netflix -> Total: $14.500
      else if (countTierEligible === 1)
        precioBaseUnMes += 5500; // Netflix + 1 -> Total: $20.000
      else if (countTierEligible === 2)
        precioBaseUnMes += 9500; // Netflix + 2 -> Total: $24.000
      else if (countTierEligible >= 3)
        precioBaseUnMes += 12500 + (countTierEligible - 3) * 3000; // Netflix + 3 -> Total: $27.000
    }

    // Sumamos las demás pantallas adicionales o Add-ons (Directv Go, Spotify, etc.) a precio combo
    arrayAddonsDirectosYExtras.forEach((plat) => {
      precioBaseUnMes += mapValores[plat].combo;
    });
  } else {
    // LÓGICA SIN NETFLIX: ALGORITMO MAX-BASE
    if (allOtherScreens.length === 0) {
      precioBaseUnMes = 0;
    } else if (allOtherScreens.length === 1) {
      precioBaseUnMes = mapValores[allOtherScreens[0]].indiv; // Única plataforma -> Precio Individual
    } else {
      allOtherScreens.sort((a, b) => mapValores[b].indiv - mapValores[a].indiv);

      let masCaro = allOtherScreens.shift(); // Extrae la más costosa
      precioBaseUnMes += mapValores[masCaro].indiv; // Se cobra a precio Individual Full

      allOtherScreens.forEach((plat) => {
        precioBaseUnMes += mapValores[plat].combo; // El resto se suma a precio Combo barato
      });
    }
  }

  // 3. Captura de Meses y Fidelidad
  const monthSelect = document.getElementById("calcMonths");
  const meses = parseFloat(monthSelect.value) || 1;
  const porcDesc =
    parseFloat(
      monthSelect.options[monthSelect.selectedIndex].getAttribute("data-desc"),
    ) || 0;

  const subtotal = precioBaseUnMes * meses;
  const montoDescuento = subtotal * (porcDesc / 100);

  const esClienteFiel = document.getElementById("calcFidelidad").checked;
  let descuentoFielTotal =
    esClienteFiel && precioBaseUnMes > 0 ? 1000 * meses : 0;

  if (descuentoFielTotal > 0) {
    document.getElementById("rowCalcDescFiel").style.display = "flex";
    document.getElementById("calcDiscountFiel").innerText =
      "-$" + descuentoFielTotal.toLocaleString("es-CO");
  } else {
    document.getElementById("rowCalcDescFiel").style.display = "none";
  }

  let totalA_Cobrar = subtotal - montoDescuento - descuentoFielTotal;
  if (totalA_Cobrar < 0) totalA_Cobrar = 0;

  // 4. Impresión en Pantalla
  document.getElementById("calcBasePriceDisplay").value =
    "$" + precioBaseUnMes.toLocaleString("es-CO");
  document.getElementById("calcSubtotal").innerText =
    "$" + subtotal.toLocaleString("es-CO");
  document.getElementById("calcDiscount").innerText =
    "-$" + montoDescuento.toLocaleString("es-CO");
  document.getElementById("calcTotal").innerText =
    "$" + totalA_Cobrar.toLocaleString("es-CO");
};

function copiarCotizacionCombo(btn) {
  if (typeof haptic === "function") haptic();

  let plataformasSeleccionadas = [];
  document.querySelectorAll(".row-cotizar-plat").forEach((row) => {
    const cb = row.querySelector(".chk-cotizar-plat");
    if (cb && cb.checked) {
      const selectPantallas = row.querySelector(".sel-pantallas-cotizador");
      const pantallas = selectPantallas
        ? parseInt(selectPantallas.value) || 1
        : 1;

      let textoPantallas = "";
      if (pantallas > 1) {
        textoPantallas =
          pantallas >= 5 && cb.value === "NETFLIX"
            ? " (Cuenta Completa)"
            : ` (${pantallas} Pantallas)`;
      }

      plataformasSeleccionadas.push(
        `   • 📺 *${cb.value.toUpperCase()}*${textoPantallas}`,
      );
    }
  });

  if (plataformasSeleccionadas.length === 0) {
    alert("Selecciona al menos una plataforma para armar el mensaje.");
    return;
  }

  const meses = document.getElementById("calcMonths").value;
  const porcDesc = document
    .getElementById("calcMonths")
    .options[
      document.getElementById("calcMonths").selectedIndex
    ].getAttribute("data-desc");
  const esClienteFiel = document.getElementById("calcFidelidad").checked;

  const subtotalText = document.getElementById("calcSubtotal").innerText;
  const discountText = document.getElementById("calcDiscount").innerText;
  const totalText = document.getElementById("calcTotal").innerText;

  let listaPlatFormateada = plataformasSeleccionadas.join("\n");

  let mensajeVIP =
    `💻 *¡TU COMBO STREAMING CYBERNET ESTÁ LISTO!* 🚀📺\n\n` +
    `🔥 *Servicios Incluidos:*\n${listaPlatFormateada}\n\n` +
    `🗓️ *Vigencia contratada:* ${meses} Mes(es) Garantizados\n`;

  if (parseInt(meses) > 1 || esClienteFiel) {
    mensajeVIP += `\n💵 Valor Comercial: ${subtotalText}\n`;

    if (parseInt(meses) > 1) {
      mensajeVIP += `🎁 *Descuento Especial (${porcDesc}%):* ${discountText}\n`;
    }
    if (esClienteFiel) {
      let descFielAcumulado = 1000 * parseInt(meses);
      mensajeVIP += `✨ *Descuento Cliente Fiel:* -$${descFielAcumulado.toLocaleString("es-CO")} _(¡Por tu lealtad con la casa!)_\n`;
    }

    mensajeVIP += `───────────────────────\n💰 *TOTAL NETO A PAGAR: ${totalText}* 🔥✨\n`;
  } else {
    mensajeVIP += `───────────────────────\n💰 *TOTAL A PAGAR: ${totalText}* 🔥🍿\n`;
  }

  mensajeVIP += `\n\n¿Te agrada la oferta para enviarte los medios de pago y activarte de inmediato? ⚡🍿`;

  navigator.clipboard.writeText(mensajeVIP).then(() => {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡Ficha Copiada!`;
    btn.style.background = "var(--ios-green)";

    if (typeof CyberSonidos !== "undefined") CyberSonidos.play("exito");
    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path></svg><span>Cotización copiada con éxito</span></div>`,
      );
    }

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = "";
      cerrarCalculadoraCombos();
    }, 1500);
  });
}

// =========================================================================
// 🎛️ PANEL DE CONTROL DE INVENTARIO (ADMIN CAMILO)
// =========================================================================
const productosTiendaMaster = [
  { id: "btn_netflix", nombre: "Netflix" },
  { id: "btn_disney_prem", nombre: "Disney+ Premium" },
  { id: "btn_disney_std", nombre: "Disney Std" },
  { id: "btn_amazon", nombre: "Amazon Prime" },
  { id: "btn_max", nombre: "HBO Max" },
  { id: "btn_paramount", nombre: "Paramount+" },
  { id: "btn_vix", nombre: "Vix+" },
  { id: "btn_plex", nombre: "Plex TV" },
  { id: "btn_crunchy", nombre: "Crunchyroll" },
  { id: "apple", nombre: "Apple TV+" },
  { id: "btn_universal", nombre: "Universal+" },
  { id: "btn_iptv", nombre: "IPTV Smarters" },
  { id: "btn_flujo", nombre: "Flujo TV" },
  { id: "btn_directv", nombre: "Directv Go" },
  { id: "btn_emby", nombre: "Emby" },
  { id: "btn_canva", nombre: "Canva Pro" },
  { id: "btn_spotify", nombre: "Spotify" },
  { id: "btn_yt", nombre: "YouTube" },
  { id: "btn_deezer", nombre: "Deezer" },
  { id: "btn_metegol", nombre: "Metegol" },
];

document.addEventListener("DOMContentLoaded", () => {
  window.inyectarEstilosSwitchAdmin();
  if (document.getElementById("panelSwitchesStock")) {
    setTimeout(window.renderizarPanelCamilo, 500);
  }
});

window.toggleInventarioPanel = function () {
  const modal = document.getElementById("inventarioOverlay");
  if (!modal) {
    console.error("El modal de inventario no existe en el HTML.");
    return;
  }

  if (modal.style.display === "flex") {
    modal.style.display = "none";
  } else {
    modal.style.display = "flex";
    window.renderizarPanelCamilo(); // Refresca los switches al abrir
  }
};

// =========================================================================
// 🎛️ CYBERNET OS: INVENTARIO UNIFICADO INTELIGENTE (CUENTAS EN VIVO + INTERRUPTOR)
// =========================================================================

// Almacén global para guardar el conteo que viene de Google Sheets
window.cachedLibresData = [];

function actualizarPerfilesLibres(manual = false) {
  if (manual) haptic();

  const callbackName = "cb_libres_" + Date.now();
  window[callbackName] = function (res) {
    if (res && res.status === "success") {
      // 1. Guardamos el conteo fresco de Sheets en la memoria global
      window.cachedLibresData = res.data;

      // 2. Le ordenamos a la lista de switches que se redibuje para mostrar los nuevos números
      if (typeof window.renderizarPanelCamilo === "function") {
        window.renderizarPanelCamilo();
      }

      // Mantiene tu detector de alertas en segundo plano
      verificarStockCritico(res.data);
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

// Helper inteligente para emparejar el array local con las columnas de Google Sheets
function obtenerConteoLibreDinamico(idProducto) {
  if (!window.cachedLibresData || window.cachedLibresData.length === 0)
    return "-";

  // Normalizamos el ID (ej: btn_disney_prem -> DISNEYPREMIUM)
  let key = idProducto.replace("btn_", "").replace(/_/g, "").toUpperCase();
  if (key === "MAX") key = "HBOMAX";
  if (key === "DISNEYSTD") key = "DISNEYESTANDAR";
  if (key === "YT") key = "YOUTUBE";
  if (key === "CRUNCHY") key = "CRUNCHYROLL";

  let encontrado = window.cachedLibresData.find((item) => {
    let platNorm = item.plat.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    return platNorm === key || platNorm.includes(key) || key.includes(platNorm);
  });

  return encontrado ? encontrado.libres : "0";
}

// =========================================================================
// 🎛️ INVENTARIO UNIFICADO BENTO DE DOS COLUMNAS (IPADOS EDITION)
// =========================================================================
window.renderizarPanelCamilo = function () {
  const contenedor = document.getElementById("panelSwitchesStock");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  const userActivo = (sessionStorage.getItem("active_staff") || "")
    .toUpperCase()
    .trim();
  const esCamilo = userActivo === "CAMILO";
  const agotados = JSON.parse(
    localStorage.getItem("cyber_items_agotados") || "[]",
  );

  productosTiendaMaster.forEach((p) => {
    const estaAgotado = agotados.includes(p.id);
    const cantLibres = window.obtenerConteoLibreDinamico(p.id);

    const row = document.createElement("div");
    // Transformamos cada celda en un micro-widget iPadOS perfectamente alineado
    row.className = "widget-ipad";
    row.style.cssText =
      "padding: 12px 16px !important; flex-direction: row !important; justify-content: space-between !important; align-items: center !important; margin: 0 !important; gap: 10px !important; background: #1c1c1e !important; border-radius: 16px !important;";

    const inputDisabled = esCamilo
      ? ""
      : "disabled style='cursor: not-allowed;'";
    const labelAction = esCamilo
      ? ""
      : `onclick="alert('🔒 ACCESO RESTRINGIDO\\n\\nSolo el administrador Camilo puede alterar el estado de venta de las plataformas.')"`;

    row.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 2px; overflow: hidden; padding-right: 4px;">
          <span style="font-size: 0.92rem; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.nombre}</span>
          <span style="font-size: 0.76rem; color: var(--text-secondary); font-weight: 600; font-family: monospace;">(${cantLibres} libres)</span>
        </div>
        
        <label class="switch-camilo" ${labelAction} style="flex-shrink: 0;">
          <input type="checkbox" ${estaAgotado ? "checked" : ""} ${inputDisabled} onchange="window.cambiarStockDesdeAdmin('${p.id}')">
          <span class="slider-camilo" style="${!esCamilo ? "opacity: 0.5; filter: grayscale(1);" : ""}"></span>
        </label>
      `;
    contenedor.appendChild(row);
  });
};
window.cambiarStockDesdeAdmin = function (id) {
  let agotados = JSON.parse(
    localStorage.getItem("cyber_items_agotados") || "[]",
  );
  if (agotados.includes(id)) {
    agotados = agotados.filter((item) => item !== id); // Recupera stock
  } else {
    agotados.push(id); // Se agotó
  }
  localStorage.setItem("cyber_items_agotados", JSON.stringify(agotados));
};

window.inyectarEstilosSwitchAdmin = function () {
  if (document.getElementById("css-switch-camilo")) return;
  const estilo = document.createElement("style");
  estilo.id = "css-switch-camilo";
  estilo.innerHTML = `
      .switch-camilo { position: relative; display: inline-block; width: 48px; height: 26px; }
      .switch-camilo input { opacity: 0; width: 0; height: 0; }
      .slider-camilo { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #30d158; transition: .3s; border-radius: 30px; }
      .slider-camilo:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
      input:checked + .slider-camilo { background-color: #ff453a; }
      input:checked + .slider-camilo:before { transform: translateX(22px); }
    `;
  document.head.appendChild(estilo);
};
// ⚡ MOTOR DE SINCRONIZACIÓN DE PAGOS: Descarga los turnos liquidados desde Google Cloud
function sincronizarTachadosConNube(callback) {
  const cbName = "cb_get_tachar_" + Date.now();
  window[cbName] = function (res) {
    const node = document.getElementById("node_" + cbName);
    if (node) node.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      localStorage.setItem("cyber_turnos_tachados", JSON.stringify(res.data));
    }
    if (callback) callback();
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerTachadosBackend&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}
// =========================================================================
// 📱 CONTROLADOR INTEGRADO: DOCK COLAPSABLE INTELIGENTE PARA CELULARES
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const bottomBar = document.querySelector(".ios-bottom-bar");
  if (!bottomBar) return;

  // 1. Creamos el botón disparador minimalista para el celular
  const menuTrigger = document.createElement("div");
  menuTrigger.className = "mobile-menu-trigger";
  menuTrigger.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
    <span>Menú</span>
  `;

  // 2. Lo inyectamos al inicio de tu barra de herramientas
  bottomBar.insertBefore(menuTrigger, bottomBar.firstChild);

  // 3. Evento Toggle: Expande o encoge el menú en bloque
  menuTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    haptic();
    bottomBar.classList.toggle("mobile-expanded");
  });

  // 4. Auto-Cierre: Si toca cualquier opción del menú, este se encoge al instante
  bottomBar.querySelectorAll(".ios-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      bottomBar.classList.remove("mobile-expanded");
    });
  });

  // 5. Cierre Externo: Si toca fuera del menú, también se cierra de forma segura
  document.addEventListener("click", () => {
    bottomBar.classList.remove("mobile-expanded");
  });
});
// ⚡ MOTOR DE ADELANTOS EXCLUSIVO DESDE PANEL TURNOS (CONEXIÓN DIRECTA BACKEND)
window.toggleModalAdelanto = function (abrir) {
  if (typeof haptic === "function") haptic();
  const modal = document.getElementById("adelantoShiftOverlay");
  if (!modal) return;
  if (abrir) {
    document.getElementById("formAdelantoShift").reset();
    modal.classList.add("open");
    setTimeout(() => document.getElementById("adeMonto").focus(), 150);
  } else {
    modal.classList.remove("open");
  }
};

window.ejecutarAdelantoDesdeShift = function (e) {
  e.preventDefault();
  if (typeof haptic === "function") haptic();

  const empleado = document.getElementById("adeEmpleado").value;
  const montoRaw = document.getElementById("adeMonto").value;
  const monto = parseFloat(montoRaw.replace(/[^0-9]/g, ""));

  if (!empleado || isNaN(monto) || monto <= 0) {
    alert("⚠️ Por favor ingresa un monto válido.");
    return;
  }

  const btn = document.getElementById("btnSubmitAdeShift");
  const originalText = btn.innerHTML;
  btn.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:6px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg> Aplicando...`;
  btn.disabled = true;

  const scriptNode = document.createElement("script");
  const callbackName = "cbAdeShift_" + Date.now();

  window[callbackName] = function (res) {
    btn.innerHTML = originalText;
    btn.disabled = false;
    delete window[callbackName];
    scriptNode.remove();

    if (res && res.status === "success") {
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>¡Adelanto de $${monto.toLocaleString("es-CO")} aplicado a ${empleado}!</span></div>`,
        );
      }
      window.toggleModalAdelanto(false);
      if (typeof forzarRefrescoDeHoras === "function") forzarRefrescoDeHoras(); // Refresca los turnos de fondo
    } else {
      alert("❌ ERROR:\n\n" + (res ? res.message : "Desconocido"));
    }
  };

  scriptNode.id = "script_ade_shift";
  scriptNode.src =
    GOOGLE_SCRIPT_URL +
    "?action=agregarDescuentoNomina&empleado=" +
    encodeURIComponent(empleado) +
    "&monto=" +
    encodeURIComponent(monto) +
    "&concepto=" +
    encodeURIComponent("ADELANTO - Panel Turnos") +
    "&callback=" +
    callbackName +
    "&_ts=" +
    Date.now();
  document.body.appendChild(scriptNode);
};
// =========================================================================
// 🔍 CYBERNET OS: MOTOR SPOTLIGHT RECALIBRADO (BÚSQUEDA EXCLUSIVA POR NOMBRE)
// =========================================================================
window.filtrarTarjetasMac = function () {
  const input = document.getElementById("macSearchCards");
  const container = document.getElementById("grid-container");
  const emptyState = document.getElementById("macEmptyState");

  if (!input || !container) return;

  // Limpiamos el texto del buscador (minúsculas y sin espacios locos)
  const filtro = input.value.toLowerCase().trim();
  const tarjetas = container.getElementsByClassName("card-ios");
  let encontradas = 0;

  // 🏠 CASO 1: El buscador está vacío -> Se muestran TODAS las tarjetas de una
  if (filtro === "") {
    if (emptyState)
      emptyState.style.setProperty("display", "none", "important");
    for (let i = 0; i < tarjetas.length; i++) {
      tarjetas[i].style.setProperty("display", "flex", "important");
    }
    return;
  }

  // 🎯 CASO 2: El usuario escribe -> Filtro estricto por palabras iniciales del título
  for (let i = 0; i < tarjetas.length; i++) {
    const tarjeta = tarjetas[i];

    // Extraemos únicamente la primera línea de texto de la tarjeta (que siempre es el TÍTULO)
    const lineas = tarjeta.innerText.toLowerCase().split("\n");
    const titulo = lineas[0] ? lineas[0].trim() : "";

    // Separamos el título en palabras independientes
    const palabras = titulo.split(/\s+/);

    // Comprobamos si ALGUNAS de las palabras del título EMPIEZA con las letras del buscador
    const coincideConNombre = palabras.some((palabra) =>
      palabra.startsWith(filtro),
    );

    if (coincideConNombre) {
      tarjeta.style.setProperty("display", "flex", "important");
      encontradas++;
    } else {
      tarjeta.style.setProperty("display", "none", "important");
    }
  }

  // ⚠️ CASO 3: Control de pantalla vacía si escribe algo que no existe
  if (emptyState) {
    if (encontradas === 0) {
      const textoMensaje = emptyState.querySelector("span");
      if (textoMensaje)
        textoMensaje.innerText = `No se encontraron plantillas con el nombre "${input.value}".`;
      emptyState.style.setProperty("display", "flex", "important");
    } else {
      emptyState.style.setProperty("display", "none", "important");
    }
  }
};

// Aseguramos que al cargar la página por primera vez se muestren todas las tarjetas
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (typeof window.filtrarTarjetasMac === "function") {
      window.filtrarTarjetasMac();
    }
  }, 100);
});

// 🛡️ Observador: Oculta las tarjetas automáticamente apenas Sheets las inyecte en la página
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("grid-container");
  if (grid) {
    const observer = new MutationObserver(() => {
      const input = document.getElementById("macSearchCards");
      if (input && input.value.trim() === "") {
        filtrarTarjetasMac(); // Ejecuta el filtro para esconderlas
      }
    });
    observer.observe(grid, { childList: true });
  }
});
// =========================================================================
// 🔒 SEGURIDAD: BOTÓN DE INVENTARIO SUPERIOR SOLO PARA CAMILO
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const userActivo = (sessionStorage.getItem("active_staff") || "")
    .toUpperCase()
    .trim();
  const btnInvMenu = document.getElementById("menuBtnInventario");

  if (btnInvMenu) {
    if (userActivo === "CAMILO") {
      btnInvMenu.style.display = "inline-block"; // Lo enciende
    } else {
      btnInvMenu.style.display = "none"; // Lo apaga
    }
  }
  // 🔥 FORZAR INYECTOR DE SESIÓN MAC EN PANTALLA
  const sesionGuardada = sessionStorage.getItem("active_staff") || "CAMILO";
  const txtNombreBarra = document.getElementById("staffSessionName");
  if (txtNombreBarra) {
    txtNombreBarra.innerText = sesionGuardada.toUpperCase().trim();
  }
});
// =========================================================================
// 🗂️ CYBERNET OS: CERRADOR DE VENTAS INFALIBLE (MODO ESCRITORIO LIMPIO)
// =========================================================================
document.addEventListener(
  "click",
  (e) => {
    const tocasteMenu = e.target.closest(".mac-menu-item");
    const tocasteDock = e.target.closest(".mac-dock-icon");

    if (tocasteMenu || tocasteDock) {
      // 📋 CORREGIDO: IDs exactos de los contenedores HTML de las 3 bóvedas nuevas
      const ventanasPrincipales = [
        "codesOverlay",
        "shiftsOverlay",
        "inventarioOverlay",
        "promoOverlay",
        "recordatoriosOverlay",
        "addHoursOverlay",
        "anaCodesOverlay", // 🌟 Corregido de función a ID
        "chayoOverlay", // 🌟 Corregido de función a ID
        "yopmailOverlay", // 🌟 Corregido de función a ID
        "distrisOverlay",
        "finanzasOverlay",
        "ventasOverlay",
        "cargarOverlay",
        "garantiasOverlay",
        "netflixManagerOverlay",
        "libroOverlay",
        "gmailOverlay",
      ];

      ventanasPrincipales.forEach((id) => {
        const ventana = document.getElementById(id);
        if (ventana) {
          ventana.classList.remove("open");
          if (
            ventana.style.display === "flex" ||
            ventana.style.display === "block"
          ) {
            ventana.style.display = "none";
          }
        }
      });
    }
  },
  true,
);
// =========================================================================
// 🍎 CYBERNET OS: MOTOR DE ALERTA DE STOCK DE MAC INTEGRADO (V2 UNIFICADO)
// =========================================================================
window.timerElapsedNotif = null;
window.cachedLibresData = [];

window.actualizarPerfilesLibres = function (manual = false) {
  if (manual && typeof haptic === "function") haptic();

  const callbackName = "cb_libres_" + Date.now();

  window[callbackName] = function (res) {
    if (res && res.status === "success") {
      window.cachedLibresData = res.data;

      if (typeof window.renderizarPanelCamilo === "function") {
        window.renderizarPanelCamilo();
      }

      verificarStockCritico(res.data);
    }

    delete window[callbackName];
    const scriptNode = document.getElementById("node_" + callbackName);
    if (scriptNode) scriptNode.remove();
  };

  const script = document.createElement("script");
  script.id = "node_" + callbackName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerPerfilesLibres&callback=${callbackName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.obtenerConteoLibreDinamico = function (idProducto) {
  if (!window.cachedLibresData || window.cachedLibresData.length === 0)
    return "-";

  let key = idProducto.replace("btn_", "").replace(/_/g, "").toUpperCase();
  if (key === "MAX") key = "HBOMAX";
  if (key === "DISNEYSTD") key = "DISNEYESTANDAR";
  if (key === "YT") key = "YOUTUBE";
  if (key === "CRUNCHY") key = "CRUNCHYROLL";
  if (key === "APPLE") key = "APPLETV";
  if (key === "DIRECTV") key = "DIRECTVGO";

  let encontrado = window.cachedLibresData.find((item) => {
    let platNorm = item.plat.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    return platNorm === key || platNorm.includes(key) || key.includes(platNorm);
  });

  return encontrado ? encontrado.libres : "0";
};

function verificarStockCritico(data) {
  let sessionStaff = sessionStorage.getItem("active_staff");
  let localStaff = localStorage.getItem("cyber_saved_staff");
  if (!sessionStaff && !localStaff) return;

  const umbrales = {
    NETFLIX: 2,
    AMAZON: 5,
    HBOMAX: 5,
    DISNEYPREMIUM: 1,
    DISNEYESTANDAR: 1,
    CRUNCHYROLL: 1,
    PLEX: 1,
    APPLETV: 1,
  };
  let bajas = [];

  data.forEach((item) => {
    let keyNorm = item.plat.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    let limite = umbrales[keyNorm] || 1;
    let libresNum = parseInt(item.libres, 10);

    if (!isNaN(libresNum) && libresNum <= limite) {
      let nombreLimpio = item.plat.replace(/-/g, " ");
      bajas.push(`${nombreLimpio} (${libresNum})`);
    }
  });

  if (bajas.length > 0) {
    lanzarBannerMacosStock(bajas.join(", "));
  }
}

function lanzarBannerMacosStock(listaPlataformas) {
  const banner = document.getElementById("macNotificationBanner");
  const texto = document.getElementById("macNotifText");
  const visorTiempo = document.getElementById("macNotifTime");

  if (!banner || !texto || !visorTiempo) return;

  clearInterval(window.timerElapsedNotif);
  banner.style.transform = "translateX(120%)";
  banner.style.opacity = "0";

  setTimeout(() => {
    texto.innerHTML = `Plataformas bajas o agotadas:<br><b style="color:#ffffff;">${listaPlataformas}</b>`;
    visorTiempo.innerText = "Ahora";
    banner.style.transform = "translateX(0)";
    banner.style.opacity = "1";

    if (typeof haptic === "function") haptic();

    let minutosTranscurridos = 0;
    window.timerElapsedNotif = setInterval(() => {
      minutosTranscurridos++;
      visorTiempo.innerText = `Hace ${minutosTranscurridos} min`;
    }, 60000);
  }, 250);
}

window.cerrarBannerNotificacionManualmente = function () {
  const banner = document.getElementById("macNotificationBanner");
  if (banner) {
    banner.style.transform = "translateX(120%)";
    banner.style.opacity = "0";
    clearInterval(window.timerElapsedNotif);
  }
};

// =========================================================================
// ⏱️ RELOJ AUTOMÁTICO DE SEGUIMIENTO INTERNO (CALIBRADO A 5 MINUTOS)
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    window.actualizarPerfilesLibres(false);
  }, 2000);

  if (window.intervaloLibresAuto) clearInterval(window.intervaloLibresAuto);

  // 🔄 SINCRONIZACIÓN PERFECTA: Dispara el radar contable cada 5 minutos exactos
  window.intervaloLibresAuto = setInterval(
    () => {
      window.actualizarPerfilesLibres(false);
    },
    5 * 60 * 1000,
  ); // ⏱️ 300.000 ms
});
// =========================================================================
// 🔒 SEGURIDAD: CONTROLADOR DEL BOTÓN DE INVENTARIO SUPERIOR
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const btnInvMenu = document.getElementById("menuBtnInventario");
  if (btnInvMenu) {
    btnInvMenu.style.display = "inline-block"; // Habilitado para todo el personal de Cybernet
  }

  // Mantener el inyector forzado de sesión que ya tenías abajo
  const sesionGuardada = sessionStorage.getItem("active_staff") || "CAMILO";
  const txtNombreBarra = document.getElementById("staffSessionName");
  if (txtNombreBarra) {
    txtNombreBarra.innerText = sesionGuardada.toUpperCase().trim();
  }
});
// Función para fulminar el banner de notificación manualmente
window.cerrarBannerNotificacionManualmente = function () {
  const banner = document.getElementById("macNotificationBanner");
  if (banner) {
    banner.style.transform = "translateX(120%)";
    banner.style.opacity = "0";
    clearInterval(window.timerElapsedNotif); // Detiene el segundero interno
  }
};
// =========================================================================
// 📥 MOTOR DE BÚSQUEDA DE CORREOS INTEGRADO (TKDJGZ)
// =========================================================================

window.ejecutarBusquedaCorreoInterno = function () {
  if (typeof haptic === "function") haptic();

  // 1. Capturamos lo que escribiste
  let inputVisual = document.getElementById("inputBuscadorCorreos");
  let correoBuscar = inputVisual.value.trim();

  // 2. Si lo dejó vacío, avisamos
  if (correoBuscar === "") {
    alert("⚠️ Por favor ingresa el nombre del correo que deseas buscar.");
    inputVisual.focus();
    return;
  }

  // Limpiamos por si el empleado escribió por error "@tkdjgz.com"
  correoBuscar = correoBuscar.split("@")[0];

  // 3. Le inyectamos el correo al formulario fantasma
  document.getElementById("inputRecipientFantasma").value = correoBuscar;

  // 4. Ponemos la pantalla a "cargar" visualmente
  let iframe = document.getElementById("iframeCorreosResultado");
  iframe.style.opacity = "0.5";

  if (typeof triggerToast === "function") {
    triggerToast(`✨ Buscando bandeja de ${correoBuscar}...`);
  }

  // 5. Disparamos el envío directo a la página de ellos
  document.getElementById("formFantasmaCorreos").submit();

  // 6. Restauramos la opacidad cuando cargue
  setTimeout(() => {
    iframe.style.opacity = "1";
    if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");
  }, 1000);
};

// =========================================================================
// 🟣 MOTOR AVANZADO: EXTRACCIÓN NATIVA CÓDIGOS ANA (TKDJGZ)
// =========================================================================

window.correosExtraidosNativos = [];

window.toggleAnaCodesPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("anaCodesOverlay");
  if (overlay) {
    overlay.classList.toggle("open");

    if (overlay.classList.contains("open")) {
      // Devolver a la pantalla de espera
      document.getElementById("contenedorNativoCorreos").innerHTML = `
        <div style="margin: auto; color: var(--text-secondary); text-align: center;">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ios-purple)" stroke-width="2" style="margin-bottom: 15px; opacity: 0.7;">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
           </svg>
           <br><span style="font-weight: 600;">Los correos aparecerán aquí</span>
        </div>`;
      document.getElementById("inputBuscadorCorreos").value = "";
      setTimeout(() => {
        document.getElementById("inputBuscadorCorreos").focus();
      }, 150);
    }
  }
};

// =========================================================================
// 🟣 MOTOR AVANZADO: EXTRACCIÓN NATIVA VÍA GOOGLE APPS SCRIPT
// =========================================================================

window.ejecutarBusquedaCorreoInterno = function () {
  if (typeof haptic === "function") haptic();

  let inputVisual = document.getElementById("inputBuscadorCorreos");
  let correoBuscar = inputVisual.value.trim().split("@")[0];

  if (correoBuscar === "") {
    alert("⚠️ Por favor ingresa el nombre del correo que deseas buscar.");
    inputVisual.focus();
    return;
  }

  let contenedor = document.getElementById("contenedorNativoCorreos");

  contenedor.innerHTML = `
    <div style="margin: auto; color: var(--ios-purple); text-align: center;">
       <svg class="spin-anim" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
       </svg>
       <br><br><span style="font-weight: 600;">Usando el servidor de Google para extraer correos...</span>
    </div>`;

  const cbName = "cb_correos_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      let html = res.html;
      let parser = new DOMParser();
      let doc = parser.parseFromString(html, "text/html");

      let table = doc.getElementById("emailTable");
      if (!table) {
        contenedor.innerHTML = `<div style="margin: auto; color: var(--ios-red); font-weight: bold;">No hay correos recientes en esta bandeja.</div>`;
        return;
      }

      // Extraer JS info del cuerpo del correo
      let match =
        html.match(/var\s+emailBody\s*=\s*(\[.*?\])\[index\]\.body;/s) ||
        html.match(/var\s+emailsData\s*=\s*(\[.*?\]);/s);
      if (match && match[1]) {
        try {
          window.correosExtraidosNativos = JSON.parse(match[1]);
        } catch (e) {
          window.correosExtraidosNativos = [];
        }
      }

      let filas = table.querySelectorAll("tr");
      if (filas.length <= 1) {
        contenedor.innerHTML = `<div style="margin: auto; color: var(--ios-green); font-weight: bold;">La bandeja está limpia.</div>`;
        return;
      }

      // Generar la tabla en modo oscuro VIP
      let htmlTabla = `<table style="width: 100%; border-collapse: collapse; text-align: left;">`;
      filas.forEach((row, i) => {
        if (i === 0) {
          htmlTabla += `<tr style="border-bottom: 1px solid rgba(191, 90, 242, 0.3); color: var(--ios-purple);">`;
          row
            .querySelectorAll("th")
            .forEach(
              (th) =>
                (htmlTabla += `<th style="padding: 16px; font-weight: 800; text-transform: uppercase; font-size: 0.85rem;">${th.innerText}</th>`),
            );
          htmlTabla += `</tr>`;
        } else {
          let cols = row.querySelectorAll("td");
          if (cols.length >= 2) {
            htmlTabla += `
                 <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(191, 90, 242, 0.1)'" onmouseout="this.style.background='transparent'" onclick="abrirLectorCorreo(${i - 1})">
                    <td style="padding: 16px; color: var(--text-primary); font-weight: 600; font-size: 0.95rem;">${cols[0].innerText}</td>
                    <td style="padding: 16px; color: var(--text-secondary); font-size: 0.85rem; font-family: monospace;">${cols[1].innerText}</td>
                 </tr>`;
          }
        }
      });
      htmlTabla += `</table>`;

      if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");
      contenedor.innerHTML = htmlTabla;
    } else {
      contenedor.innerHTML = `<div style="margin: auto; color: var(--ios-red); font-weight: bold;">Error: ${res ? res.message : "Fallo de conexión"}</div>`;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  // Llamamos a TU Google Script para que él haga el trabajo sucio
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerCorreosTK&correo=${encodeURIComponent(correoBuscar)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.abrirLectorCorreo = function (index) {
  if (typeof haptic === "function") haptic();
  let data = window.correosExtraidosNativos[index];
  if (data && data.body) {
    document.getElementById("cuerpoLectorCorreo").innerHTML = data.body;
    document.getElementById("modalLectorCorreo").style.display = "flex";
  } else {
    alert("No se pudo cargar el cuerpo de este correo.");
  }
};

window.cerrarLectorCorreo = function () {
  if (typeof haptic === "function") haptic();
  document.getElementById("modalLectorCorreo").style.display = "none";
  document.getElementById("cuerpoLectorCorreo").innerHTML = "";
};

// =========================================================================
// 🟡 MOTOR: ACCESO DIRECTO Y PRESSETS FIJOS YOPMAIL
// =========================================================================

window.toggleYopmailPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("yopmailOverlay");
  if (overlay) {
    overlay.classList.toggle("open");

    if (overlay.classList.contains("open")) {
      document.getElementById("inputYopmailCorreos").value = "";
      setTimeout(() => {
        document.getElementById("inputYopmailCorreos").focus();
      }, 150);
    }
  }
};

window.abrirVentanaYopmail = function () {
  if (typeof haptic === "function") haptic();

  let inputVisual = document.getElementById("inputYopmailCorreos");
  let correoBuscar = inputVisual.value.trim().split("@")[0];

  if (correoBuscar === "") {
    alert("⚠️ Por favor ingresa el nombre del correo.");
    inputVisual.focus();
    return;
  }

  window.buscarYopmailDirecto(correoBuscar);
};

window.buscarYopmailDirecto = function (correo) {
  if (typeof haptic === "function") haptic();

  // Limpia cualquier dominio sobrante por si acaso
  let correoLimpio = correo.trim().split("@")[0];

  // Ocultamos el buscador de tu panel de Cybernet
  const overlay = document.getElementById("yopmailOverlay");
  if (overlay) overlay.classList.remove("open");

  if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");
  if (typeof triggerToast === "function") {
    triggerToast(`✨ Abriendo buzón de Yopmail: ${correoLimpio}...`);
  }

  // Despliega la mini-ventana externa tipo aplicación
  let urlYopmail = `https://yopmail.com/?login=${encodeURIComponent(correoLimpio)}`;
  let opcionesVentana =
    "width=850,height=650,left=250,top=100,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes";

  window.open(urlYopmail, "YopmailBandeja", opcionesVentana);
};

// =========================================================================
// 🔴 MOTOR: PANEL MAXI-PANORÁMICO CHAYO (CON EFECTO CORTINA PROTEGIDO)
// =========================================================================

window.toggleChayoPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("chayoOverlay");
  const iframe = document.getElementById("iframeChayo");
  const barra = document.getElementById("barraCredencialesChayo");

  if (overlay) {
    overlay.classList.toggle("open");

    if (overlay.classList.contains("open")) {
      // 🔄 Reseteo de cortina intermedia al abrir la app
      if (barra) {
        barra.style.maxHeight = "80px";
        barra.style.padding = "12px 20px";
        barra.style.borderBottomWidth = "1px";
        barra.style.opacity = "1";
      }

      if (iframe.src.includes("about:blank")) {
        iframe.src = "https://chayonet.github.io/tienda/";
      }
    }
  }
};

window.copiarCredencialChayo = function (texto, btn, tipo) {
  if (typeof haptic === "function") haptic();

  navigator.clipboard.writeText(texto).then(() => {
    let originalText = btn.innerText;

    btn.innerText = "¡Copiado!";
    btn.style.background = "rgba(50, 215, 75, 0.15)";
    btn.style.color = "var(--ios-green)";
    btn.style.borderColor = "rgba(50, 215, 75, 0.3)";

    if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");

    setTimeout(() => {
      btn.innerText = originalText;
      btn.style.background = "rgba(255,55,95,0.1)";
      btn.style.color = "#ff375f";
      btn.style.borderColor = "rgba(255,55,95,0.3)";
    }, 1500);

    // ⚡ Desaparece únicamente el llavero intermedio a los 5 segundos de copiar la clave
    if (tipo === "clave") {
      setTimeout(() => {
        const barra = document.getElementById("barraCredencialesChayo");
        if (barra && barra.style.maxHeight !== "0px") {
          barra.style.maxHeight = "0px";
          barra.style.padding = "0px 20px";
          barra.style.borderBottomWidth = "0px";
          barra.style.opacity = "0";
          if (typeof triggerToast === "function") {
            triggerToast("🔓 Acceso completado. Maximizando visualización.");
          }
        }
      }, 5000);
    }
  });
};
// =========================================================================
// NUEVA FUNCIÓN: COPIAR CORREO EN PANEL DE CORTES (SIN ABRIR URL)
// =========================================================================
window.copiarCorreoNetflixCorte = function (btn, correo) {
  if (typeof haptic === "function") haptic();

  navigator.clipboard.writeText(correo).then(function () {
    let oldBg = btn.style.background;
    let oldColor = btn.style.color;

    btn.style.background = "var(--ios-green)";
    btn.style.color = "#ffffff";

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Correo copiado</span></div>`,
      );
    }

    setTimeout(function () {
      btn.style.background = oldBg;
      btn.style.color = oldColor;
    }, 1500);

    // Se eliminó la línea que abría Netflix automáticamente
  });
};
window.toggleLibroPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("libroOverlay");
  if (overlay) {
    overlay.classList.toggle("open");
  }
};
// =========================================================================
// 🔴 MOTOR: LECTOR DE CORREOS GLOBAL FILTRADO POR DESTINATARIO (ÚLTIMA HORA)
// =========================================================================
window.correosGlobalesData = [];

window.toggleGmailPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("gmailOverlay");
  if (overlay) {
    overlay.style.setProperty("display", "", "important");
    overlay.classList.toggle("open");

    if (overlay.classList.contains("open")) {
      // Limpiamos la interfaz y dejamos una pantalla de espera limpia
      document.getElementById("inputBuscadorGmailReal").value = "";
      document.getElementById("gmailScrollArea").innerHTML = `
        <div style="margin: auto; color: var(--text-secondary); text-align: center; padding: 60px 20px;">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ea4335" stroke-width="2" style="margin-bottom: 15px; opacity: 0.7;">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
           </svg>
           <br><span style="font-weight: 600;">Ingresa un correo arriba para escanear su bandeja</span>
        </div>`;
      setTimeout(() => {
        document.getElementById("inputBuscadorGmailReal").focus();
      }, 150);
    }
  }
};

window.ejecutarBusquedaGmailEspecifica = function () {
  if (typeof haptic === "function") haptic();

  const inputVisual = document.getElementById("inputBuscadorGmailReal");
  const correoBuscar = inputVisual.value.trim();
  const container = document.getElementById("gmailScrollArea");

  if (correoBuscar === "") {
    alert("⚠️ Por favor ingresa el correo completo que deseas buscar.");
    inputVisual.focus();
    return;
  }

  container.innerHTML = `
    <div style="text-align:center; padding:60px 20px; color:var(--text-secondary); font-size:0.95rem;">
      <svg class="spin-anim" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ea4335" stroke-width="2.5" style="margin-bottom:12px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
      <br><span style="color:#ea4335; font-weight:700;">Buscando correos de la última hora para: ${correoBuscar}...</span>
    </div>`;

  const oldScript = document.getElementById("cyber_gmail_global_node");
  if (oldScript) oldScript.remove();

  const cbName = "cb_gmail_global_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      if (res.data.length === 0) {
        container.innerHTML =
          '<div style="text-align:center; padding:60px 20px; color:var(--ios-orange); font-weight:bold; font-size:1rem;">📭 No se encontraron correos nuevos para este destinatario.</div>';
        return;
      }

      window.correosGlobalesData = res.data;
      let htmlTabla = `<table style="width: 100%; border-collapse: collapse; text-align: left;">`;

      res.data.forEach((mail, i) => {
        let remitenteLimpio = mail.remitente.replace(/<.*?>/g, "").trim();
        if (remitenteLimpio === "") remitenteLimpio = mail.remitente;

        let destinatarioLimpio = mail.destinatario.replace(/<.*?>/g, "").trim();
        if (destinatarioLimpio === "") destinatarioLimpio = mail.destinatario;

        htmlTabla += `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s;" 
              onmouseover="this.style.background='rgba(234, 67, 53, 0.1)'" 
              onmouseout="this.style.background='transparent'" 
              onclick="window.abrirLectorCorreoGlobal(${i})">
             
             <td style="padding: 16px 12px; width: 35%; vertical-align: middle;">
                <div style="color: var(--text-primary); font-weight: 800; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">${remitenteLimpio}</div>
                <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">
                  Para: <span style="color: var(--ios-blue); font-family: monospace; font-weight: 600;">${destinatarioLimpio}</span>
                </div>
             </td>
             
             <td style="padding: 16px 12px; width: 50%; vertical-align: middle;">
                <div style="display: flex; flex-direction: column; gap: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 380px;">
                  <span style="color: var(--text-primary); font-weight: 700; font-size: 0.95rem;">${mail.asunto}</span>
                  <span style="color: var(--text-secondary); font-size: 0.85rem;">${mail.fragmento}</span>
                </div>
             </td>
             
             <td style="padding: 16px 12px; width: 15%; text-align: right; vertical-align: middle;">
                <div style="color: var(--text-secondary); font-size: 0.8rem; font-family: monospace; font-weight: bold;">${mail.fecha}</div>
             </td>
          </tr>`;
      });

      htmlTabla += `</table>`;
      container.innerHTML = htmlTabla;
      if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");
    } else {
      container.innerHTML = `<div style="color:var(--ios-red); text-align:center; padding:40px; font-weight:700;">Error: ${res ? res.message : "Fallo de conexión"}</div>`;
    }
  };

  const script = document.createElement("script");
  script.id = "cyber_gmail_global_node";
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerCorreosRecientesGlobal&correo=${encodeURIComponent(correoBuscar)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// Puedes borrar la función filtrarCorreosGlobales vieja ya que el buscador opera en la nube

// 👇 NUEVO: FUNCIÓN PARA EL BUSCADOR 👇
window.filtrarCorreosGlobales = function () {
  const query = document
    .getElementById("buscadorGmailGlobal")
    .value.toLowerCase()
    .trim();
  const filas = document.querySelectorAll(".fila-correo-global");

  filas.forEach((fila) => {
    // Busca en todo el texto de la fila (remitente, destinatario y asunto)
    if (fila.innerText.toLowerCase().includes(query)) {
      fila.style.display = "";
    } else {
      fila.style.display = "none";
    }
  });
};

// Abre el sub-modal blanco con el contenido HTML real del correo
window.abrirLectorCorreoGlobal = function (index) {
  if (typeof haptic === "function") haptic();
  let data = window.correosGlobalesData[index];

  if (data && data.cuerpoHtml) {
    document.getElementById("cuerpoLectorCorreoGlobal").innerHTML =
      data.cuerpoHtml;
    document.getElementById("modalLectorCorreoGlobal").style.display = "flex";
  } else {
    alert("No se pudo extraer el cuerpo de este correo.");
  }
};

// Cierra el sub-modal blanco
window.cerrarLectorCorreoGlobal = function () {
  if (typeof haptic === "function") haptic();
  document.getElementById("modalLectorCorreoGlobal").style.display = "none";
  document.getElementById("cuerpoLectorCorreoGlobal").innerHTML = "";
};
// =========================================================================
// 🔒 GESTOR DE SEGURIDAD PRIVADA DE 10 SEGUNDOS: BÓVEDA CHAYO (DISPLAY ENGINE)
// =========================================================================
let cronometroChayo = null;

function revelarDatosChayoTemporizados() {
  if (typeof haptic === "function") haptic();

  const barra = document.getElementById("barraCredencialesChayo");
  const botonVer = document.getElementById("btnVerDatosChayo");
  if (!barra || !botonVer) return;

  // 🔥 Revelación absoluta en formato Flex superando cualquier bloqueo
  barra.style.setProperty("display", "flex", "important");

  // Congelamos el botón de activación para evitar spam
  botonVer.disabled = true;
  botonVer.style.setProperty("opacity", "0.5", "important");

  let cuentaRegresiva = 10;
  botonVer.innerText = `Mostrando (${cuentaRegresiva}s)`;

  if (cronometroChayo) clearInterval(cronometroChayo);

  cronometroChayo = setInterval(() => {
    cuentaRegresiva--;

    if (cuentaRegresiva <= 0) {
      clearInterval(cronometroChayo);
      // Destruimos la presencia de los botones del DOM tras los 10 segundos
      barra.style.setProperty("display", "none", "important");

      botonVer.disabled = false;
      botonVer.style.setProperty("opacity", "1", "important");
      botonVer.innerText = "Ver datos de ingresos";
    } else {
      botonVer.innerText = `Mostrando (${cuentaRegresiva}s)`;
    }
  }, 1000);
}

// Reseteador preventivo al cerrar el panel
function toggleChayoPanel() {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("chayoOverlay");
  if (!overlay) return;

  overlay.classList.toggle("open");

  // Si cierras la ventana antes de cumplirse el tiempo, ejecutamos limpieza inmediata
  if (!overlay.classList.contains("open")) {
    if (cronometroChayo) clearInterval(cronometroChayo);
    const barra = document.getElementById("barraCredencialesChayo");
    const botonVer = document.getElementById("btnVerDatosChayo");

    if (barra) {
      barra.style.setProperty("display", "none", "important");
    }
    if (botonVer) {
      botonVer.disabled = false;
      botonVer.style.setProperty("opacity", "1", "important");
      botonVer.innerText = "Ver datos de ingresos";
    }
  }
}

// Reemplazar tu función de toggle original con este reseteador preventivo
function toggleChayoPanel() {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("chayoOverlay");
  if (!overlay) return;

  overlay.classList.toggle("open");

  // 🔥 Si cierras la ventana antes de los 10 segundos, borramos los hilos del reloj
  if (!overlay.classList.contains("open")) {
    if (cronometroChayo) clearInterval(cronometroChayo);
    const barra = document.getElementById("barraCredencialesChayo");
    const botonVer = document.getElementById("btnVerDatosChayo");

    if (barra) {
      barra.style.setProperty("max-height", "0px", "important");
      barra.style.setProperty("opacity", "0", "important");
      barra.style.setProperty(
        "border-bottom",
        "1px solid transparent",
        "important",
      );
    }
    if (botonVer) {
      botonVer.disabled = false;
      botonVer.style.setProperty("opacity", "1", "important");
      botonVer.innerText = "Ver datos de ingresos";
    }
  }
}

// Inyector de seguridad para resetear el estado si cierras la ventana manualmente
function toggleChayoPanel() {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("chayoOverlay");
  if (!overlay) return;

  overlay.classList.toggle("open");

  // Interceptor: Si se cierra la ventana, destruimos los datos revelados al instante
  if (!overlay.classList.contains("open")) {
    if (cronometroChayo) clearInterval(cronometroChayo);
    const bloqueCredenciales = document.getElementById(
      "credencialesChayoBlock",
    );
    const botonVer = document.getElementById("btnVerDatosChayo");
    if (bloqueCredenciales)
      bloqueCredenciales.style.setProperty("display", "none", "important");
    if (botonVer) {
      botonVer.disabled = false;
      botonVer.style.setProperty("opacity", "1", "important");
      botonVer.innerText = "Ver datos de ingresos";
    }
  }
}

// =========================================================================
// 🔗 EXTENSIÓN: DESPACHO DE ENLACES DE CREACIÓN (MODO INCÓGNITO COERCIÓN)
// =========================================================================
window.copiarEnlaceCreacionNetflix = function (btn) {
  if (typeof haptic === "function") haptic();

  const urlNetflixSignup =
    "https://www.netflix.com/signup?serverState=%7B%22realm%22%3A%22growth%22%2C%22name%22%3A%22REGISTRATION%22%2C%22clcsSessionId%22%3A%22e6e03881-f169-4087-a06f-4d3efd943c2e%22%2C%22sessionContext%22%3A%7B%22session-breadcrumbs%22%3A%7B%22funnel_name%22%3A%22signupSimplicity%22%7D%7D%7D";

  navigator.clipboard.writeText(urlNetflixSignup).then(function () {
    let originalText = btn.innerHTML;

    btn.innerHTML = "✅ ¡Enlace Copiado!";
    btn.style.background = "var(--ios-green)";
    btn.style.color = "white";

    // Disparamos la alerta Toast con tu letrero estricto de Modo Incógnito
    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-orange); font-weight:700;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <span>Recuerda abrir este enlace en modo incógnito para la creación de la cuenta</span>
        </div>`,
      );
    }

    setTimeout(function () {
      btn.innerHTML = originalText;
      btn.style.background = "rgba(10, 132, 255, 0.12)";
      btn.style.color = "var(--ios-blue)";
    }, 2500);
  });
};
// =========================================================================
// RENDERIZADOR DEL MODAL DE CUENTAS REPETIDAS
// =========================================================================
window.mostrarModalRepetidasCybernet = function (repetidasArray) {
  if (typeof haptic === "function") haptic();

  const contenedor = document.getElementById("listaCuentasRepetidas");
  const modal = document.getElementById("modalRepetidasOverlay");

  if (!contenedor || !modal) return;

  contenedor.innerHTML = "";

  repetidasArray.forEach((cuenta) => {
    let div = document.createElement("div");
    div.style.cssText =
      "background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 159, 10, 0.15); border-left: 3px solid var(--ios-orange); padding: 10px 14px; border-radius: 12px; display: flex; flex-direction: column; gap: 4px;";

    div.innerHTML = `
      <span style="font-family: monospace; font-size: 0.95rem; font-weight: 700; color: var(--text-primary); word-break: break-all;">${cuenta.correo}</span>
      <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 500;">Ya en sistema. Fecha original: <b style="color: var(--ios-orange);">${cuenta.fecha}</b></span>
    `;

    contenedor.appendChild(div);
  });

  modal.classList.add("open");
};
// =========================================================================
// MOTORES DE AUTENTICACIÓN DE 2 FACTORES (2FA) FRONTEND
// =========================================================================
window.otpInterval = null;

function iniciarRelojOTP(segundosTotales) {
  const display = document.getElementById("otpTimerDisplay");
  const btnOtp = document.getElementById("btnSubmitOtp");
  const inputOtp = document.getElementById("staffOtpCode");

  if (window.otpInterval) clearInterval(window.otpInterval);

  window.otpInterval = setInterval(() => {
    segundosTotales--;
    let mins = Math.floor(segundosTotales / 60);
    let secs = segundosTotales % 60;
    display.innerText =
      String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");

    if (segundosTotales <= 0) {
      clearInterval(window.otpInterval);
      display.innerText = "00:00 (Expirado)";
      display.style.color = "var(--ios-red)";
      btnOtp.disabled = true;
      inputOtp.disabled = true;
      document.getElementById("otp-error-toast").innerHTML =
        "Código expirado. Por favor regresa al login.";
      document.getElementById("otp-error-toast").style.display = "block";
    }
  }, 1000);
}

window.registrarEmailOperador = function () {
  if (typeof haptic === "function") haptic();
  const btn = document.getElementById("btnSubmitNewEmail");
  const emailInput = document.getElementById("staffNewEmail").value.trim();

  btn.disabled = true;
  btn.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle></svg> Vinculando...`;

  const cbName = "cb_reg_email_" + Date.now();
  window[cbName] = function (res) {
    btn.disabled = false;
    btn.innerText = "Enviar y Recibir Código";
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      // Correo registrado, pasamos al OTP
      document.getElementById("emailRegisterOverlay").style.display = "none";
      document.getElementById("lblMaskedEmail").innerText = res.emailMasked;
      document.getElementById("otpVerificationOverlay").style.display = "flex";
      iniciarRelojOTP(300);
      setTimeout(() => document.getElementById("staffOtpCode").focus(), 200);
    } else {
      alert("Error: " + (res ? res.message : "Fallo de conexión"));
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=registrarEmailStaff&user=${encodeURIComponent(window.tempAuthUser)}&email=${encodeURIComponent(emailInput)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.verificarCodigoAcceso = function () {
  if (typeof haptic === "function") haptic();
  const btn = document.getElementById("btnSubmitOtp");
  const codeInput = document.getElementById("staffOtpCode").value.trim();
  const errorToast = document.getElementById("otp-error-toast");

  if (codeInput.length < 6) return;

  btn.disabled = true;
  btn.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle></svg> Validando...`;
  errorToast.style.display = "none";

  const cbName = "cb_verify_otp_" + Date.now();
  window[cbName] = function (res) {
    btn.disabled = false;
    btn.innerText = "Confirmar Acceso";
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      clearInterval(window.otpInterval);

      // LOGUEO MÁSTER COMPLETADO: Destruimos pantallas negras de bloqueo
      document.getElementById("otpVerificationOverlay").style.display = "none";

      const remElement = document.getElementById("rememberMe");
      const rememberMe = remElement ? remElement.checked : false;

      sessionStorage.setItem("active_staff", window.tempAuthUser);
      if (rememberMe)
        localStorage.setItem("cyber_saved_staff", window.tempAuthUser);

      const controlRight = document.getElementById("macControlCenterRight");
      if (controlRight) controlRight.style.display = "flex";

      entrarAlSistema(window.tempAuthUser);
    } else {
      document.getElementById("staffOtpCode").value = "";
      errorToast.innerText = res ? res.message : "Código incorrecto.";
      errorToast.style.display = "block";
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=verificarOTPStaff&user=${encodeURIComponent(window.tempAuthUser)}&code=${encodeURIComponent(codeInput)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};
// =========================================================================
// 🔵 MOTOR: ACCESO DIRECTO OUTLOOK / HOTMAIL
// =========================================================================

window.toggleOutlookDirectPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("outlookDirectOverlay");
  if (overlay) {
    overlay.classList.toggle("open");

    if (overlay.classList.contains("open")) {
      document.getElementById("inputOutlookCorreos").value = "";
      setTimeout(() => {
        document.getElementById("inputOutlookCorreos").focus();
      }, 150);
    }
  }
};

window.abrirVentanaOutlookManual = function () {
  if (typeof haptic === "function") haptic();

  let inputVisual = document.getElementById("inputOutlookCorreos");
  let correoBuscar = inputVisual.value.trim();

  if (correoBuscar === "" || !correoBuscar.includes("@")) {
    alert("⚠️ Por favor ingresa un correo de Outlook o Hotmail válido.");
    inputVisual.focus();
    return;
  }

  window.lanzarPopUpOutlook(correoBuscar);
};

// =========================================================================
// 🔵 MOTOR: ACCESO DIRECTO OUTLOOK / HOTMAIL (SELECTOR DE CUENTAS)
// =========================================================================
window.toggleOutlookDirectPanel = function () {
  if (typeof haptic === "function") haptic();
  if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");

  // 🔥 SOLUCIÓN: Usamos 'prompt=select_account'.
  // Esto obliga a Microsoft a detener el auto-login de tu cuenta personal y te muestra
  // la pantalla de cuentas, donde solo debes darle clic a "Usar otra cuenta".
  let urlOutlook =
    "https://login.live.com/login.srf?wa=wsignin1.0&wreply=https://outlook.live.com/owa/&prompt=select_account";

  // Abre directamente en una nueva pestaña
  window.open(urlOutlook, "_blank");

  // Avisamos en la Isla Dinámica
  if (typeof triggerToast === "function") {
    triggerToast(
      `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-blue); font-weight:700;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        <span>Abriendo Outlook (Clic en "Usar otra cuenta")</span>
      </div>`,
    );
  }
};

// =========================================================================
// 🔥 NUEVA GENERACIÓN DE NETFLIX (VERIFICACIÓN EN VIVO + ALIAS + MEMORIA)
// =========================================================================

window.pinOcultoActual = ""; // Memoria temporal en vivo

window.iniciarCreacionNetflixAlias = function (btn) {
  if (typeof haptic === "function") haptic();

  const contenidoOriginal = btn.innerHTML;
  let pendienteGuardada = localStorage.getItem("cyber_netflix_alias_pendiente");

  // 🛡️ 1. REVISAR SI HAY UNA CUENTA ALIAS PENDIENTE EN MEMORIA
  if (pendienteGuardada) {
    let d = JSON.parse(pendienteGuardada);

    // Ponemos el botón en modo de verificación
    btn.style.pointerEvents = "none";
    btn.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ios-orange)" stroke-width="2.5" style="margin-right:8px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> <span style="color:var(--ios-orange); font-weight:bold;">Verificando estado en Sheets...</span>`;

    const cbCheck = "cb_check_alias_" + Date.now();
    window[cbCheck] = function (res) {
      const node = document.getElementById("node_" + cbCheck);
      if (node) node.remove();
      delete window[cbCheck];

      // 🔍 Evaluamos si la cuenta AÚN EXISTE en PINESMES
      if (res && res.status === "success" && res.existe) {
        // Sí existe: Restauramos
        btn.style.pointerEvents = "auto";
        btn.innerHTML = contenidoOriginal;
        alert(
          "⚠️ Se ha detectado una cuenta de Netflix previamente generada que NO fue guardada.\n\nEl sistema la recuperará obligatoriamente para que finalices el proceso.",
        );
        window.pinOcultoActual = d.pinRefacil;
        window.restaurarInterfazAliasGenerada(d, btn);
      } else {
        // No existe (fue borrada manualmente del Excel): Limpiamos la caché y creamos nueva
        localStorage.removeItem("cyber_netflix_alias_pendiente");
        window.ejecutarGeneracionNuevaCuentaAlias(btn, contenidoOriginal);
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbCheck;
    script.src = `${GOOGLE_SCRIPT_URL}?action=verificarCuentaPines&correo=${encodeURIComponent(d.correo)}&callback=${cbCheck}&_ts=${Date.now()}`;
    document.body.appendChild(script);
    return;
  }

  // 2. SI NO HAY NADA EN MEMORIA, PROCEDE A CREAR DIRECTO
  window.ejecutarGeneracionNuevaCuentaAlias(btn, contenidoOriginal);
};

// -------------------------------------------------------------------------
// Sub-función que aísla la carga de la cuenta nueva
// -------------------------------------------------------------------------
window.ejecutarGeneracionNuevaCuentaAlias = function (btn, contenidoOriginal) {
  if (
    !confirm(
      "❓ ¿Estás seguro de que deseas CREAR UNA CUENTA NUEVA de Netflix?\n\nEl sistema tomará un PIN de REFACIL y un correo de ALIAS.",
    )
  ) {
    btn.style.pointerEvents = "auto";
    btn.innerHTML = contenidoOriginal;
    return;
  }

  btn.style.pointerEvents = "none";
  btn.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:8px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Generando credenciales y asignando PIN...`;

  // Reseteo visual del modal de éxito
  document
    .getElementById("radarVerificacionContenedor")
    .style.setProperty("display", "flex", "important");
  document
    .getElementById("radarVerificacionSpinner")
    .style.setProperty("display", "flex", "important");
  document.getElementById("radarVerificacionSpinner").innerHTML =
    `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Esperando correo '¡Ya casi terminas!' en Gmail...`;

  document
    .getElementById("btnLinkVerificarGmail")
    .style.setProperty("display", "none", "important");
  document
    .getElementById("btnGuardarMaestroNetflix")
    .style.setProperty("display", "none", "important");

  const btnMala = document.getElementById("btnCuentaMalaAlias");
  if (btnMala) btnMala.style.display = "block";

  if (window.verificationLinkInterval)
    clearInterval(window.verificationLinkInterval);

  const cbName = "cb_alias_cta_" + Date.now();
  window[cbName] = function (res) {
    btn.style.pointerEvents = "auto";
    btn.innerHTML = contenidoOriginal;

    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success" && res.data) {
      const d = res.data;
      window.pinOcultoActual = d.pinRefacil;

      // 🔥 GUARDAR EN MEMORIA LOCAL PARA QUE NUNCA SE PIERDA
      localStorage.setItem("cyber_netflix_alias_pendiente", JSON.stringify(d));

      window.restaurarInterfazAliasGenerada(d, btn);
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo del servidor."));
    }
  };

  const empleadoActivo = sessionStorage.getItem("active_staff") || "Admin";
  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=generarNuevaCuentaAlias&user=${encodeURIComponent(empleadoActivo)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};



// Radar DUAL: Busca el "Ya casi terminas" (para el PIN) y "Verifica tu correo" (para el Link)
window.lanzarRadarEspiaAlias = function (correoTarget) {
  if (window.verificationLinkInterval)
    clearInterval(window.verificationLinkInterval);

  window.verificationLinkInterval = setInterval(function () {
    const cbRadarName = "cb_radar_alias_" + Date.now();

    window[cbRadarName] = function (res) {
      const node = document.getElementById("node_" + cbRadarName);
      if (node) node.remove();
      delete window[cbRadarName];

      if (res && res.status === "success") {
        // 1. Mostrar PIN si Netflix envió el "Ya casi terminas"
        if (res.yaCasiTerminas) {
          const pinEl = document.getElementById("displayCtaPinRecarga");
          if (pinEl.innerText !== window.pinOcultoActual) {
            if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");
            pinEl.innerText = window.pinOcultoActual; // Revelamos PIN de Refacil
            pinEl.style.color = "var(--ios-green)";

            document.getElementById("radarVerificacionSpinner").innerHTML =
              `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> PIN Revelado. Esperando link de verificación...`;
          }
        }

        // 2. Mostrar botón de Verificar si Netflix envió el enlace
        if (res.linkVerificacion) {
          clearInterval(window.verificationLinkInterval);
          if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");

          document
            .getElementById("radarVerificacionSpinner")
            .style.setProperty("display", "none", "important");

          const btnLink = document.getElementById("btnLinkVerificarGmail");
          btnLink.href = res.linkVerificacion;
          btnLink.innerHTML = "✉️ Verificar Correo en Netflix";
          btnLink.style.setProperty("display", "inline-flex", "important");

          // 🎯 CANDADO: Solo al verificar se habilita Guardar
          btnLink.onclick = function () {
            if (typeof haptic === "function") haptic();
            document
              .getElementById("btnGuardarMaestroNetflix")
              .style.setProperty("display", "block", "important");

            // Ocultamos el botón de cuenta mala porque ya fue verificada
            const btnMala = document.getElementById("btnCuentaMalaAlias");
            if (btnMala) btnMala.style.display = "none";
          };

          const contenedor = document.getElementById(
            "radarVerificacionContenedor",
          );
          contenedor.style.background = "rgba(48, 209, 88, 0.06)";
          contenedor.style.borderColor = "rgba(48, 209, 88, 0.35)";
        }
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbRadarName;
    script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerEstadoVerificacionAlias&correo=${encodeURIComponent(correoTarget)}&callback=${cbRadarName}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  }, 4000);
};

// 🔥 FUNCIÓN MÁSTER: Pinta la pantalla tanto al crear como al restaurar la memoria
window.restaurarInterfazAliasGenerada = function(d, btnOrigen) {
    document.getElementById("displayCtaCorreo").innerText = d.correo;
    document.getElementById("displayCtaClave").innerText = d.clave;
    
    // Reseteo visual del estado "Esperando"
    document.getElementById("displayCtaPinRecarga").innerText = "Oculto (Esperando a Netflix...)";
    document.getElementById("displayCtaPinRecarga").style.color = "var(--ios-orange)";

    document.getElementById("radarVerificacionContenedor").style.setProperty("display", "flex", "important");
    document.getElementById("radarVerificacionContenedor").style.background = "rgba(255, 159, 10, 0.04)";
    document.getElementById("radarVerificacionContenedor").style.borderColor = "rgba(255, 159, 10, 0.25)";
    
    document.getElementById("radarVerificacionSpinner").style.setProperty("display", "flex", "important");
    document.getElementById("radarVerificacionSpinner").innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Esperando correo '¡Ya casi terminas!' en Gmail...`;
    
    document.getElementById("btnLinkVerificarGmail").style.setProperty("display", "none", "important");
    document.getElementById("btnGuardarMaestroNetflix").style.setProperty("display", "none", "important");
    
    const btnMala = document.getElementById("btnCuentaMalaAlias");
    if (btnMala) btnMala.style.display = "block"; // Habilitamos botón de descartar

    const btnGuardar = document.getElementById("btnGuardarMaestroNetflix");
    btnGuardar.onclick = function () {
        // 🔥 CORRECCIÓN CRÍTICA: Lee SIEMPRE el dato más reciente de la memoria al dar clic
        let datosFrescos = JSON.parse(localStorage.getItem("cyber_netflix_alias_pendiente")) || d;
        datosFrescos.pinRecarga = window.pinOcultoActual; // Le pasamos el PIN real al maestro
        guardarCuentaConfirmadaNetflix(btnGuardar, "Guardar en Inventario Maestro", datosFrescos);
    };

    const modal = document.getElementById("cuentaGeneradaModalOverlay");
    if (modal) modal.classList.add("open");

    // Lanzar el radar Dual
    window.lanzarRadarEspiaAlias(d.correo);
};

// Función para descartar la cuenta y buscar otra (Actualizando la Memoria y UI completas)
window.cambiarCuentaMalaAlias = function() {
    if (!confirm("⚠️ ¿Estás seguro de que esta cuenta no sirve?\n\nSe marcará en ROJO en ALIAS, se borrará de PINESMES y te entregaremos una nueva.")) return;
    
    let correoMalo = document.getElementById("displayCtaCorreo").innerText;
    const btnMala = document.getElementById("btnCuentaMalaAlias");
    btnMala.disabled = true;
    btnMala.innerHTML = "Descartando...";

    const cbName = "cb_mala_" + Date.now();
    window[cbName] = function (res) {
        btnMala.disabled = false;
        btnMala.innerHTML = "❌ Esta cuenta no sirve (Descartar y buscar otra)";
        const scriptNode = document.getElementById("node_" + cbName);
        if (scriptNode) scriptNode.remove();
        delete window[cbName];

        if (res && res.status === "success") {
            // 1. ACTUALIZAR LA MEMORIA LOCAL CON EL NUEVO CORREO Y CLAVE
            let d = JSON.parse(localStorage.getItem("cyber_netflix_alias_pendiente"));
            d.correo = res.correoNuevo;
            d.clave = res.claveNueva; // Recibimos la nueva clave generada en Google Sheets
            localStorage.setItem("cyber_netflix_alias_pendiente", JSON.stringify(d));

            // 2. Actualiza la UI con el correo nuevo y la clave nueva
            document.getElementById("displayCtaCorreo").innerText = res.correoNuevo;
            document.getElementById("displayCtaClave").innerText = res.claveNueva;
            
            // 3. Reinicia el Radar y oculta el PIN de nuevo
            if (window.verificationLinkInterval) clearInterval(window.verificationLinkInterval);
            document.getElementById("displayCtaPinRecarga").innerText = "Oculto (Esperando a Netflix...)";
            document.getElementById("displayCtaPinRecarga").style.color = "var(--ios-orange)";
            
            document.getElementById("radarVerificacionSpinner").innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Esperando correo '¡Ya casi terminas!' en Gmail...`;
            
            window.lanzarRadarEspiaAlias(res.correoNuevo);
        } else {
            alert("❌ Error: " + (res ? res.message : "No se pudo cambiar la cuenta."));
        }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbName;
    const user = sessionStorage.getItem("active_staff") || "Sistema";
    script.src = `${GOOGLE_SCRIPT_URL}?action=cambiarCuentaMalaAlias&correoMalo=${encodeURIComponent(correoMalo)}&user=${encodeURIComponent(user)}&callback=${cbName}&_ts=${Date.now()}`;
    document.body.appendChild(script);
};

// Función maestra de guardado (Elimina la memoria al terminar)
window.guardarCuentaConfirmadaNetflix = function (
  btn,
  contenidoOriginal,
  datosCuenta,
) {
  btn.disabled = true;
  btn.style.pointerEvents = "none";
  btn.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Guardando en Sheets...`;

  const cbName = "cb_save_cta_" + Date.now();
  window[cbName] = function (res) {
    btn.disabled = false;
    btn.style.pointerEvents = "auto";
    btn.innerHTML = "¡Guardado con Éxito!";
    btn.style.background = "var(--ios-green)";

    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      // 🔥 LIBERACIÓN DE MEMORIA: Al guardar con éxito borramos el bloqueo
      localStorage.removeItem("cyber_netflix_alias_pendiente");

      // Cerramos la ventana forzosamente ahora que ya cumplió su deber
      const modal = document.getElementById("cuentaGeneradaModalOverlay");
      if (modal) modal.classList.remove("open");

      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path></svg> <span>Cuenta inyectada al maestro.</span></div>`,
        );
      }
    } else {
      alert(
        "❌ Error al guardar en Sheets: " +
          (res
            ? res.message
            : "Fallo de comunicación. Intenta darle al botón Guardar de nuevo."),
      );
      btn.innerHTML = contenidoOriginal;
      btn.style.background = "";
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  const urlParams =
    `?action=confirmarGuardadoNetflix` +
    `&correo=${encodeURIComponent(datosCuenta.correo)}` +
    `&clave=${encodeURIComponent(datosCuenta.clave)}` +
    `&callback=${cbName}&_ts=${Date.now()}`; // 👈 Ya no se envían los pinesPerfiles
  script.src = GOOGLE_SCRIPT_URL + urlParams;
  document.body.appendChild(script);
};
