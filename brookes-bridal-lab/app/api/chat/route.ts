// brookes-bridal-lab/app/api/chat/route.ts
import { NextResponse } from "next/server";
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid payload", source: "bad_payload" }, { status: 400 });
    }

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json({
        reply:
          "love it! 🌿 I’ll keep to the olive palette and your budget/size. Want me to search dresses now or do a try-on mockup?",
        source: "openai",
        hadKey: true,
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
        messages, // client already provides system + history
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      return NextResponse.json({ error: t, source: "openai_error", hadKey: true }, { status: 500 });
    }

    const data = await resp.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "I’m here! Tell me your size, budget, and style and I’ll help 💐";

    return NextResponse.json({ reply, source: "openai", hadKey: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error", source: "exception" }, { status: 500 });
  }
}
