const { verifyToken, getTokenFromRequest, sendJson } = require("../../lib/auth");
const { findUserById } = require("../../lib/db");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const token = getTokenFromRequest(req);
  if (!token) {
    sendJson(res, 401, { error: "Not authenticated" });
    return;
  }

  const payload = verifyToken(token);
  if (!payload?.sub) {
    sendJson(res, 401, { error: "Not authenticated" });
    return;
  }

  const user = await findUserById(payload.sub);
  if (!user) {
    sendJson(res, 401, { error: "Not authenticated" });
    return;
  }

  sendJson(res, 200, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      organization: user.organization,
      role: user.role || "md"
    }
  });
};
