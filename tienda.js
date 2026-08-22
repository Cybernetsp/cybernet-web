// =========================================================================
// 🛒 MOTOR INTELIGENTE DE INTERACCIONES, COMBOS Y OFERTAS - CYBERNET STORE
// =========================================================================

const NUMERO_WHATSAPP_NEGOCIO = "573127706726";
let carrito = [];
let metodoPago = "breb";

// Variables de Control para Ofertas Relámpago
let flashPromoActiva = null;
let promoAplicadaEnCarrito = null;
let promoCountdownInterval = null;
let tiempoRestantePromo = 30;

// 🔗 MAPA DE CÓDIGOS DE BASE DE DATOS A IDs DE LA TIENDA
const MAPA_DB_A_TIENDA = {
  NETFLIX: "netflix",
  "DISNEY-PREMIUM": "disney_prem",
  "DISNEY-ESTANDAR": "disney_std",
  "AMAZON-PRIME-VIDEO": "amazon",
  "HBO-MAX": "max",
  PARAMOUNT: "paramount",
  VIX: "vix",
  PLEX: "plex",
  CRUNCHYROLL: "crunchy",
  APPLE: "apple",
  UNIVERSAL: "universal",
  CANVA: "canva",
  SPOTIFY: "spotify",
  YOUTUBE: "yt",
  DEEZER: "deezer",
  METEGOL: "metegol",
};

// 🎯 DICCIONARIO ESTRUCTURAL DE PLATAFORMAS
const PLATAFORMAS_INFO = {
  netflix: { name: "Netflix Colombia", type: "netflix", price: 0 },
  disney_prem: { name: "Disney+ Premium", type: "disney_prem", price: 0 },
  disney_std: { name: "Disney Estándar", type: "regular", price: 0 },
  amazon: { name: "Amazon Prime", type: "regular", price: 0 },
  max: { name: "HBO Max", type: "regular", price: 0 },
  paramount: { name: "Paramount+", type: "regular", price: 0 },
  vix: { name: "Vix+", type: "regular", price: 0 },
  plex: { name: "Plex TV", type: "regular", price: 0 },
  crunchy: { name: "Crunchyroll", type: "regular", price: 0 },
  apple: { name: "Apple TV+", type: "regular", price: 0 },
  universal: { name: "Universal+", type: "regular", price: 0 },
  canva: { name: "Canva Pro", type: "addon", price: 0 },
  spotify: { name: "Spotify Premium", type: "addon", price: 0 },
  yt: { name: "YouTube Premium", type: "addon", price: 0 },
  deezer: { name: "Deezer", type: "addon", price: 0 },
  metegol: { name: "Metegol", type: "addon", price: 0 },
};

// Base de Datos de Ofertas Variadas de Retención
const PROMOS_RELAMPAGO = [
  {
    id: "p1",
    items: ["netflix"],
    meses: 2,
    precio: 21000,
    texto:
      "🎬 <strong>Netflix Premium (2 Meses)</strong> por solo <strong>$21.000</strong> 📺<br><br>¡Llévate un mega descuento exclusivo de retención antes de que expire!",
    msjWhatsapp: "Netflix Premium (2 Meses) a $21.000",
  },
  {
    id: "p2",
    items: ["netflix"],
    meses: 3,
    precio: 32000,
    texto:
      "🍿 <strong>Netflix Premium (3 Meses)</strong> por solo <strong>$32.000</strong> 🚀<br><br>¡Asegura tu entretenimiento al precio más bajo del mercado!",
    msjWhatsapp: "Netflix Premium (3 Meses) a $32.000",
  },
  {
    id: "p3",
    items: ["max"],
    meses: 1,
    precio: 6000,
    texto:
      "📺 <strong>HBO Max (1 Mes)</strong> por solo <strong>$6.000</strong> 🎬<br><br>¡Tus series y películas favoritas a precio de liquidación total!",
    msjWhatsapp: "HBO Max (1 Mes) a $6.000",
  },
  {
    id: "p4",
    items: ["disney_prem"],
    meses: 1,
    precio: 13000,
    texto:
      "✨ <strong>Disney+ Premium (1 Mes)</strong> por solo <strong>$13.000</strong> 💠<br><br>¡Acceso Completo con ESPN y Sin Anuncios a precio de locura!",
    msjWhatsapp: "Disney+ Premium (1 Mes) a $13.000",
  },
  {
    id: "p5",
    items: ["max", "paramount"],
    meses: 1,
    precio: 9900,
    texto:
      "🔥 <strong>HBO Max + Paramount+</strong> por solo <strong>$9.900</strong> 🚀<br><br>¡Doble plataforma al precio de una, solo por 30 segundos!",
    msjWhatsapp: "Dúo HBO Max + Paramount a $9.900",
  },
  {
    id: "p6",
    items: ["amazon"],
    meses: 1,
    precio: 9900,
    texto:
      "📦 <strong>Amazon Prime Video</strong> por solo <strong>$9.900</strong> 🍿<br><br>¡Aprovecha este descuento flash y no te quedes sin tus series!",
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

// 🔺 FUNCIÓN DE REDONDEO SUPERIOR INTELIGENTE Y RESPETUOSA DE PRECIOS EXACTOS
function redondearPrecioArriba(val) {
  if (!val || val <= 0) return 0;
  let entero = Math.floor(val);
  let mil = Math.floor(entero / 1000);
  let residuo = entero % 1000;

  // Respeta precios exactos terminados en .000, .500 o .900 (ej: $10.500, $8.500, $20.000)
  if (residuo === 0 || residuo === 500 || residuo === 900) return entero;

  // Si tiene residuo de hasta 400 (ej: 19.300), se redondea a .900
  if (residuo <= 400) return mil * 1000 + 900;

  // Si el residuo es superior a 400 (ej: 19.520 o 36.847,5), sube al mil superior
  return (mil + 1) * 1000;
}

// 🔄 SINCRONIZACIÓN EN VIVO DE PRECIOS DESDE MYSQL
async function sincronizarPreciosDesdeMySQL() {
  try {
    const formData = new FormData();
    formData.append("accion", "obtener");
    formData.append("tipo", "clientes");

    const res = await fetch("https://api.cybernetsp.com/api_precios.php", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.status === "success" && Array.isArray(data.data)) {
      data.data.forEach((item) => {
        const idTienda = MAPA_DB_A_TIENDA[item.codigo];
        if (idTienda && PLATAFORMAS_INFO[idTienda]) {
          const precioDB = Math.round(parseFloat(item.precio)) || 0;
          if (precioDB > 0) {
            PLATAFORMAS_INFO[idTienda].price = precioDB;
          }
        }
      });
      actualizarCarrito();
    }
  } catch (e) {
    console.error("Error al sincronizar precios de MySQL:", e);
  }
}

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

  let precioFinal =
    PLATAFORMAS_INFO[id] && PLATAFORMAS_INFO[id].price > 0
      ? PLATAFORMAS_INFO[id].price
      : parseInt(priceBase) || 0;

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
      price: precioFinal,
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

// 🧮 SIMULADOR DINÁMICO DE COMBOS CON MATEMÁTICA Y SUBTOTALES UNIFICADOS
function simularPrecioCart(tempCart, meses) {
  const streamingItems = tempCart.filter((i) => i.type !== "addon");
  const addonPlats = tempCart.filter((i) => i.type === "addon");
  const numStreaming = streamingItems.length;

  let precioBase = 0;
  let nombreC = "";

  if (numStreaming === 1) {
    const itemUnico = streamingItems[0];
    precioBase = PLATAFORMAS_INFO[itemUnico.id].price || itemUnico.price || 0;
    nombreC = "Solo " + itemUnico.nombre;
  } else if (numStreaming >= 2) {
    let sumaPreciosStreaming = streamingItems.reduce((acc, item) => {
      const pReal = PLATAFORMAS_INFO[item.id].price || item.price || 0;
      return acc + pReal;
    }, 0);

    let pctDescuentoCombo = 0.15;
    if (numStreaming === 3) pctDescuentoCombo = 0.25;
    if (numStreaming >= 4) pctDescuentoCombo = 0.32;

    let descuentoMonto = Math.round(sumaPreciosStreaming * pctDescuentoCombo);
    precioBase = sumaPreciosStreaming - descuentoMonto;

    const tieneNetflix = streamingItems.some((i) => i.id === "netflix");
    const tieneDisneyPrem = streamingItems.some((i) => i.id === "disney_prem");

    if (tieneNetflix && tieneDisneyPrem) {
      nombreC = numStreaming === 2 ? "Dúo Premium" : "El Rey del Streaming";
    } else if (tieneNetflix) {
      nombreC = numStreaming === 2 ? "Netflix + 1 (Top Ventas)" : "VIP Gold";
    } else if (tieneDisneyPrem) {
      nombreC = numStreaming === 2 ? "Dúo Ideal" : "Mega VIP";
    } else {
      nombreC = numStreaming === 2 ? "Promo (2 Plats)" : "Paquete Familiar";
    }
  }

  let streamingPuroBase = precioBase * meses;

  let recargoMeses = streamingItems.reduce((sum, item) => {
    if (item.pantallas > 1) {
      let extra = item.pantallas - 1;
      let pUnidad = PLATAFORMAS_INFO[item.id].price || item.price || 0;

      if (item.id === "netflix") {
        return sum + Math.round(pUnidad * 0.73 * extra) * meses;
      }
      return sum + Math.round(pUnidad * 0.5 * extra) * meses;
    }
    return sum;
  }, 0);

  let subtotalStreamingBruto = streamingPuroBase + recargoMeses;
  let subtotalStreaming = redondearPrecioArriba(subtotalStreamingBruto);

  let pctVigencia = 0;
  if (meses === 2) pctVigencia = 0.15;
  if (meses === 3) pctVigencia = 0.2;
  if (meses === 4) pctVigencia = 0.25;
  if (meses === 5) pctVigencia = 0.3;

  let descVigencia = 0;
  let netoStreaming = subtotalStreaming;

  if (pctVigencia > 0) {
    let descBruto = subtotalStreaming * pctVigencia;
    netoStreaming = redondearPrecioArriba(subtotalStreaming - descBruto);
    descVigencia = subtotalStreaming - netoStreaming;
  }

  let precioAddons = addonPlats.reduce((sum, item) => {
    let pAddon = PLATAFORMAS_INFO[item.id].price || item.price || 0;
    return sum + pAddon * item.pantallas;
  }, 0);

  let netoFinal = redondearPrecioArriba(netoStreaming + precioAddons);

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
  carrito.forEach((item) => {
    if (PLATAFORMAS_INFO[item.id] && PLATAFORMAS_INFO[item.id].price > 0) {
      item.price = PLATAFORMAS_INFO[item.id].price;
    }
  });

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

    const rowRegalo = document.getElementById("row_regalo_misterioso");
    if (rowRegalo) rowRegalo.style.display = "none";

    localStorage.setItem("cyber_carrito", JSON.stringify(carrito));
    return;
  }

  let htmlItems = "";
  carrito.forEach((item) => {
    let labelTipo = item.type === "addon" ? "Adicional" : "Pantalla(s)";
    if (item.id === "netflix" && item.pantallas === 5)
      labelTipo = "¡Cuenta Completa!";

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
      let totalAlternativoConPromo = redondearPrecioArriba(
        resultadoSobrantes.netoFinal + promoAplicadaEnCarrito.precio,
      );

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
        lblNombreComboEl.innerText = resultadoNormal.nombreC;
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

  // ⚡ INTERCEPTADOR DE LA CAJA MISTERIOSA
  let descuentoMisterioso = 0;
  let productosPrincipalesEnCarrito = carrito.filter((item) => {
    if (
      window.regaloMisteriosoAplicado &&
      window.regaloMisteriosoAplicado.tipo === "gratis"
    ) {
      return item.id !== window.regaloMisteriosoAplicado.valor;
    }
    return true;
  }).length;

  const rowRegalo = document.getElementById("row_regalo_misterioso");
  const lblRegalo = document.getElementById("lblRegaloMisterioso");

  if (window.regaloMisteriosoAplicado && window.tiempoRestanteRegalo > 0) {
    if (rowRegalo) rowRegalo.style.display = "flex";

    if (descuentoPorPromo > 0) {
      if (lblRegalo) {
        lblRegalo.innerText = "No acumulable";
        lblRegalo.style.color = "var(--ios-orange)";
      }
      if (rowRegalo)
        rowRegalo.querySelector(".td-cell").innerText =
          "Regalo (No acumulable con Oferta Relámpago)";
      descuentoMisterioso = 0;
    } else if (productosPrincipalesEnCarrito > 0) {
      if (window.regaloMisteriosoAplicado.tipo === "descuento") {
        descuentoMisterioso = window.regaloMisteriosoAplicado.valor;
        totalNetoFinal -= descuentoMisterioso;
      } else if (window.regaloMisteriosoAplicado.tipo === "gratis") {
        let carritoClonadoSinRegalo = JSON.parse(JSON.stringify(carrito));
        let idx = carritoClonadoSinRegalo.findIndex(
          (i) => i.id === window.regaloMisteriosoAplicado.valor,
        );
        if (idx > -1) {
          if (carritoClonadoSinRegalo[idx].pantallas > 1) {
            carritoClonadoSinRegalo[idx].pantallas -= 1;
          } else {
            carritoClonadoSinRegalo.splice(idx, 1);
          }
        }
        let resultadoSinRegalo = simularPrecioCart(
          carritoClonadoSinRegalo,
          meses,
        );
        descuentoMisterioso = totalNetoFinal - resultadoSinRegalo.netoFinal;
        totalNetoFinal = resultadoSinRegalo.netoFinal;
      }
      totalNetoFinal = redondearPrecioArriba(totalNetoFinal);
      if (lblRegalo) {
        lblRegalo.innerText =
          "-$" + descuentoMisterioso.toLocaleString("es-CO");
        lblRegalo.style.color = "var(--ios-green)";
      }
      if (rowRegalo)
        rowRegalo.querySelector(".td-cell").innerText =
          "Regalo de la Caja (Activo)";
    } else {
      if (lblRegalo) {
        lblRegalo.innerText = "Inactivo";
        lblRegalo.style.color = "var(--ios-red)";
      }
      if (rowRegalo)
        rowRegalo.querySelector(".td-cell").innerText =
          "Regalo (Añade otra plataforma para activar)";
    }
  } else {
    if (rowRegalo) rowRegalo.style.display = "none";
  }

  totalNetoFinal = redondearPrecioArriba(totalNetoFinal);
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

  localStorage.setItem("cyber_carrito", JSON.stringify(carrito));
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
  const numeroLlave = "1007416341";
  navigator.clipboard.writeText(numeroLlave).then(() => {
    const btn = document.getElementById("btnCopiarLlave");
    if (btn) {
      btn.innerText = "¡Copiado!";
      btn.style.color = "var(--ios-green)";
      triggerToast("Llave Bre-B copiada");
      setTimeout(() => {
        btn.innerText = "Copiar";
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
  const numeroLlave = "1007416341";
  navigator.clipboard.writeText(numeroLlave).then(() => {
    const btn = document.getElementById("btnCopiarLlaveTutorial");
    if (btn) {
      btn.innerText = "¡Copiado!";
      btn.style.color = "var(--ios-green)";
      triggerToast("Llave Bre-B copiada");
      setTimeout(() => {
        btn.innerText = "Copiar";
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
  const numeroNequi = "3215938767";
  navigator.clipboard.writeText(numeroNequi).then(() => {
    const btn = document.getElementById("btnCopiarNequi");
    if (btn) {
      btn.innerText = "¡Copiado!";
      btn.style.color = "var(--ios-green)";
      triggerToast("Número Nequi/Daviplata copiado");
      setTimeout(() => {
        btn.innerText = "Copiar";
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
      mensaje += `🎁 *Combo Aplicado:* ${nombreCombo}\n`;
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

  const rowRegaloMisterioso = document.getElementById("row_regalo_misterioso");
  let productosPrincipales = carrito.filter((item) => {
    if (
      window.regaloMisteriosoAplicado &&
      window.regaloMisteriosoAplicado.tipo === "gratis"
    ) {
      return item.id !== window.regaloMisteriosoAplicado.valor;
    }
    return true;
  }).length;

  if (
    window.regaloMisteriosoAplicado &&
    window.tiempoRestanteRegalo > 0 &&
    productosPrincipales > 0 &&
    rowRegaloMisterioso &&
    rowRegaloMisterioso.style.display === "flex"
  ) {
    mensaje += `\n🎁 *¡Premio de Caja Misteriosa Aplicado!:* _${window.regaloMisteriosoAplicado.msjWhatsapp}_\n`;
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

function vaciarCarrito() {
  haptic();
  if (carrito.length === 0) return;

  carrito = [];
  const botonesActivos = document.querySelectorAll(".btn-add-store.btn-added");
  botonesActivos.forEach((btn) => {
    btn.classList.remove("btn-added");
    btn.innerText = "Añadir";
  });

  promoAplicadaEnCarrito = null;
  actualizarCarrito();
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
        "<strong>¿CÓMO COMPRAR EN LA PÁGINA?</strong><br><br>" +
        "1️⃣ <strong>Selecciona:</strong> Ve añadiendo las plataformas que desees directamente desde las tarjetas de la tienda.<br>" +
        "2️⃣ <strong>Configura:</strong> Abre tu carrito abajo a la derecha para elegir los meses de vigencia o si es una renovación.<br>" +
        "3️⃣ <strong>Transfiere:</strong> Toca en 'Anuncio de Pago' para ver los datos de transferencia.<br>" +
        "4️⃣ <strong>Despacha:</strong> Recuerda siempre <strong>tomarle captura a la foto del pago, después darle al botón 'Ya realicé el pago'</strong> y <strong>enviar la foto con el texto</strong> por WhatsApp.";
    } else if (question.includes("medios de pago")) {
      botReply =
        "<strong>¿CÓMO REALIZAR TU PAGO?</strong><br><br>" +
        "Para activar o renovar tu servicio, los pasos son súper sencillos:<br><br>" +
        "1️⃣ <strong>Realiza tu pago:</strong> Al abrir tu carrito y tocar en 'Anuncio de Pago', el sistema te desplegará los datos de nuestra llave comercial de la red principal <strong>Bre-B</strong> y las opciones alternativas de <strong>Nequi o Daviplata</strong>.<br><br>" +
        "2️⃣ <strong>Tómale captura a la foto del pago</strong> obligatoriamente una vez sea exitoso.<br><br>" +
        "3️⃣ <strong>Después, regresa a la tienda y dale al botón 'Ya realicé el pago'</strong> dentro del panel.<br><br>" +
        "4️⃣ Al abrirse WhatsApp, <strong>envía la foto del pago junto con el texto</strong> generado automáticamente para tu entrega inmediata.";
    } else if (question.includes("Beneficios")) {
      botReply =
        "<strong>BENEFICIOS EXCLUSIVOS AL COMPRAR EN CYBERNET:</strong><br><br>" +
        "⚡ <strong>Verificación y Entrega:</strong> Una vez envías tu pago, este entra a revisión y se realiza la entrega de tus accesos apenas sea validado.<br>" +
        "🤖 <strong>Bot de Códigos TV 24/7:</strong> Si adquieres Netflix, podrás generar tus códigos de acceso a tu televisor de manera automática desde el botón superior 'Códigos', sin esperas ni intermediarios.<br>" +
        "🔒 <strong>Cuentas 100% Estables:</strong> Garantizamos perfiles privados, estables y un servicio original sin caídas.<br>" +
        "🎉 <strong>Ahorro Automatizado:</strong> El carrito calcula y te aplica tus combos favoritos de forma automática.<br>" +
        "🛠 <strong>Soporte Garantizado:</strong> Te acompañamos con atención rápida y efectiva durante todo tu mes de vigencia.";
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
  cargarMemoriaTienda();
  sincronizarPreciosDesdeMySQL();
  actualizarCarrito();
  iniciarSistemaPromos();
  cargarEstrenosAleatorios();
};

// =========================================================================
// 🛰️ RECEPTOR: SINCRONIZADOR DE STOCK AUTOMÁTICO
// =========================================================================

function verificarStockDesdeMemoria() {
  const agotados = JSON.parse(
    localStorage.getItem("cyber_items_agotados") || "[]",
  );

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
    "btn_canva",
    "btn_spotify",
    "btn_yt",
  ];

  idsPlataformas.forEach((id) => {
    const boton = document.getElementById(id);
    if (!boton) return;

    const tarjeta = boton.closest(".card-ios");

    if (agotados.includes(id)) {
      if (tarjeta) tarjeta.classList.add("tarjeta-agotada");
      boton.classList.add("agotado");
      boton.disabled = true;
      boton.innerText = "Agotado";
    } else {
      if (tarjeta) tarjeta.classList.remove("tarjeta-agotada");
      boton.classList.remove("agotado");
      boton.disabled = false;
      boton.innerText = "Añadir";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  verificarStockDesdeMemoria();
  sincronizarPreciosDesdeMySQL();
});

window.addEventListener("storage", function (e) {
  if (e.key === "cyber_items_agotados") {
    verificarStockDesdeMemoria();
  }
});

// =========================================
// 🌙 SISTEMA DE MODO CLARO / OSCURO
// =========================================
function toggleTheme() {
  haptic();
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("cyber_theme", newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  if (theme === "light") {
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  } else {
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("cyber_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
});

// =========================================================================
// 🎬 FUNCIÓN PARA AÑADIR DESDE LOS ESTRENOS DE LA SEMANA
// =========================================================================
function agregarDesdeEstreno(id, nombre, btnId, priceBase) {
  haptic();
  const btnReal = document.getElementById(btnId);

  if (!carrito.find((i) => i.id === id)) {
    const tipoReal = PLATAFORMAS_INFO[id]
      ? PLATAFORMAS_INFO[id].type
      : "regular";

    toggleItem(id, nombre, tipoReal, priceBase, btnReal);
    triggerToast(`¡${nombre} añadido al carrito!`);
  } else {
    triggerToast(`${nombre} ya estaba en tu carrito.`);
  }
}

// =========================================================================
// 🪄 LÓGICA DEL ARMADOR DE COMBOS
// =========================================================================
let quizPasoActual = 0;
let quizRespuestas = {};

const quizPreguntas = [
  {
    pregunta: "1. ¿Te gustaría incluir Netflix en tu combo?",
    opciones: [
      { icono: "🍿", texto: "Sí, con Netflix", valor: "si" },
      { icono: "❌", texto: "No, sin Netflix", valor: "no" },
    ],
  },
  {
    pregunta: "2. ¿Qué género disfrutas más?",
    opciones: [
      { icono: "💥", texto: "Acción y Sci-Fi", valor: "accion" },
      { icono: "🎭", texto: "Drama y Romance", valor: "drama" },
      { icono: "😂", texto: "Comedia y Animación", valor: "comedia" },
      { icono: "👻", texto: "Terror y Suspenso", valor: "terror" },
    ],
  },
  {
    pregunta: "3. ¿Qué formato sueles consumir más?",
    opciones: [
      { icono: "🎬", texto: "Películas", valor: "cine" },
      { icono: "📺", texto: "Series largas", valor: "series" },
      { icono: "⚽", texto: "Deportes en Vivo", valor: "deportes" },
      { icono: "🎌", texto: "Anime", valor: "anime" },
    ],
  },
  {
    pregunta: "4. ¿Qué estilo de producción prefieres?",
    opciones: [
      { icono: "🏆", texto: "Originales Premiadas", valor: "premiadas" },
      { icono: "🦸‍♂️", texto: "Blockbusters/Héroes", valor: "blockbusters" },
      { icono: "🏰", texto: "Clásicos Familiares", valor: "familia" },
      { icono: "🌶️", texto: "Novelas y Realitys", valor: "novelas" },
    ],
  },
  {
    pregunta: "5. ¿Quién usará principalmente la cuenta?",
    opciones: [
      { icono: "👶", texto: "Hay niños en casa", valor: "ninos" },
      { icono: "🔞", texto: "Solo para adultos", valor: "adultos" },
      { icono: "🛹", texto: "Adolescentes", valor: "jovenes" },
      { icono: "🍿", texto: "De todo un poco", valor: "todos" },
    ],
  },
  {
    pregunta: "6. ¿Cuántas pantallas simultáneas necesitas?",
    opciones: [
      { icono: "👤", texto: "1 Pantalla (Solo yo)", valor: 1 },
      { icono: "👥", texto: "2 Pantallas (Pareja)", valor: 2 },
      { icono: "👨‍👩‍👦", texto: "3 Pantallas (Familia)", valor: 3 },
      { icono: "📱", texto: "4 Pantallas (Multidispositivo)", valor: 4 },
    ],
  },
  {
    pregunta: "7. Por último, ¿cuál es tu presupuesto ideal?",
    opciones: [
      { icono: "💰", texto: "Económico (Lo básico)", valor: "economico" },
      { icono: "💎", texto: "Intermedio (Buen valor)", valor: "intermedio" },
      { icono: "👑", texto: "Premium (Quiero todo)", valor: "premium" },
      { icono: "🎁", texto: "¡Sorpréndeme!", valor: "sorpresa" },
    ],
  },
];

function abrirQuiz() {
  haptic();
  quizPasoActual = 0;
  quizRespuestas = {};
  renderizarQuiz();

  document.getElementById("quizOverlay").classList.add("open");
  document.getElementById("quizModal").classList.add("active");
}

function cerrarQuiz() {
  haptic();
  document.getElementById("quizOverlay").classList.remove("open");
  document.getElementById("quizModal").classList.remove("active");
}

function renderizarQuiz() {
  const quizBody = document.getElementById("quizBody");

  if (quizPasoActual < quizPreguntas.length) {
    const q = quizPreguntas[quizPasoActual];
    const progreso = (quizPasoActual / quizPreguntas.length) * 100;

    let html = `
            <div class="quiz-progress-bar">
                <div class="quiz-progress-fill" style="width: ${progreso}%"></div>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); line-height: 1.3; margin-bottom: 5px;">${q.pregunta}</h3>
            
            <div class="quiz-grid">
        `;

    q.opciones.forEach((opc) => {
      html += `
            <div class="quiz-card-btn" onclick="responderQuiz('${opc.valor}')">
                <div class="quiz-card-icon">${opc.icono}</div>
                <div class="quiz-card-title">${opc.texto}</div>
            </div>`;
    });

    html += `</div>`;
    quizBody.innerHTML = html;
  } else {
    procesarResultadoQuiz();
  }
}

function responderQuiz(valor) {
  haptic();
  const claves = [
    "incluyeNetflix",
    "genero",
    "formato",
    "estilo",
    "compania",
    "pantallas",
    "presupuesto",
  ];
  quizRespuestas[claves[quizPasoActual]] = valor;

  quizPasoActual++;
  renderizarQuiz();
}

function procesarResultadoQuiz() {
  const quizBody = document.getElementById("quizBody");

  quizBody.innerHTML = `
        <div class="quiz-progress-bar">
            <div class="quiz-progress-fill" style="width: 100%; background: var(--ios-green);"></div>
        </div>
        <div class="loader" style="border-top-color: var(--ios-green); margin-top: 30px;"></div>
        <p style="font-weight: 800; font-size: 1.1rem; color: var(--ios-green); margin-top: 15px;">¡Analizando tus gustos!</p>
        <p style="font-size: 0.85rem; color: var(--text-secondary);">Diseñando tu cartelera ideal...</p>
    `;

  setTimeout(() => {
    vaciarCarrito();

    let itemsSet = new Set();

    if (quizRespuestas.formato === "anime") {
      itemsSet.add("crunchy");
      itemsSet.add("netflix");
    }
    if (quizRespuestas.formato === "deportes") {
      itemsSet.add("disney_prem");
      itemsSet.add("vix");
    }
    if (quizRespuestas.formato === "series") {
      itemsSet.add("netflix");
      itemsSet.add("max");
    }
    if (quizRespuestas.formato === "cine") {
      itemsSet.add("max");
      itemsSet.add("amazon");
    }

    if (quizRespuestas.estilo === "premiadas") {
      itemsSet.add("apple");
      itemsSet.add("max");
    }
    if (quizRespuestas.estilo === "blockbusters") {
      itemsSet.add("disney_prem");
      itemsSet.add("paramount");
    }
    if (quizRespuestas.estilo === "familia") {
      itemsSet.add("disney_std");
      itemsSet.add("netflix");
    }
    if (quizRespuestas.estilo === "novelas") {
      itemsSet.add("vix");
      itemsSet.add("amazon");
    }

    if (quizRespuestas.genero === "accion") {
      itemsSet.add("amazon");
    }
    if (quizRespuestas.genero === "terror") {
      itemsSet.add("paramount");
      itemsSet.add("max");
    }

    if (quizRespuestas.compania === "ninos") {
      itemsSet.add("disney_std");
    }

    if (quizRespuestas.incluyeNetflix === "si") {
      itemsSet.add("netflix");
    } else {
      itemsSet.delete("netflix");
    }

    let itemsAAgregar = Array.from(itemsSet);

    if (quizRespuestas.presupuesto === "economico") {
      itemsAAgregar = itemsAAgregar.slice(0, 1);
    } else if (quizRespuestas.presupuesto === "intermedio") {
      itemsAAgregar = itemsAAgregar.slice(0, 2);
    } else if (quizRespuestas.presupuesto === "premium") {
      itemsAAgregar = itemsAAgregar.slice(0, 4);
    } else {
      itemsAAgregar = itemsAAgregar.slice(0, 3);
    }

    if (itemsAAgregar.length === 0) {
      if (quizRespuestas.incluyeNetflix === "si") {
        itemsAAgregar.push("netflix");
      } else {
        itemsAAgregar.push("disney_prem");
      }
    }

    itemsAAgregar.forEach((id) => {
      const data = PLATAFORMAS_INFO[id];
      if (data) {
        carrito.push({
          id: id,
          nombre: data.name,
          type: data.type,
          price: data.price,
          pantallas: parseInt(quizRespuestas.pantallas),
        });

        let btn = document.getElementById("btn_" + id);
        if (btn) {
          btn.classList.add("btn-added");
          btn.innerText = "Quitar";
        }
      }
    });

    actualizarCarrito();
    cerrarQuiz();

    setTimeout(() => {
      triggerToast("¡Combos añadidos a tu carrito!");
      abrirCarrito();
    }, 400);
  }, 1800);
}

// =========================================================================
// 🎬 MOTOR DE ESTRENOS DINÁMICOS Y ALEATORIOS
// =========================================================================

const CARTELERA_TENDENCIAS = [
  {
    id: "netflix",
    nombre: "Netflix",
    titulo: "El Juego del Calamar",
    img: "https://tse2.mm.bing.net/th?q=Squid+Game+Netflix+wallpaper",
    btn: "btn_netflix",
    precio: 0,
    badgeStr:
      'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"',
  },
  {
    id: "netflix",
    nombre: "Netflix",
    titulo: "Stranger Things",
    img: "https://tse3.mm.bing.net/th?q=Stranger+Things+Netflix+wallpaper",
    btn: "btn_netflix",
    precio: 0,
    badgeStr:
      'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"',
  },
  {
    id: "netflix",
    nombre: "Netflix",
    titulo: "Merlina",
    img: "https://tse1.mm.bing.net/th?q=Wednesday+Netflix+wallpaper",
    btn: "btn_netflix",
    precio: 0,
    badgeStr:
      'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"',
  },
  {
    id: "max",
    nombre: "HBO Max",
    titulo: "La Casa del Dragón",
    img: "https://tse1.mm.bing.net/th?q=House+of+the+Dragon+HBO+wallpaper",
    btn: "btn_max",
    precio: 0,
    badgeStr: 'class="release-badge max-badge"',
  },
  {
    id: "max",
    nombre: "HBO Max",
    titulo: "The Last of Us",
    img: "https://tse2.mm.bing.net/th?q=The+Last of+Us+HBO+show+wallpaper",
    btn: "btn_max",
    precio: 0,
    badgeStr: 'class="release-badge max-badge"',
  },
  {
    id: "disney_prem",
    nombre: "Disney+",
    titulo: "The Mandalorian",
    img: "https://tse1.mm.bing.net/th?q=The+Mandalorian+Disney+wallpaper",
    btn: "btn_disney_prem",
    precio: 0,
    badgeStr: 'class="release-badge disney-badge"',
  },
  {
    id: "amazon",
    nombre: "Amazon",
    titulo: "The Boys",
    img: "https://tse1.mm.bing.net/th?q=The+Boys+Amazon+wallpaper",
    btn: "btn_amazon",
    precio: 0,
    badgeStr:
      'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"',
  },
  {
    id: "apple",
    nombre: "Apple TV+",
    titulo: "Severance",
    img: "https://tse1.mm.bing.net/th?q=Severance+Apple+TV+wallpaper",
    btn: "apple",
    precio: 0,
    badgeStr:
      'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"',
  },
  {
    id: "crunchy",
    nombre: "Crunchyroll",
    titulo: "Demon Slayer",
    img: "https://tse1.mm.bing.net/th?q=Demon+Slayer+anime+wallpaper",
    btn: "btn_crunchy",
    precio: 0,
    badgeStr: 'class="release-badge" style="background: #F47521;"',
  },
];

let autoScrollEstrenosInterval = null;

function cargarEstrenosAleatorios() {
  const contenedor = document.getElementById("contenedorEstrenos");
  if (!contenedor) return;

  let carteleraMezclada = [...CARTELERA_TENDENCIAS];
  for (let i = carteleraMezclada.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [carteleraMezclada[i], carteleraMezclada[j]] = [
      carteleraMezclada[j],
      carteleraMezclada[i],
    ];
  }

  const estrenosDelDia = carteleraMezclada.slice(0, 7);

  let htmlFinal = "";
  estrenosDelDia.forEach((item) => {
    htmlFinal += `
          <div class="release-card" style="background-image: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.1) 100%), url('${item.img}');">
             <div class="release-info">
               <span ${item.badgeStr}>${item.nombre}</span>
               <h3>${item.titulo}</h3>
               <button class="btn-ios btn-release" onclick="agregarDesdeEstreno('${item.id}', '${item.nombre}', '${item.btn}', ${item.precio})">Añadir a mi combo</button>
             </div>
          </div>
        `;
  });

  contenedor.innerHTML = htmlFinal;
  iniciarAutoScrollEstrenos();
}

function iniciarAutoScrollEstrenos() {
  const container = document.getElementById("contenedorEstrenos");
  if (!container) return;

  clearInterval(autoScrollEstrenosInterval);

  autoScrollEstrenosInterval = setInterval(() => {
    const maxScroll = container.scrollWidth - container.clientWidth;
    const pasoDesplazamiento = 274;

    if (container.scrollLeft >= maxScroll - 10) {
      container.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      container.scrollBy({ left: pasoDesplazamiento, behavior: "smooth" });
    }
  }, 3000);
}

// =========================================================================
// 🎁 SISTEMA DE CAJA MISTERIOSA
// =========================================================================
window.regaloMisteriosoAplicado = null;
window.tiempoRestanteRegalo = 900;
let regaloCountdownInterval = null;

const LISTA_REGALOS_CYBERNET = [
  {
    id: "r1",
    tipo: "descuento",
    valor: 1000,
    texto:
      "🎟️ ¡Genial! Ganaste <strong>$1.000 COP</strong> de rebaja total. _(Requiere llevar al menos 1 plataforma de la tienda)_.",
    msjWhatsapp: "$1.000 de descuento neto",
  },
  {
    id: "r2",
    tipo: "descuento",
    valor: 2000,
    texto:
      "🎟️ ¡Mega Descuento! Ganaste <strong>$2.000 COP</strong> de rebaja total. _(Requiere llevar al menos 1 plataforma de la tienda)_.",
    msjWhatsapp: "$2.000 de descuento neto",
  },
  {
    id: "r3",
    tipo: "descuento",
    valor: 3000,
    texto:
      "🎟️ ¡Premio Máximo en Plata! Ganaste <strong>$3.000 COP</strong> de rebaja total. _(Requiere llevar al menos 1 plataforma de la tienda)_.",
    msjWhatsapp: "$3.000 de descuento neto",
  },
  {
    id: "r4",
    tipo: "gratis",
    valor: "vix",
    texto:
      "⚽ ¡Premio Especial! Ganaste 1 mes de <strong>Vix+ completamente GRATIS</strong>. _(Se activará únicamente al comprar otra plataforma adicional)_.",
    msjWhatsapp: "¡Vix+ Gratis por 1 Mes!",
  },
  {
    id: "r5",
    tipo: "gratis",
    valor: "max",
    texto:
      "💜 ¡Premio Especial! Ganaste 1 mes de <strong>HBO Max completamente GRATIS</strong>. _(Se activará únicamente al comprar otra plataforma adicional)_.",
    msjWhatsapp: "¡HBO Max Gratis por 1 Mes!",
  },
  {
    id: "r6",
    tipo: "gratis",
    valor: "disney_std",
    texto:
      "🏰 ¡Premio Especial! Ganaste 1 mes de <strong>Disney Estándar completamente GRATIS</strong>. _(Se activará únicamente al comprar otra plataforma adicional)_.",
    msjWhatsapp: "¡Disney Estándar Gratis por 1 Mes!",
  },
  {
    id: "r7",
    tipo: "gratis",
    valor: "plex",
    texto:
      "🎬 ¡Premio Especial! Ganaste 1 mes de <strong>Plex TV completamente GRATIS</strong>. _(Se activará únicamente al comprar otra plataforma adicional)_.",
    msjWhatsapp: "¡Plex TV Gratis por 1 Mes!",
  },
];

function abrirModalRegalo() {
  haptic();
  const hoy = new Date().toLocaleDateString("es-CO");
  if (localStorage.getItem("cyber_gift_claimed_date") === hoy) {
    triggerToast("Ya reclamaste tu regalo de hoy. ¡Vuelve mañana!");
    return;
  }

  document.getElementById("giftOverlay").classList.add("open");
  document.getElementById("giftModal").classList.add("active");
}

function cerrarModalRegalo() {
  haptic();
  document.getElementById("giftOverlay").classList.remove("open");
  document.getElementById("giftModal").classList.remove("active");
}

function animarYAbrirCaja() {
  haptic();
  const caja = document.getElementById("visualCaja");
  const contenido = document.getElementById("giftModalContenido");

  caja.classList.add("box-shake-animation");
  contenido.innerHTML = `<h3 style="font-size: 1.15rem; font-weight: 800; margin-top: 15px;">Abriendo caja de recompensas...</h3>`;

  setTimeout(() => {
    caja.classList.remove("box-shake-animation");
    caja.innerHTML = `<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#bf5af2" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line></svg>`;
    caja.style.transform = "scale(1.2)";

    const premioGanado =
      LISTA_REGALOS_CYBERNET[
        Math.floor(Math.random() * LISTA_REGALOS_CYBERNET.length)
      ];
    window.regaloMisteriosoAplicado = premioGanado;
    window.tiempoRestanteRegalo = 900;

    const hoy = new Date().toLocaleDateString("es-CO");
    localStorage.setItem("cyber_gift_claimed_date", hoy);
    localStorage.setItem("cyber_active_gift", JSON.stringify(premioGanado));
    localStorage.setItem(
      "cyber_gift_expires_at",
      (Date.now() + 900 * 1000).toString(),
    );

    const bannerTienda = document.getElementById("cyberGiftBanner");
    if (bannerTienda) {
      bannerTienda.style.opacity = "0.5";
      bannerTienda.style.pointerEvents = "none";
      bannerTienda.querySelector("p").innerText =
        "Ya reclamaste tu recompensa por el día de hoy";
    }

    contenido.innerHTML = `
            <div class="badge-ios badge-success" style="background:rgba(48,209,88,0.15); color:var(--ios-green); margin-bottom:12px;">¡RECOMPENSA DESBLOQUEADA!</div>
            <p style="font-size: 1.05rem; line-height: 1.4; margin-bottom: 15px; padding: 0 10px;">${premioGanado.texto}</p>
            
            <div class="gift-countdown-box">
                ⏱️ El regalo expira en: <span id="giftClock">15:00</span>
            </div>
            
            <button class="btn-ios btn-success w-100" style="margin-top:25px; padding:14px; width: 100%; display: flex; align-items: center; justify-content: center;" onclick="aplicarRegaloYIrAlCarrito()">Reclamar y activar descuento</button>
        `;

    iniciarRelojRegalo();
  }, 1500);
}

function iniciarRelojRegalo() {
  clearInterval(regaloCountdownInterval);
  regaloCountdownInterval = setInterval(() => {
    window.tiempoRestanteRegalo--;

    let mins = Math.floor(window.tiempoRestanteRegalo / 60);
    let secs = window.tiempoRestanteRegalo % 60;

    if (mins < 10) mins = "0" + mins;
    if (secs < 10) secs = "0" + secs;

    const clockEl = document.getElementById("giftClock");
    if (clockEl) clockEl.innerText = `${mins}:${secs}`;

    if (window.tiempoRestanteRegalo <= 0) {
      clearInterval(regaloCountdownInterval);
      window.regaloMisteriosoAplicado = null;
      localStorage.removeItem("cyber_active_gift");
      localStorage.removeItem("cyber_gift_expires_at");
      actualizarCarrito();
      triggerToast("Tu regalo diario ha expirado.");
    }
  }, 1000);
}

function aplicarRegaloYIrAlCarrito() {
  haptic();

  if (window.regaloMisteriosoAplicado.tipo === "gratis") {
    const idPlat = window.regaloMisteriosoAplicado.valor;
    if (!carrito.find((i) => i.id === idPlat)) {
      const infoBase = PLATAFORMAS_INFO[idPlat];
      if (infoBase) {
        carrito.push({
          id: idPlat,
          nombre: infoBase.name,
          type: infoBase.type,
          price: infoBase.price,
          pantallas: 1,
        });
        let btnUI =
          document.getElementById("btn_" + idPlat) ||
          document.getElementById(idPlat);
        if (btnUI) {
          btnUI.classList.add("btn-added");
          btnUI.innerText = "Quitar";
        }
      }
    }
  }

  actualizarCarrito();
  cerrarModalRegalo();
  abrirCarrito();

  let productosReales = carrito.filter((item) => {
    return window.regaloMisteriosoAplicado.tipo === "gratis"
      ? item.id !== window.regaloMisteriosoAplicado.valor
      : true;
  }).length;

  if (productosReales > 0) {
    triggerToast("¡Regalo activado y aplicado con éxito!");
  } else {
    triggerToast("¡Regalo preparado! Añade otra plataforma para activarlo.");
  }
}

function cargarMemoriaTienda() {
  const carritoGuardado = localStorage.getItem("cyber_carrito");
  if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
    carrito.forEach((item) => {
      let btn =
        document.getElementById("btn_" + item.id) ||
        document.getElementById(item.id);
      if (btn) {
        btn.classList.add("btn-added");
        btn.innerText = "Quitar";
      }
    });
  }

  const hoy = new Date().toLocaleDateString("es-CO");
  const fechaRegaloReclamado = localStorage.getItem("cyber_gift_claimed_date");
  if (fechaRegaloReclamado === hoy) {
    const bannerTienda = document.getElementById("cyberGiftBanner");
    if (bannerTienda) {
      bannerTienda.style.opacity = "0.5";
      bannerTienda.style.pointerEvents = "none";
      bannerTienda.querySelector("p").innerText =
        "Ya reclamaste tu recompensa por el día de hoy";
    }
  }

  const regaloActivoGuardado = localStorage.getItem("cyber_active_gift");
  const regaloExpiracion = localStorage.getItem("cyber_gift_expires_at");
  if (regaloActivoGuardado && regaloExpiracion) {
    const tiempoAhora = Date.now();
    const expiraAt = parseInt(regaloExpiracion);
    if (expiraAt > tiempoAhora) {
      window.regaloMisteriosoAplicado = JSON.parse(regaloActivoGuardado);
      window.tiempoRestanteRegalo = Math.floor((expiraAt - tiempoAhora) / 1000);
      iniciarRelojRegalo();
    } else {
      localStorage.removeItem("cyber_active_gift");
      localStorage.removeItem("cyber_gift_expires_at");
      window.regaloMisteriosoAplicado = null;
    }
  }

  actualizarCarrito();
}
