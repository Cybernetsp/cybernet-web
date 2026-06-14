// =========================================================================
// 🧮 CEREBRO DEL COTIZADOR AUTOMÁTICO DE COMBOS (PARCHADO PARA PARAMOUNT+)
// =========================================================================
window.calcularPreciosSistemaCotizador = function () {
  let tieneNetflix = false;
  let tieneDisneyPremium = false;
  let cantidadEstandar = 0;
  let sumatoriaHerramientas = 0;
  let tieneAmazon = false;
  let tieneParamount = false; // 🌟 Nueva bandera de control

  // 1. Escaneo profundo de plataformas seleccionadas
  document.querySelectorAll(".chk-cotizar-plat").forEach((cb) => {
    if (cb.checked) {
      const tipo = cb.getAttribute("data-tipo");
      if (tipo === "netflix") tieneNetflix = true;
      else if (tipo === "disneypre") tieneDisneyPremium = true;
      else if (tipo === "estandar" || tipo === "disneyest") {
        cantidadEstandar++;
        if (cb.value === "Amazon Prime") tieneAmazon = true;
        if (cb.value === "Paramount+") tieneParamount = true; // 🌟 Detectamos si marcaron Paramount
      } else if (tipo === "herramienta") {
        sumatoriaHerramientas +=
          parseFloat(cb.getAttribute("data-precio")) || 0;
      }
    }
  });

  // 🎯 MOTOR DE CONTROL DINÁMICO PARA PARAMOUNT+ 🎯
  let abonoParamountCombo = 0;
  let esParamountIndividualSolo = false;

  if (tieneParamount) {
    // Calculamos el universo total de pantallas de streaming marcadas (sin contar herramientas)
    let totalPlatasStreaming = (tieneNetflix ? 1 : 0) + (tieneDisneyPremium ? 1 : 0) + cantidadEstandar;
    
    if (totalPlatasStreaming === 1) {
      // Caso A: Paramount está completamente solo en la cotización
      esParamountIndividualSolo = true;
    } else {
      // Caso B: Está acompañando un combo. Lo extraemos del pool plano estándar
      // para que sume $10.000 limpios y no interfiera con los descuentos de las otras
      cantidadEstandar--;
      abonoParamountCombo = 10000;
    }
  }

  let precioBaseUnMes = 0;

  // Interceptamos si está solo, de lo contrario ejecuta tu árbol de decisiones original intacto
  if (esParamountIndividualSolo) {
    precioBaseUnMes = 15000; // 🔥 Standalone forzado a 15k
  } else {
    // 2. REGLAS AUTOMATIZADAS CYBERNET CORREGIDAS
    if (tieneNetflix) {
      if (tieneDisneyPremium) {
        // 💎 COMBOS PREMIUM CON NETFLIX
        if (cantidadEstandar === 0) precioBaseUnMes = 25000; // Combo 4
        else if (cantidadEstandar === 1) precioBaseUnMes = 29000; // Combo 5
        else if (cantidadEstandar === 2) precioBaseUnMes = 32000; // Combo 6
        else if (cantidadEstandar >= 3) precioBaseUnMes = 35000 + (cantidadEstandar - 3) * 3000; // Combo 7 + Adicionales
      } else {
        // 🍿 COMBOS CLÁSICOS CON NETFLIX
        if (cantidadEstandar === 0) precioBaseUnMes = 14500; // Combo 0
        else if (cantidadEstandar === 1) precioBaseUnMes = 20000; // Combo 1
        else if (cantidadEstandar === 2) precioBaseUnMes = 24000; // Combo 2
        else if (cantidadEstandar >= 3) precioBaseUnMes = 27000 + (cantidadEstandar - 3) * 3000; // Combo 3 + Adicionales
      }
    } else {
      // 🚫 COMBOS STREAMING SIN NETFLIX
      if (tieneDisneyPremium) {
        // 💎 COMBOS PREMIUM (Con Disney Premium - Sin Netflix)
        if (cantidadEstandar === 0) precioBaseUnMes = 15000;
        else if (cantidadEstandar === 1) precioBaseUnMes = 20000; // Combo 4
        else if (cantidadEstandar === 2) precioBaseUnMes = 22000; // Combo 5
        else if (cantidadEstandar === 3) precioBaseUnMes = 24000; // Combo 6
        else if (cantidadEstandar >= 4) precioBaseUnMes = 24000 + (cantidadEstandar - 3) * 3000; // Mega VIP + Adicionales
      } else {
        // 🍿 COMBOS ECONÓMICOS (Sin Netflix - Sin Disney Premium)
        if (cantidadEstandar === 0) {
          precioBaseUnMes = 0;
        } else if (cantidadEstandar === 1) {
          precioBaseUnMes = tieneAmazon ? 10500 : 8500;
        } else if (cantidadEstandar === 2) {
          precioBaseUnMes = 13000; // Combo 1
        } else if (cantidadEstandar === 3) {
          precioBaseUnMes = 16000; // Combo 2
        } else if (cantidadEstandar === 4) {
          precioBaseUnMes = 18000; // Combo 3
        } else if (cantidadEstandar >= 5) {
          precioBaseUnMes = 18000 + (cantidadEstandar - 4) * 3000; // Paquete Familiar + Adicionales
        }
      }
    }
  }

  // 3. Sumar el abono de Paramount (si aplica) y las herramientas independientes fijas
  precioBaseUnMes += abonoParamountCombo;
  precioBaseUnMes += sumatoriaHerramientas;

  // 4. Captura de meses y cálculo de descuentos quincenales/mensuales
  const monthSelect = document.getElementById("calcMonths");
  const meses = parseFloat(monthSelect.value) || 1;
  const porcDesc =
    parseFloat(
      monthSelect.options[monthSelect.selectedIndex].getAttribute("data-desc"),
    ) || 0;

  // Operaciones contables base
  const subtotal = precioBaseUnMes * meses;
  const montoDescuento = subtotal * (porcDesc / 100);

  // 5. CALCULAR DESCUENTO POR CLIENTE FIEL EN CASCADA
  const esClienteFiel = document.getElementById("calcFidelidad").checked;
  let descuentoFielTotal =
    esClienteFiel && precioBaseUnMes > 0 ? 1000 * meses : 0;

  // Control visual de la fila de fidelidad
  if (descuentoFielTotal > 0) {
    document.getElementById("rowCalcDescFiel").style.display = "flex";
    document.getElementById("calcDiscountFiel").innerText =
      "-$" + descuentoFielTotal.toLocaleString("es-CO");
  } else {
    document.getElementById("rowCalcDescFiel").style.display = "none";
  }

  let totalA_Cobrar = subtotal - montoDescuento - descuentoFielTotal;
  if (totalA_Cobrar < 0) totalA_Cobrar = 0; // Blindaje contra valores negativos

  // 6. Imprimir en los visores contables
  document.getElementById("calcBasePriceDisplay").value =
    "$" + precioBaseUnMes.toLocaleString("es-CO");
  document.getElementById("calcSubtotal").innerText =
    "$" + subtotal.toLocaleString("es-CO");
  document.getElementById("calcDiscount").innerText =
    "-$" + montoDescuento.toLocaleString("es-CO");
  document.getElementById("calcTotal").innerText =
    "$" + totalA_Cobrar.toLocaleString("es-CO");
};
