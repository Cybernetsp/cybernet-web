/* ==========================================================================
   🛒 CYBERNET OS - MÓDULO DE VENTAS, COTIZADOR Y RENOVACIONES (ventas_combos.js)
   ========================================================================== */

window.stockPlataformasVentas = {};
let contadorFilasVentas = 0;

// =========================================================================
// 📦 CARGA DE STOCK PARA EL PANEL DE VENTAS
// =========================================================================
window.cargarStockParaPanelVentas = function () {
  const formData = new FormData();
  formData.append("accion", "obtener_stock_plataformas");

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success" && data.stock) {
        window.stockPlataformasVentas = data.stock;
        window.actualizarOpcionesStockDropdown();
      }
    })
    .catch((err) => console.error("Error al cargar stock de ventas:", err));
};

window.actualizarOpcionesStockDropdown = function () {
  const selects = document.querySelectorAll(".sel-servicio");
  selects.forEach((select) => {
    const valorSeleccionado = select.value;
    Array.from(select.options).forEach((opt) => {
      const val = opt.value;
      if (val && val !== "RECARGA") {
        const cant =
          window.stockPlataformasVentas[val] !== undefined
            ? window.stockPlataformasVentas[val]
            : 0;
        opt.textContent = `${val} (${cant} libres)`;
      }
    });
    select.value = valorSeleccionado;
  });
};

window.obtenerTextoOptionStock = function (plat) {
  const cant =
    window.stockPlataformasVentas[plat] !== undefined
      ? window.stockPlataformasVentas[plat]
      : 0;
  return `${plat} (${cant} libres)`;
};

// =========================================================================
// 🛒 GESTIÓN DINÁMICA DE FILAS EN EL CARRITO
// =========================================================================
const oldToggleVentasPanel = window.toggleVentasPanel;
window.toggleVentasPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("ventasOverlay");
  if (!overlay) return;

  if (overlay.style.display === "flex" || overlay.classList.contains("open")) {
    overlay.style.display = "none";
    overlay.classList.remove("open");
  } else {
    if (typeof cerrarTodasLasVentanas === "function") cerrarTodasLasVentanas();
    overlay.style.display = "flex";
    overlay.classList.add("open");

    const form = document.getElementById("formRegistrarVentaModal");
    if (form) form.reset();

    const contenedor = document.getElementById("contenedorFilasServicios");
    if (contenedor) contenedor.innerHTML = "";
    contadorFilasVentas = 0;

    window.agregarFilaServicioCombo();
    window.cargarStockParaPanelVentas();
  }
};

window.agregarFilaServicioCombo = function () {
  contadorFilasVentas++;
  const idFila = `filaServicio_${contadorFilasVentas}`;
  const contenedor = document.getElementById("contenedorFilasServicios");

  const getTxt = (plat) => {
    const cant =
      window.stockPlataformasVentas[plat] !== undefined
        ? window.stockPlataformasVentas[plat]
        : 0;
    return `${plat} (${cant} libres)`;
  };

  const div = document.createElement("div");
  div.id = idFila;
  div.style.cssText =
    "display: flex; flex-direction: column; gap: 6px; background: rgba(0, 0, 0, 0.35); padding: 10px; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.08); flex-shrink: 0;";

  div.innerHTML = `
    <div style="display: flex; gap: 6px; align-items: center; width: 100%;">
      <select class="input-ios sel-servicio" onchange="window.alCambiarServicioVenta('${idFila}', this.value)" style="flex: 2; min-width: 0; background: rgba(0, 0, 0, 0.4) !important; padding: 10px; border-radius: 10px; font-size: 0.82rem; color: #ffffff; font-weight: 800; border: 1px solid rgba(255, 255, 255, 0.1); outline: none;" required>
        <option value="" disabled selected>— Elige servicio —</option>
        <option value="RECARGA">💼 Recarga de Saldo</option>
        <option value="NETFLIX">${getTxt("NETFLIX")}</option>
        <option value="DIRECTV GO">${getTxt("DIRECTV GO")}</option>
        <option value="AMAZON">${getTxt("AMAZON")}</option>
        <option value="DISNEY PREMIUM">${getTxt("DISNEY PREMIUM")}</option>
        <option value="DISNEY ESTANDAR">${getTxt("DISNEY ESTANDAR")}</option>
        <option value="HBO MAX">${getTxt("HBO MAX")}</option>
        <option value="CRUNCHYROLL">${getTxt("CRUNCHYROLL")}</option>
        <option value="VIX">${getTxt("VIX")}</option>
        <option value="PLEX">${getTxt("PLEX")}</option>
        <option value="PARAMOUNT">${getTxt("PARAMOUNT")}</option>
        <option value="APPLE TV">${getTxt("APPLE TV")}</option>
        <option value="YOUTUBE">${getTxt("YOUTUBE")}</option>
      </select>

      <select class="input-ios sel-pantallas" style="display: none; flex: 1; min-width: 0; background: rgba(0, 0, 0, 0.4) !important; padding: 10px 6px; border-radius: 10px; font-size: 0.8rem; color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.1); outline: none;">
        <option value="1">1 Pant.</option>
        <option value="2">2 Pant.</option>
        <option value="3">3 Pant.</option>
        <option value="4">4 Pant.</option>
        <option value="5">5 Pant.</option>
      </select>

      <select class="input-ios sel-meses" style="display: none; flex: 1; min-width: 0; background: rgba(0, 0, 0, 0.4) !important; padding: 10px 6px; border-radius: 10px; font-size: 0.8rem; color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.1); outline: none;">
        <option value="1">1 Mes</option>
        <option value="2">2 Meses</option>
        <option value="3">3 Meses</option>
        <option value="4">4 Meses</option>
        <option value="5">5 Meses</option>
      </select>

      <select class="input-ios sel-bono" style="display: none; flex: 1; min-width: 0; background: rgba(0, 0, 0, 0.4) !important; padding: 10px 6px; border-radius: 10px; font-size: 0.8rem; color: #ffd60a; font-weight: 800; border: 1px solid rgba(255, 214, 10, 0.25); outline: none;">
        <option value="0">0% Bono</option>
        <option value="5">5%</option>
        <option value="10">10%</option>
        <option value="15">15%</option>
        <option value="20">20%</option>
        <option value="25">25%</option>
        <option value="30">30%</option>
      </select>

      ${contadorFilasVentas > 1 ? `<button type="button" onclick="document.getElementById('${idFila}').remove()" style="background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.3); color: #ff453a; width: 34px; height: 38px; border-radius: 10px; cursor: pointer; font-weight: 800; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">✕</button>` : ""}
    </div>

    <div class="row-netflix-tipo" style="display: none; width: 100%; gap: 8px; align-items: center;">
      <select class="input-ios sel-tipo-netflix" onchange="window.alCambiarTipoVenta('${idFila}')" style="flex: 1; background: rgba(10, 132, 255, 0.1) !important; padding: 8px 10px; border-radius: 8px; font-size: 0.78rem; color: #0a84ff; font-weight: 800; border: 1px solid rgba(10, 132, 255, 0.25); outline: none;">
        <option value="Nueva">Nueva</option>
        <option value="Renovar">Renovar</option>
      </select>
      <input type="text" class="input-ios input-correo-vta" placeholder="👉 Toca aquí para elegir cuenta" readonly onclick="window.abrirModalRenovacionNet('${idFila}')" style="display: none; flex: 2; background: rgba(10, 132, 255, 0.1) !important; padding: 8px 10px; border-radius: 8px; font-size: 0.78rem; color: #0a84ff; font-weight: 800; border: 1px solid rgba(10, 132, 255, 0.3); cursor: pointer; outline: none;" />
    </div>
  `;

  if (contenedor) {
    contenedor.appendChild(div);
    contenedor.scrollTop = contenedor.scrollHeight;
  }
};

window.alCambiarServicioVenta = function (idFila, valServicio) {
  const fila = document.getElementById(idFila);
  if (!fila) return;

  const selServicio = fila.querySelector(".sel-servicio");
  const selPantallas = fila.querySelector(".sel-pantallas");
  const selMeses = fila.querySelector(".sel-meses");
  const selBono = fila.querySelector(".sel-bono");
  const rowNetflix = fila.querySelector(".row-netflix-tipo");

  if (!valServicio) {
    selServicio.style.flex = "1";
    selPantallas.style.display = "none";
    selMeses.style.display = "none";
    selBono.style.display = "none";
    rowNetflix.style.display = "none";
  } else if (valServicio === "NETFLIX") {
    selServicio.style.flex = "2";
    selPantallas.style.display = "block";
    selMeses.style.display = "block";
    selBono.style.display = "none";
    rowNetflix.style.display = "flex";
  } else if (valServicio === "RECARGA") {
    selServicio.style.flex = "2";
    selPantallas.style.display = "none";
    selMeses.style.display = "none";
    selBono.style.display = "block";
    rowNetflix.style.display = "none";
  } else {
    selServicio.style.flex = "2";
    selPantallas.style.display = "block";
    selMeses.style.display = "block";
    selBono.style.display = "none";
    rowNetflix.style.display = "none";
  }
};

// =========================================================================
// 🔄 RENOVACIONES DE NETFLIX (BÚSQUEDA Y SELECCIÓN)
// =========================================================================
window.buscarHistorialNetflixEnVenta = function (telefono) {
  let telLimpio = String(telefono).replace(/\D/g, "").trim();

  if (telLimpio.length < 6) {
    window.cuentasNetflixClienteActivo = [];
    return;
  }

  clearTimeout(window.timeoutBusquedaNet);
  window.timeoutBusquedaNet = setTimeout(() => {
    const formData = new FormData();
    formData.append("accion", "buscar_renovacion_netflix");
    formData.append("tel", telLimpio);

    fetch("https://api.cybernetsp.com/acciones_mysql.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        window.cuentasNetflixClienteActivo = [];
        if (res && res.status === "success" && res.data.length > 0) {
          window.cuentasNetflixClienteActivo = res.data;
          if (typeof triggerToast === "function")
            triggerToast(
              "✨ ¡Historial de Netflix encontrado para este cliente!",
            );
        }
      })
      .catch((err) => console.error("Error al buscar historial Netflix:", err));
  }, 400);
};

// Listener para el celular en el modal de venta
document.addEventListener("DOMContentLoaded", () => {
  const inputCelular = document.getElementById("vendedorClienteCelular");
  if (inputCelular) {
    inputCelular.addEventListener("input", function () {
      window.buscarHistorialNetflixEnVenta(this.value);
    });
  }
});

window.alCambiarTipoVenta = function (idFila) {
  const fila = document.getElementById(idFila);
  if (!fila) return;

  const selectTipo = fila.querySelector(".sel-tipo-netflix");
  const inputCorreo = fila.querySelector(".input-correo-vta");
  const selPlat = fila.querySelector(".sel-servicio");
  const celInput = document.getElementById("vendedorClienteCelular");
  const telNum = celInput ? celInput.value.replace(/\D/g, "").trim() : "";

  if (selPlat && selPlat.value !== "NETFLIX") {
    if (selectTipo) selectTipo.value = "Nueva";
    if (inputCorreo) {
      inputCorreo.style.display = "none";
      inputCorreo.value = "";
    }
    return;
  }

  if (
    selectTipo &&
    selectTipo.value === "Renovar" &&
    selPlat &&
    selPlat.value === "NETFLIX"
  ) {
    if (!telNum || telNum.length < 6) {
      alert(
        "⚠️ Por favor ingresa primero el número de celular del cliente en la casilla de arriba.",
      );
      selectTipo.value = "Nueva";
      if (inputCorreo) inputCorreo.style.display = "none";
      return;
    }

    if (inputCorreo) {
      inputCorreo.style.display = "block";
      inputCorreo.value = "⏳ Consultando cuentas en MySQL...";
    }

    const formData = new FormData();
    formData.append("accion", "buscar_renovacion_netflix");
    formData.append("tel", telNum);

    fetch("https://api.cybernetsp.com/acciones_mysql.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        if (
          res &&
          res.status === "success" &&
          res.data &&
          res.data.length > 0
        ) {
          window.cuentasNetflixClienteActivo = res.data;
          if (inputCorreo) inputCorreo.value = "";
          window.abrirModalRenovacionNet(idFila);
        } else {
          alert(
            `⚠️ No se encontraron cuentas activas de Netflix registradas previamente para el teléfono ${telNum} en la base de datos.`,
          );
          selectTipo.value = "Nueva";
          if (inputCorreo) {
            inputCorreo.style.display = "none";
            inputCorreo.value = "";
          }
        }
      })
      .catch((err) => {
        alert("❌ Error de comunicación con el servidor.");
        selectTipo.value = "Nueva";
        if (inputCorreo) inputCorreo.style.display = "none";
      });
  } else {
    if (inputCorreo) {
      inputCorreo.style.display = "none";
      inputCorreo.value = "";
    }
    fila.removeAttribute("data-correo-reno");
    fila.removeAttribute("data-perfil-reno");
  }
};

window.abrirModalRenovacionNet = function (idFilaOrigen) {
  if (typeof haptic === "function") haptic();
  const oldModal = document.getElementById("modalRenovacionFlotante");
  if (oldModal) oldModal.remove();

  let listaItemsHtml = "";
  window.cuentasNetflixClienteActivo.forEach((cuenta) => {
    listaItemsHtml += `
      <div class="item-reno-card" onclick="window.seleccionarCuentaModalNet('${cuenta.correo}', '${cuenta.perfil}', '${cuenta.cliente || "Sin Nombre"}', '${idFilaOrigen}')" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); padding: 12px 16px; border-radius: 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;" onmouseover="this.style.background='rgba(10, 132, 255, 0.15)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.03)'" data-search="${(cuenta.correo + " " + cuenta.perfil + " " + (cuenta.cliente || "")).toLowerCase()}">
        <div style="display: flex; flex-direction: column; gap: 4px; text-align: left; overflow: hidden; padding-right: 10px;">
          <span style="color: #ffffff; font-weight: 800; font-size: 0.9rem; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${cuenta.correo}</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="background: rgba(10, 132, 255, 0.15); border: 1px solid rgba(10, 132, 255, 0.3); color: #0a84ff; padding: 2px 8px; border-radius: 6px; font-weight: 800; font-size: 0.68rem; text-transform: uppercase;">PERFIL ${cuenta.perfil}</span>
            <span style="color: #a1a1aa; font-size: 0.75rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">👤 Cliente: <b style="color:#fff;">${cuenta.cliente || "Sin nombre"}</b></span>
          </div>
        </div>
      </div>
    `;
  });

  const modalHtml = `
    <div class="overlay-ios open" id="modalRenovacionFlotante" style="display: flex !important; z-index: 999999 !important; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.82); backdrop-filter: blur(12px); align-items: center; justify-content: center;">
      <div class="modal-ios" style="max-width: 440px; width: 90%; background: #18181b; border: 1px solid rgba(255,255,255,0.12); border-radius: 26px; padding: 22px; display: flex; flex-direction: column; gap: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px;">
          <h3 style="margin: 0; color: #fff; font-size: 1.1rem; font-weight: 800;">Cuentas a renovar</h3>
          <button type="button" onclick="document.getElementById('modalRenovacionFlotante').remove()" style="background: rgba(255,255,255,0.08); border: none; color: #a1a1aa; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;">✕</button>
        </div>
        <input type="text" id="buscadorModalReno" placeholder="Buscar por correo o perfil..." oninput="window.filtrarModalRenovacionNet()" style="width: 100%; background: rgba(0,0,0,0.4) !important; padding: 10px 12px; border-radius: 12px; font-size: 0.85rem; color: #fff; border: 1px solid rgba(255,255,255,0.1); outline: none;">
        <div id="listaCuentasModalReno" style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto;">
          ${listaItemsHtml}
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);
};

window.seleccionarCuentaModalNet = function (
  correo,
  perfil,
  cliente,
  idFilaOrigen,
) {
  if (typeof haptic === "function") haptic();
  const fila = document.getElementById(idFilaOrigen);
  if (fila) {
    fila.setAttribute("data-correo-reno", correo);
    fila.setAttribute("data-perfil-reno", perfil);
    const inputCorreo = fila.querySelector(".input-correo-vta");
    if (inputCorreo) inputCorreo.value = `${correo} | Perfil: ${perfil}`;
  }
  const modal = document.getElementById("modalRenovacionFlotante");
  if (modal) modal.remove();
};

window.filtrarModalRenovacionNet = function () {
  const query = (document.getElementById("buscadorModalReno")?.value || "")
    .toLowerCase()
    .trim();
  document
    .querySelectorAll("#listaCuentasModalReno .item-reno-card")
    .forEach((item) => {
      item.style.display = (item.getAttribute("data-search") || "").includes(
        query,
      )
        ? "flex"
        : "none";
    });
};

// =========================================================================
// 🚀 PROCESADOR DE VENTAS HACIA MYSQL
// =========================================================================
window.verificarNumeroStaffEnVivo = function (numeroIngresado) {
  const numLimpio = String(numeroIngresado).trim();
  const selectBanco = document.getElementById("vendedorMedioPago");
  let optNomina = document.getElementById("optDescontarNomina");

  // Reemplazar window.staffTelefonosList por los reales de tu negocio si los necesitas
  if (
    numLimpio.length >= 7 &&
    (window.staffTelefonosList || []).includes(numLimpio)
  ) {
    if (!optNomina) {
      optNomina = document.createElement("option");
      optNomina.id = "optDescontarNomina";
      optNomina.value = "Descontar de Nómina";
      optNomina.innerText = "Descontar de Nómina";
      selectBanco.appendChild(optNomina);
      if (typeof triggerToast === "function")
        triggerToast(
          "✨ Teléfono de Staff detectado. Opción Nómina habilitada.",
        );
    }
  } else {
    if (optNomina) {
      if (selectBanco.value === "Descontar de Nómina") selectBanco.value = "";
      optNomina.remove();
    }
  }
};

window.ejecutarVentaFinal = function (e) {
  if (e) e.preventDefault();
  try {
    if (typeof haptic === "function") haptic();

    const inputNombre = document.getElementById("vendedorClienteNombre");
    const inputCelular = document.getElementById("vendedorClienteCelular");
    const inputMonto = document.getElementById("vendedorMontoCobrado");
    const selectPago = document.getElementById("vendedorMedioPago");

    if (!inputCelular || !inputMonto || !selectPago) {
      alert("❌ Error: No se encontraron los campos del cliente.");
      return;
    }

    const clienteNombre = inputNombre ? inputNombre.value.trim() : "";
    const clienteCelular = inputCelular.value.trim();
    const montoCobrado = inputMonto.value.trim();
    const medioPago = selectPago.value;

    if (!clienteCelular || !medioPago) {
      alert("⚠️ Por favor completa los campos obligatorios.");
      return;
    }

    const contenedor = document.getElementById("contenedorFilasServicios");
    const filasUI = contenedor.children;
    let servicios = [];
    let resumenConfirmarArray = [];

    for (let i = 0; i < filasUI.length; i++) {
      const fila = filasUI[i];
      const selPlat = fila.querySelector(".sel-servicio");
      if (selPlat && selPlat.value && selPlat.value !== "") {
        const platVal = selPlat.value;
        const selPant = fila.querySelector(".sel-pantallas");
        const selMes = fila.querySelector(".sel-meses");
        const selBono = fila.querySelector(".sel-bono");
        const selTipo = fila.querySelector(".sel-tipo-netflix");

        const numPantallas = selPant ? selPant.value : "1";
        const numMeses = selMes ? selMes.value : "1";
        const tipoServicio = selTipo ? selTipo.value : "Nueva";
        const bonoServicio = selBono ? selBono.value : "0";

        const correoReno = fila.getAttribute("data-correo-reno") || "";
        const perfilReno = fila.getAttribute("data-perfil-reno") || "";

        servicios.push({
          plataforma: platVal,
          pantallas: numPantallas,
          meses: numMeses,
          bono: bonoServicio,
          tipo: tipoServicio,
          correoReno:
            correoReno && perfilReno
              ? `${correoReno} | Perfil: ${perfilReno}`
              : correoReno,
          perfil: perfilReno,
        });

        if (platVal === "RECARGA") {
          resumenConfirmarArray.push(
            `   • Recarga de Saldo (${bonoServicio}% Bono)`,
          );
        } else {
          let txtTipo =
            tipoServicio === "Renovar" && correoReno !== ""
              ? `Reno: ${correoReno}`
              : tipoServicio;
          resumenConfirmarArray.push(
            `   • ${numPantallas}x ${platVal} ➔ [${numMeses} Mes(es) / ${txtTipo}]`,
          );
        }
      }
    }

    if (servicios.length === 0) {
      alert("⚠️ Por favor selecciona al menos un servicio a entregar.");
      return;
    }

    let clienteDisplay =
      clienteNombre && clienteNombre !== "Sin Nombre"
        ? clienteNombre
        : clienteCelular;
    let mensajeConfirmacion = `❓ ¿CONFIRMAR REGISTRO DE VENTA? 🍿\n────────────────────────────\n👤 Cliente / Distribuidor: ${clienteDisplay}\n📞 Celular: ${clienteCelular}\n🏦 Recibe: ${medioPago}\n💰 Valor Cobrado: ${montoCobrado || "$0"}\n\n📺 Cuentas a entregar:\n${resumenConfirmarArray.join("\n")}\n────────────────────────────\n¿Estás seguro de que los datos ingresados son correctos?`;

    if (!confirm(mensajeConfirmacion)) return;

    const btnSubmit = document.getElementById("btnEjecutarVenta");
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right:6px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Procesando Venta...`;
    }

    const formData = new FormData();
    formData.append("accion", "realizar_venta");
    formData.append("cliente_nombre", clienteNombre || "Sin Nombre");
    formData.append("cliente_celular", clienteCelular);
    formData.append("monto_cobrado", montoCobrado || "$0");
    formData.append("medio_pago", medioPago);
    formData.append("servicios_json", JSON.stringify(servicios));

    fetch("https://api.cybernetsp.com/acciones_mysql.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = "Realizar Venta";
        }

        if (data.status === "sin_stock") {
          alert(
            "❌ NO HAY STOCK DISPONIBLE\n\nNo hay cuentas libres en MySQL para la(s) plataforma(s) seleccionada(s).",
          );
          return;
        }

        if (data.status === "success" || data.status === "parcial") {
          if (typeof toggleVentasPanel === "function") toggleVentasPanel();

          let nombreSaludo =
            clienteNombre && clienteNombre !== "Sin Nombre"
              ? " " + clienteNombre
              : "";
          let fichaTexto = `🌟 *¡Hola${nombreSaludo}!*\n\nTu pedido ha sido procesado con éxito. Aquí tienes tus accesos:\n`;

          if (data.entregados && data.entregados.length > 0) {
            data.entregados.forEach((item) => {
              if (item.esRecarga) {
                fichaTexto += `\n💼 *RECARGA DE SALDO* ✅\n────────────────────\n💰 *Monto Inyectado:* ${item.monto}\n🎁 *Bono Aplicado:* ${item.bono}%\n`;
              } else {
                let platFormat = item.plataforma.replace(/_/g, " ");
                let textoMeses =
                  parseInt(item.meses) > 1 ? ` (${item.meses} Meses)` : "";
                fichaTexto += `\n🎬 *DETALLES DE ${platFormat}*${textoMeses} ✅\n────────────────────\n`;
                if (item.plataforma === "NETFLIX")
                  fichaTexto += `⚠️ *Para iniciar sesión:* Cuando te pida un código, selecciona *Obtener ayuda* y después *Usar contraseña*.\n\n`;

                let etiquetaUser =
                  platFormat === "IPTV" || platFormat === "EMBY"
                    ? "Usuario"
                    : "Correo";
                let etiquetaPerfil =
                  platFormat === "IPTV"
                    ? "URL"
                    : platFormat === "EMBY"
                      ? "Servidor"
                      : "Perfil";

                fichaTexto += `👤 *${etiquetaUser}:* ${item.correo}\n🔐 *Contraseña:* ${item.clave}\n`;
                if (item.perfil && item.perfil !== "")
                  fichaTexto += `🌐 *${etiquetaPerfil}:* ${item.perfil}\n`;
                if (item.pin && item.pin !== "")
                  fichaTexto += `📍 *PIN:* ${item.pin}\n`;
                fichaTexto += `📅 *Vence:* ${item.vencimiento}\n`;
              }
            });
          }

          if (data.pendientes && data.pendientes.length > 0) {
            fichaTexto += `\n⚠️ *SERVICIOS PENDIENTES POR SURTIR:*\n`;
            data.pendientes.forEach((p) => {
              fichaTexto += `⏳ ${p} (En breve se te entregará)\n`;
            });
          }
          fichaTexto += `\n📢 *INFORMACIÓN IMPORTANTE:* \n────────────────────\n⚠️ *Garantía activa:* Tu servicio cuenta con respaldo total durante su vigencia. \n🆘 *Soporte:* Si presentas algún inconveniente, *infórmanos de inmediato* para brindarte una solución rápida.\n\n💎 *Disfruta tu servicio.*\n✨ *¡Gracias por elegirnos!* ✨`;

          const btnSaldo = document.getElementById("btnCopiarSaldoRevendedor");
          if (data.esDistribuidor === true) {
            let distriNombre = data.nombreDistribuidor;
            if (
              !distriNombre ||
              distriNombre === "Sin Nombre" ||
              distriNombre.trim() === ""
            )
              distriNombre =
                clienteNombre && clienteNombre !== "Sin Nombre"
                  ? clienteNombre
                  : clienteCelular;

            if (data.esRecarga === true) {
              let textoBono =
                data.bonoAplicado && parseFloat(data.bonoAplicado) > 0
                  ? `\n🎁 *Bono Aplicado:* ${data.bonoAplicado}%`
                  : "";
              window.textoSaldoRevendedorGlobal = `🔔 *NOTIFICACIÓN DE RECARGA DE SALDO CYBERNET* 🚀\n────────────────────\n👤 *Distribuidor:* ${distriNombre}\n📈 *Monto Recargado:* +${data.montoCobrado || montoCobrado}${textoBono}\n💰 *Saldo Disponible:* ${data.saldoNuevo || "$0"}\n────────────────────\n✨ _¡Gracias por recargar tu saldo en Cybernet!_`;
            } else {
              window.textoSaldoRevendedorGlobal = `🔔 *NOTIFICACIÓN DE DÉBITO POR COMPRA CYBERNET* 🚀\n────────────────────\n👤 *Distribuidor:* ${distriNombre}\n📉 *Débito por compra:* -${data.montoCobrado || montoCobrado}\n💰 *Saldo Disponible:* ${data.saldoNuevo || "$0"}\n────────────────────\n✨ _¡Gracias por tu compra mayorista en Cybernet!_`;
            }
            if (btnSaldo)
              btnSaldo.style.setProperty("display", "flex", "important");
          } else {
            window.textoSaldoRevendedorGlobal = "";
            if (btnSaldo)
              btnSaldo.style.setProperty("display", "none", "important");
          }

          const outputArea = document.getElementById("outputTextoVentaFicha");
          const modalGenerado = document.getElementById(
            "ventaGeneradaModalOverlay",
          );
          if (outputArea && modalGenerado) {
            outputArea.value = fichaTexto;
            modalGenerado.style.setProperty("display", "flex", "important");
            modalGenerado.classList.add("open");
          }

          if (typeof cargarDatosMySQL === "function") cargarDatosMySQL();
        } else {
          alert(
            "❌ Error: " + (data.message || "No se pudo procesar la venta."),
          );
        }
      })
      .catch((err) => {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = "Realizar Venta";
        }
        console.error(err);
        alert("❌ Error de comunicación: " + err.message);
      });
  } catch (errorCapturado) {
    console.error("Error en ejecutarVentaFinal:", errorCapturado);
    alert("❌ Error interno: " + errorCapturado.message);
  }
};

window.copiarTextoFichaVentaDefinitiva = function () {
  if (typeof haptic === "function") haptic();
  const area = document.getElementById("outputTextoVentaFicha");
  const btn = document.getElementById("btnCopiarFichaVenta");
  if (!area) return;

  navigator.clipboard.writeText(area.value).then(() => {
    if (btn) {
      const oldHtml = btn.innerHTML;
      btn.innerHTML = `✅ ¡Ficha Copiada!`;
      btn.style.background = "#30d158";
      btn.style.color = "#ffffff";
      setTimeout(() => {
        btn.innerHTML = oldHtml;
        btn.style.background = "#ffffff";
        btn.style.color = "#000000";
      }, 1500);
    }
    if (typeof triggerToast === "function")
      triggerToast(`📋 Ficha copiada al portapapeles`);
  });
};

window.copiarTextoSaldoRevendedorDefinitiva = function () {
  if (typeof haptic === "function") haptic();
  const btn = document.getElementById("btnCopiarSaldoRevendedor");
  const textoSaldo = window.textoSaldoRevendedorGlobal || "";
  if (!textoSaldo) return;

  navigator.clipboard.writeText(textoSaldo).then(() => {
    if (btn) {
      const oldHtml = btn.innerHTML;
      btn.innerHTML = `✅ ¡Reporte Copiado!`;
      btn.style.background = "#30d158";
      setTimeout(() => {
        btn.innerHTML = oldHtml;
        btn.style.background = "#ff9f0a";
      }, 1500);
    }
    if (typeof triggerToast === "function")
      triggerToast(`📋 Reporte de saldo copiado`);
  });
};

window.cerrarModalVentaGenerada = function () {
  if (typeof haptic === "function") haptic();
  const modal = document.getElementById("ventaGeneradaModalOverlay");
  if (modal) {
    modal.classList.remove("open");
    modal.style.display = "none";
  }
};

// =========================================================================
// 🧮 COTIZADOR INTELIGENTE (ALGORITMO MAX-BASE)
// =========================================================================
const oldAbrirCalculadoraCombos = window.abrirCalculadoraCombos;
window.abrirCalculadoraCombos = function () {
  if (oldAbrirCalculadoraCombos) oldAbrirCalculadoraCombos();
  if (typeof haptic === "function") haptic();

  const container = document.getElementById("contenedorPlataformasCotizador");

  // INYECTAR IPTV SI NO EXISTE
  if (container && !document.querySelector('.chk-cotizar-plat[value="IPTV"]')) {
    const iptvRow = document.createElement("div");
    iptvRow.className = "row-cotizar-plat";
    iptvRow.setAttribute("data-nombre", "iptv smarters");
    iptvRow.style.cssText =
      "border-bottom: 0.5px solid rgba(255, 255, 255, 0.06);";
    iptvRow.innerHTML = `
      <label style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; cursor: pointer; width: 100%; box-sizing: border-box;">
          <span style="font-size: 0.9rem; font-weight: 600; color: #30d158">IPTV Smarters ($7k)</span>
          <input type="checkbox" class="chk-cotizar-plat" value="IPTV" data-tipo="herramienta" onchange="window.controlarDisneyMutuo(this); window.calcularPreciosSistemaCotizador();" style="accent-color: #0a84ff; width: 18px; height: 18px; cursor: pointer;" />
      </label>
    `;
    container.appendChild(iptvRow);
  }

  // INYECTAR DIRECTV GO SI NO EXISTE
  if (
    container &&
    !document.querySelector('.chk-cotizar-plat[value="DIRECTV-GO"]')
  ) {
    const dgoRow = document.createElement("div");
    dgoRow.className = "row-cotizar-plat";
    dgoRow.setAttribute("data-nombre", "directv go dgo");
    dgoRow.style.cssText =
      "border-bottom: 0.5px solid rgba(255, 255, 255, 0.06);";
    dgoRow.innerHTML = `
      <label style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; cursor: pointer; width: 100%; box-sizing: border-box;">
          <span style="font-size: 0.9rem; font-weight: 600; color: #00bfff">Directv Go ($30k)</span>
          <input type="checkbox" class="chk-cotizar-plat" value="DIRECTV-GO" data-tipo="herramienta" onchange="window.controlarDisneyMutuo(this); window.calcularPreciosSistemaCotizador();" style="accent-color: #0a84ff; width: 18px; height: 18px; cursor: pointer;" />
      </label>
    `;
    container.appendChild(dgoRow);
  }

  document.querySelectorAll(".row-cotizar-plat label span").forEach((span) => {
    if (span.innerText.includes("Spotify")) span.innerText = "Spotify ($14k)";
    if (span.innerText.includes("Deezer")) span.innerText = "Deezer ($12k)";
    if (span.innerText.includes("Metegol")) span.innerText = "Metegol ($15k)";
    if (span.innerText.includes("YouTube"))
      span.innerText = "YouTube Premium ($14k)";
  });

  document.querySelectorAll(".row-cotizar-plat").forEach((row) => {
    if (!row.querySelector(".cotizador-pantallas-wrapper")) {
      let wrapper = document.createElement("div");
      wrapper.className = "cotizador-pantallas-wrapper";
      wrapper.style.display = "none";
      wrapper.style.padding = "0 14px 12px 14px";
      wrapper.style.justifyContent = "flex-end";
      wrapper.innerHTML = `
        <select class="input-ios sel-pantallas-cotizador" style="width: auto; padding: 6px 12px; font-size: 0.8rem; margin:0; border-radius: 8px; background: rgba(0,0,0,0.4); color: #ffffff; border: 1px solid rgba(255,255,255,0.1); outline: none;" onchange="window.calcularPreciosSistemaCotizador()">
            <option value="1">1 Pantalla</option>
            <option value="2">2 Pantallas</option>
            <option value="3">3 Pantallas</option>
            <option value="4">4 Pantallas</option>
            <option value="5">5 Pantallas (Cuenta Completa)</option>
        </select>
      `;
      row.appendChild(wrapper);
    }
  });

  document.querySelectorAll(".chk-cotizar-plat").forEach((cb) => {
    cb.checked = false;
    window.controlarDisneyMutuo(cb);
  });

  document.getElementById("buscarPlataformaCotizador").value = "";
  document.getElementById("calcMonths").value = "1";
  document.getElementById("calcFidelidad").checked = false;
  document.getElementById("calcBasePriceDisplay").value = "$0";
  document.getElementById("calcSubtotal").innerText = "$0";
  document.getElementById("calcDiscount").innerText = "-$0";
  document.getElementById("rowCalcDescFiel").style.display = "none";
  document.getElementById("calcTotal").innerText = "$0";

  window.filtrarPlataformasCotizador();

  const overlay = document.getElementById("comboCalcOverlay");
  if (overlay) {
    overlay.style.display = "flex";
    overlay.classList.add("open");
  }

  setTimeout(() => {
    const inputBusqueda = document.getElementById("buscarPlataformaCotizador");
    if (inputBusqueda) inputBusqueda.focus();
  }, 120);
};

window.cerrarCalculadoraCombos = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("comboCalcOverlay");
  if (overlay) {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  }
};

window.controlarDisneyMutuo = function (checkbox) {
  const tipo = checkbox.getAttribute("data-tipo");
  if (checkbox.checked) {
    if (tipo === "disneypre") {
      const de = document.querySelector(
        '.chk-cotizar-plat[data-tipo="disneyest"]',
      );
      if (de && de.checked) {
        de.checked = false;
        window.controlarDisneyMutuo(de);
      }
    } else if (tipo === "disneyest") {
      const dp = document.querySelector(
        '.chk-cotizar-plat[data-tipo="disneypre"]',
      );
      if (dp && dp.checked) {
        dp.checked = false;
        window.controlarDisneyMutuo(dp);
      }
    }
  }

  const row = checkbox.closest(".row-cotizar-plat");
  if (row) {
    let selectWrapper = row.querySelector(".cotizador-pantallas-wrapper");
    if (selectWrapper) {
      selectWrapper.style.display = checkbox.checked ? "flex" : "none";
      if (!checkbox.checked) {
        selectWrapper.querySelector("select").value = "1";
      }
    }
  }
};

window.filtrarPlataformasCotizador = function () {
  const query = document
    .getElementById("buscarPlataformaCotizador")
    .value.toLowerCase()
    .trim();
  document
    .querySelectorAll("#contenedorPlataformasCotizador .row-cotizar-plat")
    .forEach((fila) => {
      const nombrePlat = fila.getAttribute("data-nombre") || "";
      const checkbox = fila.querySelector('input[type="checkbox"]');

      if (query === "") {
        fila.style.display = checkbox && checkbox.checked ? "block" : "none";
      } else {
        if (nombrePlat.includes(query) || (checkbox && checkbox.checked)) {
          fila.style.display = "block";
        } else {
          fila.style.display = "none";
        }
      }
    });
};

window.calcularPreciosSistemaCotizador = function () {
  const mapValores = {
    "DISNEY-PREMIUM": { indiv: 15000, combo: 10000, isTier: false },
    "Amazon Prime": { indiv: 10500, combo: 5000, isTier: true },
    "Disney Estándar": { indiv: 8500, combo: 4000, isTier: true },
    Max: { id: "MAX", indiv: 8500, combo: 3000, isTier: true },
    "Apple TV": { indiv: 8500, combo: 3000, isTier: true },
    Crunchyroll: { indiv: 8500, combo: 3000, isTier: true },
    Plex: { indiv: 8500, combo: 3000, isTier: true },
    "Universal+": { indiv: 8500, combo: 3000, isTier: true },
    Vix: { indiv: 8500, combo: 3000, isTier: true },
    "DIRECTV-GO": { indiv: 30000, combo: 25000, isTier: false },
    "Paramount+": { indiv: 15000, combo: 13000, isTier: false },
    Metegol: { indiv: 15000, combo: 12000, isTier: false },
    Spotify: { indiv: 14000, combo: 10000, isTier: false },
    "YouTube Premium": { indiv: 14000, combo: 14000, isTier: false },
    Deezer: { indiv: 12000, combo: 8000, isTier: false },
    "Canva Pro": { indiv: 20000, combo: 20000, isTier: false },
    IPTV: { indiv: 7000, combo: 7000, isTier: false },
  };

  let precioBaseUnMes = 0;
  let tieneNetflix = false;
  let costoNetflixCalculado = 0;

  let allOtherScreens = [];
  let countDisneyPremium = 0;
  let countTierEligible = 0;
  let arrayAddonsDirectosYExtras = [];

  document.querySelectorAll(".row-cotizar-plat").forEach((row) => {
    const cb = row.querySelector(".chk-cotizar-plat");
    if (cb && cb.checked) {
      const val = cb.value;
      const selectPantallas = row.querySelector(".sel-pantallas-cotizador");
      const pantallas = selectPantallas
        ? parseInt(selectPantallas.value) || 1
        : 1;

      if (val === "NETFLIX") {
        tieneNetflix = true;
        if (pantallas === 1) costoNetflixCalculado = 15000;
        else if (pantallas === 2) costoNetflixCalculado = 27000;
        else if (pantallas === 3) costoNetflixCalculado = 37000;
        else if (pantallas === 4) costoNetflixCalculado = 47000;
        else if (pantallas >= 5) costoNetflixCalculado = 56000;
      } else {
        if (mapValores[val]) {
          for (let i = 0; i < pantallas; i++) allOtherScreens.push(val);
          if (val === "DISNEY-PREMIUM") {
            countDisneyPremium += pantallas;
          } else if (mapValores[val].isTier) {
            countTierEligible++;
            for (let i = 1; i < pantallas; i++)
              arrayAddonsDirectosYExtras.push(val);
          } else {
            for (let i = 0; i < pantallas; i++)
              arrayAddonsDirectosYExtras.push(val);
          }
        }
      }
    }
  });

  if (tieneNetflix) {
    precioBaseUnMes = costoNetflixCalculado;
    if (countDisneyPremium > 0) {
      if (countTierEligible === 0) precioBaseUnMes += 10500;
      else if (countTierEligible === 1) precioBaseUnMes += 14500;
      else if (countTierEligible === 2) precioBaseUnMes += 17500;
      else if (countTierEligible >= 3)
        precioBaseUnMes += 20500 + (countTierEligible - 3) * 3000;
      precioBaseUnMes +=
        (countDisneyPremium - 1) * mapValores["DISNEY-PREMIUM"].combo;
    } else {
      if (countTierEligible === 0) precioBaseUnMes += 0;
      else if (countTierEligible === 1) precioBaseUnMes += 5500;
      else if (countTierEligible === 2) precioBaseUnMes += 9500;
      else if (countTierEligible >= 3)
        precioBaseUnMes += 12500 + (countTierEligible - 3) * 3000;
    }

    arrayAddonsDirectosYExtras.forEach((plat) => {
      precioBaseUnMes += mapValores[plat].combo;
    });
  } else {
    if (allOtherScreens.length === 0) {
      precioBaseUnMes = 0;
    } else if (allOtherScreens.length === 1) {
      precioBaseUnMes = mapValores[allOtherScreens[0]].indiv;
    } else {
      allOtherScreens.sort((a, b) => mapValores[b].indiv - mapValores[a].indiv);
      let masCaro = allOtherScreens.shift();
      precioBaseUnMes += mapValores[masCaro].indiv;
      allOtherScreens.forEach((plat) => {
        precioBaseUnMes += mapValores[plat].combo;
      });
    }
  }

  const monthSelect = document.getElementById("calcMonths");
  const meses = parseFloat(monthSelect.value) || 1;
  const porcDesc =
    parseFloat(
      monthSelect.options[monthSelect.selectedIndex].getAttribute("data-desc"),
    ) || 0;

  const subtotal = precioBaseUnMes * meses;
  const montoDescuento = subtotal * (porcDesc / 100);

  const esClienteFiel = document.getElementById("calcFidelidad").checked;
  let descuentoFielTotal =
    esClienteFiel && precioBaseUnMes > 0 ? 1000 * meses : 0;

  if (descuentoFielTotal > 0) {
    document.getElementById("rowCalcDescFiel").style.display = "flex";
    document.getElementById("calcDiscountFiel").innerText =
      "-$" + descuentoFielTotal.toLocaleString("es-CO");
  } else {
    document.getElementById("rowCalcDescFiel").style.display = "none";
  }

  let totalA_Cobrar = subtotal - montoDescuento - descuentoFielTotal;
  if (totalA_Cobrar < 0) totalA_Cobrar = 0;

  document.getElementById("calcBasePriceDisplay").value =
    "$" + precioBaseUnMes.toLocaleString("es-CO");
  document.getElementById("calcSubtotal").innerText =
    "$" + subtotal.toLocaleString("es-CO");
  document.getElementById("calcDiscount").innerText =
    "-$" + montoDescuento.toLocaleString("es-CO");
  document.getElementById("calcTotal").innerText =
    "$" + totalA_Cobrar.toLocaleString("es-CO");
};

window.copiarCotizacionCombo = function (btn) {
  if (typeof haptic === "function") haptic();

  let plataformasSeleccionadas = [];
  document.querySelectorAll(".row-cotizar-plat").forEach((row) => {
    const cb = row.querySelector(".chk-cotizar-plat");
    if (cb && cb.checked) {
      const selectPantallas = row.querySelector(".sel-pantallas-cotizador");
      const pantallas = selectPantallas
        ? parseInt(selectPantallas.value) || 1
        : 1;
      let textoPantallas = "";
      if (pantallas > 1) {
        textoPantallas =
          pantallas >= 5 && cb.value === "NETFLIX"
            ? " (Cuenta Completa)"
            : ` (${pantallas} Pantallas)`;
      }
      plataformasSeleccionadas.push(
        `   • 📺 *${cb.value.toUpperCase()}*${textoPantallas}`,
      );
    }
  });

  if (plataformasSeleccionadas.length === 0) {
    alert("Selecciona al menos una plataforma para armar el mensaje.");
    return;
  }

  const monthSelect = document.getElementById("calcMonths");
  const meses = monthSelect.value;
  const porcDesc =
    monthSelect.options[monthSelect.selectedIndex].getAttribute("data-desc");
  const esClienteFiel = document.getElementById("calcFidelidad").checked;

  const subtotalText = document.getElementById("calcSubtotal").innerText;
  const discountText = document.getElementById("calcDiscount").innerText;
  const totalText = document.getElementById("calcTotal").innerText;

  let listaPlatFormateada = plataformasSeleccionadas.join("\n");
  let mensajeVIP = `💻 *¡TU COMBO STREAMING CYBERNET ESTÁ LISTO!* 🚀📺\n\n🔥 *Servicios Incluidos:*\n${listaPlatFormateada}\n\n🗓️ *Vigencia contratada:* ${meses} Mes(es) Garantizados\n`;

  if (parseInt(meses) > 1 || esClienteFiel) {
    mensajeVIP += `\n💵 Valor Comercial: ${subtotalText}\n`;
    if (parseInt(meses) > 1) {
      mensajeVIP += `🎁 *Descuento Especial (${porcDesc}%):* ${discountText}\n`;
    }
    if (esClienteFiel) {
      let descFielAcumulado = 1000 * parseInt(meses);
      mensajeVIP += `✨ *Descuento Cliente Fiel:* -$${descFielAcumulado.toLocaleString("es-CO")} _(¡Por tu lealtad con la casa!)_\n`;
    }
    mensajeVIP += `───────────────────────\n💰 *TOTAL NETO A PAGAR: ${totalText}* 🔥✨\n`;
  } else {
    mensajeVIP += `───────────────────────\n💰 *TOTAL A PAGAR: ${totalText}* 🔥🍿\n`;
  }

  mensajeVIP += `\n\n¿Te agrada la oferta para enviarte los medios de pago y activarte de inmediato? ⚡🍿`;

  navigator.clipboard.writeText(mensajeVIP).then(() => {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡Ficha Copiada!`;
    btn.style.setProperty("background", "#30d158", "important");
    btn.style.setProperty("color", "#000000", "important");

    if (typeof triggerToast === "function")
      triggerToast(`📋 Cotización copiada al portapapeles.`);

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.setProperty("background", "#30d158", "important");
      btn.style.setProperty("color", "#000000", "important");
      window.cerrarCalculadoraCombos();
    }, 1500);
  });
};
