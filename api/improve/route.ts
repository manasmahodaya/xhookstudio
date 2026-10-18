import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
 try {
  const {text,niche,audience,goal,tone} = await req.json();
  if (!text || !niche || !audience) return NextResponse.json({error:"Missing text, topic or audience."},{status:400});
  const apiKey=process.env.ANTHROPIC_API_KEY;
  if(!apiKey) return NextResponse.json({error:"The AI API key is not configured."},{status:503});
  const prompt=`You are an exacting X post editor. Improve the supplied draft for clarity, specificity, opening strength and readability while preserving the author's actual meaning and factual claims. Do not invent facts, metrics, examples, claims or experiences. Do not add fake controversy, engagement bait or hashtags unless useful. Voice: ${tone||"Clear and insightful"}. Topic: ${niche}. Audience: ${audience}. Goal: ${goal||"Engagement"}.\nDRAFT:\n${String(text).slice(0,5000)}\nReturn ONLY valid JSON: {"improved":"edited text","why":"brief explanation of the edit","bestFor":"one appropriate use case"}`;
  const response=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:900,temperature:0,messages:[{role:"user",content:prompt}]})});
  if(!response.ok){console.error("Anthropic improve error:",response.status,(await response.text()).slice(0,400));return NextResponse.json({error:"Could not improve this draft. Check API configuration."},{status:502});}
  const data=await response.json(), out=data.content?.map((b:{type:string;text?:string})=>b.text||"").join("")||"", match=out.match(/\{[\s\S]*\}/);
  if(!match) throw new Error("Unexpected AI response."); const result=JSON.parse(match[0]);
  return NextResponse.json({improved:String(result.improved||text),why:String(result.why||"Edited for clarity and readability."),bestFor:String(result.bestFor||goal||"Engagement")});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Could not improve this draft."},{status:500});}
}
