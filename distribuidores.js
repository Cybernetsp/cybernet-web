// =========================================================================
// 🛒 CYBERNET OS - PORTAL MAYORISTAS / DISTRIBUIDORES (MYSQL BACKEND)
// =========================================================================

const API_MYSQL_URL = "https://api.cybernetsp.com/acciones_distribuidores.php";
const API_CODIGOS_URL = "https://api.cybernetsp.com/obtener_codigos.php";

window.carrito = [];
window.saldoNumericoActual = 0;
window.distriTelefonoCache = "";
window.distriCorreoRegistrado = "";
window.fichasCheckoutPendientes = "";
window.vencimientosDataCache = [];
window.vencimientoFiltroActual = "TODOS";
window.cuentasRenovacionCache = [];

// 💡 Plataformas que requieren activación manual por WhatsApp
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
// 🎨 CATÁLOGO DE PRODUCTOS BASE
// =========================================================================
const catalogoProductos = [
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
// ⚙️ UTILERÍAS Y HELPERS GLOBALES
// =========================================================================
function haptic() {
  if (navigator.vibrate) navigator.vibrate(15);
}

function parseCleanJSON(rawText) {
  if (!rawText) return null;
  try {
    return JSON.parse(rawText);
  } catch (e) {
    const start = rawText.indexOf("{");
    const end = rawText.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(rawText.substring(start, end + 1));
    }
    throw e;
  }
}

function formatMoneda(v) {
  if (!v && v !== 0) return "$0";
  if (typeof v === "string" && v.includes("$")) return v;
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
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function copiarTextoAlToque(elemento, texto) {
  if (!texto) return;
  navigator.clipboard.writeText(texto).then(() => {
    triggerToast(`Copiado al portapapeles`);
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
  if (d < now && now.getMonth() - month > 6) d.setFullYear(year + 1);
  return d;
}

function bloquearScroll() {
  document.body.style.overflow = "hidden";
}

function desbloquearScroll() {
  document.body.style.overflow = "";
}

// =========================================================================
// 🚪 APERTURA Y CIERRE DE MODALES EXCLUSIVO VÍA BOTÓN X
// =========================================================================
window.abrirModalVencimientos = function () {
  haptic();
  bloquearScroll();
  const modal = document.getElementById("modalVencimientos");
  if (modal) {
    modal.style.display = "flex";
    modal.classList.add("open");
  }
  cargarVencimientosB2B();
};

window.cerrarModalVencimientos = function () {
  haptic();
  desbloquearScroll();
  const modal = document.getElementById("modalVencimientos");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("open");
  }
};

window.abrirModalBusquedaCuentas = function () {
  haptic();
  bloquearScroll();
  const inputSearch = document.getElementById("inputCasilleroSearch");
  if (inputSearch) inputSearch.value = "";

  const modal = document.getElementById("modalBusquedaCuentas");
  if (modal) {
    modal.style.display = "flex";
    modal.classList.add("open");
  }
  buscarCasilleroDistri();
};

window.cerrarModalBusquedaCuentas = function () {
  haptic();
  desbloquearScroll();
  const modal = document.getElementById("modalBusquedaCuentas");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("open");
  }
};

window.abrirModalHistorial = function () {
  haptic();
  bloquearScroll();
  const select = document.getElementById("selectMesMovimientos");
  const mesActual = select ? select.value : "todos";
  const tel =
    localStorage.getItem("active_distri_tel") || window.distriTelefonoCache;

  cargarDatosFinancierosYAlertas(tel, mesActual);
  const m = document.getElementById("modalEstadoCuenta");
  if (m) {
    m.style.display = "flex";
    m.classList.add("open");
  }
};

window.cerrarModalHistorial = function () {
  haptic();
  desbloquearScroll();
  const m = document.getElementById("modalEstadoCuenta");
  if (m) {
    m.style.display = "none";
    m.classList.remove("open");
  }
};

window.abrirCarrito = function () {
  haptic();
  bloquearScroll();
  const m = document.getElementById("modalCarritoTienda");
  if (m) {
    m.style.display = "flex";
    m.classList.add("open");
  }
};

window.cerrarCarrito = function () {
  haptic();
  desbloquearScroll();
  const m = document.getElementById("modalCarritoTienda");
  if (m) {
    m.style.display = "none";
    m.classList.remove("open");
  }
};

window.abrirMenuMovil = function () {
  haptic();
  bloquearScroll();
  const m = document.getElementById("modalMenuMovil");
  if (m) {
    m.style.display = "flex";
    m.classList.add("open");
  }
};

window.cerrarMenuMovil = function () {
  haptic();
  desbloquearScroll();
  const m = document.getElementById("modalMenuMovil");
  if (m) {
    m.style.display = "none";
    m.classList.remove("open");
  }
};

window.abrirCentroCodigos = function () {
  haptic();
  bloquearScroll();
  const overlay = document.getElementById("codesCenterOverlay");
  if (overlay) {
    overlay.style.display = "flex";
    overlay.classList.add("open");
  }
  changeCodeStep(1);
};

window.cerrarCentroCodigos = function () {
  haptic();
  desbloquearScroll();
  const overlay = document.getElementById("codesCenterOverlay");
  if (overlay) {
    overlay.style.display = "none";
    overlay.classList.remove("open");
  }
};

window.cerrarModalExitoCheckout = function () {
  haptic();
  desbloquearScroll();
  const modal = document.getElementById("successCheckoutOverlay");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("open");
  }
};

window.abrirModalRenovacionB2B = window.abrirModalRenoB2B = function (idItem) {
  haptic();
  const telDistri =
    localStorage.getItem("active_distri_tel") || window.distriTelefonoCache;
  const modal = document.getElementById("modalRenovacionDistri");
  const container = document.getElementById("listaCuentasModalRenoDistri");

  if (!modal || !container) return;

  container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-secondary);"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:10px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line></svg><br>Buscando tus pantallas en MySQL...</div>`;
  modal.style.display = "flex";
  modal.classList.add("open");

  const formData = new FormData();
  formData.append("accion", "obtener_cuentas_renovacion_distribuidor");
  formData.append("telefono", telDistri);
  formData.append("plataforma", idItem);

  fetch(API_MYSQL_URL, { method: "POST", body: formData })
    .then((res) => res.text())
    .then((text) => {
      const res = parseCleanJSON(text);
      container.innerHTML = "";
      if (res && res.status === "success" && res.data && res.data.length > 0) {
        window.cuentasActivasB2B = res.data;

        window.cuentasActivasB2B.forEach((cuenta) => {
          let correoTexto = String(cuenta.correo || "").trim();
          let perfilTexto = String(cuenta.perfil || "").trim();
          let clienteTexto = String(cuenta.cliente || "").trim();

          let div = document.createElement("div");
          div.className = "card-ios item-reno-b2b";
          div.style =
            "padding: 15px; cursor: pointer; background: var(--input-bg); border: var(--surface-border); border-radius: 14px; margin-bottom: 8px; text-align: left;";
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
              if (cantidadDetectada > 0) itemCarrito.amount = cantidadDetectada;

              actualizarCarritoUI();
            }
            cerrarModalRenovacionB2B();
          };
          container.appendChild(div);
        });
      } else {
        container.innerHTML =
          "<div style='color:var(--text-secondary); text-align:center; padding: 20px;'>No tienes cuentas activas registradas en MySQL para esta plataforma.</div>";
      }
    })
    .catch((err) => {
      console.error(err);
      container.innerHTML =
        "<div style='color:var(--ios-red); text-align:center; padding: 20px;'>Error cargando cuentas para renovación.</div>";
    });
};

window.cerrarModalRenovacionB2B = function () {
  haptic();
  desbloquearScroll();
  const modal = document.getElementById("modalRenovacionDistri");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("open");
  }
};

// =========================================================================
// 👤 CARGA Y SINCRONIZACIÓN DE PERFIL DESDE MYSQL
// =========================================================================
function cargarPerfilDistribuidor() {
  const idDistri = localStorage.getItem("active_distri_id") || 0;
  const telDistri = localStorage.getItem("active_distri_tel") || "";

  if (!idDistri && !telDistri) {
    window.location.href = "login_distris.html";
    return;
  }

  const formData = new FormData();
  formData.append("accion", "obtener_perfil_distribuidor");
  formData.append("id", idDistri);
  formData.append("telefono", telDistri);

  fetch(API_MYSQL_URL, { method: "POST", body: formData })
    .then((res) => res.text())
    .then((text) => {
      const res = parseCleanJSON(text);
      if (res && res.status === "success" && res.data) {
        const d = res.data;

        localStorage.setItem("active_distri_id", d.id);
        localStorage.setItem("active_distri_tel", d.telefono);
        localStorage.setItem("active_distri_name", d.nombre || "Distribuidor");
        localStorage.setItem("active_distri_saldo", d.saldo || 0);

        window.distriTelefonoCache = d.telefono;
        window.saldoNumericoActual = parseFloat(d.saldo || 0);

        const elemNombre = document.getElementById("distriWelcomeName");
        const elemTelefono = document.getElementById("distriWelcomePhone");

        if (elemNombre)
          elemNombre.innerText = `¡Hola, ${(d.nombre || "Distribuidor").toUpperCase()}!`;
        if (elemTelefono)
          elemTelefono.innerText = `Distribuidor • Tel: ${d.telefono}`;

        actualizarSaldoUI();
      }
    })
    .catch((err) => console.error("Error al sincronizar perfil:", err));
}

function entrarAlPortalDistribuidor(nombre, telefono, saldo) {
  const dashSection = document.getElementById("dashboardSection");
  if (dashSection) dashSection.style.display = "flex";

  const btnCarrito = document.getElementById("fabCarrito");
  if (btnCarrito) btnCarrito.style.setProperty("display", "flex", "important");

  const elemNombre = document.getElementById("distriWelcomeName");
  if (elemNombre) {
    elemNombre.innerText = `¡Hola, ${(nombre || "DISTRIBUIDOR").toUpperCase()}!`;
  }

  const elemTelefono = document.getElementById("distriWelcomePhone");
  if (elemTelefono) {
    elemTelefono.innerText = `Distribuidor • Tel: ${telefono || "--"}`;
  }

  window.saldoNumericoActual =
    parseFloat(String(saldo || 0).replace(/[^\d.-]/g, "")) || 0;
  actualizarSaldoUI();

  const shopContainer = document.getElementById("shopCatalogContainer");
  if (shopContainer) {
    shopContainer.innerHTML = `
      <div style="text-align:center; padding:40px; width:100%; color:var(--text-secondary); grid-column: 1 / -1;">
        <svg class="spin-anim" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--ios-blue)" stroke-width="2.5" style="margin-bottom:12px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v4"></path></svg>
        <br>Cargando catálogo de MySQL...
      </div>`;
  }

  inicializarOpcionesDeMes();
  cargarPerfilDistribuidor();
  cargarPreciosEnTienda();
  cargarDatosFinancierosYAlertas(
    telefono || window.distriTelefonoCache,
    "todos",
  );

  if (window.cyberIntervaloSaldoFondo)
    clearInterval(window.cyberIntervaloSaldoFondo);
  window.cyberIntervaloSaldoFondo = setInterval(
    refrescarSaldoDistribuidorFondo,
    5 * 60 * 1000,
  );
}

// =========================================================================
// 📅 SELECTOR DE MESES
// =========================================================================
function inicializarOpcionesDeMes() {
  const select = document.getElementById("selectMesMovimientos");
  if (!select) return;

  const nombresMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  let htmlOptions = `<option value="todos">Todos los Meses</option>`;
  const fechaActual = new Date();

  for (let i = 0; i < 6; i++) {
    let d = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - i, 1);
    let yyyy = d.getFullYear();
    let mm = String(d.getMonth() + 1).padStart(2, "0");
    let valMes = `${yyyy}-${mm}`;
    let labelMes = `${nombresMeses[d.getMonth()]} ${yyyy}`;

    htmlOptions += `<option value="${valMes}">${labelMes}</option>`;
  }

  select.innerHTML = htmlOptions;
}

function filtrarMovimientosPorMes() {
  haptic();
  const select = document.getElementById("selectMesMovimientos");
  const mesSeleccionado = select ? select.value : "todos";
  const tel =
    localStorage.getItem("active_distri_tel") || window.distriTelefonoCache;

  cargarDatosFinancierosYAlertas(tel, mesSeleccionado);
}

// =========================================================================
// 🏷️ PRECIOS Y STOCK DE TIENDA
// =========================================================================
function cargarPreciosEnTienda() {
  const formData = new FormData();
  formData.append("accion", "obtener_precios_distribuidor");

  fetch(API_MYSQL_URL, { method: "POST", body: formData })
    .then((res) => res.text())
    .then((text) => {
      const res = parseCleanJSON(text);
      if (res && res.status === "success" && res.data) {
        res.data.forEach((itemDb) => {
          let producto = catalogoProductos.find(
            (p) =>
              p.id === itemDb.codigo ||
              (p.id === "AMAZON" && itemDb.codigo === "AMAZON-PRIME-VIDEO") ||
              (p.id === "AMAZON-PRIME-VIDEO" && itemDb.codigo === "AMAZON"),
          );

          if (producto) {
            producto.precio = parseFloat(itemDb.precio);
          }
        });
      }
      renderTienda();
      cargarStockEnTienda();
    })
    .catch((err) => {
      console.error("Error al cargar precios desde MySQL:", err);
      renderTienda();
      cargarStockEnTienda();
    });
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

// =========================================================================
// 📊 HISTORIAL DE MOVIMIENTOS Y ALERTAS
// =========================================================================
function cargarDatosFinancierosYAlertas(tel, mesFiltro = "todos") {
  const telFinal =
    tel ||
    localStorage.getItem("active_distri_tel") ||
    window.distriTelefonoCache ||
    "";

  const formData = new FormData();
  formData.append("accion", "obtener_dashboard_distribuidor");
  formData.append("telefono", telFinal);
  formData.append("mes", mesFiltro);

  const tbody = document.getElementById("tablaHistorialBody");
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 30px; color:var(--text-secondary);"><svg class="spin-anim" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v4"></path></svg><br>Cargando movimientos...</td></tr>`;
  }

  fetch(API_MYSQL_URL, { method: "POST", body: formData })
    .then((res) => res.text())
    .then((text) => {
      const res = parseCleanJSON(text);
      if (res && res.status === "success") {
        let trs = "";

        if (res.historial && res.historial.length > 0) {
          res.historial.forEach((mov) => {
            let isPositivo = mov.monto > 0;
            let color = isPositivo ? "var(--ios-green)" : "var(--ios-red)";
            let signo = isPositivo ? "+" : "";

            trs += `<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <td style="padding: 12px 8px; font-size:0.75rem; color:var(--text-secondary); white-space:nowrap;">${mov.fecha}</td>
                      <td style="padding: 12px 8px; line-height:1.3;">
                        <strong style="color:var(--text-primary); font-size:0.85rem;">${mov.concepto}</strong><br>
                        <span style="color:var(--ios-blue); font-size:0.75rem;">Cliente: ${mov.cliente || "Sin Nombre"}</span>
                      </td>
                      <td style="padding: 12px 8px; text-align:right; color:${color}; font-weight:bold; font-family:monospace; white-space:nowrap;">${signo}${formatMoneda(mov.monto)}</td>
                    </tr>`;
          });
        } else {
          trs = `<tr><td colspan="3" style="text-align:center; padding: 35px; color:var(--text-secondary);">No se encontraron movimientos registrados para este periodo.</td></tr>`;
        }
        if (tbody) tbody.innerHTML = trs;

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
                      <div style="font-weight:800; color:var(--text-primary); font-size:0.9rem;">${c.plataforma.replace(/-/g, " ")}</div>
                      <div style="font-size:0.8rem; color:var(--text-secondary);">Cliente: ${c.cliente || "Sin Nombre"}</div>
                      <div style="font-size:0.8rem; color:${colorDias}; font-weight:700;">${txtDias}</div>
                      <button class="btn-ios" onclick="copiarMensajeRenovacion('${msgCobro}')" style="background:rgba(255,149,0,0.15); color:var(--ios-orange); border:none; padding:8px; border-radius:30px; font-size:0.75rem; font-weight:700; margin-top:4px;">
                        Copiar Mensaje
                      </button>
                   </div>`;
              }
            }
          });
        }

        if (countExpiran > 0 && widgetCont && divRenov) {
          divRenov.innerHTML = htmlRenov;
          widgetCont.style.display = "block";
        } else if (widgetCont) {
          widgetCont.style.display = "none";
        }
      } else {
        if (tbody) {
          tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 30px; color:var(--text-secondary);">No hay movimientos registrados para esta cuenta.</td></tr>`;
        }
      }
    })
    .catch((err) => {
      console.error("Error al cargar historial:", err);
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 30px; color:var(--ios-red);">Error al conectar con la base de datos.</td></tr>`;
      }
    });
}

function copiarMensajeRenovacion(msgEnc) {
  haptic();
  navigator.clipboard.writeText(decodeURIComponent(msgEnc)).then(() => {
    triggerToast("Mensaje de cobro copiado.");
  });
}

// =========================================================================
// 🛒 E-COMMERCE MAYORISTA & CARRITO
// =========================================================================
function renderTienda() {
  const container = document.getElementById("shopCatalogContainer");
  if (!container) return;
  let html = "";
  catalogoProductos.forEach((p) => {
    html += `
      <div class="card-ios platform-card-shop" data-name="${p.nombre.toLowerCase()}" style="position:relative; padding:18px 14px 14px 14px; margin:0; display:flex; flex-direction:column; align-items:center; gap:8px; background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.05); text-align:center;">
        <div id="stock-badge-${p.id}" data-stock-plat="${p.id}" style="position:absolute; top:8px; right:8px; background:rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); font-size:0.65rem; padding:4px 8px; border-radius:10px; font-weight:700; color:var(--text-secondary);">
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
  const formData = new FormData();
  formData.append("accion", "obtener_stock_plataformas");

  fetch(API_MYSQL_URL, { method: "POST", body: formData })
    .then((res) => res.text())
    .then((text) => {
      const res = parseCleanJSON(text);
      if (res && res.status === "success" && res.stock) {
        catalogoProductos.forEach((p) => {
          const badge = document.getElementById(`stock-badge-${p.id}`);
          const btnAdd = document.getElementById(`btn-add-${p.id}`);

          if (!badge) return;

          const disponibles =
            res.stock[p.id] !== undefined ? parseInt(res.stock[p.id]) : 0;

          if (disponibles > 0) {
            badge.innerHTML = `${disponibles} Libres`;
            badge.style.background = "rgba(48, 209, 88, 0.12)";
            badge.style.color = "var(--ios-green)";
            badge.style.borderColor = "rgba(48, 209, 88, 0.25)";

            if (btnAdd) {
              btnAdd.disabled = false;
              btnAdd.innerHTML = "+ Añadir";
              btnAdd.style.background = "var(--ios-blue)";
              btnAdd.style.color = "white";
              btnAdd.style.opacity = "1";
              btnAdd.style.cursor = "pointer";
            }
          } else {
            badge.innerHTML = `Agotado`;
            badge.style.background = "rgba(255, 69, 58, 0.12)";
            badge.style.color = "var(--ios-red)";
            badge.style.borderColor = "rgba(255, 69, 58, 0.25)";

            if (btnAdd) {
              btnAdd.disabled = true;
              btnAdd.innerHTML = "Sin Stock";
              btnAdd.style.background = "rgba(255, 255, 255, 0.05)";
              btnAdd.style.color = "var(--text-secondary)";
              btnAdd.style.opacity = "0.5";
              btnAdd.style.cursor = "not-allowed";
            }
          }
        });
      }
    })
    .catch((err) => {
      console.error("Error al cargar stock de productos desde MySQL:", err);
    });
}

function filtrarTiendaLocal() {
  const query = (document.getElementById("searchShopInput")?.value || "")
    .toLowerCase()
    .trim();
  document.querySelectorAll(".platform-card-shop").forEach((c) => {
    c.style.display = c.getAttribute("data-name").includes(query)
      ? "flex"
      : "none";
  });
}

function agregarAlCarrito(id) {
  haptic();
  const prod = catalogoProductos.find((p) => p.id === id);
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
  triggerToast(`${prod.nombre} añadido.`);
  actualizarCarritoUI();

  const btn = document.getElementById(`btn-add-${id}`);
  if (btn) {
    const textoOriginal = btn.innerHTML;
    btn.classList.add("btn-pop-anim");
    btn.innerHTML = "✓ Añadido";
    btn.style.setProperty("background", "var(--ios-green)", "important");
    btn.style.setProperty("color", "#ffffff", "important");

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
      const inputClient = document.getElementById("cartClientName");
      if (inputClient) inputClient.value = "";
    }
    actualizarCarritoUI();
  }
};

window.filtrarModalRenovacionB2B = function () {
  const q = (document.getElementById("buscadorModalRenoDistri")?.value || "")
    .toLowerCase()
    .trim();
  document.querySelectorAll(".item-reno-b2b").forEach((item) => {
    const indiceBusqueda = item.getAttribute("data-search") || "";
    if (indiceBusqueda.includes(q))
      item.style.setProperty("display", "block", "important");
    else item.style.setProperty("display", "none", "important");
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

    let isReno = item.tipo === "Reno";
    let displayBtn = isReno ? "block" : "none";
    let btnText = item.correoReno ? item.correoReno : "Seleccionar Cuenta";
    let btnColor = item.correoReno ? "var(--ios-green)" : "var(--ios-orange)";

    let opcionesReno = `
        <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px; width: 100%; border-top: 1px dashed var(--surface-border); padding-top: 10px;">
            <select class="input-ios" style="margin: 0; padding: 8px; font-size: 0.8rem; border-radius: 10px; font-weight: 600;" onchange="window.cambiarTipoVentaCarrito('${item.id}', this.value)">
                <option value="Nueva" ${!isReno ? "selected" : ""}>Crear Pantalla Nueva</option>
                <option value="Reno" ${isReno ? "selected" : ""}>Renovar Pantalla Existente</option>
            </select>
            <button class="btn-ios" style="display: ${displayBtn}; background: transparent; color: ${btnColor}; border: 1px solid ${btnColor}; padding: 10px; border-radius: 10px; font-size: 0.75rem; font-weight: 700; width: 100%; text-align: center; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;" onclick="window.abrirModalRenoB2B('${item.id}')">
                ${btnText}
            </button>
        </div>`;

    html += `
      <div class="cart-item-row" style="display:flex; flex-direction:column; gap:12px; background: var(--input-bg); padding:14px; border-radius:16px; border: 1px solid var(--surface-border);">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <div style="display:flex; flex-direction:column; text-align:left; overflow:hidden; flex-grow:1;">
              <strong style="font-size:0.95rem; color:var(--text-primary); text-overflow:ellipsis; white-space:nowrap; overflow:hidden;">${item.nombre}</strong>
              <span style="font-size:0.85rem; color:var(--ios-green); font-family:monospace; font-weight:700;">${formatMoneda(subtotal)} <span style="font-size:0.7rem; color:var(--text-secondary); font-weight:normal;">(${formatMoneda(item.precio)} c/u)</span></span>
            </div>
            <div style="display:flex; align-items:center; background: rgba(0,0,0,0.15); border-radius:30px; padding:2px; border:1px solid rgba(255,255,255,0.05);">
              <button onclick="cambiarCantidad('${item.id}', -1)" style="background:transparent; border:none; color:var(--text-primary); width:26px; height:26px; font-weight:bold; cursor:pointer;">-</button>
              <span style="font-family:monospace; font-size:0.9rem; font-weight:bold; min-width:20px; text-align:center;">${item.amount}</span>
              <button onclick="cambiarCantidad('${item.id}', 1)" style="background:transparent; border:none; color:var(--text-primary); width:26px; height:26px; font-weight:bold; cursor:pointer;">+</button>
            </div>
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
// 🛒 PROCESAR COMPRA MAYORISTA
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
  if (!btn || btn.disabled) return;

  const inputNombreCliente = (
    document.getElementById("cartClientName")?.value || ""
  ).trim();
  const nombreParaDb =
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
        `🛒 ¿Confirmar despacho mayorista?\n\n📦 Pedido: ${descripcionLote}\n👤 Cliente: ${nombreParaDb}\n💵 Costo: ${formatMoneda(totalCost)}`,
      )
    ) {
      bloquearScroll();
      return;
    }

    bloquearScroll();
    btn.disabled = true;
    btn.innerHTML = `<span class="spin-anim" style="display:inline-block; margin-right:8px;">⏳</span>Procesando venta...`;

    const formData = new FormData();
    formData.append("accion", "procesar_compra_distribuidor");
    formData.append("nombre_cliente", nombreParaDb);
    formData.append("telefono_distribuidor", telefonoDistribuidor);
    formData.append("descripcion", descripcionLote);
    formData.append("correo_renovacion", correoRenoGlobal);
    formData.append("monto_total", totalCost);
    formData.append("carrito_json", JSON.stringify(window.carrito));

    fetch(API_MYSQL_URL, { method: "POST", body: formData })
      .then((res) => res.text())
      .then((text) => {
        const res = parseCleanJSON(text);
        btn.disabled = false;
        btn.innerHTML = "CONFIRMAR COMPRA";
        actualizarCarritoUI();

        if (res && res.status === "success") {
          let tieneNombreReal =
            inputNombreCliente !== "" &&
            inputNombreCliente.toLowerCase() !== "cliente" &&
            inputNombreCliente.toLowerCase() !== "sin nombre";

          let saludo = tieneNombreReal
            ? `🌟 *¡Hola ${inputNombreCliente}!*`
            : `🌟 *¡Hola!*`;

          let textoFicha = `${saludo}\n\nTu pedido ha sido procesado con éxito. Aquí tienes tus accesos:\n\n`;

          if (res.bloques && res.bloques.length > 0) {
            res.bloques.forEach((bloque) => {
              let platClean = bloque.id.replace(/-/g, " ").toUpperCase();
              let isNetflix = platClean.includes("NETFLIX");
              let isIptvOrEmby =
                platClean.includes("IPTV") || platClean.includes("EMBY");

              let etiquetaUser = isIptvOrEmby ? "Usuario" : "Correo";
              let etiquetaPerfil = platClean.includes("IPTV")
                ? "URL"
                : platClean.includes("EMBY")
                  ? "Servidor"
                  : "Perfil";

              let esRenoBlock = bloque.tipo === "Reno";

              if (esRenoBlock) {
                textoFicha += `🔄 *PERFIL RENOVADO CON ÉXITO* ✅\n🎬 *DETALLES DE ${platClean}*\n────────────────────\n👤 *${etiquetaUser}:* ${bloque.correo}\n🔐 *Contraseña:* ${bloque.clave}\n`;
                if (
                  bloque.perfil &&
                  bloque.perfil !== "N/A" &&
                  bloque.perfil !== ""
                ) {
                  textoFicha += `🌐 *${etiquetaPerfil}:* ${bloque.perfil}\n`;
                }
                textoFicha += `📅 *Nueva Fecha de Vencimiento:* ${bloque.venc.toUpperCase()}\n\n`;
              } else {
                textoFicha += `🎬 *DETALLES DE ${platClean}* ✅\n────────────────────\n`;
                if (isNetflix) {
                  textoFicha += `⚠️ *Para iniciar sesión:* Cuando te pida un código, selecciona *Obtener ayuda* y después *Usar contraseña*.\n\n`;
                }
                textoFicha += `👤 *${etiquetaUser}:* ${bloque.correo}\n🔐 *Contraseña:* ${bloque.clave}\n`;
                if (
                  bloque.perfil &&
                  bloque.perfil !== "N/A" &&
                  bloque.perfil !== ""
                ) {
                  textoFicha += `🌐 *${etiquetaPerfil}:* ${bloque.perfil}\n`;
                }
                if (bloque.pin && bloque.pin !== "N/A" && bloque.pin !== "-") {
                  textoFicha += `📍 *PIN:* ${bloque.pin}\n`;
                }
                textoFicha += `📅 *Vence:* ${bloque.venc.toUpperCase()}\n\n`;
              }
            });
          } else {
            textoFicha += `Tus cuentas han sido procesadas correctamente. Míralas en tu casillero.\n\n`;
          }

          textoFicha += `📢 *INFORMACIÓN IMPORTANTE:* \n────────────────────\n⚠️ *Garantía activa:* Tu servicio cuenta con respaldo total durante su vigencia. \n🆘 *Soporte:* Si presentas algún inconveniente, *infórmanos de inmediato* para brindarte una solución rápida.\n\n💎 *Disfruta tu servicio.*\n✨ *¡Gracias por elegirnos!* ✨`;

          const cajaFichas = document.getElementById("cajaTextoFichas");
          if (cajaFichas) cajaFichas.innerText = textoFicha;
          window.fichasCheckoutPendientes = textoFicha;

          const btnWhatsapp = document.getElementById("btnWhatsAppActivacion");
          const requiresManual = window.carrito.some((item) =>
            PLATAFORMAS_MANUALES.includes(item.id),
          );

          if (requiresManual && btnWhatsapp) {
            const platList = window.carrito
              .filter((i) => PLATAFORMAS_MANUALES.includes(i.id))
              .map((i) => i.nombre)
              .join(", ");
            const waMsg = encodeURIComponent(
              `Hola, acabo de adquirir 1 mes de ${platList} para mi cliente, solicito activación. Cliente: ${inputNombreCliente || "Cliente"}`,
            );
            btnWhatsapp.href = `https://wa.me/573127706726?text=${waMsg}`;
            btnWhatsapp.style.display = "block";
          } else if (btnWhatsapp) {
            btnWhatsapp.style.display = "none";
          }

          cerrarCarrito();
          const overlayExito = document.getElementById(
            "successCheckoutOverlay",
          );
          if (overlayExito) {
            overlayExito.style.display = "flex";
            overlayExito.classList.add("open");
          }
          bloquearScroll();

          window.carrito = [];
          const inputClient = document.getElementById("cartClientName");
          if (inputClient) inputClient.value = "";
          actualizarCarritoUI();

          if (res.saldoQuedante !== undefined) {
            window.saldoNumericoActual = parseFloat(res.saldoQuedante);
          } else {
            window.saldoNumericoActual -= totalCost;
          }
          localStorage.setItem(
            "active_distri_saldo",
            window.saldoNumericoActual,
          );

          actualizarSaldoUI();
          cargarStockEnTienda();
          cargarDatosFinancierosYAlertas(telefonoDistribuidor);
        } else {
          desbloquearScroll();
          alert("❌ " + (res ? res.message : "Fallo al procesar la venta."));
        }
      })
      .catch((err) => {
        console.error(err);
        btn.disabled = false;
        btn.innerHTML = "CONFIRMAR COMPRA";
        desbloquearScroll();
        alert("❌ Error de comunicación con MySQL.");
      });
  }, 50);
}

function copiarCuentasCheckout() {
  haptic();
  const btn = document.getElementById("btnCopiarFichasCheckout");
  navigator.clipboard.writeText(window.fichasCheckoutPendientes).then(() => {
    let originalText = btn ? btn.innerHTML : "";
    if (btn) btn.innerHTML = `✅ ¡Copiado con éxito!`;
    triggerToast(`Cuentas copiadas.`);
    setTimeout(() => {
      if (btn) btn.innerHTML = originalText;
    }, 2000);
  });
}

// =========================================================================
// 📡 BÓVEDA Y CASILLERO DE CUENTAS
// =========================================================================
let timeoutCasilleroLive = null;
function buscarCasilleroDistri() {
  clearTimeout(timeoutCasilleroLive);

  timeoutCasilleroLive = setTimeout(() => {
    const inputSearch = document.getElementById("inputCasilleroSearch");
    const valQuery = inputSearch ? inputSearch.value.trim().toLowerCase() : "";
    const contenedor = document.getElementById("contenedorResultadosCasillero");
    const telefonoDistribuidor =
      localStorage.getItem("active_distri_tel") ||
      window.distriTelefonoCache ||
      "";

    if (!contenedor) return;

    if (
      valQuery === "" &&
      !contenedor.innerHTML.includes("cuenta-resultado-card")
    ) {
      contenedor.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-secondary);"><svg class="spin-anim" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ios-blue)" stroke-width="2.5" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v4"></path></svg><br>Cargando tus cuentas...</div>`;
    }

    const formData = new FormData();
    formData.append("accion", "buscar_casillero_distribuidor");
    formData.append("telefono_distribuidor", telefonoDistribuidor);
    formData.append("busqueda", valQuery);

    fetch(API_MYSQL_URL, { method: "POST", body: formData })
      .then((res) => res.text())
      .then((text) => {
        const res = parseCleanJSON(text);
        if (res && res.status === "success") {
          let htmlCards = "";

          if (res.data && res.data.length > 0) {
            res.data.forEach((item) => {
              let pinText =
                item.pin &&
                item.pin !== "" &&
                item.pin !== "N/A" &&
                item.pin !== "-"
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
                <div class="cuenta-resultado-card" style="background:var(--input-bg); border:var(--surface-border); padding:14px; border-radius:16px; margin-bottom:10px; display:flex; flex-direction:column; gap:8px;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="color:var(--ios-blue); font-weight:800; text-transform: uppercase;">${item.plataforma.replace(/-/g, " ")}</div>
                    <div style="color:var(--ios-green); font-family:monospace; font-weight:800; font-size:0.85rem;">${item.vencimiento}</div>
                  </div>
                  <div style="font-size:0.8rem; color:var(--text-secondary); line-height:1.4;">
                       ${perfilText}<br>${subCliente}
                  </div>
                  <div style="display:flex; flex-direction:column; gap:6px; margin-top:4px;">
                    <div class="credential-pill" onclick="copiarTextoAlToque(this, '${item.correo}')" style="background:rgba(0,0,0,0.2); padding:8px 12px; border-radius:10px; font-family:monospace; font-size:0.8rem; cursor:pointer; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">E: <span style="color:white; font-weight:bold;">${item.correo}</span></div>
                    <div class="credential-pill" onclick="copiarTextoAlToque(this, '${item.clave}')" style="background:rgba(0,0,0,0.2); padding:8px 12px; border-radius:10px; font-family:monospace; font-size:0.8rem; cursor:pointer; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">P: <span style="color:white; font-weight:bold;">${item.clave}</span></div>
                    <button class="btn-ios btn-secondary w-100" style="padding:8px; font-size:0.75rem; margin-top:4px; border-radius:10px;" onclick="copiarFichaCasillero(this, '${dataFicha}')">Copiar Ficha Completa</button>
                  </div>
                </div>`;
            });
            contenedor.innerHTML = htmlCards;
          } else {
            contenedor.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-secondary);">No tienes cuentas registradas que coincidan.</div>`;
          }
        } else {
          contenedor.innerHTML = `<div style="text-align:center; padding:30px; color:var(--ios-red);">Error buscando en MySQL.</div>`;
        }
      })
      .catch((err) => {
        console.error(err);
        contenedor.innerHTML = `<div style="text-align:center; padding:30px; color:var(--ios-red);">Error de conexión al servidor.</div>`;
      });
  }, 200);
}

function copiarFichaCasillero(btn, dataEncoded) {
  haptic();
  const obj = JSON.parse(decodeURIComponent(dataEncoded));

  let clienteVal = (obj.cliente || "").trim();
  let tieneNombreReal =
    clienteVal !== "" &&
    clienteVal.toUpperCase() !== "N/A" &&
    clienteVal.toLowerCase() !== "cliente" &&
    clienteVal.toLowerCase() !== "sin nombre";

  let saludo = tieneNombreReal ? `🌟 *¡Hola ${clienteVal}!*` : `🌟 *¡Hola!*`;

  let platClean = (obj.plataforma || "").toUpperCase().replace(/_/g, "-");

  let isNetflix = platClean.includes("NETFLIX");
  let isIptvOrEmby = platClean.includes("IPTV") || platClean.includes("EMBY");

  let etiquetaUser = isIptvOrEmby ? "Usuario" : "Correo";
  let etiquetaPerfil = platClean.includes("IPTV")
    ? "URL"
    : platClean.includes("EMBY")
      ? "Servidor"
      : "Perfil";

  let txt = `${saludo}\n\nTu pedido ha sido procesado con éxito. Aquí tienes tus accesos:\n\n🎬 *DETALLES DE ${platClean}* ✅\n────────────────────\n`;

  if (isNetflix) {
    txt += `⚠️ *Para iniciar sesión:* Cuando te pida un código, selecciona *Obtener ayuda* y después *Usar contraseña*.\n\n`;
  }

  txt += `👤 *${etiquetaUser}:* ${obj.correo || "-"}\n🔐 *Contraseña:* ${obj.clave || "-"}\n`;

  if (
    obj.perfil &&
    obj.perfil !== "N/A" &&
    obj.perfil !== "-" &&
    obj.perfil !== ""
  ) {
    txt += `🌐 *${etiquetaPerfil}:* ${obj.perfil}\n`;
  }

  if (obj.pin && obj.pin !== "N/A" && obj.pin !== "-" && obj.pin !== "") {
    txt += `📍 *PIN:* ${obj.pin}\n`;
  }

  let venc = (obj.vencimiento || "-").toUpperCase();
  txt += `📅 *Vence:* ${venc}\n\n`;

  txt += `📢 *INFORMACIÓN IMPORTANTE:* \n────────────────────\n⚠️ *Garantía activa:* Tu servicio cuenta con respaldo total durante su vigencia. \n🆘 *Soporte:* Si presentas algún inconveniente, *infórmanos de inmediato* para brindarte una solución rápida.\n\n💎 *Disfruta tu servicio.*\n✨ *¡Gracias por elegirnos!* ✨`;

  navigator.clipboard.writeText(txt).then(() => {
    let old = btn.innerHTML;
    btn.innerHTML = `✅ ¡Copiada!`;
    btn.style.background = "var(--ios-green)";
    btn.style.color = "white";
    triggerToast(`Ficha copiada.`);
    setTimeout(() => {
      btn.innerHTML = old;
      btn.style.background = "";
      btn.style.color = "";
    }, 1500);
  });
}

// =========================================================================
// 🤖 CENTRO DE CÓDIGOS B2B
// =========================================================================
function changeCodeStep(n) {
  document
    .querySelectorAll(".code-step")
    .forEach((s) => (s.style.display = "none"));
  const currentStep = document.getElementById("codeStep" + n);
  if (currentStep) currentStep.style.display = "flex";
}

function setCodigoPlat(p) {
  haptic();
  changeCodeStep(2);
}

function setCodigoOp(o) {
  haptic();
  changeCodeStep(3);
}

async function rastrearCodigo() {
  haptic();
  const input = document.getElementById("inputCorreoCodigo");
  if (!input) return;

  let correo = input.value.trim().toLowerCase();
  if (!correo || !correo.includes("@")) {
    alert("⚠️ Escribe un correo electrónico válido.");
    return;
  }

  changeCodeStep(4);

  try {
    const formData = new FormData();
    formData.append("correo", correo);

    const resp = await fetch(API_CODIGOS_URL, {
      method: "POST",
      body: formData,
      mode: "cors",
    });

    const text = await resp.text();
    const res = parseCleanJSON(text);

    changeCodeStep(5);
    const boxCode = document.getElementById("codeResultBox");
    const boxLink = document.getElementById("linkResultBox");
    if (boxCode) boxCode.style.display = "none";
    if (boxLink) boxLink.style.display = "none";

    if (
      res &&
      res.status === "success" &&
      Array.isArray(res.data) &&
      res.data.length > 0
    ) {
      let match = res.data.find(
        (item) =>
          (item.correo || "").toLowerCase().trim().includes(correo) ||
          correo.includes((item.correo || "").toLowerCase().trim()),
      );

      if (!match) {
        match = res.data[0];
      }

      const titleEl = document.getElementById("codeResultTitle");
      const descEl = document.getElementById("codeResultDesc");

      if (titleEl) {
        titleEl.innerHTML = `<span style="color:var(--ios-green); font-weight:800;">${match.plataforma || "SERVICIO"} - ${match.accion || "CÓDIGO"}</span>`;
      }
      if (descEl) {
        descEl.innerText = `Correo: ${match.correo} (${match.hora || "Reciente"})`;
      }

      const val = match.codigoLink || match.copiadoRapido || "";
      window.codigoB2BCapturado = val;

      if (val.startsWith("http://") || val.startsWith("https://")) {
        if (boxLink) boxLink.style.display = "block";
        const linkVal = document.getElementById("linkVal");
        if (linkVal) linkVal.href = val;
      } else {
        if (boxCode) boxCode.style.display = "block";
        const codeVal = document.getElementById("codeVal");
        if (codeVal) codeVal.innerText = val;
        const codeTimer = document.getElementById("codeTimer");
        if (codeTimer) codeTimer.innerText = "Vigencia máxima: 16 minutos";
      }
    } else {
      const titleEl = document.getElementById("codeResultTitle");
      const descEl = document.getElementById("codeResultDesc");
      if (titleEl) {
        titleEl.innerHTML = `<span style="color:var(--ios-orange); font-weight:800;">SIN RESULTADOS</span>`;
      }
      if (descEl) {
        descEl.innerText =
          "No se detectaron solicitudes recientes para este buzón en los últimos 16 minutos.";
      }
    }
  } catch (err) {
    console.error(err);
    changeCodeStep(5);
    const titleEl = document.getElementById("codeResultTitle");
    const descEl = document.getElementById("codeResultDesc");
    if (titleEl) {
      titleEl.innerHTML = `<span style="color:var(--ios-red); font-weight:800;">ERROR DE RED</span>`;
    }
    if (descEl) {
      descEl.innerText =
        "No se pudo establecer comunicación con el servidor central.";
    }
  }
}

function copiarCodigoResultanteB2B() {
  if (typeof haptic === "function") haptic();
  const codeElement = document.getElementById("codeVal");
  if (!codeElement) return;
  const codigoText = codeElement.innerText.trim();
  if (!codigoText) return;

  navigator.clipboard.writeText(codigoText).then(() => {
    codeElement.style.color = "var(--ios-green)";
    codeElement.style.transform = "scale(0.93)";
    setTimeout(() => {
      codeElement.style.color = "var(--text-primary)";
      codeElement.style.transform = "scale(1)";
    }, 250);
    triggerToast("Código copiado con éxito");
  });
}

// =========================================================================
// 📅 CONTROL Y RENDERIZADO DE VENCIMIENTOS
// =========================================================================
function filtrarVencimientosTab(filtro, btn) {
  if (typeof haptic === "function") haptic();
  window.vencimientoFiltroActual = filtro;
  document
    .querySelectorAll(".venc-tab-btn")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderizarVencimientosB2B();
}

function cargarVencimientosB2B() {
  const container = document.getElementById("contenedorVencimientosCards");
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 35px 10px; color: var(--text-secondary);">
      <svg class="spin-anim" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ios-orange)" stroke-width="2.5" style="margin-bottom: 8px;">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 2v4"></path>
      </svg>
      <p style="font-weight: 700; font-size: 0.85rem;">Analizando casillero de cuentas...</p>
    </div>
  `;

  const telDistri = localStorage.getItem("active_distri_tel") || "";
  const formData = new FormData();
  formData.append("accion", "buscar_casillero_distribuidor");
  formData.append("telefono_distribuidor", telDistri);
  formData.append("busqueda", "");

  fetch(API_MYSQL_URL, {
    method: "POST",
    body: formData,
  })
    .then((r) => r.text())
    .then((text) => {
      let res;
      try {
        res = parseCleanJSON(text);
      } catch (err) {
        console.error("Respuesta original del servidor:", text);
        throw err;
      }

      if (res && res.status === "success" && Array.isArray(res.data)) {
        window.vencimientosDataCache = procesarYClasificarVencimientos(
          res.data,
        );
        renderizarVencimientosB2B();
      } else {
        container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-secondary); font-size:0.85rem;">No se encontraron cuentas activas.</div>`;
      }
    })
    .catch((err) => {
      console.error("Error al cargar vencimientos:", err);
      container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--ios-red); font-size:0.85rem;">Error al conectar con la base de datos de vencimientos.</div>`;
    });
}

function parseVencimientoString(vencStr) {
  if (!vencStr || vencStr === "-" || vencStr === "Activa") return null;
  const mesesMap = {
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
    SEPT: 8,
    SEPTIEMBRE: 8,
    OCT: 9,
    OCTUBRE: 9,
    NOV: 10,
    NOVIEMBRE: 10,
    DIC: 11,
    DICIEMBRE: 11,
  };

  const str = String(vencStr)
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/DE/g, "");
  const match = str.match(/^(\d{1,2})([A-Z]+)/);
  if (match) {
    const dia = parseInt(match[1], 10);
    const mesTxt = match[2];
    let mesNum = -1;
    for (let k in mesesMap) {
      if (mesTxt.startsWith(k)) {
        mesNum = mesesMap[k];
        break;
      }
    }
    if (mesNum !== -1) {
      const now = new Date();
      let year = now.getFullYear();
      return new Date(year, mesNum, dia);
    }
  }
  return null;
}

function procesarYClasificarVencimientos(lista) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return lista
    .map((item) => {
      const dateObj = parseVencimientoString(item.vencimiento);
      let diffDays = null;
      let categoria = "OTRO";

      if (dateObj) {
        const diffTime = dateObj.getTime() - hoy.getTime();
        diffDays = Math.round(diffTime / (1000 * 3600 * 24));

        if (diffDays === -2) categoria = "ANTEAYER";
        else if (diffDays === -1) categoria = "AYER";
        else if (diffDays === 0) categoria = "HOY";
        else if (diffDays === 1) categoria = "MANANA";
        else if (diffDays === 3) categoria = "TRES_DIAS";
      }

      return { ...item, diffDays, categoria };
    })
    .filter(
      (item) =>
        (item.plataforma || "").toUpperCase().includes("NETFLIX") &&
        item.correo &&
        item.correo.includes("@") &&
        ["ANTEAYER", "AYER", "HOY", "MANANA", "TRES_DIAS"].includes(
          item.categoria,
        ),
    );
}

function renderizarVencimientosB2B() {
  const container = document.getElementById("contenedorVencimientosCards");
  if (!container) return;

  let lista = window.vencimientosDataCache || [];
  if (window.vencimientoFiltroActual !== "TODOS") {
    lista = lista.filter(
      (item) => item.categoria === window.vencimientoFiltroActual,
    );
  }

  if (lista.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: var(--text-secondary);">
        <span style="font-size: 2rem; display: block; margin-bottom: 8px;">🎉</span>
        <p style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">¡Sin vencimientos pendientes!</p>
        <p style="font-size: 0.8rem; margin-top: 4px;">No hay cuentas de Netflix en esta categoría.</p>
      </div>
    `;
    return;
  }

  const catBadgeMap = {
    ANTEAYER: {
      label: "🚨 Venció Anteayer",
      color: "var(--ios-red)",
      bg: "rgba(255, 69, 58, 0.15)",
    },
    AYER: {
      label: "⚠️ Venció Ayer",
      color: "var(--ios-red)",
      bg: "rgba(255, 69, 58, 0.15)",
    },
    HOY: {
      label: "🔔 Vence Hoy",
      color: "var(--ios-orange)",
      bg: "rgba(255, 159, 10, 0.15)",
    },
    MANANA: {
      label: "⏳ Vence Mañana",
      color: "var(--ios-blue)",
      bg: "rgba(10, 132, 255, 0.15)",
    },
    TRES_DIAS: {
      label: "📅 Vence en 3 días",
      color: "var(--ios-green)",
      bg: "rgba(48, 209, 88, 0.15)",
    },
  };

  let html = "";
  lista.forEach((item) => {
    const b = catBadgeMap[item.categoria];

    let tieneClienteReal =
      item.cliente &&
      item.cliente !== "-" &&
      item.cliente.trim() !== "" &&
      item.cliente.trim().toLowerCase() !== "sin nombre";

    const clienteCardDisplay = tieneClienteReal
      ? item.cliente.trim()
      : "Sin Nombre";

    const perfil = item.perfil ? `Perfil ${item.perfil}` : "Perfil 1";
    const pin = item.pin && item.pin !== "-" ? ` (PIN: ${item.pin})` : "";

    const rawRecordatorio = generarMensajeRecordatorioAntispam(item);
    const encodedRecordatorio = encodeURIComponent(rawRecordatorio);

    html += `
      <div class="venc-card-item">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 800; font-size: 0.9rem; color: var(--ios-blue); display: flex; align-items: center; gap: 6px;">
            🎬 ${item.plataforma}
          </span>
          <span style="background: ${b.bg}; color: ${b.color}; padding: 4px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 800;">
            ${b.label}
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 3px; font-size: 0.82rem; color: var(--text-primary); margin-top: 2px;">
          <div>👤 <strong>Cliente:</strong> ${clienteCardDisplay}</div>
          <div>📧 <strong>Correo:</strong> <span style="font-family: monospace; color: var(--ios-blue);">${item.correo}</span></div>
          <div>🔐 <strong>Acceso:</strong> Clave: <span style="font-family: monospace;">${item.clave}</span> | ${perfil} ${pin}</div>
        </div>

        <div style="margin-top: 6px;">
          <button class="btn-ios w-100" onclick="copiarRecordatorioVencimiento(this, '${encodedRecordatorio}')" style="background: var(--ai-gradient); color: white; padding: 8px; border-radius: 12px; font-size: 0.78rem; font-weight: 800; min-height: 38px;">
            📋 Copiar Recordatorio
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function copiarRecordatorioVencimiento(btn, textEncoded) {
  if (typeof haptic === "function") haptic();
  const text = decodeURIComponent(textEncoded);
  navigator.clipboard.writeText(text).then(() => {
    const oldText = btn.innerHTML;
    btn.innerHTML = `✅ Recordatorio Copiado`;
    btn.style.color = "#000000";
    btn.style.background = "var(--ios-green)";

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><span>Recordatorio listo para enviar</span></div>`,
      );
    }

    setTimeout(() => {
      btn.innerHTML = oldText;
      btn.style.color = "white";
      btn.style.background = "var(--ai-gradient)";
    }, 1800);
  });
}

function refrescarSaldoDistribuidorFondo() {
  const telActivo =
    localStorage.getItem("active_distri_tel") || window.distriTelefonoCache;
  if (!telActivo) return;

  const btnRefrescar = document.getElementById("btnRefrescarSaldoManual");
  if (btnRefrescar) btnRefrescar.classList.add("spin-anim");

  const formData = new FormData();
  formData.append("accion", "obtener_saldo_distribuidor");
  formData.append("telefono", telActivo);

  fetch(API_MYSQL_URL, { method: "POST", body: formData })
    .then((res) => res.text())
    .then((text) => {
      const res = parseCleanJSON(text);
      if (btnRefrescar) btnRefrescar.classList.remove("spin-anim");
      if (res && res.status === "success" && res.saldo !== undefined) {
        window.saldoNumericoActual = parseFloat(res.saldo);
        localStorage.setItem("active_distri_saldo", window.saldoNumericoActual);
        actualizarSaldoUI();
      }
    })
    .catch(() => {
      if (btnRefrescar) btnRefrescar.classList.remove("spin-anim");
    });
}

function manualRefrescarSaldo() {
  haptic();
  refrescarSaldoDistribuidorFondo();
}

function eliminarDelCarrito(id) {
  haptic();
  window.carrito = window.carrito.filter((item) => item.id !== id);
  const btnTienda = document.getElementById(`btn-add-${id}`);
  if (btnTienda) {
    btnTienda.classList.remove("btn-added");
    btnTienda.innerHTML = "+ Añadir";
  }
  actualizarCarritoUI();
  triggerToast("Plataforma removida del carrito");
}

function cerrarSesionDistribuidor() {
  if (window.cyberIntervaloSaldoFondo)
    clearInterval(window.cyberIntervaloSaldoFondo);
  localStorage.removeItem("active_distri_id");
  localStorage.removeItem("active_distri_tel");
  localStorage.removeItem("active_distri_name");
  localStorage.removeItem("active_distri_saldo");
  sessionStorage.clear();
  window.location.href = "login_distris.html";
}

// =========================================================================
// 🌙 UNIFICACIÓN DE MODO CLARO / OSCURO
// =========================================================================
function toggleThemeDistri() {
  if (typeof haptic === "function") haptic();
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("cyber_theme", newTheme);
  updateThemeIconDistri(newTheme);
}

function updateThemeIconDistri(theme) {
  const btnDesktop = document.getElementById("theme-toggle");
  const btnMobile = document.getElementById("theme-toggle-mobile");
  const svgIcon =
    theme === "light"
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

  if (btnDesktop) btnDesktop.innerHTML = svgIcon;
  if (btnMobile) btnMobile.innerHTML = svgIcon;
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("cyber_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIconDistri(savedTheme);

  let localDistriId = localStorage.getItem("active_distri_id");
  let localDistriTel = localStorage.getItem("active_distri_tel");
  let localDistriName = localStorage.getItem("active_distri_name");
  let localDistriSaldo = localStorage.getItem("active_distri_saldo");

  if (localDistriId || localDistriTel) {
    window.distriTelefonoCache = localDistriTel || "";
    entrarAlPortalDistribuidor(
      localDistriName,
      localDistriTel,
      localDistriSaldo,
    );
  } else {
    window.location.href = "login_distris.html";
  }
});
