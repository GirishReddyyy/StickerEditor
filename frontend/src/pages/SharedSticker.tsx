import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { useUIStore } from "../store/uiStore";
import { getSharedStickerBySlug, reportSticker, StickerDTO } from "../lib/api/stickers";
import { triggerDownload } from "../lib/exportSticker";
import { Download, Flag, Sparkles, ShieldAlert, CheckCircle2 } from "lucide-react";

export const SharedStickerPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { showToast } = useUIStore();

  const [sticker, setSticker] = useState<StickerDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportedSubmitted, setReportSubmitted] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getSharedStickerBySlug(slug)
      .then((data) => setSticker(data))
      .catch((err) => {
        console.error("[SharedSticker] error:", err);
        setError("Sticker not found or no longer public.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleDownload = () => {
    if (!sticker?.imageUrl) return;
    fetch(sticker.imageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        triggerDownload(blob, `${sticker.title || "sticker"}.webp`);
        showToast("Downloaded sticker!", "success");
      });
  };

  const handleReportSubmit = async () => {
    if (!sticker || !reportReason) return;
    setIsReporting(true);
    try {
      await reportSticker(sticker.id, reportReason);
      setReportSubmitted(true);
      showToast("Report submitted.", "info");
    } catch (err) {
      showToast("Failed to submit report.", "error");
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto py-10 space-y-8">
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading sticker...</div>
        ) : error ? (
          <div className="glass-panel p-8 rounded-2xl text-center space-y-4 border border-red-500/30">
            <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Sticker Unavailable</h2>
            <p className="text-sm text-slate-400">{error}</p>
            <Link to="/editor">
              <Button size="sm">Create Your Own Sticker</Button>
            </Link>
          </div>
        ) : (
          sticker && (
            <div className="glass-panel p-8 rounded-2xl text-center space-y-6 border border-slate-800 shadow-2xl">
              <div className="w-64 h-64 mx-auto checkerboard-pattern rounded-2xl p-4 flex items-center justify-center border border-slate-700 shadow-lg">
                <img
                  src={sticker.imageUrl}
                  alt={sticker.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              <div>
                <h1 className="text-2xl font-black text-white">{sticker.title}</h1>
                <p className="text-xs text-slate-400 mt-1">Shared custom sticker • 512x512</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button onClick={handleDownload} className="w-full sm:w-auto gap-2">
                  <Download className="w-4 h-4" /> Download Sticker
                </Button>

                <Link to="/editor" className="w-full sm:w-auto">
                  <Button variant="secondary" className="w-full gap-2">
                    <Sparkles className="w-4 h-4" /> Make Your Own
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  onClick={() => setIsReportOpen(true)}
                  className="w-full sm:w-auto text-slate-400 hover:text-red-400 gap-1 text-xs"
                >
                  <Flag className="w-3.5 h-3.5" /> Report
                </Button>
              </div>
            </div>
          )
        )}

        {/* Safety Report Modal */}
        <Modal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} title="Report Shared Sticker">
          <div className="space-y-4">
            {reportedSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <p className="text-sm text-slate-200">
                  Thank you. Your report has been submitted to our moderation team.
                </p>
                <Button size="sm" onClick={() => setIsReportOpen(false)}>
                  Close
                </Button>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-300">
                  If this sticker contains inappropriate content, copyright infringement, or an unauthorized photo of someone, please report it:
                </p>

                <div className="space-y-2">
                  {[
                    "Unauthorized photo of me or someone else",
                    "Inappropriate or offensive content",
                    "Copyright infringement",
                    "Other policy violation",
                  ].map((reason) => (
                    <label
                      key={reason}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 cursor-pointer text-xs font-medium"
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason}
                        checked={reportReason === reason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="accent-purple-600"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                <Button
                  variant="danger"
                  onClick={handleReportSubmit}
                  isLoading={isReporting}
                  disabled={!reportReason}
                  className="w-full gap-2"
                >
                  <ShieldAlert className="w-4 h-4" /> Submit Report
                </Button>
              </>
            )}
          </div>
        </Modal>
      </div>
    </PageWrapper>
  );
};
