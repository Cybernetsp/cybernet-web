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
// 🎨 CATÁLOGO DE PRODUCTOS (Se añadió Universal)
// =========================================================================
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

// Plataformas que requieren activación manual
const PLATAFORMAS_MANUALES = [
  "YOUTUBE",
  "SPOTIFY",
  "IPTV",
  "METEGOL",
  "DEEZER",
  "MUBI",
];

// =========================================================================
// UTILERÍAS
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

window.procesarDistribuidoresView = function (res) {
  if (typeof window.cyberLoginCallback === "function")
    window.cyberLoginCallback(res);
  if (typeof window.cyberActionCallback === "function")
    window.cyberActionCallback(res);
};
window.procesarBusquedaCuentasSheets = function (res) {
  if (typeof window.cyberCasilleroCallback === "function")
    window.cyberCasilleroCallback(res);
};

// =========================================================================
// 🔒 LOGIN MULTI-PASOS AUTOMATIZADO
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
              let userPart = partes[0];
              let maskedEmail =
                userPart.substring(0, 2) +
                "******" +
                userPart.substring(userPart.length - 2) +
                "@" +
                partes[1];
              document.getElementById("txtAvisoTokenDespachado").innerText =
                `Código de 6 dígitos enviado a tu correo: ${maskedEmail}`;
              document.getElementById("stepTokenVerificar").style.display =
                "flex";
              document.getElementById("distriLoginTokenInput").focus();
              document.getElementById("txtLoginInstruccion").innerText =
                "Paso 2: Código de Acceso.";
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
          document.getElementById("distriCorreoRegistrarInput").focus();
          document.getElementById("txtLoginInstruccion").innerText =
            "Paso 2: Registro de Correo Electrónico.";
        }
      } else {
        btn.disabled = false;
        btn.innerHTML = "Continuar →";
        alert("❌ Celular no autorizado en la base mayorista.");
      }
    } else {
      btn.disabled = false;
      btn.innerHTML = "Continuar →";
      alert("❌ Error de comunicación con Sheets.");
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
        `🎉 Correo enlazado.\n🔑 Código enviado a: ${nuevoEmail}`;
      document.getElementById("stepTokenVerificar").style.display = "flex";
      document.getElementById("distriLoginTokenInput").focus();
      document.getElementById("txtLoginInstruccion").innerText =
        "Paso 3: Código de Acceso.";
      triggerToast("✅ Correo guardado y Token enviado.");
    } else {
      alert("❌ Error al guardar el correo: " + res.message);
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
      const d = res.data;
      sessionStorage.setItem("active_distri_tel", window.distriTelefonoCache);
      sessionStorage.setItem("active_distri_name", d.nombre.toUpperCase());
      sessionStorage.setItem("active_distri_saldo", d.saldo);
      entrarAlPortalDistribuidor(
        d.nombre.toUpperCase(),
        window.distriTelefonoCache,
        d.saldo,
      );
      triggerToast("🎉 ¡Acceso Autorizado!");
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
  document.getElementById("distriLoginTokenInput").value = "";
  document.getElementById("stepTelefono").style.display = "flex";
  document.getElementById("distriLoginTelefono").focus();
  document.getElementById("txtLoginInstruccion").innerText =
    "Ingresa tu número de celular registrado para iniciar la verificación.";
}

// =========================================================================
// 💼 INTERFAZ DE TIENDA Y DASHBOARD MAYORISTA
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
  document.getElementById("tablaMisComprasDistriBody").innerHTML =
    `<tr><td colspan="3" style="text-align:center; padding: 30px; color:var(--text-secondary);">Utiliza el buscador de arriba para encontrar tus cuentas.</td></tr>`;
}

function actualizarSaldoUI() {
  const formateado = formatMoneda(window.saldoNumericoActual);
  document.getElementById("distriBarBalance").innerText = formateado;
  document.getElementById("cartTotalSaldo").innerText = formateado;
}

function cargarStockEnTienda() {
  const cbStock = "cb_stock_" + Date.now();
  window[cbStock] = function (res) {
    if (document.getElementById("node_" + cbStock))
      document.getElementById("node_" + cbStock).remove();
    delete window[cbStock];

    if (res && res.status === "success") {
      const mapeoApiHtml = {
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
        const htmlId = mapeoApiHtml[item.plat];
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
        const badge = document.getElementById(`stock-badge-${p.id}`);
        if (badge && badge.innerHTML.includes("spin-anim")) {
          badge.innerHTML = `✅ Ilimitado`;
          badge.style.background = "rgba(10, 132, 255, 0.1)";
          badge.style.color = "var(--ios-blue)";
          badge.style.borderColor = "rgba(10, 132, 255, 0.2)";
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
           <svg class="spin-anim" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
        </div>
        <div style="background: ${p.color}15; color: ${p.color}; width: 44px; height: 44px; border-radius: 14px; display:flex; align-items:center; justify-content:center; border: 1px solid ${p.color}25;">
          ${p.logo}
        </div>
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
          <span style="font-size:0.85rem; color:var(--ios-green); font-family:monospace; font-weight:700;">
            ${formatMoneda(subtotal)} <span style="font-size:0.65rem; color:var(--text-secondary); font-weight:normal;">(${formatMoneda(item.precio)} c/u)</span>
          </span>
        </div>
        <div style="display:flex; align-items:center; background:rgba(0,0,0,0.2); border-radius:30px; padding:2px; border:1px solid rgba(255,255,255,0.05);">
          <button onclick="cambiarCantidad('${item.id}', -1)" style="background:transparent; border:none; color:white; width:22px; height:22px; cursor:pointer; font-weight:bold;">-</button>
          <span style="font-family:monospace; font-size:0.85rem; font-weight:bold; min-width:18px; text-align:center;">${item.amount}</span>
          <button onclick="cambiarCantidad('${item.id}', 1)" style="background:transparent; border:none; color:white; width:22px; height:22px; cursor:pointer; font-weight:bold;">+</button>
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

  let confirmacion = confirm(
    `🛒 ¿Confirmar despacho mayorista?\n\n📦 Pedido: ${descripcionLote}\n👤 Cliente: ${nombreParaSheets}\n💵 Costo: ${formatMoneda(totalCost)}`,
  );
  if (!confirmacion) return;

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
          textoFicha += `🎬 DETALLES DE ${bloque.id.replace(/-/g, " ").toUpperCase()} ✅\n`;
          textoFicha += `────────────────────\n`;
          textoFicha += `📧 Correo: ${bloque.correo}\n`;
          textoFicha += `🔐 Contraseña: ${bloque.clave}\n`;

          if (
            bloque.perfil &&
            bloque.perfil !== "N/A" &&
            bloque.perfil !== ""
          ) {
            textoFicha += `👤 Perfil: ${bloque.perfil}\n`;
          }
          if (bloque.pin && bloque.pin !== "N/A" && bloque.pin !== "") {
            textoFicha += `🔑 Pin del Perfil: ${bloque.pin}\n`;
          }
          textoFicha += `📅 Fecha de Vencimiento: ${bloque.venc.toLowerCase()}\n`;
          textoFicha += `🛒 Fecha de Compra: No registrada\n\n`;
        });
      } else {
        textoFicha += `Tus cuentas han sido procesadas correctamente. Puedes ver los accesos en tu casillero.\n\n`;
      }

      textoFicha += `📢 INFORMACIÓN IMPORTANTE:\n`;
      textoFicha += `────────────────────\n`;
      textoFicha += `💎 Disfruta tu servicio.\n`;
      textoFicha += `✨ ¡Gracias por elegirnos! ✨`;

      document.getElementById("cajaTextoFichas").innerText = textoFicha;
      window.fichasCheckoutPendientes = textoFicha;

      // Lógica WhatsApp para plataformas manuales
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

      document.getElementById("successCheckoutOverlay").style.display = "flex";

      window.carrito = [];
      document.getElementById("cartClientName").value = "";
      window.saldoNumericoActual -= totalCost;
      actualizarSaldoUI();
      cargarStockEnTienda();

      if (res.bloques && res.bloques.length > 0) {
        document.getElementById("inputCasilleroSearch").value =
          res.bloques[0].correo;
        buscarCasilleroDistri();
      } else {
        document.getElementById("inputCasilleroSearch").value =
          telefonoDistribuidor;
        buscarCasilleroDistri();
      }
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de comunicación."));
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbCheckout;
  // 👇 AQUÍ ABAJO OCURRE LA MAGIA, LLAMAMOS AL TÚNEL EXCLUSIVO B2B 👇
  script.src = `${GOOGLE_SCRIPT_URL}?action=registrarVentaDistriB2B&nombre=${encodeURIComponent(nombreParaSheets)}&telefono=${encodeURIComponent(telefonoDistribuidor)}&descripcion=${encodeURIComponent(descripcionLote)}&cantidad=${encodeURIComponent(totalCost)}&callback=${cbCheckout}`;
  document.body.appendChild(script);
}

function copiarCuentasCheckout() {
  haptic();
  const btn = document.getElementById("btnCopiarFichasCheckout");
  navigator.clipboard.writeText(window.fichasCheckoutPendientes).then(() => {
    let originalText = btn.innerHTML;
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:middle;"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡Copiado con éxito!`;
    triggerToast(`📋 Cuentas copiadas al portapapeles.`);
    setTimeout(() => {
      btn.innerHTML = originalText;
    }, 2000);
  });
}

function cerrarModalExitoCheckout() {
  haptic();
  document.getElementById("successCheckoutOverlay").style.display = "none";
}

// =========================================================================
// 📡 BÓVEDA DE CUENTAS (BÚSQUEDA DINÁMICA POR NOMBRE O CORREO)
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
    alert("⚠️ Por favor ingresa el correo o el nombre del cliente.");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>`;
  tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 30px; color:var(--text-secondary);">Rastreando en la Bóveda...</td></tr>`;

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
          ? `<br><span style="font-size:0.75rem; color:var(--text-secondary);">Asignado a: <b style="color:var(--ios-orange);">${item.cliente}</b></span>`
          : "";
        let dataFicha = encodeURIComponent(JSON.stringify(item));

        rowsHtml += `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.01)'" onmouseout="this.style.background='transparent'">
            <td style="padding: 14px 16px; color: var(--ios-green); font-family:monospace; font-weight:800; font-size:0.9rem;">${item.vencimiento}</td>
            <td style="padding: 14px 16px; text-align: left; line-height:1.4;">
               <div style="color:var(--ios-blue); font-weight:800; font-size:0.95rem; text-transform: uppercase;">${item.plataforma.replace(/-/g, " ")}</div>
               <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">${perfilText}</div>
               ${subCliente}
            </td>
            <td style="padding: 14px 16px; text-align: left;">
              <div style="display:flex; flex-direction:column; gap:6px;">
                <div class="credential-pill" onclick="copiarTextoAlToque(this, '${item.correo}')">
                  <span style="color:var(--text-secondary); font-size:0.7rem; font-weight:800;">E:</span>
                  <span style="color:var(--text-primary); font-weight:700;">${item.correo}</span>
                </div>
                <div class="credential-pill" onclick="copiarTextoAlToque(this, '${item.clave}')" style="border-color: rgba(255,69,58,0.15);">
                  <span style="color:var(--ios-red); font-size:0.7rem; font-weight:800;">P:</span>
                  <span style="color:var(--text-primary); font-weight:700;">${item.clave}</span>
                </div>
                <button class="btn-ios btn-secondary w-100" style="margin-top:6px; font-size:0.75rem; padding:8px;" onclick="copiarFichaCasillero(this, '${dataFicha}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:4px; vertical-align:bottom;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  Copiar Ficha Completa
                </button>
              </div>
            </td>
          </tr>`;
      });

      if (cuentasMias.length === 0) {
        rowsHtml = `<tr><td colspan="3" style="text-align:center; padding: 40px; color:var(--text-secondary); font-weight:500;">No se encontraron cuentas asociadas. Verifica el nombre o correo.</td></tr>`;
      }
      tbody.innerHTML = rowsHtml;
    } else {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 30px; color:var(--ios-red);">❌ Error en la base de datos central.</td></tr>`;
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

  let textoFicha = `🌟 ¡Hola, ${nombreCliente}!\n\nTu pedido ha sido procesado con éxito. Aquí tienes tus accesos: 👇\n\n`;
  textoFicha += `🎬 DETALLES DE ${obj.plataforma.replace(/-/g, " ").toUpperCase()} ✅\n`;
  textoFicha += `────────────────────\n`;
  textoFicha += `📧 Correo: ${obj.correo}\n`;
  textoFicha += `🔐 Contraseña: ${obj.clave}\n`;

  if (obj.perfil && obj.perfil !== "N/A" && obj.perfil !== "") {
    textoFicha += `👤 Perfil: ${obj.perfil}\n`;
  }
  if (obj.pin && obj.pin !== "N/A" && obj.pin !== "") {
    textoFicha += `🔑 Pin del Perfil: ${obj.pin}\n`;
  }

  textoFicha += `📅 Fecha de Vencimiento: ${obj.vencimiento.toLowerCase()}\n`;
  textoFicha += `🛒 Fecha de Compra: No registrada\n\n`;
  textoFicha += `📢 INFORMACIÓN IMPORTANTE:\n`;
  textoFicha += `────────────────────\n`;
  textoFicha += `💎 Disfruta tu servicio.\n`;
  textoFicha += `✨ ¡Gracias por elegirnos! ✨`;

  navigator.clipboard.writeText(textoFicha).then(() => {
    let originalText = btn.innerHTML;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:4px; vertical-align:bottom;"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡Ficha Copiada!`;
    btn.style.background = "var(--ios-green)";
    btn.style.color = "white";
    btn.style.borderColor = "transparent";
    triggerToast(`📋 Ficha copiada lista para enviar a tu cliente.`);
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = "";
      btn.style.color = "";
      btn.style.borderColor = "";
    }, 1500);
  });
}

// =========================================================================
// 🤖 MODAL DE CÓDIGOS DE ACCESO (INTEGRACIÓN DEL BOT)
// =========================================================================
let codeData = { telefono: "", plataforma: "", opcion: 1, correo: "" };

function abrirCentroCodigos() {
  haptic();
  codeData.telefono = sessionStorage.getItem("active_distri_tel");
  document.getElementById("codesCenterOverlay").style.display = "flex";
  changeCodeStep(1);
}

function cerrarCentroCodigos() {
  haptic();
  document.getElementById("codesCenterOverlay").style.display = "none";
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
    alert(
      "⚠️ Solo disponible para correos oficiales terminados en @cybernetsp.com",
    );
    return;
  }

  codeData.correo = m;
  changeCodeStep(4);

  try {
    const query = new URLSearchParams(codeData);
    const resp = await fetch(`${BOT_API_URL}?${query.toString()}`);
    const res = await resp.json();

    changeCodeStep(5);
    document.getElementById("codeResultBox").style.display = "none";
    document.getElementById("linkResultBox").style.display = "none";

    if (res.exito) {
      document.getElementById("codeResultTitle").innerHTML =
        `<span style="display:flex; align-items:center; justify-content:center; gap:8px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> ¡LOCALIZADO!</span>`;
      document.getElementById("codeResultTitle").style.color =
        "var(--ios-green)";
      document.getElementById("codeResultDesc").innerText =
        res.msj && res.msj !== "undefined"
          ? res.msj
          : "Información recuperada:";

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
        `<span style="display:flex; align-items:center; justify-content:center; gap:8px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> SIN RESULTADOS</span>`;
      document.getElementById("codeResultTitle").style.color =
        "var(--ios-orange)";
      document.getElementById("codeResultDesc").innerText =
        res.msj || "No hay datos recientes en Gmail para este correo.";
    }
  } catch (err) {
    changeCodeStep(5);
    document.getElementById("codeResultTitle").innerText = "Error";
    document.getElementById("codeResultTitle").style.color = "var(--ios-red)";
    document.getElementById("codeResultDesc").innerText =
      "Error de conexión con el servidor.";
  }
}

// =========================================================================
function cerrarSesionDistribuidor() {
  sessionStorage.clear();
  window.location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  let sessionDistri = sessionStorage.getItem("active_distri_tel");
  if (sessionDistri) {
    let nameD = sessionStorage.getItem("active_distri_name");
    let saldoD = sessionStorage.getItem("active_distri_saldo");
    entrarAlPortalDistribuidor(nameD, sessionDistri, saldoD);
  }
});
