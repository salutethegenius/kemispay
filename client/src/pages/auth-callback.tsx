import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const hash = window.location.hash;
    // #region agent log
    fetch('http://127.0.0.1:7255/ingest/6b597c48-09d7-4176-b1b0-b57a5a5a9f64',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-callback.tsx:useEffect',message:'Hash check',data:{hasHash:!!hash,hashLen:hash?.length||0},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    if (!hash) {
      setStatus("error");
      setErrorMessage("No authentication data found. Please try logging in again.");
      return;
    }

    const params = new URLSearchParams(hash.slice(1));
    const accessToken = params.get("access_token");
    const type = params.get("type");
    // #region agent log
    fetch('http://127.0.0.1:7255/ingest/6b597c48-09d7-4176-b1b0-b57a5a5a9f64',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-callback.tsx:params',message:'Extracted params',data:{hasAccessToken:!!accessToken,type,paramKeys:Array.from(params.keys())},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    if (!accessToken || type !== "magiclink") {
      setStatus("error");
      setErrorMessage("Invalid magic link. Please request a new one.");
      return;
    }

    (async () => {
      try {
        const response = await apiRequest("POST", "/api/auth/verify", { accessToken });
        // #region agent log
        fetch('http://127.0.0.1:7255/ingest/6b597c48-09d7-4176-b1b0-b57a5a5a9f64',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-callback.tsx:verify',message:'Verify response',data:{ok:response.ok,status:response.status},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || "Verification failed");
        }
        const result = await response.json();
        // #region agent log
        fetch('http://127.0.0.1:7255/ingest/6b597c48-09d7-4176-b1b0-b57a5a5a9f64',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-callback.tsx:result',message:'Verify result',data:{hasToken:!!result.token,hasVendor:!!result.vendor,isNewUser:result.isNewUser},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
        // #endregion
        if (result.token && result.vendor) {
          await login(result.token, result.vendor);
          setStatus("success");
          setLocation(result.isNewUser ? "/onboarding" : "/dashboard");
        } else {
          throw new Error("Invalid response");
        }
      } catch (err: any) {
        // #region agent log
        fetch('http://127.0.0.1:7255/ingest/6b597c48-09d7-4176-b1b0-b57a5a5a9f64',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-callback.tsx:catch',message:'Verify error',data:{message:err?.message},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
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
