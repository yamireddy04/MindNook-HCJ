import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

serve(async (req) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (req.method === 'OPTIONS') return new Response('ok', { headers });

  try {
    const { text } = await req.json();
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: `Analyze this journal entry: "${text}". Return ONLY valid JSON with exactly these keys:
{
  "sentiment": "Positive or Negative or Neutral",
  "moodLifter": "an uplifting one-sentence message and a story for the writer",
  "wordCount": <number>,
  "sentenceCount": <number>,
  "mistakeCount": <number of grammar or spelling mistakes>,
  "vocabularySuggestions": ["suggestion1", "suggestion2", "suggestion3"]
}
No explanation, no markdown, no extra text.` }],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return new Response(data.choices[0].message.content, { 
      headers: { ...headers, "Content-Type": "application/json" } 
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
});
