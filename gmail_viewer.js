/* ==========================================================================
   📧 CYBERNET OS - MÓDULO GMAIL / CONSULTA DE CÓDIGOS (gmail_viewer.js)
   ========================================================================== */

window.memoriaGmailDatos = [];

// 👁️ APERTURA Y CONTROL DEL PANEL DE GMAIL
window.toggleGmailPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("gmailOverlay");
  if (!overlay) {
    alert("⚠️ Error: No se encontró el modal #gmailOverlay en el HTML.");
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

    window.cargarDatosGmail();
  }
};

// 🔄 CONSULTA A LA API DE GMAIL / CÓDIGOS
window.cargarDatosGmail = function () {
  if (typeof haptic === "function") haptic();
  const contenedor = document.getElementById("contenedorGmailMensajes");
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div style="text-align: center; padding: 40px; color: #ea4335;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
        <svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
        <span style="font-weight: 700; font-size: 0.88rem;">Consultando mensajes recientes...</span>
      </div>
    </div>`;

  fetch("https://api.cybernetsp.com/obtener_gmail.php")
    .then((res) => res.json())
    .then((res) => {
      if (res && res.status === "success") {
        window.memoriaGmailDatos = res.data || [];
        window.renderizarListaGmail();
      } else {
        contenedor.innerHTML = `<div style="text-align: center; padding: 30px; color: #ff453a; font-weight: 700;">Error: ${res ? res.message : "No se obtuvieron registros."}</div>`;
      }
    })
    .catch((err) => {
      console.error("Error al consultar Gmail:", err);
      contenedor.innerHTML = `<div style="text-align: center; padding: 30px; color: #ff453a; font-weight: 700;">❌ Error de conexión al consultar el servidor Gmail.</div>`;
    });
};

// 🎨 RENDERIZADO DE LA LISTA DE MENSAJES
window.renderizarListaGmail = function () {
  const contenedor = document.getElementById("contenedorGmailMensajes");
  const inputSearch = document.getElementById("inputSearchGmail");
  const query = inputSearch ? inputSearch.value.toLowerCase().trim() : "";

  if (!contenedor) return;

  let datos = window.memoriaGmailDatos;

  if (query !== "") {
    datos = datos.filter((item) => {
      return (
        (item.correo || "").toLowerCase().includes(query) ||
        (item.asunto || "").toLowerCase().includes(query) ||
        (item.codigo || "").toLowerCase().includes(query) ||
        (item.servicio || "").toLowerCase().includes(query)
      );
    });
  }

  if (datos.length === 0) {
    contenedor.innerHTML = `<div style="text-align: center; padding: 35px 20px; color: #a1a1aa; font-weight: 600; background: rgba(255, 255, 255, 0.02); border-radius: 16px; border: 1px dashed rgba(255, 255, 255, 0.08);">No se encontraron mensajes o códigos recientes.</div>`;
    return;
  }

  let html = "";
  datos.forEach((item) => {
    let codigo = item.codigo || item.code || "-";
    let correo = item.correo || item.email || "-";
    let asunto = item.asunto || item.subject || "Sin asunto";
    let fecha = item.fecha || item.date || "-";
    let servicio = (item.servicio || "GMAIL").toUpperCase();

    let codigoEscapado = encodeURIComponent(codigo);

    html += `
      <div class="gmail-card-item" style="background: rgba(255, 255, 255, 0.025); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; gap: 14px; transition: all 0.2s ease;" onmouseover="this.style.background='rgba(255, 255, 255, 0.04)'; this.style.borderColor='rgba(234, 67, 53, 0.3)';" onmouseout="this.style.background='rgba(255, 255, 255, 0.025)'; this.style.borderColor='rgba(255, 255, 255, 0.08)';">
        
        <!-- DETALLES DEL CORREO -->
        <div style="display: flex; flex-direction: column; gap: 4px; overflow: hidden; flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="background: rgba(234, 67, 53, 0.15); border: 1px solid rgba(234, 67, 53, 0.3); color: #ea4335; font-weight: 800; font-size: 0.68rem; padding: 2px 8px; border-radius: 6px; text-transform: uppercase;">${servicio}</span>
            <span style="color: #ffffff; font-weight: 800; font-size: 0.9rem; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${correo}</span>
          </div>
          <span style="color: #a1a1aa; font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${asunto}</span>
          <span style="color: #71717a; font-size: 0.72rem;">📅 ${fecha}</span>
        </div>

        <!-- CÓDIGO DESTACADO Y BOTÓN DE COPIADO -->
        <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
          ${
            codigo !== "-"
              ? `<div style="background: rgba(48, 209, 88, 0.12); border: 1px solid rgba(48, 209, 88, 0.3); padding: 6px 14px; border-radius: 10px;">
                  <span style="font-size: 1.1rem; font-weight: 900; color: #30d158; font-family: monospace; letter-spacing: 1px;">${codigo}</span>
                </div>
                <button type="button" onclick="window.copiarCodigoGmail(this, '${codigoEscapado}')" title="Copiar código" style="background: rgba(10, 132, 255, 0.15); border: 1px solid rgba(10, 132, 255, 0.3); color: #0a84ff; padding: 8px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>`
              : `<span style="color: #71717a; font-size: 0.8rem;">Sin código</span>`
          }
        </div>

      </div>`;
  });

  contenedor.innerHTML = html;
};

// 📋 COPIAR CÓDIGO
window.copiarCodigoGmail = function (btn, codigoEscapado) {
  if (typeof haptic === "function") haptic();
  const codigo = decodeURIComponent(codigoEscapado);

  navigator.clipboard.writeText(codigo).then(() => {
    let oldHtml = btn.innerHTML;
    btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#30d158" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    btn.style.background = "rgba(48, 209, 88, 0.2)";

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Código copiado al portapapeles</span></div>`
      );
    }

    setTimeout(() => {
      btn.innerHTML = oldHtml;
      btn.style.background = "rgba(10, 132, 255, 0.15)";
    }, 1500);
  });
};

// 🔍 FILTRO DE BÚSQUEDA
window.filtrarGmail = function () {
  window.renderizarListaGmail();
};