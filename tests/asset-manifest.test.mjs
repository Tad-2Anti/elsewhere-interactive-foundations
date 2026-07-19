import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { worlds } from "../app/world-data.ts";

test("all world-data images exist on disk with exact case match", () => {
  const publicDir = join(process.cwd(), "public");

  for (const world of worlds) {
    const imagesToCheck = [
      world.image,
      world.imageMobile,
      world.heroImage,
      world.heroImageMobile,
    ];

    if (world.supportingImages) {
      for (const img of world.supportingImages) {
        imagesToCheck.push(img.src);
      }
    }

    for (const imagePath of imagesToCheck) {
      assert.ok(imagePath.startsWith("/"), `Image path must start with '/': ${imagePath}`);
      const fullPath = join(publicDir, imagePath);
      assert.ok(
        existsSync(fullPath),
        `Image file does not exist: ${imagePath} (full path: ${fullPath})`
      );
    }
  }
});
