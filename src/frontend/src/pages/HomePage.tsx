import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { BottomNav, Header } from "../components/Header";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../hooks/useQueries";

const CATEGORIES = [
  { id: "সব", label: "সব", emoji: "🏪" },
  { id: "Grocery", label: "মুদিখানা", emoji: "🛒" },
  { id: "Fish", label: "মাছ", emoji: "🐟" },
  { id: "Chicken", label: "মুরগি", emoji: "🍗" },
  { id: "Vegetables", label: "সবজি", emoji: "🥬" },
  { id: "Medicine", label: "ওষুধ", emoji: "💊" },
  { id: "Household", label: "গৃহস্থালি", emoji: "🧴" },
];

const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"];

export function HomePage() {
  const [activeCategory, setActiveCategory] = useState("সব");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: products = [], isLoading } = useProducts();

  const filtered = useMemo(() => {
    let result = products;
    if (activeCategory !== "সব") {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    return result;
  }, [products, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-lg mx-auto main-content">
        {/* Hero Banner */}
        <div className="relative overflow-hidden">
          <img
            src="/assets/generated/hero-banner.dim_800x300.jpg"
            alt="গ্রাম ডেলিভারি"
            className="w-full h-36 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent flex items-center px-5">
            <div>
              <p className="text-white font-bold text-lg leading-tight">
                তাজা পণ্য
              </p>
              <p className="text-white/90 text-sm">দোরগোড়ায় পৌঁছে দিই</p>
              <p className="text-accent bg-white/20 text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-medium">
                ঝড়খালি বাজার থেকে ৫ কিমি এলাকায়
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="পণ্য খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white rounded-xl border-border"
              data-ocid="home.search_input"
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-white text-foreground border border-border"
                }`}
                data-ocid="home.category.tab"
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Section title */}
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-foreground">
              {activeCategory === "সব"
                ? "সব পণ্য"
                : CATEGORIES.find((c) => c.id === activeCategory)?.label}
            </h2>
            <span className="text-xs text-muted-foreground">
              {filtered.length}টি পণ্য
            </span>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div
              className="grid grid-cols-2 gap-3"
              data-ocid="product.loading_state"
            >
              {SKELETON_KEYS.map((key) => (
                <div key={key} className="bg-white rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-square" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16" data-ocid="product.empty_state">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-foreground font-medium">কোনো পণ্য পাওয়া যায়নি</p>
              <p className="text-muted-foreground text-sm mt-1">
                অন্য ক্যাটাগরি বা শব্দ দিয়ে খুঁজুন
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((product, i) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  index={i + 1}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
