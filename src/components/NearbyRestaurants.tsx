import { useMemo } from 'react';
import { MapPin, Navigation, Star, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Restaurant } from '@/data/restaurants';
import { getNearbyRestaurants } from '@/data/indianRestaurants';
import { priceLabels } from '@/data/restaurants';

interface NearbyRestaurantsProps {
  userLat: number;
  userLng: number;
  cityName: string;
  onShowRoute: (restaurant: Restaurant) => void;
  onViewAll: () => void;
}

const NearbyRestaurants = ({ userLat, userLng, cityName, onShowRoute, onViewAll }: NearbyRestaurantsProps) => {
  const nearbyRestaurants = useMemo(() => {
    return getNearbyRestaurants(userLat, userLng, 100).slice(0, 6);
  }, [userLat, userLng]);

  if (nearbyRestaurants.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wide">Near You</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Famous in {cityName}
            </h2>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Based on your current location
            </p>
          </div>
          <Button variant="outline" onClick={onViewAll} className="hidden sm:flex">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nearbyRestaurants.map((restaurant, index) => (
            <div 
              key={restaurant.id}
              className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={restaurant.image} 
                  alt={restaurant.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                
                <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  <span className="text-xs font-semibold text-primary">
                    {priceLabels[restaurant.priceRange]}
                  </span>
                </div>
                
                <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  <span className="text-xs font-semibold">{restaurant.rating}</span>
                </div>

                {restaurant.openNow && (
                  <div className="absolute bottom-3 left-3 bg-emerald-500/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    <span className="text-[10px] font-medium text-emerald-50">Open</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {restaurant.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">{restaurant.cuisine} • {restaurant.location}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {restaurant.specialties.slice(0, 2).map((specialty) => (
                    <span 
                      key={specialty}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {restaurant.distance}
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => onShowRoute(restaurant)}
                    className="flex items-center gap-1 text-xs h-8"
                  >
                    <Navigation className="w-3 h-3" />
                    Get Directions
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8 sm:hidden">
          <Button variant="outline" onClick={onViewAll}>
            View All Restaurants
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NearbyRestaurants;
