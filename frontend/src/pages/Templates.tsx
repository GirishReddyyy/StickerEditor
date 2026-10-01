import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { Image, Sparkles, Filter } from "lucide-react";

type TemplateItem = {
  id: string;
  name: string;
  category: string;
  image: string;
};

const TEMPLATES: TemplateItem[] = [
  { id: "cat-01", name: "Cheeky Cat", category: "cats", image: "/templates/cat-01.png" },
  { id: "dog-01", name: "Happy Puppy", category: "dogs", image: "/templates/dog-01.png" },
  { id: "meme-01", name: "Superhero Frame", category: "memes", image: "/templates/meme-01.png" },
  { id: "party-cat", name: "Party Cat", category: "cats", image: "/templates/party-cat.png" },
];

export const TemplatesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filtered = selectedCategory === "all"
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <PageWrapper>
      <div className="space-y-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Image className="w-8 h-8 text-purple-400" /> Sticker Template Gallery
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Select a template sticker to start dropping your friends' faces into!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            {["all", "cats", "dogs", "memes"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                  selectedCategory === cat
                    ? "bg-purple-600 border-purple-500 text-white shadow-lg"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((tmpl) => (
            <div key={tmpl.id} className="glass-card p-4 rounded-2xl space-y-4 group">
              <div className="w-full aspect-square checkerboard-pattern rounded-xl overflow-hidden p-2 flex items-center justify-center">
                <img
                  src={tmpl.image}
                  alt={tmpl.name}
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{tmpl.name}</h3>
                  <span className="text-xs text-purple-400 uppercase font-semibold">
                    {tmpl.category}
                  </span>
                </div>
                <Link to={`/editor/${tmpl.id}`}>
                  <Button size="sm" className="gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Use
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};
