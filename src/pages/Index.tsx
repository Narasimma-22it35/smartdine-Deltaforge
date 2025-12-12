import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import SearchInterface from '@/components/SearchInterface';
import AIResponse from '@/components/AIResponse';
import CuisineFilter from '@/components/CuisineFilter';
import RestaurantGrid from '@/components/RestaurantGrid';
import RestaurantMap from '@/components/RestaurantMap';
import GeminiChatbot from '@/components/GeminiChatbot';
import { restaurants, Restaurant } from '@/data/restaurants';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import { Map, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const { isLoading, result, search, surpriseMe, reset } = useAIRecommendations();

  const filteredRestaurants = useMemo(() => {
    if (result) {
      if (cuisineFilter === 'All') return result.restaurants;
      return result.restaurants.filter(r => r.cuisine === cuisineFilter);
    }
    
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

        {/* View Toggle */}
        <div className="container mx-auto px-4 mb-6">
          <div className="flex justify-end gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="gap-2"
            >
              <Map className="w-4 h-4" />
              Map
            </Button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <RestaurantGrid 
            restaurants={filteredRestaurants}
            recommendations={result?.recommendations}
            title={result ? "AI Picks for You" : "Discover Local Favorites"}
            subtitle={result 
              ? "Curated based on your craving" 
              : "Handpicked spots loved by students and locals alike"
            }
          />
        ) : (
          <section className="container mx-auto px-4 pb-16">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Explore Nearby Eateries
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Find restaurants around you and get directions
              </p>
            </div>
            <RestaurantMap 
              restaurants={filteredRestaurants}
              selectedRestaurant={selectedRestaurant}
              onSelectRestaurant={setSelectedRestaurant}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Made with ❤️ for hungry students • SmartDine AI
          </p>
        </div>
      </footer>

      {/* Gemini Chatbot */}
      <GeminiChatbot />
    </div>
  );
};

export default Index;
