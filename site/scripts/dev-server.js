const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 8080;
const ROOT = path.join(__dirname, "..");
const REPO_ROOT = path.join(__dirname, "..", "..");
const PORTAL_ROOT = path.join(REPO_ROOT, "deploy", "portal");
const API_ROOT = path.join(REPO_ROOT, "api");

const PORTAL_ROUTES = /^(login|dashboard|tracking|billing|catalog|order|ivr|accounts|alerts|asg-data|asg|skin-substitutes)(\/|$)/;

const API_ROUTES = {
  "/api/auth/register": () => require(path.join(API_ROOT, "auth/register")),
  "/api/auth/login": () => require(path.join(API_ROOT, "auth/login")),
  "/api/auth/logout": () => require(path.join(API_ROOT, "auth/logout")),
  "/api/auth/me": () => require(path.join(API_ROOT, "auth/me")),
  "/api/progress": () => require(path.join(API_ROOT, "progress"))
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2"
};

function normalizePathname(pathname) {
  if (pathname !== "/" && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function resolveStaticPath(root, pathname) {
  const decoded = decodeURIComponent(pathname);
  let filePath = path.join(root, decoded);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    const withIndex = path.join(filePath, "index.html");
    if (fs.existsSync(withIndex)) filePath = withIndex;
  }

  return filePath;
}

function serveFile(res, filePath) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<!DOCTYPE html><title>404</title><h1>Not found</h1>");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

function serveStatic(req, res, pathname) {
  if (pathname.startsWith("/portal/") && fs.existsSync(PORTAL_ROOT)) {
    const filePath = resolveStaticPath(PORTAL_ROOT, pathname.replace(/^\/portal/, ""));
    if (filePath.startsWith(PORTAL_ROOT)) {
      serveFile(res, filePath);
      return;
    }
  }

  const filePath = resolveStaticPath(ROOT, pathname);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<!DOCTYPE html><title>404</title><h1>Not found</h1>");
    return;
  }

  serveFile(res, filePath);
}

function isPortalRoute(pathname) {
  const segment = pathname.replace(/^\//, "").split("/")[0];
  return PORTAL_ROUTES.test(segment);
}

async function handleApi(req, res, pathname) {
  const routeKey = normalizePathname(pathname);

  if (routeKey === "/api/asg-data" && req.method === "GET") {
    const jsonPath = path.join(REPO_ROOT, "src", "data", "asgData.json");
    if (fs.existsSync(jsonPath)) {
      res.writeHead(200, { "Content-Type": "application/json" });
      fs.createReadStream(jsonPath).pipe(res);
      return;
    }
  }

  const loadHandler = API_ROUTES[routeKey];

  if (!loadHandler) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "API route not found." }));
    return;
  }

  try {
    const handler = loadHandler();
    await handler(req, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error." }));
    }
  }
}

const server = http.createServer(function (req, res) {
  const pathname = new URL(req.url, "http://localhost").pathname;

  if (pathname.startsWith("/api/")) {
    handleApi(req, res, pathname);
    return;
  }

  if (isPortalRoute(pathname) && fs.existsSync(path.join(PORTAL_ROOT, "index.html"))) {
    serveFile(res, path.join(PORTAL_ROOT, "index.html"));
    return;
  }

  serveStatic(req, res, pathname);
});

server.listen(PORT, function () {
  console.log("SMB Health Supply dev server running at http://localhost:" + PORT);
  console.log("  Client login:       http://localhost:" + PORT + "/login/");
  console.log("  Order tracking:     http://localhost:" + PORT + "/tracking/  (after login)");
  console.log("  Onboarding:         http://localhost:" + PORT + "/onboarding/register/");
  if (!fs.existsSync(path.join(PORTAL_ROOT, "index.html"))) {
    console.log("");
    console.log("  Portal not built — run from repo root: npm run local");
  }
});
