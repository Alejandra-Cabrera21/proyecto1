import fs from "fs";
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

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

    // Construimos los ejemplos como texto
    let ejemplosTexto = ejemplos
      .map(e => `Texto: "${e.texto}" → Sentimiento: ${e.sentimiento}`)
      .join("\n");

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
            content: "Eres un analizador de emociones en ESPAÑOL. Devuelve SOLO una de estas etiquetas: positivo, negativo, neutral, tristeza, alegría, enojo, miedo."
          },
          {
            role: "user",
            content: "Ejemplos de entrenamiento:\n" + ejemplosTexto
          },
          {
            role: "user",
            content: mensaje
          }
        ],
        max_tokens: 10,
        temperature: 0,
      }),
    });

    const data = await response.json();
    let sentimiento = data.choices?.[0]?.message?.content?.trim().toLowerCase();

    res.json({ usuario, mensaje, sentimiento });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error al analizar el mensaje" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
