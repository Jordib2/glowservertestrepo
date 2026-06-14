import { Outlet, useLocation } from 'react-router-dom';
import BottomNavBar from '../shared/components/BottomNavBar'; 
import StudentBottomNavBar from '../shared/components/StudentBottomNavBar';
import backgroundImage from "../assets/background.png";

export default function Layout() {
  const location = useLocation();
  const role = sessionStorage.getItem("role") || "";

  // Add any exact paths here where you DO NOT want the bottom nav to appear
  const hideNavBarPaths = [
    "/user-role-selection",
    "/",
    "/user-login",
    "/review-export-collage",
    "/collage-editor",
    "/student-register"
  ];

  const shouldShowNavBar = !hideNavBarPaths.includes(location.pathname);

  return (
    <div className={`relative min-h-screen ${shouldShowNavBar ? 'pb-24' : ''}`} style={{ backgroundImage: `url(${backgroundImage})` }}>
        
        <main>
            <Outlet />
        </main>

        {shouldShowNavBar && (
            role.toLowerCase() === "student" ? (
                <StudentBottomNavBar />
            ) : (
                <BottomNavBar />
            )
        )}
    
    </div>
  );
}