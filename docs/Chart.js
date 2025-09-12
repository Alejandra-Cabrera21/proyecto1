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
        "Amor",
        "Sorpresa",
        "Calma",
        "Angustia",
        "Incertidumbre",
        "no_detectado"
    ],
    datasets: [{
      data: [10, 5, 3, 7, 4, 6, 2, 8], // 🔹 Aquí reemplazas con tus métricas reales
      backgroundColor: [
        "#FF6384", // rosa
        "#36A2EB", // azul
        "#FFCE56", // amarillo
        "#4BC0C0", // turquesa
        "#9966FF", // morado
        "#FF9F40", // naranja
        "#8BC34A", // verde claro
        "#E91E63", // rosado fuerte
        "#3F51B5", // azul oscuro
        "#CDDC39", // lima
        "#00BCD4", // celeste
        "#9C27B0", // violeta
        "#795548"  // café
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