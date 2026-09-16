import { APIError, type CollectionBeforeOperationHook } from "payload";

export const IMAGE_MAX_BYTES = 25 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 100 * 1024 * 1024;
export const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm"]);

export function formatFileSize(value: unknown): string {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0)
    return "Размер неизвестен";
  if (value < 1024 * 1024)
    return `${Math.max(1, Math.round(value / 1024))} КиБ`;
  return `${(value / 1024 / 1024).toFixed(value >= 10 * 1024 * 1024 ? 0 : 1)} МиБ`;
}

export function validateMediaFile(input: {
  mimeType: string;
  size: number;
}): true | string {
  const { mimeType, size } = input;
  if (!mimeType.startsWith("image/") && !VIDEO_MIME_TYPES.has(mimeType))
    return "Разрешены изображения, MP4 и WebM.";
  const maximum = mimeType.startsWith("image/")
    ? IMAGE_MAX_BYTES
    : VIDEO_MAX_BYTES;
  if (size > maximum)
    return mimeType.startsWith("image/")
      ? "Изображение превышает допустимый размер 25 МиБ."
      : "Видео превышает допустимый размер 100 МиБ.";
  return true;
}

export const validateMediaUploadBeforeOperation: CollectionBeforeOperationHook<
  "media"
> = async ({ args, operation, req }) => {
  if (
    (operation !== "create" &&
      operation !== "update" &&
      operation !== "updateByID") ||
    !req.file
  )
    return args;
  const file = req.file as unknown as { mimetype?: string; name?: string; size: number; type?: string };
  const mimeType = file.type || file.mimetype || "";
  const result = validateMediaFile({
    mimeType,
    size: file.size,
  });
  if (result !== true) throw new APIError(result, 400, undefined, true);

  return args;
};
