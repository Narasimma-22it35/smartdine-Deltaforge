import { cn } from '@/lib/utils';

interface PriceFilterProps {
  selected: string;
  onChange: (price: string) => void;
}

const priceOptions = [
  { value: 'all', label: 'All', symbol: '₹' },
  { value: 'budget', label: 'Budget', symbol: '₹' },
  { value: 'moderate', label: 'Moderate', symbol: '₹₹' },
  { value: 'expensive', label: 'Premium', symbol: '₹₹₹' },
];

const PriceFilter = ({ selected, onChange }: PriceFilterProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground font-medium">Price:</span>
      <div className="flex gap-1">
        {priceOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
              selected === option.value
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {option.symbol}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PriceFilter;
