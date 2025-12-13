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
      <footer id="about" className="py-12 border-t border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-display font-bold text-lg text-foreground mb-4">SmartDine AI</h3>
              <p className="text-sm text-muted-foreground">
                Your intelligent food discovery companion. Find the perfect meal based on your mood, budget, and cravings.
              </p>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#search" className="hover:text-foreground transition-colors">Discover Food</a></li>
                <li><a href="#restaurants" className="hover:text-foreground transition-colors">All Restaurants</a></li>
                <li><a href="#map" className="hover:text-foreground transition-colors">Map View</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-foreground mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Email: support@smartdine.ai</li>
                <li>Phone: +91 98765 43210</li>
                <li>Available: 24/7</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Made with love for hungry students | SmartDine AI 2024
            </p>
          </div>
        </div>
      </footer>

      {/* Gemini Chatbot */}
      <GeminiChatbot />
    </div>
  );
};

export default Index;
