/* ==========================================================================
   💸 CYBERNET OS - FINANZAS, STAFF E INVENTARIO (finanzas_staff.js)
   ========================================================================== */

/* ==========================================================================
   ⏱️ CONTROL DE TURNOS Y CRONÓMETRO DE ASISTENTES
   ========================================================================== */
let timerInterval = null;
let isTimerPaused = false;

window.iniciarRelojTurno = window.startShiftTimer = function () {
  const activeUser =
    sessionStorage.getItem("active_staff") ||
    JSON.parse(sessionStorage.getItem("usuario_activo") || "{}").nombre;

  if (!sessionStorage.getItem("cyber_shift_start_time")) {
    sessionStorage.setItem("cyber_shift_start_time", Date.now());
  }

  // Registrar o recuperar turno activo desde MySQL al iniciar
  if (activeUser) {
    const formData = new FormData();
    formData.append("accion", "iniciar_turno");
    formData.append("vendedor", activeUser.toUpperCase());

    fetch("https://api.cybernetsp.com/acciones_mysql.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res && res.status === "success") {
          let segsPrevios = res.segundos_transcurridos || 0;
          sessionStorage.setItem(
            "cyber_shift_start_time",
            Date.now() - segsPrevios * 1000,
          );
          sessionStorage.setItem("cyber_last_sync_time", Date.now());
        }
      })
      .catch((err) => console.error("Error al iniciar turno en MySQL:", err));
  }

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(function () {
    if (isTimerPaused) return;

    let startTime =
      parseInt(sessionStorage.getItem("cyber_shift_start_time")) || Date.now();
    let totalMs = Date.now() - startTime;

    let totalSeconds = Math.floor(totalMs / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    let hStr = String(hours).padStart(2, "0");
    let mStr = String(minutes).padStart(2, "0");
    let sStr = String(seconds).padStart(2, "0");
    let tiempoTexto = `${hStr}:${mStr}:${sStr}`;

    let stElement = document.getElementById("shiftTimer");
    if (stElement) stElement.innerText = tiempoTexto;

    // Enviar pulso de guardado a MySQL cada 5 minutos
    let lastSync =
      parseInt(sessionStorage.getItem("cyber_last_sync_time"), 10) ||
      Date.now();
    if (Date.now() - lastSync >= 300000) {
      window.ejecutarAutoPulsoTiempo(tiempoTexto);
    }
  }, 1000);
};

window.ejecutarAutoPulsoTiempo = function (tiempoTexto) {
  const activeUser =
    sessionStorage.getItem("active_staff") ||
    JSON.parse(sessionStorage.getItem("usuario_activo") || "{}").nombre;
  if (!activeUser) return;

  sessionStorage.setItem("cyber_last_sync_time", Date.now());

  const formData = new FormData();
  formData.append("accion", "pulso_turno");
  formData.append("vendedor", activeUser.toUpperCase());
  formData.append("tiempo_trabajado", tiempoTexto || "00:00:00");

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then(() => {
      console.log("✅ Tiempo del asistente actualizado en MySQL:", tiempoTexto);
    })
    .catch((err) => console.error("Error al enviar pulso a MySQL:", err));
};

window.cerrarSesionStaff = function () {
  if (typeof haptic === "function") haptic();
  let usuarioActivo =
    sessionStorage.getItem("active_staff") ||
    JSON.parse(sessionStorage.getItem("usuario_activo") || "{}").nombre ||
    "STAFF";

  if (usuarioActivo.toUpperCase().trim() === "CAMILO") {
    sessionStorage.clear();
    localStorage.removeItem("cyber_saved_staff");
    location.reload();
    return;
  }

  if (
    confirm(
      "¿Estás seguro de que deseas cerrar tu sesión y finalizar tu turno de hoy?",
    )
  ) {
    let timerEl = document.getElementById("shiftTimer");
    let tiempoFinal = timerEl ? timerEl.innerText : "00:00:00";

    const formData = new FormData();
    formData.append("accion", "cerrar_turno");
    formData.append("vendedor", usuarioActivo.toUpperCase());
    formData.append("tiempo_trabajado", tiempoFinal);

    fetch("https://api.cybernetsp.com/acciones_mysql.php", {
      method: "POST",
      body: formData,
    })
      .then(() => {
        sessionStorage.clear();
        localStorage.removeItem("cyber_saved_staff");
        location.reload();
      })
      .catch(() => {
        sessionStorage.clear();
        localStorage.removeItem("cyber_saved_staff");
        location.reload();
      });
  }
};

/* ==========================================================================
   👥 CONTROL DE HORAS, ADELANTOS Y NÓMINA (MYSQL)
   ========================================================================== */
window.currentHorasStock = [];

const oldToggleShiftsPanel = window.toggleShiftsPanel;
window.toggleShiftsPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("shiftsOverlay");
  if (!overlay) return;

  if (overlay.classList.contains("open") || overlay.style.display === "flex") {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  } else {
    if (typeof cerrarTodasLasVentanas === "function") cerrarTodasLasVentanas();
    overlay.classList.add("open");
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    window.cargarHorasDesdeMySQL();
  }
};

window.forzarRefrescoDeHoras = function () {
  if (typeof haptic === "function") haptic();
  window.cargarHorasDesdeMySQL(true);
};

window.cargarHorasDesdeMySQL = function (silencioso = false) {
  const container = document.getElementById("shiftsScrollArea");
  if (!container) return;

  if (!silencioso) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:#a1a1aa; font-weight:600;">
        <svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:10px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg>
        <br>Cargando registros desde control_horas...
      </div>`;
  }

  const formData = new FormData();
  formData.append("accion", "obtener_control_horas");

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      if (res && res.status === "success") {
        window.currentHorasStock = (res.data || []).map((item) => ({
          id: item.id,
          vendedor: item.vendedor || item.usuario || "ASISTENTE",
          fecha:
            item.fecha ||
            (item.hora_inicio ? item.hora_inicio.split(" ")[0] : "-"),
          tiempo: item.tiempo_trabajado || item.horas || "00:00:00",
          pagoTurno:
            item.total !== undefined ? item.total : item.pago_turno || "0",
          estado: item.estado || "CERRADO",
          horaInicio: item.hora_inicio || "-",
          filaIndex: item.id,
        }));

        let query = document.getElementById("searchShiftsInput")
          ? document.getElementById("searchShiftsInput").value.toLowerCase()
          : "";
        window.renderizarHorasEnPantallaMySQL(query);

        if (silencioso && typeof triggerToast === "function") {
          triggerToast("✅ control_horas sincronizado");
        }
      } else {
        container.innerHTML = `<div style="text-align:center; padding:40px; color:#ff453a;">❌ Error: ${res ? res.message : "Fallo de consulta"}</div>`;
      }
    })
    .catch((err) => {
      console.error(err);
      container.innerHTML = `<div style="text-align:center; padding:40px; color:#ff453a;">❌ Error de conexión con acciones_mysql.php</div>`;
    });
};

window.renderizarHorasEnPantallaMySQL = function (filtro = "") {
  const container = document.getElementById("shiftsScrollArea");
  if (!container) return;

  const data = window.currentHorasStock || [];
  let filtrados = data.filter((item) => {
    if (!filtro) return true;
    return (
      (item.vendedor || "").toLowerCase().includes(filtro) ||
      (item.fecha || "").toLowerCase().includes(filtro) ||
      (item.estado || "").toLowerCase().includes(filtro)
    );
  });

  if (filtrados.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:40px; color:#a1a1aa; font-weight:600;">No hay registros en control_horas.</div>`;
    return;
  }

  let html = `<div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">`;

  filtrados.forEach((turno) => {
    const esActivo = turno.estado === "ACTIVO";
    const colorEstado = esActivo ? "#30d158" : "#a1a1aa";
    const textoEstado = esActivo ? "🟢 EN CURSO" : "🔴 CERRADO";

    html += `
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <b style="color: #ffffff; font-size: 1rem; text-transform: uppercase;">${turno.vendedor}</b>
            <span style="font-size: 0.72rem; font-weight: 800; color: ${colorEstado}; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 6px;">${textoEstado}</span>
          </div>
          <span style="font-size: 0.78rem; color: #a1a1aa;">📅 Fecha: <b style="color: #ffffff;">${turno.fecha}</b></span>
        </div>

        <div style="display: flex; gap: 16px; align-items: center;">
          <div style="display: flex; flex-direction: column; text-align: right;">
            <span style="font-size: 0.68rem; color: #a1a1aa; text-transform: uppercase; font-weight: 700;">Tiempo Trabajado</span>
            <span style="font-size: 1.1rem; font-weight: 900; color: #0a84ff; font-family: monospace;">${turno.tiempo}</span>
          </div>
          <div style="display: flex; flex-direction: column; text-align: right; border-left: 1px solid rgba(255,255,255,0.08); padding-left: 14px;">
            <span style="font-size: 0.68rem; color: #a1a1aa; text-transform: uppercase; font-weight: 700;">Inicio</span>
            <span style="font-size: 0.82rem; font-weight: 700; color: #ffffff; font-family: monospace;">${turno.horaInicio.split(" ")[1] || turno.horaInicio}</span>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
};

window.filtrarHorasInternas = function () {
  const query = document
    .getElementById("searchShiftsInput")
    .value.toLowerCase()
    .trim();
  window.renderizarHorasEnPantallaMySQL(query);
};

window.toggleFormularioHoras = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("addHoursOverlay");
  if (!overlay) return;

  if (overlay.style.display === "flex") {
    overlay.style.display = "none";
  } else {
    overlay.style.display = "flex";
    window.cargarUsuariosSelects();

    const inputFecha = document.getElementById("inputFechaShift");
    if (inputFecha && !inputFecha.value) {
      inputFecha.value = new Date().toISOString().split("T")[0];
    }
  }
};

window.ejecutarGuardadoHorasManual = function (event) {
  if (event) event.preventDefault();
  if (typeof haptic === "function") haptic();

  const vendedor = document.getElementById("inputVendedorShift").value.trim();
  const horas = document.getElementById("inputHorasShift").value.trim();
  const fecha = document.getElementById("inputFechaShift").value.trim();

  const formData = new FormData();
  formData.append("vendedor", vendedor);
  formData.append("horas", horas);
  formData.append("fecha", fecha);

  fetch("https://api.cybernetsp.com/guardar_horas_manual.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        if (typeof triggerToast === "function")
          triggerToast("✅ " + data.message);
        document.getElementById("inputHorasShift").value = "";
        window.toggleFormularioHoras();
        window.forzarRefrescoDeHoras();
      } else {
        alert("Error: " + data.message);
      }
    })
    .catch((err) => console.error(err));
};

window.toggleModalAdelanto = function (show) {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("adelantoShiftOverlay");
  if (!overlay) return;

  overlay.style.display = show ? "flex" : "none";
  if (show) {
    window.cargarUsuariosSelects();
  } else {
    const form = document.getElementById("formAdelantoShift");
    if (form) form.reset();
  }
};

window.ejecutarAdelantoDesdeShift = function (e) {
  if (e) e.preventDefault();
  if (typeof haptic === "function") haptic();

  const empleado = document.getElementById("adeEmpleado").value;
  const montoRaw = document.getElementById("adeMonto").value;
  const montoLimpio = parseInt(montoRaw.replace(/\D/g, ""), 10) || 0;

  if (!empleado || montoLimpio <= 0) {
    alert("⚠️ Por favor ingresa un monto válido.");
    return;
  }

  const btn = document.getElementById("btnSubmitAdeShift");
  const originalText = btn.innerHTML;
  btn.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg> Aplicando...`;
  btn.disabled = true;

  const formData = new FormData();
  formData.append("accion", "guardar_adelanto");
  formData.append("empleado", empleado);
  formData.append("monto", montoLimpio);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      btn.innerHTML = originalText;
      btn.disabled = false;

      if (data.status === "success") {
        if (typeof triggerToast === "function")
          triggerToast(`💸 ${data.message}`);
        window.toggleModalAdelanto(false);
        window.forzarRefrescoDeHoras();
      } else {
        alert("❌ Error: " + data.message);
      }
    })
    .catch((err) => {
      btn.innerHTML = originalText;
      btn.disabled = false;
      console.error(err);
      alert("❌ Error de comunicación con MySQL.");
    });
};

window.abrirTotalNomina = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("nominaOverlay");
  if (overlay) {
    overlay.style.display = "flex";
    window.cargarNominaMySQL();
  }
};

window.cerrarTotalNomina = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("nominaOverlay");
  if (overlay) overlay.style.display = "none";
};

window.refrescarTotalNominaEnVivo = function () {
  if (typeof haptic === "function") haptic();
  window.cargarNominaMySQL();
};

window.cargarNominaMySQL = function () {
  const contenedor = document.getElementById("nominaContentArea");
  if (!contenedor) return;

  contenedor.innerHTML =
    '<div class="empty-log-msg" style="background: rgba(0, 0, 0, 0.2); border-radius: 20px; padding: 40px; text-align: center; color: var(--ios-green);">Calculando nómina desde MySQL...</div>';

  fetch("https://api.cybernetsp.com/obtener_nomina.php")
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success") {
        if (res.data.length === 0) {
          contenedor.innerHTML =
            '<div class="empty-log-msg" style="text-align:center; padding:30px;">No hay registros de sueldos aún.</div>';
          return;
        }

        let html =
          '<div style="display: flex; flex-direction: column; gap: 12px;">';
        res.data.forEach((item) => {
          const ganadoFmt = new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
          }).format(item.ganado);
          const descFmt = new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
          }).format(item.descontado);
          const netoFmt = new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
          }).format(item.neto);

          html += `
            <div class="card-ios" style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); padding: 18px 22px; border-radius: 18px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-weight: 800; font-size: 1.05rem; color: #ffffff; display: block;">${item.empleado}</span>
                <span style="font-size: 0.78rem; color: var(--text-secondary);">Ganado: <b style="color: #30d158;">${ganadoFmt}</b> | Adelantos: <b style="color: #ff453a;">-${descFmt}</b></span>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; display: block; font-weight: 700;">Neto a Pagar</span>
                <span style="font-size: 1.25rem; font-weight: 800; color: ${item.neto >= 0 ? "#30d158" : "#ff453a"}; font-family: monospace;">${netoFmt}</span>
              </div>
            </div>`;
        });
        html += "</div>";
        contenedor.innerHTML = html;
      } else {
        contenedor.innerHTML = `<div style="text-align:center; color: var(--ios-red); padding: 20px;">Error: ${res.message}</div>`;
      }
    })
    .catch((err) => {
      contenedor.innerHTML =
        '<div style="text-align:center; color: var(--ios-red); padding: 20px;">❌ Error de conexión (obtener_nomina.php).</div>';
      console.error(err);
    });
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

window.cargarUsuariosSelects = function () {
  const selectVend = document.getElementById("inputVendedorShift");
  const selectAde = document.getElementById("adeEmpleado");

  fetch("https://api.cybernetsp.com/obtener_usuarios.php")
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success" && res.data.length > 0) {
        let optionsHtml =
          '<option value="" disabled selected>Selecciona trabajador...</option>';
        res.data.forEach((nombre) => {
          optionsHtml += `<option value="${nombre}">${nombre}</option>`;
        });

        if (selectVend) selectVend.innerHTML = optionsHtml;
        if (selectAde) selectAde.innerHTML = optionsHtml;

        const usuarioActivoObj = JSON.parse(
          sessionStorage.getItem("usuario_activo") || "null",
        );
        if (usuarioActivoObj && selectVend) {
          selectVend.value = usuarioActivoObj.nombre.toUpperCase();
        }
      } else {
        let errHtml = `<option value="" disabled selected>❌ ${res.message || "Sin usuarios"}</option>`;
        if (selectVend) selectVend.innerHTML = errHtml;
        if (selectAde) selectAde.innerHTML = errHtml;
      }
    })
    .catch((err) => {
      console.error("Error al cargar usuarios de MySQL:", err);
      let errHtml =
        '<option value="" disabled selected>❌ Error al conectar con obtener_usuarios.php</option>';
      if (selectVend) selectVend.innerHTML = errHtml;
      if (selectAde) selectAde.innerHTML = errHtml;
    });
};

/* ==========================================================================
   📦 CONTROL DE INVENTARIO / SWITCHES DE PLATAFORMAS
   ========================================================================== */
const oldToggleInventarioPanel = window.toggleInventarioPanel;
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
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
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
   💳 SALDO DE DISTRIBUIDORES (RENDERIZADO FLEXBOX CON SVG DERECHO)
   ========================================================================== */
const oldToggleDistrisPanel = window.toggleDistrisPanel;
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
          container.innerHTML = `<div style="text-align: center; padding: 30px; color: #a1a1aa;">No hay distribuidores registrados.</div>`;
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

          html += `
            <div class="distri-row-item" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; transition: all 0.2s ease;">
              <!-- LADO IZQUIERDO: NOMBRE Y TELÉFONO -->
              <div style="display: flex; flex-direction: column; gap: 3px; overflow: hidden; flex: 1;">
                <div style="font-weight: 800; font-size: 0.95rem; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${nombreLimpio}</div>
                <div style="font-size: 0.78rem; color: #a1a1aa; font-family: monospace; display: flex; align-items: center; gap: 4px;">
                  <span>📱 ${telefonoReal}</span>
                </div>
              </div>

              <!-- LADO DERECHO: SALDO Y BOTÓN SVG DE COPIAR -->
              <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
                <span style="font-size: 1.15rem; font-weight: 900; color: ${colorSaldo}; font-family: monospace; letter-spacing: 0.5px;">${saldoFormateado}</span>
                <button type="button" 
                        onclick="window.copiarSaldoDistri(this, '${nombreLimpio.replace(/'/g, "\\'")}', '${saldoFormateado}')" 
                        title="Copiar reporte de saldo"
                        style="background: rgba(10, 132, 255, 0.15); border: 1px solid rgba(10, 132, 255, 0.3); color: #0a84ff; padding: 8px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;" 
                        onmouseover="this.style.background='rgba(10, 132, 255, 0.25)'" 
                        onmouseout="this.style.background='rgba(10, 132, 255, 0.15)'">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
    let originalHTML = btn.innerHTML;
    let originalBg = btn.style.background;

    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#30d158" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    btn.style.setProperty("background", "rgba(48, 209, 88, 0.2)", "important");

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Reporte de saldo copiado</span></div>`,
      );
    }

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = originalBg;
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

  const txtPeriodo = document.getElementById("txtPeriodoLabel");
  if (txtPeriodo)
    txtPeriodo.innerText =
      window.activePeriod === "mes"
        ? "CAJA REAL MENSUAL"
        : `CAJA REAL DÍA ${dia}`;

  const txtLibro = document.getElementById("txtLibroHeader");
  if (txtLibro)
    txtLibro.innerText =
      dia === "TODOS" || dia === ""
        ? `LIBRO DE ${mes}`
        : `LIBRO DEL DÍA ${dia} DE ${mes}`;

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
  const hoy = new Date();
  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");
  if (mSelect && dSelect) {
    mSelect.value = mesesArray[hoy.getMonth()];
    dSelect.value = "TODOS";
    window.actualizarFiltrosUI();
  }
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

  const activeKey = window.activePeriod || "dia";
  const d =
    window.globalFinanzasData[activeKey] ||
    window.globalFinanzasData["mes"] ||
    window.globalFinanzasData["dia"];

  if (!d) return;

  const netEl = document.getElementById("val_neto");
  if (netEl) {
    netEl.innerText = formatMoneda(d.neto);
    netEl.style.color = d.neto >= 0 ? "#30d158" : "#ff453a";
  }

  if (document.getElementById("val_ingresos"))
    document.getElementById("val_ingresos").innerText = formatMoneda(
      d.ingresos,
    );
  if (document.getElementById("val_gastos"))
    document.getElementById("val_gastos").innerText = formatMoneda(d.gastos);
  if (document.getElementById("val_inversiones"))
    document.getElementById("val_inversiones").innerText = formatMoneda(
      d.inversiones,
    );
  if (document.getElementById("val_nomina"))
    document.getElementById("val_nomina").innerText = formatMoneda(d.nomina);

  const baseVentas = d.ingresos || 0;
  const montoFondoNegocio = Math.round(baseVentas * 0.55);
  const montoReservaNomina = Math.round(baseVentas * 0.17);
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

  const miGananciaNeta = Math.round(baseVentas * 0.28);
  const ahorroCalculado = Math.round(miGananciaNeta * 0.5);
  const otrosCalculado = miGananciaNeta - ahorroCalculado;

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
    document.getElementById("valProyMioMasJeisson").innerText =
      formatMoneda(miGananciaNeta);

  if (
    window.globalFinanzasData.deudaActual !== undefined &&
    document.getElementById("valDeudaTotal")
  ) {
    document.getElementById("valDeudaTotal").value = parseFloat(
      window.globalFinanzasData.deudaActual || 0,
    ).toLocaleString("es-CO");
  }
  if (
    window.globalFinanzasData.tipoDeudaActual &&
    document.getElementById("tipoDeudaMutua")
  ) {
    document.getElementById("tipoDeudaMutua").value =
      window.globalFinanzasData.tipoDeudaActual;
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
