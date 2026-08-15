/* ==========================================================================
   🚀 CYBERNET OS - NÚCLEO LÓGICO COMPLETO Y CORREGIDO (VERSIÓN MySQL / PHP)
   Versión: 2.0 | Última actualización: 2024
   ========================================================================== */

// ========================================================================
// 1️⃣ INICIALIZACIÓN GLOBAL Y CONFIGURACIÓN
// ========================================================================

// 🌐 CONFIGURACIÓN CENTRALIZADA
const CYBERNET_CONFIG = {
  // URLs de APIs
  API_BASE_URL: "https://api.cybernetsp.com",
  GOOGLE_SCRIPT_URL:
    "https://script.google.com/macros/s/AKfycbxqKpMcC5BI0H6PHnImu5Lkw3ryiuFO0fW0KJAhQ_45kzglYn9CpN1O2fCjezXM5oMi/exec",

  // Configuración de sesión
  SESSION_TIMEOUT: 1800000, // 30 minutos en ms
  AUTO_SYNC_INTERVAL: 300000, // 5 minutos

  // Plataformas disponibles
  PLATAFORMAS: [
    "NETFLIX",
    "AMAZON-PRIME-VIDEO",
    "APPLE-TV",
    "DISNEY-PREMIUM",
    "HBO-MAX",
    "DISNEY-ESTANDAR",
    "PLEX",
    "CRUNCHYROLL",
    "VIX",
    "UNIVERSAL",
    "PARAMOUNT",
    "DIRECTV-GO",
    "CANVA",
    "CAPCUT",
    "SPOTIFY",
    "YOUTUBE",
    "METEGOL",
    "DEEZER",
    "MUBI",
    "IPTV",
    "FLUJO",
    "EMBY",
  ],

  // Meses del año
  MESES: [
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
  ],
};

// ========================================================================
// 2️⃣ VARIABLES GLOBALES INICIALIZADAS
// ========================================================================

// 📊 Memoria compartida
let memoriaSuspendidas = [];
let memoriaNeyop = [];
let staffTelefonosList = [];

// Corrección: Se eliminó "let" de las variables ancladas a window
window.currentGridStock = [];
window.currentHorasStock = [];
window.cuentasNetflixClienteActivo = [];
window.cuentasCargadasEsteTurno = [];
window.correosGlobalesData = [];
window.stockPlataformasVentas = {};
window.globalFinanzasData = null;

// ⏱️ Estado de timers y sincronización
let isTimerPaused = false;
let timerInterval = null;
let autoHideTimer = null;
let cantidadPagosAnterior = 0;
let contadorFilasVentas = 0;
let searchTimeoutMySQL = null;

// Corrección: Se eliminó "let" 
window.timeoutBusquedaNet = null;
window.islandTimer = null;

// 🎮 Estado de la UI
// Corrección: Se eliminó "let"
window.tablaMySQLActual = "netflix";
window.activePeriod = "mes";
window.vistaModalDb = "PINESMES";
window.isWorkingFinanzas = false;
window.estadoRadarSuspendidas = {};
window.radaresSuspendidas = {};
window.textoSaldoRevendedorGlobal = "";

// 📊 Cache de datos
// CORRECCIÓN: Se eliminó la redeclaración de "globalFinanzasData" y "cantidadPagosAnterior" que causaba un error fatal por estar duplicadas.

// ========================================================================
// 3️⃣ INTERCEPCIÓN DE SESIÓN Y ARRANQUE DEL SISTEMA
// ========================================================================

(function () {
  const usuarioActivoObj = JSON.parse(
    sessionStorage.getItem("usuario_activo") || "null"
  );
  const user = usuarioActivoObj ? usuarioActivoObj.nombre.toUpperCase() : null;
  const rol = usuarioActivoObj ? usuarioActivoObj.rol : null;

  window.addEventListener("DOMContentLoaded", () => {
    let savedTheme = localStorage.getItem("cyber_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    // Si no hay sesión válida, redirigir al login
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // Iniciar el sistema
    entrarAlSistema(user, rol);
  });
})();

// 🟢 FUNCIÓN PRINCIPAL DE ARRANQUE
function entrarAlSistema(usuario, rol) {
  const workspace = document.getElementById("mainWorkspace");
  const globalHeader = document.getElementById("globalHeader");
  const controlPanel = document.getElementById("controlPanel");
  const controlRight = document.getElementById("macControlCenterRight");

  if (workspace) workspace.style.display = "flex";
  if (globalHeader) globalHeader.style.display = "flex";
  if (controlPanel) controlPanel.style.display = "flex";
  if (controlRight) controlRight.style.display = "flex";

  let sessionNameEl = document.getElementById("staffSessionName");
  if (sessionNameEl) sessionNameEl.innerText = usuario;

  // 🔓 BOTÓN INVENTARIO VISIBLE PARA TODOS
  const btnMenuInventario = document.getElementById("menuBtnInventario");
  if (btnMenuInventario) btnMenuInventario.style.display = "inline-block";

  // 🍎 PROTECCIÓN DE CONTROLES SEGÚN ROL
  const shiftTimer = document.getElementById("shiftTimer");
  const btnCajaFinanzas = document.getElementById("btnCajaFinanzas");
  const btnAdelanto = document.getElementById("btnAdelantoCamilo");
  const btnNomina = document.getElementById("btnNominaCamilo");

  if (rol === "superadmin" || usuario === "CAMILO") {
    // 🔓 PERMISOS SUPERADMIN
    if (shiftTimer)
      shiftTimer.style.setProperty("display", "none", "important");
    if (btnCajaFinanzas)
      btnCajaFinanzas.style.setProperty("display", "flex", "important");
    if (btnAdelanto)
      btnAdelanto.style.setProperty("display", "inline-flex", "important");
    if (btnNomina)
      btnNomina.style.setProperty("display", "inline-flex", "important");
  } else {
    // 🔒 PERMISOS ASISTENTE
    if (shiftTimer)
      shiftTimer.style.setProperty("display", "inline-flex", "important");
    if (btnCajaFinanzas)
      btnCajaFinanzas.style.setProperty("display", "none", "important");
    if (btnAdelanto)
      btnAdelanto.style.setProperty("display", "none", "important");
    if (btnNomina) btnNomina.style.setProperty("display", "none", "important");

    iniciarRelojTurno();
  }

  // Cargar datos iniciales
  if (typeof cargarPagosBreB === "function") cargarPagosBreB();
  if (typeof cargarPlantillasDesdeSheets === "function")
    cargarPlantillasDesdeSheets();
  if (typeof cargarStockParaPanelVentas === "function")
    cargarStockParaPanelVentas();
  if (typeof cargarUsuariosSelects === "function") cargarUsuariosSelects();
}

// ========================================================================
// 4️⃣ MOTOR DE SONIDOS Y HÁPTICA
// ========================================================================

window.CyberSonidos = {
  play: function (tipo) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!window.audioCtx) window.audioCtx = new AudioContext();
      if (window.audioCtx.state === "suspended") window.audioCtx.resume();

      const now = window.audioCtx.currentTime;

      const playTone = (freq, type, startTime, duration, vol) => {
        const osc = window.audioCtx.createOscillator();
        const gain = window.audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(window.audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
        return osc;
      };

      // 🎵 Diferentes sonidos
      if (tipo === "click" || tipo === "pop") {
        playTone(850, "sine", now, 0.03, 0.06);
      } else if (tipo === "exito" || tipo === "notif") {
        playTone(1050, "sine", now, 0.12, 0.1);
        playTone(1320, "sine", now + 0.06, 0.25, 0.1);
      } else if (tipo === "abrir") {
        const osc = playTone(400, "sine", now, 0.15, 0.05);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      } else if (tipo === "cerrar") {
        const osc = playTone(800, "sine", now, 0.15, 0.05);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
      } else if (tipo === "error") {
        playTone(200, "square", now, 0.15, 0.08);
        playTone(150, "square", now + 0.15, 0.2, 0.08);
      } else if (tipo === "dinero") {
        playTone(523.25, "sine", now, 0.1, 0.08);
        playTone(659.25, "sine", now + 0.1, 0.1, 0.08);
      }
    } catch (e) {
      console.log("🔇 Sonidos desactivados:", e.message);
    }
  },
};

// 📳 HÁPTICA
window.haptic = function () {
  try {
    if (navigator.vibrate) navigator.vibrate(10);
    window.CyberSonidos.play("click");
  } catch (e) {
    console.error("Error en háptica:", e);
  }
};

// ========================================================================
// 5️⃣ ISLA DINÁMICA (NOTIFICACIONES TOAST STYLE APPLE)
// ========================================================================

function triggerToast(mensajeHtml) {
  const isla = document.getElementById("appleToast");
  if (!isla) return;

  isla.classList.remove("island-active");
  isla.innerHTML = "";

  setTimeout(() => {
    isla.innerHTML = `<div class="island-content-fade">${mensajeHtml}</div>`;
    isla.classList.add("island-active");

    if (typeof CyberSonidos !== "undefined") CyberSonidos.play("pop");
  }, 40);

  clearTimeout(window.islandTimer);
  window.islandTimer = setTimeout(() => {
    isla.classList.remove("island-active");
    setTimeout(() => {
      isla.innerHTML = "";
    }, 400);
  }, 3500);
}

// ========================================================================
// 6️⃣ CONTROL DE VENTANAS (MODALES Y PANELES)
// ========================================================================

function cerrarTodasLasVentanas() {
  const overlays = document.querySelectorAll(".overlay-ios");
  overlays.forEach((overlay) => {
    overlay.classList.remove("open");
    if (overlay.style.display === "flex") overlay.style.display = "none";
  });
}

function cerrarTodasLasAppsActivas() {
  cerrarTodasLasVentanas();
}

function abrirPanel(idPanel) {
  if (typeof haptic === "function") haptic();

  const panel = document.getElementById(idPanel);
  if (!panel) return;

  if (panel.classList.contains("open")) {
    panel.classList.remove("open");
    if (typeof CyberSonidos !== "undefined") CyberSonidos.play("cerrar");
  } else {
    cerrarTodasLasVentanas();
    panel.classList.add("open");
    if (typeof CyberSonidos !== "undefined") CyberSonidos.play("abrir");
  }
}

// 🔗 VINCULACIÓN DE BOTONES A PANELES
window.toggleVentasPanel = () => abrirPanel("ventasOverlay");
window.toggleFinanzasPanel = () => abrirPanel("finanzasOverlay");
window.toggleCargarPanel = () => abrirPanel("cargarOverlay");
window.toggleSuspendidasPanel = () => abrirPanel("suspendidasOverlay");
window.toggleGarantiasPanel = () => abrirPanel("garantiasOverlay");
window.toggleMysqlPanel = () => {
  abrirPanel("mysqlOverlay");
  if (document.getElementById("mysqlOverlay").classList.contains("open"))
    cargarDatosMySQL();
};
window.toggleInventarioPanel = () => abrirPanel("inventarioOverlay");
window.togglePromoPanel = () => abrirPanel("promoOverlay");
window.toggleRecordatoriosPanel = () => abrirPanel("recordatoriosOverlay");
window.abrirCalculadoraCombos = () => abrirPanel("comboCalcOverlay");
window.cerrarCalculadoraCombos = () =>
  document.getElementById("comboCalcOverlay").classList.remove("open");
window.toggleCodesPanel = () => {
  abrirPanel("codesOverlay");
  const overlay = document.getElementById("codesOverlay");
  if (overlay && overlay.classList.contains("open")) {
    cargarBandejaCodigosMySQL();
  }
};
window.toggleAnaCodesPanel = () => abrirPanel("anaCodesOverlay");
window.toggleChayoPanel = () => abrirPanel("chayoOverlay");
window.toggleYopmailPanel = () => {
  abrirPanel("yopmailOverlay");
  const input = document.getElementById("inputYopmailCorreos");
  if (input) input.focus();
};
window.toggleGmailPanel = () => abrirPanel("gmailOverlay");

// ========================================================================
// 7️⃣ WIDGET PAGOS BRE-B EN VIVO
// ========================================================================

function filtrarPagosEnVivo() {
  const texto = document.getElementById("breb-buscador").value.toLowerCase();
  const tarjetas = document.querySelectorAll("#breb-lista .breb-card");

  tarjetas.forEach((tarjeta) => {
    const contenido = tarjeta.innerText.toLowerCase();
    tarjeta.style.display = contenido.includes(texto) ? "flex" : "none";
  });
  iniciarAutoOcultado();
}

function mostrarWidgetBreB() {
  document.getElementById("btn-expand-breb").style.display = "none";
  document.getElementById("breb-widget").style.transform = "translateX(0)";
  document.getElementById("breb-widget").style.display = "flex";

  establecerFechaHoy();
  cargarPagosBreB();
  iniciarAutoOcultado();
}

function ocultarWidgetBreB() {
  document.getElementById("breb-widget").style.transform = "translateX(-350px)";
  setTimeout(() => {
    document.getElementById("btn-expand-breb").style.display = "flex";
  }, 300);

  if (autoHideTimer) {
    clearTimeout(autoHideTimer);
    autoHideTimer = null;
  }
}

function iniciarAutoOcultado() {
  if (autoHideTimer) clearTimeout(autoHideTimer);
  autoHideTimer = setTimeout(() => {
    ocultarWidgetBreB();
  }, 60000);
}

function forzarActualizacionBreB() {
  const icono = document.getElementById("icon-refresh-breb");
  if (icono) icono.classList.add("spin-breb-anim");
  cargarPagosBreB();
  iniciarAutoOcultado();
}

function alCambiarFechaBreB() {
  cargarPagosBreB();
  iniciarAutoOcultado();
}

function establecerFechaHoy() {
  const inputFecha = document.getElementById("breb-fecha");
  if (inputFecha && !inputFecha.value) {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    inputFecha.value = `${yyyy}-${mm}-${dd}`;
  }
}

function cargarPagosBreB() {
  const contenedor = document.getElementById("breb-lista");
  if (!contenedor) return;

  contenedor.innerHTML = `<div style="color: #0a84ff; width: 100%; text-align: center; font-size: 13px; padding: 40px 0;">Buscando pagos en Base de Datos...</div>`;

  const buscador = document.getElementById("breb-buscador");
  if (buscador) buscador.value = "";

  // 📡 CONSULTA A PHP
  fetch(`${CYBERNET_CONFIG.API_BASE_URL}/obtener_pagos_breb.php`)
    .then((res) => res.json())
    .then((data) => {
      const icono = document.getElementById("icon-refresh-breb");
      if (icono) icono.classList.remove("spin-breb-anim");

      contenedor.innerHTML = "";

      if (data.status === "success" && data.data.length > 0) {
        if (
          cantidadPagosAnterior > 0 &&
          data.data.length > cantidadPagosAnterior
        ) {
          if (typeof CyberSonidos !== "undefined")
            CyberSonidos.play("dinero");
        }
        cantidadPagosAnterior = data.data.length;

        data.data.forEach((pago) => {
          const nombreMayusculas = pago.nombre
            ? pago.nombre.toUpperCase()
            : "CLIENTE DESCONOCIDO";
          contenedor.innerHTML += `
            <div class="breb-card">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #30d158; font-weight: 800; font-size: 17px;">+$${pago.valor || "0"}</span>
                <span style="color: rgba(255,255,255,0.7); font-size: 10px; background: rgba(0,0,0,0.3); padding: 3px 6px; border-radius: 6px;">${pago.hora || ""}</span>
              </div>
              <div style="color: #ffffff; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; text-transform: uppercase !important;">
                👤 ${nombreMayusculas}
              </div>
              <div style="color: rgba(255,255,255,0.4); font-size: 11px; margin-top: 2px;">
                📅 ${pago.fecha || ""}
              </div>
            </div>
          `;
        });
      } else {
        contenedor.innerHTML = `<div style="color: rgba(255,255,255,0.5); width: 100%; text-align: center; font-size: 12px; padding: 30px 0;">No se detectaron pagos hoy.</div>`;
      }
    })
    .catch((err) => {
      const icono = document.getElementById("icon-refresh-breb");
      if (icono) icono.classList.remove("spin-breb-anim");
      contenedor.innerHTML = `<div style="color: #ff453a; width: 100%; text-align: center; font-size: 12px; padding: 20px 0;">❌ Error conectando a MySQL.</div>`;
      console.error("Error en cargarPagosBreB:", err);
    });
}

// ========================================================================
// 8️⃣ MODAL EDITAR MySQL
// ========================================================================

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

    // Guardar correo anterior
    let idCorreoAnterior = document.getElementById("editMySQLCorreoAnterior");
    if (!idCorreoAnterior) {
      idCorreoAnterior = document.createElement("input");
      idCorreoAnterior.type = "hidden";
      idCorreoAnterior.id = "editMySQLCorreoAnterior";
      const targetForm =
        document.getElementById("formEditarMySQL") ||
        document.querySelector("#modalEditarMySQL form") ||
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

    // 🛠️ Crear o reubicar contenedor de campos de pago
    let contenedorCamposPago = document.getElementById("editMySQLExtraPagoFields");
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

    // 📍 UBICACIÓN ESTRICTA: Insertar por encima de los botones
    const formTarget =
      document.getElementById("formEditarMySQL") ||
      document.querySelector("#modalEditarMySQL form") ||
      document.getElementById("modalEditarMySQL");

    if (formTarget) {
      const btnSubmit =
        document.getElementById("btnGuardarEditarMySQL") ||
        formTarget.querySelector("button[type='submit']");
      let filaBotones = btnSubmit ? btnSubmit.parentElement : null;

      if (filaBotones && filaBotones !== formTarget && filaBotones.contains(btnSubmit)) {
        formTarget.insertBefore(contenedorCamposPago, filaBotones);
      } else if (btnSubmit) {
        formTarget.insertBefore(contenedorCamposPago, btnSubmit);
      } else {
        formTarget.appendChild(contenedorCamposPago);
      }
    }

    // Cargar datos de pago
    const elFechaPago = document.getElementById("editMySQLFechaPago");
    const elValor = document.getElementById("editMySQLValor");
    const elPago = document.getElementById("editMySQLPago");

    if (elFechaPago) elFechaPago.value = fila.fecha || "";
    if (elValor) elValor.value = fila.valor || "";
    if (elPago) elPago.value = fila.pago || "";

    // Mostrar campos solo en las tablas que los necesitan
    const tablaActual = (window.tablaMySQLActual || "").toLowerCase();
    if (tablaActual === "netflix" || tablaActual === "registro_ventas") {
      contenedorCamposPago.style.display = "flex";
    } else {
      contenedorCamposPago.style.display = "none";
    }

    const inputs = [iCorreo, iClave, iPerfil, iPin, iVenc, iNombre, iNumero];
    inputs.forEach((inp) => {
      if (inp) {
        inp.readOnly = false;
        inp.style.opacity = "1";
        inp.style.cursor = "text";
      }
    });

    const modal = document.getElementById("modalEditarMySQL");
    if (modal) {
      modal.style.display = "flex";
      modal.classList.add("open");
    }
  } catch (err) {
    console.error("Error al abrir modal de edición:", err);
    if (typeof triggerToast === "function") {
      triggerToast(`<div style="color: var(--ios-red);">❌ Error: ${err.message}</div>`);
    }
  }
};

// 💾 GUARDAR EDICIÓN
window.guardarEdicionMySQL = function (e) {
  if (e) e.preventDefault();
  if (typeof haptic === "function") haptic();

  const btn =
    document.getElementById("btnGuardarEditarMySQL") ||
    document.querySelector("#modalEditarMySQL button[type='submit']");
  if (btn) btn.disabled = true;

  const correoAnteriorInput = document.getElementById("editMySQLCorreoAnterior");
  const iFechaPago = document.getElementById("editMySQLFechaPago");
  const iValor = document.getElementById("editMySQLValor");
  const iPago = document.getElementById("editMySQLPago");

  const formData = new FormData();
  formData.append("accion", "editar");
  formData.append("tabla", window.tablaMySQLActual);
  formData.append("id", document.getElementById("editMySQLId").value);
  formData.append(
    "correo_anterior",
    correoAnteriorInput ? correoAnteriorInput.value : ""
  );
  formData.append(
    "correo",
    document.getElementById("editMySQLCorreo").value.trim()
  );
  formData.append(
    "clave",
    document.getElementById("editMySQLClave").value.trim()
  );
  formData.append(
    "perfil",
    document.getElementById("editMySQLPerfil").value.trim()
  );
  formData.append("pin", document.getElementById("editMySQLPin").value.trim());
  formData.append(
    "vencimiento",
    document.getElementById("editMySQLVencimiento").value.trim()
  );
  formData.append(
    "nombre",
    document.getElementById("editMySQLNombre").value.trim()
  );
  formData.append(
    "numero",
    document.getElementById("editMySQLNumero").value.trim()
  );

  // Enviar campos de pago adicionales
  formData.append("fecha", iFechaPago ? iFechaPago.value.trim() : "");
  formData.append("valor", iValor ? iValor.value.trim() : "");
  formData.append("pago", iPago ? iPago.value.trim() : "");

  fetch(`${CYBERNET_CONFIG.API_BASE_URL}/acciones_mysql.php`, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (btn) btn.disabled = false;

      if (data.status === "success") {
        const modal = document.getElementById("modalEditarMySQL");
        if (modal) {
          modal.style.display = "none";
          modal.classList.remove("open");
        }
        cargarDatosMySQL();

        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>${data.message}</span></div>`
          );
        }
      } else {
        if (typeof triggerToast === "function") {
          triggerToast(`<div style="color: var(--ios-red);">❌ Error: ${data.message}</div>`);
        }
      }
    })
    .catch((err) => {
      if (btn) btn.disabled = false;
      console.error("Error en guardarEdicionMySQL:", err);
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="color: var(--ios-red);">❌ Error al guardar edición.</div>`
        );
      }
    });
};

// Cierre automático de menús al presionar escape
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    cerrarTodasLasVentanas();
  }
});

// ========================================================================
// 9️⃣ CONTROL DEL CRONÓMETRO DE TURNOS
// ========================================================================

function iniciarRelojTurno() {
  if (!sessionStorage.getItem("cyber_shift_start_time")) {
    sessionStorage.setItem("cyber_shift_start_time", Date.now());
  }

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(function () {
    if (isTimerPaused) return;

    let startTime = parseInt(
      sessionStorage.getItem("cyber_shift_start_time") || Date.now()
    );
    let elapsed = Date.now() - startTime;
    let totalSeconds = Math.floor(elapsed / 1000);

    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    let hStr = String(hours).padStart(2, "0");
    let mStr = String(minutes).padStart(2, "0");
    let sStr = String(seconds).padStart(2, "0");

    let stElement = document.getElementById("shiftTimer");
    if (stElement) stElement.innerText = hStr + ":" + mStr + ":" + sStr;
  }, 1000);
}

// ========================================================================
// 🔟 CARGAR PLANTILLAS DESDE MYSQL
// ========================================================================

function cargarPlantillasDesdeSheets() {
  const container = document.getElementById("grid-container");
  if (container) {
    container.innerHTML =
      '<div class="empty-log-msg" style="grid-column: 1 / -1; width: 100%; text-align: center; margin-top: 40px;">Sincronizando mensajes desde MySQL...</div>';
  }

  fetch(`${CYBERNET_CONFIG.API_BASE_URL}/obtener_plantillas.php`)
    .then((res) => res.json())
    .then((res) => {
      if (res && res.status === "success") {
        const data = res.data;
        let plantillaPagos = null;
        let plantillaNequi = null;
        window.currentGridStock = [];

        data.forEach((item) => {
          const tituloUP = item.titulo.toUpperCase();
          if (tituloUP === "PAGOS") {
            plantillaPagos = item;
          } else if (tituloUP === "NEQUI") {
            plantillaNequi = item;
          } else {
            window.currentGridStock.push(item);
          }
        });

        const headerContainer = document.getElementById("header-container");
        if (headerContainer && plantillaPagos) {
          let textoPagosSeguro = encodeURIComponent(
            plantillaPagos.texto || ""
          ).replace(/'/g, "%27");

          let btnNequiHtml = "";
          if (plantillaNequi) {
            let textoNequiSeguro = encodeURIComponent(
              plantillaNequi.texto || ""
            ).replace(/'/g, "%27");

            btnNequiHtml = `
              <button class="btn-ios w-100" 
                      style="padding: 14px !important; font-size: 0.85rem !important; font-weight: 800 !important; border-radius: 12px !important; background: rgba(255, 255, 255, 0.08) !important; color: var(--text-primary) !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; transition: all 0.2s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important; cursor: pointer;" 
                      onclick="window.copiarPlantillaGlobal(this, '${textoNequiSeguro}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                COPIAR NEQUI
              </button>
            `;
          }

          headerContainer.innerHTML = `
            <div class="card-ios w-100" style="max-width: 440px; align-items: center; gap: 12px; padding: 20px;">
              <img src="${plantillaPagos.imagenUrl}" alt="QR" 
                   onclick="window.copiarImagenQRPagos(this, '${plantillaPagos.imagenUrl}')"
                   style="max-width:210px; width:100%; border-radius:16px; border: 2px solid transparent; box-shadow:var(--glass-shadow); padding:5px; background:white; margin:0 auto; cursor: pointer; transition: all 0.2s;"
                   onmouseover="this.style.transform='scale(1.05)'"
                   onmouseout="this.style.transform='scale(1)'"
                   title="Haz clic para copiar la imagen del QR">
              <span class="text-secondary text-center" style="font-size:0.75rem; font-weight:500; margin-top: -4px;">
                (Haz clic sobre el QR para copiar la imagen)
              </span>
              <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 4px;">
                <button class="btn-ios w-100" 
                        style="padding: 14px !important; font-size: 0.85rem !important; font-weight: 800 !important; border-radius: 12px !important; background: rgba(255, 255, 255, 0.08) !important; color: var(--text-primary) !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; transition: all 0.2s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important; cursor: pointer;" 
                        onclick="window.copiarPlantillaGlobal(this, '${textoPagosSeguro}')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  COPIAR PAGOS (BRE-B)
                </button>
                ${btnNequiHtml}
              </div>
            </div>
          `;
        }

        renderGrid("");
      } else {
        if (container)
          container.innerHTML =
            '<div class="empty-log-msg" style="color:var(--ios-red); grid-column: 1 / -1; width: 100%; text-align: center; margin-top: 40px;">❌ Error al descargar plantillas desde MySQL.</div>';
      }
    })
    .catch((err) => {
      if (container)
        container.innerHTML =
          '<div class="empty-log-msg" style="color:var(--ios-red); grid-column: 1 / -1; width: 100%; text-align: center; margin-top: 40px;">❌ Error de conexión con el servidor PHP.</div>';
      console.error("Error en cargarPlantillasDesdeSheets:", err);
    });
}

// 🔍 RENDERIZADO DE GRID
function renderGrid(filtro = "") {
  const gridContainer = document.getElementById("grid-container");
  const emptyState = document.getElementById("macEmptyState");

  if (!gridContainer || !window.currentGridStock) return;

  gridContainer.innerHTML = "";

  let filtrados = window.currentGridStock.filter(
    (item) =>
      item.titulo &&
      item.titulo.toLowerCase().includes(filtro.toLowerCase())
  );

  if (emptyState) {
    if (filtrados.length === 0 && filtro !== "") {
      emptyState.style.display = "flex";
      emptyState.querySelector("span").innerText = `No se encontraron plantillas con "${filtro}".`;
    } else if (window.currentGridStock.length > 0) {
      emptyState.style.display = "none";
    }
  }

  gridContainer.style.cssText =
    "display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; width: 100%; align-content: start;";

  if (filtrados.length === 0) return;

  filtrados.forEach((currentItem) => {
    const card = document.createElement("div");
    card.className = "card-ios";
    card.style.cssText =
      "display: flex !important; flex-direction: column !important; justify-content: space-between !important; height: 100% !important; padding: 18px !important; background: rgba(255, 255, 255, 0.02) !important; border: 1px solid rgba(255, 255, 255, 0.06) !important; border-radius: 16px !important; margin: 0 !important; box-sizing: border-box !important; min-height: 120px;";

    let tituloLimpio = currentItem.titulo ? currentItem.titulo.trim() : "";
    let tituloSeguro =
      tituloLimpio !== "" ? tituloLimpio : "Plantilla Sin Nombre";

    const divHeader = document.createElement("div");
    divHeader.style.cssText =
      "margin-bottom: 14px; flex-grow: 1; display: flex; flex-direction: column; justify-content: flex-start;";
    divHeader.innerHTML = `<h2 class="card-title" style="margin: 0; font-size: 0.95rem; font-weight: 800; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.4;">${tituloSeguro}</h2>`;

    const btnCopiar = document.createElement("button");
    btnCopiar.className = "btn-ios w-100";
    btnCopiar.style.cssText =
      "margin-top: auto !important; padding: 12px !important; background: rgba(255, 255, 255, 0.08) !important; color: var(--text-primary) !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; border-radius: 12px !important; font-weight: 800 !important; font-size: 0.85rem !important; transition: all 0.2s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important; cursor: pointer;";
    btnCopiar.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> COPIAR TEXTO`;

    btnCopiar.onclick = function () {
      let textoReal = currentItem.texto || "";
      window.copiarPlantillaDirecta(this, textoReal);
    };

    card.appendChild(divHeader);
    card.appendChild(btnCopiar);
    gridContainer.appendChild(card);
  });
}

// =========================================================================
// 🔍 FILTRADOR EN VIVO
// =========================================================================

window.filtrarTarjetasMac = function () {
  const input = document.getElementById("macSearchCards");
  const filtro = input ? input.value.trim() : "";
  renderGrid(filtro);
};

// ========================================================================
// 1️⃣1️⃣ MOTOR NATIVO: COPIAR PLANTILLAS Y CÓDIGO QR
// ========================================================================

// 1. FUNCIÓN MAESTRA PARA TEXTOS DINÁMICOS
window.copiarPlantillaDirecta = function (btn, textoReal) {
  if (typeof haptic === "function") haptic();

  const animarExito = () => {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡COPIADO!`;
    btn.style.setProperty("background", "#30d158", "important");
    btn.style.setProperty("color", "#ffffff", "important");
    btn.style.setProperty("border-color", "#30d158", "important");
    btn.style.setProperty("transform", "scale(1.05)", "important");

    const card = btn.closest(".card-ios");
    if (card) {
      card.style.setProperty("border-color", "#30d158", "important");
      card.style.setProperty(
        "box-shadow",
        "0 0 20px rgba(48, 209, 88, 0.4)",
        "important"
      );
    }

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>¡Texto copiado al portapapeles!</span></div>`
      );
    }

    setTimeout(function () {
      btn.innerHTML = originalHTML;
      btn.style.setProperty(
        "background",
        "rgba(255, 255, 255, 0.08)",
        "important"
      );
      btn.style.setProperty("color", "var(--text-primary)", "important");
      btn.style.setProperty(
        "border-color",
        "rgba(255, 255, 255, 0.15)",
        "important"
      );
      btn.style.setProperty("transform", "scale(1)", "important");

      if (card) {
        card.style.setProperty(
          "border-color",
          "rgba(255, 255, 255, 0.06)",
          "important"
        );
        card.style.setProperty("box-shadow", "none", "important");
      }
    }, 1500);
  };

  // INTENTO 1: API Moderna
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(textoReal)
      .then(animarExito)
      .catch(() => usarFallbackCopiado());
  } else {
    // INTENTO 2: Fallback
    usarFallbackCopiado();
  }

  function usarFallbackCopiado() {
    const textarea = document.createElement("textarea");
    textarea.value = textoReal;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand("copy");
      animarExito();
    } catch (err) {
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="color: var(--ios-red);">Tu navegador bloqueó la copia automática.</div>`
        );
      }
    }
    document.body.removeChild(textarea);
  }
};

// 2. COPIAR PLANTILLA GLOBAL
window.copiarPlantillaGlobal = function (btn, textoCodificado) {
  if (typeof haptic === "function") haptic();

  const textoReal = decodeURIComponent(textoCodificado);

  const animarExito = () => {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡COPIADO!`;
    btn.style.setProperty("background", "#30d158", "important");
    btn.style.setProperty("color", "#ffffff", "important");
    btn.style.setProperty("border-color", "#30d158", "important");
    btn.style.setProperty("transform", "scale(1.05)", "important");

    const card = btn.closest(".card-ios");
    if (card) {
      card.style.setProperty("border-color", "#30d158", "important");
      card.style.setProperty(
        "box-shadow",
        "0 0 20px rgba(48, 209, 88, 0.4)",
        "important"
      );
    }

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>¡Texto copiado al portapapeles!</span></div>`
      );
    }

    setTimeout(function () {
      btn.innerHTML = originalHTML;
      btn.style.setProperty(
        "background",
        "rgba(255, 255, 255, 0.08)",
        "important"
      );
      btn.style.setProperty("color", "var(--text-primary)", "important");
      btn.style.setProperty(
        "border-color",
        "rgba(255, 255, 255, 0.15)",
        "important"
      );
      btn.style.setProperty("transform", "scale(1)", "important");

      if (card) {
        card.style.setProperty(
          "border-color",
          "rgba(255, 255, 255, 0.06)",
          "important"
        );
        card.style.setProperty("box-shadow", "none", "important");
      }
    }, 1500);
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(textoReal)
      .then(animarExito)
      .catch(() => usarFallbackCopiado());
  } else {
    usarFallbackCopiado();
  }

  function usarFallbackCopiado() {
    const textarea = document.createElement("textarea");
    textarea.value = textoReal;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand("copy");
      animarExito();
    } catch (err) {
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="color: var(--ios-red);">Tu navegador bloqueó la copia.</div>`
        );
      }
    }
    document.body.removeChild(textarea);
  }
};

// 3. COPIAR IMAGEN QR
window.copiarImagenQRPagos = function (imgElement, urlImagen) {
  if (typeof haptic === "function") haptic();

  imgElement.style.transform = "scale(0.95)";
  imgElement.style.opacity = "0.6";

  try {
    const imgObj = new Image();
    imgObj.crossOrigin = "anonymous";
    imgObj.src = urlImagen;

    imgObj.onload = function () {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = imgObj.width;
        canvas.height = imgObj.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(imgObj, 0, 0);

        canvas.toBlob(async function (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);

            imgElement.style.transform = "scale(1.05)";
            imgElement.style.opacity = "1";
            imgElement.style.borderColor = "var(--ios-green)";

            if (typeof triggerToast === "function") {
              triggerToast(
                `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>¡Imagen copiada! (Ctrl + V para pegar)</span></div>`
              );
            }
            if (typeof window.CyberSonidos !== "undefined")
              window.CyberSonidos.play("exito");

            setTimeout(() => {
              imgElement.style.transform = "scale(1)";
              imgElement.style.borderColor = "transparent";
            }, 1200);
          } catch (err) {
            lanzarErrorCopia(imgElement);
          }
        }, "image/png");
      } catch (err) {
        lanzarErrorCopia(imgElement);
      }
    };

    imgObj.onerror = function () {
      lanzarErrorCopia(imgElement);
    };
  } catch (error) {
    lanzarErrorCopia(imgElement);
  }
};

function lanzarErrorCopia(imgElement) {
  console.error("El navegador bloqueó la API del portapapeles.");
  imgElement.style.transform = "scale(1)";
  imgElement.style.opacity = "1";
  if (typeof triggerToast === "function") {
    triggerToast(
      `<div style="color: var(--ios-red);">Tu navegador bloqueó la copia de imágenes automáticamente. Usa clic derecho → 'Copiar imagen'.</div>`
    );
  }
}

// ========================================================================
// 1️⃣2️⃣ BANDEJA DE CÓDIGOS DESDE GMAIL
// ========================================================================

function cargarBandejaCodigosMySQL() {
  const contenedor = document.getElementById("codesScrollArea");
  if (!contenedor) return;

  contenedor.innerHTML =
    '<div style="text-align: center; color: var(--ios-orange); padding: 20px;">Buscando códigos en Gmail...</div>';

  fetch(`${CYBERNET_CONFIG.API_BASE_URL}/obtener_codigos.php`)
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success") {
        if (res.data.length === 0) {
          contenedor.innerHTML =
            '<div style="text-align: center; color: var(--text-secondary); padding: 30px;">No hay códigos recientes en la última hora.</div>';
          return;
        }

        let html = "";
        res.data.forEach((item) => {
          const msjSeguro = encodeURIComponent(item.copiadoRapido || "").replace(
            /'/g,
            "%27"
          );

          html += `
            <div class="card-ios" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 16px; border-radius: 14px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: ${item.colorText}; font-weight: 800; font-size: 0.9rem;">● ${item.plataforma}</span>
                <span style="color: var(--text-secondary); font-size: 0.75rem;">${item.hora}</span>
              </div>
              <div style="font-size: 0.8rem; color: var(--text-secondary);">CLIENTE: <strong style="color: #fff; font-family: monospace;">${item.correo}</strong></div>
              <div style="font-size: 0.8rem; color: var(--text-secondary);">ACCIÓN: ${item.accion}</div>
              <div style="font-size: 0.85rem; color: #fff;">CÓDIGO / ENLACE: <span style="color: var(--ios-red); font-weight: 900; font-size: 1.1rem; font-family: monospace; background: rgba(0,0,0,0.4); padding: 2px 8px; border-radius: 6px;">${item.codigoLink}</span></div>
              <button class="btn-ios w-100" onclick="window.copiarPlantillaGlobal(this, '${msjSeguro}')" style="margin-top: 6px; padding: 10px; background: rgba(255,255,255,0.08); font-weight: 800; font-size: 0.8rem; border-radius: 10px; cursor: pointer; color: #fff; border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; gap: 6px;">
                📋 COPIAR MENSAJE
              </button>
            </div>
          `;
        });

        contenedor.innerHTML = html;
      } else {
        contenedor.innerHTML = `<div style="text-align: center; color: var(--ios-red); padding: 20px;">Error: ${res.message}</div>`;
      }
    })
    .catch((err) => {
      contenedor.innerHTML =
        '<div style="text-align: center; color: var(--ios-red); padding: 20px;">❌ Error de conexión con el servidor PHP.</div>';
      console.error("Error en cargarBandejaCodigosMySQL:", err);
    });
}

window.toggleCodesPanel = () => {
  abrirPanel("codesOverlay");
  const overlay = document.getElementById("codesOverlay");
  if (overlay && overlay.classList.contains("open")) {
    cargarBandejaCodigosMySQL();
  }
};

window.cargarBandejaCodigosMySQL = function () {
  const contenedor = document.getElementById("codesScrollArea");
  if (!contenedor) return;

  contenedor.innerHTML =
    '<div style="text-align: center; color: var(--ios-orange); padding: 40px;"><svg class="spin-anim" width="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:12px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg><br><span style="font-weight: 600;">Sincronizando bandeja de Gmail...</span></div>';

  fetch(`${CYBERNET_CONFIG.API_BASE_URL}/obtener_codigos.php`)
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success") {
        if (res.data.length === 0) {
          contenedor.innerHTML =
            '<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-weight: 600;">No hay códigos recientes en la última hora.</div>';
          return;
        }

        let html = "";
        res.data.forEach((item) => {
          let safeCopiedText = encodeURIComponent(
            item.copiadoRapido || ""
          ).replace(/'/g, "%27");

          html += `
            <div class="card-ios" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 18px; border-radius: 16px; margin-bottom: 0px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: ${item.colorText}; box-shadow: 0 0 10px ${item.colorText};"></span>
                  <span style="color: var(--text-primary); font-weight: 800; font-size: 0.95rem; text-transform: uppercase; letter-spacing: -0.3px;">${item.plataforma}</span>
                </div>
                <span style="color: var(--text-secondary); font-size: 0.75rem; font-family: monospace; font-weight: 600;">${item.hora}</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 8px; padding: 2px 0;">
                <div style="display: flex; align-items: baseline; gap: 8px;">
                  <span style="font-size: 0.78rem; color: var(--text-secondary); min-width: 105px; flex-shrink: 0; text-transform: uppercase; font-weight: 600; letter-spacing: 0.3px;">CLIENTE:</span>
                  <span style="font-size: 0.88rem; color: var(--text-primary); font-weight: 600; font-family: monospace;">${item.correo}</span>
                </div>
                <div style="display: flex; align-items: baseline; gap: 8px;">
                  <span style="font-size: 0.78rem; color: var(--text-secondary); min-width: 105px; flex-shrink: 0; text-transform: uppercase; font-weight: 600; letter-spacing: 0.3px;">ACCIÓN:</span>
                  <span style="font-size: 0.85rem; color: var(--text-primary); font-weight: 500;">${item.accion}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                  <span style="font-size: 0.78rem; color: var(--text-secondary); min-width: 105px; flex-shrink: 0; text-transform: uppercase; font-weight: 600; letter-spacing: 0.3px;">CÓDIGO:</span>
                  <span style="font-size: 1.15rem; color: ${item.colorText}; font-weight: 800; font-family: monospace; background: rgba(255, 255, 255, 0.03); padding: 4px 14px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.06); letter-spacing: 1px;">${item.codigoLink}</span>
                </div>
              </div>

              <button class="btn-ios w-100" onclick="window.copiarPlantillaGlobal(this, '${safeCopiedText}')" style="padding: 12px; background: rgba(255,255,255,0.05); font-weight: 800; font-size: 0.85rem; border-radius: 12px; cursor: pointer; color: var(--text-primary); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s ease;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                COPIAR MENSAJE
              </button>
            </div>
          `;
        });

        contenedor.innerHTML = html;
      } else {
        contenedor.innerHTML = `<div style="text-align: center; color: var(--ios-red); padding: 20px; font-weight: bold;">Error: ${res.message}</div>`;
      }
    })
    .catch((err) => {
      contenedor.innerHTML =
        '<div style="text-align: center; color: var(--ios-red); padding: 20px; font-weight: bold;">❌ Error de conexión con PHP (obtener_codigos.php no responde).</div>';
      console.error("Error en cargarBandejaCodigosMySQL:", err);
    });
};

window.filtrarCodigosInternos = function () {
  const query = document
    .getElementById("searchCodesInput")
    .value.toLowerCase()
    .trim();
  const cards = document.querySelectorAll("#codesScrollArea .card-ios");

  for (let i = 0; i < cards.length; i++) {
    let card = cards[i];
    card.style.display = card.innerText.toLowerCase().includes(query)
      ? "flex"
      : "none";
  }
};

// ========================================================================
// 1️⃣3️⃣ MÓDULO ANA CODES
// ========================================================================

window.toggleAnaCodesPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("anaCodesOverlay");
  const iframe = document.getElementById("iframeAnaCodes");

  if (!overlay) return;

  if (overlay.classList.contains("open")) {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    cerrarTodasLasVentanas();
    overlay.classList.add("open");
    overlay.style.display = "flex";
    if (iframe && (iframe.src === "about:blank" || iframe.src === "")) {
      iframe.src = "https://correos.tkdjgz.com/";
    }
  }
};

// ========================================================================
// 1️⃣4️⃣ BÓVEDA CHAYO
// ========================================================================

let cronometroChayo = null;

window.toggleChayoPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("chayoOverlay");
  const iframe = document.getElementById("iframeChayo");
  const barra = document.getElementById("barraCredencialesChayo");
  const botonVer = document.getElementById("btnVerDatosChayo");

  if (!overlay) return;

  if (overlay.classList.contains("open")) {
    overlay.classList.remove("open");
    overlay.style.display = "none";
    if (cronometroChayo) clearInterval(cronometroChayo);
    if (barra) barra.style.setProperty("display", "none", "important");
    if (botonVer) {
      botonVer.disabled = false;
      botonVer.style.opacity = "1";
      botonVer.innerText = "Ver datos de ingresos";
    }
  } else {
    cerrarTodasLasVentanas();
    overlay.classList.add("open");
    overlay.style.display = "flex";
    if (iframe && (iframe.src === "about:blank" || iframe.src === "")) {
      iframe.src = "https://chayonet.github.io/tienda/";
    }
  }
};

window.revelarDatosChayoTemporizados = function () {
  if (typeof haptic === "function") haptic();
  const barra = document.getElementById("barraCredencialesChayo");
  const botonVer = document.getElementById("btnVerDatosChayo");

  if (barra) {
    barra.style.setProperty("display", "flex", "important");
    barra.style.maxHeight = "80px";
    barra.style.opacity = "1";
  }

  if (botonVer) {
    botonVer.disabled = true;
    let segundos = 10;
    botonVer.innerText = `Ocultando en ${segundos}s...`;

    if (cronometroChayo) clearInterval(cronometroChayo);
    cronometroChayo = setInterval(() => {
      segundos--;
      if (segundos > 0) {
        botonVer.innerText = `Ocultando en ${segundos}s...`;
      } else {
        clearInterval(cronometroChayo);
        if (barra) barra.style.setProperty("display", "none", "important");
        botonVer.disabled = false;
        botonVer.innerText = "Ver datos de ingresos";
      }
    }, 1000);
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

    if (tipo === "clave") {
      setTimeout(() => {
        const barra = document.getElementById("barraCredencialesChayo");
        if (barra && barra.style.display !== "none") {
          barra.style.setProperty("display", "none", "important");
          if (typeof triggerToast === "function") {
            triggerToast(
              "🔓 Acceso completado. Maximizando visualización."
            );
          }
        }
      }, 3000);
    }
  });
};

// ========================================================================
// 1️⃣5️⃣ YOPMAIL
// ========================================================================

window.toggleYopmailPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("yopmailOverlay");
  if (!overlay) return;

  if (overlay.classList.contains("open")) {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    cerrarTodasLasVentanas();
    overlay.classList.add("open");
    overlay.style.display = "flex";
    const input = document.getElementById("inputYopmailCorreos");
    if (input) {
      input.value = "";
      setTimeout(() => input.focus(), 150);
    }
  }
};

window.abrirVentanaYopmail = function () {
  if (typeof haptic === "function") haptic();
  const input = document.getElementById("inputYopmailCorreos");
  if (!input || !input.value.trim()) {
    if (typeof triggerToast === "function") {
      triggerToast("⚠️ Ingresa un correo de Yopmail.");
    }
    return;
  }
  let correo = input.value
    .trim()
    .toLowerCase()
    .replace("@yopmail.com", "");
  window.open(`https://yopmail.com/es/?login=${correo}`, "_blank");
};

window.buscarYopmailDirecto = function (correoPrefix) {
  if (typeof haptic === "function") haptic();
  let correo = correoPrefix.replace("@yopmail.com", "");
  window.open(`https://yopmail.com/es/?login=${correo}`, "_blank");
};

// ========================================================================
// 1️⃣6️⃣ INVENTARIO/STOCK
// ========================================================================

window.toggleInventarioPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("inventarioOverlay");
  if (!overlay) return;

  if (
    overlay.classList.contains("open") ||
    overlay.style.display === "flex"
  ) {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    cerrarTodasLasVentanas();
    overlay.classList.add("open");
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    cargarInventarioStockMySQL();
  }
};

function cargarInventarioStockMySQL() {
  const contenedor = document.getElementById("panelSwitchesStock");
  if (!contenedor) return;

  const usuarioActivoObj = JSON.parse(
    sessionStorage.getItem("usuario_activo") || "null"
  );
  const user = usuarioActivoObj ? usuarioActivoObj.nombre.toUpperCase() : null;
  const rol = usuarioActivoObj ? usuarioActivoObj.rol : null;
  const esAdmin = rol === "superadmin" || user === "CAMILO";

  contenedor.innerHTML =
    '<div style="grid-column: 1 / -1; text-align: center; color: var(--ios-blue); padding: 30px;"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg><br><span style="margin-top:8px; display:inline-block; font-weight:600;">Consultando inventario en MySQL...</span></div>';

  fetch(`${CYBERNET_CONFIG.API_BASE_URL}/obtener_inventario_stock.php`)
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success") {
        let html = "";
        res.data.forEach((item) => {
          const isChecked = item.activo === 1 ? "checked" : "";
          const switchColor = item.activo === 1 ? "#30d158" : "#ff453a";
          const isDisabled = esAdmin ? "" : "disabled";
          const cursorStyle = esAdmin
            ? "cursor: pointer;"
            : "cursor: not-allowed; opacity: 0.5;";

          html += `
            <div class="card-ios" style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 16px; margin: 0;">
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-weight: 800; font-size: 0.92rem; color: var(--text-primary);">${item.nombre}</span>
                <span style="font-size: 0.78rem; font-family: monospace; font-weight: 600; color: ${item.libres > 0 ? "rgba(255,255,255,0.6)" : "#ff453a"};">
                  (${item.libres} libres)
                </span>
              </div>

              <label class="ios-switch-label" style="position: relative; display: inline-block; width: 50px; height: 28px; ${cursorStyle}">
                <input type="checkbox" ${isChecked} ${isDisabled} onchange="cambiarEstadoPlataformaMySQL('${item.id}', this)" style="opacity: 0; width: 0; height: 0;">
                <span class="ios-switch-slider" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: ${switchColor}; transition: .3s; border-radius: 30px;"></span>
              </label>
            </div>
          `;
        });

        contenedor.innerHTML = html;
      } else {
        contenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--ios-red); padding: 20px;">Error: ${res.message}</div>`;
      }
    })
    .catch((err) => {
      contenedor.innerHTML =
        '<div style="grid-column: 1 / -1; text-align: center; color: var(--ios-red); padding: 20px;">❌ Error conectando a MySQL.</div>';
      console.error("Error en cargarInventarioStockMySQL:", err);
    });
}

function cambiarEstadoPlataformaMySQL(idPlataforma, inputElem) {
  const usuarioActivoObj = JSON.parse(
    sessionStorage.getItem("usuario_activo") || "null"
  );
  const user = usuarioActivoObj
    ? usuarioActivoObj.nombre.toUpperCase()
    : null;
  const rol = usuarioActivoObj ? usuarioActivoObj.rol : null;

  if (rol !== "superadmin" && user !== "CAMILO") {
    if (typeof haptic === "function") haptic();
    inputElem.checked = !inputElem.checked;
    if (typeof triggerToast === "function") {
      triggerToast(
        "⛔ Solo el administrador Camilo puede modificar las plataformas."
      );
    }
    return;
  }

  if (typeof haptic === "function") haptic();

  const nuevoEstado = inputElem.checked ? 1 : 0;
  const slider = inputElem.nextElementSibling;

  if (slider) {
    slider.style.backgroundColor = nuevoEstado === 1 ? "#30d158" : "#ff453a";
  }

  const formData = new FormData();
  formData.append("plataforma", idPlataforma);
  formData.append("activo", nuevoEstado);

  fetch(`${CYBERNET_CONFIG.API_BASE_URL}/guardar_estado_plataforma.php`, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        if (typeof triggerToast === "function") {
          const estadoTxt = nuevoEstado === 1 ? "Encendida" : "Apagada";
          triggerToast(`⚙️ Plataforma <b>${estadoTxt}</b> en tienda.`);
        }
      } else {
        inputElem.checked = !inputElem.checked;
        if (slider) {
          slider.style.backgroundColor = inputElem.checked
            ? "#30d158"
            : "#ff453a";
        }
        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="color: var(--ios-red);">❌ No se pudo cambiar el estado.</div>`
          );
        }
      }
    })
    .catch((err) => {
      inputElem.checked = !inputElem.checked;
      if (slider) {
        slider.style.backgroundColor = inputElem.checked
          ? "#30d158"
          : "#ff453a";
      }
      console.error("Error en cambiarEstadoPlataformaMySQL:", err);
    });
}

// ========================================================================
// 1️⃣7️⃣ VISOR MAESTRO DE MySQL (NETFLIX, GARANTÍAS, VENTAS)
// ========================================================================

window.tablaMySQLActual = "netflix";
let searchTimeoutMySQL = null;

window.toggleMysqlPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("mysqlOverlay");
  if (!overlay) return;

  if (
    overlay.classList.contains("open") ||
    overlay.style.display === "flex"
  ) {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    cerrarTodasLasVentanas();
    overlay.classList.add("open");
    overlay.style.setProperty("display", "flex", "important");
    overlay.style.setProperty("align-items", "center", "important");
    overlay.style.setProperty("justify-content", "center", "important");

    const usuarioActivoObj = JSON.parse(
      sessionStorage.getItem("usuario_activo") || "{}"
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

window.cambiarTablaMySQL = function (nombreTabla, btnElement) {
  if (typeof haptic === "function") haptic();
  window.tablaMySQLActual = nombreTabla;

  document
    .querySelectorAll(".mysql-tab-btn")
    .forEach((b) => b.classList.remove("active"));
  if (btnElement) {
    btnElement.classList.add("active");
  }

  cargarDatosMySQL();
};

window.filtrarMySQL = function () {
  clearTimeout(searchTimeoutMySQL);
  searchTimeoutMySQL = setTimeout(() => {
    cargarDatosMySQL();
  }, 300);
};

// 🗄️ RENDERIZADO VISUAL ESTILO CYBERNET
window.cargarDatosMySQL = function () {
  const thead = document.getElementById("tablaMySQLCabecera");
  const tbody = document.getElementById("tablaMySQLCuerpo");
  if (!tbody || !thead) return;

  const tableNode = thead.closest("table");
  if (tableNode && tableNode.parentElement) {
    tableNode.parentElement.style.overflowX = "auto";
  }

  // Inyección de estilos CSS para sticky header
  if (!document.getElementById("css-sticky-hover-mysql")) {
    const styleSticky = document.createElement("style");
    styleSticky.id = "css-sticky-hover-mysql";
    styleSticky.innerHTML = `
      #tablaMySQLCabecera th {
        position: sticky !important;
        top: 0 !important;
        z-index: 100 !important;
        background-color: #121317 !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.8) !important;
        white-space: nowrap !important;
      }
      .tr-mysql-row { 
        background-color: #111216 !important; 
        transition: background 0.2s ease !important; 
      }
      .tr-mysql-row:hover { 
        background-color: rgba(255, 255, 255, 0.04) !important; 
      }
      .tr-mysql-row.tr-caida {
        background-color: rgba(255, 0, 0, 0.12) !important;
      }
      .tr-mysql-row.tr-caida:hover { 
        background-color: rgba(255, 0, 0, 0.22) !important; 
      }
      
      table {
        border-collapse: separate !important;
        border-spacing: 0 !important;
        table-layout: fixed !important;
        width: 100% !important;
        min-width: 1350px !important;
        background-color: #111216 !important;
      }
    `;
    document.head.appendChild(styleSticky);
  }

  const thBase =
    "padding: 12px 10px; font-weight: 800; text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.5px;";

  const tablaActualLower = (window.tablaMySQLActual || "").toLowerCase();
  const esVentas = tablaActualLower === "registro_ventas";
  const esGarantias = tablaActualLower === "garantias";
  const esNetflix = tablaActualLower === "netflix";

  // Encabezados con anchos estrictos
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
        </svg>
        Consultando BD...
      </td>
    </tr>
  `;

  fetch(
    `${CYBERNET_CONFIG.API_BASE_URL}/obtener_tabla_mysql.php?tabla=${encodeURIComponent(window.tablaMySQLActual)}&busqueda=${encodeURIComponent(busqueda)}`
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
          // Renderizar filas...
          let dataOrdenada = data.data;
          let fechaGrupoActual = null;

          const svgCopyIcon = (datoEscapado) => {
            return `
              <button onclick="copiarTextoUnico(this, '${datoEscapado}')" style="background: transparent; border: none; color: #71717a; cursor: pointer; padding: 2px 4px; display: inline-flex; align-items: center; transition: color 0.2s ease; flex-shrink: 0;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#71717a'" title="Copiar al portapapeles">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            `;
          };

          const usuarioActivoObj = JSON.parse(
            sessionStorage.getItem("usuario_activo") || "{}"
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
              if (correoVal.includes("VTA:") || correoVal.includes("RENO:")) {
                perfilVal = "1";
              } else {
                perfilVal = "-";
              }
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

            // Banner divisor azul por fecha
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
                      <div style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">
                        🗓️ CUENTAS DEL: ${diaVal}
                      </div>
                      ${esSuperAdmin ? `<button onclick="eliminarFechaMySQL('${encodeURIComponent(diaVal)}')" style="background: rgba(255, 69, 58, 0.12); border: 1px solid rgba(255, 69, 58, 0.25); color: #ff453a; padding: 4px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease;">🗑️ Borrar Fecha</button>` : ""}
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

            if (platFormat === "NETFLIX") {
              textoCopiarFicha += `⚠️ *Para iniciar sesión:* Cuando te pida un código, selecciona *Obtener ayuda* y después *Usar contraseña*.\n\n`;
            }

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
            ) {
              textoCopiarFicha += `🌐 *${etiquetaPerfil}:* ${perfilVal}\n`;
            }
            if (platFormat === "EMBY") {
              textoCopiarFicha += `🔌 *Puerto:* Dejar vacío\n`;
            }
            if (pinVal !== "-" && pinVal !== "") {
              textoCopiarFicha += `📍 *PIN:* ${pinVal}\n`;
            }
            if (vencVal !== "-" && vencVal !== "") {
              textoCopiarFicha += `📅 *Vence:* ${vencVal}\n\n🤖 *¿NECESITAS UN CÓDIGO?* Puedes usar nuestra pagina para codigos disponible 24/7: www.cybernetsp.com/\n`;
            }

            textoCopiarFicha += `\n📢 *INFORMACIÓN IMPORTANTE:* \n────────────────────\n⚠️ *Garantía activa:* Tu servicio cuenta con respaldo total durante su vigencia. \n🆘 *Soporte:* Si presentas algún inconveniente, *infórmanos de inmediato* para brindarte una solución rápida.\n\n💎 *Disfruta tu servicio.*\n✨ *¡Gracias por elegirnos!* ✨`;

            let textoEscapadoFicha = encodeURIComponent(textoCopiarFicha);

            let platReporte = fila.plataforma ? fila.plataforma : platFormat;
            let textoReporte = `🚨 *REPORTE DE PROBLEMA*\n📺 *Plataforma:* ${platReporte}\n📧 *Correo:* ${correoVal}\n🔑 *Clave:* ${claveVal}\n👤 *Proveedor:* ${provVal}\n📅 *Fecha Compra:* ${diaVal}`;
            let safeReporte = encodeURIComponent(textoReporte);
            let filaJsonEscapada = encodeURIComponent(
              JSON.stringify(fila)
            ).replace(/'/g, "%27");

            let celdaCorreo =
              correoVal !== "-"
                ? `<div style="display: flex; align-items: center; justify-content: flex-start; gap: 6px; width: 100%;">
                   <span style="color: #ffffff; font-family: monospace; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;" title="${correoVal}">${correoVal}</span>
                   ${svgCopyIcon(encodeURIComponent(correoVal))}
                 </div>`
                : '<span style="color: #a1a1aa;">-</span>';

            let celdaClave =
              claveVal !== "-"
                ? `<div style="display: flex; align-items: center; justify-content: flex-start; gap: 6px; width: 100%;">
                   <span style="color: #30d158; font-family: monospace; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;" title="${claveVal}">${claveVal}</span>
                   ${svgCopyIcon(encodeURIComponent(claveVal))}
                 </div>`
                : '<span style="color: #30d158; font-weight: 700;">-</span>';

            let celdaVencimiento =
              vencVal !== "-"
                ? `<span style="color: #ff9500; font-weight: 800; font-family: monospace; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;" title="${vencVal}">${vencVal}</span>`
                : '<span style="color: #a1a1aa;">-</span>';

            let celdaTelefonoContent = "";
            if (numeroVal === "-" || numeroVal.trim() === "") {
              celdaTelefonoContent = `<button onclick="abrirModalEditarMySQL('${filaJsonEscapada}')" title="Agregar Teléfono" style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: var(--ios-green); padding: 4px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>`;
            } else {
              celdaTelefonoContent = `<span style="font-family: monospace; color: #ffffff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;" title="${numeroVal}">${numeroVal}</span>`;
            }

            let botonesEdicionIzquierda = "";
            if (numeroVal !== "-" && numeroVal.trim() !== "") {
              botonesEdicionIzquierda = `
                <button onclick="abrirModalEditarMySQL('${filaJsonEscapada}')" title="Editar" style="background: rgba(10, 132, 255, 0.12); border: 1px solid rgba(10, 132, 255, 0.25); border-radius: 6px; padding: 5px; color: #0a84ff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                <button onclick="eliminarRegistroMySQL(${fila.id}, '${encodeURIComponent(correoVal)}')" title="Eliminar" style="background: rgba(255, 69, 58, 0.12); border: 1px solid rgba(255, 69, 58, 0.25); border-radius: 6px; padding: 5px; color: #ff453a; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
              `;
            }

            let botonCopiar = `<button onclick="copiarAccesoMySQL(this, '${textoEscapadoFicha}')" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; padding: 5px 12px; border-radius: 8px; font-size: 0.72rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">📋 Copiar</button>`;

            let botonPasarHoy = esSuperAdmin
              ? `<button onclick="pasarRegistroAHoyMySQL(${fila.id}, '${encodeURIComponent(correoVal)}')" title="Pasar a hoy" style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; padding: 5px 8px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">📅 Hoy</button>`
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
                ? `<button onclick="generarTemp(this, ${fila.id})" style="background: rgba(255, 159, 10, 0.15); border: 1px solid rgba(255, 159, 10, 0.3); color: #ff9f0a; padding: 5px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">⏳ Temp</button>`
                : "";

              let botonEstado = isCaida
                ? `<button onclick="abrirModalResolverGarantia('${fila.id}', '${encodeURIComponent(correoVal)}', '${window.tablaMySQLActual}')" style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; padding: 5px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">✔️ Resolver</button>`
                : `<button onclick="marcarComoGarantia(${fila.id}, '${encodeURIComponent(correoVal)}', '${encodeURIComponent(claveVal)}', '${encodeURIComponent(provVal)}', '${encodeURIComponent(diaVal)}')" style="background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.25); color: #ff453a; padding: 5px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">🚨 Reportar</button>`;

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
      console.error("Error en cargarDatosMySQL:", err);
    });
};

// 📋 COPIAR ACCESO COMPLETO
window.copiarAccesoMySQL = function (btn, textoEscapado) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(textoEscapado);

  navigator.clipboard.writeText(texto).then(() => {
    let oldText = btn.innerHTML;

    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copiado`;
    btn.style.setProperty("background", "var(--ios-green)", "important");
    btn.style.setProperty("color", "#ffffff", "important");
    btn.style.setProperty("border-color", "transparent", "important");

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Copiado al portapapeles</span></div>`
      );
    }

    setTimeout(() => {
      btn.innerHTML = oldText;
      btn.style.setProperty(
        "background",
        "rgba(255, 255, 255, 0.08)",
        "important"
      );
      btn.style.setProperty("color", "#ffffff", "important");
      btn.style.setProperty(
        "border-color",
        "rgba(255, 255, 255, 0.15)",
        "important"
      );
    }, 1500);
  });
};

// 📋 COPIAR DATOS AISLADOS
window.copiarTextoUnico = function (btn, textoEscapado) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(textoEscapado);

  navigator.clipboard.writeText(texto).then(() => {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#30d158" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Dato copiado al portapapeles</span></div>`
      );
    }

    setTimeout(() => {
      btn.innerHTML = originalHTML;
    }, 1500);
  });
};

// ⏳ GENERAR TEMP
window.generarTemp = function (btn, id) {
  if (typeof haptic === "function") haptic();

  const urlPHP = `${CYBERNET_CONFIG.API_BASE_URL}/obtener_tabla_mysql.php?tabla=${encodeURIComponent(window.tablaMySQLActual)}`;
  fetch(urlPHP)
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success" && data.data) {
        let filaEncontrada = data.data.find(
          (f) => parseInt(f.id) === parseInt(id)
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
              btn.style.setProperty(
                "background",
                "#30d158",
                "important"
              );
              btn.style.setProperty(
                "color",
                "#000000",
                "important"
              );
              btn.style.setProperty(
                "border-color",
                "transparent",
                "important"
              );

              setTimeout(() => {
                btn.innerHTML = oldText;
                btn.style.setProperty(
                  "background",
                  "rgba(255, 159, 10, 0.15)",
                  "important"
                );
                btn.style.setProperty(
                  "color",
                  "#ff9f0a",
                  "important"
                );
                btn.style.setProperty(
                  "border-color",
                  "rgba(255, 159, 10, 0.3)",
                  "important"
                );
              }, 1500);
            }

            if (typeof triggerToast === "function") {
              triggerToast(
                `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Cuenta temporal copiada al portapapeles</span></div>`
              );
            }
          });
        }
      }
    });
};

window.abrirModalAgregarMySQL = function () {
  if (typeof haptic === "function") haptic();
  const form = document.getElementById("formAgregarMySQL");
  if (form) form.reset();

  const selectPlat = document.getElementById("addMySQLPlataforma");
  if (selectPlat) {
    selectPlat.value = window.tablaMySQLActual;
  }

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
    if (typeof triggerToast === "function") {
      triggerToast(
        "⚠️ Pega primero los datos de Google Sheets en el recuadro."
      );
    }
    return;
  }

  btn.disabled = true;
  btn.innerText = "Subiendo...";

  const formData = new FormData();
  formData.append("accion", "agregar");
  formData.append("tabla", plataforma);
  formData.append("bloque_cuentas", bloque);

  fetch(`${CYBERNET_CONFIG.API_BASE_URL}/acciones_mysql.php`, {
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
        if (typeof triggerToast === "function") {
          triggerToast(`<div style="color: var(--ios-red);">❌ ${data.message}</div>`);
        }
      }
    })
    .catch((err) => {
      btn.disabled = false;
      btn.innerText = "Subir a MySQL";
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="color: var(--ios-red);">❌ Error al conectar con el servidor.</div>`
        );
      }
      console.error("Error en guardarNuevoRegistroMySQL:", err);
    });
};

window.cerrarModalEditarMySQL = function () {
  if (typeof haptic === "function") haptic();
  const modal = document.getElementById("modalEditarMySQL");
  if (modal) modal.style.display = "none";
};

// 🗑️ ELIMINACIÓN MASIVA POR CORREO
window.eliminarRegistroMySQL = function (id, correoEscapado = "") {
  if (
    !confirm(
      "⚠️ ¿Estás seguro de borrar esta cuenta?\n\nSe eliminarán TODOS los perfiles asociados a este mismo correo en la tabla."
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

  fetch(`${CYBERNET_CONFIG.API_BASE_URL}/acciones_mysql.php`, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        cargarDatosMySQL();
        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>${data.message}</span></div>`
          );
        }
      } else {
        if (typeof triggerToast === "function") {
          triggerToast(`<div style="color: var(--ios-red);">❌ Error: ${data.message}</div>`);
        }
      }
    })
    .catch((err) => {
      console.error("Error en eliminarRegistroMySQL:", err);
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="color: var(--ios-red);">❌ Error de comunicación al intentar eliminar.</div>`
        );
      }
    });
};

window.eliminarFechaMySQL = function (diaEscapado) {
  const diaValor = decodeURIComponent(diaEscapado);
  if (
    !confirm(
      `⚠️ ¿Estás seguro de que deseas eliminar TODOS los registros del día '${diaValor}' en la tabla '${window.tablaMySQLActual}'?`
    )
  )
    return;

  if (typeof haptic === "function") haptic();

  const formData = new FormData();
  formData.append("accion", "eliminar_fecha");
  formData.append("tabla", window.tablaMySQLActual);
  formData.append("dia_valor", diaValor);

  fetch(`${CYBERNET_CONFIG.API_BASE_URL}/acciones_mysql.php`, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        cargarDatosMySQL();
        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>${data.message}</span></div>`
          );
        }
      } else {
        if (typeof triggerToast === "function") {
          triggerToast(`<div style="color: var(--ios-red);">❌ ${data.message}</div>`);
        }
      }
    })
    .catch((err) => {
      console.error("Error en eliminarFechaMySQL:", err);
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="color: var(--ios-red);">❌ Error al procesar la eliminación por fecha.</div>`
        );
      }
    });
};

// ========================================================================
// 1️⃣8️⃣ MARCAR COMO GARANTÍA
// ========================================================================

window.marcarComoGarantia = function (
  id,
  correoEscapado,
  claveEscapada,
  provEscapado,
  diaEscapado = ""
) {
  if (
    !confirm(
      "⚠️ ¿Estás seguro de enviar esta cuenta a Garantías? Toda la cuenta se marcará como caída (rojo)."
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

  fetch(`${CYBERNET_CONFIG.API_BASE_URL}/acciones_mysql.php`, {
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
        cargarDatosMySQL();
        if (typeof triggerToast === "function")
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:#ff453a;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg> <span>${data.message}</span></div>`
          );
      } else {
        if (typeof triggerToast === "function") {
          triggerToast(`<div style="color: var(--ios-red);">❌ Error: ${data.message}</div>`);
        }
      }
    })
    .catch((err) => {
      console.error("Error en marcarComoGarantia:", err);
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="color: var(--ios-red);">❌ Error de comunicación.</div>`
        );
      }
    });
};

// ========================================================================
// 1️⃣9️⃣ RESOLUCIÓN DE GARANTÍAS
// ========================================================================

window.abrirModalResolverGarantia = function (id, correoViejoEscapado, plataforma) {
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

  fetch(`${CYBERNET_CONFIG.API_BASE_URL}/acciones_mysql.php`, {
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
        cerrarModalResolverMySQL();
        cargarDatosMySQL();

        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>${data.message}</span></div>`
          );
        }
      } else {
        if (typeof triggerToast === "function") {
          triggerToast(`<div style="color: var(--ios-red);">❌ Error: ${data.message}</div>`);
        }
      }
    })
    .catch((err) => {
      btn.disabled = false;
      btn.innerHTML = "Guardar y Resolver";
      console.error("Error en guardarResolucionMySQL:", err);
      if (typeof triggerToast === "function") {
        triggerToast(`<div style="color: var(--ios-red);">❌ ${err.message}</div>`);
      }
    });
};

// ========================================================================
// 2️⃣0️⃣ MOVER REGISTRO AL DÍA DE HOY (SUPERADMIN)
// ========================================================================

window.pasarRegistroAHoyMySQL = function (id, correoEscapado = "") {
  if (typeof haptic === "function") haptic();
  const correo = correoEscapado ? decodeURIComponent(correoEscapado) : "";

  const formData = new FormData();
  formData.append("accion", "pasar_a_hoy");
  formData.append("tabla", window.tablaMySQLActual);
  formData.append("id", id);
  formData.append("correo", correo);

  fetch(`${CYBERNET_CONFIG.API_BASE_URL}/acciones_mysql.php`, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        cargarDatosMySQL();
        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>${data.message}</span></div>`
          );
        }
      } else {
        if (typeof triggerToast === "function") {
          triggerToast(`<div style="color: var(--ios-red);">❌ Error: ${data.message}</div>`);
        }
      }
    })
    .catch((err) => {
      console.error("Error en pasarRegistroAHoyMySQL:", err);
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="color: var(--ios-red);">❌ Error de comunicación al mover la fecha.</div>`
        );
      }
    });
};

/* ========================================================================
   ⭐ FUNCIONES STUB / STUBS PARA MÉTODOS FALTANTES
   ======================================================================== */

// Stubs para funciones que se llaman pero no existen
window.convertirFechaAObjetoLupa = function (fechaStr) {
  try {
    return new Date(fechaStr).getTime();
  } catch (e) {
    return Date.now();
  }
};

window.copiarDatoCargaIndividual = function (btn, textoEsc) {
  window.copiarPlantillaGlobal(btn, textoEsc);
};

window.calcularDescuentoDeuda = function () {
  // Stub para calcular descuentos
  console.log("✓ calcularDescuentoDeuda ejecutado");
};

// ========================================================================
// 🚀 INICIALIZACIÓN FINAL
// ========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Inyectar estilos CSS necesarios
  if (!document.getElementById("cyber-custom-styles")) {
    const style = document.createElement("style");
    style.id = "cyber-custom-styles";
    style.innerHTML = `
      .cyber-custom-scroll {
        scrollbar-width: thin;
        scrollbar-color: rgba(255,255,255,0.2) transparent;
      }
      .cyber-custom-scroll::-webkit-scrollbar {
        width: 6px;
      }
      .cyber-custom-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      .cyber-custom-scroll::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.2);
        border-radius: 3px;
      }
      .cyber-custom-scroll::-webkit-scrollbar-thumb:hover {
        background: rgba(255,255,255,0.4);
      }
      
      .spin-anim {
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .island-content-fade {
        animation: fadeIn 0.3s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  // Inicializar sistema si está en DOMContentLoaded
  if (typeof construirSelectores === "function") {
    window.setTimeout(() => construirSelectores(), 500);
  }
});

console.log("✅ Cybernet OS Dashboard - JS Completo Cargado (v2.0)");
