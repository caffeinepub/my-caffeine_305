import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import type { UserProfile } from "../backend.d";

interface ProfileContextType {
  profile: UserProfile | null;
  setProfile: (p: UserProfile | null) => void;
  isLoggedIn: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("amgd_profile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setProfile = useCallback((p: UserProfile | null) => {
    setProfileState(p);
    if (p) {
      localStorage.setItem("amgd_profile", JSON.stringify(p));
    } else {
      localStorage.removeItem("amgd_profile");
    }
  }, []);

  return (
    <ProfileContext.Provider
      value={{ profile, setProfile, isLoggedIn: !!profile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
