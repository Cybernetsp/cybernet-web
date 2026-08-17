/* ==========================================================================
   🔔 CYBERNET OS - MÓDULO DE RECORDATORIOS DE PAGO (recordatorios.js)
   ========================================================================== */

window.URL_API_RECORDATORIOS =
  "https://api.cybernetsp.com/obtener_recordatorios.php";

window.memoriaRecordatoriosW1 = [];
window.memoriaRecordatoriosW2 = [];

window.periodoPrevioW1 = null;
window.periodoPrevioW2 = null;

// =========================================================================
// 🔑 GESTIÓN DE PERSISTENCIA Y TACHADOS POR USUARIO Y PERIODO
// =========================================================================
window.obtenerClaveUsuarioRecordatorios = function () {
  const userObj = JSON.parse(sessionStorage.getItem("usuario_activo") || "{}");
  return (
    userObj.nombre ||
    sessionStorage.getItem("active_staff") ||
    "ANONIMO"
  ).toUpperCase();
};

window.obtenerCopiadosSet = function () {
  const u = window.obtenerClaveUsuarioRecordatorios();
  try {
    return JSON.parse(sessionStorage.getItem(`rec_copiados_${u}`) || "[]");
  } catch (e) {
    return [];
  }
};

window.guardarItemCopiado = function (claveItem) {
  const u = window.obtenerClaveUsuarioRecordatorios();
  let list = window.obtenerCopiadosSet();
  if (!list.includes(claveItem)) {
    list.push(claveItem);
    sessionStorage.setItem(`rec_copiados_${u}`, JSON.stringify(list));
  }
};

window.limpiarCopiadosPorCanalYPeriodo = function (canal, periodo) {
  const u = window.obtenerClaveUsuarioRecordatorios();
  let list = window.obtenerCopiadosSet();
  const prefix = `${canal}_${periodo}_`;
  list = list.filter((k) => !k.startsWith(prefix));
  sessionStorage.setItem(`rec_copiados_${u}`, JSON.stringify(list));
};

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

    window.sincronizarW1();
    window.sincronizarW2();
  }
};

// =========================================================================
// 🔄 CONSULTA AUTO-SINCRONIZADA A PHP (WHATSAPP 1)
// =========================================================================
window.sincronizarW1 = function () {
  const selectPeriodo = document.getElementById("periodoW1");
  const periodoVal = selectPeriodo ? selectPeriodo.value : "hoy";
  const contador = document.getElementById("contadorW1");
  const listaContenedor = document.getElementById("listaIndividualW1");
  const bloquesContenedor = document.getElementById("bloquesW1");

  // Destachar si se seleccionó otra fecha/periodo
  if (window.periodoPrevioW1 && window.periodoPrevioW1 !== periodoVal) {
    window.limpiarCopiadosPorCanalYPeriodo("W1", window.periodoPrevioW1);
    window.limpiarCopiadosPorCanalYPeriodo("W1", periodoVal);
  }
  window.periodoPrevioW1 = periodoVal;

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
          listaContenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #ff453a; font-weight: 700;">No se encontraron registros.</div>`;
        }
        if (bloquesContenedor) bloquesContenedor.innerHTML = "";
      }
    })
    .catch((err) => {
      console.error("Error en W1:", err);
      if (contador) contador.innerText = "Error";
      if (listaContenedor) {
        listaContenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #ff453a; font-weight: 700;">Error de conexión al servidor MySQL.</div>`;
      }
    });
};

// =========================================================================
// 🔄 CONSULTA AUTO-SINCRONIZADA A PHP (WHATSAPP 2)
// =========================================================================
window.sincronizarW2 = function () {
  const selectPeriodo = document.getElementById("periodoW2");
  const periodoVal = selectPeriodo ? selectPeriodo.value : "tres_dias";
  const contador = document.getElementById("contadorW2");
  const listaContenedor = document.getElementById("listaIndividualW2");
  const bloquesContenedor = document.getElementById("bloquesW2");

  // Destachar si se seleccionó otra fecha/periodo
  if (window.periodoPrevioW2 && window.periodoPrevioW2 !== periodoVal) {
    window.limpiarCopiadosPorCanalYPeriodo("W2", window.periodoPrevioW2);
    window.limpiarCopiadosPorCanalYPeriodo("W2", periodoVal);
  }
  window.periodoPrevioW2 = periodoVal;

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
          listaContenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #ff453a; font-weight: 700;">No se encontraron registros.</div>`;
        }
        if (bloquesContenedor) bloquesContenedor.innerHTML = "";
      }
    })
    .catch((err) => {
      console.error("Error en W2:", err);
      if (contador) contador.innerText = "Error";
      if (listaContenedor) {
        listaContenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #ff453a; font-weight: 700;">Error de conexión al servidor MySQL.</div>`;
      }
    });
};

// =========================================================================
// 🎨 RENDERIZADO TIPO PÍLDORA NUMERADA Y BLOQUES ENUMERADOS DE MÁX 20
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
  const selectPeriodo = document.getElementById(
    esW1 ? "periodoW1" : "periodoW2",
  );
  const periodoVal = selectPeriodo ? selectPeriodo.value : "";

  if (!listaContenedor) return;

  if (!listaData || listaData.length === 0) {
    listaContenedor.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 35px 20px; color: #a1a1aa; font-weight: 600; background: rgba(255, 255, 255, 0.02); border-radius: 16px; border: 1px dashed rgba(255, 255, 255, 0.08);">
        No hay clientes pendientes de recordatorio en esta fecha.
      </div>`;
    if (bloquesContenedor) bloquesContenedor.innerHTML = "";
    return;
  }

  // 1. GENERACIÓN DE BOTONES POR BLOQUES ENUMERADOS (MÁXIMO 20 POR BOTÓN)
  if (bloquesContenedor) {
    let htmlBloques = "";
    const tamanoBloque = 20;
    const totalItems = listaData.length;

    for (let i = 0; i < totalItems; i += tamanoBloque) {
      const numBloque = Math.floor(i / tamanoBloque) + 1;
      const inicio = i + 1;
      const fin = Math.min(i + tamanoBloque, totalItems);

      htmlBloques += `
        <button type="button" 
                onclick="window.copiarBloqueRecordatorio('${canal}', ${i}, ${fin}, this)" 
                style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.12); color: #ffffff; padding: 9px 12px; border-radius: 12px; font-weight: 800; font-size: 0.78rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.2);"
                onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.borderColor='rgba(255,255,255,0.25)';"
                onmouseout="this.style.background='rgba(255,255,255,0.04)'; this.style.borderColor='rgba(255,255,255,0.12)';">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Bloque ${numBloque} (${inicio}-${fin})
        </button>`;
    }

    bloquesContenedor.innerHTML = htmlBloques;
  }

  // 2. RENDERIZAR TARJETAS CON MEMORIA DE TACHADO PERSISTENTE
  const copiadosSet = window.obtenerCopiadosSet();
  let htmlCards = "";

  listaData.forEach((item, idx) => {
    const msjEscapado = encodeURIComponent(item.mensaje || "").replace(
      /'/g,
      "%27",
    );
    const nombreOIdentificador =
      item.user && item.user !== "CLIENTE CYBERNET" ? item.user : item.tel;

    const itemKey = `${canal}_${periodoVal}_${item.tel}_${item.user || ""}_${idx}`;
    const estaCopiado = copiadosSet.includes(itemKey);

    const styleTachado = estaCopiado
      ? "opacity: 0.45; text-decoration: line-through; filter: grayscale(0.6);"
      : "";

    htmlCards += `
      <div class="pill-recordatorio-item" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; transition: all 0.2s ease; ${styleTachado}" onmouseover="this.style.background='rgba(255, 255, 255, 0.055)';" onmouseout="this.style.background='rgba(255, 255, 255, 0.03)';">
        
        <!-- Índice Numerado -->
        <div style="width: 28px; height: 26px; border-radius: 50%; background: rgba(255, 255, 255, 0.08); color: #a1a1aa; font-weight: 900; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          ${idx + 1}
        </div>

        <!-- Identificador / Teléfono -->
        <div style="display: flex; flex-direction: column; flex: 1; overflow: hidden;">
          <span class="txt-identificador" style="font-weight: 800; font-size: 0.88rem; color: #ffffff; font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${nombreOIdentificador}
          </span>
          ${item.user && item.user !== "CLIENTE CYBERNET" ? `<span style="font-size: 0.72rem; color: #a1a1aa; font-family: monospace;">${item.tel}</span>` : ""}
        </div>

        <!-- Botón SVG de Copiado Directo -->
        <button type="button" 
                onclick="window.copiarMensajeRecordatorio(this, '${msjEscapado}', '${itemKey}')" 
                title="Copiar mensaje de recordatorio"
                style="background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12); color: #ffffff; width: 34px; height: 34px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s ease;"
                onmouseover="this.style.background='rgba(10, 132, 255, 0.25)'; this.style.borderColor='rgba(10, 132, 255, 0.4)';"
                onmouseout="this.style.background='rgba(255, 255, 255, 0.06)'; this.style.borderColor='rgba(255, 255, 255, 0.12)';">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>

      </div>`;
  });

  listaContenedor.innerHTML = htmlCards;
};

// =========================================================================
// 📋 COPIADO INDIVIDUAL CON PERSISTENCIA Y TACHADO DE FILA
// =========================================================================
window.copiarMensajeRecordatorio = function (btn, msjEscapado, itemKey) {
  if (typeof haptic === "function") haptic();

  let mensaje = "";
  try {
    mensaje = decodeURIComponent(msjEscapado);
  } catch (errDec) {
    mensaje = msjEscapado;
  }

  const animarExito = () => {
    let oldHtml = btn.innerHTML;
    let oldBg = btn.style.background;

    btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#30d158" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    btn.style.setProperty("background", "rgba(48, 209, 88, 0.2)", "important");

    // 🎯 TACHADO Y PERSISTENCIA
    const pillParent = btn.closest(".pill-recordatorio-item");
    if (pillParent) {
      pillParent.style.opacity = "0.45";
      pillParent.style.textDecoration = "line-through";
      pillParent.style.filter = "grayscale(0.6)";
    }

    if (itemKey) {
      window.guardarItemCopiado(itemKey);
    }

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Mensaje copiado al portapapeles</span></div>`,
      );
    }

    setTimeout(() => {
      btn.innerHTML = oldHtml;
      btn.style.background = oldBg;
    }, 1500);
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(mensaje)
      .then(animarExito)
      .catch(() => usarFallbackCopiadoRecordatorio(mensaje, animarExito));
  } else {
    usarFallbackCopiadoRecordatorio(mensaje, animarExito);
  }
};

// 🛠️ FUNCIÓN DE RESPALDO UNIVERSAL PARA NAVEGADORES QUE BLOQUEAN EL PORTAPAPELES
function usarFallbackCopiadoRecordatorio(texto, callbackExito) {
  const textarea = document.createElement("textarea");
  textarea.value = texto;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
    if (callbackExito) callbackExito();
  } catch (err) {
    alert("Tu navegador bloqueó la copia automática.");
  }
  document.body.removeChild(textarea);
}

// =========================================================================
// 📋 COPIAR BLOQUE CON ENUMERACIÓN DE RANGO (EJ. 21 TO 40)
// =========================================================================
window.copiarBloqueRecordatorio = function (
  canal,
  inicioIdx,
  finIdx,
  btnElement,
) {
  if (typeof haptic === "function") haptic();

  const dataList =
    canal === "W1"
      ? window.memoriaRecordatoriosW1
      : window.memoriaRecordatoriosW2;
  if (!dataList || dataList.length === 0) return;

  const subLista = dataList.slice(inicioIdx, finIdx);

  // 🎯 FORMATO ENUMERADO SEGÚN EL RANGO DEL BLOQUE: 21. wa.me/57XXXXXXXXXX
  const textoEnlaces = subLista
    .map((item, idx) => {
      let telRaw = String(item.tel || "").replace(/\D/g, "");
      if (telRaw.length === 10) {
        telRaw = "57" + telRaw;
      }
      const numeroGlobal = inicioIdx + idx + 1;
      return `${numeroGlobal}. wa.me/${telRaw}`;
    })
    .join("\n");

  const animarExitoBloque = () => {
    if (btnElement) {
      let oldHtml = btnElement.innerHTML;
      btnElement.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#30d158" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡Copiados!`;
      btnElement.style.setProperty(
        "background",
        "rgba(48, 209, 88, 0.2)",
        "important",
      );
      btnElement.style.setProperty("color", "#30d158", "important");

      setTimeout(() => {
        btnElement.innerHTML = oldHtml;
        btnElement.style.setProperty(
          "background",
          "rgba(255, 255, 255, 0.04)",
          "important",
        );
        btnElement.style.setProperty("color", "#ffffff", "important");
      }, 1500);
    }

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Bloque copiado (${subLista.length} enlaces enumerados)</span></div>`,
      );
    }
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(textoEnlaces)
      .then(animarExitoBloque)
      .catch(() =>
        usarFallbackCopiadoRecordatorio(textoEnlaces, animarExitoBloque),
      );
  } else {
    usarFallbackCopiadoRecordatorio(textoEnlaces, animarExitoBloque);
  }
};
