import { v4 as uuidv4 } from "uuid";

export function generateSlug(length = 10): string {
  const raw = uuidv4().replace(/-/g, "");
  return raw.substring(0, length);
}
