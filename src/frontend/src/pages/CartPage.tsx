import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShoppingBag, Trash2 } from "lucide-react";
import { BottomNav, Header } from "../components/Header";
import { useCart } from "../contexts/CartContext";

export function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, subtotal, totalItems } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-lg mx-auto main-content">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              data-ocid="cart.back.button"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-bold text-xl">আমার কার্ট</h1>
            <span className="text-muted-foreground text-sm">
              ({totalItems}টি পণ্য)
            </span>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20" data-ocid="cart.empty_state">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-semibold text-foreground">
                আপনার কার্ট খালি
              </p>
              <p className="text-muted-foreground text-sm mt-1 mb-6">
                কিছু পণ্য যোগ করুন
              </p>
              <Button
                onClick={() => navigate({ to: "/" })}
                className="bg-primary text-primary-foreground rounded-xl"
                data-ocid="cart.shop.button"
              >
                পণ্য দেখুন
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3" data-ocid="cart.list">
                {items.map((item, i) => (
                  <div
                    key={item.product.id.toString()}
                    className="bg-white rounded-2xl card-shadow p-3 flex gap-3"
                    data-ocid={`cart.item.${i + 1}`}
                  >
                    <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ₹{item.product.price}/{item.product.unit}
                      </p>
                      <p className="text-primary font-bold text-sm mt-1">
                        ₹{(item.product.price * item.quantity).toFixed(0)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <button
                        type="button"
                        onClick={() => removeItem(item.product.id)}
                        className="text-destructive hover:text-destructive/70 transition-colors"
                        data-ocid={`cart.delete_button.${i + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="flex items-center gap-2 bg-primary/10 rounded-xl px-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="h-7 w-7 flex items-center justify-center text-primary"
                          data-ocid={`cart.minus.${i + 1}`}
                        >
                          −
                        </button>
                        <span className="text-primary font-bold text-sm w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="h-7 w-7 flex items-center justify-center text-primary"
                          data-ocid={`cart.plus.${i + 1}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl card-shadow p-4 mt-4 space-y-3">
                <h3 className="font-bold text-base border-b pb-2">
                  অর্ডার সারসংক্ষেপ
                </h3>
                {items.map((item) => (
                  <div
                    key={item.product.id.toString()}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      ₹{(item.product.price * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-bold text-base">
                  <span>সাবটোটাল</span>
                  <span className="text-primary">₹{subtotal.toFixed(0)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  + ডেলিভারি চার্জ চেকআউটে হিসাব হবে
                </p>
              </div>

              <Button
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold rounded-xl"
                onClick={() => navigate({ to: "/checkout" })}
                data-ocid="cart.checkout.primary_button"
              >
                চেকআউট করুন →
              </Button>
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
