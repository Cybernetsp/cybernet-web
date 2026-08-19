/* ==========================================================================
   ⚙️ CYBERNET OS - OPERACIONES Y BASE DE DATOS ESPECIAL (operaciones_db.js)
   ========================================================================== */

/* ==========================================================================
   🍿 MÓDULO DE NETFLIX: CORTES OPERATIVOS
   ========================================================================== */

const oldToggleNetflixManagerPanel = window.toggleNetflixManagerPanel;
window.toggleNetflixManagerPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("netflixManagerOverlay");

  if (!overlay) {
    window.crearModalNetflixManagerHTML();
    return window.toggleNetflixManagerPanel();
  }

  if (overlay.classList.contains("open") || overlay.style.display === "flex") {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    if (typeof cerrarTodasLasVentanas === "function") cerrarTodasLasVentanas();
    overlay.style.display = "flex";
    overlay.classList.add("open");
    window.cargarCortesOperativosNetflix();
  }
};

window.cargarCortesOperativosNetflix = function () {
  const container = document.getElementById("listaCortesOperativosNetflix");
  const btnCrearAlias = document.getElementById("btnCrearAliasHeader");
  if (!container) return;

  if (btnCrearAlias) btnCrearAlias.style.display = "flex";

  container.innerHTML = `
    <div style="text-align: center; padding: 45px 20px; color: #e50914; display: flex; flex-direction: column; align-items: center; gap: 12px;">
      <svg class="spin-anim" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      </svg>
      <span style="font-weight: 800; font-size: 0.95rem;">Escaneando cortes pendientes...</span>
    </div>`;

  const formData = new FormData();
  formData.append("accion", "obtener_cortes_netflix");

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      if (res && res.status === "success") {
        window.renderizarTarjetasCortesNetflix(res.data);
      } else {
        window.mostrarEstadoSinCortes();
      }
    })
    .catch((err) => {
      console.error(err);
      container.innerHTML = `<div style="text-align: center; color: #ff453a; font-weight: 800; padding: 30px;">❌ Error conectando con el servidor.</div>`;
    });
};

window.mostrarEstadoSinCortes = function () {
  const container = document.getElementById("listaCortesOperativosNetflix");
  const btnCrearAlias = document.getElementById("btnCrearAliasHeader");

  if (btnCrearAlias) btnCrearAlias.style.display = "flex";

  container.innerHTML = `
    <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px dashed rgba(255,255,255,0.08);">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#30d158" stroke-width="2" style="margin-bottom: 12px;">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <div style="color: #ffffff; font-weight: 800; font-size: 1.05rem;">¡Todo al día!</div>
      <div style="color: #a1a1aa; font-size: 0.85rem; margin-top: 6px;">No hay cuentas pendientes por corte.</div>
    </div>`;
};

// 🗓️ HELPER DE LECTURA DE VENCIMIENTO Y CONVERSIÓN A TIMESTAMP
function parsearFechaCorteMs(fStr) {
  if (!fStr || fStr === "-" || fStr === "N/A") return 9999999999999;
  if (fStr instanceof Date) return fStr.getTime();

  let str = String(fStr).trim().toUpperCase();
  let hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (str.includes("ANTEAYER") || str.includes("ANTES DE AYER")) {
    return hoy.getTime() - 2 * 86400000;
  }
  if (str.includes("AYER")) {
    return hoy.getTime() - 86400000;
  }
  if (str.includes("HOY")) {
    return hoy.getTime();
  }

  // Decodifica formatos como "18DEAGOSTO", "18 DE AGOSTO", "18-AGOSTO"
  let limpia = str
    .replace(/(\d+)\s*DE\s*/gi, "$1 ")
    .replace(/(\d+)DE/gi, "$1 ")
    .replace(/[\/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const mesesAbrev = [
    "ENE",
    "FEB",
    "MAR",
    "ABR",
    "MAY",
    "JUN",
    "JUL",
    "AGO",
    "SEP",
    "OCT",
    "NOV",
    "DIC",
  ];
  const mesesCompletos = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];

  let matchDiaMes = limpia.match(/^(\d{1,2})\s*([A-Z]+)(?:\s*(\d{2,4}))?/);

  if (matchDiaMes) {
    let dia = parseInt(matchDiaMes[1], 10);
    let mesStr = matchDiaMes[2];
    let anio = matchDiaMes[3]
      ? parseInt(matchDiaMes[3], 10)
      : hoy.getFullYear();
    if (anio < 100) anio += 2000;

    let mesIdx = -1;
    if (/^\d{1,2}$/.test(mesStr)) {
      mesIdx = parseInt(mesStr, 10) - 1;
    } else {
      mesIdx = mesesAbrev.findIndex((m) => mesStr.startsWith(m));
      if (mesIdx === -1) {
        mesIdx = mesesCompletos.findIndex((m) => mesStr.startsWith(m));
      }
    }

    if (!isNaN(dia) && mesIdx >= 0 && mesIdx <= 11) {
      return new Date(anio, mesIdx, dia).getTime();
    }
  }

  let d = new Date(fStr);
  return isNaN(d.getTime()) ? 9999999999999 : d.getTime();
}

window.renderizarTarjetasCortesNetflix = function (cuentas) {
  const container = document.getElementById("listaCortesOperativosNetflix");
  const btnCrearAlias = document.getElementById("btnCrearAliasHeader");
  if (!container) return;

  if (btnCrearAlias) btnCrearAlias.style.display = "flex";

  if (!cuentas || cuentas.length === 0) {
    window.mostrarEstadoSinCortes();
    return;
  }

  // 1. Extraer el vencimiento real desde las propiedades devueltas por MySQL
  cuentas.forEach((c) => {
    let rawVenc =
      c.vencimiento ||
      c.venc ||
      c.fecha_vencimiento ||
      c.fecha_corte ||
      c.dia ||
      c.fecha ||
      "";
    c._tsVenc = parsearFechaCorteMs(rawVenc);
    c._vencTexto = rawVenc && rawVenc !== "-" ? rawVenc : "Sin Fecha";
  });

  // 2. Encontrar el día de vencimiento más antiguo pendiente
  let minTs = Math.min(...cuentas.map((c) => c._tsVenc));

  // 3. Filtrar estrictamente solo las cuentas del lote del día más antiguo
  let cuentasLoteActual = [];
  if (minTs === 9999999999999) {
    cuentasLoteActual = cuentas;
  } else {
    let dMin = new Date(minTs);
    cuentasLoteActual = cuentas.filter((c) => {
      if (c._tsVenc === 9999999999999) return false;
      let dC = new Date(c._tsVenc);
      return (
        dC.getFullYear() === dMin.getFullYear() &&
        dC.getMonth() === dMin.getMonth() &&
        dC.getDate() === dMin.getDate()
      );
    });
  }

  let fechaCabeceraTexto = cuentasLoteActual[0]
    ? cuentasLoteActual[0]._vencTexto
    : "Pendientes";

  let html = `
    <!-- Encabezado de Lote por Fecha Más Antigua -->
    <div style="background: rgba(255, 69, 58, 0.12); border: 1px solid rgba(255, 69, 58, 0.3); border-radius: 12px; padding: 10px 14px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
      <span style="font-size: 0.78rem; font-weight: 800; color: #ff453a; text-transform: uppercase;">
        🚨 Lote Prioritario: ${fechaCabeceraTexto}
      </span>
      <span style="font-size: 0.75rem; color: #a1a1aa; font-weight: 700; font-family: monospace;">
        Mostrando ${cuentasLoteActual.length} de ${cuentas.length}
      </span>
    </div>
  `;

  cuentasLoteActual.forEach((cuenta) => {
    let correo = cuenta.correo || "Sin correo";
    let claveVieja = cuenta.clave_actual || cuenta.clave || "fuego41@@";
    let claveNueva = cuenta.clave_nueva || window.generarClaveTVAleatoria();
    let perfiles = cuenta.perfiles_afectados || "1, 2, 3, 4, 5";
    let idCuenta = cuenta.id || "";
    let vencimientoVer = cuenta._vencTexto;

    html += `
      <div style="background: #2a2a2e; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 16px; position: relative; margin-bottom: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.4); transition: all 0.2s ease;">
          
          <!-- Efecto Glow Rojo Superior -->
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #ff3b30, transparent); box-shadow: 0 0 12px #ff3b30; opacity: 0.7;"></div>

          <!-- Correo y Badge Vencimiento -->
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-bottom: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <div 
                onclick="copiarTextoLigero('${correo}', this, 'correo')"
                title="Clic para copiar correo"
                style="display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1; overflow: hidden;"
              >
                  <div style="width: 8px; height: 8px; border-radius: 50%; background: #ff3b30; box-shadow: 0 0 6px #ff3b30; flex-shrink: 0;"></div>
                  <span style="font-family: monospace; font-weight: 800; color: #ffffff; font-size: 1.05rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${correo}</span>
              </div>
              <span style="background: rgba(255, 159, 10, 0.15); border: 1px solid rgba(255, 159, 10, 0.3); color: #ff9f0a; padding: 4px 10px; border-radius: 8px; font-weight: 800; font-size: 0.75rem; white-space: nowrap; flex-shrink: 0;">
                  📅 Vence: ${vencimientoVer}
              </span>
          </div>

          <!-- Bloque de Claves -->
          <div style="display: grid; grid-template-columns: 1fr 1.3fr; gap: 12px; align-items: stretch;">
              
              <!-- Clave Vencida -->
              <div 
                onclick="copiarTextoLigero('${claveVieja}', this, 'clave')"
                title="Clic para copiar"
                style="flex: 1; background: #161618; border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; justify-content: center; gap: 4px; cursor: pointer; border: 1px solid transparent; transition: background 0.2s;"
                onmouseover="this.style.background='rgba(255,255,255,0.03)'" 
                onmouseout="this.style.background='#161618'"
              >
                  <span style="font-size: 0.65rem; color: #a1a1aa; font-weight: 800; text-transform: uppercase;">CLAVE VENCIDA</span>
                  <span style="font-family: monospace; color: #ff3b30; font-weight: 700; font-size: 0.95rem; text-decoration: line-through;">${claveVieja}</span>
              </div>

              <!-- Nueva Clave TV -->
              <div 
                onclick="copiarTextoLigero('${claveNueva}', this, 'clave')"
                title="Clic para copiar"
                style="flex: 1.2; background: #2f3631; border: 1px solid rgba(48, 209, 88, 0.4); border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; justify-content: center; gap: 4px; cursor: pointer; transition: background 0.2s;"
                onmouseover="this.style.background='rgba(48, 209, 88, 0.15)'" 
                onmouseout="this.style.background='#2f3631'"
              >
                  <span style="font-size: 0.65rem; color: #30d158; font-weight: 800; text-transform: uppercase;">NUEVA CLAVE TV</span>
                  <span style="font-family: monospace; color: #ffffff; font-weight: 800; font-size: 1.1rem;">${claveNueva}</span>
              </div>
          </div>

          <!-- Perfiles y Botón de Acción -->
          <div style="display: flex; flex-direction: column; gap: 14px;">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 700; color: #ff3b30; background: rgba(255, 59, 48, 0.1); padding: 8px 16px; border-radius: 8px; width: fit-content; border: 1px solid rgba(255, 59, 48, 0.2);">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Perfiles a cortar: ${perfiles}
              </div>
              
              <button onclick="window.ejecutarProcesoCorteExterno('${idCuenta}', '${correo}', '${claveNueva}', this)" style="width: 100%; background: #e50914; color: #ffffff; border: none; padding: 14px; border-radius: 10px; font-weight: 800; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.1s;">
                  ✓ Procesar Corte y Subir a Hoy
              </button>
          </div>
      </div>`;
  });

  container.innerHTML = html;
};

// Función auxiliar visual de copiado
window.copiarTextoLigero = function (texto, elemento, tipo) {
  if (typeof haptic === "function") haptic();

  navigator.clipboard.writeText(texto).then(() => {
    const spanValor =
      tipo === "correo"
        ? elemento.querySelector("span")
        : elemento.querySelectorAll("span")[1];

    const originalText = spanValor.innerText;
    const originalColor = spanValor.style.color;

    spanValor.innerText = "✓ Copiado";
    spanValor.style.color = "#30d158";

    const oldBg = elemento.style.background;
    elemento.style.background = "rgba(48, 209, 88, 0.1)";
    elemento.style.borderColor = "rgba(48, 209, 88, 0.4)";

    setTimeout(() => {
      spanValor.innerText = originalText;
      spanValor.style.color = originalColor;
      elemento.style.background = oldBg;
      elemento.style.borderColor = "";
    }, 1200);
  });
};

window.generarClaveTVAleatoria = function () {
  const palabras = [
    "nova",
    "plata",
    "fuego",
    "cable",
    "sol",
    "muno",
    "delta",
    "cyber",
    "astro",
    "neon",
  ];
  const num = Math.floor(Math.random() * 90) + 10;
  const palabra = palabras[Math.floor(Math.random() * palabras.length)];
  return `${palabra}${num}@@`;
};

// Generación de Modal HTML
window.crearModalNetflixManagerHTML = function () {
  if (document.getElementById("netflixManagerOverlay")) return;

  const modalHtml = `
    <div class="overlay-ios" id="netflixManagerOverlay" style="display: none; z-index: 16000; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(14px); align-items: center; justify-content: center;">
      <div class="sheet-ios" onclick="event.stopPropagation()" style="max-width: 480px; width: 92%; max-height: 88vh; background: #1a1a1c; border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 22px; box-shadow: 0 30px 70px rgba(0,0,0,0.9); display: flex; flex-direction: column; gap: 16px; overflow: hidden; margin: auto;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 14px; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="color: #e50914; display: flex; align-items: center; justify-content: center;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
            </div>
            <h3 style="margin: 0; color: #e50914; font-size: 1.15rem; font-weight: 800;">Cortes Operativos</h3>
          </div>
          <button type="button" onclick="window.toggleNetflixManagerPanel()" style="background: rgba(255,255,255,0.08); border: none; color: #a1a1aa; width: 32px; height: 32px; border-radius: 50%; cursor: pointer;">✕</button>
        </div>

        <div style="display: flex; flex-direction: column; flex-shrink: 0;">
          <button id="btnCrearAliasHeader" onclick="window.crearCuentaNetflixAliasExterna()" style="display: flex; width: 100%; background: #e50914; color: #ffffff; border: none; padding: 14px; border-radius: 12px; font-weight: 800; font-size: 0.9rem; cursor: pointer; align-items: center; justify-content: center; gap: 8px; margin-bottom: 10px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Crear cuenta de Netflix (Usar Alias)
          </button>
        </div>

        <div id="listaCortesOperativosNetflix" class="cyber-custom-scroll" style="flex: 1; overflow-y: auto; padding-right: 4px;">
          <div style="text-align: center; color: #a1a1aa; padding: 30px;">Cargando cortes...</div>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
};

/* ==========================================================================
   🔄 LÓGICA DE PROCESAMIENTO Y VENTANA FINAL DE CORTE NETFLIX
   ========================================================================== */

window.ejecutarProcesoCorteExterno = function (
  idCuenta,
  correo,
  claveNueva,
  btn,
) {
  if (typeof haptic === "function") haptic();

  if (
    !confirm(
      `¿Confirmas procesar el corte para la cuenta:\n${correo}?\n\nSe actualizará la contraseña a: ${claveNueva} y la fecha al día de HOY.`,
    )
  ) {
    return;
  }

  const originalContent = btn.innerHTML;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `⏳ Procesando corte...`;
  }

  const formData = new FormData();
  formData.append("accion", "procesar_corte_netflix");
  formData.append("correo", correo);
  formData.append("clave_nueva", claveNueva);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.text())
    .then((text) => {
      let res;
      try {
        res = JSON.parse(text);
      } catch (e) {
        alert(
          "❌ Error PHP:\n\n" + (text.trim() || "El servidor respondió vacío."),
        );
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalContent;
        }
        return;
      }

      if (res && res.status === "success") {
        if (typeof triggerToast === "function")
          triggerToast(`✅ Corte procesado con éxito.`);
        window.cargarCortesOperativosNetflix();
        if (typeof window.cargarDatosMySQL === "function")
          window.cargarDatosMySQL();
        window.mostrarModalResumenCorteNetflix(res);
      } else {
        alert(
          "❌ Error: " + (res ? res.message : "No se pudo procesar el corte."),
        );
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalContent;
        }
      }
    })
    .catch((err) => {
      console.error(err);
      alert("❌ Error de conexión al servidor.");
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalContent;
      }
    });
};

window.mostrarModalResumenCorteNetflix = function (data) {
  const oldModal = document.getElementById("modalResumenCorteNetflix");
  if (oldModal) oldModal.remove();

  const correo = data.correo || "";
  const claveNueva = data.clave_nueva || "";
  const perfiles = data.perfiles || [];

  const enlacesWaMeArr = [];
  let itemsHtml = "";

  perfiles.forEach((p) => {
    const numRaw = (p.numero || "").trim();
    let numSoloDigitos = numRaw.replace(/\D/g, "");

    if (numSoloDigitos.length === 10) numSoloDigitos = "57" + numSoloDigitos;
    const tieneNumeroValido = numSoloDigitos.length >= 10;

    if (!tieneNumeroValido) return;

    const waLink = `https://wa.me/${numSoloDigitos}`;
    enlacesWaMeArr.push(`wa.me/${numSoloDigitos}`);

    const tieneNombreReal =
      p.cliente &&
      p.cliente.trim() !== "" &&
      p.cliente.trim().toLowerCase() !== "sin nombre";
    const clienteDisplay = tieneNombreReal ? p.cliente.trim() : "";
    const saludoNombre = clienteDisplay
      ? ` *¡Hola ${clienteDisplay}!*`
      : " *¡Hola!*";

    const mensajeWA = `🌟${saludoNombre}\n\nTu cuenta de *NETFLIX PREMIUM* ha sido actualizada por cambio de clave / mantenimiento ✅\n\n⚠️ *Para iniciar sesión:* Cuando te pida un código, selecciona *Obtener ayuda* y después *Usar contraseña*.\n\n🎬 *NUEVOS DATOS DE ACCESO* 🔐\n────────────────────\n📧 *Correo:* ${correo}\n🔑 *Contraseña:* ${claveNueva}\n👤 *Perfil:* ${p.perfil}\n📍 *PIN:* ${p.pin || "-"}\n📅 *Vence:* ${p.vencimiento || "-"}\n\n🤖 *¿NECESITAS UN CÓDIGO?* Puedes usar nuestra pagina para codigos disponible 24/7: www.cybernetsp.com/\n\n✨ *¡Gracias por tu confianza!* ✨`;
    const msjEscapado = encodeURIComponent(mensajeWA);
    const numeroTextoMostrar =
      numRaw && numRaw !== "-" ? numRaw : numSoloDigitos;

    itemsHtml += `
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="background: rgba(229, 9, 20, 0.2); color: #e50914; border: 1px solid rgba(229, 9, 20, 0.4); border-radius: 8px; padding: 2px 10px; font-weight: 800; font-size: 0.78rem;">PERFIL ${p.perfil}</span>
            ${clienteDisplay ? `<span style="color: #ffffff; font-weight: 700; font-size: 0.88rem;">${clienteDisplay}</span>` : ""}
          </div>
          <span style="color: #a1a1aa; font-size: 0.75rem; font-family: monospace;">PIN: ${p.pin || "-"}</span>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0, 0, 0, 0.3); padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.05);">
          <div style="display: flex; align-items: center; gap: 6px; overflow: hidden;">
            <span style="font-size: 0.8rem; color: #30d158;">📱</span>
            <a href="${waLink}" target="_blank" style="color: #30d158; font-family: monospace; font-weight: 800; font-size: 0.85rem; text-decoration: none;" title="Abrir chat en WhatsApp">${numeroTextoMostrar}</a>
          </div>

          <button onclick="window.copiarMensajeCorteWhatsApp(this, '${msjEscapado}')" style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;" title="Copiar mensaje de WhatsApp para este cliente">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar Mensaje
          </button>
        </div>
      </div>
    `;
  });

  const textoTodosNumeros = enlacesWaMeArr
    .map((link, idx) => `${idx + 1}. ${link}`)
    .join("\n");
  const todosNumEscapados = encodeURIComponent(textoTodosNumeros);

  if (enlacesWaMeArr.length === 0) {
    itemsHtml = `<div style="text-align: center; padding: 30px 15px; color: #a1a1aa; font-weight: 600; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.08);">📭 No hay perfiles con número telefónico registrado en esta cuenta.</div>`;
  }

  const modalHtml = `
    <div class="overlay-ios open" id="modalResumenCorteNetflix" style="display: flex !important; z-index: 999999 !important; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(14px); align-items: center; justify-content: center;">
      <div class="modal-ios" style="max-width: 500px; width: 92%; max-height: 90vh; background: #141417; border: 1px solid rgba(48, 209, 88, 0.3); border-radius: 26px; padding: 22px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 25px 60px rgba(0,0,0,0.9); overflow: hidden;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div>
              <h3 style="margin: 0; color: #ffffff; font-size: 1.1rem; font-weight: 800;">Corte Procesado</h3>
              <span style="color: #a1a1aa; font-size: 0.72rem; font-family: monospace;">${correo}</span>
            </div>
          </div>
          <button type="button" onclick="document.getElementById('modalResumenCorteNetflix').remove()" style="background: rgba(255,255,255,0.08); border: none; color: #a1a1aa; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;">✕</button>
        </div>

        <button onclick="window.copiarTodosLosNumerosCorte(this, '${todosNumEscapados}')" style="width: 100%; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; padding: 12px; border-radius: 14px; font-weight: 800; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; flex-shrink: 0;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copiar todos los números (${enlacesWaMeArr.length})
        </button>

        <div style="display: flex; flex-direction: column; gap: 10px; overflow-y: auto; flex-grow: 1;">
          ${itemsHtml}
        </div>

        <button onclick="document.getElementById('modalResumenCorteNetflix').remove()" style="width: 100%; background: #30d158; color: #000000; border: none; padding: 12px; border-radius: 14px; font-weight: 900; font-size: 0.88rem; cursor: pointer; flex-shrink: 0;">
          Entendido / Cerrar Ventana
        </button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
};

window.copiarMensajeCorteWhatsApp = function (btn, msjEscapado) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(msjEscapado);

  navigator.clipboard.writeText(texto).then(() => {
    const oldHtml = btn.innerHTML;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡Copiado!`;
    btn.style.setProperty("background", "#30d158", "important");
    btn.style.setProperty("color", "#000000", "important");

    if (typeof triggerToast === "function")
      triggerToast(`📋 Mensaje copiado al portapapeles.`);

    setTimeout(() => {
      btn.innerHTML = oldHtml;
      btn.style.setProperty(
        "background",
        "rgba(48, 209, 88, 0.15)",
        "important",
      );
      btn.style.setProperty("color", "#30d158", "important");
    }, 1500);
  });
};

window.copiarTodosLosNumerosCorte = function (btn, todosEscapados) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(todosEscapados);

  if (!texto || texto.trim() === "") {
    alert("⚠️ No hay números registrados en esta cuenta.");
    return;
  }

  navigator.clipboard.writeText(texto).then(() => {
    const oldHtml = btn.innerHTML;
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡Números Copiados!`;
    btn.style.setProperty("background", "#30d158", "important");
    btn.style.setProperty("color", "#000000", "important");

    if (typeof triggerToast === "function")
      triggerToast(`📋 Lista de números copiada.`);

    setTimeout(() => {
      btn.innerHTML = oldHtml;
      btn.style.setProperty(
        "background",
        "rgba(255, 255, 255, 0.08)",
        "important",
      );
      btn.style.setProperty("color", "#ffffff", "important");
    }, 1500);
  });
};

window.crearCuentaNetflixAliasExterna = function () {
  if (typeof window.crearCuentaNetflixAlias === "function") {
    window.crearCuentaNetflixAlias();
  } else {
    alert(
      "La función de crear alias externo no está vinculada. Asegúrate de tener crear_net.js",
    );
  }
};

/* ==========================================================================
   📥 MÓDULO DE CARGA MASIVA DE CUENTAS EN LOTE (PERSISTENTE EN EL TURNO)
   ========================================================================== */

try {
  window.cuentasCargadasEsteTurno = JSON.parse(
    localStorage.getItem("cyber_cargadas_turno") || "[]",
  );
} catch (e) {
  window.cuentasCargadasEsteTurno = [];
}

window.guardarCargadasTurnoCache = function () {
  localStorage.setItem(
    "cyber_cargadas_turno",
    JSON.stringify(window.cuentasCargadasEsteTurno),
  );
};

const oldToggleCargarPanel = window.toggleCargarPanel;
window.toggleCargarPanel = function () {
  if (typeof haptic === "function") haptic();
  const panel = document.getElementById("cargarOverlay");
  if (!panel) return;

  if (panel.classList.contains("open") || panel.style.display === "flex") {
    panel.classList.remove("open");
    panel.style.display = "none";
  } else {
    if (typeof cerrarTodasLasVentanas === "function") cerrarTodasLasVentanas();
    panel.classList.add("open");
    panel.style.display = "flex";
    panel.style.alignItems = "center";
    panel.style.justifyContent = "center";
    window.cargarStockSelectCargas();
    window.renderizarCargadasEsteTurno();
  }
};

window.plataformasCargaMap = [
  { id: "netflix", nombre: "🔴 NETFLIX", keys: ["NETFLIX", "netflix"] },
  {
    id: "amazon_prime_video",
    nombre: "📦 AMAZON PRIME VIDEO",
    keys: [
      "AMAZON PRIME VIDEO",
      "AMAZON-PRIME-VIDEO",
      "amazon_prime_video",
      "AMAZON",
    ],
  },
  {
    id: "disney_premium",
    nombre: "🔵 DISNEY PREMIUM",
    keys: ["DISNEY PREMIUM", "DISNEY-PREMIUM", "disney_premium"],
  },
  {
    id: "disney_estandar",
    nombre: "🔵 DISNEY ESTANDAR",
    keys: ["DISNEY ESTANDAR", "DISNEY-ESTANDAR", "disney_estandar"],
  },
  {
    id: "hbo_max",
    nombre: "🟣 HBO MAX (MAX)",
    keys: ["HBO MAX", "HBO-MAX", "hbo_max", "MAX"],
  },
  {
    id: "crunchyroll",
    nombre: "📺 CRUNCHYROLL",
    keys: ["CRUNCHYROLL", "crunchyroll"],
  },
  { id: "metegol", nombre: "📺 METEGOL", keys: ["METEGOL", "metegol"] },
  {
    id: "universal",
    nombre: "📺 UNIVERSAL+",
    keys: ["UNIVERSAL", "universal"],
  },
  { id: "deezer", nombre: "🎵 DEEZER", keys: ["DEEZER", "deezer"] },
  { id: "spotify", nombre: "🎵 SPOTIFY", keys: ["SPOTIFY", "spotify"] },
  { id: "canva", nombre: "💻 CANVA PRO", keys: ["CANVA", "canva"] },
  { id: "capcut", nombre: "💻 CAPCUT", keys: ["CAPCUT", "capcut"] },
  { id: "vix", nombre: "📺 VIX", keys: ["VIX", "vix"] },
  { id: "plex", nombre: "📺 PLEX", keys: ["PLEX", "plex"] },
  {
    id: "apple",
    nombre: "📺 APPLE TV+",
    keys: ["APPLE TV+", "APPLE-TV", "apple", "APPLE"],
  },
  {
    id: "paramount",
    nombre: "📺 PARAMOUNT+",
    keys: ["PARAMOUNT+", "PARAMOUNT", "paramount"],
  },
  { id: "mubi", nombre: "📺 MUBI", keys: ["MUBI", "mubi"] },
  { id: "youtube", nombre: "📺 YOUTUBE PREMIUM", keys: ["YOUTUBE", "youtube"] },
  { id: "iptv", nombre: "📺 IPTV SMARTERS", keys: ["IPTV", "iptv"] },
  { id: "flujo", nombre: "📺 FLUJO TV", keys: ["FLUJO TV", "FLUJO", "flujo"] },
  {
    id: "directv_go",
    nombre: "📺 DIRECTV GO (DGO)",
    keys: ["DIRECTV GO (DGO)", "DIRECTV GO", "DIRECTV-GO", "directv_go"],
  },
  { id: "emby", nombre: "📺 EMBY", keys: ["EMBY", "emby"] },
];

window.cargarStockSelectCargas = function () {
  const selectPlat = document.getElementById("loadPlataforma");
  if (!selectPlat) return;

  const formData = new FormData();
  formData.append("accion", "obtener_stock_plataformas");

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      let stock = res && res.status === "success" ? res.stock || {} : {};
      let html =
        '<option value="" disabled selected>Selecciona Plataforma...</option>';

      window.plataformasCargaMap.forEach((p) => {
        let cant = 0;
        for (let k of p.keys) {
          if (stock[k] !== undefined) {
            cant = stock[k];
            break;
          }
        }
        html += `<option value="${p.id}">${p.nombre} (${cant} libres)</option>`;
      });

      selectPlat.innerHTML = html;
    })
    .catch(() => {
      let html =
        '<option value="" disabled selected>Selecciona Plataforma...</option>';
      window.plataformasCargaMap.forEach((p) => {
        html += `<option value="${p.id}">${p.nombre}</option>`;
      });
      selectPlat.innerHTML = html;
    });
};

window.comprobarProveedorDinamico = function () {
  const selectProv = document.getElementById("loadProveedor").value;
  const wrapperManual = document.getElementById("wrapperProveedorManual");
  const inputManual = document.getElementById("loadProveedorManual");

  if (selectProv === "OTRO") {
    wrapperManual.style.setProperty("display", "flex", "important");
    inputManual.required = true;
    setTimeout(() => inputManual.focus(), 100);
  } else {
    wrapperManual.style.setProperty("display", "none", "important");
    inputManual.required = false;
    inputManual.value = "";
  }
};

window.ejecutarCargaLote = function (e) {
  e.preventDefault();
  if (typeof haptic === "function") haptic();

  const btnSubmit = document.getElementById("btnSubmitCarga");
  const selectPlat = document.getElementById("loadPlataforma");
  const plataforma = selectPlat.value;

  const optionPlat = selectPlat.options[selectPlat.selectedIndex];
  const nombrePlataformaLegible = optionPlat
    ? optionPlat.text
        .split("(")[0]
        .replace(/🔴|📦|🔵|🟣|📺|🎵|💻/g, "")
        .trim()
    : plataforma.toUpperCase();

  const selectProv = document.getElementById("loadProveedor").value;
  const proveedorManual = document
    .getElementById("loadProveedorManual")
    .value.trim();
  const bloqueCuentas = document.getElementById("loadCuentasBloque").value;

  const proveedorFinal = selectProv === "OTRO" ? proveedorManual : selectProv;

  if (!plataforma) {
    alert("⚠️ Por favor selecciona una plataforma.");
    return;
  }

  if (selectProv === "OTRO" && proveedorFinal === "") {
    alert("⚠️ Por favor escribe el nombre del nuevo proveedor.");
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:8px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Cargando en MySQL...`;

  const formData = new FormData();
  formData.append("accion", "agregar");
  formData.append("tabla", plataforma);
  formData.append("proveedor", proveedorFinal);
  formData.append("bloque_cuentas", bloqueCuentas);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      btnSubmit.disabled = false;
      btnSubmit.innerText = "CARGAR CUENTAS EN LOTE";

      if (
        res &&
        (res.status === "success" || res.status === "repetidas_unicas")
      ) {
        if (res.insertados > 0 && typeof triggerToast === "function") {
          triggerToast(`✅ ${res.message}`);
        }

        if (res.cargadas && res.cargadas.length > 0) {
          res.cargadas.forEach((c) => {
            c.plataforma = c.plataforma || nombrePlataformaLegible;
            c.proveedor = c.proveedor || proveedorFinal;
            c.tabla = plataforma;
            window.cuentasCargadasEsteTurno.unshift(c);
          });
          window.guardarCargadasTurnoCache();
        }

        if (res.repetidas && res.repetidas.length > 0) {
          window.mostrarModalRepetidasCybernet(res.repetidas);
        }

        document.getElementById("loadCuentasBloque").value = "";
        document.getElementById("formCargarCuentas").reset();
        const wrapperManual = document.getElementById("wrapperProveedorManual");
        if (wrapperManual) wrapperManual.style.display = "none";

        window.renderizarCargadasEsteTurno();
        window.cargarStockSelectCargas();
        if (typeof cargarDatosMySQL === "function") cargarDatosMySQL();
      } else {
        alert(
          "❌ Error: " + (res ? res.message : "Fallo al procesar la carga."),
        );
      }
    })
    .catch((err) => {
      console.error(err);
      btnSubmit.disabled = false;
      btnSubmit.innerText = "CARGAR CUENTAS EN LOTE";
      alert("❌ Error de comunicación con el servidor MySQL.");
    });
};

window.renderizarCargadasEsteTurno = function () {
  const container = document.getElementById("contenedorCargadasTurno");
  const badgeCant = document.getElementById("cantCargadasTurno");
  if (!container) return;

  if (badgeCant) {
    badgeCant.innerText = `${window.cuentasCargadasEsteTurno.length} cuentas`;
  }

  if (window.cuentasCargadasEsteTurno.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 25px; color: #a1a1aa; font-size: 0.82rem; background: rgba(0, 0, 0, 0.2); border-radius: 14px; border: 1px dashed rgba(255, 255, 255, 0.08);">
        Las cuentas inyectadas se reflejarán aquí con accesos rápidos.
      </div>
    `;
    return;
  }

  let html = "";
  window.cuentasCargadasEsteTurno.forEach((c) => {
    const correoEsc = encodeURIComponent(c.correo || "");
    const claveEsc = encodeURIComponent(c.clave || "");
    const provEsc = encodeURIComponent(c.proveedor || "");
    const tablaEsc = encodeURIComponent(c.tabla || c.plataforma || "netflix");
    const idVal = c.id || 0;

    const platNombre = (c.plataforma || "PLATAFORMA")
      .toUpperCase()
      .replace(/_/g, " ");
    const provNombre = (c.proveedor || "PROVEEDOR").toUpperCase();

    html += `
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
        <div style="display: flex; flex-direction: column; gap: 4px; overflow: hidden; flex-grow: 1;">
          
          <!-- Badges de Plataforma y Proveedor -->
          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            <span style="background: rgba(10, 132, 255, 0.15); border: 1px solid rgba(10, 132, 255, 0.3); color: #0a84ff; padding: 2px 7px; border-radius: 6px; font-weight: 800; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.3px;">
              ${platNombre}
            </span>
            <span style="background: rgba(255, 159, 10, 0.15); border: 1px solid rgba(255, 159, 10, 0.3); color: #ff9f0a; padding: 2px 7px; border-radius: 6px; font-weight: 800; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.3px;">
              PROV: ${provNombre}
            </span>
          </div>

          <span style="color: #ffffff; font-weight: 800; font-family: monospace; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">
            ${c.correo || "-"}
          </span>
          <span style="color: #30d158; font-weight: 700; font-family: monospace; font-size: 0.82rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${c.clave || "-"}
          </span>
        </div>

        <div style="display: flex; gap: 6px; flex-shrink: 0; align-items: center;">
          <button onclick="window.copiarTextoUnico(this, '${correoEsc}')" style="background: rgba(10, 132, 255, 0.15); border: 1px solid rgba(10, 132, 255, 0.3); color: #0a84ff; padding: 6px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer;">
            Correo
          </button>
          <button onclick="window.copiarTextoUnico(this, '${claveEsc}')" style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; padding: 6px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer;">
            Clave
          </button>
          <button onclick="window.reportarCuentaCargadaDirecto('${idVal}', '${tablaEsc}', '${correoEsc}', '${claveEsc}', '${provEsc}')" style="background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.3); color: #ff453a; padding: 6px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; cursor: pointer; white-space: nowrap;">
            🚨 Reportar
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
};

// 🚨 ACCIÓN DIRECTA DE REPORTAR DESDE LA VISTA DE CUENTAS CARGADAS EN LOTE
window.reportarCuentaCargadaDirecto = function (
  id,
  tablaEsc,
  correoEsc,
  claveEsc,
  provEsc,
) {
  if (
    !confirm(
      "⚠️ ¿Estás seguro de enviar esta cuenta a Garantías? Toda la cuenta se marcará como caída (rojo).",
    )
  )
    return;
  if (typeof haptic === "function") haptic();

  const tabla = decodeURIComponent(tablaEsc);
  const correo = decodeURIComponent(correoEsc);
  const clave = decodeURIComponent(claveEsc);
  const prov = decodeURIComponent(provEsc);

  let platNorm = tabla.toUpperCase().replace(/_/g, "-");
  let textoReporte = `🚨 *REPORTE DE PROBLEMA*\n📺 *Plataforma:* ${platNorm}\n📧 *Correo:* ${correo}\n🔑 *Clave:* ${clave}\n👤 *Proveedor:* ${prov}\n📅 *Fecha Compra:* HOY`;

  navigator.clipboard.writeText(textoReporte).then(() => {
    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>¡Reporte copiado al portapapeles!</span></div>`,
      );
    }
  });

  const formData = new FormData();
  formData.append("accion", "reportar_garantia");
  formData.append("tabla", tabla);
  formData.append("id", id);
  formData.append("correo", correo);
  formData.append("clave", clave);
  formData.append("proveedor", prov);
  formData.append("fecha_compra", "hoy");

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        if (typeof window.cargarDatosMySQL === "function")
          window.cargarDatosMySQL();
      } else {
        alert("❌ Error: " + data.message);
      }
    })
    .catch((err) => alert("❌ Error de comunicación: " + err.message));
};

window.mostrarModalRepetidasCybernet = function (repetidasArray) {
  if (typeof haptic === "function") haptic();

  const oldModal = document.getElementById("modalRepetidasOverlay");
  if (oldModal) oldModal.remove();

  if (!repetidasArray || repetidasArray.length === 0) return;

  let itemsHtml = "";
  repetidasArray.forEach((cuenta) => {
    const correo = cuenta.correo || "Correo no especificado";
    const fecha = cuenta.fecha || "Sin fecha registrada";

    itemsHtml += `
      <div style="background: rgba(255, 159, 10, 0.05); border: 1px solid rgba(255, 159, 10, 0.25); border-left: 4px solid #ff9f0a; border-radius: 14px; padding: 12px 14px; display: flex; flex-direction: column; gap: 4px;">
        <span style="font-family: monospace; font-size: 0.9rem; font-weight: 800; color: #ffffff; word-break: break-all;">${correo}</span>
        <div style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #a1a1aa;">
          <span>📅 Se adquirió/cargó el:</span>
          <b style="color: #ff9f0a; font-weight: 800;">${fecha}</b>
        </div>
      </div>
    `;
  });

  const modalHtml = `
    <div class="overlay-ios open" id="modalRepetidasOverlay" style="display: flex !important; z-index: 999999 !important; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(14px); align-items: center; justify-content: center;">
      <div class="modal-ios" style="max-width: 460px; width: 92%; max-height: 85vh; background: #141417; border: 1px solid rgba(255, 159, 10, 0.4); border-radius: 26px; padding: 22px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 25px 60px rgba(0,0,0,0.9); overflow: hidden;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: rgba(255, 159, 10, 0.15); color: #ff9f0a; width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255, 159, 10, 0.3);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div>
              <h3 style="margin: 0; color: #ffffff; font-size: 1.05rem; font-weight: 800;">Cuentas Repetidas (${repetidasArray.length})</h3>
              <span style="color: #a1a1aa; font-size: 0.72rem;">Omitidas para no duplicar en MySQL</span>
            </div>
          </div>
          <button type="button" onclick="document.getElementById('modalRepetidasOverlay').remove()" style="background: rgba(255,255,255,0.08); border: none; color: #a1a1aa; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;">✕</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; overflow-y: auto; flex-grow: 1;">
          ${itemsHtml}
        </div>

        <button onclick="document.getElementById('modalRepetidasOverlay').remove()" style="width: 100%; background: #ff9f0a; color: #000000; border: none; padding: 12px; border-radius: 14px; font-weight: 900; font-size: 0.88rem; cursor: pointer; flex-shrink: 0;">
          Entendido / Cerrar Ventana
        </button>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
};

/* ==========================================================================
   🚫 MÓDULO DE SUSPENDIDAS (PINESMES) & NEYOP (GOOGLE APPS SCRIPT)
   ========================================================================== */

window.memoriaSuspendidas = window.memoriaSuspendidas || [];
window.memoriaNeyop = window.memoriaNeyop || [];
window.vistaModalDb = window.vistaModalDb || "PINESMES";

const oldToggleSuspendidasPanel = window.toggleSuspendidasPanel;
window.toggleSuspendidasPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("suspendidasOverlay");
  if (!overlay) return;

  overlay.classList.toggle("open");

  if (overlay.classList.contains("open")) {
    if (typeof window.CyberSonidos !== "undefined")
      window.CyberSonidos.play("abrir");
    window.vistaModalDb = "PINESMES";
    window.cargarSuspendidas(true);
  } else {
    if (typeof window.CyberSonidos !== "undefined")
      window.CyberSonidos.play("cerrar");
  }
};

window.refrescarVistaActualModal = function () {
  if (typeof haptic === "function") haptic();
  if (window.vistaModalDb === "NEYOP") {
    window.cargarNeyop(true);
  } else {
    window.cargarSuspendidas(true);
  }
};

window.manejarInputBusquedaSuspendidas = function () {
  const input = document.getElementById("inputBuscarSuspendidas");
  const btnBorrar = document.getElementById("btnBorrarBusquedaSuspendidas");

  if (input && btnBorrar) {
    btnBorrar.style.display = input.value.length > 0 ? "block" : "none";
  }

  if (window.vistaModalDb === "NEYOP") {
    window.renderizarTablaNeyop();
  } else {
    window.renderizarTablaSuspendidas();
  }
};

window.borrarBusquedaSuspendidas = function () {
  if (typeof haptic === "function") haptic();
  const input = document.getElementById("inputBuscarSuspendidas");
  const btnBorrar = document.getElementById("btnBorrarBusquedaSuspendidas");

  if (input) {
    input.value = "";
    input.focus();
  }
  if (btnBorrar) btnBorrar.style.display = "none";

  if (window.vistaModalDb === "NEYOP") {
    window.renderizarTablaNeyop();
  } else {
    window.renderizarTablaSuspendidas();
  }
};

window.cargarSuspendidas = function (forzar = false) {
  const contenedor = document.getElementById("contenedorTablaSuspendidas");
  const iconRefrescar = document.getElementById("iconRefrescarSuspendidas");
  if (!contenedor) return;

  if (forzar && iconRefrescar) {
    iconRefrescar.classList.add("spin-anim");
  } else if (!forzar && window.memoriaSuspendidas.length === 0) {
    contenedor.innerHTML = `
      <div style="padding: 60px; text-align: center; color: #8e8e93;">
        <svg class="spin-anim" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg>
        <h3 style="margin-top: 15px; font-size: 1rem;">Descargando Base de Datos...</h3>
      </div>
    `;
  }

  const cbName = "cb_susp_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (iconRefrescar) iconRefrescar.classList.remove("spin-anim");

    if (res && res.status === "success") {
      window.memoriaSuspendidas = res.data;
      if (window.vistaModalDb === "PINESMES")
        window.renderizarTablaSuspendidas();

      if (forzar && typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"></path></svg> <span>Base de datos actualizada en vivo.</span></div>`,
        );
      }
    } else {
      if (window.vistaModalDb === "PINESMES") {
        contenedor.innerHTML = `<div style="color:#ff453a; text-align:center; padding:40px; font-weight:bold;">❌ Error de conexión: ${res ? res.message : "Desconocido"}</div>`;
      }
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerDatosPinesMes&forzar=${forzar}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.estadoRadarSuspendidas = window.estadoRadarSuspendidas || {};
window.radaresSuspendidas = window.radaresSuspendidas || {};

window.copiarCorreoYBuscarVerificacion = function (btn, correo, filaIndex) {
  if (typeof haptic === "function") haptic();
  const originalHTML = btn.innerHTML;

  navigator.clipboard
    .writeText(correo)
    .then(() => {
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ios-green)" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      setTimeout(() => {
        btn.innerHTML = originalHTML;
      }, 1500);
    })
    .catch(() => {
      const txt = document.createElement("textarea");
      txt.value = correo;
      document.body.appendChild(txt);
      txt.select();
      document.execCommand("copy");
      txt.remove();
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ios-green)" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      setTimeout(() => {
        btn.innerHTML = originalHTML;
      }, 1500);
    });

  window.iniciarRadarSuspendidas(correo, filaIndex);
};

window.iniciarRadarSuspendidas = function (correoTarget, filaIndex) {
  window.estadoRadarSuspendidas[filaIndex] = { status: "buscando" };

  const btnVerificar = document.getElementById(`btnVerificar_${filaIndex}`);
  const btnActivar = document.getElementById(`btnActivar_${filaIndex}`);

  if (btnVerificar) {
    btnVerificar.style.display = "inline-flex";
    btnVerificar.style.background = "rgba(48, 209, 88, 0.15)";
    btnVerificar.style.color = "var(--ios-green)";
    btnVerificar.style.border = "1px solid rgba(48, 209, 88, 0.3)";
    btnVerificar.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Buscando...`;
    btnVerificar.removeAttribute("href");
    btnVerificar.removeAttribute("target");
    btnVerificar.onclick = null;
  }

  if (btnActivar) btnActivar.style.display = "none";

  if (window.radaresSuspendidas[filaIndex]) {
    clearInterval(window.radaresSuspendidas[filaIndex]);
  }

  window.radaresSuspendidas[filaIndex] = setInterval(function () {
    const cbRadarName = "cb_radar_susp_" + filaIndex + "_" + Date.now();

    window[cbRadarName] = function (res) {
      const node = document.getElementById("node_" + cbRadarName);
      if (node) node.remove();
      delete window[cbRadarName];

      if (res && res.status === "success" && res.link) {
        clearInterval(window.radaresSuspendidas[filaIndex]);

        window.estadoRadarSuspendidas[filaIndex] = {
          status: "encontrado",
          link: res.link,
        };

        if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");

        const currentBtnVerificar = document.getElementById(
          `btnVerificar_${filaIndex}`,
        );
        const currentBtnActivar = document.getElementById(
          `btnActivar_${filaIndex}`,
        );

        if (currentBtnVerificar) {
          currentBtnVerificar.href = res.link;
          currentBtnVerificar.target = "_blank";
          currentBtnVerificar.className = "btn-ios btn-success";
          currentBtnVerificar.style.background = "";
          currentBtnVerificar.style.color = "";
          currentBtnVerificar.style.borderColor = "transparent";
          currentBtnVerificar.style.padding = "6px 14px";
          currentBtnVerificar.innerHTML = `✉️ Verificar`;

          currentBtnVerificar.onclick = function () {
            if (currentBtnActivar) {
              currentBtnActivar.style.display = "flex";
              if (typeof haptic === "function") haptic();
            }
          };
        }
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbRadarName;
    script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerLinkVerificacion&correo=${encodeURIComponent(correoTarget)}&callback=${cbRadarName}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  }, 4000);
};

window.ejecutarActivarTodasDinamico = function (btn) {
  if (typeof haptic === "function") haptic();
  let idsValidos = [];
  let botonesActivar = document.querySelectorAll('[id^="btnActivar_"]');

  botonesActivar.forEach((b) => {
    if (b.style.display !== "none") {
      let idFila = b.id.split("_")[1];
      idsValidos.push(idFila);
    }
  });

  if (idsValidos.length === 0) {
    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-orange);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> <span>No hay cuentas verificadas o listas para activar.</span></div>`,
      );
    } else {
      alert("No hay cuentas verificadas o de Recarga 2+ listas para activar.");
    }
    return;
  }

  window.activarMultiplesCuentasSuspendidas(idsValidos.join(","), btn);
};

window.renderizarTablaSuspendidas = function () {
  const contenedor = document.getElementById("contenedorTablaSuspendidas");
  const inputBuscador = document.getElementById("inputBuscarSuspendidas");
  if (!contenedor) return;

  const texto = inputBuscador ? inputBuscador.value.toLowerCase().trim() : "";
  let filtrados = window.memoriaSuspendidas;

  if (texto.length >= 2) {
    let textoLimpioNum = texto.replace(/\D/g, "");
    let esPosibleTelefono = textoLimpioNum.length >= 4 && !texto.includes("@");

    filtrados = window.memoriaSuspendidas.filter(
      (c) =>
        (c.correo || "").toLowerCase().includes(texto) ||
        (c.pin || "").toLowerCase().includes(texto) ||
        (c.clave || "").toLowerCase().includes(texto) ||
        (c.cliente || "").toLowerCase().includes(texto) ||
        (esPosibleTelefono && (c.telefono || "").includes(textoLimpioNum)),
    );
  }

  const hoyObj = new Date();
  const mesesAbrev = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];
  const fechaHoyCorta = hoyObj.getDate() + "-" + mesesAbrev[hoyObj.getMonth()];

  let htmlTabla = `
    <table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.85rem; color: #e4e4e7; text-align: left; white-space: nowrap;">
      <thead>
        <tr>
          <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #a1a1aa;">CORREO</th>
          <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #a1a1aa;">CONTRASEÑA</th>
          <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #8e8e93;">PIN REC.</th>
          <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #bf5af2;">RECARGA</th>
          <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #a1a1aa;">ACTIVACIÓN</th>
          <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #ff453a; text-align:center;">VENCIMIENTO</th>
          <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #a1a1aa;">CREADOR</th>
          <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #30d158; text-align:center;">VERIFICAR</th>
        </tr>
      </thead>
      <tbody>
  `;

  if (filtrados.length === 0) {
    htmlTabla += `<tr><td colspan="8" style="text-align:center; padding:40px; color:#ff453a; font-weight:bold;">No se encontraron resultados en la base de datos.</td></tr>`;
  } else {
    let ultimaFechaRenderizada = null;

    filtrados.forEach((cuenta, idx) => {
      const esFilaPar = idx % 2 === 0;
      const colorFondoFila = esFilaPar
        ? "rgba(255, 255, 255, 0.015)"
        : "transparent";

      const noTieneFecha =
        !cuenta.fechaActivacion || cuenta.fechaActivacion === "";
      const fechaGrupo = noTieneFecha
        ? `⏳ PENDIENTES (Hoy: ${fechaHoyCorta})`
        : cuenta.fechaActivacion;
      const esRecarga1 = String(cuenta.recarga || "").trim() === "1";
      const estadoRadar = window.estadoRadarSuspendidas[cuenta.filaIndex];

      if (fechaGrupo !== ultimaFechaRenderizada) {
        let botonActivarTodas = "";
        if (noTieneFecha) {
          botonActivarTodas = `<button onclick="window.ejecutarActivarTodasDinamico(this)" class="btn-ios btn-success" style="padding: 6px 14px; font-size: 0.75rem; border-radius: 8px; box-shadow: 0 4px 10px rgba(48, 209, 88, 0.25); display: flex; align-items: center; justify-content: center; gap: 6px; font-weight:800; margin: 0 auto; white-space: nowrap;">🚀 Activar Todas</button>`;
        }

        htmlTabla += `
          <tr style="background: rgba(142, 142, 147, 0.08);">
            <td colspan="6" style="padding: 8px 16px; border-top: 1px solid rgba(142, 142, 147, 0.15); border-bottom: 1px solid rgba(142, 142, 147, 0.15); color: #a1a1aa; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">
              📅 Cuentas del: ${fechaGrupo}
            </td>
            <td style="padding: 8px 16px; border-top: 1px solid rgba(142, 142, 147, 0.15); border-bottom: 1px solid rgba(142, 142, 147, 0.15); text-align: center;">
              ${botonActivarTodas}
            </td>
            <td style="padding: 8px 16px; border-top: 1px solid rgba(142, 142, 147, 0.15); border-bottom: 1px solid rgba(142, 142, 147, 0.15);"></td>
          </tr>
        `;
        ultimaFechaRenderizada = fechaGrupo;
      }

      const svgCopy = (dato, titulo) => {
        if (!dato || dato === "-") return "";
        const datoLimpio = String(dato).replace(/'/g, "\\'");
        return `
          <button onclick="window.copiarTextoUnico(this, '${datoLimpio}')" title="${titulo}" style="background: transparent; border: none; color: #71717a; cursor: pointer; padding: 2px 4px; display: inline-flex; align-items: center;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#71717a'">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
        `;
      };

      let textoActivacion = noTieneFecha
        ? `<span style="color:var(--ios-blue); font-style:italic;">${fechaHoyCorta}</span>`
        : cuenta.fechaActivacion;
      let botonOTextoVencimiento = cuenta.fechaVencimiento || "-";

      if (noTieneFecha) {
        let displayBtn = esRecarga1 ? "none" : "flex";
        botonOTextoVencimiento = `<button id="btnActivar_${cuenta.filaIndex}" onclick="window.activarCuentaSuspendida('${cuenta.filaIndex}', this)" class="btn-ios btn-success" style="display: ${displayBtn}; padding: 6px 14px; font-size: 0.75rem; border-radius: 8px; box-shadow: 0 4px 10px rgba(48, 209, 88, 0.25); align-items: center; justify-content: center; gap: 6px; font-weight:800; margin: 0 auto;">🚀 Activar</button>`;
      }

      let celdaPinContent = "";
      if (cuenta.pin && cuenta.pin.trim() !== "" && cuenta.pin !== "-") {
        celdaPinContent = `<div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;"><span>${cuenta.pin}</span>${svgCopy(cuenta.pin, "Copiar PIN")}</div>`;
      } else {
        celdaPinContent = `<div style="display: flex; align-items: center; justify-content: center;"><button onclick="window.extraerPinIndividual('${cuenta.correo}', this)" class="btn-ios" style="padding: 4px 8px; font-size: 0.7rem; border-radius: 6px; background: rgba(10, 132, 255, 0.1); color: var(--ios-blue); border: 1px solid rgba(10, 132, 255, 0.2); font-weight:700; display:flex; align-items:center; gap:4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg> PIN</button></div>`;
      }

      let botonCopiaCorreo = "";
      let celdaVerificarContent = "";

      if (esRecarga1 && noTieneFecha) {
        botonCopiaCorreo = `<button onclick="window.copiarCorreoYBuscarVerificacion(this, '${String(cuenta.correo).replace(/'/g, "\\'")}', '${cuenta.filaIndex}')" title="Copiar correo e iniciar verificación" style="background: transparent; border: none; color: #71717a; cursor: pointer; padding: 2px 4px; display: inline-flex; align-items: center;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#71717a'"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>`;

        if (estadoRadar && estadoRadar.status === "encontrado") {
          celdaVerificarContent = `<a id="btnVerificar_${cuenta.filaIndex}" href="${estadoRadar.link}" target="_blank" class="btn-ios btn-success" style="display: inline-flex; padding: 6px 14px; font-size: 0.8rem; border-radius: 10px; text-decoration: none; font-weight: 800; align-items: center; justify-content: center; gap: 6px; margin: 0 auto; border-color: transparent;" onclick="document.getElementById('btnActivar_${cuenta.filaIndex}').style.display='flex';">✉️ Verificar</a>`;
        } else if (estadoRadar && estadoRadar.status === "buscando") {
          celdaVerificarContent = `<a id="btnVerificar_${cuenta.filaIndex}" class="btn-ios" style="display: inline-flex; padding: 6px 14px; font-size: 0.8rem; border-radius: 10px; text-decoration: none; font-weight: 800; align-items: center; justify-content: center; gap: 6px; margin: 0 auto; background: rgba(48, 209, 88, 0.15); color: var(--ios-green); border: 1px solid rgba(48, 209, 88, 0.3);"><svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Buscando...</a>`;
        } else {
          celdaVerificarContent = `<a id="btnVerificar_${cuenta.filaIndex}" class="btn-ios" style="display: none; padding: 6px 14px; font-size: 0.8rem; border-radius: 10px; text-decoration: none; font-weight: 800; align-items: center; justify-content: center; gap: 6px; margin: 0 auto;"></a>`;
        }
      } else {
        botonCopiaCorreo = svgCopy(cuenta.correo, "Copiar correo");
        celdaVerificarContent = `<span style="color: var(--text-secondary); display: block; text-align: center;">-</span>`;
      }

      htmlTabla += `
        <tr style="background: ${colorFondoFila};">
          <td style="padding: 12px 16px; font-weight: 600; color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.03);"><div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;"><span>${cuenta.correo || "-"}</span>${botonCopiaCorreo}</div></td>
          <td style="padding: 12px 16px; color: #30d158; font-family: monospace; border-bottom: 1px solid rgba(255,255,255,0.03);"><div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;"><span>${cuenta.clave || "-"}</span>${svgCopy(cuenta.clave, "Copiar contraseña")}</div></td>
          <td style="padding: 12px 16px; color: #8e8e93; font-family: monospace; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.03);">${celdaPinContent}</td>
          <td style="padding: 12px 16px; color: #bf5af2; font-weight:800; border-bottom: 1px solid rgba(255,255,255,0.03);">${cuenta.recarga || "-"}</td>
          <td style="padding: 12px 16px; color: #a1a1aa; border-bottom: 1px solid rgba(255,255,255,0.03);">${textoActivacion}</td>
          <td style="padding: 8px 16px; color: #ff453a; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.03); text-align: center;">${botonOTextoVencimiento}</td>
          <td style="padding: 12px 16px; color: #a1a1aa; border-bottom: 1px solid rgba(255,255,255,0.03);">${cuenta.quienActivo || cuenta.quien_activo || "-"}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); text-align: center;">${celdaVerificarContent}</td>
        </tr>
      `;
    });
  }

  htmlTabla += `</tbody></table>`;
  contenedor.innerHTML = htmlTabla;
};

window.cambiarVistaModalDb = function (vista) {
  if (typeof haptic === "function") haptic();
  window.vistaModalDb = vista;

  const btnNeyop = document.getElementById("btnVistaNeyop");
  const btnSusp = document.getElementById("btnVistaSuspendidas");
  const grupoPines = document.getElementById("grupoBotonesPinesMes");
  const grupoNeyop = document.getElementById("grupoBotonesNeyop");
  const titulo = document.getElementById("tituloModalSuspendidas");

  const input = document.getElementById("inputBuscarSuspendidas");
  const btnBorrar = document.getElementById("btnBorrarBusquedaSuspendidas");
  if (input) input.value = "";
  if (btnBorrar) btnBorrar.style.display = "none";

  if (vista === "NEYOP") {
    if (btnNeyop) btnNeyop.style.display = "none";
    if (btnSusp) btnSusp.style.display = "flex";
    if (grupoPines) grupoPines.style.display = "none";
    if (grupoNeyop) grupoNeyop.style.display = "flex";
    if (titulo) titulo.innerHTML = "Base de Datos: NEYOP";

    if (!window.memoriaNeyop || window.memoriaNeyop.length === 0) {
      window.cargarNeyop();
    } else {
      window.renderizarTablaNeyop();
    }
  } else {
    if (btnNeyop) btnNeyop.style.display = "flex";
    if (btnSusp) btnSusp.style.display = "none";
    if (grupoPines) grupoPines.style.display = "flex";
    if (grupoNeyop) grupoNeyop.style.display = "none";
    if (titulo) titulo.innerHTML = "Base de Datos: Suspendidas";

    if (!window.memoriaSuspendidas || window.memoriaSuspendidas.length === 0) {
      window.cargarSuspendidas();
    } else {
      window.renderizarTablaSuspendidas();
    }
  }
};

window.cargarNeyop = function (forzar = false) {
  const container = document.getElementById("contenedorTablaSuspendidas");
  const iconRefrescar = document.getElementById("iconRefrescarSuspendidas");
  if (!container) return;

  if (forzar && iconRefrescar) {
    iconRefrescar.classList.add("spin-anim");
  } else if (
    !forzar &&
    (!window.memoriaNeyop || window.memoriaNeyop.length === 0)
  ) {
    container.innerHTML = `
      <div style="padding: 60px; text-align: center; color: #ff9f0a;">
        <svg class="spin-anim" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg>
        <h3 style="margin-top: 15px; font-size: 1rem;">Conectando a NEYOP en Google Sheets...</h3>
      </div>
    `;
  }

  const cbName = "cb_neyop_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (iconRefrescar) iconRefrescar.classList.remove("spin-anim");

    if (res && res.status === "success") {
      window.memoriaNeyop = res.data || [];
      if (window.vistaModalDb === "NEYOP") window.renderizarTablaNeyop();
      if (forzar && typeof triggerToast === "function")
        triggerToast("✅ NEYOP actualizado desde Sheets.");
    } else {
      if (window.vistaModalDb === "NEYOP") {
        container.innerHTML = `<div style="color:#ff453a; text-align:center; padding:40px; font-weight:bold;">❌ Error de conexión: ${res ? res.message : "Desconocido"}</div>`;
      }
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerDatosNeyop&forzar=${forzar}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.renderizarTablaNeyop = function () {
  const container = document.getElementById("contenedorTablaSuspendidas");
  const inputBuscador = document.getElementById("inputBuscarSuspendidas");
  if (!container) return;

  const texto = inputBuscador ? inputBuscador.value.toLowerCase().trim() : "";
  let filtrados = window.memoriaNeyop || [];

  if (texto.length >= 2) {
    filtrados = window.memoriaNeyop.filter((item) => {
      return (
        (item.yopmail || "").toLowerCase().includes(texto) ||
        (item.correo || "").toLowerCase().includes(texto) ||
        (item.claveVieja || item.clave_vieja || "")
          .toLowerCase()
          .includes(texto) ||
        (item.claveNueva || item.clave_nueva || "")
          .toLowerCase()
          .includes(texto)
      );
    });
  }

  filtrados.sort((a, b) => {
    let tieneCorreoA =
      a.correo && a.correo.trim() !== "" && a.correo.trim() !== "-" ? 1 : 0;
    let tieneCorreoB =
      b.correo && b.correo.trim() !== "" && b.correo.trim() !== "-" ? 1 : 0;
    return tieneCorreoB - tieneCorreoA;
  });

  let html = `<table style="width: 100% !important; border-collapse: collapse !important; font-size: 0.85rem !important; color: #e4e4e7 !important; text-align: left !important; white-space: nowrap !important; margin: 0 !important;">
    <thead style="position: sticky !important; top: 0 !important; z-index: 100 !important; background: #18181b !important;">
      <tr style="background: #18181b !important;">
        <th style="padding: 12px 14px !important; font-weight: 800 !important; color: #ff9f0a !important; border-bottom: 2px solid rgba(255,255,255,0.12) !important;">YOPMAIL</th>
        <th style="padding: 12px 14px !important; font-weight: 800 !important; color: #a1a1aa !important; border-bottom: 2px solid rgba(255,255,255,0.12) !important;">CORREO / CUENTA</th>
        <th style="padding: 12px 14px !important; font-weight: 800 !important; color: #a1a1aa !important; border-bottom: 2px solid rgba(255,255,255,0.12) !important;">CLAVE VIEJA</th>
        <th style="padding: 12px 14px !important; font-weight: 800 !important; color: #30d158 !important; border-bottom: 2px solid rgba(255,255,255,0.12) !important;">CLAVE NUEVA</th>
        <th style="padding: 12px 14px !important; font-weight: 800 !important; color: #ff9f0a !important; text-align: center !important; border-bottom: 2px solid rgba(255,255,255,0.12) !important;">ESTADO</th>
      </tr>
    </thead>
    <tbody>`;

  if (filtrados.length === 0) {
    html += `<tr><td colspan="5" style="text-align:center; padding:40px; color:#ff9f0a; font-weight:bold;">No se encontraron resultados en NEYOP.</td></tr>`;
  } else {
    filtrados.forEach((cuenta, idx) => {
      const estaListo = (cuenta.estado || "").toUpperCase() === "LISTO";
      const esFilaPar = idx % 2 === 0;

      let colorFondoFila = esFilaPar
        ? "rgba(255, 255, 255, 0.015)"
        : "transparent";
      let colorPrimario = "#ff9f0a";
      let colorBlanco = "#ffffff";
      let colorVerde = "#30d158";

      if (estaListo) {
        colorFondoFila = "rgba(255, 159, 10, 0.15)";
        colorPrimario = "#ffb74d";
        colorBlanco = "#ffb74d";
        colorVerde = "#ffb74d";
      }

      const cVieja = cuenta.claveVieja || cuenta.clave_vieja || "-";
      const cNueva = cuenta.claveNueva || cuenta.clave_nueva || "-";

      const yopEsc = encodeURIComponent(cuenta.yopmail || "");
      const corEsc = encodeURIComponent(cuenta.correo || "");
      const cvEsc = encodeURIComponent(cVieja);
      const cnEsc = encodeURIComponent(cNueva);

      const svgCopy = (datoEsc, titulo) => {
        if (!datoEsc || decodeURIComponent(datoEsc) === "-") return "";
        return `
          <button onclick="window.copiarDatoCargaIndividual(this, '${datoEsc}')" title="${titulo}" style="background: transparent; border: none; color: ${estaListo ? "#ffb74d" : "#71717a"}; cursor: pointer; padding: 2px 4px; display: inline-flex; align-items: center;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='${estaListo ? "#ffb74d" : "#71717a"}'">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
        `;
      };

      let botonAccion = "";
      if (estaListo) {
        botonAccion = `<span style="color: #ff9f0a; font-weight: 800; display:flex; align-items:center; justify-content: center; gap:4px; font-size: 0.8rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Completado</span>`;
      } else if (
        cuenta.correo &&
        cuenta.correo.trim() !== "" &&
        cuenta.correo.trim() !== "-"
      ) {
        botonAccion = `<button onclick="window.marcarListoNeyop('${cuenta.filaIndex || cuenta.id}', this)" class="btn-ios" style="padding: 8px 14px; font-size: 0.75rem; border-radius: 8px; margin: 0 auto; background: #ff9f0a; color: white; border: none; font-weight:800; display:flex; align-items:center; gap:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Listo</button>`;
      }

      html += `
        <tr style="background: ${colorFondoFila} !important; border-bottom: 1px solid rgba(255,255,255,0.03) !important;">
          <td style="padding: 10px 14px !important; font-weight: 700 !important; color: ${colorPrimario} !important;"><div style="display:flex; align-items:center; gap:8px;"><span>${cuenta.yopmail || "-"}</span>${svgCopy(yopEsc, "Copiar Yopmail")}</div></td>
          <td style="padding: 10px 14px !important; font-weight: 700 !important; color: ${colorBlanco} !important;"><div style="display:flex; align-items:center; gap:8px;"><span>${cuenta.correo || "-"}</span>${svgCopy(corEsc, "Copiar Correo")}</div></td>
          <td style="padding: 10px 14px !important; color: ${estaListo ? colorBlanco : "#a1a1aa"} !important; font-family: monospace !important;"><div style="display:flex; align-items:center; gap:8px;"><span>${cVieja}</span>${svgCopy(cvEsc, "Copiar Clave Vieja")}</div></td>
          <td style="padding: 10px 14px !important; color: ${colorVerde} !important; font-family: monospace !important; font-weight: 700 !important;"><div style="display:flex; align-items:center; gap:8px;"><span>${cNueva}</span>${svgCopy(cnEsc, "Copiar Clave Nueva")}</div></td>
          <td style="padding: 8px 16px !important; border-bottom: 1px solid rgba(255,255,255,0.03) !important; text-align: center !important;">${botonAccion}</td>
        </tr>
      `;
    });
  }

  html += `</tbody></table>`;
  contenedor.innerHTML = htmlTabla;
};

window.marcarListoNeyop = function (filaIndex, btnElement) {
  if (typeof haptic === "function") haptic();

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> ...`;
  btnElement.disabled = true;

  const cbName = "cb_listo_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      if (typeof triggerToast === "function")
        triggerToast(
          `<div style="color:var(--ios-green);">✅ Fila completada y pintada.</div>`,
        );
      window.cargarNeyop(true);
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de red"));
      btnElement.innerHTML = originalHTML;
      btnElement.disabled = false;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=marcarNeyopListo&filaIndex=${filaIndex}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.ejecutarFlujoPinesSuspendidas = function (btnElement) {
  if (typeof haptic === "function") haptic();

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Procesando...`;
  btnElement.disabled = true;

  const cbName = "cb_pines_flujo_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    btnElement.innerHTML = originalHTML;
    btnElement.disabled = false;

    if (res && res.status === "success") {
      if (typeof triggerToast === "function")
        triggerToast(
          `<div style="color:var(--ios-green);">✅ ${res.message}</div>`,
        );
      window.cargarSuspendidas(true);
    } else {
      alert(
        "❌ Error procesando pines: " +
          (res ? res.message : "Fallo de conexión"),
      );
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=procesarPinesSuspendidas&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.ejecutarTransferirRecarga = function (btnElement) {
  if (typeof haptic === "function") haptic();

  if (!confirm("¿Transferir a NEYOP las recargas PENDIENTES marcadas con '1'?"))
    return;

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Transfiriendo...`;
  btnElement.disabled = true;

  const cbName = "cb_transfer_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    btnElement.innerHTML = originalHTML;
    btnElement.disabled = false;

    if (res && res.status === "success") {
      if (typeof triggerToast === "function")
        triggerToast(
          `<div style="color:var(--ios-green);">✅ ${res.message}</div>`,
        );
      window.cargarNeyop(true);
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de conexión"));
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=transferirRecargasANeyop&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.activarMultiplesCuentasSuspendidas = function (indices, btnElement) {
  if (typeof haptic === "function") haptic();

  const count = indices.split(",").length;
  if (
    !confirm(
      `¿Estás seguro de activar las ${count} cuentas mostradas al mismo tiempo?`,
    )
  )
    return;

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Calculando...`;
  btnElement.disabled = true;

  const cbName = "cb_act_multi_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      if (typeof triggerToast === "function")
        triggerToast(
          `<div style="color:var(--ios-green);">✅ ${res.message}</div>`,
        );
      window.cargarSuspendidas(true);
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de red"));
      btnElement.innerHTML = originalHTML;
      btnElement.disabled = false;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=activarMultiplesPinesMes&filas=${indices}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.activarCuentaSuspendida = function (filaIndex, btnElement) {
  if (typeof haptic === "function") haptic();

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Calculando...`;
  btnElement.disabled = true;

  const cbName = "cb_activacion_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      if (typeof triggerToast === "function")
        triggerToast(
          `<div style="color:var(--ios-green);">✅ Cuenta activada.</div>`,
        );
      window.cargarSuspendidas(true);
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de red"));
      btnElement.innerHTML = originalHTML;
      btnElement.disabled = false;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=activarCuentaPinesMes&filaIndex=${filaIndex}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.extraerPinIndividual = function (correo, btnElement) {
  if (typeof haptic === "function") haptic();

  const userActivo =
    sessionStorage.getItem("active_staff") ||
    localStorage.getItem("cyber_saved_staff") ||
    "Desconocido";

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Buscando...`;
  btnElement.disabled = true;

  const cbName = "cb_pin_ind_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      if (typeof triggerToast === "function")
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"></path></svg> <span>PIN asignado por ${userActivo}</span></div>`,
        );
      window.cargarSuspendidas(true);
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de conexión."));
      btnElement.innerHTML = originalHTML;
      btnElement.disabled = false;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=procesarPinIndividualSuspendidas&correo=${encodeURIComponent(correo)}&user=${encodeURIComponent(userActivo)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};
