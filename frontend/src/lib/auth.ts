export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface AuthSession {
  access_token: string;
  user: AuthUser;
}

const AUTH_STORAGE_KEY = "ila_auth_session";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setStoredSession(session: AuthSession | null): void {
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }
  window.dispatchEvent(new Event("ila-auth-change"));
}

export async function loginWithCredentials(email: string, password: string): Promise<AuthSession> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid email or password.");
  }

  const data = (await res.json()) as AuthSession;
  setStoredSession(data);
  return data;
}

export async function registerUserAccount(
  name: string,
  email: string,
  password: string
): Promise<AuthSession> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Could not create account.");
  }

  const data = (await res.json()) as AuthSession;
  setStoredSession(data);
  return data;
}

export async function loginWithDemoRole(role: "student" | "instructor"): Promise<AuthSession> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/demo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      const data = (await res.json()) as AuthSession;
      setStoredSession(data);
      return data;
    }
  } catch {
    // Fallback if backend is unreachable
  }

  const fallbackSession: AuthSession =
    role === "instructor"
      ? {
          access_token: "demo-instructor-token",
          user: {
            id: "demo-instructor-1",
            name: "Prof. Nitish Singh (CampusX)",
            email: "instructor@campusx.in",
            role: "instructor",
          },
        }
      : {
          access_token: "demo-student-token",
          user: {
            id: "demo-student-1",
            name: "Alex Rivera",
            email: "alex.rivera@stanford.edu",
            role: "student",
          },
        };

  setStoredSession(fallbackSession);
  return fallbackSession;
}
