import { useState, useCallback } from 'react';
import { restaurants, Restaurant } from '@/data/restaurants';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AIResult {
  restaurants: Restaurant[];
  recommendations: Map<string, string>;
  aiMessage: string;
}

export const useAIRecommendations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);

  const search = useCallback(async (query: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('food-recommend', {
        body: { 
          query,
          restaurants: restaurants.map(r => ({
            id: r.id,
            name: r.name,
            cuisine: r.cuisine,
            priceRange: r.priceRange,
            rating: r.rating,
            tags: r.tags,
            description: r.description,
            specialties: r.specialties,
          }))
        }
      });

      if (error) {
        // Check for rate limit errors
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          toast({
            title: "Rate limited",
            description: "Too many requests. Please wait a moment and try again.",
            variant: "destructive",
          });
        } else if (error.message?.includes('402')) {
          toast({
            title: "Usage limit reached",
            description: "AI usage limit reached. Please try again later.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        setIsLoading(false);
        return;
      }

      const { recommendedIds, recommendations: recMap, message } = data;
      
      // Filter restaurants based on AI recommendations
      const recommendedRestaurants = recommendedIds
        .map((id: string) => restaurants.find(r => r.id === id))
        .filter(Boolean) as Restaurant[];

      const recommendationsMap = new Map<string, string>(
        Object.entries(recMap || {})
      );

      setResult({
        restaurants: recommendedRestaurants.length > 0 ? recommendedRestaurants : restaurants.slice(0, 6),
        recommendations: recommendationsMap,
        aiMessage: message || '',
      });
    } catch (error) {
      console.error('AI search error:', error);
      toast({
        title: "Search failed",
        description: "Something went wrong. Showing popular options instead.",
        variant: "destructive",
      });
      
      // Fallback to showing top-rated restaurants
      setResult({
        restaurants: restaurants.sort((a, b) => b.rating - a.rating).slice(0, 6),
        recommendations: new Map(),
        aiMessage: "I couldn't process your request, but here are some popular spots you might enjoy!",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const surpriseMe = useCallback(async () => {
    const moods = [
      "I'm feeling adventurous, surprise me with something exciting",
      "Pick something random but delicious for me",
      "Chef's choice - what's the best hidden gem around?",
      "I want to try something new and interesting",
    ];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    await search(randomMood);
  }, [search]);

  const reset = useCallback(() => {
    setResult(null);
  }, []);

  return {
    isLoading,
    result,
    search,
    surpriseMe,
    reset,
  };
};
