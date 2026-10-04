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
    console.log("📋 Cuenta pendiente encontrada en localStorage:", d.correo);

    // Verificar si la cuenta ya fue guardada en MySQL
    window.verificarCuentaEnMySQL(d.correo, function (yaGuardada) {
      console.log("🔍 Resultado de verificación MySQL:", yaGuardada);

      if (yaGuardada) {
        // La cuenta ya está en MySQL, ignorarla y generar una nueva automáticamente
        console.log("✅ La cuenta ya está guardada en MySQL. Ignorando y generando nueva:", d.correo);
        localStorage.removeItem("cyber_netflix_alias_pendiente");
        window.pinOcultoActual = "";
        window.ejecutarGeneracionNuevaCuentaAlias();
      } else {
        // La cuenta sigue pendiente, verificar si está activada en PinesMes
        window.verificarCuentaActivadaEnPinesMes(d.correo, function (activada, existeEnPinesMes, sinClave) {
          console.log("🔍 Resultado de verificación PinesMes:", { activada, existeEnPinesMes, sinClave });

          if (activada) {
            // La cuenta está activada en PinesMes, permitir crear cuenta nueva
            console.log("✅ La cuenta está activada en PinesMes. Mostrando botón de cuenta nueva.");
            window.pinOcultoActual = d.pinRefacil || "";
            window.restaurarInterfazAliasGenerada(d, true); // true = cuenta activada
          } else if (existeEnPinesMes && sinClave) {
            // La cuenta existe en PinesMes pero no tiene contraseña ("SEÑA NO ENCON")
            console.log("⚠️ La cuenta existe en PinesMes pero sin contraseña. Mostrando clave en rojo.");
            window.pinOcultoActual = d.pinRefacil || "";
            window.restaurarInterfazAliasGenerada(d, false); // false = cuenta pendiente

            // Mostrar "CONTRASEÑA NO ENCONTRADA" en rojo
            const claveEl = document.getElementById("displayCtaClave");
            if (claveEl) {
              claveEl.style.color = "#ff3b30";
              claveEl.style.fontWeight = "bold";
            }
          } else {
            // La cuenta NO existe en PinesMes (es una cuenta nueva normal)
            console.log("✅ La cuenta NO existe en PinesMes. Mostrando clave normal.");
            window.pinOcultoActual = d.pinRefacil || "";
            window.restaurarInterfazAliasGenerada(d, false); // false = cuenta pendiente
            // NO mostrar en rojo porque es una cuenta nueva
          }
        });
      }
    });

    return;
  }

  // Si no hay nada pendiente, genera una nueva cuenta
  window.ejecutarGeneracionNuevaCuentaAlias();
};

// Alias para compatibilidad
window.crearCuentaNetflixAliasExterna = window.crearCuentaNetflixAlias;

// ==========================================================================
// HELPER: VERIFICAR SI CUENTA ESTÁ EN MYSQL
// ==========================================================================
window.verificarCuentaEnMySQL = function (correo, callback) {
  const formData = new FormData();
  formData.append("accion", "verificar_cuenta_netflix");
  formData.append("correo", correo);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((r) => r.json())
    .then((res) => {
      if (res && res.status === "success" && res.yaGuardada) {
        callback(true);
      } else {
        callback(false);
      }
    })
    .catch((err) => {
      console.error("Error verificando cuenta en MySQL:", err);
      callback(false); // Si falla, asumimos que no está guardada
    });
};

// ==========================================================================
// HELPER: VERIFICAR SI CUENTA ESTÁ ACTIVADA EN PINESMES (GOOGLE SHEETS)
// ==========================================================================
window.verificarCuentaActivadaEnPinesMes = function (correo, callback) {
  window.callbackCiber = function (res) {
    const node = document.getElementById("node_verificar_activada");
    if (node) node.remove();
    delete window.callbackCiber;

    if (res && res.status === "success") {
      // Si tiene "quienActivo" o "fechaActivacion", significa que está activada
      const activada = !!(res.quienActivo || res.fechaActivacion || res.linkVerificacion);
      // Si tiene "clave" o el correo existe en la respuesta, significa que la cuenta ya está en PinesMes
      const existeEnPinesMes = !!(res.clave || res.correoEncontrado);
      // Si la clave está vacía o dice "SEÑA NO ENCON", significa que no tiene contraseña
      const sinClave = !res.clave || res.clave.includes("SEÑA NO ENCON") || res.clave.includes("NO ENCONTRADA");

      console.log("🔍 Estado en PinesMes:", { activada, existeEnPinesMes, sinClave, res });
      callback(activada, existeEnPinesMes, sinClave);
    } else {
      console.warn("⚠️ No se pudo verificar activación en PinesMes:", res);
      callback(false, false, false); // Si falla, asumimos que no está activada ni existe
    }
  };

  const script = document.createElement("script");
  script.id = "node_verificar_activada";
  script.src = `${SCRIPT_URL_NETFLIX_GEN}?action=obtenerEstadoVerificacionAlias&correo=${encodeURIComponent(correo)}&callback=callbackCiber&_ts=${Date.now()}`;
  document.body.appendChild(script);
  console.log("📡 Verificando activación en PinesMes:", script.src);
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

  // Mostrar estado inicial de carga
  const spinner = document.getElementById("radarVerificacionSpinner");
  if (spinner) {
    spinner.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Conectando con Google Sheets...`;
  }

  document.getElementById("displayCtaCorreo").innerText = "Generando...";
  document.getElementById("displayCtaClave").innerText = "Generando...";

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
    clearTimeout(timeoutId); // Limpiar el timeout si el callback llegó
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
    console.error("Error al cargar el script con JSONP, intentando con proxy:", e);

    // Si JSONP falla, intentar con proxy CORS
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    console.log("Intentando con proxy CORS:", proxyUrl);

    fetch(proxyUrl)
      .then(response => response.text())
      .then(text => {
        console.log("Respuesta del proxy:", text);

        // Extraer el JSON de la respuesta JSONP
        const match = text.match(/callbackCiber\((.*)\)/);
        if (match) {
          const jsonStr = match[1];
          const res = JSON.parse(jsonStr);
          console.log("Respuesta parseada del proxy:", res);

          if (res && res.status === "success" && res.data) {
            const d = res.data;
            window.pinOcultoActual = d.pinRefacil;
            localStorage.setItem("cyber_netflix_alias_pendiente", JSON.stringify(d));
            window.restaurarInterfazAliasGenerada(d);
          } else {
            alert("❌ Error: " + (res ? res.message : "Error desconocido del proxy"));
            const modal = document.getElementById("cuentaGeneradaModalOverlay");
            if (modal) modal.remove();
          }
        } else {
          console.error("No se pudo parsear la respuesta del proxy");
          alert("❌ Error: La respuesta del proxy no tiene el formato esperado.");
          const modal = document.getElementById("cuentaGeneradaModalOverlay");
          if (modal) modal.remove();
        }
      })
      .catch(error => {
        console.error("Error con el proxy:", error);
        alert("❌ Error: JSONP y proxy fallaron. Verifica tu conexión o contacta al administrador.");
        const modal = document.getElementById("cuentaGeneradaModalOverlay");
        if (modal) modal.remove();
      });
  };
  document.body.appendChild(script);
  console.log("Llamando al Google Script con JSONP:", script.src);

  // Timeout aumentado a 30 segundos para dar más tiempo al Google Script
  let timeoutId = setTimeout(() => {
    if (window.callbackCiber) {
      console.error("El Google Script no respondió en 30 segundos");
      const scriptNode = document.getElementById("node_script_netflix");
      if (scriptNode) {
        console.log("Script node existe, eliminándolo");
        scriptNode.remove();
      }
      delete window.callbackCiber;

      // Mostrar indicador de que se está intentando con proxy
      const spinner = document.getElementById("radarVerificacionSpinner");
      if (spinner) {
        spinner.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> El script demoró mucho. Intentando con proxy...`;
      }

      // Intentar con proxy CORS
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      console.log("Intentando con proxy CORS:", proxyUrl);

      fetch(proxyUrl)
        .then(response => response.text())
        .then(text => {
          console.log("Respuesta del proxy:", text);
          const match = text.match(/callbackCiber\((.*)\)/);
          if (match) {
            const jsonStr = match[1];
            const res = JSON.parse(jsonStr);
            console.log("Respuesta parseada del proxy:", res);

            if (res && res.status === "success" && res.data) {
              const d = res.data;
              window.pinOcultoActual = d.pinRefacil;
              localStorage.setItem("cyber_netflix_alias_pendiente", JSON.stringify(d));
              window.restaurarInterfazAliasGenerada(d);
            } else {
              alert("❌ Error: " + (res ? res.message : "Error desconocido del proxy"));
              const modal = document.getElementById("cuentaGeneradaModalOverlay");
              if (modal) modal.remove();
            }
          } else {
            alert("❌ Error: La respuesta del proxy no tiene el formato esperado.");
            const modal = document.getElementById("cuentaGeneradaModalOverlay");
            if (modal) modal.remove();
          }
        })
        .catch(error => {
          console.error("Error con el proxy:", error);
          alert("❌ Error: JSONP y proxy fallaron. Verifica tu conexión o contacta al administrador.");
          const modal = document.getElementById("cuentaGeneradaModalOverlay");
          if (modal) modal.remove();
        });
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
    <div class="overlay-ios open" id="cuentaGeneradaModalOverlay" style="display: flex !important; z-index: 999999 !important; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); backdrop-filter: blur(12px); align-items: center; justify-content: center;">
      <div class="modal-ios" style="max-width: 420px; width: 92%; max-height: 90vh; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); position: relative; overflow-y: auto;">

        <!-- Encabezado -->
        <div style="display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 14px;">
          <div style="background: rgba(255,255,255,0.1); color: #ffffff; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h3 style="margin: 0; color: #ffffff; font-size: 1.1rem; font-weight: 600;">Suscripción Creada</h3>
        </div>

        <!-- Alerta Obligatoria -->
        <div style="color: #888; font-size: 0.8rem; font-weight: 500; text-align: center; background: rgba(255,255,255,0.05); padding: 10px 14px; border-radius: 10px;">
          Debes inyectar al maestro antes de salir
        </div>

        <!-- Caja Spinner / Radar de Gmail -->
        <div id="radarVerificacionContenedor" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;">
          <div id="radarVerificacionSpinner" style="color: #888; font-size: 0.8rem; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
            Esperando correo de verificación...
          </div>

          <!-- Botón Enlace de Verificación (Oculto Inicialmente) -->
          <a id="btnLinkVerificarGmail" href="#" target="_blank" style="display: none; width: 100%; background: rgba(255,255,255,0.1); color: #ffffff; text-decoration: none; padding: 12px; border-radius: 10px; font-weight: 600; font-size: 0.85rem; align-items: center; justify-content: center; gap: 8px;">
            Verificar Correo en Netflix
          </a>
        </div>

        <!-- Bloque Correo -->
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; cursor: pointer; transition: background 0.2s;" onclick="window.copiarDatoCuentaNueva('displayCtaCorreo', this)">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-size: 0.65rem; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Correo Electrónico</span>
            <span id="displayCtaCorreo" style="font-family: monospace; font-size: 0.9rem; font-weight: 500; color: #ffffff; word-break: break-all;">Cargando...</span>
          </div>
        </div>

        <!-- Bloque Contraseña -->
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; cursor: pointer; transition: background 0.2s;" onclick="window.copiarDatoCuentaNueva('displayCtaClave', this)">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-size: 0.65rem; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Contraseña</span>
            <span id="displayCtaClave" style="font-family: monospace; font-size: 0.9rem; font-weight: 500; color: #ffffff;">Cargando...</span>
          </div>
        </div>

        <!-- Bloque PIN de Activación -->
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; cursor: pointer; transition: background 0.2s;" onclick="window.copiarDatoCuentaNueva('displayCtaPinRecarga', this)">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-size: 0.65rem; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">PIN de Activación</span>
            <span id="displayCtaPinRecarga" style="font-family: monospace; font-size: 0.85rem; font-weight: 500; color: #888;">Oculto (Esperando a Netflix...)</span>
          </div>
        </div>

        <!-- Botón Inyectar al Maestro (Inicialmente Oculto) -->
        <button id="btnGuardarMaestroNetflix" style="display: none; width: 100%; background: rgba(255,255,255,0.1); color: #ffffff; border: none; padding: 14px; border-radius: 12px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.2s;">
          Guardar en Inventario Maestro
        </button>

        <!-- Botón Descartar Cuenta Mala -->
        <button id="btnCuentaMalaAlias" onclick="window.cambiarCuentaMalaAlias()" style="width: 100%; background: #8b0000; border: none; color: #ffffff; padding: 12px; border-radius: 12px; font-weight: 500; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
          No llego correo de verificacion
        </button>

        <!-- Botón Forzar Detección Manual (Nuevo) -->
        <button id="btnForzarDeteccionManual" onclick="window.forzarDeteccionManual()" style="width: 100%; background: rgba(255, 159, 10, 0.15); border: 1px solid rgba(255, 159, 10, 0.3); color: #ff9f0a; padding: 10px; border-radius: 12px; font-weight: 500; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
          ⚡ El correo ya llegó (Forzar detección)
        </button>

        <!-- Botón Ignorar y Crear Nueva (Para recargas) -->
        <button id="btnIgnorarPendiente" onclick="window.ignorarPendienteYCrearNueva()" style="width: 100%; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #888; padding: 8px; border-radius: 12px; font-weight: 500; font-size: 0.7rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
          ➕ Ignorar esta y crear cuenta nueva
        </button>

        <!-- Botón Crear Cuenta Nueva (Solo cuando la cuenta está activada) -->
        <button id="btnCrearCuentaNueva" onclick="window.ignorarPendienteYCrearNueva()" style="width: 100%; background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; padding: 12px; border-radius: 12px; font-weight: 600; font-size: 0.85rem; cursor: pointer; display: none; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
          ➕ Crear cuenta nueva
        </button>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
};

// ==========================================================================
// 4. RESTAURAR PANTALLA Y ARRANQUE DEL RADAR DE GMAIL
// ==========================================================================
window.restaurarInterfazAliasGenerada = function (d, cuentaActivada = false) {
  window.abrirModalSuscripcionEstructura();

  document.getElementById("displayCtaCorreo").innerText = d.correo;
  document.getElementById("displayCtaClave").innerText = d.clave;
  document.getElementById("displayCtaPinRecarga").innerText =
    "Oculto (Esperando a Netflix...)";
  document.getElementById("displayCtaPinRecarga").style.color = "#888";

  const btnGuardar = document.getElementById("btnGuardarMaestroNetflix");
  const btnLimpiar = document.getElementById("btnLimpiarPendiente");
  const btnIgnorar = document.getElementById("btnIgnorarPendiente");

  // Ocultar botón de guardar (se muestra solo después de verificar)
  if (btnGuardar) btnGuardar.style.display = "none";

  // Restaurar botón de limpiar a su estado normal
  if (btnLimpiar) {
    btnLimpiar.style.background = "rgba(255, 255, 255, 0.05)";
    btnLimpiar.style.borderColor = "rgba(255, 255, 255, 0.1)";
    btnLimpiar.style.color = "#888";
    btnLimpiar.innerHTML = "🗑️ Ya activé esta cuenta (Limpiar)";
  }

  // Controlar el botón "Ignorar esta y crear cuenta nueva" según el estado de activación
  if (btnIgnorar) {
    if (cuentaActivada) {
      // Si la cuenta está activada, ocultar el botón de ignorar
      btnIgnorar.style.display = "none";
    } else {
      // Si la cuenta NO está activada, mostrar el botón de ignorar
      btnIgnorar.style.display = "flex";
    }
  }

  // Controlar el botón "Crear cuenta nueva" según el estado de activación
  const btnCrearNueva = document.getElementById("btnCrearCuentaNueva");
  if (btnCrearNueva) {
    if (cuentaActivada) {
      // Si la cuenta está activada, mostrar el botón de crear cuenta nueva
      btnCrearNueva.style.display = "flex";
    } else {
      // Si la cuenta NO está activada, ocultar el botón de crear cuenta nueva
      btnCrearNueva.style.display = "none";
    }
  }

  // Si la cuenta NO está activada, mostrar "CONTRASEÑA NO ENCONTRADA" en rojo
  if (!cuentaActivada) {
    const claveEl = document.getElementById("displayCtaClave");
    if (claveEl) {
      claveEl.style.color = "#ff3b30";
      claveEl.style.fontWeight = "bold";
    }
  }

  const btnGuardarClick = function () {
    let datosFrescos =
      JSON.parse(localStorage.getItem("cyber_netflix_alias_pendiente")) || d;
    datosFrescos.pinRecarga = window.pinOcultoActual;
    window.guardarCuentaConfirmadaNetflixDual(btnGuardar, datosFrescos);
  };

  if (btnGuardar) {
    btnGuardar.onclick = btnGuardarClick;
  }

  // Lanzar búsqueda continua de correos en Gmail
  window.lanzarRadarEspiaAlias(d.correo);
};

// ==========================================================================
// 5. RADAR ESPIA DE GMAIL (MONITOREA PIN Y LINK DE VERIFICACIÓN)
// ==========================================================================
window.lanzarRadarEspiaAlias = function (correoTarget) {
  if (window.verificationLinkInterval)
    clearInterval(window.verificationLinkInterval);

  let intentos = 0;
  let fallos = 0;
  const MAX_INTENTOS = 300; // 10 minutos máximo (300 intentos x 2 segundos)

  window.verificationLinkInterval = setInterval(function () {
    intentos++;

    // Actualizar contador de tiempo en el spinner
    const spinner = document.getElementById("radarVerificacionSpinner");
    if (spinner && intentos > 1) {
      const minutos = Math.floor((intentos * 2) / 60);
      const segundos = (intentos * 2) % 60;
      const tiempoStr = minutos > 0 ? `${minutos}m ${segundos}s` : `${segundos}s`;
      spinner.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Esperando correo (${tiempoStr})...`;
    }

    // El Google Script usa callbackCiber como nombre fijo
    // Remover el script anterior si existe para evitar conflictos
    const nodeAnterior = document.getElementById("node_radar_netflix");
    if (nodeAnterior) nodeAnterior.remove();

    window.callbackCiber = function (res) {
      console.log("📧 Radar Gmail - Respuesta del Google Script:", res);
      console.log("📧 - status:", res.status);
      console.log("📧 - correoVerificacion:", res.correoVerificacion);
      console.log("📧 - yaCasiTerminas:", res.yaCasiTerminas);
      console.log("📧 - linkVerificacion:", res.linkVerificacion);
      console.log("📧 - PIN oculto actual:", window.pinOcultoActual);

      const node = document.getElementById("node_radar_netflix");
      if (node) node.remove();
      delete window.callbackCiber;

      if (res && res.status === "success") {
        console.log("✅ Google Script status: success");
        console.log("✅ Detectando campos:", {
          correoVerificacion: res.correoVerificacion,
          yaCasiTerminas: res.yaCasiTerminas,
          linkVerificacion: res.linkVerificacion
        });

        // 1. Si llegó el correo de verificación o el de "ya casi terminas", mostrar el PIN
        if (res.correoVerificacion || res.yaCasiTerminas || res.linkVerificacion) {
          console.log("🔓 Revelando PIN porque se detectó correo o link");
          const pinEl = document.getElementById("displayCtaPinRecarga");
          if (pinEl && pinEl.innerText !== window.pinOcultoActual) {
            if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");
            pinEl.innerText = window.pinOcultoActual;
            pinEl.style.color = "#ffffff";

            const spinner = document.getElementById("radarVerificacionSpinner");
            if (spinner) {
              spinner.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> ✅ Correo detectado. PIN revelado.`;
              spinner.style.color = "#30d158";
            }
          }
        }

        // 2. Si llegó el Link de Verificación explícito
        if (res.linkVerificacion) {
          clearInterval(window.verificationLinkInterval);
          if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");

          // Revelar el PIN si aún no se ha revelado
          const pinEl = document.getElementById("displayCtaPinRecarga");
          if (pinEl && pinEl.innerText !== window.pinOcultoActual) {
            pinEl.innerText = window.pinOcultoActual;
            pinEl.style.color = "#ffffff";
          }

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

              // Quitar el color rojo de la contraseña
              const claveEl = document.getElementById("displayCtaClave");
              if (claveEl) {
                claveEl.style.color = "#ffffff";
                claveEl.style.fontWeight = "500";
              }
            };
          }

          const contenedor = document.getElementById(
            "radarVerificacionContenedor",
          );
          if (contenedor) {
            contenedor.style.background = "rgba(255,255,255,0.08)";
          }
        }
      } else {
        console.warn("⚠️ Google Script status: no success o respuesta vacía");
        fallos++;

        // Si hay muchos fallos consecutivos, sugerir usar el botón manual
        if (fallos >= 5) {
          const spinner = document.getElementById("radarVerificacionSpinner");
          if (spinner) {
            spinner.innerHTML = `⚠️ El radar no detecta correos. Usa "⚡ El correo ya llegó"`;
            spinner.style.color = "#ff9f0a";
          }
        }
      }
    };

    const script = document.createElement("script");
    script.id = "node_radar_netflix";
    script.src = `${SCRIPT_URL_NETFLIX_GEN}?action=obtenerEstadoVerificacionAlias&correo=${encodeURIComponent(correoTarget)}&callback=callbackCiber&_ts=${Date.now()}`;
    document.body.appendChild(script);
    console.log("📡 Llamando al Google Script para verificar correo:", script.src);

    // Detener después de MAX_INTENTOS (10 minutos)
    if (intentos >= MAX_INTENTOS) {
      clearInterval(window.verificationLinkInterval);
      if (spinner) {
        spinner.innerHTML = `⚠️ Tiempo agotado (10m). Usa "No llego correo" para cambiar de cuenta.`;
        spinner.style.color = "#ff9f0a";
      }
    }
  }, 2000); // Reducido de 4s a 2s para respuestas más rápidas
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

            // Mostrar botón "Crear cuenta nueva" y ocultar otros botones
            const btnGuardar = document.getElementById("btnGuardarMaestroNetflix");
            const btnCuentaMala = document.getElementById("btnCuentaMalaAlias");
            const btnForzar = document.getElementById("btnForzarDeteccionManual");
            const btnIgnorar = document.getElementById("btnIgnorarPendiente");
            const btnCrearNueva = document.getElementById("btnCrearCuentaNueva");
            const radarSpinner = document.getElementById("radarVerificacionSpinner");
            const radarContenedor = document.getElementById("radarVerificacionContenedor");

            if (btnGuardar) btnGuardar.style.display = "none";
            if (btnCuentaMala) btnCuentaMala.style.display = "none";
            if (btnForzar) btnForzar.style.display = "none";
            if (btnIgnorar) btnIgnorar.style.display = "none";
            if (btnCrearNueva) btnCrearNueva.style.display = "flex";

            // Actualizar el radar para mostrar éxito
            if (radarSpinner) {
              radarSpinner.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#30d158" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Cuenta activada y guardada`;
              radarSpinner.style.color = "#30d158";
            }
            if (radarContenedor) {
              radarContenedor.style.background = "rgba(48, 209, 88, 0.1)";
              radarContenedor.style.borderColor = "rgba(48, 209, 88, 0.3)";
            }

            // Quitar el color rojo de la contraseña
            const claveEl = document.getElementById("displayCtaClave");
            if (claveEl) {
              claveEl.style.color = "#ffffff";
              claveEl.style.fontWeight = "500";
            }

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
  const urlParams = `?action=confirmarGuardadoNetflix&correo=${encodeURIComponent(datosCuenta.correo)}&clave=${encodeURIComponent(datosCuenta.clave)}&callback=callbackCiber&_ts=${Date.now()}`;
  script.src = SCRIPT_URL_NETFLIX_GEN + urlParams;
  document.body.appendChild(script);
};

// ==========================================================================
// 7. FORZAR DETECCIÓN MANUAL (CUANDO EL CORREO YA LLEGÓ PERO EL RADAR NO LO DETECTA)
// ==========================================================================
window.forzarDeteccionManual = function () {
  if (typeof haptic === "function") haptic();

  const spinner = document.getElementById("radarVerificacionSpinner");
  if (spinner) {
    spinner.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Verificando correo manualmente...`;
  }

  // Obtener el correo actual
  const correoActual = document.getElementById("displayCtaCorreo").innerText;

  // Hacer una consulta manual al Google Script para verificar el estado
  window.callbackCiber = function (res) {
    console.log("⚡ Detección Manual - Respuesta del Google Script:", res);
    console.log("⚡ - status:", res.status);
    console.log("⚡ - correoVerificacion:", res.correoVerificacion);
    console.log("⚡ - yaCasiTerminas:", res.yaCasiTerminas);
    console.log("⚡ - linkVerificacion:", res.linkVerificacion);
    console.log("⚡ - PIN oculto actual:", window.pinOcultoActual);

    const node = document.getElementById("node_forzar_deteccion");
    if (node) node.remove();
    delete window.callbackCiber;

    if (res && res.status === "success") {
      console.log("✅ Detección Manual - status: success");
      console.log("✅ Detectando campos:", {
        correoVerificacion: res.correoVerificacion,
        yaCasiTerminas: res.yaCasiTerminas,
        linkVerificacion: res.linkVerificacion
      });

      // 1. Si llegó el correo del PIN ("ya casi terminas")
      if (res.yaCasiTerminas) {
        console.log("🔓 Revelando PIN porque yaCasiTerminas = true");
        const pinEl = document.getElementById("displayCtaPinRecarga");
        if (pinEl && pinEl.innerText !== window.pinOcultoActual) {
          if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");
          pinEl.innerText = window.pinOcultoActual;
          pinEl.style.color = "#ffffff";

          if (spinner) {
            spinner.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> PIN revelado. Esperando link de verificación...`;
          }
        }
      }

      // 2. Si llegó el Link de Verificación
      if (res.linkVerificacion) {
        console.log("🔗 Link de verificación detectado:", res.linkVerificacion);
        if (window.verificationLinkInterval) {
          clearInterval(window.verificationLinkInterval);
        }
        if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");

        // REVELAR EL PIN AUTOMÁTICAMENTO cuando se detecta el link
        const pinEl = document.getElementById("displayCtaPinRecarga");
        if (pinEl && pinEl.innerText !== window.pinOcultoActual) {
          pinEl.innerText = window.pinOcultoActual;
          pinEl.style.color = "#ffffff";
        }

        if (spinner) {
          spinner.style.setProperty("display", "none", "important");
        }

        const btnLink = document.getElementById("btnLinkVerificarGmail");
        if (btnLink) {
          btnLink.href = res.linkVerificacion;
          btnLink.innerHTML = "Verificar Correo en Netflix";
          btnLink.style.setProperty("display", "inline-flex", "important");

          btnLink.onclick = function () {
            if (typeof haptic === "function") haptic();
            const btnG = document.getElementById("btnGuardarMaestroNetflix");
            if (btnG) btnG.style.setProperty("display", "block", "important");

            const btnM = document.getElementById("btnCuentaMalaAlias");
            if (btnM) btnM.style.display = "none";
          };
        }

        const contenedor = document.getElementById("radarVerificacionContenedor");
        if (contenedor) {
          contenedor.style.background = "rgba(255,255,255,0.08)";
        }
      } else if (!res.yaCasiTerminas) {
        // Si no llegó nada, mostrar opción manual
        if (spinner) {
          spinner.style.setProperty("display", "none", "important");
        }

        const contenedor = document.getElementById("radarVerificacionContenedor");
        if (contenedor) {
          contenedor.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
              <span style="font-size: 0.75rem; color: #888; font-weight: 500;">No se detectó el correo. Pega el link de verificación de Netflix:</span>
              <input type="text" id="inputLinkVerificacionManual" placeholder="https://www.netflix.com/..." style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #ffffff; padding: 10px; border-radius: 8px; font-size: 0.85rem; font-family: monospace;">
              <button onclick="window.procesarLinkManual()" style="width: 100%; background: rgba(48, 209, 88, 0.2); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; padding: 10px; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer;">
                Continuar con este link
              </button>
            </div>
          `;
        }
      }
    } else {
      // Si falla la consulta, mostrar opción manual
      if (spinner) {
        spinner.style.setProperty("display", "none", "important");
      }

      const contenedor = document.getElementById("radarVerificacionContenedor");
      if (contenedor) {
        contenedor.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
            <span style="font-size: 0.75rem; color: #888; font-weight: 500;">Error al verificar. Pega el link de verificación de Netflix:</span>
            <input type="text" id="inputLinkVerificacionManual" placeholder="https://www.netflix.com/..." style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #ffffff; padding: 10px; border-radius: 8px; font-size: 0.85rem; font-family: monospace;">
            <button onclick="window.procesarLinkManual()" style="width: 100%; background: rgba(48, 209, 88, 0.2); border: 1px solid rgba(48, 209, 88, 0.3); color: #30d158; padding: 10px; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer;">
              Continuar con este link
            </button>
          </div>
        `;
      }
    }
  };

  const script = document.createElement("script");
  script.id = "node_forzar_deteccion";
  script.src = `${SCRIPT_URL_NETFLIX_GEN}?action=obtenerEstadoVerificacionAlias&correo=${encodeURIComponent(correoActual)}&callback=callbackCiber&_ts=${Date.now()}`;
  document.body.appendChild(script);

  // Ocultar botón de forzar detección
  const btnForzar = document.getElementById("btnForzarDeteccionManual");
  if (btnForzar) btnForzar.style.display = "none";
};

window.procesarLinkManual = function () {
  const inputLink = document.getElementById("inputLinkVerificacionManual");
  const link = inputLink ? inputLink.value.trim() : "";

  if (!link) {
    alert("⚠️ Por favor pega el link de verificación de Netflix");
    return;
  }

  // Detener el radar automático
  if (window.verificationLinkInterval) {
    clearInterval(window.verificationLinkInterval);
  }

  // Mostrar botón de verificación con el link manual
  const contenedor = document.getElementById("radarVerificacionContenedor");
  if (contenedor) {
    contenedor.innerHTML = `
      <a id="btnLinkVerificarGmail" href="${link}" target="_blank" style="width: 100%; background: rgba(255,255,255,0.1); color: #ffffff; text-decoration: none; padding: 12px; border-radius: 10px; font-weight: 600; font-size: 0.85rem; align-items: center; justify-content: center; gap: 8px; display: inline-flex;">
        Verificar Correo en Netflix
      </a>
    `;
  }

  const btnLink = document.getElementById("btnLinkVerificarGmail");
  if (btnLink) {
    btnLink.onclick = function () {
      if (typeof haptic === "function") haptic();
      const btnG = document.getElementById("btnGuardarMaestroNetflix");
      if (btnG) btnG.style.setProperty("display", "block", "important");

      const btnM = document.getElementById("btnCuentaMalaAlias");
      if (btnM) btnM.style.display = "none";
    };
  }
};

// ==========================================================================
// 9. IGNORAR CUENTA PENDIENTE Y CREAR NUEVA (PARA RECARGAS)
// ==========================================================================
window.ignorarPendienteYCrearNueva = function () {
  if (typeof haptic === "function") haptic();

  if (
    !confirm(
      "⚠️ ¿Ignorar esta cuenta pendiente y crear una nueva?\n\nEsto borrará la cuenta actual de la memoria local y generará una nueva.",
    )
  )
    return;

  // Limpiar localStorage
  localStorage.removeItem("cyber_netflix_alias_pendiente");
  window.pinOcultoActual = "";

  // Detener radar si está activo
  if (window.verificationLinkInterval) {
    clearInterval(window.verificationLinkInterval);
  }

  // Cerrar modal
  const modal = document.getElementById("cuentaGeneradaModalOverlay");
  if (modal) modal.remove();

  // Generar nueva cuenta
  window.ejecutarGeneracionNuevaCuentaAlias();
};

// ==========================================================================
// 10. DESCARTAR CUENTA MALA Y PEDIR OTRA
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
      console.log("✅ Respuesta del Google Script:", res);
      console.log("✅ Correo nuevo:", res.correoNuevo);
      console.log("✅ Clave nueva:", res.claveNueva);
      console.log("✅ PIN Refacil:", res.pinRefacil);

      let d =
        JSON.parse(localStorage.getItem("cyber_netflix_alias_pendiente")) || {};
      d.correo = res.correoNuevo;
      d.clave = res.claveNueva;

      // Si el Google Script devuelve un nuevo PIN, actualizarlo
      if (res.pinRefacil) {
        d.pinRefacil = res.pinRefacil;
        window.pinOcultoActual = res.pinRefacil;
        console.log("✅ PIN actualizado en localStorage:", res.pinRefacil);
      } else {
        console.warn("⚠️ El Google Script no devolvió un PIN nuevo. Manteniendo el PIN anterior.");
      }

      localStorage.setItem("cyber_netflix_alias_pendiente", JSON.stringify(d));

      document.getElementById("displayCtaCorreo").innerText = res.correoNuevo;
      document.getElementById("displayCtaClave").innerText = res.claveNueva;

      if (window.verificationLinkInterval)
        clearInterval(window.verificationLinkInterval);

      const pinEl = document.getElementById("displayCtaPinRecarga");
      if (res.pinRefacil) {
        pinEl.innerText = "Oculto (Esperando a Netflix...)";
        pinEl.style.color = "#888";
      } else {
        // Si no hay PIN nuevo, indicar que se está usando el anterior
        pinEl.innerText = window.pinOcultoActual ? "Oculto (PIN anterior)" : "Oculto (Sin PIN)";
        pinEl.style.color = "#ff9f0a";
      }

      const spinner = document.getElementById("radarVerificacionSpinner");
      if (spinner) {
        spinner.style.setProperty("display", "flex", "important");
        spinner.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Esperando correo de verificación...`;
      }

      window.lanzarRadarEspiaAlias(res.correoNuevo);

      // Reiniciar botón de forzar detección
      const btnForzar = document.getElementById("btnForzarDeteccionManual");
      if (btnForzar) btnForzar.style.display = "flex";

      // Ocultar contenedor si estaba mostrando input manual
      const contenedor = document.getElementById("radarVerificacionContenedor");
      if (contenedor) {
        contenedor.style.background = "rgba(255,255,255,0.03)";
        contenedor.style.border = "1px solid rgba(255,255,255,0.08)";
      }

      if (typeof triggerToast === "function") {
        triggerToast("✅ Nueva cuenta generada: " + res.correoNuevo);
      }
    } else {
      console.error("❌ Error al cambiar cuenta:", res);
      alert(
        "❌ Error: " + (res ? res.message : "No se pudo cambiar la cuenta."),
      );

      // Restaurar spinner
      const spinner = document.getElementById("radarVerificacionSpinner");
      if (spinner) {
        spinner.innerHTML = `❌ Error. Intenta de nuevo.`;
      }
    }
  };

  const script = document.createElement("script");
  script.id = "node_mala_netflix";
  const user = sessionStorage.getItem("active_staff") || "Sistema";
  script.src = `${SCRIPT_URL_NETFLIX_GEN}?action=cambiarCuentaMalaAlias&correoMalo=${encodeURIComponent(correoMalo)}&user=${encodeURIComponent(user)}&callback=callbackCiber&_ts=${Date.now()}`;
  document.body.appendChild(script);
  console.log("📡 Llamando al Google Script para cambiar cuenta:", script.src);

  // Timeout de 60 segundos (aumentado de 30s)
  setTimeout(() => {
    if (window.callbackCiber) {
      console.error("⏱️ Timeout al cambiar cuenta (60s)");
      const scriptNode = document.getElementById("node_mala_netflix");
      if (scriptNode) scriptNode.remove();
      delete window.callbackCiber;

      btnMala.disabled = false;
      btnMala.innerHTML = "✕ Esta cuenta no sirve (Descartar y buscar otra)";

      const spinner = document.getElementById("radarVerificacionSpinner");
      if (spinner) {
        spinner.innerHTML = `⏱️ Tiempo agotado (60s). Intenta de nuevo.`;
        spinner.style.color = "#ff9f0a";
      }

      alert("⏱️ El Google Script tardó más de 60 segundos.\n\nEl servicio puede estar lento. Intenta de nuevo en unos momentos.");
    }
  }, 60000);
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
