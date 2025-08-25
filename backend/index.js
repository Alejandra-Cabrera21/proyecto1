import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Habilitar CORS SOLO para tu frontend
app.use(
  cors({
    origin: "https://alejandra-cabrera21.github.io",
  })
);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Ruta raíz de prueba
app.get("/", (req, res) => {
  res.send("✅ Backend corriendo en Render con OpenAI y CORS habilitado");
});

// Ruta para analizar sentimientos
app.post("/analizar", async (req, res) => {
  try {
    const { usuario, mensaje } = req.body;

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
              "Eres un analizador de emociones en ESPAÑOL. Responde SOLO con una palabra exacta de esta lista: positivo, negativo, neutral, tristeza, alegría, enojo, miedo.",
          },
          { role: "user", content: mensaje },
        ],
        max_tokens: 3,
        temperature: 0,
      }),
    });

    const data = await response.json();
    console.log("🔎 OpenAI respondió:", data.choices?.[0]?.message?.content);

    // Normalizar respuesta
    let sentimiento = (data.choices?.[0]?.message?.content || "")
      .toLowerCase()
      .trim();

    const etiquetasValidas = [
      "positivo",
      "negativo",
      "neutral",
      "tristeza",
      "alegría",
      "enojo",
      "miedo",
    ];

    let encontrada = etiquetasValidas.find((etiqueta) =>
      sentimiento.includes(etiqueta)
    );

    if (!encontrada) encontrada = "no_detectado";

    // Retroalimentación
    const feedbacks = {
      positivo: "🌟 ¡Excelente! Sigue disfrutando de esta buena energía.",
      alegría: "😃 ¡Qué bonito que estés alegre! Disfruta ese momento.",
      negativo: "💭 Parece que estás pasando un mal momento. Todo mejora.",
      tristeza: "💙 Está bien sentirse triste, tómate un respiro y cuida de ti.",
      enojo: "😤 Respira hondo, el enojo pasará. Tú tienes el control.",
      miedo: "🌈 No estás sola, el miedo es normal. Confía en ti.",
      neutral: "😌 Todo tranquilo, aprovecha este momento de calma.",
      no_detectado:
        "🤔 No logré identificar claramente tu emoción, pero recuerda: cada sentimiento es válido.",
    };

    res.json({
      usuario,
      mensaje,
      sentimiento: encontrada,
      feedback: feedbacks[encontrada],
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
