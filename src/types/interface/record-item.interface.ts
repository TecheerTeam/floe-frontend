import { RecordType } from "@/apis/request/record/record.request.dto";

export default interface RecordItem {
    recordId: number;
    user: {
        nickname: string;
        email: string;
        profileImage: string | null;
    };
    title: string;
    content: string;
    recordType: RecordType;
    medias: { mediaId: number; mediaUrl: string }[];
    tagNames: string[];
    createdAt: string;
}
