/* ==========================================================================
   🚀 CYBERNET OS - NÚCLEO LÓGICO (VERSIÓN MySQL / PHP)
   ========================================================================== */
// 🔗 URL OFICIAL DE GOOGLE APPS SCRIPT PARA PINESMES Y NEYOP
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxqKpMcC5BI0H6PHnImu5Lkw3ryiuFO0fW0KJAhQ_45kzglYn9CpN1O2fCjezXM5oMi/exec";
// 1. INTERCEPTOR DE SESIÓN Y ARRANQUE DEL SISTEMA
(function () {
  const usuarioActivoObj = JSON.parse(
    sessionStorage.getItem("usuario_activo") || "null",
  );
  const user = usuarioActivoObj ? usuarioActivoObj.nombre.toUpperCase() : null;
  const rol = usuarioActivoObj ? usuarioActivoObj.rol : null;

  window.addEventListener("DOMContentLoaded", () => {
    let savedTheme = localStorage.getItem("cyber_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    // Si no hay sesión válida en memoria, expulsar al Login
    if (!user) {
      window.location.href = "login.html"; // O index.html, según como se llame tu login
      return;
    }

    // Iniciar entorno
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

    iniciarRelojTurno();
  }

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
   📱 ISLA DINÁMICA DE APPLE (NOTIFICACIONES TOAST)
   ========================================================================== */
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

// Vinculación de Botones a Paneles HTML
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
window.toggleCodesPanel = () => abrirPanel("codesOverlay");
window.toggleAnaCodesPanel = () => abrirPanel("anaCodesOverlay");
window.toggleChayoPanel = () => abrirPanel("chayoOverlay");
window.toggleYopmailPanel = () => {
  abrirPanel("yopmailOverlay");
  document.getElementById("inputYopmailCorreos").focus();
};
window.toggleGmailPanel = () => abrirPanel("gmailOverlay");

/* ==========================================================================
   📡 WIDGET PAGOS BRE-B EN VIVO (CONECTADO A PHP)
   ========================================================================== */
let autoHideTimer = null;
let cantidadPagosAnterior = 0;

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

  // ⚠️ Consulta a PHP (Reemplaza la lógica de Google Sheets)
  fetch("https://api.cybernetsp.com/obtener_pagos_breb.php") // Necesitarás crear este archivo PHP que consulte los pagos
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
          if (typeof CyberSonidos !== "undefined") CyberSonidos.play("dinero");
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
    });
}

/* ==========================================================================
   ✏️ ABRIR MODAL EDITAR (HABILITA EDICIÓN Y GUARDA CORREO ANTERIOR)
   ========================================================================== */
window.abrirModalEditarMySQL = function (filaEscapada) {
  if (typeof haptic === "function") haptic();
  const fila = JSON.parse(decodeURIComponent(filaEscapada));

  const iCorreo = document.getElementById("editMySQLCorreo");
  const iClave = document.getElementById("editMySQLClave");
  const iPerfil = document.getElementById("editMySQLPerfil");
  const iPin = document.getElementById("editMySQLPin");
  const iVenc = document.getElementById("editMySQLVencimiento");
  const iNombre = document.getElementById("editMySQLNombre");
  const iNumero = document.getElementById("editMySQLNumero");

  document.getElementById("editMySQLId").value = fila.id;

  // Guardamos el correo original de la fila en un input oculto para saber qué cuentas actualizar masivamente
  let idCorreoAnterior = document.getElementById("editMySQLCorreoAnterior");
  if (!idCorreoAnterior) {
    idCorreoAnterior = document.createElement("input");
    idCorreoAnterior.type = "hidden";
    idCorreoAnterior.id = "editMySQLCorreoAnterior";
    const form =
      document.getElementById("formEditarMySQL") ||
      document.querySelector("#modalEditarMySQL form");
    if (form) form.appendChild(idCorreoAnterior);
  }
  idCorreoAnterior.value = fila.correo || fila.usuario || "";

  iCorreo.value = fila.correo || fila.usuario || "";
  iClave.value = fila.clave || fila.contrasena || "";
  iPerfil.value = fila.perfil || "";
  iPin.value = fila.pin || "";
  iVenc.value = fila.vencimiento || "";
  iNombre.value = fila.nombre || fila.cliente || "";
  iNumero.value = fila.numero || fila.telefono || "";

  // 🔥 TODOS LOS CAMPOS QUEDAN TOTALMENTE HABILITADOS PARA EL SUPERADMIN
  const inputs = [iCorreo, iClave, iPerfil, iPin, iVenc, iNombre, iNumero];
  inputs.forEach((inp) => {
    inp.readOnly = false;
    inp.style.opacity = "1";
    inp.style.cursor = "text";
  });

  const modal = document.getElementById("modalEditarMySQL");
  if (modal) modal.style.display = "flex";
};

/* ==========================================================================
   💾 GUARDAR EDICIÓN (ENVÍA CORREO ANTERIOR PARA EDICIÓN EN CASCADA)
   ========================================================================== */
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

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (btn) btn.disabled = false;
      if (data.status === "success") {
        const modal = document.getElementById("modalEditarMySQL");
        if (modal) modal.style.display = "none";
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
      if (btn) btn.disabled = false;
      console.error(err);
      alert("❌ Error al guardar edición.");
    });
};
// Cierre automático de menús al presionar escape
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    cerrarTodasLasVentanas();
  }
});

// Control del cronómetro visual de los asistentes
let timerInterval = null;
function iniciarRelojTurno() {
  if (!sessionStorage.getItem("cyber_shift_start_time")) {
    sessionStorage.setItem("cyber_shift_start_time", Date.now());
  }

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(function () {
    let startTime = parseInt(sessionStorage.getItem("cyber_shift_start_time"));
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
window.currentGridStock = [];

function cargarPlantillasDesdeSheets() {
  const container = document.getElementById("grid-container");
  if (container) {
    container.innerHTML =
      '<div class="empty-log-msg" style="grid-column: 1 / -1; width: 100%; text-align: center; margin-top: 40px;">Sincronizando mensajes desde MySQL...</div>';
  }

  fetch("https://api.cybernetsp.com/obtener_plantillas.php")
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
          // 🔥 CORRECCIÓN AQUÍ: Se escapan las comillas simples para no romper el botón
          let textoPagosSeguro = encodeURIComponent(
            plantillaPagos.texto || "",
          ).replace(/'/g, "%27");

          let btnNequiHtml = "";
          if (plantillaNequi) {
            // 🔥 CORRECCIÓN AQUÍ TAMBIÉN
            let textoNequiSeguro = encodeURIComponent(
              plantillaNequi.texto || "",
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
          '<div class="empty-log-msg" style="color:var(--ios-red); grid-column: 1 / -1; width: 100%; text-align: center; margin-top: 40px;">❌ Error al conectar con el servidor PHP (¿Tienes XAMPP encendido?).</div>';
      console.error(err);
    });
}

// -----------------------------------------------------------
// 🔍 FUNCIÓN RENDERGRID: CREA LAS TARJETAS ESTILO IMAGEN 2 CON ESTRUCTURA GRID
// -----------------------------------------------------------
function renderGrid(filtro = "") {
  const gridContainer = document.getElementById("grid-container");
  const emptyState = document.getElementById("macEmptyState");

  if (!gridContainer || !window.currentGridStock) return;
  gridContainer.innerHTML = "";

  let filtrados = window.currentGridStock.filter(
    (item) =>
      item.titulo && item.titulo.toLowerCase().includes(filtro.toLowerCase()),
  );

  if (emptyState) {
    if (filtrados.length === 0 && filtro !== "") {
      emptyState.style.display = "flex";
      emptyState.querySelector("span").innerText =
        `No se encontraron plantillas con "${filtro}".`;
    } else if (window.currentGridStock.length > 0) {
      emptyState.style.display = "none";
    }
  }

  gridContainer.style.cssText =
    "display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; width: 100%; align-content: start;";

  if (filtrados.length === 0) return;

  filtrados.forEach((currentItem) => {
    // 1. Creamos la tarjeta dinámicamente en JavaScript (No en texto HTML)
    const card = document.createElement("div");
    card.className = "card-ios";
    card.style.cssText =
      "display: flex !important; flex-direction: column !important; justify-content: space-between !important; height: 100% !important; padding: 18px !important; background: rgba(255, 255, 255, 0.02) !important; border: 1px solid rgba(255, 255, 255, 0.06) !important; border-radius: 16px !important; margin: 0 !important; box-sizing: border-box !important; min-height: 120px;";

    let tituloLimpio = currentItem.titulo ? currentItem.titulo.trim() : "";
    let tituloSeguro =
      tituloLimpio !== "" ? tituloLimpio : "Plantilla Sin Nombre";

    // 2. Creamos la cabecera (Título)
    const divHeader = document.createElement("div");
    divHeader.style.cssText =
      "margin-bottom: 14px; flex-grow: 1; display: flex; flex-direction: column; justify-content: flex-start;";
    divHeader.innerHTML = `<h2 class="card-title" style="margin: 0; font-size: 0.95rem; font-weight: 800; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.4;">${tituloSeguro}</h2>`;

    // 3. Creamos el Botón de Copiar
    const btnCopiar = document.createElement("button");
    btnCopiar.className = "btn-ios w-100";
    btnCopiar.style.cssText =
      "margin-top: auto !important; padding: 12px !important; background: rgba(255, 255, 255, 0.08) !important; color: var(--text-primary) !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; border-radius: 12px !important; font-weight: 800 !important; font-size: 0.85rem !important; transition: all 0.2s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important; cursor: pointer;";
    btnCopiar.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> COPIAR TEXTO`;

    // 🔥 MAGIA AQUÍ: Asignamos el evento y el texto directo en memoria, sin tocar el HTML.
    btnCopiar.onclick = function () {
      let textoReal = currentItem.texto || "";
      window.copiarPlantillaDirecta(this, textoReal);
    };

    // 4. Armamos la tarjeta y la mandamos a la pantalla
    card.appendChild(divHeader);
    card.appendChild(btnCopiar);
    gridContainer.appendChild(card);
  });
}

// =========================================================================
// 🔍 FILTRADOR EN VIVO (Vinculado al buscador de arriba)
// =========================================================================
window.filtrarTarjetasMac = function () {
  const input = document.getElementById("macSearchCards");
  const filtro = input ? input.value.trim() : "";
  renderGrid(filtro);
};

/* ==========================================================================
   📋 MOTOR NATIVO: COPIAR PLANTILLAS Y CÓDIGO QR 
   ========================================================================== */

// 1. FUNCIÓN MAESTRA INFALIBLE PARA TEXTOS DINÁMICOS DE MYSQL
window.copiarPlantillaDirecta = function (btn, textoReal) {
  if (typeof haptic === "function") haptic();

  // Animación de éxito
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
        "important",
      );
    }

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>¡Texto copiado al portapapeles!</span></div>`,
      );
    }

    setTimeout(function () {
      btn.innerHTML = originalHTML;
      btn.style.setProperty(
        "background",
        "rgba(255, 255, 255, 0.08)",
        "important",
      );
      btn.style.setProperty("color", "var(--text-primary)", "important");
      btn.style.setProperty(
        "border-color",
        "rgba(255, 255, 255, 0.15)",
        "important",
      );
      btn.style.setProperty("transform", "scale(1)", "important");

      if (card) {
        card.style.setProperty(
          "border-color",
          "rgba(255, 255, 255, 0.06)",
          "important",
        );
        card.style.setProperty("box-shadow", "none", "important");
      }
    }, 1500);
  };

  // INTENTO 1: Usar la API Moderna del Portapapeles (Si es HTTPS)
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(textoReal)
      .then(animarExito)
      .catch(() => usarFallbackCopiado());
  } else {
    // INTENTO 2: Método clásico a prueba de balas (Para XAMPP o IPs locales)
    usarFallbackCopiado();
  }

  function usarFallbackCopiado() {
    const textarea = document.createElement("textarea");
    textarea.value = textoReal;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0"; // Invisible
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand("copy");
      animarExito();
    } catch (err) {
      alert("Tu navegador bloqueó la copia automática.");
    }
    document.body.removeChild(textarea);
  }
};

/* ==========================================================================
   📋 MOTOR DE COPIADO: TEXTOS Y CÓDIGO QR (VÍA PORTAPAPELES)
   ========================================================================== */

// 1. INICIALIZAR BOTONES DE COPIAR TEXTO (Clipboard.js)
document.addEventListener("DOMContentLoaded", () => {
  if (typeof ClipboardJS !== "undefined") {
    const clipboard = new ClipboardJS(".copy-text-btn");

    clipboard.on("success", function (e) {
      if (typeof haptic === "function") haptic();
      const btn = e.trigger;
      const card = btn.closest(".card-ios");
      const originalHTML = btn.innerHTML;

      // 🟢 Efecto visual de éxito al dar clic
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡COPIADO!`;
      btn.style.setProperty("background", "#30d158", "important");
      btn.style.setProperty("color", "#ffffff", "important");
      btn.style.setProperty("border-color", "#30d158", "important");
      btn.style.setProperty("transform", "scale(1.05)", "important");

      if (card) {
        card.style.setProperty("border-color", "#30d158", "important");
        card.style.setProperty(
          "box-shadow",
          "0 0 20px rgba(48, 209, 88, 0.4)",
          "important",
        );
      }

      // Lanza la notificación flotante de Apple
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>¡Texto copiado al portapapeles!</span></div>`,
        );
      }

      // 🔄 Restaurar diseño original oscuro después de 1.5s
      setTimeout(function () {
        btn.innerHTML = originalHTML;
        btn.style.setProperty(
          "background",
          "rgba(255, 255, 255, 0.08)",
          "important",
        );
        btn.style.setProperty("color", "var(--text-primary)", "important");
        btn.style.setProperty(
          "border-color",
          "rgba(255, 255, 255, 0.15)",
          "important",
        );
        btn.style.setProperty("transform", "scale(1)", "important");

        if (card) {
          card.style.setProperty(
            "border-color",
            "rgba(255, 255, 255, 0.06)",
            "important",
          );
          card.style.setProperty("box-shadow", "none", "important");
        }
      }, 1500);
    });
  }
});

// Función de respaldo en caso de que el navegador tenga alta seguridad
function lanzarErrorCopia(imgElement) {
  console.error("El navegador bloqueó la API del portapapeles.");
  imgElement.style.transform = "scale(1)";
  imgElement.style.opacity = "1";
  alert(
    "Tu navegador bloqueó la copia automática de imágenes. Por favor, usa clic derecho -> 'Copiar imagen' o mantén presionado en tu celular.",
  );
}
/* ==========================================================================
   📋 MOTOR NATIVO: COPIAR PLANTILLAS Y CÓDIGO QR 
   ========================================================================== */

// 1. FUNCIÓN MAESTRA INFALIBLE PARA TEXTOS DINÁMICOS DE MYSQL
window.copiarPlantillaGlobal = function (btn, textoCodificado) {
  if (typeof haptic === "function") haptic();

  // Descodificamos para recuperar saltos de línea y emojis
  const textoReal = decodeURIComponent(textoCodificado);

  // Animación de éxito
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
        "important",
      );
    }

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>¡Texto copiado al portapapeles!</span></div>`,
      );
    }

    setTimeout(function () {
      btn.innerHTML = originalHTML;
      btn.style.setProperty(
        "background",
        "rgba(255, 255, 255, 0.08)",
        "important",
      );
      btn.style.setProperty("color", "var(--text-primary)", "important");
      btn.style.setProperty(
        "border-color",
        "rgba(255, 255, 255, 0.15)",
        "important",
      );
      btn.style.setProperty("transform", "scale(1)", "important");

      if (card) {
        card.style.setProperty(
          "border-color",
          "rgba(255, 255, 255, 0.06)",
          "important",
        );
        card.style.setProperty("box-shadow", "none", "important");
      }
    }, 1500);
  };

  // INTENTO 1: Usar la API Moderna del Portapapeles (Si es HTTPS)
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(textoReal)
      .then(animarExito)
      .catch(() => usarFallbackCopiado());
  } else {
    // INTENTO 2: Método clásico a prueba de balas (Para XAMPP o IPs locales)
    usarFallbackCopiado();
  }

  function usarFallbackCopiado() {
    const textarea = document.createElement("textarea");
    textarea.value = textoReal;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0"; // Invisible
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand("copy");
      animarExito();
    } catch (err) {
      alert("Tu navegador bloqueó la copia automática.");
    }
    document.body.removeChild(textarea);
  }
};

// 2. FUNCIÓN PARA COPIAR LA IMAGEN DEL QR (Canvas -> Blob -> Clipboard)
window.copiarImagenQRPagos = function (imgElement, urlImagen) {
  if (typeof haptic === "function") haptic();

  // Efecto visual: la imagen se encoge un poquito mientras procesa
  imgElement.style.transform = "scale(0.95)";
  imgElement.style.opacity = "0.6";

  try {
    const imgObj = new Image();
    imgObj.crossOrigin = "anonymous"; // Desbloquea CORS para poder clonar la imagen
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

            // Restaurar la imagen y poner borde verde de éxito
            imgElement.style.transform = "scale(1.05)";
            imgElement.style.opacity = "1";
            imgElement.style.borderColor = "var(--ios-green)";

            if (typeof triggerToast === "function") {
              triggerToast(
                `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>¡Imagen copiada! (Ctrl + V para pegar)</span></div>`,
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
  console.error("El navegador bloqueó la API.");
  imgElement.style.transform = "scale(1)";
  imgElement.style.opacity = "1";
  alert(
    "Tu navegador bloqueó la copia de imágenes automáticamente. Usa clic derecho -> 'Copiar imagen'.",
  );
}
function cargarBandejaCodigosMySQL() {
  const contenedor = document.getElementById("codesScrollArea"); // O el ID de la lista en tu HTML de códigos
  if (!contenedor) return;

  contenedor.innerHTML =
    '<div style="text-align: center; color: var(--ios-orange); padding: 20px;">Buscando códigos en Gmail...</div>';

  fetch("https://api.cybernetsp.com/obtener_codigos.php")
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
          html += `
                        <div class="card-ios" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 16px; border-radius: 14px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: ${item.colorText}; font-weight: 800; font-size: 0.9rem;">● ${item.plataforma}</span>
                                <span style="color: var(--text-secondary); font-size: 0.75rem;">${item.hora}</span>
                            </div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">CLIENTE: <strong style="color: #fff; font-family: monospace;">${item.correo}</strong></div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">ACCIÓN: ${item.accion}</div>
                            <div style="font-size: 0.85rem; color: #fff;">CÓDIGO / ENLACE: <span style="color: var(--ios-red); font-weight: 900; font-size: 1.1rem; font-family: monospace; background: rgba(0,0,0,0.4); padding: 2px 8px; border-radius: 6px;">${item.codigoLink}</span></div>
                            <button class="btn-ios w-100" onclick="window.copiarPlantillaGlobal(this, '${encodeURIComponent(item.copiadoRapido)}')" style="margin-top: 6px; padding: 10px; background: rgba(255,255,255,0.08); font-weight: 800; font-size: 0.8rem; border-radius: 10px; cursor: pointer; color: #fff;">
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
      console.error(err);
    });
}
/* ==========================================================================
   📩 MOTOR: BANDEJA DE CÓDIGOS (VÍA PHP/MYSQL)
   ========================================================================== */

window.toggleCodesPanel = () => {
  abrirPanel("codesOverlay");
  const overlay = document.getElementById("codesOverlay");
  if (overlay && overlay.classList.contains("open")) {
    cargarBandejaCodigosMySQL(); // Dispara la búsqueda en vivo al abrir
  }
};

window.cargarBandejaCodigosMySQL = function () {
  const contenedor = document.getElementById("codesScrollArea");
  if (!contenedor) return;

  // Pantalla de carga
  contenedor.innerHTML =
    '<div style="text-align: center; color: var(--ios-orange); padding: 40px;"><svg class="spin-anim" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:12px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg><br><span style="font-weight: 600;">Sincronizando bandeja de Gmail...</span></div>';

  // Llamamos al archivo PHP que creamos antes
  fetch("https://api.cybernetsp.com/obtener_codigos.php")
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
          // Protegemos el texto a copiar (Saltos de línea de WhatsApp)
          let safeCopiedText = encodeURIComponent(
            item.copiadoRapido || "",
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
      console.error(err);
    });
};

// Buscador interno (El input gris que sale en el modal)
window.filtrarCodigosInternos = function () {
  const query = document.getElementById("searchCodesInput").value.toLowerCase();
  const cards = document.querySelectorAll("#codesScrollArea .card-ios");
  for (let i = 0; i < cards.length; i++) {
    let card = cards[i];
    card.style.display = card.innerText.toLowerCase().includes(query)
      ? "flex"
      : "none";
  }
};
/* ==========================================================================
   👁️ MOTOR: CÓDIGOS ANA
   ========================================================================== */
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

/* ==========================================================================
   🔴 MOTOR: BÓVEDA CHAYO (CON BARRERA TEMPORIZADA DE CREDANCIALES)
   ========================================================================== */
let cronometroChayo = null;

window.toggleChayoPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("chayoOverlay");
  const iframe = document.getElementById("iframeChayo");
  const barra = document.getElementById("barraCredencialesChayo");
  const botonVer = document.getElementById("btnVerDatosChayo");

  if (!overlay) return;

  if (overlay.classList.contains("open")) {
    // Cerrar ventana y limpiar temporizadores
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
    // Abrir ventana
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
            triggerToast("🔓 Acceso completado. Maximizando visualización.");
          }
        }
      }, 3000);
    }
  });
};

/* ==========================================================================
   🟡 MOTOR: YOPMAIL (ACCESO MANUAL Y PRESETS DIRECTOS - CORREGIDO)
   ========================================================================== */
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
  let correo = input.value.trim().toLowerCase().replace("@yopmail.com", "");
  window.open(`https://yopmail.com/es/?login=${correo}`, "_blank");
};

window.buscarYopmailDirecto = function (correoPrefix) {
  if (typeof haptic === "function") haptic();
  let correo = correoPrefix.replace("@yopmail.com", "");
  window.open(`https://yopmail.com/es/?login=${correo}`, "_blank");
};
/* ==========================================================================
   📦 CONTROL DE STOCK E INVENTARIO (MYSQL / PHP)
   ========================================================================== */

window.toggleInventarioPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("inventarioOverlay");
  if (!overlay) return;

  if (overlay.classList.contains("open") || overlay.style.display === "flex") {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    cerrarTodasLasVentanas();
    overlay.classList.add("open");
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    cargarInventarioStockMySQL(); // Consulta los conteos y refresca los switches
  }
};

function cargarInventarioStockMySQL() {
  const contenedor = document.getElementById("panelSwitchesStock");
  if (!contenedor) return;

  // 🔒 Validación de Rol para habilitar/deshabilitar los switches
  const usuarioActivoObj = JSON.parse(
    sessionStorage.getItem("usuario_activo") || "null",
  );
  const user = usuarioActivoObj ? usuarioActivoObj.nombre.toUpperCase() : null;
  const rol = usuarioActivoObj ? usuarioActivoObj.rol : null;
  const esAdmin = rol === "superadmin" || user === "CAMILO";

  contenedor.innerHTML =
    '<div style="grid-column: 1 / -1; text-align: center; color: var(--ios-blue); padding: 30px;"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg><br><span style="margin-top:8px; display:inline-block; font-weight:600;">Consultando inventario en MySQL...</span></div>';

  fetch("https://api.cybernetsp.com/obtener_inventario_stock.php")
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success") {
        let html = "";
        res.data.forEach((item) => {
          const isChecked = item.activo === 1 ? "checked" : "";
          const switchColor = item.activo === 1 ? "#30d158" : "#ff453a";

          // Si no es admin, se deshabilita el checkbox y se ajusta la opacidad del switch
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
              
              <!-- Switch estilo iOS bloqueado según rol -->
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
      console.error(err);
    });
}

function cambiarEstadoPlataformaMySQL(idPlataforma, inputElem) {
  // 🔒 Escudo de Seguridad Backend/JS contra intentos no autorizados
  const usuarioActivoObj = JSON.parse(
    sessionStorage.getItem("usuario_activo") || "null",
  );
  const user = usuarioActivoObj ? usuarioActivoObj.nombre.toUpperCase() : null;
  const rol = usuarioActivoObj ? usuarioActivoObj.rol : null;

  if (rol !== "superadmin" && user !== "CAMILO") {
    if (typeof haptic === "function") haptic();
    inputElem.checked = !inputElem.checked; // Revertir checkbox inmediatamente
    if (typeof triggerToast === "function") {
      triggerToast(
        "⛔ Solo el administrador Camilo puede modificar las plataformas.",
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

  fetch("https://api.cybernetsp.com/guardar_estado_plataforma.php", {
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
        alert("No se pudo cambiar el estado.");
      }
    })
    .catch((err) => {
      inputElem.checked = !inputElem.checked;
      if (slider) {
        slider.style.backgroundColor = inputElem.checked
          ? "#30d158"
          : "#ff453a";
      }
      console.error(err);
    });
}
/* ==========================================================================
   👥 MOTOR DE PERSONAL Y CONTROL DE HORAS (MYSQL / PHP)
   ========================================================================== */

window.toggleShiftsPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("shiftsOverlay");
  if (!overlay) return;

  if (overlay.classList.contains("open") || overlay.style.display === "flex") {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    cerrarTodasLasVentanas();
    overlay.classList.add("open");
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    cargarHorasMySQL();
  }
};

/* ==========================================================================
   👥 MÓDULO DE CONTROL DE HORAS (MYSQL - TABLA: control_horas)
   ========================================================================== */

function forzarRefrescoDeHoras() {
  if (typeof haptic === "function") haptic();
  cargarHorasDesdeMySQL(true);
}

/* ==========================================================================
   💸 REGISTRAR ADELANTO (LIMPIEZA DE PUNTOS DE MILES)
   ========================================================================== */

window.ejecutarAdelantoDesdeShift = function (e) {
  if (e) e.preventDefault();
  if (typeof haptic === "function") haptic();

  const empleado = document.getElementById("adeEmpleado").value;
  const montoRaw = document.getElementById("adeMonto").value;

  // 🧼 Extrae únicamente dígitos numéricos ("$ 10.000" -> 10000)
  const montoLimpio = parseInt(montoRaw.replace(/\D/g, ""), 10) || 0;

  if (!empleado || montoLimpio <= 0) {
    alert("⚠️ Por favor ingresa un monto válido.");
    return;
  }

  const btn = document.getElementById("btnSubmitAdeShift");
  const originalText = btn.innerHTML;
  btn.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg> Aplicando...`;
  btn.disabled = true;

  const formData = new FormData();
  formData.append("accion", "guardar_adelanto");
  formData.append("empleado", empleado);
  formData.append("monto", montoLimpio);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      btn.innerHTML = originalText;
      btn.disabled = false;

      if (data.status === "success") {
        if (typeof triggerToast === "function") {
          triggerToast(`💸 ${data.message}`);
        }
        window.toggleModalAdelanto(false);
        forzarRefrescoDeHoras(); // Refresca la vista del calendario
      } else {
        alert("❌ Error: " + data.message);
      }
    })
    .catch((err) => {
      btn.innerHTML = originalText;
      btn.disabled = false;
      console.error(err);
      alert("❌ Error de comunicación con MySQL.");
    });
};

/* ==========================================================================
   👥 CARGAR Y MAPEAR REGISTROS A LA VISTA CALENDARIO QUINCENAL (IMAGEN 3)
   ========================================================================== */

function forzarRefrescoDeHoras() {
  if (typeof haptic === "function") haptic();
  cargarHorasDesdeMySQL(true);
}

function cargarHorasDesdeMySQL(silencioso = false) {
  const container = document.getElementById("shiftsScrollArea");
  if (!container) return;

  if (!silencioso) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:#a1a1aa; font-weight:600;">
        <svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:10px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg>
        <br>Cargando registros desde control_horas...
      </div>`;
  }

  const formData = new FormData();
  formData.append("accion", "obtener_control_horas");

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.text())
    .then((text) => {
      let res;
      try {
        res = JSON.parse(text);
      } catch (e) {
        console.error("Respuesta PHP no es JSON válido:", text);
        if (container) {
          container.innerHTML = `<div style="text-align:center; padding:30px; color:#ff453a; font-weight:bold;">❌ Error en PHP al consultar MySQL:<br><small style="font-size:0.75rem; color:#aaa;">${text.replace(/</g, "&lt;")}</small></div>`;
        }
        return;
      }

      if (res && res.status === "success") {
        window.currentHorasStock = (res.data || []).map((item) => ({
          id: item.id,
          vendedor: item.vendedor || item.usuario || "ASISTENTE",
          fecha:
            item.fecha ||
            (item.hora_inicio ? item.hora_inicio.split(" ")[0] : "-"),
          tiempo: item.tiempo_trabajado || item.horas || "00:00:00",
          pagoTurno:
            item.total !== undefined ? item.total : item.pago_turno || "0",
          estado: item.estado || "CERRADO",
          filaIndex: item.id,
        }));

        let query = document.getElementById("searchShiftsInput")
          ? document.getElementById("searchShiftsInput").value.toLowerCase()
          : "";

        if (typeof renderizarHorasEnPantalla === "function") {
          renderizarHorasEnPantalla(query);
        } else if (typeof renderizarHorasEnPantallaMySQL === "function") {
          renderizarHorasEnPantallaMySQL(query);
        }

        if (silencioso && typeof triggerToast === "function") {
          triggerToast("✅ control_horas sincronizado");
        }
      } else {
        container.innerHTML = `<div style="text-align:center; padding:40px; color:#ff453a;">❌ Error: ${res ? res.message : "Fallo de consulta"}</div>`;
      }
    })
    .catch((err) => {
      console.error(err);
      container.innerHTML = `<div style="text-align:center; padding:40px; color:#ff453a;">❌ Error de conexión con acciones_mysql.php.</div>`;
    });
}

function renderizarHorasEnPantallaMySQL(filtro = "") {
  const container = document.getElementById("shiftsScrollArea");
  if (!container) return;

  const data = window.currentHorasStock || [];

  let filtrados = data.filter((item) => {
    if (!filtro) return true;
    return (
      (item.vendedor || "").toLowerCase().includes(filtro) ||
      (item.fecha || "").toLowerCase().includes(filtro) ||
      (item.estado || "").toLowerCase().includes(filtro)
    );
  });

  if (filtrados.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:#a1a1aa; font-weight:600;">
        No hay registros en control_horas.
      </div>`;
    return;
  }

  let html = `<div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">`;

  filtrados.forEach((turno) => {
    const esActivo = turno.estado === "ACTIVO";
    const colorEstado = esActivo ? "#30d158" : "#a1a1aa";
    const textoEstado = esActivo ? "🟢 EN CURSO" : "🔴 CERRADO";

    html += `
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
        
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <b style="color: #ffffff; font-size: 1rem; text-transform: uppercase;">${turno.vendedor}</b>
            <span style="font-size: 0.72rem; font-weight: 800; color: ${colorEstado}; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 6px;">${textoEstado}</span>
          </div>
          <span style="font-size: 0.78rem; color: #a1a1aa;">📅 Fecha: <b style="color: #ffffff;">${turno.fecha}</b></span>
        </div>

        <div style="display: flex; gap: 16px; align-items: center;">
          <div style="display: flex; flex-direction: column; text-align: right;">
            <span style="font-size: 0.68rem; color: #a1a1aa; text-transform: uppercase; font-weight: 700;">Tiempo Trabajado</span>
            <span style="font-size: 1.1rem; font-weight: 900; color: #0a84ff; font-family: monospace;">${turno.tiempo}</span>
          </div>

          <div style="display: flex; flex-direction: column; text-align: right; border-left: 1px solid rgba(255,255,255,0.08); padding-left: 14px;">
            <span style="font-size: 0.68rem; color: #a1a1aa; text-transform: uppercase; font-weight: 700;">Inicio</span>
            <span style="font-size: 0.82rem; font-weight: 700; color: #ffffff; font-family: monospace;">${turno.horaInicio.split(" ")[1] || turno.horaInicio}</span>
          </div>
        </div>

      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

window.filtrarHorasInternas = function () {
  const query = document
    .getElementById("searchShiftsInput")
    .value.toLowerCase()
    .trim();
  const tarjetas = document.querySelectorAll(
    "#shiftsScrollArea .shift-card-item",
  );

  tarjetas.forEach((card) => {
    const texto = card.innerText.toLowerCase();
    card.style.display = texto.includes(query) ? "flex" : "none";
  });
};
/* ==========================================================================
   🛠️ FUNCIONES DE GESTIÓN: INGRESAR HORAS, ADELANTOS Y NÓMINA
   ========================================================================== */

// 1. Abrir/Cerrar Formulario Tiempo Extra
window.toggleFormularioHoras = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("addHoursOverlay");
  if (!overlay) return;

  if (overlay.style.display === "flex") {
    overlay.style.display = "none";
  } else {
    overlay.style.display = "flex";

    // Auto-llenar el trabajador activo y la fecha de hoy
    const usuarioActivoObj = JSON.parse(
      sessionStorage.getItem("usuario_activo") || "null",
    );
    const inputVend = document.getElementById("inputVendedorShift");
    const inputFecha = document.getElementById("inputFechaShift");

    if (inputVend && usuarioActivoObj) {
      inputVend.value = usuarioActivoObj.nombre.toUpperCase();
    }
    if (inputFecha && !inputFecha.value) {
      inputFecha.value = new Date().toISOString().split("T")[0];
    }
  }
};

// Guardar Tiempo Extra Manual
window.ejecutarGuardadoHorasManual = function (event) {
  if (event) event.preventDefault();
  if (typeof haptic === "function") haptic();

  const vendedor = document.getElementById("inputVendedorShift").value.trim();
  const horas = document.getElementById("inputHorasShift").value.trim();
  const fecha = document.getElementById("inputFechaShift").value.trim();

  const formData = new FormData();
  formData.append("vendedor", vendedor);
  formData.append("horas", horas);
  formData.append("fecha", fecha);

  fetch("https://api.cybernetsp.com/guardar_horas_manual.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        if (typeof triggerToast === "function")
          triggerToast("✅ " + data.message);
        document.getElementById("inputHorasShift").value = "";
        toggleFormularioHoras();
        forzarRefrescoDeHoras();
      } else {
        alert("Error: " + data.message);
      }
    })
    .catch((err) => console.error(err));
};

// 2. Abrir/Cerrar Modal Adelantos
window.toggleModalAdelanto = function (show) {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("adelantoShiftOverlay");
  if (!overlay) return;

  overlay.style.display = show ? "flex" : "none";
  if (!show) {
    document.getElementById("formAdelantoShift").reset();
  }
};

// 3. Abrir/Cerrar y Cargar Resumen de Nómina
window.abrirTotalNomina = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("nominaOverlay");
  if (overlay) {
    overlay.style.display = "flex";
    cargarNominaMySQL();
  }
};

window.cerrarTotalNomina = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("nominaOverlay");
  if (overlay) overlay.style.display = "none";
};

window.refrescarTotalNominaEnVivo = function (btn) {
  if (typeof haptic === "function") haptic();
  cargarNominaMySQL();
};

function cargarNominaMySQL() {
  const contenedor = document.getElementById("nominaContentArea");
  if (!contenedor) return;

  contenedor.innerHTML =
    '<div class="empty-log-msg" style="background: rgba(0, 0, 0, 0.2); border-radius: 20px; padding: 40px; text-align: center; color: var(--ios-green);">Calculando nómina desde MySQL...</div>';

  fetch("https://api.cybernetsp.com/obtener_nomina.php")
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success") {
        if (res.data.length === 0) {
          contenedor.innerHTML =
            '<div class="empty-log-msg" style="text-align:center; padding:30px;">No hay registros de sueldos aún.</div>';
          return;
        }

        let html =
          '<div style="display: flex; flex-direction: column; gap: 12px;">';
        res.data.forEach((item) => {
          const ganadoFmt = new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
          }).format(item.ganado);
          const descFmt = new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
          }).format(item.descontado);
          const netoFmt = new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
          }).format(item.neto);

          html += `
            <div class="card-ios" style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); padding: 18px 22px; border-radius: 18px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-weight: 800; font-size: 1.05rem; color: #ffffff; display: block;">${item.empleado}</span>
                <span style="font-size: 0.78rem; color: var(--text-secondary);">
                  Ganado: <b style="color: #30d158;">${ganadoFmt}</b> | Adelantos: <b style="color: #ff453a;">-${descFmt}</b>
                </span>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; display: block; font-weight: 700;">Neto a Pagar</span>
                <span style="font-size: 1.25rem; font-weight: 800; color: ${item.neto >= 0 ? "#30d158" : "#ff453a"}; font-family: monospace;">${netoFmt}</span>
              </div>
            </div>
          `;
        });
        html += "</div>";
        contenedor.innerHTML = html;
      } else {
        contenedor.innerHTML = `<div style="text-align:center; color: var(--ios-red); padding: 20px;">Error: ${res.message}</div>`;
      }
    })
    .catch((err) => {
      contenedor.innerHTML =
        '<div style="text-align:center; color: var(--ios-red); padding: 20px;">❌ Error de conexión (obtener_nomina.php).</div>';
      console.error(err);
    });
}

// Formateador de moneda en vivo para el campo de monto de adelanto
window.formatearMontoEnVivoCOP = function (input) {
  let val = input.value.replace(/\D/g, "");
  if (val) {
    input.value = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);
  } else {
    input.value = "";
  }
};

/* ==========================================================================
   👥 CARGADOR DINÁMICO DE USUARIOS DESDE MYSQL (TABLA USUARIOS)
   ========================================================================== */

window.cargarUsuariosSelects = function () {
  const selectVend = document.getElementById("inputVendedorShift");
  const selectAde = document.getElementById("adeEmpleado");

  fetch("https://api.cybernetsp.com/obtener_usuarios.php")
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success" && res.data.length > 0) {
        let optionsHtml =
          '<option value="" disabled selected>Selecciona trabajador...</option>';
        res.data.forEach((nombre) => {
          optionsHtml += `<option value="${nombre}">${nombre}</option>`;
        });

        if (selectVend) selectVend.innerHTML = optionsHtml;
        if (selectAde) selectAde.innerHTML = optionsHtml;

        // Auto-seleccionar al trabajador activo en sesión si está en la lista
        const usuarioActivoObj = JSON.parse(
          sessionStorage.getItem("usuario_activo") || "null",
        );
        if (usuarioActivoObj && selectVend) {
          selectVend.value = usuarioActivoObj.nombre.toUpperCase();
        }
      } else {
        const msg = res.message || "Sin usuarios registrados en la BD";
        let errHtml = `<option value="" disabled selected>❌ ${msg}</option>`;
        if (selectVend) selectVend.innerHTML = errHtml;
        if (selectAde) selectAde.innerHTML = errHtml;
      }
    })
    .catch((err) => {
      console.error("Error al cargar usuarios de MySQL:", err);
      let errHtml =
        '<option value="" disabled selected>❌ Error al conectar con obtener_usuarios.php</option>';
      if (selectVend) selectVend.innerHTML = errHtml;
      if (selectAde) selectAde.innerHTML = errHtml;
    });
};

// Modificadores de eventos de apertura para cargar usuarios en vivo
window.toggleFormularioHoras = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("addHoursOverlay");
  if (!overlay) return;

  if (overlay.style.display === "flex") {
    overlay.style.display = "none";
  } else {
    overlay.style.display = "flex";
    cargarUsuariosSelects(); // Llena el <select> con la DB al abrir

    const inputFecha = document.getElementById("inputFechaShift");
    if (inputFecha && !inputFecha.value) {
      inputFecha.value = new Date().toISOString().split("T")[0];
    }
  }
};

window.toggleModalAdelanto = function (show) {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("adelantoShiftOverlay");
  if (!overlay) return;

  overlay.style.display = show ? "flex" : "none";
  if (show) {
    cargarUsuariosSelects(); // Llena el <select> con la DB al abrir
  } else {
    const form = document.getElementById("formAdelantoShift");
    if (form) form.reset();
  }
};

/* ==========================================================================
   🔔 MOTOR DE RECORDATORIOS DE PAGO - CON BLOQUES ENUMERADOS Y EFECTO TACHADO
   ========================================================================== */

window.toggleRecordatoriosPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("recordatoriosOverlay");
  if (!overlay) return;

  if (overlay.classList.contains("open") || overlay.style.display === "flex") {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    cerrarTodasLasVentanas();
    overlay.classList.add("open");
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";

    sincronizarW1();
    sincronizarW2();
  }
};

window.sincronizarW1 = function () {
  const periodo = document.getElementById("periodoW1").value;
  ejecutarConsultaRecordatorios(
    periodo,
    "contadorW1",
    "bloquesW1",
    "listaIndividualW1",
    "purple",
    "W1",
  );
};

window.sincronizarW2 = function () {
  const periodo = document.getElementById("periodoW2").value;
  ejecutarConsultaRecordatorios(
    periodo,
    "contadorW2",
    "bloquesW2",
    "listaIndividualW2",
    "green",
    "W2",
  );
};

function ejecutarConsultaRecordatorios(
  periodo,
  idContador,
  idBloques,
  idLista,
  colorAccent,
  lineaWA,
) {
  if (typeof haptic === "function") haptic();

  const elContador = document.getElementById(idContador);
  const elBloques = document.getElementById(idBloques);
  const elLista = document.getElementById(idLista);

  if (elLista) {
    elLista.style.cssText =
      "display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; width: 100%;";
    elLista.innerHTML = `
      <div style="grid-column: span 2; text-align: center; color: var(--ios-${colorAccent}); padding: 30px;">
        <svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
        <br><span style="margin-top:8px; display:inline-block; font-weight:600; font-size:0.85rem;">Consultando clientes de ${lineaWA}...</span>
      </div>
    `;
  }

  fetch(
    `https://api.cybernetsp.com/obtener_recordatorios.php?periodo=${periodo}&linea=${lineaWA}`,
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success") {
        const total = res.total || (res.data ? res.data.length : 0);
        const data = res.data || [];

        if (elContador) elContador.innerText = `${total} clientes`;

        if (total === 0) {
          if (elBloques) {
            elBloques.innerHTML = `<div style="text-align: center; padding: 12px; color: var(--text-secondary); font-size: 0.8rem; grid-column: span 2; background: rgba(0, 0, 0, 0.2); border-radius: 12px;">Sin bloques para este periodo.</div>`;
          }
          if (elLista) {
            elLista.style.cssText = "display: block; width: 100%;";
            elLista.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-secondary); font-size: 0.85rem; background: rgba(0, 0, 0, 0.2); border-radius: 16px;">Cero clientes detectados.</div>`;
          }
          return;
        }

        // 1. BLOQUES DE HASTA 20 NÚMEROS DE WHATSAPP ENUMERADOS
        if (elBloques) {
          let htmlBloques = "";
          const tamanoBloque = 20; // Máximo 20 por bloque
          const numBloques = Math.ceil(data.length / tamanoBloque);

          for (let b = 0; b < numBloques; b++) {
            const inicio = b * tamanoBloque;
            const fin = Math.min(inicio + tamanoBloque, data.length);
            const subData = data.slice(inicio, fin);

            // Mapear los números enumerados formato: 1. wa.me/57...
            const numerosEnumerados = subData
              .map((item, idx) => {
                let num = (item.tel || item.telefono || "").replace(/\D/g, "");
                if (num.length === 10) num = "57" + num;
                return `${idx + 1}. wa.me/${num}`;
              })
              .join("\n");

            const jsonSubEscapado = encodeURIComponent(numerosEnumerados);

            htmlBloques += `
              <button class="btn-ios" style="padding: 10px 12px; font-weight: 800; font-size: 0.8rem; border-radius: 12px; background: rgba(255,255,255,0.06); color: #ffffff; border: 1px solid rgba(255,255,255,0.12); cursor: pointer; text-align: center; transition: all 0.25s ease; display: flex; align-items: center; justify-content: center; gap: 6px;" onclick="copiarBloqueNumerosWA(this, '${jsonSubEscapado}')">
                📋 Bloque (${inicio + 1}-${fin})
              </button>
            `;
          }
          elBloques.style.cssText =
            "display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; width: 100%;";
          elBloques.innerHTML = htmlBloques;
        }

        // 2. LISTA INDIVIDUAL DE MÓDULOS DE CLIENTES
        if (elLista) {
          elLista.style.cssText =
            "display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; width: 100%;";
          let htmlLista = "";

          data.forEach((item, idx) => {
            const msjSeguro = encodeURIComponent(item.mensaje || "").replace(
              /'/g,
              "%27",
            );

            let numTel = (item.tel || item.telefono || "").replace(/\D/g, "");
            if (numTel.length === 10) numTel = "57" + numTel;

            htmlLista += `
              <div class="card-item-recordatorio" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px; transition: all 0.25s ease;">
                <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                  <span style="background: rgba(255, 255, 255, 0.08); color: var(--text-secondary); width: 24px; height: 24px; border-radius: 50%; font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${idx + 1}
                  </span>
                  <span class="num-text-item" style="color: #ffffff; font-weight: 800; font-family: monospace; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${numTel}">
                    ${numTel || "Sin Teléfono"}
                  </span>
                </div>

                <button onclick="copiarMensajeYMarcarTachado(this, '${msjSeguro}')" title="Copiar mensaje del cliente" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.12); color: #ffffff; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s ease;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
            `;
          });
          elLista.innerHTML = htmlLista;
        }
      } else {
        if (elLista) {
          elLista.style.cssText = "display: block; width: 100%;";
          elLista.innerHTML = `<div style="text-align: center; color: var(--ios-red); padding: 20px; font-weight: 600;">Error: ${res.message}</div>`;
        }
      }
    })
    .catch((err) => {
      console.error(err);
      if (elLista) {
        elLista.style.cssText = "display: block; width: 100%;";
        elLista.innerHTML = `<div style="text-align: center; color: var(--ios-red); padding: 20px; font-weight: 600;">❌ Error de conexión al consultar MySQL.</div>`;
      }
    });
}

// 📋 COPIAR BLOQUE DE NÚMEROS ENUMERADOS (MÁX 20) Y TACHAR EL BOTÓN
window.copiarBloqueNumerosWA = function (btn, textoEscapado) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(textoEscapado);

  navigator.clipboard.writeText(texto).then(() => {
    // Aplicar efecto de tachado y cambio de color al botón de bloque
    btn.style.setProperty("text-decoration", "line-through", "important");
    btn.style.setProperty("opacity", "0.45", "important");
    btn.style.setProperty("background", "rgba(48, 209, 88, 0.15)", "important");
    btn.style.setProperty("color", "#30d158", "important");
    btn.style.setProperty(
      "border-color",
      "rgba(48, 209, 88, 0.3)",
      "important",
    );

    if (typeof triggerToast === "function") {
      triggerToast(`📋 Bloque de WhatsApp copiado y marcado como enviado.`);
    }
  });
};

// 📋 COPIAR MENSAJE INDIVIDUAL Y TACHAR LA TARJETA DEL CLIENTE
window.copiarMensajeYMarcarTachado = function (btn, msjEscapado) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(msjEscapado);

  navigator.clipboard.writeText(texto).then(() => {
    const tarjeta = btn.closest(".card-item-recordatorio");
    if (tarjeta) {
      const numText = tarjeta.querySelector(".num-text-item");
      if (numText) {
        numText.style.setProperty(
          "text-decoration",
          "line-through",
          "important",
        );
        numText.style.setProperty("color", "#a1a1aa", "important");
      }
      tarjeta.style.setProperty("opacity", "0.45", "important");
      tarjeta.style.setProperty(
        "background",
        "rgba(48, 209, 88, 0.08)",
        "important",
      );
      tarjeta.style.setProperty(
        "border-color",
        "rgba(48, 209, 88, 0.2)",
        "important",
      );
    }

    btn.style.setProperty("background", "#30d158", "important");
    btn.style.setProperty("color", "#000000", "important");
    btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    if (typeof triggerToast === "function") {
      triggerToast(`📋 Mensaje copiado y marcado como enviado.`);
    }
  });
};

window.abrirBloqueWhatsApp = function (jsonSubEnc) {
  if (typeof haptic === "function") haptic();
  try {
    const subData = JSON.parse(decodeURIComponent(jsonSubEnc));
    subData.forEach((item) => {
      window.open(item.waLink, "_blank");
    });
  } catch (e) {
    console.error("Error abriendo bloque:", e);
  }
};
/* ==========================================================================
   💳 MOTOR: SALDO DE DISTRIBUIDORES (MYSQL / PHP)
   ========================================================================== */

window.toggleDistrisPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("distrisOverlay");
  if (!overlay) return;

  if (overlay.classList.contains("open") || overlay.style.display === "flex") {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    cerrarTodasLasVentanas();
    overlay.classList.add("open");
    overlay.style.setProperty("display", "flex", "important");
    overlay.style.setProperty("align-items", "center", "important");
    overlay.style.setProperty("justify-content", "center", "important");
    cargarDistribuidores();
  }
};

/* ==========================================================================
   💳 MOTOR: SALDO DE DISTRIBUIDORES CON BOTÓN DE COPIAR PARA CLIENTE/DISTRIBUIDOR
   ========================================================================== */

// 1. Cargar la lista de distribuidores con botón de copiar al lado del saldo
window.cargarDistribuidores = function () {
  if (typeof haptic === "function") haptic();
  const tbody = document.getElementById("tablaDistribuidores");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="2" style="text-align: center; padding: 40px; color: var(--ios-blue);">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
          <svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
          <span style="font-weight: 600;">Sincronizando distribuidores desde MySQL...</span>
        </div>
      </td>
    </tr>
  `;

  fetch("https://api.cybernetsp.com/obtener_distribuidores.php")
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success") {
        if (res.data.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="2" style="text-align: center; padding: 30px; color: var(--text-secondary);">
                No hay distribuidores registrados en la base de datos.
              </td>
            </tr>
          `;
          return;
        }

        let html = "";
        res.data.forEach((distri, idx) => {
          let saldoNum = (floatval =
            parseFloat(String(distri.saldo || 0).replace(/[^\d.]/g, "")) || 0);

          const saldoFormateado = new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
          }).format(saldoNum);

          const esFilaPar = idx % 2 === 0;
          const bgRow = esFilaPar
            ? "rgba(255, 255, 255, 0.015)"
            : "transparent";
          const nombreLimpio =
            distri.nombre && distri.nombre !== "Sin Nombre"
              ? distri.nombre
              : distri.telefono;

          html += `
            <tr class="distri-row-item" style="background: ${bgRow}; border-bottom: 1px solid rgba(255,255,255,0.03);">
              <td style="padding: 14px 18px; color: var(--text-primary);">
                <div style="font-weight: 800; font-size: 0.9rem;">${nombreLimpio}</div>
                <div style="font-size: 0.78rem; color: var(--text-secondary); font-family: monospace; margin-top: 2px;">📱 ${distri.telefono}</div>
              </td>
              <td style="padding: 14px 18px; text-align: right;">
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px;">
                  <span style="font-size: 1.1rem; font-weight: 800; color: ${saldoNum > 0 ? "#30d158" : "#ff453a"}; font-family: monospace;">
                    ${saldoFormateado}
                  </span>
                  <button type="button" onclick="window.copiarSaldoDistri(this, '${nombreLimpio.replace(/'/g, "\\'")}', '${saldoFormateado}')" title="Copiar reporte de saldo" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Copiar
                  </button>
                </div>
              </td>
            </tr>
          `;
        });
        tbody.innerHTML = html;
      } else {
        tbody.innerHTML = `<tr><td colspan="2" style="text-align: center; padding: 20px; color: var(--ios-red);">Error: ${res.message}</td></tr>`;
      }
    })
    .catch((err) => {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="2" style="text-align: center; padding: 20px; color: var(--ios-red);">❌ Error de conexión (obtener_distribuidores.php).</td></tr>`;
    });
};

// 2. Función para copiar el reporte de saldo listo para WhatsApp
window.copiarSaldoDistri = function (btn, nombre, saldoFormateado) {
  if (typeof haptic === "function") haptic();

  let nombreDisplay =
    nombre && nombre !== "Sin Nombre" && nombre.trim() !== ""
      ? nombre
      : "Distribuidor";

  const textoWhatsApp = `🔔 *NOTIFICACIÓN DE SALDO CYBERNET* 🚀\n────────────────────\n👤 *Distribuidor:* ${nombreDisplay}\n💰 *Saldo Disponible:* ${saldoFormateado}\n────────────────────\n✨ _¡Gracias por tu confianza y preferencia!_`;

  navigator.clipboard.writeText(textoWhatsApp).then(() => {
    let originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Copiado`;
    btn.style.setProperty("background", "#30d158", "important");
    btn.style.setProperty("color", "#000000", "important");
    btn.style.setProperty("border-color", "transparent", "important");

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Reporte de saldo copiado al portapapeles</span></div>`,
      );
    }

    setTimeout(() => {
      btn.innerHTML = originalHTML;
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

window.filtrarTablaRevendedores = function () {
  const query = document
    .getElementById("searchTablaDistris")
    .value.toLowerCase()
    .trim();
  const filas = document.querySelectorAll(
    "#tablaDistribuidores .distri-row-item",
  );

  filas.forEach((row) => {
    const texto = row.innerText.toLowerCase();
    row.style.display = texto.includes(query) ? "table-row" : "none";
  });
};
/* ==========================================================================
   🔴 MOTOR: BUZÓN GMAIL GLOBAL (VÍA PHP Y FETCH MODERNO)
   ========================================================================== */
window.correosGlobalesData = [];

window.toggleGmailPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("gmailOverlay");
  if (!overlay) return;

  if (overlay.classList.contains("open") || overlay.style.display === "flex") {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    cerrarTodasLasVentanas();
    overlay.classList.add("open");
    overlay.style.setProperty("display", "flex", "important");
    overlay.style.setProperty("align-items", "center", "important");
    overlay.style.setProperty("justify-content", "center", "important");

    const input = document.getElementById("inputBuscadorGmailReal");
    if (input) {
      input.value = "";
      setTimeout(() => input.focus(), 150);
    }

    const container = document.getElementById("gmailScrollArea");
    if (container) {
      container.innerHTML = `
        <div style="margin: auto; color: var(--text-secondary); text-align: center; padding: 40px 20px;">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#ea4335" stroke-width="1.8" style="margin-bottom: 12px; opacity: 0.6;">
             <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
             <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <br><span style="font-weight: 600; font-size: 0.9rem;">Ingresa un correo arriba para escanear su bandeja</span>
        </div>`;
    }
  }
};

window.ejecutarBusquedaGmailEspecifica = function () {
  if (typeof haptic === "function") haptic();

  const inputVisual = document.getElementById("inputBuscadorGmailReal");
  if (!inputVisual) return;
  const correoBuscar = inputVisual.value.trim();
  const container = document.getElementById("gmailScrollArea");

  if (correoBuscar === "") {
    alert("⚠️ Por favor ingresa el correo completo que deseas buscar.");
    inputVisual.focus();
    return;
  }

  if (container) {
    container.innerHTML = `
      <div style="text-align:center; padding:60px 20px; color:var(--text-secondary); font-size:0.95rem;">
        <svg class="spin-anim" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ea4335" stroke-width="2.5" style="margin-bottom:12px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
        <br><span style="color:#ea4335; font-weight:700;">Escaneando correos de la última hora para: ${correoBuscar}...</span>
      </div>`;
  }

  fetch(
    `https://api.cybernetsp.com/obtener_correos_gmail.php?correo=${encodeURIComponent(correoBuscar)}`,
  )
    .then((res) => res.json())
    .then((res) => {
      if (res && res.status === "success") {
        if (!res.data || res.data.length === 0) {
          if (container) {
            container.innerHTML =
              '<div style="text-align:center; padding:60px 20px; color:var(--ios-orange); font-weight:bold; font-size:1rem;">📭 No se encontraron correos nuevos para este destinatario.</div>';
          }
          return;
        }

        window.correosGlobalesData = res.data;
        let htmlTabla = `<table style="width: 100%; border-collapse: collapse; text-align: left;">`;

        res.data.forEach((mail, i) => {
          let remitenteLimpio = mail.remitente
            ? mail.remitente.replace(/<.*?>/g, "").trim()
            : "Desconocido";
          let destinatarioLimpio = mail.destinatario
            ? mail.destinatario.replace(/<.*?>/g, "").trim()
            : correoBuscar;

          htmlTabla += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s;" 
                onmouseover="this.style.background='rgba(234, 67, 53, 0.1)'" 
                onmouseout="this.style.background='transparent'" 
                onclick="abrirLectorCorreoGlobal(${i})">
               
               <td style="padding: 16px 12px; width: 35%; vertical-align: middle;">
                  <div style="color: var(--text-primary); font-weight: 800; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">${remitenteLimpio}</div>
                  <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">
                    Para: <span style="color: var(--ios-blue); font-family: monospace; font-weight: 600;">${destinatarioLimpio}</span>
                  </div>
               </td>
               
               <td style="padding: 16px 12px; width: 50%; vertical-align: middle;">
                  <div style="display: flex; flex-direction: column; gap: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 380px;">
                    <span style="color: var(--text-primary); font-weight: 700; font-size: 0.95rem;">${mail.asunto || "Sin asunto"}</span>
                    <span style="color: var(--text-secondary); font-size: 0.85rem;">${mail.fragmento || ""}</span>
                  </div>
               </td>
               
               <td style="padding: 16px 12px; width: 15%; text-align: right; vertical-align: middle;">
                  <div style="color: var(--text-secondary); font-size: 0.8rem; font-family: monospace; font-weight: bold;">${mail.fecha || ""}</div>
               </td>
            </tr>`;
        });

        htmlTabla += `</table>`;
        if (container) container.innerHTML = htmlTabla;
        if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");
      } else {
        if (container) {
          container.innerHTML = `<div style="color:var(--ios-red); text-align:center; padding:40px; font-weight:700;">Error: ${res ? res.message : "Fallo de comunicación con Google"}</div>`;
        }
      }
    })
    .catch((err) => {
      console.error(err);
      if (container) {
        container.innerHTML = `<div style="color:var(--ios-red); text-align:center; padding:40px; font-weight:700;">❌ Error al consultar obtener_correos_gmail.php</div>`;
      }
    });
};

window.abrirLectorCorreoGlobal = function (index) {
  if (typeof haptic === "function") haptic();
  let data = window.correosGlobalesData[index];

  if (data && data.cuerpoHtml) {
    const visorContent = document.getElementById("cuerpoLectorCorreoGlobal");
    const visorModal = document.getElementById("modalLectorCorreoGlobal");
    if (visorContent && visorModal) {
      visorContent.innerHTML = data.cuerpoHtml;
      visorModal.style.display = "flex";
    }
  } else {
    alert("No se pudo extraer el cuerpo de este correo.");
  }
};

window.cerrarLectorCorreoGlobal = function () {
  if (typeof haptic === "function") haptic();
  const visorModal = document.getElementById("modalLectorCorreoGlobal");
  const visorContent = document.getElementById("cuerpoLectorCorreoGlobal");
  if (visorModal) visorModal.style.display = "none";
  if (visorContent) visorContent.innerHTML = "";
};

/* ==========================================================================
   🗄️ VISOR MAESTRO DE BASE DE DATOS MYSQL (PANEL Y MODALES)
   ========================================================================== */

window.tablaMySQLActual = "netflix";
let searchTimeoutMySQL = null;

window.toggleMysqlPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("mysqlOverlay");
  if (!overlay) return;

  if (overlay.classList.contains("open") || overlay.style.display === "flex") {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    cerrarTodasLasVentanas();
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

/* ==========================================================================
   🗄️ RENDERIZADO VISUAL ESTILO CYBERNET (FONDO Y TONOS EXACTOS A LA IMAGEN)
   ========================================================================== */

window.cargarDatosMySQL = function () {
  const thead = document.getElementById("tablaMySQLCabecera");
  const tbody = document.getElementById("tablaMySQLCuerpo");
  if (!tbody || !thead) return;

  // Habilitar scroll horizontal en el contenedor padre si la pantalla es chica
  const tableNode = thead.closest("table");
  if (tableNode && tableNode.parentElement) {
    tableNode.parentElement.style.overflowX = "auto";
  }

  // 🛡️ INYECCIÓN DE ESTILOS: PALETA DE COLORES EXACTA A LA IMAGEN DE REFERENCIA
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
        min-width: 1100px !important;
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

  // ==========================================
  // 1. ENCABEZADOS CON ANCHOS (%) ESTRICTOS
  // ==========================================
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
        <th style="${thBase} width: 6%; color: #a1a1aa;">FECHA</th>
        <th style="${thBase} width: 20%; color: #a1a1aa;">CORREO / USUARIO</th>
        <th style="${thBase} width: 12%; color: #a1a1aa;">CONTRASEÑA</th>
        <th style="${thBase} width: 6%; color: #a1a1aa; text-align: center;">PERFIL</th>
        <th style="${thBase} width: 5%; color: #a1a1aa; text-align: center;">PIN</th>
        <th style="${thBase} width: 12%; color: #ff9500;">VENCIMIENTO</th>
        <th style="${thBase} width: 13%; color: #a1a1aa;">CLIENTE</th>
        <th style="${thBase} width: 10%; color: #a1a1aa;">TELÉFONO</th>
        <th style="${thBase} width: 16%; color: #a1a1aa; text-align: right; padding-right: 15px;">ACCIÓN</th>
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
              <button onclick="copiarTextoUnico(this, '${datoEscapado}')" style="background: transparent; border: none; color: #71717a; cursor: pointer; padding: 2px 4px; display: inline-flex; align-items: center; transition: color 0.2s ease; flex-shrink: 0;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#71717a'" title="Copiar al portapapeles">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            `;
          };

          const esSuperAdmin = true;

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

            let isCaida = fila.estado === "caida" || fila.es_caida == 1;

            // ==========================================
            // BANNER DIVISOR AZUL POR FECHA (EXACTO A LA CAPTURA)
            // ==========================================
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
            let filaJsonEscapada = encodeURIComponent(JSON.stringify(fila));

            // ==========================================
            // CELDAS ESTILIZADAS NATIVAS
            // ==========================================
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

            // BOTONES DE ACCIÓN
            let botonesEdicionIzquierda = "";
            if (numeroVal !== "-" && numeroVal.trim() !== "") {
              botonesEdicionIzquierda = `
                <button onclick="abrirModalEditarMySQL('${filaJsonEscapada}')" title="Editar" style="background: rgba(10, 132, 255, 0.12); border: 1px solid rgba(10, 132, 255, 0.25); border-radius: 6px; padding: 5px; color: #0a84ff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                <button onclick="eliminarRegistroMySQL(${fila.id}, '${encodeURIComponent(correoVal)}')" title="Eliminar" style="background: rgba(255, 69, 58, 0.12); border: 1px solid rgba(255, 69, 58, 0.25); border-radius: 6px; padding: 5px; color: #ff453a; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
              `;
            }

            let botonCopiar = `<button onclick="copiarAccesoMySQL(this, '${textoEscapadoFicha}')" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; padding: 5px 12px; border-radius: 8px; font-size: 0.72rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">📋 Copiar</button>`;

            // ==========================================
            // RENDER DE FILAS
            // ==========================================
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
                  <td style="${tdBase} text-align: right; padding-right: 15px;">
                    <div style="display: flex; gap: 6px; justify-content: flex-end; align-items: center;">
                      ${botonesEdicionIzquierda}
                      ${botonCopiar}
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
                : `<button onclick="marcarComoGarantia(${fila.id}, '${encodeURIComponent(correoVal)}', '${encodeURIComponent(claveVal)}', '${encodeURIComponent(provVal)}', '${encodeURIComponent(diaVal)}')" style="background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.3); color: #ff453a; padding: 5px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">🚨 Reportar</button>`;

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
// 📋 COPIAR ACCESO COMPLETO (BOTÓN "COPIAR" CON ANIMACIÓN VERDE)
// =========================================================================
window.copiarAccesoMySQL = function (btn, textoEscapado) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(textoEscapado);

  navigator.clipboard.writeText(texto).then(() => {
    let oldText = btn.innerHTML;

    // Animación visual de éxito
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copiado`;
    btn.style.setProperty("background", "var(--ios-green)", "important");
    btn.style.setProperty("color", "#ffffff", "important");
    btn.style.setProperty("border-color", "transparent", "important");

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Copiado al portapapeles</span></div>`,
      );
    }

    // Regresa el botón a la normalidad
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

// =========================================================================
// 📋 COPIAR DATOS AISLADOS (CORREO, CLAVE) - ÍCONO SVG INLINE
// =========================================================================
window.copiarTextoUnico = function (btn, textoEscapado) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(textoEscapado);

  navigator.clipboard.writeText(texto).then(() => {
    const originalHTML = btn.innerHTML;
    // Rellena el SVG de color verde temporalmente para dar feedback visual en la celda
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#30d158" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Dato copiado al portapapeles</span></div>`,
      );
    }

    setTimeout(() => {
      btn.innerHTML = originalHTML;
    }, 1500);
  });
};

// =========================================================================
// ⏳ CUENTA TEMPORAL DESDE EL BOTÓN "TEMP" DE MYSQL (CON ANIMACIÓN)
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
            // 🔥 ANIMACIÓN VISUAL EN EL BOTÓN "TEMP"
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

            if (typeof triggerToast === "function") {
              triggerToast(
                `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Cuenta temporal copiada al portapapeles</span></div>`,
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
};

window.cerrarModalEditarMySQL = function () {
  if (typeof haptic === "function") haptic();
  const modal = document.getElementById("modalEditarMySQL");
  if (modal) modal.style.display = "none";
};

/* ==========================================================================
   🗑️ ELIMINACIÓN MASIVA POR CORREO ASOCIADO EN MYSQL
   ========================================================================== */
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
        cargarDatosMySQL(); // Refresca la tabla
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
        cargarDatosMySQL();
      } else {
        alert("❌ " + data.message);
      }
    })
    .catch((err) => alert("❌ Error al procesar la eliminación por fecha."));
};

window.copiarAccesoMySQL = function (btn, textoEscapado) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(textoEscapado);

  navigator.clipboard.writeText(texto).then(() => {
    let oldText = btn.innerHTML;
    btn.innerHTML = "✅ Copiado";
    btn.style.background = "#30d158";
    btn.style.color = "#000";
    btn.style.borderColor = "transparent";

    setTimeout(() => {
      btn.innerHTML = oldText;
      btn.style.background = "rgba(255, 255, 255, 0.08)";
      btn.style.color = "#ffffff";
      btn.style.borderColor = "rgba(255, 255, 255, 0.15)";
    }, 1500);
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
        cargarDatosMySQL();
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
/* ==========================================================================
   ✅ LÓGICA DE RESOLUCIÓN DE GARANTÍAS (MYSQL)
   ========================================================================== */

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

  // Por defecto, carga el correo viejo para que solo deba cambiar la clave si quiere
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
        // ESTE ERROR ES EL QUE VERÁS SI PHP TIENE ALGUN PROBLEMA: Te dirá la línea exacta
        throw new Error("Respuesta inválida del servidor PHP: \n\n" + text);
      }
    })
    .then((data) => {
      btn.disabled = false;
      btn.innerHTML = "Guardar y Resolver";

      if (data.status === "success") {
        cerrarModalResolverMySQL();
        cargarDatosMySQL(); // Refresca la tabla en vivo para quitar lo rojo

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
      alert("❌ " + err.message); // Arroja el error claro
    });
};
// =========================================================================
// 🚀 UPGRADE: ISLA DINÁMICA INTELIGENTE (Efecto Apple Morphic Blindado)
// =========================================================================
window.triggerToast = function (mensajeHtml) {
  const isla = document.getElementById("appleToast");
  if (!isla) return;

  // 1. Limpiar estados anteriores de golpe
  isla.classList.remove("island-active");
  isla.innerHTML = "";

  // 2. Pequeño delay para permitir el reinicio físico y brote elástico
  setTimeout(() => {
    // 🔥 FORZAMOS ESTILOS INLINE: Asegura que el texto JAMÁS se quede invisible o negro
    isla.innerHTML = `
      <div style="opacity: 1 !important; visibility: visible !important; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; padding: 0 15px; color: #ffffff; font-size: 0.9rem; font-weight: 600; animation: fadeIn 0.3s ease forwards;">
        ${mensajeHtml}
      </div>
    `;
    isla.classList.add("island-active");

    // Sonido pop sutil si el motor de audio está activo
    if (typeof CyberSonidos !== "undefined") CyberSonidos.play("pop");
  }, 40);

  // 3. Temporizador de Auto-Cierre
  clearTimeout(window.islandTimer);
  window.islandTimer = setTimeout(() => {
    isla.classList.remove("island-active");
    // Esperamos a que termine de encogerse para limpiar el texto por dentro
    setTimeout(() => {
      isla.innerHTML = "";
    }, 400);
  }, 3500);
};

/* ==========================================================================
   🛒 MOTOR DE VENTAS Y FILAS DINÁMICAS OPTIMIZADAS
   ========================================================================== */

window.stockPlataformasVentas = {};
let contadorFilasVentas = 0;

// Cargar el conteo de perfiles libres desde MySQL
window.cargarStockParaPanelVentas = function () {
  const formData = new FormData();
  formData.append("accion", "obtener_stock_plataformas");

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success" && data.stock) {
        window.stockPlataformasVentas = data.stock;
        window.actualizarOpcionesStockDropdown();
      }
    })
    .catch((err) => console.error("Error al cargar stock de ventas:", err));
};

// Actualizar texto de opciones dinámicas
window.actualizarOpcionesStockDropdown = function () {
  const selects = document.querySelectorAll(".sel-servicio");
  selects.forEach((select) => {
    const valorSeleccionado = select.value;
    Array.from(select.options).forEach((opt) => {
      const val = opt.value;
      if (val && val !== "RECARGA") {
        const cant =
          window.stockPlataformasVentas[val] !== undefined
            ? window.stockPlataformasVentas[val]
            : 0;
        opt.textContent = `${val} (${cant} libres)`;
      }
    });
    select.value = valorSeleccionado;
  });
};

window.obtenerTextoOptionStock = function (plat) {
  const cant =
    window.stockPlataformasVentas[plat] !== undefined
      ? window.stockPlataformasVentas[plat]
      : 0;
  return `${plat} (${cant} libres)`;
};

// Generar Fila de Combo Estilizada y Compacta
window.agregarFilaServicioCombo = function () {
  contadorFilasVentas++;
  const idFila = `filaServicio_${contadorFilasVentas}`;
  const contenedor = document.getElementById("contenedorFilasServicios");

  const div = document.createElement("div");
  div.id = idFila;
  div.style.cssText =
    "display: flex; flex-direction: column; gap: 6px; background: rgba(0, 0, 0, 0.35); padding: 10px; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.08); flex-shrink: 0;";

  div.innerHTML = `
    <div style="display: flex; gap: 6px; align-items: center; width: 100%;">
      <select class="input-ios sel-servicio" onchange="alCambiarServicioVenta('${idFila}', this.value)" style="flex: 2; min-width: 0; background: rgba(0, 0, 0, 0.4) !important; padding: 10px; border-radius: 10px; font-size: 0.82rem; color: #ffffff; font-weight: 800; border: 1px solid rgba(255, 255, 255, 0.1); outline: none;" required>
        <option value="" disabled selected>— Elige servicio —</option>
        <option value="RECARGA">💼 Recarga de Saldo</option>
        <option value="NETFLIX">${window.obtenerTextoOptionStock("NETFLIX")}</option>
        <option value="DIRECTV GO">${window.obtenerTextoOptionStock("DIRECTV GO")}</option>
        <option value="AMAZON">${window.obtenerTextoOptionStock("AMAZON")}</option>
        <option value="DISNEY PREMIUM">${window.obtenerTextoOptionStock("DISNEY PREMIUM")}</option>
        <option value="DISNEY ESTANDAR">${window.obtenerTextoOptionStock("DISNEY ESTANDAR")}</option>
        <option value="HBO MAX">${window.obtenerTextoOptionStock("HBO MAX")}</option>
        <option value="CRUNCHYROLL">${window.obtenerTextoOptionStock("CRUNCHYROLL")}</option>
        <option value="VIX">${window.obtenerTextoOptionStock("VIX")}</option>
        <option value="PLEX">${window.obtenerTextoOptionStock("PLEX")}</option>
        <option value="PARAMOUNT">${window.obtenerTextoOptionStock("PARAMOUNT")}</option>
        <option value="APPLE TV">${window.obtenerTextoOptionStock("APPLE TV")}</option>
        <option value="YOUTUBE">${window.obtenerTextoOptionStock("YOUTUBE")}</option>
      </select>

      <select class="input-ios sel-pantallas" style="display: none; flex: 1; min-width: 0; background: rgba(0, 0, 0, 0.4) !important; padding: 10px 6px; border-radius: 10px; font-size: 0.8rem; color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.1); outline: none;">
        <option value="1">1 Pant.</option>
        <option value="2">2 Pant.</option>
        <option value="3">3 Pant.</option>
        <option value="4">4 Pant.</option>
        <option value="5">5 Pant.</option>
      </select>

      <select class="input-ios sel-meses" style="display: none; flex: 1; min-width: 0; background: rgba(0, 0, 0, 0.4) !important; padding: 10px 6px; border-radius: 10px; font-size: 0.8rem; color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.1); outline: none;">
        <option value="1">1 Mes</option>
        <option value="2">2 Meses</option>
        <option value="3">3 Meses</option>
        <option value="4">4 Meses</option>
        <option value="5">5 Meses</option>
      </select>

      <select class="input-ios sel-bono" style="display: none; flex: 1; min-width: 0; background: rgba(0, 0, 0, 0.4) !important; padding: 10px 6px; border-radius: 10px; font-size: 0.8rem; color: #ffd60a; font-weight: 800; border: 1px solid rgba(255, 214, 10, 0.25); outline: none;">
        <option value="0">0% Bono</option>
        <option value="5">5%</option>
        <option value="10">10%</option>
        <option value="15">15%</option>
        <option value="20">20%</option>
        <option value="25">25%</option>
        <option value="30">30%</option>
      </select>

      ${contadorFilasVentas > 1 ? `<button type="button" onclick="document.getElementById('${idFila}').remove()" style="background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.3); color: #ff453a; width: 34px; height: 38px; border-radius: 10px; cursor: pointer; font-weight: 800; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">✕</button>` : ""}
    </div>

    <div class="row-netflix-tipo" style="display: none; width: 100%;">
      <select class="input-ios sel-tipo-netflix" style="width: 100%; background: rgba(10, 132, 255, 0.1) !important; padding: 8px 10px; border-radius: 8px; font-size: 0.78rem; color: #0a84ff; font-weight: 800; border: 1px solid rgba(10, 132, 255, 0.25); outline: none;">
        <option value="Nueva">Nueva</option>
        <option value="Renovar">Renovar</option>
      </select>
    </div>
  `;

  if (contenedor) {
    contenedor.appendChild(div);
    // Desplazamiento automático inteligente hacia la nueva fila
    contenedor.scrollTop = contenedor.scrollHeight;
  }
};

// Toggle del panel
window.toggleVentasPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("ventasOverlay");
  if (!overlay) return;

  if (overlay.style.display === "flex" || overlay.classList.contains("open")) {
    overlay.style.display = "none";
    overlay.classList.remove("open");
  } else {
    if (typeof cerrarTodasLasVentanas === "function") cerrarTodasLasVentanas();

    overlay.style.display = "flex";
    overlay.classList.add("open");

    const form = document.getElementById("formRegistrarVentaModal");
    if (form) form.reset();

    const contenedor = document.getElementById("contenedorFilasServicios");
    if (contenedor) contenedor.innerHTML = "";
    contadorFilasVentas = 0;

    window.agregarFilaServicioCombo();
    window.cargarStockParaPanelVentas();
  }
};

// Ajustar dinámicamente el ancho al elegir plataforma
window.alCambiarServicioVenta = function (idFila, valServicio) {
  const fila = document.getElementById(idFila);
  if (!fila) return;

  const selServicio = fila.querySelector(".sel-servicio");
  const selPantallas = fila.querySelector(".sel-pantallas");
  const selMeses = fila.querySelector(".sel-meses");
  const selBono = fila.querySelector(".sel-bono");
  const rowNetflix = fila.querySelector(".row-netflix-tipo");

  if (!valServicio) {
    // Si no ha elegido nada: barra ancha completa (Imagen 2)
    selServicio.style.flex = "1";
    selPantallas.style.display = "none";
    selMeses.style.display = "none";
    selBono.style.display = "none";
    rowNetflix.style.display = "none";
  } else if (valServicio === "NETFLIX") {
    selServicio.style.flex = "2";
    selPantallas.style.display = "block";
    selMeses.style.display = "block";
    selBono.style.display = "none";
    rowNetflix.style.display = "block";
  } else if (valServicio === "RECARGA") {
    selServicio.style.flex = "2";
    selPantallas.style.display = "none";
    selMeses.style.display = "none";
    selBono.style.display = "block";
    rowNetflix.style.display = "none";
  } else {
    // Otras plataformas
    selServicio.style.flex = "2";
    selPantallas.style.display = "block";
    selMeses.style.display = "block";
    selBono.style.display = "none";
    rowNetflix.style.display = "none";
  }
};

// 📱 DETECCIÓN EN VIVO DEL TELÉFONO DEL STAFF
window.verificarNumeroStaffEnVivo = function (numeroIngresado) {
  const numLimpio = String(numeroIngresado).trim();
  const selectBanco = document.getElementById("vendedorMedioPago");
  let optNomina = document.getElementById("optDescontarNomina");

  if (numLimpio.length >= 7 && window.staffTelefonosList.includes(numLimpio)) {
    if (!optNomina) {
      optNomina = document.createElement("option");
      optNomina.id = "optDescontarNomina";
      optNomina.value = "Descontar de Nómina";
      optNomina.innerText = "Descontar de Nómina";
      selectBanco.appendChild(optNomina);

      if (typeof triggerToast === "function") {
        triggerToast(
          "✨ Teléfono de Staff detectado. Opción Nómina habilitada.",
        );
      }
    }
  } else {
    if (optNomina) {
      if (selectBanco.value === "Descontar de Nómina") selectBanco.value = "";
      optNomina.remove();
    }
  }
};

/* ==========================================================================
   🛒 PROCESADOR DE VENTAS (MUESTRA RECARGA EN POSITIVO O DÉBITO EN RESTA)
   ========================================================================== */

window.ejecutarVentaFinal = function (e) {
  if (e) e.preventDefault();

  try {
    if (typeof haptic === "function") haptic();

    const inputNombre = document.getElementById("vendedorClienteNombre");
    const inputCelular = document.getElementById("vendedorClienteCelular");
    const inputMonto = document.getElementById("vendedorMontoCobrado");
    const selectPago = document.getElementById("vendedorMedioPago");

    if (!inputCelular || !inputMonto || !selectPago) {
      alert("❌ Error: No se encontraron los campos del cliente.");
      return;
    }

    const clienteNombre = inputNombre ? inputNombre.value.trim() : "";
    const clienteCelular = inputCelular.value.trim();
    const montoCobrado = inputMonto.value.trim();
    const medioPago = selectPago.value;

    if (!clienteCelular || !medioPago) {
      alert("⚠️ Por favor completa los campos obligatorios.");
      return;
    }

    const contenedor = document.getElementById("contenedorFilasServicios");
    if (!contenedor) return;

    const filasUI = contenedor.children;
    let servicios = [];
    let resumenConfirmarArray = [];

    for (let i = 0; i < filasUI.length; i++) {
      const fila = filasUI[i];
      const selPlat = fila.querySelector(".sel-servicio");
      if (selPlat && selPlat.value && selPlat.value !== "") {
        const platVal = selPlat.value;
        const selPant = fila.querySelector(".sel-pantallas");
        const selMes = fila.querySelector(".sel-meses");
        const selBono = fila.querySelector(".sel-bono");
        const selTipo = fila.querySelector(".sel-tipo-netflix");

        const numPantallas = selPant ? selPant.value : "1";
        const numMeses = selMes ? selMes.value : "1";
        const tipoServicio = selTipo ? selTipo.value : "Nueva";
        const bonoServicio = selBono ? selBono.value : "0";

        const correoReno = fila.getAttribute("data-correo-reno") || "";
        const perfilReno = fila.getAttribute("data-perfil-reno") || "";

        servicios.push({
          plataforma: platVal,
          pantallas: numPantallas,
          meses: numMeses,
          bono: bonoServicio,
          tipo: tipoServicio,
          correoReno:
            correoReno && perfilReno
              ? `${correoReno} | Perfil: ${perfilReno}`
              : correoReno,
          perfil: perfilReno,
        });

        if (platVal === "RECARGA") {
          resumenConfirmarArray.push(
            `   • Recarga de Saldo (${bonoServicio}% Bono)`,
          );
        } else {
          let txtTipo =
            tipoServicio === "Renovar" && correoReno !== ""
              ? `Reno: ${correoReno}`
              : tipoServicio;
          resumenConfirmarArray.push(
            `   • ${numPantallas}x ${platVal} ➔ [${numMeses} Mes(es) / ${txtTipo}]`,
          );
        }
      }
    }

    if (servicios.length === 0) {
      alert("⚠️ Por favor selecciona al menos un servicio a entregar.");
      return;
    }

    let clienteDisplay =
      clienteNombre && clienteNombre !== "Sin Nombre"
        ? clienteNombre
        : clienteCelular;
    let mensajeConfirmacion = `❓ ¿CONFIRMAR REGISTRO DE VENTA? 🍿\n────────────────────────────\n👤 Cliente / Distribuidor: ${clienteDisplay}\n📞 Celular: ${clienteCelular}\n🏦 Recibe: ${medioPago}\n💰 Valor Cobrado: ${montoCobrado || "$0"}\n\n📺 Cuentas a entregar:\n${resumenConfirmarArray.join("\n")}\n────────────────────────────\n¿Estás seguro de que los datos ingresados son correctos?`;

    if (!confirm(mensajeConfirmacion)) return;

    const btnSubmit = document.getElementById("btnEjecutarVenta");
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right:6px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Procesando Venta...`;
    }

    const formData = new FormData();
    formData.append("accion", "realizar_venta");
    formData.append("cliente_nombre", clienteNombre || "Sin Nombre");
    formData.append("cliente_celular", clienteCelular);
    formData.append("monto_cobrado", montoCobrado || "$0");
    formData.append("medio_pago", medioPago);
    formData.append("servicios_json", JSON.stringify(servicios));

    fetch("https://api.cybernetsp.com/acciones_mysql.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.text())
      .then((text) => {
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          throw new Error("Respuesta no válida de PHP:\n\n" + text);
        }

        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = "Realizar Venta";
        }

        if (data.status === "sin_stock") {
          alert(
            "❌ NO HAY STOCK DISPONIBLE\n\nNo hay cuentas/perfiles libres en MySQL para la(s) plataforma(s) seleccionada(s).\n\n⚠️ ¡Toca surtir la base de datos para poder realizar esta entrega!",
          );
          return;
        }

        if (data.status === "success" || data.status === "parcial") {
          if (typeof toggleVentasPanel === "function") toggleVentasPanel();

          // 1. FICHA RESUMEN PARA EL CLIENTE
          let nombreSaludo =
            clienteNombre && clienteNombre !== "Sin Nombre"
              ? " " + clienteNombre
              : "";
          let fichaTexto = `🌟 *¡Hola${nombreSaludo}!*\n\nTu pedido ha sido procesado con éxito. Aquí tienes tus accesos:\n`;

          if (data.entregados && data.entregados.length > 0) {
            data.entregados.forEach((item) => {
              if (item.esRecarga) {
                fichaTexto += `\n💼 *RECARGA DE SALDO* ✅\n────────────────────\n💰 *Monto Inyectado:* ${item.monto}\n🎁 *Bono Aplicado:* ${item.bono}%\n`;
              } else {
                let platFormat = item.plataforma.replace(/_/g, " ");
                let textoMeses =
                  parseInt(item.meses) > 1 ? ` (${item.meses} Meses)` : "";

                fichaTexto += `\n🎬 *DETALLES DE ${platFormat}*${textoMeses} ✅\n────────────────────\n`;

                if (item.plataforma === "NETFLIX") {
                  fichaTexto += `⚠️ *Para iniciar sesión:* Cuando te pida un código, selecciona *Obtener ayuda* y después *Usar contraseña*.\n\n`;
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

                fichaTexto += `👤 *${etiquetaUser}:* ${item.correo}\n🔐 *Contraseña:* ${item.clave}\n`;

                if (item.perfil && item.perfil !== "") {
                  fichaTexto += `🌐 *${etiquetaPerfil}:* ${item.perfil}\n`;
                }
                if (item.pin && item.pin !== "") {
                  fichaTexto += `📍 *PIN:* ${item.pin}\n`;
                }
                fichaTexto += `📅 *Vence:* ${item.vencimiento}\n`;

                if (item.plataforma === "NETFLIX") {
                  fichaTexto += `\n🤖 *¿NECESITAS UN CÓDIGO?* Puedes usar nuestra pagina para codigos disponible 24/7: www.cybernetsp.com/\n`;
                }
              }
            });
          }

          if (data.pendientes && data.pendientes.length > 0) {
            fichaTexto += `\n⚠️ *SERVICIOS PENDIENTES POR SURTIR:*\n`;
            data.pendientes.forEach((p) => {
              fichaTexto += `⏳ ${p} (En breve se te entregará)\n`;
            });
          }

          fichaTexto += `\n📢 *INFORMACIÓN IMPORTANTE:* \n────────────────────\n⚠️ *Garantía activa:* Tu servicio cuenta con respaldo total durante su vigencia. \n🆘 *Soporte:* Si presentas algún inconveniente, *infórmanos de inmediato* para brindarte una solución rápida.\n\n💎 *Disfruta tu servicio.*\n✨ *¡Gracias por elegirnos!* ✨`;

          // 2. CONFIGURAR REPORTE DE SALDO PARA DISTRIBUIDOR (RECARGA POSITIVA VS DÉBITO NEGARIVO)
          const btnSaldo = document.getElementById("btnCopiarSaldoRevendedor");

          if (data.esDistribuidor === true) {
            let distriNombre = data.nombreDistribuidor;
            if (
              !distriNombre ||
              distriNombre === "Sin Nombre" ||
              distriNombre.trim() === ""
            ) {
              distriNombre =
                clienteNombre && clienteNombre !== "Sin Nombre"
                  ? clienteNombre
                  : clienteCelular;
            }

            if (data.esRecarga === true) {
              // 📈 ES UNA RECARGA DE SALDO (SUMA / ABONO POSITIVO)
              let textoBono =
                data.bonoAplicado && parseFloat(data.bonoAplicado) > 0
                  ? `\n🎁 *Bono Aplicado:* ${data.bonoAplicado}%`
                  : "";

              window.textoSaldoRevendedorGlobal = `🔔 *NOTIFICACIÓN DE RECARGA DE SALDO CYBERNET* 🚀\n────────────────────\n👤 *Distribuidor:* ${distriNombre}\n📈 *Monto Recargado:* +${data.montoCobrado || montoCobrado}${textoBono}\n💰 *Saldo Disponible:* ${data.saldoNuevo || "$0"}\n────────────────────\n✨ _¡Gracias por recargar tu saldo en Cybernet!_`;
            } else {
              // 📉 ES UN DÉBITO POR COMPRA DE PLATAFORMA (RESTA)
              window.textoSaldoRevendedorGlobal = `🔔 *NOTIFICACIÓN DE DÉBITO POR COMPRA CYBERNET* 🚀\n────────────────────\n👤 *Distribuidor:* ${distriNombre}\n📉 *Débito por compra:* -${data.montoCobrado || montoCobrado}\n💰 *Saldo Disponible:* ${data.saldoNuevo || "$0"}\n────────────────────\n✨ _¡Gracias por tu compra mayorista en Cybernet!_`;
            }

            if (btnSaldo)
              btnSaldo.style.setProperty("display", "flex", "important");
          } else {
            window.textoSaldoRevendedorGlobal = "";
            if (btnSaldo)
              btnSaldo.style.setProperty("display", "none", "important");
          }

          const outputArea = document.getElementById("outputTextoVentaFicha");
          const modalGenerado = document.getElementById(
            "ventaGeneradaModalOverlay",
          );

          if (outputArea && modalGenerado) {
            outputArea.value = fichaTexto;
            modalGenerado.style.setProperty("display", "flex", "important");
            modalGenerado.classList.add("open");
          }

          if (typeof cargarDatosMySQL === "function") cargarDatosMySQL();
        } else {
          alert(
            "❌ Error: " + (data.message || "No se pudo procesar la venta."),
          );
        }
      })
      .catch((err) => {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = "Realizar Venta";
        }
        console.error(err);
        alert("❌ Error de comunicación: " + err.message);
      });
  } catch (errorCapturado) {
    console.error("Error en ejecutarVentaFinal:", errorCapturado);
    alert("❌ Error interno: " + errorCapturado.message);
  }
};
/* ==========================================================================
   📋 FUNCIONES DE CONTROL PARA EL MODAL DE VENTA REGISTRADA
   ========================================================================== */

// Copiar la Ficha de Accesos (Botón Blanco)
window.copiarTextoFichaVentaDefinitiva = function () {
  if (typeof haptic === "function") haptic();
  const area = document.getElementById("outputTextoVentaFicha");
  const btn = document.getElementById("btnCopiarFichaVenta");
  if (!area) return;

  navigator.clipboard.writeText(area.value).then(() => {
    if (btn) {
      const oldHtml = btn.innerHTML;
      btn.innerHTML = `✅ ¡Ficha Copiada!`;
      btn.style.background = "#30d158";
      btn.style.color = "#ffffff";

      setTimeout(() => {
        btn.innerHTML = oldHtml;
        btn.style.background = "#ffffff";
        btn.style.color = "#000000";
      }, 1500);
    }

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Ficha copiada al portapapeles</span></div>`,
      );
    }
  });
};

// Copiar el Reporte de Saldo (Botón Naranja)
window.copiarTextoSaldoRevendedorDefinitiva = function () {
  if (typeof haptic === "function") haptic();
  const btn = document.getElementById("btnCopiarSaldoRevendedor");
  const textoSaldo = window.textoSaldoRevendedorGlobal || "";

  if (!textoSaldo) return;

  navigator.clipboard.writeText(textoSaldo).then(() => {
    if (btn) {
      const oldHtml = btn.innerHTML;
      btn.innerHTML = `✅ ¡Reporte de Saldo Copiado!`;
      btn.style.background = "#30d158";

      setTimeout(() => {
        btn.innerHTML = oldHtml;
        btn.style.background = "#ff9f0a";
      }, 1500);
    }

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Reporte de saldo copiado</span></div>`,
      );
    }
  });
};

// Cerrar Modal
window.cerrarModalVentaGenerada = function () {
  if (typeof haptic === "function") haptic();
  const modal = document.getElementById("ventaGeneradaModalOverlay");
  if (modal) {
    modal.classList.remove("open");
    modal.style.display = "none";
  }
};

/* ==========================================================================
   🔄 RENOVACIÓN NETFLIX EN MYSQL (POST FORMDATA)
   ========================================================================== */

window.buscarHistorialNetflixEnVenta = function (telefono) {
  let telLimpio = String(telefono).replace(/\D/g, "").trim();

  if (telLimpio.length < 6) {
    window.cuentasNetflixClienteActivo = [];
    return;
  }

  clearTimeout(window.timeoutBusquedaNet);
  window.timeoutBusquedaNet = setTimeout(() => {
    const formData = new FormData();
    formData.append("accion", "buscar_renovacion_netflix");
    formData.append("tel", telLimpio);

    fetch("https://api.cybernetsp.com/acciones_mysql.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        window.cuentasNetflixClienteActivo = [];
        if (res && res.status === "success" && res.data.length > 0) {
          window.cuentasNetflixClienteActivo = res.data;
          if (typeof triggerToast === "function") {
            triggerToast(
              "✨ ¡Historial de Netflix encontrado para este cliente!",
            );
          }
        }
      })
      .catch((err) => console.error("Error al buscar historial Netflix:", err));
  }, 400);
};

/* ==========================================================================
   🔄 RENOVACIÓN EXCLUSIVA DE NETFLIX EN MYSQL
   ========================================================================== */

window.alCambiarTipoVenta = function (idFila) {
  const fila = document.getElementById(idFila);
  if (!fila) return;

  const selectTipo = fila.querySelector(".sel-tipo-netflix");
  const inputCorreo = fila.querySelector(".input-correo-vta");
  const selPlat = fila.querySelector(".sel-servicio");
  const celInput = document.getElementById("vendedorClienteCelular");
  const telNum = celInput ? celInput.value.replace(/\D/g, "").trim() : "";

  // La opción 'Renovar' es EXCLUSIVA para NETFLIX
  if (selPlat && selPlat.value !== "NETFLIX") {
    if (selectTipo) selectTipo.value = "Nueva";
    if (inputCorreo) {
      inputCorreo.style.display = "none";
      inputCorreo.value = "";
    }
    return;
  }

  if (
    selectTipo &&
    selectTipo.value === "Renovar" &&
    selPlat &&
    selPlat.value === "NETFLIX"
  ) {
    if (!telNum || telNum.length < 6) {
      alert(
        "⚠️ Por favor ingresa primero el número de celular del cliente en la casilla de arriba.",
      );
      selectTipo.value = "Nueva";
      if (inputCorreo) inputCorreo.style.display = "none";
      return;
    }

    if (inputCorreo) {
      inputCorreo.style.display = "block";
      inputCorreo.value = "⏳ Consultando cuentas en MySQL...";
    }

    const formData = new FormData();
    formData.append("accion", "buscar_renovacion_netflix");
    formData.append("tel", telNum);

    fetch("https://api.cybernetsp.com/acciones_mysql.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.text())
      .then((text) => {
        let res;
        try {
          res = JSON.parse(text);
        } catch (e) {
          console.error("Respuesta PHP no válida:", text);
          alert("❌ Error PHP:\n\n" + text);
          selectTipo.value = "Nueva";
          if (inputCorreo) inputCorreo.style.display = "none";
          return;
        }

        if (res && res.status === "error") {
          alert("❌ Error MySQL: " + res.message);
          selectTipo.value = "Nueva";
          if (inputCorreo) inputCorreo.style.display = "none";
          return;
        }

        if (
          res &&
          res.status === "success" &&
          res.data &&
          res.data.length > 0
        ) {
          window.cuentasNetflixClienteActivo = res.data;
          if (inputCorreo) inputCorreo.value = "";
          window.abrirModalRenovacionNet(idFila);
        } else {
          alert(
            `⚠️ No se encontraron cuentas activas de Netflix registradas previamente para el teléfono ${telNum} en la base de datos.`,
          );
          selectTipo.value = "Nueva";
          if (inputCorreo) {
            inputCorreo.style.display = "none";
            inputCorreo.value = "";
          }
        }
      })
      .catch((err) => {
        console.error("Error al consultar renovación:", err);
        alert("❌ Error de comunicación con el servidor.");
        selectTipo.value = "Nueva";
        if (inputCorreo) inputCorreo.style.display = "none";
      });
  } else {
    if (inputCorreo) {
      inputCorreo.style.display = "none";
      inputCorreo.value = "";
    }
    fila.removeAttribute("data-correo-reno");
    fila.removeAttribute("data-perfil-reno");
  }
};

// Vinculamos la búsqueda en vivo cuando digitan el celular del cliente
document.addEventListener("DOMContentLoaded", () => {
  const inputCelular = document.getElementById("vendedorClienteCelular");
  if (inputCelular) {
    inputCelular.addEventListener("input", function () {
      window.buscarHistorialNetflixEnVenta(this.value);
    });
  }
});

// 2. Generar fila de combo con selector + campo interactivo
window.agregarFilaServicioCombo = function () {
  contadorFilasVentas++;
  const idFila = `filaServicio_${contadorFilasVentas}`;
  const contenedor = document.getElementById("contenedorFilasServicios");

  const getTxt = (plat) => {
    const cant =
      window.stockPlataformasVentas[plat] !== undefined
        ? window.stockPlataformasVentas[plat]
        : 0;
    return `${plat} (${cant} libres)`;
  };

  const div = document.createElement("div");
  div.id = idFila;
  div.style.cssText =
    "display: flex; flex-direction: column; gap: 6px; background: rgba(0, 0, 0, 0.35); padding: 10px; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.08); flex-shrink: 0;";

  div.innerHTML = `
    <div style="display: flex; gap: 6px; align-items: center; width: 100%;">
      <select class="input-ios sel-servicio" onchange="alCambiarServicioVenta('${idFila}', this.value)" style="flex: 2; min-width: 0; background: rgba(0, 0, 0, 0.4) !important; padding: 10px; border-radius: 10px; font-size: 0.82rem; color: #ffffff; font-weight: 800; border: 1px solid rgba(255, 255, 255, 0.1); outline: none;" required>
        <option value="" disabled selected>— Elige servicio —</option>
        <option value="RECARGA">💼 Recarga de Saldo</option>
        <option value="NETFLIX">${getTxt("NETFLIX")}</option>
        <option value="DIRECTV GO">${getTxt("DIRECTV GO")}</option>
        <option value="AMAZON">${getTxt("AMAZON")}</option>
        <option value="DISNEY PREMIUM">${getTxt("DISNEY PREMIUM")}</option>
        <option value="DISNEY ESTANDAR">${getTxt("DISNEY ESTANDAR")}</option>
        <option value="HBO MAX">${getTxt("HBO MAX")}</option>
        <option value="CRUNCHYROLL">${getTxt("CRUNCHYROLL")}</option>
        <option value="VIX">${getTxt("VIX")}</option>
        <option value="PLEX">${getTxt("PLEX")}</option>
        <option value="PARAMOUNT">${getTxt("PARAMOUNT")}</option>
        <option value="APPLE TV">${getTxt("APPLE TV")}</option>
        <option value="YOUTUBE">${getTxt("YOUTUBE")}</option>
      </select>

      <select class="input-ios sel-pantallas" style="display: none; flex: 1; min-width: 0; background: rgba(0, 0, 0, 0.4) !important; padding: 10px 6px; border-radius: 10px; font-size: 0.8rem; color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.1); outline: none;">
        <option value="1">1 Pant.</option>
        <option value="2">2 Pant.</option>
        <option value="3">3 Pant.</option>
        <option value="4">4 Pant.</option>
        <option value="5">5 Pant.</option>
      </select>

      <select class="input-ios sel-meses" style="display: none; flex: 1; min-width: 0; background: rgba(0, 0, 0, 0.4) !important; padding: 10px 6px; border-radius: 10px; font-size: 0.8rem; color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.1); outline: none;">
        <option value="1">1 Mes</option>
        <option value="2">2 Meses</option>
        <option value="3">3 Meses</option>
        <option value="4">4 Meses</option>
        <option value="5">5 Meses</option>
      </select>

      <select class="input-ios sel-bono" style="display: none; flex: 1; min-width: 0; background: rgba(0, 0, 0, 0.4) !important; padding: 10px 6px; border-radius: 10px; font-size: 0.8rem; color: #ffd60a; font-weight: 800; border: 1px solid rgba(255, 214, 10, 0.25); outline: none;">
        <option value="0">0% Bono</option>
        <option value="5">5%</option>
        <option value="10">10%</option>
        <option value="15">15%</option>
        <option value="20">20%</option>
        <option value="25">25%</option>
        <option value="30">30%</option>
      </select>

      ${contadorFilasVentas > 1 ? `<button type="button" onclick="document.getElementById('${idFila}').remove()" style="background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.3); color: #ff453a; width: 34px; height: 38px; border-radius: 10px; cursor: pointer; font-weight: 800; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">✕</button>` : ""}
    </div>

    <div class="row-netflix-tipo" style="display: none; width: 100%; gap: 8px; align-items: center;">
      <select class="input-ios sel-tipo-netflix" onchange="alCambiarTipoVenta('${idFila}')" style="flex: 1; background: rgba(10, 132, 255, 0.1) !important; padding: 8px 10px; border-radius: 8px; font-size: 0.78rem; color: #0a84ff; font-weight: 800; border: 1px solid rgba(10, 132, 255, 0.25); outline: none;">
        <option value="Nueva">Nueva</option>
        <option value="Renovar">Renovar</option>
      </select>
      <input type="text" class="input-ios input-correo-vta" placeholder="👉 Toca aquí para elegir cuenta" readonly onclick="abrirModalRenovacionNet('${idFila}')" style="display: none; flex: 2; background: rgba(10, 132, 255, 0.1) !important; padding: 8px 10px; border-radius: 8px; font-size: 0.78rem; color: #0a84ff; font-weight: 800; border: 1px solid rgba(10, 132, 255, 0.3); cursor: pointer; outline: none;" />
    </div>
  `;

  if (contenedor) {
    contenedor.appendChild(div);
    contenedor.scrollTop = contenedor.scrollHeight;
  }
};

// 4. Modal emergente estilo Apple con la lista de cuentas encontradas
window.abrirModalRenovacionNet = function (idFilaOrigen) {
  if (typeof haptic === "function") haptic();

  const oldModal = document.getElementById("modalRenovacionFlotante");
  if (oldModal) oldModal.remove();

  let listaItemsHtml = "";
  window.cuentasNetflixClienteActivo.forEach((cuenta) => {
    listaItemsHtml += `
      <div class="item-reno-card" onclick="window.seleccionarCuentaModalNet('${cuenta.correo}', '${cuenta.perfil}', '${cuenta.cliente || "Sin Nombre"}', '${idFilaOrigen}')" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); padding: 12px 16px; border-radius: 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;" onmouseover="this.style.background='rgba(10, 132, 255, 0.15)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.03)'" data-search="${(cuenta.correo + " " + cuenta.perfil + " " + (cuenta.cliente || "")).toLowerCase()}">
        <div style="display: flex; flex-direction: column; gap: 4px; text-align: left; overflow: hidden; padding-right: 10px;">
          <span style="color: #ffffff; font-weight: 800; font-size: 0.9rem; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${cuenta.correo}</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="background: rgba(10, 132, 255, 0.15); border: 1px solid rgba(10, 132, 255, 0.3); color: #0a84ff; padding: 2px 8px; border-radius: 6px; font-weight: 800; font-size: 0.68rem; text-transform: uppercase;">
              PERFIL ${cuenta.perfil}
            </span>
            <span style="color: #a1a1aa; font-size: 0.75rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">👤 Cliente: <b style="color:#fff;">${cuenta.cliente || "Sin nombre"}</b></span>
          </div>
        </div>
        <div style="color: #a1a1aa; flex-shrink: 0; display: flex; align-items: center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </div>
    `;
  });

  const modalHtml = `
    <div class="overlay-ios open" id="modalRenovacionFlotante" style="display: flex !important; z-index: 999999 !important; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.82); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); align-items: center; justify-content: center;">
      <div class="modal-ios" style="max-width: 440px; width: 90%; background: #18181b; border: 1px solid rgba(255,255,255,0.12); border-radius: 26px; padding: 22px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 20px 50px rgba(0,0,0,0.9);">
        
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px;">
          <h3 style="margin: 0; color: #fff; font-size: 1.1rem; font-weight: 800;">Cuentas a renovar</h3>
          <button type="button" onclick="document.getElementById('modalRenovacionFlotante').remove()" style="background: rgba(255,255,255,0.08); border: none; color: #a1a1aa; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.9rem;">✕</button>
        </div>

        <div style="position: relative; width: 100%;">
          <input type="text" id="buscadorModalReno" placeholder="Buscar por correo o perfil..." oninput="window.filtrarModalRenovacionNet()" style="width: 100%; background: rgba(0,0,0,0.4) !important; padding: 10px 12px 10px 36px; border-radius: 12px; font-size: 0.85rem; color: #fff; border: 1px solid rgba(255,255,255,0.1); outline: none; box-sizing: border-box;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717a" stroke-width="2.5" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>

        <div id="listaCuentasModalReno" style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; padding-right: 2px;">
          ${listaItemsHtml}
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
  setTimeout(() => {
    const inputSearch = document.getElementById("buscadorModalReno");
    if (inputSearch) inputSearch.focus();
  }, 100);
};

// 5. Inyecta la cuenta seleccionada en el input de la fila
window.seleccionarCuentaModalNet = function (
  correo,
  perfil,
  cliente,
  idFilaOrigen,
) {
  if (typeof haptic === "function") haptic();

  const fila = document.getElementById(idFilaOrigen);
  if (fila) {
    fila.setAttribute("data-correo-reno", correo);
    fila.setAttribute("data-perfil-reno", perfil);

    const inputCorreo = fila.querySelector(".input-correo-vta");
    if (inputCorreo) {
      inputCorreo.value = `${correo} | Perfil: ${perfil}`;
    }
  }

  const inputNombre = document.getElementById("vendedorClienteNombre");
  if (
    inputNombre &&
    (!inputNombre.value ||
      inputNombre.value.trim() === "Sin Nombre" ||
      inputNombre.value.trim() === "") &&
    cliente &&
    cliente !== "Sin Nombre" &&
    cliente !== "N/A"
  ) {
    inputNombre.value = cliente;
  }

  const modal = document.getElementById("modalRenovacionFlotante");
  if (modal) modal.remove();
};

window.filtrarModalRenovacionNet = function () {
  const query = (document.getElementById("buscadorModalReno")?.value || "")
    .toLowerCase()
    .trim();
  const items = document.querySelectorAll(
    "#listaCuentasModalReno .item-reno-card",
  );
  items.forEach((item) => {
    const searchData = item.getAttribute("data-search") || "";
    if (searchData.includes(query)) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });
};
/* ==========================================================================
   📈 MÓDULO FINANCIERO Y CONTROL DE DEUDA EN MYSQL (CÓDIGO COMPLETO)
   ========================================================================== */

// 1. VARIABLES Y AYUDANTES GLOBALES DEL MÓDULO FINANCIERO
if (typeof window.globalFinanzasData === "undefined") {
  window.globalFinanzasData = null;
}
if (typeof window.activePeriod === "undefined") {
  window.activePeriod = "mes";
}
if (typeof window.isWorkingFinanzas === "undefined") {
  window.isWorkingFinanzas = false;
}

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

// Helper para formatear valores a pesos colombianos ($)
if (typeof window.formatMoneda !== "function") {
  window.formatMoneda = function (v) {
    return (
      "$" +
      parseFloat(v || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })
    );
  };
}

/* ==========================================================================
   📅 CONSTRUCCIÓN Y MANEJO DE SELECTORES DE FECHA
   ========================================================================== */

function construirSelectores() {
  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");

  if (!mSelect || !dSelect) return;
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
    opt.value = i.toString();
    opt.innerText = "Día " + i;
    dSelect.appendChild(opt);
  }

  const hoy = new Date();
  mSelect.value = mesesArray[hoy.getMonth()];
  dSelect.value = hoy.getDate().toString();
}

/* ==========================================================================
   📈 ACTUALIZACIÓN DE FILTROS Y CARGA DESDE MYSQL
   ========================================================================== */

function actualizarFiltrosUI() {
  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");

  const mes = mSelect ? mSelect.value : "AGOSTO";
  const dia = dSelect ? dSelect.value : "TODOS";

  window.activePeriod = dia === "TODOS" || dia === "" ? "mes" : "dia";

  const txtPeriodo = document.getElementById("txtPeriodoLabel");
  if (txtPeriodo) {
    txtPeriodo.innerText =
      window.activePeriod === "mes"
        ? "CAJA REAL MENSUAL"
        : `CAJA REAL DÍA ${dia}`;
  }

  const txtLibro = document.getElementById("txtLibroHeader");
  if (txtLibro) {
    txtLibro.innerText =
      dia === "TODOS" || dia === ""
        ? `LIBRO DE ${mes}`
        : `LIBRO DEL DÍA ${dia} DE ${mes}`;
  }

  cargarDashboardFinanzas();
}

function cargarDashboardFinanzas() {
  const container = document.getElementById("listaDesgloseGastos");
  if (container) {
    container.innerHTML =
      '<div class="empty-log-msg">Calculando balance desde MySQL...</div>';
  }

  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");

  const mes = mSelect ? mSelect.value : "AGOSTO";
  const dia = dSelect ? dSelect.value : "TODOS";

  if (typeof cargarRentabilidadPlataformas === "function") {
    cargarRentabilidadPlataformas();
  }

  const formData = new FormData();
  formData.append("accion", "obtener_dashboard_finanzas");
  formData.append("mes", mes);
  formData.append("dia", dia);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      if (res && res.status === "success") {
        window.globalFinanzasData = res.data;
        if (typeof renderDashboard === "function") {
          renderDashboard();
        }
      } else {
        if (container)
          container.innerHTML = `<div class="empty-log-msg" style="color:var(--ios-red);">Error al consultar finanzas en MySQL.</div>`;
      }
    })
    .catch((err) => {
      console.error("Error en cargarDashboardFinanzas:", err);
      if (container)
        container.innerHTML = `<div class="empty-log-msg" style="color:var(--ios-red);">❌ Error de conexión con MySQL.</div>`;
    });
}

/* ==========================================================================
   📈 CARGA DE DASHBOARD FINANCIERO Y MANEJO SEGURO DE RESPUESTAS
   ========================================================================== */

function cargarDashboardFinanzas() {
  const container = document.getElementById("listaDesgloseGastos");
  if (container) {
    container.innerHTML =
      '<div class="empty-log-msg">Calculando balance desde MySQL...</div>';
  }

  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");

  const mes = mSelect ? mSelect.value : "AGOSTO";
  const dia = dSelect ? dSelect.value : "TODOS";

  if (typeof cargarRentabilidadPlataformas === "function") {
    cargarRentabilidadPlataformas();
  }

  const formData = new FormData();
  formData.append("accion", "obtener_dashboard_finanzas");
  formData.append("mes", mes);
  formData.append("dia", dia);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.text())
    .then((text) => {
      let res;
      try {
        res = JSON.parse(text);
      } catch (e) {
        console.error("Respuesta PHP no válida:", text);
        if (container) {
          container.innerHTML = `<div class="empty-log-msg" style="color:var(--ios-red);">❌ Error en PHP:<br><small>${text.replace(/</g, "&lt;")}</small></div>`;
        }
        return;
      }

      if (res && res.status === "success") {
        window.globalFinanzasData = res.data;
        if (typeof renderDashboard === "function") {
          renderDashboard();
        }
      } else {
        if (container)
          container.innerHTML = `<div class="empty-log-msg" style="color:var(--ios-red);">Error: ${res ? res.message : "Fallo al consultar."}</div>`;
      }
    })
    .catch((err) => {
      console.error("Error en cargarDashboardFinanzas:", err);
      if (container)
        container.innerHTML = `<div class="empty-log-msg" style="color:var(--ios-red);">❌ Error de red con MySQL.</div>`;
    });
}

function filtrarHoy() {
  if (typeof haptic === "function") haptic();
  const hoy = new Date();
  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");
  if (mSelect && dSelect) {
    mSelect.value = mesesArray[hoy.getMonth()];
    dSelect.value = hoy.getDate().toString();
    actualizarFiltrosUI();
  }
}

function filtrarAyer() {
  if (typeof haptic === "function") haptic();
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");
  if (mSelect && dSelect) {
    mSelect.value = mesesArray[ayer.getMonth()];
    dSelect.value = ayer.getDate().toString();
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
    dSelect.value = "TODOS";
    actualizarFiltrosUI();
  }
}

/* ==========================================================================
   🔓 APERTURA / CIERRE Y CONSULTA DEL PANEL FINANCIERO VÍA MYSQL
   ========================================================================== */

window.toggleFinanzasPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("finanzasOverlay");
  if (!overlay) return;

  if (overlay.classList.contains("open") || overlay.style.display === "flex") {
    overlay.classList.remove("open");
    overlay.style.setProperty("display", "none", "important");
    if (typeof CyberSonidos !== "undefined") CyberSonidos.play("cerrar");
  } else {
    if (typeof cerrarTodasLasVentanas === "function") cerrarTodasLasVentanas();

    overlay.style.setProperty("display", "flex", "important");
    overlay.classList.add("open");
    if (typeof CyberSonidos !== "undefined") CyberSonidos.play("abrir");

    if (typeof construirSelectores === "function") construirSelectores();
    if (typeof cargarDashboardFinanzas === "function")
      cargarDashboardFinanzas();
  }
};

function cargarRentabilidadPlataformas() {
  const container = document.getElementById("rankingPlataformasVentas");
  if (!container) return;
  container.innerHTML =
    '<div class="empty-log-msg">Calculando rentabilidad...</div>';

  const mes = document.getElementById("appleMonthSelect")?.value || "AGOSTO";

  const formData = new FormData();
  formData.append("accion", "obtener_rentabilidad_plataformas");
  formData.append("mes", mes);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      if (res && res.status === "success") {
        let html = "";
        let data = res.data;

        if (!data || data.length === 0) {
          container.innerHTML =
            '<div class="empty-log-msg">No hay ventas registradas en este mes.</div>';
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
          let pctBar = Math.round(
            (Math.abs(r.gananciaNeta) / maxGanancia) * 100,
          );

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
      } else {
        container.innerHTML =
          '<div class="empty-log-msg">Error al cargar rentabilidad.</div>';
      }
    })
    .catch((err) => {
      console.error(err);
      container.innerHTML =
        '<div class="empty-log-msg">❌ Error al conectar a MySQL.</div>';
    });
}

/* ==========================================================================
   📝 REGISTRO DE TRANSACCIÓN Y ACTUALIZACIÓN DE DEUDA
   ========================================================================== */

function guardarTransaccion(e) {
  if (e) e.preventDefault();
  if (window.isWorkingFinanzas) return;

  const catElem = document.getElementById("finCategoria");
  const montoElem = document.getElementById("finMonto");
  const detalleElem = document.getElementById("finDetalle");

  if (!catElem || !montoElem) return;

  const catVal = catElem.value;
  const montoRaw = montoElem.value.replace(/\D/g, "");
  const detalleVal = detalleElem ? detalleElem.value.trim() : "";

  if (!montoRaw || parseInt(montoRaw, 10) <= 0) {
    alert("Ingresa un monto válido.");
    return;
  }

  window.isWorkingFinanzas = true;
  const btn = document.getElementById("btnSubmit");
  const originalText = btn ? btn.innerText : "Archivar";

  if (btn) {
    btn.innerText = "Procesando...";
    btn.disabled = true;
  }

  const formData = new FormData();
  formData.append("accion", "registrar_transaccion_financiera");
  formData.append("categoria", catVal);
  formData.append("monto", montoRaw);
  formData.append("detalle", detalleVal);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      window.isWorkingFinanzas = false;
      if (btn) {
        btn.innerText = originalText;
        btn.disabled = false;
      }

      if (res && res.status === "success") {
        const form = document.getElementById("formFinanzas");
        if (form) form.reset();
        cargarDashboardFinanzas();
        if (typeof triggerToast === "function") {
          triggerToast(`✅ ${res.message}`);
        }
      } else {
        alert(
          "Error: " +
            (res ? res.message : "No se pudo guardar la transacción."),
        );
      }
    })
    .catch((err) => {
      window.isWorkingFinanzas = false;
      if (btn) {
        btn.innerText = originalText;
        btn.disabled = false;
      }
      console.error(err);
      alert("❌ Error de red al guardar la transacción.");
    });
}

window.guardarDeudaEnSheets = window.guardarDeudaEnMySQL = function () {
  if (typeof haptic === "function") haptic();
  const btn = document.getElementById("btnGuardarDeudaSheets");
  const tipoElem = document.getElementById("tipoDeudaMutua");
  const montoElem = document.getElementById("valDeudaTotal");

  const tipo = tipoElem ? tipoElem.value : "negocio_debe";
  const montoRaw = montoElem ? montoElem.value.replace(/\D/g, "") : "0";
  const monto = parseFloat(montoRaw) || 0;

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Guardando...";
  }

  const formData = new FormData();
  formData.append("accion", "actualizar_deuda_mutua");
  formData.append("monto", monto);
  formData.append("tipo", tipo);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      if (btn) {
        btn.disabled = false;
        btn.innerText = "💾 Guardar";
      }

      if (res && res.status === "success") {
        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Deuda guardada en MySQL</span></div>`,
          );
        }
      } else {
        alert(
          "❌ Error: " +
            (res ? res.message : "Fallo de conexión al guardar la deuda."),
        );
      }
    })
    .catch((err) => {
      if (btn) {
        btn.disabled = false;
        btn.innerText = "💾 Guardar";
      }
      console.error(err);
      alert("❌ Error al conectar con el servidor.");
    });
};
/* ==========================================================================
   📈 RENDERIZADOR CONTABLE BENTO EN TIEMPO REAL
   ========================================================================== */

function renderDashboard() {
  if (!window.globalFinanzasData) return;

  const activeKey = window.activePeriod || "dia";
  const d =
    window.globalFinanzasData[activeKey] ||
    window.globalFinanzasData["mes"] ||
    window.globalFinanzasData["dia"];

  if (!d) return;

  // 1. Actualizar Caja Real (Neto)
  const netEl = document.getElementById("val_neto");
  if (netEl) {
    netEl.innerText = formatMoneda(d.neto);
    netEl.style.color = d.neto >= 0 ? "#30d158" : "#ff453a";
  }

  // 2. Actualizar las 4 Métricas Principales
  if (document.getElementById("val_ingresos")) {
    document.getElementById("val_ingresos").innerText = formatMoneda(
      d.ingresos,
    );
  }
  if (document.getElementById("val_gastos")) {
    document.getElementById("val_gastos").innerText = formatMoneda(d.gastos);
  }
  if (document.getElementById("val_inversiones")) {
    document.getElementById("val_inversiones").innerText = formatMoneda(
      d.inversiones,
    );
  }
  if (document.getElementById("val_nomina")) {
    document.getElementById("val_nomina").innerText = formatMoneda(d.nomina);
  }

  // 3. Fondos del Negocio
  const baseVentas = d.ingresos || 0;
  const pNeg = 55;
  const pNom = 17;
  const pMio = 28;

  const montoFondoNegocio = Math.round(baseVentas * (pNeg / 100));
  const montoReservaNomina = Math.round(baseVentas * (pNom / 100));
  const totalFondosEmpresa = montoFondoNegocio + montoReservaNomina;

  if (document.getElementById("valProyNegocio")) {
    document.getElementById("valProyNegocio").innerText =
      formatMoneda(montoFondoNegocio);
  }
  if (document.getElementById("valProyNomina")) {
    document.getElementById("valProyNomina").innerText =
      formatMoneda(montoReservaNomina);
  }
  if (document.getElementById("valTotalFondosNegocio")) {
    document.getElementById("valTotalFondosNegocio").innerText =
      formatMoneda(totalFondosEmpresa);
  }

  // 4. Mi Ganancia y Distribución
  const miGananciaNeta = Math.round(baseVentas * (pMio / 100));
  const ahorroCalculado = Math.round(miGananciaNeta * 0.5);
  const otrosCalculado = miGananciaNeta - ahorroCalculado;

  if (document.getElementById("valProyMio")) {
    document.getElementById("valProyMio").innerText =
      formatMoneda(miGananciaNeta);
  }
  if (document.getElementById("valGananciaAhorro")) {
    document.getElementById("valGananciaAhorro").innerText =
      formatMoneda(ahorroCalculado);
  }
  if (document.getElementById("valGananciaOtros")) {
    document.getElementById("valGananciaOtros").innerText =
      formatMoneda(otrosCalculado);
  }
  if (document.getElementById("valProyMioMasJeisson")) {
    document.getElementById("valProyMioMasJeisson").innerText =
      formatMoneda(miGananciaNeta);
  }

  // 5. Cargar Deuda Mutua
  if (
    window.globalFinanzasData.deudaActual !== undefined &&
    document.getElementById("valDeudaTotal")
  ) {
    document.getElementById("valDeudaTotal").value = parseFloat(
      window.globalFinanzasData.deudaActual || 0,
    ).toLocaleString("es-CO");
  }
  if (
    window.globalFinanzasData.tipoDeudaActual &&
    document.getElementById("tipoDeudaMutua")
  ) {
    document.getElementById("tipoDeudaMutua").value =
      window.globalFinanzasData.tipoDeudaActual;
  }

  if (typeof calcularDescuentoDeuda === "function") {
    calcularDescuentoDeuda();
  }
}

/* ==========================================================================
   🍿 MÓDULO DE NETFLIX: CORTES OPERATIVOS Y CREACIÓN DE CUENTAS (ALIAS)
   ========================================================================== */

// 1. ABRIR / CERRAR MODAL DE CORTES OPERATIVOS
window.toggleNetflixManagerPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("netflixManagerOverlay");

  if (!overlay) {
    // Si no existe el modal en el HTML, lo creamos dinámicamente
    window.crearModalNetflixManagerHTML();
    return window.toggleNetflixManagerPanel();
  }

  if (overlay.classList.contains("open") || overlay.style.display === "flex") {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    if (typeof cerrarTodasLasVentanas === "function") cerrarTodasLasVentanas();
    overlay.style.display = "flex";
    overlay.classList.add("open");
    window.cargarCortesOperativosNetflix();
  }
};

// 2. CONSULTAR Y RENDERIZAR CORTES REQUERIDOS DESDE MYSQL
window.cargarCortesOperativosNetflix = function () {
  const container = document.getElementById("listaCortesOperativosNetflix");
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; color: #ff453a; padding: 40px;">
      <svg class="spin-anim" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:10px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
      <br><span style="font-weight: 700; font-size: 0.9rem;">Escaneando cuentas para corte...</span>
    </div>
  `;

  const formData = new FormData();
  formData.append("accion", "obtener_cortes_netflix");

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      if (res && res.status === "success") {
        const cuentas = res.data || [];
        if (cuentas.length === 0) {
          container.innerHTML = `
            <div style="text-align: center; padding: 50px 20px; color: #30d158; font-weight: 800; background: rgba(48, 209, 88, 0.05); border-radius: 18px; border: 1px dashed rgba(48, 209, 88, 0.2);">
              🎉 ¡Excelente! No hay cortes pendientes en Netflix para hoy.
            </div>
          `;
          return;
        }

        let html = "";
        cuentas.forEach((item) => {
          const correo = item.correo;
          const claveVieja = item.clave_actual || item.clave || "fuego41@@";
          const claveNueva =
            item.clave_nueva || window.generarClaveTVAleatoria();
          const perfiles = item.perfiles_afectados || "1, 2, 3, 4, 5";

          html += `
            <div class="card-corte-item" style="background: #16161a; border: 1px solid rgba(255, 69, 58, 0.3); border-radius: 18px; padding: 16px; margin-bottom: 14px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
              
              <!-- ENCABEZADO DE TARJETA -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 8px; overflow: hidden;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: #ff453a; box-shadow: 0 0 8px #ff453a; flex-shrink: 0;"></span>
                  <span style="color: #ff453a; font-weight: 800; font-size: 0.72rem; letter-spacing: 0.5px; text-transform: uppercase; flex-shrink: 0;">CORTE REQUERIDO</span>
                  <span style="color: #ffffff; font-weight: 800; font-family: monospace; font-size: 0.92rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${correo}</span>
                  <button onclick="copiarTextoUnico(this, '${encodeURIComponent(correo)}')" style="background: transparent; border: none; color: #a1a1aa; cursor: pointer; padding: 2px;" title="Copiar Correo">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  </button>
                </div>
                <span style="background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.3); color: #ff453a; padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; white-space: nowrap;">
                  Perfiles: ${perfiles}
                </span>
              </div>

              <!-- BLOQUE CLAVE VENCIDA VS NUEVA CLAVE TV -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: rgba(0, 0, 0, 0.4); padding: 12px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05); margin-bottom: 12px; align-items: center;">
                <div>
                  <span style="display: block; font-size: 0.68rem; font-weight: 800; color: #a1a1aa; text-transform: uppercase;">CLAVE VENCIDA</span>
                  <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                    <span style="color: #71717a; font-family: monospace; font-weight: 700; font-size: 0.9rem; text-decoration: line-through;">${claveVieja}</span>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.03); padding: 6px 10px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.08);">
                  <div>
                    <span style="display: block; font-size: 0.65rem; font-weight: 800; color: #a1a1aa; text-transform: uppercase;">NUEVA CLAVE TV</span>
                    <span style="color: #ffffff; font-family: monospace; font-weight: 800; font-size: 0.95rem;">${claveNueva}</span>
                  </div>
                  <button onclick="copiarTextoUnico(this, '${encodeURIComponent(claveNueva)}')" style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; padding: 6px 12px; border-radius: 8px; font-weight: 800; font-size: 0.75rem; cursor: pointer;">
                    Copiar
                  </button>
                </div>
              </div>

              <!-- BOTÓN PRINCIPAL PROCESAR CORTE -->
              <button onclick="window.procesarCorteNetflix('${encodeURIComponent(correo)}', '${encodeURIComponent(claveNueva)}', this)" style="width: 100%; background: #e50914; color: #ffffff; border: none; padding: 12px; border-radius: 12px; font-weight: 800; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(229, 9, 20, 0.35); transition: transform 0.2s ease;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Procesar Corte y Subir a Hoy
              </button>

            </div>
          `;
        });

        container.innerHTML = html;
      } else {
        container.innerHTML = `<div style="color: #ff453a; text-align: center; padding: 30px;">Error: ${res ? res.message : "No se pudieron obtener los cortes."}</div>`;
      }
    })
    .catch((err) => {
      console.error(err);
      container.innerHTML = `<div style="color: #ff453a; text-align: center; padding: 30px;">❌ Error de conexión al consultar cortes.</div>`;
    });
};

// 3. GENERAR CLAVE TV ALEATORIA (EJ: "nova97@@", "plata46@@")
window.generarClaveTVAleatoria = function () {
  const palabras = [
    "nova",
    "plata",
    "fuego",
    "cable",
    "sol",
    "muno",
    "delta",
    "cyber",
    "astro",
    "neon",
  ];
  const num = Math.floor(Math.random() * 90) + 10;
  const palabra = palabras[Math.floor(Math.random() * palabras.length)];
  return `${palabra}${num}@@`;
};

/* ==========================================================================
   ✂️ MOTOR DE CORTES: PROCESAMIENTO Y VENTANA RESUMEN DE WHATSAPP
   ========================================================================== */

window.procesarCorteNetflix = function (
  correoEscapado,
  claveNuevaEscapada,
  btn,
) {
  if (typeof haptic === "function") haptic();
  const correo = decodeURIComponent(correoEscapado);
  const claveNueva = decodeURIComponent(claveNuevaEscapada);

  if (
    !confirm(
      `¿Confirmas procesar el corte para la cuenta:\n${correo}?\n\nSe actualizará la contraseña a: ${claveNueva} y la fecha al día de HOY.`,
    )
  ) {
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Procesando corte...";
  }

  const formData = new FormData();
  formData.append("accion", "procesar_corte_netflix");
  formData.append("correo", correo);
  formData.append("clave_nueva", claveNueva);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.text())
    .then((text) => {
      let res;
      try {
        res = JSON.parse(text);
      } catch (e) {
        console.error("Respuesta PHP no válida:", text);
        alert(
          "❌ Error PHP:\n\n" + (text.trim() || "El servidor respondió vacío."),
        );
        if (btn) {
          btn.disabled = false;
          btn.innerText = "Procesar Corte y Subir a Hoy";
        }
        return;
      }

      if (res && res.status === "success") {
        if (typeof triggerToast === "function") {
          triggerToast(`✅ Corte procesado con éxito.`);
        }

        // Cierra el modal anterior o refresca la lista
        window.cargarCortesOperativosNetflix();
        if (typeof cargarDatosMySQL === "function") cargarDatosMySQL();

        // 🚀 ABRE EL NUEVO MODAL CON LOS NÚMEROS Y MENSAJES AGRUPADOS
        window.mostrarModalResumenCorteNetflix(res);
      } else {
        alert(
          "❌ Error: " + (res ? res.message : "No se pudo procesar el corte."),
        );
        if (btn) {
          btn.disabled = false;
          btn.innerText = "Procesar Corte y Subir a Hoy";
        }
      }
    })
    .catch((err) => {
      console.error(err);
      alert("❌ Error de conexión al servidor.");
      if (btn) {
        btn.disabled = false;
        btn.innerText = "Procesar Corte y Subir a Hoy";
      }
    });
};

// 📱 VENTANA FLOTANTE DE WHATSAPP PARA COPIAR MENSAJES Y ENLACES ENUMERADOS
window.mostrarModalResumenCorteNetflix = function (data) {
  const oldModal = document.getElementById("modalResumenCorteNetflix");
  if (oldModal) oldModal.remove();

  const correo = data.correo || "";
  const claveNueva = data.clave_nueva || "";
  const perfiles = data.perfiles || [];

  const enlacesWaMeArr = [];
  let itemsHtml = "";

  perfiles.forEach((p) => {
    const numRaw = (p.numero || "").trim();
    let numSoloDigitos = numRaw.replace(/\D/g, "");

    // Normalizar formato wa.me/57 si es un número de 10 dígitos
    if (numSoloDigitos.length === 10) {
      numSoloDigitos = "57" + numSoloDigitos;
    }

    const tieneNumeroValido = numSoloDigitos.length >= 10;

    // 🚫 1. SI NO TIENE NÚMERO REGISTRADO, SE OMITE DE LA LISTA
    if (!tieneNumeroValido) return;

    const waLink = `https://wa.me/${numSoloDigitos}`;

    // Guardamos el enlace para la lista de copia masiva
    enlacesWaMeArr.push(`wa.me/${numSoloDigitos}`);

    // 👤 DETECCIÓN DE NOMBRE REAL (NO MUESTRA "CLIENTE" NI "SIN NOMBRE")
    const tieneNombreReal =
      p.cliente &&
      p.cliente.trim() !== "" &&
      p.cliente.trim().toLowerCase() !== "sin nombre";
    const clienteDisplay = tieneNombreReal ? p.cliente.trim() : "";
    const saludoNombre = clienteDisplay
      ? ` *¡Hola ${clienteDisplay}!*`
      : " *¡Hola!*";

    // 💬 MENSAJE INDIVIDUAL DE WHATSAPP
    const mensajeWA = `🌟${saludoNombre}\n\nTu cuenta de *NETFLIX PREMIUM* ha sido actualizada por cambio de clave / mantenimiento ✅\n\n⚠️ *Para iniciar sesión:* Cuando te pida un código, selecciona *Obtener ayuda* y después *Usar contraseña*.\n\n🎬 *NUEVOS DATOS DE ACCESO* 🔐\n────────────────────\n📧 *Correo:* ${correo}\n🔑 *Contraseña:* ${claveNueva}\n👤 *Perfil:* ${p.perfil}\n📍 *PIN:* ${p.pin || "-"}\n📅 *Vence:* ${p.vencimiento || "-"}\n\n🤖 *¿NECESITAS UN CÓDIGO?* Puedes usar nuestra pagina para codigos disponible 24/7: www.cybernetsp.com/\n\n✨ *¡Gracias por tu confianza!* ✨`;

    const msjEscapado = encodeURIComponent(mensajeWA);

    // Muestra únicamente el número del cliente
    const numeroTextoMostrar =
      numRaw && numRaw !== "-" ? numRaw : numSoloDigitos;

    itemsHtml += `
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;">
        
        <!-- CABECERA PERFIL (SOLO MUESTRA NOMBRE SI EXISTE REALMENTE) -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="background: rgba(229, 9, 20, 0.2); color: #e50914; border: 1px solid rgba(229, 9, 20, 0.4); border-radius: 8px; padding: 2px 10px; font-weight: 800; font-size: 0.78rem;">
              PERFIL ${p.perfil}
            </span>
            ${clienteDisplay ? `<span style="color: #ffffff; font-weight: 700; font-size: 0.88rem;">${clienteDisplay}</span>` : ""}
          </div>
          <span style="color: #a1a1aa; font-size: 0.75rem; font-family: monospace;">PIN: ${p.pin || "-"}</span>
        </div>

        <!-- ENLACE Y NÚMERO DEL CLIENTE -->
        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0, 0, 0, 0.3); padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.05);">
          <div style="display: flex; align-items: center; gap: 6px; overflow: hidden;">
            <span style="font-size: 0.8rem; color: #30d158;">📱</span>
            <a href="${waLink}" target="_blank" style="color: #30d158; font-family: monospace; font-weight: 800; font-size: 0.85rem; text-decoration: none;" title="Abrir chat en WhatsApp">
              ${numeroTextoMostrar}
            </a>
          </div>

          <!-- BOTÓN SVG PARA COPIAR MENSAJE INDIVIDUAL -->
          <button onclick="window.copiarMensajeCorteWhatsApp(this, '${msjEscapado}')" style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease;" title="Copiar mensaje de WhatsApp para este cliente">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copiar Mensaje
          </button>
        </div>

      </div>
    `;
  });

  // 🔢 CREA LA LISTA ENUMERADA CON SALTO DE LÍNEA (Ej: 1. wa.me/57...)
  const textoTodosNumeros = enlacesWaMeArr
    .map((link, idx) => `${idx + 1}. ${link}`)
    .join("\n");
  const todosNumEscapados = encodeURIComponent(textoTodosNumeros);

  // Mensaje por si no hay ningún perfil con número en esa cuenta
  if (enlacesWaMeArr.length === 0) {
    itemsHtml = `
      <div style="text-align: center; padding: 30px 15px; color: #a1a1aa; font-weight: 600; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.08);">
        📭 No hay perfiles con número telefónico registrado en esta cuenta.
      </div>
    `;
  }

  const modalHtml = `
    <div class="overlay-ios open" id="modalResumenCorteNetflix" style="display: flex !important; z-index: 999999 !important; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); align-items: center; justify-content: center;">
      <div class="modal-ios" style="max-width: 500px; width: 92%; max-height: 90vh; background: #141417; border: 1px solid rgba(48, 209, 88, 0.3); border-radius: 26px; padding: 22px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 25px 60px rgba(0,0,0,0.9); overflow: hidden;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div>
              <h3 style="margin: 0; color: #ffffff; font-size: 1.1rem; font-weight: 800;">Corte Procesado</h3>
              <span style="color: #a1a1aa; font-size: 0.72rem; font-family: monospace;">${correo}</span>
            </div>
          </div>
          <button type="button" onclick="document.getElementById('modalResumenCorteNetflix').remove()" style="background: rgba(255,255,255,0.08); border: none; color: #a1a1aa; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
        </div>

        <!-- BOTÓN CON CONTEO Y COPIA DE ENLACES ENUMERADOS -->
        <button onclick="window.copiarTodosLosNumerosCorte(this, '${todosNumEscapados}')" style="width: 100%; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; padding: 12px; border-radius: 14px; font-weight: 800; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease; flex-shrink: 0;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copiar todos los números (${enlacesWaMeArr.length})
        </button>

        <div style="display: flex; flex-direction: column; gap: 10px; overflow-y: auto; flex-grow: 1; padding-right: 2px;" class="cyber-custom-scroll">
          ${itemsHtml}
        </div>

        <button onclick="document.getElementById('modalResumenCorteNetflix').remove()" style="width: 100%; background: #30d158; color: #000000; border: none; padding: 12px; border-radius: 14px; font-weight: 900; font-size: 0.88rem; cursor: pointer; flex-shrink: 0;">
          Entendido / Cerrar Ventana
        </button>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
};

// COPIAR MENSAJE INDIVIDUAL DE UN PERFIL
window.copiarMensajeCorteWhatsApp = function (btn, msjEscapado) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(msjEscapado);

  navigator.clipboard.writeText(texto).then(() => {
    const oldHtml = btn.innerHTML;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡Copiado!`;
    btn.style.setProperty("background", "#30d158", "important");
    btn.style.setProperty("color", "#000000", "important");

    if (typeof triggerToast === "function") {
      triggerToast(`📋 Mensaje copiado al portapapeles.`);
    }

    setTimeout(() => {
      btn.innerHTML = oldHtml;
      btn.style.setProperty(
        "background",
        "rgba(48, 209, 88, 0.15)",
        "important",
      );
      btn.style.setProperty("color", "#30d158", "important");
    }, 1500);
  });
};

// COPIAR TODOS LOS NÚMEROS DE LA CUENTA DE UN SOLO CLIC
window.copiarTodosLosNumerosCorte = function (btn, todosEscapados) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(todosEscapados);

  if (!texto || texto.trim() === "") {
    alert("⚠️ No hay números registrados en esta cuenta.");
    return;
  }

  navigator.clipboard.writeText(texto).then(() => {
    const oldHtml = btn.innerHTML;
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡Números Copiados!`;
    btn.style.setProperty("background", "#30d158", "important");
    btn.style.setProperty("color", "#000000", "important");

    if (typeof triggerToast === "function") {
      triggerToast(`📋 Lista de números copiada.`);
    }

    setTimeout(() => {
      btn.innerHTML = oldHtml;
      btn.style.setProperty(
        "background",
        "rgba(255, 255, 255, 0.08)",
        "important",
      );
      btn.style.setProperty("color", "#ffffff", "important");
    }, 1500);
  });
};

// 5. CREAR CUENTA DE NETFLIX (USAR ALIAS)
window.crearCuentaNetflixAlias = function () {
  if (typeof haptic === "function") haptic();

  const correoBase = prompt(
    "Ingresa el correo base para crear el Alias:\n(Ej: durmal05y@outlook.com)",
  );
  if (!correoBase || !correoBase.trim()) return;

  const aliasNumero = prompt(
    "Ingresa el identificador/número de alias:\n(Ej: 1, 2, 3 o 'septiembre')",
    "1",
  );
  if (!aliasNumero) return;

  let correoFinal = correoBase.trim();
  if (correoBase.includes("@")) {
    const partes = correoBase.trim().split("@");
    correoFinal = `${partes[0]}+${aliasNumero.trim()}@${partes[1]}`;
  }

  const clave = prompt(
    `Ingresa la contraseña para:\n${correoFinal}`,
    "fuego41@@",
  );
  if (!clave) return;

  const formData = new FormData();
  formData.append("accion", "crear_cuenta_netflix_alias");
  formData.append("correo", correoFinal);
  formData.append("clave", clave.trim());

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      if (res && res.status === "success") {
        alert(
          `✅ Cuenta creada con éxito:\n\nCorreo: ${correoFinal}\nClave: ${clave}`,
        );
        if (typeof cargarDatosMySQL === "function") cargarDatosMySQL();
        window.cargarCortesOperativosNetflix();
      } else {
        alert(
          "❌ Error: " + (res ? res.message : "No se pudo crear la cuenta."),
        );
      }
    })
    .catch((err) => {
      console.error(err);
      alert("❌ Error de comunicación al crear cuenta.");
    });
};

// 6. CONSTRUCTOR DINÁMICO DEL MODAL EN CASO DE NO EXISTIR
window.crearModalNetflixManagerHTML = function () {
  if (document.getElementById("netflixManagerOverlay")) return;

  const modalHtml = `
    <div class="overlay-ios" id="netflixManagerOverlay" style="display: none; z-index: 16000; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.82); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); align-items: center; justify-content: center;">
      <div class="sheet-ios" onclick="event.stopPropagation()" style="max-width: 520px; width: 92%; max-height: 88vh; background: #111115; border: 1px solid rgba(229, 9, 20, 0.3); border-radius: 28px; padding: 22px; box-shadow: 0 30px 70px rgba(0,0,0,0.9); display: flex; flex-direction: column; gap: 16px; overflow: hidden; margin: auto;">
        
        <!-- ENCABEZADO -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 14px; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: rgba(229, 9, 20, 0.15); border: 1px solid rgba(229, 9, 20, 0.3); color: #e50914; padding: 8px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
            </div>
            <h3 style="margin: 0; color: #e50914; font-size: 1.25rem; font-weight: 800;">Cortes Operativos</h3>
          </div>
          <button type="button" onclick="toggleNetflixManagerPanel()" style="background: rgba(255,255,255,0.08); border: none; color: #a1a1aa; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.9rem;">✕</button>
        </div>

        <!-- BOTONES SUPERIORES -->
        <div style="display: flex; flex-direction: column; gap: 10px; flex-shrink: 0;">
          <button onclick="window.crearCuentaNetflixAlias()" style="width: 100%; background: #e50914; color: #ffffff; border: none; padding: 13px; border-radius: 14px; font-weight: 800; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(229, 9, 20, 0.3);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Crear cuenta de Netflix (Usar Alias)
          </button>

          <button onclick="window.cargarCortesOperativosNetflix()" style="width: 100%; background: rgba(255, 255, 255, 0.06); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.12); padding: 12px; border-radius: 14px; font-weight: 800; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
            Refrescar Escaneo de Cortes
          </button>
        </div>

        <!-- ÁREA DE SCROLL DE TARJETAS DE CORTE -->
        <div id="listaCortesOperativosNetflix" style="flex: 1; overflow-y: auto; padding-right: 2px;" class="cyber-custom-scroll">
          <div style="text-align: center; color: #a1a1aa; padding: 30px;">Cargando cortes...</div>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
};

/* ==========================================================================
   🧮 CEREBRO DEL COTIZADOR AUTOMÁTICO DE COMBOS CYBERNET (ALGORITMO MAX-BASE)
   ========================================================================== */

window.abrirCalculadoraCombos = function () {
  if (typeof haptic === "function") haptic();

  const container = document.getElementById("contenedorPlataformasCotizador");

  // 1. INYECTAR IPTV SI NO EXISTE
  if (container && !document.querySelector('.chk-cotizar-plat[value="IPTV"]')) {
    const iptvRow = document.createElement("div");
    iptvRow.className = "row-cotizar-plat";
    iptvRow.setAttribute("data-nombre", "iptv smarters");
    iptvRow.style.cssText =
      "border-bottom: 0.5px solid rgba(255, 255, 255, 0.06);";
    iptvRow.innerHTML = `
      <label style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; cursor: pointer; width: 100%; box-sizing: border-box;">
          <span style="font-size: 0.9rem; font-weight: 600; color: #30d158">IPTV Smarters ($7k)</span>
          <input type="checkbox" class="chk-cotizar-plat" value="IPTV" data-tipo="herramienta" onchange="controlarDisneyMutuo(this); calcularPreciosSistemaCotizador();" style="accent-color: #0a84ff; width: 18px; height: 18px; cursor: pointer;" />
      </label>
    `;
    container.appendChild(iptvRow);
  }

  // 2. INYECTAR DIRECTV GO SI NO EXISTE
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
      <label style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; cursor: pointer; width: 100%; box-sizing: border-box;">
          <span style="font-size: 0.9rem; font-weight: 600; color: #00bfff">Directv Go ($30k)</span>
          <input type="checkbox" class="chk-cotizar-plat" value="DIRECTV-GO" data-tipo="herramienta" onchange="controlarDisneyMutuo(this); calcularPreciosSistemaCotizador();" style="accent-color: #0a84ff; width: 18px; height: 18px; cursor: pointer;" />
      </label>
    `;
    container.appendChild(dgoRow);
  }

  // 3. ACTUALIZAR ETIQUETAS VISUALES DE PRECIOS INDIVIDUALES
  document.querySelectorAll(".row-cotizar-plat label span").forEach((span) => {
    if (span.innerText.includes("Spotify")) span.innerText = "Spotify ($14k)";
    if (span.innerText.includes("Deezer")) span.innerText = "Deezer ($12k)";
    if (span.innerText.includes("Metegol")) span.innerText = "Metegol ($15k)";
    if (span.innerText.includes("YouTube"))
      span.innerText = "YouTube Premium ($14k)";
  });

  // 4. INYECTAR SELECTOR DE PANTALLAS (1 A 5)
  document.querySelectorAll(".row-cotizar-plat").forEach((row) => {
    if (!row.querySelector(".cotizador-pantallas-wrapper")) {
      let wrapper = document.createElement("div");
      wrapper.className = "cotizador-pantallas-wrapper";
      wrapper.style.display = "none";
      wrapper.style.padding = "0 14px 12px 14px";
      wrapper.style.justifyContent = "flex-end";

      wrapper.innerHTML = `
        <select class="input-ios sel-pantallas-cotizador" style="width: auto; padding: 6px 12px; font-size: 0.8rem; margin:0; border-radius: 8px; background: rgba(0,0,0,0.4); color: #ffffff; border: 1px solid rgba(255,255,255,0.1); outline: none;" onchange="calcularPreciosSistemaCotizador()">
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

  // Reseteo limpio del formulario
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

  const overlay = document.getElementById("comboCalcOverlay");
  if (overlay) {
    overlay.style.display = "flex";
    overlay.classList.add("open");
  }

  setTimeout(() => {
    const inputBusqueda = document.getElementById("buscarPlataformaCotizador");
    if (inputBusqueda) inputBusqueda.focus();
  }, 120);
};

window.cerrarCalculadoraCombos = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("comboCalcOverlay");
  if (overlay) {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  }
};

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
    const nombrePlat = fila.getAttribute("data-nombre") || "";
    const checkbox = fila.querySelector('input[type="checkbox"]');

    if (query === "") {
      fila.style.display = checkbox && checkbox.checked ? "block" : "none";
    } else {
      if (nombrePlat.includes(query) || (checkbox && checkbox.checked)) {
        fila.style.display = "block";
      } else {
        fila.style.display = "none";
      }
    }
  });
};

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
    "DIRECTV-GO": { indiv: 30000, combo: 25000, isTier: false },
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

  // 1. Escaneo de plataformas seleccionadas
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
        if (pantallas === 1) costoNetflixCalculado = 15000;
        else if (pantallas === 2) costoNetflixCalculado = 27000;
        else if (pantallas === 3) costoNetflixCalculado = 37000;
        else if (pantallas === 4) costoNetflixCalculado = 47000;
        else if (pantallas >= 5) costoNetflixCalculado = 56000;
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

  // 2. Aplicación de reglas de cobro
  if (tieneNetflix) {
    precioBaseUnMes = costoNetflixCalculado;

    if (countDisneyPremium > 0) {
      if (countTierEligible === 0) precioBaseUnMes += 10500;
      else if (countTierEligible === 1) precioBaseUnMes += 14500;
      else if (countTierEligible === 2) precioBaseUnMes += 17500;
      else if (countTierEligible >= 3)
        precioBaseUnMes += 20500 + (countTierEligible - 3) * 3000;

      precioBaseUnMes +=
        (countDisneyPremium - 1) * mapValores["DISNEY-PREMIUM"].combo;
    } else {
      if (countTierEligible === 0) precioBaseUnMes += 0;
      else if (countTierEligible === 1) precioBaseUnMes += 5500;
      else if (countTierEligible === 2) precioBaseUnMes += 9500;
      else if (countTierEligible >= 3)
        precioBaseUnMes += 12500 + (countTierEligible - 3) * 3000;
    }

    arrayAddonsDirectosYExtras.forEach((plat) => {
      precioBaseUnMes += mapValores[plat].combo;
    });
  } else {
    // Lógica Sin Netflix: Algoritmo Max-Base
    if (allOtherScreens.length === 0) {
      precioBaseUnMes = 0;
    } else if (allOtherScreens.length === 1) {
      precioBaseUnMes = mapValores[allOtherScreens[0]].indiv;
    } else {
      allOtherScreens.sort((a, b) => mapValores[b].indiv - mapValores[a].indiv);

      let masCaro = allOtherScreens.shift();
      precioBaseUnMes += mapValores[masCaro].indiv;

      allOtherScreens.forEach((plat) => {
        precioBaseUnMes += mapValores[plat].combo;
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

window.copiarCotizacionCombo = function (btn) {
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

  const monthSelect = document.getElementById("calcMonths");
  const meses = monthSelect.value;
  const porcDesc =
    monthSelect.options[monthSelect.selectedIndex].getAttribute("data-desc");
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
    btn.style.setProperty("background", "#30d158", "important");
    btn.style.setProperty("color", "#000000", "important");

    if (typeof triggerToast === "function") {
      triggerToast(`📋 Cotización copiada al portapapeles.`);
    }

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.setProperty("background", "#30d158", "important");
      btn.style.setProperty("color", "#000000", "important");
      cerrarCalculadoraCombos();
    }, 1500);
  });
};

/* ==========================================================================
   📥 MÓDULO DE CARGA MASIVA DE CUENTAS (STOCK REAL Y CARGADAS EN TURNO)
   ========================================================================== */

window.cuentasCargadasEsteTurno = [];

window.toggleCargarPanel = function () {
  if (typeof haptic === "function") haptic();
  const panel = document.getElementById("cargarOverlay");
  if (!panel) return;

  if (panel.classList.contains("open") || panel.style.display === "flex") {
    panel.classList.remove("open");
    panel.style.display = "none";
  } else {
    if (typeof cerrarTodasLasAppsActivas === "function") {
      cerrarTodasLasAppsActivas();
    }
    panel.classList.add("open");
    panel.style.display = "flex";
    panel.style.alignItems = "center";
    panel.style.justifyContent = "center";

    // Cargar el stock real en el selector de plataformas
    cargarStockSelectCargas();
  }
};

// 📊 CONSULTA Y RELLENA LAS 20 PLATAFORMAS CON SU STOCK EN VIVO
function cargarStockSelectCargas() {
  const selectPlat = document.getElementById("loadPlataforma");
  if (!selectPlat) return;

  const plataformasMap = [
    { id: "AMAZON-PRIME-VIDEO", nombre: "AMAZON PRIME VIDEO" },
    { id: "APPLE-TV", nombre: "APPLE TV+" },
    { id: "DISNEY-PREMIUM", nombre: "DISNEY PREMIUM" },
    { id: "HBO-MAX", nombre: "HBO MAX" },
    { id: "DISNEY-ESTANDAR", nombre: "DISNEY ESTANDAR" },
    { id: "PLEX", nombre: "PLEX" },
    { id: "CRUNCHYROLL", nombre: "CRUNCHYROLL" },
    { id: "VIX", nombre: "VIX" },
    { id: "UNIVERSAL", nombre: "UNIVERSAL" },
    { id: "PARAMOUNT", nombre: "PARAMOUNT" },
    { id: "DIRECTV-GO", nombre: "DIRECTV GO (DGO)" },
    { id: "CANVA", nombre: "CANVA" },
    { id: "CAPCUT", nombre: "CAPCUT" },
    { id: "SPOTIFY", nombre: "SPOTIFY" },
    { id: "YOUTUBE", nombre: "YOUTUBE" },
    { id: "METEGOL", nombre: "METEGOL" },
    { id: "DEEZER", nombre: "DEEZER" },
    { id: "MUBI", nombre: "MUBI" },
    { id: "IPTV", nombre: "IPTV" },
    { id: "FLUJO", nombre: "FLUJO TV" },
    { id: "EMBY", nombre: "EMBY" },
  ];

  const formData = new FormData();
  formData.append("accion", "obtener_stock_plataformas");

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      let stock = res && res.status === "success" ? res.stock || {} : {};

      let html =
        '<option value="" disabled selected>Selecciona Plataforma...</option>';
      plataformasMap.forEach((p) => {
        let cant = stock[p.nombre] !== undefined ? stock[p.nombre] : 0;
        html += `<option value="${p.id}">${p.nombre} (${cant} libres)</option>`;
      });
      selectPlat.innerHTML = html;
    })
    .catch(() => {
      let html =
        '<option value="" disabled selected>Selecciona Plataforma...</option>';
      plataformasMap.forEach((p) => {
        html += `<option value="${p.id}">${p.nombre}</option>`;
      });
      selectPlat.innerHTML = html;
    });
}

function comprobarProveedorDinamico() {
  const selectProv = document.getElementById("loadProveedor").value;
  const wrapperManual = document.getElementById("wrapperProveedorManual");
  const inputManual = document.getElementById("loadProveedorManual");

  if (selectProv === "OTRO") {
    wrapperManual.style.setProperty("display", "flex", "important");
    inputManual.required = true;
    setTimeout(() => inputManual.focus(), 100);
  } else {
    wrapperManual.style.setProperty("display", "none", "important");
    inputManual.required = false;
    inputManual.value = "";
  }
}

function ejecutarCargaLote(e) {
  e.preventDefault();
  if (typeof haptic === "function") haptic();

  const btnSubmit = document.getElementById("btnSubmitCarga");
  const plataforma = document.getElementById("loadPlataforma").value;
  const selectProv = document.getElementById("loadProveedor").value;
  const proveedorManual = document
    .getElementById("loadProveedorManual")
    .value.trim();
  const bloqueCuentas = document.getElementById("loadCuentasBloque").value;

  const proveedorFinal = selectProv === "OTRO" ? proveedorManual : selectProv;

  if (!plataforma) {
    alert("⚠️ Por favor selecciona una plataforma.");
    return;
  }

  if (selectProv === "OTRO" && proveedorFinal === "") {
    alert("⚠️ Por favor escribe el nombre del nuevo proveedor.");
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:8px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Cargando en MySQL...`;

  const formData = new FormData();
  formData.append("accion", "agregar");
  formData.append("tabla", plataforma);
  formData.append("proveedor", proveedorFinal);
  formData.append("bloque_cuentas", bloqueCuentas);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      btnSubmit.disabled = false;
      btnSubmit.innerText = "CARGAR CUENTAS EN LOTE";

      if (
        res &&
        (res.status === "success" || res.status === "repetidas_unicas")
      ) {
        if (res.insertados > 0 && typeof triggerToast === "function") {
          triggerToast(`✅ ${res.message}`);
        }

        // Agregar cuentas nuevas cargadas a la memoria del turno
        if (res.cargadas && res.cargadas.length > 0) {
          res.cargadas.forEach((c) => {
            window.cuentasCargadasEsteTurno.unshift(c);
          });
        }

        // 🚨 MOSTRAR MODAL SI HUBO CUENTAS REPETIDAS OMITIDAS
        if (res.repetidas && res.repetidas.length > 0) {
          if (typeof window.mostrarModalRepetidasCybernet === "function") {
            window.mostrarModalRepetidasCybernet(res.repetidas);
          }
        }

        // Limpiar formulario
        document.getElementById("loadCuentasBloque").value = "";
        document.getElementById("formCargarCuentas").reset();
        document.getElementById("wrapperProveedorManual").style.display =
          "none";

        // Renderizar lista en turno y refrescar stock
        renderizarCargadasEsteTurno();
        cargarStockSelectCargas();
        if (typeof cargarDatosMySQL === "function") cargarDatosMySQL();
      } else {
        alert(
          "❌ Error: " + (res ? res.message : "Fallo al procesar la carga."),
        );
      }
    })
    .catch((err) => {
      console.error(err);
      btnSubmit.disabled = false;
      btnSubmit.innerText = "CARGAR CUENTAS EN LOTE";
      alert("❌ Error de comunicación con el servidor MySQL.");
    });
}

// 📱 RENDERIZA SOLAMENTE CORREO Y CLAVE CARGADAS EN EL TURNO
function renderizarCargadasEsteTurno() {
  const container = document.getElementById("contenedorCargadasTurno");
  const badgeCant = document.getElementById("cantCargadasTurno");
  if (!container) return;

  if (badgeCant) {
    badgeCant.innerText = `${window.cuentasCargadasEsteTurno.length} cuentas`;
  }

  if (window.cuentasCargadasEsteTurno.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 25px; color: #a1a1aa; font-size: 0.82rem; background: rgba(0, 0, 0, 0.2); border-radius: 14px; border: 1px dashed rgba(255, 255, 255, 0.08);">
        Las cuentas inyectadas a Sheets se reflejarán aquí con accesos rápidos.
      </div>
    `;
    return;
  }

  let html = "";
  window.cuentasCargadasEsteTurno.forEach((c) => {
    const correoEsc = encodeURIComponent(c.correo);
    const claveEsc = encodeURIComponent(c.clave);

    html += `
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
        <div style="display: flex; flex-direction: column; gap: 2px; overflow: hidden; flex-grow: 1;">
          <span style="color: #0a84ff; font-weight: 800; font-family: monospace; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.correo}</span>
          <span style="color: #30d158; font-weight: 700; font-family: monospace; font-size: 0.82rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.clave}</span>
        </div>

        <div style="display: flex; gap: 6px; flex-shrink: 0;">
          <button onclick="window.copiarDatoCargaIndividual(this, '${correoEsc}')" style="background: rgba(10, 132, 255, 0.15); border: 1px solid rgba(10, 132, 255, 0.3); color: #0a84ff; padding: 6px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer;" title="Copiar Correo">
            Correo
          </button>
          <button onclick="window.copiarDatoCargaIndividual(this, '${claveEsc}')" style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; padding: 6px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer;" title="Copiar Clave">
            Clave
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

window.copiarDatoCargaIndividual = function (btn, textoEsc) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(textoEsc);

  navigator.clipboard.writeText(texto).then(() => {
    const origHtml = btn.innerHTML;
    btn.innerHTML = "✓";
    btn.style.setProperty("background", "#30d158", "important");
    btn.style.setProperty("color", "#000000", "important");

    if (typeof triggerToast === "function") {
      triggerToast("📋 Copiado al portapapeles");
    }

    setTimeout(() => {
      btn.innerHTML = origHtml;
      btn.style.background = "";
      btn.style.color = "";
    }, 1200);
  });
};
/* ==========================================================================
   ⚠️ VENTANA FLOTANTE AUTOMÁTICA DE CUENTAS REPETIDAS
   ========================================================================== */

window.mostrarModalRepetidasCybernet = function (repetidasArray) {
  if (typeof haptic === "function") haptic();

  // Si ya existía una ventana vieja abierta, la destruimos
  const oldModal = document.getElementById("modalRepetidasOverlay");
  if (oldModal) oldModal.remove();

  if (!repetidasArray || repetidasArray.length === 0) return;

  let itemsHtml = "";
  repetidasArray.forEach((cuenta) => {
    const correo = cuenta.correo || "Correo no especificado";
    const fecha = cuenta.fecha || "Sin fecha registrada";

    itemsHtml += `
      <div style="background: rgba(255, 159, 10, 0.05); border: 1px solid rgba(255, 159, 10, 0.25); border-left: 4px solid #ff9f0a; border-radius: 14px; padding: 12px 14px; display: flex; flex-direction: column; gap: 4px;">
        <span style="font-family: monospace; font-size: 0.9rem; font-weight: 800; color: #ffffff; word-break: break-all;">${correo}</span>
        <div style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #a1a1aa;">
          <span>📅 Se adquirió/cargó el:</span>
          <b style="color: #ff9f0a; font-weight: 800;">${fecha}</b>
        </div>
      </div>
    `;
  });

  const modalHtml = `
    <div class="overlay-ios open" id="modalRepetidasOverlay" style="display: flex !important; z-index: 999999 !important; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); align-items: center; justify-content: center;">
      <div class="modal-ios" style="max-width: 460px; width: 92%; max-height: 85vh; background: #141417; border: 1px solid rgba(255, 159, 10, 0.4); border-radius: 26px; padding: 22px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 25px 60px rgba(0,0,0,0.9); overflow: hidden;">
        
        <!-- ENCABEZADO -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: rgba(255, 159, 10, 0.15); color: #ff9f0a; width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255, 159, 10, 0.3);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div>
              <h3 style="margin: 0; color: #ffffff; font-size: 1.05rem; font-weight: 800;">Cuentas Repetidas (${repetidasArray.length})</h3>
              <span style="color: #a1a1aa; font-size: 0.72rem;">Omitidas para no duplicar en MySQL</span>
            </div>
          </div>
          <button type="button" onclick="document.getElementById('modalRepetidasOverlay').remove()" style="background: rgba(255,255,255,0.08); border: none; color: #a1a1aa; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
        </div>

        <!-- LISTA DE CUENTAS OMITIDAS CON SU FECHA ORIGEN -->
        <div style="display: flex; flex-direction: column; gap: 10px; overflow-y: auto; flex-grow: 1; padding-right: 2px;" class="cyber-custom-scroll">
          ${itemsHtml}
        </div>

        <!-- BOTÓN ENTENDIDO -->
        <button onclick="document.getElementById('modalRepetidasOverlay').remove()" style="width: 100%; background: #ff9f0a; color: #000000; border: none; padding: 12px; border-radius: 14px; font-weight: 900; font-size: 0.88rem; cursor: pointer; flex-shrink: 0;">
          Entendido / Cerrar Ventana
        </button>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
};

// 📥 FUNCIÓN DE EJECUCIÓN DE CARGA ACTUALIZADA
function ejecutarCargaLote(e) {
  e.preventDefault();
  if (typeof haptic === "function") haptic();

  const btnSubmit = document.getElementById("btnSubmitCarga");
  const plataforma = document.getElementById("loadPlataforma").value;
  const selectProv = document.getElementById("loadProveedor").value;
  const proveedorManual = document
    .getElementById("loadProveedorManual")
    .value.trim();
  const bloqueCuentas = document.getElementById("loadCuentasBloque").value;

  const proveedorFinal = selectProv === "OTRO" ? proveedorManual : selectProv;

  if (!plataforma) {
    alert("⚠️ Por favor selecciona una plataforma.");
    return;
  }

  if (selectProv === "OTRO" && proveedorFinal === "") {
    alert("⚠️ Por favor escribe el nombre del nuevo proveedor.");
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:8px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Cargando en MySQL...`;

  const formData = new FormData();
  formData.append("accion", "agregar");
  formData.append("tabla", plataforma);
  formData.append("proveedor", proveedorFinal);
  formData.append("bloque_cuentas", bloqueCuentas);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      btnSubmit.disabled = false;
      btnSubmit.innerText = "CARGAR CUENTAS EN LOTE";

      if (
        res &&
        (res.status === "success" || res.status === "repetidas_unicas")
      ) {
        if (res.insertados > 0 && typeof triggerToast === "function") {
          triggerToast(`✅ ${res.message}`);
        }

        // Agregar cuentas nuevas a la lista de este turno
        if (res.cargadas && res.cargadas.length > 0) {
          res.cargadas.forEach((c) => {
            window.cuentasCargadasEsteTurno.unshift(c);
          });
        }

        // 🚨 SI HAY REPETIDAS, DESPLIEGA LA VENTANA FLOTANTE
        if (res.repetidas && res.repetidas.length > 0) {
          window.mostrarModalRepetidasCybernet(res.repetidas);
        }

        // Limpiar formulario
        document.getElementById("loadCuentasBloque").value = "";
        document.getElementById("formCargarCuentas").reset();
        document.getElementById("wrapperProveedorManual").style.display =
          "none";

        // Refrescar paneles
        renderizarCargadasEsteTurno();
        cargarStockSelectCargas();
        if (typeof cargarDatosMySQL === "function") cargarDatosMySQL();
      } else {
        alert(
          "❌ Error: " + (res ? res.message : "Fallo al procesar la carga."),
        );
      }
    })
    .catch((err) => {
      console.error(err);
      btnSubmit.disabled = false;
      btnSubmit.innerText = "CARGAR CUENTAS EN LOTE";
      alert("❌ Error de comunicación con el servidor MySQL.");
    });
}

/* ==========================================================================
   🚫 MÓDULO DE BASE DE DATOS SUSPENDIDAS (PINESMES Y NEYOP)
   ========================================================================== */

// 🚪 ABRIR PANEL DE SUSPENDIDAS Y AUTO-ACTUALIZAR EN SEGUNDO PLANO
window.toggleSuspendidasPanel = function () {
  if (typeof haptic === "function") haptic();

  const overlay = document.getElementById("suspendidasOverlay");
  if (!overlay) return;

  overlay.classList.toggle("open");

  if (overlay.classList.contains("open")) {
    if (typeof window.CyberSonidos !== "undefined")
      window.CyberSonidos.play("abrir");

    window.vistaModalDb = "PINESMES";

    if (typeof window.cargarSuspendidas === "function") {
      window.cargarSuspendidas(true);
    }
  } else {
    if (typeof window.CyberSonidos !== "undefined")
      window.CyberSonidos.play("cerrar");
  }
};

window.refrescarVistaActualModal = function () {
  if (typeof haptic === "function") haptic();
  if (window.vistaModalDb === "NEYOP") {
    cargarNeyop(true);
  } else {
    cargarSuspendidas(true);
  }
};

// 🔍 LÓGICA DE BÚSQUEDA COMPARTIDA
window.manejarInputBusquedaSuspendidas = function () {
  const input = document.getElementById("inputBuscarSuspendidas");
  const btnBorrar = document.getElementById("btnBorrarBusquedaSuspendidas");

  if (input && btnBorrar) {
    if (input.value.length > 0) {
      btnBorrar.style.display = "block";
    } else {
      btnBorrar.style.display = "none";
    }
  }

  if (window.vistaModalDb === "NEYOP") {
    if (typeof renderizarTablaNeyop === "function") renderizarTablaNeyop();
  } else {
    if (typeof renderizarTablaSuspendidas === "function")
      renderizarTablaSuspendidas();
  }
};

window.borrarBusquedaSuspendidas = function () {
  if (typeof haptic === "function") haptic();
  const input = document.getElementById("inputBuscarSuspendidas");
  const btnBorrar = document.getElementById("btnBorrarBusquedaSuspendidas");

  if (input) {
    input.value = "";
    input.focus();
  }
  if (btnBorrar) btnBorrar.style.display = "none";

  if (window.vistaModalDb === "NEYOP") {
    if (typeof renderizarTablaNeyop === "function") renderizarTablaNeyop();
  } else {
    if (typeof renderizarTablaSuspendidas === "function")
      renderizarTablaSuspendidas();
  }
};

// 🟣 DESCARGA Y RENDERIZADO EXCLUSIVO DE SUSPENDIDAS (PINESMES)
window.cargarSuspendidas = function (forzar = false) {
  const contenedor = document.getElementById("contenedorTablaSuspendidas");
  const iconRefrescar = document.getElementById("iconRefrescarSuspendidas");
  if (!contenedor) return;

  if (forzar && iconRefrescar) {
    iconRefrescar.classList.add("spin-anim");
  } else if (!forzar && memoriaSuspendidas.length === 0) {
    contenedor.innerHTML = `
      <div style="padding: 60px; text-align: center; color: #8e8e93;">
        <svg class="spin-anim" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
        <h3 style="margin-top: 15px; font-size: 1rem;">Descargando Base de Datos...</h3>
      </div>
    `;
  }

  const cbName = "cb_susp_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (iconRefrescar) iconRefrescar.classList.remove("spin-anim");

    if (res && res.status === "success") {
      memoriaSuspendidas = res.data;
      if (window.vistaModalDb === "PINESMES") renderizarTablaSuspendidas();

      if (forzar && typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"></path></svg> <span>Base de datos actualizada en vivo.</span></div>`,
        );
      }
    } else {
      if (window.vistaModalDb === "PINESMES") {
        contenedor.innerHTML = `<div style="color:#ff453a; text-align:center; padding:40px; font-weight:bold;">❌ Error de conexión: ${res ? res.message : "Desconocido"}</div>`;
      }
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerDatosPinesMes&forzar=${forzar}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// 📡 RADAR DE VERIFICACIÓN PARA CUENTAS SUSPENDIDAS
window.estadoRadarSuspendidas = window.estadoRadarSuspendidas || {};
window.radaresSuspendidas = window.radaresSuspendidas || {};

window.copiarCorreoYBuscarVerificacion = function (btn, correo, filaIndex) {
  if (typeof haptic === "function") haptic();

  const originalHTML = btn.innerHTML;

  navigator.clipboard
    .writeText(correo)
    .then(() => {
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ios-green)" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      setTimeout(() => {
        btn.innerHTML = originalHTML;
      }, 1500);
    })
    .catch((err) => {
      const txt = document.createElement("textarea");
      txt.value = correo;
      document.body.appendChild(txt);
      txt.select();
      document.execCommand("copy");
      txt.remove();
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ios-green)" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      setTimeout(() => {
        btn.innerHTML = originalHTML;
      }, 1500);
    });

  window.iniciarRadarSuspendidas(correo, filaIndex);
};

window.iniciarRadarSuspendidas = function (correoTarget, filaIndex) {
  window.estadoRadarSuspendidas[filaIndex] = { status: "buscando" };

  const btnVerificar = document.getElementById(`btnVerificar_${filaIndex}`);
  const btnActivar = document.getElementById(`btnActivar_${filaIndex}`);

  if (btnVerificar) {
    btnVerificar.style.display = "inline-flex";
    btnVerificar.style.background = "rgba(48, 209, 88, 0.15)";
    btnVerificar.style.color = "var(--ios-green)";
    btnVerificar.style.border = "1px solid rgba(48, 209, 88, 0.3)";
    btnVerificar.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Buscando...`;
    btnVerificar.removeAttribute("href");
    btnVerificar.removeAttribute("target");
    btnVerificar.onclick = null;
  }

  if (btnActivar) {
    btnActivar.style.display = "none";
  }

  if (window.radaresSuspendidas[filaIndex]) {
    clearInterval(window.radaresSuspendidas[filaIndex]);
  }

  window.radaresSuspendidas[filaIndex] = setInterval(function () {
    const cbRadarName = "cb_radar_susp_" + filaIndex + "_" + Date.now();

    window[cbRadarName] = function (res) {
      const node = document.getElementById("node_" + cbRadarName);
      if (node) node.remove();
      delete window[cbRadarName];

      if (res && res.status === "success" && res.link) {
        clearInterval(window.radaresSuspendidas[filaIndex]);

        window.estadoRadarSuspendidas[filaIndex] = {
          status: "encontrado",
          link: res.link,
        };

        if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");

        const currentBtnVerificar = document.getElementById(
          `btnVerificar_${filaIndex}`,
        );
        const currentBtnActivar = document.getElementById(
          `btnActivar_${filaIndex}`,
        );

        if (currentBtnVerificar) {
          currentBtnVerificar.href = res.link;
          currentBtnVerificar.target = "_blank";
          currentBtnVerificar.className = "btn-ios btn-success";
          currentBtnVerificar.style.background = "";
          currentBtnVerificar.style.color = "";
          currentBtnVerificar.style.borderColor = "transparent";
          currentBtnVerificar.style.padding = "6px 14px";
          currentBtnVerificar.innerHTML = `✉️ Verificar`;

          currentBtnVerificar.onclick = function () {
            if (currentBtnActivar) {
              currentBtnActivar.style.display = "flex";
              if (typeof haptic === "function") haptic();
            }
          };
        }
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbRadarName;
    script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerLinkVerificacion&correo=${encodeURIComponent(correoTarget)}&callback=${cbRadarName}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  }, 4000);
};

// 🚀 CONTROL DINÁMICO DEL BOTÓN "ACTIVAR TODAS"
window.ejecutarActivarTodasDinamico = function (btn) {
  if (typeof haptic === "function") haptic();
  let idsValidos = [];

  let botonesActivar = document.querySelectorAll('[id^="btnActivar_"]');

  botonesActivar.forEach((b) => {
    if (b.style.display !== "none") {
      let idFila = b.id.split("_")[1];
      idsValidos.push(idFila);
    }
  });

  if (idsValidos.length === 0) {
    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-orange);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> <span>No hay cuentas verificadas o listas para activar.</span></div>`,
      );
    } else {
      alert("No hay cuentas verificadas o de Recarga 2+ listas para activar.");
    }
    return;
  }

  if (typeof window.activarMultiplesCuentasSuspendidas === "function") {
    window.activarMultiplesCuentasSuspendidas(idsValidos.join(","), btn);
  }
};

// 🟣 TABLA DE RENDERIZADO SUSPENDIDAS (PINESMES)
window.renderizarTablaSuspendidas = function () {
  const contenedor = document.getElementById("contenedorTablaSuspendidas");
  const inputBuscador = document.getElementById("inputBuscarSuspendidas");
  if (!contenedor) return;

  const texto = inputBuscador ? inputBuscador.value.toLowerCase().trim() : "";

  let filtrados = memoriaSuspendidas;
  if (texto.length >= 2) {
    let textoLimpioNum = texto.replace(/\D/g, "");
    let esPosibleTelefono = textoLimpioNum.length >= 4 && !texto.includes("@");

    filtrados = memoriaSuspendidas.filter(
      (c) =>
        (c.correo || "").toLowerCase().includes(texto) ||
        (c.pin || "").toLowerCase().includes(texto) ||
        (c.clave || "").toLowerCase().includes(texto) ||
        (c.cliente || "").toLowerCase().includes(texto) ||
        (esPosibleTelefono && (c.telefono || "").includes(textoLimpioNum)),
    );
  }

  const hoyObj = new Date();
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
  const fechaHoyCorta = hoyObj.getDate() + "-" + mesesAbrev[hoyObj.getMonth()];

  if (typeof convertirFechaAObjetoLupa === "function") {
    filtrados.sort((a, b) => {
      let fA = a.fechaActivacion
        ? convertirFechaAObjetoLupa(a.fechaActivacion)
        : Date.now();
      let fB = b.fechaActivacion
        ? convertirFechaAObjetoLupa(b.fechaActivacion)
        : Date.now();
      return fB - fA;
    });
  }

  let htmlTabla = `
    <table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.85rem; color: #e4e4e7; text-align: left; white-space: nowrap;">
      <thead>
        <tr>
          <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #a1a1aa; letter-spacing: 0.5px;">CORREO</th>
          <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #a1a1aa; letter-spacing: 0.5px;">CONTRASEÑA</th>
          <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #8e8e93; letter-spacing: 0.5px;">PIN REC.</th>
          <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #bf5af2; letter-spacing: 0.5px;">RECARGA</th>
          <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #a1a1aa; letter-spacing: 0.5px;">ACTIVACIÓN</th>
          <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #ff453a; letter-spacing: 0.5px; text-align:center;">VENCIMIENTO</th>
          <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #a1a1aa; letter-spacing: 0.5px;">CREADOR</th>
          <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #30d158; letter-spacing: 0.5px; text-align:center;">VERIFICAR</th>
        </tr>
      </thead>
      <tbody>
  `;

  if (filtrados.length === 0) {
    htmlTabla += `<tr><td colspan="8" style="text-align:center; padding:40px; color:#ff453a; font-weight:bold;">No se encontraron resultados en la base de datos.</td></tr>`;
  } else {
    let ultimaFechaRenderizada = null;

    filtrados.forEach((cuenta, idx) => {
      const esFilaPar = idx % 2 === 0;
      const colorFondoFila = esFilaPar
        ? "rgba(255, 255, 255, 0.015)"
        : "transparent";

      const noTieneFecha =
        !cuenta.fechaActivacion || cuenta.fechaActivacion === "";
      const fechaGrupo = noTieneFecha
        ? `⏳ PENDIENTES (Hoy: ${fechaHoyCorta})`
        : cuenta.fechaActivacion;

      const esRecarga1 = String(cuenta.recarga || "").trim() === "1";
      const estadoRadar = window.estadoRadarSuspendidas[cuenta.filaIndex];

      if (fechaGrupo !== ultimaFechaRenderizada) {
        let botonActivarTodas = "";
        if (noTieneFecha) {
          botonActivarTodas = `<button onclick="window.ejecutarActivarTodasDinamico(this)" class="btn-ios btn-success" style="padding: 6px 14px; font-size: 0.75rem; border-radius: 8px; margin: 0; box-shadow: 0 4px 10px rgba(48, 209, 88, 0.25); display: flex; align-items: center; justify-content: center; gap: 6px; font-weight:800; margin: 0 auto; white-space: nowrap;">🚀 Activar Todas</button>`;
        }

        htmlTabla += `
          <tr style="background: rgba(142, 142, 147, 0.08);">
            <td colspan="6" style="padding: 8px 16px; border-top: 1px solid rgba(142, 142, 147, 0.15); border-bottom: 1px solid rgba(142, 142, 147, 0.15); color: #a1a1aa; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
              📅 Cuentas del: ${fechaGrupo}
            </td>
            <td style="padding: 8px 16px; border-top: 1px solid rgba(142, 142, 147, 0.15); border-bottom: 1px solid rgba(142, 142, 147, 0.15); text-align: center;">
              ${botonActivarTodas}
            </td>
            <td style="padding: 8px 16px; border-top: 1px solid rgba(142, 142, 147, 0.15); border-bottom: 1px solid rgba(142, 142, 147, 0.15);"></td>
          </tr>
        `;
        ultimaFechaRenderizada = fechaGrupo;
      }

      const svgCopy = (dato, titulo) => {
        if (!dato || dato === "-") return "";
        const datoLimpio = String(dato).replace(/'/g, "\\'");
        return `
          <button onclick="copiarDatoAisladoLupa(this, '${datoLimpio}')" title="${titulo}" style="background: transparent; border: none; color: #71717a; cursor: pointer; padding: 2px 4px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; transition: color 0.2s ease;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#71717a'">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        `;
      };

      let textoActivacion = noTieneFecha
        ? `<span style="color:var(--ios-blue); font-style:italic;">${fechaHoyCorta}</span>`
        : cuenta.fechaActivacion;
      let botonOTextoVencimiento = cuenta.fechaVencimiento || "-";

      if (noTieneFecha) {
        if (esRecarga1) {
          botonOTextoVencimiento = `<button id="btnActivar_${cuenta.filaIndex}" onclick="window.activarCuentaSuspendida('${cuenta.filaIndex}', this)" class="btn-ios btn-success" style="display: none; padding: 6px 14px; font-size: 0.75rem; border-radius: 8px; margin: 0; box-shadow: 0 4px 10px rgba(48, 209, 88, 0.25); align-items: center; justify-content: center; gap: 6px; font-weight:800; margin: 0 auto; transition: all 0.3s ease;">
            🚀 Activar
          </button>`;
        } else {
          botonOTextoVencimiento = `<button id="btnActivar_${cuenta.filaIndex}" onclick="window.activarCuentaSuspendida('${cuenta.filaIndex}', this)" class="btn-ios btn-success" style="display: flex; padding: 6px 14px; font-size: 0.75rem; border-radius: 8px; margin: 0; box-shadow: 0 4px 10px rgba(48, 209, 88, 0.25); align-items: center; justify-content: center; gap: 6px; font-weight:800; margin: 0 auto; transition: all 0.3s ease;">
            🚀 Activar
          </button>`;
        }
      }

      let celdaPinContent = "";
      if (cuenta.pin && cuenta.pin.trim() !== "" && cuenta.pin !== "-") {
        celdaPinContent = `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
            <span>${cuenta.pin}</span>
            ${svgCopy(cuenta.pin, "Copiar PIN")}
          </div>`;
      } else {
        celdaPinContent = `
          <div style="display: flex; align-items: center; justify-content: center;">
            <button onclick="window.extraerPinIndividual('${cuenta.correo}', this)" class="btn-ios" style="padding: 4px 8px; font-size: 0.7rem; border-radius: 6px; margin: 0; background: rgba(10, 132, 255, 0.1); color: var(--ios-blue); border: 1px solid rgba(10, 132, 255, 0.2); font-weight:700; display:flex; align-items:center; gap:4px; transition: all 0.2s;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
              </svg>
              PIN
            </button>
          </div>`;
      }

      let botonCopiaCorreo = "";
      let celdaVerificarContent = "";

      if (esRecarga1 && noTieneFecha) {
        botonCopiaCorreo = `<button onclick="window.copiarCorreoYBuscarVerificacion(this, '${String(cuenta.correo).replace(/'/g, "\\'")}', '${cuenta.filaIndex}')" title="Copiar correo e iniciar verificación" style="background: transparent; border: none; color: #71717a; cursor: pointer; padding: 2px 4px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; transition: color 0.2s ease;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#71717a'">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>`;

        if (estadoRadar && estadoRadar.status === "encontrado") {
          celdaVerificarContent = `<a id="btnVerificar_${cuenta.filaIndex}" href="${estadoRadar.link}" target="_blank" class="btn-ios btn-success" style="display: inline-flex; padding: 6px 14px; font-size: 0.8rem; border-radius: 10px; text-decoration: none; font-weight: 800; align-items: center; justify-content: center; gap: 6px; transition: all 0.3s ease; margin: 0 auto; border-color: transparent;" onclick="document.getElementById('btnActivar_${cuenta.filaIndex}').style.display='flex';">✉️ Verificar</a>`;
        } else if (estadoRadar && estadoRadar.status === "buscando") {
          celdaVerificarContent = `<a id="btnVerificar_${cuenta.filaIndex}" class="btn-ios" style="display: inline-flex; padding: 6px 14px; font-size: 0.8rem; border-radius: 10px; text-decoration: none; font-weight: 800; align-items: center; justify-content: center; gap: 6px; transition: all 0.3s ease; margin: 0 auto; background: rgba(48, 209, 88, 0.15); color: var(--ios-green); border: 1px solid rgba(48, 209, 88, 0.3);"><svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Buscando...</a>`;
        } else {
          celdaVerificarContent = `<a id="btnVerificar_${cuenta.filaIndex}" class="btn-ios" style="display: none; padding: 6px 14px; font-size: 0.8rem; border-radius: 10px; text-decoration: none; font-weight: 800; align-items: center; justify-content: center; gap: 6px; transition: all 0.3s ease; margin: 0 auto;"></a>`;
        }
      } else {
        botonCopiaCorreo = svgCopy(cuenta.correo, "Copiar correo");
        celdaVerificarContent = `<span style="color: var(--text-secondary); display: block; text-align: center;">-</span>`;
      }

      htmlTabla += `
        <tr style="background: ${colorFondoFila}; transition: background 0.3s ease;">
          <td style="padding: 12px 16px; font-weight: 600; color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.03);">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
              <span>${cuenta.correo || "-"}</span>
              ${botonCopiaCorreo}
            </div>
          </td>
          <td style="padding: 12px 16px; color: #30d158; font-family: monospace; border-bottom: 1px solid rgba(255,255,255,0.03);">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
              <span>${cuenta.clave || "-"}</span>
              ${svgCopy(cuenta.clave, "Copiar contraseña")}
            </div>
          </td>
          <td style="padding: 12px 16px; color: #8e8e93; font-family: monospace; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.03);">
            ${celdaPinContent}
          </td>
          <td style="padding: 12px 16px; color: #bf5af2; font-weight:800; border-bottom: 1px solid rgba(255,255,255,0.03);">${cuenta.recarga || "-"}</td>
          <td style="padding: 12px 16px; color: #a1a1aa; border-bottom: 1px solid rgba(255,255,255,0.03);">${textoActivacion}</td>
          <td style="padding: 8px 16px; color: #ff453a; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.03); text-align: center;">${botonOTextoVencimiento}</td>
          <td style="padding: 12px 16px; color: #a1a1aa; border-bottom: 1px solid rgba(255,255,255,0.03);">${cuenta.quienActivo || cuenta.quien_activo || "-"}</td>
          
          <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); text-align: center;">
            ${celdaVerificarContent}
          </td>
        </tr>
      `;
    });
  }

  htmlTabla += `</tbody></table>`;
  contenedor.innerHTML = htmlTabla;
};

/* ==========================================================================
   🟣 INTERCAMBIO DE VISTAS Y RENDERIZADO DE NEYOP (GOOGLE SHEETS)
   ========================================================================== */

window.cambiarVistaModalDb = function (vista) {
  if (typeof haptic === "function") haptic();
  window.vistaModalDb = vista;

  const btnNeyop = document.getElementById("btnVistaNeyop");
  const btnSusp = document.getElementById("btnVistaSuspendidas");
  const grupoPines = document.getElementById("grupoBotonesPinesMes");
  const grupoNeyop = document.getElementById("grupoBotonesNeyop");
  const titulo = document.getElementById("tituloModalSuspendidas");

  // Limpiar campo de búsqueda al cambiar de pestaña
  const input = document.getElementById("inputBuscarSuspendidas");
  const btnBorrar = document.getElementById("btnBorrarBusquedaSuspendidas");
  if (input) input.value = "";
  if (btnBorrar) btnBorrar.style.display = "none";

  if (vista === "NEYOP") {
    if (btnNeyop) btnNeyop.style.display = "none";
    if (btnSusp) btnSusp.style.display = "flex";
    if (grupoPines) grupoPines.style.display = "none";
    if (grupoNeyop) grupoNeyop.style.display = "flex";
    if (titulo) titulo.innerHTML = "Base de Datos: NEYOP";

    // Si aún no se han cargado los datos de NEYOP, los descarga
    if (!window.memoriaNeyop || window.memoriaNeyop.length === 0) {
      cargarNeyop();
    } else {
      renderizarTablaNeyop();
    }
  } else {
    if (btnNeyop) btnNeyop.style.display = "flex";
    if (btnSusp) btnSusp.style.display = "none";
    if (grupoPines) grupoPines.style.display = "flex";
    if (grupoNeyop) grupoNeyop.style.display = "none";
    if (titulo) titulo.innerHTML = "Base de Datos: Suspendidas";

    if (!window.memoriaSuspendidas || window.memoriaSuspendidas.length === 0) {
      cargarSuspendidas();
    } else {
      renderizarTablaSuspendidas();
    }
  }
};

window.cargarNeyop = function (forzar = false) {
  const container = document.getElementById("contenedorTablaSuspendidas");
  const iconRefrescar = document.getElementById("iconRefrescarSuspendidas");
  if (!container) return;

  if (forzar && iconRefrescar) {
    iconRefrescar.classList.add("spin-anim");
  } else if (
    !forzar &&
    (!window.memoriaNeyop || window.memoriaNeyop.length === 0)
  ) {
    container.innerHTML = `
      <div style="padding: 60px; text-align: center; color: #ff9f0a;">
        <svg class="spin-anim" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
        <h3 style="margin-top: 15px; font-size: 1rem;">Conectando a NEYOP en Google Sheets...</h3>
      </div>
    `;
  }

  const cbName = "cb_neyop_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (iconRefrescar) iconRefrescar.classList.remove("spin-anim");

    if (res && res.status === "success") {
      window.memoriaNeyop = res.data || [];
      if (window.vistaModalDb === "NEYOP") {
        renderizarTablaNeyop();
      }

      if (forzar && typeof triggerToast === "function") {
        triggerToast("✅ NEYOP actualizado desde Sheets.");
      }
    } else {
      if (window.vistaModalDb === "NEYOP") {
        container.innerHTML = `<div style="color:#ff453a; text-align:center; padding:40px; font-weight:bold;">❌ Error de conexión: ${res ? res.message : "Desconocido"}</div>`;
      }
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerDatosNeyop&forzar=${forzar}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.renderizarTablaNeyop = function () {
  const container = document.getElementById("contenedorTablaSuspendidas");
  const inputBuscador = document.getElementById("inputBuscarSuspendidas");
  if (!container) return;

  const texto = inputBuscador ? inputBuscador.value.toLowerCase().trim() : "";

  let filtrados = window.memoriaNeyop || [];
  if (texto.length >= 2) {
    filtrados = window.memoriaNeyop.filter((item) => {
      return (
        (item.yopmail || "").toLowerCase().includes(texto) ||
        (item.correo || "").toLowerCase().includes(texto) ||
        (item.claveVieja || item.clave_vieja || "")
          .toLowerCase()
          .includes(texto) ||
        (item.claveNueva || item.clave_nueva || "")
          .toLowerCase()
          .includes(texto)
      );
    });
  }

  // Cuentas con correo registrado arriba, vacías abajo
  filtrados.sort((a, b) => {
    let tieneCorreoA =
      a.correo && a.correo.trim() !== "" && a.correo.trim() !== "-" ? 1 : 0;
    let tieneCorreoB =
      b.correo && b.correo.trim() !== "" && b.correo.trim() !== "-" ? 1 : 0;
    return tieneCorreoB - tieneCorreoA;
  });

  let html = `<table style="width: 100% !important; border-collapse: collapse !important; font-size: 0.85rem !important; color: #e4e4e7 !important; text-align: left !important; white-space: nowrap !important; margin: 0 !important;">
    <thead style="position: sticky !important; top: 0 !important; z-index: 100 !important; background: #18181b !important;">
      <tr style="background: #18181b !important;">
        <th style="padding: 12px 14px !important; font-weight: 800 !important; color: #ff9f0a !important; border-bottom: 2px solid rgba(255,255,255,0.12) !important;">YOPMAIL</th>
        <th style="padding: 12px 14px !important; font-weight: 800 !important; color: #a1a1aa !important; border-bottom: 2px solid rgba(255,255,255,0.12) !important;">CORREO / CUENTA</th>
        <th style="padding: 12px 14px !important; font-weight: 800 !important; color: #a1a1aa !important; border-bottom: 2px solid rgba(255,255,255,0.12) !important;">CLAVE VIEJA</th>
        <th style="padding: 12px 14px !important; font-weight: 800 !important; color: #30d158 !important; border-bottom: 2px solid rgba(255,255,255,0.12) !important;">CLAVE NUEVA</th>
        <th style="padding: 12px 14px !important; font-weight: 800 !important; color: #ff9f0a !important; text-align: center !important; border-bottom: 2px solid rgba(255,255,255,0.12) !important;">ESTADO</th>
      </tr>
    </thead>
    <tbody>`;

  if (filtrados.length === 0) {
    html += `<tr><td colspan="5" style="text-align:center; padding:40px; color:#ff9f0a; font-weight:bold;">No se encontraron resultados en NEYOP.</td></tr>`;
  } else {
    filtrados.forEach((cuenta, idx) => {
      const estaListo = (cuenta.estado || "").toUpperCase() === "LISTO";
      const esFilaPar = idx % 2 === 0;

      let colorFondoFila = esFilaPar
        ? "rgba(255, 255, 255, 0.015)"
        : "transparent";
      let colorPrimario = "#ff9f0a";
      let colorBlanco = "#ffffff";
      let colorVerde = "#30d158";

      if (estaListo) {
        colorFondoFila = "rgba(255, 159, 10, 0.15)";
        colorPrimario = "#ffb74d";
        colorBlanco = "#ffb74d";
        colorVerde = "#ffb74d";
      }

      const cVieja = cuenta.claveVieja || cuenta.clave_vieja || "-";
      const cNueva = cuenta.claveNueva || cuenta.clave_nueva || "-";

      const yopEsc = encodeURIComponent(cuenta.yopmail || "");
      const corEsc = encodeURIComponent(cuenta.correo || "");
      const cvEsc = encodeURIComponent(cVieja);
      const cnEsc = encodeURIComponent(cNueva);

      const svgCopy = (datoEsc, titulo) => {
        if (!datoEsc || decodeURIComponent(datoEsc) === "-") return "";
        return `
          <button onclick="copiarDatoCargaIndividual(this, '${datoEsc}')" title="${titulo}" style="background: transparent; border: none; color: ${estaListo ? "#ffb74d" : "#71717a"}; cursor: pointer; padding: 2px 4px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; transition: color 0.2s ease;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='${estaListo ? "#ffb74d" : "#71717a"}'">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        `;
      };

      let botonAccion = "";
      if (estaListo) {
        botonAccion = `<span style="color: #ff9f0a; font-weight: 800; display:flex; align-items:center; justify-content: center; gap:4px; font-size: 0.8rem;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Completado
        </span>`;
      } else if (
        cuenta.correo &&
        cuenta.correo.trim() !== "" &&
        cuenta.correo.trim() !== "-"
      ) {
        botonAccion = `<button onclick="window.marcarListoNeyop('${cuenta.filaIndex || cuenta.id}', this)" class="btn-ios" style="padding: 8px 14px; font-size: 0.75rem; border-radius: 8px; margin: 0 auto; background: #ff9f0a; color: white; border: none; font-weight:800; display:flex; align-items:center; gap:6px; box-shadow: 0 4px 10px rgba(255, 159, 10, 0.3);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Listo
        </button>`;
      }

      html += `
        <tr style="background: ${colorFondoFila} !important; border-bottom: 1px solid rgba(255,255,255,0.03) !important; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,159,10,0.2)'" onmouseout="this.style.background='${colorFondoFila}'">
          <td style="padding: 10px 14px !important; font-weight: 700 !important; color: ${colorPrimario} !important;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span>${cuenta.yopmail || "-"}</span>
              ${svgCopy(yopEsc, "Copiar Yopmail")}
            </div>
          </td>
          <td style="padding: 10px 14px !important; font-weight: 700 !important; color: ${colorBlanco} !important;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span>${cuenta.correo || "-"}</span>
              ${svgCopy(corEsc, "Copiar Correo")}
            </div>
          </td>
          <td style="padding: 10px 14px !important; color: ${estaListo ? colorBlanco : "#a1a1aa"} !important; font-family: monospace !important;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span>${cVieja}</span>
              ${svgCopy(cvEsc, "Copiar Clave Vieja")}
            </div>
          </td>
          <td style="padding: 10px 14px !important; color: ${colorVerde} !important; font-family: monospace !important; font-weight: 700 !important;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span>${cNueva}</span>
              ${svgCopy(cnEsc, "Copiar Clave Nueva")}
            </div>
          </td>
          <td style="padding: 8px 16px !important; border-bottom: 1px solid rgba(255,255,255,0.03) !important; text-align: center !important;">
            ${botonAccion}
          </td>
        </tr>
      `;
    });
  }

  html += `</tbody></table>`;
  container.innerHTML = html;
};

// 🚀 MARCAR LISTO EN NEYOP VÍA APPS SCRIPT
window.marcarListoNeyop = function (filaIndex, btnElement) {
  if (typeof haptic === "function") haptic();

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> ...`;
  btnElement.disabled = true;

  const cbName = "cb_listo_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      if (typeof triggerToast === "function")
        triggerToast(
          `<div style="color:var(--ios-green);">✅ Fila completada y pintada.</div>`,
        );
      cargarNeyop(true);
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de red"));
      btnElement.innerHTML = originalHTML;
      btnElement.disabled = false;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=marcarNeyopListo&filaIndex=${filaIndex}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// 🚀 ACCIONES GLOBALES: PINES Y RECARGAS
window.ejecutarFlujoPinesSuspendidas = function (btnElement) {
  if (typeof haptic === "function") haptic();

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Procesando...`;
  btnElement.disabled = true;

  const cbName = "cb_pines_flujo_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    btnElement.innerHTML = originalHTML;
    btnElement.disabled = false;

    if (res && res.status === "success") {
      if (typeof triggerToast === "function")
        triggerToast(
          `<div style="color:var(--ios-green);">✅ ${res.message}</div>`,
        );
      cargarSuspendidas(true);
    } else {
      alert(
        "❌ Error procesando pines: " +
          (res ? res.message : "Fallo de conexión"),
      );
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=procesarPinesSuspendidas&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.ejecutarTransferirRecarga = function (btnElement) {
  if (typeof haptic === "function") haptic();

  if (
    !confirm(
      "¿Transferir a NEYOP las recargas PENDIENTES marcadas con '1'? (Se autogenerarán Yopmails si faltan espacios vacíos)",
    )
  )
    return;

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Transfiriendo...`;
  btnElement.disabled = true;

  const cbName = "cb_transfer_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    btnElement.innerHTML = originalHTML;
    btnElement.disabled = false;

    if (res && res.status === "success") {
      if (typeof triggerToast === "function")
        triggerToast(
          `<div style="color:var(--ios-green);">✅ ${res.message}</div>`,
        );
      cargarNeyop(true);
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de conexión"));
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=transferirRecargasANeyop&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.activarMultiplesCuentasSuspendidas = function (indices, btnElement) {
  if (typeof haptic === "function") haptic();

  const count = indices.split(",").length;
  if (
    !confirm(
      `¿Estás seguro de activar las ${count} cuentas mostradas al mismo tiempo?`,
    )
  )
    return;

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Calculando...`;
  btnElement.disabled = true;

  const cbName = "cb_act_multi_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      if (typeof triggerToast === "function")
        triggerToast(
          `<div style="color:var(--ios-green);">✅ ${res.message}</div>`,
        );
      cargarSuspendidas(true);
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de red"));
      btnElement.innerHTML = originalHTML;
      btnElement.disabled = false;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=activarMultiplesPinesMes&filas=${indices}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.activarCuentaSuspendida = function (filaIndex, btnElement) {
  if (typeof haptic === "function") haptic();

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Calculando...`;
  btnElement.disabled = true;

  const cbName = "cb_activacion_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      if (typeof triggerToast === "function")
        triggerToast(
          `<div style="color:var(--ios-green);">✅ Cuenta activada.</div>`,
        );
      cargarSuspendidas(true);
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de red"));
      btnElement.innerHTML = originalHTML;
      btnElement.disabled = false;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=activarCuentaPinesMes&filaIndex=${filaIndex}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.extraerPinIndividual = function (correo, btnElement) {
  if (typeof haptic === "function") haptic();

  const userActivo =
    sessionStorage.getItem("active_staff") ||
    localStorage.getItem("cyber_saved_staff") ||
    "Desconocido";

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Buscando...`;
  btnElement.disabled = true;

  const cbName = "cb_pin_ind_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"></path></svg> <span>PIN asignado por ${userActivo}</span></div>`,
        );
      }
      window.cargarSuspendidas(true);
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de conexión."));
      btnElement.innerHTML = originalHTML;
      btnElement.disabled = false;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=procesarPinIndividualSuspendidas&correo=${encodeURIComponent(correo)}&user=${encodeURIComponent(userActivo)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

/* ==========================================================================
   📋 MOTOR DE COPIADO UNIVERSAL (FUNCIONA EN HTTP, HTTPS, IP LOCAL Y LOCALHOST)
   ========================================================================== */

window.copiarDatoCargaIndividual = function (btn, textoEsc) {
  if (typeof haptic === "function") haptic();

  // 1. Decodificación ultra-segura (evita que la función muera por caracteres especiales)
  let texto = "";
  try {
    texto = decodeURIComponent(textoEsc);
  } catch (e) {
    texto = textoEsc; // Si no venía codificado, usa el texto directo
  }

  if (!texto || texto === "-") return;

  // 2. Animación visual de éxito
  const animarExito = () => {
    const origHtml = btn.innerHTML;
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#30d158" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    btn.style.setProperty("background", "rgba(48, 209, 88, 0.15)", "important");

    if (typeof triggerToast === "function") {
      triggerToast("📋 Copiado al portapapeles");
    }

    setTimeout(() => {
      btn.innerHTML = origHtml;
      btn.style.background = "transparent";
    }, 1200);
  };

  // 3. Intento 1: API Moderna (Solo funciona en HTTPS / Localhost)
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(texto)
      .then(animarExito)
      .catch(() => copiarFallback(texto, animarExito));
  } else {
    // 4. Intento 2: Fallback Clásico e Infalible (Para HTTP, IP Local o XAMPP)
    copiarFallback(texto, animarExito);
  }
};

// Alias compatible para la Lupa
window.copiarDatoAisladoLupa = function (btn, textoEsc) {
  window.copiarDatoCargaIndividual(btn, textoEsc);
};

// Método alternativo a prueba de fallos mediante elemento auxiliar invisible
function copiarFallback(texto, callbackExito) {
  const textarea = document.createElement("textarea");
  textarea.value = texto;
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  textarea.setAttribute("readonly", "");
  document.body.appendChild(textarea);

  textarea.focus();
  textarea.select();

  try {
    const exitoso = document.execCommand("copy");
    if (exitoso && callbackExito) {
      callbackExito();
    }
  } catch (err) {
    console.error("Error en copiado fallback: ", err);
    alert("No se pudo copiar automáticamente. Copia manualmente: " + texto);
  }

  document.body.removeChild(textarea);
}

/* ==========================================================================
   ⏱️ CONTROL Y REGISTRO DE TURNOS DE ASISTENTES EN MYSQL
   ========================================================================== */

function startShiftTimer() {
  const activeUser = sessionStorage.getItem("active_staff");
  if (!activeUser) return;

  // Registrar o recuperar turno activo desde MySQL al iniciar
  const formData = new FormData();
  formData.append("accion", "iniciar_turno");
  formData.append("vendedor", activeUser);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      if (res && res.status === "success") {
        let segsPrevios = res.segundos_transcurridos || 0;
        sessionStorage.setItem(
          "cyber_shift_start_time",
          Date.now() - segsPrevios * 1000,
        );
        sessionStorage.setItem("cyber_last_sync_time", Date.now());
      }
    })
    .catch((err) => console.error("Error al iniciar turno en MySQL:", err));

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(function () {
    if (isTimerPaused) return;

    let startTime =
      parseInt(sessionStorage.getItem("cyber_shift_start_time")) || Date.now();
    let totalMs = Date.now() - startTime;

    let totalSeconds = Math.floor(totalMs / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    let hStr = String(hours).padStart(2, "0");
    let mStr = String(minutes).padStart(2, "0");
    let sStr = String(seconds).padStart(2, "0");
    let tiempoTexto = `${hStr}:${mStr}:${sStr}`;

    let stElement = document.getElementById("shiftTimer");
    if (stElement) stElement.innerText = tiempoTexto;

    // Enviar pulso de guardado a MySQL cada 5 minutos
    let lastSync =
      parseInt(sessionStorage.getItem("cyber_last_sync_time"), 10) ||
      Date.now();
    if (Date.now() - lastSync >= 300000) {
      ejecutarAutoPulsoTiempo(tiempoTexto);
    }
  }, 1000);
}

function ejecutarAutoPulsoTiempo(tiempoTexto) {
  const activeUser = sessionStorage.getItem("active_staff");
  if (!activeUser) return;

  sessionStorage.setItem("cyber_last_sync_time", Date.now());

  const formData = new FormData();
  formData.append("accion", "pulso_turno");
  formData.append("vendedor", activeUser);
  formData.append("tiempo_trabajado", tiempoTexto || "00:00:00");

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      console.log("✅ Tiempo del asistente actualizado en MySQL:", tiempoTexto);
    })
    .catch((err) => console.error("Error al enviar pulso a MySQL:", err));
}

function cerrarSesionStaff() {
  if (typeof haptic === "function") haptic();
  let usuarioActivo = sessionStorage.getItem("active_staff") || "STAFF";

  if (usuarioActivo.toUpperCase().trim() === "CAMILO") {
    sessionStorage.clear();
    localStorage.removeItem("cyber_saved_staff");
    location.reload();
    return;
  }

  if (
    confirm(
      "¿Estás seguro de que deseas cerrar tu sesión y finalizar tu turno de hoy?",
    )
  ) {
    let timerEl = document.getElementById("shiftTimer");
    let tiempoFinal = timerEl ? timerEl.innerText : "00:00:00";

    const formData = new FormData();
    formData.append("accion", "cerrar_turno");
    formData.append("vendedor", usuarioActivo);
    formData.append("tiempo_trabajado", tiempoFinal);

    fetch("https://api.cybernetsp.com/acciones_mysql.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then(() => {
        sessionStorage.clear();
        localStorage.removeItem("cyber_saved_staff");
        location.reload();
      })
      .catch(() => {
        sessionStorage.clear();
        localStorage.removeItem("cyber_saved_staff");
        location.reload();
      });
  }
}
