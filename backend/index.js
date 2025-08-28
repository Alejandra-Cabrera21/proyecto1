import fs from "fs";
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

// 📌 Cargar dataset.json
const datasetPath = path.resolve("./backend/dataset.json");
const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf8"));


dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "https://alejandra-cabrera21.github.io", // tu frontend
  })
);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Leer dataset
const ejemplos = JSON.parse(fs.readFileSync("dataset.json", "utf-8"));

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("✅ Backend corriendo con OpenAI y dataset cargado");
});

// Ruta de análisis
app.post("/analizar", async (req, res) => {
  try {
    const { usuario, mensaje } = req.body;

    // --- Llamada a OpenAI ---
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Responde SOLO con una palabra en minúsculas de esta lista: positivo, negativo, neutral, tristeza, alegría, enojo, miedo.",
          },
          { role: "user", content: mensaje },
        ],
        max_tokens: 3,
        temperature: 0,
      }),
    });

    const data = await response.json();
    let sentimiento = data.choices?.[0]?.message?.content?.toLowerCase().trim() || "no_detectado";

    // --- Si OpenAI no detecta, usar dataset.json ---
    if (sentimiento === "no_detectado") {
      for (const entrada of dataset) {
        if (entrada.palabras.some(p => mensaje.toLowerCase().includes(p))) {
          sentimiento = entrada.sentimiento;
          break;
        }
      }
    }

    // --- Feedback motivacional ---
    const feedbacks = {
      positivo: "🌟 ¡Excelente! Sigue disfrutando de esta buena energía.",
      alegría: "😃 ¡Qué bonito que estés alegre! Disfruta ese momento.",
      tristeza: "💙 Recuerda que está bien sentirse triste. Tómate un descanso y cuida de ti.",
      enojo: "😤 Respira hondo, el enojo pasará. Tú tienes el control.",
      miedo: "🌈 No estás solo, el miedo es normal. Confía en ti, puedes superarlo.",
      neutral: "😌 Todo tranquilo, aprovecha este momento de calma.",
      negativo: "💭 Parece que estás pasando un mal momento. No pasa nada, todo mejora.",
      no_detectado: "🤔 No logré identificar claramente tu emoción, pero recuerda: cada sentimiento es válido.",
    };

    res.json({
      usuario,
      mensaje,
      sentimiento,
      feedback: feedbacks[sentimiento] || feedbacks.no_detectado,
    });
  } catch (error) {
    console.error("❌ Error en /analizar:", error);
    res.status(500).json({ error: "Error al analizar el mensaje" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
