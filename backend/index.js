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

// 📌 Leer dataset unificado
const dataset = JSON.parse(fs.readFileSync("dataset.json", "utf-8"));
const ejemplos = dataset.ejemplos;
const palabras = dataset.palabras;

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("✅ Backend corriendo con OpenAI y dataset unificado");
});

// Ruta de análisis
app.post("/analizar", async (req, res) => {
  try {
    const { usuario, mensaje } = req.body;

    // 1️⃣ Construir ejemplos para el prompt
    let ejemplosTexto = ejemplos
      .map(e => `Texto: "${e.texto}" → {"sentimiento":"${e.sentimiento}"}`)
      .join("\n");

    // 2️⃣ Consultar OpenAI con salida JSON forzada
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },   // 👈 fuerza JSON
        messages: [
          {
            role: "system",
            content: "Eres un analizador de emociones en ESPAÑOL. Responde SOLO en formato JSON {\"sentimiento\":\"etiqueta\"}. Etiquetas válidas: positivo, negativo, neutral, tristeza, alegría, enojo, miedo."
          },
          {
            role: "user",
            content: "Ejemplos de entrenamiento:\n" + ejemplosTexto
          },
          {
            role: "user",
            content: mensaje   // 👈 el mensaje del usuario
          }
        ],
        max_tokens: 20,
        temperature: 0
      }),
    });

    const data = await response.json();

    // 3️⃣ Parsear JSON seguro
    let sentimiento = "no_detectado";
    try {
      const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
      if (parsed.sentimiento) {
        sentimiento = parsed.sentimiento.toLowerCase().trim();
      }
    } catch (err) {
      console.error("❌ Error parseando JSON de OpenAI:", err);
    }

    // 4️⃣ Fallback con palabras clave si OpenAI falla
    if (!sentimiento || sentimiento === "no_detectado") {
      for (const entrada of palabras) {
        if (entrada.palabras.some(p => mensaje.toLowerCase().includes(p))) {
          sentimiento = entrada.sentimiento;
          break;
        }
      }
    }

    // 5️⃣ Feedback motivacional
    const feedbacks = {
      positivo: "🌟 ¡Excelente! Sigue disfrutando de esta buena energía.",
      alegría: "😃 ¡Qué bonito que estés alegre! Disfruta ese momento.",
      tristeza: "💙 Recuerda que está bien sentirse triste. Tómate un descanso y cuida de ti.",
      enojo: "😤 Respira hondo, el enojo pasará. Tú tienes el control.",
      miedo: "🌈 No estás sola, el miedo es normal. Confía en ti.",
      neutral: "😌 Todo tranquilo, aprovecha este momento de calma.",
      negativo: "💭 Sé que no es fácil, pero cada día es una nueva oportunidad.",
      no_detectado: "🤔 No logré identificar claramente tu emoción, pero recuerda: cada sentimiento es válido."
    };

    res.json({
      usuario,
      mensaje,
      sentimiento: sentimiento || "no_detectado",
      feedback: feedbacks[sentimiento] || feedbacks.no_detectado
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