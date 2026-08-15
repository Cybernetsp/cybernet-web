/* ==========================================================================
   🌟 CYBERNET OS - CREACIÓN DE CUENTAS NETFLIX (ALias)
   ========================================================================== */

window.crearCuentaNetflixAlias = function () {
  if (typeof haptic === "function") haptic();

  // Verificar si ya existe el modal en el DOM y removerlo para no duplicar
  const existingModal = document.getElementById("modalCrearNetflixOverlay");
  if (existingModal) existingModal.remove();

  // Inyectar HTML del Modal Ultra Premium
  const modalHtml = `
    <div class="overlay-ios open" id="modalCrearNetflixOverlay" style="display: flex !important; z-index: 999999 !important; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(14px); align-items: center; justify-content: center;">
      <div class="modal-ios" style="max-width: 420px; width: 92%; background: #16161a; border: 1px solid rgba(229, 9, 20, 0.3); border-radius: 26px; padding: 26px 24px; display: flex; flex-direction: column; gap: 18px; box-shadow: 0 25px 60px rgba(0,0,0,0.9); position: relative; overflow: hidden;">
        
        <!-- Efecto Glow Rojo Superior -->
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent, #e50914, transparent); box-shadow: 0 0 15px #e50914; opacity: 0.9;"></div>

        <!-- Encabezado -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="background: rgba(229, 9, 20, 0.15); color: #e50914; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(229, 9, 20, 0.3);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </div>
            <div>
              <h3 style="margin: 0; color: #ffffff; font-size: 1.15rem; font-weight: 800; letter-spacing: -0.3px;">Crear Netflix</h3>
              <span style="color: #a1a1aa; font-size: 0.75rem; font-weight: 600;">Generador de cuentas Alias</span>
            </div>
          </div>
          <button type="button" onclick="document.getElementById('modalCrearNetflixOverlay').remove()" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #a1a1aa; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; transition: 0.2s;">✕</button>
        </div>

        <!-- Formulario -->
        <form id="formCrearAliasNet" onsubmit="window.procesarCreacionAliasNet(event)" style="display: flex; flex-direction: column; gap: 16px; margin: 0;">
          
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 0.7rem; color: #a1a1aa; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Correo Base</label>
            <input type="email" id="netCorreoBase" class="input-ios" placeholder="ejemplo@outlook.com" required style="background: rgba(0, 0, 0, 0.4); padding: 14px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); color: #ffffff; font-size: 0.95rem; font-weight: 600; outline: none; transition: 0.3s; margin:0;" onfocus="this.style.borderColor='rgba(229, 9, 20, 0.5)'" onblur="this.style.borderColor='rgba(255, 255, 255, 0.1)'">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 0.7rem; color: #a1a1aa; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Alias (+)</label>
              <input type="text" id="netAliasNum" class="input-ios" placeholder="1" required value="1" style="background: rgba(0, 0, 0, 0.4); padding: 14px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); color: #0a84ff; font-weight: 900; font-size: 1.05rem; outline: none; text-align: center; margin:0;" onfocus="this.style.borderColor='rgba(10, 132, 255, 0.5)'" onblur="this.style.borderColor='rgba(255, 255, 255, 0.1)'">
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 0.7rem; color: #a1a1aa; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Contraseña</label>
              <input type="text" id="netClave" class="input-ios" placeholder="fuego41@@" required value="fuego41@@" style="background: rgba(0, 0, 0, 0.4); padding: 14px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); color: #30d158; font-weight: 800; font-family: monospace; font-size: 1rem; outline: none; text-align: center; margin:0;" onfocus="this.style.borderColor='rgba(48, 209, 88, 0.5)'" onblur="this.style.borderColor='rgba(255, 255, 255, 0.1)'">
            </div>
          </div>

          <div style="margin-top: 10px;">
            <button type="submit" id="btnProcesarCrearNet" style="width: 100%; background: #e50914; color: #ffffff; border: none; padding: 15px; border-radius: 14px; font-weight: 900; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(229, 9, 20, 0.35); transition: transform 0.1s;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Crear y Guardar en DB
            </button>
          </div>

        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
  
  // Hacer auto-focus en el input de correo
  setTimeout(() => { document.getElementById("netCorreoBase").focus(); }, 100);
};

// Función procesadora que conecta con PHP
window.procesarCreacionAliasNet = function (e) {
  e.preventDefault();
  if (typeof haptic === "function") haptic();

  const btn = document.getElementById("btnProcesarCrearNet");
  const correoBase = document.getElementById("netCorreoBase").value.trim();
  const aliasNumero = document.getElementById("netAliasNum").value.trim();
  const clave = document.getElementById("netClave").value.trim();

  if (!correoBase || !aliasNumero || !clave) return;

  // Generar la cadena del correo con alias
  let correoFinal = correoBase;
  if (correoBase.includes("@")) {
    const partes = correoBase.split("@");
    correoFinal = `${partes[0]}+${aliasNumero}@${partes[1]}`;
  }

  const originalText = btn.innerHTML;
  btn.innerHTML = `<svg class="spin-anim" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> Guardando en Bóveda...`;
  btn.disabled = true;

  const formData = new FormData();
  formData.append("accion", "crear_cuenta_netflix_alias");
  formData.append("correo", correoFinal);
  formData.append("clave", clave);

  fetch("https://api.cybernetsp.com/acciones_mysql.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      if (res && res.status === "success") {
        if (typeof triggerToast === "function") triggerToast(`✅ Cuenta creada:\n${correoFinal}`);
        
        // Destruir el modal
        document.getElementById("modalCrearNetflixOverlay").remove();
        
        // Refrescar las vistas de la App en segundo plano
        if (typeof window.cargarDatosMySQL === "function") window.cargarDatosMySQL();
        if (typeof window.cargarCortesOperativosNetflix === "function") window.cargarCortesOperativosNetflix();
      } else {
        alert("❌ Error: " + (res ? res.message : "No se pudo crear la cuenta."));
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    })
    .catch((err) => {
      console.error(err);
      alert("❌ Error de comunicación al crear cuenta.");
      btn.innerHTML = originalText;
      btn.disabled = false;
    });
};