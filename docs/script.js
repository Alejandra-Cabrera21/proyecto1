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
      credentials: "omit"
    });

    if (!response.ok) {
      console.log("⚠️ Servidor despertando... reintentando en 5s");
      await new Promise((r) => setTimeout(r, 5000));
      response = await fetch("https://proyectoo1.onrender.com/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: "alejandra", mensaje }),
        credentials: "omit"
      });
    }

    const data = await response.json();

    document.getElementById("resultado").innerHTML = `
      <p><b>Mensaje:</b> ${mensaje}</p>
      <p><b>Sentimiento:</b> ${data.sentimiento || "No detectado"}</p>
      <p><b>Retroalimentación:</b> ${data.feedback}</p>
    `;

    // 📌 Actualizar métricas cada vez que se analiza un mensaje
    cargarMetricas();

  } catch (error) {
    console.error("❌ Error en frontend:", error);
    alert("No se pudo conectar con el servidor. Intenta de nuevo en unos segundos.");
  }
}

// 📊 Función para cargar métricas y dibujar gráfico
async function cargarMetricas() {
  try {
    const resp = await fetch("https://proyectoo1.onrender.com/metricas");
    const data = await resp.json();

    // 📌 Colores fijos por sentimiento
    const colores = {
      positivo: "#4CAF50",   // verde
      negativo: "#F44336",   // rojo
      neutral: "#FFC107",    // amarillo
      alegría: "#2196F3",    // azul
      tristeza: "#9C27B0",   // morado
      enojo: "#FF5722",      // naranja fuerte
      miedo: "#00BCD4",      // celeste
      amor: "#E91E63"        // rosa
    };

    // Datos desde el backend
    const etiquetas = Object.keys(data.metricas);
    const valores = Object.values(data.metricas);

    // Colores según la etiqueta
    const coloresUsados = etiquetas.map(e => colores[e] || "#999");

    // Renderizar gráfico
    const ctx = document.getElementById("grafica").getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: etiquetas,
        datasets: [{
          data: valores,
          backgroundColor: coloresUsados
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // 📌 Permite controlar tamaño
        plugins: {
          legend: { position: "bottom" },
          title: { display: true, text: "Distribución de emociones" }
        }
      }
    });

  } catch (err) {
    console.error("❌ Error cargando métricas:", err);
  }
}