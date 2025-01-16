import { RecordType } from "@/apis/request/record/record.request.dto";
export default interface RecordListItem {

    recordId: number;
    user: {
        nickname: string;
        email: string;
        profileImage: string | null;
    };
    title: string;
    content: string;
    medias: { mediaId: number; mediaUrl: string }[];
    tagNames: string[];
    recordType: RecordType;
    createdAt: Date;
    likeCount: number;
    commentCount: number;
    saveCount: number;
    recordType: RecordType;
}
