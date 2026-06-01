import { Outlet, useLocation } from 'react-router-dom';
import BottomNavBar from '../shared/components/BottomNavBar'; 

export default function Layout() {
  const location = useLocation();

  // Add any exact paths here where you DO NOT want the bottom nav to appear
  const hideNavBarPaths = [
    "/user-role-selection", 
  ];

  const shouldShowNavBar = !hideNavBarPaths.includes(location.pathname);

  return (
    <div className={`relative min-h-screen ${shouldShowNavBar ? 'pb-24' : ''}`}>
        
        <main>
            <Outlet />
        </main>

        {shouldShowNavBar && <BottomNavBar />}
    
    </div>
  );
}