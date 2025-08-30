// src/components/Navbar.jsx
import React, { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import Button from "./Button";
import { useAuth } from "../store/useAuth";
import { useAlerts } from "../store/useAlerts";

export default function Navbar() {
  const { isAuthed, logout } = useAuth();
  const { rules } = useAlerts();
  const hasTriggered = rules.some((r) => r.triggeredAt);
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const linkBase =
    "relative px-3 py-2 rounded-md text-sm font-medium text-[hsl(var(--text))]/80 hover:text-[hsl(var(--text))]";
  const active =
    "bg-[hsl(var(--surface))] text-[hsl(var(--text))] shadow-inner";

  // close menu after a nav click on mobile
  const close = () => setOpen(false);

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur
                 bg-zinc-900/90 border-b border-[hsl(var(--border))]"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Left: Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/"
            className="font-bold text-lg brand-gradient bg-clip-text text-transparent truncate max-w-[40vw] sm:max-w-none"
            onClick={close}
          >
            CryptoPulse
          </Link>

          {/* Desktop nav (hidden on small screens) */}
          <nav className="hidden sm:flex items-center gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `${linkBase} ${isActive ? active : ""}`}
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/alerts"
              className={({ isActive }) => `${linkBase} ${isActive ? active : ""}`}
            >
              <span className="relative">
                Alerts
                {hasTriggered && (
                  <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-[hsl(var(--down))]" />
                )}
              </span>
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) => `${linkBase} ${isActive ? active : ""}`}
            >
              Settings
            </NavLink>
          </nav>
        </div>

        {/* Right: auth action (desktop) */}
        <div className="hidden sm:flex items-center gap-2">
          {isAuthed ? (
            <Button variant="ghost" onClick={logout}>Logout</Button>
          ) : (
            <NavLink to="/auth" state={{ from: location }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                Login
              </Button>
            </NavLink>
          )}
        </div>

        {/* Hamburger (mobile only) */}
        <button
          className="sm:hidden inline-flex items-center justify-center p-2 rounded-md border border-[hsl(var(--border))] text-[hsl(var(--text))]/80"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {/* Simple burger / close icon */}
          {!open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile slide-down menu */}
      {open && (
        <div className="sm:hidden border-t border-[hsl(var(--border))] bg-zinc-900/95">
          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-2">
            <NavLink
              to="/"
              end
              onClick={close}
              className={({ isActive }) =>
                `${linkBase} block ${isActive ? active : ""}`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/alerts"
              onClick={close}
              className={({ isActive }) =>
                `${linkBase} block ${isActive ? active : ""}`
              }
            >
              <span className="relative">
                Alerts
                {hasTriggered && (
                  <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-[hsl(var(--down))]" />
                )}
              </span>
            </NavLink>

            <NavLink
              to="/settings"
              onClick={close}
              className={({ isActive }) =>
                `${linkBase} block ${isActive ? active : ""}`
              }
            >
              Settings
            </NavLink>

            <div className="pt-2">
              {isAuthed ? (
                <Button variant="ghost" className="w-full" onClick={() => { close(); logout(); }}>
                  Logout
                </Button>
              ) : (
                <NavLink to="/auth" state={{ from: location }} onClick={close}>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold rounded-full shadow-lg"
                  >
                    Login
                  </Button>
                </NavLink>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}