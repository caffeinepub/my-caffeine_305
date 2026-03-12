import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BottomNav, Header } from "../components/Header";
import { useCart } from "../contexts/CartContext";
import { useProfile } from "../contexts/ProfileContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useDeliverySettings, usePlaceOrder } from "../hooks/useQueries";

const JHARKHALI_LAT = 22.1712;
const JHARKHALI_LNG = 88.7373;
const MAX_DISTANCE_KM = 5;

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { profile } = useProfile();
  const { identity } = useInternetIdentity();
  const placeOrderMutation = usePlaceOrder();
  const { data: deliverySettingsData } = useDeliverySettings();

  const forwardRate = deliverySettingsData?.forwardRate ?? 10;
  const reverseRate = deliverySettingsData?.reverseRate ?? 4;

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<bigint | null>(null);

  const distance = location
    ? haversineDistance(
        location.lat,
        location.lng,
        JHARKHALI_LAT,
        JHARKHALI_LNG,
      )
    : null;

  const isOutOfRange = distance !== null && distance > MAX_DISTANCE_KM;
  const forwardCharge = distance ? Math.ceil(distance * forwardRate) : 0;
  const reverseCharge = distance ? Math.ceil(distance * reverseRate) : 0;
  const deliveryCharge = forwardCharge + reverseCharge;
  const total = subtotal + deliveryCharge;

  const detectLocation = () => {
    setDetectingLocation(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setDetectingLocation(false);
      },
      () => {
        setLocationError("অবস্থান শনাক্ত করা যায়নি। অনুমতি দিন এবং আবার চেষ্টা করুন।");
        setDetectingLocation(false);
      },
    );
  };

  const buildWhatsAppMessage = () => {
    const itemLines = items
      .map(
        (i) =>
          `\u2022 ${i.product.name} \u00d7 ${i.quantity} = \u20b9${(i.product.price * i.quantity).toFixed(0)}`,
      )
      .join("\n");

    return [
      "\ud83d\uded2 \u09a8\u09a4\u09c1\u09a8 \u0985\u09b0\u09cd\u09a1\u09be\u09b0 - \u0986\u09ae\u09be\u09b0 \u0997\u09cd\u09b0\u09be\u09ae \u09a1\u09c7\u09b2\u09bf\u09ad\u09be\u09b0\u09bf",
      "",
      `\ud83d\udc64 \u09a8\u09be\u09ae: ${profile?.name ?? "\u2014"}`,
      `\ud83d\udcf1 \u09ab\u09cb\u09a8: ${profile?.phone ?? "\u2014"}`,
      `\ud83c\udfd8\ufe0f \u0997\u09cd\u09b0\u09be\u09ae: ${profile?.village ?? "\u2014"}`,
      "",
      "\ud83d\udce6 \u0985\u09b0\u09cd\u09a1\u09be\u09b0 \u09a4\u09be\u09b2\u09bf\u0995\u09be:",
      itemLines,
      "",
      `\ud83d\udcb0 \u09b8\u09be\u09ac\u099f\u09cb\u099f\u09be\u09b2: \u20b9${subtotal.toFixed(0)}`,
      `\ud83d\ude9a \u09a1\u09c7\u09b2\u09bf\u09ad\u09be\u09b0\u09bf \u099a\u09be\u09b0\u09cd\u099c: \u20b9${deliveryCharge} (${distance?.toFixed(1)} \u0995\u09bf\u09ae\u09bf)`,
      `\ud83d\udcb5 \u09ae\u09cb\u099f: \u20b9${total.toFixed(0)}`,
      "",
      `\ud83d\udccd \u0985\u09ac\u09b8\u09cd\u09a5\u09be\u09a8: ${location?.lat.toFixed(6)}, ${location?.lng.toFixed(6)}`,
    ].join("\n");
  };

  const handleWhatsAppOrder = async () => {
    if (!profile) {
      toast.error("অর্ডার দিতে আগে লগইন করুন");
      navigate({ to: "/login" });
      return;
    }
    if (!location) {
      toast.error("আগে আপনার অবস্থান শনাক্ত করুন");
      return;
    }
    if (isOutOfRange) {
      toast.error("আপনার এলাকায় ডেলিভারি সম্ভব নয়");
      return;
    }

    try {
      const orderItems = items.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
        unit: i.product.unit,
      }));

      const id = await placeOrderMutation.mutateAsync({
        customerId: identity?.getPrincipal().toString() ?? "guest",
        customerName: profile.name,
        customerPhone: profile.phone,
        village: profile.village,
        items: orderItems,
        subtotal,
        distanceKm: distance!,
        deliveryCharge,
        total,
        latitude: location.lat,
        longitude: location.lng,
      });

      setOrderId(id);
      setOrderPlaced(true);

      const msg = buildWhatsAppMessage();
      window.open(
        `https://wa.me/916294665478?text=${encodeURIComponent(msg)}`,
        "_blank",
      );

      clearCart();
    } catch {
      toast.error("অর্ডার দিতে সমস্যা হয়েছে, WhatsApp-এ সরাসরি মেসেজ করুন");
      const msg = buildWhatsAppMessage();
      window.open(
        `https://wa.me/916294665478?text=${encodeURIComponent(msg)}`,
        "_blank",
      );
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            অর্ডার সম্পন্ন!
          </h2>
          <p className="text-muted-foreground text-sm mb-2">
            অর্ডার নম্বর: #{orderId?.toString()}
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            WhatsApp-এ মেসেজ পাঠানো হয়েছে। শীঘ্রই ডেলিভারি পাবেন।
          </p>
          <div className="space-y-3">
            <Button
              className="w-full bg-primary text-primary-foreground rounded-xl"
              onClick={() => navigate({ to: "/orders" })}
              data-ocid="checkout.orders.button"
            >
              আমার অর্ডার দেখুন
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-xl"
              onClick={() => navigate({ to: "/" })}
              data-ocid="checkout.home.button"
            >
              হোমে ফিরুন
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <p className="text-4xl mb-3">🛒</p>
        <p className="font-medium">কার্ট খালি</p>
        <Button
          className="mt-4 rounded-xl"
          onClick={() => navigate({ to: "/" })}
        >
          পণ্য দেখুন
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-lg mx-auto main-content">
        <div className="px-4 py-4 space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/cart" })}
              data-ocid="checkout.back.button"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-bold text-xl">চেকআউট</h1>
          </div>

          <div className="bg-white rounded-2xl card-shadow p-4">
            <h3 className="font-bold text-sm mb-3 text-muted-foreground">
              📦 অর্ডার তালিকা
            </h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.product.id.toString()}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    ₹{(item.product.price * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-2 flex justify-between font-bold">
              <span>সাবটোটাল</span>
              <span className="text-primary">₹{subtotal.toFixed(0)}</span>
            </div>
          </div>

          {profile && (
            <div className="bg-white rounded-2xl card-shadow p-4">
              <h3 className="font-bold text-sm mb-2 text-muted-foreground">
                👤 গ্রাহক তথ্য
              </h3>
              <p className="text-sm">
                {profile.name} | {profile.phone}
              </p>
              <p className="text-sm text-muted-foreground">{profile.village}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl card-shadow p-4 space-y-3">
            <h3 className="font-bold text-sm text-muted-foreground">
              📍 ডেলিভারি অবস্থান
            </h3>

            <Button
              variant="outline"
              className="w-full rounded-xl border-primary text-primary"
              onClick={detectLocation}
              disabled={detectingLocation}
              data-ocid="checkout.location.button"
            >
              {detectingLocation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  শনাক্ত করা হচ্ছে...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  আমার অবস্থান শনাক্ত করুন
                </>
              )}
            </Button>

            {locationError && (
              <div
                className="flex gap-2 items-start text-destructive text-sm"
                data-ocid="checkout.location.error_state"
              >
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>{locationError}</p>
              </div>
            )}

            {location && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  অবস্থান: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>

                {isOutOfRange ? (
                  <div
                    className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex gap-2"
                    data-ocid="checkout.range.error_state"
                  >
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive font-medium">
                      দুঃখিত! আমরা এখন শুধু ঝড়খালি বাজার থেকে ৫ কিমি এর মধ্যে ডেলিভারি
                      করি। আপনার দূরত্ব: {distance?.toFixed(1)} কিমি।
                    </p>
                  </div>
                ) : (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        ডেলিভারি দূরত্ব
                      </span>
                      <span className="font-medium">
                        {distance?.toFixed(1)} কিমি
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        ফরওয়ার্ড (₹{forwardRate}/কিমি)
                      </span>
                      <span>₹{forwardCharge}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        রিভার্স (₹{reverseRate}/কিমি)
                      </span>
                      <span>₹{reverseCharge}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold border-t pt-1.5">
                      <span>মোট ডেলিভারি</span>
                      <span className="text-primary">₹{deliveryCharge}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base border-t pt-1.5">
                      <span>মোট পরিশোধযোগ্য</span>
                      <span className="text-primary">₹{total.toFixed(0)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {!profile && (
            <Button
              className="w-full h-12 rounded-xl"
              onClick={() => navigate({ to: "/login" })}
              data-ocid="checkout.login.button"
            >
              অর্ডার দিতে লগইন করুন
            </Button>
          )}

          {profile && location && !isOutOfRange && (
            <Button
              className="w-full h-14 rounded-xl text-white font-bold text-base btn-whatsapp"
              onClick={handleWhatsAppOrder}
              disabled={placeOrderMutation.isPending}
              data-ocid="checkout.whatsapp.primary_button"
            >
              {placeOrderMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  অর্ডার দেওয়া হচ্ছে...
                </>
              ) : (
                "💬 WhatsApp-এ অর্ডার দিন"
              )}
            </Button>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
