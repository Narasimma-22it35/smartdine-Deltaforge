import { Star, MapPin, Clock, ArrowRight, ExternalLink, IndianRupee } from 'lucide-react';
import { Restaurant, priceLabels } from '@/data/restaurants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface RestaurantCardProps {
  restaurant: Restaurant;
  recommendation?: string;
  index?: number;
}

const RestaurantCard = ({ restaurant, recommendation, index = 0 }: RestaurantCardProps) => {
  const handleOpenWebsite = () => {
    window.open(restaurant.website, '_blank', 'noopener,noreferrer');
  };

  const availableItems = (restaurant.menu || []).filter(item => item.available);

  return (
    <div 
      className={cn(
        "group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-1",
        "animate-slide-up"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={restaurant.image} 
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        
        {/* Price Badge */}
        <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-sm font-semibold text-primary">
            {priceLabels[restaurant.priceRange]}
          </span>
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
          <Star className="w-4 h-4 fill-primary text-primary" />
          <span className="text-sm font-semibold">{restaurant.rating}</span>
        </div>

        {/* Open Status */}
        {restaurant.openNow && (
          <div className="absolute bottom-3 left-3 bg-emerald-500/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-xs font-medium text-emerald-50">Open Now</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {restaurant.name}
          </h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">{restaurant.cuisine}</p>
        
        <p className="text-sm text-foreground/80 mb-4 line-clamp-2">
          {restaurant.description}
        </p>

        {/* AI Recommendation */}
        {recommendation && (
          <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-sm text-foreground/90 italic">
              "{recommendation}"
            </p>
          </div>
        )}

        {/* Available Menu Items */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <IndianRupee className="w-3 h-3" />
            Available Now
          </p>
          <div className="flex flex-wrap gap-2">
            {availableItems.slice(0, 3).map((item) => (
              <span 
                key={item.name}
                className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground flex items-center gap-1"
              >
                {item.name} <span className="text-primary font-medium">₹{item.price}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {restaurant.specialties.slice(0, 2).map((specialty) => (
            <span 
              key={specialty}
              className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent-foreground"
            >
              {specialty}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {restaurant.distance}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {restaurant.timing}
            </span>
          </div>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={handleOpenWebsite}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-all"
          >
            Order Now
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
