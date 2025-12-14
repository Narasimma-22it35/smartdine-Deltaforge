import { Menu, X, Flame, Sun, Moon, Heart, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import SearchDropdown from '@/components/SearchDropdown';
import { Restaurant } from '@/data/restaurants';

interface HeaderProps {
  onSelectRestaurant?: (restaurant: Restaurant) => void;
  onShowRoute?: (restaurant: Restaurant) => void;
}

const Header = ({ onSelectRestaurant, onShowRoute }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { href: '#search', label: 'Discover' },
    { href: '#restaurants', label: 'Restaurants' },
    { href: '#about', label: 'About' },
  ];

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    onSelectRestaurant?.(restaurant);
    document.getElementById('restaurants')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-glow overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-accent/50 to-transparent opacity-60" />
            <Flame className="w-5 h-5 text-primary-foreground relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-lg font-display font-bold text-foreground tracking-tight hidden sm:block">SmartDine</h1>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <SearchDropdown onSelectRestaurant={handleSelectRestaurant} onShowRoute={onShowRoute} />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                const targetId = link.href.replace('#', '');
                document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {link.label}
            </a>
          ))}
          
          {/* Favorites Button */}
          <Button variant="ghost" size="sm" className="gap-2">
            <Heart className="w-4 h-4" />
            <span className="hidden lg:inline">Favorites</span>
          </Button>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </Button>
        </nav>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setShowMobileSearch(!showMobileSearch)}>
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden px-4 pb-3 animate-slide-up">
          <SearchDropdown onSelectRestaurant={handleSelectRestaurant} onShowRoute={onShowRoute} />
        </div>
      )}

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  const targetId = link.href.replace('#', '');
                  document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                  setIsMobileMenuOpen(false);
                }}
                className="block py-2 px-3 rounded-lg hover:bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#"
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Heart className="w-4 h-4" />
              Favorites
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
