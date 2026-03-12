import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart } from "lucide-react";
import type { Product } from "../backend.d";
import { useCart } from "../contexts/CartContext";

const CATEGORY_EMOJI: Record<string, string> = {
  Grocery: "🛒",
  Fish: "🐟",
  Chicken: "🍗",
  Vegetables: "🥬",
  Medicine: "💊",
};

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.product.id === product.id);
  const qty = cartItem?.quantity || 0;

  const emoji = CATEGORY_EMOJI[product.category] || "📦";

  return (
    <div
      className="bg-white rounded-2xl card-shadow product-card-hover overflow-hidden flex flex-col"
      data-ocid={`product.item.${index}`}
    >
      {/* Product image */}
      <div className="relative bg-secondary aspect-square flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-5xl">{emoji}</span>
        )}
        {!product.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">
              অনুপলব্ধ
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <div>
          <p className="font-semibold text-sm leading-tight line-clamp-2 text-foreground">
            {product.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {emoji} {product.category}
          </p>
        </div>
        <div className="mt-auto">
          <p className="text-primary font-bold text-base">
            ₹{product.price}
            <span className="text-xs font-normal text-muted-foreground">
              /{product.unit}
            </span>
          </p>
        </div>

        {/* Cart controls */}
        {product.available && (
          <div>
            {qty === 0 ? (
              <Button
                size="sm"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 rounded-xl"
                onClick={() => addItem(product)}
                data-ocid={`product.add_button.${index}`}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                কার্টে যোগ
              </Button>
            ) : (
              <div
                className="flex items-center justify-between bg-primary/10 rounded-xl px-1"
                data-ocid={`product.qty.${index}`}
              >
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, qty - 1)}
                  className="h-8 w-8 flex items-center justify-center text-primary font-bold rounded-l-xl hover:bg-primary/20 transition-colors"
                  data-ocid={`product.minus.${index}`}
                >
                  −
                </button>
                <span className="font-bold text-primary text-sm">{qty}</span>
                <button
                  type="button"
                  onClick={() => addItem(product)}
                  className="h-8 w-8 flex items-center justify-center text-primary font-bold rounded-r-xl hover:bg-primary/20 transition-colors"
                  data-ocid={`product.plus.${index}`}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
