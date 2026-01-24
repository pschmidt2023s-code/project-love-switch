import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Filter, X, Sun, Snowflake, Leaf, Cloud, 
  Briefcase, Heart, PartyPopper, User, Users
} from 'lucide-react';

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  genders: string[];
  seasons: string[];
  occasions: string[];
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: { id: string; name: string; slug: string }[];
  maxPrice: number;
}

const GENDERS = [
  { id: 'herren', label: 'Herren', icon: User },
  { id: 'damen', label: 'Damen', icon: User },
  { id: 'unisex', label: 'Unisex', icon: Users },
];

const SEASONS = [
  { id: 'Frühling', label: 'Frühling', icon: Leaf, color: 'text-green-500' },
  { id: 'Sommer', label: 'Sommer', icon: Sun, color: 'text-yellow-500' },
  { id: 'Herbst', label: 'Herbst', icon: Cloud, color: 'text-orange-500' },
  { id: 'Winter', label: 'Winter', icon: Snowflake, color: 'text-blue-500' },
];

const OCCASIONS = [
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'date', label: 'Date Night', icon: Heart },
  { id: 'evening', label: 'Abend/Party', icon: PartyPopper },
  { id: 'daily', label: 'Alltag', icon: User },
];

function FilterContent({
  filters,
  onFiltersChange,
  categories,
  maxPrice,
}: ProductFiltersProps) {
  const toggleArrayFilter = (
    key: 'categories' | 'genders' | 'seasons' | 'occasions',
    value: string
  ) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: updated });
  };

  const activeFilterCount =
    filters.categories.length +
    filters.genders.length +
    filters.seasons.length +
    filters.occasions.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Aktive Filter ({activeFilterCount})</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onFiltersChange({
                  categories: [],
                  priceRange: [0, maxPrice],
                  genders: [],
                  seasons: [],
                  occasions: [],
                })
              }
            >
              <X className="w-4 h-4 mr-1" />
              Alle löschen
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.categories.map((cat) => {
              const category = categories.find((c) => c.slug === cat);
              return (
                <Badge
                  key={cat}
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => toggleArrayFilter('categories', cat)}
                >
                  {category?.name || cat}
                  <X className="w-3 h-3" />
                </Badge>
              );
            })}
            {filters.genders.map((g) => (
              <Badge
                key={g}
                variant="secondary"
                className="gap-1 cursor-pointer"
                onClick={() => toggleArrayFilter('genders', g)}
              >
                {GENDERS.find((x) => x.id === g)?.label || g}
                <X className="w-3 h-3" />
              </Badge>
            ))}
            {filters.seasons.map((s) => (
              <Badge
                key={s}
                variant="secondary"
                className="gap-1 cursor-pointer"
                onClick={() => toggleArrayFilter('seasons', s)}
              >
                {s}
                <X className="w-3 h-3" />
              </Badge>
            ))}
            {filters.occasions.map((o) => (
              <Badge
                key={o}
                variant="secondary"
                className="gap-1 cursor-pointer"
                onClick={() => toggleArrayFilter('occasions', o)}
              >
                {OCCASIONS.find((x) => x.id === o)?.label || o}
                <X className="w-3 h-3" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Categories */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Kategorie</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${category.slug}`}
                  checked={filters.categories.includes(category.slug)}
                  onCheckedChange={() => toggleArrayFilter('categories', category.slug)}
                />
                <Label
                  htmlFor={`cat-${category.slug}`}
                  className="text-sm cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Preis</h3>
        <Slider
          value={filters.priceRange}
          min={0}
          max={maxPrice}
          step={5}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, priceRange: value as [number, number] })
          }
          className="py-4"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{filters.priceRange[0].toFixed(0)} €</span>
          <span>{filters.priceRange[1].toFixed(0)} €</span>
        </div>
      </div>

      <Separator />

      {/* Gender */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm">Geschlecht</h3>
        <div className="space-y-2">
          {GENDERS.map((gender) => {
            const Icon = gender.icon;
            return (
              <div key={gender.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`gender-${gender.id}`}
                  checked={filters.genders.includes(gender.id)}
                  onCheckedChange={() => toggleArrayFilter('genders', gender.id)}
                />
                <Label
                  htmlFor={`gender-${gender.id}`}
                  className="text-sm cursor-pointer flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {gender.label}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Seasons */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm">Jahreszeit</h3>
        <div className="grid grid-cols-2 gap-2">
          {SEASONS.map((season) => {
            const Icon = season.icon;
            const isActive = filters.seasons.includes(season.id);
            return (
              <Button
                key={season.id}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className="justify-start gap-2"
                onClick={() => toggleArrayFilter('seasons', season.id)}
              >
                <Icon className={`w-4 h-4 ${!isActive ? season.color : ''}`} />
                {season.label}
              </Button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Occasions */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm">Anlass</h3>
        <div className="space-y-2">
          {OCCASIONS.map((occasion) => {
            const Icon = occasion.icon;
            return (
              <div key={occasion.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`occasion-${occasion.id}`}
                  checked={filters.occasions.includes(occasion.id)}
                  onCheckedChange={() => toggleArrayFilter('occasions', occasion.id)}
                />
                <Label
                  htmlFor={`occasion-${occasion.id}`}
                  className="text-sm cursor-pointer flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {occasion.label}
                </Label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ProductFilters(props: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeCount =
    props.filters.categories.length +
    props.filters.genders.length +
    props.filters.seasons.length +
    props.filters.occasions.length;

  return (
    <>
      {/* Desktop Sidebar */}
      <Card className="hidden lg:block sticky top-24">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto">
          <FilterContent {...props} />
        </CardContent>
      </Card>

      {/* Mobile Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="lg:hidden gap-2">
            <Filter className="w-4 h-4" />
            Filter
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 overflow-y-auto max-h-[calc(100vh-120px)]">
            <FilterContent {...props} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export type { FilterState };
