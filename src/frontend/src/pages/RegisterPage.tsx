// Register page now redirects to login since login handles registration too
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function RegisterPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/login" });
  }, [navigate]);
  return null;
}
