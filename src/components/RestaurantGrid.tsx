import RestaurantCard from './RestaurantCard';
import { Restaurant } from '@/data/restaurants';

interface RestaurantGridProps {
  restaurants: Restaurant[];
  recommendations?: Map<string, string>;
  title?: string;
  subtitle?: string;
  onShowRoute?: (restaurant: Restaurant) => void;
}

const RestaurantGrid = ({ 
  restaurants, 
  recommendations,
  title = "Discover Local Favorites",
  subtitle = "Handpicked spots loved by students and locals alike",
  onShowRoute
}: RestaurantGridProps) => {
  if (restaurants.length === 0) {
    return (
      <section id="restaurants" className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto p-8 bg-card rounded-2xl shadow-card">
            <p className="text-lg text-muted-foreground">
              No restaurants found matching your criteria. Try a different search!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="restaurants" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant, index) => (
            <RestaurantCard 
              key={restaurant.id} 
              restaurant={restaurant}
              recommendation={recommendations?.get(restaurant.id)}
              index={index}
              onShowRoute={onShowRoute}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RestaurantGrid;
