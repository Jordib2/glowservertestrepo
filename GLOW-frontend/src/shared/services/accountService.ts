import { API_URL } from "./api";

interface LoginPayload {
    role: string | null;
    username: FormDataEntryValue | null;
    password: FormDataEntryValue | null;
}

export async function login(payload: LoginPayload): Promise<string> {
    const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error("Failed to login");
    }

    const data = await res.json();
    return data.token;
}