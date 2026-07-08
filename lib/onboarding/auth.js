const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "smb-local-dev-secret-change-in-production";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

function hashPassword(password) {
  return bcrypt.hashSync(password, 12);
}

function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function createToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name, role: user.role || "md" },
    JWT_SECRET,
    { expiresIn: TOKEN_MAX_AGE }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  return header.split(";").reduce(function (acc, part) {
    const idx = part.indexOf("=");
    if (idx === -1) return acc;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

function getTokenFromRequest(req) {
  const cookies = parseCookies(req);
  return cookies.smb_token || null;
}

function setAuthCookie(res, token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    "smb_token=" + encodeURIComponent(token) + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=" + TOKEN_MAX_AGE + secure
  );
}

function clearAuthCookie(res) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", "smb_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0" + secure);
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function readJsonBody(req) {
  return new Promise(function (resolve, reject) {
    let data = "";
    req.on("data", function (chunk) {
      data += chunk;
      if (data.length > 1e6) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", function () {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

module.exports = {
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
  getTokenFromRequest,
  setAuthCookie,
  clearAuthCookie,
  sendJson,
  readJsonBody
};
