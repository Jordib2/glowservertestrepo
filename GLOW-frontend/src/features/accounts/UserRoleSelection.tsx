import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Role = "Teacher" | "Child";

interface UserRoleSelectionProps {
    onChange?: (role: Role | null) => void;
}

export default function UserRoleSelection({ onChange }: UserRoleSelectionProps) {
    const [selected, setSelected] = useState<Role | null>(null);
    const roles: Role[] = ["Teacher", "Child"];
    const navigate = useNavigate();

    const select = (role: Role) => {
        const next = selected === role ? null : role;
        setSelected(next);
        onChange?.(next);
    };

    return (
        <div className="flex flex-col items-center p-8  bg-[url('../../../public/login-screen-bg.png')] bg-cover bg-center min-h-screen">

            <div className="flex flex-col items-center gap-4">
            <h1 className="text-5xl font-bold text-white shadow-lg">CONNECT</h1>
            <p className="text-gray-600 text-white">Turn your class into one endless story</p>
            </div>

            <div className="flex flex-col items-center gap-4 w-full mt-auto">
            <h2 className="text-2xl font-semibold mt-20 text-white">Select Your Role</h2>

            <div className="flex flex-col gap-3 w-full max-w-md">
                {roles.map((role) => {
                    const isChecked = selected === role;
                    return (
                        <button
                            key={role}
                            type="button"
                            onClick={() => select(role)}
                            className="flex items-center gap-3 p-3 rounded transition"
                        >
                            <span
                                className={`w-6 h-6 border-2 border-white rounded flex items-center justify-center transition ${isChecked ? "border-blue-500" : "border-gray-400"
                                    }`}
                            >
                                {isChecked && (
                                    <svg
                                        className="w-4 h-4 text-white"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </span>
                            <span className="text-white">{role}</span>
                        </button>
                    );
                })}
            </div>

            <button
                type="button"
                disabled={!selected}
                onClick={() => navigate("/user-login")}
                className="w-full px-20 py-3 text-white rounded-[20px] text-base md:text-lg font-semibold hover:opacity-90 transition disabled:opacity-50" 
                style={{
                    background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)"
                }}
            >
                Continue
            </button>
        </div>
        </div>
    );
}