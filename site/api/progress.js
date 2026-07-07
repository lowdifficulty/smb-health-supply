const {
  verifyToken,
  getTokenFromRequest,
  sendJson,
  readJsonBody
} = require("../lib/auth");
const { findUserById, getProgress, saveProgress } = require("../lib/db");

async function requireUser(req, res) {
  const token = getTokenFromRequest(req);
  if (!token) {
    sendJson(res, 401, { error: "Not authenticated" });
    return null;
  }

  const payload = verifyToken(token);
  if (!payload?.sub) {
    sendJson(res, 401, { error: "Not authenticated" });
    return null;
  }

  const user = await findUserById(payload.sub);
  if (!user) {
    sendJson(res, 401, { error: "Not authenticated" });
    return null;
  }

  return user;
}

module.exports = async function handler(req, res) {
  try {
    const user = await requireUser(req, res);
    if (!user) return;

    if (req.method === "GET") {
      const progress = await getProgress(user.id);
      sendJson(res, 200, {
        completedItems: progress.completedItems || {},
        updatedAt: progress.updatedAt
      });
      return;
    }

    if (req.method === "PUT") {
      const body = await readJsonBody(req);
      const completedItems = body.completedItems && typeof body.completedItems === "object"
        ? body.completedItems
        : {};
      const saved = await saveProgress(user.id, completedItems);
      sendJson(res, 200, { completedItems: saved });
      return;
    }

    if (req.method === "PATCH") {
      const body = await readJsonBody(req);
      const itemId = body.itemId;
      const completed = !!body.completed;

      if (!itemId || typeof itemId !== "string") {
        sendJson(res, 400, { error: "itemId is required." });
        return;
      }

      const progress = await getProgress(user.id);
      const completedItems = { ...(progress.completedItems || {}) };

      if (completed) {
        completedItems[itemId] = true;
      } else {
        delete completedItems[itemId];
      }

      const saved = await saveProgress(user.id, completedItems);
      sendJson(res, 200, { completedItems: saved });
      return;
    }

    if (req.method === "DELETE") {
      const saved = await saveProgress(user.id, {});
      sendJson(res, 200, { completedItems: saved });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: "Unable to save progress." });
  }
};
