import React, { useEffect, useState } from "react";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { useUIStore } from "../store/uiStore";
import { getMyStickers, deleteStickerCloud, shareStickerCloud, unshareStickerCloud, StickerDTO } from "../lib/api/stickers";
import { FolderHeart, Share2, Trash2, Copy, EyeOff, Sparkles, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export const MyStickersPage: React.FC = () => {
  const { showToast } = useUIStore();
  const [stickers, setStickers] = useState<StickerDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStickers = async () => {
    setLoading(true);
    try {
      const data = await getMyStickers();
      setStickers(data);
    } catch (err) {
      console.error("[MyStickers] fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStickers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sticker?")) return;
    try {
      await deleteStickerCloud(id);
      showToast("Sticker deleted.", "info");
      fetchStickers();
    } catch (err) {
      showToast("Failed to delete sticker.", "error");
    }
  };

  const handleShare = async (id: string) => {
    try {
      const res = await shareStickerCloud(id);
      navigator.clipboard.writeText(res.shareUrl);
      showToast("Public link copied to clipboard!", "success");
      fetchStickers();
    } catch (err) {
      showToast("Failed to share sticker.", "error");
    }
  };

  const handleUnshare = async (id: string) => {
    try {
      await unshareStickerCloud(id);
      showToast("Sticker set back to private.", "info");
      fetchStickers();
    } catch (err) {
      showToast("Failed to unshare.", "error");
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-8 py-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <FolderHeart className="w-8 h-8 text-pink-400" /> My Saved Stickers
            </h1>
            <p className="text-sm text-slate-400 mt-1">Manage your saved sticker collection and share links.</p>
          </div>
          <Link to="/editor">
            <Button className="gap-2">
              <Sparkles className="w-4 h-4" /> Create New
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading your sticker collection...</div>
        ) : stickers.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-2xl border border-slate-800 space-y-4">
            <FolderHeart className="w-12 h-12 text-slate-500 mx-auto" />
            <p className="text-base text-slate-300">You haven't saved any stickers yet.</p>
            <Link to="/editor">
              <Button size="sm">Create Your First Sticker</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {stickers.map((st) => (
              <div key={st.id} className="glass-card p-4 rounded-2xl space-y-3">
                <div className="w-full aspect-square checkerboard-pattern rounded-xl overflow-hidden p-2 flex items-center justify-center relative">
                  <img
                    src={st.imageUrl}
                    alt={st.title}
                    className="max-w-full max-h-full object-contain"
                  />
                  {st.isQuarantined && (
                    <span className="absolute top-2 right-2 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Quarantined
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm truncate">{st.title}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(st.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  {st.isPublic ? (
                    <>
                      <Link to={`/s/${st.shareSlug}`} target="_blank" className="flex-1">
                        <Button size="sm" variant="outline" className="w-full text-xs gap-1">
                          <ExternalLink className="w-3.5 h-3.5" /> View
                        </Button>
                      </Link>
                      <Button size="sm" variant="ghost" onClick={() => handleUnshare(st.id)} title="Unshare">
                        <EyeOff className="w-4 h-4 text-amber-400" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => handleShare(st.id)} className="flex-1 text-xs gap-1">
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </Button>
                  )}

                  <Button size="sm" variant="ghost" onClick={() => handleDelete(st.id)} title="Delete">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};
