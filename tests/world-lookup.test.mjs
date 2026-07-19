import assert from "node:assert/strict";
import test from "node:test";
import { getWorld } from "../app/world-data.ts";

test("world lookup functions correctly", () => {
  const arcade = getWorld("arcade");
  assert.ok(arcade);
  assert.equal(arcade.id, "arcade");
  assert.equal(arcade.name, "Arcade");
});

test("aliases map correctly to primary worlds", () => {
  const gather = getWorld("gather");
  assert.ok(gather);
  assert.equal(gather.id, "arcade");

  const restore = getWorld("restore");
  assert.ok(restore);
  assert.equal(restore.id, "scent");

  const ritual = getWorld("ritual");
  assert.ok(ritual);
  assert.equal(ritual.id, "carry");

  const roam = getWorld("roam");
  assert.ok(roam);
  assert.equal(roam.id, "arena");

  const wear = getWorld("wear");
  assert.ok(wear);
  assert.equal(wear.id, "adorn");

  const wonder = getWorld("wonder");
  assert.ok(wonder);
  assert.equal(wonder.id, "little");
});

test("invalid world ID returns undefined", () => {
  const invalid = getWorld("invalid-id");
  assert.equal(invalid, undefined);
});
