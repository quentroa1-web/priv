const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
  deleteConversation
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { validate, messageSchema } = require('../middleware/validate');

router.get('/', protect, getConversations);
router.get('/unread/count', protect, getUnreadCount);
router.get('/:userId', protect, getMessages);
router.post('/', protect, validate(messageSchema), sendMessage);
router.delete('/:userId', protect, deleteConversation);

module.exports = router;
