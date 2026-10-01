import React from "react";
import { Link } from "react-router-dom";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { Sparkles, Scissors, ShieldCheck, Zap, Image, ArrowRight, Heart } from "lucide-react";

export const HomePage: React.FC = () => {
  return (
    <PageWrapper>
      <div className="space-y-16 py-8">
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-6 pt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/15 border border-purple-500/30 text-purple-300 text-xs font-semibold tracking-wide uppercase shadow-lg shadow-purple-500/10">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Browser-First Face Sticker Studio</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Turn your friends' faces into <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">hilarious stickers</span>
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed">
            Drop faces into funny sticker templates. Auto-detect faces, remove background in seconds, draw smooth vector edge cuts, and export 512x512 WhatsApp & Telegram stickers.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/editor/cat-01">
              <Button size="lg" className="gap-2 shadow-xl shadow-purple-600/30 glow-purple">
                <span>Start Crafting Now</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/templates">
              <Button size="lg" variant="secondary" className="gap-2">
                <Image className="w-5 h-5" />
                <span>Browse Gallery</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">1. Auto AI Face Fit</h3>
            <p className="text-sm text-slate-400">
              MediaPipe AI finds face landmarks, crops hair/ears, and imgly strips background automatically.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center">
              <Scissors className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">2. Free-Draw Vector Cut</h3>
            <p className="text-sm text-slate-400">
              Draw a rough outline around any edge. Paper.js smooths your line into a sleek Bezier curve with soft feathering.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">3. 100% On-Device Privacy</h3>
            <p className="text-sm text-slate-400">
              Raw photos of your friends NEVER leave your browser or get uploaded to servers. Total privacy guaranteed.
            </p>
          </div>
        </div>

        {/* Featured Template Cards */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Popular Templates</h2>
            <Link to="/templates" className="text-sm font-semibold text-purple-400 hover:text-purple-300">
              View All Templates →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { id: "cat-01", name: "Cheeky Cat", image: "/templates/cat-01.png", category: "Cats" },
              { id: "dog-01", name: "Happy Puppy", image: "/templates/dog-01.png", category: "Dogs" },
              { id: "meme-01", name: "Superhero Frame", image: "/templates/meme-01.png", category: "Memes" },
              { id: "party-cat", name: "Party Cat", image: "/templates/party-cat.png", category: "Cats" },
            ].map((tmpl) => (
              <Link key={tmpl.id} to={`/editor/${tmpl.id}`}>
                <div className="glass-card p-4 rounded-2xl space-y-3 group cursor-pointer">
                  <div className="w-full aspect-square checkerboard-pattern rounded-xl overflow-hidden p-2 flex items-center justify-center">
                    <img
                      src={tmpl.image}
                      alt={tmpl.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base">{tmpl.name}</h4>
                      <span className="text-xs text-purple-400 uppercase tracking-wider font-semibold">
                        {tmpl.category}
                      </span>
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs">
                      Use →
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
