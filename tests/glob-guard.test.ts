import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

test("lint glob guard preserves normal patterns and bounds every public recursive walker", async () => {
  const require = createRequire(import.meta.url);
  // Local JS helper has no runtime web dependency.
  const { installGlobGuard } = await import("../scripts/lib/glob-guard.mjs");
  const braces = require("braces");
  installGlobGuard(braces);
  assert.deepEqual(braces.expand("src/{app,lib}/*.ts"), ["src/app/*.ts", "src/lib/*.ts"]);
  const deep = "{".repeat(10000) + "a,b" + "}".repeat(10000);
  for (const method of ["parse", "compile", "expand", "stringify"]) assert.throws(() => braces[method](deep), /Glob nesting exceeds/);
  let ast: { nodes?: unknown[]; value?: string } = { value: "a" };
  for (let i = 0; i < 200; i++) ast = { nodes: [ast] };
  for (const method of ["compile", "expand", "stringify"]) assert.throws(() => braces[method](ast), /Glob AST nesting/);
});
