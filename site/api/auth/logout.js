const { clearAuthCookie, sendJson } = require("../../lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  clearAuthCookie(res);
  sendJson(res, 200, { ok: true });
};
