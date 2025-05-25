import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CallsService } from './calls.service';
import { InitiateCallDto } from './dto/initiate-call.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('calls')
@Controller('calls')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Post()
  @ApiOperation({ summary: 'Initiate a call' })
  @ApiResponse({ status: 201, description: 'Call initiated successfully' })
  create(@Request() req, @Body() initiateCallDto: InitiateCallDto) {
    return this.callsService.initiateCall(req.user.userId, initiateCallDto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get call history' })
  @ApiResponse({ status: 200, description: 'Call history retrieved successfully' })
  getHistory(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.callsService.getCallHistory(req.user.userId, +page, +limit);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active call' })
  @ApiResponse({ status: 200, description: 'Active call retrieved successfully' })
  getActiveCall(@Request() req) {
    return this.callsService.getActiveCall(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get call details' })
  @ApiResponse({ status: 200, description: 'Call details retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.callsService.findCall(id);
  }

  @Patch(':id/answer')
  @ApiOperation({ summary: 'Answer a call' })
  @ApiResponse({ status: 200, description: 'Call answered successfully' })
  answerCall(
    @Request() req,
    @Param('id') id: string,
    @Body('answer') answer: string,
  ) {
    return this.callsService.answerCall(id, req.user.userId, answer);
  }

  @Patch(':id/decline')
  @ApiOperation({ summary: 'Decline a call' })
  @ApiResponse({ status: 200, description: 'Call declined successfully' })
  declineCall(@Request() req, @Param('id') id: string) {
    return this.callsService.declineCall(id, req.user.userId);
  }

  @Patch(':id/end')
  @ApiOperation({ summary: 'End a call' })
  @ApiResponse({ status: 200, description: 'Call ended successfully' })
  endCall(@Request() req, @Param('id') id: string) {
    return this.callsService.endCall(id, req.user.userId);
  }
} 