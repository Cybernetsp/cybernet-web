const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzWdHzqlwlAWcCuXngcurIIrZVCHl5QEhRUkHTL90dhNqfm1iXnvSvDli5G_r6zlmHY/exec";
const BOT_API_URL =
  "https://script.google.com/macros/s/AKfycbyk2_OGWfJ9qTSKOuRVo7bcspAKBRUn_WLEdP28GuabQ5z7cDYShYhMlHfCiuTOoQ66/exec";

window.carrito = [];
window.saldoNumericoActual = 0;
window.distriTelefonoCache = "";
window.distriCorreoRegistradoEnSheets = "";
window.fichasCheckoutPendientes = "";

const catálogoProductos = [
  {
    id: "NETFLIX",
    nombre: "Netflix Premium",
    precio: 10000,
    color: "#E50914",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 0v24h4.8V12.6L14 24h4.5V0h-4.8v11.4L9.3 0H5.5z"/></svg>`,
  },
  {
    id: "DISNEY-PREMIUM",
    nombre: "Disney+ Premium",
    precio: 10000,
    color: "#1AE1FF",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M3 16c4-6 11-8 18-4M12 6c-3 0-5 3-5 6s2 6 5 6 5-3 5-6-2-6-5-6z"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>`,
  },
  {
    id: "AMAZON",
    nombre: "Prime Video",
    precio: 5000,
    color: "#00A8E1",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13.5c4.5 3 13.5 3 18 0M16.5 14.5c.5-.2 2.5-.5 3.5-.5s-1 1.8-1.5 2.5"/></svg>`,
  },
  {
    id: "DISNEY-ESTANDAR",
    nombre: "Disney+ Estándar",
    precio: 4000,
    color: "#0063e5",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
  },
  {
    id: "HBO-MAX",
    nombre: "Max (HBO)",
    precio: 3000,
    color: "#5856d6",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>`,
  },
  {
    id: "PARAMOUNT",
    nombre: "Paramount+",
    precio: 3000,
    color: "#0078ff",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/></svg>`,
  },
  {
    id: "VIX",
    nombre: "Vix+",
    precio: 3000,
    color: "#ff9500",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 4l7 14 7-14"/></svg>`,
  },
  {
    id: "CRUNCHYROLL",
    nombre: "Crunchyroll",
    precio: 3000,
    color: "#ff5e00",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>`,
  },
  {
    id: "PLEX",
    nombre: "Plex TV",
    precio: 3000,
    color: "#ffcc00",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 2 18 12 6 22 10 12"/></svg>`,
  },
  {
    id: "APPLE-TV",
    nombre: "Apple TV",
    precio: 3000,
    color: "#ffffff",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94 1.07.08 2.16-.52 2.82-1.33z"/></svg>`,
  },
  {
    id: "UNIVERSAL",
    nombre: "Universal+",
    precio: 3000,
    color: "#00d2ff",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(45 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-45 12 12)"/></svg>`,
  },
  {
    id: "YOUTUBE",
    nombre: "YouTube Premium",
    precio: 10000,
    color: "#FF0000",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 12s0 4-1 5.5c-.5 1.5-1.5 2.5-3 3C18 21 12 21 12 21s-6 0-7.5-.5c-1.5-.5-2.5-1.5-3-3C0.5 16 0.5 12 0.5 12s0-4 1-5.5c.5-1.5 1.5-2.5 3-3C6 3 12 3 12 3s6 0 7.5.5c1.5.5 2.5 1.5 3 3 1 1.5 1 5.5 1 5.5zM9.5 8.5v7l6-3.5z"/></svg>`,
  },
  {
    id: "SPOTIFY",
    nombre: "Spotify Premium",
    precio: 10000,
    color: "#1DB954",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.586 14.42c-.18.3-.56.4-.86.2-2.38-1.45-5.37-1.78-8.89-.98-.34.07-.67-.14-.74-.47-.08-.34.14-.67.47-.74 3.86-.88 7.15-.51 9.82 1.12.3.18.39.56.21.85z"/></svg>`,
  },
  {
    id: "IPTV",
    nombre: "IPTV Premium",
    precio: 7000,
    color: "#ff37a6",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>`,
  },
  {
    id: "METEGOL",
    nombre: "Metegol TV",
    precio: 12000,
    color: "#52c41a",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>`,
  },
  {
    id: "DEEZER",
    nombre: "Deezer Music",
    precio: 8000,
    color: "#ff2a6d",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 14h3v4H3zm5-4h3v8H8zm5-4h3v12h-3zm5 2h3v10h-3z"/></svg>`,
  },
  {
    id: "MUBI",
    nombre: "MUBI Cine",
    precio: 3000,
    color: "#00f5ff",
    logo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>`,
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

// Convertimos "5DEJUNIO" a Objeto Date para calcular vencimientos
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
  let year = now.getFullYear(); // Estamos en 2026 por sistema
  let d = new Date(year, month, day);

  // Si la fecha calculada es mucho más antigua que hoy, asumimos que es del otro año
  if (d < now && now.getMonth() - month > 6) {
    d.setFullYear(year + 1);
  }
  return d;
}

// =========================================================================
// 🔒 LOGIN
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
      sessionStorage.setItem("active_distri_tel", window.distriTelefonoCache);
      sessionStorage.setItem(
        "active_distri_name",
        res.data.nombre.toUpperCase(),
      );
      sessionStorage.setItem("active_distri_saldo", res.data.saldo);
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
// 💼 INTERFAZ B2B (DASHBOARD) Y ALERTAS
// =========================================================================
function entrarAlPortalDistribuidor(nombre, telefono, saldo) {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("dashboardSection").style.display = "flex";
  document.getElementById("distriWelcomeName").innerText = `¡Hola, ${nombre}!`;
  document.getElementById("distriWelcomePhone").innerText =
    `Distribuidor • Tel: ${telefono}`;

  window.saldoNumericoActual =
    parseFloat(String(saldo).replace(/[^\d.-]/g, "")) || 0;
  if (window.saldoNumericoActual > 0 && window.saldoNumericoActual < 1000)
    window.saldoNumericoActual *= 1000;

  actualizarSaldoUI();
  renderTienda();
  cargarStockEnTienda();
  cargarDatosFinancierosYAlertas(telefono); // 🔥 Carga el Historial y Vencimientos
}

function actualizarSaldoUI() {
  const f = formatMoneda(window.saldoNumericoActual);
  document.getElementById("distriBarBalance").innerText = f;
  document.getElementById("cartTotalSaldo").innerText = f;
}

// 🔥 NUEVO: Cargar Historial y Renovaciones
function cargarDatosFinancierosYAlertas(tel) {
  const cbData = "cb_dash_" + Date.now();
  window[cbData] = function (res) {
    if (document.getElementById("node_" + cbData))
      document.getElementById("node_" + cbData).remove();
    delete window[cbData];

    if (res && res.status === "success") {
      // 1. Llenar Tabla Historial
      const tbody = document.getElementById("tablaHistorialBody");
      let trs = "";
      if (res.historial && res.historial.length > 0) {
        res.historial.forEach((mov) => {
          // Detectar si es recarga (verde) o descuento (rojo)
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

      // 2. Procesar Renovaciones Próximas
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
  document.getElementById("modalEstadoCuenta").classList.add("open");
}
function cerrarModalHistorial() {
  haptic();
  document.getElementById("modalEstadoCuenta").classList.remove("open");
}

// =========================================================================
// 🛒 E-COMMERCE MAYORISTA
// =========================================================================
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
          if (badge) {
            if (item.libres > 0) {
              badge.innerHTML = `🟢 ${item.libres} Disp.`;
              badge.style.background = "rgba(48, 209, 88, 0.1)";
              badge.style.color = "var(--ios-green)";
              badge.style.borderColor = "rgba(48, 209, 88, 0.2)";
            } else {
              badge.innerHTML = `🔴 Agotado`;
              badge.style.background = "rgba(255, 69, 58, 0.1)";
              badge.style.color = "var(--ios-red)";
              badge.style.borderColor = "rgba(255, 69, 58, 0.2)";
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
        <button onclick="agregarAlCarrito('${p.id}')" class="btn-ios btn-primary" style="margin:4px 0 0 0; padding:6px 12px; font-size:0.75rem; border-radius:30px; font-weight:700; width:100%;">+ Añadir</button>
      </div>`;
  });
  container.innerHTML = html;
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
    });
  triggerToast(`🛒 ${prod.nombre} añadido.`);
  actualizarCarritoUI();
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

function actualizarCarritoUI() {
  const container = document.getElementById("cartItemsContainer");
  const countBadge = document.getElementById("cartCountBadge");
  const totalDisplay = document.getElementById("cartTotalCost");
  const btnCheckout = document.getElementById("btnCheckoutShop");

  if (window.carrito.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); font-size: 0.85rem; padding: 20px 0;">Tu carrito está vacío.</div>`;
    countBadge.innerText = "0";
    totalDisplay.innerText = "$0";
    btnCheckout.disabled = true;
    return;
  }

  let html = "",
    totalCost = 0,
    totalItems = 0;
  window.carrito.forEach((item) => {
    const subtotal = item.precio * item.amount;
    totalCost += subtotal;
    totalItems += item.amount;
    html += `
      <div class="cart-item-row" style="display:flex; align-items:center; justify-content:space-between; gap:10px; background:rgba(255,255,255,0.02); padding:8px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.04);">
        <div style="display:flex; flex-direction:column; text-align:left; overflow:hidden; flex-grow:1;">
          <strong style="font-size:0.85rem; color:var(--text-primary); text-overflow:ellipsis; white-space:nowrap; overflow:hidden;">${item.nombre}</strong>
          <span style="font-size:0.85rem; color:var(--ios-green); font-family:monospace; font-weight:700;">${formatMoneda(subtotal)} <span style="font-size:0.65rem; color:var(--text-secondary); font-weight:normal;">(${formatMoneda(item.precio)} c/u)</span></span>
        </div>
        <div style="display:flex; align-items:center; background:rgba(0,0,0,0.2); border-radius:30px; padding:2px; border:1px solid rgba(255,255,255,0.05);">
          <button onclick="cambiarCantidad('${item.id}', -1)" style="background:transparent; border:none; color:white; width:22px; height:22px; font-weight:bold;">-</button>
          <span style="font-family:monospace; font-size:0.85rem; font-weight:bold; min-width:18px; text-align:center;">${item.amount}</span>
          <button onclick="cambiarCantidad('${item.id}', 1)" style="background:transparent; border:none; color:white; width:22px; height:22px; font-weight:bold;">+</button>
        </div>
      </div>`;
  });
  container.innerHTML = html;
  countBadge.innerText = totalItems;
  totalDisplay.innerText = formatMoneda(totalCost);
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

function procesarCompraDistribuidor() {
  haptic();
  if (window.carrito.length === 0) return;
  let totalCost = window.carrito.reduce(
    (sum, item) => sum + item.precio * item.amount,
    0,
  );
  if (totalCost > window.saldoNumericoActual) return;

  let fragmentos = window.carrito.map((item) => `${item.amount} ${item.id}`);
  const descripcionLote = fragmentos.join(" + ");
  const inputNombreCliente = document
    .getElementById("cartClientName")
    .value.trim();
  const nombreParaSheets =
    inputNombreCliente !== ""
      ? inputNombreCliente
      : sessionStorage.getItem("active_distri_name");
  const telefonoDistribuidor = sessionStorage.getItem("active_distri_tel");

  if (
    !confirm(
      `🛒 ¿Confirmar despacho mayorista?\n\n📦 Pedido: ${descripcionLote}\n👤 Cliente: ${nombreParaSheets}\n💵 Costo: ${formatMoneda(totalCost)}`,
    )
  )
    return;

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

      if (res.bloques && res.bloques.length > 0) {
        res.bloques.forEach((bloque) => {
          textoFicha += `🎬 DETALLES DE ${bloque.id.replace(/-/g, " ").toUpperCase()} ✅\n────────────────────\n📧 Correo: ${bloque.correo}\n🔐 Contraseña: ${bloque.clave}\n`;
          if (bloque.perfil && bloque.perfil !== "N/A" && bloque.perfil !== "")
            textoFicha += `👤 Perfil: ${bloque.perfil}\n`;
          if (bloque.pin && bloque.pin !== "N/A" && bloque.pin !== "")
            textoFicha += `🔑 Pin del Perfil: ${bloque.pin}\n`;
          textoFicha += `📅 Fecha de Vencimiento: ${bloque.venc.toLowerCase()}\n🛒 Fecha de Compra: Hoy\n\n`;
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
        btnWhatsapp.parentElement.href = `https://wa.me/573127706726?text=${waMsg}`;
        btnWhatsapp.parentElement.style.display = "block";
      } else {
        btnWhatsapp.parentElement.style.display = "none";
      }

      document.getElementById("successCheckoutOverlay").classList.add("open");

      window.carrito = [];
      document.getElementById("cartClientName").value = "";
      window.saldoNumericoActual -= totalCost;
      actualizarSaldoUI();
      cargarStockEnTienda();
      cargarDatosFinancierosYAlertas(telefonoDistribuidor); // Refresca el historial y vencimientos

      if (res.bloques && res.bloques.length > 0) {
        document.getElementById("inputCasilleroSearch").value =
          res.bloques[0].correo;
        buscarCasilleroDistri();
      }
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de red."));
    }
  };
  const script = document.createElement("script");
  script.id = "node_" + cbCheckout;
  script.src = `${GOOGLE_SCRIPT_URL}?action=registrarVentaDistriB2B&nombre=${encodeURIComponent(nombreParaSheets)}&telefono=${encodeURIComponent(telefonoDistribuidor)}&descripcion=${encodeURIComponent(descripcionLote)}&cantidad=${encodeURIComponent(totalCost)}&callback=${cbCheckout}`;
  document.body.appendChild(script);
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
  document.getElementById("successCheckoutOverlay").classList.remove("open");
}

// =========================================================================
// 📡 BÓVEDA DE CUENTAS
// =========================================================================
function buscarCasilleroDistri() {
  haptic();
  const inputSearch = document
    .getElementById("inputCasilleroSearch")
    .value.trim()
    .toLowerCase();
  const tbody = document.getElementById("tablaMisComprasDistriBody");
  const btn = document.getElementById("btnBuscarCasillero");
  const telefonoDistribuidor = sessionStorage.getItem("active_distri_tel");
  if (inputSearch === "") {
    alert("⚠️ Ingresa un correo o nombre de cliente.");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `Buscando...`;
  tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:30px;">Rastreando en la Bóveda...</td></tr>`;

  const cbBusq = "cb_casillero_" + Date.now();
  window[cbBusq] = function (res) {
    btn.disabled = false;
    btn.innerHTML = "Buscar";
    if (document.getElementById("node_" + cbBusq))
      document.getElementById("node_" + cbBusq).remove();
    delete window[cbBusq];
    if (res && res.status === "success") {
      let rowsHtml = "";
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
          ? `<br><span style="font-size:0.75rem; color:var(--text-secondary);">Cliente: <b style="color:var(--ios-orange);">${item.cliente}</b></span>`
          : "";
        let dataFicha = encodeURIComponent(JSON.stringify(item));
        rowsHtml += `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
            <td style="padding: 14px 16px; color: var(--ios-green); font-family:monospace; font-weight:800;">${item.vencimiento}</td>
            <td style="padding: 14px 16px; line-height:1.4;">
               <div style="color:var(--ios-blue); font-weight:800; text-transform: uppercase;">${item.plataforma.replace(/-/g, " ")}</div>
               <div style="font-size:0.75rem; color:var(--text-secondary);">${perfilText}</div>${subCliente}
            </td>
            <td style="padding: 14px 16px;">
              <div style="display:flex; flex-direction:column; gap:6px;">
                <div class="credential-pill" onclick="copiarTextoAlToque(this, '${item.correo}')">E: <span style="color:white;">${item.correo}</span></div>
                <div class="credential-pill" onclick="copiarTextoAlToque(this, '${item.clave}')">P: <span style="color:white;">${item.clave}</span></div>
                <button class="btn-ios btn-secondary w-100" style="padding:8px; font-size:0.75rem;" onclick="copiarFichaCasillero(this, '${dataFicha}')">Copiar Ficha Completa</button>
              </div>
            </td>
          </tr>`;
      });
      tbody.innerHTML =
        cuentasMias.length === 0
          ? `<tr><td colspan="3" style="text-align:center; padding:40px;">No se encontraron cuentas asociadas.</td></tr>`
          : rowsHtml;
    } else {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:30px; color:red;">❌ Error en la red.</td></tr>`;
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
  codeData.telefono = sessionStorage.getItem("active_distri_tel");
  document.getElementById("codesCenterOverlay").classList.add("open");
  changeCodeStep(1);
}
function cerrarCentroCodigos() {
  haptic();
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
    alert("⚠️ Solo correos terminados en @cybernetsp.com");
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
  sessionStorage.clear();
  window.location.reload();
}
document.addEventListener("DOMContentLoaded", () => {
  let sessionDistri = sessionStorage.getItem("active_distri_tel");
  if (sessionDistri)
    entrarAlPortalDistribuidor(
      sessionStorage.getItem("active_distri_name"),
      sessionDistri,
      sessionStorage.getItem("active_distri_saldo"),
    );
});
