import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useProfile } from "../contexts/ProfileContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveProfile } from "../hooks/useQueries";

export function RegisterPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn, isLoginSuccess, identity } =
    useInternetIdentity();
  const { actor } = useActor();
  const { setProfile } = useProfile();
  const saveProfileMutation = useSaveProfile();

  const [form, setForm] = useState({ name: "", phone: "", village: "" });
  const [step, setStep] = useState<"form" | "login">("form");
  const [saving, setSaving] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.village) {
      toast.error("সব তথ্য পূরণ করুন");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      toast.error("সঠিক মোবাইল নম্বর দিন");
      return;
    }
    setStep("login");
    login();
  };

  const doSaveProfile = useCallback(async () => {
    if (!actor || !identity || step !== "login") return;
    setSaving(true);
    try {
      await saveProfileMutation.mutateAsync(form);
      setProfile(form);
      toast.success(`রেজিস্ট্রেশন সফল হয়েছে! স্বাগতম, ${form.name}`);
      navigate({ to: "/" });
    } catch {
      toast.error("প্রোফাইল সংরক্ষণে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  }, [actor, identity, step, form, saveProfileMutation, setProfile, navigate]);

  useEffect(() => {
    if (isLoginSuccess) {
      doSaveProfile();
    }
  }, [isLoginSuccess, doSaveProfile]);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/login" })}
          data-ocid="register.back.button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-bold text-lg">নতুন রেজিস্ট্রেশন</h1>
      </div>

      <div className="max-w-sm mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl card-shadow p-6">
          <div className="text-center mb-6">
            <p className="text-3xl mb-2">👤</p>
            <h2 className="font-bold text-lg">আপনার তথ্য দিন</h2>
            <p className="text-sm text-muted-foreground mt-1">
              একবার রেজিস্ট্রেশন করলেই হবে
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">পুরো নাম *</Label>
              <Input
                id="name"
                placeholder="আপনার নাম লিখুন"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                data-ocid="register.name.input"
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
                required
                data-ocid="register.phone.input"
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
                required
                data-ocid="register.village.input"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold rounded-xl"
              disabled={isLoggingIn || saving}
              data-ocid="register.submit_button"
            >
              {isLoggingIn || saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  অপেক্ষা করুন...
                </>
              ) : (
                "রেজিস্ট্রেশন করুন 🚀"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            ইতিমধ্যে রেজিস্ট্রেশন আছে?{" "}
            <button
              type="button"
              className="text-primary font-semibold"
              onClick={() => navigate({ to: "/login" })}
              data-ocid="register.login.link"
            >
              লগইন করুন
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
