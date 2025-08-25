async function analizar() {
  const mensaje = document.getElementById("inputMensaje").value;

  if (!mensaje) {
    alert("Por favor escribe un mensaje");
    return;
  }

  try {
    // 🔥 corregido: ahora apunta al backend correcto
    const response = await fetch("https://proyecto1.onrender.com/analizar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: "alejandra", mensaje }),
    });

    const data = await response.json();

    document.getElementById("resultado").innerHTML = `
      <p><b>Mensaje:</b> ${mensaje}</p>
      <p><b>Sentimiento:</b> ${data.sentimiento || "No detectado"}</p>
      <p><b>Retroalimentación:</b> ${data.feedback || "Sin retroalimentación"}</p>
    `;
  } catch (error) {
    console.error("Error:", error);
    alert("No se pudo conectar con el servidor");
  }
}
