const {
  hashPassword,
  createToken,
  setAuthCookie,
  sendJson,
  readJsonBody
} = require("../../lib/auth");
const { findUserByEmail, createUser } = require("../../lib/db");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const password = body.password || "";
    const organization = (body.organization || "").trim();
    const role = (body.role || "").trim().toLowerCase();

    if (!name || !email || !password || !organization) {
      sendJson(res, 400, { error: "All fields are required." });
      return;
    }

    if (!["md", "do", "rn"].includes(role)) {
      sendJson(res, 400, { error: "Please select your role: MD, DO, or RN." });
      return;
    }

    if (password.length < 8) {
      sendJson(res, 400, { error: "Password must be at least 8 characters." });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      sendJson(res, 400, { error: "Please enter a valid email address." });
      return;
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      sendJson(res, 409, { error: "An account with this email already exists." });
      return;
    }

    const user = await createUser({
      email,
      passwordHash: hashPassword(password),
      name,
      organization,
      role
    });

    const token = createToken(user);
    setAuthCookie(res, token);

    sendJson(res, 201, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organization: user.organization,
        role: user.role
      }
    });
  } catch (err) {
    if (err.message === "EMAIL_EXISTS") {
      sendJson(res, 409, { error: "An account with this email already exists." });
      return;
    }
    console.error(err);
    sendJson(res, 500, { error: "Registration failed. Please try again." });
  }
};
