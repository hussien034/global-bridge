import { randomUUID } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

export const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;

const cvDirectory = path.resolve(
  process.env.UPLOAD_DIR || path.resolve(process.cwd(), "data", "uploads"),
  "cvs",
);

export class CvUploadError extends Error {}

export async function saveCandidateCv(name: string, base64Data: string) {
  if (!name.toLowerCase().endsWith(".pdf")) {
    throw new CvUploadError("يُرجى رفع السيرة الذاتية بصيغة PDF.");
  }

  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64Data)) {
    throw new CvUploadError("تعذّر قراءة ملف السيرة الذاتية. حاول رفعه مرة أخرى.");
  }

  const file = Buffer.from(base64Data, "base64");
  if (file.length === 0 || file.length > MAX_CV_SIZE_BYTES) {
    throw new CvUploadError("يجب ألا يتجاوز حجم ملف السيرة الذاتية 5 ميجابايت.");
  }
  if (file.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new CvUploadError("الملف المحدد ليس ملف PDF صالحاً.");
  }

  await mkdir(cvDirectory, { recursive: true });
  const id = randomUUID();
  await writeFile(path.join(cvDirectory, `${id}.pdf`), file, { flag: "wx" });
  return id;
}

export function getCandidateCvPath(storageKey: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(storageKey)) {
    return null;
  }
  return path.join(cvDirectory, `${storageKey}.pdf`);
}

export async function deleteCandidateCv(storageKey: string) {
  const filePath = getCandidateCvPath(storageKey);
  if (filePath) await unlink(filePath);
}

export async function readCandidateCv(storageKey: string) {
  const filePath = getCandidateCvPath(storageKey);
  if (!filePath) return null;
  try {
    return await readFile(filePath);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return null;
    throw error;
  }
}
