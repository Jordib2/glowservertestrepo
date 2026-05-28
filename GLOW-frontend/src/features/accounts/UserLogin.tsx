import type { Role } from "../../shared/types/role.ts";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { login } from "../../shared/services/accountService.ts";

export default function UserLogin() {
    const role = sessionStorage.getItem("role") as Role | null;
    const navigate = useNavigate();

    useEffect(() => {
        if (!role) {
            navigate("/user-role-selection");
        }
    }, [role, navigate]);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const payload = {
            role,
            username: formData.get("username"),
            password: formData.get("password"),
        };
        try {
            const token = await login(payload);
            console.log("Login successful, token:", token);
            sessionStorage.setItem("token", token);
            navigate("/image-upload");
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-between min-h-screen bg-[url('../../../public/login-screen-bg.png')] bg-cover bg-center">
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-5xl font-bold tracking-wide text-white drop-shadow-[0_2px_12px_rgba(255,154,60,0.45)] [text-shadow:_0_0_8px_rgba(0,0,0,0.5)]">
                    CONNECT
                </h1>
                <img src="/vector.png" className="mt-[-1.5rem]" />
                <p className="font-bold text-white/90 text-xl max-w-md drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
                    Turn your class into one endless story
                </p>
            </div>

            {/* Parchment form */}
            <div className="w-full max-w-sm mt-auto mb-8 px-5">
                <div className="relative">
                    {/* aged magic parchment behind the form */}
                    <img
                        src="/parchment.png"
                        alt=""
                        aria-hidden="true"
                        className="absolute -inset-3 w-[calc(100%+1.5rem)] h-[calc(100%+1.5rem)] object-fill pointer-events-none select-none drop-shadow-[0_12px_30px_rgba(0,0,0,0.6)]"
                    />

                    <form onSubmit={handleSubmit} className="relative z-10 px-9 py-9">
                        <h2 className="mb-7 text-center text-2xl font-semibold tracking-wide text-[#4a3216]">
                            {role === "Teacher" ? "Take up the lantern" : "Open the storybook"}
                        </h2>

                        {/* Username */}
                        <label
                            htmlFor="username"
                            className="block mb-1 text-xs tracking-[0.22em] uppercase text-[#6b4f28]"
                        >
                            Name
                        </label>
                        <input
                            id="username"
                            name="username"
                            placeholder="Who seeks entry?"
                            className="w-full mb-6 px-1 py-2 bg-transparent text-lg text-[#3a2a14] placeholder-[#8a apvalumas] placeholder-[#9a7a4c] border-b-2 border-[#8a6a38]/60 outline-none transition focus:border-[#7c4fa6] focus:shadow-[0_4px_14px_-6px_rgba(124,79,166,0.8)]"
                        />

                        {/* Password */}
                        <label
                            htmlFor="password"
                            className="block mb-1 text-xs tracking-[0.22em] uppercase text-[#6b4f28]"
                        >
                            Secret Word
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className="w-full mb-8 px-1 py-2 bg-transparent text-lg text-[#3a2a14] placeholder-[#9a7a4c] border-b-2 border-[#8a6a38]/60 outline-none transition focus:border-[#7c4fa6] focus:shadow-[0_4px_14px_-6px_rgba(124,79,166,0.8)]"
                        />

                        <button
                            type="submit"
                            className="w-full py-3 rounded-[14px] text-base md:text-lg font-semibold tracking-wide text-amber-50 transition hover:shadow-[0_0_28px_rgba(124,79,166,0.6)] active:scale-[0.99] disabled:opacity-50"
                            style={{
                                background: "linear-gradient(135deg, #2e1746 0%, #5b2f86 55%, #7c4fa6 100%)",
                                border: "1px solid rgba(247,221,154,0.55)",
                                boxShadow:
                                    "inset 0 1px 0 rgba(247,221,154,0.35), 0 6px 18px rgba(0,0,0,0.5)",
                            }}
                        >
                            {role === "Teacher" ? "Enter as Teacher" : "Enter as Storyteller"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}