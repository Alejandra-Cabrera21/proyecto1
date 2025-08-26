import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "https://alejandra-cabrera21.github.io", 
  })
);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Diccionario de retroalimentación
const feedbacks = {
  positivo: "🌟 ¡Excelente! Sigue disfrutando de esta buena energía.",
  alegria: "😃 ¡Qué bonito que estés alegre! Disfruta ese momento.",
  negativo: "💭 Parece que estás pasando un mal momento. Todo mejora.",
  tristeza: "💙 Está bien sentirse triste, tómate un respiro y cuida de ti.",
  enojo: "😤 Respira hondo, el enojo pasará. Tú tienes el control.",
  miedo: "🌈 No estás sola, el miedo es normal. Confía en ti.",
  neutral: "😌 Todo tranquilo, aprovecha este momento de calma.",
  no_detectado:
    "🤔 No logré identificar claramente tu emoción, pero recuerda: cada sentimiento es válido.",
};

// Lista de etiquetas válidas
const etiquetasValidas = ["positivo", "negativo", "neutral", "tristeza", "alegria", "enojo", "miedo"];

// Ruta raíz
app.get("/", (req, res) => {
  res.send("✅ Backend corriendo en Render con OpenAI y CORS habilitado");
});

// Ruta principal
app.post("/analizar", async (req, res) => {
  try {
    const { usuario, mensaje } = req.body;

    // Llamada a OpenAI
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
              "Responde ÚNICAMENTE con una palabra en minúsculas de esta lista: positivo, negativo, neutral, tristeza, alegria, enojo, miedo. Nada más, sin frases adicionales.",
          },
          { role: "user", content: mensaje },
        ],
        max_tokens: 5,
        temperature: 0,
      }),
    });

    const data = await response.json();
    console.log("🔎 OpenAI devolvió:", data);

    let sentimiento = (data.choices?.[0]?.message?.content || "")
      .toLowerCase()
      .trim();

    // Si OpenAI devuelve algo como "El sentimiento es positivo."
    // usamos regex para encontrar la palabra
    if (!etiquetasValidas.includes(sentimiento)) {
      const encontrada = etiquetasValidas.find((etq) =>
        sentimiento.includes(etq)
      );
      sentimiento = encontrada || "no_detectado";
    }

    res.json({
      usuario,
      mensaje,
      sentimiento,
      feedback: feedbacks[sentimiento],
    });
  } catch (error) {
    console.error("❌ Error en /analizar:", error);
    res.status(500).json({ error: "Error al analizar el mensaje con OpenAI" });
  }
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});