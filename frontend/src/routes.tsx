import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/Home";
import { TemplatesPage } from "./pages/Templates";
import { EditorPage } from "./pages/EditorPage";
import { MyStickersPage } from "./pages/MyStickers";
import { SharedStickerPage } from "./pages/SharedSticker";
import { AuthPage } from "./pages/AuthPage";
import { AdminReportsPage } from "./pages/AdminReportsPage";
import { PrivacyPolicyPage, TermsPage, TakedownPage } from "./pages/LegalPages";
import { useAuthStore } from "./store/authStore";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/templates" element={<TemplatesPage />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/editor/:templateId" element={<EditorPage />} />
      <Route
        path="/my-stickers"
        element={
          <ProtectedRoute>
            <MyStickersPage />
          </ProtectedRoute>
        }
      />
      <Route path="/s/:slug" element={<SharedStickerPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route
        path="/admin/reports"
        element={
          <AdminRoute>
            <AdminReportsPage />
          </AdminRoute>
        }
      />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/takedown" element={<TakedownPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
