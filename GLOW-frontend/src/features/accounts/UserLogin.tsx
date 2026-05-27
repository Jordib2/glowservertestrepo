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
            password: formData.get("password")
        }

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
    <div className="flex flex-col items-center p-8  bg-[url('../../../public/login-screen-bg.png')] bg-cover bg-center min-h-screen">

        <div className="flex flex-col items-center gap-4">
            <h1 className="text-5xl font-bold text-white shadow-lg">CONNECT</h1>
            <p className="text-gray-600 text-white">Turn your class into one endless story</p>
        </div>

        <div className="flex flex-col items-center gap-4 w-full mt-auto">
            <form onSubmit={handleSubmit} className="w-full max-w-md">
                <div className="flex felx-col itmes-start w-full">
                    <label htmlFor="username" className="text-white text-lg mb-2">Username:</label>
                </div>
                <input 
                    id="username" 
                    name="username" 
                    className="w-full px-4 py-2 rounded-[20px] bg-white/20 text-base text-white md:text-lg focus:outline-none"
                 />

                <div className="flex felx-col itmes-start w-full mt-2">
                    <label htmlFor="password" className="text-white text-lg mb-2">Password:</label>
                </div>
                <input 
                    id="password" 
                    name="password" 
                    className="w-full px-4 py-2 rounded-[20px] bg-white/20 text-base text-white md:text-lg focus:outline-none"
                 />

                <button type="submit" className="mt-5 w-full px-20 py-3 text-white rounded-[20px] text-base md:text-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                    style={{
                        background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)"
                    }}>Login as {role}</button>
            </form>


        </div>
    </div>
);
}