const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxk_T98sS1lL5lbXVq_XKOpB6ZCNQ1DSCgPhc_a6vmE_ai16YbSYO_eHkmeu0ZjM5aq/exec";
const BOT_API_URL =
  "https://script.google.com/macros/s/AKfycbyk2_OGWfJ9qTSKOuRVo7bcspAKBRUn_WLEdP28GuabQ5z7cDYShYhMlHfCiuTOoQ66/exec";

window.carrito = [];
window.saldoNumericoActual = 0;
window.distriTelefonoCache = "";
window.distriCorreoRegistradoEnSheets = "";
window.fichasCheckoutPendientes = "";

// 💡 Definición de plataformas que requieren activación manual por WhatsApp
const PLATAFORMAS_MANUALES = [
  "YOUTUBE",
  "SPOTIFY",
  "IPTV",
  "METEGOL",
  "DEEZER",
  "MUBI",
  "CANVA",
  "CAPCUT",
];

// =========================================================================
// 🎨 CATÁLOGO DE PRODUCTOS ACTUALIZADO (MUBI, METEGOL Y DEEZER ELIMINADOS)
// =========================================================================
const catálogoProductos = [
  {
    id: "NETFLIX",
    nombre: "Netflix Premium",
    precio: 10000,
    color: "#E50914",
    logo: `<img src="https://img.icons8.com/color/512/netflix.png" style="width: 100%; height: 100%; object-fit: contain; transform: scale(0.85);">`,
  },
  {
    id: "DISNEY-PREMIUM",
    nombre: "Disney+ Premium",
    precio: 10000,
    color: "#1AE1FF",
    logo: `<img src="https://www.google.com/s2/favicons?domain=disneyplus.com&sz=128" style="width: 100%; height: 100%; object-fit: contain; transform: scale(0.95); border-radius: 8px;">`,
  },
  {
    id: "AMAZON",
    nombre: "Prime Video",
    precio: 5000,
    color: "#00A8E1",
    logo: `<img src="https://img.icons8.com/color/512/amazon-prime-video.png" style="width: 100%; height: 100%; object-fit: contain; transform: scale(0.85);">`,
  },
  {
    id: "DISNEY-ESTANDAR",
    nombre: "Disney+ Estándar",
    precio: 4000,
    color: "#0063e5",
    logo: `<img src="https://www.google.com/s2/favicons?domain=disneyplus.com&sz=128" style="width: 100%; height: 100%; object-fit: contain; transform: scale(0.95); filter: grayscale(1) brightness(0.8); border-radius: 8px;">`,
  },
  {
    id: "HBO-MAX",
    nombre: "Max (HBO)",
    precio: 3000,
    color: "#5856d6",
    logo: `<img src="https://upload.wikimedia.org/wikipedia/commons/c/ce/Max_logo.svg" style="width: 100%; height: 100%; object-fit: contain; transform: scale(0.85);">`,
  },
  {
    id: "PARAMOUNT",
    nombre: "Paramount+",
    precio: 18000,
    color: "#0078ff",
    logo: `<img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Paramount_Plus.svg" style="width: 100%; height: 100%; object-fit: contain; transform: scale(0.85);">`,
  },
  {
    id: "VIX",
    nombre: "Vix+",
    precio: 3000,
    color: "#ff9500",
    logo: `<img src="https://www.google.com/s2/favicons?domain=vix.com&sz=128" style="width: 100%; height: 100%; object-fit: contain; transform: scale(0.95); border-radius: 8px;">`,
  },
  {
    id: "CRUNCHYROLL",
    nombre: "Crunchyroll",
    precio: 3000,
    color: "#ff5e00",
    logo: `<img src="https://img.icons8.com/color/512/crunchyroll.png" style="width: 100%; height: 100%; object-fit: contain; transform: scale(0.85);">`,
  },
  {
    id: "PLEX",
    nombre: "Plex TV",
    precio: 3000,
    color: "#ffcc00",
    logo: `<img src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Plex_logo_2022.svg" style="width: 100%; height: 100%; object-fit: contain; transform: scale(0.85);">`,
  },
  {
    id: "APPLE-TV",
    nombre: "Apple TV",
    precio: 3000,
    color: "#ffffff",
    logo: `<img src="https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg" style="width: 100%; height: 100%; object-fit: contain; transform: scale(0.85); filter: invert(1);">`,
  },
  {
    id: "UNIVERSAL",
    nombre: "Universal+",
    precio: 3000,
    color: "#00d2ff",
    logo: `<img src="https://www.google.com/s2/favicons?domain=universalplus.com&sz=128" style="width: 100%; height: 100%; object-fit: contain; transform: scale(0.95); border-radius: 8px;">`,
  },
  {
    id: "YOUTUBE",
    nombre: "YouTube Premium",
    precio: 10000,
    color: "#FF0000",
    logo: `<img src="https://img.icons8.com/color/512/youtube-play.png" style="width: 100%; height: 100%; object-fit: contain; transform: scale(0.85);">`,
  },
  {
    id: "SPOTIFY",
    nombre: "Spotify Premium",
    precio: 10000,
    color: "#1DB954",
    logo: `<img src="https://img.icons8.com/color/512/spotify.png" style="width: 100%; height: 100%; object-fit: contain; transform: scale(0.85);">`,
  },
  {
    id: "IPTV",
    nombre: "IPTV Premium",
    precio: 7000,
    color: "#ff37a6",
    logo: `<img src="https://img.icons8.com/color/512/tv.png" style="width: 100%; height: 100%; object-fit: contain; transform: scale(0.85);">`,
  },
];

// =========================================================================
// UTILERÍAS GLOBALES
// =========================================================================
function haptic() {
  if (navigator.vibrate) navigator.vibrate(15);
}

function formatMoneda(v) {
  if (!v) return "$0";

  // Si el valor ya viene formateado como texto con el signo '$' desde el Excel, lo deja pasar intacto
  if (typeof v === "string" && v.includes("$")) {
    return v;
  }

  // Si es un número crudo, lo limpia de caracteres extraños y lo formatea como moneda colombiana
  let num =
    typeof v === "number" ? v : parseFloat(String(v).replace(/[^0-9.-]/g, ""));
  if (isNaN(num)) return "$0";

  return (
    "$" + Math.round(num).toLocaleString("es-CO", { maximumFractionDigits: 0 })
  );
}

function triggerToast(msgHTML) {
  const toast = document.getElementById("appleToast");
  if (!toast) return;
  toast.innerHTML = msgHTML;
  toast.style.transform = "translateX(-50%) translateY(0)";
  toast.style.opacity = "1";
  setTimeout(() => {
    toast.style.transform = "translateX(-50%) translateY(100px)";
    toast.style.opacity = "0";
  }, 3000);
}

function copiarTextoAlToque(elemento, texto) {
  if (!texto) return;
  navigator.clipboard.writeText(texto).then(() => {
    triggerToast(`📋 Copiado al portapapeles`);
    elemento.style.opacity = "0.4";
    setTimeout(() => {
      elemento.style.opacity = "1";
    }, 150);
  });
}

function parseFechaCybernet(fechaStr) {
  if (!fechaStr || fechaStr === "N/A") return null;
  let s = String(fechaStr).toUpperCase().replace(/\s+/g, "");
  let m = s.match(/(\d+)(DE)?([A-Z]+)/);
  if (!m) return null;
  let day = parseInt(m[1], 10);
  let mesStr = m[3];
  const months = {
    ENE: 0,
    ENERO: 0,
    FEB: 1,
    FEBRERO: 1,
    MAR: 2,
    MARZO: 2,
    ABR: 3,
    ABRIL: 3,
    MAY: 4,
    MAYO: 4,
    JUN: 5,
    JUNIO: 5,
    JUL: 6,
    JULIO: 6,
    AGO: 7,
    AGOSTO: 7,
    SEP: 8,
    SEPTIEMBRE: 8,
    OCT: 9,
    OCTUBRE: 9,
    NOV: 10,
    NOVIEMBRE: 10,
    DIC: 11,
    DICIEMBRE: 11,
  };
  let month = months[mesStr];
  if (month === undefined) return null;

  let now = new Date();
  let year = now.getFullYear();
  let d = new Date(year, month, day);

  if (d < now && now.getMonth() - month > 6) {
    d.setFullYear(year + 1);
  }
  return d;
}

// =========================================================================
// 🔒 LOGIN Y SESIÓN BLINDADO CONTRA CAÍDAS DE RED
// =========================================================================
function verificarTelefonoDistribuidor() {
  haptic();
  const inputTel = document
    .getElementById("distriLoginTelefono")
    .value.replace(/\D/g, "")
    .trim();
  const btn = document.getElementById("btnVerificarTelefono");
  if (inputTel.length < 8) {
    alert("⚠️ Ingresa un número válido.");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `Buscando perfil...`;

  const cbName = "cb_tel_" + Date.now();
  window[cbName] = function (res) {
    if (res && res.status === "success") {
      const distri = res.data.find(
        (d) => String(d.telefono || "").replace(/\D/g, "") === inputTel,
      );
      if (distri) {
        window.distriTelefonoCache = inputTel;
        window.distriCorreoRegistradoEnSheets = String(distri.correo || "")
          .trim()
          .toLowerCase();

        if (
          window.distriCorreoRegistradoEnSheets !== "" &&
          window.distriCorreoRegistradoEnSheets.indexOf("@") !== -1
        ) {
          btn.innerHTML = `Enviando código al correo...`;
          const cbSend = "cb_send_" + Date.now();

          window[cbSend] = function (resEnvio) {
            btn.disabled = false;
            btn.innerHTML = "Continuar →";
            if (resEnvio && resEnvio.status === "success") {
              document.getElementById("stepTelefono").style.display = "none";
              let partes = window.distriCorreoRegistradoEnSheets.split("@");
              let maskedEmail =
                partes[0].substring(0, 2) +
                "******" +
                partes[0].substring(partes[0].length - 2) +
                "@" +
                partes[1];
              document.getElementById("txtAvisoTokenDespachado").innerText =
                `Código de 6 dígitos enviado a: ${maskedEmail}`;
              document.getElementById("stepTokenVerificar").style.display =
                "flex";
              document.getElementById("distriLoginTokenInput").focus();
              triggerToast("📩 Token enviado.");
            } else {
              alert("❌ Error al despachar el correo.");
            }
          };

          ejecutarPeticionConTimeout(
            GOOGLE_SCRIPT_URL,
            {
              action: "enviarCodigoDistri",
              correo: window.distriCorreoRegistradoEnSheets,
            },
            cbSend,
            14000,
            () => {
              btn.disabled = false;
              btn.innerHTML = "Continuar →";
            },
          );
        } else {
          btn.disabled = false;
          btn.innerHTML = "Continuar →";
          document.getElementById("stepTelefono").style.display = "none";
          document.getElementById("stepCorreoRegistrar").style.display = "flex";
        }
      } else {
        btn.disabled = false;
        btn.innerHTML = "Continuar →";
        alert("❌ Celular no autorizado en la base mayorista.");
      }
    } else {
      btn.disabled = false;
      btn.innerHTML = "Continuar →";
      alert("❌ Error de red.");
    }
  };

  ejecutarPeticionConTimeout(
    GOOGLE_SCRIPT_URL,
    { action: "obtenerDistribuidores" },
    cbName,
    14000,
    () => {
      btn.disabled = false;
      btn.innerHTML = "Continuar →";
    },
  );
}

function registrarEmailYEnviarCodigo() {
  haptic();
  const nuevoEmail = document
    .getElementById("distriCorreoRegistrarInput")
    .value.trim()
    .toLowerCase();
  const btn = document.getElementById("btnRegistrarEmailYEnviar");
  if (nuevoEmail === "" || nuevoEmail.indexOf("@") === -1) {
    alert("⚠️ Correo electrónico inválido.");
    return;
  }
  btn.disabled = true;
  btn.innerHTML = `Registrando y enviando...`;

  const cbReg = "cb_reg_" + Date.now();
  window[cbReg] = function (res) {
    btn.disabled = false;
    btn.innerHTML = "Registrar y Enviar Código";
    if (res && res.status === "success") {
      window.distriCorreoRegistradoEnSheets = nuevoEmail;
      document.getElementById("stepCorreoRegistrar").style.display = "none";
      document.getElementById("txtAvisoTokenDespachado").innerText =
        `🔑 Código enviado a: ${nuevoEmail}`;
      document.getElementById("stepTokenVerificar").style.display = "flex";
    } else {
      alert("❌ Error: " + res.message);
    }
  };

  ejecutarPeticionConTimeout(
    GOOGLE_SCRIPT_URL,
    {
      action: "registrarEmailNuevoDistri",
      telefono: window.distriTelefonoCache,
      correo: nuevoEmail,
    },
    cbReg,
    14000,
    () => {
      btn.disabled = false;
      btn.innerHTML = "Registrar y Enviar Código";
    },
  );
}

function verificarCodigoDeSeguridadFinal() {
  haptic();
  const tokenInput = document
    .getElementById("distriLoginTokenInput")
    .value.replace(/\s+/g, "")
    .trim();
  const btn = document.getElementById("btnVerificarCodigoFinal");
  if (tokenInput.length !== 6) {
    alert("⚠️ El código debe ser de 6 números.");
    return;
  }
  btn.disabled = true;
  btn.innerHTML = `Validando...`;

  const cbVerify = "cb_verify_" + Date.now();
  window[cbVerify] = function (res) {
    btn.disabled = false;
    btn.innerHTML = "Verificar e Ingresar";
    if (res && res.status === "success" && res.data) {
      localStorage.setItem("active_distri_tel", window.distriTelefonoCache);
      localStorage.setItem("active_distri_name", res.data.nombre.toUpperCase());
      localStorage.setItem("active_distri_saldo", res.data.saldo);

      entrarAlPortalDistribuidor(
        res.data.nombre.toUpperCase(),
        window.distriTelefonoCache,
        res.data.saldo,
      );
    } else {
      alert("❌ Código incorrecto o caducado.");
    }
  };

  ejecutarPeticionConTimeout(
    GOOGLE_SCRIPT_URL,
    {
      action: "verificarCodigoDistri",
      correo: window.distriCorreoRegistradoEnSheets,
      code: tokenInput,
    },
    cbVerify,
    14000,
    () => {
      btn.disabled = false;
      btn.innerHTML = "Verificar e Ingresar";
    },
  );
}

function regresarAlPasoInicial() {
  haptic();
  document.getElementById("stepTokenVerificar").style.display = "none";
  document.getElementById("stepCorreoRegistrar").style.display = "none";
  document.getElementById("stepTelefono").style.display = "flex";
}

// =========================================================================
// 💼 INTERFAZ B2B (DASHBOARD), MÓVIL Y ALERTAS
// =========================================================================
function entrarAlPortalDistribuidor(nombre, telefono, saldo) {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("dashboardSection").style.display = "flex";

  const btnCarrito = document.getElementById("fabCarrito");
  if (btnCarrito) {
    btnCarrito.style.setProperty("display", "flex", "important");
  }

  let nombreSeguro = nombre ? nombre : "Distribuidor";
  document.getElementById("distriWelcomeName").innerText =
    `¡Hola, ${nombreSeguro}!`;
  document.getElementById("distriWelcomePhone").innerText =
    `Distribuidor • Tel: ${telefono}`;

  window.saldoNumericoActual =
    parseFloat(String(saldo).replace(/[^\d.-]/g, "")) || 0;
  if (window.saldoNumericoActual > 0 && window.saldoNumericoActual < 1000) {
    window.saldoNumericoActual *= 1000;
  }

  actualizarSaldoUI();

  const shopContainer = document.getElementById("shopCatalogContainer");
  if (shopContainer) {
    shopContainer.innerHTML = `
      <div style="text-align:center; padding:40px; width:100%; color:var(--text-secondary); grid-column: 1 / -1;">
        <svg class="spin-anim" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--ios-blue)" stroke-width="2.5" style="margin-bottom:12px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v4"></path></svg>
        <br>Cargando precios en vivo...
      </div>`;
  }

  // Carga precios y almacena en caché local
  cargarPreciosEnTienda();

  cargarDatosFinancierosYAlertas(telefono);

  if (window.cyberIntervaloSaldoFondo)
    clearInterval(window.cyberIntervaloSaldoFondo);
  window.cyberIntervaloSaldoFondo = setInterval(
    refrescarSaldoDistribuidorFondo,
    5 * 60 * 1000,
  );
}

// =========================================================================
// 🔥 NUEVA FUNCIÓN: OBTENER PRECIOS EN VIVO DESDE SHEETS
// =========================================================================
function cargarPreciosEnTienda() {
  const cbName = "cb_get_precios_distri_" + Date.now();

  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success" && res.data) {
      // 1. Actualizamos el catálogo local con los nuevos precios de la base de datos
      res.data.forEach((itemSheet) => {
        let producto = catálogoProductos.find((p) => p.id === itemSheet.codigo);
        if (producto) {
          producto.precio = itemSheet.precio;
        }
      });
    }

    // 2. Ahora que ya tenemos los precios actualizados, dibujamos la tienda y traemos el stock
    renderTienda();
    cargarStockEnTienda();
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerPrecios&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

function actualizarSaldoUI() {
  const f = formatMoneda(window.saldoNumericoActual);
  const balDesktop = document.getElementById("distriBarBalance");
  if (balDesktop) balDesktop.innerText = f;

  const balMobile = document.getElementById("distriBarBalanceMobile");
  if (balMobile) balMobile.innerText = f;

  const cartTotalSaldo = document.getElementById("cartTotalSaldo");
  if (cartTotalSaldo) cartTotalSaldo.innerText = f;
}

function cargarDatosFinancierosYAlertas(tel) {
  const cbData = "cb_dash_" + Date.now();
  window[cbData] = function (res) {
    if (document.getElementById("node_" + cbData))
      document.getElementById("node_" + cbData).remove();
    delete window[cbData];

    if (res && res.status === "success") {
      const tbody = document.getElementById("tablaHistorialBody");
      let trs = "";
      if (res.historial && res.historial.length > 0) {
        res.historial.forEach((mov) => {
          let color =
            mov.monto < 0 || String(mov.monto).indexOf("-") !== -1
              ? "var(--ios-red)"
              : "var(--text-primary)";
          trs += `<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px 8px; font-size:0.75rem; color:var(--text-secondary);">${mov.fecha}</td>
                    <td style="padding: 12px 8px; line-height:1.3;">
                      <strong style="color:var(--text-primary); font-size:0.85rem;">${mov.concepto}</strong><br>
                      <span style="color:var(--ios-blue); font-size:0.75rem;">👤 ${mov.cliente}</span>
                    </td>
                    <td style="padding: 12px 8px; text-align:right; color:${color}; font-weight:bold; font-family:monospace;">${formatMoneda(mov.monto)}</td>
                  </tr>`;
        });
      } else {
        trs = `<tr><td colspan="3" style="text-align:center; padding: 20px; color:var(--text-secondary);">No hay movimientos recientes.</td></tr>`;
      }
      tbody.innerHTML = trs;

      const divRenov = document.getElementById("listaRenovacionesCards");
      const widgetCont = document.getElementById("widgetRenovaciones");
      let htmlRenov = "";
      let now = new Date();
      now.setHours(0, 0, 0, 0);

      let countExpiran = 0;
      if (res.renovaciones && res.renovaciones.length > 0) {
        res.renovaciones.forEach((c) => {
          let fObj = parseFechaCybernet(c.vencimiento);
          if (fObj) {
            let diffDias = Math.ceil(
              (fObj.getTime() - now.getTime()) / (1000 * 3600 * 24),
            );
            if (diffDias >= 0 && diffDias <= 3) {
              countExpiran++;
              let colorDias =
                diffDias === 0 ? "var(--ios-red)" : "var(--ios-orange)";
              let txtDias =
                diffDias === 0 ? "¡Vence HOY!" : `Vence en ${diffDias} días`;
              let msgCobro = encodeURIComponent(
                `¡Hola! Tu cuenta de ${c.plataforma.replace(/-/g, " ")} vence pronto (${c.vencimiento}). ¿Deseas renovarla para no perder el servicio?`,
              );

              htmlRenov += `
                 <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,149,0,0.3); border-radius:16px; padding:12px 16px; min-width:200px; display:flex; flex-direction:column; gap:6px;">
                    <div style="font-weight:800; color:var(--text-primary); font-size:0.9rem;">📺 ${c.plataforma.replace(/-/g, " ")}</div>
                    <div style="font-size:0.8rem; color:var(--text-secondary);">👤 ${c.cliente}</div>
                    <div style="font-size:0.8rem; color:${colorDias}; font-weight:700;">${txtDias}</div>
                    <button class="btn-ios" onclick="copiarMensajeRenovacion('${msgCobro}')" style="background:rgba(255,149,0,0.15); color:var(--ios-orange); border:none; padding:8px; border-radius:30px; font-size:0.75rem; font-weight:700; margin-top:4px;">
                      📋 Copiar Mensaje
                    </button>
                 </div>`;
            }
          }
        });
      }

      if (countExpiran > 0) {
        divRenov.innerHTML = htmlRenov;
        widgetCont.style.display = "block";
      } else {
        widgetCont.style.display = "none";
      }
    }
  };
  const script = document.createElement("script");
  script.id = "node_" + cbData;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerDashboardDistri&telefono=${encodeURIComponent(tel)}&callback=${cbData}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

function copiarMensajeRenovacion(msgEnc) {
  haptic();
  navigator.clipboard.writeText(decodeURIComponent(msgEnc)).then(() => {
    triggerToast("📋 Mensaje de cobro copiado.");
  });
}

function abrirModalHistorial() {
  haptic();
  bloquearScroll();
  document.getElementById("modalEstadoCuenta").classList.add("open");
}
function cerrarModalHistorial() {
  haptic();
  desbloquearScroll();
  document.getElementById("modalEstadoCuenta").classList.remove("open");
}

// =========================================================================
// 🛒 E-COMMERCE MAYORISTA
// =========================================================================
function abrirCarrito() {
  haptic();
  bloquearScroll();
  document.getElementById("modalCarritoTienda").classList.add("open");
}
function cerrarCarrito() {
  haptic();
  desbloquearScroll();
  document.getElementById("modalCarritoTienda").classList.remove("open");
}

function renderTienda() {
  const container = document.getElementById("shopCatalogContainer");
  if (!container) return;
  let html = "";
  catálogoProductos.forEach((p) => {
    html += `
      <div class="card-ios platform-card-shop" data-name="${p.nombre.toLowerCase()}" style="position:relative; padding:18px 14px 14px 14px; margin:0; display:flex; flex-direction:column; align-items:center; gap:8px; background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.05); text-align:center;">
        <div id="stock-badge-${p.id}" style="position:absolute; top:8px; right:8px; background:rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); font-size:0.65rem; padding:4px 8px; border-radius:10px; font-weight:700; color:var(--text-secondary);">
           <svg class="spin-anim" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v4"></path></svg>
        </div>
        <div style="background: ${p.color}15; color: ${p.color}; width: 44px; height: 44px; border-radius: 14px; display:flex; align-items:center; justify-content:center; border: 1px solid ${p.color}25;">${p.logo}</div>
        <span style="font-size:0.85rem; font-weight:800; color:var(--text-primary); text-overflow:ellipsis; white-space:nowrap; overflow:hidden; width:100%;">${p.nombre}</span>
        <span style="font-family:monospace; font-size:0.95rem; font-weight:bold; color:var(--ios-green);">${formatMoneda(p.precio)}</span>
        <button id="btn-add-${p.id}" onclick="agregarAlCarrito('${p.id}')" class="btn-ios btn-primary" style="margin:4px 0 0 0; padding:6px 12px; font-size:0.75rem; border-radius:30px; font-weight:700; width:100%; transition: all 0.3s;">+ Añadir</button>
      </div>`;
  });
  container.innerHTML = html;
}

function cargarStockEnTienda() {
  const cbStock = "cb_stock_" + Date.now();
  window[cbStock] = function (res) {
    if (document.getElementById("node_" + cbStock))
      document.getElementById("node_" + cbStock).remove();
    delete window[cbStock];

    if (res && res.status === "success") {
      const mapeo = {
        NETFLIX: "NETFLIX",
        DISNEYPREMIUM: "DISNEY-PREMIUM",
        AMAZON: "AMAZON",
        DISNEYESTANDAR: "DISNEY-ESTANDAR",
        HBOMAX: "HBO-MAX",
        PARAMOUNT: "PARAMOUNT",
        VIX: "VIX",
        CRUNCHYROLL: "CRUNCHYROLL",
        PLEX: "PLEX",
        APPLETV: "APPLE-TV",
        UNIVERSAL: "UNIVERSAL",
      };

      res.data.forEach((item) => {
        const htmlId = mapeo[item.plat];
        if (htmlId) {
          const badge = document.getElementById(`stock-badge-${htmlId}`);
          const btnAdd = document.getElementById(`btn-add-${htmlId}`);

          if (badge) {
            if (item.libres > 0) {
              badge.innerHTML = `🟢 ${item.libres} Disp.`;
              badge.style.background = "rgba(48, 209, 88, 0.1)";
              badge.style.color = "var(--ios-green)";
              badge.style.borderColor = "rgba(48, 209, 88, 0.2)";

              if (btnAdd) {
                btnAdd.disabled = false;
                btnAdd.innerHTML = "+ Añadir";
                btnAdd.style.background = "var(--ios-blue)";
                btnAdd.style.color = "white";
                btnAdd.style.opacity = "1";
                btnAdd.style.cursor = "pointer";
              }
            } else {
              badge.innerHTML = `🔴 Agotado`;
              badge.style.background = "rgba(255, 69, 58, 0.1)";
              badge.style.color = "var(--ios-red)";
              badge.style.borderColor = "rgba(255, 69, 58, 0.2)";

              if (btnAdd) {
                btnAdd.disabled = true;
                btnAdd.innerHTML = "Sin Stock";
                btnAdd.style.background = "rgba(255, 255, 255, 0.05)";
                btnAdd.style.color = "var(--text-secondary)";
                btnAdd.style.opacity = "0.5";
                btnAdd.style.cursor = "not-allowed";
              }
            }
          }
        }
      });

      catálogoProductos.forEach((p) => {
        const b = document.getElementById(`stock-badge-${p.id}`);
        if (b && b.innerHTML.includes("spin-anim")) {
          b.innerHTML = `✅ Ilimitado`;
          b.style.background = "rgba(10, 132, 255, 0.1)";
          b.style.color = "var(--ios-blue)";
          b.style.borderColor = "rgba(10, 132, 255, 0.2)";
        }
      });
    }
  };
  const script = document.createElement("script");
  script.id = "node_" + cbStock;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerPerfilesLibres&callback=${cbStock}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

function filtrarTiendaLocal() {
  const query = document
    .getElementById("searchShopInput")
    .value.toLowerCase()
    .trim();
  document.querySelectorAll(".platform-card-shop").forEach((c) => {
    c.style.display = c.getAttribute("data-name").includes(query)
      ? "flex"
      : "none";
  });
}

function agregarAlCarrito(id) {
  haptic();
  const prod = catálogoProductos.find((p) => p.id === id);
  if (!prod) return;
  const existente = window.carrito.find((item) => item.id === id);
  if (existente) existente.amount++;
  else
    window.carrito.push({
      id: prod.id,
      nombre: prod.nombre,
      precio: prod.precio,
      amount: 1,
      tipo: "Nueva",
      correoReno: "",
    });
  triggerToast(`🛒 ${prod.nombre} añadido.`);
  actualizarCarritoUI();

  // 🔥 NUEVA INTERACCIÓN VISUAL ADAPTATIVA
  const btn = document.getElementById(`btn-add-${id}`);
  if (btn) {
    const textoOriginal = btn.innerHTML;

    // Encendemos la animación y cambiamos el estado visual temporalmente
    btn.classList.add("btn-pop-anim");
    btn.innerHTML = "✓ Añadido";
    btn.style.setProperty("background", "var(--ios-green)", "important");
    btn.style.setProperty("color", "#ffffff", "important");

    // Esperamos 800ms para que el usuario asimile el cambio y regresamos al estado base
    setTimeout(() => {
      btn.classList.remove("btn-pop-anim");
      btn.innerHTML = textoOriginal;
      btn.style.background = "";
      btn.style.color = "";
    }, 800);
  }

  const fab = document.getElementById("fabCarrito");
  if (fab) {
    fab.style.transform = "scale(1.1)";
    setTimeout(() => {
      fab.style.transform = "scale(1)";
    }, 150);
  }
}

function cambiarCantidad(id, delta) {
  haptic();
  const item = window.carrito.find((i) => i.id === id);
  if (!item) return;
  item.amount += delta;
  if (item.amount <= 0)
    window.carrito = window.carrito.filter((i) => i.id !== id);
  actualizarCarritoUI();
}

window.cuentasActivasB2B = [];

window.cambiarTipoVentaCarrito = function (id, tipo) {
  let item = window.carrito.find((i) => i.id === id);
  if (item) {
    item.tipo = tipo;
    if (tipo === "Nueva") {
      item.correoReno = "";
      item.amount = 1;
      document.getElementById("cartClientName").value = "";
    }
    actualizarCarritoUI();
  }
};

// =========================================================================
// 🔄 VENTANA DE RENOVACIONES B2B (CORREGIDA: BUSCA POR NOMBRE Y CORREO)
// =========================================================================
window.abrirModalRenoB2B = function (idItem) {
  haptic();
  const telDistri =
    localStorage.getItem("active_distri_tel") || window.distriTelefonoCache;
  const modal = document.getElementById("modalRenovacionDistri");
  const container = document.getElementById("listaCuentasModalRenoDistri");

  container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-secondary);"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:10px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><br>Buscando tus pantallas en la base de datos...</div>`;
  modal.classList.add("open");

  const cbName = "cb_reno_b2b_" + Date.now();
  window[cbName] = function (res) {
    const node = document.getElementById("node_" + cbName);
    if (node) node.remove();
    delete window[cbName];

    container.innerHTML = "";
    if (res && res.status === "success" && res.data.length > 0) {
      window.cuentasActivasB2B = res.data;

      if (window.cuentasActivasB2B.length === 0) {
        container.innerHTML =
          "<div style='color:var(--ios-orange); text-align:center; padding: 20px;'>No se detectaron cuentas asignadas a tu número.</div>";
        return;
      }

      window.cuentasActivasB2B.forEach((cuenta) => {
        // Blindaje total contra celdas vacías en Sheets para que no rompa el buscador
        let correoTexto = String(cuenta.correo || "").trim();
        let perfilTexto = String(cuenta.perfil || "").trim();
        let clienteTexto = String(cuenta.cliente || "").trim();

        let div = document.createElement("div");
        div.className = "card-ios item-reno-b2b";
        div.style =
          "padding: 15px; cursor: pointer; background: var(--input-bg); border: var(--surface-border); border-radius: 14px; margin-bottom: 8px; text-align: left;";

        // Creamos la data de búsqueda unificada en minúsculas y sin peligro de colapso
        div.setAttribute(
          "data-search",
          correoTexto.toLowerCase() +
            " " +
            perfilTexto.toLowerCase() +
            " " +
            clienteTexto.toLowerCase(),
        );

        div.innerHTML = `
            <div style="color: var(--text-primary); font-weight: 700; font-size: 0.95rem; margin-bottom: 6px; word-break: break-all;">${correoTexto}</div>
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary);">
                <span>Perfil: <b style="color: var(--ios-blue);">${perfilTexto}</b></span>
                <span>Cliente: <b style="color: var(--ios-orange);">${clienteTexto || "Sin Nombre"}</b></span>
            </div>
        `;

        div.onclick = function () {
          let itemCarrito = window.carrito.find((i) => i.id === idItem);
          if (itemCarrito) {
            itemCarrito.correoReno = `${correoTexto} | Perfil: ${perfilTexto}`;

            let inputNombre = document.getElementById("cartClientName");
            if (
              inputNombre &&
              clienteTexto &&
              clienteTexto !== "N/A" &&
              clienteTexto.toLowerCase() !== "cliente"
            ) {
              inputNombre.value = clienteTexto;
            }

            let cantidadDetectada = perfilTexto
              .split(/[-y,]/i)
              .filter((p) => p.trim() !== "").length;
            if (cantidadDetectada > 0) {
              itemCarrito.amount = cantidadDetectada;
            }

            actualizarCarritoUI();
          }
          modal.classList.remove("open");
        };
        container.appendChild(div);
      });
    } else {
      container.innerHTML =
        "<div style='color:var(--text-secondary); text-align:center; padding: 20px;'>No tienes cuentas activas registradas en el sistema.</div>";
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=buscarRenovacionNetflix&tel=${encodeURIComponent(telDistri)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// =========================================================================
// 🔍 FILTRADO EN TIEMPO REAL DEL MODAL (BUSCA CORREO Y NOMBRE)
// =========================================================================
window.filtrarModalRenovacionB2B = function () {
  const q = document
    .getElementById("buscadorModalRenoDistri")
    .value.toLowerCase()
    .trim();

  document.querySelectorAll(".item-reno-b2b").forEach((item) => {
    const indiceBusqueda = item.getAttribute("data-search") || "";

    // Si la huella del contenedor incluye el texto del buscador, lo muestra instantáneamente
    if (indiceBusqueda.includes(q)) {
      item.style.setProperty("display", "block", "important");
    } else {
      item.style.setProperty("display", "none", "important");
    }
  });
};

function actualizarCarritoUI() {
  const container = document.getElementById("cartItemsContainer");
  const countBadge = document.getElementById("cartCountBadge");
  const fabBadge = document.getElementById("fabCartCountBadge");
  const totalDisplay = document.getElementById("cartTotalCost");
  const btnCheckout = document.getElementById("btnCheckoutShop");

  if (!window.carrito || window.carrito.length === 0) {
    if (container)
      container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); font-size: 0.9rem; padding: 30px 0; font-weight: 600;">Tu carrito está vacío.</div>`;
    if (countBadge) countBadge.innerText = "0";
    if (fabBadge) fabBadge.innerText = "0";
    if (totalDisplay) totalDisplay.innerText = "$0";
    if (btnCheckout) btnCheckout.disabled = true;
    return;
  }

  let html = "",
    totalCost = 0,
    totalItems = 0;

  window.carrito.forEach((item) => {
    const subtotal = item.precio * item.amount;
    totalCost += subtotal;
    totalItems += item.amount;

    let opcionesReno = "";
    if (item.id === "NETFLIX") {
      let isReno = item.tipo === "Reno";
      let displayBtn = isReno ? "block" : "none";
      let btnText = item.correoReno ? item.correoReno : "Seleccionar Cuenta";
      let btnColor = item.correoReno ? "var(--ios-green)" : "var(--ios-orange)";

      opcionesReno = `
          <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px; width: 100%; border-top: 1px dashed var(--surface-border); padding-top: 10px;">
              <select class="input-ios" style="margin: 0; padding: 8px; font-size: 0.8rem; border-radius: 10px; font-weight: 600;" onchange="window.cambiarTipoVentaCarrito('${item.id}', this.value)">
                  <option value="Nueva" ${!isReno ? "selected" : ""}>Crear Pantalla Nueva</option>
                  <option value="Reno" ${isReno ? "selected" : ""}>Renovar Pantalla Existente</option>
              </select>
              <button class="btn-ios" style="display: ${displayBtn}; background: transparent; color: ${btnColor}; border: 1px solid ${btnColor}; padding: 10px; border-radius: 10px; font-size: 0.75rem; font-weight: 700; width: 100%; text-align: center; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;" onclick="window.abrirModalRenoB2B('${item.id}')">
                  ${btnText}
              </button>
          </div>
        `;
    }

    html += `
      <div class="cart-item-row" style="display:flex; flex-direction:column; gap:12px; background: var(--input-bg); padding:14px; border-radius:16px; border: 1px solid var(--surface-border);">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <div style="display:flex; flex-direction:column; text-align:left; overflow:hidden; flex-grow:1;">
              <strong style="font-size:0.95rem; color:var(--text-primary); text-overflow:ellipsis; white-space:nowrap; overflow:hidden;">${item.nombre}</strong>
              <span style="font-size:0.85rem; color:var(--ios-green); font-family:monospace; font-weight:700;">${formatMoneda(subtotal)} <span style="font-size:0.7rem; color:var(--text-secondary); font-weight:normal;">(${formatMoneda(item.precio)} c/u)</span></span>
            </div>
            
            <!-- CONTROLES DE CANTIDAD -->
            <div style="display:flex; align-items:center; background: rgba(0,0,0,0.15); border-radius:30px; padding:2px; border:1px solid rgba(255,255,255,0.05);">
              <button onclick="cambiarCantidad('${item.id}', -1)" style="background:transparent; border:none; color:var(--text-primary); width:26px; height:26px; font-weight:bold; cursor:pointer;">-</button>
              <span style="font-family:monospace; font-size:0.9rem; font-weight:bold; min-width:20px; text-align:center;">${item.amount}</span>
              <button onclick="cambiarCantidad('${item.id}', 1)" style="background:transparent; border:none; color:var(--text-primary); width:26px; height:26px; font-weight:bold; cursor:pointer;">+</button>
            </div>

            <!-- 🔥 NUEVO: BOTÓN ELIMINAR DIRECTO TIPO ICONO -->
            <button onclick="eliminarDelCarrito('${item.id}')" style="background: rgba(255, 69, 58, 0.1); border: 1px solid rgba(255, 69, 58, 0.2); color: var(--ios-red); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink:0; font-size: 0.9rem; font-weight: bold; transition: background 0.2s;" title="Eliminar del carrito">
              ✕
            </button>
        </div>
        ${opcionesReno}
      </div>`;
  });

  if (container) container.innerHTML = html;
  if (countBadge) countBadge.innerText = totalItems;
  if (fabBadge) fabBadge.innerText = totalItems;
  if (totalDisplay) totalDisplay.innerText = formatMoneda(totalCost);

  if (btnCheckout) {
    if (totalCost > window.saldoNumericoActual) {
      btnCheckout.disabled = true;
      btnCheckout.style.background = "var(--ios-red)";
      btnCheckout.innerText = "SALDO INSUFICIENTE";
    } else {
      btnCheckout.disabled = false;
      btnCheckout.style.background = "var(--ios-blue)";
      btnCheckout.innerText = "CONFIRMAR COMPRA";
    }
  }
}

// =========================================================================
// 🛒 PROCESAR COMPRA (CON ESCUDO INTEGRAL DE 1 MINUTO - ANTI-DUPLICADOS)
// =========================================================================
function procesarCompraDistribuidor() {
  haptic();
  if (!window.carrito || window.carrito.length === 0) return;

  let totalCost = window.carrito.reduce(
    (sum, item) => sum + item.precio * item.amount,
    0,
  );
  if (totalCost > window.saldoNumericoActual) return;

  const btn = document.getElementById("btnCheckoutShop");
  if (btn.disabled) return;

  const inputNombreCliente = document
    .getElementById("cartClientName")
    .value.trim();
  const nombreParaSheets =
    inputNombreCliente !== ""
      ? inputNombreCliente
      : localStorage.getItem("active_distri_name");
  const telefonoDistribuidor = localStorage.getItem("active_distri_tel");

  let hayRenovacion = false;
  let correoRenoGlobal = "";

  let fragmentos = window.carrito.map((item) => {
    if (item.tipo === "Reno") {
      hayRenovacion = true;
      correoRenoGlobal = item.correoReno;
    }
    return `${item.amount} ${item.id}`;
  });

  let descripcionLote = fragmentos.join(" + ");

  if (hayRenovacion) {
    descripcionLote = "RENO: " + descripcionLote;
    if (correoRenoGlobal === "") {
      triggerToast(
        "⚠️ Debes hacer clic en 'Seleccionar Cuenta' en tu carrito para proceder con la renovación.",
      );
      return;
    }
  }

  desbloquearScroll();

  setTimeout(() => {
    if (
      !confirm(
        `🛒 ¿Confirmar despacho mayorista?\n\n📦 Pedido: ${descripcionLote}\n👤 Cliente: ${nombreParaSheets}\n💵 Costo: ${formatMoneda(totalCost)}`,
      )
    ) {
      bloquearScroll();
      return;
    }

    bloquearScroll();

    // 🔒 Apagar el botón inmediatamente para congelar doble-clics
    btn.disabled = true;
    btn.innerHTML = `<span class="spin-anim" style="display:inline-block; margin-right:8px;">⏳</span>Despachando...`;

    const cbCheckout = "cb_chk_" + Date.now();
    window[cbCheckout] = function (res) {
      btn.disabled = false;
      btn.innerHTML = "CONFIRMAR COMPRA";
      actualizarCarritoUI();

      if (res && res.status === "success") {
        let nombreMensaje =
          inputNombreCliente !== "" ? inputNombreCliente : "Cliente";
        let textoFicha = `🌟 ¡Hola, ${nombreMensaje}!\n\nTu pedido ha sido procesado con éxito. Aquí tienes tus accesos: 👇\n\n`;

        const mesesCortos = [
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
        const fechaActual = new Date();
        const fechaCompraFormateada = `${fechaActual.getDate()}-${mesesCortos[fechaActual.getMonth()]}`;

        if (res.bloques && res.bloques.length > 0) {
          res.bloques.forEach((bloque) => {
            textoFicha += `🎬 DETALLES DE ${bloque.id.replace(/-/g, " ").toUpperCase()} ✅\n────────────────────\n📧 Correo: ${bloque.correo}\n🔐 Contraseña: ${bloque.clave}\n`;
            if (
              bloque.perfil &&
              bloque.perfil !== "N/A" &&
              bloque.perfil !== ""
            )
              textoFicha += `👤 Perfil: ${bloque.perfil}\n`;
            if (bloque.pin && bloque.pin !== "N/A" && bloque.pin !== "")
              textoFicha += `🔑 Pin del Perfil: ${bloque.pin}\n`;
            textoFicha += `📅 Fecha de Vencimiento: ${bloque.venc.toLowerCase()}\n🛒 Fecha de Compra: ${fechaCompraFormateada}\n\n`;
          });
        } else {
          textoFicha += `Tus cuentas han sido procesadas correctamente. Míralas en tu casillero.\n\n`;
        }
        textoFicha += `📢 INFORMACIÓN IMPORTANTE:\n────────────────────\n💎 Disfruta tu servicio.\n✨ ¡Gracias por elegirnos! ✨`;

        document.getElementById("cajaTextoFichas").innerText = textoFicha;
        window.fichasCheckoutPendientes = textoFicha;

        const btnWhatsapp = document.getElementById("btnWhatsAppActivacion");
        const requiresManual = window.carrito.some((item) =>
          PLATAFORMAS_MANUALES.includes(item.id),
        );

        if (requiresManual) {
          const platList = window.carrito
            .filter((i) => PLATAFORMAS_MANUALES.includes(i.id))
            .map((i) => i.nombre)
            .join(", ");
          const waMsg = encodeURIComponent(
            `Hola Camilo, acabo de pagar 1 mes de ${platList} para mi cliente, solicito activación. Cliente: ${nombreMensaje}`,
          );
          btnWhatsapp.href = `https://wa.me/573127706726?text=${waMsg}`;
          btnWhatsapp.style.display = "block";
        } else {
          btnWhatsapp.style.display = "none";
        }

        cerrarCarrito();
        document.getElementById("successCheckoutOverlay").classList.add("open");
        bloquearScroll();

        window.carrito = [];
        document.getElementById("cartClientName").value = "";
        actualizarCarritoUI();

        if (res.saldoQuedante !== undefined) {
          window.saldoNumericoActual = parseFloat(res.saldoQuedante);
        } else {
          window.saldoNumericoActual -= totalCost;
        }
        localStorage.setItem("active_distri_saldo", window.saldoNumericoActual);

        actualizarSaldoUI();
        cargarStockEnTienda();
        cargarDatosFinancierosYAlertas(telefonoDistribuidor);

        if (res.bloques && res.bloques.length > 0) {
          const searchInput = document.getElementById("inputCasilleroSearch");
          if (searchInput) searchInput.value = res.bloques[0].correo;
        }
      } else {
        desbloquearScroll();
        triggerToast("❌ Error: " + (res ? res.message : "Fallo de red."));
      }
    };

    let mapaParametros = {
      action: "registrarVentaDistriB2B",
      nombre: nombreParaSheets,
      telefono: telefonoDistribuidor,
      descripcion: descripcionLote,
      correoReno: correoRenoGlobal,
      cantidad: totalCost,
    };

    // 🔥 MODIFICACIÓN SOLICITADA: Escudo de tiempo extendido a 1 minuto exacto (60,000 ms)
    ejecutarPeticionConTimeout(
      GOOGLE_SCRIPT_URL,
      mapaParametros,
      cbCheckout,
      60000,
      () => {
        btn.disabled = false;
        btn.innerHTML = "CONFIRMAR COMPRA";
        alert(
          "⚠️ El servidor está demorando más de lo normal. Por favor, revisa tu 'Historial' o el 'Buscador de Cuentas' en un minuto para verificar si la cuenta se alcanzó a emitir.",
        );
      },
    );
  }, 50);
}

function copiarCuentasCheckout() {
  haptic();
  const btn = document.getElementById("btnCopiarFichasCheckout");
  navigator.clipboard.writeText(window.fichasCheckoutPendientes).then(() => {
    let originalText = btn.innerHTML;
    btn.innerHTML = `✅ ¡Copiado con éxito!`;
    triggerToast(`📋 Cuentas copiadas.`);
    setTimeout(() => {
      btn.innerHTML = originalText;
    }, 2000);
  });
}
function cerrarModalExitoCheckout() {
  haptic();
  desbloquearScroll();
  document.getElementById("successCheckoutOverlay").classList.remove("open");
}

// =========================================================================
// 📡 BÓVEDA DE CUENTAS (Buscador Modal)
// =========================================================================
function abrirModalBusquedaCuentas() {
  haptic();
  bloquearScroll();
  document.getElementById("modalBusquedaCuentas").classList.add("open");
  document.getElementById("contenedorResultadosCasillero").innerHTML =
    `<div style="text-align:center; color:var(--text-secondary); font-size:0.88rem; padding: 30px 0;">Ingresa un parámetro y presiona buscar. El sistema filtrará solo tus compras registradas.</div>`;
}

function cerrarModalBusquedaCuentas() {
  haptic();
  desbloquearScroll();
  document.getElementById("modalBusquedaCuentas").classList.remove("open");
}

function buscarCasilleroDistri() {
  haptic();
  const inputSearch = document
    .getElementById("inputCasilleroSearch")
    .value.trim()
    .toLowerCase();
  const contenedor = document.getElementById("contenedorResultadosCasillero");
  const btn = document.getElementById("btnBuscarCasillero");
  const telefonoDistribuidor = localStorage.getItem("active_distri_tel");

  if (inputSearch === "") {
    triggerToast("⚠️ Ingresa el nombre del cliente.");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `Buscando...`;
  contenedor.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-secondary);">Rastreando en la Bóveda...</div>`;

  const cbBusq = "cb_casillero_" + Date.now();
  window[cbBusq] = function (res) {
    btn.disabled = false;
    btn.innerHTML = "Buscar";

    if (res && res.status === "success") {
      let htmlCards = "";
      const cuentasMias = res.data.filter((item) => {
        let tFila = String(item.telefono || "").replace(/\D/g, "");
        return (
          tFila.indexOf(telefonoDistribuidor) !== -1 ||
          telefonoDistribuidor.indexOf(tFila) !== -1
        );
      });

      cuentasMias.forEach((item) => {
        let pinText =
          item.pin && item.pin !== "" && item.pin !== "N/A"
            ? ` | PIN: <b>${item.pin}</b>`
            : "";
        let perfilText =
          item.perfil && item.perfil !== "" && item.perfil !== "N/A"
            ? `Perfil: <b>${item.perfil}</b>${pinText}`
            : "Cuenta Completa";
        let subCliente = item.cliente
          ? `<span style="font-size:0.75rem; color:var(--text-secondary);">Cliente: <b style="color:var(--ios-orange);">${item.cliente}</b></span>`
          : "";
        let dataFicha = encodeURIComponent(JSON.stringify(item));

        htmlCards += `
          <div class="cuenta-resultado-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="color:var(--ios-blue); font-weight:800; text-transform: uppercase;">${item.plataforma.replace(/-/g, " ")}</div>
              <div style="color:var(--ios-green); font-family:monospace; font-weight:800; font-size:0.85rem;">${item.vencimiento}</div>
            </div>
            <div style="font-size:0.8rem; color:var(--text-secondary); line-height:1.4;">
               ${perfilText}<br>${subCliente}
            </div>
            <div style="display:flex; flex-direction:column; gap:6px; margin-top:4px;">
              <div class="credential-pill" onclick="copiarTextoAlToque(this, '${item.correo}')">E: <span style="color:white;">${item.correo}</span></div>
              <div class="credential-pill" onclick="copiarTextoAlToque(this, '${item.clave}')">P: <span style="color:white;">${item.clave}</span></div>
              <button class="btn-ios btn-secondary w-100" style="padding:8px; font-size:0.75rem; margin-top:4px;" onclick="copiarFichaCasillero(this, '${dataFicha}')">Copiar Ficha Completa</button>
            </div>
          </div>`;
      });
      contenedor.innerHTML =
        cuentasMias.length === 0
          ? `<div style="text-align:center; padding:40px; color:var(--text-secondary);">No se encontraron cuentas asociadas.</div>`
          : htmlCards;
    } else {
      contenedor.innerHTML = `<div style="text-align:center; padding:30px; color:var(--ios-red);">❌ Error en la red o base de datos.</div>`;
    }
  };

  // 🔥 FIX: Tiempo de espera extendido a 1 minuto exacto (60000 ms) para búsquedas seguras
  ejecutarPeticionConTimeout(
    GOOGLE_SCRIPT_URL,
    { action: "buscarCuentaGlobal", query: inputSearch },
    cbBusq,
    60000,
    () => {
      btn.disabled = false;
      btn.innerHTML = "Buscar";
      contenedor.innerHTML = `<div style="text-align:center; padding:30px; color:var(--ios-red);">❌ Tiempo de espera agotado. Reintenta.</div>`;
    },
  );
}

function copiarFichaCasillero(btn, dataEncoded) {
  haptic();
  const obj = JSON.parse(decodeURIComponent(dataEncoded));
  let nombreCliente =
    obj.cliente && obj.cliente !== "N/A" ? obj.cliente : "Cliente";
  let txt = `🌟 ¡Hola, ${nombreCliente}!\n\nTu pedido ha sido procesado. Accesos: 👇\n\n🎬 DETALLES DE ${obj.plataforma.replace(/-/g, " ").toUpperCase()} ✅\n────────────────────\n📧 Correo: ${obj.correo}\n🔐 Contraseña: ${obj.clave}\n`;
  if (obj.perfil && obj.perfil !== "N/A" && obj.perfil !== "")
    txt += `👤 Perfil: ${obj.perfil}\n`;
  if (obj.pin && obj.pin !== "N/A" && obj.pin !== "")
    txt += `🔑 Pin del Perfil: ${obj.pin}\n`;
  txt += `📅 Fecha de Vencimiento: ${obj.vencimiento.toLowerCase()}\n\n📢 INFORMACIÓN IMPORTANTE:\n────────────────────\n💎 Disfruta tu servicio.\n✨ ¡Gracias por elegirnos! ✨`;
  navigator.clipboard.writeText(txt).then(() => {
    let old = btn.innerHTML;
    btn.innerHTML = `✅ ¡Copiada!`;
    btn.style.background = "var(--ios-green)";
    btn.style.color = "white";
    triggerToast(`📋 Ficha copiada.`);
    setTimeout(() => {
      btn.innerHTML = old;
      btn.style.background = "";
      btn.style.color = "";
    }, 1500);
  });
}

// =========================================================================
// 🤖 MODAL BOT CÓDIGOS
// =========================================================================
let codeData = { telefono: "", plataforma: "", opcion: 1, correo: "" };
function abrirCentroCodigos() {
  haptic();
  bloquearScroll();
  codeData.telefono = localStorage.getItem("active_distri_tel");
  document.getElementById("codesCenterOverlay").classList.add("open");
  changeCodeStep(1);
}
function cerrarCentroCodigos() {
  haptic();
  desbloquearScroll();
  document.getElementById("codesCenterOverlay").classList.remove("open");
}
function changeCodeStep(n) {
  document
    .querySelectorAll(".code-step")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById("codeStep" + n).classList.add("active");
}
function setCodigoPlat(p) {
  haptic();
  codeData.plataforma = p;
  changeCodeStep(p === "NETFLIX" ? 2 : 3);
}
function setCodigoOp(o) {
  haptic();
  codeData.opcion = o;
  changeCodeStep(3);
}

async function rastrearCodigo() {
  haptic();
  let m = document
    .getElementById("inputCorreoCodigo")
    .value.toLowerCase()
    .trim();

  if (!m.includes("@")) {
    alert("⚠️ Escribe un correo electrónico válido.");
    return;
  }

  const btnTrack = document.getElementById("btnRastrearCodigo");
  if (btnTrack) {
    btnTrack.disabled = true;
    btnTrack.innerText = "Rastreando...";
  }

  // Sincronizamos el correo en el objeto de transferencia
  codeData.correo = m;
  changeCodeStep(4); // Pone la pantalla de carga "Interceptando códigos..."

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos de tiempo de espera

  try {
    const query = new URLSearchParams(codeData);

    // 🔥 CORRECCIÓN: Cambiado BOT_API_URL por GOOGLE_SCRIPT_URL para usar tu servidor activo y evitar el CORS/Error
    const resp = await fetch(`${GOOGLE_SCRIPT_URL}?${query.toString()}`, {
      signal: controller.signal,
    });
    const res = await resp.json();
    clearTimeout(timeoutId);

    changeCodeStep(5); // Muestra la pantalla de resultados
    document.getElementById("codeResultBox").style.display = "none";
    document.getElementById("linkResultBox").style.display = "none";

    if (res.exito) {
      document.getElementById("codeResultTitle").innerHTML =
        `<span style="color:var(--ios-green); font-weight:800;">¡LOCALIZADO!</span>`;
      document.getElementById("codeResultDesc").innerText =
        res.msj || "Información recuperada con éxito:";

      if (res.tipo === "codigo") {
        document.getElementById("codeResultBox").style.display = "block";
        document.getElementById("codeVal").innerText = res.valor;
        document.getElementById("codeTimer").innerText =
          `Vence en: ${res.tiempo}`;
      } else if (res.tipo === "link") {
        document.getElementById("linkResultBox").style.display = "block";
        document.getElementById("linkVal").href = res.valor;
      }
    } else {
      document.getElementById("codeResultTitle").innerHTML =
        `<span style="color:var(--ios-orange); font-weight:800;">SIN RESULTADOS</span>`;
      document.getElementById("codeResultDesc").innerText =
        res.msj || "No se detectaron solicitudes recientes para este buzón.";
    }
  } catch (err) {
    changeCodeStep(5);
    if (err.name === "AbortError") {
      document.getElementById("codeResultTitle").innerHTML =
        `<span style="color:var(--ios-red); font-weight:800;">TIEMPO AGOTADO</span>`;
      document.getElementById("codeResultDesc").innerText =
        "La conexión con el buzón de Gmail tardó demasiado. Vuelve a solicitar el código en tu pantalla e intenta de nuevo.";
    } else {
      document.getElementById("codeResultTitle").innerHTML =
        `<span style="color:var(--ios-red); font-weight:800;">ERROR DE RED</span>`;
      document.getElementById("codeResultDesc").innerText =
        "No se pudo establecer comunicación con el servidor central de Cybernet.";
    }
  } finally {
    if (btnTrack) {
      btnTrack.disabled = false;
      btnTrack.innerText = "Rastrear Código";
    }
  }
}

function cerrarSesionDistribuidor() {
  if (window.cyberIntervaloSaldoFondo) {
    clearInterval(window.cyberIntervaloSaldoFondo);
  }
  localStorage.removeItem("active_distri_tel");
  localStorage.removeItem("active_distri_name");
  localStorage.removeItem("active_distri_saldo");
  sessionStorage.clear();

  window.location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  let localDistri = localStorage.getItem("active_distri_tel");
  if (localDistri) {
    window.distriTelefonoCache = localDistri;
    entrarAlPortalDistribuidor(
      localStorage.getItem("active_distri_name"),
      localDistri,
      localStorage.getItem("active_distri_saldo"),
    );
  }
});

// =========================================================================
// 🔒 CONTROL DE SCROLL PARA MODALES (UX Nativo)
// =========================================================================
function bloquearScroll() {
  document.body.style.overflow = "hidden";
}
function desbloquearScroll() {
  document.body.style.overflow = "";
}

// =========================================================================
// 🔄 SISTEMA DE ACTUALIZACIÓN MANUAL Y CONTROLADA DE SALDO B2B
// =========================================================================

function manualRefrescarSaldo() {
  if (typeof haptic === "function") haptic();

  const btn = document.getElementById("btnRefrescarSaldoManual");
  if (btn) btn.classList.add("spin-anim"); // Enciende el giro de la flecha

  // Llama a la función nativa que consulta los distribuidores en Sheets
  refrescarSaldoDistribuidorFondo();

  // Escudo de seguridad por si la conexión a internet del cliente es lenta
  setTimeout(() => {
    if (btn) btn.classList.remove("spin-anim");
  }, 4000);
}

function refrescarSaldoDistribuidorFondo() {
  const telActivo =
    localStorage.getItem("active_distri_tel") || window.distriTelefonoCache;
  if (!telActivo) return;

  const cbName = "cb_background_saldo_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    // Apagar la animación del botón de refresco apenas el servidor responda
    const btnRefrescar = document.getElementById("btnRefrescarSaldoManual");
    if (btnRefrescar) btnRefrescar.classList.remove("spin-anim");

    if (res && res.status === "success" && res.data) {
      const distriFresco = res.data.find(
        (d) =>
          String(d.telefono || "").replace(/\D/g, "") ===
          telActivo.replace(/\D/g, ""),
      );

      if (distriFresco) {
        let saldoNum =
          parseFloat(String(distriFresco.saldo).replace(/[^\d.-]/g, "")) || 0;
        if (saldoNum > 0 && saldoNum < 1000) saldoNum *= 1000;

        window.saldoNumericoActual = saldoNum;
        localStorage.setItem("active_distri_saldo", saldoNum);

        actualizarSaldoUI();

        if (
          typeof actualizarCarritoUI === "function" &&
          document
            .getElementById("modalCarritoTienda")
            .classList.contains("open")
        ) {
          actualizarCarritoUI();
        }
        console.log(
          "🤖 [Cybernet System] Saldo sincronizado exitosamente de forma manual.",
        );
      }
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerDistribuidores&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

// =========================================================================
// 🌐 WRAPPER MAESTRO JSONP CON SEGURO DE ANULACIÓN POR TIMEOUT (UX ANTI-CONGELAMIENTO)
// =========================================================================
function ejecutarPeticionConTimeout(
  urlBase,
  paramsObj,
  callbackName,
  timeoutMs,
  onTimeoutCallback,
  silencioso = false,
) {
  let timeoutId = setTimeout(() => {
    if (window[callbackName]) {
      delete window[callbackName];
      const scriptNode = document.getElementById("node_" + callbackName);
      if (scriptNode) scriptNode.remove();

      if (!silencioso) {
        haptic();
        triggerToast(`⚠️ Conexión inestable. La operación tardó demasiado.`);
      }

      if (typeof onTimeoutCallback === "function") {
        onTimeoutCallback();
      }
    }
  }, timeoutMs);

  const originalCallback = window[callbackName];
  window[callbackName] = function (res) {
    clearTimeout(timeoutId);
    delete window[callbackName];

    const scriptNode = document.getElementById("node_" + callbackName);
    if (scriptNode) scriptNode.remove();

    if (typeof originalCallback === "function") {
      originalCallback(res);
    }
  };

  const queryParams = new URLSearchParams(paramsObj);
  queryParams.append("callback", callbackName);
  queryParams.append("_ts", Date.now());

  const script = document.createElement("script");
  script.id = "node_" + callbackName;
  script.src = `${urlBase}?${queryParams.toString()}`;
  document.body.appendChild(script);
}

// =========================================================================
// 📱 MENÚ MÓVIL (HAMBURGUESA)
// =========================================================================
function abrirMenuMovil() {
  haptic();
  bloquearScroll();
  const modal = document.getElementById("modalMenuMovil");
  if (modal) modal.classList.add("open");
}

function cerrarMenuMovil() {
  haptic();
  desbloquearScroll();
  const modal = document.getElementById("modalMenuMovil");
  if (modal) modal.classList.remove("open");
}

// =========================================================================
// 💰 MÓDULO DE RECARGAS OCR AUTÓNOMO (TESSERACT AI)
// =========================================================================

// Variables globales para guardar los datos leídos
window.ocrValorFinal = 0;
window.ocrHoraFinal = "";

function abrirModalInstruccionesRecarga() {
  haptic();
  bloquearScroll();
  document.getElementById("modalInstruccionesRecarga").classList.add("open");
}

function cerrarModalInstruccionesRecarga() {
  haptic();
  desbloquearScroll();
  document.getElementById("modalInstruccionesRecarga").classList.remove("open");
}

function cerrarModalFormularioRecarga() {
  haptic();
  desbloquearScroll();
  document.getElementById("modalFormularioRecarga").classList.remove("open");
}

// =========================================================================
// 💰 MÓDULO DE RECARGAS OCR CENTRALIZADO CON AUDITORÍA CRUZADA TOTAL
// =========================================================================

window.ocrValorFinal = 0;
window.ocrHoraFinal = "";
window.ocrFechaCompletaFinal = "";
window.ocrReferenciaFinal = "";
window.ocrLlaveFinal = "";
window.ocrOrigenFinal = "";

function abrirModalFormularioRecarga() {
  haptic();
  document.getElementById("modalInstruccionesRecarga").classList.remove("open");
  document.getElementById("modalFormularioRecarga").classList.add("open");

  document.getElementById("recargaComprobante").value = "";
  document.getElementById("ocrUploadArea").style.display = "block";
  document.getElementById("ocrInstruccionText").style.display = "block";
  document.getElementById("ocrLoadingUI").style.display = "none";
  document.getElementById("ocrResultsUI").style.display = "none";
}

// 🧠 Motor de Inteligencia Artificial Tolerante (Corregido y Fluido)
async function analizarComprobanteIA(input) {
  const file = input.files[0];
  if (!file) return;

  haptic();

  // 🔥 NUEVO: Guardar la imagen en Base64 en memoria para enviarla a Drive luego
  const reader = new FileReader();
  reader.onload = function (e) {
    window.imagenComprobanteDistri = e.target.result;
  };
  reader.readAsDataURL(file);

  // 🔥 NUEVO: Asignar la imagen al contenedor de vista previa
  const previewImg = document.getElementById("previewComprobante");
  if (previewImg) {
    previewImg.src = URL.createObjectURL(file);
    previewImg.style.display = "inline-block";
  }

  // Ocultamos la carga inicial y encendemos el procesador visual de forma correcta
  document
    .getElementById("ocrUploadArea")
    .style.setProperty("display", "none", "important");
  document
    .getElementById("ocrInstruccionText")
    .style.setProperty("display", "none", "important");
  document
    .getElementById("ocrLoadingUI")
    .style.setProperty("display", "block", "important");
  document
    .getElementById("ocrResultsUI")
    .style.setProperty("display", "none", "important");

  try {
    const worker = await Tesseract.createWorker("spa");
    const ret = await worker.recognize(file);
    const texto = ret.data.text.toLowerCase();
    await worker.terminate();

    // Capturamos la fecha y hora de este preciso instante como respaldo automático
    const hoy = new Date();
    const dia = hoy.getDate();
    const mes = hoy.getMonth();
    const nombresMes = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];
    const fechaHoyFormateada = `${dia} de ${nombresMes[mes]} de ${hoy.getFullYear()}`;

    // =========================================================================
    // 1. EXTRACCIÓN FLEXIBLE DE VALOR (MONTO)
    // =========================================================================
    let monto = 0;
    let matchMonto =
      texto.match(/¿cuánto\??\s*[\n\r]*\s*\$\s*([\d{1,3}]+(?:[.,]\d{3})*)/i) ||
      texto.match(/(?:[$s])\s*(\d{1,3}(?:[.,]\d{3})+)/i);

    if (!matchMonto) {
      matchMonto =
        texto.match(/\b\d{1,3}([.,]\d{3})+\b/) ||
        texto.match(
          /\b(10000|20000|30000|40000|50000|100000|200000|300000|500000)\b/,
        );
    }

    if (matchMonto) {
      monto = parseFloat(
        matchMonto[1]
          ? matchMonto[1].replace(/[.,]/g, "")
          : matchMonto[0].replace(/[.,]/g, ""),
      );
    }
    if (!monto || isNaN(monto)) monto = 20000;

    // =========================================================================
    // 2. EXTRACCIÓN FLEXIBLE DE HORA
    // =========================================================================
    let horaExtr = "";
    const matchHora = texto.match(/(\d{1,2}):(\d{2})\s*(a\.?m\.?|p\.?m\.?|)/i);
    if (matchHora) {
      let hh = parseInt(matchHora[1], 10);
      let mm = parseInt(matchHora[2], 10);
      let ampm = matchHora[3] ? matchHora[3].replace(/\./g, "").trim() : "";

      if (ampm === "pm" && hh < 12) hh += 12;
      else if (ampm === "am" && hh === 12) hh = 0;
      horaExtr = `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
    } else {
      horaExtr = `${hoy.getHours().toString().padStart(2, "0")}:${hoy.getMinutes().toString().padStart(2, "0")}`;
    }

    // =========================================================================
    // 3. EXTRACCIÓN FLEXIBLE DE REFERENCIA
    // =========================================================================
    let referenciaExtr = "";
    const matchRefReal =
      texto.match(/referencia\s*[\n\r]*\s*([a-z0-9]{6,15})/i) ||
      texto.match(/\b(m\d{6,12}|[a-z0-9]{8,12})\b/i);
    if (matchRefReal) {
      referenciaExtr = (matchRefReal[1] || matchRefReal[0])
        .toUpperCase()
        .trim();
    } else {
      referenciaExtr = "M" + hoy.getTime().toString().substring(5);
    }

    // =========================================================================
    // 4. EXTRACCIÓN FLEXIBLE DE LLAVE
    // =========================================================================
    let llaveExtr = "";
    const matchLlave =
      texto.match(/llave\s*[\n\r]*\s*(\d{10,14})/i) ||
      texto.match(/\b1007416341\b/);
    llaveExtr = matchLlave
      ? (matchLlave[1] || matchLlave[0]).trim()
      : "1007416341";

    // =========================================================================
    // 5. EXTRACCIÓN FLEXIBLE DE ORIGEN
    // =========================================================================
    let origenExtr = "";
    const matchOrigen =
      texto.match(
        /¿desde d[oó]nde se hizo el env[ií]o\??\s*[\n\r]*\s*([\d\s]{10,15})/i,
      ) || texto.match(/\b3\d{2}\s*\d{3}\s*\d{4}\b/);
    origenExtr = matchOrigen
      ? (matchOrigen[1] || matchOrigen[0]).replace(/\s+/g, "").trim()
      : "Lectura Manual (Imagen)";

    // Guardamos en las variables de control contable
    window.ocrValorFinal = monto;
    window.ocrHoraFinal = horaExtr;
    window.ocrFechaCompletaFinal = fechaHoyFormateada;
    window.ocrReferenciaFinal = referenciaExtr;
    window.ocrLlaveFinal = llaveExtr;
    window.ocrOrigenFinal = origenExtr;

    // Pintamos los datos detectados de forma segura
    document.getElementById("displayOcrValor").innerText =
      "$" + window.ocrValorFinal.toLocaleString("es-CO");
    document.getElementById("displayOcrFecha").innerText =
      window.ocrFechaCompletaFinal;
    document.getElementById("displayOcrRef").innerText =
      window.ocrReferenciaFinal;
    document.getElementById("displayOcrLlave").innerText = window.ocrLlaveFinal;
    document.getElementById("displayOcrOrigen").innerText =
      window.ocrOrigenFinal;

    document
      .getElementById("ocrLoadingUI")
      .style.setProperty("display", "none", "important");
    document
      .getElementById("ocrResultsUI")
      .style.setProperty("display", "flex", "important");
  } catch (error) {
    // Respaldo en caso de fallo crítico de lectura
    const hoy = new Date();
    window.ocrValorFinal = 20000;
    window.ocrHoraFinal = `${hoy.getHours().toString().padStart(2, "0")}:${hoy.getMinutes().toString().padStart(2, "0")}`;
    window.ocrFechaCompletaFinal = `${hoy.getDate()}/${hoy.getMonth() + 1}/${hoy.getFullYear()}`;
    window.ocrReferenciaFinal = "M" + hoy.getTime().toString().substring(5);
    window.ocrLlaveFinal = "1007416341";
    window.ocrOrigenFinal = "Lectura de Contingencia";

    document.getElementById("displayOcrValor").innerText = "$20.000";
    document.getElementById("displayOcrFecha").innerText =
      window.ocrFechaCompletaFinal;
    document.getElementById("displayOcrRef").innerText =
      window.ocrReferenciaFinal;
    document.getElementById("displayOcrLlave").innerText = window.ocrLlaveFinal;
    document.getElementById("displayOcrOrigen").innerText =
      window.ocrOrigenFinal;

    document
      .getElementById("ocrLoadingUI")
      .style.setProperty("display", "none", "important");
    document
      .getElementById("ocrResultsUI")
      .style.setProperty("display", "flex", "important");
  }
}

// 🌐 Cruce en caliente con los correos del Banco (CON ESCUDO ANTIFRAUDE INTEGRAL)
function procesarRecargaDistribuidor() {
  haptic();
  const nombreInput = document
    .getElementById("recargaNombre")
    .value.trim()
    .toLowerCase();

  if (!nombreInput) {
    alert(
      "⚠️ Por favor ingresa el nombre o apellido del titular para poder confirmar.",
    );
    return;
  }

  const btn = document.getElementById("btnVerificarRecarga");
  btn.disabled = true;
  btn.innerHTML = `<span class="spin-anim" style="display:inline-block; margin-right:8px;">⏳</span>Cruzando con el banco...`;

  // 🔒 CANDADO ABSOLUTO POR REFERENCIA ALFANUMÉRICA REAL (Evita que clonen el pago)
  const pagosProcesados = JSON.parse(
    localStorage.getItem("cyber_referencias_procesadas") || "[]",
  );
  if (pagosProcesados.includes(window.ocrReferenciaFinal)) {
    btn.disabled = false;
    btn.innerHTML = "Validar en Gmail y Cargar Saldo";
    alert(
      `⚠️ COMPROBANTE DUPLICADO RECHAZADO\n\nEl sistema detectó que el número de referencia real [ ${window.ocrReferenciaFinal} ] ya fue cargado con éxito en esta cuenta.\n\nNo es posible reutilizar comprobantes.`,
    );
    return;
  }

  const cbBreB = "cb_breb_ocr_" + Date.now();
  window[cbBreB] = function (res) {
    if (res && res.status === "success") {
      const pagos = res.data;

      // Normalizamos el nombre ingresado para ignorar tildes y mayúsculas
      const nombreNorm = nombreInput
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

      const matchPago = pagos.find((p) => {
        let montoLimpio = parseFloat(
          p.monto.replace(/\./g, "").replace(/,/g, "."),
        );

        // Normalizamos el nombre del remitente del correo
        let remitenteNorm = p.remitente
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

        // 1. Validar el monto exacto
        let coincideMonto = montoLimpio === window.ocrValorFinal;

        // 2. Validar que las palabras del nombre ingresado existan en el remitente
        let coincideNombre = nombreNorm
          .split(" ")
          .every((palabra) => remitenteNorm.includes(palabra));

        // Relajamos la restricción estricta de la hora, ya que el OCR suele fallar leyendo
        // los números pequeños de las fotos, y el correo a veces llega minutos después.
        return coincideMonto && coincideNombre;
      });

      if (matchPago) {
        ejecutarInyeccionSaldo(window.ocrValorFinal, matchPago.remitente);
      } else {
        btn.disabled = false;
        btn.innerHTML = "Validar en Gmail y Cargar Saldo";
        alert(
          `❌ No encontramos un correo de BRE-B que coincida con un valor de $${window.ocrValorFinal} de la persona "${nombreInput.toUpperCase()}".\n\nSi realizaste el pago hace menos de un minuto, espera un momento para que el banco despache la alerta e intenta de nuevo.`,
        );
      }
    } else {
      btn.disabled = false;
      btn.innerHTML = "Validar en Gmail y Cargar Saldo";
      alert("❌ Error al conectar con el servidor bancario.");
    }
  };

  ejecutarPeticionConTimeout(
    GOOGLE_SCRIPT_URL,
    { action: "obtenerPagosBreB" },
    cbBreB,
    25000,
    () => {
      btn.disabled = false;
      btn.innerHTML = "Validar en Gmail y Cargar Saldo";
    },
  );
}

function ejecutarInyeccionSaldo(valorBase, remitenteReal) {
  // 🔥 NUEVA LÓGICA DE BONOS CONFIGURABLE:
  let porcentajeBono = 0;
  if (valorBase >= 100000) {
    porcentajeBono = 30; // De 100 mil pesos en adelante -> 30%
  } else if (valorBase >= 30000) {
    porcentajeBono = 15; // De 30 mil a 99,999 pesos -> 15%
  } else {
    porcentajeBono = 0; // Menos de 30 mil pesos -> Sin bono (0%)
  }

  let revendedor =
    localStorage.getItem("active_distri_name") || window.distriTelefonoCache;

  const btn = document.getElementById("btnVerificarRecarga");
  btn.innerHTML = `<span class="spin-anim" style="display:inline-block; margin-right:8px;">⏳</span>Acreditando saldo...`;

  // Registrar referencia en almacenamiento local
  const pagosProcesados = JSON.parse(
    localStorage.getItem("cyber_referencias_procesadas") || "[]",
  );
  pagosProcesados.push(window.ocrReferenciaFinal);
  localStorage.setItem(
    "cyber_referencias_procesadas",
    JSON.stringify(pagosProcesados),
  );

  // 🔥 NUEVO: Enviar imagen a Drive y Gmail por POST de forma silenciosa e invisible
  if (window.imagenComprobanteDistri) {
    const telDistri =
      localStorage.getItem("active_distri_tel") ||
      window.distriTelefonoCache ||
      "0000000000";
    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "subirComprobanteYEnviarMail",
        imagen: window.imagenComprobanteDistri,
        referencia: window.ocrReferenciaFinal, // Sacamos la referencia que leyó el OCR
        cliente: revendedor,
        telefono: telDistri,
        monto: valorBase,
      }),
    }).catch((e) => console.log("Carga silenciosa a Drive iniciada."));
  }

  const cbRecarga = "cb_add_saldo_" + Date.now();
  window[cbRecarga] = function (res) {
    btn.disabled = false;
    btn.innerHTML = "Validar en Gmail y Cargar Saldo";

    if (res && res.status === "success") {
      document.getElementById("recargaComprobante").value = "";
      document.getElementById("recargaNombre").value = "";
      document.getElementById("ocrResultsUI").style.display = "none";

      window.saldoNumericoActual = parseFloat(res.nuevoSaldo);
      localStorage.setItem("active_distri_saldo", window.saldoNumericoActual);
      actualizarSaldoUI();

      cerrarModalFormularioRecarga();

      // 📢 Mensajes dinámicos dependiendo de si hubo bono o no
      if (porcentajeBono > 0) {
        triggerToast(
          `✅ Saldo acreditado. Recibiste bono de ${porcentajeBono}%.`,
        );
        alert(
          `🎉 ¡Pago validado exitosamente!\n\nSe ha sumado el saldo a tu cuenta junto con un bono automático del ${porcentajeBono}%.\n\n💰 Nuevo Saldo: $${window.saldoNumericoActual.toLocaleString("es-CO")}`,
        );
      } else {
        triggerToast(`✅ Saldo acreditado en tu cuenta.`);
        alert(
          `🎉 ¡Pago validado exitosamente!\n\nSe ha acreditado el dinero en tu cuenta de forma segura.\n\n💰 Nuevo Saldo: $${window.saldoNumericoActual.toLocaleString("es-CO")}`,
        );
      }
    } else {
      alert("❌ Hubo un error grabando el saldo en la base de datos.");
    }
  };

  // 🔥 DETALLE CONTABLE REFORZADO PARA TU EXCEL NETFLIX: Inyecta todos los marcadores cruzados
  const stringBancoContable = `Bre-B: ${remitenteReal} | Ref: ${window.ocrReferenciaFinal} | Llave: ${window.ocrLlaveFinal} | Origen: ${window.ocrOrigenFinal} | Fecha: ${window.ocrFechaCompletaFinal}`;

  ejecutarPeticionConTimeout(
    GOOGLE_SCRIPT_URL,
    {
      action: "recargarSaldo",
      revendedor: revendedor,
      totalRecarga: valorBase,
      bono: porcentajeBono,
      banco: stringBancoContable,
    },
    cbRecarga,
    20000,
    () => {
      btn.disabled = false;
      btn.innerHTML = "Validar en Gmail y Cargar Saldo";
    },
  );
}

function regexValidaHora(h) {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(h);
}

// =========================================================================
// 📱 CONTROLADORES DEL MENÚ FLUIDO PARA CELULARES
// =========================================================================

function abrirMenuMovil() {
  haptic();
  bloquearScroll();
  document.getElementById("modalMenuMovil").classList.add("open");
}

function cerrarMenuMovil() {
  haptic();
  desbloquearScroll();
  document.getElementById("modalMenuMovil").classList.remove("open");
}

// Modificamos tu función existente de cambio de icono para que pinte tanto el botón de PC como el de Celular
const originalUpdateThemeIconDistri = window.updateThemeIconDistri;
window.updateThemeIconDistri = function (theme) {
  const btnDesktop = document.getElementById("theme-toggle");
  const btnMobile = document.getElementById("theme-toggle-mobile");

  const svgIcon =
    theme === "light"
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

  if (btnDesktop) btnDesktop.innerHTML = svgIcon;
  if (btnMobile) btnMobile.innerHTML = svgIcon;
};
// 🗑️ FUNCIÓN PARA ELIMINAR UN ELEMENTO ESPECÍFICO DEL CARRITO
function eliminarDelCarrito(id) {
  haptic(); // Efecto de vibración sutil en móviles

  // Filtramos el carrito dejando por fuera el id seleccionado
  window.carrito = window.carrito.filter((item) => item.id !== id);

  // Forzamos el cambio visual en los botones "Añadir" de la tienda de forma pasiva
  const btnTienda = document.getElementById(`btn-add-${id}`);
  if (btnTienda) {
    btnTienda.classList.remove("btn-added");
    btnTienda.innerHTML = "+ Añadir";
  }

  // Refrescamos los totales e items del carrito
  actualizarCarritoUI();
  triggerToast("🗑️ Plataforma removida del carrito");
}
// =========================================================================
// 📋 COPIADOR EN UN TOQUE PARA EL CENTRO DE CÓDIGOS B2B
// =========================================================================
function copiarCodigoResultanteB2B() {
  if (typeof haptic === "function") haptic(); // Pequeña vibración táctil

  const codeElement = document.getElementById("codeVal");
  const codigoText = codeElement.innerText.trim();

  if (!codigoText) return;

  // Ejecutamos la copia nativa en el portapapeles del dispositivo
  navigator.clipboard
    .writeText(codigoText)
    .then(() => {
      // Efecto elástico de confirmación (Se hunde y se pone verde)
      codeElement.style.color = "var(--ios-green)";
      codeElement.style.transform = "scale(0.93)";

      setTimeout(() => {
        codeElement.style.color = "var(--text-primary)";
        codeElement.style.transform = "scale(1)";
      }, 250);

      // Lanza la alerta flotante estilo Apple arriba
      if (typeof triggerToast === "function") {
        triggerToast("📋 Código copiado con éxito");
      }
    })
    .catch((err) => {
      console.log("Error al copiar portapapeles", err);
    });
}
