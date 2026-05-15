const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const callAI = async (prompt: string): Promise<string> => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro Groq: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
};

export const generateMessage = async (description: string): Promise<string> => {
  const result = await callAI(`Crie uma mensagem curta, profissional e amigável para disparo em massa com este contexto: "${description}". Responda APENAS com o texto da mensagem, sem aspas, sem explicações, sem prefixos.`)
  return result.replace(/^["']|["']$/g, '').trim()
}


export const improveMessage = async (content: string): Promise<string> => {
  const result = await callAI(`Melhore esta mensagem mantendo o sentido e tamanho aproximado: "${content}". Responda APENAS com o texto melhorado, sem aspas, sem explicações, sem prefixos.`)
  return result.replace(/^["']|["']$/g, '').trim()
}