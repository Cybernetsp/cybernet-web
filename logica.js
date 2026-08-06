// 👑 LÍNEA 1: INTERCEPTOR ULTRA INTELIGENTE FUSIONADO (LOCAL & WEB)
(function () {
  let sessionStaff = sessionStorage.getItem("active_staff");
  let localStaff = localStorage.getItem("cyber_saved_staff");
  let user = sessionStaff || localStaff;

  // Esperamos a que el HTML cargue por completo para manipular las ventanas
  window.addEventListener("DOMContentLoaded", () => {
    let savedTheme = localStorage.getItem("cyber_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    const loginOverlay = document.getElementById("loginOverlay");
    const workspace = document.getElementById("mainWorkspace");
    const header = document.getElementById("globalHeader");
    const controlPanel = document.getElementById("controlPanel");
    const controlRight = document.getElementById("macControlCenterRight"); // 🔥 Esquina derecha

    // Si NO hay usuario logueado, forzamos a abrir el Login integrado
    if (!user) {
      if (loginOverlay) {
        loginOverlay.classList.add("open");
        loginOverlay.style.setProperty("display", "flex", "important");
      }
      // Apagamos TODOS los componentes del admin por seguridad
      if (workspace) workspace.style.display = "none";
      if (header) header.style.display = "none";
      if (controlPanel) controlPanel.style.display = "none";
      if (controlRight) controlRight.style.display = "none"; // Desaparece "Camilo" y el reloj
    }
    // Si SÍ hay usuario logueado, entra directo al sistema
    else {
      if (loginOverlay) {
        loginOverlay.classList.remove("open");
        loginOverlay.style.setProperty("display", "none", "important");
      }
      if (controlRight) controlRight.style.display = "flex";
      entrarAlSistema(user);
    }
  });
})();
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxk_T98sS1lL5lbXVq_XKOpB6ZCNQ1DSCgPhc_a6vmE_ai16YbSYO_eHkmeu0ZjM5aq/exec";

let timerInterval = null;
let autoRefreshCodesInterval = null;
let isFetchingCodes = false;
window.currentCodesStock = [];

let isFetchingHoras = false;
window.currentHorasStock = [];

let isFetchingAccounts = false;
window.currentSearchStock = [];

let temporizadorInactividad = null;
let temporizadorCierreTotal = null;
let isTimerPaused = false;

const INACTIVITY_LOGOUT_LIMIT = 30 * 60 * 1000;

// 🔥 CEREBRO DE COMBOS: Guarda los meses y los replica en cascada
window.ultimoMesesSeleccionado = "1";

function actualizarMesesGlobal(valor) {
  window.ultimoMesesSeleccionado = valor;

  // Si cambias los meses de una, cambia automáticamente todas las que ya tengas marcadas
  const checkboxes = document.getElementsByName("platformCheckVenta");
  checkboxes.forEach((cb) => {
    if (cb.checked && cb.value !== "SALDO") {
      const elM = document.getElementById(`meses_${cb.value}`);
      if (elM) elM.value = valor;
    }
  });
}

window.pendingUser = "";
window.pendingOldPass = "";
window.pendingRemember = false;
window.isForcedChange = false;

window.CyberSonidos = {
  play: function (tipo) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!window.audioCtx) window.audioCtx = new AudioContext();
      if (window.audioCtx.state === "suspended") window.audioCtx.resume();

      const now = window.audioCtx.currentTime;

      // Función maestra para crear cualquier sonido
      const playTone = (freq, type, startTime, duration, vol) => {
        const osc = window.audioCtx.createOscillator();
        const gain = window.audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(window.audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
        return osc; // Devolvemos el oscilador por si queremos curvar el sonido
      };

      // 1. Tock clásico (Botones normales)
      if (tipo === "click" || tipo === "pop") {
        playTone(850, "sine", now, 0.03, 0.06);
      }
      // 2. Chime doble (Notificaciones generales o éxito)
      else if (tipo === "exito" || tipo === "notif") {
        playTone(1050, "sine", now, 0.12, 0.1);
        playTone(1320, "sine", now + 0.06, 0.25, 0.1);
      }
      // 3. Blip ascendente (Abrir ventanas/paneles)
      else if (tipo === "abrir") {
        const osc = playTone(400, "sine", now, 0.15, 0.05);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      }
      // 4. Blip descendente (Cerrar ventanas/paneles)
      else if (tipo === "cerrar") {
        const osc = playTone(800, "sine", now, 0.15, 0.05);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
      }
      // 5. Doble Blip rápido y agudo (Copiar al portapapeles)
      else if (tipo === "copiar") {
        playTone(1500, "sine", now, 0.05, 0.05);
        playTone(2000, "sine", now + 0.05, 0.1, 0.05);
      }
      // 6. Sonido de caja registradora sintetizada (Ventas/Cobros)
      else if (tipo === "dinero" || tipo === "venta") {
        playTone(2000, "triangle", now, 0.1, 0.03);
        playTone(3000, "triangle", now + 0.1, 0.2, 0.03);
      }
      // 7. Zumbido grave doble (Errores o Alertas críticas)
      else if (tipo === "error") {
        playTone(200, "square", now, 0.15, 0.08);
        playTone(150, "square", now + 0.15, 0.2, 0.08);
      }
    } catch (e) {
      console.log("AudioContext bloqueado por el navegador.");
    }
  },
};

// Función de vibración háptica compacta de Cybernet
window.haptic = function () {
  if (navigator.vibrate) {
    navigator.vibrate(10); // Vibración sutil de pantalla táctil
  }
  window.CyberSonidos.play("click");
};

document.addEventListener(
  "click",
  (e) => {
    const elementoInteractivo = e.target.closest(
      "button, .mac-menu-item, .mac-dock-icon, .btn-ios, .btn-close-circle, .mobile-menu-trigger, input[type='submit'], input[type='checkbox'], select",
    );

    if (elementoInteractivo) {
      // Vibración táctil si aplica
      if (navigator.vibrate) navigator.vibrate(10);

      // Lógica inteligente de sonidos
      if (
        elementoInteractivo.classList.contains("btn-close-circle") ||
        elementoInteractivo.innerText.includes("Cancelar")
      ) {
        window.CyberSonidos.play("cerrar");
      } else if (
        elementoInteractivo.classList.contains("btn-danger") ||
        elementoInteractivo.innerText.includes("Eliminar")
      ) {
        window.CyberSonidos.play("error");
      } else if (
        elementoInteractivo.innerText.includes("Copiar") ||
        elementoInteractivo.classList.contains("copy-text-btn")
      ) {
        window.CyberSonidos.play("copiar");
      } else if (
        elementoInteractivo.innerText.includes("Venta") ||
        elementoInteractivo.innerText.includes("Cobrar")
      ) {
        window.CyberSonidos.play("dinero");
      } else {
        // Sonido por defecto para clics normales
        window.CyberSonidos.play("click");
      }
    }
  },
  true,
);

const listaPlataformasVenta = [
  {
    id: "NETFLIX",
    nombre: "NETFLIX",
    permitePantallas: true,
    permiteRenovacion: true,
  },
  {
    id: "DIRECTV-GO",
    nombre: "DIRECTV GO",
    permitePantallas: true,
    permiteRenovacion: false,
  },
  {
    id: "AMAZON",
    nombre: "AMAZON",
    permitePantallas: true,
    permiteRenovacion: false,
  },
  {
    id: "DISNEY-PREMIUM",
    nombre: "DISNEY PREMIUM",
    permitePantallas: true,
    permiteRenovacion: false,
  },
  {
    id: "DISNEY-ESTANDAR",
    nombre: "DISNEY ESTANDAR",
    permitePantallas: true,
    permiteRenovacion: false,
  },
  {
    id: "HBO-MAX",
    nombre: "HBO MAX",
    permitePantallas: true,
    permiteRenovacion: false,
  },
  {
    id: "CRUNCHYROLL",
    nombre: "CRUNCHYROLL",
    permitePantallas: true,
    permiteRenovacion: false,
  },
  {
    id: "VIX",
    nombre: "VIX",
    permitePantallas: true,
    permiteRenovacion: false,
  },
  {
    id: "PLEX",
    nombre: "PLEX",
    permitePantallas: true,
    permiteRenovacion: false,
  },
  {
    id: "PARAMOUNT",
    nombre: "PARAMOUNT",
    permitePantallas: true,
    permiteRenovacion: false,
  },
  {
    id: "APPLE-TV",
    nombre: "APPLE TV",
    permitePantallas: true,
    permiteRenovacion: false,
  },
  {
    id: "YOUTUBE",
    nombre: "YOUTUBE",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "SPOTIFY",
    nombre: "SPOTIFY",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "IPTV",
    nombre: "IPTV",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "SALDO",
    nombre: "SALDO",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "CANVA",
    nombre: "CANVA",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "CAPCUT",
    nombre: "CAPCUT",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "METEGOL",
    nombre: "METEGOL",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "UNIVERSAL",
    nombre: "UNIVERSAL",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "DEEZER",
    nombre: "DEEZER",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "MUBI",
    nombre: "MUBI",
    permitePantallas: false,
    permiteRenovacion: false,
  },
  {
    id: "FLUJO",
    nombre: "FLUJO TV",
    permitePantallas: true,
    permiteRenovacion: false,
  },
  {
    id: "EMBY",
    nombre: "EMBY",
    permitePantallas: true,
    permiteRenovacion: false,
  },
];

// =========================================================================
// 🚀 NUEVA LÓGICA DE VENTAS (MÓDULO DINÁMICO POR BLOQUES)
// =========================================================================

let contadorFilasVenta = 0;

function toggleVentasPanel() {
  // Opcional: mantenemos solo la vibración táctil para móviles
  if (navigator.vibrate) navigator.vibrate(10);

  const overlay = document.getElementById("ventasOverlay");
  overlay.classList.toggle("open");

  if (overlay.classList.contains("open")) {
    // 🔊 NUEVO: Reproducir sonido de apertura
    if (typeof window.CyberSonidos !== "undefined")
      window.CyberSonidos.play("abrir");

    // Lógica original de reseteo del formulario
    document.getElementById("formGenerarVenta").reset();
    document.getElementById("listaServiciosVentaDinamica").innerHTML = "";
    contadorFilasVenta = 0;
    window.ultimoMesesSeleccionado = "1";
    window.cuentasNetflixClienteActivo = []; // 🧹 Limpieza de memoria

    // Agrega la primera fila obligatoria
    agregarFilaServicioVenta();

    setTimeout(() => document.getElementById("ventaTelefono").focus(), 150);

    const optNomina = document.getElementById("optPagoNomina");
    if (optNomina) {
      const staffActivo = sessionStorage.getItem("active_staff") || "STAFF";
      optNomina.value = "NÓMINA: " + staffActivo.toUpperCase();
    }
  } else {
    // 🔊 NUEVO: Reproducir sonido de cierre cuando el panel se oculta
    if (typeof window.CyberSonidos !== "undefined")
      window.CyberSonidos.play("cerrar");
  }
}

function sincronizarMesesVenta(selectElement, idFilaOrigen) {
  // Lógica inteligente: Si tocas el primer mes, todos los demás heredan
  const container = document.getElementById("listaServiciosVentaDinamica");
  const primeraFila = container.querySelector(".vta-row-item");

  if (primeraFila && primeraFila.id === idFilaOrigen) {
    window.ultimoMesesSeleccionado = selectElement.value;
    const todosLosSelects = container.querySelectorAll(".select-meses-vta");
    todosLosSelects.forEach((sel) => {
      sel.value = selectElement.value;
    });
  }
}

// Interceptor del Modal para escribir en la fila correcta
function seleccionarCuentaModalNet(correo, perfil, cliente) {
  if (typeof haptic === "function") haptic();

  if (window.targetInputRenoDinamico) {
    window.targetInputRenoDinamico.value = correo + " | Perfil: " + perfil;
  }

  const inputNombre = document.getElementById("ventaNombre");
  if (inputNombre && inputNombre.value.trim() === "" && cliente !== "N/A") {
    inputNombre.value = cliente;
  }
  document.getElementById("modalRenovacionFlotante").classList.remove("open");
}

function ejecutarCreacionVentaLocal(e) {
  e.preventDefault();
  if (typeof haptic === "function") haptic();

  const nombre = document.getElementById("ventaNombre").value.trim();
  const telefono = document
    .getElementById("ventaTelefono")
    .value.replace(/\s+/g, "")
    .trim();
  const cantidadRaw = document
    .getElementById("ventaCantidad")
    .value.replace(/\D/g, "");
  const cantidad = parseFloat(cantidadRaw) || 0;
  const banco = document.getElementById("ventaBanco").value;

  const filasUI = document.querySelectorAll(
    ".listaServiciosVentaDinamica .vta-row-item, #listaServiciosVentaDinamica .vta-row-item",
  );
  let plataformasAdquiridas = false;
  let esRecargaSaldoPura = false;
  let bonoElegidoGlobal = "0";

  let descripcionSheetsArray = [];
  let resumenConfirmarArray = [];
  let correoNetflixReno = "";
  let esR = false;
  let memoriaMeses = {};

  filasUI.forEach((fila) => {
    const selectPlat = fila.querySelector(".select-plat-vta");
    if (selectPlat && selectPlat.value !== "") {
      const idPlat = selectPlat.value;

      if (idPlat === "SALDO") {
        esRecargaSaldoPura = true;
        bonoElegidoGlobal = fila.querySelector(".select-bono-vta").value;
        plataformasAdquiridas = true;
      } else {
        plataformasAdquiridas = true;
        let numPantallas = fila.querySelector(".select-pant-vta")
          ? fila.querySelector(".select-pant-vta").value
          : "1";
        let numMeses = fila.querySelector(".select-meses-vta")
          ? fila.querySelector(".select-meses-vta").value
          : "1";
        let elTipo = fila.querySelector(".select-tipo-vta")
          ? fila.querySelector(".select-tipo-vta").value
          : "Nueva";

        let esRenovacionActiva = elTipo === "Reno (Historial)";
        let prefixSheets = esRenovacionActiva ? "RENO: " : "";
        if (esRenovacionActiva) esR = true;

        if (idPlat === "NETFLIX" && esRenovacionActiva) {
          const inputReno = fila.querySelector(".input-correo-vta");
          if (inputReno && inputReno.value.trim() !== "") {
            correoNetflixReno = inputReno.value.trim();
          } else {
            alert(
              "⚠️ Error: Selecciona la cuenta de Netflix a renovar tocando el recuadro azul.",
            );
            throw new Error("Abort");
          }
        }

        memoriaMeses[idPlat] = numMeses;
        let platNombreScript =
          idPlat === "AMAZON" ? "AMAZON-PRIME-VIDEO" : idPlat;
        descripcionSheetsArray.push(
          `${prefixSheets}${numPantallas} ${platNombreScript}`,
        );
        resumenConfirmarArray.push(
          `    •  ${numPantallas}x ${platNombreScript} ➔ [${numMeses} Mes(es) / ${esRenovacionActiva ? "Reno" : "Nueva"}]`,
        );
      }
    }
  });

  if (!plataformasAdquiridas) {
    alert("⚠️ Selecciona al menos una plataforma para registrar la venta.");
    return;
  }

  const btnSubmit = document.getElementById("btnSubmitVentaV2");

  // 💼 CASO A: RECARGA DE SALDO DISTRIBUIDOR
  if (esRecargaSaldoPura) {
    let avisoRecarga = `❓ ¿CONFIRMAR INYECCIÓN DE SALDO? 💼\n\n👤 Distribuidor: ${nombre || telefono}\n🏦 Cuenta Origen: ${banco}\n💰 Monto Recarga: $${cantidad.toLocaleString("es-CO")}\n🎁 Bono Aplicado: ${bonoElegidoGlobal}%\n\n¿Estás seguro de que los datos son correctos?`;
    if (!confirm(avisoRecarga)) return;

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Inyectando saldo...`;

    const callbackName = "cb_recarga_" + Date.now();
    window[callbackName] = function (res) {
      btnSubmit.disabled = false;
      btnSubmit.innerText = "Realizar Venta";
      const scriptNode = document.getElementById("node_" + callbackName);
      if (scriptNode) scriptNode.remove();
      delete window[callbackName];

      if (res && res.status === "success") {
        let Richmond = `🔔 *NOTIFICACIÓN DE RECARGA CYBERNET* 🚀\n────────────────────\n👤 *Distribuidor:* ${res.revendedor}\n💰 *Monto Inyectado:* $${Math.round(res.recargadoBase).toLocaleString("es-CO")}\n🎁 *Bono Otorgado:* ${res.bonoAplicado}%\n📈 *Saldo de Regalo:* +$${Math.round(res.regaloAdicional).toLocaleString("es-CO")}\n💵 *Nuevo Saldo Total:* $${Math.round(res.nuevoSaldo).toLocaleString("es-CO")}\n────────────────────\n✨ _¡Tu saldo acumulado ya se encuentra disponible para compras!_`;

        window.textoSaldoRevendedorGlobal = Richmond;
        let btnSaldo = document.getElementById("btnCopiarSaldoRevendedor");
        if (btnSaldo) btnSaldo.style.display = "flex";

        document.getElementById("ventasOverlay").classList.remove("open");
        document.getElementById("outputTextoVentaFicha").value = Richmond;
        document
          .getElementById("ventaGeneradaModalOverlay")
          .classList.add("open");

        if (typeof cargarResumenProveedores === "function")
          cargarResumenProveedores();
      } else {
        alert("❌ Error: " + (res ? res.message : "Fallo al inyectar saldo."));
      }
    };
    const script = document.createElement("script");
    script.id = "node_" + callbackName;
    script.src = `${GOOGLE_SCRIPT_URL}?action=recargarSaldo&revendedor=${encodeURIComponent(telefono !== "" ? telefono : nombre)}&totalRecarga=${encodeURIComponent(cantidad)}&bono=${encodeURIComponent(bonoElegidoGlobal)}&banco=${encodeURIComponent(banco)}&callback=${callbackName}`;
    document.body.appendChild(script);
    return;
  }

  // 🎬 CASO B: VENTAS DE PANTALLAS TRADICIONALES
  const descripcionFinalSheets = descripcionSheetsArray.join(" + ");
  let mensajeVenta = `❓ ¿CONFIRMAR REGISTRO DE VENTA? 🍿\n────────────────────────────\n👤 Cliente: ${nombre || "No especificado"}\n📞 Celular: ${telefono}\n🏦 Recibe: ${banco}\n💰 Valor Cobrado: $${cantidad.toLocaleString("es-CO")}\n\n📺 Cuentas a entregar:\n${resumenConfirmarArray.join("\n")}\n────────────────────────────\n¿Estás seguro de que los datos ingresados son correctos?`;

  if (!confirm(mensajeVenta)) return;

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Registrando Venta...`;

  const callbackName = "cb_venta_" + Date.now();
  window[callbackName] = function (res) {
    btnSubmit.disabled = false;
    btnSubmit.innerText = "Realizar Venta";
    const scriptNode = document.getElementById("node_" + callbackName);
    if (scriptNode) scriptNode.remove();
    delete window[callbackName];

    if (res && res.status === "success") {
      let bloques = res.bloques || [];
      bloques.sort((a, b) => {
        if (a.id === "NETFLIX") return -1;
        if (b.id === "NETFLIX") return 1;
        return 0;
      });

      const nombreCliente = nombre !== "" ? nombre : "";
      let intro = `🌟 *¡Hola ${nombreCliente}!*\n\n`;
      intro += esR
        ? `Tu servicio ha sido *RENOVADO* con éxito. Mantienes tus mismos accesos:`
        : `Tu pedido ha sido procesado con éxito. Aquí tienes tus accesos:`;

      let cuerpo = "";
      bloques.forEach((b) => {
        let etiquetaUser =
          b.id === "IPTV" || b.id === "EMBY" ? "Usuario" : "Correo";
        let etiquetaPerfil =
          b.id === "IPTV" ? "URL" : b.id === "EMBY" ? "Servidor" : "Perfil";
        let mesesComprados = memoriaMeses[b.id] || "1";
        let textoMeses = mesesComprados > 1 ? ` (${mesesComprados} Meses)` : "";

        cuerpo += `\n\n🎬 *DETALLES DE ${b.id.replace(/-/g, " ").toUpperCase()}*${textoMeses} ✅\n────────────────────\n`;
        if (b.id === "NETFLIX")
          cuerpo += `⚠️ *Para iniciar sesión:* Cuando te pida un código, selecciona *Obtener ayuda* y después *Usar contraseña*.\n\n`;
        cuerpo += `👤 *${etiquetaUser}:* ${b.correo}\n🔐 *Contraseña:* ${b.clave}\n`;
        if (
          b.id === "IPTV" ||
          (b.perfil && b.perfil !== "" && b.perfil !== "N/A")
        )
          cuerpo += `🌐 *${etiquetaPerfil}:* ${b.perfil}\n`;
        if (b.id === "EMBY") cuerpo += `🔌 *Puerto:* Dejar vacío\n`;
        if (b.pin && b.pin !== "") cuerpo += `📍 *PIN:* ${b.pin}\n`;
        cuerpo += `📅 *Vence:* ${b.venc}\n`;
        if (b.id === "NETFLIX")
          cuerpo += `\n🤖 *¿NECESITAS UN CÓDIGO?* Puedes usar nuestra pagina para codigos disponible 24/7: www.cybernetsp.com/`;
      });

      let soporte = `\n\n📢 *INFORMACIÓN IMPORTANTE:* \n────────────────────\n⚠️ *Garantía activa:* Tu servicio cuenta con respaldo total durante su vigencia. \n🆘 *Soporte:* Si presentas algún inconveniente, *infórmanos de inmediato* para brindarte una solución rápida.`;
      const mensajeFinalFicha =
        intro +
        cuerpo +
        soporte +
        `\n\n💎 *Disfruta tu servicio.*\n✨ *¡Gracias por elegirnos!* ✨`;

      let btnSaldo = document.getElementById("btnCopiarSaldoRevendedor");
      if (res.esRevendedor) {
        let montoDescontado = res.valorCobrado || 0;
        let distribuidorNombre = res.nombreRevendedor || telefono;
        window.textoSaldoRevendedorGlobal = `🔔 *NOTIFICACIÓN DE SALDO CYBERNET* 🚀\n────────────────────\n👤 *Distribuidor:* ${distribuidorNombre}\n📉 *Débito por compra:* -$${Math.round(montoDescontado).toLocaleString("es-CO")}\n💰 *Saldo Disponible:* $${Math.round(res.saldoQuedante).toLocaleString("es-CO")}\n────────────────────\n✨ _¡Gracias por tu compra mayorista en Cybernet!_`;
        if (btnSaldo) btnSaldo.style.display = "flex";
      } else {
        window.textoSaldoRevendedorGlobal = "";
        if (btnSaldo) btnSaldo.style.display = "none";
      }

      document.getElementById("ventasOverlay").classList.remove("open");
      document.getElementById("outputTextoVentaFicha").value =
        mensajeFinalFicha;
      document
        .getElementById("ventaGeneradaModalOverlay")
        .classList.add("open");

      document.getElementById("formGenerarVenta").reset();
      document.getElementById("listaServiciosVentaDinamica").innerHTML = "";
      contadorFilasVenta = 0;
      agregarFilaServicioVenta();

      if (res.alertasStock && res.alertasStock.length > 0) {
        let avisoTexto =
          "⚠️ ¡ALERTA DE INVENTARIO CRÍTICO! ⚠️\n───────────────────────────\n";
        res.alertasStock.forEach((a) => {
          avisoTexto += `🚨 Plataforma: ${a.plat} ➔ ¡Solo quedan ${a.cant} perfiles libres!\n`;
        });
        setTimeout(() => {
          alert(avisoTexto);
        }, 600);
      }
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de comunicación."));
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + callbackName;
  const mesesParam = encodeURIComponent(JSON.stringify(memoriaMeses));
  script.src = `${GOOGLE_SCRIPT_URL}?action=registrarVentaDirectaV13&nombre=${encodeURIComponent(nombre)}&telefono=${encodeURIComponent(telefono)}&descripcion=${encodeURIComponent(descripcionFinalSheets)}&correoReno=${encodeURIComponent(correoNetflixReno)}&cantidad=${encodeURIComponent(cantidad)}&banco=${encodeURIComponent(banco)}&meses=${mesesParam}&callback=${callbackName}`;
  document.body.appendChild(script);
}
window.toggleCargarPanel = function () {
  const panel = document.getElementById("cargarOverlay");
  if (!panel) return;

  if (panel.classList.contains("open")) {
    panel.classList.remove("open");
  } else {
    if (typeof cerrarTodasLasAppsActivas === "function") {
      cerrarTodasLasAppsActivas(); // 🔥 Evita que se monte encima de Finanzas, Distris, etc.
    }
    panel.classList.add("open");
  }
};

function comprobarProveedorDinamico() {
  const selectProv = document.getElementById("loadProveedor").value;
  const wrapperManual = document.getElementById("wrapperProveedorManual");
  const inputManual = document.getElementById("loadProveedorManual");

  if (selectProv === "OTRO") {
    wrapperManual.style.setProperty("display", "flex", "important");
    inputManual.required = true;
    inputManual.focus();
  } else {
    wrapperManual.style.setProperty("display", "none", "important");
    inputManual.required = false;
    inputManual.value = "";
  }
}

function ejecutarCargaLote(e) {
  e.preventDefault();
  // Si tienes una función haptic() definida en tu JS, déjala; si no, coméntala.
  if (typeof haptic === "function") haptic();

  const btnSubmit = document.getElementById("btnSubmitCarga");
  const plataforma = document.getElementById("loadPlataforma").value;
  const selectProv = document.getElementById("loadProveedor").value;
  const proveedorManual = document
    .getElementById("loadProveedorManual")
    .value.trim();
  const bloqueCuentas = document.getElementById("loadCuentasBloque").value;

  let listaCuentasExtraidas = [];

  // =========================================================================
  // 1. NUEVA LÓGICA: Detección de Bloques Detallados (Cuenta: ... Contraseña: ...)
  // =========================================================================
  const esBloqueDetallado =
    /(?:Cuenta|Correo|Email):\s*([^\n\r]+)/i.test(bloqueCuentas) &&
    /(?:Contraseña|Clave|Password):\s*([^\n\r]+)/i.test(bloqueCuentas);

  if (esBloqueDetallado) {
    const regexCuenta = /(?:Cuenta|Correo|Email):\s*([^\s\n\r]+)/gi;
    const regexClave = /(?:Contraseña|Clave|Password):\s*([^\s\n\r]+)/gi;

    let cuentas = [];
    let matchC;
    while ((matchC = regexCuenta.exec(bloqueCuentas)) !== null) {
      cuentas.push(matchC[1].trim());
    }

    let claves = [];
    let matchP;
    while ((matchP = regexClave.exec(bloqueCuentas)) !== null) {
      claves.push(matchP[1].trim());
    }

    // Emparejamos los correos con sus respectivas contraseñas
    const limite = Math.min(cuentas.length, claves.length);
    for (let i = 0; i < limite; i++) {
      if (cuentas[i] && claves[i]) {
        listaCuentasExtraidas.push(cuentas[i] + " " + claves[i]);
      }
    }
  }
  // =========================================================================
  // 2. LÓGICA CLÁSICA: Extracción Tradicional (correo:clave o correo clave)
  // =========================================================================
  else {
    const regexEmailPass =
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})[:\s|]+([^\s\n\r]+)/g;
    let matches;

    while ((matches = regexEmailPass.exec(bloqueCuentas)) !== null) {
      let user = matches[1].trim();
      let pass = matches[2].trim();
      if (
        user &&
        pass &&
        pass.length > 1 &&
        !pass.toLowerCase().includes("valor") &&
        !pass.toLowerCase().includes("subtotal")
      ) {
        listaCuentasExtraidas.push(user + " " + pass);
      }
    }

    // Modo rescate extremo línea por línea si falla el Regex
    if (listaCuentasExtraidas.length === 0) {
      let lineas = bloqueCuentas.split("\n");
      listaCuentasExtraidas = lineas
        .map((linea) => {
          let l = linea.trim();
          if (l.includes(":") && !l.includes("|") && !l.includes(" ")) {
            return l.replace(":", " ");
          }
          return l;
        })
        .filter((l) => l.length > 0 && l.includes("@")); // Nos aseguramos que al menos tenga un @
    }
  }

  const bloqueCuentasFinal = listaCuentasExtraidas.join("\n");
  const proveedorFinal = selectProv === "OTRO" ? proveedorManual : selectProv;

  // Validación de extracción vacía
  if (bloqueCuentasFinal.trim() === "") {
    triggerToast(
      `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-red);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> <span>No se detectaron credenciales válidas.</span></div>`,
    );
    return;
  }

  // Validación de proveedor manual
  if (selectProv === "OTRO" && proveedorFinal === "") {
    triggerToast(
      `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-orange);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> <span>Escribe el nombre del nuevo proveedor.</span></div>`,
    );
    return;
  }

  // Interfaz de carga
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:8px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Inyectando en Sheets...`;

  const oldScript = document.getElementById("cyber_cargamasiva_node");
  if (oldScript) oldScript.remove();

  // Función de retorno desde Apps Script
  // Reemplazar la función de retorno existente dentro de ejecutarCargaLote
  window.procesarCargaLoteSheets = function (res) {
    const scriptNode = document.getElementById("cyber_cargamasiva_node");
    if (scriptNode) scriptNode.remove();

    btnSubmit.disabled = false;
    btnSubmit.innerText = "Cargar Cuentas en Lote";

    if (res && res.status === "success") {
      // 1. Toast de éxito general para las que SÍ pasaron
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>${res.message}</span></div>`,
      );

      // (Aquí mantenemos tu lógica de actualizar la caché local y renderizar el historial de la sesión)
      let cacheTurno = JSON.parse(
        sessionStorage.getItem("cyber_history_cargas") || "[]",
      );
      listaCuentasExtraidas.forEach((linea) => {
        let fragmentos = linea.trim().split(/\s+/);
        if (fragmentos.length >= 2) {
          let correoUser = fragmentos[0];
          let claveUser = fragmentos[1];
          // Solo guardamos en historial visual si NO está en la lista de repetidas (si la hay)
          let esRepetida =
            res.repetidas &&
            res.repetidas.some(
              (r) => r.correo.toLowerCase() === correoUser.toLowerCase(),
            );
          if (!esRepetida) {
            cacheTurno.push({
              plataforma: plataforma,
              proveedor: proveedorFinal,
              correo: correoUser,
              clave: claveUser,
            });
            if (typeof renderizarTarjetaHistorial === "function") {
              renderizarTarjetaHistorial(
                plataforma,
                proveedorFinal,
                correoUser,
                claveUser,
              );
            }
          }
        }
      });
      sessionStorage.setItem(
        "cyber_history_cargas",
        JSON.stringify(cacheTurno),
      );
      document.getElementById("formCargarCuentas").reset();
      document.getElementById("wrapperProveedorManual").style.display = "none";
      if (typeof cargarResumenProveedores === "function")
        cargarResumenProveedores();

      // 2. Revisamos si hubo cuentas repetidas para abrir el Modal
      if (res.repetidas && res.repetidas.length > 0) {
        mostrarModalRepetidasCybernet(res.repetidas);
      }
    } else {
      // Si el status fue error, puede ser porque TODAS estaban repetidas o hubo un error de red
      if (res && res.repetidas && res.repetidas.length > 0) {
        mostrarModalRepetidasCybernet(res.repetidas);
      } else {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-red);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> <span>Error: ${res ? res.message : "Fallo de comunicación."}</span></div>`,
        );
      }
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_cargamasiva_node";
  let queryParams = `?action=cargarCuentasMasivo&plataforma=${encodeURIComponent(plataforma)}&proveedor=${encodeURIComponent(proveedorFinal)}&bloqueCuentas=${encodeURIComponent(bloqueCuentasFinal)}&callback=procesarCargaLoteSheets&_ts=${Date.now()}`;
  scriptElement.src = GOOGLE_SCRIPT_URL + queryParams; // Asegúrate de tener GOOGLE_SCRIPT_URL definida en tu JS
  document.body.appendChild(scriptElement);
}

function cargarResumenProveedores() {
  const tbody = document.getElementById("tablaResumenProveedores");
  if (!tbody) return;

  const oldScript = document.getElementById("cyber_prov_summary_node");
  if (oldScript) oldScript.remove();

  tbody.innerHTML =
    '<tr><td colspan="3" style="text-align: center; padding: 15px; color: var(--text-secondary);"><svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle; margin-right:6px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Sincronizando métricas...</td></tr>';

  window.procesarResumenProveedores = function (res) {
    const scriptNode = document.getElementById("cyber_prov_summary_node");
    if (scriptNode) scriptNode.remove();

    if (res && res.status === "success") {
      const data = res.data;
      const conteo = { ANA: 0, CHAYO: 0, FABIAN: 0, "OTROS / MANUAL": 0 };

      data.forEach((item) => {
        let prov = String(item.proveedor || "")
          .toUpperCase()
          .trim();
        if (conteo[prov] !== undefined) {
          conteo[prov]++;
        } else if (prov !== "") {
          conteo["OTROS / MANUAL"]++;
        }
      });

      let html = "";
      for (let prov in conteo) {
        let cant = conteo[prov];
        let alarmaTexto = "Estable";
        let alarmaColor = "var(--ios-green)";

        if (cant > 4) {
          alarmaTexto = "Crítico";
          alarmaColor = "var(--ios-red)";
        } else if (cant > 0) {
          alarmaTexto = "Riesgo";
          alarmaColor = "var(--ios-orange)";
        }

        html += `
                          <tr>
                              <td style="padding: 10px 5px; border-bottom: 0.5px solid rgba(255,255,255,0.05);"><strong>${prov}</strong></td>
                              <td style="padding: 10px 5px; border-bottom: 0.5px solid rgba(255,255,255,0.05); text-align: center; font-family: monospace; font-weight: bold; font-size: 1rem; color: ${cant > 0 ? "var(--ios-red)" : "var(--text-secondary)"};">${cant}</td>
                              <td style="padding: 10px 5px; border-bottom: 0.5px solid rgba(255,255,255,0.05); text-align: right; font-weight: 600; color: ${alarmaColor};">${alarmaTexto}</td>
                          </tr>`;
      }
      tbody.innerHTML = html;
    } else {
      tbody.innerHTML =
        '<tr><td colspan="3" style="text-align: center; color: var(--ios-red);">Error al sincronizar.</td></tr>';
    }
    delete window.procesarResumenProveedores;
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_prov_summary_node";
  scriptElement.src =
    GOOGLE_SCRIPT_URL +
    "?action=obtenerGarantias&callback=procesarResumenProveedores&_ts=" +
    Date.now();
  document.body.appendChild(scriptElement);
}

function renderizarTarjetaHistorial(plataforma, proveedor, correo, clave) {
  const msgVacio = document.getElementById("msgHistorialVacio");
  if (msgVacio) msgVacio.remove();

  const cajaHistorial = document.getElementById("contenedorHistorialSesion");
  if (!cajaHistorial) return;

  const tarjetaLog = document.createElement("div");
  tarjetaLog.className = "card-ios";
  tarjetaLog.style.padding = "10px 12px";
  tarjetaLog.style.background = "rgba(255, 255, 255, 0.02)";
  tarjetaLog.style.display = "flex";
  tarjetaLog.style.flexDirection = "column";
  tarjetaLog.style.gap = "6px";
  tarjetaLog.style.marginBottom = "0";

  tarjetaLog.innerHTML = `
                  <div class="flex-row-between" style="border-bottom: 0.5px solid rgba(255,255,255,0.06); padding-bottom: 4px;">
                      <span class="badge-ios badge-blue" style="font-size: 0.68rem; padding: 1px 6px;">${plataforma.toUpperCase()}</span>
                      <span class="text-secondary" style="font-size: 0.75rem; font-weight: 600;">Prov: <b style="color:var(--text-primary);">${proveedor.toUpperCase()}</b></span>
                  </div>
                  <div class="flex-row-between" style="font-size: 0.82rem;">
                      <span style="color: var(--text-primary); font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 70%;">${correo}</span>
                      <button class="btn-ios btn-secondary" style="padding: 3px 8px; font-size: 0.7rem; width: auto; margin: 0;" onclick="copiarTextoRapido(this, '${correo}')">Copiar</button>
                  </div>
                  <div class="flex-row-between" style="font-size: 0.82rem;">
                      <span style="color: var(--ios-green); font-family: monospace; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 70%;">${clave}</span>
                      <button class="btn-ios btn-secondary" style="padding: 3px 8px; font-size: 0.7rem; width: auto; margin: 0;" onclick="copiarTextoRapido(this, '${clave}')">Copiar</button>
                  </div>
              `;
  cajaHistorial.insertBefore(tarjetaLog, cajaHistorial.firstChild);
}

// ✂️ LÓGICA DEL TALLER NETFLIX: CORTES
function volverMenuNetflix() {
  haptic();
  document.getElementById("netflixPanelCortes").style.display = "none";
  document.getElementById("netflixMenuPrincipal").style.display = "flex";
}

// 🔄 Función para re-escanear cortes desde Sheets en vivo
window.refrescarCortesEnVivo = function (btn) {
  if (typeof haptic === "function") haptic();
  let oldText = btn.innerHTML;
  btn.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Buscando...`;
  btn.disabled = true;

  // 🔥 MAGIA AQUÍ: Forzamos el borrado de la memoria local de cortes
  // Esto obliga al navegador a mostrarte todos los cortes pendientes desde cero
  sessionStorage.removeItem("cyber_cortes_recientes");

  window.abrirPanelCortesNet();

  setTimeout(() => {
    btn.innerHTML = oldText;
    btn.disabled = false;
  }, 1000);
};

// Generador de clave fácil para TV (Panel de Cortes)
function generarClaveNetflixTV() {
  const palabras = [
    "luna",
    "nova",
    "star",
    "cielo",
    "lobo",
    "rayo",
    "neon",
    "sol",
    "mar",
    "azul",
    "rojo",
    "rey",
    "fuego",
    "agua",
    "aire",
    "tierra",
    "nube",
    "rio",
    "lago",
    "flor",
    "roca",
    "astro",
    "cometa",
    "mundo",
    "luz",
    "onda",
    "pico",
    "ruta",
    "sur",
    "norte",
    "este",
    "oeste",
    "nieve",
    "hoja",
    "leon",
    "tigre",
    "oso",
    "zorro",
    "puma",
    "gato",
    "perro",
    "ave",
    "pez",
    "toro",
    "rana",
    "mono",
    "pato",
    "cisne",
    "buho",
    "foca",
    "mula",
    "oro",
    "jade",
    "rubi",
    "gris",
    "rosa",
    "verde",
    "blanco",
    "negro",
    "plata",
    "coral",
    "ambar",
    "mago",
    "jefe",
    "eco",
    "alfa",
    "beta",
    "omega",
    "cyber",
    "red",
    "top",
    "max",
    "pro",
    "vip",
    "cine",
    "paz",
    "amor",
    "vida",
    "faro",
    "cima",
    "meta",
    "arte",
    "mito",
    "fase",
    "nota",
    "zen",
    "zoom",
    "play",
    "game",
    "run",
    "fast",
    "cool",
    "flash",
    "jazz",
    "rock",
    "pop",
    "soul",
    "lord",
    "lady",
    "duque",
    "conde",
    "ninja",
    "dragon",
    "fenix",
    "titan",
    "heroe",
    "dios",
  ];
  const p = palabras[Math.floor(Math.random() * palabras.length)];
  const n = Math.floor(Math.random() * 90) + 10;
  return p + n + "@@";
}

// =========================================================================
// 🚀 UPGRADE: ISLA DINÁMICA INTELIGENTE (Efecto Apple Morphic)
// =========================================================================
function triggerToast(mensajeHtml) {
  const isla = document.getElementById("appleToast");
  if (!isla) return;

  // 1. Limpiar estados anteriores de golpe
  isla.classList.remove("island-active");
  isla.innerHTML = "";

  // 2. Pequeño delay para permitir el reinicio físico y brote elástico
  setTimeout(() => {
    // Envolvemos el texto en el contenedor de animación suave
    isla.innerHTML = `<div class="island-content-fade">${mensajeHtml}</div>`;
    isla.classList.add("island-active");

    // Sonido pop sutil si el motor de audio está activo
    if (typeof CyberSonidos !== "undefined") CyberSonidos.play("pop");
  }, 40);

  // 3. Temporizador de Auto-Cierre (Regresa a su estado compacto y se desvanece)
  clearTimeout(window.islandTimer);
  window.islandTimer = setTimeout(() => {
    isla.classList.remove("island-active");
    // Esperamos a que termine de encogerse para limpiar el texto por dentro
    setTimeout(() => {
      isla.innerHTML = "";
    }, 400);
  }, 3500);
}

function copiarTextoRapido(btn, texto) {
  haptic();
  navigator.clipboard.writeText(texto).then(() => {
    let oldBg = btn.style.background;
    let oldColor = btn.style.color;

    btn.style.background = "var(--ios-green)";
    btn.style.color = "#ffffff";
    btn.style.transform = "scale(1.15)";

    triggerToast(
      `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Copiado al portapapeles</span></div>`,
    );

    setTimeout(() => {
      btn.style.background = oldBg;
      btn.style.color = oldColor;
      btn.style.transform = "scale(1)";
    }, 800);
  });
}

function copiarInputRapido(btn, idInput) {
  haptic();
  let texto = document.getElementById(idInput).value;
  navigator.clipboard.writeText(texto).then(() => {
    let oldBg = btn.style.background;
    let oldColor = btn.style.color;

    btn.style.background = "var(--ios-green)";
    btn.style.color = "#ffffff";
    btn.style.transform = "scale(1.1)";

    triggerToast(
      `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Nueva clave copiada</span></div>`,
    );

    setTimeout(() => {
      btn.style.background = oldBg;
      btn.style.color = oldColor;
      btn.style.transform = "scale(1)";
    }, 800);
  });
}

window.clientesSalvadosCorte = [];

function mostrarResultadoCortes(clientes) {
  window.clientesSalvadosCorte = clientes;
  const contenedor = document.getElementById("listaClientesSalvados");
  contenedor.innerHTML = "";

  if (clientes.length === 0) {
    contenedor.innerHTML =
      "<div style='color:var(--text-secondary); text-align:center; padding: 15px; font-size:0.85rem;'>Ningún cliente quedó activo en esta cuenta.</div>";
  } else {
    clientes.forEach((cli, idx) => {
      let div = document.createElement("div");
      div.style.padding = "10px 12px";
      div.style.background = "rgba(255,255,255,0.02)";
      div.style.border = "1px solid rgba(255,255,255,0.05)";
      div.style.borderRadius = "12px";
      div.style.display = "flex";
      div.style.justifyContent = "space-between";
      div.style.alignItems = "center";

      let pinTexto = cli.pin ? ` | PIN: ${cli.pin}` : "";
      let nombreTexto = cli.nombre ? ` • ${cli.nombre}` : "";

      div.innerHTML = `
                          <div style="display:flex; flex-direction:column; gap:1px;">
                              <span style="font-weight:700; color:var(--text-primary); font-size:0.9rem;">${cli.telefono}</span>
                              <span style="font-size:0.72rem; color:var(--text-secondary);">Perfil ${cli.perfil}${nombreTexto}${pinTexto}</span>
                          </div>
                          <button style="background: rgba(48, 209, 88, 0.1); border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--ios-green); cursor: pointer; transition: all 0.2s ease; flex-shrink: 0;" onclick="copiarTextoRapido(this, decodeURIComponent('${cli.mensaje}'))" title="Copiar Mensaje">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                          </button>
                      `;
      contenedor.appendChild(div);
    });
  }
  document.getElementById("resultadoCortesOverlay").classList.add("open");
}

function copiarBloqueNumerosCorte(btn) {
  haptic();
  let texto = "";
  window.clientesSalvadosCorte.forEach((cli, idx) => {
    texto += `${idx + 1}. wa.me/57${cli.telefono}\n`;
  });

  navigator.clipboard.writeText(texto).then(() => {
    let oldBg = btn.style.background;
    let oldColor = btn.style.color;
    let oldBorder = btn.style.borderColor;

    btn.style.background = "var(--ios-green)";
    btn.style.color = "#ffffff";
    btn.style.borderColor = "transparent";
    btn.style.transform = "scale(1.03)";

    triggerToast(
      `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Bloque copiado</span></div>`,
    );

    setTimeout(() => {
      btn.style.background = oldBg;
      btn.style.color = oldColor;
      btn.style.borderColor = oldBorder;
      btn.style.transform = "scale(1)";
    }, 800);
  });
}

// =========================================================================
// 🍿 CONTROLADOR DEL TALLER NETFLIX (BYPASS DIRECTO A CORTES)
// =========================================================================
window.toggleNetflixManagerPanel = window.toggleNetflixPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("netflixManagerOverlay");
  if (overlay) {
    overlay.classList.toggle("open");

    // 🔄 AUTO-LANZAMIENTO: Al abrir el panel de Netflix, va directo a escanear los cortes
    if (overlay.classList.contains("open")) {
      window.abrirPanelCortesNet();
    }
  }
};

// =========================================================================
// 🍿 REESCANEO Y RENDERIZADO BENTO DE CORTES NETFLIX
// =========================================================================
window.abrirPanelCortesNet = function () {
  if (typeof haptic === "function") haptic();

  const contenedor = document.getElementById("listaCuentasCorte");
  if (!contenedor) return;

  // Cargador de diseño corporativo elegante
  contenedor.innerHTML = `
    <div style="text-align:center; padding:30px 20px; color:var(--text-secondary); font-size:0.9rem;">
      <svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e50914" stroke-width="2.5" style="margin-bottom:12px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
      <br><span style="color:#e50914; font-weight:700; letter-spacing:0.3px;">Escaneando perfiles vencidos en Sheets...</span>
    </div>`;

  const cbName = "cb_cortes_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    contenedor.innerHTML = "";

    if (res && res.status === "success") {
      let cortadosLocales = JSON.parse(
        sessionStorage.getItem("cyber_cortes_recientes") || "[]",
      );

      let cuentasValidas = res.data.filter((cuenta) => {
        if (!cuenta.correo || cuenta.correo.includes("#ERROR")) return false;
        if (cuenta.fecha !== undefined && cuenta.fecha.trim() === "")
          return false;
        if (
          cuenta.vencimiento !== undefined &&
          cuenta.vencimiento.trim() === ""
        )
          return false;
        if (!cuenta.perfilesVencidos || cuenta.perfilesVencidos.length === 0)
          return false;
        if (cortadosLocales.includes(cuenta.correo)) return false;
        return true;
      });

      if (cuentasValidas.length === 0) {
        contenedor.innerHTML =
          '<div style="text-align:center; padding:30px 20px; color:var(--ios-green); font-weight:bold; font-size:1rem;">🎉 ¡Todo limpio! No quedan perfiles vencidos.</div>';
        return;
      }

      cuentasValidas.forEach((cuenta, index) => {
        let claveNuevaSugerida = generarClaveNetflixTV();
        let perfilesTexto = cuenta.perfilesVencidos.join(", ");
        let perfilesOcultosSeguros = cuenta.perfilesVencidos.join("|||");

        let div = document.createElement("div");
        div.className = "widget-ipad account-cut-card";
        div.style.cssText =
          "padding: 16px !important; margin-bottom: 12px !important; gap: 14px !important; border-left: 4px solid #e50914 !important;";

        div.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; width: 100%;">
            <div style="display: flex; flex-direction: column; gap: 4px; overflow: hidden; flex-grow: 1;">
              <span style="font-size: 0.65rem; color: #e50914; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; display: flex; align-items: center; gap: 6px;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #e50914; box-shadow: 0 0 8px #e50914;"></span> Corte Requerido
              </span>
              <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
                <span style="font-size: 1rem; color: var(--text-primary); font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 82%; font-family: monospace;">${cuenta.correo}</span>
                <button style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 4px 6px; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center;" onclick="window.copiarCorreoNetflixCorte(this, '${cuenta.correo}')">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            </div>
            <div style="background: rgba(229, 9, 20, 0.12); color: #ff453a; padding: 5px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; border: 1px solid rgba(229, 9, 20, 0.2); white-space: nowrap;">
              Perfiles: ${perfilesTexto}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05);">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 0.65rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Clave Vencida</span>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                <span style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 600; font-family: monospace; text-decoration: line-through; opacity: 0.5;">${cuenta.claveActual}</span>
                <button style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; padding: 2px;" onclick="copiarTextoRapido(this, '${cuenta.claveActual}')">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px; border-left: 1px solid rgba(255,255,255,0.06); padding-left: 12px;">
              <span style="font-size: 0.65rem; color: var(--ios-green); font-weight: 800; text-transform: uppercase;">Nueva Clave TV</span>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                <input type="text" id="nueva_clave_${index}" style="background: transparent !important; border: none !important; color: var(--ios-green); font-size: 0.9rem; font-weight: 800; font-family: monospace; width: 100%; outline: none; padding: 0; box-shadow: none !important;" value="${claveNuevaSugerida}">
                <button style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.2); border-radius: 6px; padding: 3px 6px; color: var(--ios-green); cursor: pointer; font-size: 0.7rem; font-weight: bold;" onclick="copiarInputRapido(this, 'nueva_clave_${index}')">Copiar</button>
              </div>
            </div>
          </div>

          <button class="btn-ios" style="background: #e50914 !important; color: white !important; padding: 12px; font-size: 0.88rem; font-weight: 800; border-radius: 12px; width: 100%; margin: 0; border: none; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(229, 9, 20, 0.25);" onclick="window.procesarCorteReal(this, '${cuenta.correo}', '${perfilesOcultosSeguros}', 'nueva_clave_${index}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Procesar Corte y Subir a Hoy
          </button>
        `;
        contenedor.appendChild(div);
      });
    } else {
      contenedor.innerHTML = `<div style="color:var(--ios-red); text-align:center; padding:20px; font-weight:700;">Error: ${res ? res.message : "Fallo de conexión"}</div>`;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerCortesNetflix&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};
window.procesarCorteReal = function (
  btn,
  correo,
  perfilesCortados,
  idInputNuevaClave,
) {
  if (typeof haptic === "function") haptic();
  const nuevaClave = document.getElementById(idInputNuevaClave).value;

  btn.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Operando...`;
  btn.disabled = true;

  const cbName = "cb_proc_corte_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      // 👇 MEMORIA: Guarda el correo para bloquearlo y que no vuelva a salir si refrescas
      let cortadosLocales = JSON.parse(
        sessionStorage.getItem("cyber_cortes_recientes") || "[]",
      );
      cortadosLocales.push(correo);
      sessionStorage.setItem(
        "cyber_cortes_recientes",
        JSON.stringify(cortadosLocales),
      );

      btn.innerHTML = "¡Completado!";
      btn.style.background = "var(--ios-green)";
      btn.style.color = "white";

      // ⚡ EXTINCIÓN DOM: Animación elástica reduciendo tamaño y borrado completo
      const tarjetaCard = btn.closest(".account-cut-card, .card-ios");
      if (tarjetaCard) {
        tarjetaCard.style.transform = "scale(0.9) translateY(-15px)";
        tarjetaCard.style.opacity = "0";

        setTimeout(() => {
          tarjetaCard.remove();

          // Verificación de bandeja vacía en caliente
          const contenedor = document.getElementById("listaCuentasCorte");
          if (
            contenedor &&
            contenedor.querySelectorAll(".account-cut-card, .card-ios")
              .length === 0
          ) {
            contenedor.innerHTML =
              '<div style="text-align:center; padding:40px; color:var(--ios-green); font-weight:bold; font-size:1rem;">🎉 ¡Todo limpio! No quedan perfiles vencidos.</div>';
          }
        }, 350);
      }

      mostrarResultadoCortes(res.clientes);
    } else {
      alert("Error: " + res.message);
      btn.innerHTML = "Reintentar";
      btn.disabled = false;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=procesarCorteNetflix&correo=${encodeURIComponent(correo)}&nuevaClave=${encodeURIComponent(nuevaClave)}&perfilesCortados=${encodeURIComponent(perfilesCortados)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

function renderizarPlataformasVenta() {
  const contenedor = document.getElementById("contenedorPlataformasVenta");
  if (!contenedor) return;

  let html = "";
  listaPlataformasVenta.forEach((plat) => {
    let selectorPantallas = "";
    if (plat.permitePantallas) {
      selectorPantallas = `
                          <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                              <span style="font-size: 0.68rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">Pantallas</span>
                              <select class="input-ios" id="pantallas_${plat.id}" name="ventaPantallas" style="padding: 6px; font-size:0.8rem;" disabled>
                                  <option value="1" selected>1 Pantalla</option>
                                  <option value="2">2 Pantallas</option>
                                  <option value="3">3 Pantallas</option>
                                  <option value="4">4 Pantallas</option>
                                  <option value="5">5 Pantallas</option>
                              </select>
                          </div>
                      `;
    }

    let selectorDinamicoDerecho = "";
    if (plat.id === "SALDO") {
      selectorDinamicoDerecho = `
                          <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                              <span style="font-size: 0.68rem; color: #ff9500; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">Bono %</span>
                              <select class="input-ios" id="bono_${plat.id}" name="ventaBonos" style="padding: 6px; font-size:0.8rem; border-color: rgba(255,149,0,0.3);" disabled>
                                  <option value="0" selected>0% Bono</option>
                                  <option value="5">5% Bono</option>
                                  <option value="10">10% Bono</option>
                                  <option value="15">15% Bono</option>
                                  <option value="20">20% Bono</option>
                                  <option value="25">25% Bono</option>
                                  <option value="30">30% Bono</option>
                              </select>
                          </div>
                      `;
    } else {
      selectorDinamicoDerecho = `
                          <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                              <span style="font-size: 0.68rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">Meses</span>
                              <select class="input-ios" id="meses_${plat.id}" name="ventaMeses" style="padding: 6px; font-size:0.8rem;" onchange="actualizarMesesGlobal(this.value)" disabled>
                                  <option value="1" selected>1 Mes</option>
                                  <option value="2">2 Meses</option>
                                  <option value="3">3 Meses</option>
                                  <option value="4">4 Meses</option>
                                  <option value="5">5 Meses</option>
                              </select>
                          </div>
                      `;
    }

    let selectorTipo = "";
    if (plat.permiteRenovacion) {
      if (plat.id === "NETFLIX") {
        selectorTipo = `
                              <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                                  <span style="font-size: 0.68rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">Tipo</span>
                                  <select class="input-ios" id="tipo_${plat.id}" name="ventaTipo" style="padding: 6px; font-size:0.8rem;" onchange="comprobarTipoVentaNetflix(this, '${plat.id}')" disabled>
                                      <option value="Nueva" selected>Nueva Cuenta</option>
                                      <option value="Reno (Historial)" id="opt_historial_net" style="display: none; background: rgba(10, 132, 255, 0.2);">Reno (Elegir)</option>
                                  </select>
                              </div>
                          `;
      } else {
        selectorTipo = `
                              <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                                  <span style="font-size: 0.68rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">Tipo</span>
                                  <select class="input-ios" id="tipo_${plat.id}" name="ventaTipo" style="padding: 6px; font-size:0.8rem;" onchange="comprobarTipoVentaNetflix(this, '${plat.id}')" disabled>
                                      <option value="Nueva" selected>Nueva</option>
                                      <option value="Reno">Reno</option>
                                  </select>
                              </div>
                          `;
      }
    }

    let campoCorreoReno = "";
    if (plat.id === "NETFLIX") {
      campoCorreoReno = `
                          <div id="wrapper_correo_reno_${plat.id}" style="display: none; flex-direction: column; gap: 5px; width: 100%; margin-top: 8px;">
                              <span style="font-size: 0.68rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">Correo Seleccionado</span>
                              <input type="email" id="correo_reno_${plat.id}" class="input-ios" style="margin-bottom: 0; padding: 10px 12px; border-radius: 10px;" placeholder="ejemplo@correo.com">
                          </div>
                      `;
    }

    html += `
                      <div class="card-ios" id="card_plat_${plat.id}" data-nombre="${plat.nombre.toLowerCase()}" style="display: none; padding: 15px; gap:10px;">
                          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                              <label style="display: flex; align-items: center; gap: 10px; font-size: 1rem; font-weight: 700; color: var(--text-primary); cursor: pointer; user-select: none;">
                                  <input type="checkbox" name="platformCheckVenta" value="${plat.id}" style="accent-color: var(--ios-blue); width: 18px; height: 18px;" onchange="comprobarDesbloqueoVentaPill(this, '${plat.id}')"> 
                                  ${plat.nombre}
                              </label>
                              <span id="badge_status_${plat.id}" style="width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.15); transition: all 0.3s ease;"></span>
                          </div>
                          <div style="display: flex; gap: 10px; width: 100%;">
                              ${selectorPantallas}
                              ${selectorDinamicoDerecho}
                              ${selectorTipo}
                          </div>
                          ${campoCorreoReno}
                      </div>
                  `;
  });

  contenedor.innerHTML = html;
}

function filtrarPlataformasVenta() {
  const query = document
    .getElementById("buscarPlataformaVenta")
    .value.toLowerCase()
    .trim();
  const filas = document.querySelectorAll(
    "#contenedorPlataformasVenta .card-ios",
  );

  filas.forEach((fila) => {
    const nombrePlat = fila.getAttribute("data-nombre");
    const checkbox = fila.querySelector('input[type="checkbox"]');

    if (query === "") {
      // 🔥 MODIFICACIÓN: Si el buscador está vacío, SOLO se muestran las seleccionadas.
      // Al inicio, como ninguna está marcada, la lista estará 100% oculta.
      if (checkbox && checkbox.checked) {
        fila.style.setProperty("display", "flex", "important");
      } else {
        fila.style.setProperty("display", "none", "important");
      }
    } else {
      // Si el usuario escribe, se muestran las que coincidan con la búsqueda o las ya seleccionadas
      if (nombrePlat.includes(query) || (checkbox && checkbox.checked)) {
        fila.style.setProperty("display", "flex", "important");
      } else {
        fila.style.setProperty("display", "none", "important");
      }
    }
  });
}

function comprobarDesbloqueoVentaPill(checkbox, id) {
  if (typeof haptic === "function") haptic();

  const elPantallas = document.getElementById(`pantallas_${id}`);
  const elMeses = document.getElementById(`meses_${id}`);
  const elBono = document.getElementById(`bono_${id}`);
  const elTipo = document.getElementById(`tipo_${id}`);
  const card = document.getElementById(`card_plat_${id}`);
  const badge = document.getElementById(`badge_status_${id}`);

  if (checkbox.checked) {
    // Activar los campos internos de esta plataforma
    if (elPantallas) elPantallas.disabled = false;
    if (elMeses) {
      elMeses.disabled = false;
      elMeses.value = window.ultimoMesesSeleccionado || "1";
    }
    if (elBono) elBono.disabled = false;
    if (elTipo) elTipo.disabled = false;

    // Estilos visuales de "seleccionado"
    if (card) {
      card.style.background = "rgba(255, 255, 255, 0.06)";
      card.style.borderColor = "rgba(10, 132, 255, 0.35)";
    }
    if (badge) {
      badge.style.background = "var(--ios-blue)";
      badge.style.boxShadow = "0 0 8px var(--ios-blue)";
    }

    // 🔥 NUEVA LÓGICA DE LIMPIEZA AUTOMÁTICA 🔥
    // Borramos solo la barra de búsqueda de plataformas y devolvemos el cursor ahí
    const buscadorPlat = document.getElementById("buscarPlataformaVenta");
    if (buscadorPlat && buscadorPlat.value !== "") {
      buscadorPlat.value = "";
      buscadorPlat.focus(); // Deja el teclado listo para escribir la siguiente
    }
  } else {
    // Si la desmarcamos, apagamos los controles
    if (elPantallas) {
      elPantallas.disabled = true;
      elPantallas.value = "1";
    }
    if (elMeses) {
      elMeses.disabled = true;
      elMeses.value = "1";
    }
    if (elBono) {
      elBono.disabled = true;
      elBono.value = "0";
    }
    if (elTipo) {
      elTipo.disabled = true;
      elTipo.value = "Nueva";
    }

    // Quitamos los estilos de "seleccionado"
    if (card) {
      card.style.background = "var(--glass-bg)";
      card.style.borderColor = "var(--glass-border)";
    }
    if (badge) {
      badge.style.background = "rgba(255, 255, 255, 0.15)";
      badge.style.boxShadow = "none";
    }

    // Ocultar campo de renovación si estaba abierto
    const wrapperReno = document.getElementById(`wrapper_correo_reno_${id}`);
    if (wrapperReno) wrapperReno.style.display = "none";
  }

  // Refrescar la lista visual de plataformas al final (oculta las no marcadas si el buscador está vacío)
  filtrarPlataformasVenta();
}

function ajustarInterfazPorMetodoPago() {
  const canalPago = document.getElementById("ventaBanco").value;
  const esOperacionRecargaSaldo = canalPago === "Saldo Distribuidor";

  listaPlataformasVenta.forEach((plat) => {
    const wrapperMeses = document.getElementById(`wrapper_meses_${plat.id}`);
    const wrapperBono = document.getElementById(`wrapper_bono_${plat.id}`);
    const checkbox = document.querySelector(
      `#card_plat_${plat.id} input[type="checkbox"]`,
    );

    if (!wrapperMeses || !wrapperBono) return;

    if (esOperacionRecargaSaldo) {
      wrapperMeses.style.display = "none";
      wrapperBono.style.display = "flex";
      if (checkbox && checkbox.checked) {
        if (document.getElementById(`bono_${plat.id}`))
          document.getElementById(`bono_${plat.id}`).disabled = false;
        if (document.getElementById(`meses_${plat.id}`))
          document.getElementById(`meses_${plat.id}`).disabled = true;
      }
    } else {
      wrapperMeses.style.display = "flex";
      wrapperBono.style.display = "none";
      if (checkbox && checkbox.checked) {
        if (document.getElementById(`meses_${plat.id}`))
          document.getElementById(`meses_${plat.id}`).disabled = false;
        if (document.getElementById(`bono_${plat.id}`))
          document.getElementById(`bono_${plat.id}`).disabled = true;
      }
    }
  });
}

window.cuentasNetflixClienteActivo = [];
let timeoutBusquedaNet = null;

function buscarHistorialNetflixEnVenta(telefono) {
  let telLimpio = telefono.replace(/\D/g, "");
  const optHistorial = document.getElementById("opt_historial_net");
  const inputTipo = document.getElementById("tipo_NETFLIX");
  const cardNetflix = document.getElementById("card_plat_NETFLIX");

  let alertaEEl = document.getElementById("alerta_reno_texto_NETFLIX");

  if (telLimpio.length < 8) {
    window.cuentasNetflixClienteActivo = [];
    if (optHistorial) optHistorial.style.display = "none";
    if (alertaEEl) alertaEEl.style.display = "none";
    const badge = document.getElementById("badge_status_NETFLIX");
    if (badge) {
      badge.style.background = "rgba(255,255,255,0.15)";
      badge.style.boxShadow = "none";
    }
    return;
  }

  clearTimeout(timeoutBusquedaNet);
  timeoutBusquedaNet = setTimeout(() => {
    const badge = document.getElementById("badge_status_NETFLIX");
    if (badge && cardNetflix && !cardNetflix.querySelector("input").checked) {
      badge.style.background = "var(--ios-orange)";
      badge.style.boxShadow = "0 0 8px var(--ios-orange)";
    }

    const cbName = "cb_net_search_" + Date.now();
    window[cbName] = function (res) {
      const scriptNode = document.getElementById("node_" + cbName);
      if (scriptNode) scriptNode.remove();
      delete window[cbName];

      window.cuentasNetflixClienteActivo = [];

      if (res && res.status === "success" && res.data.length > 0) {
        window.cuentasNetflixClienteActivo = res.data;

        // Mantiene la opción de renovación siempre disponible en el select
        if (optHistorial) optHistorial.style.display = "block";

        // Crea o muestra la alerta naranja de renovación disponible
        if (!alertaEEl && cardNetflix) {
          alertaEEl = document.createElement("div");
          alertaEEl.id = "alerta_reno_texto_NETFLIX";
          alertaEEl.style.cssText =
            "font-size: 0.72rem; color: var(--ios-orange); font-weight: 800; background: rgba(255, 159, 10, 0.08); padding: 4px 6px; border-radius: 8px; border: 1px solid rgba(255, 159, 10, 0.2); margin-top: 6px; text-align: center; display: block; width: 100%;";
          alertaEEl.innerText = "✨ ¡Renovación Disponible para este Cliente!";
          cardNetflix.appendChild(alertaEEl);
        }
        if (alertaEEl) alertaEEl.style.display = "block";

        if (
          badge &&
          cardNetflix &&
          !cardNetflix.querySelector("input").checked
        ) {
          badge.style.background = "var(--ios-green)";
          badge.style.boxShadow = "0 0 8px var(--ios-green)";
        }
      } else {
        if (optHistorial) optHistorial.style.display = "none";
        if (alertaEEl) alertaEEl.style.display = "none";
        if (
          badge &&
          cardNetflix &&
          !cardNetflix.querySelector("input").checked
        ) {
          badge.style.background = "rgba(255, 255, 255, 0.15)";
          badge.style.boxShadow = "none";
        }
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbName;
    script.src = `${GOOGLE_SCRIPT_URL}?action=buscarRenovacionNetflix&tel=${encodeURIComponent(telLimpio)}&callback=${cbName}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  }, 800);
}

window.comprobarTipoVentaNetflix = function (element, id) {
  if (id === "NETFLIX") {
    const wrapperCorreo = document.getElementById(`wrapper_correo_reno_${id}`);
    const inputReno = document.getElementById(`correo_reno_${id}`);
    let val = element.value;

    if (val === "Reno (Manual)") {
      if (wrapperCorreo) wrapperCorreo.style.display = "flex";
      if (inputReno) {
        inputReno.required = true;
        inputReno.value = "";
        inputReno.readOnly = false;
        inputReno.focus();
      }
    } else if (val === "Reno (Historial)") {
      if (wrapperCorreo) wrapperCorreo.style.display = "flex";
      if (inputReno) {
        inputReno.required = true;
        inputReno.readOnly = true;
      }
      // 🔥 FORZAR APERTURA: Ejecuta el modal con la lista de cuentas del cliente de inmediato
      if (typeof abrirModalRenovacionNet === "function") {
        abrirModalRenovacionNet();
      }
    } else {
      if (wrapperCorreo) wrapperCorreo.style.display = "none";
      if (inputReno) {
        inputReno.required = false;
        inputReno.value = "";
        inputReno.readOnly = false;
      }
    }
  }
};

function comprobarDesbloqueoVentaPill(checkbox, id) {
  if (typeof haptic === "function") haptic();

  const elPantallas = document.getElementById(`pantallas_${id}`);
  const elMeses = document.getElementById(`meses_${id}`);
  const elBono = document.getElementById(`bono_${id}`);
  const elTipo = document.getElementById(`tipo_${id}`);
  const card = document.getElementById(`card_plat_${id}`);
  const badge = document.getElementById(`badge_status_${id}`);

  if (checkbox.checked) {
    if (elPantallas) elPantallas.disabled = false;
    if (elMeses) {
      elMeses.disabled = false;
      elMeses.value = window.ultimoMesesSeleccionado || "1";
    }
    if (elBono) elBono.disabled = false;
    if (elTipo) elTipo.disabled = false;

    if (card) {
      card.style.background = "rgba(255, 255, 255, 0.06)";
      card.style.borderColor = "rgba(10, 132, 255, 0.35)";
    }
    if (badge) {
      badge.style.background = "var(--ios-blue)";
      badge.style.boxShadow = "0 0 8px var(--ios-blue)";
    }

    // 🏎️ AUTO-LIMPIEZA FLUIDA: Borra el buscador y despliega todo el stock al instante
    const buscadorPlat = document.getElementById("buscarPlataformaVenta");
    if (buscadorPlat) {
      buscadorPlat.value = "";
    }
  } else {
    if (elPantallas) {
      elPantallas.disabled = true;
      elPantallas.value = "1";
    }
    if (elMeses) {
      elMeses.disabled = true;
      elMeses.value = "1";
    }
    if (elBono) {
      elBono.disabled = true;
      elBono.value = "0";
    }
    if (elTipo) {
      elTipo.disabled = true;
      elTipo.value = "Nueva";
    }

    if (card) {
      card.style.background = "var(--glass-bg)";
      card.style.borderColor = "var(--glass-border)";
    }

    if (badge) {
      if (id === "NETFLIX" && window.cuentasNetflixClienteActivo.length > 0) {
        badge.style.background = "var(--ios-green)";
        badge.style.boxShadow = "0 0 8px var(--ios-green)";
      } else {
        badge.style.background = "rgba(255, 255, 255, 0.15)";
        badge.style.boxShadow = "none";
      }
    }

    const wrapperReno = document.getElementById(`wrapper_correo_reno_${id}`);
    if (wrapperReno) wrapperReno.style.display = "none";
  }

  // Refresca la vista para que todo sea scaneable de nuevo
  filtrarPlataformasVenta();
}

function abrirModalRenovacionNet() {
  haptic();
  const modal = document.getElementById("modalRenovacionFlotante");
  const contenedor = document.getElementById("listaCuentasModalReno");
  const buscador = document.getElementById("buscadorModalReno");

  buscador.value = "";
  contenedor.innerHTML = "";

  window.cuentasNetflixClienteActivo.forEach((cuenta) => {
    let div = document.createElement("div");
    div.className = "card-ios item-reno-modal";

    // 🔥 ESTILO CORREGIDO: Forzamos la alineación en fila y quitamos los saltos
    div.style.cssText =
      "padding: 14px 16px !important; cursor: pointer; background: rgba(255, 255, 255, 0.03) !important; border: 1px solid rgba(255, 255, 255, 0.06) !important; border-radius: 16px !important; margin-bottom: 0 !important; transition: all 0.2s ease;";

    // Efecto Hover brillante
    div.onmouseover = function () {
      this.style.background = "rgba(10, 132, 255, 0.1) !important";
      this.style.borderColor = "rgba(10, 132, 255, 0.3) !important";
    };
    div.onmouseout = function () {
      this.style.background = "rgba(255, 255, 255, 0.03) !important";
      this.style.borderColor = "rgba(255, 255, 255, 0.06) !important";
    };

    div.setAttribute(
      "data-search",
      cuenta.correo.toLowerCase() +
        " " +
        cuenta.perfil.toLowerCase() +
        " " +
        cuenta.cliente.toLowerCase(),
    );

    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <div style="display: flex; flex-direction: column; gap: 6px; overflow: hidden; padding-right: 10px;">
              <span style="color: var(--text-primary); font-weight: 800; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: monospace;">${cuenta.correo}</span>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="background: rgba(10, 132, 255, 0.15); border: 1px solid rgba(10, 132, 255, 0.3); color: var(--ios-blue); padding: 3px 8px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                      Perfil ${cuenta.perfil}
                  </span>
                  <span style="color: var(--text-secondary); font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      👤 Cliente: <b style="color: var(--text-primary); font-weight: 600;">${cuenta.cliente !== "" && cuenta.cliente !== "N/A" ? cuenta.cliente : "Sin nombre"}</b>
                  </span>
              </div>
          </div>
          <div style="color: var(--text-secondary); flex-shrink: 0; display: flex; align-items: center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
      </div>
    `;

    div.onclick = function () {
      seleccionarCuentaModalNet(cuenta.correo, cuenta.perfil, cuenta.cliente);
    };
    contenedor.appendChild(div);
  });

  modal.classList.add("open");

  setTimeout(() => buscador.focus(), 100);
}

function cerrarModalRenovacionNet() {
  haptic();
  document.getElementById("modalRenovacionFlotante").classList.remove("open");

  const inputReno = document.getElementById("correo_reno_NETFLIX");
  if (inputReno && inputReno.value === "") {
    const inputTipo = document.getElementById("tipo_NETFLIX");
    if (inputTipo) {
      inputTipo.value = "Nueva";
      comprobarTipoVentaNetflix(inputTipo, "NETFLIX");
    }
  }
}

// =========================================================================
// 🚀 NUEVA LÓGICA DE VENTAS (MÓDULO DINÁMICO POR BLOQUES BLINDADO)
// =========================================================================

function agregarFilaServicioVenta() {
  if (typeof haptic === "function") haptic();
  const container = document.getElementById("listaServiciosVentaDinamica");
  contadorFilasVenta++;
  const idFila = `fila_vta_${contadorFilasVenta}`;

  // Genera opciones base de la lista global
  let optionsPlat =
    '<option value="" disabled selected>— Elige servicio —</option>';
  optionsPlat += '<option value="SALDO">💼 Recarga de Saldo</option>';

  listaPlataformasVenta.forEach((p) => {
    if (p.id !== "SALDO") {
      optionsPlat += `<option value="${p.id}" data-pantallas="${p.permitePantallas}" data-reno="${p.permiteRenovacion}">${p.nombre}</option>`;
    }
  });

  let mesHeredado = window.ultimoMesesSeleccionado || "1";

  const rowHTML = `
    <div id="${idFila}" class="vta-row-item" style="display: flex; flex-direction: column; gap: 4px; padding-bottom: 8px; border-bottom: 1px dashed rgba(255,255,255,0.06);">
        
        <div style="display: flex; gap: 6px; width: 100%; align-items: center;">
            <select class="input-ios select-plat-vta" style="flex: 2; margin: 0; font-weight: 700; font-size: 0.85rem; padding: 8px 10px !important; height: 38px !important; background: rgba(0,0,0,0.3) !important;" required onchange="alCambiarPlataformaVenta('${idFila}')">
                ${optionsPlat}
            </select>
            
            <div class="wrapper-pantallas" style="flex: 1; display: none;">
                <select class="input-ios select-pant-vta" style="margin: 0; font-size: 0.85rem; padding: 8px 4px !important; height: 38px !important; background: rgba(0,0,0,0.3) !important; text-align: center;">
                    <option value="1">1 Pant.</option>
                    <option value="2">2 Pant.</option>
                    <option value="3">3 Pant.</option>
                    <option value="4">4 Pant.</option>
                    <option value="5">5 Pant.</option>
                </select>
            </div>

            <div class="wrapper-meses" style="flex: 1; display: none;">
                <select class="input-ios select-meses-vta" style="margin: 0; font-size: 0.85rem; padding: 8px 4px !important; height: 38px !important; background: rgba(0,0,0,0.3) !important; text-align: center;" onchange="sincronizarMesesVenta(this, '${idFila}')">
                    <option value="1" ${mesHeredado === "1" ? "selected" : ""}>1 Mes</option>
                    <option value="2" ${mesHeredado === "2" ? "selected" : ""}>2 Meses</option>
                    <option value="3" ${mesHeredado === "3" ? "selected" : ""}>3 Meses</option>
                    <option value="4" ${mesHeredado === "4" ? "selected" : ""}>4 Meses</option>
                    <option value="5" ${mesHeredado === "5" ? "selected" : ""}>5 Meses</option>
                </select>
            </div>
            
            <div class="wrapper-bono" style="flex: 1; display: none;">
                <select class="input-ios select-bono-vta" style="margin: 0; font-size: 0.85rem; padding: 8px 4px !important; height: 38px !important; background: rgba(255,159,10,0.08) !important; color: var(--ios-orange); border-color: rgba(255,159,10,0.3); text-align: center; font-weight:bold;">
                    <option value="0">0% Bono</option>
                    <option value="5">5%</option>
                    <option value="10">10%</option>
                    <option value="15">15%</option>
                    <option value="20">20%</option>
                    <option value="25">25%</option>
                    <option value="30">30%</option>
                </select>
            </div>

            ${
              contadorFilasVenta > 1
                ? `
              <div class="wrapper-delete-vta" style="width: 38px; height: 38px; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
                <button type="button" onclick="document.getElementById('${idFila}').remove(); if(typeof haptic==='function')haptic();" style="width: 38px !important; height: 38px !important; min-width: 38px !important; max-width: 38px !important; min-height: 38px !important; max-height: 38px !important; background: rgba(255, 69, 58, 0.1); border: 1px solid rgba(255, 69, 58, 0.2); color: #ff453a; cursor: pointer; border-radius: 10px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; padding: 0; box-sizing: border-box;" onmouseover="this.style.background='rgba(255, 69, 58, 0.2)'" onmouseout="this.style.background='rgba(255, 69, 58, 0.1)'" title="Eliminar fila">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            `
                : ""
            }
        </div>
        
        <div class="wrapper-reno-tipo" style="display: none; gap: 6px; width: 100%; margin-top: 0px; ${contadorFilasVenta > 1 ? "padding-right: 44px;" : ""}">
            <select class="input-ios select-tipo-vta" style="flex: 1; margin: 0; font-size: 0.8rem; padding: 6px 8px !important; height: 32px !important; background: rgba(0,0,0,0.3) !important;" onchange="alCambiarTipoVenta('${idFila}')">
                <option value="Nueva">Nueva</option>
                <option value="Reno (Historial)" class="opt-historial-net" style="display: none; background: rgba(10, 132, 255, 0.2); font-weight:bold; color:var(--ios-blue);" disabled hidden>Reno (Elegir Cliente)</option>
            </select>
            <input type="text" class="input-ios input-correo-vta" placeholder="Correo de la cuenta a renovar..." style="flex: 2; margin: 0; font-size: 0.8rem; padding: 6px 10px !important; height: 32px !important; display: none; background: rgba(0,0,0,0.3) !important; font-weight: 700; color: var(--ios-blue);" />
        </div>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", rowHTML);

  const optHistorial = document.querySelector(`#${idFila} .opt-historial-net`);
  if (
    window.cuentasNetflixClienteActivo &&
    window.cuentasNetflixClienteActivo.length > 0
  ) {
    optHistorial.disabled = false;
    optHistorial.removeAttribute("hidden");
    optHistorial.style.display = "";
  }
}

// =========================================================================
// 🚀 EVENTO AUTOMÁTICO: GMAIL AL SELECCIONAR MÉTODO DE PAGO
// =========================================================================
function ajustarInterfazPorMetodoPagoV2() {
  const selectBanco = document.getElementById("ventaBanco");
  if (!selectBanco) return;

  const bancoElegido = selectBanco.value;
  const statusEl = document.getElementById("statusBrebVerif");

  // 🔥 SOLO si seleccionas Bre-B dispara la búsqueda en Gmail
  if (bancoElegido === "Bre-B") {
    if (statusEl) {
      statusEl.style.display = "flex";
      statusEl.style.color = "var(--ios-orange)";
      statusEl.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> <span style="text-align:left; line-height:1.2;">Sincronizando pagos de Gmail...</span>`;
    }

    const cbBreb = "cb_breb_manual_" + Date.now();
    window[cbBreb] = function (res) {
      const node = document.getElementById("node_" + cbBreb);
      if (node) node.remove();
      delete window[cbBreb];

      if (res && res.status === "success" && res.data.length > 0) {
        window.gmailDataTemp = res.data; // Guardamos en memoria
        if (window.imagenComprobanteActual) {
          window.verificarMatchGmail(); // Si ya había imagen, cruzamos de una vez
        } else if (statusEl) {
          statusEl.style.color = "var(--ios-green)";
          statusEl.innerHTML = `✅ <span style="text-align:left; line-height:1.3;">Pagos sincronizados. Esperando monto/foto para verificar.</span>`;
        }
      } else {
        if (statusEl) {
          statusEl.style.color = "var(--ios-red)";
          statusEl.innerHTML = `❌ <span style="text-align:left; line-height:1.3;">No hay pagos recientes en Gmail</span>`;
        }
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbBreb;
    script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerPagosBreB&fechaBusqueda=&callback=${cbBreb}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  } else {
    // Si elige cualquier otra opción (ej. Nequi), re-evalúa con la lógica normal
    if (window.imagenComprobanteActual) window.verificarMatchGmail();
  }
}

function alCambiarPlataformaVenta(idFila) {
  const fila = document.getElementById(idFila);
  const selectPlat = fila.querySelector(".select-plat-vta");
  const platKey = selectPlat.value;
  const opt = selectPlat.options[selectPlat.selectedIndex];

  const wPant = fila.querySelector(".wrapper-pantallas");
  const wMes = fila.querySelector(".wrapper-meses");
  const wBono = fila.querySelector(".wrapper-bono");
  const wReno = fila.querySelector(".wrapper-reno-tipo");
  const selectTipo = fila.querySelector(".select-tipo-vta");

  wPant.style.display = "none";
  wMes.style.display = "none";
  wBono.style.display = "none";
  wReno.style.display = "none";

  if (platKey === "SALDO") {
    wBono.style.display = "block";
  } else {
    if (opt.getAttribute("data-pantallas") === "true")
      wPant.style.display = "block";
    wMes.style.display = "block";

    if (opt.getAttribute("data-reno") === "true") {
      wReno.style.display = "flex";

      if (
        platKey === "NETFLIX" &&
        window.cuentasNetflixClienteActivo &&
        window.cuentasNetflixClienteActivo.length > 0
      ) {
        selectTipo.innerHTML =
          '<option value="Nueva">Nueva</option><option value="Reno (Historial)">Renovar</option>';
        // Lo pasamos a Renovar automáticamente para ahorrarte un clic
        selectTipo.value = "Reno (Historial)";
      } else {
        selectTipo.innerHTML = '<option value="Nueva">Nueva</option>';
      }
    }
  }
  alCambiarTipoVenta(idFila);
}

function alCambiarTipoVenta(idFila) {
  const fila = document.getElementById(idFila);
  const selectTipo = fila.querySelector(".select-tipo-vta");
  const inputCorreo = fila.querySelector(".input-correo-vta");
  const platKey = fila.querySelector(".select-plat-vta").value;

  if (selectTipo.value === "Reno (Historial)") {
    // Renovación Mágica desde el Historial
    inputCorreo.style.display = "block";
    inputCorreo.required = true;
    inputCorreo.readOnly = true;
    inputCorreo.placeholder = "👉 Toca aquí para elegir cuenta";
    inputCorreo.style.cursor = "pointer";

    inputCorreo.onclick = function () {
      if (
        platKey === "NETFLIX" &&
        typeof abrirModalRenovacionNet === "function"
      ) {
        window.targetInputRenoDinamico = inputCorreo;
        abrirModalRenovacionNet();
      }
    };

    // 🔥 ELIMINAMOS EL AUTO-LANZAMIENTO DE LA VENTANA 🔥
    // Ahora el usuario tiene el control de cuándo tocar la caja azul para abrirla.
  } else {
    // Venta Nueva
    inputCorreo.style.display = "none";
    inputCorreo.required = false;
    inputCorreo.value = "";
  }
}

function buscarHistorialNetflixEnVenta(telefono) {
  let telLimpio = telefono.replace(/\D/g, "");

  // Si se borra el número, limpiamos todo y devolvemos a "Nueva"
  if (telLimpio.length < 8) {
    window.cuentasNetflixClienteActivo = [];
    document.querySelectorAll(".vta-row-item").forEach((fila) => {
      const selectTipo = fila.querySelector(".select-tipo-vta");
      if (selectTipo) {
        selectTipo.innerHTML = '<option value="Nueva">Nueva</option>';
        alCambiarTipoVenta(fila.id);
      }
    });
    return;
  }

  clearTimeout(window.timeoutBusquedaNet);
  window.timeoutBusquedaNet = setTimeout(() => {
    const cbName = "cb_net_search_" + Date.now();
    window[cbName] = function (res) {
      const scriptNode = document.getElementById("node_" + cbName);
      if (scriptNode) scriptNode.remove();
      delete window[cbName];

      window.cuentasNetflixClienteActivo = [];

      if (res && res.status === "success" && res.data.length > 0) {
        window.cuentasNetflixClienteActivo = res.data;

        if (typeof triggerToast === "function")
          triggerToast(
            "✨ ¡Historial de Netflix encontrado para este cliente!",
          );

        document.querySelectorAll(".vta-row-item").forEach((fila) => {
          const platKey = fila.querySelector(".select-plat-vta").value;
          const selectTipo = fila.querySelector(".select-tipo-vta");

          // Si tiene Netflix puesto, le activamos la opción de Renovar
          if (platKey === "NETFLIX") {
            selectTipo.innerHTML =
              '<option value="Nueva">Nueva</option><option value="Reno (Historial)">Renovar</option>';
            selectTipo.value = "Reno (Historial)";
            alCambiarTipoVenta(fila.id);
          }
        });
      } else {
        document.querySelectorAll(".vta-row-item").forEach((fila) => {
          const selectTipo = fila.querySelector(".select-tipo-vta");
          if (selectTipo) {
            selectTipo.innerHTML = '<option value="Nueva">Nueva</option>';
            alCambiarTipoVenta(fila.id);
          }
        });
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbName;
    script.src = `${GOOGLE_SCRIPT_URL}?action=buscarRenovacionNetflix&tel=${encodeURIComponent(telLimpio)}&callback=${cbName}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  }, 800);
}

// 🔥 CORRECCIÓN: Esta función ahora escribe en el input dinámico correcto
function seleccionarCuentaModalNet(correo, perfil, cliente) {
  if (typeof haptic === "function") haptic();

  // 1. Inyecta el texto exacto en la caja que disparó la ventana
  if (window.targetInputRenoDinamico) {
    window.targetInputRenoDinamico.value = correo + " | Perfil: " + perfil;
  }

  // 2. Autocompleta el nombre del cliente si está vacío
  const inputNombre = document.getElementById("ventaNombre");
  if (inputNombre && inputNombre.value.trim() === "" && cliente !== "N/A") {
    inputNombre.value = cliente;
  }

  // 3. Cierra la ventana
  document.getElementById("modalRenovacionFlotante").classList.remove("open");
}

function filtrarModalRenovacionNet() {
  const query = document
    .getElementById("buscadorModalReno")
    .value.toLowerCase()
    .trim();
  const items = document.querySelectorAll(".item-reno-modal");

  items.forEach((item) => {
    const searchData = item.getAttribute("data-search");
    if (searchData.includes(query)) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
}

function formatearMontoEnVivoCOP(input) {
  let valor = input.value.replace(/\D/g, "");

  if (valor === "") {
    input.value = "";
    return;
  }

  valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  input.value = "$" + valor;
}

window.textoSaldoRevendedorGlobal = "";

function copiarTextoSaldoRevendedorDefinitiva() {
  haptic();
  const btn = document.getElementById("btnCopiarSaldoRevendedor");
  navigator.clipboard
    .writeText(window.textoSaldoRevendedorGlobal)
    .then(function () {
      const originalText = btn.innerHTML;
      btn.innerHTML = "¡SALDO COPIADO CON ÉXITO!";
      btn.style.background = "var(--ios-green)";

      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Saldo copiado</span></div>`,
      );

      setTimeout(function () {
        btn.innerHTML = originalText;
        btn.style.background =
          "linear-gradient(135deg, #ff9500 0%, #ff5e00 100%)";
      }, 1500);
    });
}

function copiarTextoFichaVentaDefinitiva() {
  haptic();
  const texto = document.getElementById("outputTextoVentaFicha").value;
  const btn = document.getElementById("btnCopiarFichaVenta");

  navigator.clipboard
    .writeText(texto)
    .then(function () {
      const originalText = btn.innerHTML;
      btn.innerHTML = "¡FICHA COPIADA!";
      btn.style.background = "var(--ios-green)";

      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Ficha enviada al portapapeles</span></div>`,
      );

      setTimeout(function () {
        btn.innerHTML = originalText;
        btn.style.background = "";
      }, 1500);
    })
    .catch(function () {
      const textarea = document.createElement("textarea");
      textarea.value = texto;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();

      const originalText = btn.innerHTML;
      btn.innerHTML = "¡FICHA COPIADA!";
      btn.style.background = "var(--ios-green)";

      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Ficha enviada al portapapeles</span></div>`,
      );

      setTimeout(function () {
        btn.innerHTML = originalText;
        btn.style.background = "";
      }, 1500);
    });
}

function cerrarModalVentaGenerada() {
  haptic();
  document.getElementById("ventaGeneradaModalOverlay").classList.remove("open");
}

// 🔄 FUNCIÓN PRINCIPAL DE GARANTÍAS (ACTUALIZA EL DOCK Y EL BANNER MAC)
function actualizarBadgeGarantias() {
  const oldScript = document.getElementById("cyber_badge_garantias_node");
  if (oldScript) oldScript.remove();

  window.procesarBadgeGarantias = function (res) {
    const scriptNode = document.getElementById("cyber_badge_garantias_node");
    if (scriptNode) scriptNode.remove();

    let badge = document.getElementById("badgeGarantiasCount");

    if (res && res.status === "success") {
      const data = res.data || [];
      const count = data.length;

      // 1. Actualiza la burbuja del Dock
      if (badge) {
        if (count > 0) {
          badge.innerText = count;
          badge.style.display = "flex";
        } else {
          badge.style.display = "none";
        }
      }

      // 2. Dispara el Banner Mac flotante con el desglose por plataforma
      mostrarAlertaGarantiasMac(data);
    }
    delete window.procesarBadgeGarantias;
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_badge_garantias_node";
  scriptElement.src =
    GOOGLE_SCRIPT_URL +
    "?action=obtenerGarantias&callback=procesarBadgeGarantias&_ts=" +
    Date.now();
  document.body.appendChild(scriptElement);
}

// 🛡️ MOTOR DEL BANNER FLOTANTE DE GARANTÍAS EN PANTALLA
function mostrarAlertaGarantiasMac(listaGarantias) {
  const banner = document.getElementById("macGarantiasBanner");
  const textoEl = document.getElementById("macGarantiasNotifText");

  if (!banner || !textoEl) return;

  // Si no hay garantías pendientes, oculta la alerta y colapsa el espacio
  if (!listaGarantias || listaGarantias.length === 0) {
    banner.style.transform = "translateX(120%)";
    banner.style.opacity = "0";
    setTimeout(() => {
      banner.style.display = "none";
    }, 400); // 👈 Quita el hueco
    return;
  }

  // 👈 Despierta el banner antes de animarlo
  banner.style.display = "flex";

  // Contar y agrupar cuántas garantías tiene cada plataforma
  let conteoPorPlat = {};
  listaGarantias.forEach((item) => {
    let plat = (item.plataforma || "OTRA")
      .toUpperCase()
      .replace(/-/g, " ")
      .trim();
    conteoPorPlat[plat] = (conteoPorPlat[plat] || 0) + 1;
  });

  // Construir texto formateado: ej "AMAZON (2), DISNEY PREMIUM (1), HBO MAX (3)"
  let resumen = Object.keys(conteoPorPlat)
    .map((p) => `<strong>${p} (${conteoPorPlat[p]})</strong>`)
    .join(", ");

  textoEl.innerHTML = resumen;

  // 👈 Pequeño retraso para asegurar que la transición CSS funcione al cambiar de 'display: none' a 'flex'
  setTimeout(() => {
    banner.style.transform = "translateX(0)";
    banner.style.opacity = "1";
  }, 10);
}

// ✕ FUNCIÓN PARA CERRAR EL BANNER DE INVENTARIO MANUALMENTE
window.cerrarBannerNotificacionManualmente = function () {
  const banner = document.getElementById("macNotificationBanner");
  if (banner) {
    // 1. Animación de salida hacia la derecha
    banner.style.transform = "translateX(120%)";
    banner.style.opacity = "0";
    clearInterval(window.timerElapsedNotif);

    // 2. Colapsamos el espacio para que el banner de abajo suba suavemente
    setTimeout(() => {
      banner.style.margin = "0";
      banner.style.padding = "0";
      banner.style.height = "0";
      banner.style.border = "none";
      banner.style.overflow = "hidden";
    }, 300);

    // 3. Lo apagamos del todo y restauramos sus estilos base para la próxima vez que se active
    setTimeout(() => {
      banner.style.display = "none";
      banner.style.margin = "";
      banner.style.padding = "14px 16px";
      banner.style.height = "";
      banner.style.border = "1px solid rgba(255, 255, 255, 0.1)";
      banner.style.overflow = "";
    }, 600);
  }
};

// ✕ FUNCIÓN PARA CERRAR EL BANNER DE GARANTÍAS MANUALMENTE
window.cerrarBannerGarantiasManualmente = function () {
  const banner = document.getElementById("macGarantiasBanner");
  if (banner) {
    // 1. Animación de salida hacia la derecha
    banner.style.transform = "translateX(120%)";
    banner.style.opacity = "0";

    // 2. Colapsamos el espacio suavemente
    setTimeout(() => {
      banner.style.margin = "0";
      banner.style.padding = "0";
      banner.style.height = "0";
      banner.style.border = "none";
      banner.style.overflow = "hidden";
    }, 300);

    // 3. Apagado total
    setTimeout(() => {
      banner.style.display = "none";
      banner.style.margin = "";
      banner.style.padding = "14px 16px";
      banner.style.height = "";
      banner.style.border = "1px solid rgba(255, 159, 10, 0.3)";
      banner.style.overflow = "";
    }, 600);
  }
};

function toggleTheme() {
  haptic();
  const currentTheme = document.documentElement.getAttribute("data-theme");
  let newTheme = "";

  if (currentTheme === "light") {
    newTheme = "dark";
  } else {
    newTheme = "light";
  }

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("cyber_theme", newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  // Mantenido por si decides agregar el botón de tema luego
}

function toggleSearchAccountPanel() {
  haptic();
  const overlay = document.getElementById("searchAccountOverlay");
  overlay.classList.toggle("open");
  if (overlay.classList.contains("open")) {
    document.getElementById("inputSearchAccount").focus();
  }
}

function ejecutarBusquedaCuentas() {
  haptic();
  const query = document.getElementById("inputSearchAccount").value.trim();
  const container = document.getElementById("searchAccountScrollArea");

  if (query === "") {
    container.innerHTML =
      '<div style="text-align:center; padding:30px; color:var(--text-secondary); font-size:0.9rem;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><br>Por favor ingresa un número celular o nombre para buscar.</div>';
    return;
  }

  container.innerHTML =
    '<div style="text-align:center; padding:30px; color:var(--ios-blue); font-size:0.9rem;"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg><br>Escaneando base de datos de 18 plataformas en vivo...</div>';

  const oldScript = document.getElementById("cyber_search_node");
  if (oldScript) {
    oldScript.remove();
  }

  window.procesarBusquedaCuentasSheets = function (res) {
    const scriptNode = document.getElementById("cyber_search_node");
    if (scriptNode) scriptNode.remove();

    const container = document.getElementById("searchAccountScrollArea");

    if (res && res.status === "success") {
      window.currentSearchStock = res.data;
      const data = res.data;

      if (data.length === 0) {
        const query = document
          .getElementById("inputSearchAccount")
          .value.trim();
        container.innerHTML =
          '<div style="text-align:center; padding:30px; color:var(--text-secondary); font-weight:600; line-height:1.4;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg><br>No se encontraron cuentas activas asociadas a "' +
          query +
          '".</div>';
        return;
      }

      let htmlCards = "";
      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        htmlCards += `
                            <div class="card-ios mb-1" style="padding: 15px; gap: 8px;">
                                <div class="flex-row-between" style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
                                    <span style="color:var(--ios-blue); font-weight:700; font-size:0.9rem; text-transform: uppercase;">${item.plataforma}</span>
                                    
                                    <span style="color:var(--text-secondary); font-size:0.8rem; display:flex; align-items:center; gap:6px;">
                                        Vence: <b style="color:var(--text-primary);">${item.vencimiento}</b>
                                        <button type="button" style="background:rgba(10,132,255,0.15); color:var(--ios-blue); border:none; border-radius:6px; padding:2px 8px; font-size:0.8rem; cursor:pointer;" onclick="window.abrirModalEditarVencimiento('${item.plataforma}', '${item.correo}', '${item.vencimiento}')">✎</button>
                                    </span>
                                </div>
                                <div style="font-size:0.85rem; color:var(--text-secondary);">Cliente: <span style="color:var(--text-primary); font-weight:600;">${item.cliente}</span></div>
                                <div style="font-size:0.85rem; color:var(--text-secondary);">Teléfono: <span style="color:var(--text-primary); font-weight:600;">${item.telefono}</span></div>
                                
                                <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:6px;">Correo: <span style="color:var(--ios-green); font-weight:700; user-select:all; cursor:pointer;" title="Clic para copiar solo el correo" onclick="copiarDatoAislado(this, '${item.correo}')">${item.correo}</span></div>
                                
                                <div style="font-size:0.85rem; color:var(--text-secondary);">Clave: <span style="color:var(--ios-red); font-weight:700; user-select:all; cursor:pointer;" title="Clic para copiar solo la clave" onclick="copiarDatoAislado(this, '${item.clave}')">${item.clave}</span></div>
                                
                                <div style="font-size:0.85rem; color:var(--text-secondary);">Perfil: <span style="color:var(--text-primary); font-weight:700;">${item.perfil}</span> | PIN: <span style="color:var(--text-primary); font-weight:700;">${item.pin}</span></div>
                                
                                <button class="btn-ios btn-secondary mt-1 w-100" style="display:flex; align-items:center; justify-content:center; gap:6px;" onclick="copiarCuentaCompleta(this, ${i})">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                  COPIAR DATOS
                                </button>
                            </div>
                          `;
      }
      container.innerHTML = htmlCards;
    } else {
      let errMsg = "Error al buscar cuentas en el sistema.";
      if (res && res.message) errMsg = res.message;
      container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--ios-red); font-weight:600; line-height:1.4;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg><br>${errMsg}</div>`;
    }
  };

  // 🔥 FUNCIONES LÓGICAS GLOBALES DEL LÁPIZ 🔥
  window.abrirModalEditarVencimiento = function (plat, correo, vencActual) {
    haptic();
    var modal = document.getElementById("editVencOverlay");
    if (!modal) {
      alert("⚠️ Error: No se encontró la ventana del Lápiz. Revisa el Paso 1.");
      return;
    }
    document.getElementById("editVencPlataforma").value = plat;
    document.getElementById("editVencCorreo").value = correo;
    document.getElementById("editVencDisplay").value = plat + " ➔ " + correo;
    document.getElementById("editVencNuevo").value = vencActual;
    modal.classList.add("open");
    document.getElementById("editVencNuevo").focus();
  };

  window.ejecutarEdicionVencimiento = function (e) {
    e.preventDefault();
    haptic();
    const btn = document.getElementById("btnSubmitEditVenc");
    const plat = document.getElementById("editVencPlataforma").value;
    const correo = document.getElementById("editVencCorreo").value;
    const nuevoVenc = document.getElementById("editVencNuevo").value.trim();

    btn.disabled = true;
    btn.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Actualizando...`;

    const cbName = "cb_edit_venc_" + Date.now();
    window[cbName] = function (res) {
      btn.disabled = false;
      btn.innerHTML = "Guardar Corrección";
      const node = document.getElementById("node_" + cbName);
      if (node) node.remove();
      delete window[cbName];

      if (res && res.status === "success") {
        document.getElementById("editVencOverlay").classList.remove("open");

        const d = res.data;
        let perfilTexto = d.perfil ? `\n🌐 *Perfil:* ${d.perfil}` : "";
        let pinTexto = d.pin ? `\n📍 *Pin:* ${d.pin}` : "";

        // 🔥 FICHA ELEGANTE 🔥
        let ficha = `🌟 *¡Hola! El tiempo de tu cuenta ha sido actualizado.*\n\n🎬 *DETALLES DE ${d.plataforma}* ✅\n────────────────────\n👤 *Correo:* ${d.correo}\n🔐 *Contraseña:* ${d.clave}${perfilTexto}${pinTexto}\n📅 *Nuevo Vencimiento:* ${d.vencimiento}\n────────────────────\n✨ _¡Disfruta tu servicio!_`;

        let btnSaldo = document.getElementById("btnCopiarSaldoRevendedor");
        if (btnSaldo) btnSaldo.style.display = "none";

        document.getElementById("outputTextoVentaFicha").value = ficha;
        const modalExito = document.getElementById("ventaGeneradaModalOverlay");
        modalExito.querySelector(".card-title").innerText =
          "Tiempo Actualizado";
        document.getElementById("btnCopiarFichaVenta").innerHTML =
          `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar Ficha de Actualización`;

        modalExito.classList.add("open");
        ejecutarBusquedaCuentas();
      } else {
        alert("❌ Error: " + (res ? res.message : "Fallo de conexión"));
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbName;
    script.src = `${GOOGLE_SCRIPT_URL}?action=editarVencimiento&plataforma=${encodeURIComponent(plat)}&correo=${encodeURIComponent(correo)}&nuevoVencimiento=${encodeURIComponent(nuevoVenc)}&callback=${cbName}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  };

  // Funciones Lógicas del Lápiz
  function abrirModalEditarVencimiento(plat, correo, vencActual) {
    haptic();
    document.getElementById("editVencPlataforma").value = plat;
    document.getElementById("editVencCorreo").value = correo;
    document.getElementById("editVencDisplay").value = plat + " ➔ " + correo;
    document.getElementById("editVencNuevo").value = vencActual;
    document.getElementById("editVencOverlay").classList.add("open");
    document.getElementById("editVencNuevo").focus();
  }

  function ejecutarEdicionVencimiento(e) {
    e.preventDefault();
    haptic();
    const btn = document.getElementById("btnSubmitEditVenc");
    const plat = document.getElementById("editVencPlataforma").value;
    const correo = document.getElementById("editVencCorreo").value;
    const nuevoVenc = document.getElementById("editVencNuevo").value.trim();

    btn.disabled = true;
    btn.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Actualizando...`;

    const cbName = "cb_edit_venc_" + Date.now();
    window[cbName] = function (res) {
      btn.disabled = false;
      btn.innerHTML = "Guardar Corrección";
      const node = document.getElementById("node_" + cbName);
      if (node) node.remove();
      delete window[cbName];

      if (res && res.status === "success") {
        document.getElementById("editVencOverlay").classList.remove("open");

        const d = res.data;
        let perfilTexto = d.perfil ? `\n🌐 *Perfil:* ${d.perfil}` : "";
        let pinTexto = d.pin ? `\n📍 *Pin:* ${d.pin}` : "";

        // 🔥 SE ARMA LA FICHA ELEGANTE ESTILO VENTA 🔥
        let ficha = `🌟 *¡Hola! El tiempo de tu cuenta ha sido actualizado.*\n\n🎬 *DETALLES DE ${d.plataforma}* ✅\n────────────────────\n👤 *Correo:* ${d.correo}\n🔐 *Contraseña:* ${d.clave}${perfilTexto}${pinTexto}\n📅 *Nuevo Vencimiento:* ${d.vencimiento}\n────────────────────\n✨ _¡Disfruta tu servicio!_`;

        // Se oculta el botón de saldo porque esto es una edición, no una venta nueva
        let btnSaldo = document.getElementById("btnCopiarSaldoRevendedor");
        if (btnSaldo) btnSaldo.style.display = "none";

        // Lanzamos la ventana de Ficha
        document.getElementById("outputTextoVentaFicha").value = ficha;
        const modalExito = document.getElementById("ventaGeneradaModalOverlay");
        modalExito.querySelector(".card-title").innerText =
          "Tiempo Actualizado";
        document.getElementById("btnCopiarFichaVenta").innerHTML =
          `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar Ficha de Actualización`;

        modalExito.classList.add("open");
        ejecutarBusquedaCuentas(); // Refresca la tabla de atrás para que veas el mes nuevo
      } else {
        alert("❌ Error: " + (res ? res.message : "Fallo de conexión"));
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbName;
    script.src = `${GOOGLE_SCRIPT_URL}?action=editarVencimiento&plataforma=${encodeURIComponent(plat)}&correo=${encodeURIComponent(correo)}&nuevoVencimiento=${encodeURIComponent(nuevoVenc)}&callback=${cbName}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  }

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_search_node";
  let queryParams =
    "?action=buscarCuentaGlobal&query=" +
    encodeURIComponent(query) +
    "&callback=procesarBusquedaCuentasSheets&_ts=" +
    Date.now();
  scriptElement.src = GOOGLE_SCRIPT_URL + queryParams;
  document.body.appendChild(scriptElement);
}

function copiarDatoAislado(elemento, texto) {
  haptic();
  navigator.clipboard
    .writeText(texto)
    .then(function () {
      let originalText = elemento.innerText;
      elemento.innerText = "¡COPIADO!";
      elemento.style.opacity = "0.7";
      setTimeout(function () {
        elemento.innerText = originalText;
        elemento.style.opacity = "1";
      }, 1000);
    })
    .catch(function () {
      const textarea = document.createElement("textarea");
      textarea.value = texto;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();

      let originalText = elemento.innerText;
      elemento.innerText = "¡COPIADO!";
      elemento.style.opacity = "0.7";
      setTimeout(function () {
        elemento.innerText = originalText;
        elemento.style.opacity = "1";
      }, 1000);
    });
}

function copiarCuentaCompleta(btn, index) {
  haptic();
  let item = window.currentSearchStock[index];
  if (!item) return;

  let textoCompleto = `📺 Plataforma: ${item.plataforma}\n👤 Cliente: ${item.cliente}\n📱 Teléfono: ${item.telefono}\n\n📧 Correo: ${item.correo}\n🔑 Clave: ${item.clave}\n👤 Perfil: ${item.perfil} | 📌 PIN: ${item.pin}\n⌛ Vence: ${item.vencimiento}`;

  navigator.clipboard
    .writeText(textoCompleto)
    .then(function () {
      let originalText = btn.innerHTML;
      btn.innerHTML = "¡COPIADO CON ÉXITO!";
      btn.style.background = "var(--ios-green)";
      btn.style.color = "white";
      btn.style.borderColor = "transparent";

      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Datos copiados</span></div>`,
      );

      setTimeout(function () {
        btn.innerHTML = originalText;
        btn.style.background = "";
        btn.style.color = "";
        btn.style.borderColor = "";
      }, 1500);
    })
    .catch(function () {
      const textarea = document.createElement("textarea");
      textarea.value = textoCompleto;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();

      let originalText = btn.innerHTML;
      btn.innerHTML = "¡COPIADO CON ÉXITO!";
      btn.style.background = "var(--ios-green)";
      btn.style.color = "white";
      btn.style.borderColor = "transparent";

      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Datos copiados</span></div>`,
      );

      setTimeout(function () {
        btn.innerHTML = originalText;
        btn.style.background = "";
        btn.style.color = "";
        btn.style.borderColor = "";
      }, 1500);
    });
}

// =========================================================================
// 👥 GESTOR DE TURNOS: INTERCEPTOR DE SEGURIDAD ESTRICTO PARA CAMILO
// =========================================================================
function toggleShiftsPanel() {
  if (navigator.vibrate) navigator.vibrate(10);
  const overlay = document.getElementById("shiftsOverlay");
  overlay.classList.toggle("open");

  if (overlay.classList.contains("open")) {
    // 🔊 NUEVO: Sonido de apertura
    if (typeof window.CyberSonidos !== "undefined")
      window.CyberSonidos.play("abrir");

    if (document.getElementById("searchShiftsInput")) {
      document.getElementById("searchShiftsInput").value = "";
    }

    // Identificamos con total autoridad quién está operando el sistema
    const userActivo = (sessionStorage.getItem("active_staff") || "")
      .toUpperCase()
      .trim();
    const inpVendedor = document.getElementById("inputVendedorShift");
    const btnAde = document.getElementById("btnAdelantoCamilo");
    const btnNom = document.getElementById("btnNominaCamilo"); // 👈 Captura el botón de Nómina

    if (userActivo === "CAMILO") {
      // 🔓 ACCESO TOTAL: Camilo puede alterar nombres y ve las herramientas financieras
      if (inpVendedor) {
        inpVendedor.disabled = false;
        inpVendedor.value = "";
      }
      if (btnAde)
        btnAde.style.setProperty("display", "inline-flex", "important");
      if (btnNom)
        btnNom.style.setProperty("display", "inline-flex", "important"); // 🔥 Se revela solo para ti
    } else {
      // 🔒 RESTRICCIÓN: Los empleados solo ven sus horas y tienen bloqueados los botones
      if (inpVendedor) {
        inpVendedor.disabled = true;
        inpVendedor.value = userActivo;
      }
      if (btnAde) btnAde.style.setProperty("display", "none", "important");
      if (btnNom) btnNom.style.setProperty("display", "none", "important"); // 🛡️ Ocultado absoluto contra personal
    }

    sincronizarTachadosConNube(() => {
      if (window.currentHorasStock && window.currentHorasStock.length > 0) {
        renderizarHorasEnPantalla("");
        cargarHorasDesdeSheets();
      } else {
        forzarRefrescoDeHoras();
      }
    });
  } else {
    // 🔊 NUEVO: Sonido de cierre
    if (typeof window.CyberSonidos !== "undefined")
      window.CyberSonidos.play("cerrar");
  }
}

// Modificar el disparador para abrir el nuevo modal independiente
// =========================================================================
// ⏰ CONTROLADOR DE APERTURA: POPUP FLOTANTE DE HORAS EXTRAS
// =========================================================================
function toggleFormularioHoras() {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("addHoursOverlay");

  if (overlay) {
    // Si está oculto, lo mostramos con flex con máxima prioridad
    if (overlay.style.display === "none" || overlay.style.display === "") {
      overlay.style.setProperty("display", "flex", "important");
      overlay.classList.add("open");

      // 🛡️ CONTROL DE SEGURIDAD INTERNO PARA EL POPUP
      const userActivo = (sessionStorage.getItem("active_staff") || "")
        .toUpperCase()
        .trim();
      const inpVendedor = document.getElementById("inputVendedorShift");

      if (inpVendedor) {
        if (userActivo === "CAMILO") {
          inpVendedor.disabled = false;
          inpVendedor.value = "";
          inpVendedor.placeholder = "Nombre del vendedor...";
        } else {
          inpVendedor.disabled = true;
          inpVendedor.value = userActivo;
        }
      }

      // Pone el cursor automáticamente en la caja de texto del tiempo
      setTimeout(() => {
        const input = document.getElementById("inputHorasShift");
        if (input) input.focus();
      }, 50);
    } else {
      // Si ya estaba abierto, lo ocultamos limpiamente
      overlay.style.setProperty("display", "none", "important");
      overlay.classList.remove("open");
    }
  }
}

function ejecutarGuardadoHorasManual() {
  haptic();
  const vendedor = document
    .getElementById("inputVendedorShift")
    .value.toUpperCase()
    .trim();
  let horasStr = document.getElementById("inputHorasShift").value.trim();
  const fechaInput = document.getElementById("inputFechaShift").value;

  if (!vendedor || !horasStr || !fechaInput) {
    triggerToast(
      `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-orange);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> <span>Completa todos los campos.</span></div>`,
    );
    return;
  }

  if (!horasStr.includes(":")) {
    horasStr = horasStr + ":00:00";
  } else if (horasStr.split(":").length === 2) {
    horasStr = horasStr + ":00";
  }

  const btn = document.getElementById("btnGuardarShiftManual");
  btn.disabled = true;
  btn.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Guardando...`;

  const partsF = fechaInput.split("-");
  const fechaObj = new Date(partsF[0], partsF[1] - 1, partsF[2], 12, 0, 0);
  const fechaSheets =
    String(fechaObj.getDate()).padStart(2, "0") +
    "/" +
    String(fechaObj.getMonth() + 1).padStart(2, "0") +
    "/" +
    fechaObj.getFullYear() +
    " 12:00 PM";

  let paramObj = {
    action: "notificarCorreo",
    user: vendedor + " (Ingreso Manual)",
    tipo: "cierre",
    tiempoTrabajado: horasStr,
  };

  fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paramObj),
  }).then(function () {
    triggerToast(
      `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Las horas se han ingresado correctamente.</span></div>`,
    );
    btn.disabled = false;
    btn.innerText = "Guardar Horas en Sheets";
    document.getElementById("inputHorasShift").value = "";

    // 🔒 AUTO-CIERRE SEGURO CON APAGADO DE DISPLAY
    const popHoras = document.getElementById("addHoursOverlay");
    if (popHoras) {
      popHoras.style.setProperty("display", "none", "important");
      popHoras.classList.remove("open");
    }

    forzarRefrescoDeHoras();
  });
}

function abrirEdicionHoras(
  vendedor,
  fechaDisplay,
  fechaReal,
  horasActuales,
  filasStr,
) {
  haptic();
  document.getElementById("editShiftFilas").value = filasStr;
  document.getElementById("editShiftVendedor").value = vendedor;
  document.getElementById("editShiftFechaReal").value = fechaReal;

  document.getElementById("editShiftDisplayInfo").value =
    vendedor + " | " + fechaDisplay;
  document.getElementById("editShiftInputHoras").value = horasActuales;

  document.getElementById("editShiftModalOverlay").classList.add("open");
  document.getElementById("editShiftInputHoras").focus();
}

function cerrarEdicionHoras() {
  haptic();
  document.getElementById("editShiftModalOverlay").classList.remove("open");
  document.getElementById("editShiftForm").reset();
}

function ejecutarEdicionHoras(e) {
  e.preventDefault();
  haptic();

  const btnSubmit = document.getElementById("btnSubmitEditShift");
  let filasStr = document.getElementById("editShiftFilas").value;
  let vendedor = document.getElementById("editShiftVendedor").value;
  let fechaReal = document.getElementById("editShiftFechaReal").value;
  let nuevasHoras = document.getElementById("editShiftInputHoras").value.trim();

  if (!nuevasHoras.includes(":")) {
    nuevasHoras = nuevasHoras + ":00:00";
  } else if (nuevasHoras.split(":").length === 2) {
    nuevasHoras = nuevasHoras + ":00";
  }

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Guardando...`;

  const oldScript = document.getElementById("cyber_edit_shift_node");
  if (oldScript) oldScript.remove();

  window.procesarEdicionSheets = function (res) {
    btnSubmit.disabled = false;
    btnSubmit.innerText = "Guardar Nueva Hora";

    const scriptNode = document.getElementById("cyber_edit_shift_node");
    if (scriptNode) scriptNode.remove();

    if (res && res.status === "success") {
      cerrarEdicionHoras();
      forzarRefrescoDeHoras();
    } else {
      let errMsg = "No se pudo editar el turno.";
      if (res && res.message) errMsg = res.message;
      alert("❌ Error: " + errMsg);
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_edit_shift_node";
  let queryParams =
    "?action=editarTurnoGlobal&filas=" +
    encodeURIComponent(filasStr) +
    "&vendedor=" +
    encodeURIComponent(vendedor) +
    "&fecha=" +
    encodeURIComponent(fechaReal) +
    "&nuevasHoras=" +
    encodeURIComponent(nuevasHoras) +
    "&callback=procesarEdicionSheets&_ts=" +
    Date.now();
  scriptElement.src = GOOGLE_SCRIPT_URL + queryParams;
  document.body.appendChild(scriptElement);
}

function forzarRefrescoDeHoras() {
  haptic();
  document.getElementById("shiftsScrollArea").innerHTML =
    '<div style="text-align:center; padding:30px; color:var(--ios-blue); font-size:0.9rem;"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg><br>Sincronizando Base de Horas...</div>';

  // 🔥 MODIFICACIÓN: Actualiza tanto las horas como las tachaduras al refrescar
  sincronizarTachadosConNube(() => {
    cargarHorasDesdeSheets();
  });
}

function cargarHorasDesdeSheets() {
  if (isFetchingHoras) {
    return;
  }
  isFetchingHoras = true;

  const oldScript = document.getElementById("cyber_shifts_node");
  if (oldScript) {
    oldScript.remove();
  }

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_shifts_node";
  scriptElement.src =
    GOOGLE_SCRIPT_URL +
    "?action=obtenerHoras&callback=procesarHorasSheets&_ts=" +
    Date.now();
  document.body.appendChild(scriptElement);
}

window.procesarHorasSheets = function (res) {
  isFetchingHoras = false;

  const oldScript = document.getElementById("cyber_shifts_node");
  if (oldScript) {
    oldScript.remove();
  }

  const container = document.getElementById("shiftsScrollArea");
  const nominaOverlay = document.getElementById("nominaOverlay");

  if (res && res.status === "success") {
    window.currentHorasStock = res.data;

    // Recarga la tabla de turnos si está abierta
    if (document.getElementById("shiftsOverlay").classList.contains("open")) {
      renderizarHorasEnPantalla(
        document.getElementById("searchShiftsInput").value.toLowerCase(),
      );
    }
  } else {
    if (container) {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-secondary); font-weight:600; line-height:1.4;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg><br>No se pudo cargar los turnos.</div>`;
    }
    if (nominaOverlay && nominaOverlay.classList.contains("open")) {
      document.getElementById("nominaContentArea").innerHTML =
        "<div class='empty-log-msg' style='color:var(--ios-red);'>❌ Error de sincronización. Intenta de nuevo.</div>";
    }
  }
};

// =========================================================================
// 🛡️ MÓDULO INTEGRADO: CENTRO DE OPERACIONES DE GARANTÍAS (COMPLETO)
// =========================================================================
let isFetchingGarantias = false;

function toggleGarantiasPanel() {
  haptic();
  const overlay = document.getElementById("garantiasOverlay");
  overlay.classList.toggle("open");

  if (overlay.classList.contains("open")) {
    cargarGarantias();
  }
}

function verificarTipoProblema() {
  const select = document.getElementById("repTipoProblema");
  const textarea = document.getElementById("repDesc");

  if (select.value === "OTRA") {
    textarea.style.setProperty("display", "block", "important");
    textarea.setAttribute("required", "true");
    textarea.focus();
  } else {
    textarea.style.setProperty("display", "none", "important");
    textarea.removeAttribute("required");
    textarea.value = "";
  }
}

function ejecutarReporte(e) {
  e.preventDefault();
  if (typeof haptic === "function") haptic();

  const btnSubmit = document.getElementById("btnSubmitReporte");
  const plataforma = document.getElementById("repPlataforma").value;
  const correo = document.getElementById("repCorreo").value;
  const clave = document.getElementById("repClave").value;
  const tipoProblema = document.getElementById("repTipoProblema").value;
  let descripcion = tipoProblema;

  if (tipoProblema === "OTRA") {
    descripcion = document.getElementById("repDesc").value.trim();
  }

  // Activamos el estado de carga simple
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Enviando...`;

  const oldScript = document.getElementById("cyber_reporte_node");
  if (oldScript) oldScript.remove();

  // Receptor de respuesta rápida de Google Sheets
  window.procesarReporteSheets = function (res) {
    const scriptNode = document.getElementById("cyber_reporte_node");
    if (scriptNode) scriptNode.remove();

    btnSubmit.disabled = false;
    btnSubmit.innerText = "Enviar a Garantía";

    if (res && res.status === "success") {
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path></svg> <span>Reporte enviado con éxito.</span></div>`,
        );
      }
      document.getElementById("formReportar").reset();
      verificarTipoProblema();
      cargarGarantias(); // Refresca tu lista de tickets abajo
      if (typeof actualizarBadgeGarantias === "function")
        actualizarBadgeGarantias();
    } else {
      alert("❌ Error: " + (res ? res.message : "Desconocido"));
    }
  };

  // Inyección limpia mediante JSONP (doGet) SIN PARÁMETRO DE IMAGEN
  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_reporte_node";
  let queryParams = `?action=reportarGarantia&plataforma=${encodeURIComponent(plataforma)}&correo=${encodeURIComponent(correo)}&clave=${encodeURIComponent(clave)}&descripcion=${encodeURIComponent(descripcion)}&callback=procesarReporteSheets&_ts=${Date.now()}`;
  scriptElement.src = GOOGLE_SCRIPT_URL + queryParams;
  document.body.appendChild(scriptElement);
}

function cargarGarantias() {
  if (isFetchingGarantias) return;
  isFetchingGarantias = true;
  const container = document.getElementById("listaGarantias");
  container.innerHTML =
    '<div style="text-align:center; padding:20px; color:var(--text-secondary); font-size:0.85rem;"><svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: middle; margin-right: 6px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg><br>Sincronizando tickets...</div>';

  if (document.getElementById("cyber_getgarantias_node"))
    document.getElementById("cyber_getgarantias_node").remove();

  window.procesarListaGarantiasSheets = function (res) {
    isFetchingGarantias = false;
    if (document.getElementById("cyber_getgarantias_node"))
      document.getElementById("cyber_getgarantias_node").remove();
    if (res && res.status === "success") {
      renderizarListaGarantiasDefinitiva(res.data);
    } else {
      container.innerHTML =
        '<div style="text-align:center; padding:20px; color:var(--ios-red); font-weight:600; font-size:0.85rem;">❌ Error al sincronizar.</div>';
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_getgarantias_node";
  scriptElement.src = `${GOOGLE_SCRIPT_URL}?action=obtenerGarantias&callback=procesarListaGarantiasSheets&_ts=${Date.now()}`;
  document.body.appendChild(scriptElement);
}

function renderizarListaGarantiasDefinitiva(data) {
  const container = document.getElementById("listaGarantias");

  if (!data || data.length === 0) {
    container.innerHTML =
      '<div style="text-align:center; padding:30px; color:var(--ios-green); font-weight:600; font-size:0.9rem;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:10px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><br>¡Excelente! No hay tickets pendientes.</div>';
    return;
  }

  let html = "";
  data.forEach((item, index) => {
    // 🔥 CORRECCIÓN AQUÍ: Se añade la Fecha de Compra al texto que se va al portapapeles
    const textoReporte = `🚨 *REPORTE DE PROBLEMA*\n📺 *Plataforma:* ${item.plataforma}\n📧 *Correo:* ${item.correo}\n🔑 *Clave:* ${item.clave}\n👤 *Proveedor:* ${item.proveedor}\n📅 *Fecha Compra:* ${item.fechaCompra || "No Registrada"}\n💬 *Motivo:* ${item.desc}`;
    const safeReporte = encodeURIComponent(textoReporte);

    let imagenHtml = "";
    let btnCopiarFoto = "";

    // 📸 DETECTOR INTELIGENTE DE EVIDENCIAS DRIVE V2
    if (item.imagen && String(item.imagen).trim().length > 10) {
      let imgId = `img_garantia_${index}`;
      let srcLimpio = String(item.imagen).trim();
      let urlOriginalParaAbrir = srcLimpio;

      if (srcLimpio.includes("drive.google.com")) {
        let idMatch =
          srcLimpio.match(/file\/d\/([a-zA-Z0-9_-]+)/) ||
          srcLimpio.match(/id=([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
          let fileId = idMatch[1];
          srcLimpio = `https://drive.google.com/thumbnail?sz=w400&id=${fileId}`;
        }
      } else if (
        !srcLimpio.includes("data:image") &&
        !srcLimpio.includes("http")
      ) {
        srcLimpio = `data:image/jpeg;base64,${srcLimpio}`;
      }

      imagenHtml = `
          <div style="margin-top: 8px; text-align: center; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 8px; border: 1px solid var(--glass-border);">
              <span style="display:block; font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 4px; text-transform: uppercase;">Evidencia Adjunta (Clic para ampliar)</span>
              <a href="${urlOriginalParaAbrir}" target="_blank" style="text-decoration: none; display: inline-block; max-width: 100%;">
                  <img id="${imgId}" src="${srcLimpio}" data-original="${urlOriginalParaAbrir}" style="max-height: 130px; max-width: 100%; border-radius: 6px; box-shadow: var(--glass-shadow); object-fit: contain; cursor: pointer;" title="Clic para abrir en alta resolución">
              </a>
          </div>
        `;

      btnCopiarFoto = `
          <button class="btn-ios btn-secondary" style="flex: 1; padding: 8px; font-size: 0.75rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 4px;" onclick="copiarImagenPortapapeles('${imgId}', this)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg> Foto
          </button>
        `;
    }

    html += `
          <div class="card-ios" style="padding: 16px; display: flex; flex-direction: column; gap: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border);">
              
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                      <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--ios-red);"></div>
                      <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.5px;">${item.plataforma}</span>
                  </div>
                  <div style="font-size: 0.65rem; color: var(--text-secondary); text-align: right; text-transform: uppercase; font-weight: 600;">
                      Reporte: ${item.fecha}
                  </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: var(--input-bg); padding: 12px; border-radius: 8px; border: 1px solid var(--glass-border);">
                  <div style="display: flex; flex-direction: column; gap: 2px;">
                      <span style="font-size: 0.65rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Correo</span>
                      <span style="font-size: 0.85rem; color: var(--text-primary); font-weight: 600; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.correo}">${item.correo}</span>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 2px; border-left: 1px solid var(--glass-border); padding-left: 10px;">
                      <span style="font-size: 0.65rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Clave</span>
                      <span style="font-size: 0.85rem; color: var(--text-primary); font-weight: 600; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.clave}">${item.clave}</span>
                  </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 4px; padding: 0 2px;">
                  <div style="font-size: 0.75rem; color: var(--text-secondary); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px;">
                      <span>Proveedor: <b style="color: var(--ios-orange);">${item.proveedor || "Desconocido"}</b></span>
                      <span>Compra: <b style="color: var(--text-primary);">${item.fechaCompra || "No Registrada"}</b></span>
                  </div>
                  <div style="font-size: 0.8rem; color: var(--text-primary); background: rgba(255,255,255,0.03); padding: 8px 10px; border-radius: 8px; border: 1px dashed var(--glass-border); margin-top: 4px;">
                      <span style="color: var(--text-secondary); font-size: 0.7rem; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 2px;">Falla reportada</span>
                      ${item.desc}
                  </div>
              </div>
              
              ${imagenHtml}

              <div style="display: flex; gap: 6px; margin-top: 4px; flex-wrap: wrap;">
                  <button class="btn-ios btn-secondary" style="flex: 1; min-width: 70px; padding: 8px; font-size: 0.75rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 4px;" onclick="copiarTextoRapido(this, decodeURIComponent('${safeReporte}'))">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Texto
                  </button>
                  ${btnCopiarFoto}
                  <button class="btn-ios" style="flex: 1; min-width: 70px; padding: 8px; font-size: 0.75rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 4px; background: rgba(245, 158, 11, 0.1); color: var(--ios-orange); border: 1px solid rgba(245, 158, 11, 0.2); font-weight: 600;" onclick="solicitarCuentaTemporal(this, '${item.plataforma}', '${item.correo}')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Temp
                  </button>
                  <button class="btn-ios" style="flex: 1; min-width: 80px; padding: 8px; font-size: 0.75rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 4px; background: rgba(255, 69, 58, 0.15); color: var(--ios-red); border: 1px solid rgba(255, 69, 58, 0.3); font-weight: 700;" onclick="ejecutarDescartarGarantia(this, '${item.filaIndex}', '${item.plataforma}', '${item.correo}')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Descartar
                  </button>
                  <button class="btn-ios btn-success" style="flex: 1; min-width: 80px; padding: 8px; font-size: 0.75rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 4px;" onclick="abrirModalResolverGarantia('${item.filaIndex}', '${item.correo}', '${item.plataforma}')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Resolver
                  </button>
              </div>
          </div>`;
  });
  container.innerHTML = html;
}

// Función auxiliar estética para pintar el éxito estilo iOS
function mostrarExitoCopiadoDefinitivo(btn, originalHtml) {
  btn.innerHTML = "¡Copiada!";
  btn.style.background = "var(--ios-green)";
  btn.style.color = "white";
  btn.style.borderColor = "transparent";

  if (typeof triggerToast === "function") {
    triggerToast(
      `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>¡Foto copiada! Ya puedes pegarla en WhatsApp (Ctrl + V)</span></div>`,
    );
  }

  setTimeout(() => {
    btn.innerHTML = originalHtml;
    btn.style.background = "";
    btn.style.color = "";
    btn.style.borderColor = "";
    btn.disabled = false;
  }, 1500);
}

function restaurarBotonError(btn, originalHtml) {
  btn.innerHTML = "Error ✕";
  btn.style.background = "var(--ios-red)";
  btn.style.color = "white";
  setTimeout(() => {
    btn.innerHTML = originalHtml;
    btn.style.background = "";
    btn.style.color = "";
    btn.disabled = false;
  }, 1500);
}

// Función auxiliar para pintar el éxito visual del botón
function finalizarCopiadoExitoso(btn, originalHtml) {
  btn.innerHTML = "¡Copiada!";
  btn.style.background = "var(--ios-green)";
  btn.style.color = "white";
  btn.style.borderColor = "transparent";

  if (typeof triggerToast === "function") {
    triggerToast(
      `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>¡Foto copiada! Presiona Ctrl + V en WhatsApp</span></div>`,
    );
  }

  setTimeout(() => {
    btn.innerHTML = originalHtml;
    btn.style.background = "";
    btn.style.color = "";
    btn.style.borderColor = "";
    btn.disabled = false;
  }, 1500);
}

// =========================================================================
// 🚑 FUNCIÓN PARA SOLICITAR CUENTA TEMPORAL DESDE GARANTÍAS
// =========================================================================
window.solicitarCuentaTemporal = function (btn, plataforma, correoDanado) {
  if (typeof haptic === "function") haptic();

  // Cambiamos el estado del botón
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Buscando...`;

  const cbName = "cb_temp_" + Date.now();

  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    btn.disabled = false;

    if (res && res.status === "success") {
      let cta = res.data;
      let perfilTxt =
        cta.perfil && cta.perfil !== "N/A" && cta.perfil !== ""
          ? `\n👤 *Perfil:* ${cta.perfil}`
          : "";
      let pinTxt =
        cta.pin && cta.pin !== "N/A" && cta.pin !== ""
          ? `\n📍 *PIN:* ${cta.pin}`
          : "";

      // Ficha de cortesía para el cliente
      let mensajeTemporal = `🌟 *¡Hola! Lamentamos los inconvenientes con tu servicio.*\n\nMientras nuestro equipo técnico repara tu cuenta principal, te hemos habilitado un *acceso temporal* para que no pares de disfrutar tu programación favorita 🍿🎬:\n\n📺 *${plataforma} (TEMPORAL)*\n────────────────────\n📧 *Correo:* ${cta.correo}\n🔐 *Clave:* ${cta.clave}${perfilTxt}${pinTxt}\n────────────────────\n_Te avisaremos por este medio apenas tu cuenta original esté solucionada. ¡Gracias por tu paciencia!_ ✨`;

      // Copiar al portapapeles
      navigator.clipboard.writeText(mensajeTemporal).then(() => {
        btn.innerHTML = `✅ ¡Entregada!`;
        btn.style.background = "var(--ios-green)";
        btn.style.color = "white";
        btn.style.borderColor = "transparent";

        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Cuenta temporal copiada al portapapeles</span></div>`,
          );
        }

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = "rgba(255, 149, 0, 0.15)";
          btn.style.color = "var(--ios-orange)";
          btn.style.borderColor = "rgba(255, 149, 0, 0.3)";
        }, 2000);
      });
    } else {
      btn.innerHTML = originalText;
      let errMsg = res && res.message ? res.message : "Error de conexión.";
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-red);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg><span>${errMsg}</span></div>`,
        );
      } else {
        alert("❌ " + errMsg);
      }
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "node_" + cbName;
  scriptElement.src = `${GOOGLE_SCRIPT_URL}?action=obtenerCuentaTemporal&plataforma=${encodeURIComponent(plataforma)}&correoDanado=${encodeURIComponent(correoDanado)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(scriptElement);
};

function abrirModalResolverGarantia(fila, correo, plataforma) {
  haptic();
  document.getElementById("resolverFila").value = fila;
  document.getElementById("resolverCorreoViejo").value = correo;
  document.getElementById("resolverPlataforma").value = plataforma;
  document.getElementById("resNuevoCorreo").value = correo;
  document.getElementById("resolverGarantiaOverlay").classList.add("open");
}

function cerrarModalResolver() {
  haptic();
  const overlay = document.getElementById("resolverGarantiaOverlay");
  if (overlay) overlay.classList.remove("open");
  const form = document.getElementById("formResolverGarantia");
  if (form) form.reset();
}

function ejecutarResolverGarantia(e) {
  if (e) e.preventDefault();
  haptic();

  const btnSubmit = document.getElementById("btnSubmitResolver");
  const fila = document.getElementById("resolverFila").value;
  const plat = document.getElementById("resolverPlataforma").value;
  const correoViejo = document.getElementById("resolverCorreoViejo").value;
  const nuevoCorreo = document.getElementById("resNuevoCorreo").value;
  const nuevaClave = document.getElementById("resNuevaClave").value;

  if (!fila || !plat) {
    alert("⚠️ Error técnico: No se detectaron los datos del ticket original.");
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Guardando Solución...`;

  const oldScript = document.getElementById("cyber_resolver_node");
  if (oldScript) oldScript.remove();

  window.procesarResolucionSheets = function (res) {
    const scriptNode = document.getElementById("cyber_resolver_node");
    if (scriptNode) scriptNode.remove();

    btnSubmit.disabled = false;
    btnSubmit.innerText = "Guardar y Resolver";

    if (res && res.status === "success") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>¡Ticket solucionado con éxito!</span></div>`,
      );
      cerrarModalResolver();
      cargarGarantias();
    } else {
      alert(
        "❌ Error en Sheets: " +
          (res ? res.message : "No se pudo actualizar el registro."),
      );
    }
    delete window.procesarResolucionSheets;
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_resolver_node";
  scriptElement.src =
    GOOGLE_SCRIPT_URL +
    `?action=resolverGarantia&filaIndex=${encodeURIComponent(fila)}&plataforma=${encodeURIComponent(plat)}&correoViejo=${encodeURIComponent(correoViejo)}&nuevoCorreo=${encodeURIComponent(nuevoCorreo)}&nuevaClave=${encodeURIComponent(nuevaClave)}&callback=procesarResolucionSheets&_ts=${Date.now()}`;
  document.body.appendChild(scriptElement);
}

// =========================================================================
// 📐 CYBERNET OS: GESTOR ESTRICTO DE VISIBILIDAD DEL DOCK (ANTI-CLICS FANTASMA)
// =========================================================================
function actualizarVisibilidadDock() {
  // 🔍 Escaneo robusto: Busca si hay modales con la clase 'open' O que tengan display activo
  const algunModalAbierto = Array.from(
    document.querySelectorAll(".overlay-ios"),
  ).some((modal) => {
    return (
      modal.classList.contains("open") ||
      (modal.style.display && modal.style.display !== "none")
    );
  });

  const dockWrapper = document.querySelector(".macos-dock-wrapper");
  if (!dockWrapper) return;

  if (algunModalAbierto) {
    // 🔒 CASO: Ventana abierta -> Desactivación física y reubicación total fuera de la pantalla
    document.body.style.overflow = "hidden";
    dockWrapper.style.setProperty("opacity", "0", "important");
    dockWrapper.style.setProperty("pointer-events", "none", "important");
    dockWrapper.style.setProperty(
      "visibility",
      "hidden",
      "important",
    ); /* 👈 Mata la interactividad en el navegador */
    dockWrapper.style.setProperty(
      "transform",
      "translateY(120px)",
      "important",
    ); /* 👈 Lo expulsa del área clickeable */
    dockWrapper.style.setProperty(
      "transition",
      "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
      "important",
    );
  } else {
    // 🏠 CASO: Escritorio limpio -> El Dock regresa flotando a su posición original con sus clics
    document.body.style.overflow = "";
    dockWrapper.style.setProperty("opacity", "1", "important");
    dockWrapper.style.setProperty("pointer-events", "auto", "important");
    dockWrapper.style.setProperty("visibility", "visible", "important");
    dockWrapper.style.setProperty("transform", "translateY(0)", "important");
    dockWrapper.style.setProperty(
      "transition",
      "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
      "important",
    );
  }
}

// Inicializador y limpiador del Vigilante automático (MutationObserver)
if (window.observadorModalesScroll) window.observadorModalesScroll.disconnect();

window.observadorModalesScroll = new MutationObserver(() => {
  actualizarVisibilidadDock();
});

// Unificación de inicializadores al cargar el ecosistema del DOM
document.addEventListener("DOMContentLoaded", () => {
  window.observadorModalesScroll.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: [
      "class",
      "style",
    ] /* 💡 🔥 CLAVE: Ahora también vigila cambios de estilos en línea */,
  });

  // Ejecución preventiva inicial y vinculación al redimensionamiento
  actualizarVisibilidadDock();
  window.addEventListener("resize", actualizarVisibilidadDock);
});

// Inicializador automático del radar
document.addEventListener("DOMContentLoaded", () => {
  observadorModalesScroll.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ["class"],
  });

  // Si el usuario cambia el tamaño del navegador o gira la pantalla, recalculamos
  window.addEventListener("resize", actualizarVisibilidadDock); // 👈 Nombre corregido
});

function parseDate(fechaStr) {
  let stringLimpio = String(fechaStr || "").trim();
  if (!stringLimpio) return new Date();

  let parts = stringLimpio.split(" ");
  let basePart = parts[0];

  let dateParts = basePart.split("/");
  if (dateParts.length === 3) {
    return new Date(
      parseInt(dateParts[2], 10),
      parseInt(dateParts[1], 10) - 1,
      parseInt(dateParts[0], 10),
    );
  }

  let datePartsDash = basePart.split("-");
  if (datePartsDash.length === 3) {
    if (datePartsDash[0].length === 4) {
      return new Date(
        parseInt(datePartsDash[0], 10),
        parseInt(datePartsDash[1], 10) - 1,
        parseInt(datePartsDash[2], 10),
      );
    } else {
      return new Date(
        parseInt(datePartsDash[2], 10),
        parseInt(datePartsDash[1], 10) - 1,
        parseInt(datePartsDash[0], 10),
      );
    }
  }
  return new Date();
}

function esMismaQuincena(fechaStr) {
  let d = parseDate(fechaStr);
  let hoy = new Date();

  let diaHoy = hoy.getDate();
  let dDia = d.getDate();
  let dMes = d.getMonth();
  let dAnio = d.getFullYear();

  if (dMes !== hoy.getMonth() || dAnio !== hoy.getFullYear()) {
    return false;
  }

  if (diaHoy <= 15) {
    return dDia >= 1 && dDia <= 15;
  } else {
    return dDia >= 16;
  }
}

// =========================================================================
// 🎛️ FUNCIONES DE CONTROL DE CALENDARIO (Añadir en cualquier parte)
// =========================================================================
window.filtroMesHoras = new Date().getMonth();
window.filtroAnioHoras = new Date().getFullYear();
window.filtroQuincenaHoras = new Date().getDate() <= 15 ? 1 : 2;

window.cambiarMesHoras = function (mesIndex) {
  if (typeof haptic === "function") haptic();
  window.filtroMesHoras = parseInt(mesIndex, 10);
  let query = document.getElementById("searchShiftsInput")
    ? document.getElementById("searchShiftsInput").value.toLowerCase()
    : "";
  renderizarHorasEnPantalla(query);
};

window.cambiarQuincenaHoras = function (quincena) {
  if (typeof haptic === "function") haptic();
  window.filtroQuincenaHoras = quincena;
  let query = document.getElementById("searchShiftsInput")
    ? document.getElementById("searchShiftsInput").value.toLowerCase()
    : "";
  renderizarHorasEnPantalla(query);
};

// =========================================================================
// 📅 RENDERIZADOR DE CALENDARIO Y TURNOS (VERSION ULTRA CON TOTAL NÓMINA GLOBAL)
// =========================================================================
function renderizarHorasEnPantalla(filtroBusqueda = "") {
  const container = document.getElementById("shiftsScrollArea");
  if (!container) return;

  const userActivo = sessionStorage.getItem("active_staff");
  let userFinal = userActivo ? userActivo.toUpperCase() : "";
  const isCamilo = userFinal === "CAMILO";

  // 🏦 DICCIONARIO DE CUENTAS NEQUI DEL STAFF
  const numerosNequi = {
    KATHERINE: "3126117630",
    MANUEL: "3205386975",
    PABLO: "3153991383",
    MANUP: "3153991383",
    ANGELICA: "3015156037",
    LAURA: "3126350623",
  };

  // 📅 VARIABLES DE TIEMPO CONTROLADAS POR LOS BOTONES
  const dMes = window.filtroMesHoras;
  const dAnio = window.filtroAnioHoras;
  const esPrimeraQuincena = window.filtroQuincenaHoras === 1;

  const inicioDia = esPrimeraQuincena ? 1 : 16;
  const finDia = esPrimeraQuincena
    ? 15
    : new Date(dAnio, dMes + 1, 0).getDate();

  const mesesNombres = [
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
  const mesesAbrev = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // 🚫 LEER TURNOS TACHADOS VISUALMENTE DESDE LA MEMORIA DEL NAVEGADOR
  let tachadosMemoria = JSON.parse(
    localStorage.getItem("cyber_turnos_tachados") || "{}",
  );

  // 🗃️ Agrupador de datos
  let datosAgrupados = {};
  let vendedoresSet = new Set();

  for (let index = 0; index < window.currentHorasStock.length; index++) {
    let item = window.currentHorasStock[index];
    let d = parseDate(item.fecha);

    if (
      !d ||
      isNaN(d.getTime()) ||
      d.getMonth() !== dMes ||
      d.getFullYear() !== dAnio
    )
      continue;
    let dDia = d.getDate();
    if (esPrimeraQuincena && dDia > 15) continue;
    if (!esPrimeraQuincena && dDia <= 15) continue;

    let vendedorReal = item.vendedor
      .toUpperCase()
      .replace(" (INGRESO MANUAL)", "")
      .trim();
    if (vendedorReal === "PABLO") vendedorReal = "MANUP";

    if (!isCamilo && vendedorReal !== userFinal) continue;

    if (
      filtroBusqueda !== "" &&
      !vendedorReal.includes(filtroBusqueda.toUpperCase()) &&
      !item.fecha.toLowerCase().includes(filtroBusqueda)
    ) {
      continue;
    }

    vendedoresSet.add(vendedorReal);

    if (!datosAgrupados[vendedorReal]) datosAgrupados[vendedorReal] = {};
    if (!datosAgrupados[vendedorReal][dDia]) {
      datosAgrupados[vendedorReal][dDia] = {
        totalSeconds: 0,
        totalPago: 0,
        filasAsociadas: [],
        fechaExactaOrigen: item.fecha,
      };
    }

    let timeParts = String(item.tiempo || "").split(":");
    let totalSec = 0;
    let esTiempoValido = false;

    if (timeParts.length >= 2) {
      totalSec =
        (parseInt(timeParts[0], 10) || 0) * 3600 +
        (parseInt(timeParts[1], 10) || 0) * 60 +
        (timeParts[2] ? parseInt(timeParts[2], 10) || 0 : 0);
      esTiempoValido = true;
    } else {
      let numPuro = parseFloat(String(item.tiempo || "").replace(",", "."));
      if (!isNaN(numPuro) && numPuro > 0) {
        totalSec = Math.floor(numPuro * 3600);
        esTiempoValido = true;
      }
    }

    let pagoStr = String(item.pagoTurno || "0");
    let strLimpioPago = pagoStr
      .replace(/\$|\s/g, "")
      .split(",")[0]
      .replace(/\./g, "");
    let pagoNum = parseInt(strLimpioPago, 10) || 0;

    if (esTiempoValido) {
      datosAgrupados[vendedorReal][dDia].totalSeconds += totalSec;
      datosAgrupados[vendedorReal][dDia].totalPago += pagoNum;
      if (item.filaIndex) {
        datosAgrupados[vendedorReal][dDia].filasAsociadas.push(item.filaIndex);
      }
    }
  }

  let vendedoresArray = Array.from(vendedoresSet).sort();

  // 🎛️ GENERADOR DE MENÚ DE CONTROLES DE FECHA
  let opcionesMes = "";
  mesesNombres.forEach((m, idx) => {
    let selected = idx === dMes ? "selected" : "";
    opcionesMes += `<option value="${idx}" ${selected}>${m} ${dAnio}</option>`;
  });

  let btnQ1Style = esPrimeraQuincena
    ? "background: var(--ios-blue); color: white; border: 1px solid var(--ios-blue);"
    : "background: rgba(10, 132, 255, 0.1); color: var(--ios-blue); border: 1px solid rgba(10, 132, 255, 0.3);";

  let btnQ2Style = !esPrimeraQuincena
    ? "background: var(--ios-blue); color: white; border: 1px solid var(--ios-blue);"
    : "background: rgba(10, 132, 255, 0.1); color: var(--ios-blue); border: 1px solid rgba(10, 132, 255, 0.3);";

  let htmlControles = `
      <div style="background: rgba(0,0,0,0.2); padding: 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: center;">
        <select class="input-ios" style="margin: 0; flex: 1; min-width: 140px; padding: 12px 16px; border-radius: 14px; font-weight: 800; font-size: 0.95rem; color: var(--ios-blue);" onchange="cambiarMesHoras(this.value)">
          ${opcionesMes}
        </select>
        <div style="display: flex; gap: 8px; flex: 2; min-width: 220px;">
          <button class="btn-ios" style="flex: 1; padding: 12px; border-radius: 14px; font-size: 0.85rem; font-weight: 800; transition: all 0.2s; ${btnQ1Style}" onclick="cambiarQuincenaHoras(1)">Quincena 1 (1 - 15)</button>
          <button class="btn-ios" style="flex: 1; padding: 12px; border-radius: 14px; font-size: 0.85rem; font-weight: 800; transition: all 0.2s; ${btnQ2Style}" onclick="cambiarQuincenaHoras(2)">Quincena 2 (16 - Fin)</button>
        </div>
      </div>
    `;

  if (vendedoresArray.length === 0 && filtroBusqueda === "") {
    if (!isCamilo && userFinal !== "") {
      vendedoresArray.push(userFinal);
      datosAgrupados[userFinal] = {};
    } else {
      container.innerHTML =
        htmlControles +
        '<div style="text-align:center; padding:30px; color:var(--text-secondary); font-weight:600; line-height:1.4;">No hay turnos registrados en este periodo.</div>';
      return;
    }
  } else if (vendedoresArray.length === 0) {
    container.innerHTML =
      htmlControles +
      '<div style="text-align:center; padding:30px; color:var(--text-secondary); font-weight:600; line-height:1.4;">No hay turnos que coincidan con la búsqueda.</div>';
    return;
  }

  let tituloPanel = isCamilo
    ? `Reporte Global (${inicioDia} al ${finDia} de ${mesesAbrev[dMes]})`
    : `Mi Reporte (${inicioDia} al ${finDia} de ${mesesAbrev[dMes]})`;
  if (filtroBusqueda !== "") tituloPanel = "Resultados de Búsqueda";

  let html =
    htmlControles +
    `<h4 style="text-align:center; color:var(--text-primary); font-size:1.05rem; margin-bottom:15px; font-weight: 800; letter-spacing: -0.3px;">${tituloPanel}</h4>`;

  // 💰 ACUMULADOR DE NÓMINA TOTAL GLOBAL
  let totalNominaGlobal = 0;

  // 🏗️ CONSTRUCCIÓN DEL LAYOUT TIPO CALENDARIO POR VENDEDOR
  for (let v = 0; v < vendedoresArray.length; v++) {
    let vendedor = vendedoresArray[v];
    let dataVendedor = datosAgrupados[vendedor];
    let totalSegundosVendedor = 0;
    let totalPagoVendedor = 0;
    let filasVendedorGlobal = [];

    let primerDiaFecha = new Date(dAnio, dMes, inicioDia);
    let offsetDias = primerDiaFecha.getDay();

    let celdasHtml = diasSemana
      .map(
        (d) =>
          `<div style="text-align: center; font-size: 0.7rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; padding-bottom: 8px;">${d}</div>`,
      )
      .join("");

    for (let o = 0; o < offsetDias; o++) {
      celdasHtml += `<div style="background: transparent;"></div>`;
    }

    for (let dia = inicioDia; dia <= finDia; dia++) {
      let worked = dataVendedor ? dataVendedor[dia] : null;
      let timeStr = "";
      let btnAcciones = "";
      let hasWorked = false;

      let llaveTachado = `${vendedor}_${dia}_${dMes}_${dAnio}`;
      let estaTachado = tachadosMemoria[llaveTachado] === true;

      if (worked && worked.totalSeconds > 0) {
        hasWorked = true;

        if (!estaTachado) {
          totalSegundosVendedor += worked.totalSeconds;
          totalPagoVendedor += worked.totalPago;
        }

        let h = Math.floor(worked.totalSeconds / 3600);
        let m = Math.floor((worked.totalSeconds % 3600) / 60);
        timeStr =
          String(h).padStart(2, "0") + "h " + String(m).padStart(2, "0") + "m";

        let filasStrInd = worked.filasAsociadas.join(",");
        filasVendedorGlobal.push(...worked.filasAsociadas);

        let puedeEditar = isCamilo;

        if (puedeEditar) {
          btnAcciones += `
              <button style="background: rgba(10, 132, 255, 0.15); border: none; color: var(--ios-blue); cursor: pointer; padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex: 1; transition: all 0.2s;" onclick="abrirEdicionHoras('${vendedor}', '${dia} de ${mesesAbrev[dMes]}', '${worked.fechaExactaOrigen}', '${timeStr}', '${filasStrInd}')" title="Editar tiempo">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>`;
        }

        if (isCamilo) {
          let colorTachar = estaTachado
            ? "var(--ios-green)"
            : "var(--ios-orange)";
          let iconTachar = estaTachado
            ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`
            : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M2 12h20M12 2v20"></path><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>`;

          btnAcciones += `
              <button style="background: rgba(255, 159, 10, 0.15); border: none; color: ${colorTachar}; cursor: pointer; padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex: 1; transition: all 0.2s;" onclick="toggleTacharTurno('${llaveTachado}')" title="${estaTachado ? "Restaurar Pago" : "Tachar y Restar"}">
                ${iconTachar}
              </button>`;

          let targetInd = `${vendedor} el ${dia} de ${mesesAbrev[dMes]}`;
          btnAcciones += `
              <button style="background: rgba(255, 69, 58, 0.15); border: none; color: var(--ios-red); cursor: pointer; padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex: 1; transition: all 0.2s;" onclick="ejecutarLiquidacion('${targetInd}', '${filasStrInd}')" title="Borrar este día de la base de datos">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>
              </button>`;
        }
      }

      let bgCell = hasWorked ? "rgba(48, 209, 88, 0.08)" : "rgba(0,0,0,0.2)";
      let borderCell = hasWorked
        ? "1px solid rgba(48, 209, 88, 0.3)"
        : "1px solid rgba(255,255,255,0.05)";
      let opacityCell = "1";

      if (estaTachado) {
        bgCell = "rgba(255, 159, 10, 0.08)";
        borderCell = "1px solid rgba(255, 159, 10, 0.3)";
        opacityCell = "0.5";
      }

      let numColor = hasWorked
        ? "var(--text-primary)"
        : "var(--text-secondary)";
      let decoracionTexto = estaTachado
        ? "text-decoration: line-through; opacity: 0.6;"
        : "";

      let contenidoCentral = hasWorked
        ? `
          <div style="font-family: monospace; font-size: 0.8rem; font-weight: 800; color: var(--ios-green); margin-top: 6px; ${decoracionTexto}">${timeStr}</div>
          <div style="font-size: 0.7rem; font-weight: 800; color: var(--text-primary); margin-top: 2px; ${decoracionTexto}">$${Math.round(worked.totalPago).toLocaleString("es-CO")}</div>
          <div style="display: flex; gap: 4px; justify-content: center; width: 100%; margin-top: 6px;">${btnAcciones}</div>
        `
        : ``;

      celdasHtml += `
          <div style="position: relative; background: ${bgCell}; border: ${borderCell}; border-radius: 12px; padding: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70px; opacity: ${opacityCell}; transition: all 0.3s ease;">
              <span style="position: absolute; top: 4px; left: 6px; font-size: 0.75rem; font-weight: 800; color: ${numColor};">${dia}</span>
              ${contenidoCentral}
          </div>
        `;
    }

    // ➕ AGREGAMOS EL DINERO REAL DE ESTE VENDEDOR AL TOTAL GLOBAL
    totalNominaGlobal += totalPagoVendedor;

    let tH = Math.floor(totalSegundosVendedor / 3600);
    let tM = Math.floor((totalSegundosVendedor % 3600) / 60);
    let totalFmt =
      String(tH).padStart(2, "0") + "h " + String(tM).padStart(2, "0") + "m";
    let pagoTotalFmt =
      "$" + Math.round(totalPagoVendedor).toLocaleString("es-CO");

    let btnLiquidarTodo = "";
    if (isCamilo && filasVendedorGlobal.length > 0) {
      btnLiquidarTodo = `
          <div style="margin-top:20px;">
            <button class="btn-ios btn-success w-100" style="display:flex; justify-content:center; align-items:center; gap:8px; border-radius: 16px; padding: 14px; font-weight: 800;" onclick="ejecutarLiquidacion('${vendedor}', '${filasVendedorGlobal.join(",")}')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="12" y1="1" x2="12" y2="23"></line><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H6"></path></svg>
              LIQUIDAR PERIODO EN PANTALLA DE ${vendedor}
            </button>
          </div>`;
    }

    let nequiNum = numerosNequi[vendedor];
    let nequiHtml = nequiNum
      ? `
          <div style="display:flex; align-items:center; gap:6px; margin-top: 4px;">
            <span style="background:rgba(224, 0, 150, 0.15); color:#ff37a6; padding:2px 6px; border-radius:6px; font-size:0.65rem; font-weight:800; border: 1px solid rgba(224, 0, 150, 0.3);">NEQUI</span>
            <span style="color:var(--text-primary); font-size:0.85rem; font-family:monospace; font-weight:bold; letter-spacing: 0.5px;">${nequiNum}</span>
            <button style="background:rgba(10, 132, 255, 0.15); border:none; border-radius:6px; width:24px; height:24px; display:flex; align-items:center; justify-content:center; color:var(--ios-blue); cursor:pointer; transition:all 0.2s;" onclick="copiarTextoRapido(this, '${nequiNum}')" title="Copiar Nequi">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
          </div>
        `
      : `<span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; margin-top: 4px;">Sin Nequi Registrado</span>`;

    html += `
        <div class="card-ios" style="padding: 24px; margin-bottom: 24px; border-radius: 28px; border: 1px solid rgba(255,255,255,0.08);">
          <div class="flex-row-between" style="padding-bottom: 16px; border-bottom: 1px dashed rgba(255,255,255,0.15); margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="background: rgba(10, 132, 255, 0.15); color: var(--ios-blue); width: 42px; height: 42px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: 800; font-size: 1.2rem; border: 1px solid rgba(10, 132, 255, 0.2);">
                ${vendedor.charAt(0)}
              </div>
              <div style="display: flex; flex-direction: column;">
                  <span style="font-weight: 800; font-size: 1.15rem; color: var(--text-primary); text-transform: uppercase;">${vendedor}</span>
                  ${nequiHtml}
              </div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">Total Horas</span><br>
              <span style="font-weight: 800; color: var(--ios-blue); font-size: 1.3rem;">${totalFmt}</span><br>
              <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; margin-top: 6px; display: inline-block;">Total a Pagar</span><br>
              <span style="font-weight: 800; color: var(--ios-green); font-size: 1.25rem; transition: all 0.3s ease;">${pagoTotalFmt}</span>
            </div>
          </div>
          
          <div style="width: 100%; overflow-x: auto; padding-bottom: 8px;">
              <div style="min-width: 420px; display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;">
                  ${celdasHtml}
              </div>
          </div>
          
          ${btnLiquidarTodo}
        </div>
      `;
  }

  container.innerHTML = html;

  // =========================================================================
  // 👑 FILTRO DE SEGURIDAD MÁSTER: INYECCIÓN DE TOTAL QUINCENA PARA CAMILO
  // =========================================================================
  if (isCamilo) {
    // Buscamos el botón "+ Agregar" dentro del modal de turnos
    const btnAgregar = [...document.querySelectorAll("button")].find((b) =>
      b.textContent.includes("Agregar"),
    );

    if (btnAgregar) {
      // Limpiamos selectores viejos para evitar duplicados al cambiar de periodo
      const indicadorViejo = document.getElementById("indicadorTotalQuincena");
      if (indicadorViejo) indicadorViejo.remove();

      // Creamos la píldora financiera con los estilos iOS nativos de tu plataforma
      const badgeTotal = document.createElement("span");
      badgeTotal.id = "indicadorTotalQuincena";
      badgeTotal.style.cssText = `
        background: rgba(10, 132, 255, 0.12);
        color: var(--ios-blue);
        padding: 8px 14px;
        border-radius: 12px;
        font-weight: 800;
        font-size: 0.85rem;
        margin-right: 12px;
        border: 1px solid rgba(10, 132, 255, 0.25);
        display: inline-flex;
        align-items: center;
        vertical-align: middle;
      `;

      const totalFormateado =
        "$" + Math.round(totalNominaGlobal).toLocaleString("es-CO");
      badgeTotal.innerHTML = `📊 Total Quincena: <strong style="margin-left: 6px; color: #ffffff;">${totalFormateado}</strong>`;

      // Colocamos el indicador exactamente al lado izquierdo del botón "+ Agregar"
      btnAgregar.parentNode.insertBefore(badgeTotal, btnAgregar);
    }
  }
}
// 🚫 REVOLUCIÓN CLOUD: Tacha el turno visualmente y asienta el pago en la base de datos global
window.toggleTacharTurno = function (llave) {
  if (typeof haptic === "function") haptic();

  // Cambiamos el texto del acumulador temporalmente para indicar carga en red
  const btnTachar = event?.currentTarget;
  if (btnTachar) btnTachar.style.opacity = "0.4";

  const cbName = "cb_tachar_" + Date.now();
  window[cbName] = function (res) {
    const node = document.getElementById("node_" + cbName);
    if (node) node.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      // Guardamos la respuesta global actualizada en el caché local para renderizado instantáneo
      localStorage.setItem("cyber_turnos_tachados", JSON.stringify(res.data));

      let query = document.getElementById("searchShiftsInput")
        ? document.getElementById("searchShiftsInput").value.toLowerCase()
        : "";
      renderizarHorasEnPantalla(query);
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=toggleTacharBackend&llave=${encodeURIComponent(llave)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};
window.ejecutarLiquidacion = function (nombreObjetivo, filasStr) {
  if (!filasStr) return;
  let count = filasStr.split(",").length;

  if (
    !confirm(
      `ATENCIÓN CAMILO: Estás a punto de LIQUIDAR y BORRAR DEFINITIVAMENTE ${count} turnos de ${nombreObjetivo}.\n\n¿Deseas continuar?`,
    )
  ) {
    return;
  }

  haptic();
  const container = document.getElementById("shiftsScrollArea");
  container.innerHTML =
    '<div style="text-align:center; padding:30px; color:var(--text-secondary); font-size:0.9rem;"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:10px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg><br>Liquidando y borrando turnos en Sheets...</div>';

  const oldScript = document.getElementById("cyber_liquidar_node");
  if (oldScript) oldScript.remove();

  window.procesarLiquidacionSheets = function (res) {
    const scriptNode = document.getElementById("cyber_liquidar_node");
    if (scriptNode) scriptNode.remove();

    if (res && res.status === "success") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Liquidación exitosa. Se borraron ${res.eliminadas} registros.</span></div>`,
      );
      forzarRefrescoDeHoras();
    } else {
      let errMsg = "Error al liquidar.";
      if (res && res.message) errMsg = res.message;
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-red);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> <span>${errMsg}</span></div>`,
      );
      forzarRefrescoDeHoras();
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_liquidar_node";
  let queryParams =
    "?action=liquidarTurnos&filas=" +
    encodeURIComponent(filasStr) +
    "&callback=procesarLiquidacionSheets&_ts=" +
    Date.now();
  scriptElement.src = GOOGLE_SCRIPT_URL + queryParams;
  document.body.appendChild(scriptElement);
};

function filtrarHorasInternas() {
  const query = document
    .getElementById("searchShiftsInput")
    .value.toLowerCase();
  renderizarHorasEnPantalla(query);
}

function toggleCodesPanel() {
  if (navigator.vibrate) navigator.vibrate(10);
  const overlay = document.getElementById("codesOverlay");
  overlay.classList.toggle("open");

  if (overlay.classList.contains("open")) {
    // 🔊 NUEVO: Sonido de apertura
    if (typeof window.CyberSonidos !== "undefined")
      window.CyberSonidos.play("abrir");

    if (window.currentCodesStock && window.currentCodesStock.length > 0) {
      renderizarCodigosEnPantalla();
      cargarCodigosDesdeGmail(true);
    } else {
      forzarRefrescoDeCodigos();
    }

    autoRefreshCodesInterval = setInterval(function () {
      cargarCodigosDesdeGmail(true);
    }, 12000);
  } else {
    // 🔊 NUEVO: Sonido de cierre
    if (typeof window.CyberSonidos !== "undefined")
      window.CyberSonidos.play("cerrar");

    if (autoRefreshCodesInterval) {
      clearInterval(autoRefreshCodesInterval);
      autoRefreshCodesInterval = null;
    }
  }
}

function togglePasswordModal() {
  haptic();
  const overlay = document.getElementById("passwordOverlay");

  if (overlay.classList.contains("open")) {
    overlay.classList.remove("open");
  } else {
    window.isForcedChange = false;
    document.getElementById("passwordModalTitle").innerHTML =
      `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Actualización Obligatoria`;
    document.getElementById("passwordModalDesc").innerText =
      "Actualiza tu clave personal de acceso al sistema.";
    document.getElementById("oldPasswordForzado").style.display = "block";
    document.getElementById("btnSubmitPasswordForzado").innerText =
      "Guardar en Google Sheets";
    document.getElementById("btnCancelPasswordForzado").innerText = "Cancelar";

    document.getElementById("passwordForm").reset();
    overlay.classList.add("open");
    document.getElementById("oldPasswordForzado").focus();
  }
}

function forzarRefrescoDeCodigos() {
  haptic();
  document.getElementById("codesScrollArea").innerHTML =
    '<div style="text-align:center; padding:30px; color:var(--text-secondary); font-size:0.9rem;"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg><br>Sincronizando bandeja de Gmail...</div>';
  cargarCodigosDesdeSheets(false);
}

function cargarCodigosDesdeSheets(silencioso = false) {
  if (isFetchingCodes) return;
  isFetchingCodes = true;

  if (!silencioso && window.cyberCodesTimeout) {
    clearTimeout(window.cyberCodesTimeout);
  }

  if (!silencioso) {
    window.cyberCodesTimeout = setTimeout(function () {
      const container = document.getElementById("codesScrollArea");
      if (container && container.innerHTML.includes("Sincronizando")) {
        container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-secondary); font-weight:600; line-height:1.4;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg><br>No hay códigos disponibles en este momento.</div>`;
      }
      isFetchingCodes = false;
    }, 12000);
  }

  const oldScript = document.getElementById("cyber_jsonp_node");
  if (oldScript) oldScript.remove();

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_jsonp_node";
  scriptElement.setAttribute("data-cfasync", "false");
  scriptElement.src =
    GOOGLE_SCRIPT_URL +
    "?action=obtenerCodigos&callback=procesarCodigosSheets&_ts=" +
    Date.now();
  document.body.appendChild(scriptElement);
}

window.procesarCodigosSheets = function (res) {
  isFetchingCodes = false;
  if (window.cyberCodesTimeout) clearTimeout(window.cyberCodesTimeout);

  const oldScript = document.getElementById("cyber_jsonp_node");
  if (oldScript) oldScript.remove();

  const container = document.getElementById("codesScrollArea");
  if (res && res.status === "success") {
    window.currentCodesStock = res.data;
    if (document.getElementById("codesOverlay").classList.contains("open")) {
      renderizarCodigosEnPantalla();
    }
  } else {
    if (
      container &&
      (container.innerHTML.includes("Sincronizando") ||
        container.children.length === 0)
    ) {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-secondary); font-weight:600; line-height:1.4;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg><br>No hay códigos disponibles en este momento.</div>`;
    }
  }
};

// =========================================================================
// 🌐 HELPER GLOBAL DE COPIADO CON RESPUESTA TOAST (CYBERNET SECURITY)
// =========================================================================
if (!window.copiarTextoBandeja) {
  window.copiarTextoBandeja = function (texto, mensajeExito) {
    if (typeof haptic === "function") haptic();

    navigator.clipboard
      .writeText(texto)
      .then(() => {
        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green); font-weight:700;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> 
            <span>${mensajeExito}</span>
           </div>`,
          );
        }
      })
      .catch((err) => {
        console.error("Error crítico al copiar: ", err);
      });
  };
}

// =========================================================================
// 🔑 CORE BANDEJA: RENDERIZADOR DINÁMICO DE TARJETAS DE CÓDIGOS
// =========================================================================
function renderizarCodigosEnPantalla() {
  const container = document.getElementById("codesScrollArea");
  if (!container) return;

  if (window.currentCodesStock.length === 0) {
    container.innerHTML =
      '<div style="text-align:center; padding:30px; color:var(--text-secondary); font-weight:600; line-height:1.4;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg><br>No hay códigos disponibles en este momento.</div>';
    return;
  }

  let htmlCards = "";
  for (let i = 0; i < window.currentCodesStock.length; i++) {
    let item = window.currentCodesStock[i];
    let colColor = item.colorText || "var(--ios-blue)";

    // 🔍 ANALIZADOR INTELIGENTE ANTI-DESBORDAMIENTO
    let textoLimpio = (item.codigoLink || "").trim();
    // Escapamos comillas simples para evitar roturas en el atributo onclick de HTML
    let textoEscapado = textoLimpio.replace(/'/g, "\\'");

    // Filtro: Detecta si el valor es un enlace web válido
    const esURL =
      /^(http|https):\/\/[^ "]+$/.test(textoLimpio) ||
      textoLimpio.toLowerCase().includes("www.");

    let renderCodigoOEnlace = "";

    if (esURL) {
      // 🔗 CASO URL: Oculta por completo el link largo y dibuja un botón compacto Apple Style
      renderCodigoOEnlace = `
        <button class="btn-ios" style="padding: 6px 14px; font-size: 0.82rem; border-radius: 10px; margin: 0; background: rgba(10, 132, 255, 0.1) !important; color: var(--ios-blue) !important; border: 1px solid rgba(10, 132, 255, 0.2); font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;" 
                onclick="window.copiarTextoBandeja('${textoEscapado}', 'Enlace de acceso copiado')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          Copiar Enlace
        </button>
      `;
    } else {
      // 🔢 CASO CÓDIGO NUMÉRICO/PIN: Se mantiene 100% visible, destacado y clickeable para copiar
      renderCodigoOEnlace = `
        <span style="font-size: 1.15rem; color: ${colColor}; font-weight: 800; font-family: monospace; background: rgba(255, 255, 255, 0.03); padding: 4px 14px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.06); letter-spacing: 0.5px; cursor: pointer; display: inline-block; transition: transform 0.1s; text-shadow: 0 0 10px rgba(255,255,255,0.05);" 
              onclick="window.copiarTextoBandeja('${textoEscapado}', 'Código copiado al portapapeles')"
              onmousedown="this.style.transform='scale(0.96)'"
              onmouseup="this.style.transform='scale(1)'"
              title="Haz clic para copiar código">
          ${textoLimpio}
        </span>
      `;
    }

    htmlCards += `
        <div class="card-ios mb-1" style="padding: 16px; background: rgba(255, 255, 255, 0.015); border: 1px solid var(--glass-border); border-radius: 16px; display: flex; flex-direction: column; gap: 12px; box-shadow: var(--glass-shadow);">
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: ${colColor}; box-shadow: 0 0 10px ${colColor};"></span>
                    <span style="font-size: 0.95rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.3px; text-transform: uppercase;">${item.plataforma}</span>
                </div>
                <span style="font-size: 0.75rem; color: var(--text-secondary); font-family: monospace; font-weight: 600; opacity: 0.8;">${item.hora}</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px; padding: 2px 0;">
                <div style="display: flex; align-items: baseline; gap: 8px;">
                    <span style="font-size: 0.78rem; color: var(--text-secondary); min-width: 105px; flex-shrink: 0; text-transform: uppercase; font-weight: 600; letter-spacing: 0.3px;">Cliente:</span>
                    <span style="font-size: 0.88rem; color: var(--text-primary); font-weight: 600; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.correo}">${item.correo}</span>
                </div>
                <div style="display: flex; align-items: baseline; gap: 8px;">
                    <span style="font-size: 0.78rem; color: var(--text-secondary); min-width: 105px; flex-shrink: 0; text-transform: uppercase; font-weight: 600; letter-spacing: 0.3px;">Acción:</span>
                    <span style="font-size: 0.85rem; color: var(--text-primary); font-weight: 500; opacity: 0.95; line-height: 1.3;">${item.accion}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                    <span style="font-size: 0.78rem; color: var(--text-secondary); min-width: 105px; flex-shrink: 0; text-transform: uppercase; font-weight: 600; letter-spacing: 0.3px;">Código / Enlace:</span>
                    ${renderCodigoOEnlace}
                </div>
            </div>

            <button class="btn-ios btn-secondary w-100" style="display: flex; justify-content: center; align-items: center; gap: 8px; padding: 12px; font-weight: 700; font-size: 0.85rem; border-radius: 12px; margin: 0; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border); transition: all 0.2s;" onclick="copiarMensajeRapidoGmail(this, ${i})">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                COPIAR MENSAJE
            </button>

        </div>
    `;
  }
  container.innerHTML = htmlCards;
  filtrarCodigosInternos();
}

function copiarMensajeRapidoGmail(btn, index) {
  haptic();
  const item = window.currentCodesStock[index];
  if (!item) return;

  navigator.clipboard
    .writeText(item.copiadoRapido)
    .then(function () {
      const originalText = btn.innerHTML;
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> ¡COPIADO CON ÉXITO!`;
      btn.style.background = "var(--ios-green)";
      btn.style.color = "white";
      btn.style.borderColor = "transparent";

      setTimeout(function () {
        btn.innerHTML = originalText;
        btn.style.background = "";
        btn.style.color = "";
        btn.style.borderColor = "";
      }, 1500);
    })
    .catch(function () {
      const textarea = document.createElement("textarea");
      textarea.value = item.copiadoRapido;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();

      const originalText = btn.innerHTML;
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> ¡COPIADO CON ÉXITO!`;
      btn.style.background = "var(--ios-green)";
      btn.style.color = "white";
      btn.style.borderColor = "transparent";

      setTimeout(function () {
        btn.innerHTML = originalText;
        btn.style.background = "";
        btn.style.color = "";
        btn.style.borderColor = "";
      }, 1500);
    });
}

function filtrarCodigosInternos() {
  const query = document.getElementById("searchCodesInput").value.toLowerCase();
  const cards = document.querySelectorAll("#codesScrollArea .card-ios");
  for (let i = 0; i < cards.length; i++) {
    let card = cards[i];
    card.style.display = card.innerText.toLowerCase().includes(query)
      ? ""
      : "none";
  }
}

function resetearInactividad() {
  if (!sessionStorage.getItem("active_staff")) return;
  window.cyberUltimaActividad = Date.now();
}

function iniciarControlInactividad() {
  window.cyberUltimaActividad = Date.now();

  window.addEventListener("mousemove", resetearInactividad);
  window.addEventListener("keypress", resetearInactividad);
  window.addEventListener("click", resetearInactividad);
  window.addEventListener("scroll", resetearInactividad);
  window.addEventListener("touchstart", resetearInactividad);
  resetearInactividad();

  setInterval(function () {
    if (!sessionStorage.getItem("active_staff")) return;
    if (sessionStorage.getItem("active_staff").toUpperCase() === "CAMILO")
      return;

    let ahora = Date.now();
    let tiempoInactivo = ahora - window.cyberUltimaActividad;

    if (tiempoInactivo > 30 * 60 * 1000) {
      cerrarSesionStaffPorInactividadGrave();
      return;
    }
  }, 5000);
}

function cerrarSesionStaffPorInactividadGrave() {
  let lastSync =
    parseInt(sessionStorage.getItem("cyber_last_sync_time"), 10) || Date.now();
  let msUtiles = window.cyberUltimaActividad - lastSync;
  if (msUtiles < 0 || isNaN(msUtiles)) msUtiles = 0;

  function finalizarCierreLimpio() {
    sessionStorage.clear();
    localStorage.removeItem("cyber_saved_staff");
    window.location.reload();
  }

  if (msUtiles > 0) {
    let totalSeconds = Math.floor(msUtiles / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;
    let tiempoFormateado =
      String(hours).padStart(2, "0") +
      ":" +
      String(minutes).padStart(2, "0") +
      ":" +
      String(seconds).padStart(2, "0");
    const activeUser = sessionStorage.getItem("active_staff") || "Vendedor";

    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "notificarCorreo",
        tipo: "pulso",
        user: activeUser,
        tiempoTrabajado: tiempoFormateado,
      }),
    })
      .then(finalizarCierreLimpio)
      .catch(finalizarCierreLimpio);
  } else {
    finalizarCierreLimpio();
  }
}

function startShiftTimer() {
  if (!sessionStorage.getItem("cyber_shift_start_time")) {
    sessionStorage.setItem("cyber_shift_start_time", Date.now());
  }
  if (!sessionStorage.getItem("cyber_shift_accumulated_time")) {
    sessionStorage.setItem("cyber_shift_accumulated_time", 0);
  }
  if (!sessionStorage.getItem("cyber_last_sync_time")) {
    sessionStorage.setItem("cyber_last_sync_time", Date.now());
  }

  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(function () {
    if (isTimerPaused) return;

    let startTime = parseInt(sessionStorage.getItem("cyber_shift_start_time"));
    let accumulated = parseInt(
      sessionStorage.getItem("cyber_shift_accumulated_time"),
    );
    if (isNaN(accumulated)) accumulated = 0;

    let elapsed = Date.now() - startTime;
    let totalMs = accumulated + elapsed;

    let totalSeconds = Math.floor(totalMs / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    let hStr = String(hours).padStart(2, "0");
    let mStr = String(minutes).padStart(2, "0");
    let sStr = String(seconds).padStart(2, "0");

    let stElement = document.getElementById("shiftTimer");
    if (stElement) stElement.innerText = hStr + ":" + mStr + ":" + sStr;

    let lastSync = parseInt(sessionStorage.getItem("cyber_last_sync_time"), 10);
    if (Date.now() - lastSync >= 600000) {
      ejecutarAutoPulsoTiempo();
    }
  }, 1000);
}

function obtenerTiempoFinalFormateado() {
  let startTime = parseInt(sessionStorage.getItem("cyber_shift_start_time"));
  let accumulated = parseInt(
    sessionStorage.getItem("cyber_shift_accumulated_time"),
  );
  if (isNaN(accumulated)) accumulated = 0;
  let totalMs = accumulated;
  if (!isTimerPaused) {
    totalMs += Date.now() - startTime;
  }
  let totalSeconds = Math.floor(totalMs / 1000);
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds % 3600) / 60);
  let seconds = totalSeconds % 60;
  return (
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0")
  );
}

function ejecutarNotificacionDeCorreo(
  vendedor,
  tipoAccion,
  tiempoTrabajado,
  callbackFinal,
) {
  if (!GOOGLE_SCRIPT_URL) {
    if (callbackFinal) callbackFinal();
    return;
  }
  let paramObj = {
    action: "notificarCorreo",
    user: vendedor,
    tipo: tipoAccion,
    tiempoTrabajado: tiempoTrabajado,
  };
  fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paramObj),
  })
    .then(function () {
      if (callbackFinal) callbackFinal();
    })
    .catch(function () {
      if (callbackFinal) callbackFinal();
    });
}

// =========================================================================
// 🔐 MÓDULO DE ACCESO (LOGIN & WORKSPACE) - VERSIÓN LIMPIA
// =========================================================================

function validateStaffAccess(e) {
  if (e) e.preventDefault();
  if (typeof haptic === "function") haptic();

  const userElement = document.getElementById("staffUser");
  const passElement = document.getElementById("staffPass");
  const remElement = document.getElementById("rememberMe");

  const userInput = userElement ? userElement.value.toUpperCase().trim() : "";
  const passInput = passElement ? passElement.value.trim() : "";
  const rememberMe = remElement ? remElement.checked : false;
  const errorToast = document.getElementById("error-login-toast");
  const submitBtn = document.querySelector('#loginForm button[type="submit"]');

  if (!userInput || !passInput) return;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Verificando...`;
  }

  const oldScript = document.getElementById("cyber_login_node");
  if (oldScript) oldScript.remove();

  window.procesarLoginSheets = function (res) {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Verificar Identidad";
    }
    const scriptNode = document.getElementById("cyber_login_node");
    if (scriptNode) scriptNode.remove();

    if (res && res.status === "need_email") {
      // Falta correo: Oculta login, muestra registro de email
      window.tempAuthUser = userInput; // Memoria temporal
      document.getElementById("loginOverlay").style.display = "none";
      document.getElementById("emailRegisterOverlay").style.display = "flex";
      setTimeout(() => document.getElementById("staffNewEmail").focus(), 200);
    } else if (res && res.status === "need_code") {
      // Tiene correo y despachó OTP: Muestra ventana 6 dígitos y arranca reloj
      window.tempAuthUser = userInput;
      document.getElementById("lblMaskedEmail").innerText = res.emailMasked;
      document.getElementById("loginOverlay").style.display = "none";
      document.getElementById("emailRegisterOverlay").style.display = "none";
      document.getElementById("otpVerificationOverlay").style.display = "flex";

      iniciarRelojOTP(300); // 300 segundos = 5 min
      setTimeout(() => document.getElementById("staffOtpCode").focus(), 200);
    } else if (res && res.status === "success") {
      // Esto ocurrirá solo para excepciones o si apagas el 2FA en el futuro
      sessionStorage.setItem("active_staff", userInput);
      if (rememberMe) localStorage.setItem("cyber_saved_staff", userInput);
      document.getElementById("loginOverlay").style.display = "none";
      const controlRight = document.getElementById("macControlCenterRight");
      if (controlRight) controlRight.style.display = "flex";
      entrarAlSistema(userInput);
    } else {
      let errMsg = res ? res.message : "Credenciales incorrectas.";
      if (errorToast) {
        errorToast.innerHTML = `<div style="display:flex; align-items:center; gap:8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> <span>${errMsg}</span></div>`;
        errorToast.style.display = "block";
      }
      if (passElement) passElement.value = "";
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_login_node";

  // 🔥 SEGURO ANTI-CONGELAMIENTO: Restaura el botón si Google bloquea la conexión
  scriptElement.onerror = function () {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Verificar Identidad";
    }
    if (errorToast) {
      errorToast.innerHTML = `<div style="display:flex; align-items:center; gap:8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> <span>Error de conexión. Revisa los permisos de Google.</span></div>`;
      errorToast.style.display = "block";
    }
    scriptElement.remove();
  };

  let queryParams =
    "?action=verificarLogin&user=" +
    encodeURIComponent(userInput) +
    "&pass=" +
    encodeURIComponent(passInput) +
    "&callback=procesarLoginSheets&_ts=" +
    Date.now();
  scriptElement.src = GOOGLE_SCRIPT_URL + queryParams;
  document.body.appendChild(scriptElement);
}

function entrarAlSistema(userInput) {
  // 🔥 1. LIMPIEZA MAESTRA: Destruimos rastros de ventanas de Login y 2FA
  ["loginOverlay", "emailRegisterOverlay", "otpVerificationOverlay"].forEach(
    (id) => {
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.remove("open"); // <-- ESTE ERA EL CULPABLE
        modal.style.setProperty("display", "none", "important");
      }
    },
  );

  // 🔒 2. SELLAR USUARIO EN MEMORIA (Previene el error de "Vendedor")
  sessionStorage.setItem("active_staff", userInput.toUpperCase().trim());

  if (userInput.toUpperCase().trim() !== "CAMILO") {
    ejecutarNotificacionDeCorreo(userInput, "inicio", "00:00:00");
  }

  // 🖥️ 3. ENCENDEMOS LA INTERFAZ PRINCIPAL
  const workspace = document.getElementById("mainWorkspace");
  if (workspace) workspace.style.display = "flex";

  const globalHeader = document.getElementById("globalHeader");
  if (globalHeader) globalHeader.style.display = "flex";

  const controlPanel = document.getElementById("controlPanel");
  if (controlPanel) controlPanel.style.display = "flex";

  let sessionNameEl = document.getElementById("staffSessionName");
  if (sessionNameEl) sessionNameEl.innerText = userInput;

  const currentOperator = userInput.toUpperCase().trim();
  const shiftTimer = document.getElementById("shiftTimer");
  const cajaBtn = document.getElementById("btnCajaFinanzas");
  const btnRegistro = document.getElementById("btnRegistroVentas");

  if (btnRegistro)
    btnRegistro.style.setProperty("display", "flex", "important");

  // 🍎 PROTECCIÓN DE CONTROLES
  if (currentOperator === "CAMILO") {
    if (shiftTimer)
      shiftTimer.style.setProperty("display", "none", "important");
    if (cajaBtn) cajaBtn.style.setProperty("display", "flex", "important");
  } else {
    if (shiftTimer)
      shiftTimer.style.setProperty("display", "inline-flex", "important");
    if (cajaBtn) cajaBtn.style.setProperty("display", "none", "important");
  }

  // 🚀 4. FORZAR LA APARICIÓN DEL DOCK AL INSTANTE
  if (typeof actualizarVisibilidadDock === "function") {
    actualizarVisibilidadDock();
  }

  // ⚙️ 5. INICIALIZAR EL ESCRITORIO Y EL MOTOR FANTASMA
  inicializarWorkspace();
}

function inicializarWorkspace() {
  cargarPlantillasDesdeSheets();
  startShiftTimer();
  iniciarControlInactividad();
  cargarHorasDesdeSheets();

  // 🔴 Cargar el contador de garantías al iniciar y refrescar cada minuto
  if (typeof actualizarBadgeGarantias === "function") {
    actualizarBadgeGarantias();
    setInterval(actualizarBadgeGarantias, 60000);
  }
}

function cerrarSesionStaff() {
  haptic();
  let usuarioActivo = sessionStorage.getItem("active_staff") || "STAFF";

  function finalizarCierre() {
    sessionStorage.removeItem("active_staff");
    localStorage.removeItem("cyber_saved_staff");
    sessionStorage.removeItem("cyber_shift_start_time");
    location.reload();
  }

  if (usuarioActivo.toUpperCase().trim() === "CAMILO") {
    finalizarCierre();
  } else {
    if (
      confirm(
        "¿Estás seguro de que deseas cerrar tu sesión e informar tu turno?",
      )
    ) {
      let lastSync =
        parseInt(sessionStorage.getItem("cyber_last_sync_time"), 10) ||
        Date.now();
      let ahora = Date.now();
      let deltaMs = ahora - lastSync;
      if (deltaMs < 0 || isNaN(deltaMs)) deltaMs = 0;

      let totalSeconds = Math.floor(deltaMs / 1000);
      let hours = Math.floor(totalSeconds / 3600);
      let minutes = Math.floor((totalSeconds % 3600) / 60);
      let seconds = totalSeconds % 60;
      let tiempoTexto =
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

      ejecutarNotificacionDeCorreo(
        usuarioActivo,
        "cierre",
        tiempoTexto,
        finalizarCierre,
      );
    }
  }
}

// Reemplaza el fragmento de inicialización por este:
window.addEventListener("DOMContentLoaded", () => {
  let savedTheme = localStorage.getItem("cyber_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  let sessionStaff = sessionStorage.getItem("active_staff");
  let localStaff = localStorage.getItem("cyber_saved_staff");
  let user = sessionStaff || localStaff;

  if (user) {
    // Si está en la página de login pero ya está autenticado, mandarlo al admin
    if (window.location.pathname.includes("login.html")) {
      window.location.href = "admin.html";
      return;
    }
    entrarAlSistema(user, false, true);
  }
});

const qrPrincipal = {
  titulo: "PAGOS",
  imagenUrl:
    "https://i.postimg.cc/9Fb55dGq/Whats-App-Image-2026-07-02-at-4-18-01-PM.jpg",
  texto: `Te comparto nuestra llave para el pago de tu servicio desde cualquier entidad bancaria:\n\n📌 *Llave:* 0090878219\n👤 *Verificar nombre:* REF CYBERNET\n\n⚠️ *Nota:* Esta llave es exclusiva para pagos mediante Bre-B desde cualquier banco.\n\n*Pasos para activar tu servicio:* 1️⃣ Realiza la transferencia.\n2️⃣ Envía el comprobante de pago por este medio.\n3️⃣ ¡Recibe tu acceso y empieza a disfrutar! 🚀🎬`,
};

// 🔥 BLINDAJE: Solo ejecutamos esto si estamos en admin.html (donde existe el headerContainer)
document.addEventListener("DOMContentLoaded", () => {
  const headerContainer = document.getElementById("header-container");
  if (headerContainer && typeof qrPrincipal !== "undefined") {
    headerContainer.innerHTML = `
        <div class="card-ios w-100" style="max-width: 440px; align-items: center; gap: 12px; padding: 20px;">
          
          <img src="${qrPrincipal.imagenUrl}" alt="QR" 
 onclick="window.copiarImagenQRPagos(this, '${qrPrincipal.imagenUrl}')"
 style="max-width:210px; width:100%; border-radius:16px; border: 2px solid transparent; box-shadow:var(--glass-shadow); padding:5px; background:white; margin:0 auto; cursor: pointer; transition: all 0.2s;"
 onmouseover="this.style.transform='scale(1.05)'"
 onmouseout="this.style.transform='scale(1)'"
 title="Haz clic para copiar la imagen del QR">
          
<span class="text-secondary text-center" style="font-size:0.75rem; font-weight:500; margin-top: -4px;">
  (Haz clic sobre el QR para copiar la imagen)
</span>
          
          <!-- Contenedor de Botones de Pago -->
          <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 4px;">
            
            <!-- 🔥 BOTÓN GRIS CLARO PAGOS (BRE-B) 🔥 -->
            <button class="btn-ios copy-text-btn w-100" 
                    style="padding: 14px !important; font-size: 0.85rem !important; font-weight: 800 !important; border-radius: 12px !important; background: rgba(255, 255, 255, 0.08) !important; color: var(--text-primary) !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; transition: all 0.2s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important;" 
                    data-clipboard-text="${qrPrincipal.texto.replace(/"/g, "&quot;").replace(/'/g, "&#39;")}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              COPIAR PAGOS (BRE-B)
            </button>
            
            <!-- 🔥 BOTÓN GRIS CLARO NEQUI (Carga Inicial) 🔥 -->
            <button class="btn-ios copy-text-btn w-100" 
                    style="padding: 14px !important; font-size: 0.85rem !important; font-weight: 800 !important; border-radius: 12px !important; background: rgba(255, 255, 255, 0.08) !important; color: var(--text-primary) !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; transition: all 0.2s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important;" 
                    data-clipboard-text="Transferencias Nequi: 3215938767">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              COPIAR NEQUI
            </button>

          </div>
        </div>
      `;
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      renderGrid(e.target.value);
    });
  }
});

// Envolvemos el Clipboard para que espere a que la página cargue por completo
document.addEventListener("DOMContentLoaded", () => {
  if (typeof ClipboardJS !== "undefined") {
    const clipboard = new ClipboardJS(".copy-text-btn");

    clipboard.on("success", function (e) {
      if (typeof haptic === "function") haptic();
      const btn = e.trigger;
      const card = btn.closest(".card-ios");
      const originalHTML = btn.innerHTML;

      // 🟢 RELLENO VERDE ÉXITO AL DAR CLIC (Usando Hexadecimal seguro) 🟢
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡COPIADO!`;
      btn.style.setProperty("background", "#30d158", "important");
      btn.style.setProperty("color", "#ffffff", "important");
      btn.style.setProperty("border-color", "#30d158", "important");
      btn.style.setProperty("transform", "scale(1.05)", "important");

      if (card) {
        card.style.setProperty("border-color", "#30d158", "important");
        card.style.setProperty(
          "box-shadow",
          "0 0 20px rgba(48, 209, 88, 0.4)",
          "important",
        );
      }

      // 🔄 RESTAURAMOS A SU DISEÑO GRIS TRANSLÚCIDO NORMAL DESPUÉS DE 1.5s
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
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    actualizarPerfilesLibres(false);
  }, 1000);

  setInterval(() => {
    actualizarPerfilesLibres(false);
  }, 300000);

  renderizarPlataformasVenta();
});

// =========================================================================
// VIGILANTE EN VIVO ULTRA COMPATIBLE CON iOS (INYECCIÓN DE DOM)
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const inputTelefonoVenta = document.getElementById("ventaTelefono");
  const selectBanco = document.getElementById("ventaBanco");
  const optNomina = document.getElementById("optPagoNomina");

  // Clonamos y guardamos la opción en la memoria antes de borrarla del menú
  let copiaOptNomina = null;
  if (optNomina) {
    copiaOptNomina = optNomina.cloneNode(true);
    optNomina.remove(); // La sacamos del menú de inmediato al cargar la página
  }

  if (inputTelefonoVenta && selectBanco && copiaOptNomina) {
    inputTelefonoVenta.addEventListener("input", function () {
      // Limpiamos el número quitando espacios, guiones o letras
      const telLimpio = this.value.replace(/\D/g, "").trim();

      // Los 4 números oficiales de tu staff
      const empleadosNumeros = [
        "3205386975",
        "3126117630",
        "3107137371",
        "3015156037",
        "3126350623",
      ];

      // Verificamos si la opción ya está metida en el select actual
      const yaExisteEnMenu = document.getElementById("optPagoNomina");

      if (empleadosNumeros.includes(telLimpio)) {
        if (!yaExisteEnMenu) {
          // Si el número coincide y no está en el menú, la inyectamos al final
          selectBanco.appendChild(copiaOptNomina);
          triggerToast(
            "✨ Teléfono de Staff detectado. Opción Nómina habilitada.",
          );
        }
      } else {
        if (yaExisteEnMenu) {
          // Si el número cambia a uno normal y la opción estaba puesta, la destruimos
          if (selectBanco.value === "NÓMINA") {
            selectBanco.selectedIndex = 0; // Reseteamos la selección
          }
          yaExisteEnMenu.remove(); // La borramos físicamente de la pantalla
        }
      }
    });
  }
});

function ejecutarAutoPulsoTiempo() {
  let lastSync =
    parseInt(sessionStorage.getItem("cyber_last_sync_time"), 10) || Date.now();
  let ahora = Date.now();
  let deltaMs = ahora - lastSync;

  let totalSeconds = Math.floor(deltaMs / 1000);
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds % 3600) / 60);
  let seconds = totalSeconds % 60;

  let tiempoTexto =
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0");
  const activeUser =
    sessionStorage.getItem("active_staff") ||
    localStorage.getItem("cyber_saved_staff") ||
    "Vendedor";

  sessionStorage.setItem("cyber_last_sync_time", ahora);

  fetch(
    "https://script.google.com/macros/s/AKfycbxk_T98sS1lL5lbXVq_XKOpB6ZCNQ1DSCgPhc_a6vmE_ai16YbSYO_eHkmeu0ZjM5aq/exec",
    {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "notificarCorreo",
        tipo: "pulso",
        user: activeUser,
        tiempoTrabajado: tiempoTexto,
      }),
    },
  )
    .then(() =>
      console.log(
        "✅ Auto-Guardado: Bloque de " + tiempoTexto + " salvado en la nube.",
      ),
    )
    .catch(() => sessionStorage.setItem("cyber_last_sync_time", lastSync));
}

function ejecutarCierreSesionDefinitivo() {
  if (
    confirm("¿Estás seguro de que deseas cerrar tu sesión e informar tu turno?")
  ) {
    let lastSync =
      parseInt(sessionStorage.getItem("cyber_last_sync_time"), 10) ||
      Date.now();
    let ahora = Date.now();
    let deltaMs = ahora - lastSync;

    let totalSeconds = Math.floor(deltaMs / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    let tiempoTexto =
      String(hours).padStart(2, "0") +
      ":" +
      String(minutes).padStart(2, "0") +
      ":" +
      String(seconds).padStart(2, "0");
    const activeUser =
      sessionStorage.getItem("active_staff") ||
      localStorage.getItem("cyber_saved_staff") ||
      "Vendedor";

    fetch(
      "https://script.google.com/macros/s/AKfycbxk_T98sS1lL5lbXVq_XKOpB6ZCNQ1DSCgPhc_a6vmE_ai16YbSYO_eHkmeu0ZjM5aq/exec",
      {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "notificarCorreo",
          tipo: "cierre",
          user: activeUser,
          tiempoTrabajado: tiempoTexto,
        }),
      },
    ).then(() => {
      sessionStorage.clear();
      window.location.reload();
    });
  }
}
// =========================================================================
// LÓGICA: VENTANA "TOTAL NÓMINA" (CONEXIÓN DIRECTA A SHEETS)
// =========================================================================
function abrirTotalNomina() {
  haptic();
  document.getElementById("nominaOverlay").classList.add("open");
  const btn = document.querySelector("#nominaOverlay .btn-ios.btn-secondary");
  refrescarTotalNominaEnVivo(btn);
}

function cerrarTotalNomina() {
  haptic();
  document.getElementById("nominaOverlay").classList.remove("open");
}

function refrescarTotalNominaEnVivo(btn) {
  if (btn) {
    haptic();
    btn.dataset.oldText = btn.innerHTML;
    btn.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Buscando...`;
    btn.disabled = true;
  }

  // Pone la pantalla en modo carga
  document.getElementById("nominaContentArea").innerHTML =
    "<div class='empty-log-msg'><svg class='spin-anim' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' style='vertical-align:middle; margin-right:6px;'><line x1='12' y1='2' x2='12' y2='6'></line><line x1='12' y1='18' x2='12' y2='22'></line><line x1='4.93' y1='4.93' x2='7.76' y2='7.76'></line><line x1='16.24' y1='16.24' x2='19.07' y2='19.07'></line><line x1='2' y1='12' x2='6' y2='12'></line><line x1='18' y1='12' x2='22' y2='12'></line><line x1='4.93' y1='19.07' x2='7.76' y2='16.24'></line><line x1='16.24' y1='7.76' x2='19.07' y2='4.93'></line></svg> Descargando datos de Sheets...</div>";

  // Va a buscar la info fresca a Google Apps Script
  const cbName = "cb_get_nomina_" + Date.now();
  window[cbName] = function (res) {
    if (btn) {
      btn.innerHTML = btn.dataset.oldText || "Refrescar";
      btn.disabled = false;
    }
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      renderizarTotalNomina(res.data, res.detalles);
    } else {
      document.getElementById("nominaContentArea").innerHTML =
        "<div class='empty-log-msg' style='color:var(--ios-red);'>❌ Error al conectar con Sheets.</div>";
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerNomina&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

// =========================================================================
// LÓGICA: VENTANA "TOTAL NÓMINA" (VERSIÓN TABLA MINIMALISTA ENTERPRISE)
// =========================================================================
function renderizarTotalNomina(listaNomina, detalles) {
  const userActivo = (sessionStorage.getItem("active_staff") || "")
    .toUpperCase()
    .trim();
  const isCamilo = userActivo === "CAMILO";

  if (!listaNomina || listaNomina.length === 0) {
    document.getElementById("nominaContentArea").innerHTML =
      "<div class='empty-log-msg'>No hay registros de nómina en Sheets.</div>";
    return;
  }

  // 🏦 DICCIONARIO DE CUENTAS NEQUI DEL STAFF
  const numerosNequi = {
    KATHERINE: "3126117630",
    MANUEL: "3205386975",
    PABLO: "3153991383",
    MANUP: "3153991383",
    ANGELICA: "3015156037",
    LAURA: "3126350623",
  };

  // 1. ABRIMOS EL CONTENEDOR DE LA TABLA (Sin la columna Acción)
  let html = `
    <div style="background: var(--card-bg); border: var(--glass-border); border-radius: 12px; overflow: hidden; width: 100%;">
      <div style="width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; min-width: 450px;">
          <thead>
            <tr style="background: rgba(255, 255, 255, 0.02); border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <th style="padding: 14px 16px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Operador</th>
              <th style="padding: 14px 16px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Balance</th>
              <th style="padding: 14px 16px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Total Neto</th>
            </tr>
          </thead>
          <tbody>
  `;

  let empleadosMostrados = 0;
  let sumatoriaTotalNeto = 0; // 🔥 NUEVO: Acumulador del Total a Pagar

  // 2. LLENAMOS LAS FILAS DE LA TABLA
  listaNomina.forEach((empData) => {
    // Filtro de seguridad: Si no es Camilo, solo ve su propia fila
    if (!isCamilo && empData.empleado !== userActivo) return;
    empleadosMostrados++;

    let ganado = parseFloat(empData.ganado) || 0;
    let desc = parseFloat(empData.descontado) || 0;
    let neto = parseFloat(empData.neto) || 0;
    let colorNeto = neto >= 0 ? "var(--text-primary)" : "var(--ios-red)";

    // Sumamos al total global de la quincena (solo valores positivos)
    if (neto > 0) {
      sumatoriaTotalNeto += neto;
    }

    // 💳 Botón de Nequi Compacto
    let nequiNum = numerosNequi[empData.empleado];
    let nequiHtml = "";
    if (nequiNum) {
      nequiHtml = `
        <div style="display:inline-flex; align-items:center; gap:4px; margin-top: 4px; background:rgba(224, 0, 150, 0.1); padding:2px 6px; border-radius:6px; border: 1px solid rgba(224, 0, 150, 0.2);">
          <span style="color:#ff37a6; font-size:0.6rem; font-weight:800;">NEQUI</span>
          <span style="color:var(--text-primary); font-size:0.75rem; font-family:monospace; font-weight:bold;">${nequiNum}</span>
          <button style="background:transparent; border:none; padding:0; color:var(--text-secondary); cursor:pointer;" onclick="copiarTextoRapido(this, '${nequiNum}')" title="Copiar Nequi">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
        </div>
      `;
    }

    html += `
      <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.03); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
        <td style="padding: 16px;">
          <div style="font-weight: 800; color: var(--text-primary); font-size: 0.95rem; text-transform: uppercase;">${empData.empleado}</div>
          ${nequiHtml}
        </td>
        <td style="padding: 16px; font-family: monospace;">
          <div style="color: var(--ios-green); font-weight: 700; font-size: 0.85rem;">+$${Math.round(ganado).toLocaleString("es-CO")}</div>
          <div style="color: var(--ios-red); font-weight: 700; font-size: 0.85rem;">-$${Math.round(desc).toLocaleString("es-CO")}</div>
        </td>
        <td style="padding: 16px; color: ${colorNeto}; font-weight: 800; font-size: 1.15rem; font-family: monospace;">
          $${Math.round(neto).toLocaleString("es-CO")}
        </td>
      </tr>
    `;
  });

  // 🔥 NUEVO: Fila final con la SUMA TOTAL de todo lo que se debe pagar
  if (isCamilo && empleadosMostrados > 0) {
    html += `
      <tr style="background: rgba(0, 0, 0, 0.2); border-top: 2px solid rgba(255, 255, 255, 0.1);">
        <td colspan="2" style="padding: 16px; text-align: right; color: var(--text-secondary); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
          Total Nómina a Pagar:
        </td>
        <td style="padding: 16px; color: var(--ios-green); font-weight: 900; font-size: 1.3rem; font-family: monospace;">
          $${Math.round(sumatoriaTotalNeto).toLocaleString("es-CO")}
        </td>
      </tr>
    `;
  }

  html += `
          </tbody>
        </table>
      </div>
    </div>
  `;

  if (empleadosMostrados === 0) {
    html =
      "<div class='empty-log-msg'>No se encontraron tus registros de nómina.</div>";
  }

  // 3. AGREGAMOS EL DETALLE DE LOS DESCUENTOS
  let detallesFiltrados = (detalles || []).filter(
    (d) => isCamilo || d.empleado === userActivo,
  );

  if (detallesFiltrados.length > 0) {
    html += `
      <div style="margin-top: 20px;">
        <h4 style="color: var(--ios-orange); font-size: 0.85rem; margin-bottom: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Historial de Descuentos</h4>
        <div style="display: flex; flex-direction: column; gap: 6px;">
    `;
    detallesFiltrados.forEach((d) => {
      html += `
        <div style="background: rgba(255, 159, 10, 0.05); border: 1px solid rgba(255, 159, 10, 0.15); padding: 10px 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; flex-direction: column;">
            <strong style="color: var(--text-primary); font-size: 0.85rem;">${isCamilo ? d.empleado : d.detalle.split("-")[0].trim()}</strong>
            <span style="color: var(--text-secondary); font-size: 0.7rem;">${d.fecha} | ${d.detalle.includes("-") ? d.detalle.split("-")[1].trim() : ""}</span>
          </div>
          <strong style="color: var(--ios-red); font-size: 0.95rem; font-family: monospace;">-$${Math.round(d.monto).toLocaleString("es-CO")}</strong>
        </div>
      `;
    });
    html += `</div></div>`;
  }

  document.getElementById("nominaContentArea").innerHTML = html;
}

// 🔥 LÓGICA QUE SE EJECUTA AL DARLE CLIC A "PAGAR NÓMINA"
window.pagarNominaEmpleado = function (empleado, netoAPagar) {
  if (
    !confirm(
      `ATENCIÓN CAMILO:\n\n¿Estás seguro de liquidar y PAGAR a ${empleado} la suma de $${Math.round(netoAPagar).toLocaleString("es-CO")}?\n\nEsto borrará todos sus turnos y descuentos de la quincena actual y lo registrará en Finanzas.`,
    )
  )
    return;

  haptic();
  const btnRef = document.querySelector(
    "#nominaOverlay .btn-ios.btn-secondary",
  );
  if (btnRef) btnRef.innerHTML = "Pagando...";

  const cbName = "cb_pagar_nom_" + Date.now();
  window[cbName] = function (res) {
    const node = document.getElementById("node_" + cbName);
    if (node) node.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Nómina pagada a ${empleado}</span></div>`,
      );
      refrescarTotalNominaEnVivo(btnRef);
      forzarRefrescoDeHoras(); // Refresca la tabla de atrás también
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de red"));
      if (btnRef) btnRef.innerHTML = "Refrescar";
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=pagarNominaEmpleado&empleado=${encodeURIComponent(empleado)}&monto=${encodeURIComponent(netoAPagar)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// =========================================================================
// 💸 APLICAR ADELANTOS O DESCUENTOS A LA NÓMINA DE UN EMPLEADO
// =========================================================================
function ejecutarDescuentoNominaManual(e) {
  e.preventDefault();
  if (typeof haptic === "function") haptic();

  const empleado = document.getElementById("descNomEmpleado").value;
  const tipo = document.getElementById("descNomTipo").value; // Extrae si es ADELANTO o DESCUENTO
  const montoRaw = document.getElementById("descNomMonto").value;
  let concepto = document.getElementById("descNomConcepto").value;

  // Limpiamos el formato de moneda para enviar solo el número al backend
  const monto = parseFloat(montoRaw.replace(/[^0-9]/g, ""));

  if (!empleado || isNaN(monto) || monto <= 0 || concepto.trim() === "") {
    alert("⚠️ Por favor completa todos los campos correctamente.");
    return;
  }

  // Unimos el tipo con el concepto para que en tu Excel se lea claro: "ADELANTO - Préstamo"
  const conceptoFinal = `${tipo} - ${concepto.trim()}`;

  const btn = document.getElementById("btnSubmitDescNom");
  const originalText = btn.innerHTML;
  btn.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:6px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg> Aplicando...`;
  btn.disabled = true;

  const scriptNode = document.createElement("script");
  const callbackName = "cbDescNom_" + Date.now();

  window[callbackName] = function (res) {
    btn.innerHTML = originalText;
    btn.disabled = false;
    delete window[callbackName];
    scriptNode.remove();

    if (res && res.status === "success") {
      alert(
        `✅ ${tipo} de $${monto.toLocaleString("es-CO")} aplicado correctamente a ${empleado}.\n\nSe descontará automáticamente de su nómina.`,
      );

      // Limpiar campos
      document.getElementById("descNomMonto").value = "";
      document.getElementById("descNomConcepto").value = "";

      // 🔥 Si tienes la función para refrescar la nómina, la llamamos aquí
      if (typeof refrescarTotalNominaEnVivo === "function") {
        const refreshBtn = document.querySelector(
          "#nominaOverlay .btn-secondary",
        );
        if (refreshBtn) refrescarTotalNominaEnVivo(refreshBtn);
      }
    } else {
      alert("❌ ERROR:\n\n" + (res ? res.message : "Desconocido"));
    }
  };

  scriptNode.id = "script_desc_nom";
  scriptNode.src =
    GOOGLE_SCRIPT_URL +
    "?action=agregarDescuentoNomina&empleado=" +
    encodeURIComponent(empleado) +
    "&monto=" +
    encodeURIComponent(monto) +
    "&concepto=" +
    encodeURIComponent(conceptoFinal) +
    "&callback=" +
    callbackName +
    "&_ts=" +
    Date.now();
  document.body.appendChild(scriptNode);
}
// =========================================================================
// LÓGICA: CAMBIO DE CUENTA INTERACTIVO (CELULAR OBLIGATORIO)
// =========================================================================
function toggleCambioPanel() {
  haptic();
  document.getElementById("cambioCuentaOverlay").classList.toggle("open");
}

// =========================================================================
// MOTOR DINÁMICO: CAMBIOS MÚLTIPLES
// =========================================================================
function agregarBloqueCambioNuevo() {
  haptic();
  const contenedor = document.getElementById("contenedorListaCambios");
  const numero = contenedor.children.length + 1;

  const div = document.createElement("div");
  div.className = "card-ios bloque-cambio-item";
  div.style =
    "padding:12px; border-left: 4px solid var(--ios-blue); background: rgba(10, 132, 255, 0.03); margin-bottom:0; position:relative;";

  div.innerHTML = `
            <button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:8px; right:8px; background:var(--ios-red); color:white; border:none; border-radius:50%; width:20px; height:20px; font-size:10px; font-weight:bold;">✕</button>
            <div class="flex-row-between mb-1">
                <span style="font-size:0.7rem; font-weight:800; color:var(--ios-blue);">PLATAFORMA #${numero}</span>
            </div>
            <select class="input-ios sel-plat-vieja" style="margin-bottom:8px;" required>
                <option value="" disabled selected>Devolver plataforma...</option>
                <option value="NETFLIX">NETFLIX</option>
                <option value="AMAZON-PRIME-VIDEO">AMAZON</option>
                <option value="DISNEY-PREMIUM">DISNEY PREMIUM</option>
                <option value="HBO-MAX">MAX</option>
                <option value="DISNEY-ESTANDAR">DISNEY ESTÁNDAR</option>
                <option value="PARAMOUNT">PARAMOUNT</option>
                <option value="VIX">VIX</option>
                <option value="CRUNCHYROLL">CRUNCHYROLL</option>
                <option value="PLEX">PLEX</option>
            </select>
            <input type="email" class="input-ios inp-correo-viejo" style="margin-bottom:8px;" placeholder="Correo actual de la cuenta" required>
            <select class="input-ios sel-plat-nueva" style="margin-bottom:0;" required>
                <option value="" disabled selected>Nueva plataforma a entregar...</option>
                <option value="NETFLIX">NETFLIX</option>
                <option value="AMAZON-PRIME-VIDEO">AMAZON</option>
                <option value="DISNEY-PREMIUM">DISNEY PREMIUM</option>
                <option value="HBO-MAX">MAX</option>
                <option value="DISNEY-ESTANDAR">DISNEY ESTÁNDAR</option>
                <option value="PARAMOUNT">PARAMOUNT</option>
                <option value="VIX">VIX</option>
                <option value="CRUNCHYROLL">CRUNCHYROLL</option>
                <option value="PLEX">PLEX</option>
            </select>
          `;
  contenedor.appendChild(div);
}

function ejecutarCambioCuenta(e) {
  e.preventDefault();
  haptic();

  const btn = document.getElementById("btnProcesarCambio");
  const telCliente = document.getElementById("cambioTelCliente").value.trim();
  const nombreCliente = document
    .getElementById("cambioNombreCliente")
    .value.trim();

  // Recolectar todos los bloques de cambio
  const bloques = document.querySelectorAll(".bloque-cambio-item");
  let cambiosArray = [];

  bloques.forEach((bloque) => {
    cambiosArray.push({
      platVieja: bloque.querySelector(".sel-plat-vieja").value,
      correoViejo: bloque.querySelector(".inp-correo-viejo").value.trim(),
      platNueva: bloque.querySelector(".sel-plat-nueva").value,
    });
  });

  if (cambiosArray.length === 0) return;

  if (
    !confirm(
      `¿Confirmas el procesamiento de ${cambiosArray.length} cambio(s) para el cliente ${telCliente}?`,
    )
  )
    return;

  btn.disabled = true;
  btn.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Procesando...`;

  const cbName = "cb_lote_" + Date.now();
  window[cbName] = function (res) {
    btn.disabled = false;
    btn.innerText = "PROCESAR CAMBIOS EN LOTE";
    const node = document.getElementById("node_" + cbName);
    if (node) node.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      // 🔥 ENCABEZADO IDÉNTICO A TU NUEVA PLANTILLA 🔥
      let nombreSaludo = nombreCliente ? " " + nombreCliente : "";
      let fichaFinal = `🌟 *¡Hola${nombreSaludo}!*\n\nTu pedido ha sido procesado con éxito. Aquí tienes tus accesos:`;

      res.data.forEach((d) => {
        let perfilTexto = d.perfil ? `\n🌐 *Perfil:* ${d.perfil}` : "";
        if (d.pin) {
          perfilTexto += ` | *PIN:* ${d.pin}`;
        }

        fichaFinal += `\n\n🎬 *DETALLES DE ${d.plataforma}* ✅\n────────────────────\n`;

        // ⚠️ ADVERTENCIA ARRIBA (SOLO NETFLIX)
        if (d.plataforma === "NETFLIX") {
          fichaFinal += `⚠️ *Para iniciar sesión:* Cuando te pida un código, selecciona *Obtener ayuda* y después *Usar contraseña*.\n\n`;
        }

        // DATOS EN NEGRITA
        fichaFinal += `👤 *Correo:* ${d.correo}\n🔐 *Contraseña:* ${d.clave}${perfilTexto}\n📅 *Vence:* ${d.vencimiento}\n`;

        // 🤖 BOT DE CÓDIGOS ABAJO (SOLO NETFLIX)
        if (d.plataforma === "NETFLIX") {
          fichaFinal += `\n🤖 *¿NECESITAS UN CÓDIGO?* Puedes usar nuestra pagina para codigos disponible 24/7: www.cybernetsp.com/`;
        }
      });

      fichaFinal += `\n\n📢 *INFORMACIÓN IMPORTANTE:* \n────────────────────\n⚠️ *Garantía activa:* Tu servicio cuenta con respaldo total durante su vigencia. \n🆘 *Soporte:* Si presentas algún inconveniente, *infórmanos de inmediato* para brindarte una solución rápida.\n\n💎 *Disfruta tu servicio.*\n✨ *¡Gracias por elegirnos!* ✨`;
      document.getElementById("cambioCuentaOverlay").classList.remove("open");
      document.getElementById("outputTextoVentaFicha").value = fichaFinal;

      const modalExito = document.getElementById("ventaGeneradaModalOverlay");
      modalExito.querySelector(".card-title").innerText = "Cambio Exitoso";
      document.getElementById("btnCopiarFichaVenta").innerHTML =
        `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar Ficha Completa`;

      let btnSaldo = document.getElementById("btnCopiarSaldoRevendedor");
      if (btnSaldo) btnSaldo.style.display = "none";

      modalExito.classList.add("open");

      // Resetear el formulario a su estado original
      document.getElementById("contenedorListaCambios").innerHTML = `
                  <div class="card-ios bloque-cambio-item" style="padding:12px; border-left: 4px solid var(--ios-orange); background: rgba(255, 149, 0, 0.03); margin-bottom:0;">
                    <div class="flex-row-between mb-1"><span style="font-size:0.7rem; font-weight:800; color:var(--ios-orange);">PLATAFORMA #1</span></div>
                    <select class="input-ios sel-plat-vieja" style="margin-bottom:8px;" required><option value="" disabled selected>Devolver plataforma...</option><option value="NETFLIX">NETFLIX</option><option value="AMAZON-PRIME-VIDEO">AMAZON</option><option value="DISNEY-PREMIUM">DISNEY PREMIUM</option><option value="HBO-MAX">MAX</option><option value="DISNEY-ESTANDAR">DISNEY ESTÁNDAR</option><option value="PARAMOUNT">PARAMOUNT</option><option value="VIX">VIX</option><option value="CRUNCHYROLL">CRUNCHYROLL</option><option value="PLEX">PLEX</option></select>
                    <input type="email" class="input-ios inp-correo-viejo" style="margin-bottom:8px;" placeholder="Correo actual de la cuenta" required>
                    <select class="input-ios sel-plat-nueva" style="margin-bottom:0;" required><option value="" disabled selected>Nueva plataforma a entregar...</option><option value="NETFLIX">NETFLIX</option><option value="AMAZON-PRIME-VIDEO">AMAZON</option><option value="DISNEY-PREMIUM">DISNEY PREMIUM</option><option value="HBO-MAX">MAX</option><option value="DISNEY-ESTANDAR">DISNEY ESTÁNDAR</option><option value="PARAMOUNT">PARAMOUNT</option><option value="VIX">VIX</option><option value="CRUNCHYROLL">CRUNCHYROLL</option><option value="PLEX">PLEX</option></select>
                  </div>`;
      document.getElementById("cambioTelCliente").value = "";
      document.getElementById("cambioNombreCliente").value = "";
    } else {
      alert(
        "❌ Error: " +
          (res
            ? res.message
            : "Fallo de conexión. No se pudo procesar el lote."),
      );
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=cambiarCuenta&telCliente=${encodeURIComponent(telCliente)}&nombreCliente=${encodeURIComponent(nombreCliente)}&cambiosJSON=${encodeURIComponent(JSON.stringify(cambiosArray))}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

// Variable máster de control para el loop del radar de verificación
window.verificationLinkInterval = null;

function iniciarCreacionCuentaNetflix(btn) {
  if (typeof haptic === "function") haptic();
  const contenidoOriginal = btn.innerHTML;

  // 🛡️ REVISAR SI HAY UNA CUENTA PENDIENTE EN MEMORIA
  let pendienteGuardada = localStorage.getItem("cyber_netflix_pendiente");
  if (pendienteGuardada) {
    let d = JSON.parse(pendienteGuardada);

    // Ponemos el botón en modo de escaneo
    btn.style.pointerEvents = "none";
    btn.innerHTML = `<div style="text-align:center; width:100%; padding: 14px;"><svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ios-orange)" stroke-width="2.5" style="margin-right:8px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> <span style="color:var(--ios-orange); font-weight:bold;">Verificando estado en la base...</span></div>`;

    const cbCheck = "cb_check_" + Date.now();
    window[cbCheck] = function (res) {
      btn.style.pointerEvents = "auto";
      btn.innerHTML = contenidoOriginal;

      const node = document.getElementById("node_" + cbCheck);
      if (node) node.remove();
      delete window[cbCheck];

      if (res && res.status === "success" && res.existe) {
        // La cuenta sigue en el Excel: Forzamos a terminar de guardarla
        alert(
          "⚠️ Se ha detectado una cuenta de Netflix previamente generada que NO fue guardada en el inventario maestro.\n\nEl sistema la recuperará obligatoriamente para que finalices el proceso.",
        );
        restaurarInterfazCuentaGenerada(d, btn);
      } else {
        // 🧹 MAGIA AQUÍ: La cuenta ya no existe en Sheets (la borraste). Limpiamos la caché y creamos una nueva libremente.
        localStorage.removeItem("cyber_netflix_pendiente");
        ejecutarGeneracionNuevaCuenta(btn, contenidoOriginal);
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbCheck;
    script.src = `${GOOGLE_SCRIPT_URL}?action=verificarCuentaPines&correo=${encodeURIComponent(d.correo)}&callback=${cbCheck}&_ts=${Date.now()}`;
    document.body.appendChild(script);
    return;
  }

  // Si no hay nada en memoria, va directo a crear la nueva
  ejecutarGeneracionNuevaCuenta(btn, contenidoOriginal);
}

// Sub-función que aísla la carga de la cuenta (Mantiene el código limpio)
function ejecutarGeneracionNuevaCuenta(btn, contenidoOriginal) {
  let preConfirmacion = confirm(
    "❓ ¿Estás seguro de que deseas CREAR UNA CUENTA NUEVA de Netflix en este momento?\n\n(Esto procesará un PIN de Refácil e iniciará la creación del correo)",
  );

  if (!preConfirmacion) return;

  btn.style.pointerEvents = "none";
  btn.innerHTML = `<div style="text-align:center; width:100%; padding: 14px;"><svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ios-blue)" stroke-width="2.5" style="margin-right:8px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> <span style="color:var(--ios-blue); font-weight:bold;">Generando credenciales...</span></div>`;

  // 🔒 RESET DE RADAR E INVENTARIO
  document
    .getElementById("radarVerificacionContenedor")
    .style.setProperty("display", "flex", "important");
  document
    .getElementById("radarVerificacionSpinner")
    .style.setProperty("display", "flex", "important");
  document.getElementById("radarVerificacionSpinner").innerHTML =
    `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Sincronizando con Gmail... Esperando correo de Netflix`;
  document
    .getElementById("btnLinkVerificarGmail")
    .style.setProperty("display", "none", "important");
  document
    .getElementById("btnGuardarMaestroNetflix")
    .style.setProperty("display", "none", "important");

  if (window.verificationLinkInterval)
    clearInterval(window.verificationLinkInterval);

  const cbName = "cb_gen_cta_" + Date.now();
  window[cbName] = function (res) {
    btn.style.pointerEvents = "auto";
    btn.innerHTML = contenidoOriginal;

    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success" && res.data) {
      const d = res.data;

      if (d.pinRecarga && d.pinRecarga.includes("Sin PIN")) {
        alert(
          "❌ ERROR: No hay PINES de activación disponibles en la base de datos.",
        );
        return;
      }

      // 🔥 GUARDAR EN MEMORIA LOCAL PARA QUE NUNCA SE PIERDA
      localStorage.setItem("cyber_netflix_pendiente", JSON.stringify(d));

      restaurarInterfazCuentaGenerada(d, btn);
    } else {
      alert(
        "❌ Error del Servidor: " + (res ? res.message : "Fallo desconocido."),
      );
    }
  };

  const empleadoActivo =
    sessionStorage.getItem("active_staff") || "Admin/Camilo";

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=generarNuevaCuenta&user=${encodeURIComponent(empleadoActivo)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

// 🔥 FUNCIÓN MÁSTER: Pinta la pantalla tanto al crear como al restaurar
function restaurarInterfazCuentaGenerada(d, btnOrigen) {
  document.getElementById("displayCtaCorreo").innerText = d.correo;
  document.getElementById("displayCtaClave").innerText = d.clave;
  document.getElementById("displayCtaPinRecarga").innerText = d.pinRecarga;

  // 📡 EL RADAR INICIA AUTOMÁTICAMENTE
  window.lanzarRadarEspiaVerificacionGmail(d.correo);

  const btnGuardar = document.getElementById("btnGuardarMaestroNetflix");
  btnGuardar.onclick = function () {
    guardarCuentaConfirmadaNetflix(
      btnGuardar,
      "Guardar en Inventario Maestro",
      d,
    );
  };

  const modal =
    document.getElementById("cuentaGeneradaModalOverlay") ||
    document.getElementById("cuentaGeneratedModalOverlay");
  if (modal) modal.classList.add("open");
}

window.lanzarRadarEspiaVerificacionGmail = function (correoTarget) {
  window.verificationLinkInterval = setInterval(function () {
    const cbRadarName = "cb_radar_verify_" + Date.now();

    window[cbRadarName] = function (res) {
      const node = document.getElementById("node_" + cbRadarName);
      if (node) node.remove();
      delete window[cbRadarName];

      if (res && res.status === "success" && res.link) {
        if (
          res.correoOriginal &&
          res.correoOriginal.toLowerCase() !== correoTarget.toLowerCase()
        ) {
          console.log(
            "Se detectó un link, pero es de otro correo. Ignorando...",
          );
          return;
        }

        clearInterval(window.verificationLinkInterval);

        if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");

        document
          .getElementById("radarVerificacionSpinner")
          .style.setProperty("display", "none", "important");

        const btnLink = document.getElementById("btnLinkVerificarGmail");
        btnLink.href = res.link;
        btnLink.style.setProperty("display", "inline-flex", "important");

        // 🎯 CANDADO MAESTRO INVERTIDO: Muestra el botón de Guardar
        btnLink.onclick = function () {
          if (typeof haptic === "function") haptic();
          document
            .getElementById("btnGuardarMaestroNetflix")
            .style.setProperty("display", "block", "important");
        };

        const contenedor = document.getElementById(
          "radarVerificacionContenedor",
        );
        contenedor.style.background = "rgba(48, 209, 88, 0.06)";
        contenedor.style.borderColor = "rgba(48, 209, 88, 0.35)";
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbRadarName;
    script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerLinkVerificacion&correo=${encodeURIComponent(correoTarget)}&callback=${cbRadarName}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  }, 4000);
};

function guardarCuentaConfirmadaNetflix(btn, contenidoOriginal, datosCuenta) {
  btn.disabled = true;
  btn.style.pointerEvents = "none";
  btn.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Guardando en Sheets...`;

  const cbName = "cb_save_cta_" + Date.now();
  window[cbName] = function (res) {
    btn.disabled = false;
    btn.style.pointerEvents = "auto";
    btn.innerHTML = "¡Guardado con Éxito!";
    btn.style.background = "var(--ios-green)";

    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      // 🔥 LIBERACIÓN DE MEMORIA: Al guardar con éxito borramos el bloqueo
      localStorage.removeItem("cyber_netflix_pendiente");

      // Cerramos la ventana forzosamente ahora que ya cumplió su deber
      window.cerrarModalCreacionNetflixTotalmente();

      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path></svg> <span>Cuenta inyectada al maestro.</span></div>`,
        );
      }
    } else {
      alert(
        "❌ Error al guardar en Sheets: " +
          (res
            ? res.message
            : "Fallo de comunicación. Intenta darle al botón Guardar de nuevo."),
      );
      btn.innerHTML = contenidoOriginal;
      btn.style.background = "";
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  const urlParams =
    `?action=confirmarGuardadoNetflix` +
    `&correo=${encodeURIComponent(datosCuenta.correo)}` +
    `&clave=${encodeURIComponent(datosCuenta.clave)}` +
    `&pinesPerfiles=${encodeURIComponent(JSON.stringify(datosCuenta.pinesPerfiles))}` +
    `&callback=${cbName}&_ts=${Date.now()}`;
  script.src = GOOGLE_SCRIPT_URL + urlParams;
  document.body.appendChild(script);
}

window.cerrarModalCreacionNetflixTotalmente = function () {
  if (typeof haptic === "function") haptic();
  if (window.verificationLinkInterval)
    clearInterval(window.verificationLinkInterval);

  const modal =
    document.getElementById("cuentaGeneradaModalOverlay") ||
    document.getElementById("cuentaGeneratedModalOverlay");
  if (modal) modal.classList.remove("open");
};

window.lanzarRadarEspiaVerificacionGmail = function (correoTarget) {
  window.verificationLinkInterval = setInterval(function () {
    const cbRadarName = "cb_radar_verify_" + Date.now();

    window[cbRadarName] = function (res) {
      const node = document.getElementById("node_" + cbRadarName);
      if (node) node.remove();
      delete window[cbRadarName];

      if (res && res.status === "success" && res.link) {
        // 👇 BLINDAJE EXTRA: Validar si la respuesta de Google Sheets nos devolvió
        // explícitamente el correo al que pertenece el link (si tu backend lo envía).
        // Si tu backend no envía "res.correoOriginal", igual lo dejará pasar, pero si lo envía, será estricto.
        if (
          res.correoOriginal &&
          res.correoOriginal.toLowerCase() !== correoTarget.toLowerCase()
        ) {
          console.log(
            "Se detectó un link, pero es de otro correo. Ignorando...",
          );
          return; // Ignora este link y sigue buscando en el próximo ciclo
        }

        clearInterval(window.verificationLinkInterval); // Apaga el bucle de búsqueda

        if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");

        document
          .getElementById("radarVerificacionSpinner")
          .style.setProperty("display", "none", "important");

        const btnLink = document.getElementById("btnLinkVerificarGmail");
        btnLink.href = res.link;
        btnLink.style.setProperty("display", "inline-flex", "important");

        // 🎯 CANDADO MAESTRO INVERTIDO
        btnLink.onclick = function () {
          if (typeof haptic === "function") haptic();
          document
            .getElementById("btnGuardarMaestroNetflix")
            .style.setProperty("display", "block", "important");
        };

        const contenedor = document.getElementById(
          "radarVerificacionContenedor",
        );
        contenedor.style.background = "rgba(48, 209, 88, 0.06)";
        contenedor.style.borderColor = "rgba(48, 209, 88, 0.35)";
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbRadarName;
    // Mandamos el correo al backend para que busque ese en específico
    script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerLinkVerificacion&correo=${encodeURIComponent(correoTarget)}&callback=${cbRadarName}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  }, 4000); // Rastreando la bandeja cada 4 segundos
};

window.cerrarModalCreacionNetflixTotalmente = function () {
  if (typeof haptic === "function") haptic();
  if (window.verificationLinkInterval)
    clearInterval(window.verificationLinkInterval);

  const modal =
    document.getElementById("cuentaGeneratedModalOverlay") ||
    document.getElementById("cuentaGeneradaModalOverlay");
  if (modal) modal.classList.remove("open");
};

window.cerrarModalCreacionNetflixTotalmente = function () {
  if (typeof haptic === "function") haptic();
  if (window.verificationLinkInterval)
    clearInterval(window.verificationLinkInterval);

  const modal =
    document.getElementById("cuentaGeneratedModalOverlay") ||
    document.getElementById("cuentaGeneradaModalOverlay");
  if (modal) modal.classList.remove("open");
};

function copiarDatoCuentaNueva(btn, idElemento) {
  if (typeof haptic === "function") haptic();
  let texto = document.getElementById(idElemento).innerText;

  navigator.clipboard.writeText(texto).then(function () {
    let originalText = btn.innerHTML;
    btn.innerHTML = "¡Listo!";
    btn.style.background = "var(--ios-green)";
    btn.style.color = "#ffffff";

    setTimeout(function () {
      btn.innerHTML = originalText;
      btn.style.background = "";
      btn.style.color = "";
    }, 1000);

    // 🔥 NUEVA LÓGICA: Si lo que se copió fue el correo, abre la limpieza de cookies
    if (idElemento === "displayCtaCorreo") {
      window.open("https://netflix.com/clearcookies", "_blank");
    }
  });
}
function copiarTextoAisladoDirecto(elemento, texto) {
  if (typeof haptic === "function") haptic();
  navigator.clipboard.writeText(texto).then(function () {
    let originalText = elemento.innerText;
    elemento.innerText = "¡Copiado!";
    elemento.style.color = "var(--ios-green)";
    setTimeout(function () {
      elemento.innerText = originalText;
      elemento.style.color = "var(--ios-blue)";
    }, 1000);
  });
}

// =========================================================================
// MÓDULO WEB INTEGRADO: MOTOR DE PROMOCIONES MASIVAS
// =========================================================================
let isFetchingPromo = false;
let globalContactsPromo = [];
let currentBlockIndexPromo = 0;
const CHUNK_SIZE_PROMO = 10;

function togglePromoPanel() {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("promoOverlay");
  if (overlay) overlay.classList.toggle("open");
}

function iniciarSincronizacionPromo() {
  if (isFetchingPromo) return;

  if (typeof haptic === "function") haptic();
  isFetchingPromo = true;
  globalContactsPromo = [];
  currentBlockIndexPromo = 0;

  const btn = document.getElementById("btnFetchContacts");
  const badge = document.getElementById("badgeTotalClients");
  const blockContainer = document.getElementById("blockButtonsContainer");
  const gridContainer = document.getElementById("promoGridContainer");

  btn.disabled = true;
  btn.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 8px; vertical-align: middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Generando Promo...`;

  blockContainer.innerHTML = "";

  // 🔥 Carga centrada al 100% 🔥
  gridContainer.innerHTML = `
          <div class="status-empty" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--ios-blue); grid-column: 1 / -1; min-height: 200px;">
              <svg class="spin-anim" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
              <span style="font-weight: 600;">Extrayendo clientes...</span>
          </div>`;
  badge.innerText = "0 clientes";

  const oldScript = document.getElementById("cyber_promo_node");
  if (oldScript) oldScript.remove();

  window.procesarSincronizacionPromo = function (res) {
    isFetchingPromo = false;
    btn.disabled = false;
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 6px; vertical-align: middle;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> Generar Promo 60/40`;

    const scriptNode = document.getElementById("cyber_promo_node");
    if (scriptNode) scriptNode.remove();

    if (res && res.status === "success") {
      let data = res.data;
      if (!data || data.length === 0) {
        gridContainer.innerHTML = `<div class="status-empty" style="color:var(--ios-orange); font-weight: 600; grid-column: 1 / -1; min-height: 200px;">No quedan clientes disponibles en el Histórico.</div>`;
        return;
      }

      let uniqueMap = new Map();
      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        let tel = String(item.tel || "");
        if (tel.trim() !== "" && !uniqueMap.has(tel.trim())) {
          uniqueMap.set(tel.trim(), item);
        }
      }

      globalContactsPromo = Array.from(uniqueMap.values()).slice(0, 20);

      if (globalContactsPromo.length === 0) {
        gridContainer.innerHTML = `<div class="status-empty" style="color:var(--ios-red); font-weight: 600; grid-column: 1 / -1; min-height: 200px;">Registros inválidos en la base de datos.</div>`;
        return;
      }

      badge.innerText = `${globalContactsPromo.length} clientes`;
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Se prepararon ${globalContactsPromo.length} contactos.</span></div>`,
        );
      }

      crearBotonesBloquesPromo();
    } else {
      let errMsg = res && res.message ? res.message : "Error de conexión.";
      gridContainer.innerHTML = `<div class="status-empty" style="color:var(--ios-red); font-weight: 600; grid-column: 1 / -1; min-height: 200px;">${errMsg}</div>`;
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_promo_node";
  scriptElement.src =
    GOOGLE_SCRIPT_URL +
    "?action=generarPromosWeb&callback=procesarSincronizacionPromo&_ts=" +
    Date.now();
  document.body.appendChild(scriptElement);
}

function crearBotonesBloquesPromo() {
  const blockContainer = document.getElementById("blockButtonsContainer");
  blockContainer.innerHTML = "";

  // Contenedor en columna para los botones
  blockContainer.style.display = "flex";
  blockContainer.style.flexDirection = "column";
  blockContainer.style.gap = "8px";

  const totalBlocks = Math.ceil(globalContactsPromo.length / CHUNK_SIZE_PROMO);

  for (let i = 0; i < totalBlocks; i++) {
    let start = i * CHUNK_SIZE_PROMO + 1;
    let end = Math.min((i + 1) * CHUNK_SIZE_PROMO, globalContactsPromo.length);

    // 🔥 BOTÓN ÚNICO FUSIONADO (Muestra y Copia al mismo tiempo) 🔥
    const btn = document.createElement("button");
    btn.className = "btn-ios btn-secondary";
    btn.style.width = "100%";
    btn.style.padding = "14px";
    btn.style.margin = "0";
    btn.style.background = "rgba(10, 132, 255, 0.1)";
    btn.style.color = "var(--ios-blue)";
    btn.style.borderColor = "rgba(10, 132, 255, 0.2)";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.gap = "8px";
    btn.style.fontSize = "0.95rem";
    btn.style.fontWeight = "700";

    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar Nums Wa.me (${start}-${end})`;

    btn.onclick = function () {
      mostrarBloquePromo(i); // Actualiza la lista en pantalla
      copiarBloqueNumerosPromoIndex(this, i); // Copia al portapapeles con animación
    };

    blockContainer.appendChild(btn);
  }
  mostrarBloquePromo(0);
}

function mostrarBloquePromo(blockIndex) {
  if (typeof haptic === "function") haptic();
  currentBlockIndexPromo = blockIndex;

  const allBtns = document.querySelectorAll(
    "#blockButtonsContainer .btn-block",
  );
  allBtns.forEach((b) => b.classList.remove("active"));
  const activeBtn = document.getElementById(`btnBlockPromo_${blockIndex}`);
  if (activeBtn) activeBtn.classList.add("active");

  const startIndex = blockIndex * CHUNK_SIZE_PROMO;
  const endIndex = startIndex + CHUNK_SIZE_PROMO;
  const loteActual = globalContactsPromo.slice(startIndex, endIndex);

  const gridContainer = document.getElementById("promoGridContainer");
  gridContainer.innerHTML = "";

  loteActual.forEach((item, localIndex) => {
    const absoluteIndex = startIndex + localIndex;
    const visualIndex = absoluteIndex + 1;

    // 🔥 Uso de String() para evitar crasheos silenciosos por formatos de Google Sheets 🔥
    let telSeguro = String(item.tel || "");

    const card = document.createElement("div");
    card.className = "contact-card";
    card.style.padding = "10px 14px";
    card.innerHTML = `
              <div class="contact-left">
                  <div class="index-badge" style="width:26px; height:26px; font-size:0.8rem;">${visualIndex}</div>
                  <div class="phone-text" id="phone_text_promo_${absoluteIndex}" style="font-size:0.95rem;">${telSeguro}</div>
              </div>
              <div class="contact-right">
                  <button class="btn-icon" title="Copiar Mensaje de Promo" onclick="copiarMensajePromoIndividual(this, ${absoluteIndex})">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  </button>
              </div>
          `;
    gridContainer.appendChild(card);
  });
}

// 🔥 FUNCIÓN: Copia el mensaje individual usando la variable en memoria para evitar fallos de salto de línea
function copiarMensajePromoIndividual(btnElement, index) {
  if (typeof haptic === "function") haptic();
  let item = globalContactsPromo[index];
  if (!item) return;

  let textoToCopy = String(item.mensaje || "");

  navigator.clipboard
    .writeText(textoToCopy)
    .then(() => {
      efectoBotonExitoPromo(btnElement);
      marcarNumeroComoEnviadoPromo(index);
    })
    .catch(() => {
      const textarea = document.createElement("textarea");
      textarea.value = textoToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();

      efectoBotonExitoPromo(btnElement);
      marcarNumeroComoEnviadoPromo(index);
    });
}

// 🔥 FUNCIÓN: Copia el bloque de Wa.me completo según el índice que tocaste
function copiarBloqueNumerosPromoIndex(btn, blockIndex) {
  if (typeof haptic === "function") haptic();
  if (!globalContactsPromo || globalContactsPromo.length === 0) return;

  const startIndex = blockIndex * CHUNK_SIZE_PROMO;
  const endIndex = startIndex + CHUNK_SIZE_PROMO;
  const loteActual = globalContactsPromo.slice(startIndex, endIndex);

  let texto = "";
  loteActual.forEach((item, idx) => {
    let telStr = String(item.tel || "");
    let telLimpio = telStr.replace(/\D/g, "");
    if (telLimpio !== "" && !telLimpio.startsWith("57"))
      telLimpio = "57" + telLimpio;

    texto += `${startIndex + idx + 1}. wa.me/${telLimpio}\n`;
  });

  navigator.clipboard
    .writeText(texto)
    .then(() => {
      let originalHTML = btn.innerHTML;
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡COPIADO!`;
      btn.style.background = "var(--ios-green)";
      btn.style.color = "white";
      btn.style.borderColor = "transparent";

      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Bloque ${blockIndex + 1} copiado</span></div>`,
        );
      }

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = "rgba(10, 132, 255, 0.1)";
        btn.style.color = "var(--ios-blue)";
        btn.style.borderColor = "rgba(10, 132, 255, 0.2)";
      }, 1500);
    })
    .catch((err) => alert("Error al copiar bloque."));
}

function marcarNumeroComoEnviadoPromo(index) {
  const phoneEl = document.getElementById("phone_text_promo_" + index);
  if (phoneEl) phoneEl.classList.add("crossed-out");
}

function efectoBotonExitoPromo(btn) {
  const originalHTML = btn.innerHTML;
  btn.classList.add("success");
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px; height:18px;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  setTimeout(() => {
    btn.classList.remove("success");
    btn.innerHTML = originalHTML;
  }, 1500);
}
// =========================================================================
// MÓDULO WEB INTEGRADO: RECORDATORIOS DE PAGO (W1 & W2)
// =========================================================================
window.estadoW1 = { data: [], tachados: new Set(), periodo: "hoy" };
window.estadoW2 = { data: [], tachados: new Set(), periodo: "tres_dias" };

function toggleRecordatoriosPanel() {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("recordatoriosOverlay");
  if (overlay) overlay.classList.toggle("open");
}

function guardarEstadoRecordatorios(refName) {
  let estado = refName === "W1" ? window.estadoW1 : window.estadoW2;
  let obj = {
    data: estado.data,
    tachados: Array.from(estado.tachados),
    periodo: document.getElementById("periodo" + refName).value,
  };
  localStorage.setItem("cyber_reminders_" + refName, JSON.stringify(obj));
}

function cargarEstadoRecordatorios() {
  ["W1", "W2"].forEach((refName) => {
    let guardado = localStorage.getItem("cyber_reminders_" + refName);
    if (guardado) {
      let parsed = JSON.parse(guardado);
      let estado = refName === "W1" ? window.estadoW1 : window.estadoW2;
      estado.data = parsed.data || [];
      estado.tachados = new Set(parsed.tachados || []);
      estado.periodo =
        parsed.periodo || (refName === "W1" ? "hoy" : "tres_dias");

      let selectEl = document.getElementById("periodo" + refName);
      if (selectEl) selectEl.value = estado.periodo;

      if (estado.data.length > 0) {
        document.getElementById("contador" + refName).innerText =
          `${estado.data.length} clientes`;
        renderizarBloquesRecordatorios(
          estado.data,
          "bloques" + refName,
          refName,
        );
        renderizarListaRecordatorios(
          estado,
          "listaIndividual" + refName,
          refName,
        );
      }
    }
  });
}

// Cargar el historial guardado cuando se cargue la página
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    cargarEstadoRecordatorios();
  }, 500);
});

function sincronizarW1() {
  if (typeof haptic === "function") haptic();
  const containerLista = document.getElementById("listaIndividualW1");
  const containerBloques = document.getElementById("bloquesW1");
  const periodo = document.getElementById("periodoW1").value;

  // Se le añade grid-column: 1 / -1; para centrarlo en la nueva rejilla
  containerLista.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-secondary); grid-column: 1 / -1;"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg><br>Escaneando Sheets...</div>`;
  containerBloques.innerHTML = `<div style="text-align:center; padding:15px; color:var(--text-secondary); font-size:0.85rem; grid-column: span 2;">Procesando...</div>`;

  const oldScript = document.getElementById("cyber_rem_w1");
  if (oldScript) oldScript.remove();

  window.cbRespuestaW1 = function (res) {
    const scriptNode = document.getElementById("cyber_rem_w1");
    if (scriptNode) scriptNode.remove();

    if (res && res.status === "success") {
      window.estadoW1.data = res.data;
      window.estadoW1.tachados = new Set();
      window.estadoW1.periodo = periodo;
      guardarEstadoRecordatorios("W1");

      document.getElementById("contadorW1").innerText =
        `${res.data.length} clientes`;

      if (res.data.length === 0) {
        containerLista.innerHTML = `<div style="text-align:center; padding:20px; color:var(--ios-green); font-weight:bold; grid-column: 1 / -1;">Todo limpio para W1.</div>`;
        containerBloques.innerHTML = "";
        return;
      }

      renderizarBloquesRecordatorios(window.estadoW1.data, "bloquesW1", "W1");
      renderizarListaRecordatorios(window.estadoW1, "listaIndividualW1", "W1");
    } else {
      containerLista.innerHTML = `<div style="text-align:center; padding:20px; color:var(--ios-red); grid-column: 1 / -1;">Error de conexión</div>`;
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_rem_w1";
  scriptElement.src = `${GOOGLE_SCRIPT_URL}?action=obtenerRecordatorios&periodo=${encodeURIComponent(periodo)}&callback=cbRespuestaW1&_ts=${Date.now()}`;
  document.body.appendChild(scriptElement);
}

function sincronizarW2() {
  if (typeof haptic === "function") haptic();
  const containerLista = document.getElementById("listaIndividualW2");
  const containerBloques = document.getElementById("bloquesW2");
  const periodo = document.getElementById("periodoW2").value;

  containerLista.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-secondary); grid-column: 1 / -1;"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg><br>Escaneando Sheets...</div>`;
  containerBloques.innerHTML = `<div style="text-align:center; padding:15px; color:var(--text-secondary); font-size:0.85rem; grid-column: span 2;">Procesando...</div>`;

  const oldScript = document.getElementById("cyber_rem_w2");
  if (oldScript) oldScript.remove();

  window.cbRespuestaW2 = function (res) {
    const scriptNode = document.getElementById("cyber_rem_w2");
    if (scriptNode) scriptNode.remove();

    if (res && res.status === "success") {
      window.estadoW2.data = res.data;
      window.estadoW2.tachados = new Set();
      window.estadoW2.periodo = periodo;
      guardarEstadoRecordatorios("W2");

      document.getElementById("contadorW2").innerText =
        `${res.data.length} clientes`;

      if (res.data.length === 0) {
        containerLista.innerHTML = `<div style="text-align:center; padding:20px; color:var(--ios-green); font-weight:bold; grid-column: 1 / -1;">Todo limpio para W2.</div>`;
        containerBloques.innerHTML = "";
        return;
      }

      renderizarBloquesRecordatorios(window.estadoW2.data, "bloquesW2", "W2");
      renderizarListaRecordatorios(window.estadoW2, "listaIndividualW2", "W2");
    } else {
      containerLista.innerHTML = `<div style="text-align:center; padding:20px; color:var(--ios-red); grid-column: 1 / -1;">Error de conexión</div>`;
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "cyber_rem_w2";
  scriptElement.src = `${GOOGLE_SCRIPT_URL}?action=obtenerRecordatorios&periodo=${encodeURIComponent(periodo)}&callback=cbRespuestaW2&_ts=${Date.now()}`;
  document.body.appendChild(scriptElement);
}
function renderizarBloquesRecordatorios(dataArray, contenedorId, refName) {
  const container = document.getElementById(contenedorId);
  container.innerHTML = "";

  let total = dataArray.length;
  let tamanoBloque = 20;
  let totalBloques = Math.ceil(total / tamanoBloque);

  for (let b = 0; b < totalBloques; b++) {
    let inicio = b * tamanoBloque + 1;
    let fin = Math.min((b + 1) * tamanoBloque, total);

    let btn = document.createElement("button");
    btn.className = "btn-ios btn-secondary";
    btn.style.fontSize = "0.85rem";
    btn.style.padding = "10px";
    let defaultClass =
      refName === "W1" ? "var(--ios-purple)" : "var(--ios-green)";

    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${defaultClass}" stroke-width="2.5" style="margin-right:4px; vertical-align:middle;"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Bloque (${inicio}-${fin})`;

    btn.onclick = function () {
      if (typeof haptic === "function") haptic();
      let bloqueTexto = "";
      for (let i = b * tamanoBloque; i < fin; i++) {
        bloqueTexto += `${i + 1}. wa.me/${dataArray[i].tel}\n`;
      }

      navigator.clipboard.writeText(bloqueTexto.trim()).then(() => {
        let originalHTML = btn.innerHTML;
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:4px; vertical-align:middle;"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡Copiado!`;
        btn.style.background = defaultClass;
        btn.style.color = "white";
        btn.style.borderColor = "transparent";

        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:${defaultClass};"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Bloque copiado</span></div>`,
          );
        }

        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.background = "";
          btn.style.color = "";
          btn.style.borderColor = "";
        }, 1200);
      });
    };
    container.appendChild(btn);
  }
}

function renderizarListaRecordatorios(estadoObj, contenedorId, refName) {
  const container = document.getElementById(contenedorId);
  let html = "";
  let defaultColor =
    refName === "W1" ? "var(--ios-purple)" : "var(--ios-green)";

  estadoObj.data.forEach((item, index) => {
    let msgEscaped = encodeURIComponent(item.mensaje);
    let rowId = `row-${refName}-${index}`;
    let isTachado = estadoObj.tachados.has(index);

    let bgRow = isTachado ? "rgba(48, 209, 88, 0.05)" : "var(--input-bg)";
    let borderRow = isTachado ? "var(--ios-green)" : "var(--glass-border)";
    let opacityRow = isTachado ? "0.5" : "1";
    let colorNum = isTachado ? "white" : "var(--text-secondary)";
    let bgNum = isTachado ? "var(--ios-green)" : "rgba(118, 118, 128, 0.15)";
    let textDecor = isTachado ? "line-through" : "none";
    let colorText = isTachado ? "var(--text-secondary)" : defaultColor;

    html += `
              <div id="${rowId}" style="background: ${bgRow}; border: 1px solid ${borderRow}; border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; opacity: ${opacityRow}; transition: all 0.3s ease;">
                  <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                      <div style="font-size: 0.85rem; font-weight: 800; color: ${colorNum}; background: ${bgNum}; min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">${index + 1}</div>
                      <div style="font-size: 0.95rem; font-family: monospace; font-weight: bold; color: ${colorText}; text-decoration: ${textDecor}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: all 0.3s ease;">${item.tel}</div>
                  </div>
                  <button class="btn-ios btn-secondary" style="padding: 8px 12px; color: ${defaultColor}; margin: 0;" onclick="copiarMsgRecordatorio(this, '${msgEscaped}', '${rowId}', '${refName}', ${index})">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                  </button>
              </div>`;
  });
  container.innerHTML = html;
}

function copiarMsgRecordatorio(btn, msgEncoded, rowId, refName, indexObj) {
  if (typeof haptic === "function") haptic();
  const mensajeFinal = decodeURIComponent(msgEncoded);

  navigator.clipboard
    .writeText(mensajeFinal)
    .then(() => {
      marcarTachadoRecordatorio(btn, rowId, refName, indexObj);
    })
    .catch(() => {
      const textarea = document.createElement("textarea");
      textarea.value = mensajeFinal;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      marcarTachadoRecordatorio(btn, rowId, refName, indexObj);
    });
}

function marcarTachadoRecordatorio(btn, rowId, refName, indexObj) {
  if (refName === "W1") {
    window.estadoW1.tachados.add(indexObj);
    guardarEstadoRecordatorios("W1");
  }
  if (refName === "W2") {
    window.estadoW2.tachados.add(indexObj);
    guardarEstadoRecordatorios("W2");
  }

  const row = document.getElementById(rowId);
  if (row) {
    row.style.background = "rgba(48, 209, 88, 0.05)";
    row.style.borderColor = "var(--ios-green)";
    row.style.opacity = "0.5";
    row.children[0].children[0].style.background = "var(--ios-green)";
    row.children[0].children[0].style.color = "white";
    row.children[0].children[1].style.textDecoration = "line-through";
    row.children[0].children[1].style.color = "var(--text-secondary)";
  }

  const originalHTML = btn.innerHTML;
  btn.style.background = "var(--ios-green)";
  btn.style.color = "white";
  btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  setTimeout(() => {
    btn.style.background = "";
    btn.style.color = "";
    btn.innerHTML = originalHTML;
  }, 1500);
}
// =========================================================================
// MÓDULO WEB INTEGRADO: SALDOS DE DISTRIBUIDORES (SOLO LECTURA)
// =========================================================================
function toggleDistrisPanel() {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("distrisOverlay");
  if (overlay) {
    overlay.classList.toggle("open");
    // Sincroniza al instante cuando se abre el panel
    if (overlay.classList.contains("open")) {
      cargarDistribuidores();
    }
  }
}

function formatearMonedaDistris(valorStr) {
  // Limpiamos signos de dólar, espacios y puntos de miles. Si hay coma de centavos, tomamos solo la parte entera.
  let strLimpio = String(valorStr)
    .replace(/\$|\s/g, "")
    .split(",")[0]
    .replace(/\./g, "");
  let valorNum = parseInt(strLimpio, 10);

  if (isNaN(valorNum)) return "$0";

  // Regla de autocompletado (si alguien escribió "50" por accidente, se vuelve "50000")
  if (Math.abs(valorNum) > 0 && Math.abs(valorNum) < 1000) {
    valorNum = valorNum * 1000;
  }

  return "$" + valorNum.toLocaleString("es-CO");
}

function copiarSaldoDistri(btn, nombre, saldoFormateado) {
  if (typeof haptic === "function") haptic();
  const textoWhatsApp = `*CYBERNET STREAMING* 🚀\n\nEstimado(a) *${nombre}*,\n\nTe informamos que tu saldo disponible actual en el sistema es de: *${saldoFormateado}* 💵\n\n¡Gracias por tu confianza y preferencia! ✨`;

  navigator.clipboard.writeText(textoWhatsApp).then(() => {
    let originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    btn.style.color = "var(--ios-green)";
    btn.style.background = "rgba(48, 209, 88, 0.15)";
    btn.style.borderColor = "rgba(48, 209, 88, 0.3)";

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Saldo copiado</span></div>`,
      );
    }

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.color = "";
      btn.style.background = "";
      btn.style.borderColor = "";
    }, 1500);
  });
}

function cargarDistribuidores() {
  const tbody = document.getElementById("tablaDistribuidores");
  tbody.innerHTML =
    '<tr><td colspan="2" style="text-align: center; padding: 20px; color: var(--text-secondary);"><svg class="spin-anim" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom:8px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg><br>Sincronizando saldos...</td></tr>';

  const oldScript = document.getElementById("script_get_distris_view");
  if (oldScript) oldScript.remove();

  window.procesarDistribuidoresView = function (res) {
    const scriptNode = document.getElementById("script_get_distris_view");
    if (scriptNode) scriptNode.remove();
    delete window.procesarDistribuidoresView;

    if (res && res.status === "success") {
      let data = res.data;
      if (data.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="2" style="text-align: center; padding: 20px; color: var(--text-secondary);">No hay distribuidores registrados.</td></tr>';
        return;
      }

      // 🔥 FIX: Nuevo motor de ordenamiento que no se confunde con los millones
      data.sort(function (a, b) {
        let strA = String(a.saldo)
          .replace(/\$|\s/g, "")
          .split(",")[0]
          .replace(/\./g, "");
        let strB = String(b.saldo)
          .replace(/\$|\s/g, "")
          .split(",")[0]
          .replace(/\./g, "");

        let saldoA = parseInt(strA, 10) || 0;
        let saldoB = parseInt(strB, 10) || 0;

        if (Math.abs(saldoA) > 0 && Math.abs(saldoA) < 1000) saldoA *= 1000;
        if (Math.abs(saldoB) > 0 && Math.abs(saldoB) < 1000) saldoB *= 1000;

        return saldoB - saldoA;
      });

      let html = "";
      for (let i = 0; i < data.length; i++) {
        let d = data[i];

        // 🔥 FIX: Evaluación de color y lógica con el número limpio
        let strLimpioItem = String(d.saldo)
          .replace(/\$|\s/g, "")
          .split(",")[0]
          .replace(/\./g, "");
        let saldoLimpio = parseInt(strLimpioItem, 10) || 0;

        if (Math.abs(saldoLimpio) > 0 && Math.abs(saldoLimpio) < 1000) {
          saldoLimpio *= 1000;
        }

        let colorSaldo =
          saldoLimpio >= 5000 ? "var(--ios-green)" : "var(--ios-red)";
        let saldoTexto = formatearMonedaDistris(d.saldo);
        let nombreLimpioParaClick = d.nombre.replace(/'/g, "\\'");

        html += `
                      <tr class="distri-row" style="border-bottom: 0.5px solid rgba(255,255,255,0.05); transition: background 0.2s;">
                          <td style="padding: 12px 10px;">
                              <strong style="color: var(--text-primary); font-size: 0.95rem;">${d.nombre}</strong><br>
                              <span style="color:var(--text-secondary); font-size:0.8rem; font-family: monospace;">${d.telefono}</span>
                          </td>
                          <td style="padding: 12px 10px; font-family: monospace; font-size: 1.05rem; font-weight: bold; color: ${colorSaldo}; white-space: nowrap; display: flex; align-items: center; justify-content: space-between;">
                              ${saldoTexto}
                              <button class="btn-ios btn-secondary" style="padding: 6px 10px; font-size: 0.75rem; margin: 0; display: flex; align-items: center; justify-content: center;" onclick="copiarSaldoDistri(this, '${nombreLimpioParaClick}', '${saldoTexto}')" title="Copiar reporte de saldo">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                              </button>
                          </td>
                      </tr>`;
      }
      tbody.innerHTML = html;
    } else {
      tbody.innerHTML = `<tr><td colspan="2" style="text-align: center; padding: 20px; color: var(--ios-red);">❌ Error al cargar datos.</td></tr>`;
    }
  };

  const scriptElement = document.createElement("script");
  scriptElement.id = "script_get_distris_view";
  scriptElement.src =
    GOOGLE_SCRIPT_URL +
    "?action=obtenerDistribuidores&callback=procesarDistribuidoresView&_ts=" +
    Date.now();
  document.body.appendChild(scriptElement);
}

function filtrarTablaRevendedores() {
  const query = document
    .getElementById("searchTablaDistris")
    .value.toLowerCase();
  const rows = document.querySelectorAll(".distri-row");
  for (let i = 0; i < rows.length; i++) {
    rows[i].style.display = rows[i].innerText.toLowerCase().includes(query)
      ? ""
      : "none";
  }
}

// =========================================================================
// 📈 MÓDULO FINANCIERO INTEGRADO (SPA) - RESTAURADO
// =========================================================================

let globalFinanzasData = null;
let activePeriod = "mes";
let isWorking = false;
let activeQueryId = 0;
let activeRentabilidadQueryId = 0;
let currentMiGananciaBruta = 0;
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

function toggleFinanzasPanel() {
  if (navigator.vibrate) navigator.vibrate(10);
  const overlay = document.getElementById("finanzasOverlay");

  if (overlay) {
    overlay.classList.toggle("open");

    if (overlay.classList.contains("open")) {
      // 🔊 NUEVO: Sonido de apertura
      if (typeof window.CyberSonidos !== "undefined")
        window.CyberSonidos.play("abrir");

      construirSelectores();
      cargarDashboardFinanzas();
    } else {
      // 🔊 NUEVO: Sonido de cierre
      if (typeof window.CyberSonidos !== "undefined")
        window.CyberSonidos.play("cerrar");
    }
  }
}

function filtrarHoy() {
  const hoy = new Date();
  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");
  if (mSelect && dSelect) {
    mSelect.value = mesesArray[hoy.getMonth()];
    dSelect.value = hoy.getDate();
    actualizarFiltrosUI();
  }
}

function filtrarAyer() {
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");
  if (mSelect && dSelect) {
    mSelect.value = mesesArray[ayer.getMonth()];
    dSelect.value = ayer.getDate();
    actualizarFiltrosUI();
  }
}
function filtrarMes() {
  if (typeof haptic === "function") haptic();
  const hoy = new Date();
  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");
  if (mSelect && dSelect) {
    mSelect.value = mesesArray[hoy.getMonth()];
    dSelect.value = "TODOS"; // Fuerza el selector a "Todo el mes"
    actualizarFiltrosUI();
  }
}

function formatMoneda(v) {
  return (
    "$" +
    parseFloat(v || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })
  );
}

function construirSelectores() {
  const mSelect = document.getElementById("appleMonthSelect");
  const dSelect = document.getElementById("appleDaySelect");

  if (mSelect.options.length > 0) return;

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
    opt.value = i;
    opt.innerText = "Día " + i;
    dSelect.appendChild(opt);
  }
  mSelect.selectedIndex = new Date().getMonth();
}

function actualizarFiltrosUI() {
  const mes = document.getElementById("appleMonthSelect").value;
  const dia = document.getElementById("appleDaySelect").value;
  activePeriod = dia === "TODOS" ? "mes" : "dia";

  document.getElementById("txtPeriodoLabel").innerText =
    activePeriod === "mes" ? "Caja Real Mensual" : "Caja Real del Día";
  document.getElementById("txtLibroHeader").innerText = "Libro de " + mes;

  cargarDashboardFinanzas();
}

// 💥 AQUÍ SE RESTAURA EL DISEÑO DE LAS BARRAS DE RENTABILIDAD
function cargarRentabilidadPlataformas() {
  const container = document.getElementById("rankingPlataformasVentas");
  if (!container) return;
  container.innerHTML =
    '<div class="empty-log-msg">Calculando rentabilidad...</div>';

  const mes = document.getElementById("appleMonthSelect").value || "MAYO";
  const currentQueryId = ++activeRentabilidadQueryId;
  const callbackName = `renderRentCallback_${currentQueryId}`;

  document
    .querySelectorAll(".rent-engine-node")
    .forEach((node) => node.remove());

  window[callbackName] = function (res) {
    delete window[callbackName];
    if (currentQueryId !== activeRentabilidadQueryId) return;

    if (res.status === "success") {
      let html = "";
      let data = res.data;

      if (data.length === 0) {
        container.innerHTML =
          '<div class="empty-log-msg">No hay ventas registradas.</div>';
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
        let pctBar = Math.round((Math.abs(r.gananciaNeta) / maxGanancia) * 100);

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
                      </div>
                  `;
      });
      container.innerHTML = html;
    }
  };

  const script = document.createElement("script");
  script.classList.add("rent-engine-node");
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerRentabilidad&mes=${mes}&callback=${callbackName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

function cargarDashboardFinanzas() {
  const container = document.getElementById("listaDesgloseGastos");
  container.innerHTML =
    '<div class="empty-log-msg">Conectando con Google Cloud Contable...</div>';

  const mes = document.getElementById("appleMonthSelect").value || "MAYO";
  const dia = document.getElementById("appleDaySelect").value || "TODOS";
  const currentQueryId = ++activeQueryId;
  const callbackName = `renderCallback_${currentQueryId}`;

  cargarRentabilidadPlataformas();
  document
    .querySelectorAll(".fin-engine-node")
    .forEach((node) => node.remove());

  window[callbackName] = function (res) {
    delete window[callbackName];
    if (currentQueryId !== activeQueryId) return;

    if (res.status === "success") {
      globalFinanzasData = res.data;
      renderDashboard();
    } else {
      container.innerHTML = `<div class="empty-log-msg" style="color:var(--ios-red);">Error al actualizar balances.</div>`;
    }
  };

  const script = document.createElement("script");
  script.classList.add("fin-engine-node");
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerDashboardFinanzas&mes=${mes}&dia=${dia}&callback=${callbackName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

// 🧼 Helper para formatear con puntos de miles eliminando automáticamente los ceros a la izquierda
window.formatearMontoDeudaSinSigno = function (input) {
  // 1. Extraer únicamente los dígitos numéricos
  let valorLimpio = input.value.replace(/\D/g, "");

  if (valorLimpio === "") {
    input.value = "";
    return;
  }

  // 2. Convertir a entero elimina cualquier cero inicial (ej: "0800000" pasa a ser 800000)
  let numero = parseInt(valorLimpio, 10) || 0;

  if (numero === 0) {
    input.value = "";
    return;
  }

  // 3. Formatear con puntos de miles
  input.value = numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// 🧼 Helper auxiliar para formatear números limpitos desde variables
function formatNumeroLimpio(v) {
  let num =
    typeof v === "number" ? v : parseFloat(String(v).replace(/\D/g, "")) || 0;
  if (num === 0) return "";
  return num.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

// =========================================================================
// 🧮 CEREBRO Y CÁLCULO DE DEUDA MUTUA (CON RANGO MES AUTOMÁTICO)
// =========================================================================
window.calcularDescuentoDeuda = function () {
  const tipoDeudaElem = document.getElementById("tipoDeudaMutua");
  const tipoDeuda = tipoDeudaElem ? tipoDeudaElem.value : "negocio_debe";
  const modoElem = document.getElementById("modoDescuentoDeuda");
  const modo = modoElem ? modoElem.value : "deuda_50";

  const valDeudaElem = document.getElementById("valDeudaTotal");
  const signoPrefix = document.getElementById("signoDeudaPrefix");
  if (!valDeudaElem) return;

  const deudaInput = valDeudaElem.value.replace(/\D/g, "");
  const deuda = parseFloat(deudaInput) || 0;

  const lblResultado = document.getElementById("lblTextoResultadoDeuda");
  const btnCobrar = document.getElementById("btnCobrarHoyDeuda");

  // 🔄 Adaptar colores y textos según el tipo de deuda
  if (tipoDeuda === "yo_debo") {
    valDeudaElem.style.color = "var(--mac-red)";
    if (signoPrefix) signoPrefix.style.color = "var(--mac-red)";
    if (lblResultado) lblResultado.innerText = "Abono Sugerido hoy:";
    if (btnCobrar) btnCobrar.innerText = "🔴 Aboné lo de hoy";
  } else {
    valDeudaElem.style.color = "var(--mac-green)";
    if (signoPrefix) signoPrefix.style.color = "var(--mac-green)";
    if (lblResultado) lblResultado.innerText = "Retiro Sugerido hoy:";
    if (btnCobrar) btnCobrar.innerText = "🟢 Retiré lo de hoy";
  }

  let sugerencia = 0;

  if (deuda > 0) {
    if (modo === "deuda_50") {
      sugerencia = Math.round(deuda * 0.5);
    } else if (modo === "deuda_25") {
      sugerencia = Math.round(deuda * 0.25);
    } else if (modo === "resta_mes") {
      // 🗓️ CÁLCULO AUTOMÁTICO DE DÍAS RESTANTES DEL MES
      let hoy = new Date();
      // Obtiene el último día del mes actual (ej: 31 para Julio, 30 para Junio)
      let totalDiasMes = new Date(
        hoy.getFullYear(),
        hoy.getMonth() + 1,
        0,
      ).getDate();
      let diaActual = hoy.getDate();

      // Días restantes en el mes (incluyendo el día de hoy)
      let diasRestantes = totalDiasMes - diaActual + 1;
      if (diasRestantes < 1) diasRestantes = 1;

      sugerencia = Math.round(deuda / diasRestantes);
    }
  }

  const valDescuentoHoyElem = document.getElementById("valDescuentoHoy");
  if (valDescuentoHoyElem) {
    valDescuentoHoyElem.innerText = formatMoneda(sugerencia);
  }
};

// Variable global para rastrear el tipo de operación actual
window.modoOperacionModalActual = "prestamo";

// =========================================================================
// ➕ ABRIR MODAL: NUEVO PRÉSTAMO
// =========================================================================
window.agregarNuevoPrestamo = function () {
  if (typeof haptic === "function") haptic();

  window.modoOperacionModalActual = "prestamo";
  const tipoDeuda = document.getElementById("tipoDeudaMutua")
    ? document.getElementById("tipoDeudaMutua").value
    : "negocio_debe";

  const titleEl = document.getElementById("titlePrestamoModal");
  const descEl = document.getElementById("descPrestamoModal");
  const iconEl = document.getElementById("iconPrestamoModal");
  const signoEl = document.getElementById("signoPrestamoModal");
  const inputEl = document.getElementById("inputMontoPrestamoModal");

  if (tipoDeuda === "negocio_debe") {
    if (titleEl) titleEl.innerText = "🟢 Prestar al Negocio";
    if (descEl)
      descEl.innerText =
        "¿Cuánto dinero le estás prestando adicional al negocio?";
    if (iconEl) {
      iconEl.style.color = "var(--mac-green)";
      iconEl.style.background = "rgba(48, 209, 88, 0.15)";
    }
    if (signoEl) signoEl.style.color = "var(--mac-green)";
  } else {
    if (titleEl) titleEl.innerText = "🔴 Préstamo del Negocio";
    if (descEl)
      descEl.innerText =
        "¿Cuánto dinero te está prestando adicional el negocio?";
    if (iconEl) {
      iconEl.style.color = "var(--mac-red)";
      iconEl.style.background = "rgba(255, 69, 58, 0.15)";
    }
    if (signoEl) signoEl.style.color = "var(--mac-red)";
  }

  if (inputEl) inputEl.value = "";

  const modal = document.getElementById("prestamoModalOverlay");
  if (modal) modal.classList.add("open");

  setTimeout(() => {
    if (inputEl) inputEl.focus();
  }, 100);
};

// =========================================================================
// 💸 ABRIR MODAL: RETIRAR / ABONAR LO DE HOY
// =========================================================================
window.aplicarRetiroDeudaHoy = function () {
  if (typeof haptic === "function") haptic();

  let deudaActualText = document.getElementById("valDeudaTotal")
    ? document.getElementById("valDeudaTotal").value.replace(/\D/g, "")
    : "0";
  let deudaActual = parseFloat(deudaActualText) || 0;

  if (deudaActual <= 0) {
    alert("Actualmente no hay ninguna deuda registrada.");
    return;
  }

  window.modoOperacionModalActual = "retiro";
  const tipoDeuda = document.getElementById("tipoDeudaMutua")
    ? document.getElementById("tipoDeudaMutua").value
    : "negocio_debe";
  let sugeridoText = document.getElementById("valDescuentoHoy")
    ? document.getElementById("valDescuentoHoy").innerText.replace(/\D/g, "")
    : "0";
  let sugerido = parseFloat(sugeridoText) || 0;

  const titleEl = document.getElementById("titlePrestamoModal");
  const descEl = document.getElementById("descPrestamoModal");
  const iconEl = document.getElementById("iconPrestamoModal");
  const signoEl = document.getElementById("signoPrestamoModal");
  const inputEl = document.getElementById("inputMontoPrestamoModal");

  if (tipoDeuda === "negocio_debe") {
    if (titleEl) titleEl.innerText = "🟢 Retirar Dinero de Hoy";
    if (descEl)
      descEl.innerText =
        "Confirma o modifica la cantidad que te retiraste hoy:";
    if (iconEl) {
      iconEl.style.color = "var(--mac-green)";
      iconEl.style.background = "rgba(48, 209, 88, 0.15)";
    }
    if (signoEl) signoEl.style.color = "var(--mac-green)";
  } else {
    if (titleEl) titleEl.innerText = "🔴 Abonar Dinero de Hoy";
    if (descEl)
      descEl.innerText =
        "Confirma o modifica la cantidad que le abonaste al negocio hoy:";
    if (iconEl) {
      iconEl.style.color = "var(--mac-red)";
      iconEl.style.background = "rgba(255, 69, 58, 0.15)";
    }
    if (signoEl) signoEl.style.color = "var(--mac-red)";
  }

  if (inputEl) {
    inputEl.value = sugerido > 0 ? formatNumeroLimpio(sugerido) : "";
  }

  const modal = document.getElementById("prestamoModalOverlay");
  if (modal) modal.classList.add("open");

  setTimeout(() => {
    if (inputEl) inputEl.focus();
  }, 100);
};

// =========================================================================
// 🔒 ACCIONES DEL MODAL (CONFIRMAR Y CERRAR)
// =========================================================================
window.cerrarPrestamoModal = function () {
  if (typeof haptic === "function") haptic();
  const modal = document.getElementById("prestamoModalOverlay");
  if (modal) modal.classList.remove("open");
};

window.confirmarOperacionPrestamoModal = function (e) {
  e.preventDefault();
  if (typeof haptic === "function") haptic();

  const inputEl = document.getElementById("inputMontoPrestamoModal");
  let montoRaw = inputEl ? inputEl.value.replace(/\D/g, "") : "0";
  let montoIngresado = parseFloat(montoRaw) || 0;

  if (montoIngresado <= 0) return;

  let deudaActualText = document
    .getElementById("valDeudaTotal")
    .value.replace(/\D/g, "");
  let deudaActual = parseFloat(deudaActualText) || 0;

  if (window.modoOperacionModalActual === "prestamo") {
    // ➕ Sumar préstamo a la deuda
    let nuevaDeuda = deudaActual + montoIngresado;
    document.getElementById("valDeudaTotal").value =
      formatNumeroLimpio(nuevaDeuda);
  } else {
    // 💸 Restar abono/retiro de la deuda
    if (montoIngresado > deudaActual) montoIngresado = deudaActual;
    let nuevaDeuda = deudaActual - montoIngresado;
    if (nuevaDeuda < 0) nuevaDeuda = 0;
    document.getElementById("valDeudaTotal").value =
      formatNumeroLimpio(nuevaDeuda);
  }

  calcularDescuentoDeuda();
  cerrarPrestamoModal();

  // Guardar en Google Sheets automáticamente
  if (typeof guardarDeudaEnSheets === "function") {
    guardarDeudaEnSheets();
  }
};

// =========================================================================
// 📈 RENDERIZADOR CONTABLE BENTO ACTUALIZADO CON DOBLE CUADRO DE DISTRIBUCIÓN
// =========================================================================
function renderDashboard() {
  if (!globalFinanzasData) return;
  const d = globalFinanzasData[activePeriod];
  if (!d) return;

  // 🔄 Carga automática de Deuda y Tipo de Deuda desde Google Sheets
  if (
    globalFinanzasData.deudaActual !== undefined &&
    document.getElementById("valDeudaTotal")
  ) {
    document.getElementById("valDeudaTotal").value = formatNumeroLimpio(
      globalFinanzasData.deudaActual || 0,
    );
  }

  if (
    globalFinanzasData.tipoDeudaActual &&
    document.getElementById("tipoDeudaMutua")
  ) {
    document.getElementById("tipoDeudaMutua").value =
      globalFinanzasData.tipoDeudaActual;
  }

  const netEl = document.getElementById("val_neto");
  if (netEl) {
    netEl.innerText = formatMoneda(d.neto);
    netEl.style.color = d.neto >= 0 ? "var(--ios-green)" : "var(--ios-red)";
  }

  // ─────────────── ESCÁNER MÁSTER DE CATEGORÍAS ───────────────
  let sumaIngresoExtra = 0,
    sumaJeisson = 0,
    sumaAngelica = 0,
    sumaPersonalIngreso = 0, // Separador de flujos personales
    sumaPersonalEgreso = 0;

  const itemsTemp = globalFinanzasData.listaDetallada || [];

  itemsTemp.forEach((item) => {
    const cat = (item.categoria || "").toLowerCase();
    const det = (item.detalle || "").toLowerCase();
    let val = parseFloat(item.monto) || 0;

    if (item.tipo === "INGRESO") {
      if (cat.includes("angelica") || det.includes("angelica")) {
        sumaAngelica += val;
      } else if (cat === "personal" || det.includes("personal")) {
        sumaPersonalIngreso += val;
      } else if (
        cat.includes("ingreso extra") ||
        det.includes("jeisson") ||
        cat.includes("jeisson")
      ) {
        sumaIngresoExtra += val;
        if (det.includes("jeisson") || cat.includes("jeisson")) {
          sumaJeisson += val;
        }
      }
    } else {
      if (cat === "personal" || det.includes("personal")) {
        sumaPersonalEgreso += val;
      }
    }
  });

  if (document.getElementById("valProyJeisson")) {
    document.getElementById("valProyJeisson").innerText =
      formatMoneda(sumaJeisson);
  }

  // 🔥 Ventas Reales del Negocio
  let ventasBrutasReales = Math.max(
    0,
    (d.ingresos || 0) - sumaIngresoExtra - sumaAngelica - sumaPersonalIngreso,
  );

  // 🔥 Gastos Limpios del Negocio
  let gastosNegocioLimpios = Math.max(0, (d.gastos || 0) - sumaPersonalEgreso);

  if (document.getElementById("val_ingresos")) {
    document.getElementById("val_ingresos").innerText =
      formatMoneda(ventasBrutasReales);
  }
  if (document.getElementById("val_gastos")) {
    document.getElementById("val_gastos").innerText =
      formatMoneda(gastosNegocioLimpios);
  }
  if (document.getElementById("val_inversiones")) {
    document.getElementById("val_inversiones").innerText = formatMoneda(
      d.inversiones,
    );
  }
  if (document.getElementById("val_nomina")) {
    document.getElementById("val_nomina").innerText = formatMoneda(d.nomina);
  }

  // ─────────────── CONFIGURACIÓN DE PORCENTAJES DINÁMICOS ───────────────
  let pM = 30,
    pNom = 16,
    pNeg = 54;
  const m = document.getElementById("appleMonthSelect")
    ? document.getElementById("appleMonthSelect").value
    : "";
  const dia = document.getElementById("appleDaySelect")
    ? document.getElementById("appleDaySelect").value
    : "";

  if (m === "MAYO") {
    if (dia !== "TODOS" && parseInt(dia) <= 15) {
      pM = 30;
      pNom = 15;
      pNeg = 55;
    } else if (dia === "TODOS") {
      pM = 29;
      pNom = 16;
      pNeg = 55;
    }
  } else if (
    [
      "JULIO",
      "AGOSTO",
      "SEPTIEMBRE",
      "OCTUBRE",
      "NOVIEMBRE",
      "DICIEMBRE",
    ].includes(m)
  ) {
    pM = 30;
    pNeg = 54;
    pNom = 16;
  }

  if (document.getElementById("lblPorcMio"))
    document.getElementById("lblPorcMio").innerText = pM;
  if (document.getElementById("lblPorcNegocio"))
    document.getElementById("lblPorcNegocio").innerText = pNeg;
  if (document.getElementById("lblPorcNomina"))
    document.getElementById("lblPorcNomina").innerText = pNom;

  let base = ventasBrutasReales;

  // 🏢 CÁLCULOS CUADRO 1: FONDOS DEL NEGOCIO
  let montoFondoNegocio = Math.round(base * (pNeg / 100));
  let montoReservaNomina = Math.round(base * (pNom / 100));
  let totalFondosEmpresa = montoFondoNegocio + montoReservaNomina;

  if (document.getElementById("valProyNegocio")) {
    document.getElementById("valProyNegocio").innerText =
      formatMoneda(montoFondoNegocio);
  }
  if (document.getElementById("valProyNomina")) {
    document.getElementById("valProyNomina").innerText =
      formatMoneda(montoReservaNomina);
  }
  if (document.getElementById("valTotalFondosNegocio")) {
    document.getElementById("valTotalFondosNegocio").innerText =
      formatMoneda(totalFondosEmpresa);
  }

  // 💰 CÁLCULOS CUADRO 2: MI GANANCIA, AHORRO Y TOTAL (+ JEISSON)
  let miGananciaNeta =
    Math.round(base * (pM / 100)) + (sumaIngresoExtra - sumaJeisson);
  let ahorro70 = Math.round(miGananciaNeta * 0.7);
  let otros30 = miGananciaNeta - ahorro70; // Previene desfases de centavos por redondeo

  if (document.getElementById("valProyMio")) {
    document.getElementById("valProyMio").innerText =
      formatMoneda(miGananciaNeta);
  }
  if (document.getElementById("valGananciaAhorro")) {
    document.getElementById("valGananciaAhorro").innerText =
      formatMoneda(ahorro70);
  }
  if (document.getElementById("valGananciaOtros")) {
    document.getElementById("valGananciaOtros").innerText =
      formatMoneda(otros30);
  }

  currentMiGananciaBruta = miGananciaNeta + sumaJeisson;
  if (document.getElementById("valProyMioMasJeisson")) {
    document.getElementById("valProyMioMasJeisson").innerText = formatMoneda(
      currentMiGananciaBruta,
    );
  }

  // 🔥 RECALIBRACIÓN GRÁFICA DE ANILLOS & BARRAS
  const totalFlujo =
    ventasBrutasReales + gastosNegocioLimpios + d.inversiones + d.nomina;
  let pctIn =
    totalFlujo > 0 ? Math.round((ventasBrutasReales / totalFlujo) * 100) : 0;
  let pctOut =
    totalFlujo > 0
      ? Math.round(
          ((gastosNegocioLimpios + d.inversiones + d.nomina) / totalFlujo) *
            100,
        )
      : 0;

  if (document.getElementById("txtBarPorcIngresos"))
    document.getElementById("txtBarPorcIngresos").innerText = pctIn + "%";
  if (document.getElementById("barFillIngresos"))
    document.getElementById("barFillIngresos").style.width = pctIn + "%";
  if (document.getElementById("txtBarPorcGastos"))
    document.getElementById("txtBarPorcGastos").innerText = pctOut + "%";
  if (document.getElementById("barFillGastos"))
    document.getElementById("barFillGastos").style.width = pctOut + "%";

  const circVentas = 251.3;
  const strokeDashoffsetVentas = circVentas - (pctIn / 100) * circVentas;
  const ringVentas = document.getElementById("appleRingVentas");
  if (ringVentas) {
    ringVentas.style.strokeDasharray = circVentas;
    ringVentas.style.strokeDashoffset = strokeDashoffsetVentas;
  }

  const circGastos = 163.3;
  const strokeDashoffsetGastos = circGastos - (pctOut / 100) * circGastos;
  const ringGastos = document.getElementById("appleRingGastos");
  if (ringGastos) {
    ringGastos.style.strokeDasharray = circGastos;
    ringGastos.style.strokeDashoffset = strokeDashoffsetGastos;
  }

  const container = document.getElementById("listaDesgloseGastos");
  if (container) {
    if (itemsTemp.length === 0) {
      container.innerHTML =
        '<div class="empty-log-msg" style="padding: 20px;">No hay movimientos registrados en este periodo.</div>';
      return;
    }

    let categoriasAgrupadas = {};
    let totalGastadoEnPeriodo = 0;
    let totalIngresadoEnPeriodo = 0;

    itemsTemp.forEach((item) => {
      let cat = item.categoria || "OTROS";
      if (!categoriasAgrupadas[cat]) {
        categoriasAgrupadas[cat] = { gastosPuros: 0, ingresosPuros: 0 };
      }
      let montoNum = parseFloat(item.monto) || 0;
      if (item.tipo === "INGRESO") {
        categoriasAgrupadas[cat].ingresosPuros += montoNum;
        totalIngresadoEnPeriodo += montoNum;
      } else {
        categoriasAgrupadas[cat].gastosPuros += montoNum;
        totalGastadoEnPeriodo += montoNum;
      }
    });

    let htmlBuffer = "";

    // Bloque 1: Resumen de Gastos por Categoría
    if (totalGastadoEnPeriodo > 0) {
      htmlBuffer += `
          <div style="margin-bottom: 20px;">
            <h4 style="margin: 0 0 12px 0; color: var(--ios-red); font-size: 0.88rem; font-weight: 800; display: flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.3px;">
              🔴 Resumen de Egresos por Categoría
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        `;
      let catArrayGastos = Object.keys(categoriasAgrupadas).filter(
        (c) => categoriasAgrupadas[c].gastosPuros > 0,
      );
      catArrayGastos.sort(
        (a, b) =>
          categoriasAgrupadas[b].gastosPuros -
          categoriasAgrupadas[a].gastosPuros,
      );
      catArrayGastos.forEach((cat) => {
        htmlBuffer += `
            <div style="background: rgba(255, 69, 58, 0.04); border: 1px solid rgba(255, 69, 58, 0.15); padding: 10px; border-radius: 12px;">
              <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${cat}">${cat}</span>
              <span style="color: var(--ios-red); font-weight: 800; font-size: 1.05rem; font-family: monospace;">${formatMoneda(categoriasAgrupadas[cat].gastosPuros)}</span>
            </div>`;
      });
      htmlBuffer += `</div></div>`;
    }

    // Bloque 2: Resumen de Ingresos por Categoría
    if (totalIngresadoEnPeriodo > 0) {
      htmlBuffer += `
          <div style="margin-bottom: 20px;">
            <h4 style="margin: 0 0 12px 0; color: var(--ios-green); font-size: 0.88rem; font-weight: 800; display: flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.3px;">
              🟢 Resumen de Ingresos Extra
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px;">
        `;
      let catArrayIngresos = Object.keys(categoriasAgrupadas).filter(
        (c) => categoriasAgrupadas[c].ingresosPuros > 0,
      );
      catArrayIngresos.sort(
        (a, b) =>
          categoriasAgrupadas[b].ingresosPuros -
          categoriasAgrupadas[a].ingresosPuros,
      );
      catArrayIngresos.forEach((cat) => {
        htmlBuffer += `
            <div style="background: rgba(48, 209, 88, 0.04); border: 1px solid rgba(48, 209, 88, 0.15); padding: 10px; border-radius: 12px;">
              <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${cat}">${cat}</span>
              <span style="color: var(--ios-green); font-weight: 800; font-size: 1.05rem; font-family: monospace;">${formatMoneda(categoriasAgrupadas[cat].ingresosPuros)}</span>
            </div>`;
      });
      htmlBuffer += `</div></div>`;
    }

    // 📋 HISTORIAL CRONOLÓGICO DE SALIDAS DETALLADAS (LIBRO)
    htmlBuffer += `
        <div style="margin-top: 10px; width: 100%;">
          <h4 style="margin: 0 0 12px 0; color: var(--text-primary); font-size: 0.88rem; font-weight: 800; display: flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.3px;">
            📋 Historial Detallado de Salidas (Libro)
          </h4>
          <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
      `;

    for (let i = itemsTemp.length - 1; i >= 0; i--) {
      let item = itemsTemp[i];

      if (item.tipo !== "INGRESO") {
        let montoMovimiento = parseFloat(item.monto) || 0;
        htmlBuffer += `
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); padding: 10px 14px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 10px;">
              <div style="display: flex; flex-direction: column; gap: 2px; overflow: hidden; padding-right: 5px;">
                <span style="font-size: 0.88rem; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.detalle || "Sin nota"}">${item.detalle || "Sin nota"}</span>
                <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600;">${item.fecha || ""} | ${item.categoria || "Otros"}</span>
              </div>
              <strong style="color: var(--ios-red); font-size: 0.95rem; font-family: monospace; flex-shrink: 0;">-${formatMoneda(montoMovimiento)}</strong>
            </div>`;
      }
    }

    htmlBuffer += `</div></div>`;

    container.innerHTML = htmlBuffer;
  }

  // 🔥 Dispara el cálculo automático de la calculadora de deuda
  if (typeof calcularDescuentoDeuda === "function") {
    calcularDescuentoDeuda();
  }
}

function guardarTransaccion(e) {
  e.preventDefault();
  if (isWorking) return;

  const catVal = encodeURIComponent(
    document.getElementById("finCategoria").value,
  );
  const montoRaw = document.getElementById("finMonto").value.replace(/\D/g, "");

  if (!montoRaw || parseInt(montoRaw) <= 0) {
    alert("Ingresa un monto válido.");
    return;
  }

  isWorking = true;
  const btn = document.getElementById("btnSubmit");
  const originalText = btn.innerText;
  btn.innerText = "Procesando...";
  btn.disabled = true;

  window.saveCallbackFinanzas = function (res) {
    isWorking = false;
    btn.innerText = originalText;
    btn.disabled = false;
    delete window.saveCallbackFinanzas;

    if (res.status === "success") {
      document.getElementById("formFinanzas").reset();
      cargarDashboardFinanzas();
    } else {
      alert("Error: " + res.message);
    }
  };

  const script = document.createElement("script");
  script.src = `${GOOGLE_SCRIPT_URL}?action=registrarTransaccionFinanciera&categoria=${catVal}&monto=${montoRaw}&detalle=${encodeURIComponent(document.getElementById("finDetalle").value)}&callback=saveCallbackFinanzas&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

function exportarExcelEmpresarial() {
  if (!globalFinanzasData) {
    alert("Espera que carguen los datos primero.");
    return;
  }
  // Lógica rápida de exportación CSV basada en globalFinanzasData.listaDetallada
  let csvContent =
    "data:text/csv;charset=utf-8,FECHA,MONTO,DETALLE,CATEGORIA,TIPO\n";
  globalFinanzasData.listaDetallada.forEach((row) => {
    csvContent += `${row.fecha},${row.monto},"${row.detalle}","${row.categoria}",${row.tipo}\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `Finanzas_Cybernet_${document.getElementById("appleMonthSelect").value}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// =========================================================================
// 🚀 MOTOR DINÁMICO: CARGAR TEXTOS Y MENSAJES DESDE GOOGLE SHEETS
// =========================================================================
window.currentGridStock = []; // Memoria global para las plantillas descargadas

function cargarPlantillasDesdeSheets() {
  const container = document.getElementById("grid-container");
  if (container)
    container.innerHTML =
      '<div class="empty-log-msg">Sincronizando mensajes desde Sheets...</div>';

  const cbName = "cb_plantillas_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      const data = res.data;

      // Variables para guardar nuestras dos plantillas principales
      let plantillaPagos = null;
      let plantillaNequi = null;
      window.currentGridStock = [];

      // 1. Clasificamos las plantillas que llegan desde el Excel
      data.forEach((item) => {
        const tituloUP = item.titulo.toUpperCase();

        if (tituloUP === "PAGOS") {
          plantillaPagos = item;
        } else if (tituloUP === "NEQUI") {
          plantillaNequi = item;
        } else {
          // El resto va al buscador normal
          window.currentGridStock.push(item);
        }
      });

      // 2. Dibujamos la tarjeta especial en el panel izquierdo
      const headerContainer = document.getElementById("header-container");
      if (headerContainer && plantillaPagos) {
        let textoPagosSeguro = plantillaPagos.texto
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");

        // Verificamos si existe Nequi en tu Excel para armar su botón
        let btnNequiHtml = "";
        if (plantillaNequi) {
          let textoNequiSeguro = plantillaNequi.texto
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

          // 🔥 NUEVO DISEÑO GRIS PARA EL BOTÓN NEQUI (CARGA FINAL) 🔥
          btnNequiHtml = `
          <button class="btn-ios copy-text-btn w-100" 
                  style="padding: 14px !important; font-size: 0.85rem !important; font-weight: 800 !important; border-radius: 12px !important; background: rgba(255, 255, 255, 0.08) !important; color: var(--text-primary) !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; transition: all 0.2s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important;" 
                  data-clipboard-text="${textoNequiSeguro}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            COPIAR NEQUI
          </button>
        `;
        }

        headerContainer.innerHTML = `
          <div class="card-ios w-100" style="max-width: 440px; align-items: center; gap: 12px; padding: 20px;">
            
            <img src="${plantillaPagos.imagenUrl}" alt="QR" 
   onclick="window.copiarImagenQRPagos(this, '${plantillaPagos.imagenUrl}')"
   style="max-width:210px; width:100%; border-radius:16px; border: 2px solid transparent; box-shadow:var(--glass-shadow); padding:5px; background:white; margin:0 auto; cursor: pointer; transition: all 0.2s;"
   onmouseover="this.style.transform='scale(1.05)'"
   onmouseout="this.style.transform='scale(1)'"
   title="Haz clic para copiar la imagen del QR">
            
<span class="text-secondary text-center" style="font-size:0.75rem; font-weight:500; margin-top: -4px;">
  (Haz clic sobre el QR para copiar la imagen)
</span>
            
            <!-- Contenedor de Botones de Pago -->
            <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 4px;">
              
              <!-- 🔥 BOTÓN GRIS PAGOS BRE-B (CARGA FINAL) 🔥 -->
              <button class="btn-ios copy-text-btn w-100" 
                      style="padding: 14px !important; font-size: 0.85rem !important; font-weight: 800 !important; border-radius: 12px !important; background: rgba(255, 255, 255, 0.08) !important; color: var(--text-primary) !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; transition: all 0.2s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important;" 
                      data-clipboard-text="${textoPagosSeguro}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                COPIAR PAGOS (BRE-B)
              </button>
              
              ${btnNequiHtml}

            </div>
          </div>
        `;
      }

      // 3. Pintamos el resto de las tarjetas en el buscador
      renderGrid("");
    } else {
      const container = document.getElementById("grid-container");
      if (container)
        container.innerHTML =
          '<div class="empty-log-msg" style="color:var(--ios-red);">❌ Error al descargar mensajes.</div>';
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerPlantillas&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}

// Reemplazo de tu antigua función renderGrid por una que lea la memoria de Sheets
function renderGrid(filtro = "") {
  const gridContainer = document.getElementById("grid-container");
  if (!gridContainer || !window.currentGridStock) return;
  gridContainer.innerHTML = "";

  // Filtramos las tarjetas según lo que escribas en el buscador superior
  let filtrados = window.currentGridStock.filter(
    (item) =>
      item.titulo && item.titulo.toLowerCase().includes(filtro.toLowerCase()),
  );

  if (filtrados.length === 0) {
    gridContainer.innerHTML =
      '<div class="empty-log-msg" style="grid-column: 1 / -1;">No se encontraron plantillas con ese nombre.</div>';
    return;
  }

  filtrados.forEach((currentItem) => {
    const card = document.createElement("div");
    card.className = "card-ios";

    // Mantenemos la corrección para que no se salga de la caja
    card.style.cssText =
      "display: flex !important; flex-direction: column !important; justify-content: space-between !important; height: 100% !important; padding: 18px !important; background: rgba(255, 255, 255, 0.02) !important; border: 1px solid rgba(255, 255, 255, 0.06) !important; border-radius: 16px !important; margin: 0 !important; box-sizing: border-box !important;";

    let textoSeguro = currentItem.texto
      ? String(currentItem.texto).replace(/"/g, "&quot;").replace(/'/g, "&#39;")
      : "";

    let tituloLimpio = currentItem.titulo ? currentItem.titulo.trim() : "";
    let tituloSeguro =
      tituloLimpio !== "" ? tituloLimpio : "Plantilla Sin Nombre";

    // 🔥 NUEVO BOTÓN GRIS CLARO ELEGANTE 🔥
    card.innerHTML = `
        <div style="margin-bottom: 14px; flex-grow: 1; display: flex; flex-direction: column; justify-content: flex-start;">
          <h2 class="card-title" style="margin: 0; font-size: 0.95rem; font-weight: 800; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.4;">${tituloSeguro}</h2>
        </div>
        <button class="btn-ios copy-text-btn w-100" data-clipboard-text="${textoSeguro}" style="margin-top: auto !important; padding: 12px !important; background: rgba(255, 255, 255, 0.08) !important; color: var(--text-primary) !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; border-radius: 12px !important; font-weight: 800 !important; font-size: 0.85rem !important; transition: all 0.2s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important;">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
           COPIAR TEXTO
        </button>
      `;
    gridContainer.appendChild(card);
  });
}
let ultimoAvisoStock = 0;

function mostrarAlertaInventarioToast(listaPlataformas) {
  const toastCenter = document.getElementById("cyber-toast-center");
  if (!toastCenter) return;

  const toastId = `toast_stock_${Date.now()}`;
  const toastDiv = document.createElement("div");
  toastDiv.id = toastId;
  toastDiv.className = "cyber-notification";

  let listadoHtml = "";
  listaPlataformas.forEach((item) => {
    listadoHtml += `
        <li style="margin-bottom: 5px; list-style: none; display: flex; justify-content: space-between; gap: 10px;">
          <span>• <b>${item.plat}</b> (Quedan ${item.cant})</span>
          <span style="color: var(--ios-orange); font-weight: 700;">👉 ${item.accion}</span>
        </li>`;
  });

  toastDiv.innerHTML = `
      <div class="cyber-notif-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ios-orange)" stroke-width="2.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span style="font-weight: 800; font-size: 0.88rem; color: #ffffff;">Inventario Crítico</span>
        <button class="cyber-notif-close" onclick="closeNotificationById('${toastId}')">&times;</button>
      </div>
      <div class="cyber-notif-body">
        <div style="font-size: 0.78rem; margin-bottom: 8px; color: #e1e1e6;">Acción sugerida para evitar escasez:</div>
        <ul style="padding: 0; margin: 0;">${listadoHtml}</ul>
      </div>
    `;

  toastCenter.appendChild(toastDiv);

  setTimeout(() => {
    toastDiv.classList.add("show");
    if (typeof haptic === "function") haptic();
  }, 20);
}

window.closeNotificationById = function (id) {
  const toast = document.getElementById(id);
  if (toast) {
    toast.classList.remove("show");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 400);
  }
};

function mostrarNotificacionStock(contenido) {
  let toastViejo = document.getElementById("stockAlertToast");

  // Si existe un aviso viejo, lo destruimos
  if (toastViejo) {
    toastViejo.remove();
  }

  // Creamos el aviso. NOTA: Le quitamos el "pointer-events: none" para poder darle clic a la X
  let toast = document.createElement("div");
  toast.id = "stockAlertToast";
  toast.style.cssText =
    "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.8); opacity: 0; background: var(--sheet-modal-bg, rgba(30, 30, 30, 0.95)); border: 1px solid rgba(255, 159, 10, 0.3); color: var(--text-primary, white); padding: 32px 24px; border-radius: 32px; z-index: 99999; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7); backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px); transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1); font-size: 0.9rem; width: 90%; max-width: 400px; text-align: center;";

  toast.innerHTML = `
          <button onclick="cerrarNotificacionStock()" style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.1); border: none; color: var(--text-secondary, #aaa); width: 32px; height: 32px; border-radius: 50%; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">
              &times;
          </button>

          <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; padding-top: 10px;">
              <div style="background: rgba(255, 159, 10, 0.15); color: var(--ios-orange, #ff9f0a); padding: 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; border: 1px solid rgba(255, 159, 10, 0.2);">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
              </div>
              <h3 style="margin: 0; font-size: 1.35rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.3px;">Inventario Crítico</h3>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 4px 0 0 0;">Acción sugerida para evitar escasez:</p>
          </div>

          <div style="line-height: 1.6; text-align: left; background: rgba(0,0,0,0.2); padding: 16px 20px; border-radius: 20px; border: 1px dashed rgba(255,255,255,0.1);">
              ${contenido}
          </div>

          <button onclick="cerrarNotificacionStock()" class="btn-ios btn-secondary w-100" style="margin-top: 20px; padding: 14px; border-radius: 50px; font-weight: 700; width: 100%;">
              Entendido
          </button>
      `;

  document.body.appendChild(toast);

  // Animación de entrada (Pop-In)
  setTimeout(() => {
    toast.style.transform = "translate(-50%, -50%) scale(1)";
    toast.style.opacity = "1";
  }, 50);

  // ⛔ Se eliminó el setTimeout que la cerraba automáticamente
}

// Función encargada de cerrar la alerta con la animación inversa
window.cerrarNotificacionStock = function () {
  let toast = document.getElementById("stockAlertToast");
  if (toast) {
    // Animación de salida
    toast.style.transform = "translate(-50%, -50%) scale(0.8)";
    toast.style.opacity = "0";

    // Destruir el HTML después de que termine la animación
    setTimeout(() => {
      toast.remove();
    }, 400);
  }
};
// =========================================================================
// ⌨️ CONTROL MAESTRO DE NAVEGACIÓN Y ATAJOS (AUTO-CIERRE DEL BUSCADOR)
// =========================================================================

// 1. Cierra automáticamente las ventanas al presionar cualquier botón del Menú o Dock
document.addEventListener(
  "click",
  function (e) {
    // 🔒 Detecta clics en cualquier botón de la Barra Superior o del Dock
    let launcher = e.target.closest(".mac-dock-icon, .mac-menu-item");

    if (launcher) {
      let onclickCode = launcher.getAttribute("onclick") || "";

      // 🧼 Si se oprime cualquier botón que NO sea la base de datos/buscador, cierra la Lupa de inmediato
      if (!onclickCode.includes("abrirBuscadorGlobal")) {
        if (typeof cerrarBuscadorGlobal === "function") {
          cerrarBuscadorGlobal();
        }
      }

      // 🎯 Mapeo maestro de botones y sus ventanas correspondientes (Overlays)
      let mapaPaneles = {
        toggleFinanzasPanel: "finanzasOverlay",
        toggleNetflixManagerPanel: "netflixManagerOverlay",
        toggleCodesPanel: "codesOverlay",
        toggleVentasPanel: "ventasOverlay",
        toggleCambioPanel: "cambioCuentaOverlay",
        toggleCargarPanel: "cargarOverlay",
        toggleShiftsPanel: "shiftsOverlay",
        toggleSearchAccountPanel: "searchAccountOverlay",
        toggleDistrisPanel: "distrisOverlay",
        toggleGarantiasPanel: "garantiasOverlay",
        togglePromoPanel: "promoOverlay",
        toggleRecordatoriosPanel: "recordatoriosOverlay",
        abrirCalculadoraCombos: "comboCalcOverlay",
        abrirTotalNomina: "nominaOverlay",
        toggleAnaCodesPanel: "anaCodesOverlay",
        toggleYopmailPanel: "yopmailOverlay",
        toggleChayoPanel: "chayoOverlay",
        toggleGmailPanel: "gmailOverlay",
        toggleInventarioPanel: "inventarioOverlay",
      };

      let panelAIgnorar = null;
      for (let funcion in mapaPaneles) {
        if (onclickCode.includes(funcion)) {
          panelAIgnorar = mapaPaneles[funcion];
          break;
        }
      }

      // 🛡️ Cierra cualquier otra ventana abierta al cambiar de opción
      if (panelAIgnorar) {
        document.querySelectorAll(".overlay-ios").forEach((panel) => {
          if (
            panel.id !== "loginOverlay" &&
            panel.id !== "passwordOverlay" &&
            panel.id !== panelAIgnorar
          ) {
            panel.classList.remove("open");
            if (
              panel.style.display === "flex" ||
              panel.style.display === "block"
            ) {
              panel.style.setProperty("display", "none", "important");
            }
          }
        });
      }
    }
  },
  true,
);

// 2. Atajos de Teclado (Tecla ESC cierra todo, incluyendo el buscador)
document.addEventListener("keydown", function (e) {
  const limpiarPantalla = () => {
    if (typeof cerrarBuscadorGlobal === "function") {
      cerrarBuscadorGlobal();
    }
    document.querySelectorAll(".overlay-ios").forEach((panel) => {
      if (panel.id !== "loginOverlay" && panel.id !== "passwordOverlay") {
        panel.classList.remove("open");
        if (panel.style.display === "flex" || panel.style.display === "block") {
          panel.style.setProperty("display", "none", "important");
        }
      }
    });
  };

  if (e.key === "Escape") {
    const modalCritico = document.getElementById("cuentaGeneradaModalOverlay");
    if (modalCritico && modalCritico.classList.contains("open")) {
      e.preventDefault();
      return;
    }

    if (typeof haptic === "function") haptic();
    limpiarPantalla();
  }
});

// =========================================================================
// 🧮 CEREBRO DEL COTIZADOR AUTOMÁTICO DE COMBOS CYBERNET (ALGORITMO MAX-BASE)
// =========================================================================

function abrirCalculadoraCombos() {
  if (typeof haptic === "function") haptic();

  const container = document.getElementById("contenedorPlataformasCotizador");

  // 🔥 1. INYECTAR IPTV SI NO EXISTE EN EL HTML ORIGINAL
  if (container && !document.querySelector('.chk-cotizar-plat[value="IPTV"]')) {
    const iptvRow = document.createElement("div");
    iptvRow.className = "row-cotizar-plat";
    iptvRow.setAttribute("data-nombre", "iptv smarters");
    iptvRow.style.cssText =
      "border-bottom: 0.5px solid rgba(255, 255, 255, 0.06);";
    iptvRow.innerHTML = `
      <label style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; cursor: pointer; width: 100%;">
          <span style="font-size: 0.9rem; font-weight: 600; color: #30d158">IPTV Smarters ($7k)</span>
          <input type="checkbox" class="chk-cotizar-plat" value="IPTV" data-tipo="herramienta" onchange="controlarDisneyMutuo(this); calcularPreciosSistemaCotizador();" style="accent-color: var(--ios-blue); width: 18px; height: 18px;" />
      </label>
    `;
    container.appendChild(iptvRow);
  }

  // 🔥 2. INYECTAR DIRECTV GO SI NO EXISTE EN EL HTML ORIGINAL
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
      <label style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; cursor: pointer; width: 100%;">
          <span style="font-size: 0.9rem; font-weight: 600; color: #00bfff">Directv Go ($30k)</span>
          <input type="checkbox" class="chk-cotizar-plat" value="DIRECTV-GO" data-tipo="herramienta" onchange="controlarDisneyMutuo(this); calcularPreciosSistemaCotizador();" style="accent-color: var(--ios-blue); width: 18px; height: 18px;" />
      </label>
    `;
    container.appendChild(dgoRow);
  }

  // 🔥 3. ACTUALIZAR ETIQUETAS VISUALES AL NUEVO PRECIO INDIVIDUAL AL ABRIR
  document.querySelectorAll(".row-cotizar-plat label span").forEach((span) => {
    if (span.innerText.includes("Spotify")) span.innerText = "Spotify ($14k)";
    if (span.innerText.includes("Deezer")) span.innerText = "Deezer ($12k)";
    if (span.innerText.includes("Metegol")) span.innerText = "Metegol ($15k)";
    if (span.innerText.includes("YouTube"))
      span.innerText = "YouTube Premium ($14k)";
  });

  // 🔥 4. INYECTAR SELECTOR DE HASTA 5 PANTALLAS EN TODAS LAS PLATAFORMAS (AUTOMÁTICO)
  document.querySelectorAll(".row-cotizar-plat").forEach((row) => {
    if (!row.querySelector(".cotizador-pantallas-wrapper")) {
      let wrapper = document.createElement("div");
      wrapper.className = "cotizador-pantallas-wrapper";
      wrapper.style.display = "none";
      wrapper.style.padding = "0 14px 12px 14px";
      wrapper.style.justifyContent = "flex-end";

      wrapper.innerHTML = `
          <select class="input-ios sel-pantallas-cotizador" style="width: auto; padding: 6px 12px; font-size: 0.8rem; margin:0; border-radius: 8px; background: rgba(0,0,0,0.3); color: var(--text-primary); border: 1px solid rgba(255,255,255,0.1);" onchange="calcularPreciosSistemaCotizador()">
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

  // Desmarcar todos los checks y ocultar selects
  document.querySelectorAll(".chk-cotizar-plat").forEach((cb) => {
    cb.checked = false;
    controlarDisneyMutuo(cb);
  });

  document.getElementById("buscarPlataformaCotizador").value = "";
  document.getElementById("calcMonths").value = "1";
  document.getElementById("calcFidelidad").checked = false;

  document.getElementById("calcBasePriceDisplay").value = "$0";
  document.getElementById("calcSubtotal").innerText = "$0";
  document.getElementById("calcDiscount").innerText = "-$0";
  document.getElementById("rowCalcDescFiel").style.display = "none";
  document.getElementById("calcTotal").innerText = "$0";

  filtrarPlataformasCotizador();
  document.getElementById("comboCalcOverlay").classList.add("open");

  setTimeout(() => {
    document.getElementById("buscarPlataformaCotizador").focus();
  }, 120);
}

function cerrarCalculadoraCombos() {
  if (typeof haptic === "function") haptic();
  document.getElementById("comboCalcOverlay").classList.remove("open");
}

window.controlarDisneyMutuo = function (checkbox) {
  const tipo = checkbox.getAttribute("data-tipo");

  if (checkbox.checked) {
    if (tipo === "disneypre") {
      const de = document.querySelector(
        '.chk-cotizar-plat[data-tipo="disneyest"]',
      );
      if (de && de.checked) {
        de.checked = false;
        controlarDisneyMutuo(de);
      }
    } else if (tipo === "disneyest") {
      const dp = document.querySelector(
        '.chk-cotizar-plat[data-tipo="disneypre"]',
      );
      if (dp && dp.checked) {
        dp.checked = false;
        controlarDisneyMutuo(dp);
      }
    }

    const buscador = document.getElementById("buscarPlataformaCotizador");
    if (buscador && buscador.value !== "") {
      buscador.value = "";
      if (typeof filtrarPlataformasCotizador === "function") {
        filtrarPlataformasCotizador();
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
  const filas = document.querySelectorAll(
    "#contenedorPlataformasCotizador .row-cotizar-plat",
  );

  filas.forEach((fila) => {
    const nombrePlat = fila.getAttribute("data-nombre");
    const checkbox = fila.querySelector('input[type="checkbox"]');

    if (query === "") {
      fila.style.display = checkbox.checked ? "block" : "none";
    } else {
      if (nombrePlat.includes(query) || checkbox.checked) {
        fila.style.display = "block";
      } else {
        fila.style.display = "none";
      }
    }
  });
};

// =========================================================================
// 🧮 CEREBRO DEL COTIZADOR AUTOMÁTICO DE COMBOS CYBERNET (ALGORITMO MAX-BASE)
// =========================================================================

window.calcularPreciosSistemaCotizador = function () {
  // DICCIONARIO MAESTRO DE PRECIOS EXACTOS (INDIVIDUAL VS COMBO)
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
    // Herramientas Add-ons y Otras Cuentas
    "DIRECTV-GO": { indiv: 30000, combo: 25000, isTier: false }, // 🔥 CORREGIDO: $30k individual / $25k combo
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

  // 1. Escaneo de las plataformas y recolección de pantallas marcadas
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
          for (let i = 0; i < pantallas; i++) {
            allOtherScreens.push(val);
          }

          if (val === "DISNEY-PREMIUM") {
            countDisneyPremium += pantallas;
          } else if (mapValores[val].isTier) {
            countTierEligible++;
            for (let i = 1; i < pantallas; i++) {
              arrayAddonsDirectosYExtras.push(val);
            }
          } else {
            for (let i = 0; i < pantallas; i++) {
              arrayAddonsDirectosYExtras.push(val);
            }
          }
        }
      }
    }
  });

  // 2. Aplicación de la Facturación
  if (tieneNetflix) {
    precioBaseUnMes = costoNetflixCalculado;

    // Lógica de Tiers del Combo de Netflix
    if (countDisneyPremium > 0) {
      if (countTierEligible === 0)
        precioBaseUnMes += 10500; // Combo Dúo Premium -> Total: $25.000
      else if (countTierEligible === 1)
        precioBaseUnMes += 14500; // Combo Pro -> Total: $29.000
      else if (countTierEligible === 2)
        precioBaseUnMes += 17500; // Combo Cine Total -> Total: $32.000
      else if (countTierEligible >= 3)
        precioBaseUnMes += 20500 + (countTierEligible - 3) * 3000; // El Rey -> Total: $35.000

      precioBaseUnMes +=
        (countDisneyPremium - 1) * mapValores["DISNEY-PREMIUM"].combo;
    } else {
      if (countTierEligible === 0)
        precioBaseUnMes += 0; // Solo Netflix -> Total: $14.500
      else if (countTierEligible === 1)
        precioBaseUnMes += 5500; // Netflix + 1 -> Total: $20.000
      else if (countTierEligible === 2)
        precioBaseUnMes += 9500; // Netflix + 2 -> Total: $24.000
      else if (countTierEligible >= 3)
        precioBaseUnMes += 12500 + (countTierEligible - 3) * 3000; // Netflix + 3 -> Total: $27.000
    }

    // Sumamos las demás pantallas adicionales o Add-ons (Directv Go, Spotify, etc.) a precio combo
    arrayAddonsDirectosYExtras.forEach((plat) => {
      precioBaseUnMes += mapValores[plat].combo;
    });
  } else {
    // LÓGICA SIN NETFLIX: ALGORITMO MAX-BASE
    if (allOtherScreens.length === 0) {
      precioBaseUnMes = 0;
    } else if (allOtherScreens.length === 1) {
      precioBaseUnMes = mapValores[allOtherScreens[0]].indiv; // Única plataforma -> Precio Individual
    } else {
      allOtherScreens.sort((a, b) => mapValores[b].indiv - mapValores[a].indiv);

      let masCaro = allOtherScreens.shift(); // Extrae la más costosa
      precioBaseUnMes += mapValores[masCaro].indiv; // Se cobra a precio Individual Full

      allOtherScreens.forEach((plat) => {
        precioBaseUnMes += mapValores[plat].combo; // El resto se suma a precio Combo barato
      });
    }
  }

  // 3. Captura de Meses y Fidelidad
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

  // 4. Impresión en Pantalla
  document.getElementById("calcBasePriceDisplay").value =
    "$" + precioBaseUnMes.toLocaleString("es-CO");
  document.getElementById("calcSubtotal").innerText =
    "$" + subtotal.toLocaleString("es-CO");
  document.getElementById("calcDiscount").innerText =
    "-$" + montoDescuento.toLocaleString("es-CO");
  document.getElementById("calcTotal").innerText =
    "$" + totalA_Cobrar.toLocaleString("es-CO");
};

function copiarCotizacionCombo(btn) {
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

  const meses = document.getElementById("calcMonths").value;
  const porcDesc = document
    .getElementById("calcMonths")
    .options[
      document.getElementById("calcMonths").selectedIndex
    ].getAttribute("data-desc");
  const esClienteFiel = document.getElementById("calcFidelidad").checked;

  const subtotalText = document.getElementById("calcSubtotal").innerText;
  const discountText = document.getElementById("calcDiscount").innerText;
  const totalText = document.getElementById("calcTotal").innerText;

  let listaPlatFormateada = plataformasSeleccionadas.join("\n");

  let mensajeVIP =
    `💻 *¡TU COMBO STREAMING CYBERNET ESTÁ LISTO!* 🚀📺\n\n` +
    `🔥 *Servicios Incluidos:*\n${listaPlatFormateada}\n\n` +
    `🗓️ *Vigencia contratada:* ${meses} Mes(es) Garantizados\n`;

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
    btn.style.background = "var(--ios-green)";

    if (typeof CyberSonidos !== "undefined") CyberSonidos.play("exito");
    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path></svg><span>Cotización copiada con éxito</span></div>`,
      );
    }

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = "";
      cerrarCalculadoraCombos();
    }, 1500);
  });
}

// =========================================================================
// 🎛️ PANEL DE CONTROL DE INVENTARIO (ADMIN CAMILO)
// =========================================================================
const productosTiendaMaster = [
  { id: "btn_netflix", nombre: "Netflix" },
  { id: "btn_disney_prem", nombre: "Disney+ Premium" },
  { id: "btn_disney_std", nombre: "Disney Std" },
  { id: "btn_amazon", nombre: "Amazon Prime" },
  { id: "btn_max", nombre: "HBO Max" },
  { id: "btn_paramount", nombre: "Paramount+" },
  { id: "btn_vix", nombre: "Vix+" },
  { id: "btn_plex", nombre: "Plex TV" },
  { id: "btn_crunchy", nombre: "Crunchyroll" },
  { id: "apple", nombre: "Apple TV+" },
  { id: "btn_universal", nombre: "Universal+" },
  { id: "btn_iptv", nombre: "IPTV Smarters" },
  { id: "btn_flujo", nombre: "Flujo TV" },
  { id: "btn_directv", nombre: "Directv Go" },
  { id: "btn_emby", nombre: "Emby" },
  { id: "btn_canva", nombre: "Canva Pro" },
  { id: "btn_spotify", nombre: "Spotify" },
  { id: "btn_yt", nombre: "YouTube" },
  { id: "btn_deezer", nombre: "Deezer" },
  { id: "btn_metegol", nombre: "Metegol" },
];

document.addEventListener("DOMContentLoaded", () => {
  window.inyectarEstilosSwitchAdmin();
  if (document.getElementById("panelSwitchesStock")) {
    setTimeout(window.renderizarPanelCamilo, 500);
  }
});

window.toggleInventarioPanel = function () {
  const modal = document.getElementById("inventarioOverlay");
  if (!modal) {
    console.error("El modal de inventario no existe en el HTML.");
    return;
  }

  if (modal.style.display === "flex") {
    modal.style.display = "none";
  } else {
    modal.style.display = "flex";
    window.renderizarPanelCamilo(); // Refresca los switches al abrir
  }
};

// =========================================================================
// 🎛️ CYBERNET OS: INVENTARIO UNIFICADO INTELIGENTE (CUENTAS EN VIVO + INTERRUPTOR)
// =========================================================================

// Almacén global para guardar el conteo que viene de Google Sheets
window.cachedLibresData = [];

function actualizarPerfilesLibres(manual = false) {
  if (manual) haptic();

  const callbackName = "cb_libres_" + Date.now();
  window[callbackName] = function (res) {
    if (res && res.status === "success") {
      // 1. Guardamos el conteo fresco de Sheets en la memoria global
      window.cachedLibresData = res.data;

      // 2. Le ordenamos a la lista de switches que se redibuje para mostrar los nuevos números
      if (typeof window.renderizarPanelCamilo === "function") {
        window.renderizarPanelCamilo();
      }

      // Mantiene tu detector de alertas en segundo plano
      verificarStockCritico(res.data);
    }

    delete window[callbackName];
    const scriptNode = document.getElementById("node_" + callbackName);
    if (scriptNode) scriptNode.remove();
  };

  const script = document.createElement("script");
  script.id = "node_" + callbackName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerPerfilesLibres&callback=${callbackName}`;
  document.body.appendChild(script);
}

// Helper inteligente para emparejar el array local con las columnas de Google Sheets
function obtenerConteoLibreDinamico(idProducto) {
  if (!window.cachedLibresData || window.cachedLibresData.length === 0)
    return "-";

  // Normalizamos el ID (ej: btn_disney_prem -> DISNEYPREMIUM)
  let key = idProducto.replace("btn_", "").replace(/_/g, "").toUpperCase();
  if (key === "MAX") key = "HBOMAX";
  if (key === "DISNEYSTD") key = "DISNEYESTANDAR";
  if (key === "YT") key = "YOUTUBE";
  if (key === "CRUNCHY") key = "CRUNCHYROLL";

  let encontrado = window.cachedLibresData.find((item) => {
    let platNorm = item.plat.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    return platNorm === key || platNorm.includes(key) || key.includes(platNorm);
  });

  return encontrado ? encontrado.libres : "0";
}

// =========================================================================
// 🎛️ INVENTARIO UNIFICADO BENTO DE DOS COLUMNAS (IPADOS EDITION)
// =========================================================================
window.renderizarPanelCamilo = function () {
  const contenedor = document.getElementById("panelSwitchesStock");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  const userActivo = (sessionStorage.getItem("active_staff") || "")
    .toUpperCase()
    .trim();
  const esCamilo = userActivo === "CAMILO";
  const agotados = JSON.parse(
    localStorage.getItem("cyber_items_agotados") || "[]",
  );

  productosTiendaMaster.forEach((p) => {
    const estaAgotado = agotados.includes(p.id);
    const cantLibres = window.obtenerConteoLibreDinamico(p.id);

    const row = document.createElement("div");
    // Transformamos cada celda en un micro-widget iPadOS perfectamente alineado
    row.className = "widget-ipad";
    row.style.cssText =
      "padding: 12px 16px !important; flex-direction: row !important; justify-content: space-between !important; align-items: center !important; margin: 0 !important; gap: 10px !important; background: #1c1c1e !important; border-radius: 16px !important;";

    const inputDisabled = esCamilo
      ? ""
      : "disabled style='cursor: not-allowed;'";
    const labelAction = esCamilo
      ? ""
      : `onclick="alert('🔒 ACCESO RESTRINGIDO\\n\\nSolo el administrador Camilo puede alterar el estado de venta de las plataformas.')"`;

    row.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 2px; overflow: hidden; padding-right: 4px;">
          <span style="font-size: 0.92rem; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.nombre}</span>
          <span style="font-size: 0.76rem; color: var(--text-secondary); font-weight: 600; font-family: monospace;">(${cantLibres} libres)</span>
        </div>
        
        <label class="switch-camilo" ${labelAction} style="flex-shrink: 0;">
          <input type="checkbox" ${estaAgotado ? "checked" : ""} ${inputDisabled} onchange="window.cambiarStockDesdeAdmin('${p.id}')">
          <span class="slider-camilo" style="${!esCamilo ? "opacity: 0.5; filter: grayscale(1);" : ""}"></span>
        </label>
      `;
    contenedor.appendChild(row);
  });
};
window.cambiarStockDesdeAdmin = function (id) {
  let agotados = JSON.parse(
    localStorage.getItem("cyber_items_agotados") || "[]",
  );
  if (agotados.includes(id)) {
    agotados = agotados.filter((item) => item !== id); // Recupera stock
  } else {
    agotados.push(id); // Se agotó
  }
  localStorage.setItem("cyber_items_agotados", JSON.stringify(agotados));
};

window.inyectarEstilosSwitchAdmin = function () {
  if (document.getElementById("css-switch-camilo")) return;
  const estilo = document.createElement("style");
  estilo.id = "css-switch-camilo";
  estilo.innerHTML = `
      .switch-camilo { position: relative; display: inline-block; width: 48px; height: 26px; }
      .switch-camilo input { opacity: 0; width: 0; height: 0; }
      .slider-camilo { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #30d158; transition: .3s; border-radius: 30px; }
      .slider-camilo:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
      input:checked + .slider-camilo { background-color: #ff453a; }
      input:checked + .slider-camilo:before { transform: translateX(22px); }
    `;
  document.head.appendChild(estilo);
};
// ⚡ MOTOR DE SINCRONIZACIÓN DE PAGOS: Descarga los turnos liquidados desde Google Cloud
function sincronizarTachadosConNube(callback) {
  const cbName = "cb_get_tachar_" + Date.now();
  window[cbName] = function (res) {
    const node = document.getElementById("node_" + cbName);
    if (node) node.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      localStorage.setItem("cyber_turnos_tachados", JSON.stringify(res.data));
    }
    if (callback) callback();
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerTachadosBackend&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
}
// =========================================================================
// 📱 CONTROLADOR INTEGRADO: DOCK COLAPSABLE INTELIGENTE PARA CELULARES
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const bottomBar = document.querySelector(".ios-bottom-bar");
  if (!bottomBar) return;

  // 1. Creamos el botón disparador minimalista para el celular
  const menuTrigger = document.createElement("div");
  menuTrigger.className = "mobile-menu-trigger";
  menuTrigger.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
    <span>Menú</span>
  `;

  // 2. Lo inyectamos al inicio de tu barra de herramientas
  bottomBar.insertBefore(menuTrigger, bottomBar.firstChild);

  // 3. Evento Toggle: Expande o encoge el menú en bloque
  menuTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    haptic();
    bottomBar.classList.toggle("mobile-expanded");
  });

  // 4. Auto-Cierre: Si toca cualquier opción del menú, este se encoge al instante
  bottomBar.querySelectorAll(".ios-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      bottomBar.classList.remove("mobile-expanded");
    });
  });

  // 5. Cierre Externo: Si toca fuera del menú, también se cierra de forma segura
  document.addEventListener("click", () => {
    bottomBar.classList.remove("mobile-expanded");
  });
});
// ⚡ MOTOR DE ADELANTOS EXCLUSIVO DESDE PANEL TURNOS (CONEXIÓN DIRECTA BACKEND)
window.toggleModalAdelanto = function (abrir) {
  if (typeof haptic === "function") haptic();
  const modal = document.getElementById("adelantoShiftOverlay");
  if (!modal) return;
  if (abrir) {
    document.getElementById("formAdelantoShift").reset();
    modal.classList.add("open");
    setTimeout(() => document.getElementById("adeMonto").focus(), 150);
  } else {
    modal.classList.remove("open");
  }
};

window.ejecutarAdelantoDesdeShift = function (e) {
  e.preventDefault();
  if (typeof haptic === "function") haptic();

  const empleado = document.getElementById("adeEmpleado").value;
  const montoRaw = document.getElementById("adeMonto").value;
  const monto = parseFloat(montoRaw.replace(/[^0-9]/g, ""));

  if (!empleado || isNaN(monto) || monto <= 0) {
    alert("⚠️ Por favor ingresa un monto válido.");
    return;
  }

  const btn = document.getElementById("btnSubmitAdeShift");
  const originalText = btn.innerHTML;
  btn.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:6px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg> Aplicando...`;
  btn.disabled = true;

  const scriptNode = document.createElement("script");
  const callbackName = "cbAdeShift_" + Date.now();

  window[callbackName] = function (res) {
    btn.innerHTML = originalText;
    btn.disabled = false;
    delete window[callbackName];
    scriptNode.remove();

    if (res && res.status === "success") {
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>¡Adelanto de $${monto.toLocaleString("es-CO")} aplicado a ${empleado}!</span></div>`,
        );
      }
      window.toggleModalAdelanto(false);
      if (typeof forzarRefrescoDeHoras === "function") forzarRefrescoDeHoras(); // Refresca los turnos de fondo
    } else {
      alert("❌ ERROR:\n\n" + (res ? res.message : "Desconocido"));
    }
  };

  scriptNode.id = "script_ade_shift";
  scriptNode.src =
    GOOGLE_SCRIPT_URL +
    "?action=agregarDescuentoNomina&empleado=" +
    encodeURIComponent(empleado) +
    "&monto=" +
    encodeURIComponent(monto) +
    "&concepto=" +
    encodeURIComponent("ADELANTO - Panel Turnos") +
    "&callback=" +
    callbackName +
    "&_ts=" +
    Date.now();
  document.body.appendChild(scriptNode);
};

// =========================================================================
// 🔍 CYBERNET OS: MOTOR SPOTLIGHT RECALIBRADO (FILTRO VERSÁTIL)
// =========================================================================
window.filtrarTarjetasMac = function () {
  const input = document.getElementById("macSearchCards");
  const container = document.getElementById("grid-container");
  const emptyState = document.getElementById("macEmptyState");

  if (!input || !container) return;

  // Texto limpio: minúsculas y sin espacios a los lados
  const filtro = input.value.toLowerCase().trim();
  const tarjetas = container.getElementsByClassName("card-ios");
  let encontradas = 0;

  for (let i = 0; i < tarjetas.length; i++) {
    const tarjeta = tarjetas[i];

    // Capturamos el título de la tarjeta (el <h2> interno)
    const tituloEl = tarjeta.querySelector(".card-title");
    const titulo = tituloEl
      ? tituloEl.innerText.toLowerCase()
      : tarjeta.innerText.toLowerCase();

    // 🎯 LÓGICA VERSÁTIL: Si el título INCLUYE el texto escrito, lo muestra.
    // Si el buscador está vacío (filtro === ""), también muestra todo.
    if (titulo.includes(filtro) || filtro === "") {
      tarjeta.style.setProperty("display", "flex", "important");
      encontradas++;
    } else {
      tarjeta.style.setProperty("display", "none", "important");
    }
  }

  // ⚠️ Control visual de estado vacío si no hay coincidencias
  if (emptyState) {
    if (encontradas === 0) {
      const textoMensaje = emptyState.querySelector("span");
      if (textoMensaje) {
        textoMensaje.innerText = `No se encontraron plantillas con "${input.value}".`;
      }
      emptyState.style.setProperty("display", "flex", "important");
    } else {
      emptyState.style.setProperty("display", "none", "important");
    }
  }
};

// Aseguramos que al cargar la página por primera vez se muestren todas las tarjetas
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (typeof window.filtrarTarjetasMac === "function") {
      window.filtrarTarjetasMac();
    }
  }, 100);
});

// 🛡️ Observador: Oculta las tarjetas automáticamente apenas Sheets las inyecte en la página
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("grid-container");
  if (grid) {
    const observer = new MutationObserver(() => {
      const input = document.getElementById("macSearchCards");
      if (input && input.value.trim() === "") {
        filtrarTarjetasMac(); // Ejecuta el filtro para esconderlas
      }
    });
    observer.observe(grid, { childList: true });
  }
});
// =========================================================================
// 🔒 SEGURIDAD: BOTÓN DE INVENTARIO SUPERIOR SOLO PARA CAMILO
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const userActivo = (sessionStorage.getItem("active_staff") || "")
    .toUpperCase()
    .trim();
  const btnInvMenu = document.getElementById("menuBtnInventario");

  if (btnInvMenu) {
    if (userActivo === "CAMILO") {
      btnInvMenu.style.display = "inline-block"; // Lo enciende
    } else {
      btnInvMenu.style.display = "none"; // Lo apaga
    }
  }
  // 🔥 FORZAR INYECTOR DE SESIÓN MAC EN PANTALLA
  const sesionGuardada = sessionStorage.getItem("active_staff") || "CAMILO";
  const txtNombreBarra = document.getElementById("staffSessionName");
  if (txtNombreBarra) {
    txtNombreBarra.innerText = sesionGuardada.toUpperCase().trim();
  }
});
// =========================================================================
// 🗂️ CYBERNET OS: CERRADOR DE VENTAS INFALIBLE (MODO ESCRITORIO LIMPIO)
// =========================================================================
document.addEventListener(
  "click",
  (e) => {
    const tocasteMenu = e.target.closest(".mac-menu-item");
    const tocasteDock = e.target.closest(".mac-dock-icon");

    if (tocasteMenu || tocasteDock) {
      // 📋 CORREGIDO: IDs exactos de los contenedores HTML de las 3 bóvedas nuevas
      const ventanasPrincipales = [
        "codesOverlay",
        "shiftsOverlay",
        "inventarioOverlay",
        "promoOverlay",
        "recordatoriosOverlay",
        "addHoursOverlay",
        "anaCodesOverlay", // 🌟 Corregido de función a ID
        "chayoOverlay", // 🌟 Corregido de función a ID
        "yopmailOverlay", // 🌟 Corregido de función a ID
        "distrisOverlay",
        "finanzasOverlay",
        "ventasOverlay",
        "cargarOverlay",
        "garantiasOverlay",
        "netflixManagerOverlay",
        "libroOverlay",
        "gmailOverlay",
      ];

      ventanasPrincipales.forEach((id) => {
        const ventana = document.getElementById(id);
        if (ventana) {
          ventana.classList.remove("open");
          if (
            ventana.style.display === "flex" ||
            ventana.style.display === "block"
          ) {
            ventana.style.display = "none";
          }
        }
      });
    }
  },
  true,
);
// =========================================================================
// 🍎 CYBERNET OS: MOTOR DE ALERTA DE STOCK DE MAC INTEGRADO (V2 UNIFICADO)
// =========================================================================
window.timerElapsedNotif = null;
window.cachedLibresData = [];

window.actualizarPerfilesLibres = function (manual = false) {
  if (manual && typeof haptic === "function") haptic();

  const callbackName = "cb_libres_" + Date.now();

  window[callbackName] = function (res) {
    if (res && res.status === "success") {
      window.cachedLibresData = res.data;

      if (typeof window.renderizarPanelCamilo === "function") {
        window.renderizarPanelCamilo();
      }

      verificarStockCritico(res.data);
    }

    delete window[callbackName];
    const scriptNode = document.getElementById("node_" + callbackName);
    if (scriptNode) scriptNode.remove();
  };

  const script = document.createElement("script");
  script.id = "node_" + callbackName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerPerfilesLibres&callback=${callbackName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.obtenerConteoLibreDinamico = function (idProducto) {
  if (!window.cachedLibresData || window.cachedLibresData.length === 0)
    return "-";

  let key = idProducto.replace("btn_", "").replace(/_/g, "").toUpperCase();
  if (key === "MAX") key = "HBOMAX";
  if (key === "DISNEYSTD") key = "DISNEYESTANDAR";
  if (key === "YT") key = "YOUTUBE";
  if (key === "CRUNCHY") key = "CRUNCHYROLL";
  if (key === "APPLE") key = "APPLETV";
  if (key === "DIRECTV") key = "DIRECTVGO";

  let encontrado = window.cachedLibresData.find((item) => {
    let platNorm = item.plat.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    return platNorm === key || platNorm.includes(key) || key.includes(platNorm);
  });

  return encontrado ? encontrado.libres : "0";
};

function verificarStockCritico(data) {
  let sessionStaff = sessionStorage.getItem("active_staff");
  let localStaff = localStorage.getItem("cyber_saved_staff");
  if (!sessionStaff && !localStaff) return;

  const umbrales = {
    NETFLIX: 2,
    AMAZON: 5,
    HBOMAX: 5,
    DISNEYPREMIUM: 1,
    DISNEYESTANDAR: 1,
    CRUNCHYROLL: 1,
    PLEX: 1,
    APPLETV: 1,
  };
  let bajas = [];

  data.forEach((item) => {
    let keyNorm = item.plat.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    let limite = umbrales[keyNorm] || 1;
    let libresNum = parseInt(item.libres, 10);

    if (!isNaN(libresNum) && libresNum <= limite) {
      let nombreLimpio = item.plat.replace(/-/g, " ");
      bajas.push(`${nombreLimpio} (${libresNum})`);
    }
  });

  if (bajas.length > 0) {
    lanzarBannerMacosStock(bajas.join(", "));
  }
}

// 🛡️ MOTOR DEL BANNER FLOTANTE DE INVENTARIO EN PANTALLA
function lanzarBannerMacosStock(listaPlataformas) {
  const banner = document.getElementById("macNotificationBanner");
  const texto = document.getElementById("macNotifText");
  const visorTiempo = document.getElementById("macNotifTime");

  if (!banner || !texto || !visorTiempo) return;

  clearInterval(window.timerElapsedNotif);
  banner.style.transform = "translateX(120%)";
  banner.style.opacity = "0";

  // 👈 Despierta el banner antes de animarlo para que ocupe su espacio
  banner.style.display = "flex";

  setTimeout(() => {
    texto.innerHTML = `Plataformas bajas o agotadas:<br><b style="color:#ffffff;">${listaPlataformas}</b>`;
    visorTiempo.innerText = "Ahora";
    banner.style.transform = "translateX(0)";
    banner.style.opacity = "1";

    if (typeof haptic === "function") haptic();

    let minutosTranscurridos = 0;
    window.timerElapsedNotif = setInterval(() => {
      minutosTranscurridos++;
      visorTiempo.innerText = `Hace ${minutosTranscurridos} min`;
    }, 60000);
  }, 50); // 👈 Reducido a 50ms para que la animación sea más rápida y fluida
}

// ✕ FUNCIÓN PARA CERRAR EL BANNER DE INVENTARIO MANUALMENTE
window.cerrarBannerNotificacionManualmente = function () {
  const banner = document.getElementById("macNotificationBanner");
  if (banner) {
    banner.style.transform = "translateX(120%)";
    banner.style.opacity = "0";
    clearInterval(window.timerElapsedNotif);

    // 👈 Elimina el hueco fantasma cuando termina la animación de salida
    setTimeout(() => {
      banner.style.display = "none";
    }, 400);
  }
};

// =========================================================================
// ⏱️ RELOJ AUTOMÁTICO DE SEGUIMIENTO INTERNO (CALIBRADO A 5 MINUTOS)
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    window.actualizarPerfilesLibres(false);
  }, 2000);

  if (window.intervaloLibresAuto) clearInterval(window.intervaloLibresAuto);

  // 🔄 SINCRONIZACIÓN PERFECTA: Dispara el radar contable cada 5 minutos exactos
  window.intervaloLibresAuto = setInterval(
    () => {
      window.actualizarPerfilesLibres(false);
    },
    5 * 60 * 1000,
  ); // ⏱️ 300.000 ms
});
// =========================================================================
// 🔒 SEGURIDAD: CONTROLADOR DEL BOTÓN DE INVENTARIO SUPERIOR
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const btnInvMenu = document.getElementById("menuBtnInventario");
  if (btnInvMenu) {
    btnInvMenu.style.display = "inline-block"; // Habilitado para todo el personal de Cybernet
  }

  // Mantener el inyector forzado de sesión que ya tenías abajo
  const sesionGuardada = sessionStorage.getItem("active_staff") || "CAMILO";
  const txtNombreBarra = document.getElementById("staffSessionName");
  if (txtNombreBarra) {
    txtNombreBarra.innerText = sesionGuardada.toUpperCase().trim();
  }
});

// =========================================================================
// 📥 MOTOR DE BÚSQUEDA DE CORREOS INTEGRADO (TKDJGZ)
// =========================================================================

window.ejecutarBusquedaCorreoInterno = function () {
  if (typeof haptic === "function") haptic();

  // 1. Capturamos lo que escribiste
  let inputVisual = document.getElementById("inputBuscadorCorreos");
  let correoBuscar = inputVisual.value.trim();

  // 2. Si lo dejó vacío, avisamos
  if (correoBuscar === "") {
    alert("⚠️ Por favor ingresa el nombre del correo que deseas buscar.");
    inputVisual.focus();
    return;
  }

  // Limpiamos por si el empleado escribió por error "@tkdjgz.com"
  correoBuscar = correoBuscar.split("@")[0];

  // 3. Le inyectamos el correo al formulario fantasma
  document.getElementById("inputRecipientFantasma").value = correoBuscar;

  // 4. Ponemos la pantalla a "cargar" visualmente
  let iframe = document.getElementById("iframeCorreosResultado");
  iframe.style.opacity = "0.5";

  if (typeof triggerToast === "function") {
    triggerToast(`✨ Buscando bandeja de ${correoBuscar}...`);
  }

  // 5. Disparamos el envío directo a la página de ellos
  document.getElementById("formFantasmaCorreos").submit();

  // 6. Restauramos la opacidad cuando cargue
  setTimeout(() => {
    iframe.style.opacity = "1";
    if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");
  }, 1000);
};

// =========================================================================
// 🟣 MOTOR AVANZADO: EXTRACCIÓN NATIVA VÍA GOOGLE APPS SCRIPT
// =========================================================================

window.ejecutarBusquedaCorreoInterno = function () {
  if (typeof haptic === "function") haptic();

  let inputVisual = document.getElementById("inputBuscadorCorreos");
  let correoBuscar = inputVisual.value.trim().split("@")[0];

  if (correoBuscar === "") {
    alert("⚠️ Por favor ingresa el nombre del correo que deseas buscar.");
    inputVisual.focus();
    return;
  }

  let contenedor = document.getElementById("contenedorNativoCorreos");

  contenedor.innerHTML = `
    <div style="margin: auto; color: var(--ios-purple); text-align: center;">
       <svg class="spin-anim" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
       </svg>
       <br><br><span style="font-weight: 600;">Usando el servidor de Google para extraer correos...</span>
    </div>`;

  const cbName = "cb_correos_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      let html = res.html;
      let parser = new DOMParser();
      let doc = parser.parseFromString(html, "text/html");

      let table = doc.getElementById("emailTable");
      if (!table) {
        contenedor.innerHTML = `<div style="margin: auto; color: var(--ios-red); font-weight: bold;">No hay correos recientes en esta bandeja.</div>`;
        return;
      }

      // Extraer JS info del cuerpo del correo
      let match =
        html.match(/var\s+emailBody\s*=\s*(\[.*?\])\[index\]\.body;/s) ||
        html.match(/var\s+emailsData\s*=\s*(\[.*?\]);/s);
      if (match && match[1]) {
        try {
          window.correosExtraidosNativos = JSON.parse(match[1]);
        } catch (e) {
          window.correosExtraidosNativos = [];
        }
      }

      let filas = table.querySelectorAll("tr");
      if (filas.length <= 1) {
        contenedor.innerHTML = `<div style="margin: auto; color: var(--ios-green); font-weight: bold;">La bandeja está limpia.</div>`;
        return;
      }

      // Generar la tabla en modo oscuro VIP
      let htmlTabla = `<table style="width: 100%; border-collapse: collapse; text-align: left;">`;
      filas.forEach((row, i) => {
        if (i === 0) {
          htmlTabla += `<tr style="border-bottom: 1px solid rgba(191, 90, 242, 0.3); color: var(--ios-purple);">`;
          row
            .querySelectorAll("th")
            .forEach(
              (th) =>
                (htmlTabla += `<th style="padding: 16px; font-weight: 800; text-transform: uppercase; font-size: 0.85rem;">${th.innerText}</th>`),
            );
          htmlTabla += `</tr>`;
        } else {
          let cols = row.querySelectorAll("td");
          if (cols.length >= 2) {
            htmlTabla += `
                 <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(191, 90, 242, 0.1)'" onmouseout="this.style.background='transparent'" onclick="abrirLectorCorreo(${i - 1})">
                    <td style="padding: 16px; color: var(--text-primary); font-weight: 600; font-size: 0.95rem;">${cols[0].innerText}</td>
                    <td style="padding: 16px; color: var(--text-secondary); font-size: 0.85rem; font-family: monospace;">${cols[1].innerText}</td>
                 </tr>`;
          }
        }
      });
      htmlTabla += `</table>`;

      if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");
      contenedor.innerHTML = htmlTabla;
    } else {
      contenedor.innerHTML = `<div style="margin: auto; color: var(--ios-red); font-weight: bold;">Error: ${res ? res.message : "Fallo de conexión"}</div>`;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  // Llamamos a TU Google Script para que él haga el trabajo sucio
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerCorreosTK&correo=${encodeURIComponent(correoBuscar)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.abrirLectorCorreo = function (index) {
  if (typeof haptic === "function") haptic();
  let data = window.correosExtraidosNativos[index];
  if (data && data.body) {
    document.getElementById("cuerpoLectorCorreo").innerHTML = data.body;
    document.getElementById("modalLectorCorreo").style.display = "flex";
  } else {
    alert("No se pudo cargar el cuerpo de este correo.");
  }
};

window.cerrarLectorCorreo = function () {
  if (typeof haptic === "function") haptic();
  document.getElementById("modalLectorCorreo").style.display = "none";
  document.getElementById("cuerpoLectorCorreo").innerHTML = "";
};

// =========================================================================
// 🟡 MOTOR: ACCESO DIRECTO Y PRESSETS FIJOS YOPMAIL
// =========================================================================

window.toggleYopmailPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("yopmailOverlay");
  if (overlay) {
    overlay.classList.toggle("open");

    if (overlay.classList.contains("open")) {
      document.getElementById("inputYopmailCorreos").value = "";
      setTimeout(() => {
        document.getElementById("inputYopmailCorreos").focus();
      }, 150);
    }
  }
};

window.abrirVentanaYopmail = function () {
  if (typeof haptic === "function") haptic();

  let inputVisual = document.getElementById("inputYopmailCorreos");
  let correoBuscar = inputVisual.value.trim().split("@")[0];

  if (correoBuscar === "") {
    alert("⚠️ Por favor ingresa el nombre del correo.");
    inputVisual.focus();
    return;
  }

  window.buscarYopmailDirecto(correoBuscar);
};

window.buscarYopmailDirecto = function (correo) {
  if (typeof haptic === "function") haptic();

  // Limpia cualquier dominio sobrante por si acaso
  let correoLimpio = correo.trim().split("@")[0];

  // Ocultamos el buscador de tu panel de Cybernet
  const overlay = document.getElementById("yopmailOverlay");
  if (overlay) overlay.classList.remove("open");

  if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");
  if (typeof triggerToast === "function") {
    triggerToast(`✨ Abriendo buzón de Yopmail: ${correoLimpio}...`);
  }

  // Despliega la mini-ventana externa tipo aplicación
  let urlYopmail = `https://yopmail.com/?login=${encodeURIComponent(correoLimpio)}`;
  let opcionesVentana =
    "width=850,height=650,left=250,top=100,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes";

  window.open(urlYopmail, "YopmailBandeja", opcionesVentana);
};

// =========================================================================
// 🔴 MOTOR: PANEL MAXI-PANORÁMICO CHAYO (CON EFECTO CORTINA PROTEGIDO)
// =========================================================================

window.toggleChayoPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("chayoOverlay");
  const iframe = document.getElementById("iframeChayo");
  const barra = document.getElementById("barraCredencialesChayo");

  if (overlay) {
    overlay.classList.toggle("open");

    if (overlay.classList.contains("open")) {
      // 🔄 Reseteo de cortina intermedia al abrir la app
      if (barra) {
        barra.style.maxHeight = "80px";
        barra.style.padding = "12px 20px";
        barra.style.borderBottomWidth = "1px";
        barra.style.opacity = "1";
      }

      if (iframe.src.includes("about:blank")) {
        iframe.src = "https://chayonet.github.io/tienda/";
      }
    }
  }
};

window.copiarCredencialChayo = function (texto, btn, tipo) {
  if (typeof haptic === "function") haptic();

  navigator.clipboard.writeText(texto).then(() => {
    let originalText = btn.innerText;

    btn.innerText = "¡Copiado!";
    btn.style.background = "rgba(50, 215, 75, 0.15)";
    btn.style.color = "var(--ios-green)";
    btn.style.borderColor = "rgba(50, 215, 75, 0.3)";

    if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");

    setTimeout(() => {
      btn.innerText = originalText;
      btn.style.background = "rgba(255,55,95,0.1)";
      btn.style.color = "#ff375f";
      btn.style.borderColor = "rgba(255,55,95,0.3)";
    }, 1500);

    // ⚡ Desaparece únicamente el llavero intermedio a los 5 segundos de copiar la clave
    if (tipo === "clave") {
      setTimeout(() => {
        const barra = document.getElementById("barraCredencialesChayo");
        if (barra && barra.style.maxHeight !== "0px") {
          barra.style.maxHeight = "0px";
          barra.style.padding = "0px 20px";
          barra.style.borderBottomWidth = "0px";
          barra.style.opacity = "0";
          if (typeof triggerToast === "function") {
            triggerToast("🔓 Acceso completado. Maximizando visualización.");
          }
        }
      }, 5000);
    }
  });
};
// =========================================================================
// NUEVA FUNCIÓN: COPIAR CORREO EN PANEL DE CORTES (SIN ABRIR URL)
// =========================================================================
window.copiarCorreoNetflixCorte = function (btn, correo) {
  if (typeof haptic === "function") haptic();

  navigator.clipboard.writeText(correo).then(function () {
    let oldBg = btn.style.background;
    let oldColor = btn.style.color;

    btn.style.background = "var(--ios-green)";
    btn.style.color = "#ffffff";

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Correo copiado</span></div>`,
      );
    }

    setTimeout(function () {
      btn.style.background = oldBg;
      btn.style.color = oldColor;
    }, 1500);

    // Se eliminó la línea que abría Netflix automáticamente
  });
};
window.toggleLibroPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("libroOverlay");
  if (overlay) {
    overlay.classList.toggle("open");
  }
};
// =========================================================================
// 🔴 MOTOR: LECTOR DE CORREOS GLOBAL FILTRADO POR DESTINATARIO (ÚLTIMA HORA)
// =========================================================================
window.correosGlobalesData = [];

window.toggleGmailPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("gmailOverlay");
  if (overlay) {
    overlay.style.setProperty("display", "", "important");
    overlay.classList.toggle("open");

    if (overlay.classList.contains("open")) {
      // Limpiamos la interfaz y dejamos una pantalla de espera limpia
      document.getElementById("inputBuscadorGmailReal").value = "";
      document.getElementById("gmailScrollArea").innerHTML = `
        <div style="margin: auto; color: var(--text-secondary); text-align: center; padding: 60px 20px;">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ea4335" stroke-width="2" style="margin-bottom: 15px; opacity: 0.7;">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
           </svg>
           <br><span style="font-weight: 600;">Ingresa un correo arriba para escanear su bandeja</span>
        </div>`;
      setTimeout(() => {
        document.getElementById("inputBuscadorGmailReal").focus();
      }, 150);
    }
  }
};

window.ejecutarBusquedaGmailEspecifica = function () {
  if (typeof haptic === "function") haptic();

  const inputVisual = document.getElementById("inputBuscadorGmailReal");
  const correoBuscar = inputVisual.value.trim();
  const container = document.getElementById("gmailScrollArea");

  if (correoBuscar === "") {
    alert("⚠️ Por favor ingresa el correo completo que deseas buscar.");
    inputVisual.focus();
    return;
  }

  container.innerHTML = `
    <div style="text-align:center; padding:60px 20px; color:var(--text-secondary); font-size:0.95rem;">
      <svg class="spin-anim" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ea4335" stroke-width="2.5" style="margin-bottom:12px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
      <br><span style="color:#ea4335; font-weight:700;">Buscando correos de la última hora para: ${correoBuscar}...</span>
    </div>`;

  const oldScript = document.getElementById("cyber_gmail_global_node");
  if (oldScript) oldScript.remove();

  const cbName = "cb_gmail_global_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      if (res.data.length === 0) {
        container.innerHTML =
          '<div style="text-align:center; padding:60px 20px; color:var(--ios-orange); font-weight:bold; font-size:1rem;">📭 No se encontraron correos nuevos para este destinatario.</div>';
        return;
      }

      window.correosGlobalesData = res.data;
      let htmlTabla = `<table style="width: 100%; border-collapse: collapse; text-align: left;">`;

      res.data.forEach((mail, i) => {
        let remitenteLimpio = mail.remitente.replace(/<.*?>/g, "").trim();
        if (remitenteLimpio === "") remitenteLimpio = mail.remitente;

        let destinatarioLimpio = mail.destinatario.replace(/<.*?>/g, "").trim();
        if (destinatarioLimpio === "") destinatarioLimpio = mail.destinatario;

        htmlTabla += `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s;" 
              onmouseover="this.style.background='rgba(234, 67, 53, 0.1)'" 
              onmouseout="this.style.background='transparent'" 
              onclick="window.abrirLectorCorreoGlobal(${i})">
             
             <td style="padding: 16px 12px; width: 35%; vertical-align: middle;">
                <div style="color: var(--text-primary); font-weight: 800; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">${remitenteLimpio}</div>
                <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">
                  Para: <span style="color: var(--ios-blue); font-family: monospace; font-weight: 600;">${destinatarioLimpio}</span>
                </div>
             </td>
             
             <td style="padding: 16px 12px; width: 50%; vertical-align: middle;">
                <div style="display: flex; flex-direction: column; gap: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 380px;">
                  <span style="color: var(--text-primary); font-weight: 700; font-size: 0.95rem;">${mail.asunto}</span>
                  <span style="color: var(--text-secondary); font-size: 0.85rem;">${mail.fragmento}</span>
                </div>
             </td>
             
             <td style="padding: 16px 12px; width: 15%; text-align: right; vertical-align: middle;">
                <div style="color: var(--text-secondary); font-size: 0.8rem; font-family: monospace; font-weight: bold;">${mail.fecha}</div>
             </td>
          </tr>`;
      });

      htmlTabla += `</table>`;
      container.innerHTML = htmlTabla;
      if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");
    } else {
      container.innerHTML = `<div style="color:var(--ios-red); text-align:center; padding:40px; font-weight:700;">Error: ${res ? res.message : "Fallo de conexión"}</div>`;
    }
  };

  const script = document.createElement("script");
  script.id = "cyber_gmail_global_node";
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerCorreosRecientesGlobal&correo=${encodeURIComponent(correoBuscar)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// Puedes borrar la función filtrarCorreosGlobales vieja ya que el buscador opera en la nube

// 👇 NUEVO: FUNCIÓN PARA EL BUSCADOR 👇
window.filtrarCorreosGlobales = function () {
  const query = document
    .getElementById("buscadorGmailGlobal")
    .value.toLowerCase()
    .trim();
  const filas = document.querySelectorAll(".fila-correo-global");

  filas.forEach((fila) => {
    // Busca en todo el texto de la fila (remitente, destinatario y asunto)
    if (fila.innerText.toLowerCase().includes(query)) {
      fila.style.display = "";
    } else {
      fila.style.display = "none";
    }
  });
};

// Abre el sub-modal blanco con el contenido HTML real del correo
window.abrirLectorCorreoGlobal = function (index) {
  if (typeof haptic === "function") haptic();
  let data = window.correosGlobalesData[index];

  if (data && data.cuerpoHtml) {
    document.getElementById("cuerpoLectorCorreoGlobal").innerHTML =
      data.cuerpoHtml;
    document.getElementById("modalLectorCorreoGlobal").style.display = "flex";
  } else {
    alert("No se pudo extraer el cuerpo de este correo.");
  }
};

// Cierra el sub-modal blanco
window.cerrarLectorCorreoGlobal = function () {
  if (typeof haptic === "function") haptic();
  document.getElementById("modalLectorCorreoGlobal").style.display = "none";
  document.getElementById("cuerpoLectorCorreoGlobal").innerHTML = "";
};
// =========================================================================
// 🔒 GESTOR DE SEGURIDAD PRIVADA DE 10 SEGUNDOS: BÓVEDA CHAYO (DISPLAY ENGINE)
// =========================================================================
let cronometroChayo = null;

function revelarDatosChayoTemporizados() {
  if (typeof haptic === "function") haptic();

  const barra = document.getElementById("barraCredencialesChayo");
  const botonVer = document.getElementById("btnVerDatosChayo");
  if (!barra || !botonVer) return;

  // 🔥 Revelación absoluta en formato Flex superando cualquier bloqueo
  barra.style.setProperty("display", "flex", "important");

  // Congelamos el botón de activación para evitar spam
  botonVer.disabled = true;
  botonVer.style.setProperty("opacity", "0.5", "important");

  let cuentaRegresiva = 10;
  botonVer.innerText = `Mostrando (${cuentaRegresiva}s)`;

  if (cronometroChayo) clearInterval(cronometroChayo);

  cronometroChayo = setInterval(() => {
    cuentaRegresiva--;

    if (cuentaRegresiva <= 0) {
      clearInterval(cronometroChayo);
      // Destruimos la presencia de los botones del DOM tras los 10 segundos
      barra.style.setProperty("display", "none", "important");

      botonVer.disabled = false;
      botonVer.style.setProperty("opacity", "1", "important");
      botonVer.innerText = "Ver datos de ingresos";
    } else {
      botonVer.innerText = `Mostrando (${cuentaRegresiva}s)`;
    }
  }, 1000);
}

// Reseteador preventivo al cerrar el panel
function toggleChayoPanel() {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("chayoOverlay");
  if (!overlay) return;

  overlay.classList.toggle("open");

  // Si cierras la ventana antes de cumplirse el tiempo, ejecutamos limpieza inmediata
  if (!overlay.classList.contains("open")) {
    if (cronometroChayo) clearInterval(cronometroChayo);
    const barra = document.getElementById("barraCredencialesChayo");
    const botonVer = document.getElementById("btnVerDatosChayo");

    if (barra) {
      barra.style.setProperty("display", "none", "important");
    }
    if (botonVer) {
      botonVer.disabled = false;
      botonVer.style.setProperty("opacity", "1", "important");
      botonVer.innerText = "Ver datos de ingresos";
    }
  }
}

// Reemplazar tu función de toggle original con este reseteador preventivo
function toggleChayoPanel() {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("chayoOverlay");
  if (!overlay) return;

  overlay.classList.toggle("open");

  // 🔥 Si cierras la ventana antes de los 10 segundos, borramos los hilos del reloj
  if (!overlay.classList.contains("open")) {
    if (cronometroChayo) clearInterval(cronometroChayo);
    const barra = document.getElementById("barraCredencialesChayo");
    const botonVer = document.getElementById("btnVerDatosChayo");

    if (barra) {
      barra.style.setProperty("max-height", "0px", "important");
      barra.style.setProperty("opacity", "0", "important");
      barra.style.setProperty(
        "border-bottom",
        "1px solid transparent",
        "important",
      );
    }
    if (botonVer) {
      botonVer.disabled = false;
      botonVer.style.setProperty("opacity", "1", "important");
      botonVer.innerText = "Ver datos de ingresos";
    }
  }
}

// Inyector de seguridad para resetear el estado si cierras la ventana manualmente
function toggleChayoPanel() {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("chayoOverlay");
  if (!overlay) return;

  overlay.classList.toggle("open");

  // Interceptor: Si se cierra la ventana, destruimos los datos revelados al instante
  if (!overlay.classList.contains("open")) {
    if (cronometroChayo) clearInterval(cronometroChayo);
    const bloqueCredenciales = document.getElementById(
      "credencialesChayoBlock",
    );
    const botonVer = document.getElementById("btnVerDatosChayo");
    if (bloqueCredenciales)
      bloqueCredenciales.style.setProperty("display", "none", "important");
    if (botonVer) {
      botonVer.disabled = false;
      botonVer.style.setProperty("opacity", "1", "important");
      botonVer.innerText = "Ver datos de ingresos";
    }
  }
}

// =========================================================================
// 🔗 EXTENSIÓN: DESPACHO DE ENLACES DE CREACIÓN (MODO INCÓGNITO COERCIÓN)
// =========================================================================
window.copiarEnlaceCreacionNetflix = function (btn) {
  if (typeof haptic === "function") haptic();

  const urlNetflixSignup =
    "https://www.netflix.com/signup?serverState=%7B%22realm%22%3A%22growth%22%2C%22name%22%3A%22REGISTRATION%22%2C%22clcsSessionId%22%3A%22e6e03881-f169-4087-a06f-4d3efd943c2e%22%2C%22sessionContext%22%3A%7B%22session-breadcrumbs%22%3A%7B%22funnel_name%22%3A%22signupSimplicity%22%7D%7D%7D";

  navigator.clipboard.writeText(urlNetflixSignup).then(function () {
    let originalText = btn.innerHTML;

    btn.innerHTML = "✅ ¡Enlace Copiado!";
    btn.style.background = "var(--ios-green)";
    btn.style.color = "white";

    // Disparamos la alerta Toast con tu letrero estricto de Modo Incógnito
    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-orange); font-weight:700;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <span>Recuerda abrir en ventana de Incógnito</span>
        </div>`,
      );
    }

    setTimeout(function () {
      btn.innerHTML = originalText;
      btn.style.background = "";
      btn.style.color = "";
    }, 2500);
  });
};
// =========================================================================
// RENDERIZADOR DEL MODAL DE CUENTAS REPETIDAS
// =========================================================================
window.mostrarModalRepetidasCybernet = function (repetidasArray) {
  if (typeof haptic === "function") haptic();

  const contenedor = document.getElementById("listaCuentasRepetidas");
  const modal = document.getElementById("modalRepetidasOverlay");

  if (!contenedor || !modal) return;

  contenedor.innerHTML = "";

  repetidasArray.forEach((cuenta) => {
    let div = document.createElement("div");
    div.style.cssText =
      "background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 159, 10, 0.15); border-left: 3px solid var(--ios-orange); padding: 10px 14px; border-radius: 12px; display: flex; flex-direction: column; gap: 4px;";

    div.innerHTML = `
      <span style="font-family: monospace; font-size: 0.95rem; font-weight: 700; color: var(--text-primary); word-break: break-all;">${cuenta.correo}</span>
      <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 500;">Ya en sistema. Fecha original: <b style="color: var(--ios-orange);">${cuenta.fecha}</b></span>
    `;

    contenedor.appendChild(div);
  });

  modal.classList.add("open");
};
// =========================================================================
// MOTORES DE AUTENTICACIÓN DE 2 FACTORES (2FA) FRONTEND
// =========================================================================
window.otpInterval = null;

function iniciarRelojOTP(segundosTotales) {
  const display = document.getElementById("otpTimerDisplay");
  const btnOtp = document.getElementById("btnSubmitOtp");
  const inputOtp = document.getElementById("staffOtpCode");

  if (window.otpInterval) clearInterval(window.otpInterval);

  window.otpInterval = setInterval(() => {
    segundosTotales--;
    let mins = Math.floor(segundosTotales / 60);
    let secs = segundosTotales % 60;
    display.innerText =
      String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");

    if (segundosTotales <= 0) {
      clearInterval(window.otpInterval);
      display.innerText = "00:00 (Expirado)";
      display.style.color = "var(--ios-red)";
      btnOtp.disabled = true;
      inputOtp.disabled = true;
      document.getElementById("otp-error-toast").innerHTML =
        "Código expirado. Por favor regresa al login.";
      document.getElementById("otp-error-toast").style.display = "block";
    }
  }, 1000);
}

window.registrarEmailOperador = function () {
  if (typeof haptic === "function") haptic();
  const btn = document.getElementById("btnSubmitNewEmail");
  const emailInput = document.getElementById("staffNewEmail").value.trim();

  btn.disabled = true;
  btn.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle></svg> Vinculando...`;

  const cbName = "cb_reg_email_" + Date.now();
  window[cbName] = function (res) {
    btn.disabled = false;
    btn.innerText = "Enviar y Recibir Código";
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      // Correo registrado, pasamos al OTP
      document.getElementById("emailRegisterOverlay").style.display = "none";
      document.getElementById("lblMaskedEmail").innerText = res.emailMasked;
      document.getElementById("otpVerificationOverlay").style.display = "flex";
      iniciarRelojOTP(300);
      setTimeout(() => document.getElementById("staffOtpCode").focus(), 200);
    } else {
      alert("Error: " + (res ? res.message : "Fallo de conexión"));
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=registrarEmailStaff&user=${encodeURIComponent(window.tempAuthUser)}&email=${encodeURIComponent(emailInput)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.tempAuthUser = "";
let isVerifyingOTP = false;

// =========================================================================
// ⚡ AUTO-VERIFICACIÓN AL DIGITAR LOS 6 DÍGITOS
// =========================================================================
window.comprobarAutoVerificacionOTP = function (input) {
  // Limpia cualquier caracter que no sea número
  input.value = input.value.replace(/\D/g, "");

  // Cuando llegue exactamente a 6 dígitos y no esté verificando
  if (input.value.length === 6 && !isVerifyingOTP) {
    isVerifyingOTP = true;
    verificarCodigoAcceso();
  }
};

// =========================================================================
// 🔑 VERIFICAR CÓDIGO DE SEGURIDAD (OTP)
// =========================================================================
window.verificarCodigoAcceso = function () {
  if (typeof haptic === "function") haptic();

  const codeInput = document.getElementById("staffOtpCode");
  const otpError = document.getElementById("otp-error-toast");
  const btnSubmit = document.getElementById("btnSubmitOtp");
  const code = codeInput ? codeInput.value.trim() : "";
  const user = window.tempAuthUser || "";

  if (!code || code.length !== 6) {
    isVerifyingOTP = false;
    return;
  }

  if (otpError) otpError.style.display = "none";

  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Verificando...`;
  }

  const cbName = "cb_otp_" + Date.now();
  window[cbName] = function (res) {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerText = "Confirmar Acceso";
    }
    isVerifyingOTP = false;

    const node = document.getElementById("node_" + cbName);
    if (node) node.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      // 🟢 ÉXITO TOTAL: Desbloquea la estación
      sessionStorage.setItem("active_staff", user);
      document.getElementById("otpVerificationOverlay").style.display = "none";
      const controlRight = document.getElementById("macControlCenterRight");
      if (controlRight) controlRight.style.display = "flex";
      entrarAlSistema(user);
    } else {
      // 🔴 CÓDIGO INCORRECTO: Muestra error y limpia la casilla
      let errMsg = res ? res.message : "Código de seguridad incorrecto.";
      if (otpError) {
        otpError.innerText = errMsg;
        otpError.style.display = "block";
      }
      if (codeInput) {
        codeInput.value = "";
        setTimeout(() => codeInput.focus(), 100);
      }
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=verificarOTPStaff&user=${encodeURIComponent(user)}&code=${encodeURIComponent(code)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// =========================================================================
// ⏱️ RELOJ TEMPORIZADOR DE OTP (5 MINUTOS)
// =========================================================================
window.otpTimerInterval = null;

function iniciarRelojOTP(segundosTotales) {
  if (window.otpTimerInterval) clearInterval(window.otpTimerInterval);

  let tiempoRestante = segundosTotales;
  const display = document.getElementById("otpTimerDisplay");

  const actualizarDisplay = () => {
    let m = Math.floor(tiempoRestante / 60);
    let s = tiempoRestante % 60;
    let mStr = String(m).padStart(2, "0");
    let sStr = String(s).padStart(2, "0");
    if (display) display.innerText = `${mStr}:${sStr}`;
  };

  actualizarDisplay();

  window.otpTimerInterval = setInterval(() => {
    tiempoRestante--;
    if (tiempoRestante <= 0) {
      clearInterval(window.otpTimerInterval);
      if (display) display.innerText = "00:00 (Expirado)";
    } else {
      actualizarDisplay();
    }
  }, 1000);
}
// =========================================================================
// 🔵 MOTOR: ACCESO DIRECTO OUTLOOK / HOTMAIL
// =========================================================================

window.toggleOutlookDirectPanel = function () {
  if (typeof haptic === "function") haptic();
  const overlay = document.getElementById("outlookDirectOverlay");
  if (overlay) {
    overlay.classList.toggle("open");

    if (overlay.classList.contains("open")) {
      document.getElementById("inputOutlookCorreos").value = "";
      setTimeout(() => {
        document.getElementById("inputOutlookCorreos").focus();
      }, 150);
    }
  }
};

window.abrirVentanaOutlookManual = function () {
  if (typeof haptic === "function") haptic();

  let inputVisual = document.getElementById("inputOutlookCorreos");
  let correoBuscar = inputVisual.value.trim();

  if (correoBuscar === "" || !correoBuscar.includes("@")) {
    alert("⚠️ Por favor ingresa un correo de Outlook o Hotmail válido.");
    inputVisual.focus();
    return;
  }

  window.lanzarPopUpOutlook(correoBuscar);
};

// =========================================================================
// 🔵 MOTOR: ACCESO DIRECTO OUTLOOK / HOTMAIL (SELECTOR DE CUENTAS)
// =========================================================================
window.toggleOutlookDirectPanel = function () {
  if (typeof haptic === "function") haptic();
  if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");

  // 🔥 SOLUCIÓN: Usamos 'prompt=select_account'.
  // Esto obliga a Microsoft a detener el auto-login de tu cuenta personal y te muestra
  // la pantalla de cuentas, donde solo debes darle clic a "Usar otra cuenta".
  let urlOutlook =
    "https://login.live.com/login.srf?wa=wsignin1.0&wreply=https://outlook.live.com/owa/&prompt=select_account";

  // Abre directamente en una nueva pestaña
  window.open(urlOutlook, "_blank");

  // Avisamos en la Isla Dinámica
  if (typeof triggerToast === "function") {
    triggerToast(
      `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-blue); font-weight:700;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        <span>Abriendo Outlook (Clic en "Usar otra cuenta")</span>
      </div>`,
    );
  }
};

// =========================================================================
// 🔥 NUEVA GENERACIÓN DE NETFLIX (VERIFICACIÓN EN VIVO + ALIAS + MEMORIA)
// =========================================================================

window.pinOcultoActual = ""; // Memoria temporal en vivo

window.iniciarCreacionNetflixAlias = function (btn) {
  if (typeof haptic === "function") haptic();

  const contenidoOriginal = btn.innerHTML;
  let pendienteGuardada = localStorage.getItem("cyber_netflix_alias_pendiente");

  // 🛡️ 1. REVISAR SI HAY UNA CUENTA ALIAS PENDIENTE EN MEMORIA
  if (pendienteGuardada) {
    let d = JSON.parse(pendienteGuardada);

    // Ponemos el botón en modo de verificación
    btn.style.pointerEvents = "none";
    btn.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ios-orange)" stroke-width="2.5" style="margin-right:8px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> <span style="color:var(--ios-orange); font-weight:bold;">Verificando estado en Sheets...</span>`;

    const cbCheck = "cb_check_alias_" + Date.now();
    window[cbCheck] = function (res) {
      const node = document.getElementById("node_" + cbCheck);
      if (node) node.remove();
      delete window[cbCheck];

      // 🔍 Evaluamos si la cuenta AÚN EXISTE en PINESMES
      if (res && res.status === "success" && res.existe) {
        // Sí existe: Restauramos
        btn.style.pointerEvents = "auto";
        btn.innerHTML = contenidoOriginal;
        alert(
          "⚠️ Se ha detectado una cuenta de Netflix previamente generada que NO fue guardada.\n\nEl sistema la recuperará obligatoriamente para que finalices el proceso.",
        );
        window.pinOcultoActual = d.pinRefacil;
        window.restaurarInterfazAliasGenerada(d, btn);
      } else {
        // No existe (fue borrada manualmente del Excel): Limpiamos la caché y creamos nueva
        localStorage.removeItem("cyber_netflix_alias_pendiente");
        window.ejecutarGeneracionNuevaCuentaAlias(btn, contenidoOriginal);
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbCheck;
    script.src = `${GOOGLE_SCRIPT_URL}?action=verificarCuentaPines&correo=${encodeURIComponent(d.correo)}&callback=${cbCheck}&_ts=${Date.now()}`;
    document.body.appendChild(script);
    return;
  }

  // 2. SI NO HAY NADA EN MEMORIA, PROCEDE A CREAR DIRECTO
  window.ejecutarGeneracionNuevaCuentaAlias(btn, contenidoOriginal);
};

// -------------------------------------------------------------------------
// Sub-función que aísla la carga de la cuenta nueva
// -------------------------------------------------------------------------
window.ejecutarGeneracionNuevaCuentaAlias = function (btn, contenidoOriginal) {
  if (
    !confirm(
      "❓ ¿Estás seguro de que deseas CREAR UNA CUENTA NUEVA de Netflix?\n\nEl sistema tomará un PIN de REFACIL y un correo de ALIAS.",
    )
  ) {
    btn.style.pointerEvents = "auto";
    btn.innerHTML = contenidoOriginal;
    return;
  }

  btn.style.pointerEvents = "none";
  btn.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:8px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Generando credenciales y asignando PIN...`;

  // Reseteo visual del modal de éxito
  document
    .getElementById("radarVerificacionContenedor")
    .style.setProperty("display", "flex", "important");
  document
    .getElementById("radarVerificacionSpinner")
    .style.setProperty("display", "flex", "important");
  document.getElementById("radarVerificacionSpinner").innerHTML =
    `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Esperando correo '¡Ya casi terminas!' en Gmail...`;

  document
    .getElementById("btnLinkVerificarGmail")
    .style.setProperty("display", "none", "important");
  document
    .getElementById("btnGuardarMaestroNetflix")
    .style.setProperty("display", "none", "important");

  const btnMala = document.getElementById("btnCuentaMalaAlias");
  if (btnMala) btnMala.style.display = "block";

  if (window.verificationLinkInterval)
    clearInterval(window.verificationLinkInterval);

  const cbName = "cb_alias_cta_" + Date.now();
  window[cbName] = function (res) {
    btn.style.pointerEvents = "auto";
    btn.innerHTML = contenidoOriginal;

    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success" && res.data) {
      const d = res.data;
      window.pinOcultoActual = d.pinRefacil;

      // 🔥 GUARDAR EN MEMORIA LOCAL PARA QUE NUNCA SE PIERDA
      localStorage.setItem("cyber_netflix_alias_pendiente", JSON.stringify(d));

      window.restaurarInterfazAliasGenerada(d, btn);
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo del servidor."));
    }
  };

  const empleadoActivo = sessionStorage.getItem("active_staff") || "Admin";
  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=generarNuevaCuentaAlias&user=${encodeURIComponent(empleadoActivo)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// Radar DUAL: Busca el "Ya casi terminas" (para el PIN) y "Verifica tu correo" (para el Link)
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
        // 1. 🔥 SOLUCIÓN: Mostrar PIN si Netflix envió el "Ya casi terminas" O si llegó directamente el link de verificación
        if (res.yaCasiTerminas || res.linkVerificacion) {
          const pinEl = document.getElementById("displayCtaPinRecarga");
          if (pinEl.innerText !== window.pinOcultoActual) {
            if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");
            pinEl.innerText = window.pinOcultoActual; // Revelamos PIN de Refacil
            pinEl.style.color = "var(--ios-green)";

            document.getElementById("radarVerificacionSpinner").innerHTML =
              `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> PIN Revelado. Esperando link de verificación...`;
          }
        }

        // 2. Mostrar botón de Verificar si Netflix envió el enlace
        if (res.linkVerificacion) {
          clearInterval(window.verificationLinkInterval);
          if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");

          document
            .getElementById("radarVerificacionSpinner")
            .style.setProperty("display", "none", "important");

          const btnLink = document.getElementById("btnLinkVerificarGmail");
          btnLink.href = res.linkVerificacion;
          btnLink.innerHTML = "✉️ Verificar Correo en Netflix";
          btnLink.style.setProperty("display", "inline-flex", "important");

          // 🎯 CANDADO: Solo al verificar se habilita Guardar
          btnLink.onclick = function () {
            if (typeof haptic === "function") haptic();
            document
              .getElementById("btnGuardarMaestroNetflix")
              .style.setProperty("display", "block", "important");

            // Ocultamos el botón de cuenta mala porque ya fue verificada
            const btnMala = document.getElementById("btnCuentaMalaAlias");
            if (btnMala) btnMala.style.display = "none";
          };

          const contenedor = document.getElementById(
            "radarVerificacionContenedor",
          );
          contenedor.style.background = "rgba(48, 209, 88, 0.06)";
          contenedor.style.borderColor = "rgba(48, 209, 88, 0.35)";
        }
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbRadarName;
    script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerEstadoVerificacionAlias&correo=${encodeURIComponent(correoTarget)}&callback=${cbRadarName}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  }, 4000);
};

// 🔥 FUNCIÓN MÁSTER: Pinta la pantalla tanto al crear como al restaurar la memoria
window.restaurarInterfazAliasGenerada = function (d, btnOrigen) {
  document.getElementById("displayCtaCorreo").innerText = d.correo;
  document.getElementById("displayCtaClave").innerText = d.clave;

  // Reseteo visual del estado "Esperando"
  document.getElementById("displayCtaPinRecarga").innerText =
    "Oculto (Esperando a Netflix...)";
  document.getElementById("displayCtaPinRecarga").style.color =
    "var(--ios-orange)";

  document
    .getElementById("radarVerificacionContenedor")
    .style.setProperty("display", "flex", "important");
  document.getElementById("radarVerificacionContenedor").style.background =
    "rgba(255, 159, 10, 0.04)";
  document.getElementById("radarVerificacionContenedor").style.borderColor =
    "rgba(255, 159, 10, 0.25)";

  document
    .getElementById("radarVerificacionSpinner")
    .style.setProperty("display", "flex", "important");
  document.getElementById("radarVerificacionSpinner").innerHTML =
    `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Esperando correo '¡Ya casi terminas!' en Gmail...`;

  document
    .getElementById("btnLinkVerificarGmail")
    .style.setProperty("display", "none", "important");
  document
    .getElementById("btnGuardarMaestroNetflix")
    .style.setProperty("display", "none", "important");

  const btnMala = document.getElementById("btnCuentaMalaAlias");
  if (btnMala) btnMala.style.display = "block"; // Habilitamos botón de descartar

  const btnGuardar = document.getElementById("btnGuardarMaestroNetflix");
  btnGuardar.onclick = function () {
    // 🔥 CORRECCIÓN CRÍTICA: Lee SIEMPRE el dato más reciente de la memoria al dar clic
    let datosFrescos =
      JSON.parse(localStorage.getItem("cyber_netflix_alias_pendiente")) || d;
    datosFrescos.pinRecarga = window.pinOcultoActual; // Le pasamos el PIN real al maestro
    guardarCuentaConfirmadaNetflix(
      btnGuardar,
      "Guardar en Inventario Maestro",
      datosFrescos,
    );
  };

  const modal = document.getElementById("cuentaGeneradaModalOverlay");
  if (modal) modal.classList.add("open");

  // Lanzar el radar Dual
  window.lanzarRadarEspiaAlias(d.correo);
};

// Función para descartar la cuenta y buscar otra (Actualizando la Memoria y UI completas)
window.cambiarCuentaMalaAlias = function () {
  if (
    !confirm(
      "⚠️ ¿Estás seguro de que esta cuenta no sirve?\n\nSe marcará en ROJO en ALIAS, se borrará de PINESMES y te entregaremos una nueva.",
    )
  )
    return;

  let correoMalo = document.getElementById("displayCtaCorreo").innerText;
  const btnMala = document.getElementById("btnCuentaMalaAlias");
  btnMala.disabled = true;
  btnMala.innerHTML = "Descartando...";

  const cbName = "cb_mala_" + Date.now();
  window[cbName] = function (res) {
    btnMala.disabled = false;
    btnMala.innerHTML = "❌ Esta cuenta no sirve (Descartar y buscar otra)";
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      // 1. ACTUALIZAR LA MEMORIA LOCAL CON EL NUEVO CORREO Y CLAVE
      let d = JSON.parse(localStorage.getItem("cyber_netflix_alias_pendiente"));
      d.correo = res.correoNuevo;
      d.clave = res.claveNueva; // Recibimos la nueva clave generada en Google Sheets
      localStorage.setItem("cyber_netflix_alias_pendiente", JSON.stringify(d));

      // 2. Actualiza la UI con el correo nuevo y la clave nueva
      document.getElementById("displayCtaCorreo").innerText = res.correoNuevo;
      document.getElementById("displayCtaClave").innerText = res.claveNueva;

      // 3. Reinicia el Radar y oculta el PIN de nuevo
      if (window.verificationLinkInterval)
        clearInterval(window.verificationLinkInterval);
      document.getElementById("displayCtaPinRecarga").innerText =
        "Oculto (Esperando a Netflix...)";
      document.getElementById("displayCtaPinRecarga").style.color =
        "var(--ios-orange)";

      document.getElementById("radarVerificacionSpinner").innerHTML =
        `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Esperando correo '¡Ya casi terminas!' en Gmail...`;

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
  script.src = `${GOOGLE_SCRIPT_URL}?action=cambiarCuentaMalaAlias&correoMalo=${encodeURIComponent(correoMalo)}&user=${encodeURIComponent(user)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// Función maestra de guardado (Elimina la memoria al terminar)
window.guardarCuentaConfirmadaNetflix = function (
  btn,
  contenidoOriginal,
  datosCuenta,
) {
  btn.disabled = true;
  btn.style.pointerEvents = "none";
  btn.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:middle;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Guardando en Sheets...`;

  const cbName = "cb_save_cta_" + Date.now();
  window[cbName] = function (res) {
    btn.disabled = false;
    btn.style.pointerEvents = "auto";
    btn.innerHTML = "¡Guardado con Éxito!";
    btn.style.background = "var(--ios-green)";

    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      // 🔥 LIBERACIÓN DE MEMORIA: Al guardar con éxito borramos el bloqueo
      localStorage.removeItem("cyber_netflix_alias_pendiente");

      // Cerramos la ventana forzosamente ahora que ya cumplió su deber
      const modal = document.getElementById("cuentaGeneradaModalOverlay");
      if (modal) modal.classList.remove("open");

      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path></svg> <span>Cuenta inyectada al maestro.</span></div>`,
        );
      }
    } else {
      alert(
        "❌ Error al guardar en Sheets: " +
          (res
            ? res.message
            : "Fallo de comunicación. Intenta darle al botón Guardar de nuevo."),
      );
      btn.innerHTML = contenidoOriginal;
      btn.style.background = "";
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  const urlParams =
    `?action=confirmarGuardadoNetflix` +
    `&correo=${encodeURIComponent(datosCuenta.correo)}` +
    `&clave=${encodeURIComponent(datosCuenta.clave)}` +
    `&callback=${cbName}&_ts=${Date.now()}`; // 👈 Ya no se envían los pinesPerfiles
  script.src = GOOGLE_SCRIPT_URL + urlParams;
  document.body.appendChild(script);
};
// Variable con la URL de tu script (Asegúrate de que sea la URL de tu nueva implementación)
const APP_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxk_T98sS1lL5lbXVq_XKOpB6ZCNQ1DSCgPhc_a6vmE_ai16YbSYO_eHkmeu0ZjM5aq/exec";

function cargarPagosBreB() {
  const script = document.createElement("script");
  const callbackName =
    "jsonpCallbackBreB_" + Math.round(100000 * Math.random());
  const fechaSeleccionada = document.getElementById("breb-fecha").value;

  const contenedor = document.getElementById("breb-lista");
  contenedor.innerHTML = `<div style="color: #0a84ff; width: 100%; text-align: center; font-size: 13px; padding: 40px 0;">Buscando pagos...</div>`;

  // 🔥 NUEVO: SEGURO ANTI-CUELGUES (Si tarda más de 12 segundos, cancela)
  const seguroDeTiempo = setTimeout(() => {
    if (window[callbackName]) {
      contenedor.innerHTML = `<div style="color: #ff453a; width: 100%; text-align: center; font-size: 12px; padding: 20px 0;">Google no responde.<br>Presiona actualizar de nuevo.</div>`;
      const icono = document.getElementById("icon-refresh-breb");
      if (icono) icono.classList.remove("spin-breb-anim");

      // Limpiamos la basura para que no se trabe la página
      delete window[callbackName];
      if (document.body.contains(script)) document.body.removeChild(script);
    }
  }, 12000); // 12000 milisegundos = 12 segundos

  window[callbackName] = function (data) {
    clearTimeout(seguroDeTiempo); // Si Google responde rápido, cancelamos la alarma de 12 segundos
    contenedor.innerHTML = "";

    const icono = document.getElementById("icon-refresh-breb");
    if (icono) icono.classList.remove("spin-breb-anim");

    if (data.status === "success") {
      if (data.data.length > 0) {
        data.data.forEach((pago) => {
          contenedor.innerHTML += `
              <div class="breb-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #30d158; font-weight: 800; font-size: 17px;">+$${pago.monto}</span>
                  <span style="color: rgba(255,255,255,0.7); font-size: 10px; background: rgba(0,0,0,0.3); padding: 3px 6px; border-radius: 6px;">${pago.hora}</span>
                </div>
                <div style="color: #ffffff; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">
                  👤 ${pago.remitente}
                </div>
                <div style="color: rgba(255,255,255,0.4); font-size: 11px; margin-top: 2px;">
                  📅 ${pago.fecha}
                </div>
              </div>
            `;
        });
      } else {
        contenedor.innerHTML = `<div style="color: rgba(255,255,255,0.5); width: 100%; text-align: center; font-size: 12px; padding: 30px 0;">No se detectaron pagos en esta fecha.</div>`;
      }
    } else {
      contenedor.innerHTML = `<div style="color: #ff453a; width: 100%; text-align: center; font-size: 12px; padding: 20px 0;">Error de red:<br>${data.message}</div>`;
    }

    if (document.body.contains(script)) document.body.removeChild(script);
    delete window[callbackName];
  };

  const urlFinal = fechaSeleccionada
    ? `${APP_SCRIPT_URL_BREB}?action=obtenerPagosBreB&fechaBusqueda=${fechaSeleccionada}&callback=${callbackName}`
    : `${APP_SCRIPT_URL_BREB}?action=obtenerPagosBreB&callback=${callbackName}`;

  script.src = urlFinal;
  document.body.appendChild(script);
}

// 1. Cargar los pagos por primera vez al abrir la página
cargarPagosBreB();

// 2. ACTIVAR EL RADAR: Consultar automáticamente cada 60 segundos (60000 milisegundos)
setInterval(cargarPagosBreB, 60000);

// =========================================================================
// 📸 MOTOR PARA COPIAR IMÁGENES AL PORTAPAPELES (VÍA CANVAS / PNG)
// =========================================================================
window.copiarImagenQRPagos = function (imgElement, urlImagen) {
  if (typeof haptic === "function") haptic();

  // Efecto visual: la imagen se encoge un poquito mientras carga
  imgElement.style.transform = "scale(0.95)";
  imgElement.style.opacity = "0.6";

  try {
    // 1. Creamos una imagen fantasma en memoria
    const imgObj = new Image();
    imgObj.crossOrigin = "anonymous"; // 🔓 Desbloquea la seguridad CORS
    imgObj.src = urlImagen;

    // 2. Cuando la imagen fantasma cargue, la procesamos
    imgObj.onload = function () {
      try {
        // Creamos un lienzo (canvas) invisible del tamaño exacto de la imagen
        const canvas = document.createElement("canvas");
        canvas.width = imgObj.width;
        canvas.height = imgObj.height;
        const ctx = canvas.getContext("2d");

        // Dibujamos la imagen en el lienzo
        ctx.drawImage(imgObj, 0, 0);

        // Convertimos el lienzo forzosamente a formato PNG (El único que acepta el portapapeles)
        canvas.toBlob(async function (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                "image/png": blob,
              }),
            ]);

            // 3. Restauramos la imagen y le ponemos un borde verde de éxito
            imgElement.style.transform = "scale(1.05)";
            imgElement.style.opacity = "1";
            imgElement.style.borderColor = "var(--ios-green)";

            // Lanzamos el toast de Cybernet confirmando la acción
            if (typeof triggerToast === "function") {
              triggerToast(
                `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>¡Imagen copiada! (Ctrl + V para pegar)</span></div>`,
              );
            }
            if (typeof window.CyberSonidos !== "undefined")
              window.CyberSonidos.play("exito");

            // Quitamos el borde verde después de 1 segundo
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

// Función auxiliar para cuando falla definitivamente
function lanzarErrorCopia(imgElement) {
  console.error("El navegador bloqueó la API del portapapeles.");
  imgElement.style.transform = "scale(1)";
  imgElement.style.opacity = "1";
  alert(
    "Tu navegador bloqueó la copia automática de imágenes. Por favor, usa clic derecho -> 'Copiar imagen' o mantén presionado en tu celular.",
  );
}

// =========================================================================
// 🛡️ INTERCEPTORES DE RED PARA INYECTAR EL NOMBRE REAL HACIA DRIVE
// =========================================================================
window.titularDriveComprobanteActual = "Desconocido";

const originalFetch = window.fetch;
window.fetch = async function () {
  if (
    arguments[1] &&
    arguments[1].method &&
    arguments[1].method.toUpperCase() === "POST"
  ) {
    try {
      let payload = JSON.parse(arguments[1].body);
      if (payload.action === "subirComprobanteYEnviarMail" || payload.imagen) {
        if (window.titularDriveComprobanteActual !== "Desconocido") {
          payload.titularDrive = window.titularDriveComprobanteActual;
          arguments[1].body = JSON.stringify(payload);
        }
      }
    } catch (e) {}
  }
  return originalFetch.apply(this, arguments);
};

const originalSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function (body) {
  try {
    if (
      typeof body === "string" &&
      (body.includes("subirComprobanteYEnviarMail") || body.includes("imagen"))
    ) {
      let payload = JSON.parse(body);
      if (window.titularDriveComprobanteActual !== "Desconocido") {
        payload.titularDrive = window.titularDriveComprobanteActual;
        body = JSON.stringify(payload);
      }
    }
  } catch (e) {}
  originalSend.call(this, body);
};

// =========================================================================
// 🚀 EVENTO AUTOMÁTICO: GMAIL AL SELECCIONAR MÉTODO DE PAGO
// =========================================================================
window.ajustarInterfazPorMetodoPagoV2 = function () {
  const selectBanco = document.getElementById("ventaBanco");
  if (!selectBanco) return;

  const bancoElegido = selectBanco.value;
  const statusEl = document.getElementById("statusBrebVerif");

  if (bancoElegido === "Bre-B") {
    if (statusEl) {
      statusEl.style.display = "flex";
      statusEl.style.color = "var(--ios-orange)";
      statusEl.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> <span style="text-align:left; line-height:1.2;">Sincronizando pagos de Gmail...</span>`;
    }

    const cbBreb = "cb_breb_manual_" + Date.now();
    window[cbBreb] = function (res) {
      const node = document.getElementById("node_" + cbBreb);
      if (node) node.remove();
      delete window[cbBreb];

      if (res && res.status === "success" && res.data.length > 0) {
        window.gmailDataTemp = res.data;
        if (window.imagenComprobanteActual) {
          window.verificarMatchGmail();
        } else if (statusEl) {
          statusEl.style.color = "var(--ios-green)";
          statusEl.innerHTML = `✅ <span style="text-align:left; line-height:1.3;">Pagos sincronizados. Esperando monto/foto para verificar.</span>`;
        }
      } else {
        if (statusEl) {
          statusEl.style.color = "var(--ios-red)";
          statusEl.innerHTML = `❌ <span style="text-align:left; line-height:1.3;">No hay pagos recientes en Gmail</span>`;
        }
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbBreb;
    script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerPagosBreB&fechaBusqueda=&callback=${cbBreb}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  } else {
    if (window.imagenComprobanteActual) window.verificarMatchGmail();
  }
};

window.guardarDeudaEnSheets = function () {
  if (typeof haptic === "function") haptic();
  const btn = document.getElementById("btnGuardarDeudaSheets");
  const tipo = document.getElementById("tipoDeudaMutua").value;
  const montoRaw = document
    .getElementById("valDeudaTotal")
    .value.replace(/\D/g, "");
  const monto = parseFloat(montoRaw) || 0;

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Guardando...";
  }

  const cbName = "cb_save_deuda_" + Date.now();
  window[cbName] = function (res) {
    if (btn) {
      btn.disabled = false;
      btn.innerText = "💾 Guardar";
    }
    const node = document.getElementById("node_" + cbName);
    if (node) node.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Deuda guardada en Google Sheets</span></div>`,
        );
      }
    } else {
      alert(
        "❌ Error: " + (res ? res.message : "Fallo de conexión al guardar"),
      );
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=actualizarDeudaMutua&monto=${encodeURIComponent(monto)}&tipo=${encodeURIComponent(tipo)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};
// =========================================================================
// 🗑️ FUNCIÓN PARA DESCARTAR/ELIMINAR TICKET DE GARANTÍA DIRECTAMENTE
// =========================================================================
window.ejecutarDescartarGarantia = function (
  btn,
  filaIndex,
  plataforma,
  correo,
) {
  if (
    !confirm(
      `¿Estás seguro de DESCARTAR el reporte de garantía de ${plataforma} (${correo})?\n\nSe eliminará de la lista de garantías sin modificar la cuenta.`,
    )
  ) {
    return;
  }

  if (typeof haptic === "function") haptic();

  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg>`;

  const cbName = "cb_desc_gar_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    btn.disabled = false;

    if (res && res.status === "success") {
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>Garantía descartada.</span></div>`,
        );
      }

      // Recargar la lista de garantías y actualizar los badges/banners flotantes
      cargarGarantias();
      if (typeof actualizarBadgeGarantias === "function") {
        actualizarBadgeGarantias();
      }
    } else {
      btn.innerHTML = originalHtml;
      alert(
        "❌ Error: " + (res ? res.message : "No se pudo descartar el reporte."),
      );
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=descartarGarantia&filaIndex=${encodeURIComponent(filaIndex)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

/* =========================================================================
   📊 MATRIZ VISOR EXCEL GIGANTE (EDICIÓN DEFINITIVA CON GARANTÍAS UNIFICADAS)
   ========================================================================= */

let memoriaBuscador = [];
let plataformaActivaBuscador = "";
const URL_SCRIPT_CYBERNET =
  "https://script.google.com/macros/s/AKfycbxk_T98sS1lL5lbXVq_XKOpB6ZCNQ1DSCgPhc_a6vmE_ai16YbSYO_eHkmeu0ZjM5aq/exec";

function convertirFechaAObjetoLupa(strFecha) {
  if (!strFecha) return 0;
  const str = String(strFecha).toLowerCase().trim();
  const meses = {
    ene: 0,
    feb: 1,
    mar: 2,
    abr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    ago: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dic: 11,
  };
  const match = str.match(/^(\d{1,2})[-/\s]([a-z]{3})/);
  if (match && meses[match[2]] !== undefined) {
    return new Date(2026, meses[match[2]], parseInt(match[1], 10)).getTime();
  }
  const ts = Date.parse(str);
  return isNaN(ts) ? 0 : ts;
}

function limpiarCacheLupa() {
  localStorage.removeItem("cache_inventario_lupa");
  localStorage.removeItem("cache_inventario_lupa_version");
  memoriaBuscador = [];
  console.log("🧹 Caché de la lupa limpiado.");
}

async function obtenerCuentasParaBuscador() {
  const cacheGuardado = localStorage.getItem("cache_inventario_lupa");
  const versionGuardada =
    localStorage.getItem("cache_inventario_lupa_version") || "";

  try {
    const URL_SCRIPT = `${URL_SCRIPT_CYBERNET}?action=descargarInventarioBuscador&versionCliente=${versionGuardada}&_ts=${Date.now()}`;
    const response = await fetch(URL_SCRIPT);
    const textoBruto = await response.text();
    const jsonLimpio = textoBruto
      .trim()
      .replace(/^.*?\(/, "")
      .replace(/\)$/, "");
    const datos = JSON.parse(jsonLimpio);

    if (datos.status === "not_modified" && cacheGuardado)
      return JSON.parse(cacheGuardado);

    if (datos.status === "success" && Array.isArray(datos.data)) {
      localStorage.setItem("cache_inventario_lupa", JSON.stringify(datos.data));
      localStorage.setItem(
        "cache_inventario_lupa_version",
        datos.version || Date.now().toString(),
      );
      return datos.data;
    }

    if (cacheGuardado) return JSON.parse(cacheGuardado);
    return [];
  } catch (error) {
    if (cacheGuardado) return JSON.parse(cacheGuardado);
    return [];
  }
}

// 🎯 AJUSTA EL ANCHO DEL INPUT Y PEGA EL BOTÓN "BORRAR" AL TEXTO
function actualizarPosicionBotonBorrar(input) {
  if (!input) return;
  const btnBorrar = document.getElementById("btn-borrar-texto-lupa");
  const val = input.value;

  if (val && val.trim().length > 0) {
    const canvas =
      actualizarPosicionBotonBorrar.canvas ||
      (actualizarPosicionBotonBorrar.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    const style = window.getComputedStyle(input);
    context.font = `${style.fontWeight || "500"} ${style.fontSize || "17.6px"} ${style.fontFamily || "sans-serif"}`;

    const textWidth = context.measureText(val).width;

    input.style.setProperty("flex", "0 0 auto", "important");
    input.style.setProperty("width", textWidth + 14 + "px", "important");

    if (btnBorrar)
      btnBorrar.style.setProperty("display", "inline-flex", "important");
  } else {
    input.style.setProperty("flex", "1", "important");
    input.style.setProperty("width", "auto", "important");
    if (btnBorrar) btnBorrar.style.setProperty("display", "none", "important");
  }
}

async function abrirBuscadorGlobal() {
  const modal = document.getElementById("modal-buscador-global");
  if (!modal) return;

  if (modal.parentNode !== document.body) document.body.appendChild(modal);

  modal.style.display = "flex";
  modal.classList.add("modal-gigante-activo");

  const input = document.getElementById("input-buscador-global");
  if (input) {
    const parentDiv = input.parentElement;
    parentDiv.style.cssText =
      "display: flex !important; align-items: center !important; width: 100% !important; padding: 12px 20px !important; background: #1c1c21 !important; border: 1px solid rgba(255,255,255,0.12) !important; border-radius: 16px !important; margin-bottom: 15px !important; flex-shrink: 0 !important; box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important; position: relative !important;";

    input.style.cssText =
      "flex: 1 !important; background: transparent !important; border: none !important; color: #ffffff !important; font-size: 1.1rem !important; outline: none !important; margin: 0 8px !important; padding: 6px 0 !important; font-weight: 500 !important;";

    // 🧼 1. BOTÓN "BORRAR" ADAPTATIVO
    let btnBorrar = document.getElementById("btn-borrar-texto-lupa");
    if (!btnBorrar) {
      btnBorrar = document.createElement("button");
      btnBorrar.id = "btn-borrar-texto-lupa";
      btnBorrar.title = "Borrar texto";
      btnBorrar.innerHTML = `<span style="font-size: 0.7rem; font-weight: 900;">✕</span> Borrar`;
      btnBorrar.style.cssText =
        "background: rgba(255, 255, 255, 0.1) !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; color: #a1a1aa !important; padding: 4px 10px !important; border-radius: 20px !important; display: none !important; align-items: center !important; gap: 5px !important; cursor: pointer !important; font-size: 0.75rem !important; font-weight: 700 !important; margin-left: 6px !important; margin-right: 6px !important; transition: all 0.2s ease !important; flex-shrink: 0 !important;";

      btnBorrar.onclick = function () {
        input.value = "";
        actualizarPosicionBotonBorrar(input);
        input.focus();
        if (typeof renderizarFilasTabla === "function") renderizarFilasTabla();
      };

      input.insertAdjacentElement("afterend", btnBorrar);
    }

    // 🧼 2. ESPACIADOR
    let spacer = document.getElementById("spacer-lupa-flex");
    if (!spacer) {
      spacer = document.createElement("div");
      spacer.id = "spacer-lupa-flex";
      spacer.style.cssText = "flex: 1 !important; min-width: 10px !important;";
      btnBorrar.insertAdjacentElement("afterend", spacer);
    }

    // 🧼 3. BOTÓN DE CERRAR MODAL
    const closeBtn = parentDiv.querySelector(
      "button:not(#btn-borrar-texto-lupa)",
    );
    if (closeBtn) {
      closeBtn.innerHTML = "✕";
      closeBtn.style.cssText =
        "background: rgba(255,255,255,0.08) !important; border: none !important; color: #a1a1aa !important; width: 36px !important; height: 36px !important; min-width: 36px !important; border-radius: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important; font-size: 1.15rem !important; transition: all 0.2s ease !important; padding: 0 !important; font-weight: bold !important; flex-shrink: 0 !important;";

      closeBtn.onclick = cerrarBuscadorGlobal;
    }

    input.value = "";
    actualizarPosicionBotonBorrar(input);
    input.focus();
  }

  const cajaResultados = document.getElementById("resultados-buscador");
  if (cajaResultados) {
    cajaResultados.style.cssText =
      "flex: 1; display: flex; flex-direction: column; overflow: hidden; width: 100%; margin-top: 5px;";
  }

  if (memoriaBuscador.length === 0) {
    if (cajaResultados) {
      cajaResultados.innerHTML = `
            <div style="color: #30d158; text-align: center; padding: 40px; font-size: 1.2rem; font-weight: 600;">
                ⚡ Sincronizando inventario maestro...
            </div>`;
    }
    memoriaBuscador = await obtenerCuentasParaBuscador();
  }

  renderizarMatrizCompleta();
}

function cerrarBuscadorGlobal() {
  const modal = document.getElementById("modal-buscador-global");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("modal-gigante-activo");
  }
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") cerrarBuscadorGlobal();
});

window.seleccionarPestañaPlataforma = function (nombrePlat) {
  plataformaActivaBuscador = nombrePlat;
  const input = document.getElementById("input-buscador-global");
  if (input) {
    input.value = "";
    actualizarPosicionBotonBorrar(input);
  }

  // Si tocó la pestaña de ventas y aún no hay datos, los descargamos
  if (
    nombrePlat === "REGISTRO_VENTAS" &&
    (!window.registroVentasData || window.registroVentasData.length === 0)
  ) {
    renderizarMatrizCompleta();
    cargarVentasLupa();
  } else {
    renderizarMatrizCompleta();
  }
};

// Variable global para guardar el mes elegido sin que se reinicie
if (typeof window.mesFiltroRegistroVentas === "undefined") {
  window.mesFiltroRegistroVentas = new Date().getMonth();
}

// =========================================================================
// 📊 RENDERIZADOR DE MATRIZ Y PESTAÑAS (INCLUYE GARANTÍAS Y VENTAS)
// =========================================================================
window.renderizarMatrizCompleta = function () {
  const cajaResultados = document.getElementById("resultados-buscador");
  if (!cajaResultados) return;

  const plataformasUnicas = [];
  const correosCaidosUnicos = new Set();

  memoriaBuscador.forEach((item) => {
    if (item.esCaida && item.correo) {
      correosCaidosUnicos.add(
        String(item.plataforma || "")
          .toUpperCase()
          .trim() +
          "___" +
          String(item.correo).toLowerCase().trim(),
      );
    }
    const p = String(item.plataforma || "")
      .toUpperCase()
      .trim();
    if (p && !plataformasUnicas.includes(p)) {
      plataformasUnicas.push(p);
    }
  });

  const totalGarantiasPendientes = correosCaidosUnicos.size;

  if (plataformaActivaBuscador === "" && plataformasUnicas.length > 0) {
    plataformaActivaBuscador = plataformasUnicas[0];
  }

  // Contenedor de botones limpio y alineado
  let htmlBotones = `<div id="contenedor-botones-lupa" style="display: flex; gap: 8px; flex-wrap: wrap; padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08); flex-shrink: 0; max-height: 140px; overflow-y: auto; align-items: center;">`;

  // BOTÓN DE REFRESCO SILENCIOSO
  htmlBotones += `
      <button onclick="forzarRefrescoLupaSilencioso()" title="Refrescar base de datos" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #e1e1e6; padding: 6px 14px; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s ease;">
          <svg id="icon-refresh-lupa" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
      </button>
  `;

  // 🚨 BOTÓN ESPECIAL DE GARANTÍAS
  const esGarantiaActiva = plataformaActivaBuscador === "GARANTIAS";
  htmlBotones += `
        <button onclick="seleccionarPestañaPlataforma('GARANTIAS')" class="btn-plat-filtro" data-plat="GARANTIAS" style="background: ${esGarantiaActiva ? "#ff453a" : "rgba(255, 69, 58, 0.12)"}; color: ${esGarantiaActiva ? "#ffffff" : "#ff453a"}; border: 1px solid ${esGarantiaActiva ? "#ff453a" : "rgba(255, 69, 58, 0.3)"}; padding: 8px 16px; border-radius: 10px; font-size: 0.82rem; font-weight: 800; cursor: pointer; white-space: nowrap; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 6px; box-shadow: ${esGarantiaActiva ? "0 0 12px rgba(255,69,58,0.5)" : "none"};">
            <span>🚨</span>
            <span>GARANTÍAS ${totalGarantiasPendientes > 0 ? `(${totalGarantiasPendientes})` : ""}</span>
        </button>
    `;

  // 💰 BOTÓN ESPECIAL DE REGISTRO DE VENTAS (Solo el botón, sin selectores extra)
  const esVentasActiva = plataformaActivaBuscador === "REGISTRO_VENTAS";
  htmlBotones += `
        <button onclick="seleccionarPestañaPlataforma('REGISTRO_VENTAS')" class="btn-plat-filtro" data-plat="REGISTRO_VENTAS" style="background: ${esVentasActiva ? "#30d158" : "rgba(48, 209, 88, 0.12)"}; color: ${esVentasActiva ? "#ffffff" : "#30d158"}; border: 1px solid ${esVentasActiva ? "#30d158" : "rgba(48, 209, 88, 0.3)"}; padding: 8px 16px; border-radius: 10px; font-size: 0.82rem; font-weight: 800; cursor: pointer; white-space: nowrap; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 6px; box-shadow: ${esVentasActiva ? "0 0 12px rgba(48,209,88,0.5)" : "none"};">
            <span>💰</span>
            <span>REGISTRO VENTAS</span>
        </button>
    `;

  // 📺 PESTAÑAS DE PLATAFORMAS REGULARES
  plataformasUnicas.forEach((plat) => {
    const activa = plat === plataformaActivaBuscador;
    let icono = "📺";
    if (plat.includes("NETFLIX")) icono = "🔴";
    if (plat.includes("DISNEY")) icono = "🔵";
    if (plat.includes("HBO") || plat.includes("MAX")) icono = "🟣";
    if (plat.includes("AMAZON") || plat.includes("PRIME")) icono = "📦";
    if (plat.includes("SPOTIFY") || plat.includes("DEEZER")) icono = "🎵";

    htmlBotones += `
            <button onclick="seleccionarPestañaPlataforma('${plat}')" class="btn-plat-filtro" data-plat="${plat}" style="background: ${activa ? "#0072ff" : "rgba(255, 255, 255, 0.04)"}; color: ${activa ? "#ffffff" : "#a1a1aa"}; border: 1px solid ${activa ? "#0072ff" : "rgba(255, 255, 255, 0.1)"}; padding: 8px 16px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 6px;">
                <span>${icono}</span>
                <span>${plat}</span>
            </button>
        `;
  });
  htmlBotones += `</div>`;

  let htmlEstructura = `
    ${htmlBotones}
    <div id="contenedor-tabla-dinamica" style="flex: 1; min-height: 0; overflow: auto; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; background: #121215;">
    </div>
    `;

  cajaResultados.innerHTML = htmlEstructura;
  renderizarFilasTabla();
};

// =========================================================================
// 📋 RENDERIZADOR DE FILAS (CON BOTONES, LÁPIZ Y REGISTRO DE VENTAS)
// =========================================================================
window.renderizarFilasTabla = function () {
  const contenedorTabla = document.getElementById("contenedor-tabla-dinamica");
  if (!contenedorTabla) return;

  const inputBuscador = document.getElementById("input-buscador-global");
  const texto = inputBuscador ? inputBuscador.value.toLowerCase().trim() : "";
  const estaBuscandoGlobal = texto.length >= 2;

  const userActivo = (sessionStorage.getItem("active_staff") || "")
    .toUpperCase()
    .trim();
  const esCamilo = userActivo === "CAMILO";

  // 🔥 1. INTERCEPTOR SI ESTAMOS EN LA PESTAÑA "REGISTRO_VENTAS" 🔥
  if (plataformaActivaBuscador === "REGISTRO_VENTAS") {
    let mesElegido =
      window.mesFiltroRegistroVentas !== undefined
        ? window.mesFiltroRegistroVentas
        : new Date().getMonth();
    const anioActual = new Date().getFullYear();

    let filtradosVentas = (window.registroVentasData || []).filter((row) => {
      if (texto !== "") {
        // 🔍 MODO BÚSQUEDA GLOBAL: Ignora el mes y busca en toda la historia de ventas
        const cliente = String(row[1] || "").toLowerCase();
        const telefono = String(row[2] || "").replace(/\D/g, "");
        const plat = String(row[3] || "").toLowerCase();
        const queryTel = texto.replace(/\D/g, "");

        if (queryTel !== "" && telefono.includes(queryTel)) return true;
        if (cliente.includes(texto) || plat.includes(texto)) return true;
        return false;
      } else {
        // 📅 MODO NORMAL: Muestra solo las ventas del mes elegido
        const fechaStr = row[0];
        if (!fechaStr) return false;

        const partesSpace = String(fechaStr).split(" ");
        const partes = partesSpace[0].split("/");

        if (partes.length === 3) {
          const mesFila = parseInt(partes[1], 10) - 1;
          const anioFila = parseInt(partes[2], 10);
          return mesFila === mesElegido && anioFila === anioActual;
        }
        return false;
      }
    });

    filtradosVentas.reverse();

    // Construir las opciones del selector de meses
    let opcionesMes = "";
    const mesesNombres = [
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
    mesesNombres.forEach((m, idx) => {
      opcionesMes += `<option value="${idx}" ${idx === mesElegido ? "selected" : ""}>${m}</option>`;
    });

    // Tabla 100% limpia. El selector de mes está ahora dentro de la columna FECHA
    let htmlTabla = `
          <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #e4e4e7; text-align: left; white-space: nowrap;">
              <thead>
                  <tr style="background: #18181b; color: #a1a1aa; border-bottom: 1px solid rgba(255,255,255,0.1); position: sticky; top: 0; z-index: 10;">
                      <th style="padding: 10px 16px; font-weight: 800; letter-spacing:0.5px;">
                          <div style="display: flex; align-items: center; gap: 8px;">
                              FECHA
                              <select class="input-ios" style="margin: 0; padding: 4px 8px; border-radius: 6px; font-weight: 700; background: rgba(48, 209, 88, 0.1) !important; color: var(--ios-green); border: 1px solid rgba(48, 209, 88, 0.3); font-size: 0.75rem; cursor: pointer; outline: none;" onchange="window.mesFiltroRegistroVentas = parseInt(this.value, 10); renderizarFilasTabla();">
                                  ${opcionesMes}
                              </select>
                          </div>
                      </th>
                      <th style="padding: 14px 16px; font-weight: 800; letter-spacing:0.5px;">CLIENTE / TELÉFONO</th>
                      <th style="padding: 14px 16px; font-weight: 800; letter-spacing:0.5px;">PLATAFORMAS</th>
                      <th style="padding: 14px 16px; font-weight: 800; letter-spacing:0.5px; color:#30d158;">PAGO</th>
                      <th style="padding: 14px 16px; font-weight: 800; letter-spacing:0.5px;">MÉTODO</th>
                      <th style="padding: 14px 16px; font-weight: 800; letter-spacing:0.5px;">TIPO</th>
                      ${esCamilo ? '<th style="padding: 14px 16px; font-weight: 800; text-align:center;">ACCIÓN</th>' : ""}
                  </tr>
              </thead>
              <tbody>
      `;

    if (filtradosVentas.length === 0) {
      htmlTabla += `<tr><td colspan="${esCamilo ? 7 : 6}" style="text-align: center; padding: 40px; color: var(--text-secondary); font-weight: 600;">No hay ventas registradas que coincidan.</td></tr>`;
    } else {
      filtradosVentas.forEach((row, idx) => {
        const colorFondoFila =
          idx % 2 === 0 ? "rgba(255, 255, 255, 0.015)" : "transparent";
        let montoStr = String(row[4] || "0").replace(/\D/g, "");
        let montoNum = parseFloat(montoStr) || 0;

        let botonBorrar = esCamilo
          ? `
                  <td style="padding: 10px 16px; text-align:center; border-bottom: 1px solid rgba(255,255,255,0.03);">
                      <button onclick="eliminarVentaDesdeRegistro(this, ${row[7]})" style="background: rgba(255, 69, 58, 0.1); border: 1px solid rgba(255, 69, 58, 0.2); color: var(--ios-red); padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease;">Borrar</button>
                  </td>
              `
          : "";

        htmlTabla += `
                  <tr style="background: ${colorFondoFila}; transition: background 0.2s ease;" onmouseover="this.style.background='rgba(48, 209, 88, 0.05)'" onmouseout="this.style.background='${colorFondoFila}'">
                      <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); color: var(--text-secondary); font-family: monospace;">${row[0]}</td>
                      <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.03);">
                          <div style="font-weight: 800; color: var(--text-primary); font-size: 0.9rem;">${row[1]}</div>
                          <div style="font-family: monospace; font-size: 0.75rem; color: var(--text-secondary);">${row[2]}</div>
                      </td>
                      <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); color: var(--ios-blue); font-weight: 700; white-space: normal; min-width: 200px;">${row[3]}</td>
                      <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); color: var(--ios-green); font-weight: 800; font-family: monospace; font-size:1rem;">$${montoNum.toLocaleString("es-CO")}</td>
                      <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); color: var(--text-secondary); font-weight: 600;">${row[5]}</td>
                      <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.03);">
                          <span style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: bold; color: var(--text-primary);">${row[6]}</span>
                      </td>
                      ${botonBorrar}
                  </tr>
              `;
      });
    }

    htmlTabla += `</tbody></table>`;
    contenedorTabla.innerHTML = htmlTabla;
    return;
  }

  // -----------------------------------------------------------
  // 2. LÓGICA ORIGINAL PARA INVENTARIO REGULAR DE CUENTAS
  // -----------------------------------------------------------
  const botones = document.querySelectorAll("#contenedor-botones-lupa button");
  botones.forEach((btn) => {
    btn.style.opacity = estaBuscandoGlobal ? "0.3" : "1";
  });

  const textoLimpioNumerico = texto.replace(/[\s\-\+\(\)]/g, "");
  const esBusquedaTelefono = /^\d{3,}$/.test(textoLimpioNumerico);

  let filtrados = memoriaBuscador.filter((cuenta) => {
    const platCuenta = String(cuenta.plataforma || "")
      .toUpperCase()
      .trim();

    if (estaBuscandoGlobal) {
      const cor = String(cuenta.correo || "").toLowerCase();
      const nom = String(cuenta.cliente || "").toLowerCase();
      const cla = String(cuenta.clave || "").toLowerCase();
      const tel = String(cuenta.telefono || "").replace(/\D/g, "");

      if (esBusquedaTelefono) {
        return tel.includes(textoLimpioNumerico);
      } else {
        return (
          cor.includes(texto) || nom.includes(texto) || cla.includes(texto)
        );
      }
    } else {
      if (plataformaActivaBuscador === "GARANTIAS") {
        return cuenta.esCaida === true;
      } else {
        return platCuenta === plataformaActivaBuscador;
      }
    }
  });

  const esModoGarantias =
    plataformaActivaBuscador === "GARANTIAS" && !estaBuscandoGlobal;

  if (esModoGarantias) {
    const mapaUnicos = new Map();
    filtrados.forEach((c) => {
      const key =
        String(c.plataforma || "")
          .toUpperCase()
          .trim() +
        "___" +
        String(c.correo || "")
          .toLowerCase()
          .trim();
      if (!mapaUnicos.has(key)) {
        mapaUnicos.set(key, c);
      }
    });
    filtrados = Array.from(mapaUnicos.values());
  }

  filtrados.sort(
    (a, b) =>
      convertirFechaAObjetoLupa(b.fechaCompra) -
      convertirFechaAObjetoLupa(a.fechaCompra),
  );

  const incluyeNetflix = filtrados.some((c) =>
    String(c.plataforma).toUpperCase().includes("NETFLIX"),
  );
  const platUpperActive = String(plataformaActivaBuscador || "")
    .toUpperCase()
    .trim();
  const esPlatSinProv =
    !estaBuscandoGlobal &&
    !esModoGarantias &&
    (platUpperActive.includes("NETFLIX") ||
      platUpperActive.includes("DISNEY-PREMIUM") ||
      platUpperActive.includes("DISNEY PREMIUM"));
  const esVistaGlobal = estaBuscandoGlobal;

  let colSpanCount = 10;
  let htmlHeaders = "";

  if (esModoGarantias) {
    colSpanCount = 6;
    htmlHeaders = `
            <th style="padding: 14px 16px; font-weight: 700; text-align: center;">PLATAFORMA</th>
            <th style="padding: 14px 16px; font-weight: 700;">PROV</th>
            <th style="padding: 14px 16px; font-weight: 700;">FECHA</th>
            <th style="padding: 14px 16px; font-weight: 700; width: 1%; white-space: nowrap;">CORREO / USUARIO</th>
            <th style="padding: 14px 16px; font-weight: 700;">CONTRASEÑA</th>
            <th style="padding: 14px 16px; font-weight: 700; text-align: center;">ACCIÓN</th>
        `;
  } else {
    colSpanCount = esVistaGlobal
      ? incluyeNetflix
        ? 11
        : 10
      : incluyeNetflix
        ? 10
        : 9;
    if (esPlatSinProv) colSpanCount -= 1;

    htmlHeaders = `
            ${esVistaGlobal ? '<th style="padding: 14px 16px; font-weight: 700; text-align: center;">PLATAFORMA</th>' : ""}
            ${esPlatSinProv ? "" : '<th style="padding: 14px 16px; font-weight: 700;">PROV</th>'}
            <th style="padding: 14px 16px; font-weight: 700;">FECHA</th>
            <th style="padding: 14px 16px; font-weight: 700; width: 1%; white-space: nowrap;">CORREO / USUARIO</th>
            <th style="padding: 14px 16px; font-weight: 700;">CONTRASEÑA</th>
            <th style="padding: 14px 16px; font-weight: 700;">PERFIL</th>
            <th style="padding: 14px 16px; font-weight: 700;">PIN</th>
            ${incluyeNetflix ? '<th style="padding: 14px 16px; font-weight: 700; color: #ffd60a;">VENCIMIENTO</th>' : ""}
            <th style="padding: 14px 16px; font-weight: 700;">CLIENTE</th>
            <th style="padding: 14px 16px; font-weight: 700;">TELÉFONO</th>
            <th style="padding: 14px 16px; font-weight: 700; text-align: center;">ACCIÓN</th>
        `;
  }

  let htmlTabla = `
        <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem; color: #e4e4e7; text-align: left; white-space: nowrap;">
            <thead>
                <tr style="background: #18181b; color: #a1a1aa; border-bottom: 1px solid rgba(255,255,255,0.1); position: sticky; top: 0; z-index: 10;">
                    ${htmlHeaders}
                </tr>
            </thead>
            <tbody>
    `;

  if (filtrados.length === 0) {
    const mensajeVacio =
      plataformaActivaBuscador === "GARANTIAS"
        ? "🎉 ¡Excelente! No hay cuentas en garantía pendientes."
        : "No se encontraron cuentas para esta búsqueda.";
    htmlTabla += `
            <tr>
                <td colspan="${colSpanCount}" style="text-align: center; padding: 40px; color: ${plataformaActivaBuscador === "GARANTIAS" ? "#30d158" : "#ff453a"}; font-weight: 600;">
                    ${mensajeVacio}
                </td>
            </tr>
        `;
  } else {
    let ultimaFechaRenderizada = null;

    const svgCopyIcon = (dato, titulo) => {
      if (!dato || dato === "-") return "";
      const datoLimpio = String(dato).replace(/'/g, "\\'");
      return `
        <button onclick="copiarDatoAisladoLupa(this, '${datoLimpio}')" title="${titulo}" style="background: transparent; border: none; color: #71717a; cursor: pointer; padding: 2px 4px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; transition: color 0.2s ease;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#71717a'">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
      `;
    };

    filtrados.forEach((cuenta, idx) => {
      const cuentaCodificada = encodeURIComponent(
        JSON.stringify(cuenta),
      ).replace(/'/g, "%27");
      const esFilaPar = idx % 2 === 0;
      const isRowNetflix = String(cuenta.plataforma)
        .toUpperCase()
        .includes("NETFLIX");
      const colorFondoFila = cuenta.esCaida
        ? "rgba(255, 69, 58, 0.15)"
        : esFilaPar
          ? "rgba(255, 255, 255, 0.015)"
          : "transparent";

      let colorPlat = "#0072ff",
        bgPlat = "rgba(0, 114, 255, 0.15)";
      if (isRowNetflix) {
        colorPlat = "#ff453a";
        bgPlat = "rgba(255, 69, 58, 0.15)";
      } else if (cuenta.plataforma.includes("DISNEY")) {
        colorPlat = "#32ade6";
        bgPlat = "rgba(50, 173, 230, 0.15)";
      } else if (cuenta.plataforma.includes("AMAZON")) {
        colorPlat = "#0a84ff";
        bgPlat = "rgba(10, 132, 255, 0.15)";
      } else if (
        cuenta.plataforma.includes("HBO") ||
        cuenta.plataforma.includes("MAX")
      ) {
        colorPlat = "#bf5af2";
        bgPlat = "rgba(191, 90, 242, 0.15)";
      }

      const celdaPlataforma = `<span style="background: ${bgPlat}; color: ${colorPlat}; padding: 4px 8px; border-radius: 6px; font-weight: 800; font-size: 0.72rem; letter-spacing: 0.5px; border: 1px solid ${bgPlat};">${cuenta.plataforma}</span>`;
      const fechaActual = cuenta.fechaCompra || "Fecha Desconocida";

      if (fechaActual !== ultimaFechaRenderizada) {
        let btnBorrarFecha = "";
        if (esCamilo && !esModoGarantias && !estaBuscandoGlobal) {
          btnBorrarFecha = `
                <button onclick="borrarCuentasPorFecha(this, '${fechaActual}', '${plataformaActivaBuscador}')" style="background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.3); color: var(--ios-red); padding: 4px 12px; border-radius: 8px; font-size: 0.7rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease;">
                    🗑️ Borrar Fecha
                </button>
            `;
        }

        htmlTabla += `
            <tr style="background: rgba(10, 132, 255, 0.05);">
                <td colspan="${colSpanCount}" style="padding: 8px 16px; border-top: 1px solid rgba(10, 132, 255, 0.2); border-bottom: 1px solid rgba(10, 132, 255, 0.2); color: var(--ios-blue); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <span>📅 Cuentas del: ${fechaActual}</span>
                        ${btnBorrarFecha}
                    </div>
                </td>
            </tr>
        `;
        ultimaFechaRenderizada = fechaActual;
      }

      // 🔥 LÓGICA INTELIGENTE DE ANCHO DE COLUMNA Y SALTOS DE LÍNEA 🔥
      const correoLimpio = cuenta.correo || "-";
      const esTextoLargo = !correoLimpio.includes("@");

      const estiloContenedorCorreo = esTextoLargo
        ? "display: flex; align-items: center; justify-content: flex-start; gap: 8px; white-space: normal; line-height: 1.3;"
        : "display: flex; align-items: center; justify-content: flex-start; gap: 8px;";

      const estiloTdCorreo = esTextoLargo
        ? "padding: 12px 16px; font-weight: 600; color: #ffffff; white-space: normal; min-width: 250px; max-width: 350px; word-wrap: break-word;"
        : "padding: 12px 16px; font-weight: 600; color: #ffffff; width: 1%; white-space: nowrap;";

      const celdaCorreoContent = `
        <div style="${estiloContenedorCorreo}">
          <span>${correoLimpio}</span>
          ${svgCopyIcon(cuenta.correo, "Copiar correo")}
        </div>
      `;

      const celdaClaveContent = `
        <div style="display: flex; align-items: center; justify-content: flex-start; gap: 8px;">
          <span>${cuenta.clave || "-"}</span>
          ${svgCopyIcon(cuenta.clave, "Copiar contraseña")}
        </div>
      `;

      // 🔥 CELDA TELÉFONO Y BOTONES 🔥
      let telLimpio = (cuenta.telefono || "").trim();
      let celdaTelefonoContent = "";

      const btnEditHTML = `
        <button onclick="abrirModalEditar('${cuenta.plataforma}', '${cuenta.filaIndex}', this, '${cuentaCodificada}')" title="Editar Datos" style="background: rgba(10, 132, 255, 0.1); border: 1px solid rgba(10, 132, 255, 0.2); border-radius: 6px; padding: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ios-blue); transition: all 0.2s ease;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
        </button>
      `;

      if (telLimpio !== "" && telLimpio !== "-") {
        celdaTelefonoContent = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <span class="texto-telefono" style="font-family: monospace;">${cuenta.telefono}</span>
                <div style="display: flex; gap: 4px;">
                    ${btnEditHTML}
                    <button class="btn-borrar-tel" onclick="borrarTelefonoCelda('${cuenta.plataforma}', '${cuenta.filaIndex}', this)" title="Borrar número (Liberar Perfil)" style="background: rgba(255, 69, 58, 0.1); border: 1px solid rgba(255, 69, 58, 0.2); border-radius: 6px; padding: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ios-red); transition: all 0.2s ease;">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
          `;
      } else {
        celdaTelefonoContent = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <span class="texto-telefono" style="font-family: monospace; color: var(--text-secondary);">-</span>
                <div style="display: flex; gap: 4px;">
                    <button class="btn-agregar-tel" onclick="agregarTelefonoCelda('${cuenta.plataforma}', '${cuenta.filaIndex}', this)" title="Asignar Teléfono Rápido" style="background: rgba(48, 209, 88, 0.1); border: 1px solid rgba(48, 209, 88, 0.2); border-radius: 6px; padding: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ios-green); transition: all 0.2s ease;">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
            </div>
          `;
      }

      if (esModoGarantias) {
        const btnCopiarReporte = `<button onclick="copiarReporteGarantiaIndividual(this, '${cuenta.plataforma}', '${cuenta.correo}', '${cuenta.clave}', '${cuenta.fechaCompra || "-"}', '${cuenta.proveedor || "-"}')" style="background: rgba(255, 159, 10, 0.12); border: 1px solid rgba(255, 159, 10, 0.25); color: var(--ios-orange); padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease;">📋 Copiar Reporte</button>`;
        const btnResolver = `<button onclick="resolverDesdeLupa('${cuenta.filaIndex || ""}', '${cuenta.correo}', '${cuenta.plataforma}')" style="background: rgba(48, 209, 88, 0.15); border: 1px solid rgba(48, 209, 88, 0.3); color: var(--ios-green); padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease;">✅ Resolver</button>`;

        htmlTabla += `
                    <tr data-correo="${cuenta.correo}" data-plat="${cuenta.plataforma}" style="background: ${colorFondoFila}; border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.3s ease;">
                        <td style="padding: 12px 16px; text-align: center;">${celdaPlataforma}</td>
                        <td style="padding: 12px 16px; font-weight: 700; color: #ff9f0a;">${cuenta.proveedor || "-"}</td>
                        <td style="padding: 12px 16px; font-weight: 700; color: #a1a1aa;">${cuenta.fechaCompra || "-"}</td>
                        <td style="${estiloTdCorreo}">${celdaCorreoContent}</td>
                        <td style="padding: 12px 16px; color: #30d158; font-family: monospace; font-size: 0.95rem;">${celdaClaveContent}</td>
                        <td style="padding: 10px 16px; text-align: center;">
                            <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
                                ${btnCopiarReporte}
                                ${btnResolver}
                            </div>
                        </td>
                    </tr>
                `;
      } else {
        const btnCopiar = `<button onclick="copiarDetallesLupa(this, '${cuentaCodificada}')" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease;">📋 Copiar</button>`;
        let btnTemp = "";
        let btnGarantia = "";

        if (!isRowNetflix) {
          btnTemp = `<button onclick="copiarCuentaTemporalLupa(this, '${cuentaCodificada}')" style="background: rgba(255, 159, 10, 0.1); border: 1px solid rgba(255, 159, 10, 0.2); color: var(--ios-orange); padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease;">⏳ Temp</button>`;
          if (!cuenta.esCaida) {
            btnGarantia = `<button class="btn-reportar-lupa" onclick="reportarDesdeLupa(this, '${cuenta.plataforma}', '${cuenta.correo}', '${cuenta.clave}', '${cuenta.fechaCompra || "-"}', '${cuenta.proveedor || "-"}')" style="background: rgba(255, 69, 58, 0.1); border: 1px solid rgba(255, 69, 58, 0.2); color: var(--ios-red); padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease;">🚨 Reportar</button>`;
          } else {
            btnGarantia = `<button onclick="resolverDesdeLupa('${cuenta.filaIndex || ""}', '${cuenta.correo}', '${cuenta.plataforma}')" style="background: rgba(48, 209, 88, 0.1); border: 1px solid rgba(48, 209, 88, 0.2); color: var(--ios-green); padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease;">✅ Resolver</button>`;
          }
        }

        htmlTabla += `
                    <tr data-correo="${cuenta.correo}" data-plat="${cuenta.plataforma}" style="background: ${colorFondoFila}; border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.3s ease;">
                        ${esVistaGlobal ? `<td style="padding: 12px 16px; text-align: center;">${celdaPlataforma}</td>` : ""}
                        ${esPlatSinProv ? "" : `<td style="padding: 12px 16px; font-weight: 700; color: #ff9f0a;">${cuenta.proveedor || "-"}</td>`}
                        <td style="padding: 12px 16px; font-weight: 700; color: #a1a1aa;">${cuenta.fechaCompra || "-"}</td>
                        <td style="${estiloTdCorreo}">${celdaCorreoContent}</td>
                        <td style="padding: 12px 16px; color: #30d158; font-family: monospace; font-size: 0.95rem;">${celdaClaveContent}</td>
                        <td style="padding: 12px 16px; color: #e4e4e7;">${cuenta.perfil || "1"}</td>
                        <td style="padding: 12px 16px; color: #ffd60a; font-family: monospace;">${cuenta.pin || "-"}</td>
                        ${incluyeNetflix ? `<td style="padding: 12px 16px; color: #ff9f0a; font-weight: 600;">${isRowNetflix ? cuenta.vencimiento || "-" : "-"}</td>` : ""}
                        <td style="padding: 12px 16px; color: #e4e4e7;">${cuenta.cliente || "-"}</td>
                        <td style="padding: 12px 16px; color: #a1a1aa;">${celdaTelefonoContent}</td>
                        <td style="padding: 10px 16px; text-align: center;">
                            <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
                                ${btnCopiar}
                                ${btnTemp}
                                ${btnGarantia}
                            </div>
                        </td>
                    </tr>
                `;
      }
    });
  }

  htmlTabla += `</tbody></table>`;
  contenedorTabla.innerHTML = htmlTabla;
};

// =========================================================================
// 📊 FUNCIONES AUXILIARES DE DESCARGA Y ELIMINACIÓN DE REGISTRO DE VENTAS
// =========================================================================
window.cargarVentasLupa = function (forzar = false) {
  if (typeof haptic === "function" && forzar) haptic();
  const contenedorTabla = document.getElementById("contenedor-tabla-dinamica");
  if (!contenedorTabla) return;

  contenedorTabla.innerHTML = `
        <div style="text-align:center; padding:60px; color:var(--text-secondary);">
            <svg class="spin-anim" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#30d158" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
            <br><br><span style="font-weight:800; font-size:1.1rem; color:#30d158;">Sincronizando Base de Ventas...</span>
        </div>`;

  const cbName = "cb_reg_ventas_" + Date.now();
  window[cbName] = function (res) {
    const node = document.getElementById("node_" + cbName);
    if (node) node.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      window.registroVentasData = res.data;
      renderizarFilasTabla(); // Pinta la tabla de ventas
      if (forzar && typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"></path></svg> <span>Base de ventas actualizada.</span></div>`,
        );
      }
    } else {
      contenedorTabla.innerHTML = `<div style="text-align:center; padding:50px; color:#ff453a; font-weight:bold;">❌ Error al cargar los registros</div>`;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerRegistroVentas&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.eliminarVentaDesdeRegistro = function (btn, filaIndex) {
  if (
    !confirm(
      "⚠️ ATENCIÓN\n¿Estás seguro de que deseas ELIMINAR esta venta?\n\nLa fila se borrará permanentemente del 'REGISTRO DE VENTAS'.",
    )
  )
    return;

  if (typeof haptic === "function") haptic();
  const originalHTML = btn.innerHTML;
  btn.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle></svg>`;
  btn.disabled = true;

  const cbName = "cb_del_reg_" + Date.now();
  window[cbName] = function (res) {
    const node = document.getElementById("node_" + cbName);
    if (node) node.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-red);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> <span>Venta eliminada del registro.</span></div>`,
        );
      }
      window.cargarVentasLupa(false);
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de conexión."));
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=eliminarVentaPorFila&filaIndex=${encodeURIComponent(filaIndex)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// =========================================================================
// 📋 COPIADO RÁPIDO INDIVIDUAL (CORREO Y CLAVE CON ÍCONO SVG)
// =========================================================================
window.copiarDatoAisladoLupa = function (btn, texto) {
  if (typeof haptic === "function") haptic();
  if (!texto || texto === "-") return;

  navigator.clipboard.writeText(texto).then(() => {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#30d158" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Dato copiado al portapapeles</span></div>`,
      );
    }

    setTimeout(() => {
      btn.innerHTML = originalHTML;
    }, 1500);
  });
};

// =========================================================================
// ➕ FUNCIÓN RÁPIDA: AGREGAR SOLO NÚMERO
// =========================================================================
window.agregarTelefonoCelda = function (plataforma, filaIndex, btnElement) {
  if (typeof haptic === "function") haptic();

  let nuevoTelefono = prompt(
    `Ingresa el número de celular para asignarlo en ${plataforma}:`,
  );
  if (!nuevoTelefono || nuevoTelefono.trim() === "") return;

  nuevoTelefono = nuevoTelefono.trim();

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>`;
  btnElement.disabled = true;

  const cbName = "cb_add_tel_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      let cuentaModificada = memoriaBuscador.find(
        (c) => c.plataforma === plataforma && c.filaIndex == filaIndex,
      );
      if (cuentaModificada) {
        cuentaModificada.telefono = nuevoTelefono;
        localStorage.setItem(
          "cache_inventario_lupa",
          JSON.stringify(memoriaBuscador),
        );
      }
      if (typeof triggerToast === "function")
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><span>Teléfono agregado.</span></div>`,
        );

      renderizarFilasTabla();
      if (typeof sincronizarLupaSilenciosa === "function")
        sincronizarLupaSilenciosa(true);
    } else {
      alert(
        "❌ Error: " +
          (res ? res.message : "Fallo de red al intentar agregar."),
      );
      btnElement.innerHTML = originalHTML;
      btnElement.disabled = false;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=agregarTelefonoCelda&plataforma=${encodeURIComponent(plataforma)}&filaIndex=${encodeURIComponent(filaIndex)}&telefono=${encodeURIComponent(nuevoTelefono)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// =========================================================================
// ✏️ VENTANA EMERGENTE (MODAL BLINDADO) PARA EDITAR DATOS
// =========================================================================
window.abrirModalEditar = function (
  plataforma,
  filaIndex,
  btnElement,
  cuentaCodificada,
) {
  try {
    if (typeof haptic === "function") haptic();

    // Extraer los datos seguros de la fila
    const cuenta = JSON.parse(decodeURIComponent(cuentaCodificada));
    const esNetflix = plataforma.toUpperCase().includes("NETFLIX");

    // Borrar modal anterior si quedó atascado
    let existing = document.getElementById("cyber-modal-edit");
    if (existing) existing.remove();

    // Fondo oscuro del modal
    const overlay = document.createElement("div");
    overlay.id = "cyber-modal-edit";
    overlay.style.cssText =
      "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.75); z-index: 999999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); font-family: sans-serif;";

    // Construir la estructura visual del formulario
    let htmlForm = `
            <div style="background: #18181b; border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; width: 90%; max-width: 350px; padding: 25px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); color: #fff; position: relative;">
                <h3 style="margin-top: 0; margin-bottom: 20px; font-size: 1.1rem; color: #0a84ff; display:flex; align-items:center; gap:8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> 
                    Editar Datos
                </h3>
                
                <label style="display: block; margin-bottom: 6px; font-size: 0.8rem; color: #a1a1aa; font-weight: bold;">TELÉFONO:</label>
                <input type="text" id="edit-tel" style="width: 100%; box-sizing: border-box; background: #27272a; border: 1px solid #3f3f46; color: #fff; padding: 10px 12px; border-radius: 8px; margin-bottom: 15px; outline: none;">

                <label style="display: block; margin-bottom: 6px; font-size: 0.8rem; color: #a1a1aa; font-weight: bold;">NOMBRE DEL CLIENTE (Opcional):</label>
                <input type="text" id="edit-cliente" placeholder="Ej: Juan Perez" style="width: 100%; box-sizing: border-box; background: #27272a; border: 1px solid #3f3f46; color: #fff; padding: 10px 12px; border-radius: 8px; margin-bottom: 15px; outline: none;">
        `;

    if (esNetflix) {
      htmlForm += `
                <label style="display: block; margin-bottom: 6px; font-size: 0.8rem; color: #a1a1aa; font-weight: bold;">FECHA DE PAGO:</label>
                <input type="text" id="edit-fecha" placeholder="Ej: 1-ago" style="width: 100%; box-sizing: border-box; background: #27272a; border: 1px solid #3f3f46; color: #fff; padding: 10px 12px; border-radius: 8px; margin-bottom: 15px; outline: none;">

                <label style="display: block; margin-bottom: 6px; font-size: 0.8rem; color: #a1a1aa; font-weight: bold;">VALOR PAGADO:</label>
                <input type="text" id="edit-valor" placeholder="Ej: $20.000" style="width: 100%; box-sizing: border-box; background: #27272a; border: 1px solid #3f3f46; color: #fff; padding: 10px 12px; border-radius: 8px; margin-bottom: 15px; outline: none;">

                <label style="display: block; margin-bottom: 6px; font-size: 0.8rem; color: #a1a1aa; font-weight: bold;">MÉTODO DE PAGO:</label>
                <select id="edit-pago" style="width: 100%; box-sizing: border-box; background: #27272a; border: 1px solid #3f3f46; color: #fff; padding: 10px 12px; border-radius: 8px; margin-bottom: 15px; outline: none; cursor:pointer;">
                    <option value="">Seleccione uno...</option>
                    <option value="Nequi">Nequi</option>
                    <option value="Daviplata">Daviplata</option>
                    <option value="Bancolombia">Bancolombia</option>
                    <option value="Bre-B">Bre-B</option>
                    <option value="Dale">Dale</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Otro">Otro</option>
                </select>
            `;
    }

    htmlForm += `
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
                    <button id="btn-cancel-edit" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #e4e4e7; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: background 0.2s;">Cancelar</button>
                    <button id="btn-save-edit" style="background: #0a84ff; border: none; color: #fff; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: opacity 0.2s;">Guardar Datos</button>
                </div>
            </div>
        `;

    overlay.innerHTML = htmlForm;
    document.body.appendChild(overlay);

    // 🛡️ Asignar valores por JavaScript a las casillas
    document.getElementById("edit-tel").value = cuenta.telefono || "";
    document.getElementById("edit-cliente").value =
      cuenta.cliente && cuenta.cliente !== "-" ? cuenta.cliente : "";

    if (esNetflix) {
      document.getElementById("edit-fecha").value =
        cuenta.fechaCompra && cuenta.fechaCompra !== "-"
          ? cuenta.fechaCompra
          : "";

      // Llenar Valor Pagado
      document.getElementById("edit-valor").value =
        cuenta.valor && cuenta.valor !== "-" ? cuenta.valor : "";

      // Llenar Método de Pago
      const selectPago = document.getElementById("edit-pago");
      // Intenta buscar como 'pago' o como 'banco' (dependiendo de cómo se llame tu columna en el JSON)
      const pagoGuardado = (cuenta.pago || cuenta.banco || "").trim();

      if (pagoGuardado && pagoGuardado !== "-") {
        let existeOpcion = Array.from(selectPago.options).some(
          (opt) => opt.value.toLowerCase() === pagoGuardado.toLowerCase(),
        );

        // Si el método de pago que está en el sheet no está en la lista por defecto, lo creamos
        if (!existeOpcion) {
          const nuevaOpcion = document.createElement("option");
          nuevaOpcion.value = pagoGuardado;
          nuevaOpcion.text = pagoGuardado;
          selectPago.add(nuevaOpcion);
        }
        selectPago.value = Array.from(selectPago.options).find(
          (opt) => opt.value.toLowerCase() === pagoGuardado.toLowerCase(),
        ).value;
      }
    }

    // Acciones de los botones
    document.getElementById("btn-cancel-edit").onclick = () => overlay.remove();

    document.getElementById("btn-save-edit").onclick = () => {
      const nuevoTelf = document.getElementById("edit-tel").value.trim();
      const nuevoCliente = document.getElementById("edit-cliente").value.trim();
      let nuevaFecha = "",
        nuevoValor = "",
        nuevoPago = "";

      if (esNetflix) {
        nuevaFecha = document.getElementById("edit-fecha").value.trim();
        nuevoValor = document.getElementById("edit-valor").value.trim();
        nuevoPago = document.getElementById("edit-pago").value.trim();
      }

      if (nuevoTelf === "") {
        alert("⚠️ El teléfono es obligatorio.");
        return;
      }

      overlay.remove();
      ejecutarGuardadoEdicion(
        plataforma,
        filaIndex,
        btnElement,
        nuevoTelf,
        nuevoCliente,
        nuevaFecha,
        nuevoValor,
        nuevoPago,
      );
    };
  } catch (error) {
    alert("❌ Ocurrió un error al intentar abrir la ventana de edición.");
    console.error(error);
  }
};

// =========================================================================
// 🚀 FUNCIÓN INTERNA: ENVÍA LOS DATOS EDITADOS A GOOGLE SHEETS
// =========================================================================
window.ejecutarGuardadoEdicion = function (
  plataforma,
  filaIndex,
  btnElement,
  telf,
  cliente,
  fecha,
  valor,
  pago,
) {
  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>`;
  btnElement.disabled = true;

  const cbName = "cb_edit_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      let cMod = memoriaBuscador.find(
        (c) => c.plataforma === plataforma && c.filaIndex == filaIndex,
      );
      if (cMod) {
        cMod.telefono = telf;
        cMod.cliente = cliente !== "" ? cliente : "-";

        if (plataforma.toUpperCase().includes("NETFLIX")) {
          if (fecha !== "") cMod.fechaCompra = fecha;
          cMod.valor = valor;
          cMod.pago = pago;
          cMod.banco = pago; // Actualizamos ambas por si acaso
        }

        localStorage.setItem(
          "cache_inventario_lupa",
          JSON.stringify(memoriaBuscador),
        );
      }
      if (typeof triggerToast === "function")
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-blue);"><span>Datos actualizados correctamente.</span></div>`,
        );

      renderizarFilasTabla();
      if (typeof sincronizarLupaSilenciosa === "function")
        sincronizarLupaSilenciosa(true);
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de red."));
      btnElement.innerHTML = originalHTML;
      btnElement.disabled = false;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;

  let baseSrc = `${GOOGLE_SCRIPT_URL}?action=editarDatosCelda&plataforma=${encodeURIComponent(plataforma)}&filaIndex=${encodeURIComponent(filaIndex)}&telefono=${encodeURIComponent(telf)}&cliente=${encodeURIComponent(cliente)}`;

  if (plataforma.toUpperCase().includes("NETFLIX")) {
    baseSrc += `&fecha=${encodeURIComponent(fecha)}&valor=${encodeURIComponent(valor)}&pago=${encodeURIComponent(pago)}`;
  }

  script.src = baseSrc + `&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// =========================================================================
// 🗑️ FUNCIÓN PARA BORRAR NÚMERO DE TELÉFONO DESDE LA TABLA (SEGUNDO PLANO)
// =========================================================================
window.borrarTelefonoCelda = function (plataforma, filaIndex, btnElement) {
  let msj1 = `¿Estás seguro de borrar el teléfono de esta fila en ${plataforma}?`;
  if (plataforma.toUpperCase() === "NETFLIX") {
    msj1 += `\n\n⚠️ ADVERTENCIA: Al ser NETFLIX, también se borrará la Fecha, Nombre, Vencimiento, Valor y Banco.`;
  }
  if (!confirm(msj1)) return;

  let msj2 = `🚨 ÚLTIMA CONFIRMACIÓN 🚨\n\n¿Realmente deseas vaciar los datos del cliente en la fila ${filaIndex} de ${plataforma}?\nEsta acción es irreversible en la base de datos.`;
  if (!confirm(msj2)) return;

  if (typeof haptic === "function") haptic();

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>`;
  btnElement.disabled = true;

  const cbName = "cb_borrar_tel_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      let cuentaModificada = memoriaBuscador.find(
        (c) => c.plataforma === plataforma && c.filaIndex == filaIndex,
      );
      if (cuentaModificada) {
        cuentaModificada.telefono = "";
        cuentaModificada.cliente = "-";
        if (plataforma.toUpperCase() === "NETFLIX") {
          cuentaModificada.fechaCompra = "";
          cuentaModificada.valor = "";
          cuentaModificada.pago = "";
          cuentaModificada.banco = "";
        }
        localStorage.setItem(
          "cache_inventario_lupa",
          JSON.stringify(memoriaBuscador),
        );
      }

      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"></path></svg> <span>Número borrado, perfil liberado.</span></div>`,
        );
      }

      renderizarFilasTabla();
      if (typeof sincronizarLupaSilenciosa === "function")
        sincronizarLupaSilenciosa(true);
    } else {
      alert(
        "❌ Error: " + (res ? res.message : "Fallo de red al intentar borrar."),
      );
      btnElement.innerHTML = originalHTML;
      btnElement.disabled = false;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=borrarTelefonoCelda&plataforma=${encodeURIComponent(plataforma)}&filaIndex=${encodeURIComponent(filaIndex)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};
// =========================================================================
// 🗑️ LÓGICA PARA EL BOTÓN DE BORRAR FECHA EN LOGICA.JS
// =========================================================================
window.borrarCuentasPorFecha = function (btn, fecha, plataforma) {
  if (typeof haptic === "function") haptic();

  if (
    !confirm(
      `⚠️ ATENCIÓN CAMILO ⚠️\n\n¿Estás seguro de que deseas ELIMINAR TODAS las cuentas de ${plataforma} registradas con fecha "${fecha}"?\n\nEsta acción borrará las filas del archivo de Google Sheets y no se puede deshacer.`,
    )
  ) {
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<svg class="spin-anim" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Borrando...`;

  const cbName = "cb_delete_date_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      // Actualizamos la memoria local (RAM) eliminando esas cuentas para que desaparezcan de la vista al instante
      memoriaBuscador = memoriaBuscador.filter(
        (c) =>
          !(
            c.plataforma.toUpperCase() === plataforma.toUpperCase() &&
            c.fechaCompra === fecha
          ),
      );
      localStorage.setItem(
        "cache_inventario_lupa",
        JSON.stringify(memoriaBuscador),
      );

      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Se eliminaron ${res.eliminadas} cuentas del sistema.</span></div>`,
        );
      }
      renderizarFilasTabla(); // Re-pinta la tabla sin esas cuentas
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de conexión."));
      btn.disabled = false;
      btn.innerHTML = "🗑️ Borrar Fecha";
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${URL_SCRIPT_CYBERNET}?action=borrarCuentasPorFecha&plataforma=${encodeURIComponent(plataforma)}&fecha=${encodeURIComponent(fecha)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// =========================================================================
// 🚨 COPIAR REPORTE DESDE LA PESTAÑA GARANTÍAS (SIN MOTIVO)
// =========================================================================
window.copiarReporteGarantiaIndividual = function (
  btn,
  plat,
  correo,
  clave,
  fechaCompra,
  proveedor,
) {
  if (typeof haptic === "function") haptic();
  let platNorm = plat.toUpperCase();
  if (platNorm.includes("AMAZON")) platNorm = "AMAZON-PRIME-VIDEO";
  else if (platNorm.includes("DISNEY") && platNorm.includes("PREMIUM"))
    platNorm = "DISNEY-PREMIUM";
  else if (platNorm.includes("DISNEY") && platNorm.includes("ESTANDAR"))
    platNorm = "DISNEY-ESTANDAR";
  else if (platNorm.includes("HBO") || platNorm.includes("MAX"))
    platNorm = "HBO-MAX";

  let mensajeReporte = `🚨 *REPORTE DE PROBLEMA*\n📺 *Plataforma:* ${platNorm}\n📧 *Correo:* ${correo}\n🔑 *Clave:* ${clave}\n👤 *Proveedor:* ${proveedor}\n📅 *Fecha Compra:* ${fechaCompra}`;

  navigator.clipboard.writeText(mensajeReporte).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = "✅ Copiado";
    btn.style.setProperty("background", "#30d158", "important");
    btn.style.setProperty("color", "#000000", "important");
    btn.style.setProperty("border-color", "transparent", "important");

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Reporte copiado al portapapeles</span></div>`,
      );
    }

    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.setProperty(
        "background",
        "rgba(255, 159, 10, 0.12)",
        "important",
      );
      btn.style.setProperty("color", "var(--ios-orange)", "important");
      btn.style.setProperty(
        "border-color",
        "rgba(255, 159, 10, 0.25)",
        "important",
      );
    }, 2000);
  });
};

// =========================================================================
// 🚨 ACCIÓN DIRECTA DE REPORTAR DESDE LA LUPA (REFRESCO Y REACTIVIDAD EN VIVO)
// =========================================================================
window.reportarDesdeLupa = function (
  btn,
  plat,
  correo,
  clave,
  fechaCompra,
  proveedor,
) {
  if (typeof haptic === "function") haptic();

  let platNorm = plat.toUpperCase().trim();
  if (platNorm.includes("AMAZON")) platNorm = "AMAZON-PRIME-VIDEO";
  else if (platNorm.includes("DISNEY") && platNorm.includes("PREMIUM"))
    platNorm = "DISNEY-PREMIUM";
  else if (platNorm.includes("DISNEY") && platNorm.includes("ESTANDAR"))
    platNorm = "DISNEY-ESTANDAR";
  else if (platNorm.includes("HBO") || platNorm.includes("MAX"))
    platNorm = "HBO-MAX";

  let mensajeReporte = `🚨 *REPORTE DE PROBLEMA*\n📺 *Plataforma:* ${platNorm}\n📧 *Correo:* ${correo}\n🔑 *Clave:* ${clave}\n👤 *Proveedor:* ${proveedor}\n📅 *Fecha Compra:* ${fechaCompra}`;
  navigator.clipboard.writeText(mensajeReporte);

  const filasHermanas = document.querySelectorAll(
    `tr[data-correo="${correo}"]`,
  );

  filasHermanas.forEach((filaTR) => {
    const dataPlat = (filaTR.getAttribute("data-plat") || "").toUpperCase();
    if (dataPlat.includes(platNorm) || platNorm.includes(dataPlat)) {
      filaTR.style.setProperty(
        "background",
        "rgba(255, 69, 58, 0.15)",
        "important",
      );
      filaTR.style.setProperty(
        "transition",
        "background 0.3s ease",
        "important",
      );

      const btnRep = filaTR.querySelector(".btn-reportar-lupa");
      if (btnRep) {
        btnRep.disabled = true;
        btnRep.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Reportando...`;
      }
    }
  });

  const cbName = "cb_rep_lupa_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      // 🎯 MARCAR COMO CAÍDA TODAS LAS FILAS DE ESE CORREO Y PLATAFORMA
      memoriaBuscador.forEach((c) => {
        const cPlat = String(c.plataforma || "")
          .toUpperCase()
          .trim();
        const coincidePlat =
          cPlat.includes(platNorm) || platNorm.includes(cPlat);
        if (c.correo.toLowerCase() === correo.toLowerCase() && coincidePlat) {
          c.esCaida = true;
        }
      });
      localStorage.setItem(
        "cache_inventario_lupa",
        JSON.stringify(memoriaBuscador),
      );

      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Cuenta reportada y agregada a Garantías.</span></div>`,
        );
      }

      // ⚡ RE-PINTA COMPLETO PARA ACTUALIZAR EL CONTADOR Y PESTAÑA GARANTÍAS EN VIVO
      renderizarMatrizCompleta();
    } else {
      renderizarMatrizCompleta();
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-red);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="15" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg><span>Error al reportar</span></div>`,
        );
      }
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${URL_SCRIPT_CYBERNET}?action=reportarGarantia&plataforma=${encodeURIComponent(platNorm)}&correo=${encodeURIComponent(correo)}&clave=${encodeURIComponent(clave)}&descripcion=Reporte automático desde buscador&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

const inputBuscadorGlobal = document.getElementById("input-buscador-global");
if (inputBuscadorGlobal) {
  inputBuscadorGlobal.addEventListener("input", function () {
    actualizarPosicionBotonBorrar(this);
    renderizarFilasTabla();
  });
}

// 7. MOTOR DE COPIADO AL PORTAPAPELES
window.copiarDetallesLupa = function (boton, cuentaCodificada) {
  const cuenta = JSON.parse(decodeURIComponent(cuentaCodificada));
  const platId = String(cuenta.plataforma || "SERVICIO")
    .toUpperCase()
    .trim();
  const nombreCliente =
    cuenta.cliente && cuenta.cliente !== "Sin cliente" && cuenta.cliente !== "-"
      ? cuenta.cliente
      : "";

  let intro = `🌟 *¡Hola${nombreCliente ? " " + nombreCliente : ""}!*\n\nTu pedido ha sido procesado con éxito. Aquí tienes tus accesos:`;
  let etiquetaUser =
    platId === "IPTV" || platId === "EMBY" ? "Usuario" : "Correo";
  let etiquetaPerfil =
    platId === "IPTV" ? "URL" : platId === "EMBY" ? "Servidor" : "Perfil";

  let cuerpo = `\n\n🎬 *DETALLES DE ${platId.replace(/-/g, " ")}* ✅\n────────────────────\n`;

  if (platId === "NETFLIX") {
    cuerpo += `⚠️ *Para iniciar sesión:* Cuando te pida un código, selecciona *Obtener ayuda* y después *Usar contraseña*.\n\n`;
  }

  cuerpo += `👤 *${etiquetaUser}:* ${cuenta.correo}\n🔐 *Contraseña:* ${cuenta.clave}\n`;

  if (
    platId === "IPTV" ||
    (cuenta.perfil &&
      cuenta.perfil !== "" &&
      cuenta.perfil !== "N/A" &&
      cuenta.perfil !== "Único / General")
  ) {
    cuerpo += `🌐 *${etiquetaPerfil}:* ${cuenta.perfil}\n`;
  }

  if (platId === "EMBY") {
    cuerpo += `🔌 *Puerto:* Dejar vacío\n`;
  }

  if (
    cuenta.pin &&
    cuenta.pin !== "" &&
    cuenta.pin !== "N/A" &&
    cuenta.pin !== "Sin PIN" &&
    cuenta.pin !== "-"
  ) {
    cuerpo += `📍 *PIN:* ${cuenta.pin}\n`;
  }

  if (platId === "NETFLIX") {
    cuerpo += `📅 *Vence:* ${cuenta.vencimiento || "30 Días"}\n`;
    cuerpo += `\n🤖 *¿NECESITAS UN CÓDIGO?* Puedes usar nuestra pagina para codigos disponible 24/7: www.cybernetsp.com/`;
  }

  let soporte = `\n\n📢 *INFORMACIÓN IMPORTANTE:* \n────────────────────\n⚠️ *Garantía activa:* Tu servicio cuenta con respaldo total durante su vigencia. \n🆘 *Soporte:* Si presentas algún inconveniente, *infórmanos de inmediato* para brindarte una solución rápida.`;

  const mensajeFinalFicha =
    intro +
    cuerpo +
    soporte +
    `\n\n💎 *Disfruta tu servicio.*\n✨ *¡Gracias por elegirnos!* ✨`;

  navigator.clipboard.writeText(mensajeFinalFicha).then(() => {
    const textoOriginal = boton.innerHTML;
    boton.innerHTML = "✅ Copiado";
    boton.style.setProperty("background", "#30d158", "important");
    boton.style.setProperty("color", "#000000", "important");
    boton.style.setProperty("border-color", "transparent", "important");

    setTimeout(() => {
      boton.innerHTML = textoOriginal;
      boton.style.setProperty(
        "background",
        "rgba(255, 255, 255, 0.08)",
        "important",
      );
      boton.style.setProperty("color", "#ffffff", "important");
      boton.style.setProperty(
        "border-color",
        "rgba(255, 255, 255, 0.15)",
        "important",
      );
    }, 2000);
  });
};

window.copiarCuentaTemporalLupa = function (boton, cuentaCodificada) {
  if (typeof haptic === "function") haptic();
  const cuenta = JSON.parse(decodeURIComponent(cuentaCodificada));

  let perfilTxt =
    cuenta.perfil && cuenta.perfil !== "N/A" && cuenta.perfil !== ""
      ? `\n👤 *Perfil:* ${cuenta.perfil}`
      : "";
  let pinTxt =
    cuenta.pin &&
    cuenta.pin !== "N/A" &&
    cuenta.pin !== "-" &&
    cuenta.pin !== ""
      ? `\n📍 *PIN:* ${cuenta.pin}`
      : "";

  let mensajeTemporal = `🌟 *¡Hola! Lamentamos los inconvenientes con tu servicio.*\n\nMientras nuestro equipo técnico repara tu cuenta principal, te hemos habilitado un *acceso temporal* para que no pares de disfrutar tu programación favorita 🍿🎬:\n\n📺 *${cuenta.plataforma} (TEMPORAL)*\n────────────────────\n📧 *Correo:* ${cuenta.correo}\n🔐 *Clave:* ${cuenta.clave}${perfilTxt}${pinTxt}\n────────────────────\n_Te avisaremos por este medio apenas tu cuenta original esté solucionada. ¡Gracias por tu paciencia!_ ✨`;

  const textoOriginal = boton.innerHTML;

  navigator.clipboard.writeText(mensajeTemporal).then(() => {
    boton.innerHTML = "✅ Copiada";
    boton.style.setProperty("background", "var(--ios-green)", "important");
    boton.style.setProperty("color", "white", "important");
    boton.style.setProperty("border-color", "transparent", "important");

    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Cuenta temporal copiada al portapapeles</span></div>`,
      );
    }

    setTimeout(() => {
      boton.innerHTML = textoOriginal;
      boton.style.setProperty(
        "background",
        "rgba(255, 159, 10, 0.1)",
        "important",
      );
      boton.style.setProperty("color", "var(--ios-orange)", "important");
      boton.style.setProperty(
        "border-color",
        "rgba(255, 159, 10, 0.2)",
        "important",
      );
    }, 2000);
  });
};

window.resolverDesdeLupa = function (filaIndex, correo, plat) {
  if (typeof haptic === "function") haptic();

  if (!filaIndex || filaIndex === "") {
    alert(
      "⚠️ Por favor recarga la memoria de la lupa (F12 -> limpiarCacheLupa()) para obtener el ID de la fila y poder resolverla.",
    );
    return;
  }

  const overlayResolver = document.getElementById("resolverGarantiaOverlay");
  if (overlayResolver) {
    overlayResolver.style.setProperty("z-index", "9999999", "important");
  }

  if (typeof abrirModalResolverGarantia === "function") {
    abrirModalResolverGarantia(filaIndex, correo, plat);
  }
};

/* =========================================================================
   🛠️ ACTUALIZACIÓN EN VIVO DE "RESOLVER": REEMPLAZA CUENTA Y BORRA DE GARANTÍAS
   ========================================================================= */
window.ejecutarResolverGarantia = function (e) {
  if (e) e.preventDefault();
  if (typeof haptic === "function") haptic();

  const btnSubmit = document.getElementById("btnSubmitResolver");
  const fila = document.getElementById("resolverFila").value;
  const plat = document.getElementById("resolverPlataforma").value;
  const correoViejo = document.getElementById("resolverCorreoViejo").value;
  const nuevoCorreo = document.getElementById("resNuevoCorreo").value.trim();
  const nuevaClave = document.getElementById("resNuevaClave").value.trim();

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:bottom;"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg> Guardando Solución...`;

  let platNorm = plat.toUpperCase().trim();

  const cbName = "cb_resolv_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    btnSubmit.disabled = false;
    btnSubmit.innerText = "Guardar y Resolver";

    if (res && res.status === "success") {
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>¡Cuenta resuelta y actualizada al instante!</span></div>`,
        );
      }

      // 🎯 ACTUALIZACIÓN EN VIVO DE MEMORIA RAM Y CACHÉ
      memoriaBuscador.forEach((c) => {
        const cPlat = String(c.plataforma || "")
          .toUpperCase()
          .trim();
        const coincidePlat =
          cPlat.includes(platNorm) || platNorm.includes(cPlat);

        if (
          c.correo.toLowerCase() === correoViejo.toLowerCase() &&
          coincidePlat
        ) {
          c.esCaida = false; // 👈 Quita estado de caída (se borra de la pestaña GARANTÍAS)
          if (nuevoCorreo !== "") c.correo = nuevoCorreo; // 👈 Reemplaza correo en la plataforma original
          if (nuevaClave !== "") c.clave = nuevaClave; // 👈 Reemplaza clave en la plataforma original
        }
      });

      localStorage.setItem(
        "cache_inventario_lupa",
        JSON.stringify(memoriaBuscador),
      );

      // ⚡ RE-PINTA COMPLETO PARA REMOVER DE GARANTÍAS Y VER LA NUEVA CUENTA
      renderizarMatrizCompleta();

      if (typeof cerrarModalResolver === "function") cerrarModalResolver();
      if (typeof cargarGarantias === "function") cargarGarantias();
    } else {
      alert(
        "❌ Error: " + (res ? res.message : "Fallo de conexión al resolver."),
      );
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${URL_SCRIPT_CYBERNET}?action=resolverGarantia&filaIndex=${encodeURIComponent(fila)}&plataforma=${encodeURIComponent(plat)}&correoViejo=${encodeURIComponent(correoViejo)}&nuevoCorreo=${encodeURIComponent(nuevoCorreo)}&nuevaClave=${encodeURIComponent(nuevaClave)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.addEventListener("DOMContentLoaded", () => {
  sincronizarLupaSilenciosa(true);
});

setInterval(() => {
  sincronizarLupaSilenciosa(false);
}, 300000);

/* =========================================================================
   🚑 OBTENER CUENTA TEMPORAL (ORDEN CRONOLÓGICO REAL)
   ========================================================================= */

function convertirFechaAObjeto(strFecha) {
  if (!strFecha) return 0;
  const str = String(strFecha).toLowerCase().trim();
  const meses = {
    ene: 0,
    feb: 1,
    mar: 2,
    abr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    ago: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dic: 11,
  };

  const match = str.match(/^(\d{1,2})[-/\s]([a-z]{3})/);
  if (match) {
    const dia = parseInt(match[1], 10);
    const mesStr = match[2];
    if (meses[mesStr] !== undefined) {
      return new Date(2026, meses[mesStr], dia).getTime();
    }
  }

  const timestamp = Date.parse(str);
  return isNaN(timestamp) ? 0 : timestamp;
}

async function obtenerCuentaTemporalRapida(plataformaTarget) {
  if (!memoriaBuscador || memoriaBuscador.length === 0) {
    memoriaBuscador = await obtenerCuentasParaBuscador();
  }

  const platNorm = String(plataformaTarget || "")
    .toUpperCase()
    .trim();

  const cuentasSanas = memoriaBuscador.filter((cuenta) => {
    const platCuenta = String(cuenta.plataforma || "")
      .toUpperCase()
      .trim();
    const esMismaPlat = platCuenta === platNorm;
    const noEsCaida = !cuenta.esCaida;
    const tieneCorreo = cuenta.correo && cuenta.correo.trim() !== "";
    return esMismaPlat && noEsCaida && tieneCorreo;
  });

  if (cuentasSanas.length === 0) {
    alert(`⚠️ No hay cuentas temporales activas disponibles para ${platNorm}.`);
    return null;
  }

  const mapaFechas = {};
  cuentasSanas.forEach((cuenta) => {
    const fechaTexto = (cuenta.fechaCompra || "").trim();
    if (fechaTexto) {
      if (!mapaFechas[fechaTexto]) {
        mapaFechas[fechaTexto] = convertirFechaAObjeto(fechaTexto);
      }
    }
  });

  const listaFechasOrdenadas = Object.keys(mapaFechas).sort(
    (a, b) => mapaFechas[a] - mapaFechas[b],
  );

  if (listaFechasOrdenadas.length === 0) {
    return cuentasSanas[0];
  }

  let indiceLote = listaFechasOrdenadas.length - 1;

  if (listaFechasOrdenadas.length >= 3) {
    indiceLote = listaFechasOrdenadas.length - 3;
  } else if (listaFechasOrdenadas.length === 2) {
    indiceLote = listaFechasOrdenadas.length - 2;
  }

  const fechaElegida = listaFechasOrdenadas[indiceLote];
  const cuentasDelLote = cuentasSanas.filter(
    (c) => (c.fechaCompra || "").trim() === fechaElegida,
  );

  return cuentasDelLote[0];
}

// =========================================================================
// 👁️ ABRIR PANEL CÓDIGOS ANA (ESTILO CHAYO)
// =========================================================================
window.toggleAnaCodesPanel = function () {
  if (typeof haptic === "function") haptic();

  const overlay = document.getElementById("anaCodesOverlay");
  if (overlay) {
    overlay.classList.toggle("open");

    // Inyectamos la página de TK solo cuando se abre la ventana para que cargue fresquita
    const iframe = document.getElementById("iframeAnaCodes");
    if (overlay.classList.contains("open")) {
      if (iframe && (iframe.src === "about:blank" || iframe.src === "")) {
        iframe.src = "https://correos.tkdjgz.com/";
      }
    }
  }
};

// =========================================================================
// ♻️ MOTOR DE SINCRONIZACIÓN INTELIGENTE (CACHÉ BAJO DEMANDA)
// =========================================================================
window.ultimaSincroBaseDatos = 0;

function usuarioEstaOcupado() {
  const modalesCriticos = [
    "ventasOverlay",
    "cargarOverlay",
    "cambioCuentaOverlay",
    "resolverGarantiaOverlay",
    "editVencOverlay",
    "prestamoModalOverlay",
    "editShiftModalOverlay",
    "garantiasOverlay",
    "comboCalcOverlay",
    "nominaOverlay",
  ];
  return modalesCriticos.some((id) => {
    const modal = document.getElementById(id);
    return modal && modal.classList.contains("open");
  });
}

// 🔥 DESCARGA EN SEGUNDO PLANO (SOLO AL INICIO O AL ABRIR LUPA)
window.sincronizarBaseDatosFondo = function (forzarInmediato = false) {
  if (!sessionStorage.getItem("active_staff")) return;
  if (!forzarInmediato && usuarioEstaOcupado()) return;

  // Escudo anti-spam de 10 segundos para no saturar a Google
  let ahora = Date.now();
  if (ahora - window.ultimaSincroBaseDatos < 10000) return;
  window.ultimaSincroBaseDatos = ahora;

  console.log("♻️ Descargando caché maestro bajo demanda...");

  const cbName = "cb_lupa_fondo_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      console.log("✅ Caché de la Lupa actualizado silenciosamente.");
      memoriaBuscador = res.data;
      localStorage.setItem("cache_inventario_lupa", JSON.stringify(res.data));

      // Si la lupa está abierta, redibuja suavemente (excepto en Ventas para no borrar info que estés digitando)
      const modalLupa = document.getElementById("modal-buscador-global");
      if (
        modalLupa &&
        modalLupa.style.display === "flex" &&
        plataformaActivaBuscador !== "REGISTRO_VENTAS"
      ) {
        if (typeof renderizarFilasTabla === "function") renderizarFilasTabla();
      }
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=descargarInventarioBuscador&versionCliente=&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// 1️⃣ Solo cargar una vez al iniciar la página (espera 3 segs para no trabar el login)
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => window.sincronizarBaseDatosFondo(true), 3000);
});

// 🔥 BOTÓN MANUAL DE LA LUPA (REFRESCA AL INSTANTE Y ACTUALIZA UI) 🔥
window.forzarRefrescoLupaSilencioso = function () {
  if (typeof haptic === "function") haptic();

  const btnIcon = document.getElementById("icon-refresh-lupa");
  if (btnIcon) {
    btnIcon.classList.add("spin-anim");
    btnIcon.style.color = "var(--ios-blue)";
  }

  console.log("⚡ Forzando descarga manual de la Base de Datos...");

  // 👉 CASO A: SI ESTÁ EN LA PESTAÑA "REGISTRO_VENTAS" -> ACTUALIZA VENTAS
  if (plataformaActivaBuscador === "REGISTRO_VENTAS") {
    const cbName = "cb_reg_ventas_man_" + Date.now();
    window[cbName] = function (res) {
      if (btnIcon) {
        btnIcon.classList.remove("spin-anim");
        btnIcon.style.color = "#e1e1e6";
      }
      const node = document.getElementById("node_" + cbName);
      if (node) node.remove();
      delete window[cbName];

      if (res && res.status === "success") {
        window.registroVentasData = res.data;
        if (typeof renderizarFilasTabla === "function") renderizarFilasTabla();
        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"></path></svg> <span>Base de ventas actualizada al instante.</span></div>`,
          );
        }
      } else {
        alert("❌ Error al actualizar ventas.");
      }
    };
    const script = document.createElement("script");
    script.id = "node_" + cbName;
    script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerRegistroVentas&callback=${cbName}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  }
  // 👉 CASO B: SI ESTÁ EN CUALQUIER OTRA PESTAÑA -> ACTUALIZA INVENTARIO NORMAL
  else {
    const cbName = "cb_lupa_manual_" + Date.now();
    window[cbName] = function (res) {
      if (btnIcon) {
        btnIcon.classList.remove("spin-anim");
        btnIcon.style.color = "#e1e1e6";
      }
      const scriptNode = document.getElementById("node_" + cbName);
      if (scriptNode) scriptNode.remove();
      delete window[cbName];

      if (res && res.status === "success") {
        memoriaBuscador = res.data;
        localStorage.setItem("cache_inventario_lupa", JSON.stringify(res.data));
        if (typeof renderizarFilasTabla === "function") renderizarFilasTabla();
        if (typeof triggerToast === "function") {
          triggerToast(
            `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"></path></svg> <span>Inventario actualizado al instante.</span></div>`,
          );
        }
      } else {
        alert("❌ Error al actualizar inventario.");
      }
    };
    const script = document.createElement("script");
    script.id = "node_" + cbName;
    script.src = `${GOOGLE_SCRIPT_URL}?action=descargarInventarioBuscador&versionCliente=&callback=${cbName}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  }
};

function actualizarVisibilidadDock() {
  // 🔍 Escaneo robusto: Busca si hay modales con la clase 'open' O que tengan display activo
  const algunModalAbierto = Array.from(
    document.querySelectorAll(".overlay-ios"),
  ).some((modal) => {
    return (
      modal.classList.contains("open") ||
      (modal.style.display && modal.style.display !== "none")
    );
  });

  const dockWrapper = document.querySelector(".macos-dock-wrapper");
  if (!dockWrapper) return;

  if (algunModalAbierto) {
    // 🔒 CASO: Ventana abierta -> Desactivación física y reubicación total fuera de la pantalla
    document.body.style.overflow = "hidden";
    dockWrapper.style.setProperty("opacity", "0", "important");
    dockWrapper.style.setProperty("pointer-events", "none", "important");
    dockWrapper.style.setProperty("visibility", "hidden", "important");
    dockWrapper.style.setProperty(
      "transform",
      "translateY(120px)",
      "important",
    );
    dockWrapper.style.setProperty(
      "transition",
      "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
      "important",
    );
  } else {
    // 🏠 CASO: Escritorio limpio -> El Dock regresa flotando a su posición original con sus clics
    document.body.style.overflow = "";
    dockWrapper.style.setProperty("opacity", "1", "important");
    dockWrapper.style.setProperty("pointer-events", "auto", "important");
    dockWrapper.style.setProperty("visibility", "visible", "important");
    dockWrapper.style.setProperty("transform", "translateY(0)", "important");
    dockWrapper.style.setProperty(
      "transition",
      "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
      "important",
    );

    // 🔥 NUEVO: Como se acaba de cerrar la ventana y el escritorio está libre,
    // aprovechamos para forzar la actualización del caché de la Lupa.
    setTimeout(() => {
      if (typeof window.sincronizarBaseDatosFondo === "function") {
        window.sincronizarBaseDatosFondo();
      }
    }, 1000); // Esperamos 1 segundo a que termine la animación de cierre de la ventana
  }
}

// =========================================================================
// ➕ FUNCIÓN PARA AGREGAR NÚMERO DE TELÉFONO DESDE LA TABLA (SEGUNDO PLANO)
// =========================================================================
window.agregarTelefonoCelda = function (plataforma, filaIndex, btnElement) {
  if (typeof haptic === "function") haptic();

  let nuevoTelefono = prompt(
    `Ingresa el número de celular para asignarlo en ${plataforma}:`,
  );
  if (!nuevoTelefono || nuevoTelefono.trim() === "") return;

  nuevoTelefono = nuevoTelefono.trim();

  // Guardar HTML original y poner el spinner animado
  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>`;
  btnElement.disabled = true;

  const cbName = "cb_add_tel_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      // Modificamos la memoria local (RAM) para repintar instantáneamente
      let cuentaModificada = memoriaBuscador.find(
        (c) => c.plataforma === plataforma && c.filaIndex == filaIndex,
      );
      if (cuentaModificada) {
        cuentaModificada.telefono = nuevoTelefono;
        localStorage.setItem(
          "cache_inventario_lupa",
          JSON.stringify(memoriaBuscador),
        );
      }

      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"></path></svg> <span>Teléfono agregado con éxito.</span></div>`,
        );
      }

      // Repintar la tabla para mostrar el número y la papelera
      if (typeof renderizarFilasTabla === "function") renderizarFilasTabla();

      // Sincronizar en segundo plano
      if (typeof sincronizarLupaSilenciosa === "function")
        sincronizarLupaSilenciosa(true);
    } else {
      alert(
        "❌ Error: " +
          (res ? res.message : "Fallo de red al intentar agregar."),
      );
      btnElement.innerHTML = originalHTML;
      btnElement.disabled = false;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=agregarTelefonoCelda&plataforma=${encodeURIComponent(plataforma)}&filaIndex=${encodeURIComponent(filaIndex)}&telefono=${encodeURIComponent(nuevoTelefono)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// =========================================================================
// 🛡️ ESTADO GLOBAL (SUSPENDIDAS Y NEYOP)
// =========================================================================
window.vistaModalDb = "PINESMES";
let memoriaSuspendidas = [];
let memoriaNeyop = [];

// =========================================================================
// 🚪 ABRIR PANEL DE SUSPENDIDAS Y AUTO-ACTUALIZAR EN SEGUNDO PLANO
// =========================================================================
window.toggleSuspendidasPanel = function () {
  if (typeof haptic === "function") haptic();

  const overlay = document.getElementById("suspendidasOverlay");
  if (!overlay) return;

  overlay.classList.toggle("open");

  if (overlay.classList.contains("open")) {
    // 🔊 Sonido de apertura
    if (typeof window.CyberSonidos !== "undefined")
      window.CyberSonidos.play("abrir");

    // 1. Aseguramos que la vista por defecto sea la de PINESMES
    window.vistaModalDb = "PINESMES";

    // 2. 🔥 MAGIA AQUÍ: Disparamos la actualización en segundo plano.
    // Al enviarle "true", el sistema sabe que NO debe borrar la pantalla,
    // solo hace girar el icono de refrescar y actualiza los datos silenciosamente.
    if (typeof window.cargarSuspendidas === "function") {
      window.cargarSuspendidas(true);
    }
  } else {
    // 🔊 Sonido de cierre
    if (typeof window.CyberSonidos !== "undefined")
      window.CyberSonidos.play("cerrar");
  }
};

window.cambiarVistaModalDb = function (vista) {
  window.vistaModalDb = vista;
  const btnNeyop = document.getElementById("btnVistaNeyop");
  const btnSusp = document.getElementById("btnVistaSuspendidas");
  const grupoPines = document.getElementById("grupoBotonesPinesMes");
  const grupoNeyop = document.getElementById("grupoBotonesNeyop");
  const titulo = document.getElementById("tituloModalSuspendidas");

  borrarBusquedaSuspendidas();

  if (vista === "NEYOP") {
    if (btnNeyop) btnNeyop.style.display = "none";
    if (btnSusp) btnSusp.style.display = "flex";
    if (grupoPines) grupoPines.style.display = "none";
    if (grupoNeyop) grupoNeyop.style.display = "flex";
    if (titulo) titulo.innerHTML = "Base de Datos: NEYOP";

    if (memoriaNeyop.length === 0) cargarNeyop();
    else renderizarTablaNeyop();
  } else {
    if (btnNeyop) btnNeyop.style.display = "flex";
    if (btnSusp) btnSusp.style.display = "none";
    if (grupoPines) grupoPines.style.display = "flex";
    if (grupoNeyop) grupoNeyop.style.display = "none";
    if (titulo) titulo.innerHTML = "Base de Datos: Suspendidas";

    if (memoriaSuspendidas.length === 0) cargarSuspendidas();
    else renderizarTablaSuspendidas();
  }
};

window.refrescarVistaActualModal = function () {
  if (typeof haptic === "function") haptic();
  if (window.vistaModalDb === "NEYOP") {
    cargarNeyop(true); // El 'true' fuerza la recarga en vivo de la caché
  } else {
    cargarSuspendidas(true);
  }
};

// =========================================================================
// 🔍 LÓGICA DE BÚSQUEDA COMPARTIDA
// =========================================================================
window.manejarInputBusquedaSuspendidas = function () {
  const input = document.getElementById("inputBuscarSuspendidas");
  const btnBorrar = document.getElementById("btnBorrarBusquedaSuspendidas");

  if (input && btnBorrar) {
    if (input.value.length > 0) {
      btnBorrar.style.display = "block";
    } else {
      btnBorrar.style.display = "none";
    }
  }

  if (window.vistaModalDb === "NEYOP") {
    if (typeof renderizarTablaNeyop === "function") renderizarTablaNeyop();
  } else {
    if (typeof renderizarTablaSuspendidas === "function")
      renderizarTablaSuspendidas();
  }
};

window.borrarBusquedaSuspendidas = function () {
  if (typeof haptic === "function") haptic();
  const input = document.getElementById("inputBuscarSuspendidas");
  const btnBorrar = document.getElementById("btnBorrarBusquedaSuspendidas");

  if (input) {
    input.value = "";
    input.focus();
  }
  if (btnBorrar) btnBorrar.style.display = "none";

  if (window.vistaModalDb === "NEYOP") {
    if (typeof renderizarTablaNeyop === "function") renderizarTablaNeyop();
  } else {
    if (typeof renderizarTablaSuspendidas === "function")
      renderizarTablaSuspendidas();
  }
};

// =========================================================================
// 🟣 DESCARGA Y RENDERIZADO EXCLUSIVO DE SUSPENDIDAS (PINESMES)
// =========================================================================
window.cargarSuspendidas = function (forzar = false) {
  const contenedor = document.getElementById("contenedorTablaSuspendidas");
  const iconRefrescar = document.getElementById("iconRefrescarSuspendidas");
  if (!contenedor) return;

  if (forzar && iconRefrescar) {
    iconRefrescar.classList.add("spin-anim");
  } else if (!forzar && memoriaSuspendidas.length === 0) {
    contenedor.innerHTML = `
            <div style="padding: 60px; text-align: center; color: #8e8e93;">
                <svg class="spin-anim" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
                <h3 style="margin-top: 15px; font-size: 1rem;">Descargando Base de Datos...</h3>
            </div>
        `;
  }

  const cbName = "cb_susp_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (iconRefrescar) iconRefrescar.classList.remove("spin-anim");

    if (res && res.status === "success") {
      memoriaSuspendidas = res.data;
      if (window.vistaModalDb === "PINESMES") renderizarTablaSuspendidas();

      if (forzar && typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"></path></svg> <span>Base de datos actualizada en vivo.</span></div>`,
        );
      }
    } else {
      if (window.vistaModalDb === "PINESMES") {
        contenedor.innerHTML = `<div style="color:#ff453a; text-align:center; padding:40px; font-weight:bold;">❌ Error de conexión: ${res ? res.message : "Desconocido"}</div>`;
      }
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerDatosPinesMes&forzar=${forzar}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// =========================================================================
// 📡 RADAR DE VERIFICACIÓN PARA CUENTAS SUSPENDIDAS (CON MEMORIA DE ESTADO)
// =========================================================================
window.estadoRadarSuspendidas = window.estadoRadarSuspendidas || {};
window.radaresSuspendidas = window.radaresSuspendidas || {};

window.copiarCorreoYBuscarVerificacion = function (btn, correo, filaIndex) {
  if (typeof haptic === "function") haptic();

  // 1. COPIADO SEGURO (Conserva el HTML original del ícono para que no desaparezca)
  const originalHTML = btn.innerHTML;

  navigator.clipboard
    .writeText(correo)
    .then(() => {
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ios-green)" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      setTimeout(() => {
        btn.innerHTML = originalHTML; // Restaura el ícono original intacto
      }, 1500);
    })
    .catch((err) => {
      const txt = document.createElement("textarea");
      txt.value = correo;
      document.body.appendChild(txt);
      txt.select();
      document.execCommand("copy");
      txt.remove();
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ios-green)" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      setTimeout(() => {
        btn.innerHTML = originalHTML;
      }, 1500);
    });

  // 2. DISPARA EL RADAR
  window.iniciarRadarSuspendidas(correo, filaIndex);
};

window.iniciarRadarSuspendidas = function (correoTarget, filaIndex) {
  // Guardamos el estado global para que sobreviva a las recargas de la tabla
  window.estadoRadarSuspendidas[filaIndex] = { status: "buscando" };

  const btnVerificar = document.getElementById(`btnVerificar_${filaIndex}`);
  const btnActivar = document.getElementById(`btnActivar_${filaIndex}`);

  if (btnVerificar) {
    btnVerificar.style.display = "inline-flex";
    // Estado buscando con contorno verde
    btnVerificar.style.background = "rgba(48, 209, 88, 0.15)";
    btnVerificar.style.color = "var(--ios-green)";
    btnVerificar.style.border = "1px solid rgba(48, 209, 88, 0.3)";
    btnVerificar.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Buscando...`;
    btnVerificar.removeAttribute("href");
    btnVerificar.removeAttribute("target");
    btnVerificar.onclick = null;
  }

  // Mantenemos oculto el botón de activar
  if (btnActivar) {
    btnActivar.style.display = "none";
  }

  if (window.radaresSuspendidas[filaIndex]) {
    clearInterval(window.radaresSuspendidas[filaIndex]);
  }

  window.radaresSuspendidas[filaIndex] = setInterval(function () {
    const cbRadarName = "cb_radar_susp_" + filaIndex + "_" + Date.now();

    window[cbRadarName] = function (res) {
      const node = document.getElementById("node_" + cbRadarName);
      if (node) node.remove();
      delete window[cbRadarName];

      if (res && res.status === "success" && res.link) {
        clearInterval(window.radaresSuspendidas[filaIndex]);

        // Se encontró el link: Actualizamos el estado global
        window.estadoRadarSuspendidas[filaIndex] = {
          status: "encontrado",
          link: res.link,
        };

        if (typeof CyberSonidos !== "undefined") CyberSonidos.play("notif");

        const currentBtnVerificar = document.getElementById(
          `btnVerificar_${filaIndex}`,
        );
        const currentBtnActivar = document.getElementById(
          `btnActivar_${filaIndex}`,
        );

        if (currentBtnVerificar) {
          currentBtnVerificar.href = res.link;
          currentBtnVerificar.target = "_blank";
          currentBtnVerificar.className = "btn-ios btn-success"; // Pasa a ser verde sólido
          currentBtnVerificar.style.background = "";
          currentBtnVerificar.style.color = "";
          currentBtnVerificar.style.borderColor = "transparent";
          currentBtnVerificar.style.padding = "6px 14px";
          currentBtnVerificar.innerHTML = `✉️ Verificar`;

          currentBtnVerificar.onclick = function () {
            if (currentBtnActivar) {
              // Aparece mágicamente el botón de Activar
              currentBtnActivar.style.display = "flex";
              if (typeof haptic === "function") haptic();
            }
          };
        }
      }
    };

    const script = document.createElement("script");
    script.id = "node_" + cbRadarName;
    script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerLinkVerificacion&correo=${encodeURIComponent(correoTarget)}&callback=${cbRadarName}&_ts=${Date.now()}`;
    document.body.appendChild(script);
  }, 4000);
};

// =========================================================================
// 🚀 NUEVO: CONTROL DINÁMICO DEL BOTÓN "ACTIVAR TODAS"
// =========================================================================
window.ejecutarActivarTodasDinamico = function (btn) {
  if (typeof haptic === "function") haptic();
  let idsValidos = [];

  // Escaneamos todos los botones individuales de "Activar" que existan en la tabla
  let botonesActivar = document.querySelectorAll('[id^="btnActivar_"]');

  botonesActivar.forEach((b) => {
    // Si el botón está VISIBLE (no tiene display: none), significa que:
    // 1. Es una Recarga 2+ (siempre visible)
    // 2. O es una Recarga 1 que YA fue verificada por el radar
    if (b.style.display !== "none") {
      let idFila = b.id.split("_")[1];
      idsValidos.push(idFila);
    }
  });

  if (idsValidos.length === 0) {
    if (typeof triggerToast === "function") {
      triggerToast(
        `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-orange);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> <span>No hay cuentas verificadas o listas para activar.</span></div>`,
      );
    } else {
      alert("No hay cuentas verificadas o de Recarga 2+ listas para activar.");
    }
    return;
  }

  // Ejecutamos la activación en lote original pasándole SOLO los IDs que pasaron el filtro
  if (typeof window.activarMultiplesCuentasSuspendidas === "function") {
    window.activarMultiplesCuentasSuspendidas(idsValidos.join(","), btn);
  }
};

// =========================================================================
// 🟣 TABLA DE RENDERIZADO (RECARGA 1 CON RADAR / RECARGA 2+ DIRECTA)
// =========================================================================
window.renderizarTablaSuspendidas = function () {
  const contenedor = document.getElementById("contenedorTablaSuspendidas");
  const inputBuscador = document.getElementById("inputBuscarSuspendidas");
  if (!contenedor) return;

  const texto = inputBuscador ? inputBuscador.value.toLowerCase().trim() : "";

  let filtrados = memoriaSuspendidas;
  if (texto.length >= 2) {
    let textoLimpioNum = texto.replace(/\D/g, "");
    let esPosibleTelefono = textoLimpioNum.length >= 4 && !texto.includes("@");

    filtrados = memoriaSuspendidas.filter(
      (c) =>
        (c.correo || "").toLowerCase().includes(texto) ||
        (c.pin || "").toLowerCase().includes(texto) ||
        (c.clave || "").toLowerCase().includes(texto) ||
        (c.cliente || "").toLowerCase().includes(texto) ||
        (esPosibleTelefono && (c.telefono || "").includes(textoLimpioNum)),
    );
  }

  const hoyObj = new Date();
  const mesesAbrev = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];
  const fechaHoyCorta = hoyObj.getDate() + "-" + mesesAbrev[hoyObj.getMonth()];

  if (typeof convertirFechaAObjetoLupa === "function") {
    filtrados.sort((a, b) => {
      let fA = a.fechaActivacion
        ? convertirFechaAObjetoLupa(a.fechaActivacion)
        : Date.now();
      let fB = b.fechaActivacion
        ? convertirFechaAObjetoLupa(b.fechaActivacion)
        : Date.now();
      return fB - fA;
    });
  }

  let htmlTabla = `
        <table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.85rem; color: #e4e4e7; text-align: left; white-space: nowrap;">
            <thead>
                <tr>
                    <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #a1a1aa; letter-spacing: 0.5px;">CORREO</th>
                    <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #a1a1aa; letter-spacing: 0.5px;">CONTRASEÑA</th>
                    <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #8e8e93; letter-spacing: 0.5px;">PIN REC.</th>
                    <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #bf5af2; letter-spacing: 0.5px;">RECARGA</th>
                    <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #a1a1aa; letter-spacing: 0.5px;">ACTIVACIÓN</th>
                    <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #ff453a; letter-spacing: 0.5px; text-align:center;">VENCIMIENTO</th>
                    <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #a1a1aa; letter-spacing: 0.5px;">CREADOR</th>
                    <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #30d158; letter-spacing: 0.5px; text-align:center;">VERIFICAR</th>
                </tr>
            </thead>
            <tbody>
    `;

  if (filtrados.length === 0) {
    htmlTabla += `<tr><td colspan="8" style="text-align:center; padding:40px; color:#ff453a; font-weight:bold;">No se encontraron resultados en la base de datos.</td></tr>`;
  } else {
    let ultimaFechaRenderizada = null;

    filtrados.forEach((cuenta, idx) => {
      const esFilaPar = idx % 2 === 0;
      const colorFondoFila = esFilaPar
        ? "rgba(255, 255, 255, 0.015)"
        : "transparent";

      const noTieneFecha =
        !cuenta.fechaActivacion || cuenta.fechaActivacion === "";
      const fechaGrupo = noTieneFecha
        ? `⏳ PENDIENTES (Hoy: ${fechaHoyCorta})`
        : cuenta.fechaActivacion;

      const esRecarga1 = String(cuenta.recarga || "").trim() === "1";
      const estadoRadar = window.estadoRadarSuspendidas[cuenta.filaIndex];

      if (fechaGrupo !== ultimaFechaRenderizada) {
        let botonActivarTodas = "";
        if (noTieneFecha) {
          // 🔥 AQUÍ SE LLAMA A LA NUEVA FUNCIÓN DINÁMICA 🔥
          botonActivarTodas = `<button onclick="window.ejecutarActivarTodasDinamico(this)" class="btn-ios btn-success" style="padding: 6px 14px; font-size: 0.75rem; border-radius: 8px; margin: 0; box-shadow: 0 4px 10px rgba(48, 209, 88, 0.25); display: flex; align-items: center; justify-content: center; gap: 6px; font-weight:800; margin: 0 auto; white-space: nowrap;">🚀 Activar Todas</button>`;
        }

        htmlTabla += `
                    <tr style="background: rgba(142, 142, 147, 0.08);">
                        <td colspan="6" style="padding: 8px 16px; border-top: 1px solid rgba(142, 142, 147, 0.15); border-bottom: 1px solid rgba(142, 142, 147, 0.15); color: #a1a1aa; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                            📅 Cuentas del: ${fechaGrupo}
                        </td>
                        <td style="padding: 8px 16px; border-top: 1px solid rgba(142, 142, 147, 0.15); border-bottom: 1px solid rgba(142, 142, 147, 0.15); text-align: center;">
                            ${botonActivarTodas}
                        </td>
                        <td style="padding: 8px 16px; border-top: 1px solid rgba(142, 142, 147, 0.15); border-bottom: 1px solid rgba(142, 142, 147, 0.15);"></td>
                    </tr>
                `;
        ultimaFechaRenderizada = fechaGrupo;
      }

      const svgCopy = (dato, titulo) => {
        if (!dato || dato === "-") return "";
        const datoLimpio = String(dato).replace(/'/g, "\\'");
        return `
                    <button onclick="copiarDatoAisladoLupa(this, '${datoLimpio}')" title="${titulo}" style="background: transparent; border: none; color: #71717a; cursor: pointer; padding: 2px 4px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; transition: color 0.2s ease;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#71717a'">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                `;
      };

      let textoActivacion = noTieneFecha
        ? `<span style="color:var(--ios-blue); font-style:italic;">${fechaHoyCorta}</span>`
        : cuenta.fechaActivacion;
      let botonOTextoVencimiento = cuenta.fechaVencimiento || "-";

      if (noTieneFecha) {
        if (esRecarga1) {
          botonOTextoVencimiento = `<button id="btnActivar_${cuenta.filaIndex}" onclick="window.activarCuentaSuspendida('${cuenta.filaIndex}', this)" class="btn-ios btn-success" style="display: none; padding: 6px 14px; font-size: 0.75rem; border-radius: 8px; margin: 0; box-shadow: 0 4px 10px rgba(48, 209, 88, 0.25); align-items: center; justify-content: center; gap: 6px; font-weight:800; margin: 0 auto; transition: all 0.3s ease;">
                        🚀 Activar
                    </button>`;
        } else {
          botonOTextoVencimiento = `<button id="btnActivar_${cuenta.filaIndex}" onclick="window.activarCuentaSuspendida('${cuenta.filaIndex}', this)" class="btn-ios btn-success" style="display: flex; padding: 6px 14px; font-size: 0.75rem; border-radius: 8px; margin: 0; box-shadow: 0 4px 10px rgba(48, 209, 88, 0.25); align-items: center; justify-content: center; gap: 6px; font-weight:800; margin: 0 auto; transition: all 0.3s ease;">
                        🚀 Activar
                    </button>`;
        }
      }

      let celdaPinContent = "";
      if (cuenta.pin && cuenta.pin.trim() !== "" && cuenta.pin !== "-") {
        celdaPinContent = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                <span>${cuenta.pin}</span>
                ${svgCopy(cuenta.pin, "Copiar PIN")}
            </div>`;
      } else {
        celdaPinContent = `
            <div style="display: flex; align-items: center; justify-content: center;">
                <button onclick="window.extraerPinIndividual('${cuenta.correo}', this)" class="btn-ios" style="padding: 4px 8px; font-size: 0.7rem; border-radius: 6px; margin: 0; background: rgba(10, 132, 255, 0.1); color: var(--ios-blue); border: 1px solid rgba(10, 132, 255, 0.2); font-weight:700; display:flex; align-items:center; gap:4px; transition: all 0.2s;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                    </svg>
                    PIN
                </button>
            </div>`;
      }

      let botonCopiaCorreo = "";
      let celdaVerificarContent = "";

      if (esRecarga1 && noTieneFecha) {
        botonCopiaCorreo = `<button onclick="window.copiarCorreoYBuscarVerificacion(this, '${String(cuenta.correo).replace(/'/g, "\\'")}', '${cuenta.filaIndex}')" title="Copiar correo e iniciar verificación" style="background: transparent; border: none; color: #71717a; cursor: pointer; padding: 2px 4px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; transition: color 0.2s ease;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#71717a'">
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                  </svg>
                              </button>`;

        if (estadoRadar && estadoRadar.status === "encontrado") {
          celdaVerificarContent = `<a id="btnVerificar_${cuenta.filaIndex}" href="${estadoRadar.link}" target="_blank" class="btn-ios btn-success" style="display: inline-flex; padding: 6px 14px; font-size: 0.8rem; border-radius: 10px; text-decoration: none; font-weight: 800; align-items: center; justify-content: center; gap: 6px; transition: all 0.3s ease; margin: 0 auto; border-color: transparent;" onclick="document.getElementById('btnActivar_${cuenta.filaIndex}').style.display='flex';">✉️ Verificar</a>`;
        } else if (estadoRadar && estadoRadar.status === "buscando") {
          celdaVerificarContent = `<a id="btnVerificar_${cuenta.filaIndex}" class="btn-ios" style="display: inline-flex; padding: 6px 14px; font-size: 0.8rem; border-radius: 10px; text-decoration: none; font-weight: 800; align-items: center; justify-content: center; gap: 6px; transition: all 0.3s ease; margin: 0 auto; background: rgba(48, 209, 88, 0.15); color: var(--ios-green); border: 1px solid rgba(48, 209, 88, 0.3);"><svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Buscando...</a>`;
        } else {
          celdaVerificarContent = `<a id="btnVerificar_${cuenta.filaIndex}" class="btn-ios" style="display: none; padding: 6px 14px; font-size: 0.8rem; border-radius: 10px; text-decoration: none; font-weight: 800; align-items: center; justify-content: center; gap: 6px; transition: all 0.3s ease; margin: 0 auto;"></a>`;
        }
      } else {
        botonCopiaCorreo = svgCopy(cuenta.correo, "Copiar correo");
        celdaVerificarContent = `<span style="color: var(--text-secondary); display: block; text-align: center;">-</span>`;
      }

      htmlTabla += `
                <tr style="background: ${colorFondoFila}; transition: background 0.3s ease;">
                    <td style="padding: 12px 16px; font-weight: 600; color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.03);">
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                            <span>${cuenta.correo || "-"}</span>
                            ${botonCopiaCorreo}
                        </div>
                    </td>
                    <td style="padding: 12px 16px; color: #30d158; font-family: monospace; border-bottom: 1px solid rgba(255,255,255,0.03);">
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                            <span>${cuenta.clave || "-"}</span>
                            ${svgCopy(cuenta.clave, "Copiar contraseña")}
                        </div>
                    </td>
                    <td style="padding: 12px 16px; color: #8e8e93; font-family: monospace; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.03);">
                        ${celdaPinContent}
                    </td>
                    <td style="padding: 12px 16px; color: #bf5af2; font-weight:800; border-bottom: 1px solid rgba(255,255,255,0.03);">${cuenta.recarga || "-"}</td>
                    <td style="padding: 12px 16px; color: #a1a1aa; border-bottom: 1px solid rgba(255,255,255,0.03);">${textoActivacion}</td>
                    <td style="padding: 8px 16px; color: #ff453a; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.03); text-align: center;">${botonOTextoVencimiento}</td>
                    <td style="padding: 12px 16px; color: #a1a1aa; border-bottom: 1px solid rgba(255,255,255,0.03);">${cuenta.creador || "-"}</td>
                    
                    <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); text-align: center;">
                        ${celdaVerificarContent}
                    </td>
                </tr>
            `;
    });
  }

  htmlTabla += `</tbody></table>`;
  contenedor.innerHTML = htmlTabla;
};

// =========================================================================
// 🟣 DESCARGA Y RENDERIZADO EXCLUSIVO DE NEYOP
// =========================================================================
window.cargarNeyop = function (forzar = false) {
  const contenedor = document.getElementById("contenedorTablaSuspendidas");
  const iconRefrescar = document.getElementById("iconRefrescarSuspendidas");
  if (!contenedor) return;

  if (forzar && iconRefrescar) {
    iconRefrescar.classList.add("spin-anim");
  } else if (!forzar && memoriaNeyop.length === 0) {
    contenedor.innerHTML = `
            <div style="padding: 60px; text-align: center; color: #ff9f0a;">
                <svg class="spin-anim" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
                <h3 style="margin-top: 15px; font-size: 1rem;">Conectando a NEYOP...</h3>
            </div>
        `;
  }

  const cbName = "cb_neyop_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (iconRefrescar) iconRefrescar.classList.remove("spin-anim");

    if (res && res.status === "success") {
      memoriaNeyop = res.data;
      if (window.vistaModalDb === "NEYOP") renderizarTablaNeyop();

      if (forzar && typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"></path></svg> <span>NEYOP actualizado en vivo.</span></div>`,
        );
      }
    } else {
      if (window.vistaModalDb === "NEYOP") {
        contenedor.innerHTML = `<div style="color:#ff453a; text-align:center; padding:40px; font-weight:bold;">❌ Error de conexión: ${res ? res.message : "Desconocido"}</div>`;
      }
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=obtenerDatosNeyop&forzar=${forzar}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// =========================================================================
// 🟣 RENDERIZADO EXCLUSIVO DE NEYOP (CON BOTÓN LISTO Y FILA NARANJA)
// =========================================================================
window.renderizarTablaNeyop = function () {
  const contenedor = document.getElementById("contenedorTablaSuspendidas");
  const inputBuscador = document.getElementById("inputBuscarSuspendidas");
  if (!contenedor) return;

  const texto = inputBuscador ? inputBuscador.value.toLowerCase().trim() : "";

  let filtrados = memoriaNeyop;
  if (texto.length >= 2) {
    filtrados = memoriaNeyop.filter(
      (c) =>
        (c.yopmail || "").toLowerCase().includes(texto) ||
        (c.correo || "").toLowerCase().includes(texto) ||
        (c.claveVieja || "").toLowerCase().includes(texto) ||
        (c.claveNueva || "").toLowerCase().includes(texto),
    );
  }

  // ORDEN INTELIGENTE: Llenos arriba, Vacíos abajo
  filtrados.sort((a, b) => {
    let tieneCorreoA =
      a.correo && a.correo.trim() !== "" && a.correo.trim() !== "-" ? 1 : 0;
    let tieneCorreoB =
      b.correo && b.correo.trim() !== "" && b.correo.trim() !== "-" ? 1 : 0;
    return tieneCorreoB - tieneCorreoA;
  });

  let htmlTabla = `
        <table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.85rem; color: #e4e4e7; text-align: left; white-space: nowrap;">
            <thead>
                <tr>
                    <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #ff9f0a; letter-spacing: 0.5px;">YOPMAIL</th>
                    <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #a1a1aa; letter-spacing: 0.5px;">CORREO / CUENTA</th>
                    <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #a1a1aa; letter-spacing: 0.5px;">CLAVE VIEJA</th>
                    <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #30d158; letter-spacing: 0.5px;">CLAVE NUEVA</th>
                    <th style="padding: 14px 16px; font-weight: 800; background: #18181b; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid rgba(255,255,255,0.1); color: #ff9f0a; letter-spacing: 0.5px; text-align: center;">ACCIÓN</th>
                </tr>
            </thead>
            <tbody>
    `;

  if (filtrados.length === 0) {
    htmlTabla += `<tr><td colspan="5" style="text-align:center; padding:40px; color:#ff453a; font-weight:bold;">No se encontraron resultados en la base de datos de NEYOP.</td></tr>`;
  } else {
    filtrados.forEach((cuenta, idx) => {
      // 🔥 LÓGICA DE COLOR (Pinta la fila de naranja si está lista)
      const estaListo = cuenta.estado === "LISTO";
      const esFilaPar = idx % 2 === 0;

      let colorFondoFila = esFilaPar
        ? "rgba(255, 255, 255, 0.015)"
        : "transparent";
      let colorPrimario = "#ff9f0a"; // Naranja Yopmail normal
      let colorBlanco = "#ffffff";
      let colorVerde = "#30d158";

      if (estaListo) {
        colorFondoFila = "rgba(255, 159, 10, 0.15)"; // Fila Naranja transparente
        colorPrimario = "#ffb74d";
        colorBlanco = "#ffb74d";
        colorVerde = "#ffb74d";
      }

      const svgCopy = (dato, titulo) => {
        if (!dato || dato === "-") return "";
        const datoLimpio = String(dato).replace(/'/g, "\\'");
        return `
                    <button onclick="copiarDatoAisladoLupa(this, '${datoLimpio}')" title="${titulo}" style="background: transparent; border: none; color: ${estaListo ? "#ffb74d" : "#71717a"}; cursor: pointer; padding: 2px 4px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; transition: color 0.2s ease;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='${estaListo ? "#ffb74d" : "#71717a"}'">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                `;
      };

      let botonAccion = "";
      if (estaListo) {
        botonAccion = `<span style="color: #ff9f0a; font-weight: 800; display:flex; align-items:center; justify-content: center; gap:4px; font-size: 0.8rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Completado
                </span>`;
      } else if (cuenta.correo && cuenta.correo.trim() !== "") {
        botonAccion = `<button onclick="window.marcarListoNeyop('${cuenta.filaIndex}', this)" class="btn-ios" style="padding: 8px 14px; font-size: 0.75rem; border-radius: 8px; margin: 0 auto; background: #ff9f0a; color: white; border: none; font-weight:800; display:flex; align-items:center; gap:6px; box-shadow: 0 4px 10px rgba(255, 159, 10, 0.3);">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Listo
                </button>`;
      }

      htmlTabla += `
                <tr style="background: ${colorFondoFila}; transition: background 0.3s ease;">
                    <td style="padding: 12px 16px; font-weight: 600; color: ${colorPrimario}; border-bottom: 1px solid rgba(255,255,255,0.03);">
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                            <span>${cuenta.yopmail || "-"}</span>
                            ${svgCopy(cuenta.yopmail, "Copiar Yopmail")}
                        </div>
                    </td>
                    <td style="padding: 12px 16px; font-weight: 600; color: ${colorBlanco}; border-bottom: 1px solid rgba(255,255,255,0.03);">
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                            <span>${cuenta.correo || "-"}</span>
                            ${svgCopy(cuenta.correo, "Copiar Correo")}
                        </div>
                    </td>
                    <td style="padding: 12px 16px; color: ${estaListo ? colorBlanco : "#a1a1aa"}; font-family: monospace; border-bottom: 1px solid rgba(255,255,255,0.03);">
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                            <span>${cuenta.claveVieja || "-"}</span>
                            ${svgCopy(cuenta.claveVieja, "Copiar Clave Vieja")}
                        </div>
                    </td>
                    <td style="padding: 12px 16px; color: ${colorVerde}; font-family: monospace; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.03);">
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                            <span>${cuenta.claveNueva || "-"}</span>
                            ${svgCopy(cuenta.claveNueva, "Copiar Clave Nueva")}
                        </div>
                    </td>
                    <td style="padding: 8px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); text-align: center;">
                        ${botonAccion}
                    </td>
                </tr>
            `;
    });
  }

  htmlTabla += `</tbody></table>`;
  contenedor.innerHTML = htmlTabla;
};

// =========================================================================
// 🚀 NUEVA FUNCIÓN: BOTÓN "LISTO" (NEYOP)
// =========================================================================
window.marcarListoNeyop = function (filaIndex, btnElement) {
  if (typeof haptic === "function") haptic();

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> ...`;
  btnElement.disabled = true;

  const cbName = "cb_listo_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      if (typeof triggerToast === "function")
        triggerToast(
          `<div style="color:var(--ios-green);">✅ Fila completada y pintada.</div>`,
        );
      cargarNeyop(true); // Recarga la tabla en vivo para mostrar el naranja
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de red"));
      btnElement.innerHTML = originalHTML;
      btnElement.disabled = false;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=marcarNeyopListo&filaIndex=${filaIndex}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

// =========================================================================
// 🚀 ACCIONES GLOBALES: TRANSFERIR, GENERAR, ACTIVAR, EXTRAER
// =========================================================================

window.ejecutarFlujoPinesSuspendidas = function (btnElement) {
  if (typeof haptic === "function") haptic();

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Procesando...`;
  btnElement.disabled = true;

  const cbName = "cb_pines_flujo_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    btnElement.innerHTML = originalHTML;
    btnElement.disabled = false;

    if (res && res.status === "success") {
      if (typeof triggerToast === "function")
        triggerToast(
          `<div style="color:var(--ios-green);">✅ ${res.message}</div>`,
        );
      cargarSuspendidas(true);
    } else {
      alert(
        "❌ Error procesando pines: " +
          (res ? res.message : "Fallo de conexión"),
      );
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=procesarPinesSuspendidas&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.ejecutarTransferirRecarga = function (btnElement) {
  if (typeof haptic === "function") haptic();

  // 🔥 MENSAJE ACTUALIZADO PARA QUE COINCIDA CON LA NUEVA LÓGICA
  if (
    !confirm(
      "¿Transferir a NEYOP las recargas PENDIENTES marcadas con '1'? (Se autogenerarán Yopmails si faltan espacios vacíos)",
    )
  )
    return;

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Transfiriendo...`;
  btnElement.disabled = true;

  const cbName = "cb_transfer_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    btnElement.innerHTML = originalHTML;
    btnElement.disabled = false;

    if (res && res.status === "success") {
      if (typeof triggerToast === "function")
        triggerToast(
          `<div style="color:var(--ios-green);">✅ ${res.message}</div>`,
        );
      cargarNeyop(true); // Recargar la tabla en vivo
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de conexión"));
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=transferirRecargasANeyop&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.ejecutarGenerarNeyop = function (btnElement) {
  if (typeof haptic === "function") haptic();

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Generando...`;
  btnElement.disabled = true;

  const cbName = "cb_gen_neyop_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    btnElement.innerHTML = originalHTML;
    btnElement.disabled = false;

    if (res && res.status === "success") {
      if (typeof triggerToast === "function")
        triggerToast(
          `<div style="color:var(--ios-green);">✅ ${res.message}</div>`,
        );
      cargarNeyop(true);
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de conexión"));
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=generarNeyopMasivo&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.activarMultiplesCuentasSuspendidas = function (indices, btnElement) {
  if (typeof haptic === "function") haptic();

  const count = indices.split(",").length;
  if (
    !confirm(
      `¿Estás seguro de activar las ${count} cuentas mostradas al mismo tiempo?`,
    )
  )
    return;

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Calculando...`;
  btnElement.disabled = true;

  const cbName = "cb_act_multi_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      if (typeof triggerToast === "function")
        triggerToast(
          `<div style="color:var(--ios-green);">✅ ${res.message}</div>`,
        );
      cargarSuspendidas(true);
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de red"));
      btnElement.innerHTML = originalHTML;
      btnElement.disabled = false;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=activarMultiplesPinesMes&filas=${indices}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};

window.activarCuentaSuspendida = function (filaIndex, btnElement) {
  if (typeof haptic === "function") haptic();

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Calculando...`;
  btnElement.disabled = true;

  const cbName = "cb_activacion_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      if (typeof triggerToast === "function")
        triggerToast(
          `<div style="color:var(--ios-green);">✅ Cuenta activada.</div>`,
        );
      cargarSuspendidas(true);
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de red"));
      btnElement.innerHTML = originalHTML;
      btnElement.disabled = false;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${GOOGLE_SCRIPT_URL}?action=activarCuentaPinesMes&filaIndex=${filaIndex}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};
window.extraerPinIndividual = function (correo, btnElement) {
  if (typeof haptic === "function") haptic();

  // 🔥 NUEVO: Atrapamos el nombre del usuario logueado en Cybernet
  const userActivo =
    sessionStorage.getItem("active_staff") ||
    localStorage.getItem("cyber_saved_staff") ||
    "Desconocido";

  const originalHTML = btnElement.innerHTML;
  btnElement.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Buscando...`;
  btnElement.disabled = true;

  const cbName = "cb_pin_ind_" + Date.now();
  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success") {
      if (typeof triggerToast === "function") {
        triggerToast(
          `<div style="display:flex; align-items:center; gap:8px; color:var(--ios-green);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"></path></svg> <span>PIN asignado por ${userActivo}</span></div>`,
        );
      }
      window.cargarSuspendidas(true);
    } else {
      alert("❌ Error: " + (res ? res.message : "Fallo de conexión."));
      btnElement.innerHTML = originalHTML;
      btnElement.disabled = false;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  // 🔥 Le pasamos el parámetro '&user=' a Google Sheets
  script.src = `${GOOGLE_SCRIPT_URL}?action=procesarPinIndividualSuspendidas&correo=${encodeURIComponent(correo)}&user=${encodeURIComponent(userActivo)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};
