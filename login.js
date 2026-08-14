document.getElementById("formLogin").addEventListener("submit", function (e) {
  e.preventDefault();

  const correo = document.getElementById("correo").value.trim();
  const clave = document.getElementById("clave").value.trim();
  const mensajeError = document.getElementById("mensajeError");
  const btnIngresar = document.getElementById("btnIngresar");

  mensajeError.style.display = "none";
  mensajeError.innerText = "";

  if (!correo || !clave) {
    mensajeError.innerText = "Ingresa tu correo y contraseña.";
    mensajeError.style.display = "block";
    return;
  }

  btnIngresar.disabled = true;
  btnIngresar.innerText = "Verificando...";

  const formData = new FormData();
  formData.append("correo", correo);
  formData.append("clave", clave);

  fetch("autenticar.php", {
  method: "POST",
  body: formData,
})
    .then((res) => res.json())
    .then((data) => {
      btnIngresar.disabled = false;
      btnIngresar.innerText = "Iniciar Sesión";

      if (data.status === "success") {
        // 1. Guardar los datos del usuario en la sesión del navegador
        sessionStorage.setItem("usuario_activo", JSON.stringify(data.usuario));

        // Para mantener compatibilidad con tu logica.js vieja, guardamos también el nombre
        sessionStorage.setItem("active_staff", data.usuario.nombre.toUpperCase());

        // 2. Redirección ÚNICA para todos los usuarios
        window.location.href = "dashboard.html";
        
      } else {
        mensajeError.innerText = data.message;
        mensajeError.style.display = "block";
      }
    })
    .catch((err) => {
      btnIngresar.disabled = false;
      btnIngresar.innerText = "Iniciar Sesión";
      mensajeError.innerText = "Error de conexión con el servidor local.";
      mensajeError.style.display = "block";
      console.error(err);
    });
});
