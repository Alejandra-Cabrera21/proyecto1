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

// 📂 Archivo donde guardaremos el historial
const HISTORIAL_FILE = "historial.json";

// Función para leer historial existente
function leerHistorial() {
  if (!fs.existsSync(HISTORIAL_FILE)) return [];
  return JSON.parse(fs.readFileSync(HISTORIAL_FILE, "utf-8"));
}

// Función para guardar historial
function guardarHistorial(nuevoRegistro) {
  let historial = leerHistorial();
  historial.push(nuevoRegistro);
  fs.writeFileSync(HISTORIAL_FILE, JSON.stringify(historial, null, 2));
}

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("✅ Backend corriendo con OpenAI y dataset unificado");
});

// Ruta de análisis
app.post("/analizar", async (req, res) => {
  try {
    const { usuario, mensaje } = req.body;

    // 1️⃣ Construir ejemplos
    let ejemplosTexto = ejemplos
      .map(e => `Texto: "${e.texto}" → {"sentimiento":"${e.sentimiento}"}`)
      .join("\n");

    // 2️⃣ Llamada a OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `Eres un analizador de emociones en ESPAÑOL. 
                      Clasifica el sentimiento principal que transmite un mensaje en una sola categoría emocional. 
                      Responde ÚNICAMENTE en formato JSON válido con la estructura {"sentimiento":"etiqueta"}.

                      Las etiquetas válidas son: positivo, negativo, neutral, tristeza, alegría, enojo, miedo, amor, sorpresa, calma.
                      Si no puedes identificar claramente la emoción, responde {"sentimiento":"no_detectado"}.

                      No escribas explicaciones, solo devuelve JSON.

                      Ejemplos:
                      "Estoy feliz porque aprobé un examen" -> {"sentimiento":"alegría"}
                      "Siento un vacío profundo en mi corazón" -> {"sentimiento":"tristeza"}
                      "Estoy muy enojada por la injusticia" -> {"sentimiento":"enojo"}
                      "Me da miedo hablar en público" -> {"sentimiento":"miedo"}
                      "No tengo ni alegría ni tristeza, solo estoy aquí" -> {"sentimiento":"neutral"}
                      "Nada me sale bien, todo está perdido" -> {"sentimiento":"negativo"}
                      "Siento un profundo cariño por mi familia" -> {"sentimiento":"amor"}
                      "Me quedé en shock por lo que ocurrió" -> {"sentimiento":"sorpresa"}
                      "Hoy me siento tranquilo y en paz" -> {"sentimiento":"calma"}
                      "Hoy me siento muy motivado y lleno de energía" -> {"sentimiento":"positivo"}`
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
        max_completion_tokens: 100 ,
        temperature: 1,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    console.log("🔎 Respuesta cruda OpenAI:", data);

    // 3️⃣ Parsear JSON seguro
    let sentimiento = "no_detectado";
    try {
      const raw = data.choices?.[0]?.message?.content?.[0]?.text || "";
      console.log("📝 Texto recibido:", raw);

      const parsed = JSON.parse(raw);   // intenta parsear JSON
      if (parsed.sentimiento) {
        sentimiento = parsed.sentimiento.toLowerCase().trim();
      }
    } catch (err) {
      console.warn("⚠️ No vino JSON, buscando en texto...");
      const raw = (data.choices?.[0]?.message?.content?.[0]?.text || "").toLowerCase();
      const etiquetas = ["positivo","negativo","neutral","tristeza","alegría","enojo","miedo","amor","sorpresa","calma"];
      const encontrada = etiquetas.find(e => raw.includes(e));
      sentimiento = encontrada || "no_detectado";
    }


    // 4️⃣ Fallback con dataset.palabras
    if (sentimiento === "no_detectado") {
      for (const entrada of palabras) {
        if (entrada.palabras.some(p => mensaje.toLowerCase().includes(p))) {
          sentimiento = entrada.sentimiento;
          break;
        }
      }
    }

    // 5️⃣ Feedback
    const feedbacks = {
        positivo: "🌟 ¡Excelente! Sigue disfrutando de esta buena energía.",
        alegría: "😃 ¡Qué bonito que estés alegre! Disfruta ese momento.",
        tristeza: "💙 Recuerda que está bien sentirse triste. Tómate un descanso y cuida de ti.",
        enojo: "😤 Respira hondo, el enojo pasará. Tú tienes el control.",
        miedo: "🌈 El miedo es una emoción válida, recuerda que puedes afrontarlo con calma. Respira profundo, concéntrate en el presente y date permiso de avanzar poco a poco.",
        neutral: "😌 Todo tranquilo, aprovecha este momento de calma.",
        negativo: "💭 Sé que no es fácil, pero cada día es una nueva oportunidad.",
        amor: "❤️ Qué hermoso que sientas amor. Cuida ese sentimiento y compártelo con quienes lo hacen especial.",
        sorpresa: "😲 ¡Qué sorpresa! A veces lo inesperado trae nuevas oportunidades.",
        calma: "🌿 Qué lindo que te sientas en calma. Disfruta de esta tranquilidad.",
        no_detectado: "🤔 No logré identificar claramente tu emoción, pero recuerda: cada sentimiento es válido."
    };

    // 📌 Construir resultado
    const resultado = {
      usuario,
      mensaje,
      sentimiento,
      feedback: feedbacks[sentimiento] || feedbacks.no_detectado,
      fecha: new Date().toISOString()
    };

    // Guardar en historial.json
    guardarHistorial(resultado);

    // Responder al frontend
    res.json(resultado);

  } catch (error) {
    console.error("❌ Error en /analizar:", error);
    res.status(500).json({ error: "Error al analizar el mensaje" });
  }
});

// 📌 Nueva ruta: obtener historial completo
app.get("/historial", (req, res) => {
  const historial = leerHistorial();
  res.json(historial);
});

// 📌 Nueva ruta: métricas por emoción
app.get("/metricas", (req, res) => {
  const historial = leerHistorial();
  const metricas = {};

  historial.forEach(item => {
    metricas[item.sentimiento] = (metricas[item.sentimiento] || 0) + 1;
  });

  res.json({
    total_mensajes: historial.length,
    metricas
  });
});

// 📌 Nueva ruta: resumen de conversaciones
app.get("/resumen", (req, res) => {
  const historial = leerHistorial();
  if (historial.length === 0) {
    return res.json({ resumen: "No hay conversaciones aún." });
  }

  // Contar emociones
  const conteo = {};
  historial.forEach(item => {
    conteo[item.sentimiento] = (conteo[item.sentimiento] || 0) + 1;
  });

  // Encontrar la emoción más frecuente
  let emocionMasFrecuente = null;
  let max = 0;
  for (const [emocion, cantidad] of Object.entries(conteo)) {
    if (cantidad > max) {
      emocionMasFrecuente = emocion;
      max = cantidad;
    }
  }

  // Construir resumen
  const resumen = `Hoy la mayoría de tus mensajes reflejaron ${emocionMasFrecuente}.`;

  res.json({ resumen, conteo });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});