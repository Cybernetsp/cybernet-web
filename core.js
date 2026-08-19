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
    verificarModulosSuperAdmin(user, rol);
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

  // Llamadas a módulos externos (protegidas por typeof para no romper si cargan después)
  if (typeof cargarPagosBreB === "function") cargarPagosBreB();
  if (typeof cargarPlantillasDesdeSheets === "function")
    cargarPlantillasDesdeSheets();
}

// 🔒 GESTIÓN DE PERMISOS PARA SUPERADMIN (CAMILO)
function verificarModulosSuperAdmin(usuario, rol) {
  const shiftTimer = document.getElementById("shiftTimer");
  const btnCajaFinanzas = document.getElementById("btnCajaFinanzas");
  const btnAdelanto = document.getElementById("btnAdelantoCamilo");
  const btnNomina = document.getElementById("btnNominaCamilo");
  const btnPrecios = document.getElementById("menuBtnPrecios");

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

    // Habilita el botón de precios
    if (btnPrecios) btnPrecios.style.display = "block";
  } else {
    // 🔒 PERMISOS ASISTENTE: Enciende reloj, oculta contabilidad y precios
    if (shiftTimer)
      shiftTimer.style.setProperty("display", "inline-flex", "important");
    if (btnCajaFinanzas)
      btnCajaFinanzas.style.setProperty("display", "none", "important");
    if (btnAdelanto)
      btnAdelanto.style.setProperty("display", "none", "important");
    if (btnNomina) btnNomina.style.setProperty("display", "none", "important");
    if (btnPrecios) btnPrecios.style.display = "none";

    if (typeof iniciarRelojTurno === "function") iniciarRelojTurno();
  }
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
    // <-- Aquí estaba el error (decía overlels)
    overlay.classList.remove("open");
    if (overlay.style.display === "flex") overlay.style.display = "none";
  });
}

function abrirPanel(idPanel) {
  if (typeof haptic === "function") haptic();
  const panel = document.getElementById(idPanel);
  if (!panel) return;

  if (panel.classList.contains("open") || panel.style.display === "flex") {
    panel.classList.remove("open");
    panel.style.display = "none";
    if (typeof CyberSonidos !== "undefined") CyberSonidos.play("cerrar");
  } else {
    cerrarTodasLasVentanas();
    panel.classList.add("open");
    panel.style.display = "flex";
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
    (panel.classList.contains("open") || panel.style.display === "flex") &&
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
  if (panel) {
    panel.classList.remove("open");
    panel.style.display = "none";
  }
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

// ==========================================================================
// 💰 CONTROL DE PRECIOS DE TIENDA (SOLO SUPERADMIN)
// ==========================================================================

// 📱 FUNCIÓN PARA ABRIR/CERRAR EL MODAL Y CARGAR DATOS
window.togglePreciosPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("preciosTiendaOverlay");
  if (!overlay) return;

  if (overlay.style.display === "flex" || overlay.classList.contains("open")) {
    overlay.style.display = "none";
    overlay.classList.remove("open");
  } else {
    cerrarTodasLasVentanas();
    overlay.style.display = "flex";
    overlay.classList.add("open");

    // Iniciar carga de datos al abrir
    cargarPreciosTiendaDesdeMySQL();
  }
};

// 📥 DESCARGAR PRECIOS DESDE MYSQL Y PINTARLOS
window.cargarPreciosTiendaDesdeMySQL = function () {
  const contenedor = document.getElementById("contenedorListaPrecios");
  contenedor.innerHTML = `
        <div style="text-align: center; color: #ff9f0a; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px;">
            <svg class="spin-anim" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            </svg>
            <span style="font-weight: 800; font-size: 0.95rem;">Obteniendo precios en vivo...</span>
        </div>
    `;

  const formData = new FormData();
  formData.append("accion", "obtener");

  fetch("https://api.cybernetsp.com/api_precios.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        let html = "";
        let ultimaCategoria = "";

        data.data.forEach((item) => {
          // Separador visual por Categorías
          if (item.categoria !== ultimaCategoria) {
            html += `
                        <div style="margin-top: 15px; margin-bottom: 5px; font-size: 0.75rem; color: #a1a1aa; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                            ${item.categoria || "Otros"}
                        </div>
                    `;
            ultimaCategoria = item.categoria;
          }

          // Asegurar que el precio se muestre sin decimales inútiles
          let precioLimpio = String(item.precio).replace(".00", "");

          html += `
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.03); padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05);">
                        <span style="color: #fff; font-weight: 700; font-size: 0.9rem;">${item.nombre_ui}</span>
                        <div style="display: flex; align-items: center; gap: 6px; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 159, 10, 0.3); border-radius: 10px; padding: 0 10px;">
                            <span style="color: #ff9f0a; font-weight: 800;">$</span>
                            <input 
                                type="number" 
                                class="input-precio-tienda" 
                                data-codigo="${item.codigo}" 
                                value="${precioLimpio}" 
                                style="background: transparent; border: none; color: #30d158; font-weight: 900; font-size: 1.05rem; outline: none; width: 80px; padding: 8px 0; font-family: monospace; text-align: right;"
                            />
                        </div>
                    </div>
                `;
        });
        contenedor.innerHTML = html;
      } else {
        contenedor.innerHTML = `<div style="text-align: center; color: #ff453a; font-weight: 800; padding: 20px;">❌ Error al cargar los precios.</div>`;
      }
    })
    .catch((err) => {
      contenedor.innerHTML = `<div style="text-align: center; color: #ff453a; font-weight: 800; padding: 20px;">❌ Falla de conexión con el servidor.</div>`;
    });
};

// 📤 ENVIAR LOS NUEVOS PRECIOS A MYSQL
window.guardarPreciosTienda = function () {
  if (typeof haptic === "function") haptic();

  // Recopilar todos los inputs generados
  const inputs = document.querySelectorAll(".input-precio-tienda");
  const preciosActualizados = [];

  inputs.forEach((input) => {
    preciosActualizados.push({
      codigo: input.getAttribute("data-codigo"),
      precio: input.value,
    });
  });

  // Validar si hay datos
  if (preciosActualizados.length === 0) return;

  if (typeof triggerToast === "function")
    triggerToast(`⏳ Guardando precios...`);

  const formData = new FormData();
  formData.append("accion", "actualizar");
  formData.append("precios", JSON.stringify(preciosActualizados));

  fetch("https://api.cybernetsp.com/api_precios.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="color:var(--ios-green);">✅ ${data.message}</div>`,
          );
        } else {
          alert(data.message);
        }
        togglePreciosPanel(); // Cierra el modal al terminar
      } else {
        alert("❌ Error: " + data.message);
      }
    })
    .catch((err) => {
      alert("❌ Ocurrió un error al guardar los precios.");
    });
};
