const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzWdHzqlwlAWcCuXngcurIIrZVCHl5QEhRUkHTL90dhNqfm1iXnvSvDli5G_r6zlmHY/exec";
const BOT_API_URL =
  "https://script.google.com/macros/s/AKfycbyk2_OGWfJ9qTSKOuRVo7bcspAKBRUn_WLEdP28GuabQ5z7cDYShYhMlHfCiuTOoQ66/exec";

window.carrito = [];
window.saldoNumericoActual = 0;
window.distriTelefonoCache = "";
window.distriCorreoRegistradoEnSheets = "";
window.fichasCheckoutPendientes = "";

// =========================================================================
// 🎨 CATÁLOGO DE PRODUCTOS (Logotipos Originales Vectorizados)
// =========================================================================
const catálogoProductos = [
  {
    id: "NETFLIX",
    nombre: "Netflix Premium",
    precio: 10000,
    color: "#E50914",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6.1 2v20h3.5v-9.7l5.2 9.7h3.1V2h-3.5v9.5l-5.1-9.5H6.1z"/></svg>`,
  },
  {
    id: "DISNEY-PREMIUM",
    nombre: "Disney+ Premium",
    precio: 10000,
    color: "#1AE1FF",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.17 12.18c-.8.81-2.07 1.24-3.5 1.24-2.46 0-4.14-1.25-4.14-3.07 0-1.92 1.83-3.05 4.38-3.05 1.05 0 2.05.24 2.82.6l-1 1.94c-.58-.26-1.24-.4-1.8-.4-1.3 0-2.08.5-2.08 1.13 0 .62.77 1.05 2.02 1.05.7 0 1.26-.13 1.7-.35l1.6 1.91zM20 9h-1.5V7.5h-1V9H16v1h1.5v1.5h1V10H20V9z"/></svg>`,
  },
  {
    id: "AMAZON",
    nombre: "Prime Video",
    precio: 5000,
    color: "#00A8E1",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 14.8c-.86 1.34-2.58 2.68-5.65 2.68-2.67 0-4.66-.75-5.91-1.45L5 15.35c1.4.74 3.73 1.55 6.45 1.55 3.32 0 5.48-1.52 6.2-2.1z"/><path d="M19 13.5c0-.66-.94-.85-1.36-.31l-1.04 1.34c-.16.21.11.47.33.31l1.41-.98c.45-.31.66.19.66.19z"/></svg>`,
  },
  {
    id: "DISNEY-ESTANDAR",
    nombre: "Disney+ Estándar",
    precio: 4000,
    color: "#0063e5",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.17 12.18c-.8.81-2.07 1.24-3.5 1.24-2.46 0-4.14-1.25-4.14-3.07 0-1.92 1.83-3.05 4.38-3.05 1.05 0 2.05.24 2.82.6l-1 1.94c-.58-.26-1.24-.4-1.8-.4-1.3 0-2.08.5-2.08 1.13 0 .62.77 1.05 2.02 1.05.7 0 1.26-.13 1.7-.35l1.6 1.91zM20 9h-1.5V7.5h-1V9H16v1h1.5v1.5h1V10H20V9z"/></svg>`,
  },
  {
    id: "HBO-MAX",
    nombre: "Max (HBO)",
    precio: 3000,
    color: "#5856d6",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2 8v8h2v-5l2 3 2-3v5h2V8H8L6 11 4 8zm10 8l1-8h2l1 8h-1.5l-.3-2h-1.4l-.3 2H12zm1.6-3h1l-.5-3-.5 3zm4.4-5l1.5 3L21 8h1.5l-2.2 4 2.2 4H21l-1.5-3-1.5 3h-1.5l2.2-4L16.5 8z"/></svg>`,
  },
  {
    id: "PARAMOUNT",
    nombre: "Paramount+",
    precio: 3000,
    color: "#0078ff",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-6 10h12l-6-10zm-3 11l3 4 3-4H9zm10-5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm4-5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm6 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>`,
  },
  {
    id: "VIX",
    nombre: "Vix+",
    precio: 3000,
    color: "#ff9500",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 6h3l3 8 3-8h3l-4.5 12H9.5L5 6zm11 1h2v3h3v2h-3v3h-2v-3h-3V10h3V7z"/></svg>`,
  },
  {
    id: "CRUNCHYROLL",
    nombre: "Crunchyroll",
    precio: 3000,
    color: "#ff5e00",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 17.5A7.5 7.5 0 1119.5 12 7.5 7.5 0 0112 19.5zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8.5A3.5 3.5 0 1115.5 12 3.5 3.5 0 0112 15.5z"/></svg>`,
  },
  {
    id: "PLEX",
    nombre: "Plex TV",
    precio: 3000,
    color: "#ffcc00",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.85 2.5a9.5 9.5 0 100 19 9.5 9.5 0 000-19zm-3.2 13.9l3.5-4.4-3.5-4.4h2.9l3.5 4.4-3.5 4.4H8.65z"/></svg>`,
  },
  {
    id: "APPLE-TV",
    nombre: "Apple TV",
    precio: 3000,
    color: "#ffffff",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.15 2c-.06 0-1.78.06-3.13 1.54-.7.76-1.18 1.82-1.18 2.92 0 .1.01.21.03.31 1.34-.04 2.87-.76 3.65-1.63.63-.7 1.1-1.72 1.05-2.73-.13-.02-.27-.03-.42-.03zM14.9 6.8c-1.38 0-2.61.85-3.29.85-.68 0-1.75-.76-2.88-.76-1.5 0-2.89.87-3.64 2.18-1.55 2.66-.4 6.6 1.11 8.76.74 1.06 1.6 2.22 2.74 2.18 1.09-.04 1.53-.7 2.86-.7s1.73.7 2.88.68c1.18-.02 1.93-1.07 2.65-2.13.85-1.22 1.2-2.4 1.22-2.46-.03-.01-2.31-.89-2.34-3.53-.03-2.2 1.8-3.25 1.88-3.3-.98-1.42-2.52-1.62-3.1-1.68z"/></svg>`,
  },
  {
    id: "UNIVERSAL",
    nombre: "Universal+",
    precio: 3000,
    color: "#00d2ff",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zM8 7v6a4 4 0 008 0V7h-2v6a2 2 0 01-4 0V7H8z"/></svg>`,
  },
  {
    id: "YOUTUBE",
    nombre: "YouTube Premium",
    precio: 10000,
    color: "#FF0000",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21.58 6.19a2.68 2.68 0 00-1.88-1.89C17.96 3.85 12 3.85 12 3.85s-5.96 0-7.7.44a2.68 2.68 0 00-1.88 1.89C2 7.93 2 12 2 12s0 4.07.42 5.81a2.68 2.68 0 001.88 1.89C6.04 20.15 12 20.15 12 20.15s5.96 0 7.7-.44a2.68 2.68 0 001.88-1.89C22 16.07 22 12 22 12s0-4.07-.42-5.81zM10 15.48V8.52L15.93 12 10 15.48z"/></svg>`,
  },
  {
    id: "SPOTIFY",
    nombre: "Spotify Premium",
    precio: 10000,
    color: "#1DB954",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.59 14.42c-.18.3-.56.4-.86.2-2.38-1.45-5.37-1.78-8.89-.98-.34.07-.67-.14-.74-.47-.08-.34.14-.67.47-.74 3.86-.88 7.15-.51 9.82 1.12.3.18.39.56.21.85zm1.22-3.37c-.22.37-.73.49-1.1.27-2.98-1.84-6.8-2.22-10.12-1.22-.4.12-.83-.1-.95-.5-.12-.4.1-.83.5-.95 3.8-1.14 8.08-.71 11.4 1.33.37.23.49.74.27 1.1zm.1-3.5C14.54 7.56 9.4 7.4 5.48 8.6c-.48.15-1-.13-1.15-.62-.15-.48.13-1 .62-1.15 4.5-1.38 10.22-1.18 14.15 1.14.43.25.57.82.32 1.25-.25.43-.82.57-1.25.32z"/></svg>`,
  },
  {
    id: "IPTV",
    nombre: "IPTV Premium",
    precio: 7000,
    color: "#ff37a6",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M8 22h8M12 19v3"/></svg>`,
  },
  {
    id: "METEGOL",
    nombre: "Metegol TV",
    precio: 12000,
    color: "#52c41a",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20M12 12m-4 0a4 4 0 108 0 4 4 0 10-8 0"/></svg>`,
  },
  {
    id: "DEEZER",
    nombre: "Deezer Music",
    precio: 8000,
    color: "#ff2a6d",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="16" width="3" height="4"/><rect x="8" y="12" width="3" height="8"/><rect x="13" y="8" width="3" height="12"/><rect x="18" y="4" width="3" height="16"/></svg>`,
  },
  {
    id: "MUBI",
    nombre: "MUBI Cine",
    precio: 3000,
    color: "#00f5ff",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h4l5 7 5-7h4v12h-3v-8.5l-6 8-6-8V18H3V6z"/></svg>`,
  },
];

const PLATAFORMAS_MANUALES = [
  "YOUTUBE",
  "SPOTIFY",
  "IPTV",
  "METEGOL",
  "DEEZER",
  "MUBI",
];

// =========================================================================
// UTILERÍAS GLOBALES
// =========================================================================
function haptic() {
  if (navigator.vibrate) navigator.vibrate(15);
}

function formatMoneda(v) {
  return (
    "$" +
    parseFloat(v || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })
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
// 🔒 LOGIN Y SESIÓN
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
    if (document.getElementById("node_" + cbName))
      document.getElementById("node_" + cbName).remove();
    delete window[cbName];

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
            if (document.getElementById("node_" + cbSend))
              document.getElementById("node_" + cbSend).remove();
            delete window[cbSend];

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
          const scriptEnvio = document.createElement("script");
          scriptEnvio.id = "node_" + cbSend;
          scriptEnvio.src = `${GOOGLE_SCRIPT_URL}?action=enviarCodigoDistri&correo=${encodeURIComponent(window.distriCorreoRegistradoEnSheets)}&callback=${cbSend}&_ts=${Date.now()}`;
          document.body.appendChild(scriptEnvio);
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
  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerDistribuidores&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
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
    if (document.getElementById("node_" + cbReg))
      document.getElementById("node_" + cbReg).remove();
    delete window[cbReg];

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
  const script = document.createElement("script");
  script.id = "node_" + cbReg;
  script.src = `${GOOGLE_SCRIPT_URL}?action=registrarEmailNuevoDistri&telefono=${encodeURIComponent(window.distriTelefonoCache)}&correo=${encodeURIComponent(nuevoEmail)}&callback=${cbReg}&_ts=${Date.now()}`;
  document.body.appendChild(script);
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
    if (document.getElementById("node_" + cbVerify))
      document.getElementById("node_" + cbVerify).remove();
    delete window[cbVerify];

    if (res && res.status === "success" && res.data) {
      // 🔥 FIX: Usamos localStorage para que la sesión sea permanente
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
  const script = document.createElement("script");
  script.id = "node_" + cbVerify;
  script.src = `${GOOGLE_SCRIPT_URL}?action=verificarCodigoDistri&correo=${encodeURIComponent(window.distriCorreoRegistradoEnSheets)}&code=${encodeURIComponent(tokenInput)}&callback=${cbVerify}&_ts=${Date.now()}`;
  document.body.appendChild(script);
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

  // 🔥 FIX BLINDADO: Forzar la aparición del botón flotante por encima de cualquier CSS
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
  if (window.saldoNumericoActual > 0 && window.saldoNumericoActual < 1000)
    window.saldoNumericoActual *= 1000;

  actualizarSaldoUI();
  renderTienda();
  cargarStockEnTienda();
  cargarDatosFinancierosYAlertas(telefono);

  // 🔥 FIX: Inicializador seguro del ciclo de actualización cada 5 minutos
  if (window.cyberIntervaloSaldoFondo)
    clearInterval(window.cyberIntervaloSaldoFondo);
  window.cyberIntervaloSaldoFondo = setInterval(
    refrescarSaldoDistribuidorFondo,
    5 * 60 * 1000,
  );
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
      tipo: "Nueva", // 🔥 NUEVO: Para saber si es cuenta nueva o reno
      correoReno: "", // 🔥 NUEVO: Guardará la cuenta seleccionada
    });
  triggerToast(`🛒 ${prod.nombre} añadido.`);
  actualizarCarritoUI();

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

// 🔥 LÓGICA DE RENOVACIONES EN EL CARRITO B2B
window.cuentasActivasB2B = [];

window.cambiarTipoVentaCarrito = function (id, tipo) {
  let item = window.carrito.find((i) => i.id === id);
  if (item) {
    item.tipo = tipo;
    // Si se arrepiente y vuelve a cambiar a "Nueva", reseteamos la memoria
    if (tipo === "Nueva") {
      item.correoReno = "";
      item.amount = 1;
      document.getElementById("cartClientName").value = "";
    }
    actualizarCarritoUI();
  }
};

window.abrirModalRenoB2B = function (idItem) {
  haptic();
  const telDistri =
    localStorage.getItem("active_distri_tel") || window.distriTelefonoCache;
  const modal = document.getElementById("modalRenovacionDistri");
  const container = document.getElementById("listaCuentasModalRenoDistri");

  container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-secondary);"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:10px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><br>Buscando tus pantallas de Netflix...</div>`;
  modal.classList.add("open");

  const cbName = "cb_reno_b2b_" + Date.now();
  window[cbName] = function (res) {
    const node = document.getElementById("node_" + cbName);
    if (node) node.remove();
    delete window[cbName];

    container.innerHTML = "";
    if (res && res.status === "success" && res.data.length > 0) {
      // Filtrar solo las que son @cybernetsp.com para evitar basura
      window.cuentasActivasB2B = res.data.filter((c) =>
        c.correo.toLowerCase().includes("@cybernetsp.com"),
      );

      if (window.cuentasActivasB2B.length === 0) {
        container.innerHTML =
          "<div style='color:var(--ios-orange); text-align:center; padding: 20px;'>No se detectaron cuentas aptas para renovación.</div>";
        return;
      }

      window.cuentasActivasB2B.forEach((cuenta) => {
        let div = document.createElement("div");
        div.className = "card-ios item-reno-b2b";
        div.style =
          "padding: 15px; cursor: pointer; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 14px;";
        div.setAttribute(
          "data-search",
          cuenta.correo.toLowerCase() +
            " " +
            cuenta.perfil.toLowerCase() +
            " " +
            cuenta.cliente.toLowerCase(),
        );
        div.innerHTML = `
                    <div style="color: var(--text-primary); font-weight: 700; font-size: 0.95rem; margin-bottom: 6px;">${cuenta.correo}</div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary);">
                        <span>Perfil: <b style="color: var(--ios-blue);">${cuenta.perfil}</b></span>
                        <span>Cliente: <b>${cuenta.cliente}</b></span>
                    </div>
                `;
        div.onclick = function () {
          let itemCarrito = window.carrito.find((i) => i.id === idItem);
          if (itemCarrito) {
            itemCarrito.correoReno = `${cuenta.correo} | Perfil: ${cuenta.perfil}`;

            // 🔥 FIX 1: Autocompletar el nombre del cliente
            let inputNombre = document.getElementById("cartClientName");
            if (
              inputNombre &&
              cuenta.cliente &&
              cuenta.cliente !== "N/A" &&
              cuenta.cliente.toLowerCase() !== "cliente"
            ) {
              inputNombre.value = cuenta.cliente;
            }

            // 🔥 FIX 2: Auto-detectar la cantidad de pantallas
            let cantidadDetectada = cuenta.perfil
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

window.filtrarModalRenovacionB2B = function () {
  const q = document
    .getElementById("buscadorModalRenoDistri")
    .value.toLowerCase()
    .trim();
  document.querySelectorAll(".item-reno-b2b").forEach((item) => {
    item.style.display = item.getAttribute("data-search").includes(q)
      ? "block"
      : "none";
  });
};

function actualizarCarritoUI() {
  const container = document.getElementById("cartItemsContainer");
  const countBadge = document.getElementById("cartCountBadge");
  const fabBadge = document.getElementById("fabCartCountBadge");
  const totalDisplay = document.getElementById("cartTotalCost");
  const btnCheckout = document.getElementById("btnCheckoutShop");

  if (window.carrito.length === 0) {
    if (container)
      container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); font-size: 0.85rem; padding: 20px 0;">Tu carrito está vacío.</div>`;
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

    // 🔥 LÓGICA EXCLUSIVA PARA MOSTRAR BOTÓN DE RENOVAR EN NETFLIX
    let opcionesReno = "";
    if (item.id === "NETFLIX") {
      let isReno = item.tipo === "Reno";
      let displayBtn = isReno ? "block" : "none";
      let btnText = item.correoReno ? item.correoReno : "Seleccionar Cuenta";
      let btnColor = item.correoReno ? "var(--ios-green)" : "var(--ios-orange)";

      opcionesReno = `
          <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px; width: 100%; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 10px;">
              <select class="input-ios" style="margin: 0; padding: 8px; font-size: 0.8rem; border-radius: 10px; font-weight: 600;" onchange="window.cambiarTipoVentaCarrito('${item.id}', this.value)">
                  <option value="Nueva" ${!isReno ? "selected" : ""}>Crear Pantalla Nueva</option>
                  <option value="Reno" ${isReno ? "selected" : ""}>Renovar Pantalla Existente</option>
              </select>
              <button class="btn-ios" style="display: ${displayBtn}; background: rgba(0,0,0,0.2); color: ${btnColor}; border: 1px solid ${btnColor}; padding: 10px; border-radius: 10px; font-size: 0.75rem; font-weight: 700; width: 100%; text-align: center; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;" onclick="window.abrirModalRenoB2B('${item.id}')">
                  ${btnText}
              </button>
          </div>
        `;
    }

    html += `
      <div class="cart-item-row" style="display:flex; flex-direction:column; gap:10px; background:rgba(255,255,255,0.02); padding:12px; border-radius:16px; border:1px solid rgba(255,255,255,0.04);">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <div style="display:flex; flex-direction:column; text-align:left; overflow:hidden; flex-grow:1;">
              <strong style="font-size:0.9rem; color:var(--text-primary); text-overflow:ellipsis; white-space:nowrap; overflow:hidden;">${item.nombre}</strong>
              <span style="font-size:0.85rem; color:var(--ios-green); font-family:monospace; font-weight:700;">${formatMoneda(subtotal)} <span style="font-size:0.65rem; color:var(--text-secondary); font-weight:normal;">(${formatMoneda(item.precio)} c/u)</span></span>
            </div>
            <div style="display:flex; align-items:center; background:rgba(0,0,0,0.2); border-radius:30px; padding:2px; border:1px solid rgba(255,255,255,0.05);">
              <button onclick="cambiarCantidad('${item.id}', -1)" style="background:transparent; border:none; color:white; width:26px; height:26px; font-weight:bold; cursor:pointer;">-</button>
              <span style="font-family:monospace; font-size:0.9rem; font-weight:bold; min-width:20px; text-align:center;">${item.amount}</span>
              <button onclick="cambiarCantidad('${item.id}', 1)" style="background:transparent; border:none; color:white; width:26px; height:26px; font-weight:bold; cursor:pointer;">+</button>
            </div>
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
      btnCheckout.style.background = "var(--ios-red, #ff453a)";
      btnCheckout.innerText = "SALDO INSUFICIENTE";
    } else {
      btnCheckout.disabled = false;
      btnCheckout.style.background = "var(--ios-blue, #0a84ff)";
      btnCheckout.innerText = "CONFIRMAR COMPRA";
    }
  }
}

function procesarCompraDistribuidor() {
  haptic();
  if (window.carrito.length === 0) return;
  let totalCost = window.carrito.reduce(
    (sum, item) => sum + item.precio * item.amount,
    0,
  );
  if (totalCost > window.saldoNumericoActual) return;

  const inputNombreCliente = document
    .getElementById("cartClientName")
    .value.trim();
  const nombreParaSheets =
    inputNombreCliente !== ""
      ? inputNombreCliente
      : localStorage.getItem("active_distri_name");
  const telefonoDistribuidor = localStorage.getItem("active_distri_tel");

  // 🔥 LÓGICA DE RENOVACIÓN B2B: Recolecta correos y tipos
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

  // Desbloqueamos temporalmente el fondo para el móvil
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

    const btn = document.getElementById("btnCheckoutShop");
    btn.disabled = true;
    btn.innerHTML = `Despachando...`;

    const cbCheckout = "cb_chk_" + Date.now();
    window[cbCheckout] = function (res) {
      btn.disabled = false;
      actualizarCarritoUI();
      if (document.getElementById("node_" + cbCheckout))
        document.getElementById("node_" + cbCheckout).remove();
      delete window[cbCheckout];

      if (res && res.status === "success") {
        let nombreMensaje =
          inputNombreCliente !== "" ? inputNombreCliente : "Cliente";
        let textoFicha = `🌟 ¡Hola, ${nombreMensaje}!\n\nTu pedido ha sido procesado con éxito. Aquí tienes tus accesos: 👇\n\n`;

        // 📅 FIX: Formateador de Fecha de Compra (ej. 5-jun)
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

        // 🛒 FIX: Limpiar Carrito Visualmente
        window.carrito = [];
        document.getElementById("cartClientName").value = "";
        actualizarCarritoUI();

        // 💰 FIX: Sincronización Real de Saldo
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

    const script = document.createElement("script");
    script.id = "node_" + cbCheckout;
    // 🚀 EL FIX ESTÁ AQUÍ MISMO EN LA URL: &correoReno=${encodeURIComponent(correoRenoGlobal)}
    script.src = `${GOOGLE_SCRIPT_URL}?action=registrarVentaDistriB2B&nombre=${encodeURIComponent(nombreParaSheets)}&telefono=${encodeURIComponent(telefonoDistribuidor)}&descripcion=${encodeURIComponent(descripcionLote)}&correoReno=${encodeURIComponent(correoRenoGlobal)}&cantidad=${encodeURIComponent(totalCost)}&callback=${cbCheckout}&_ts=${Date.now()}`;
    document.body.appendChild(script);
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
    if (document.getElementById("node_" + cbBusq))
      document.getElementById("node_" + cbBusq).remove();
    delete window[cbBusq];

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
  const script = document.createElement("script");
  script.id = "node_" + cbBusq;
  script.src = `${GOOGLE_SCRIPT_URL}?action=buscarCuentaGlobal&query=${encodeURIComponent(inputSearch)}&callback=${cbBusq}&_ts=${Date.now()}`;
  document.body.appendChild(script);
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
  if (!m.includes("@cybernetsp.com")) {
    triggerToast("⚠️ Escribe un correo @cybernetsp.com");
    return;
  }
  codeData.correo = m;
  changeCodeStep(4);
  try {
    const query = new URLSearchParams(codeData);
    const res = await (
      await fetch(`${BOT_API_URL}?${query.toString()}`)
    ).json();
    changeCodeStep(5);
    document.getElementById("codeResultBox").style.display = "none";
    document.getElementById("linkResultBox").style.display = "none";
    if (res.exito) {
      document.getElementById("codeResultTitle").innerHTML =
        `<span style="color:var(--ios-green);">¡LOCALIZADO!</span>`;
      document.getElementById("codeResultDesc").innerText =
        res.msj || "Información recuperada:";
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
        `<span style="color:var(--ios-orange);">SIN RESULTADOS</span>`;
      document.getElementById("codeResultDesc").innerText =
        res.msj || "No hay datos recientes.";
    }
  } catch (err) {
    changeCodeStep(5);
    document.getElementById("codeResultTitle").innerText = "Error";
  }
}

function cerrarSesionDistribuidor() {
  if (window.cyberIntervaloSaldoFondo) {
    clearInterval(window.cyberIntervaloSaldoFondo);
  }
  // 🔥 FIX: Destruir la memoria permanente al cerrar sesión
  localStorage.removeItem("active_distri_tel");
  localStorage.removeItem("active_distri_name");
  localStorage.removeItem("active_distri_saldo");
  sessionStorage.clear(); // Limpiamos por si acaso quedó basura

  window.location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  // 🔥 FIX: Leer desde localStorage
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
// 🔄 AUTOREFRESCO AUTOMÁTICO DE SALDO EN SEGUNDO PLANO (CADA 5 MINUTOS)
// =========================================================================
function refrescarSaldoDistribuidorFondo() {
  const telActivo =
    localStorage.getItem("active_distri_tel") || window.distriTelefonoCache;
  if (!telActivo) return;

  const cbName = "cb_background_saldo_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

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
          "🤖 [Cybernet System] Saldo sincronizado automáticamente: ",
          saldoNum,
        );
      }
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerDistribuidores&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}
