import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument, MessageStatus } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  private messagesGateway: any;

  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  // Method to set the gateway reference (called from the gateway)
  setGateway(gateway: any) {
    this.messagesGateway = gateway;
  }

  async create(senderId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    const message = new this.messageModel({
      ...createMessageDto,
      senderId: new Types.ObjectId(senderId),
      receiverId: new Types.ObjectId(createMessageDto.receiverId),
    });

    return message.save();
  }

  async findConversation(userId1: string, userId2: string, page = 1, limit = 50): Promise<Message[]> {
    const skip = (page - 1) * limit;
    
    console.log('findConversation called with:', { userId1, userId2, page, limit });
    
    // Convert string IDs to ObjectIds for proper MongoDB querying
    const objectId1 = new Types.ObjectId(userId1);
    const objectId2 = new Types.ObjectId(userId2);
    
    console.log('Converted to ObjectIds:', { objectId1, objectId2 });
    
    const messages = await this.messageModel
      .find({
        $or: [
          { senderId: objectId1, receiverId: objectId2 },
          { senderId: objectId2, receiverId: objectId1 },
        ],
        isDeleted: false,
      })
      .populate('senderId', 'fullName avatar')
      .populate('receiverId', 'fullName avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .exec();
    
    console.log('Found messages:', messages.length);
    console.log('Messages data:', messages);
    
    return messages;
  }

  async findUserConversations(userId: string): Promise<any[]> {
    console.log(`🔍 findUserConversations called for userId: ${userId}`);
    
    const conversations = await this.messageModel.aggregate([
      {
        $match: {
          $or: [
            { senderId: new Types.ObjectId(userId) },
            { receiverId: new Types.ObjectId(userId) },
          ],
          isDeleted: false,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', new Types.ObjectId(userId)] },
              '$receiverId',
              '$senderId',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', new Types.ObjectId(userId)] },
                    { $ne: ['$status', MessageStatus.READ] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          user: {
            _id: 1,
            fullName: 1,
            email: 1,
            phoneNumber: 1,
            avatar: 1,
            status: 1,
          },
          lastMessage: 1,
          unreadCount: 1,
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    console.log(`🔍 Found ${conversations.length} conversations for user ${userId}`);
    conversations.forEach((conv, index) => {
      console.log(`🔍 Conversation ${index}: with user ${conv.user.fullName} (${conv.user._id}), unreadCount: ${conv.unreadCount}`);
    });

    return conversations;
  }

  async markAsRead(messageId: string, userId: string): Promise<Message> {
    const message = await this.messageModel
      .findOneAndUpdate(
        { _id: messageId, receiverId: userId },
        { status: MessageStatus.READ },
        { new: true }
      )
      .exec();

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  async markConversationAsRead(otherUserId: string, currentUserId: string): Promise<void> {
    console.log(`🔧 markConversationAsRead called with:`, {
      otherUserId,
      currentUserId
    });

    // First, let's check what messages exist for this conversation
    const existingMessages = await this.messageModel
      .find({
        $or: [
          { senderId: otherUserId, receiverId: currentUserId },
          { senderId: currentUserId, receiverId: otherUserId }
        ],
        isDeleted: false
      })
      .select('senderId receiverId status content createdAt')
      .exec();

    console.log(`🔧 Found ${existingMessages.length} total messages in conversation`);
    existingMessages.forEach((msg, index) => {
      console.log(`🔧 Message ${index}: from ${msg.senderId} to ${msg.receiverId}, status: ${msg.status}, content: "${msg.content}"`);
    });

    // Check specifically for unread messages from otherUser to currentUser
    const unreadMessages = await this.messageModel
      .find({
        senderId: otherUserId,
        receiverId: currentUserId,
        status: { $ne: MessageStatus.READ },
        isDeleted: false
      })
      .select('senderId receiverId status content createdAt')
      .exec();

    console.log(`🔧 Found ${unreadMessages.length} unread messages from ${otherUserId} to ${currentUserId}`);
    unreadMessages.forEach((msg, index) => {
      console.log(`🔧 Unread message ${index}: status ${msg.status}, content: "${msg.content}"`);
    });

    // Mark messages as read where:
    // - senderId = otherUserId (the person who sent the messages)
    // - receiverId = currentUserId (the person reading the messages)
    const result = await this.messageModel
      .updateMany(
        { 
          senderId: otherUserId, 
          receiverId: currentUserId, 
          status: { $ne: MessageStatus.READ },
          isDeleted: false
        },
        { status: MessageStatus.READ }
      )
      .exec();

    console.log(`🔧 markConversationAsRead: Updated ${result.modifiedCount} messages from ${otherUserId} to ${currentUserId}`);
    console.log(`🔧 Update result:`, result);

    // If messages were updated, emit socket events
    if (result.modifiedCount > 0) {
      // Emit to the current user that their conversation was marked as read
      if (this.messagesGateway) {
        this.messagesGateway.sendToUser(currentUserId, 'conversationMarkedAsRead', { 
          userId: otherUserId,
          markedCount: result.modifiedCount 
        });
        
        // Also emit to the other user for confirmation that their messages were read
        this.messagesGateway.sendToUser(otherUserId, 'conversationRead', { 
          userId: currentUserId,
          markedCount: result.modifiedCount 
        });
      }
    } else {
      console.log(`🔧 No messages were updated - they might already be marked as read`);
    }
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageModel
      .findOneAndUpdate(
        { _id: messageId, senderId: userId },
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
      )
      .exec();

    if (!message) {
      throw new NotFoundException('Message not found');
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageModel
      .countDocuments({
        receiverId: userId,
        status: { $ne: MessageStatus.READ },
        isDeleted: false,
      })
      .exec();
  }
} 