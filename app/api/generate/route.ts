import { NextRequest, NextResponse } from "next/server";
const FORMATS = ["hooks", "thread-outline", "full-thread", "repurpose"] as const;
const GOALS = ["Engagement", "Followers", "Leads", "Sales", "Thought leadership", "Clicks"] as const;
function parseJson(text: string) { const match = text.match(/\{[\s\S]*\}/); if (!match) throw new Error("The AI returned an unexpected response."); return JSON.parse(match[0]); }
export async function POST(req: NextRequest) {
 try {
  const body = await req.json();
  const niche = String(body.niche || "").trim().slice(0,300), audience = String(body.audience || "").trim().slice(0,300);
  const goal = String(body.goal || "Engagement"), format = String(body.format || "hooks"), tone = String(body.tone || "Clear and insightful");
  const context = String(body.context || "").trim().slice(0,5000), count = Math.min(20,Math.max(5,Number(body.count)||10));
  if (!niche || !audience) return NextResponse.json({error:"Add a topic/niche and target audience."},{status:400});
  if (!FORMATS.includes(format as typeof FORMATS[number])) return NextResponse.json({error:"Choose a supported content format."},{status:400});
  if (!GOALS.includes(goal as typeof GOALS[number])) return NextResponse.json({error:"Choose a supported goal."},{status:400});
  if (format === "repurpose" && !context) return NextResponse.json({error:"Paste the article, LinkedIn post, notes or idea you want to repurpose."},{status:400});
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({error:"The AI API key is not configured. Add ANTHROPIC_API_KEY to your Vercel environment variables."},{status:503});
  const instructions: Record<string,string> = {
   "hooks":`Generate ${count} distinct single-post opening hooks. Return JSON {"items":[{"text":"...","angle":"Pain|Curiosity|Contrarian|Authority|Story|Practical","rationale":"one short sentence explaining the angle"}]}.`,
   "thread-outline":`Generate 5 distinct thread-opening hooks. For each include a useful 5-7 post outline. Return JSON {"items":[{"text":"opening hook","angle":"...","rationale":"why this angle could work","posts":["Post 1...","Post 2...","Post 3...","Post 4...","Post 5..."]}]}.`,
   "full-thread":`Generate 3 complete X threads, each with 5-7 individual posts. Each thread needs a strong first post, logical progression, concrete value and a natural closing question or CTA. Return JSON {"items":[{"text":"thread title/first-line summary","angle":"...","rationale":"...","posts":["Post 1...","Post 2...","Post 3...","Post 4...","Post 5..."]}]}. Do not label posts with numbers inside the text.`,
   "repurpose":`Repurpose the supplied source content into ${Math.min(count,10)} X-ready post ideas, preserving its actual meaning and factual claims. Return JSON {"items":[{"text":"X post copy","angle":"...","rationale":"..."}]}.`
  };
  const prompt = `You are an experienced X content editor helping people write useful, credible posts—not engagement bait.\nTOPIC: ${niche}\nAUDIENCE: ${audience}\nOBJECTIVE: ${goal}\nVOICE: ${tone}\nSOURCE / CONTEXT:\n${context||"(none supplied)"}\nQUALITY RULES:\n- Write for X: strong first line, clear point of view, specificity and readable line breaks.\n- Use natural language. Avoid generic AI phrasing, empty hype, fake urgency, excessive emojis and hashtags.\n- Do not fabricate statistics, quotes, research, personal experiences, case studies or outcomes.\n- If source material is provided, preserve its meaning and do not add unsupported facts.\n- Contrarian angles must be reasoned, not outrage for its own sake.\n- Make outputs meaningfully different; do not merely swap synonyms.\n- Tailor to the objective without promising virality or guaranteed engagement.\n- Return valid JSON only, no markdown fences.\n${instructions[format]}`;
  const response = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:format==="full-thread"?5000:3500,temperature:0.7,messages:[{role:"user",content:prompt}]})});
  if (!response.ok) { console.error("Anthropic API error:",response.status,(await response.text()).slice(0,500)); return NextResponse.json({error:"AI generation failed. Check your API key, account credits and model access."},{status:502}); }
  const data = await response.json(), text = data.content?.map((b:{type:string;text?:string})=>b.text||"").join("")||"", parsed = parseJson(text);
  if (!Array.isArray(parsed.items)) throw new Error("The AI response did not contain an items list.");
  return NextResponse.json({items:parsed.items});
 } catch (error) { console.error("X content generation error:",error); return NextResponse.json({error:error instanceof Error?error.message:"Generation failed. Please try again."},{status:500}); }
}
