window.tablaMySQLActual = 'netflix';
let searchTimeoutMySQL = null;

// Evaluar sesión y rol del usuario
const usuarioActivoObj = JSON.parse(sessionStorage.getItem("usuario_activo") || "{}");
const usuarioNombre = (usuarioActivoObj.nombre || sessionStorage.getItem("active_staff") || "").toUpperCase();
const esSuperAdmin = (usuarioActivoObj.rol === "superadmin" || usuarioNombre === "CAMILO");

document.addEventListener("DOMContentLoaded", () => {
  if (esSuperAdmin) {
    const btnAdd = document.getElementById("btnAgregarMySQL");
    if (btnAdd) {
      btnAdd.style.display = "inline-flex";
    }
  }
  cargarDatosMySQL();
});

function cambiarTablaMySQL(nombreTabla, btnElement) {
  if (typeof haptic === "function") haptic();
  window.tablaMySQLActual = nombreTabla;

  document.querySelectorAll(".mysql-tab-btn").forEach(b => b.classList.remove("active"));
  if (btnElement) {
    btnElement.classList.add("active");
  }

  cargarDatosMySQL();
}

function filtrarMySQL() {
  clearTimeout(searchTimeoutMySQL);
  searchTimeoutMySQL = setTimeout(() => {
    cargarDatosMySQL();
  }, 300);
}

function cargarDatosMySQL() {
  const thead = document.getElementById("tablaMySQLCabecera");
  const tbody = document.getElementById("tablaMySQLCuerpo");
  if (!tbody || !thead) return;

  const esNetflix = (window.tablaMySQLActual.toLowerCase() === 'netflix');
  const totalColumnas = esNetflix ? 12 : 10;

  // Estilo base para celdas de encabezado
  const thBase = "padding: 12px 8px; font-weight: 800; text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.5px; white-space: nowrap;";

  // 1. DIBUJAR ENCABEZADOS DE COLUMNA CON ANCHOS EN PORCENTAJE
  if (esNetflix) {
    thead.innerHTML = `
      <tr>
        <th style="${thBase} width: 7%;">FECHA / DÍA</th>
        <th style="${thBase} width: 15%;">CORREO / USUARIO</th>
        <th style="${thBase} width: 10%;">CONTRASEÑA</th>
        <th style="${thBase} width: 5%; text-align: center;">PERFIL</th>
        <th style="${thBase} width: 5%; text-align: center;">PIN</th>
        <th style="${thBase} width: 9%;">VENCIMIENTO</th>
        <th style="${thBase} width: 9%;">CLIENTE</th>
        <th style="${thBase} width: 9%;">TELÉFONO</th>
        <th style="${thBase} width: 7%;">FECHA PAGO</th>
        <th style="${thBase} width: 7%;">VALOR</th>
        <th style="${thBase} width: 10%;">PAGO</th>
        <th style="${thBase} width: 12%; text-align: center;">ACCIÓN</th>
      </tr>
    `;
  } else {
    thead.innerHTML = `
      <tr>
        <th style="${thBase} width: 8%;">FECHA / DÍA</th>
        <th style="${thBase} width: 8%;">PROVEEDOR</th>
        <th style="${thBase} width: 16%;">CORREO / USUARIO</th>
        <th style="${thBase} width: 10%;">CONTRASEÑA</th>
        <th style="${thBase} width: 5%; text-align: center;">PERFIL</th>
        <th style="${thBase} width: 5%; text-align: center;">PIN</th>
        <th style="${thBase} width: 10%;">VENCIMIENTO</th>
        <th style="${thBase} width: 11%;">CLIENTE</th>
        <th style="${thBase} width: 11%;">TELÉFONO</th>
        <th style="${thBase} width: 16%; text-align: center;">ACCIÓN</th>
      </tr>
    `;
  }

  const busquedaInput = document.getElementById("inputSearchMySQL");
  const busqueda = busquedaInput ? busquedaInput.value.trim() : "";

  tbody.innerHTML = `
    <tr>
      <td colspan="${totalColumnas}" style="text-align: center; padding: 40px; color: var(--text-secondary);">
        <svg class="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:8px; vertical-align:middle;">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        </svg>
        Consultando MySQL...
      </td>
    </tr>
  `;

  fetch(`obtener_tabla_mysql.php?tabla=${encodeURIComponent(window.tablaMySQLActual)}&busqueda=${encodeURIComponent(busqueda)}`)
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        let html = '';
        if (!data.data || data.data.length === 0) {
          html = `<tr><td colspan="${totalColumnas}" style="text-align: center; padding: 40px; color: var(--ios-red); font-weight: 600;">No se encontraron registros en esta tabla.</td></tr>`;
        } else {
          let fechaGrupoActual = null;

          const svgCopyIcon = (datoEscapado, titulo) => {
            return `
              <button onclick="copiarTextoUnico(this, '${datoEscapado}')" title="${titulo}" style="background: transparent; border: none; color: #71717a; cursor: pointer; padding: 2px 4px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; transition: color 0.2s ease;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#71717a'">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            `;
          };

          data.data.forEach((fila, idx) => {
            let diaVal       = fila.dia || fila.fecha || '-';
            let provVal      = fila.proveedor || '-';
            let correoVal    = fila.correo || fila.usuario || '-';
            let claveVal     = fila.clave || fila.contrasena || '-';
            let perfilVal    = fila.perfil || '-';
            let pinVal       = fila.pin || '-';
            let vencVal      = fila.vencimiento || '-';
            let clienteVal   = fila.nombre || fila.cliente || '-';
            let numeroVal    = fila.numero || fila.telefono || '-';
            let fechaPagoVal = fila.fecha || '-';
            let valorVal     = fila.valor || '-';
            let pagoVal      = fila.pago || '-';

            // COLOR DE FONDO TIPO ZEBRA
            const esFilaPar = idx % 2 === 0;
            const colorFondoFila = esFilaPar ? "rgba(255, 255, 255, 0.015)" : "transparent";

            // 2. AGRUPACIÓN POR FECHA ESTILO MAC
            if (diaVal !== fechaGrupoActual && diaVal !== '-') {
              fechaGrupoActual = diaVal;

              let btnBorrarFecha = '';
              if (esSuperAdmin) {
                btnBorrarFecha = `
                  <button onclick="eliminarFechaMySQL('${encodeURIComponent(diaVal)}')" style="background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.3); color: #ff453a; padding: 4px 12px; border-radius: 8px; font-size: 0.7rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease;">
                    🗑️ Borrar Fecha
                  </button>
                `;
              }

              html += `
                <tr style="background: rgba(10, 132, 255, 0.05);">
                  <td colspan="${totalColumnas}" style="padding: 8px 16px; border-top: 1px solid rgba(10, 132, 255, 0.2); border-bottom: 1px solid rgba(10, 132, 255, 0.2); color: #0a84ff; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                      <span>📅 CUENTAS DEL: ${diaVal.toUpperCase()}</span>
                      ${btnBorrarFecha}
                    </div>
                  </td>
                </tr>
              `;
            }

            // ARMADO DEL TEXTO A COPIAR Y JSON
            let textoCopiarFicha = `📺 ${window.tablaMySQLActual.toUpperCase()}\n📧 Correo: ${correoVal}\n🔑 Clave: ${claveVal}\n👤 Perfil: ${perfilVal}\n📍 PIN: ${pinVal}`;
            if (esNetflix) {
              textoCopiarFicha += `\n📅 Vence: ${vencVal}`;
            } else if (provVal !== '-') {
              textoCopiarFicha = `📺 ${window.tablaMySQLActual.toUpperCase()}\n👤 Proveedor: ${provVal}\n📧 Correo: ${correoVal}\n🔑 Clave: ${claveVal}\n👤 Perfil: ${perfilVal}\n📍 PIN: ${pinVal}\n📅 Vence: ${vencVal}`;
            }

            let textoEscapadoFicha = encodeURIComponent(textoCopiarFicha);
            let filaJsonEscapada = encodeURIComponent(JSON.stringify(fila));

            // ESTRUCTURA DE LA CELDA DE CORREO Y CLAVE
            let celdaCorreo = correoVal !== '-' 
              ? `<div style="display: flex; align-items: center; justify-content: flex-start; gap: 6px; overflow: hidden;">
                   <span style="color: #0a84ff; font-family: monospace; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${correoVal}">${correoVal}</span>
                   ${svgCopyIcon(encodeURIComponent(correoVal), 'Copiar correo')}
                 </div>`
              : '<span style="color: #a1a1aa;">-</span>';

            let celdaClave = claveVal !== '-' 
              ? `<div style="display: flex; align-items: center; justify-content: flex-start; gap: 6px; overflow: hidden;">
                   <span style="color: #30d158; font-family: monospace; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${claveVal}">${claveVal}</span>
                   ${svgCopyIcon(encodeURIComponent(claveVal), 'Copiar contraseña')}
                 </div>`
              : '<span style="color: #a1a1aa;">-</span>';

            // BOTONES DE ACCIÓN (Lápiz, Papelera, Copiar)
            let botonesAccion = `<button onclick="copiarAccesoMySQL(this, '${textoEscapadoFicha}')" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; white-space: nowrap;">📋 Copiar</button>`;

            if (esSuperAdmin) {
              botonesAccion = `
                <div style="display: flex; gap: 6px; align-items: center; justify-content: center; min-width: 130px; white-space: nowrap;">
                  <button onclick="abrirModalEditarMySQL('${filaJsonEscapada}')" title="Editar Datos" style="background: rgba(10, 132, 255, 0.1); border: 1px solid rgba(10, 132, 255, 0.2); border-radius: 6px; padding: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #0a84ff; transition: all 0.2s ease;">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                  </button>
                  <button onclick="eliminarRegistroMySQL(${fila.id})" title="Eliminar Registro" style="background: rgba(255, 69, 58, 0.1); border: 1px solid rgba(255, 69, 58, 0.2); border-radius: 6px; padding: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #ff453a; transition: all 0.2s ease;">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                  </button>
                  <button onclick="copiarAccesoMySQL(this, '${textoEscapadoFicha}')" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; white-space: nowrap;">
                      📋 Copiar
                  </button>
                </div>
              `;
            }

            if (esNetflix) {
              html += `
                <tr style="background: ${colorFondoFila}; border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.3s ease;">
                  <td style="padding: 10px 8px; color: #a1a1aa;">${diaVal}</td>
                  <td style="padding: 10px 8px;">${celdaCorreo}</td>
                  <td style="padding: 10px 8px;">${celdaClave}</td>
                  <td style="padding: 10px 8px; color: #e4e4e7; font-weight: 600; text-align: center;">${perfilVal}</td>
                  <td style="padding: 10px 8px; color: #ffd60a; font-weight: 700; font-family: monospace; text-align: center;">${pinVal}</td>
                  <td style="padding: 10px 8px; font-weight: 800; color: #ff9f0a;">${vencVal}</td>
                  <td style="padding: 10px 8px; color: #e4e4e7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${clienteVal}">${clienteVal}</td>
                  <td style="padding: 10px 8px; color: #a1a1aa; font-family: monospace;">${numeroVal}</td>
                  <td style="padding: 10px 8px; color: #a1a1aa;">${fechaPagoVal}</td>
                  <td style="padding: 10px 8px; color: #30d158; font-weight: bold;">${valorVal}</td>
                  <td style="padding: 10px 8px; max-width: 120px; overflow: hidden;">
                    <span style="background: rgba(255,255,255,0.08); padding: 4px 8px; border-radius: 6px; font-size: 0.72rem; border: 1px solid rgba(255,255,255,0.1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: inline-block; max-width: 110px; vertical-align: middle;" title="${pagoVal}">${pagoVal}</span>
                  </td>
                  <td style="padding: 10px 8px; text-align: center;">${botonesAccion}</td>
                </tr>
              `;
            } else {
              html += `
                <tr style="background: ${colorFondoFila}; border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.3s ease;">
                  <td style="padding: 10px 8px; color: #a1a1aa;">${diaVal}</td>
                  <td style="padding: 10px 8px; color: #ff9f0a; font-weight: 700;">${provVal}</td>
                  <td style="padding: 10px 8px;">${celdaCorreo}</td>
                  <td style="padding: 10px 8px;">${celdaClave}</td>
                  <td style="padding: 10px 8px; color: #e4e4e7; font-weight: 600; text-align: center;">${perfilVal}</td>
                  <td style="padding: 10px 8px; color: #ffd60a; font-weight: 700; font-family: monospace; text-align: center;">${pinVal}</td>
                  <td style="padding: 10px 8px; font-weight: 800; color: #ff9f0a;">${vencVal}</td>
                  <td style="padding: 10px 8px; color: #e4e4e7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${clienteVal}">${clienteVal}</td>
                  <td style="padding: 10px 8px; color: #a1a1aa; font-family: monospace;">${numeroVal}</td>
                  <td style="padding: 10px 8px; text-align: center;">${botonesAccion}</td>
                </tr>
              `;
            }
          });
        }
        tbody.innerHTML = html;
      } else if (data.status === 'empty') {
        tbody.innerHTML = `<tr><td colspan="${totalColumnas}" style="text-align: center; padding: 40px; color: var(--text-secondary);">${data.message}</td></tr>`;
      } else {
        tbody.innerHTML = `<tr><td colspan="${totalColumnas}" style="text-align: center; padding: 40px; color: var(--ios-red); font-weight: 600;">Error: ${data.message}</td></tr>`;
      }
    })
    .catch(err => {
      tbody.innerHTML = `<tr><td colspan="${totalColumnas}" style="text-align: center; padding: 40px; color: var(--ios-red); font-weight: 600;">❌ Error de conexión al consultar MySQL.</td></tr>`;
      console.error(err);
    });
}

function eliminarFechaMySQL(diaEscapado) {
  const diaValor = decodeURIComponent(diaEscapado);
  if (!confirm(`⚠️ ¿Estás seguro de que deseas eliminar TODOS los registros del día '${diaValor}' en la tabla '${window.tablaMySQLActual}'?`)) return;
  
  if (typeof haptic === "function") haptic();

  const formData = new FormData();
  formData.append("accion", "eliminar_fecha");
  formData.append("tabla", window.tablaMySQLActual);
  formData.append("dia_valor", diaValor);

  fetch("acciones_mysql.php", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      cargarDatosMySQL();
    } else {
      alert("❌ " + data.message);
    }
  })
  .catch(err => alert("❌ Error al procesar la eliminación por fecha."));
}

function abrirModalAgregarMySQL() {
  if (typeof haptic === "function") haptic();
  document.getElementById("formAgregarMySQL").reset();

  const selectPlat = document.getElementById("addMySQLPlataforma");
  if (selectPlat) {
    selectPlat.value = window.tablaMySQLActual;
  }

  document.getElementById("modalAgregarMySQL").style.display = "flex";
  document.getElementById("addMySQLBloque").focus();
}

function cerrarModalAgregarMySQL() {
  if (typeof haptic === "function") haptic();
  document.getElementById("modalAgregarMySQL").style.display = "none";
}

function guardarNuevoRegistroMySQL(e) {
  e.preventDefault();
  if (typeof haptic === "function") haptic();

  const btn = document.getElementById("btnGuardarAddMySQL");
  const plataforma = document.getElementById("addMySQLPlataforma").value;
  const bloque = document.getElementById("addMySQLBloque").value.trim();

  if (!bloque) {
    alert("⚠️ Pega primero los datos de Google Sheets en el recuadro.");
    return;
  }

  btn.disabled = true;
  btn.innerText = "Subiendo...";

  const formData = new FormData();
  formData.append("accion", "agregar");
  formData.append("tabla", plataforma);
  formData.append("bloque_cuentas", bloque);

  fetch("acciones_mysql.php", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    btn.disabled = false;
    btn.innerText = "Subir a MySQL";

    if (data.status === "success") {
      cerrarModalAgregarMySQL();
      if (plataforma.toLowerCase() === window.tablaMySQLActual.toLowerCase()) {
        cargarDatosMySQL();
      } else {
        window.tablaMySQLActual = plataforma;
        document.querySelectorAll(".mysql-tab-btn").forEach(b => b.classList.remove("active"));
        cargarDatosMySQL();
      }
    } else {
      alert("❌ " + data.message);
    }
  })
  .catch(err => {
    btn.disabled = false;
    btn.innerText = "Subir a MySQL";
    alert("❌ Error al conectar con el servidor.");
  });
}

function abrirModalEditarMySQL(filaEscapada) {
  if (typeof haptic === "function") haptic();
  const fila = JSON.parse(decodeURIComponent(filaEscapada));

  document.getElementById("editMySQLId").value          = fila.id;
  document.getElementById("editMySQLCorreo").value      = fila.correo || fila.usuario || '';
  document.getElementById("editMySQLClave").value       = fila.clave || fila.contrasena || '';
  document.getElementById("editMySQLPerfil").value      = fila.perfil || '';
  document.getElementById("editMySQLPin").value         = fila.pin || '';
  document.getElementById("editMySQLVencimiento").value = fila.vencimiento || '';
  document.getElementById("editMySQLNombre").value      = fila.nombre || fila.cliente || '';
  document.getElementById("editMySQLNumero").value      = fila.numero || fila.telefono || '';

  document.getElementById("modalEditarMySQL").style.display = "flex";
}

function cerrarModalEditarMySQL() {
  if (typeof haptic === "function") haptic();
  document.getElementById("modalEditarMySQL").style.display = "none";
}

function guardarEdicionMySQL(e) {
  e.preventDefault();
  if (typeof haptic === "function") haptic();

  const btn = document.getElementById("btnGuardarEditMySQL");
  btn.disabled = true;
  btn.innerText = "Guardando...";

  const formData = new FormData();
  formData.append("accion", "editar");
  formData.append("tabla", window.tablaMySQLActual);
  formData.append("id", document.getElementById("editMySQLId").value);
  formData.append("correo", document.getElementById("editMySQLCorreo").value);
  formData.append("clave", document.getElementById("editMySQLClave").value);
  formData.append("perfil", document.getElementById("editMySQLPerfil").value);
  formData.append("pin", document.getElementById("editMySQLPin").value);
  formData.append("vencimiento", document.getElementById("editMySQLVencimiento").value);
  formData.append("nombre", document.getElementById("editMySQLNombre").value);
  formData.append("numero", document.getElementById("editMySQLNumero").value);

  fetch("acciones_mysql.php", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    btn.disabled = false;
    btn.innerText = "Guardar";

    if (data.status === "success") {
      cerrarModalEditarMySQL();
      cargarDatosMySQL();
    } else {
      alert("❌ " + data.message);
    }
  })
  .catch(err => {
    btn.disabled = false;
    btn.innerText = "Guardar";
    alert("❌ Error al actualizar el registro.");
  });
}

function eliminarRegistroMySQL(id) {
  if (!confirm("⚠️ ¿Estás seguro de que deseas eliminar este registro de MySQL?")) return;
  if (typeof haptic === "function") haptic();

  const formData = new FormData();
  formData.append("accion", "eliminar");
  formData.append("tabla", window.tablaMySQLActual);
  formData.append("id", id);

  fetch("acciones_mysql.php", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      cargarDatosMySQL();
    } else {
      alert("❌ " + data.message);
    }
  })
  .catch(err => alert("❌ Error al eliminar el registro."));
}

function copiarTextoUnico(btn, textoEscapado) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(textoEscapado);

  navigator.clipboard.writeText(texto).then(() => {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#30d158" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    
    setTimeout(() => {
      btn.innerHTML = originalHTML;
    }, 1500);
  });
}

function copiarAccesoMySQL(btn, textoEscapado) {
  if (typeof haptic === "function") haptic();
  const texto = decodeURIComponent(textoEscapado);

  navigator.clipboard.writeText(texto).then(() => {
    let oldText = btn.innerHTML;
    btn.innerHTML = "✅ Copiado";
    btn.style.background = "#30d158";
    btn.style.color = "#000";
    btn.style.borderColor = "transparent";

    setTimeout(() => {
      btn.innerHTML = oldText;
      btn.style.background = "rgba(255, 255, 255, 0.08)";
      btn.style.color = "#ffffff";
      btn.style.borderColor = "rgba(255, 255, 255, 0.15)";
    }, 1500);
  });
}
