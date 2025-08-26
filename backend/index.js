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

    // Llamada a OpenAI con instrucción clara en JSON
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
              "Eres un analizador de emociones en ESPAÑOL. Devuelve SIEMPRE un JSON con este formato: {\"sentimiento\":\"positivo\"}. Valores permitidos: positivo, negativo, neutral, tristeza, alegría, enojo, miedo."
          },
          { role: "user", content: mensaje },
        ],
        max_tokens: 30,
        temperature: 0,
      }),
    });

    const data = await response.json();
    console.log("🔎 Respuesta OpenAI:", data);

    let sentimiento = "no_detectado";

    try {
      // Parsear contenido como JSON
      const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
      if (parsed.sentimiento) {
        sentimiento = parsed.sentimiento.toLowerCase().trim();
      }
    } catch (e) {
      console.error("⚠️ Error al parsear JSON de OpenAI:", e);
    }

    // Retroalimentación
    const feedbacks = {
      positivo: "🌟 ¡Excelente! Sigue disfrutando de esta buena energía.",
      alegría: "😃 ¡Qué bonito que estés alegre! Disfruta ese momento.",
      negativo: "💭 Parece que estás pasando un mal momento. No pasa nada, todo mejora.",
      tristeza: "💙 Recuerda que está bien sentirse triste. Tómate un descanso y cuida de ti.",
      enojo: "😤 Respira hondo, el enojo pasará. Tú tienes el control.",
      miedo: "🌈 No estás solo, el miedo es normal. Confía en ti, puedes superarlo.",
      neutral: "😌 Todo tranquilo, aprovecha este momento de calma.",
      no_detectado: "🤔 No logré identificar claramente tu emoción, pero recuerda: cada sentimiento es válido.",
    };

    res.json({
      usuario,
      mensaje,
      sentimiento,
      feedback: feedbacks[sentimiento] || feedbacks["no_detectado"],
    });

  } catch (error) {
    console.error("❌ Error en /analizar:", error);
    res.status(500).json({ error: "Error al analizar el mensaje" });
  }
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});