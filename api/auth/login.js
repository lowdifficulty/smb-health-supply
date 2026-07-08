const {
  verifyPassword,
  createToken,
  setAuthCookie,
  sendJson,
  readJsonBody
} = require("../../lib/onboarding/auth");
const { getUserWithPassword } = require("../../lib/onboarding/db");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const email = (body.email || "").trim();
    const password = body.password || "";

    if (!email || !password) {
      sendJson(res, 400, { error: "Email and password are required." });
      return;
    }

    const user = await getUserWithPassword(email);
    const hash = user?.password_hash;
    if (!user || !hash || !verifyPassword(password, hash)) {
      sendJson(res, 401, { error: "Invalid email or password." });
      return;
    }

    const token = createToken(user);
    setAuthCookie(res, token);

    sendJson(res, 200, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organization: user.organization,
        role: user.role || "md"
      }
    });
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: "Login failed. Please try again." });
  }
};
