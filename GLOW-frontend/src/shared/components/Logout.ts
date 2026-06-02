import { useNavigate } from "react-router-dom";
import { logout } from "../services/accountService";

export function useLogout() {
    const navigate = useNavigate();
    return async () => {
        await logout();
        navigate("/user-role-selection");
    };
}