import { CallsService } from './calls.service';
import { InitiateCallDto } from './dto/initiate-call.dto';
export declare class CallsController {
    private readonly callsService;
    constructor(callsService: CallsService);
    create(req: any, initiateCallDto: InitiateCallDto): Promise<import("./schemas/call.schema").Call>;
    getHistory(req: any, page?: number, limit?: number): Promise<import("./schemas/call.schema").Call[]>;
    getActiveCall(req: any): Promise<import("./schemas/call.schema").Call>;
    findOne(id: string): Promise<import("./schemas/call.schema").Call>;
    answerCall(req: any, id: string, answer: string): Promise<import("./schemas/call.schema").Call>;
    declineCall(req: any, id: string): Promise<import("./schemas/call.schema").Call>;
    endCall(req: any, id: string): Promise<import("./schemas/call.schema").Call>;
}
