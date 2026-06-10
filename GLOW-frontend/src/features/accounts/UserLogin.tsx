import type { Role } from "../../shared/types/Role.ts";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { login } from "../../shared/services/accountService.ts";

export default function UserLogin() {
    const role = sessionStorage.getItem("role") as Role | null;
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!role) {
            navigate("/user-role-selection");
        }
    }, [role, navigate]);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const payload = {
            role: role?.toLowerCase() ?? null,
            username: formData.get("username"),
            password: formData.get("password"),
        };
        try {
            const { access_token, user } = await login(payload);
            sessionStorage.setItem("token", access_token);
            sessionStorage.setItem("user", JSON.stringify(user));
            if (role === "student") {
                navigate("/student-profile");
            } else if (role === "teacher") {
                navigate("/teacher-profile");
            }
        } catch (err) {
            console.error("Login failed:", err);
            setError("Invalid credentials");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center p-4 sm:p-8 bg-[url('../../../login-screen-bg.png')] bg-cover bg-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-wide text-white drop-shadow-[0_2px_12px_rgba(255,154,60,0.45)] [text-shadow:_0_0_8px_rgba(0,0,0,0.5)]">
                    CONNECT
                </h1>
                <img src="/vector.png" className="mt-[-1.5rem]" />
                <p className="font-bold text-white/90 text-base sm:text-xl max-w-md text-center drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
                    Turn your class into one endless story
                </p>
            </div>


            <div className="flex flex-col items-center w-full mt-auto bg-[#2a1a3a]/40 to-transparent py-8 sm:py-10 px-4 sm:px-6 rounded-[40px]">
                <h2 className="mb-3 text-xl sm:text-2xl font-semibold tracking-wide text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
                    Begin Your Tale
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-md px-4 sm:px-10 py-4 bg-no-repeat"
                    style={{
                        backgroundImage: "url('/form_panel.png')",
                        backgroundSize: "100% 100%",
                        backgroundPosition: "center",
                    }}
                >
                    {error && (
                        <div
                            role="alert"
                            className="mb-4 px-4 py-2 rounded-[14px] bg-red-900/50 border border-red-400/60 text-white text-center text-sm font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
                        >
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <label
                            htmlFor="username"
                            className="sm:w-28 shrink-0 text-white font-bold text-base sm:text-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            placeholder="Who seeks entry?"
                            className="w-full px-4 py-2 rounded-[20px] bg-white/40 text-base text-[#2a1a3a] placeholder-[#6a5380] outline-none focus:bg-white/60 focus:shadow-[0_0_14px_rgba(168,128,222,0.5)]"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-4">
                        <label
                            htmlFor="password"
                            className="sm:w-28 shrink-0 text-white font-bold text-base sm:text-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
                        >
                            Secret Code
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-2 rounded-[20px] bg-white/40 text-base text-[#2a1a3a] placeholder-[#6a5380] outline-none focus:bg-white/60 focus:shadow-[0_0_14px_rgba(168,128,222,0.5)]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-8 w-full px-4 sm:px-20 py-3 text-white rounded-[20px] text-base sm:text-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                        style={{
                            background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)",
                        }}
                    >
                        {submitting ? "Opening the door…" : "Step Into the Story"}
                    </button>
                </form>

                {role === "student" && (
                    <p className="text-white/80 text-sm mt-2 mb-2">
                        Don't have an account?{" "}
                        <button
                            onClick={() => navigate("/student-register")}
                            className="text-purple-200 underline underline-offset-2 decoration-purple-300 hover:text-white hover:decoration-white focus:outline-none font-semibold transition-colors"
                        >
                            Sign up here →
                        </button>
                    </p>
                )}

                <button
                    onClick={() => navigate("/user-role-selection")}
                    className="mt-2 self-start ml-5 px-10 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-sans text-sm tracking-wider uppercase hover:bg-white/20 transition-all shadow-lg active:scale-95"
                >
                    Back
                </button>
            </div>
        </div>
    );
}