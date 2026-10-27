import { randomUUID } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

export const MAX_PROFILE_PHOTO_SIZE_BYTES = 3 * 1024 * 1024;

const photoDirectory = path.resolve(
  process.env.UPLOAD_DIR || path.resolve(process.cwd(), "data", "uploads"),
  "profile-photos",
);

const imageTypes = {
  "image/jpeg": { extension: "jpg", signature: (file: Buffer) => file[0] === 0xff && file[1] === 0xd8 && file[2] === 0xff },
  "image/png": { extension: "png", signature: (file: Buffer) => file.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  "image/webp": { extension: "webp", signature: (file: Buffer) => file.subarray(0, 4).toString("ascii") === "RIFF" && file.subarray(8, 12).toString("ascii") === "WEBP" },
} as const;

export type ProfilePhotoMimeType = keyof typeof imageTypes;

export class ProfilePhotoUploadError extends Error {}

export async function saveProfilePhoto(mimeType: ProfilePhotoMimeType, base64Data: string) {
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64Data)) {
    throw new ProfilePhotoUploadError("The profile photo could not be read. Please choose it again.");
  }

  const file = Buffer.from(base64Data, "base64");
  if (file.length === 0 || file.length > MAX_PROFILE_PHOTO_SIZE_BYTES) {
    throw new ProfilePhotoUploadError("The profile photo must be no larger than 3 MB.");
  }

  const imageType = imageTypes[mimeType];
  if (!imageType.signature(file)) {
    throw new ProfilePhotoUploadError("The selected file is not a valid JPEG, PNG, or WebP image.");
  }

  await mkdir(photoDirectory, { recursive: true });
  const storageKey = randomUUID();
  await writeFile(path.join(photoDirectory, `${storageKey}.${imageType.extension}`), file, { flag: "wx" });
  return { storageKey, mimeType };
}

function getProfilePhotoPath(storageKey: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(storageKey)) {
    return null;
  }

  return (["jpg", "png", "webp"] as const).map((extension) => ({
    extension,
    filePath: path.join(photoDirectory, `${storageKey}.${extension}`),
  }));
}

export async function deleteProfilePhoto(storageKey: string) {
  const paths = getProfilePhotoPath(storageKey);
  if (!paths) return;

  await Promise.all(paths.map(async ({ filePath }) => {
    try {
      await unlink(filePath);
    } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
    }
  }));
}

export async function readProfilePhoto(storageKey: string) {
  const paths = getProfilePhotoPath(storageKey);
  if (!paths) return null;

  for (const candidate of paths) {
    try {
      const buffer = await readFile(candidate.filePath);
      const mimeType = candidate.extension === "jpg" ? "image/jpeg" : `image/${candidate.extension}`;
      return { buffer, mimeType };
    } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
    }
  }

  return null;
}
