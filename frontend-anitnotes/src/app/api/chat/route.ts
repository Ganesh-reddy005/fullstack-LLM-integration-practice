import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // your Groq key
  baseURL: "https://api.groq.com/openai/v1", // force Groq endpoint
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const systemMessage = {
      role: "system",
      content:
        `You are a helpful *AI assistant MADE by Ganesh Reddy*. You are a Education AI agent with high reasoning skills.
        You answer in POINT WISE format only when needed.
        When user greets you, give little into about yourself(make sure you add Ganesh reddy name) and ask how can you help them.`,
    };

    const response = await openai.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [systemMessage, { role: "user", content: message }],
    });

    const aiResponse = response.choices[0].message.content;

    return NextResponse.json({ text: aiResponse });
  } catch (error: any) {
    console.error("Groq API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
