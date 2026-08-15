/* ==========================================================================
   🔔 CYBERNET OS - MÓDULO DE RECORDATORIOS DE PAGO (recordatorios.js)
   ========================================================================== */

// 👁️ APERTURA Y CONTROL DEL PANEL DE RECORDATORIOS DE PAGO
window.toggleRecordatoriosPanel = function () {
  if (typeof haptic === "function") haptic();

  // Apunta al ID exacto de tu HTML
  const overlay = document.getElementById("recordatoriosOverlay");

  if (!overlay) {
    console.error(
      "❌ No se encontró el modal #recordatoriosOverlay en el DOM.",
    );
    alert("⚠️ Error: No se encontró el modal de recordatorios en la página.");
    return;
  }

  if (overlay.classList.contains("open") || overlay.style.display === "flex") {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    if (typeof cerrarTodasLasVentanas === "function") cerrarTodasLasVentanas();

    overlay.classList.add("open");
    overlay.style.setProperty("display", "flex", "important");
    overlay.style.setProperty("align-items", "center", "important");
    overlay.style.setProperty("justify-content", "center", "important");

    // Ejecuta la carga inicial de datos si la función existe
    if (typeof window.cargarDatosRecordatorios === "function") {
      window.cargarDatosRecordatorios();
    }
  }
};

// 🔄 FUNCIONES DE CONTROL PARA WHATSAPP 1 Y WHATSAPP 2
window.sincronizarW1 = function () {
  if (typeof haptic === "function") haptic();
  const periodo = document.getElementById("periodoW1")?.value || "hoy";

  if (typeof triggerToast === "function") {
    triggerToast(`🔄 Sincronizando WhatsApp 1 (${periodo})...`);
  }

  // Aquí puedes agregar tu llamado fetch() a la API para cargar la lista W1
};

window.sincronizarW2 = function () {
  if (typeof haptic === "function") haptic();
  const periodo = document.getElementById("periodoW2")?.value || "tres_dias";

  if (typeof triggerToast === "function") {
    triggerToast(`🔄 Sincronizando WhatsApp 2 (${periodo})...`);
  }

  // Aquí puedes agregar tu llamado fetch() a la API para cargar la lista W2
};

// Carga automática inicial opcional
window.cargarDatosRecordatorios = function () {
  window.sincronizarW1();
  window.sincronizarW2();
};
