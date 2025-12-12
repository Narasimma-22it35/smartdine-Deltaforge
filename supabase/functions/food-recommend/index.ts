import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: string;
  rating: number;
  tags: string[];
  description: string;
  specialties: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, restaurants } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing food recommendation query:', query);

    const restaurantContext = restaurants.map((r: Restaurant) => 
      `- ${r.name} (${r.cuisine}, ${r.priceRange}): ${r.description}. Specialties: ${r.specialties.join(', ')}. Tags: ${r.tags.join(', ')}`
    ).join('\n');

    const systemPrompt = `You are SmartDine AI, a friendly and knowledgeable food recommendation assistant for Indian college students. You understand Indian food culture, student budgets, and local dining preferences.

Your personality:
- Casual and relatable, like a foodie friend
- Use expressions like "trust me", "you'll love this", "perfect for"
- Understand mood-based food requests
- Know that "budget" means under ₹150, "moderate" means ₹150-400, "expensive" means ₹400+

Available restaurants:
${restaurantContext}

IMPORTANT: You must respond in valid JSON format with this exact structure:
{
  "recommendedIds": ["id1", "id2", "id3"],
  "recommendations": {
    "id1": "Short reason why this matches their request",
    "id2": "Short reason why this matches their request"
  },
  "message": "A friendly 2-3 sentence summary of your recommendations"
}

Rules:
- Recommend 3-5 restaurants maximum
- Match the user's mood, budget, and craving
- Keep recommendation reasons under 20 words each
- Be conversational in the message
- Only recommend from the provided restaurant list
- Use the exact restaurant IDs from the list`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI response:', content);

    // Parse the JSON response
    let parsed;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback response
      parsed = {
        recommendedIds: restaurants.slice(0, 4).map((r: Restaurant) => r.id),
        recommendations: {},
        message: "Here are some great options based on what's popular right now!"
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in food-recommend function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
