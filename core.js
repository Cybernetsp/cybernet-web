/* ==========================================================================
   🚀 CYBERNET OS - NÚCLEO LÓGICO Y CONTROL DE INTERFAZ (core.js)
   ========================================================================== */

// 🔗 URL OFICIAL DE GOOGLE APPS SCRIPT PARA PINESMES Y NEYOP
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxqKpMcC5BI0H6PHnImu5Lkw3ryiuFO0fW0KJAhQ_45kzglYn9CpN1O2fCjezXM5oMi/exec";

// 1. INTERCEPTOR DE SESIÓN Y ARRANQUE DEL SISTEMA
(function () {
  const usuarioActivoObj = JSON.parse(
    sessionStorage.getItem("usuario_activo") || "null",
  );

  // Soporta tanto 'usuario_activo' como 'active_staff' o 'cyber_saved_staff'
  const sessionStaff = sessionStorage.getItem("active_staff");
  const localStaff = localStorage.getItem("cyber_saved_staff");

  const user = usuarioActivoObj
    ? usuarioActivoObj.nombre.toUpperCase()
    : sessionStaff || localStaff || null;

  const rol = usuarioActivoObj ? usuarioActivoObj.rol : "asistente";

  window.addEventListener("DOMContentLoaded", () => {
    let savedTheme = localStorage.getItem("cyber_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    entrarAlSistema(user, rol);
  });
})();

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

  // 🔓 BOTÓN INVENTARIO VISIBLE PARA TODOS LOS USUARIOS
  const btnMenuInventario = document.getElementById("menuBtnInventario");
  if (btnMenuInventario) btnMenuInventario.style.display = "inline-block";

  // 🍎 PROTECCIÓN DE CONTROLES CONTABLES Y TURNOS
  const shiftTimer = document.getElementById("shiftTimer");
  const btnCajaFinanzas = document.getElementById("btnCajaFinanzas");
  const btnAdelanto = document.getElementById("btnAdelantoCamilo");
  const btnNomina = document.getElementById("btnNominaCamilo");

  if (rol === "superadmin" || usuario === "CAMILO") {
    // 🔓 PERMISOS SUPERADMIN: Enciende módulos contables, apaga reloj
    if (shiftTimer)
      shiftTimer.style.setProperty("display", "none", "important");
    if (btnCajaFinanzas)
      btnCajaFinanzas.style.setProperty("display", "flex", "important");
    if (btnAdelanto)
      btnAdelanto.style.setProperty("display", "inline-flex", "important");
    if (btnNomina)
      btnNomina.style.setProperty("display", "inline-flex", "important");
  } else {
    // 🔒 PERMISOS ASISTENTE: Enciende reloj, oculta contabilidad
    if (shiftTimer)
      shiftTimer.style.setProperty("display", "inline-flex", "important");
    if (btnCajaFinanzas)
      btnCajaFinanzas.style.setProperty("display", "none", "important");
    if (btnAdelanto)
      btnAdelanto.style.setProperty("display", "none", "important");
    if (btnNomina) btnNomina.style.setProperty("display", "none", "important");

    if (typeof iniciarRelojTurno === "function") iniciarRelojTurno();
  }

  // Llamadas a módulos externos (protegidas por typeof para no romper si cargan después)
  if (typeof cargarPagosBreB === "function") cargarPagosBreB();
  if (typeof cargarPlantillasDesdeSheets === "function")
    cargarPlantillasDesdeSheets();
}

/* ==========================================================================
   🔊 MOTOR DE SONIDOS Y HÁPTICA 
   ========================================================================== */
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

      if (tipo === "click" || tipo === "pop")
        playTone(850, "sine", now, 0.03, 0.06);
      else if (tipo === "exito" || tipo === "notif") {
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
      }
    } catch (e) {
      console.log("Sonidos desactivados.");
    }
  },
};

window.haptic = function () {
  if (navigator.vibrate) navigator.vibrate(10);
  window.CyberSonidos.play("click");
};

/* ==========================================================================
   📱 ISLA DINÁMICA DE APPLE (NOTIFICACIONES TOAST - VERSIÓN UPGRADE)
   ========================================================================== */
window.triggerToast = function (mensajeHtml) {
  const isla = document.getElementById("appleToast");
  if (!isla) return;

  // 1. Limpiar estados anteriores de golpe
  isla.classList.remove("island-active");
  isla.innerHTML = "";

  // 2. Pequeño delay para permitir el reinicio físico y brote elástico
  setTimeout(() => {
    isla.innerHTML = `
      <div style="opacity: 1 !important; visibility: visible !important; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; padding: 0 15px; color: #ffffff; font-size: 0.9rem; font-weight: 600; animation: fadeIn 0.3s ease forwards;">
        ${mensajeHtml}
      </div>
    `;
    isla.classList.add("island-active");
    if (typeof CyberSonidos !== "undefined") CyberSonidos.play("pop");
  }, 40);

  // 3. Temporizador de Auto-Cierre
  clearTimeout(window.islandTimer);
  window.islandTimer = setTimeout(() => {
    isla.classList.remove("island-active");
    setTimeout(() => {
      isla.innerHTML = "";
    }, 400);
  }, 3500);
};

/* ==========================================================================
   🗂️ CONTROL DE VENTANAS (MODALES Y PANELES)
   ========================================================================== */
function cerrarTodasLasVentanas() {
  const overlays = document.querySelectorAll(".overlay-ios");
  overlays.forEach((overlay) => {
    overlay.classList.remove("open");
    if (overlay.style.display === "flex") overlay.style.display = "none";
  });
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

// Cierre automático de menús al presionar escape
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    cerrarTodasLasVentanas();
  }
});

// ==========================================================================
// 🔗 VINCULACIÓN GLOBAL DE BOTONES A PANELES HTML
// (Estas funciones mapean el HTML con los paneles)
// ==========================================================================
window.toggleVentasPanel = () => abrirPanel("ventasOverlay");
window.toggleFinanzasPanel = () => abrirPanel("finanzasOverlay");
window.toggleCargarPanel = () => abrirPanel("cargarOverlay");
window.toggleSuspendidasPanel = () => abrirPanel("suspendidasOverlay");
window.toggleGarantiasPanel = () => abrirPanel("garantiasOverlay");

window.toggleMysqlPanel = () => {
  abrirPanel("mysqlOverlay");
  const panel = document.getElementById("mysqlOverlay");
  if (
    panel &&
    panel.classList.contains("open") &&
    typeof cargarDatosMySQL === "function"
  ) {
    cargarDatosMySQL();
  }
};

window.toggleInventarioPanel = () => abrirPanel("inventarioOverlay");
window.togglePromoPanel = () => abrirPanel("promoOverlay");
window.toggleRecordatoriosPanel = () => abrirPanel("recordatoriosOverlay");

window.abrirCalculadoraCombos = () => abrirPanel("comboCalcOverlay");
window.cerrarCalculadoraCombos = () => {
  const panel = document.getElementById("comboCalcOverlay");
  if (panel) panel.classList.remove("open");
};

window.toggleCodesPanel = () => abrirPanel("codesOverlay");
window.toggleAnaCodesPanel = () => abrirPanel("anaCodesOverlay");
window.toggleChayoPanel = () => abrirPanel("chayoOverlay");
window.toggleGmailPanel = () => abrirPanel("gmailOverlay");

window.toggleYopmailPanel = () => {
  abrirPanel("yopmailOverlay");
  const input = document.getElementById("inputYopmailCorreos");
  if (input) setTimeout(() => input.focus(), 150);
};
