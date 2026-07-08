import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const portalIndex = path.join(root, "deploy", "portal", "index.html");

function newestMtime(targetPath) {
  if (!fs.existsSync(targetPath)) return 0;
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) return stat.mtimeMs;
  let newest = 0;
  for (const entry of fs.readdirSync(targetPath, { withFileTypes: true })) {
    newest = Math.max(newest, newestMtime(path.join(targetPath, entry.name)));
  }
  return newest;
}

function portalNeedsRebuild() {
  if (!fs.existsSync(portalIndex)) return true;

  const portalMtime = fs.statSync(portalIndex).mtimeMs;
  const sourceMarkers = [
    path.join(root, "src"),
    path.join(root, "src/data/asgData.json"),
    path.join(root, "package.json"),
  ];

  return sourceMarkers.some((marker) => newestMtime(marker) > portalMtime);
}

if (portalNeedsRebuild()) {
  console.log("Rebuilding ordering portal for local dev…");
  execSync("npm run build:deploy", { stdio: "inherit", cwd: root });
}

console.log("");
console.log("Local site:          http://localhost:8080/");
console.log("Client dashboard:    http://localhost:8080/dashboard/");
console.log("Order tracking login http://localhost:8080/login/");
console.log("Onboarding register  http://localhost:8080/onboarding/register/");
console.log("");

const server = spawn(process.execPath, [path.join(root, "site", "scripts", "dev-server.js")], {
  stdio: "inherit",
  cwd: root,
  env: process.env
});

server.on("exit", function (code) {
  process.exit(code ?? 0);
});
