import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // 🔥 Habilita CORS para todas las peticiones

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Ruta raíz de prueba
app.get("/", (req, res) => {
  res.send("✅ Backend de análisis emocional está corriendo en Render con CORS habilitado");
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
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Eres un analizador de emociones. Responde solo con una de estas etiquetas: 'positivo', 'negativo', 'neutral', 'tristeza', 'alegría', 'enojo', 'miedo'."
          },
          { role: "user", content: mensaje }
        ],
        max_tokens: 20
      })
    });

    const data = await response.json();
    const sentimiento = data.choices?.[0]?.message?.content?.trim();

    res.json({ usuario, mensaje, sentimiento });
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
