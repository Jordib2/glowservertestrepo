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
            const { access_token, user } = await login(payload);
            console.log("Login successful, token:", access_token);
            sessionStorage.setItem("token", access_token);
            sessionStorage.setItem("user", JSON.stringify(user));
            navigate("/image-upload");
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="flex flex-col items-center p-8 bg-[url('../../../public/login-screen-bg.png')] bg-cover bg-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
                <h1 className="text-5xl font-bold tracking-wide text-white drop-shadow-[0_2px_12px_rgba(255,154,60,0.45)] [text-shadow:_0_0_8px_rgba(0,0,0,0.5)]">
                    CONNECT
                </h1>
                <img src="/vector.png" className="mt-[-1.5rem]" />
                <p className="font-bold text-white/90 text-xl max-w-md drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
                    Turn your class into one endless story
                </p>
            </div>

            <div className="flex flex-col items-center w-full mt-auto bg-[#2a1a3a]/40 to-transparent py-10 px-6 rounded-[40px]">
                <h2 className="mb-3 text-2xl font-semibold tracking-wide text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
                    Begin Your Tale
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-md px-10 py-8 bg-no-repeat"
                    style={{
                        backgroundImage: "url('/form_panel.png')",
                        backgroundSize: "100% 100%",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="flex items-center gap-3">
                        <label
                            htmlFor="username"
                            className="w-32 shrink-0 text-white font-bold text-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
                        >
                            Your Name
                        </label>
                        <input
                            id="username"
                            name="username"
                            placeholder="Who seeks entry?"
                            className="flex-1 px-4 py-2 rounded-[20px] bg-white/40 text-base md:text-lg text-[#2a1a3a] placeholder-[#6a5380] outline-none focus:bg-white/60 focus:shadow-[0_0_14px_rgba(168,128,222,0.5)]"
                        />
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                        <label
                            htmlFor="password"
                            className="w-32 shrink-0 text-white font-bold text-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
                        >
                            Secret Word
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className="flex-1 px-4 py-2 rounded-[20px] bg-white/40 text-base md:text-lg text-[#2a1a3a] placeholder-[#6a5380] outline-none focus:bg-white/60 focus:shadow-[0_0_14px_rgba(168,128,222,0.5)]"
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-8 mb-[-1rem] w-full px-20 py-3 text-white rounded-[20px] text-base md:text-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                        style={{
                            background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)",
                        }}
                    >
                        Step Into the Story
                    </button>
                </form>
            </div>
        </div>
    );
}