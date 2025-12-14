import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Star, Clock, Navigation } from 'lucide-react';
import { Restaurant } from '@/data/restaurants';
import { priceLabels } from '@/data/restaurants';
import { indianRestaurants } from '@/data/indianRestaurants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SearchDropdownProps {
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onShowRoute?: (restaurant: Restaurant) => void;
}

const SearchDropdown = ({ onSelectRestaurant, onShowRoute }: SearchDropdownProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<Restaurant[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchQuery = query.toLowerCase();
    // Search in both local and Indian restaurants dataset
    const allRestaurants = [...indianRestaurants];
    
    const filtered = allRestaurants.filter(r => 
      r.name.toLowerCase().includes(searchQuery) ||
      r.cuisine.toLowerCase().includes(searchQuery) ||
      r.location.toLowerCase().includes(searchQuery) ||
      r.tags.some(tag => tag.toLowerCase().includes(searchQuery)) ||
      r.specialties.some(s => s.toLowerCase().includes(searchQuery))
    );
    
    setResults(filtered.slice(0, 8));
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (restaurant: Restaurant) => {
    onSelectRestaurant(restaurant);
    setQuery('');
    setIsFocused(false);
  };

  const handleShowRoute = (e: React.MouseEvent, restaurant: Restaurant) => {
    e.stopPropagation();
    onShowRoute?.(restaurant);
    setQuery('');
    setIsFocused(false);
  };

  const showDropdown = isFocused && (results.length > 0 || query.trim().length >= 2);

  return (
    <div className="relative w-full max-w-md">
      <div className={cn(
        "relative flex items-center gap-2 bg-secondary rounded-xl px-4 py-2.5 transition-all duration-200",
        isFocused && "ring-2 ring-primary/30"
      )}>
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search restaurants, cities, cuisines..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-elevated overflow-hidden z-50 animate-slide-up"
        >
          {results.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {results.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="w-full flex items-start gap-3 p-3 hover:bg-secondary/50 transition-colors text-left border-b border-border/30 last:border-b-0"
                >
                  <button 
                    onClick={() => handleSelect(restaurant)}
                    className="flex items-start gap-3 flex-1"
                  >
                    <img 
                      src={restaurant.image} 
                      alt={restaurant.name}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground truncate">{restaurant.name}</h4>
                        <span className="text-xs text-primary font-medium">
                          {priceLabels[restaurant.priceRange]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{restaurant.cuisine} • {restaurant.location}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 text-primary fill-primary" />
                          {restaurant.rating}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {restaurant.distance}
                        </span>
                        {restaurant.openNow && (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <Clock className="w-3 h-3" />
                            Open
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                  {onShowRoute && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => handleShowRoute(e, restaurant)}
                      className="flex-shrink-0 h-8 gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                      Route
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No restaurants found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
