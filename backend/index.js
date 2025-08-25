import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import sql from "mssql";

dotenv.config();

const app = express();
app.use(express.json());

// Configuración de conexión a SQL Server
const dbConfig = {
  user: "sa",                // o el usuario que configures (si usas autenticación SQL)
  password: "tu_password",   // si usas autenticación de SQL
  server: "ALECABRERA\\SQLEXPRESS", // el que te aparece en SSMS
  database: "proyecto1",
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Ruta para analizar sentimientos y guardar en SQL Server
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

    // Guardar en SQL Server
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("Usuario", sql.NVarChar, usuario || "anonimo")
      .input("Mensaje", sql.NVarChar, mensaje)
      .input("Sentimiento", sql.NVarChar, sentimiento)
      .query("INSERT INTO AnalisisEmociones (Usuario, Mensaje, Sentimiento) VALUES (@Usuario, @Mensaje, @Sentimiento)");

    res.json({ mensaje, sentimiento });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error al analizar o guardar el mensaje" });
  }
});

// Levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));
