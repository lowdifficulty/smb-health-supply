import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const siteDir = path.join(root, "site");
const deployDir = path.join(root, "deploy");

const SITE_SKIP = new Set([
  "node_modules",
  ".data",
  ".vercel",
  "api",
  "lib",
  "scripts",
  "package.json",
  "package-lock.json",
  ".env.example",
  ".gitignore"
]);

function rmrf(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function shouldSkipWpContent(relPath) {
  return (
    relPath.startsWith("wp-content/plugins/") ||
    relPath.startsWith("wp-content/themes/") ||
    relPath.startsWith("wp-content/uploads/elementor/") ||
    relPath.startsWith("wp-includes/")
  );
}

function copySite(src, dest, rel = "") {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const relPath = rel ? `${rel}/${entry.name}` : entry.name;
    if (!rel && SITE_SKIP.has(entry.name)) continue;
    if (shouldSkipWpContent(relPath.replace(/\\/g, "/"))) continue;

    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      copySite(from, to, relPath);
      continue;
    }

    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
}

rmrf(deployDir);
fs.mkdirSync(deployDir, { recursive: true });

execSync("npm run build", {
  stdio: "inherit",
  env: {
    ...process.env,
    VITE_BASE: "/portal/",
    VITE_OUT_DIR: "deploy/portal"
  }
});

copySite(siteDir, deployDir);

console.log("Deploy bundle ready in deploy/");
