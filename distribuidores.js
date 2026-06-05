async function rastrearCodigo() {
  haptic();
  let m = document.getElementById("inputCorreoCodigo").value.toLowerCase().trim();
  if (!m.includes("@cybernetsp.com")) {
    // 🔥 Reemplazamos alert() por triggerToast()
    triggerToast("⚠️ Escribe un correo @cybernetsp.com");
    return;
  }
  codeData.correo = m;
  changeCodeStep(4);
  try {
    const query = new URLSearchParams(codeData);
    const res = await (await fetch(`${BOT_API_URL}?${query.toString()}`)).json();
    changeCodeStep(5);
    document.getElementById("codeResultBox").style.display = "none";
    document.getElementById("linkResultBox").style.display = "none";
    if (res.exito) {
      document.getElementById("codeResultTitle").innerHTML = `<span style="color:var(--ios-green);">¡LOCALIZADO!</span>`;
      document.getElementById("codeResultDesc").innerText = res.msj || "Información recuperada:";
      if (res.tipo === "codigo") {
        document.getElementById("codeResultBox").style.display = "block";
        document.getElementById("codeVal").innerText = res.valor;
        document.getElementById("codeTimer").innerText = `Vence en: ${res.tiempo}`;
      } else if (res.tipo === "link") {
        document.getElementById("linkResultBox").style.display = "block";
        document.getElementById("linkVal").href = res.valor;
      }
    } else {
      document.getElementById("codeResultTitle").innerHTML = `<span style="color:var(--ios-orange);">SIN RESULTADOS</span>`;
      document.getElementById("codeResultDesc").innerText = res.msj || "No hay datos recientes.";
    }
  } catch (err) {
    changeCodeStep(5);
    document.getElementById("codeResultTitle").innerText = "Error";
  }
}
