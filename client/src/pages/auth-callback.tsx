import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const VALID_MAGIC_LINK_TYPES = ["magiclink", "signup", "recovery"];

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const errorShownRef = useRef(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      // Brief delay to avoid flash from bfcache or delayed hash
      const t = setTimeout(() => {
        if (!errorShownRef.current) {
          errorShownRef.current = true;
          setStatus("error");
          setErrorMessage("No authentication data found. Please try logging in again.");
        }
      }, 150);
      return () => clearTimeout(t);
    }

    const params = new URLSearchParams(hash.slice(1));
    const accessToken = params.get("access_token");
    const type = params.get("type");

    if (!accessToken) {
      setStatus("error");
      setErrorMessage("Invalid magic link. Please request a new one.");
      return;
    }
    if (type && !VALID_MAGIC_LINK_TYPES.includes(type)) {
      setStatus("error");
      setErrorMessage("Invalid magic link. Please request a new one.");
      return;
    }

    (async () => {
      try {
        const response = await apiRequest("POST", "/api/auth/verify", { accessToken });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || "Verification failed");
        }
        const result = await response.json();
        if (result.token && result.vendor) {
          await login(result.token, result.vendor);
          setStatus("success");
          setLocation(result.isNewUser ? "/onboarding" : "/dashboard");
        } else {
          throw new Error("Invalid response");
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "Could not sign you in. Please try again.");
      }
    })();
  }, [login, setLocation]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Signing you in...</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Sign in failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 text-center">{errorMessage}</p>
            <Button className="w-full" onClick={() => setLocation("/login")}>
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
