/* ==========================================================================
   🛠️ CYBERNET OS - HERRAMIENTAS Y UTILIDADES (herramientas.js)
   ========================================================================== */

/* ==========================================================================
   💳 CYBERNET OS - MÓDULO MODAL PAGOS BRE-B (DISEÑO PREMIUM CON HORA/FECHA TOP-RIGHT)
   ========================================================================== */
const URL_PAGOS_BREB_MYSQL =
  "https://api.cybernetsp.com/obtener_pagos_breb.php";
let cantidadPagosAnterior = 0;

// 👁️ ABRIR / CERRAR VENTANA MODAL DE BRE-B
window.toggleBreBPanel = function () {
  if (typeof haptic === "function") haptic();

  const overlay = document.getElementById("brebOverlay");
  if (!overlay) return;

  const isVisible =
    overlay.classList.contains("open") || overlay.style.display === "flex";

  if (isVisible) {
    window.cerrarBreBPanel();
  } else {
    if (typeof cerrarTodasLasVentanas === "function") cerrarTodasLasVentanas();

    overlay.classList.add("open");
    overlay.style.setProperty("display", "flex", "important");

    window.establecerFechaHoyBreBModal();
    window.cargarPagosBreBModal();
  }
};

window.cerrarBreBPanel = function () {
  const overlay = document.getElementById("brebOverlay");
  if (overlay) {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  }
};

// 📅 AUTOFILLED FECHA HOY
window.establecerFechaHoyBreBModal = function () {
  const inputFecha = document.getElementById("breb-fecha-modal");
  if (inputFecha && !inputFecha.value) {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    inputFecha.value = `${yyyy}-${mm}-${dd}`;
  }
};

// 📥 CONSULTA EN TIEMPO REAL A MYSQL (CON NUEVO DISEÑO DE HORA Y FECHA)
window.cargarPagosBreBModal = function () {
  const contenedor = document.getElementById("breb-lista-modal");
  const totalInlineElem = document.getElementById("breb-monto-total-inline");

  if (!contenedor) return;

  contenedor.innerHTML = `
    <div style="color: #0a84ff; text-align: center; padding: 50px 20px; font-weight: 700; font-size: 0.88rem; display: flex; flex-direction: column; align-items: center; gap: 12px;">
      <svg class="spin-anim" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
      <span>Buscando pagos registrados en MySQL...</span>
    </div>`;

  const inputFecha = document.getElementById("breb-fecha-modal");
  const fechaVal = inputFecha ? inputFecha.value : "";

  const iconoRefresh = document.getElementById("icon-refresh-breb-modal");
  if (iconoRefresh) iconoRefresh.classList.add("spin-anim");

  fetch(`${URL_PAGOS_BREB_MYSQL}?fecha=${encodeURIComponent(fechaVal)}`)
    .then((res) => res.json())
    .then((res) => {
      if (iconoRefresh) iconoRefresh.classList.remove("spin-anim");

      if (res && res.status === "success" && res.data && res.data.length > 0) {
        if (
          cantidadPagosAnterior > 0 &&
          res.data.length > cantidadPagosAnterior
        ) {
          if (typeof CyberSonidos !== "undefined") CyberSonidos.play("dinero");
        }
        cantidadPagosAnterior = res.data.length;

        let sumaTotal = 0;
        let html = "";

        res.data.forEach((pago) => {
          const cliente = pago.nombre
            ? pago.nombre.toUpperCase().trim()
            : "CLIENTE DESCONOCIDO";

          const numMonto = parseFloat(pago.monto_raw) || 0;
          sumaTotal += numMonto;

          const montoStr = pago.valor || numMonto.toLocaleString("es-CO");
          const fechaHora = pago.fecha || "";
          const bancoOrigen = pago.banco ? pago.banco.toUpperCase() : "BRE-B";
          const refText = pago.referencia || "";

          // 🕒 SEPARAR FECHA Y HORA PARA EL ESQUEMA SUPERIOR DERECHO
          const partesFecha = fechaHora.trim().split(" ");
          const fechaOnly = partesFecha[0] || "";
          const horaOnly = partesFecha.slice(1).join(" ") || "";

          // Badge exclusivo para pagos 'usados'
          const esUsado = pago.estado === "usado";
          const estadoBadge = esUsado
            ? `<div style="margin-top:6px;"><span style="color:#ff453a; font-size:0.72rem; font-weight:800; background:rgba(255,69,58,0.15); padding:3px 10px; border-radius:6px;">USADO</span></div>`
            : "";

          // 🟢 TARJETA RE-DISEÑADA (HORA GRANDE ARRIBA DERECHA + SIN 'DISPONIBLE')
          html += `
            <div class="breb-card" style="position: relative; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px 16px; font-size: 0.83rem; line-height: 1.5; color: rgba(255, 255, 255, 0.8); transition: all 0.2s ease; margin-bottom: 8px;" onmouseover="this.style.background='rgba(255, 255, 255, 0.06)'; this.style.borderColor='rgba(48, 209, 88, 0.4)';" onmouseout="this.style.background='rgba(255, 255, 255, 0.03)'; this.style.borderColor='rgba(255, 255, 255, 0.08)';">
              
              <!-- ESQUINA SUPERIOR DERECHA: HORA GRANDE Y FECHA ABAJO -->
              <div style="position: absolute; top: 12px; right: 16px; text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                <span style="color: #ffffff; font-weight: 900; font-size: 1.05rem; font-family: monospace; letter-spacing: -0.3px;">${horaOnly}</span>
                <span style="color: rgba(255, 255, 255, 0.45); font-size: 0.72rem; font-weight: 600; font-family: monospace; margin-top: -2px;">${fechaOnly}</span>
              </div>

              <!-- CONTENIDO PRINCIPAL DE LA TARJETA -->
              <div style="padding-right: 110px;">
                <div style="font-weight: 800; color: #ffffff; font-size: 0.95rem; letter-spacing: 0.3px; text-transform: uppercase;">${cliente}</div>
                <div style="margin-top: 3px; display: flex; align-items: center; gap: 5px;">
                  <span style="color: rgba(255, 255, 255, 0.55); font-size: 0.82rem;">envió</span>
                  <span style="color: #30d158; font-weight: 900; font-family: monospace; font-size: 0.98rem;">+$${montoStr}</span>
                </div>
                <div style="color: rgba(255, 255, 255, 0.5); font-size: 0.76rem; margin-top: 4px;">
                  desde <b style="color: #0a84ff;">${bancoOrigen}</b> | Ref: <b style="color: #0a84ff;">${refText}</b>
                </div>
                ${estadoBadge}
              </div>

            </div>`;
        });

        contenedor.innerHTML = html;

        // 🛡️ VERIFICACIÓN DE ROL/USUARIO EXCLUSIVO PARA SUPERADMIN
        const usuarioActivo = (
          localStorage.getItem("usuario") ||
          localStorage.getItem("user") ||
          sessionStorage.getItem("usuario") ||
          window.usuarioActivo ||
          ""
        )
          .toUpperCase()
          .trim();

        const rolActivo = (
          localStorage.getItem("rol") ||
          sessionStorage.getItem("rol") ||
          ""
        )
          .toLowerCase()
          .trim();

        const esSuperAdmin =
          usuarioActivo === "CAMILO" ||
          rolActivo === "superadmin" ||
          usuarioActivo === "ADMIN";

        if (esSuperAdmin && totalInlineElem) {
          totalInlineElem.innerText =
            "$" + Math.round(sumaTotal).toLocaleString("es-CO");
          totalInlineElem.style.display = "inline-block";
        } else if (totalInlineElem) {
          totalInlineElem.style.display = "none";
        }
      } else {
        contenedor.innerHTML = `<div style="text-align: center; color: rgba(255,255,255,0.4); padding: 50px 20px; font-size: 0.85rem; font-weight: 600;">📭 No hay pagos registrados para la fecha seleccionada</div>`;
        if (totalInlineElem) totalInlineElem.style.display = "none";
      }
    })
    .catch((err) => {
      if (iconoRefresh) iconoRefresh.classList.remove("spin-anim");
      contenedor.innerHTML = `<div style="text-align: center; color: #ff453a; padding: 40px 20px; font-size: 0.85rem; font-weight: 700;">❌ Error al conectar con el servidor de MySQL</div>`;
      if (totalInlineElem) totalInlineElem.style.display = "none";
      console.error("Error consultando pagos Bre-B:", err);
    });
};

// 🔍 FILTRAR CLIENTES EN VIVO
window.filtrarBreBModal = function () {
  const buscador = document.getElementById("breb-buscar-modal");
  const texto = buscador ? buscador.value.toLowerCase().trim() : "";
  const tarjetas = document.querySelectorAll("#breb-lista-modal .breb-card");

  tarjetas.forEach((tarjeta) => {
    const contenido = tarjeta.innerText.toLowerCase();
    tarjeta.style.display = contenido.includes(texto) ? "block" : "none";
  });
};

// 📅 CAMBIO DE FECHA
window.alCambiarFechaBreBModal = function () {
  window.cargarPagosBreBModal();
};

// 🔄 REFRESCAR MANUALMENTE
window.forzarActualizacionBreBModal = function () {
  window.cargarPagosBreBModal();
};

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
              <img src="${plantillaPagos.imagenUrl}" alt="QR" onclick="window.copiarImagenQRPagos(this, '${plantillaPagos.imagenUrl}')" style="max-width:210px; width:100%; border-radius:16px; border: 2px solid transparent; box-shadow:var(--glass-shadow); padding:5px; background:white; margin:0 auto; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" title="Haz clic para copiar la imagen del QR">
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
   📩 BANDEJA DE CÓDIGOS DE ACCESO (ESCANEO EN TIEMPO REAL + MYSQL)
   ========================================================================== */
const URL_SYNC_CODIGOS_GMAIL =
  "https://api.cybernetsp.com/sync_gmail_codigos.php";
const URL_OBTENER_CODIGOS_MYSQL =
  "https://api.cybernetsp.com/obtener_codigos.php";

const oldToggleCodesPanel = window.toggleCodesPanel;
window.toggleCodesPanel = function () {
  if (oldToggleCodesPanel) oldToggleCodesPanel();
  const overlay = document.getElementById("codesOverlay");
  if (overlay && overlay.classList.contains("open")) {
    window.cargarBandejaCodigosMySQL(false);
  }
};

// 📥 CONSULTA DE CÓDIGOS (SI forzarSincro = TRUE, EJECUTA ESCANEO DE GMAIL EN VIVO)
window.cargarBandejaCodigosMySQL = function (forzarSincro = false) {
  const contenedor = document.getElementById("codesScrollArea");
  if (!contenedor) return;

  if (forzarSincro) {
    contenedor.innerHTML = `
      <div style="text-align: center; color: var(--ios-orange); padding: 50px 20px;">
        <svg class="spin-anim" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:12px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
        <br><span style="font-weight: 700; font-size: 0.9rem; color: #0a84ff;">Escaneando Gmail en vivo...</span>
      </div>`;

    // 1️⃣ Fuerza la sincronización rápida desde Gmail a MySQL
    fetch(URL_SYNC_CODIGOS_GMAIL)
      .then((res) => res.json())
      .then(() => {
        // 2️⃣ Lee de inmediato los códigos guardados en MySQL
        return fetch(URL_OBTENER_CODIGOS_MYSQL);
      })
      .then((res) => res.json())
      .then((res) => renderizarCodigosBandeja(res, contenedor))
      .catch((err) => {
        console.error("Error al sincronizar en vivo:", err);
        fetch(URL_OBTENER_CODIGOS_MYSQL)
          .then((res) => res.json())
          .then((res) => renderizarCodigosBandeja(res, contenedor));
      });
  } else {
    contenedor.innerHTML = `
      <div style="text-align: center; color: var(--ios-orange); padding: 50px 20px;">
        <svg class="spin-anim" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:12px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
        <br><span style="font-weight: 600;">Sincronizando códigos...</span>
      </div>`;

    fetch(URL_OBTENER_CODIGOS_MYSQL)
      .then((res) => res.json())
      .then((res) => renderizarCodigosBandeja(res, contenedor))
      .catch((err) => {
        contenedor.innerHTML = `<div style="text-align: center; color: var(--ios-red); padding: 20px; font-weight: bold;">❌ Error de conexión con el servidor MySQL.</div>`;
      });
  }
};

// 🎨 DIBUJAR TARJETAS DE CÓDIGOS
function renderizarCodigosBandeja(res, contenedor) {
  if (res && res.status === "success" && res.data) {
    if (res.data.length === 0) {
      contenedor.innerHTML =
        '<div style="text-align: center; color: var(--text-secondary); padding: 50px 20px; font-weight: 600;">📭 No hay códigos activos en los últimos 15 minutos.</div>';
      return;
    }

    let html = "";
    res.data.forEach((item) => {
      let safeCopiedText = encodeURIComponent(item.copiadoRapido || "").replace(
        /'/g,
        "%27",
      );
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
    contenedor.innerHTML = `<div style="text-align: center; color: var(--ios-red); padding: 20px; font-weight: bold;">Error al obtener los códigos.</div>`;
  }
}

// 🔄 FUNCIÓN PARA EL BOTÓN REFRESCAR EN EL HTML
window.refrescarCodigosModal = function () {
  if (typeof haptic === "function") haptic();
  window.cargarBandejaCodigosMySQL(true);
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
