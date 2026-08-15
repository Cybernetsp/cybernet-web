/* ==========================================================================
   📧 CYBERNET OS - MÓDULO BANDEJA GMAIL (gmail_viewer.js)
   ========================================================================== */

window.correosGlobalesData = [];
window.GOOGLE_SCRIPT_GMAIL_URL =
  "https://script.google.com/macros/s/AKfycbxqKpMcC5BI0H6PHnImu5Lkw3ryiuFO0fW0KJAhQ_45kzglYn9CpN1O2fCjezXM5oMi/exec";

// 👁️ APERTURA Y CONTROL DEL MODAL
window.toggleGmailPanel = function () {
  try {
    if (typeof haptic === "function") haptic();
  } catch (e) {}

  const overlay = document.getElementById("gmailOverlay");
  if (!overlay) {
    alert("⚠️ Error: No se encontró el modal #gmailOverlay en el HTML.");
    return;
  }

  const estaAbierto =
    overlay.classList.contains("open") || overlay.style.display === "flex";

  if (estaAbierto) {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    if (typeof cerrarTodasLasVentanas === "function") {
      try {
        cerrarTodasLasVentanas();
      } catch (e) {}
    }

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

// 🔄 BÚSQUEDA DIRECTA VÍA GOOGLE APPS SCRIPT (MATE CON LA LÓGICA DE TU OTRA PÁGINA)
window.cargarDatosGmail = function () {
  try {
    if (typeof haptic === "function") haptic();
  } catch (e) {}

  const inputVisual = document.getElementById("inputSearchGmail");
  const contenedor = document.getElementById("contenedorGmailMensajes");
  if (!contenedor || !inputVisual) return;

  const correoBuscar = inputVisual.value.trim();

  if (correoBuscar === "") {
    alert("⚠️ Por favor ingresa el correo completo que deseas buscar.");
    inputVisual.focus();
    return;
  }

  contenedor.innerHTML = `
    <div style="text-align:center; padding:60px 20px; color:#a1a1aa; font-size:0.95rem;">
      <svg class="spin-anim" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ea4335" stroke-width="2.5" style="margin-bottom:12px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
      <br><span style="color:#ea4335; font-weight:700;">Buscando correos para: ${correoBuscar}...</span>
    </div>`;

  const oldScript = document.getElementById("cyber_gmail_global_node");
  if (oldScript) oldScript.remove();

  const cbName = "cb_gmail_global_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      if (!res.data || res.data.length === 0) {
        contenedor.innerHTML = `
          <div style="text-align:center; padding:50px 20px; color:#ff9f0a; font-weight:bold; font-size:0.95rem; background: rgba(255, 159, 10, 0.05); border-radius: 18px; border: 1px dashed rgba(255, 159, 10, 0.25);">
            📭 No se encontraron correos nuevos para <b>${correoBuscar}</b>.
          </div>`;
        return;
      }

      window.correosGlobalesData = res.data;
      let htmlTabla = `<table style="width: 100%; border-collapse: collapse; text-align: left;">`;

      res.data.forEach((mail, i) => {
        let remitenteLimpio = (mail.remitente || "")
          .replace(/<.*?>/g, "")
          .trim();
        if (remitenteLimpio === "")
          remitenteLimpio = mail.remitente || "Remitente";

        let destinatarioLimpio = (mail.destinatario || "")
          .replace(/<.*?>/g, "")
          .trim();
        if (destinatarioLimpio === "")
          destinatarioLimpio = mail.destinatario || correoBuscar;

        htmlTabla += `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s;" 
              onmouseover="this.style.background='rgba(234, 67, 53, 0.12)'" 
              onmouseout="this.style.background='transparent'" 
              onclick="window.abrirLectorCorreoGlobal(${i})">
              
             <td style="padding: 14px 12px; width: 32%; vertical-align: middle;">
                <div style="color: #ffffff; font-weight: 800; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px;">${remitenteLimpio}</div>
                <div style="color: #a1a1aa; font-size: 0.73rem; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px;">
                  Para: <span style="color: #0a84ff; font-family: monospace; font-weight: 600;">${destinatarioLimpio}</span>
                </div>
             </td>
             
             <td style="padding: 14px 12px; width: 53%; vertical-align: middle;">
                <div style="display: flex; flex-direction: column; gap: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 400px;">
                  <span style="color: #ffffff; font-weight: 700; font-size: 0.88rem;">${mail.asunto || "Sin asunto"}</span>
                  <span style="color: #a1a1aa; font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis;">${mail.fragmento || ""}</span>
                </div>
             </td>
             
             <td style="padding: 14px 12px; width: 15%; text-align: right; vertical-align: middle;">
                <div style="color: #a1a1aa; font-size: 0.78rem; font-family: monospace; font-weight: bold;">${mail.fecha || "Reciente"}</div>
             </td>
          </tr>`;
      });

      htmlTabla += `</table>`;
      contenedor.innerHTML = htmlTabla;

      if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");
    } else {
      contenedor.innerHTML = `<div style="color:#ff453a; text-align:center; padding:40px; font-weight:700;">❌ Error: ${res ? res.message : "Fallo de conexión"}</div>`;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${window.GOOGLE_SCRIPT_GMAIL_URL}?action=obtenerCorreosRecientesGlobal&correo=${encodeURIComponent(correoBuscar)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// 📩 ABRE EL LECTOR EN SUB-MODAL CON EL CUERPO COMPLETO DEL CORREO
window.abrirLectorCorreoGlobal = function (index) {
  try {
    if (typeof haptic === "function") haptic();
  } catch (e) {}
  let data = window.correosGlobalesData[index];

  if (data && (data.cuerpoHtml || data.fragmento)) {
    document.getElementById("cuerpoLectorCorreoGlobal").innerHTML =
      data.cuerpoHtml || `<p>${data.fragmento}</p>`;
    document.getElementById("modalLectorCorreoGlobal").style.display = "flex";
  } else {
    alert("No se pudo extraer el cuerpo de este correo.");
  }
};

// ✕ CIERRA EL SUB-MODAL LECTOR
window.cerrarLectorCorreoGlobal = function () {
  try {
    if (typeof haptic === "function") haptic();
  } catch (e) {}
  document.getElementById("modalLectorCorreoGlobal").style.display = "none";
  document.getElementById("cuerpoLectorCorreoGlobal").innerHTML = "";
};
