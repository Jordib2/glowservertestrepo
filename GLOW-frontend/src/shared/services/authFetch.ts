import { API_URL } from "./api";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = sessionStorage.getItem("token");
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (res.status === 401) {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.location.replace("/");
    throw new UnauthorizedError();
  }

  return res;
}