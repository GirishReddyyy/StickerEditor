import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, FileText, LifeBuoy } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950/80 py-8 text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Client-Side Face Privacy Protected • Zero Photo Cloud Storage</span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/privacy" className="hover:text-purple-400 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-purple-400 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Terms of Service
          </Link>
          <Link to="/takedown" className="hover:text-purple-400 flex items-center gap-1">
            <LifeBuoy className="w-3.5 h-3.5" /> Takedown & Contact
          </Link>
        </div>

        <div className="text-slate-500 font-mono">
          © {new Date().getFullYear()} StickerCraft. 512x512 WebP/PNG Standard.
        </div>
      </div>
    </footer>
  );
};
