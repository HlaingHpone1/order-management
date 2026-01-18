import fs from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function saveFileLocally(
  file: File,
  folder: string = "products",
): Promise<{ url: string; size: number; type: string }> {
  // 1. Ensure directory exists
  const targetDir = path.join(UPLOAD_DIR, folder);
  try {
    await fs.access(targetDir);
  } catch {
    await fs.mkdir(targetDir, { recursive: true });
  }

  // 2. Generate unique filename
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop();
  const filename = `${uuidv4()}.${ext}`;
  const filePath = path.join(targetDir, filename);

  // 3. Write file
  await fs.writeFile(filePath, buffer);

  return {
    url: `/uploads/${folder}/${filename}`,
    size: file.size,
    type: file.type,
  };
}

export async function deleteFileLocally(relativeUrl: string) {
  try {
    const filePath = path.join(process.cwd(), "public", relativeUrl);
    await fs.unlink(filePath);
  } catch (error) {
    console.error("Failed to delete local file:", error);
  }
}
