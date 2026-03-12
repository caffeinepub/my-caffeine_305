import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useProfile } from "../contexts/ProfileContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn, isLoginSuccess, identity, isLoginError } =
    useInternetIdentity();
  const { actor } = useActor();
  const { setProfile, isLoggedIn } = useProfile();
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (!isLoginSuccess || !actor || !identity) return;

    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const profile = await actor.getCallerUserProfile();
        if (profile) {
          setProfile(profile);
          toast.success(`স্বাগতম, ${profile.name}!`);
          navigate({ to: "/" });
        } else {
          navigate({ to: "/register" });
        }
      } catch {
        toast.error("প্রোফাইল লোড করতে সমস্যা হয়েছে");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [isLoginSuccess, actor, identity, setProfile, navigate]);

  useEffect(() => {
    if (isLoginError) {
      toast.error("লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    }
  }, [isLoginError]);

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
        <h1 className="font-bold text-lg">লগইন</h1>
      </div>

      <div className="max-w-sm mx-auto px-4 py-8">
        <div className="text-center mb-8">
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

        <div className="bg-white rounded-2xl card-shadow p-6 space-y-5">
          <div className="text-center">
            <p className="text-sm text-muted-foreground leading-relaxed">
              নিরাপদ লগইনের জন্য Internet Identity ব্যবহার করা হয়। নীচের বাটনে ক্লিক
              করুন।
            </p>
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold rounded-xl"
            onClick={login}
            disabled={isLoggingIn || loadingProfile}
            data-ocid="login.primary_button"
          >
            {isLoggingIn || loadingProfile ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                অপেক্ষা করুন...
              </>
            ) : (
              "🔐 লগইন করুন"
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">নতুন ব্যবহারকারী?</p>
            <button
              type="button"
              className="text-primary font-semibold text-sm mt-1 hover:underline"
              onClick={() => navigate({ to: "/register" })}
              data-ocid="login.register.link"
            >
              রেজিস্ট্রেশন করুন
            </button>
          </div>
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
