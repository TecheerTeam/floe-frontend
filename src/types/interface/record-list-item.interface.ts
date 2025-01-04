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
    createdAt: Date;
    likeCount: number;
    commentCount: number;
    saveCount: number;
}
