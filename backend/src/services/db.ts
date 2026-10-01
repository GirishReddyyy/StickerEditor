import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export type UserRecord = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type TemplateRecord = {
  id: string;
  name: string;
  category: string;
  imagePath: string;
  size: number;
  faceSlots: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    mask?: string;
  }>;
  isPublished: boolean;
  createdAt: string;
};

export type StickerRecord = {
  id: string;
  userId: string;
  templateId?: string | null;
  title: string;
  imagePath: string; // relative file path in uploads
  isPublic: boolean;
  shareSlug: string;
  reportsCount: number;
  isQuarantined: boolean;
  createdAt: string;
};

export type PackRecord = {
  id: string;
  userId: string;
  title: string;
  isPublic: boolean;
  stickerIds: string[];
  createdAt: string;
};

export type ReportRecord = {
  id: string;
  stickerId: string;
  reason: string;
  createdAt: string;
};

type Schema = {
  users: UserRecord[];
  templates: TemplateRecord[];
  stickers: StickerRecord[];
  packs: PackRecord[];
  reports: ReportRecord[];
};

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const DEFAULT_TEMPLATES: TemplateRecord[] = [
  {
    id: "cat-01",
    name: "Cheeky Cat",
    category: "cats",
    imagePath: "/templates/cat-01.png",
    size: 512,
    faceSlots: [
      { x: 176, y: 110, width: 160, height: 160, rotation: 0 }
    ],
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "dog-01",
    name: "Happy Puppy",
    category: "dogs",
    imagePath: "/templates/dog-01.png",
    size: 512,
    faceSlots: [
      { x: 160, y: 130, width: 190, height: 190, rotation: -5 }
    ],
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "meme-01",
    name: "Superhero Frame",
    category: "memes",
    imagePath: "/templates/meme-01.png",
    size: 512,
    faceSlots: [
      { x: 180, y: 100, width: 150, height: 150, rotation: 3 }
    ],
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "party-cat",
    name: "Party Cat",
    category: "cats",
    imagePath: "/templates/party-cat.png",
    size: 512,
    faceSlots: [
      { x: 170, y: 150, width: 170, height: 170, rotation: 0 }
    ],
    isPublished: true,
    createdAt: new Date().toISOString(),
  }
];

class SafeDatabase {
  private data: Schema = {
    users: [],
    templates: DEFAULT_TEMPLATES,
    stickers: [],
    packs: [],
    reports: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        this.data = {
          users: parsed.users || [],
          templates: parsed.templates?.length ? parsed.templates : DEFAULT_TEMPLATES,
          stickers: parsed.stickers || [],
          packs: parsed.packs || [],
          reports: parsed.reports || [],
        };
      } catch (err) {
        console.error("[DB Init Error] Resetting db file:", err);
        this.save();
      }
    } else {
      this.save();
    }
  }

  private save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
  }

  // User Operations
  findUserByEmail(email: string): UserRecord | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): UserRecord | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  createUser(username: string, email: string, passwordHash: string): UserRecord {
    const user: UserRecord = {
      id: uuidv4(),
      username,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(user);
    this.save();
    return user;
  }

  // Template Operations
  getTemplates(category?: string): TemplateRecord[] {
    if (category) {
      return this.data.templates.filter(
        (t) => t.isPublished && t.category.toLowerCase() === category.toLowerCase()
      );
    }
    return this.data.templates.filter((t) => t.isPublished);
  }

  getTemplateById(id: string): TemplateRecord | undefined {
    return this.data.templates.find((t) => t.id === id);
  }

  // Sticker Operations
  createSticker(sticker: Omit<StickerRecord, "id" | "reportsCount" | "isQuarantined" | "createdAt">): StickerRecord {
    const record: StickerRecord = {
      ...sticker,
      id: uuidv4(),
      reportsCount: 0,
      isQuarantined: false,
      createdAt: new Date().toISOString(),
    };
    this.data.stickers.push(record);
    this.save();
    return record;
  }

  getUserStickers(userId: string): StickerRecord[] {
    return this.data.stickers
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getStickerById(id: string): StickerRecord | undefined {
    return this.data.stickers.find((s) => s.id === id);
  }

  getStickerBySlug(slug: string): StickerRecord | undefined {
    return this.data.stickers.find((s) => s.shareSlug === slug && s.isPublic && !s.isQuarantined);
  }

  updateSticker(id: string, patch: Partial<StickerRecord>): StickerRecord | undefined {
    const sticker = this.data.stickers.find((s) => s.id === id);
    if (!sticker) return undefined;
    Object.assign(sticker, patch);
    this.save();
    return sticker;
  }

  deleteSticker(id: string, userId: string): StickerRecord | undefined {
    const index = this.data.stickers.findIndex((s) => s.id === id && s.userId === userId);
    if (index === -1) return undefined;
    const [deleted] = this.data.stickers.splice(index, 1);
    this.save();
    return deleted;
  }

  // Safety & Reporting
  reportSticker(stickerId: string, reason: string): boolean {
    const sticker = this.data.stickers.find((s) => s.id === stickerId);
    if (!sticker) return false;

    sticker.reportsCount += 1;
    if (sticker.reportsCount >= 3) {
      sticker.isQuarantined = true;
      sticker.isPublic = false;
    }
    this.data.reports.push({
      id: uuidv4(),
      stickerId,
      reason,
      createdAt: new Date().toISOString(),
    });
    this.save();
    return true;
  }

  // Pack Operations
  getUserPacks(userId: string): PackRecord[] {
    return this.data.packs.filter((p) => p.userId === userId);
  }

  createPack(userId: string, title: string, isPublic = false): PackRecord {
    const pack: PackRecord = {
      id: uuidv4(),
      userId,
      title,
      isPublic,
      stickerIds: [],
      createdAt: new Date().toISOString(),
    };
    this.data.packs.push(pack);
    this.save();
    return pack;
  }

  addStickerToPack(packId: string, userId: string, stickerId: string): boolean {
    const pack = this.data.packs.find((p) => p.id === packId && p.userId === userId);
    if (!pack) return false;
    if (!pack.stickerIds.includes(stickerId)) {
      pack.stickerIds.push(stickerId);
      this.save();
    }
    return true;
  }
}

export const db = new SafeDatabase();
