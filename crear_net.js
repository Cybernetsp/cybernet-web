/* ==========================================================================
   🌟 CYBERNET OS - CREACIÓN, VERIFICACIÓN Y GUARDADO DUAL (SHEETS + MYSQL)
   ========================================================================== */

const SCRIPT_URL_NETFLIX_GEN =
  typeof GOOGLE_SCRIPT_URL !== "undefined" && GOOGLE_SCRIPT_URL
    ? GOOGLE_SCRIPT_URL
    : "https://script.google.com/macros/s/AKfycbxqKpMcC5BI0H6PHnImu5Lkw3ryiuFO0fW0KJAhQ_45kzglYn9CpN1O2fCjezXM5oMi/exec";

window.pinOcultoActual = "";
window.verificationLinkInterval = null;

// ==========================================================================
// 1. PUNTO DE ENTRADA PRINCIPAL
// ==========================================================================
window.crearCuentaNetflixAlias = function () {
  if (typeof haptic === "function") haptic();

  // Revisar si hay una cuenta pendiente de guardado en la memoria local
  let pendienteGuardada = localStorage.getItem("cyber_netflix_alias_pendiente");

  if (pendienteGuardada) {
    let d = JSON.parse(pendienteGuardada);
    window.pinOcultoActual = d.pinRefacil || "";
    window.restaurarInterfazAliasGenerada(d);
    return;
  }

  // Si no hay nada pendiente, genera una nueva cuenta
  window.ejecutarGeneracionNuevaCuentaAlias();
};

// Alias para compatibilidad
window.crearCuentaNetflixAliasExterna = window.crearCuentaNetflixAlias;

// ==========================================================================
// 2. GENERAR NUEVA CUENTA EN SHEETS (RESERVA ALIAS + PIN EN PINESMES)
// ==========================================================================
window.ejecutarGeneracionNuevaCuentaAlias = function () {
  if (typeof haptic === "function") haptic();

  if (
    !confirm(
      "❓ ¿Deseas CREAR UNA CUENTA NUEVA de Netflix?\n\nEl sistema tomará un PIN de REFÁCIL y un correo libre de ALIAS.",
    )
  ) {
    return;
  }

  // Dibujar Modal de Espera
  window.abrirModalSuscripcionEstructura();

  const userActivo =
    sessionStorage.getItem("active_staff") ||
    localStorage.getItem("cyber_saved_staff") ||
    "Admin";

  // Intentar primero con JSONP, si falla usar fetch con proxy
  const url = `${SCRIPT_URL_NETFLIX_GEN}?action=generarNuevaCuentaAlias&user=${encodeURIComponent(userActivo)}&callback=callbackCiber&_ts=${Date.now()}`;
  console.log("Intentando JSONP:", url);

  // El Google Script usa callbackCiber como nombre fijo
  window.callbackCiber = function (res) {
    console.log("✅ Callback ejecutado. Respuesta del Google Script:", res);
    const scriptNode = document.getElementById("node_script_netflix");
    if (scriptNode) scriptNode.remove();
    delete window.callbackCiber;

    if (res && res.status === "success" && res.data) {
      const d = res.data;
      window.pinOcultoActual = d.pinRefacil;

      // Guardar en memoria local para que no se pierda al recargar
      localStorage.setItem("cyber_netflix_alias_pendiente", JSON.stringify(d));

      window.restaurarInterfazAliasGenerada(d);
    } else {
      alert(
        "❌ Error: " +
          (res
            ? res.message
            : "Fallo al conectar con Google Sheets. Verifica PINs libres en REFÁCIL."),
      );
      const modal = document.getElementById("cuentaGeneradaModalOverlay");
      if (modal) modal.remove();
    }
  };

  // Usar JSONP como el método original
  const script = document.createElement("script");
  script.id = "node_script_netflix";
  script.src = url;
  script.onload = function() {
    console.log("Script cargado, esperando callback...");
  };
  script.onerror = function(e) {
    console.error("Error al cargar el script con JSONP:", e);
    alert("❌ Error: No se pudo conectar con Google Script. Verifica tu conexión.");
    const modal = document.getElementById("cuentaGeneradaModalOverlay");
    if (modal) modal.remove();
  };
  document.body.appendChild(script);
  console.log("Llamando al Google Script con JSONP:", script.src);

  // Timeout para detectar si el script no responde
  setTimeout(() => {
    if (window.callbackCiber) {
      console.error("El Google Script no respondió en 30 segundos");
      const scriptNode = document.getElementById("node_script_netflix");
      if (scriptNode) {
        console.log("Script node existe, eliminándolo");
        scriptNode.remove();
      }
      delete window.callbackCiber;
      alert("⏱️ El Google Script no respondió. Intenta nuevamente.");
      const modal = document.getElementById("cuentaGeneradaModalOverlay");
      if (modal) modal.remove();
    }
  }, 30000);
};

// ==========================================================================
// 3. DIBUJAR PANTALLA "SUSCRIPCIÓN CREADA" (IGUAL A TU DISEÑO)
// ==========================================================================
window.abrirModalSuscripcionEstructura = function () {
  const existingModal = document.getElementById("cuentaGeneradaModalOverlay");
  if (existingModal) existingModal.remove();

  const modalHtml = `
    <div class="overlay-ios open" id="cuentaGeneradaModalOverlay" style="display: flex !important; z-index: 999999 !important; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(14px); align-items: center; justify-content: center;">
      <div class="modal-ios" style="max-width: 500px; width: 92%; max-height: 90vh; background: #000000; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 0; display: flex; flex-direction: column; gap: 0; box-shadow: 0 40px 100px rgba(0,0,0,0.8); position: relative; overflow: hidden;">

        <!-- Encabezado -->
        <div style="display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 28px 32px; background: rgba(255, 255, 255, 0.03);">
          <div style="background: rgba(255,255,255,0.1); color: #ffffff; width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h3 style="margin: 0; color: #ffffff; font-size: 1.4rem; font-weight: 600; letter-spacing: -0.5px;">Suscripción Creada</h3>
        </div>

        <div style="padding: 28px 32px 32px 32px; display: flex; flex-direction: column; gap: 20px; overflow-y: auto; max-height: calc(90vh - 90px);">
          <!-- Alerta Obligatoria -->
          <div style="color: rgba(255,255,255,0.6); font-size: 0.8rem; font-weight: 500; text-align: center; background: rgba(255,255,255,0.03); padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
            Debes inyectar al maestro antes de salir
          </div>

          <!-- Caja Spinner / Radar de Gmail -->
          <div id="radarVerificacionContenedor" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 18px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;">
            <div id="radarVerificacionSpinner" style="color: rgba(255,255,255,0.7); font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 10px;">
              <svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
              Esperando correo de verificación...
            </div>

            <!-- Botón Enlace de Verificación (Oculto Inicialmente) -->
            <a id="btnLinkVerificarGmail" href="#" target="_blank" style="display: none; width: 100%; background: rgba(255,255,255,0.1); color: #ffffff; text-decoration: none; padding: 14px; border-radius: 14px; font-weight: 500; font-size: 0.95rem; align-items: center; justify-content: center; gap: 10px; border: 1px solid rgba(255,255,255,0.15);">
              Verificar Correo en Netflix
            </a>
          </div>

          <!-- Bloque Correo -->
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px 18px; cursor: pointer; transition: background 0.2s;" onclick="window.copiarDatoCuentaNueva('displayCtaCorreo', this)">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 0.7rem; color: rgba(255,255,255,0.5); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Correo Electrónico</span>
              <span id="displayCtaCorreo" style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; font-size: 1rem; font-weight: 500; color: #ffffff; word-break: break-all;">Cargando...</span>
            </div>
          </div>

          <!-- Bloque Contraseña -->
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px 18px; cursor: pointer; transition: background 0.2s;" onclick="window.copiarDatoCuentaNueva('displayCtaClave', this)">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 0.7rem; color: rgba(255,255,255,0.5); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Contraseña</span>
              <span id="displayCtaClave" style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; font-size: 1rem; font-weight: 500; color: #ffffff;">Cargando...</span>
            </div>
          </div>

          <!-- Bloque PIN de Activación -->
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px 18px; cursor: pointer; transition: background 0.2s;" onclick="window.copiarDatoCuentaNueva('displayCtaPinRecarga', this)">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 0.7rem; color: rgba(255,255,255,0.5); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">PIN de Activación</span>
              <span id="displayCtaPinRecarga" style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; font-size: 0.95rem; font-weight: 500; color: rgba(255,255,255,0.6);">Oculto (Esperando a Netflix...)</span>
            </div>
          </div>

          <!-- Botón Inyectar al Maestro (Inicialmente Oculto) -->
          <button id="btnGuardarMaestroNetflix" style="display: none; width: 100%; background: rgba(255,255,255,0.1); color: #ffffff; border: 1px solid rgba(255,255,255,0.15); padding: 16px; border-radius: 14px; font-weight: 500; font-size: 1rem; cursor: pointer; transition: all 0.2s;">
            Guardar en Inventario Maestro
          </button>

          <!-- Botón Descartar Cuenta Mala -->
          <button id="btnCuentaMalaAlias" onclick="window.cambiarCuentaMalaAlias()" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); padding: 14px; border-radius: 14px; font-weight: 500; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;">
            No llego correo de verificacion
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
};

// ==========================================================================
// 4. RESTAURAR PANTALLA Y ARRANQUE DEL RADAR DE GMAIL
// ==========================================================================
window.restaurarInterfazAliasGenerada = function (d) {
  window.abrirModalSuscripcionEstructura();

  document.getElementById("displayCtaCorreo").innerText = d.correo;
  document.getElementById("displayCtaClave").innerText = d.clave;
  document.getElementById("displayCtaPinRecarga").innerText =
    "Oculto (Esperando a Netflix...)";
  document.getElementById("displayCtaPinRecarga").style.color = "#888";

  const btnGuardar = document.getElementById("btnGuardarMaestroNetflix");
  btnGuardar.onclick = function () {
    let datosFrescos =
      JSON.parse(localStorage.getItem("cyber_netflix_alias_pendiente")) || d;
    datosFrescos.pinRecarga = window.pinOcultoActual;
    window.guardarCuentaConfirmadaNetflixDual(btnGuardar, datosFrescos);
  };

  // Lanzar búsqueda continua de correos en Gmail
  window.lanzarRadarEspiaAlias(d.correo);
};

// ==========================================================================
// 5. RADAR ESPIA DE GMAIL (MONITOREA PIN Y LINK DE VERIFICACIÓN)
// ==========================================================================
window.lanzarRadarEspiaAlias = function (correoTarget) {
  if (window.verificationLinkInterval)
    clearInterval(window.verificationLinkInterval);

  window.verificationLinkInterval = setInterval(function () {
    // El Google Script usa callbackCiber como nombre fijo
    window.callbackCiber = function (res) {
      const node = document.getElementById("node_radar_netflix");
      if (node) node.remove();
      delete window.callbackCiber;

      if (res && res.status === "success") {
        // 1. Si llegó el correo del PIN o el enlace
        if (res.yaCasiTerminas || res.linkVerificacion) {
          const pinEl = document.getElementById("displayCtaPinRecarga");
          if (pinEl && pinEl.innerText !== window.pinOcultoActual) {
            if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");
            pinEl.innerText = window.pinOcultoActual;
            pinEl.style.color = "#ffffff";

            const spinner = document.getElementById("radarVerificacionSpinner");
            if (spinner) {
              spinner.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> PIN revelado. Esperando link de verificación...`;
            }
          }
        }

        // 2. Si llegó el Link de Verificación
        if (res.linkVerificacion) {
          clearInterval(window.verificationLinkInterval);
          if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");

          const spinner = document.getElementById("radarVerificacionSpinner");
          if (spinner)
            spinner.style.setProperty("display", "none", "important");

          const btnLink = document.getElementById("btnLinkVerificarGmail");
          if (btnLink) {
            btnLink.href = res.linkVerificacion;
            btnLink.innerHTML = "Verificar Correo en Netflix";
            btnLink.style.setProperty("display", "inline-flex", "important");

            // Al darle clic al link, se habilita el botón de Guardar en Maestro
            btnLink.onclick = function () {
              if (typeof haptic === "function") haptic();
              const btnG = document.getElementById("btnGuardarMaestroNetflix");
              if (btnG) btnG.style.setProperty("display", "block", "important");

              const btnM = document.getElementById("btnCuentaMalaAlias");
              if (btnM) btnM.style.display = "none";
            };
          }

          const contenedor = document.getElementById(
            "radarVerificacionContenedor",
          );
          if (contenedor) {
            contenedor.style.background = "rgba(255,255,255,0.08)";
          }
        }
      }
    };

    const script = document.createElement("script");
    script.id = "node_radar_netflix";
    script.src = `${SCRIPT_URL_NETFLIX_GEN}?action=obtenerEstadoVerificacionAlias&correo=${encodeURIComponent(correoTarget)}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  }, 4000);
};

// ==========================================================================
// 6. GUARDAR CUENTA CONFIRMADA (PASO FINAL: SHEETS + MYSQL)
// ==========================================================================
window.guardarCuentaConfirmadaNetflixDual = function (btn, datosCuenta) {
  if (typeof haptic === "function") haptic();

  btn.disabled = true;
  btn.style.pointerEvents = "none";
  btn.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> 1/2: Inyectando en Sheets...`;

  // El Google Script usa callbackCiber como nombre fijo
  window.callbackCiber = function (res) {
    const scriptNode = document.getElementById("node_save_netflix");
    if (scriptNode) scriptNode.remove();
    delete window.callbackCiber;

    if (res && res.status === "success") {
      btn.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> 2/2: Inyectando en MySQL...`;

      // Inyección inmediata en MySQL
      const formData = new FormData();
      formData.append("accion", "confirmar_guardado_netflix");
      formData.append("correo", datosCuenta.correo);
      formData.append("clave", datosCuenta.clave);

      fetch("https://api.cybernetsp.com/acciones_mysql.php", {
        method: "POST",
        body: formData,
      })
        .then((r) => r.json())
        .then((dbRes) => {
          if (dbRes && dbRes.status === "success") {
            // Éxito absoluto en ambos lados
            localStorage.removeItem("cyber_netflix_alias_pendiente");
            if (window.verificationLinkInterval)
              clearInterval(window.verificationLinkInterval);

            const modal = document.getElementById("cuentaGeneradaModalOverlay");
            if (modal) modal.remove();

            if (typeof triggerToast === "function")
              triggerToast(
                `✅ Cuenta inyectada a Sheets y MySQL: ${datosCuenta.correo}`,
              );

            if (typeof window.cargarDatosMySQL === "function")
              window.cargarDatosMySQL();
            if (typeof window.cargarCortesOperativosNetflix === "function")
              window.cargarCortesOperativosNetflix();
          } else {
            alert(
              "⚠️ Guardado en Sheets, pero hubo error en MySQL: " +
                (dbRes ? dbRes.message : "Desconocido"),
            );
            btn.disabled = false;
            btn.style.pointerEvents = "auto";
            btn.innerHTML = "✓ Reintentar Guardado MySQL";
          }
        })
        .catch((err) => {
          console.error(err);
          alert("❌ Error conectando con la base de datos MySQL.");
          btn.disabled = false;
          btn.style.pointerEvents = "auto";
          btn.innerHTML = "✓ Reintentar Guardado MySQL";
        });
    } else {
      alert(
        "❌ Error al guardar en Sheets: " +
          (res ? res.message : "Fallo de conexión."),
      );
      btn.disabled = false;
      btn.style.pointerEvents = "auto";
      btn.innerHTML = "✓ Reintentar Guardar";
    }
  };

  const script = document.createElement("script");
  script.id = "node_save_netflix";
  const urlParams = `?action=confirmarGuardadoNetflix&correo=${encodeURIComponent(datosCuenta.correo)}&clave=${encodeURIComponent(datosCuenta.clave)}&_ts=${Date.now()}`;
  script.src = SCRIPT_URL_NETFLIX_GEN + urlParams;
  document.body.appendChild(script);
};

// ==========================================================================
// 7. DESCARTAR CUENTA MALA Y PEDIR OTRA
// ==========================================================================
window.cambiarCuentaMalaAlias = function () {
  if (typeof haptic === "function") haptic();

  if (
    !confirm(
      "⚠️ ¿Estás seguro de que esta cuenta no sirve?\n\nSe marcará en ROJO en ALIAS, se borrará de PINESMES y te entregaremos una nueva.",
    )
  )
    return;

  let correoMalo = document.getElementById("displayCtaCorreo").innerText;
  const btnMala = document.getElementById("btnCuentaMalaAlias");
  btnMala.disabled = true;
  btnMala.innerHTML = "Descartando y buscando nueva...";

  // El Google Script usa callbackCiber como nombre fijo
  window.callbackCiber = function (res) {
    btnMala.disabled = false;
    btnMala.innerHTML = "✕ Esta cuenta no sirve (Descartar y buscar otra)";
    const scriptNode = document.getElementById("node_mala_netflix");
    if (scriptNode) scriptNode.remove();
    delete window.callbackCiber;

    if (res && res.status === "success") {
      let d =
        JSON.parse(localStorage.getItem("cyber_netflix_alias_pendiente")) || {};
      d.correo = res.correoNuevo;
      d.clave = res.claveNueva;
      localStorage.setItem("cyber_netflix_alias_pendiente", JSON.stringify(d));

      document.getElementById("displayCtaCorreo").innerText = res.correoNuevo;
      document.getElementById("displayCtaClave").innerText = res.claveNueva;

      if (window.verificationLinkInterval)
        clearInterval(window.verificationLinkInterval);
      document.getElementById("displayCtaPinRecarga").innerText =
        "Oculto (Esperando a Netflix...)";
      document.getElementById("displayCtaPinRecarga").style.color = "#888";

      const spinner = document.getElementById("radarVerificacionSpinner");
      if (spinner) {
        spinner.style.setProperty("display", "flex", "important");
        spinner.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Esperando correo de verificación...`;
      }

      window.lanzarRadarEspiaAlias(res.correoNuevo);
    } else {
      alert(
        "❌ Error: " + (res ? res.message : "No se pudo cambiar la cuenta."),
      );
    }
  };

  const script = document.createElement("script");
  script.id = "node_mala_netflix";
  const user = sessionStorage.getItem("active_staff") || "Sistema";
  script.src = `${SCRIPT_URL_NETFLIX_GEN}?action=cambiarCuentaMalaAlias&correoMalo=${encodeURIComponent(correoMalo)}&user=${encodeURIComponent(user)}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// ==========================================================================
// 8. HELPER DE COPIADO DE DATOS
// ==========================================================================
window.copiarDatoCuentaNueva = function (idElemento, contenedor) {
  if (typeof haptic === "function") haptic();
  let texto = document.getElementById(idElemento).innerText;

  if (!texto || texto.includes("Cargando") || texto.includes("Oculto")) return;

  navigator.clipboard.writeText(texto).then(function () {
    // Cambiar el fondo temporalmente para indicar que se copió
    let originalBackground = contenedor.style.background;
    contenedor.style.background = "rgba(255,255,255,0.15)";

    setTimeout(function () {
      contenedor.style.background = originalBackground;
    }, 300);

    // Verificar si existe el appleToast y usar el sistema existente
    const appleToast = document.getElementById("appleToast");
    if (appleToast && typeof window.mostrarToastIOS === "function") {
      window.mostrarToastIOS("📋 Copiado");
    } else {
      // Fallback si no existe el appleToast
      console.warn("appleToast no encontrado, usando fallback");
      const existingFallback = document.getElementById("copiadoFallback");
      if (existingFallback) existingFallback.remove();

      const fallback = document.createElement("div");
      fallback.id = "copiadoFallback";
      fallback.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #000000;
        color: #ffffff;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        z-index: 99999999;
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.18);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      `;
      fallback.innerText = "📋 Copiado";
      document.body.appendChild(fallback);

      setTimeout(() => {
        fallback.remove();
      }, 2000);
    }

    if (idElemento === "displayCtaCorreo") {
      window.open("https://netflix.com/clearcookies", "_blank");
    }
  });
};
