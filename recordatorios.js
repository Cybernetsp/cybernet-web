/* ==========================================================================
   🔔 CYBERNET OS - MÓDULO DE RECORDATORIOS DE PAGO (recordatorios.js)
   ========================================================================== */

// 🌐 CONFIGURACIÓN DEL ENDPOINT PHP
window.URL_API_RECORDATORIOS =
  "https://api.cybernetsp.com/obtener_recordatorios.php";

// Memoria local de estados para WhatsApp 1 y WhatsApp 2
window.memoriaRecordatoriosW1 = [];
window.memoriaRecordatoriosW2 = [];

// =========================================================================
// 👁️ APERTURA Y CONTROL DEL PANEL
// =========================================================================
window.toggleRecordatoriosPanel = function () {
  if (typeof haptic === "function") haptic();

  const overlay = document.getElementById("recordatoriosOverlay");
  if (!overlay) {
    alert(
      "⚠️ Error: No se encontró el modal #recordatoriosOverlay en el HTML.",
    );
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

    // Sincronización automática de W1 y W2 al abrir
    window.sincronizarW1();
    window.sincronizarW2();
  }
};

// =========================================================================
// 🔄 SINCRONIZACIÓN Y CONSULTA A PHP (WHATSAPP 1)
// =========================================================================
window.sincronizarW1 = function () {
  if (typeof haptic === "function") haptic();

  const selectPeriodo = document.getElementById("periodoW1");
  const periodoVal = selectPeriodo ? selectPeriodo.value : "hoy";
  const contador = document.getElementById("contadorW1");
  const listaContenedor = document.getElementById("listaIndividualW1");
  const bloquesContenedor = document.getElementById("bloquesW1");

  if (contador) contador.innerText = "Consultando...";
  if (listaContenedor) {
    listaContenedor.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: #bf5af2;">
        <svg class="spin-anim" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle; margin-right:8px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
        <span style="font-weight:700; font-size:0.85rem;">Consultando MySQL...</span>
      </div>`;
  }

  fetch(
    `${window.URL_API_RECORDATORIOS}?periodo=${encodeURIComponent(periodoVal)}`,
  )
    .then((res) => res.json())
    .then((res) => {
      if (res && res.status === "success") {
        window.memoriaRecordatoriosW1 = res.data || [];
        if (contador) contador.innerText = `${res.total || 0} clientes`;
        window.renderizarCanalRecordatorios("W1");
      } else {
        if (contador) contador.innerText = "0 clientes";
        if (listaContenedor) {
          listaContenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #ff453a; font-weight: 700;">❌ ${res ? res.message : "Error al consultar la base de datos."}</div>`;
        }
      }
    })
    .catch((err) => {
      console.error("Error en W1:", err);
      if (contador) contador.innerText = "Error";
      if (listaContenedor) {
        listaContenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #ff453a; font-weight: 700;">❌ Error de conexión al servidor MySQL.</div>`;
      }
    });
};

// =========================================================================
// 🔄 SINCRONIZACIÓN Y CONSULTA A PHP (WHATSAPP 2)
// =========================================================================
window.sincronizarW2 = function () {
  if (typeof haptic === "function") haptic();

  const selectPeriodo = document.getElementById("periodoW2");
  const periodoVal = selectPeriodo ? selectPeriodo.value : "tres_dias";
  const contador = document.getElementById("contadorW2");
  const listaContenedor = document.getElementById("listaIndividualW2");

  if (contador) contador.innerText = "Consultando...";
  if (listaContenedor) {
    listaContenedor.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: #30d158;">
        <svg class="spin-anim" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle; margin-right:8px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
        <span style="font-weight:700; font-size:0.85rem;">Consultando MySQL...</span>
      </div>`;
  }

  fetch(
    `${window.URL_API_RECORDATORIOS}?periodo=${encodeURIComponent(periodoVal)}`,
  )
    .then((res) => res.json())
    .then((res) => {
      if (res && res.status === "success") {
        window.memoriaRecordatoriosW2 = res.data || [];
        if (contador) contador.innerText = `${res.total || 0} clientes`;
        window.renderizarCanalRecordatorios("W2");
      } else {
        if (contador) contador.innerText = "0 clientes";
        if (listaContenedor) {
          listaContenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #ff453a; font-weight: 700;">❌ ${res ? res.message : "Error al consultar la base de datos."}</div>`;
        }
      }
    })
    .catch((err) => {
      console.error("Error en W2:", err);
      if (contador) contador.innerText = "Error";
      if (listaContenedor) {
        listaContenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #ff453a; font-weight: 700;">❌ Error de conexión al servidor MySQL.</div>`;
      }
    });
};

// =========================================================================
// 🎨 RENDERIZADO DE BLOQUES Y MENSAJES INDIVIDUALES
// =========================================================================
window.renderizarCanalRecordatorios = function (canal) {
  const esW1 = canal === "W1";
  const listaData = esW1
    ? window.memoriaRecordatoriosW1
    : window.memoriaRecordatoriosW2;
  const listaContenedor = document.getElementById(
    esW1 ? "listaIndividualW1" : "listaIndividualW2",
  );
  const bloquesContenedor = document.getElementById(
    esW1 ? "bloquesW1" : "bloquesW2",
  );

  const colorTema = esW1 ? "#bf5af2" : "#30d158";
  const colorTemaBg = esW1
    ? "rgba(191, 90, 242, 0.15)"
    : "rgba(48, 209, 88, 0.15)";
  const colorTemaBorder = esW1
    ? "rgba(191, 90, 242, 0.3)"
    : "rgba(48, 209, 88, 0.3)";

  if (!listaContenedor) return;

  // Si no hay registros encontrados
  if (!listaData || listaData.length === 0) {
    listaContenedor.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 35px 20px; color: #a1a1aa; font-weight: 600; background: rgba(255, 255, 255, 0.02); border-radius: 16px; border: 1px dashed rgba(255, 255, 255, 0.08);">
        🎉 No hay clientes pendientes de recordatorio en esta fecha.
      </div>`;
    if (bloquesContenedor) bloquesContenedor.innerHTML = "";
    return;
  }

  // 1. RENDERIZAR BOTONES DE BLOQUE MASIVO
  if (bloquesContenedor) {
    let htmlBloques = `
      <button type="button" onclick="window.copiarTodosLosNumerosRecordatorio('${canal}')" style="background: ${colorTemaBg}; border: 1px solid ${colorTemaBorder}; color: ${colorTema}; padding: 8px 12px; border-radius: 10px; font-weight: 800; font-size: 0.78rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; white-space: nowrap;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        Copiar Números (${listaData.length})
      </button>`;

    bloquesContenedor.innerHTML = htmlBloques;
  }

  // 2. RENDERIZAR TARJETAS INDIVIDUALES
  let htmlCards = "";
  listaData.forEach((item, idx) => {
    const msjEscapado = encodeURIComponent(item.mensaje || "");
    const waLink =
      item.waLink || `https://wa.me/${item.tel}?text=${msjEscapado}`;

    htmlCards += `
      <div class="card-recordatorio-item" style="background: rgba(255, 255, 255, 0.025); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; box-sizing: border-box;">
        
        <!-- Nombre y Estado -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
          <div style="display: flex; flex-direction: column; gap: 2px; overflow: hidden;">
            <span style="font-weight: 800; font-size: 0.88rem; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${item.user || "CLIENTE CYBERNET"}
            </span>
            <span style="font-size: 0.75rem; color: #a1a1aa; font-family: monospace;">
              📱 ${item.tel || "-"}
            </span>
          </div>
          <span style="background: ${colorTemaBg}; border: 1px solid ${colorTemaBorder}; color: ${colorTema}; font-weight: 800; font-size: 0.65rem; padding: 2px 8px; border-radius: 6px; white-space: nowrap; text-transform: uppercase;">
            ${item.plat || "NETFLIX"}
          </span>
        </div>

        <!-- Detalles de Cuenta -->
        <div style="background: rgba(0, 0, 0, 0.35); padding: 8px 10px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.75rem; display: flex; flex-direction: column; gap: 3px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #a1a1aa;">Correo:</span>
            <span style="color: #0a84ff; font-family: monospace; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;" title="${item.correo}">${item.correo || "-"}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #a1a1aa;">Perfil / Venc:</span>
            <span style="color: #ffd60a; font-weight: 700;">Perfil ${item.perfil || "1"} (${item.vencimiento || "-"})</span>
          </div>
        </div>

        <!-- Acciones: Abrir WhatsApp y Copiar Mensaje -->
        <div style="display: flex; gap: 6px; margin-top: 2px;">
          <a href="${waLink}" target="_blank" onclick="window.marcarEnvioRecordatorio(this)" style="flex: 1; background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; padding: 7px; border-radius: 10px; font-size: 0.75rem; font-weight: 800; text-decoration: none; text-align: center; display: flex; align-items: center; justify-content: center; gap: 4px;">
            <span>💬 Abrir Chat</span>
          </a>
          <button type="button" onclick="window.copiarMensajeRecordatorio(this, '${msjEscapado}')" style="flex: 1; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; padding: 7px; border-radius: 10px; font-size: 0.75rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Copiar</span>
          </button>
        </div>

      </div>`;
  });

  listaContenedor.innerHTML = htmlCards;
};

// =========================================================================
// 📋 ACCIONES DE COPIADO Y NAVEGACIÓN
// =========================================================================
window.copiarMensajeRecordatorio = function (btn, msjEscapado) {
  if (typeof haptic === "function") haptic();
  const mensaje = decodeURIComponent(msjEscapado);

  navigator.clipboard.writeText(mensaje).then(() => {
    const oldText = btn.innerHTML;
    btn.innerHTML = `✅ Copiado`;
    btn.style.setProperty("background", "rgba(48, 209, 88, 0.2)", "important");
    btn.style.setProperty("color", "#30d158", "important");

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Mensaje copiado al portapapeles</span></div>`,
      );
    }

    setTimeout(() => {
      btn.innerHTML = oldText;
      btn.style.setProperty(
        "background",
        "rgba(255, 255, 255, 0.08)",
        "important",
      );
      btn.style.setProperty("color", "#ffffff", "important");
    }, 1500);
  });
};

window.copiarTodosLosNumerosRecordatorio = function (canal) {
  if (typeof haptic === "function") haptic();

  const dataList =
    canal === "W1"
      ? window.memoriaRecordatoriosW1
      : window.memoriaRecordatoriosW2;
  if (!dataList || dataList.length === 0) {
    alert("⚠️ No hay números en esta lista.");
    return;
  }

  const textoNumeros = dataList
    .map((item, idx) => `${idx + 1}. wa.me/${item.tel}`)
    .join("\n");

  navigator.clipboard.writeText(textoNumeros).then(() => {
    if (typeof triggerToast === "function") {
      triggerToast(
        `📋 ${dataList.length} enlaces de WhatsApp copiados al portapapeles.`,
      );
    }
  });
};

window.marcarEnvioRecordatorio = function (anchor) {
  if (typeof haptic === "function") haptic();
  const parentCard = anchor.closest(".card-recordatorio-item");
  if (parentCard) {
    parentCard.style.opacity = "0.5";
    parentCard.style.border = "1px solid rgba(48, 209, 88, 0.4)";
  }
};
