import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ADMIN_PASSWORD = "jharkhali2024";
const ADMIN_SESSION_KEY = "admin_logged_in";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!password) {
      toast.error("পাসওয়ার্ড দিন");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_SESSION_KEY, "true");
      toast.success("অ্যাডমিন লগইন সফল!");
      navigate({ to: "/admin/dashboard" });
    } else {
      toast.error("পাসওয়ার্ড ভুল হয়েছে");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          data-ocid="admin-login.back.button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-bold text-lg">অ্যাডমিন লগইন</h1>
      </div>

      <div className="max-w-sm mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-bold text-lg">অ্যাডমিন প্যানেল</h2>
            <p className="text-sm text-muted-foreground mt-1">
              পাসওয়ার্ড দিয়ে প্রবেশ করুন
            </p>
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="পাসওয়ার্ড লিখুন"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="h-12 text-base pr-12 rounded-xl"
              data-ocid="admin-login.password.input"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <Button
            className="w-full bg-primary h-12 text-base font-semibold rounded-xl"
            onClick={handleLogin}
            disabled={loading}
            data-ocid="admin-login.primary_button"
          >
            {loading ? "যাচাই করা হচ্ছে..." : "প্রবেশ করুন"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            গ্রাহক লগইনের জন্য{" "}
            <button
              type="button"
              className="text-primary"
              onClick={() => navigate({ to: "/login" })}
              data-ocid="admin-login.customer.link"
            >
              এখানে ক্লিক করুন
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
