// server/src/controllers/aiController.js
export const enhanceTechnicalNote = async (req, res) => {
  try {
    const { note, ticket_subject } = req.body;

    if (!note || note.trim() === '') {
      return res.status(400).json({ error: 'La nota no puede estar vacía' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ Error: Falta GEMINI_API_KEY en server/.env');
      return res.status(500).json({ error: 'Clave de API no configurada en el servidor' });
    }

    const promptText = `
Eres un especialista en soporte técnico TI para la empresa SAMAND TECH.
Tu tarea es reescribir el borrador del técnico de manera formal, clara, profesional y sin faltas de ortografía.

- Asunto: "${ticket_subject || 'Soporte Técnico'}"
- Borrador: "${note}"

Reglas:
1. Mantén un tono técnico, formal y ejecutivo.
2. No agregues introducciones, saludos ni explicaciones. Responde ÚNICAMENTE con la redacción final pulida en español.
`;

    console.log('📡 Enviando borrador a Gemini IA (gemini-3.8-flash)...');

    // 🔴 CAMBIO AQUÍ: Usamos gemini-3.8-flash en el endpoint REST
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error recibido de Gemini API:', data);
      return res.status(500).json({ 
        error: 'Error de comunicación con la IA', 
        details: data.error?.message || 'Error desconocido' 
      });
    }

    const enhancedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || note;

    console.log('✨ Nota pulida con éxito:', enhancedText);
    return res.json({ enhancedText });

  } catch (error) {
    console.error('❌ Error interno en aiController:', error.message || error);
    return res.status(500).json({ error: 'Error procesando la solicitud de IA' });
  }
};