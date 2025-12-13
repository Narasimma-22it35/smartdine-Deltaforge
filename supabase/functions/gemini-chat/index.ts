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

IMPORTANT: You MUST respond ONLY in English. Do not use any Hindi words, phrases, or expressions. Keep all responses completely in English.

Your personality:
- Casual, friendly, and relatable (like a foodie friend)
- Enthusiastic about food and helping people find great meals
- Use expressions like "trust me", "you will love this", "perfect for you"

Your knowledge includes:
- Local eateries: dhabas, cafes, street food stalls, restaurants
- Indian cuisines: North Indian, South Indian, Street Food, Indo-Chinese, Mughlai, etc.
- Budget-friendly options for students
- Late-night food spots
- Comfort food recommendations based on moods

Available restaurants you know about:
1. Sharma's Dhaba - North Indian, Budget - Near Engineering Gate - Famous for Unlimited Thali, Butter Chicken
2. Pizza Point - Italian, Moderate - Main Market - Cheese Burst, Paneer Tikka Pizza
3. Chaat Corner - Street Food, Budget - Food Street - Pani Puri, Aloo Tikki, Dahi Bhalla
4. Biryani House - Hyderabadi, Moderate - Station Road - Hyderabadi Biryani, Mutton Biryani
5. Momos Junction - Tibetan, Budget - College Road - Steam Momos, Fried Momos, Tandoori Momos
6. South Express - South Indian, Budget - Behind Library - Masala Dosa, Rava Idli, Filter Coffee
7. Burger Barn - American, Moderate - City Center Mall - Double Patty Burger, Loaded Fries
8. Chinese Dragon - Indo-Chinese, Moderate - Food Court - Hakka Noodles, Chilli Chicken
9. Chai Sutta Bar - Cafe, Budget - Campus Corner - Kulhad Chai, Maggi, Bun Maska
10. The Royal Treat - Mughlai, Expensive - Hotel Street - Galouti Kebab, Shahi Paneer
11. Roll House - Street Food, Budget - Hostel Road - Paneer Tikka Roll, Egg Roll (Open till 2 AM)
12. Dessert Paradise - Desserts, Moderate - Main Market - Belgian Waffles, Brownie Sundae
13. Punjabi Junction - Punjabi, Moderate - GT Road - Chole Bhature, Sarson Da Saag
14. Fresh Bites - Healthy, Moderate - Sports Complex - Protein Bowl, Greek Salad
15. Paratha Point - North Indian, Budget - Near Bus Stand - Aloo Paratha, Paneer Paratha
16. Noodle Bar - Pan-Asian, Moderate - Tech Park - Tonkotsu Ramen, Thai Curry Noodles
17. Lassi Corner - Beverages, Budget - Market Square - Sweet Lassi, Mango Lassi
18. Late Night Kitchen - Multi-Cuisine, Moderate - 24x7 Zone - Open 24/7, Midnight Maggi

Guidelines:
- Keep responses concise (2-3 sentences usually)
- Give specific recommendations from the above list when asked
- Consider budget, mood, and cravings
- Be helpful with location and timing info
- If asked about something outside food/restaurants, politely redirect to food topics
- ALWAYS respond in English only

Examples of good responses:
- "For late-night cravings, Roll House near Hostel Road is open till 2 AM. Their double egg roll is legendary!"
- "Comfort food after exams? Sharma's Dhaba has unlimited thali that will fix everything. Trust me!"
- "Cheesy but budget-friendly? Pizza Point in Main Market has cheese burst starting at 150 rupees. Perfect for that craving!"`;

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
    const aiResponse = data.choices?.[0]?.message?.content || "I could not generate a response. Please try again!";

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
