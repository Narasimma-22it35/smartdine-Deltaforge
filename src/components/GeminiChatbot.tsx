import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, MapPin, Star, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant, priceLabels } from '@/data/restaurants';
import { indianRestaurants, getNearbyRestaurants } from '@/data/indianRestaurants';
import { useUserLocation } from '@/hooks/useUserLocation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  restaurants?: Restaurant[];
}

interface GeminiChatbotProps {
  onShowRoute?: (restaurant: Restaurant) => void;
}

const GeminiChatbot = ({ onShowRoute }: GeminiChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey there! I am your SmartDine food buddy. Ask me about restaurants near you, find places in any city, or tell me what you are craving!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { lat, lng } = useUserLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findMatchingRestaurants = (query: string): Restaurant[] => {
    const lowerQuery = query.toLowerCase();
    const keywords = lowerQuery.split(/\s+/);
    
    // Check if user is asking for nearby restaurants
    const nearbyKeywords = ['nearby', 'near me', 'around me', 'close to me', 'near by', 'closest', 'surrounding', 'local'];
    const isNearbyQuery = nearbyKeywords.some(k => lowerQuery.includes(k));
    
    if (isNearbyQuery) {
      return getNearbyRestaurants(lat, lng, 50).slice(0, 5);
    }
    
    // Check for restaurant-related keywords
    const restaurantKeywords = ['restaurant', 'food', 'eat', 'hungry', 'place', 'suggest', 'recommend', 'find', 'show', 'best', 'good', 'cheap', 'budget', 'expensive', 'pizza', 'biryani', 'momos', 'chai', 'coffee', 'burger', 'chinese', 'indian', 'south', 'north', 'dosa', 'thali', 'paratha', 'chaat', 'dessert', 'sweet', 'late night', 'breakfast', 'lunch', 'dinner', 'kebab', 'mughlai', 'hyderabadi', 'goan', 'punjabi', 'gujarati', 'rajasthani', 'kerala', 'delhi', 'mumbai', 'bengaluru', 'chennai', 'kolkata', 'hyderabad', 'jaipur', 'lucknow', 'pune', 'goa', 'kochi', 'amritsar', 'ahmedabad', 'varanasi'];
    
    const isRestaurantQuery = keywords.some(k => restaurantKeywords.some(rk => rk.includes(k) || k.includes(rk)));
    
    if (!isRestaurantQuery) return [];

    // Score-based matching against all Indian restaurants
    const scored = indianRestaurants.map(r => {
      let score = 0;
      
      keywords.forEach(keyword => {
        if (r.name.toLowerCase().includes(keyword)) score += 10;
        if (r.cuisine.toLowerCase().includes(keyword)) score += 8;
        if (r.location.toLowerCase().includes(keyword)) score += 7;
        if (r.tags.some(t => t.toLowerCase().includes(keyword))) score += 5;
        if (r.specialties.some(s => s.toLowerCase().includes(keyword))) score += 6;
        if (r.description.toLowerCase().includes(keyword)) score += 3;
      });
      
      if (r.openNow) score += 2;
      
      if (lowerQuery.includes('cheap') || lowerQuery.includes('budget')) {
        if (r.priceRange === 'budget') score += 5;
      }
      if (lowerQuery.includes('premium') || lowerQuery.includes('expensive') || lowerQuery.includes('fancy')) {
        if (r.priceRange === 'expensive') score += 5;
      }
      
      return { restaurant: r, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.restaurant);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userQuery = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Find matching restaurants based on user query
      const matchingRestaurants = findMatchingRestaurants(userQuery);

      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: { message: userQuery },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "I am having trouble responding right now. Please try again!",
        restaurants: matchingRestaurants.length > 0 ? matchingRestaurants : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oops! Something went wrong. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const RestaurantMiniCard = ({ restaurant }: { restaurant: Restaurant }) => (
    <div className="flex items-start gap-2 p-2 bg-background rounded-lg border border-border/50 mt-2">
      <img 
        src={restaurant.image} 
        alt={restaurant.name}
        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <h5 className="text-xs font-semibold text-foreground truncate">{restaurant.name}</h5>
          <span className="text-[10px] text-primary font-medium">{priceLabels[restaurant.priceRange]}</span>
        </div>
        <p className="text-[10px] text-muted-foreground truncate">{restaurant.cuisine} • {restaurant.location}</p>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Star className="w-2.5 h-2.5 text-primary fill-primary" />
              {restaurant.rating}
            </span>
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <MapPin className="w-2.5 h-2.5" />
              {restaurant.distance}
            </span>
          </div>
          {onShowRoute && (
            <button 
              onClick={() => {
                onShowRoute(restaurant);
                setIsOpen(false);
              }}
              className="flex items-center gap-0.5 text-[10px] text-primary hover:underline"
            >
              <Navigation className="w-2.5 h-2.5" />
              Route
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-elevated flex items-center justify-center transition-all duration-300 hover:scale-110"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] h-[500px] bg-card border border-border rounded-2xl shadow-elevated flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-primary-foreground">SmartDine AI</h3>
              <p className="text-xs text-primary-foreground/80">Your food discovery assistant</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-secondary'
                      : 'bg-primary/10'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-secondary-foreground" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className={`max-w-[75%] ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-secondary text-secondary-foreground rounded-tl-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.restaurants && message.restaurants.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.restaurants.map(r => (
                        <RestaurantMiniCard key={r.id} restaurant={r} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-secondary px-4 py-3 rounded-2xl rounded-tl-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about food..."
                className="flex-1 bg-secondary rounded-xl px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="px-3 rounded-xl"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GeminiChatbot;
