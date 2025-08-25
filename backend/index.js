import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Ruta raíz de prueba
app.get("/", (req, res) => {
  res.send("✅ Backend de análisis emocional está corriendo en Render");
});

// Ruta para analizar sentimientos
app.post("/analizar", async (req, res) => {
  try {
    const { usuario, mensaje } = req.body;

    // Llamar a OpenAI
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
            content: "Eres un analizador de emociones. Responde con una de estas etiquetas: 'positivo', 'negativo', 'neutral', 'tristeza', 'alegría', 'enojo', 'miedo'."
          },
          { role: "user", content: mensaje }
        ],
        max_tokens: 20
      })
    });

    const data = await response.json();
    const sentimiento = data.choices?.[0]?.message?.content?.trim();

    // (Por ahora no guardar en SQL porque Render no tiene acceso a tu SQL local)
    res.json({ usuario, mensaje, sentimiento });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error al analizar el mensaje" });
  }
});

// Levantar servidor con puerto dinámico
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
