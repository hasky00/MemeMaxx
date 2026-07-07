export async function POST(req) {
  const { prompt } = await req.json()
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `You are a funny meme caption writer. Generate exactly 5 meme caption options for: "${prompt}". 
Each needs TOP text and BOTTOM text. Keep them punchy and funny.
Respond ONLY with valid JSON array, no markdown:
[{"top":"...","bottom":"...","vibe":"savage|wholesome|relatable|cursed|based"},...]`
      }]
    })
  })
  const data = await res.json()
  const text = data.content?.find(b => b.type === "text")?.text || "[]"
  try {
    const suggestions = JSON.parse(text.replace(/```json|```/g, "").trim())
    return Response.json({ suggestions })
  } catch {
    return Response.json({ suggestions: [] })
  }
}