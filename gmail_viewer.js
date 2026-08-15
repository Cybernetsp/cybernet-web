/* ==========================================================================
   📧 CYBERNET OS - MÓDULO GMAIL / CONSULTA DE MENSAJES (gmail_viewer.js)
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

    const inputSearch = document.getElementById("inputSearchGmail");
    if (inputSearch && inputSearch.value.trim() !== "") {
      window.cargarDatosGmail();
    } else if (inputSearch) {
      setTimeout(() => inputSearch.focus(), 150);
    }
  }
};

// 🔄 CONSULTA A LA API DE GMAIL CON LECTURA ROBUSTA DE JSON
window.cargarDatosGmail = function () {
  if (typeof haptic === "function") haptic();
  const contenedor = document.getElementById("contenedorGmailMensajes");
  const inputSearch = document.getElementById("inputSearchGmail");
  if (!contenedor) return;

  const correoVal = inputSearch ? inputSearch.value.trim() : "";

  if (!correoVal) {
    contenedor.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #ff9f0a; font-weight: 600; background: rgba(255, 159, 10, 0.05); border-radius: 18px; border: 1px dashed rgba(255, 159, 10, 0.25);">
        ⚠️ Por favor ingresa un correo electrónico en la casilla de búsqueda arriba.
      </div>`;
    if (inputSearch) inputSearch.focus();
    return;
  }

  contenedor.innerHTML = `
    <div style="text-align: center; padding: 45px; color: #ea4335;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
        <svg class="spin-anim" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
        <span style="font-weight: 700; font-size: 0.9rem;">Escaneando bandeja para ${correoVal}...</span>
      </div>
    </div>`;

  fetch(
    `https://api.cybernetsp.com/obtener_gmail.php?correo=${encodeURIComponent(correoVal)}`,
  )
    .then(async (response) => {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (err) {
        throw new Error(
          "Respuesta del servidor no es un JSON válido: " +
            text.substring(0, 100),
        );
      }
    })
    .then((res) => {
      if (res && res.status === "error") {
        contenedor.innerHTML = `
          <div style="text-align: center; padding: 35px 20px; color: #ff453a; font-weight: 700; background: rgba(255, 69, 58, 0.05); border-radius: 18px; border: 1px solid rgba(255, 69, 58, 0.2);">
            ❌ ${res.message || "No se encontraron datos."}
          </div>`;
        return;
      }

      let lista =
        res.data ||
        res.mensajes ||
        res.correos ||
        (Array.isArray(res) ? res : []);
      window.memoriaGmailDatos = lista;
      window.renderizarListaGmail(correoVal);
    })
    .catch((err) => {
      console.error("Error al consultar Gmail:", err);
      contenedor.innerHTML = `
        <div style="text-align: center; padding: 35px 20px; color: #ff453a; font-weight: 700; background: rgba(255, 69, 58, 0.05); border-radius: 18px; border: 1px solid rgba(255, 69, 58, 0.2);">
          ❌ ${err.message}
        </div>`;
    });
};

// 🎨 RENDERIZADO DE LA LISTA DE MENSAJES
window.renderizarListaGmail = function (correoBuscado = "") {
  const contenedor = document.getElementById("contenedorGmailMensajes");
  if (!contenedor) return;

  let datos = window.memoriaGmailDatos;

  if (!datos || datos.length === 0) {
    contenedor.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #a1a1aa; font-weight: 600; background: rgba(255, 255, 255, 0.02); border-radius: 18px; border: 1px dashed rgba(255, 255, 255, 0.08);">
        📭 No se encontraron correos recientes o mensajes para <b>${correoBuscado}</b>.
      </div>`;
    return;
  }

  let html = "";
  datos.forEach((item) => {
    let remitente = item.remitente || item.de || item.from || "Notificación";
    let asunto = item.asunto || item.subject || "Sin asunto";
    let fecha = item.fecha || item.date || "Reciente";
    let mensajeTexto =
      item.cuerpo || item.snippet || item.mensaje || item.link || "";
    let enlaceDirecto = item.link || item.enlace || item.url || "";

    let mensajeEscapado = encodeURIComponent(mensajeTexto || asunto);

    html += `
      <div class="gmail-card-item" style="background: rgba(255, 255, 255, 0.025); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 18px; padding: 16px; display: flex; flex-direction: column; gap: 10px; transition: all 0.2s ease;" onmouseover="this.style.background='rgba(255, 255, 255, 0.04)'; this.style.borderColor='rgba(234, 67, 53, 0.35)';" onmouseout="this.style.background='rgba(255, 255, 255, 0.025)'; this.style.borderColor='rgba(255, 255, 255, 0.08)';">
        
        <!-- Encabezado del mensaje -->
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; overflow: hidden;">
            <span style="background: rgba(234, 67, 53, 0.15); border: 1px solid rgba(234, 67, 53, 0.3); color: #ea4335; font-weight: 800; font-size: 0.72rem; padding: 3px 10px; border-radius: 8px; text-transform: uppercase;">
              ${remitente}
            </span>
            <span style="color: #ffffff; font-weight: 800; font-size: 0.92rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${asunto}
            </span>
          </div>
          <span style="color: #a1a1aa; font-size: 0.75rem; font-family: monospace; flex-shrink: 0;">
            ${fecha}
          </span>
        </div>

        <!-- Cuerpo del mensaje -->
        ${
          mensajeTexto
            ? `
          <div style="background: rgba(0, 0, 0, 0.35); padding: 10px 12px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.82rem; color: #e4e4e7; line-height: 1.4; word-break: break-word;">
            ${mensajeTexto}
          </div>
        `
            : ""
        }

        <!-- Botones de Acción SVG -->
        <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
          ${
            enlaceDirecto
              ? `
            <a href="${enlaceDirecto}" target="_blank" style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; padding: 7px 14px; border-radius: 10px; font-size: 0.78rem; font-weight: 800; text-decoration: none; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              Abrir Enlace
            </a>
          `
              : ""
          }

          <button type="button" onclick="window.copiarContenidoGmail(this, '${mensajeEscapado}')" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; padding: 7px 12px; border-radius: 10px; font-size: 0.78rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copiar
          </button>
        </div>

      </div>`;
  });

  contenedor.innerHTML = html;
};

// 📋 COPIAR CONTENIDO
window.copiarContenidoGmail = function (btn, textoEscapado) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(textoEscapado);

  navigator.clipboard.writeText(texto).then(() => {
    let oldHtml = btn.innerHTML;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#30d158" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Copiado`;
    btn.style.background = "rgba(48, 209, 88, 0.2)";
    btn.style.color = "#30d158";

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Contenido copiado al portapapeles</span></div>`,
      );
    }

    setTimeout(() => {
      btn.innerHTML = oldHtml;
      btn.style.background = "rgba(255, 255, 255, 0.08)";
      btn.style.color = "#ffffff";
    }, 1500);
  });
};
