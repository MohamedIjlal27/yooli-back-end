import { TurnService, TurnCredentials } from '../common/services/turn.service';
export declare class TurnController {
    private readonly turnService;
    private readonly logger;
    constructor(turnService: TurnService);
    getCredentials(): Promise<TurnCredentials>;
    testConnectivity(): Promise<{
        success: boolean;
        message: string;
    }>;
}
