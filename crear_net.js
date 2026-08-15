/* ==========================================================================
   🌟 CYBERNET OS - CREACIÓN AUTOMATIZADA DE NETFLIX (SHEETS ➔ MYSQL)
   ========================================================================== */

const SCRIPT_URL_NETFLIX =
  "https://script.google.com/macros/s/AKfycbxqKpMcC5BI0H6PHnImu5Lkw3ryiuFO0fW0KJAhQ_45kzglYn9CpN1O2fCjezXM5oMi/exec";

window.crearCuentaNetflixAliasExterna = function () {
  if (typeof haptic === "function") haptic();

  const existingModal = document.getElementById("modalCrearNetflixOverlay");
  if (existingModal) existingModal.remove();

  const modalHtml = `
    <div class="overlay-ios open" id="modalCrearNetflixOverlay" style="display: flex !important; z-index: 999999 !important; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(14px); align-items: center; justify-content: center;">
      <div class="modal-ios" style="max-width: 420px; width: 92%; background: #16161a; border: 1px solid rgba(229, 9, 20, 0.3); border-radius: 26px; padding: 26px 24px; display: flex; flex-direction: column; gap: 18px; box-shadow: 0 25px 60px rgba(0,0,0,0.9); position: relative; overflow: hidden;">
        
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent, #e50914, transparent); box-shadow: 0 0 15px #e50914; opacity: 0.9;"></div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="background: rgba(229, 9, 20, 0.15); color: #e50914; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(229, 9, 20, 0.3);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </div>
            <div>
              <h3 style="margin: 0; color: #ffffff; font-size: 1.15rem; font-weight: 800; letter-spacing: -0.3px;">Generador Netflix</h3>
              <span style="color: #a1a1aa; font-size: 0.75rem; font-weight: 600;">Sincronizado: Sheets ➔ MySQL</span>
            </div>
          </div>
          <button type="button" onclick="document.getElementById('modalCrearNetflixOverlay').remove()" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #a1a1aa; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; transition: 0.2s;">✕</button>
        </div>

        <div id="contenedorGeneradorNet" style="display: flex; flex-direction: column; gap: 16px; text-align: center;">
          <p style="color: #a1a1aa; font-size: 0.85rem; margin: 0; line-height: 1.5; text-align: left;">
            El sistema conectará a tu Apps Script para asignar el <b>PIN de Refácil</b>, tomará el siguiente <b>Alias</b>, y la guardará automáticamente en <b>PINESMES</b>.<br><br>Luego se subirá inmediatamente a <b>MySQL</b>.
          </p>
          
          <button type="button" id="btnProcesarCrearNet" onclick="window.ejecutarGeneracionAliasDual(this)" style="width: 100%; background: #e50914; color: #ffffff; border: none; padding: 16px; border-radius: 14px; font-weight: 900; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 6px 20px rgba(229, 9, 20, 0.4); transition: transform 0.1s;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            Generar y Guardar Cuenta
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
};

window.ejecutarGeneracionAliasDual = function (btn) {
  if (typeof haptic === "function") haptic();

  const originalText = btn.innerHTML;
  btn.innerHTML = `<svg class="spin-anim" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> 1/2: Procesando en PINESMES...`;
  btn.disabled = true;

  const userActivo =
    sessionStorage.getItem("active_staff") ||
    localStorage.getItem("cyber_saved_staff") ||
    "Sistema";
  const cbName = "cb_alias_cta_" + Date.now();

  window[cbName] = function (res) {
    const scriptNode = document.getElementById("node_" + cbName);
    if (scriptNode) scriptNode.remove();
    delete window[cbName];

    if (res && res.status === "success" && res.data) {
      const correoGenerado = res.data.correo;
      const claveGenerada = res.data.clave;

      btn.innerHTML = `<svg class="spin-anim" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg> 2/2: Subiendo a MySQL...`;

      const formData = new FormData();
      formData.append("accion", "crear_cuenta_netflix_alias");
      formData.append("correo", correoGenerado);
      formData.append("clave", claveGenerada);

      fetch("https://api.cybernetsp.com/acciones_mysql.php", {
        method: "POST",
        body: formData,
      })
        .then((r) => r.json())
        .then((dbRes) => {
          if (dbRes && dbRes.status === "success") {
            if (typeof triggerToast === "function")
              triggerToast(`✅ Sincronización Exitosa: ${correoGenerado}`);

            if (typeof window.cargarDatosMySQL === "function")
              window.cargarDatosMySQL();
            if (typeof window.cargarCortesOperativosNetflix === "function")
              window.cargarCortesOperativosNetflix();

            document.getElementById("contenedorGeneradorNet").innerHTML = `
              <div style="background: rgba(48, 209, 88, 0.08); border: 1px solid rgba(48, 209, 88, 0.3); padding: 20px; border-radius: 18px; display: flex; flex-direction: column; gap: 14px; text-align: left;">
                
                <div style="color: #30d158; font-weight: 900; font-size: 1.15rem; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 5px;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  ¡Sincronización Completada!
                </div>
                
                <div style="background: rgba(0,0,0,0.5); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05);">
                  <span style="font-size: 0.65rem; color: #a1a1aa; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Correo Asignado (Alias)</span>
                  <div style="color: #ffffff; font-family: monospace; font-size: 1.05rem; font-weight: 800; margin-top: 4px; word-break: break-all;">${correoGenerado}</div>
                </div>

                <div style="background: rgba(0,0,0,0.5); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05);">
                  <span style="font-size: 0.65rem; color: #a1a1aa; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Contraseña Generada</span>
                  <div style="color: #30d158; font-family: monospace; font-size: 1.1rem; font-weight: 900; margin-top: 4px;">${claveGenerada}</div>
                </div>
                
                <button onclick="document.getElementById('modalCrearNetflixOverlay').remove()" style="width: 100%; background: #30d158; color: #000000; padding: 14px; border-radius: 14px; font-weight: 900; font-size: 0.95rem; border: none; margin-top: 6px; cursor: pointer; box-shadow: 0 4px 15px rgba(48, 209, 88, 0.3);">
                  Entendido / Cerrar
                </button>
              </div>
            `;
          } else {
            alert(
              "⚠️ Se guardó en Sheets pero falló en MySQL: " +
                (dbRes ? dbRes.message : "Error desconocido"),
            );
            btn.innerHTML = originalText;
            btn.disabled = false;
          }
        })
        .catch((err) => {
          console.error(err);
          alert("❌ Error conectando con MySQL.");
          btn.innerHTML = originalText;
          btn.disabled = false;
        });
    } else {
      alert(
        "❌ Google Sheets: " +
          (res ? res.message : "Sin respuesta o sin pines disponibles."),
      );
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  };

  const script = document.createElement("script");
  script.id = "node_" + cbName;
  script.src = `${SCRIPT_URL_NETFLIX}?action=generarNuevaCuentaAlias&user=${encodeURIComponent(userActivo)}&callback=${cbName}&_ts=${Date.now()}`;
  document.body.appendChild(script);
};
