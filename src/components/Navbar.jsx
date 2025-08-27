import { NavLink } from 'react-router-dom';
import Button from './Button';
// import { Github } from 'lucide-react';
import {useAuth } from '../store/useAuth';
// /import  useLocal  from '../store/useLocal';


const linkBase =
  "px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800";
const active = "bg-zinc-300 dark:bg-zinc-700";
// const {rules} = useAlerts();
// const hasTriggered = rules.some(r=> !!r.triggeredAt);

export default function Navbar() {
    const {isAuthed , login , logout} = useAuth();
  return (
    <header className="border-b dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-6">
          <span className="text-lg font-semibold">
            <span className="brand-gradient bg-clip-text text-transparent">CryptoPulse</span>
          </span>
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? active : ""}`}>Dashboard</NavLink>
            <NavLink to="/alerts" className={({ isActive }) => `${linkBase} ${isActive ? active : ""}`}>Alerts</NavLink>
            <NavLink to="/settings" className={({ isActive }) => `${linkBase} ${isActive ? active : ""}`}>Settings</NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-2">
         {isAuthed ? (
       <>
      <NavLink to="/alerts" className={({ isActive }) => `${linkBase} ${isActive ? active : ""}`}>Alerts 
      {/* {hasTriggered && <span className='absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[hsl(var(--down))]' />} */}
      </NavLink>
      <Button variant="ghost" onClick={logout}>Logout</Button>
    </>
  ) : (
    
    <NavLink to="/auth" className={({ isActive }) => `${linkBase} ${isActive ? active : ""}`}>
      Login
    </NavLink>
    
    
  )}
</div>
      </div>
    </header>
  );
}