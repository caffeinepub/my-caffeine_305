import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useProfile } from "../contexts/ProfileContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { setProfile, isLoggedIn } = useProfile();
  const [form, setForm] = useState({ name: "", phone: "", village: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.village) {
      toast.error("সব তথ্য পূরণ করুন");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      toast.error("সঠিক ১০ সংখ্যার মোবাইল নম্বর দিন");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    setProfile({ name: form.name, phone: form.phone, village: form.village });
    toast.success(`স্বাগতম, ${form.name}!`);
    navigate({ to: "/" });
    setLoading(false);
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-2xl mb-2">✅</p>
          <p className="font-medium">আপনি ইতিমধ্যে লগইন করেছেন</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/" })}>
            হোমে যান
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          data-ocid="login.back.button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-bold text-lg">লগইন / রেজিস্ট্রেশন</h1>
      </div>

      <div className="max-w-sm mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <img
            src="/assets/generated/logo-transparent.dim_300x300.png"
            alt="লোগো"
            className="h-20 w-20 mx-auto rounded-full object-cover shadow-md"
          />
          <h2 className="mt-4 text-xl font-bold text-foreground">
            আমার গ্রাম ডেলিভারি
          </h2>
          <p className="text-muted-foreground text-sm mt-1">তাজা পণ্য আপনার দরজায়</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <p className="text-sm text-muted-foreground text-center mb-5">
            আপনার তথ্য দিন এবং সরাসরি অর্ডার করুন
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">পুরো নাম *</Label>
              <Input
                id="name"
                placeholder="আপনার নাম লিখুন"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="login.name.input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">মোবাইল নম্বর *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="১০ সংখ্যার মোবাইল নম্বর"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                maxLength={10}
                data-ocid="login.phone.input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="village">গ্রামের নাম *</Label>
              <Input
                id="village"
                placeholder="আপনার গ্রামের নাম"
                value={form.village}
                onChange={(e) =>
                  setForm((f) => ({ ...f, village: e.target.value }))
                }
                data-ocid="login.village.input"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary h-12 text-base font-semibold rounded-xl"
              disabled={loading}
              data-ocid="login.primary_button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  অপেক্ষা করুন...
                </>
              ) : (
                "✅ প্রবেশ করুন"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-muted-foreground">
          অ্যাডমিন?{" "}
          <button
            type="button"
            className="text-primary font-medium hover:underline"
            onClick={() => navigate({ to: "/admin" })}
            data-ocid="login.admin.link"
          >
            অ্যাডমিন প্যানেল
          </button>
        </p>
      </div>
    </div>
  );
}
