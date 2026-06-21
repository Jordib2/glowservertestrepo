import { API_URL } from "./api";

interface LoginPayload {
    role: string | null;
    username: FormDataEntryValue | null;
    password: FormDataEntryValue | null;
}

interface RegisterStudentPayload {
    name: FormDataEntryValue | null;
    username: FormDataEntryValue | null;
    class_name: FormDataEntryValue | null;
    password: FormDataEntryValue | null;
    confirm_password: FormDataEntryValue | null;
    school_name?: FormDataEntryValue | null;
}

export async function login(payload: LoginPayload): Promise<{ access_token: string; user: any }> {
    const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(JSON.stringify(errorData.detail || errorData));
    }

    return res.json();
}

export async function logout(): Promise<void> {
    const token = sessionStorage.getItem("token");
    try {
        if (token) {
            await fetch(`${API_URL}/api/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
        }
    } catch (err) {
        console.warn("Server logout failed, clearing locally anyway:", err);
    } finally {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
    }
}

export async function registerStudent(payload: RegisterStudentPayload): Promise<{ access_token: string; user: any }> {
    const res = await fetch(`${API_URL}/api/register-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errorData = await res.json();
        // De backend stuurt { detail: ... } terug; geef het door als JSON‑string
        throw new Error(JSON.stringify(errorData.detail || errorData));
    }

    return res.json();
}