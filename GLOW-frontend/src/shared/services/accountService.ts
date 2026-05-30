import { API_URL } from "./api";

interface LoginPayload {
    role: string | null;
    username: FormDataEntryValue | null;
    password: FormDataEntryValue | null;
}

export async function login(payload: LoginPayload): Promise<{ access_token: string; user: any }> {
    const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error((await res.json()).message || "Login failed");
    }

    const data = await res.json();
    return data;
}