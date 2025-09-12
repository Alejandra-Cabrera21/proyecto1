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

    // 🔹 Mostrar múltiples emociones y feedbacks en lista
    let feedbackList = "";
    if (Array.isArray(data.sentimientos)) {
      feedbackList = "<ul>";
      data.sentimientos.forEach(s => {
        feedbackList += `<li><b>${s.sentimiento}:</b> ${s.feedback}</li>`;
      });
      feedbackList += "</ul>";
    } else {
      feedbackList = `<p><b>${data.sentimiento || "No detectado"}:</b> ${data.feedback}</p>`;
    }

    document.getElementById("resultado").innerHTML = `
      <p><b>Mensaje:</b> ${mensaje}</p>
      <p><b>Sentimientos detectados:</b></p>
      ${feedbackList}
    `;

    // 📌 Actualizar métricas cada vez que se analiza un mensaje
    cargarMetricas();
    cargarResumen();

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

    // Preparar datos
    const etiquetas = Object.keys(data.metricas);
    const valores = Object.values(data.metricas);

    // Renderizar gráfico
    const ctx = document.getElementById("grafica").getContext("2d");

    // 🔄 Destruir gráfico previo si ya existe
    if (window.miGrafico) {
      window.miGrafico.destroy();
    }

    window.miGrafico = new Chart(ctx, {
      type: "pie",
      data: {
        labels: etiquetas,
        datasets: [{
          data: valores,
          backgroundColor: [
            "#4CAF50",  // Positivo → verde
            "#F44336",  // Negativo → rojo
            "#FFC107",  // Neutral → amarillo
            "#2196F3",  // Alegría → azul
            "#9C27B0",  // Tristeza → morado
            "#FF5722",  // Enojo → naranja fuerte
            "#00BCD4",  // Miedo → celeste
            "#E91E63",  // Amor → rosa
            "#FF9800",  // Sorpresa → naranja claro
            "#8BC34A",  // Calma → verde claro
            "#795548",  // Angustia → café
            "#3F51B5",  // Incertidumbre → azul oscuro
            "#CDDC39"   // no_detectado → lima
          ]
        }]
      },
      options: {
        responsive: true,
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

async function cargarResumen() {
  try {
    const resp = await fetch("https://proyectoo1.onrender.com/resumen");
    const data = await resp.json();

    const resumenDiv = document.getElementById("resumen");
    resumenDiv.innerHTML = `<p><b>Resumen:</b> ${data.resumen}</p>`;
  } catch (err) {
    console.error("❌ Error cargando resumen:", err);
  }
}
