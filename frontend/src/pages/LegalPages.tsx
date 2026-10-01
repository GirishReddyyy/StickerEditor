import React from "react";
import { PageWrapper } from "../components/layout/PageWrapper";
import { ShieldCheck, Lock, FileText, LifeBuoy, AlertTriangle } from "lucide-react";

export const PrivacyPolicyPage: React.FC = () => (
  <PageWrapper>
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <Lock className="w-8 h-8 text-emerald-400" />
        <h1 className="text-3xl font-black text-white">Privacy Policy</h1>
      </div>
      <div className="glass-panel p-6 rounded-2xl space-y-4 text-sm text-slate-300 leading-relaxed border border-slate-800">
        <p>
          <strong>1. On-Device Face Processing:</strong> StickerCraft processes your photos locally inside your web browser using MediaPipe and background removal WebAssembly modules. Raw unedited photos are NEVER uploaded, stored, or transmitted to our servers.
        </p>
        <p>
          <strong>2. Saved Sticker Storage:</strong> When you choose to save a sticker to your cloud library, only the finalized composite sticker image (512x512 PNG/WebP) and metadata are uploaded to our secure backend storage.
        </p>
        <p>
          <strong>3. Account Information:</strong> If you register an account, we store your username, email address, and encrypted password hash using industry standard bcrypt protection.
        </p>
        <p className="text-xs text-amber-400 font-mono">
          [Notice: Standard placeholder privacy policy. For commercial release, have this policy reviewed by legal counsel.]
        </p>
      </div>
    </div>
  </PageWrapper>
);

export const TermsPage: React.FC = () => (
  <PageWrapper>
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <FileText className="w-8 h-8 text-purple-400" />
        <h1 className="text-3xl font-black text-white">Terms of Service</h1>
      </div>
      <div className="glass-panel p-6 rounded-2xl space-y-4 text-sm text-slate-300 leading-relaxed border border-slate-800">
        <p>
          <strong>1. Face Permission & Authorization:</strong> You MUST have explicit permission from any individual whose face or image you upload or use to create stickers. Unauthorized use of others' likenesses is strictly prohibited.
        </p>
        <p>
          <strong>2. Acceptable Use:</strong> Users shall not create or share content that is illegal, defamatory, harassing, hateful, or pornographic.
        </p>
        <p>
          <strong>3. Content Moderation:</strong> We reserve the right to quarantine or permanently delete shared stickers that receive safety reports or violate these terms.
        </p>
        <p className="text-xs text-amber-400 font-mono">
          [Notice: Standard placeholder terms of service. For commercial release, have this policy reviewed by legal counsel.]
        </p>
      </div>
    </div>
  </PageWrapper>
);

export const TakedownPage: React.FC = () => (
  <PageWrapper>
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <LifeBuoy className="w-8 h-8 text-pink-400" />
        <h1 className="text-3xl font-black text-white">Takedown & Contact</h1>
      </div>
      <div className="glass-panel p-6 rounded-2xl space-y-4 text-sm text-slate-300 leading-relaxed border border-slate-800">
        <p>
          If you believe your image or face was used in a shared sticker without your permission, or if you hold copyright to an asset used on StickerCraft, please submit a takedown notice.
        </p>
        <div className="bg-slate-900 p-4 rounded-xl font-mono text-xs text-purple-300 space-y-1">
          <p>Email: safety@stickercraft.app</p>
          <p>Response Time: Within 24 hours</p>
        </div>
      </div>
    </div>
  </PageWrapper>
);
