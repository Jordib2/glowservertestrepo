import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div>
        <header>
            <h1>GLOW Header</h1>
            <h2>[Design in Progress]</h2>
        </header>
        <main>
            <Outlet />
        </main>

        <footer>
            <p>GLOW Footer</p>
        </footer>
    </div>
    );
}