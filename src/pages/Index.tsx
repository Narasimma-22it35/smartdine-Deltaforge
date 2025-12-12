import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import SearchInterface from '@/components/SearchInterface';
import AIResponse from '@/components/AIResponse';
import CuisineFilter from '@/components/CuisineFilter';
import RestaurantGrid from '@/components/RestaurantGrid';
import { restaurants } from '@/data/restaurants';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';

const Index = () => {
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const { isLoading, result, search, surpriseMe, reset } = useAIRecommendations();

  const filteredRestaurants = useMemo(() => {
    if (result) {
      // If we have AI results, filter those
      if (cuisineFilter === 'All') return result.restaurants;
      return result.restaurants.filter(r => r.cuisine === cuisineFilter);
    }
    
    // Otherwise show all restaurants with filter
    if (cuisineFilter === 'All') return restaurants;
    return restaurants.filter(r => r.cuisine === cuisineFilter);
  }, [result, cuisineFilter]);

  const handleCuisineChange = (cuisine: string) => {
    setCuisineFilter(cuisine);
    if (cuisine !== 'All') {
      reset();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <SearchInterface 
          onSearch={search}
          onSurpriseMe={surpriseMe}
          isLoading={isLoading}
        />

        <AIResponse 
          message={result?.aiMessage || ''}
          isVisible={!!result?.aiMessage}
        />

        <CuisineFilter 
          selected={cuisineFilter}
          onChange={handleCuisineChange}
        />

        <RestaurantGrid 
          restaurants={filteredRestaurants}
          recommendations={result?.recommendations}
          title={result ? "AI Picks for You" : "Discover Local Favorites"}
          subtitle={result 
            ? "Curated based on your craving" 
            : "Handpicked spots loved by students and locals alike"
          }
        />
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Made with ❤️ for hungry students • SmartDine AI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
