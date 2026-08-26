/* ==========================================================================
   🛒 CYBERNET OS - MÓDULO DE VENTAS, COTIZADOR Y RENOVACIONES (ventas_combos.js)
   ========================================================================== */

window.stockPlataformasVentas = {};
window.preciosCotizadorCache = window.preciosCotizadorCache || {};
let contadorFilasVentas = 0;

// =========================================================================
// 🔄 SINCRONIZACIÓN DE PRECIOS DESDE MYSQL PARA EL COTIZADOR
// =========================================================================
window.sincronizarPreciosCotizador = function () {
  const formData = new FormData();
  formData.append("accion", "obtener");
  formData.append("tipo", "clientes");

  fetch("https://api.cybernetsp.com/api_precios.php", {
    method: "POST",
    body: formData,
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "success" && Array.isArray(data.data)) {
        data.data.forEach((item) => {
          window.preciosCotizadorCache[item.codigo] =
            Math.round(parseFloat(item.precio)) || 0;
        });
        window.calcularPreciosSistemaCotizador();
      }
    })
    .catch((err) =>
      console.error("Error al sincronizar precios del cotizador:", err),
    );
};

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
      if (val && val !== "RECARGA" && val !== "NETFLIX INTERNACIONAL") {
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
  if (plat === "NETFLIX INTERNACIONAL") return "NETFLIX INTERNACIONAL";
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

    window.asegurarModalNetflixInternacional();
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
        <option value="NETFLIX INTERNACIONAL">NETFLIX INTERNACIONAL</option>
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
        <option value="SPOTIFY">${getTxt("SPOTIFY")}</option>
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
  const selTipo = fila.querySelector(".sel-tipo-netflix");
  const inputCorreo = fila.querySelector(".input-correo-vta");

  fila.removeAttribute("data-correo-reno");
  fila.removeAttribute("data-perfil-reno");
  fila.removeAttribute("data-clave-int");
  fila.removeAttribute("data-pin-int");

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
    if (selTipo) {
      selTipo.style.display = "block";
      selTipo.innerHTML = `<option value="Nueva">Nueva</option><option value="Renovar">Renovar</option>`;
      selTipo.value = "Nueva";
    }
    if (inputCorreo) {
      inputCorreo.style.display = "none";
      inputCorreo.value = "";
      inputCorreo.onclick = function () {
        window.abrirModalRenovacionNet(idFila);
      };
      inputCorreo.style.background = "rgba(10, 132, 255, 0.1)";
      inputCorreo.style.borderColor = "rgba(10, 132, 255, 0.3)";
      inputCorreo.style.color = "#0a84ff";
    }
  } else if (valServicio === "NETFLIX INTERNACIONAL") {
    selServicio.style.flex = "2";

    selPantallas.style.display = "none";
    selPantallas.value = "1";
    selMeses.style.display = "none";
    selMeses.value = "1";

    selBono.style.display = "none";
    rowNetflix.style.display = "flex";

    if (selTipo) selTipo.style.display = "none";
    if (inputCorreo) {
      inputCorreo.style.display = "block";
      inputCorreo.style.flex = "1";
      inputCorreo.value = "👉 Toca para ingresar datos";
      inputCorreo.onclick = function () {
        window.abrirModalInternacionalNet(idFila);
      };
      inputCorreo.style.background = "rgba(10, 132, 255, 0.1)";
      inputCorreo.style.borderColor = "rgba(10, 132, 255, 0.3)";
      inputCorreo.style.color = "#0a84ff";
    }
    window.abrirModalInternacionalNet(idFila);
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
// 🌐 CREACIÓN Y GUARDADO DE NETFLIX INTERNACIONAL
// =========================================================================
window.asegurarModalNetflixInternacional = function () {
  if (!document.getElementById("modalNetflixIntOverlay")) {
    const modalHtml = `
      <div class="overlay-ios" id="modalNetflixIntOverlay" style="display: none; z-index: 999999; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); align-items: center; justify-content: center;">
          <div class="modal-ios" style="max-width: 400px; width: 92%; background: #141418; border: 1px solid rgba(10,132,255,0.3); border-radius: 24px; padding: 24px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 30px 70px rgba(0,0,0,0.9);">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px;">
                  <h3 style="margin: 0; color: #fff; font-size: 1.1rem; font-weight: 800; display:flex; align-items:center; gap:8px;">
                      <span style="background:rgba(10,132,255,0.15); color:#0a84ff; padding:6px; border-radius:10px;">🌐</span>
                      Netflix Internacional
                  </h3>
              </div>
              <p style="color: #a1a1aa; font-size: 0.85rem; margin: 0;">Ingresa los datos de la cuenta internacional. Se registrará en la base de datos y luego se le asignará el cliente en la venta.</p>
              <input type="hidden" id="intFilaDestino" />
              <input type="email" id="intCorreo" class="input-ios" placeholder="Correo de la cuenta..." style="width:100%; background:rgba(0,0,0,0.4) !important; padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.1) !important; color:#fff !important; outline:none;" />
              <input type="text" id="intClave" class="input-ios" placeholder="Contraseña..." style="width:100%; background:rgba(0,0,0,0.4) !important; padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.1) !important; color:#fff !important; outline:none;" />
              <div style="display:flex; gap:10px;">
                  <input type="text" id="intPerfil" class="input-ios" placeholder="Perfil (Ej: 1 o Nombre)" style="flex:1; background:rgba(0,0,0,0.4) !important; padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.1) !important; color:#fff !important; outline:none;" />
                  <input type="text" id="intPin" class="input-ios" placeholder="PIN (Opcional)" style="flex:1; background:rgba(0,0,0,0.4) !important; padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.1) !important; color:#fff !important; outline:none;" />
              </div>
              <div style="display:flex; gap:10px; margin-top:8px;">
                  <button class="btn-ios" onclick="cerrarModalInternacional()" style="flex:1; background:rgba(255,255,255,0.1); padding:12px; border-radius:12px; color:#fff; font-weight:700; border:none; cursor:pointer;">Cancelar</button>
                  <button id="btnGuardarInt" class="btn-ios" onclick="guardarCuentaInternacional()" style="flex:1; background:#0a84ff; padding:12px; border-radius:12px; color:#fff; font-weight:800; border:none; cursor:pointer;">Continuar</button>
              </div>
          </div>
      </div>`;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
  }
};

window.abrirModalInternacionalNet = function (idFila) {
  if (typeof haptic === "function") haptic();
  window.asegurarModalNetflixInternacional();

  const fila = document.getElementById(idFila);
  const correoPrevio = fila ? fila.getAttribute("data-correo-reno") : "";

  document.getElementById("intFilaDestino").value = idFila;
  document.getElementById("intCorreo").value = correoPrevio || "";
  document.getElementById("intClave").value = fila
    ? fila.getAttribute("data-clave-int") || ""
    : "";
  document.getElementById("intPerfil").value = fila
    ? fila.getAttribute("data-perfil-reno") || ""
    : "";
  document.getElementById("intPin").value = fila
    ? fila.getAttribute("data-pin-int") || ""
    : "";

  const modal = document.getElementById("modalNetflixIntOverlay");
  modal.style.display = "flex";
};

window.cerrarModalInternacional = function () {
  if (typeof haptic === "function") haptic();
  const modal = document.getElementById("modalNetflixIntOverlay");
  if (modal) modal.style.display = "none";

  const idFila = document.getElementById("intFilaDestino").value;
  const fila = document.getElementById(idFila);
  if (fila && !fila.getAttribute("data-correo-reno")) {
    const selPlat = fila.querySelector(".sel-servicio");
    if (selPlat) selPlat.value = "";
    window.alCambiarServicioVenta(idFila, "");
  }
};

window.guardarCuentaInternacional = function () {
  if (typeof haptic === "function") haptic();
  const correo = document.getElementById("intCorreo").value.trim();
  const clave = document.getElementById("intClave").value.trim();
  const perfil = document.getElementById("intPerfil").value.trim();
  const pin = document.getElementById("intPin").value.trim();
  const idFila = document.getElementById("intFilaDestino").value;

  if (!correo || !clave || !perfil) {
    alert(
      "⚠️ Correo, Clave y Perfil son obligatorios para registrarla en MySQL.",
    );
    return;
  }

  const btn = document.getElementById("btnGuardarInt");
  const oldText = btn.innerText;
  btn.disabled = true;
  btn.innerHTML = "⏳ Conectando...";

  const formData = new FormData();
  formData.append("accion", "guardar_internacional");
  formData.append("correo", correo);
  formData.append("clave", clave);
  formData.append("perfil", perfil);
  formData.append("pin", pin);

  let dateFact = new Date();
  dateFact.setDate(dateFact.getDate() + 30);
  const mesesLong = [
    "",
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];
  let vencStr = dateFact.getDate() + "DE" + mesesLong[dateFact.getMonth() + 1];
  formData.append("vencimiento", vencStr);

  fetch("https://api.cybernetsp.com/guardar_netflix.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      btn.disabled = false;
      btn.innerHTML = oldText;

      if (data.status === "success") {
        const fila = document.getElementById(idFila);
        if (fila) {
          fila.setAttribute("data-correo-reno", correo);
          fila.setAttribute("data-perfil-reno", perfil);
          fila.setAttribute("data-clave-int", clave);
          fila.setAttribute("data-pin-int", pin);

          const selTipo = fila.querySelector(".sel-tipo-netflix");
          if (selTipo) {
            selTipo.innerHTML = `<option value="Internacional">Internacional</option>`;
            selTipo.value = "Internacional";
          }

          const inputCorreoUi = fila.querySelector(".input-correo-vta");
          if (inputCorreoUi) {
            inputCorreoUi.value = `${correo} | Perfil: ${perfil}`;
            inputCorreoUi.style.background = "rgba(48, 209, 88, 0.1)";
            inputCorreoUi.style.borderColor = "rgba(48, 209, 88, 0.3)";
            inputCorreoUi.style.color = "#30d158";
          }
        }

        document.getElementById("modalNetflixIntOverlay").style.display =
          "none";
        if (typeof triggerToast === "function")
          triggerToast("✅ Cuenta almacenada en MySQL y lista para venta.");
      } else {
        alert("❌ " + data.message);
      }
    })
    .catch((err) => {
      console.error(err);
      btn.disabled = false;
      btn.innerHTML = oldText;
      alert("❌ Error de red al intentar inyectar la cuenta en MySQL.");
    });
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

// =========================================================================
// 💼 VERIFICACIÓN EN VIVO DE CELULAR TRABAJADOR / STAFF
// =========================================================================
window.verificarCelularTrabajadorVenta = function (inputCelular) {
  const num = String(inputCelular.value || "")
    .replace(/\D/g, "")
    .trim();
  const selectMedioPago = document.getElementById("vendedorMedioPago");
  if (!selectMedioPago) return;

  let optNomina = document.getElementById("optDescontarNomina");

  if (num.length < 7) {
    if (optNomina) {
      if (selectMedioPago.value === "Descontar de Nómina")
        selectMedioPago.value = "";
      optNomina.remove();
    }
    return;
  }

  clearTimeout(window.timeoutCheckTrabajador);
  window.timeoutCheckTrabajador = setTimeout(() => {
    fetch(
      `https://api.cybernetsp.com/acciones_mysql.php?accion=verificar_trabajador&celular=${encodeURIComponent(num)}`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "success" && data.esTrabajador) {
          if (!optNomina) {
            optNomina = document.createElement("option");
            optNomina.id = "optDescontarNomina";
            optNomina.value = "Descontar de Nómina";
            optNomina.innerText = `💼 Descontar de Nómina (${data.nombre})`;
            selectMedioPago.appendChild(optNomina);
          } else {
            optNomina.innerText = `💼 Descontar de Nómina (${data.nombre})`;
          }
          if (typeof triggerToast === "function") {
            triggerToast(`💼 Trabajador detectado: <b>${data.nombre}</b>`);
          }
        } else {
          if (optNomina) {
            if (selectMedioPago.value === "Descontar de Nómina")
              selectMedioPago.value = "";
            optNomina.remove();
          }
        }
      })
      .catch((err) =>
        console.error("Error al verificar celular de trabajador:", err),
      );
  }, 350);
};

document.addEventListener("DOMContentLoaded", () => {
  const inputCelular = document.getElementById("vendedorClienteCelular");
  if (inputCelular) {
    inputCelular.addEventListener("input", function () {
      window.buscarHistorialNetflixEnVenta(this.value);
      window.verificarCelularTrabajadorVenta(this);
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
    if (selectTipo && selPlat.value !== "NETFLIX INTERNACIONAL")
      selectTipo.value = "Nueva";
    if (inputCorreo && selPlat.value !== "NETFLIX INTERNACIONAL") {
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
    if (inputCorreo) {
      inputCorreo.value = `${correo} | Perfil: ${perfil}`;
      inputCorreo.style.background = "rgba(10, 132, 255, 0.1)";
      inputCorreo.style.borderColor = "rgba(10, 132, 255, 0.3)";
      inputCorreo.style.color = "#0a84ff";
    }
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
window.ejecutarVentaFinal = function (e, permitirSeparados = false) {
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

        const claveInt = fila.getAttribute("data-clave-int") || "";
        const pinInt = fila.getAttribute("data-pin-int") || "";

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
          claveInt: claveInt,
          pinInt: pinInt,
        });

        if (platVal === "RECARGA") {
          resumenConfirmarArray.push(
            `    • Recarga de Saldo (${bonoServicio}% Bono)`,
          );
        } else {
          let txtTipo =
            (tipoServicio === "Renovar" || tipoServicio === "Internacional") &&
            correoReno !== ""
              ? `Reno: ${correoReno}`
              : tipoServicio;
          resumenConfirmarArray.push(
            `    • ${numPantallas}x ${platVal} ➔ [${numMeses} Mes(es) / ${txtTipo}]`,
          );
        }
      }
    }

    if (servicios.length === 0) {
      alert("⚠️ Por favor selecciona al menos un servicio a entregar.");
      return;
    }

    if (!permitirSeparados) {
      let clienteDisplay =
        clienteNombre && clienteNombre !== "Sin Nombre"
          ? clienteNombre
          : clienteCelular;
      let mensajeConfirmacion = `❓ ¿CONFIRMAR REGISTRO DE VENTA? 🍿\n────────────────────────────\n👤 Cliente / Distribuidor: ${clienteDisplay}\n📞 Celular: ${clienteCelular}\n🏦 Recibe: ${medioPago}\n💰 Valor Cobrado: ${montoCobrado || "$0"}\n\n📺 Cuentas a entregar:\n${resumenConfirmarArray.join("\n")}\n────────────────────────────\n¿Estás seguro de que los datos ingresados son correctos?`;

      if (!confirm(mensajeConfirmacion)) return;
    }

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
    if (permitirSeparados) {
      formData.append("permitir_separados", "true");
    }

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

        if (data.status === "confirmar_separados") {
          if (confirm("⚠️ " + data.message)) {
            window.ejecutarVentaFinal(null, true);
          }
          return;
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
            clienteNombre &&
            clienteNombre !== "Sin Nombre" &&
            clienteNombre.trim() !== ""
              ? " " + clienteNombre.trim()
              : "";

          let esSoloNetflixRenovacion = false;
          let titlePlatFicha = "NETFLIX PREMIUM";

          if (data.entregados && data.entregados.length === 1) {
            let itemUnico = data.entregados[0];
            let tipoItem = (itemUnico.tipo || "").toLowerCase();
            if (
              (itemUnico.plataforma === "NETFLIX" ||
                itemUnico.plataforma === "NETFLIX INTERNACIONAL") &&
              (tipoItem.includes("reno") ||
                tipoItem.includes("renovar") ||
                tipoItem.includes("internacional"))
            ) {
              esSoloNetflixRenovacion = true;
              if (
                itemUnico.plataforma === "NETFLIX INTERNACIONAL" ||
                tipoItem.includes("internacional")
              ) {
                titlePlatFicha = "NETFLIX INTERNACIONAL";
              }
            }
          }

          let fichaTexto = "";
          if (esSoloNetflixRenovacion) {
            fichaTexto = `🌟 *¡Hola${nombreSaludo}!*\n\nTu cuenta de *${titlePlatFicha}* ha sido procesada con éxito 🔄✨. Aquí tienes la información de tu servicio:\n`;
          } else {
            fichaTexto = `🌟 *¡Hola${nombreSaludo}!*\n\nTu pedido ha sido procesado con éxito. Aquí tienes tus accesos:\n`;
          }

          if (data.entregados && data.entregados.length > 0) {
            data.entregados.forEach((item) => {
              if (item.esRecarga) {
                fichaTexto += `\n💼 *RECARGA DE SALDO* ✅\n────────────────────\n💰 *Monto Inyectado:* ${item.monto}\n🎁 *Bono Aplicado:* ${item.bono}%\n`;
              } else {
                let platFormat = (item.plataforma || "")
                  .toUpperCase()
                  .replace(/_/g, "-");
                if (platFormat === "AMAZON") platFormat = "AMAZON-PRIME-VIDEO";
                if (platFormat === "HBO") platFormat = "HBO-MAX";
                if (platFormat === "DISNEY") platFormat = "DISNEY-ESTANDAR";

                let textoMeses =
                  parseInt(item.meses) > 1 ? ` (${item.meses} Meses)` : "";
                let esRenoItem =
                  (item.tipo || "").toLowerCase().includes("reno") ||
                  (item.tipo || "").toLowerCase().includes("internacional");

                let vencVal = item.vencimiento;
                if (
                  !vencVal ||
                  vencVal === "null" ||
                  vencVal === "undefined" ||
                  vencVal === "-" ||
                  vencVal === ""
                ) {
                  let dV = new Date();
                  dV.setDate(dV.getDate() + parseInt(item.meses || 1) * 30);
                  const mesesMayus = [
                    "ENERO",
                    "FEBRERO",
                    "MARZO",
                    "ABRIL",
                    "MAYO",
                    "JUNIO",
                    "JULIO",
                    "AGOSTO",
                    "SEPTIEMBRE",
                    "OCTUBRE",
                    "NOVIEMBRE",
                    "DICIEMBRE",
                  ];
                  vencVal = dV.getDate() + " DE " + mesesMayus[dV.getMonth()];
                }

                if (
                  (platFormat === "NETFLIX" ||
                    platFormat === "NETFLIX-INTERNACIONAL" ||
                    platFormat === "NETFLIX INTERNACIONAL") &&
                  esRenoItem
                ) {
                  let platDisplay =
                    platFormat.includes("INTERNACIONAL") ||
                    (item.tipo || "").toLowerCase().includes("internacional")
                      ? "NETFLIX INTERNACIONAL"
                      : "NETFLIX PREMIUM";
                  fichaTexto += `\n🔄 *CUENTA DE ${platDisplay}*${textoMeses} ✅\n────────────────────\n`;
                  fichaTexto += `👤 *Correo:* ${item.correo || "-"}\n🔐 *Contraseña:* ${item.clave || "-"}\n🌐 *Perfil:* ${item.perfil || "1"}\n`;
                  if (
                    item.pin &&
                    item.pin !== "" &&
                    item.pin !== "-" &&
                    item.pin !== "null"
                  ) {
                    fichaTexto += `📍 *PIN:* ${item.pin}\n`;
                  }
                  fichaTexto += `📅 *Vencimiento:* ${vencVal}\n`;

                  // 🔥 Solo poner mensaje del BOT si NO es Internacional
                  if (!platDisplay.includes("INTERNACIONAL")) {
                    fichaTexto += `\n🤖 *¿NECESITAS UN CÓDIGO?* Puedes usar nuestra pagina para codigos disponible 24/7: www.cybernetsp.com/\n`;
                  }
                } else {
                  fichaTexto += `\n🎬 *DETALLES DE ${platFormat}*${textoMeses} ✅\n────────────────────\n`;
                  if (platFormat.includes("NETFLIX")) {
                    fichaTexto += `⚠️ *Para iniciar sesión:* Cuando te pida un código, selecciona *Obtener ayuda* y después *Usar contraseña*.\n\n`;
                  }

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

                  fichaTexto += `👤 *${etiquetaUser}:* ${item.correo || "-"}\n🔐 *Contraseña:* ${item.clave || "-"}\n`;
                  if (
                    item.perfil &&
                    item.perfil !== "" &&
                    item.perfil !== "-" &&
                    item.perfil !== "null"
                  ) {
                    fichaTexto += `🌐 *${etiquetaPerfil}:* ${item.perfil}\n`;
                  }
                  if (
                    item.pin &&
                    item.pin !== "" &&
                    item.pin !== "-" &&
                    item.pin !== "null"
                  ) {
                    fichaTexto += `📍 *PIN:* ${item.pin}\n`;
                  }
                  fichaTexto += `📅 *Vence:* ${vencVal}\n`;

                  // 🤖 AGREGAR NOTA DEL BOT SI LA CUENTA ENTREGADA ES NETFLIX (y no Internacional)
                  if (
                    platFormat.includes("NETFLIX") ||
                    item.plataforma === "NETFLIX"
                  ) {
                    if (
                      !platFormat.includes("INTERNACIONAL") &&
                      item.plataforma !== "NETFLIX INTERNACIONAL"
                    ) {
                      fichaTexto += `\n🤖 *¿NECESITAS UN CÓDIGO?* Puedes usar nuestra pagina para codigos disponible 24/7: www.cybernetsp.com/\n`;
                    }
                  }
                }
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
// 🧮 COTIZADOR INTELIGENTE (SIN VALORES HARDCODEADOS - BASADO EN MYSQL)
// =========================================================================
const oldAbrirCalculadoraCombos = window.abrirCalculadoraCombos;
window.abrirCalculadoraCombos = function () {
  if (oldAbrirCalculadoraCombos) oldAbrirCalculadoraCombos();
  if (typeof haptic === "function") haptic();

  // Sincronizar precios en vivo desde MySQL al abrir
  if (typeof window.sincronizarPreciosCotizador === "function") {
    window.sincronizarPreciosCotizador();
  }

  const container = document.getElementById("contenedorPlataformasCotizador");

  // INYECTAR NETFLIX INTERNACIONAL SI NO EXISTE
  if (
    container &&
    !document.querySelector('.chk-cotizar-plat[value="NETFLIX INTERNACIONAL"]')
  ) {
    const netIntRow = document.createElement("div");
    netIntRow.className = "row-cotizar-plat";
    netIntRow.setAttribute("data-nombre", "netflix internacional");
    netIntRow.style.cssText =
      "border-bottom: 0.5px solid rgba(255, 255, 255, 0.06);";
    netIntRow.innerHTML = `
      <label style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; cursor: pointer; width: 100%; box-sizing: border-box;">
          <span style="font-size: 0.9rem; font-weight: 700; color: #e50914">Netflix Internacional</span>
          <input type="checkbox" class="chk-cotizar-plat" value="NETFLIX INTERNACIONAL" data-tipo="netflix_int" onchange="window.controlarDisneyMutuo(this); window.calcularPreciosSistemaCotizador();" style="accent-color: #0a84ff; width: 18px; height: 18px; cursor: pointer;" />
      </label>
    `;
    const rowNetflix = container.querySelector(
      '.row-cotizar-plat[data-nombre*="netflix premium"]',
    );
    if (rowNetflix && rowNetflix.nextSibling) {
      container.insertBefore(netIntRow, rowNetflix.nextSibling);
    } else {
      container.appendChild(netIntRow);
    }
  }

  // INYECTAR IPTV SI NO EXISTE
  if (container && !document.querySelector('.chk-cotizar-plat[value="IPTV"]')) {
    const iptvRow = document.createElement("div");
    iptvRow.className = "row-cotizar-plat";
    iptvRow.setAttribute("data-nombre", "iptv smarters");
    iptvRow.style.cssText =
      "border-bottom: 0.5px solid rgba(255, 255, 255, 0.06);";
    iptvRow.innerHTML = `
      <label style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; cursor: pointer; width: 100%; box-sizing: border-box;">
          <span style="font-size: 0.9rem; font-weight: 600; color: #30d158">IPTV Smarters</span>
          <input type="checkbox" class="chk-cotizar-plat" value="IPTV" data-tipo="herramienta" onchange="window.controlarDisneyMutuo(this); window.calcularPreciosSistemaCotizador();" style="accent-color: #0a84ff; width: 18px; height: 18px; cursor: pointer;" />
      </label>
    `;
    container.appendChild(iptvRow);
  }

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
    } else if (tipo === "netflix") {
      const ni = document.querySelector(
        '.chk-cotizar-plat[data-tipo="netflix_int"]',
      );
      if (ni && ni.checked) {
        ni.checked = false;
        window.controlarDisneyMutuo(ni);
      }
    } else if (tipo === "netflix_int") {
      const n = document.querySelector(
        '.chk-cotizar-plat[data-tipo="netflix"]',
      );
      if (n && n.checked) {
        n.checked = false;
        window.controlarDisneyMutuo(n);
      }
    }

    // 🧹 BORRAR BÚSQUEDA Y REENFOCAR INPUT AL SELECCIONAR CUALQUIER PLATAFORMA
    const inputSearch = document.getElementById("buscarPlataformaCotizador");
    if (inputSearch) {
      inputSearch.value = "";
      window.filtrarPlataformasCotizador();
      inputSearch.focus();
    }
  }

  const row = checkbox.closest(".row-cotizar-plat");
  if (row) {
    let selectWrapper = row.querySelector(".cotizador-pantallas-wrapper");
    if (selectWrapper) {
      if (tipo === "netflix_int") {
        selectWrapper.style.display = "none";
        let sel = selectWrapper.querySelector("select");
        if (sel) sel.value = "1";
      } else {
        selectWrapper.style.display = checkbox.checked ? "flex" : "none";
        if (!checkbox.checked) {
          selectWrapper.querySelector("select").value = "1";
        }
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
        fila.style.display = "block";
      } else {
        if (nombrePlat.includes(query) || (checkbox && checkbox.checked)) {
          fila.style.display = "block";
        } else {
          fila.style.display = "none";
        }
      }
    });
};

// 🧮 ALGORITMO DINÁMICO REFORZADO - CONSULTA PRECIOS REALES DE MYSQL DE LA CACHE
window.calcularPreciosSistemaCotizador = function () {
  const getPrecioDB = (codigo, defecto) => {
    return window.preciosCotizadorCache &&
      window.preciosCotizadorCache[codigo] > 0
      ? window.preciosCotizadorCache[codigo]
      : defecto;
  };

  const mapValores = {
    "DISNEY-PREMIUM": {
      indiv: getPrecioDB("DISNEY-PREMIUM", 15000),
      combo: Math.round(getPrecioDB("DISNEY-PREMIUM", 15000) * 0.66),
      isTier: false,
    },
    "Amazon Prime": {
      indiv: getPrecioDB("AMAZON-PRIME-VIDEO", 10500),
      combo: Math.round(getPrecioDB("AMAZON-PRIME-VIDEO", 10500) * 0.48),
      isTier: true,
    },
    "Disney Estándar": {
      indiv: getPrecioDB("DISNEY-ESTANDAR", 8500),
      combo: Math.round(getPrecioDB("DISNEY-ESTANDAR", 8500) * 0.47),
      isTier: true,
    },
    Max: {
      id: "MAX",
      indiv: getPrecioDB("HBO-MAX", 8500),
      combo: Math.round(getPrecioDB("HBO-MAX", 8500) * 0.35),
      isTier: true,
    },
    "Apple TV": {
      indiv: getPrecioDB("APPLE", 8500),
      combo: Math.round(getPrecioDB("APPLE", 8500) * 0.35),
      isTier: true,
    },
    Crunchyroll: {
      indiv: getPrecioDB("CRUNCHYROLL", 8500),
      combo: Math.round(getPrecioDB("CRUNCHYROLL", 8500) * 0.35),
      isTier: true,
    },
    Plex: {
      indiv: getPrecioDB("PLEX", 8500),
      combo: Math.round(getPrecioDB("PLEX", 8500) * 0.35),
      isTier: true,
    },
    "Universal+": {
      indiv: getPrecioDB("UNIVERSAL", 8500),
      combo: Math.round(getPrecioDB("UNIVERSAL", 8500) * 0.35),
      isTier: true,
    },
    Vix: {
      indiv: getPrecioDB("VIX", 8500),
      combo: Math.round(getPrecioDB("VIX", 8500) * 0.35),
      isTier: true,
    },
    "Paramount+": {
      indiv: getPrecioDB("PARAMOUNT", 15000),
      combo: Math.round(getPrecioDB("PARAMOUNT", 15000) * 0.86),
      isTier: false,
    },
    Metegol: {
      indiv: getPrecioDB("METEGOL", 15000),
      combo: getPrecioDB("METEGOL", 15000),
      isTier: false,
    },
    Spotify: {
      indiv: getPrecioDB("SPOTIFY", 14000),
      combo: getPrecioDB("SPOTIFY", 14000),
      isTier: false,
    },
    "YouTube Premium": {
      indiv: getPrecioDB("YOUTUBE", 14000),
      combo: getPrecioDB("YOUTUBE", 14000),
      isTier: false,
    },
    Deezer: {
      indiv: getPrecioDB("DEEZER", 12000),
      combo: getPrecioDB("DEEZER", 12000),
      isTier: false,
    },
    "Canva Pro": {
      indiv: getPrecioDB("CANVA", 20000),
      combo: getPrecioDB("CANVA", 20000),
      isTier: false,
    },
    IPTV: {
      indiv: getPrecioDB("IPTV", 7000),
      combo: getPrecioDB("IPTV", 7000),
      isTier: false,
    },
  };

  let precioBaseUnMes = 0;
  let tieneNetflix = false;
  let costoNetflixCalculado = 0;

  let allOtherScreens = [];
  let countDisneyPremium = 0;
  let countTierEligible = 0;
  let arrayAddonsDirectosYExtras = [];

  let pNet = getPrecioDB("NETFLIX", 15000);

  document.querySelectorAll(".row-cotizar-plat").forEach((row) => {
    const cb = row.querySelector(".chk-cotizar-plat");
    if (cb && cb.checked) {
      const val = cb.value;
      const selectPantallas = row.querySelector(".sel-pantallas-cotizador");
      const pantallas = selectPantallas
        ? parseInt(selectPantallas.value) || 1
        : 1;

      if (val === "NETFLIX" || val === "NETFLIX INTERNACIONAL") {
        tieneNetflix = true;
        if (val === "NETFLIX INTERNACIONAL") {
          pNet = getPrecioDB(
            "NETFLIX-INTERNACIONAL",
            getPrecioDB(
              "NETFLIX_INTERNACIONAL",
              getPrecioDB("NETFLIX INTERNACIONAL", 18000),
            ),
          );
          costoNetflixCalculado = pNet; // Fijo 1 pantalla
        } else {
          pNet = getPrecioDB("NETFLIX", 15000);
          if (pantallas === 1) costoNetflixCalculado = pNet;
          else if (pantallas === 2)
            costoNetflixCalculado = Math.round(pNet * 1.8);
          else if (pantallas === 3)
            costoNetflixCalculado = Math.round(pNet * 2.46);
          else if (pantallas === 4)
            costoNetflixCalculado = Math.round(pNet * 3.13);
          else if (pantallas >= 5)
            costoNetflixCalculado = Math.round(pNet * 3.73);
        }
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
      if (countTierEligible === 0) precioBaseUnMes += Math.round(pNet * 0.7);
      else if (countTierEligible === 1)
        precioBaseUnMes += Math.round(pNet * 0.96);
      else if (countTierEligible === 2)
        precioBaseUnMes += Math.round(pNet * 1.16);
      else if (countTierEligible >= 3)
        precioBaseUnMes +=
          Math.round(pNet * 1.36) + (countTierEligible - 3) * 3000;
      precioBaseUnMes +=
        (countDisneyPremium - 1) * mapValores["DISNEY-PREMIUM"].combo;
    } else {
      if (countTierEligible === 0) precioBaseUnMes += 0;
      else if (countTierEligible === 1)
        precioBaseUnMes += Math.round(pNet * 0.36);
      else if (countTierEligible === 2)
        precioBaseUnMes += Math.round(pNet * 0.63);
      else if (countTierEligible >= 3)
        precioBaseUnMes +=
          Math.round(pNet * 0.83) + (countTierEligible - 3) * 3000;
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
  const montoDescuento = Math.round(subtotal * (porcDesc / 100));

  const esClienteFiel = document.getElementById("calcFidelidad")
    ? document.getElementById("calcFidelidad").checked
    : false;
  let descuentoFielTotal =
    esClienteFiel && precioBaseUnMes > 0 ? 1000 * meses : 0;

  if (descuentoFielTotal > 0) {
    const rowDescFiel = document.getElementById("rowCalcDescFiel");
    if (rowDescFiel) rowDescFiel.style.display = "flex";
    const elDescFiel = document.getElementById("calcDiscountFiel");
    if (elDescFiel)
      elDescFiel.innerText = "-$" + descuentoFielTotal.toLocaleString("es-CO");
  } else {
    const rowDescFiel = document.getElementById("rowCalcDescFiel");
    if (rowDescFiel) rowDescFiel.style.display = "none";
  }

  let totalA_Cobrar = Math.max(
    0,
    subtotal - montoDescuento - descuentoFielTotal,
  );

  const elBasePrice = document.getElementById("calcBasePriceDisplay");
  if (elBasePrice)
    elBasePrice.value = "$" + precioBaseUnMes.toLocaleString("es-CO");
  const elSubtotal = document.getElementById("calcSubtotal");
  if (elSubtotal) elSubtotal.innerText = "$" + subtotal.toLocaleString("es-CO");
  const elDiscount = document.getElementById("calcDiscount");
  if (elDiscount)
    elDiscount.innerText = "-$" + montoDescuento.toLocaleString("es-CO");
  const elTotal = document.getElementById("calcTotal");
  if (elTotal) elTotal.innerText = "$" + totalA_Cobrar.toLocaleString("es-CO");
};

window.copiarCotizacionCombo = function (btn) {
  if (typeof haptic === "function") haptic();

  let plataformasSeleccionadas = [];
  let hasNetNormal = false;
  let hasNetInt = false;
  let hasDisneyPre = false;

  document.querySelectorAll(".row-cotizar-plat").forEach((row) => {
    const cb = row.querySelector(".chk-cotizar-plat");
    if (cb && cb.checked) {
      const val = cb.value;
      const valUpper = val.toUpperCase();
      const selectPantallas = row.querySelector(".sel-pantallas-cotizador");
      const pantallas = selectPantallas
        ? parseInt(selectPantallas.value) || 1
        : 1;

      let textoPantallas = "";
      if (pantallas > 1) {
        textoPantallas =
          pantallas >= 5 && valUpper === "NETFLIX"
            ? " (Cuenta Completa)"
            : ` (${pantallas} Pantallas)`;
      }

      plataformasSeleccionadas.push(`    • 📺 *${valUpper}*${textoPantallas}`);

      if (valUpper === "NETFLIX") {
        hasNetNormal = true;
      } else if (valUpper === "NETFLIX INTERNACIONAL") {
        hasNetInt = true;
      } else if (
        valUpper === "DISNEY-PREMIUM" ||
        valUpper === "DISNEY PREMIUM"
      ) {
        hasDisneyPre = true;
      }
    }
  });

  if (plataformasSeleccionadas.length === 0) {
    alert("Selecciona al menos una plataforma para armar el mensaje.");
    return;
  }

  const monthSelect = document.getElementById("calcMonths");
  const meses = parseInt(monthSelect.value) || 1;
  const porcDesc =
    parseFloat(
      monthSelect.options[monthSelect.selectedIndex].getAttribute("data-desc"),
    ) || 0;
  const esClienteFiel = document.getElementById("calcFidelidad")
    ? document.getElementById("calcFidelidad").checked
    : false;

  // Lectura directa de las cifras exactas calculadas en pantalla
  const subtotalText = document.getElementById("calcSubtotal")
    ? document.getElementById("calcSubtotal").innerText
    : "$0";
  const discountComboText = document.getElementById("calcDiscount")
    ? document.getElementById("calcDiscount").innerText
    : "-$0";
  const discountFielText = document.getElementById("calcDiscountFiel")
    ? document.getElementById("calcDiscountFiel").innerText
    : "-$0";
  const totalText = document.getElementById("calcTotal")
    ? document.getElementById("calcTotal").innerText
    : "$0";

  let mensajeVIP = "";
  let listaPlatFormateada = plataformasSeleccionadas.join("\n");

  let tituloHeader = "💻 *TU COMBO STREAMING CYBERNET* 🚀📺";
  if (hasNetInt) {
    tituloHeader = hasDisneyPre
      ? "🌐 *TU COMBO NETFLIX INTERNACIONAL VIP* 🍿"
      : "🌐 *TU COMBO NETFLIX INTERNACIONAL* 🍿";
  } else if (hasNetNormal) {
    tituloHeader = hasDisneyPre
      ? "💎 *TU COMBO NETFLIX PREMIUM VIP* 🍿"
      : "💻 *TU COMBO NETFLIX PREMIUM* 🍿";
  }

  mensajeVIP = `${tituloHeader}\n${listaPlatFormateada}\n`;

  // Desglose cuando hay más de 1 mes o cuando está activo Cliente Fiel (incluso para 1 mes)
  if (meses > 1 || esClienteFiel) {
    mensajeVIP += `\n💵 *Valor Comercial:* ${subtotalText}`;
    if (meses > 1 && porcDesc > 0) {
      mensajeVIP += `\n🎁 *Descuento Duración (${porcDesc}%):* ${discountComboText}`;
    }
    if (esClienteFiel) {
      mensajeVIP += `\n✨ *Descuento Cliente Fiel:* ${discountFielText}`;
    }
    mensajeVIP += `\n───────────────────────\n💰 *TOTAL NETO A PAGAR: ${totalText}* 🔥✨`;
  } else {
    mensajeVIP += `\n───────────────────────\n💰 *TOTAL A PAGAR: ${totalText}* 🔥🍿`;
  }

  // Beneficio del Bot (Exclusivo para Netflix Premium normal)
  if (hasNetNormal && !hasNetInt) {
    mensajeVIP += `\n\n⚡ *¡BENEFICIO EXCLUSIVO!*\nTu cuenta de *NETFLIX* incluye acceso para generar códigos *24/7 de forma automática*. ¡Sin hacer filas en el chat! 🤖🔓`;
  }

  mensajeVIP += `\n\n👇 _Dime si te agrada la oferta para enviarte los medios de pago y activarte de inmediato._`;

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
