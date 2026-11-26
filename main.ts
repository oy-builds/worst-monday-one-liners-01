import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(join(dir, "entry.txt"), "utf8");
const line = raw.replace(/\n$/, "");

if (!line || line.trim().length === 0) throw new Error("entry is empty");
if (line.includes("\n") || line.includes("\r")) throw new Error("entry must be a single line");
if ([...line].length > 140) throw new Error(`entry too long: ${[...line].length} chars`);

if (!raw.endsWith("\n") || raw.endsWith("\n\n")) throw new Error("entry must end with exactly one newline");
if (raw.trim().length === 0) throw new Error("entry is only whitespace");

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outPath = join(outDir, "entry.txt");
mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, raw, "utf8");

// Byte-exact round-trip verification
const back = readFileSync(outPath);
const expected = Buffer.from(raw, "utf8");
if (!back.equals(expected)) throw new Error("round-trip mismatch: output is not byte-exact");
const roundTrip = back.toString("utf8");
if (roundTrip !== raw) throw new Error("round-trip mismatch: text differs");
console.log(`wrote ${[...line].length} chars (${expected.length} bytes) to ${outPath} — round-trip OK`);
