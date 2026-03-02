const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const logger = require('../utils/logger');
const { sanitizeString } = require('../utils/sanitize');

// No need for local sanitize, using utils/sanitize instead

// @desc    Get all conversations for logged in user
// @route   GET /api/messages
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.user._id);

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: currentUserId }, { recipient: currentUserId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', currentUserId] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', currentUserId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'partner'
        }
      },
      {
        $unwind: {
          path: '$partner',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          partner: {
            $ifNull: [
              {
                _id: '$partner._id',
                name: '$partner.name',
                avatar: '$partner.avatar',
                premium: '$partner.premium',
                online: '$partner.online',
                isOnline: '$partner.isOnline',
                role: '$partner.role',
                verified: '$partner.verified'
              },
              { _id: '$_id', name: 'Usuario Eliminado', avatar: '' }
            ]
          },
          lastMessage: 1,
          unreadCount: 1,
          partnerId: '$_id'
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    // Redact content if message is locked and not unlocked by current user
    const result = conversations.map(conv => {
      const message = conv.lastMessage;
      const isSender = message.sender.toString() === currentUserId.toString();
      const isUnlocked = isSender || (message.unlockedBy && message.unlockedBy.some(id => id.toString() === currentUserId.toString()));

      if (message.isLocked && !isUnlocked) {
        message.content = 'Mensaje bloqueado';
      }

      return conv;
    });

    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get messages with specific user
// @route   GET /api/messages/:userId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();
    const otherUserId = req.params.userId;

    // Validate if otherUserId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { sender: otherUserId, recipient: currentUserId, isRead: false },
      { isRead: true }
    );

    const messagesWithUnlockStatus = messages.map(msg => {
      const msgObj = msg.toObject();
      // Check if unlocked: sender is user OR user is in unlockedBy list
      const isSender = msg.sender.toString() === currentUserId;
      const isUnlocked = isSender || (msg.unlockedBy && msg.unlockedBy.some(id => id.toString() === currentUserId));

      // Redact content if message is locked and not unlocked by current user
      if (msg.isLocked && !isUnlocked) {
        msgObj.content = 'Mensaje bloqueado. Paga para desbloquear.';
      }

      return {
        ...msgObj,
        isUnlocked
      };
    });

    res.status(200).json({
      success: true,
      count: messagesWithUnlockStatus.length,
      data: messagesWithUnlockStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Send message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content, isLocked, price } = req.body;
    const currentUserId = req.user._id.toString();

    // SECURITY: Block self-messaging
    if (recipientId === currentUserId) {
      return res.status(400).json({ success: false, error: 'No puedes enviarte mensajes a ti mismo' });
    }

    // Validate recipientId
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ success: false, error: 'ID de destinatario inválido' });
    }

    // Sanitize content to prevent XSS
    const safeContent = sanitizeString(content, 5000);
    if (!safeContent || safeContent.length < 1) {
      return res.status(400).json({ success: false, error: 'El mensaje no puede estar vacío' });
    }

    const messageData = {
      sender: currentUserId,
      recipient: recipientId,
      content: safeContent,
      isLocked: !!isLocked,
      price: price || 0,
      unlockedBy: [] // Initialize empty
    };

    const message = await Message.create(messageData);

    // Log the chat message
    logger('chat', `[DE: ${currentUserId}] [PARA: ${recipientId}] - ${safeContent.substring(0, 50)}${safeContent.length > 50 ? '...' : ''}`);

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const count = await Message.countDocuments({
      recipient: userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete all messages with specific user
// @route   DELETE /api/messages/:userId
// @access  Private
exports.deleteConversation = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ success: false, error: 'ID de usuario no válido' });
    }

    await Message.deleteMany({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Conversación eliminada correctamente'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
