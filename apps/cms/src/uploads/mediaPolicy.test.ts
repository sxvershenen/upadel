import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import {
  formatFileSize,
  IMAGE_MAX_BYTES,
  validateMediaUploadBeforeOperation,
  validateMediaFile,
  VIDEO_MAX_BYTES,
} from "./mediaPolicy";
import { optimizeMediaUploadBeforeOperation } from "./mediaOptimization";

test("image policy accepts boundary and rejects one byte over", () => {
  assert.equal(
    validateMediaFile({ mimeType: "image/jpeg", size: IMAGE_MAX_BYTES }),
    true,
  );
  assert.match(
    String(
      validateMediaFile({ mimeType: "image/png", size: IMAGE_MAX_BYTES + 1 }),
    ),
    /25 МиБ/,
  );
});

test("video policy accepts MP4/WebM boundary and rejects oversize or other MIME", () => {
  assert.equal(
    validateMediaFile({ mimeType: "video/mp4", size: VIDEO_MAX_BYTES }),
    true,
  );
  assert.equal(
    validateMediaFile({ mimeType: "video/webm", size: VIDEO_MAX_BYTES }),
    true,
  );
  assert.match(
    String(
      validateMediaFile({ mimeType: "video/mp4", size: VIDEO_MAX_BYTES + 1 }),
    ),
    /100 МиБ/,
  );
  assert.notEqual(
    validateMediaFile({ mimeType: "video/quicktime", size: 1 }),
    true,
  );
  assert.notEqual(
    validateMediaFile({ mimeType: "application/pdf", size: 1 }),
    true,
  );
});

test("admin file sizes are human readable", () => {
  assert.equal(formatFileSize(1_572_864), "1.5 МиБ");
  assert.equal(formatFileSize(undefined), "Размер неизвестен");
});

test("beforeOperation rejects req.file before upload processing", async () => {
  const args = { marker: true };
  await assert.rejects(
    async () => validateMediaUploadBeforeOperation({ args, operation: "create", req: { file: { type: "image/jpeg", size: IMAGE_MAX_BYTES + 1 } } } as never),
    /25 МиБ/,
  );
  assert.equal(await validateMediaUploadBeforeOperation({ args, operation: "updateByID", req: {} } as never), args);
});

test("media upload converts raster images to webp quality pipeline", async () => {
  const data = await sharp({ create: { width: 2, height: 2, channels: 3, background: "#c2f542" } }).png().toBuffer();
  const file = { data, mimetype: "image/png", type: "image/png", name: "sample.png", size: data.length };
  await optimizeMediaUploadBeforeOperation({ args: { marker: true }, operation: "create", req: { file } } as never);
  assert.equal(file.mimetype, "image/webp");
  assert.equal(file.type, "image/webp");
  assert.equal(file.name, "sample.webp");
  assert.ok(file.size < data.length);
});
