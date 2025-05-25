import { Model } from 'mongoose';
import { Call, CallDocument, CallStatus } from './schemas/call.schema';
import { InitiateCallDto } from './dto/initiate-call.dto';
export declare class CallsService {
    private callModel;
    constructor(callModel: Model<CallDocument>);
    initiateCall(callerId: string, initiateCallDto: InitiateCallDto): Promise<Call>;
    answerCall(callId: string, userId: string, answer: string): Promise<Call>;
    declineCall(callId: string, userId: string): Promise<Call>;
    endCall(callId: string, userId: string): Promise<Call>;
    addIceCandidate(callId: string, candidate: string): Promise<Call>;
    getCallHistory(userId: string, page?: number, limit?: number): Promise<Call[]>;
    getActiveCall(userId: string): Promise<Call | null>;
    updateCallStatus(callId: string, status: CallStatus): Promise<Call>;
    findCall(callId: string): Promise<Call>;
}
