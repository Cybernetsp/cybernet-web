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
  canva: { name: "Canva Pro", type: "addon", price: 20000 },
  spotify: { name: "Spotify Premium", type: "addon", price: 14000 },
  yt: { name: "YouTube Premium", type: "addon", price: 14000 },
  deezer: { name: "Deezer", type: "addon", price: 12000 },
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

  // Extracción de plataformas con lógicas de descuento aisladas
  const itemParamount = tempCart.find((i) => i.id === "paramount");

  // Filtramos las especiales para que no interfieran en los cálculos del combo base de básicas
  const lasEspecialesIds = ["paramount"];
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

  // ⚡ INYECTOR DE LA NUEVA MATEMÁTICA EN CADENA: Rebaja fijos si hay combo o entre ellas
  let colaEspeciales = [];
  if (itemParamount)
    colaEspeciales.push({ name: "Paramount", full: 15000, combo: 13000 });

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
        if (item.id === "paramount") return sum + extra * 8000 * meses;
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

  // ⚡ INTERCEPTADOR DE LA CAJA MISTERIOSA (COMPRA OBLIGATORIA, NO ACUMULABLE)
  let descuentoMisterioso = 0;
  
  // Contamos cuántos productos pagados hay en el carrito (excluyendo el ID del premio gratuito si aplica)
  let productosPrincipalesEnCarrito = carrito.filter(item => {
      if (window.regaloMisteriosoAplicado && window.regaloMisteriosoAplicado.tipo === "gratis") {
          return item.id !== window.regaloMisteriosoAplicado.valor;
      }
      return true;
  }).length;

  const rowRegalo = document.getElementById("row_regalo_misterioso");
  const lblRegalo = document.getElementById("lblRegaloMisterioso");

  if (window.regaloMisteriosoAplicado && window.tiempoRestanteRegalo > 0) {
      if (rowRegalo) rowRegalo.style.display = "flex";
      
      // 🔥 REGLA DE NO ACUMULACIÓN: Si ya hay un descuento por Oferta Relámpago activo, bloqueamos el regalo
      if (descuentoPorPromo > 0) {
          if (lblRegalo) {
              lblRegalo.innerText = "No acumulable";
              lblRegalo.style.color = "var(--ios-orange)";
          }
          if (rowRegalo) rowRegalo.querySelector(".td-cell").innerHTML = "🎁 Regalo (No acumulable con Oferta Relámpago)";
          
          descuentoMisterioso = 0; // Forzamos a que el descuento sea cero pesos
      } 
      // CONDICIÓN NORMAL: Debe tener al menos un producto adicional comprado
      else if (productosPrincipalesEnCarrito > 0) {
          if (window.regaloMisteriosoAplicado.tipo === "descuento") {
              descuentoMisterioso = window.regaloMisteriosoAplicado.valor;
          } else if (window.regaloMisteriosoAplicado.tipo === "gratis") {
              const itemGratis = carrito.find(i => i.id === window.regaloMisteriosoAplicado.valor);
              if (itemGratis) { descuentoMisterioso = itemGratis.price; } 
          }
          totalNetoFinal -= descuentoMisterioso;
          
          if (lblRegalo) {
              lblRegalo.innerText = "-$" + descuentoMisterioso.toLocaleString("es-CO");
              lblRegalo.style.color = "var(--ios-green)";
          }
          if (rowRegalo) rowRegalo.querySelector(".td-cell").innerHTML = "🎁 Regalo de la Caja (Activo)";
      } else {
          // Si el carrito está vacío
          if (lblRegalo) {
              lblRegalo.innerText = "Inactivo";
              lblRegalo.style.color = "var(--ios-red)";
          }
          if (rowRegalo) rowRegalo.querySelector(".td-cell").innerHTML = "🎁 Regalo (Añade otra plataforma para activar)";
      }
  } else {
      if (rowRegalo) rowRegalo.style.display = "none";
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
  const numeroLlave = "1007416341";
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
  const numeroNequi = "3215938767";
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

  const rowRegaloMisterioso = document.getElementById("row_regalo_misterioso");
  let productosPrincipales = carrito.filter(item => {
      if (window.regaloMisteriosoAplicado && window.regaloMisteriosoAplicado.tipo === "gratis") {
          return item.id !== window.regaloMisteriosoAplicado.valor;
      }
      return true;
  }).length;

  // Solo envía el premio a WhatsApp si el temporizador está activo y se cumplió la regla de compra
  if (window.regaloMisteriosoAplicado && window.tiempoRestanteRegalo > 0 && productosPrincipales > 0 && rowRegaloMisterioso && rowRegaloMisterioso.style.display === "flex") {
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

// 🗑️ FUNCIÓN PARA VACIAR TODO EL CARRITO DE GOLPE
function vaciarCarrito() {
  haptic();

  if (carrito.length === 0) return; // Si ya está vacío, no hace nada

  // 1. Vaciamos la memoria del carrito
  carrito = [];

  // 2. Buscamos todos los botones que están en estado "Quitar" (btn-added)
  const botonesActivos = document.querySelectorAll(".btn-add-store.btn-added");

  // 3. Los recorremos y los regresamos a su estado original
  botonesActivos.forEach((btn) => {
    btn.classList.remove("btn-added");
    btn.innerText = "Añadir";
  });

  // 4. Actualizamos la interfaz del carrito y reseteamos promos
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
        "🛒 <strong>¿CÓMO COMPRAR EN LA PÁGINA?</strong> 🛍️<br><br>" +
        "1️⃣ <strong>Selecciona:</strong> Ve añadiendo las plataformas que desees directamente desde las tarjetas de la tienda.<br>" +
        "2️⃣ <strong>Configura:</strong> Abre tu carrito abajo a la derecha para elegir los meses de vigencia o si es una renovación.<br>" +
        "3️⃣ <strong>Transfiere:</strong> Toca en 'Anuncio de Pago' para ver los datos de transferencia.<br>" +
        "4️⃣ <strong>Despacha:</strong> Recuerda siempre <strong>tomarle captura a la foto del pago, después darle al botón 'Ya realicé el pago'</strong> y <strong>enviar la foto con el texto</strong> por WhatsApp. ¡Y listo! 🍿";
    } else if (question.includes("medios de pago")) {
      botReply =
        "💳 <strong>¿CÓMO REALIZAR TU PAGO?</strong> 🏦<br><br>" +
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
  cargarMemoriaTienda();
  actualizarCarrito();
  iniciarSistemaPromos();
  cargarEstrenosAleatorios();
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
    "btn_canva",
    "btn_spotify",
    "btn_yt",
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

// Aplicar tema al cargar la página
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
  // Reutilizamos tu función original para no romper la lógica de combos
  const btnReal = document.getElementById(btnId);

  // Si no está en el carrito, lo agregamos
  if (!carrito.find((i) => i.id === id)) {
    toggleItem(
      id,
      nombre,
      id === "disney_prem" ? "disney_prem" : "regular",
      priceBase,
      btnReal,
    );
    triggerToast(`🍿 ¡${nombre} añadido al carrito!`);
  } else {
    triggerToast(`⚡ ${nombre} ya estaba en tu carrito.`);
  }
}

// =========================================================================
// 🪄 LÓGICA DEL ARMADOR DE COMBOS (7 PREGUNTAS - SOLO VIDEO STREAMING)
// =========================================================================
let quizPasoActual = 0;
let quizRespuestas = {};

const quizPreguntas = [
    {
        pregunta: "1. ¿Te gustaría incluir Netflix en tu combo?",
        opciones: [
            { icono: "🍿", texto: "Sí, con Netflix", valor: "si" },
            { icono: "❌", texto: "No, sin Netflix", valor: "no" }
        ]
    },
    {
        pregunta: "2. ¿Qué género disfrutas más?",
        opciones: [
            { icono: "💥", texto: "Acción y Sci-Fi", valor: "accion" },
            { icono: "🎭", texto: "Drama y Romance", valor: "drama" },
            { icono: "😂", texto: "Comedia y Animación", valor: "comedia" },
            { icono: "👻", texto: "Terror y Suspenso", valor: "terror" }
        ]
    },
    {
        pregunta: "3. ¿Qué formato sueles consumir más?",
        opciones: [
            { icono: "🎬", texto: "Películas", valor: "cine" },
            { icono: "📺", texto: "Series largas", valor: "series" },
            { icono: "⚽", texto: "Deportes en Vivo", valor: "deportes" },
            { icono: "🎌", texto: "Anime", valor: "anime" }
        ]
    },
    {
        pregunta: "4. ¿Qué estilo de producción prefieres?",
        opciones: [
            { icono: "🏆", texto: "Originales Premiadas", valor: "premiadas" },
            { icono: "🦸‍♂️", texto: "Blockbusters/Héroes", valor: "blockbusters" },
            { icono: "🏰", texto: "Clásicos Familiares", valor: "familia" },
            { icono: "🌶️", texto: "Novelas y Realitys", valor: "novelas" }
        ]
    },
    {
        pregunta: "5. ¿Quién usará principalmente la cuenta?",
        opciones: [
            { icono: "👶", texto: "Hay niños en casa", valor: "ninos" },
            { icono: "🔞", texto: "Solo para adultos", valor: "adultos" },
            { icono: "🛹", texto: "Adolescentes", valor: "jovenes" },
            { icono: "🍿", texto: "De todo un poco", valor: "todos" }
        ]
    },
    {
        pregunta: "6. ¿Cuántas pantallas simultáneas necesitas?",
        opciones: [
            { icono: "👤", texto: "1 Pantalla (Solo yo)", valor: 1 },
            { icono: "👥", texto: "2 Pantallas (Pareja)", valor: 2 },
            { icono: "👨‍👩‍👦", texto: "3 Pantallas (Familia)", valor: 3 },
            { icono: "📱", texto: "4 Pantallas (Multidispositivo)", valor: 4 }
        ]
    },
    {
        pregunta: "7. Por último, ¿cuál es tu presupuesto ideal?",
        opciones: [
            { icono: "💰", texto: "Económico (Lo básico)", valor: "economico" },
            { icono: "💎", texto: "Intermedio (Buen valor)", valor: "intermedio" },
            { icono: "👑", texto: "Premium (Quiero todo)", valor: "premium" },
            { icono: "🎁", texto: "¡Sorpréndeme!", valor: "sorpresa" }
        ]
    }
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
        
        q.opciones.forEach(opc => {
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
    
    // Removida la clave de música para alinearse con las 7 preguntas
    const claves = ["incluyeNetflix", "genero", "formato", "estilo", "compania", "pantallas", "presupuesto"];
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
        
        // 1. Reglas básicas por formato
        if (quizRespuestas.formato === 'anime') { itemsSet.add('crunchy'); itemsSet.add('netflix'); }
        if (quizRespuestas.formato === 'deportes') { itemsSet.add('disney_prem'); itemsSet.add('vix'); }
        if (quizRespuestas.formato === 'series') { itemsSet.add('netflix'); itemsSet.add('max'); }
        if (quizRespuestas.formato === 'cine') { itemsSet.add('max'); itemsSet.add('amazon'); }
        
        // 2. Reglas por estilo de producción
        if (quizRespuestas.estilo === 'premiadas') { itemsSet.add('apple'); itemsSet.add('max'); }
        if (quizRespuestas.estilo === 'blockbusters') { itemsSet.add('disney_prem'); itemsSet.add('paramount'); }
        if (quizRespuestas.estilo === 'familia') { itemsSet.add('disney_std'); itemsSet.add('netflix'); }
        if (quizRespuestas.estilo === 'novelas') { itemsSet.add('vix'); itemsSet.add('amazon'); }
        
        // 3. Reglas por género
        if (quizRespuestas.genero === 'accion') { itemsSet.add('amazon'); }
        if (quizRespuestas.genero === 'terror') { itemsSet.add('paramount'); itemsSet.add('max'); }
        
        // 4. Modificador infantil
        if (quizRespuestas.compania === 'ninos') { itemsSet.add('disney_std'); }

        // ⭐ REGLA MAESTRA DE NETFLIX
        if (quizRespuestas.incluyeNetflix === 'si') {
            itemsSet.add('netflix');
        } else {
            itemsSet.delete('netflix');
        }

        // Convertimos el Set a Array para segmentarlo por presupuesto
        let itemsAAgregar = Array.from(itemsSet);

        // 5. Filtro de Presupuesto
        if (quizRespuestas.presupuesto === 'economico') {
            itemsAAgregar = itemsAAgregar.slice(0, 1);
        } else if (quizRespuestas.presupuesto === 'intermedio') {
            itemsAAgregar = itemsAAgregar.slice(0, 2);
        } else if (quizRespuestas.presupuesto === 'premium') {
            itemsAAgregar = itemsAAgregar.slice(0, 4);
        } else {
            itemsAAgregar = itemsAAgregar.slice(0, 3);
        }
        
        // Seguro anticaídas modificado para respetar la decisión de Netflix
        if (itemsAAgregar.length === 0) {
            if (quizRespuestas.incluyeNetflix === 'si') {
                itemsAAgregar.push('netflix');
            } else {
                itemsAAgregar.push('disney_prem');
            }
        }

        // 6. INYECTAR DIRECTAMENTE AL CARRITO DE LA TIENDA
        itemsAAgregar.forEach(id => {
            const data = PLATAFORMAS_INFO[id];
            if (data) {
                carrito.push({
                    id: id,
                    nombre: data.name,
                    type: data.type,
                    price: data.price,
                    pantallas: parseInt(quizRespuestas.pantallas)
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
            triggerToast("✨ ¡Combos añadidos a tu carrito!");
            abrirCarrito();
        }, 400);

    }, 1800);
}
// =========================================================================
// 🎬 MOTOR DE ESTRENOS DINÁMICOS Y ALEATORIOS
// =========================================================================

const CARTELERA_TENDENCIAS = [
    // 🍿 NETFLIX (SERIES Y PELÍCULAS EXCLUSIVAS)
    { id: 'netflix', nombre: 'Netflix', titulo: 'El Juego del Calamar', img: 'https://tse2.mm.bing.net/th?q=Squid+Game+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Stranger Things', img: 'https://tse3.mm.bing.net/th?q=Stranger+Things+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Merlina', img: 'https://tse1.mm.bing.net/th?q=Wednesday+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Bridgerton', img: 'https://tse2.mm.bing.net/th?q=Bridgerton+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Cobra Kai', img: 'https://tse3.mm.bing.net/th?q=Cobra+Kai+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Peaky Blinders', img: 'https://tse1.mm.bing.net/th?q=Peaky+Blinders+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Arcane', img: 'https://tse2.mm.bing.net/th?q=Arcane+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'La Casa de Papel', img: 'https://tse3.mm.bing.net/th?q=Money+Heist+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Dark', img: 'https://tse1.mm.bing.net/th?q=Dark+Netflix+series+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Black Mirror', img: 'https://tse2.mm.bing.net/th?q=Black+Mirror+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Narcos', img: 'https://tse3.mm.bing.net/th?q=Narcos+Netflix+series+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'The Crown', img: 'https://tse1.mm.bing.net/th?q=The+Crown+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Lupin', img: 'https://tse2.mm.bing.net/th?q=Lupin+Netflix+series+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'You', img: 'https://tse3.mm.bing.net/th?q=You+Netflix+series+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Ozark', img: 'https://tse1.mm.bing.net/th?q=Ozark+Netflix+series+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'The Witcher', img: 'https://tse2.mm.bing.net/th?q=The+Witcher+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Mindhunter', img: 'https://tse3.mm.bing.net/th?q=Mindhunter+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Sex Education', img: 'https://tse1.mm.bing.net/th?q=Sex+Education+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    // 🍿 BLOQUE ADICIONAL EXCLUSIVO DE NETFLIX (30 TÍTULOS MÁS)
    { id: 'netflix', nombre: 'Netflix', titulo: 'Emily en París', img: 'https://tse1.mm.bing.net/th?q=Emily+in+Paris+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'El problema de los 3 cuerpos', img: 'https://tse2.mm.bing.net/th?q=3+Body+Problem+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Élite', img: 'https://tse3.mm.bing.net/th?q=Elite+Netflix+series+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Narcos: México', img: 'https://tse1.mm.bing.net/th?q=Narcos+Mexico+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Better Call Saul', img: 'https://tse2.mm.bing.net/th?q=Better+Call+Saul+wallpaper+hd', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Breaking Bad', img: 'https://tse3.mm.bing.net/th?q=Breaking+Bad+wallpaper+hd', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'La Diplomática', img: 'https://tse1.mm.bing.net/th?q=The+Diplomat+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Heartstopper', img: 'https://tse2.mm.bing.net/th?q=Heartstopper+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Sandman', img: 'https://tse3.mm.bing.net/th?q=The+Sandman+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Monstruos: Lyle y Erik Menendez', img: 'https://tse1.mm.bing.net/th?q=Monsters+Menendez+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Dahmer', img: 'https://tse2.mm.bing.net/th?q=Dahmer+Netflix+series+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Outer Banks', img: 'https://tse3.mm.bing.net/th?q=Outer+Banks+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Griselda', img: 'https://tse1.mm.bing.net/th?q=Griselda+Netflix+series+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Vikingos: Valhalla', img: 'https://tse2.mm.bing.net/th?q=Vikings+Valhalla+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Gambito de Dama', img: 'https://tse3.mm.bing.net/th?q=The+Queens+Gambit+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Sweet Home', img: 'https://tse1.mm.bing.net/th?q=Sweet+Home+Netflix+kdrama+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Estamos Muertos', img: 'https://tse2.mm.bing.net/th?q=All+of+Us+Are+Dead+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'BoJack Horseman', img: 'https://tse3.mm.bing.net/th?q=BoJack+Horseman+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'House of Cards', img: 'https://tse1.mm.bing.net/th?q=House+of+Cards+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Orange Is the New Black', img: 'https://tse2.mm.bing.net/th?q=Orange+Is+the+New+Black+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Pálpito', img: 'https://tse3.mm.bing.net/th?q=The+Marked+Heart+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Perfil Falso', img: 'https://tse1.mm.bing.net/th?q=Fake+Profile+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Alice in Borderland', img: 'https://tse2.mm.bing.net/th?q=Alice+in+Borderland+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'El abogado del Lincoln', img: 'https://tse3.mm.bing.net/th?q=The+Lincoln+Lawyer+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Sky Rojo', img: 'https://tse1.mm.bing.net/th?q=Sky+Rojo+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Love, Death & Robots', img: 'https://tse2.mm.bing.net/th?q=Love+Death+and+Robots+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Sense8', img: 'https://tse3.mm.bing.net/th?q=Sense8+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Castlevania', img: 'https://tse1.mm.bing.net/th?q=Castlevania+Netflix+animated+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Oscuro Deseo', img: 'https://tse2.mm.bing.net/th?q=Dark+Desire+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },
    { id: 'netflix', nombre: 'Netflix', titulo: 'Locke & Key', img: 'https://tse3.mm.bing.net/th?q=Locke+and+Key+Netflix+wallpaper', btn: 'btn_netflix', precio: 0, badgeStr: 'class="release-badge" style="background: rgba(229, 9, 20, 0.9);"' },

    // 🔥 HBO MAX (MAX ORIGINALES)
    { id: 'max', nombre: 'HBO Max', titulo: 'La Casa del Dragón', img: 'https://tse1.mm.bing.net/th?q=House+of+the+Dragon+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'The Last of Us', img: 'https://tse2.mm.bing.net/th?q=The+Last of+Us+HBO+show+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Succession', img: 'https://tse1.mm.bing.net/th?q=Succession+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Juego de Tronos', img: 'https://tse1.mm.bing.net/th?q=Game+of+Thrones+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Euphoria', img: 'https://tse2.mm.bing.net/th?q=Euphoria+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'The Penguin', img: 'https://tse3.mm.bing.net/th?q=The+Penguin+DC+series+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Rick and Morty', img: 'https://tse2.mm.bing.net/th?q=Rick+and+Morty+wallpaper+hd', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Chernobyl', img: 'https://tse1.mm.bing.net/th?q=Chernobyl+HBO+series+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'True Detective', img: 'https://tse2.mm.bing.net/th?q=True+Detective+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'The Sopranos', img: 'https://tse3.mm.bing.net/th?q=The+Sopranos+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Friends', img: 'https://tse1.mm.bing.net/th?q=Friends+tv+show+wallpaper+hd', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'The Wire', img: 'https://tse2.mm.bing.net/th?q=The+Wire+HBO+series+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Peacemaker', img: 'https://tse3.mm.bing.net/th?q=Peacemaker+DC+series+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Hacks', img: 'https://tse1.mm.bing.net/th?q=Hacks+HBO+series+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    // 💜 BLOQUE ADICIONAL EXCLUSIVO DE HBO MAX (30 TÍTULOS MÁS)
    { id: 'max', nombre: 'HBO Max', titulo: 'The White Lotus', img: 'https://tse1.mm.bing.net/th?q=The+White+Lotus+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Tokyo Vice', img: 'https://tse2.mm.bing.net/th?q=Tokyo+Vice+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Barry', img: 'https://tse3.mm.bing.net/th?q=Barry+HBO+series+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Mare of Easttown', img: 'https://tse1.mm.bing.net/th?q=Mare+of+Easttown+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Westworld', img: 'https://tse2.mm.bing.net/th?q=Westworld+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Big Little Lies', img: 'https://tse3.mm.bing.net/th?q=Big+Little+Lies+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'True Blood', img: 'https://tse1.mm.bing.net/th?q=True+Blood+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Roma', img: 'https://tse2.mm.bing.net/th?q=Rome+HBO+series+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Hermanos de Sangre', img: 'https://tse3.mm.bing.net/th?q=Band+of+Brothers+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'The Pacific', img: 'https://tse1.mm.bing.net/th?q=The+Pacific+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Silicon Valley', img: 'https://tse2.mm.bing.net/th?q=Silicon+Valley+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Veep', img: 'https://tse3.mm.bing.net/th?q=Veep+HBO+series+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Entourage', img: 'https://tse1.mm.bing.net/th?q=Entourage+HBO+series+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Deadwood', img: 'https://tse2.mm.bing.net/th?q=Deadwood+HBO+series+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Boardwalk Empire', img: 'https://tse3.mm.bing.net/th?q=Boardwalk+Empire+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'The Flight Attendant', img: 'https://tse1.mm.bing.net/th?q=The+Flight+Attendant+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Doom Patrol', img: 'https://tse2.mm.bing.net/th?q=Doom+Patrol+DC+series+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Titans', img: 'https://tse3.mm.bing.net/th?q=Titans+DC+series+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Harley Quinn', img: 'https://tse1.mm.bing.net/th?q=Harley+Quinn+animated+series+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Raised by Wolves', img: 'https://tse2.mm.bing.net/th?q=Raised+by+Wolves+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Estación Once', img: 'https://tse3.mm.bing.net/th?q=Station+Eleven+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Nuestra bandera significa muerte', img: 'https://tse1.mm.bing.net/th?q=Our+Flag+Means+Death+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Gossip Girl', img: 'https://tse2.mm.bing.net/th?q=Gossip+Girl+series+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Pretty Little Liars: Pecado Original', img: 'https://tse3.mm.bing.net/th?q=Pretty+Little+Liars+Original+Sin+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Hora de Aventura: Fionna y Cake', img: 'https://tse1.mm.bing.net/th?q=Fionna+and+Cake+Max+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Sex and the City', img: 'https://tse2.mm.bing.net/th?q=Sex+and+the+City+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'And Just Like That...', img: 'https://tse3.mm.bing.net/th?q=And+Just+Like+That+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'La Edad Dorada', img: 'https://tse1.mm.bing.net/th?q=The+Gilded+Age+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Perry Mason', img: 'https://tse2.mm.bing.net/th?q=Perry+Mason+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },
    { id: 'max', nombre: 'HBO Max', titulo: 'Lakers: Tiempo de ganar', img: 'https://tse3.mm.bing.net/th?q=Winning+Time+HBO+wallpaper', btn: 'btn_max', precio: 8500, badgeStr: 'class="release-badge max-badge"' },

    // 🪄 DISNEY+ (CATÁLOGO STREAMING)
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'The Mandalorian', img: 'https://tse1.mm.bing.net/th?q=The+Mandalorian+Disney+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Loki', img: 'https://tse3.mm.bing.net/th?q=Loki+series+Disney+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Shōgun', img: 'https://tse2.mm.bing.net/th?q=Shogun+fx+series+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'The Bear', img: 'https://tse3.mm.bing.net/th?q=The+Bear+fx+series+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'WandaVision', img: 'https://tse1.mm.bing.net/th?q=Wandavision+marvel+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Ahsoka', img: 'https://tse2.mm.bing.net/th?q=Ahsoka+star+wars+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Andor', img: 'https://tse3.mm.bing.net/th?q=Andor+star+wars+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'X-Men 97', img: 'https://tse3.mm.bing.net/th?q=X-Men+97+Disney+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Moon Knight', img: 'https://tse1.mm.bing.net/th?q=Moon+Knight+marvel+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Hawkeye', img: 'https://tse2.mm.bing.net/th?q=Hawkeye+marvel+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    // 💙 BLOQUE ADICIONAL EXCLUSIVO DE DISNEY+ (30 TÍTULOS MÁS)
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Agatha en todas partes', img: 'https://tse1.mm.bing.net/th?q=Agatha+All+Along+Disney+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Percy Jackson y los dioses del Olimpo', img: 'https://tse2.mm.bing.net/th?q=Percy+Jackson+Disney+series+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Obi-Wan Kenobi', img: 'https://tse3.mm.bing.net/th?q=Obi+Wan+Kenobi+Disney+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Only Murders in the Building', img: 'https://tse1.mm.bing.net/th?q=Only+Murders+in+the+Building+Hulu+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Los Simpson', img: 'https://tse2.mm.bing.net/th?q=The+Simpsons+wallpaper+hd+disney', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Grey\'s Anatomy', img: 'https://tse3.mm.bing.net/th?q=Greys+Anatomy+series+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'The Falcon and the Winter Soldier', img: 'https://tse1.mm.bing.net/th?q=Falcon+and+Winter+Soldier+marvel+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'What If...?', img: 'https://tse2.mm.bing.net/th?q=What+If+marvel+Disney+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Star Wars: The Bad Batch', img: 'https://tse3.mm.bing.net/th?q=The+Bad+Batch+Star+Wars+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Modern Family', img: 'https://tse1.mm.bing.net/th?q=Modern+Family+tv+show+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Futurama', img: 'https://tse2.mm.bing.net/th?q=Futurama+hulu+disney+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Family Guy', img: 'https://tse3.mm.bing.net/th?q=Family+Guy+wallpaper+hd', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Malcolm el de en medio', img: 'https://tse1.mm.bing.net/th?q=Malcolm+in+the+Middle+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'The Walking Dead', img: 'https://tse2.mm.bing.net/th?q=The+Walking+Dead+series+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'American Horror Story', img: 'https://tse3.mm.bing.net/th?q=American+Horror+Story+series+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Invasión Secreta', img: 'https://tse1.mm.bing.net/th?q=Secret+Invasion+marvel+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Ms. Marvel', img: 'https://tse2.mm.bing.net/th?q=Ms+Marvel+disney+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'She-Hulk', img: 'https://tse3.mm.bing.net/th?q=She+Hulk+disney+marvel+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Eco', img: 'https://tse1.mm.bing.net/th?q=Echo+marvel+disney+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Daredevil', img: 'https://tse2.mm.bing.net/th?q=Daredevil+marvel+netflix+disney+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Prison Break', img: 'https://tse3.mm.bing.net/th?q=Prison+Break+series+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Lost', img: 'https://tse1.mm.bing.net/th?q=Lost+series+wallpaper+hd', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Criminal Minds', img: 'https://tse2.mm.bing.net/th?q=Criminal+Minds+series+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'How I Met Your Mother', img: 'https://tse3.mm.bing.net/th?q=How+I+Met+Your+Mother+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Glee', img: 'https://tse1.mm.bing.net/th?q=Glee+tv+show+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Monstruos a la obra', img: 'https://tse2.mm.bing.net/th?q=Monsters+at+Work+disney+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'High School Musical: La Serie', img: 'https://tse3.mm.bing.net/th?q=High+School+Musical+The+Series+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Star Wars: Visions', img: 'https://tse1.mm.bing.net/th?q=Star+Wars+Visions+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'El Rey León', img: 'https://tse2.mm.bing.net/th?q=The+Lion+King+disney+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },
    { id: 'disney_prem', nombre: 'Disney+', titulo: 'Frozen', img: 'https://tse3.mm.bing.net/th?q=Frozen+disney+movie+wallpaper', btn: 'btn_disney_prem', precio: 0, badgeStr: 'class="release-badge disney-badge"' },

    // 📦 AMAZON PRIME
    { id: 'amazon', nombre: 'Amazon', titulo: 'The Boys', img: 'https://tse1.mm.bing.net/th?q=The+Boys+Amazon+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Fallout', img: 'https://tse2.mm.bing.net/th?q=Fallout+series+Amazon+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Invencible', img: 'https://tse3.mm.bing.net/th?q=Invincible+Amazon+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Reacher', img: 'https://tse1.mm.bing.net/th?q=Reacher+Amazon+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Los Anillos de Poder', img: 'https://tse2.mm.bing.net/th?q=Rings+of+Power+Amazon+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Jack Ryan', img: 'https://tse1.mm.bing.net/th?q=Tom+Clancys+Jack+Ryan+Amazon+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Fleabag', img: 'https://tse2.mm.bing.net/th?q=Fleabag+Amazon+series+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Gen V', img: 'https://tse3.mm.bing.net/th?q=Gen+V+Amazon+series+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'La Rueda del Tiempo', img: 'https://tse2.mm.bing.net/th?q=The+Wheel+of+Time+Amazon+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    // 📦 BLOQUE ADICIONAL EXCLUSIVO DE AMAZON PRIME (30 TÍTULOS MÁS)
    { id: 'amazon', nombre: 'Amazon', titulo: 'La maravillosa Sra. Maisel', img: 'https://tse1.mm.bing.net/th?q=The+Marvelous+Mrs+Maisel+Amazon+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Good Omens', img: 'https://tse2.mm.bing.net/th?q=Good+Omens+Amazon+series+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Citadel', img: 'https://tse3.mm.bing.net/th?q=Citadel+Amazon+series+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'El Periférico', img: 'https://tse1.mm.bing.net/th?q=The+Peripheral+Amazon+series+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Upload', img: 'https://tse2.mm.bing.net/th?q=Upload+Amazon+series+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Sr. y Sra. Smith', img: 'https://tse3.mm.bing.net/th?q=Mr+and+Mrs+Smith+Amazon+series+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Hazbin Hotel', img: 'https://tse1.mm.bing.net/th?q=Hazbin+Hotel+Amazon+series+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'La Leyenda de Vox Machina', img: 'https://tse2.mm.bing.net/th?q=The+Legend+of+Vox+Machina+Amazon+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'El Hombre en el Castillo Alta', img: 'https://tse3.mm.bing.net/th?q=The+Man+in+the+High+Castle+Amazon+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'The Expanse', img: 'https://tse1.mm.bing.net/th?q=The+Expanse+Amazon+series+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'El Grand Tour', img: 'https://tse2.mm.bing.net/th?q=The+Grand+Tour+Amazon+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'La Granja de Clarkson', img: 'https://tse3.mm.bing.net/th?q=Clarksons+Farm+Amazon+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Carnival Row', img: 'https://tse1.mm.bing.net/th?q=Carnival+Row+Amazon+series+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Hunters', img: 'https://tse2.mm.bing.net/th?q=Hunters+Amazon+series+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Bosch', img: 'https://tse3.mm.bing.net/th?q=Bosch+Amazon+series+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Hanna', img: 'https://tse1.mm.bing.net/th?q=Hanna+Amazon+series+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Outer Range', img: 'https://tse2.mm.bing.net/th?q=Outer+Range+Amazon+series+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Goliath', img: 'https://tse3.mm.bing.net/th?q=Goliath+Amazon+series+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Homecoming', img: 'https://tse1.mm.bing.net/th?q=Homecoming+Amazon+series+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'El Verano en que me Enamoré', img: 'https://tse2.mm.bing.net/th?q=The+Summer+I+Turned+Pretty+Amazon+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'El Continental', img: 'https://tse3.mm.bing.net/th?q=The+Continental+John+Wick+Amazon+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'El Pacto de Guy Ritchie', img: 'https://tse1.mm.bing.net/th?q=Guy+Ritchies+The+Covenant+movie+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'El duro (Road House)', img: 'https://tse2.mm.bing.net/th?q=Road+House+2024+movie+Amazon+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'La Guerra del Mañana', img: 'https://tse3.mm.bing.net/th?q=The+Tomorrow+War+movie+Amazon+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Air: La historia detrás del logo', img: 'https://tse1.mm.bing.net/th?q=Air+movie+2023+Amazon+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Saltburn', img: 'https://tse2.mm.bing.net/th?q=Saltburn+movie+Amazon+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'La Idea de Ti', img: 'https://tse3.mm.bing.net/th?q=The+Idea+of+You+movie+Amazon+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Samaritano', img: 'https://tse1.mm.bing.net/th?q=Samaritan+movie+Sylvester+Stallone+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Cruel Summer', img: 'https://tse2.mm.bing.net/th?q=Cruel+Summer+series+amazon+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },
    { id: 'amazon', nombre: 'Amazon', titulo: 'Los Billis', img: 'https://tse3.mm.bing.net/th?q=Los+Billis+Amazon+series+wallpaper', btn: 'btn_amazon', precio: 10500, badgeStr: 'class="release-badge" style="background: rgba(0, 168, 225, 0.9);"' },

    // 🍏 APPLE TV+
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Severance', img: 'https://tse1.mm.bing.net/th?q=Severance+Apple+TV+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Ted Lasso', img: 'https://tse2.mm.bing.net/th?q=Ted+Lasso+Apple+TV+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Fundación', img: 'https://tse3.mm.bing.net/th?q=Foundation+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'The Morning Show', img: 'https://tse3.mm.bing.net/th?q=The+Morning+Show+Apple+TV+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Silo', img: 'https://tse1.mm.bing.net/th?q=Silo+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Slow Horses', img: 'https://tse2.mm.bing.net/th?q=Slow+Horses+Apple+TV+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    // 🍏 BLOQUE ADICIONAL EXCLUSIVO DE APPLE TV+ (30 TÍTULOS MÁS)
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Shrinking (Terapia sin filtro)', img: 'https://tse1.mm.bing.net/th?q=Shrinking+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Hijack (Secuestro en el aire)', img: 'https://tse2.mm.bing.net/th?q=Hijack+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Presumed Innocent (Presunto inocente)', img: 'https://tse3.mm.bing.net/th?q=Presumed+Innocent+Apple+TV+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Dark Matter (Materia oscura)', img: 'https://tse1.mm.bing.net/th?q=Dark+Matter+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'For All Mankind (Para toda la humanidad)', img: 'https://tse2.mm.bing.net/th?q=For+All+Mankind+Apple+TV+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Defending Jacob (Defendiendo a Jacob)', img: 'https://tse3.mm.bing.net/th?q=Defending+Jacob+Apple+TV+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Black Bird (Encerrado con el diablo)', img: 'https://tse1.mm.bing.net/th?q=Black+Bird+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Bad Sisters (Hermanas hasta la muerte)', img: 'https://tse2.mm.bing.net/th?q=Bad+Sisters+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Lessons in Chemistry (Lecciones de química)', img: 'https://tse3.mm.bing.net/th?q=Lessons+in+Chemistry+Apple+TV+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'The Crowded Room', img: 'https://tse1.mm.bing.net/th?q=The+Crowded+Room+Apple+TV+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Monarch: Legacy of Monsters', img: 'https://tse2.mm.bing.net/th?q=Monarch+Legacy+of+Monsters+Apple+TV+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Mythic Quest', img: 'https://tse3.mm.bing.net/th?q=Mythic+Quest+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Servant', img: 'https://tse1.mm.bing.net/th?q=Servant+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'See', img: 'https://tse2.mm.bing.net/th?q=See+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Dickinson', img: 'https://tse3.mm.bing.net/th?q=Dickinson+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Sugar', img: 'https://tse1.mm.bing.net/th?q=Sugar+Apple+TV+series+Colin+Farrell+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Loot (Fortuna)', img: 'https://tse2.mm.bing.net/th?q=Loot+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Platonic', img: 'https://tse3.mm.bing.net/th?q=Platonic+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Invasion', img: 'https://tse1.mm.bing.net/th?q=Invasion+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Pachinko', img: 'https://tse2.mm.bing.net/th?q=Pachinko+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Masters of the Air (Los amos del aire)', img: 'https://tse3.mm.bing.net/th?q=Masters+of+the+Air+Apple+TV+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Palm Royale', img: 'https://tse1.mm.bing.net/th?q=Palm+Royale+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Constellation', img: 'https://tse2.mm.bing.net/th?q=Constellation+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Criminal Record (Historial delictivo)', img: 'https://tse3.mm.bing.net/th?q=Criminal+Record+Apple+TV+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Franklin', img: 'https://tse1.mm.bing.net/th?q=Franklin+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Acapulco', img: 'https://tse2.mm.bing.net/th?q=Acapulco+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Trying (Ciclos)', img: 'https://tse3.mm.bing.net/th?q=Trying+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Tehran', img: 'https://tse1.mm.bing.net/th?q=Tehran+Apple+TV+series+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'Truth Be Told', img: 'https://tse2.mm.bing.net/th?q=Truth+Be+Told+Apple+TV+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },
    { id: 'apple', nombre: 'Apple TV+', titulo: 'The Big Door Prize', img: 'https://tse3.mm.bing.net/th?q=The+Big+Door+Prize+Apple+TV+wallpaper', btn: 'apple', precio: 8500, badgeStr: 'class="release-badge" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);"' },

    // ⛰️ PARAMOUNT+
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Halo', img: 'https://tse1.mm.bing.net/th?q=Halo+Paramount+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Yellowstone', img: 'https://tse2.mm.bing.net/th?q=Yellowstone+Paramount+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Mayor of Kingstown', img: 'https://tse1.mm.bing.net/th?q=Mayor+of+Kingstown+Paramount+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Knuckles', img: 'https://tse2.mm.bing.net/th?q=Knuckles+series+Paramount+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Tulsa King', img: 'https://tse3.mm.bing.net/th?q=Tulsa+King+Paramount+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    // ⛰️ BLOQUE ADICIONAL EXCLUSIVO DE PARAMOUNT+ (30 TÍTULOS MÁS)
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Star Trek: Strange New Worlds', img: 'https://tse1.mm.bing.net/th?q=Star+Trek+Strange+New+Worlds+Paramount+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Star Trek: Discovery', img: 'https://tse2.mm.bing.net/th?q=Star+Trek+Discovery+Paramount+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Star Trek: Picard', img: 'https://tse3.mm.bing.net/th?q=Star+Trek+Picard+Paramount+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: '1883', img: 'https://tse1.mm.bing.net/th?q=1883+Paramount+series+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: '1923', img: 'https://tse2.mm.bing.net/th?q=1923+Paramount+series+Harrison+Ford+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Special Ops: Lioness', img: 'https://tse3.mm.bing.net/th?q=Special+Ops+Lioness+Paramount+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Evil', img: 'https://tse1.mm.bing.net/th?q=Evil+series+Paramount+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Your Honor', img: 'https://tse2.mm.bing.net/th?q=Your+Honor+Paramount+show+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Dexter: New Blood', img: 'https://tse3.mm.bing.net/th?q=Dexter+New+Blood+Paramount+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Billions', img: 'https://tse1.mm.bing.net/th?q=Billions+show+Paramount+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Ray Donovan', img: 'https://tse2.mm.bing.net/th?q=Ray+Donovan+Paramount+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Criminal Minds: Evolution', img: 'https://tse3.mm.bing.net/th?q=Criminal+Minds+Evolution+Paramount+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'The Offer (El Ofrecimiento)', img: 'https://tse1.mm.bing.net/th?q=The+Offer+Paramount+series+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Rabbit Hole', img: 'https://tse2.mm.bing.net/th?q=Rabbit+Hole+Kiefer+Sutherland+Paramount+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Lawmen: Bass Reeves', img: 'https://tse3.mm.bing.net/th?q=Lawmen+Bass+Reeves+Paramount+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'South Park', img: 'https://tse1.mm.bing.net/th?q=South+Park+wallpaper+hd', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Bob Esponja', img: 'https://tse2.mm.bing.net/th?q=Spongebob+Squarepants+wallpaper+hd', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Paw Patrol (Patrulla Canina)', img: 'https://tse3.mm.bing.net/th?q=Paw+Patrol+wallpaper+hd', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'iCarly (2021)', img: 'https://tse1.mm.bing.net/th?q=iCarly+revival+Paramount+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'School Spirits', img: 'https://tse2.mm.bing.net/th?q=School+Spirits+Paramount+series+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Wolf Pack', img: 'https://tse3.mm.bing.net/th?q=Wolf+Pack+Paramount+series+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Frasier (2023)', img: 'https://tse1.mm.bing.net/th?q=Frasier+2023+Paramount+series+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Ghosts', img: 'https://tse2.mm.bing.net/th?q=Ghosts+cbs+series+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Twin Peaks', img: 'https://tse3.mm.bing.net/th?q=Twin+Peaks+show+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Californication', img: 'https://tse1.mm.bing.net/th?q=Californication+show+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'The Good Fight', img: 'https://tse2.mm.bing.net/th?q=The+Good+Fight+series+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'RuPaul\'s Drag Race All Stars', img: 'https://tse3.mm.bing.net/th?q=RuPauls+Drag+Race+All+Stars+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Ink Master', img: 'https://tse1.mm.bing.net/th?q=Ink+Master+paramount+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Fatal Attraction', img: 'https://tse2.mm.bing.net/th?q=Fatal+Attraction+paramount+series+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },
    { id: 'paramount', nombre: 'Paramount+', titulo: 'Los Enviados', img: 'https://tse3.mm.bing.net/th?q=Los+Enviados+Paramount+series+wallpaper', btn: 'btn_paramount', precio: 10000, badgeStr: 'class="release-badge" style="background: rgba(10, 132, 255, 0.9);"' },

    // 🎌 CRUNCHYROLL (ANIME)
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Demon Slayer', img: 'https://tse1.mm.bing.net/th?q=Demon+Slayer+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Jujutsu Kaisen', img: 'https://tse2.mm.bing.net/th?q=Jujutsu+Kaisen+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Attack on Titan', img: 'https://tse3.mm.bing.net/th?q=Attack+on+Titan+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'One Piece', img: 'https://tse1.mm.bing.net/th?q=One+Piece+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Solo Leveling', img: 'https://tse2.mm.bing.net/th?q=Solo+Leveling+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Chainsaw Man', img: 'https://tse3.mm.bing.net/th?q=Chainsaw+Man+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Kaiju No. 8', img: 'https://tse1.mm.bing.net/th?q=Kaiju+No+8+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'My Hero Academia', img: 'https://tse3.mm.bing.net/th?q=My+Hero+Academia+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },  
    // 🎌 BLOQUE ADICIONAL EXCLUSIVO DE CRUNCHYROLL (30 TÍTULOS MÁS)
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'One Punch Man', img: 'https://tse1.mm.bing.net/th?q=One+Punch+Man+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Hunter x Hunter', img: 'https://tse2.mm.bing.net/th?q=Hunter+x+Hunter+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Frieren: Más allá del final del viaje', img: 'https://tse3.mm.bing.net/th?q=Frieren+Beyond+Journeys+End+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Spy x Family', img: 'https://tse1.mm.bing.net/th?q=Spy+x+Family+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Tokyo Revengers', img: 'https://tse2.mm.bing.net/th?q=Tokyo+Revengers+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Black Clover', img: 'https://tse3.mm.bing.net/th?q=Black+Clover+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Blue Lock', img: 'https://tse1.mm.bing.net/th?q=Blue+Lock+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Hell\'s Paradise', img: 'https://tse2.mm.bing.net/th?q=Hells+Paradise+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Mashle: Magic and Muscles', img: 'https://tse3.mm.bing.net/th?q=Mashle+Magic+and+Muscles+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Fullmetal Alchemist: Brotherhood', img: 'https://tse1.mm.bing.net/th?q=Fullmetal+Alchemist+Brotherhood+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Naruto Shippuden', img: 'https://tse2.mm.bing.net/th?q=Naruto+Shippuden+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Haikyu!!', img: 'https://tse3.mm.bing.net/th?q=Haikyu+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Mob Psycho 100', img: 'https://tse1.mm.bing.net/th?q=Mob+Psycho+100+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Dr. STONE', img: 'https://tse2.mm.bing.net/th?q=Dr+Stone+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Vinland Saga', img: 'https://tse3.mm.bing.net/th?q=Vinland+Saga+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Sword Art Online', img: 'https://tse1.mm.bing.net/th?q=Sword+Art+Online+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Overlord', img: 'https://tse2.mm.bing.net/th?q=Overlord+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Re:Zero - Starting Life in Another World', img: 'https://tse3.mm.bing.net/th?q=Re+Zero+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'That Time I Got Reincarnated as a Slime', img: 'https://tse1.mm.bing.net/th?q=That+Time+I+Got+Reincarnated+as+a+Slime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'The Rising of the Shield Hero', img: 'https://tse2.mm.bing.net/th?q=The+Rising+of+the+Shield+Hero+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'JoJo\'s Bizarre Adventure', img: 'https://tse3.mm.bing.net/th?q=Jojos+Bizarre+Adventure+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Bungo Stray Dogs', img: 'https://tse1.mm.bing.net/th?q=Bungo+Stray+Dogs+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Kaguya-sama: Love Is War', img: 'https://tse2.mm.bing.net/th?q=Kaguya+sama+Love+Is+War+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Death Note', img: 'https://tse3.mm.bing.net/th?q=Death+Note+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Tokyo Ghoul', img: 'https://tse1.mm.bing.net/th?q=Tokyo+Ghoul+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'My Dress-Up Darling', img: 'https://tse2.mm.bing.net/th?q=My+Dress+Up+Darling+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Fire Force', img: 'https://tse3.mm.bing.net/th?q=Fire+Force+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Zom 100: Bucket List of the Dead', img: 'https://tse1.mm.bing.net/th?q=Zom+100+Bucket+List+of+the+Dead+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Goblin Slayer', img: 'https://tse2.mm.bing.net/th?q=Goblin+Slayer+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
    { id: 'crunchy', nombre: 'Crunchyroll', titulo: 'Rent-a-Girlfriend', img: 'https://tse3.mm.bing.net/th?q=Rent+a+Girlfriend+anime+wallpaper', btn: 'btn_crunchy', precio: 8500, badgeStr: 'class="release-badge" style="background: #F47521;"' },
];

// Variable global para controlar el temporizador del carrusel
let autoScrollEstrenosInterval = null;

function cargarEstrenosAleatorios() {
    const contenedor = document.getElementById('contenedorEstrenos');
    if (!contenedor) return;

    // Barajamos el listado masivo manual
    let carteleraMezclada = [...CARTELERA_TENDENCIAS];
    for (let i = carteleraMezclada.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [carteleraMezclada[i], carteleraMezclada[j]] = [carteleraMezclada[j], carteleraMezclada[i]];
    }

    // 🔥 CAMBIO: Ahora toma 7 películas/series en lugar de 5
    const estrenosDelDia = carteleraMezclada.slice(0, 7);

    let htmlFinal = '';
    estrenosDelDia.forEach(item => {
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
    
    // 🪄 Iniciar el movimiento automático justo después de pintar las tarjetas
    iniciarAutoScrollEstrenos();
}

// =========================================================================
// 🔄 DESPLAZAMIENTO AUTOMÁTICO DEL CARRUSEL (ESTILO APPLE TV)
// =========================================================================
function iniciarAutoScrollEstrenos() {
    const container = document.getElementById('contenedorEstrenos');
    if (!container) return;
    
    // Limpiamos cualquier temporizador previo para evitar que se duplique la velocidad
    clearInterval(autoScrollEstrenosInterval);
    
    autoScrollEstrenosInterval = setInterval(() => {
        // Calculamos el límite máximo de scroll que tiene el contenedor
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        // 274px es la medida perfecta exacta (260px de la tarjeta + 14px de espacio/gap)
        const pasoDesplazamiento = 274; 
        
        // Si ya llegó al final (con una tolerancia de 10px), regresa suavemente al inicio
        if (container.scrollLeft >= maxScroll - 10) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            // Si no, avanza una tarjeta de forma fluida
            container.scrollBy({ left: pasoDesplazamiento, behavior: 'smooth' });
        }
    }, 3000); // 3000ms = Se mueve automáticamente cada 3 segundos
}

// // =========================================================================
// 🎁 SISTEMA DE CAJA MISTERIOSA (CON REGLA DE COMPRA OBLIGATORIA Y MEMORIA)
// =========================================================================
window.regaloMisteriosoAplicado = null;
window.tiempoRestanteRegalo = 900; 
let regaloCountdownInterval = null;

// 🚫 Ruleta de premios autorizados (Vix, Max, Disney Std, Plex y Descuentos)
const LISTA_REGALOS_CYBERNET = [
    { id: "r1", tipo: "descuento", valor: 1000, texto: "🎟️ ¡Genial! Ganaste <strong>$1.000 COP</strong> de rebaja total. _(Requiere llevar al menos 1 plataforma de la tienda)_.", msjWhatsapp: "$1.000 de descuento neto" },
    { id: "r2", tipo: "descuento", valor: 2000, texto: "🎟️ ¡Mega Descuento! Ganaste <strong>$2.000 COP</strong> de rebaja total. _(Requiere llevar al menos 1 plataforma de la tienda)_.", msjWhatsapp: "$2.000 de descuento neto" },
    { id: "r3", tipo: "descuento", valor: 3000, texto: "🎟️ ¡Premio Máximo en Plata! Ganaste <strong>$3.000 COP</strong> de rebaja total. _(Requiere llevar al menos 1 plataforma de la tienda)_.", msjWhatsapp: "$3.000 de descuento neto" },
    { id: "r4", tipo: "gratis", valor: "vix", texto: "⚽ ¡Premio Especial! Ganaste 1 mes de <strong>Vix+ completamente GRATIS</strong>. _(Se activará únicamente al comprar otra plataforma adicional)_.", msjWhatsapp: "¡Vix+ Gratis por 1 Mes!" },
    { id: "r5", tipo: "gratis", valor: "max", texto: "💜 ¡Premio Especial! Ganaste 1 mes de <strong>HBO Max completamente GRATIS</strong>. _(Se activará únicamente al comprar otra plataforma adicional)_.", msjWhatsapp: "¡HBO Max Gratis por 1 Mes!" },
    { id: "r6", tipo: "gratis", valor: "disney_std", texto: "🏰 ¡Premio Especial! Ganaste 1 mes de <strong>Disney Estándar completamente GRATIS</strong>. _(Se activará únicamente al comprar otra plataforma adicional)_.", msjWhatsapp: "¡Disney Estándar Gratis por 1 Mes!" },
    { id: "r7", tipo: "gratis", valor: "plex", texto: "🎬 ¡Premio Especial! Ganaste 1 mes de <strong>Plex TV completamente GRATIS</strong>. _(Se activará únicamente al comprar otra plataforma adicional)_.", msjWhatsapp: "¡Plex TV Gratis por 1 Mes!" }
];

function abrirModalRegalo() {
    haptic();
    
    // 🔒 DOBLE CANDADO: Si ya jugó hoy, frena la ejecución de golpe
    const hoy = new Date().toLocaleDateString('es-CO');
    if (localStorage.getItem("cyber_gift_claimed_date") === hoy) {
        triggerToast("⚠️ Ya reclamaste tu regalo de hoy. ¡Vuelve mañana!");
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
        caja.innerText = "🎉";
        caja.style.transform = "scale(1.2)";
        
        const premioGanado = LISTA_REGALOS_CYBERNET[Math.floor(Math.random() * LISTA_REGALOS_CYBERNET.length)];
        window.regaloMisteriosoAplicado = premioGanado;
        window.tiempoRestanteRegalo = 900; 
        
        // 🔒 Guardar fecha para el bloqueo diario
        const hoy = new Date().toLocaleDateString('es-CO');
        localStorage.setItem("cyber_gift_claimed_date", hoy);
        
        // 💾 Guardar datos del cronómetro activo por si recarga
        localStorage.setItem("cyber_active_gift", JSON.stringify(premioGanado));
        localStorage.setItem("cyber_gift_expires_at", (Date.now() + 900 * 1000).toString());
        
        const bannerTienda = document.getElementById("cyberGiftBanner");
        if(bannerTienda) {
            bannerTienda.style.opacity = "0.5";
            bannerTienda.style.pointerEvents = "none";
            bannerTienda.querySelector("p").innerText = "Ya reclamaste tu recompensa por el día de hoy";
        }

        contenido.innerHTML = `
            <div class="badge-ios badge-success" style="background:rgba(48,209,88,0.15); color:var(--ios-green); margin-bottom:12px;">¡RECOMPENSA DESBLOQUEADA!</div>
            <p style="font-size: 1.05rem; line-height: 1.4; margin-bottom: 15px; padding: 0 10px;">${premioGanado.texto}</p>
            
            <div class="gift-countdown-box">
                ⏱️ El regalo expira en: <span id="giftClock">15:00</span>
            </div>
            
            <button class="btn-ios btn-success w-100" style="margin-top:25px; padding:14px;" onclick="aplicarRegaloYIrAlCarrito()">🔥 Reclamar y activar descuento</button>
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
            window.regaloMisteriosoAplicated = null;
            localStorage.removeItem("cyber_active_gift");
            localStorage.removeItem("cyber_gift_expires_at");
            actualizarCarrito();
            triggerToast("⏰ Tu regalo diario ha expirado.");
        }
    }, 1000);
}

function aplicarRegaloYIrAlCarrito() {
    haptic();
    if (window.regaloMisteriosoAplicado.tipo === "gratis") {
        const idPlat = window.regaloMisteriosoAplicado.valor;
        if (!carrito.find(i => i.id === idPlat)) {
            const infoBase = PLATAFORMAS_INFO[idPlat];
            if (infoBase) {
                carrito.push({
                    id: idPlat,
                    nombre: infoBase.name,
                    type: infoBase.type,
                    price: infoBase.price,
                    pantallas: 1
                });
                let btnUI = document.getElementById("btn_" + idPlat) || document.getElementById(idPlat);
                if (btnUI) { btnUI.classList.add("btn-added"); btnUI.innerText = "Quitar"; }
            }
        }
    }
    actualizarCarrito();
    cerrarModalRegalo();
    abrirCarrito();
}

function cargarMemoriaTienda() {
    // Restaurar Carrito
    const carritoGuardado = localStorage.getItem("cyber_carrito");
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        carrito.forEach(item => {
            let btn = document.getElementById("btn_" + item.id) || document.getElementById(item.id);
            if (btn) { btn.classList.add("btn-added"); btn.innerText = "Quitar"; }
        });
    }

    // Comprobar Bloqueo Diario
    const hoy = new Date().toLocaleDateString('es-CO');
    const fechaRegaloReclamado = localStorage.getItem("cyber_gift_claimed_date");
    if (fechaRegaloReclamado === hoy) {
        const bannerTienda = document.getElementById("cyberGiftBanner");
        if (bannerTienda) {
            bannerTienda.style.opacity = "0.5";
            bannerTienda.style.pointerEvents = "none";
            bannerTienda.querySelector("p").innerText = "Ya reclamaste tu recompensa por el día de hoy";
        }
    }

    // Restaurar Cronómetro del Regalo
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
        }
    }    
    actualizarCarrito();
    cerrarModalRegalo();
    abrirCarrito();
    
    let productosReales = carrito.filter(item => {
        return window.regaloMisteriosoAplicado.tipo === "gratis" ? item.id !== window.regaloMisteriosoAplicado.valor : true;
    }).length;

    if (productosReales > 0) {
        triggerToast("🎁 ¡Regalo activado y aplicado con éxito!");
    } else {
        triggerToast("⚠️ ¡Regalo preparado! Añade otra plataforma para activarlo.");
    }
}

