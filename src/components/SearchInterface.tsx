import { useState } from 'react';
import { Search, Sparkles, Shuffle, Send, Loader2, Gift, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  onSurpriseMe: () => void;
  isLoading: boolean;
}

const surpriseOffers = [
  { title: "Free Dessert!", description: "Get a free dessert with any main course order at Dessert Paradise today!" },
  { title: "20% Off!", description: "Enjoy 20% off on your first order at Pizza Point. Use code: SMARTDINE20" },
  { title: "Buy 1 Get 1!", description: "Buy 1 Biryani, Get 1 Free at Biryani House. Valid till 10 PM tonight!" },
  { title: "Free Delivery!", description: "Free delivery on all orders above ₹200 from Late Night Kitchen!" },
  { title: "Student Special!", description: "Show your student ID and get 15% off at Chai Sutta Bar!" },
];

const suggestions = [
  "something cheesy but not too expensive",
  "comfort food after a rough day",
  "healthy option for lunch",
  "late night munchies under 200",
  "spicy food that will blow my mind",
  "quick breakfast before class",
];

const SearchInterface = ({ onSearch, onSurpriseMe, isLoading }: SearchInterfaceProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSurprisePopup, setShowSurprisePopup] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(surpriseOffers[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
  };

  const handleSurpriseMe = () => {
    const randomOffer = surpriseOffers[Math.floor(Math.random() * surpriseOffers.length)];
    setCurrentOffer(randomOffer);
    setShowSurprisePopup(true);
    onSurpriseMe();
  };

  return (
    <section id="search" className="relative py-20 md:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-subtle" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Text */}
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">
            What are you <span className="text-gradient">craving</span> today?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Tell me how you are feeling, and I will find the perfect spot for you.
            Type naturally, like you are texting a friend who knows all the best places.
          </p>
        </div>

        {/* Search Box */}
        <form 
          onSubmit={handleSubmit}
          className={cn(
            "max-w-3xl mx-auto relative animate-slide-up",
            "transition-all duration-300"
          )}
          style={{ animationDelay: '100ms' }}
        >
          <div className={cn(
            "relative bg-card rounded-2xl shadow-card transition-all duration-300",
            isFocused && "shadow-elevated ring-2 ring-primary/20"
          )}>
            <div className="flex items-center gap-3 p-4">
              <div className="flex-shrink-0">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                ) : (
                  <Sparkles className="w-6 h-6 text-primary" />
                )}
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder='Try "something cheesy but not too expensive"'
                className="flex-1 bg-transparent text-lg text-foreground placeholder:text-muted-foreground focus:outline-none font-body"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                variant="hero" 
                size="lg"
                disabled={!query.trim() || isLoading}
                className="flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>
          </div>
        </form>

        {/* Quick Suggestions */}
        <div className="max-w-3xl mx-auto mt-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <p className="text-sm text-muted-foreground text-center mb-3">Quick suggestions:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
                className="text-sm px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Surprise Me Button */}
        <div className="text-center mt-10 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <Button 
            variant="surprise" 
            size="xl"
            onClick={handleSurpriseMe}
            disabled={isLoading}
            className="group"
          >
            <Shuffle className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            {isLoading ? 'Finding...' : 'Surprise Me!'}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">Feeling adventurous? Let AI pick for you</p>
        </div>
      </div>

      {/* Surprise Popup Modal */}
      {showSurprisePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-card rounded-3xl shadow-elevated max-w-md w-full p-6 animate-slide-up">
            <button
              onClick={() => setShowSurprisePopup(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Gift className="w-8 h-8 text-primary animate-bounce" />
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                {currentOffer.title}
              </h3>
              <p className="text-muted-foreground mb-6">
                {currentOffer.description}
              </p>
              <Button onClick={() => setShowSurprisePopup(false)} className="w-full">
                Awesome! Show My Picks
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SearchInterface;
