const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// GET /conversations
router.get("/", async (req, res) => {
  try {
    const myId = req.user.id;

    const conversations = await Conversation.find({
      participants: myId,
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    res.json(
      conversations.map((c) => ({
        id: c._id,
        participants: c.participants,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /conversations
router.post("/", async (req, res) => {
  try {
    const myId = req.user.id;
    const { otherUserId, stockId } = req.body;

    if (!otherUserId) return res.status(400).json({ error: "otherUserId required" });

    const existing = await Conversation.findOne({
      participants: { $all: [myId, otherUserId] },
      ...(stockId ? { stockId } : {}),
    });

    if (existing) return res.json({ conversationId: existing._id });

    const conv = await Conversation.create({
      participants: [myId, otherUserId],
      stockId: stockId || null,
    });

    res.status(201).json({ conversationId: conv._id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /conversations/:id/messages
router.get("/:id/messages", async (req, res) => {
  try {
    const myId = req.user.id;
    const { id } = req.params;

    const conv = await Conversation.findById(id);
    if (!conv) return res.status(404).json({ error: "Conversation not found" });

    const isMember = conv.participants.some((p) => String(p) === String(myId));
    if (!isMember) return res.status(403).json({ error: "Forbidden" });

    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .lean();

    res.json(messages);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /conversations/:id/messages
router.post("/:id/messages", async (req, res) => {
  try {
    const myId = req.user.id;
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) return res.status(400).json({ error: "Text required" });

    const conv = await Conversation.findById(id);
    if (!conv) return res.status(404).json({ error: "Conversation not found" });

    const isMember = conv.participants.some((p) => String(p) === String(myId));
    if (!isMember) return res.status(403).json({ error: "Forbidden" });

    const msg = await Message.create({
      conversationId: id,
      senderId: myId,
      text: text.trim(),
      readBy: [myId],
    });

    conv.lastMessage = text.trim();
    conv.lastMessageAt = new Date();
    await conv.save();

    res.status(201).json(msg);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
