import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "https://alejandra-cabrera21.github.io", // 🔥 solo tu frontend
  })
);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Ruta raíz de prueba
app.get("/", (req, res) => {
  res.send("✅ Backend de análisis emocional corriendo en Render con CORS habilitado");
});

// Ruta para analizar sentimientos
app.post("/analizar", async (req, res) => {
  try {
    const { usuario, mensaje } = req.body;

    // Llamada a la API de OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Eres un analizador de emociones en ESPAÑOL. Clasifica el mensaje en UNA sola palabra: 'positivo', 'negativo', 'neutral', 'tristeza', 'alegría', 'enojo', o 'miedo'. Devuelve solo la palabra, sin nada más.",
          },
          { role: "user", content: mensaje },
        ],
        max_tokens: 10,
        temperature: 0,
      }),
    });

    const data = await response.json();

    let sentimiento = data.choices?.[0]?.message?.content || "";
    sentimiento = sentimiento.trim().toLowerCase();

    // Lista de etiquetas válidas
    const etiquetasValidas = ["positivo", "negativo", "neutral", "tristeza", "alegría", "enojo", "miedo"];
    const encontrada = etiquetasValidas.find((etiqueta) =>
      sentimiento.includes(etiqueta)
    );

    // Retroalimentación motivacional
    let feedback = "";
    switch (encontrada) {
      case "positivo":
      case "alegría":
        feedback = "🌟 ¡Excelente! Sigue disfrutando de esta buena energía.";
        break;
      case "negativo":
      case "tristeza":
        feedback = "💙 Recuerda que está bien sentirse triste. Tómate un descanso y cuida de ti.";
        break;
      case "enojo":
        feedback = "😤 Respira hondo, el enojo pasará. Tú tienes el control.";
        break;
      case "miedo":
        feedback = "🌈 No estás solo, el miedo es normal. Confía en ti, puedes superarlo.";
        break;
      case "neutral":
        feedback = "😌 Todo tranquilo, aprovecha este momento de calma.";
        break;
      default:
        feedback = "🤔 No pude detectar claramente tu emoción, pero recuerda: cada sentimiento es válido.";
    }

    res.json({ usuario, mensaje, sentimiento: encontrada || "no_detectado", feedback });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error al analizar el mensaje" });
  }
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});