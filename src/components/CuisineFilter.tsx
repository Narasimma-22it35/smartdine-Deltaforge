import { cuisineTypes } from '@/data/restaurants';
import { cn } from '@/lib/utils';

interface CuisineFilterProps {
  selected: string;
  onChange: (cuisine: string) => void;
}

const CuisineFilter = ({ selected, onChange }: CuisineFilterProps) => {
  return (
    <section className="py-8 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-sm font-medium text-muted-foreground flex-shrink-0">Filter:</span>
          <div className="flex gap-2">
            {cuisineTypes.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => onChange(cuisine)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
                  selected === cuisine
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                )}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CuisineFilter;
