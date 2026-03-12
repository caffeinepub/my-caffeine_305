import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { Order } from "../backend.d";
import { BottomNav, Header } from "../components/Header";
import { useCart } from "../contexts/CartContext";
import { useProfile } from "../contexts/ProfileContext";
import { useOrdersByCustomer, useProducts } from "../hooks/useQueries";

const ORDER_SKELETON_KEYS = ["osk1", "osk2", "osk3"];

export function OrdersPage() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { addItem, clearCart } = useCart();
  const { data: orders = [], isLoading } = useOrdersByCustomer(
    profile?.phone ?? "",
  );
  const { data: products = [] } = useProducts();

  const sortedOrders = [...orders].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );

  const handleReorder = (order: Order) => {
    clearCart();
    let addedCount = 0;
    for (const item of order.items) {
      const product = products.find((p) => p.id === item.productId);
      if (product?.available) {
        for (let i = 0; i < item.quantity; i++) {
          addItem(product);
        }
        addedCount++;
      }
    }
    if (addedCount > 0) {
      toast.success("কার্টে পণ্য যোগ করা হয়েছে");
      navigate({ to: "/cart" });
    } else {
      toast.error("পণ্যগুলি বর্তমানে উপলব্ধ নেই");
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString("bn-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <p className="text-3xl mb-3">🔐</p>
        <p className="font-medium text-foreground">অর্ডার দেখতে লগইন করুন</p>
        <Button
          className="mt-4 bg-primary rounded-xl"
          onClick={() => navigate({ to: "/login" })}
          data-ocid="orders.login.button"
        >
          লগইন করুন
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-lg mx-auto main-content">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              data-ocid="orders.back.button"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-bold text-xl">আমার অর্ডার</h1>
          </div>

          {isLoading ? (
            <div className="space-y-3" data-ocid="orders.loading_state">
              {ORDER_SKELETON_KEYS.map((key) => (
                <div key={key} className="bg-white rounded-2xl p-4 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="text-center py-20" data-ocid="orders.empty_state">
              <p className="text-4xl mb-3">📦</p>
              <p className="font-semibold text-foreground">
                এখনো কোনো অর্ডার নেই
              </p>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                প্রথম অর্ডার দিন!
              </p>
              <Button
                className="bg-primary rounded-xl"
                onClick={() => navigate({ to: "/" })}
                data-ocid="orders.shop.button"
              >
                পণ্য দেখুন
              </Button>
            </div>
          ) : (
            <div className="space-y-3" data-ocid="orders.list">
              {sortedOrders.map((order, i) => (
                <div
                  key={order.id.toString()}
                  className="bg-white rounded-2xl card-shadow p-4"
                  data-ocid={`orders.item.${i + 1}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-sm">
                        অর্ডার #{order.id.toString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.timestamp)}
                      </p>
                    </div>
                    <Badge
                      className={`text-xs ${
                        order.status === "Delivered"
                          ? "bg-primary/15 text-primary border-primary/20"
                          : "bg-accent/15 text-accent border-accent/20"
                      }`}
                      variant="outline"
                    >
                      {order.status === "Delivered"
                        ? "✅ ডেলিভারি হয়েছে"
                        : "⏳ মুলতুবি"}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-0.5 mb-3">
                    {order.items.slice(0, 3).map((item) => (
                      <p key={item.productId.toString()}>
                        • {item.productName} × {item.quantity}
                      </p>
                    ))}
                    {order.items.length > 3 && (
                      <p>আরও {order.items.length - 3}টি পণ্য...</p>
                    )}
                  </div>

                  <div className="bg-secondary rounded-xl p-2.5 text-xs space-y-1 mb-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">সাবটোটাল</span>
                      <span>₹{order.subtotal.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        ডেলিভারি ({order.distanceKm.toFixed(1)} কিমি)
                      </span>
                      <span>₹{order.deliveryCharge.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>মোট</span>
                      <span className="text-primary">
                        ₹{order.total.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full rounded-xl border-primary text-primary text-xs"
                    onClick={() => handleReorder(order)}
                    data-ocid={`orders.reorder.button.${i + 1}`}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    পুনরায় অর্ডার করুন
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
