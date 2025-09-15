import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Filter } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface FiltersContentProps {
  categories: Category[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  showInStockOnly: boolean;
  setShowInStockOnly: (show: boolean) => void;
  showNewOnly: boolean;
  setShowNewOnly: (show: boolean) => void;
  showVerifiedOnly: boolean;
  setShowVerifiedOnly: (show: boolean) => void;
  selectedMaterials: string[];
  toggleMaterial: (material: string) => void;
  availableMaterials: string[];
  setCurrentPage: (page: number) => void;
}

export function FiltersContent({
  categories,
  activeCategory,
  setActiveCategory,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  showInStockOnly,
  setShowInStockOnly,
  showNewOnly,
  setShowNewOnly,
  showVerifiedOnly,
  setShowVerifiedOnly,
  selectedMaterials,
  toggleMaterial,
  availableMaterials,
  setCurrentPage,
}: FiltersContentProps) {
  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-medium mb-3 flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Category
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveCategory("all");
              setCurrentPage(1);
            }}
            className="text-xs justify-start"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveCategory(category.id);
                setCurrentPage(1);
              }}
              className="text-xs justify-start"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-medium mb-3">
          Price: ₹{priceRange[0]} - ₹{priceRange[1]}
        </h3>
        <Slider
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          max={1000}
          step={10}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₹0</span>
          <span>₹1000+</span>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h3 className="font-medium mb-3">Minimum Rating</h3>
        <div className="flex gap-2">
          {[0, 3, 4, 4.5].map((rating) => (
            <Button
              key={rating}
              variant={minRating === rating ? "default" : "outline"}
              size="sm"
              onClick={() => setMinRating(rating)}
              className="text-xs"
            >
              {rating === 0 ? "All" : `${rating}★+`}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div>
        <h3 className="font-medium mb-3">Quick Filters</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="inStock"
              checked={showInStockOnly}
              onCheckedChange={(checked) =>
                setShowInStockOnly(checked as boolean)
              }
            />
            <Label htmlFor="inStock" className="text-sm cursor-pointer">
              In Stock Only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="newOnly"
              checked={showNewOnly}
              onCheckedChange={(checked) => setShowNewOnly(checked as boolean)}
            />
            <Label htmlFor="newOnly" className="text-sm cursor-pointer">
              New Arrivals
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified"
              checked={showVerifiedOnly}
              onCheckedChange={(checked) =>
                setShowVerifiedOnly(checked as boolean)
              }
            />
            <Label htmlFor="verified" className="text-sm cursor-pointer">
              Verified Creators Only
            </Label>
          </div>
        </div>
      </div>

      {/* Materials Filter */}
      {availableMaterials.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">Materials</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableMaterials.map((material) => (
              <div key={material} className="flex items-center space-x-2">
                <Checkbox
                  id={material}
                  checked={selectedMaterials.includes(material)}
                  onCheckedChange={() => toggleMaterial(material)}
                />
                <Label htmlFor={material} className="text-sm cursor-pointer">
                  {material}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// // Now your main component
// export default function ProductsPage() {
//   // ... all your state and logic

//   return (
//     <div>
//       {/* Use the component */}
    //   <FiltersContent
    //     categories={categories}
    //     activeCategory={activeCategory}
    //     setActiveCategory={setActiveCategory}
    //     priceRange={priceRange}
    //     setPriceRange={setPriceRange}
    //     minRating={minRating}
    //     setMinRating={setMinRating}
    //     showInStockOnly={showInStockOnly}
    //     setShowInStockOnly={setShowInStockOnly}
    //     showNewOnly={showNewOnly}
    //     setShowNewOnly={setShowNewOnly}
    //     showVerifiedOnly={showVerifiedOnly}
    //     setShowVerifiedOnly={setShowVerifiedOnly}
    //     selectedMaterials={selectedMaterials}
    //     toggleMaterial={toggleMaterial}
    //     availableMaterials={availableMaterials}
    //     setCurrentPage={setCurrentPage}
    //   />
//     </div>
//   );
// }
