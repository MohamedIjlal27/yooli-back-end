/**
 * Test script for TURN server connectivity
 * Run with: npx ts-node src/scripts/test-turn.ts
 */

import { ConfigService } from '@nestjs/config';
import { TurnService } from '../common/services/turn.service';

async function testTurnServer() {
  console.log('🧪 Testing Yooli TURN Server Configuration...\n');

  // Mock ConfigService with environment variables
  const configService = new ConfigService({
    METERED_API_KEY: 'fa712bf84a26380f8a3357cb27d52805ae2b',
    METERED_APP_NAME: 'yooli',
    STUN_SERVER_URL: 'stun:stun.l.google.com:19302',
    TURN_SERVER_URL: 'turn:global.relay.metered.ca:80',
    TURN_USERNAME: '8e7b0702d01e3b73aa26b26a',
    TURN_CREDENTIAL: 'q2MAcVj366itwqEG',
    TURN_SERVER_TCP: 'turn:global.relay.metered.ca:80?transport=tcp',
    TURN_SERVER_443: 'turn:global.relay.metered.ca:443',
    TURN_SERVER_TLS: 'turns:global.relay.metered.ca:443?transport=tcp',
  });

  const turnService = new TurnService(configService);

  try {
    // Test connectivity
    console.log('🔄 Testing TURN server connectivity...');
    const isConnected = await turnService.testConnectivity();
    
    if (isConnected) {
      console.log('✅ TURN server connectivity test passed!\n');
    } else {
      console.log('❌ TURN server connectivity test failed!\n');
    }

    // Get credentials
    console.log('🔄 Fetching TURN credentials...');
    const credentials = await turnService.getIceServers();
    
    console.log('📋 ICE Servers Configuration:');
    console.log(JSON.stringify(credentials, null, 2));
    
    console.log(`\n📊 Total ICE servers: ${credentials.iceServers.length}`);
    
    // Count server types
    const stunServers = credentials.iceServers.filter(server => 
      server.urls.toString().startsWith('stun:')
    ).length;
    
    const turnServers = credentials.iceServers.filter(server => 
      server.urls.toString().startsWith('turn:') || server.urls.toString().startsWith('turns:')
    ).length;
    
    console.log(`📡 STUN servers: ${stunServers}`);
    console.log(`🔄 TURN servers: ${turnServers}`);
    
    console.log('\n🎯 Your Yooli TURN server is ready for WebRTC calls!');
    
  } catch (error) {
    console.error('❌ Error testing TURN server:', error);
    process.exit(1);
  }
}

// Run the test
testTurnServer(); 