import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerStudent } from "../../shared/services/accountService";
import { getSchools } from "../../shared/services/schoolService";
import type { School } from "../../shared/types/School";


function parseServerErrors(detail: any): Record<string, string> {
    const fieldErrors: Record<string, string> = {};

    if (typeof detail === "string") {
        if (detail.toLowerCase().includes("username")) fieldErrors.username = detail;
        else if (detail.toLowerCase().includes("password")) fieldErrors.password = detail;
        else fieldErrors.general = detail;
        return fieldErrors;
    }

    if (Array.isArray(detail)) {
        for (const err of detail) {
            const field = err.loc?.[err.loc.length - 1];  
            if (field) {
                const msg = err.msg
                    .replace("String should have at least", "Must be at least")
                    .replace("characters", "characters");
                fieldErrors[field] = msg.charAt(0).toUpperCase() + msg.slice(1);
            }
        }
        return fieldErrors;
    }

    fieldErrors.general = "An unexpected error occurred. Please try again.";
    return fieldErrors;
}

export default function StudentRegister() {
    const navigate = useNavigate();
    const [schools, setSchools] = useState<School[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState("");

    useEffect(() => {
        getSchools()
            .then(data => setSchools(data))
            .catch(console.error);
    }, []);

    function validateForm(formData: FormData): Record<string, string> {
        const errors: Record<string, string> = {};

        const name = (formData.get("name") as string)?.trim();
        const username = (formData.get("username") as string)?.trim();
        const class_name = (formData.get("class_name") as string)?.trim();
        const password = formData.get("password") as string;
        const confirm = formData.get("confirm_password") as string;

        if (!name || name.length < 2) errors.name = "Name must be at least 2 characters.";
        if (!username || username.length < 3) errors.username = "Username must be at least 3 characters.";
        if (!class_name || class_name.length < 2) errors.class_name = "Class name must be at least 2 characters.";
        if (!password || password.length < 6) errors.password = "Password must be at least 6 characters.";
        if (password !== confirm) errors.confirm_password = "Passwords do not match.";

        return errors;
    }

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFieldErrors({});
        setGeneralError("");

        const formData = new FormData(e.currentTarget);


        const clientErrors = validateForm(formData);
        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            return;
        }

        setSubmitting(true);

        const payload = {
            name: formData.get("name"),
            username: formData.get("username"),
            class_name: formData.get("class_name"),
            school_name: formData.get("school_name") || null,
            password: formData.get("password"),
            confirm_password: formData.get("confirm_password"),
        };

        try {
            const { access_token, user } = await registerStudent(payload);
            sessionStorage.setItem("token", access_token);
            sessionStorage.setItem("user", JSON.stringify(user));
            navigate("/image-upload"); 
        } catch (err: any) {
            console.error("Registration failed:", err);
            let errorData: any = null;
            try {
                errorData = JSON.parse(err.message);
            } catch {
                setGeneralError(err.message || "Registration failed");
                setSubmitting(false);
                return;
            }

            const parsed = parseServerErrors(errorData);
            if (parsed.general) {
                setGeneralError(parsed.general);
            } else {
                setFieldErrors(parsed);
            }
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
                <p className="mb-8 font-bold text-white/90 text-base sm:text-xl max-w-md text-center drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
                    Turn your class into one endless story
                </p>
            </div>

            <div className="flex flex-col items-center w-full mt-auto bg-[#2a1a3a]/40 to-transparent py-8 sm:py-10 px-4 sm:px-6 rounded-[40px]">
                <h2 className="mb-3 text-xl sm:text-2xl font-semibold tracking-wide text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
                    Your New Chapter Begins Here...
                </h2>

                <form onSubmit={handleSubmit} className="w-full max-w-md px-4 sm:px-10 py-4 bg-no-repeat"
                    style={{ backgroundImage: "url('/form_panel.png')", backgroundSize: "100% 100%", backgroundPosition: "center" }}>
                    
                    {generalError && (
                        <div role="alert" className="mb-4 px-4 py-2 rounded-[14px] bg-red-900/50 border border-red-400/60 text-white text-center text-sm font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                            {generalError}
                        </div>
                    )}

                    {/* Name */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <label htmlFor="name" className="sm:w-28 shrink-0 text-white font-bold text-base sm:text-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">Name</label>
                        <div className="w-full">
                            <input id="name" name="name" placeholder="What is your name?"
                                className={`w-full px-4 py-2 rounded-[20px] bg-white/40 text-base text-[#2a1a3a] placeholder-[#6a5380] outline-none focus:bg-white/60 focus:shadow-[0_0_14px_rgba(168,128,222,0.5)] ${fieldErrors.name ? "border-2 border-red-400" : ""}`} />
                            {fieldErrors.name && <p className="text-red-300 text-xs mt-1 ml-2">{fieldErrors.name}</p>}
                        </div>
                    </div>

                    {/* Username */}
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <label htmlFor="username" className="sm:w-28 shrink-0 text-white font-bold text-base sm:text-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">Username</label>
                        <div className="w-full">
                            <input id="username" name="username" placeholder="Create a username?"
                                className={`w-full px-4 py-2 rounded-[20px] bg-white/40 text-base text-[#2a1a3a] placeholder-[#6a5380] outline-none focus:bg-white/60 focus:shadow-[0_0_14px_rgba(168,128,222,0.5)] ${fieldErrors.username ? "border-2 border-red-400" : ""}`} />
                            {fieldErrors.username && <p className="text-red-300 text-xs mt-1 ml-2">{fieldErrors.username}</p>}
                        </div>
                    </div>

                    {/* School */}
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <label htmlFor="school_name" className="sm:w-28 shrink-0 text-white font-bold text-base sm:text-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">School</label>
                        <div className="relative w-full">
                            <select id="school_name" name="school_name" defaultValue=""
                                className="w-full appearance-none px-4 py-2 rounded-[20px] bg-white/40 text-base text-[#2a1a3a] placeholder-[#6a5380] outline-none focus:bg-white/60 focus:shadow-[0_0_14px_rgba(168,128,222,0.5)]">
                                <option value="">Choose your school</option>
                                {schools.map((s) => (
                                    <option key={s.id} value={s.school_name}>{s.school_name}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg width="14" height="8" viewBox="0 0 14 8" fill="none"><path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Classname */}
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <label htmlFor="class_name" className="sm:w-28 shrink-0 text-white font-bold text-base sm:text-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">Class Name</label>
                        <div className="w-full">
                            <input id="class_name" name="class_name" placeholder="What is your class?"
                                className={`w-full px-4 py-2 rounded-[20px] bg-white/40 text-base text-[#2a1a3a] placeholder-[#6a5380] outline-none focus:bg-white/60 focus:shadow-[0_0_14px_rgba(168,128,222,0.5)] ${fieldErrors.class_name ? "border-2 border-red-400" : ""}`} />
                            {fieldErrors.class_name && <p className="text-red-300 text-xs mt-1 ml-2">{fieldErrors.class_name}</p>}
                        </div>
                    </div>

                    {/* Password */}
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <label htmlFor="password" className="sm:w-28 shrink-0 text-white font-bold text-base sm:text-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">Secret Code</label>
                        <div className="w-full">
                            <input id="password" name="password" type="password" placeholder="••••••••"
                                className={`w-full px-4 py-2 rounded-[20px] bg-white/40 text-base text-[#2a1a3a] placeholder-[#6a5380] outline-none focus:bg-white/60 focus:shadow-[0_0_14px_rgba(168,128,222,0.5)] ${fieldErrors.password ? "border-2 border-red-400" : ""}`} />
                            {fieldErrors.password && <p className="text-red-300 text-xs mt-1 ml-2">{fieldErrors.password}</p>}
                        </div>
                    </div>

                    {/* Password check */}
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <label htmlFor="confirm_password" className="sm:w-28 shrink-0 text-white font-bold text-base sm:text-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">Confirm Secret Code</label>
                        <div className="w-full">
                            <input id="confirm_password" name="confirm_password" type="password" placeholder="••••••••"
                                className={`w-full px-4 py-2 rounded-[20px] bg-white/40 text-base text-[#2a1a3a] placeholder-[#6a5380] outline-none focus:bg-white/60 focus:shadow-[0_0_14px_rgba(168,128,222,0.5)] ${fieldErrors.confirm_password ? "border-2 border-red-400" : ""}`} />
                            {fieldErrors.confirm_password && <p className="text-red-300 text-xs mt-1 ml-2">{fieldErrors.confirm_password}</p>}
                        </div>
                    </div>

                    <button type="submit" disabled={submitting}
                        className="mt-8 w-full px-4 sm:px-20 py-3 text-white rounded-[20px] text-base sm:text-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)" }}>
                        {submitting ? "Opening the door…" : "Begin Your Story"}
                    </button>
                </form>

                <p className="text-white/80 text-sm mt-2 mb-2">
                    Already have an account?{" "}
                    <button onClick={() => navigate("/user-login")}
                        className="text-purple-200 underline underline-offset-2 decoration-purple-300 hover:text-white hover:decoration-white focus:outline-none font-semibold transition-colors">
                        Log in here →
                    </button>
                </p>

                <button onClick={() => navigate("/user-role-selection")}
                    className="mt-2 self-start ml-5 px-10 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-sans text-sm tracking-wider uppercase hover:bg-white/20 transition-all shadow-lg active:scale-95">
                    Back
                </button>
            </div>
        </div>
    );
}