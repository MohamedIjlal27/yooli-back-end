"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const turn_service_1 = require("../common/services/turn.service");
async function testTurnServer() {
    console.log('🧪 Testing Yooli TURN Server Configuration...\n');
    const configService = new config_1.ConfigService({
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
    const turnService = new turn_service_1.TurnService(configService);
    try {
        console.log('🔄 Testing TURN server connectivity...');
        const isConnected = await turnService.testConnectivity();
        if (isConnected) {
            console.log('✅ TURN server connectivity test passed!\n');
        }
        else {
            console.log('❌ TURN server connectivity test failed!\n');
        }
        console.log('🔄 Fetching TURN credentials...');
        const credentials = await turnService.getIceServers();
        console.log('📋 ICE Servers Configuration:');
        console.log(JSON.stringify(credentials, null, 2));
        console.log(`\n📊 Total ICE servers: ${credentials.iceServers.length}`);
        const stunServers = credentials.iceServers.filter(server => server.urls.toString().startsWith('stun:')).length;
        const turnServers = credentials.iceServers.filter(server => server.urls.toString().startsWith('turn:') || server.urls.toString().startsWith('turns:')).length;
        console.log(`📡 STUN servers: ${stunServers}`);
        console.log(`🔄 TURN servers: ${turnServers}`);
        console.log('\n🎯 Your Yooli TURN server is ready for WebRTC calls!');
    }
    catch (error) {
        console.error('❌ Error testing TURN server:', error);
        process.exit(1);
    }
}
testTurnServer();
//# sourceMappingURL=test-turn.js.map