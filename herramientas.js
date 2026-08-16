/* ==========================================================================
   🛠️ CYBERNET OS - HERRAMIENTAS Y UTILIDADES (herramientas.js)
   ========================================================================== */

/* ==========================================================================
   📡 WIDGET FLOTANTE IZQUIERDO: PAGOS BRE-B GMAIL (10S AUTO-HIDE & ANTI-OBSTRUCCIÓN)
   ========================================================================== */
let autoHideTimer = null;
let cantidadPagosAnterior = 0;
const URL_APPS_SCRIPT_BREB =
  "https://script.google.com/macros/s/AKfycbxqKpMcC5BI0H6PHnImu5Lkw3ryiuFO0fW0KJAhQ_45kzglYn9CpN1O2fCjezXM5oMi/exec";

// 🔍 DETECTOR DE VENTANAS Y OVERLAYS ABIERTOS EN PANTALLA
function hayModalAbierto() {
  const modales = document.querySelectorAll(
    '[id*="Overlay"], [class*="overlay"], [id*="modal"], [id*="Modal"], .card-ios-modal, .boveda-modal',
  );

  for (let el of modales) {
    if (el.id === "breb-widget" || el.id === "btn-expand-breb") continue;

    const style = window.getComputedStyle(el);
    const esVisible =
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0" &&
      el.offsetWidth > 0 &&
      el.offsetHeight > 0;

    const tieneClaseOpen =
      el.classList.contains("open") ||
      el.classList.contains("active") ||
      el.classList.contains("show");

    if (esVisible || tieneClaseOpen) {
      return true;
    }
  }
  return false;
}

// 1. AUTO-INYECCIÓN DE PESTAÑA CON FLECHA Y PANEL IZQUIERDO
function inyectarEstructuraBreB() {
  if (!document.body) {
    setTimeout(inyectarEstructuraBreB, 50);
    return;
  }

  if (document.getElementById("breb-widget")) return;

  // Inyectar Estilos CSS con máxima prioridad
  const style = document.createElement("style");
  style.id = "breb-dynamic-css";
  style.innerHTML = `
    #btn-expand-breb {
      position: fixed !important;
      top: 180px !important;
      left: 0 !important;
      z-index: 99998 !important;
      background: rgba(20, 20, 25, 0.94) !important;
      backdrop-filter: blur(16px) !important;
      border: 1px solid rgba(48, 209, 88, 0.4) !important;
      border-left: none !important;
      border-radius: 0 14px 14px 0 !important;
      padding: 12px 10px !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      box-shadow: 6px 8px 24px rgba(0, 0, 0, 0.6) !important;
      transition: all 0.3s ease !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    }
    #btn-expand-breb:hover {
      background: rgba(30, 30, 38, 0.98) !important;
      border-color: #30d158 !important;
      box-shadow: 8px 10px 28px rgba(48, 209, 88, 0.35) !important;
    }
    .breb-icon-arrow {
      width: 16px;
      height: 16px;
      stroke: #30d158;
      transition: transform 0.3s ease;
    }
    .breb-badge-txt {
      font-size: 0.75rem !important;
      font-weight: 900 !important;
      letter-spacing: 1.2px !important;
      color: #ffffff !important;
      text-transform: uppercase !important;
    }
    #breb-widget {
      position: fixed !important;
      top: 100px !important;
      left: 0 !important;
      z-index: 99999 !important;
      width: 340px !important;
      height: 520px !important;
      background: rgba(18, 18, 22, 0.95) !important;
      backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(48, 209, 88, 0.35) !important;
      border-left: none !important;
      border-radius: 0 20px 20px 0 !important;
      box-shadow: 12px 12px 35px rgba(0, 0, 0, 0.7) !important;
      display: none;
      flex-direction: column !important;
      transform: translateX(-360px);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease !important;
      overflow: hidden !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    }
    .spin-breb-anim {
      animation: spinBreB 0.8s linear infinite !important;
    }
    @keyframes spinBreB {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // Inyectar Botón Pestaña Izquierda (Con Flecha + Anuncio BRE-B)
  const btn = document.createElement("div");
  btn.id = "btn-expand-breb";
  btn.title = "Clic para abrir Pagos BRE-B";
  btn.onclick = window.mostrarWidgetBreB;
  btn.innerHTML = `
    <svg class="breb-icon-arrow" viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
    <span class="breb-badge-txt">PAGOS BRE-B</span>
  `;
  document.body.appendChild(btn);

  // Inyectar Panel Flotante
  const widget = document.createElement("div");
  widget.id = "breb-widget";
  widget.innerHTML = `
    <div style="padding: 14px 16px; background: rgba(255, 255, 255, 0.03); border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.88rem; color: #ffffff;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: #30d158; box-shadow: 0 0 8px #30d158;"></span>
        PAGOS BRE-B
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <button onclick="window.forzarActualizacionBreB()" style="background: none; border: none; color: #0a84ff; cursor: pointer; padding: 4px; display:flex; align-items:center;" title="Refrescar">
          <svg id="icon-refresh-breb" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
        </button>
        <button onclick="window.ocultarWidgetBreB()" style="background: none; border: none; color: #a1a1aa; cursor: pointer; font-size: 1.1rem; font-weight: bold; line-height: 1;" title="Ocultar">✕</button>
      </div>
    </div>
    <div style="padding: 10px 14px; display: flex; gap: 8px; background: rgba(0, 0, 0, 0.2); border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
      <input type="date" id="breb-fecha" onchange="window.alCambiarFechaBreB()" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 8px; padding: 6px 8px; font-size: 0.75rem; width: 120px; outline: none;">
      <input type="text" id="breb-buscador" placeholder="Buscar cliente..." onkeyup="window.filtrarPagosEnVivo()" style="flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 8px; padding: 6px 10px; font-size: 0.75rem; outline: none;">
    </div>
    <div id="breb-lista" style="flex: 1; padding: 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;"></div>
  `;
  document.body.appendChild(widget);

  // Iniciar Observador de Modales para ocultar automáticamente al abrir otras ventanas
  iniciarObservadorModales();
}

// 🚪 MOSTRAR / DESLIZAR WIDGET Y PROGRAMAR OCULTADO DE 10S
window.mostrarWidgetBreB = function () {
  if (typeof haptic === "function") haptic();

  if (hayModalAbierto()) return; // Si hay modal abierto, no interrumpe

  const btnExpand = document.getElementById("btn-expand-breb");
  const widget = document.getElementById("breb-widget");

  if (btnExpand) btnExpand.style.display = "none";
  if (widget) {
    widget.style.display = "flex";
    void widget.offsetWidth;
    widget.style.transform = "translateX(0)";
  }

  window.establecerFechaHoy();
  window.cargarPagosBreB();
  window.iniciarAutoOcultado(); // ⏱️ Inicia temporizador de 10 segundos
};

// 🚪 OCULTAR Y COLAPSAR WIDGET DE PAGOS BRE-B
window.ocultarWidgetBreB = function () {
  const widget = document.getElementById("breb-widget");
  const btnExpand = document.getElementById("btn-expand-breb");

  if (widget) widget.style.transform = "translateX(-360px)";

  setTimeout(() => {
    if (widget) widget.style.display = "none";
    if (btnExpand && !hayModalAbierto()) btnExpand.style.display = "flex";
  }, 320);

  if (autoHideTimer) {
    clearTimeout(autoHideTimer);
    autoHideTimer = null;
  }
};

// ⏱️ TEMPORIZADOR DE AUTO-OCULTADO EXACTO DE 10 SEGUNDOS
window.iniciarAutoOcultado = function () {
  if (autoHideTimer) clearTimeout(autoHideTimer);
  autoHideTimer = setTimeout(() => {
    window.ocultarWidgetBreB();
  }, 10000); // 10 Segundos
};

// 🔄 REFRESCAR Y REINICIAR TEMPORIZADOR
window.forzarActualizacionBreB = function () {
  if (typeof haptic === "function") haptic();
  const icono = document.getElementById("icon-refresh-breb");
  if (icono) icono.classList.add("spin-breb-anim");

  window.cargarPagosBreB();
  window.iniciarAutoOcultado();
};

// 🔍 FILTRADO EN TIEMPO REAL
window.filtrarPagosEnVivo = function () {
  const buscador = document.getElementById("breb-buscador");
  const texto = buscador ? buscador.value.toLowerCase().trim() : "";
  const tarjetas = document.querySelectorAll("#breb-lista .breb-card");

  tarjetas.forEach((tarjeta) => {
    const contenido = tarjeta.innerText.toLowerCase();
    tarjeta.style.display = contenido.includes(texto) ? "flex" : "none";
  });

  window.iniciarAutoOcultado(); // Reinicia los 10 segundos al interactuar
};

// 📅 CAMBIO DE FECHA
window.alCambiarFechaBreB = function () {
  window.cargarPagosBreB();
  window.iniciarAutoOcultado();
};

// 📅 AUTOFILLED FECHA HOY
window.establecerFechaHoy = function () {
  const inputFecha = document.getElementById("breb-fecha");
  if (inputFecha && !inputFecha.value) {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    inputFecha.value = `${yyyy}-${mm}-${dd}`;
  }
};

// 📥 CONSULTA EN TIEMPO REAL A GOOGLE APPS SCRIPT (GMAIL BRE-B)
window.cargarPagosBreB = function () {
  const contenedor = document.getElementById("breb-lista");
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div style="color: #0a84ff; width: 100%; text-align: center; font-size: 13px; font-weight: 700; padding: 40px 0; display: flex; flex-direction: column; align-items: center; gap: 10px;">
      <svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
      <span>Buscando en Gmail Bre-B...</span>
    </div>`;

  const inputFecha = document.getElementById("breb-fecha");
  const fechaVal = inputFecha ? inputFecha.value : "";
  const callbackName = "cb_breb_" + Date.now();

  window[callbackName] = function (res) {
    delete window[callbackName];
    const scriptElem = document.getElementById(callbackName);
    if (scriptElem) scriptElem.remove();

    const icono = document.getElementById("icon-refresh-breb");
    if (icono) icono.classList.remove("spin-breb-anim");

    if (res && res.status === "success" && res.data && res.data.length > 0) {
      if (
        cantidadPagosAnterior > 0 &&
        res.data.length > cantidadPagosAnterior
      ) {
        if (typeof CyberSonidos !== "undefined") CyberSonidos.play("dinero");
      }
      cantidadPagosAnterior = res.data.length;

      let htmlCards = "";
      res.data.forEach((pago) => {
        const nombreCliente = pago.remitente
          ? pago.remitente.toUpperCase()
          : "CLIENTE DESCONOCIDO";
        const valorMonto = pago.monto || "0";
        const horaEnvio = pago.hora || "";
        const fechaEnvio = pago.fecha || "";

        htmlCards += `
          <div class="breb-card" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 12px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; transition: all 0.2s ease;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #30d158; font-weight: 900; font-size: 1.05rem; font-family: monospace;">+$${valorMonto}</span>
              <span style="color: rgba(255,255,255,0.7); font-size: 0.72rem; font-family: monospace; background: rgba(0,0,0,0.35); padding: 2px 7px; border-radius: 6px;">${horaEnvio}</span>
            </div>
            <div style="color: #ffffff; font-size: 0.83rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-transform: uppercase;">
              👤 ${nombreCliente}
            </div>
            <div style="color: rgba(255,255,255,0.4); font-size: 0.7rem;">
              📅 ${fechaEnvio}
            </div>
          </div>
        `;
      });

      contenedor.innerHTML = htmlCards;
    } else {
      contenedor.innerHTML = `<div style="color: rgba(255,255,255,0.5); width: 100%; text-align: center; font-size: 0.8rem; font-weight: 600; padding: 35px 0;">📭 No hay pagos de Bre-B en Gmail hoy.</div>`;
    }
  };

  const script = document.createElement("script");
  script.id = callbackName;
  script.src = `${URL_APPS_SCRIPT_BREB}?action=obtenerPagosBreB&fechaBusqueda=${encodeURIComponent(fechaVal)}&callback=${callbackName}`;
  script.onerror = function () {
    delete window[callbackName];
    const icono = document.getElementById("icon-refresh-breb");
    if (icono) icono.classList.remove("spin-breb-anim");
    contenedor.innerHTML = `<div style="color: #ff453a; width: 100%; text-align: center; font-size: 0.8rem; font-weight: 700; padding: 20px 0;">❌ Error al conectar con Google Script.</div>`;
  };

  document.body.appendChild(script);
};

// 🛡️ OBSERVADOR PARA OCULTAR EL WIDGET O PESTAÑA CUANDO SE ABRE OTRA VENTANA
function iniciarObservadorModales() {
  const observer = new MutationObserver(() => {
    const btnExpand = document.getElementById("btn-expand-breb");

    if (hayModalAbierto()) {
      // Ocultar de inmediato el panel y el botón para no obstruir la ventana abierta
      window.ocultarWidgetBreB();
      if (btnExpand) btnExpand.style.display = "none";
    } else {
      // Si se cerró la ventana, restaurar el botón flotante en la izquierda
      const widget = document.getElementById("breb-widget");
      const estaWidgetAbierto = widget && widget.style.display === "flex";
      if (btnExpand && !estaWidgetAbierto) {
        btnExpand.style.display = "flex";
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style"],
  });
}

// Inicializador DOM
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  inyectarEstructuraBreB();
} else {
  document.addEventListener("DOMContentLoaded", inyectarEstructuraBreB);
}

/* ==========================================================================
   📋 PLANTILLAS DESDE MYSQL Y MOTORES DE COPIADO
   ========================================================================== */
window.currentGridStock = [];

window.cargarPlantillasDesdeSheets = function () {
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
          let textoPagosSeguro = encodeURIComponent(
            plantillaPagos.texto || "",
          ).replace(/'/g, "%27");
          let btnNequiHtml = "";

          if (plantillaNequi) {
            let textoNequiSeguro = encodeURIComponent(
              plantillaNequi.texto || "",
            ).replace(/'/g, "%27");
            btnNequiHtml = `
              <button class="btn-ios w-100" style="padding: 14px !important; font-size: 0.85rem !important; font-weight: 800 !important; border-radius: 12px !important; background: rgba(255, 255, 255, 0.08) !important; color: var(--text-primary) !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; transition: all 0.2s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important; cursor: pointer;" onclick="window.copiarPlantillaGlobal(this, '${textoNequiSeguro}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> COPIAR NEQUI
              </button>`;
          }

          headerContainer.innerHTML = `
            <div class="card-ios w-100" style="max-width: 440px; align-items: center; gap: 12px; padding: 20px;">
              <img src="${plantillaPagos.imagenUrl}" alt="QR" onclick="window.copiarImagenQRPagos(this, '${plantillaPagos.imagenUrl}')" style="max-width:210px; width:100%; border-radius:16px; border: 2px solid transparent; box-shadow:var(--glass-shadow); padding:5px; background:white; margin:0 auto; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" title="Haz clic para copiar la imagen del QR">
              <span class="text-secondary text-center" style="font-size:0.75rem; font-weight:500; margin-top: -4px;">(Haz clic sobre el QR para copiar la imagen)</span>
              <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 4px;">
                <button class="btn-ios w-100" style="padding: 14px !important; font-size: 0.85rem !important; font-weight: 800 !important; border-radius: 12px !important; background: rgba(255, 255, 255, 0.08) !important; color: var(--text-primary) !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; transition: all 0.2s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important; cursor: pointer;" onclick="window.copiarPlantillaGlobal(this, '${textoPagosSeguro}')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> COPIAR PAGOS (BRE-B)
                </button>
                ${btnNequiHtml}
              </div>
            </div>`;
        }
        window.renderGrid("");
      } else {
        if (container)
          container.innerHTML =
            '<div class="empty-log-msg" style="color:var(--ios-red); grid-column: 1 / -1; width: 100%; text-align: center; margin-top: 40px;">❌ Error al descargar plantillas desde MySQL.</div>';
      }
    })
    .catch((err) => {
      if (container)
        container.innerHTML =
          '<div class="empty-log-msg" style="color:var(--ios-red); grid-column: 1 / -1; width: 100%; text-align: center; margin-top: 40px;">❌ Error al conectar con el servidor PHP.</div>';
      console.error(err);
    });
};

window.renderGrid = function (filtro = "") {
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
};

window.filtrarTarjetasMac = function () {
  const input = document.getElementById("macSearchCards");
  const filtro = input ? input.value.trim() : "";
  window.renderGrid(filtro);
};

window.copiarPlantillaGlobal = function (btn, textoCodificado) {
  if (typeof haptic === "function") haptic();
  const textoReal = decodeURIComponent(textoCodificado);
  window.copiarPlantillaDirecta(btn, textoReal);
};

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

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(textoReal)
      .then(animarExito)
      .catch(() => usarFallbackCopiado(textoReal, animarExito));
  } else {
    usarFallbackCopiado(textoReal, animarExito);
  }
};

function usarFallbackCopiado(textoReal, animarExito) {
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
    alert("Tu navegador bloqueó la copia automática.");
  }
  document.body.removeChild(textarea);
}

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

            if (typeof triggerToast === "function")
              triggerToast(
                `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>¡Imagen copiada! (Ctrl + V para pegar)</span></div>`,
              );
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
    "Tu navegador bloqueó la copia automática de imágenes. Usa clic derecho -> 'Copiar imagen'.",
  );
}

/* ==========================================================================
   📩 BANDEJA DE CÓDIGOS DE ACCESO (MYSQL / GMAIL)
   ========================================================================== */
const oldToggleCodesPanel = window.toggleCodesPanel;
window.toggleCodesPanel = function () {
  if (oldToggleCodesPanel) oldToggleCodesPanel();
  const overlay = document.getElementById("codesOverlay");
  if (overlay && overlay.classList.contains("open")) {
    window.cargarBandejaCodigosMySQL();
  }
};

window.cargarBandejaCodigosMySQL = function () {
  const contenedor = document.getElementById("codesScrollArea");
  if (!contenedor) return;

  contenedor.innerHTML =
    '<div style="text-align: center; color: var(--ios-orange); padding: 40px;"><svg class="spin-anim" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:12px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg><br><span style="font-weight: 600;">Sincronizando bandeja...</span></div>';

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
                  <span style="font-size: 0.78rem; color: var(--text-secondary); min-width: 105px; flex-shrink: 0; text-transform: uppercase; font-weight: 600;">CLIENTE:</span>
                  <span style="font-size: 0.88rem; color: var(--text-primary); font-weight: 600; font-family: monospace;">${item.correo}</span>
                </div>
                <div style="display: flex; align-items: baseline; gap: 8px;">
                  <span style="font-size: 0.78rem; color: var(--text-secondary); min-width: 105px; flex-shrink: 0; text-transform: uppercase; font-weight: 600;">ACCIÓN:</span>
                  <span style="font-size: 0.85rem; color: var(--text-primary); font-weight: 500;">${item.accion}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                  <span style="font-size: 0.78rem; color: var(--text-secondary); min-width: 105px; flex-shrink: 0; text-transform: uppercase; font-weight: 600;">CÓDIGO:</span>
                  <span style="font-size: 1.15rem; color: ${item.colorText}; font-weight: 800; font-family: monospace; background: rgba(255, 255, 255, 0.03); padding: 4px 14px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.06); letter-spacing: 1px;">${item.codigoLink}</span>
                </div>
              </div>
              <button class="btn-ios w-100" onclick="window.copiarPlantillaGlobal(this, '${safeCopiedText}')" style="padding: 12px; background: rgba(255,255,255,0.05); font-weight: 800; font-size: 0.85rem; border-radius: 12px; cursor: pointer; color: var(--text-primary); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s ease;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> COPIAR MENSAJE
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
        '<div style="text-align: center; color: var(--ios-red); padding: 20px; font-weight: bold;">❌ Error de conexión con PHP (obtener_codigos.php).</div>';
      console.error(err);
    });
};

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
   👁️ BÓVEDAS (ANA Y CHAYO) E IFRAMES
   ========================================================================== */
const oldToggleAnaCodesPanel = window.toggleAnaCodesPanel;
window.toggleAnaCodesPanel = function () {
  if (oldToggleAnaCodesPanel) oldToggleAnaCodesPanel();
  const iframe = document.getElementById("iframeAnaCodes");
  const overlay = document.getElementById("anaCodesOverlay");
  if (
    overlay &&
    overlay.classList.contains("open") &&
    iframe &&
    (iframe.src === "about:blank" || iframe.src === "")
  ) {
    iframe.src = "https://correos.tkdjgz.com/";
  }
};

let cronometroChayo = null;
const oldToggleChayoPanel = window.toggleChayoPanel;

window.toggleChayoPanel = function () {
  if (oldToggleChayoPanel) oldToggleChayoPanel();
  const overlay = document.getElementById("chayoOverlay");
  const iframe = document.getElementById("iframeChayo");
  const barra = document.getElementById("barraCredencialesChayo");
  const botonVer = document.getElementById("btnVerDatosChayo");

  if (!overlay) return;

  if (!overlay.classList.contains("open")) {
    if (cronometroChayo) clearInterval(cronometroChayo);
    if (barra) barra.style.setProperty("display", "none", "important");
    if (botonVer) {
      botonVer.disabled = false;
      botonVer.style.opacity = "1";
      botonVer.innerText = "Ver datos de ingresos";
    }
  } else {
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
          if (typeof triggerToast === "function")
            triggerToast("🔓 Acceso completado. Maximizando visualización.");
        }
      }, 3000);
    }
  });
};

/* ==========================================================================
   🟡 YOPMAIL
   ========================================================================== */
window.abrirVentanaYopmail = function () {
  if (typeof haptic === "function") haptic();
  const input = document.getElementById("inputYopmailCorreos");
  if (!input || !input.value.trim()) {
    if (typeof triggerToast === "function")
      triggerToast("⚠️ Ingresa un correo de Yopmail.");
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
   🔴 GMAIL GLOBAL
   ========================================================================== */
window.correosGlobalesData = [];

const oldToggleGmailPanel = window.toggleGmailPanel;
window.toggleGmailPanel = function () {
  if (oldToggleGmailPanel) oldToggleGmailPanel();
  const overlay = document.getElementById("gmailOverlay");
  if (overlay && overlay.classList.contains("open")) {
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
          if (container)
            container.innerHTML =
              '<div style="text-align:center; padding:60px 20px; color:var(--ios-orange); font-weight:bold; font-size:1rem;">📭 No se encontraron correos nuevos para este destinatario.</div>';
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
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(234, 67, 53, 0.1)'" onmouseout="this.style.background='transparent'" onclick="window.abrirLectorCorreoGlobal(${i})">
               <td style="padding: 16px 12px; width: 35%; vertical-align: middle;">
                  <div style="color: var(--text-primary); font-weight: 800; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">${remitenteLimpio}</div>
                  <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">Para: <span style="color: var(--ios-blue); font-family: monospace; font-weight: 600;">${destinatarioLimpio}</span></div>
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
        if (container)
          container.innerHTML = `<div style="color:var(--ios-red); text-align:center; padding:40px; font-weight:700;">Error: ${res ? res.message : "Fallo de comunicación con Google"}</div>`;
      }
    })
    .catch((err) => {
      console.error(err);
      if (container)
        container.innerHTML = `<div style="color:var(--ios-red); text-align:center; padding:40px; font-weight:700;">❌ Error al consultar obtener_correos_gmail.php</div>`;
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
   🔔 RECORDATORIOS DE WHATSAPP (BLOQUES W1 Y W2)
   ========================================================================== */
const oldToggleRecordatoriosPanel = window.toggleRecordatoriosPanel;
window.toggleRecordatoriosPanel = function () {
  if (oldToggleRecordatoriosPanel) oldToggleRecordatoriosPanel();
  const overlay = document.getElementById("recordatoriosOverlay");
  if (overlay && overlay.classList.contains("open")) {
    window.sincronizarW1();
    window.sincronizarW2();
  }
};

window.sincronizarW1 = function () {
  const periodo = document.getElementById("periodoW1").value;
  window.ejecutarConsultaRecordatorios(
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
  window.ejecutarConsultaRecordatorios(
    periodo,
    "contadorW2",
    "bloquesW2",
    "listaIndividualW2",
    "green",
    "W2",
  );
};

window.ejecutarConsultaRecordatorios = function (
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
          if (elBloques)
            elBloques.innerHTML = `<div style="text-align: center; padding: 12px; color: var(--text-secondary); font-size: 0.8rem; grid-column: span 2; background: rgba(0, 0, 0, 0.2); border-radius: 12px;">Sin bloques para este periodo.</div>`;
          if (elLista) {
            elLista.style.cssText = "display: block; width: 100%;";
            elLista.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-secondary); font-size: 0.85rem; background: rgba(0, 0, 0, 0.2); border-radius: 16px;">Cero clientes detectados.</div>`;
          }
          return;
        }

        if (elBloques) {
          let htmlBloques = "";
          const tamanoBloque = 20;
          const numBloques = Math.ceil(data.length / tamanoBloque);

          for (let b = 0; b < numBloques; b++) {
            const inicio = b * tamanoBloque;
            const fin = Math.min(inicio + tamanoBloque, data.length);
            const subData = data.slice(inicio, fin);

            const numerosEnumerados = subData
              .map((item, idx) => {
                let num = (item.tel || item.telefono || "").replace(/\D/g, "");
                if (num.length === 10) num = "57" + num;
                return `${idx + 1}. wa.me/${num}`;
              })
              .join("\n");

            const jsonSubEscapado = encodeURIComponent(numerosEnumerados);

            htmlBloques += `
              <button class="btn-ios" style="padding: 10px 12px; font-weight: 800; font-size: 0.8rem; border-radius: 12px; background: rgba(255,255,255,0.06); color: #ffffff; border: 1px solid rgba(255,255,255,0.12); cursor: pointer; text-align: center; transition: all 0.25s ease; display: flex; align-items: center; justify-content: center; gap: 6px;" onclick="window.copiarBloqueNumerosWA(this, '${jsonSubEscapado}')">
                📋 Bloque (${inicio + 1}-${fin})
              </button>
            `;
          }
          elBloques.style.cssText =
            "display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; width: 100%;";
          elBloques.innerHTML = htmlBloques;
        }

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
                  <span style="background: rgba(255, 255, 255, 0.08); color: var(--text-secondary); width: 24px; height: 24px; border-radius: 50%; font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">${idx + 1}</span>
                  <span class="num-text-item" style="color: #ffffff; font-weight: 800; font-family: monospace; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${numTel}">${numTel || "Sin Teléfono"}</span>
                </div>
                <button onclick="window.copiarMensajeYMarcarTachado(this, '${msjSeguro}')" title="Copiar mensaje del cliente" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.12); color: #ffffff; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s ease;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
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
};

window.copiarBloqueNumerosWA = function (btn, textoEscapado) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(textoEscapado);

  navigator.clipboard.writeText(texto).then(() => {
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
