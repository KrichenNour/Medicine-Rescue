const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    stockId: { type: mongoose.Schema.Types.ObjectId, ref: "Stock", default: null },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
