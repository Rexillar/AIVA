const express = require('express');
const ChatHistory = require('../models/ChatHistory'); // Assuming the model exists
const { protect } = require('../middleware/authMiddleware'); // Assuming auth middleware

const router = express.Router();

// GET /api/chat/history?workspaceId=...
router.get('/history', protect, async (req, res) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ message: 'workspaceId is required' });
    }
    const history = await ChatHistory.find({ workspaceId }).sort({ createdAt: 1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Other chat routes can be added here, e.g., POST /message

module.exports = router;
