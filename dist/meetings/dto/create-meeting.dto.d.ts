export declare class CreateMeetingDto {
    title: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    videoEnabled?: boolean;
    participantIds?: string[];
    link?: string;
}
