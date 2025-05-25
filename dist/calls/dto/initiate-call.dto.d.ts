import { CallType } from '../schemas/call.schema';
export declare class InitiateCallDto {
    receiverId: string;
    type: CallType;
    offer?: string;
}
