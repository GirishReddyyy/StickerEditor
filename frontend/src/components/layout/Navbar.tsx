import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Sparkles, Image, FolderHeart, LogIn, LogOut, ShieldAlert } from "lucide-react";
import { Button } from "../ui/Button";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span>Sticker<span className="text-purple-400">Craft</span></span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/templates"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              isActive("/templates") ? "bg-purple-600/20 text-purple-300 border border-purple-500/30" : "text-slate-300 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Templates</span>
          </Link>

          {user && (
            <Link
              to="/my-stickers"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive("/my-stickers") ? "bg-purple-600/20 text-purple-300 border border-purple-500/30" : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <FolderHeart className="w-4 h-4" />
              <span>My Stickers</span>
            </Link>
          )}

          {user?.role === "admin" && (
            <Link
              to="/admin/reports"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive("/admin/reports") ? "bg-red-600/20 text-red-300 border border-red-500/30" : "text-red-400 hover:bg-red-950/30"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Queue</span>
            </Link>
          )}

          <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-400 hidden md:inline font-mono">
                @{user.username}
              </span>
              <Button variant="ghost" size="sm" onClick={logout} className="gap-1 text-slate-400 hover:text-red-400">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm" className="gap-1.5">
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
