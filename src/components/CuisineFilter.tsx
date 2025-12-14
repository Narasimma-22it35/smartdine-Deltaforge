import { cuisineTypes } from '@/data/restaurants';
import { cn } from '@/lib/utils';

interface CuisineFilterProps {
  selected: string;
  onChange: (cuisine: string) => void;
}

const CuisineFilter = ({ selected, onChange }: CuisineFilterProps) => {
  return (
    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
      <span className="text-sm font-medium text-muted-foreground flex-shrink-0">Cuisine:</span>
      <div className="flex gap-2">
        {cuisineTypes.map((cuisine) => (
          <button
            key={cuisine}
            onClick={() => onChange(cuisine)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
              selected === cuisine
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {cuisine}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CuisineFilter;
