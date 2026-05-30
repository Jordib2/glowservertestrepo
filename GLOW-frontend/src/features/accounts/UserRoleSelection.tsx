import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Role } from "../../shared/types/role.ts";

interface UserRoleSelectionProps {
    onChange?: (role: Role | null) => void;
}

const imageFor = (role: Role) =>
    role === "teacher" ? "/roles/teacher-role.png" : "/roles/student-role.png";

export default function UserRoleSelection({ onChange }: UserRoleSelectionProps) {
    const [selected, setSelected] = useState<Role | null>(null);
    const roles: Role[] = ["teacher", "student"];
    const navigate = useNavigate();

    const select = (role: Role) => {
        if (selected) return;
        setSelected(role);
        onChange?.(role);
    };

    useEffect(() => {
        if (!selected) return;
        sessionStorage.setItem("role", selected);
        const timer = setTimeout(() => navigate("/user-login"), 1000);
        return () => clearTimeout(timer);
    }, [selected, navigate]);

    return (
        <div className="flex flex-col items-center justify-between min-h-screen bg-[url('../../../login-screen-bg.png')] bg-cover bg-center">
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-5xl font-bold tracking-wide text-white drop-shadow-[0_2px_12px_rgba(255,154,60,0.45)] [text-shadow:_0_0_8px_rgba(0,0,0,0.5)]">
                    CONNECT
                </h1>
                <img src="/vector.png" className="mt-[-1.5rem]" />
                <p className="font-bold text-white/90 text-xl max-w-md drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
                    Turn your class into one endless story
                </p>
            </div>

            <div className="flex flex-col items-center w-full max-w-md gap-6">
                <h2 className="mt-6 text-2xl font-semibold tracking-wide text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
                    Select Your Role
                </h2>

                <div className="flex flex-col items-center w-full gap-3">
                    {roles.map((role) => {
                        const isSelected = selected === role;
                        const dimmed = selected !== null && !isSelected;
                        return (
                            <button
                                key={role}
                                type="button"
                                onClick={() => select(role)}
                                disabled={selected !== null}
                                aria-pressed={isSelected}
                                aria-label={`Select ${role} role`}
                                className={[
                                    "w-full transition-all duration-500 ease-out focus:outline-none",
                                    isSelected ? "scale-105" : "hover:scale-[1.03]",
                                    dimmed ? "opacity-40 saturate-50" : "opacity-100",
                                ].join(" ")}
                            >
                                <img
                                    src={imageFor(role)}
                                    alt={`${role} role`}
                                    className={[
                                        "w-full h-auto object-contain transition-all duration-500",
                                        isSelected
                                            ? "drop-shadow-[0_0_36px_rgba(232,179,90,0.9)]"
                                            : "drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)]",
                                    ].join(" ")}
                                />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}