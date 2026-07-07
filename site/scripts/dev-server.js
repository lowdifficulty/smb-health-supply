const http = require("http");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const PORT = Number(process.env.PORT) || 8080;
const ROOT = path.join(__dirname, "..");

const API_ROUTES = {
  "/api/auth/register": () => require("../api/auth/register"),
  "/api/auth/login": () => require("../api/auth/login"),
  "/api/auth/logout": () => require("../api/auth/logout"),
  "/api/auth/me": () => require("../api/auth/me"),
  "/api/progress": () => require("../api/progress")
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

function resolveStaticPath(pathname) {
  const decoded = decodeURIComponent(pathname);
  let filePath = path.join(ROOT, decoded);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    const withIndex = path.join(filePath, "index.html");
    if (fs.existsSync(withIndex)) filePath = withIndex;
  }

  if (!fs.existsSync(filePath) && !path.extname(decoded)) {
    const htmlPath = filePath + ".html";
    if (fs.existsSync(htmlPath)) filePath = htmlPath;
  }

  return filePath;
}

function serveStatic(req, res, pathname) {
  const filePath = resolveStaticPath(pathname);

  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<!DOCTYPE html><title>404</title><h1>Not found</h1>");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

async function handleApi(req, res, pathname) {
  const routeKey = normalizePathname(pathname);
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

  serveStatic(req, res, pathname);
});

server.listen(PORT, function () {
  console.log("SMB Health Supply dev server running at http://localhost:" + PORT);
  console.log("Onboarding: http://localhost:" + PORT + "/onboarding/register/");
});
