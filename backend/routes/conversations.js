const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { Medicine } = require("../models/medicineModel");
const { User } = require("../models/userModel");

// GET /conversations/:id (get conversation details with participants and stock info)
router.get("/:id", async (req, res) => {
  try {
    const myId = req.user.id;
    const { id } = req.params;

    const conv = await Conversation.findById(id).lean();
    if (!conv) return res.status(404).json({ error: "Conversation not found" });

    const isMember = conv.participants.some((p) => String(p) === String(myId));
    if (!isMember) return res.status(403).json({ error: "Forbidden" });

    // Get the other participant's info
    const otherParticipantId = conv.participants.find((p) => String(p) !== String(myId));
    const otherUser = await User.findById(otherParticipantId).select('name email').lean();

    // Get stock/medicine info if available
    let stockInfo = null;
    if (conv.stockId) {
      stockInfo = await Medicine.findById(conv.stockId).select('name').lean();
    }

    // Extract name from email if no name set (e.g., ahmed@ahmed.com -> Ahmed)
    const getDisplayName = (user) => {
      if (user?.name) return user.name;
      if (user?.email) {
        const localPart = user.email.split('@')[0];
        return localPart.charAt(0).toUpperCase() + localPart.slice(1);
      }
      return 'Unknown';
    };

    res.json({
      id: conv._id,
      participants: conv.participants,
      otherUser: {
        id: otherParticipantId,
        name: getDisplayName(otherUser),
        email: otherUser?.email || null,
      },
      stock: stockInfo ? { id: stockInfo._id, name: stockInfo.name } : null,
      lastMessage: conv.lastMessage,
      lastMessageAt: conv.lastMessageAt,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /conversations
router.get("/", async (req, res) => {
  try {
    const myId = req.user.id;
    console.log('[DEBUG] GET /conversations - myId:', myId);

    const conversations = await Conversation.find({
      participants: myId,
    })
      .populate('participants', 'name email')
      .populate('stockId', 'name')
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    console.log('[DEBUG] Found conversations:', conversations.length);

    // Helper to extract display name
    const getDisplayName = (user) => {
      if (!user) return 'Unknown';
      if (user?.name) return user.name;
      if (user?.email) {
        const localPart = user.email.split('@')[0];
        return localPart.charAt(0).toUpperCase() + localPart.slice(1);
      }
      return 'Unknown';
    };

    const result = conversations.map((c) => {
      // Find the other participant (not the current user)
      const otherParticipant = c.participants.find((p) => {
        const pId = String(p?._id || p);
        return pId !== String(myId);
      });

      console.log('[DEBUG] Conversation:', c._id, 'otherParticipant:', otherParticipant?._id || otherParticipant);

      return {
        id: c._id,
        otherUser: {
          id: otherParticipant?._id || otherParticipant,
          name: getDisplayName(otherParticipant),
          email: otherParticipant?.email || null,
        },
        stock: c.stockId ? { id: c.stockId._id, name: c.stockId.name } : null,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
      };
    });

    console.log('[DEBUG] Returning result:', JSON.stringify(result, null, 2));
    res.json(result);
  } catch (e) {
    console.error('Error fetching conversations:', e);
    res.status(500).json({ error: 'Server error' });
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
