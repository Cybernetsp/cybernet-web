/* ==========================================================================
   💸 CYBERNET OS - FINANZAS, INVENTARIO Y DISTRIBUIDORES (finanzas_staff.js)
   ========================================================================== */

/* ==========================================================================
   📈 MÓDULO PRINCIPAL DE FINANZAS Y CAJA REAL
   ========================================================================== */

// 🚪 FUNCIÓN DISPARADORA PARA ABRIR Y CERRAR EL PANEL DE FINANZAS
window.toggleFinanzasPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("finanzasOverlay");
  if (!overlay) {
    console.error("❌ No se encontró el modal #finanzasOverlay en el HTML.");
    return;
  }

  if (overlay.classList.contains("open") || overlay.style.display === "flex") {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    if (typeof cerrarTodasLasVentanas === "function") cerrarTodasLasVentanas();
    overlay.classList.add("open");
    overlay.style.setProperty("display", "flex", "important");
    overlay.style.setProperty("align-items", "center", "important");
    overlay.style.setProperty("justify-content", "center", "important");

    window.construirSelectores();
    window.actualizarFiltrosUI();
  }
};

/* ==========================================================================
   📦 CONTROL DE INVENTARIO / SWITCHES DE PLATAFORMAS
   ========================================================================== */
window.toggleInventarioPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("inventarioOverlay");
  if (!overlay) return;

  if (overlay.classList.contains("open") || overlay.style.display === "flex") {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    if (typeof cerrarTodasLasVentanas === "function") cerrarTodasLasVentanas();
    overlay.classList.add("open");
    overlay.style.setProperty("display", "flex", "important");
    overlay.style.setProperty("align-items", "center", "important");
    overlay.style.setProperty("justify-content", "center", "important");
    window.cargarInventarioStockMySQL();
  }
};

window.cargarInventarioStockMySQL = function () {
  const contenedor = document.getElementById("panelSwitchesStock");
  if (!contenedor) return;

  const usuarioActivoObj = JSON.parse(
    sessionStorage.getItem("usuario_activo") || "null",
  );
  const user = usuarioActivoObj ? usuarioActivoObj.nombre.toUpperCase() : null;
  const rol = usuarioActivoObj ? usuarioActivoObj.rol : null;
  const esAdmin = rol === "superadmin" || user === "CAMILO";

  contenedor.innerHTML =
    '<div style="grid-column: 1 / -1; text-align: center; color: var(--ios-blue); padding: 30px;"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg><br><span style="margin-top:8px; display:inline-block; font-weight:600;">Consultando inventario...</span></div>';

  fetch("https://api.cybernetsp.com/obtener_inventario_stock.php")
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success") {
        let html = "";
        res.data.forEach((item) => {
          const isChecked = item.activo === 1 ? "checked" : "";
          const switchColor = item.activo === 1 ? "#30d158" : "#ff453a";
          const isDisabled = esAdmin ? "" : "disabled";
          const cursorStyle = esAdmin
            ? "cursor: pointer;"
            : "cursor: not-allowed; opacity: 0.5;";

          html += `
            <div class="card-ios" style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 16px; margin: 0;">
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-weight: 800; font-size: 0.92rem; color: var(--text-primary);">${item.nombre}</span>
                <span style="font-size: 0.78rem; font-family: monospace; font-weight: 600; color: ${item.libres > 0 ? "rgba(255,255,255,0.6)" : "#ff453a"};">(${item.libres} libres)</span>
              </div>
              <label class="ios-switch-label" style="position: relative; display: inline-block; width: 50px; height: 28px; ${cursorStyle}">
                <input type="checkbox" ${isChecked} ${isDisabled} onchange="window.cambiarEstadoPlataformaMySQL('${item.id}', this)" style="opacity: 0; width: 0; height: 0;">
                <span class="ios-switch-slider" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: ${switchColor}; transition: .3s; border-radius: 30px;"></span>
              </label>
            </div>`;
        });
        contenedor.innerHTML = html;
      } else {
        contenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--ios-red); padding: 20px;">Error: ${res.message}</div>`;
      }
    })
    .catch((err) => {
      contenedor.innerHTML =
        '<div style="grid-column: 1 / -1; text-align: center; color: var(--ios-red); padding: 20px;">❌ Error conectando a MySQL.</div>';
      console.error(err);
    });
};

window.cambiarEstadoPlataformaMySQL = function (idPlataforma, inputElem) {
  const usuarioActivoObj = JSON.parse(
    sessionStorage.getItem("usuario_activo") || "null",
  );
  const user = usuarioActivoObj ? usuarioActivoObj.nombre.toUpperCase() : null;
  const rol = usuarioActivoObj ? usuarioActivoObj.rol : null;

  if (rol !== "superadmin" && user !== "CAMILO") {
    if (typeof haptic === "function") haptic();
    inputElem.checked = !inputElem.checked;
    if (typeof triggerToast === "function")
      triggerToast(
        "⛔ Solo el administrador Camilo puede modificar las plataformas.",
      );
    return;
  }

  if (typeof haptic === "function") haptic();
  const nuevoEstado = inputElem.checked ? 1 : 0;
  const slider = inputElem.nextElementSibling;

  if (slider)
    slider.style.backgroundColor = nuevoEstado === 1 ? "#30d158" : "#ff453a";

  const formData = new FormData();
  formData.append("plataforma", idPlataforma);
  formData.append("activo", nuevoEstado);

  fetch("https://api.cybernetsp.com/guardar_estado_plataforma.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        if (typeof triggerToast === "function") {
          const estadoTxt = nuevoEstado === 1 ? "Encendida" : "Apagada";
          triggerToast(`⚙️ Plataforma <b>${estadoTxt}</b> en tienda.`);
        }
      } else {
        inputElem.checked = !inputElem.checked;
        if (slider)
          slider.style.backgroundColor = inputElem.checked
            ? "#30d158"
            : "#ff453a";
        alert("No se pudo cambiar el estado.");
      }
    })
    .catch((err) => {
      inputElem.checked = !inputElem.checked;
      if (slider)
        slider.style.backgroundColor = inputElem.checked
          ? "#30d158"
          : "#ff453a";
      console.error(err);
    });
};

/* ==========================================================================
   💳 SALDO DE DISTRIBUIDORES
   ========================================================================== */
window.toggleDistrisPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("distrisOverlay");
  if (!overlay) return;

  if (overlay.classList.contains("open") || overlay.style.display === "flex") {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    if (typeof cerrarTodasLasVentanas === "function") cerrarTodasLasVentanas();
    overlay.classList.add("open");
    overlay.style.setProperty("display", "flex", "important");
    overlay.style.setProperty("align-items", "center", "important");
    overlay.style.setProperty("justify-content", "center", "important");
    window.cargarDistribuidores();
  }
};

window.cargarDistribuidores = function () {
  if (typeof haptic === "function") haptic();
  const container = document.getElementById("tablaDistribuidores");
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 40px; color: #0a84ff;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
        <svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
        <span style="font-weight: 700; font-size: 0.88rem;">Sincronizando distribuidores...</span>
      </div>
    </div>`;

  fetch("https://api.cybernetsp.com/obtener_distribuidores.php")
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success") {
        let data = res.data || [];
        if (data.length === 0) {
          container.innerHTML = `<div style="text-align: center; padding: 30px; color: #a1a1aa; background: rgba(255,255,255,0.02); border-radius: 14px; border: 1px dashed rgba(255,255,255,0.08);">No hay distribuidores registrados.</div>`;
          return;
        }

        let html = "";
        data.forEach((distri) => {
          let saldoRaw =
            distri.saldo !== undefined
              ? distri.saldo
              : distri.balance !== undefined
                ? distri.balance
                : distri.monto || distri.total || 0;
          let saldoClean = 0;

          if (typeof saldoRaw === "number") {
            saldoClean = saldoRaw;
          } else {
            let strNum = String(saldoRaw).replace(/\$|\s/g, "");
            if (strNum.includes(".")) {
              strNum = strNum.replace(/\./g, "");
            }
            saldoClean = parseFloat(strNum) || 0;
          }

          let saldoFormateado =
            "$" + Math.round(saldoClean).toLocaleString("es-CO");
          let colorSaldo = saldoClean > 0 ? "#30d158" : "#ff453a";
          let bgBadgeSaldo =
            saldoClean > 0
              ? "rgba(48, 209, 88, 0.12)"
              : "rgba(255, 69, 58, 0.12)";
          let borderBadgeSaldo =
            saldoClean > 0
              ? "rgba(48, 209, 88, 0.25)"
              : "rgba(255, 69, 58, 0.25)";

          let nombreReal =
            distri.nombre &&
            distri.nombre !== "Sin Nombre" &&
            distri.nombre.trim() !== ""
              ? distri.nombre.trim()
              : "";
          let telefonoReal = (
            distri.telefono ||
            distri.numero ||
            distri.celular ||
            "-"
          ).trim();
          let nombreLimpio = nombreReal !== "" ? nombreReal : telefonoReal;
          let inicial = nombreLimpio.charAt(0).toUpperCase();

          html += `
            <div class="distri-row-item" style="background: rgba(255, 255, 255, 0.025); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; transition: all 0.2s ease;" onmouseover="this.style.background='rgba(255, 255, 255, 0.04)'; this.style.borderColor='rgba(10, 132, 255, 0.3)';" onmouseout="this.style.background='rgba(255, 255, 255, 0.025)'; this.style.borderColor='rgba(255, 255, 255, 0.08)';">
              
              <div style="display: flex; align-items: center; gap: 12px; overflow: hidden; flex: 1;">
                <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(10, 132, 255, 0.12); border: 1px solid rgba(10, 132, 255, 0.25); color: #0a84ff; font-weight: 900; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  ${inicial}
                </div>
                <div style="display: flex; flex-direction: column; gap: 2px; overflow: hidden;">
                  <span style="font-weight: 800; font-size: 0.92rem; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${nombreLimpio}</span>
                  <span style="font-size: 0.75rem; color: #a1a1aa; font-family: monospace; display: flex; align-items: center; gap: 4px;">
                    📱 ${telefonoReal}
                  </span>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
                <div style="background: ${bgBadgeSaldo}; border: 1px solid ${borderBadgeSaldo}; padding: 6px 12px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 1.05rem; font-weight: 900; color: ${colorSaldo}; font-family: monospace; letter-spacing: 0.3px;">${saldoFormateado}</span>
                </div>

                <button type="button" 
                        onclick="window.copiarSaldoDistri(this, '${nombreLimpio.replace(/'/g, "\\'")}', '${saldoFormateado}')" 
                        title="Copiar reporte de saldo"
                        style="background: rgba(10, 132, 255, 0.15); border: 1px solid rgba(10, 132, 255, 0.3); color: #0a84ff; width: 34px; height: 34px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;" 
                        onmouseover="this.style.background='rgba(10, 132, 255, 0.28)';" 
                        onmouseout="this.style.background='rgba(10, 132, 255, 0.15)';">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>

            </div>`;
        });
        container.innerHTML = html;
      } else {
        container.innerHTML = `<div style="text-align: center; padding: 25px; color: #ff453a; font-weight: 700;">Error: ${res.message}</div>`;
      }
    })
    .catch((err) => {
      console.error(err);
      container.innerHTML = `<div style="text-align: center; padding: 25px; color: #ff453a; font-weight: 700;">❌ Error de conexión con el servidor.</div>`;
    });
};

window.copiarSaldoDistri = function (btn, nombre, saldoFormateado) {
  if (typeof haptic === "function") haptic();

  let nombreDisplay =
    nombre && nombre !== "Sin Nombre" && nombre.trim() !== ""
      ? nombre
      : "Distribuidor";
  const textoWhatsApp = `🔔 *NOTIFICACIÓN DE SALDO CYBERNET* 🚀\n────────────────────\n👤 *Distribuidor:* ${nombreDisplay}\n💰 *Saldo Disponible:* ${saldoFormateado}\n────────────────────\n✨ _¡Gracias por tu confianza y preferencia!_`;

  navigator.clipboard.writeText(textoWhatsApp).then(() => {
    let oldHtml = btn.innerHTML;
    let oldBg = btn.style.background;

    btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#30d158" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    btn.style.setProperty("background", "rgba(48, 209, 88, 0.2)", "important");

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Reporte de saldo copiado</span></div>`,
      );
    }

    setTimeout(() => {
      btn.innerHTML = oldHtml;
      btn.style.background = oldBg;
    }, 1500);
  });
};

window.filtrarTablaRevendedores = function () {
  const query = (document.getElementById("searchTablaDistris")?.value || "")
    .toLowerCase()
    .trim();
  const filas = document.querySelectorAll(
    "#tablaDistribuidores .distri-row-item",
  );
  filas.forEach((row) => {
    row.style.display = row.innerText.toLowerCase().includes(query)
      ? "flex"
      : "none";
  });
};

/* ==========================================================================
   📈 MÓDULO FINANCIERO BENTO, BALANCE Y RENTABILIDAD
   ========================================================================== */
window.globalFinanzasData = window.globalFinanzasData || null;
window.activePeriod = window.activePeriod || "mes";
window.isWorkingFinanzas = window.isWorkingFinanzas || false;

const mesesArray = [
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

window.formatMoneda = function (v) {
  return (
    "$" +
    parseFloat(v || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })
  );
};

window.formatearMontoEnVivoCOP = function (input) {
  let val = input.value.replace(/\D/g, "");
  if (val) {
    input.value = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);
  } else {
    input.value = "";
  }
};

window.construirSelectores = function () {
  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");

  if (!mSelect || !dSelect || mSelect.options.length > 0) return;

  mSelect.innerHTML = "";
  mesesArray.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.innerText = m.charAt(0) + m.slice(1).toLowerCase();
    mSelect.appendChild(opt);
  });

  dSelect.innerHTML = '<option value="TODOS">Todo el mes</option>';
  for (let i = 1; i <= 31; i++) {
    const opt = document.createElement("option");
    opt.value = i.toString();
    opt.innerText = "Día " + i;
    dSelect.appendChild(opt);
  }

  const hoy = new Date();
  mSelect.value = mesesArray[hoy.getMonth()];
  dSelect.value = hoy.getDate().toString();
};

window.actualizarFiltrosUI = function () {
  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");

  const mes = mSelect ? mSelect.value : "AGOSTO";
  const dia = dSelect ? dSelect.value : "TODOS";

  window.activePeriod = dia === "TODOS" || dia === "" ? "mes" : "dia";

  const txtPeriodo =
    document.getElementById("txtPeriodoLabel") ||
    document.querySelector(".caja-real-title");
  if (txtPeriodo) {
    txtPeriodo.innerText =
      window.activePeriod === "mes"
        ? `CAJA REAL ${mes}`
        : `CAJA REAL DÍA ${dia}`;
  }

  const txtLibro = document.getElementById("txtLibroHeader");
  if (txtLibro) {
    txtLibro.innerText =
      dia === "TODOS" || dia === ""
        ? `LIBRO DE ${mes}`
        : `LIBRO DEL DÍA ${dia} DE ${mes}`;
  }

  window.cargarDashboardFinanzas();
};

window.cargarDashboardFinanzas = function () {
  const container = document.getElementById("listaDesgloseGastos");
  if (container)
    container.innerHTML =
      '<div class="empty-log-msg">Calculando balance desde MySQL...</div>';

  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");

  const mes = mSelect ? mSelect.value : "AGOSTO";
  const dia = dSelect ? dSelect.value : "TODOS";

  window.cargarRentabilidadPlataformas();

  const formData = new FormData();
  formData.append("accion", "obtener_dashboard_finanzas");
  formData.append("mes", mes);
  formData.append("dia", dia);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.text())
    .then((text) => {
      let res;
      try {
        res = JSON.parse(text);
      } catch (e) {
        if (container)
          container.innerHTML = `<div class="empty-log-msg" style="color:var(--ios-red);">❌ Error en PHP:<br><small>${text.replace(/</g, "&lt;")}</small></div>`;
        return;
      }

      if (res && res.status === "success") {
        window.globalFinanzasData = res.data;
        window.renderDashboard();
      } else {
        if (container)
          container.innerHTML = `<div class="empty-log-msg" style="color:var(--ios-red);">Error: ${res ? res.message : "Fallo al consultar."}</div>`;
      }
    })
    .catch((err) => {
      if (container)
        container.innerHTML = `<div class="empty-log-msg" style="color:var(--ios-red);">❌ Error de red con MySQL.</div>`;
    });
};

window.filtrarHoy = function () {
  if (typeof haptic === "function") haptic();
  const hoy = new Date();
  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");
  if (mSelect && dSelect) {
    mSelect.value = mesesArray[hoy.getMonth()];
    dSelect.value = hoy.getDate().toString();
    window.actualizarFiltrosUI();
  }
};

window.filtrarAyer = function () {
  if (typeof haptic === "function") haptic();
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");
  if (mSelect && dSelect) {
    mSelect.value = mesesArray[ayer.getMonth()];
    dSelect.value = ayer.getDate().toString();
    window.actualizarFiltrosUI();
  }
};

window.filtrarMes = function () {
  if (typeof haptic === "function") haptic();
  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");

  if (dSelect) dSelect.value = "TODOS";

  window.activePeriod = "mes";
  window.actualizarFiltrosUI();
};

window.cargarRentabilidadPlataformas = function () {
  const container = document.getElementById("rankingPlataformasVentas");
  if (!container) return;
  container.innerHTML =
    '<div class="empty-log-msg">Calculando rentabilidad...</div>';

  const mes = document.getElementById("appleMonthSelect")?.value || "AGOSTO";

  const formData = new FormData();
  formData.append("accion", "obtener_rentabilidad_plataformas");
  formData.append("mes", mes);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      if (res && res.status === "success") {
        let html = "";
        let data = res.data;

        if (!data || data.length === 0) {
          container.innerHTML =
            '<div class="empty-log-msg">No hay ventas registradas en este mes.</div>';
          return;
        }

        let maxGanancia =
          Math.max(...data.map((d) => Math.abs(d.gananciaNeta))) || 1;
        let colors = [
          "var(--ios-purple)",
          "var(--ios-blue)",
          "var(--ios-orange)",
          "var(--ios-green)",
          "#ff453a",
        ];

        data.forEach((r, idx) => {
          let color =
            r.gananciaNeta < 0 ? "var(--ios-red)" : colors[idx % colors.length];
          let pctBar = Math.round(
            (Math.abs(r.gananciaNeta) / maxGanancia) * 100,
          );

          html += `
            <div class="bar-row">
                <div class="bar-meta">
                  <span style="color:var(--text-primary); font-weight:700;">${r.plataforma} <span style="color:var(--text-secondary); font-size:0.75rem; font-weight:500;">(${r.ventas} ventas)</span></span>
                  <div style="display:flex; flex-direction:column; text-align:right;">
                      <span style="color:${color}; font-weight:800; font-size:1.05rem;">${formatMoneda(r.gananciaNeta)} <span style="font-size:0.7rem; color:var(--text-secondary);">NETO</span></span>
                      <span style="font-size:0.7rem; color:var(--text-secondary);">Bruto: ${formatMoneda(r.ingresoBruto)}</span>
                  </div>
                </div>
                <div class="bar-track" style="height: 8px; background: rgba(255,255,255,0.05); margin-top:2px;">
                  <div class="bar-fill" style="width: ${pctBar}%; background: ${color}; box-shadow: 0 0 10px ${color};"></div>
                </div>
            </div>`;
        });
        container.innerHTML = html;
      } else {
        container.innerHTML =
          '<div class="empty-log-msg">Error al cargar rentabilidad.</div>';
      }
    })
    .catch(() => {
      container.innerHTML =
        '<div class="empty-log-msg">❌ Error al conectar a MySQL.</div>';
    });
};

window.guardarTransaccion = function (e) {
  if (e) e.preventDefault();
  if (window.isWorkingFinanzas) return;

  const catElem = document.getElementById("finCategoria");
  const montoElem = document.getElementById("finMonto");
  const detalleElem = document.getElementById("finDetalle");

  if (!catElem || !montoElem) return;

  const catVal = catElem.value;
  const montoRaw = montoElem.value.replace(/\D/g, "");
  const detalleVal = detalleElem ? detalleElem.value.trim() : "";

  if (!montoRaw || parseInt(montoRaw, 10) <= 0) {
    alert("Ingresa un monto válido.");
    return;
  }

  window.isWorkingFinanzas = true;
  const btn = document.getElementById("btnSubmit");
  const originalText = btn ? btn.innerText : "Archivar";

  if (btn) {
    btn.innerText = "Procesando...";
    btn.disabled = true;
  }

  const formData = new FormData();
  formData.append("accion", "registrar_transaccion_financiera");
  formData.append("categoria", catVal);
  formData.append("monto", montoRaw);
  formData.append("detalle", detalleVal);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      window.isWorkingFinanzas = false;
      if (btn) {
        btn.innerText = originalText;
        btn.disabled = false;
      }

      if (res && res.status === "success") {
        const form = document.getElementById("formFinanzas");
        if (form) form.reset();
        window.cargarDashboardFinanzas();
        if (typeof triggerToast === "function")
          triggerToast(`✅ ${res.message}`);
      } else {
        alert(
          "Error: " +
            (res ? res.message : "No se pudo guardar la transacción."),
        );
      }
    })
    .catch((err) => {
      window.isWorkingFinanzas = false;
      if (btn) {
        btn.innerText = originalText;
        btn.disabled = false;
      }
      alert("❌ Error de red al guardar la transacción.");
    });
};

window.guardarDeudaEnSheets = window.guardarDeudaEnMySQL = function () {
  if (typeof haptic === "function") haptic();
  const btn = document.getElementById("btnGuardarDeudaSheets");
  const tipoElem = document.getElementById("tipoDeudaMutua");
  const montoElem = document.getElementById("valDeudaTotal");

  const tipo = tipoElem ? tipoElem.value : "negocio_debe";
  const montoRaw = montoElem ? montoElem.value.replace(/\D/g, "") : "0";
  const monto = parseFloat(montoRaw) || 0;

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Guardando...";
  }

  const formData = new FormData();
  formData.append("accion", "actualizar_deuda_mutua");
  formData.append("monto", monto);
  formData.append("tipo", tipo);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      if (btn) {
        btn.disabled = false;
        btn.innerText = "💾 Guardar";
      }

      if (res && res.status === "success") {
        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Deuda guardada en MySQL</span></div>`,
          );
        }
      } else {
        alert(
          "❌ Error: " +
            (res ? res.message : "Fallo de conexión al guardar la deuda."),
        );
      }
    })
    .catch((err) => {
      if (btn) {
        btn.disabled = false;
        btn.innerText = "💾 Guardar";
      }
      alert("❌ Error al conectar con el servidor.");
    });
};

window.renderDashboard = function () {
  if (!window.globalFinanzasData) return;

  const activeKey = window.activePeriod || "mes";
  const d =
    window.globalFinanzasData[activeKey] ||
    window.globalFinanzasData["mes"] ||
    window.globalFinanzasData["dia"];

  if (!d) return;

  // 1. CÁLCULO DE VALORES BASE
  let ingNum = Number(d.ingresos) || 0;
  const gasNum = Number(d.gastos) || 0;
  const invNum = Number(d.inversiones) || 0;
  const nomNum = Number(d.nomina) || 0;

  // 🔴 FILTRO ESPECIAL PARA EXCLUIR A JEISSON DE LOS INGRESOS BRUTOS
  let montoJeissonExtraido = 0;
  if (window.globalFinanzasData.listaDetallada) {
    window.globalFinanzasData.listaDetallada.forEach((mov) => {
      if (
        mov.tipo === "INGRESO" &&
        (mov.categoria.toUpperCase().includes("JEISSON") ||
          (mov.detalle || "").toUpperCase().includes("JEISSON"))
      ) {
        montoJeissonExtraido += Number(mov.monto) || 0;
      }
    });
  }

  ingNum = ingNum - montoJeissonExtraido;

  const netoOperativo = ingNum - (gasNum + invNum + nomNum);

  // 2. PORCENTAJES DE ANILLOS
  const totalFlujo = ingNum + gasNum;
  const pctIngresos =
    totalFlujo > 0 ? Math.round((ingNum / totalFlujo) * 100) : 0;
  const pctGastos =
    totalFlujo > 0 ? Math.round((gasNum / totalFlujo) * 100) : 0;

  // 3. RENDERIZADO DE CAJA REAL Y TARJETAS PRINCIPALES
  const netEl = document.getElementById("val_neto");
  if (netEl) {
    netEl.innerText = formatMoneda(netoOperativo);
    netEl.style.color = netoOperativo >= 0 ? "#30d158" : "#ff453a";
  }

  if (document.getElementById("val_ingresos"))
    document.getElementById("val_ingresos").innerText = formatMoneda(ingNum);
  if (document.getElementById("val_gastos"))
    document.getElementById("val_gastos").innerText = formatMoneda(gasNum);
  if (document.getElementById("val_inversiones"))
    document.getElementById("val_inversiones").innerText = formatMoneda(invNum);
  if (document.getElementById("val_nomina"))
    document.getElementById("val_nomina").innerText = formatMoneda(nomNum);

  window.actualizarWidgetAnillosYBanderas(pctIngresos, pctGastos);

  // 4. PROYECCIONES Y FONDOS EMPRESARIALES
  const montoFondoNegocio = Math.round(ingNum * 0.55);
  const montoReservaNomina = Math.round(ingNum * 0.17);
  const totalFondosEmpresa = montoFondoNegocio + montoReservaNomina;

  if (document.getElementById("valProyNegocio"))
    document.getElementById("valProyNegocio").innerText =
      formatMoneda(montoFondoNegocio);
  if (document.getElementById("valProyNomina"))
    document.getElementById("valProyNomina").innerText =
      formatMoneda(montoReservaNomina);
  if (document.getElementById("valTotalFondosNegocio"))
    document.getElementById("valTotalFondosNegocio").innerText =
      formatMoneda(totalFondosEmpresa);

  // 5. CÁLCULO DE TU GANANCIA
  const miGananciaNeta = Math.round(ingNum * 0.28);
  const ahorroCalculado = Math.round(miGananciaNeta * 0.5);
  const otrosCalculado = miGananciaNeta - ahorroCalculado;

  const gananciaTotalMasJeisson = miGananciaNeta + montoJeissonExtraido;

  if (document.getElementById("valProyMio"))
    document.getElementById("valProyMio").innerText =
      formatMoneda(miGananciaNeta);
  if (document.getElementById("valGananciaAhorro"))
    document.getElementById("valGananciaAhorro").innerText =
      formatMoneda(ahorroCalculado);
  if (document.getElementById("valGananciaOtros"))
    document.getElementById("valGananciaOtros").innerText =
      formatMoneda(otrosCalculado);

  if (document.getElementById("valProyMioMasJeisson"))
    document.getElementById("valProyMioMasJeisson").innerText = formatMoneda(
      gananciaTotalMasJeisson,
    );

  // 6. DEUDAS E HISTORIAL
  if (
    window.globalFinanzasData.deudaActual !== undefined &&
    document.getElementById("valDeudaTotal")
  ) {
    document.getElementById("valDeudaTotal").value = parseFloat(
      window.globalFinanzasData.deudaActual || 0,
    ).toLocaleString("es-CO");
  }

  if (window.globalFinanzasData.listaDetallada) {
    window.renderizarHistorialMovimientosUI(
      window.globalFinanzasData.listaDetallada,
    );
  }
};

// 🎯 DIBUJAR ANILLOS DE COLOR Y LEYENDA
window.actualizarWidgetAnillosYBanderas = function (pctIng, pctGas) {
  const elementos = document.querySelectorAll(
    "span, div, p, b, strong, td, th",
  );

  elementos.forEach((el) => {
    if (el.children.length === 0 && el.textContent) {
      const txt = el.textContent.trim();

      if (txt === "Ingresos Totales") {
        const contenedorFila = el.closest("div, flex, tr") || el.parentElement;
        if (contenedorFila) {
          const elPct = Array.from(
            contenedorFila.querySelectorAll("span, div, p, b, strong"),
          ).find((node) => node !== el && node.textContent.includes("%"));
          if (elPct) elPct.textContent = pctIng + "%";
        }
      }

      if (txt === "Gastos Operativos") {
        const contenedorFila = el.closest("div, flex, tr") || el.parentElement;
        if (contenedorFila) {
          const elPct = Array.from(
            contenedorFila.querySelectorAll("span, div, p, b, strong"),
          ).find((node) => node !== el && node.textContent.includes("%"));
          if (elPct) elPct.textContent = pctGas + "%";
        }
      }
    }
  });

  const elementoCajaReal =
    document.getElementById("val_neto") ||
    Array.from(document.querySelectorAll("*")).find(
      (e) => e.textContent && e.textContent.includes("CAJA REAL"),
    );

  if (elementoCajaReal) {
    const tarjetaBento = elementoCajaReal.closest(
      ".card-ios, .bento-card, div",
    );
    if (tarjetaBento) {
      const svg = tarjetaBento.querySelector("svg");
      if (svg) {
        const c1 = 138.23;
        const c2 = 87.96;

        const offsetIng = c1 - (c1 * Math.min(pctIng, 100)) / 100;
        const offsetGas = c2 - (c2 * Math.min(pctGas, 100)) / 100;

        const nuevoSvgHTML = `
          <svg width="68" height="68" viewBox="0 0 60 60" style="transform: rotate(-90deg); flex-shrink: 0; filter: drop-shadow(0 0 6px rgba(0,0,0,0.5));">
            <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(48, 209, 88, 0.15)" stroke-width="5.5" />
            <circle cx="30" cy="30" r="22" fill="none" stroke="#30d158" stroke-width="5.5"
                    stroke-dasharray="${c1}" stroke-dashoffset="${offsetIng}" stroke-linecap="round"
                    style="transition: stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1);" />
            <circle cx="30" cy="30" r="14" fill="none" stroke="rgba(255, 69, 58, 0.15)" stroke-width="5.5" />
            <circle cx="30" cy="30" r="14" fill="none" stroke="#ff453a" stroke-width="5.5"
                    stroke-dasharray="${c2}" stroke-dashoffset="${offsetGas}" stroke-linecap="round"
                    style="transition: stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1);" />
          </svg>
        `;

        const parentSvg = svg.parentElement;
        if (parentSvg) {
          parentSvg.innerHTML = nuevoSvgHTML;
        }
      }
    }
  }
};

/* ==========================================================================
   💳 CONTROL DE DEUDA MUTUA (MODAL Y RETIROS)
   ========================================================================== */
window.modoOperacionModalActual = "prestamo";

window.agregarNuevoPrestamo = function () {
  if (typeof haptic === "function") haptic();
  window.modoOperacionModalActual = "prestamo";

  const titleEl = document.getElementById("titlePrestamoModal");
  const descEl = document.getElementById("descPrestamoModal");
  const inputEl = document.getElementById("inputMontoPrestamoModal");

  if (titleEl) titleEl.innerText = "➕ Nuevo Préstamo / Registro";
  if (descEl) descEl.innerText = "Ingresa el monto del nuevo préstamo:";
  if (inputEl) inputEl.value = "";

  const modal = document.getElementById("prestamoModalOverlay");
  if (modal) modal.style.display = "flex";
  setTimeout(() => {
    if (inputEl) inputEl.focus();
  }, 100);
};

window.aplicarRetiroDeudaHoy = function () {
  if (typeof haptic === "function") haptic();
  window.modoOperacionModalActual = "retiro";

  let sugeridoText = document.getElementById("valDescuentoHoy")
    ? document.getElementById("valDescuentoHoy").innerText.replace(/\D/g, "")
    : "0";
  let sugerido = parseFloat(sugeridoText) || 0;

  const titleEl = document.getElementById("titlePrestamoModal");
  const descEl = document.getElementById("descPrestamoModal");
  const inputEl = document.getElementById("inputMontoPrestamoModal");

  if (titleEl) titleEl.innerText = "🟢 Retirar / Abonar Dinero de Hoy";
  if (descEl)
    descEl.innerText = "Confirma o modifica la cantidad abonada/retirada hoy:";
  if (inputEl)
    inputEl.value = sugerido > 0 ? sugerido.toLocaleString("es-CO") : "";

  const modal = document.getElementById("prestamoModalOverlay");
  if (modal) modal.style.display = "flex";
  setTimeout(() => {
    if (inputEl) inputEl.focus();
  }, 100);
};

window.cerrarPrestamoModal = function () {
  if (typeof haptic === "function") haptic();
  const modal = document.getElementById("prestamoModalOverlay");
  if (modal) modal.style.display = "none";
};

window.confirmarOperacionPrestamoModal = function (e) {
  if (e) e.preventDefault();
  if (typeof haptic === "function") haptic();

  const inputEl = document.getElementById("inputMontoPrestamoModal");
  let montoRaw = inputEl ? inputEl.value.replace(/\D/g, "") : "0";
  let montoIngresado = parseFloat(montoRaw) || 0;

  if (montoIngresado <= 0) return;

  let valDeudaEl = document.getElementById("valDeudaTotal");
  let deudaActual = parseFloat(valDeudaEl.value.replace(/\D/g, "")) || 0;

  if (window.modoOperacionModalActual === "prestamo") {
    let nuevaDeuda = deudaActual + montoIngresado;
    valDeudaEl.value = nuevaDeuda.toLocaleString("es-CO");
  } else {
    let nuevaDeuda = Math.max(0, deudaActual - montoIngresado);
    valDeudaEl.value = nuevaDeuda.toLocaleString("es-CO");
  }

  if (typeof calcularDescuentoDeuda === "function") calcularDescuentoDeuda();
  window.cerrarPrestamoModal();

  if (typeof guardarDeudaEnSheets === "function") {
    guardarDeudaEnSheets();
  }
};

// 🎯 HISTORIAL DE MOVIMIENTOS OPTIMIZADO (SIN CORTE SUPERIOR Y LLENADO COMPLETO)
window.renderizarHistorialMovimientosUI = function (listaMovimientos) {
  const contenedor =
    document.getElementById("listaDesgloseGastos") ||
    document.querySelector("#historialMovimientosContainer") ||
    document.querySelector(".historial-movimientos-list") ||
    document.querySelector("#contenedorMovimientos");

  if (!contenedor) return;

  if (!listaMovimientos || listaMovimientos.length === 0) {
    contenedor.innerHTML = `
      <div style="text-align: center; color: #8e8e93; padding: 35px 10px; font-size: 0.9rem; font-weight: 600; background: rgba(255, 255, 255, 0.02); border-radius: 14px; border: 1px dashed rgba(255, 255, 255, 0.08);">
        📭 Sin movimientos registrados en esta fecha.
      </div>`;
    return;
  }

  let html = "";
  listaMovimientos.forEach((mov) => {
    const esIngreso = mov.tipo === "INGRESO";
    const colorMonto = esIngreso ? "#30d158" : "#ff453a";
    const signo = esIngreso ? "+" : "-";
    const montoFmt = "$" + Number(mov.monto).toLocaleString("es-CO");

    html += `
      <div style="background: rgba(255, 255, 255, 0.035); border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255, 255, 255, 0.08); transition: all 0.2s ease; box-sizing: border-box; width: 100%; flex-shrink: 0;" onmouseover="this.style.background='rgba(255, 255, 255, 0.06)'; this.style.borderColor='rgba(255,255,255,0.15)';" onmouseout="this.style.background='rgba(255, 255, 255, 0.035)'; this.style.borderColor='rgba(255,255,255,0.08)';">
        <div style="display: flex; flex-direction: column; gap: 3px; overflow: hidden; padding-right: 10px;">
          <div style="font-weight: 800; color: #ffffff; font-size: 0.9rem; letter-spacing: 0.2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${mov.categoria}</div>
          <div style="font-size: 0.78rem; color: #a1a1aa; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${mov.detalle || "Sin descripción"} • <span style="color: #71717a; font-family: monospace;">${mov.fecha}</span>
          </div>
        </div>
        <div style="font-weight: 900; font-size: 1.05rem; color: ${colorMonto}; font-family: monospace; letter-spacing: 0.3px; flex-shrink: 0; text-align: right;">
          ${signo}${montoFmt}
        </div>
      </div>`;
  });

  contenedor.innerHTML = html;
};

// 📌 ESCUCHADOR DE BOTONES "MES / HOY / AYER"
document.addEventListener("click", function (e) {
  const btn = e.target.closest("button, .btn-filtro, .pill-filtro");
  if (!btn) return;

  const txt = btn.innerText.trim().toLowerCase();
  if (txt === "mes" || txt.includes("mes")) {
    window.filtrarMes();
  } else if (txt === "hoy") {
    window.filtrarHoy();
  } else if (txt === "ayer") {
    window.filtrarAyer();
  }
});

// ==========================================
// 🚀 NÓMINA BENTO: RENDERIZADO EXCLUSIVO (Camilo Superadmin)
// ==========================================
window.renderizarTotalNomina = function () {
  const container = document.getElementById("nominaContentArea");
  if (!container) return;

  const activeStaff = (
    sessionStorage.getItem("active_staff") ||
    localStorage.getItem("cyber_saved_staff") ||
    "STAFF"
  )
    .toUpperCase()
    .trim();
  const esSuperAdmin = verificarSiEsSuperAdmin();

  const dMes = window.filtroMesTurnos;
  const dAnio = window.filtroAnioTurnos;
  const esQ1 = window.filtroQuincenaTurnos === 1;

  let mapaTelefonos = {};
  window.usuariosCache.forEach((u) => {
    let nom = (u.nombre || "").toUpperCase().trim();
    let num = (u.numero || u.telefono || "").trim();
    if (nom) mapaTelefonos[nom] = num;
  });

  let todosLosRegistros = window.currentHorasStock || [];
  let mapaNomina = {};

  todosLosRegistros.forEach((item) => {
    let d = parsearFechaTurno(item.fecha);
    if (d.getMonth() !== dMes || d.getFullYear() !== dAnio) return;

    let dia = d.getDate();
    if (esQ1 && dia > 15) return;
    if (!esQ1 && dia <= 15) return;

    let asist = (item.vendedor || "STAFF").toUpperCase().trim();
    if (!mapaNomina[asist])
      mapaNomina[asist] = { ganado: 0, descontado: 0, neto: 0 };

    let monto = parseFloat(item.total) || 0;
    let esAdelanto =
      monto < 0 || (item.estado || "").toUpperCase().includes("ADELANTO");

    if (esAdelanto) mapaNomina[asist].descontado += Math.abs(monto);
    else mapaNomina[asist].ganado += monto;
  });

  let listaProcesar = obtenerTodosLosAsistentes();
  if (!esSuperAdmin) listaProcesar = [activeStaff];

  let totalGlobalGanado = 0;
  let totalGlobalDescontado = 0;
  let totalGlobalNeto = 0;
  let htmlFilas = "";

  listaProcesar.forEach((asistente) => {
    let datosUser = mapaNomina[asistente] || {
      ganado: 0,
      descontado: 0,
      neto: 0,
    };
    let ganado = Math.round(datosUser.ganado);
    let descontado = Math.round(datosUser.descontado);
    let neto = ganado - descontado;

    if (asistente.toUpperCase() !== "JEISSON") {
      totalGlobalGanado += ganado;
      totalGlobalDescontado += descontado;
      totalGlobalNeto += neto;
    }

    let telefonoNum = mapaTelefonos[asistente] || "Sin Nequi";
    let colorNeto = neto < 0 ? "#ff453a" : "#30d158";

    let btnCopiarTel = "";
    if (telefonoNum !== "Sin Nequi") {
      btnCopiarTel = `
        <button onclick="navigator.clipboard.writeText('${telefonoNum}'); this.style.color='#30d158'; setTimeout(()=>this.style.color='#0a84ff', 1000);" title="Copiar Nequi/Bre-B" style="background: rgba(10, 132, 255, 0.15); border: 1px solid rgba(10, 132, 255, 0.3); color: #0a84ff; padding: 4px 8px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-size: 0.72rem; font-weight: 800; font-family: monospace; transition: 0.2s;">
          <span>${telefonoNum}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>`;
    } else {
      btnCopiarTel = `<span style="font-size:0.75rem; color:#71717a; padding-left:2px;">Sin Nequi</span>`;
    }

    htmlFilas += `
      <div style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 16px 14px; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s; flex-wrap: wrap; gap: 10px;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
        <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 140px;">
          <div style="width: 36px; height: 36px; border-radius: 12px; background: rgba(10, 132, 255, 0.15); border: 1px solid rgba(10, 132, 255, 0.3); color: #0a84ff; font-weight: 900; font-size: 1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${asistente.charAt(0)}
          </div>
          <div style="display: flex; flex-direction: column; gap: 3px; justify-content: center;">
            <span style="font-weight: 800; color: #ffffff; font-size: 0.95rem; line-height: 1;">${asistente}</span>
            ${btnCopiarTel}
          </div>
        </div>
        <div style="display: flex; flex-direction: row; justify-content: flex-end; align-items: center; gap: 20px; flex: 1; min-width: 160px;">
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
            <span style="font-size: 0.65rem; font-weight: 800; color: #a1a1aa; text-transform: uppercase;">Turnos (+)</span>
            <span style="font-family: monospace; font-weight: 700; color: #30d158; font-size: 0.95rem;">+$${ganado.toLocaleString("es-CO")}</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
            <span style="font-size: 0.65rem; font-weight: 800; color: #a1a1aa; text-transform: uppercase;">Adelantos (-)</span>
            <span style="font-family: monospace; font-weight: 700; color: #ff453a; font-size: 0.95rem;">-$${descontado.toLocaleString("es-CO")}</span>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center; flex: 0.5; min-width: 100px; padding-left: 10px; border-left: 1px solid rgba(255,255,255,0.08);">
          <span style="font-size: 0.68rem; font-weight: 800; color: #a1a1aa; text-transform: uppercase;">Sueldo Neto</span>
          <span style="font-family: monospace; font-weight: 900; color: ${colorNeto}; font-size: 1.2rem;">$${neto.toLocaleString("es-CO")}</span>
        </div>
      </div>`;
  });

  let htmlResumenGlobal = "";
  if (esSuperAdmin) {
    htmlResumenGlobal = `
      <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; width: 100%;">
        <div style="flex: 1; min-width: 130px; background: rgba(48, 209, 88, 0.08); border: 1px solid rgba(48, 209, 88, 0.2); padding: 16px; border-radius: 20px; display: flex; flex-direction: column; gap: 6px;">
          <span style="font-size: 0.72rem; font-weight: 800; color: #30d158; text-transform: uppercase;">Total Bruto (+)</span>
          <span style="font-size: 1.3rem; font-weight: 900; color: #30d158; font-family: monospace;">$${totalGlobalGanado.toLocaleString("es-CO")}</span>
        </div>
        <div style="flex: 1; min-width: 130px; background: rgba(255, 69, 58, 0.08); border: 1px solid rgba(255, 69, 58, 0.2); padding: 16px; border-radius: 20px; display: flex; flex-direction: column; gap: 6px;">
          <span style="font-size: 0.72rem; font-weight: 800; color: #ff453a; text-transform: uppercase;">Adelantos (-)</span>
          <span style="font-size: 1.3rem; font-weight: 900; color: #ff453a; font-family: monospace;">-$${totalGlobalDescontado.toLocaleString("es-CO")}</span>
        </div>
        <div style="flex: 1; min-width: 140px; background: rgba(10, 132, 255, 0.12); border: 1px solid rgba(10, 132, 255, 0.3); padding: 16px; border-radius: 20px; display: flex; flex-direction: column; gap: 6px;">
          <span style="font-size: 0.72rem; font-weight: 800; color: #ffffff; text-transform: uppercase;">Nómina Total Neta</span>
          <span style="font-size: 1.4rem; font-weight: 900; color: #ffffff; font-family: monospace;">$${totalGlobalNeto.toLocaleString("es-CO")}</span>
        </div>
      </div>`;
  }

  let htmlFinal = `
    <div style="display: flex; flex-direction: column; width: 100%;">
      ${htmlResumenGlobal}
      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; overflow: hidden; width: 100%;">
        <div style="display: flex; flex-direction: column; width: 100%;">
          ${htmlFilas}
        </div>
      </div>
    </div>`;

  container.innerHTML = htmlFinal;
};

window.cargarNominaMySQL = window.renderizarTotalNomina;

window.filtrarHorasInternas = function () {
  window.renderizarHorasEnPantalla();
};
