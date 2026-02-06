import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function isAdminUrl(url: string): boolean {
  return url.startsWith("/api/admin") || url === "/api/waitlist/entries";
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = localStorage.getItem('token') || (window as any).__kemispay_token;
  const adminKey = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("admin_api_key") : null;

  const operatorEmail = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("admin_operator_email") : null;
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(isAdminUrl(url) && adminKey ? { "X-Admin-API-Key": adminKey } : {}),
    ...(isAdminUrl(url) && operatorEmail ? { "X-Operator-Email": operatorEmail } : {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const token = localStorage.getItem('token') || (window as any).__kemispay_token;
    const adminKey = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("admin_api_key") : null;

    const operatorEmail = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("admin_operator_email") : null;
    const headers: Record<string, string> = {
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...(isAdminUrl(url) && adminKey ? { "X-Admin-API-Key": adminKey } : {}),
      ...(isAdminUrl(url) && operatorEmail ? { "X-Operator-Email": operatorEmail } : {}),
    };

    const res = await fetch(url, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});