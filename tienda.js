// =========================================================================
// 🛒 MOTOR INTELIGENTE DE INTERACCIONES, COMBOS Y OFERTAS - CYBERNET
// =========================================================================

const NUMERO_WHATSAPP_NEGOCIO = "573127706726";
let carrito = [];
let metodoPago = "breb";

// Variables de Control para Ofertas Relámpago
let flashPromoActiva = null;
let promoAplicadaEnCarrito = null;
let promoCountdownInterval = null;
let tiempoRestantePromo = 30;

// Diccionario Estructural de las Plataformas
const PLATAFORMAS_INFO = {
  netflix: { name: "Netflix Colombia", type: "netflix", price: 0 },
  disney_prem: { name: "Disney+ Premium", type: "disney_prem", price: 0 },
  disney_std: { name: "Disney Estándar", type: "regular", price: 8500 },
  amazon: { name: "Amazon Prime", type: "regular", price: 10500 },
  max: { name: "HBO Max", type: "regular", price: 8500 },
  paramount: { name: "Paramount+", type: "regular", price: 10000 },
  vix: { name: "Vix+", type: "regular", price: 8500 },
  plex: { name: "Plex TV", type: "regular", price: 8500 },
  crunchy: { name: "Crunchyroll", type: "regular", price: 8500 },
  apple: { name: "Apple TV+", type: "regular", price: 8500 },
  universal: { name: "Universal+", type: "regular", price: 8500 },
  iptv: { name: "IPTV Smarters", type: "regular", price: 10000 }, // ADICIONADO
  flujo: { name: "Flujo TV", type: "regular", price: 12000 }, // ADICIONADO
  emby: { name: "Emby", type: "regular", price: 12000 }, // ADICIONADO
  canva: { name: "Canva Pro", type: "addon", price: 20000 },
  spotify: { name: "Spotify Premium", type: "addon", price: 14000 },
  yt: { name: "YouTube Premium", type: "addon", price: 14000 },
  deezer: { name: "Deezer", type: "addon", price: 12000 },
  metegol: { name: "Metegol", type: "addon", price: 15000 },
};

// Base de Datos de Ofertas Variadas de Retención
const PROMOS_RELAMPAGO = [
  {
    id: "p1",
    items: ["netflix"],
    meses: 2,
    precio: 21000,
    texto:
      "🎬 <strong>Netflix Premium (2 Meses)</strong> por solo <strong>$21.000</strong> (Normal: $26k) 📺<br><br>¡Llévate un mega descuento exclusivo de retención antes de que expire!",
    msjWhatsapp: "Netflix Premium (2 Meses) a $21.000",
  },
  {
    id: "p2",
    items: ["netflix"],
    meses: 3,
    precio: 32000,
    texto:
      "🍿 <strong>Netflix Premium (3 Meses)</strong> por solo <strong>$32.000</strong> (Normal: $36k) 🚀<br><br>¡Asegura tu entretenimiento al precio más bajo del mercado!",
    msjWhatsapp: "Netflix Premium (3 Meses) a $32.000",
  },
  {
    id: "p3",
    items: ["max"],
    meses: 1,
    precio: 6000,
    texto:
      "📺 <strong>HBO Max (1 Mes)</strong> por solo <strong>$6.000</strong> (Normal: $8.500) 🎬<br><br>¡Tus series y películas favoritas a precio de liquidación total!",
    msjWhatsapp: "HBO Max (1 Mes) a $6.000",
  },
  {
    id: "p4",
    items: ["disney_prem"],
    meses: 1,
    precio: 13000,
    texto:
      "✨ <strong>Disney+ Premium (1 Mes)</strong> por solo <strong>$13.000</strong> (Normal: $15.000) 💠<br><br>¡Acceso Completo con ESPN y Sin Anuncios a precio de locura!",
    msjWhatsapp: "Disney+ Premium (1 Mes) a $13.000",
  },
  {
    id: "p5",
    items: ["max", "paramount"],
    meses: 1,
    precio: 9900,
    texto:
      "🔥 <strong>HBO Max + Paramount+</strong> por solo <strong>$9.900</strong> (Normal: $16.500) 🚀<br><br>¡Doble plataforma al precio de una, solo por 30 segundos!",
    msjWhatsapp: "Dúo HBO Max + Paramount a $9.900",
  },
  {
    id: "p6",
    items: ["amazon"],
    meses: 1,
    precio: 9900,
    texto:
      "📦 <strong>Amazon Prime Video</strong> por solo <strong>$9.900</strong> (Normal: $10.500) 🍿<br><br>¡Aprovecha este descuento flash y no te quedes sin tus series!",
    msjWhatsapp: "Amazon Prime a $9.900",
  },
  {
    id: "p7",
    items: ["vix", "plex"],
    meses: 1,
    precio: 9900,
    texto:
      "⚽ <strong>Vix+ junto a Plex TV</strong> por solo <strong>$9.900</strong> 📺<br><br>¡Fútbol, Novelas y Cine en vivo con este Dúo en liquidación!",
    msjWhatsapp: "Dúo Vix+ y Plex a $9.900",
  },
];

const PRECIOS_NETFLIX = { 1: 14500, 2: 26000, 3: 36000, 4: 46000, 5: 55000 };

function triggerToast(msgText) {
  const toast = document.getElementById("appleToast");
  if (toast) {
    toast.innerText = msgText;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  }
}

function haptic() {
  if (navigator.vibrate) navigator.vibrate(15);
}

// 🛍 CONTROLADORES DE LA GRID PRINCIPAL
function toggleItem(id, nombre, type, priceBase, btnElement) {
  haptic();
  if (id === "disney_prem") {
    carrito = carrito.filter((i) => i.id !== "disney_std");
    restaurarBoton("btn_disney_std");
  } else if (id === "disney_std") {
    carrito = carrito.filter((i) => i.id !== "disney_prem");
    restaurarBoton("btn_disney_prem");
  }

  const index = carrito.findIndex((i) => i.id === id);
  if (index > -1) {
    carrito.splice(index, 1);
    btnElement.classList.remove("btn-added");
    btnElement.innerText = "Añadir";
  } else {
    carrito.push({
      id,
      nombre,
      type,
      price: parseInt(priceBase),
      pantallas: 1,
    });
    btnElement.classList.add("btn-added");
    btnElement.innerText = "Quitar";
  }
  actualizarCarrito();
}

function restaurarBoton(btnId) {
  const btn = document.getElementById(btnId);
  if (btn) {
    btn.classList.remove("btn-added");
    btn.innerText = "Añadir";
  }
}

function ajustarPantallas(id, delta) {
  haptic();
  const item = carrito.find((i) => i.id === id);
  if (!item) return;

  item.pantallas += delta;
  if (item.id === "netflix" && item.pantallas > 5) item.pantallas = 5;

  if (item.pantallas <= 0) {
    carrito = carrito.filter((i) => i.id !== id);
    restaurarBoton("btn_" + id);
  }
  actualizarCarrito();
}

// 🧠 SIMULADOR MATEMÁTICO DE VALORES COMBO (CON EXCLUSIÓN INTELIGENTE DE PREMIUMS)
function simularPrecioCart(tempCart, meses) {
  const itemNetflix = tempCart.find((i) => i.type === "netflix");
  const itemDisneyPrem = tempCart.find((i) => i.type === "disney_prem");

  // Extracción de plataformas con lógicas de descuento aisladas de $2.000 fijos
  const itemParamount = tempCart.find((i) => i.id === "paramount");
  const itemIptv = tempCart.find((i) => i.id === "iptv");
  const itemFlujo = tempCart.find((i) => i.id === "flujo");
  const itemEmby = tempCart.find((i) => i.id === "emby");

  // Filtramos las especiales para que no interfieran en los cálculos del combo base de básicas
  const lasEspecialesIds = ["paramount", "iptv", "flujo", "emby"];
  const regularPlats = tempCart.filter(
    (i) => i.type === "regular" && !lasEspecialesIds.includes(i.id),
  );
  const addonPlats = tempCart.filter((i) => i.type === "addon");
  const regularCount = regularPlats.length;

  let precioBase = 0;
  let nombreC = "";

  if (itemNetflix) {
    if (itemDisneyPrem) {
      if (regularCount === 0) {
        precioBase = 25000;
        nombreC = "Dúo Premium";
      } else if (regularCount === 1) {
        precioBase = 29000;
        nombreC = "Combo Pro";
      } else if (regularCount === 2) {
        precioBase = 32000;
        nombreC = "Cine Total";
      } else if (regularCount >= 3) {
        precioBase = 35000 + (regularCount - 3) * 3000;
        nombreC = "El Rey del Streaming";
      }
    } else {
      if (regularCount === 0) {
        precioBase = 14500;
        nombreC = "Solo Netflix (Básico)";
      } else if (regularCount === 1) {
        precioBase = 20000;
        nombreC = "Netflix + 1 (Top Ventas)";
      } else if (regularCount === 2) {
        precioBase = 24000;
        nombreC = "Netflix + 2 (Ahorro)";
      } else if (regularCount >= 3) {
        precioBase = 27000 + (regularCount - 3) * 3000;
        nombreC = "VIP Gold";
      }
    }
  } else {
    if (itemDisneyPrem) {
      if (regularCount === 0) {
        precioBase = 15000;
        nombreC = "Solo Disney+ Premium";
      } else if (regularCount === 1) {
        precioBase = 20000;
        nombreC = "Dúo Ideal";
      } else if (regularCount === 2) {
        precioBase = 22000;
        nombreC = "Cine Total";
      } else if (regularCount >= 3) {
        precioBase = 24000 + (regularCount - 3) * 3000;
        nombreC = "Mega VIP";
      }
    } else {
      if (regularCount === 0) {
        precioBase = 0;
        nombreC = "";
      } else if (regularCount === 1) {
        precioBase = regularPlats[0].price;
        nombreC = "1 Plataforma Individual";
      } else if (regularCount === 2) {
        precioBase = 13000;
        nombreC = "Promo (2 Plats)";
      } else if (regularCount === 3) {
        precioBase = 16000;
        nombreC = "Gran ahorro (3 Plats)";
      } else if (regularCount >= 4) {
        precioBase = 18000 + (regularCount - 4) * 3000;
        nombreC = "Paquete Familiar";
      }
    }
  }

  // ⚡ INYECTOR DE LA NUEVA MATEMÁTICA EN CADENA: Rebaja fijos $2.000 si hay combo o entre ellas
  let colaEspeciales = [];
  if (itemParamount)
    colaEspeciales.push({ name: "Paramount", full: 10000, combo: 8000 });
  if (itemIptv) colaEspeciales.push({ name: "IPTV", full: 10000, combo: 8000 });
  if (itemFlujo)
    colaEspeciales.push({ name: "Flujo TV", full: 12000, combo: 10000 });
  if (itemEmby)
    colaEspeciales.push({ name: "Emby", full: 12000, combo: 10000 });

  colaEspeciales.forEach((esp) => {
    if (precioBase === 0) {
      precioBase = esp.full;
      nombreC = "Solo " + esp.name;
    } else {
      precioBase += esp.combo;
      nombreC += " + " + esp.name;
    }
  });

  let streamingPuroBase = precioBase * meses;
  let recargoMeses = tempCart
    .filter((i) => i.type !== "addon")
    .reduce((sum, item) => {
      if (item.pantallas > 1) {
        let extra = item.pantallas - 1;
        if (item.id === "netflix")
          return (
            sum + (PRECIOS_NETFLIX[item.pantallas] - PRECIOS_NETFLIX[1]) * meses
          );
        if (item.id === "disney_prem") return sum + extra * 7000 * meses;
        if (item.id === "paramount" || item.id === "iptv")
          return sum + extra * 8000 * meses;
        if (item.id === "flujo" || item.id === "emby")
          return sum + extra * 10000 * meses;
        return sum + extra * 4000 * meses;
      }
      return sum;
    }, 0);

  let subtotalStreaming = streamingPuroBase + recargoMeses;
  let pct = 0;
  if (meses === 2) pct = 0.15;
  if (meses === 3) pct = 0.2;
  if (meses === 4) pct = 0.25;
  if (meses === 5) pct = 0.3;

  let descVigencia = streamingPuroBase * pct;
  let netoStreaming = subtotalStreaming - descVigencia;
  let precioAddons = addonPlats.reduce(
    (sum, item) => sum + item.price * item.pantallas,
    0,
  );
  let netoFinal = netoStreaming + precioAddons;

  return {
    netoFinal,
    subtotalStreaming,
    descVigencia,
    precioAddons,
    nombreC,
    precioBase,
  };
}

// 🧮 EL ACTUALIZADOR LOGÍSTICO MATEMÁTICO DEL CARRITO
function actualizarCarrito() {
  let totalBadges = carrito.reduce((sum, item) => sum + item.pantallas, 0);
  const badgeCountEl = document.getElementById("cartBadgeCount");
  if (badgeCountEl) badgeCountEl.innerText = totalBadges;

  const container = document.getElementById("cartItemsContainer");
  const checkoutPanel = document.getElementById("cartCheckoutPanel");
  const actionContainer = document.getElementById("cartActionContainer");

  if (!container) return;

  if (carrito.length === 0) {
    container.innerHTML = `<div class="empty-cart-msg">Tu carrito está vacío. Empieza a añadir plataformas.</div>`;
    if (checkoutPanel) checkoutPanel.style.display = "none";
    if (actionContainer) actionContainer.style.display = "none";
    promoAplicadaEnCarrito = null;
    return;
  }

  let htmlItems = "";
  carrito.forEach((item) => {
    let labelTipo = item.type === "addon" ? "Adicional" : "Pantalla(s)";
    if (item.id === "netflix" && item.pantallas === 5)
      labelTipo = "¡Cuenta Completa! 👑";

    htmlItems += `
        <div class="cart-item-row" style="display: flex; flex-direction: column; gap: 8px; align-items: stretch; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <span style="font-weight: 700; color: var(--text-primary); font-size:0.9rem;">${item.nombre}</span>
                <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: bold;">${labelTipo}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 2px;">
                <div style="display: flex; align-items: center; background: rgba(255,255,255,0.05); border: var(--glass-border); border-radius: 10px; padding: 2px;">
                    <button onclick="ajustarPantallas('${item.id}', -1)" style="border:none; background:transparent; width:26px; height:26px; font-weight:bold; cursor:pointer; color:var(--text-primary);">-</button>
                    <span style="min-width:22px; text-align:center; font-family:monospace; font-weight:bold; color:var(--text-primary);">${item.pantallas}</span>
                    <button onclick="ajustarPantallas('${item.id}', 1)" style="border:none; background:transparent; width:26px; height:26px; font-weight:bold; cursor:pointer; color:var(--text-primary);">+</button>
                </div>
                <button onclick="ajustarPantallas('${item.id}', -${item.pantallas})" style="background:transparent; border:none; color:var(--ios-red); cursor:pointer; font-size:0.8rem; font-weight:700;">Remover</button>
            </div>
        </div>`;
  });
  container.innerHTML = htmlItems;
  if (checkoutPanel) checkoutPanel.style.display = "block";
  if (actionContainer) actionContainer.style.display = "block";

  const selectMeses = document.getElementById("tiendaMeses");
  const chkRenovacion = document.getElementById("chkRenovacion");
  const cajaVigencia = document.getElementById("cajaVigencia");
  const notaMeses = document.getElementById("notaMesesExtras");

  const hasStreaming = carrito.some((i) => i.type !== "addon");
  const meses = selectMeses ? parseInt(selectMeses.value) || 1 : 1;

  if (selectMeses && cajaVigencia) {
    if (!hasStreaming) {
      selectMeses.value = "1";
      selectMeses.disabled = true;
      cajaVigencia.style.opacity = "0.5";
    } else {
      selectMeses.disabled = false;
      cajaVigencia.style.opacity = "1";
    }
  }

  if (chkRenovacion) {
    if (!carrito.some((i) => i.type === "netflix")) {
      chkRenovacion.checked = false;
      chkRenovacion.disabled = true;
      chkRenovacion.parentElement.style.opacity = "0.25";
      chkRenovacion.parentElement.style.pointerEvents = "none";
    } else {
      chkRenovacion.disabled = false;
      chkRenovacion.parentElement.style.opacity = "1";
      chkRenovacion.parentElement.style.pointerEvents = "auto";
    }
  }

  const hasAddons = carrito.some((i) => i.type === "addon");
  if (notaMeses)
    notaMeses.style.display =
      hasStreaming && hasAddons && meses > 1 ? "flex" : "none";

  let resultadoNormal = simularPrecioCart(carrito, meses);
  let totalNetoFinal = resultadoNormal.netoFinal;
  let descuentoPorPromo = 0;

  if (promoAplicadaEnCarrito !== null) {
    let promoValida = true;
    promoAplicadaEnCarrito.items.forEach((id) => {
      if (!carrito.find((i) => i.id === id)) promoValida = false;
    });
    if (promoAplicadaEnCarrito.meses && meses !== promoAplicadaEnCarrito.meses)
      promoValida = false;

    if (promoValida) {
      let carritoClonado = JSON.parse(JSON.stringify(carrito));
      promoAplicadaEnCarrito.items.forEach((id) => {
        let idx = carritoClonado.findIndex((i) => i.id === id);
        if (carritoClonado[idx].pantallas > 1) {
          carritoClonado[idx].pantallas -= 1;
        } else {
          carritoClonado.splice(idx, 1);
        }
      });

      let resultadoSobrantes = simularPrecioCart(carritoClonado, meses);
      let totalAlternativoConPromo =
        resultadoSobrantes.netoFinal + promoAplicadaEnCarrito.precio;

      if (totalAlternativoConPromo < resultadoNormal.netoFinal) {
        descuentoPorPromo =
          resultadoNormal.netoFinal - totalAlternativoConPromo;
        totalNetoFinal = totalAlternativoConPromo;
      } else {
        descuentoPorPromo = 0;
      }
    } else {
      promoAplicadaEnCarrito = null;
    }
  }

  const rowNombreCombo = document.getElementById("row_combo_desc");
  if (rowNombreCombo) {
    if (resultadoNormal.precioBase > 0) {
      rowNombreCombo.style.display = "flex";
      const lblNombreComboEl = document.getElementById("lblNombreCombo");
      if (lblNombreComboEl)
        lblNombreComboEl.innerText = "✨ " + resultadoNormal.nombreC;
    } else {
      rowNombreCombo.style.display = "none";
    }
  }

  const subtotalStreamingEl = document.getElementById("lblSubtotalStreaming");
  if (subtotalStreamingEl)
    subtotalStreamingEl.innerText =
      "$" + resultadoNormal.subtotalStreaming.toLocaleString("es-CO");

  const adicionalesEl = document.getElementById("lblAdicionales");
  if (adicionalesEl)
    adicionalesEl.innerText =
      "$" + resultadoNormal.precioAddons.toLocaleString("es-CO");

  const rowDescMeses = document.getElementById("row_desc_meses");
  if (rowDescMeses) {
    if (resultadoNormal.descVigencia > 0) {
      rowDescMeses.style.display = "flex";
      const lblDescMesesEl = document.getElementById("lblDescMeses");
      if (lblDescMesesEl)
        lblDescMesesEl.innerText =
          "-$" + resultadoNormal.descVigencia.toLocaleString("es-CO");
    } else {
      rowDescMeses.style.display = "none";
    }
  }

  const rowPromo = document.getElementById("row_promo_relampago");
  if (rowPromo) {
    if (descuentoPorPromo > 0) {
      rowPromo.style.display = "flex";
      const lblPromoRelampagoEl = document.getElementById("lblPromoRelampago");
      if (lblPromoRelampagoEl)
        lblPromoRelampagoEl.innerText =
          "-$" + descuentoPorPromo.toLocaleString("es-CO");
    } else {
      rowPromo.style.display = "none";
    }
  }

  const totalFormateado = "$" + totalNetoFinal.toLocaleString("es-CO");
  const lblTotalEl = document.getElementById("lblTotal");
  if (lblTotalEl) lblTotalEl.innerText = totalFormateado;

  if (document.getElementById("lblTotalPagoModal"))
    document.getElementById("lblTotalPagoModal").innerText = totalFormateado;
  if (document.getElementById("lblTotalTutorialModal"))
    document.getElementById("lblTotalTutorialModal").innerText =
      totalFormateado;
  if (document.getElementById("lblTotalAlternativeModal"))
    document.getElementById("lblTotalAlternativeModal").innerText =
      totalFormateado;
}

function limpiarTodosLosOverlays() {
  const overlays = [
    "cartOverlay",
    "pagoOverlay",
    "tutorialOverlay",
    "alternativeOverlay",
    "promoOverlay",
  ];
  overlays.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("open");
  });

  const modales = [
    "cartDrawer",
    "pagoModal",
    "tutorialPagoModal",
    "alternativePagoModal",
    "promoModalContainer",
  ];
  modales.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("active");
  });

  document.body.style.overflow = "";
}

function abrirModalPago() {
  haptic();
  if (carrito.length === 0 && promoAplicadaEnCarrito === null) return;
  metodoPago = "breb";

  const cartDrawerEl = document.getElementById("cartDrawer");
  if (cartDrawerEl) cartDrawerEl.classList.remove("active");

  const cartOverlayEl = document.getElementById("cartOverlay");
  if (cartOverlayEl) cartOverlayEl.classList.remove("open");

  const pagoOverlayEl = document.getElementById("pagoOverlay");
  if (pagoOverlayEl) pagoOverlayEl.classList.add("open");

  const pagoModalEl = document.getElementById("pagoModal");
  if (pagoModalEl) pagoModalEl.classList.add("active");

  document.body.style.overflow = "hidden";
}

function cerrarModalPago() {
  haptic();
  limpiarTodosLosOverlays();
}

function confirmarPagoYEnviar() {
  enviarPedidoWhatsApp();
  limpiarTodosLosOverlays();
}

function copiarLlave() {
  const numeroLlave = "0090878219";
  navigator.clipboard.writeText(numeroLlave).then(() => {
    const btn = document.getElementById("btnCopiarLlave");
    if (btn) {
      btn.innerText = "¡Copiado!";
      btn.style.color = "var(--ios-green)";
      triggerToast("Llave Bre-B copiada");
      setTimeout(() => {
        btn.innerText = "📋 Copiar";
        btn.style.color = "var(--text-primary)";
      }, 2000);
    }
  });
}

function abrirTutorialPago() {
  haptic();
  const pagoOverlayEl = document.getElementById("pagoOverlay");
  if (pagoOverlayEl) pagoOverlayEl.classList.remove("open");

  const pagoModalEl = document.getElementById("pagoModal");
  if (pagoModalEl) pagoModalEl.classList.remove("active");

  const tutorialOverlayEl = document.getElementById("tutorialOverlay");
  if (tutorialOverlayEl) tutorialOverlayEl.classList.add("open");

  const tutorialPagoModalEl = document.getElementById("tutorialPagoModal");
  if (tutorialPagoModalEl) tutorialPagoModalEl.classList.add("active");
}

function cerrarTutorialPago() {
  haptic();
  const tutorialOverlayEl = document.getElementById("tutorialOverlay");
  if (tutorialOverlayEl) tutorialOverlayEl.classList.remove("open");

  const tutorialPagoModalEl = document.getElementById("tutorialPagoModal");
  if (tutorialPagoModalEl) tutorialPagoModalEl.classList.remove("active");

  const pagoOverlayEl = document.getElementById("pagoOverlay");
  if (pagoOverlayEl) pagoOverlayEl.classList.add("open");

  const pagoModalEl = document.getElementById("pagoModal");
  if (pagoModalEl) pagoModalEl.classList.add("active");
}

function confirmarPagoTutorial() {
  haptic();
  enviarPedidoWhatsApp();
  limpiarTodosLosOverlays();
}

function copyLlaveTutorial() {
  const numeroLlave = "0090878219";
  navigator.clipboard.writeText(numeroLlave).then(() => {
    const btn = document.getElementById("btnCopiarLlaveTutorial");
    if (btn) {
      btn.innerText = "¡Copiado!";
      btn.style.color = "var(--ios-green)";
      triggerToast("Llave Bre-B copiada");
      setTimeout(() => {
        btn.innerText = "📋 Copiar";
        btn.style.color = "var(--text-primary)";
      }, 2000);
    }
  });
}

function abrirPagoAlternativo() {
  haptic();
  metodoPago = "alternativo";

  const tutorialOverlayEl = document.getElementById("tutorialOverlay");
  if (tutorialOverlayEl) tutorialOverlayEl.classList.remove("open");

  const tutorialPagoModalEl = document.getElementById("tutorialPagoModal");
  if (tutorialPagoModalEl) tutorialPagoModalEl.classList.remove("active");

  const alternativeOverlayEl = document.getElementById("alternativeOverlay");
  if (alternativeOverlayEl) alternativeOverlayEl.classList.add("open");

  const alternativePagoModalEl = document.getElementById(
    "alternativePagoModal",
  );
  if (alternativePagoModalEl) alternativePagoModalEl.classList.add("active");
}

function cerrarAlternativePago() {
  haptic();
  limpiarTodosLosOverlays();
}

function confirmarPagoAlternativo() {
  haptic();
  enviarPedidoWhatsApp();
  limpiarTodosLosOverlays();
}

function copiarNequi() {
  const numeroNequi = "3015156037";
  navigator.clipboard.writeText(numeroNequi).then(() => {
    const btn = document.getElementById("btnCopiarNequi");
    if (btn) {
      btn.innerText = "¡Copiado!";
      btn.style.color = "var(--ios-green)";
      triggerToast("Número Nequi/Daviplata copiado");
      setTimeout(() => {
        btn.innerText = "📋 Copiar";
        btn.style.color = "var(--text-primary)";
      }, 2000);
    }
  });
}

function iniciarSistemaPromos() {
  setInterval(dispararPromoRelampago, 30 * 60 * 1000);
}

function dispararPromoRelampago() {
  if (
    (document.getElementById("pagoModal") &&
      document.getElementById("pagoModal").classList.contains("active")) ||
    (document.getElementById("tutorialPagoModal") &&
      document
        .getElementById("tutorialPagoModal")
        .classList.contains("active")) ||
    (document.getElementById("alternativePagoModal") &&
      document
        .getElementById("alternativePagoModal")
        .classList.contains("active"))
  ) {
    return;
  }

  haptic();
  const promoAleatoria =
    PROMOS_RELAMPAGO[Math.floor(Math.random() * PROMOS_RELAMPAGO.length)];
  flashPromoActiva = promoAleatoria;
  tiempoRestantePromo = 30;

  const promoTextoEl = document.getElementById("promoTexto");
  if (promoTextoEl) promoTextoEl.innerHTML = promoAleatoria.texto;

  const promoTimerEl = document.getElementById("promoTimer");
  if (promoTimerEl) promoTimerEl.innerText = tiempoRestantePromo;

  const promoBarraEl = document.getElementById("promoBarraProgreso");
  if (promoBarraEl) promoBarraEl.style.width = "100%";

  document.body.style.overflow = "hidden";

  const promoOverlayEl = document.getElementById("promoOverlay");
  if (promoOverlayEl) promoOverlayEl.classList.add("open");

  const promoModalContainerEl = document.getElementById("promoModalContainer");
  if (promoModalContainerEl) promoModalContainerEl.classList.add("active");

  clearInterval(promoCountdownInterval);
  promoCountdownInterval = setInterval(() => {
    tiempoRestantePromo--;
    if (promoTimerEl) promoTimerEl.innerText = tiempoRestantePromo;
    let porcentaje = (tiempoRestantePromo / 30) * 100;
    if (promoBarraEl) promoBarraEl.style.width = porcentaje + "%";

    if (tiempoRestantePromo <= 0) {
      cerrarPromoRelampago();
    }
  }, 1000);
}

function cerrarPromoRelampago() {
  haptic();
  clearInterval(promoCountdownInterval);
  limpiarTodosLosOverlays();
}

function inyectarPromoEnCarritoBase(promoObj) {
  promoAplicadaEnCarrito = promoObj;
  promoObj.items.forEach((itemId) => {
    if (!carrito.find((i) => i.id === itemId)) {
      let data = PLATAFORMAS_INFO[itemId];
      carrito.push({
        id: itemId,
        nombre: data.name,
        type: data.type,
        price: data.price,
        pantallas: 1,
      });
      let btnUI = document.getElementById("btn_" + itemId);
      if (btnUI) {
        btnUI.classList.add("btn-added");
        btnUI.innerText = "Quitar";
      }
    }
  });

  const tiendaMesesEl = document.getElementById("tiendaMeses");
  if (promoObj.meses && tiendaMesesEl) tiendaMesesEl.value = promoObj.meses;
  actualizarCarrito();
}

function aceptarPromoPagoDirecto() {
  haptic();
  clearInterval(promoCountdownInterval);
  const promoOverlayEl = document.getElementById("promoOverlay");
  if (promoOverlayEl) promoOverlayEl.classList.remove("open");
  const promoModalContainerEl = document.getElementById("promoModalContainer");
  if (promoModalContainerEl) promoModalContainerEl.classList.remove("active");

  inyectarPromoEnCarritoBase(flashPromoActiva);
  flashPromoActiva = null;
  abrirModalPago();
}

function aceptarPromoYAgregarMas() {
  haptic();
  clearInterval(promoCountdownInterval);
  const promoOverlayEl = document.getElementById("promoOverlay");
  if (promoOverlayEl) promoOverlayEl.classList.remove("open");
  const promoModalContainerEl = document.getElementById("promoModalContainer");
  if (promoModalContainerEl) promoModalContainerEl.classList.remove("active");

  document.body.style.overflow = "";
  inyectarPromoEnCarritoBase(flashPromoActiva);
  flashPromoActiva = null;
  abrirCarrito();
}

function enviarPedidoWhatsApp() {
  const selectMeses = document.getElementById("tiendaMeses");
  const chkRenovacion = document.getElementById("chkRenovacion");

  const meses = selectMeses && !selectMeses.disabled ? selectMeses.value : 1;
  const esRenovacion = chkRenovacion ? chkRenovacion.checked : false;

  let streamingTexto = [];
  carrito
    .filter((i) => i.type !== "addon")
    .forEach((i) => {
      let detallePantallas =
        i.id === "netflix" && i.pantallas === 5
          ? `(Cuenta Completa 👑)`
          : `(${i.pantallas} Pantalla/s)`;
      streamingTexto.push(`• ${i.nombre} ${detallePantallas}`);
    });

  let addonsTexto = [];
  carrito
    .filter((i) => i.type === "addon")
    .forEach((i) => {
      addonsTexto.push(`• ${i.nombre} (${i.pantallas} Unidad/es - 1 Mes)`);
    });

  if (streamingTexto.length === 0 && addonsTexto.length === 0) {
    alert("⚠️ Añade al menos un servicio al carrito para hacer el pedido.");
    return;
  }

  const lblNombreComboEl = document.getElementById("lblNombreCombo");
  const nombreCombo = lblNombreComboEl ? lblNombreComboEl.innerText : "";

  const lblTotalEl = document.getElementById("lblTotal");
  const totalTexto = lblTotalEl ? lblTotalEl.innerText : "$0";

  let mensaje = "";
  if (esRenovacion) {
    mensaje = `👋 ¡Hola Cybernet! **Voy a renovar mis pantallas actuales** desde la tienda 🔄🚀\n`;
  } else {
    mensaje = `👋 ¡Hola Cybernet! Quiero realizar un pedido de pantallas nuevas desde la tienda 🆕🚀\n`;
  }

  if (streamingTexto.length > 0) {
    mensaje += `\n📅 *Vigencia Solicitada:* ${meses} Mes(es)\n`;
    const rowNombreCombo = document.getElementById("row_combo_desc");
    if (rowNombreCombo && rowNombreCombo.style.display !== "none") {
      mensaje += `🎁 *Combo Aplicado:* ${nombreCombo.replace("✨ ", "")}\n`;
    }
    mensaje += `\n📺 *Servicios de Streaming:*\n${streamingTexto.join("\n")}\n`;
  }

  if (addonsTexto.length > 0) {
    mensaje += `\n🎶 *Extras de Música/Herramientas:*\n${addonsTexto.join("\n")}\n`;
  }

  const rowPromoRelampago = document.getElementById("row_promo_relampago");
  if (
    promoAplicadaEnCarrito &&
    rowPromoRelampago &&
    rowPromoRelampago.style.display === "flex"
  ) {
    mensaje += `\n🎁 *¡Descuento Relámpago Aceptado!:* _${promoAplicadaEnCarrito.msjWhatsapp}_\n`;
  }

  mensaje += `\n💰 *Total Neto pagado:* ${totalTexto}\n\n`;
  if (carrito.some((i) => i.type === "netflix")) {
    mensaje += `⚡ _Entiendo que mis accesos de Netflix incluyen la sincronización con el bot automático de códigos._\n\n`;
  }

  const nombreMedio = metodoPago === "breb" ? "Bre-B" : "Nequi / Daviplata";
  if (esRenovacion) {
    mensaje += `📸 _Adjunto la captura de mi comprobante de ${nombreMedio} para procesar la renovación de mis perfiles._`;
  } else {
    mensaje += `📸 _Adjunto la captura de mi comprobante de ${nombreMedio} para la entrega inmediata de mi cuenta._`;
  }

  const urlUrl = `https://api.whatsapp.com/send?phone=${NUMERO_WHATSAPP_NEGOCIO}&text=${encodeURIComponent(mensaje)}`;
  window.open(urlUrl, "_blank");
}

function abrirCarrito() {
  haptic();
  const cartOverlayEl = document.getElementById("cartOverlay");
  if (cartOverlayEl) cartOverlayEl.classList.add("open");
  const cartDrawerEl = document.getElementById("cartDrawer");
  if (cartDrawerEl) cartDrawerEl.classList.add("active");
  document.body.style.overflow = "hidden";
}

function cerrarCarrito() {
  haptic();
  limpiarTodosLosOverlays();
}

// ASISTENTE DE SOPORTE VIRTUAL
function toggleChat() {
  haptic();
  const chatWindow = document.getElementById("chat-window");
  const tooltip = document.getElementById("chat-tooltip");
  if (chatWindow) {
    chatWindow.classList.toggle("open");
    if (chatWindow.classList.contains("open") && tooltip)
      tooltip.style.display = "none";
  }
}

function sendQuickReply(question) {
  haptic();
  appendChatMessage(question, "user");
  const optionsDiv = document.getElementById("chat-options");
  if (optionsDiv) {
    optionsDiv.style.opacity = "0.5";
    optionsDiv.style.pointerEvents = "none";
  }

  setTimeout(() => {
    let botReply = "";
    if (question.includes("Cómo comprar")) {
      botReply =
        "🛒 <strong>¿CÓMO COMPRAR EN LA PÁGINA?</strong> 🛍️<br><br>" +
        "1️⃣ <strong>Selecciona:</strong> Ve añadiendo las plataformas que desees directamente desde las tarjetas de la tienda.<br>" +
        "2️⃣ <strong>Configura:</strong> Abre tu carrito abajo a la derecha para elegir los meses de vigencia o si es una renovación.<br>" +
        "3️⃣ <strong>Transfiere:</strong> Toca en 'Anuncio de Pago' para ver los datos de transferencia.<br>" +
        "4️⃣ <strong>Despacha:</strong> Recuerda siempre <strong>tomarle captura a la foto del pago, después darle al botón 'Ya realicé el pago'</strong> y <strong>enviar la foto con el texto</strong> por WhatsApp. ¡Y listo! 🍿";
    } else if (question.includes("medios de pago")) {
      botReply =
        "💳 **¿CÓMO REALIZAR TU PAGO?** 🏦<br><br>" +
        "Para activar o renovar tu servicio, los pasos son súper sencillos:<br><br>" +
        "1️⃣ <strong>Realiza tu pago:</strong> Al abrir tu carrito y tocar en 'Anuncio de Pago', el sistema te desplegará los datos de nuestra llave comercial de la red principal <strong>Bre-B</strong> y las opciones alternativas de <strong>Nequi o Daviplata</strong>.<br><br>" +
        "2️⃣ <strong>Tómale captura a la foto del pago</strong> obligatoriamente una vez sea exitoso 📸.<br><br>" +
        "3️⃣ <strong>Después, regresa a la tienda y dale al botón 'Ya realicé el pago'</strong> dentro del panel.<br><br>" +
        "4️⃣ Al abrirse WhatsApp, <strong>envía la foto del pago junto con el texto</strong> generado automáticamente para tu entrega inmediata. ¡Activación al instante apenas se valide! 🚀🍿";
    } else if (question.includes("Beneficios")) {
      botReply =
        "🚀 <strong>BENEFICIOS EXCLUSIVOS AL COMPRAR EN CYBERNET:</strong><br><br>⚡ <strong>Verificación y Entrega:</strong> Una vez envías tu pago, este entra a revisión y se realiza la entrega de tus accesos apenas sea validado.<br>🤖 <strong>Bot de Códigos TV 24/7:</strong> Si adquieres Netflix, podrás generar tus códigos de acceso a tu televisor de manera automática desde el botón superior '🔑 Códigos', sin esperas ni intermediarios.<br>🔒 <strong>Cuentas 100% Estables:</strong> Garantizamos perfiles privados, estables y un servicio original sin caídas rústicas.<br>🎉 <strong>Ahorro Automatizado:</strong> El carrito calcula y te aplica tus combos favoritos de forma automática para darte siempre el precio más bajo.<br>🛠 <strong>Soporte Garantizado:</strong> Te acompañamos con atención rápida y efectiva durante todo tu mes de vigencia.";
    }

    appendChatMessage(botReply, "bot");
    if (optionsDiv) {
      optionsDiv.style.opacity = "1";
      optionsDiv.style.pointerEvents = "auto";
    }
  }, 800);
}

function appendChatMessage(text, sender) {
  const chatBody = document.getElementById("chat-body");
  if (!chatBody) return;
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerHTML = text;
  chatBody.appendChild(bubble);
  chatBody.scrollTop = chatBody.scrollHeight;
}

window.onload = () => {
  actualizarCarrito();
  iniciarSistemaPromos();
};
// =========================================================================
// 🛰️ RECEPTOR: SINCRONIZADOR DE STOCK AUTOMÁTICO (ESCUCHA A CAMILO)
// =========================================================================

function verificarStockDesdeMemoria() {
  // Leemos lo que Camilo guardó en la memoria
  const agotados = JSON.parse(
    localStorage.getItem("cyber_items_agotados") || "[]",
  );

  // Lista de todos los botones de la tienda
  const idsPlataformas = [
    "btn_netflix",
    "btn_disney_prem",
    "btn_disney_std",
    "btn_amazon",
    "btn_max",
    "btn_paramount",
    "btn_vix",
    "btn_plex",
    "btn_crunchy",
    "apple",
    "btn_universal",
    "btn_iptv",
    "btn_flujo",
    "btn_emby",
    "btn_canva",
    "btn_spotify",
    "btn_yt",
    "btn_deezer",
    "btn_metegol",
  ];

  idsPlataformas.forEach((id) => {
    const boton = document.getElementById(id);
    if (!boton) return; // Si no encuentra el botón, sigue con el siguiente

    // Buscamos la tarjeta contenedora (.card-ios)
    const tarjeta = boton.closest(".card-ios");

    if (agotados.includes(id)) {
      // ❌ Camilo lo marcó como AGOTADO
      if (tarjeta) tarjeta.classList.add("tarjeta-agotada");
      boton.classList.add("agotado");
      boton.disabled = true;
      boton.innerText = "Agotado";
    } else {
      // 🟢 Camilo lo dejó DISPONIBLE
      if (tarjeta) tarjeta.classList.remove("tarjeta-agotada");
      boton.classList.remove("agotado");
      boton.disabled = false;
      boton.innerText = "Añadir";
    }
  });
}

// 1. Ejecutar automáticamente apenas el cliente entra a la tienda
document.addEventListener("DOMContentLoaded", verificarStockDesdeMemoria);

// 2. MAGIA PURA: Escuchar cambios en vivo.
// Si tú apagas el switch, al cliente se le bloquea la tienda en tiempo real.
window.addEventListener("storage", function (e) {
  if (e.key === "cyber_items_agotados") {
    verificarStockDesdeMemoria();
  }
});
