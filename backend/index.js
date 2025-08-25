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

// Normalizador (quita acentos y pasa a minúsculas)
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Diccionario de emociones válidas
const etiquetasValidas = [
  "positivo",
  "negativo",
  "neutral",
  "tristeza",
  "alegria",
  "enojo",
  "miedo",
];

// Retroalimentación motivacional
const feedbacks = {
  positivo: "🌟 ¡Excelente! Sigue disfrutando de esta buena energía.",
  alegria: "😃 ¡Qué bonito que estés alegre! Disfruta ese momento.",
  tristeza: "💙 Está bien sentirse triste, tómate un respiro y cuida de ti.",
  enojo: "😤 Respira hondo, el enojo pasará. Tú tienes el control.",
  miedo: "🌈 No estás sola, el miedo es normal. Confía en ti.",
  neutral: "😌 Todo tranquilo, aprovecha este momento de calma.",
  negativo: "💭 Sé que no es fácil, pero cada día es una nueva oportunidad.",
  no_detectado:
    "🤔 No logré identificar claramente tu emoción, pero cada sentimiento es válido.",
};

// Ruta raíz
app.get("/", (req, res) => {
  res.send("✅ Backend con OpenAI listo para análisis de emociones");
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
              "Eres un analizador de emociones en ESPAÑOL. Clasifica el mensaje en **UNA sola palabra exacta** de esta lista: 'positivo', 'negativo', 'neutral', 'tristeza', 'alegria', 'enojo', 'miedo'. Devuelve solo la palabra, nada más.",
          },
          { role: "user", content: mensaje },
        ],
        max_tokens: 5,
        temperature: 0,
      }),
    });

    const data = await response.json();

    // Normalizar respuesta
    let sentimiento = data.choices?.[0]?.message?.content || "";
    sentimiento = normalizar(sentimiento);

    // Detectar coincidencia exacta
    let encontrada = etiquetasValidas.find((etiqueta) =>
      sentimiento.includes(etiqueta)
    );

    if (!encontrada) encontrada = "no_detectado";

    res.json({
      usuario,
      mensaje,
      sentimiento: encontrada,
      feedback: feedbacks[encontrada],
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error al analizar el mensaje con OpenAI" });
  }
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
