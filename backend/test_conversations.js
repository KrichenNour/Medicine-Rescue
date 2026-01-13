require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db');
const Conversation = require('./models/Conversation');
const { User } = require('./models/userModel');
const { Medicine } = require('./models/medicineModel');

(async () => {
  try {
    await connectDB();
    console.log('Connected to DB\n');

    // Get all conversations
    const conversations = await Conversation.find().lean();
    console.log('Total conversations:', conversations.length);

    // Check each conversation
    for (const conv of conversations) {
      console.log('\nConversation:', conv._id);
      console.log('Participants:', conv.participants);
      console.log('StockId:', conv.stockId);

      // Check if participants exist
      const users = await User.find({ _id: { $in: conv.participants } }).lean();
      console.log('Found users:', users.length);
      users.forEach(u => console.log(`  - ${u.email}`));

      // Check if stock exists
      if (conv.stockId) {
        const stock = await Medicine.findById(conv.stockId).lean();
        console.log('Stock found:', stock ? stock.name : 'NOT FOUND');
      }
    }

    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
})();
