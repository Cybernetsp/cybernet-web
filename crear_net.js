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
window.crearCuentaNetflixAliasExterna = function () {
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
  const cbName = "cb_alias_cta_" + Date.now();

  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

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

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${SCRIPT_URL_NETFLIX_GEN}?action=generarNuevaCuentaAlias&user=${encodeURIComponent(userActivo)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// ==========================================================================
// 3. DIBUJAR PANTALLA "SUSCRIPCIÓN CREADA" (IGUAL A TU DISEÑO)
// ==========================================================================
window.abrirModalSuscripcionEstructura = function () {
  const existingModal = document.getElementById("cuentaGeneradaModalOverlay");
  if (existingModal) existingModal.remove();

  const modalHtml = `
    <div class="overlay-ios open" id="cuentaGeneradaModalOverlay" style="display: flex !important; z-index: 999999 !important; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(14px); align-items: center; justify-content: center;">
      <div class="modal-ios" style="max-width: 440px; width: 92%; max-height: 90vh; background: #16161a; border: 1px solid rgba(229, 9, 20, 0.3); border-radius: 26px; padding: 24px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 25px 60px rgba(0,0,0,0.9); position: relative; overflow-y: auto;">
        
        <!-- Encabezado con Check Verde -->
        <div style="display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px;">
          <div style="background: rgba(48, 209, 88, 0.15); color: #30d158; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(48, 209, 88, 0.3); flex-shrink: 0;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h3 style="margin: 0; color: #ffffff; font-size: 1.2rem; font-weight: 800;">Suscripción Creada</h3>
        </div>

        <!-- Alerta Obligatoria -->
        <div style="color: #ff9f0a; font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; background: rgba(255, 159, 10, 0.08); padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(255, 159, 10, 0.2);">
          ⚠️ OBLIGATORIO: DEBES INYECTAR AL MAESTRO ANTES DE SALIR
        </div>

        <!-- Caja Spinner / Radar de Gmail -->
        <div id="radarVerificacionContenedor" style="background: rgba(255, 159, 10, 0.04); border: 1px dashed rgba(255, 159, 10, 0.3); border-radius: 14px; padding: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;">
          <div id="radarVerificacionSpinner" style="color: #ff9f0a; font-size: 0.82rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
            Esperando correo '¡Ya casi terminas!' en Gmail...
          </div>

          <!-- Botón Enlace de Verificación (Oculto Inicialmente) -->
          <a id="btnLinkVerificarGmail" href="#" target="_blank" style="display: none; width: 100%; background: #0a84ff; color: #ffffff; text-decoration: none; padding: 12px; border-radius: 12px; font-weight: 800; font-size: 0.88rem; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(10, 132, 255, 0.3);">
            ✉️ Verificar Correo en Netflix
          </a>
        </div>

        <!-- Bloque Correo -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; flex-direction: column; gap: 2px; overflow: hidden; padding-right: 8px;">
            <span style="font-size: 0.65rem; color: #a1a1aa; font-weight: 800; text-transform: uppercase;">CORREO ELECTRÓNICO</span>
            <span id="displayCtaCorreo" style="font-family: monospace; font-size: 0.95rem; font-weight: 800; color: #ffffff; word-break: break-all;">Cargando...</span>
          </div>
          <button style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #ffffff; padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 0.78rem; cursor: pointer; flex-shrink: 0;" onclick="window.copiarDatoCuentaNueva('displayCtaCorreo', this)">Copiar</button>
        </div>

        <!-- Bloque Contraseña -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span style="font-size: 0.65rem; color: #a1a1aa; font-weight: 800; text-transform: uppercase;">CONTRASEÑA</span>
            <span id="displayCtaClave" style="font-family: monospace; font-size: 0.95rem; font-weight: 800; color: #ffffff;">Cargando...</span>
          </div>
          <button style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #ffffff; padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 0.78rem; cursor: pointer; flex-shrink: 0;" onclick="window.copiarDatoCuentaNueva('displayCtaClave', this)">Copiar</button>
        </div>

        <!-- Bloque PIN de Activación -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span style="font-size: 0.65rem; color: #a1a1aa; font-weight: 800; text-transform: uppercase;">PIN DE ACTIVACIÓN (REFÁCIL)</span>
            <span id="displayCtaPinRecarga" style="font-family: monospace; font-size: 0.9rem; font-weight: 800; color: #ff9f0a;">Oculto (Esperando a Netflix...)</span>
          </div>
          <button style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #ffffff; padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 0.78rem; cursor: pointer; flex-shrink: 0;" onclick="window.copiarDatoCuentaNueva('displayCtaPinRecarga', this)">Copiar</button>
        </div>

        <!-- Botón Verde Inyectar al Maestro (Inicialmente Oculto) -->
        <button id="btnGuardarMaestroNetflix" style="display: none; width: 100%; background: #30d158; color: #000000; border: none; padding: 15px; border-radius: 14px; font-weight: 900; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 15px rgba(48, 209, 88, 0.3);">
          ✓ Guardar en Inventario Maestro (Sheets + MySQL)
        </button>

        <!-- Botón Descartar Cuenta Mala -->
        <button id="btnCuentaMalaAlias" onclick="window.cambiarCuentaMalaAlias()" style="width: 100%; background: rgba(255, 69, 58, 0.12); border: 1px solid rgba(255, 69, 58, 0.3); color: #ff453a; padding: 12px; border-radius: 14px; font-weight: 800; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
          ✕ Esta cuenta no sirve (Descartar y buscar otra)
        </button>

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
  document.getElementById("displayCtaPinRecarga").style.color = "#ff9f0a";

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
    const cbRadarName = "cb_radar_alias_" + Date.now();

    window[cbRadarName] = function (res) {
      const node = document.getElementById("node_" + cbRadarName);
      if (node) node.remove();
      delete window[cbRadarName];

      if (res && res.status === "success") {
        // 1. Si llegó el correo del PIN o el enlace
        if (res.yaCasiTerminas || res.linkVerificacion) {
          const pinEl = document.getElementById("displayCtaPinRecarga");
          if (pinEl && pinEl.innerText !== window.pinOcultoActual) {
            if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");
            pinEl.innerText = window.pinOcultoActual;
            pinEl.style.color = "#30d158";

            const spinner = document.getElementById("radarVerificacionSpinner");
            if (spinner) {
              spinner.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> PIN Revelado. Esperando link de verificación...`;
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
            btnLink.innerHTML = "✉️ Verificar Correo en Netflix";
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
            contenedor.style.background = "rgba(48, 209, 88, 0.06)";
            contenedor.style.borderColor = "rgba(48, 209, 88, 0.35)";
          }
        }
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbRadarName;
    script.src = `${SCRIPT_URL_NETFLIX_GEN}?action=obtenerEstadoVerificacionAlias&correo=${encodeURIComponent(correoTarget)}&callback=${cbRadarName}&_ts=${Date.now()}`;
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

  const cbName = "cb_save_cta_" + Date.now();

  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

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
  script.id = "node_" + cbName;
  const urlParams = `?action=confirmarGuardadoNetflix&correo=${encodeURIComponent(datosCuenta.correo)}&clave=${encodeURIComponent(datosCuenta.clave)}&callback=${cbName}&_ts=${Date.now()}`;
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

  const cbName = "cb_mala_" + Date.now();
  window[cbName] = function (res) {
    btnMala.disabled = false;
    btnMala.innerHTML = "✕ Esta cuenta no sirve (Descartar y buscar otra)";
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

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
      document.getElementById("displayCtaPinRecarga").style.color = "#ff9f0a";

      const spinner = document.getElementById("radarVerificacionSpinner");
      if (spinner) {
        spinner.style.setProperty("display", "flex", "important");
        spinner.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Esperando correo '¡Ya casi terminas!' en Gmail...`;
      }

      window.lanzarRadarEspiaAlias(res.correoNuevo);
    } else {
      alert(
        "❌ Error: " + (res ? res.message : "No se pudo cambiar la cuenta."),
      );
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  const user = sessionStorage.getItem("active_staff") || "Sistema";
  script.src = `${SCRIPT_URL_NETFLIX_GEN}?action=cambiarCuentaMalaAlias&correoMalo=${encodeURIComponent(correoMalo)}&user=${encodeURIComponent(user)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// ==========================================================================
// 8. HELPER DE COPIADO DE DATOS
// ==========================================================================
window.copiarDatoCuentaNueva = function (idElemento, btn) {
  if (typeof haptic === "function") haptic();
  let texto = document.getElementById(idElemento).innerText;

  if (!texto || texto.includes("Cargando") || texto.includes("Oculto")) return;

  navigator.clipboard.writeText(texto).then(function () {
    let originalText = btn.innerText;
    btn.innerText = "¡Copiado!";
    btn.style.background = "#30d158";
    btn.style.color = "#000000";

    setTimeout(function () {
      btn.innerText = originalText;
      btn.style.background = "rgba(255,255,255,0.08)";
      btn.style.color = "#ffffff";
    }, 1200);

    if (idElemento === "displayCtaCorreo") {
      window.open("https://netflix.com/clearcookies", "_blank");
    }
  });
};
