import React, { useEffect, useState } from "react";
import { PageWrapper } from "../components/layout/PageWrapper";
import { apiFetch } from "../lib/api/client";
import { ShieldAlert, CheckCircle, Trash2, UserX } from "lucide-react";
import { Button } from "../ui/Button";
import { useUIStore } from "../store/uiStore";

type ReportedSticker = {
  id: string;
  title: string;
  imagePath: string;
  shareSlug: string;
  reportsCount: number;
  isQuarantined: boolean;
  imageUrl?: string;
};

export const AdminReportsPage: React.FC = () => {
  const { showToast } = useUIStore();
  const [reports, setReports] = useState<ReportedSticker[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<ReportedSticker[]>("/admin/reports");
      setReports(data);
    } catch (err) {
      console.error("[AdminReports] error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (id: string, action: "restore" | "remove") => {
    try {
      await apiFetch(`/admin/reports/${id}/${action}`, { method: "POST" });
      showToast(`Sticker ${action}d successfully.`, "success");
      fetchReports();
    } catch (err) {
      showToast("Action failed.", "error");
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-6 py-4">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-400" /> Admin Safety & Moderation Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1">Review reported shared stickers and enforce safety rules.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading moderation queue...</div>
        ) : reports.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center space-y-3 border border-slate-800">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <p className="text-base text-slate-200">No reported stickers pending review!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((st) => (
              <div key={st.id} className="glass-card p-4 rounded-2xl space-y-4 border border-red-500/40">
                <div className="w-full aspect-square checkerboard-pattern rounded-xl p-2 flex items-center justify-center relative">
                  <img src={st.imageUrl} alt={st.title} className="max-w-full max-h-full object-contain" />
                  <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {st.reportsCount} Reports
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">{st.title}</h3>
                  <span className="text-xs text-red-400 font-mono">
                    {st.isQuarantined ? "Quarantined" : "Under Review"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <Button size="sm" variant="secondary" onClick={() => handleAction(st.id, "restore")} className="gap-1 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Restore
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleAction(st.id, "remove")} className="gap-1 text-xs">
                    <Trash2 className="w-3.5 h-3.5" /> Remove
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
