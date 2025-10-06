// brookes-bridal-lab/app/api/chat/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const key = process.env.OPENAI_API_KEY;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
    if (!key) {
      // graceful fallback if no key set
      return NextResponse.json({
        reply:
          "love it! 🌿 I’ll keep to the olive palette and your budget/size. Want me to search dresses now or do a try-on mockup?",
      });
    }

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages, // we already send system+history from the client
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      return NextResponse.json({ error: t }, { status: 500 });
    }

    const data = await resp.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "I’m here! Tell me your size, budget, and style and I’ll help 💐";

    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
