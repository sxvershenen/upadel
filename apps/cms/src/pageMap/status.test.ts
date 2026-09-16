import assert from "node:assert/strict";
import test from "node:test";
import { resolvePageMapStatus } from "./status";
test("page map distinguishes draft-only from draft with public version", () => {
  assert.equal(resolvePageMapStatus("published", true), "published");
  assert.equal(resolvePageMapStatus("draft", false), "draft-only");
  assert.equal(resolvePageMapStatus("draft", true), "draft-with-published");
});
