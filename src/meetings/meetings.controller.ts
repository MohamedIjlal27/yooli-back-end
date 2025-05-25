import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('meetings')
@Controller('meetings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new meeting' })
  @ApiResponse({ status: 201, description: 'Meeting created successfully' })
  create(@Request() req, @Body() createMeetingDto: CreateMeetingDto) {
    return this.meetingsService.create(req.user.userId, createMeetingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all meetings for the user' })
  @ApiResponse({ status: 200, description: 'Meetings retrieved successfully' })
  findAll(@Request() req) {
    return this.meetingsService.findAll(req.user.userId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming meetings for the user' })
  @ApiResponse({ status: 200, description: 'Upcoming meetings retrieved successfully' })
  getUpcoming(@Request() req) {
    return this.meetingsService.getUpcomingMeetings(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get meeting by ID' })
  @ApiResponse({ status: 200, description: 'Meeting retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.meetingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a meeting' })
  @ApiResponse({ status: 200, description: 'Meeting updated successfully' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateMeetingDto: UpdateMeetingDto,
  ) {
    return this.meetingsService.update(id, req.user.userId, updateMeetingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a meeting' })
  @ApiResponse({ status: 200, description: 'Meeting deleted successfully' })
  remove(@Request() req, @Param('id') id: string) {
    return this.meetingsService.remove(id, req.user.userId);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a meeting' })
  @ApiResponse({ status: 200, description: 'Meeting joined successfully' })
  joinMeeting(@Request() req, @Param('id') id: string) {
    return this.meetingsService.joinMeeting(id, req.user.userId);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Leave a meeting' })
  @ApiResponse({ status: 200, description: 'Left meeting successfully' })
  leaveMeeting(@Request() req, @Param('id') id: string) {
    return this.meetingsService.leaveMeeting(id, req.user.userId);
  }
} 