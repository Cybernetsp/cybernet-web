/* ==========================================================================
   🔔 MÓDULO DE RECORDATORIOS (PANEL Y CONTROLADOR)
   ========================================================================== */

window.memoriaRecordatorios = JSON.parse(localStorage.getItem("cyber_recordatorios_list") || "[]");

window.toggleRecordarPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("recordarOverlay");
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
    window.renderizarListaRecordatorios();
  }
};

window.guardarRecordatorioNuevo = function () {
  if (typeof haptic === "function") haptic();
  const input = document.getElementById("inputTextoRecordatorio");
  if (!input) return;

  const texto = input.value.trim();
  if (!texto) {
    alert("⚠️ Escribe un texto para el recordatorio.");
    return;
  }

  const usuarioActivoObj = JSON.parse(sessionStorage.getItem("usuario_activo") || "{}");
  const usuarioNombre = usuarioActivoObj.nombre || sessionStorage.getItem("active_staff") || "Staff";

  const nuevoItem = {
    id: Date.now(),
    texto: texto,
    autor: usuarioNombre,
    fecha: new Date().toLocaleDateString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
  };

  window.memoriaRecordatorios.unshift(nuevoItem);
  localStorage.setItem("cyber_recordatorios_list", JSON.stringify(window.memoriaRecordatorios));

  input.value = "";
  window.renderizarListaRecordatorios();

  if (typeof triggerToast === "function") {
    triggerToast(`<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Recordatorio guardado</span></div>`);
  }
};

window.eliminarRecordatorioItem = function (id) {
  if (typeof haptic === "function") haptic();
  window.memoriaRecordatorios = window.memoriaRecordatorios.filter(item => item.id !== id);
  localStorage.setItem("cyber_recordatorios_list", JSON.stringify(window.memoriaRecordatorios));
  window.renderizarListaRecordatorios();
};

window.renderizarListaRecordatorios = function () {
  const container = document.getElementById("contenedorListaRecordatorios");
  if (!container) return;

  if (window.memoriaRecordatorios.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px; color: #a1a1aa; font-weight: 500; font-size: 0.85rem; background: rgba(255,255,255,0.02); border-radius: 14px; border: 1px dashed rgba(255,255,255,0.08);">
        📌 No hay recordatorios pendientes.
      </div>`;
    return;
  }

  let html = "";
  window.memoriaRecordatorios.forEach((item) => {
    html += `
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-left: 4px solid #ff9f0a; border-radius: 14px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
        <div style="display: flex; flex-direction: column; gap: 3px; flex: 1; overflow: hidden;">
          <span style="color: #ffffff; font-weight: 700; font-size: 0.88rem; word-break: break-word;">${item.texto}</span>
          <span style="color: #a1a1aa; font-size: 0.72rem;">👤 ${item.autor} • 📅 ${item.fecha}</span>
        </div>
        <button type="button" onclick="window.eliminarRecordatorioItem(${item.id})" title="Marcar como completado" style="background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.3); color: #ff453a; width: 30px; height: 30px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>`;
  });

  container.innerHTML = html;
};