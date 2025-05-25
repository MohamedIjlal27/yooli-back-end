import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  create(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(req.user.userId, createMessageDto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  getConversations(@Request() req) {
    return this.messagesService.findUserConversations(req.user.userId);
  }

  @Get('conversation/:userId')
  @ApiOperation({ summary: 'Get conversation with specific user' })
  @ApiResponse({ status: 200, description: 'Conversation retrieved successfully' })
  getConversation(
    @Request() req,
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    console.log('getConversation endpoint called with:', {
      currentUserId: req.user.userId,
      targetUserId: userId,
      page,
      limit
    });
    
    return this.messagesService.findConversation(req.user.userId, userId, +page, +limit);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread messages count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  getUnreadCount(@Request() req) {
    return this.messagesService.getUnreadCount(req.user.userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  markAsRead(@Request() req, @Param('id') id: string) {
    return this.messagesService.markAsRead(id, req.user.userId);
  }

  @Patch('conversation/:userId/read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  @ApiResponse({ status: 200, description: 'Conversation marked as read' })
  markConversationAsRead(@Request() req, @Param('userId') userId: string) {
    return this.messagesService.markConversationAsRead(userId, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  remove(@Request() req, @Param('id') id: string) {
    return this.messagesService.deleteMessage(id, req.user.userId);
  }
} 