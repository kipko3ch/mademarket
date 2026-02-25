/**
 * After `next build` with output: 'standalone', copy the required assets
 * into .next/standalone so the server can serve them on Hostinger.
 *
 * Required structure for standalone server:
 *   .next/standalone/             ← node server.js lives here
 *   .next/standalone/.next/static ← JS/CSS chunks
 *   .next/standalone/public       ← static assets (images, icons, fonts)
 */

import { cpSync, existsSync } from "fs";
import { join } from "path";

const root = process.cwd();

const copies = [
  // Static Next.js chunks (CSS, JS)
  {
    src: join(root, ".next", "static"),
    dest: join(root, ".next", "standalone", ".next", "static"),
  },
  // Public folder (images, icons, etc.)
  {
    src: join(root, "public"),
    dest: join(root, ".next", "standalone", "public"),
  },
];

for (const { src, dest } of copies) {
  if (!existsSync(src)) {
    console.warn(`[copy-standalone] Source not found, skipping: ${src}`);
    continue;
  }
  cpSync(src, dest, { recursive: true, force: true });
  console.log(`[copy-standalone] Copied ${src} → ${dest}`);
}

console.log("[copy-standalone] Done. Standalone build is ready.");
