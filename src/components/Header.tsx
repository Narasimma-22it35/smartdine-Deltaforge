import { Utensils } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-warm rounded-xl flex items-center justify-center shadow-soft">
            <Utensils className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">SmartDine</h1>
            <p className="text-xs text-muted-foreground font-body">AI Food Discovery</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Discover
          </a>
          <a href="#restaurants" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Restaurants
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
