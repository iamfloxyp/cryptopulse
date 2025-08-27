// src/components/Navbar.jsx
import { NavLink, Link } from "react-router-dom";
import Button from "./Button";
import { useAuth } from "../store/useAuth";
import { useAlerts } from "../store/useAlerts";
import { useLocation } from "react-router-dom";

export default function Navbar() {
  const { isAuthed, logout } = useAuth();
  const { rules } = useAlerts();
  const hasTriggered = rules.some(r => r.triggeredAt);
  const location = useLocation();
  const toAuth = `/auth?redirect=${encodeURIComponent(location.pathname)}`;

  const linkBase =
    "relative px-3 py-2 rounded-md text-sm font-medium text-[hsl(var(--text))]/80 hover:text-[hsl(var(--text))]";
  const active =
    "bg-[hsl(var(--surface))] text-[hsl(var(--text))] shadow-inner";

  return (
    <header className="sticky top-0 z-40 backdrop-blur 
                       bg-zinc-900/90  /* dark background always */
                       border-b border-[hsl(var(--border))]">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        
        {/* Left: Brand + nav */}
        <div className="flex items-center gap-6">
          {/* Brand logo restored to original color */}
          <Link
            to="/"
            className="font-bold text-lg brand-gradient bg-clip-text text-transparent"
          >
            CryptoPulse
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : ""}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/alerts"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : ""}`
              }
            >
              Alerts
              {hasTriggered && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[hsl(var(--down))]" />
              )}
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : ""}`
              }
            >
              Settings
            </NavLink>
          </nav>
        </div>

        {/* Right: auth actions */}
        <div className="flex items-center gap-2">
          {isAuthed ? (
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          ) : (
            <NavLink to="/auth" state={{from: location}} className= "text-blue-500 hover:underline">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                Login
              </Button>
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}