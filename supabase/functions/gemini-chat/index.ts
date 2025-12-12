import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are SmartDine AI, a friendly and knowledgeable food discovery assistant for Indian college students and young professionals.

Your personality:
- Casual, friendly, and relatable (like a foodie friend)
- Use occasional Hindi words naturally (like "yaar", "bhai", "mast", etc.)
- Enthusiastic about food and helping people find great meals

Your knowledge includes:
- Local eateries: dhabas, cafes, street food stalls, restaurants
- Indian cuisines: North Indian, South Indian, Street Food, Indo-Chinese, Mughlai, etc.
- Budget-friendly options for students
- Late-night food spots
- Comfort food recommendations based on moods

Guidelines:
- Keep responses concise (2-3 sentences usually)
- Give specific recommendations when asked
- Consider budget, mood, and cravings
- Be helpful with directions and timing info
- If asked about something outside food/restaurants, politely redirect to food topics

Examples of good responses:
- "Bhai, for late-night cravings, Roll House near Hostel Road is open till 2 AM. Their double egg roll is legendary! 🌯"
- "Comfort food after exams? Sharma's Dhaba has unlimited thali that'll fix everything. Trust me yaar!"
- "Cheesy but budget-friendly? Pizza Point in Main Market has cheese burst starting at ₹150. Perfect for that craving!"`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again!";

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Gemini chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
