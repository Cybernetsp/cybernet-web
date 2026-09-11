/* ==========================================================================
   🛠️ CYBERNET OS - HERRAMIENTAS Y UTILIDADES (herramientas.js)
   ========================================================================== */

/* ==========================================================================
   💳 CYBERNET OS - MÓDULO MODAL PAGOS BRE-B (DISEÑO PREMIUM CON HORA/FECHA TOP-RIGHT)
   ========================================================================== */
const URL_PAGOS_BREB_MYSQL =
  "https://api.cybernetsp.com/obtener_pagos_breb.php";
let cantidadPagosAnterior = 0;

// 👁️ ABRIR / CERRAR VENTANA MODAL DE BRE-B
window.toggleBreBPanel = function () {
  if (typeof haptic === "function") haptic();

  const overlay = document.getElementById("brebOverlay");
  if (!overlay) return;

  const isVisible =
    overlay.classList.contains("open") || overlay.style.display === "flex";

  if (isVisible) {
    window.cerrarBreBPanel();
  } else {
    if (typeof cerrarTodasLasVentanas === "function") cerrarTodasLasVentanas();

    overlay.classList.add("open");
    overlay.style.setProperty("display", "flex", "important");

    window.establecerFechaHoyBreBModal();
    window.cargarPagosBreBModal();
  }
};

window.cerrarBreBPanel = function () {
  const overlay = document.getElementById("brebOverlay");
  if (overlay) {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  }
};

// 📅 AUTOFILLED FECHA HOY
window.establecerFechaHoyBreBModal = function () {
  const inputFecha = document.getElementById("breb-fecha-modal");
  if (inputFecha && !inputFecha.value) {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    inputFecha.value = `${yyyy}-${mm}-${dd}`;
  }
};

// 📥 CONSULTA EN TIEMPO REAL A MYSQL (CON NUEVO DISEÑO DE HORA Y FECHA)
window.cargarPagosBreBModal = function () {
  const contenedor = document.getElementById("breb-lista-modal");
  const totalInlineElem = document.getElementById("breb-monto-total-inline");

  if (!contenedor) return;

  contenedor.innerHTML = `
    <div style="color: #0a84ff; text-align: center; padding: 50px 20px; font-weight: 700; font-size: 0.88rem; display: flex; flex-direction: column; align-items: center; gap: 12px;">
      <svg class="spin-anim" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
      <span>Buscando pagos registrados en MySQL...</span>
    </div>`;

  const inputFecha = document.getElementById("breb-fecha-modal");
  const fechaVal = inputFecha ? inputFecha.value : "";

  const iconoRefresh = document.getElementById("icon-refresh-breb-modal");
  if (iconoRefresh) iconoRefresh.classList.add("spin-anim");

  fetch(`${URL_PAGOS_BREB_MYSQL}?fecha=${encodeURIComponent(fechaVal)}`)
    .then((res) => res.json())
    .then((res) => {
      if (iconoRefresh) iconoRefresh.classList.remove("spin-anim");

      if (res && res.status === "success" && res.data && res.data.length > 0) {
        if (
          cantidadPagosAnterior > 0 &&
          res.data.length > cantidadPagosAnterior
        ) {
          if (typeof CyberSonidos !== "undefined") CyberSonidos.play("dinero");
        }
        cantidadPagosAnterior = res.data.length;

        let sumaTotal = 0;
        let html = "";

        res.data.forEach((pago) => {
          const cliente = pago.nombre
            ? pago.nombre.toUpperCase().trim()
            : "CLIENTE DESCONOCIDO";

          const numMonto = parseFloat(pago.monto_raw) || 0;
          sumaTotal += numMonto;

          const montoStr = pago.valor || numMonto.toLocaleString("es-CO");
          const fechaHora = pago.fecha || "";
          const bancoOrigen = pago.banco ? pago.banco.toUpperCase() : "BRE-B";
          const refText = pago.referencia || "";

          // 🕒 SEPARAR FECHA Y HORA
          const partesFecha = fechaHora.trim().split(" ");
          const fechaOnly = partesFecha[0] || "";
          const horaOnly = partesFecha.slice(1).join(" ") || "";

          const esUsado = pago.estado === "usado";
          const estadoBadge = esUsado
            ? `<div style="margin-top:6px;"><span style="color:#ff453a; font-size:0.72rem; font-weight:800; background:rgba(255,69,58,0.15); padding:3px 10px; border-radius:6px;">USADO</span></div>`
            : "";

          html += `
            <div class="breb-card" style="position: relative; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px 16px; font-size: 0.83rem; line-height: 1.5; color: rgba(255, 255, 255, 0.8); transition: all 0.2s ease; margin-bottom: 8px;" onmouseover="this.style.background='rgba(255, 255, 255, 0.06)'; this.style.borderColor='rgba(48, 209, 88, 0.4)';" onmouseout="this.style.background='rgba(255, 255, 255, 0.03)'; this.style.borderColor='rgba(255, 255, 255, 0.08)';">
              
              <div style="position: absolute; top: 12px; right: 16px; text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                <span style="color: #ffffff; font-weight: 900; font-size: 1.05rem; font-family: monospace; letter-spacing: -0.3px;">${horaOnly}</span>
                <span style="color: rgba(255, 255, 255, 0.45); font-size: 0.72rem; font-weight: 600; font-family: monospace; margin-top: -2px;">${fechaOnly}</span>
              </div>

              <div style="padding-right: 110px;">
                <div style="font-weight: 800; color: #ffffff; font-size: 0.95rem; letter-spacing: 0.3px; text-transform: uppercase;">${cliente}</div>
                <div style="margin-top: 3px; display: flex; align-items: center; gap: 5px;">
                  <span style="color: rgba(255, 255, 255, 0.55); font-size: 0.82rem;">envió</span>
                  <span style="color: #30d158; font-weight: 900; font-family: monospace; font-size: 0.98rem;">+$${montoStr}</span>
                </div>
                <div style="color: rgba(255, 255, 255, 0.5); font-size: 0.76rem; margin-top: 4px;">
                  desde <b style="color: #0a84ff;">${bancoOrigen}</b> | Ref: <b style="color: #0a84ff;">${refText}</b>
                </div>
                ${estadoBadge}
              </div>

            </div>`;
        });

        contenedor.innerHTML = html;

        const usuarioActivo = (
          localStorage.getItem("usuario") ||
          localStorage.getItem("user") ||
          sessionStorage.getItem("usuario") ||
          window.usuarioActivo ||
          ""
        )
          .toUpperCase()
          .trim();

        const rolActivo = (
          localStorage.getItem("rol") ||
          sessionStorage.getItem("rol") ||
          ""
        )
          .toLowerCase()
          .trim();

        const esSuperAdmin =
          usuarioActivo === "CAMILO" ||
          rolActivo === "superadmin" ||
          usuarioActivo === "ADMIN";

        if (esSuperAdmin && totalInlineElem) {
          totalInlineElem.innerText =
            "$" + Math.round(sumaTotal).toLocaleString("es-CO");
          totalInlineElem.style.display = "inline-block";
        } else if (totalInlineElem) {
          totalInlineElem.style.display = "none";
        }
      } else {
        contenedor.innerHTML = `<div style="text-align: center; color: rgba(255,255,255,0.4); padding: 50px 20px; font-size: 0.85rem; font-weight: 600;">📭 No hay pagos registrados para la fecha seleccionada</div>`;
        if (totalInlineElem) totalInlineElem.style.display = "none";
      }
    })
    .catch((err) => {
      if (iconoRefresh) iconoRefresh.classList.remove("spin-anim");
      contenedor.innerHTML = `<div style="text-align: center; color: #ff453a; padding: 40px 20px; font-size: 0.85rem; font-weight: 700;">❌ Error al conectar con el servidor de MySQL</div>`;
      if (totalInlineElem) totalInlineElem.style.display = "none";
      console.error("Error consultando pagos Bre-B:", err);
    });
};

// 🔍 FILTRAR CLIENTES EN VIVO
window.filtrarBreBModal = function () {
  const buscador = document.getElementById("breb-buscar-modal");
  const texto = buscador ? buscador.value.toLowerCase().trim() : "";
  const tarjetas = document.querySelectorAll("#breb-lista-modal .breb-card");

  tarjetas.forEach((tarjeta) => {
    const contenido = tarjeta.innerText.toLowerCase();
    tarjeta.style.display = contenido.includes(texto) ? "block" : "none";
  });
};

// 📅 CAMBIO DE FECHA
window.alCambiarFechaBreBModal = function () {
  window.cargarPagosBreBModal();
};

// 🔄 REFRESCAR MANUALMENTE
window.forzarActualizacionBreBModal = function () {
  window.cargarPagosBreBModal();
};

/* ==========================================================================
   📋 PLANTILLAS DESDE MYSQL Y MOTORES DE COPIADO + EDICIÓN SUPERADMIN
   ========================================================================== */
window.currentGridStock = [];
window.misFavoritosPlantillas = [];

// Helper para validar si el usuario es SuperAdmin (CAMILO)
window.verificarSuperAdminPlantillas = function () {
  const usuarioActivoObj = JSON.parse(
    sessionStorage.getItem("usuario_activo") || "{}",
  );
  const usuarioNombre = (
    usuarioActivoObj.nombre ||
    sessionStorage.getItem("active_staff") ||
    localStorage.getItem("cyber_saved_staff") ||
    ""
  )
    .toUpperCase()
    .trim();
  return usuarioActivoObj.rol === "superadmin" || usuarioNombre === "CAMILO";
};

// Helper para obtener nombre del trabajador activo (Para favoritos)
window.obtenerNombreTrabajadorActivo = function () {
  const usuarioActivoObj = JSON.parse(
    sessionStorage.getItem("usuario_activo") || "{}",
  );
  return (
    usuarioActivoObj.nombre ||
    sessionStorage.getItem("active_staff") ||
    localStorage.getItem("cyber_saved_staff") ||
    "GENERAL"
  )
    .toUpperCase()
    .trim();
};

// Cargar favoritos al inicio
window.cargarFavoritosServidor = function (callback) {
  const usuario = window.obtenerNombreTrabajadorActivo();
  fetch(
    `https://api.cybernetsp.com/favoritos_plantillas.php?usuario=${encodeURIComponent(usuario)}&v=${Date.now()}`,
  )
    .then((res) => res.json())
    .then((res) => {
      if (res && res.status === "success" && Array.isArray(res.favoritos)) {
        window.misFavoritosPlantillas = res.favoritos;
      }
      if (typeof callback === "function") callback();
    })
    .catch(() => {
      if (typeof callback === "function") callback();
    });
};

window.toggleFavoritoPlantilla = function (idPlantilla) {
  if (typeof haptic === "function") haptic();
  const idStr = String(idPlantilla);
  const index = window.misFavoritosPlantillas.indexOf(idStr);

  if (index > -1) {
    window.misFavoritosPlantillas.splice(index, 1);
  } else {
    if (window.misFavoritosPlantillas.length >= 4) {
      if (typeof triggerToast === "function") {
        triggerToast(
          "⚠️ Solo puedes fijar un máximo de 4 plantillas favoritas.",
        );
      } else {
        alert("⚠️ Solo puedes fijar un máximo de 4 plantillas favoritas.");
      }
      return;
    }
    window.misFavoritosPlantillas.push(idStr);
  }

  const usuario = window.obtenerNombreTrabajadorActivo();
  fetch(
    "https://api.cybernetsp.com/favoritos_plantillas.php?usuario=" +
      encodeURIComponent(usuario),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favoritos: window.misFavoritosPlantillas }),
    },
  )
    .then((res) => res.json())
    .then((res) => {
      if (res && res.status === "success") {
        const buscadorInput = document.getElementById("macSearchCards");
        const filtroTexto = buscadorInput ? buscadorInput.value.trim() : "";
        window.renderGrid(filtroTexto);
      }
    });
};

window.abrirModalEditarPlantillaFromEscaped = function (escapedObj) {
  try {
    const item = JSON.parse(decodeURIComponent(escapedObj));
    window.abrirModalEditarPlantilla(item);
  } catch (err) {
    console.error("Error abriendo plantilla codificada:", err);
  }
};

// 🔄 CARGA Y AUTO-SINCRONIZACIÓN DE PLANTILLAS
window.cargarPlantillasDesdeSheets = function (silencioso = false) {
  const container = document.getElementById("grid-container");

  // Mostrar texto de carga únicamente en la carga inicial o manual
  if (container && !silencioso) {
    container.innerHTML =
      '<div class="empty-log-msg" style="grid-column: 1 / -1; width: 100%; text-align: center; margin-top: 40px;">Sincronizando mensajes desde MySQL...</div>';
  }

  // Asegurarnos de que los favoritos estén cargados antes de renderizar
  window.cargarFavoritosServidor(() => {
    // Parámetro v=Date.now() evita cache en navegadores de los empleados
    fetch("https://api.cybernetsp.com/obtener_plantillas.php?v=" + Date.now())
      .then((res) => res.json())
      .then((res) => {
        if (res && res.status === "success") {
          const data = res.data;
          let plantillaPagos = null;
          let plantillaNequi = null;
          window.currentGridStock = [];

          data.forEach((item) => {
            const tituloUP = item.titulo.toUpperCase();
            if (tituloUP === "PAGOS") {
              plantillaPagos = item;
            } else if (tituloUP === "NEQUI") {
              plantillaNequi = item;
            } else {
              window.currentGridStock.push(item);
            }
          });

          const esAdmin = window.verificarSuperAdminPlantillas();
          const headerContainer = document.getElementById("header-container");

          const crearBtnEditarLeft = (item) => {
            if (!esAdmin || !item) return "";
            let itemEscapado = encodeURIComponent(JSON.stringify(item));
            return `
              <button type="button" title="Editar plantilla" onclick="event.stopPropagation(); window.abrirModalEditarPlantillaFromEscaped('${itemEscapado}')" style="width: 40px !important; min-width: 40px !important; max-width: 40px !important; height: 40px !important; flex: 0 0 40px !important; padding: 0 !important; background: rgba(10, 132, 255, 0.15) !important; color: #0a84ff !important; border: 1px solid rgba(10, 132, 255, 0.3) !important; border-radius: 12px !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important; transition: all 0.2s ease !important; flex-shrink: 0 !important;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block !important;">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>`;
          };

          if (headerContainer && plantillaPagos) {
            let textoPagosSeguro = encodeURIComponent(
              plantillaPagos.texto || "",
            ).replace(/'/g, "%27");
            let editPagosHtml = crearBtnEditarLeft(plantillaPagos);

            let btnNequiHtml = "";

            if (plantillaNequi) {
              let textoNequiSeguro = encodeURIComponent(
                plantillaNequi.texto || "",
              ).replace(/'/g, "%27");
              let editNequiHtml = crearBtnEditarLeft(plantillaNequi);

              btnNequiHtml = `
                <div style="display: flex !important; flex-direction: row !important; gap: 8px !important; align-items: center !important; width: 100% !important;">
                  <button class="btn-ios" style="flex: 1 !important; width: 100% !important; min-width: 0 !important; padding: 12px 10px !important; font-size: 0.8rem !important; font-weight: 800 !important; border-radius: 12px !important; background: rgba(255, 255, 255, 0.08) !important; color: var(--text-primary) !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; transition: all 0.2s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important; cursor: pointer !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important;" onclick="window.copiarPlantillaGlobal(this, '${textoNequiSeguro}')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> <span style="white-space: nowrap !important;">COPIAR NEQUI</span>
                  </button>
                  ${editNequiHtml}
                </div>`;
            }

            headerContainer.innerHTML = `
              <div class="card-ios w-100" style="max-width: 440px; align-items: center; gap: 12px; padding: 20px;">
                <img src="${plantillaPagos.imagenUrl}" alt="QR" onclick="window.copiarImagenQRPagos(this, '${plantillaPagos.imagenUrl}')" style="max-width:210px; width:100%; border-radius:16px; border: 2px solid transparent; box-shadow:var(--glass-shadow); padding:5px; background:white; margin:0 auto; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" title="Haz clic para copiar la imagen del QR">
                <span class="text-secondary text-center" style="font-size:0.75rem; font-weight:500; margin-top: -4px;">(Haz clic sobre el QR para copiar la imagen)</span>
                <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 4px;">
                  <div style="display: flex !important; flex-direction: row !important; gap: 8px !important; align-items: center !important; width: 100% !important;">
                    <button class="btn-ios" style="flex: 1 !important; width: 100% !important; min-width: 0 !important; padding: 12px 10px !important; font-size: 0.8rem !important; font-weight: 800 !important; border-radius: 12px !important; background: rgba(255, 255, 255, 0.08) !important; color: var(--text-primary) !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; transition: all 0.2s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important; cursor: pointer !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important;" onclick="window.copiarPlantillaGlobal(this, '${textoPagosSeguro}')">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> <span style="white-space: nowrap !important;">COPIAR PAGOS (BRE-B)</span>
                    </button>
                    ${editPagosHtml}
                  </div>
                  ${btnNequiHtml}
                </div>
              </div>`;
          }

          // Mantener el filtro activo del buscador en caso de que estén buscando una plantilla
          const buscadorInput = document.getElementById("macSearchCards");
          const filtroTexto = buscadorInput ? buscadorInput.value.trim() : "";
          window.renderGrid(filtroTexto);
        } else {
          if (container && !silencioso)
            container.innerHTML =
              '<div class="empty-log-msg" style="color:var(--ios-red); grid-column: 1 / -1; width: 100%; text-align: center; margin-top: 40px;">❌ Error al descargar plantillas desde MySQL.</div>';
        }
      })
      .catch((err) => {
        if (container && !silencioso)
          container.innerHTML =
            '<div class="empty-log-msg" style="color:var(--ios-red); grid-column: 1 / -1; width: 100%; text-align: center; margin-top: 40px;">❌ Error al conectar con el servidor PHP.</div>';
        console.error(err);
      });
  });
};

// ⏱️ TEMPORIZADOR DE AUTO-REFRESCO CADA 1 MINUTO (60,000 MS)
if (window.intervaloPlantillasAuto) {
  clearInterval(window.intervaloPlantillasAuto);
}
window.intervaloPlantillasAuto = setInterval(() => {
  // Evitar refrescar si el superadmin está editando una plantilla
  const modalOverlay = document.getElementById("modalPlantillaOverlay");
  const modalAbierto =
    modalOverlay &&
    modalOverlay.style.display !== "none" &&
    modalOverlay.style.display !== "";

  if (!modalAbierto) {
    window.cargarPlantillasDesdeSheets(true); // Refresco silencioso
  }
}, 60000);

window.renderGrid = function (filtro = "") {
  const gridContainer = document.getElementById("grid-container");
  const emptyState = document.getElementById("macEmptyState");
  const btnAgregar = document.getElementById("btnAgregarPlantillaSuperAdmin");
  const esAdmin = window.verificarSuperAdminPlantillas();

  if (btnAgregar) {
    btnAgregar.style.display = esAdmin ? "flex" : "none";
  }

  if (!gridContainer || !window.currentGridStock) return;
  gridContainer.innerHTML = "";

  // Separar plantillas favoritas de las normales
  let favsList = [];
  let normalesList = [];

  window.currentGridStock.forEach((item) => {
    const esFav = window.misFavoritosPlantillas.includes(String(item.id));
    if (esFav) {
      favsList.push(item);
    } else {
      normalesList.push(item);
    }
  });

  // Filtrar según el buscador
  let favsFiltrados = favsList.filter(
    (item) =>
      item.titulo && item.titulo.toLowerCase().includes(filtro.toLowerCase()),
  );
  let normalesFiltrados = normalesList.filter(
    (item) =>
      item.titulo && item.titulo.toLowerCase().includes(filtro.toLowerCase()),
  );

  if (emptyState) {
    if (
      favsFiltrados.length === 0 &&
      normalesFiltrados.length === 0 &&
      filtro !== ""
    ) {
      emptyState.style.display = "flex";
      emptyState.querySelector("span").innerText =
        `No se encontraron plantillas con "${filtro}".`;
    } else if (window.currentGridStock.length > 0) {
      emptyState.style.display = "none";
    }
  }

  gridContainer.style.cssText =
    "display: grid !important; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important; gap: 16px !important; width: 100% !important; align-content: start !important;";

  if (favsFiltrados.length === 0 && normalesFiltrados.length === 0) return;

  // Renderizar Favoritas
  if (favsFiltrados.length > 0 && filtro === "") {
    const favHeader = document.createElement("div");
    favHeader.style.cssText =
      "grid-column: 1 / -1; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;";
    favHeader.innerHTML = `
      <div style="font-size: 0.85rem; font-weight: 800; color: #ffcc00; display: flex; align-items: center; gap: 6px; text-transform: uppercase;">
        ⭐ MIS FAVORITAS (${favsFiltrados.length}/4)
      </div>`;
    gridContainer.appendChild(favHeader);

    favsFiltrados.forEach((item) =>
      gridContainer.appendChild(crearTarjetaPlantilla(item, true, esAdmin)),
    );

    const divSeparador = document.createElement("div");
    divSeparador.style.cssText =
      "grid-column: 1 / -1; border-bottom: 1px solid rgba(255,255,255,0.08); margin: 10px 0 16px 0;";
    gridContainer.appendChild(divSeparador);
  }

  // Renderizar Resto de Plantillas
  const listaMostrar =
    filtro !== ""
      ? [...favsFiltrados, ...normalesFiltrados]
      : normalesFiltrados;
  listaMostrar.forEach((item) =>
    gridContainer.appendChild(
      crearTarjetaPlantilla(
        item,
        window.misFavoritosPlantillas.includes(String(item.id)),
        esAdmin,
      ),
    ),
  );
};

function crearTarjetaPlantilla(currentItem, esFavorita, esAdmin) {
  const card = document.createElement("div");
  card.className = "card-ios";
  card.style.cssText = `display: flex !important; flex-direction: column !important; justify-content: space-between !important; height: 100% !important; padding: 18px !important; background: ${esFavorita ? "rgba(255, 204, 0, 0.04)" : "rgba(255, 255, 255, 0.02)"} !important; border: 1px solid ${esFavorita ? "rgba(255, 204, 0, 0.3)" : "rgba(255, 255, 255, 0.06)"} !important; border-radius: 16px !important; margin: 0 !important; box-sizing: border-box !important; min-height: 120px !important; position: relative !important;`;

  let tituloLimpio = currentItem.titulo
    ? currentItem.titulo.trim()
    : "Plantilla Sin Nombre";

  const divHeader = document.createElement("div");
  divHeader.style.cssText =
    "margin-bottom: 14px !important; flex-grow: 1 !important; display: flex !important; align-items: flex-start !important; justify-content: space-between !important; gap: 8px !important;";

  divHeader.innerHTML = `
    <h2 class="card-title" style="margin: 0 !important; font-size: 0.95rem !important; font-weight: 800 !important; color: var(--text-primary) !important; text-transform: uppercase !important;">${tituloLimpio}</h2>
    <button type="button" title="${esFavorita ? "Quitar de favoritas" : "Fijar como favorita"}" onclick="event.stopPropagation(); window.toggleFavoritoPlantilla('${currentItem.id}')" style="background: transparent; border: none; font-size: 1.1rem; cursor: pointer; padding: 0; line-height: 1; filter: ${esFavorita ? "drop-shadow(0 0 6px rgba(255, 204, 0, 0.6))" : "grayscale(100%) opacity(0.4)"}; transition: transform 0.2s ease;">
      ⭐
    </button>
  `;

  const divBtns = document.createElement("div");
  divBtns.style.cssText =
    "display: flex !important; flex-direction: row !important; gap: 8px !important; align-items: center !important; width: 100% !important; margin-top: auto !important;";

  const btnCopiar = document.createElement("button");
  btnCopiar.type = "button";
  btnCopiar.className = "btn-ios";
  btnCopiar.style.cssText =
    "flex: 1 1 auto !important; width: 100% !important; padding: 12px 10px !important; background: rgba(255, 255, 255, 0.08) !important; color: var(--text-primary) !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; border-radius: 12px !important; font-weight: 800 !important; font-size: 0.8rem !important; cursor: pointer !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important;";
  btnCopiar.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> <span>COPIAR TEXTO</span>`;
  btnCopiar.onclick = function () {
    window.copiarPlantillaDirecta(this, currentItem.texto || "");
  };

  divBtns.appendChild(btnCopiar);

  if (esAdmin) {
    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.style.cssText =
      "width: 40px !important; min-width: 40px !important; height: 40px !important; padding: 0 !important; background: rgba(10, 132, 255, 0.15) !important; color: #0a84ff !important; border: 1px solid rgba(10, 132, 255, 0.3) !important; border-radius: 12px !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important;";
    btnEditar.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
    btnEditar.onclick = function (e) {
      e.stopPropagation();
      window.abrirModalEditarPlantilla(currentItem);
    };
    divBtns.appendChild(btnEditar);
  }

  card.appendChild(divHeader);
  card.appendChild(divBtns);
  return card;
}

/* ==========================================================================
   ✏️ MODAL Y LÓGICA DE AGREGAR / EDITAR / ELIMINAR PLANTILLAS (SUPERADMIN)
   ========================================================================== */
window.crearModalPlantillaSiNoExiste = function () {
  if (document.getElementById("modalPlantillaOverlay")) return;

  const modalHtml = `
  <div class="overlay-ios" id="modalPlantillaOverlay" style="display: none; z-index: 18000; position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; align-items: center !important; justify-content: center !important; background: rgba(0, 0, 0, 0.85) !important; backdrop-filter: blur(14px) !important;">
    <div class="modal-ios" onclick="event.stopPropagation()" style="max-width: 520px !important; width: 92% !important; background: #141418 !important; border: 1px solid rgba(48, 209, 88, 0.35) !important; border-radius: 26px !important; padding: 22px 24px !important; box-shadow: 0 30px 70px rgba(0, 0, 0, 0.9) !important; display: flex !important; flex-direction: column !important; gap: 16px !important; margin: auto !important;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 12px;">
        <h3 id="modalPlantillaTituloText" style="margin: 0; color: #ffffff; font-weight: 800; font-size: 1.1rem;">Gestión de Plantilla</h3>
        <button type="button" onclick="window.cerrarModalPlantilla()" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.1); color: #a1a1aa; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
      </div>

      <form onsubmit="window.guardarPlantillaPHP(event)" style="display: flex; flex-direction: column; gap: 14px; margin: 0;">
        <input type="hidden" id="inputPlantillaId" value="" />

        <div style="display: flex; flex-direction: column; gap: 5px;">
          <label style="font-size: 0.7rem; color: #a1a1aa; font-weight: 800; text-transform: uppercase;">Título de la Plantilla</label>
          <input type="text" id="inputPlantillaTitulo" required placeholder="Ej: SALUDO, PROMO..." class="input-ios" style="background: rgba(0,0,0,0.45) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: #ffffff !important; padding: 10px 14px !important; border-radius: 12px !important; font-size: 0.9rem !important; outline: none; margin: 0 !important; width: 100%; box-sizing: border-box;" />
        </div>

        <div style="display: flex; flex-direction: column; gap: 5px;">
          <label style="font-size: 0.7rem; color: #a1a1aa; font-weight: 800; text-transform: uppercase;">Contenido / Texto</label>
          <textarea id="inputPlantillaTexto" required rows="6" placeholder="Escribe el mensaje aquí..." class="input-ios" style="background: rgba(0,0,0,0.45) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: #ffffff !important; padding: 12px 14px !important; border-radius: 12px !important; font-size: 0.85rem !important; font-family: monospace; line-height: 1.4; outline: none; resize: vertical; margin: 0 !important; width: 100%; box-sizing: border-box;"></textarea>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 6px;">
          <button type="button" onclick="window.cerrarModalPlantilla()" style="flex: 1; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.08); color: #a1a1aa; font-weight: 700; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.2s ease;">Cancelar</button>
          
          <button type="button" id="btnEliminarPlantilla" onclick="window.eliminarPlantillaPHP()" style="display: none; flex: 1; padding: 12px; border-radius: 12px; background: rgba(255,69,58,0.15); color: #ff453a; font-weight: 800; border: 1px solid rgba(255,69,58,0.3); cursor: pointer; transition: all 0.2s ease;">Borrar</button>
          
          <button type="submit" id="btnSubmitPlantilla" style="flex: 1.5; padding: 12px; border-radius: 12px; background: #30d158; color: #000000; font-weight: 900; border: none; cursor: pointer; box-shadow: 0 4px 15px rgba(48,209,88,0.3); transition: all 0.2s ease;">Guardar</button>
        </div>
      </form>

    </div>
  </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);
};

window.abrirModalAgregarPlantilla = function () {
  if (typeof haptic === "function") haptic();
  window.crearModalPlantillaSiNoExiste();

  document.getElementById("inputPlantillaId").value = "";
  document.getElementById("inputPlantillaTitulo").value = "";
  document.getElementById("inputPlantillaTexto").value = "";
  document.getElementById("modalPlantillaTituloText").innerText =
    "➕ Agregar Nueva Plantilla";

  const btnEliminar = document.getElementById("btnEliminarPlantilla");
  if (btnEliminar) btnEliminar.style.display = "none";

  const overlay = document.getElementById("modalPlantillaOverlay");
  if (overlay) overlay.style.display = "flex";
};

window.abrirModalEditarPlantilla = function (item) {
  if (typeof haptic === "function") haptic();
  window.crearModalPlantillaSiNoExiste();

  document.getElementById("inputPlantillaId").value = item.id || "";
  document.getElementById("inputPlantillaTitulo").value = item.titulo || "";
  document.getElementById("inputPlantillaTexto").value = item.texto || "";
  document.getElementById("modalPlantillaTituloText").innerText =
    "✏️ Editar Plantilla";

  const btnEliminar = document.getElementById("btnEliminarPlantilla");
  if (btnEliminar) btnEliminar.style.display = "block";

  const overlay = document.getElementById("modalPlantillaOverlay");
  if (overlay) overlay.style.display = "flex";
};

window.cerrarModalPlantilla = function () {
  const overlay = document.getElementById("modalPlantillaOverlay");
  if (overlay) overlay.style.display = "none";
};

window.guardarPlantillaPHP = function (e) {
  if (e) e.preventDefault();

  const id = document.getElementById("inputPlantillaId").value;
  const titulo = document.getElementById("inputPlantillaTitulo").value.trim();
  const texto = document.getElementById("inputPlantillaTexto").value.trim();

  if (!titulo || !texto) {
    alert("⚠️ Por favor completa el título y texto.");
    return;
  }

  const btn = document.getElementById("btnSubmitPlantilla");
  const originalTxt = btn ? btn.innerText : "Guardar";
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Guardando...";
  }

  const formData = new FormData();
  formData.append("accion", id ? "editar" : "agregar");
  formData.append("id", id);
  formData.append("titulo", titulo);
  formData.append("texto", texto);

  fetch("https://api.cybernetsp.com/acciones_plantillas.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      if (btn) {
        btn.disabled = false;
        btn.innerText = originalTxt;
      }
      if (res && res.status === "success") {
        window.cerrarModalPlantilla();
        window.cargarPlantillasDesdeSheets(false);
        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="color:var(--ios-green);">✅ Plantilla guardada correctamente</div>`,
          );
        }
      } else {
        alert("❌ Error: " + (res ? res.message : "No se pudo guardar"));
      }
    })
    .catch((err) => {
      if (btn) {
        btn.disabled = false;
        btn.innerText = originalTxt;
      }
      alert("❌ Error de comunicación: " + err.message);
    });
};

window.eliminarPlantillaPHP = function () {
  const idInput = document.getElementById("inputPlantillaId");
  const id = idInput ? idInput.value : "";

  if (!id) {
    alert("⚠️ Error: No se encontró el ID de la plantilla a eliminar.");
    return;
  }

  const confirmacion = confirm(
    "⚠️ ¿Estás seguro de que deseas eliminar esta plantilla permanentemente de la base de datos?",
  );
  if (!confirmacion) return;

  if (typeof haptic === "function") haptic();

  const btn = document.getElementById("btnEliminarPlantilla");
  const originalTxt = btn ? btn.innerText : "Borrar";
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Borrando...";
  }

  const formData = new FormData();
  formData.append("accion", "eliminar");
  formData.append("id", id);

  fetch("https://api.cybernetsp.com/acciones_plantillas.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      if (btn) {
        btn.disabled = false;
        btn.innerText = originalTxt;
      }
      if (res && res.status === "success") {
        window.cerrarModalPlantilla();
        window.cargarPlantillasDesdeSheets(false);
        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="color:var(--ios-red);">🗑️ Plantilla eliminada correctamente</div>`,
          );
        }
      } else {
        alert("❌ Error: " + (res ? res.message : "No se pudo eliminar"));
      }
    })
    .catch((err) => {
      if (btn) {
        btn.disabled = false;
        btn.innerText = originalTxt;
      }
      alert("❌ Error de comunicación: " + err.message);
    });
};

// 🗑️ BOTÓN DE PAPELERA DINÁMICO PEGADO AL TEXTO EN EL BUSCADOR (#macSearchCards)
window.actualizarBotonBorrarSearchCards = function () {
  const input = document.getElementById("macSearchCards");
  if (!input) return;

  let btnTrash = document.getElementById("btnBorrarTrashSearchCards");
  let measurer = document.getElementById("measurerSearchCards");

  if (!measurer) {
    measurer = document.createElement("span");
    measurer.id = "measurerSearchCards";
    measurer.style.cssText = `
      position: absolute;
      visibility: hidden;
      height: 0;
      white-space: pre;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      letter-spacing: inherit;
    `;
    document.body.appendChild(measurer);
  }

  if (!btnTrash && input.parentElement) {
    const container = input.parentElement;
    if (window.getComputedStyle(container).position === "static") {
      container.style.position = "relative";
    }

    btnTrash = document.createElement("button");
    btnTrash.id = "btnBorrarTrashSearchCards";
    btnTrash.type = "button";
    btnTrash.title = "Borrar búsqueda";
    btnTrash.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ff453a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
    btnTrash.style.cssText = `
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 69, 58, 0.15);
      border: 1px solid rgba(255, 69, 58, 0.3);
      border-radius: 8px;
      width: 28px;
      height: 28px;
      display: none;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      transition: background 0.2s ease, border-color 0.2s ease;
    `;
    btnTrash.onclick = window.borrarTextoBuscadorTarjetas;
    container.appendChild(btnTrash);
  }

  const val = input.value;
  if (val.length > 0 && btnTrash) {
    const style = window.getComputedStyle(input);
    measurer.style.fontFamily = style.fontFamily;
    measurer.style.fontSize = style.fontSize;
    measurer.style.fontWeight = style.fontWeight;
    measurer.style.letterSpacing = style.letterSpacing;
    measurer.textContent = val;

    const paddingLeft = parseFloat(style.paddingLeft) || 40;
    const textWidth = measurer.offsetWidth;
    const maxLeft = input.offsetWidth - 38;
    const calculatedLeft = Math.min(paddingLeft + textWidth + 10, maxLeft);

    btnTrash.style.left = `${calculatedLeft}px`;
    btnTrash.style.display = "flex";
  } else if (btnTrash) {
    btnTrash.style.display = "none";
  }
};

window.borrarTextoBuscadorTarjetas = function () {
  if (typeof haptic === "function") haptic();
  const input = document.getElementById("macSearchCards");
  if (input) {
    input.value = "";
    window.actualizarBotonBorrarSearchCards();
    window.renderGrid("");
  }
};

window.filtrarTarjetasMac = function () {
  const input = document.getElementById("macSearchCards");
  const filtro = input ? input.value.trim() : "";
  window.actualizarBotonBorrarSearchCards();
  window.renderGrid(filtro);
};

window.copiarPlantillaGlobal = function (btn, textoCodificado) {
  if (typeof haptic === "function") haptic();

  // Borrar automáticamente lo que se escribió en el buscador al copiar
  const inputSearch = document.getElementById("macSearchCards");
  if (inputSearch && inputSearch.value.trim() !== "") {
    inputSearch.value = "";
    window.actualizarBotonBorrarSearchCards();
    window.renderGrid("");
  }

  const textoReal = decodeURIComponent(textoCodificado);
  window.copiarPlantillaDirecta(btn, textoReal);
};

window.copiarPlantillaDirecta = function (btn, textoReal) {
  if (typeof haptic === "function") haptic();

  // Borrar automáticamente lo que se escribió en el buscador al copiar
  const inputSearch = document.getElementById("macSearchCards");
  if (inputSearch && inputSearch.value.trim() !== "") {
    inputSearch.value = "";
    window.actualizarBotonBorrarSearchCards();
    window.renderGrid("");
  }

  const animarExito = () => {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡COPIADO!`;
    btn.style.setProperty("background", "#30d158", "important");
    btn.style.setProperty("color", "#ffffff", "important");
    btn.style.setProperty("border-color", "#30d158", "important");
    btn.style.setProperty("transform", "scale(1.05)", "important");

    const card = btn.closest(".card-ios");
    if (card) {
      card.style.setProperty("border-color", "#30d158", "important");
      card.style.setProperty(
        "box-shadow",
        "0 0 20px rgba(48, 209, 88, 0.4)",
        "important",
      );
    }

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>¡Texto copiado al portapapeles!</span></div>`,
      );
    }

    setTimeout(function () {
      btn.innerHTML = originalHTML;
      btn.style.setProperty(
        "background",
        "rgba(255, 255, 255, 0.08)",
        "important",
      );
      btn.style.setProperty("color", "var(--text-primary)", "important");
      btn.style.setProperty(
        "border-color",
        "rgba(255, 255, 255, 0.15)",
        "important",
      );
      btn.style.setProperty("transform", "scale(1)", "important");

      if (card) {
        card.style.setProperty(
          "border-color",
          "rgba(255, 255, 255, 0.06)",
          "important",
        );
        card.style.setProperty("box-shadow", "none", "important");
      }
    }, 1500);
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(textoReal)
      .then(animarExito)
      .catch(() => usarFallbackCopiado(textoReal, animarExito));
  } else {
    usarFallbackCopiado(textoReal, animarExito);
  }
};

function usarFallbackCopiado(textoReal, animarExito) {
  const textarea = document.createElement("textarea");
  textarea.value = textoReal;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
    animarExito();
  } catch (err) {
    alert("Tu navegador bloqueó la copia automática.");
  }
  document.body.removeChild(textarea);
}

window.copiarImagenQRPagos = function (imgElement, urlImagen) {
  if (typeof haptic === "function") haptic();
  imgElement.style.transform = "scale(0.95)";
  imgElement.style.opacity = "0.6";

  try {
    const imgObj = new Image();
    imgObj.crossOrigin = "anonymous";
    imgObj.src = urlImagen;
    imgObj.onload = function () {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = imgObj.width;
        canvas.height = imgObj.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(imgObj, 0, 0);

        canvas.toBlob(async function (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
            imgElement.style.transform = "scale(1.05)";
            imgElement.style.opacity = "1";
            imgElement.style.borderColor = "var(--ios-green)";

            if (typeof triggerToast === "function")
              triggerToast(
                `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>¡Imagen copiada! (Ctrl + V para pegar)</span></div>`,
              );
            if (typeof window.CyberSonidos !== "undefined")
              window.CyberSonidos.play("exito");

            setTimeout(() => {
              imgElement.style.transform = "scale(1)";
              imgElement.style.borderColor = "transparent";
            }, 1200);
          } catch (err) {
            lanzarErrorCopia(imgElement);
          }
        }, "image/png");
      } catch (err) {
        lanzarErrorCopia(imgElement);
      }
    };
    imgObj.onerror = function () {
      lanzarErrorCopia(imgElement);
    };
  } catch (error) {
    lanzarErrorCopia(imgElement);
  }
};

function lanzarErrorCopia(imgElement) {
  console.error("El navegador bloqueó la API.");
  imgElement.style.transform = "scale(1)";
  imgElement.style.opacity = "1";
  alert(
    "Tu navegador bloqueó la copia automática de imágenes. Usa clic derecho -> 'Copiar imagen'.",
  );
}

/* ==========================================================================
   📩 BANDEJA DE CÓDIGOS DE ACCESO (VIGENCIA 15 MIN EN TIEMPO REAL PRECISO)
   ========================================================================== */
const URL_APPS_SCRIPT_CODIGOS =
  "https://script.google.com/macros/s/AKfycbxqKpMcC5BI0H6PHnImu5Lkw3ryiuFO0fW0KJAhQ_45kzglYn9CpN1O2fCjezXM5oMi/exec";
const URL_OBTENER_CODIGOS_MYSQL =
  "https://api.cybernetsp.com/obtener_codigos.php";

window.timerIntervalCodigos = null;

const oldToggleCodesPanel = window.toggleCodesPanel;
window.toggleCodesPanel = function () {
  if (oldToggleCodesPanel) oldToggleCodesPanel();
  const overlay = document.getElementById("codesOverlay");
  if (overlay && overlay.classList.contains("open")) {
    window.cargarBandejaCodigosMySQL();
  } else {
    if (window.timerIntervalCodigos) {
      clearInterval(window.timerIntervalCodigos);
      window.timerIntervalCodigos = null;
    }
  }
};

function calcularExpiracionCodigoMs(item) {
  let inicioMs = 0;

  if (item.fecha_registro) {
    let isoStr = String(item.fecha_registro).trim().replace(" ", "T");
    let parsed = new Date(isoStr).getTime();
    if (!isNaN(parsed) && parsed > 0) inicioMs = parsed;
  }

  if (!inicioMs && item.hora) {
    const hoy = new Date();
    let p = item.hora.trim().split(" ");
    let hm = p[0].split(":");
    let h = parseInt(hm[0], 10) || 0;
    let m = parseInt(hm[1], 10) || 0;
    let s = hm[2] ? parseInt(hm[2], 10) : 0;
    let ampm = p[1] ? p[1].toUpperCase() : "";

    if (h === 12 && ampm === "AM") h = 0;
    if (ampm === "PM" && h < 12) h += 12;

    hoy.setHours(h, m, s, 0);
    inicioMs = hoy.getTime();
  }

  if (!inicioMs) inicioMs = Date.now();
  return inicioMs + 15 * 60 * 1000;
}

window.iniciarTimerCodigosTiempoReal = function () {
  if (window.timerIntervalCodigos) clearInterval(window.timerIntervalCodigos);

  window.timerIntervalCodigos = setInterval(() => {
    const badges = document.querySelectorAll(".badge-vigencia-codigo");
    badges.forEach((badge) => {
      const expMs = parseInt(badge.getAttribute("data-expiracion"), 10);
      if (!expMs) return;

      const diffMs = expMs - Date.now();
      if (diffMs > 0) {
        const mins = Math.floor(diffMs / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        const secsFmt = secs < 10 ? `0${secs}` : secs;

        badge.innerText = `⏳ Quedan ${mins}:${secsFmt} min`;

        if (mins < 3) {
          badge.style.color = "#ff453a";
          badge.style.background = "rgba(255, 69, 58, 0.15)";
          badge.style.borderColor = "rgba(255, 69, 58, 0.3)";
        } else {
          badge.style.color = "#30d158";
          badge.style.background = "rgba(48, 209, 88, 0.15)";
          badge.style.borderColor = "rgba(48, 209, 88, 0.3)";
        }
      } else {
        badge.innerText = "⚠️ Código Expirado";
        badge.style.color = "#ff453a";
        badge.style.background = "rgba(255, 69, 58, 0.15)";
        badge.style.borderColor = "rgba(255, 69, 58, 0.3)";
      }
    });
  }, 1000);
};

window.cargarBandejaCodigosMySQL = function () {
  const contenedor = document.getElementById("codesScrollArea");
  if (!contenedor) return;

  const tieneTarjetas = contenedor.querySelectorAll(".card-ios").length > 0;

  if (!tieneTarjetas) {
    contenedor.innerHTML = `
      <div style="text-align: center; color: var(--ios-orange); padding: 50px 20px;">
        <svg class="spin-anim" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:12px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
        <br><span style="font-weight: 700; font-size: 0.9rem; color: #0a84ff;">Cargando códigos...</span>
      </div>`;
  }

  fetch(URL_OBTENER_CODIGOS_MYSQL)
    .then((res) => res.json())
    .then((res) => renderizarCodigosBandeja(res, contenedor))
    .catch((err) => console.error("Error consultando MySQL inicial:", err));

  fetch(`${URL_APPS_SCRIPT_CODIGOS}?action=sincronizarCodigos`, {
    mode: "no-cors",
  })
    .then(() => fetch(URL_OBTENER_CODIGOS_MYSQL))
    .then((res) => res.json())
    .then((res) => renderizarCodigosBandeja(res, contenedor))
    .catch((err) =>
      console.error("Error en sincronización silenciosa Apps Script:", err),
    );
};

function renderizarCodigosBandeja(res, contenedor) {
  if (res && res.status === "success" && res.data) {
    if (res.data.length === 0) {
      contenedor.innerHTML =
        '<div style="text-align: center; color: var(--text-secondary); padding: 50px 20px; font-weight: 600;">📭 No hay códigos activos en los últimos 15 minutos.</div>';
      return;
    }

    res.data.sort((a, b) => {
      if (a.id && b.id) {
        return parseInt(b.id, 10) - parseInt(a.id, 10);
      }
      if (a.fecha_registro && b.fecha_registro) {
        return (
          new Date(String(b.fecha_registro).replace(" ", "T")) -
          new Date(String(a.fecha_registro).replace(" ", "T"))
        );
      }

      function getMins(t) {
        if (!t) return 0;
        let p = t.trim().split(" ");
        let hm = p[0].split(":");
        let h = parseInt(hm[0], 10);
        let m = parseInt(hm[1], 10);
        let ampm = p[1] ? p[1].toUpperCase() : "";
        if (h === 12) h = 0;
        if (ampm === "PM") h += 12;
        return h * 60 + m;
      }

      let minA = getMins(a.hora);
      let minB = getMins(b.hora);

      if (minA - minB > 720) minB += 1440;
      else if (minB - minA > 720) minA += 1440;

      return minB - minA;
    });

    let html = "";
    res.data.forEach((item) => {
      let safeCopiedText = encodeURIComponent(item.copiadoRapido || "").replace(
        /'/g,
        "%27",
      );

      let searchData =
        `${item.correo} ${item.plataforma} ${item.accion} ${item.codigoLink}`
          .toLowerCase()
          .replace(/"/g, "&quot;");

      let esRestablecer =
        item.accion && item.accion.toLowerCase().includes("restablecer");

      let esEnlaceUrl =
        item.codigoLink &&
        (item.codigoLink.startsWith("http://") ||
          item.codigoLink.startsWith("https://"));
      let codigoMostrar =
        esEnlaceUrl && item.codigoLink.length > 25
          ? item.codigoLink.substring(0, 22) + "..."
          : item.codigoLink;

      const expMs = calcularExpiracionCodigoMs(item);

      let botonHtml = "";
      if (esRestablecer) {
        botonHtml = `
          <button class="btn-ios w-100" onclick="window.open('${item.codigoLink}', '_blank')" style="padding: 12px; background: rgba(229, 9, 20, 0.2); font-weight: 800; font-size: 0.85rem; border-radius: 12px; cursor: pointer; color: #ffffff; border: 1px solid rgba(229, 9, 20, 0.5); display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s ease;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> RESTABLECER CONTRASEÑA
          </button>
        `;
      } else {
        botonHtml = `
          <button class="btn-ios w-100" onclick="window.copiarCodigoConVigencia(this, '${safeCopiedText}', ${expMs})" style="padding: 12px; background: rgba(255,255,255,0.05); font-weight: 800; font-size: 0.85rem; border-radius: 12px; cursor: pointer; color: var(--text-primary); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s ease;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> COPIAR MENSAJE
          </button>
        `;
      }

      html += `
        <div class="card-ios" data-search="${searchData}" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 18px; border-radius: 16px; margin-bottom: 0px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: ${item.colorText}; box-shadow: 0 0 10px ${item.colorText};"></span>
              <span style="color: var(--text-primary); font-weight: 800; font-size: 0.95rem; text-transform: uppercase; letter-spacing: -0.3px;">${item.plataforma}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge-vigencia-codigo" data-expiracion="${expMs}" style="font-size: 0.72rem; font-weight: 800; font-family: monospace; padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(48, 209, 88, 0.3); background: rgba(48, 209, 88, 0.15); color: #30d158;">⏳ Calculando...</span>
              <span style="color: var(--text-secondary); font-size: 0.75rem; font-family: monospace; font-weight: 600;">${item.hora}</span>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; padding: 2px 0;">
            <div style="display: flex; align-items: baseline; gap: 8px;">
              <span style="font-size: 0.78rem; color: var(--text-secondary); min-width: 105px; flex-shrink: 0; text-transform: uppercase; font-weight: 600;">CLIENTE:</span>
              <span style="font-size: 0.88rem; color: var(--text-primary); font-weight: 600; font-family: monospace;">${item.correo}</span>
            </div>
            <div style="display: flex; align-items: baseline; gap: 8px;">
              <span style="font-size: 0.78rem; color: var(--text-secondary); min-width: 105px; flex-shrink: 0; text-transform: uppercase; font-weight: 600;">ACCIÓN:</span>
              <span style="font-size: 0.85rem; color: var(--text-primary); font-weight: 500;">${item.accion}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              <span style="font-size: 0.78rem; color: var(--text-secondary); min-width: 105px; flex-shrink: 0; text-transform: uppercase; font-weight: 600;">CÓDIGO:</span>
              <span style="font-size: 1.15rem; color: ${item.colorText}; font-weight: 800; font-family: monospace; background: rgba(255, 255, 255, 0.03); padding: 4px 14px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.06); letter-spacing: 1px; word-break: break-all;" title="${item.codigoLink}">${codigoMostrar}</span>
            </div>
          </div>
          ${botonHtml}
        </div>
      `;
    });
    contenedor.innerHTML = html;
    window.iniciarTimerCodigosTiempoReal();
  } else {
    contenedor.innerHTML = `<div style="text-align: center; color: var(--ios-red); padding: 20px; font-weight: bold;">Error al obtener los códigos.</div>`;
  }
}

window.copiarCodigoConVigencia = function (btn, textoOriginalEncoded, expMs) {
  const textoOriginal = decodeURIComponent(textoOriginalEncoded);
  const diffMs = expMs - Date.now();
  let tiempoTexto = "";

  if (diffMs > 0) {
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    const secsFmt = secs < 10 ? `0${secs}` : secs;
    tiempoTexto = `\n\n⏳ *Vigencia restante del código:* ${mins}:${secsFmt} min (Válido por 15 minutos desde su emisión)`;
  } else {
    tiempoTexto = `\n\n⚠️ *Nota:* Este código ha superado los 15 minutos de vigencia recomendados.`;
  }

  const textoFinal = textoOriginal + tiempoTexto;
  window.copiarPlantillaDirecta(btn, textoFinal);
};

window.refrescarCodigosModal = function () {
  if (typeof haptic === "function") haptic();
  window.cargarBandejaCodigosMySQL();
};

window.filtrarCodigosInternos = function () {
  const buscador = document.getElementById("searchCodesInput");
  const query = buscador ? buscador.value.toLowerCase().trim() : "";
  const cards = document.querySelectorAll("#codesScrollArea .card-ios");

  cards.forEach((card) => {
    const contenido =
      card.getAttribute("data-search") || card.innerText.toLowerCase();
    card.style.display = contenido.includes(query) ? "flex" : "none";
  });
};

/* ==========================================================================
   👁️ BÓVEDAS (ANA, CHAYO Y PEDAGO) POPUPS DIRECTOS
   ========================================================================== */
window.toggleAnaCodesPanel = function () {
  if (typeof haptic === "function") haptic();
  const width = 1000;
  const height = 800;
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 2;
  window.open(
    "https://correos.tkdjgz.com/",
    "AnaCodesPanel",
    `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`,
  );
};

window.togglePedagoCodesPanel = function () {
  if (typeof haptic === "function") haptic();
  const width = 1000;
  const height = 800;
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 2;
  window.open(
    "https://www.codexgogo.com/",
    "CodexGogoPanel",
    `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`,
  );
};

window.toggleChayoPanel = function () {
  if (typeof haptic === "function") haptic();
  const width = 1000;
  const height = 800;
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 2;
  window.open(
    "https://chayonet.github.io/tienda/",
    "ChayoPanel",
    `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`,
  );
};

/* ==========================================================================
   🟡 YOPMAIL
   ========================================================================== */
window.abrirVentanaYopmail = function () {
  if (typeof haptic === "function") haptic();
  const input = document.getElementById("inputYopmailCorreos");
  if (!input || !input.value.trim()) {
    if (typeof triggerToast === "function")
      triggerToast("⚠️ Ingresa un correo de Yopmail.");
    return;
  }
  let correo = input.value.trim().toLowerCase().replace("@yopmail.com", "");
  window.open(`https://yopmail.com/es/?login=${correo}`, "_blank");
};

window.buscarYopmailDirecto = function (correoPrefix) {
  if (typeof haptic === "function") haptic();
  let correo = correoPrefix.replace("@yopmail.com", "");
  window.open(`https://yopmail.com/es/?login=${correo}`, "_blank");
};

/* ==========================================================================
   🔴 GMAIL GLOBAL
   ========================================================================== */
window.correosGlobalesData = [];

const oldToggleGmailPanel = window.toggleGmailPanel;
window.toggleGmailPanel = function () {
  if (oldToggleGmailPanel) oldToggleGmailPanel();
  const overlay = document.getElementById("gmailOverlay");
  if (overlay && overlay.classList.contains("open")) {
    const input = document.getElementById("inputBuscadorGmailReal");
    if (input) {
      input.value = "";
      setTimeout(() => input.focus(), 150);
    }
    const container = document.getElementById("gmailScrollArea");
    if (container) {
      container.innerHTML = `
        <div style="margin: auto; color: var(--text-secondary); text-align: center; padding: 40px 20px;">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#ea4335" stroke-width="1.8" style="margin-bottom: 12px; opacity: 0.6;">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <br><span style="font-weight: 600; font-size: 0.9rem;">Ingresa un correo arriba para escanear su bandeja</span>
        </div>`;
    }
  }
};

window.ejecutarBusquedaGmailEspecifica = function () {
  if (typeof haptic === "function") haptic();

  const inputVisual = document.getElementById("inputBuscadorGmailReal");
  if (!inputVisual) return;
  const correoBuscar = inputVisual.value.trim();
  const container = document.getElementById("gmailScrollArea");

  if (correoBuscar === "") {
    alert("⚠️ Por favor ingresa el correo completo que deseas buscar.");
    inputVisual.focus();
    return;
  }

  if (container) {
    container.innerHTML = `
      <div style="text-align:center; padding:60px 20px; color:var(--text-secondary); font-size:0.95rem;">
        <svg class="spin-anim" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ea4335" stroke-width="2.5" style="margin-bottom:12px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
        <br><span style="color:#ea4335; font-weight:700;">Escaneando correos de la última hora para: ${correoBuscar}...</span>
      </div>`;
  }

  fetch(
    `https://api.cybernetsp.com/obtener_correos_gmail.php?correo=${encodeURIComponent(correoBuscar)}`,
  )
    .then((res) => res.json())
    .then((res) => {
      if (res && res.status === "success") {
        if (!res.data || res.data.length === 0) {
          if (container)
            container.innerHTML =
              '<div style="text-align:center; padding:60px 20px; color:var(--ios-orange); font-weight:bold; font-size:1rem;">📭 No se encontraron correos nuevos para este destinatario.</div>';
          return;
        }

        window.correosGlobalesData = res.data;
        let htmlTabla = `<table style="width: 100%; border-collapse: collapse; text-align: left;">`;

        res.data.forEach((mail, i) => {
          let remitenteLimpio = mail.remitente
            ? mail.remitente.replace(/<.*?>/g, "").trim()
            : "Desconocido";
          let destinatarioLimpio = mail.destinatario
            ? mail.destinatario.replace(/<.*?>/g, "").trim()
            : correoBuscar;

          htmlTabla += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(234, 67, 53, 0.1)'" onmouseout="this.style.background='transparent'" onclick="window.abrirLectorCorreoGlobal(${i})">
               <td style="padding: 16px 12px; width: 35%; vertical-align: middle;">
                  <div style="color: var(--text-primary); font-weight: 800; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">${remitenteLimpio}</div>
                  <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">Para: <span style="color: var(--ios-blue); font-family: monospace; font-weight: 600;">${destinatarioLimpio}</span></div>
               </td>
               <td style="padding: 16px 12px; width: 50%; vertical-align: middle;">
                  <div style="display: flex; flex-direction: column; gap: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 380px;">
                    <span style="color: var(--text-primary); font-weight: 700; font-size: 0.95rem;">${mail.asunto || "Sin asunto"}</span>
                    <span style="color: var(--text-secondary); font-size: 0.85rem;">${mail.fragmento || ""}</span>
                  </div>
               </td>
               <td style="padding: 16px 12px; width: 15%; text-align: right; vertical-align: middle;">
                  <div style="color: var(--text-secondary); font-size: 0.8rem; font-family: monospace; font-weight: bold;">${mail.fecha || ""}</div>
               </td>
            </tr>`;
        });
        htmlTabla += `</table>`;
        if (container) container.innerHTML = htmlTabla;
        if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");
      } else {
        if (container)
          container.innerHTML = `<div style="color:var(--ios-red); text-align:center; padding:40px; font-weight:700;">Error: ${res ? res.message : "Fallo de comunicación con Google"}</div>`;
      }
    })
    .catch((err) => {
      console.error(err);
      if (container)
        container.innerHTML = `<div style="color:var(--ios-red); text-align:center; padding:40px; font-weight:700;">❌ Error al consultar obtener_correos_gmail.php</div>`;
    });
};

window.abrirLectorCorreoGlobal = function (index) {
  if (typeof haptic === "function") haptic();
  let data = window.correosGlobalesData[index];

  if (data && data.cuerpoHtml) {
    const visorContent = document.getElementById("cuerpoLectorCorreoGlobal");
    const visorModal = document.getElementById("modalLectorCorreoGlobal");
    if (visorContent && visorModal) {
      visorContent.innerHTML = data.cuerpoHtml;
      visorModal.style.display = "flex";
    }
  } else {
    alert("No se pudo extraer el cuerpo de este correo.");
  }
};

window.cerrarLectorCorreoGlobal = function () {
  if (typeof haptic === "function") haptic();
  const visorModal = document.getElementById("modalLectorCorreoGlobal");
  const visorContent = document.getElementById("cuerpoLectorCorreoGlobal");
  if (visorModal) visorModal.style.display = "none";
  if (visorContent) visorContent.innerHTML = "";
};
