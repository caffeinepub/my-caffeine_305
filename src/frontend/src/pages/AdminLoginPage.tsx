import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn, isLoginSuccess, identity, loginStatus } =
    useInternetIdentity();
  const { actor } = useActor();
  const [checking, setChecking] = useState(false);
  const [done, setDone] = useState(false);

  // Trigger admin check when identity is available (either fresh login or stored session)
  const identityReady =
    !!identity &&
    !identity.getPrincipal().isAnonymous() &&
    (isLoginSuccess || loginStatus === "idle");

  useEffect(() => {
    if (!identityReady || !actor || done) return;

    const checkAdmin = async () => {
      setDone(true);
      setChecking(true);
      try {
        try {
          await actor.initializeAdmin();
        } catch {
          // Already initialized or other error — continue to check
        }
        const isAdmin = await actor.isCallerAdmin();
        if (isAdmin) {
          toast.success("অ্যাডমিন হিসেবে লগইন সফল!");
          navigate({ to: "/admin/dashboard" });
        } else {
          toast.error("আপনি অ্যাডমিন নন। প্রথমবার যিনি লগইন করেন তিনিই অ্যাডমিন হন।");
        }
      } catch {
        toast.error("লগইন পরীক্ষায় সমস্যা হয়েছে");
      } finally {
        setChecking(false);
      }
    };

    checkAdmin();
  }, [identityReady, actor, navigate, done]);

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
        <div className="bg-white rounded-2xl card-shadow p-6 space-y-5">
          <div className="text-center">
            <p className="text-4xl mb-3">🔐</p>
            <h2 className="font-bold text-lg">অ্যাডমিন প্যানেল</h2>
            <p className="text-sm text-muted-foreground mt-1">
              শুধুমাত্র অনুমোদিত অ্যাডমিনের জন্য
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
            <p className="font-semibold mb-1">কীভাবে লগইন করবেন:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>নিচের বোতামে ক্লিক করুন</li>
              <li>Internet Identity পপআপ খুলবে</li>
              <li>"Create Passkey" বা ফিঙ্গারপ্রিন্ট বেছে নিন</li>
              <li>প্রথমবার লগইন করলেই অ্যাডমিন হবেন</li>
            </ol>
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold rounded-xl"
            onClick={login}
            disabled={isLoggingIn || checking || loginStatus === "initializing"}
            data-ocid="admin-login.primary_button"
          >
            {isLoggingIn || checking || loginStatus === "initializing" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {checking ? "যাচাই করা হচ্ছে..." : "লোড হচ্ছে..."}
              </>
            ) : (
              "Internet Identity দিয়ে লগইন"
            )}
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
