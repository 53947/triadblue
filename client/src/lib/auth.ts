import { apiRequest } from "./queryClient";

let authCheckPromise: Promise<boolean> | null = null;

export async function checkAuth(): Promise<boolean> {
  if (authCheckPromise) {
    return authCheckPromise;
  }

  authCheckPromise = (async () => {
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      return response.ok;
    } catch {
      return false;
    }
  })();

  const result = await authCheckPromise;
  authCheckPromise = null;
  return result;
}

export async function login(password: string): Promise<{ success: boolean; error?: string }> {
  try {
    await apiRequest("POST", "/api/auth/login", { password });
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error?.message || "Login failed" 
    };
  }
}

export async function logout(): Promise<void> {
  try {
    await apiRequest("POST", "/api/auth/logout", {});
  } catch (error) {
    console.error("Logout error:", error);
  }
}
