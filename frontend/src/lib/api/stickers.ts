import { apiFetch } from "./client";

export type StickerDTO = {
  id: string;
  userId: string;
  templateId?: string;
  title: string;
  imagePath: string;
  isPublic: boolean;
  shareSlug: string;
  reportsCount: number;
  isQuarantined: boolean;
  createdAt: string;
  imageUrl?: string;
};

export async function saveStickerToCloud(opts: {
  blob: Blob;
  title: string;
  templateId?: string;
}) {
  const formData = new FormData();
  formData.append("file", opts.blob, "sticker.webp");
  formData.append("title", opts.title);
  if (opts.templateId) {
    formData.append("templateId", opts.templateId);
  }

  return apiFetch<StickerDTO>("/stickers", {
    method: "POST",
    body: formData,
  });
}

export async function getMyStickers() {
  return apiFetch<StickerDTO[]>("/stickers");
}

export async function deleteStickerCloud(id: string) {
  return apiFetch<{ message: string }>(`/stickers/${id}`, {
    method: "DELETE",
  });
}

export async function shareStickerCloud(id: string) {
  return apiFetch<{ shareSlug: string; shareUrl: string }>(`/stickers/${id}/share`, {
    method: "POST",
  });
}

export async function unshareStickerCloud(id: string) {
  return apiFetch<{ message: string }>(`/stickers/${id}/unshare`, {
    method: "POST",
  });
}

export async function getSharedStickerBySlug(slug: string) {
  return apiFetch<StickerDTO>(`/stickers/shared/${slug}`);
}

export async function reportSticker(id: string, reason: string) {
  return apiFetch<{ message: string }>(`/stickers/${id}/report`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
