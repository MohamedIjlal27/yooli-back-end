import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface TurnCredentials {
  iceServers: IceServer[];
}

@Injectable()
export class TurnService {
  private readonly logger = new Logger(TurnService.name);
  private cachedCredentials: IceServer[] | null = null;
  private cacheExpiry: number | null = null;

  constructor(private configService: ConfigService) {}

  /**
   * Fetch fresh TURN credentials from Open Relay Project API
   */
  async fetchCredentials(): Promise<IceServer[]> {
    const apiKey = this.configService.get<string>('METERED_API_KEY');
    const appName = this.configService.get<string>('METERED_APP_NAME');
    
    if (!apiKey || !appName) {
      this.logger.warn('METERED_API_KEY or METERED_APP_NAME not configured, using static credentials');
      return this.getStaticCredentials();
    }

    const apiUrl = `https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch TURN credentials: ${response.status} ${response.statusText}`);
      }
      
      const credentials = await response.json();
      
      // Cache credentials for 1 hour (they typically expire after 24 hours)
      this.cachedCredentials = credentials;
      this.cacheExpiry = Date.now() + (60 * 60 * 1000); // 1 hour from now
      
      this.logger.log('✅ Fresh TURN credentials fetched from Open Relay Project');
      return credentials;
      
    } catch (error) {
      this.logger.error('❌ Error fetching TURN credentials:', error);
      throw error;
    }
  }

  /**
   * Get static TURN credentials as fallback
   */
  private getStaticCredentials(): IceServer[] {
    const turnUrl = this.configService.get<string>('TURN_SERVER_URL');
    const turnUsername = this.configService.get<string>('TURN_USERNAME');
    const turnCredential = this.configService.get<string>('TURN_CREDENTIAL');
    const stunUrl = this.configService.get<string>('STUN_SERVER_URL');

    const credentials: IceServer[] = [];

    // Add STUN server
    if (stunUrl) {
      credentials.push({ urls: stunUrl });
    }

    // Add Google STUN servers as backup
    credentials.push(
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    );

    // Add TURN server if configured
    if (turnUrl && turnUsername && turnCredential) {
      credentials.push({
        urls: turnUrl,
        username: turnUsername,
        credential: turnCredential,
      });

      // Add additional TURN configurations
      const turnTcp = this.configService.get<string>('TURN_SERVER_TCP');
      const turn443 = this.configService.get<string>('TURN_SERVER_443');
      const turnTls = this.configService.get<string>('TURN_SERVER_TLS');

      if (turnTcp) {
        credentials.push({
          urls: turnTcp,
          username: turnUsername,
          credential: turnCredential,
        });
      }

      if (turn443) {
        credentials.push({
          urls: turn443,
          username: turnUsername,
          credential: turnCredential,
        });
      }

      if (turnTls) {
        credentials.push({
          urls: turnTls,
          username: turnUsername,
          credential: turnCredential,
        });
      }
    }

    return credentials;
  }

  /**
   * Get TURN credentials (uses cache if available and not expired)
   */
  async getCredentials(): Promise<IceServer[]> {
    // Return cached credentials if they're still valid
    if (this.cachedCredentials && this.cacheExpiry && Date.now() < this.cacheExpiry) {
      this.logger.log('📋 Using cached TURN credentials');
      return this.cachedCredentials;
    }
    
    // Try to fetch fresh credentials
    try {
      return await this.fetchCredentials();
    } catch (error) {
      this.logger.warn('⚠️ Failed to fetch dynamic credentials, using static fallback');
      return this.getStaticCredentials();
    }
  }

  /**
   * Get complete ICE servers configuration for WebRTC
   */
  async getIceServers(): Promise<TurnCredentials> {
    const iceServers = await this.getCredentials();
    return { iceServers };
  }

  /**
   * Test TURN server connectivity
   */
  async testConnectivity(): Promise<boolean> {
    try {
      const credentials = await this.getCredentials();
      this.logger.log('✅ TURN server connectivity test passed');
      this.logger.log(`📊 Available servers: ${credentials.length}`);
      return true;
    } catch (error) {
      this.logger.error('❌ TURN server connectivity test failed:', error);
      return false;
    }
  }
} 