async function analizar() {
  const mensaje = document.getElementById("inputMensaje").value;

  if (!mensaje) {
    alert("Por favor escribe un mensaje");
    return;
  }

  try {
    let response = await fetch("https://proyectoo1.onrender.com/analizar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: "alejandra", mensaje }),
    });

    // Si Render está "despertando"
    if (!response.ok) {
      console.warn("⚠️ Servidor despertando... reintentando en 5s");
      await new Promise((r) => setTimeout(r, 5000));
      response = await fetch("https://proyectoo1.onrender.com/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: "alejandra", mensaje }),
      });
    }

    const data = await response.json();

    // 🔎 Depuración
    console.log("📩 Respuesta completa del backend:", data);
    console.log("👉 Sentimiento detectado:", data.sentimiento);
    console.log("👉 Feedback generado:", data.feedback);

    document.getElementById("resultado").innerHTML = `
      <p><b>Mensaje:</b> ${mensaje}</p>
      <p><b>Sentimiento:</b> ${data.sentimiento || "No detectado"}</p>
      <p><b>Retroalimentación:</b> ${data.feedback}</p>
    `;

  } catch (error) {
    console.error("❌ Error en frontend:", error);
    alert("No se pudo conectar con el servidor. Intenta de nuevo en unos segundos.");
  }
}
