const ctx = document.getElementById("grafica");

new Chart(ctx, {
  type: "pie",
  data: {
    labels: [
      "Positivo",
      "Negativo",
      "Neutral",
      "Alegría",
      "Tristeza",
      "Enojo",
      "Miedo",
      "Amor"
    ],
    datasets: [{
      data: [10, 5, 3, 7, 4, 6, 2, 8], // 🔹 Aquí reemplazas con tus métricas reales
      backgroundColor: [
        "#4CAF50", // Positivo → verde
        "#F44336", // Negativo → rojo
        "#FFC107", // Neutral → amarillo
        "#2196F3", // Alegría → azul
        "#9C27B0", // Tristeza → morado
        "#FF5722", // Enojo → naranja fuerte
        "#00BCD4", // Miedo → celeste
        "#E91E63"  // Amor → rosa
      ]
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom"
      },
      title: {
        display: true,
        text: "Distribución de emociones"
      }
    }
  }
});