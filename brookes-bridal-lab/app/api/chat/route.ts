import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Safeguard
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Build a minimal prompt from messages
    const content = messages
      .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n")
      .slice(-8000);

    // ---- Replace this with your real model call if you have OpenAI API access. ----
    // For demo, we'll return a cute stylist reply using a simple heuristic.
    // To use OpenAI, uncomment and wire your API key in Vercel env: OPENAI_API_KEY

    /* Example OpenAI (responses API or chat.completions)
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      return NextResponse.json({ error: t }, { status: 500 });
    }
    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content ?? "I'm here!";
    */

    const reply =
      "love it! 🌿 I’ll keep to the olive palette and your budget/size. Want me to search dresses now or do a try-on mockup?";

    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
