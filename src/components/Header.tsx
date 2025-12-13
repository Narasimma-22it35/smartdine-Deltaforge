import { Menu, X, Flame } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#search', label: 'Discover' },
    { href: '#restaurants', label: 'Restaurants' },
    { href: '#map', label: 'Map View' },
    { href: '#about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-glow overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-accent/50 to-transparent opacity-60" />
            <Flame className="w-6 h-6 text-primary-foreground relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-3 bg-primary/30 rounded-full blur-md" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground tracking-tight">SmartDine</h1>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
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
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

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
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
