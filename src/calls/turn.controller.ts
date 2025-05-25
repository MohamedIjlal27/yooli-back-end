import { Controller, Get, Logger } from '@nestjs/common';
import { TurnService, TurnCredentials } from '../common/services/turn.service';

@Controller('turn')
export class TurnController {
  private readonly logger = new Logger(TurnController.name);

  constructor(private readonly turnService: TurnService) {}

  /**
   * Get TURN/STUN server credentials for WebRTC
   * GET /turn/credentials
   */
  @Get('credentials')
  async getCredentials(): Promise<TurnCredentials> {
    this.logger.log('📡 TURN credentials requested');
    
    try {
      const credentials = await this.turnService.getIceServers();
      this.logger.log(`✅ Returning ${credentials.iceServers.length} ICE servers`);
      return credentials;
    } catch (error) {
      this.logger.error('❌ Failed to get TURN credentials:', error);
      throw error;
    }
  }

  /**
   * Test TURN server connectivity
   * GET /turn/test
   */
  @Get('test')
  async testConnectivity(): Promise<{ success: boolean; message: string }> {
    this.logger.log('🧪 Testing TURN server connectivity');
    
    try {
      const isConnected = await this.turnService.testConnectivity();
      
      if (isConnected) {
        return {
          success: true,
          message: 'TURN server connectivity test passed'
        };
      } else {
        return {
          success: false,
          message: 'TURN server connectivity test failed'
        };
      }
    } catch (error) {
      this.logger.error('❌ TURN connectivity test error:', error);
      return {
        success: false,
        message: `TURN connectivity test failed: ${error.message}`
      };
    }
  }
} 