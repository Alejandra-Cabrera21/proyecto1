const ctx = document.getElementById("grafica");
new Chart(ctx, {
  type: "pie",
  data: {
    labels: ["Positivo", "Negativo", "Neutral"],
    datasets: [{
      data: [10, 5, 3],
      backgroundColor: ["#4CAF50", "#F44336", "#FFC107"]
    }]
  }
});
