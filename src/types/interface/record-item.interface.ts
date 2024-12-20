export default interface RecordItem {
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
    createdAt: string;
    
}
