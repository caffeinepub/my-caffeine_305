import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { Package, ShoppingCart, User } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useProfile } from "../contexts/ProfileContext";

export function Header() {
  const { totalItems } = useCart();
  const { isLoggedIn, profile } = useProfile();

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        {/* Logo + App Name */}
        <Link to="/" className="flex items-center gap-2" data-ocid="nav.link">
          <img
            src="/assets/generated/logo-transparent.dim_300x300.png"
            alt="লোগো"
            className="h-9 w-9 rounded-full object-cover bg-white"
          />
          <div className="leading-tight">
            <p className="text-xs font-medium opacity-80">আমার</p>
            <p className="text-sm font-bold -mt-0.5">গ্রাম ডেলিভারি</p>
          </div>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link to="/cart" className="relative" data-ocid="nav.cart.link">
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground border-0">
                {totalItems}
              </Badge>
            )}
          </Link>
          {isLoggedIn ? (
            <Link
              to="/orders"
              className="flex items-center gap-1 text-xs"
              data-ocid="nav.orders.link"
            >
              <User className="h-6 w-6" />
              <span className="hidden sm:block">
                {profile?.name?.split(" ")[0]}
              </span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-medium"
              data-ocid="nav.login.link"
            >
              লগইন
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { totalItems } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-[0_-2px_12px_oklch(0_0_0/0.08)] pb-safe max-w-lg mx-auto">
      <div className="flex">
        <Link
          to="/"
          className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-muted-foreground hover:text-primary transition-colors"
          data-ocid="nav.home.link"
        >
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-medium">হোম</span>
        </Link>
        <Link
          to="/cart"
          className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-muted-foreground hover:text-primary transition-colors relative"
          data-ocid="nav.cart.bottom.link"
        >
          <div className="relative">
            <span className="text-xl">🛒</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-accent text-accent-foreground text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">কার্ট</span>
        </Link>
        <Link
          to="/orders"
          className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-muted-foreground hover:text-primary transition-colors"
          data-ocid="nav.orders.bottom.link"
        >
          <Package className="h-5 w-5" />
          <span className="text-[10px] font-medium">অর্ডার</span>
        </Link>
        <Link
          to="/login"
          className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-muted-foreground hover:text-primary transition-colors"
          data-ocid="nav.profile.link"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">প্রোফাইল</span>
        </Link>
      </div>
    </nav>
  );
}
