/* ==========================================================================
   🚨 CYBERNET OS - WIDGETS FLOTANTES INDEPENDIENTES (widgets_alertas.js)
   ========================================================================== */

(function () {
  "use strict";

  // 1. CONSULTA DE ALERTAS DESDE MYSQL
  window.cargarWidgetsAlertasTopRight = function () {
    const formData = new FormData();
    formData.append("accion", "obtener_widgets_alertas");

    fetch("https://api.cybernetsp.com/acciones_mysql.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res && res.status === "success") {
          renderizarWidgetsTopRight(res.alertasStock, res.garantias);
        }
      })
      .catch((err) =>
        console.error("❌ Error al cargar widgets de alerta:", err),
      );
  };

  // 2. RENDERIZADO EN PANTALLA (TOP-RIGHT)
  function renderizarWidgetsTopRight(alertasStock, garantias) {
    let container = document.getElementById("widgetsTopRightFloatingContainer");

    if (!container) {
      container = document.createElement("div");
      container.id = "widgetsTopRightFloatingContainer";
      container.style.cssText = `
        position: fixed;
        top: 18px;
        right: 20px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 300px;
        width: 100%;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    container.style.pointerEvents = "auto";
    let html = "";

    // 🟠 WIDGET 1: STOCK CRÍTICO
    if (alertasStock && alertasStock.length > 0) {
      html += `
        <div style="background: rgba(20, 20, 25, 0.88); backdrop-filter: blur(16px); border: 1px solid rgba(255, 159, 10, 0.35); border-radius: 14px; padding: 12px 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.6); font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:6px;">
            <span style="font-size:0.75rem; font-weight:800; color:#ff9f0a; display:flex; align-items:center; gap:6px; letter-spacing:0.5px;">
              <span style="width:7px; height:7px; border-radius:50%; background:#ff9f0a; display:inline-block; box-shadow:0 0 8px #ff9f0a;"></span>
              STOCK CRÍTICO
            </span>
            <span style="font-size:0.68rem; color:rgba(255,255,255,0.5); font-weight:700;">${alertasStock.length} ALERTA(S)</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px; max-height:160px; overflow-y:auto;">`;

      alertasStock.forEach((item) => {
        html += `
          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,159,10,0.08); border:1px solid rgba(255,159,10,0.18); border-radius:8px; padding:5px 9px;">
            <span style="font-size:0.78rem; font-weight:700; color:#ffffff;">${item.plataforma}</span>
            <span style="font-size:0.72rem; font-weight:900; color:#ff9f0a; font-family:monospace; background:rgba(255,159,10,0.2); padding:2px 7px; border-radius:6px;">
              ${item.libres} libre${item.libres === 1 ? "" : "s"}
            </span>
          </div>`;
      });

      html += `</div></div>`;
    }

    // 🔴 WIDGET 2: GARANTÍAS ACTIVAS
    if (garantias && garantias.length > 0) {
      html += `
        <div style="background: rgba(20, 20, 25, 0.88); backdrop-filter: blur(16px); border: 1px solid rgba(255, 69, 58, 0.35); border-radius: 14px; padding: 12px 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.6); font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:6px;">
            <span style="font-size:0.75rem; font-weight:800; color:#ff453a; display:flex; align-items:center; gap:6px; letter-spacing:0.5px;">
              <span style="width:7px; height:7px; border-radius:50%; background:#ff453a; display:inline-block; box-shadow:0 0 8px #ff453a;"></span>
              GARANTÍAS ACTIVAS
            </span>
            <span style="font-size:0.68rem; color:rgba(255,255,255,0.5); font-weight:700;">EN REVISIÓN</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px; max-height:160px; overflow-y:auto;">`;

      garantias.forEach((g) => {
        html += `
          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,69,58,0.08); border:1px solid rgba(255,69,58,0.18); border-radius:8px; padding:5px 9px;">
            <span style="font-size:0.78rem; font-weight:700; color:#ffffff;">${g.plataforma}</span>
            <span style="font-size:0.72rem; font-weight:900; color:#ff453a; font-family:monospace; background:rgba(255,69,58,0.2); padding:2px 7px; border-radius:6px;">
              ${g.total} en garantía
            </span>
          </div>`;
      });

      html += `</div></div>`;
    }

    container.innerHTML = html;
  }

  // 3. INICIALIZACIÓN Y AUTO-ACTUALIZACIÓN CADA 30 SEGUNDOS
  function init() {
    window.cargarWidgetsAlertasTopRight();
    setInterval(window.cargarWidgetsAlertasTopRight, 30000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
