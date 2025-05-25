"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TurnService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TurnService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let TurnService = TurnService_1 = class TurnService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(TurnService_1.name);
        this.cachedCredentials = null;
        this.cacheExpiry = null;
    }
    async fetchCredentials() {
        const apiKey = this.configService.get('METERED_API_KEY');
        const appName = this.configService.get('METERED_APP_NAME');
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
            this.cachedCredentials = credentials;
            this.cacheExpiry = Date.now() + (60 * 60 * 1000);
            this.logger.log('✅ Fresh TURN credentials fetched from Open Relay Project');
            return credentials;
        }
        catch (error) {
            this.logger.error('❌ Error fetching TURN credentials:', error);
            throw error;
        }
    }
    getStaticCredentials() {
        const turnUrl = this.configService.get('TURN_SERVER_URL');
        const turnUsername = this.configService.get('TURN_USERNAME');
        const turnCredential = this.configService.get('TURN_CREDENTIAL');
        const stunUrl = this.configService.get('STUN_SERVER_URL');
        const credentials = [];
        if (stunUrl) {
            credentials.push({ urls: stunUrl });
        }
        credentials.push({ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' });
        if (turnUrl && turnUsername && turnCredential) {
            credentials.push({
                urls: turnUrl,
                username: turnUsername,
                credential: turnCredential,
            });
            const turnTcp = this.configService.get('TURN_SERVER_TCP');
            const turn443 = this.configService.get('TURN_SERVER_443');
            const turnTls = this.configService.get('TURN_SERVER_TLS');
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
    async getCredentials() {
        if (this.cachedCredentials && this.cacheExpiry && Date.now() < this.cacheExpiry) {
            this.logger.log('📋 Using cached TURN credentials');
            return this.cachedCredentials;
        }
        try {
            return await this.fetchCredentials();
        }
        catch (error) {
            this.logger.warn('⚠️ Failed to fetch dynamic credentials, using static fallback');
            return this.getStaticCredentials();
        }
    }
    async getIceServers() {
        const iceServers = await this.getCredentials();
        return { iceServers };
    }
    async testConnectivity() {
        try {
            const credentials = await this.getCredentials();
            this.logger.log('✅ TURN server connectivity test passed');
            this.logger.log(`📊 Available servers: ${credentials.length}`);
            return true;
        }
        catch (error) {
            this.logger.error('❌ TURN server connectivity test failed:', error);
            return false;
        }
    }
};
exports.TurnService = TurnService;
exports.TurnService = TurnService = TurnService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TurnService);
//# sourceMappingURL=turn.service.js.map