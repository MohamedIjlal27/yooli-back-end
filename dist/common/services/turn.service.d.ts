import { ConfigService } from '@nestjs/config';
export interface IceServer {
    urls: string | string[];
    username?: string;
    credential?: string;
}
export interface TurnCredentials {
    iceServers: IceServer[];
}
export declare class TurnService {
    private configService;
    private readonly logger;
    private cachedCredentials;
    private cacheExpiry;
    constructor(configService: ConfigService);
    fetchCredentials(): Promise<IceServer[]>;
    private getStaticCredentials;
    getCredentials(): Promise<IceServer[]>;
    getIceServers(): Promise<TurnCredentials>;
    testConnectivity(): Promise<boolean>;
}
